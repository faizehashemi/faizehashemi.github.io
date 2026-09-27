// PMS cloud API — Cloudflare Worker + D1. Single file, no dependencies.
//
// Bindings:  DB (D1 database)   ALLOWED_ORIGINS (var, comma-separated, e.g. "https://faizehashemi.github.io")
//
// Auth: each desk logs in (POST /api/login) and gets a bearer token (30 days, extended while in use).
//   desk   — reads every site, writes only its own site
//   viewer — reads only
//   admin  — everything, manages desks, sees the audit log
//
// Buildings: GET/POST /api/buildings, PUT/DELETE /api/buildings/:id — rooms and capacities per building.
//
// Sync: GET /api/slips?seq=&id= returns changes after a cursor (including deletions) so each browser
// keeps a local copy and only downloads what changed. Every write bumps the slip's `version`;
// writing with an old version is refused (409) instead of overwriting someone else's change.

const SITES = { makkah: 'Makkah', medina: 'Medina' };
const ROLES = ['desk', 'viewer', 'admin'];
const PBKDF2_ITER = 100000;           // Workers' maximum for PBKDF2
const SESSION_DAYS = 30;
const MAX_BULK = 45;                  // statements per request stay under D1's per-invocation limit
const PULL_LIMIT = 1000;
const MAX_SLIP_BYTES = 64 * 1024;
const LOGIN_MAX_FAILS = 10;           // per desk name per 15 minutes

class HttpError extends Error {
    constructor(status, message, extra) { super(message); this.status = status; this.extra = extra; }
}

export default {
    async fetch(request, env) {
        const cors = corsHeaders(request, env);
        if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
        let res;
        try {
            res = await route(request, env);
        } catch (e) {
            const status = e instanceof HttpError ? e.status : 500;
            if (status === 500) console.error(e && e.stack || e);
            res = json({ error: status === 500 ? 'Server error' : e.message, ...(e.extra || {}) }, status);
        }
        for (const [k, v] of Object.entries(cors)) res.headers.set(k, v);
        return res;
    },
};

/* --------------------------------- plumbing --------------------------------- */

function corsHeaders(request, env) {
    const origin = request.headers.get('Origin') || '';
    const allowed = String(env.ALLOWED_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean);
    const ok = allowed.includes(origin) || /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
    return ok ? {
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400',
        'Vary': 'Origin',
    } : { 'Vary': 'Origin' };
}

const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' } });
const now = () => new Date().toISOString();
const plusDays = (d) => new Date(Date.now() + d * 864e5).toISOString();

async function body(req) {
    try { return await req.json(); } catch { throw new HttpError(400, 'Invalid JSON body'); }
}

const enc = (s) => new TextEncoder().encode(s);
const toHex = (buf) => [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
const fromHex = (hex) => new Uint8Array(hex.match(/../g).map(h => parseInt(h, 16)));
const sha256 = async (s) => toHex(await crypto.subtle.digest('SHA-256', enc(s)));
const randomHex = (n) => toHex(crypto.getRandomValues(new Uint8Array(n)));

async function pbkdf2(password, saltHex, iter) {
    const key = await crypto.subtle.importKey('raw', enc(password), 'PBKDF2', false, ['deriveBits']);
    const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: fromHex(saltHex), iterations: iter }, key, 256);
    return toHex(bits);
}
function sameHex(a, b) {
    if (a.length !== b.length) return false;
    let d = 0;
    for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
    return d === 0;
}

/* --------------------------------- routes --------------------------------- */

