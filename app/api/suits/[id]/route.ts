import { NextResponse } from "next/server";
import { SUITS } from "@/lib/suits";
import { verify, COOKIE_NAME } from "@/lib/auth";
import { cookies } from "next/headers";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const token = cookies().get(COOKIE_NAME)?.value;
  const session = verify(token);
  if (!session) {
    return NextResponse.json({ success: false, error: "UNAUTHORIZED" }, { status: 401 });
  }
  const suit = SUITS.find((s) => s.id === params.id);
  if (!suit) {
    return NextResponse.json({ success: false, error: "NOT_FOUND" }, { status: 404 });
  }
  return NextResponse.json({ success: true, suit });
}
