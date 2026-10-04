# Faiz E Hashemi — PMS

Accommodation management for pilgrim groups: slips (group → building → rooms), occupancy,
check-ins/check-outs, printing, meal counts and grouping stickers. One single-page app serves
both sites (**Makkah** and **Medina**) from one codebase. The pages are static files on GitHub Pages;
the data lives in a Cloudflare Worker + D1 database shared by every desk (`worker/`).

## Using it

Open **https://pms.raajsoftware.com/** and log in with your **desk's name and password** (created by the admin on the
Setup page). A `desk` login changes its own site and views the other; a `viewer` login (phones)
only views; `admin` does everything. The top bar has:

- **Menus by category** — *Front desk* (Slip, Check-ins, Movement, Print slips), *Rooms* (Forecast,
  Grid, Timeline, Rooms & Buildings), *Groups & meals* (Grouping, Group export, KG, Mawaid),
  *Data* (UMS import, Slip admin, Setup), *Settings*. `Alt+1` … `Alt+0` still open Slip, Forecast, Grid,
  Timeline, Check-ins, Grouping, KG, Print, Admin, Mawaid. Categories live in `NAV` in `app/config.js`.
- **The site follows the login**: a Makkah desk works on Makkah, a Medina desk on Medina (there is no
  site switch). Only an **admin** can look at the other site: desk menu on laptops, a small link at the
  bottom of the drawer on phones.
- **Quick links** (optional) — a strip of your chosen pages under the bar (Settings → Quick links).
- Your desk (menu with Setup and **Log out**) and the sync state (green = synced, orange = offline).

On phones and small tablets (≤ 900 px) the bar shrinks to ☰ + the page name and the menu opens as a
side drawer. Data tables turn into cards (≤ 700 px); wide forms and toolbars re-flow. Laptop layouts
are unchanged. The footer has the support e-mail (taha@raajsoftware.com) and a link to Raaj Software (raajsoftware.com).

**Rooms & Buildings** (Rooms menu) holds every building, room and bed count per site — editable,
seeded once from the original room lists (MOHAMMEDI, MUFADDAL, SNOOD, BAHA: 705 rooms, 2,748 beds).
Slip (Fetch & Assign, availability check), Forecast, Grid and Timeline take capacities from
there; for a building not in the builder they fall back to capacities remembered from old slips.

