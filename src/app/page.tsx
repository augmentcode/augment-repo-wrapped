import { HomeContent } from "@/components/layout/home-content";
import { auth } from "@/lib/auth";

export default async function HomePage() {
  const session = await auth();

  return <HomeContent session={session} />;
}
