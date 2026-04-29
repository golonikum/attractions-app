import { FC, useEffect, useRef } from 'react';
import { GripVertical, X } from 'lucide-react';
import { filter, finalize, fromEvent, map, Subject, switchMap, takeUntil, throttleTime } from 'rxjs';

import { Attraction } from '@/types/attraction';

import { AttractionCard } from '../attraction/AttractionCard';
import { Button } from '../ui/button';

const STYLE_GAP = 28;

const windowBoundaries = (windowEl: HTMLDivElement) => (e: MouseEvent) => {
  const rect = windowEl.getBoundingClientRect();

  return (
    e.clientX > 30 &&
    e.clientX < window.innerWidth - rect.width + STYLE_GAP &&
    e.clientY > 94 &&
    e.clientY < window.innerHeight - rect.height + STYLE_GAP
  );
};

export const MainAttractionWindow: FC<{
  item: Attraction;
  onClose: () => void;
}> = ({ item, onClose }) => {
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEsc);

    return () => document.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const windowRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const windowEl = windowRef.current;
    const handleEl = handleRef.current;

    if (handleEl && windowEl) {
      const mouseDown$ = fromEvent(handleEl, 'mousedown');
      const mouseMove$ = fromEvent(document, 'mousemove');
      const mouseUp$ = fromEvent(document, 'mouseup');
      const dragDone$ = new Subject<void>();

      const dragging$ = mouseDown$
        .pipe(
          switchMap(() =>
            mouseMove$.pipe(
              throttleTime(16),
              map((e) => e as MouseEvent),
              filter(windowBoundaries(windowEl)),
              takeUntil(mouseUp$),
              finalize(() => dragDone$.next()),
            ),
          ),
        )
        .subscribe((e) => {
          windowEl.style.left = `${e.clientX - STYLE_GAP}px`;
          windowEl.style.top = `${e.clientY - STYLE_GAP}px`;
          handleEl.style.cursor = 'grabbing';
        });

      dragDone$.subscribe(() => {
        handleEl.style.cursor = 'grab';
      });

      return () => {
        dragging$.unsubscribe();
        dragDone$.unsubscribe();
      };
    }
  }, []);

  console.log('render');

  return (
    <div
      ref={windowRef}
      className="flex absolute top-[74px] max-h-[calc(100vh_-_84px)] right-[10px] w-[500px] z-1000 overflow-visible"
    >
      <AttractionCard attraction={item} isShowOnMapButton={false} className="shadow-2xl" />
      <Button variant="ghost" className="absolute right-2 top-2 rounded-[22px] w-10" size="icon" onClick={onClose}>
        <X />
      </Button>
      <Button
        ref={handleRef}
        variant="ghost"
        className="absolute left-2 top-2 rounded-[22px] w-10 cursor-grab"
        size="icon"
      >
        <GripVertical />
      </Button>
    </div>
  );
};