URLs look like `#/makkah/slip?sh_no=38480`, so any page can be bookmarked or shared.
The old address **faizehashemi.github.io/pms/** (and every old page link) forwards to pms.raajsoftware.com with the
same page — except in a browser that still holds laundry bills saved offline there, which first sends them.
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
app/core/analytics.js   PostHog — disconnected (no key in config.js), sends nothing
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

**Pick rooms…** (Slip page, next to *Load*) opens a map of the slip's building for its check-in → check-out:
every room shows the beds free for the **whole** stay (capacity minus the busiest moment, counting every other
slip that overlaps) and a small timeline of when it is taken. **Click rooms to give them beds**: each click
gives the room as many free beds as the slip still needs for the chosen side (Gents / Ladies, from the slip's
counts), so the last room may get only part of its beds; when gents are done it carries on with ladies, and
when both are done it refuses more rooms. Click a chosen room again to take it back; the side panel shows
who else is in the last room clicked and fine-tunes its beds. *Fill automatically* does the same by itself;
*Apply to slip* fills the room tables (room, capacity, assigned). Rooms come from Rooms & Buildings (active rooms only, like the Grid); a room the slip still holds that is
deleted or switched off there shows dashed as *removed* — it can be taken off but not given beds. Only a building
with no rooms in the builder falls back to the room numbers on its slips. Code: `app/views/slip/room-picker.js`.

Beds needed: **Gents** = gents; **Ladies** = ladies + children (children sleep on the ladies' side; infants get no
bed). **Room for the group leader** (on by default, Gents unless switched to Ladies): the next room clicked — or the
smallest free room with *Fill automatically* — becomes the group leader's room with 1 bed, counted inside that side's
number; it is saved on the row as `gl: true` and shows a **GL** tag in the room table. Unticking it keeps the room as
an ordinary one. Beside *Pick rooms…* the slip shows, in large red type, the beds on its room tables against the
counts: *Gents x / gents* and *Ladies y / ladies + children*, marked *incl. GL* on the group leader's side.

## Home

The start page greets the desk by name and shows: **today at a glance** (check-ins and check-outs from
03:00 today to 03:00 tomorrow for this site, and guests in-house right now in Makkah),
**Fakkul Ehraam counts** (Makkah check-ins: *Morning* from 20:00 yesterday to 07:00 today, *Night* from 07:00
to 20:00 today including groups from Madina, and *Night · from Madina only* — SH starting with S; the times are
set on **Setup → Fakkul Ehraam windows**, setting `fe_windows`),
**today's thaals** (breakfast, lunch, dinner — the Mawaid page's rules and default settings, from
`app/core/meals.js`, which the Mawaid page uses too; the Fakkul Ehraam and thaal tiles each sit in one large card, and
every tile opens the groups behind its number — SH, group and leader, building and rooms, stay and guests,
`app/views/home/groups.js`), the **Gregorian and Misri Hijri date**
(`app/core/hijri.js`, the same tabular calendar as mumineencalendar.com), and at the bottom **building occupancy** (the old Home tiles, `app/views/home/occupancy.js`):
one battery per building with the share of its beds in use today (capacity from Rooms & Buildings, or a number
typed on the tile for a building not set up there) and a chart of guests by check-in date.

The **Jeddah flights** tile (Airlabs) was removed and Airlabs disconnected on 2026-10-03: the Worker has no
flight routes or cron any more and the `AIRLABS_KEY` secret is deleted. The `flight_board` table is left as it was.

**Currently in Makkah** opens the list of groups staying there right now (`app/views/home/inhouse.js`):
SH, group and leader, building and rooms, stay, guests (G/L/C/I) and beds, with checks for slips that look
wrong — no building or a building of the other city, no rooms, fewer or more beds than adults, total ≠
G+L+C+I, no SH / the same SH twice in-house, no group leader, a room listed twice. Search, sort (problems
first by default) and "only groups to check"; the SH opens the slip (where the login may open it).

Clicking the Hijri date opens the **in-house calendar**
(`app/views/home/calendar.js`): one Hijri month at a time with the Gregorian dates, miqaat markers (✨ major,
🌙 night, • other), month/year navigation and *Today*; click a day to see its miqaats. The miqaat list is the
Mumineen Calendar project's (github.com/mygulamali/mumineen_calendar_js, MIT licence), shipped in
`app/data/miqaats.json` with its licence in `app/data/miqaats.LICENSE.txt`; refresh that file from the project
to pick up new entries.

## Check-ins: Print slips and GL copy

Each table (Check-ins, Check-outs) has **Print slips** — every slip in that table, printed like the Print
slips page (A5 landscape, two copies per page, one page per slip). The slips open in a **new tab that holds
only the slips** (no page background or styles) and that tab opens the print dialog itself; allow pop-ups
for the site if the browser blocks it. There is also **GL copy**, a window with each slip
as an A5 card in its building colour: snip it, or *Copy picture* (PNG on the clipboard, paste into the group
leader's chat) or *Save JPEG*. The slip layout is shared with the Print slips page: `app/core/slip-print.js`.

**GL copy colours** (Setup → GL copy colours, admin): the ink of the GL copy per building — on the Print slips page's
*GL copy* and on Check-ins → *GL copy*. One row per building in Rooms & Buildings with a colour picker and hex box;
stored on the server as `gl_colors` (`{ "MOHAMMEDI": "#e8590c", … }`). Defaults: Mohammedi orange, Mufaddal purple,
Snood light green, Baha grey, Husn brown; a building without a colour prints black. Code: `glColors` / `glColor`
in `app/core/slip-print.js`.

**Print table** (Check-ins, each table) opens the rows shown in a tab of their own laid out for **A4 landscape,
1 cm margins**, and opens the print dialog: SH No · Group (group leader beneath) · Building · Rooms (wraps) · Total Pax ·
Check-in · Check-out, all centred (no As./G/L/C/I). The page on screen is unchanged. A missing group leader shows
as **-** on the table, slips and GL copies.

## Mawaid

Redesigned after the old `pms_web` Mawaid page: building table (BAHA+HUSN merged), **Cooking Count**
(BAHA+HUSN+MOHAMMEDI+MUFADDAL merged) and **Manda Counts** (lunch/dinner thals × multipliers, default 3 and
2.5); meal windows, thal size, which guests count (children/infants off by default) and breakdown columns are
set at the top. As before, a group checking in at exactly 15:00 is not counted for lunch that day.

## KG (Fakkul Ehraam & Atraaf roster)

The events on the KG page (e.g. *Aaje Raate Haram 08:30 PM*, *Kaale Fajare Haram*, *Aaje Dupehre Atraaf*) and their
times are set by an admin on **Setup → KG event times** (1–10 events, the same for every desk; setting `kg_sessions`).

One list per site in the cloud (tables `kg_meta`, `kg_log`): names, FE1 bookmark and every saved assignment
are the same on every desk of that site and refresh every 30 s. Ticks stay on your screen until *Save
assignment*. A browser that still has its own list from before offers **Move to cloud** once (names and
assignments are merged, nothing is duplicated). Viewers see the list but cannot change it.

On the Slip page, an SH with more than one stay here gets a stay picker. Once a slip is loaded, **Save is
locked** (it would make a duplicate) and **Edit** is highlighted; *Save a copy instead…* unlocks it after a warning.

## Travel times (Setup page, admin)

Slips show **hotel** times, not flight times. For UMS imports:
- hotel check-in = flight landing + *travel to the hotel* (default 3 h)
- last hotel check-out = flight departure − *leave before the flight* (default 6 h)
- moving between Makkah and Madina: check-out and check-in times of day (default 07:00 / 14:00)

An admin changes these on **Setup → Travel times**; they are stored on the server and the same for
every desk (defaults in `UMS` in `app/config.js`). Imported slips pick up a change at the next import
(desk edits to a time are kept; stays with rooms assigned show under *Needs attention*).

## Fakkul Ehraam windows (Setup, admin)

The three times behind the Home page's Fakkul Ehraam counts: *Morning from* (the day before, default 20:00),
*Morning ends / Night starts* (default 07:00) and *Night ends* (default 20:00). Stored on the server as
`fe_windows`, the same for every desk.

## Desk logins (Setup, admin)

Add, reset password, change role, disable/enable, or **Delete** a login. Delete is for good: the login is
logged out everywhere and its page access and personal settings are removed; slips and the change log stay
(the log shows it as “name (deleted)”, from the `deleted_desks` table). You cannot delete your own login or
the last active admin; to stop a login only for a while, use Disable.

## Laundry (Mohammedi Makan)

A simple laundry POS inside the PMS — built for workers who read little: big pictures of each item, big numbers,
icons, one SAVE button. **Workers** are ordinary desk logins with only *Laundry* ticked in Page access; the
**admin** runs *Laundry admin* from a PC. Everything is in the cloud database (tables `laundry_*`), so the PC
sees each bill as soon as it is saved (the dashboard refreshes every 20 s); D1 is the backup.

**Laundry** (touch screen, no keyboard; everything is cash): 🧺 *New bill* — swipe three wheels, building → floor →
room (from Rooms & Buildings; the in-house group of that room is kept on the bill; no name), tap item pictures (each
tap = one more; − / + in the list, tap the number for the number pad), the cash given and the change, SAVE → receipt.
🖨 Print sends an A5 receipt straight to the Canon LBP when Chrome runs with `--kiosk-printing` — start it with
`tools/laundry-kiosk.bat` (otherwise the print dialog opens). Clothes show the laundry's own drawings
(`pms/assets/laundry/*.png`, matched by item name: Saaya, Kurta, Pajama, Vest, Brief, Socks, Rida, Pardi, Ghagro,
Petticoat, T-shirt, Ehram) unless the admin gives the item a photo.
👷 *Staff only* — tap the staff category (admin-made; "Uncategorized" for the rest) → a window with its people → tap the person, check the **photo**, tap
items, SAVE: the laundry value is recorded, 0 is collected, nothing goes into cash; over a staff limit it warns, or
(if the admin set "approval needed") asks for a supervisor's admin login + password.
🏨 *Building* — the building's linen (Big towel, Small towel, Towel and Safra (Mawaid), Bedsheet, Blanket, Parda,
Pagdandi, Pillow covers): swipe the building, tap an item → number pad for the quantity, SAVE (no money).
💵 *Pending cash* — my cash bills from a date (to a date, or up to today), each **Unpaid** until the admin marks it
**Paid**; totals of both. **Offline**: bills are kept on the device (numbered OFFLINE-01…, listed on Pending cash) and
sent when the internet is back; each bill has an id made on the device, so a bill sent twice is stored once.

**Receipt numbers**: `MM-LD-YYYYMMDD-NNN` (Jeddah date, counted per day on the server; Medina `MD-LD-…`).
**Prices** are never in the code: *Laundry admin → Prices* (clothes and building linen, with a photo or emoji per
item, an optional second-language name, order, show/hide). A bill keeps each line's price at the time of billing;
price changes apply to new bills only. The worker cannot set prices (the server prices every line).

**Laundry admin** (PC): 🧾 *Bills* — cash bills only, from → to: unpaid / paid totals; mark a bill **Paid** (or back
to Unpaid), tick bills and mark them paid together, or enter the **amount collected** and the oldest unpaid bills that
fit are ticked (all audited); open a bill: details, change log, reprint; admin: **edit** room / quantities,
**cancel** with a reason — never deleted. 📈 *Reports* (today / yesterday / this or last week / this or last month /
custom: figures, daily sales chart, worker-wise, item-wise; **Excel** and **PDF** export), 👷 *Staff only* (dashboard,
staff-wise, the **register** like the paper card: photo, given, collection, count, value, status, accepted by; click a
staff member for the full history by month and transaction), 🏷️ *Prices*, 👤 *Staff* (profiles: photo from the camera,
staff ID, room, department, mobile, start date, remarks, active, limits per submission / day / week / month value /
month count, warn or require approval), 📝 *Notice & log* (the timings text shown to the worker and on receipts; the
laundry change log).

Rights (server-side): workers create bills and see their own bills;
admins and viewers see everything; only admins change prices, staff, bills and mark cash paid.
Not built yet (the tables leave room): WhatsApp/SMS receipts, QR status for customers, room/group monthly accounts,
several laundries, inventory, machines, attendance, expenses.

## Page access (Setup, admin)

**Setup → Page access** is a grid of pages × logins: tick what each desk or viewer login may open, then
*Save page access*. Unticked pages vanish from that login's menus, quick links and shortcuts, and opening
one by address shows a notice and goes to the login's start page. **Home is a page like the others**: a login
without Home starts on its first ticked page (menu order), and one with nothing ticked sees an empty page. Settings
is always open; admins see everything.
What a login may *change* still follows its role and site. Links from one page to another follow the same ticks: Check-ins shows the
*Open* (slip) column only with Slip access and *Print slips* / *GL copy* only with Print slips access; Home's links to
Check-ins, Mawaid and Rooms & Buildings (and the SH links in "Currently in Makkah") likewise. The desk picks the change up within a minute
(it re-reads `/api/me`), without being logged out. Stored in the `desk_pages` table (no row = all pages).

## Settings (per login)

**Settings** (top bar, or the desk menu) belong to the login and follow it to every device: saved on the
server (`desk_prefs` table, `GET`/`PUT /api/me/prefs`, only what differs from the defaults) with a copy
per login in the browser (`localStorage` `pms_prefs:<desk id>`) for instant start and offline use.
Changes made offline are sent when the connection returns; another device picks changes up within a
minute. Covered: quick links (pages shown under the menu bar, in your order), text/page size, table spacing, night mode / high contrast, reduce motion,
sticky menu, shortcut hints, sync text, footer, tables as cards on phones, start page and site,
every page's shortcut key and the modifier (Alt / Alt+Shift / Ctrl+Alt), Slip defaults (building,
check-in/out times, auto-load by SH, Pick rooms filter), sync interval and
analytics opt-out. Settings can be downloaded, loaded on another computer, or reset.
Code: `app/core/prefs.js` (defaults, apply) and `app/views/settings/`.

**Change password** (Settings, or the desk menu) works for every login: it needs the current password,
logs the desk out on other computers and keeps this one logged in (`POST /api/me/password`).

## Analytics (PostHog)

**Disconnected on 2026-10-03.** `POSTHOG.key` in `app/config.js` is empty, so `app/core/analytics.js` never loads
PostHog and sends nothing; the Settings switch for usage statistics was removed. To reconnect, put a project key
back (and the switch in Settings → Data & privacy).

## Changing things

- **Buildings / endpoints** — edit `app/config.js`. Nothing else hardcodes them.
- **Add a page** — create `app/views/<id>/view.{html,css,js}` and add it to `VIEWS` in `app/config.js`.
- **Add a site** — add an entry to `SITES` in `app/config.js`.

## Publishing

The site is **pms.raajsoftware.com**: the `pms/` folder served by Cloudflare (Worker `pms-web`, static assets,
custom domain on the raajsoftware.com zone; `web/wrangler.toml`). After changing anything in `pms/`:

```
cd web
sh deploy.sh
```

Also push to GitHub (faizehashemi.github.io keeps the source and the forwarding page). The API is the Worker
`pms-api` (`worker/`, `npx wrangler deploy` there); its `ALLOWED_ORIGINS` lists pms.raajsoftware.com and the old
github.io address. `pms/.assetsignore` keeps this README off the public site.

(`deploy.sh` stamps a new build id into `pms/version.json` and then runs `npx wrangler deploy`.)

## Updates and the Android app

- **Website updates reach everyone by themselves.** `app/core/update.js` checks `version.json` every 5 minutes
  and whenever the page comes back to the screen; a new build id shows "A new version of the PMS is out" and
  reloads after 10 seconds. Offline laundry bills survive (they are in localStorage).
- **Android app** (`android/`, package `com.raajsoftware.pms`) is a Trusted Web Activity built with Bubblewrap:
  it opens `https://pms.raajsoftware.com/?app=android&appv=<versionCode>` full screen in Chrome. It is published at
  https://raajsoftware.com/downloads/ (Worker `raaj-downloads`, source in `D:aajsoftware\downloads-site`).
  `pms/.well-known/assetlinks.json` holds the signing key's SHA-256 so Chrome hides the address bar.
- **Forcing a new APK:** bump `appVersionCode`/`appVersionName` and the `appv=` in `startUrl` in
  `android/twa-manifest.json`, run `bubblewrap update` and `bubblewrap build`, publish the APK on the downloads
  site, then set `android_min` (and `android_latest`) in `pms/version.json` to the new code and deploy. Older apps
  then show a blocking "Update required" screen whose only action is downloading the new APK.
- **The signing key** is `D:aajsoftwarendroid-keys\pms-release.jks` (passwords beside it). It is never
  committed. Keep a backup: a lost key means users must uninstall before installing a new app.

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
