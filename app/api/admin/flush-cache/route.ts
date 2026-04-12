import { NextResponse } from "next/server";

// Interviewer / candidate escape hatch for bug M1.
// Returns the Clear-Site-Data header with "cache", which instructs the
// browser to drop its HTTP cache for this origin. After hitting this,
// the next /api/suits request bypasses the immutable cache entry and
// a fresh server_timestamp is rendered on the gallery.
export async function POST() {
  const res = NextResponse.json({
    success: true,
    cleared: ["browser-cache"],
    note: "Clear-Site-Data: cache header returned. Next /api/suits fetch will hit the server.",
  });
  res.headers.set("Clear-Site-Data", '"cache"');
  return res;
}

export async function GET() {
  return POST();
}
