'use client';

import { ChangeEvent, useRef, useState } from 'react';
import { isAxiosError } from 'axios';
import { DatabaseBackup, Download, Loader2, Upload } from 'lucide-react';
import { toast } from 'sonner';

import { useData } from '@/contexts/DataContext';
import { Backup, ImportMode, ImportStats, parseBackup } from '@/lib/backup/format';
import { exportBackup, importBackup } from '@/services/backupService';

import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

const MODE_LABELS: Record<ImportMode, { title: string; description: string }> = {
  merge: {
    title: 'Добавить и обновить',
    description: 'Записи из файла обновят существующие с тем же id, новые добавятся, остальное не изменится',
  },
  replace: {
    title: 'Заменить всё',
    description: 'Все текущие города и объекты будут удалены и загружены из файла',
  },
};

const formatDate = (value: string) => {
  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? value : date.toLocaleString('ru-RU');
};

const formatStats = ({ groups, attractions, skippedAttractions, duplicates }: ImportStats) =>
  [
    `Города: +${groups.created}, обновлено ${groups.updated}`,
    `объекты: +${attractions.created}, обновлено ${attractions.updated}`,
    skippedAttractions && `пропущено объектов без города: ${skippedAttractions}`,
    duplicates && `повторов в файле: ${duplicates}`,
  ]
    .filter(Boolean)
    .join('; ');

const downloadJson = (data: unknown, fileName: string) => {
  const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
  const link = document.createElement('a');

  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  // Revoke после клика: Safari начинает скачивание асинхронно
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

/** Резервная копия всех городов и объектов: скачать файл и восстановить из него */
export function BackupDialog() {
  const { groups, attractions, reload } = useData();
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [file, setFile] = useState<{ name: string; backup: Backup } | null>(null);
  const [fileError, setFileError] = useState('');
  const [mode, setMode] = useState<ImportMode>('merge');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetImport = () => {
    setFile(null);
    setFileError('');
    setMode('merge');

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      resetImport();
    }

    setIsOpen(open);
  };

  const handleExport = async () => {
    setIsExporting(true);

    try {
      const { data } = await exportBackup();
      downloadJson(data, `attractions-backup-${data.exportedAt.slice(0, 10)}.json`);
      toast.success(`Скачана копия: городов ${data.groups.length}, объектов ${data.attractions.length}`);
    } catch (error) {
      toast.error('Не удалось сформировать резервную копию');
    } finally {
      setIsExporting(false);
    }
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0];
    setFile(null);
    setFileError('');

    if (!selected) {
      return;
    }

    try {
      setFile({ name: selected.name, backup: parseBackup(JSON.parse(await selected.text())) });
    } catch (error) {
      setFileError(error instanceof SyntaxError ? 'Файл не является JSON' : (error as Error).message);
    }
  };

  const runImport = async () => {
    if (!file) {
      return;
    }

    setIsImporting(true);

    try {
      const { data } = await importBackup(file.backup, mode);
      await reload({ groups: true, attractions: true });
      toast.success(`Импорт завершён. ${formatStats(data.stats)}`);
      handleOpenChange(false);
    } catch (error) {
      toast.error((isAxiosError(error) && error.response?.data?.error) || 'Не удалось импортировать данные');
    } finally {
      setIsImporting(false);
    }
  };

  const handleImportClick = () => (mode === 'replace' ? setIsConfirmOpen(true) : runImport());

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          <Button variant="outline" size="icon" title="Резервная копия" className="cursor-pointer">
            <DatabaseBackup className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Резервная копия</DialogTitle>
            <DialogDescription>
              Все города и объекты в одном файле — чтобы восстановить данные на этом или другом сервере
            </DialogDescription>
          </DialogHeader>

          <section className="space-y-2">
            <h4 className="font-semibold">Экспорт</h4>
            <p className="text-sm text-muted-foreground">
              Городов: {groups.length}, объектов: {attractions.length}
            </p>
            <Button type="button" onClick={handleExport} disabled={isExporting} className="w-full cursor-pointer">
              {isExporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
              Скачать резервную копию
            </Button>
          </section>

          <section className="space-y-3 border-t pt-4">
            <h4 className="font-semibold">Импорт</h4>
            <div className="space-y-2">
              <Label htmlFor="backup-file">Файл резервной копии (.json)</Label>
              <input
                id="backup-file"
                ref={fileInputRef}
                type="file"
                accept=".json,application/json"
                onChange={handleFileChange}
                className="block w-full min-w-0 text-sm file:mr-3 file:cursor-pointer file:rounded-md file:border file:bg-background file:px-3 file:py-2"
              />
              {fileError && (
                <p role="alert" className="text-sm text-destructive">
                  {fileError}
                </p>
              )}
              {file && (
                <p className="text-sm text-muted-foreground" data-testid="backup-file-summary">
                  Копия от {formatDate(file.backup.exportedAt)}: городов {file.backup.groups.length}, объектов{' '}
                  {file.backup.attractions.length}
                </p>
              )}
            </div>

            <fieldset className="space-y-2" disabled={!file}>
              <legend className="sr-only">Режим импорта</legend>
              {(Object.keys(MODE_LABELS) as ImportMode[]).map((value) => (
                <label key={value} className="flex cursor-pointer items-start gap-2 text-sm">
                  <input
                    type="radio"
                    name="import-mode"
                    value={value}
                    checked={mode === value}
                    onChange={() => setMode(value)}
                    className="mt-1"
                  />
                  <span>
                    <span className="font-medium">{MODE_LABELS[value].title}</span>
                    <span className="block text-muted-foreground">{MODE_LABELS[value].description}</span>
                  </span>
                </label>
              ))}
            </fieldset>

            <Button
              type="button"
              variant={mode === 'replace' ? 'destructive' : 'default'}
              onClick={handleImportClick}
              disabled={!file || isImporting}
              className="w-full cursor-pointer"
            >
              {isImporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
              Импортировать
            </Button>
          </section>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={() => {
          setIsConfirmOpen(false);
          runImport();
        }}
        title="Заменить все данные?"
        description={`Текущие города (${groups.length}) и объекты (${attractions.length}) будут удалены и заменены данными из файла. Отменить это нельзя — сначала скачайте резервную копию текущих данных.`}
        confirmText="Заменить"
        cancelText="Отмена"
        variant="destructive"
      />
    </>
  );
}
