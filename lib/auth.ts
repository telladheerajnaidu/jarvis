import crypto from "crypto";

const SECRET = process.env.JARVIS_SECRET || "stark-mainframe-dev-secret";
export const COOKIE_NAME = "jarvis_session";

export const USERS: { email: string; password: string; name: string }[] = [
  { email: "steve@shield.gov", password: "rogers", name: "Steve Rogers" },
  { email: "pepper@stark.com", password: "rescue", name: "Pepper Potts" },
  { email: "rhodey@stark.com", password: "warmachine", name: "James Rhodes" },
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
