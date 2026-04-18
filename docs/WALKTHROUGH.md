# Jarvis Debug Lab -- Interview Walkthrough

Five planted bugs, tiered by difficulty. All are real -- no mocks. The backend lives on Vercel, the bugs trigger identically whether the candidate runs it locally or against the production URL.

**Target URL:** https://jarvis-nine-coral.vercel.app
**Credentials:** configured via the `JARVIS_ADMIN_EMAIL` / `JARVIS_ADMIN_PASSWORD` env vars. Hand the candidate the capital-first-letter email and the correct password. Case matters on the server -- that is Bug 1.

The bugs are tuned to test skills relevant to a backend engineer debugging a frontend integration -- Python vs JS naming, HTTP cookie scoping, response-body vs status-code reading, client-side caching, and race conditions.

The goal is to observe the candidate's diagnostic path, not whether they patch the code. Reward narration over result: which DevTools tab did they open, what did they look for, how did they form a hypothesis.

---

## Quick Reference

### Difficulty tiers

| # | Tier | Bug | Surface | Primary DevTools skill |
|---|---|---|---|---|
| 1 | **Easy**   | Case-sensitive email on login | `/` | Network tab -- reading response body past a 200 OK |
| 2 | **Easy**   | Cookie set on wrong path | `/suits` | Application tab -- Cookie attributes (Path) |
| 3 | **Medium** | snake_case vs camelCase field mismatch | `/suits/[id]` | Network tab -- comparing API payload vs rendered DOM |
| 4 | **Medium** | `HEARTBEAT` frozen after RESYNC | `/suits` | Application tab -- `localStorage` entry + silent Network tab on click |
| 5 | **Hard**   | `SHOWING MARK` flips back on rapid APPLY | `/suits` | Network tab -- waterfall ordering + in-flight request cancellation |

No hints are printed to the Console. All signals live in **Network**, **Application**, or the visible UI state.

### Bug persistence

Bugs are **sticky across logout/login** by design. `DISENGAGE` only clears the session cookie -- `localStorage` persists. The **only** way to clear Bug 4 mid-session is `/api/admin/flush-cache`. Bug 5 needs no reset -- it reproduces on every rapid APPLY.

### API endpoints

| Method | Path | Purpose | Auth |
|---|---|---|---|
| `POST` | `/api/login` | Authenticate, set `jarvis_session` cookie (HttpOnly, **Path=/admin** -- Bug 2) | -- |
| `POST` | `/api/logout` | Clear session cookie | -- |
| `GET`  | `/api/suits` | List suits, optional `?mark=N` filter | Cookie required |
| `GET`  | `/api/suits/[id]` | Single suit detail | Cookie required |
| `GET`  | `/api/admin/reset` | Purge `jarvis_session` cookie across paths | -- |
| `GET`  | `/api/admin/grant` | Bypass login: issues a valid session | -- |
| `GET`  | `/api/admin/flush-cache` | Resolve Bug 4: returns `Clear-Site-Data` | -- |

### Interviewer shortcut URLs

| Goal | URL |
|---|---|
| Full reset, re-arm all bugs | `https://jarvis-nine-coral.vercel.app/admin/reset` |
| Skip login bugs 1+2, land in `/suits` | `https://jarvis-nine-coral.vercel.app/api/admin/grant` -> then `/suits` |
| Resolve Bug 4 mid-session | `https://jarvis-nine-coral.vercel.app/api/admin/flush-cache` |

---

## Landing page

![Login page](./screenshots/01_login_page.png)

The login screen is the cinematic JARVIS entry point -- 3D rune title, orbital core, starfield, aurora drift, ticker. Candidates get the email/password and start here.

---

# Bug 1 -- EASY -- Case-sensitive login

### Concept

**API error handling -- `200 OK` does not mean business success.** A common REST pattern is returning HTTP 200 with `{ success: false, error: "..." }` in the body. Tools that only watch status codes (or candidates who only check the response tab for reds) miss this. The fix is to read the actual response body, not the status line.

This tests whether the candidate treats an HTTP response as *transport-layer OK* vs *business-layer OK* -- a distinction every backend engineer should internalize.

### How to reproduce

1. Open `https://jarvis-nine-coral.vercel.app`.
2. Enter email with capital first letter: `Admin@jarvis.local` (or whatever capitalised variant you hand over).
3. Enter the correct password.
4. Click **AUTHENTICATE**.

### Symptom

UI shows the crimson terminal error: `AUTHENTICATION REJECTED // SEE TERMINAL`. Generic -- no direct hint about case sensitivity.

