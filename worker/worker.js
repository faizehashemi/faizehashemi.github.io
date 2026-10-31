// PMS cloud API — Cloudflare Worker + D1. Single file, no dependencies.
//
// Bindings:  DB (D1 database)   ALLOWED_ORIGINS (var, comma-separated, e.g. "https://faizehashemi.github.io")
//            CHAT_BOT_TOKEN_1 (secret) — Telegram bot token for the guest chatbot (chat.html); never put it in the site
//            CHAT_TG_CHAT_ID (optional var) — Telegram group the chatbot posts to
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
// A site admin is an admin login flagged site_only: it manages the logins of its own site only. Stored as role 'admin' + site_only = 1 (the role column
// has a CHECK), but every request sees role 'siteadmin', so each existing `role === 'admin'` check (all sites, settings, backups …) stays owner-only.
const roleOf = (d) => (d.role === 'admin' && d.site_only ? 'siteadmin' : d.role);
const GIVABLE = ['desk', 'viewer'];   // what a site admin may hand out
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
    // Cloudflare cron (wrangler.toml [triggers], every 5 minutes): live flight status when it is due
    async scheduled(event, env, ctx) {
        ctx.waitUntil(backupIfDue(env, event.scheduledTime).catch(e => console.error('backup', e && e.stack || e)));
        if (!FLIGHT_API_ON) return; // live flight status switched off (Check-ins shows only the Check 1 / Check 2 links)
        ctx.waitUntil(refreshFlightStatus(env, false).catch(e => console.error('flights', e && e.stack || e)));
    },
};

/* --------------------------------- plumbing --------------------------------- */

/**
 * A public GET answered from Cloudflare's edge cache for `seconds` (one answer per address per data centre), so many
 * screens asking the same thing cost one database read. Errors are not kept. No cache (tests): answered directly.
 */
async function edgeCached(req, seconds, make) {
    const cache = typeof caches !== 'undefined' && caches.default;
    if (!cache) return make();
    const key = new Request(new URL(req.url).toString(), { method: 'GET' });
    const hit = await cache.match(key);
    if (hit) return new Response(hit.body, hit); // a copy with headers that may still be changed (CORS)
    const res = await make();
    if (res.ok) {
        const keep = new Response(res.clone().body, res);
        keep.headers.set('Cache-Control', `public, max-age=${seconds}`);
        await cache.put(key, keep);
    }
    return res;
}

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

/* ------------------------------ guest chatbot ------------------------------ */

// chat.html posts the request text here; the Worker sends it to the staff Telegram group with the
// bot token kept as a Cloudflare secret, so the token never appears in the public site.
const CHAT_TG_CHAT_ID = '-1003946914913'; // supergroup (the old group -4754144977 was upgraded)
const CHAT_MAX_CHARS = 2000;

