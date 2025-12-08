"use client";

import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Navigation } from "@/components/Navigation";

export default function MainPage() {
  return (
    <ProtectedRoute>
      <Navigation />
      <div className="container mx-auto pt-24 px-4 pb-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Достопримечательности</h1>
        </div>
      </div>
    </ProtectedRoute>
  );
}
