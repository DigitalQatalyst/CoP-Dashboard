"use client";

import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { KpiCard } from "@/components/shared/KpiCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { useDrillDown } from "@/components/shared/DrillDownContext";
import { getConversions, getFunnelTotals } from "@/lib/dashboard";
import type { Position } from "@/types/cop";

const STAGE_META = [
  { key: "tg", label: "Talent Gate", color: "#0ea5e9" },
  { key: "trial", label: "Trial", color: "#38bdf8" },
  { key: "contract", label: "Contract", color: "#1d4ed8" },
  { key: "onboard", label: "Onboarding", color: "#0f766e" },
  { key: "backlog", label: "Backlogged", color: "#94a3b8" },
] as const;

export function PipelineBoard({ positions }: { positions: Position[] }) {
  const { openDrillDown } = useDrillDown();
  const funnel = getFunnelTotals(positions);
  const conversion = getConversions(positions);

  const chartData = positions
    .filter((position) => position.pipeline.total > 0)
    .map((position) => ({
      id: position.id,
      name: position.name,
      tg: position.pipeline.tg,
      trial: position.pipeline.trial,
      contract: position.pipeline.contract,
      onboard: position.pipeline.onboard,
    }));

  const chartHeight = Math.max(chartData.length * 32 + 80, 220);

  return (
    <div className="space-y-6 p-6">
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {STAGE_META.map((stage) => (
          <KpiCard
            key={stage.key}
            label={stage.label}
            value={funnel[stage.key]}
            subLabel="Current stage count"
            tone={stage.key === "backlog" ? "warning" : "neutral"}
          />
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-[28px] border border-border bg-card p-5 shadow-sm">
          <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Signal</p>
          <h2 className="mt-1 text-lg font-semibold">Funnel Visualisation</h2>
          <div className="mt-5 space-y-3">
            {STAGE_META.map((stage, index) => {
              const value = funnel[stage.key];
              const width = funnel.tg > 0 ? Math.max((value / Math.max(funnel.tg, 1)) * 100, 10) : 0;

              return (
                <button
                  key={stage.key}
                  onClick={() => openDrillDown("stage", stage.key)}
                  className="block w-full text-left"
                >
                  <div
                    className="mx-auto flex h-16 items-center justify-between rounded-2xl px-5 text-white"
                    style={{
                      width: `${Math.max(38, width)}%`,
                      background: stage.color,
                      opacity: 1 - index * 0.08,
                    }}
                  >
                    <span className="text-sm font-semibold">{stage.label}</span>
                    <span className="text-lg font-semibold">{value}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="rounded-[28px] border border-border bg-card p-5 shadow-sm">
          <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Story</p>
          <h2 className="mt-1 text-lg font-semibold">Conversion Rates + Insight</h2>
          <div className="mt-5 space-y-3">
            {conversion.items.map((item) => (
              <div key={item.label} className="rounded-2xl border border-border px-4 py-3">
                <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">{item.label}</p>
                <p className="mt-2 text-base font-semibold">{item.value}</p>
              </div>
            ))}
            {conversion.insights.length > 0 ? (
              conversion.insights.map((insight) => (
                <p key={insight} className="rounded-2xl bg-muted/30 px-4 py-3 text-sm leading-6 text-muted-foreground">
                  {insight}
                </p>
              ))
            ) : (
              <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                Funnel movement is within expected ranges.
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="rounded-[28px] border border-border bg-card p-5 shadow-sm">
        <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Signal</p>
        <h2 className="mt-1 text-lg font-semibold">Pipeline by Position</h2>
        {chartData.length === 0 ? (
          <div className="mt-5">
            <EmptyState message="No positions currently have active pipeline." />
          </div>
        ) : (
          <div className="mt-5" style={{ height: chartHeight }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                layout="vertical"
                onClick={(state) => {
                  const payload = state?.activePayload?.[0]?.payload as { id?: string } | undefined;
                  if (payload?.id) openDrillDown("position", payload.id);
                }}
              >
                <XAxis type="number" />
                <YAxis type="category" dataKey="name" width={220} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="tg" stackId="pipeline" fill="#0ea5e9" />
                <Bar dataKey="trial" stackId="pipeline" fill="#38bdf8" />
                <Bar dataKey="contract" stackId="pipeline" fill="#1d4ed8" />
                <Bar dataKey="onboard" stackId="pipeline" fill="#0f766e" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>
    </div>
  );
}
