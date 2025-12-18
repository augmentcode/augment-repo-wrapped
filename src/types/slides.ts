export type SlideType =
  | "cover"
  | "commits"
  | "pull-requests"
  | "pr-highlights"
  | "reviews"
  | "activity"
  | "contributors"
  | "code-changes"
  | "community"
  | "personality"
  | "augment"
  | "finale";

export interface SlideConfig {
  type: SlideType;
  duration: number;
  gradientClass: string;
}

// On-brand dark theme using the Augment color scheme
export const SLIDE_CONFIGS: SlideConfig[] = [
  { type: "cover", duration: 5000, gradientClass: "bg-background" },
  { type: "commits", duration: 7000, gradientClass: "bg-background" },
  { type: "pull-requests", duration: 7000, gradientClass: "bg-background" },
  { type: "pr-highlights", duration: 8000, gradientClass: "bg-background" },
  { type: "reviews", duration: 8000, gradientClass: "bg-background" },
  { type: "activity", duration: 8000, gradientClass: "bg-background" },
  { type: "contributors", duration: 10000, gradientClass: "bg-background" },
  { type: "code-changes", duration: 7000, gradientClass: "bg-background" },
  { type: "community", duration: 6000, gradientClass: "bg-background" },
  { type: "personality", duration: 8000, gradientClass: "bg-background" },
  { type: "augment", duration: 6000, gradientClass: "bg-background" },
  { type: "finale", duration: 0, gradientClass: "bg-background" },
];

export const TOTAL_SLIDES = SLIDE_CONFIGS.length;
