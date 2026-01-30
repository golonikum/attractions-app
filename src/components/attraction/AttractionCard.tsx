import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Image } from "lucide-react";
import { ConfirmDialog } from "../ui/ConfirmDialog";
import { NewAttractionDialog } from "./NewAttractionDialog";
import { useState } from "react";
import { Attraction, CreateAttractionRequest } from "@/types/attraction";
import Link from "next/link";
import { Tag } from "../ui/Tag";
import { RemoveButton } from "../ui/buttons";

// Используем тип Attraction из types/attraction.ts вместо интерфейса AttractionItem
type AttractionItem = Attraction;

interface AttractionCardProps {
  attraction: AttractionItem;
  onDelete: (id: string) => void;
  onUpdate: (data: CreateAttractionRequest) => Promise<void>;
}

export function AttractionCard({
  attraction,
  onDelete,
  onUpdate,
}: AttractionCardProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDeleteDialogOpen(true);
  };

  return (
    <Card isFavorite={attraction.isFavorite} isVisited={attraction.isVisited}>
      <div className="aspect-video bg-gray-100 flex items-center justify-center">
        <Link href={`/attractions/${attraction.id}`} className="cursor-pointer">
          {attraction.imageUrl ? (
            <img
              src={attraction.imageUrl}
              alt={attraction.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <Image className="h-8 w-8 text-gray-400" />
          )}
        </Link>
      </div>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <Link href={`/attractions/${attraction.id}`}>
                <CardTitle className="text-lg cursor-pointer">
                  {attraction.name}
                </CardTitle>
              </Link>
            </div>
            {attraction.category && <Tag text={attraction.category} />}
          </div>
          <div className="flex space-x-2">
            <NewAttractionDialog
              attraction={attraction}
              isOpen={isEditDialogOpen}
              setIsOpen={setIsEditDialogOpen}
              handleSubmit={onUpdate}
              isSubmitting={isSubmitting}
              setIsSubmitting={setIsSubmitting}
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
        </div>
      </CardHeader>
      <CardContent>
        {attraction.description && (
          <CardDescription className="mb-4">
            {attraction.description}
          </CardDescription>
        )}

        {attraction.yaMapUrl && (
          <div className="mt-2">
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => window.open(attraction.yaMapUrl, "_blank")}
            >
              <MapPin className="mr-2 h-4 w-4" />
              Открыть на Яндекс.Картах
            </Button>
          </div>
        )}

        <div className="mt-4">
          <Button variant="outline" className="w-full">
            <MapPin className="mr-2 h-4 w-4" />
            Показать на карте
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
