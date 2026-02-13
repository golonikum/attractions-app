import { FC } from "react";
import { Button } from "../button";
import { Loader2 } from "lucide-react";

export const SubmitFormButton: FC<{
  id?: string;
  isSubmitting: boolean;
}> = ({ id, isSubmitting }) => (
  <Button type="submit" disabled={isSubmitting}>
    {isSubmitting ? (
      <>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        {id ? "Сохранение..." : "Создание..."}
      </>
    ) : id ? (
      "Сохранить"
    ) : (
      "Создать"
    )}
  </Button>
);
