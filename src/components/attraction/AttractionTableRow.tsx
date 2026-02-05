import { Attraction, CreateAttractionRequest } from "@/types/attraction";
import { NewAttractionDialog } from "./NewAttractionDialog";
import { AttractionImage } from "./AttractionImage";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  OpenInYandexMapButton,
  RemoveButton,
  ShowOnMapButton,
} from "../ui/buttons";
import { ConfirmDialog } from "../ui/ConfirmDialog";

export type AttractionTableRowProps = {
  attraction: Attraction;
  onDelete: (id: string) => void;
  onUpdate: (
    id: string,
  ) => (updateData: CreateAttractionRequest) => Promise<void>;
  onLocate: (attraction: Attraction) => void;
};

export const AttractionTableRow = ({
  attraction,
  onDelete,
  onUpdate,
  onLocate,
}: AttractionTableRowProps) => {
  const router = useRouter();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsDeleteDialogOpen(true);
  };

  const handleAttractionClick = (attraction: Attraction) => () => {
    router.push(`/attractions/${attraction.id}`);
  };

  const onLocateAttractionClick = () => {
    onLocate(attraction);
  };

  return (
    <tr
      key={attraction.id}
      className={attraction.isVisited ? "bg-green-50" : ""}
    >
      <td
        className="px-6 py-4 whitespace-nowrap cursor-pointer"
        onClick={handleAttractionClick(attraction)}
      >
        <AttractionImage
          attraction={attraction}
          className="h-24 w-24 rounded-md"
        />
      </td>
      <td
        className="px-6 py-4 cursor-pointer"
        onClick={handleAttractionClick(attraction)}
      >
        <div className="text-sm font-medium text-gray-900">
          {attraction.name}
        </div>
        {attraction.category && (
          <div className="text-sm text-gray-500">{attraction.category}</div>
        )}
      </td>
      <td
        className="px-6 py-4 cursor-pointer"
        onClick={handleAttractionClick(attraction)}
      >
        <div className="text-sm text-gray-900 max-w-xs truncate">
          {attraction.description || "Нет описания"}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
        <div className="flex space-x-2">
          <ShowOnMapButton onClick={onLocateAttractionClick} />
          {attraction.yaMapUrl && (
            <OpenInYandexMapButton attraction={attraction} />
          )}
          <NewAttractionDialog
            isOpen={isEditDialogOpen}
            setIsOpen={setIsEditDialogOpen}
            handleSubmit={onUpdate(attraction.id)}
            isSubmitting={isSubmitting}
            setIsSubmitting={setIsSubmitting}
            attraction={attraction}
          />
          <RemoveButton onClick={handleDeleteClick} />
        </div>
        <ConfirmDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
          onConfirm={() => onDelete(attraction.id)}
          title="Удалить объект?"
          description={`Вы уверены, что хотите удалить "${attraction.name}"?`}
          confirmText="Удалить"
          cancelText="Отмена"
          variant="destructive"
        />
      </td>
    </tr>
  );
};
