"use client";

import { cn } from "@/lib/utils";
import type { CSSProperties } from "react";
import { memo } from "react";

export type ShimmerProps = {
  children: React.ReactNode;
  className?: string;
  duration?: number;
};

export const Shimmer = memo(
  ({ children, className, duration = 2 }: ShimmerProps) => {
    const style: CSSProperties = {
      animationDuration: `${duration}s`,
    };

    return (
      <span
        className={cn(
          "inline-flex bg-clip-text text-transparent",
          className
        )}
        style={style}
      >
        <span
          className={cn(
            "animate-shimmer bg-gradient-to-r from-muted-foreground via-foreground to-muted-foreground bg-[length:200%_100%] bg-clip-text text-transparent",
          )}
          style={style}
        >
          {children}
        </span>
      </span>
    );
  }
);

Shimmer.displayName = "Shimmer";
