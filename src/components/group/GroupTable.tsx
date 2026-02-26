import { GroupTableRow, GroupTableRowProps } from "./GroupTableRow";
import { Group } from "@/types/group";

type GroupTableProps = Omit<GroupTableRowProps, "group"> & {
  groups: Group[];
};

export function GroupTable({
  groups,
  onDelete,
  onUpdate,
  onLocate,
  attractionsMap,
}: GroupTableProps) {
  return (
    <div className="hidden md:block overflow-x-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th
              scope="col"
              className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              style={{ width: "150px" }}
            >
              Название
            </th>
            <th
              scope="col"
              className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              style={{ width: "220px" }}
            >
              Регион
            </th>
            <th
              scope="col"
              className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Описание
            </th>
            <th
              scope="col"
              className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              style={{ width: "180px" }}
            >
              Действия
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {groups.map((group) => (
            <GroupTableRow
              key={group.id}
              group={group}
              onDelete={onDelete}
              onUpdate={onUpdate}
              onLocate={onLocate}
              attractionsMap={attractionsMap}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
