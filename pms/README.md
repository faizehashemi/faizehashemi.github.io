# Faiz E Hashemi — PMS

Accommodation management for pilgrim groups: slips (group → building → rooms), occupancy,
check-ins/check-outs, printing, meal counts and grouping stickers. One single-page app serves
both sites (**Makkah** and **Medina**) from one codebase. The pages are static files on GitHub Pages;
the data lives in a Cloudflare Worker + D1 database shared by every desk (`worker/`).

## Using it

Open **https://faizehashemi.github.io/pms/** and log in with your **desk's name and password** (created by the admin on the
Setup page). A `desk` login changes its own site and views the other; a `viewer` login (phones)
only views; `admin` does everything. The top bar has:

- **Menus by category** — *Front desk* (Slip, Check-ins, Movement, Print slips), *Rooms* (Forecast,
  Grid, Timeline, Rooms & Buildings), *Groups & meals* (Grouping, Group export, KG, Mawaid),
  *Data* (UMS import, Slip admin, Setup), *Help*. `Alt+1` … `Alt+0` still open Slip, Forecast, Grid,
  Timeline, Check-ins, Grouping, KG, Print, Admin, Mawaid. Categories live in `NAV` in `app/config.js`.
- **Makkah | Medina** — which site you are looking at.
- Your desk (menu with Setup and **Log out**) and the sync state (green = synced, orange = offline).

On phones and small tablets (≤ 900 px) the bar shrinks to ☰ + the page name and the menu opens as a
side drawer. Data tables turn into cards (≤ 700 px); wide forms and toolbars re-flow. Laptop layouts
are unchanged. The footer carries the support number (+91 77479 45253).

**Rooms & Buildings** (Rooms menu) holds every building, room and bed count per site — editable,
seeded once from the original room lists (MOHAMMEDI, MUFADDAL, SNOOD, BAHA: 705 rooms, 2,748 beds).
Slip (Fetch & Assign, availability check), Forecast, Grid, Timeline and Home take capacities from
there; for a building not in the builder they fall back to capacities remembered from old slips.

URLs look like `#/makkah/slip?sh_no=38480`, so any page can be bookmarked or shared.
Old links (`pms/accommodation_slip.html?sh_no=…`, `pms_web/movement.html`, …) still work: each
old file is now a tiny redirect to its new route.

## Layout

Everything the browser loads lives in `pms/` (paths below are inside it unless they start with `/`).

```
/index.html             forwards to pms/
index.html              shell: <site-nav> + the view outlet
app/config.js           API address + everything site-specific (buildings, UMS city names)
app/main.js             login gate, hash router, view lifecycle, background sync
app/core/db.js          the ONLY code pages use for slips (cloud API + synced copy)
app/core/cloud.js       login session, API client, local mirror, incremental sync
app/core/nav.js         the top bar / phone drawer (categories from NAV in config.js)
app/core/rooms.js       buildings, rooms, capacities from Rooms & Buildings (cached for offline)
app/core/cards.js       labels table cells so data tables become cards on phones
app/core/responsive.css shell footer + all phone/tablet rules (loaded after each page's CSS)
app/core/analytics.js   PostHog (off until POSTHOG.key is set in config.js)
app/core/lib.js         on-demand loader for jsPDF / docx / FileSaver
app/data/rooms-seed.json  original room lists (room numbers + beds only) for the builder's seed
app/views/<id>/         one folder per page: view.html + view.css + view.js
assets/                 logo, background images
*.html                  the old page names — redirects into the app (bookmarks keep working)
/pmsMedina/ /pms_web/ /pms_medina_web/   redirects only — keep until nobody uses old links
/worker/                the cloud API: worker.js, schema.sql, deploy guide (worker/README.md)
/extension/             Chrome extension: hourly UMS Group List fetch
/tools/devserver.py     local server with caching off (+ mock UMS for testing)
/tools/d1-harness.js    runs worker.js on in-browser SQLite for testing without Cloudflare
/tools/make_desk.py     creates the first admin login (SQL for the D1 console)
/tools/fixtures/        anonymised UMS export used for tests
```

Each view is the original page's markup, stylesheet and logic, moved into a module:
`view.js` exports `mount(ctx)` where `ctx = { db, site, siteId, params, navigate, href }`.
Only one view is mounted at a time, so each keeps its own page-level CSS. Listeners, elements
and styles a view adds to `window`/`document`/`<body>`/`<head>` are removed when you navigate away,
and a view still loading when you leave is stopped at its next data call.

## Data

One D1 database (`worker/schema.sql`); a slip is stored as the same JSON object the pages always
used, plus `site`, a `version` and a change counter. Every slip belongs to exactly one site.

