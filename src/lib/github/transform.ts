import {
  GitHubRepo,
  GitHubContributor,
  GitHubPullRequest,
  GitHubIssue,
  GitHubLanguages,
  GitHubCommitActivity,
  GitHubContributorStats,
  GitHubReview,
} from "@/types/github";
import {
  WrappedData,
  RepoInfo,
  CommitStats,
  PRStats,
  PRHighlight,
  IssueStats,
  ContributorStats,
  CodeStats,
  CommunityStats,
  ActivityStats,
  ReviewStats,
  VelocityStats,
  RepoPersonality,
  RepoPersonalityType,
} from "@/types/wrapped";
import { getLanguageColor, getMonthName, getDayName } from "@/lib/utils";

export function transformRepoInfo(repo: GitHubRepo): RepoInfo {
  return {
    name: repo.name,
    fullName: repo.full_name,
    owner: {
      login: repo.owner.login,
      avatarUrl: repo.owner.avatar_url,
    },
    description: repo.description,
    language: repo.language,
    stars: repo.stargazers_count,
    forks: repo.forks_count,
    isPrivate: repo.private,
    createdAt: repo.created_at,
    updatedAt: repo.updated_at,
  };
}

export function transformCommitStats(
  commitActivity: GitHubCommitActivity[],
  contributorStats: GitHubContributorStats[],
  contributors: GitHubContributor[],
  year: number
): CommitStats {
  // Filter to just the year we care about
  const yearStart = new Date(year, 0, 1).getTime() / 1000;
  const yearEnd = new Date(year, 11, 31, 23, 59, 59).getTime() / 1000;

  // Get weekly activity for the year
  const weeklyActivity = commitActivity
    .filter((week) => week.week >= yearStart && week.week <= yearEnd)
    .map((week) => week.total);

  // Get top committers from contributor stats
  const topCommitters = contributorStats
    .map((stat) => {
      const yearlyCommits = stat.weeks
        .filter((w) => w.w >= yearStart && w.w <= yearEnd)
        .reduce((sum, w) => sum + w.c, 0);

      return {
        login: stat.author.login,
        avatarUrl: stat.author.avatar_url,
        commits: yearlyCommits,
      };
    })
    .filter((c) => c.commits > 0)
    .sort((a, b) => b.commits - a.commits)
    .slice(0, 10);

  // If no contributor stats, use basic contributors
  const finalTopCommitters =
    topCommitters.length > 0
      ? topCommitters
      : contributors.slice(0, 10).map((c) => ({
          login: c.login,
          avatarUrl: c.avatar_url,
          commits: c.contributions,
        }));

  // Calculate totalThisYear from contributorStats if available, otherwise from weeklyActivity
  // This is more reliable as contributorStats has per-contributor weekly data
  const totalThisYear = contributorStats.length > 0
    ? contributorStats.reduce((sum, stat) => {
        const yearlyCommits = stat.weeks
          .filter((w) => w.w >= yearStart && w.w <= yearEnd)
          .reduce((acc, w) => acc + w.c, 0);
        return sum + yearlyCommits;
      }, 0)
    : weeklyActivity.reduce((sum, count) => sum + count, 0);

  const total = contributors.reduce((sum, c) => sum + c.contributions, 0);

  return {
    total,
    totalThisYear,
    topCommitters: finalTopCommitters,
    weeklyActivity,
    averagePerWeek:
      weeklyActivity.length > 0
        ? Math.round(totalThisYear / weeklyActivity.length)
        : 0,
  };
}

