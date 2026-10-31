import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { SessionStore, resolveKey } from '../../src/session-store.js';
import { createLogger, redact } from '../../src/logger.js';
import { classify } from '../../src/captcha.js';
import { selectorCandidates } from '../../src/webforms.js';
import { assertCanServe, loadConfig } from '../../src/config.js';
import { BridgeError, CaptchaRequiredError, ConfigError } from '../../src/errors.js';

const tmp = () => fs.mkdtempSync(path.join(os.tmpdir(), 'umsb-'));
const KEY = crypto.randomBytes(32).toString('base64');

test('session store: round trip, encrypted on disk, private file', () => {
    const dir = tmp(), file = path.join(dir, 's.enc');
    const s = new SessionStore({ file, key: KEY, keyFile: path.join(dir, 'k'), ttlHours: 1 });
    const state = { cookies: [{ name: 'ASP.NET_SessionId', value: 'SECRET-COOKIE-VALUE', domain: 'ums.sigatulhaj.org', path: '/' }], origins: [] };
    s.save(state, { via: 'test' });
    assert.ok(!fs.readFileSync(file).includes('SECRET-COOKIE-VALUE'), 'cookie value must not appear in the file');
    assert.deepEqual(s.load().state, state);
    if (process.platform !== 'win32') assert.equal(fs.statSync(file).mode & 0o077, 0, 'file readable by the owner only');
});

test('session store: tampering, a different key and expiry all read as "no session"', () => {
    const dir = tmp(), file = path.join(dir, 's.enc');
    const s = new SessionStore({ file, key: KEY, keyFile: path.join(dir, 'k'), ttlHours: 1 });
    s.save({ cookies: [] });
    const blob = fs.readFileSync(file); blob[blob.length - 3] ^= 0xff; fs.writeFileSync(file, blob);
    assert.equal(s.load(), null);
    s.save({ cookies: [] });
    assert.equal(new SessionStore({ file, key: crypto.randomBytes(32).toString('base64'), keyFile: path.join(dir, 'k2') }).load(), null);
    const old = new SessionStore({ file, key: KEY, keyFile: path.join(dir, 'k'), ttlHours: 0 });
    assert.equal(old.load(), null);
    s.clear(); assert.equal(s.load(), null);
});

test('session key: bad length refused; a generated key is reused from its file', () => {
    assert.throws(() => resolveKey({ key: 'c2hvcnQ=', keyFile: 'x' }), ConfigError);
    const dir = tmp(), kf = path.join(dir, 'session.key');
    const a = resolveKey({ key: '', keyFile: kf }), b = resolveKey({ key: '', keyFile: kf });
    assert.equal(a.length, 32); assert.ok(a.equals(b));
});

test('logger redacts passwords, cookies, tokens and ViewState', () => {
    const lines = [];
    const log = createLogger({ level: 'debug', sink: (l) => lines.push(l) });
    log.info('x', { password: 'hunter2', nested: { Cookie: 'abc', __VIEWSTATE: 'zzz', ok: 'visible' }, storageState: { cookies: [1] }, apiKey: 'k' });
    const out = lines.join('');
    for (const secret of ['hunter2', 'abc', 'zzz', '"k"']) assert.ok(!out.includes(secret), `${secret} leaked`);
    assert.ok(out.includes('visible'));
    assert.equal(redact(new Error('boom')).message, 'boom');
});

const base = { url: 'https://ums.sigatulhaj.org/Login.aspx', title: '', text: '', iframes: [], widgets: [], badge: false, scripts: [], tokens: [] };
test('captcha classify: visible reCAPTCHA checkbox needs a human until a token exists', () => {
    const sig = { ...base, iframes: [{ src: 'https://www.google.com/recaptcha/api2/anchor?k=1', title: 'reCAPTCHA', visible: true }], widgets: [{ cls: 'g-recaptcha', sitekey: true, visible: true }], tokens: [0] };
    assert.deepEqual(pick(classify(sig)), { kind: 'recaptcha', needsHuman: true, solved: false });
    assert.deepEqual(pick(classify({ ...sig, tokens: [400] })), { kind: 'recaptcha', needsHuman: false, solved: true });
});
test('captcha classify: invisible reCAPTCHA v3 badge is not a blocker; nothing is nothing', () => {
    const v3 = classify({ ...base, badge: true, scripts: ['https://www.google.com/recaptcha/api.js?render=KEY'] });
    assert.equal(v3.present, true); assert.equal(v3.needsHuman, false); assert.equal(v3.invisibleOnly, true);
    assert.equal(classify(base).present, false);
});
test('captcha classify: hCaptcha, Turnstile and the Google "unusual traffic" page', () => {
    assert.equal(classify({ ...base, iframes: [{ src: 'https://newassets.hcaptcha.com/captcha/v1/x', title: 'hCaptcha challenge', visible: true }] }).kind, 'hcaptcha');
    assert.equal(classify({ ...base, iframes: [{ src: 'https://challenges.cloudflare.com/cdn-cgi/x', title: '', visible: true }] }).kind, 'turnstile');
    const sorry = classify({ ...base, url: 'https://www.google.com/sorry/index', text: 'Our systems have detected unusual traffic from your computer network' });
    assert.equal(sorry.needsHuman, true);
});
const pick = ({ kind, needsHuman, solved }) => ({ kind, needsHuman, solved });

test('selectorCandidates: ASP.NET short names expand to generated name/id forms; CSS passes through', () => {
    const c = selectorCandidates('txtFrom');
    assert.ok(c.includes('[name$="$txtFrom"]') && c.includes('[id$="_txtFrom"]'));
    assert.deepEqual(selectorCandidates('#ctl00_x'), ['#ctl00_x']);
    assert.deepEqual(selectorCandidates('input[name="a"]'), ['input[name="a"]']);
});

test('config: defaults to the UMS host, only that host is allowed, the API needs a long token', () => {
    const cfg = loadConfig({});
    assert.equal(cfg.baseUrl, 'https://ums.sigatulhaj.org');
    assert.deepEqual(cfg.allowedHosts, ['ums.sigatulhaj.org']);
    assert.throws(() => assertCanServe(cfg), ConfigError);
    assert.doesNotThrow(() => assertCanServe(loadConfig({ UMS_BRIDGE_TOKEN: 'x'.repeat(32) })));
    assert.throws(() => assertCanServe(loadConfig({ UMS_BRIDGE_TOKEN: 'x'.repeat(32), UMS_API_HOST: '0.0.0.0' })), ConfigError);
    assert.throws(() => loadConfig({ UMS_BASE_URL: 'not a url' }), ConfigError);
});

test('errors carry stable codes and HTTP statuses', () => {
    const e = new CaptchaRequiredError('recaptcha');
    assert.ok(e instanceof BridgeError); assert.equal(e.code, 'CAPTCHA_REQUIRED'); assert.equal(e.status, 409); assert.equal(e.toJSON().details.kind, 'recaptcha');
});
