"use client";

import React, { useEffect, useCallback, useRef, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { WrappedData } from "@/types/wrapped";
import { SLIDE_CONFIGS, TOTAL_SLIDES } from "@/types/slides";
import { useWrappedStore } from "@/stores/wrapped-store";
import { ProgressIndicator } from "./progress-indicator";
import { NavigationOverlay } from "./navigation-overlay";
import { StorySlide } from "./story-slide";
import { CoverSlide } from "./slides/cover-slide";
import { CommitsSlide } from "./slides/commits-slide";
import { PullRequestsSlide } from "./slides/pull-requests-slide";
import { PRHighlightsSlide } from "./slides/pr-highlights-slide";
import { ReviewsSlide } from "./slides/reviews-slide";
import { ActivitySlide } from "./slides/activity-slide";
import { ContributorsSlide } from "./slides/contributors-slide";
import { CodeChangesSlide } from "./slides/code-changes-slide";
import { CommunitySlide } from "./slides/community-slide";
import { PersonalitySlide } from "./slides/personality-slide";
import { AugmentSlide } from "./slides/augment-slide";
import { FinaleSlide } from "./slides/finale-slide";
import { ShareButton } from "../sharing/share-button";
import { X, Pause, Play, Info } from "lucide-react";
import { useRouter } from "next/navigation";
import { DEMO_CONFIG } from "@/lib/demo-config";
import Link from "next/link";

interface StoriesViewerProps {
  data: WrappedData;
  initialSlideIndex?: number;
}

export function StoriesViewer({ data, initialSlideIndex = 0 }: StoriesViewerProps) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const [hasInitialized, setHasInitialized] = useState(false);
  const initRef = useRef(false);

  // Check if this is demo mode
  const isDemo = DEMO_CONFIG.isDemo(data.repo.owner.login, data.repo.name);

  // Filter slides based on available data
  const getAvailableSlides = () => {
    return SLIDE_CONFIGS.filter((config) => {
      // Always show these slides
      if (['cover', 'commits', 'pull-requests', 'pr-highlights', 'reviews', 'activity', 'community', 'personality', 'augment', 'finale'].includes(config.type)) {
        return true;
      }

      // Skip contributors slide if total is 0 (even if we have a list, the total being 0 means incomplete data)
      if (config.type === 'contributors') {
        return data.contributors.total > 0;
      }

      // Skip code changes slide if we have no code change data
      if (config.type === 'code-changes') {
        return data.codeChanges.additions > 0 || data.codeChanges.deletions > 0;
      }

      return true;
    });
  };

  const availableSlides = getAvailableSlides();

  const {
    currentSlideIndex,
    isPlaying,
    isPaused,
    direction,
    nextSlide,
    prevSlide,
    pause,
    resume,
    togglePlay,
    reset,
    goToSlide,
  } = useWrappedStore();

  // Initialize and jump to initial slide if provided
  useEffect(() => {
    // Prevent double initialization in strict mode
    if (initRef.current) return;
    initRef.current = true;

    // Use requestAnimationFrame to defer state updates until after render
    requestAnimationFrame(() => {
      // Reset store first
      reset();

      // Then jump to the initial slide if needed
      if (initialSlideIndex > 0 && initialSlideIndex < availableSlides.length) {
        goToSlide(initialSlideIndex);
      }

      // Mark as initialized after a brief delay to ensure store is ready
      setTimeout(() => {
        setHasInitialized(true);
      }, 100);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  const [progress, setProgress] = useState(0);

  const currentSlideConfig = availableSlides[currentSlideIndex];
  const isLastSlide = currentSlideIndex === availableSlides.length - 1;

  // Auto-advance logic
  useEffect(() => {
    if (!hasInitialized || !isPlaying || isPaused || isLastSlide) {
      return;
    }

    const duration = currentSlideConfig.duration;
    const interval = 50; // Update progress every 50ms
    const increment = (interval / duration) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + increment;
        if (newProgress >= 100) {
          // Schedule nextSlide to run after this render cycle
          setTimeout(() => nextSlide(), 0);
          return 100;
        }
        return newProgress;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [hasInitialized, currentSlideIndex, isPlaying, isPaused, isLastSlide, currentSlideConfig.duration, nextSlide]);

  // Reset progress when slide changes
  useEffect(() => {
    setProgress(0);
  }, [currentSlideIndex]);

  // Reset on unmount
  useEffect(() => {
    return () => reset();
  }, [reset]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        nextSlide();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        prevSlide();
      } else if (e.key === "Escape") {
        router.push("/");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [nextSlide, prevSlide, router]);

  const handlePauseStart = useCallback(() => {
    pause();
  }, [pause]);

  const handlePauseEnd = useCallback(() => {
    resume();
  }, [resume]);

  const handleClose = () => {
    router.push("/");
  };

  const renderSlideContent = () => {
    switch (currentSlideConfig.type) {
      case "cover":
        return <CoverSlide repo={data.repo} year={data.year} />;
      case "commits":
        return <CommitsSlide commits={data.commits} year={data.year} />;
      case "pull-requests":
        return <PullRequestsSlide pullRequests={data.pullRequests} year={data.year} />;
      case "pr-highlights":
        return <PRHighlightsSlide pullRequests={data.pullRequests} year={data.year} />;
      case "reviews":
        return <ReviewsSlide reviews={data.reviews} year={data.year} />;
      case "activity":
        return <ActivitySlide activity={data.activity} year={data.year} />;
      case "contributors":
        return <ContributorsSlide contributors={data.contributors} year={data.year} />;
      case "code-changes":
        return <CodeChangesSlide codeChanges={data.codeChanges} year={data.year} />;
      case "community":
        return (
          <CommunitySlide
            community={data.community}
            issues={data.issues}
            year={data.year}
          />
        );
      case "personality":
        return (
          <PersonalitySlide
            personality={data.personality}
            velocity={data.velocity}
            year={data.year}
          />
        );
      case "augment":
        return <AugmentSlide pullRequests={data.pullRequests} />;
      case "finale":
        return (
          <FinaleSlide
            repo={data.repo}
            commits={data.commits}
            contributors={data.contributors}
            year={data.year}
            isDemo={isDemo}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center dark">
      {/* Desktop background */}
      <div className="absolute inset-0 bg-black/50 hidden md:block" />

      {/* Demo banner */}
      {isDemo && (
        <div className="absolute top-0 left-0 right-0 z-50 bg-secondary/90 backdrop-blur-sm text-secondary-foreground px-4 py-2 text-center text-sm flex items-center justify-center gap-2">
          <Info className="h-4 w-4" />
          <span>
            Viewing demo for <strong>{data.repo.fullName}</strong>. Want to try on your repo?{" "}
            <Link href="/login" className="underline hover:no-underline font-semibold">
              Sign in
            </Link>
          </span>
        </div>
      )}

      {/* Story container */}
      <div
        ref={containerRef}
        className="relative w-full h-full md:w-[400px] md:h-[711px] md:rounded-lg overflow-hidden md:shadow-2xl md:border md:border-border"
        style={{ maxHeight: "100vh" }}
      >
        <ProgressIndicator currentIndex={currentSlideIndex} progress={progress} slides={availableSlides} />

        {/* Controls */}
        <div className="absolute top-4 right-4 z-30 flex items-center gap-2">
          <ShareButton containerRef={containerRef} />
          <button
            onClick={togglePlay}
            className="p-2 rounded bg-muted/50 hover:bg-muted/70 transition-colors"
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <Pause className="h-4 w-4 text-foreground" />
            ) : (
              <Play className="h-4 w-4 text-foreground" />
            )}
          </button>
          <button
            onClick={handleClose}
            className="p-2 rounded bg-muted/50 hover:bg-muted/70 transition-colors"
            aria-label="Close"
          >
            <X className="h-4 w-4 text-foreground" />
          </button>
        </div>

        {/* Slide content */}
        <AnimatePresence mode="wait" custom={direction}>
          <StorySlide
            key={currentSlideIndex}
            gradientClass={currentSlideConfig.gradientClass}
            direction={direction}
          >
            {renderSlideContent()}
          </StorySlide>
        </AnimatePresence>

        {/* Navigation overlay */}
        <NavigationOverlay
          onPrev={prevSlide}
          onNext={nextSlide}
          onPauseStart={handlePauseStart}
          onPauseEnd={handlePauseEnd}
        />
      </div>
    </div>
  );
}
