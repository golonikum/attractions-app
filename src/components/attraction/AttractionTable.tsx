import { useRouter } from "next/navigation";
import { Attraction, CreateAttractionRequest } from "@/types/attraction";
import { NewAttractionDialog } from "./NewAttractionDialog";
import { useState } from "react";
import { RemoveButton } from "../ui/buttons";
import { ConfirmDialog } from "../ui/ConfirmDialog";

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
    setIsDeleteDialogOpen(true);
  };

  return (
    <div className="hidden md:block overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Изображение
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Название
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Описание
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Действия
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {attractions.map((attraction) => (
            <tr
              key={attraction.id}
              className="hover:bg-gray-50 cursor-pointer"
              onClick={() => router.push(`/attractions/${attraction.id}`)}
            >
              <td className="px-6 py-4 whitespace-nowrap">
                {attraction.imageUrl ? (
                  <img
                    className="h-16 w-16 rounded-md object-cover"
                    src={attraction.imageUrl}
                    alt={attraction.name}
                  />
                ) : (
                  <div className="h-16 w-16 rounded-md bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-500 text-xs">
                      Нет изображения
                    </span>
                  </div>
                )}
              </td>
              <td className="px-6 py-4">
                <div className="text-sm font-medium text-gray-900">
                  {attraction.name}
                </div>
                {attraction.category && (
                  <div className="text-sm text-gray-500">
                    {attraction.category}
                  </div>
                )}
              </td>
              <td className="px-6 py-4">
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
