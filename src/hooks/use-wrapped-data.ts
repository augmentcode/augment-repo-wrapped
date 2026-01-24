"use client";

import { useQuery } from "@tanstack/react-query";
import { WrappedData, WrappedError } from "@/types/wrapped";

async function fetchWrappedData(
  owner: string,
  repo: string,
  year: number
): Promise<WrappedData> {
  try {
    const response = await fetch(
      `/api/github/wrapped?owner=${encodeURIComponent(owner)}&repo=${encodeURIComponent(repo)}&year=${year}`
    );

    console.log("API response status:", response.status, response.statusText);

    if (!response.ok) {
      let errorMessage = "Failed to fetch wrapped data";
      try {
        const error: WrappedError = await response.json();
        console.error("API error response:", error);
        errorMessage = error.message || error.error || errorMessage;
      } catch (parseError) {
        console.error("Failed to parse error response:", parseError);
        errorMessage = `API returned ${response.status}: ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log("Wrapped data received:", data);
    return data;
  } catch (error) {
    console.error("Error fetching wrapped data:", error);
    throw error;
  }
}

function getInitialData(owner: string, repo: string, year: number): WrappedData | undefined {
  if (typeof window === "undefined") return undefined;

  try {
    // First, try sessionStorage (most recent, from query cache)
    const cacheKey = `query_cache_${owner}_${repo}_${year}`;
    const sessionCached = sessionStorage.getItem(cacheKey);

    if (sessionCached) {
      const { data, dataUpdatedAt } = JSON.parse(sessionCached);
      const age = Date.now() - dataUpdatedAt;

      // Use session cache if less than 5 minutes old
      if (age < 1000 * 60 * 5) {
        console.log("Using cached data from sessionStorage for instant load");
        return data as WrappedData;
      }
    }

    // Fallback to localStorage
    const cached = localStorage.getItem("lastWrappedData");
    if (!cached) return undefined;

    const data = JSON.parse(cached) as WrappedData;

    // Only use cached data if it matches the requested repo/year
    if (
      data.repo.owner.login === owner &&
      data.repo.name === repo &&
      data.year === year
    ) {
      console.log("Using cached data from localStorage for instant load");
      return data;
    }
  } catch (e) {
    console.error("Failed to parse cached data:", e);
  }

  return undefined;
}

export function useWrappedData(owner: string, repo: string, year?: number) {
  const currentYear = year || new Date().getFullYear();

  const query = useQuery({
    queryKey: ["wrapped", owner, repo, currentYear],
    queryFn: async () => {
      const data = await fetchWrappedData(owner, repo, currentYear);

      // Save to sessionStorage for instant navigation
      const cacheKey = `query_cache_${owner}_${repo}_${currentYear}`;
      sessionStorage.setItem(cacheKey, JSON.stringify({
        data,
        dataUpdatedAt: Date.now(),
      }));

      return data;
    },
    initialData: () => getInitialData(owner, repo, currentYear),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
    retry: 1,
    enabled: !!owner && !!repo,
  });

  return query;
}
