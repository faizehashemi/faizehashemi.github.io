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
    if (p === '/api/public/signage' && m === 'GET') return publicSignage(url, env); // no login: the TV board
    if (p === '/api/public/signage/setup' && m === 'GET') return publicSignageSetup(url, env);

    const me = await authenticate(req, env);
    if (p === '/api/logout' && m === 'POST') {
        await env.DB.prepare('DELETE FROM sessions WHERE token_hash = ?').bind(me.tokenHash).run();
        return json({ ok: true });
    }
    if (p === '/api/me' && m === 'GET') return json({ desk: publicDesk(me) });
    if (p === '/api/me/password' && m === 'POST') return changeOwnPassword(req, env, me);
    if (p === '/api/me/prefs' && m === 'GET') return getPrefs(env, me);
    if (p === '/api/me/prefs' && m === 'PUT') return putPrefs(req, env, me);

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

    if (p === '/api/kg' && m === 'GET') return getKg(env, String(url.searchParams.get('site') || me.site));
    if (p === '/api/kg/op' && m === 'POST') return kgOp(req, env, me);
    if (p === '/api/kg/log' && m === 'POST') return addKgLog(req, env, me);
    mm = p.match(/^\/api\/kg\/log\/(\d+)$/);
    if (mm && m === 'DELETE') return deleteKgLog(url, env, me, Number(mm[1]));


    if (p === '/api/transport' && m === 'GET') return getTransport(env, transportSite(url.searchParams.get('site'), me), transportDay(url.searchParams.get('day')));
    if (p === '/api/transport/types' && m === 'GET') return transportTypes(env, transportSite(url.searchParams.get('site'), me));
    if (p === '/api/signage' && m === 'GET') return getSignage(env, transportSite(url.searchParams.get('site'), me));
    if (p === '/api/signage/config' && m === 'PUT') return putSignageConfig(req, env, me);
    if (p === '/api/signage/templates' && m === 'POST') return saveTemplate(req, env, me, 0);
    { const st = p.match(/^\/api\/signage\/templates\/(\d+)$/);
      if (st && m === 'PUT') return saveTemplate(req, env, me, Number(st[1]));
      if (st && m === 'DELETE') return deleteTemplate(env, me, Number(st[1])); }
    if (p === '/api/transport/days' && m === 'GET') return transportDays(env, transportSite(url.searchParams.get('site'), me));
    if (p === '/api/transport' && m === 'PUT') return putTransport(req, env, me);
    if (p === '/api/transport' && m === 'DELETE') return deleteTransport(url, env, me);

    if (p.startsWith('/api/laundry/')) { const r = await laundryRoute(p, m, url, req, env, me); if (r) return r; }

    if (p === '/api/buildings' && m === 'GET') return listBuildings(env);
    if (p === '/api/buildings' && m === 'POST') return createBuilding(req, env, me);
    mm = p.match(/^\/api\/buildings\/(\d+)$/);
    if (mm && m === 'PUT') return updateBuilding(req, env, me, Number(mm[1]));
    if (mm && m === 'DELETE') return deleteBuilding(url, env, me, Number(mm[1]));

    if (p === '/api/desks' && m === 'GET') { requireAdmin(me); return listDesks(env); }
    if (p === '/api/desks' && m === 'POST') { requireAdmin(me); return createDesk(req, env, me); }
    mm = p.match(/^\/api\/desks\/(\d+)$/);
    if (mm && m === 'PATCH') { requireAdmin(me); return updateDesk(req, env, me, Number(mm[1])); }
    if (mm && m === 'DELETE') { requireAdmin(me); return deleteDesk(env, me, Number(mm[1])); }
    if (p === '/api/audit' && m === 'GET') { requireAdmin(me); return listAudit(url, env); }

    throw new HttpError(404, 'Not found');
}

/* ---------------------------------- auth ---------------------------------- */

// pages: the page ids this login may open (null = all); set by the admin on Setup
const parsePages = (v) => { try { const a = v ? JSON.parse(v) : null; return Array.isArray(a) ? a : null; } catch { return null; } };
const PAGES_OF = '(SELECT pages FROM desk_pages p WHERE p.desk_id = d.id) AS pages';
const publicDesk = (d) => ({ id: d.id, name: d.name, site: d.site, role: d.role, pages: d.role === 'admin' ? null : parsePages(d.pages) });

async function login(req, env) {
    const { name, password } = await body(req);
    const n = String(name || '').trim();
    if (!n || !password) throw new HttpError(400, 'Enter the desk name and password.');
    const since = new Date(Date.now() - 15 * 60e3).toISOString();
    const fails = await env.DB.prepare('SELECT COUNT(*) AS c FROM login_failures WHERE name = ? AND at > ?').bind(n, since).first('c');
    if (fails >= LOGIN_MAX_FAILS) throw new HttpError(429, 'Too many wrong passwords. Wait 15 minutes and try again.');

    const desk = await env.DB.prepare(`SELECT d.*, ${PAGES_OF} FROM desks d WHERE d.name = ?`).bind(n).first();
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
        `SELECT s.expires_at, d.id, d.name, d.site, d.role, d.disabled, ${PAGES_OF} FROM sessions s JOIN desks d ON d.id = s.desk_id WHERE s.token_hash = ?`
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
    // "after (seq, id)". The leading seq >= ? lets SQLite start in the slips_seq index; written as
    // (seq > ? OR (seq = ? AND id > ?)) it scanned the whole table on every check.
    const { results } = await env.DB.prepare(
        `SELECT id, site, data, version, seq, deleted FROM slips
         WHERE seq >= ? AND (seq > ? OR id > ?) ${onlyLive}
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
    // Laundry page: timings and notice shown to the worker and on receipts
    laundry_info: { check: (v) => typeof v === 'string' && v.length <= 600 && !/[<>]/.test(v), msg: 'Laundry notice: up to 600 characters, no < or >.' },
    // staff categories for the Laundry "Staff only" tab, per site: { makkah: ['Kitchen', …], medina: […] }
    // (saved through PUT /api/laundry/staff-categories, which also renames / clears them on the profiles)
    laundry_staff_categories: {
        check: (v) => v && typeof v === 'object' && !Array.isArray(v) && Object.entries(v).every(([k, a]) => SITES[k] && Array.isArray(a) && a.length <= 60
            && a.every(n => typeof n === 'string' && n.length >= 1 && n.length <= 40 && !/[<>]/.test(n))),
        msg: 'Staff categories: up to 60 names per site, 40 characters each.',
    },
    // KG page: the duty events and their times, e.g. [{ name: 'Aaje Raate Haram', time: '20:30' }]
    kg_sessions: {
        check: (v) => Array.isArray(v) && v.length >= 1 && v.length <= 10 && v.every(x => x && typeof x.name === 'string' && x.name.trim().length >= 1
            && x.name.length <= 60 && !/[<>]/.test(x.name) && HHMM(x.time)),
        msg: 'KG events: 1–10 events, each a name (up to 60 characters) and a time HH:MM.',
    },
    // /<site>/signage: from = 'now' (trips drop off once they leave) or 'HH:MM' today; until to_day (0 today, 1 tomorrow,
    // 2 the day after) at to_time
    signage_window: {
        check: (v) => v && typeof v === 'object' && !Array.isArray(v) && Object.keys(v).length === 3
            && (v.from === 'now' || HHMM(v.from)) && [0, 1, 2].includes(v.to_day) && HHMM(v.to_time),
        msg: 'Signage window: beginning "now" or HH:MM, end day 0–2 and time HH:MM.',
    },
    // Home → Fakkul Ehraam counts: Morning = morning_from (the day before) to split, Night = split to night_to
    fe_windows: {
        check: (v) => v && typeof v === 'object' && !Array.isArray(v) && Object.keys(v).length === 3
            && ['morning_from', 'split', 'night_to'].every(k => HHMM(v[k])) && v.split < v.night_to,
        msg: 'Fakkul Ehraam windows: three times HH:MM, and Night must end after it starts.',
    },
    // GL copy ink per building (Print slips page and Check-ins → GL copy): { "MOHAMMEDI": "#e8590c", … }
    gl_colors: {
        check: (v) => v && typeof v === 'object' && !Array.isArray(v) && Object.keys(v).length <= 100
            && Object.entries(v).every(([k, c]) => k.trim().length >= 1 && k.length <= 60 && !/[<>]/.test(k) && typeof c === 'string' && /^#[0-9a-fA-F]{6}$/.test(c)),
        msg: 'GL copy colours: up to 100 buildings, each a colour like #e8590c.',
    },
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
        notes.push(`${k}=${typeof value === 'object' ? JSON.stringify(value) : value}`);
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
                (SELECT MAX(created_at) FROM sessions s WHERE s.desk_id = d.id) AS last_login, ${PAGES_OF}
         FROM desks d ORDER BY d.site, d.name`
    ).all();
    return json({ desks: results.map(d => ({ ...d, pages: parsePages(d.pages) })) });
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
        // never reuse a deleted login's id (the change log still points at it)
        await env.DB.prepare(`INSERT INTO desks (id, name, site, role, pw_hash, pw_salt, pw_iter, created_at)
            VALUES (MAX(COALESCE((SELECT MAX(id) FROM desks), 0), COALESCE((SELECT MAX(id) FROM deleted_desks), 0)) + 1, ?, ?, ?, ?, ?, ?, ?)`)
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
    const sets = [], args = [], notes = [], extra = [];
    // page access: a list of page ids, or null for every page. Not a sign-out reason: the desk's
    // browser picks it up from /api/me within a minute.
    if (b.pages !== undefined) {
        if (b.pages === null) extra.push(env.DB.prepare('DELETE FROM desk_pages WHERE desk_id = ?').bind(id));
        else {
            if (!Array.isArray(b.pages) || b.pages.length > 60 || !b.pages.every(x => typeof x === 'string' && /^[a-z][a-z-]{0,29}$/.test(x))) throw new HttpError(400, 'pages must be a list of page ids.');
            extra.push(env.DB.prepare('INSERT INTO desk_pages (desk_id, pages, updated_at) VALUES (?, ?, ?) ON CONFLICT(desk_id) DO UPDATE SET pages = excluded.pages, updated_at = excluded.updated_at')
                .bind(id, JSON.stringify([...new Set(b.pages)]), now()));
        }
        notes.push(b.pages === null ? 'pages: all' : `pages: ${b.pages.length}`);
    }
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
    if (!sets.length && !extra.length) throw new HttpError(400, 'Nothing to change.');
    await env.DB.batch([
        ...(sets.length ? [
            env.DB.prepare(`UPDATE desks SET ${sets.join(', ')} WHERE id = ?`).bind(...args, id),
            // a change to the login itself signs that desk out everywhere (except a self password change: keep this session)
            env.DB.prepare('DELETE FROM sessions WHERE desk_id = ? AND token_hash != ?').bind(id, id === me.id ? me.tokenHash : ''),
        ] : []),
        ...extra,
        auditStmt(env, me, 'desk-update', null, `${desk.name}: ${notes.join(', ')}`),
    ]);
    return listDesks(env);
}

