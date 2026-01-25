"use client";

import { motion } from "framer-motion";
import { RepoInfo, CommitStats, ContributorStats } from "@/types/wrapped";
import { Avatar } from "@/components/ui/avatar";
import { formatNumber } from "@/lib/utils";
import { PartyPopper, Share2, Github } from "lucide-react";
import Link from "next/link";

interface FinaleSlideProps {
  repo: RepoInfo;
  commits: CommitStats;
  contributors: ContributorStats;
  year: number;
  onShare?: () => void;
  isDemo?: boolean;
}

export function FinaleSlide({
  repo,
  commits,
  contributors,
  year,
  onShare,
  isDemo = false,
}: FinaleSlideProps) {
  // Generate confetti pieces with muted colors
  const confetti = Array.from({ length: 16 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    delay: Math.random() * 2,
    color: i % 3 === 0 ? "var(--secondary)" : i % 3 === 1 ? "var(--muted-foreground)" : "var(--foreground)",
    size: Math.random() * 4 + 2,
  }));

  return (
    <div className="flex flex-col items-center justify-center text-center h-full w-full max-w-md px-6 relative overflow-hidden">
      {/* Confetti */}
      {confetti.map((piece) => (
        <motion.div
          key={piece.id}
          className="absolute top-0 rounded-full confetti"
          style={{
            left: piece.left,
            backgroundColor: piece.color,
            width: piece.size,
            height: piece.size,
            animationDelay: `${piece.delay}s`,
          }}
        />
      ))}

      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", duration: 0.5 }}
        className="mb-6"
      >
        <PartyPopper className="h-10 w-10 text-secondary" />
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="text-2xl font-medium mb-6"
      >
        That&apos;s a wrap!
      </motion.h2>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="flex items-center gap-3 mb-6"
      >
        <div className="p-0.5 rounded-full border border-border">
          <Avatar src={repo.owner.avatarUrl} alt={repo.owner.login} size="md" />
        </div>
        <div className="text-left">
          <div className="font-medium">{repo.fullName}</div>
          <div className="eyebrow text-muted-foreground">{year}</div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.35 }}
        className="grid grid-cols-2 gap-3 mb-8 w-full"
      >
        <div className="bg-card border border-border p-3">
          <div className="text-xl font-medium text-secondary">
            {formatNumber(commits.totalThisYear)}
          </div>
          <div className="eyebrow text-muted-foreground">Commits</div>
        </div>
        <div className="bg-card border border-border p-3">
          <div className="text-xl font-medium text-secondary">{contributors.total}</div>
          <div className="eyebrow text-muted-foreground">Contributors</div>
        </div>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.45 }}
        className="text-muted-foreground mb-8"
      >
        Here&apos;s to {year + 1}!
      </motion.p>

      {isDemo ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className="flex flex-col gap-3 w-full"
        >
          <Link href="/login">
            <button className="w-full inline-flex items-center justify-center gap-2 bg-secondary text-secondary-foreground font-medium py-3 px-6 hover:opacity-90 transition-opacity">
              <Github className="h-4 w-4" />
              Sign in to generate your own
            </button>
          </Link>
          <button
            onClick={onShare}
            className="w-full inline-flex items-center justify-center gap-2 border border-border bg-card text-foreground font-medium py-3 px-6 hover:bg-muted transition-colors"
          >
            <Share2 className="h-4 w-4" />
            Share this demo
          </button>
        </motion.div>
      ) : (
        <motion.button
          onClick={onShare}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className="inline-flex items-center gap-2 bg-secondary text-secondary-foreground font-medium py-3 px-6 hover:opacity-90 transition-opacity"
        >
          <Share2 className="h-4 w-4" />
          Share
        </motion.button>
      )}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="mt-8"
      >
        <p className="eyebrow text-muted-foreground">Repo Insights</p>
        <p className="text-[10px] text-muted-foreground/60 tracking-wider">by Augment Code</p>
      </motion.div>
    </div>
  );
}