async function route(req, env) {
    const url = new URL(req.url);
    const p = url.pathname.replace(/\/+$/, '');
    const m = req.method;

    if (p === '/api/health') return json({ ok: true, time: now() });
    if (p === '/api/login' && m === 'POST') return login(req, env);

    const me = await authenticate(req, env);
    if (p === '/api/logout' && m === 'POST') {
        await env.DB.prepare('DELETE FROM sessions WHERE token_hash = ?').bind(me.tokenHash).run();
        return json({ ok: true });
    }
    if (p === '/api/me' && m === 'GET') return json({ desk: publicDesk(me) });

    if (p === '/api/slips' && m === 'GET') return pull(url, env);
    if (p === '/api/slips' && m === 'POST') return createSlip(req, env, me);
    if (p === '/api/slips/bulk' && m === 'POST') return bulk(req, env, me);
    if (p === '/api/slips/migrate' && m === 'POST') return migrate(req, env, me);
    if (p === '/api/slips/clear' && m === 'POST') return clearSite(req, env, me);
    let mm = p.match(/^\/api\/slips\/(\d+)$/);
    if (mm && m === 'PUT') return updateSlip(req, env, me, Number(mm[1]));
    if (mm && m === 'DELETE') return deleteSlip(url, env, me, Number(mm[1]));

    if (p === '/api/settings' && m === 'GET') return getSettings(env);
    if (p === '/api/settings' && m === 'PUT') { requireAdmin(me); return putSettings(req, env, me); }

    if (p === '/api/buildings' && m === 'GET') return listBuildings(env);
    if (p === '/api/buildings' && m === 'POST') return createBuilding(req, env, me);
    mm = p.match(/^\/api\/buildings\/(\d+)$/);
    if (mm && m === 'PUT') return updateBuilding(req, env, me, Number(mm[1]));
    if (mm && m === 'DELETE') return deleteBuilding(url, env, me, Number(mm[1]));

    if (p === '/api/desks' && m === 'GET') { requireAdmin(me); return listDesks(env); }
    if (p === '/api/desks' && m === 'POST') { requireAdmin(me); return createDesk(req, env, me); }
    mm = p.match(/^\/api\/desks\/(\d+)$/);
    if (mm && m === 'PATCH') { requireAdmin(me); return updateDesk(req, env, me, Number(mm[1])); }
    if (p === '/api/audit' && m === 'GET') { requireAdmin(me); return listAudit(url, env); }

    throw new HttpError(404, 'Not found');
}

/* ---------------------------------- auth ---------------------------------- */

const publicDesk = (d) => ({ id: d.id, name: d.name, site: d.site, role: d.role });

async function login(req, env) {
    const { name, password } = await body(req);
    const n = String(name || '').trim();
    if (!n || !password) throw new HttpError(400, 'Enter the desk name and password.');
    const since = new Date(Date.now() - 15 * 60e3).toISOString();
    const fails = await env.DB.prepare('SELECT COUNT(*) AS c FROM login_failures WHERE name = ? AND at > ?').bind(n, since).first('c');
    if (fails >= LOGIN_MAX_FAILS) throw new HttpError(429, 'Too many wrong passwords. Wait 15 minutes and try again.');

    const desk = await env.DB.prepare('SELECT * FROM desks WHERE name = ?').bind(n).first();
    const ok = desk && sameHex(await pbkdf2(String(password), desk.pw_salt, desk.pw_iter), desk.pw_hash);
    if (!ok) {
        await env.DB.prepare('INSERT INTO login_failures (name, at) VALUES (?, ?)').bind(n, now()).run();
        throw new HttpError(401, 'Wrong desk name or password.');
    }
    if (desk.disabled) throw new HttpError(403, 'This desk login is disabled. Ask the admin.');

    const token = randomHex(32);
    const expiresAt = plusDays(SESSION_DAYS);
    await env.DB.batch([
        env.DB.prepare('DELETE FROM login_failures WHERE name = ? OR at < ?').bind(n, since),
        env.DB.prepare('DELETE FROM sessions WHERE expires_at < ?').bind(now()),
        env.DB.prepare('INSERT INTO sessions (token_hash, desk_id, created_at, expires_at, user_agent) VALUES (?, ?, ?, ?, ?)')
            .bind(await sha256(token), desk.id, now(), expiresAt, (req.headers.get('User-Agent') || '').slice(0, 200)),
        auditStmt(env, desk, 'login', null, null),
    ]);
    return json({ token, expiresAt, desk: publicDesk(desk) });
}

