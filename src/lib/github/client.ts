import { Octokit } from "@octokit/rest";
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

export function createGitHubClient(accessToken: string) {
  return new Octokit({
    auth: accessToken,
  });
}

export async function fetchRepoInfo(
  octokit: Octokit,
  owner: string,
  repo: string
): Promise<GitHubRepo> {
  const { data } = await octokit.repos.get({ owner, repo });
  return data as GitHubRepo;
}

export async function fetchContributors(
  octokit: Octokit,
  owner: string,
  repo: string
): Promise<GitHubContributor[]> {
  const { data } = await octokit.repos.listContributors({
    owner,
    repo,
    per_page: 100,
  });
  return data as GitHubContributor[];
}

export async function fetchContributorStats(
  octokit: Octokit,
  owner: string,
  repo: string
): Promise<GitHubContributorStats[]> {
  // This endpoint may return 202 if data is being computed
  // We need to retry with exponential backoff
  for (let i = 0; i < 5; i++) {
    const response = await octokit.repos.getContributorsStats({ owner, repo });
    if (response.status === 200 && response.data) {
      return response.data as GitHubContributorStats[];
    }
    // Exponential backoff: 1s, 2s, 4s, 8s, 10s (capped)
    const delay = Math.min(1000 * Math.pow(2, i), 10000);
    await new Promise((resolve) => setTimeout(resolve, delay));
  }
  return [];
}

export async function fetchCommitActivity(
  octokit: Octokit,
  owner: string,
  repo: string
): Promise<GitHubCommitActivity[]> {
  // This endpoint may return 202 if data is being computed
  for (let i = 0; i < 5; i++) {
    const response = await octokit.repos.getCommitActivityStats({ owner, repo });
    if (response.status === 200 && response.data) {
      return response.data as GitHubCommitActivity[];
    }
    // Exponential backoff: 1s, 2s, 4s, 8s, 10s (capped)
    const delay = Math.min(1000 * Math.pow(2, i), 10000);
    await new Promise((resolve) => setTimeout(resolve, delay));
  }
  return [];
}

export async function fetchCodeFrequency(
  octokit: Octokit,
  owner: string,
  repo: string
): Promise<[number, number, number][]> {
  for (let i = 0; i < 5; i++) {
    const response = await octokit.repos.getCodeFrequencyStats({ owner, repo });
    if (response.status === 200 && response.data) {
      return response.data as [number, number, number][];
    }
    // Exponential backoff: 1s, 2s, 4s, 8s, 10s (capped)
    const delay = Math.min(1000 * Math.pow(2, i), 10000);
    await new Promise((resolve) => setTimeout(resolve, delay));
  }
  return [];
}

export async function fetchLanguages(
  octokit: Octokit,
  owner: string,
  repo: string
): Promise<GitHubLanguages> {
  const { data } = await octokit.repos.listLanguages({ owner, repo });
  return data;
}

export async function fetchPullRequests(
  octokit: Octokit,
  owner: string,
  repo: string,
  year: number
): Promise<GitHubPullRequest[]> {
  const startDate = new Date(year, 0, 1);
  const endDate = new Date(year, 11, 31, 23, 59, 59);

  const allPRs: GitHubPullRequest[] = [];
  let page = 1;
  const perPage = 100;

  while (true) {
    const { data } = await octokit.pulls.list({
      owner,
      repo,
      state: "all",
      sort: "created",
      direction: "desc",
      per_page: perPage,
      page,
    });

    if (data.length === 0) break;

    // Filter PRs by year
    const yearPRs = data.filter((pr) => {
      const createdAt = new Date(pr.created_at);
      return createdAt >= startDate && createdAt <= endDate;
    });

    allPRs.push(...(yearPRs as GitHubPullRequest[]));

    // If earliest PR in batch is before our year, stop
    const earliestPR = new Date(data[data.length - 1].created_at);
    if (earliestPR < startDate) break;

    // Safety limit
    if (page >= 10) break;
    page++;
  }

  // Fetch additional details for PRs (additions/deletions/commits/comments)
  const detailedPRs = await Promise.all(
    allPRs.slice(0, 100).map(async (pr) => {
      try {
        const { data } = await octokit.pulls.get({
          owner,
          repo,
          pull_number: pr.number,
        });
        return {
          ...pr,
          additions: data.additions,
          deletions: data.deletions,
          commits: data.commits,
          comments: data.comments,
          review_comments: data.review_comments,
          html_url: data.html_url,
        };
      } catch {
        return pr;
      }
    })
  );

  return detailedPRs;
}

