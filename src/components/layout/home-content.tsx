"use client";

import { RepoSearch } from "@/components/layout/repo-search";
import { GitCommit, GitPullRequest, Users, Code2, Clock, ArrowRight, TrendingUp, TrendingDown } from "lucide-react";
import { WrappedData } from "@/types/wrapped";
import { useEffect, useState } from "react";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { formatDuration } from "@/lib/utils";
import { Session } from "next-auth";

interface HomeContentProps {
  initialData?: WrappedData | null;
  session?: Session | null;
}

export function HomeContent({ initialData, session }: HomeContentProps) {
  const [wrappedData, setWrappedData] = useState<WrappedData | null>(initialData || null);
  const [comparisonYear, setComparisonYear] = useState<number | null>(null);
  const [comparisonData, setComparisonData] = useState<WrappedData | null>(null);
  const [isLoadingComparison, setIsLoadingComparison] = useState(false);

  // Listen for wrapped data from localStorage (set after viewing reel)
  useEffect(() => {
    const handleStorageChange = () => {
      const stored = localStorage.getItem("lastWrappedData");
      if (stored) {
        try {
          setWrappedData(JSON.parse(stored));
        } catch (e) {
          console.error("Failed to parse wrapped data", e);
        }
      }
    };

    // Check on mount
    handleStorageChange();

    // Listen for custom event
    window.addEventListener("wrappedDataUpdated", handleStorageChange);

    return () => {
      window.removeEventListener("wrappedDataUpdated", handleStorageChange);
    };
  }, []);

  // Fetch comparison year data
  useEffect(() => {
    if (!comparisonYear || !wrappedData) {
      setComparisonData(null);
      return;
    }

    const fetchComparisonData = async () => {
      setIsLoadingComparison(true);

      // Check cache first
      const cacheKey = `wrapped_${wrappedData.repo.owner.login}_${wrappedData.repo.name}_${comparisonYear}`;
      const cached = localStorage.getItem(cacheKey);

      if (cached) {
        try {
          setComparisonData(JSON.parse(cached));
          setIsLoadingComparison(false);
          return;
        } catch (e) {
          console.error("Failed to parse cached comparison data", e);
        }
      }

      // Fetch from API
      try {
        const response = await fetch(
          `/api/github/wrapped?owner=${wrappedData.repo.owner.login}&repo=${wrappedData.repo.name}&year=${comparisonYear}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch comparison data");
        }

        const data = await response.json();
        setComparisonData(data);

        // Cache it
        localStorage.setItem(cacheKey, JSON.stringify(data));
      } catch (error) {
        console.error("Error fetching comparison data:", error);
        setComparisonData(null);
      } finally {
        setIsLoadingComparison(false);
      }
    };

    fetchComparisonData();
  }, [comparisonYear, wrappedData]);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const calculateDelta = (current: number, previous: number) => {
    const diff = current - previous;
    const percentChange = previous === 0 ? 100 : ((diff / previous) * 100);
    return { diff, percentChange };
  };

  const getAvailableYears = () => {
    if (!wrappedData) return [];

    const currentYear = new Date().getFullYear();
    const years = [];
    for (let year = currentYear; year >= 2022; year--) {
      // Exclude the current wrapped year
      if (year !== wrappedData.year) {
        years.push(year);
      }
    }
    return years;
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-24 sm:py-32 lg:py-40">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="max-w-2xl">
            <p className="eyebrow text-secondary mb-6">GitHub Repository Analytics</p>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-medium tracking-tight mb-3">
              Repo Insights
            </h1>
            <p className="text-muted-foreground mb-4">
              by Augment Code
            </p>
            <p className="text-lg text-muted-foreground mb-10">
              Visual analytics for your GitHub repositories. Track commits, pull requests, code changes, and team contributions across any time period. Perfect for retrospectives, progress tracking, and celebrating your team&apos;s achievements.
            </p>

            {/* How it works */}
            <div className="mb-10">
              <p className="eyebrow text-muted-foreground mb-2">How it works</p>
              <p className="text-2xl font-medium mb-6">Three simple steps</p>

              <div className="grid md:grid-cols-3 gap-6">
                <StepCard
                  number="01"
                  title="Enter repository"
                  description="Enter owner/repo (e.g., vercel/swr) or paste a full GitHub URL"
                />
                <StepCard
                  number="02"
                  title="View insights"
                  description="Explore an interactive visual story of your repository"
                />
                <StepCard
                  number="03"
                  title="Compare & share"
                  description="Compare time periods, track progress, and share results"
                />
              </div>
            </div>

            {/* Demo CTA - only show when not signed in */}
            {!session && (
              <div className="mb-8 p-6 border-2 border-secondary/30 bg-secondary/5 rounded-lg">
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-secondary mb-2">👉 Try the demo first</p>
                    <p className="text-sm text-muted-foreground mb-4">
                      Click <strong>Generate</strong> below to see an example with <span className="font-mono">vercel/swr</span>.
                      No sign-in required!
                    </p>
                    <RepoSearch wrappedData={wrappedData} isAuthenticated={false} />
                  </div>
                </div>
              </div>
            )}

            {/* Sign in CTA - only show when not signed in */}
            {!session && (
              <div className="mb-10 p-6 border border-border bg-card rounded-lg">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <p className="font-medium mb-1">Want to analyze your own repositories?</p>
                    <p className="text-sm text-muted-foreground">
                      Sign in with GitHub to generate insights for any repo you have access to
                    </p>
                  </div>
                  <Link
                    href="/login"
                    className="inline-flex items-center justify-center gap-2 h-10 px-6 bg-secondary text-secondary-foreground rounded-md text-sm font-medium hover:bg-secondary/80 transition-colors shrink-0"
                  >
                    Sign in with GitHub
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            )}

            {/* Repo search for signed-in users */}
            {session && (
              <div className="mb-10">
                <RepoSearch wrappedData={wrappedData} isAuthenticated={true} />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Slides Preview */}
      <section className="py-16 border-t border-border">
        <div className="container mx-auto px-6 max-w-4xl">
          <p className="eyebrow text-muted-foreground mb-2">Story slides</p>
          <div className="flex items-center gap-4 mb-10">
            <p className="text-2xl font-medium">
              {wrappedData ? "Your code in review" : "9 data-driven slides"}
            </p>
            {wrappedData && (
              <Link
                href={`/wrapped/${wrappedData.repo.owner.login}/${wrappedData.repo.name}?year=${wrappedData.year}`}
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap h-10 px-4 bg-secondary text-secondary-foreground rounded-md text-sm font-medium hover:bg-secondary/80 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 shrink-0"
              >
                View Reel Again
                <ArrowRight className="h-4 w-4" />
              </Link>
            )}
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-9 gap-2">
            {[
              { name: "Cover", icon: "📊", slideIndex: 0 },
              { name: "Commits", icon: "💻", slideIndex: 1 },
              { name: "PRs", icon: "🔀", slideIndex: 2 },
              { name: "Activity", icon: "📈", slideIndex: 5 },
              { name: "Team", icon: "👥", slideIndex: 6 },
              { name: "Code", icon: "⚡", slideIndex: 7 },
              { name: "Community", icon: "⭐", slideIndex: 8 },
              { name: "Augment", icon: "🤖", slideIndex: 10 },
              { name: "Finale", icon: "🎉", slideIndex: 11 },
            ].map((slide, i) => (
              <SlidePreview
                key={i}
                index={i}
                slideIndex={slide.slideIndex}
                name={slide.name}
                icon={slide.icon}
                data={wrappedData}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Stats Preview / Results */}
      {wrappedData && (
        <section className="py-16 border-t border-border bg-muted/30">
          <div className="container mx-auto px-6 max-w-4xl">
            <div className="mb-8">
              <p className="eyebrow text-muted-foreground mb-4">Your Results</p>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                <div className="flex items-center gap-4">
                  <div>
                    <h2 className="text-2xl font-medium">
                      {wrappedData.repo.name} - {wrappedData.year}
                    </h2>
                    <p className="eyebrow text-muted-foreground mt-1">
                      {wrappedData.repo.owner.login}/{wrappedData.repo.name}
                    </p>
                  </div>

                  {/* Year Comparison Dropdown */}
                  <div className="flex items-center gap-2">
                    <label htmlFor="compare-year" className="text-sm text-muted-foreground">
                      Compare:
                    </label>
                    <select
                      id="compare-year"
                      value={comparisonYear || ""}
                      onChange={(e) => setComparisonYear(e.target.value ? Number(e.target.value) : null)}
                      className="px-3 py-1.5 text-sm border border-border bg-card rounded hover:border-secondary/50 transition-colors"
                    >
                      <option value="">None</option>
                      {getAvailableYears().map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                    {isLoadingComparison && (
                      <Spinner size="sm" />
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      // Scroll to top where the input is
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="text-sm px-3 py-1.5 border border-border rounded hover:border-secondary/50 transition-colors"
                  >
                    Run another repo
                  </button>
                  <button
                    onClick={() => {
                      setWrappedData(null);
                      setComparisonData(null);
                      setComparisonYear(null);
                      localStorage.removeItem("lastWrappedData");
                    }}
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    Clear results
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <StatCard
                icon={<GitCommit className="h-4 w-4" />}
                label="Commits"
                value={wrappedData.commits.totalThisYear}
                comparisonValue={comparisonData?.commits.totalThisYear}
                description={wrappedData.commits.topCommitters.length > 0
                  ? `${wrappedData.commits.topCommitters[0].commits} by ${wrappedData.commits.topCommitters[0].login}`
                  : "Track yearly activity"}
              />
              <StatCard
                icon={<GitPullRequest className="h-4 w-4" />}
                label="Pull Requests"
                value={wrappedData.pullRequests.opened}
                comparisonValue={comparisonData?.pullRequests.opened}
                description={`${wrappedData.pullRequests.merged} merged`}
              />
              <StatCard
                icon={<Users className="h-4 w-4" />}
                label="Contributors"
                value={wrappedData.contributors.total}
                comparisonValue={comparisonData?.contributors.total}
                description={`${wrappedData.contributors.newThisYear} new this year`}
              />
              <StatCard
                icon={<Code2 className="h-4 w-4" />}
                label="Code Changes"
                value={wrappedData.codeChanges.additions + wrappedData.codeChanges.deletions}
                comparisonValue={comparisonData ? comparisonData.codeChanges.additions + comparisonData.codeChanges.deletions : undefined}
                description={`+${formatNumber(wrappedData.codeChanges.additions)} / -${formatNumber(wrappedData.codeChanges.deletions)}`}
              />
              <StatCard
                icon={<Clock className="h-4 w-4" />}
                label="Avg Merge Time"
                value={wrappedData.pullRequests.averageMergeTimeHours}
                comparisonValue={comparisonData?.pullRequests.averageMergeTimeHours}
                description={wrappedData.pullRequests.merged > 0 ? `${wrappedData.pullRequests.merged} PRs merged` : "No PRs merged"}
                formatValue={(hours) => formatDuration(hours)}
              />
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-16 border-t border-border">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
            <div>
              <h2 className="text-2xl font-medium mb-2">Ready to analyze your repository?</h2>
              <p className="text-muted-foreground">Get insights into your team&apos;s work across any time period.</p>
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
  value,
  comparisonValue,
  description,
  formatValue,
}: {
  icon: React.ReactNode;
  label: string;
  value?: number;
  comparisonValue?: number;
  description: string;
  formatValue?: (value: number) => string;
}) {
  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toLocaleString();
  };

  const renderDelta = () => {
    if (value === undefined || comparisonValue === undefined) return null;

    const diff = value - comparisonValue;
    const percentChange = comparisonValue === 0 ? 100 : ((diff / comparisonValue) * 100);
    const isPositive = diff > 0;
    const isNeutral = diff === 0;

    if (isNeutral) {
      return (
        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
          <span>No change</span>
        </div>
      );
    }

    // For merge time, lower is better (inverse the color logic)
    const isMergeTime = label === "Avg Merge Time";
    const isGood = isMergeTime ? !isPositive : isPositive;

    return (
      <div className={`flex items-center gap-1 text-xs mt-1 ${isGood ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
        {isPositive ? (
          <TrendingUp className="h-3 w-3" />
        ) : (
          <TrendingDown className="h-3 w-3" />
        )}
        <span>
          {isPositive ? '+' : ''}{formatValue ? formatValue(Math.abs(diff)) : formatNumber(Math.abs(diff))} ({isPositive ? '+' : ''}{percentChange.toFixed(1)}%)
        </span>
      </div>
    );
  };

  return (
    <div className="p-4 border border-border bg-card hover:border-secondary/30 transition-colors">
      <div className="text-secondary mb-3">{icon}</div>
      {value !== undefined ? (
        <>
          <p className="text-2xl font-medium mb-1">{formatValue ? formatValue(value) : formatNumber(value)}</p>
          <p className="eyebrow text-muted-foreground mb-1">{label}</p>
          {renderDelta()}
        </>
      ) : (
        <p className="eyebrow text-muted-foreground mb-1">{label}</p>
      )}
      <p className="text-xs text-muted-foreground mt-2">{description}</p>
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

function SlidePreview({
  index,
  slideIndex,
  name,
  icon,
  data,
}: {
  index: number;
  slideIndex: number;
  name: string;
  icon: string;
  data: WrappedData | null;
}) {
  const getSlidePreview = () => {
    if (!data) return null;

    const formatNumber = (num: number | undefined) => {
      if (num === undefined || num === null) return '0';
      if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
      if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
      return num.toLocaleString();
    };

    switch (name) {
      case "Cover":
        return (
          <div className="text-center">
            <div className="text-lg mb-1">{icon}</div>
            <div className="text-[8px] font-medium truncate">{data.repo.name}</div>
            <div className="text-[7px] text-muted-foreground">{data.year}</div>
          </div>
        );
      case "Commits":
        return (
          <div className="text-center">
            <div className="text-lg mb-1">{icon}</div>
            <div className="text-xs font-bold">{formatNumber(data.commits.totalThisYear)}</div>
            <div className="text-[7px] text-muted-foreground">commits</div>
          </div>
        );
      case "PRs":
        return (
          <div className="text-center">
            <div className="text-lg mb-1">{icon}</div>
            <div className="text-xs font-bold">{formatNumber(data.pullRequests.opened)}</div>
            <div className="text-[7px] text-muted-foreground">PRs</div>
          </div>
        );
      case "Activity":
        return (
          <div className="text-center">
            <div className="text-lg mb-1">{icon}</div>
            <div className="text-[8px] font-medium truncate">{data.activity.busiestMonth.month}</div>
            <div className="text-[7px] text-muted-foreground">busiest</div>
          </div>
        );
      case "Team":
        return (
          <div className="text-center">
            <div className="text-lg mb-1">{icon}</div>
            <div className="text-xs font-bold">{data.contributors.total}</div>
            <div className="text-[7px] text-muted-foreground">contributors</div>
          </div>
        );
      case "Code":
        return (
          <div className="text-center">
            <div className="text-lg mb-1">{icon}</div>
            <div className="text-xs font-bold">{formatNumber(data.codeChanges.additions)}</div>
            <div className="text-[7px] text-muted-foreground">lines added</div>
          </div>
        );
      case "Community":
        return (
          <div className="text-center">
            <div className="text-lg mb-1">{icon}</div>
            <div className="text-xs font-bold">{formatNumber(data.community.starsGained)}</div>
            <div className="text-[7px] text-muted-foreground">stars gained</div>
          </div>
        );
      case "Augment":
        return (
          <div className="text-center">
            <div className="text-lg mb-1">{icon}</div>
            <div className="text-[8px] font-medium">Augment</div>
            <div className="text-[7px] text-muted-foreground">Code</div>
          </div>
        );
      case "Finale":
        return (
          <div className="text-center">
            <div className="text-lg mb-1">{icon}</div>
            <div className="text-[8px] font-medium">{data.year}</div>
            <div className="text-[7px] text-muted-foreground">wrapped</div>
          </div>
        );
      default:
        return null;
    }
  };

  const handleClick = () => {
    if (data) {
      // Navigate to wrapped page with the correct slide index
      window.location.href = `/wrapped/${data.repo.owner.login}/${data.repo.name}?year=${data.year}&slide=${slideIndex}`;
    }
  };

  const preview = getSlidePreview();

  return (
    <div className="group">
      <div
        className={`aspect-[9/16] bg-card border border-border transition-colors flex items-center justify-center p-2 ${
          data
            ? "cursor-pointer hover:border-secondary hover:shadow-lg"
            : "group-hover:border-secondary/50"
        }`}
        onClick={handleClick}
      >
        {preview || (
          <span className="font-mono text-xs text-muted-foreground">
            {String(index + 1).padStart(2, "0")}
          </span>
        )}
      </div>
      <p className="text-[10px] text-muted-foreground mt-2 text-center">{name}</p>
    </div>
  );
}

