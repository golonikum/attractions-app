import { useState } from 'react';
import { RowComponentProps } from 'react-window';
import Link from 'next/link';

import { useData } from '@/contexts/DataContext';
import { useIsMobile } from '@/hooks/useIsMobile';
import { locateItemOnMainMapHref } from '@/lib/locateItemOnMainMapHref';
import { CreateGroupRequest, Group } from '@/types/group';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

import { RemoveButton, ShowOnMapButton } from '../ui/buttons';
import { Tag } from '../ui/Tag';

import { NewGroupDialog } from './NewGroupDialog';

interface GroupCardProps {
  groups: Group[];
  onDelete: (id: string) => void;
  onUpdate: (id: string) => (formData: CreateGroupRequest) => Promise<void>;
}

export function GroupCard({ groups, onDelete, onUpdate, style, index }: RowComponentProps<GroupCardProps>) {
  const group = groups[index];
  const { isWideScreen } = useIsMobile();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { attractionsMap } = useData();

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsDeleteDialogOpen(true);
  };

  return (
    <div style={style}>
      <Card className="overflow-hidden flex flex-col mb-4">
        <CardHeader>
          <div className="flex justify-between items-start space-x-1">
            <Link className="flex-1 max-w-[calc(100%_-_80px)]" href={`/groups/${group.id}`}>
              <div className="flex-1 flex flex-col gap-2">
                <CardTitle className="text-lg/5 truncate">
                  {group.name}{' '}
                  {!!attractionsMap[group.id]?.length && (
                    <span className="font-normal text-gray-400">({attractionsMap[group.id].length})</span>
                  )}
                </CardTitle>
                {group.tag && <Tag text={group.tag} className="truncate" />}
              </div>
            </Link>
            <NewGroupDialog
              groupData={group}
              handleSubmit={onUpdate(group.id)}
              isOpen={isEditDialogOpen}
              setIsOpen={setIsEditDialogOpen}
              isSubmitting={isSubmitting}
              setIsSubmitting={setIsSubmitting}
            />
            <RemoveButton onClick={handleDeleteClick} />

            <ConfirmDialog
              isOpen={isDeleteDialogOpen}
              onClose={() => setIsDeleteDialogOpen(false)}
              onConfirm={() => onDelete(group.id)}
              title="Удалить группу?"
              description="Вы уверены, что хотите удалить эту группу? Все связанные объекта также будут удалены."
              confirmText="Удалить"
              cancelText="Отмена"
              variant="destructive"
            />
          </div>
        </CardHeader>

        <CardContent className="cursor-pointer flex flex-col gap-4 justify-between flex-1">
          <Link className="flex-1" href={`/groups/${group.id}`}>
            <CardDescription className="truncate">{group.description}</CardDescription>
          </Link>
          {!isWideScreen && <ShowOnMapButton href={locateItemOnMainMapHref(group)} />}
        </CardContent>
      </Card>
    </div>
  );
}
