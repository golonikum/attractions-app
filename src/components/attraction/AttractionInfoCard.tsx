import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Star, Trash2 } from "lucide-react";
import { Attraction } from "@/types/attraction";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useState } from "react";

interface AttractionInfoCardProps {
  attraction: Attraction;
  onEdit?: () => void;
  onDelete?: () => Promise<void>;
}

export function AttractionInfoCard({
  attraction,
  onDelete,
  onEdit,
}: AttractionInfoCardProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    onDelete?.();
    setIsDeleteDialogOpen(false);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle>{attraction.name}</CardTitle>
          <div className="flex space-x-2">
            {onEdit && (
              <Button variant="ghost" size="sm" onClick={onEdit}>
                <Star className="h-4 w-4" />
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                className="text-red-500"
                onClick={handleDeleteClick}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        {attraction.category && (
          <span className="inline-block px-2 py-1 text-xs bg-primary/10 text-primary rounded-full">
            {attraction.category}
          </span>
        )}
        {attraction.isVisited && (
          <span className="inline-block px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full mt-1">
            Посещено
          </span>
        )}
      </CardHeader>

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Удалить объект?"
        description="Вы уверены, что хотите удалить этот объект?"
        confirmText="Удалить"
        cancelText="Отмена"
        variant="destructive"
      />
      <CardContent>
        {attraction.description && (
          <p className="text-gray-600 mb-4">{attraction.description}</p>
        )}

        {attraction.imageUrl && (
          <div className="mb-4">
            <img
              src={attraction.imageUrl}
              alt={attraction.name}
              className="w-full h-48 object-cover rounded-md"
            />
          </div>
        )}

        <div className="flex justify-between text-sm text-gray-500 mb-4">
          <span>
            Координаты: {attraction.coordinates[0].toFixed(4)},{" "}
            {attraction.coordinates[1].toFixed(4)}
          </span>
          <span>Порядок: {attraction.order}</span>
        </div>

        {attraction.yaMapUrl && (
          <div className="mt-4">
            <Button variant="outline" className="w-full">
              <MapPin className="mr-2 h-4 w-4" />
              Открыть на Яндекс.Картах
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
