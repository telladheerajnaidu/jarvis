import { NextResponse } from "next/server";
import { SUITS } from "@/lib/suits";
import { verify, COOKIE_NAME } from "@/lib/auth";
import { cookies } from "next/headers";

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

// Bug H1 — variable per-mark latency. Small mark numbers are intentionally
// very slow (~4.5s), large mark numbers respond fast (~120ms). Combined
// with the frontend filter (which has no AbortController), rapid APPLY
// clicks produce out-of-order responses: the final response to arrive
// wins, even if the user's last query was different.
function delayForMark(mark: number | null): number {
  if (mark == null || Number.isNaN(mark)) return 0;
  const clamped = Math.max(1, Math.min(90, mark));
  // Mark 3  -> ~4400ms, Mark 85 -> ~170ms
  return Math.round(4500 - (clamped / 90) * 4400);
}

export async function GET(req: Request) {
  const token = cookies().get(COOKIE_NAME)?.value;
  const session = verify(token);
  if (!session) {
    return NextResponse.json(
      {
        success: false,
        error: "UNAUTHORIZED",
        detail: "no valid session cookie reached this endpoint",
      },
      { status: 401 },
    );
  }

  const { searchParams } = new URL(req.url);
  const markParam = searchParams.get("mark");

  let results = SUITS;
  let parsedMark: number | null = null;
  if (markParam && markParam.trim().length > 0) {
    parsedMark = Number(markParam);
    results = SUITS.filter((s) => s.mark === parsedMark);
  }

  await sleep(delayForMark(parsedMark));

  return NextResponse.json(
    {
      success: true,
      count: results.length,
      server_timestamp: new Date().toISOString(),
      mark_queried: parsedMark,
      suits: results,
    },
    {
      status: 200,
      headers: { "Cache-Control": "no-store" },
    },
  );
}
