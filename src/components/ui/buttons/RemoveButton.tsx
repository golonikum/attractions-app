"use client";

import { MouseEventHandler } from "react";
import { Button } from "../button";
import { Trash2 } from "lucide-react";

export const RemoveButton = ({
  onClick,
}: {
  onClick: MouseEventHandler<HTMLButtonElement>;
}) => {
  return (
    <Button
      variant="ghost"
      size="sm"
      className="text-red-500"
      onClick={onClick}
      title="Удалить"
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  );
};
