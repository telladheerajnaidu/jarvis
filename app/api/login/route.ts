import { NextResponse } from "next/server";
import { USERS, sign, COOKIE_NAME } from "@/lib/auth";

export async function POST(req: Request) {
  const { email, password } = await req.json();

  const user = USERS.find((u) => u.email === email && u.password === password);

  if (!user) {
    const caseInsensitiveMatch = USERS.find(
      (u) =>
        u.email.toLowerCase() === String(email || "").toLowerCase() &&
        u.password === password,
    );
    return NextResponse.json(
      {
        success: false,
        error: "INVALID_CREDENTIALS",
        detail: caseInsensitiveMatch
          ? "EMAIL_CASE_MISMATCH: email comparison is case-sensitive on the server"
          : "no user matched provided credentials",
      },
      { status: 200 },
    );
  }

  const token = sign({ email: user.email, name: user.name });
  const res = NextResponse.json({ success: true, user: { email: user.email, name: user.name } });
  res.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
  return res;
}
