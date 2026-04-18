import { RowComponentProps } from 'react-window';
import Link from 'next/link';

import { useData } from '@/contexts/DataContext';
import { cn } from '@/lib/utils';
import { Attraction } from '@/types/attraction';

import { AttractionImage } from '../attraction/AttractionImage';
import { OpenInYandexMapButton, ShowOnMapButton } from '../ui/buttons';
import { TableCell, TableRow } from '../ui/table';
import { Tag } from '../ui/Tag';

export const SEARCH_ATTRACTIONS_TABLE_COLUMNS = [
  { label: 'Изображение', width: 120 },
  { label: 'Название', width: 200 },
  { label: 'Город', width: 200 },
  { label: 'Описание' },
  { label: 'Действия', width: 120 },
];

export type SearchAttractionTableRowProps = {
  attractions: Attraction[];
  onLocate: (attraction: Attraction) => void;
};

export const SearchAttractionTableRow = ({
  attractions,
  onLocate,
  index,
  style,
}: RowComponentProps<SearchAttractionTableRowProps>) => {
  const attraction = attractions[index];
  const { groups } = useData();

  const group = groups.find((g) => g.id === attraction.groupId);

  const onLocateAttractionClick = () => {
    onLocate(attraction);
  };

  return (
    <TableRow className={cn(attraction.isVisited && 'bg-green-50')} style={style}>
      <TableCell column={SEARCH_ATTRACTIONS_TABLE_COLUMNS[0]}>
        <Link href={`/attractions/${attraction.id}`}>
          <div className="relative h-24 w-24 flex-shrink-0">
            <AttractionImage attraction={attraction} className="rounded-md" showFavorite />
          </div>
        </Link>
      </TableCell>
      <TableCell column={SEARCH_ATTRACTIONS_TABLE_COLUMNS[1]}>
        <Link href={`/attractions/${attraction.id}`}>
          <div className="text-sm font-medium">{attraction.name}</div>
          {attraction.category && <Tag text={attraction.category} />}
        </Link>
      </TableCell>
      <TableCell column={SEARCH_ATTRACTIONS_TABLE_COLUMNS[2]}>
        <Link href={`/attractions/${attraction.id}`}>
          <div className="text-sm font-medium">{group?.name}</div>
        </Link>
      </TableCell>
      <TableCell column={SEARCH_ATTRACTIONS_TABLE_COLUMNS[3]}>
        <Link href={`/attractions/${attraction.id}`}>
          <div className="text-sm line-clamp-4">{attraction.description || 'Нет описания'}</div>
        </Link>
      </TableCell>
      <TableCell column={SEARCH_ATTRACTIONS_TABLE_COLUMNS[4]}>
        <div className="flex justify-end space-x-1">
          <ShowOnMapButton onClick={onLocateAttractionClick} view="icon" />
          <OpenInYandexMapButton attraction={attraction} view="icon" />
        </div>
      </TableCell>
    </TableRow>
  );
};
