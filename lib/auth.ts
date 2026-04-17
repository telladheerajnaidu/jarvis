import crypto from "crypto";

const SECRET = process.env.JARVIS_SECRET || "stark-mainframe-dev-secret";
export const COOKIE_NAME = "jarvis_session";

type User = { email: string; password: string; name: string };

// Single admin cred, pulled from env (JARVIS_ADMIN_EMAIL / JARVIS_ADMIN_PASSWORD /
// JARVIS_ADMIN_NAME). Fallback is a generic demo cred so local dev works without env setup.
// Do not commit real creds to this file.
function loadUsers(): User[] {
  const email = process.env.JARVIS_ADMIN_EMAIL || "demo@example.com";
  const password = process.env.JARVIS_ADMIN_PASSWORD || "demo";
  const name = process.env.JARVIS_ADMIN_NAME || "Admin";
  return [{ email, password, name }];
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
