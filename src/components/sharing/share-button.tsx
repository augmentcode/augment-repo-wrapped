"use client";

import { useState, RefObject } from "react";
import { toPng } from "html-to-image";
import { Share2, Copy, Download, Check } from "lucide-react";

interface ShareButtonProps {
  containerRef: RefObject<HTMLDivElement | null>;
}

export function ShareButton({ containerRef }: ShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copying, setCopying] = useState(false);
  const [copied, setCopied] = useState(false);

  const generateImage = async (): Promise<Blob | null> => {
    if (!containerRef.current) return null;

    try {
      const dataUrl = await toPng(containerRef.current, {
        quality: 1,
        pixelRatio: 2,
        filter: (node) => {
          // Filter out the controls and overlay
          if (node instanceof Element) {
            if (
              node.classList.contains("z-30") ||
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

  const handleCopyToClipboard = async () => {
    setCopying(true);
    try {
      const blob = await generateImage();
      if (blob) {
        await navigator.clipboard.write([
          new ClipboardItem({ "image/png": blob }),
        ]);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
      // Fallback: try to download instead
      handleDownload();
    } finally {
      setCopying(false);
    }
  };

  const handleDownload = async () => {
    setCopying(true);
    try {
      const blob = await generateImage();
      if (blob) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "repo-wrapped.png";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error("Failed to download:", error);
    } finally {
      setCopying(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-full bg-black/30 hover:bg-black/50 transition-colors"
        aria-label="Share"
      >
        <Share2 className="h-4 w-4 text-white" />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Menu */}
          <div className="absolute right-0 top-full mt-2 bg-white rounded-lg shadow-lg overflow-hidden z-50 min-w-[160px]">
            <button
              onClick={handleCopyToClipboard}
              disabled={copying}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
              {copied ? "Copied!" : "Copy to clipboard"}
            </button>
            <button
              onClick={handleDownload}
              disabled={copying}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
              <Download className="h-4 w-4" />
              Download PNG
            </button>
          </div>
        </>
      )}
    </div>
  );
}
