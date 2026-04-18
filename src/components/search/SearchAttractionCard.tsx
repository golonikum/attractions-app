import { RowComponentProps } from 'react-window';
import Link from 'next/link';

import { useData } from '@/contexts/DataContext';
import { locateItemOnMainMapHref } from '@/lib/locateItemOnMainMapHref';
import { Attraction } from '@/types/attraction';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { AttractionImage } from '../attraction/AttractionImage';
import { OpenInYandexMapButton, ShowOnMapButton } from '../ui/buttons';
import { Tag } from '../ui/Tag';

interface SearchAttractionCardProps {
  attractions: Attraction[];
}

export function SearchAttractionCard({ attractions, index, style }: RowComponentProps<SearchAttractionCardProps>) {
  const { groups } = useData();
  const attraction = attractions[index];
  const group = groups.find((g) => g.id === attraction.groupId);

  return (
    <div style={style}>
      <Card isFavorite={attraction.isFavorite} isVisited={attraction.isVisited} className="mb-4">
        <div className="aspect-video bg-gray-100 flex items-center justify-center">
          <Link href={`/attractions/${attraction.id}`} className="cursor-pointer relative h-64 w-full flex-shrink-0">
            <AttractionImage attraction={attraction} />
          </Link>
        </div>
        <CardHeader>
          <div className="flex justify-between items-start">
            <Link href={`/attractions/${attraction.id}`} className="flex-1 max-w-[calc(100%)]">
              <div className="flex-1 flex flex-col gap-2">
                <CardTitle className="text-lg/5 truncate">{group?.name}</CardTitle>
                <CardTitle className="text-lg/5 truncate">{attraction.name}</CardTitle>
                {attraction.category && <Tag text={attraction.category} />}
              </div>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-6 justify-between">
          <div className="flex flex-col gap-4">
            <OpenInYandexMapButton attraction={attraction} />
            <ShowOnMapButton href={locateItemOnMainMapHref(attraction)} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
