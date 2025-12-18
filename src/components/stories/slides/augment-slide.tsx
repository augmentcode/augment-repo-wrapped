"use client";

import { motion } from "framer-motion";
import { PRStats } from "@/types/wrapped";
import { Bot, Zap, Shield, ArrowRight } from "lucide-react";

interface AugmentSlideProps {
  pullRequests: PRStats;
}

export function AugmentSlide({ pullRequests }: AugmentSlideProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center h-full w-full max-w-md px-6">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="mb-8"
      >
        <div className="w-14 h-14 bg-secondary flex items-center justify-center">
          <Bot className="h-7 w-7 text-secondary-foreground" />
        </div>
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="text-2xl font-medium mb-2"
      >
        Level up your reviews
      </motion.h2>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="text-muted-foreground mb-8"
      >
        You merged <span className="text-secondary font-medium">{pullRequests.merged}</span> PRs this year.
        <br />
        What if AI helped review them?
      </motion.p>

      <div className="space-y-2 w-full mb-8">
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.35 }}
          className="flex items-center gap-3 bg-card border border-border p-3"
        >
          <Zap className="h-4 w-4 text-secondary flex-shrink-0" />
          <span className="text-sm text-left">
            <span className="text-secondary font-medium">60% faster</span> PR reviews
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="flex items-center gap-3 bg-card border border-border p-3"
        >
          <Shield className="h-4 w-4 text-secondary flex-shrink-0" />
          <span className="text-sm text-left">Catches bugs humans miss</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.45 }}
          className="flex items-center gap-3 bg-card border border-border p-3"
        >
          <Bot className="h-4 w-4 text-secondary flex-shrink-0" />
          <span className="text-sm text-left">
            <span className="text-secondary font-medium">Free</span> for open source
          </span>
        </motion.div>
      </div>

      <motion.a
        href="https://www.augmentcode.com"
        target="_blank"
        rel="noopener noreferrer"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55 }}
        className="inline-flex items-center gap-2 bg-secondary text-secondary-foreground font-medium py-3 px-6 hover:opacity-90 transition-opacity"
      >
        Try Augment Code
        <ArrowRight className="h-4 w-4" />
      </motion.a>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.65 }}
        className="mt-4 eyebrow text-muted-foreground"
      >
        augmentcode.com
      </motion.p>
    </div>
  );
}
