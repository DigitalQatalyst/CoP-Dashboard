import type { Position, VacancyStatus, CardStatus, Studio } from '@/data/positions';

interface ExcelRow {
  [key: string]: string | number | undefined;
}

function str(val: unknown): string {
  return val != null ? String(val).trim() : '';
}

function num(val: unknown): number {
  const n = Number(val);
  return isNaN(n) ? 0 : n;
}

function parseVacancy(val: unknown): VacancyStatus {
  const s = str(val).toLowerCase();
  if (s.includes('all')) return 'Vacant (All)';
  if (s.includes('some')) return 'Vacant (Some)';
  if (s.includes('over')) return 'Over';
  return 'Filled';
}

function parseCardStatus(val: unknown): CardStatus {
  const s = str(val).toLowerCase();
  if (s.includes('pause') || s.includes('hold')) return 'Paused';
  if (s.includes('close')) return 'Closed';
  return 'Active';
}

function parseStudio(val: unknown): Studio {
  const s = str(val).toUpperCase().trim();
  if (s.includes('DXB') && s.includes('NBO')) return 'NBO | DXB';
  if (s.includes('DXB')) return 'DXB';
  return 'NBO';
}

export function parseSharePointExcel(input: string): Position[] {
  try {
    const jsonData = JSON.parse(input);
    if (Array.isArray(jsonData)) return parseFromJsonArray(jsonData);
  } catch {
    // Not JSON, continue with CSV
  }

  const lines = input.split('\n');
  if (lines.length < 2) return [];

  const delimiter = lines[0].includes('\t') ? '\t' : ',';
  const headers = lines[0].split(delimiter).map(h => h.trim().replace(/^"|"$/g, ''));
  const positions: Position[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const values = line.split(delimiter).map(v => v.trim().replace(/^"|"$/g, ''));
    const row: ExcelRow = {};
    headers.forEach((header, index) => { row[header] = values[index] || ''; });
    const p = parseRowToPosition(row, i);
    if (p) positions.push(p);
  }

  return positions;
}

function parseFromJsonArray(jsonData: ExcelRow[]): Position[] {
  return jsonData
    .map((row, i) => parseRowToPosition(row, i + 1))
    .filter((p): p is Position => p !== null);
}

function parseRowToPosition(row: ExcelRow, index: number): Position | null {
  const position = str(row['Position'] || row['__EMPTY_1']);
  if (!position) return null;

  const tg       = num(row['TG']        || row['__EMPTY_15']);
  const trial    = num(row['Trial']     || row['__EMPTY_16']);
  const contract = num(row['Contract']  || row['__EMPTY_17']);
  const onboard  = num(row['Onboard']   || row['__EMPTY_18']);
  const backlogged = num(row['Backlogged'] || row['__EMPTY_19']);
  const total    = num(row['Total']     || row['__EMPTY_20']) || (tg + trial + contract + onboard);

  return {
    id: num(row['#'] || row['__EMPTY']) || index,
    position,
    persona: str(row['Core Skills (Persona)'] || row['__EMPTY_2']),
    behaviouralValues: str(row['Core Skills (Top 5 Behavioural Values)'] || row['__EMPTY_3']),
    technicalSkills: str(row['Core Skills (Technical  | Required Tools)'] || row['__EMPTY_4']),
    preferredYrsExp: str(row['Preferred Yrs Exp'] || row['__EMPTY_5']),
    buPracticeTower: str(row['DQ2.0 (BU | Practices | Towers)'] || row['__EMPTY_7']),
    studio: parseStudio(row['DQ Studio'] || row['__EMPTY_8']),
    hiringStrategy: str(row['Hiring Strategy'] || row['__EMPTY_9']).includes('Promote') ? 'Promote' : 'Hire',
    actualYTD: num(row['# Actual (YTD26.02)'] || row['__EMPTY_10']),
    planFYE: num(row['# Plan (FYE2026)']  || row['__EMPTY_11']),
    actualPrior: num(row['# Actual (YTD26.01)'] || row['__EMPTY_12']),
    planYTD: num(row['# Plan (YTD26.02)'] || row['__EMPTY_13']),
    vacancyStatus: parseVacancy(row['Vacancy (Status)'] || row['__EMPTY_14']),
    pipeline: { tg, trial, contract, onboard, backlogged, total },
    cardStatus: parseCardStatus(row['Card Status'] || row['__EMPTY_21']),
  };
}
