// Runs the real bridge in a real browser against the mock site. Skipped when Playwright is not installed.
//   npm install            (the playwright package)
//   UMS_BROWSER_CHANNEL=chrome npm run test:int      (uses the Chrome / Edge already on the machine, no browser download)
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { startMockSite } from './mock-site.js';
import { loadConfig } from '../../src/config.js';
import { createLogger } from '../../src/logger.js';
import { UmsBridge } from '../../src/bridge.js';
import { CaptchaRequiredError, AuthError } from '../../src/errors.js';

let havePw = true;
try { await import('playwright'); } catch { havePw = false; }
const opts = { skip: havePw ? false : 'playwright is not installed (npm install in tools/ums-bridge)' };

const quiet = createLogger({ level: 'silent' });
const KEY = Buffer.alloc(32, 7).toString('base64');
function make(site, extra = {}, dir = fs.mkdtempSync(path.join(os.tmpdir(), 'umsb-int-'))) {
    const cfg = loadConfig({ UMS_SESSION_KEY: KEY, UMS_USERNAME: site.user, UMS_PASSWORD: site.pass, UMS_BROWSER_CHANNEL: process.env.UMS_BROWSER_CHANNEL || '', UMS_LOG_LEVEL: 'silent' },
        { baseUrl: site.url, dataDir: dir, ...extra });
    cfg.captcha = { ...cfg.captcha, pollMs: 50, timeoutMs: 8000, ...(extra.captcha || {}) };
    cfg.selectors = { ...cfg.selectors, username: '#ctl00_txtUser', loggedIn: '#lnkLogout' };
    return { bridge: new UmsBridge(cfg, { logger: quiet }), dir, cfg };
}

test('logs in, stores the session encrypted, reads a filtered, paged GridView', opts, async () => {
    const site = await startMockSite();
    const { bridge, dir } = make(site);
    try {
        await bridge.login();
        assert.equal(site.stats.logins, 1);
        const stored = fs.readFileSync(path.join(dir, 'session.enc'));
        assert.ok(!stored.includes('sid='), 'session file is encrypted');
        const t = await bridge.extractTable({ path: '/GroupList.aspx', selector: '#gv', paged: true });
        assert.equal(t.records.length, 7);
        assert.equal(t.records[0]['SH Ref'], '44000');
        const f = await bridge.extractTable({ path: '/GroupList.aspx', fields: { txtFrom: '05/10/2026' }, submit: 'btnSearch', selector: '#gv' });
        assert.equal(f.records.length, 3);
    } finally { await bridge.close(); await site.close(); }
});

test('a second run reuses the stored session without logging in again', opts, async () => {
    const site = await startMockSite();
    const first = make(site);
    const second = make(site, {}, first.dir);
    try {
        await first.bridge.login(); await first.bridge.close();
        await second.bridge.goto('/GroupList.aspx');
        assert.equal(site.stats.logins, 1, 'no second login');
    } finally { await second.bridge.close(); await site.close(); }
});

test('an expired session is noticed and the bridge logs in again and finishes the job', opts, async () => {
    const site = await startMockSite();
    const { bridge } = make(site);
    try {
        await bridge.login();
        let expired = 0; bridge.on('session:expired', () => expired++);
        site.expireSessions();
        const t = await bridge.extractTable({ path: '/GroupList.aspx', selector: '#gv' });
        assert.equal(t.records.length, 4);
        assert.equal(site.stats.logins, 2); assert.equal(expired, 1);
    } finally { await bridge.close(); await site.close(); }
});

test('export captures the attachment', opts, async () => {
    const site = await startMockSite();
    const { bridge } = make(site);
    try {
        const r = await bridge.exportFile({ path: '/GroupList.aspx', control: '#lnkExport' });
        assert.equal(r.fileName, 'GroupList_mock.xls');
        assert.match(r.body.toString('utf8'), /SH Ref/);
        const auto = await bridge.exportFile({ path: '/GroupList.aspx' });     // no control given: finds "Export to Excel"
        assert.equal(auto.fileName, 'GroupList_mock.xls');
    } finally { await bridge.close(); await site.close(); }
});

