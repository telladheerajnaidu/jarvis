import { NextResponse } from "next/server";
import { SUITS } from "@/lib/suits";
import { verify, COOKIE_NAME } from "@/lib/auth";
import { cookies } from "next/headers";

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
  if (markParam && markParam.trim().length > 0) {
    const n = Number(markParam);
    results = SUITS.filter((s) => s.mark === n);
  }

  return NextResponse.json({ success: true, count: results.length, suits: results });
}
