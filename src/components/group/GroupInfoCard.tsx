import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tag } from "@/components/ui/Tag";
import { Group } from "@/types/group";

interface GroupInfoCardProps {
  group: Group;
}

export function GroupInfoCard({ group }: GroupInfoCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex gap-4 justify-between items-start">
          <CardTitle>{group.name}</CardTitle>
          {group.tag && (
            <Tag text={group.tag} variant="default" />
          )}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600 mb-4">{group.description}</p>
      </CardContent>
    </Card>
  );
}
