import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Group } from "@/types/group";

interface GroupInfoCardProps {
  group: Group;
}

export function GroupInfoCard({ group }: GroupInfoCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{group.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600 mb-4">{group.description}</p>
        {group.tag && (
          <span className="inline-block px-2 py-1 text-xs bg-primary/10 text-primary rounded-full">
            {group.tag}
          </span>
        )}
        <div className="flex justify-between text-sm text-gray-500 mt-4">
          <span>
            Координаты: {group.coordinates[0].toFixed(4)},{" "}
            {group.coordinates[1].toFixed(4)}
          </span>
          <span>Масштаб: {group.zoom}</span>
        </div>
      </CardContent>
    </Card>
  );
}
