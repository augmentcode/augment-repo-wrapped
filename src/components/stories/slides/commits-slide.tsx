"use client";

import { motion } from "framer-motion";
import { CommitStats } from "@/types/wrapped";
import { Avatar } from "@/components/ui/avatar";
import { formatNumber } from "@/lib/utils";
import { GitCommit } from "lucide-react";

interface CommitsSlideProps {
  commits: CommitStats;
  year: number;
}

export function CommitsSlide({ commits, year }: CommitsSlideProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center h-full w-full max-w-md px-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1.5 border border-border">
          <GitCommit className="h-3.5 w-3.5 text-secondary" />
          <span className="eyebrow text-secondary">Commits</span>
        </div>
      </motion.div>

      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="text-6xl sm:text-7xl font-medium text-secondary mb-2"
      >
        {formatNumber(commits.totalThisYear)}
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.25 }}
        className="text-muted-foreground mb-6"
      >
        commits in {year}
      </motion.p>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.35 }}
        className="eyebrow text-muted-foreground mb-8"
      >
        ~{commits.averagePerWeek} per week
      </motion.div>

      {commits.topCommitters.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="w-full"
        >
          <h3 className="eyebrow text-muted-foreground mb-4">Top Contributors</h3>
          <div className="space-y-2">
            {commits.topCommitters.slice(0, 3).map((committer, index) => (
              <motion.div
                key={committer.login}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.08 }}
                className="flex items-center gap-3 bg-card border border-border p-3"
              >
                <span className="font-mono text-sm text-muted-foreground w-5">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <Avatar src={committer.avatarUrl} alt={committer.login} size="sm" />
                <span className="flex-1 text-left truncate text-sm">{committer.login}</span>
                <span className="font-mono text-sm text-muted-foreground">
                  {formatNumber(committer.commits)}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
