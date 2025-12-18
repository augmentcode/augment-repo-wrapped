"use client";

import { cn } from "@/lib/utils";
import { SLIDE_CONFIGS } from "@/types/slides";

interface ProgressIndicatorProps {
  currentIndex: number;
  progress: number;
}

export function ProgressIndicator({
  currentIndex,
  progress,
}: ProgressIndicatorProps) {
  return (
    <div className="absolute top-0 left-0 right-0 z-20 flex gap-1 p-3">
      {SLIDE_CONFIGS.map((_, index) => (
        <div
          key={index}
          className="h-0.5 flex-1 rounded-full bg-muted/50 overflow-hidden"
        >
          <div
            className={cn(
              "h-full bg-foreground rounded-full transition-all duration-100",
              index < currentIndex && "w-full",
              index > currentIndex && "w-0"
            )}
            style={{
              width:
                index === currentIndex
                  ? `${progress}%`
                  : index < currentIndex
                    ? "100%"
                    : "0%",
            }}
          />
        </div>
      ))}
    </div>
  );
}
