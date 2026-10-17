-- Flightradar24 history per flight number (schema.sql has it for new databases)
CREATE TABLE IF NOT EXISTS flight_history (
    code     TEXT PRIMARY KEY,
    checked  TEXT NOT NULL,
    data     TEXT NOT NULL
);
