"use client";

import { useRouter } from "next/navigation";
import { Button } from "../button";
import { ArrowLeft } from "lucide-react";

export const BackButton = () => {
  const router = useRouter();
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => router.back()}
      className="mr-4 cursor-pointer"
    >
      <ArrowLeft className="mr-2 h-4 w-4" />
      Назад
    </Button>
  );
};
