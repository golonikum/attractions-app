"use client";

import { Button } from "../button";
import { MapPinned } from "lucide-react";
import { Attraction } from "@/types/attraction";

export const OpenInYandexMapButton = ({
  attraction,
}: {
  attraction: Attraction;
}) => {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => window.open(attraction.yaMapUrl, "_blank")}
      title="Открыть на Яндекс.Картах"
      className="cursor-pointer"
    >
      <MapPinned className="h-4 w-4" />
    </Button>
  );
};
