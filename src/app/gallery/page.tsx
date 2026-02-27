'use client';

import { useMemo } from 'react';
import ImageGallery from 'react-image-gallery';

import { useData } from '@/contexts/DataContext';
import { useFiltersInitialOptions } from '@/hooks/useFiltersInitialOptions';
import { useIsMobile } from '@/hooks/useIsMobile';
import { useQueryParams } from '@/hooks/useQueryParams';

import { EmptyListState } from '@/components/group/EmptyListState';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { MultiSelect } from '@/components/ui/MultiSelect';
import { FoundCountStub, LoadingStub } from '@/components/ui/stubs';

import '../gallery.css';

export default function GalleryPage() {
  const { isMobile } = useIsMobile();
  const { selectedTag, setSelectedTag, selectedGroup, setSelectedGroup, selectedCategory, setSelectedCategory } =
    useQueryParams(['tag', 'group', 'category']);
  const { groups, isGroupsLoading, attractions, isAttractionsLoading } = useData();
  const isLoading = isGroupsLoading || isAttractionsLoading;
  const { allCategories, allGroups, allTags } = useFiltersInitialOptions({
    groups,
    attractions,
    selectedTag,
  });

  // Фильтрация
  const photos = useMemo(() => {
    let filteredGroups = groups;

    // Фильтрация по тегам
    if (selectedTag.length > 0) {
      filteredGroups = filteredGroups.filter((group) => {
        if (!group.tag) {
          return false;
        }

        return selectedTag.includes(group.tag);
      });
    }

    // Фильтрация по группам
    if (selectedGroup.length > 0) {
      filteredGroups = filteredGroups.filter((group) => selectedGroup.includes(group.name));
    }

    const groupsIds = filteredGroups.map((group) => group.id);
    const result = attractions
      .filter((item) => groupsIds.includes(item.groupId))
      .filter((item) => !selectedCategory.length || (item.category && selectedCategory.includes(item.category)))
      .filter((item) => !!item.imageUrl)
      .map((item) => ({
        original: item.imageUrl!,
        thumbnail: item.imageUrl!,
        originalAlt: item.name,
        description: `${filteredGroups.find((group) => group.id === item.groupId)?.name}: ${item.name}`,
      }));

    return result;
  }, [groups, attractions, selectedTag, selectedGroup, selectedCategory]);

  if (isLoading) {
    return <LoadingStub />;
  }

  return (
    <ProtectedRoute>
      <div className="container lg:max-w-full mx-auto pt-20 px-4 pb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
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
            <MultiSelect
              options={allCategories}
              selectedOptions={selectedCategory}
              onSelectionChange={setSelectedCategory}
              placeholder="Фильтровать по категориям"
            />
            <FoundCountStub
              count={photos.length}
              hasFilters={selectedCategory.length > 0 || selectedGroup.length > 0 || selectedTag.length > 0}
            />
          </div>
        </div>

        {photos.length === 0 ? (
          <EmptyListState
            message={selectedTag.length > 0 ? 'Нет фотографий, соответствующих фильтрам' : 'Нет доступных фотографий'}
          />
        ) : (
          <div className={isMobile ? 'mobile' : ''}>
            <ImageGallery
              items={photos}
              lazyLoad={true}
              showThumbnails={!isMobile}
              thumbnailPosition={isMobile ? 'bottom' : 'left'}
              showBullets={!isMobile && photos.length < 30}
              slideInterval={5000}
            />
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
