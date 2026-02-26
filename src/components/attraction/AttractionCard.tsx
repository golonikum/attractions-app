import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ConfirmDialog } from "../ui/ConfirmDialog";
import { NewAttractionDialog } from "./NewAttractionDialog";
import { useState } from "react";
import { Attraction, CreateAttractionRequest } from "@/types/attraction";
import Link from "next/link";
import { Tag } from "../ui/Tag";
import {
  OpenInYandexMapButton,
  RemoveButton,
  ShowDescriptionButton,
  ShowOnMapButton,
} from "../ui/buttons";
import { AttractionImage } from "./AttractionImage";
import { useRouter } from "next/navigation";
import { locateItemOnMainMap } from "@/lib/locateItemOnMainMap";

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
  const [isDescriptionHidden, setIsDescriptionHidden] = useState(true);
  const router = useRouter();

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDeleteDialogOpen(true);
  };

  return (
    <Card isFavorite={attraction.isFavorite} isVisited={attraction.isVisited}>
      <div className="aspect-video bg-gray-100 flex items-center justify-center">
        <Link href={`/attractions/${attraction.id}`} className="cursor-pointer">
          <AttractionImage attraction={attraction} className="w-full h-full" />
        </Link>
      </div>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1 flex flex-col gap-2">
            <div className="flex justify-between items-start">
              <Link href={`/attractions/${attraction.id}`}>
                <CardTitle className="text-lg/5 cursor-pointer">
                  {attraction.name}
                </CardTitle>
              </Link>
            </div>
            {attraction.category && <Tag text={attraction.category} />}
          </div>
          <div className="flex space-x-1">
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
      <CardContent className="flex flex-col gap-6 justify-between">
        {attraction.description &&
          (isDescriptionHidden ? (
            <ShowDescriptionButton
              onClick={() => setIsDescriptionHidden(false)}
            />
          ) : (
            <CardDescription className="whitespace-pre-wrap">
              {attraction.description}
            </CardDescription>
          ))}

        <div className="flex flex-col gap-4">
          <OpenInYandexMapButton attraction={attraction} />
          <ShowOnMapButton
            onClick={() => {
              locateItemOnMainMap({ router, item: attraction });
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
}
