import { GitHubPullRequest, GitHubReview } from "@/types/github";

/**
 * Transform GraphQL PR data to REST API format
 * This allows us to use the existing transformation logic
 */
export function transformGraphQLPRsToREST(graphqlPRs: any[]): GitHubPullRequest[] {
  if (!Array.isArray(graphqlPRs)) {
    console.error("transformGraphQLPRsToREST: graphqlPRs is not an array", graphqlPRs);
    return [];
  }

  return graphqlPRs.map((pr) => {
    try {
      return {
        number: pr.number,
        title: pr.title,
        state: pr.state === "MERGED" ? "closed" : pr.state.toLowerCase(),
        created_at: pr.createdAt,
        closed_at: pr.closedAt,
        merged_at: pr.mergedAt,
        additions: pr.additions || 0,
        deletions: pr.deletions || 0,
        commits: pr.commits?.totalCount || 0,
        comments: pr.comments?.totalCount || 0,
        review_comments: 0, // Not available in this query
        html_url: pr.url,
        user: {
          login: pr.author?.login || "unknown",
          avatar_url: pr.author?.avatarUrl || "",
        },
      };
    } catch (error) {
      console.error("Error transforming PR:", pr, error);
      throw error;
    }
  });
}

/**
 * Extract reviews from GraphQL PR data
 */
export function extractReviewsFromGraphQLPRs(
  graphqlPRs: any[]
): Map<number, GitHubReview[]> {
  const reviewsByPR = new Map<number, GitHubReview[]>();

  if (!Array.isArray(graphqlPRs)) {
    console.error("extractReviewsFromGraphQLPRs: graphqlPRs is not an array", graphqlPRs);
    return reviewsByPR;
  }

  for (const pr of graphqlPRs) {
    try {
      if (pr.reviews?.nodes) {
        const reviews: GitHubReview[] = pr.reviews.nodes
          .filter((review: any) => review.author) // Filter out null authors
          .map((review: any) => ({
            id: parseInt(review.id.replace(/\D/g, "")) || 0, // Extract numeric ID
            user: {
              login: review.author.login,
              avatar_url: review.author.avatarUrl,
            },
            state: review.state as GitHubReview["state"],
            submitted_at: review.submittedAt,
            pull_request_url: pr.url,
          }));

        reviewsByPR.set(pr.number, reviews);
      }
    } catch (error) {
      console.error("Error extracting reviews from PR:", pr, error);
      // Continue processing other PRs
    }
  }

  return reviewsByPR;
}

