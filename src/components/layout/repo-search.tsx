"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight } from "lucide-react";

export function RepoSearch() {
  const [repoUrl, setRepoUrl] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

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

    const parsed = parseRepoUrl(repoUrl);
    if (!parsed) {
      setError("Enter a valid repository (e.g., owner/repo)");
      return;
    }

    router.push(`/wrapped/${parsed.owner}/${parsed.repo}`);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm">
      <div className="flex gap-2">
        <Input
          type="text"
          placeholder="owner/repo"
          value={repoUrl}
          onChange={(e) => setRepoUrl(e.target.value)}
          className="h-10 font-mono text-sm bg-card border-border"
        />
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
        <p className="mt-2 text-sm text-destructive">{error}</p>
      )}
    </form>
  );
}
