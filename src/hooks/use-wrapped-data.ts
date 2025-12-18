"use client";

import { useQuery } from "@tanstack/react-query";
import { WrappedData, WrappedError } from "@/types/wrapped";

async function fetchWrappedData(
  owner: string,
  repo: string,
  year: number
): Promise<WrappedData> {
  const response = await fetch(
    `/api/github/wrapped?owner=${encodeURIComponent(owner)}&repo=${encodeURIComponent(repo)}&year=${year}`
  );

  if (!response.ok) {
    const error: WrappedError = await response.json();
    throw new Error(error.message || "Failed to fetch wrapped data");
  }

  return response.json();
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
