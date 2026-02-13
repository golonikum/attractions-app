import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Button } from "../button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/router";

export const NotFoundStub = ({
  message = "Ничего не найдено",
}: {
  message?: string;
}) => {
  const router = useRouter();

  return (
    <ProtectedRoute>
      <div className="container mx-auto pt-20 px-4 pb-8">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold">{message}</h2>
          <Button className="mt-4" onClick={() => router.push("/groups")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Назад
          </Button>
        </div>
      </div>
    </ProtectedRoute>
  );
};
