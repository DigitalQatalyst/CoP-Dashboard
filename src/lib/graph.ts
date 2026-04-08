import { mockContractorRawRange, mockCopRawRange } from "@/lib/mockData";

const GRAPH_BASE = "https://graph.microsoft.com/v1.0";
const DRIVE_ID = process.env.ONEDRIVE_DRIVE_ID;
const FILE_ID = process.env.ONEDRIVE_FILE_ID;
const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK_DATA !== "false";

export async function getAccessToken(): Promise<string> {
  if (USE_MOCK) {
    return "mock-access-token";
  }

  const token = process.env.GRAPH_ACCESS_TOKEN;
  if (!token) {
    throw new Error("GRAPH_UNAUTHORIZED");
  }
  return token;
}

export async function fetchExcelRange(sheetName: string, range: string): Promise<unknown[][]> {
  if (USE_MOCK) {
    if (sheetName === "CoP 2026" && range === "A41:V80") return mockCopRawRange;
    if (sheetName === "CoP.02 (Contractors)" && range === "A26:AB79") return mockContractorRawRange;
    return [];
  }

  if (!DRIVE_ID || !FILE_ID) {
    throw new Error("GRAPH_FORBIDDEN");
  }

  const token = await getAccessToken();
  const encodedSheet = encodeURIComponent(sheetName);
  const url = `${GRAPH_BASE}/drives/${DRIVE_ID}/items/${FILE_ID}/workbook/worksheets/${encodedSheet}/ranges(address='${range}')`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (res.status === 401) throw new Error("GRAPH_UNAUTHORIZED");
  if (res.status === 403) throw new Error("GRAPH_FORBIDDEN");
  if (!res.ok) throw new Error(`GRAPH_ERROR_${res.status}`);

  const data = (await res.json()) as { values?: unknown[][] };
  return data.values || [];
}
