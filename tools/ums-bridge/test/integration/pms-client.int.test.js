// The PMS website's client module (pms/app/core/ums-bridge.js) talking to a real bridge (real Chrome) in front of the mock UMS: the whole chain the PMS page uses.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { startMockSite } from './mock-site.js';
import { loadConfig } from '../../src/config.js';
import { createLogger } from '../../src/logger.js';
import { UmsBridge } from '../../src/bridge.js';
import { createServer } from '../../src/server.js';

let havePw = true;
try { await import('playwright'); } catch { havePw = false; }
const opts = { skip: havePw ? false : 'playwright is not installed' };

// the PMS module expects a browser: a minimal localStorage / window
const store = new Map();
globalThis.localStorage = { getItem: (k) => store.get(k) ?? null, setItem: (k, v) => store.set(k, String(v)), removeItem: (k) => store.delete(k) };
globalThis.window = globalThis.window || { dispatchEvent() {} };
globalThis.CustomEvent = globalThis.CustomEvent || class { constructor(n, o) { this.type = n; this.detail = o?.detail; } };
const client = await import('../../../../pms/app/core/ums-bridge.js');

test('PMS client → bridge API → real browser → mock UMS: status, login job, table, export', opts, async () => {
    const site = await startMockSite();
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'umsb-pms-'));
    const TOKEN = 'p'.repeat(32);
    const cfg = loadConfig({ UMS_SESSION_KEY: Buffer.alloc(32, 9).toString('base64'), UMS_USERNAME: site.user, UMS_PASSWORD: site.pass, UMS_BROWSER_CHANNEL: process.env.UMS_BROWSER_CHANNEL || '', UMS_BRIDGE_TOKEN: TOKEN, UMS_LOG_LEVEL: 'silent' }, { baseUrl: site.url, dataDir: dir });
    cfg.selectors = { ...cfg.selectors, username: '#ctl00_txtUser', loggedIn: '#lnkLogout' };
    const bridge = new UmsBridge(cfg, { logger: createLogger({ level: 'silent' }) });
    const srv = createServer(bridge, cfg, createLogger({ level: 'silent' }));
    await new Promise(r => srv.listen(0, '127.0.0.1', r));
    try {
        client.setConfig({ url: `http://127.0.0.1:${srv.address().port}` });
        assert.deepEqual(await client.status(), { running: true, paired: false });          // answering, but not paired yet
        client.setConfig({ token: TOKEN });
        assert.equal((await client.status()).paired, true);
        await client.login({ pollMs: 100 });                                                // logs in (credentials mode here)
        assert.equal((await client.status()).authenticated, true);
        const t = await client.extractTable({ path: '/GroupList.aspx', selector: '#gv', paged: true }, { pollMs: 100 });
        assert.equal(t.records.length, 7);
        const r = await client.run('/v1/export', { path: '/GroupList.aspx', inline: true }, { pollMs: 100 });
        assert.match(Buffer.from(r.base64, 'base64').toString('utf8'), /SH Ref/);
    } finally { srv.close(); await bridge.close(); await site.close(); }
});
