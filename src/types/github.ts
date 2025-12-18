export interface GitHubUser {
  login: string;
  id: number;
  avatar_url: string;
  name: string | null;
  email: string | null;
}

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  owner: {
    login: string;
    avatar_url: string;
  };
  description: string | null;
  private: boolean;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  created_at: string;
  updated_at: string;
  default_branch: string;
}

export interface GitHubCommit {
  sha: string;
  commit: {
    author: {
      name: string;
      email: string;
      date: string;
    };
    message: string;
  };
  author: {
    login: string;
    avatar_url: string;
  } | null;
}

export interface GitHubContributor {
  login: string;
  avatar_url: string;
  contributions: number;
}

export interface GitHubPullRequest {
  number: number;
  title: string;
  state: "open" | "closed";
  created_at: string;
  closed_at: string | null;
  merged_at: string | null;
  additions?: number;
  deletions?: number;
  commits?: number;
  comments?: number;
  review_comments?: number;
  html_url: string;
  user: {
    login: string;
    avatar_url: string;
  };
}

export interface GitHubReview {
  id: number;
  user: {
    login: string;
    avatar_url: string;
  };
  state: "APPROVED" | "CHANGES_REQUESTED" | "COMMENTED" | "DISMISSED" | "PENDING";
  submitted_at: string;
  pull_request_url: string;
}

export interface GitHubReviewComment {
  id: number;
  user: {
    login: string;
    avatar_url: string;
  };
  body: string;
  created_at: string;
  pull_request_review_id: number;
}

export interface GitHubIssue {
  number: number;
  title: string;
  state: "open" | "closed";
  created_at: string;
  closed_at: string | null;
  comments: number;
  user: {
    login: string;
    avatar_url: string;
  };
}

export interface GitHubLanguages {
  [language: string]: number;
}

export interface GitHubCommitActivity {
  days: number[];
  total: number;
  week: number;
}

export interface GitHubContributorStats {
  author: {
    login: string;
    avatar_url: string;
  };
  total: number;
  weeks: {
    w: number;
    a: number;
    d: number;
    c: number;
  }[];
}

export interface GitHubCodeFrequency {
  week: number;
  additions: number;
  deletions: number;
}
