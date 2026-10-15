'use client';

import { useState } from 'react';

import { ConfirmDialog } from '../ConfirmDialog';

import { RemoveButton } from './RemoveButton';

/** Тексты подтверждения — одинаковые для карточек, строк таблиц и страниц */
export const DELETE_CONFIRM_TEXTS = {
  group: (name: string) => ({
    title: 'Удалить населенный пункт?',
    description: `Вы уверены, что хотите удалить «${name}»? Все связанные объекты также будут удалены.`,
  }),
  attraction: (name: string) => ({
    title: 'Удалить объект?',
    description: `Вы уверены, что хотите удалить «${name}»?`,
  }),
};

/** Кнопка-корзина с диалогом подтверждения удаления */
export const RemoveWithConfirmButton = ({
  title,
  description,
  onConfirm,
}: {
  title: string;
  description: string;
  onConfirm: () => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <RemoveButton
        onClick={(e) => {
          // Кнопка часто стоит внутри ссылки или кликабельной строки — клик не должен до них дойти
          e.stopPropagation();
          e.preventDefault();
          setIsOpen(true);
        }}
      />
      <ConfirmDialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onConfirm={onConfirm}
        title={title}
        description={description}
        confirmText="Удалить"
        cancelText="Отмена"
        variant="destructive"
      />
    </>
  );
};
