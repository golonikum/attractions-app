"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { CreateGroupRequest, Group } from "@/types/group";
import { getGroupById, updateGroup } from "@/services/groupService";
import { toast } from "sonner";
import { AttractionCard } from "@/components/attraction/AttractionCard";
import { AttractionTable } from "@/components/attraction/AttractionTable";
import { GroupInfoCard } from "@/components/group/GroupInfoCard";
import { Attraction, CreateAttractionRequest } from "@/types/attraction";
import {
  getAttractionsByGroupId,
  createAttraction,
  deleteAttraction,
  updateAttraction,
  updateOrder,
} from "@/services/attractionService";
import { NewAttractionDialog } from "@/components/attraction/NewAttractionDialog";
import { NewGroupDialog } from "@/components/group/NewGroupDialog";
import { useIsMobile } from "@/hooks/useIsMobile";
import { BackButton, ShowOnMapButton } from "@/components/ui/buttons";
import { Map } from "@/components/ui/Map";
import { LoadingStub, NotFoundStub } from "@/components/ui/stubs";
import { DEFAULT_ATTRACTION_ZOOM } from "@/lib/constants";
import { EmptyListState } from "@/components/group/EmptyListState";
import { useQueryParams } from "@/hooks/useQueryParams";
import { useLocation } from "@/hooks/useLocation";
import { locateItemOnMainMap } from "@/lib/locateItemOnMainMap";

export default function GroupDetailPage() {
  const router = useRouter();

  // UGLYHACK: to avoid useParams re-rendering
  const pathName = document.location.pathname;
  const groupId = pathName.match(/\/groups\/.+/)
    ? pathName.replace(/^.+groups\/(.+)$/gim, "$1")
    : "";

  const {
    selectedZoom,
    setSelectedZoom,
    selectedCoordinates,
    setSelectedCoordinates,
  } = useQueryParams(["tag", "zoom", "coordinates"] as const);
  const { location, setLocation } = useLocation({
    selectedZoom,
    setSelectedZoom,
    selectedCoordinates,
    setSelectedCoordinates,
  });
  const [isOrderChanging, setIsOrderChanging] = useState(false);
  const [group, setGroup] = useState<Group | null>(null);
  const [attractions, setAttractions] = useState<Attraction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAddAttractionDialogOpen, setIsAddAttractionDialogOpen] =
    useState(false);
  const [isSubmittingAttraction, setIsSubmittingAttraction] = useState(false);
  const { isWideScreen } = useIsMobile();

  // Загрузка данных группы при монтировании компонента
  useEffect(() => {
    const fetchGroupData = async () => {
      try {
        const groupData = await getGroupById(groupId);
        setGroup(groupData);
        setLocation({
          center: [groupData.coordinates[1], groupData.coordinates[0]],
          zoom: groupData.zoom,
        });

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

    if (groupId) {
      fetchGroupData();
    }
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
    setLocation({
      center: [attraction.coordinates[1], attraction.coordinates[0]],
      zoom: DEFAULT_ATTRACTION_ZOOM,
    });
  };

  const handleUpdateOrder = async (attractions: Attraction[]) => {
    setAttractions(attractions);

    try {
      setIsOrderChanging(true);
      await updateOrder(
        groupId,
        attractions.map(({ id }, index) => ({ id, order: index + 1 })),
      );
    } catch (e) {
      toast.error("Не получилось поменять порядок");
    } finally {
      setIsOrderChanging(false);
    }
  };

  if (isLoading) {
    return <LoadingStub />;
  }

  if (!group) {
    return <NotFoundStub message="Группа не найдена" />;
  }

  const emptyState = (
    <EmptyListState
      buttonLabel="Добавить объект"
      onButtonClick={() => setIsAddAttractionDialogOpen(true)}
      message="Нет объектов"
      description="У этой группы пока нет объектов. Добавьте первый, чтобы начать."
    />
  );

  return (
    <ProtectedRoute>
      <div
        className={`container lg:max-w-full mx-auto pt-20 px-4 pb-8 flex flex-col gap-4 ${isWideScreen ? "overflow-hidden" : ""}`}
        style={isWideScreen ? { height: "calc(100vh)" } : {}}
      >
        <div className="flex items-center">
          <BackButton route="/groups" />
          <div className="ml-auto flex space-x-1">
            <ShowOnMapButton
              view="icon"
              onClick={() => {
                locateItemOnMainMap({ router, item: group });
              }}
            />
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
              attractionsCount={attractions.length}
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
                location={location}
                setLocation={setLocation}
                items={attractions}
                onItemClick={(id) => {
                  router.push(`/attractions/${id}`);
                }}
              />
            </div>

            <div className="flex flex-1 flex-col gap-4 overflow-x-hidden">
              <GroupInfoCard group={group} attractions={attractions} />

              <div className="overflow-x-auto">
                {attractions.length === 0 ? (
                  emptyState
                ) : (
                  <AttractionTable
                    attractions={attractions}
                    isDisabled={isOrderChanging}
                    onOrderChanged={handleUpdateOrder}
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
            <GroupInfoCard group={group} attractions={attractions} />

            <div>
              {attractions.length === 0 ? (
                emptyState
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
