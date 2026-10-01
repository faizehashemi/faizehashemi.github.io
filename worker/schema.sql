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
    deleted       INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS slips_seq ON slips(seq, id);
CREATE INDEX IF NOT EXISTS slips_site_sh ON slips(site, sh_no);
CREATE INDEX IF NOT EXISTS slips_ums ON slips(ums_key);

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
    people      TEXT NOT NULL DEFAULT '[]', -- JSON list of names, in list order
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

-- Jeddah airport flight board (Home page), refreshed by the Worker's cron from Airlabs; one row.
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
    kind        TEXT NOT NULL,                       -- paid | free
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
    updated_by  INTEGER
);
CREATE INDEX IF NOT EXISTS laundry_bills_day ON laundry_bills(site, day);
CREATE INDEX IF NOT EXISTS laundry_bills_staff ON laundry_bills(staff_id, day);
CREATE TABLE IF NOT EXISTS laundry_counters (key TEXT PRIMARY KEY, n INTEGER NOT NULL);   -- receipt numbers per site and day
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
