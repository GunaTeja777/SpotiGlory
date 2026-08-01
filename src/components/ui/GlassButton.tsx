"use client";

import React, { forwardRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { useGlassRefraction } from "@/hooks/useGlassRefraction";

const glassButtonVariants = cva(
  "inline-flex items-center justify-center font-semibold tracking-tight transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none relative overflow-hidden glass-refraction-container select-none cursor-pointer",
  {
    variants: {
      variant: {
        primary:
          "bg-[#1DB954] hover:bg-[#1ED760] text-black shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.45),0_0_20px_-3px_rgba(29,185,84,0.5)] border border-[#1ED760]/40 hover:shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.6),0_0_30px_0px_rgba(29,185,84,0.7)] hover:-translate-y-0.5",
        ghost:
          "bg-white/[0.06] hover:bg-white/[0.12] text-white border border-white/[0.14] backdrop-blur-lg shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.25)] hover:border-white/[0.28] hover:shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.45)] hover:-translate-y-0.5",
        "spotify-ghost":
          "bg-white/[0.05] hover:bg-[#1DB954]/15 text-[#1DB954] hover:text-[#1ED760] border border-[#1DB954]/30 hover:border-[#1DB954]/60 backdrop-blur-lg shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.2)] hover:shadow-[0_0_20px_-4px_rgba(29,185,84,0.4)]",
        subtle:
          "bg-transparent hover:bg-white/[0.08] text-gray-300 hover:text-white border border-transparent hover:border-white/[0.1]",
      },
      size: {
        sm: "h-9 px-4 text-xs rounded-full gap-1.5",
        md: "h-11 px-6 text-sm rounded-full gap-2",
        lg: "h-13 px-8 text-base rounded-full gap-2.5",
        icon: "h-10 w-10 p-0 rounded-full",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface GlassButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof glassButtonVariants> {
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  enableRefraction?: boolean;
}

export const GlassButton = forwardRef<HTMLButtonElement, GlassButtonProps>(
  (
    {
      className,
      variant,
      size,
      isLoading = false,
      leftIcon,
      rightIcon,
      enableRefraction = true,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const refractionRef = useGlassRefraction<HTMLButtonElement>({
      enabled: enableRefraction && !disabled && !isLoading,
      intensity: "subtle",
    });

    return (
      <button
        ref={(node) => {
          (refractionRef as React.MutableRefObject<HTMLButtonElement | null>).current = node;
          if (typeof ref === "function") {
            ref(node);
          } else if (ref) {
            (ref as React.MutableRefObject<HTMLButtonElement | null>).current = node;
          }
        }}
        className={cn(glassButtonVariants({ variant, size }), className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {enableRefraction && (
          <div className="glass-refraction-overlay" aria-hidden="true" />
        )}
        <span className="relative z-10 flex items-center justify-center gap-2">
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin text-current" />
          ) : (
            leftIcon
          )}
          {children}
          {!isLoading && rightIcon}
        </span>
      </button>
    );
  }
);

GlassButton.displayName = "GlassButton";