export function transformPRStats(prs: GitHubPullRequest[]): PRStats {
  const opened = prs.length;
  const merged = prs.filter((pr) => pr.merged_at).length;
  const closed = prs.filter((pr) => pr.state === "closed").length;

  // Calculate merge times for merged PRs
  const mergedPRsWithTimes = prs
    .filter((pr) => pr.merged_at)
    .map((pr) => {
      const created = new Date(pr.created_at).getTime();
      const mergedAt = new Date(pr.merged_at!).getTime();
      return {
        pr,
        mergeTimeMinutes: (mergedAt - created) / (1000 * 60),
      };
    });

  const averageMergeTimeHours =
    mergedPRsWithTimes.length > 0
      ? mergedPRsWithTimes.reduce((sum, t) => sum + t.mergeTimeMinutes, 0) / mergedPRsWithTimes.length / 60
      : 0;

  // Helper to create PRHighlight
  const createHighlight = (pr: GitHubPullRequest): PRHighlight => ({
    number: pr.number,
    title: pr.title,
    author: pr.user.login,
    authorAvatar: pr.user.avatar_url,
    url: pr.html_url || `#${pr.number}`,
  });

  // Find fastest merge
  let fastestMerge: (PRHighlight & { mergeTimeMinutes: number }) | null = null;
  if (mergedPRsWithTimes.length > 0) {
    const fastest = mergedPRsWithTimes.reduce((min, curr) =>
      curr.mergeTimeMinutes < min.mergeTimeMinutes ? curr : min
    );
    fastestMerge = {
      ...createHighlight(fastest.pr),
      mergeTimeMinutes: Math.round(fastest.mergeTimeMinutes),
    };
  }

  // Find slowest merge
  let slowestMerge: (PRHighlight & { mergeTimeDays: number }) | null = null;
  if (mergedPRsWithTimes.length > 0) {
    const slowest = mergedPRsWithTimes.reduce((max, curr) =>
      curr.mergeTimeMinutes > max.mergeTimeMinutes ? curr : max
    );
    slowestMerge = {
      ...createHighlight(slowest.pr),
      mergeTimeDays: Math.round(slowest.mergeTimeMinutes / (60 * 24)),
    };
  }

  // Find biggest PR (most lines changed)
  const prsWithSize = prs.filter((pr) => pr.additions !== undefined);
  let biggestPR: (PRHighlight & { additions: number; deletions: number; totalLines: number }) | null = null;
  let largestPR: { number: number; title: string; additions: number; deletions: number } | null = null;
  if (prsWithSize.length > 0) {
    const largest = prsWithSize.reduce((max, pr) =>
      (pr.additions || 0) + (pr.deletions || 0) > (max.additions || 0) + (max.deletions || 0) ? pr : max
    );
    if (largest.additions !== undefined) {
      biggestPR = {
        ...createHighlight(largest),
        additions: largest.additions || 0,
        deletions: largest.deletions || 0,
        totalLines: (largest.additions || 0) + (largest.deletions || 0),
      };
      largestPR = {
        number: largest.number,
        title: largest.title,
        additions: largest.additions || 0,
        deletions: largest.deletions || 0,
      };
    }
  }

  // Find most commented PR (comments + review_comments)
  const prsWithComments = prs.filter((pr) => (pr.comments || 0) + (pr.review_comments || 0) > 0);
  let mostCommentedPR: (PRHighlight & { comments: number }) | null = null;
  if (prsWithComments.length > 0) {
    const mostCommented = prsWithComments.reduce((max, pr) => {
      const maxComments = (max.comments || 0) + (max.review_comments || 0);
      const prComments = (pr.comments || 0) + (pr.review_comments || 0);
      return prComments > maxComments ? pr : max;
    });
    mostCommentedPR = {
      ...createHighlight(mostCommented),
      comments: (mostCommented.comments || 0) + (mostCommented.review_comments || 0),
    };
  }

  // Find most revised PR (most commits)
  const prsWithCommits = prs.filter((pr) => pr.commits && pr.commits > 1);
  let mostRevisedPR: (PRHighlight & { commits: number }) | null = null;
  if (prsWithCommits.length > 0) {
    const mostRevised = prsWithCommits.reduce((max, pr) =>
      (pr.commits || 0) > (max.commits || 0) ? pr : max
    );
    mostRevisedPR = {
      ...createHighlight(mostRevised),
      commits: mostRevised.commits || 0,
    };
  }

  // Calculate size distribution
  const sizeDistribution = {
    tiny: 0,    // < 10 lines
    small: 0,   // 10-100 lines
    medium: 0,  // 100-500 lines
    large: 0,   // 500-1000 lines
    huge: 0,    // > 1000 lines
  };
  let totalLines = 0;
  for (const pr of prsWithSize) {
    const lines = (pr.additions || 0) + (pr.deletions || 0);
    totalLines += lines;
    if (lines < 10) sizeDistribution.tiny++;
    else if (lines < 100) sizeDistribution.small++;
    else if (lines < 500) sizeDistribution.medium++;
    else if (lines < 1000) sizeDistribution.large++;
    else sizeDistribution.huge++;
  }

  // PRs by day of week
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const prsByDayMap = new Map<number, number>();
  for (const pr of prs) {
    const dayOfWeek = new Date(pr.created_at).getDay();
    prsByDayMap.set(dayOfWeek, (prsByDayMap.get(dayOfWeek) || 0) + 1);
  }
  const prsByDayOfWeek = dayNames.map((day, index) => ({
    day,
    count: prsByDayMap.get(index) || 0,
  }));

  // Find busiest day
  const busiestDayEntry = prsByDayOfWeek.reduce((max, d) => (d.count > max.count ? d : max));
  const busiestDay = busiestDayEntry.day;

  return {
    opened,
    merged,
    closed,
    averageMergeTimeHours,
    fastestMerge,
    slowestMerge,
    biggestPR,
    mostCommentedPR,
    mostRevisedPR,
    largestPR,
    sizeDistribution,
    avgLinesPerPR: prsWithSize.length > 0 ? Math.round(totalLines / prsWithSize.length) : 0,
    prsByDayOfWeek,
    busiestDay,
  };
}

