import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Calendar } from "lucide-react";
import { Attraction } from "@/types/attraction";
import { Tag } from "@/components/ui/Tag";
import { AttractionImage } from "./AttractionImage";
import { useIsMobile } from "@/hooks/useIsMobile";

interface AttractionInfoCardProps {
  attraction: Attraction;
}

export function AttractionInfoCard({ attraction }: AttractionInfoCardProps) {
  const { isWideScreen } = useIsMobile();

  return (
    <Card className={attraction.isVisited ? "bg-green-50" : ""}>
      <CardHeader>
        <div className="flex gap-4 justify-between items-start">
          <CardTitle>{attraction.name}</CardTitle>
          {attraction.category && (
            <Tag text={attraction.category} variant="default" />
          )}
          {attraction.isFavorite && <Tag text="Избранное" variant="warning" />}
        </div>
      </CardHeader>

      <CardContent
        className={`flex gap-4 ${isWideScreen ? "flex-row" : "flex-col"}`}
      >
        <AttractionImage
          attraction={attraction}
          className={`${isWideScreen ? "w-48" : "h-48"}`}
        />

        <div className="flex flex-col gap-4">
          {attraction.description && (
            <p className="text-gray-600 mb-4">{attraction.description}</p>
          )}

          <div className="flex justify-between text-sm text-gray-500 mb-4">
            <span>
              Координаты: {attraction.coordinates[0].toFixed(4)},{" "}
              {attraction.coordinates[1].toFixed(4)}
            </span>
            <span>Порядок: {attraction.order}</span>
          </div>

          {attraction.notes && attraction.notes.length > 0 && (
            <div className="mt-4">
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

          {attraction.yaMapUrl && (
            <div className="mt-4">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => window.open(attraction.yaMapUrl, "_blank")}
              >
                <MapPin className="mr-2 h-4 w-4" />
                Открыть на Яндекс.Картах
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
