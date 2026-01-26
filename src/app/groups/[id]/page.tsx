"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Navigation } from "@/components/Navigation";
import { CreateGroupRequest, Group } from "@/types/group";
import { getGroupById, updateGroup } from "@/services/groupService";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, ArrowLeft, Plus } from "lucide-react";
import { NewGroupDialog } from "@/components/group/NewGroupDialog";
import { AttractionCard } from "@/components/attraction/AttractionCard";
import { EmptyAttractionsState } from "@/components/group/EmptyAttractionsState";
import { GroupInfoCard } from "@/components/group/GroupInfoCard";

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

  // Загрузка данных группы при монтировании компонента
  useEffect(() => {
    const fetchGroupData = async () => {
      try {
        const groupData = await getGroupById(groupId);
        setGroup(groupData);

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
  const handleSubmit = async (formData: CreateGroupRequest) => {
    const updatedGroup = await updateGroup(groupId, formData);
    setGroup(updatedGroup);
  };

  // Обработчик удаления достопримечательности
  const handleDeleteAttraction = async (id: string) => {
    try {
      // Временно заглушка, т.к. функции deleteAttraction еще нет
      // await deleteAttraction(id);
      // setAttractions(attractions.filter((attraction) => attraction.id !== id));
      toast.success("Достопримечательность успешно удалена");
    } catch (error) {
      toast.error("Не удалось удалить достопримечательность");
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
            <NewGroupDialog
              groupData={group}
              handleSubmit={handleSubmit}
              isOpen={isEditDialogOpen}
              setIsOpen={setIsEditDialogOpen}
              isSubmitting={isSubmitting}
              setIsSubmitting={setIsSubmitting}
            />
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Добавить достопримечательность
            </Button>
          </div>
        </div>

        <div className="mb-6">
          <GroupInfoCard group={group} />
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-4">Достопримечательности</h2>
          {attractions.length === 0 ? (
            <EmptyAttractionsState />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {attractions.map((attraction) => (
                <AttractionCard
                  key={attraction.id}
                  attraction={attraction}
                  onDelete={() => handleDeleteAttraction(attraction.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
