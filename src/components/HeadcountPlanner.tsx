"use client";

import { useState } from "react";
import { AlertTriangle, ChevronDown, Info, X } from "lucide-react";
import { CardStatusBadge, VacancyBadge } from "@/components/CommandCentre";
import { EmptyState } from "@/components/shared/EmptyState";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useDrillDown } from "@/components/shared/DrillDownContext";
import { getAtRiskActionSignal, getAtRiskPositions, getBuGapGroups } from "@/lib/dashboard";
import type { CoPSummary, Position, Studio } from "@/types/cop";

export function HeadcountPlanner({ positions, summary }: { positions: Position[]; summary: CoPSummary }) {
  const { openDrillDown } = useDrillDown();
  const [studioFilter, setStudioFilter] = useState<Studio | null>(null);
  const [heatOpen, setHeatOpen] = useState(true);
  const [zeroFillOpen, setZeroFillOpen] = useState(true);
  const [atRiskOpen, setAtRiskOpen] = useState(true);

  const studios = [...new Set(positions.map((p) => p.studio))].sort() as Studio[];
  const filtered = studioFilter ? positions.filter((p) => p.studio === studioFilter) : positions;

  const buGaps = getBuGapGroups(filtered);
  const zeroFill = filtered
    .filter((position) => position.planFYE > 0 && position.actualYTD === 0)
    .sort((left, right) => right.planFYE - left.planFYE);
  const atRisk = getAtRiskPositions(filtered);
  const maxPlan = Math.max(...buGaps.map((group) => group.plan), 1);
  const maxBarValue = Math.max(maxPlan, ...buGaps.map((group) => group.actual), 1);
  const largestGap = buGaps.length ? buGaps[0].gap : 0;

  return (
    <div className="space-y-6 p-6">
      <section className="rounded-[24px] border border-destructive/20 bg-destructive/10 px-5 py-4">
        <p className="text-xs uppercase tracking-[0.16em] text-destructive">Story</p>
        <p className="mt-2 text-base font-semibold text-destructive">
          Total planned gap is {summary.planFYE - summary.actualYTD} heads across the FY2026 catalogue.
        </p>
        {/* F14: Plan / Actual / Gap breakdown sub-line */}
        <p className="mt-1.5 text-sm text-destructive/80">
          Plan: {summary.planFYE} &nbsp;·&nbsp; Actual: {summary.actualYTD} &nbsp;·&nbsp; Gap: {summary.planFYE - summary.actualYTD}
        </p>
      </section>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Studio:</span>
        {studios.map((studio) => (
          <button
            key={studio}
            onClick={() => setStudioFilter(studioFilter === studio ? null : studio)}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
              studioFilter === studio
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border hover:bg-muted/30"
            }`}
          >
            {studio}
          </button>
        ))}
        {studioFilter && (
          <button
            onClick={() => setStudioFilter(null)}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <X className="h-3 w-3" />
            Clear
          </button>
        )}
      </div>

      <div className="space-y-6">
        <section className="rounded-[28px] border border-border bg-card p-5 shadow-sm overflow-hidden">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Signal</p>
              <h2 className="mt-1 text-lg font-semibold">Gap Heat Bars</h2>
              {!heatOpen && (
                <p className="mt-2 text-sm text-muted-foreground">
                  {buGaps.length} BU tower{buGaps.length === 1 ? "" : "s"}, largest gap {largestGap} head{largestGap === 1 ? "" : "s"}.
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={() => setHeatOpen((value) => !value)}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
              {heatOpen ? "Collapse" : "Expand"}
              <ChevronDown className={`h-4 w-4 transition-transform ${heatOpen ? "rotate-180" : ""}`} />
            </button>
          </div>
          {heatOpen && (
            <div className="mt-5 space-y-4">
              {buGaps.length === 0 ? (
                <EmptyState message="No BU towers match the selected studio." />
              ) : (
                <>
                  <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-border/70 bg-muted/50 p-3 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-slate-500" />
                      Plan
                    </span>
                    <span className="inline-flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-primary" />
                      Actual
                    </span>
                    <span className="ml-auto text-right text-[11px] text-muted-foreground/90">
                      Higher gap means more unfilled heads.
                    </span>
                  </div>

                  {buGaps.map((group) => {
                    const gapValue = group.gap;
                    const gapLabel =
                      gapValue === 0
                        ? "On plan"
                        : gapValue > 0
                        ? `Gap: ${gapValue}`
                        : `Surplus: ${Math.abs(gapValue)}`;
                    const gapClass =
                      gapValue > 0
                        ? "text-destructive"
                        : gapValue < 0
                        ? "text-emerald-700"
                        : "text-muted-foreground";

                    return (
                      <button
                        key={group.buTower}
                        onClick={() => openDrillDown("bu", group.buTower)}
                        className="w-full rounded-2xl border border-border px-4 py-4 text-left hover:bg-muted/20"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <p className="truncate text-sm font-medium">{group.buTower}</p>
                              </TooltipTrigger>
                              <TooltipContent side="top" className="text-xs">{group.buTower}</TooltipContent>
                            </Tooltip>
                            <div className="mt-3 space-y-2">
                              <div className="h-2.5 rounded-full bg-slate-100 ring-1 ring-slate-200">
                                <div
                                  className="h-full rounded-full bg-slate-500"
                                  style={{ width: `${(group.plan / maxBarValue) * 100}%` }}
                                />
                              </div>
                              <div className="h-2.5 rounded-full bg-slate-100 ring-1 ring-slate-200">
                                <div
                                  className={`h-full rounded-full shadow-sm ${gapValue < 0 ? "bg-emerald-500" : "bg-primary"}`}
                                  style={{ width: `${(group.actual / maxBarValue) * 100}%` }}
                                />
                              </div>
                            </div>
                          </div>
                          <span className={`text-lg font-semibold ${gapClass}`}>{gapLabel}</span>
                        </div>
                      </button>
                    );
                  })}
                </>
              )}
            </div>
          )}
        </section>

        <div className="rounded-[28px] border border-border bg-card p-5 shadow-sm overflow-hidden">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Signal</p>
              <h2 className="mt-1 text-lg font-semibold">No Active Headcount</h2>
              {!zeroFillOpen && (
                <p className="mt-2 text-sm text-muted-foreground">
                  {zeroFill.length} position{zeroFill.length === 1 ? "" : "s"} with zero active headcount.
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={() => setZeroFillOpen((value) => !value)}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
              {zeroFillOpen ? "Collapse" : "Expand"}
              <ChevronDown className={`h-4 w-4 transition-transform ${zeroFillOpen ? "rotate-180" : ""}`} />
            </button>
          </div>
          {zeroFillOpen && (
            <div className="mt-5">
              {zeroFill.length === 0 ? (
                <EmptyState message="No zero-fill positions found." />
              ) : (
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3 items-stretch">
                  {zeroFill.map((position) => (
                    <button
                      key={position.id}
                      onClick={() => openDrillDown("position", position.id)}
                      className="h-full rounded-2xl border border-border px-4 py-3 text-left hover:bg-muted/20"
                    >
                      <div className="flex h-full flex-col justify-between">
                        <div>
                          <p className="text-sm font-medium">{position.name}</p>
                          <div className="mt-3 flex flex-wrap items-center gap-2">
                            <span className="rounded-full border border-border px-2 py-1 text-[11px]">{position.studio}</span>
                            <VacancyBadge status={position.vacancyStatus} />
                          </div>
                          <p className="mt-3 text-xs text-muted-foreground">Gap: {position.planFYE - position.actualYTD}</p>
                        </div>
                        {position.vacancyStatus === "Filled" && (
                          <div className="mt-4 flex items-center gap-1 text-[11px] text-amber-600">
                            <Info className="h-3 w-3 shrink-0" />
                            Marked filled but 0 actuals recorded — check data
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <section className="rounded-[28px] border border-border bg-card p-5 shadow-sm overflow-hidden">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Signal</p>
            <h2 className="mt-1 text-lg font-semibold">At-Risk Register</h2>
            {!atRiskOpen && (
              <p className="mt-2 text-sm text-muted-foreground">
                {atRisk.length === 0 ? "No at-risk positions." : `${atRisk.length} at-risk position${atRisk.length === 1 ? "" : "s"}.`}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={() => setAtRiskOpen((value) => !value)}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            {atRiskOpen ? "Collapse" : "Expand"}
            <ChevronDown className={`h-4 w-4 transition-transform ${atRiskOpen ? "rotate-180" : ""}`} />
          </button>
        </div>
        {atRiskOpen && (
          <div className="mt-5 grid gap-4 lg:grid-cols-2 items-stretch">
            {atRisk.length === 0 ? (
              <EmptyState message="No at-risk positions found." />
            ) : (
              atRisk.map((position) => (
                <button
                  key={position.id}
                  onClick={() => openDrillDown("position", position.id)}
                  className="h-full rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-left hover:bg-destructive/10"
                >
                  <div className="flex h-full flex-col justify-between">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="mt-0.5 h-4 w-4 text-destructive" />
                      <div className="space-y-2">
                        <div>
                          <p className="text-sm font-semibold">{position.name}</p>
                          <div className="mt-1.5 flex flex-wrap gap-2">
                            <span className="rounded-full border border-border px-2 py-1 text-[11px]">{position.studio}</span>
                            <VacancyBadge status={position.vacancyStatus} />
                            <CardStatusBadge status={position.cardStatus} />
                            <span className="text-xs text-muted-foreground">{`Plan: ${position.planFYE} heads`}</span>
                          </div>
                        </div>
                        <p className="text-sm leading-5 text-muted-foreground">{getAtRiskActionSignal(position)}</p>
                      </div>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        )}
      </section>
    </div>
  );
}
