# Bugs Reference (Interviewer Cheat Sheet)

Three tiers. Full walkthrough + rubrics in `docs/WALKTHROUGH.md`. This file is the fast lookup when you're mid-interview.

| # | Tier | Surface | File | One-line fix |
|---|---|---|---|---|
| 1 | Easy   | `POST /api/login` | `app/api/login/route.ts` | Lowercase both sides of the email comparison |
| 2 | Medium | `/suits` RESYNC stale | `app/api/suits/route.ts` | Change `Cache-Control` from `public, max-age=86400, immutable` to `no-store` |
| 3 | Hard   | `/suits` rapid APPLY race | `app/suits/page.tsx` | Wrap `loadSuits` with `AbortController` in the `useEffect` |

---

## Bug 1 — Case-sensitive email

**Trigger:** `Tony@stark.com` / `jarvis`
**DevTools tell:** `POST /api/login` → 200 OK → response body `detail: "EMAIL_CASE_MISMATCH..."`
**Fix:**
```diff
- const user = USERS.find((u) => u.email === email && u.password === password);
+ const user = USERS.find(
+   (u) => u.email.toLowerCase() === String(email || "").toLowerCase()
+          && u.password === password,
+ );
```
**Bypass endpoint:** `GET /api/admin/grant` issues a valid session.

---

## Bug 2 — Stale gallery (HTTP cache)

**Trigger:** Log in, click `RESYNC TELEMETRY` on `/suits`. `LAST SYNC` timestamp does not advance.
**DevTools tell:** Network → Fetch/XHR → `suits` row Size column = `(disk cache)`. Response headers show `Cache-Control: public, max-age=86400, immutable`.
**Fix:**
```diff
  headers: {
    "Content-Type": "application/json",
-   "Cache-Control": "public, max-age=86400, immutable",
+   "Cache-Control": "no-store",
  },
```
**Bypass endpoint:** `GET /api/admin/flush-cache` returns `Clear-Site-Data: "cache"`.

---

## Bug 3 — Filter race condition

**Trigger:** On `/suits`, APPLY `mark=3`, then immediately APPLY `mark=85`. UI ends up showing Mark 3 (wrong).
**DevTools tell:** Network waterfall shows `?mark=3` takes ~2.4s while `?mark=85` takes ~60ms. The late response overwrites state. Backend plants this latency intentionally via inverse-mark delay in `app/api/suits/route.ts`.
**Fix:**
```diff
  useEffect(() => {
-   loadSuits(markApplied);
+   const controller = new AbortController();
+   loadSuits(markApplied, controller.signal);
+   return () => controller.abort();
  }, [markApplied]);
```
Plus thread `signal` into the `fetch(...)` call.
**No session bypass** — the race is the test.

---

## Reset between candidates

```
https://jarvis-nine-coral.vercel.app/admin/reset
```
Clears cookies + browser cache (`Clear-Site-Data: "cache", "cookies"`). All three bugs re-arm.
