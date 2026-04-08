import type {
  Contractor,
  ContractorData,
  ContractorLocation,
  ContractorPriority,
  ContractorStatus,
  ContractorSummary,
} from "@/types/cop";

const COL = {
  NUM: 0,
  NAME: 1,
  BEHAVIOUR: 2,
  TECH: 3,
  SERVICE: 4,
  INITIATIVE: 5,
  SOURCING: 6,
  MIN_YEARS: 9,
  SFIA: 10,
  DURATION: 11,
  LOCATION: 12,
  TARGET_START: 13,
  BACKLOG: 14,
  PRIORITY: 16,
  STATUS: 17,
  OWNER_REQ: 24,
  OWNER_SRC: 25,
  OWNER_ONB: 26,
} as const;

function normalisePriority(value: unknown): ContractorPriority {
  const normalized = String(value || "").trim();
  if (normalized.startsWith("P.01")) return "P.01";
  if (normalized.startsWith("P.02")) return "P.02";
  if (normalized.startsWith("P.03")) return "P.03";
  return "P.04";
}

function normaliseStatus(value: unknown): ContractorStatus {
  const normalized = String(value || "").trim();
  if (normalized.includes("Searching")) return "Candidates (Searching)";
  if (normalized.includes("Interviews")) return "Candidates (Interviews)";
  if (normalized.includes("Selected")) return "Candidates (Selected)";
  if (normalized.includes("Offers")) return "Candidates (Offers)";
  if (normalized.includes("Onboarding")) return "Candidates (Onboarding)";
  if (normalized.includes("Closed")) return "Candidates (Closed)";
  return "Pending Deal Status";
}

function normaliseLocation(value: unknown): ContractorLocation {
  const normalized = String(value || "").trim();
  const map: Record<string, ContractorLocation> = {
    Offshore: "Offshore",
    Hybrid: "Hybrid",
    Remote: "Remote",
    Onshore: "Onshore",
    KSA: "KSA",
    Blended: "Blended",
  };
  return map[normalized] || "TBC";
}

export function transformContractors(raw: unknown[][]): ContractorData {
  const dataRows = raw.slice(1).filter((row) => String(row[COL.NAME] || "").trim().length > 0);

  const contractors: Contractor[] = dataRows.map((row, index) => ({
    id: String(row[COL.NUM] || index + 1),
    name: String(row[COL.NAME] || "").trim(),
    behaviouralCompetencies: String(row[COL.BEHAVIOUR] || "").trim(),
    technicalCompetencies: String(row[COL.TECH] || "").trim(),
    serviceCompetencies: String(row[COL.SERVICE] || "").trim(),
    initiative: String(row[COL.INITIATIVE] || "").trim(),
    sourcing: String(row[COL.SOURCING] || "").trim(),
    minYears: Number(row[COL.MIN_YEARS]) || 0,
    sfiaLevel: String(row[COL.SFIA] || "").trim(),
    duration: String(row[COL.DURATION] || "").trim(),
    location: normaliseLocation(row[COL.LOCATION]),
    targetStart: String(row[COL.TARGET_START] || "").trim(),
    taskBacklog: String(row[COL.BACKLOG] || "").trim(),
    priority: normalisePriority(row[COL.PRIORITY]),
    status: normaliseStatus(row[COL.STATUS]),
    ownerRequisition: String(row[COL.OWNER_REQ] || "").trim(),
    ownerSourcing: String(row[COL.OWNER_SRC] || "").trim(),
    ownerOnboarding: String(row[COL.OWNER_ONB] || "").trim(),
  }));

  const byPriority: Record<ContractorPriority, number> = {
    "P.01": 0,
    "P.02": 0,
    "P.03": 0,
    "P.04": 0,
  };

  const byStatus: Record<string, number> = {};
  const byLocation: Record<ContractorLocation, number> = {
    Offshore: 0,
    Hybrid: 0,
    Remote: 0,
    Onshore: 0,
    KSA: 0,
    Blended: 0,
    TBC: 0,
  };

  contractors.forEach((contractor) => {
    byPriority[contractor.priority] += 1;
    byStatus[contractor.status] = (byStatus[contractor.status] || 0) + 1;
    byLocation[contractor.location] += 1;
  });

  const summary: ContractorSummary = {
    total: contractors.length,
    byPriority,
    byStatus,
    byLocation,
  };

  return { summary, contractors };
}
