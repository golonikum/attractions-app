import { MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyGroupsStateProps {
  onCreateGroup: () => void;
}

export function EmptyGroupsState({ onCreateGroup }: EmptyGroupsStateProps) {
  return (
    <div className="text-center py-12">
      <MapPin className="mx-auto h-12 w-12 text-gray-400" />
      <h3 className="mt-2 text-sm font-semibold text-gray-900">Нет групп</h3>
      <p className="mt-1 text-sm text-gray-500">
        У вас пока нет созданных групп. Создайте свою первую группу, чтобы
        начать добавлять объекта.
      </p>
      <div className="mt-6">
        <Button onClick={onCreateGroup}>
          <MapPin className="mr-2 h-4 w-4" />
          Создать группу
        </Button>
      </div>
    </div>
  );
}
