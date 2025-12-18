"use client";

import { signOut } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useAuth, signOutPAT } from "@/hooks/use-auth";
import { Github, LogOut, Key } from "lucide-react";

export function Header() {
  const { isAuthenticated, user, authMethod } = useAuth();

  const handleSignOut = () => {
    if (authMethod === "pat") {
      signOutPAT();
    } else {
      signOut({ callbackUrl: "/" });
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur-sm">
      <div className="container flex h-14 items-center justify-between px-6 mx-auto max-w-4xl">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center bg-secondary">
            <span className="text-[10px] font-medium text-secondary-foreground">R</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-medium text-sm">Repo Wrapped</span>
            <span className="text-[10px] text-muted-foreground hidden sm:inline">by Augment</span>
          </div>
        </Link>

        <div className="flex items-center gap-1">
          <ThemeToggle />

          {isAuthenticated && user ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-2">
                {user.image && (
                  <Avatar
                    src={user.image}
                    alt={user.name || "User"}
                    size="sm"
                  />
                )}
                <span className="text-sm hidden sm:inline">
                  {user.login || user.name}
                </span>
                {authMethod === "pat" && (
                  <span title="Using Personal Access Token">
                    <Key className="h-3 w-3 text-muted-foreground" />
                  </span>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSignOut}
                className="text-muted-foreground hover:text-foreground"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Link href="/login">
              <Button variant="secondary" size="sm" className="gap-2">
                <Github className="h-4 w-4" />
                Sign in
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
