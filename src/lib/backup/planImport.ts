import type { Backup, BackupAttraction, BackupGroup, ImportMode, ImportStats } from './format';

/**
 * Чистое планирование импорта, без БД: что создать, что обновить, какие id заменить.
 * id в БД глобальные (cuid): если id из файла уже занят записью другого пользователя
 * (например, восстанавливают копию в другой аккаунт на том же сервере), запись получает новый id,
 * а ссылки объектов на город переназначаются. Новый id детерминирован (remapId), поэтому повторный
 * импорт того же файла обновляет уже созданные записи, а не дублирует их.
 */

export interface ImportContext {
  mode: ImportMode;
  /** id городов и объектов текущего пользователя */
  own: { groupIds: Set<string>; attractionIds: Set<string> };
  /** id из файла, уже занятые записями других пользователей */
  takenByOthers: { groupIds: Set<string>; attractionIds: Set<string> };
  /** Детерминированный id взамен занятого: один и тот же для одного пользователя и исходного id */
  remapId: (originalId: string) => string;
}

export interface ImportPlan {
  /** Удалить все города и объекты пользователя перед загрузкой (режим replace) */
  deleteAll: boolean;
  createGroups: BackupGroup[];
  updateGroups: BackupGroup[];
  createAttractions: BackupAttraction[];
  updateAttractions: BackupAttraction[];
  stats: ImportStats;
}

const uniqueById = <T extends { id: string }>(items: T[]) => {
  const seen = new Set<string>();
  const unique = items.filter(({ id }) => {
    if (seen.has(id)) {
      return false;
    }

    seen.add(id);

    return true;
  });

  return { unique, duplicates: items.length - unique.length };
};

export const planImport = (backup: Backup, { mode, own, takenByOthers, remapId }: ImportContext): ImportPlan => {
  const replace = mode === 'replace';
  const groups = uniqueById(backup.groups);
  const attractions = uniqueById(backup.attractions);

  // В режиме replace текущие записи будут удалены, поэтому все записи файла — новые
  const ownGroupIds = replace ? new Set<string>() : own.groupIds;
  const ownAttractionIds = replace ? new Set<string>() : own.attractionIds;

  const groupIdMap = new Map<string, string>();
  const createGroups: BackupGroup[] = [];
  const updateGroups: BackupGroup[] = [];

  groups.unique.forEach((group) => {
    const id = takenByOthers.groupIds.has(group.id) ? remapId(group.id) : group.id;
    groupIdMap.set(group.id, id);
    (ownGroupIds.has(id) ? updateGroups : createGroups).push({ ...group, id });
  });

  const createAttractions: BackupAttraction[] = [];
  const updateAttractions: BackupAttraction[] = [];
  let skippedAttractions = 0;

  attractions.unique.forEach((attraction) => {
    // Город — из файла (с учётом замены id) или уже существующий у пользователя (в режиме merge)
    const groupId =
      groupIdMap.get(attraction.groupId) ?? (ownGroupIds.has(attraction.groupId) ? attraction.groupId : undefined);

    if (!groupId) {
      skippedAttractions++;

      return;
    }

    const id = takenByOthers.attractionIds.has(attraction.id) ? remapId(attraction.id) : attraction.id;
    (ownAttractionIds.has(id) ? updateAttractions : createAttractions).push({ ...attraction, id, groupId });
  });

  return {
    deleteAll: replace,
    createGroups,
    updateGroups,
    createAttractions,
    updateAttractions,
    stats: {
      groups: { created: createGroups.length, updated: updateGroups.length },
      attractions: { created: createAttractions.length, updated: updateAttractions.length },
      skippedAttractions,
      duplicates: groups.duplicates + attractions.duplicates,
    },
  };
};
