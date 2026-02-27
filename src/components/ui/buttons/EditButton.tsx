'use client';

import { MouseEventHandler } from 'react';
import { Edit } from 'lucide-react';

import { Button } from '../button';

export const EditButton = ({ onClick }: { onClick?: MouseEventHandler<HTMLButtonElement> }) => (
  <Button variant="ghost" size="sm" onClick={onClick} title="Изменить" className="cursor-pointer">
    <Edit className="h-4 w-4" />
  </Button>
);
