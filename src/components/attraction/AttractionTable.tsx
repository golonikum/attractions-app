import { useCallback } from 'react';
import { closestCenter, DndContext, DragEndEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

import { Attraction } from '@/types/attraction';

import { Table } from '../ui/table';

import { ATTRACTIONS_TABLE_COLUMNS, AttractionTableRow, AttractionTableRowProps } from './AttractionTableRow';

type AttractionTableProps = Omit<AttractionTableRowProps, 'attraction' | 'hasDnd'> & {
  attractions: Attraction[];
  onOrderChanged?: (attractions: Attraction[]) => void;
  isDisabled?: boolean;
};

export function AttractionTable({
  attractions,
  isDisabled,
  onOrderChanged,
  onDelete,
  onUpdate,
  onLocate,
}: AttractionTableProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // нужно сдвинуть на 8px, чтобы начать drag
      },
    }),
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;

      if (active.id !== over?.id) {
        const oldIndex = attractions.findIndex((i) => i.id === active.id);
        const newIndex = attractions.findIndex((i) => i.id === over!.id);
        onOrderChanged?.(arrayMove(attractions, oldIndex, newIndex));
      }
    },
    [attractions, onOrderChanged],
  );

  const className = isDisabled ? 'pointer-events-none opacity-60 cursor-not-allowed select-none' : undefined;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      modifiers={[restrictToVerticalAxis]}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={attractions.map((d) => d.id)} strategy={verticalListSortingStrategy}>
        <Table
          columns={ATTRACTIONS_TABLE_COLUMNS.filter((col) => !!onOrderChanged || !!col.label)}
          className={className}
        >
          {attractions.map((attraction) => (
            <AttractionTableRow
              key={attraction.id}
              attraction={attraction}
              onDelete={onDelete}
              onUpdate={onUpdate}
              onLocate={onLocate}
              hasDnd={!!onOrderChanged}
            />
          ))}
        </Table>
      </SortableContext>
    </DndContext>
  );
}
