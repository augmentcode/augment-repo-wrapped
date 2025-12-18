"use client";

import { motion } from "framer-motion";
import { PRStats } from "@/types/wrapped";
import { formatNumber, formatDuration } from "@/lib/utils";
import { GitPullRequest, Zap, Clock } from "lucide-react";

interface PullRequestsSlideProps {
  pullRequests: PRStats;
  year: number;
}

export function PullRequestsSlide({ pullRequests, year }: PullRequestsSlideProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center h-full w-full max-w-md px-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1.5 border border-border">
          <GitPullRequest className="h-3.5 w-3.5 text-secondary" />
          <span className="eyebrow text-secondary">Pull Requests</span>
        </div>
      </motion.div>

      <div className="grid grid-cols-3 gap-3 w-full mb-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-card border border-border p-4"
        >
          <div className="text-2xl sm:text-3xl font-medium text-secondary">
            {formatNumber(pullRequests.opened)}
          </div>
          <div className="eyebrow text-muted-foreground mt-1">Opened</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card border border-border p-4"
        >
          <div className="text-2xl sm:text-3xl font-medium text-secondary">
            {formatNumber(pullRequests.merged)}
          </div>
          <div className="eyebrow text-muted-foreground mt-1">Merged</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-card border border-border p-4"
        >
          <div className="text-2xl sm:text-3xl font-medium">
            {pullRequests.opened > 0
              ? Math.round((pullRequests.merged / pullRequests.opened) * 100)
              : 0}%
          </div>
          <div className="eyebrow text-muted-foreground mt-1">Rate</div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.35 }}
        className="flex items-center gap-2 mb-6 text-sm text-muted-foreground"
      >
        <Clock className="h-3.5 w-3.5" />
        <span>
          Avg merge time: <span className="text-foreground">{formatDuration(pullRequests.averageMergeTimeHours)}</span>
        </span>
      </motion.div>

      {pullRequests.fastestMerge && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="bg-card border border-secondary/30 p-4 w-full"
        >
          <div className="flex items-center gap-2 mb-2">
            <Zap className="h-3.5 w-3.5 text-secondary" />
            <span className="eyebrow text-secondary">Fastest Merge</span>
          </div>
          <p className="text-sm text-muted-foreground truncate mb-1">
            #{pullRequests.fastestMerge.number}: {pullRequests.fastestMerge.title}
          </p>
          <p className="text-xl font-medium text-secondary">
            {pullRequests.fastestMerge.mergeTimeMinutes < 60
              ? `${pullRequests.fastestMerge.mergeTimeMinutes}m`
              : formatDuration(pullRequests.fastestMerge.mergeTimeMinutes / 60)}
          </p>
        </motion.div>
      )}
    </div>
  );
}
