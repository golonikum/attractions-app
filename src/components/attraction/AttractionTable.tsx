import { Attraction } from "@/types/attraction";
import {
  AttractionTableRow,
  AttractionTableRowProps,
} from "./AttractionTableRow";
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { useCallback } from "react";
// import { Dispatch, SetStateAction } from "react";

type AttractionTableProps = Omit<AttractionTableRowProps, "attraction"> & {
  attractions: Attraction[];
  // setAttractions: Dispatch<SetStateAction<Attraction[]>>;
  onOrderChanged: (attractions: Attraction[]) => void;
};

export function AttractionTable({
  attractions,
  // setAttractions,
  onOrderChanged,
  onDelete,
  onUpdate,
  onLocate,
}: AttractionTableProps) {
  const sensors = useSensors(
    useSensor(MouseSensor),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor),
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;

      if (active.id !== over?.id) {
        const oldIndex = attractions.findIndex((i) => i.id === active.id);
        const newIndex = attractions.findIndex((i) => i.id === over!.id);
        onOrderChanged(arrayMove(attractions, oldIndex, newIndex));
      }
    },
    [attractions, onOrderChanged],
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      modifiers={[restrictToVerticalAxis]}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={attractions.map((d) => d.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="hidden md:block overflow-x-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th style={{ width: "50px" }}></th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Изображение
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Название
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Описание
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Действия
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {attractions.map((attraction) => (
                <AttractionTableRow
                  key={attraction.id}
                  attraction={attraction}
                  onDelete={onDelete}
                  onUpdate={onUpdate}
                  onLocate={onLocate}
                />
              ))}
            </tbody>
          </table>
        </div>
      </SortableContext>
    </DndContext>
  );
}
