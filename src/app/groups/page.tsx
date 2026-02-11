"use client";

import { useState, useEffect, useMemo } from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Navigation } from "@/components/Navigation";
import { Group, CreateGroupRequest } from "@/types/group";
import {
  getAllGroups,
  createGroup,
  deleteGroup,
  updateGroup,
} from "@/services/groupService";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { NewGroupDialog } from "@/components/group/NewGroupDialog";
import { GroupCard } from "@/components/group/GroupCard";
import { EmptyGroupsState } from "@/components/group/EmptyGroupsState";
import { MultiSelect } from "@/components/ui/MultiSelect";

export default function GroupsPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Получаем параметры из URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tagsParam = params.get("tag");
    const searchParam = params.get("search");

    if (tagsParam) {
      setSelectedTags(tagsParam.split(","));
    }

    if (searchParam) {
      setSearchQuery(searchParam);
    }
  }, []);

  // Обновляем URL при изменении фильтров
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    // Обработка тегов
    if (selectedTags.length > 0) {
      params.set("tag", selectedTags.join(","));
    } else {
      params.delete("tag");
    }

    // Обработка поиска
    if (searchQuery.trim()) {
      params.set("search", searchQuery.trim());
    } else {
      params.delete("search");
    }

    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState({}, "", newUrl);
  }, [selectedTags, searchQuery]);

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
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    groups.forEach((group) => {
      if (group.tag) {
        tags.add(group.tag);
      }
    });
    return Array.from(tags);
  }, [groups]);

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

  // Фильтрация групп по выбранным тегам и поисковому запросу
  const filteredGroups = useMemo(() => {
    let result = groups;

    // Фильтрация по тегам
    if (selectedTags.length > 0) {
      result = result.filter((group) => {
        if (!group.tag) return false;
        return selectedTags.includes(group.tag);
      });
    }

    // Фильтрация по поисковому запросу
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter((group) =>
        group.name.toLowerCase().includes(query),
      );
    }

    return result;
  }, [groups, selectedTags, searchQuery]);

  return (
    <ProtectedRoute>
      <Navigation />
      <div className="container mx-auto pt-20 px-4 pb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
          {/* Фильтры по тегам и поиск */}
          <div className="w-full space-y-4 md:space-y-0 md:space-x-4 md:flex md:flex-row md:w-auto md:items-center">
            <div className="w-full">
              <input
                type="text"
                placeholder="Поиск по названию"
                className="w-full h-10 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <MultiSelect
              options={allTags}
              selectedOptions={selectedTags}
              onSelectionChange={setSelectedTags}
              placeholder="Фильтровать по тегам"
            />
          </div>
          <NewGroupDialog
            handleSubmit={handleSubmit}
            isOpen={isCreateDialogOpen}
            setIsOpen={setIsCreateDialogOpen}
            isSubmitting={isSubmitting}
            setIsSubmitting={setIsSubmitting}
          />
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : filteredGroups.length === 0 ? (
          <EmptyGroupsState
            onCreateGroup={() => setIsCreateDialogOpen(true)}
            message={
              selectedTags.length > 0 || searchQuery.trim()
                ? "Нет групп, соответствующих фильтрам"
                : "Нет доступных групп"
            }
          />
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
