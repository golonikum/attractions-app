'use client';

import { MouseEventHandler } from 'react';
import { Trash2 } from 'lucide-react';

import { Button } from '../button';

export const RemoveButton = ({ onClick }: { onClick: MouseEventHandler<HTMLButtonElement> }) => (
  <Button variant="ghost" size="sm" className="text-red-500 cursor-pointer" onClick={onClick} title="Удалить">
    <Trash2 className="h-4 w-4" />
  </Button>
);
