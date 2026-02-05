"use client";

import { Button } from "../button";
import { LocateFixed } from "lucide-react";

export const ShowOnMapButton = ({ onClick }: { onClick: () => void }) => {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      title="Показать на карте"
      className="cursor-pointer"
    >
      <LocateFixed className="h-4 w-4" />
    </Button>
  );
};
