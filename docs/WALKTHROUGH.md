# Jarvis Debug Lab — Interview Walkthrough

Three planted bugs, tiered by difficulty. All are real — no mocks. The backend lives on Vercel, the bugs trigger identically whether the candidate runs it locally or against the production URL.

**Target URL:** https://jarvis-nine-coral.vercel.app
**Credentials:** `tony@stark.com` / `jarvis` (case matters — see Bug 1)

The goal is to observe the candidate's diagnostic path, not whether they patch the code. Reward narration over result: which DevTools tab did they open, what did they look for, how did they form a hypothesis.

---

## Difficulty tiers

| # | Tier | Bug | Surface | Primary DevTools skill |
|---|---|---|---|---|
| 1 | **Easy** | Case-sensitive email on login | `/` | Network tab — reading response body past a 200 OK |
| 2 | **Medium** | Gallery shows stale data after RESYNC | `/suits` | Network tab — Size column `(disk cache)` + `Cache-Control` response header |
| 3 | **Hard** | Filter returns wrong results on rapid APPLY | `/suits` | Network tab — waterfall ordering + knowing about in-flight request cancellation |

No hints are printed to the Console. All signals live in **Network**, **Application**, or the visible UI state. The candidate has to choose which tab to open.

---

## API endpoints reference

| Method | Path | Purpose | Auth |
|---|---|---|---|
| `POST` | `/api/login` | Authenticate, set `jarvis_session` cookie (HttpOnly, Path=/) | — |
| `POST` | `/api/logout` | Clear session cookie | — |
| `GET`  | `/api/suits` | List suits, optional `?mark=N` filter | Cookie required (401 otherwise) |
| `GET`  | `/api/suits/[id]` | Single suit detail | Cookie required |
| `GET`  | `/api/suits/[id]/spec` | CSV spec download (Content-Disposition set) | Cookie required |
| `POST` | `/api/admin/reset` | Purge `jarvis_session` cookie across paths | — |
| `POST` | `/api/admin/grant` | Bypass login: issue a valid session for `tony@stark.com` | — |
| `POST` | `/api/admin/flush-cache` | Resolve Bug 2: returns `Clear-Site-Data: "cache"` | — |

### Interviewer shortcuts

| Goal | URL to open in browser |
|---|---|
| Full reset, re-arm all bugs | `https://jarvis-nine-coral.vercel.app/admin/reset` |
| Skip the login bug, land straight in `/suits` | `https://jarvis-nine-coral.vercel.app/api/admin/grant` then navigate to `/suits` |
| Resolve Bug 2 mid-session without code changes | `https://jarvis-nine-coral.vercel.app/api/admin/flush-cache` |

`POST /api/admin/grant` and `/api/admin/flush-cache` also accept `GET` for convenience — just paste the URL into the address bar.

---

## Bug 1 — EASY — Case-sensitive login

### Landing page (before trigger)

![Login page](./screenshots/01_login_page.png)

### Trigger
Candidate types `Tony@stark.com` (capital T) with the correct password.

### Symptom
UI shows a red terminal error: `AUTHENTICATION REJECTED // SEE TERMINAL`. Generic — no direct hint about case.

![Bug 1 UI error](./screenshots/02_bug1_case_error_ui.png)

### What a candidate should find
Open **Network tab → `POST /api/login`**. Status is **200 OK**, not 4xx. That's the trap: HTTP 200 does not imply business success. They have to open the **Response** panel:

```json
{
  "success": false,
  "error": "INVALID_CREDENTIALS",
  "detail": "EMAIL_CASE_MISMATCH: email comparison is case-sensitive on the server"
}
```

The `detail` field spells it out — only visible if they bother reading the body.

### Where it lives
`app/api/login/route.ts`:

```ts
const user = USERS.find((u) => u.email === email && u.password === password);
```

### Resolution

**Candidate fix (code):**
```diff
- const user = USERS.find((u) => u.email === email && u.password === password);
+ const user = USERS.find(
+   (u) => u.email.toLowerCase() === String(email || "").toLowerCase()
+          && u.password === password,
+ );
```

**Interviewer shortcut (no redeploy):**
```
https://jarvis-nine-coral.vercel.app/api/admin/grant
```
That issues a clean session for `tony@stark.com`. Then navigate to `/suits`.

### Signal rubric

| Behavior | Read |
|---|---|
| Opens Network tab within 15s of the failure | **Strong** |
| Reads the response body after seeing 200 | **Staff-level** |
| Stops at the Console tab (empty) | **Weak** |
| Retries "wrong password" variants | **Red flag** |

