# Bugs Reference (Interviewer Cheat Sheet)

Three tiers. Full walkthrough + rubrics in `docs/WALKTHROUGH.md`. This file is the fast lookup when you're mid-interview.

| # | Tier | Surface | File | One-line fix |
|---|---|---|---|---|
| 1 | Easy   | `POST /api/login` | `app/api/login/route.ts` | Lowercase both sides of the email comparison |
| 2 | Medium | `/suits` RESYNC stale | `app/suits/page.tsx` | Pass `{ forceNetwork: true }` in `resync()`, or drop the localStorage check |
| 3 | Hard   | `/suits` rapid APPLY race | `app/suits/page.tsx` | Wrap `loadSuits` with `AbortController` in the `useEffect` |

---

## Bug 1 — Case-sensitive email

**Trigger:** `Steve@shield.gov` / `rogers`
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

## Bug 2 — Frozen HEARTBEAT (localStorage cache)

**Trigger:** Log in, click `RESYNC TELEMETRY` on `/suits`. The big `HEARTBEAT` number does not change, `LAST SYNC` timestamp does not advance, no network request fires. **Persists across logout/login** — only `/api/admin/flush-cache` clears it.
**DevTools tell:** Network → Fetch/XHR stays **empty** on click. Application → Local Storage → `jarvis_suits_cache_v1` contains a stale entry with fixed `at`, `heartbeat`, and `server_timestamp`.
**Fix:**
```diff
  async function resync() {
-   await loadSuits(markApplied);
+   await loadSuits(markApplied, { forceNetwork: true });
  }
```
**Bypass endpoint:** `GET /api/admin/flush-cache` returns `Clear-Site-Data: "cache", "storage"` which purges localStorage for the origin.

---

## Bug 3 — Filter race condition

**Trigger:** On `/suits`, type `3` → APPLY. Request hangs ~5s. After ~2s, tell candidate to try `85` instead. Mark 85 returns in ~200ms → `SHOWING MARK 85` renders. ~1–2s later the stranded mark=3 response lands and `SHOWING MARK` flips back to `MARK 3` (wrong).
**DevTools tell:** Network waterfall shows `?mark=3` pending ~5s while `?mark=85` completes in ~200ms. The late response overwrites state. Backend plants this latency intentionally via quadratic inverse-mark delay in `app/api/suits/route.ts`.
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
