'use client';

import { createContext, Dispatch, SetStateAction, useContext } from 'react';

import { useGetAllAttractions } from '@/hooks/useGetAllAttractions';
import { useGetAllGroups } from '@/hooks/useGetAllGroups';
import { Attraction } from '@/types/attraction';
import { Group } from '@/types/group';

type DataProviderProps = {
  children: React.ReactNode;
};

type DataProviderState = {
  groups: Group[];
  isGroupsLoading: boolean;
  setGroups: Dispatch<SetStateAction<Group[]>>;
  attractions: Attraction[];
  isAttractionsLoading: boolean;
  setAttractions: Dispatch<SetStateAction<Attraction[]>>;
  reload: (props?: { groups?: boolean; attractions?: boolean }) => Promise<void>;
};

const initialState: DataProviderState = {
  groups: [],
  isGroupsLoading: false,
  setGroups: () => {},
  attractions: [],
  isAttractionsLoading: false,
  setAttractions: () => {},
  reload: () => Promise.resolve(),
};

export const DataProviderContext = createContext<DataProviderState>(initialState);

export function DataProvider({ children, ...props }: DataProviderProps) {
  const {
    attractions,
    setAttractions,
    fetchData: fetchAttractions,
    isLoading: isAttractionsLoading,
  } = useGetAllAttractions();
  const { groups, setGroups, fetchData: fetchGroups, isLoading: isGroupsLoading } = useGetAllGroups();

  const value: DataProviderState = {
    groups,
    isGroupsLoading,
    setGroups,
    attractions,
    isAttractionsLoading,
    setAttractions,
    reload: async ({ groups: g, attractions: a } = {}) => {
      if (g) {
        await fetchGroups();
      }

      if (a) {
        await fetchAttractions();
      }
    },
  };

  return (
    <DataProviderContext.Provider {...props} value={value}>
      {children}
    </DataProviderContext.Provider>
  );
}

export const useData = () => {
  const context = useContext(DataProviderContext);

  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }

  return context;
};
