"use client";

import { motion } from "framer-motion";
import { ActivityStats } from "@/types/wrapped";
import { Calendar, Flame } from "lucide-react";

interface ActivitySlideProps {
  activity: ActivityStats;
  year: number;
}

export function ActivitySlide({ activity, year }: ActivitySlideProps) {
  const maxMonthCommits = Math.max(...activity.commitsByMonth.map((m) => m.count));
  const maxDayCommits = Math.max(...activity.commitsByDayOfWeek.map((d) => d.count));

  return (
    <div className="flex flex-col items-center justify-center text-center h-full w-full max-w-md px-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1.5 border border-border">
          <Calendar className="h-3.5 w-3.5 text-secondary" />
          <span className="eyebrow text-secondary">Activity</span>
        </div>
      </motion.div>

      {/* Busiest Month */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="bg-card border border-secondary/30 p-4 w-full mb-6"
      >
        <div className="flex items-center justify-center gap-2 mb-2">
          <Flame className="h-3.5 w-3.5 text-secondary" />
          <span className="eyebrow text-secondary">Busiest Month</span>
        </div>
        <div className="text-3xl font-medium">{activity.busiestMonth.month}</div>
        <div className="text-sm text-muted-foreground mt-1">
          {activity.busiestMonth.commits} commits
        </div>
      </motion.div>

      {/* Monthly Activity Chart */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="w-full mb-6"
      >
        <div className="flex items-end justify-between gap-1 h-20">
          {activity.commitsByMonth.map((month, index) => (
            <motion.div
              key={month.month}
              initial={{ height: 0 }}
              animate={{
                height: maxMonthCommits > 0
                  ? `${Math.max((month.count / maxMonthCommits) * 100, 4)}%`
                  : "4%",
              }}
              transition={{ delay: 0.35 + index * 0.025, duration: 0.3 }}
              className="flex-1 bg-secondary/60 rounded-sm hover:bg-secondary transition-colors"
              title={`${month.month}: ${month.count}`}
            />
          ))}
        </div>
        <div className="flex justify-between text-[10px] text-muted-foreground mt-2 font-mono">
          <span>Jan</span>
          <span>Jun</span>
          <span>Dec</span>
        </div>
      </motion.div>

      {/* Busiest Day */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.55 }}
        className="text-sm text-muted-foreground mb-4"
      >
        Most active on <span className="text-foreground font-medium">{activity.busiestDayOfWeek.day}s</span>
      </motion.div>

      {/* Weekly Activity */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.65 }}
        className="w-full"
      >
        <div className="flex items-end justify-between gap-2 h-14">
          {activity.commitsByDayOfWeek.map((day, index) => (
            <motion.div
              key={day.day}
              initial={{ height: 0 }}
              animate={{
                height: maxDayCommits > 0
                  ? `${Math.max((day.count / maxDayCommits) * 100, 8)}%`
                  : "8%",
              }}
              transition={{ delay: 0.7 + index * 0.04, duration: 0.25 }}
              className="flex-1 bg-muted rounded-sm"
            />
          ))}
        </div>
        <div className="flex justify-between text-[10px] text-muted-foreground mt-2 font-mono">
          {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
            <span key={i} className="flex-1 text-center">{d}</span>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
