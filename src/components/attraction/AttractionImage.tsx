import { Image as ImageIcon, Star } from 'lucide-react';
import Image from 'next/image';

import { cn } from '@/lib/utils';
import { Attraction } from '@/types/attraction';

export const AttractionImage = ({
  attraction,
  className,
  showFavorite,
}: {
  attraction: Attraction;
  className?: string;
  showFavorite?: boolean;
}) => {
  const favorite = showFavorite && attraction.isFavorite;

  return attraction.imageUrl ? (
    <>
      <Image
        fill
        src={attraction.imageUrl}
        alt={attraction.name}
        className={cn('object-cover', className, favorite && 'outline outline-2 outline-yellow-500')}
      />
      {favorite && <Star className="h-5 w-5 text-yellow-500 fill-current absolute top-1 left-1" />}
    </>
  ) : (
    <ImageIcon className="h-full w-full text-gray-400" />
  );
};
