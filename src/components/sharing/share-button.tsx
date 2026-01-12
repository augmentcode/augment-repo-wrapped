"use client";

import { useState, RefObject } from "react";
import { toPng } from "html-to-image";
import { Download } from "lucide-react";

interface ShareButtonProps {
  containerRef: RefObject<HTMLDivElement | null>;
}

export function ShareButton({ containerRef }: ShareButtonProps) {
  const [downloading, setDownloading] = useState(false);

  const generateImage = async (): Promise<Blob | null> => {
    if (!containerRef.current) return null;

    try {
      // Wait for any animations to complete
      await new Promise(resolve => setTimeout(resolve, 300));

      // First attempt with high quality
      const dataUrl = await toPng(containerRef.current, {
        quality: 1,
        pixelRatio: 3, // Increased from 2 to 3 for sharper images
        cacheBust: true, // Prevent caching issues
        filter: (node) => {
          // Filter out the controls and overlay
          if (node instanceof Element) {
            // Remove share button, progress indicator, and navigation overlays
            if (
              node.classList.contains("z-30") ||
              node.classList.contains("z-40") ||
              node.classList.contains("z-50") ||
              node.classList.contains("z-10")
            ) {
              return false;
            }
          }
          return true;
        },
      });

      const response = await fetch(dataUrl);
      return await response.blob();
    } catch (error) {
      console.error("Failed to generate image:", error);
      return null;
    }
  };

  const handleDownload = async () => {
    setDownloading(true);

    try {
      const blob = await generateImage();
      if (!blob) {
        throw new Error("Failed to generate image");
      }

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "repo-wrapped.png";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to download:", err);
      alert("Failed to download image. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={downloading}
      className="p-2 rounded-full bg-black/30 hover:bg-black/50 transition-colors disabled:opacity-50"
      aria-label="Download PNG"
      title="Download PNG"
    >
      <Download className={`h-4 w-4 text-white ${downloading ? 'animate-pulse' : ''}`} />
    </button>
  );
}
