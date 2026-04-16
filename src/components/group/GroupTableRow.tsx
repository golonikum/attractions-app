import { useState } from 'react';
import { RowComponentProps } from 'react-window';
import Link from 'next/link';

import { useData } from '@/contexts/DataContext';
import { CreateGroupRequest, Group } from '@/types/group';

import { RemoveButton, ShowOnMapButton } from '../ui/buttons';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { TableCell } from '../ui/table';
import { Tag } from '../ui/Tag';

import { GroupTableCellDescription } from './GroupTableCellDescription';
import { NewGroupDialog } from './NewGroupDialog';

export const GROUP_TABLE_COLUMNS = [
  { label: 'Название', width: 180 },
  { label: 'Регион', width: 200 },
  { label: 'Описание' },
  { label: 'Действия', width: 180 },
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
}: RowComponentProps<GroupTableRowProps>) => {
  const group = groups[index];
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { attractionsMap } = useData();

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsDeleteDialogOpen(true);
  };

  const onLocateClick = () => {
    onLocate(group);
  };

  return (
    <div className="flex border-b-1 border-gray-200" style={style}>
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
          <RemoveButton onClick={handleDeleteClick} />
        </div>
        <ConfirmDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
          onConfirm={() => onDelete(group.id)}
          title="Удалить объект?"
          description={`Вы уверены, что хотите удалить "${group.name}"?`}
          confirmText="Удалить"
          cancelText="Отмена"
          variant="destructive"
        />
      </TableCell>
    </div>
  );
};
