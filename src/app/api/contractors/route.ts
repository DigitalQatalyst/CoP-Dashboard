import { NextResponse } from "next/server";
import { fetchExcelRange } from "@/lib/graph";
import { transformContractors } from "@/lib/transformContractors";

export async function GET() {
  try {
    const raw = await fetchExcelRange("CoP.02 (Contractors)", "A26:AB79");

    if (!raw || raw.length < 2) {
      return NextResponse.json({ error: "No contractor data" }, { status: 500 });
    }

    const data = transformContractors(raw);
    return NextResponse.json(data, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "UNKNOWN";
    if (message === "GRAPH_UNAUTHORIZED") {
      return NextResponse.json({ error: "Session expired" }, { status: 401 });
    }
    if (message === "GRAPH_FORBIDDEN") {
      return NextResponse.json({ error: "No file access" }, { status: 403 });
    }
    return NextResponse.json({ error: "Fetch failed" }, { status: 500 });
  }
}
