import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tag } from "@/components/ui/Tag";
import { Attraction } from "@/types/attraction";
import { Group } from "@/types/group";

interface GroupInfoCardProps {
  group: Group;
  attractions: Attraction[];
}

export function GroupInfoCard({ group, attractions }: GroupInfoCardProps) {
  return (
    <Card className="shrink-0">
      <CardHeader>
        <div className="flex gap-4 justify-between items-start">
          <CardTitle>
            {group.name}{" "}
            {!!attractions.length && (
              <span className="font-normal text-gray-400">
                ({attractions.length})
              </span>
            )}
          </CardTitle>
          {group.tag && <Tag text={group.tag} variant="default" />}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600">{group.description}</p>
      </CardContent>
    </Card>
  );
}
