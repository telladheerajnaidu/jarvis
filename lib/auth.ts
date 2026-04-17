import crypto from "crypto";

const SECRET = process.env.JARVIS_SECRET || "stark-mainframe-dev-secret";
export const COOKIE_NAME = "jarvis_session";

// USERS[0] is the "primary" candidate -- /api/admin/grant hands them a session.
// Rotate the ordering when you swap interviews. Do not mirror these values
// anywhere the client can read -- placeholder text, env vars, docstrings, etc.
export const USERS: { email: string; password: string; name: string }[] = [
  { email: "abhijeet@q2software.com", password: "ironclad", name: "Abhijeet Kumar" },
  { email: "shreya@q2software.com", password: "harmonic", name: "P Shreya" },
  { email: "hitesh@q2software.com", password: "kevlar", name: "Hitesh Singh Solanki" },
  { email: "krithika@q2software.com", password: "palladium", name: "Krithika V" },
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
