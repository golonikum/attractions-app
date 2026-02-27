'use client';

import { LocateFixed, MapPin } from 'lucide-react';

import { Button } from '../button';

export const ShowOnMapButton = ({ onClick, view = 'full' }: { onClick: () => void; view?: 'icon' | 'full' }) => {
  const label = 'Показать на карте';

  return view === 'icon' ? (
    <Button variant="ghost" size="sm" onClick={onClick} title={label} className="cursor-pointer">
      <LocateFixed className="h-4 w-4" />
    </Button>
  ) : (
    <Button
      variant="outline"
      className="w-full cursor-pointer"
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        onClick();
      }}
    >
      <MapPin className="mr-2 h-4 w-4" />
      {label}
    </Button>
  );
};
