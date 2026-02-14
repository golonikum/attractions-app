"use client";

import { useState, useEffect, useMemo } from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Group } from "@/types/group";
import { getAllGroups } from "@/services/groupService";
import { toast } from "sonner";
import { EmptyGroupsState } from "@/components/group/EmptyGroupsState";
import { MultiSelect } from "@/components/ui/MultiSelect";
import { LoadingStub } from "@/components/ui/stubs";
import { Attraction } from "@/types/attraction";
import { getAllAttractions } from "@/services/attractionService";
import ImageGallery from "react-image-gallery";
import "../gallery.css";
// import Gallery from "react-photo-gallery"; // TODO
import { useIsMobile } from "@/hooks/useIsMobile";

export default function GalleryPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [attractions, setAttractions] = useState<Attraction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const { isMobile } = useIsMobile();

  // Получаем параметры из URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tagsParam = params.get("tag");
    const groupsParam = params.get("group");
    const categoriesParam = params.get("category");

    if (tagsParam) {
      setSelectedTags(tagsParam.split(","));
    }

    if (groupsParam) {
      setSelectedGroups(groupsParam.split(","));
    }

    if (categoriesParam) {
      setSelectedCategories(categoriesParam.split(","));
    }
  }, []);

  // TODO: вынести в хуки

  // Обновляем URL при изменении фильтров
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    // Обработка тегов
    if (selectedTags.length > 0) {
      params.set("tag", selectedTags.join(","));
    } else {
      params.delete("tag");
    }

    // Обработка групп
    if (selectedGroups.length > 0) {
      params.set("group", selectedGroups.join(","));
    } else {
      params.delete("group");
    }

    // Обработка категорий
    if (selectedCategories.length > 0) {
      params.set("category", selectedCategories.join(","));
    } else {
      params.delete("category");
    }

    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState({}, "", newUrl);
  }, [selectedTags, selectedGroups, selectedCategories]);

  // Загрузка данных при монтировании компонента
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [data1, data2] = await Promise.all([
          await getAllGroups(),
          await getAllAttractions(),
        ]);

        setGroups(data1);
        setAttractions(data2);
      } catch (error) {
        toast.error("Не удалось загрузить данные");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Получаем уникальные теги из всех групп
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    groups.forEach((group) => {
      if (group.tag) {
        tags.add(group.tag);
      }
    });
    return Array.from(tags).sort();
  }, [groups]);

  const allGroups = useMemo(() => {
    return groups
      .filter(
        (item) =>
          !selectedTags.length || (item.tag && selectedTags.includes(item.tag)),
      )
      .map((item) => item.name);
  }, [groups, selectedTags]);

  const allCategories = useMemo(() => {
    const categories = new Set<string>();
    attractions.forEach((item) => {
      if (item.category) {
        categories.add(item.category);
      }
    });
    return Array.from(categories).sort();
  }, [attractions]);

  // Фильтрация
  const { photos, mobilePhotos } = useMemo(() => {
    let filteredGroups = groups;

    // Фильтрация по тегам
    if (selectedTags.length > 0) {
      filteredGroups = filteredGroups.filter((group) => {
        if (!group.tag) return false;
        return selectedTags.includes(group.tag);
      });
    }

    // Фильтрация по группам
    if (selectedGroups.length > 0) {
      filteredGroups = filteredGroups.filter((group) => {
        return selectedGroups.includes(group.name);
      });
    }

    const groupsIds = filteredGroups.map((group) => group.id);
    const result = attractions
      .filter((item) => groupsIds.includes(item.groupId))
      .filter(
        (item) =>
          !selectedCategories.length ||
          (item.category && selectedCategories.includes(item.category)),
      )
      .filter((item) => !!item.imageUrl)
      .map((item) => ({
        original: item.imageUrl!,
        thumbnail: item.imageUrl!,
        originalAlt: item.name,
        description: `${filteredGroups.find((group) => group.id === item.groupId)?.name}: ${item.name}`,
      }));

    const mobileResult = result.map((item) => ({
      src: item.original,
      width: 1,
      height: 1,
    }));

    return { photos: result, mobilePhotos: mobileResult };
  }, [groups, attractions, , selectedTags, selectedGroups, selectedCategories]);

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
              selectedOptions={selectedTags}
              onSelectionChange={setSelectedTags}
              placeholder="Фильтровать по регионам"
            />
            <MultiSelect
              options={allGroups}
              selectedOptions={selectedGroups}
              onSelectionChange={setSelectedGroups}
              placeholder="Фильтровать по городам"
            />
            <MultiSelect
              options={allCategories}
              selectedOptions={selectedCategories}
              onSelectionChange={setSelectedCategories}
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
          <EmptyGroupsState
            message={
              selectedTags.length > 0
                ? "Нет фотографий, соответствующих фильтрам"
                : "Нет доступных фотографий"
            }
          />
        ) : (
          <div>
            {/* TODO {isMobile ? (
              <Gallery photos={mobilePhotos} />
            ) : (
              <ImageGallery
                items={photos}
                lazyLoad={true}
                showThumbnails={true}
                thumbnailPosition="left"
                showBullets
              />
            )} */}
            <ImageGallery
              items={photos}
              lazyLoad={true}
              showThumbnails={!isMobile}
              thumbnailPosition={isMobile ? "bottom" : "left"}
              showBullets={!isMobile}
            />
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
