import { HomeContent } from "@/components/layout/home-content";
import { auth } from "@/lib/auth";

export default async function HomePage() {
  const session = await auth();
  
  // Debug: Log session on server
  console.log("Server-side session:", session);

  return <HomeContent session={session} />;
}
