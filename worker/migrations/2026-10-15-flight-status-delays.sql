-- Live flight status: ETA, worked-out delay, late / no-sign flag and the extra details (schema.sql has them for new databases)
ALTER TABLE flight_status ADD COLUMN eta TEXT;
ALTER TABLE flight_status ADD COLUMN eta_checked TEXT;
ALTER TABLE flight_status ADD COLUMN delay_min INTEGER;
ALTER TABLE flight_status ADD COLUMN flag TEXT;
ALTER TABLE flight_status ADD COLUMN detail TEXT;
