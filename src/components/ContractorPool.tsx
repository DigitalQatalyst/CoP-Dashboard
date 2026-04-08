"use client";

import { useMemo, useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { KpiCard } from "@/components/shared/KpiCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { useContractors } from "@/hooks/useContractors";
import { useDrillDown } from "@/components/shared/DrillDownContext";
import { getInitiativeBreakdown, getPriorityBuckets } from "@/lib/dashboard";

const PRIORITY_LABELS = {
  "P.01": "Very Urgent",
  "P.02": "Urgent",
  "P.03": "ASAP",
  "P.04": "As Planned",
} as const;

export function ContractorPool() {
  const { data } = useContractors();
  const { openDrillDown } = useDrillDown();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    "P.02": false,
    "P.03": false,
    "P.04": false,
  });

  if (!data) return null;

  const { contractors, summary } = data;
  const byPriority = getPriorityBuckets(contractors);
  const initiatives = getInitiativeBreakdown(contractors);
  const locations = Object.entries(summary.byLocation).filter(([, count]) => count > 0);

  const kpis = [
    { label: "Total Roles", value: summary.total, subLabel: "Contractor pool" },
    { label: "Searching", value: summary.byStatus["Candidates (Searching)"] || 0, subLabel: "Active sourcing" },
    { label: "Interviews", value: summary.byStatus["Candidates (Interviews)"] || 0, subLabel: "Candidate review" },
    { label: "Onboarding", value: summary.byStatus["Candidates (Onboarding)"] || 0, subLabel: "Near to close" },
    { label: "Closed", value: summary.byStatus["Candidates (Closed)"] || 0, subLabel: "Completed" },
  ];

  return (
    <div className="space-y-6 p-6">
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {kpis.map((kpi) => (
          <KpiCard key={kpi.label} {...kpi} />
        ))}
      </section>

      <section className="grid gap-3 md:grid-cols-4">
        {(Object.keys(PRIORITY_LABELS) as Array<keyof typeof PRIORITY_LABELS>).map((priority) => (
          <div
            key={priority}
            className={`rounded-2xl px-4 py-4 text-sm font-semibold ${
              priority === "P.01"
                ? "bg-red-100 text-red-800"
                : priority === "P.02"
                  ? "bg-amber-100 text-amber-800"
                  : priority === "P.03"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-slate-100 text-slate-700"
            }`}
          >
            {priority} {PRIORITY_LABELS[priority]}: {summary.byPriority[priority]}
          </div>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[28px] border border-border bg-card p-5 shadow-sm">
          <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Story</p>
          <h2 className="mt-1 text-lg font-semibold">P.01 - Very Urgent ({byPriority["P.01"].length} roles)</h2>
          <div className="mt-5 grid gap-4">
            {byPriority["P.01"].length === 0 ? (
              <EmptyState message="No P.01 roles in the mock dataset." />
            ) : (
              byPriority["P.01"].map((contractor) => (
                <button
                  key={contractor.id}
                  onClick={() => openDrillDown("contractor", contractor.id)}
                  className="rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-left hover:bg-red-100"
                >
                  <p className="text-sm font-semibold">{contractor.name}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <span className="rounded-full border border-border px-2 py-1 text-[11px]">{contractor.initiative}</span>
                    <span className="rounded-full bg-white px-2 py-1 text-[11px]">{contractor.status}</span>
                    <span className="rounded-full bg-white px-2 py-1 text-[11px]">{contractor.location}</span>
                    <span className="rounded-full bg-white px-2 py-1 text-[11px]">{contractor.sfiaLevel}</span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[28px] border border-border bg-card p-5 shadow-sm">
            <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Signal</p>
            <h2 className="mt-1 text-lg font-semibold">Location Distribution</h2>
            <div className="mt-5 space-y-3">
              {locations.map(([location, count]) => (
                <div key={location} className="flex items-center justify-between rounded-2xl border border-border px-4 py-3">
                  <span className="text-sm font-medium">{location}</span>
                  <span className="text-lg font-semibold">{count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[28px] border border-border bg-card p-5 shadow-sm">
            <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Signal</p>
            <h2 className="mt-1 text-lg font-semibold">Initiative Breakdown</h2>
            <div className="mt-5 space-y-3">
              {initiatives.map((initiative) => (
                <div key={initiative.initiative} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="truncate pr-3">{initiative.initiative}</span>
                    <span className="font-semibold">{initiative.count}</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${(initiative.count / Math.max(contractors.length, 1)) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {(["P.02", "P.03", "P.04"] as const).map((priority) => (
        <section key={priority} className="rounded-[28px] border border-border bg-card p-5 shadow-sm">
          <button
            onClick={() => setExpanded((current) => ({ ...current, [priority]: !current[priority] }))}
            className="flex w-full items-center justify-between text-left"
          >
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Story</p>
              <h2 className="mt-1 text-lg font-semibold">
                {priority} - {PRIORITY_LABELS[priority]} ({byPriority[priority].length} roles)
              </h2>
            </div>
            {expanded[priority] ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>

          {expanded[priority] ? (
            <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {byPriority[priority].map((contractor) => (
                <button
                  key={contractor.id}
                  onClick={() => openDrillDown("contractor", contractor.id)}
                  className="rounded-2xl border border-border px-4 py-4 text-left hover:bg-muted/20"
                >
                  <p className="text-sm font-semibold">{contractor.name}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <span className="rounded-full border border-border px-2 py-1 text-[11px]">{contractor.initiative}</span>
                    <span className="rounded-full bg-muted px-2 py-1 text-[11px]">{contractor.status}</span>
                    <span className="rounded-full bg-muted px-2 py-1 text-[11px]">{contractor.location}</span>
                  </div>
                </button>
              ))}
            </div>
          ) : null}
        </section>
      ))}
    </div>
  );
}