// Any login changes its own password: the current one is required (and counts towards the lockout),
// every other session of this desk is signed out, this one stays.
async function changeOwnPassword(req, env, me) {
    const { current, password } = await body(req);
    const since = new Date(Date.now() - 15 * 60e3).toISOString();
    const fails = await env.DB.prepare('SELECT COUNT(*) AS c FROM login_failures WHERE name = ? AND at > ?').bind(me.name, since).first('c');
    if (fails >= LOGIN_MAX_FAILS) throw new HttpError(429, 'Too many wrong passwords. Wait 15 minutes and try again.');
    const desk = await env.DB.prepare('SELECT * FROM desks WHERE id = ?').bind(me.id).first();
    if (!desk || !current || !sameHex(await pbkdf2(String(current), desk.pw_salt, desk.pw_iter), desk.pw_hash)) {
        await env.DB.prepare('INSERT INTO login_failures (name, at) VALUES (?, ?)').bind(me.name, now()).run();
        throw new HttpError(400, 'The current password is wrong.');
    }
    checkPassword(password);
    if (password === current) throw new HttpError(400, 'The new password is the same as the current one.');
    const salt = randomHex(16);
    await env.DB.batch([
        env.DB.prepare('UPDATE desks SET pw_hash = ?, pw_salt = ?, pw_iter = ? WHERE id = ?').bind(await pbkdf2(password, salt, PBKDF2_ITER), salt, PBKDF2_ITER, me.id),
        env.DB.prepare('DELETE FROM sessions WHERE desk_id = ? AND token_hash != ?').bind(me.id, me.tokenHash),
        auditStmt(env, me, 'password-change', null, `${me.name}: own password changed`),
    ]);
    return json({ ok: true });
}

// A login's personal Settings (the page stores only what differs from the defaults). Any login, own row only.
const MAX_PREFS_BYTES = 16 * 1024;
async function getPrefs(env, me) {
    const row = await env.DB.prepare('SELECT prefs, updated_at FROM desk_prefs WHERE desk_id = ?').bind(me.id).first();
    return json({ prefs: row ? JSON.parse(row.prefs) : null, updated_at: row ? row.updated_at : null });
}
async function putPrefs(req, env, me) {
    const { prefs } = await body(req);
    if (!prefs || typeof prefs !== 'object' || Array.isArray(prefs)) throw new HttpError(400, 'prefs must be an object.');
    const text = JSON.stringify(cleanSlip(prefs, 1)); // same scrubbing as slips: no < >, bounded depth and size
    if (text.length > MAX_PREFS_BYTES) throw new HttpError(413, 'Settings too large.');
    const at = now();
    await env.DB.prepare('INSERT INTO desk_prefs (desk_id, prefs, updated_at) VALUES (?, ?, ?) ON CONFLICT(desk_id) DO UPDATE SET prefs = excluded.prefs, updated_at = excluded.updated_at')
        .bind(me.id, text, at).run();
    return json({ ok: true, updated_at: at });
}

/* ---------------------------------- KG roster ---------------------------------- */

const KG_TYPES = ['FE1', 'FE2', 'Atraaf'];
const kgName = (v) => String(v == null ? '' : v).replace(/[<>]/g, '').replace(/\s+/g, ' ').trim().slice(0, 80);

async function getKg(env, site) {
    if (!SITES[site]) throw new HttpError(400, `Unknown site "${site}".`);
    const meta = await env.DB.prepare('SELECT people, bookmark, version, updated_at FROM kg_meta WHERE site = ?').bind(site).first();
    const { results } = await env.DB.prepare('SELECT id, ts, person, type, location FROM kg_log WHERE site = ? ORDER BY ts, id').bind(site).all();
    return json({ site, people: meta ? JSON.parse(meta.people) : [], bookmark: meta ? meta.bookmark : '', version: meta ? meta.version : 0, log: results });
}

// Name list / bookmark changes as small operations, applied on the latest list (retried if two desks collide)
async function kgOp(req, env, me) {
    const { site, op, name } = await body(req);
    assertWrite(me, site);
    const n = kgName(name);
    for (let attempt = 0; attempt < 4; attempt++) {
        const meta = await env.DB.prepare('SELECT people, bookmark, version FROM kg_meta WHERE site = ?').bind(site).first();
        let people = meta ? JSON.parse(meta.people) : [], bookmark = meta ? meta.bookmark : '';
        const extra = [];
        if (op === 'add-person') { if (!n) throw new HttpError(400, 'Enter a name.'); if (!people.includes(n)) people.push(n); }
        else if (op === 'remove-person') { people = people.filter(p => p !== n); if (bookmark === n) bookmark = ''; }
        else if (op === 'bookmark') { if (n && !people.includes(n)) throw new HttpError(400, 'That name is not in the list.'); bookmark = n; }
        else if (op === 'reset') { requireAdminOrDesk(me); people = []; bookmark = ''; extra.push(env.DB.prepare('DELETE FROM kg_log WHERE site = ?').bind(site)); }
        else throw new HttpError(400, 'Unknown KG operation.');
        if (people.length > 500) throw new HttpError(413, 'At most 500 names.');
        const write = meta
            ? env.DB.prepare('UPDATE kg_meta SET people = ?, bookmark = ?, version = version + 1, updated_at = ?, updated_by = ? WHERE site = ? AND version = ?').bind(JSON.stringify(people), bookmark, now(), me.id, site, meta.version)
            : env.DB.prepare('INSERT OR IGNORE INTO kg_meta (site, people, bookmark, version, updated_at, updated_by) VALUES (?, ?, ?, 1, ?, ?)').bind(site, JSON.stringify(people), bookmark, now(), me.id);
        const [res] = await env.DB.batch([write, ...extra, ...(op === 'bookmark' ? [] : [auditStmt(env, me, 'kg-' + op, null, `${site}${n ? ': ' + n : ''}`)])]);
        if (res.meta.changes) return getKg(env, site);
    }
    throw new HttpError(409, 'Another desk is changing the KG list right now. Try again.');
}
function requireAdminOrDesk(me) { if (me.role !== 'admin' && me.role !== 'desk') throw new HttpError(403, 'Not allowed.'); }

// Saved assignments; the same entry twice is kept once (imports can be repeated)
async function addKgLog(req, env, me) {
    const { site, entries } = await body(req);
    assertWrite(me, site);
    if (!Array.isArray(entries) || !entries.length) throw new HttpError(400, 'Nothing to save.');
    if (entries.length > 500) throw new HttpError(413, 'At most 500 entries at once.');
    const stmts = [];
    for (const e of entries) {
        const ts = String(e && e.ts || ''), person = kgName(e && e.person), type = String(e && e.type || ''), loc = kgName(e && e.location);
        if (isNaN(Date.parse(ts)) || !person || !KG_TYPES.includes(type)) continue;
        stmts.push(env.DB.prepare('INSERT OR IGNORE INTO kg_log (site, ts, person, type, location, created_at, created_by) VALUES (?, ?, ?, ?, ?, ?, ?)')
            .bind(site, new Date(ts).toISOString(), person, type, loc, now(), me.id));
    }
    if (!stmts.length) throw new HttpError(400, 'No valid entries.');
    const res = await env.DB.batch(stmts);
    const added = res.filter(r => r.meta.changes).length;
    await auditStmt(env, me, 'kg-log', null, `${site}: ${added} assignment(s) saved`).run();
    const out = await getKg(env, site);
    const data = await out.json();
    return json({ ...data, added });
}

async function deleteKgLog(url, env, me, id) {
    const row = await env.DB.prepare('SELECT site, person, type, ts FROM kg_log WHERE id = ?').bind(id).first();
    if (!row) return getKg(env, String(url.searchParams.get('site') || me.site));
    assertWrite(me, row.site);
    await env.DB.batch([
        env.DB.prepare('DELETE FROM kg_log WHERE id = ?').bind(id),
        auditStmt(env, me, 'kg-log-delete', null, `${row.site}: ${row.person} ${row.type} ${row.ts}`),
    ]);
    return getKg(env, row.site);
}

