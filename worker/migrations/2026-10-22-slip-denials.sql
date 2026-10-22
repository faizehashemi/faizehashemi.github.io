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
