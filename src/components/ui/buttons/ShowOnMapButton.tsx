'use client';

import { LocateFixed, MapPin } from 'lucide-react';
import Link from 'next/link';

import { cn } from '@/lib/utils';

import { Button, buttonVariants } from '../button';

export const ShowOnMapButton = ({
  onClick,
  view = 'full',
  href = '/',
  label,
}: {
  onClick?: () => void;
  view?: 'icon' | 'full';
  href?: string;
  label?: string;
}) => {
  const title = 'На карте';

  if (onClick) {
    return (
      <Button variant="ghost" size="sm" onClick={onClick} title={title} className="cursor-pointer">
        <LocateFixed className="h-4 w-4" />
      </Button>
    );
  }

  return view === 'icon' ? (
    <Link href={href} className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }))} title={title}>
      <LocateFixed className="h-4 w-4" />
    </Link>
  ) : (
    <Link href={href} className={cn(buttonVariants({ variant: 'outline', className: 'w-full' }))} title={title}>
      <MapPin className="mr-2 h-4 w-4" />
      {label ?? title}
    </Link>
  );
};
