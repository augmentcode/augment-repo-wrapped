import { cookies } from "next/headers";
import { auth } from "./auth";

const PAT_COOKIE_NAME = "github_pat";

export async function getAccessToken(): Promise<string | null> {
  // First, try to get the token from NextAuth session (OAuth)
  const session = await auth();
  if (session?.accessToken) {
    return session.accessToken;
  }

  // Fall back to PAT cookie
  const cookieStore = await cookies();
  const patToken = cookieStore.get(PAT_COOKIE_NAME)?.value;

  return patToken || null;
}
