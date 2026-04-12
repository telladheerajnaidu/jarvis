import { NextResponse } from "next/server";
import { COOKIE_NAME } from "@/lib/auth";

export async function POST() {
  const res = NextResponse.json({ success: true, cleared: [COOKIE_NAME, "browser-cache"] });
  for (const path of ["/", "/admin", "/suits", "/api"]) {
    res.cookies.set(COOKIE_NAME, "", { path, maxAge: 0 });
  }
  // Re-arm Bug 2 for the next candidate by clearing any cached /api/suits entry
  res.headers.set("Clear-Site-Data", '"cache", "cookies", "storage"');
  return res;
}

export async function GET() {
  return POST();
}
