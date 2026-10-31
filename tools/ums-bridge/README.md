# UMS bridge — Playwright automation for the legacy ASP.NET Web Forms UMS

Connects the PMS middleware to `https://ums.sigatulhaj.org` by driving a real browser: it logs in, navigates, fills and submits forms,
reads tables, downloads exports and keeps the session between runs. It is a **separate Node program** (not part of the website or the Worker).

**CAPTCHA is never bypassed.** When a reCAPTCHA / hCaptcha / Turnstile (or Google's "unusual traffic" page) blocks the way the bridge
stops, reports `awaiting_human`, and waits until a person has completed it in the browser window; then it carries on by itself. There is no solver,
no token injection and no stealth patching anywhere in this code.

## Set up (once)

```
cd tools/ums-bridge
npm install
npx playwright install chromium        # or skip it and use the Chrome / Edge already installed: set UMS_BROWSER_CHANNEL=chrome
```

Environment variables (a `.env` loader is deliberately not included — set them in the service / shell):

| Variable | Meaning |
|---|---|
| `UMS_USERNAME`, `UMS_PASSWORD` | the UMS login. Optional: without them a person logs in by hand in a visible window (the session is then stored) |
| `UMS_BASE_URL` | default `https://ums.sigatulhaj.org`. The browser may only visit this host (+ `UMS_ALLOWED_HOSTS`) |
| `UMS_LOGIN_PATH` | the login page path if the base URL does not show the form itself |
| `UMS_SESSION_KEY` | base64 of 32 random bytes (`openssl rand -base64 32`). Without it a random key file is created next to the session |
| `UMS_SESSION_TTL_HOURS` | how long a stored session may be reused (default 12) |
| `UMS_BRIDGE_TOKEN` | bearer token for the HTTP API (≥ 24 chars) |
| `UMS_BROWSER_CHANNEL` | `chrome` / `msedge` to use an installed browser |
| `UMS_CAPTCHA_HEADED` | default on: a hidden browser reopens **visibly** at the same page when a person is needed |
| `UMS_CAPTCHA_WAIT_IN_PLACE` | stay hidden and just wait (the browser is watched through a remote desktop) |
| `UMS_CAPTCHA_TIMEOUT_MS` | how long to wait for a person (default 15 min) |
| `UMS_SEL_USER/PASS/SUBMIT/LOGGED_IN/ERROR` | CSS selectors for the login form, if the defaults do not match the real pages |

Data (encrypted session, log, exports, failure screenshots) lives in `.ums-bridge/` (override with `UMS_BRIDGE_DIR`; it is git-ignored).

## First login (a person, in a window)

```
cd tools/ums-bridge
set UMS_BROWSER_CHANNEL=chrome          (uses the installed Chrome; omit it after `npx playwright install chromium`)
npm run login                            (add  -- --then export --out GroupList.xls  to let Playwright carry on straight away)
```

A browser window opens at `https://ums.sigatulhaj.org/login.aspx`. **You** enter the credentials, solve the CAPTCHA and press Login, the formal way — the bridge types
nothing and never touches the CAPTCHA. The moment you are logged in (the login page is gone) the session is stored encrypted and Playwright takes over in the same
window. Later runs reuse the stored session; when it expires and a person is needed again, the window reopens at the login page.

## Recording mode — capture how the UMS screens work

```
record-ums.bat arrivals        (or: set UMS_BROWSER_CHANNEL=chrome  &  npm run record -- --name arrivals)
```

A visible Chrome opens at the UMS login page. Log in yourself, then use the screens you want captured the way you normally would: open each page, search, page through,
press every button you would want automated. Press **Enter** in the terminal to snapshot the current screen at any moment (type a label first, e.g. `arrivals filtered`),
**q + Enter** to finish. Everything lands in `.ums-bridge/recordings/<time>-<name>/`:

| File | What |
|---|---|
| `index.json` | the steps in order: what triggered each (`navigation`, `async-postback` = an UpdatePanel change, `manual`), the control that was clicked, the URL |
| `NNN-….html` | the page's live DOM at that moment (after scripts ran) |
| `NNN-….summary.json` | forms and every control (name, id, type, label, options of selects), `__doPostBack` targets, tables (headers, sample rows, pager links), validators, UpdatePanels |
| `NNN-….png` | a screenshot |
| `requests.jsonl` | every page / XHR request: method, URL, form fields, status, content type, the UpdatePanel answer split into its parts |
| `downloads/` | files the UMS offered (the Excel exports) |

Passwords are never written (field values of type password and any `*pass*` form field are replaced), ViewState is reduced to its length, and cookies / Authorization headers are
never recorded. Guest data on the screens is recorded as it is.

## Using it from the PMS website (the PMS as the front end of the UMS)

The idea: the PMS pages are our own modern DOM; the legacy UMS stays the system of record behind them, and this bridge is the hands that read it and press its buttons.

1. On the desk computer, run `start-bridge.bat` (or `npm run serve` with `UMS_MANUAL_LOGIN=1`, `UMS_HEADLESS=0`). It prints a **token** once.
2. In the PMS open **UMS → UMS bridge → Connection**, paste the token, Save (address `http://127.0.0.1:8787`). The pill turns green.
3. **Log in to UMS** — a Chrome window opens at the UMS login page; you log in the formal way, CAPTCHA included. **Fetch Group List now** (or "every 15/30/60 min while this page is open")
   hands the export to the same review / auto-import as the Chrome extension.

How it is wired: `pms/app/core/ums-bridge.js` (the PMS client: pairing, jobs, status) → HTTP on `127.0.0.1` → this bridge → the real browser → UMS. The API answers browser calls
only for the PMS origins (`UMS_ALLOWED_ORIGINS` adds more), including Chrome's Private Network Access preflight, and refuses any other Origin or a non-loopback Host (DNS rebinding).
The token and address live in that browser's localStorage only. Any PMS page can now use `extractTable`, `submitForm`, `goto` from `ums-bridge.js` to show or drive other UMS screens.

## Use

**Command line** — `npm run login` (stores the session; a window opens if a person is needed), `npm run status`,
`npm run export -- --path /GroupList.aspx --out GroupList.xls`.

**Library**

```js
import { createBridge } from './src/index.js';
const bridge = createBridge();
bridge.on('captcha:required', e => notifyStaff(e));     // { kind, reason, url } — a person must act in the window
const { records } = await bridge.extractTable({ path: '/GroupList.aspx', selector: '#ctl00_ContentPlaceHolder1_gvGroups', paged: true });
await bridge.submitForm({ path: '/GroupList.aspx', fields: { txtFrom: '01/10/2026' }, submit: 'btnSearch' });
const file = await bridge.exportFile({ path: '/GroupList.aspx' });   // { fileName, path, bytes, body }
await bridge.close();
```

Field names may be the short ASP.NET names (`txtFrom` matches `ctl00$ContentPlaceHolder1$txtFrom`), an id/name, a CSS selector, or a label.
`submit` / `control` may be a selector or `{ postback: { target, argument } }` for a LinkButton / GridView pager. Full and UpdatePanel postbacks are both awaited;
if client-side validation stops a submit you get a `FormError` with the visible validator messages.

**HTTP API** (`npm run serve`, localhost only, `Authorization: Bearer <UMS_BRIDGE_TOKEN>`)

| Call | |
|---|---|
| `GET /health` | open; `{ ok: true }` |
| `GET /v1/status` | `state` (`ready`, `busy`, `awaiting_human` …), session age, last error |
| `POST /v1/login`, `/v1/logout` | |
| `POST /v1/goto` `{ path }` | |
| `POST /v1/forms/submit` `{ path?, fields?, submit?, expect? }` | |
| `POST /v1/extract/table` `{ path?, selector, fields?, submit?, paged? }` | `{ headers, rows, records }` |
| `POST /v1/export` `{ path?, fields?, control?, inline? }` | file saved under `.ums-bridge/exports`; `inline` adds base64 |

Add `?async=1` to a POST for `202 { jobId }` and poll `GET /v1/jobs/:id` — the right way to call it when a CAPTCHA may need a person. Jobs run one at a time.
Errors are `{ error, message, details }` with stable codes: `CAPTCHA_REQUIRED` (409), `CAPTCHA_TIMEOUT` (408), `SESSION_EXPIRED`, `AUTH`, `FORM`, `EXTRACT`, `NAVIGATION`, `CONFIG`, `BUSY`.

## How it behaves

- **Session**: after login the browser state is saved encrypted (AES-256-GCM, file mode 0600) and restored on the next start. Every job notices an expired session
  (login form, "session expired", 401/403) and logs in again once before retrying the job; a refused password is an `AuthError`, never a retry loop.
- **CAPTCHA**: checked after every navigation and before every login submit. A hidden browser is reopened visibly at the same page (or waits in place), nothing is
  submitted behind the challenge, and the session is saved once the person is done. If it may not open a window it fails with `CAPTCHA_REQUIRED` instead of guessing.
- **Safety**: credentials only from the environment; logs redact passwords, cookies, tokens and ViewState; navigation to other hosts is refused.
- **Failures** leave a screenshot in `.ums-bridge/debug/` and a line in `.ums-bridge/bridge.log`.

## Tests

`npm test` — unit tests (session encryption, redaction, CAPTCHA classification, selectors, config, the HTTP API with a fake bridge); no browser needed.
`npm run test:int` — runs the bridge in a real browser against a mock UMS (`test/integration/mock-site.js`: login, CAPTCHA widget, paged grid, export, session expiry).
The real UMS is never contacted by the tests.

## Relation to the Chrome extension

`extension/` (hourly export from a logged-in tab) keeps working. This bridge is for server-side / scheduled use where no one keeps a browser tab open:
call `exportFile` and hand `body` to the same import (`app/core/ums.js` parses the HTML table).