![Bug 1 UI error](./screenshots/02_bug1_case_error_ui.png)

### Clues if stuck

- **Nudge 1 (15s in, no DevTools):** "Open DevTools -- what is the server actually returning?"
- **Nudge 2 (after they see 200 OK):** "200 doesn't always mean success. Look at the response body."
- **Nudge 3 (still stuck):** "The `detail` field spells it out. Read the JSON."

### What a candidate should find

Open **Network tab -> `POST /api/login`**. Status is **200 OK**, not 4xx. Open the **Response** panel:

```json
{
  "success": false,
  "error": "INVALID_CREDENTIALS",
  "detail": "EMAIL_CASE_MISMATCH: email comparison is case-sensitive on the server"
}
```

The `detail` field spells it out -- only visible if they read the body.

### Where it lives

`app/api/login/route.ts`:

```ts
const user = USERS.find((u) => u.email === email && u.password === password);
```

### Fix

```diff
- const user = USERS.find((u) => u.email === email && u.password === password);
+ const user = USERS.find(
+   (u) => u.email.toLowerCase() === String(email || "").toLowerCase()
+          && u.password === password,
+ );
```

### API to bypass (no redeploy needed)

```
GET https://jarvis-nine-coral.vercel.app/api/admin/grant
```

Issues a clean session for the admin user. Then navigate to `/suits`.

### Verify via curl

```bash
curl -s -X POST https://jarvis-nine-coral.vercel.app/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"Admin@jarvis.local","password":"jarvis"}'
```

Response is `{"success":false,...,"detail":"EMAIL_CASE_MISMATCH..."}`, status 200.

### Follow-up questions if solved

- "Would you return 200 or 400/401 for this? Why?"
- "Where in a Python backend would this bug live if the creds came from Postgres? (Answer: `WHERE email = $1` is case-sensitive on Postgres text columns -- same class of bug, different language.)"
- "How would you protect against this regressing? (Answer: normalize on write, store lowercased email; or add a `LOWER()` on both sides at query time.)"

### Signal rubric

| Behavior | Read |
|---|---|
| Opens Network tab within 15s of the failure | Strong |
| Reads the response body after seeing 200 | Staff-level |
| Stops at the Console tab (empty) | Weak |
| Retries "wrong password" variants without inspecting | Red flag |

---

# Bug 2 -- EASY -- Cookie set on wrong path

### Concept

**HTTP cookie scoping via the `Path` attribute.** A cookie set with `Path=/admin` is only sent by the browser on requests under `/admin/*`. Requests to `/api/suits` (under `/api`) get no `Cookie` header, so the server returns 401. This maps directly onto `response.set_cookie(path=...)` in Flask/FastAPI -- a backend engineer should know it cold.

### How to reproduce

1. Fix Bug 1 (use the lowercase email, e.g. `admin@jarvis.local`).
2. Click **AUTHENTICATE**. Login succeeds (`200 { success: true }`), app redirects to `/suits`.
3. Observe the gallery.

### Symptom

The suits gallery shows **`UNAUTHORIZED // SESSION TOKEN REJECTED BY /api/suits`** -- despite a successful login a second earlier.

![Bug 2 - UNAUTHORIZED after login](./screenshots/03b_bug2_cookie_path_unauthorized.png)

### Clues if stuck

- **Nudge 1:** "The login worked -- where did the session go?"
- **Nudge 2:** "Check Application tab -> Cookies. Is the cookie there?"
- **Nudge 3:** "Look at the cookie attributes. Path."

### What a candidate should find

Open **Application tab -> Cookies -> the domain**. The `jarvis_session` cookie exists, but its **Path** is `/admin`, not `/`. The browser only sends the cookie on `/admin/*` requests -- `/api/suits` (under `/api`) never receives it.

Open **Network tab -> `GET /api/suits`** -> **Request Headers**. No `Cookie` header. That's why the server returns 401.

### Where it lives

`app/api/login/route.ts`:

```ts
res.cookies.set(COOKIE_NAME, token, {
  httpOnly: true,
  sameSite: "lax",
  path: "/admin",    // <-- should be "/"
  maxAge: 60 * 60 * 8,
});
```

### Fix

```diff
  res.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
-   path: "/admin",
+   path: "/",
    maxAge: 60 * 60 * 8,
  });
```

### API to bypass

```
GET https://jarvis-nine-coral.vercel.app/api/admin/grant
```

