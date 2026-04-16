import crypto from "crypto";

const SECRET = process.env.JARVIS_SECRET || "stark-mainframe-dev-secret";
export const COOKIE_NAME = "jarvis_session";

export const USERS: { email: string; password: string; name: string }[] = [
  { email: "hitesh@q2software.com", password: "logeasy", name: "Hitesh Singh Solanki" },
  { email: "vikram@q2software.com", password: "fintech", name: "Vikram Mehta" },
  { email: "priya@q2software.com", password: "banking", name: "Priya Sharma" },
];

export function sign(payload: object): string {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = crypto.createHmac("sha256", SECRET).update(body).digest("base64url");
  return `${body}.${sig}`;
}

export function verify(token: string | undefined): { email: string; name: string } | null {
  if (!token) return null;
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  const expected = crypto.createHmac("sha256", SECRET).update(body).digest("base64url");
  if (expected !== sig) return null;
  try {
    return JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
  } catch {
    return null;
  }
}
