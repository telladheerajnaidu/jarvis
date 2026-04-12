import { NextResponse } from "next/server";
import { COOKIE_NAME, USERS, sign } from "@/lib/auth";

// Interviewer-only: skip past L1 and L3 by minting a valid session cookie
// scoped at Path=/ for tony@stark.com. Use when you've already validated
// those bugs and want to proceed to S5 / S4 / S1 without a redeploy.
export async function POST() {
  const tony = USERS[0];
  const token = sign({ email: tony.email, name: tony.name });
  const res = NextResponse.json({
    success: true,
    granted: { email: tony.email, path: "/" },
    note: "L1 and L3 bypassed — session cookie issued at Path=/",
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
