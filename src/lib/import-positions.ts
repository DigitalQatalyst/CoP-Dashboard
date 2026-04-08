import Papa from "papaparse";
import * as XLSX from "xlsx";
import type { Position, VacancyStatus, CardStatus, Studio } from "@/data/positions";

interface RawRow {
  [key: string]: string | number | undefined;
}

function normalizeKey(key: string): string {
  return key.trim().toLowerCase().replace(/[\s/]+/g, "_");
}

function str(val: unknown): string {
  return val != null ? String(val).trim() : "";
}

function num(val: unknown): number {
  const n = Number(val);
  return isNaN(n) ? 0 : n;
}

function parseVacancy(val: unknown): VacancyStatus {
  const s = str(val).toLowerCase();
  if (s.includes("all")) return "Vacant (All)";
  if (s.includes("some")) return "Vacant (Some)";
  if (s.includes("over")) return "Over";
  return "Filled";
}

function parseCardStatus(val: unknown): CardStatus {
  const s = str(val).toLowerCase();
  if (s.includes("pause")) return "Paused";
  if (s.includes("hold")) return "Paused";
  if (s.includes("close")) return "Closed";
  return "Active";
}

function parseStudio(val: unknown): Studio {
  const s = str(val).toUpperCase().trim();
  if (s.includes("DXB") && s.includes("NBO")) return "NBO | DXB";
  if (s.includes("DXB")) return "DXB";
  return "NBO";
}

function findCol(row: RawRow, ...candidates: string[]): unknown {
  for (const c of candidates) {
    const norm = normalizeKey(c);
    for (const key of Object.keys(row)) {
      if (normalizeKey(key).includes(norm)) return row[key];
    }
  }
  return undefined;
}

function rowToPosition(row: RawRow, index: number): Position {
  const tg       = num(findCol(row, "tg", "target_gateway"));
  const trial    = num(findCol(row, "trial"));
  const contract = num(findCol(row, "contract"));
  const onboard  = num(findCol(row, "onboard"));
  const backlog  = num(findCol(row, "backlog", "backlogged"));
  const total    = num(findCol(row, "total_pipeline", "pipeline_total")) || tg + trial + contract + onboard;

  return {
    id: num(findCol(row, "id", "#")) || index + 1000,
    position: str(findCol(row, "position", "role", "title")),
    persona: str(findCol(row, "persona", "archetype", "core_skills_(persona)")),
    behaviouralValues: str(findCol(row, "behavioural", "values", "behaviour")),
    technicalSkills: str(findCol(row, "technical", "skills")),
    preferredYrsExp: str(findCol(row, "yrs", "experience", "exp", "preferred")),
    buPracticeTower: str(findCol(row, "bu", "practice", "tower", "dq2.0")),
    studio: parseStudio(findCol(row, "studio", "dq_studio")),
    hiringStrategy: (str(findCol(row, "hiring", "strategy")).includes("Promote") ? "Promote" : "Hire"),
    actualYTD: num(findCol(row, "actual_ytd", "actual_(ytd26")),
    planFYE: num(findCol(row, "plan_fye", "plan_(fye", "fye")),
    actualPrior: num(findCol(row, "actual_prior", "actual_(ytd26.01")),
    planYTD: num(findCol(row, "plan_ytd", "plan_(ytd")),
    vacancyStatus: parseVacancy(findCol(row, "vacancy")),
    pipeline: { tg, trial, contract, onboard, backlogged: backlog, total },
    cardStatus: parseCardStatus(findCol(row, "card_status", "card")),
  };
}

export function parseCSV(text: string): Position[] {
  const result = Papa.parse<RawRow>(text, { header: true, skipEmptyLines: true });
  return result.data
    .map((row, i) => rowToPosition(row, i))
    .filter((p) => p.position.length > 0);
}

export function parseExcel(buffer: ArrayBuffer): Position[] {
  const wb = XLSX.read(buffer, { type: "array" });
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<RawRow>(sheet, { defval: "" });
  return rows
    .map((row, i) => rowToPosition(row, i))
    .filter((p) => p.position.length > 0);
}
