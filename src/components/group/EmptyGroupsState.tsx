import { MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyGroupsStateProps {
  onCreateGroup?: () => void;
  message?: string;
}

// TODO: duplication
export function EmptyGroupsState({
  onCreateGroup,
  message,
}: EmptyGroupsStateProps) {
  return (
    <div className="text-center py-12">
      <MapPin className="mx-auto h-12 w-12 text-gray-400" />
      <h3 className="mt-2 text-sm font-semibold text-gray-900">
        {message || "Нет групп"}
      </h3>
      <p className="mt-1 text-sm text-gray-500">
        {message
          ? "Попробуйте изменить фильтры или создайте новую группу."
          : "У вас пока нет созданных групп. Создайте свою первую группу, чтобы начать добавлять объекта."}
      </p>
      {onCreateGroup ? (
        <div className="mt-6">
          <Button onClick={onCreateGroup}>
            <MapPin className="mr-2 h-4 w-4" />
            Создать группу
          </Button>
        </div>
      ) : null}
    </div>
  );
}
