"use client";

import { useWrappedData } from "@/hooks/use-wrapped-data";
import { StoriesViewer } from "@/components/stories/stories-viewer";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { AlertCircle, ArrowLeft, RefreshCw } from "lucide-react";
import Link from "next/link";
import { use } from "react";

interface WrappedPageProps {
  params: Promise<{
    owner: string;
    repo: string;
  }>;
}

export default function WrappedPage({ params }: WrappedPageProps) {
  const resolvedParams = use(params);
  const { owner, repo } = resolvedParams;
  const currentYear = new Date().getFullYear();

  const { data, isLoading, error, refetch } = useWrappedData(owner, repo, currentYear);

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black flex flex-col items-center justify-center text-white">
        <Spinner size="lg" className="mb-4" />
        <h2 className="text-xl font-semibold mb-2">Generating your Wrapped...</h2>
        <p className="text-sm text-white/60">
          Fetching data for {owner}/{repo}
        </p>
        <p className="text-xs text-white/40 mt-4">This may take a moment</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black flex flex-col items-center justify-center text-white p-8">
        <AlertCircle className="h-16 w-16 text-red-400 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Unable to generate Wrapped</h2>
        <p className="text-center text-white/60 mb-6 max-w-md">
          {error.message}
        </p>
        <div className="flex gap-3">
          <Link href="/">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
          </Link>
          <Button onClick={() => refetch()} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="fixed inset-0 bg-black flex flex-col items-center justify-center text-white">
        <p>No data available</p>
        <Link href="/" className="mt-4">
          <Button variant="outline">Back to Home</Button>
        </Link>
      </div>
    );
  }

  return <StoriesViewer data={data} />;
}
