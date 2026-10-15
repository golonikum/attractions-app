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
    // Заглушка «нет фото»: треть контейнера, но не больше 48px — и в миниатюре таблицы, и в большой карточке
    <div className={cn('flex h-full w-full items-center justify-center bg-muted', className)}>
      <ImageIcon className="h-1/3 max-h-12 w-1/3 max-w-12 text-muted-foreground/60" strokeWidth={1.5} />
    </div>
  );
};
