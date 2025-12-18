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
  fetchPullRequests,
  fetchPRReviews,
  fetchIssues,
} from "@/lib/github/client";
import { assembleWrappedData } from "@/lib/github/transform";

export async function GET(request: NextRequest) {
  try {
    const accessToken = await getAccessToken();

    if (!accessToken) {
      return NextResponse.json(
        { error: "Unauthorized", message: "Please sign in to continue" },
        { status: 401 }
      );
    }

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

    const octokit = createGitHubClient(accessToken);

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

    // Fetch PRs and issues (these are paginated)
    const [prs, issues] = await Promise.all([
      fetchPullRequests(octokit, owner, repo, year),
      fetchIssues(octokit, owner, repo, year),
    ]);

    // Fetch reviews for PRs
    const prNumbers = prs.map((pr) => pr.number);
    const reviewsByPR = await fetchPRReviews(octokit, owner, repo, prNumbers);

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

    return NextResponse.json(wrappedData);
  } catch (error) {
    console.error("Error fetching wrapped data:", error);

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
    }

    return NextResponse.json(
      {
        error: "Internal Error",
        message: "An unexpected error occurred. Please try again.",
      },
      { status: 500 }
    );
  }
}
