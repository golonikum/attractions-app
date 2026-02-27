import { capitalizeFirstLetter } from '@/lib/utils';
import { useEffect, useState } from 'react';

type FieldsAndSetters<T extends readonly string[]> = T extends readonly (infer Name extends string)[]
  ? {
      [K in Name as `selected${Capitalize<K>}`]: string[];
    } & {
      [K in Name as `setSelected${Capitalize<K>}`]: (value: string[]) => void;
    }
  : never;

type SearchQuerySetters = {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
};

const getInitStateFromUrl = <T extends readonly string[]>(names: T) => {
  const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : { get: () => '' };
  const newState: Record<string, string[]> = {};
  const searchParam = params.get('search');

  names.forEach((name) => {
    const param = params.get(name);
    newState[name] = param ? param.split(',') : [];
  });

  return {
    ...newState,
    search: searchParam ? [searchParam] : [],
  };
};

export const useQueryParams = <T extends readonly string[]>(
  names: string[],
): FieldsAndSetters<T> & SearchQuerySetters => {
  const [state, setState] = useState<Record<string, string[]>>(getInitStateFromUrl(names));

  // Обновляем URL при изменении фильтров
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    names.forEach((name) => {
      if (state[name].length > 0) {
        params.set(name, state[name].join(','));
      } else {
        params.delete(name);
      }
    });

    // Особым образом обрабатываем параметр search
    if (state.search?.length > 0) {
      params.set('search', state.search[0].trim());
    } else {
      params.delete('search');
    }

    const newUrl = `${window.location.pathname}${params.toString() ? '?' : ''}${params.toString()}`;
    window.history.pushState({}, '', newUrl);
  }, [state, names]);

  return {
    ...names.reduce(
      (res, name) => ({
        ...res,
        [`selected${capitalizeFirstLetter(name)}`]: state[name],
        [`setSelected${capitalizeFirstLetter(name)}`]: (value: string[]) => {
          setState((val) => ({ ...val, [name]: value }));
        },
      }),
      {} as FieldsAndSetters<T>,
    ),
    searchQuery: state.search?.length ? state.search[0] : '',
    setSearchQuery: (value: string) => setState((val) => ({ ...val, search: value ? [value] : [] })),
  };
};