async function authenticate(req, env) {
    const m = (req.headers.get('Authorization') || '').match(/^Bearer\s+([a-f0-9]{64})$/i);
    if (!m) throw new HttpError(401, 'Please log in.');
    const tokenHash = await sha256(m[1].toLowerCase());
    const row = await env.DB.prepare(
        'SELECT s.expires_at, d.id, d.name, d.site, d.role, d.disabled FROM sessions s JOIN desks d ON d.id = s.desk_id WHERE s.token_hash = ?'
    ).bind(tokenHash).first();
    if (!row || row.expires_at < now() || row.disabled) throw new HttpError(401, 'Your login has expired. Please log in again.');
    // sliding expiry: extend when less than half the lifetime is left
    if (row.expires_at < plusDays(SESSION_DAYS / 2)) {
        await env.DB.prepare('UPDATE sessions SET expires_at = ? WHERE token_hash = ?').bind(plusDays(SESSION_DAYS), tokenHash).run();
    }
    return { ...row, tokenHash };
}

function requireAdmin(me) {
    if (me.role !== 'admin') throw new HttpError(403, 'Only an admin can do this.');
}

function assertWrite(me, site) {
    if (!SITES[site]) throw new HttpError(400, `Unknown site "${site}".`);
    if (me.role === 'admin') return;
    if (me.role !== 'desk') throw new HttpError(403, `${me.name} is a read-only login.`);
    if (me.site !== site) throw new HttpError(403, `${me.name} can only change ${SITES[me.site]} slips.`);
}

/* ---------------------------------- slips ---------------------------------- */

// Strip markup characters from every string (the pages render many fields as HTML), drop
// server-owned keys, bound the size.
function cleanSlip(v, depth = 0) {
    if (depth > 8) return null;
    if (typeof v === 'string') return v.replace(/[<>]/g, '').slice(0, 2000);
    if (typeof v === 'number') return Number.isFinite(v) ? v : null;
    if (Array.isArray(v)) return v.slice(0, 500).map(x => cleanSlip(x, depth + 1));
    if (v && typeof v === 'object') {
        const o = {};
        for (const [k, x] of Object.entries(v)) {
            if (depth === 0 && (k === 'id' || k === '_v' || k === '_seq' || k === 'site' || k === 'deleted')) continue;
            o[String(k).slice(0, 64)] = cleanSlip(x, depth + 1);
        }
        return o;
    }
    return v === undefined ? null : v;
}

function prepareSlip(raw) {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) throw new HttpError(400, 'A slip must be an object.');
    const data = cleanSlip(raw);
    const text = JSON.stringify(data);
    if (text.length > MAX_SLIP_BYTES) throw new HttpError(413, 'Slip too large.');
    return {
        text,
        sh_no: data.sh_no == null ? '' : String(data.sh_no).trim(),
        building: String(data.building || '').trim(),
        checkin_date: String(data.checkin_date || ''),
        checkout_date: String(data.checkout_date || ''),
        ums_key: data.ums && data.ums.key ? String(data.ums.key) : null,
    };
}

const NEXT_SEQ = '(SELECT COALESCE(MAX(seq), 0) + 1 FROM slips)';

// Insert unless a live slip already has the same UMS stay key (two desks importing the same
// file at once) or the same origin (the same old slip uploaded twice).
function insertStmt(env, me, site, s, origin) {
    return env.DB.prepare(
        `INSERT OR IGNORE INTO slips (site, sh_no, building, checkin_date, checkout_date, ums_key, origin, data, version, seq, updated_at, updated_by)
         SELECT ?, ?, ?, ?, ?, ?, ?, ?, 1, ${NEXT_SEQ}, ?, ?
         WHERE ? IS NULL OR NOT EXISTS (SELECT 1 FROM slips WHERE ums_key = ? AND deleted = 0)`
    ).bind(site, s.sh_no, s.building, s.checkin_date, s.checkout_date, s.ums_key, origin || null, s.text, now(), me.id, s.ums_key, s.ums_key);
}

