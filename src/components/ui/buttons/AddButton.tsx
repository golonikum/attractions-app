'use client';

import { MouseEventHandler } from 'react';
import { MessageSquarePlus, SquarePlus } from 'lucide-react';

import { Button } from '../button';

type AddButtonType = 'default' | 'note';

export const AddButton = ({
  onClick,
  title = 'Добавить',
  view = 'default',
}: {
  onClick?: MouseEventHandler<HTMLButtonElement>;
  title?: string;
  view?: AddButtonType;
}) => {
  const Icon = view === 'note' ? MessageSquarePlus : SquarePlus;

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      title={title}
      className="text-green-600 cursor-pointer"
      type="button"
    >
      <Icon className="h-4 w-4" />
    </Button>
  );
};
