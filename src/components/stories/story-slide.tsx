"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface StorySlideProps {
  children: React.ReactNode;
  gradientClass: string;
  direction: "forward" | "backward";
}

const slideVariants = {
  enter: (direction: "forward" | "backward") => ({
    x: direction === "forward" ? "100%" : "-100%",
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: "forward" | "backward") => ({
    x: direction === "forward" ? "-100%" : "100%",
    opacity: 0,
  }),
};

export function StorySlide({
  children,
  gradientClass,
  direction,
}: StorySlideProps) {
  return (
    <motion.div
      custom={direction}
      variants={slideVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{
        x: { type: "spring", stiffness: 300, damping: 30 },
        opacity: { duration: 0.2 },
      }}
      className={cn(
        "absolute inset-0 flex flex-col items-center justify-center p-8 text-white overflow-hidden",
        gradientClass
      )}
    >
      {children}
    </motion.div>
  );
}
