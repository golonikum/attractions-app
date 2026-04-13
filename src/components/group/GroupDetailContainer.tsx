'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { useData } from '@/contexts/DataContext';
import { useIsMobile } from '@/hooks/useIsMobile';
import { useLocation } from '@/hooks/useLocation';
import { useQueryParams } from '@/hooks/useQueryParams';
import { useUpdateRequests } from '@/hooks/useUpdateRequests';
import { DEFAULT_ATTRACTION_ZOOM } from '@/lib/constants';
import { locateItemOnMainMapHref } from '@/lib/locateItemOnMainMapHref';
import { updateOrder } from '@/services/attractionService';
import { updateGroup } from '@/services/groupService';
import { Attraction, CreateAttractionRequest } from '@/types/attraction';
import { CreateGroupRequest, Group } from '@/types/group';

import { AttractionCard } from '@/components/attraction/AttractionCard';
import { AttractionTable } from '@/components/attraction/AttractionTable';
import { NewAttractionDialog } from '@/components/attraction/NewAttractionDialog';
import { EmptyListState } from '@/components/group/EmptyListState';
import { GroupInfoCard } from '@/components/group/GroupInfoCard';
import { NewGroupDialog } from '@/components/group/NewGroupDialog';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { BackButton, ShowOnMapButton } from '@/components/ui/buttons';
import { Map } from '@/components/ui/Map';

export default function GroupDetailContainer() {
  // UGLYHACK: to avoid useParams re-rendering
  const pathName = window.document.location.pathname;
  const groupId = pathName.match(/\/groups\/.+/) ? pathName.replace(/^.+groups\/(.+)$/gim, '$1') : '';

  const { groups, attractions: allAttractions, setAttractions } = useData();
  const attractions = allAttractions.filter((attraction) => attraction.groupId === groupId);
  const { selectedZoom, setSelectedZoom, selectedCoordinates, setSelectedCoordinates } = useQueryParams([
    'tag',
    'zoom',
    'coordinates',
  ]);
  const { location, setLocation } = useLocation({
    selectedZoom,
    setSelectedZoom,
    selectedCoordinates,
    setSelectedCoordinates,
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const [group, setGroup] = useState<Group | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAddAttractionDialogOpen, setIsAddAttractionDialogOpen] = useState(false);
  const [isSubmittingAttraction, setIsSubmittingAttraction] = useState(false);
  const { isWideScreen } = useIsMobile();
  const { createAttraction, deleteAttraction, updateAttraction } = useUpdateRequests();

  useEffect(() => {
    if (groupId && groups.length) {
      const foundGroup = groups.find((g) => g.id === groupId);

      if (foundGroup) {
        setGroup(foundGroup);
        setLocation({
          center: [foundGroup.coordinates[1], foundGroup.coordinates[0]],
          zoom: foundGroup.zoom,
        });
      }
    }
  }, [groupId, groups]);

  // Обработчик отправки формы редактирования группы
  const handleSubmit = async (formData: CreateGroupRequest) => {
    const { data } = await updateGroup(groupId, formData);
    setGroup(data.group);
  };

  // Обработчик удаления объекта
  const handleDeleteAttraction = async (id: string) => {
    try {
      await deleteAttraction(id);
      setAttractions((items) => items.filter((attraction) => attraction.id !== id));
      toast.success('Объект успешно удален');
    } catch (error) {
      toast.error('Не удалось удалить объект');
    }
  };

  // Обработчик добавления объекта
  const handleAddAttraction = async (formData: CreateAttractionRequest) => {
    const newAttraction = await createAttraction({
      ...formData,
    });

    if (newAttraction) {
      setAttractions([...attractions, newAttraction]);
    }
  };

  // Обработчик обновления объекта
  /**
   * Handles updating an attraction with the provided data
   * @param {string} id - The ID of the attraction to update
   * @returns {Function} An async function that takes updateData as parameter
   */
  const handleUpdateAttraction = (id: string) => async (updateData: CreateAttractionRequest) => {
    setIsUpdating(true);
    await updateAttraction(id, updateData);
    setIsUpdating(false);
  };

  const handleLocateAttraction = (attraction: Attraction) => {
    setLocation({
      center: [attraction.coordinates[1], attraction.coordinates[0]],
      zoom: DEFAULT_ATTRACTION_ZOOM,
    });
  };

  const handleUpdateOrder = async (items: Attraction[]) => {
    setAttractions(items);

    try {
      setIsUpdating(true);
      await updateOrder(
        groupId,
        items.map(({ id }, index) => ({ id, order: index + 1 })),
      );
    } catch (e) {
      toast.error('Не получилось поменять порядок');
    } finally {
      setIsUpdating(false);
    }
  };

  if (!group) {
    return null; // TODO: Skeleton
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
        className={`container lg:max-w-full mx-auto pt-20 px-4 pb-8 flex flex-col gap-4 ${
          isWideScreen ? 'overflow-hidden h-screen' : ''
        }`}
      >
        <div className="flex items-center">
          <BackButton route="/groups" />
          <div className="ml-auto flex space-x-1">
            <ShowOnMapButton view="icon" href={locateItemOnMainMapHref(group)} />
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
          <div className="flex-1 flex flex-row gap-4 h-[calc(100vh-150px)]">
            <div className="h-full min-w-[600px]">
              <Map
                location={location}
                setLocation={setLocation}
                items={attractions}
                getLink={(id) => `/attractions/${id}`}
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
                    isDisabled={isUpdating}
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
