"use client";

import { useState, useMemo } from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Group, CreateGroupRequest, GroupWithAttractions } from "@/types/group";
import { NewGroupDialog } from "@/components/group/NewGroupDialog";
import { GroupCard } from "@/components/group/GroupCard";
import { EmptyListState } from "@/components/group/EmptyListState";
import { MultiSelect } from "@/components/ui/MultiSelect";
import { FoundCountStub, LoadingStub } from "@/components/ui/stubs";
import { useQueryParams } from "@/hooks/useQueryParams";
import { useFiltersInitialOptions } from "@/hooks/useFiltersInitialOptions";
import { useIsMobile } from "@/hooks/useIsMobile";
import { Map } from "@/components/ui/Map";
import { GroupTable } from "@/components/group/GroupTable";
import { DEFAULT_GROUP_ZOOM } from "@/lib/constants";
import { useRouter } from "next/navigation";
import { useLocation } from "@/hooks/useLocation";
import { useUpdateRequests } from "@/hooks/useUpdateRequests";
import { useData } from "@/contexts/DataContext";

export default function GroupsPage() {
  const router = useRouter();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    selectedTag,
    setSelectedTag,
    searchQuery,
    setSearchQuery,
    selectedZoom,
    setSelectedZoom,
    selectedCoordinates,
    setSelectedCoordinates,
  } = useQueryParams(["tag", "zoom", "coordinates"] as const);
  const { isWideScreen } = useIsMobile();
  const { location, setLocation } = useLocation({
    selectedZoom,
    setSelectedZoom,
    selectedCoordinates,
    setSelectedCoordinates,
  });
  const { groups, isGroupsLoading, attractions, isAttractionsLoading } =
    useData();
  const isLoading = isGroupsLoading || isAttractionsLoading;
  const { createGroup, deleteGroup, updateGroup } = useUpdateRequests();

  // Получаем уникальные теги из всех групп
  const { allTags } = useFiltersInitialOptions({
    groups,
    attractions: [],
    selectedTag,
  });

  // Обработчик отправки формы создания группы
  const handleSubmit = async (formData: CreateGroupRequest) => {
    await createGroup(formData);
    // setGroups([...groups, newGroup]);
  };

  // Обработчик отправки формы обновления группы
  const getHandleUpdate =
    (groupId: string) => async (formData: CreateGroupRequest) => {
      await updateGroup(groupId, formData);
    };

  // Обработчик удаления группы
  const handleDeleteGroup = async (id: string) => {
    await deleteGroup(id);
  };

  const handleLocateGroup = (group: Group) => {
    setLocation({
      zoom: DEFAULT_GROUP_ZOOM,
      center: [group.coordinates[1], group.coordinates[0]],
    });
  };

  // Фильтрация групп по выбранным тегам и поисковому запросу
  const filteredGroups: GroupWithAttractions[] = useMemo(() => {
    let result = groups;

    // Фильтрация по тегам
    if (selectedTag.length > 0) {
      result = result.filter((group) => {
        if (!group.tag) return false;
        return selectedTag.includes(group.tag);
      });
    }

    // Фильтрация по поисковому запросу
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(
        (group) =>
          group.name.toLowerCase().includes(query) ||
          group.description.toLowerCase().includes(query),
      );
    }

    return result.map((item) => ({
      ...item,
      attractions: attractions.filter(
        (attraction) => attraction.groupId === item.id,
      ),
    }));
  }, [groups, selectedTag, searchQuery, attractions]);

  if (isLoading) {
    return <LoadingStub />;
  }

  const hasFilters = selectedTag.length > 0 || searchQuery.trim();

  const emptyState = (
    <EmptyListState
      onButtonClick={() => setIsCreateDialogOpen(true)}
      message={
        hasFilters
          ? "Нет групп, соответствующих фильтрам"
          : "Нет доступных групп"
      }
      description={
        hasFilters
          ? "Попробуйте изменить фильтры или создайте новую группу."
          : "У вас пока нет созданных групп. Создайте свою первую группу, чтобы начать добавлять объекта."
      }
      buttonLabel="Создать группу"
    />
  );

  return (
    <ProtectedRoute>
      <div
        className={`container lg:max-w-full mx-auto pt-20 px-4 pb-8 flex flex-col gap-4 ${isWideScreen ? "overflow-hidden" : ""}`}
        style={isWideScreen ? { height: "calc(100vh)" } : {}}
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          {/* Фильтры по тегам и поиск */}
          <div className="w-full space-y-4 md:space-y-0 md:space-x-4 md:flex md:flex-row md:w-auto md:items-center">
            <div className="flex-1 shrink-0">
              <input
                type="text"
                placeholder="Поиск..."
                className="w-full h-10 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <MultiSelect
              options={allTags}
              selectedOptions={selectedTag}
              onSelectionChange={setSelectedTag}
              placeholder="Фильтровать по регионам"
            />
            <FoundCountStub
              count={filteredGroups.length}
              hasFilters={selectedTag.length > 0 || !!searchQuery.trim()}
            />
          </div>
          <NewGroupDialog
            handleSubmit={handleSubmit}
            isOpen={isCreateDialogOpen}
            setIsOpen={setIsCreateDialogOpen}
            isSubmitting={isSubmitting}
            setIsSubmitting={setIsSubmitting}
            selectedTag={selectedTag.length === 1 ? selectedTag[0] : undefined}
          />
        </div>

        {isWideScreen ? (
          <div
            className="flex-1 flex flex-row gap-4"
            style={{ height: "calc(100vh - 150px)" }}
          >
            <div style={{ height: "100%", minWidth: "800px" }}>
              <Map
                location={location}
                setLocation={setLocation}
                items={filteredGroups}
                onItemClick={(id) => {
                  router.push(`/groups/${id}`);
                }}
              />
            </div>

            <div className="overflow-x-auto flex-1">
              {filteredGroups.length === 0 ? (
                emptyState
              ) : (
                <GroupTable
                  groups={filteredGroups}
                  onDelete={handleDeleteGroup}
                  onUpdate={getHandleUpdate}
                  onLocate={handleLocateGroup}
                />
              )}
            </div>
          </div>
        ) : filteredGroups.length === 0 ? (
          emptyState
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredGroups.map((group) => (
              <GroupCard
                key={group.id}
                group={group}
                onDelete={handleDeleteGroup}
                onUpdate={getHandleUpdate(group.id)}
              />
            ))}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
