-- 2026-10-05 · step 1 of 2 (run BEFORE deploying the Worker that keys counters by site|kind):
-- the running serial per site and kind = the last serial of 3 Oct (or the latest day before) + the bills since 4 Oct.
-- A bill saved by the new Worker before step 2 then gets the next number, which step 2 keeps in place.
INSERT INTO laundry_counters (key, n)
SELECT b.site || '|' || b.kind,
       COALESCE((SELECT CAST(substr(x.receipt_no, 16) AS INTEGER) FROM laundry_bills x
                 WHERE x.site = b.site AND x.kind = b.kind AND x.day <= '2026-10-03' ORDER BY x.day DESC, x.receipt_no DESC LIMIT 1), 0)
       + SUM(b.day >= '2026-10-04')
FROM laundry_bills b WHERE 1 GROUP BY b.site, b.kind
ON CONFLICT(key) DO UPDATE SET n = MAX(n, excluded.n);
