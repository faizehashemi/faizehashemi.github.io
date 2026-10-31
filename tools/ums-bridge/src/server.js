// A small HTTP API in front of the bridge, for the middleware. Localhost only, bearer-token protected, JSON in / JSON out.
//   GET  /health                      no auth: { ok: true }
//   GET  /v1/status                   state, whether a person is needed ("awaiting_human"), session age
//   POST /v1/login                    log in (or confirm the session)
//   POST /v1/logout
//   POST /v1/goto                     { path }
//   POST /v1/forms/submit             { path?, fields?, submit?, expect? }
//   POST /v1/extract/table            { path?, selector, fields?, submit?, paged?, nextSelector?, maxPages? }
//   POST /v1/export                   { path?, fields?, control?, inline? }   (inline: true returns the file as base64)
// Browsers: the PMS pages (UMS_ALLOWED_ORIGINS) may call it with fetch — CORS and Chrome's Private Network Access preflight are answered; any other origin or a non-loopback Host is refused.
// Add "?async=1" to any POST to get 202 { jobId } at once and poll GET /v1/jobs/:id — the right way to call it when a CAPTCHA may need a person.
import crypto from 'node:crypto';
import http from 'node:http';
import { BridgeError } from './errors.js';

const MAX_BODY = 1_000_000;
const LOOPBACK_HOST = /^(127\.0\.0\.1|localhost|\[::1\])(:\d+)?$/i;
const LOOPBACK_ORIGIN = /^https?:\/\/(127\.0\.0\.1|localhost|\[::1\])(:\d+)?$/i;

function readJson(req) {
    return new Promise((resolve, reject) => {
        let size = 0; const chunks = [];
        req.on('data', (c) => { size += c.length; if (size > MAX_BODY) { reject(new BridgeError('Request too large.', { code: 'TOO_LARGE', status: 413 })); req.destroy(); } else chunks.push(c); });
        req.on('end', () => { try { resolve(chunks.length ? JSON.parse(Buffer.concat(chunks).toString('utf8')) : {}); } catch { reject(new BridgeError('Body is not valid JSON.', { code: 'BAD_JSON', status: 400 })); } });
        req.on('error', reject);
    });
}

const tokenOk = (given, want) => { const a = Buffer.from(String(given)), b = Buffer.from(String(want)); return a.length === b.length && crypto.timingSafeEqual(a, b); };

export function createServer(bridge, cfg, logger) {
    const jobs = new Map();   // id → { status, result?, error?, at }
    const keep = (id) => setTimeout(() => jobs.delete(id), 30 * 60 * 1000).unref();
    const strip = (r) => (r && r.body ? (({ body, ...rest }) => rest)(r) : r);

    const routes = {
        'POST /v1/login': () => bridge.login(),
        'POST /v1/logout': () => bridge.logout(),
        'POST /v1/goto': (b) => { need(b, 'path'); return bridge.goto(b.path); },
        'POST /v1/forms/submit': (b) => bridge.submitForm(b),
        'POST /v1/extract/table': (b) => { need(b, 'selector'); return bridge.extractTable(b); },
        'POST /v1/export': async (b) => { const r = await bridge.exportFile(b); return b.inline ? { ...strip(r), base64: r.body.toString('base64') } : strip(r); },
    };
    function need(b, k) { if (!b[k]) throw new BridgeError(`"${k}" is required.`, { code: 'BAD_REQUEST', status: 400 }); }

    const send = (res, status, obj) => { const s = JSON.stringify(obj); res.writeHead(status, { 'content-type': 'application/json', 'cache-control': 'no-store', 'content-length': Buffer.byteLength(s) }); res.end(s); };

    const originOk = (o) => cfg.api.allowedOrigins.includes(o) || LOOPBACK_ORIGIN.test(o);

    const server = http.createServer(async (req, res) => {
        const url = new URL(req.url, 'http://x');
        try {
            // Only the bridge's own address may be used (a rebinding page that points its name at 127.0.0.1 is refused), and only the PMS pages may script it.
            if (!LOOPBACK_HOST.test(String(req.headers.host || '')) && !cfg.api.behindProxy) return send(res, 403, { error: 'FORBIDDEN_HOST', message: 'Use the bridge by its localhost address.' });
            const origin = req.headers.origin;
            if (origin) {
                if (!originOk(origin)) return send(res, 403, { error: 'FORBIDDEN_ORIGIN', message: `${origin} may not use this bridge. Add it to UMS_ALLOWED_ORIGINS if it should.` });
                res.setHeader('access-control-allow-origin', origin);
                res.setHeader('vary', 'Origin');
            }
            if (req.method === 'OPTIONS') {   // CORS preflight, incl. Chrome's Private Network Access (an https page calling a local address)
                const h = { 'access-control-allow-methods': 'GET, POST, OPTIONS', 'access-control-allow-headers': 'authorization, content-type', 'access-control-max-age': '600' };
                if (req.headers['access-control-request-private-network']) h['access-control-allow-private-network'] = 'true';
                res.writeHead(204, h); return res.end();
            }
            if (req.method === 'GET' && url.pathname === '/health') return send(res, 200, { ok: true, name: 'ums-bridge' });
            const auth = String(req.headers.authorization || '');
            if (!auth.startsWith('Bearer ') || !tokenOk(auth.slice(7), cfg.api.token)) return send(res, 401, { error: 'UNAUTHORIZED', message: 'Missing or wrong bearer token.' });
            if (req.method === 'GET' && url.pathname === '/v1/status') return send(res, 200, bridge.status());
            const jm = url.pathname.match(/^\/v1\/jobs\/([\w-]+)$/);
            if (req.method === 'GET' && jm) { const j = jobs.get(jm[1]); return j ? send(res, 200, j) : send(res, 404, { error: 'NOT_FOUND', message: 'No such job (they are kept 30 minutes).' }); }
            const handler = routes[`${req.method} ${url.pathname}`];
            if (!handler) return send(res, 404, { error: 'NOT_FOUND', message: `No route ${req.method} ${url.pathname}` });
            const body = req.method === 'POST' ? await readJson(req) : {};
            logger.info('api call', { route: `${req.method} ${url.pathname}`, fields: body.fields ? Object.keys(body.fields) : undefined });
            const p = Promise.resolve().then(() => handler(body));
            if (url.searchParams.get('async') === '1') {
                const id = crypto.randomUUID();
                jobs.set(id, { id, status: 'running', at: new Date().toISOString() }); keep(id);
                p.then(r => jobs.set(id, { id, status: 'done', result: strip(r), at: new Date().toISOString() }),
                    e => jobs.set(id, { id, status: 'error', error: e instanceof BridgeError ? e.toJSON() : { error: 'INTERNAL', message: e.message }, at: new Date().toISOString() }));
                return send(res, 202, { jobId: id, poll: `/v1/jobs/${id}` });
            }
            return send(res, 200, await p);
        } catch (e) {
            if (e instanceof BridgeError) return send(res, e.status, e.toJSON());
            logger.error('api failure', { error: e });
            return send(res, 500, { error: 'INTERNAL', message: 'Unexpected error; see the bridge log.' });
        }
    });
    server.requestTimeout = 0;   // a call may wait for a person (CAPTCHA); callers should prefer ?async=1
    return server;
}
