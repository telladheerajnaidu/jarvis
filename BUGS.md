# Bug Reproduction + Fix Guide

This is the interviewer-facing reference. Every bug in the app is planted on purpose. This doc tells you:

- How the candidate will **trigger** it (the observable symptom)
- Where it **lives** in the code (file + lines)
- What the candidate should **see in DevTools**
- The exact **fix** (diff-style)

Keep this page open during the interview.

---

## Bug L1 — Case-sensitive email comparison

### Trigger
Candidate logs in with `Tony@stark.com` / `jarvis` (capital T).

### Symptom
Generic error in the UI: `AUTHENTICATION REJECTED // SEE TERMINAL`.

### DevTools
- Open **Network tab** -> find `POST /api/login`
- Status: **200 OK** (not 401 — this is the trick)
- Open **Response**:
  ```json
  {
    "success": false,
    "error": "INVALID_CREDENTIALS",
    "detail": "EMAIL_CASE_MISMATCH: email comparison is case-sensitive on the server"
  }
  ```
- **Tests:** candidate must know that HTTP 200 does not mean business success — they must read the response body.

### Where it lives
`app/api/login/route.ts` line ~7:
```ts
const user = USERS.find((u) => u.email === email && u.password === password);
```

### Fix
```diff
- const user = USERS.find((u) => u.email === email && u.password === password);
+ const user = USERS.find(
+   (u) => u.email.toLowerCase() === String(email).toLowerCase() && u.password === password,
+ );
```

---

## Bug L3 — Auth cookie set on wrong path

### Trigger
Candidate logs in correctly (lowercase email). They're redirected to `/suits`.

### Symptom
`/suits` page shows: `UNAUTHORIZED // SESSION TOKEN REJECTED BY /api/suits`.

### DevTools
- **Application tab** -> Cookies -> your domain
- Find `jarvis_session` cookie — note **Path column reads `/admin`**, not `/`
- Switch to **Network tab** -> find `GET /api/suits` -> Request Headers have no `Cookie` header (because browser scoped it to `/admin`)
- **Tests:** candidate must know cookie scoping (Path, SameSite, Secure) and use the Application tab.

### Where it lives
`app/api/login/route.ts` line ~27:
```ts
res.cookies.set(COOKIE_NAME, token, {
  httpOnly: true,
  sameSite: "lax",
  path: "/admin",          // <-- BUG
  maxAge: 60 * 60 * 8,
});
```

### Fix
```diff
- path: "/admin",
+ path: "/",
```

### Quick unblock during interview (without changing code)
Open DevTools -> Application -> Cookies -> edit the `jarvis_session` row, change Path from `/admin` to `/` -> refresh. Candidate can continue exploring the suits page.

---

## Bug S1 — Download missing `Content-Disposition` header

### Trigger
From any suit detail page, click **DOWNLOAD SPEC SHEET**.

### Symptom
- In Chrome: file downloads but named like a random UUID or no extension, sometimes opens inline
- In Firefox: opens as a text page, not a download
- Depends on browser content sniffing

### DevTools
- **Network tab** -> click the button -> find `GET /api/suits/<id>/spec`
- Status: 200 OK
- **Response Headers panel**: shows `Content-Type: text/csv` but **no `Content-Disposition` header**
- **Tests:** candidate must know that downloads need `Content-Disposition: attachment; filename="..."` to be saved with a proper name.

### Where it lives
`app/api/suits/[id]/spec/route.ts` end of file:
```ts
return new Response(csv, {
  status: 200,
  headers: {
    "Content-Type": "text/csv",
  },
});
```

### Fix
```diff
  return new Response(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv",
+     "Content-Disposition": `attachment; filename="mk${suit.mark}_spec.csv"`,
    },
  });
```

---

## Bug S4 — Payload/UI key mismatch (snake_case vs camelCase)

### Trigger
Open any suit detail page, look at the **CORE SPECS** panel.

### Symptom
- `POWER OUTPUT` shows `—`
- `TOP SPEED` shows `—`
- All other fields render correctly

### DevTools
- **Network tab** -> `GET /api/suits/<id>` -> **Preview/Response** panel
- Response payload has `power_output: "9.2 GW"` and `top_speed: "Mach 4.0"` (snake_case)
- **Elements tab** or **React DevTools** -> the component reads `suit.powerOutput` and `suit.topSpeed` (camelCase) — these are `undefined`
- **Tests:** candidate must compare API payload shape against what the component reads.

### Where it lives
`app/suits/[id]/page.tsx` ~line 195 (in the CORE SPECS section):
```tsx
<SpecRow label="POWER OUTPUT" value={suit.powerOutput ?? "—"} />
<SpecRow label="TOP SPEED" value={suit.topSpeed ?? "—"} />
```

### Fix
```diff
- <SpecRow label="POWER OUTPUT" value={suit.powerOutput ?? "—"} />
- <SpecRow label="TOP SPEED" value={suit.topSpeed ?? "—"} />
+ <SpecRow label="POWER OUTPUT" value={suit.power_output} />
+ <SpecRow label="TOP SPEED" value={suit.top_speed} />
```

Also remove the `powerOutput` / `topSpeed` fields from the `SuitView` type at the top of the file (they're fake).

---

## Bug S5 — Stale filter state, empty query param

### Trigger
Gallery page -> type `42` in the Mark filter -> click **APPLY**.

### Symptom
All suits still show. Filter visibly does nothing.

### DevTools
- **Network tab** -> find `GET /api/suits?mark=`
- Query param value is empty, regardless of what was typed
- **React DevTools** (if installed) -> inspect `SuitsPage` state -> `markInput` updates on keystroke, but `markApplied` stays `""` forever
- **Tests:** candidate must understand React state closures / stale state and read request params.

### Where it lives
`app/suits/page.tsx` line ~50 in `applyFilter`:
```tsx
function applyFilter(e: React.FormEvent) {
  e.preventDefault();
  loadSuits();    // <-- never calls setMarkApplied, so markApplied stays ""
}
```

### Fix
```diff
  function applyFilter(e: React.FormEvent) {
    e.preventDefault();
-   loadSuits();
+   setMarkApplied(markInput);
  }
+
+ useEffect(() => {
+   loadSuits();
+ }, [markApplied]);
```

(The `useEffect` ensures `loadSuits` runs with the fresh `markApplied` value. Calling `loadSuits()` right after `setMarkApplied(...)` would read the old state because React batches updates.)

---

## Interview flow cheat sheet

| Time | Move | Expected candidate action |
|---|---|---|
| 0:00 | Share URL + `tony@stark.com` / `jarvis` | "Can you log in and explore?" |
| ~0:30 | Watch them type `Tony@...` (L1 triggers) | Should open Network tab, read response body |
| ~3:00 | They fix/retry with lowercase -> login succeeds -> /suits shows UNAUTHORIZED (L3) | Should open Application -> Cookies |
| ~6:00 | Unblock cookie manually (edit Path to `/`) | They reach the gallery |
| ~7:00 | Ask them to filter by Mark 42 (S5) | Should see empty `mark=` in Network |
| ~9:00 | Ask them to open Mark 50 detail (S4) | Should spot `—` for POWER OUTPUT; check Network vs UI |
| ~11:00 | Ask them to Download Spec Sheet (S1) | Should inspect response headers |
| ~14:00 | Wrap, ask what they'd fix first and why | Judge prioritization |

Good candidates hit 2-3 of these cleanly. Exceptional candidates narrate hypothesis -> tab -> finding -> fix as they go.

**Red flag:** They open Console and stop there. Or they say "must be a backend bug" without checking Network. Or they refresh without reading the response.
