-- 2026-10-05 · step 2 of 2: receipt serials no longer restart by date. Bills of 4 Oct onwards are renumbered to
-- continue from the last serial of 3 Oct in their own kind (cash LD, staff ST, building BL); the date part stays the
-- bill's own day. Bills up to 3 Oct keep their numbers. A renumbered bill that had no earlier number keeps the one it
-- had in old_receipt_no. The laundry change log and the payments log follow the new numbers (unique placeholders,
-- so a number that moves from one bill to another never mixes them). Counters: one per site|kind.
--   npx wrangler@4 d1 execute pms --remote --yes --file migrations/2026-10-05-receipt-continuous.sql

CREATE TABLE _renum AS
SELECT b.id, b.receipt_no AS old,
       (CASE b.site WHEN 'medina' THEN 'MD' ELSE 'MM' END) || '-' ||
       (CASE b.kind WHEN 'free' THEN 'ST' WHEN 'building' THEN 'BL' ELSE 'LD' END) || '-' ||
       replace(b.day, '-', '') || '-' ||
       printf('%03d', COALESCE((SELECT CAST(substr(x.receipt_no, 16) AS INTEGER) FROM laundry_bills x
                                WHERE x.site = b.site AND x.kind = b.kind AND x.day <= '2026-10-03' ORDER BY x.day DESC, x.receipt_no DESC LIMIT 1), 0)
                      + ROW_NUMBER() OVER (PARTITION BY b.site, b.kind ORDER BY b.given_at, b.id)) AS new,
       '[[B' || b.id || ']]' AS tok
FROM laundry_bills b WHERE b.day >= '2026-10-04';
DELETE FROM _renum WHERE old = new;

-- the change log and the payments log: old number → placeholder → new number
CREATE TABLE _fold (k INTEGER PRIMARY KEY, a TEXT, b TEXT);
INSERT INTO _fold (k, a, b) SELECT ROW_NUMBER() OVER (ORDER BY id), old, tok FROM _renum;
INSERT INTO _fold (k, a, b) SELECT (SELECT COUNT(*) FROM _renum) + ROW_NUMBER() OVER (ORDER BY id), tok, new FROM _renum;
CREATE TABLE _audit_new (aid INTEGER PRIMARY KEY, d TEXT);
WITH RECURSIVE r(aid, k, d) AS (
    SELECT id, 0, detail FROM audit WHERE action LIKE 'laundry-%' AND detail IS NOT NULL
    UNION ALL
    SELECT r.aid, r.k + 1, replace(r.d, f.a, f.b) FROM r JOIN _fold f ON f.k = r.k + 1
)
INSERT INTO _audit_new (aid, d) SELECT aid, d FROM r WHERE k = (SELECT COUNT(*) FROM _fold);
UPDATE audit SET detail = (SELECT d FROM _audit_new WHERE aid = audit.id) WHERE id IN (SELECT aid FROM _audit_new);
CREATE TABLE _set_new (sid INTEGER PRIMARY KEY, d TEXT);
WITH RECURSIVE r(sid, k, d) AS (
    SELECT id, 0, bills FROM laundry_settlements
    UNION ALL
    SELECT r.sid, r.k + 1, replace(r.d, f.a, f.b) FROM r JOIN _fold f ON f.k = r.k + 1
)
INSERT INTO _set_new (sid, d) SELECT sid, d FROM r WHERE k = (SELECT COUNT(*) FROM _fold);
UPDATE laundry_settlements SET bills = (SELECT d FROM _set_new WHERE sid = laundry_settlements.id) WHERE id IN (SELECT sid FROM _set_new);

-- the bills (two steps: receipt_no is UNIQUE)
UPDATE laundry_bills SET old_receipt_no = receipt_no WHERE old_receipt_no IS NULL AND id IN (SELECT id FROM _renum);
UPDATE laundry_bills SET receipt_no = 'TMP-' || id WHERE id IN (SELECT id FROM _renum);
UPDATE laundry_bills SET receipt_no = (SELECT new FROM _renum WHERE _renum.id = laundry_bills.id) WHERE id IN (SELECT id FROM _renum);

-- running counters per site|kind: never below the highest serial since 3 Oct
INSERT INTO laundry_counters (key, n)
SELECT site || '|' || kind, MAX(CAST(substr(receipt_no, 16) AS INTEGER)) FROM laundry_bills WHERE day >= '2026-10-03' GROUP BY site, kind
ON CONFLICT(key) DO UPDATE SET n = MAX(n, excluded.n);

DROP TABLE _renum;
DROP TABLE _fold;
DROP TABLE _audit_new;
DROP TABLE _set_new;
