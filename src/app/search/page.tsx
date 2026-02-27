"use client";

import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useRouter } from "next/navigation";
import { FoundCountStub, LoadingStub } from "@/components/ui/stubs";
import { useQueryParams } from "@/hooks/useQueryParams";
import { useData } from "@/contexts/DataContext";
import { useIsMobile } from "@/hooks/useIsMobile";
import { AttractionTable } from "@/components/attraction/AttractionTable";
import { AttractionCard } from "@/components/attraction/AttractionCard";
import { useCallback, useEffect, useState } from "react";
import { locateItemOnMainMap } from "@/lib/locateItemOnMainMap";
import { EmptyListState } from "@/components/group/EmptyListState";
import { useDebounceCallback } from "@/hooks/useDebounceCallback";
import { Attraction } from "@/types/attraction";

export default function SearchPage() {
  const router = useRouter();
  const { isWideScreen } = useIsMobile();
  const { searchQuery, setSearchQuery } = useQueryParams([] as const);
  const { attractions, isAttractionsLoading } = useData();
  const [foundAttractions, setFoundAttractions] = useState<Attraction[]>([]);

  const onSearch = useCallback(() => {
    setFoundAttractions(
      attractions.filter((item) => {
        const search = searchQuery.toLowerCase();
        const lowerName = item.name.toLowerCase();
        const lowerDescription = item.description?.toLowerCase() || "";

        return lowerName.includes(search) || lowerDescription.includes(search);
      }),
    );
  }, [searchQuery, attractions]);

  const debounceSearch = useDebounceCallback(onSearch, 500);

  useEffect(() => {
    debounceSearch();
  }, [searchQuery, debounceSearch]);

  if (isAttractionsLoading) {
    return <LoadingStub />;
  }

  const emptyState = (
    <EmptyListState
      message={
        searchQuery
          ? "Нет объектов, соответствующих поисковому запросу"
          : "Нет объектов"
      }
      description={
        searchQuery
          ? "Попробуйте изменить поисковый запрос."
          : "У вас пока нет созданных объектов."
      }
    />
  );

  return (
    <ProtectedRoute>
      <div
        className={`container lg:max-w-full mx-auto pt-20 px-4 pb-8 flex flex-col gap-4 ${isWideScreen ? "overflow-hidden" : ""}`}
        style={isWideScreen ? { height: "calc(100vh)" } : {}}
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="w-full space-y-4 md:space-y-0 md:space-x-4 md:flex md:flex-row md:w-auto md:items-center">
            <div className="flex-1 shrink-0">
              <input
                type="text"
                placeholder="Поиск..."
                className="w-full min-w-80 h-10 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value?.trim())}
              />
            </div>
            <FoundCountStub
              count={foundAttractions.length}
              hasFilters={!!searchQuery}
            />
          </div>
        </div>

        {isWideScreen ? (
          <div
            className="flex-1 flex flex-row gap-4"
            style={{ height: "calc(100vh - 150px)" }}
          >
            <div className="overflow-x-auto flex-1">
              {foundAttractions.length === 0 ? (
                emptyState
              ) : (
                <AttractionTable
                  attractions={foundAttractions}
                  onLocate={(attraction) => {
                    locateItemOnMainMap({ router, item: attraction });
                  }}
                />
              )}
            </div>
          </div>
        ) : foundAttractions.length === 0 ? (
          emptyState
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {foundAttractions.map((attraction) => (
              <AttractionCard key={attraction.id} attraction={attraction} />
            ))}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
