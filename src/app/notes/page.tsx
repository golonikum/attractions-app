'use client';

import { useCallback, useEffect, useState } from 'react';

import { useData } from '@/contexts/DataContext';
import { useDebounceCallback } from '@/hooks/useDebounceCallback';
import { useFiltersInitialOptions } from '@/hooks/useFiltersInitialOptions';
import { useIsMobile } from '@/hooks/useIsMobile';
import { useQueryParams } from '@/hooks/useQueryParams';
import { Attraction, NoteWithAttractionIdType } from '@/types/attraction';

import { EmptyListState } from '@/components/group/EmptyListState';
import { NoteCard } from '@/components/note/NoteCard';
import { NotesTable } from '@/components/note/NotesTable';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { MultiSelect } from '@/components/ui/MultiSelect';
import { FoundCountStub, LoadingStub } from '@/components/ui/stubs';

const extractNotesFromAttractions = (attractions: Attraction[], searchQuery?: string) => {
  let notes: NoteWithAttractionIdType[] = [];

  attractions.forEach((item) => {
    if (item.notes) {
      item.notes.forEach((note) => {
        notes.push({
          ...note,
          attractionId: item.id,
        });
      });
    }
  });

  if (searchQuery) {
    notes = notes.filter((item) => item.note.toLowerCase().includes(searchQuery));
  }

  notes.sort((a, b) => (a.date > b.date ? -1 : 1));

  return notes;
};

export default function NotesPage() {
  const { isWideScreen } = useIsMobile();
  const { selectedTag, setSelectedTag, selectedGroup, setSelectedGroup, searchQuery, setSearchQuery } = useQueryParams([
    'tag',
    'group',
  ]);
  const { attractions, groups, isAttractionsLoading, isGroupsLoading } = useData();
  const [foundNotes, setFoundNotes] = useState<NoteWithAttractionIdType[]>(extractNotesFromAttractions(attractions));
  const { allTags, allGroups } = useFiltersInitialOptions({
    groups,
    attractions,
    selectedTag,
  });

  const onSearch = useCallback(() => {
    const selectedGroupIds = groups
      .filter((item) => !selectedTag.length || (item.tag && selectedTag.includes(item.tag)))
      .filter((item) => !selectedGroup.length || selectedGroup.includes(item.name))
      .map((item) => item.id);

    const filteredAttractions = attractions
      .filter((item) => !selectedGroupIds.length || selectedGroupIds.includes(item.groupId))
      .filter((item) => {
        const search = searchQuery.toLowerCase();
        const lowerNotes = (item.notes || [])
          .map(({ note }) => note)
          .join(' ')
          .toLowerCase();

        return lowerNotes.includes(search);
      });

    setFoundNotes(extractNotesFromAttractions(filteredAttractions, searchQuery.toLowerCase()));
  }, [searchQuery, attractions, groups, selectedGroup, selectedTag]);

  const debounceSearch = useDebounceCallback(onSearch, 500);

  useEffect(() => {
    debounceSearch();
  }, [searchQuery, debounceSearch]);

  if (isAttractionsLoading || isGroupsLoading) {
    return <LoadingStub />;
  }

  const hasFilters = !!searchQuery || !!selectedTag.length || !!selectedGroup.length;

  const emptyState = (
    <EmptyListState
      message={hasFilters ? 'Нет заметок, соответствующих фильтрам' : 'Нет заметок'}
      description={hasFilters ? 'Попробуйте изменить фильтры.' : 'У вас пока нет заметок.'}
    />
  );

  return (
    <ProtectedRoute>
      <div
        className={`container lg:max-w-full mx-auto pt-20 px-4 pb-8 flex flex-col gap-4 ${
          isWideScreen ? 'overflow-hidden' : ''
        }`}
        style={isWideScreen ? { height: 'calc(100vh)' } : {}}
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="w-full space-y-4 md:space-y-0 md:space-x-4 md:flex md:flex-row md:w-auto md:items-center">
            <MultiSelect
              options={allTags}
              selectedOptions={selectedTag}
              onSelectionChange={setSelectedTag}
              placeholder="Фильтровать по регионам"
            />
            <MultiSelect
              options={allGroups}
              selectedOptions={selectedGroup}
              onSelectionChange={setSelectedGroup}
              placeholder="Фильтровать по городам"
            />
            <div className="flex-1 shrink-0">
              <input
                type="text"
                placeholder="Поиск..."
                className="w-full min-w-80 h-10 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <FoundCountStub count={foundNotes.length} hasFilters={hasFilters} />
          </div>
        </div>

        {isWideScreen ? (
          <div className="flex-1 flex flex-row gap-4" style={{ height: 'calc(100vh - 150px)' }}>
            <div className="overflow-x-auto flex-1">
              {foundNotes.length === 0 ? emptyState : <NotesTable notes={foundNotes} />}
            </div>
          </div>
        ) : (
          <>
            {foundNotes.length === 0 ? (
              emptyState
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {foundNotes.map((note, index) => (
                  <NoteCard key={index} note={note} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </ProtectedRoute>
  );
}
