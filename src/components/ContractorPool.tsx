"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, ChevronDown, ChevronRight, Search, X } from "lucide-react";
import { KpiCard } from "@/components/shared/KpiCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { useContractors } from "@/hooks/useContractors";
import { useDrillDown } from "@/components/shared/DrillDownContext";
import { getInitiativeBreakdown, getPriorityBuckets } from "@/lib/dashboard";
import type { ContractorPriority, ContractorStatus } from "@/types/cop";

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
    "P.01": true,
    "P.02": false,
    "P.03": false,
    "P.04": false,
  });

  // Filters
  const [nameSearch, setNameSearch] = useState("");
  const [locationFilter, setLocationFilter] = useState<string | null>(null);
  const [initiativeFilter, setInitiativeFilter] = useState<string | null>(null);
  const [priorityFilter, setPriorityFilter] = useState<ContractorPriority | null>(null);
  const [statusFilter, setStatusFilter] = useState<ContractorStatus | null>(null);
  const [sfiaFilter, setSfiaFilter] = useState<string | null>(null);

  const contractors = data?.contractors ?? [];
  const summary = data?.summary;

  // Derive unique SFIA levels and statuses from data
  const sfiaLevels = useMemo(
    () => [...new Set(contractors.map((c) => c.sfiaLevel).filter(Boolean))].sort(),
    [contractors]
  );
  const statuses = useMemo(
    () => [...new Set(contractors.map((c) => c.status))].sort() as ContractorStatus[],
    [contractors]
  );

  const filtered = useMemo(() => {
    return contractors.filter((c) => {
      if (nameSearch && !c.name.toLowerCase().includes(nameSearch.toLowerCase())) return false;
      if (locationFilter && c.location !== locationFilter) return false;
      if (initiativeFilter && c.initiative !== initiativeFilter) return false;
      if (priorityFilter && c.priority !== priorityFilter) return false;
      if (statusFilter && c.status !== statusFilter) return false;
      if (sfiaFilter && c.sfiaLevel !== sfiaFilter) return false;
      return true;
    });
  }, [contractors, nameSearch, locationFilter, initiativeFilter, priorityFilter, statusFilter, sfiaFilter]);

  if (!data || !summary) return null;

  const isFiltered =
    nameSearch !== "" ||
    locationFilter !== null ||
    initiativeFilter !== null ||
    priorityFilter !== null ||
    statusFilter !== null ||
    sfiaFilter !== null;

  const clearAll = () => {
    setNameSearch("");
    setLocationFilter(null);
    setInitiativeFilter(null);
    setPriorityFilter(null);
    setStatusFilter(null);
    setSfiaFilter(null);
  };

  const byPriority = getPriorityBuckets(isFiltered ? filtered : contractors);
  const initiatives = getInitiativeBreakdown(contractors);
  const locations = Object.entries(summary.byLocation).filter(([, count]) => count > 0).map(([loc]) => loc).sort();

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

      {/* Filter toolbar */}
      <div className="rounded-[28px] border border-border bg-card p-4 shadow-sm space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={nameSearch}
            onChange={(e) => setNameSearch(e.target.value)}
            placeholder="Search by name…"
            className="w-full rounded-xl border border-border bg-background py-2 pl-9 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
          />
          {nameSearch && (
            <button
              onClick={() => setNameSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Priority:</span>
            <select
              value={priorityFilter ?? ""}
              onChange={(e) => setPriorityFilter((e.target.value || null) as ContractorPriority | null)}
              className="rounded-xl border border-border bg-background px-3 py-1.5 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="">All</option>
              {(Object.keys(PRIORITY_LABELS) as ContractorPriority[]).map((p) => (
                <option key={p} value={p}>
                  {p} — {PRIORITY_LABELS[p]}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Status:</span>
            <select
              value={statusFilter ?? ""}
              onChange={(e) => setStatusFilter((e.target.value || null) as ContractorStatus | null)}
              className="rounded-xl border border-border bg-background px-3 py-1.5 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="">All</option>
              {statuses.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">SFIA:</span>
            <select
              value={sfiaFilter ?? ""}
              onChange={(e) => setSfiaFilter(e.target.value || null)}
              className="rounded-xl border border-border bg-background px-3 py-1.5 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="">All</option>
              {sfiaLevels.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Location:</span>
            <select
              value={locationFilter ?? ""}
              onChange={(e) => setLocationFilter(e.target.value || null)}
              className="rounded-xl border border-border bg-background px-3 py-1.5 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="">All</option>
              {locations.map((loc) => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Initiative:</span>
            <select
              value={initiativeFilter ?? ""}
              onChange={(e) => setInitiativeFilter(e.target.value || null)}
              className="rounded-xl border border-border bg-background px-3 py-1.5 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="">All</option>
              {initiatives.map((i) => (
                <option key={i.initiative} value={i.initiative}>{i.initiative}</option>
              ))}
            </select>
          </div>

          {isFiltered && (
            <button
              onClick={clearAll}
              className="ml-auto flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted/30 hover:text-foreground"
            >
              <X className="h-3 w-3" />
              Clear all filters
            </button>
          )}
        </div>
      </div>

      {isFiltered && (
        <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-primary/20 bg-primary/5 px-4 py-3">
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
            {filtered.length} result{filtered.length !== 1 ? "s" : ""} · Filtered by:
          </span>
          {nameSearch && (
            <button
              onClick={() => setNameSearch("")}
              className="flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary hover:bg-primary/20"
            >
              Name: &ldquo;{nameSearch}&rdquo;
              <X className="h-3 w-3" />
            </button>
          )}
          {priorityFilter && (
            <button
              onClick={() => setPriorityFilter(null)}
              className="flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary hover:bg-primary/20"
            >
              Priority: {priorityFilter}
              <X className="h-3 w-3" />
            </button>
          )}
          {statusFilter && (
            <button
              onClick={() => setStatusFilter(null)}
              className="flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary hover:bg-primary/20"
            >
              Status: {statusFilter}
              <X className="h-3 w-3" />
            </button>
          )}
          {sfiaFilter && (
            <button
              onClick={() => setSfiaFilter(null)}
              className="flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary hover:bg-primary/20"
            >
              SFIA: {sfiaFilter}
              <X className="h-3 w-3" />
            </button>
          )}
          {locationFilter && (
            <button
              onClick={() => setLocationFilter(null)}
              className="flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary hover:bg-primary/20"
            >
              Location: {locationFilter}
              <X className="h-3 w-3" />
            </button>
          )}
          {initiativeFilter && (
            <button
              onClick={() => setInitiativeFilter(null)}
              className="flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary hover:bg-primary/20"
            >
              Initiative: {initiativeFilter}
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      )}

      <section className="space-y-6">
        {/* F15: P.01 is now collapsible, defaulting to expanded */}
        <div className="rounded-[28px] border border-red-200 bg-card p-5 shadow-sm">
          <button
            onClick={() => setExpanded((current) => ({ ...current, "P.01": !current["P.01"] }))}
            className="flex w-full items-center justify-between text-left"
          >
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Story</p>
              <h2 className="mt-1 text-lg font-semibold">
                P.01 — Very Urgent ({byPriority["P.01"].length}{isFiltered ? " filtered" : ""} roles)
              </h2>
              {!expanded["P.01"] && (
                <p className="mt-2 text-sm text-muted-foreground">
                  {byPriority["P.01"].length} role{byPriority["P.01"].length === 1 ? "" : "s"} · {byPriority["P.01"].filter((c) => c.status === "Candidates (Closed)").length} closed sourcing
                </p>
              )}
            </div>
            {expanded["P.01"] ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>
          {expanded["P.01"] && (
            <div className="mt-5 grid gap-4">
              {byPriority["P.01"].length === 0 ? (
                <EmptyState message={isFiltered ? "No P.01 roles match the current filters." : "No P.01 roles in the mock dataset."} />
              ) : (
                byPriority["P.01"].map((contractor) => {
                  const isClosed = contractor.status === "Candidates (Closed)";
                  return (
                    <button
                      key={contractor.id}
                      onClick={() => openDrillDown("contractor", contractor.id)}
                      className={`h-full cursor-pointer rounded-2xl border px-4 py-4 text-left hover:bg-red-100 ${
                        isClosed
                          ? "border-amber-400 border-2 bg-amber-50"
                          : "border-red-200 bg-red-50"
                      }`}
                    >
                      <div className="flex h-full flex-col justify-between">
                        <div>
                          {isClosed && (
                            <div className="mb-2 flex items-center gap-1.5 rounded-lg bg-amber-100 px-2 py-1 text-[11px] font-semibold text-amber-700">
                              <AlertTriangle className="h-3 w-3 shrink-0" />
                              P.01 but sourcing closed — review priority
                            </div>
                          )}
                          <p className="text-sm font-semibold">{contractor.name}</p>
                          <div className="mt-2 flex flex-wrap gap-2">
                            <span className="rounded-full border border-border px-2 py-1 text-[11px]">{contractor.initiative}</span>
                            <span className="rounded-full bg-white px-2 py-1 text-[11px]">{contractor.status}</span>
                            <span className="rounded-full bg-white px-2 py-1 text-[11px]">{contractor.location}</span>
                            <span className="rounded-full bg-white px-2 py-1 text-[11px]">{contractor.sfiaLevel}</span>
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          )}
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
                {priority} — {PRIORITY_LABELS[priority]} ({byPriority[priority].length}{isFiltered ? " filtered" : ""} roles)
              </h2>
              {!expanded[priority] && (
                <p className="mt-2 text-sm text-muted-foreground">
                  {byPriority[priority].length} role{byPriority[priority].length === 1 ? "" : "s"} · {byPriority[priority].filter((c) => c.status === "Candidates (Closed)").length} closed sourcing
                </p>
              )}
            </div>
            {expanded[priority] ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>

          {expanded[priority] ? (
            <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3 items-stretch">
              {byPriority[priority].length === 0 ? (
                <EmptyState message="No roles match the current filters." />
              ) : (
                byPriority[priority].map((contractor) => (
                  <button
                    key={contractor.id}
                    onClick={() => openDrillDown("contractor", contractor.id)}
                    className="h-full cursor-pointer rounded-2xl border border-border px-4 py-4 text-left hover:bg-muted/20"
                  >
                    <div className="flex h-full flex-col justify-between">
                      <div>
                        <p className="text-sm font-semibold">{contractor.name}</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <span className="rounded-full border border-border px-2 py-1 text-[11px]">{contractor.initiative}</span>
                          <span className="rounded-full bg-muted px-2 py-1 text-[11px]">{contractor.status}</span>
                          <span className="rounded-full bg-muted px-2 py-1 text-[11px]">{contractor.location}</span>
                        </div>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          ) : null}
        </section>
      ))}
    </div>
  );
}
