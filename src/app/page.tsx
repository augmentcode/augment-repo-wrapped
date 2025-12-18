import { RepoSearch } from "@/components/layout/repo-search";
import { GitCommit, GitPullRequest, Users, Code2, ArrowRight } from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-24 sm:py-32 lg:py-40">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="max-w-2xl">
            <p className="eyebrow text-secondary mb-6">2025 Year in Review</p>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-medium tracking-tight mb-3">
              Repo Wrapped
            </h1>
            <p className="text-muted-foreground mb-10">
              by Augment Code
            </p>

            <p className="text-lg text-muted-foreground mb-10 leading-relaxed">
              Generate a beautiful year-in-review for any GitHub repository.
              Celebrate your team&apos;s commits, PRs, and contributions.
            </p>

            <RepoSearch />
          </div>
        </div>
      </section>

      {/* Stats Preview */}
      <section className="py-16 border-t border-border">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              icon={<GitCommit className="h-4 w-4" />}
              label="Commits"
              description="Track yearly activity"
            />
            <StatCard
              icon={<GitPullRequest className="h-4 w-4" />}
              label="Pull Requests"
              description="Merge metrics"
            />
            <StatCard
              icon={<Users className="h-4 w-4" />}
              label="Contributors"
              description="Team leaderboard"
            />
            <StatCard
              icon={<Code2 className="h-4 w-4" />}
              label="Code Changes"
              description="Lines added & removed"
            />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 border-t border-border bg-card">
        <div className="container mx-auto px-6 max-w-4xl">
          <p className="eyebrow text-muted-foreground mb-2">How it works</p>
          <p className="text-2xl font-medium mb-10">Three simple steps</p>

          <div className="grid md:grid-cols-3 gap-8">
            <StepCard
              number="01"
              title="Enter repository"
              description="Paste any GitHub repo URL or use owner/repo format"
            />
            <StepCard
              number="02"
              title="Generate wrapped"
              description="We analyze commits, PRs, issues, and contributors"
            />
            <StepCard
              number="03"
              title="Share your story"
              description="Copy slides to clipboard or download as images"
            />
          </div>
        </div>
      </section>

      {/* Slides Preview */}
      <section className="py-16 border-t border-border">
        <div className="container mx-auto px-6 max-w-4xl">
          <p className="eyebrow text-muted-foreground mb-2">Story slides</p>
          <p className="text-2xl font-medium mb-10">9 data-driven slides</p>

          <div className="grid grid-cols-3 sm:grid-cols-9 gap-2">
            {[
              "Cover",
              "Commits",
              "PRs",
              "Activity",
              "Team",
              "Code",
              "Community",
              "Augment",
              "Finale",
            ].map((name, i) => (
              <div key={i} className="group">
                <div className="aspect-[9/16] bg-card border border-border group-hover:border-secondary/50 transition-colors flex items-center justify-center">
                  <span className="font-mono text-xs text-muted-foreground">{String(i + 1).padStart(2, '0')}</span>
                </div>
                <p className="text-[10px] text-muted-foreground mt-2 text-center">{name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 border-t border-border">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
            <div>
              <h2 className="text-2xl font-medium mb-2">Ready to see your year in code?</h2>
              <p className="text-muted-foreground">Enter any public GitHub repository to get started.</p>
            </div>
            <div className="flex-shrink-0">
              <RepoSearch />
            </div>
          </div>
        </div>
      </section>

      {/* Augment Promo */}
      <section className="py-12 border-t border-border bg-card">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div>
              <p className="eyebrow text-muted-foreground mb-1">Powered by</p>
              <p className="text-lg font-medium">Augment Code</p>
              <p className="text-sm text-muted-foreground mt-1">AI-powered code reviews that catch bugs humans miss</p>
            </div>
            <a
              href="https://www.augmentcode.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-secondary text-secondary-foreground font-medium hover:opacity-90 transition-opacity"
            >
              Learn more
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

function StatCard({
  icon,
  label,
  description,
}: {
  icon: React.ReactNode;
  label: string;
  description: string;
}) {
  return (
    <div className="p-4 border border-border bg-card hover:border-secondary/30 transition-colors">
      <div className="text-secondary mb-2">{icon}</div>
      <p className="font-medium text-sm mb-0.5">{label}</p>
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
  );
}

function StepCard({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div>
      <span className="font-mono text-4xl font-light text-secondary/30">{number}</span>
      <div className="mt-2">
        <h3 className="font-medium mb-1">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
