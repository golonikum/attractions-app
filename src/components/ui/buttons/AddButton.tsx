"use client";

import { MouseEventHandler } from "react";
import { Button } from "../button";
import { SquarePlus } from "lucide-react";

export const AddButton = ({
  onClick,
  title = "Добавить",
}: {
  onClick?: MouseEventHandler<HTMLButtonElement>;
  title?: string;
}) => {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      title={title}
      className="text-green-600 cursor-pointer"
    >
      <SquarePlus className="h-4 w-4" />
    </Button>
  );
};
