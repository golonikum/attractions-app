"use client";

import { MouseEventHandler } from "react";
import { Button } from "../button";
import { Edit } from "lucide-react";

export const EditButton = ({
  onClick,
}: {
  onClick?: MouseEventHandler<HTMLButtonElement>;
}) => {
  return (
    <Button variant="ghost" size="sm" onClick={onClick} title="Изменить">
      <Edit className="h-4 w-4" />
    </Button>
  );
};
