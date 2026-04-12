# Jarvis Debug Lab

Interview sandbox for testing browser DevTools skills. Candidate logs into a Jarvis-styled terminal and navigates an Iron Man suit registry. Five intentional bugs are planted across the flow.

## Quick start (local)

```bash
cd ~/Desktop/jarvis-debug-lab
npm install
npm run dev
# open http://localhost:3000
```

## Credentials (give to candidate)

| User | Email | Password |
|---|---|---|
| Tony Stark | `tony@stark.com` | `jarvis` |
| Pepper Potts | `pepper@stark.com` | `rescue` |
| James Rhodes | `rhodey@stark.com` | `warmachine` |

**Hint to withhold:** emails are lowercase. (That's bug L1.)

---

## Bug catalog (interviewer only)

### L1 — Case-sensitive email comparison
- **File:** `app/api/login/route.ts`
- **Symptom:** Login with `Tony@stark.com` fails. UI shows generic "Authentication failed".
- **How to find:** Network tab -> login response is `200 OK` with body `{success: false, error: "INVALID_CREDENTIALS", detail: "EMAIL_CASE_MISMATCH: email comparison is case-sensitive on the server"}`.
- **DevTools skill:** Inspecting response body (not just status code).
- **Fix:** Compare `u.email.toLowerCase() === email.toLowerCase()`.

### L3 — Cookie set on wrong path
- **File:** `app/api/login/route.ts` (cookie `path: "/admin"`)
- **Symptom:** Login succeeds, user lands on `/suits`, gallery shows "UNAUTHORIZED // session token not accepted".
- **How to find:** Application tab -> Cookies -> `jarvis_session` exists but Path is `/admin`. Network tab -> `/api/suits` request has no Cookie header.
- **DevTools skill:** Application/Storage tab, cookie attributes (Path, SameSite, Secure).
- **Fix:** Change `path: "/admin"` to `path: "/"`.

### S1 — Download missing Content-Disposition
- **File:** `app/api/suits/[id]/spec/route.ts`
- **Symptom:** "Download Spec Sheet" button triggers a download named `<uuid>` with no extension, or browser renders raw CSV text (depends on browser).
- **How to find:** Network tab -> `/spec` response headers lack `Content-Disposition: attachment; filename="..."`.
- **DevTools skill:** Reading response headers.
- **Fix:** Add header `"Content-Disposition": 'attachment; filename="mk<N>_spec.csv"'`.

### S4 — snake_case vs camelCase field mismatch
- **File:** `app/suits/[id]/page.tsx`
- **Symptom:** Suit detail page shows "—" for `POWER OUTPUT` and `TOP SPEED` fields.
- **How to find:** Network tab -> `/api/suits/[id]` response payload has `power_output` and `top_speed`. UI reads `suit.powerOutput` / `suit.topSpeed`.
- **DevTools skill:** Comparing API payload vs DOM, Elements/React.
- **Fix:** Read `suit.power_output` / `suit.top_speed` (or map in the API layer).

### S5 — Stale filter state, empty query param
- **File:** `app/suits/page.tsx`
- **Symptom:** Typing a Mark number + Apply does nothing. All suits still show.
- **How to find:** Network tab -> `/api/suits?mark=` is sent with empty value regardless of input. React devtools / Sources: `markApplied` is never updated; `setMarkApplied(markInput)` is missing from `applyFilter`.
- **DevTools skill:** Request payload/params inspection, React state debugging.
- **Fix:** In `applyFilter`, call `setMarkApplied(markInput)` and re-run `loadSuits` with the new value (or use a `useEffect` on `markApplied`).

---

## Interview flow (15-20 min for DevTools round)

1. Give candidate the URL and Tony's credentials.
2. Ask: "Log in and browse the suit registry. Narrate what you see, what you try, what's broken, and how you'd fix it."
3. Sit quiet. Let them drive.
4. Score against the rubric in `tanubagel R1.pdf`.

Expected progression:
- They type `Tony@stark.com` first -> hits L1 -> good candidate opens Network tab.
- Once logged in -> hits L3 -> good candidate opens Application -> Cookies.
- (Reset cookie path for demo if needed: clear cookies and manually set Path=/ in devtools, or ship the "fix" in a branch.)
- On detail page -> hits S4 (missing fields).
- Clicks Download -> hits S1 (wrong filename / inline rendering).
- Tries filter -> hits S5 (empty query param).

You don't need them to hit all 5. Two clean catches + correct diagnosis is a strong signal.

---

## Deploy to Vercel

```bash
# in ~/Desktop/jarvis-debug-lab
git init
git add .
git commit -m "chore: initial jarvis debug lab"
# create repo on GitHub, then:
git remote add origin git@github.com:<you>/jarvis-debug-lab.git
git push -u origin main
```

1. Go to https://vercel.com/new
2. Import the repo
3. Framework preset: Next.js (auto-detected)
4. Env var (optional): `JARVIS_SECRET` = any random string. If omitted, a dev secret is used.
5. Deploy

For the interview, share the Vercel URL + credentials.

---

## Swap in Supabase later (optional)

Replace `lib/auth.ts` USERS array with Supabase auth (`@supabase/ssr` + `createServerClient`). Same cookie shape, same bugs still apply.