function updateStmt(env, me, id, version, s) {
    return env.DB.prepare(
        `UPDATE slips SET sh_no = ?, building = ?, checkin_date = ?, checkout_date = ?, ums_key = ?, data = ?,
                version = version + 1, seq = ${NEXT_SEQ}, updated_at = ?, updated_by = ?
         WHERE id = ? AND version = ? AND deleted = 0`
    ).bind(s.sh_no, s.building, s.checkin_date, s.checkout_date, s.ums_key, s.text, now(), me.id, id, version);
}

function auditStmt(env, me, action, slipId, detail) {
    return env.DB.prepare('INSERT INTO audit (at, desk_id, action, slip_id, detail) VALUES (?, ?, ?, ?, ?)')
        .bind(now(), me ? me.id : null, action, slipId, detail == null ? null : String(detail).slice(0, 500));
}

function rowToSlip(r) {
    if (r.deleted) return { id: r.id, site: r.site, deleted: true, _seq: r.seq };
    return { ...JSON.parse(r.data), id: r.id, site: r.site, _v: r.version, _seq: r.seq };
}

async function getRow(env, id) {
    return env.DB.prepare('SELECT * FROM slips WHERE id = ?').bind(id).first();
}

async function pull(url, env) {
    const seq = Number(url.searchParams.get('seq')) || 0;
    const id = Number(url.searchParams.get('id')) || 0;
    const limit = Math.min(PULL_LIMIT, Number(url.searchParams.get('limit')) || PULL_LIMIT);
    // first download: skip deleted slips, the browser has nothing to remove yet
    const onlyLive = seq === 0 && id === 0 ? 'AND deleted = 0' : '';
    const { results } = await env.DB.prepare(
        `SELECT id, site, data, version, seq, deleted FROM slips
         WHERE (seq > ? OR (seq = ? AND id > ?)) ${onlyLive}
         ORDER BY seq, id LIMIT ?`
    ).bind(seq, seq, id, limit).all();
    const last = results[results.length - 1];
    return json({
        slips: results.map(rowToSlip),
        cursor: last ? { seq: last.seq, id: last.id } : { seq, id },
        more: results.length === limit,
    });
}

async function createSlip(req, env, me) {
    const { slip } = await body(req);
    const site = String(slip && slip.site || me.site);
    assertWrite(me, site);
    const s = prepareSlip(slip);
    const [res] = await env.DB.batch([insertStmt(env, me, site, s, null)]);
    if (!res.meta.changes) throw new HttpError(409, 'This UMS stay already exists.');
    const id = res.meta.last_row_id;
    await auditStmt(env, me, 'create', id, `SH ${s.sh_no}`).run();
    return json({ slip: rowToSlip(await getRow(env, id)) }, 201);
}

async function updateSlip(req, env, me, id) {
    const { slip, version } = await body(req);
    const row = await getRow(env, id);
    if (!row || row.deleted) throw new HttpError(404, 'This slip no longer exists (it may have been deleted on another desk).');
    assertWrite(me, row.site);
    if (slip && slip.site && slip.site !== row.site && me.role !== 'admin') throw new HttpError(403, 'Only an admin can move a slip to the other site.');
    const s = prepareSlip(slip);
    const res = await updateStmt(env, me, id, Number(version), s).run();
    if (!res.meta.changes) {
        throw new HttpError(409, 'Someone else changed this slip after you opened it. Reload it and make your change again.', { current: rowToSlip(await getRow(env, id)) });
    }
    await auditStmt(env, me, 'update', id, `SH ${s.sh_no}`).run();
    return json({ slip: rowToSlip(await getRow(env, id)) });
}

