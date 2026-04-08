import { positions as seedPositions } from "@/data/positions";
import { contractors as seedContractors } from "@/data/contractors";
import { transformPositions } from "@/lib/transform";
import { transformContractors } from "@/lib/transformContractors";
import type { ContractorData, CoPData } from "@/types/cop";

const MOCK_LAST_UPDATED = "2026-04-08T09:30:00.000Z";
const OWNER_REQUISITION = ["Mercy Wangare", "Lorna Ali", "Brian Njoroge", "Nadia Hassan"];
const OWNER_SOURCING = ["Janet Otieno", "Ali Rashid", "Kevin Mwangi", "Maya Al Falasi"];
const OWNER_ONBOARDING = ["Diana Noor", "Eric Mwenda", "Moses Kariuki", "Fatima Saleh"];

function buildCopRawRange(): unknown[][] {
  const header = [
    "#",
    "Position name",
    "Persona",
    "Behavioural values",
    "Technical skills",
    "Preferred experience",
    "Demand card link",
    "BU / Practices / Tower",
    "DQ Studio",
    "Hiring strategy",
    "# Actual (YTD26.02)",
    "# Plan (FYE2026)",
    "# Actual (YTD26.01)",
    "# Plan (YTD26.02)",
    "Vacancy status",
    "TG count",
    "Trial count",
    "Contract count",
    "Onboard count",
    "Backlog count",
    "Total pipeline",
    "Card status",
  ];

  const rows = seedPositions.map((position) => [
    position.id,
    position.position,
    position.persona,
    position.behaviouralValues,
    position.technicalSkills,
    position.preferredYrsExp,
    "",
    position.buPracticeTower,
    position.studio,
    position.hiringStrategy,
    position.actualYTD,
    position.planFYE,
    position.actualPrior,
    position.planYTD,
    position.vacancyStatus,
    position.pipeline.tg,
    position.pipeline.trial,
    position.pipeline.contract,
    position.pipeline.onboard,
    position.pipeline.backlogged,
    position.pipeline.total,
    position.cardStatus,
  ]);

  return [header, ...rows];
}

function buildContractorRawRange(): unknown[][] {
  const header = [
    "#",
    "Position name",
    "Behavioural competencies",
    "Technical competencies",
    "Service competencies",
    "Initiative",
    "Sourcing",
    "Spoken English",
    "Written English",
    "Min years",
    "SFIA Level",
    "Duration",
    "Location",
    "Target start",
    "Task backlog",
    "Proposed rate",
    "Priority",
    "Status",
    "Option A",
    "Option B",
    "",
    "",
    "",
    "",
    "Owner Requisition",
    "Owner Sourcing",
    "Owner Onboarding",
  ];

  const rows = seedContractors.map((contractor, index) => [
    contractor.id,
    contractor.position,
    contractor.behaviour,
    contractor.technology,
    contractor.services,
    contractor.initiative,
    contractor.sourcing,
    contractor.spokenEnglish,
    contractor.writtenEnglish,
    contractor.minYears,
    contractor.sfiaLevel,
    contractor.duration,
    contractor.location,
    contractor.targetStart,
    contractor.taskBacklog,
    "",
    contractor.priority,
    contractor.hiringStatus,
    "",
    "",
    "",
    "",
    "",
    "",
    OWNER_REQUISITION[index % OWNER_REQUISITION.length],
    OWNER_SOURCING[index % OWNER_SOURCING.length],
    OWNER_ONBOARDING[index % OWNER_ONBOARDING.length],
  ]);

  return [header, ...rows];
}

export const mockCopRawRange = buildCopRawRange();
export const mockContractorRawRange = buildContractorRawRange();

export function getMockCopData(): CoPData {
  return transformPositions(mockCopRawRange, MOCK_LAST_UPDATED);
}

export function getMockContractorData(): ContractorData {
  return transformContractors(mockContractorRawRange);
}
