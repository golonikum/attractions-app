import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "lucide-react";
import { Attraction } from "@/types/attraction";
import { Tag } from "@/components/ui/Tag";
import { AttractionImage } from "./AttractionImage";
import { useIsMobile } from "@/hooks/useIsMobile";
import { OpenInYandexMapButton, ShowOnMapButton } from "../ui/buttons";
import { useRouter } from "next/navigation";
import { Group } from "@/types/group";
import { Button } from "../ui/button";
import { locateItemOnMainMap } from "@/lib/locateItemOnMainMap";

interface AttractionInfoCardProps {
  attraction: Attraction;
  group: Group | null;
}

export function AttractionInfoCard({
  attraction,
  group,
}: AttractionInfoCardProps) {
  const { isWideScreen } = useIsMobile();
  const router = useRouter();

  return (
    <Card isFavorite={attraction.isFavorite} isVisited={attraction.isVisited}>
      <CardHeader>
        <div className="flex gap-4 justify-between items-start">
          <CardTitle className="flex flex-col gap-2 flex-start">
            {attraction.name}{" "}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push(`/groups/${group?.id}`)}
              className="mr-4 cursor-pointer w-fit"
            >
              {group?.name}
            </Button>
          </CardTitle>
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
          className={`rounded-md ${isWideScreen ? "h-full w-1/2" : "h-96 w-full"}`}
        />

        <div className="flex flex-col gap-6">
          {attraction.description && (
            <p className="text-gray-600 whitespace-pre-wrap">
              {attraction.description}
            </p>
          )}

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

          {!isWideScreen && (
            <>
              <OpenInYandexMapButton attraction={attraction} />
              <ShowOnMapButton
                onClick={() => {
                  locateItemOnMainMap({ router, item: attraction });
                }}
              />
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