async function deleteSlip(url, env, me, id) {
    const row = await getRow(env, id);
    if (!row || row.deleted) return json({ ok: true });
    assertWrite(me, row.site);
    const v = url.searchParams.get('version');
    const res = await env.DB.prepare(
        `UPDATE slips SET deleted = 1, version = version + 1, seq = ${NEXT_SEQ}, updated_at = ?, updated_by = ?
         WHERE id = ? AND deleted = 0 AND (? IS NULL OR version = ?)`
    ).bind(now(), me.id, id, v, v == null ? null : Number(v)).run();
    if (!res.meta.changes) throw new HttpError(409, 'Someone else changed this slip after you opened it. Reload and try again.');
    await auditStmt(env, me, 'delete', id, `SH ${row.sh_no}`).run();
    return json({ ok: true });
}

// Many adds + updates for one site in one D1 batch (all or nothing). Used by the UMS import and
// the Admin JSON import. Updates carry the version they were planned against.
async function bulk(req, env, me) {
    const { site, add = [], put = [], reason = 'bulk' } = await body(req);
    assertWrite(me, site);
    if (add.length + put.length > MAX_BULK) throw new HttpError(413, `At most ${MAX_BULK} slips per request.`);

    if (put.length) {
        const ids = put.map(p => Number(p.id));
        const rows = (await env.DB.prepare(`SELECT id, site, version, deleted FROM slips WHERE id IN (${ids.map(() => '?').join(',')})`).bind(...ids).all()).results;
        const byId = new Map(rows.map(r => [r.id, r]));
        const stale = put.filter(p => { const r = byId.get(Number(p.id)); return !r || r.deleted || r.site !== site || r.version !== Number(p.version); });
        if (stale.length) throw new HttpError(409, `${stale.length} slip(s) were changed on another desk meanwhile.`, { stale: stale.map(p => p.id) });
    }

    const stmts = [
        ...add.map(slip => insertStmt(env, me, site, prepareSlip(slip), null)),
        ...put.map(p => updateStmt(env, me, Number(p.id), Number(p.version), prepareSlip(p.slip))),
    ];
    const results = stmts.length ? await env.DB.batch(stmts) : [];
    const created = results.slice(0, add.length).filter(r => r.meta.changes).length;
    const updated = results.slice(add.length).filter(r => r.meta.changes).length;
    await auditStmt(env, me, reason, null, `${site}: ${created} created, ${updated} updated, ${add.length - created} skipped (already there)`).run();
    return json({ created, updated, skipped: add.length - created, conflicts: put.length - updated });
}

// One-time upload of a browser's old IndexedDB slips. Idempotent through `origin`.
async function migrate(req, env, me) {
    const { slips = [] } = await body(req);
    if (slips.length > MAX_BULK) throw new HttpError(413, `At most ${MAX_BULK} slips per request.`);
    const stmts = [];
    for (const { site, origin, slip } of slips) {
        assertWrite(me, site);
        if (!origin) throw new HttpError(400, 'Each uploaded slip needs an origin.');
        stmts.push(insertStmt(env, me, site, prepareSlip(slip), String(origin).slice(0, 100)));
    }
    const results = stmts.length ? await env.DB.batch(stmts) : [];
    const created = results.filter(r => r.meta.changes).length;
    await auditStmt(env, me, 'migrate', null, `${created} uploaded, ${slips.length - created} already there`).run();
    return json({ created, skipped: slips.length - created });
}

async function clearSite(req, env, me) {
    const { site } = await body(req);
    assertWrite(me, site);
    const res = await env.DB.prepare(
        `UPDATE slips SET deleted = 1, version = version + 1, seq = ${NEXT_SEQ}, updated_at = ?, updated_by = ? WHERE site = ? AND deleted = 0`
    ).bind(now(), me.id, site).run();
    await auditStmt(env, me, 'clear', null, `${site}: ${res.meta.changes} deleted`).run();
    return json({ deleted: res.meta.changes });
}

/* --------------------------------- settings --------------------------------- */