export function transformIssueStats(issues: GitHubIssue[]): IssueStats {
  const opened = issues.length;
  const closedIssues = issues.filter((i) => i.state === "closed");
  const closed = closedIssues.length;

  // Calculate close times
  const closeTimes = closedIssues
    .filter((i) => i.closed_at)
    .map((i) => {
      const created = new Date(i.created_at).getTime();
      const closedAt = new Date(i.closed_at!).getTime();
      return (closedAt - created) / (1000 * 60 * 60); // hours
    });

  const averageCloseTimeHours =
    closeTimes.length > 0
      ? closeTimes.reduce((sum, t) => sum + t, 0) / closeTimes.length
      : 0;

  // Find most active issue
  let mostActiveIssue = null;
  if (issues.length > 0) {
    const mostCommented = issues.reduce((max, issue) =>
      issue.comments > max.comments ? issue : max
    );
    if (mostCommented.comments > 0) {
      mostActiveIssue = {
        number: mostCommented.number,
        title: mostCommented.title,
        comments: mostCommented.comments,
      };
    }
  }

  return {
    opened,
    closed,
    averageCloseTimeHours,
    mostActiveIssue,
  };
}

export function transformContributorStats(
  contributors: GitHubContributor[],
  contributorStats: GitHubContributorStats[],
  prs: GitHubPullRequest[],
  reviewsByPR: Map<number, GitHubReview[]>,
  year: number
): ContributorStats {
  const yearStart = new Date(year, 0, 1).getTime() / 1000;
  const yearEnd = new Date(year, 11, 31, 23, 59, 59).getTime() / 1000;

  // Calculate yearly stats per contributor
  const contributorData = contributorStats
    .map((stat) => {
      const yearlyData = stat.weeks
        .filter((w) => w.w >= yearStart && w.w <= yearEnd)
        .reduce(
          (acc, w) => ({
            commits: acc.commits + w.c,
            additions: acc.additions + w.a,
            deletions: acc.deletions + w.d,
            activeWeeks: acc.activeWeeks + (w.c > 0 ? 1 : 0),
          }),
          { commits: 0, additions: 0, deletions: 0, activeWeeks: 0 }
        );

      // Find first contribution date
      const firstContributionWeek = stat.weeks.find((w) => w.c > 0);
      const firstContributionDate = firstContributionWeek
        ? new Date(firstContributionWeek.w * 1000).toISOString()
        : "";

      return {
        login: stat.author.login,
        avatarUrl: stat.author.avatar_url,
        ...yearlyData,
        linesChanged: yearlyData.additions + yearlyData.deletions,
        firstContributionDate,
      };
    })
    .filter((c) => c.commits > 0);

  // Top contributors by commits
  const topContributors = contributorData
    .sort((a, b) => b.commits - a.commits)
    .slice(0, 10)
    .map(({ login, avatarUrl, commits, additions, deletions }) => ({
      login,
      avatarUrl,
      commits,
      additions,
      deletions,
    }));

  // Fallback if no contributor stats
  const finalTopContributors =
    topContributors.length > 0
      ? topContributors
      : contributors.slice(0, 10).map((c) => ({
          login: c.login,
          avatarUrl: c.avatar_url,
          commits: c.contributions,
          additions: 0,
          deletions: 0,
        }));

  // Top contributors by PRs
  const prCountByAuthor = new Map<string, { count: number; avatarUrl: string }>();
  for (const pr of prs) {
    const author = pr.user.login;
    const existing = prCountByAuthor.get(author);
    if (existing) {
      existing.count++;
    } else {
      prCountByAuthor.set(author, { count: 1, avatarUrl: pr.user.avatar_url });
    }
  }
  const topByPRs = Array.from(prCountByAuthor.entries())
    .map(([login, { count, avatarUrl }]) => ({ login, avatarUrl, prCount: count }))
    .sort((a, b) => b.prCount - a.prCount)
    .slice(0, 10);

  // Top contributors by lines changed
  const topByLinesChanged = contributorData
    .sort((a, b) => b.linesChanged - a.linesChanged)
    .slice(0, 10)
    .map(({ login, avatarUrl, linesChanged }) => ({ login, avatarUrl, linesChanged }));

  // Top contributors by reviews
  const reviewCountByReviewer = new Map<string, { count: number; avatarUrl: string }>();
  for (const reviews of reviewsByPR.values()) {
    for (const review of reviews) {
      if (review.user && review.state !== "PENDING") {
        const reviewer = review.user.login;
        const existing = reviewCountByReviewer.get(reviewer);
        if (existing) {
          existing.count++;
        } else {
          reviewCountByReviewer.set(reviewer, { count: 1, avatarUrl: review.user.avatar_url });
        }
      }
    }
  }
  const topByReviews = Array.from(reviewCountByReviewer.entries())
    .map(([login, { count, avatarUrl }]) => ({ login, avatarUrl, reviewCount: count }))
    .sort((a, b) => b.reviewCount - a.reviewCount)
    .slice(0, 10);

  // Rising stars - new contributors (first contribution in this year) with high activity
  const yearStartDate = new Date(year, 0, 1);
  const risingStars = contributorData
    .filter((c) => {
      if (!c.firstContributionDate) return false;
      return new Date(c.firstContributionDate) >= yearStartDate;
    })
    .sort((a, b) => b.commits + b.linesChanged - (a.commits + a.linesChanged))
    .slice(0, 5)
    .map(({ login, avatarUrl, firstContributionDate, commits, linesChanged }) => ({
      login,
      avatarUrl,
      firstContributionDate,
      totalContributions: commits + Math.floor(linesChanged / 100),
    }));

  // Most consistent - contributors with activity in most weeks
  const totalWeeksInYear = 52;
  const mostConsistent = contributorData
    .sort((a, b) => b.activeWeeks - a.activeWeeks)
    .slice(0, 5)
    .map(({ login, avatarUrl, activeWeeks }) => ({
      login,
      avatarUrl,
      activeWeeks,
      totalWeeks: totalWeeksInYear,
    }));

  // Use contributorData.length if available, otherwise fall back to contributors.length
  // This ensures we show a count even when detailed stats aren't available
  const total = contributorData.length > 0 ? contributorData.length : contributors.length;

  return {
    total,
    newThisYear: risingStars.length,
    topContributors: finalTopContributors,
    topByPRs,
    topByLinesChanged,
    topByReviews,
    risingStars,
    mostConsistent,
  };
}

