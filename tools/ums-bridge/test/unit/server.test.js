import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from '../../src/server.js';
import { createLogger } from '../../src/logger.js';
import { CaptchaRequiredError } from '../../src/errors.js';
import { loadConfig } from '../../src/config.js';

const TOKEN = 't'.repeat(32);
const quiet = createLogger({ level: 'silent' });

function boot(bridge) {
    const cfg = loadConfig({ UMS_BRIDGE_TOKEN: TOKEN });
    const srv = createServer(bridge, cfg, quiet);
    return new Promise(res => srv.listen(0, '127.0.0.1', () => res({ srv, url: `http://127.0.0.1:${srv.address().port}` })));
}
const call = (url, p, { method = 'GET', body, token = TOKEN } = {}) => fetch(url + p, { method, headers: { ...(token ? { authorization: `Bearer ${token}` } : {}), 'content-type': 'application/json' }, body: body ? JSON.stringify(body) : undefined }).then(async r => ({ status: r.status, json: await r.json() }));

test('API: health is open, everything else needs the token', async () => {
    const { srv, url } = await boot({ status: () => ({ state: 'ready' }) });
    try {
        assert.equal((await call(url, '/health', { token: '' })).status, 200);
        assert.equal((await call(url, '/v1/status', { token: '' })).status, 401);
        assert.equal((await call(url, '/v1/status', { token: 'wrong' + TOKEN })).status, 401);
        assert.deepEqual((await call(url, '/v1/status')).json, { state: 'ready' });
    } finally { srv.close(); }
});

test('API: bridge errors map to their status; a CAPTCHA the bridge may not show is a 409; bad input is a 400', async () => {
    const { srv, url } = await boot({
        goto: async () => { throw new CaptchaRequiredError('recaptcha'); },
        extractTable: async () => ({ headers: ['a'], rows: [['1']], records: [{ a: '1' }] }),
    });
    try {
        const c = await call(url, '/v1/goto', { method: 'POST', body: { path: '/x' } });
        assert.equal(c.status, 409); assert.equal(c.json.error, 'CAPTCHA_REQUIRED'); assert.equal(c.json.details.kind, 'recaptcha');
        assert.equal((await call(url, '/v1/goto', { method: 'POST', body: {} })).status, 400);
        assert.equal((await call(url, '/v1/extract/table', { method: 'POST', body: {} })).status, 400);
        assert.deepEqual((await call(url, '/v1/extract/table', { method: 'POST', body: { selector: '#t' } })).json.records, [{ a: '1' }]);
        assert.equal((await call(url, '/v1/nope', { method: 'POST', body: {} })).status, 404);
    } finally { srv.close(); }
});

test('API: ?async=1 answers 202 at once and the job can be polled (the way to call it when a person may be needed)', async () => {
    let release;
    const gate = new Promise(r => { release = r; });
    const { srv, url } = await boot({ goto: async () => { await gate; return { url: 'u', title: 't' }; } });
    try {
        const a = await call(url, '/v1/goto?async=1', { method: 'POST', body: { path: '/x' } });
        assert.equal(a.status, 202);
        assert.equal((await call(url, a.json.poll)).json.status, 'running');
        release();
        let j; for (let i = 0; i < 20 && (!j || j.status === 'running'); i++) { await new Promise(r => setTimeout(r, 25)); j = (await call(url, a.json.poll)).json; }
        assert.equal(j.status, 'done'); assert.equal(j.result.title, 't');
    } finally { srv.close(); }
});

test('API: the export file body is not sent unless inline is asked for', async () => {
    const { srv, url } = await boot({ exportFile: async () => ({ fileName: 'a.xls', bytes: 3, body: Buffer.from('abc') }) });
    try {
        assert.equal((await call(url, '/v1/export', { method: 'POST', body: {} })).json.body, undefined);
        assert.equal((await call(url, '/v1/export', { method: 'POST', body: { inline: true } })).json.base64, Buffer.from('abc').toString('base64'));
    } finally { srv.close(); }
});

test('browser access: the PMS origin gets CORS + Private Network Access; other origins and a rebinding Host are refused', async () => {
    const { srv, url } = await boot({ status: () => ({ state: 'ready' }) });
    const raw = (p, { method = 'GET', headers = {} } = {}) => fetch(url + p, { method, headers });
    try {
        const pre = await raw('/v1/status', { method: 'OPTIONS', headers: { origin: 'https://pms.raajsoftware.com', 'access-control-request-method': 'GET', 'access-control-request-private-network': 'true' } });
        assert.equal(pre.status, 204);
        assert.equal(pre.headers.get('access-control-allow-origin'), 'https://pms.raajsoftware.com');
        assert.equal(pre.headers.get('access-control-allow-private-network'), 'true');
        assert.match(pre.headers.get('access-control-allow-headers'), /authorization/);
        const ok = await raw('/v1/status', { headers: { origin: 'https://pms.raajsoftware.com', authorization: `Bearer ${TOKEN}` } });
        assert.equal(ok.status, 200); assert.equal(ok.headers.get('access-control-allow-origin'), 'https://pms.raajsoftware.com');
        const evil = await raw('/v1/status', { headers: { origin: 'https://evil.example', authorization: `Bearer ${TOKEN}` } });
        assert.equal(evil.status, 403); assert.equal(evil.headers.get('access-control-allow-origin'), null);
        assert.equal((await raw('/health', { headers: { origin: 'http://localhost:8766' } })).status, 200, 'a local dev server is allowed');
        // a Host that is not the loopback address (DNS rebinding) is refused even without an Origin; fetch cannot set Host, so use http.request
        const http = await import('node:http');
        const code = await new Promise((res) => { const r = http.request(url + '/health', { headers: { host: 'rebind.example.com' } }, (x) => { x.resume(); res(x.statusCode); }); r.end(); });
        assert.equal(code, 403);
    } finally { srv.close(); }
});
