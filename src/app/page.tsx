import { HomeContent } from "@/components/layout/home-content";
import { auth } from "@/lib/auth";
import { cookies } from "next/headers";
import { Session } from "next-auth";

const PAT_COOKIE_NAME = "github_pat";

export default async function HomePage() {
  // Check for OAuth session
  const session = await auth();
  
  // Check for PAT cookie
  const cookieStore = await cookies();
  const hasPAT = cookieStore.has(PAT_COOKIE_NAME);
  
  // User is authenticated if they have either OAuth session OR PAT
  const isAuthenticated = !!session || hasPAT;
  
  // Debug logging
  console.log("OAuth session:", !!session);
  console.log("Has PAT cookie:", hasPAT);
  console.log("Is authenticated:", isAuthenticated);

  // Pass a mock session object if authenticated via PAT
  const sessionToPass = session || (hasPAT ? { user: {}, expires: "" } as Session : null);

  return <HomeContent session={sessionToPass} />;
}
