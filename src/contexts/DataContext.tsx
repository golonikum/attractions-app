'use client';

import { createContext, Dispatch, SetStateAction, useContext, useMemo, useState } from 'react';

import { Attraction } from '@/types/attraction';
import { Group } from '@/types/group';

type DataProviderProps = {
  groups: Group[];
  attractions: Attraction[];
  children: React.ReactNode;
};

type DataProviderState = {
  groups: Group[];
  setGroups: Dispatch<SetStateAction<Group[]>>;
  attractions: Attraction[];
  setAttractions: Dispatch<SetStateAction<Attraction[]>>;
  attractionsMap: Record<string, Attraction[]>;
};

const initialState: DataProviderState = {
  groups: [],
  setGroups: () => {},
  attractions: [],
  setAttractions: () => {},
  attractionsMap: {},
};

export const DataProviderContext = createContext<DataProviderState>(initialState);

export function DataProvider({
  children,
  attractions: initialAttractions,
  groups: initialGroups,
  ...props
}: DataProviderProps) {
  const [groups, setGroups] = useState<Group[]>(initialGroups);
  const [attractions, setAttractions] = useState<Attraction[]>(initialAttractions);

  const attractionsMap = useMemo(
    () =>
      attractions.reduce(
        (res, cur) => {
          if (!res[cur.groupId]) {
            res[cur.groupId] = [cur];
          } else {
            res[cur.groupId].push(cur);
          }

          return res;
        },
        {} as Record<string, Attraction[]>,
      ),
    [attractions],
  );

  const value: DataProviderState = {
    groups,
    setGroups,
    attractions,
    setAttractions,
    attractionsMap,
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
