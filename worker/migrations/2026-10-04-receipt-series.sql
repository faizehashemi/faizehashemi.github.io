-- 2026-10-04 · Laundry receipt numbers: a separate daily series per kind, and the payment log.
--   cash (paid)          MM-LD-YYYYMMDD-NNN   (Medina MD-LD-…)
--   staff only (free)    MM-ST-YYYYMMDD-NNN
--   building linen       MM-BL-YYYYMMDD-NNN
-- Every existing bill is renumbered in its own series (by the time it was given, then id); its earlier number is
-- kept in old_receipt_no. Laundry change-log lines are rewritten to the new numbers (through unique placeholders,
-- so a number that moves from one bill to another never mixes their histories). Counters move to site|kind|day.
-- Existing "mark paid" actions are copied into laundry_settlements (one row per action).
-- Run ONCE, before deploying the Worker that numbers by kind:
--   npx wrangler@4 d1 execute pms --remote --yes --file migrations/2026-10-04-receipt-series.sql

ALTER TABLE laundry_bills ADD COLUMN settlement_id INTEGER;
ALTER TABLE laundry_bills ADD COLUMN old_receipt_no TEXT;

CREATE TABLE IF NOT EXISTS laundry_settlements (
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    site      TEXT NOT NULL,
    day       TEXT NOT NULL,
    at        TEXT NOT NULL,
    by_id     INTEGER,
    by_name   TEXT NOT NULL,
    action    TEXT NOT NULL,
    bills     TEXT NOT NULL,
    count     INTEGER NOT NULL,
    total     INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS laundry_settlements_day ON laundry_settlements(site, day);

-- old → new number for every bill
CREATE TABLE _renum AS
SELECT id, receipt_no AS old,
       (CASE site WHEN 'medina' THEN 'MD' ELSE 'MM' END) || '-' ||
       (CASE kind WHEN 'free' THEN 'ST' WHEN 'building' THEN 'BL' ELSE 'LD' END) || '-' ||
       replace(day, '-', '') || '-' ||
       printf('%03d', ROW_NUMBER() OVER (PARTITION BY site, kind, day ORDER BY given_at, id)) AS new,
       '[[B' || id || ']]' AS tok
FROM laundry_bills;

-- change log: every old number → its placeholder, then every placeholder → the new number
CREATE TABLE _audit_new (aid INTEGER PRIMARY KEY, d TEXT);
WITH RECURSIVE
  m(k, a, b) AS (
    SELECT ROW_NUMBER() OVER (ORDER BY id), old, tok FROM _renum
    UNION ALL
    SELECT (SELECT COUNT(*) FROM _renum) + ROW_NUMBER() OVER (ORDER BY id), tok, new FROM _renum
  ),
  r(aid, k, d) AS (
    SELECT id, 0, detail FROM audit WHERE action LIKE 'laundry-%' AND detail IS NOT NULL
    UNION ALL
    SELECT r.aid, r.k + 1, replace(r.d, m.a, m.b) FROM r JOIN m ON m.k = r.k + 1
  )
INSERT INTO _audit_new (aid, d) SELECT aid, d FROM r WHERE k = (SELECT COUNT(*) FROM m);
UPDATE audit SET detail = (SELECT d FROM _audit_new WHERE aid = audit.id) WHERE id IN (SELECT aid FROM _audit_new);

-- the bills (two steps: receipt_no is UNIQUE)
UPDATE laundry_bills SET old_receipt_no = receipt_no WHERE old_receipt_no IS NULL;
UPDATE laundry_bills SET receipt_no = 'TMP-' || id;
UPDATE laundry_bills SET receipt_no = (SELECT new FROM _renum WHERE _renum.id = laundry_bills.id);

-- counters per site|kind|day (the old site|day keys stay, unused)
INSERT INTO laundry_counters (key, n)
SELECT site || '|' || kind || '|' || day, COUNT(*) FROM laundry_bills WHERE 1 GROUP BY site, kind, day
ON CONFLICT(key) DO UPDATE SET n = excluded.n;

-- payment log: the "mark paid" actions so far (bills marked paid together share settled_at)
INSERT INTO laundry_settlements (site, day, at, by_id, by_name, action, bills, count, total)
SELECT b.site, date(datetime(b.settled_at, '+3 hours')), b.settled_at, b.settled_by, COALESCE(d.name, '?'), 'paid',
       json_group_array(json_object('id', b.id, 'receipt_no', b.receipt_no, 'amount', b.paid, 'day', b.day, 'worker', b.worker_name,
           'room', trim(COALESCE(json_extract(b.customer, '$.building'), '') || ' ' || COALESCE(json_extract(b.customer, '$.room'), '')))),
       COUNT(*), SUM(b.paid)
FROM laundry_bills b LEFT JOIN desks d ON d.id = b.settled_by
WHERE b.settled_at IS NOT NULL AND b.settlement_id IS NULL
GROUP BY b.site, b.settled_at, b.settled_by;
UPDATE laundry_bills SET settlement_id = (SELECT s.id FROM laundry_settlements s WHERE s.site = laundry_bills.site AND s.at = laundry_bills.settled_at AND s.action = 'paid' ORDER BY s.id DESC LIMIT 1)
WHERE settled_at IS NOT NULL AND settlement_id IS NULL;

DROP TABLE _renum;
DROP TABLE _audit_new;
