"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Attraction, CreateAttractionRequest } from "@/types/attraction";
import { getAttractionById } from "@/services/attractionService";
import { toast } from "sonner";
import { NewAttractionDialog } from "@/components/attraction/NewAttractionDialog";
import { AttractionInfoCard } from "@/components/attraction/AttractionInfoCard";
import { Group } from "@/types/group";
import { getGroupById } from "@/services/groupService";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import {
  BackButton,
  OpenInYandexMapButton,
  RemoveButton,
  ShowOnMapButton,
} from "@/components/ui/buttons";
import { useIsMobile } from "@/hooks/useIsMobile";
import { LoadingStub, NotFoundStub } from "@/components/ui/stubs";
import { locateItemOnMainMap } from "@/lib/locateItemOnMainMap";
import { useUpdateRequests } from "@/hooks/useUpdateRequests";

export default function AttractionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const attractionId = params.id as string;

  const { isWideScreen } = useIsMobile();
  const [attraction, setAttraction] = useState<Attraction | null>(null);
  const [group, setGroup] = useState<Group | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { deleteAttraction, updateAttraction } = useUpdateRequests();

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
  const handleDeleteAttraction = useCallback(async () => {
    try {
      await deleteAttraction(attractionId);
      toast.success("Объект успешно удален");

      if (group) {
        router.push(`/groups/${group?.id}`);
      } else {
        router.push("/groups");
      }
    } catch (error) {
      toast.error("Не удалось удалить объект");
    }
  }, [group, attractionId, router]);

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
    return <LoadingStub />;
  }

  if (!attraction) {
    return <NotFoundStub message="Объект не найден" />;
  }

  return (
    <ProtectedRoute>
      <div className="container lg:max-w-full mx-auto pt-20 px-4 pb-8 flex flex-col gap-4">
        <div className="flex items-center gap-2">
          {group && <BackButton />}

          <div className="ml-auto flex space-x-1">
            {isWideScreen && (
              <>
                <ShowOnMapButton
                  view="icon"
                  onClick={() => {
                    locateItemOnMainMap({ router, item: attraction });
                  }}
                />
                <OpenInYandexMapButton view="icon" attraction={attraction} />
              </>
            )}
            <NewAttractionDialog
              attraction={attraction}
              isOpen={isEditDialogOpen}
              setIsOpen={setIsEditDialogOpen}
              handleSubmit={handleSubmit}
              isSubmitting={isSubmitting}
              setIsSubmitting={setIsSubmitting}
            />
            <RemoveButton onClick={handleDeleteClick} />
          </div>
        </div>

        <AttractionInfoCard attraction={attraction} group={group} />

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