// Remove a login for good: its sessions, page access and personal settings go with it. Its name is kept in
// deleted_desks so the change log still says who did what. Not your own login, not the last admin.
async function deleteDesk(env, me, id) {
    const desk = await env.DB.prepare('SELECT id, name, site, role FROM desks WHERE id = ?').bind(id).first();
    if (!desk) throw new HttpError(404, 'No such desk.');
    if (id === me.id) throw new HttpError(400, 'You cannot delete the login you are using.');
    if (desk.role === 'admin') {
        const admins = await env.DB.prepare("SELECT COUNT(*) AS c FROM desks WHERE role = 'admin' AND disabled = 0").first('c');
        if (admins <= 1) throw new HttpError(400, 'This is the only active admin login; it cannot be deleted.');
    }
    await env.DB.batch([
        env.DB.prepare('INSERT OR REPLACE INTO deleted_desks (id, name, site, role, deleted_at, deleted_by) VALUES (?, ?, ?, ?, ?, ?)').bind(desk.id, desk.name, desk.site, desk.role, now(), me.id),
        env.DB.prepare('DELETE FROM sessions WHERE desk_id = ?').bind(id),
        env.DB.prepare('DELETE FROM desk_pages WHERE desk_id = ?').bind(id),
        env.DB.prepare('DELETE FROM desk_prefs WHERE desk_id = ?').bind(id),
        env.DB.prepare('DELETE FROM login_failures WHERE name = ?').bind(desk.name),
        env.DB.prepare('DELETE FROM desks WHERE id = ?').bind(id),
        auditStmt(env, me, 'desk-delete', null, `${desk.name} (${desk.site}, ${desk.role})`),
    ]);
    return listDesks(env);
}

/* ----------------------------------- Laundry ----------------------------------- */
// Hotel laundry POS (Laundry page) and its admin (Laundry admin page). Money is kept in halalas (SAR × 100).
// Prices live in laundry_items (never in code); a bill stores each line's price at the time of billing, so
// later price changes never touch old bills. A bill is 'paid' (customer pays cash), 'free' (staff only:
// value recorded, 0 collected, never in cash) or 'building' (the building's linen: towels, bedsheets… no money).
// Items are 'guest' (clothes) or 'building' (linen). Offline bills carry a client_uid and are stored once however
// often they are sent. Workers (desk logins) create bills; the worker's cash is "unpaid"
// until an admin (or a desk login, for its own site) marks those bills paid (settled_at / settled_by, one by one or
// in bulk). Only an admin changes
// prices, staff profiles, edits or voids bills (audited: before → after).

const LAUNDRY_PREFIX = { makkah: 'MM-LD', medina: 'MD-LD' };
const MAX_IMAGE = 200 * 1024;     // item image / staff photo as a data: URL (the page shrinks them first)
const LAUNDRY_DEFAULT_ITEMS = [   // first use of a site only; the admin edits them on the Prices tab
    ['Kurta', 300, '👔'], ['Saaya', 300, '🧥'], ['Pajama', 300, '👖'], ['Vest', 200, '🎽'], ['Brief', 100, '🩲'],
    ['Socks', 100, '🧦'], ['Ladies Pardi', 300, '🧕'], ['Ghagro (Gown)', 300, '👗'], ['Peti-Coat', 300, '🩱'],
    ['Ladies T-Shirt', 200, '👚'], ['Gents Ehram Set-2', 500, '🤍'],
];
const LAUNDRY_BUILDING_ITEMS = [  // the building's linen (Building tab); added once per site, price 0, editable
    ['Big towel', '🛁'], ['Small towel', '🧼'], ['Towel (Mawaid)', '🍽️'], ['Safra (Mawaid)', '🥘'], ['Bedsheet', '🛏️'],
    ['Blanket', '🧣'], ['Parda', '🪟'], ['Pagdandi', '🧶'], ['Pillow covers', '🛌'],
];
const ITEM_CATEGORIES = ['guest', 'building'];

const jeddahDay = (ms = Date.now()) => new Date(ms + 3 * 3600e3).toISOString().slice(0, 10);
const halalas = (v) => { const n = Math.round(Number(v) * 100); return Number.isFinite(n) ? n : NaN; };
const imageOk = (v) => typeof v === 'string' && (v === '' || (v.length <= 16 && !/[<>]/.test(v)) || (/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(v) && v.length <= MAX_IMAGE));

function laundrySite(me, site) {
    const s = String(site || me.site);
    if (!SITES[s]) throw new HttpError(400, `Unknown site "${s}".`);
    return s;
}
function requireLaundryWrite(me, site) {
    if (me.role === 'viewer') throw new HttpError(403, `${me.name} is a read-only login.`);
    if (me.role !== 'admin' && me.site !== site) throw new HttpError(403, `${me.name} works at ${SITES[me.site]}.`);
}
const canSeeAll = (me) => me.role === 'admin' || me.role === 'viewer';

/* ---------------- items (price master) ---------------- */

const rowToItem = (r) => ({ id: r.id, site: r.site, name: r.name, name_local: r.name_local, price: r.price, image: r.image, sort: r.sort, active: !!r.active, category: r.category || 'guest', updated_at: r.updated_at });

async function listLaundryItems(env, site, me) {
    let { results } = await env.DB.prepare('SELECT * FROM laundry_items WHERE site = ? ORDER BY sort, id').bind(site).all();
    if (!results.length) {
        // first use: the hotel's price list, editable on the Prices tab
        const t = now();
        await env.DB.batch(LAUNDRY_DEFAULT_ITEMS.map(([n, p, img], i) =>
            env.DB.prepare('INSERT INTO laundry_items (site, name, name_local, price, image, sort, active, updated_at, updated_by) VALUES (?, ?, \'\', ?, ?, ?, 1, ?, ?)')
                .bind(site, n, p, img, i + 1, t, me.id)));
        ({ results } = await env.DB.prepare('SELECT * FROM laundry_items WHERE site = ? ORDER BY sort, id').bind(site).all());
    }
    if (!results.some(r => r.category === 'building')) {
        // the building's linen list, once per site (the admin edits it on the Prices tab)
        const t = now();
        await env.DB.batch(LAUNDRY_BUILDING_ITEMS.map(([n, img], i) =>
            env.DB.prepare('INSERT INTO laundry_items (site, name, name_local, price, image, sort, active, category, updated_at, updated_by) VALUES (?, ?, \'\', 0, ?, ?, 1, \'building\', ?, ?)')
                .bind(site, n, img, 100 + i, t, me.id)));
        ({ results } = await env.DB.prepare('SELECT * FROM laundry_items WHERE site = ? ORDER BY sort, id').bind(site).all());
    }
    return results.map(rowToItem);
}

function prepareItem(b) {
    const name = text(b.name, 40);
    if (!name) throw new HttpError(400, 'Give the item a name.');
    const price = halalas(b.price);
    if (!(price >= 0 && price <= 100000)) throw new HttpError(400, 'Price must be 0–1000 SAR.');
    const image = b.image == null ? '' : String(b.image);
    if (!imageOk(image)) throw new HttpError(400, 'The picture is not a small JPEG/PNG (or one emoji).');
    return { name, name_local: text(b.name_local, 40), price, image, sort: Number.isInteger(Number(b.sort)) ? Number(b.sort) : 0, active: b.active === false ? 0 : 1,
        category: ITEM_CATEGORIES.includes(b.category) ? b.category : 'guest' };
}