export function transformCodeStats(
  codeFrequency: [number, number, number][],
  languages: GitHubLanguages,
  year: number,
  prs?: GitHubPullRequest[] // Optional fallback for when codeFrequency is empty
): CodeStats {
  const yearStart = new Date(year, 0, 1).getTime() / 1000;
  const yearEnd = new Date(year, 11, 31, 23, 59, 59).getTime() / 1000;

  // Filter to year and sum additions/deletions
  const yearData = codeFrequency.filter(
    ([week]) => week >= yearStart && week <= yearEnd
  );

  let additions = yearData.reduce((sum, [, a]) => sum + a, 0);
  let deletions = yearData.reduce((sum, [, , d]) => sum + Math.abs(d), 0);

  // Fallback: If codeFrequency is empty but we have PR data, use that instead
  if (additions === 0 && deletions === 0 && prs && prs.length > 0) {
    additions = prs.reduce((sum, pr) => sum + (pr.additions || 0), 0);
    deletions = prs.reduce((sum, pr) => sum + (pr.deletions || 0), 0);
  }

  // Find busiest week
  let busiestWeek = null;
  if (yearData.length > 0) {
    const busiest = yearData.reduce((max, week) =>
      week[1] + Math.abs(week[2]) > max[1] + Math.abs(max[2]) ? week : max
    );
    busiestWeek = {
      weekStart: new Date(busiest[0] * 1000).toISOString(),
      additions: busiest[1],
      deletions: Math.abs(busiest[2]),
    };
  }

  // Transform languages
  const totalBytes = Object.values(languages).reduce((sum, bytes) => sum + bytes, 0);
  const languagesList = Object.entries(languages)
    .map(([name, bytes]) => ({
      name,
      bytes,
      percentage: Math.round((bytes / totalBytes) * 100),
      color: getLanguageColor(name),
    }))
    .sort((a, b) => b.bytes - a.bytes)
    .slice(0, 8);

  return {
    additions,
    deletions,
    netChange: additions - deletions,
    languages: languagesList,
    busiestWeek,
  };
}

