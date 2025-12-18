"use client";

import { motion } from "framer-motion";
import { PRStats } from "@/types/wrapped";
import { Avatar } from "@/components/ui/avatar";
import { formatNumber } from "@/lib/utils";
import { Trophy, Turtle, MessageSquare, FileCode, GitCommit } from "lucide-react";

interface PRHighlightsSlideProps {
  pullRequests: PRStats;
  year: number;
}

export function PRHighlightsSlide({ pullRequests, year }: PRHighlightsSlideProps) {
  const highlights = [
    {
      icon: Turtle,
      label: "Longest Merge",
      data: pullRequests.slowestMerge,
      value: pullRequests.slowestMerge?.mergeTimeDays,
      suffix: " days",
      show: pullRequests.slowestMerge && pullRequests.slowestMerge.mergeTimeDays > 0,
    },
    {
      icon: MessageSquare,
      label: "Most Discussed",
      data: pullRequests.mostCommentedPR,
      value: pullRequests.mostCommentedPR?.comments,
      suffix: " comments",
      show: pullRequests.mostCommentedPR && pullRequests.mostCommentedPR.comments > 0,
    },
    {
      icon: FileCode,
      label: "Biggest PR",
      data: pullRequests.biggestPR,
      value: pullRequests.biggestPR?.totalLines,
      suffix: " lines",
      show: pullRequests.biggestPR && pullRequests.biggestPR.totalLines > 0,
    },
    {
      icon: GitCommit,
      label: "Most Revised",
      data: pullRequests.mostRevisedPR,
      value: pullRequests.mostRevisedPR?.commits,
      suffix: " commits",
      show: pullRequests.mostRevisedPR && pullRequests.mostRevisedPR.commits > 1,
    },
  ].filter((h) => h.show);

  if (highlights.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center h-full w-full max-w-md px-6">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 border border-border">
            <Trophy className="h-3.5 w-3.5 text-secondary" />
            <span className="eyebrow text-secondary">PR Awards</span>
          </div>
        </motion.div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-muted-foreground"
        >
          Not enough PR data for awards
        </motion.p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center text-center h-full w-full max-w-md px-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1.5 border border-border">
          <Trophy className="h-3.5 w-3.5 text-secondary" />
          <span className="eyebrow text-secondary">PR Awards</span>
        </div>
      </motion.div>

      <div className="space-y-3 w-full">
        {highlights.map((highlight, index) => {
          const Icon = highlight.icon;
          const data = highlight.data!;
          return (
            <motion.div
              key={highlight.label}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 + index * 0.1 }}
              className="bg-card border border-border p-4 text-left"
            >
              <div className="flex items-center gap-2 mb-2">
                <Icon className="h-3.5 w-3.5 text-secondary" />
                <span className="eyebrow text-secondary">{highlight.label}</span>
              </div>
              <div className="flex items-center gap-3">
                <Avatar
                  src={data.authorAvatar}
                  alt={data.author}
                  size="sm"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate">
                    #{data.number}: {data.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    by {data.author}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-medium text-secondary">
                    {formatNumber(highlight.value!)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {highlight.suffix.trim()}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Size distribution summary */}
      {pullRequests.sizeDistribution && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 text-sm text-muted-foreground"
        >
          <span className="text-foreground">{pullRequests.sizeDistribution.tiny + pullRequests.sizeDistribution.small}</span>
          {" "}small PRs, {" "}
          <span className="text-foreground">{pullRequests.sizeDistribution.large + pullRequests.sizeDistribution.huge}</span>
          {" "}large PRs
        </motion.div>
      )}
    </div>
  );
}
