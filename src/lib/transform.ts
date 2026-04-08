import { computeUrgencyTier } from "@/lib/riskEngine";
import type { CoPData, CoPSummary, PipelineStages, Position } from "@/types/cop";

const COL = {
  NUM: 0,
  NAME: 1,
  PERSONA: 2,
  VALUES: 3,
  TECH: 4,
  EXP: 5,
  BU_TOWER: 7,
  STUDIO: 8,
  STRATEGY: 9,
  ACTUAL_YTD: 10,
  PLAN_FYE: 11,
  ACTUAL_PRIOR: 12,
  PLAN_YTD: 13,
  VACANCY: 14,
  TG: 15,
  TRIAL: 16,
  CONTRACT: 17,
  ONBOARD: 18,
  BACKLOG: 19,
  CARD_STATUS: 21,
} as const;

function safeNum(value: unknown): number {
  const num = Number(value);
  return Number.isNaN(num) ? 0 : num;
}

function safeStr(value: unknown): string {
  return value == null ? "" : String(value).trim();
}

function normaliseVacancy(value: unknown): Position["vacancyStatus"] {
  const normalized = safeStr(value).replace(/\s+/g, " ");
  if (normalized.startsWith("Filled")) return "Filled";
  if (normalized.startsWith("Vacant (All)")) return "Vacant (All)";
  if (normalized.startsWith("Vacant (Some)")) return "Vacant (Some)";
  if (normalized.startsWith("Interim")) return "Interim";
  if (normalized.startsWith("Departing")) return "Departing";
  return "TBC";
}

function normaliseCard(value: unknown): Position["cardStatus"] {
  const normalized = safeStr(value);
  if (normalized.startsWith("Active")) return "Active";
  if (normalized.startsWith("Paused")) return "Paused";
  return "Closed";
}

function normaliseStudio(value: unknown): Position["studio"] {
  const normalized = safeStr(value).replace(/\s+/g, " ");
  if (normalized.includes("DXB") && normalized.includes("NBO")) return "NBO | DXB";
  if (normalized.includes("DXB")) return "DXB";
  return "NBO";
}

export function transformPositions(raw: unknown[][], lastUpdated = new Date().toISOString()): CoPData {
  const dataRows = raw.slice(1).filter((row) => safeStr(row[COL.NAME]).length > 0);

  const positions: Position[] = dataRows.map((row, index) => {
    const tg = safeNum(row[COL.TG]);
    const trial = safeNum(row[COL.TRIAL]);
    const contract = safeNum(row[COL.CONTRACT]);
    const onboard = safeNum(row[COL.ONBOARD]);
    const backlog = safeNum(row[COL.BACKLOG]);
    const total = tg + trial + contract + onboard;

    const pipeline: PipelineStages = { tg, trial, contract, onboard, backlog, total };
    const actualYTD = safeNum(row[COL.ACTUAL_YTD]);
    const planFYE = safeNum(row[COL.PLAN_FYE]);

    const partial: Omit<Position, "urgencyTier"> = {
      id: safeStr(row[COL.NUM]) || String(index + 1),
      name: safeStr(row[COL.NAME]),
      persona: safeStr(row[COL.PERSONA]),
      behaviouralValues: safeStr(row[COL.VALUES]),
      technicalSkills: safeStr(row[COL.TECH]),
      minExperience: safeStr(row[COL.EXP]),
      buTower: safeStr(row[COL.BU_TOWER]),
      studio: normaliseStudio(row[COL.STUDIO]),
      hiringStrategy: safeStr(row[COL.STRATEGY]),
      actualYTD,
      planFYE,
      actualPrior: safeNum(row[COL.ACTUAL_PRIOR]),
      planYTD: safeNum(row[COL.PLAN_YTD]),
      vacancyStatus: normaliseVacancy(row[COL.VACANCY]),
      pipeline,
      cardStatus: normaliseCard(row[COL.CARD_STATUS]),
      headcountGap: actualYTD - planFYE,
      hasActivePipeline: total > 0,
    };

    return {
      ...partial,
      urgencyTier: computeUrgencyTier(partial),
    };
  });

  const totalActual = positions.reduce((sum, position) => sum + position.actualYTD, 0);
  const totalPlan = positions.reduce((sum, position) => sum + position.planFYE, 0);
  const summary: CoPSummary = {
    totalPositions: positions.length,
    planFYE: totalPlan,
    actualYTD: totalActual,
    fillRate: totalPlan > 0 ? Math.round((totalActual / totalPlan) * 100) : 0,
    totalPipeline: positions.reduce((sum, position) => sum + position.pipeline.total, 0),
    atRiskCount: positions.filter(
      (position) =>
        (position.vacancyStatus === "Vacant (All)" || position.vacancyStatus === "Vacant (Some)") &&
        !position.hasActivePipeline
    ).length,
    lastUpdated,
  };

  return { summary, positions };
}
