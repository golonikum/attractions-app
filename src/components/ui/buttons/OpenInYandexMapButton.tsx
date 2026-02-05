"use client";

import { Button } from "../button";
import { MapPinned } from "lucide-react";
import { Attraction } from "@/types/attraction";

export const OpenInYandexMapButton = ({
  attraction,
  view = "full",
}: {
  attraction: Attraction;
  view?: "icon" | "full";
}) => {
  if (!attraction.yaMapUrl) {
    return null;
  }

  const onClickHandler = () => window.open(attraction.yaMapUrl, "_blank");
  const label = "Открыть на Яндекс.Картах";

  return view === "icon" ? (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClickHandler}
      title={label}
      className="cursor-pointer"
    >
      <MapPinned className="h-4 w-4" />
    </Button>
  ) : (
    <Button variant="outline" className="w-full" onClick={onClickHandler}>
      <MapPinned className="mr-2 h-4 w-4" />
      {label}
    </Button>
  );
};
