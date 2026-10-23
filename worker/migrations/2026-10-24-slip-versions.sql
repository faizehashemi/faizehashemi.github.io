-- Slip version history (append-only snapshots; the active one is slips.data). See schema.sql.
ALTER TABLE slips ADD COLUMN active_version INTEGER;
CREATE TABLE IF NOT EXISTS slip_versions (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    slip_id       INTEGER NOT NULL,
    site          TEXT NOT NULL,
    n             INTEGER NOT NULL,
    parent        INTEGER,
    action        TEXT NOT NULL,
    data          TEXT NOT NULL,
    sh_no         TEXT,
    note          TEXT,
    at            TEXT NOT NULL,
    by            INTEGER
);
CREATE INDEX IF NOT EXISTS slip_versions_slip ON slip_versions(slip_id, id);
-- every new snapshot becomes the active one (activating an OLDER snapshot only moves the pointer, see activateSlipVersion)
CREATE TRIGGER IF NOT EXISTS slip_versions_active AFTER INSERT ON slip_versions
BEGIN
    UPDATE slips SET active_version = NEW.id WHERE id = NEW.slip_id;
END;

-- Start every existing slip's history with its current state (earlier edits never stored their data; they stay
-- still in the audit log), and the trigger above marks that snapshot active.
INSERT INTO slip_versions (slip_id, site, n, parent, action, data, sh_no, note, at, by)
SELECT id, site, 1, NULL, CASE WHEN deleted = 1 THEN 'delete' ELSE 'snapshot' END, data, sh_no, 'state when version history began', updated_at, updated_by FROM slips;
