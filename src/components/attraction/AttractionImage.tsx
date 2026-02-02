import { Image } from "lucide-react";
import { Attraction } from "@/types/attraction";

export const AttractionImage = ({
  attraction,
  className,
}: {
  attraction: Attraction;
  className?: string;
}) => {
  return attraction.imageUrl ? (
    <img
      src={attraction.imageUrl}
      alt={attraction.name}
      className={`w-full h-full object-cover rounded-md ${className}`}
    />
  ) : (
    <Image className="h-8 w-8 text-gray-400" />
  );
};
