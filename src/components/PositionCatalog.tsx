"use client";

import { useMemo, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { CardStatusBadge, VacancyBadge } from "@/components/CommandCentre";
import { EmptyState } from "@/components/shared/EmptyState";
import { PipelineSpark } from "@/components/shared/PipelineSpark";
import { useDrillDown } from "@/components/shared/DrillDownContext";
import { getPositionsByTier } from "@/lib/dashboard";
import type { CardStatus, Position, Studio } from "@/types/cop";

export function PositionCatalog({ positions }: { positions: Position[] }) {
  const { openDrillDown } = useDrillDown();
  const [studio, setStudio] = useState<Studio | "All">("All");
  const [cardStatus, setCardStatus] = useState<CardStatus | "All">("All");
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

  const tiers = getPositionsByTier(filtered).filter((tier) => tier.positions.length > 0);
  const counts = getPositionsByTier(positions);

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

      <div className="flex flex-wrap gap-3 rounded-[24px] border border-border bg-card p-4">
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
      </div>

      {tiers.length === 0 ? <EmptyState message="No positions match the current filters." /> : null}

      {tiers.map((tier) => {
        if (tier.tier === "healthy" && !showHealthy) {
          return (
            <button
              key={tier.tier}
              onClick={() => setShowHealthy(true)}
              className="flex w-full items-center justify-between rounded-[24px] border border-border bg-card px-5 py-4 text-left shadow-sm"
            >
              <div>
                <p className="text-sm font-semibold">Show {tier.positions.length} healthy positions</p>
                <p className="text-xs text-muted-foreground">Healthy roles stay collapsed by default.</p>
              </div>
              <ChevronDown className="h-4 w-4" />
            </button>
          );
        }

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
              {tier.tier === "healthy" ? (
                <button onClick={() => setShowHealthy(false)} className="text-sm text-muted-foreground">
                  <ChevronUp className="h-4 w-4" />
                </button>
              ) : null}
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {tier.positions.map((position) => (
                <button
                  key={position.id}
                  onClick={() => openDrillDown("position", position.id)}
                  className="flex h-[128px] flex-col justify-between rounded-2xl border border-border bg-background px-4 py-4 text-left hover:bg-muted/20"
                >
                  <div>
                    <p className="truncate text-sm font-semibold">{position.name}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <span className="rounded-full border border-border px-2 py-1 text-[11px]">{position.studio}</span>
                      <VacancyBadge status={position.vacancyStatus} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <PipelineSpark pipeline={position.pipeline} />
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Plan: {position.planFYE}</span>
                      <span>Actual: {position.actualYTD}</span>
                      <span>Gap: {position.planFYE - position.actualYTD}</span>
                    </div>
                    <CardStatusBadge status={position.cardStatus} />
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
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="space-y-1">
      <span className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-w-[180px] rounded-xl border border-border bg-background px-3 py-2 text-sm"
      >
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}
