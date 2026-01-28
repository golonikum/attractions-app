"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Navigation } from "@/components/Navigation";
import { Attraction, CreateAttractionRequest } from "@/types/attraction";
import {
  getAttractionById,
  updateAttraction,
  deleteAttraction,
} from "@/services/attractionService";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, ArrowLeft, Trash2 } from "lucide-react";
import { NewAttractionDialog } from "@/components/attraction/NewAttractionDialog";
import { AttractionInfoCard } from "@/components/attraction/AttractionInfoCard";
import { Group } from "@/types/group";
import { getGroupById } from "@/services/groupService";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

export default function AttractionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const attractionId = params.id as string;

  const [attraction, setAttraction] = useState<Attraction | null>(null);
  const [group, setGroup] = useState<Group | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Загрузка данных достопримечательности при монтировании компонента
  useEffect(() => {
    const fetchAttractionData = async () => {
      try {
        const attractionData = await getAttractionById(attractionId);
        setAttraction(attractionData);

        // Загрузка группы, к которой принадлежит достопримечательность
        const groupData = await getGroupById(attractionData!.groupId);
        setGroup(groupData);
      } catch (error) {
        toast.error("Не удалось загрузить данные достопримечательности");
        router.push("/groups");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAttractionData();
  }, [attractionId, router]);

  // Обработчик отправки формы редактирования достопримечательности
  const handleSubmit = async (formData: CreateAttractionRequest) => {
    const updatedAttraction = await updateAttraction(attractionId, formData);
    setAttraction(updatedAttraction);
  };

  // Обработчик удаления достопримечательности
  const handleDeleteAttraction = async () => {
    try {
      await deleteAttraction(attractionId);
      toast.success("Объект успешно удален");
      router.push("/groups");
    } catch (error) {
      toast.error("Не удалось удалить объект");
    }
  };

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    handleDeleteAttraction();
    setIsDeleteDialogOpen(false);
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

  if (!attraction) {
    return (
      <ProtectedRoute>
        <Navigation />
        <div className="container mx-auto pt-20 px-4 pb-8">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold">Объект не найден</h2>
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
          {group && (
            <Button
              variant="ghost"
              onClick={() => router.push(`/groups/${group.id}`)}
              className="mr-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Назад
            </Button>
          )}

          <div className="ml-auto flex space-x-2">
            <NewAttractionDialog
              attraction={attraction}
              isOpen={isEditDialogOpen}
              setIsOpen={setIsEditDialogOpen}
              handleSubmit={handleSubmit}
              isSubmitting={isSubmitting}
              setIsSubmitting={setIsSubmitting}
            />
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-red-500"
            onClick={handleDeleteClick}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        <div className="mb-6">
          <AttractionInfoCard attraction={attraction} />
        </div>

        <ConfirmDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
          onConfirm={handleConfirmDelete}
          title="Удалить объект?"
          description="Вы уверены, что хотите удалить этот объект?"
          confirmText="Удалить"
          cancelText="Отмена"
          variant="destructive"
        />
      </div>
    </ProtectedRoute>
  );
}
