import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

const PAT_COOKIE_NAME = "github_pat";

export default auth((req) => {
  // Check for OAuth session OR PAT cookie
  const hasOAuthSession = !!req.auth;
  const hasPATCookie = req.cookies.has(PAT_COOKIE_NAME);
  const isLoggedIn = hasOAuthSession || hasPATCookie;

  const isOnWrapped = req.nextUrl.pathname.startsWith("/wrapped");
  const isOnLogin = req.nextUrl.pathname === "/login";
  const isOnApi = req.nextUrl.pathname.startsWith("/api");

  // Protect wrapped routes - require authentication
  if (isOnWrapped && !isLoggedIn) {
    return Response.redirect(new URL("/login", req.url));
  }

  // Redirect to home if already logged in and on login page
  if (isOnLogin && isLoggedIn) {
    return Response.redirect(new URL("/", req.url));
  }

  return;
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