// Known settings and their validation. Anything else is refused.
const HHMM = (v) => typeof v === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(v);
const HOURS = (v) => typeof v === 'number' && Number.isFinite(v) && v >= 0 && v <= 24;
const SETTINGS = {
    arrival_commute_hours: { check: HOURS, msg: 'Arrival travel time must be 0–24 hours.' },
    departure_lead_hours: { check: HOURS, msg: 'Departure lead time must be 0–24 hours.' },
    transfer_checkin_time: { check: HHMM, msg: 'Check-in time between cities must be HH:MM.' },
    transfer_checkout_time: { check: HHMM, msg: 'Check-out time between cities must be HH:MM.' },
};

async function getSettings(env) {
    const { results } = await env.DB.prepare(
        'SELECT s.key, s.value, s.updated_at, d.name AS updated_by FROM settings s LEFT JOIN desks d ON d.id = s.updated_by'
    ).all();
    const settings = {};
    let last = null;
    for (const r of results) {
        settings[r.key] = JSON.parse(r.value);
        if (!last || r.updated_at > last.updated_at) last = r;
    }
    return json({ settings, updated_at: last ? last.updated_at : null, updated_by: last ? last.updated_by : null });
}

async function putSettings(req, env, me) {
    const { settings } = await body(req);
    if (!settings || typeof settings !== 'object') throw new HttpError(400, 'settings must be an object.');
    const stmts = [];
    const notes = [];
    for (const [k, v] of Object.entries(settings)) {
        const def = SETTINGS[k];
        if (!def) throw new HttpError(400, `Unknown setting "${k}".`);
        const value = typeof v === 'number' ? Math.round(v * 4) / 4 : v; // quarter hours
        if (!def.check(value)) throw new HttpError(400, def.msg);
        stmts.push(env.DB.prepare('INSERT INTO settings (key, value, updated_at, updated_by) VALUES (?, ?, ?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at, updated_by = excluded.updated_by')
            .bind(k, JSON.stringify(value), now(), me.id));
        notes.push(`${k}=${value}`);
    }
    if (!stmts.length) throw new HttpError(400, 'Nothing to change.');
    await env.DB.batch([...stmts, auditStmt(env, me, 'settings', null, notes.join(', '))]);
    return getSettings(env);
}

/* -------------------------------- buildings -------------------------------- */

const ROOM_TYPES = ['', 'gents', 'ladies', 'family'];
const MAX_BUILDING_BYTES = 300 * 1024;
const text = (v, max) => String(v == null ? '' : v).replace(/[<>]/g, '').trim().slice(0, max);

