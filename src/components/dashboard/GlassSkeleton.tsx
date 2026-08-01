"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface GlassSkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export const GlassSkeleton: React.FC<GlassSkeletonProps> = ({ className, ...props }) => {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl bg-white/[0.05] border border-white/10 backdrop-blur-md animate-pulse",
        "before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/[0.08] before:to-transparent",
        className
      )}
      {...props}
    />
  );
};
