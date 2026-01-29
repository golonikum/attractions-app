import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";
import { useRouter } from "next/navigation";
import { Group } from "@/types/group";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useState } from "react";
import { Tag } from "../ui/Tag";
import { RemoveButton } from "../ui/buttons";

interface GroupCardProps {
  group: Group;
  onDelete: (id: string) => void;
}

export function GroupCard({ group, onDelete }: GroupCardProps) {
  const router = useRouter();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleCardClick = () => {
    router.push(`/groups/${group.id}`);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsDeleteDialogOpen(true);
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1 cursor-pointer" onClick={handleCardClick}>
            <CardTitle className="text-lg">{group.name}</CardTitle>
            {group.tag && <Tag text={group.tag} />}
          </div>
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
      <CardContent className="cursor-pointer" onClick={handleCardClick}>
        <CardDescription className="mb-4">{group.description}</CardDescription>
        <div className="flex justify-between text-sm text-gray-500">
          <span>
            Координаты: {group.coordinates[0].toFixed(4)},{" "}
            {group.coordinates[1].toFixed(4)}
          </span>
          <span>Масштаб: {group.zoom}</span>
        </div>
        <div className="mt-4">
          <Button variant="outline" className="w-full">
            <MapPin className="mr-2 h-4 w-4" />
            Открыть на карте
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
