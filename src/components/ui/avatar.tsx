"use client";

import { cn } from "@/lib/utils";
import Image from "next/image";

interface AvatarProps {
  src: string;
  alt: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeClasses = {
  sm: "h-8 w-8",
  md: "h-10 w-10",
  lg: "h-14 w-14",
  xl: "h-20 w-20",
};

const sizePixels = {
  sm: 32,
  md: 40,
  lg: 56,
  xl: 80,
};

export function Avatar({ src, alt, size = "md", className }: AvatarProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-full bg-muted",
        sizeClasses[size],
        className
      )}
    >
      <Image
        src={src}
        alt={alt}
        width={sizePixels[size]}
        height={sizePixels[size]}
        className="h-full w-full object-cover"
      />
    </div>
  );
}

interface AvatarStackProps {
  avatars: { src: string; alt: string }[];
  size?: "sm" | "md" | "lg";
  max?: number;
  className?: string;
}

export function AvatarStack({
  avatars,
  size = "md",
  max = 5,
  className,
}: AvatarStackProps) {
  const displayed = avatars.slice(0, max);
  const remaining = avatars.length - max;

  return (
    <div className={cn("flex -space-x-2", className)}>
      {displayed.map((avatar, index) => (
        <div
          key={index}
          className="relative ring-2 ring-background rounded-full"
          style={{ zIndex: displayed.length - index }}
        >
          <Avatar src={avatar.src} alt={avatar.alt} size={size} />
        </div>
      ))}
      {remaining > 0 && (
        <div
          className={cn(
            "relative flex items-center justify-center rounded-full bg-muted text-muted-foreground font-medium ring-2 ring-background",
            sizeClasses[size]
          )}
          style={{ zIndex: 0 }}
        >
          +{remaining}
        </div>
      )}
    </div>
  );
}
