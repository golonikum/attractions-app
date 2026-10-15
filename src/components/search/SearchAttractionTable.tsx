import { List, useDynamicRowHeight } from 'react-window';

import { Attraction } from '@/types/attraction';

import { Table } from '../ui/table';

import {
  SEARCH_ATTRACTIONS_TABLE_COLUMNS,
  SearchAttractionTableRow,
  SearchAttractionTableRowProps,
} from './SearchAttractionTableRow';

type SearchAttractionTableProps = Omit<SearchAttractionTableRowProps, 'attraction'> & {
  attractions: Attraction[];
};

export function SearchAttractionTable({ attractions, onLocate }: SearchAttractionTableProps) {
  // Высота строки зависит от длины названия и описания — меряем строки, а не задаём константой.
  // key сбрасывает кэш высот, когда под теми же индексами оказываются другие объекты (поиск)
  const rowHeight = useDynamicRowHeight({ defaultRowHeight: 112, key: attractions.map(({ id }) => id).join() });

  return (
    <Table columns={SEARCH_ATTRACTIONS_TABLE_COLUMNS}>
      <List
        rowComponent={SearchAttractionTableRow}
        rowCount={attractions.length}
        rowHeight={rowHeight}
        rowProps={{ onLocate, attractions }}
      />
    </Table>
  );
}
