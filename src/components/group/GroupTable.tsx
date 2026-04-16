import { List } from 'react-window';

import { Group } from '@/types/group';

import { TableHeaderCell } from '../ui/table';

import { GROUP_TABLE_COLUMNS, GroupTableRow, GroupTableRowProps } from './GroupTableRow';

type GroupTableProps = Omit<GroupTableRowProps, 'group'> & {
  groups: Group[];
};

export function GroupTable({ groups, onDelete, onUpdate, onLocate }: GroupTableProps) {
  return (
    <div className=" h-[calc(100%)] overflow-auto flex flex-col width-fit">
      <div className="bg-gray-50 h-8 flex sticky top-0 z-10">
        {GROUP_TABLE_COLUMNS.map((column) => (
          <TableHeaderCell column={column} key={column.label} />
        ))}
      </div>
      <div className="flex flex-1 flex-col">
        <List
          rowComponent={GroupTableRow}
          rowCount={groups.length}
          rowHeight={52}
          rowProps={{ onDelete, onLocate, onUpdate, groups }}
        />
      </div>
    </div>
  );
}
