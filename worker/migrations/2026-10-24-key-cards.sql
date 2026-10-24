-- Room key cards (Rooms → Room Key Cards): how many of the cards given to a group's rooms came back, per slip, room and
-- departure day. Issued = the room's assigned beds (computed by the page from the slip); only the returned count is kept.
CREATE TABLE IF NOT EXISTS key_cards (
    slip_id     INTEGER NOT NULL,
    room_no     TEXT NOT NULL,
    day         TEXT NOT NULL,              -- the departure day (YYYY-MM-DD)
    site        TEXT NOT NULL,
    returned    INTEGER NOT NULL DEFAULT 0,
    updated_at  TEXT NOT NULL,
    updated_by  INTEGER,
    PRIMARY KEY (slip_id, room_no, day)
);
CREATE INDEX IF NOT EXISTS key_cards_site_day ON key_cards(site, day);
