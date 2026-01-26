import { HomeContent } from "@/components/layout/home-content";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  return <HomeContent session={session} />;
}
