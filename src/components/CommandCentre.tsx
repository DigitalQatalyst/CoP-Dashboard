"use client";

import { AlertTriangle, CircleGauge, GitBranch, RefreshCw, TrendingUp, Users } from "lucide-react";
import { PieChart, Pie, ResponsiveContainer, Cell, FunnelChart, Funnel, Tooltip } from "recharts";
import { AlertBanner } from "@/components/shared/AlertBanner";
import { KpiCard } from "@/components/shared/KpiCard";
import { useDrillDown } from "@/components/shared/DrillDownContext";
import { getCommandAlerts, getFunnelInsight, getFunnelTotals, getStudioGroups } from "@/lib/dashboard";
import type { CoPSummary, Position } from "@/types/cop";

export function CommandCentre({ positions, summary }: { positions: Position[]; summary: CoPSummary }) {
  const { openDrillDown } = useDrillDown();
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
  ].filter((item) => item.value > 0);

  return (
    <div className="space-y-6 p-6">
      <section className="space-y-3">
        {alerts.map((alert, index) => (
          <AlertBanner key={`${alert.severity}-${index}`} alert={alert} />
        ))}
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
        {kpis.map((kpi) => (
          <KpiCard key={kpi.label} {...kpi} />
        ))}
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
                    onClick={(event) => {
                      const payload = event?.payload as { id?: string } | undefined;
                      if (payload?.id) openDrillDown("stage", payload.id);
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
                  <span className="text-lg font-semibold" style={{ color: stage.fill }}>
                    {stage.value}
                  </span>
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
              const pieData = [
                { value: group.actual, fill: group.fillRate > 50 ? "#0f766e" : group.fillRate >= 20 ? "#d97706" : "#dc2626" },
                { value: Math.max(group.plan - group.actual, 0), fill: "#e5e7eb" },
              ];

              return (
                <button
                  key={group.studio}
                  onClick={() => openDrillDown("studio", group.studio)}
                  className="rounded-2xl border border-border px-4 py-4 hover:bg-muted/20"
                >
                  <div className="mx-auto h-32 w-32">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          dataKey="value"
                          innerRadius={34}
                          outerRadius={48}
                          stroke="none"
                          isAnimationActive={false}
                        >
                          {pieData.map((slice, index) => (
                            <Cell key={index} fill={slice.fill} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <p className="-mt-20 text-center text-lg font-semibold">{`${group.actual}/${group.plan}`}</p>
                  <p className="mt-16 text-center text-xs uppercase tracking-[0.16em] text-muted-foreground">{group.studio}</p>
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

  return (
    <span className={`inline-flex rounded-full border px-2 py-1 text-[11px] font-medium ${map[status]}`}>
      {status}
    </span>
  );
}

export function CardStatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    Active: "bg-blue-50 text-blue-700 border-blue-200",
    Paused: "bg-amber-50 text-amber-700 border-amber-200",
    Closed: "bg-slate-100 text-slate-600 border-slate-200",
  };

  return (
    <span className={`inline-flex rounded-full border px-2 py-1 text-[11px] font-medium ${map[status]}`}>
      {status}
    </span>
  );
}
