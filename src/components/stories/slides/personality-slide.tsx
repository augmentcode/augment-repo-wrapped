"use client";

import { motion } from "framer-motion";
import { RepoPersonality, VelocityStats } from "@/types/wrapped";
import { Sparkles, TrendingUp, TrendingDown, Minus } from "lucide-react";

interface PersonalitySlideProps {
  personality: RepoPersonality;
  velocity: VelocityStats;
  year: number;
}

export function PersonalitySlide({ personality, velocity, year }: PersonalitySlideProps) {
  const TrendIcon = velocity.trend === "increasing"
    ? TrendingUp
    : velocity.trend === "decreasing"
    ? TrendingDown
    : Minus;

  const trendColor = velocity.trend === "increasing"
    ? "text-secondary"
    : velocity.trend === "decreasing"
    ? "text-destructive"
    : "text-muted-foreground";

  const trendLabel = velocity.trend === "increasing"
    ? "Growing"
    : velocity.trend === "decreasing"
    ? "Slowing"
    : "Steady";

  return (
    <div className="flex flex-col items-center justify-center text-center h-full w-full max-w-md px-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1.5 border border-border">
          <Sparkles className="h-3.5 w-3.5 text-secondary" />
          <span className="eyebrow text-secondary">Repo Personality</span>
        </div>
      </motion.div>

      {/* Large emoji */}
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.15, type: "spring", stiffness: 200 }}
        className="text-7xl mb-4"
      >
        {personality.emoji}
      </motion.div>

      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-3xl font-medium text-secondary mb-2"
      >
        {personality.title}
      </motion.div>

      {/* Description */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-muted-foreground mb-6 max-w-xs"
      >
        {personality.description}
      </motion.p>

      {/* Traits */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="flex flex-wrap gap-2 justify-center mb-6"
      >
        {personality.traits.map((trait, index) => (
          <motion.span
            key={trait}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.55 + index * 0.08 }}
            className="px-3 py-1 bg-card border border-border text-sm"
          >
            {trait}
          </motion.span>
        ))}
      </motion.div>

      {/* Velocity trend */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="bg-card border border-border p-4 w-full"
      >
        <div className="flex items-center justify-between">
          <div className="text-left">
            <div className="eyebrow text-muted-foreground mb-1">Velocity Trend</div>
            <div className={`text-lg font-medium ${trendColor}`}>
              {trendLabel}
            </div>
          </div>
          <TrendIcon className={`h-8 w-8 ${trendColor}`} />
        </div>

        {/* Quarterly breakdown */}
        <div className="flex justify-between mt-4 text-sm">
          <div className="text-center">
            <div className="font-mono text-muted-foreground">Q1</div>
            <div className={velocity.quarterlyComparison.q1 > 0 ? "text-foreground" : "text-muted-foreground"}>
              {velocity.quarterlyComparison.q1}
            </div>
          </div>
          <div className="text-center">
            <div className="font-mono text-muted-foreground">Q2</div>
            <div className={velocity.quarterlyComparison.q2 > 0 ? "text-foreground" : "text-muted-foreground"}>
              {velocity.quarterlyComparison.q2}
            </div>
          </div>
          <div className="text-center">
            <div className="font-mono text-muted-foreground">Q3</div>
            <div className={velocity.quarterlyComparison.q3 > 0 ? "text-foreground" : "text-muted-foreground"}>
              {velocity.quarterlyComparison.q3}
            </div>
          </div>
          <div className="text-center">
            <div className="font-mono text-muted-foreground">Q4</div>
            <div className={velocity.quarterlyComparison.q4 > 0 ? "text-foreground" : "text-muted-foreground"}>
              {velocity.quarterlyComparison.q4}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
