"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight } from "lucide-react";
import { WrappedData } from "@/types/wrapped";

interface RepoSearchProps {
  wrappedData?: WrappedData | null;
}

export function RepoSearch({ wrappedData }: RepoSearchProps) {
  // Prepopulate with demo repo (vercel/swr) for easy first-time use
  const [repoUrl, setRepoUrl] = useState("vercel/swr");
  // Default to previous year since most people want to review a completed year
  const [year, setYear] = useState(new Date().getFullYear() - 1);
  const [error, setError] = useState("");
  const router = useRouter();

  // Load last used repo from localStorage on mount (overrides default)
  useEffect(() => {
    const lastRepo = localStorage.getItem("lastRepoInput");
    if (lastRepo) {
      setRepoUrl(lastRepo);
    }
  }, []);

  // Sync year with wrapped data when available
  useEffect(() => {
    if (wrappedData?.year) {
      setYear(wrappedData.year);
    }
  }, [wrappedData?.year]);

  const parseRepoUrl = (input: string): { owner: string; repo: string } | null => {
    input = input.trim().replace(/\/+$/, "");

    const githubUrlMatch = input.match(
      /(?:https?:\/\/)?(?:www\.)?github\.com\/([^\/]+)\/([^\/]+)/
    );
    if (githubUrlMatch) {
      return { owner: githubUrlMatch[1], repo: githubUrlMatch[2] };
    }

    const shortMatch = input.match(/^([^\/]+)\/([^\/]+)$/);
    if (shortMatch) {
      return { owner: shortMatch[1], repo: shortMatch[2] };
    }

    return null;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!repoUrl.trim()) {
      setError("Please enter a repository");
      return;
    }

    const parsed = parseRepoUrl(repoUrl);
    if (!parsed) {
      setError("Invalid format. Use owner/repo or paste a GitHub URL");
      return;
    }

    // Save to localStorage for next time
    localStorage.setItem("lastRepoInput", repoUrl);

    router.push(`/wrapped/${parsed.owner}/${parsed.repo}?year=${year}`);
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm">
      <div className="flex gap-2">
        <Input
          type="text"
          placeholder="owner/repo or github.com/owner/repo"
          value={repoUrl}
          onChange={(e) => {
            setRepoUrl(e.target.value);
            if (error) setError(""); // Clear error on input
          }}
          className={`h-10 font-mono text-sm bg-card flex-1 ${
            error ? "border-red-500 focus-visible:ring-red-500" : "border-border"
          }`}
        />
        <select
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          className="h-10 px-3 bg-card border border-border text-sm font-mono rounded-md"
        >
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
        <Button
          type="submit"
          variant="secondary"
          className="h-10 px-4 gap-2 shrink-0"
        >
          Generate
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400 mt-2 flex items-center gap-1">
          <span className="text-base">⚠️</span>
          {error}
        </p>
      )}
      {!error && (
        <p className="text-xs text-muted-foreground mt-2">
          Examples: <span className="font-mono">vercel/swr</span> or <span className="font-mono">https://github.com/pmndrs/zustand</span>
        </p>
      )}
    </form>
  );
}
