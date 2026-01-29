"use client";

import { MouseEventHandler } from "react";
import { Button } from "../button";
import { Plus } from "lucide-react";

export const AddButton = ({
  onClick,
}: {
  onClick?: MouseEventHandler<HTMLButtonElement>;
}) => {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      title="Добавить"
      className="text-green-500 cursor-pointer"
    >
      <Plus className="h-4 w-4" />
    </Button>
  );
};
