import { useSyncExternalStore } from 'react';

const subscribe = () => () => {};

/**
 * false во время SSR и гидратации, true — после. В отличие от useEffect + useState,
 * не даёт лишнего рендера на клиентских переходах: после гидратации сразу возвращает true.
 */
export const useIsHydrated = () =>
  useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