### Verify via curl
```bash
curl -s -X POST https://jarvis-nine-coral.vercel.app/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"Tony@stark.com","password":"jarvis"}'
```
You should see `"success":false` with the `EMAIL_CASE_MISMATCH` detail, status 200.

---

## Bug 2 — MEDIUM — Stale gallery after RESYNC

### Gallery after successful login

![Gallery loaded](./screenshots/03_gallery_after_login.png)

Note the `LAST SYNC // HH:MM:SS` line under the header with the hint *"if this does not advance on RESYNC, inspect Network → cache"*.

### Trigger
Candidate logs in successfully, lands on `/suits`. They click **RESYNC TELEMETRY** in the top bar, then click it again.

### Symptom
The `LAST SYNC` value does **not** advance, no matter how many times RESYNC is clicked. `(Hard refresh — Cmd+Shift+R — does bump it. A soft refresh does not.)`

![Bug 2 stale timestamp](./screenshots/04_bug2_resync_stale.png)

Live capture from the interview deploy, timestamp before/after two RESYNC clicks:

```json
{
  "before": "LAST SYNC // 22:37:27",
  "after_two_resyncs": "LAST SYNC // 22:37:27"
}
```

The headers and body returned by `GET /api/suits`:

```json
{
  "status": 200,
  "cacheControl": "public, max-age=86400, immutable",
  "serverTimestamp": "2026-04-12T22:37:27.845Z"
}
```

### What a candidate should find
Open **Network tab**, filter by `Fetch/XHR`, click RESYNC again. Two things stand out:

1. The `suits` request row has a **Size** column value of **`(disk cache)`** or **`(memory cache)`** — not a byte count. The browser is serving the old response without hitting the server.
2. Click the row → **Headers → Response Headers**:
   ```
   cache-control: public, max-age=86400, immutable
   ```
   `immutable` tells the browser it can skip revalidation entirely for 24 hours. The data is dynamic, so this is wrong.

The hint in the UI footer reads: *"if this does not advance on RESYNC, inspect Network → cache"* — subtle, not a console log.

### Where it lives
`app/api/suits/route.ts`:

```ts
return new NextResponse(JSON.stringify(body), {
  status: 200,
  headers: {
    "Content-Type": "application/json",
    "Cache-Control": "public, max-age=86400, immutable",
  },
});
```

### Resolution

**Candidate fix (code):**
```diff
  headers: {
    "Content-Type": "application/json",
-   "Cache-Control": "public, max-age=86400, immutable",
+   "Cache-Control": "no-store",
  },
```

**Interviewer shortcut (no redeploy):** hit this URL in a new tab
```
https://jarvis-nine-coral.vercel.app/api/admin/flush-cache
```
It returns `Clear-Site-Data: "cache"` which purges the browser cache for the origin. Go back to `/suits`, click RESYNC — timestamp advances.

**Candidate escape route:** Cmd+Shift+R (hard reload) bypasses cache and confirms the diagnosis. That alone is worth credit.

### Signal rubric

| Behavior | Read |
|---|---|
| Opens Network tab, sees `(disk cache)` size | **Good** |
| Opens Response Headers, names `Cache-Control` / `immutable` | **Strong** |
| Articulates why `immutable` is wrong for this endpoint | **Staff-level** |
| Tries a hard refresh and connects it to caching | **Strong** |
| Clicks RESYNC repeatedly without inspecting Network | **Weak** |
| Blames React / state without checking headers | **Red flag** |

### Verify via curl
```bash
curl -s -D- -o /dev/null https://jarvis-nine-coral.vercel.app/api/suits \
  -H "Cookie: jarvis_session=<paste from login Set-Cookie>" | grep -i cache-control
# cache-control: public, max-age=86400, immutable
```

---

## Bug 3 — HARD — Race condition on filter

### Trigger
On `/suits`, type a **small** mark number in the filter (`3`) and click **APPLY**. Before the results come back, clear the input, type a **large** mark number (`85`), click APPLY again.

### Symptom
Gallery briefly shows Mark 85 → then a moment later **flips back to Mark 3**. Final rendered result does not match the last APPLY. Repeat rapidly and the UI is non-deterministic.

Mid-flight (after first APPLY has been issued, before its response arrives):

![Bug 3 mid-flight](./screenshots/05_bug3_race_midflight.png)

Final state (the slower earlier request has arrived and overwritten the newer Mark 85 result):

![Bug 3 final state](./screenshots/05_bug3_race_final_state.png)

### Live latency proof from the deploy

```json
{ "mark3_ms": 2475, "mark85_ms": 288 }
```

The Mark 3 request is ~8.5× slower than Mark 85. That's what guarantees the race: even if the candidate clicks APPLY for 85 *after* 3, the 85 response returns first and is immediately clobbered when the 3 response finally arrives.

