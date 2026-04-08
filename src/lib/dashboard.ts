import { differenceInMinutes } from "date-fns";
import type { Contractor, CoPData, Position, Studio, UrgencyTier } from "@/types/cop";

export type AlertSeverity = "critical" | "warning" | "info";

export interface DashboardAlert {
  severity: AlertSeverity;
  message: string;
}

export interface TierGroup {
  tier: UrgencyTier;
  label: string;
  positions: Position[];
}

export interface BuGapGroup {
  buTower: string;
  plan: number;
  actual: number;
  gap: number;
  positions: Position[];
}

export function getFunnelTotals(positions: Position[]) {
  return positions.reduce(
    (acc, position) => ({
      tg: acc.tg + position.pipeline.tg,
      trial: acc.trial + position.pipeline.trial,
      contract: acc.contract + position.pipeline.contract,
      onboard: acc.onboard + position.pipeline.onboard,
      backlog: acc.backlog + position.pipeline.backlog,
    }),
    { tg: 0, trial: 0, contract: 0, onboard: 0, backlog: 0 }
  );
}

export function getPositionsByTier(positions: Position[]): TierGroup[] {
  const byTier: Record<UrgencyTier, Position[]> = {
    critical: positions.filter((position) => position.urgencyTier === "critical"),
    attention: positions.filter((position) => position.urgencyTier === "attention"),
    healthy: positions.filter((position) => position.urgencyTier === "healthy"),
  };

  return [
    { tier: "critical", label: "Critical", positions: byTier.critical },
    { tier: "attention", label: "Needs Attention", positions: byTier.attention },
    { tier: "healthy", label: "Healthy", positions: byTier.healthy },
  ];
}

export function getStudioGroups(positions: Position[]) {
  const studios: Studio[] = ["NBO", "DXB", "NBO | DXB"];
  return studios.map((studio) => {
    const studioPositions = positions.filter((position) => position.studio === studio);
    const plan = studioPositions.reduce((sum, position) => sum + position.planFYE, 0);
    const actual = studioPositions.reduce((sum, position) => sum + position.actualYTD, 0);

    return {
      studio,
      positions: studioPositions,
      plan,
      actual,
      fillRate: plan > 0 ? Math.round((actual / plan) * 100) : 0,
    };
  });
}

export function getPipelineStageRows(positions: Position[], stage: keyof Position["pipeline"]) {
  return positions
    .filter((position) => {
      const value = position.pipeline[stage];
      return typeof value === "number" && value > 0;
    })
    .map((position) => ({
      id: position.id,
      name: position.name,
      studio: position.studio,
      count: position.pipeline[stage] as number,
    }))
    .sort((left, right) => right.count - left.count);
}

export function getBuGapGroups(positions: Position[]): BuGapGroup[] {
  return Object.values(
    positions.reduce((acc, position) => {
      const key = position.buTower || "Unknown";
      if (!acc[key]) {
        acc[key] = { buTower: key, plan: 0, actual: 0, gap: 0, positions: [] };
      }

      acc[key].plan += position.planFYE;
      acc[key].actual += position.actualYTD;
      acc[key].positions.push(position);
      acc[key].gap = acc[key].plan - acc[key].actual;
      return acc;
    }, {} as Record<string, BuGapGroup>)
  ).sort((left, right) => right.gap - left.gap);
}

export function getAtRiskPositions(positions: Position[]) {
  return positions.filter(
    (position) =>
      (position.vacancyStatus === "Vacant (All)" || position.vacancyStatus === "Vacant (Some)") &&
      !position.hasActivePipeline
  );
}

export function getPositionActionSignal(position: Position) {
  if (!position.hasActivePipeline && position.urgencyTier === "critical") {
    return "No candidates in pipeline - open new TG round immediately";
  }
  if (position.vacancyStatus === "Vacant (All)") {
    return "Fully vacant - accelerate pipeline from TG to Trial";
  }
  if (position.urgencyTier === "attention") {
    return "Pipeline exists but progress is slow - review TG candidates";
  }
  return "On track";
}

export function getAtRiskActionSignal(position: Position) {
  if (position.cardStatus === "Closed") {
    return "Card is closed with no candidates - reopen or escalate";
  }
  if (position.cardStatus === "Paused") {
    return "Pipeline paused - confirm if role is still required";
  }
  return "Active card but no candidates - sourcing has not started";
}

