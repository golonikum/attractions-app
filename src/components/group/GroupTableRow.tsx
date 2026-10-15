import { useState } from 'react';
import { RowComponentProps } from 'react-window';
import Link from 'next/link';

import { useData } from '@/contexts/DataContext';
import { CreateGroupRequest, Group } from '@/types/group';

import { DELETE_CONFIRM_TEXTS, RemoveWithConfirmButton, ShowOnMapButton } from '../ui/buttons';
import { TableCell, TableRow } from '../ui/table';
import { Tag } from '../ui/Tag';

import { GroupTableCellDescription } from './GroupTableCellDescription';
import { NewGroupDialog } from './NewGroupDialog';

export const GROUP_TABLE_COLUMNS = [
  { label: 'Название', width: 180 },
  { label: 'Регион', width: 200 },
  { label: 'Описание' },
  { label: 'Действия', width: 160 },
];

export type GroupTableRowProps = {
  groups: Group[];
  onDelete: (id: string) => void;
  onUpdate: (id: string) => (updateData: CreateGroupRequest) => Promise<void>;
  onLocate: (group: Group) => void;
};

export const GroupTableRow = ({
  onDelete,
  onUpdate,
  onLocate,
  index,
  groups,
  style,
  ariaAttributes,
}: RowComponentProps<GroupTableRowProps>) => {
  const group = groups[index];
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { attractionsMap } = useData();

  const onLocateClick = () => {
    onLocate(group);
  };

  return (
    <TableRow style={style} {...ariaAttributes}>
      <TableCell column={GROUP_TABLE_COLUMNS[0]}>
        <Link href={`/groups/${group.id}`}>
          <div className="text-sm font-medium">
            {group.name} <span className="font-normal">({attractionsMap[group.id]?.length || 0})</span>
          </div>
        </Link>
      </TableCell>
      <TableCell column={GROUP_TABLE_COLUMNS[1]}>
        <Link href={`/groups/${group.id}`}>{group.tag && <Tag text={group.tag} />}</Link>
      </TableCell>
      <TableCell column={GROUP_TABLE_COLUMNS[2]}>
        <Link href={`/groups/${group.id}`}>
          <div className="text-sm line-clamp-4">
            <GroupTableCellDescription description={group.description} />
          </div>
        </Link>
      </TableCell>
      <TableCell column={GROUP_TABLE_COLUMNS[3]} className="whitespace-nowrap">
        <div className="flex space-x-1">
          <ShowOnMapButton onClick={onLocateClick} view="icon" />
          <NewGroupDialog
            isOpen={isEditDialogOpen}
            setIsOpen={setIsEditDialogOpen}
            handleSubmit={onUpdate(group.id)}
            isSubmitting={isSubmitting}
            setIsSubmitting={setIsSubmitting}
            groupData={group}
          />
          <RemoveWithConfirmButton {...DELETE_CONFIRM_TEXTS.group(group.name)} onConfirm={() => onDelete(group.id)} />
        </div>
      </TableCell>
    </TableRow>
  );
};
