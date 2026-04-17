# Bugs Reference (Interviewer Cheat Sheet)

Five bugs across three tiers. Tuned for the Q2 Software interview loop (Abhijeet, Shreya, Hitesh, Krithika). Tier mix holds across candidates; only the credentials rotate -- see `README.md` for the per-slot table.

| # | Tier | Surface | File | One-line fix |
|---|---|---|---|---|
| 1 | Easy   | `POST /api/login` 200 OK but fails | `app/api/login/route.ts` | Lowercase both sides of the email comparison |
| 2 | Easy   | `/suits` shows UNAUTHORIZED | `app/api/login/route.ts` | Change cookie `path: "/admin"` to `path: "/"` |
| 3 | Medium | `/suits/[id]` POWER OUTPUT / TOP SPEED show "—" | `app/suits/[id]/page.tsx` | Read `suit.power_output` not `suit.powerOutput` |
| 4 | Medium | `/suits` RESYNC stale | `app/suits/page.tsx` | Pass `{ forceNetwork: true }` in `resync()` |
| 5 | Hard   | `/suits` rapid APPLY race | `app/suits/page.tsx` | Wrap `loadSuits` with `AbortController` in the `useEffect` |

---

## Bug 1 — Case-sensitive email (L1)

**Trigger:** any candidate row with the capital-first-letter email (see `README.md` table) paired with the correct password.
**DevTools tell:** `POST /api/login` -> 200 OK -> response body `detail: "EMAIL_CASE_MISMATCH..."`
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

## Bug 2 — Cookie wrong path (L3)

**Trigger:** Login succeeds but `/suits` shows UNAUTHORIZED.
**DevTools tell:** Application -> Cookies -> `jarvis_session` has Path `/admin`. Network -> `/api/suits` request sends no Cookie header.
**Fix:**
```diff
  res.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
-   path: "/admin",
+   path: "/",
    maxAge: 60 * 60 * 8,
  });
```

---

## Bug 3 — snake_case vs camelCase (S4)

**Trigger:** Open any suit detail page. POWER OUTPUT and TOP SPEED show "—".
**DevTools tell:** Network -> `/api/suits/[id]` response has `power_output` and `top_speed`. Console/Sources: UI reads `suit.powerOutput` / `suit.topSpeed` which are `undefined`.
**Why this matters for Hitesh:** Python backends use snake_case, JS frontends use camelCase. Classic integration mismatch.
**Fix:** Change `suit.powerOutput` to `suit.power_output` (or add a mapping layer).

---

## Bug 4 — Frozen HEARTBEAT (M1)

**Trigger:** Log in, click `RESYNC TELEMETRY` on `/suits`. The big HEARTBEAT number does not change, LAST SYNC timestamp does not advance, no network request fires. Persists across logout/login -- only `/api/admin/flush-cache` clears it.
**DevTools tell:** Network -> Fetch/XHR stays empty on click. Application -> Local Storage -> `jarvis_suits_cache_v1` contains a stale entry with fixed `at`, `heartbeat`, and `server_timestamp`.
**Fix:**
```diff
  async function resync() {
-   await loadSuits(markApplied);
+   await loadSuits(markApplied, { forceNetwork: true });
  }
```
**Bypass endpoint:** `GET /api/admin/flush-cache` returns `Clear-Site-Data` which purges localStorage.

---

## Bug 5 ��� Filter race condition (H1)

**Trigger:** On `/suits`, type `3` -> APPLY. Request hangs ~5s. After ~2s, tell candidate to try `85` instead. Mark 85 returns in ~200ms -> `SHOWING MARK 85` renders. ~1-2s later the stranded mark=3 response lands and `SHOWING MARK` flips back to `MARK 3` (wrong).
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
**No session bypass** -- the race is the test.

---

## Reset between candidates

```
https://jarvis-nine-coral.vercel.app/admin/reset
```
Clears cookies + browser cache (`Clear-Site-Data: "cache", "cookies"`). All five bugs re-arm.

---

## Why these bugs for a backend engineer

| Bug | Tests | Relevance |
|---|---|---|
| L1 (email case) | Response body inspection | API error handling -- 200 with error body is a common pattern |
| L3 (cookie path) | Cookie/header inspection | HTTP fundamentals -- cookie scoping, path attributes |
| S4 (snake_case) | Payload vs UI comparison | Python vs JS naming conventions -- daily reality for backend devs |
| M1 (cache) | Network + Storage tabs | Client-side caching layers -- mirrors Redis/DB cache debugging |
| H1 (race) | Network waterfall | Concurrency issues -- race conditions in async systems |
