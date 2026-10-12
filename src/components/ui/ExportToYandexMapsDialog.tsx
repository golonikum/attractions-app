'use client';

import { useState } from 'react';
import { Download, ExternalLink, Map as MapIcon } from 'lucide-react';
import { toast } from 'sonner';

import {
  buildConstructorGeoJson,
  downloadGeoJson,
  ExportLimitError,
  getExportFileName,
} from '@/lib/export/yandexConstructor';
import { Attraction } from '@/types/attraction';
import { Group } from '@/types/group';

import { Button } from './button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './dialog';

const CONSTRUCTOR_URL = 'https://yandex.ru/map-constructor/';

interface ExportToYandexMapsDialogProps {
  /** Уже отфильтрованные объекты экрана */
  attractions: Attraction[];
  groups: Group[];
  /** Название карты в Конструкторе и часть имени файла, например «Поиск: монастырь» */
  mapName: string;
}

/** Экспорт объектов в файл для Конструктора карт Яндекса — закладки Яндекс Карт импорт не поддерживают */
export function ExportToYandexMapsDialog({ attractions, groups, mapName }: ExportToYandexMapsDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const count = attractions.length;

  const handleDownload = () => {
    try {
      downloadGeoJson(buildConstructorGeoJson({ attractions, groups, name: mapName }), getExportFileName(mapName));
      toast.success('Файл скачан — импортируйте его в Конструктор карт');
    } catch (error) {
      toast.error(error instanceof ExportLimitError ? error.message : 'Не удалось сформировать файл');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="cursor-pointer"
          title="Экспорт в Яндекс Карты"
          disabled={!count}
          type="button"
        >
          <MapIcon className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Экспорт в Яндекс Карты</DialogTitle>
          <DialogDescription>
            Будет экспортировано объектов: <span className="font-bold">{count}</span> ({mapName})
          </DialogDescription>
        </DialogHeader>

        <ol className="list-decimal space-y-2 pl-5 text-sm">
          <li>Скачайте файл с объектами.</li>
          <li>
            Откройте{' '}
            <a
              href={CONSTRUCTOR_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-blue-600 underline"
            >
              Конструктор карт
              <ExternalLink className="h-3 w-3" />
            </a>{' '}
            и создайте новую карту.
          </li>
          <li>Нажмите «Импорт» и выберите скачанный файл — импорт работает только в пустую карту.</li>
          <li>Сохраните карту: её можно открыть по ссылке в Яндекс Картах, в том числе в приложении.</li>
        </ol>

        <p className="text-sm text-muted-foreground">
          Сразу в закладки Яндекс Карт добавить нельзя: у закладок нет импорта, поэтому точки переносятся отдельной
          картой. Цвет метки зависит от категории.
        </p>

        <Button type="button" onClick={handleDownload} className="w-full cursor-pointer">
          <Download className="mr-2 h-4 w-4" />
          Скачать файл
        </Button>
      </DialogContent>
    </Dialog>
  );
}
