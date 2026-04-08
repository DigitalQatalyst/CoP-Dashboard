import { NextResponse } from "next/server";
import { fetchExcelRange } from "@/lib/graph";
import { transformPositions } from "@/lib/transform";

export async function GET() {
  try {
    const raw = await fetchExcelRange("CoP 2026", "A41:V80");

    if (!raw || raw.length < 2) {
      return NextResponse.json({ error: "No data returned" }, { status: 500 });
    }

    const data = transformPositions(raw);
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "no-store",
        "X-Last-Fetched": new Date().toISOString(),
      },
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
