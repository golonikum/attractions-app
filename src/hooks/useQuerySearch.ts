import { useEffect, useState } from "react";

export const useQuerySearch = (...dependencies: any[]) => {
  const [searchQuery, setSearchQuery] = useState("");

  // Получаем параметры из URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const searchParam = params.get("search");

    if (searchParam) {
      setSearchQuery(searchParam);
    }
  }, []);

  // Обновляем URL при изменении фильтров
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    // Обработка поиска
    if (searchQuery.trim()) {
      params.set("search", searchQuery.trim());
    } else {
      params.delete("search");
    }

    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState({}, "", newUrl);
  }, [dependencies, searchQuery]);

  return { searchQuery, setSearchQuery };
};
