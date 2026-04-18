import { useRouter } from 'next/navigation';

import { useData } from '@/contexts/DataContext';
import { cn } from '@/lib/utils';
import { NoteWithAttractionIdType } from '@/types/attraction';

import { AttractionImage } from '../attraction/AttractionImage';
import { TableCell, TableRow } from '../ui/table';
import { Tag } from '../ui/Tag';

export const NOTES_TABLE_COLUMNS = [
  { label: 'Изображение', width: 120 },
  { label: 'Название', width: 300 },
  { label: 'Дата', width: 150 },
  { label: 'Заметка' },
];

export type NotesTableRowProps = {
  note: NoteWithAttractionIdType;
};

export const NotesTableRow = ({ note }: NotesTableRowProps) => {
  const router = useRouter();
  const { attractions, groups } = useData();

  const handleClick = () => {
    router.push(`/attractions/${note.attractionId}`);
  };

  const attraction = attractions.find((item) => item.id === note.attractionId);

  if (!attraction) {
    return null;
  }

  const group = groups.find((item) => item.id === attraction.groupId);

  return (
    <TableRow className={cn(attraction.isVisited && 'bg-green-50')} onClick={handleClick}>
      <TableCell column={NOTES_TABLE_COLUMNS[0]}>
        <div className="relative h-24 w-24 flex-shrink-0">
          <AttractionImage attraction={attraction} className="rounded-md" showFavorite />
        </div>
      </TableCell>
      <TableCell column={NOTES_TABLE_COLUMNS[1]} className="flex flex-col items-start justify-center">
        <div className="text-sm font-medium">
          {attraction.name} ({group?.name})
        </div>
        {attraction.category && <Tag text={attraction.category} />}
      </TableCell>
      <TableCell column={NOTES_TABLE_COLUMNS[2]}>
        <div className="text-sm line-clamp-4">{note.date}</div>
      </TableCell>
      <TableCell column={NOTES_TABLE_COLUMNS[3]}>
        <div className="text-sm line-clamp-4">{note.note}</div>
      </TableCell>
    </TableRow>
  );
};
