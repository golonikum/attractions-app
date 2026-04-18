import { List } from 'react-window';

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
  return (
    <Table columns={SEARCH_ATTRACTIONS_TABLE_COLUMNS}>
      <List
        rowComponent={SearchAttractionTableRow}
        rowCount={attractions.length}
        rowHeight={112}
        rowProps={{ onLocate, attractions }}
      />
    </Table>
  );
}
