export type VacancyStatus =
  | "Filled"
  | "Vacant (All)"
  | "Vacant (Some)"
  | "Interim"
  | "Departing"
  | "TBC";

export type CardStatus = "Active" | "Paused" | "Closed";
export type UrgencyTier = "critical" | "attention" | "healthy";
export type Studio = "NBO" | "DXB" | "NBO | DXB";

export interface PipelineStages {
  tg: number;
  trial: number;
  contract: number;
  onboard: number;
  backlog: number;
  total: number;
}

export interface Position {
  id: string;
  name: string;
  persona: string;
  behaviouralValues: string;
  technicalSkills: string;
  minExperience: string;
  buTower: string;
  studio: Studio;
  hiringStrategy: string;
  actualYTD: number;
  planFYE: number;
  actualPrior: number;
  planYTD: number;
  vacancyStatus: VacancyStatus;
  pipeline: PipelineStages;
  cardStatus: CardStatus;
  urgencyTier: UrgencyTier;
  headcountGap: number;
  hasActivePipeline: boolean;
}

export interface CoPSummary {
  totalPositions: number;
  planFYE: number;
  actualYTD: number;
  fillRate: number;
  totalPipeline: number;
  atRiskCount: number;
  lastUpdated: string;
}

export interface CoPData {
  summary: CoPSummary;
  positions: Position[];
}

export type ContractorStatus =
  | "Candidates (Searching)"
  | "Candidates (Interviews)"
  | "Candidates (Selected)"
  | "Candidates (Offers)"
  | "Candidates (Onboarding)"
  | "Candidates (Closed)"
  | "Pending Deal Status";

export type ContractorPriority = "P.01" | "P.02" | "P.03" | "P.04";

export type ContractorLocation =
  | "Offshore"
  | "Hybrid"
  | "Remote"
  | "Onshore"
  | "KSA"
  | "Blended"
  | "TBC";

export interface Contractor {
  id: string;
  name: string;
  behaviouralCompetencies: string;
  technicalCompetencies: string;
  serviceCompetencies: string;
  initiative: string;
  sourcing: string;
  minYears: number;
  sfiaLevel: string;
  duration: string;
  location: ContractorLocation;
  targetStart: string;
  taskBacklog: string;
  priority: ContractorPriority;
  status: ContractorStatus;
  ownerRequisition: string;
  ownerSourcing: string;
  ownerOnboarding: string;
}

export interface ContractorSummary {
  total: number;
  byPriority: Record<ContractorPriority, number>;
  byStatus: Record<string, number>;
  byLocation: Record<ContractorLocation, number>;
}

export interface ContractorData {
  summary: ContractorSummary;
  contractors: Contractor[];
}
