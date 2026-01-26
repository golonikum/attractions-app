import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Trash2, Image } from "lucide-react";
import { ConfirmDialog } from "../ui/ConfirmDialog";
import { useState } from "react";

interface AttractionItem {
  id: string;
  groupId: string;
  name: string;
  category: string;
  imageUrl?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

interface AttractionCardProps {
  attraction: AttractionItem;
  onDelete: (id: string) => void;
}

export function AttractionCard({ attraction, onDelete }: AttractionCardProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  return (
    <Card className="overflow-hidden">
      <div className="aspect-video bg-gray-100 flex items-center justify-center">
        {attraction.imageUrl ? (
          <img
            src={attraction.imageUrl}
            alt={attraction.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <Image className="h-8 w-8 text-gray-400" />
        )}
      </div>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{attraction.name}</CardTitle>
            <span className="inline-block px-2 py-1 text-xs bg-primary/10 text-primary rounded-full mt-1">
              {attraction.category}
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-red-500"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(attraction.id);
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
          <ConfirmDialog
            isOpen={isDeleteDialogOpen}
            onClose={() => {
              setIsDeleteDialogOpen(false);
              // setAttractionToDelete(null);
            }}
            onConfirm={() => onDelete(attraction.id)}
            title="Удалить достопримечательность?"
            description="Вы уверены, что хотите удалить эту достопримечательность?"
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