// Validate and normalise a building from the builder
function prepareBuilding(b) {
    const name = text(b.name, 40).toUpperCase();
    if (!/^[A-Z0-9][A-Z0-9 .&'-]*$/.test(name)) throw new HttpError(400, 'Building name: letters, digits, spaces and . & \' - only.');
    if (!Array.isArray(b.rooms)) throw new HttpError(400, 'rooms must be a list.');
    if (b.rooms.length > 3000) throw new HttpError(413, 'At most 3000 rooms per building.');
    const seen = new Set();
    const rooms = b.rooms.map((r, i) => {
        const room_no = text(r && r.room_no, 12);
        if (!room_no) throw new HttpError(400, `Room ${i + 1} has no number.`);
        const k = room_no.toUpperCase();
        if (seen.has(k)) throw new HttpError(400, `Room ${room_no} appears twice.`);
        seen.add(k);
        const capacity = Number(r.capacity);
        if (!Number.isInteger(capacity) || capacity < 0 || capacity > 50) throw new HttpError(400, `Room ${room_no}: capacity must be a whole number 0–50.`);
        const type = ROOM_TYPES.includes(r.type) ? r.type : '';
        return { room_no, floor: text(r.floor, 10), capacity, type, notes: text(r.notes, 200), active: r.active !== false };
    });
    const data = JSON.stringify({ rooms, notes: text(b.notes, 500) });
    if (data.length > MAX_BUILDING_BYTES) throw new HttpError(413, 'Building too large.');
    return { name, sort: Number.isInteger(Number(b.sort)) ? Number(b.sort) : 0, data, roomCount: rooms.length };
}

function rowToBuilding(r) {
    const d = JSON.parse(r.data);
    return { id: r.id, site: r.site, name: r.name, sort: r.sort, version: r.version, rooms: d.rooms || [], notes: d.notes || '', updated_at: r.updated_at, updated_by: r.updated_by_name || null };
}

async function getBuilding(env, id) {
    return env.DB.prepare('SELECT b.*, d.name AS updated_by_name FROM buildings b LEFT JOIN desks d ON d.id = b.updated_by WHERE b.id = ?').bind(id).first();
}

async function listBuildings(env) {
    const { results } = await env.DB.prepare(
        'SELECT b.*, d.name AS updated_by_name FROM buildings b LEFT JOIN desks d ON d.id = b.updated_by WHERE b.deleted = 0 ORDER BY b.site, b.sort, b.name'
    ).all();
    return json({ buildings: results.map(rowToBuilding) });
}

function duplicateName(e, name) {
    if (/UNIQUE/i.test(String(e && e.message))) throw new HttpError(409, `There is already a building called ${name} on this site.`);
    throw e;
}

async function createBuilding(req, env, me) {
    const b = await body(req);
    assertWrite(me, b.site);
    const x = prepareBuilding(b);
    let res;
    try {
        res = await env.DB.prepare('INSERT INTO buildings (site, name, sort, data, version, updated_at, updated_by) VALUES (?, ?, ?, ?, 1, ?, ?)')
            .bind(b.site, x.name, x.sort, x.data, now(), me.id).run();
    } catch (e) { duplicateName(e, x.name); }
    await auditStmt(env, me, 'building-create', null, `${b.site} ${x.name}: ${x.roomCount} rooms`).run();
    return json({ building: rowToBuilding(await getBuilding(env, res.meta.last_row_id)) }, 201);
}

async function updateBuilding(req, env, me, id) {
    const b = await body(req);
    const row = await getBuilding(env, id);
    if (!row || row.deleted) throw new HttpError(404, 'This building no longer exists.');
    assertWrite(me, row.site);
    const x = prepareBuilding(b);
    let res;
    try {
        res = await env.DB.prepare('UPDATE buildings SET name = ?, sort = ?, data = ?, version = version + 1, updated_at = ?, updated_by = ? WHERE id = ? AND version = ? AND deleted = 0')
            .bind(x.name, x.sort, x.data, now(), me.id, id, Number(b.version)).run();
    } catch (e) { duplicateName(e, x.name); }
    if (!res.meta.changes) throw new HttpError(409, `Someone else saved ${row.name} after you opened it. Reload the builder and make your change again.`, { current: rowToBuilding(row) });
    await auditStmt(env, me, 'building-update', null, `${row.site} ${x.name}${x.name !== row.name ? ` (was ${row.name})` : ''}: ${x.roomCount} rooms`).run();
    return json({ building: rowToBuilding(await getBuilding(env, id)) });
}

async function deleteBuilding(url, env, me, id) {
    const row = await getBuilding(env, id);
    if (!row || row.deleted) return json({ ok: true });
    assertWrite(me, row.site);
    const v = url.searchParams.get('version');
    const res = await env.DB.prepare('UPDATE buildings SET deleted = 1, version = version + 1, updated_at = ?, updated_by = ? WHERE id = ? AND deleted = 0 AND (? IS NULL OR version = ?)')
        .bind(now(), me.id, id, v, v == null ? null : Number(v)).run();
    if (!res.meta.changes) throw new HttpError(409, 'Someone else changed this building. Reload and try again.');
    await auditStmt(env, me, 'building-delete', null, `${row.site} ${row.name}`).run();
    return json({ ok: true });
}

/* ---------------------------------- desks ---------------------------------- */

async function listDesks(env) {
    const { results } = await env.DB.prepare(
        `SELECT d.id, d.name, d.site, d.role, d.disabled, d.created_at,
                (SELECT MAX(created_at) FROM sessions s WHERE s.desk_id = d.id) AS last_login
         FROM desks d ORDER BY d.site, d.name`
    ).all();
    return json({ desks: results });
}

function checkPassword(pw) {
    if (typeof pw !== 'string' || pw.length < 8) throw new HttpError(400, 'Password must be at least 8 characters.');
}

async function createDesk(req, env, me) {
    const { name, site, role = 'desk', password } = await body(req);
    const n = String(name || '').trim();
    if (!/^[\w .-]{3,40}$/.test(n)) throw new HttpError(400, 'Desk name: 3–40 letters, digits, spaces, dot, dash or underscore.');
    if (!SITES[site]) throw new HttpError(400, 'Choose a site.');
    if (!ROLES.includes(role)) throw new HttpError(400, 'Unknown role.');
    checkPassword(password);
    const salt = randomHex(16);
    try {
        await env.DB.prepare('INSERT INTO desks (name, site, role, pw_hash, pw_salt, pw_iter, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)')
            .bind(n, site, role, await pbkdf2(password, salt, PBKDF2_ITER), salt, PBKDF2_ITER, now()).run();
    } catch (e) {
        if (/UNIQUE/i.test(String(e && e.message))) throw new HttpError(409, `A desk named "${n}" already exists.`);
        throw e;
    }
    await auditStmt(env, me, 'desk-create', null, `${n} (${site}, ${role})`).run();
    return listDesks(env);
}

async function updateDesk(req, env, me, id) {
    const b = await body(req);
    const desk = await env.DB.prepare('SELECT * FROM desks WHERE id = ?').bind(id).first();
    if (!desk) throw new HttpError(404, 'No such desk.');
    if (id === me.id && (b.disabled || (b.role && b.role !== 'admin'))) throw new HttpError(400, 'You cannot disable or demote your own admin login.');
    const sets = [], args = [], notes = [];
    if (b.password !== undefined) {
        checkPassword(b.password);
        const salt = randomHex(16);
        sets.push('pw_hash = ?', 'pw_salt = ?', 'pw_iter = ?');
        args.push(await pbkdf2(b.password, salt, PBKDF2_ITER), salt, PBKDF2_ITER);
        notes.push('password reset');
    }
    if (b.disabled !== undefined) { sets.push('disabled = ?'); args.push(b.disabled ? 1 : 0); notes.push(b.disabled ? 'disabled' : 'enabled'); }
    if (b.role !== undefined) { if (!ROLES.includes(b.role)) throw new HttpError(400, 'Unknown role.'); sets.push('role = ?'); args.push(b.role); notes.push('role ' + b.role); }
    if (b.site !== undefined) { if (!SITES[b.site]) throw new HttpError(400, 'Unknown site.'); sets.push('site = ?'); args.push(b.site); notes.push('site ' + b.site); }
    if (!sets.length) throw new HttpError(400, 'Nothing to change.');
    await env.DB.batch([
        env.DB.prepare(`UPDATE desks SET ${sets.join(', ')} WHERE id = ?`).bind(...args, id),
        // any change to a login signs that desk out everywhere (except a self password change: keep this session)
        env.DB.prepare('DELETE FROM sessions WHERE desk_id = ? AND token_hash != ?').bind(id, id === me.id ? me.tokenHash : ''),
        auditStmt(env, me, 'desk-update', null, `${desk.name}: ${notes.join(', ')}`),
    ]);
    return listDesks(env);
}

async function listAudit(url, env) {
    const limit = Math.min(500, Number(url.searchParams.get('limit')) || 200);
    const { results } = await env.DB.prepare(
        'SELECT a.id, a.at, a.action, a.slip_id, a.detail, d.name AS desk FROM audit a LEFT JOIN desks d ON d.id = a.desk_id ORDER BY a.id DESC LIMIT ?'
    ).bind(limit).all();
    return json({ audit: results });
}
