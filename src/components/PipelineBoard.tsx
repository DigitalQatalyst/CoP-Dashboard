"use client";

import { useMemo, useState } from "react";
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AlertTriangle, X } from "lucide-react";
import { KpiCard } from "@/components/shared/KpiCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { useDrillDown } from "@/components/shared/DrillDownContext";
import { getConversions, getFunnelTotals } from "@/lib/dashboard";
import type { Position, Studio } from "@/types/cop";

const STAGE_META = [
  { key: "tg", label: "Talent Gate", color: "#0ea5e9" },
  { key: "trial", label: "Trial", color: "#38bdf8" },
  { key: "contract", label: "Contract", color: "#1d4ed8" },
  { key: "onboard", label: "Onboarding", color: "#0f766e" },
  { key: "backlog", label: "Backlogged", color: "#94a3b8" },
] as const;

export function PipelineBoard({ positions }: { positions: Position[] }) {
  const { openDrillDown } = useDrillDown();
  const [studioFilter, setStudioFilter] = useState<Studio | null>(null);
  const [buFilter, setBuFilter] = useState<string | null>(null);

  const studios = useMemo(() => [...new Set(positions.map((p) => p.studio))].sort() as Studio[], [positions]);
  const buTowers = useMemo(
    () => [...new Set(positions.map((p) => p.buTower))].filter(Boolean).sort(),
    [positions]
  );

  const filtered = useMemo(() => {
    return positions.filter((p) => {
      if (studioFilter && p.studio !== studioFilter) return false;
      if (buFilter && p.buTower !== buFilter) return false;
      return true;
    });
  }, [positions, studioFilter, buFilter]);

  const isFiltered = studioFilter !== null || buFilter !== null;

  const funnel = getFunnelTotals(filtered);
  const conversion = getConversions(filtered);

  const chartData = filtered
    .filter((position) => position.pipeline.total > 0)
    .map((position) => ({
      id: position.id,
      name: position.name,
      tg: position.pipeline.tg,
      trial: position.pipeline.trial,
      contract: position.pipeline.contract,
      onboard: position.pipeline.onboard,
    }));

  // F11: give each row more room so labels don't truncate, min 260
  const chartHeight = Math.max(chartData.length * 44 + 80, 260);

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

      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3">
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
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">BU Tower:</span>
          <select
            value={buFilter ?? ""}
            onChange={(e) => setBuFilter(e.target.value || null)}
            className="rounded-xl border border-border bg-background px-3 py-1 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="">All</option>
            {buTowers.map((bu) => (
              <option key={bu} value={bu}>
                {bu}
              </option>
            ))}
          </select>
        </div>

        {isFiltered && (
          <button
            onClick={() => { setStudioFilter(null); setBuFilter(null); }}
            className="ml-auto flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <X className="h-3 w-3" />
            Clear filters
          </button>
        )}
      </div>

      {isFiltered && (
        <p className="text-xs text-muted-foreground">
          Showing {filtered.length} of {positions.length} positions
          {studioFilter ? ` · Studio: ${studioFilter}` : ""}
          {buFilter ? ` · BU: ${buFilter}` : ""}
        </p>
      )}

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
              <div
                key={item.label}
                className={`rounded-2xl border px-4 py-3 ${
                  item.anomaly
                    ? "border-amber-300 bg-amber-50"
                    : "border-border"
                }`}
              >
                <div className="flex items-center justify-between">
                  <p className={`text-xs uppercase tracking-[0.16em] ${item.anomaly ? "text-amber-700" : "text-muted-foreground"}`}>
                    {item.label}
                  </p>
                  {item.anomaly && (
                    <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
                  )}
                </div>
                <p className={`mt-2 text-base font-semibold ${item.anomaly ? "text-amber-700" : ""}`}>
                  {item.value}
                </p>
                {item.anomaly && (
                  <p className="mt-1 text-[11px] text-amber-600">
                    Exceeds 100% — data may be out of sync
                  </p>
                )}
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
                {/* F11: wider axis + custom tick with title attr for native browser tooltip on truncated labels */}
                <YAxis
                  type="category"
                  dataKey="name"
                  width={260}
                  tick={({ x, y, payload }: { x: number; y: number; payload: { value: string } }) => (
                    <foreignObject x={x - 258} y={y - 9} width={254} height={20}>
                      <div
                        title={payload.value}
                        style={{
                          fontSize: 11,
                          overflow: "hidden",
                          whiteSpace: "nowrap",
                          textOverflow: "ellipsis",
                          width: "100%",
                          textAlign: "right",
                          lineHeight: "20px",
                          color: "#64748b",
                        }}
                      >
                        {payload.value}
                      </div>
                    </foreignObject>
                  )}
                />
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
