import { NextResponse } from "next/server";
import { SUITS } from "@/lib/suits";
import { verify, COOKIE_NAME } from "@/lib/auth";
import { cookies } from "next/headers";

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

// Bug H1 — variable per-mark latency. Small mark numbers are intentionally slow,
// large mark numbers respond fast. Combined with the frontend filter (which has
// no AbortController), rapid APPLY clicks produce out-of-order responses:
// the final response to arrive wins, even if the user's last query was different.
function delayForMark(mark: number | null): number {
  if (mark == null || Number.isNaN(mark)) return 0;
  // Mark 3  -> ~2400ms, Mark 85 -> ~60ms, roughly inverse
  const clamped = Math.max(1, Math.min(90, mark));
  return Math.round(2500 - (clamped / 90) * 2400);
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

  // H1 — intentional per-mark latency
  await sleep(delayForMark(parsedMark));

  const body = {
    success: true,
    count: results.length,
    server_timestamp: new Date().toISOString(),
    mark_queried: parsedMark,
    suits: results,
  };

  // Bug M1 — overly aggressive caching. This response is served with
  // `public, max-age=86400, immutable` so the browser reuses the first
  // payload for 24h without revalidation. The "RESYNC TELEMETRY" button
  // on the gallery cannot bring in a fresh server_timestamp until the
  // cache is cleared (see /api/admin/flush-cache).
  return new NextResponse(JSON.stringify(body), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=86400, immutable",
    },
  });
}
