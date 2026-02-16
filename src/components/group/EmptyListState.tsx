import { MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyGroupsStateProps {
  onButtonClick?: () => void;
  buttonLabel?: string;
  message?: string;
  description?: string;
}

export function EmptyListState({
  onButtonClick,
  buttonLabel,
  message = "Ничего нет",
  description,
}: EmptyGroupsStateProps) {
  return (
    <div className="text-center py-12">
      <MapPin className="mx-auto h-12 w-12 text-gray-400" />
      <h3 className="mt-2 text-sm font-semibold text-gray-900">{message}</h3>
      <p className="mt-1 text-sm text-gray-500">{description}</p>
      {onButtonClick ? (
        <div className="mt-6">
          <Button onClick={onButtonClick}>
            <MapPin className="mr-2 h-4 w-4" />
            {buttonLabel}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