### What a candidate should find
Open **Network tab → Fetch/XHR**, repeat the reproduction. Two requests show up:

- `suits?mark=3` — **~2.4s** total time
- `suits?mark=85` — **~60ms** total time

Look at the **Waterfall** column. The 85 request returns almost instantly (the user sees Mark 85 briefly). The 3 request returns ~2 seconds later — and its response is written to state last, overwriting Mark 85.

Subtle clue in the backend: `/api/suits` applies a per-mark latency that is **inverse** to the mark number. Smaller mark = slower. The candidate doesn't need to find this to diagnose — the waterfall is enough — but explaining it is a staff signal.

Core insight the candidate must name: **there is no request cancellation**. The in-flight fetch for Mark 3 is never aborted when Mark 85 is requested, so its late response clobbers state.

### Where it lives
`app/suits/page.tsx`:

```tsx
useEffect(() => {
  loadSuits(markApplied);
  // intentionally no AbortController
}, [markApplied]);
```

### Resolution

**Candidate fix (code):**
```diff
  useEffect(() => {
-   loadSuits(markApplied);
+   const controller = new AbortController();
+   loadSuits(markApplied, controller.signal);
+   return () => controller.abort();
  }, [markApplied]);
```
Plus thread the `signal` into `fetch(...)` inside `loadSuits`.

Alternative fix: a response-time monotonic counter (increment on each call, ignore responses whose counter is not the latest).

**No session-level bypass endpoint.** The race condition is the test — there is no `/api/admin/linearize` by design. If the candidate gets stuck and time is short, reload the page to reset state, or skip to the summary.

### Signal rubric

| Behavior | Read |
|---|---|
| Opens Network and compares timings / waterfall | **Good** |
| Names "race condition" or "last-response-wins" | **Strong** |
| Proposes AbortController or a request-id guard | **Staff-level** |
| Notices response timing inversely correlates with mark | **Exceptional** |
| Concludes "the backend is flaky" | **Red flag** |

### Verify via curl (shows the latency gradient)
```bash
# Should take ~2.4s
time curl -s -o /dev/null -H "Cookie: jarvis_session=<...>" \
  "https://jarvis-nine-coral.vercel.app/api/suits?mark=3"

# Should take ~60ms
time curl -s -o /dev/null -H "Cookie: jarvis_session=<...>" \
  "https://jarvis-nine-coral.vercel.app/api/suits?mark=85"
```

---

## Interviewer flow (30 min)

| t | Action | Expected candidate move |
|---|---|---|
| 0:00 | Share URL + credentials. "Log in, explore, narrate as you go." | — |
| 0:00–0:05 | Watch them type `Tony@stark.com` → Bug 1 triggers | Network tab → response body |
| 0:05–0:07 | If stuck, nudge: "what does the server actually say?" | They read the `detail` field |
| 0:07 | They log in successfully and land on `/suits` | Timestamp visible in header |
| 0:08 | Ask: "click RESYNC a few times — does the timestamp update?" → Bug 2 | Network tab → `(disk cache)` → response headers |
| 0:12 | If stuck: "what does the browser do if you hard-refresh?" | They make the cache connection |
| 0:15 | Ask: "filter by Mark 3, then quickly filter by Mark 85" → Bug 3 | Network tab → waterfall → race condition |
| 0:22 | If they nail it early, ask: "how would you fix it?" | AbortController / request-id guard |
| 0:27 | Wrap: "which would you prioritize fixing first, and why?" | Judge prioritization |

### Pass bar

- **Strong:** Diagnoses 2 of 3 bugs cleanly, including Bug 3, and names the correct DevTools artifact for each. Proposes a concrete fix for Bug 2 or 3.
- **Pass:** Diagnoses Bug 1 and Bug 2 without major prompts.
- **Fail:** Opens only Console. Blames backend without looking at response body/headers. Refreshes in a loop without reading network activity.

### Red flag phrases
- "It's a backend issue" (without opening Network).
- "The cache tab is empty so there's no cache problem" (Application → Cache Storage ≠ HTTP cache).
- "The response looks the same so the request must be wrong" (on Bug 3 — misses that *order* of responses is what matters, not content).

---

## Reset between candidates

Open in a new tab:

```
https://jarvis-nine-coral.vercel.app/admin/reset
```

That purges the session cookie and flushes the browser cache (via the reset page's own Clear-Site-Data header). All three bugs re-arm immediately.

![Admin reset page](./screenshots/07_admin_reset.png)

---

## Local dev (optional)

```bash
git clone https://github.com/telladheerajnaidu/jarvis
cd jarvis
npm install
npm run dev
# http://localhost:3000
```

Bugs behave identically on localhost.
