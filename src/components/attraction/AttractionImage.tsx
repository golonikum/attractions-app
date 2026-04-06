import { Image, Star } from 'lucide-react';

import { Attraction } from '@/types/attraction';

export const AttractionImage = ({
  attraction,
  className,
  showFavorite,
}: {
  attraction: Attraction;
  className?: string;
  showFavorite?: boolean;
}) =>
  attraction.imageUrl ? (
    <>
      {showFavorite ? (
        <div className="relative w-full h-full">
          <img src={attraction.imageUrl} alt={attraction.name} className={`object-cover ${className}`} />
          {attraction.isFavorite && <Star className="h-5 w-5 text-yellow-500 fill-current absolute top-1 left-1" />}
        </div>
      ) : (
        <img src={attraction.imageUrl} alt={attraction.name} className={`object-cover ${className}`} />
      )}
    </>
  ) : (
    <Image className="h-8 w-8 text-gray-400" />
  );
