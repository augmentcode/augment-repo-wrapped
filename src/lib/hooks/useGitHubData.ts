"use client";

import { useState, useEffect } from "react";
import { useGitHubAuth } from "./useGitHubAuth";
import { GitHubAPI, PullRequest } from "@/lib/github-api";

export function useGitHubData() {
  const { token } = useGitHubAuth();
  const [pullRequests, setPullRequests] = useState<PullRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [api, setApi] = useState<GitHubAPI | null>(null);

  // Initialize API when token changes
  useEffect(() => {
    if (token) {
      setApi(new GitHubAPI(token));
    } else {
      setApi(null);
    }
  }, [token]);

  const fetchPullRequests = async (
    repoNames: string[],
    daysAgo: number = 60,
    useDetailedAnalysis: boolean = true
  ) => {
    if (!api) {
      throw new Error("Not authenticated");
    }

    try {
      setLoading(true);
      setError(null);

      let prs;
      if (useDetailedAnalysis) {
        prs = await api.getPullRequestsWithDetails(repoNames, daysAgo);
      } else {
        prs = await api.getPullRequestsForRepos(repoNames, daysAgo);
      }

      setPullRequests(prs);
      return prs;
    } catch (err) {
      setError((err as Error).message || "Failed to fetch pull requests");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    pullRequests,
    loading,
    error,
    api,
    fetchPullRequests,
  };
}

