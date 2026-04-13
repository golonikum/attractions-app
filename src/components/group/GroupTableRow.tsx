import { useState } from 'react';
import Link from 'next/link';

import { useData } from '@/contexts/DataContext';
import { CreateGroupRequest, Group } from '@/types/group';

import { RemoveButton, ShowOnMapButton } from '../ui/buttons';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { Tag } from '../ui/Tag';

import { GroupTableCellDescription } from './GroupTableCellDescription';
import { NewGroupDialog } from './NewGroupDialog';

export type GroupTableRowProps = {
  group: Group;
  onDelete: (id: string) => void;
  onUpdate: (id: string) => (updateData: CreateGroupRequest) => Promise<void>;
  onLocate: (group: Group) => void;
};

export const GroupTableRow = ({ group, onDelete, onUpdate, onLocate }: GroupTableRowProps) => {
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
    <tr>
      <td className="px-4 py-2  cursor-pointer">
        <Link href={`/groups/${group.id}`}>
          <div className="text-sm font-medium">
            {group.name} <span className="font-normal">({attractionsMap[group.id]?.length || 0})</span>
          </div>
        </Link>
      </td>
      <td className="px-4 py-2  cursor-pointer">
        <Link href={`/groups/${group.id}`}>{group.tag && <Tag text={group.tag} />}</Link>
      </td>
      <td className="px-4 py-2  cursor-pointer">
        <Link href={`/groups/${group.id}`}>
          <div className="text-sm line-clamp-4">
            <GroupTableCellDescription description={group.description} />
          </div>
        </Link>
      </td>
      <td className="px-4 py-2  whitespace-nowrap text-sm font-medium">
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
      </td>
    </tr>
  );
};
