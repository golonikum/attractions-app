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
import { AttractionTable } from "@/components/attraction/AttractionTable";
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
import { Map } from "@/components/ui/Map";
import { DEFAULT_LOCATION } from "@/lib/ymaps";

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
  const { isWideScreen } = useIsMobile();
  const [locatedAttraction, setLocatedAttraction] = useState<Attraction | null>(
    null,
  );

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

  const handleLocateAttraction = (attraction: Attraction) => {
    setLocatedAttraction(attraction);
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
      <div
        className={`container mx-auto pt-20 px-4 pb-8 flex flex-col gap-4 ${isWideScreen ? "overflow-hidden" : ""}`}
        style={isWideScreen ? { height: "calc(100vh)" } : {}}
      >
        <div className="flex items-center">
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

        {isWideScreen ? (
          <div
            className="flex-1 flex flex-row gap-4"
            style={{ height: "calc(100vh - 150px)" }}
          >
            <div style={{ height: "100%", minWidth: "600px" }}>
              <Map
                location={{
                  center: locatedAttraction
                    ? [
                        locatedAttraction.coordinates[1],
                        locatedAttraction.coordinates[0],
                      ]
                    : [group.coordinates[1], group.coordinates[0]],
                  zoom: locatedAttraction ? 16 : group.zoom,
                }}
                attractions={attractions}
                onAttractionClick={(attraction) => {
                  router.push(`/attractions/${attraction.id}`);
                }}
              />
            </div>

            <div className="flex flex-1 flex-col gap-4 overflow-x-hidden">
              <GroupInfoCard group={group} />

              <div className="overflow-x-auto">
                {attractions.length === 0 ? (
                  <EmptyAttractionsState
                    onAddAttraction={() => setIsAddAttractionDialogOpen(true)}
                  />
                ) : (
                  <AttractionTable
                    attractions={attractions}
                    onDelete={handleDeleteAttraction}
                    onUpdate={handleUpdateAttraction}
                    onLocate={handleLocateAttraction}
                  />
                )}
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <GroupInfoCard group={group} />
            </div>

            <div>
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
