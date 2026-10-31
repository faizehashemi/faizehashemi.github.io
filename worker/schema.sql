-- PMS cloud database (Cloudflare D1 / SQLite). Safe to run more than once.

-- One login per desk. site = the desk's own site (the only one it may change).
-- role: desk (read all, write own site) · viewer (read only) · admin (everything + manage desks)
CREATE TABLE IF NOT EXISTS desks (
    id          INTEGER PRIMARY KEY,
    name        TEXT NOT NULL UNIQUE COLLATE NOCASE,
    site        TEXT NOT NULL CHECK (site IN ('makkah', 'medina')),
    role        TEXT NOT NULL DEFAULT 'desk' CHECK (role IN ('desk', 'viewer', 'admin')),
    pw_hash     TEXT NOT NULL,              -- PBKDF2-SHA256, hex
    pw_salt     TEXT NOT NULL,              -- hex
    pw_iter     INTEGER NOT NULL,
    site_only   INTEGER NOT NULL DEFAULT 0,   -- 1 with role 'admin' = site admin: manages the logins of its own site only
    disabled    INTEGER NOT NULL DEFAULT 0,
    created_at  TEXT NOT NULL
);

-- Login sessions. Only a SHA-256 of the token is stored.
CREATE TABLE IF NOT EXISTS sessions (
    token_hash  TEXT PRIMARY KEY,
    desk_id     INTEGER NOT NULL REFERENCES desks(id),
    created_at  TEXT NOT NULL,
    expires_at  TEXT NOT NULL,
    user_agent  TEXT
);
CREATE INDEX IF NOT EXISTS sessions_desk ON sessions(desk_id);

