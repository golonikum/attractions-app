import { Attraction } from "@/types/attraction";
import {
  AttractionTableRow,
  AttractionTableRowProps,
} from "./AttractionTableRow";

type AttractionTableProps = Omit<AttractionTableRowProps, "attraction"> & {
  attractions: Attraction[];
};

export function AttractionTable({
  attractions,
  onDelete,
  onUpdate,
  onLocate,
}: AttractionTableProps) {
  return (
    <div className="hidden md:block overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
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
  );
}
