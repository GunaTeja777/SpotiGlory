"use client";

import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { useGlassRefraction } from "@/hooks/useGlassRefraction";

export interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "interactive" | "glowing";
  radius?: "xl" | "2xl" | "3xl" | "4xl" | "full";
  enableRefraction?: boolean;
  refractionIntensity?: "subtle" | "medium" | "intense";
  children?: React.ReactNode;
}

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  (
    {
      className,
      variant = "default",
      radius = "3xl",
      enableRefraction = false,
      refractionIntensity = "medium",
      children,
      ...props
    },
    ref
  ) => {
    const refractionRef = useGlassRefraction<HTMLDivElement>({
      enabled: enableRefraction || variant === "interactive",
      intensity: refractionIntensity,
    });

    const radiusClasses = {
      xl: "rounded-xl",
      "2xl": "rounded-2xl",
      "3xl": "rounded-3xl",
      "4xl": "rounded-4xl",
      full: "rounded-full",
    }[radius];

    const variantClasses = {
      default:
        "bg-white/[0.06] backdrop-blur-xl border border-white/[0.12] shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.25),0_16px_36px_-10px_rgba(0,0,0,0.5)]",
      elevated:
        "bg-gradient-to-br from-white/[0.09] to-white/[0.04] backdrop-blur-2xl border border-white/[0.18] shadow-[inset_0_1px_1.5px_0_rgba(255,255,255,0.35),0_24px_48px_-12px_rgba(0,0,0,0.7)]",
      interactive:
        "bg-white/[0.06] backdrop-blur-xl border border-white/[0.12] shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.25),0_16px_36px_-10px_rgba(0,0,0,0.5)] transition-all duration-300 hover:bg-white/[0.09] hover:border-white/[0.22] hover:shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.45),0_24px_48px_-12px_rgba(0,0,0,0.65)] hover:-translate-y-0.5",
      glowing:
        "bg-white/[0.06] backdrop-blur-xl border border-[#1DB954]/30 shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.3),0_0_30px_-5px_rgba(29,185,84,0.3)]",
    }[variant];

    return (
      <div
        ref={(node) => {
          // Set hook ref
          (refractionRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
          // Forward external ref if provided
          if (typeof ref === "function") {
            ref(node);
          } else if (ref) {
            (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
          }
        }}
        className={cn(
          "relative overflow-hidden glass-refraction-container text-gray-100",
          radiusClasses,
          variantClasses,
          className
        )}
        {...props}
      >
        {/* Dynamic Refraction Specular Overlay */}
        {(enableRefraction || variant === "interactive") && (
          <div className="glass-refraction-overlay" aria-hidden="true" />
        )}
        <div className="relative z-10">{children}</div>
      </div>
    );
  }
);

GlassCard.displayName = "GlassCard";
