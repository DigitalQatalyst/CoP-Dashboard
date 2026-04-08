"use client";

import { AlertTriangle } from "lucide-react";
import { CardStatusBadge, VacancyBadge } from "@/components/CommandCentre";
import { EmptyState } from "@/components/shared/EmptyState";
import { useDrillDown } from "@/components/shared/DrillDownContext";
import { getAtRiskActionSignal, getAtRiskPositions, getBuGapGroups } from "@/lib/dashboard";
import type { CoPSummary, Position } from "@/types/cop";

export function HeadcountPlanner({ positions, summary }: { positions: Position[]; summary: CoPSummary }) {
  const { openDrillDown } = useDrillDown();
  const buGaps = getBuGapGroups(positions);
  const zeroFill = positions
    .filter((position) => position.planFYE > 0 && position.actualYTD === 0)
    .sort((left, right) => right.planFYE - left.planFYE);
  const atRisk = getAtRiskPositions(positions);
  const maxPlan = Math.max(...buGaps.map((group) => group.plan), 1);

  return (
    <div className="space-y-6 p-6">
      <section className="rounded-[24px] border border-destructive/20 bg-destructive/10 px-5 py-4">
        <p className="text-xs uppercase tracking-[0.16em] text-destructive">Story</p>
        <p className="mt-2 text-base font-semibold text-destructive">
          Total planned gap is {summary.planFYE - summary.actualYTD} heads across the FY2026 catalogue.
        </p>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[28px] border border-border bg-card p-5 shadow-sm">
          <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Signal</p>
          <h2 className="mt-1 text-lg font-semibold">Gap Heat Bars</h2>
          <div className="mt-5 space-y-4">
            {buGaps.map((group) => (
              <button
                key={group.buTower}
                onClick={() => openDrillDown("bu", group.buTower)}
                className="w-full rounded-2xl border border-border px-4 py-4 text-left hover:bg-muted/20"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{group.buTower}</p>
                    <div className="mt-3 space-y-2">
                      <div className="h-2 rounded-full bg-muted">
                        <div className="h-full rounded-full bg-slate-300" style={{ width: `${(group.plan / maxPlan) * 100}%` }} />
                      </div>
                      <div className="h-2 rounded-full bg-muted">
                        <div className="h-full rounded-full bg-primary" style={{ width: `${(group.actual / maxPlan) * 100}%` }} />
                      </div>
                    </div>
                  </div>
                  <span className="text-lg font-semibold text-destructive">-{group.gap}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-[28px] border border-border bg-card p-5 shadow-sm">
          <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Signal</p>
          <h2 className="mt-1 text-lg font-semibold">Zero-Fill Positions</h2>
          <div className="mt-5">
            {zeroFill.length === 0 ? (
              <EmptyState message="No zero-fill positions found." />
            ) : (
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {zeroFill.map((position) => (
                  <button
                    key={position.id}
                    onClick={() => openDrillDown("position", position.id)}
                    className="rounded-2xl border border-border px-4 py-3 text-left hover:bg-muted/20"
                  >
                    <p className="text-sm font-medium">{position.name}</p>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <span className="rounded-full border border-border px-2 py-1 text-[11px]">{position.studio}</span>
                      <VacancyBadge status={position.vacancyStatus} />
                    </div>
                    <p className="mt-3 text-xs text-muted-foreground">Gap: {position.planFYE - position.actualYTD}</p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="rounded-[28px] border border-border bg-card p-5 shadow-sm">
        <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Signal</p>
        <h2 className="mt-1 text-lg font-semibold">At-Risk Register</h2>
        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          {atRisk.length === 0 ? (
            <EmptyState message="No at-risk positions found." />
          ) : (
            atRisk.map((position) => (
              <button
                key={position.id}
                onClick={() => openDrillDown("position", position.id)}
                className="rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-left hover:bg-destructive/10"
              >
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
              </button>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
