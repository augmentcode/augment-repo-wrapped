import { create } from "zustand";
import { TOTAL_SLIDES } from "@/types/slides";

interface WrappedStore {
  // Navigation state
  currentSlideIndex: number;
  isPlaying: boolean;
  direction: "forward" | "backward";
  isPaused: boolean;

  // Actions
  nextSlide: () => void;
  prevSlide: () => void;
  goToSlide: (index: number) => void;
  togglePlay: () => void;
  pause: () => void;
  resume: () => void;
  reset: () => void;

  // Share state
  isShareModalOpen: boolean;
  openShareModal: () => void;
  closeShareModal: () => void;
}

export const useWrappedStore = create<WrappedStore>((set, get) => ({
  currentSlideIndex: 0,
  isPlaying: true,
  direction: "forward",
  isPaused: false,

  nextSlide: () => {
    const { currentSlideIndex } = get();
    if (currentSlideIndex < TOTAL_SLIDES - 1) {
      set({
        currentSlideIndex: currentSlideIndex + 1,
        direction: "forward",
      });
    }
  },

  prevSlide: () => {
    const { currentSlideIndex } = get();
    if (currentSlideIndex > 0) {
      set({
        currentSlideIndex: currentSlideIndex - 1,
        direction: "backward",
      });
    }
  },

  goToSlide: (index: number) => {
    const { currentSlideIndex } = get();
    if (index >= 0 && index < TOTAL_SLIDES) {
      set({
        currentSlideIndex: index,
        direction: index > currentSlideIndex ? "forward" : "backward",
      });
    }
  },

  togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),

  pause: () => set({ isPaused: true }),

  resume: () => set({ isPaused: false }),

  reset: () =>
    set({
      currentSlideIndex: 0,
      isPlaying: true,
      direction: "forward",
      isPaused: false,
    }),

  isShareModalOpen: false,
  openShareModal: () => set({ isShareModalOpen: true, isPlaying: false }),
  closeShareModal: () => set({ isShareModalOpen: false }),
}));