async function saveLaundryItem(req, env, me, id) {
    requireAdmin(me);
    const b = await body(req);
    const x = prepareItem(b);
    if (id) {
        const old = await env.DB.prepare('SELECT * FROM laundry_items WHERE id = ?').bind(id).first();
        if (!old) throw new HttpError(404, 'No such item.');
        const changes = [];
        if (old.name !== x.name) changes.push(`name "${old.name}" → "${x.name}"`);
        if (old.price !== x.price) changes.push(`price ${old.price / 100} → ${x.price / 100} SAR`);
        if (!!old.active !== !!x.active) changes.push(x.active ? 'shown again' : 'hidden');
        if (old.image !== x.image) changes.push('picture changed');
        if ((old.category || 'guest') !== x.category) changes.push(`moved to ${x.category}`);
        await env.DB.batch([
            env.DB.prepare('UPDATE laundry_items SET name = ?, name_local = ?, price = ?, image = ?, sort = ?, active = ?, category = ?, updated_at = ?, updated_by = ? WHERE id = ?')
                .bind(x.name, x.name_local, x.price, x.image, x.sort, x.active, x.category, now(), me.id, id),
            auditStmt(env, me, 'laundry-item', null, `${old.site} ${old.name}: ${changes.join(', ') || 'saved'}`),
        ]);
        return json({ items: await listLaundryItems(env, old.site, me) });
    }
    const site = laundrySite(me, b.site);
    await env.DB.batch([
        env.DB.prepare('INSERT INTO laundry_items (site, name, name_local, price, image, sort, active, category, updated_at, updated_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
            .bind(site, x.name, x.name_local, x.price, x.image, x.sort, x.active, x.category, now(), me.id),
        auditStmt(env, me, 'laundry-item', null, `${site} ${x.name}: added at ${x.price / 100} SAR`),
    ]);
    return json({ items: await listLaundryItems(env, site, me) }, 201);
}

/* ---------------- staff (free laundry profiles) ---------------- */

const LIMIT_KEYS = ['per_bill_items', 'per_day_items', 'per_week_items', 'per_month_value', 'per_month_bills'];
function rowToStaff(r, withPhoto = true) {
    return {
        id: r.id, site: r.site, name: r.name, staff_code: r.staff_code, room: r.room, department: r.department, contact: r.contact, category: r.category || '',
        photo: withPhoto ? r.photo : undefined, has_photo: !!r.photo, deleted: !!r.deleted, free: !!r.free, active: !!r.active, started_on: r.started_on,
        remarks: r.remarks, limits: JSON.parse(r.limits || '{}'), updated_at: r.updated_at,
    };
}
// Deleted profiles stay in the table (their bills keep pointing at them); `withDeleted` is for the admin's
// history views (photos in the register), everyone else never sees them.
async function listLaundryStaff(env, site, withDeleted = false) {
    const { results } = await env.DB.prepare(`SELECT * FROM laundry_staff WHERE site = ?${withDeleted ? '' : ' AND deleted = 0'} ORDER BY active DESC, name`).bind(site).all();
    return results.map(r => rowToStaff(r));
}
function prepareStaff(b) {
    const name = text(b.name, 80);
    if (!name) throw new HttpError(400, 'Enter the staff name.');
    const photo = b.photo == null ? '' : String(b.photo);
    if (photo && !/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(photo)) throw new HttpError(400, 'The photo must be a JPEG/PNG picture.');
    if (photo.length > MAX_IMAGE) throw new HttpError(413, 'The photo is too large.');
    const limits = {};
    for (const k of LIMIT_KEYS) {
        const v = b.limits && b.limits[k];
        if (v === '' || v == null) continue;
        const n = k === 'per_month_value' ? halalas(v) : Number(v);
        if (!(Number.isFinite(n) && n > 0 && n < 1e7)) throw new HttpError(400, `Limit "${k}" must be a positive number.`);
        limits[k] = Math.round(n);
    }
    limits.enforce = !!(b.limits && b.limits.enforce);
    return {
        name, staff_code: text(b.staff_code, 30), room: text(b.room, 20), department: text(b.department, 60), contact: text(b.contact, 30), category: text(b.category, 40),
        photo, free: b.free === false ? 0 : 1, active: b.active === false ? 0 : 1, started_on: /^\d{4}-\d{2}-\d{2}$/.test(b.started_on || '') ? b.started_on : null,
        remarks: text(b.remarks, 300), limits: JSON.stringify(limits),
    };
}
async function saveLaundryStaff(req, env, me, id) {
    requireAdmin(me);
    const b = await body(req);
    const x = prepareStaff(b);
    if (id) {
        const old = await env.DB.prepare('SELECT * FROM laundry_staff WHERE id = ?').bind(id).first();
        if (!old) throw new HttpError(404, 'No such staff profile.');
        await env.DB.batch([
            env.DB.prepare(`UPDATE laundry_staff SET name = ?, staff_code = ?, room = ?, department = ?, contact = ?, category = ?, photo = ?, free = ?, active = ?,
                started_on = ?, remarks = ?, limits = ?, updated_at = ?, updated_by = ? WHERE id = ?`)
                .bind(x.name, x.staff_code, x.room, x.department, x.contact, x.category, x.photo, x.free, x.active, x.started_on, x.remarks, x.limits, now(), me.id, id),
            auditStmt(env, me, 'laundry-staff', null, `${old.site} ${x.name}${old.name !== x.name ? ` (was ${old.name})` : ''}: profile saved${x.active ? '' : ' (inactive)'}${(old.category || '') !== x.category ? `, category "${old.category || ''}" → "${x.category}"` : ''}, limits ${x.limits}`),
        ]);
        return json({ staff: await listLaundryStaff(env, old.site) });
    }
    const site = laundrySite(me, b.site);
    await env.DB.batch([
        env.DB.prepare(`INSERT INTO laundry_staff (site, name, staff_code, room, department, contact, category, photo, free, active, started_on, remarks, limits, created_at, updated_at, updated_by)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
            .bind(site, x.name, x.staff_code, x.room, x.department, x.contact, x.category, x.photo, x.free, x.active, x.started_on, x.remarks, x.limits, now(), now(), me.id),
        auditStmt(env, me, 'laundry-staff', null, `${site} ${x.name}: free-laundry profile added`),
    ]);
    return json({ staff: await listLaundryStaff(env, site) }, 201);
}

// Admin: the staff categories of a site (create, rename, delete). Renamed categories move their staff along;
// staff in a deleted category become uncategorised.
async function saveStaffCategories(req, env, me) {
    requireAdmin(me);
    const b = await body(req);
    const site = laundrySite(me, b.site);
    const list = [...new Set((Array.isArray(b.categories) ? b.categories : []).map(n => text(n, 40)).filter(Boolean))];
    if (list.length > 60) throw new HttpError(400, 'At most 60 categories.');
    const renames = Object.entries(b.renames && typeof b.renames === 'object' ? b.renames : {})
        .map(([from, to]) => [text(from, 40), text(to, 40)]).filter(([from, to]) => from && to && from !== to && list.includes(to));
    const row = await env.DB.prepare("SELECT value FROM settings WHERE key = 'laundry_staff_categories'").first();
    const all = row ? JSON.parse(row.value) : {};
    const before = all[site] || [];
    all[site] = list;
    const t = now();
    const stmts = [env.DB.prepare(`INSERT INTO settings (key, value, updated_at, updated_by) VALUES ('laundry_staff_categories', ?, ?, ?)
        ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at, updated_by = excluded.updated_by`).bind(JSON.stringify(all), t, me.id)];
    for (const [from, to] of renames) stmts.push(env.DB.prepare('UPDATE laundry_staff SET category = ?, updated_at = ?, updated_by = ? WHERE site = ? AND category = ?').bind(to, t, me.id, site, from));
    const keep = [...list, ...renames.map(([from]) => from)];
    stmts.push(env.DB.prepare(`UPDATE laundry_staff SET category = '', updated_at = ?, updated_by = ? WHERE site = ? AND category != ''${keep.length ? ` AND category NOT IN (${keep.map(() => '?').join(',')})` : ''}`)
        .bind(t, me.id, site, ...keep));
    stmts.push(auditStmt(env, me, 'laundry-staff', null, `${site} staff categories: ${before.join(', ') || '—'} → ${list.join(', ') || '—'}${renames.length ? ` (renamed ${renames.map(([f, to]) => `${f} → ${to}`).join(', ')})` : ''}`.slice(0, 500)));
    await env.DB.batch(stmts);
    return json({ categories: list, staff: await listLaundryStaff(env, site, true) });
}

// Admin: "delete" a profile = hide it (kept in the database with its whole free-laundry history)
async function deleteLaundryStaff(env, me, id) {
    requireAdmin(me);
    const s = await env.DB.prepare('SELECT * FROM laundry_staff WHERE id = ?').bind(id).first();
    if (!s) throw new HttpError(404, 'No such staff profile.');
    if (!s.deleted) {
        await env.DB.batch([
            env.DB.prepare('UPDATE laundry_staff SET deleted = 1, active = 0, updated_at = ?, updated_by = ? WHERE id = ?').bind(now(), me.id, id),
            auditStmt(env, me, 'laundry-staff', null, `${s.site} ${s.name}: profile deleted (hidden; record and history kept)`),
        ]);
    }
    return json({ staff: await listLaundryStaff(env, s.site, true) });
}

// A staff member's free laundry so far: this day / week (last 7 days) / month (Jeddah dates), active bills only
async function staffUsage(env, staffId, day) {
    const month = day.slice(0, 7);
    const weekFrom = jeddahDay(Date.parse(day + 'T12:00:00Z') - 6 * 864e5);
    const r = await env.DB.prepare(`SELECT
            COALESCE(SUM(CASE WHEN day = ? THEN items END), 0) AS day_items,
            COALESCE(SUM(CASE WHEN day >= ? AND day <= ? THEN items END), 0) AS week_items,
            COALESCE(SUM(CASE WHEN substr(day, 1, 7) = ? THEN value END), 0) AS month_value,
            COALESCE(SUM(CASE WHEN substr(day, 1, 7) = ? THEN items END), 0) AS month_items,
            COALESCE(SUM(CASE WHEN substr(day, 1, 7) = ? THEN 1 END), 0) AS month_bills
        FROM laundry_bills WHERE staff_id = ? AND voided = 0 AND kind = 'free'`)
        .bind(day, weekFrom, day, month, month, month, staffId).first();
    return r;
}
function limitWarnings(limits, usage, items, value) {
    const w = [];
    if (limits.per_bill_items && items > limits.per_bill_items) w.push(`${items} pieces in this bill; the limit is ${limits.per_bill_items} per submission.`);
    if (limits.per_day_items && usage.day_items + items > limits.per_day_items) w.push(`${usage.day_items + items} pieces today; the limit is ${limits.per_day_items} a day.`);
    if (limits.per_week_items && usage.week_items + items > limits.per_week_items) w.push(`${usage.week_items + items} pieces in 7 days; the limit is ${limits.per_week_items} a week.`);
    if (limits.per_month_value && usage.month_value + value > limits.per_month_value) w.push(`${(usage.month_value + value) / 100} SAR this month; the limit is ${limits.per_month_value / 100} SAR.`);
    if (limits.per_month_bills && usage.month_bills + 1 > limits.per_month_bills) w.push(`${usage.month_bills + 1} free bills this month; the limit is ${limits.per_month_bills}.`);
    return w;
}
async function staffInfo(env, me, id, url) {
    const s = await env.DB.prepare('SELECT * FROM laundry_staff WHERE id = ?').bind(id).first();
    if (!s) throw new HttpError(404, 'No such staff profile.');
    const usage = await staffUsage(env, id, jeddahDay());
    const withBills = url.searchParams.get('bills') === '1';
    const bills = withBills && canSeeAll(me)
        ? (await env.DB.prepare('SELECT * FROM laundry_bills WHERE staff_id = ? ORDER BY created_at DESC LIMIT 1000').bind(id).all()).results.map(rowToBill)
        : undefined;
    return json({ staff: rowToStaff(s), usage, bills });
}

// A supervisor (admin login) approves an over-limit free bill with their name + password
async function verifyApprover(env, approval) {
    if (!approval || !approval.name || !approval.password) return null;
    const n = String(approval.name).trim();
    const since = new Date(Date.now() - 15 * 60e3).toISOString();
    const fails = await env.DB.prepare('SELECT COUNT(*) AS c FROM login_failures WHERE name = ? AND at > ?').bind(n, since).first('c');
    if (fails >= LOGIN_MAX_FAILS) throw new HttpError(429, 'Too many wrong passwords for that supervisor. Wait 15 minutes.');
    const d = await env.DB.prepare("SELECT * FROM desks WHERE name = ? AND role = 'admin' AND disabled = 0").bind(n).first();
    if (!d || !sameHex(await pbkdf2(String(approval.password), d.pw_salt, d.pw_iter), d.pw_hash)) {
        await env.DB.prepare('INSERT INTO login_failures (name, at) VALUES (?, ?)').bind(n, now()).run();
        throw new HttpError(403, 'Supervisor name or password is wrong.');
    }
    return d.name;
}

/* ---------------- bills ---------------- */

function rowToBill(r) {
    return {
        id: r.id, site: r.site, receipt_no: r.receipt_no, client_uid: r.client_uid, kind: r.kind, customer: JSON.parse(r.customer || '{}'),
        staff_id: r.staff_id, staff_name: r.staff_name, lines: JSON.parse(r.lines || '[]'), items: r.items, value: r.value, paid: r.paid,
        method: r.method, received: r.received, status: r.status, voided: !!r.voided, void_reason: r.void_reason,
        given_at: r.given_at, ready_at: r.ready_at, collected_at: r.collected_at, collected_by: r.collected_by_name,
        worker_id: r.worker_id, worker: r.worker_name, day: r.day, approval_by: r.approval_by, warnings: JSON.parse(r.warnings || '[]'),
        version: r.version, created_at: r.created_at, updated_at: r.updated_at, updated_by: r.updated_by_name,
        settled_at: r.settled_at || null, settled_by: r.settled_by_name || null,
    };
}

// Lines from the page are [{ item_id, qty }]; names and prices come from the price master (the worker
// cannot set a price). `keep` = the bill's existing lines, whose original prices stay when edited.
async function priceLines(env, site, raw, keep = []) {
    if (!Array.isArray(raw) || !raw.length) throw new HttpError(400, 'Add at least one item.');
    if (raw.length > 60) throw new HttpError(400, 'Too many lines.');
    const { results } = await env.DB.prepare('SELECT * FROM laundry_items WHERE site = ?').bind(site).all();
    const byId = new Map(results.map(r => [r.id, r]));
    const kept = new Map(keep.map(l => [l.item_id, l]));
    const merged = new Map();
    for (const l of raw) {
        const qty = Math.round(Number(l && l.qty));
        if (!(qty >= 1 && qty <= 2000)) throw new HttpError(400, 'Each quantity must be 1–2000.');
        const id = Number(l.item_id);
        const old = kept.get(id);
        const item = byId.get(id);
        if (!old && !item) throw new HttpError(400, 'An item on this bill no longer exists. Reload the page.');
        const price = old ? old.price : item.price;              // price at the time of billing
        const name = old ? old.name : item.name;
        const m = merged.get(id) || { item_id: id, name, price, qty: 0 };
        m.qty += qty;
        merged.set(id, m);
    }
    const lines = [...merged.values()].map(l => ({ ...l, amount: l.price * l.qty }));
    return { lines, items: lines.reduce((n, l) => n + l.qty, 0), value: lines.reduce((n, l) => n + l.amount, 0) };
}

function prepareCustomer(c) {
    c = c || {};
    return { name: text(c.name, 80), room: text(c.room, 20), building: text(c.building, 40), contact: text(c.contact, 30), group: text(c.group, 80) };
}

async function nextReceipt(env, site, day) {
    const key = `${site}|${day}`;
    const r = await env.DB.prepare('INSERT INTO laundry_counters (key, n) VALUES (?, 1) ON CONFLICT(key) DO UPDATE SET n = n + 1 RETURNING n').bind(key).first();
    return `${LAUNDRY_PREFIX[site] || 'LD'}-${day.replace(/-/g, '')}-${String(r.n).padStart(3, '0')}`;
}

async function createLaundryBill(req, env, me) {
    const b = await body(req);
    const site = laundrySite(me, b.site);
    requireLaundryWrite(me, site);
    const uid = String(b.client_uid || '');
    if (!/^[A-Za-z0-9-]{8,64}$/.test(uid)) throw new HttpError(400, 'Missing bill id (client_uid).');
    // sent before (e.g. offline bill retried): return the stored bill, never a second one
    const dup = await env.DB.prepare('SELECT * FROM laundry_bills WHERE client_uid = ?').bind(uid).first();
    if (dup) return json({ bill: rowToBill(dup), duplicate: true });

    const kind = b.kind === 'free' || b.kind === 'building' ? b.kind : 'paid';
    const { lines, items, value } = await priceLines(env, site, b.lines);
    // when the worker pressed Save (offline bills keep their own time), never in the future
    const at = b.created_local && Date.parse(b.created_local) < Date.now() + 5 * 60e3 && Date.parse(b.created_local) > Date.now() - 14 * 864e5
        ? new Date(Date.parse(b.created_local)).toISOString() : now();
    const day = jeddahDay(Date.parse(at));
    let customer = prepareCustomer(b.customer), staff = null, warnings = [], approvalBy = null;
    let paid = 0, method = '', received = 0;
    if (kind === 'building') {
        customer = { name: '', room: '', building: text(b.customer && b.customer.building, 40), contact: '', group: '' };   // building optional
    } else if (kind === 'free') {
        staff = await env.DB.prepare('SELECT * FROM laundry_staff WHERE id = ? AND site = ? AND deleted = 0').bind(Number(b.staff_id), site).first();
        if (!staff) throw new HttpError(400, 'Choose the staff member for free laundry.');
        if (!staff.active || !staff.free) throw new HttpError(400, `${staff.name} does not have free laundry (profile inactive).`);
        customer = { name: staff.name, room: staff.room, building: '', contact: staff.contact, group: staff.department };
        const limits = JSON.parse(staff.limits || '{}');
        warnings = limitWarnings(limits, await staffUsage(env, staff.id, day), items, value);
        if (warnings.length && limits.enforce) {
            approvalBy = await verifyApprover(env, b.approval);
            if (!approvalBy) return json({ error: 'Over the staff member\'s free-laundry limit: supervisor approval needed.', needs_approval: true, warnings }, 409);
        } else if (warnings.length && b.approval && b.approval.name) {
            approvalBy = await verifyApprover(env, b.approval);
        }
    } else {
        method = 'cash';                                          // laundry takes cash only
        paid = value;
        received = b.received === '' || b.received == null ? value : halalas(b.received);
        if (!(received >= 0 && received <= 10000000)) throw new HttpError(400, 'Amount received is not a valid number.');
    }
    const receipt = await nextReceipt(env, site, day);
    const res = await env.DB.prepare(`INSERT OR IGNORE INTO laundry_bills (site, receipt_no, client_uid, kind, customer, staff_id, staff_name, lines, items, value,
            paid, method, received, status, voided, given_at, worker_id, worker_name, day, approval_by, warnings, version, created_at, updated_at, updated_by)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'received', 0, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?)`)
        .bind(site, receipt, uid, kind, JSON.stringify(customer), staff ? staff.id : null, staff ? staff.name : null, JSON.stringify(lines), items, value,
            paid, method, received, at, me.id, me.name, day, approvalBy, JSON.stringify(warnings), now(), now(), me.id).run();
    const row = await env.DB.prepare('SELECT * FROM laundry_bills WHERE client_uid = ?').bind(uid).first();
    if (!res.meta.changes) return json({ bill: rowToBill(row), duplicate: true });
    if (approvalBy || warnings.length) await auditStmt(env, me, 'laundry-limit', null, `${receipt} ${staff ? staff.name : ''}: ${warnings.join(' ')}${approvalBy ? ` Approved by ${approvalBy}.` : ''}`).run();
    return json({ bill: rowToBill(row), warnings }, 201);
}

const BILL_SELECT = `SELECT b.*, c.name AS collected_by_name, u.name AS updated_by_name, st.name AS settled_by_name FROM laundry_bills b
    LEFT JOIN desks c ON c.id = b.collected_by LEFT JOIN desks u ON u.id = b.updated_by LEFT JOIN desks st ON st.id = b.settled_by`;

async function listLaundryBills(url, env, me) {
    const site = laundrySite(me, url.searchParams.get('site'));
    const from = url.searchParams.get('from') || jeddahDay(), to = url.searchParams.get('to') || from;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(from) || !/^\d{4}-\d{2}-\d{2}$/.test(to)) throw new HttpError(400, 'Dates must be YYYY-MM-DD.');
    const where = ['b.site = ?'], args = [site];
    where.push('b.day >= ? AND b.day <= ?'); args.push(from, to);
    // a worker sees their own bills; a desk login on Laundry admin (all=1) sees every bill of its own site
    const deskAll = url.searchParams.get('all') === '1' && me.role === 'desk';
    if (deskAll && site !== me.site) throw new HttpError(403, `${me.name} works at ${SITES[me.site]}.`);
    if (!canSeeAll(me) && !deskAll) { where.push('b.worker_id = ?'); args.push(me.id); }
    const staffId = Number(url.searchParams.get('staff'));
    if (staffId) { where.push('b.staff_id = ?'); args.push(staffId); }
    const kind = url.searchParams.get('kind');
    if (['paid', 'free', 'building'].includes(kind)) { where.push('b.kind = ?'); args.push(kind); }
    const { results } = await env.DB.prepare(`${BILL_SELECT} WHERE ${where.join(' AND ')} ORDER BY b.created_at DESC LIMIT 5000`).bind(...args).all();
    const closings = (await env.DB.prepare(`SELECT * FROM laundry_closings WHERE site = ? AND day >= ? AND day <= ?${canSeeAll(me) ? '' : ' AND worker_id = ' + Number(me.id)} ORDER BY day DESC, worker_name`)
        .bind(site, from, to).all()).results;
    return json({ site, from, to, bills: results.map(rowToBill), closings });
}

async function searchLaundry(url, env, me) {
    requireSeeAll(me);
    const site = laundrySite(me, url.searchParams.get('site'));
    const q = String(url.searchParams.get('q') || '').trim().toLowerCase();
    if (q.length < 1) throw new HttpError(400, 'Type something to search.');
    const like = `%${q}%`;
    const { results } = await env.DB.prepare(`${BILL_SELECT} WHERE b.site = ? AND (lower(b.receipt_no) LIKE ? OR lower(json_extract(b.customer, '$.name')) LIKE ?
        OR lower(json_extract(b.customer, '$.room')) = ? OR lower(b.staff_name) LIKE ? OR lower(json_extract(b.customer, '$.contact')) LIKE ?) ORDER BY b.created_at DESC LIMIT 1000`)
        .bind(site, like, like, q, like, like).all();
    return json({ bills: results.map(rowToBill) });
}
function requireSeeAll(me) { if (!canSeeAll(me)) throw new HttpError(403, 'Only an admin or a viewer login can search all bills.'); }

// Returning customers: the latest details per room (and names), for the worker's quick fill
async function laundryCustomers(url, env, me) {
    const site = laundrySite(me, url.searchParams.get('site'));
    const since = jeddahDay(Date.now() - 90 * 864e5);
    const { results } = await env.DB.prepare(`SELECT customer, MAX(created_at) AS last, COUNT(*) AS n FROM laundry_bills
        WHERE site = ? AND kind = 'paid' AND voided = 0 AND day >= ? GROUP BY lower(json_extract(customer, '$.room')), lower(json_extract(customer, '$.name'))
        ORDER BY last DESC LIMIT 2000`).bind(site, since).all();
    return json({ customers: results.map(r => ({ ...JSON.parse(r.customer || '{}'), last: r.last, bills: r.n })) });
}

async function getBillRow(env, id) {
    const r = await env.DB.prepare(`${BILL_SELECT} WHERE b.id = ?`).bind(id).first();
    if (!r) throw new HttpError(404, 'No such bill.');
    return r;
}

// Admin: correct a bill (customer/room, quantities, items, payment); old lines keep their original price
async function editLaundryBill(req, env, me, id) {
    requireAdmin(me);
    const b = await body(req);
    const r = await getBillRow(env, id);
    if (Number(b.version) !== r.version) throw new HttpError(409, 'Someone changed this bill meanwhile. Reload and try again.');
    if (r.voided) throw new HttpError(400, 'A cancelled bill cannot be edited.');
    const before = rowToBill(r);
    const { lines, items, value } = await priceLines(env, r.site, b.lines, before.lines);
    const customer = r.kind === 'paid' ? prepareCustomer(b.customer) : before.customer;
    let method = r.method, received = r.received, paid = r.paid;
    if (r.kind === 'paid') {
        method = 'cash';
        paid = value;
        received = b.received === '' || b.received == null ? value : halalas(b.received);
    }
    const diff = [];
    const fmtL = (ls) => ls.map(l => `${l.qty} ${l.name}`).join(', ');
    if (r.settled_at && before.value !== value) throw new HttpError(400, 'This bill is already marked paid. Mark it unpaid first, then change the amount.');
    if (fmtL(before.lines) !== fmtL(lines)) diff.push(`items: ${fmtL(before.lines)} → ${fmtL(lines)}`);
    if (before.value !== value) diff.push(`total ${before.value / 100} → ${value / 100} SAR`);
    for (const k of ['name', 'room', 'building', 'contact', 'group']) if ((before.customer[k] || '') !== (customer[k] || '')) diff.push(`${k} "${before.customer[k] || ''}" → "${customer[k] || ''}"`);
    if (before.method !== method) diff.push(`payment ${before.method} → ${method}`);
    if (!diff.length) return json({ bill: before });
    await env.DB.batch([
        env.DB.prepare(`UPDATE laundry_bills SET customer = ?, lines = ?, items = ?, value = ?, paid = ?, method = ?, received = ?, version = version + 1,
            updated_at = ?, updated_by = ? WHERE id = ? AND version = ?`)
            .bind(JSON.stringify(customer), JSON.stringify(lines), items, value, paid, method, received, now(), me.id, id, r.version),
        auditStmt(env, me, 'laundry-edit', null, `${r.receipt_no}: ${diff.join('; ')}`.slice(0, 500)),
    ]);
    return json({ bill: rowToBill(await getBillRow(env, id)) });
}

// Admin: cancel a bill; it stays (marked cancelled) and leaves every total
async function voidLaundryBill(req, env, me, id) {
    requireAdmin(me);
    const { reason } = await body(req);
    const why = text(reason, 200);
    if (!why) throw new HttpError(400, 'Give a reason for cancelling.');
    const r = await getBillRow(env, id);
    if (r.voided) return json({ bill: rowToBill(r) });
    await env.DB.batch([
        env.DB.prepare('UPDATE laundry_bills SET voided = 1, void_reason = ?, version = version + 1, updated_at = ?, updated_by = ? WHERE id = ?').bind(why, now(), me.id, id),
        auditStmt(env, me, 'laundry-void', null, `${r.receipt_no} (${r.value / 100} SAR, ${r.worker_name}) cancelled: ${why}`),
    ]);
    return json({ bill: rowToBill(await getBillRow(env, id)) });
}

// Admin or desk login: the worker handed the cash over → mark cash bills paid (or back to unpaid), one or many
// at once. A desk login only touches bills of its own site.
async function settleLaundryBills(req, env, me) {
    if (me.role !== 'admin' && me.role !== 'desk') throw new HttpError(403, `${me.name} is a read-only login.`);
    const b = await body(req);
    const ids = [...new Set((Array.isArray(b.ids) ? b.ids : []).map(Number).filter(n => Number.isInteger(n) && n > 0))];
    if (!ids.length) throw new HttpError(400, 'Choose at least one bill.');
    if (ids.length > 2000) throw new HttpError(400, 'Too many bills at once.');
    const paid = b.paid !== false;
    const marks = ids.map(() => '?').join(',');
    const own = me.role === 'admin' ? '' : ' AND site = ?';
    const { results } = await env.DB.prepare(`SELECT id, receipt_no, paid, settled_at FROM laundry_bills WHERE id IN (${marks}) AND kind = 'paid' AND voided = 0${own}`)
        .bind(...ids, ...(own ? [me.site] : [])).all();
    const todo = results.filter(r => paid ? !r.settled_at : !!r.settled_at);
    if (todo.length) {
        const t = now(), list = todo.map(r => r.id), m2 = list.map(() => '?').join(',');
        await env.DB.batch([
            env.DB.prepare(`UPDATE laundry_bills SET settled_at = ?, settled_by = ?, version = version + 1, updated_at = ?, updated_by = ? WHERE id IN (${m2})`)
                .bind(paid ? t : null, paid ? me.id : null, t, me.id, ...list),
            auditStmt(env, me, 'laundry-settle', null, `${paid ? 'Marked paid' : 'Marked unpaid'}: ${todo.length} bill${todo.length === 1 ? '' : 's'}, ${todo.reduce((n, r) => n + r.paid, 0) / 100} SAR — ${todo.map(r => r.receipt_no).join(', ')}`.slice(0, 1000)),
        ]);
    }
    const { results: rows } = await env.DB.prepare(`${BILL_SELECT} WHERE b.id IN (${marks})`).bind(...ids).all();
    return json({ bills: rows.map(rowToBill), changed: todo.length });
}

// Day close: the worker counts the cash; expected = their cash bills that day. Once per worker and day.
async function closeLaundryDay(req, env, me) {
    const b = await body(req);
    const site = laundrySite(me, b.site);
    requireLaundryWrite(me, site);
    const day = /^\d{4}-\d{2}-\d{2}$/.test(b.day || '') ? b.day : jeddahDay();
    const actual = halalas(b.cash_actual);
    if (!(actual >= 0 && actual <= 100000000)) throw new HttpError(400, 'Enter the cash in hand.');
    const s = await env.DB.prepare(`SELECT COUNT(*) AS bills, COALESCE(SUM(paid), 0) AS sales,
            COALESCE(SUM(CASE WHEN method = 'cash' THEN paid END), 0) AS cash
        FROM laundry_bills WHERE site = ? AND day = ? AND worker_id = ? AND voided = 0 AND kind = 'paid'`).bind(site, day, me.id).first();
    const res = await env.DB.prepare(`INSERT OR IGNORE INTO laundry_closings (site, day, worker_id, worker_name, bills, sales, cash_expected, cash_actual, diff, note, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
        .bind(site, day, me.id, me.name, s.bills, s.sales, s.cash, actual, actual - s.cash, text(b.note, 200), now()).run();
    if (!res.meta.changes) throw new HttpError(409, `${me.name} has already closed ${day}. Ask the admin if it needs a correction.`);
    await auditStmt(env, me, 'laundry-close', null, `${site} ${day} ${me.name}: expected ${s.cash / 100}, counted ${actual / 100}, difference ${(actual - s.cash) / 100} SAR`).run();
    const row = await env.DB.prepare('SELECT * FROM laundry_closings WHERE site = ? AND day = ? AND worker_id = ?').bind(site, day, me.id).first();
    return json({ closing: row }, 201);
}

async function laundryAudit(url, env, me) {
    requireSeeAll(me);
    const { results } = await env.DB.prepare(`SELECT a.at, a.action, a.detail, COALESCE(d.name, x.name || ' (deleted)') AS desk FROM audit a
        LEFT JOIN desks d ON d.id = a.desk_id LEFT JOIN deleted_desks x ON x.id = a.desk_id
        WHERE a.action LIKE 'laundry-%' ORDER BY a.id DESC LIMIT 500`).all();
    return json({ audit: results });
}

async function laundryRoute(p, m, url, req, env, me) {
    if (p === '/api/laundry/items' && m === 'GET') return json({ items: await listLaundryItems(env, laundrySite(me, url.searchParams.get('site')), me) });
    if (p === '/api/laundry/items' && m === 'POST') return saveLaundryItem(req, env, me, 0);
    let mm = p.match(/^\/api\/laundry\/items\/(\d+)$/);
    if (mm && m === 'PUT') return saveLaundryItem(req, env, me, Number(mm[1]));
    if (p === '/api/laundry/staff' && m === 'GET') return json({ staff: await listLaundryStaff(env, laundrySite(me, url.searchParams.get('site')), url.searchParams.get('deleted') === '1' && canSeeAll(me)) });
    if (p === '/api/laundry/staff' && m === 'POST') return saveLaundryStaff(req, env, me, 0);
    if (p === '/api/laundry/staff-categories' && m === 'PUT') return saveStaffCategories(req, env, me);
    mm = p.match(/^\/api\/laundry\/staff\/(\d+)$/);
    if (mm && m === 'PUT') return saveLaundryStaff(req, env, me, Number(mm[1]));
    if (mm && m === 'GET') return staffInfo(env, me, Number(mm[1]), url);
    if (mm && m === 'DELETE') return deleteLaundryStaff(env, me, Number(mm[1]));
    if (p === '/api/laundry/bills' && m === 'GET') return listLaundryBills(url, env, me);
    if (p === '/api/laundry/bills' && m === 'POST') return createLaundryBill(req, env, me);
    if (p === '/api/laundry/search' && m === 'GET') return searchLaundry(url, env, me);
    if (p === '/api/laundry/settle' && m === 'POST') return settleLaundryBills(req, env, me);
    if (p === '/api/laundry/customers' && m === 'GET') return laundryCustomers(url, env, me);
    mm = p.match(/^\/api\/laundry\/bills\/(\d+)(?:\/(void))?$/);
    if (mm && !mm[2] && m === 'PUT') return editLaundryBill(req, env, me, Number(mm[1]));
    if (mm && mm[2] === 'void' && m === 'POST') return voidLaundryBill(req, env, me, Number(mm[1]));
    if (p === '/api/laundry/close' && m === 'POST') return closeLaundryDay(req, env, me);
    if (p === '/api/laundry/audit' && m === 'GET') return laundryAudit(url, env, me);
    return null;
}

/* -------------------------------- transport -------------------------------- */
// The day's vehicle list pasted on the Transport import page: one JSON document per site and day
// (app/core/transport.js parses it and numbers the buses). Read: any login · write: desk of that site, admin.

const MAX_TRANSPORT_BYTES = 512 * 1024;
const transportSite = (v, me) => { const s = String(v || me.site); if (!SITES[s]) throw new HttpError(400, `Unknown site "${s}".`); return s; };
const transportDay = (v) => { const d = String(v || ''); if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) throw new HttpError(400, 'day must be YYYY-MM-DD.'); return d; };

async function getTransport(env, site, day) {
    const row = await env.DB.prepare('SELECT t.rows, t.version, t.updated_at, d.name AS updated_by FROM transport_days t LEFT JOIN desks d ON d.id = t.updated_by WHERE t.site = ? AND t.day = ?')
        .bind(site, day).first();
    return json({ site, day, rows: row ? JSON.parse(row.rows) : [], version: row ? row.version : 0, updated_at: row ? row.updated_at : null, updated_by: row ? row.updated_by : null });
}

async function transportDays(env, site) {
    const { results } = await env.DB.prepare('SELECT day, n, pax, updated_at FROM transport_days WHERE site = ? ORDER BY day').bind(site).all();
    return json({ site, days: results });
}

// Whole-day save with the version the page loaded (0 = new day); another desk's newer save → 409
async function putTransport(req, env, me) {
    const { site, day, rows, version, note } = await body(req);
    assertWrite(me, site);
    const d = transportDay(day);
    if (!Array.isArray(rows)) throw new HttpError(400, 'rows must be a list.');
    if (rows.length > 500) throw new HttpError(413, 'At most 500 trips a day.');
    const list = cleanSlip(rows);
    const text = JSON.stringify(list);
    if (text.length > MAX_TRANSPORT_BYTES) throw new HttpError(413, 'Transport list too large.');
    const pax = list.reduce((s, r) => s + (Number(r && r.pax) || 0), 0);
    const v = Number(version) || 0;
    const write = v === 0
        ? env.DB.prepare('INSERT OR IGNORE INTO transport_days (site, day, rows, n, pax, version, updated_at, updated_by) VALUES (?, ?, ?, ?, ?, 1, ?, ?)').bind(site, d, text, list.length, pax, now(), me.id)
        : env.DB.prepare('UPDATE transport_days SET rows = ?, n = ?, pax = ?, version = version + 1, updated_at = ?, updated_by = ? WHERE site = ? AND day = ? AND version = ?').bind(text, list.length, pax, now(), me.id, site, d, v);
    const [res] = await env.DB.batch([write]);
    if (!res.meta.changes) {
        const cur = await (await getTransport(env, site, d)).json();
        throw new HttpError(409, `The ${d} transport list was changed by ${cur.updated_by || 'another desk'} meanwhile. Reload and try again.`, { current: cur });
    }
    await auditStmt(env, me, 'transport-save', null, `${site} ${d}: ${list.length} trips${note ? ' · ' + String(note).slice(0, 300) : ''}`).run();
    return getTransport(env, site, d);
}

/* -------------------------------- signage -------------------------------- */
// The public board /<site>/signage and its Signage Builder (Transport menu).
//   signage_config (one per site): { window, slides } — window = which trips (Riyadh time); slides = per trip type
//     (a route such as "MAKKAH-MADINA") the template it is shown with ('classic', 'none' or a template id) and the
//     seconds a slide stays. Order of `slides` = order on the board.
//   signage_templates: the designs made in the builder (elements, columns, colours, images as data: URLs).
// Read: any login · write: desk of the site, admin. The board itself reads through /api/public/… without a login.

const SIGNAGE_WINDOW = { from: 'now', to_day: 1, to_time: '23:59' };   // default: upcoming today + all of tomorrow
const SIGNAGE_DEFAULT_SLIDES = ['MAKKAH-JEDDAH AIRPORT', 'MAKKAH-MADINA', 'MAKKAH-MAKKAH ATRAAF'].map(type => ({ type, template: 'classic', seconds: 15 }));
const MAX_TEMPLATE_BYTES = 1800 * 1024;
const DATA_IMAGE = /^data:image\/(png|jpeg|webp|gif);base64,[A-Za-z0-9+/=]+$/;

function checkWindow(v) {
    return !!v && typeof v === 'object' && !Array.isArray(v) && (v.from === 'now' || HHMM(v.from)) && [0, 1, 2].includes(v.to_day) && HHMM(v.to_time)
        && !(v.to_day === 0 && v.from !== 'now' && v.to_time <= v.from);
}

async function signageConfig(env, site) {
    const row = await env.DB.prepare('SELECT c.data, c.version, c.updated_at, d.name AS updated_by FROM signage_config c LEFT JOIN desks d ON d.id = c.updated_by WHERE c.site = ?').bind(site).first();
    if (row) return { ...JSON.parse(row.data), version: row.version, updated_at: row.updated_at, updated_by: row.updated_by };
    // never saved: the window from the old Setup setting, the three Makkah destinations on the Classic board
    const set = await env.DB.prepare("SELECT value FROM settings WHERE key = 'signage_window'").first();
    return { window: { ...SIGNAGE_WINDOW, ...(set ? JSON.parse(set.value) : {}) }, slides: SIGNAGE_DEFAULT_SLIDES, version: 0, updated_at: null, updated_by: null };
}

// Template content: markup characters out of every string, images only as data:image URLs, bounded depth and size
function cleanTemplate(v, depth = 0) {
    if (depth > 8) return null;
    if (typeof v === 'string') return v.startsWith('data:') ? (DATA_IMAGE.test(v) ? v : '') : v.replace(/[<>]/g, '').slice(0, 1000);
    if (typeof v === 'number') return Number.isFinite(v) ? v : null;
    if (typeof v === 'boolean' || v === null) return v;
    if (Array.isArray(v)) return v.slice(0, 200).map(x => cleanTemplate(x, depth + 1));
    if (v && typeof v === 'object') {
        const o = {};
        for (const [k, x] of Object.entries(v).slice(0, 100)) o[String(k).slice(0, 40)] = cleanTemplate(x, depth + 1);
        return o;
    }
    return null;
}
function prepareTemplate(b) {
    const name = text(b && b.name, 60);
    if (!name) throw new HttpError(400, 'Give the template a name.');
    if (!b.data || typeof b.data !== 'object' || Array.isArray(b.data)) throw new HttpError(400, 'Template data missing.');
    const data = JSON.stringify(cleanTemplate(b.data));
    if (data.length > MAX_TEMPLATE_BYTES) throw new HttpError(413, 'Template too large — use smaller images (about 1.5 MB in all).');
    return { name, data };
}
const TEMPLATE_SELECT = 'SELECT t.*, d.name AS updated_by_name FROM signage_templates t LEFT JOIN desks d ON d.id = t.updated_by';
const rowToTemplate = (r) => ({ id: r.id, site: r.site, name: r.name, data: JSON.parse(r.data), version: r.version, updated_at: r.updated_at, updated_by: r.updated_by_name || null });

async function listTemplates(env, site) {
    const { results } = await env.DB.prepare(`${TEMPLATE_SELECT} WHERE t.site = ? ORDER BY t.name, t.id`).bind(site).all();
    return results.map(rowToTemplate);
}
async function getSignage(env, site) {
    return json({ site, config: await signageConfig(env, site), templates: await listTemplates(env, site) });
}

async function putSignageConfig(req, env, me) {
    const { site, config, version } = await body(req);
    assertWrite(me, site);
    if (!config || typeof config !== 'object') throw new HttpError(400, 'config missing.');
    const cur = await signageConfig(env, site);
    const window = config.window === undefined ? cur.window : config.window;
    if (!checkWindow(window)) throw new HttpError(400, 'Signage window: beginning "now" or HH:MM, end today / tomorrow / day after at HH:MM, and the end after the beginning.');
    const slides = config.slides === undefined ? cur.slides : config.slides;
    if (!Array.isArray(slides) || slides.length > 60) throw new HttpError(400, 'At most 60 trip types.');
    const clean = slides.map(s => ({
        type: text(s && s.type, 80),
        template: s && (s.template === 'classic' || s.template === 'none') ? s.template : (Number(s && s.template) || 'none'),
        seconds: Math.min(600, Math.max(3, Math.round(Number(s && s.seconds) || 15))),
    })).filter(s => s.type);
    const data = JSON.stringify({ window: { from: window.from, to_day: window.to_day, to_time: window.to_time }, slides: clean });
    const v = Number(version) || 0;
    const write = v === 0
        ? env.DB.prepare('INSERT OR IGNORE INTO signage_config (site, data, version, updated_at, updated_by) VALUES (?, ?, 1, ?, ?)').bind(site, data, now(), me.id)
        : env.DB.prepare('UPDATE signage_config SET data = ?, version = version + 1, updated_at = ?, updated_by = ? WHERE site = ? AND version = ?').bind(data, now(), me.id, site, v);
    const [res] = await env.DB.batch([write]);
    if (!res.meta.changes) throw new HttpError(409, 'The signage settings were changed by another desk meanwhile. Reload and try again.');
    await auditStmt(env, me, 'signage-config', null, `${site}: ${clean.filter(s => s.template !== 'none').length} trip type(s) shown`).run();
    return getSignage(env, site);
}

async function saveTemplate(req, env, me, id) {
    const b = await body(req);
    const t = prepareTemplate(b);
    if (!id) {
        assertWrite(me, b.site);
        const res = await env.DB.prepare('INSERT INTO signage_templates (site, name, data, version, updated_at, updated_by) VALUES (?, ?, ?, 1, ?, ?)').bind(b.site, t.name, t.data, now(), me.id).run();
        await auditStmt(env, me, 'signage-template', null, `${b.site}: new "${t.name}"`).run();
        return json({ template: rowToTemplate(await env.DB.prepare(`${TEMPLATE_SELECT} WHERE t.id = ?`).bind(res.meta.last_row_id).first()) });
    }
    const cur = await env.DB.prepare('SELECT site FROM signage_templates WHERE id = ?').bind(id).first();
    if (!cur) throw new HttpError(404, 'That template was deleted.');
    assertWrite(me, cur.site);
    const res = await env.DB.prepare('UPDATE signage_templates SET name = ?, data = ?, version = version + 1, updated_at = ?, updated_by = ? WHERE id = ? AND version = ?')
        .bind(t.name, t.data, now(), me.id, id, Number(b.version) || 0).run();
    if (!res.meta.changes) throw new HttpError(409, 'This template was changed by another desk meanwhile. Reload it and try again.');
    await auditStmt(env, me, 'signage-template', null, `${cur.site}: saved "${t.name}"`).run();
    return json({ template: rowToTemplate(await env.DB.prepare(`${TEMPLATE_SELECT} WHERE t.id = ?`).bind(id).first()) });
}

async function deleteTemplate(env, me, id) {
    const cur = await env.DB.prepare('SELECT site, name FROM signage_templates WHERE id = ?').bind(id).first();
    if (!cur) return json({ ok: true });
    assertWrite(me, cur.site);
    await env.DB.batch([
        env.DB.prepare('DELETE FROM signage_templates WHERE id = ?').bind(id),
        auditStmt(env, me, 'signage-template', null, `${cur.site}: deleted "${cur.name}"`),
    ]);
    return json({ ok: true });
}

// Every trip type (route) in the saved transport lists: how many trips and the last day it appears
async function transportTypes(env, site) {
    const { results } = await env.DB.prepare('SELECT day, rows FROM transport_days WHERE site = ? ORDER BY day').bind(site).all();
    const types = new Map();
    for (const r of results) for (const t of JSON.parse(r.rows)) {
        if (!t || !t.route) continue;
        const x = types.get(t.route) || { type: t.route, trips: 0, last: '' };
        x.trips++; x.last = r.day;
        types.set(t.route, x);
    }
    return json({ site, types: [...types.values()].sort((a, b) => a.type.localeCompare(b.type)) });
}

// What changes the board's look: its config and templates (the board reloads them only when this changes)
async function signageStamp(env, site, cfg) {
    const t = await env.DB.prepare('SELECT COUNT(*) AS n, MAX(updated_at) AS at FROM signage_templates WHERE site = ?').bind(site).first();
    return `${cfg.version}|${cfg.updated_at || ''}|${t.n}|${t.at || ''}`;
}
const publicSite = (url) => { const s = String(url.searchParams.get('site') || 'makkah'); if (!SITES[s]) throw new HttpError(400, `Unknown site "${s}".`); return s; };
const publicJson = (data) => new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'public, max-age=10', 'Access-Control-Allow-Origin': '*' },
});

