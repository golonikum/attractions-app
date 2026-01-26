import { MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyAttractionsStateProps {
  onAddAttraction?: () => void;
}

export function EmptyAttractionsState({
  onAddAttraction,
}: EmptyAttractionsStateProps) {
  return (
    <div className="text-center py-12">
      <MapPin className="mx-auto h-12 w-12 text-gray-400" />
      <h3 className="mt-2 text-sm font-semibold text-gray-900">
        Нет достопримечательностей
      </h3>
      <p className="mt-1 text-sm text-gray-500">
        У этой группы пока нет достопримечательностей. Добавьте первую, чтобы
        начать.
      </p>
      <div className="mt-6">
        <Button onClick={onAddAttraction}>
          <MapPin className="mr-2 h-4 w-4" />
          Добавить достопримечательность
        </Button>
      </div>
    </div>
  );
}
