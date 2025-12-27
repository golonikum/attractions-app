"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Navigation } from "@/components/Navigation";
import { Group } from "@/types/group";
import { getGroupById, updateGroup } from "@/services/groupService";
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
import {
  Loader2,
  MapPin,
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  Image,
} from "lucide-react";

// Временно создадим тип для достопримечательности, так как его нет в types/group.ts
// Позже его нужно будет добавить в отдельный файл
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

export default function GroupDetailPage() {
  const params = useParams();
  const router = useRouter();
  const groupId = params.id as string;

  const [group, setGroup] = useState<Group | null>(null);
  const [attractions, setAttractions] = useState<AttractionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    tag: "",
    coordinates: [37.617644, 55.755819], // Москва по умолчанию
    zoom: 10,
  });

  // Загрузка данных группы при монтировании компонента
  useEffect(() => {
    const fetchGroupData = async () => {
      try {
        const groupData = await getGroupById(groupId);
        setGroup(groupData);
        setFormData({
          name: groupData.name,
          description: groupData.description,
          tag: groupData.tag || "",
          coordinates: groupData.coordinates,
          zoom: groupData.zoom,
        });

        // Временно заглушка для достопримечательностей, т.к. сервиса для них еще нет
        // setAttractions(await getAttractionsByGroupId(groupId));
      } catch (error) {
        toast.error("Не удалось загрузить данные группы");
        router.push("/groups");
      } finally {
        setIsLoading(false);
      }
    };

    fetchGroupData();
  }, [groupId, router]);

  // Обработчик отправки формы редактирования группы
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const updatedGroup = await updateGroup(groupId, formData);
      setGroup(updatedGroup);
      toast.success("Группа успешно обновлена");
      setIsEditDialogOpen(false);
    } catch (error) {
      toast.error("Не удалось обновить группу");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Обработчик удаления достопримечательности
  const handleDeleteAttraction = async (id: string) => {
    if (
      window.confirm(
        "Вы уверены, что хотите удалить эту достопримечательность?"
      )
    ) {
      try {
        // Временно заглушка, т.к. функции deleteAttraction еще нет
        // await deleteAttraction(id);
        // setAttractions(attractions.filter((attraction) => attraction.id !== id));
        toast.success("Достопримечательность успешно удалена");
      } catch (error) {
        toast.error("Не удалось удалить достопримечательность");
      }
    }
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
        <Navigation />
        <div className="container mx-auto pt-20 px-4 pb-8">
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!group) {
    return (
      <ProtectedRoute>
        <Navigation />
        <div className="container mx-auto pt-20 px-4 pb-8">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold">Группа не найдена</h2>
            <Button className="mt-4" onClick={() => router.push("/groups")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Вернуться к списку групп
            </Button>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <Navigation />
      <div className="container mx-auto pt-20 px-4 pb-8">
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push("/groups")}
            className="mr-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Назад
          </Button>
          <h1 className="text-3xl font-bold">{group.name}</h1>
          <div className="ml-auto flex space-x-2">
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Edit className="mr-2 h-4 w-4" />
                  Редактировать
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Редактировать группу</DialogTitle>
                  <DialogDescription>
                    Измените информацию о группе
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
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
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
                      onClick={() => setIsEditDialogOpen(false)}
                    >
                      Отмена
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Сохранение...
                        </>
                      ) : (
                        "Сохранить"
                      )}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Добавить достопримечательность
            </Button>
          </div>
        </div>

        <div className="mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Информация о группе</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">{group.description}</p>
              {group.tag && (
                <span className="inline-block px-2 py-1 text-xs bg-primary/10 text-primary rounded-full">
                  {group.tag}
                </span>
              )}
              <div className="flex justify-between text-sm text-gray-500 mt-4">
                <span>
                  Координаты: {group.coordinates[0].toFixed(4)},{" "}
                  {group.coordinates[1].toFixed(4)}
                </span>
                <span>Масштаб: {group.zoom}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-4">Достопримечательности</h2>
          {attractions.length === 0 ? (
            <div className="text-center py-12">
              <MapPin className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900">
                Нет достопримечательностей
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                У этой группы пока нет достопримечательностей. Добавьте первую,
                чтобы начать.
              </p>
              <div className="mt-6">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Добавить достопримечательность
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {attractions.map((attraction) => (
                <Card key={attraction.id} className="overflow-hidden">
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
                        <CardTitle className="text-lg">
                          {attraction.name}
                        </CardTitle>
                        <span className="inline-block px-2 py-1 text-xs bg-primary/10 text-primary rounded-full mt-1">
                          {attraction.category}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-500"
                        onClick={() => handleDeleteAttraction(attraction.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
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
              ))}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
