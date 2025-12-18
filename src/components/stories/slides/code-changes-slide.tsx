"use client";

import { motion } from "framer-motion";
import { CodeStats } from "@/types/wrapped";
import { formatNumber } from "@/lib/utils";
import { Code2, Plus, Minus } from "lucide-react";

interface CodeChangesSlideProps {
  codeChanges: CodeStats;
  year: number;
}

export function CodeChangesSlide({ codeChanges, year }: CodeChangesSlideProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center h-full w-full max-w-md px-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1.5 border border-border">
          <Code2 className="h-3.5 w-3.5 text-secondary" />
          <span className="eyebrow text-secondary">Code Changes</span>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 gap-4 w-full mb-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-card border border-border p-4"
        >
          <Plus className="h-4 w-4 mx-auto mb-2 text-secondary" />
          <div className="text-2xl sm:text-3xl font-medium text-secondary">
            {formatNumber(codeChanges.additions)}
          </div>
          <div className="eyebrow text-muted-foreground mt-1">Added</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card border border-border p-4"
        >
          <Minus className="h-4 w-4 mx-auto mb-2 text-destructive" />
          <div className="text-2xl sm:text-3xl font-medium text-destructive">
            {formatNumber(codeChanges.deletions)}
          </div>
          <div className="eyebrow text-muted-foreground mt-1">Removed</div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mb-8"
      >
        <span className="text-sm text-muted-foreground">Net change: </span>
        <span className={`text-lg font-medium ${codeChanges.netChange >= 0 ? "text-secondary" : "text-destructive"}`}>
          {codeChanges.netChange >= 0 ? "+" : ""}
          {formatNumber(codeChanges.netChange)}
        </span>
      </motion.div>

      {/* Language breakdown */}
      {codeChanges.languages.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="w-full"
        >
          <h3 className="eyebrow text-muted-foreground mb-3">Languages</h3>

          {/* Language bar */}
          <div className="flex h-2 overflow-hidden bg-muted mb-4">
            {codeChanges.languages.slice(0, 5).map((lang, index) => (
              <motion.div
                key={lang.name}
                initial={{ width: 0 }}
                animate={{ width: `${lang.percentage}%` }}
                transition={{ delay: 0.5 + index * 0.08, duration: 0.4 }}
                className="h-full"
                style={{ backgroundColor: lang.color }}
              />
            ))}
          </div>

          {/* Language list */}
          <div className="space-y-2">
            {codeChanges.languages.slice(0, 4).map((lang, index) => (
              <motion.div
                key={lang.name}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.55 + index * 0.05 }}
                className="flex items-center gap-2 text-sm"
              >
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: lang.color }}
                />
                <span className="flex-1 text-left">{lang.name}</span>
                <span className="font-mono text-muted-foreground">{lang.percentage}%</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
