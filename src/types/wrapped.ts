export interface RepoInfo {
  name: string;
  fullName: string;
  owner: {
    login: string;
    avatarUrl: string;
  };
  description: string | null;
  language: string | null;
  stars: number;
  forks: number;
  isPrivate: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CommitStats {
  total: number;
  totalThisYear: number;
  topCommitters: {
    login: string;
    avatarUrl: string;
    commits: number;
  }[];
  weeklyActivity: number[];
  averagePerWeek: number;
}

// PR Highlight for awards section
export interface PRHighlight {
  number: number;
  title: string;
  author: string;
  authorAvatar: string;
  url: string;
}

export interface PRStats {
  opened: number;
  merged: number;
  closed: number;
  averageMergeTimeHours: number;
  // Highlights / Awards
  fastestMerge: (PRHighlight & { mergeTimeMinutes: number }) | null;
  slowestMerge: (PRHighlight & { mergeTimeDays: number }) | null;
  biggestPR: (PRHighlight & { additions: number; deletions: number; totalLines: number }) | null;
  mostCommentedPR: (PRHighlight & { comments: number }) | null;
  mostRevisedPR: (PRHighlight & { commits: number }) | null;
  // Legacy support
  largestPR: {
    number: number;
    title: string;
    additions: number;
    deletions: number;
  } | null;
  // Size distribution
  sizeDistribution: {
    tiny: number;    // < 10 lines
    small: number;   // 10-100 lines
    medium: number;  // 100-500 lines
    large: number;   // 500-1000 lines
    huge: number;    // > 1000 lines
  };
  avgLinesPerPR: number;
  // Time patterns
  prsByDayOfWeek: { day: string; count: number }[];
  busiestDay: string;
}

export interface ReviewStats {
  totalReviews: number;
  avgTimeToFirstReviewHours: number;
  avgTimeToMergeAfterApprovalHours: number;
  approvalRate: number; // % approved on first review
  // Top reviewers
  topReviewers: {
    login: string;
    avatarUrl: string;
    reviewCount: number;
    avgResponseTimeHours: number;
  }[];
  // Most thorough reviewers (most comments per review)
  mostThoroughReviewers: {
    login: string;
    avatarUrl: string;
    avgCommentsPerReview: number;
    totalComments: number;
  }[];
  // Review pairs
  topReviewerPairs: {
    author: string;
    authorAvatar: string;
    reviewer: string;
    reviewerAvatar: string;
    count: number;
  }[];
}

export interface IssueStats {
  opened: number;
  closed: number;
  averageCloseTimeHours: number;
  mostActiveIssue: {
    number: number;
    title: string;
    comments: number;
  } | null;
}

export interface ContributorStats {
  total: number;
  newThisYear: number;
  // Different leaderboards
  topContributors: {
    login: string;
    avatarUrl: string;
    commits: number;
    additions: number;
    deletions: number;
  }[];
  topByPRs: {
    login: string;
    avatarUrl: string;
    prCount: number;
  }[];
  topByLinesChanged: {
    login: string;
    avatarUrl: string;
    linesChanged: number;
  }[];
  topByReviews: {
    login: string;
    avatarUrl: string;
    reviewCount: number;
  }[];
  // Rising stars - new contributors with high activity
  risingStars: {
    login: string;
    avatarUrl: string;
    firstContributionDate: string;
    totalContributions: number;
  }[];
  // Most consistent - contributors with activity in most weeks
  mostConsistent: {
    login: string;
    avatarUrl: string;
    activeWeeks: number;
    totalWeeks: number;
  }[];
}

export interface CodeStats {
  additions: number;
  deletions: number;
  netChange: number;
  languages: {
    name: string;
    percentage: number;
    color: string;
    bytes: number;
  }[];
  busiestWeek: {
    weekStart: string;
    additions: number;
    deletions: number;
  } | null;
}

export interface CommunityStats {
  starsGained: number;
  forksGained: number;
  currentStars: number;
  currentForks: number;
  starGrowthPercentage: number;
}

export interface ActivityStats {
  busiestMonth: {
    month: string;
    monthIndex: number;
    commits: number;
  };
  busiestDayOfWeek: {
    day: string;
    dayIndex: number;
    averageCommits: number;
  };
  longestStreak: number;
  commitsByMonth: { month: string; monthIndex: number; count: number }[];
  commitsByDayOfWeek: { day: string; dayIndex: number; count: number }[];
}

// Velocity trends
export interface VelocityStats {
  prsPerWeek: { week: string; count: number }[];
  trend: 'increasing' | 'decreasing' | 'stable';
  busiestWeek: { week: string; count: number };
  slowestWeek: { week: string; count: number };
  quarterlyComparison: {
    q1: number;
    q2: number;
    q3: number;
    q4: number;
  };
}

// Repo personality type
export type RepoPersonalityType =
  | 'rocket'      // 🚀 High velocity, growing fast
  | 'institution' // 🏛️ Steady, consistent output
  | 'laboratory'  // 🔬 Lots of experimental PRs
  | 'collaborative' // 🤝 High review engagement
  | 'speedDemon'  // ⚡ Fast merge times
  | 'careful';    // 🐢 Slow but thorough reviews

export interface RepoPersonality {
  type: RepoPersonalityType;
  title: string;
  emoji: string;
  description: string;
  traits: string[];
}

export interface WrappedData {
  repo: RepoInfo;
  year: number;
  commits: CommitStats;
  pullRequests: PRStats;
  reviews: ReviewStats;
  issues: IssueStats;
  contributors: ContributorStats;
  codeChanges: CodeStats;
  community: CommunityStats;
  activity: ActivityStats;
  velocity: VelocityStats;
  personality: RepoPersonality;
  generatedAt: string;
}

export interface WrappedError {
  error: string;
  message: string;
  status?: number;
}
