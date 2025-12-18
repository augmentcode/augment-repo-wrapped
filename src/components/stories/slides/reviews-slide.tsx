"use client";

import { motion } from "framer-motion";
import { ReviewStats } from "@/types/wrapped";
import { Avatar } from "@/components/ui/avatar";
import { formatDuration } from "@/lib/utils";
import { Eye, Clock, Users, CheckCircle } from "lucide-react";

interface ReviewsSlideProps {
  reviews: ReviewStats;
  year: number;
}

export function ReviewsSlide({ reviews, year }: ReviewsSlideProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center h-full w-full max-w-md px-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1.5 border border-border">
          <Eye className="h-3.5 w-3.5 text-secondary" />
          <span className="eyebrow text-secondary">Code Reviews</span>
        </div>
      </motion.div>

      {/* Total reviews */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="text-5xl sm:text-6xl font-medium text-secondary mb-2"
      >
        {reviews.totalReviews}
      </motion.div>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.25 }}
        className="text-muted-foreground mb-6"
      >
        reviews submitted
      </motion.p>

      {/* Stats row */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="grid grid-cols-2 gap-3 w-full mb-6"
      >
        <div className="bg-card border border-border p-3">
          <div className="flex items-center gap-1.5 mb-1 justify-center">
            <Clock className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">First Review</span>
          </div>
          <div className="font-medium">
            {formatDuration(reviews.avgTimeToFirstReviewHours)}
          </div>
        </div>
        <div className="bg-card border border-border p-3">
          <div className="flex items-center gap-1.5 mb-1 justify-center">
            <CheckCircle className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Approval Rate</span>
          </div>
          <div className="font-medium text-secondary">
            {Math.round(reviews.approvalRate)}%
          </div>
        </div>
      </motion.div>

      {/* Top reviewers */}
      {reviews.topReviewers.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="w-full"
        >
          <h3 className="eyebrow text-muted-foreground mb-3">Top Reviewers</h3>
          <div className="space-y-2">
            {reviews.topReviewers.slice(0, 4).map((reviewer, index) => (
              <motion.div
                key={reviewer.login}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.08 }}
                className={`flex items-center gap-3 p-2 ${
                  index === 0
                    ? "bg-card border border-secondary/30"
                    : "bg-card border border-border"
                }`}
              >
                <span className="font-mono text-xs text-muted-foreground w-4">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <Avatar
                  src={reviewer.avatarUrl}
                  alt={reviewer.login}
                  size="sm"
                />
                <div className="flex-1 text-left">
                  <span className={`text-sm ${index === 0 ? "text-secondary" : ""}`}>
                    {reviewer.login}
                  </span>
                </div>
                <div className="text-right font-mono text-sm">
                  <span className={index === 0 ? "text-secondary" : "text-muted-foreground"}>
                    {reviewer.reviewCount}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Top pair hint */}
      {reviews.topReviewerPairs.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-4 text-sm text-muted-foreground"
        >
          <Users className="inline h-3 w-3 mr-1" />
          Top pair: {reviews.topReviewerPairs[0].author} & {reviews.topReviewerPairs[0].reviewer}
          <span className="text-foreground"> ({reviews.topReviewerPairs[0].count})</span>
        </motion.div>
      )}
    </div>
  );
}
