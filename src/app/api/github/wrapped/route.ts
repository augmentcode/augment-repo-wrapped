import { NextRequest, NextResponse } from "next/server";
import { getAccessToken } from "@/lib/get-access-token";
import {
  createGitHubClient,
  fetchRepoInfo,
  fetchContributors,
  fetchContributorStats,
  fetchCommitActivity,
  fetchCodeFrequency,
  fetchLanguages,
  fetchIssues,
} from "@/lib/github/client";
import { GitHubAPI } from "@/lib/github-api";
import {
  transformGraphQLPRsToREST,
  extractReviewsFromGraphQLPRs,
} from "@/lib/github/graphql-transform";
import { assembleWrappedData } from "@/lib/github/transform";
import { DEMO_CONFIG } from "@/lib/demo-config";

// In-memory cache for wrapped data
// Key: `${owner}/${repo}/${year}`
// Value: { data, timestamp }
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 1000 * 60 * 5; // 5 minutes

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const owner = searchParams.get("owner");
    const repo = searchParams.get("repo");
    const yearParam = searchParams.get("year");

    if (!owner || !repo) {
      return NextResponse.json(
        { error: "Bad Request", message: "Missing owner or repo parameter" },
        { status: 400 }
      );
    }

    const year = yearParam ? parseInt(yearParam, 10) : new Date().getFullYear();

    // Get access token
    const accessToken = await getAccessToken();

    if (!accessToken) {
      return NextResponse.json(
        { error: "Unauthorized", message: "Please sign in to continue" },
        { status: 401 }
      );
    }

    // Check cache first
    const cacheKey = `${owner}/${repo}/${year}`;
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      console.log(`[Cache HIT] ${cacheKey}`);
      return NextResponse.json(cached.data);
    }

    console.log(`[Cache MISS] ${cacheKey} - Fetching from GitHub...`);

    const octokit = createGitHubClient(accessToken);
    const githubAPI = new GitHubAPI(accessToken);

    // Fetch all data in parallel where possible
    const [repoInfo, contributors] = await Promise.all([
      fetchRepoInfo(octokit, owner, repo),
      fetchContributors(octokit, owner, repo),
    ]);

    // Some endpoints need retrying due to GitHub's stats computation
    const [contributorStats, commitActivity, codeFrequency, languages] =
      await Promise.all([
        fetchContributorStats(octokit, owner, repo),
        fetchCommitActivity(octokit, owner, repo),
        fetchCodeFrequency(octokit, owner, repo),
        fetchLanguages(octokit, owner, repo),
      ]);

    // Use GraphQL to fetch PRs with reviews (much more efficient!)
    // This replaces ~150 REST API calls with 1-3 GraphQL calls
    const [graphqlPRs, issues] = await Promise.all([
      githubAPI.fetchWrappedPRData(owner, repo, year),
      fetchIssues(octokit, owner, repo, year),
    ]);

    // Transform GraphQL data to REST format for existing logic
    const prs = transformGraphQLPRsToREST(graphqlPRs);
    const reviewsByPR = extractReviewsFromGraphQLPRs(graphqlPRs);

    const wrappedData = assembleWrappedData(
      repoInfo,
      contributors,
      contributorStats,
      commitActivity,
      codeFrequency,
      languages,
      prs,
      issues,
      reviewsByPR,
      year
    );

    // Cache the result
    cache.set(cacheKey, {
      data: wrappedData,
      timestamp: Date.now(),
    });

    console.log(`[Cache SET] ${cacheKey} - Cached for ${CACHE_TTL / 1000}s`);

    return NextResponse.json(wrappedData);
  } catch (error) {
    console.error("Error fetching wrapped data:", error);

    // Log the full error for debugging
    if (error instanceof Error) {
      console.error("Error name:", error.name);
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }

    if (error instanceof Error) {
      // Handle GitHub API errors
      if (error.message.includes("Not Found")) {
        return NextResponse.json(
          {
            error: "Not Found",
            message: "Repository not found. Make sure the repository exists and you have access to it.",
          },
          { status: 404 }
        );
      }

      if (error.message.includes("rate limit")) {
        return NextResponse.json(
          {
            error: "Rate Limited",
            message: "GitHub API rate limit exceeded. Please try again later.",
          },
          { status: 429 }
        );
      }

      if (error.message.includes("Bad credentials")) {
        return NextResponse.json(
          {
            error: "Unauthorized",
            message: "Your session has expired. Please sign in again.",
          },
          { status: 401 }
        );
      }

      // Check for timeout errors
      if (error.message.includes("timeout") || error.message.includes("ETIMEDOUT")) {
        return NextResponse.json(
          {
            error: "Timeout",
            message: "This repository is taking too long to process. Try a smaller repository or a shorter time period.",
          },
          { status: 504 }
        );
      }
    }

    // Return detailed error for debugging
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Returning 500 error with message:", errorMessage);

    return NextResponse.json(
      {
        error: "Internal Error",
        message: errorMessage || "An unexpected error occurred. Please try again.",
      },
      { status: 500 }
    );
  }
}
