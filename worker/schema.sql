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
