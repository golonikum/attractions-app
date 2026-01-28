import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";
import { Attraction } from "@/types/attraction";

interface AttractionInfoCardProps {
  attraction: Attraction;
}

export function AttractionInfoCard({ attraction }: AttractionInfoCardProps) {
  return (
    <Card className={attraction.isVisited ? "bg-green-50" : ""}>
      <CardHeader>
        <div className="flex gap-4 justify-between items-start">
          <CardTitle>{attraction.name}</CardTitle>
          {attraction.category && (
            <span className="inline-block px-2 py-1 text-xs bg-primary/10 text-primary rounded-full">
              {attraction.category}
            </span>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {attraction.description && (
          <p className="text-gray-600 mb-4">{attraction.description}</p>
        )}

        {attraction.imageUrl && (
          <div className="mb-4">
            <img
              src={attraction.imageUrl}
              alt={attraction.name}
              className="w-full h-48 object-cover rounded-md"
            />
          </div>
        )}

        <div className="flex justify-between text-sm text-gray-500 mb-4">
          <span>
            Координаты: {attraction.coordinates[0].toFixed(4)},{" "}
            {attraction.coordinates[1].toFixed(4)}
          </span>
          <span>Порядок: {attraction.order}</span>
        </div>

        {attraction.yaMapUrl && (
          <div className="mt-4">
            <Button variant="outline" className="w-full">
              <MapPin className="mr-2 h-4 w-4" />
              Открыть на Яндекс.Картах
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