export function getCommandAlerts(data: CoPData): DashboardAlert[] {
  const positions = data.positions;
  const funnel = getFunnelTotals(positions);
  const alerts: DashboardAlert[] = [];

  const zeroPipelineVacant = positions.filter(
    (position) => position.vacancyStatus === "Vacant (All)" && position.pipeline.total === 0
  );
  if (zeroPipelineVacant.length > 0) {
    alerts.push({
      severity: "critical",
      message: `${zeroPipelineVacant.length} position(s) have no staff and no candidates - immediate action needed`,
    });
  }

  if (data.summary.fillRate < 20) {
    alerts.push({
      severity: "critical",
      message: `Overall fill rate is ${data.summary.fillRate}% - only ${data.summary.actualYTD} of ${data.summary.planFYE} planned heads are active`,
    });
  }

  const dxb = getStudioGroups(positions).find((group) => group.studio === "DXB");
  if (dxb && dxb.actual === 0 && dxb.plan > 0) {
    alerts.push({
      severity: "critical",
      message: `DXB studio has 0 staff against a plan of ${dxb.plan} heads`,
    });
  }

  const pausedVacant = positions.filter(
    (position) =>
      position.cardStatus === "Paused" &&
      (position.vacancyStatus === "Vacant (All)" || position.vacancyStatus === "Vacant (Some)")
  );
  if (pausedVacant.length > 0) {
    alerts.push({
      severity: "warning",
      message: `${pausedVacant.length} vacant positions are paused - pipeline has stalled`,
    });
  }

  if (funnel.tg > 30 && funnel.trial < 5) {
    alerts.push({
      severity: "warning",
      message: `High TG volume (${funnel.tg}) but low Trial conversion - review screening process`,
    });
  }

  if (funnel.onboard > 0) {
    alerts.push({
      severity: "info",
      message: `${funnel.onboard} candidate(s) currently onboarding`,
    });
  }

  return alerts.slice(0, 4);
}

export function getFunnelInsight(positions: Position[]) {
  const funnel = getFunnelTotals(positions);
  const yieldPct = funnel.tg > 0 ? ((funnel.onboard / funnel.tg) * 100).toFixed(1) : "0.0";
  return `End-to-end yield: ${yieldPct}% - only ${funnel.onboard} of ${funnel.tg} TG candidates reach onboarding`;
}

export function getConversions(positions: Position[]) {
  const funnel = getFunnelTotals(positions);
  const convert = (from: number, to: number) => (from > 0 ? Math.round((to / from) * 100) : 0);

  const items = [
    { label: "TG -> Trial", value: `${convert(funnel.tg, funnel.trial)}% conversion` },
    { label: "Trial -> Contract", value: `${convert(funnel.trial, funnel.contract)}% conversion` },
    { label: "Contract -> Onboard", value: `${convert(funnel.contract, funnel.onboard)}% conversion` },
    {
      label: "End-to-end yield",
      value: `${funnel.tg > 0 ? ((funnel.onboard / funnel.tg) * 100).toFixed(1) : "0.0"}%`,
    },
  ];

  const insights: string[] = [];
  if (funnel.tg > 30 && funnel.trial < 10) {
    insights.push(
      "High volume at TG but low Trial conversion suggests screening or scheduling bottlenecks. Review TG-to-Trial process."
    );
  }
  if (funnel.onboard > funnel.contract) {
    insights.push(
      "More candidates onboarding than contracted - data may be out of sync. Review contract and onboard counts."
    );
  }

  return { funnel, items, insights };
}

export function getPriorityBuckets(contractors: Contractor[]) {
  return {
    "P.01": contractors.filter((contractor) => contractor.priority === "P.01"),
    "P.02": contractors.filter((contractor) => contractor.priority === "P.02"),
    "P.03": contractors.filter((contractor) => contractor.priority === "P.03"),
    "P.04": contractors.filter((contractor) => contractor.priority === "P.04"),
  };
}

export function getInitiativeBreakdown(contractors: Contractor[]) {
  return Object.values(
    contractors.reduce((acc, contractor) => {
      const key = contractor.initiative || "Unassigned";
      acc[key] = { initiative: key, count: (acc[key]?.count || 0) + 1 };
      return acc;
    }, {} as Record<string, { initiative: string; count: number }>)
  ).sort((left, right) => right.count - left.count);
}

export function getLastUpdatedState(lastUpdated: string) {
  const minutesAgo = Math.max(0, differenceInMinutes(new Date(), new Date(lastUpdated)));
  return {
    isStale: minutesAgo > 5,
    label: minutesAgo < 1 ? "Last updated just now" : `Last updated ${minutesAgo} min ago`,
  };
}