test('wrong password is an AuthError, not a retry loop', opts, async () => {
    const site = await startMockSite();
    const { bridge, cfg } = make(site);
    cfg.credentials.password = 'wrong';
    try { await assert.rejects(bridge.login(), AuthError); assert.equal(site.stats.logins, 0); }
    finally { await bridge.close(); await site.close(); }
});

test('CAPTCHA: a hidden browser that may not open a window refuses — it never tries to get past it', opts, async () => {
    const site = await startMockSite({ captcha: true });
    const { bridge } = make(site, { captcha: { escalateToHeaded: false, waitInPlace: false } });
    try {
        await assert.rejects(bridge.login(), CaptchaRequiredError);
        assert.equal(site.stats.logins, 0); assert.equal(site.stats.captchaRejects, 0, 'nothing was submitted behind the CAPTCHA');
    } finally { await bridge.close(); await site.close(); }
});

test('CAPTCHA: pauses, announces it, and resumes by itself once a person has completed it', opts, async () => {
    const site = await startMockSite({ captcha: true });
    const { bridge } = make(site, { captcha: { escalateToHeaded: false, waitInPlace: true } });
    const seen = [];
    bridge.on('captcha:required', (e) => seen.push(['required', e.kind]));
    bridge.on('captcha:resolved', () => seen.push(['resolved']));
    try {
        const job = bridge.login();
        // wait until the bridge says it is waiting for a person …
        for (let i = 0; i < 200 && bridge.status().state !== 'awaiting_human'; i++) await new Promise(r => setTimeout(r, 50));
        assert.equal(bridge.status().state, 'awaiting_human'); assert.equal(bridge.status().awaiting.kind, 'recaptcha');
        assert.equal(site.stats.logins, 0, 'nothing submitted while it waits');
        // … then play the person on the MOCK page (sets the mock widget's token; the real UMS is never touched)
        await bridge.bm.page.evaluate(() => { document.getElementById('g-recaptcha-response').value = 'HUMAN-COMPLETED-'.repeat(4); });
        await job;
        assert.equal(site.stats.logins, 1); assert.equal(bridge.status().authenticated, true);
        assert.deepEqual(seen.map(s => s[0]), ['required', 'resolved']);
    } finally { await bridge.close(); await site.close(); }
});

test('CAPTCHA: nobody comes — it times out instead of hanging or guessing', opts, async () => {
    const site = await startMockSite({ captcha: true });
    const { bridge } = make(site, { captcha: { escalateToHeaded: false, waitInPlace: true, timeoutMs: 600 } });
    try { await assert.rejects(bridge.login(), (e) => e.code === 'CAPTCHA_TIMEOUT'); assert.equal(site.stats.logins, 0); }
    finally { await bridge.close(); await site.close(); }
});

test('manual login: the bridge types nothing — a person enters the credentials, solves the CAPTCHA and presses Login; then it carries on', opts, async () => {
    const site = await startMockSite({ captcha: true });
    const { bridge } = make(site, { manualLogin: true, captcha: { escalateToHeaded: false, waitInPlace: true } });
    bridge.cfg.credentials = { username: '', password: '' };
    try {
        const job = bridge.login();
        for (let i = 0; i < 200 && bridge.status().state !== 'awaiting_human'; i++) await new Promise(r => setTimeout(r, 50));
        const st = bridge.status();
        assert.equal(st.state, 'awaiting_human'); assert.equal(st.awaiting.reason, 'manual-login');
        assert.equal(await bridge.bm.page.inputValue('#ctl00_txtUser'), '', 'the bridge did not type a user name');
        // the "person" (a test playing one on the MOCK page): credentials, CAPTCHA, Login button
        const p = bridge.bm.page;
        await p.fill('#ctl00_txtUser', site.user); await p.fill('#ctl00_txtPass', site.pass);
        await p.evaluate(() => { document.getElementById('g-recaptcha-response').value = 'HUMAN-COMPLETED-'.repeat(4); });
        await new Promise(r => setTimeout(r, 300));
        assert.equal(site.stats.logins, 0, 'a solved CAPTCHA alone does not end the wait; the person still has to press Login');
        await p.click('input[name="ctl00$btnLogin"]');
        await job;
        assert.equal(site.stats.logins, 1); assert.equal(bridge.status().authenticated, true);
        const t = await bridge.extractTable({ path: '/GroupList.aspx', selector: '#gv' });   // Playwright carries on with the session the person created
        assert.equal(t.records.length, 4);
    } finally { await bridge.close(); await site.close(); }
});

