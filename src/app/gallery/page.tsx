"use client";

import { useState, useEffect, useMemo } from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Group } from "@/types/group";
import { getAllGroups } from "@/services/groupService";
import { toast } from "sonner";
import { MultiSelect } from "@/components/ui/MultiSelect";
import { LoadingStub } from "@/components/ui/stubs";
import { Attraction } from "@/types/attraction";
import { getAllAttractions } from "@/services/attractionService";
import ImageGallery from "react-image-gallery";
import "../gallery.css";
import { useIsMobile } from "@/hooks/useIsMobile";
import { EmptyListState } from "@/components/group/EmptyListState";
import { useQueryParams } from "@/hooks/useQueryParams";
import { useFiltersInitialOptions } from "@/hooks/useFiltersInitialOptions";

export default function GalleryPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [attractions, setAttractions] = useState<Attraction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { isMobile } = useIsMobile();

  const {
    selectedTag,
    setSelectedTag,
    selectedGroup,
    setSelectedGroup,
    selectedCategory,
    setSelectedCategory,
  } = useQueryParams(["tag", "group", "category"]);

  // Загрузка данных при монтировании компонента
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [groupsData, attractionsData] = await Promise.all([
          await getAllGroups(),
          await getAllAttractions(),
        ]);

        setGroups(groupsData);
        setAttractions(attractionsData);
      } catch (error) {
        toast.error("Не удалось загрузить данные");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

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
        if (!group.tag) return false;
        return selectedTag.includes(group.tag);
      });
    }

    // Фильтрация по группам
    if (selectedGroup.length > 0) {
      filteredGroups = filteredGroups.filter((group) => {
        return selectedGroup.includes(group.name);
      });
    }

    const groupsIds = filteredGroups.map((group) => group.id);
    const result = attractions
      .filter((item) => groupsIds.includes(item.groupId))
      .filter(
        (item) =>
          !selectedCategory.length ||
          (item.category && selectedCategory.includes(item.category)),
      )
      .filter((item) => !!item.imageUrl)
      .map((item) => ({
        original: item.imageUrl!,
        thumbnail: item.imageUrl!,
        originalAlt: item.name,
        description: `${filteredGroups.find((group) => group.id === item.groupId)?.name}: ${item.name}`,
      }));

    return result;
  }, [groups, attractions, , selectedTag, selectedGroup, selectedCategory]);

  if (isLoading) {
    return <LoadingStub />;
  }

  return (
    <ProtectedRoute>
      <div className="container mx-auto pt-20 px-4 pb-8">
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
            <div className="flex-1 shrink-0">
              Найдено{" "}
              <span className={photos.length ? "font-bold" : ""}>
                {photos.length}
              </span>
            </div>
          </div>
        </div>

        {photos.length === 0 ? (
          <EmptyListState
            message={
              selectedTag.length > 0
                ? "Нет фотографий, соответствующих фильтрам"
                : "Нет доступных фотографий"
            }
          />
        ) : (
          <div className={isMobile ? "mobile" : ""}>
            <ImageGallery
              items={photos}
              lazyLoad={true}
              showThumbnails={!isMobile}
              thumbnailPosition={isMobile ? "bottom" : "left"}
              showBullets={!isMobile && photos.length < 30}
            />
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
