/**
 * Demo mode configuration
 * Defines the demo repository that can be accessed without authentication
 */

export const DEMO_CONFIG = {
  owner: "vercel",
  repo: "next.js",
  year: 2024,
  // Full path for easy matching
  get path() {
    return `/wrapped/${this.owner}/${this.repo}`;
  },
  // Check if a given owner/repo matches the demo
  isDemo(owner: string, repo: string): boolean {
    return owner.toLowerCase() === this.owner.toLowerCase() && 
           repo.toLowerCase() === this.repo.toLowerCase();
  }
} as const;

