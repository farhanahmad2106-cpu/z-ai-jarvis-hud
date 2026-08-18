"use client";
import { useState, useEffect } from "react";

/**
 * Hook to check if we are on the client side.
 */
export function useIsMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const frame = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  return mounted;
}

/**
 * Safely executes browser APIs without crashing Node/Edge runtimes.
 */
export const safeBrowserCall = <T,>(cb: () => T, fallback: T): T => {
  if (typeof window === "undefined" || typeof navigator === "undefined") {
    return fallback;
  }
  try {
    return cb();
  } catch (error) {
    console.error("[Z-AI] Browser API execution blocked:", error);
    return fallback;
  }
};
