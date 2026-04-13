'use client';

import { LocateFixed, MapPin } from 'lucide-react';
import Link from 'next/link';

import { cn } from '@/lib/utils';

import { Button, buttonVariants } from '../button';

export const ShowOnMapButton = ({
  onClick,
  view = 'full',
  href = '/',
}: {
  onClick?: () => void;
  view?: 'icon' | 'full';
  href?: string;
}) => {
  const label = 'Показать на карте';

  if (onClick) {
    return (
      <Button variant="ghost" size="sm" onClick={onClick} title={label} className="cursor-pointer">
        <LocateFixed className="h-4 w-4" />
      </Button>
    );
  }

  return view === 'icon' ? (
    <Link href={href} className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }))} title={label}>
      <LocateFixed className="h-4 w-4" />
    </Link>
  ) : (
    <Link href={href} className={cn(buttonVariants({ variant: 'outline', className: 'w-full' }))} title={label}>
      <MapPin className="mr-2 h-4 w-4" />
      {label}
    </Link>
  );
};
