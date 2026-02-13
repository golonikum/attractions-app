import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Loader2 } from "lucide-react";

export const LoadingStub = () => (
  <ProtectedRoute>
    <div className="container mx-auto pt-20 px-4 pb-8">
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    </div>
  </ProtectedRoute>
);
