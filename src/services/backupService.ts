import { Backup, ImportMode, ImportStats } from '@/lib/backup/format';

import { request } from './request';

const BACKUP_API_URL = '/backup';

export const exportBackup = async () => request.get<Backup>(BACKUP_API_URL);

export const importBackup = async (backup: Backup, mode: ImportMode) =>
  request.post<{ stats: ImportStats }>(BACKUP_API_URL, { backup, mode });