This endpoint sets the cookie with `Path=/` -- bypasses Bug 2 entirely.

### Follow-up questions if solved

- "If the cookie had `HttpOnly` set to false, what additional risk would that introduce? (XSS-readable.)"
- "Why would you use `SameSite=Lax` vs `Strict`?"
- "Your cookie is `Path=/`. How do `Domain` and `Path` interact -- which is stricter? Can a cookie on `a.example.com` be read by `example.com`?"
- "In a microservice setup where `/api/*` is a different service behind a reverse proxy, how would you make sure the session cookie reaches both services?"

### Signal rubric

| Behavior | Read |
|---|---|
| Opens Application -> Cookies and inspects Path | Strong |
| Checks Network -> Request Headers for missing Cookie | Staff-level |
| Says "login worked but the cookie isn't being sent" | Excellent |
| Tries logging in repeatedly without inspecting | Weak |
| Blames CORS or "backend auth is broken" without checking cookie | Red flag |

---

# Bug 3 -- MEDIUM -- snake_case vs camelCase mismatch

### Concept

**Python (and Postgres) serialise in `snake_case`. JavaScript frontends consume `camelCase`.** When a Python backend ships an API without a naming-convention transform, the JS side reads `suit.powerOutput` -- which is `undefined` because the payload has `power_output`. The UI silently falls back to a placeholder. This is the single most common integration bug between Python backends and JS frontends; a backend engineer who ships APIs should spot it in seconds.

### How to reproduce

