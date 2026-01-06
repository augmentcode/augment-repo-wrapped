import { Octokit } from "octokit";
import { graphql } from "@octokit/graphql";

const GITHUB_GRAPHQL_ENDPOINT = "https://api.github.com/graphql";

export interface Organization {
  id: string;
  login: string;
  name: string;
  avatarUrl: string;
  isPersonal?: boolean;
}

export interface Repository {
  id: string;
  name: string;
  nameWithOwner: string;
  isPrivate: boolean;
}

export interface PullRequest {
  id: string;
  number: number;
  title: string;
  state: string;
  createdAt: string;
  mergedAt: string | null;
  closedAt: string | null;
  additions?: number;
  deletions?: number;
  changedFiles?: number;
  body?: string;
  author: {
    login: string;
  };
  repository: {
    name: string;
    nameWithOwner: string;
  };
  reviews?: Review[];
  reviewRequests?: ReviewRequest[];
  commits?: {
    totalCount: number;
  };
}

export interface Review {
  id: string;
  author: {
    login: string;
  };
  state: string;
  submittedAt: string;
  body: string;
  comments: Comment[];
}

export interface Comment {
  id: string;
  body: string;
  createdAt: string;
  author: {
    login: string;
  };
  path: string;
}

export interface ReviewRequest {
  requestedReviewer: {
    login: string;
  };
}

export class GitHubAPI {
  private token: string;
  private octokit: Octokit;
  private graphqlClient: typeof graphql;
  private rateLimitRemaining: number | null = null;
  private rateLimitResetAt: Date | null = null;

  constructor(token: string) {
    this.token = token;
    this.octokit = new Octokit({ auth: token });
    this.graphqlClient = graphql.defaults({
      headers: {
        authorization: `Bearer ${token}`,
      },
    });
  }

