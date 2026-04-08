"use client";

import useSWR from "swr";
import type { CoPData } from "@/types/cop";

const fetcher = async (url: string) => {
  const res = await fetch(url, { cache: "no-store" });

  if (res.status === 401) throw new Error("SESSION_EXPIRED");
  if (res.status === 403) throw new Error("NO_ACCESS");
  if (!res.ok) throw new Error("FETCH_FAILED");

  return (await res.json()) as CoPData;
};

export function useCopData() {
  const interval = Number(process.env.NEXT_PUBLIC_POLL_INTERVAL) || 30000;
  const swr = useSWR<CoPData>("/api/cop", fetcher, {
    refreshInterval: interval,
    revalidateOnFocus: true,
    dedupingInterval: 10000,
  });

  return {
    data: swr.data,
    isLoading: swr.isLoading,
    isRefreshing: swr.isValidating && !swr.isLoading,
    error: swr.error,
    refresh: swr.mutate,
    errorType: swr.error?.message as
      | "SESSION_EXPIRED"
      | "NO_ACCESS"
      | "FETCH_FAILED"
      | undefined,
  };
}
