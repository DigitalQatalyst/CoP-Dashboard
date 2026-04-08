"use client";

import useSWR from "swr";
import type { ContractorData } from "@/types/cop";

const fetcher = async (url: string) => {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error("FETCH_FAILED");
  return (await res.json()) as ContractorData;
};

export function useContractors() {
  const interval = Number(process.env.NEXT_PUBLIC_POLL_INTERVAL) || 30000;
  const swr = useSWR<ContractorData>("/api/contractors", fetcher, {
    refreshInterval: interval,
    revalidateOnFocus: true,
  });

  return {
    data: swr.data,
    isLoading: swr.isLoading,
    isRefreshing: swr.isValidating && !swr.isLoading,
    error: swr.error,
    refresh: swr.mutate,
  };
}
