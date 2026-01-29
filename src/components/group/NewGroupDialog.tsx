import { Loader2, Plus } from "lucide-react";
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
import { CoordinatesInput } from "../ui/CoordinatesInput";
import { useEffect, useState } from "react";
import { CreateGroupRequest, Group } from "@/types/group";
import { toast } from "sonner";
import { EditButton } from "../ui/buttons";

export const NewGroupDialog = ({
  isOpen,
  setIsOpen,
  handleSubmit,
  isSubmitting,
  setIsSubmitting,
  groupData,
}: {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  handleSubmit: (formData: CreateGroupRequest) => Promise<void>;
  isSubmitting: boolean;
  setIsSubmitting: (isSubmitting: boolean) => void;
  groupData?: Group;
}) => {
  const [formData, setFormData] = useState<CreateGroupRequest>({
    name: "",
    description: "",
    tag: "",
    coordinates: [55.755819, 37.617644],
    zoom: 10,
  });

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await handleSubmit(formData);
      toast.success(`Группа успешно ${groupData ? "обновлена" : "создана"}`);
      setIsOpen(false);

      // Сброс формы
      if (!groupData) {
        setFormData({
          name: "",
          description: "",
          tag: "",
          coordinates: [55.755819, 37.617644],
          zoom: 10,
        });
      }
    } catch (error) {
      toast.error(`Не удалось ${groupData ? "обновить" : "создать"} группу`);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (groupData) {
      // TODO
      setFormData({
        name: groupData.name,
        description: groupData.description,
        tag: groupData.tag || "",
        coordinates: groupData.coordinates,
        zoom: groupData.zoom,
      });
    }
  }, [groupData]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          {groupData ? (
            <EditButton />
          ) : (
            <>
              <Plus className="mr-2 h-4 w-4" />
              Добавить
            </>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {groupData ? "Изменить группу" : "Создать новую группу"}
          </DialogTitle>
          <DialogDescription>
            {groupData
              ? "Измените информацию о группе"
              : "Создайте новую группу для организации ваших объектов"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleFormSubmit} className="space-y-4">
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
            <Label htmlFor="description">Описание</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tag">Тег (необязательно)</Label>
            <Input
              id="tag"
              value={formData.tag || ""}
              onChange={(e) =>
                setFormData({ ...formData, tag: e.target.value })
              }
            />
          </div>
          <CoordinatesInput
            value={formData.coordinates}
            onChange={(coordinates) =>
              setFormData({ ...formData, coordinates })
            }
            required
          />
          <div className="space-y-2">
            <Label htmlFor="zoom">Масштаб карты</Label>
            <Input
              id="zoom"
              type="number"
              value={formData.zoom}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  zoom: parseInt(e.target.value),
                })
              }
              min="1"
              max="20"
              required
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
                  {groupData ? "Сохранение..." : "Создание..."}
                </>
              ) : groupData ? (
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
