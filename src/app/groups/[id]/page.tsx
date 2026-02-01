"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Navigation } from "@/components/Navigation";
import { CreateGroupRequest, Group } from "@/types/group";
import { getGroupById, updateGroup } from "@/services/groupService";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, ArrowLeft } from "lucide-react";
import { AttractionCard } from "@/components/attraction/AttractionCard";
import { EmptyAttractionsState } from "@/components/group/EmptyAttractionsState";
import { GroupInfoCard } from "@/components/group/GroupInfoCard";

import { Attraction, CreateAttractionRequest } from "@/types/attraction";
import {
  getAttractionsByGroupId,
  createAttraction,
  deleteAttraction,
  updateAttraction,
} from "@/services/attractionService";
import { NewAttractionDialog } from "@/components/attraction/NewAttractionDialog";
import { NewGroupDialog } from "@/components/group/NewGroupDialog";
import { useIsMobile } from "@/hooks/useIsMobile";
import { BackButton } from "@/components/ui/buttons";

// Используем тип Attraction из types/attraction.ts

export default function GroupDetailPage() {
  const params = useParams();
  const router = useRouter();
  const groupId = params.id as string;

  const [group, setGroup] = useState<Group | null>(null);
  const [attractions, setAttractions] = useState<Attraction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAddAttractionDialogOpen, setIsAddAttractionDialogOpen] =
    useState(false);
  const [isSubmittingAttraction, setIsSubmittingAttraction] = useState(false);
  const isMobile = useIsMobile();

  // Загрузка данных группы при монтировании компонента
  useEffect(() => {
    const fetchGroupData = async () => {
      try {
        const groupData = await getGroupById(groupId);
        setGroup(groupData);

        // Загрузка объектов для группы
        const attractionsData = await getAttractionsByGroupId(groupId);
        setAttractions(attractionsData);
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
  const handleSubmit = async (formData: CreateGroupRequest) => {
    const updatedGroup = await updateGroup(groupId, formData);
    setGroup(updatedGroup);
  };

  // Обработчик удаления объекта
  const handleDeleteAttraction = async (id: string) => {
    try {
      await deleteAttraction(id);
      setAttractions(attractions.filter((attraction) => attraction.id !== id));
      toast.success("Объект успешно удалена");
    } catch (error) {
      toast.error("Не удалось удалить объект");
    }
  };

  // Обработчик добавления объекта
  const handleAddAttraction = async (formData: CreateAttractionRequest) => {
    const newAttraction = await createAttraction({
      ...formData,
    });
    setAttractions([...attractions, newAttraction]);
  };

  // Обработчик обновления объекта
  /**
   * Handles updating an attraction with the provided data
   * @param {string} id - The ID of the attraction to update
   * @returns {Function} An async function that takes updateData as parameter
   */
  const handleUpdateAttraction =
    (id: string) => async (updateData: CreateAttractionRequest) => {
      const updatedAttraction = await updateAttraction(id, updateData);
      // Update the attractions state with the new data
      setAttractions(
        attractions.map((attraction) =>
          attraction.id === id ? updatedAttraction : attraction,
        ),
      );
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
          <BackButton route="/groups" />
          <div className="ml-auto flex space-x-1">
            <NewGroupDialog
              groupData={group}
              handleSubmit={handleSubmit}
              isOpen={isEditDialogOpen}
              setIsOpen={setIsEditDialogOpen}
              isSubmitting={isSubmitting}
              setIsSubmitting={setIsSubmitting}
            />
            <NewAttractionDialog
              isOpen={isAddAttractionDialogOpen}
              setIsOpen={setIsAddAttractionDialogOpen}
              handleSubmit={handleAddAttraction}
              isSubmitting={isSubmittingAttraction}
              setIsSubmitting={setIsSubmittingAttraction}
              groupId={groupId}
            />
          </div>
        </div>

        {!isMobile ? (
          <>
            <div className="mb-6">
              <GroupInfoCard group={group} />
            </div>

            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Объекты</h2>
                <Button onClick={() => setIsAddAttractionDialogOpen(true)}>
                  Добавить объект
                </Button>
              </div>
              {attractions.length === 0 ? (
                <EmptyAttractionsState
                  onAddAttraction={() => setIsAddAttractionDialogOpen(true)}
                />
              ) : (
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
                        <tr key={attraction.id} className="hover:bg-gray-50">
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
                                isOpen={false}
                                setIsOpen={() => {}}
                                handleSubmit={handleUpdateAttraction(
                                  attraction.id,
                                )}
                                isSubmitting={false}
                                setIsSubmitting={() => {}}
                                groupId={groupId}
                                attraction={attraction}
                              >
                                <Button variant="ghost" size="sm">
                                  Редактировать
                                </Button>
                              </NewAttractionDialog>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  handleDeleteAttraction(attraction.id)
                                }
                              >
                                Удалить
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <div className="mb-6">
              <GroupInfoCard group={group} />
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-4">Объекты</h2>
              {attractions.length === 0 ? (
                <EmptyAttractionsState
                  onAddAttraction={() => setIsAddAttractionDialogOpen(true)}
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {attractions.map((attraction) => (
                    <AttractionCard
                      key={attraction.id}
                      attraction={attraction}
                      onDelete={() => handleDeleteAttraction(attraction.id)}
                      onUpdate={handleUpdateAttraction(attraction.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </ProtectedRoute>
  );
}
