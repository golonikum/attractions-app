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

  // Получаем теги из URL параметров
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tagsParam = params.get("tag");

    if (tagsParam) {
      setSelectedTags(tagsParam.split(","));
    }
  }, []);

  // Обновляем URL при изменении выбранных тегов
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    if (selectedTags.length > 0) {
      params.set("tag", selectedTags.join(","));
    } else {
      params.delete("tag");
    }

    const newUrl = `${window.location.pathname}?${params.toString()}`;
    console.log("newUrl", newUrl);
    window.history.replaceState({}, "", newUrl);
  }, [selectedTags]);

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

  // Фильтрация групп по выбранным тегам
  const filteredGroups = useMemo(() => {
    if (selectedTags.length === 0) {
      return groups;
    }

    return groups.filter((group) => {
      if (!group.tag) return false;
      return selectedTags.includes(group.tag);
    });
  }, [groups, selectedTags]);

  return (
    <ProtectedRoute>
      <Navigation />
      <div className="container mx-auto pt-20 px-4 pb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
          {/* Фильтры по тегам */}
          <div className="w-full md:w-auto">
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
              selectedTags.length > 0
                ? "Нет групп с выбранными тегами"
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
