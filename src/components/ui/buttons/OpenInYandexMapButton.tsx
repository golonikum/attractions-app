'use client';

import { MapPinned } from 'lucide-react';

import { Attraction } from '@/types/attraction';

import { Button } from '../button';

export const OpenInYandexMapButton = ({
  attraction,
  view = 'full',
  label,
}: {
  attraction: Attraction;
  view?: 'icon' | 'full';
  label?: string;
}) => {
  if (!attraction.yaMapUrl) {
    return null;
  }

  const onClickHandler = () => window.open(attraction.yaMapUrl, '_blank');
  const title = 'Яндекс.Карты';

  return view === 'icon' ? (
    <Button variant="ghost" size="sm" onClick={onClickHandler} title={title} className="cursor-pointer">
      <MapPinned className="h-4 w-4 " />
    </Button>
  ) : (
    <Button variant="outline" className="w-full cursor-pointer" onClick={onClickHandler} title={title}>
      <MapPinned className="mr-2 h-4 w-4" />
      {label ?? title}
    </Button>
  );
};
