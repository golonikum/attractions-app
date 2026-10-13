import type { PrismaClient } from '@prisma/client';
import { createHash } from 'node:crypto';

import {
  Backup,
  BACKUP_FORMAT,
  BACKUP_VERSION,
  BackupAttraction,
  BackupGroup,
  ImportMode,
  ImportStats,
} from './format';
import { planImport } from './planImport';

/** Серверная часть резервного копирования. prisma передаётся параметром, чтобы код можно было проверить на любой БД */

const toDate = (value?: string | null) => {
  const date = value ? new Date(value) : undefined;

  return date && !Number.isNaN(date.getTime()) ? date : undefined;
};

export const exportBackup = async (prisma: PrismaClient, userId: string): Promise<Backup> => {
  const [groups, attractions] = await Promise.all([
    prisma.group.findMany({ where: { userId }, orderBy: { createdAt: 'asc' } }),
    prisma.attraction.findMany({ where: { userId }, orderBy: [{ groupId: 'asc' }, { order: 'asc' }] }),
  ]);

  return {
    format: BACKUP_FORMAT,
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    groups: groups.map(({ id, name, description, tag, coordinates, zoom, createdAt }) => ({
      id,
      name,
      description,
      tag,
      coordinates: coordinates as [number, number],
      zoom,
      createdAt: createdAt.toISOString(),
    })),
    attractions: attractions.map(
      ({ userId: _userId, updatedAt: _updatedAt, coordinates, notes, createdAt, ...rest }) => ({
        ...rest,
        coordinates: coordinates as [number, number],
        notes: (notes as BackupAttraction['notes']) ?? [],
        createdAt: createdAt.toISOString(),
      }),
    ),
  };
};

const groupData = ({ name, description, tag, coordinates, zoom }: BackupGroup) => ({
  name,
  description: description ?? '',
  tag: tag ?? null,
  coordinates,
  zoom,
});

const attractionData = ({
  groupId,
  name,
  category,
  imageUrl,
  yaMapUrl,
  description,
  isVisited,
  isFavorite,
  coordinates,
  order,
  notes,
}: BackupAttraction) => ({
  groupId,
  name,
  category: category ?? null,
  imageUrl: imageUrl ?? null,
  yaMapUrl: yaMapUrl ?? null,
  description: description ?? null,
  isVisited: isVisited ?? null,
  isFavorite: isFavorite ?? null,
  coordinates,
  order: order ?? null,
  notes: notes ?? [],
});

export const importBackup = async (
  prisma: PrismaClient,
  userId: string,
  backup: Backup,
  mode: ImportMode,
): Promise<ImportStats> => {
  const groupIds = backup.groups.map(({ id }) => id);
  const attractionIds = backup.attractions.map(({ id }) => id);

  const [ownGroups, ownAttractions, foreignGroups, foreignAttractions] = await Promise.all([
    prisma.group.findMany({ where: { userId }, select: { id: true } }),
    prisma.attraction.findMany({ where: { userId }, select: { id: true } }),
    prisma.group.findMany({ where: { id: { in: groupIds }, NOT: { userId } }, select: { id: true } }),
    prisma.attraction.findMany({ where: { id: { in: attractionIds }, NOT: { userId } }, select: { id: true } }),
  ]);

  const plan = planImport(backup, {
    mode,
    own: {
      groupIds: new Set(ownGroups.map(({ id }) => id)),
      attractionIds: new Set(ownAttractions.map(({ id }) => id)),
    },
    takenByOthers: {
      groupIds: new Set(foreignGroups.map(({ id }) => id)),
      attractionIds: new Set(foreignAttractions.map(({ id }) => id)),
    },
    remapId: (originalId) => createHash('sha256').update(`${userId}:${originalId}`).digest('hex').slice(0, 25),
  });

  // Всё в одной транзакции: либо файл применился целиком, либо база не изменилась
  await prisma.$transaction([
    ...(plan.deleteAll
      ? // Объекты удаляются каскадом вместе с городами, но удаляем явно — на случай «осиротевших»
        [prisma.attraction.deleteMany({ where: { userId } }), prisma.group.deleteMany({ where: { userId } })]
      : []),
    prisma.group.createMany({
      data: plan.createGroups.map((group) => ({
        ...groupData(group),
        id: group.id,
        userId,
        createdAt: toDate(group.createdAt),
      })),
    }),
    ...plan.updateGroups.map((group) => prisma.group.update({ where: { id: group.id }, data: groupData(group) })),
    prisma.attraction.createMany({
      data: plan.createAttractions.map((attraction) => ({
        ...attractionData(attraction),
        id: attraction.id,
        userId,
        createdAt: toDate(attraction.createdAt),
      })),
    }),
    ...plan.updateAttractions.map((attraction) =>
      prisma.attraction.update({ where: { id: attraction.id }, data: attractionData(attraction) }),
    ),
  ]);

  return plan.stats;
};
