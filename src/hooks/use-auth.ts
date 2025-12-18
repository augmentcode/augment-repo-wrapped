"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";

interface PATUser {
  login: string;
  name: string | null;
  avatar_url: string;
  email: string | null;
}

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: {
    login?: string;
    name?: string | null;
    image?: string | null;
    email?: string | null;
  } | null;
  authMethod: "oauth" | "pat" | null;
}

export function useAuth(): AuthState {
  const { data: session, status } = useSession();
  const [patUser, setPATUser] = useState<PATUser | null>(null);
  const [patLoading, setPATLoading] = useState(true);

  useEffect(() => {
    async function checkPAT() {
      try {
        const response = await fetch("/api/auth/pat");
        const data = await response.json();
        if (data.authenticated && data.user) {
          setPATUser(data.user);
        } else {
          setPATUser(null);
        }
      } catch {
        setPATUser(null);
      } finally {
        setPATLoading(false);
      }
    }

    checkPAT();
  }, []);

  // OAuth session takes priority
  if (session?.user) {
    return {
      isAuthenticated: true,
      isLoading: false,
      user: {
        login: session.user.login,
        name: session.user.name,
        image: session.user.image,
        email: session.user.email,
      },
      authMethod: "oauth",
    };
  }

  // Check PAT authentication
  if (patUser) {
    return {
      isAuthenticated: true,
      isLoading: false,
      user: {
        login: patUser.login,
        name: patUser.name,
        image: patUser.avatar_url,
        email: patUser.email,
      },
      authMethod: "pat",
    };
  }

  // Still loading
  if (status === "loading" || patLoading) {
    return {
      isAuthenticated: false,
      isLoading: true,
      user: null,
      authMethod: null,
    };
  }

  // Not authenticated
  return {
    isAuthenticated: false,
    isLoading: false,
    user: null,
    authMethod: null,
  };
}

export async function signOutPAT() {
  try {
    await fetch("/api/auth/pat", { method: "DELETE" });
    window.location.href = "/";
  } catch (error) {
    console.error("Failed to sign out:", error);
  }
}