export function transformCommunityStats(repo: GitHubRepo): CommunityStats {
  // Note: GitHub API doesn't provide historical star/fork data
  // These represent total counts, not yearly gains
  return {
    starsGained: 0, // Not available from API
    forksGained: 0, // Not available from API
    currentStars: repo.stargazers_count,
    currentForks: repo.forks_count,
    starGrowthPercentage: 0,
  };
}

export function transformActivityStats(
  commitActivity: GitHubCommitActivity[],
  year: number
): ActivityStats {
  const yearStart = new Date(year, 0, 1).getTime() / 1000;
  const yearEnd = new Date(year, 11, 31, 23, 59, 59).getTime() / 1000;

  const yearActivity = commitActivity.filter(
    (week) => week.week >= yearStart && week.week <= yearEnd
  );

  // Commits by month
  const commitsByMonth = Array(12)
    .fill(0)
    .map((_, i) => ({
      month: getMonthName(i),
      monthIndex: i,
      count: 0,
    }));

  // Commits by day of week
  const commitsByDayOfWeek = Array(7)
    .fill(0)
    .map((_, i) => ({
      day: getDayName(i),
      dayIndex: i,
      count: 0,
    }));

  for (const week of yearActivity) {
    const weekDate = new Date(week.week * 1000);
    const month = weekDate.getMonth();
    commitsByMonth[month].count += week.total;

    // Days array is [Sun, Mon, Tue, Wed, Thu, Fri, Sat]
    for (let day = 0; day < 7; day++) {
      commitsByDayOfWeek[day].count += week.days[day];
    }
  }

  // Find busiest month
  const busiestMonth = commitsByMonth.reduce((max, m) =>
    m.count > max.count ? m : max
  );

  // Find busiest day
  const busiestDay = commitsByDayOfWeek.reduce((max, d) =>
    d.count > max.count ? d : max
  );

  // Calculate average commits per day of week
  const weeksInYear = yearActivity.length || 1;
  const busiestDayOfWeek = {
    day: busiestDay.day,
    dayIndex: busiestDay.dayIndex,
    averageCommits: Math.round(busiestDay.count / weeksInYear),
  };

  // Calculate longest streak in weeks (using weekly data)
  let longestStreakWeeks = 0;
  let currentStreak = 0;
  for (const week of yearActivity) {
    if (week.total > 0) {
      currentStreak++;
      longestStreakWeeks = Math.max(longestStreakWeeks, currentStreak);
    } else {
      currentStreak = 0;
    }
  }

  return {
    busiestMonth: {
      month: busiestMonth.month,
      monthIndex: busiestMonth.monthIndex,
      commits: busiestMonth.count,
    },
    busiestDayOfWeek,
    longestStreak: longestStreakWeeks, // Streak in weeks (not days)
    commitsByMonth,
    commitsByDayOfWeek,
  };
}

