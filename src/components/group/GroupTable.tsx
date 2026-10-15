import { List, useDynamicRowHeight } from 'react-window';

import { Table } from '../ui/table';

import { GROUP_TABLE_COLUMNS, GroupTableRow, GroupTableRowProps } from './GroupTableRow';

type GroupTableProps = GroupTableRowProps;

export function GroupTable(props: GroupTableProps) {
  // Высота строки зависит от длины названия и описания — меряем строки, а не задаём константой.
  // key сбрасывает кэш высот, когда под теми же индексами оказываются другие города (фильтры)
  const rowHeight = useDynamicRowHeight({ defaultRowHeight: 52, key: props.groups.map(({ id }) => id).join() });

  return (
    <Table columns={GROUP_TABLE_COLUMNS}>
      <List rowComponent={GroupTableRow} rowCount={props.groups.length} rowHeight={rowHeight} rowProps={props} />
    </Table>
  );
}