test('recording mode: pages, UpdatePanel changes, clicks, requests (passwords blanked) and downloads are written to a folder', opts, async () => {
    const { Recorder } = await import('../../src/recorder.js');
    const { BrowserManager } = await import('../../src/browser.js');
    const { SessionStore } = await import('../../src/session-store.js');
    const site = await startMockSite();
    const { cfg, dir } = make(site);
    const bm = new BrowserManager(cfg, quiet, new SessionStore({ ...cfg.session, logger: quiet }));
    await bm.start({ headed: false });
    const rec = new Recorder({ dir, logger: quiet, name: 'mock run', settleMs: 250 });
    await rec.attach(bm.context);
    const p = bm.page, settle = () => p.waitForTimeout(700);
    try {
        // the "person": login, open the list, search, export, open the UpdatePanel page and press its button
        await bm.goto('/Login.aspx'); await settle();
        await p.fill('#ctl00_txtUser', site.user); await p.fill('#ctl00_txtPass', site.pass);
        await Promise.all([p.waitForURL('**/GroupList.aspx'), p.click('input[name="ctl00$btnLogin"]')]); await settle();
        await Promise.all([p.waitForLoadState('domcontentloaded'), p.click('input[name="ctl00$ContentPlaceHolder1$btnSearch"]')]); await settle();
        await Promise.all([p.waitForEvent('download'), p.click('#lnkExport')]); await settle();
        await bm.goto('/Panel.aspx'); await settle();
        await p.click('#btnMore'); await settle();
        await rec.snapshot(p, { trigger: 'manual', label: 'my label' });
        const out = await rec.finish();

        const index = JSON.parse(fs.readFileSync(path.join(out.dir, 'index.json'), 'utf8'));
        const triggers = index.steps.map(s => s.trigger);
        assert.ok(index.steps.length >= 5, `steps: ${triggers.join(',')}`);
        assert.ok(triggers.includes('async-postback'), 'the UpdatePanel change was recorded');
        assert.ok(index.steps.some(s => s.label === 'my label'));
        for (const s of index.steps) for (const f of [s.html, s.summary, s.screenshot]) assert.ok(fs.existsSync(path.join(out.dir, f)), f);
        const login = index.steps.find(s => /login/i.test(s.url));
        const sum = JSON.parse(fs.readFileSync(path.join(out.dir, login.summary), 'utf8'));
        assert.ok(sum.forms[0].controls.some(c => c.name === 'ctl00$txtUser'));
        assert.equal(sum.forms[0].controls.find(c => c.type === 'password').value, '[not recorded]');
        const list = JSON.parse(fs.readFileSync(path.join(out.dir, index.steps.find(s => /grouplist/i.test(s.url)).summary), 'utf8'));
        assert.ok(list.postbacks.some(x => x.target === 'ctl00$ContentPlaceHolder1$lnkExport'), 'LinkButton postback target found');
        assert.equal(list.tables[0].headers[1], 'SH Ref');
        assert.ok(list.pagerLinks === undefined && list.tables[0].pagerLinks.length >= 0);
        const reqs = fs.readFileSync(path.join(out.dir, 'requests.jsonl'), 'utf8').trim().split('\n').map(JSON.parse);
        const loginPost = reqs.find(r => r.method === 'POST' && /login/i.test(r.url));
        assert.equal(loginPost.form['ctl00$txtPass'], '[not recorded]'); assert.equal(loginPost.form['ctl00$txtUser'], site.user);
        assert.ok(!JSON.stringify(reqs).includes(site.pass), 'the password is nowhere in the recording');
        assert.ok(!JSON.stringify(reqs).toLowerCase().includes('cookie'), 'no cookies recorded');
        const delta = reqs.find(r => r.asyncPostback);
        assert.deepEqual(delta.delta, [{ type: 'updatePanel', id: 'ctl00_UpdatePanel1', length: delta.delta[0].length }]);
        assert.ok(reqs.some(r => r.download === 'GroupList_mock.xls') && fs.readdirSync(path.join(out.dir, 'downloads')).length === 1);
        assert.ok(index.steps.some(s => s.click && s.click.id === 'btnMore'), 'the click that caused the change is noted');
    } finally { await bm.close(); await site.close(); }
});
