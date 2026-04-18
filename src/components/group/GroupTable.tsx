import { List } from 'react-window';

import { Table } from '../ui/table';

import { GROUP_TABLE_COLUMNS, GroupTableRow, GroupTableRowProps } from './GroupTableRow';

type GroupTableProps = GroupTableRowProps;

export function GroupTable(props: GroupTableProps) {
  return (
    <Table columns={GROUP_TABLE_COLUMNS}>
      <List rowComponent={GroupTableRow} rowCount={props.groups.length} rowHeight={52} rowProps={props} />
    </Table>
  );
}