export async function fetchPRReviews(
  octokit: Octokit,
  owner: string,
  repo: string,
  prNumbers: number[]
): Promise<Map<number, GitHubReview[]>> {
  const reviewsByPR = new Map<number, GitHubReview[]>();

  // Batch fetch reviews for PRs (limit to avoid rate limits)
  const prsToFetch = prNumbers.slice(0, 50);

  await Promise.all(
    prsToFetch.map(async (prNumber) => {
      try {
        const { data } = await octokit.pulls.listReviews({
          owner,
          repo,
          pull_number: prNumber,
          per_page: 100,
        });
        reviewsByPR.set(prNumber, data as GitHubReview[]);
      } catch {
        reviewsByPR.set(prNumber, []);
      }
    })
  );

  return reviewsByPR;
}

export async function fetchIssues(
  octokit: Octokit,
  owner: string,
  repo: string,
  year: number
): Promise<GitHubIssue[]> {
  const startDate = new Date(year, 0, 1);
  const endDate = new Date(year, 11, 31, 23, 59, 59);

  console.log(`[fetchIssues] Fetching issues for ${owner}/${repo} year ${year}`);
  console.log(`[fetchIssues] Date range: ${startDate.toISOString()} to ${endDate.toISOString()}`);

  const allIssues: GitHubIssue[] = [];
  let page = 1;
  const perPage = 100;
  let totalFetched = 0;

  while (true) {
    const { data } = await octokit.issues.listForRepo({
      owner,
      repo,
      state: "all",
      sort: "created",
      direction: "desc",
      per_page: perPage,
      page,
    });

    if (data.length === 0) break;

    totalFetched += data.length;
    console.log(`[fetchIssues] Page ${page}: fetched ${data.length} items (total: ${totalFetched})`);

    // Filter issues (exclude PRs) by year
    const yearIssues = data
      .filter((issue) => !issue.pull_request)
      .filter((issue) => {
        const createdAt = new Date(issue.created_at);
        const inRange = createdAt >= startDate && createdAt <= endDate;
        if (!inRange && !issue.pull_request) {
          console.log(`[fetchIssues] Filtered out issue #${issue.number} (created: ${issue.created_at})`);
        }
        return inRange;
      });

    console.log(`[fetchIssues] ${yearIssues.length} issues matched year ${year} on page ${page}`);
    allIssues.push(...(yearIssues as GitHubIssue[]));

    // If earliest issue in batch is before our year, stop
    const earliestIssue = new Date(data[data.length - 1].created_at);
    if (earliestIssue < startDate) {
      console.log(`[fetchIssues] Reached issues before ${year}, stopping pagination`);
      break;
    }

    // Safety limit
    if (page >= 10) break;
    page++;
  }

  console.log(`[fetchIssues] Final result: ${allIssues.length} issues for year ${year}`);
  return allIssues;
}

export async function fetchCommitsForYear(
  octokit: Octokit,
  owner: string,
  repo: string,
  year: number
): Promise<{ total: number; byAuthor: Map<string, number> }> {
  const startDate = new Date(year, 0, 1).toISOString();
  const endDate = new Date(year, 11, 31, 23, 59, 59).toISOString();

  const byAuthor = new Map<string, number>();
  let total = 0;
  let page = 1;
  const perPage = 100;

  while (true) {
    const { data } = await octokit.repos.listCommits({
      owner,
      repo,
      since: startDate,
      until: endDate,
      per_page: perPage,
      page,
    });

    if (data.length === 0) break;

    for (const commit of data) {
      total++;
      const author = commit.author?.login || commit.commit.author?.name || "Unknown";
      byAuthor.set(author, (byAuthor.get(author) || 0) + 1);
    }

    if (data.length < perPage) break;
    if (page >= 20) break; // Safety limit
    page++;
  }

  return { total, byAuthor };
}
