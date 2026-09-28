# PMS cloud API — Cloudflare Worker + D1

All desks share one database (Cloudflare D1). Each desk logs in with its own name and password.

| Role | Can |
|---|---|
| `desk` | see both sites, change slips of **its own site** |
| `viewer` | see only (phones, supervisors) |
| `admin` | everything, plus create/disable desks and read the change log |

Files: `worker.js` (the API, one file, no dependencies) · `schema.sql` (tables) ·
`wrangler.toml` (only for command-line deploys) · `../tools/make_desk.py` (first admin login).

## Deploy — in the Cloudflare dashboard (nothing to install)

1. **Create the database.** Dashboard → *Storage & Databases* → *D1* → **Create** → name it `pms`.
2. **Create the tables.** Open the `pms` database → *Console* → paste all of `schema.sql` → **Execute**.
3. **Create the first admin.** On your computer:
   ```
   python tools/make_desk.py Admin makkah admin
   ```
   Type a strong password twice. Copy the `INSERT …` line it prints, paste it into the same D1 console → **Execute**.
4. **Create the Worker.** *Workers & Pages* → **Create** → *Hello World* worker → name it `pms-api` → **Deploy**.
   Then **Edit code**, replace everything with the contents of `worker.js` → **Deploy**.
5. **Connect the database.** Worker → *Settings* → *Bindings* → **Add** → *D1 database* →
   variable name `DB`, database `pms` → **Save**.
6. **Allow the PMS site.** Worker → *Settings* → *Variables and Secrets* → **Add** → type *Text*,
   name `ALLOWED_ORIGINS`, value `https://faizehashemi.github.io` → **Save** (then *Deploy* if asked).
7. **Check it.** Open `https://pms-api.<your-subdomain>.workers.dev/api/health` — it should show `{"ok":true,…}`.
8. **Point the PMS at it.** In `pms/app/config.js` set
   `export const API_URL = 'https://pms-api.<your-subdomain>.workers.dev';` and publish the site.

## Updating an existing deployment

**With wrangler (set up on the desk computer, signed in as tkamlapur@gmail.com)** — from this folder:
```
npx wrangler d1 execute pms --remote --file schema.sql   # only adds what is missing
npx wrangler deploy                                       # uploads worker.js
```
`wrangler.toml` already names the Worker (`pms-api`), the database (`pms`) and keeps dashboard variables.

**Without wrangler (dashboard)** — whenever `worker.js` or `schema.sql` change (e.g. the Rooms &
Buildings update added the `buildings` table, and the travel-times update the `settings` table):

1. D1 → `pms` → *Console* → paste all of `schema.sql` → **Execute**. It only creates what is missing;
   existing slips, desks and logins are untouched.
2. Worker `pms-api` → **Edit code** → replace everything with the new `worker.js` → **Deploy**.
3. Check `https://pms-api.tkamlapur.workers.dev/api/health`.

Until the Worker is updated, the PMS keeps working: Rooms & Buildings shows a notice, and travel times
use the defaults (3 h / 6 h) and cannot be saved.

`PATCH /api/desks/:id` (admin) also takes `pages`: a list of page ids that login may open, or `null` for
all pages; unlike the other desk changes it does not log the desk out. `/api/login` and `/api/me` return
`desk.pages` (always `null` for admins).

`DELETE /api/desks/:id` (admin) — removes a login for good (not your own, not the last active admin); its
name is kept in `deleted_desks` for the change log. New logins never reuse a deleted login's id.

KG roster (one per site): `GET /api/kg?site=` · `POST /api/kg/op` `{ site, op: add-person | remove-person |
bookmark | reset, name }` · `POST /api/kg/log` `{ site, entries: [{ ts, person, type, location }] }` (duplicates
ignored) · `DELETE /api/kg/log/:id` — writes follow the same site rights as slips.

`GET /api/me/prefs` · `PUT /api/me/prefs` `{ prefs }` (any login, own row only) — the login's Settings as
one JSON object (max 16 KB).

`POST /api/me/password` (any login) `{ current, password }` — changes the caller's own password; wrong
current passwords count towards the login lockout; other sessions of that desk are ended.

`GET /api/settings` (any login) · `PUT /api/settings` (admin): `arrival_commute_hours`,
`departure_lead_hours` (0–24, quarter hours), `transfer_checkin_time`, `transfer_checkout_time` (HH:MM).

## Deploy — from the command line (alternative)

Needs Node.js.
```
cd worker
npx wrangler login
npx wrangler d1 create pms                  # copy the database_id into wrangler.toml
npx wrangler d1 execute pms --remote --file schema.sql
python ../tools/make_desk.py Admin makkah admin   # then:
npx wrangler d1 execute pms --remote --command "<the INSERT it printed>"
npx wrangler deploy
```

## First day

1. Log in to the PMS as **Admin** → **Setup** → *Desk logins* → add one login per desk, e.g.
   `Makkah Desk 1` (Makkah, desk), `Medina Desk 1` (Medina, desk), `Supervisor phone` (viewer).
2. On **each computer that has old slips**: log in as that computer's desk → **Setup** →
   *Move this browser's old data to the cloud* → **Upload**. (Safe to repeat; nothing is duplicated.)
   Medina slips can only be uploaded by a Medina desk or the admin.
3. UMS auto-import: switch it on in the **UMS** page on **one** desk per site.

## Rooms & Buildings

`GET /api/buildings` (any login) · `POST /api/buildings` · `PUT /api/buildings/:id` (with `version`) ·
`DELETE /api/buildings/:id?version=` — writes follow the same site rights as slips. One row per building
holds its rooms (`room_no`, `floor`, `capacity` 0–50, `type`, `notes`, `active`); room numbers must be
unique in a building. Saving an old version is refused with 409, like slips.

## How it behaves

- **Sync:** each browser keeps a copy and downloads only changes (every 30 s, on every page, and when
  the connection returns). Logging out deletes the copy from that computer.
- **Offline:** pages keep working from the copy; saving waits until the connection is back.
- **Two desks, one slip:** each save carries the slip's version. If someone saved in between, the second
  save is refused with “Someone else changed this slip” instead of silently overwriting.
- **UMS imports** are idempotent on the server too: a stay that already exists is never created twice,
  even if two desks import the same file at the same moment.
- **Deletes** are soft (kept in the database, hidden everywhere); ask for a restore via D1 if needed.
- **Security:** passwords are stored as PBKDF2 hashes; login is locked for 15 minutes after 10 wrong
  passwords; only a hash of each login token is stored; changing or disabling a desk logs it out everywhere;
  `<` and `>` are stripped from all slip text; every change is in the audit log (Setup, admin only).

## Limits (free plan)

D1 free: 5 GB storage, 5 M row reads/day, 100 k writes/day — far above what the PMS needs
(a full UMS import is ~600 writes; syncs read only changed rows). Imports are sent in chunks of 45 slips.

## Testing without Cloudflare

`python tools/devserver.py`, open http://localhost:8766/pms/, then in the browser console:
```js
const h = await import('/tools/d1-harness.js');     // runs worker.js on real SQLite (sql.js) in the page
const api = await h.start();
await api.addDesk('Admin', 'makkah', 'admin', 'admin-pass-1');
h.routeFetch((await import('/pms/app/config.js')).API_URL);
```
then log in on the page. The harness lives in memory: reloading the page resets it.