CREATE TABLE IF NOT EXISTS login_failures (
    name  TEXT NOT NULL COLLATE NOCASE,
    at    TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS login_failures_name ON login_failures(name, at);

-- Slips. `data` is the whole slip as JSON (same shape the pages always used); the other columns
-- are copies for querying. `seq` increases on every change and drives incremental sync.
-- Deletes are soft (deleted = 1) so other desks learn about them.
CREATE TABLE IF NOT EXISTS slips (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    site          TEXT NOT NULL CHECK (site IN ('makkah', 'medina')),
    sh_no         TEXT,
    building      TEXT,
    checkin_date  TEXT,
    checkout_date TEXT,
    ums_key       TEXT,                     -- "SH|site|n" for slips created by the UMS import
    origin        TEXT UNIQUE,              -- "<device>:<local id>" for slips uploaded from a browser's old database
    data          TEXT NOT NULL,
    version       INTEGER NOT NULL DEFAULT 1,
    seq           INTEGER NOT NULL,
    updated_at    TEXT NOT NULL,
    updated_by    INTEGER,
    deleted       INTEGER NOT NULL DEFAULT 0,
    active_version INTEGER                  -- slip_versions.id whose content is slips.data (the version in use)
);
CREATE INDEX IF NOT EXISTS slips_seq ON slips(seq, id);
CREATE INDEX IF NOT EXISTS slips_site_sh ON slips(site, sh_no);
CREATE INDEX IF NOT EXISTS slips_ums ON slips(ums_key);

-- Full version history for every slip (Slip page → History): one append-only snapshot per real change (create / UMS
-- import / hand edit / delete), never removed. slips.data is always the ACTIVE snapshot (slips.active_version), so every
-- page and calculation reads the active version with no extra wiring. Marking an older snapshot active moves the
-- pointer and writes its content live; the next edit then branches from it (parent = the snapshot it was based on).
CREATE TABLE IF NOT EXISTS slip_versions (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    slip_id       INTEGER NOT NULL,
    site          TEXT NOT NULL,
    n             INTEGER NOT NULL,         -- v1, v2 … per slip
    parent        INTEGER,                  -- slip_versions.id this one was based on (NULL for the first)
    action        TEXT NOT NULL,            -- create | import | edit | delete | snapshot
    data          TEXT NOT NULL,            -- the full cleaned slip JSON at this point
    sh_no         TEXT,
    note          TEXT,
    at            TEXT NOT NULL,
    by            INTEGER                   -- desk id (joined to desks / deleted_desks for the name)
);
CREATE INDEX IF NOT EXISTS slip_versions_slip ON slip_versions(slip_id, id);
-- every new snapshot becomes the active one (activating an OLDER snapshot only moves the pointer, see activateSlipVersion)
CREATE TRIGGER IF NOT EXISTS slip_versions_active AFTER INSERT ON slip_versions
BEGIN
    UPDATE slips SET active_version = NEW.id WHERE id = NEW.slip_id;
END;

-- Buildings and their rooms (the Rooms & Buildings builder). One row per building; `data` holds
-- {"rooms":[{"room_no","floor","capacity","type","notes","active"}], "notes": ""}.
CREATE TABLE IF NOT EXISTS buildings (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    site        TEXT NOT NULL CHECK (site IN ('makkah', 'medina')),
    name        TEXT NOT NULL COLLATE NOCASE,
    sort        INTEGER NOT NULL DEFAULT 0,
    data        TEXT NOT NULL,
    version     INTEGER NOT NULL DEFAULT 1,
    updated_at  TEXT NOT NULL,
    updated_by  INTEGER,
    deleted     INTEGER NOT NULL DEFAULT 0
);
CREATE UNIQUE INDEX IF NOT EXISTS buildings_site_name ON buildings(site, name) WHERE deleted = 0;

-- Which pages a login may open (the admin ticks them on Setup). No row = every page.
-- Admin logins always see every page.
CREATE TABLE IF NOT EXISTS desk_pages (
    desk_id     INTEGER PRIMARY KEY REFERENCES desks(id),
    pages       TEXT NOT NULL,              -- JSON list of page ids, e.g. ["slip","checkins"]
    updated_at  TEXT NOT NULL
);

-- Each login's own Settings (look, quick links, shortcuts, Slip defaults…) so they follow it to any device.
-- Only what differs from the defaults is stored.
CREATE TABLE IF NOT EXISTS desk_prefs (
    desk_id     INTEGER PRIMARY KEY REFERENCES desks(id),
    prefs       TEXT NOT NULL,              -- JSON object
    updated_at  TEXT NOT NULL
);

-- KG page (Fakkul Ehraam & Atraaf duty roster), one per site: the name list + FE1 bookmark,
-- and one row per saved assignment.
CREATE TABLE IF NOT EXISTS kg_meta (
    site        TEXT PRIMARY KEY CHECK (site IN ('makkah', 'medina')),
    people      TEXT NOT NULL DEFAULT '[]', -- JSON list of active names, in list order
    archived    TEXT NOT NULL DEFAULT '[]', -- JSON list of archived names: kept with their history, hidden from assignment
    bookmark    TEXT NOT NULL DEFAULT '',
    version     INTEGER NOT NULL DEFAULT 1,
    updated_at  TEXT NOT NULL,
    updated_by  INTEGER
);
CREATE TABLE IF NOT EXISTS kg_log (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    site        TEXT NOT NULL CHECK (site IN ('makkah', 'medina')),
    ts          TEXT NOT NULL,              -- when the duty is (ISO)
    person      TEXT NOT NULL,
    type        TEXT NOT NULL,              -- FE1 | FE2 | Atraaf
    location    TEXT NOT NULL DEFAULT '',
    created_at  TEXT NOT NULL,
    created_by  INTEGER
);
CREATE UNIQUE INDEX IF NOT EXISTS kg_log_entry ON kg_log(site, ts, person, type, location);

-- Logins deleted on the Setup page: the name stays so the change log can still show who did what
CREATE TABLE IF NOT EXISTS deleted_desks (
    id          INTEGER PRIMARY KEY,
    name        TEXT NOT NULL,
    site        TEXT,
    role        TEXT,
    deleted_at  TEXT NOT NULL,
    deleted_by  INTEGER
);

-- Jeddah airport flight board — no longer used (Airlabs disconnected 2026-10-03); kept so old data is not lost.
CREATE TABLE IF NOT EXISTS flight_board (
    id             TEXT PRIMARY KEY,           -- 'JED'
    data           TEXT NOT NULL,              -- JSON { arrivals: [...], departures: [...] }
    fetched_at     TEXT,
    next_fetch_at  TEXT,
    calls_month    TEXT,                       -- 'YYYY-MM' the counter belongs to
    calls_used     INTEGER NOT NULL DEFAULT 0, -- Airlabs calls this month
    calls_last     INTEGER NOT NULL DEFAULT 0, -- calls the last refresh took
    last_error     TEXT
);

-- Laundry (Laundry + Laundry admin pages). Money in halalas (SAR × 100).
CREATE TABLE IF NOT EXISTS laundry_items (          -- price master; bills keep the price at billing time
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    site        TEXT NOT NULL,
    name        TEXT NOT NULL,
    name_local  TEXT NOT NULL DEFAULT '',            -- optional second-language name
    price       INTEGER NOT NULL,
    image       TEXT NOT NULL DEFAULT '',            -- small data: URL picture, or one emoji
    sort        INTEGER NOT NULL DEFAULT 0,
    active      INTEGER NOT NULL DEFAULT 1,
    category    TEXT NOT NULL DEFAULT 'guest',       -- guest (clothes) | building (linen: towels, bedsheets…)
    updated_at  TEXT NOT NULL,
    updated_by  INTEGER
);
CREATE TABLE IF NOT EXISTS laundry_staff (          -- free (complimentary) laundry profiles
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    site        TEXT NOT NULL,
    name        TEXT NOT NULL,
    staff_code  TEXT NOT NULL DEFAULT '',
    room        TEXT NOT NULL DEFAULT '',
    department  TEXT NOT NULL DEFAULT '',
    contact     TEXT NOT NULL DEFAULT '',
    category    TEXT NOT NULL DEFAULT '',            -- staff category (settings laundry_staff_categories); '' = none
    photo       TEXT NOT NULL DEFAULT '',            -- data: URL
    free        INTEGER NOT NULL DEFAULT 1,
    active      INTEGER NOT NULL DEFAULT 1,
    started_on  TEXT,
    remarks     TEXT NOT NULL DEFAULT '',
    limits      TEXT NOT NULL DEFAULT '{}',          -- JSON: per_bill_items, per_day_items, per_week_items, per_month_value, per_month_bills, enforce
    deleted     INTEGER NOT NULL DEFAULT 0,          -- 1 = deleted by the admin: hidden, but kept with its history
    created_at  TEXT NOT NULL,
    updated_at  TEXT NOT NULL,
    updated_by  INTEGER
);
CREATE TABLE IF NOT EXISTS laundry_bills (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    site        TEXT NOT NULL,
    receipt_no  TEXT NOT NULL UNIQUE,                -- MM-LD-20260929-001
    client_uid  TEXT NOT NULL UNIQUE,                -- made on the device: an offline bill sent twice is stored once
    kind        TEXT NOT NULL,                       -- paid (cash) | free (staff only) | building (linen)
    customer    TEXT NOT NULL,                       -- JSON { name, room, building, contact, group }
    staff_id    INTEGER,
    staff_name  TEXT,
    lines       TEXT NOT NULL,                       -- JSON [{ item_id, name, price, qty, amount }]
    items       INTEGER NOT NULL,
    value       INTEGER NOT NULL,                    -- laundry value (price list)
    paid        INTEGER NOT NULL,                    -- collected (0 for free laundry)
    method      TEXT NOT NULL DEFAULT '',            -- cash | card | other
    received    INTEGER NOT NULL DEFAULT 0,          -- cash handed over (change = received − paid)
    status      TEXT NOT NULL,                       -- received | ready | collected
    voided      INTEGER NOT NULL DEFAULT 0,
    void_reason TEXT,
    given_at    TEXT NOT NULL,
    ready_at    TEXT,
    collected_at TEXT,
    collected_by INTEGER,
    worker_id   INTEGER NOT NULL,
    worker_name TEXT NOT NULL,
    day         TEXT NOT NULL,                       -- Jeddah date of the bill
    approval_by TEXT,
    warnings    TEXT NOT NULL DEFAULT '[]',
    version     INTEGER NOT NULL DEFAULT 1,
    created_at  TEXT NOT NULL,
    updated_at  TEXT NOT NULL,
    updated_by  INTEGER,
    settled_at  TEXT,                                -- cash bill marked paid by the admin (worker handed the cash over)
    settled_by  INTEGER,
    settlement_id INTEGER,                           -- the laundry_settlements row that marked it paid
    old_receipt_no TEXT                              -- its number before the 2026-10-04 renumbering (separate series per kind)
);
CREATE TABLE IF NOT EXISTS laundry_settlements (     -- payment log: each "mark paid" / "mark unpaid" with the bills it covered
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    site      TEXT NOT NULL,
    day       TEXT NOT NULL,                         -- Jeddah date of the action
    at        TEXT NOT NULL,
    by_id     INTEGER,
    by_name   TEXT NOT NULL,
    action    TEXT NOT NULL,                         -- paid | unpaid
    bills     TEXT NOT NULL,                         -- JSON [{ id, receipt_no, amount, day, worker, room }]
    count     INTEGER NOT NULL,
    total     INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS laundry_settlements_day ON laundry_settlements(site, day);
-- added 2026-10-02 on existing databases with: ALTER TABLE laundry_items ADD COLUMN category TEXT NOT NULL DEFAULT 'guest';
--   ALTER TABLE laundry_bills ADD COLUMN settled_at TEXT; ALTER TABLE laundry_bills ADD COLUMN settled_by INTEGER;
-- added 2026-10-03: ALTER TABLE laundry_staff ADD COLUMN category TEXT NOT NULL DEFAULT '';
-- added 2026-10-04: ALTER TABLE laundry_bills ADD COLUMN settlement_id INTEGER; ALTER TABLE laundry_bills ADD COLUMN old_receipt_no TEXT;
--   receipt counters are now keyed site|kind|day (worker/migrations/2026-10-04-receipt-series.sql renumbered the old bills)
-- 2026-10-05: counters keyed site|kind (a running serial; worker/migrations/2026-10-05-receipt-continuous.sql)
CREATE INDEX IF NOT EXISTS laundry_bills_day ON laundry_bills(site, day);
CREATE INDEX IF NOT EXISTS laundry_bills_staff ON laundry_bills(staff_id, day);
CREATE TABLE IF NOT EXISTS laundry_counters (key TEXT PRIMARY KEY, n INTEGER NOT NULL);   -- receipt serials, key site|kind
CREATE TABLE IF NOT EXISTS laundry_closings (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    site          TEXT NOT NULL,
    day           TEXT NOT NULL,
    worker_id     INTEGER NOT NULL,
    worker_name   TEXT NOT NULL,
    bills         INTEGER NOT NULL,
    sales         INTEGER NOT NULL,
    cash_expected INTEGER NOT NULL,
    cash_actual   INTEGER NOT NULL,
    diff          INTEGER NOT NULL,
    note          TEXT NOT NULL DEFAULT '',
    created_at    TEXT NOT NULL,
    UNIQUE (site, day, worker_id)
);

-- System-wide settings an admin changes on the Setup page (e.g. travel buffers)
CREATE TABLE IF NOT EXISTS settings (
    key         TEXT PRIMARY KEY,
    value       TEXT NOT NULL,              -- JSON
    updated_at  TEXT NOT NULL,
    updated_by  INTEGER
);

-- Who changed what
CREATE TABLE IF NOT EXISTS audit (
    id       INTEGER PRIMARY KEY AUTOINCREMENT,
    at       TEXT NOT NULL,
    desk_id  INTEGER,
    action   TEXT NOT NULL,
    slip_id  INTEGER,
    detail   TEXT
);
CREATE INDEX IF NOT EXISTS audit_at ON audit(id);

-- Transport: the day's vehicle list from the transport system, one JSON document per site and day
-- (Transport import page; app/core/transport.js). n / pax only for the list of days.
CREATE TABLE IF NOT EXISTS transport_days (
    site        TEXT NOT NULL,
    day         TEXT NOT NULL,                       -- YYYY-MM-DD (the trips' date)
    rows        TEXT NOT NULL,                       -- JSON [{ key, ref, at, route, operator, leader, pax, bus, … }]
    n           INTEGER NOT NULL DEFAULT 0,
    pax         INTEGER NOT NULL DEFAULT 0,
    version     INTEGER NOT NULL DEFAULT 1,
    updated_at  TEXT NOT NULL,
    updated_by  INTEGER,
    PRIMARY KEY (site, day)
);

-- Signage (Transport → Signage Builder; the public board /<site>/signage)
CREATE TABLE IF NOT EXISTS signage_config (
    site        TEXT PRIMARY KEY,
    data        TEXT NOT NULL,                       -- JSON { window: { from, to_day, to_time }, slides: [{ type, template, seconds }] }
    version     INTEGER NOT NULL DEFAULT 1,
    updated_at  TEXT NOT NULL,
    updated_by  INTEGER
);
CREATE TABLE IF NOT EXISTS signage_templates (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    site        TEXT NOT NULL,
    name        TEXT NOT NULL,
    data        TEXT NOT NULL,                       -- JSON { bg, elements: [text | image | table …] }
    version     INTEGER NOT NULL DEFAULT 1,
    updated_at  TEXT NOT NULL,
    updated_by  INTEGER
);
CREATE INDEX IF NOT EXISTS signage_templates_site ON signage_templates(site);

-- Forecast page: each bulk "Write building" / "Apply allocations", with every slip's building and rooms before and
-- after, so it can be shown and undone (the undo restores the slips that were not changed since).
CREATE TABLE IF NOT EXISTS alloc_log (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    site        TEXT NOT NULL CHECK (site IN ('makkah', 'medina')),
    kind        TEXT NOT NULL,              -- planner | allocate-day
    note        TEXT NOT NULL DEFAULT '',
    count       INTEGER NOT NULL,
    changes     TEXT NOT NULL,              -- JSON [{ id, sh, before: { building, rooms }, after: { building, rooms } }]
    created_at  TEXT NOT NULL,
    created_by  INTEGER,
    undone_at   TEXT,
    undone_by   INTEGER,
    undo_note   TEXT
);
CREATE INDEX IF NOT EXISTS alloc_log_site ON alloc_log(site, id);

-- Tosha (travel refreshments) choices per site and day (Mawaid → Tosha summary)
CREATE TABLE IF NOT EXISTS tosha_days (
    site        TEXT NOT NULL,
    day         TEXT NOT NULL,
    data        TEXT NOT NULL,                       -- JSON { madina: { time, biryani, burger, packet }, buses: { <trip key>: { packet, burger } } }
    updated_at  TEXT NOT NULL,
    updated_by  INTEGER,
    PRIMARY KEY (site, day)
);

-- Live flight status of our guests' flights (Flightradar24 Flight summary). FR24 rules: kept at most 30 days.
CREATE TABLE IF NOT EXISTS flight_status (
    key                 TEXT PRIMARY KEY,            -- 'arr|2026-10-15|SV701' (direction | UMS date | flight number)
    dir                 TEXT NOT NULL,               -- arr | dep
    airport             TEXT NOT NULL,               -- JED | MED
    code                TEXT NOT NULL,
    sched               TEXT NOT NULL,               -- UMS date and time (Riyadh) 'YYYY-MM-DDTHH:MM'
    status              TEXT NOT NULL,               -- scheduled | airborne | landed | diverted | boarding | departed | arrived | elsewhere
    fr24_id             TEXT,
    callsign            TEXT,
    origin              TEXT,
    destination         TEXT,
    destination_actual  TEXT,
    takeoff             TEXT,                        -- UTC ISO
    landed              TEXT,                        -- UTC ISO
    ended               INTEGER NOT NULL DEFAULT 0,
    eta                 TEXT,                        -- UTC ISO, arrivals in the air (Live flight positions)
    eta_checked         TEXT,
    delay_min           INTEGER,                     -- vs the UMS time: + late / − early (worked out, FR24 has no schedules)
    flag                TEXT,                        -- late | no_sign (looked up, never seen long past its time: possibly cancelled) | unchecked
    detail              TEXT,                        -- JSON: type, reg, hex, first/last seen, alt, speed, position …
    vf                  TEXT,                        -- JSON: airline schedule / status from VariFlight (state, sched/est/act times, gate, belt …)
    vf_checked          TEXT,
    checked_at          TEXT,
    updated_at          TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS flight_status_sched ON flight_status(sched);
CREATE TABLE IF NOT EXISTS flight_meta (
    id            TEXT PRIMARY KEY,                 -- 'fr24'
    month         TEXT,                             -- 'YYYY-MM' the credit count belongs to
    credits_used  INTEGER NOT NULL DEFAULT 0,
    last_run      TEXT,
    next_run      TEXT,
    last_credits  INTEGER NOT NULL DEFAULT 0,
    last_error    TEXT,
    bank          REAL NOT NULL DEFAULT 0            -- VariFlight: credits saved up for look-ups (spread over the month)
);

-- The last days of each flight number on Flightradar24 (route, times, registration of each flight; the flight that
-- brings a departure's plane in). Deleted 25 days after its last check (FR24: keep data at most 30 days).
CREATE TABLE IF NOT EXISTS flight_history (
    code     TEXT PRIMARY KEY,                       -- SV701
    checked  TEXT NOT NULL,                          -- last top-up (ISO)
    data     TEXT NOT NULL                           -- JSON: { rows: [{ id, code, orig, dest, dest_actual, off, on, seen, ended, reg }], from, inbound, inbound_checked }
);

-- Performance page (Data): one row per page opened / full load / error in a desk's browser (pms/app/core/telemetry.js).
-- Timings in ms; device, browser and connection as the browser reports them; colo/country from Cloudflare. Kept 90 days.
CREATE TABLE IF NOT EXISTS perf_events (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    at          TEXT NOT NULL,
    desk_id     INTEGER, desk TEXT, site TEXT, role TEXT,
    kind        TEXT NOT NULL,              -- route | load | error
    page        TEXT,
    ms_total    INTEGER, ms_server INTEGER, server_calls INTEGER, long_ms INTEGER,
    lcp INTEGER, inp INTEGER, cls REAL, ttfb INTEGER, dom_ready INTEGER, load_ms INTEGER,
    device TEXT, os TEXT, browser TEXT, browser_ver TEXT, app TEXT, screen TEXT, mem REAL, cores INTEGER,
    net_type TEXT, downlink REAL, rtt INTEGER, save_data INTEGER,
    colo TEXT, country TEXT, build TEXT, err TEXT
);
CREATE INDEX IF NOT EXISTS perf_events_at ON perf_events(at);

-- In-page feedback (pms/app/core/feedback.js): 1–5 stars and what made them say it; read on the Performance page.
CREATE TABLE IF NOT EXISTS feedback (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    at          TEXT NOT NULL,
    desk_id     INTEGER, desk TEXT, site TEXT, role TEXT,
    page        TEXT, trigger TEXT,
    rating      INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    tags        TEXT, text TEXT,
    page_ms     INTEGER, device TEXT, browser TEXT, net_type TEXT, colo TEXT, country TEXT, build TEXT,
    status      TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'seen', 'handled'))
);
CREATE INDEX IF NOT EXISTS feedback_at ON feedback(at);

-- Slip saves the PMS refused (pms/app/views/slip/view.js → POST /api/slip-denials): every condition that stopped the save
-- (detail = JSON), read on the Performance page. Kept 90 days.
CREATE TABLE IF NOT EXISTS slip_denials (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    at          TEXT NOT NULL,
    desk_id     INTEGER, desk TEXT, site TEXT, role TEXT,
    action      TEXT,                       -- save | update | copy
    sh_no       TEXT, slip_id INTEGER, building TEXT,
    kinds       TEXT,                       -- blocked,nocap,badtime,window,server
    rooms       TEXT,
    detail      TEXT,
    device TEXT, browser TEXT, build TEXT
);
CREATE INDEX IF NOT EXISTS slip_denials_at ON slip_denials(at);

-- Room key cards (Rooms → Room Key Cards): how many of the cards given to a group's rooms came back, per slip, room and
-- departure day. Issued = the room's assigned beds (computed by the page from the slip); only the returned count is kept.
CREATE TABLE IF NOT EXISTS key_cards (
    slip_id     INTEGER NOT NULL,
    room_no     TEXT NOT NULL,
    day         TEXT NOT NULL,              -- the departure day (YYYY-MM-DD)
    site        TEXT NOT NULL,
    returned    INTEGER NOT NULL DEFAULT 0,
    updated_at  TEXT NOT NULL,
    updated_by  INTEGER,
    PRIMARY KEY (slip_id, room_no, day)
);
CREATE INDEX IF NOT EXISTS key_cards_site_day ON key_cards(site, day);

-- "Facing an issue?" reports (pms/app/core/issue-report.js → POST /api/issues): the desk's words, a JPEG of the screen and a diagnostics record (JSON);
-- read on the Performance page. The Worker also creates this table on first use. Kept 180 days.
CREATE TABLE IF NOT EXISTS issue_reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT, at TEXT NOT NULL, desk_id INTEGER, desk TEXT, site TEXT, role TEXT, page TEXT, url TEXT, text TEXT,
    viewport TEXT, device TEXT, browser TEXT, build TEXT, shot TEXT, diag TEXT, colo TEXT, country TEXT,
    status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'seen', 'handled'))
);
CREATE INDEX IF NOT EXISTS issue_reports_at ON issue_reports(at);

-- Passport release slips printed on Accounts → Passport slip (POST/GET /api/passport-log). The Worker also creates this table on first use.
CREATE TABLE IF NOT EXISTS passport_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT, at TEXT NOT NULL, site TEXT NOT NULL, sh_no TEXT, tour TEXT, leader TEXT, pax INTEGER, building TEXT, rooms TEXT, desk_id INTEGER, desk TEXT
);
CREATE INDEX IF NOT EXISTS passport_log_site_at ON passport_log(site, at);

-- Arrival sheet edits (Transport → Arrival sheet): the desks' own changes to one site's sheet for one day (cells, added / hidden rows,
-- headings) — JSON in data; never applied to slips or transport. The Worker also creates this table on first use.
CREATE TABLE IF NOT EXISTS arrival_sheets (
    site TEXT NOT NULL, day TEXT NOT NULL, data TEXT NOT NULL, updated_at TEXT NOT NULL, updated_by INTEGER, updated_name TEXT,
    PRIMARY KEY (site, day)
);
