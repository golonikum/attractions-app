"use client";

import { useState, useEffect, useMemo } from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Group, CreateGroupRequest } from "@/types/group";
import {
  getAllGroups,
  createGroup,
  deleteGroup,
  updateGroup,
} from "@/services/groupService";
import { toast } from "sonner";
import { NewGroupDialog } from "@/components/group/NewGroupDialog";
import { GroupCard } from "@/components/group/GroupCard";
import { EmptyListState } from "@/components/group/EmptyListState";
import { MultiSelect } from "@/components/ui/MultiSelect";
import { LoadingStub } from "@/components/ui/stubs";
import { useQueryParams } from "@/hooks/useQueryParams";
import { useFiltersInitialOptions } from "@/hooks/useFiltersInitialOptions";
import { useQuerySearch } from "@/hooks/useQuerySearch";
import { useIsMobile } from "@/hooks/useIsMobile";
import { Map } from "@/components/ui/Map";
import { GroupTable } from "@/components/group/GroupTable";
import { DEFAULT_LOCATION } from "@/lib/constants";
import { useRouter } from "next/navigation";

export default function GroupsPage() {
  const router = useRouter();
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { selectedTag, setSelectedTag } = useQueryParams(["tag"]);
  const { searchQuery, setSearchQuery } = useQuerySearch(selectedTag);
  const { isWideScreen } = useIsMobile();
  const [locatedGroup, setLocatedGroup] = useState<Group | null>(null);

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

  // Получаем уникальные теги из всех групп
  const { allTags } = useFiltersInitialOptions({
    groups,
    attractions: [],
    selectedTag,
  });

  // Обработчик отправки формы создания группы
  const handleSubmit = async (formData: CreateGroupRequest) => {
    const newGroup = await createGroup(formData);
    setGroups([...groups, newGroup]);
  };

  // Обработчик отправки формы обновления группы
  const getHandleUpdate =
    (groupId: string) => async (formData: CreateGroupRequest) => {
      const updatedGroup = await updateGroup(groupId, formData);
      const index = groups.findIndex((item) => item.id === groupId);

      if (index !== -1) {
        const newGroups = [...groups];
        newGroups.splice(index, 1, updatedGroup);
        setGroups(newGroups);
      }
    };

  // Обработчик удаления группы
  const handleDeleteGroup = async (id: string) => {
    try {
      await deleteGroup(id);
      setGroups(groups.filter((group) => group.id !== id));
      toast.success("Группа успешно удалена");
    } catch (error) {
      toast.error("Не удалось удалить группу");
    }
  };

  const handleLocateGroup = (group: Group) => {
    setLocatedGroup(group);
  };

  // Фильтрация групп по выбранным тегам и поисковому запросу
  const filteredGroups = useMemo(() => {
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

    return result;
  }, [groups, selectedTag, searchQuery]);

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
            <div className="flex-1 shrink-0">
              Найдено{" "}
              <span className={filteredGroups.length ? "font-bold" : ""}>
                {filteredGroups.length}
              </span>
            </div>
          </div>
          <NewGroupDialog
            handleSubmit={handleSubmit}
            isOpen={isCreateDialogOpen}
            setIsOpen={setIsCreateDialogOpen}
            isSubmitting={isSubmitting}
            setIsSubmitting={setIsSubmitting}
          />
        </div>

        {isWideScreen ? (
          <div
            className="flex-1 flex flex-row gap-4"
            style={{ height: "calc(100vh - 150px)" }}
          >
            <div style={{ height: "100%", minWidth: "600px" }}>
              <Map
                location={{
                  center: locatedGroup
                    ? [locatedGroup.coordinates[1], locatedGroup.coordinates[0]]
                    : DEFAULT_LOCATION.center,
                  zoom: locatedGroup
                    ? locatedGroup.zoom
                    : DEFAULT_LOCATION.zoom,
                }}
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
