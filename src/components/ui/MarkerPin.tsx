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
          className={`h-8 w-8 shrink-0 relative hover:text-blue-500 hover:fill-blue-200 ${classNames}`}
          style={{ top: '-32px', left: '-16px', cursor: 'pointer' }}
          onClick={onClick}
        />
        {(isHovered || isActive) && title && (
          <div
            className="text-xs shrink-0 absolute px-2 py-0.5 overflow-hidden rounded-md bg-white shadow-md whitespace-nowrap text-black-0"
            style={{
              top: '4px',
              transform: 'translateX(-50%)',
              maxWidth: '256px',
              textOverflow: 'ellipsis',
              zIndex: 10,
            }}
          >
            {title}
          </div>
        )}
      </div>
    </YMapMarker>
  );
};
