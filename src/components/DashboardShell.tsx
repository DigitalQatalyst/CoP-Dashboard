"use client";

import Link from "next/link";
import { AlertTriangle, LayoutDashboard, List, GitBranch, BarChart2, RefreshCw, Users } from "lucide-react";
import { CommandCentre } from "@/components/CommandCentre";
import { PositionCatalog } from "@/components/PositionCatalog";
import { PipelineBoard } from "@/components/PipelineBoard";
import { HeadcountPlanner } from "@/components/HeadcountPlanner";
import { ContractorPool } from "@/components/ContractorPool";
import { DrillDownHost } from "@/components/shared/DrillDownHost";
import { DrillDownProvider } from "@/components/shared/DrillDownContext";
import { Skeleton } from "@/components/ui/skeleton";
import { useCopData } from "@/hooks/useCopData";
import { getLastUpdatedState } from "@/lib/dashboard";

export type DashboardTab = "command" | "positions" | "pipeline" | "gaps" | "contractors";

const tabs: {
  key: DashboardTab;
  label: string;
  href: string;
  icon: typeof LayoutDashboard;
}[] = [
  { key: "command", label: "Command", href: "/dashboard", icon: LayoutDashboard },
  { key: "positions", label: "Positions", href: "/dashboard/positions", icon: List },
  { key: "pipeline", label: "Pipeline", href: "/dashboard/pipeline", icon: GitBranch },
  { key: "gaps", label: "Gaps", href: "/dashboard/gaps", icon: BarChart2 },
  { key: "contractors", label: "Contractors", href: "/dashboard/contractors", icon: Users },
];

export function DashboardShell({ activeTab }: { activeTab: DashboardTab }) {
  const { data, isLoading, isRefreshing, errorType, refresh } = useCopData();
  const lastUpdated = data ? getLastUpdatedState(data.summary.lastUpdated) : null;

  return (
    <DrillDownProvider>
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur">
          <div className="flex flex-col gap-4 px-4 py-4 lg:px-6">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-foreground text-sm font-bold text-background">
                  DQ
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-foreground">CoP Dashboard</h1>
                  <p className="text-sm text-muted-foreground">DigitalQatalyst workforce story for FY2026</p>
                </div>
              </div>

              <div className="flex items-center gap-4 self-start lg:self-auto">
                {lastUpdated ? (
                  <div className={`flex items-center gap-2 text-sm ${lastUpdated.isStale ? "text-warning" : "text-muted-foreground"}`}>
                    {lastUpdated.isStale ? <RefreshCw className="h-4 w-4" /> : null}
                    <span>{lastUpdated.label}</span>
                  </div>
                ) : null}
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-sm font-semibold">
                  HR
                </div>
              </div>
            </div>

            <nav className="flex gap-2 overflow-x-auto pb-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;

                return (
                  <Link
                    key={tab.key}
                    href={tab.href}
                    className={`flex shrink-0 items-center gap-2 border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
                      activeTab === tab.key
                        ? "border-foreground text-foreground"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </header>

        {errorType ? (
          <div className="px-6 pt-6">
            <div className="flex items-center justify-between rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-4">
              <div className="flex items-center gap-3 text-destructive">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm font-medium">
                  {errorType === "NO_ACCESS"
                    ? "You don't have access to the CoP file. Contact HR admin."
                    : errorType === "SESSION_EXPIRED"
                      ? "Session expired - please refresh."
                      : "Could not reach the CoP file. Check your connection or OneDrive permissions."}
                </span>
              </div>
              <button onClick={() => void refresh()} className="rounded-xl bg-card px-3 py-2 text-sm font-medium text-foreground">
                Retry
              </button>
            </div>
          </div>
        ) : null}

        {isRefreshing ? (
          <div className="px-6 pt-4 text-right text-xs text-muted-foreground">Refreshing...</div>
        ) : null}

        <main className="pb-10">
          {isLoading || !data ? (
            <DashboardSkeleton />
          ) : activeTab === "command" ? (
            <CommandCentre positions={data.positions} summary={data.summary} />
          ) : activeTab === "positions" ? (
            <PositionCatalog positions={data.positions} />
          ) : activeTab === "pipeline" ? (
            <PipelineBoard positions={data.positions} />
          ) : activeTab === "gaps" ? (
            <HeadcountPlanner positions={data.positions} summary={data.summary} />
          ) : (
            <ContractorPool />
          )}
        </main>

        <DrillDownHost />
      </div>
    </DrillDownProvider>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6 p-6">
      <div className="grid gap-3">
        <Skeleton className="h-16 rounded-2xl" />
        <Skeleton className="h-16 rounded-2xl" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} className="h-32 rounded-2xl" />
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <Skeleton className="h-80 rounded-[28px]" />
        <Skeleton className="h-80 rounded-[28px]" />
      </div>
    </div>
  );
}
