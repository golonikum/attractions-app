import { useData } from "@/contexts/DataContext";
import { createGroup, deleteGroup, updateGroup } from "@/services/groupService";
import { CreateGroupRequest, UpdateGroupRequest } from "@/types/group";
import { toast } from "sonner";

export const useUpdateRequests = () => {
  const { setGroups } = useData();

  return {
    createGroup: async (groupData: CreateGroupRequest) => {
      const newGroup = await createGroup(groupData);
      setGroups((groups) => [newGroup, ...groups]);
      return newGroup;
    },
    updateGroup: async (groupId: string, formData: UpdateGroupRequest) => {
      const updatedGroup = await updateGroup(groupId, formData);

      setGroups((groups) => {
        const newGroups = [...groups];
        const index = groups.findIndex((item) => item.id === groupId);

        if (index !== -1) {
          newGroups.splice(index, 1, updatedGroup);
        }

        return newGroups;
      });

      return updatedGroup;
    },
    deleteGroup: async (groupId: string) => {
      try {
        await deleteGroup(groupId);
        setGroups((groups) => groups.filter((group) => group.id !== groupId));
        toast.success("Группа успешно удалена");
      } catch (error) {
        toast.error("Не удалось удалить группу");
      }
    },
  };
};
