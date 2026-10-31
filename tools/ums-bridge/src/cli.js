#!/usr/bin/env node
// ums-bridge <command>
//   login [--then export|status] [--path P] [--out FILE]
//                      opens a visible browser at the UMS login page; YOU type the credentials, solve the CAPTCHA and press Login. When you are in, the session is
//                      stored and Playwright carries on in the same window (--then), or the command just ends with the session saved.
//   status             what is stored / whether the session is still good
//   export [--path /GroupList.aspx] [--out file.xls]   press the page's Export control and save the file
//   record [--name N] [--path P]   RECORDING MODE: a visible browser opens at the UMS; you log in and use it normally and every page / UpdatePanel change / request is
//                      written to .ums-bridge/recordings/<time>-<name>/ (Enter = snapshot now, type a label first; q = finish)
//   serve              start the local HTTP API
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { assertCanServe, loadConfig } from './config.js';
import { createLogger } from './logger.js';
import { UmsBridge } from './bridge.js';
import { createServer } from './server.js';
import { isBridgeError } from './errors.js';
import readline from 'node:readline';
import { BrowserManager } from './browser.js';
import { SessionStore } from './session-store.js';
import { Recorder } from './recorder.js';

const [cmd, ...rest] = process.argv.slice(2);
const flag = (n) => { const i = rest.indexOf(`--${n}`); return i >= 0 ? rest[i + 1] : undefined; };

async function main() {
    const cfg = loadConfig();
    const logger = createLogger({ level: cfg.logLevel, file: cfg.logFile });
    if (cmd === 'serve') {
        // no token given: a random one is made once and kept (0600) — paste it into the PMS (UMS page → Bridge) one time on this computer
        if (!cfg.api.token) {
            try { cfg.api.token = fs.readFileSync(cfg.api.tokenFile, 'utf8').trim(); } catch { /* make one */ }
            if (!cfg.api.token) { cfg.api.token = crypto.randomBytes(24).toString('base64url'); fs.mkdirSync(path.dirname(cfg.api.tokenFile), { recursive: true }); fs.writeFileSync(cfg.api.tokenFile, cfg.api.token, { mode: 0o600 }); }
            console.error(`\nBridge token (paste it into the PMS, UMS page → Bridge, once):\n  ${cfg.api.token}\n`);
        }
        assertCanServe(cfg);
        const bridge = new UmsBridge(cfg, { logger });
        bridge.on('captcha:required', (e) => logger.warn('PERSON NEEDED: complete the CAPTCHA / login in the browser window', e));
        const server = createServer(bridge, cfg, logger);
        server.listen(cfg.api.port, cfg.api.host, () => logger.info('API listening', { host: cfg.api.host, port: cfg.api.port }));
        const stop = async () => { server.close(); await bridge.close(); process.exit(0); };
        process.on('SIGINT', stop); process.on('SIGTERM', stop);
        return;
    }
    if (cmd === 'record') return record(cfg, createLogger({ level: 'warn', file: cfg.logFile }));
    if (!['login', 'status', 'export'].includes(cmd)) { console.error('Usage: ums-bridge login | status | export [--path P] [--out FILE] | serve'); process.exit(2); }
    // from the command line a person is at the machine: the browser is visible, and "login" never types credentials — the person does, the formal way
    if (cmd === 'login') { cfg.browser.headless = false; cfg.manualLogin = true; }
    const bridge = new UmsBridge(cfg, { logger });
    bridge.on('captcha:required', (e) => console.error(e.reason === 'manual-login'
        ? `\nA browser window is open at ${new URL(cfg.loginPath, cfg.baseUrl).href}\nEnter your credentials, complete the CAPTCHA and press Login. This window waits (up to ${Math.round(cfg.captcha.timeoutMs / 60000)} min)…`
        : 'A person is needed: complete the CAPTCHA in the browser window. Waiting…'));
    bridge.on('captcha:resolved', () => console.error('Thank you — carrying on.'));
    try {
        if (cmd === 'status') { console.log(JSON.stringify(bridge.status(), null, 2)); return; }
        if (cmd === 'login') {
            const r = await bridge.login();
            console.log(JSON.stringify({ loggedIn: r.authenticated, sessionStored: r.storedSessionAgeS != null }, null, 2));
            const then = flag('then');
            if (then === 'status') console.log(JSON.stringify(bridge.status(), null, 2));
            if (then === 'export') await doExport();
            return;
        }
        if (cmd === 'export') await doExport();
        async function doExport() {
            const r = await bridge.exportFile({ path: flag('path') });
            const out = flag('out') || r.path || r.fileName;
            fs.writeFileSync(out, r.body);
            console.log(JSON.stringify({ fileName: r.fileName, bytes: r.bytes, saved: out }, null, 2));
        }
    } finally { await bridge.close(); }
}

async function record(cfg, logger) {
    const store = new SessionStore({ ...cfg.session, logger });
    const bm = new BrowserManager(cfg, logger, store);
    await bm.start({ headed: true });
    const rec = new Recorder({ dir: cfg.dataDir, logger, name: flag('name') || 'session' });
    rec.onStep = (s) => console.error(`  #${s.n} ${s.trigger.padEnd(15)} ${s.url}${s.click ? `   ← ${s.click.tag}${s.click.id ? '#' + s.click.id : ''} ${s.click.text || ''}`.slice(0, 80) : ''}`);
    await rec.attach(bm.context);
    await bm.goto(flag('path') || cfg.loginPath);
    console.error(`
RECORDING → ${rec.dir}
A browser window is open at the UMS. Log in yourself (credentials, CAPTCHA, Login), then use the screens you want recorded:
open each page, search, page through, press every button you would want automated.
  Enter (optionally after typing a label)  take a snapshot now      q + Enter  stop and save
`);
    const done = new Promise((resolve) => {
        const rl = readline.createInterface({ input: process.stdin });
        rl.on('line', async (line) => { const t = line.trim(); if (/^q(uit)?$/i.test(t)) { rl.close(); resolve(); } else { await rec.snapshot(bm.page, { trigger: 'manual', label: t }).catch(() => {}); } });
        rl.on('close', resolve);
        bm.page.on('close', () => { rl.close(); resolve(); });
        bm.context.on('close', resolve);
    });
    await done;
    const out = await rec.finish();
    await bm.close();
    console.error(`
Saved ${out.steps} step(s) in:
  ${out.dir}
Give that folder to Claude.`);
}

main().catch((e) => {
    if (isBridgeError(e)) { console.error(`${e.code}: ${e.message}`); process.exit(e.code === 'CAPTCHA_REQUIRED' || e.code === 'CAPTCHA_TIMEOUT' ? 3 : 1); }
    console.error(e); process.exit(1);
});
