"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  Briefcase,
  Database,
  GitBranch,
  HardHat,
  LayoutDashboard,
  RefreshCw,
  TrendingDown,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { CommandCentre } from "@/components/CommandCentre";
import { PositionCatalog } from "@/components/PositionCatalog";
import { PipelineBoard } from "@/components/PipelineBoard";
import { HeadcountPlanner } from "@/components/HeadcountPlanner";
import { ContractorPool } from "@/components/ContractorPool";
import { DrillDownHost } from "@/components/shared/DrillDownHost";
import { DrillDownProvider } from "@/components/shared/DrillDownContext";
import { GlobalSearch } from "@/components/shared/GlobalSearch";
import { Skeleton } from "@/components/ui/skeleton";
import { useCopData } from "@/hooks/useCopData";
import { getLastUpdatedState } from "@/lib/dashboard";
import { ImportDialog } from "@/components/ImportDialog";
import { ThemeToggle } from "@/components/theme-toggle";

export type DashboardTab = "command" | "positions" | "pipeline" | "gaps" | "contractors";

const NAV_COLLAPSED_KEY = "position-navigator:nav-collapsed";

const tabs: {
  key: DashboardTab;
  label: string;
  href: string;
  icon: typeof LayoutDashboard;
}[] = [
  { key: "command", label: "Command", href: "/dashboard", icon: LayoutDashboard },
  { key: "positions", label: "Positions", href: "/dashboard/positions", icon: Briefcase },
  { key: "pipeline", label: "Pipeline", href: "/dashboard/pipeline", icon: GitBranch },
  { key: "gaps", label: "Gaps", href: "/dashboard/gaps", icon: TrendingDown },
  { key: "contractors", label: "Contractors", href: "/dashboard/contractors", icon: HardHat },
];

export function DashboardShell({ activeTab }: { activeTab: DashboardTab }) {
  const { data, isLoading, isRefreshing, errorType, refresh, lastFetchedAt } = useCopData();
  // G1: use actual fetch timestamp; fall back to data.summary.lastUpdated if not yet captured
  const lastUpdated = lastFetchedAt
    ? getLastUpdatedState(lastFetchedAt)
    : data
      ? getLastUpdatedState(data.summary.lastUpdated)
      : null;
  // E4: initialise from localStorage after mount to avoid SSR mismatch
  const [navCollapsed, setNavCollapsed] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(NAV_COLLAPSED_KEY);
      if (stored !== null) setNavCollapsed(stored === "true");
    } catch { /* noop */ }
  }, []);

  function toggleNav() {
    setNavCollapsed((value) => {
      const next = !value;
      try { localStorage.setItem(NAV_COLLAPSED_KEY, String(next)); } catch { /* noop */ }
      return next;
    });
  }

  return (
    <DrillDownProvider>
      <TooltipProvider delayDuration={0}>
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

                {data && (
                  <div className="hidden flex-1 lg:flex lg:max-w-xs">
                    <GlobalSearch positions={data.positions} />
                  </div>
                )}

                <div className="flex items-center gap-4 self-start lg:self-auto">
                  {lastUpdated ? (
                    <div className={`flex items-center gap-2 text-sm ${lastUpdated.isStale ? "text-warning" : "text-muted-foreground"}`}>
                      {isRefreshing ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : lastUpdated.isStale ? (
                        <RefreshCw className="h-4 w-4" />
                      ) : null}
                      <span>{lastUpdated.label}</span>
                    </div>
                  ) : null}
                  <ImportDialog onImport={(positions) => console.log("Imported positions:", positions)} />
                  <ThemeToggle />
                  <Popover>
                    <PopoverTrigger asChild>
                      <button className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-border bg-card text-sm font-semibold hover:bg-accent">
                        HR
                      </button>
                    </PopoverTrigger>
                    <PopoverContent align="end" className="w-64 space-y-3 p-4">
                      <div>
                        <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Signed in as</p>
                        <p className="mt-1 text-sm font-semibold">HR Admin</p>
                        <p className="text-xs text-muted-foreground">DigitalQatalyst · FY2026</p>
                      </div>
                      <div className="border-t border-border pt-3">
                        <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Data source</p>
                        <div className="mt-1.5 flex items-center gap-2 text-sm">
                          <Database className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="font-medium">
                            {process.env.NEXT_PUBLIC_USE_MOCK_DATA === "false" ? "Live Excel (Graph API)" : "Mock data"}
                          </span>
                        </div>
                      </div>
                      <div className="border-t border-border pt-3">
                        <button
                          onClick={() => void refresh()}
                          className="flex w-full items-center gap-2 rounded-xl bg-muted px-3 py-2 text-sm font-medium hover:bg-accent"
                        >
                          <RefreshCw className="h-3.5 w-3.5" />
                          Refresh data
                        </button>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <nav className="flex gap-2 overflow-x-auto pb-1 lg:hidden">
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

          <div className="lg:flex lg:items-start">
            <aside
              className={`hidden shrink-0 border-r border-border/70 bg-card/90 p-4 transition-all duration-200 lg:flex lg:flex-col lg:gap-4 lg:sticky lg:top-[73px] lg:self-start lg:h-[calc(100vh-73px)] ${
                navCollapsed ? "lg:w-20" : "lg:w-64"
              }`}
            >
              {/* Sidebar header: DQ logo + always-visible collapse/expand toggle */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`shrink-0 flex items-center justify-center rounded-2xl bg-foreground font-bold text-background transition-all duration-200 ${
                      navCollapsed ? "h-7 w-7 text-[10px]" : "h-10 w-10 text-sm"
                    }`}
                  >
                    DQ
                  </div>
                  {!navCollapsed && (
                    <p className="truncate text-xs uppercase tracking-[0.24em] text-muted-foreground">Sections</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={toggleNav}
                  className="shrink-0 inline-flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition hover:bg-accent hover:text-foreground"
                  aria-label={navCollapsed ? "Expand navigation" : "Collapse navigation"}
                >
                  {navCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                </button>
              </div>

              <nav className="flex-1 space-y-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.key;
                  const linkClass = `flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-foreground text-background"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  } ${navCollapsed ? "justify-center" : ""}`;

                  if (navCollapsed) {
                    return (
                      <Tooltip key={tab.key}>
                        <TooltipTrigger asChild>
                          <Link href={tab.href} className={linkClass}>
                            <Icon className="h-5 w-5 shrink-0" />
                          </Link>
                        </TooltipTrigger>
                        <TooltipContent side="right" sideOffset={8}>{tab.label}</TooltipContent>
                      </Tooltip>
                    );
                  }

                  return (
                    <Link key={tab.key} href={tab.href} className={linkClass}>
                      <Icon className="h-4 w-4 shrink-0" />
                      {tab.label}
                    </Link>
                  );
                })}
              </nav>

            </aside>

            <div className="flex-1 min-w-0 bg-background">
              {errorType ? (
                <div className="px-4 pt-6 sm:px-6 lg:px-8">
                  <div className="flex flex-col gap-4 rounded-2xl border border-destructive/20 bg-destructive/10 p-4 sm:flex-row sm:items-center sm:justify-between">
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
                <div className="px-4 pt-4 text-right text-xs text-muted-foreground sm:px-6 lg:px-8">Refreshing...</div>
              ) : null}

              <main className="pb-10 px-4 sm:px-6 lg:px-8">
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
            </div>
          </div>

          <DrillDownHost />
        </div>
      </TooltipProvider>
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
