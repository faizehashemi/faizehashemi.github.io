-- Airline schedule / status from VariFlight (schema.sql has these for new databases)
ALTER TABLE flight_status ADD COLUMN vf TEXT;
ALTER TABLE flight_status ADD COLUMN vf_checked TEXT;
ALTER TABLE flight_meta ADD COLUMN bank REAL NOT NULL DEFAULT 0;
