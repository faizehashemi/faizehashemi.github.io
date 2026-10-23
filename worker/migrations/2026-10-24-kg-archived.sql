-- KG roster: archive a name (keep it and its history, hide it from the assignment list) — kg_meta gets an archived list
ALTER TABLE kg_meta ADD COLUMN archived TEXT NOT NULL DEFAULT '[]';
