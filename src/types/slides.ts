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
  | "augment";

export interface SlideConfig {
  type: SlideType;
  duration: number;
  gradientClass: string;
}

// On-brand dark theme using the Augment color scheme
// Durations increased for better readability
export const SLIDE_CONFIGS: SlideConfig[] = [
  { type: "cover", duration: 7000, gradientClass: "bg-background" },           // 5s → 7s
  { type: "commits", duration: 10000, gradientClass: "bg-background" },        // 7s → 10s
  { type: "pull-requests", duration: 10000, gradientClass: "bg-background" },  // 7s → 10s
  { type: "pr-highlights", duration: 12000, gradientClass: "bg-background" },  // 8s → 12s
  { type: "reviews", duration: 12000, gradientClass: "bg-background" },        // 8s → 12s
  { type: "activity", duration: 12000, gradientClass: "bg-background" },       // 8s → 12s
  { type: "contributors", duration: 15000, gradientClass: "bg-background" },   // 10s → 15s
  { type: "code-changes", duration: 10000, gradientClass: "bg-background" },   // 7s → 10s
  { type: "community", duration: 9000, gradientClass: "bg-background" },       // 6s → 9s
  { type: "personality", duration: 12000, gradientClass: "bg-background" },    // 8s → 12s
  { type: "augment", duration: 0, gradientClass: "bg-background" },            // No auto-advance (last slide)
];

export const TOTAL_SLIDES = SLIDE_CONFIGS.length;
