import { NextResponse } from "next/server";
import { COOKIE_NAME } from "@/lib/auth";

export async function POST() {
  const res = NextResponse.json({ success: true, cleared: [COOKIE_NAME] });
  for (const path of ["/", "/admin", "/suits", "/api"]) {
    res.cookies.set(COOKIE_NAME, "", { path, maxAge: 0 });
  }
  return res;
}

export async function GET() {
  return POST();
}
