import { NewGroupDialog } from "./NewGroupDialog";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { RemoveButton, ShowOnMapButton } from "../ui/buttons";
import { ConfirmDialog } from "../ui/ConfirmDialog";
import { Tag } from "../ui/Tag";
import { CreateGroupRequest, Group } from "@/types/group";
import { GroupTableCellDescription } from "./GroupTableCellDescription";
import { Attraction } from "@/types/attraction";

export type GroupTableRowProps = {
  group: Group;
  onDelete: (id: string) => void;
  onUpdate: (id: string) => (updateData: CreateGroupRequest) => Promise<void>;
  onLocate: (group: Group) => void;
  attractionsMap: Record<string, Attraction[]>;
};

export const GroupTableRow = ({
  group,
  onDelete,
  onUpdate,
  onLocate,
  attractionsMap,
}: GroupTableRowProps) => {
  const router = useRouter();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsDeleteDialogOpen(true);
  };

  const handleGroupClick = (group: Group) => () => {
    router.push(`/groups/${group.id}`);
  };

  const onLocateClick = () => {
    onLocate(group);
  };

  return (
    <tr>
      <td
        className="px-4 py-2  cursor-pointer"
        onClick={handleGroupClick(group)}
      >
        <div className="text-sm font-medium text-gray-900">
          {group.name} ({attractionsMap[group.id]?.length || 0})
        </div>
      </td>
      <td
        className="px-4 py-2  cursor-pointer"
        onClick={handleGroupClick(group)}
      >
        {group.tag && <Tag text={group.tag} />}
      </td>
      <td
        className="px-4 py-2  cursor-pointer"
        onClick={handleGroupClick(group)}
      >
        <div className="text-sm text-gray-900 line-clamp-4">
          <GroupTableCellDescription description={group.description} />
        </div>
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
