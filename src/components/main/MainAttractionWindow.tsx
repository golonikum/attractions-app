import { FC, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

import { Attraction } from '@/types/attraction';

import { AttractionCard } from '../attraction/AttractionCard';
import { Button } from '../ui/button';

export const MainAttractionWindow: FC<{ item: Attraction; onClose: () => void }> = ({ item, onClose }) => {
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEsc);

    return () => document.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  return createPortal(
    <div className="flex absolute top-[74px] max-h-[calc(100vh_-_84px)] right-[10px] w-[500px] z-1000">
      <AttractionCard attraction={item} isShowOnMapButton={false} />
      <Button variant="ghost" className="absolute left-2 top-2 rounded-[22px] w-10" size="icon" onClick={onClose}>
        <X />
      </Button>
    </div>,
    document.body,
  );
};
