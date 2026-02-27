'use client';

import { TextInitial } from 'lucide-react';

import { Button } from '../button';

export const ShowDescriptionButton = ({ onClick }: { onClick?: () => void }) => (
  <Button variant="ghost" size="sm" onClick={onClick} className="cursor-pointer w-fit">
    <TextInitial className="mr-2 h-4 w-4" />
    Показать описание
  </Button>
);
