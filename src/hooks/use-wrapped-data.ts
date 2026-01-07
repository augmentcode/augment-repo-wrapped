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

export function useWrappedData(owner: string, repo: string, year?: number) {
  const currentYear = year || new Date().getFullYear();

  return useQuery({
    queryKey: ["wrapped", owner, repo, currentYear],
    queryFn: () => fetchWrappedData(owner, repo, currentYear),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
    retry: 1,
    enabled: !!owner && !!repo,
  });
}
