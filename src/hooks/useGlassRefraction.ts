"use client";

import { useRef, useEffect, useCallback } from "react";

interface UseGlassRefractionOptions {
  enabled?: boolean;
  intensity?: "subtle" | "medium" | "intense";
}

export function useGlassRefraction<T extends HTMLElement = HTMLDivElement>(
  options: UseGlassRefractionOptions = {}
) {
  const { enabled = true, intensity = "medium" } = options;
  const elementRef = useRef<T | null>(null);
  const rafId = useRef<number | null>(null);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!elementRef.current || !enabled) return;

      const element = elementRef.current;
      const rect = element.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      if (rafId.current !== null) {
        cancelAnimationFrame(rafId.current);
      }

      rafId.current = requestAnimationFrame(() => {
        element.style.setProperty("--mouse-x", `${x}px`);
        element.style.setProperty("--mouse-y", `${y}px`);
        element.style.setProperty("--mouse-opacity", "1");
        
        let spotRadius = "500px";
        if (intensity === "subtle") spotRadius = "350px";
        if (intensity === "intense") spotRadius = "700px";
        
        element.style.setProperty("--refraction-radius", spotRadius);
      });
    },
    [enabled, intensity]
  );

  const handleMouseLeave = useCallback(() => {
    if (!elementRef.current) return;
    const element = elementRef.current;

    if (rafId.current !== null) {
      cancelAnimationFrame(rafId.current);
    }

    rafId.current = requestAnimationFrame(() => {
      element.style.setProperty("--mouse-opacity", "0");
    });
  }, []);

  useEffect(() => {
    const element = elementRef.current;
    if (!element || !enabled) return;

    element.addEventListener("mousemove", handleMouseMove);
    element.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      element.removeEventListener("mousemove", handleMouseMove);
      element.removeEventListener("mouseleave", handleMouseLeave);
      if (rafId.current !== null) {
        cancelAnimationFrame(rafId.current);
      }
    };
  }, [enabled, handleMouseMove, handleMouseLeave]);

  return elementRef;
}
