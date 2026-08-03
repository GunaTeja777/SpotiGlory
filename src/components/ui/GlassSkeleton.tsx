import React from "react";

export interface GlassSkeletonProps {
  className?: string;
}

export const GlassSkeleton: React.FC<GlassSkeletonProps> = ({ className = "" }) => {
  return (
    <div
      className={`animate-pulse bg-white/[0.08] border border-white/10 ${className}`}
    />
  );
};
