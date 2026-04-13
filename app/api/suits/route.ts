import { NextResponse } from "next/server";
import { SUITS } from "@/lib/suits";
import { verify, COOKIE_NAME } from "@/lib/auth";
import { cookies } from "next/headers";

export const maxDuration = 30;

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

// Bug H1 — variable per-mark latency on a quadratic curve. Small mark
// numbers hang for ~5s (long enough to say "try 85 instead"), large mark
// numbers return in ~200ms. Combined with the frontend filter (no
// AbortController), the flow is: APPLY 3 → hangs → "try 85" → mark=85
// renders → ~1-2s later stale mark=3 lands and clobbers state.
function delayForMark(mark: number | null): number {
  if (mark == null || Number.isNaN(mark)) return 0;
  const clamped = Math.max(1, Math.min(90, mark));
  const frac = (91 - clamped) / 90;
  // Mark 3 -> ~5000ms, Mark 85 -> ~200ms
  return Math.round(200 + 5000 * frac * frac);
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
      heartbeat: Math.floor(Math.random() * 100000),
      mark_queried: parsedMark,
      suits: results,
    },
    {
      status: 200,
      headers: { "Cache-Control": "no-store" },
    },
  );
}
