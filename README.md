# Jarvis Debug Lab

Interview sandbox for testing browser DevTools skills. Candidate logs into a Jarvis-styled terminal and navigates an Iron Man suit registry. Five intentional bugs are planted across the flow.

## Quick start (local)

```bash
cd ~/Desktop/jarvis-debug-lab
npm install
npm run dev
# open http://localhost:3000
```

## Credentials

Creds load from the `JARVIS_USERS` env var (JSON). Keep the real per-interview roster out of the repo.

Local dev without env setup falls back to a single demo cred: `demo@example.com` / `demo`.

Per-interview setup:
1. Put the real roster in `.env.local` (gitignored) and/or Vercel project env:
   ```
   JARVIS_USERS=[{"email":"first@example.com","password":"xxxx","name":"First Last"}, ...]
   ```
2. Hand the candidate the **capital-first-letter** email (that is the L1 trap) and the password. The lowercase version is the real value on the server.
3. `USERS[0]` is the candidate `/api/admin/grant` unlocks -- list them first when swapping interviews.

**Hint to withhold:** emails are lowercase on the server. (That's bug L1.)

---

## Bug catalog (interviewer only)

### L1 — Case-sensitive email comparison
- **File:** `app/api/login/route.ts`
- **Symptom:** Login with the capital-first-letter email (e.g. `Candidate@example.com`) fails. UI shows generic "Authentication failed".
- **How to find:** Network tab -> login response is `200 OK` with body `{success: false, error: "INVALID_CREDENTIALS", detail: "EMAIL_CASE_MISMATCH: email comparison is case-sensitive on the server"}`.
- **DevTools skill:** Inspecting response body (not just status code).
- **Fix:** Compare `u.email.toLowerCase() === email.toLowerCase()`.

### L3 — Cookie set on wrong path
- **File:** `app/api/login/route.ts` (cookie `path: "/admin"`)
- **Symptom:** Login succeeds, user lands on `/suits`, gallery shows "UNAUTHORIZED // session token not accepted".
- **How to find:** Application tab -> Cookies -> `jarvis_session` exists but Path is `/admin`. Network tab -> `/api/suits` request has no Cookie header.
- **DevTools skill:** Application/Storage tab, cookie attributes (Path, SameSite, Secure).
- **Fix:** Change `path: "/admin"` to `path: "/"`.

### S4 — snake_case vs camelCase field mismatch
- **File:** `app/suits/[id]/page.tsx`
- **Symptom:** Suit detail page shows "—" for `POWER OUTPUT` and `TOP SPEED` fields.
- **How to find:** Network tab -> `/api/suits/[id]` response payload has `power_output` and `top_speed`. UI reads `suit.powerOutput` / `suit.topSpeed`.
- **DevTools skill:** Comparing API payload vs DOM, Elements/React.
- **Fix:** Read `suit.power_output` / `suit.top_speed` (or map in the API layer).

### M1 — Frozen HEARTBEAT (localStorage cache)
- **File:** `app/suits/page.tsx`
- **Symptom:** On `/suits`, click RESYNC TELEMETRY. The big HEARTBEAT number does not change, LAST SYNC timestamp does not advance, no network request fires. Persists across logout/login.
- **How to find:** Network -> Fetch/XHR stays empty on click. Application -> Local Storage -> `jarvis_suits_cache_v1` contains a stale entry.
- **DevTools skill:** Network tab + Application/Storage tab, understanding client-side caching.
- **Fix:** Pass `{ forceNetwork: true }` in `resync()`.

### H1 — Filter race condition
- **File:** `app/suits/page.tsx`
- **Symptom:** On `/suits`, type `3` -> APPLY. Request hangs ~5s. After ~2s, try `85` instead. Mark 85 renders, then ~1-2s later stale mark=3 response clobbers it.
- **How to find:** Network waterfall shows `?mark=3` pending ~5s while `?mark=85` completes in ~200ms. The late response overwrites state.
- **DevTools skill:** Network waterfall analysis, understanding race conditions.
- **Fix:** Wrap `loadSuits` with `AbortController` in the `useEffect`.

---

## Interview flow (15-20 min for DevTools round)

1. Give the candidate the URL and the credentials from the row above that matches their slot.
2. Ask: "Log in and browse the suit registry. Narrate what you see, what you try, what's broken, and how you'd fix it."
3. Sit quiet. Let them drive.
4. Score against the rubric.

Expected progression:
- They type the capitalised email first -> hits L1 -> good candidate opens Network tab.
- Once logged in -> hits L3 -> good candidate opens Application -> Cookies.
- On detail page -> hits S4 (missing fields).
- Tries filter -> might notice M1 or H1.

You don't need them to hit all 5. Two clean catches + correct diagnosis is a strong signal.

---

## Reset between candidates

```
https://jarvis-nine-coral.vercel.app/admin/reset
```
Clears cookies + browser cache (`Clear-Site-Data: "cache", "cookies"`). All five bugs re-arm.

---

## Deploy to Vercel

```bash
git init
git add .
git commit -m "chore: initial jarvis debug lab"
git remote add origin git@github.com:<you>/jarvis-debug-lab.git
git push -u origin main
```

1. Go to https://vercel.com/new
2. Import the repo
3. Framework preset: Next.js (auto-detected)
4. Env var (optional): `JARVIS_SECRET` = any random string. If omitted, a dev secret is used.
5. Deploy