1. Land on `/suits` (use `/api/admin/grant` if Bug 2 isn't fixed).
2. Click any suit card, e.g. Mark 50.
3. Look at the **CORE SPECS** panel.

### Symptom

`POWER OUTPUT` and `TOP SPEED` show **"--"** (em dash). All other spec fields -- ARMOR, AI CORE, HUD, FIRST DEPLOYED -- display correctly.

![Bug 3 - Missing fields on detail page](./screenshots/04_bug3_snake_case_detail.png)

### Clues if stuck

- **Nudge 1:** "Network tab -- what fields does the API actually return?"
- **Nudge 2:** "Compare the response fields to the fields the UI is reading."
- **Nudge 3:** "Look at the casing."

### What a candidate should find

Open **Network tab -> `GET /api/suits/mk50`** -> Response:

```json
{
  "suit": {
    "power_output": "9.2 GW",
    "top_speed": "Mach 4.0",
    "armor": "Nanotech (Self-Assembling)",
    ...
  }
}
```

API returns `power_output` / `top_speed` (snake_case). UI reads `suit.powerOutput` / `suit.topSpeed` (camelCase) -- `undefined` -> fallback `"--"`.

### Where it lives

`app/suits/[id]/page.tsx`:

```tsx
<SpecRow label="POWER OUTPUT" value={(suit as any).powerOutput ?? "--"} />
<SpecRow label="TOP SPEED"    value={(suit as any).topSpeed ?? "--"} />
```

### Fix

```diff
- <SpecRow label="POWER OUTPUT" value={(suit as any).powerOutput ?? "--"} />
- <SpecRow label="TOP SPEED"    value={(suit as any).topSpeed ?? "--"} />
+ <SpecRow label="POWER OUTPUT" value={suit.power_output} />
+ <SpecRow label="TOP SPEED"    value={suit.top_speed} />
```

Alternative: add a serialisation layer that converts snake_case keys to camelCase before the response leaves the backend (FastAPI's `alias_generator=to_camel` in Pydantic, or a JS transform on fetch).

### API to clear / bypass

No bypass -- the fix is code. But the signal is visible with a single curl:

```bash
curl -s https://jarvis-nine-coral.vercel.app/api/suits/mk50 | jq '.suit | keys'
```

Output includes `"power_output"` and `"top_speed"` -- no camelCase variants exist.

### Follow-up questions if solved

- "Where would you put the fix -- backend, frontend, or a shared contract? (Trade-offs: backend transform hides the DB schema, frontend transform doesn't scale across consumers, shared contract is ideal but needs tooling.)"
- "If FastAPI returns `power_output`, how do you make Pydantic emit `powerOutput` instead? (`alias_generator=to_camel` + `populate_by_name=True`.)"
- "What's the strongest way to prevent this regressing? (Typed API client generated from OpenAPI; any rename becomes a compile error.)"

### Signal rubric

| Behavior | Read |
|---|---|
| Opens Network, compares API response to DOM | Strong |
| Immediately says "naming convention mismatch" | Staff-level |
| Proposes a serializer / typed client as the proper fix | Exceptional |
| Checks Elements tab but not Network | Weak |
| Assumes API is missing fields | Red flag |

---

# Bug 4 -- MEDIUM -- Frozen HEARTBEAT after RESYNC

### Concept

**Client-side caching can silently stale data.** The app caches `/api/suits` responses in `localStorage` with a 24h TTL. The RESYNC button re-reads from that cache instead of the network. This is **not** an HTTP cache bug -- "Disable cache" in DevTools does nothing, hard refresh does nothing, logout/login does nothing. The only way to clear it mid-session is to purge storage directly, or hit `Clear-Site-Data`.

This tests whether the candidate can distinguish *HTTP cache* (browser disk cache, `Cache-Control`) from *application storage* (`localStorage`, `IndexedDB`) -- two different layers, two different invalidation mechanisms. Mirrors the real-world pattern of forgetting to bust a Redis/memcached layer in a backend.

### How to reproduce

1. Log in successfully (use `/api/admin/grant` if needed).
2. Land on `/suits`. Note the **HEARTBEAT** number -- a 5-digit random number the server rerolls on every real fetch.
3. Click **RESYNC TELEMETRY** in the top bar. Click it again. And again.

### Symptom

`HEARTBEAT` does **not** change. `LAST SYNC` timestamp stays frozen. Hard refresh (Cmd+Shift+R) does not fix it. Logout -> login does not fix it.

![Bug 4 - HEARTBEAT stays frozen](./screenshots/05_bug4_resync_stale.png)

### Clues if stuck

- **Nudge 1:** "Open Network tab, click RESYNC. What request fires?"
- **Nudge 2:** "Right -- nothing fires. So where is the data coming from?"
- **Nudge 3:** "Try Application tab -> Local Storage."

### What a candidate should find

**Network tab** filtered by Fetch/XHR, click RESYNC repeatedly -> **no request fires**. That's signal #1 -- RESYNC isn't talking to the server.

**Application tab -> Local Storage -> key `jarvis_suits_cache_v1`**:

```json
{
  "at": 1776013985095,
  "mark": "",
  "data": {
    "suits": [...],
    "server_timestamp": "2026-04-17T03:01:22.123Z",
    "heartbeat": 88246,
    "mark_queried": null
  }
}
```

`at`, `server_timestamp`, and `heartbeat` never advance. The UI hint *"if this does not advance on RESYNC, inspect Network"* is intentional misdirection -- the real answer is Application / Storage.

### Where it lives

`app/suits/page.tsx`, in `loadSuits`:

```tsx
const raw = window.localStorage.getItem(CACHE_KEY);
if (raw) {
  const cached = JSON.parse(raw);
  if (cached.mark === mark && Date.now() - cached.at < CACHE_TTL_MS) {
    setSuits(cached.data.suits);
    setLastSync(cached.data.server_timestamp);
    return;  // <-- never fetches
  }
}
```

And in `resync`:
```tsx
async function resync() {
  await loadSuits(markApplied);  // forceNetwork not passed
}
```

### Fix

```diff
  async function resync() {
-   await loadSuits(markApplied);
+   await loadSuits(markApplied, { forceNetwork: true });
  }
```

Alternative: drop the cache entirely, or set a short TTL (30s) so real usage hits the network.

### API to clear / bypass

```
GET https://jarvis-nine-coral.vercel.app/api/admin/flush-cache
```

Returns `Clear-Site-Data: "cache", "storage"` -- purges `localStorage` for the origin. Then reload `/suits` -- fresh fetch, heartbeat advances.

**Manual escape:** Application -> Local Storage -> right-click `jarvis_suits_cache_v1` -> Delete. Same effect.

### Verify the cache is really there

In DevTools Console on `/suits`:
```js
JSON.parse(localStorage.getItem("jarvis_suits_cache_v1"))
```
You see `{ at, mark, data: { suits, server_timestamp, heartbeat } }`. Click RESYNC a few times, rerun -- nothing has changed.

### Follow-up questions if solved

- "What's the difference between HTTP cache and `localStorage` cache? When would you use each?"
- "You're in a Python service with a Redis cache. Same class of bug -- what does the fix look like? (Cache busting on write, short TTL, `stale-while-revalidate` pattern.)"
- "How would you design this cache layer if users on different devices need consistency? (Server-side cache or versioned key on ETag.)"
- "Why did logout not clear it? (Cookie vs storage -- different lifecycle.)"

### Signal rubric

| Behavior | Read |
|---|---|
| Notices Network tab stays empty on RESYNC | Good |
| Opens Application -> Local Storage, finds `jarvis_suits_cache_v1` | Strong |
| Spots `at` / `server_timestamp` don't change | Staff-level |
| Reads the component source and finds the TTL path | Staff-level |
| Clicks RESYNC repeatedly without opening Network | Weak |
| Assumes server bug, ignores client storage | Red flag |

---

# Bug 5 -- HARD -- Race condition on filter

### Concept

**Stale async responses clobbering newer state.** When a component fires a request, the response handler writes to state whether or not the user has moved on. If response 1 is slow and response 2 is fast, the user sees the correct result (2) -- then later sees it get overwritten by the stale result (1). This is a **last-response-wins** bug, not a **last-request-wins** behaviour the user expects.

Fix options, canonical to staff-level front-end: (a) `AbortController` + thread the signal into `fetch`, (b) monotonic request ID -- on each call increment a ref, ignore responses whose ID is not the latest, (c) switch to a data-fetching lib with built-in request cancellation (react-query / SWR).

### How to reproduce

1. On `/suits`, type `3` in the filter -> **APPLY**. Request hangs (~5 s). `QUERYING VAULT...` spinner.
2. Within ~1 s (before mark=3 returns), clear the input, type `85` -> **APPLY**.
3. Mark 85 returns in ~200 ms -> `SHOWING MARK 85` renders, only Mark LXXXV visible.
4. Wait ~1-2 s. Mark 3's response finally arrives and clobbers state -> `SHOWING MARK 3`.

### Symptom

`SHOWING MARK 85` briefly, then **flips back to `MARK 3`** without the user touching anything. Filter input still says `85`, header says `MARK 3`.

Mid-flight (after Mark 3 APPLY, before response):

![Bug 5 mid-flight](./screenshots/06_bug5_race_midflight.png)

Final clobbered state -- the stale mark=3 response arrived and overwrote Mark 85:

![Bug 5 final state -- clobbered](./screenshots/06_bug5_race_final_clobber.png)

### Backend latency (intentional)

```json
{ "mark3_ms": 5000, "mark85_ms": 220 }
```

The backend in `app/api/suits/route.ts` applies a **quadratic inverse-mark delay** -- smaller mark = slower. Mark 3 is ~20x slower than Mark 85. The gap is tuned so `MARK 85` is visible ~1-2 s before the stranded mark=3 response clobbers it.

### Clues if stuck

- **Nudge 1:** "Open Network tab and reproduce. What do you see?"
- **Nudge 2:** "Look at the waterfall -- which request finished last?"
- **Nudge 3:** "What happens to an in-flight fetch when a new filter fires? Is it cancelled?"

### What a candidate should find

Open **Network tab -> Fetch/XHR**:

- `suits?mark=3` -- **~5 s** total (still pending when mark=85 returns)
- `suits?mark=85` -- **~200 ms** total

The **Waterfall** column tells the story. The 85 request returns first, paints Mark 85. The 3 request returns ~2 s later -- and its handler writes state last, overwriting Mark 85.

Core insight the candidate must name: **there is no request cancellation**. The in-flight fetch for Mark 3 is never aborted when Mark 85 is requested, so its late response clobbers state.

### Where it lives

`app/suits/page.tsx`:

```tsx
useEffect(() => {
  loadSuits(markApplied);
  // intentionally no AbortController
}, [markApplied]);
```

### Fix

```diff
  useEffect(() => {
-   loadSuits(markApplied);
+   const controller = new AbortController();
+   loadSuits(markApplied, controller.signal);
+   return () => controller.abort();
  }, [markApplied]);
```

Plus thread the `signal` into `fetch(...)` inside `loadSuits`.

**Alternative:** monotonic request counter -- on each call `reqId.current++`, remember it locally, and ignore responses whose ID isn't the latest.

### API to clear / bypass

**No session bypass -- the race is the test.** If the candidate is stuck and time is short, reload the page to reset filter state, or skip to the summary.

### Verify via curl (shows the latency gradient)

```bash
# Should take ~5s
time curl -s -o /dev/null -H "Cookie: jarvis_session=<...>" \
  "https://jarvis-nine-coral.vercel.app/api/suits?mark=3"

# Should take ~220ms
time curl -s -o /dev/null -H "Cookie: jarvis_session=<...>" \
  "https://jarvis-nine-coral.vercel.app/api/suits?mark=85"
```

### Follow-up questions if solved

- "Same bug in a Python Celery worker -- you kick off a long task, user changes filter, kicks off a shorter task, short task finishes first, long task overwrites. What's the fix? (Idempotency key + version check on write, or revoke-on-supersede.)"
- "AbortController vs request ID -- when would you prefer each? (Abort frees connection / server resources; request ID is simpler and composes across frameworks.)"
- "If this were a POST that mutated data, not a GET, how does your answer change? (You can't safely abort a mutation without knowing if the server received it. Use idempotency keys + client-side revision check.)"
- "How does react-query solve this? (Query keys + automatic cancellation of superseded queries.)"

### Signal rubric

| Behavior | Read |
|---|---|
| Opens Network and compares waterfall | Good |
| Names "race condition" or "last-response-wins" | Strong |
| Proposes AbortController or request-id guard | Staff-level |
| Notices response timing inversely correlates with mark | Exceptional |
| Concludes "the backend is flaky" | Red flag |

---

# Interviewer flow (30 min)

| t | Action | Expected candidate move |
|---|---|---|
| 0:00 | Share URL + capitalised credentials. "Log in, narrate as you go." | -- |
| 0:00-0:03 | Types capitalised email -> Bug 1 triggers | Network tab -> response body |
| 0:03-0:05 | Nudge if stuck: "what does the server actually say?" | Reads the `detail` field |
| 0:05 | Types lowercase -> login OK -> `/suits` UNAUTHORIZED -> Bug 2 | Application tab -> Cookies -> Path |
| 0:07 | Nudge: "the login worked -- where did the session go?" | Inspects cookie attributes |
| 0:08 | Use `/api/admin/grant` to bypass, navigate to `/suits` | Gallery loads |
| 0:09 | "Click on a suit -- anything off?" -> Bug 3 | Network -> API payload comparison |
| 0:12 | Nudge: "compare the API response to what's rendered" | Spots snake_case vs camelCase |
| 0:14 | "Go back, click RESYNC a few times" -> Bug 4 | Network empty -> Application -> localStorage |
| 0:18 | Nudge: "what does the browser do on hard-refresh?" | Cache connection |
| 0:20 | "Filter by Mark 3, then quickly Mark 85" -> Bug 5 | Network waterfall -> race |
| 0:25 | If nailed early: "how would you fix it?" | AbortController / request-id |
| 0:28 | Wrap: "which would you prioritize fixing first, and why?" | Judge prioritisation |

### Pass bar

- **Strong:** Diagnoses 3+ of 5 bugs cleanly, including one of Bug 3/4/5, names the correct DevTools artifact per bug, proposes a concrete fix for at least one medium/hard bug.
- **Pass:** Diagnoses Bug 1 and Bug 2 without major prompts, progresses on at least one medium bug.
- **Fail:** Opens only Console. Blames backend without reading response body/headers. Refreshes in a loop.

### Red flag phrases

- "It's a backend issue" -- without opening Network.
- "The cache tab is empty so there's no cache problem" -- Application -> Cache Storage != HTTP cache != localStorage.
- "The API fields look fine" -- without comparing to what the UI reads.
- "The response looks the same so the request must be wrong" -- on Bug 5, misses that *order* of responses matters, not content.

### Why these bugs for a backend engineer

| Bug | Tests | Relevance |
|---|---|---|
| 1 (email case) | Response-body inspection | 200-with-error-body is a common REST pattern |
| 2 (cookie path) | Cookie / header inspection | Maps to `set_cookie(path=...)` in Flask / FastAPI |
| 3 (snake_case) | Payload vs UI comparison | Python vs JS naming -- #1 integration friction |
| 4 (cache) | Network + Storage tabs | Mirrors Redis / DB cache invalidation |
| 5 (race) | Network waterfall | Async concurrency -- asyncio / Celery patterns |

---

# Reset between candidates

```
https://jarvis-nine-coral.vercel.app/admin/reset
```

Purges the session cookie and flushes browser storage (via `Clear-Site-Data`). All five bugs re-arm.

![Admin reset page](./screenshots/08_admin_reset.png)

---

# Local dev

```bash
git clone https://github.com/telladheerajnaidu/jarvis
cd jarvis
npm install
npm run dev
# http://localhost:3000
```

`.env.local`:

```
JARVIS_ADMIN_EMAIL=admin@jarvis.local
JARVIS_ADMIN_PASSWORD=jarvis
JARVIS_ADMIN_NAME=Admin
JARVIS_SECRET=<32-byte hex>
```

Bugs behave identically on localhost.
