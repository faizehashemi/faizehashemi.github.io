-- Site admins: an admin login flagged site_only manages the logins of its own site only (stored as role 'admin' + site_only = 1; the
-- worker presents it as role 'siteadmin'). Every existing admin keeps site_only = 0, so nothing changes for them.
ALTER TABLE desks ADD COLUMN site_only INTEGER NOT NULL DEFAULT 0;
