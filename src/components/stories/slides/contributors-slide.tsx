"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ContributorStats } from "@/types/wrapped";
import { Avatar } from "@/components/ui/avatar";
import { formatNumber } from "@/lib/utils";
import { Users, Trophy, GitCommit, GitPullRequest, FileCode, Eye } from "lucide-react";

interface ContributorsSlideProps {
  contributors: ContributorStats;
  year: number;
}

type LeaderboardType = "commits" | "prs" | "lines" | "reviews";

export function ContributorsSlide({ contributors, year }: ContributorsSlideProps) {
  const [activeLeaderboard, setActiveLeaderboard] = useState<LeaderboardType>("commits");

  const allLeaderboards: {
    type: LeaderboardType;
    label: string;
    icon: typeof GitCommit;
    data: { login: string; avatarUrl: string; value: number }[];
    suffix: string;
  }[] = [
    {
      type: "commits",
      label: "Commits",
      icon: GitCommit,
      data: contributors.topContributors.map((c) => ({
        login: c.login,
        avatarUrl: c.avatarUrl,
        value: c.commits,
      })),
      suffix: "",
    },
    {
      type: "prs",
      label: "PRs",
      icon: GitPullRequest,
      data: contributors.topByPRs.map((c) => ({
        login: c.login,
        avatarUrl: c.avatarUrl,
        value: c.prCount,
      })),
      suffix: "",
    },
    {
      type: "lines",
      label: "Lines",
      icon: FileCode,
      data: contributors.topByLinesChanged.map((c) => ({
        login: c.login,
        avatarUrl: c.avatarUrl,
        value: c.linesChanged,
      })),
      suffix: "",
    },
    {
      type: "reviews",
      label: "Reviews",
      icon: Eye,
      data: contributors.topByReviews.map((c) => ({
        login: c.login,
        avatarUrl: c.avatarUrl,
        value: c.reviewCount,
      })),
      suffix: "",
    },
  ];

  const leaderboards = allLeaderboards.filter((l) => l.data.length > 0);

  const currentLeaderboard = leaderboards.find((l) => l.type === activeLeaderboard) || leaderboards[0];

  return (
    <div className="flex flex-col items-center justify-center text-center h-full w-full max-w-md px-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1.5 border border-border">
          <Users className="h-3.5 w-3.5 text-secondary" />
          <span className="eyebrow text-secondary">Contributors</span>
        </div>
      </motion.div>

      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="text-6xl sm:text-7xl font-medium text-secondary mb-2"
      >
        {contributors.total}
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.25 }}
        className="text-muted-foreground mb-6"
      >
        {contributors.total === 1 ? "contributor" : "contributors"}
        {contributors.newThisYear > 0 && (
          <span className="text-secondary"> (+{contributors.newThisYear} new)</span>
        )}
      </motion.p>

      {leaderboards.length > 1 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex gap-1 mb-4"
        >
          {leaderboards.map((leaderboard) => {
            const Icon = leaderboard.icon;
            return (
              <button
                key={leaderboard.type}
                onClick={() => setActiveLeaderboard(leaderboard.type)}
                className={`px-3 py-1.5 text-xs flex items-center gap-1.5 transition-colors ${
                  activeLeaderboard === leaderboard.type
                    ? "bg-secondary text-secondary-foreground"
                    : "bg-card border border-border hover:bg-accent"
                }`}
              >
                <Icon className="h-3 w-3" />
                {leaderboard.label}
              </button>
            );
          })}
        </motion.div>
      )}

      {currentLeaderboard && currentLeaderboard.data.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="w-full"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activeLeaderboard}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-2"
            >
              {currentLeaderboard.data.slice(0, 5).map((contributor, index) => (
                <div
                  key={contributor.login}
                  className={`flex items-center gap-3 p-3 ${
                    index === 0
                      ? "bg-card border border-secondary/30"
                      : "bg-card border border-border"
                  }`}
                >
                  <div className="w-5 flex justify-center">
                    {index === 0 ? (
                      <Trophy className="h-3.5 w-3.5 text-secondary" />
                    ) : (
                      <span className="font-mono text-sm text-muted-foreground">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                    )}
                  </div>
                  <Avatar
                    src={contributor.avatarUrl}
                    alt={contributor.login}
                    size="sm"
                  />
                  <div className="flex-1 text-left">
                    <div
                      className={`text-sm truncate ${
                        index === 0 ? "text-secondary font-medium" : ""
                      }`}
                    >
                      {contributor.login}
                    </div>
                  </div>
                  <div className="text-right font-mono text-sm">
                    <div className={index === 0 ? "text-secondary" : "text-muted-foreground"}>
                      {formatNumber(contributor.value)}
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      )}

      {contributors.total === 1 && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-4 eyebrow text-muted-foreground"
        >
          Solo Mode
        </motion.p>
      )}
    </div>
  );
}
