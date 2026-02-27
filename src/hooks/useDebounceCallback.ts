import { useEffect, useRef } from 'react';

export const useDebounceCallback = <T extends Array<unknown>>(
  callback: (...args: T) => void,
  debounceTimeInMs: number,
): ((...args: T) => void) => {
  const timerIdRef = useRef<number | null>(null);

  const tearDown = () => {
    if (timerIdRef.current) {
      clearTimeout(timerIdRef.current);
      timerIdRef.current = null;
    }
  };

  useEffect(() => tearDown, []);

  return (...args: T) => {
    tearDown();

    if (debounceTimeInMs === 0) {
      callback(...args);

      return;
    }

    timerIdRef.current = window.setTimeout(() => {
      callback(...args);
    }, debounceTimeInMs);
  };
};
