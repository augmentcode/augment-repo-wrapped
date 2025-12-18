import { auth } from "@/lib/auth";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
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
