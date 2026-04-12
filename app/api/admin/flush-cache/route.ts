import { NextResponse } from "next/server";

// Interviewer / candidate escape hatch for bug M1.
// Returns Clear-Site-Data: "storage" which instructs the browser to purge
// localStorage, sessionStorage, IndexedDB etc. for this origin. After
// hitting this, the gallery's localStorage cache entry is gone and the
// next /api/suits fetch lands on the network for a fresh server_timestamp.
export async function POST() {
  const res = NextResponse.json({
    success: true,
    cleared: ["browser-cache", "browser-storage"],
    note: 'Clear-Site-Data: "cache", "storage" returned.',
  });
  res.headers.set("Clear-Site-Data", '"cache", "storage"');
  return res;
}

export async function GET() {
  return POST();
}
