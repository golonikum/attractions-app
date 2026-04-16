import { useData } from '@/contexts/DataContext';
import { createAttraction, deleteAttraction, updateAttraction } from '@/services/attractionService';
import { createGroup, deleteGroup, updateGroup } from '@/services/groupService';
import { CreateAttractionRequest, UpdateAttractionRequest } from '@/types/attraction';
import { CreateGroupRequest, UpdateGroupRequest } from '@/types/group';

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
        setGroups((groups) => {
          const newGroups = [...groups];
          const index = groups.findIndex((item) => item.id === id);

          if (index !== -1) {
            newGroups.splice(index, 1, updatedGroup);
          }

          return newGroups;
        });
        reload({ groups: true });
      }

      return updatedGroup;
    },
    deleteGroup: async (id: string) => {
      await deleteGroup(id);
      setGroups((groups) => groups.filter((group) => group.id !== id));
      reload({ groups: true });
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
        setAttractions((attractions) => {
          const newAttractions = [...attractions];
          const index = attractions.findIndex((item) => item.id === id);

          if (index !== -1) {
            newAttractions.splice(index, 1, updatedAttraction);
          }

          return newAttractions;
        });
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
