"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Github, Key, Loader2, ExternalLink } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [showPATForm, setShowPATForm] = useState(false);
  const [token, setToken] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePATSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/pat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: token.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to authenticate");
        return;
      }

      // Redirect to home page on success
      router.push("/");
      router.refresh();
    } catch {
      setError("Failed to connect. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-start justify-center bg-background pt-24 sm:pt-32">
      <div className="w-full max-w-xs px-6">
        <div className="text-center mb-10">
          <div className="flex justify-center mb-6">
            <div className="flex h-10 w-10 items-center justify-center bg-secondary">
              <span className="text-base font-medium text-secondary-foreground">R</span>
            </div>
          </div>
          <h1 className="text-xl font-medium mb-1">Repo Wrapped</h1>
          <p className="eyebrow text-muted-foreground">by Augment Code</p>
        </div>

        <div className="space-y-4">
          {!showPATForm ? (
            <>
              <Button
                onClick={() => signIn("github", { callbackUrl: "/" })}
                variant="secondary"
                className="w-full h-11 gap-2"
              >
                <Github className="h-4 w-4" />
                Continue with GitHub
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-background px-2 text-muted-foreground">or</span>
                </div>
              </div>

              <Button
                onClick={() => setShowPATForm(true)}
                variant="outline"
                className="w-full h-11 gap-2"
              >
                <Key className="h-4 w-4" />
                Use Personal Access Token
              </Button>
            </>
          ) : (
            <form onSubmit={handlePATSubmit} className="space-y-4">
              <div>
                <label htmlFor="token" className="eyebrow text-muted-foreground block mb-2">
                  Personal Access Token
                </label>
                <Input
                  id="token"
                  type="password"
                  placeholder="ghp_xxxxxxxxxxxx"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  disabled={isLoading}
                  className="h-11 font-mono text-sm"
                />
              </div>

              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}

              <Button
                type="submit"
                variant="secondary"
                className="w-full h-11 gap-2"
                disabled={!token.trim() || isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Key className="h-4 w-4" />
                )}
                {isLoading ? "Validating..." : "Connect"}
              </Button>

              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setShowPATForm(false);
                  setToken("");
                  setError(null);
                }}
                className="w-full"
                disabled={isLoading}
              >
                Back to OAuth
              </Button>

              <div className="pt-2 border-t border-border">
                <a
                  href="https://github.com/settings/tokens/new?description=Repo%20Wrapped&scopes=repo,read:user"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ExternalLink className="h-3 w-3" />
                  Create a token with repo scope
                </a>
              </div>
            </form>
          )}

          <p className="text-xs text-center text-muted-foreground pt-2">
            {showPATForm
              ? "Your token is stored locally and never sent to our servers."
              : "Sign in to generate your repository's year in review. We only read repository data."}
          </p>
        </div>

        <div className="mt-10 pt-6 border-t border-border">
          <h2 className="eyebrow text-muted-foreground mb-4">What you get</h2>
          <ul className="space-y-2.5 text-sm text-muted-foreground">
            <li className="flex items-center gap-3">
              <span className="w-1 h-1 bg-secondary" />
              Commit statistics and activity
            </li>
            <li className="flex items-center gap-3">
              <span className="w-1 h-1 bg-secondary" />
              Pull request metrics
            </li>
            <li className="flex items-center gap-3">
              <span className="w-1 h-1 bg-secondary" />
              Contributor leaderboard
            </li>
            <li className="flex items-center gap-3">
              <span className="w-1 h-1 bg-secondary" />
              Shareable story slides
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
