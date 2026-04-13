import { Calendar } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { useIsMobile } from '@/hooks/useIsMobile';
import { locateItemOnMainMapHref } from '@/lib/locateItemOnMainMapHref';
import { cn } from '@/lib/utils';
import { Attraction } from '@/types/attraction';
import { Group } from '@/types/group';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tag } from '@/components/ui/Tag';

import { Button } from '../ui/button';
import { OpenInYandexMapButton, ShowOnMapButton } from '../ui/buttons';

import { AttractionImage } from './AttractionImage';

interface AttractionInfoCardProps {
  attraction: Attraction;
  group: Group | null;
}

export function AttractionInfoCard({ attraction, group }: AttractionInfoCardProps) {
  const { isWideScreen } = useIsMobile();
  const router = useRouter();

  return (
    <Card isFavorite={attraction.isFavorite} isVisited={attraction.isVisited}>
      <CardHeader>
        <div className="flex gap-4 justify-between items-start">
          <CardTitle className="flex flex-col gap-2 flex-start">
            {attraction.name}{' '}
            <Link href={`/groups/${group?.id}`}>
              <Button variant="ghost" size="sm" className="mr-4 cursor-pointer w-fit">
                {group?.name}
              </Button>
            </Link>
          </CardTitle>
          {attraction.category && <Tag text={attraction.category} variant="default" />}
        </div>
      </CardHeader>

      <CardContent
        className={cn(
          'relative flex gap-4',
          isWideScreen && 'h-[calc(100vh-300px)] flex-row',
          !isWideScreen && 'flex-col',
        )}
      >
        <div className={cn('relative flex-shrink-0', isWideScreen ? 'h-full w-1/2' : 'h-96 w-full')}>
          <AttractionImage attraction={attraction} className="rounded-md" />
        </div>

        <div className="flex flex-col gap-6 overflow-y-auto">
          {attraction.description && <p className="whitespace-pre-wrap">{attraction.description}</p>}

          {attraction.notes && attraction.notes.length > 0 && (
            <div>
              <h4 className="font-medium mb-2 flex items-center">
                <Calendar className="mr-2 h-4 w-4" />
                Заметки ({attraction.notes.length})
              </h4>
              <div className="space-y-2">
                {attraction.notes.map((note, index) => (
                  <div key={index} className="border-l-4 border-blue-500 pl-3 py-1">
                    <div className="text-sm text-gray-500">{note.date}</div>
                    <p className="text-sm">{note.note}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!isWideScreen && (
            <>
              <OpenInYandexMapButton attraction={attraction} />
              <ShowOnMapButton href={locateItemOnMainMapHref(attraction)} />
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
