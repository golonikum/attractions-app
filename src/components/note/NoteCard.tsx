import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { useData } from '@/contexts/DataContext';
import { NoteWithAttractionIdType } from '@/types/attraction';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import { AttractionImage } from '../attraction/AttractionImage';
import { Tag } from '../ui/Tag';

interface NoteCardProps {
  note: NoteWithAttractionIdType;
}

export function NoteCard({ note }: NoteCardProps) {
  const router = useRouter();
  const { attractions, groups } = useData();

  const handleClick = () => {
    router.push(`/attractions/${note.attractionId}`);
  };

  const attraction = attractions.find((item) => item.id === note.attractionId);

  if (!attraction) {
    return null;
  }

  const group = groups.find((item) => item.id === attraction.groupId);

  return (
    <Card isFavorite={attraction.isFavorite} isVisited={attraction.isVisited} onClick={handleClick}>
      <div className="aspect-video bg-gray-100 flex items-center justify-center">
        <Link href={`/attractions/${attraction.id}`} className="cursor-pointer">
          <AttractionImage attraction={attraction} className="w-full h-full" />
        </Link>
      </div>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1 flex flex-col gap-2">
            <div className="flex justify-between items-start">
              <Link href={`/attractions/${attraction.id}`}>
                <CardTitle className="text-lg/5 cursor-pointer">
                  {attraction.name} ({group?.name})
                </CardTitle>
              </Link>
            </div>
            {attraction.category && <Tag text={attraction.category} />}
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-6 justify-between">
        <CardDescription className="text-gray-600 whitespace-pre-wrap">{note.date}</CardDescription>
        <CardDescription className="text-gray-600 whitespace-pre-wrap">{note.note}</CardDescription>
      </CardContent>
    </Card>
  );
}