  async query(
    graphqlQuery: string,
    variables: Record<string, any> = {},
    retryCount = 0
  ): Promise<any> {
    // Check rate limit
    if (this.rateLimitRemaining !== null && this.rateLimitRemaining < 10) {
      const now = new Date();
      const resetAt = this.rateLimitResetAt!;
      if (now < resetAt) {
        const waitTime = Math.ceil((resetAt.getTime() - now.getTime()) / 1000);
        throw new Error(`Rate limit exceeded. Resets in ${waitTime} seconds.`);
      }
    }

    try {
      const response = await fetch(GITHUB_GRAPHQL_ENDPOINT, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: graphqlQuery, variables }),
      });

      // Update rate limit info
      const remaining = response.headers.get("X-RateLimit-Remaining");
      const reset = response.headers.get("X-RateLimit-Reset");
      if (remaining) this.rateLimitRemaining = parseInt(remaining);
      if (reset) this.rateLimitResetAt = new Date(parseInt(reset) * 1000);

      if (!response.ok) {
        if (response.status === 403 && retryCount < 3) {
          await this.sleep(2000 * (retryCount + 1));
          return this.query(graphqlQuery, variables, retryCount + 1);
        }
        throw new Error(`GitHub API error: ${response.status}`);
      }

      const data = await response.json();

      if (data.errors) {
        const errorMsg = data.errors[0].message;
        if (errorMsg.includes("rate limit") && retryCount < 3) {
          await this.sleep(5000 * (retryCount + 1));
          return this.query(graphqlQuery, variables, retryCount + 1);
        }
        throw new Error(`GraphQL error: ${errorMsg}`);
      }

      return data.data;
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes("fetch") &&
        retryCount < 3
      ) {
        await this.sleep(1000 * (retryCount + 1));
        return this.query(graphqlQuery, variables, retryCount + 1);
      }
      throw error;
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async validateToken() {
    const query = `
      query {
        viewer {
          login
          name
        }
      }
    `;

    try {
      const scopeResponse = await fetch("https://api.github.com/user", {
        headers: { Authorization: `Bearer ${this.token}` },
      });
      const scopes = scopeResponse.headers.get("X-OAuth-Scopes");

      const data = await this.query(query);
      return { valid: true, user: data.viewer, scopes };
    } catch (error) {
      return { valid: false, error: (error as Error).message };
    }
  }

  async getOrganizations(): Promise<Organization[]> {
    const query = `
      query {
        viewer {
          id
          login
          name
          avatarUrl
          organizations(first: 100) {
            nodes {
              id
              login
              name
              avatarUrl
            }
          }
        }
      }
    `;

    const data = await this.query(query);
    const viewer = data.viewer;

    // Add personal account as first "organization"
    const organizations: Organization[] = [
      {
        id: viewer.id,
        login: viewer.login,
        name: viewer.name || viewer.login,
        avatarUrl: viewer.avatarUrl,
        isPersonal: true,
      },
    ];

    // Add actual organizations
    if (data.viewer.organizations?.nodes) {
      organizations.push(...data.viewer.organizations.nodes);
    }

    return organizations;
  }

  async getRepositories(
    orgLogin: string,
    isPersonal: boolean = false
  ): Promise<Repository[]> {
    if (isPersonal) {
      const query = `
        query {
          viewer {
            repositories(first: 100, orderBy: {field: PUSHED_AT, direction: DESC}, ownerAffiliations: OWNER) {
              nodes {
                id
                name
                nameWithOwner
                isPrivate
              }
            }
          }
        }
      `;

      const data = await this.query(query);
      return data.viewer.repositories.nodes || [];
    } else {
      const query = `
        query($orgLogin: String!) {
          organization(login: $orgLogin) {
            repositories(first: 100, orderBy: {field: PUSHED_AT, direction: DESC}) {
              nodes {
                id
                name
                nameWithOwner
                isPrivate
              }
            }
          }
        }
      `;

      const data = await this.query(query, { orgLogin });
      return data.organization?.repositories?.nodes || [];
    }
  }

  async getPullRequests(
    orgLogin: string,
    daysAgo: number = 60,
    isPersonal: boolean = false
  ): Promise<PullRequest[]> {
    const since = new Date();
    since.setDate(since.getDate() - daysAgo);
    const sinceISO = since.toISOString();

    const searchQuery = isPersonal
      ? `is:pr author:${orgLogin} created:>=${sinceISO}`
      : `is:pr org:${orgLogin} created:>=${sinceISO}`;

    return this.getPullRequestsForSingleRepo(searchQuery);
  }

  async getPullRequestsForRepos(
    repoNames: string[],
    daysAgo: number = 60
  ): Promise<PullRequest[]> {
    const allPRs: PullRequest[] = [];

    for (const repoName of repoNames) {
      const since = new Date();
      since.setDate(since.getDate() - daysAgo);
      const sinceISO = since.toISOString();
      const searchQuery = `is:pr repo:${repoName} created:>=${sinceISO}`;

      const prs = await this.getPullRequestsForSingleRepo(searchQuery);
      allPRs.push(...prs);
    }

    return allPRs;
  }

  private async getPullRequestsForSingleRepo(
    searchQuery: string
  ): Promise<PullRequest[]> {
    const query = `
      query($searchQuery: String!, $cursor: String) {
        search(query: $searchQuery, type: ISSUE, first: 100, after: $cursor) {
          issueCount
          edges {
            node {
              ... on PullRequest {
                id
                number
                title
                state
                createdAt
                mergedAt
                closedAt
                author {
                  login
                }
                repository {
                  name
                  nameWithOwner
                }
              }
            }
          }
          pageInfo {
            hasNextPage
            endCursor
          }
        }
      }
    `;

    const allPRs: PullRequest[] = [];
    let hasNextPage = true;
    let cursor: string | null = null;

    while (hasNextPage) {
      const data = await this.query(query, { searchQuery, cursor });

      const edges = data.search.edges || [];
      for (const edge of edges) {
        if (edge.node) {
          allPRs.push(edge.node);
        }
      }

      hasNextPage = data.search.pageInfo.hasNextPage;
      cursor = data.search.pageInfo.endCursor;

      // Safety limit
      if (allPRs.length > 10000) {
        console.warn("Reached 10k PR limit, stopping pagination");
        break;
      }
    }

    return allPRs;
  }

  async getPullRequestsWithDetails(
    repoNames: string[],
    daysAgo: number = 60
  ): Promise<PullRequest[]> {
    const allPRs: PullRequest[] = [];

    for (const repoName of repoNames) {
      const since = new Date();
      since.setDate(since.getDate() - daysAgo);
      const sinceISO = since.toISOString();
      const searchQuery = `is:pr repo:${repoName} created:>=${sinceISO}`;

      const prs = await this.getPullRequestsWithDetailsForSingleRepo(
        searchQuery
      );
      allPRs.push(...prs);
    }

    return allPRs;
  }

  private async getPullRequestsWithDetailsForSingleRepo(
    searchQuery: string
  ): Promise<PullRequest[]> {
    const query = `
      query($searchQuery: String!, $cursor: String) {
        search(query: $searchQuery, type: ISSUE, first: 50, after: $cursor) {
          issueCount
          edges {
            node {
              ... on PullRequest {
                id
                number
                title
                state
                createdAt
                updatedAt
                mergedAt
                closedAt
                additions
                deletions
                changedFiles
                body
                author {
                  login
                }
                repository {
                  name
                  nameWithOwner
                }
                reviews(first: 20) {
                  nodes {
                    id
                    author {
                      login
                    }
                    state
                    submittedAt
                    body
                    comments(first: 10) {
                      nodes {
                        id
                        body
                        createdAt
                        author {
                          login
                        }
                        path
                      }
                    }
                  }
                }
                reviewRequests(first: 10) {
                  nodes {
                    requestedReviewer {
                      ... on User {
                        login
                      }
                    }
                  }
                }
                commits(first: 1) {
                  totalCount
                }
              }
            }
          }
          pageInfo {
            hasNextPage
            endCursor
          }
        }
      }
    `;

    const allPRs: PullRequest[] = [];
    let hasNextPage = true;
    let cursor: string | null = null;

    while (hasNextPage) {
      const data = await this.query(query, { searchQuery, cursor });

      const edges = data.search.edges || [];
      for (const edge of edges) {
        if (edge.node) {
          allPRs.push(edge.node);
        }
      }

      hasNextPage = data.search.pageInfo.hasNextPage;
      cursor = data.search.pageInfo.endCursor;

      // Safety limit
      if (allPRs.length > 5000) {
        console.warn("Reached 5k PR limit for detailed fetch, stopping");
        break;
      }
    }

    return allPRs;
  }
}

