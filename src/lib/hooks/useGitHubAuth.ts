"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { GitHubAPI } from "@/lib/github-api";

interface User {
  login: string;
  name: string | null;
  avatar_url?: string;
}

export function useGitHubAuth() {
  const { data: session, status } = useSession();
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check for OAuth session or localStorage PAT
  useEffect(() => {
    if (session?.accessToken) {
      // OAuth token from NextAuth
      setToken(session.accessToken as string);
      setUser({
        login: session.user?.login || session.user?.email?.split("@")[0] || "",
        name: session.user?.name || null,
        avatar_url: session.user?.image || undefined,
      });
    } else {
      // Check for PAT in localStorage
      const storedToken = localStorage.getItem("github_token");
      if (storedToken) {
        validatePAT(storedToken);
      }
    }
  }, [session]);

  const validatePAT = async (pat: string) => {
    try {
      setLoading(true);
      const response = await fetch("/api/github/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: pat }),
      });

      const data = await response.json();

      if (data.valid) {
        setToken(pat);
        setUser(data.user);
      } else {
        localStorage.removeItem("github_token");
        setError(data.error);
      }
    } catch (err) {
      setError("Failed to validate token");
      localStorage.removeItem("github_token");
    } finally {
      setLoading(false);
    }
  };

  const authenticate = async (newToken: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/github/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: newToken }),
      });

      const data = await response.json();

      if (!data.valid) {
        throw new Error(data.error || "Invalid token");
      }

      setToken(newToken);
      setUser(data.user);
      localStorage.setItem("github_token", newToken);

      return { user: data.user };
    } catch (err) {
      setError((err as Error).message || "Authentication failed");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    localStorage.removeItem("github_token");
    localStorage.removeItem("cached_prs");
    setToken(null);
    setUser(null);

    // If using OAuth, sign out from NextAuth
    if (session) {
      await signOut({ redirect: false });
    }
  };

  return {
    user,
    token,
    isAuthenticated: !!token && !!user,
    loading: loading || status === "loading",
    error,
    authenticate,
    logout,
  };
}

