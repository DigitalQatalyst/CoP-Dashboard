"use client";

import { AlertTriangle, ChevronDown, CircleGauge, GitBranch, RefreshCw, TrendingUp, Users } from "lucide-react";
import { useState } from "react";
import { PieChart, Pie, ResponsiveContainer, Cell, FunnelChart, Funnel, Tooltip } from "recharts";
import { AlertBanner } from "@/components/shared/AlertBanner";
import { KpiCard } from "@/components/shared/KpiCard";
import { Tooltip as UITooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useDrillDown } from "@/components/shared/DrillDownContext";
import { getCommandAlerts, getFunnelInsight, getFunnelTotals, getStudioGroups } from "@/lib/dashboard";
import type { CoPSummary, Position } from "@/types/cop";

const VACANCY_GLOSSARY: Record<string, string> = {
  Filled: "All planned headcount is active.",
  "Vacant (Some)": "Some planned headcount is active; at least one seat is unfilled.",
  "Vacant (All)": "No active headcount — all planned seats are empty.",
  Interim: "Role is covered by an interim or temporary resource.",
  Departing: "Current incumbent has a confirmed departure date.",
  TBC: "Vacancy status not yet confirmed.",
};

export function CommandCentre({ positions, summary }: { positions: Position[]; summary: CoPSummary }) {
  const { openDrillDown } = useDrillDown();
  const [alertsOpen, setAlertsOpen] = useState(false);
  const alerts = getCommandAlerts({ positions, summary });
  const funnel = getFunnelTotals(positions);
  const studioGroups = getStudioGroups(positions);

  const kpis: Array<{
    label: string;
    value: string | number;
    subLabel: string;
    icon: typeof Users;
    tone: "neutral" | "success" | "warning" | "danger";
  }> = [
    {
      label: "Positions",
      value: summary.totalPositions,
      subLabel: "Internal roles",
      icon: Users,
      tone: "neutral",
    },
    {
      label: "Plan FYE",
      value: summary.planFYE,
      subLabel: "Headcount target",
      icon: TrendingUp,
      tone: "neutral",
    },
    {
      label: "Actual YTD",
      value: summary.actualYTD,
      subLabel: "Active staff",
      icon: CircleGauge,
      tone:
        summary.actualYTD > summary.planFYE * 0.5
          ? "success"
          : summary.actualYTD > summary.planFYE * 0.2
            ? "warning"
            : "danger",
    },
    {
      label: "Fill Rate",
      value: `${summary.fillRate}%`,
      subLabel: `Gap: ${summary.actualYTD - summary.planFYE}`,
      icon: TrendingUp,
      tone: summary.fillRate > 50 ? "success" : summary.fillRate >= 25 ? "warning" : "danger",
    },
    {
      label: "Active Pipeline",
      value: summary.totalPipeline,
      subLabel: "Across all stages",
      icon: GitBranch,
      tone: summary.totalPipeline >= summary.planFYE ? "success" : "warning",
    },
    {
      label: "No Pipeline",
      value: summary.atRiskCount,
      subLabel: "Vacant, zero TG",
      icon: AlertTriangle,
      tone: summary.atRiskCount > 0 ? "danger" : "success",
    },
  ];

  const funnelData = [
    { value: funnel.tg, name: "Talent Gate", fill: "#0ea5e9", id: "tg" },
    { value: funnel.trial, name: "Trial", fill: "#2563eb", id: "trial" },
    { value: funnel.contract, name: "Contract", fill: "#3730a3", id: "contract" },
    { value: funnel.onboard, name: "Onboard", fill: "#0f766e", id: "onboard" },
    { value: funnel.backlog, name: "Backlogged", fill: "#94a3b8", id: "backlog" },
  ].filter((item) => item.value > 0);

  return (
    <div className="space-y-6 p-6">
      {/* F6: Alerts section clearly separated from KPIs */}
      {alerts.length > 0 && (
        <section className="space-y-3">
          <button
            type="button"
            onClick={() => setAlertsOpen((value) => !value)}
            className="flex w-full items-center justify-between rounded-2xl border border-border bg-card px-4 py-3 text-left shadow-sm hover:bg-muted/50"
          >
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Alerts</p>
              <p className="mt-1 text-sm font-semibold text-foreground">
                {alerts.length} active alert{alerts.length === 1 ? "" : "s"}
              </p>
            </div>
            <ChevronDown className={`h-4 w-4 transition-transform ${alertsOpen ? "rotate-180" : ""}`} />
          </button>
          {alertsOpen && (
            <div className="space-y-3">
              {alerts.map((alert, index) => (
                <AlertBanner key={`${alert.severity}-${index}`} alert={alert} />
              ))}
            </div>
          )}
        </section>
      )}

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
        {kpis.map((kpi) => {
          // F12: Backlogged explanation — surface it on the No Pipeline card
          if (kpi.label === "No Pipeline") {
            return (
              <UITooltip key={kpi.label}>
                <TooltipTrigger asChild>
                  <div className="cursor-help">
                    <KpiCard {...kpi} />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-[220px] text-xs">
                  Positions that are Vacant (All or Some) with zero candidates at any pipeline stage. These are your highest-risk roles.
                </TooltipContent>
              </UITooltip>
            );
          }
          return <KpiCard key={kpi.label} {...kpi} />;
        })}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.3fr_1fr]">
        <div className="rounded-[28px] border border-border bg-card p-5 shadow-sm">
          <div className="mb-4">
            <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Signal</p>
            <h2 className="mt-1 text-lg font-semibold">Pipeline Funnel Summary</h2>
          </div>
          <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <FunnelChart>
                  <Tooltip />
                  <Funnel
                    dataKey="value"
                    data={funnelData}
                    isAnimationActive={false}
                    cursor="pointer"
                    onClick={(entry) => {
                      const item = entry as { id?: string } | undefined;
                      if (item?.id) openDrillDown("stage", item.id);
                    }}
                  >
                    {funnelData.map((entry) => (
                      <Cell key={entry.id} fill={entry.fill} />
                    ))}
                  </Funnel>
                </FunnelChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-3">
              {funnelData.map((stage) => (
                <button
                  key={stage.id}
                  onClick={() => openDrillDown("stage", stage.id)}
                  className="flex w-full items-center justify-between rounded-2xl border border-border px-4 py-3 text-left hover:bg-muted/20"
                >
                  <span className="text-sm font-medium">{stage.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-semibold" style={{ color: stage.fill }}>
                      {stage.value}
                    </span>
                    {stage.id === "backlog" && (
                      <UITooltip>
                        <TooltipTrigger asChild>
                          <span className="inline-flex h-4 w-4 cursor-help items-center justify-center rounded-full bg-amber-100 text-[10px] font-bold text-amber-700">
                            ?
                          </span>
                        </TooltipTrigger>
                        <TooltipContent side="left" className="max-w-[200px] text-xs">
                          Backlogged candidates are in the pipeline but stalled — not progressing through any active stage. Shown in amber to flag attention.
                        </TooltipContent>
                      </UITooltip>
                    )}
                  </div>
                </button>
              ))}
              <p className="rounded-2xl bg-muted/30 px-4 py-3 text-sm leading-6 text-muted-foreground">
                {getFunnelInsight(positions)}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-[28px] border border-border bg-card p-5 shadow-sm">
          <div className="mb-4">
            <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Signal</p>
            <h2 className="mt-1 text-lg font-semibold">Studio Capacity Rings</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-3 xl:grid-cols-1">
            {studioGroups.map((group) => {
              const isEmpty = group.actual === 0;
              // F4: zero-state ring — show a distinct dashed circle instead of empty grey
              const pieData = isEmpty
                ? [{ value: 1, fill: "#e5e7eb" }]
                : [
                    { value: group.actual, fill: group.fillRate > 50 ? "#0f766e" : group.fillRate >= 20 ? "#d97706" : "#dc2626" },
                    { value: Math.max(group.plan - group.actual, 0), fill: "#e5e7eb" },
                  ];

              return (
                <button
                  key={group.studio}
                  onClick={() => openDrillDown("studio", group.studio)}
                  className="rounded-2xl border border-border px-4 py-4 hover:bg-muted/20"
                >
                  <div className="mx-auto h-32 w-32 relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          dataKey="value"
                          innerRadius={34}
                          outerRadius={48}
                          stroke="none"
                          isAnimationActive={false}
                          strokeDasharray={isEmpty ? "4 4" : undefined}
                        >
                          {pieData.map((slice, index) => (
                            <Cell key={index} fill={slice.fill} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
                      <span className="text-sm font-semibold text-foreground">{`${group.actual}/${group.plan}`}</span>
                      {isEmpty ? (
                        <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">0%</span>
                      ) : null}
                    </div>
                  </div>
                  <p className="mt-4 text-center text-xs uppercase tracking-[0.16em] text-muted-foreground">{group.studio}</p>
                </button>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}

export function VacancyBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    Filled: "bg-emerald-50 text-emerald-700 border-emerald-200",
    "Vacant (Some)": "bg-amber-50 text-amber-700 border-amber-200",
    "Vacant (All)": "bg-red-50 text-red-700 border-red-200",
    Interim: "bg-sky-50 text-sky-700 border-sky-200",
    Departing: "bg-sky-50 text-sky-700 border-sky-200",
    TBC: "bg-slate-100 text-slate-600 border-slate-200",
  };

  const tooltip = VACANCY_GLOSSARY[status];

  // F1: tooltip on vacancy badge
  return (
    <UITooltip>
      <TooltipTrigger asChild>
        <span className={`inline-flex cursor-help rounded-full border px-2 py-1 text-[11px] font-medium ${map[status] ?? "bg-slate-100 text-slate-600 border-slate-200"}`}>
          {status}
        </span>
      </TooltipTrigger>
      {tooltip && (
        <TooltipContent side="top" className="max-w-[200px] text-xs">
          {tooltip}
        </TooltipContent>
      )}
    </UITooltip>
  );
}

export function CardStatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    Active: "bg-blue-50 text-blue-700 border-blue-200",
    Paused: "bg-amber-50 text-amber-700 border-amber-200",
    Closed: "bg-slate-100 text-slate-600 border-slate-200",
  };

  return (
    <span className={`inline-flex rounded-full border px-2 py-1 text-[11px] font-medium ${map[status] ?? "bg-slate-100 text-slate-600 border-slate-200"}`}>
      {status}
    </span>
  );
}
