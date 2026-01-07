"use client";

import { motion } from "framer-motion";
import { CommunityStats, IssueStats } from "@/types/wrapped";
import { formatNumber } from "@/lib/utils";
import { Star, GitFork, MessageCircle } from "lucide-react";

interface CommunitySlideProps {
  community: CommunityStats;
  issues: IssueStats;
  year: number;
}

export function CommunitySlide({ community, issues, year }: CommunitySlideProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center h-full w-full max-w-md px-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1.5 border border-border">
          <Star className="h-3.5 w-3.5 text-secondary" />
          <span className="eyebrow text-secondary">Community</span>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 gap-4 w-full mb-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-card border border-border p-4"
        >
          <Star className="h-5 w-5 mx-auto mb-2 text-yellow-500" />
          <div className="text-2xl sm:text-3xl font-medium">
            {formatNumber(community.currentStars)}
          </div>
          <div className="eyebrow text-muted-foreground mt-1">Total Stars</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card border border-border p-4"
        >
          <GitFork className="h-5 w-5 mx-auto mb-2 text-blue-500" />
          <div className="text-2xl sm:text-3xl font-medium">
            {formatNumber(community.currentForks)}
          </div>
          <div className="eyebrow text-muted-foreground mt-1">Total Forks</div>
        </motion.div>
      </div>

      {/* Issues */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-card border border-border p-4 w-full mb-6"
      >
        <div className="flex items-center justify-center gap-2 mb-3">
          <MessageCircle className="h-3.5 w-3.5 text-secondary" />
          <span className="eyebrow text-secondary">Issues</span>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-xl font-medium">{formatNumber(issues.opened)}</div>
            <div className="eyebrow text-muted-foreground">Opened</div>
          </div>
          <div>
            <div className="text-xl font-medium text-secondary">{formatNumber(issues.closed)}</div>
            <div className="eyebrow text-muted-foreground">Closed</div>
          </div>
        </div>
      </motion.div>

      {issues.mostActiveIssue && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-card border border-secondary/30 p-4 w-full"
        >
          <div className="eyebrow text-secondary mb-2">Most Discussed</div>
          <p className="text-sm text-muted-foreground truncate mb-1">
            #{issues.mostActiveIssue.number}: {issues.mostActiveIssue.title}
          </p>
          <p className="text-lg font-medium">
            {issues.mostActiveIssue.comments} comments
          </p>
        </motion.div>
      )}
    </div>
  );
}
