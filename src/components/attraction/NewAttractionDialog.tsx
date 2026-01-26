import { Plus, Edit, Loader2 } from "lucide-react";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { useState, useEffect } from "react";
import { CreateAttractionRequest, Attraction } from "@/types/attraction";
import { toast } from "sonner";

interface NewAttractionDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  handleSubmit?: (formData: CreateAttractionRequest) => Promise<void>;
  isSubmitting: boolean;
  setIsSubmitting: (isSubmitting: boolean) => void;
  groupId?: string;
  attraction?: Attraction;
}

export const NewAttractionDialog = ({
  isOpen,
  setIsOpen,
  handleSubmit,
  isSubmitting,
  setIsSubmitting,
  groupId,
  attraction,
}: NewAttractionDialogProps) => {
  const [formData, setFormData] = useState<CreateAttractionRequest>({
    groupId: groupId || "",
    name: "",
    category: "",
    description: "",
    imageUrl: "",
    yaMapUrl: "",
    isVisited: false,
    isFavorite: false,
    coordinates: [37.617644, 55.755819], // [долгота, широта] по умолчанию (Москва)
    order: 1,
    notes: [],
  });

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await handleSubmit?.(formData);
      toast.success(
        `Достопримечательность успешно ${attraction ? "обновлена" : "создана"}`,
      );
      setIsOpen(false);

      // Сброс формы
      setFormData({
        groupId: groupId || "",
        name: "",
        category: "",
        description: "",
        imageUrl: "",
        yaMapUrl: "",
        isVisited: false,
        isFavorite: false,
        coordinates: [37.617644, 55.755819], // [долгота, широта] по умолчанию (Москва)
        order: 1,
        notes: [],
      });
    } catch (error) {
      toast.error(
        `Не удалось ${attraction ? "обновить" : "создать"} достопримечательность`,
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (attraction) {
      // Заполнение формы данными достопримечательности в режиме редактирования
      setFormData({
        groupId: attraction.groupId,
        name: attraction.name,
        category: attraction.category,
        description: attraction.description || "",
        imageUrl: attraction.imageUrl || "",
        yaMapUrl: attraction.yaMapUrl || "",
        isVisited: attraction.isVisited || false,
        isFavorite: attraction.isFavorite || false,
        coordinates: attraction.coordinates,
        order: attraction.order || 1,
        notes: attraction.notes || [],
      });
    }
  }, [attraction]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {attraction ? (
          <Button variant="ghost" size="sm">
            <Edit className="h-4 w-4" />
          </Button>
        ) : (
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Добавить достопримечательность
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {attraction
              ? "Редактировать достопримечательность"
              : "Добавить достопримечательность"}
          </DialogTitle>
          <DialogDescription>
            {attraction
              ? "Измените информацию о достопримечательности"
              : "Заполните информацию о новой достопримечательности"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Название</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Категория</Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="imageUrl">URL изображения</Label>
              <Input
                id="imageUrl"
                type="url"
                value={formData.imageUrl}
                onChange={(e) =>
                  setFormData({ ...formData, imageUrl: e.target.value })
                }
                placeholder="https://example.com/image.jpg"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="yaMapUrl">URL Яндекс.Карты</Label>
              <Input
                id="yaMapUrl"
                type="url"
                value={formData.yaMapUrl}
                onChange={(e) =>
                  setFormData({ ...formData, yaMapUrl: e.target.value })
                }
                placeholder="https://yandex.ru/maps/-/CDgBC~cD"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="longitude">Долгота</Label>
              <Input
                id="longitude"
                type="number"
                step="any"
                value={formData.coordinates[0]}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    coordinates: [
                      parseFloat(e.target.value),
                      formData.coordinates[1],
                    ],
                  })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="latitude">Широта</Label>
              <Input
                id="latitude"
                type="number"
                step="any"
                value={formData.coordinates[1]}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    coordinates: [
                      formData.coordinates[0],
                      parseFloat(e.target.value),
                    ],
                  })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="order">Порядок</Label>
              <Input
                id="order"
                type="number"
                value={formData.order || 1}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    order: parseInt(e.target.value) || 1,
                  })
                }
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isVisited"
                checked={formData.isVisited}
                onChange={(e) =>
                  setFormData({ ...formData, isVisited: e.target.checked })
                }
                className="rounded"
              />
              <Label htmlFor="isVisited">Посещено</Label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isFavorite"
                checked={formData.isFavorite}
                onChange={(e) =>
                  setFormData({ ...formData, isFavorite: e.target.checked })
                }
                className="rounded"
              />
              <Label htmlFor="isFavorite">Избранное</Label>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Описание</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Добавьте описание достопримечательности..."
              rows={3}
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
            >
              Отмена
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {attraction ? "Сохранение..." : "Создание..."}
                </>
              ) : attraction ? (
                "Сохранить"
              ) : (
                "Создать"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
