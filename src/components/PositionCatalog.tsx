"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, ChevronDown, ChevronUp } from "lucide-react";
import { CardStatusBadge, VacancyBadge } from "@/components/CommandCentre";
import { EmptyState } from "@/components/shared/EmptyState";
import { PipelineSpark } from "@/components/shared/PipelineSpark";
import { useDrillDown } from "@/components/shared/DrillDownContext";
import { getPositionsByTier } from "@/lib/dashboard";
import type { CardStatus, Position, Studio } from "@/types/cop";

type SortKey = "gap" | "planFYE" | "name" | "pipeline";

function sortPositions(positions: Position[], key: SortKey): Position[] {
  return [...positions].sort((a, b) => {
    switch (key) {
      case "gap":
        return (b.planFYE - b.actualYTD) - (a.planFYE - a.actualYTD);
      case "planFYE":
        return b.planFYE - a.planFYE;
      case "name":
        return a.name.localeCompare(b.name);
      case "pipeline":
        return b.pipeline.total - a.pipeline.total;
    }
  });
}

export function PositionCatalog({ positions }: { positions: Position[] }) {
  const { openDrillDown } = useDrillDown();
  const [studio, setStudio] = useState<Studio | "All">("All");
  const [cardStatus, setCardStatus] = useState<CardStatus | "All">("All");
  const [sortKey, setSortKey] = useState<SortKey>("gap");
  const [showHealthy, setShowHealthy] = useState(false);

  const filtered = useMemo(
    () =>
      positions.filter((position) => {
        if (studio !== "All" && position.studio !== studio) return false;
        if (cardStatus !== "All" && position.cardStatus !== cardStatus) return false;
        return true;
      }),
    [positions, studio, cardStatus]
  );

  const tiers = getPositionsByTier(filtered)
    .map((tier) => ({ ...tier, positions: sortPositions(tier.positions, sortKey) }))
    .filter((tier) => tier.positions.length > 0);

  const counts = getPositionsByTier(positions);
  const healthyTier = tiers.find((t) => t.tier === "healthy");

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-wrap gap-3">
        {counts.map((tier) => (
          <div
            key={tier.tier}
            className={`rounded-full px-4 py-2 text-sm font-medium ${
              tier.tier === "critical"
                ? "bg-red-50 text-red-700"
                : tier.tier === "attention"
                  ? "bg-amber-50 text-amber-700"
                  : "bg-emerald-50 text-emerald-700"
            }`}
          >
            {tier.label}: {tier.positions.length}
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-end gap-3 rounded-[24px] border border-border bg-card p-4">
        <FilterSelect
          label="Studio"
          value={studio}
          options={["All", "NBO", "DXB", "NBO | DXB"]}
          onChange={(value) => setStudio(value as Studio | "All")}
        />
        <FilterSelect
          label="Card Status"
          value={cardStatus}
          options={["All", "Active", "Paused", "Closed"]}
          onChange={(value) => setCardStatus(value as CardStatus | "All")}
        />
        {/* F8: sort control */}
        <FilterSelect
          label="Sort by"
          value={sortKey}
          options={["gap", "planFYE", "name", "pipeline"]}
          optionLabels={{ gap: "Gap size", planFYE: "Plan FYE", name: "Name", pipeline: "Pipeline count" }}
          onChange={(value) => setSortKey(value as SortKey)}
        />

        {/* F9: healthy positions count chip — prominently placed in the toolbar */}
        {healthyTier && (
          <button
            onClick={() => setShowHealthy((v) => !v)}
            className={`ml-auto flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition-colors ${
              showHealthy
                ? "border-teal-300 bg-teal-50 text-teal-700"
                : "border-border bg-background text-muted-foreground hover:bg-muted/30"
            }`}
          >
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-teal-100 text-[11px] font-bold text-teal-700">
              {healthyTier.positions.length}
            </span>
            {showHealthy ? "Hide healthy" : "Show healthy"}
            {showHealthy ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>
        )}
      </div>

      {tiers.length === 0 ? <EmptyState message="No positions match the current filters." /> : null}

      {tiers.map((tier) => {
        if (tier.tier === "healthy" && !showHealthy) return null;

        return (
          <section
            key={tier.tier}
            className={`rounded-[28px] border bg-card p-5 shadow-sm ${
              tier.tier === "critical"
                ? "border-l-4 border-l-red-500"
                : tier.tier === "attention"
                  ? "border-l-4 border-l-amber-500"
                  : "border-l-4 border-l-teal-500"
            }`}
          >
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Story</p>
                <h2 className="mt-1 text-lg font-semibold">
                  {tier.label.toUpperCase()} ({tier.positions.length} positions)
                </h2>
              </div>
              {tier.tier === "healthy" && (
                <button onClick={() => setShowHealthy(false)} className="text-sm text-muted-foreground">
                  <ChevronUp className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {tier.positions.map((position) => (
                <button
                  key={position.id}
                  onClick={() => openDrillDown("position", position.id)}
                  className={`flex h-full min-h-[180px] flex-col justify-between rounded-2xl border bg-background px-4 py-4 text-left hover:bg-muted/20 ${
                    tier.tier === "critical" && position.cardStatus === "Closed"
                      ? "border-red-400 border-2"
                      : "border-border"
                  }`}
                >
                  {tier.tier === "critical" && position.cardStatus === "Closed" && (
                    <div className="mb-2 flex items-center gap-1.5 rounded-lg bg-red-100 px-2 py-1 text-[11px] font-semibold text-red-700">
                      <AlertTriangle className="h-3 w-3 shrink-0" />
                      Sourcing closed — no active pipeline
                    </div>
                  )}
                  <div>
                    <p className="truncate text-sm font-semibold">{position.name}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <span className="rounded-full border border-border px-2 py-1 text-[11px]">{position.studio}</span>
                      <VacancyBadge status={position.vacancyStatus} />
                    </div>
                  </div>
                  <div className="mt-4 flex flex-col gap-2">
                    <PipelineSpark pipeline={position.pipeline} />
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Plan: {position.planFYE}</span>
                      <span>Actual: {position.actualYTD}</span>
                      <span>Gap: {position.planFYE - position.actualYTD}</span>
                    </div>
                    <div className="pt-1">
                      <CardStatusBadge status={position.cardStatus} />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

function FilterSelect({
  label,
  value,
  options,
  optionLabels,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  optionLabels?: Record<string, string>;
  onChange: (value: string) => void;
}) {
  return (
    <label className="space-y-1">
      <span className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-w-[160px] rounded-xl border border-border bg-background px-3 py-2 text-sm"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {optionLabels?.[option] ?? option}
          </option>
        ))}
      </select>
    </label>
  );
}
