"use client";

import { Button } from "../button";
import { TextInitial } from "lucide-react";

export const ShowDescriptionButton = ({
  onClick,
}: {
  onClick?: () => void;
}) => {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      className="cursor-pointer w-fit"
    >
      <TextInitial className="mr-2 h-4 w-4" />
      Показать описание
    </Button>
  );
};
