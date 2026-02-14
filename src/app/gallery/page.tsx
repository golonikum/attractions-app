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
import Gallery from "react-photo-gallery";
import Image from "next/image";
import { useIsMobile } from "@/hooks/useIsMobile";

interface Photo {
  src: string;
  width: number;
  height: number;
  alt?: string;
}

export default function GalleryPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [attractions, setAttractions] = useState<Attraction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const { isMobile } = useIsMobile();

  // Получаем параметры из URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tagsParam = params.get("tag");

    if (tagsParam) {
      setSelectedTags(tagsParam.split(","));
    }
  }, []);

  // Обновляем URL при изменении фильтров
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    // Обработка тегов
    if (selectedTags.length > 0) {
      params.set("tag", selectedTags.join(","));
    } else {
      params.delete("tag");
    }

    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState({}, "", newUrl);
  }, [selectedTags]);

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

  // Фильтрация групп по выбранным тегам и поисковому запросу
  const { photos, mobilePhotos } = useMemo(() => {
    let filteredGroups = groups;

    // Фильтрация по тегам
    if (selectedTags.length > 0) {
      filteredGroups = filteredGroups.filter((group) => {
        if (!group.tag) return false;
        return selectedTags.includes(group.tag);
      });
    }

    const groupsIds = filteredGroups.map((group) => group.id);
    const result = attractions
      .filter((item) => groupsIds.includes(item.groupId))
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
  }, [groups, attractions, selectedTags]);

  if (isLoading) {
    return <LoadingStub />;
  }

  return (
    <ProtectedRoute>
      <div className="container mx-auto pt-20 px-4 pb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
          {/* Фильтры по тегам и поиск */}
          <div className="w-full space-y-4 md:space-y-0 md:space-x-4 md:flex md:flex-row md:w-auto md:items-center">
            <MultiSelect
              options={allTags}
              selectedOptions={selectedTags}
              onSelectionChange={setSelectedTags}
              placeholder="Фильтровать по тегам"
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
            {isMobile ? (
              <Gallery photos={mobilePhotos} />
            ) : (
              <ImageGallery
                items={photos}
                lazyLoad={true}
                showThumbnails={true}
                thumbnailPosition="left"
                showBullets
              />
            )}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}

const ImageRender = ({ photo, index }: { photo: Photo; index: number }) => (
  <Image
    key={index}
    src={photo.src}
    alt={photo.alt || `Фото ${index}`}
    width={photo.width * 100} // Масштабируем для Next/Image
    height={photo.height * 100}
    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
    className="rounded-lg shadow-md hover:scale-105 transition-transform duration-300 object-cover"
    placeholder="blur" // Опционально
  />
);
