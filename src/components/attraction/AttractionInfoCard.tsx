import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "lucide-react";
import { Attraction } from "@/types/attraction";
import { Tag } from "@/components/ui/Tag";
import { AttractionImage } from "./AttractionImage";
import { useIsMobile } from "@/hooks/useIsMobile";
import { OpenInYandexMapButton, ShowOnMapButton } from "../ui/buttons";
import { useRouter } from "next/navigation";

interface AttractionInfoCardProps {
  attraction: Attraction;
}

export function AttractionInfoCard({ attraction }: AttractionInfoCardProps) {
  const { isWideScreen } = useIsMobile();
  const router = useRouter();

  return (
    <Card isFavorite={attraction.isFavorite} isVisited={attraction.isVisited}>
      <CardHeader>
        <div className="flex gap-4 justify-between items-start">
          <CardTitle>{attraction.name}</CardTitle>
          {attraction.category && (
            <Tag text={attraction.category} variant="default" />
          )}
        </div>
      </CardHeader>

      <CardContent
        className={`flex gap-4 ${isWideScreen ? "flex-row" : "flex-col"}`}
      >
        <AttractionImage
          attraction={attraction}
          className={`rounded-md ${isWideScreen ? "h-full w-96" : "h-96 w-full"}`}
        />

        <div className="flex flex-col gap-4">
          {attraction.description && (
            <p className="text-gray-600">{attraction.description}</p>
          )}

          <div className="flex justify-between text-sm text-gray-500">
            <span>
              Координаты: {attraction.coordinates[0].toFixed(4)},{" "}
              {attraction.coordinates[1].toFixed(4)}
            </span>
            <span>Порядок: {attraction.order}</span>
          </div>

          {attraction.notes && attraction.notes.length > 0 && (
            <div>
              <h4 className="font-medium mb-2 flex items-center">
                <Calendar className="mr-2 h-4 w-4" />
                Заметки ({attraction.notes.length})
              </h4>
              <div className="space-y-2">
                {attraction.notes.map((note, index) => (
                  <div
                    key={index}
                    className="border-l-4 border-blue-500 pl-3 py-1"
                  >
                    <div className="text-sm text-gray-500">{note.date}</div>
                    <p className="text-sm">{note.note}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <OpenInYandexMapButton attraction={attraction} />
          <ShowOnMapButton
            onClick={() => {
              router.push(`/main?attractionId=${attraction.id}`);
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
}
