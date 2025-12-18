"use client";

import { motion } from "framer-motion";
import { RepoInfo } from "@/types/wrapped";
import { Avatar } from "@/components/ui/avatar";

interface CoverSlideProps {
  repo: RepoInfo;
  year: number;
}

export function CoverSlide({ repo, year }: CoverSlideProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center h-full px-6">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="mb-8"
      >
        <div className="p-0.5 rounded-full border border-border">
          <Avatar src={repo.owner.avatarUrl} alt={repo.owner.login} size="xl" />
        </div>
      </motion.div>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="eyebrow text-muted-foreground mb-3"
      >
        {repo.owner.login}
      </motion.p>

      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="text-3xl sm:text-4xl font-medium tracking-tight mb-8"
      >
        {repo.name}
      </motion.h1>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="flex flex-col items-center gap-2"
      >
        <span className="text-6xl sm:text-7xl font-medium text-secondary">{year}</span>
        <span className="eyebrow text-muted-foreground">Year in Review</span>
      </motion.div>

      {repo.description && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-10 text-sm text-muted-foreground max-w-xs leading-relaxed"
        >
          {repo.description}
        </motion.p>
      )}
    </div>
  );
}
