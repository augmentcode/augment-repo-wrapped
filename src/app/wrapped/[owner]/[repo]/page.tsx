"use client";

import { useWrappedData } from "@/hooks/use-wrapped-data";
import { StoriesViewer } from "@/components/stories/stories-viewer";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { AlertCircle, ArrowLeft, RefreshCw } from "lucide-react";
import Link from "next/link";
import { use, useEffect } from "react";
import { useSearchParams } from "next/navigation";

interface WrappedPageProps {
  params: Promise<{
    owner: string;
    repo: string;
  }>;
}

export default function WrappedPage({ params }: WrappedPageProps) {
  const resolvedParams = use(params);
  const { owner, repo } = resolvedParams;
  const searchParams = useSearchParams();
  const year = Number(searchParams.get("year")) || new Date().getFullYear();
  const slideIndex = Number(searchParams.get("slide")) || 0;

  const { data, isLoading, error, refetch } = useWrappedData(owner, repo, year);

  // Save wrapped data to localStorage when it's loaded
  useEffect(() => {
    if (data) {
      localStorage.setItem("lastWrappedData", JSON.stringify(data));
      // Dispatch custom event to notify home page
      window.dispatchEvent(new Event("wrappedDataUpdated"));
    }
  }, [data]);

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black flex flex-col items-center justify-start pt-32 sm:pt-40 text-white">
        <Spinner size="lg" className="mb-6" />
        <h2 className="text-xl font-semibold mb-3">Generating your insights...</h2>
        <p className="text-sm text-white/70">
          Fetching data for {owner}/{repo}
        </p>
        <p className="text-xs text-white/50 mt-4">This may take a moment</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black flex flex-col items-center justify-start pt-24 sm:pt-32 text-white p-8">
        <AlertCircle className="h-16 w-16 text-red-400 mb-6" />
        <h2 className="text-2xl font-bold mb-3">Unable to generate insights</h2>
        <p className="text-center text-white/70 mb-8 max-w-md">
          {error.message}
        </p>
        <div className="flex gap-3">
          <Link href="/">
            <Button variant="outline" className="gap-2 bg-white/10 text-white border-white/20 hover:bg-white/20 hover:text-white">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
          </Link>
          <Button onClick={() => refetch()} className="gap-2 bg-secondary text-secondary-foreground hover:bg-secondary/90">
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="fixed inset-0 bg-black flex flex-col items-center justify-start pt-32 sm:pt-40 text-white">
        <p className="text-lg mb-6">No data available</p>
        <Link href="/">
          <Button variant="outline" className="bg-white/10 text-white border-white/20 hover:bg-white/20 hover:text-white">
            Back to Home
          </Button>
        </Link>
      </div>
    );
  }

  return <StoriesViewer data={data} initialSlideIndex={slideIndex} />;
}