// Public (no login): the trips the board shows — trip types given a template, inside the window (Riyadh time),
// only the fields the board can show. Grouped trips (no route) come along; the page joins them to their bus.
async function publicSignage(url, env) {
    const site = publicSite(url);
    const cfg = await signageConfig(env, site);
    const w = cfg.window;
    const riyadh = new Date(Date.now() + 3 * 3600e3).toISOString();  // Saudi Arabia: UTC+3, no daylight saving
    const today = riyadh.slice(0, 10);
    const dayPlus = (n) => new Date(Date.parse(today) + n * 864e5).toISOString().slice(0, 10);
    const days = [0, 1, 2].slice(0, w.to_day + 1).map(dayPlus);
    const from = w.from === 'now' ? riyadh.slice(0, 16) : `${today}T${w.from}`;
    const to = `${dayPlus(w.to_day)}T${w.to_time}`;
    const shown = cfg.slides.filter(s => s.template !== 'none');
    const types = new Set(shown.map(s => s.type));
    // the transporter (it carries phone numbers) only when a template shows that column
    let withTransporter = false;
    const ids = shown.map(s => s.template).filter(x => typeof x === 'number');
    if (ids.length) {
        const { results } = await env.DB.prepare(`SELECT data FROM signage_templates WHERE site = ? AND id IN (${ids.map(() => '?').join(', ')})`).bind(site, ...ids).all();
        withTransporter = results.some(r => r.data.includes('"field":"transporter"'));
    }
    const { results } = await env.DB.prepare(`SELECT day, rows FROM transport_days WHERE site = ? AND day IN (${days.map(() => '?').join(', ')})`).bind(site, ...days).all();
    const rows = [];
    for (const r of results) {
        for (const t of JSON.parse(r.rows)) {
            if (!t || (t.route && !types.has(t.route))) continue;
            rows.push({ day: r.day, key: t.key, ref: t.ref, at: t.at, route: t.route || '', operator: t.operator || '', leader: t.leader || '',
                pax: t.pax, m: t.m || 0, f: t.f || 0, c: t.c || 0, bus: t.bus ?? null, vehicle: t.vehicle === 'car' ? 'car' : '', vch: t.vch || '', dora: t.dora || '', adj: t.adj || '',
                ...(withTransporter ? { transporter: t.transporter || '' } : {}) });
        }
    }
    return publicJson({ site, now: riyadh.slice(0, 16), today, tomorrow: dayPlus(1), days, from, to, rows, stamp: await signageStamp(env, site, cfg) });
}

