"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useGitHubAuth } from "@/lib/hooks/useGitHubAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Github, Lock, Shield } from "lucide-react";

export default function AuthForm() {
  const [showTokenInput, setShowTokenInput] = useState(false);
  const [token, setToken] = useState("");
  const { authenticate, loading, error } = useGitHubAuth();

  const handleOAuthSignIn = () => {
    signIn("github", { callbackUrl: "/" });
  };

  const handlePATSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await authenticate(token);
      window.location.href = "/";
    } catch (err) {
      // Error is handled by hook
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background to-muted">
      <div className="w-full max-w-5xl grid md:grid-cols-2 gap-8 items-center">
        {/* Marketing Section */}
        <div className="space-y-6 text-center md:text-left">
          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              Repo Wrapped
            </h1>
            <p className="text-xl text-muted-foreground">
              Your GitHub Year in Review
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Shield className="w-6 h-6 text-secondary mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold">Privacy First</h3>
                <p className="text-sm text-muted-foreground">
                  100% client-side processing. No data stored on our servers.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Github className="w-6 h-6 text-secondary mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold">GitHub Integration</h3>
                <p className="text-sm text-muted-foreground">
                  Analyze commits, PRs, contributors, and more from any
                  repository.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Lock className="w-6 h-6 text-secondary mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold">Secure Authentication</h3>
                <p className="text-sm text-muted-foreground">
                  OAuth or Personal Access Token - you choose what works best.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Auth Card */}
        <div className="bg-card border border-border rounded-lg p-8 shadow-lg">
          <div className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">Sign in to GitHub</h2>
              <p className="text-sm text-muted-foreground">
                Authenticate to access your repository analytics
              </p>
            </div>

            {!showTokenInput ? (
              <div className="space-y-4">
                <Button
                  onClick={handleOAuthSignIn}
                  className="w-full"
                  size="lg"
                >
                  <Github className="w-5 h-5 mr-2" />
                  Sign in with GitHub
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">
                      or
                    </span>
                  </div>
                </div>

                <Button
                  onClick={() => setShowTokenInput(true)}
                  variant="outline"
                  className="w-full"
                >
                  Use Personal Access Token
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  We only request <code className="text-xs">repo</code> and{" "}
                  <code className="text-xs">read:org</code> scopes
                </p>
              </div>
            ) : (
              <form onSubmit={handlePATSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label
                    htmlFor="token"
                    className="text-sm font-medium leading-none"
                  >
                    Personal Access Token
                  </label>
                  <Input
                    id="token"
                    type="password"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    placeholder="ghp_xxxxxxxxxxxx"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Create a token at{" "}
                    <a
                      href="https://github.com/settings/tokens/new?scopes=repo,read:org"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-secondary hover:underline"
                    >
                      github.com/settings/tokens
                    </a>{" "}
                    with <code className="text-xs">repo</code> and{" "}
                    <code className="text-xs">read:org</code> scopes
                  </p>
                </div>

                {error && (
                  <div className="bg-destructive/10 text-destructive p-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? "Validating..." : "Continue"}
                </Button>

                <Button
                  type="button"
                  onClick={() => setShowTokenInput(false)}
                  variant="ghost"
                  className="w-full"
                >
                  ← Back
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

