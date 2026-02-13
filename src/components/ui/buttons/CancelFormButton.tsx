import { FC } from "react";
import { Button } from "../button";

export const CancelFormButton: FC<{
  onClick: () => void;
}> = ({ onClick }) => (
  <Button type="button" variant="outline" onClick={onClick}>
    Отмена
  </Button>
);
