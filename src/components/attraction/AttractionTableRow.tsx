import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Link from 'next/link';

import { cn } from '@/lib/utils';
import { Attraction, CreateAttractionRequest } from '@/types/attraction';

import { OpenInYandexMapButton, RemoveButton, ShowOnMapButton } from '../ui/buttons';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { TableCell, TableRow } from '../ui/table';
import { Tag } from '../ui/Tag';

import { AttractionImage } from './AttractionImage';
import { NewAttractionDialog } from './NewAttractionDialog';

export const ATTRACTIONS_TABLE_COLUMNS = [
  { label: '', width: 50 },
  { label: 'Изображение', width: 120 },
  { label: 'Название', width: 200 },
  { label: 'Описание' },
  { label: 'Действия', width: 220 },
];

export type AttractionTableRowProps = {
  attraction: Attraction;
  onDelete?: (id: string) => void;
  onUpdate?: (id: string) => (updateData: CreateAttractionRequest) => Promise<void>;
  onLocate: (attraction: Attraction) => void;
  hasDnd?: boolean;
};

export const AttractionTableRow = ({
  attraction,
  onDelete,
  onUpdate,
  onLocate,
  hasDnd = true,
}: AttractionTableRowProps) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: attraction.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.8 : 1,
    zIndex: isDragging ? 1 : 0,
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsDeleteDialogOpen(true);
  };

  const onLocateAttractionClick = () => {
    onLocate(attraction);
  };

  return (
    <TableRow
      className={cn(attraction.isVisited && 'bg-green-50')}
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
    >
      {hasDnd && (
        <TableCell column={ATTRACTIONS_TABLE_COLUMNS[0]} className="cursor-move">
          ☰
        </TableCell>
      )}
      <TableCell column={ATTRACTIONS_TABLE_COLUMNS[1]}>
        <Link href={`/attractions/${attraction.id}`}>
          <div className="relative h-24 w-24 flex-shrink-0">
            <AttractionImage attraction={attraction} className="rounded-md" showFavorite />
          </div>
        </Link>
      </TableCell>
      <TableCell column={ATTRACTIONS_TABLE_COLUMNS[2]}>
        <Link href={`/attractions/${attraction.id}`}>
          <div className="text-sm font-medium">{attraction.name}</div>
          {attraction.category && <Tag text={attraction.category} />}
        </Link>
      </TableCell>
      <TableCell column={ATTRACTIONS_TABLE_COLUMNS[3]}>
        <Link href={`/attractions/${attraction.id}`}>
          <div className="text-sm line-clamp-4">{attraction.description || 'Нет описания'}</div>
        </Link>
      </TableCell>
      <TableCell column={ATTRACTIONS_TABLE_COLUMNS[4]}>
        <div className="flex justify-end space-x-1">
          <ShowOnMapButton onClick={onLocateAttractionClick} view="icon" />
          <OpenInYandexMapButton attraction={attraction} view="icon" />
          {!!onUpdate && (
            <NewAttractionDialog
              isOpen={isEditDialogOpen}
              setIsOpen={setIsEditDialogOpen}
              handleSubmit={onUpdate(attraction.id)}
              isSubmitting={isSubmitting}
              setIsSubmitting={setIsSubmitting}
              attraction={attraction}
            />
          )}
          {!!onDelete && <RemoveButton onClick={handleDeleteClick} />}
        </div>
        {!!onDelete && (
          <ConfirmDialog
            isOpen={isDeleteDialogOpen}
            onClose={() => setIsDeleteDialogOpen(false)}
            onConfirm={() => onDelete(attraction.id)}
            title="Удалить объект?"
            description={`Вы уверены, что хотите удалить "${attraction.name}"?`}
            confirmText="Удалить"
            cancelText="Отмена"
            variant="destructive"
          />
        )}
      </TableCell>
    </TableRow>
  );
};
