import { useRouter } from "next/navigation";
import { Attraction, CreateAttractionRequest } from "@/types/attraction";
import { NewAttractionDialog } from "./NewAttractionDialog";
import { useState } from "react";
import { RemoveButton } from "../ui/buttons";
import { ConfirmDialog } from "../ui/ConfirmDialog";
import { AttractionImage } from "./AttractionImage";

interface AttractionTableProps {
  attractions: Attraction[];
  onDelete: (id: string) => void;
  onUpdate: (
    id: string,
  ) => (updateData: CreateAttractionRequest) => Promise<void>;
}

export function AttractionTable({
  attractions,
  onDelete,
  onUpdate,
}: AttractionTableProps) {
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

  return (
    <div className="hidden md:block overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <tbody className="bg-white divide-y divide-gray-200">
          {attractions.map((attraction) => (
            <tr key={attraction.id} className="hover:bg-gray-50 cursor-pointer">
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
                  <div className="text-sm text-gray-500">
                    {attraction.category}
                  </div>
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
                  description="Вы уверены, что хотите удалить эту объект?"
                  confirmText="Удалить"
                  cancelText="Отмена"
                  variant="destructive"
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
