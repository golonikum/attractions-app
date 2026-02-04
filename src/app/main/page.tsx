"use client";

import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Navigation } from "@/components/Navigation";
import { Map } from "@/components/ui/Map";

export default function MainPage() {
  return (
    <ProtectedRoute>
      <Navigation />

      <div
        className="container mx-auto pt-20 px-4 pb-8"
        style={{ height: "calc(100vh)" }}
      >
        <div
          className="flex flex-col gap-4 justify-between items-center"
          style={{ height: "100%" }}
        >
          <div style={{ width: "100%", flex: "1 0 0" }}>
            <Map />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
