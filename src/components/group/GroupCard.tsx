import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { CreateGroupRequest, Group } from "@/types/group";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useState } from "react";
import { Tag } from "../ui/Tag";
import { RemoveButton, ShowOnMapButton } from "../ui/buttons";
import { NewGroupDialog } from "./NewGroupDialog";
import { useIsMobile } from "@/hooks/useIsMobile";
import { locateItemOnMainMap } from "@/lib/locateItemOnMainMap";
import { Attraction } from "@/types/attraction";

interface GroupCardProps {
  group: Group;
  onDelete: (id: string) => void;
  onUpdate: (formData: CreateGroupRequest) => Promise<void>;
  attractionsMap: Record<string, Attraction[]>;
}

export function GroupCard({
  group,
  onDelete,
  onUpdate,
  attractionsMap,
}: GroupCardProps) {
  const router = useRouter();
  const { isWideScreen } = useIsMobile();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCardClick = () => {
    router.push(`/groups/${group.id}`);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsDeleteDialogOpen(true);
  };

  const handleLocate = () => {
    locateItemOnMainMap({ router, item: group });
  };

  return (
    <Card className="overflow-hidden flex flex-col">
      <CardHeader>
        <div className="flex justify-between items-start space-x-1">
          <div
            className="flex-1 flex flex-col gap-2 cursor-pointer"
            onClick={handleCardClick}
          >
            <CardTitle className="text-lg/5">
              {group.name}{" "}
              {!!attractionsMap[group.id]?.length && (
                <span className="font-normal text-gray-400">
                  ({attractionsMap[group.id].length})
                </span>
              )}
            </CardTitle>
            {group.tag && <Tag text={group.tag} />}
          </div>
          {isWideScreen && (
            <ShowOnMapButton onClick={handleLocate} view="icon" />
          )}
          <NewGroupDialog
            groupData={group}
            handleSubmit={onUpdate}
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
      <CardContent
        className="cursor-pointer flex flex-col gap-4 justify-between flex-1"
        onClick={handleCardClick}
      >
        <CardDescription>{group.description}</CardDescription>
        {!isWideScreen && <ShowOnMapButton onClick={handleLocate} />}
      </CardContent>
    </Card>
  );
}
