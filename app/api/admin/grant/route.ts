import { NextResponse } from "next/server";
import { COOKIE_NAME, USERS, sign } from "@/lib/auth";

// Interviewer-only: skip past Bug 1 by minting a valid session cookie
// scoped at Path=/ for the primary user. Use when you've already validated
// the login bug and want to jump straight into /suits without a redeploy.
export async function POST() {
  const primary = USERS[0];
  const token = sign({ email: primary.email, name: primary.name });
  const res = NextResponse.json({
    success: true,
    granted: { email: primary.email, path: "/" },
    note: "login bug bypassed — session cookie issued at Path=/",
  });
  // Clear the broken one first
  for (const path of ["/admin", "/suits", "/api"]) {
    res.cookies.set(COOKIE_NAME, "", { path, maxAge: 0 });
  }
  res.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
  return res;
}

export async function GET() {
  return POST();
}