async function chatNotify(req, env) {
    const origin = req.headers.get('Origin') || '';
    const allowed = String(env.ALLOWED_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean);
    if (!allowed.includes(origin) && !/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) throw new HttpError(403, 'Origin not allowed');
    if (!env.CHAT_BOT_TOKEN_1) throw new HttpError(503, 'Chat bot is not configured');
    const b = await body(req);
    const text = typeof b.text === 'string' ? b.text.trim() : '';
    if (!text) throw new HttpError(400, 'text is required');
    if (text.length > CHAT_MAX_CHARS) throw new HttpError(400, 'text is too long');

    const send = (extra) => fetch(`https://api.telegram.org/bot${env.CHAT_BOT_TOKEN_1}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: env.CHAT_TG_CHAT_ID || CHAT_TG_CHAT_ID, text, ...extra }),
    });
    let r = await send({ parse_mode: 'Markdown' });
    if (r.status === 400) r = await send({}); // guest text broke the Markdown: send it plain
    if (!r.ok) {
        console.error('Telegram sendMessage failed', r.status, await r.text());
        throw new HttpError(502, 'Could not reach Telegram');
    }
    return json({ ok: true });
}

/* --------------------------------- routes --------------------------------- */

async function route(req, env) {
    const url = new URL(req.url);
    const p = url.pathname.replace(/\/+$/, '');
    const m = req.method;

    if (p === '/api/health') return json({ ok: true, time: now(), ...(env.MAINTENANCE === '1' ? { maintenance: true } : {}) });
    // maintenance (deploy with --var MAINTENANCE:1, e.g. while the database moves): reading works, nothing is written
    if (env.MAINTENANCE === '1' && m !== 'GET' && m !== 'OPTIONS') {
        throw new HttpError(503, 'Saving is paused for a few minutes while the PMS moves to a faster server. Please try again shortly — nothing you entered was saved.');
    }
    if (p === '/api/login' && m === 'POST') return login(req, env);
    // no login: the TV boards — the same answer is kept at the edge for 30 s, so many screens cost one database read
    if (p === '/api/public/signage' && m === 'GET') return edgeCached(req, 30, () => publicSignage(url, env));
    if (p === '/api/public/signage/setup' && m === 'GET') return edgeCached(req, 30, () => publicSignageSetup(url, env));
    if (p === '/api/public/chat-notify' && m === 'POST') return chatNotify(req, env); // no login: guest chatbot

    // the reads every open page makes all the time: login check + data in ONE database trip (D1 batch)
    if (m === 'GET' && p === '/api/sync') return syncHeartbeat(req, url, env);
    if (m === 'GET' && p === '/api/slips') return (await authedBatch(req, env, [pullStmt(url, env)])).reply(([r]) => pullReply(url, r));
    // the watchdog's fingerprint of the live slips (how many, their versions added up, the newest change): a browser whose mirror differs repairs itself
    if (m === 'GET' && p === '/api/slips/digest') return (await authedBatch(req, env, [(tokenHash) => env.DB.prepare(
        `SELECT COUNT(*) AS n, COALESCE(SUM(version), 0) AS v, COALESCE(MAX(seq), 0) AS s FROM slips WHERE deleted = 0 AND ${OWN_SITE}`).bind(tokenHash)]))
        .reply(([r]) => ({ n: r.results[0].n, v: r.results[0].v, s: r.results[0].s }));
    if (m === 'GET' && p === '/api/me') return (await authedBatch(req, env, [])).reply((_, me) => ({ desk: publicDesk(me) }));
    if (m === 'GET' && p === '/api/me/prefs') return (await authedBatch(req, env, [prefsStmt(req, env)]))
        .reply(([r]) => { const row = r.results[0]; return { prefs: row ? JSON.parse(row.prefs) : null, updated_at: row ? row.updated_at : null }; });

    const me = await authenticate(req, env);
    if (p === '/api/logout' && m === 'POST') {
        await env.DB.prepare('DELETE FROM sessions WHERE token_hash = ?').bind(me.tokenHash).run();
        return json({ ok: true });
    }
    if (p === '/api/me' && m === 'GET') return json({ desk: publicDesk(me) });
    if (p === '/api/me/password' && m === 'POST') return changeOwnPassword(req, env, me);
    if (p === '/api/me/prefs' && m === 'GET') return getPrefs(env, me);
    if (p === '/api/me/prefs' && m === 'PUT') return putPrefs(req, env, me);

    if (p === '/api/slips' && m === 'POST') return createSlip(req, env, me);
    if (p === '/api/slips/bulk' && m === 'POST') return bulk(req, env, me);
    if (p === '/api/slips/migrate' && m === 'POST') return migrate(req, env, me);
    if (p === '/api/slips/clear' && m === 'POST') return clearSite(req, env, me);
    let mm = p.match(/^\/api\/slips\/(\d+)\/versions$/);
    if (mm && m === 'GET') return listSlipVersions(env, Number(mm[1]));
    mm = p.match(/^\/api\/slips\/(\d+)\/activate$/);
    if (mm && m === 'POST') return activateSlipVersion(req, env, me, Number(mm[1]));
    mm = p.match(/^\/api\/slips\/(\d+)$/);
    if (mm && m === 'PUT') return updateSlip(req, env, me, Number(mm[1]));
    if (mm && m === 'DELETE') return deleteSlip(url, env, me, Number(mm[1]));

    if (p === '/api/settings' && m === 'GET') return getSettings(env, me, url.searchParams.get('site'));
    if (p === '/api/settings' && m === 'PUT') { requireDeskManager(me); return putSettings(req, env, me, url); }

    if (p === '/api/kg' && m === 'GET') return getKg(env, String(url.searchParams.get('site') || me.site));
    if (p === '/api/kg/op' && m === 'POST') return kgOp(req, env, me);
    if (p === '/api/kg/log' && m === 'POST') return addKgLog(req, env, me);
    mm = p.match(/^\/api\/kg\/log\/(\d+)$/);
    if (mm && m === 'DELETE') return deleteKgLog(url, env, me, Number(mm[1]));

    if (p === '/api/key-cards' && m === 'GET') return getKeyCards(url, env, me);
    if (p === '/api/key-cards' && m === 'PUT') return putKeyCards(req, env, me);

    if (p === '/api/alloc-log' && m === 'GET') return getAllocLog(env, String(url.searchParams.get('site') || me.site));
    if (p === '/api/alloc-log' && m === 'POST') return addAllocLog(req, env, me);
    mm = p.match(/^\/api\/alloc-log\/(\d+)\/undo$/);
    if (mm && m === 'POST') return undoAllocLog(req, env, me, Number(mm[1]));


    if (p === '/api/transport' && m === 'GET') return getTransport(env, transportSite(url.searchParams.get('site'), me), transportDay(url.searchParams.get('day')));
    if (p === '/api/tosha' && m === 'GET') return getTosha(env, transportSite(url.searchParams.get('site'), me), transportDay(url.searchParams.get('day')));
    if (p === '/api/tosha' && m === 'PUT') return putTosha(req, env, me);
    if (p === '/api/flights/status' && m === 'GET') return getFlightStatus(env);
    if (p === '/api/flights/refresh' && m === 'POST') { requireAdmin(me); if (FLIGHT_API_ON) await refreshFlightStatus(env, true); return getFlightStatus(env); }
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

    if (p === '/api/desks' && m === 'GET') { requireDeskManager(me); return listDesks(env, me); }
    if (p === '/api/desks' && m === 'POST') { requireDeskManager(me); return createDesk(req, env, me); }
    mm = p.match(/^\/api\/desks\/(\d+)$/);
    if (mm && m === 'PATCH') { requireDeskManager(me); return updateDesk(req, env, me, Number(mm[1])); }
    if (mm && m === 'DELETE') { requireDeskManager(me); return deleteDesk(env, me, Number(mm[1])); }
    if (p === '/api/audit' && m === 'GET') { requireAdmin(me); return listAudit(url, env); }
    if (p.startsWith('/api/backups')) { requireAdmin(me); const r = await backupRoute(p, m, url, req, env, me); if (r) return r; }

    // Performance page: page timings and in-page feedback from every login; the summary and the feedback for admins
    if (p === '/api/telemetry' && m === 'POST') return postTelemetry(req, env, me);
    if (p === '/api/feedback' && m === 'POST') return postFeedback(req, env, me);
    // read by the owner admin (every site) and by a site admin (its own site only: perfSite())
    if (p === '/api/perf/summary' && m === 'GET') { requirePerf(me); return perfSummary(url, env, me); }
    if (p === '/api/feedback' && m === 'GET') { requirePerf(me); return listFeedback(url, env, me); }
    mm = p.match(/^\/api\/feedback\/(\d+)$/);
    if (mm && m === 'PATCH') { requirePerf(me); return patchFeedback(req, env, Number(mm[1]), me); }
    // Passport release slips issued (Accounts → Passport slip): who printed one for which group and when
    if (p === '/api/passport-log' && m === 'POST') return postPassportLog(req, env, me);
    if (p === '/api/passport-log' && m === 'GET') return listPassportLog(url, env, me);
    // "Facing an issue?" reports (pms/app/core/issue-report.js): a screenshot of the desk's screen and what the browser knew, for the Performance page
    if (p === '/api/issues' && m === 'POST') return postIssue(req, env, me);
    if (p === '/api/issues' && m === 'GET') { requirePerf(me); return listIssues(url, env, me); }
    mm = p.match(/^\/api\/issues\/(\d+)$/);
    if (mm && m === 'GET') { requirePerf(me); return getIssue(env, Number(mm[1]), me); }
    if (mm && m === 'PATCH') { requirePerf(me); return patchIssue(req, env, Number(mm[1]), me); }
    // Slip saves the PMS refused (rooms over their beds, no bed count, dates …) with every condition checked — for debugging
    if (p === '/api/slip-denials' && m === 'POST') return postSlipDenials(req, env, me);
    if (p === '/api/slip-denials' && m === 'GET') { requirePerf(me); return listSlipDenials(url, env, me); }

    throw new HttpError(404, 'Not found');
}

/* ---------------------------------- auth ---------------------------------- */

// pages: the page ids this login may open (null = all); set by the admin on Setup
const parsePages = (v) => { try { const a = v ? JSON.parse(v) : null; return Array.isArray(a) ? a : null; } catch { return null; } };
const PAGES_OF = '(SELECT pages FROM desk_pages p WHERE p.desk_id = d.id) AS pages';
const publicDesk = (d) => ({ id: d.id, name: d.name, site: d.site, role: roleOf(d), pages: roleOf(d) === 'admin' ? null : parsePages(d.pages) });

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

async function tokenHashOf(req) {
    const m = (req.headers.get('Authorization') || '').match(/^Bearer\s+([a-f0-9]{64})$/i);
    if (!m) throw new HttpError(401, 'Please log in.');
    return sha256(m[1].toLowerCase());
}
const sessionStmt = (env, tokenHash) => env.DB.prepare(
    `SELECT s.expires_at, d.id, d.name, d.site, d.role, d.site_only, d.disabled, ${PAGES_OF} FROM sessions s JOIN desks d ON d.id = s.desk_id WHERE s.token_hash = ?`
).bind(tokenHash);
// a valid, unexpired session of an enabled desk; extends the login when less than half its lifetime is left
async function checkSession(env, row, tokenHash) {
    if (!row || row.expires_at < now() || row.disabled) throw new HttpError(401, 'Your login has expired. Please log in again.');
    if (row.expires_at < plusDays(SESSION_DAYS / 2) && env.MAINTENANCE !== '1') {
        await env.DB.prepare('UPDATE sessions SET expires_at = ? WHERE token_hash = ?').bind(plusDays(SESSION_DAYS), tokenHash).run();
    }
    return { ...row, role: roleOf(row), tokenHash };
}
/**
 * The login check and a request's own reads in one database trip. The reads run alongside the session lookup, but
 * nothing from them is answered unless the session is valid. Statements may use the token hash (bound by the caller).
 */
async function authedBatch(req, env, stmts) {
    const tokenHash = await tokenHashOf(req);
    const [auth, ...rest] = await env.DB.batch([sessionStmt(env, tokenHash), ...stmts.map(f => typeof f === 'function' ? f(tokenHash) : f)]);
    const me = await checkSession(env, auth.results[0], tokenHash);
    return { me, rest, reply: (fn) => json(fn(rest, me)) };
}

async function authenticate(req, env) {
    const tokenHash = await tokenHashOf(req);
    return checkSession(env, await sessionStmt(env, tokenHash).first(), tokenHash);
}

function requireDeskManager(me) {
    if (me.role !== 'admin' && me.role !== 'siteadmin') throw new HttpError(403, 'Only an admin can do this.');
}
// a site admin may touch only the desk / viewer logins of its own site; the owner admin may touch any
function assertManages(me, desk) {
    if (me.role === 'admin') return;
    if (desk.site !== me.site) throw new HttpError(403, `You can only manage ${SITES[me.site]} logins.`);
    if (!GIVABLE.includes(roleOf(desk))) throw new HttpError(403, 'Only the owner admin can change an admin login.');
}
// The Performance page: the owner admin sees every site, a site admin only its own (perfSite forces it)
function requirePerf(me) { if (me.role !== 'admin' && me.role !== 'siteadmin') throw new HttpError(403, 'Only an admin can do this.'); }
const perfSite = (me, asked) => (me.role === 'siteadmin' ? me.site : asked);
function requireAdmin(me) {
    if (me.role !== 'admin') throw new HttpError(403, 'Only an admin can do this.');
}

function assertWrite(me, site) {
    if (!SITES[site]) throw new HttpError(400, `Unknown site "${site}".`);
    if (me.role === 'admin') return;
    if (me.role !== 'desk' && me.role !== 'siteadmin') throw new HttpError(403, `${me.name} is a read-only login.`);
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
function insertStmt(env, me, site, s, origin, at = now()) {
    return env.DB.prepare(
        `INSERT OR IGNORE INTO slips (site, sh_no, building, checkin_date, checkout_date, ums_key, origin, data, version, seq, updated_at, updated_by)
         SELECT ?, ?, ?, ?, ?, ?, ?, ?, 1, ${NEXT_SEQ}, ?, ?
         WHERE ? IS NULL OR NOT EXISTS (SELECT 1 FROM slips WHERE ums_key = ? AND deleted = 0)`
    ).bind(site, s.sh_no, s.building, s.checkin_date, s.checkout_date, s.ums_key, origin || null, s.text, at, me.id, s.ums_key, s.ums_key);
}

function updateStmt(env, me, id, version, s, at = now()) {
    return env.DB.prepare(
        `UPDATE slips SET sh_no = ?, building = ?, checkin_date = ?, checkout_date = ?, ums_key = ?, data = ?,
                version = version + 1, seq = ${NEXT_SEQ}, updated_at = ?, updated_by = ?
         WHERE id = ? AND version = ? AND deleted = 0`
    ).bind(s.sh_no, s.building, s.checkin_date, s.checkout_date, s.ums_key, s.text, at, me.id, id, version);
}

// Version history (slip_versions): ONE statement snapshots every slip this request wrote at `at` (updated_at = at, by me).
// Reads the row as written, so a refused (conflicting) save leaves nothing behind; a write that changes nothing but the
// updatedAt stamp (the hourly UMS import re-saving identical data) adds no snapshot; `always` is for deletes. A trigger
// (schema.sql) moves slips.active_version to the new snapshot. parent = the snapshot that was active — so an edit made
// after an older version was activated branches from it. The seq bound: this request's rows hold the newest sync numbers, so the
// statement reads an index range, not the whole table (everyRow: a site-wide clear). firstAct / otherAct: the action of a slip's first snapshot / later ones.
function verStmt(env, me, at, firstAct, otherAct, note, always = false, everyRow = false) {
    return env.DB.prepare(
        `INSERT INTO slip_versions (slip_id, site, n, parent, action, data, sh_no, note, at, by)
         SELECT s.id, s.site, COALESCE((SELECT MAX(n) FROM slip_versions x WHERE x.slip_id = s.id), 0) + 1, s.active_version,
                CASE WHEN NOT EXISTS (SELECT 1 FROM slip_versions y WHERE y.slip_id = s.id) THEN ? ELSE ? END, s.data, s.sh_no, ?, s.updated_at, s.updated_by
         FROM slips s WHERE s.updated_at = ? AND s.updated_by = ?
           ${everyRow ? '' : 'AND s.seq > (SELECT COALESCE(MAX(seq), 0) FROM slips) - 200'}
           ${always ? '' : "AND NOT EXISTS (SELECT 1 FROM slip_versions v WHERE v.id = s.active_version AND json_remove(v.data, '$.updatedAt') = json_remove(s.data, '$.updatedAt'))"}`
    ).bind(firstAct, otherAct, note == null ? null : String(note).slice(0, 120), at, me.id);
}
const importAct = (reason) => /import/i.test(reason) ? 'import' : 'edit';

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

const pullArgs = (url) => ({
    seq: Number(url.searchParams.get('seq')) || 0,
    id: Number(url.searchParams.get('id')) || 0,
    limit: Math.min(PULL_LIMIT, Number(url.searchParams.get('limit')) || PULL_LIMIT),
});
// a desk or viewer login is sent only the slips of its own site (an admin gets both): less to download, keep in memory and compare
const OWN_SITE = "(SELECT (d.role = 'admin' AND d.site_only = 0) OR d.site = slips.site FROM sessions s JOIN desks d ON d.id = s.desk_id WHERE s.token_hash = ?)";
const pullStmt = (url, env) => (tokenHash) => pullStmtFor(url, env, tokenHash);
function pullStmtFor(url, env, tokenHash) {
    const { seq, id, limit } = pullArgs(url);
    // first download: skip deleted slips, the browser has nothing to remove yet
    const onlyLive = seq === 0 && id === 0 ? 'AND deleted = 0' : '';
    // "after (seq, id)". The leading seq >= ? lets SQLite start in the slips_seq index; written as
    // (seq > ? OR (seq = ? AND id > ?)) it scanned the whole table on every check.
    return env.DB.prepare(
        `SELECT id, site, data, version, seq, deleted FROM slips
         WHERE seq >= ? AND (seq > ? OR id > ?) AND ${OWN_SITE} ${onlyLive}
         ORDER BY seq, id LIMIT ?`
    ).bind(seq, seq, id, tokenHash, limit);
}
function pullReply(url, r) {
    const { seq, id, limit } = pullArgs(url);
    const results = r.results;
    const last = results[results.length - 1];
    return {
        slips: results.map(rowToSlip),
        cursor: last ? { seq: last.seq, id: last.id } : { seq, id },
        more: results.length === limit,
    };
}

// this login's settings row, found through its session (so it can share the login check's trip)
const prefsStmt = (req, env) => (tokenHash) => env.DB.prepare(
    'SELECT prefs, updated_at FROM desk_prefs WHERE desk_id = (SELECT desk_id FROM sessions WHERE token_hash = ?)').bind(tokenHash);

/**
 * GET /api/sync — what every open page asks every 30 s, in one call and one database trip:
 * the slips changed since the cursor, this login as the server has it (name, site, role, pages — the admin may have
 * changed them) and when its settings were last saved (the page fetches them only when that changes).
 */
async function syncHeartbeat(req, url, env) {
    const stamp = (tokenHash) => env.DB.prepare(
        'SELECT updated_at FROM desk_prefs WHERE desk_id = (SELECT desk_id FROM sessions WHERE token_hash = ?)').bind(tokenHash);
    const b = await authedBatch(req, env, [pullStmt(url, env), stamp]);
    return b.reply(([slips, prefs], me) => ({ ...pullReply(url, slips), desk: publicDesk(me), prefs_at: prefs.results[0]?.updated_at || null }));
}

async function createSlip(req, env, me) {
    const { slip } = await body(req);
    const site = String(slip && slip.site || me.site);
    assertWrite(me, site);
    const s = prepareSlip(slip);
    const at = now();
    const [res] = await env.DB.batch([insertStmt(env, me, site, s, null, at), verStmt(env, me, at, 'create', 'edit', null)]);
    if (!res.meta.changes) throw new HttpError(409, 'This UMS stay already exists.');
    const id = res.meta.last_row_id;
    await auditStmt(env, me, 'create', id, `SH ${s.sh_no}`).run();
    return json({ slip: rowToSlip(await getRow(env, id)) }, 201);
}

// version labels for a check-in flag toggled on the Check-ins / Slip page
const SLIP_NOTES = new Set(['checkin', 'checkin-undo']);

async function updateSlip(req, env, me, id) {
    const { slip, version, note } = await body(req);
    const row = await getRow(env, id);
    if (!row || row.deleted) throw new HttpError(404, 'This slip no longer exists (it may have been deleted on another desk).');
    assertWrite(me, row.site);
    if (slip && slip.site && slip.site !== row.site && me.role !== 'admin') throw new HttpError(403, 'Only an admin can move a slip to the other site.');
    const s = prepareSlip(slip);
    const at = now();
    const [res] = await env.DB.batch([updateStmt(env, me, id, Number(version), s, at), verStmt(env, me, at, 'edit', 'edit', SLIP_NOTES.has(note) ? note : null)]);
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
    const at = now();
    const [res] = await env.DB.batch([env.DB.prepare(
        `UPDATE slips SET deleted = 1, version = version + 1, seq = ${NEXT_SEQ}, updated_at = ?, updated_by = ?
         WHERE id = ? AND deleted = 0 AND (? IS NULL OR version = ?)`
    ).bind(at, me.id, id, v, v == null ? null : Number(v)), verStmt(env, me, at, 'delete', 'delete', 'deleted', true)]);
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

    const at = now();
    const stmts = [
        ...add.map(slip => insertStmt(env, me, site, prepareSlip(slip), null, at)),
        ...put.map(p => updateStmt(env, me, Number(p.id), Number(p.version), prepareSlip(p.slip), at)),
    ];
    // every slip written here is snapshotted by one more statement (the batch stays within D1's per-request limit)
    const results = stmts.length ? await env.DB.batch([...stmts, verStmt(env, me, at, importAct(reason), importAct(reason), String(reason))]) : [];
    const created = results.slice(0, add.length).filter(r => r.meta.changes).length;
    const updated = results.slice(add.length, add.length + put.length).filter(r => r.meta.changes).length;
    await auditStmt(env, me, reason, null, `${site}: ${created} created, ${updated} updated, ${add.length - created} skipped (already there)`).run();
    return json({ created, updated, skipped: add.length - created, conflicts: put.length - updated });
}

// One-time upload of a browser's old IndexedDB slips. Idempotent through `origin`.
async function migrate(req, env, me) {
    const { slips = [] } = await body(req);
    if (slips.length > MAX_BULK) throw new HttpError(413, `At most ${MAX_BULK} slips per request.`);
    const stmts = [];
    const at = now();
    for (const { site, origin, slip } of slips) {
        assertWrite(me, site);
        if (!origin) throw new HttpError(400, 'Each uploaded slip needs an origin.');
        stmts.push(insertStmt(env, me, site, prepareSlip(slip), String(origin).slice(0, 100), at));
    }
    const results = stmts.length ? await env.DB.batch([...stmts, verStmt(env, me, at, 'import', 'import', 'migrate')]) : [];
    const created = results.slice(0, stmts.length).filter(r => r.meta.changes).length;
    await auditStmt(env, me, 'migrate', null, `${created} uploaded, ${slips.length - created} already there`).run();
    return json({ created, skipped: slips.length - created });
}

async function clearSite(req, env, me) {
    const { site } = await body(req);
    assertWrite(me, site);
    const at = now();
    const [res] = await env.DB.batch([env.DB.prepare(
        `UPDATE slips SET deleted = 1, version = version + 1, seq = ${NEXT_SEQ}, updated_at = ?, updated_by = ? WHERE site = ? AND deleted = 0`
    ).bind(at, me.id, site), verStmt(env, me, at, 'delete', 'delete', 'site cleared', true, true)]);
    await auditStmt(env, me, 'clear', null, `${site}: ${res.meta.changes} deleted`).run();
    return json({ deleted: res.meta.changes });
}

/* ----------------------------- version history ----------------------------- */

// GET /api/slips/:id/versions — every snapshot of one slip, newest first (the Slip page's History), and which is active
async function listSlipVersions(env, id) {
    const row = await getRow(env, id);
    if (!row) throw new HttpError(404, 'No such slip.');
    const { results } = await env.DB.prepare(
        `SELECT v.id, v.n, v.parent, v.action, v.note, v.at, v.data, COALESCE(d.name, x.name || ' (deleted)') AS by_name
         FROM slip_versions v LEFT JOIN desks d ON d.id = v.by LEFT JOIN deleted_desks x ON x.id = v.by
         WHERE v.slip_id = ? ORDER BY v.id DESC LIMIT 300`).bind(id).all();
    const active = row.active_version ?? (results[0] ? results[0].id : null);
    return json({ slip_id: id, active, version: row.version, versions: results.map(v => ({ ...v, data: JSON.parse(v.data) })) });
}

// POST /api/slips/:id/activate { snapshot, version } — make an older (or any) snapshot the version in use. Its content is
// written live, so every page and calculation uses it at once; the snapshots stay as they are and the next edit
// branches from this one. The live copy keeps the UMS import's record of what it last applied (ums.applied): the next
// import then treats the restored values as a desk edit instead of silently putting UMS's values back.
async function activateSlipVersion(req, env, me, id) {
    const { snapshot, version } = await body(req);
    const row = await getRow(env, id);
    if (!row || row.deleted) throw new HttpError(404, 'This slip no longer exists (it may have been deleted on another desk).');
    assertWrite(me, row.site);
    const snap = await env.DB.prepare('SELECT id, n, data FROM slip_versions WHERE id = ? AND slip_id = ?').bind(Number(snapshot), id).first();
    if (!snap) throw new HttpError(404, 'That version does not belong to this slip.');
    if (snap.id === row.active_version) return json({ slip: rowToSlip(row), unchanged: true });
    const live = JSON.parse(row.data), old = JSON.parse(snap.data);
    if (old.ums && live.ums && live.ums.applied) old.ums = { ...old.ums, applied: live.ums.applied };
    old.updatedAt = now();
    const s = prepareSlip(old);
    const res = await env.DB.prepare(
        `UPDATE slips SET sh_no = ?, building = ?, checkin_date = ?, checkout_date = ?, ums_key = ?, data = ?, active_version = ?,
                version = version + 1, seq = ${NEXT_SEQ}, updated_at = ?, updated_by = ?
         WHERE id = ? AND version = ? AND deleted = 0`
    ).bind(s.sh_no, s.building, s.checkin_date, s.checkout_date, s.ums_key, s.text, snap.id, now(), me.id, id, Number(version)).run();
    if (!res.meta.changes) throw new HttpError(409, 'Someone else changed this slip after you opened it. Reload it and try again.', { current: rowToSlip(await getRow(env, id)) });
    await auditStmt(env, me, 'slip-activate', id, `SH ${s.sh_no}: version v${snap.n} made active`).run();
    return json({ slip: rowToSlip(await getRow(env, id)) });
}

/* --------------------------------- settings --------------------------------- */

// Known settings and their validation. Anything else is refused.
const HHMM = (v) => typeof v === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(v);
const HOURS = (v) => typeof v === 'number' && Number.isFinite(v) && v >= 0 && v <= 24;
const SETTINGS = {
    arrival_commute_hours: { check: HOURS, msg: 'Arrival travel time must be 0–24 hours.' },
    arrival_other_hours: { check: HOURS, msg: 'Travel time from another city must be 0–24 hours.' },
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
    // Delayed departures: a room row marked "unknown" is held until today + this many days (the desk can change it)
    delay_hold_days: { check: (v) => Number.isInteger(v) && v >= 1 && v <= 120, msg: 'Hold for unknown departures: 1–120 days.' },
    // SH number prefixes the Slip page accepts before the digits, e.g. ["S", "E", "ES"] (S44030, E44030, ES44030)
    sh_prefixes: {
        check: (v) => Array.isArray(v) && v.length <= 20 && v.every(p => typeof p === 'string' && /^[A-Z]{1,4}$/.test(p)) && new Set(v).size === v.length,
        msg: 'SH prefixes: up to 20, each 1–4 capital letters, no repeats.',
    },
    // GL copy ink per building (Print slips page and Check-ins → GL copy): { "MOHAMMEDI": "#e8590c", … }
    gl_colors: {
        check: (v) => v && typeof v === 'object' && !Array.isArray(v) && Object.keys(v).length <= 100
            && Object.entries(v).every(([k, c]) => k.trim().length >= 1 && k.length <= 60 && !/[<>]/.test(k) && typeof c === 'string' && /^#[0-9a-fA-F]{6}$/.test(c)),
        msg: 'GL copy colours: up to 100 buildings, each a colour like #e8590c.',
    },
};

// Settings are global, and a site can have its own value for the SITE_SETTINGS keys, stored under "<site>/<key>". A login of a site gets its site's values
// (its own where set, else the global ones); an owner admin gets the global ones, or those of the site it asks for (?site=).
const SITE_SETTINGS = ['arrival_commute_hours', 'arrival_other_hours', 'departure_lead_hours', 'transfer_checkin_time', 'transfer_checkout_time', 'laundry_info', 'kg_sessions', 'fe_windows', 'delay_hold_days', 'sh_prefixes', 'gl_colors'];
async function getSettings(env, me, siteArg) {
    const site = me.role === 'admin' ? (SITES[siteArg] ? siteArg : null) : me.site;
    const { results } = await env.DB.prepare(
        'SELECT s.key, s.value, s.updated_at, d.name AS updated_by FROM settings s LEFT JOIN desks d ON d.id = s.updated_by'
    ).all();
    const settings = {}, own = {}, overrides = [];
    let last = null;
    for (const r of results) {
        const i = r.key.indexOf('/');
        if (i > 0) {
            if (r.key.slice(0, i) !== site) continue;           // another site's value
            own[r.key.slice(i + 1)] = JSON.parse(r.value); overrides.push(r.key.slice(i + 1));
        } else settings[r.key] = JSON.parse(r.value);
        if (!last || r.updated_at > last.updated_at) last = r;
    }
    return json({ settings: { ...settings, ...own }, site, overrides, updated_at: last ? last.updated_at : null, updated_by: last ? last.updated_by : null });
}

async function putSettings(req, env, me, url) {
    const { settings, site: bodySite, reset } = await body(req);
    // who a change applies to: a site admin → its own site only; the owner admin → the site it names, else every site
    const wanted = bodySite || (url && url.searchParams.get('site')) || null;
    if (me.role === 'siteadmin' && wanted && wanted !== me.site) throw new HttpError(403, `You can only change ${SITES[me.site]}'s settings.`);
    const scope = me.role === 'siteadmin' ? me.site : (SITES[wanted] ? wanted : null);
    const keyOf = (k) => (scope ? `${scope}/${k}` : k);
    if (Array.isArray(reset) && scope) {   // back to the all-sites value
        const gone = reset.filter(k => SITE_SETTINGS.includes(k));
        if (gone.length) await env.DB.batch([...gone.map(k => env.DB.prepare('DELETE FROM settings WHERE key = ?').bind(keyOf(k))), auditStmt(env, me, 'settings', null, `${scope}: back to the all-sites value of ${gone.join(', ')}`)]);
    }
    if (!settings || typeof settings !== 'object') return getSettings(env, me, scope);
    if (!settings || typeof settings !== 'object') throw new HttpError(400, 'settings must be an object.');
    const stmts = [];
    const notes = [];
    for (const [k, v] of Object.entries(settings)) {
        const def = SETTINGS[k];
        if (!def) throw new HttpError(400, `Unknown setting "${k}".`);
        if (scope && !SITE_SETTINGS.includes(k)) throw new HttpError(403, 'That setting applies to every site; only the owner admin can change it.');
        if (!scope && me.role !== 'admin') throw new HttpError(403, 'Only the owner admin can change a setting for every site.');
        const value = typeof v === 'number' ? Math.round(v * 4) / 4 : v; // quarter hours
        if (!def.check(value)) throw new HttpError(400, def.msg);
        stmts.push(env.DB.prepare('INSERT INTO settings (key, value, updated_at, updated_by) VALUES (?, ?, ?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at, updated_by = excluded.updated_by')
            .bind(keyOf(k), JSON.stringify(value), now(), me.id));
        notes.push(`${scope ? scope + ' ' : ''}${k}=${typeof value === 'object' ? JSON.stringify(value) : value}`);
    }
    if (!stmts.length) throw new HttpError(400, 'Nothing to change.');
    await env.DB.batch([...stmts, auditStmt(env, me, 'settings', null, notes.join(', '))]);
    return getSettings(env, me, scope);
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

async function listDesks(env, me) {
    const mine = me && me.role === 'siteadmin';
    const { results } = await env.DB.prepare(
        `SELECT d.id, d.name, d.site, d.role, d.site_only, d.disabled, d.created_at,
                (SELECT MAX(created_at) FROM sessions s WHERE s.desk_id = d.id) AS last_login, ${PAGES_OF}
         FROM desks d ${mine ? "WHERE d.site = ? AND d.role <> 'admin'" : ''} ORDER BY d.site, d.name`
    ).bind(...(mine ? [me.site] : [])).all();
    return json({ desks: results.map(({ site_only, ...d }) => ({ ...d, role: roleOf({ ...d, site_only }), pages: parsePages(d.pages) })) });
}

function checkPassword(pw) {
    if (typeof pw !== 'string' || pw.length < 8) throw new HttpError(400, 'Password must be at least 8 characters.');
}

async function createDesk(req, env, me) {
    const { name, site: wantedSite, role: wantedRole = 'desk', password } = await body(req);
    const n = String(name || '').trim();
    // a site admin: only desk / viewer logins, only at its own site; the owner may also make a site admin ('siteadmin')
    if (me.role === 'siteadmin') {
        if (wantedSite !== me.site) throw new HttpError(403, `You can only add logins for ${SITES[me.site]}.`);
        if (!GIVABLE.includes(wantedRole)) throw new HttpError(403, 'Only the owner admin can create an admin login.');
    }
    const site = wantedSite;
    const siteOnly = wantedRole === 'siteadmin' ? 1 : 0;
    const role = wantedRole === 'siteadmin' ? 'admin' : wantedRole;
    if (!/^[\w .-]{3,40}$/.test(n)) throw new HttpError(400, 'Desk name: 3–40 letters, digits, spaces, dot, dash or underscore.');
    if (!SITES[site]) throw new HttpError(400, 'Choose a site.');
    if (!ROLES.includes(role)) throw new HttpError(400, 'Unknown role.');
    checkPassword(password);
    const salt = randomHex(16);
    try {
        // never reuse a deleted login's id (the change log still points at it)
        await env.DB.prepare(`INSERT INTO desks (id, name, site, role, site_only, pw_hash, pw_salt, pw_iter, created_at)
            VALUES (MAX(COALESCE((SELECT MAX(id) FROM desks), 0), COALESCE((SELECT MAX(id) FROM deleted_desks), 0)) + 1, ?, ?, ?, ?, ?, ?, ?, ?)`)
            .bind(n, site, role, siteOnly, await pbkdf2(password, salt, PBKDF2_ITER), salt, PBKDF2_ITER, now()).run();
    } catch (e) {
        if (/UNIQUE/i.test(String(e && e.message))) throw new HttpError(409, `A desk named "${n}" already exists.`);
        throw e;
    }
    await auditStmt(env, me, 'desk-create', null, `${n} (${site}, ${siteOnly ? 'site admin' : role})`).run();
    return listDesks(env, me);
}

async function updateDesk(req, env, me, id) {
    const b = await body(req);
    const desk = await env.DB.prepare('SELECT * FROM desks WHERE id = ?').bind(id).first();
    if (!desk) throw new HttpError(404, 'No such desk.');
    assertManages(me, desk);
    if (me.role === 'siteadmin') {
        if (b.site !== undefined && b.site !== me.site) throw new HttpError(403, `You can only manage ${SITES[me.site]} logins.`);
        if (b.role !== undefined && !GIVABLE.includes(b.role)) throw new HttpError(403, 'Only the owner admin can make an admin login.');
    }
    // the role a request asks for: 'siteadmin' is stored as admin + site_only
    const wantRole = b.role === 'siteadmin' ? 'admin' : b.role, wantSiteOnly = b.role === 'siteadmin' ? 1 : 0;
    if (id === me.id && (b.disabled || (b.role !== undefined && roleOf({ role: wantRole, site_only: wantSiteOnly }) !== me.role))) throw new HttpError(400, 'You cannot disable or demote your own admin login.');
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
    if (b.role !== undefined) { if (!ROLES.includes(wantRole) && b.role !== 'siteadmin') throw new HttpError(400, 'Unknown role.'); sets.push('role = ?', 'site_only = ?'); args.push(wantRole, wantSiteOnly); notes.push('role ' + b.role); }
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
    return listDesks(env, me);
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

/* ----------------------------- room key cards ----------------------------- */
// Rooms → Room Key Cards: the cards handed to a group's rooms come back at check-out. The page works out what was issued
// (a room's assigned beds) from the slips; here only how many came back is kept, per slip, room and departure day.
// Read: any login · write: desk of the site, admin. GET /api/key-cards?site=&day=  ·  PUT /api/key-cards { site, day, items }
async function getKeyCards(url, env, me) {
    const site = String(url.searchParams.get('site') || me.site);
    if (!SITES[site]) throw new HttpError(400, `Unknown site "${site}".`);
    const day = transportDay(url.searchParams.get('day'));
    const { results } = await env.DB.prepare(
        `SELECT k.slip_id, k.room_no, k.returned, k.updated_at, COALESCE(d.name, x.name || ' (deleted)') AS by_name
         FROM key_cards k LEFT JOIN desks d ON d.id = k.updated_by LEFT JOIN deleted_desks x ON x.id = k.updated_by
         WHERE k.site = ? AND k.day = ?`).bind(site, day).all();
    return json({ site, day, rows: results });
}
async function putKeyCards(req, env, me) {
    const { site, day, items } = await body(req);
    assertWrite(me, site);
    const d = transportDay(day);
    if (!Array.isArray(items) || !items.length) throw new HttpError(400, 'Nothing to save.');
    if (items.length > MAX_BULK) throw new HttpError(413, `At most ${MAX_BULK} rooms at once.`);
    const clean = items.map(i => ({ slip_id: Number(i && i.slip_id), room_no: text(i && i.room_no, 12), returned: Number(i && i.returned) }));
    if (clean.some(i => !Number.isInteger(i.slip_id) || i.slip_id <= 0 || !i.room_no || !Number.isInteger(i.returned) || i.returned < 0 || i.returned > 99)) {
        throw new HttpError(400, 'Each room needs a slip, a room number and a card count from 0 to 99.');
    }
    const ids = [...new Set(clean.map(i => i.slip_id))];
    const ok = new Set((await env.DB.prepare(`SELECT id FROM slips WHERE site = ? AND id IN (${ids.map(() => '?').join(',')})`).bind(site, ...ids).all()).results.map(r => r.id));
    if (clean.some(i => !ok.has(i.slip_id))) throw new HttpError(400, `One of those slips is not a ${SITES[site]} slip.`);
    const at = now();
    await env.DB.batch(clean.map(i => env.DB.prepare(
        `INSERT INTO key_cards (slip_id, room_no, day, site, returned, updated_at, updated_by) VALUES (?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(slip_id, room_no, day) DO UPDATE SET returned = excluded.returned, updated_at = excluded.updated_at, updated_by = excluded.updated_by`)
        .bind(i.slip_id, i.room_no, d, site, i.returned, at, me.id)));
    return getKeyCards(new URL(`https://x/api/key-cards?site=${site}&day=${d}`), env, me);
}

/* ---------------------------------- KG roster ---------------------------------- */

const KG_TYPES = ['FE1', 'FE2', 'Atraaf'];
const kgName = (v) => String(v == null ? '' : v).replace(/[<>]/g, '').replace(/\s+/g, ' ').trim().slice(0, 80);

async function getKg(env, site) {
    if (!SITES[site]) throw new HttpError(400, `Unknown site "${site}".`);
    const meta = await env.DB.prepare('SELECT people, archived, bookmark, version, updated_at FROM kg_meta WHERE site = ?').bind(site).first();
    const { results } = await env.DB.prepare('SELECT id, ts, person, type, location FROM kg_log WHERE site = ? ORDER BY ts, id').bind(site).all();
    return json({ site, people: meta ? JSON.parse(meta.people) : [], archived: meta ? JSON.parse(meta.archived || '[]') : [], bookmark: meta ? meta.bookmark : '', version: meta ? meta.version : 0, log: results });
}

// Name list / bookmark changes as small operations, applied on the latest list (retried if two desks collide)
async function kgOp(req, env, me) {
    const { site, op, name } = await body(req);
    assertWrite(me, site);
    const n = kgName(name);
    for (let attempt = 0; attempt < 4; attempt++) {
        const meta = await env.DB.prepare('SELECT people, archived, bookmark, version FROM kg_meta WHERE site = ?').bind(site).first();
        let people = meta ? JSON.parse(meta.people) : [], archived = meta ? JSON.parse(meta.archived || '[]') : [], bookmark = meta ? meta.bookmark : '';
        const extra = [];
        if (op === 'add-person') { if (!n) throw new HttpError(400, 'Enter a name.'); archived = archived.filter(p => p !== n); if (!people.includes(n)) people.push(n); }
        else if (op === 'remove-person') { people = people.filter(p => p !== n); archived = archived.filter(p => p !== n); if (bookmark === n) bookmark = ''; }
        // archive = keep the name and its saved history, take it out of the assignment list; unarchive puts it back
        else if (op === 'archive-person') { if (!people.includes(n) && !archived.includes(n)) throw new HttpError(400, 'That name is not in the list.'); people = people.filter(p => p !== n); if (!archived.includes(n)) archived.push(n); if (bookmark === n) bookmark = ''; }
        else if (op === 'unarchive-person') { archived = archived.filter(p => p !== n); if (n && !people.includes(n)) people.push(n); }
        else if (op === 'bookmark') { if (n && !people.includes(n)) throw new HttpError(400, 'That name is not in the list.'); bookmark = n; }
        else if (op === 'reset') { requireAdminOrDesk(me); people = []; archived = []; bookmark = ''; extra.push(env.DB.prepare('DELETE FROM kg_log WHERE site = ?').bind(site)); }
        else throw new HttpError(400, 'Unknown KG operation.');
        if (people.length > 500) throw new HttpError(413, 'At most 500 names.');
        if (archived.length > 2000) throw new HttpError(413, 'At most 2000 archived names.');
        const write = meta
            ? env.DB.prepare('UPDATE kg_meta SET people = ?, archived = ?, bookmark = ?, version = version + 1, updated_at = ?, updated_by = ? WHERE site = ? AND version = ?').bind(JSON.stringify(people), JSON.stringify(archived), bookmark, now(), me.id, site, meta.version)
            : env.DB.prepare('INSERT OR IGNORE INTO kg_meta (site, people, archived, bookmark, version, updated_at, updated_by) VALUES (?, ?, ?, ?, 1, ?, ?)').bind(site, JSON.stringify(people), JSON.stringify(archived), bookmark, now(), me.id);
        const [res] = await env.DB.batch([write, ...extra, ...(op === 'bookmark' ? [] : [auditStmt(env, me, 'kg-' + op, null, `${site}${n ? ': ' + n : ''}`)])]);
        if (res.meta.changes) return getKg(env, site);
    }
    throw new HttpError(409, 'Another desk is changing the KG list right now. Try again.');
}
function requireAdminOrDesk(me) { if (me.role !== 'admin' && me.role !== 'desk' && me.role !== 'siteadmin') throw new HttpError(403, 'Not allowed.'); }

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

/* ------------------------- bulk allocation log (Forecast) ------------------------- */

// Every "Write building" / "Apply allocations" on the Forecast page: which slips changed, with their building and
// rooms before and after, so a desk can see it and undo it. The undo itself is done by the page through the normal
// slip writes (version-checked); here it is only marked as undone.
const ALLOC_KINDS = ['planner', 'allocate-day', 'delay'];
async function getAllocLog(env, site) {
    if (!SITES[site]) throw new HttpError(400, `Unknown site "${site}".`);
    const { results } = await env.DB.prepare(
        `SELECT l.id, l.kind, l.note, l.count, l.changes, l.created_at, l.undone_at, l.undo_note,
                COALESCE(d.name, x.name || ' (deleted)') AS by_name, COALESCE(u.name, y.name || ' (deleted)') AS undone_by_name
         FROM alloc_log l LEFT JOIN desks d ON d.id = l.created_by LEFT JOIN deleted_desks x ON x.id = l.created_by
         LEFT JOIN desks u ON u.id = l.undone_by LEFT JOIN deleted_desks y ON y.id = l.undone_by
         WHERE l.site = ? ORDER BY l.id DESC LIMIT 40`
    ).bind(site).all();
    return json({ log: results.map(r => ({ ...r, changes: JSON.parse(r.changes) })) });
}
async function addAllocLog(req, env, me) {
    const { site, kind, note = '', changes } = await body(req);
    assertWrite(me, site);
    if (!ALLOC_KINDS.includes(kind)) throw new HttpError(400, 'Unknown kind.');
    if (!Array.isArray(changes) || !changes.length || changes.length > 1000) throw new HttpError(400, '1–1000 changes.');
    const clean = changes.map(c => ({ id: Number(c && c.id), sh: cleanSlip(String(c && c.sh || '')), before: cleanSlip(c && c.before || {}), after: cleanSlip(c && c.after || {}) }));
    if (clean.some(c => !Number.isInteger(c.id) || c.id <= 0)) throw new HttpError(400, 'Each change needs a slip id.');
    const text = JSON.stringify(clean);
    if (text.length > 900000) throw new HttpError(413, 'Too large.');
    await env.DB.batch([
        env.DB.prepare('INSERT INTO alloc_log (site, kind, note, count, changes, created_at, created_by) VALUES (?, ?, ?, ?, ?, ?, ?)')
            .bind(site, kind, String(note).replace(/[<>]/g, '').slice(0, 200), clean.length, text, now(), me.id),
        auditStmt(env, me, 'alloc-apply', null, `${site} ${kind}: ${clean.length} slip(s)`),
    ]);
    return getAllocLog(env, site);
}
async function undoAllocLog(req, env, me, id) {
    const row = await env.DB.prepare('SELECT site, kind, count, undone_at FROM alloc_log WHERE id = ?').bind(id).first();
    if (!row) throw new HttpError(404, 'That log entry is gone.');
    assertWrite(me, row.site);
    if (row.undone_at) throw new HttpError(409, 'This was undone already.');
    const { note = '' } = await body(req);
    await env.DB.batch([
        env.DB.prepare('UPDATE alloc_log SET undone_at = ?, undone_by = ?, undo_note = ? WHERE id = ? AND undone_at IS NULL')
            .bind(now(), me.id, String(note).replace(/[<>]/g, '').slice(0, 300), id),
        auditStmt(env, me, 'alloc-undo', null, `${row.site} ${row.kind} #${id}: ${String(note).slice(0, 120)}`),
    ]);
    return getAllocLog(env, row.site);
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
    const desk = await env.DB.prepare('SELECT id, name, site, role, site_only FROM desks WHERE id = ?').bind(id).first();
    if (!desk) throw new HttpError(404, 'No such desk.');
    assertManages(me, desk);
    if (id === me.id) throw new HttpError(400, 'You cannot delete the login you are using.');
    if (desk.role === 'admin' && !desk.site_only) {
        const admins = await env.DB.prepare("SELECT COUNT(*) AS c FROM desks WHERE role = 'admin' AND site_only = 0 AND disabled = 0").first('c');
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
    return listDesks(env, me);
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

// receipt numbers: <site>-<kind>-YYYYMMDD-NNN — a running serial per kind that never restarts by date (the date
// is the bill's own day): cash MM-LD-…, staff only MM-ST-…, building linen MM-BL-… (Medina MD-…).
// Renumbered on 2026-10-04 (series per kind) and 2026-10-05 (4–5 Oct continued from 3 Oct); old_receipt_no keeps
// the number a bill had before it was first renumbered.
const LAUNDRY_PREFIX = { makkah: 'MM', medina: 'MD' };
const LAUNDRY_KIND_CODE = { paid: 'LD', free: 'ST', building: 'BL' };
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
    if (me.role === 'siteadmin' && s !== me.site) throw new HttpError(403, `${me.name} works at ${SITES[me.site]}.`);
    return s;
}
function requireLaundryWrite(me, site) {
    if (me.role === 'viewer') throw new HttpError(403, `${me.name} is a read-only login.`);
    if (me.role !== 'admin' && me.site !== site) throw new HttpError(403, `${me.name} works at ${SITES[me.site]}.`);
}
const canSeeAll = (me) => me.role === 'admin' || me.role === 'siteadmin' || me.role === 'viewer';
// laundry editing (prices, staff, categories, correcting / cancelling bills): the owner admin, or a site admin for its own site
function requireLaundryAdmin(me) { if (me.role !== 'admin' && me.role !== 'siteadmin') throw new HttpError(403, 'Only an admin can do this.'); }
function assertOwnSite(me, site) { if (me.role === 'siteadmin' && site !== me.site) throw new HttpError(403, `${me.name} works at ${SITES[me.site]}.`); }

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
    requireLaundryAdmin(me);
    const b = await body(req);
    const x = prepareItem(b);
    if (id) {
        const old = await env.DB.prepare('SELECT * FROM laundry_items WHERE id = ?').bind(id).first();
        if (!old) throw new HttpError(404, 'No such item.');
        assertOwnSite(me, old.site);
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
    requireLaundryAdmin(me);
    const b = await body(req);
    const x = prepareStaff(b);
    if (id) {
        const old = await env.DB.prepare('SELECT * FROM laundry_staff WHERE id = ?').bind(id).first();
        if (!old) throw new HttpError(404, 'No such staff profile.');
        assertOwnSite(me, old.site);
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
    requireLaundryAdmin(me);
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
    requireLaundryAdmin(me);
    const s = await env.DB.prepare('SELECT * FROM laundry_staff WHERE id = ?').bind(id).first();
    if (!s) throw new HttpError(404, 'No such staff profile.');
    assertOwnSite(me, s.site);
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
        settled_at: r.settled_at || null, settled_by: r.settled_by_name || null, settlement_id: r.settlement_id || null,
        old_receipt_no: r.old_receipt_no || null,
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

async function nextReceipt(env, site, day, kind) {
    const key = `${site}|${kind}`;                       // one running serial per site and kind
    const r = await env.DB.prepare('INSERT INTO laundry_counters (key, n) VALUES (?, 1) ON CONFLICT(key) DO UPDATE SET n = n + 1 RETURNING n').bind(key).first();
    return `${LAUNDRY_PREFIX[site] || 'XX'}-${LAUNDRY_KIND_CODE[kind] || 'LD'}-${day.replace(/-/g, '')}-${String(r.n).padStart(3, '0')}`;
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
    const receipt = await nextReceipt(env, site, day, kind);
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
    requireLaundryAdmin(me);
    const b = await body(req);
    const r = await getBillRow(env, id);
    assertOwnSite(me, r.site);
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
    requireLaundryAdmin(me);
    const { reason } = await body(req);
    const why = text(reason, 200);
    if (!why) throw new HttpError(400, 'Give a reason for cancelling.');
    const r = await getBillRow(env, id);
    assertOwnSite(me, r.site);
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
    if (me.role !== 'admin' && me.role !== 'desk' && me.role !== 'siteadmin') throw new HttpError(403, `${me.name} is a read-only login.`);
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
        const full = (await env.DB.prepare(`SELECT id, site, receipt_no, paid, day, worker_name, customer FROM laundry_bills WHERE id IN (${m2})`).bind(...list).all()).results;
        const lines = full.map(r => { const c = JSON.parse(r.customer || '{}'); return { id: r.id, receipt_no: r.receipt_no, amount: r.paid, day: r.day, worker: r.worker_name, room: [c.building, c.room].filter(Boolean).join(' ') }; });
        const site = full[0].site, total = full.reduce((n, r) => n + r.paid, 0);
        await env.DB.batch([
            // the payment log: one row per "mark paid" / "mark unpaid", with the bills it covered
            env.DB.prepare(`INSERT INTO laundry_settlements (site, day, at, by_id, by_name, action, bills, count, total) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`)
                .bind(site, jeddahDay(Date.parse(t)), t, me.id, me.name, paid ? 'paid' : 'unpaid', JSON.stringify(lines), lines.length, total),
            env.DB.prepare(`UPDATE laundry_bills SET settled_at = ?, settled_by = ?, settlement_id = ${paid ? '(SELECT MAX(id) FROM laundry_settlements)' : 'NULL'}, version = version + 1, updated_at = ?, updated_by = ? WHERE id IN (${m2})`)
                .bind(paid ? t : null, paid ? me.id : null, t, me.id, ...list),
            auditStmt(env, me, 'laundry-settle', null, `${paid ? 'Marked paid' : 'Marked unpaid'}: ${todo.length} bill${todo.length === 1 ? '' : 's'}, ${todo.reduce((n, r) => n + r.paid, 0) / 100} SAR — ${todo.map(r => r.receipt_no).join(', ')}`.slice(0, 1000)),
        ]);
    }
    const { results: rows } = await env.DB.prepare(`${BILL_SELECT} WHERE b.id IN (${marks})`).bind(...ids).all();
    return json({ bills: rows.map(rowToBill), changed: todo.length });
}

// The day of the oldest cash bill not yet marked paid (null when all are paid): the default "From" of the laundry
// screen's Pending cash and of Laundry admin → Bills, so both show every unpaid bill
async function oldestUnpaid(url, env, me) {
    const site = laundrySite(me, url.searchParams.get('site'));
    if (me.role === 'desk' && site !== me.site) throw new HttpError(403, `${me.name} works at ${SITES[me.site]}.`);
    const r = await env.DB.prepare("SELECT MIN(day) AS day FROM laundry_bills WHERE site = ? AND kind = 'paid' AND voided = 0 AND settled_at IS NULL").bind(site).first();
    return json({ day: r ? r.day : null });
}

// The payment log (admin, viewer, desk): every "mark paid" / "mark unpaid" in a date range, newest first
async function listSettlements(url, env, me) {
    const site = laundrySite(me, url.searchParams.get('site'));
    if (me.role === 'desk' && site !== me.site) throw new HttpError(403, `${me.name} works at ${SITES[me.site]}.`);
    const from = url.searchParams.get('from') || jeddahDay(), to = url.searchParams.get('to') || from;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(from) || !/^\d{4}-\d{2}-\d{2}$/.test(to)) throw new HttpError(400, 'Dates must be YYYY-MM-DD.');
    const { results } = await env.DB.prepare('SELECT * FROM laundry_settlements WHERE site = ? AND day >= ? AND day <= ? ORDER BY at DESC, id DESC LIMIT 2000').bind(site, from, to).all();
    return json({ settlements: results.map(r => ({ ...r, bills: JSON.parse(r.bills || '[]') })) });
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
    if (p === '/api/laundry/settlements' && m === 'GET') return listSettlements(url, env, me);
    if (p === '/api/laundry/oldest-unpaid' && m === 'GET') return oldestUnpaid(url, env, me);
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
//   signage_config (one per site): { window, slides, fade } — window = which trips (Riyadh time); slides = per trip type
//     (a route such as "MAKKAH-MADINA") the template it is shown with ('classic', 'none' or a template id) and the
//     seconds a slide stays. Order of `slides` = order on the board.
//   signage_templates: the designs made in the builder (elements, columns, colours, images as data: URLs).
// Read: any login · write: desk of the site, admin. The board itself reads through /api/public/… without a login.

const SIGNAGE_WINDOW = { from: 'now', to_day: 1, to_time: '23:59' };   // default: upcoming today + all of tomorrow
const SIGNAGE_DEFAULT_SLIDES = ['MAKKAH-JEDDAH AIRPORT', 'MAKKAH-MADINA', 'MAKKAH-MAKKAH ATRAAF'].map(type => ({ type, template: 'classic', seconds: 15 }));
// each site's own destinations (pms/app/core/transport.js DESTS_BY_SITE): a route the Signage Builder has never been
// told about shows on the Classic board instead of being left off (only an explicit "none" hides a route)
const SIGNAGE_SITE_ROUTES = {
    makkah: ['MAKKAH-MAKKAH ATRAAF', 'MAKKAH-MADINA', 'MAKKAH-JEDDAH AIRPORT', 'MAKKAH-MADINA AIRPORT', 'MAKKAH-TAIF'],
    medina: ['MADINA-MAKKAH', 'MADINA-MADINA ZIYARAT', 'MADINA-MADINA AIRPORT', 'MADINA-JEDDAH AIRPORT'],
};
function boardSlides(cfg, site) {
    const known = new Set(cfg.slides.map(s => s.type));
    return [...cfg.slides, ...(SIGNAGE_SITE_ROUTES[site] || []).filter(t => !known.has(t)).map(type => ({ type, template: 'classic', seconds: 15 }))];
}
const SIGNAGE_FADE = 0.3;   // seconds each way between slides (0 = cut); Signage Builder → Slides
const MAX_TEMPLATE_BYTES = 1800 * 1024;
const DATA_IMAGE = /^data:image\/(png|jpeg|webp|gif);base64,[A-Za-z0-9+/=]+$/;

function checkWindow(v) {
    return !!v && typeof v === 'object' && !Array.isArray(v) && (v.from === 'now' || HHMM(v.from)) && [0, 1, 2].includes(v.to_day) && HHMM(v.to_time)
        && !(v.to_day === 0 && v.from !== 'now' && v.to_time <= v.from);
}

async function signageConfig(env, site) {
    const row = await env.DB.prepare('SELECT c.data, c.version, c.updated_at, d.name AS updated_by FROM signage_config c LEFT JOIN desks d ON d.id = c.updated_by WHERE c.site = ?').bind(site).first();
    if (row) return { fade: SIGNAGE_FADE, ...JSON.parse(row.data), version: row.version, updated_at: row.updated_at, updated_by: row.updated_by };
    // never saved: the window from the old Setup setting, the three Makkah destinations on the Classic board
    const set = await env.DB.prepare("SELECT value FROM settings WHERE key = 'signage_window'").first();
    return { window: { ...SIGNAGE_WINDOW, ...(set ? JSON.parse(set.value) : {}) }, slides: SIGNAGE_DEFAULT_SLIDES, fade: SIGNAGE_FADE, version: 0, updated_at: null, updated_by: null };
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
    const fadeIn = config.fade === undefined ? cur.fade : Number(config.fade);
    if (!Number.isFinite(fadeIn) || fadeIn < 0 || fadeIn > 3) throw new HttpError(400, 'Transition: 0 to 3 seconds.');
    const fade = Math.round(fadeIn * 10) / 10;
    const data = JSON.stringify({ window: { from: window.from, to_day: window.to_day, to_time: window.to_time }, slides: clean, fade });
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
    return `${cfg.version}|${cfg.updated_at || ''}|${t.n}|${t.at || ''}|r2`; // r2: own routes by default
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
    const shown = boardSlides(cfg, site).filter(s => s.template !== 'none');
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
            rows.push({ day: r.day, key: t.key, ref: t.manual && t.ref === t.key ? '' : t.ref, at: t.at, route: t.route || '', operator: t.operator || '', leader: t.leader || '',
                pax: t.pax, m: t.m || 0, f: t.f || 0, c: t.c || 0, bus: t.bus ?? null, vehicle: t.vehicle === 'car' || t.vehicle === 'other' ? t.vehicle : '',
                vehicle_label: t.vehicle === 'other' ? t.vehicle_label || '' : '', building: t.building || '', vch: t.vch || '', dora: t.dora || '', adj: t.adj || '',
                with: t.with || '', vch_import: t.vch_import || '',                 // groups added by hand / a Vch No changed by hand
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
    return publicJson({ site, slides: boardSlides(cfg, site), fade: cfg.fade ?? SIGNAGE_FADE, templates, stamp: await signageStamp(env, site, cfg) });
}

// Tosha (travel refreshments) choices per site and day — Mawaid → Tosha summary: Madina preparation time and meal,
// per-bus Tosha packet / burger for the airport. Small JSON; read: any login · write: desk of the site, admin.
async function getTosha(env, site, day) {
    const row = await env.DB.prepare('SELECT t.data, t.updated_at, d.name AS updated_by FROM tosha_days t LEFT JOIN desks d ON d.id = t.updated_by WHERE t.site = ? AND t.day = ?').bind(site, day).first();
    return json({ site, day, data: row ? JSON.parse(row.data) : {}, updated_at: row ? row.updated_at : null, updated_by: row ? row.updated_by : null });
}
async function putTosha(req, env, me) {
    const { site, day, data } = await body(req);
    assertWrite(me, site);
    const d = transportDay(day);
    if (!data || typeof data !== 'object' || Array.isArray(data)) throw new HttpError(400, 'data must be an object.');
    const text = JSON.stringify(cleanSlip(data, 1));
    if (text.length > 64 * 1024) throw new HttpError(413, 'Too large.');
    await env.DB.prepare('INSERT INTO tosha_days (site, day, data, updated_at, updated_by) VALUES (?, ?, ?, ?, ?) ON CONFLICT(site, day) DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at, updated_by = excluded.updated_by')
        .bind(site, d, text, now(), me.id).run();
    return getTosha(env, site, d);
}

/* ----------------------------- live flight status ----------------------------- */
// Our guests' flights into/out of Jeddah (JED) and Madina (MED), from Flightradar24's API (Flight summary — light):
// take-off, landing, diversion. Only flights still in progress are looked up (an arrival from 8 h before it is due
// until it lands, a departure from 1 h before until it takes off), by flight number, 15 to a request.
// Credits: 1 per live flight returned, 2 per ended flight, 1 per empty answer. A reserve (FR24_RESERVE, default
// 25 %) of the monthly credits (FR24_MONTHLY_CREDITS) is never touched; the rest is spread evenly over the days
// left in the month, so the look-up interval grows when credits run lower (never more often than every 5 minutes).
// FR24's rules: data may be kept at most 30 days — rows are deleted after FLIGHT_KEEP_DAYS.
// Secret: FR24_API_KEY (npx wrangler secret put FR24_API_KEY). Cron: every 30 minutes (wrangler.toml).

const FR24_AIRPORTS = { JED: 'OEJN', MED: 'OEMA' };
// Live flight status (Flightradar24 + VariFlight) — off since 21 Oct 2026: no cron calls, no refreshes. The code is
// kept; set to true (and FLIGHT_API in pms/app/views/checkins/view.js) to switch it back on.
const FLIGHT_API_ON = false;
const FLIGHT_KEEP_DAYS = 25;
const FLIGHT_MIN_GAP = 25;    // minutes between look-ups, at the most (the cron runs every 30 min)
const FLIGHT_MAX_GAP = 60;    // … and at the least, while credits last

const fr24Budget = (env) => {
    const monthly = Math.max(0, Number(env.FR24_MONTHLY_CREDITS) || 60000);
    const reserve = Math.min(0.9, Math.max(0, Number(env.FR24_RESERVE ?? 0.25)));
    return { monthly, reserve, usable: Math.floor(monthly * (1 - reserve)) };
};
const ymKey = (d = new Date()) => d.toISOString().slice(0, 7);
const daysLeftInMonth = (d = new Date()) => Math.max(1 / 24, (Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 1) - d.getTime()) / 864e5);

// "SAUDIA -SV701", "INDIGO AIRLINES -6E-61" → SV701 / 6E61 (last airline code + number, leading zeros dropped)
function flightNo(text) {
    const all = [...String(text || '').toUpperCase().matchAll(/\b([A-Z0-9]{2})\s*-?\s*(\d{1,4})\b/g)].filter(m => /[A-Z]/.test(m[1]));
    const m = all[all.length - 1];
    return m && Number(m[2]) ? m[1] + Number(m[2]) : '';
}
const byRoadLeg = (leg) => /^(CAR|BUS|TRAIN)\b/i.test(String(leg?.flight || '').trim());
const airportOf = (port) => /JEDDAH|\bJED\b/i.test(port || '') ? 'JED' : /MADINA|MEDINA|\bMED\b/i.test(port || '') ? 'MED' : null;
const riyadhMs = (date, time) => Date.parse(`${date}T${time || '00:00'}:00+03:00`);

// Every flight leg of our guests around now: [{ key, dir, airport, code, sched }]
async function guestFlights(env, nowMs) {
    const day = (ms) => new Date(ms + 3 * 3600e3).toISOString().slice(0, 10);
    const days = [...new Set([day(nowMs - 864e5), day(nowMs), day(nowMs + 864e5)])];
    const q = days.map(() => '?').join(',');
    const { results } = await env.DB.prepare(
        `SELECT data FROM slips WHERE deleted = 0 AND ums_key IS NOT NULL
         AND (json_extract(data, '$.ums.arrival.date') IN (${q}) OR json_extract(data, '$.ums.departure.date') IN (${q}))`
    ).bind(...days, ...days).all();
    const out = new Map();
    for (const r of results) {
        const u = (JSON.parse(r.data) || {}).ums || {};
        for (const [dir, leg] of [['arr', u.arrival], ['dep', u.departure]]) {
            if (!leg || !leg.date || byRoadLeg(leg)) continue;          // car, bus, train: no flight
            const airport = airportOf(leg.port), code = flightNo(leg.flight);
            if (!airport || !code) continue;
            const key = `${dir}|${leg.date}|${code}`;
            if (!out.has(key)) out.set(key, { key, dir, airport, code, sched: `${leg.date}T${leg.time || '00:00'}` });
        }
    }
    return [...out.values()];
}

// still worth a look-up? (finished flights are not looked up again)
// Pacing per flight (each look-up of a flight costs a credit): far from its time — more than 1 h before it is due,
// or not yet in the air 3 h+ before an arrival — at most every 30 minutes; near its time, at every run.
const FLIGHT_FAR_GAP = 25;    // < the 30-min cron, so a far-off flight is looked up every run
function inPlay(f, row, nowMs) {
    const t = riyadhMs(f.sched.slice(0, 10), f.sched.slice(11));
    const live = f.dir === 'arr'
        ? !(row && row.landed) && nowMs >= t - 8 * 3600e3 && nowMs <= t + 8 * 3600e3
        : !(row && row.takeoff) && nowMs >= t - 1 * 3600e3 && nowMs <= t + 8 * 3600e3;
    if (!live) return false;
    const near = nowMs >= t - 3600e3; // within the last hour before it is due, or late
    if (near || !row || !row.checked_at) return true;
    return nowMs - Date.parse(row.checked_at) >= FLIGHT_FAR_GAP * 60e3;
}

async function fr24Fetch(env, flights, fromIso, toIso) {
    return fr24Get(env, 'flight-summary/light', { flight_datetime_from: fromIso, flight_datetime_to: toIso, flights: flights.join(','), limit: '20' });
}

// FR24's live answers use orig_icao / dest_icao / dest_icao_actual (the docs say origin_icao / destination_icao …) and
// put a Z on the times (the docs show none): read both
const fOrig = (x) => x.orig_icao || x.origin_icao || null;
const fDest = (x) => x.dest_icao || x.destination_icao || null;
const fDestActual = (x) => x.dest_icao_actual || x.destination_icao_actual || null;
const fTime = (v) => v ? (/[zZ]$|[+-]\d\d:?\d\d$/.test(v) ? v : v + 'Z') : null;

// The record that is this flight: the right airport on the right side, first seen closest to the expected time
function pickRecord(f, list) {
    const icao = FR24_AIRPORTS[f.airport];
    const due = riyadhMs(f.sched.slice(0, 10), f.sched.slice(11));
    // the same number on another day is another flight: first seen 18 h (arrival) / 6 h (departure) before its time at
    // the most, 10 h after at the most (a look-up before today's flight exists must not take yesterday's)
    const same = list.filter(x => String(x.flight || '').toUpperCase().replace(/^([A-Z0-9]{2})0+/, '$1') === f.code && plausible(f, x));
    // ours: an arrival bound for our airport — or still in the air with no destination yet (FR24 fills it in on
    // landing) and not leaving from here; a departure leaving from our airport
    const ours = (x) => f.dir === 'arr'
        ? (fDest(x) === icao || fDestActual(x) === icao || (!fDest(x) && !fDestActual(x) && fOrig(x) !== icao))
        : fOrig(x) === icao;
    const at = (x) => Date.parse(fTime((f.dir === 'arr' ? (x.datetime_landed || x.last_seen) : (x.datetime_takeoff || x.first_seen)) || x.first_seen));
    const nearest = (arr) => arr.sort((a, b) => Math.abs(at(a) - due) - Math.abs(at(b) - due))[0] || null;
    const mine = nearest(same.filter(ours));
    if (mine) return mine;
    // the same flight number at another airport around that time (e.g. UMS says Jeddah, the group flies from Taif):
    // shown as such, so the desk sees it
    const other = nearest(same.filter(x => f.dir === 'arr' ? (fDestActual(x) || fDest(x)) : fOrig(x)));
    return other && Math.abs(at(other) - due) < 12 * 3600e3 ? { ...other, _elsewhere: true } : null;
}

function plausible(f, x) {
    const due = riyadhMs(f.sched.slice(0, 10), f.sched.slice(11));
    const seen = Date.parse(fTime(x.first_seen || x.datetime_takeoff) || '');
    if (!Number.isFinite(seen)) return true;
    return seen >= due - (f.dir === 'arr' ? 18 : 6) * 3600e3 && seen <= due + 10 * 3600e3;
}

function statusOf(f, rec) {
    if (!rec) return 'scheduled';
    if (rec._elsewhere) return 'elsewhere';
    const icao = FR24_AIRPORTS[f.airport];
    if (f.dir === 'arr') {
        if (fDestActual(rec) && fDestActual(rec) !== icao && rec.datetime_landed) return 'diverted';
        if (rec.datetime_landed) return 'landed';
        if (rec.datetime_takeoff) return 'airborne';
        return 'scheduled';
    }
    if (rec.datetime_landed) return 'arrived';     // reached its destination
    if (rec.datetime_takeoff) return 'departed';
    return 'boarding';                             // seen at the gate / taxiing, not yet airborne
}

/* --------------------- airline schedule and status (VariFlight) --------------------- */
// VariFlight's AI Open Platform (ai.variflight.com — the data behind Trip.com): the airline's scheduled, estimated and
// actual times, cancellations, gates, check-in counters and baggage belts. Licensed for "display in your own products
// or business" — staff pages only; never on the public signage (their terms forbid public publishing).
// One look-up (searchFlightsByNumber) costs 50 credits (¥0.50). A flight is looked up once in the 6 h before its time,
// then hourly from 2 h before until it is done (arrivals: arrived / cancelled / diverted; departures: departed too).
// Credits: VF_MONTHLY_CREDITS (default 5000 = the ¥50 trial) less VF_RESERVE (default 20 %), spread evenly over the
// month through a small bank refilled at every run; when short, the flights nearest their time go first.
// Secret: VARIFLIGHT_API_KEY.
const VF_ENDPOINT = 'https://ai.variflight.com/servers/aviation/mcp';
const VF_CALL = 50;
const VF_STATES = { '计划': 'scheduled', '起飞': 'departed', '到达': 'arrived', '延误': 'delayed', '取消': 'cancelled', '提前取消': 'cancelled',
    '备降': 'diverted', '返航': 'returned', '备降起飞': 'departed', '备降到达': 'diverted', '返航起飞': 'departed', '返航到达': 'returned' };
const vfBudget = (env) => {
    const monthly = Math.max(0, Number(env.VF_MONTHLY_CREDITS) || 5000);
    const reserve = Math.min(0.9, Math.max(0, Number(env.VF_RESERVE ?? 0.2)));
    return { monthly, reserve, usable: Math.floor(monthly * (1 - reserve)) };
};

// VariFlight answers with a Python-style literal ("Flight details: {'code': 200, …}"): a small parser for it
function pyLiteral(s) {
    let i = 0;
    const ws = () => { while (i < s.length && /\s/.test(s[i])) i++; };
    const val = () => {
        ws();
        const c = s[i];
        if (c === '{') {
            i++; const o = {}; ws();
            if (s[i] === '}') { i++; return o; }
            for (;;) {
                const k = val(); ws(); if (s[i] !== ':') throw new Error('expected :'); i++;
                o[k] = val(); ws();
                if (s[i] === ',') { i++; ws(); if (s[i] === '}') { i++; return o; } continue; }
                if (s[i] === '}') { i++; return o; }
                throw new Error('bad dict');
            }
        }
        if (c === '[' || c === '(') {
            const close = c === '[' ? ']' : ')'; i++; const a = []; ws();
            if (s[i] === close) { i++; return a; }
            for (;;) {
                a.push(val()); ws();
                if (s[i] === ',') { i++; ws(); if (s[i] === close) { i++; return a; } continue; }
                if (s[i] === close) { i++; return a; }
                throw new Error('bad list');
            }
        }
        if (c === "'" || c === '"') {
            const q = c; i++; let out = '';
            while (i < s.length && s[i] !== q) {
                if (s[i] === '\\') {
                    const n = s[i + 1];
                    if (n === 'x') { out += String.fromCharCode(parseInt(s.substr(i + 2, 2), 16)); i += 4; continue; }
                    if (n === 'u') { out += String.fromCharCode(parseInt(s.substr(i + 2, 4), 16)); i += 6; continue; }
                    out += ({ n: '\n', t: '\t', r: '\r' })[n] ?? n; i += 2; continue;
                }
                out += s[i++];
            }
            i++; return out;
        }
        const m = s.slice(i).match(/^(True|False|None|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)/);
        if (m) { i += m[0].length; return m[0] === 'True' ? true : m[0] === 'False' ? false : m[0] === 'None' ? null : Number(m[0]); }
        throw new Error(`unexpected "${s.slice(i, i + 15)}"`);
    };
    return val();
}

async function vfSearch(env, args) {
    const r = await fetch(VF_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json, text/event-stream', 'X-API-Key': env.VARIFLIGHT_API_KEY },
        body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'tools/call', params: { name: 'searchFlightsByNumber', arguments: args } }),
    });
    let body = await r.text();
    if (!r.ok) { const e = new Error(`VariFlight ${r.status}: ${body.slice(0, 200)}`); e.status = r.status; throw e; }
    if (!body.trim().startsWith('{')) body = body.split('\n').filter(l => l.startsWith('data:')).map(l => l.slice(5)).join('');
    const j = JSON.parse(body);
    if (j.error) throw new Error(`VariFlight: ${j.error.message || JSON.stringify(j.error)}`);
    const text = (j.result?.content || []).map(c => c.text || '').join('');
    if (j.result?.isError) throw new Error(`VariFlight: ${text.slice(0, 200)}`);
    const at = text.indexOf('{');
    if (at < 0) return { list: [], note: text.slice(0, 200) };
    let obj; try { obj = JSON.parse(text.slice(at)); } catch { obj = pyLiteral(text.slice(at)); }
    if (String(obj.code) !== '200') return { list: [], note: String(obj.message || obj.code).slice(0, 200) };
    return { list: Array.isArray(obj.data) ? obj.data : [] };
}

// 'YYYY-MM-DD HH:MM:SS' at the airport (offset in seconds) → UTC ISO
const vfUtc = (local, tz) => {
    if (!local) return null;
    const ms = Date.parse(String(local).replace(' ', 'T') + 'Z');
    return Number.isFinite(ms) ? new Date(ms - (Number(tz) || 0) * 1000).toISOString() : null;
};
function vfRecord(x) {
    const ot = x.org_timezone, dt = x.dst_timezone;
    return {
        state: VF_STATES[x.FlightState] || (x.FlightState ? 'other' : 'scheduled'), state_raw: x.FlightState || '',
        from: x.FlightDepcode || null, to: x.FlightArrcode || null,
        sched_dep: vfUtc(x.FlightDeptimePlanDate, ot), sched_arr: vfUtc(x.FlightArrtimePlanDate, dt),
        est_dep: vfUtc(x.FlightDeptimeReadyDate, ot), est_arr: vfUtc(x.FlightArrtimeReadyDate, dt),
        act_dep: vfUtc(x.FlightDeptimeDate, ot), act_arr: vfUtc(x.FlightArrtimeDate, dt),
        gate: x.BoardGate || null, checkin: x.CheckinTable || null, baggage: x.BaggageID || null,
        dep_terminal: x.FlightHTerminal || null, arr_terminal: x.FlightTerminal || null,
        aircraft: x.ftype || null, reg: x.AircraftNumber || null, delay_reason: x.DelayReason || null, ontime: x.OntimeRate || null,
    };
}
const VF_DONE = { arr: ['arrived', 'cancelled', 'diverted', 'returned'], dep: ['departed', 'arrived', 'cancelled', 'diverted', 'returned'] };

// due for a VariFlight look-up? once in the 6 h before its time; hourly from 2 h before until done (to 4 h after)
function vfDue(f, s, nowMs) {
    const due = riyadhMs(f.sched.slice(0, 10), f.sched.slice(11));
    if (s.vf && VF_DONE[f.dir].includes(s.vf.state)) return false;
    if (nowMs < due - 6 * 3600e3 || nowMs > due + 4 * 3600e3) return false;
    if (!s.vf_checked) return true;
    const gap = nowMs >= due - 2 * 3600e3 ? 55 : 6 * 60;
    return nowMs - Date.parse(s.vf_checked) >= gap * 60e3;
}

async function refreshVariFlight(env, flights, state, nowMs, stamp) {
    if (!env.VARIFLIGHT_API_KEY) return;
    const month = ymKey(new Date(nowMs));
    const meta = await env.DB.prepare('SELECT * FROM flight_meta WHERE id = ?').bind('vf').first();
    let used = meta && meta.month === month ? meta.credits_used : 0;
    let bank = meta && meta.month === month ? Number(meta.bank) || 0 : 0;
    const { usable } = vfBudget(env);
    // refill: what is left of the month's allowance, spread over the cron runs left (every 30 min); at most 10 look-ups saved up
    const runsLeft = Math.max(1, daysLeftInMonth(new Date(nowMs)) * 48);
    bank = Math.min(Math.max(0, usable - used), bank + Math.max(0, usable - used) / runsLeft, VF_CALL * 10);
    const due = (f) => riyadhMs(f.sched.slice(0, 10), f.sched.slice(11));
    const want = flights.filter(f => state.has(f.key) && vfDue(f, state.get(f.key), nowMs)).sort((a, b) => Math.abs(due(a) - nowMs) - Math.abs(due(b) - nowMs));
    let calls = 0, error = null;
    for (const f of want) {
        if (bank < VF_CALL || usable - used < VF_CALL) break;
        const s = state.get(f.key);
        const date = f.sched.slice(0, 10);
        try {
            const side = f.dir === 'arr' ? { arr: f.airport } : { dep: f.airport };
            let res = await vfSearch(env, { fnum: f.code, date, ...side });
            calls++; used += VF_CALL; bank -= VF_CALL;
            // an early-morning arrival may be listed under the day it took off
            if (!res.list.length && f.dir === 'arr' && f.sched.slice(11) < '12:00' && bank >= VF_CALL && usable - used >= VF_CALL) {
                const prev = new Date(Date.parse(date + 'T12:00:00Z') - 864e5).toISOString().slice(0, 10);
                res = await vfSearch(env, { fnum: f.code, date: prev, ...side });
                calls++; used += VF_CALL; bank -= VF_CALL;
            }
            s.vf_checked = stamp;
            const ums = due(f);
            const mine = res.list.filter(x => (f.dir === 'arr' ? x.FlightArrcode : x.FlightDepcode) === f.airport).map(vfRecord)
                .sort((a, b) => Math.abs(Date.parse(f.dir === 'arr' ? a.sched_arr : a.sched_dep) - ums) - Math.abs(Date.parse(f.dir === 'arr' ? b.sched_arr : b.sched_dep) - ums));
            if (mine[0]) s.vf = mine[0];
            else if (!s.vf) s.vf = { state: 'unknown', note: res.note || 'not found' };
        } catch (e) { error = String(e.message || e).slice(0, 300); break; }
    }
    await env.DB.prepare(`INSERT INTO flight_meta (id, month, credits_used, last_run, next_run, last_credits, last_error, bank)
        VALUES ('vf', ?, ?, ?, NULL, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET month = excluded.month, credits_used = excluded.credits_used,
        last_run = excluded.last_run, last_credits = excluded.last_credits, last_error = excluded.last_error, bank = excluded.bank`)
        .bind(month, used, stamp, calls * VF_CALL, error, bank).run();
}

// Delays and "no sign" are worked out here (FR24 has no schedules or cancellations): against the UMS time,
// departures from the take-off (or still on the ground past their time), arrivals from the landing, or while in
// the air from the ETA (Live flight positions full: 8 credits a flight, so fetched when first seen airborne, then
// every 45 min, every 15 min in the last 90 min before the UMS time). Never seen 3 h (arrival) / 4 h (departure)
// past the UMS time: "no sign" — possibly cancelled.
const ETA_GAP_FAR = 55, ETA_GAP_NEAR = 25;   // with the 30-min cron: about hourly, then every run
const LATE_DEP_MIN = 15, LATE_ARR_MIN = 30, NO_SIGN_ARR_H = 3, NO_SIGN_DEP_H = 4;
const FLIGHT_SHOW_BEFORE_H = 12, FLIGHT_SHOW_AHEAD_H = 24; // listed (free) from 12 h ago to 24 h ahead

async function fr24Live(env, flights) {
    return fr24Get(env, 'live/flight-positions/full', { flights: flights.join(','), limit: '20' });
}

// delay (minutes, + late / − early) and flag ('late' | 'no_sign' | null) of one flight at `nowMs`
function delayOf(f, s, nowMs) {
    const due = riyadhMs(f.sched.slice(0, 10), f.sched.slice(11));
    const mins = (ms) => Math.round((ms - due) / 60e3);
    const seen = s.status && s.status !== 'scheduled';
    // not seen today, and the past days say it does not fly (any more) / flies another route
    const verdict = s.detail && s.detail.hist && s.detail.hist.verdict;
    if (!seen && (verdict === 'stopped' || verdict === 'none')) return { delay: null, flag: 'not_operating' };
    if (!seen && verdict === 'wrong_airport') return { delay: null, flag: 'wrong_airport' };
    // its time passed before we ever looked it up (e.g. before tracking began): nothing can be said
    if (!seen && !s.checked_at && nowMs > due + LATE_DEP_MIN * 60e3) return { delay: null, flag: 'unchecked' };
    // "no sign" only when we did look, after its time + the grace, and never saw it
    const lookedLate = (h) => s.checked_at && Date.parse(s.checked_at) >= due + h * 3600e3;
    // past the look-up window (8 h after its time) and never seen: settle it instead of counting "late" for ever
    if (!seen && nowMs > due + 8 * 3600e3) return lookedLate(f.dir === 'dep' ? NO_SIGN_DEP_H : NO_SIGN_ARR_H)
        ? { delay: mins(Date.parse(s.checked_at)), flag: 'no_sign' } : { delay: null, flag: 'unchecked' };
    if (f.dir === 'dep') {
        if (s.takeoff) return { delay: mins(Date.parse(s.takeoff)), flag: null };
        if (!seen && lookedLate(NO_SIGN_DEP_H)) return { delay: mins(nowMs), flag: 'no_sign' };
        // its plane is not here yet: the earliest it can leave
        const it = s.detail && s.detail.inbound_today;
        if (it && it.ready && Date.parse(it.ready) > due + LATE_DEP_MIN * 60e3 && Date.parse(it.ready) > nowMs) return { delay: mins(Date.parse(it.ready)), flag: 'late_plane' };
        if (nowMs > due + LATE_DEP_MIN * 60e3) return { delay: mins(nowMs), flag: 'late' };
        return { delay: null, flag: null };
    }
    if (s.landed) return { delay: mins(Date.parse(s.landed)), flag: null };
    if (s.eta) return { delay: mins(Date.parse(s.eta)), flag: null };
    if (!seen && lookedLate(NO_SIGN_ARR_H)) return { delay: mins(nowMs), flag: 'no_sign' };
    if (nowMs > due + LATE_ARR_MIN * 60e3) return { delay: mins(nowMs), flag: 'late' };
    return { delay: null, flag: null };
}

/* --------------------- what the past days say (Flightradar24 history, events) --------------------- */
// FR24 has no timetable and no cancellations, but its last days of flights show them: the route a flight number
// really flies, its usual time, the days it flew — and when it stopped flying (e.g. Akasa: no Jeddah flight since a
// date). Kept per flight number in flight_history (the last HIST_DAYS days; topped up once a day with the days since
// the last check, so about 2 credits a flight number a day) and summed up per guest flight in detail.hist.
// For a departure: the flight that brings its plane in (same registration, landing here before it leaves) and the
// usual turn-around — followed today, it tells a departure delay before the airline does.
// Flight events: the arrival gate and the time at the gate once an arrival is in; the push-back of a departure.
// Explorer plan: 20 rows a request, 10 requests a minute — requests go out at most every FR24_SPACING ms.
const HIST_DAYS = 10, HIST_EVERY_H = 20, HIST_REQ_PER_RUN = 6, INBOUND_EVERY_D = 3, INBOUND_REQ_PER_RUN = 2;
const FR24_BASE = 'https://fr24api.flightradar24.com/api/';
const FR24_SPACING = 6500;
let fr24LastCall = 0;
async function fr24Get(env, path, params) {
    const wait = fr24LastCall + FR24_SPACING - Date.now();
    if (wait > 0) await new Promise(r => setTimeout(r, wait));
    fr24LastCall = Date.now();
    const r = await fetch(`${FR24_BASE}${path}?${new URLSearchParams(params)}`, { headers: { Accept: 'application/json', 'Accept-Version': 'v1', Authorization: `Bearer ${env.FR24_API_KEY}` } });
    const body = await r.json().catch(() => ({}));
    if (!r.ok) { const e = new Error((body && (body.message || body.error || body.details)) || `Flightradar24 ${r.status}`); e.status = r.status; throw e; }
    return Array.isArray(body.data) ? body.data : [];
}
const normCode = (x) => String(x || '').toUpperCase().replace(/^([A-Z0-9]{2})0+/, '$1');
const histRow = (x) => ({ id: x.fr24_id, code: normCode(x.flight), orig: fOrig(x), dest: fDest(x), dest_actual: fDestActual(x),
    off: fTime(x.datetime_takeoff), on: fTime(x.datetime_landed), seen: fTime(x.first_seen), ended: String(x.flight_ended) === 'true' || x.flight_ended === true, reg: x.reg || null });
const riyadhClock = (iso) => new Date(Date.parse(iso) + 3 * 3600e3).toISOString().slice(11, 16);
const riyadhDay = (iso) => new Date(Date.parse(iso) + 3 * 3600e3).toISOString().slice(0, 10);
const clockMin = (hhmm) => Number(hhmm.slice(0, 2)) * 60 + Number(hhmm.slice(3, 5));
// median clock time (circular around midnight: shifted so the times cluster)
function usualClock(list) {
    if (!list.length) return null;
    const m = list.map(clockMin).sort((a, b) => a - b);
    let best = m, spread = m[m.length - 1] - m[0];
    for (let i = 1; i < m.length; i++) {                 // try wrapping at each gap
        const w = [...m.slice(i), ...m.slice(0, i).map(v => v + 1440)];
        if (w[w.length - 1] - w[0] < spread) { best = w; spread = w[w.length - 1] - w[0]; }
    }
    const v = best[Math.floor(best.length / 2)] % 1440;
    return `${String(Math.floor(v / 60)).padStart(2, '0')}:${String(v % 60).padStart(2, '0')}`;
}

// what the history says about one guest flight
function histSummary(f, h, nowMs) {
    if (!h) return null;
    const icao = FR24_AIRPORTS[f.airport];
    const due = riyadhMs(f.sched.slice(0, 10), f.sched.slice(11));
    const past = (h.rows || []).filter(r => Date.parse(r.seen) < due - 6 * 3600e3);    // the days before this one
    const here = past.filter(r => f.dir === 'arr' ? (r.dest === icao || r.dest_actual === icao) : r.orig === icao);
    const times = here.map(r => f.dir === 'arr' ? r.on : r.off).filter(Boolean);
    const days = [...new Set(here.map(r => riyadhDay(r.seen)))].sort();
    const last = here.map(r => r.seen).sort().pop() || null;
    const out = { checked: h.checked, from: h.from, n: days.length, days, last, usual: usualClock(times.map(riyadhClock)) };
    if (!here.length) {
        const other = past.filter(r => r.orig || r.dest);
        if (other.length) {
            const o = other[other.length - 1];
            out.verdict = 'wrong_airport';
            out.route = { orig: o.orig, dest: o.dest_actual || o.dest, usual_off: usualClock(other.map(r => r.off).filter(Boolean).map(riyadhClock)), usual_on: usualClock(other.map(r => r.on).filter(Boolean).map(riyadhClock)) };
        } else out.verdict = 'none';
    } else {
        // it used to fly and has not for 2+ days before this one
        const gapDays = (due - Date.parse(last)) / 864e5;
        if (days.length >= 2 && gapDays > 2.5) out.verdict = 'stopped';
        const o = here[here.length - 1];
        out.route = { orig: o.orig, dest: o.dest_actual || o.dest };
    }
    if (f.dir === 'dep' && h.inbound) out.inbound = h.inbound;
    return out;
}

// 2c) top up the history of the flight numbers shown; find the inbound flight of departures
async function refreshHistory(env, shown, nowMs, budgetLeft) {
    const codes = [...new Set(shown.map(f => f.code))];
    const have = new Map();
    for (let i = 0; i < codes.length; i += 90) {
        const part = codes.slice(i, i + 90);
        const { results } = await env.DB.prepare(`SELECT * FROM flight_history WHERE code IN (${part.map(() => '?').join(',')})`).bind(...part).all();
        for (const r of results) have.set(r.code, { ...JSON.parse(r.data || '{}'), checked: r.checked });
    }
    let credits = 0, error = null;
    const iso = (ms) => new Date(ms).toISOString().slice(0, 19);
    const start = nowMs - HIST_DAYS * 864e5;
    // stale ones first; a request takes codes until its expected rows near the 20-row cap
    const stale = codes.filter(c => !have.get(c) || nowMs - Date.parse(have.get(c).checked) >= HIST_EVERY_H * 3600e3)
        .map(c => ({ c, from: have.get(c) && Date.parse(have.get(c).checked) > start ? Date.parse(have.get(c).checked) - 2 * 3600e3 : start }))
        .sort((a, b) => a.from - b.from);
    const changed = new Set();
    let req = 0;
    while (stale.length && req < HIST_REQ_PER_RUN && budgetLeft() - credits > 60) {
        const from = stale[0].from;
        const take = [];
        let rows = 0;
        while (stale.length && take.length < 15) {
            const est = Math.ceil((nowMs - Math.min(from, stale[0].from)) / 864e5) * 0.9;   // most fly once a day
            if (take.length && rows + est > 18) break;
            take.push(stale.shift().c); rows += est;
        }
        try {
            const list = await fr24Get(env, 'flight-summary/light', { flights: take.join(','), flight_datetime_from: iso(from), flight_datetime_to: iso(nowMs), limit: '20', sort: 'desc' });
            req++;
            credits += list.length ? list.reduce((s, x) => s + (String(x.flight_ended) === 'true' || x.flight_ended === true ? 2 : 1), 0) : 1;
            const got = list.map(histRow);
            // a full page may have dropped the oldest rows: those codes keep the earlier rows they had
            for (const c of take) {
                const h = have.get(c) || { rows: [] };
                const byId = new Map((h.rows || []).filter(r => Date.parse(r.seen) >= start).map(r => [r.id, r]));
                for (const r of got.filter(r => r.code === c)) byId.set(r.id, r);
                have.set(c, { ...h, rows: [...byId.values()].sort((a, b) => a.seen < b.seen ? -1 : 1), checked: new Date(nowMs).toISOString(), from: h.from && Date.parse(h.from) >= start ? h.from : iso(from) + 'Z' });
                changed.add(c);
            }
        } catch (e) { error = e; break; }
    }
    // the plane of a departure: who brought it in last time, and how long it stayed
    let ib = 0;
    for (const f of shown.filter(x => x.dir === 'dep')) {
        if (ib >= INBOUND_REQ_PER_RUN || error || budgetLeft() - credits <= 60) break;
        const h = have.get(f.code);
        if (!h || (h.inbound_checked && nowMs - Date.parse(h.inbound_checked) < INBOUND_EVERY_D * 864e5)) continue;
        const icao = FR24_AIRPORTS[f.airport];
        const leg = (h.rows || []).filter(r => r.orig === icao && r.off && r.reg).pop();
        h.inbound_checked = new Date(nowMs).toISOString(); changed.add(f.code);
        if (!leg) continue;
        try {
            const off = Date.parse(leg.off);
            const list = await fr24Get(env, 'flight-summary/light', { registrations: leg.reg, flight_datetime_from: iso(off - 14 * 3600e3), flight_datetime_to: iso(off - 10 * 60e3), limit: '20' });
            ib++;
            credits += list.length ? list.reduce((s, x) => s + (String(x.flight_ended) === 'true' || x.flight_ended === true ? 2 : 1), 0) : 1;
            const inb = list.map(histRow).filter(r => (r.dest_actual || r.dest) === icao && r.on && Date.parse(r.on) < off).sort((a, b) => a.on < b.on ? -1 : 1).pop();
            h.inbound = inb ? { code: inb.code, orig: inb.orig, turn_min: Math.round((off - Date.parse(inb.on)) / 60e3), seen: leg.off } : null;
        } catch (e) { error = e; break; }
    }
    const stmts = [...changed].map(c => {
        const { checked, ...data } = have.get(c);
        return env.DB.prepare('INSERT INTO flight_history (code, checked, data) VALUES (?, ?, ?) ON CONFLICT(code) DO UPDATE SET checked = excluded.checked, data = excluded.data')
            .bind(c, checked || new Date(nowMs).toISOString(), JSON.stringify(data));
    });
    for (let i = 0; i < stmts.length; i += 40) await env.DB.batch(stmts.slice(i, i + 40));
    return { have, credits, error };
}

// 2d) today's inbound plane of departures due in the next 8 h (not yet off): where is it, and when can it leave
async function refreshInbound(env, shown, state, nowMs, budgetLeft) {
    const icao = (f) => FR24_AIRPORTS[f.airport];
    const due = (f) => riyadhMs(f.sched.slice(0, 10), f.sched.slice(11));
    const deps = shown.filter(f => {
        const s = state.get(f.key), ib = s.detail.hist && s.detail.hist.inbound;
        if (f.dir !== 'dep' || !ib || s.takeoff || s.detail.cancel) return false;
        if (s.detail.inbound_today && s.detail.inbound_today.on) return false;   // its plane is in: nothing more to learn
        return nowMs >= due(f) - 8 * 3600e3 && nowMs <= due(f) + 4 * 3600e3;
    });
    if (!deps.length || budgetLeft() < 40) return { credits: 0 };
    let credits = 0, error = null;
    const iso = (ms) => new Date(ms).toISOString().slice(0, 19);
    const codes = [...new Set(deps.map(f => state.get(f.key).detail.hist.inbound.code))];
    try {
        const list = (await fr24Get(env, 'flight-summary/light', { flights: codes.slice(0, 15).join(','), flight_datetime_from: iso(nowMs - 16 * 3600e3), flight_datetime_to: iso(nowMs), limit: '20' })).map(histRow);
        credits += list.length ? list.reduce((s, r) => s + (r.ended ? 2 : 1), 0) : 1;
        const air = [];
        for (const f of deps) {
            const s = state.get(f.key), ib = s.detail.hist.inbound;
            const cand = list.filter(r => r.code === ib.code && (r.dest_actual || r.dest || icao(f)) === icao(f) && r.orig !== icao(f) && Date.parse(r.seen) <= due(f))
                .sort((a, b) => a.seen < b.seen ? -1 : 1).pop();
            s.detail.inbound_today = cand ? { code: ib.code, orig: cand.orig || ib.orig, reg: cand.reg, off: cand.off, on: cand.on, checked: new Date(nowMs).toISOString(), eta: s.detail.inbound_today?.eta || null }
                : { code: ib.code, orig: ib.orig, checked: new Date(nowMs).toISOString() };
            if (cand && cand.off && !cand.on) air.push(f);
        }
        // airborne: its ETA (8 credits a flight) — what the departure can be predicted from
        const want = [...new Set(air.map(f => state.get(f.key).detail.inbound_today.code))];
        if (want.length && budgetLeft() - credits > want.length * 8 + 20) {
            const live = await fr24Get(env, 'live/flight-positions/full', { flights: want.join(','), limit: '20' });
            credits += live.length ? live.length * 8 : 1;
            for (const f of air) {
                const it = state.get(f.key).detail.inbound_today;
                const p = live.find(x => normCode(x.flight) === it.code && (!x.dest_icao || x.dest_icao === icao(f)));
                if (p && p.eta) it.eta = fTime(p.eta);
            }
        }
    } catch (e) { error = e; }
    // earliest it can leave: plane in (or its ETA) + the usual turn-around (a little less: crews hurry when late)
    for (const f of deps) {
        const s = state.get(f.key), ib = s.detail.hist.inbound, it = s.detail.inbound_today;
        const inAt = it && (it.on || it.eta);
        const turn = Math.max(35, Math.round((ib.turn_min || 60) * 0.8));
        it.ready = inAt ? new Date(Date.parse(inAt) + turn * 60e3).toISOString() : null;
        it.turn_min = turn;
    }
    return { credits, error };
}

// 2e) flight events: arrival gate / at the gate (arrivals in, once or twice), push-back (departures at the gate)
async function refreshEvents(env, todoAll, state, nowMs, budgetLeft) {
    const want = todoAll.filter(f => {
        const s = state.get(f.key);
        if (!s.fr24_id || (s.detail.ev_tries || 0) >= 2) return false;
        if (f.dir === 'arr') return s.status === 'landed' && !s.detail.gate_arrival && nowMs - Date.parse(s.landed) >= 8 * 60e3;
        return s.status === 'boarding' && !s.detail.gate_departure;
    }).slice(0, 15);
    if (!want.length || budgetLeft() < 30) return { credits: 0 };
    let credits = 0, error = null;
    try {
        const list = await fr24Get(env, 'historic/flight-events/light', { flight_ids: want.map(f => state.get(f.key).fr24_id).join(','), event_types: 'gate_departure,gate_arrival' });
        credits += Math.max(1, list.reduce((n, x) => n + (x.events || []).length, 0) * 2);
        for (const f of want) {
            const s = state.get(f.key);
            s.detail.ev_tries = (s.detail.ev_tries || 0) + 1;
            const ev = (list.find(x => x.fr24_id === s.fr24_id) || {}).events || [];
            const ga = ev.filter(e => e.type === 'gate_arrival').pop(), gd = ev.filter(e => e.type === 'gate_departure').pop();
            if (f.dir === 'arr' && ga) s.detail.gate_arrival = { at: fTime(ga.timestamp), gate: ga.details?.gate_ident || null };
            if (gd) s.detail.gate_departure = { at: fTime(gd.timestamp), gate: gd.details?.gate_ident || null };
        }
    } catch (e) { error = e; }
    return { credits, error };
}

async function refreshFlightStatus(env, force = false) {
    const now = new Date(), nowMs = now.getTime();
    // FR24 storage rule: nothing older than 30 days
    await env.DB.prepare('DELETE FROM flight_status WHERE updated_at < ?').bind(new Date(nowMs - FLIGHT_KEEP_DAYS * 864e5).toISOString()).run();
    await env.DB.prepare('DELETE FROM flight_history WHERE checked < ?').bind(new Date(nowMs - FLIGHT_KEEP_DAYS * 864e5).toISOString()).run();
    const meta = await env.DB.prepare('SELECT * FROM flight_meta WHERE id = ?').bind('fr24').first();
    const month = ymKey(now);
    let used = meta && meta.month === month ? meta.credits_used : 0;
    const saveMeta = (fields) => env.DB.prepare(`INSERT INTO flight_meta (id, month, credits_used, last_run, next_run, last_credits, last_error)
        VALUES ('fr24', ?, ?, ?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET month = excluded.month, credits_used = excluded.credits_used,
        last_run = excluded.last_run, next_run = excluded.next_run, last_credits = excluded.last_credits, last_error = excluded.last_error`)
        .bind(month, used, now.toISOString(), fields.next_run, fields.last_credits || 0, fields.error || null).run();
    const later = (min) => new Date(nowMs + min * 60e3).toISOString();

    if (!force && meta && meta.next_run && now.toISOString() < meta.next_run) return;
    if (!env.FR24_API_KEY) return saveMeta({ next_run: later(FLIGHT_MAX_GAP), error: 'No Flightradar24 key on the server (FR24_API_KEY).' });

    const flights = await guestFlights(env, nowMs);
    const keys = flights.map(f => f.key);
    const rows = new Map();
    for (let i = 0; i < keys.length; i += 90) { // D1: at most 100 values in one statement
        const part = keys.slice(i, i + 90);
        const { results } = await env.DB.prepare(`SELECT * FROM flight_status WHERE key IN (${part.map(() => '?').join(',')})`).bind(...part).all();
        for (const r of results) rows.set(r.key, r);
    }
    const due = (f) => riyadhMs(f.sched.slice(0, 10), f.sched.slice(11));
    const iso = (ms) => new Date(ms).toISOString().slice(0, 19);
    const stamp = now.toISOString();
    const recheck = new Set();
    for (const f of flights) {
        const p = rows.get(f.key);
        const d = p && p.detail ? JSON.parse(p.detail) : {};
        if (!p || !p.fr24_id || plausible(f, { first_seen: d.first_seen, datetime_takeoff: p.takeoff })) continue;
        Object.assign(p, { status: 'scheduled', fr24_id: null, callsign: null, origin: null, destination: null, destination_actual: null,
            takeoff: null, landed: null, ended: 0, eta: null, eta_checked: null, checked_at: null, delay_min: null, flag: null,
            detail: JSON.stringify({ hist: d.hist, inbound_today: d.inbound_today }), _was: 'reset' });
        if (nowMs <= due(f) + 24 * 3600e3) recheck.add(f.key);
    }
    // the working copy of every flight shown (12 h ago … 24 h ahead) or still being followed
    const shown = flights.filter(f => due(f) >= nowMs - FLIGHT_SHOW_BEFORE_H * 3600e3 && due(f) <= nowMs + FLIGHT_SHOW_AHEAD_H * 3600e3);
    const todo = flights.filter(f => inPlay(f, rows.get(f.key), nowMs) || recheck.has(f.key));
    const state = new Map();
    for (const f of [...shown, ...todo]) {
        const p = rows.get(f.key);
        state.set(f.key, p ? { ...p, detail: p.detail ? JSON.parse(p.detail) : {}, vf: p.vf ? JSON.parse(p.vf) : null }
            : { key: f.key, dir: f.dir, airport: f.airport, code: f.code, sched: f.sched, status: 'scheduled', detail: {} });
        Object.assign(state.get(f.key), { airport: f.airport, sched: f.sched }); // UMS may have moved it
    }

    const { usable } = fr24Budget(env);
    let credits = 0, error = null;
    const fail = (e) => {
        error = String(e.message || e).slice(0, 300);
        if (e.status === 401 || e.status === 403) error = `Flightradar24 refused the key (${e.status}). Check FR24_API_KEY.`;
        if (e.status === 402) error = 'Flightradar24 says the credits are used up.';
    };
    const out = () => usable - used - credits;

    // 1) Flight summary: take-off, landing, diversion — requests of up to 15 flight numbers, arrivals and departures
    //    apart, each window (on first_seen) as tight as its flights allow
    if (todo.length && out() < todo.length + 2) error = 'This month\'s Flightradar24 credits (outside the reserve) are used up; status updates pause until next month.';
    else if (todo.length) {
        const batches = [];
        for (const dir of ['arr', 'dep']) {
            const list = todo.filter(f => f.dir === dir).sort((a, b) => due(a) - due(b));
            let cur = null;
            for (const f of list) {
                if (!cur || (!cur.codes.has(f.code) && cur.codes.size >= 8)) batches.push(cur = { dir, codes: new Set(), flights: [] });
                cur.codes.add(f.code); cur.flights.push(f);
            }
        }
        const records = [];
        try {
            for (const b of batches) {
                const dues = b.flights.map(due);
                const from = Math.min(...dues) - (b.dir === 'arr' ? 14 : 3) * 3600e3;
                const to = Math.max(from + 60e3, Math.min(nowMs, Math.max(...dues) + 8 * 3600e3));
                const part = await fr24Fetch(env, [...b.codes], iso(from), iso(to));
                credits += part.length ? part.reduce((s, x) => s + (String(x.flight_ended) === 'true' || x.flight_ended === true ? 2 : 1), 0) : 1;
                records.push(...part);
            }
        } catch (e) { fail(e); }
        for (const f of todo) {
            const s = state.get(f.key);
            s.checked_at = stamp;
            const rec = pickRecord(f, records);
            if (!rec) continue;
            Object.assign(s, {
                status: statusOf(f, rec), fr24_id: rec.fr24_id || null, callsign: rec.callsign || null, origin: fOrig(rec),
                destination: fDest(rec), destination_actual: fDestActual(rec), takeoff: fTime(rec.datetime_takeoff), landed: fTime(rec.datetime_landed),
                ended: String(rec.flight_ended) === 'true' || rec.flight_ended === true ? 1 : 0,
            });
            Object.assign(s.detail, { type: rec.type || null, reg: rec.reg || null, hex: rec.hex || null, operating_as: rec.operating_as || rec.operated_as || null,
                first_seen: fTime(rec.first_seen), last_seen: fTime(rec.last_seen) });
        }
    }

    // 2) ETA of our arrivals in the air (Live flight positions full, 8 credits each)
    const etaDue = todo.filter(f => {
        const s = state.get(f.key);
        if (f.dir !== 'arr' || s.status !== 'airborne') return false;
        const gap = nowMs >= due(f) - 90 * 60e3 ? ETA_GAP_NEAR : ETA_GAP_FAR;
        return !s.eta_checked || nowMs - Date.parse(s.eta_checked) >= gap * 60e3;
    });
    if (!error && etaDue.length && out() >= etaDue.length * 8 + 2) {
        try {
            const codes = [...new Set(etaDue.map(f => f.code))];
            for (let i = 0; i < codes.length; i += 15) {
                const part = await fr24Live(env, codes.slice(i, i + 15));
                credits += part.length ? part.length * 8 : 1;
                for (const f of etaDue) {
                    const icao = FR24_AIRPORTS[f.airport];
                    const p = part.find(x => String(x.flight || '').toUpperCase().replace(/^([A-Z0-9]{2})0+/, '$1') === f.code
                        && (!x.dest_icao || x.dest_icao === icao) && x.orig_icao !== icao);
                    const s = state.get(f.key);
                    if (!codes.slice(i, i + 15).includes(f.code)) continue;
                    s.eta_checked = stamp;
                    if (!p) continue;
                    s.eta = p.eta ? fTime(p.eta) : s.eta || null;
                    Object.assign(s.detail, { type: p.type || s.detail.type || null, reg: p.reg || s.detail.reg || null, alt: p.alt ?? null, gspeed: p.gspeed ?? null,
                        vspeed: p.vspeed ?? null, lat: p.lat ?? null, lon: p.lon ?? null, pos_at: fTime(p.timestamp), dest: p.dest_icao || null });
                    if (p.dest_icao && !s.destination) s.destination = p.dest_icao;
                }
            }
        } catch (e) { fail(e); }
    }
    // 2c–2e) the past days of each flight number, the plane of each departure, gates (see "what the past days say")
    // — paced on their own (daily top-ups, capped per run), so they do not slow the take-off / landing look-ups below
    const trackCredits = credits;
    try {
        const h = await refreshHistory(env, shown, nowMs, out);
        credits += h.credits; if (h.error) fail(h.error);
        for (const f of shown) state.get(f.key).detail.hist = histSummary(f, h.have.get(f.code), nowMs);
        const ib = await refreshInbound(env, shown, state, nowMs, out);
        credits += ib.credits; if (ib.error) fail(ib.error);
        const ev = await refreshEvents(env, shown, state, nowMs, out);
        credits += ev.credits; if (ev.error) fail(ev.error);
    } catch (e) { console.error('history', e && e.stack || e); }
    used += credits;

    // 2b) the airline's schedule and status (VariFlight), within its own credit budget
    try { await refreshVariFlight(env, flights, state, nowMs, stamp); } catch (e) { console.error('variflight', e && e.stack || e); }

    // 3) delays / late / no sign for everything shown, and write back what changed
    const stmts = [];
    for (const f of state.values()) {
        const fl = flights.find(x => x.key === f.key);
        const { delay, flag } = delayOf(fl, f, nowMs);
        f.delay_min = delay; f.flag = flag;
        const p = rows.get(f.key);
        const detail = JSON.stringify(f.detail || {});
        const vfText = f.vf ? JSON.stringify(f.vf) : null;
        const same = p && p._was !== 'reset' && ['status', 'fr24_id', 'callsign', 'origin', 'destination', 'destination_actual', 'takeoff', 'landed', 'ended', 'checked_at', 'eta', 'eta_checked', 'delay_min', 'flag', 'sched', 'airport', 'vf_checked']
            .every(k => (p[k] ?? null) === (f[k] ?? null)) && (p.detail || '{}') === detail && (p.vf ?? null) === vfText;
        if (same) continue;
        stmts.push(env.DB.prepare(`INSERT INTO flight_status (key, dir, airport, code, sched, status, fr24_id, callsign, origin, destination, destination_actual,
                takeoff, landed, ended, eta, eta_checked, delay_min, flag, detail, vf, vf_checked, checked_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(key) DO UPDATE SET airport = excluded.airport, sched = excluded.sched, status = excluded.status, fr24_id = excluded.fr24_id,
                callsign = excluded.callsign, origin = excluded.origin, destination = excluded.destination, destination_actual = excluded.destination_actual,
                takeoff = excluded.takeoff, landed = excluded.landed, ended = excluded.ended, eta = excluded.eta, eta_checked = excluded.eta_checked,
                delay_min = excluded.delay_min, flag = excluded.flag, detail = excluded.detail, vf = excluded.vf, vf_checked = excluded.vf_checked,
                checked_at = excluded.checked_at, updated_at = excluded.updated_at`)
            .bind(f.key, f.dir, f.airport, f.code, f.sched, f.status || 'scheduled', f.fr24_id || null, f.callsign || null, f.origin || null, f.destination || null,
                f.destination_actual || null, f.takeoff || null, f.landed || null, f.ended || 0, f.eta || null, f.eta_checked || null,
                f.delay_min ?? null, f.flag || null, detail, vfText, f.vf_checked || null, f.checked_at || null, stamp));
    }
    for (let i = 0; i < stmts.length; i += 40) await env.DB.batch(stmts.slice(i, i + 40));

    // next look-up: what is left (outside the reserve), spread over the rest of the month, at this pace
    if (!todo.length) return saveMeta({ next_run: later(FLIGHT_MIN_GAP), last_credits: credits, error });
    const perRun = Math.max(1, trackCredits || todo.length);
    const runsLeft = Math.max(0, usable - used) / perRun;
    const gap = runsLeft < 1 ? FLIGHT_MAX_GAP * 6 : Math.min(FLIGHT_MAX_GAP, Math.max(FLIGHT_MIN_GAP, Math.ceil(daysLeftInMonth(now) * 1440 / runsLeft)));
    await saveMeta({ next_run: later(error ? Math.max(gap, 15) : gap), last_credits: credits, error });
}

// GET /api/flights/status — what desks read (any login): the stored statuses around today, and the budget
async function getFlightStatus(env) {
    const nowMs = Date.now();
    const from = new Date(nowMs + 3 * 3600e3 - 3 * 864e5).toISOString().slice(0, 10);
    const { results } = await env.DB.prepare('SELECT key, dir, airport, code, sched, status, callsign, origin, destination, destination_actual, takeoff, landed, ended, eta, delay_min, flag, detail, vf, vf_checked, checked_at, updated_at FROM flight_status WHERE sched >= ? ORDER BY sched').bind(from).all();
    const meta = await env.DB.prepare('SELECT * FROM flight_meta WHERE id = ?').bind('fr24').first();
    const b = fr24Budget(env);
    return json({
        configured: !!env.FR24_API_KEY, flights: results.map(r => ({ ...r, detail: r.detail ? JSON.parse(r.detail) : {}, vf: r.vf ? JSON.parse(r.vf) : null })), now: new Date().toISOString(),
        variflight: await (async () => {
            const m = await env.DB.prepare('SELECT * FROM flight_meta WHERE id = ?').bind('vf').first();
            return { configured: !!env.VARIFLIGHT_API_KEY, budget: vfBudget(env), credits_used: m && m.month === ymKey() ? m.credits_used : 0, last_run: m?.last_run || null, error: m?.last_error || null };
        })(),
        meta: meta ? { last_run: meta.last_run, next_run: meta.next_run, error: meta.last_error, credits_used: meta.month === ymKey() ? meta.credits_used : 0, last_credits: meta.last_credits } : null,
        budget: { monthly: b.monthly, reserve: b.reserve, usable: b.usable },
    });
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

/* ------------------------------ hourly backups ------------------------------ */
// Every hour the cron (wrangler.toml) writes a compressed export of the database to KV (binding BACKUPS): kept hourly for
// 72 h and one a day for 35 days. Each backup is three values so nothing heavy is read when it is not needed:
//   slips — the slips table (a lookup of "how did this slip look" parses only this)
//   rest  — every other table (logins without their password hashes)
//   auth  — the logins WITH password hashes: never served by the API, only read with wrangler for a real restore
// Format: { format: 'pms-backup-1', part, at, stem, tables: { name: { cols: [...], rows: [[...]] } } } gzipped.
// Not kept: sessions, login failures, page-speed telemetry. Admin API: /api/backups (status + list), /download, /run,
// /slip (a slip as it was in a backup), /restore-slip (writes that state back as a new version — also undeletes).
// A missed run is made up at the next :30 tick. Restore of a whole database: tools/restore-backup.mjs.
const BK_SKIP = new Set(['sessions', 'login_failures', 'perf_events']);
const BK_SECRET_COLS = ['pw_hash', 'pw_salt', 'pw_iter'];
const BK_HOURLY_TTL = 72 * 3600, BK_DAILY_TTL = 35 * 86400;
const BK_PARTS = ['slips', 'rest', 'auth'];
const stemOf = (d) => d.toISOString().slice(0, 16).replace(':', '-');                 // 2026-10-23T18-00
const bkKey = (kind, stem, part) => `bk:${kind}:${stem}:${part}`;
const gzip = async (text) => new Uint8Array(await new Response(new Blob([text]).stream().pipeThrough(new CompressionStream('gzip'))).arrayBuffer());
const gunzip = async (bytes) => new Response(new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'))).text();
const sha256Bytes = async (bytes) => toHex(await crypto.subtle.digest('SHA-256', bytes));

async function bkDump(env) {
    const { results: tl } = await env.DB.prepare("SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name").all();
    const names = tl.map(r => r.name).filter(n => !n.startsWith('sqlite_') && !n.startsWith('_cf_') && !BK_SKIP.has(n));
    const sets = await env.DB.batch(names.map(n => env.DB.prepare(`SELECT * FROM "${n}"`)));
    const tables = {};
    names.forEach((n, i) => {
        const res = sets[i].results, cols = res[0] ? Object.keys(res[0]) : [];
        tables[n] = { cols, rows: res.map(r => cols.map(c => r[c])) };
    });
    return tables;
}
const bkRedact = (t) => {
    const keep = t.cols.map((c, i) => BK_SECRET_COLS.includes(c) ? -1 : i).filter(i => i >= 0);
    return { cols: keep.map(i => t.cols[i]), rows: t.rows.map(r => keep.map(i => r[i])) };
};

async function runBackup(env, trigger) {
    if (!env.BACKUPS) throw new HttpError(503, 'Backups are not set up (the BACKUPS storage is not connected).');
    const t0 = Date.now(), at = new Date(), stem = stemOf(at);
    try {
        const tables = await bkDump(env);
        const names = Object.keys(tables);
        const pick = (list) => Object.fromEntries(list.filter(n => tables[n]).map(n => [n, tables[n]]));
        const parts = {
            slips: pick(['slips']),
            auth: pick(['desks']),
            rest: { ...pick(names.filter(n => n !== 'slips')), ...(tables.desks ? { desks: bkRedact(tables.desks) } : {}) },
        };
        const daily = at.getUTCHours() === 0;                                         // 03:00 Saudi time: also a copy kept 35 days
        let bytes = 0, rows = 0;
        for (const part of BK_PARTS) {
            const json = JSON.stringify({ format: 'pms-backup-1', part, at: at.toISOString(), stem, tables: parts[part] });
            const gz = await gzip(json);
            const n = Object.values(parts[part]).reduce((s, t) => s + t.rows.length, 0);
            const metadata = { at: at.toISOString(), kind: trigger, part, bytes: gz.length, raw: json.length, rows: n, sha: await sha256Bytes(gz) };
            await env.BACKUPS.put(bkKey('h', stem, part), gz, { expirationTtl: BK_HOURLY_TTL, metadata });
            if (daily) await env.BACKUPS.put(bkKey('d', stem.slice(0, 10), part), gz, { expirationTtl: BK_DAILY_TTL, metadata: { ...metadata, kind: 'daily' } });
            bytes += gz.length; if (part !== 'auth') rows += n;
        }
        const status = { ok: true, ok_at: at.toISOString(), stem, trigger, ms: Date.now() - t0, bytes, rows, tables: names.length,
            counts: Object.fromEntries(names.map(n => [n, tables[n].rows.length])) };
        await env.BACKUPS.put('bk:last', JSON.stringify(status));
        return status;
    } catch (e) {
        const prev = await env.BACKUPS.get('bk:last', 'json').catch(() => null);
        const status = { ...(prev || {}), ok: false, failed_at: at.toISOString(), error: String(e && e.message || e).slice(0, 300) };
        await env.BACKUPS.put('bk:last', JSON.stringify(status)).catch(() => { });
        throw e;
    }
}

// the cron: on the first tick of every hour, and on the next one if the last good backup is more than 100 minutes old
async function backupIfDue(env, scheduledTime) {
    if (!env.BACKUPS) return;
    const minute = new Date(scheduledTime).getUTCMinutes();
    const last = await env.BACKUPS.get('bk:last', 'json').catch(() => null);
    const age = last && last.ok_at ? Date.now() - Date.parse(last.ok_at) : Infinity;
    if (minute < 30 || age > 100 * 60e3) await runBackup(env, 'hourly');
}

async function bkList(env) {
    const items = new Map();
    for (const kind of ['h', 'd']) {
        let cursor;
        do {
            const r = await env.BACKUPS.list({ prefix: `bk:${kind}:`, cursor });
            for (const k of r.keys) {
                const [, , stem, part] = k.name.split(':');
                if (!k.metadata || !BK_PARTS.includes(part)) continue;
                const id = `${kind}:${stem}`;
                const it = items.get(id) || { kind, stem, at: k.metadata.at, trigger: k.metadata.kind, parts: {} };
                it.parts[part] = { bytes: k.metadata.bytes, raw: k.metadata.raw, rows: k.metadata.rows, sha: k.metadata.sha };
                items.set(id, it);
            }
            cursor = r.list_complete ? undefined : r.cursor;
        } while (cursor);
    }
    return [...items.values()].sort((a, b) => String(b.at).localeCompare(String(a.at)));
}
async function bkLoad(env, kind, stem, part) {
    if (!/^[hd]$/.test(kind) || !/^[0-9T-]{10,16}$/.test(stem) || !['slips', 'rest'].includes(part)) throw new HttpError(400, 'Unknown backup.');
    const bytes = await env.BACKUPS.get(bkKey(kind, stem, part), 'arrayBuffer');
    if (!bytes) throw new HttpError(404, 'That backup is no longer kept (hourly copies are kept 72 hours, daily ones 35 days).');
    return JSON.parse(await gunzip(new Uint8Array(bytes)));
}
const bkTable = (doc, name) => {
    const t = doc.tables && doc.tables[name];
    if (!t) throw new HttpError(404, `That backup has no ${name} table.`);
    const ix = Object.fromEntries(t.cols.map((c, i) => [c, i]));
    return { t, ix };
};

async function backupRoute(p, m, url, req, env, me) {
    if (!env.BACKUPS) throw new HttpError(503, 'Backups are not set up (the BACKUPS storage is not connected).');
    if (p === '/api/backups' && m === 'GET') {
        const [status, items] = await Promise.all([env.BACKUPS.get('bk:last', 'json'), bkList(env)]);
        return json({ status: status || null, items, now: now() });
    }
    if (p === '/api/backups/run' && m === 'POST') {
        const s = await runBackup(env, 'manual');
        await auditStmt(env, me, 'backup-run', null, `${s.rows} rows, ${Math.round(s.bytes / 1024)} KB`).run();
        return json({ status: s });
    }
    if (p === '/api/backups/download' && m === 'GET') {
        const kind = url.searchParams.get('kind') || 'h', stem = String(url.searchParams.get('stem') || ''), part = url.searchParams.get('part') || 'rest';
        if (!/^[hd]$/.test(kind) || !/^[0-9T-]{10,16}$/.test(stem) || !['slips', 'rest'].includes(part)) throw new HttpError(400, 'Unknown backup.');   // the logins part is never served
        const bytes = await env.BACKUPS.get(bkKey(kind, stem, part), 'arrayBuffer');
        if (!bytes) throw new HttpError(404, 'That backup is no longer kept.');
        await auditStmt(env, me, 'backup-download', null, `${kind}:${stem} ${part}`).run();
        return new Response(bytes, { headers: { 'Content-Type': 'application/gzip', 'Cache-Control': 'no-store', 'Content-Disposition': `attachment; filename="pms-${stem}-${part}.json.gz"` } });
    }
    // a slip as it was in a backup, next to how it is now: ?kind=h&stem=2026-10-23T18-00&sh=43496 (or &id=948)
    if (p === '/api/backups/slip' && m === 'GET') {
        const doc = await bkLoad(env, url.searchParams.get('kind') || 'h', String(url.searchParams.get('stem') || ''), 'slips');
        const { t, ix } = bkTable(doc, 'slips');
        const digits = (s) => String(s || '').trim().toUpperCase().replace(/^[A-Z]+(?=\d)/, '');
        const sh = digits(url.searchParams.get('sh')), id = Number(url.searchParams.get('id')) || 0;
        if (!sh && !id) throw new HttpError(400, 'Give an SH number or a slip id.');
        const hits = t.rows.filter(r => (id ? r[ix.id] === id : digits(r[ix.sh_no]) === sh)).slice(0, 12);
        const ids = hits.map(r => r[ix.id]);
        const live = ids.length ? (await env.DB.prepare(`SELECT id, site, sh_no, data, deleted, version FROM slips WHERE id IN (${ids.map(() => '?').join(',')})`).bind(...ids).all()).results : [];
        const liveBy = new Map(live.map(r => [r.id, r]));
        return json({ stem: doc.stem, at: doc.at, matches: hits.map(r => {
            const l = liveBy.get(r[ix.id]);
            return { id: r[ix.id], site: r[ix.site], sh_no: r[ix.sh_no], deleted: !!r[ix.deleted], data: JSON.parse(r[ix.data]),
                live: l ? { sh_no: l.sh_no, deleted: !!l.deleted, version: l.version, data: JSON.parse(l.data) } : null };
        }) });
    }
    // writes a slip's state in a backup back as a NEW version (history keeps everything; a deleted slip comes back)
    if (p === '/api/backups/restore-slip' && m === 'POST') {
        const { kind = 'h', stem, slip_id } = await body(req);
        const doc = await bkLoad(env, kind, String(stem || ''), 'slips');
        const { t, ix } = bkTable(doc, 'slips');
        const row = t.rows.find(r => r[ix.id] === Number(slip_id));
        if (!row) throw new HttpError(404, 'That slip is not in this backup.');
        const live = await getRow(env, Number(slip_id));
        if (!live) throw new HttpError(404, 'This slip does not exist any more.');
        const data = JSON.parse(row[ix.data]), liveData = JSON.parse(live.data);
        if (data.ums && liveData.ums && liveData.ums.applied) data.ums = { ...data.ums, applied: liveData.ums.applied };   // as when a version is made active
        data.updatedAt = now();
        const s = prepareSlip(data), at = now();
        const [res] = await env.DB.batch([
            env.DB.prepare(`UPDATE slips SET sh_no = ?, building = ?, checkin_date = ?, checkout_date = ?, ums_key = ?, data = ?, deleted = 0,
                    version = version + 1, seq = ${NEXT_SEQ}, updated_at = ?, updated_by = ? WHERE id = ? AND version = ?`)
                .bind(s.sh_no, s.building, s.checkin_date, s.checkout_date, s.ums_key, s.text, at, me.id, live.id, live.version),
            verStmt(env, me, at, 'restore', 'restore', `backup ${kind}:${doc.stem}`, true),
        ]);
        if (!res.meta.changes) throw new HttpError(409, 'Someone changed this slip just now. Look it up again and retry.');
        await auditStmt(env, me, 'slip-restore', live.id, `SH ${s.sh_no}: restored from backup ${kind}:${doc.stem}${live.deleted ? ' (it was deleted)' : ''}`).run();
        return json({ slip: rowToSlip(await getRow(env, live.id)) });
    }
    return null;
}

/* ------------------------------ performance & feedback ------------------------------ */
// Rows come from every desk's browser (pms/app/core/telemetry.js, feedback.js): bounded text, whole numbers, at most
// 60 events a call. perf_events older than 90 days are dropped when the summary is read.
const tStr = (v, n) => v == null ? null : String(v).replace(/[<>]/g, '').slice(0, n);
const tInt = (v, max = 1e7) => { const x = Number(v); return Number.isFinite(x) ? Math.max(0, Math.min(max, Math.round(x))) : null; };
const tNum = (v, max = 1e6) => { const x = Number(v); return Number.isFinite(x) ? Math.max(0, Math.min(max, Math.round(x * 1000) / 1000)) : null; };
function tAt(v) {
    const ms = Date.parse(String(v || ''));
    return Number.isFinite(ms) && Math.abs(Date.now() - ms) < 3 * 864e5 ? new Date(ms).toISOString() : now();
}
const PERF_KINDS = ['route', 'load', 'error'];

async function postTelemetry(req, env, me) {
    const { events, ctx } = await body(req);
    if (!Array.isArray(events)) throw new HttpError(400, 'events must be a list.');
    const c = ctx && typeof ctx === 'object' ? ctx : {};
    const cf = req.cf || {};
    const stmts = events.slice(0, 60).filter(e => e && PERF_KINDS.includes(e.kind)).map(e => env.DB.prepare(
        `INSERT INTO perf_events (at, desk_id, desk, site, role, kind, page, ms_total, ms_server, server_calls, long_ms, lcp, inp, cls, ttfb, dom_ready, load_ms,
            device, os, browser, browser_ver, app, screen, mem, cores, net_type, downlink, rtt, save_data, colo, country, build, err)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).bind(
        tAt(e.at), me.id, me.name, tStr(e.site || me.site, 10), me.role, e.kind, tStr(e.page, 40),
        tInt(e.ms_total, 6e5), tInt(e.ms_server, 6e5), tInt(e.server_calls, 1000), tInt(e.long_ms, 6e5),
        tInt(e.lcp, 6e5), tInt(e.inp, 6e4), tNum(e.cls, 100), tInt(e.ttfb, 6e5), tInt(e.dom_ready, 6e5), tInt(e.load_ms, 6e5),
        tStr(c.device, 10), tStr(c.os, 20), tStr(c.browser, 20), tStr(c.browser_ver, 12), tStr(c.app, 10), tStr(c.screen, 12),
        tNum(c.mem, 1024), tInt(c.cores, 256), tStr(e.net_type ?? c.net_type, 10), tNum(e.downlink ?? c.downlink, 10000),
        tInt(e.rtt ?? c.rtt, 60000), c.save_data ? 1 : 0, tStr(cf.colo, 8), tStr(cf.country, 4), tStr(c.build, 20), tStr(e.err, 400)));
    if (stmts.length) await env.DB.batch(stmts);
    return json({ ok: true, saved: stmts.length });
}

async function postFeedback(req, env, me) {
    const f = await body(req);
    const rating = tInt(f.rating, 5);
    if (!(rating >= 1 && rating <= 5)) throw new HttpError(400, 'Choose 1 to 5 stars.');
    const c = f.ctx && typeof f.ctx === 'object' ? f.ctx : {};
    const cf = req.cf || {};
    const tags = Array.isArray(f.tags) ? f.tags.map(x => tStr(x, 30)).filter(Boolean).slice(0, 8).join(', ') : '';
    await env.DB.prepare(
        `INSERT INTO feedback (at, desk_id, desk, site, role, page, trigger, rating, tags, text, page_ms, device, browser, net_type, colo, country, build)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).bind(now(), me.id, me.name, tStr(f.site || me.site, 10), me.role, tStr(f.page, 40), tStr(f.trigger, 20),
        rating, tags, tStr(f.text, 1000) || '', tInt(c.page_ms, 6e5), tStr(c.device, 10), tStr(c.browser, 20), tStr(c.net_type, 10),
        tStr(cf.colo, 8), tStr(cf.country, 4), tStr(c.build, 20)).run();
    return json({ ok: true });
}

const pct = (arr, p) => { if (!arr.length) return null; const s = [...arr].sort((a, b) => a - b); return s[Math.min(s.length - 1, Math.floor(p * s.length))]; };
function perfGroups(rows, keyOf) {
    const by = new Map();
    for (const r of rows) { const k = keyOf(r) || '—'; if (!by.has(k)) by.set(k, []); by.get(k).push(r); }
    return [...by].map(([key, list]) => {
        const ms = list.map(r => r.ms_total).filter(x => x != null), srv = list.map(r => r.ms_server).filter(x => x != null);
        return { key, n: list.length, min: ms.length ? Math.min(...ms) : null, p10: pct(ms, .1), p25: pct(ms, .25), p50: pct(ms, .5), p75: pct(ms, .75), p95: pct(ms, .95), max: ms.length ? Math.max(...ms) : null, server_p50: pct(srv, .5), calls: Math.round(list.reduce((s, r) => s + (r.server_calls || 0), 0) / list.length * 10) / 10 };
    }).sort((a, b) => b.n - a.n);
}

// GET /api/perf/summary?days=7&site=makkah — page timings grouped every useful way, recent errors, feedback stars per page
async function perfSummary(url, env, me) {
    const days = Math.min(90, Math.max(1, Number(url.searchParams.get('days')) || 7));
    const site = perfSite(me, url.searchParams.get('site'));
    const since = new Date(Date.now() - days * 864e5).toISOString();
    await env.DB.prepare('DELETE FROM perf_events WHERE at < ?').bind(new Date(Date.now() - 90 * 864e5).toISOString()).run();
    const where = `at >= ?${SITES[site] ? ' AND site = ?' : ''}`, args = SITES[site] ? [since, site] : [since];
    const [ev, fb] = await env.DB.batch([
        env.DB.prepare(`SELECT at, kind, page, site, ms_total, ms_server, server_calls, long_ms, lcp, inp, cls, ttfb, dom_ready, load_ms,
            device, os, browser, app, net_type, rtt, colo, country, build, err, desk FROM perf_events WHERE ${where} ORDER BY at DESC LIMIT 60000`).bind(...args),
        env.DB.prepare(`SELECT page, rating FROM feedback WHERE ${where}`).bind(...args),
    ]);
    const all = ev.results, routes = all.filter(r => r.kind === 'route'), loads = all.filter(r => r.kind === 'load');
    const errors = all.filter(r => r.kind === 'error');
    const stars = new Map();
    for (const f of fb.results) { const s = stars.get(f.page) || { n: 0, sum: 0 }; s.n++; s.sum += f.rating; stars.set(f.page, s); }
    const pages = perfGroups(routes, r => r.page).map(g => ({ ...g, errors: errors.filter(e => e.page === g.key).length,
        stars: stars.has(g.key) ? Math.round(stars.get(g.key).sum / stars.get(g.key).n * 10) / 10 : null, ratings: stars.get(g.key)?.n || 0 }));
    const ms = routes.map(r => r.ms_total).filter(x => x != null);
    const v = (k) => loads.map(r => r[k]).filter(x => x != null);
    return json({
        days, site: SITES[site] ? site : null, since,
        totals: { routes: routes.length, loads: loads.length, errors: errors.length, p50: pct(ms, .5), p95: pct(ms, .95),
            desks: new Set(all.map(r => r.desk)).size, feedback: fb.results.length,
            stars: fb.results.length ? Math.round(fb.results.reduce((s, f) => s + f.rating, 0) / fb.results.length * 10) / 10 : null },
        vitals: { ttfb: pct(v('ttfb'), .5), dom_ready: pct(v('dom_ready'), .5), load: pct(v('load_ms'), .5), lcp: pct(v('lcp'), .5), inp: pct(routes.map(r => r.inp).filter(x => x != null), .75), cls: pct(v('cls'), .75) },
        pages,
        device: perfGroups(routes, r => r.device), browser: perfGroups(routes, r => r.browser), os: perfGroups(routes, r => r.os),
        app: perfGroups(routes, r => r.app), net: perfGroups(routes, r => r.net_type), site_groups: perfGroups(routes, r => r.site),
        colo: perfGroups(routes, r => r.colo && `${r.colo} (${r.country || '?'})`), build: perfGroups(routes, r => r.build).sort((a, b) => String(b.key).localeCompare(String(a.key))).slice(0, 12),
        day: perfGroups(routes, r => String(r.at).slice(0, 10)).sort((a, b) => a.key.localeCompare(b.key)),
        errors: errors.slice(0, 40).map(r => ({ at: r.at, page: r.page, err: r.err, desk: r.desk, browser: r.browser, device: r.device })),
    });
}

async function listFeedback(url, env, me) {
    const days = Math.min(365, Math.max(1, Number(url.searchParams.get('days')) || 30));
    const since = new Date(Date.now() - days * 864e5).toISOString();
    const site = perfSite(me, null);
    const { results } = await env.DB.prepare(`SELECT id, at, desk, site, role, page, trigger, rating, tags, text, page_ms, device, browser, net_type, colo, country, build, status
        FROM feedback WHERE at >= ?${site ? ' AND site = ?' : ''} ORDER BY id DESC LIMIT 1000`).bind(...(site ? [since, site] : [since])).all();
    return json({ feedback: results });
}

// The Slip page sends one record each time Save / Edit / Save as a copy is refused (views/slip/view.js): what was
// entered, every room's capacity and where it came from, the other groups' stays that clashed, and how fresh this
// browser's copy of the slips was. detail is that record as JSON (≤ 24 kB); kinds / rooms are copied out for filters.
async function postSlipDenials(req, env, me) {
    const { denials, ctx } = await body(req);
    if (!Array.isArray(denials)) throw new HttpError(400, 'denials must be a list.');
    const c = ctx && typeof ctx === 'object' ? ctx : {};
    const stmts = denials.slice(0, 20).filter(d => d && typeof d === 'object').map(d => {
        const issues = Array.isArray(d.issues) ? d.issues : [];
        let detail = JSON.stringify(d);
        if (detail.length > 24000) detail = JSON.stringify({ ...d, ok_rooms: undefined, rows: undefined, truncated: true }).slice(0, 24000);
        return env.DB.prepare(`INSERT INTO slip_denials (at, desk_id, desk, site, role, action, sh_no, slip_id, building, kinds, rooms, detail, device, browser, build)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).bind(tAt(d.at), me.id, me.name, tStr(d.site || me.site, 10), me.role, tStr(d.action, 12),
            tStr(d.sh_no, 30), tInt(d.slip_id, 1e12), tStr(d.building, 60), tStr([...new Set(issues.map(x => x && x.kind).filter(Boolean))].join(','), 80),
            tStr([...new Set(issues.map(x => x && x.room).filter(Boolean))].join(','), 300), detail.replace(/[<>]/g, ''),
            tStr(c.device, 10), tStr(c.browser, 20), tStr(c.build, 20));
    });
    if (stmts.length) await env.DB.batch(stmts);
    return json({ ok: true, saved: stmts.length });
}

// GET /api/slip-denials?days=7&site=makkah — newest first
async function listSlipDenials(url, env, me) {
    const days = Math.min(90, Math.max(1, Number(url.searchParams.get('days')) || 7));
    const site = perfSite(me, url.searchParams.get('site'));
    const since = new Date(Date.now() - days * 864e5).toISOString();
    await env.DB.prepare('DELETE FROM slip_denials WHERE at < ?').bind(new Date(Date.now() - 90 * 864e5).toISOString()).run();
    const { results } = await env.DB.prepare(`SELECT id, at, desk, site, role, action, sh_no, slip_id, building, kinds, rooms, detail, device, browser, build
        FROM slip_denials WHERE at >= ?${SITES[site] ? ' AND site = ?' : ''} ORDER BY id DESC LIMIT 1000`).bind(...(SITES[site] ? [since, site] : [since])).all();
    return json({ denials: results });
}

async function patchFeedback(req, env, id, me) {
    const { status } = await body(req);
    if (!['new', 'seen', 'handled'].includes(status)) throw new HttpError(400, 'status: new, seen or handled.');
    if (me.role === 'siteadmin' && (await env.DB.prepare('SELECT site FROM feedback WHERE id = ?').bind(id).first('site')) !== me.site) throw new HttpError(403, 'That feedback is from another site.');
    await env.DB.prepare('UPDATE feedback SET status = ? WHERE id = ?').bind(status, id).run();
    return json({ ok: true });
}

/* ------------------------------ issue reports ------------------------------ */
// A desk presses "Facing an issue?" and the browser sends: what they typed, a JPEG of what they were looking at (optional, ≤ 900 kB), and a diagnostics record
// (window size, device, recent errors and failed calls, the page's visible text …) as JSON. The table is created on first use. Kept 180 days.
// The passport release slip log: one row for every slip printed on Accounts → Passport slip. The table is created on first use. A login sees its own site's rows; the owner admin either site's.
let passportReady = false;
async function ensurePassportLog(env) {
    if (passportReady) return;
    await env.DB.batch([
        env.DB.prepare(`CREATE TABLE IF NOT EXISTS passport_log (
            id INTEGER PRIMARY KEY AUTOINCREMENT, at TEXT NOT NULL, site TEXT NOT NULL, sh_no TEXT, tour TEXT, leader TEXT, pax INTEGER, building TEXT, rooms TEXT, desk_id INTEGER, desk TEXT)`),
        env.DB.prepare('CREATE INDEX IF NOT EXISTS passport_log_site_at ON passport_log(site, at)'),
    ]);
    passportReady = true;
}
const passportSite = (me, asked) => (me.role === 'admin' && SITES[asked] ? asked : me.site);
async function postPassportLog(req, env, me) {
    requireAdminOrDesk(me);
    const f = await body(req);
    const sh = tStr(f.sh_no, 30) || '';
    if (!sh) throw new HttpError(400, 'sh_no is required.');
    await ensurePassportLog(env);
    await env.DB.prepare('INSERT INTO passport_log (at, site, sh_no, tour, leader, pax, building, rooms, desk_id, desk) VALUES (?,?,?,?,?,?,?,?,?,?)')
        .bind(new Date().toISOString(), passportSite(me, f.site), sh, tStr(f.tour, 120) || '', tStr(f.leader, 120) || '', tInt(f.pax, 100000) || 0, tStr(f.building, 60) || '', tStr(f.rooms, 400) || '', me.id, me.name).run();
    return json({ ok: true });
}
async function listPassportLog(url, env, me) {
    await ensurePassportLog(env);
    const { results } = await env.DB.prepare('SELECT id, at, site, sh_no, tour, leader, pax, building, rooms, desk FROM passport_log WHERE site = ? ORDER BY id DESC LIMIT 300')
        .bind(passportSite(me, url.searchParams.get('site'))).all();
    return json({ log: results });
}

let issuesReady = false;
async function ensureIssues(env) {
    if (issuesReady) return;
    await env.DB.batch([
        env.DB.prepare(`CREATE TABLE IF NOT EXISTS issue_reports (
            id INTEGER PRIMARY KEY AUTOINCREMENT, at TEXT NOT NULL, desk_id INTEGER, desk TEXT, site TEXT, role TEXT, page TEXT, url TEXT, text TEXT,
            viewport TEXT, device TEXT, browser TEXT, build TEXT, shot TEXT, diag TEXT, colo TEXT, country TEXT,
            status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'seen', 'handled')))`),
        env.DB.prepare('CREATE INDEX IF NOT EXISTS issue_reports_at ON issue_reports(at)'),
    ]);
    issuesReady = true;
}

async function postIssue(req, env, me) {
    const f = await body(req);
    const text = tStr(f.text, 2000) || '';
    if (text.trim().length < 3) throw new HttpError(400, 'Write a few words about what went wrong.');
    let shot = typeof f.shot === 'string' && /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(f.shot) ? f.shot : '';
    if (shot.length > 900000) shot = '';
    let diag = JSON.stringify(f.diag && typeof f.diag === 'object' ? f.diag : {});
    if (diag.length > 60000) { const d = { ...f.diag, dom: String(f.diag.dom || '').slice(0, 4000) }; diag = JSON.stringify(d).slice(0, 60000); }
    const v = f.diag?.viewport || {}, cf = req.cf || {}, c = f.diag?.ctx || {};
    await ensureIssues(env);
    const r = await env.DB.prepare(`INSERT INTO issue_reports (at, desk_id, desk, site, role, page, url, text, viewport, device, browser, build, shot, diag, colo, country)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).bind(now(), me.id, me.name, tStr(f.site || me.site, 10), me.role, tStr(f.page, 40), tStr(f.url, 300), text,
        tStr(`${tInt(v.w, 20000) ?? '?'}×${tInt(v.h, 20000) ?? '?'}@${tNum(v.dpr, 10) ?? 1}`, 24), tStr(c.device, 10), tStr(`${c.browser || ''} ${c.browser_ver || ''}`.trim(), 40), tStr(c.build, 20),
        shot, diag.replace(/[<>]/g, ''), tStr(cf.colo, 8), tStr(cf.country, 4)).run();
    return json({ ok: true, id: r.meta?.last_row_id ?? null });
}

async function listIssues(url, env, me) {
    await ensureIssues(env);
    const days = Math.min(365, Math.max(1, Number(url.searchParams.get('days')) || 30));
    await env.DB.prepare('DELETE FROM issue_reports WHERE at < ?').bind(new Date(Date.now() - 180 * 864e5).toISOString()).run();
    const { results } = await env.DB.prepare(`SELECT id, at, desk, site, role, page, url, text, viewport, device, browser, build, colo, country, status, length(shot) > 0 AS has_shot
        FROM issue_reports WHERE at >= ?${me.role === 'siteadmin' ? ' AND site = ?' : ''} ORDER BY id DESC LIMIT 500`).bind(...[new Date(Date.now() - days * 864e5).toISOString(), ...(me.role === 'siteadmin' ? [me.site] : [])]).all();
    return json({ issues: results });
}

async function getIssue(env, id, me) {
    await ensureIssues(env);
    const row = await env.DB.prepare('SELECT * FROM issue_reports WHERE id = ?').bind(id).first();
    if (!row || (me.role === 'siteadmin' && row.site !== me.site)) throw new HttpError(404, 'No such report.');
    let diag = {}; try { diag = JSON.parse(row.diag || '{}'); } catch { /* keep empty */ }
    return json({ issue: { ...row, diag } });
}

async function patchIssue(req, env, id, me) {
    const { status } = await body(req);
    if (!['new', 'seen', 'handled'].includes(status)) throw new HttpError(400, 'status: new, seen or handled.');
    await ensureIssues(env);
    if (me.role === 'siteadmin' && (await env.DB.prepare('SELECT site FROM issue_reports WHERE id = ?').bind(id).first('site')) !== me.site) throw new HttpError(403, 'That report is from another site.');
    await env.DB.prepare('UPDATE issue_reports SET status = ? WHERE id = ?').bind(status, id).run();
    return json({ ok: true });
}
