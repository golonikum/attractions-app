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
        {group.tag && (
          <span className="inline-block px-2 py-1 text-xs bg-primary/10 text-primary rounded-full">
            {group.tag}
          </span>
        )}
      </CardHeader>
      <CardContent>
        <p className="text-gray-600 mb-4">{group.description}</p>
      </CardContent>
    </Card>
  );
}
