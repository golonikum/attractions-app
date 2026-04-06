import { FC, useState } from 'react';
import { MapPin } from 'lucide-react';

import { YMapMarker } from '@/lib/ymaps';

const getMapPinClassNames = (isActive: boolean, visited: boolean) => {
  if (isActive) {
    return 'text-blue-500 fill-blue-200';
  } else if (visited) {
    return 'text-muted-foreground text-green-500 fill-green-200';
  } else {
    return 'text-red-500 fill-red-200';
  }
};

export const MarkerPin: FC<{
  coordinates: [number, number];
  visited?: boolean;
  title?: string;
  onClick?: () => void;
  isActive?: boolean;
}> = ({ title, onClick, coordinates, visited = false, isActive = false }) => {
  const [isHovered, setIsHovered] = useState(false);
  const classNames = getMapPinClassNames(isActive, visited);

  return (
    <YMapMarker coordinates={coordinates} draggable={false} zIndex={isHovered || isActive ? 1 : 0}>
      <div className="relative">
        <MapPin
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className={`h-8 w-8 shrink-0 relative hover:text-blue-500 hover:fill-blue-200 cursor-pointer left-[-16px] top-[-32px] ${classNames}`}
          onClick={onClick}
        />
        {(isHovered || isActive) && title && (
          <div className="text-ellipsis z-10 -translate-x-1/2 text-xs shrink-0 absolute top-1 px-2 max-w-[256px] py-0.5 overflow-hidden rounded-md bg-background shadow-md whitespace-nowrap">
            {title}
          </div>
        )}
      </div>
    </YMapMarker>
  );
};
