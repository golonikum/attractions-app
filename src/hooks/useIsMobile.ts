"use client";

import { useTheme } from "@/contexts/ThemeContext";

export function useIsMobile() {
  const { isMobile, isWideScreen } = useTheme();

  return { isMobile, isWideScreen };
}