export function transformReviewStats(
  prs: GitHubPullRequest[],
  reviewsByPR: Map<number, GitHubReview[]>
): ReviewStats {

  let totalReviews = 0;
  const reviewerData = new Map<string, {
    avatarUrl: string;
    reviewCount: number;
    totalResponseTimeMs: number;
    responseCount: number;
    totalComments: number;
  }>();

  // Track author-reviewer pairs
  const reviewPairs = new Map<string, {
    author: string;
    authorAvatar: string;
    reviewer: string;
    reviewerAvatar: string;
    count: number;
  }>();

  // Process each PR's reviews
  for (const pr of prs) {
    const reviews = reviewsByPR.get(pr.number) || [];
    const prCreatedAt = new Date(pr.created_at).getTime();

    for (const review of reviews) {
      if (!review.user || review.state === "PENDING") continue;

      totalReviews++;
      const reviewerLogin = review.user.login;
      const reviewSubmittedAt = new Date(review.submitted_at).getTime();
      const responseTimeMs = reviewSubmittedAt - prCreatedAt;

      // Update reviewer stats
      const existing = reviewerData.get(reviewerLogin);
      if (existing) {
        existing.reviewCount++;
        existing.totalResponseTimeMs += responseTimeMs;
        existing.responseCount++;
      } else {
        reviewerData.set(reviewerLogin, {
          avatarUrl: review.user.avatar_url,
          reviewCount: 1,
          totalResponseTimeMs: responseTimeMs,
          responseCount: 1,
          totalComments: 0,
        });
      }

      // Track review pairs
      const pairKey = `${pr.user.login}:${reviewerLogin}`;
      const existingPair = reviewPairs.get(pairKey);
      if (existingPair) {
        existingPair.count++;
      } else {
        reviewPairs.set(pairKey, {
          author: pr.user.login,
          authorAvatar: pr.user.avatar_url,
          reviewer: reviewerLogin,
          reviewerAvatar: review.user.avatar_url,
          count: 1,
        });
      }
    }
  }

  // Calculate average time to first review
  let totalTimeToFirstReview = 0;
  let prsWithReviews = 0;
  for (const pr of prs) {
    const reviews = reviewsByPR.get(pr.number) || [];
    if (reviews.length > 0) {
      const firstReview = reviews.reduce((earliest, r) =>
        new Date(r.submitted_at) < new Date(earliest.submitted_at) ? r : earliest
      );
      const prCreatedAt = new Date(pr.created_at).getTime();
      const firstReviewAt = new Date(firstReview.submitted_at).getTime();
      totalTimeToFirstReview += firstReviewAt - prCreatedAt;
      prsWithReviews++;
    }
  }
  const avgTimeToFirstReviewHours =
    prsWithReviews > 0
      ? totalTimeToFirstReview / prsWithReviews / (1000 * 60 * 60)
      : 0;

  // Calculate average time from approval to merge
  let totalTimeToMerge = 0;
  let approvedAndMergedCount = 0;
  for (const pr of prs) {
    if (!pr.merged_at) continue;
    const reviews = reviewsByPR.get(pr.number) || [];
    const approvals = reviews.filter((r) => r.state === "APPROVED");
    if (approvals.length > 0) {
      const lastApproval = approvals.reduce((latest, r) =>
        new Date(r.submitted_at) > new Date(latest.submitted_at) ? r : latest
      );
      const approvalAt = new Date(lastApproval.submitted_at).getTime();
      const mergedAt = new Date(pr.merged_at).getTime();
      if (mergedAt > approvalAt) {
        totalTimeToMerge += mergedAt - approvalAt;
        approvedAndMergedCount++;
      }
    }
  }
  const avgTimeToMergeAfterApprovalHours =
    approvedAndMergedCount > 0
      ? totalTimeToMerge / approvedAndMergedCount / (1000 * 60 * 60)
      : 0;

  // Approval rate (first review was approval)
  let firstReviewApprovals = 0;
  for (const pr of prs) {
    const reviews = reviewsByPR.get(pr.number) || [];
    if (reviews.length > 0) {
      const sortedReviews = [...reviews].sort(
        (a, b) => new Date(a.submitted_at).getTime() - new Date(b.submitted_at).getTime()
      );
      if (sortedReviews[0].state === "APPROVED") {
        firstReviewApprovals++;
      }
    }
  }
  const approvalRate = prsWithReviews > 0 ? (firstReviewApprovals / prsWithReviews) * 100 : 0;

  // Top reviewers
  const topReviewers = Array.from(reviewerData.entries())
    .map(([login, data]) => ({
      login,
      avatarUrl: data.avatarUrl,
      reviewCount: data.reviewCount,
      avgResponseTimeHours:
        data.responseCount > 0
          ? data.totalResponseTimeMs / data.responseCount / (1000 * 60 * 60)
          : 0,
    }))
    .sort((a, b) => b.reviewCount - a.reviewCount)
    .slice(0, 10);

  // Most thorough reviewers (placeholder - would need review comments data)
  const mostThoroughReviewers = topReviewers.slice(0, 5).map((r) => ({
    login: r.login,
    avatarUrl: r.avatarUrl,
    avgCommentsPerReview: 0,
    totalComments: 0,
  }));

  // Top review pairs
  const topReviewerPairs = Array.from(reviewPairs.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return {
    totalReviews,
    avgTimeToFirstReviewHours,
    avgTimeToMergeAfterApprovalHours,
    approvalRate,
    topReviewers,
    mostThoroughReviewers,
    topReviewerPairs,
  };
}

export function transformVelocityStats(
  prs: GitHubPullRequest[],
  year: number
): VelocityStats {
  // Group PRs by week
  const prsByWeek = new Map<string, number>();
  const yearStart = new Date(year, 0, 1);

  for (const pr of prs) {
    const createdAt = new Date(pr.created_at);
    // Get week number (ISO week)
    const startOfYear = new Date(year, 0, 1);
    const daysSinceStart = Math.floor((createdAt.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24));
    const weekNumber = Math.floor(daysSinceStart / 7) + 1;
    const weekKey = `W${weekNumber}`;

    prsByWeek.set(weekKey, (prsByWeek.get(weekKey) || 0) + 1);
  }

  // Convert to array and sort
  const prsPerWeek = Array.from(prsByWeek.entries())
    .map(([week, count]) => ({ week, count }))
    .sort((a, b) => {
      const weekNumA = parseInt(a.week.slice(1));
      const weekNumB = parseInt(b.week.slice(1));
      return weekNumA - weekNumB;
    });

  // Find busiest and slowest weeks
  const busiestWeek = prsPerWeek.reduce(
    (max, w) => (w.count > max.count ? w : max),
    { week: "W1", count: 0 }
  );
  const slowestWeek = prsPerWeek.reduce(
    (min, w) => (w.count < min.count ? w : min),
    { week: "W1", count: Infinity }
  );

  // Calculate quarterly PRs
  const quarterlyComparison = { q1: 0, q2: 0, q3: 0, q4: 0 };
  for (const pr of prs) {
    const month = new Date(pr.created_at).getMonth();
    if (month < 3) quarterlyComparison.q1++;
    else if (month < 6) quarterlyComparison.q2++;
    else if (month < 9) quarterlyComparison.q3++;
    else quarterlyComparison.q4++;
  }

  // Determine trend based on quarterly comparison
  let trend: "increasing" | "decreasing" | "stable" = "stable";

  const firstHalf = quarterlyComparison.q1 + quarterlyComparison.q2;
  const secondHalf = quarterlyComparison.q3 + quarterlyComparison.q4;
  const total = firstHalf + secondHalf;

  // Only calculate trend if there's activity
  if (total > 0) {
    const diff = secondHalf - firstHalf;
    const threshold = total * 0.15; // 15% threshold for more sensitivity

    if (diff > threshold) trend = "increasing";
    else if (diff < -threshold) trend = "decreasing";
  }

  return {
    prsPerWeek,
    trend,
    busiestWeek,
    slowestWeek: slowestWeek.count === Infinity ? { week: "N/A", count: 0 } : slowestWeek,
    quarterlyComparison,
  };
}

export function calculateRepoPersonality(
  prStats: PRStats,
  reviewStats: ReviewStats,
  velocityStats: VelocityStats,
  contributors: ContributorStats
): RepoPersonality {
  const personalities: { type: RepoPersonalityType; score: number }[] = [];

  // Rocket - High velocity, growing fast
  const rocketScore =
    (velocityStats.trend === "increasing" ? 30 : 0) +
    (prStats.opened > 50 ? 20 : prStats.opened > 20 ? 10 : 0) +
    (contributors.newThisYear > 3 ? 20 : contributors.newThisYear > 0 ? 10 : 0);
  personalities.push({ type: "rocket", score: rocketScore });

  // Institution - Steady, consistent output
  const institutionScore =
    (velocityStats.trend === "stable" ? 30 : 0) +
    (contributors.mostConsistent.length > 0 && contributors.mostConsistent[0].activeWeeks > 40 ? 30 : 10) +
    (prStats.merged / prStats.opened > 0.8 ? 20 : 0);
  personalities.push({ type: "institution", score: institutionScore });

  // Laboratory - Lots of experimental PRs
  const laboratoryScore =
    (prStats.sizeDistribution.tiny + prStats.sizeDistribution.small > prStats.opened * 0.5 ? 30 : 0) +
    (prStats.opened > prStats.merged * 1.5 ? 20 : 0) +
    (prStats.mostRevisedPR && prStats.mostRevisedPR.commits > 10 ? 20 : 0);
  personalities.push({ type: "laboratory", score: laboratoryScore });

  // Collaborative - High review engagement
  const collaborativeScore =
    (reviewStats.totalReviews > prStats.opened * 2 ? 30 : reviewStats.totalReviews > prStats.opened ? 15 : 0) +
    (reviewStats.topReviewerPairs.length > 5 ? 20 : reviewStats.topReviewerPairs.length > 2 ? 10 : 0) +
    (reviewStats.topReviewers.length > 5 ? 20 : 0);
  personalities.push({ type: "collaborative", score: collaborativeScore });

  // Speed Demon - Fast merge times
  const speedDemonScore =
    (prStats.averageMergeTimeHours < 24 ? 40 : prStats.averageMergeTimeHours < 48 ? 20 : 0) +
    (prStats.fastestMerge && prStats.fastestMerge.mergeTimeMinutes < 60 ? 20 : 0) +
    (reviewStats.avgTimeToFirstReviewHours < 4 ? 20 : reviewStats.avgTimeToFirstReviewHours < 12 ? 10 : 0);
  personalities.push({ type: "speedDemon", score: speedDemonScore });

  // Careful - Slow but thorough reviews
  const carefulScore =
    (prStats.averageMergeTimeHours > 72 ? 20 : 0) +
    (reviewStats.approvalRate < 50 ? 30 : 0) +
    (prStats.mostCommentedPR && prStats.mostCommentedPR.comments > 20 ? 20 : 0) +
    (prStats.sizeDistribution.large + prStats.sizeDistribution.huge < prStats.opened * 0.1 ? 20 : 0);
  personalities.push({ type: "careful", score: carefulScore });

  // Find the personality with highest score
  const winner = personalities.reduce((max, p) => (p.score > max.score ? p : max));

  const personalityDetails: Record<RepoPersonalityType, { title: string; emoji: string; description: string; traits: string[] }> = {
    rocket: {
      title: "The Rocket",
      emoji: "🚀",
      description: "High velocity, growing fast! This repo is on fire with rapid development.",
      traits: ["Fast-growing", "High PR volume", "Expanding team"],
    },
    institution: {
      title: "The Institution",
      emoji: "🏛️",
      description: "Steady and reliable. This repo delivers consistent, quality output.",
      traits: ["Consistent output", "High merge rate", "Stable contributors"],
    },
    laboratory: {
      title: "The Laboratory",
      emoji: "🔬",
      description: "Experimental and explorative. Many small PRs testing new ideas.",
      traits: ["Many small PRs", "Experimental", "Iterative development"],
    },
    collaborative: {
      title: "The Hive Mind",
      emoji: "🤝",
      description: "Highly collaborative with strong review culture.",
      traits: ["High review engagement", "Strong pairs", "Team-focused"],
    },
    speedDemon: {
      title: "The Speed Demon",
      emoji: "⚡",
      description: "Lightning fast merge times. No PR waits long here!",
      traits: ["Fast merges", "Quick reviews", "Rapid iteration"],
    },
    careful: {
      title: "The Craftsman",
      emoji: "🐢",
      description: "Slow and steady wins the race. Thorough reviews, quality code.",
      traits: ["Thorough reviews", "Quality-focused", "Small PRs"],
    },
  };

  return {
    type: winner.type,
    ...personalityDetails[winner.type],
  };
}

export function assembleWrappedData(
  repo: GitHubRepo,
  contributors: GitHubContributor[],
  contributorStats: GitHubContributorStats[],
  commitActivity: GitHubCommitActivity[],
  codeFrequency: [number, number, number][],
  languages: GitHubLanguages,
  prs: GitHubPullRequest[],
  issues: GitHubIssue[],
  reviewsByPR: Map<number, GitHubReview[]>,
  year: number
): WrappedData {
  const prStats = transformPRStats(prs);
  const reviewStats = transformReviewStats(prs, reviewsByPR);
  const velocityStats = transformVelocityStats(prs, year);
  const contributorStatsResult = transformContributorStats(
    contributors,
    contributorStats,
    prs,
    reviewsByPR,
    year
  );
  const personality = calculateRepoPersonality(prStats, reviewStats, velocityStats, contributorStatsResult);

  return {
    repo: transformRepoInfo(repo),
    year,
    commits: transformCommitStats(commitActivity, contributorStats, contributors, year),
    pullRequests: prStats,
    reviews: reviewStats,
    issues: transformIssueStats(issues),
    contributors: contributorStatsResult,
    codeChanges: transformCodeStats(codeFrequency, languages, year, prs),
    community: transformCommunityStats(repo),
    activity: transformActivityStats(commitActivity, year),
    velocity: velocityStats,
    personality,
    generatedAt: new Date().toISOString(),
  };
}
