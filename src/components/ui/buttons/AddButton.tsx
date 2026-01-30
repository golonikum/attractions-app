"use client";

import {
  ForwardRefExoticComponent,
  MouseEventHandler,
  RefAttributes,
} from "react";
import { Button } from "../button";
import { LucideProps, MessageSquarePlus, SquarePlus } from "lucide-react";

type AddButtonType = "default" | "note";

const iconsMap: Record<
  AddButtonType,
  ForwardRefExoticComponent<
    Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>
  >
> = {
  default: SquarePlus,
  note: MessageSquarePlus,
};

export const AddButton = ({
  onClick,
  title = "Добавить",
  type = "default",
}: {
  onClick?: MouseEventHandler<HTMLButtonElement>;
  title?: string;
  type?: AddButtonType;
}) => {
  const Icon = iconsMap[type];

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
