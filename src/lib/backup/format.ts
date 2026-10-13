import { z } from 'zod';

/**
 * Формат файла резервной копии: все города (группы) и объекты пользователя.
 * Только относительные импорты — файл используется и в браузере, и на сервере, и в проверочных скриптах.
 */

export const BACKUP_FORMAT = 'attractions-app-backup';
export const BACKUP_VERSION = 1;

const coordinatesSchema = z.tuple([z.number(), z.number()]);
// Необязательные поля Prisma отдаёт как null — принимаем и null, и отсутствие поля
const optionalString = z.string().nullable().optional();

export const backupGroupSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().nullable().optional(),
  tag: optionalString,
  /** [latitude, longitude], как в БД */
  coordinates: coordinatesSchema,
  zoom: z.number().int(),
  createdAt: optionalString,
});

export const backupAttractionSchema = z.object({
  id: z.string().min(1),
  groupId: z.string().min(1),
  name: z.string().min(1),
  category: optionalString,
  imageUrl: optionalString,
  yaMapUrl: optionalString,
  description: optionalString,
  isVisited: z.boolean().nullable().optional(),
  isFavorite: z.boolean().nullable().optional(),
  /** [latitude, longitude], как в БД */
  coordinates: coordinatesSchema,
  order: z.number().int().nullable().optional(),
  notes: z
    .array(z.object({ date: z.string(), note: z.string() }))
    .nullable()
    .optional(),
  createdAt: optionalString,
});

export const backupSchema = z.object({
  format: z.literal(BACKUP_FORMAT),
  version: z.literal(BACKUP_VERSION),
  exportedAt: z.string(),
  groups: z.array(backupGroupSchema),
  attractions: z.array(backupAttractionSchema),
});

export type BackupGroup = z.infer<typeof backupGroupSchema>;
export type BackupAttraction = z.infer<typeof backupAttractionSchema>;
export type Backup = z.infer<typeof backupSchema>;

/** merge — обновить записи с теми же id и добавить новые; replace — удалить всё текущее и загрузить файл */
export type ImportMode = 'merge' | 'replace';
export const IMPORT_MODES: ImportMode[] = ['merge', 'replace'];

export interface ImportStats {
  groups: { created: number; updated: number };
  attractions: { created: number; updated: number };
  /** Объекты, чей город нет ни в файле, ни в аккаунте */
  skippedAttractions: number;
  /** Записи с повторяющимся id внутри файла (берётся первая) */
  duplicates: number;
}

/** Разобрать и проверить содержимое файла; ошибка — с понятным текстом */
export const parseBackup = (value: unknown): Backup => {
  const result = backupSchema.safeParse(value);

  if (!result.success) {
    const [issue] = result.error.issues;
    const path = issue.path.join('.');

    if (path === 'format' || path === 'version') {
      throw new Error('Это не файл резервной копии этого приложения или он из неподдерживаемой версии');
    }

    throw new Error(`Файл повреждён: ${path || 'корень'} — ${issue.message}`);
  }

  return result.data;
};
