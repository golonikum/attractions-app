"use client";

import { useState, useEffect } from "react";
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

export default function GroupsPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  // Обработчик отправки формы создания группы
  const handleSubmit = async (formData: CreateGroupRequest) => {
    const newGroup = await createGroup(formData);
    setGroups([...groups, newGroup]);
  };

  // Обработчик отправки формы обновления группы
  const getHandleUpdate =
    (groupId: string) => async (formData: CreateGroupRequest) => {
      const updatedGroup = await updateGroup(groupId, formData);
      setGroups([...groups, updatedGroup]);
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

  return (
    <ProtectedRoute>
      <Navigation />
      <div className="container mx-auto pt-20 px-4 pb-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold"></h1>
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
        ) : groups.length === 0 ? (
          <EmptyGroupsState onCreateGroup={() => setIsCreateDialogOpen(true)} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groups.map((group) => (
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
