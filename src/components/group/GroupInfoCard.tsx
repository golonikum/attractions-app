import { useRouter } from 'next/navigation';

import { DEFAULT_TAG_ZOOM } from '@/lib/constants';
import { getLocationSearchParams } from '@/lib/getLocationSearchParams';
import { Attraction } from '@/types/attraction';
import { Group } from '@/types/group';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tag } from '@/components/ui/Tag';

interface GroupInfoCardProps {
  group: Group;
  attractions: Attraction[];
}

export function GroupInfoCard({ group, attractions }: GroupInfoCardProps) {
  const router = useRouter();

  const onTagClick = () => {
    const newUrl = `${window.location.pathname}${getLocationSearchParams(
      group,
      DEFAULT_TAG_ZOOM,
    )}&tag=${group.tag?.replace(' ', '+')}`;
    window.history.pushState({}, '', newUrl);

    router.push('/groups');
  };

  return (
    <Card className="shrink-0">
      <CardHeader>
        <div className="flex gap-4 justify-between items-start">
          <CardTitle>
            {group.name}{' '}
            {!!attractions.length && <span className="font-normal text-gray-400">({attractions.length})</span>}
          </CardTitle>
          {group.tag && <Tag className="cursor-pointer" text={group.tag} variant="default" onClick={onTagClick} />}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600">{group.description}</p>
      </CardContent>
    </Card>
  );
}
