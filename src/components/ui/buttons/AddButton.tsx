"use client";

import { MouseEventHandler } from "react";
import { Button } from "../button";
import { MessageSquarePlus, SquarePlus } from "lucide-react";

type AddButtonType = "default" | "note";

export const AddButton = ({
  onClick,
  title = "Добавить",
  type = "default",
}: {
  onClick?: MouseEventHandler<HTMLButtonElement>;
  title?: string;
  type?: AddButtonType;
}) => {
  const Icon = type === "default" ? SquarePlus : MessageSquarePlus;

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      title={title}
      className="text-green-600 cursor-pointer"
    >
      <Icon className="h-4 w-4" />
    </Button>
  );
};
