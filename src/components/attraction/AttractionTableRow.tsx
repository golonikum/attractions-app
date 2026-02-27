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
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Tag } from "../ui/Tag";

export type AttractionTableRowProps = {
  attraction: Attraction;
  onDelete?: (id: string) => void;
  onUpdate?: (
    id: string,
  ) => (updateData: CreateAttractionRequest) => Promise<void>;
  onLocate: (attraction: Attraction) => void;
  hasDnd?: boolean;
};

export const AttractionTableRow = ({
  attraction,
  onDelete,
  onUpdate,
  onLocate,
  hasDnd = true,
}: AttractionTableRowProps) => {
  const router = useRouter();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: attraction.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.8 : 1,
    zIndex: isDragging ? 1 : 0,
  };

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
      className={attraction.isVisited ? "bg-green-50" : ""}
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
    >
      {hasDnd && <td className="px-4 py-2  cursor-move">☰</td>}
      <td
        className="px-4 py-2  whitespace-nowrap cursor-pointer"
        onClick={handleAttractionClick(attraction)}
      >
        <AttractionImage
          attraction={attraction}
          className="h-24 w-24 rounded-md"
        />
      </td>
      <td
        className="px-4 py-2  cursor-pointer"
        onClick={handleAttractionClick(attraction)}
      >
        <div className="text-sm font-medium text-gray-900">
          {attraction.name}
        </div>
        {attraction.category && <Tag text={attraction.category} />}
      </td>
      <td
        className="px-4 py-2  cursor-pointer"
        onClick={handleAttractionClick(attraction)}
      >
        <div className="text-sm text-gray-900 line-clamp-4">
          {attraction.description || "Нет описания"}
        </div>
      </td>
      <td className="px-4 py-2  whitespace-nowrap text-sm font-medium">
        <div className="flex justify-end space-x-1">
          <ShowOnMapButton onClick={onLocateAttractionClick} view="icon" />
          <OpenInYandexMapButton attraction={attraction} view="icon" />
          {!!onUpdate && (
            <NewAttractionDialog
              isOpen={isEditDialogOpen}
              setIsOpen={setIsEditDialogOpen}
              handleSubmit={onUpdate(attraction.id)}
              isSubmitting={isSubmitting}
              setIsSubmitting={setIsSubmitting}
              attraction={attraction}
            />
          )}
          {!!onDelete && <RemoveButton onClick={handleDeleteClick} />}
        </div>
        {!!onDelete && (
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
        )}
      </td>
    </tr>
  );
};
