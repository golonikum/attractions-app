import { useData } from '@/contexts/DataContext';
import { createAttraction, deleteAttraction, updateAttraction } from '@/services/attractionService';
import { createGroup, deleteGroup, updateGroup } from '@/services/groupService';
import { CreateAttractionRequest, UpdateAttractionRequest } from '@/types/attraction';
import { CreateGroupRequest, UpdateGroupRequest } from '@/types/group';

/** Заменить элемент с тем же id; если его нет — список не меняется */
const replaceById = <T extends { id: string }>(items: T[], updated: T) =>
  items.map((item) => (item.id === updated.id ? updated : item));

export const useUpdateRequests = () => {
  const { setGroups, setAttractions, reload } = useData();

  return {
    // Groups
    createGroup: async (groupData: CreateGroupRequest) => {
      const { data } = await createGroup(groupData);
      const newGroup = data.group;

      if (newGroup) {
        setGroups((groups) => [newGroup, ...groups]);
        reload({ groups: true });
      }

      return newGroup;
    },
    updateGroup: async (id: string, formData: UpdateGroupRequest) => {
      const { data } = await updateGroup(id, formData);
      const updatedGroup = data.group;

      if (updatedGroup) {
        setGroups((groups) => replaceById(groups, updatedGroup));
        reload({ groups: true });
      }

      return updatedGroup;
    },
    deleteGroup: async (id: string) => {
      await deleteGroup(id);
      setGroups((groups) => groups.filter((group) => group.id !== id));
      // Сервер удаляет объекты города каскадом — убираем их и из общего списка на клиенте
      setAttractions((attractions) => attractions.filter((attraction) => attraction.groupId !== id));
      reload({ groups: true, attractions: true });
    },
    // Attractions
    createAttraction: async (attractionData: CreateAttractionRequest) => {
      const { data } = await createAttraction(attractionData);
      const newAttraction = data.attraction;

      if (newAttraction) {
        setAttractions((attractions) => [...attractions, newAttraction]);
        reload({ attractions: true });
      }

      return newAttraction;
    },
    updateAttraction: async (id: string, formData: UpdateAttractionRequest) => {
      const { data } = await updateAttraction(id, formData);
      const updatedAttraction = data.attraction;

      if (updatedAttraction) {
        setAttractions((attractions) => replaceById(attractions, updatedAttraction));
        reload({ attractions: true });
      }

      return updatedAttraction;
    },
    deleteAttraction: async (id: string) => {
      await deleteAttraction(id);
      setAttractions((attractions) => attractions.filter((attraction) => attraction.id !== id));
      reload({ attractions: true });
    },
  };
};
