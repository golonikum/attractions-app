"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Navigation } from "@/components/Navigation";
import { Group, CreateGroupRequest } from "@/types/group";
import {
  getAllGroups,
  createGroup,
  deleteGroup,
} from "@/services/groupService";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, MapPin, Plus, Trash2 } from "lucide-react";

export default function GroupsPage() {
  const router = useRouter();
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<CreateGroupRequest>({
    name: "",
    description: "",
    tag: "",
    coordinates: [37.617644, 55.755819], // Москва по умолчанию
    zoom: 10,
  });

  // Загрузка групп при монтировании компонента
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const data = await getAllGroups();
        setGroups(data);
      } catch (error) {
        toast.error("Не удалось загрузить группы");
      } finally {
        setIsLoading(false);
      }
    };

    fetchGroups();
  }, []);

  // Обработчик отправки формы создания группы
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const newGroup = await createGroup(formData);
      setGroups([...groups, newGroup]);
      toast.success("Группа успешно создана");
      setIsCreateDialogOpen(false);
      // Сброс формы
      setFormData({
        name: "",
        description: "",
        tag: "",
        coordinates: [37.617644, 55.755819],
        zoom: 10,
      });
    } catch (error) {
      toast.error("Не удалось создать группу");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Обработчик удаления группы
  const handleDeleteGroup = async (id: string) => {
    if (
      window.confirm(
        "Вы уверены, что хотите удалить эту группу? Все связанные достопримечательности также будут удалены."
      )
    ) {
      try {
        await deleteGroup(id);
        setGroups(groups.filter((group) => group.id !== id));
        toast.success("Группа успешно удалена");
      } catch (error) {
        toast.error("Не удалось удалить группу");
      }
    }
  };

  return (
    <ProtectedRoute>
      <Navigation />
      <div className="container mx-auto pt-20 px-4 pb-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Мои группы</h1>
          <Dialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Создать группу
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Создать новую группу</DialogTitle>
                <DialogDescription>
                  Создайте новую группу для организации ваших
                  достопримечательностей
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
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
                <div className="grid grid-cols-2 gap-4">
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
                </div>
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
                    onClick={() => setIsCreateDialogOpen(false)}
                  >
                    Отмена
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Создание...
                      </>
                    ) : (
                      "Создать"
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : groups.length === 0 ? (
          <div className="text-center py-12">
            <MapPin className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-semibold text-gray-900">
              Нет групп
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              У вас пока нет созданных групп. Создайте свою первую группу, чтобы
              начать добавлять достопримечательности.
            </p>
            <div className="mt-6">
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Создать группу
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groups.map((group) => (
              <Card
                key={group.id}
                className="overflow-hidden cursor-pointer"
                onClick={() => router.push(`/groups/${group.id}`)}
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{group.name}</CardTitle>
                      {group.tag && (
                        <span className="inline-block px-2 py-1 text-xs bg-primary/10 text-primary rounded-full mt-1">
                          {group.tag}
                        </span>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-500"
                      onClick={() => handleDeleteGroup(group.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="mb-4">
                    {group.description}
                  </CardDescription>
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>
                      Координаты: {group.coordinates[0].toFixed(4)},{" "}
                      {group.coordinates[1].toFixed(4)}
                    </span>
                    <span>Масштаб: {group.zoom}</span>
                  </div>
                  <div className="mt-4">
                    <Button variant="outline" className="w-full">
                      <MapPin className="mr-2 h-4 w-4" />
                      Открыть на карте
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
