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
import {
  AddButton,
  CancelFormButton,
  EditButton,
  SubmitFormButton,
} from "../ui/buttons";
import { DEFAULT_COORDINATES } from "@/lib/constants";

const initialGroupFormState = {
  name: "",
  description: "",
  tag: "",
  coordinates: DEFAULT_COORDINATES,
  zoom: 10,
};

export const NewGroupDialog = ({
  isOpen,
  setIsOpen,
  handleSubmit,
  isSubmitting,
  setIsSubmitting,
  groupData,
  selectedTag = "",
}: {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  handleSubmit: (formData: CreateGroupRequest) => Promise<void>;
  isSubmitting: boolean;
  setIsSubmitting: (isSubmitting: boolean) => void;
  groupData?: Group;
  selectedTag?: string;
}) => {
  const [formData, setFormData] = useState<CreateGroupRequest>(
    initialGroupFormState,
  );

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await handleSubmit(formData);
      toast.success(`Группа успешно ${groupData ? "обновлена" : "создана"}`);
      setIsOpen(false);

      // Сброс формы
      if (!groupData) {
        setFormData(initialGroupFormState);
      }
    } catch (error) {
      toast.error(`Не удалось ${groupData ? "обновить" : "создать"} группу`);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (groupData) {
      setFormData({
        name: groupData.name,
        description: groupData.description,
        tag: groupData.tag || "",
        coordinates: groupData.coordinates,
        zoom: groupData.zoom,
      });
    }
  }, [groupData]);

  useEffect(() => {
    if (isOpen && !groupData && selectedTag) {
      setFormData({
        ...formData,
        tag: selectedTag,
      });
    }
  }, [isOpen, selectedTag, groupData, formData]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {groupData ? (
          <EditButton />
        ) : (
          <AddButton title="Добавить новую группу" />
        )}
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
            <Label htmlFor="tag">Регион (необязательно)</Label>
            <Input
              id="tag"
              value={formData.tag || selectedTag}
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
            <CancelFormButton onClick={() => setIsOpen(false)} />
            <SubmitFormButton isSubmitting={isSubmitting} id={groupData?.id} />
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
