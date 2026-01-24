"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, useEffect } from "react";

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5, // 5 minutes - data is fresh for 5 minutes
            gcTime: 1000 * 60 * 30, // 30 minutes - keep in cache for 30 minutes
            retry: 2,
            refetchOnWindowFocus: false,
            refetchOnMount: false, // Don't refetch if data is fresh
            refetchOnReconnect: false,
          },
        },
      })
  );

  // Persist query cache to sessionStorage for instant page navigation
  useEffect(() => {
    const handleBeforeUnload = () => {
      const cache = queryClient.getQueryCache();
      const queries = cache.getAll();

      // Save wrapped queries to sessionStorage
      queries.forEach((query) => {
        if (query.queryKey[0] === "wrapped" && query.state.data) {
          const [, owner, repo, year] = query.queryKey as [string, string, string, number];
          const cacheKey = `query_cache_${owner}_${repo}_${year}`;
          sessionStorage.setItem(cacheKey, JSON.stringify({
            data: query.state.data,
            dataUpdatedAt: query.state.dataUpdatedAt,
          }));
        }
      });
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [queryClient]);

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