// Public (no login): the slides and the templates they use
async function publicSignageSetup(url, env) {
    const site = publicSite(url);
    const cfg = await signageConfig(env, site);
    const ids = [...new Set(cfg.slides.map(s => s.template).filter(x => typeof x === 'number'))];
    let templates = [];
    if (ids.length) {
        const { results } = await env.DB.prepare(`SELECT id, name, data FROM signage_templates WHERE site = ? AND id IN (${ids.map(() => '?').join(', ')})`).bind(site, ...ids).all();
        templates = results.map(r => ({ id: r.id, name: r.name, data: JSON.parse(r.data) }));
    }
    return publicJson({ site, slides: cfg.slides, templates, stamp: await signageStamp(env, site, cfg) });
}

async function deleteTransport(url, env, me) {
    const site = transportSite(url.searchParams.get('site'), me);
    assertWrite(me, site);
    const d = transportDay(url.searchParams.get('day'));
    const v = Number(url.searchParams.get('version')) || 0;
    const [res] = await env.DB.batch([env.DB.prepare('DELETE FROM transport_days WHERE site = ? AND day = ? AND version = ?').bind(site, d, v)]);
    if (!res.meta.changes) throw new HttpError(409, `The ${d} transport list was changed meanwhile. Reload and try again.`);
    await auditStmt(env, me, 'transport-delete', null, `${site} ${d}`).run();
    return json({ ok: true });
}

async function listAudit(url, env) {
    const limit = Math.min(500, Number(url.searchParams.get('limit')) || 200);
    const { results } = await env.DB.prepare(
        "SELECT a.id, a.at, a.action, a.slip_id, a.detail, COALESCE(d.name, x.name || ' (deleted)') AS desk FROM audit a LEFT JOIN desks d ON d.id = a.desk_id LEFT JOIN deleted_desks x ON x.id = a.desk_id ORDER BY a.id DESC LIMIT ?"
    ).bind(limit).all();
    return json({ audit: results });
}
