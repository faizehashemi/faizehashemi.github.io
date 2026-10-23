#!/usr/bin/env node
// Turns PMS backup files (worker.js "hourly backups") into SQL for an EMPTY database made from worker/schema.sql.
//
//   node tools/restore-backup.mjs slips.json.gz rest.json.gz auth.json.gz > restore.sql
//   npx wrangler d1 create pms-restored                                   (new, empty database)
//   npx wrangler d1 execute pms-restored --remote --file worker/schema.sql
//   npx wrangler d1 execute pms-restored --remote --file restore.sql
//
// slips / rest come from the Backups page (Download); auth (the logins with their password hashes) is never served by the
// site — fetch it with:  npx wrangler kv key get "bk:h:<time>:auth" --namespace-id <BACKUPS id> --remote > auth.json.gz
// Without auth the logins are NOT restored (recreate them on the Setup page / tools/make_desk.py).
// One INSERT per line (D1 takes statements under 100 kB); strings are quoted, NULL stays NULL.

import { readFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';

const files = process.argv.slice(2);
if (!files.length) { console.error('usage: node tools/restore-backup.mjs slips.json.gz rest.json.gz [auth.json.gz] > restore.sql'); process.exit(1); }

const docs = files.map((f) => {
    const raw = readFileSync(f);
    const text = (raw[0] === 0x1f && raw[1] === 0x8b ? gunzipSync(raw) : raw).toString('utf8');   // gzip or plain JSON
    const d = JSON.parse(text);
    if (d.format !== 'pms-backup-1') throw new Error(`${f}: not a PMS backup file`);
    return d;
});
const stems = new Set(docs.map((d) => d.stem));
if (stems.size > 1) console.error(`WARNING: these files are from different backups (${[...stems].join(', ')}) — use the three parts of ONE backup.`);

const hasAuth = docs.some((d) => d.part === 'auth');
const q = (v) => v === null || v === undefined ? 'NULL' : typeof v === 'number' ? (Number.isFinite(v) ? String(v) : 'NULL') : `'${String(v).replace(/'/g, "''")}'`;

let tables = 0, rows = 0;
console.log(`-- PMS restore from backup ${[...stems].join(', ')} — run on an empty database created from worker/schema.sql`);
for (const d of docs) {
    for (const [name, t] of Object.entries(d.tables)) {
        if (name === 'desks' && d.part === 'rest' && hasAuth) continue;                     // the auth copy has the hashes
        if (name === 'desks' && d.part === 'rest') { console.error('NOTE: no auth file — logins were not restored.'); continue; }
        tables++;
        const cols = t.cols.map((c) => `"${c}"`).join(', ');
        for (const r of t.rows) { console.log(`INSERT INTO "${name}" (${cols}) VALUES (${r.map(q).join(', ')});`); rows++; }
    }
}
console.error(`${rows} rows in ${tables} tables written.`);
