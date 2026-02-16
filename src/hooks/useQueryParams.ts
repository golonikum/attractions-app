import { capitalizeFirstLetter } from "@/lib/utils";
import { useEffect, useState } from "react";

export const useQueryParams = (names: string[]) => {
  const [state, setState] = useState<Record<string, string[]>>(
    names.reduce((res, cur) => ({ ...res, [cur]: [] }), {}),
  );

  // Получаем параметры из URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const newState: Record<string, string[]> = {};

    names.forEach((name) => {
      const param = params.get(name);
      newState[name] = param ? param.split(",") : [];
    });

    setState((val) => ({ ...val, ...newState }));
  }, []);

  // Обновляем URL при изменении фильтров
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    names.forEach((name) => {
      if (state[name].length > 0) {
        params.set(name, state[name].join(","));
      } else {
        params.delete(name);
      }
    });

    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState({}, "", newUrl);
  }, [state, names]);

  return names.reduce(
    (res, name) => ({
      ...res,
      [`selected${capitalizeFirstLetter(name)}`]: state[name],
      [`setSelected${capitalizeFirstLetter(name)}`]: (value: string[]) =>
        setState((val) => ({ ...val, [name]: value })),
    }),
    {} as Record<string, any>,
  );
};
