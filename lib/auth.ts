import crypto from "crypto";

const SECRET = process.env.JARVIS_SECRET || "stark-mainframe-dev-secret";
export const COOKIE_NAME = "jarvis_session";

type User = { email: string; password: string; name: string };

// Candidate creds live in env var JARVIS_USERS (JSON array of {email,password,name}).
// Fallback is a single generic demo cred so local dev works without env setup.
// Do not commit real creds to this file.
function loadUsers(): User[] {
  const raw = process.env.JARVIS_USERS;
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed as User[];
    } catch {}
  }
  return [{ email: "demo@example.com", password: "demo", name: "Demo User" }];
}

export const USERS: User[] = loadUsers();

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