- Each browser keeps a synced copy (IndexedDB `pms_cloud_mirror`) and downloads only changes —
  every 30 s, on each page, and when the connection returns. Logging out deletes that copy.
- Offline, pages still work from the copy; saving is refused until the connection is back.
- A save carries the slip's version; if another desk saved first, it is refused with
  “Someone else changed this slip” rather than overwriting.
- Slips from before the cloud switch are still in each browser's old database
  (`pms_accommodation_db`): **Setup → Move this browser's old data to the cloud** uploads them once
  (repeat-safe). Old slips with no building go to the uploading desk's site.
- Backups: **Admin → Export JSON** (per site). Import accepts old backups too.
- Still per-browser (not in the cloud): the KG roster and the Home page's building capacities.

## UMS import

The **UMS** page imports the UMS *Group List* export (`GroupList….xls`, an HTML table) into the
current site — by file, or automatically every hour through the Chrome extension in `extension/`
(setup: `extension/README.md`).

- One UMS row is one group; its itinerary becomes one slip per stay per city
  (e.g. Makkah → Madina → Makkah = two Makkah slips + one Medina slip). Each desk imports its own site only.
- **UMS owns** name, leader, pax and dates/times. **The PMS owns** building and rooms — never touched.
- A desk edit to a UMS field is kept until UMS itself changes that field; then UMS wins and the page
  lists it under *Needs attention*, together with stays whose dates changed while rooms are assigned.
- Existing slips with the same SH (typed by hand or from an older list) are adopted, not duplicated.
- A group's **second check-in at the same site** (e.g. Makkah again after Madina) gets its SH with a
  leading S: 44030 is the first check-in, **S44030** the second. Slip, Print and deep links accept
  both (S or s); the Slip page's stay picker lists both check-ins.
- Nothing is deleted. Stays that disappear from the export are listed under *Not in this export*.
- UMS gives only dates for moves between cities; the hotel times used then are in `UMS` in `app/config.js`.
- Code: `app/core/ums.js` (parse / plan / apply), `app/core/ums-auto.js` (extension bridge, auto-import).
  Test data: `tools/fixtures/ums-grouplist-sample.xls` (anonymised real export).

On the Slip page, an SH with more than one stay here gets a stay picker. Use **Edit** (not Save) on
imported slips; Save makes a separate copy.

## Travel times (Setup page, admin)

Slips show **hotel** times, not flight times. For UMS imports:
- hotel check-in = flight landing + *travel to the hotel* (default 3 h)
- last hotel check-out = flight departure − *leave before the flight* (default 6 h)
- moving between Makkah and Madina: check-out and check-in times of day (default 07:00 / 14:00)

An admin changes these on **Setup → Travel times**; they are stored on the server and the same for
every desk (defaults in `UMS` in `app/config.js`). Imported slips pick up a change at the next import
(desk edits to a time are kept; stays with rooms assigned show under *Needs attention*).

## Analytics (PostHog)

Connected to the US PostHog project (`POSTHOG` in `app/config.js`). Nothing is sent from `localhost`
(set `localStorage.pms_analytics_dev = '1'` to test locally). Sent: page views per route, login/logout, slip created/updated/conflict,
UMS import counts, building saved, going offline, and JavaScript errors. Desks are identified by their
desk login. Click autocapture masks all text and session recording is off, so guest names and phone
numbers on screen are not sent.

## Changing things

- **Buildings / endpoints** — edit `app/config.js`. Nothing else hardcodes them.
- **Add a page** — create `app/views/<id>/view.{html,css,js}` and add it to `VIEWS` in `app/config.js`.
- **Add a site** — add an entry to `SITES` in `app/config.js`.

## Local development

```
python tools/devserver.py
```

then open http://localhost:8766/pms/. (Any static server works; this one disables caching so edited
modules reload.) Opening `index.html` as a file does not work — ES modules need http.

## Security notes

- Desk logins, PBKDF2 password hashes, lockout after 10 wrong passwords, hashed session tokens,
  per-site write rights and an audit log — see `worker/README.md`.
- **Retire the old pipeline:** the two old Workers (`soft-bush-9b74`, `lively-wave-e397`) accept
  unauthenticated writes and the two snapshot Gists are public with guest names and phone numbers.
  Delete them once the cloud is live. Revoke the two Telegram bot tokens in @BotFather.
- The old seed files with real guest names (`pms/guest.json`, `pms/seed.json`, `pms/rooms_seed_*.json`) are no longer
  part of the site; they are in the backup folder only. Make sure they are removed from the GitHub repo too.
