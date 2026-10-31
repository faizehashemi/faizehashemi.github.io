// The bridge: one browser session to the UMS, one job at a time. It logs in (or asks a person to), keeps the session, notices when it expires and logs in
// again, stops for a person whenever a CAPTCHA appears, and exposes a small API of operations. Events: 'state', 'login', 'captcha:required', 'captcha:resolved',
// 'session:expired', 'job:start', 'job:done', 'job:error'.
import { EventEmitter } from 'node:events';
import path from 'node:path';
import { createLogger } from './logger.js';
import { SessionStore } from './session-store.js';
import { BrowserManager } from './browser.js';
import { detectCaptcha, waitForHuman } from './captcha.js';
import { fillLogin, isLoggedIn, isLoginPage, looksExpired, submitLogin } from './auth.js';
import { afterAction, captureExport, clickAndWait, extractPaged, extractTable, fillForm, locate, postBack, readValidation } from './webforms.js';
import { AuthError, BridgeError, CaptchaRequiredError, FormError, SessionExpiredError } from './errors.js';

export class UmsBridge extends EventEmitter {
    constructor(cfg, { logger } = {}) {
        super();
        this.cfg = cfg;
        this.log = logger || createLogger({ level: cfg.logLevel, file: cfg.logFile });
        this.store = new SessionStore({ ...cfg.session, logger: this.log });
        this.bm = new BrowserManager(cfg, this.log, this.store);
        this.state = 'idle';
        this.awaiting = null;       // { kind, reason, since } while a person is needed
        this.lastError = null;
        this.authed = false;
        this.#tail = Promise.resolve();
        this.jobs = 0;
    }
    #tail;

    #set(state) { if (this.state !== state) { this.state = state; this.emit('state', state); } }

    status() {
        return { state: this.state, authenticated: this.authed, browser: this.bm.started ? (this.bm.headless ? 'headless' : 'visible') : 'closed', url: this.bm.started ? this.bm.page.url() : null,
            awaiting: this.awaiting, storedSessionAgeS: this.store.ageMs() == null ? null : Math.round(this.store.ageMs() / 1000), lastError: this.lastError, jobs: this.jobs };
    }

    /** Jobs run strictly one after another: there is one browser page, and a CAPTCHA pause must not be interleaved with other work. */
    #enqueue(name, fn) {
        const run = this.#tail.then(async () => {
            this.jobs++; this.emit('job:start', { name });
            try {
                const out = await this.#job(name, fn);
                this.emit('job:done', { name }); return out;
            } catch (e) {
                this.lastError = { code: e.code || 'ERROR', message: e.message, at: new Date().toISOString() };
                this.emit('job:error', { name, error: e });
                throw e;
            } finally { this.jobs--; if (!this.awaiting) this.#set(this.authed ? 'ready' : 'idle'); }
        });
        this.#tail = run.catch(() => {});
        return run;
    }

    async #job(name, fn) {
        await this.#ensureStarted();
        // a session restored from disk is trusted until the first page says otherwise (an expired one raises SessionExpiredError and logs in again)
        if (!this.authed && this.bm.restored && name !== 'login') { this.authed = true; this.bm.restored = false; this.log.info('using the stored session'); }
        if (!this.authed) await this.#authenticate();
        const ctx = this.#ctx();
        this.#set('busy');
        try {
            try { return await fn(ctx); }
            catch (e) {
                if (!(e instanceof SessionExpiredError) || this.cfg.retries.reauth < 1) throw e;
                this.log.warn('session expired during a job; logging in again', { job: name });
                this.emit('session:expired', { job: name });
                this.authed = false; this.store.clear();
                await this.#authenticate();
                return await fn(this.#ctx());
            }
        } catch (e) {
            const shot = await this.bm.screenshot(path.join(this.cfg.debugDir, `${Date.now()}-${name}.png`));
            this.log.error('job failed', { job: name, error: e, screenshot: shot });
            throw e;
        }
    }

    #ctx() {
        const bm = this.bm;
        return { get page() { return bm.page; }, goto: async (p) => { await bm.goto(p); await this.#checkpoint(); return bm.page; }, checkpoint: () => this.#checkpoint() };
    }

    async #ensureStarted() {
        if (this.bm.started) return;
        this.#set('starting');
        await this.bm.start({ headed: !this.cfg.browser.headless });
    }

    /** After every navigation: a CAPTCHA pauses for a person, an expired session is reported. */
    async #checkpoint() {
        const page = this.bm.page;
        const c = await detectCaptcha(page);
        if (c.needsHuman) await this.#awaitHuman(c.kind, 'page');
        if (await looksExpired(page, this.cfg)) throw new SessionExpiredError();
    }

    /** Stop and wait for a person. Reopens the browser visibly if it is hidden (the person needs a window). Never tries to solve anything. */
    async #awaitHuman(kind, reason, isDone, onlyDone = false) {
        this.awaiting = { kind: kind || 'captcha', reason, since: new Date().toISOString() };
        this.#set('awaiting_human');
        this.log.warn('a person is needed', this.awaiting);
        this.emit('captcha:required', { ...this.awaiting, url: this.bm.page.url() });
        let escalated = false;
        if (this.bm.headless && !this.cfg.captcha.waitInPlace) {
            if (!this.cfg.captcha.escalateToHeaded) { this.awaiting = null; throw new CaptchaRequiredError(kind, 'A CAPTCHA needs a person and this bridge may not open a window. Run "ums-bridge login" on a machine with a screen, or set UMS_CAPTCHA_HEADED=1.'); }
            await this.bm.restart({ headed: true }); escalated = true;
        }
        try {
            const how = await waitForHuman(this.bm.page, { onlyDone, isDone: isDone || (() => isLoggedIn(this.bm.page, this.cfg)), timeoutMs: this.cfg.captcha.timeoutMs, pollMs: this.cfg.captcha.pollMs, logger: this.log, kind });
            this.log.info('person finished', { how });
            this.emit('captcha:resolved', { kind, how });
        } finally {
            this.awaiting = null;
            this.#set('busy');
        }
        await this.bm.saveSession({ reason: 'after-human' }).catch(() => {});
        if (escalated && this.cfg.captcha.returnToHeadless) await this.bm.restart({ headed: false });
    }

    async #authenticate() {
        this.#set('authenticating');
        for (let attempt = 1; attempt <= 3; attempt++) {
            // a restored session is checked on the home page first (if the site has none, the login page decides)
            if (attempt === 1 && this.bm.restored) { await this.bm.goto(this.cfg.homePath).catch(() => this.bm.goto(this.cfg.loginPath)); this.bm.restored = false; }
            else await this.bm.goto(this.cfg.loginPath);
            const p = this.bm.page;
            if (!(await isLoginPage(p, this.cfg))) {
                const c = await detectCaptcha(p);
                if (c.needsHuman) await this.#awaitHuman(c.kind, 'page');
                if (await looksExpired(this.bm.page, this.cfg)) continue;
                this.authed = true; await this.bm.saveSession({ via: 'stored-session' }); this.log.info('session valid'); this.#set('busy'); return;
            }
            this.log.info('login required', { attempt });
            const haveCreds = !this.cfg.manualLogin && this.cfg.credentials.username && this.cfg.credentials.password;
            if (!haveCreds) {
                // no stored credentials: a person logs in by hand in a visible window
                // (the person types the credentials, solves the CAPTCHA and presses Login; only being logged in ends the wait)
                await this.#awaitHuman('login', 'manual-login', () => isLoggedIn(this.bm.page, this.cfg), true);
            } else {
                await fillLogin(this.bm.page, this.cfg);
                const c = await detectCaptcha(this.bm.page);
                if (c.needsHuman) {
                    await this.#awaitHuman(c.kind, 'login', () => isLoggedIn(this.bm.page, this.cfg));
                    if (!(await isLoggedIn(this.bm.page, this.cfg))) { await fillLogin(this.bm.page, this.cfg); await submitLogin(this.bm.page, this.cfg, this.log); }
                } else await submitLogin(this.bm.page, this.cfg, this.log);
                // a CAPTCHA may only appear after the first submit (after failed attempts, or risk based)
                const after = await detectCaptcha(this.bm.page);
                if (after.needsHuman) await this.#awaitHuman(after.kind, 'login', () => isLoggedIn(this.bm.page, this.cfg));
            }
            if (await isLoggedIn(this.bm.page, this.cfg)) {
                this.authed = true;
                await this.bm.saveSession({ via: haveCreds ? 'credentials' : 'manual', at: new Date().toISOString() });
                this.log.info('logged in');
                this.emit('login', { manual: !haveCreds });
                this.#set('busy'); return;
            }
        }
        throw new AuthError('Could not log in to UMS after 3 attempts.');
    }

    /* ------------------------------ public operations ------------------------------ */

    /** Log in now (or confirm the stored session is still good). */
    login() { return this.#enqueue('login', async () => ({ ok: true, ...this.status() })); }

    async logout() {
        return this.#enqueue('logout', async ({ page }) => {
            const link = page.locator(this.cfg.selectors.loggedIn).first();
            if (await link.count()) await afterAction(page, () => link.click()).catch(() => {});
            this.store.clear(); this.authed = false;
            return { ok: true };
        });
    }

    goto(p) { return this.#enqueue('goto', async (c) => { const page = await c.goto(p); return { url: page.url(), title: await page.title() }; }); }

    /**
     * Fill a form and submit it.
     * @param {{ path?: string, fields?: object, submit?: string | { postback: { target: string, argument?: string } }, expect?: 'any'|'reload'|'async' }} o
     */
    submitForm(o) {
        return this.#enqueue('submitForm', async (c) => {
            const page = o.path ? await c.goto(o.path) : this.bm.page;
            await fillForm(page, o.fields);
            if (!o.submit) return { url: page.url(), submitted: false, validation: await readValidation(page) };
            if (typeof o.submit === 'object') await postBack(page, o.submit.postback.target, o.submit.postback.argument || '', { expect: o.expect });
            else await clickAndWait(page, o.submit, { expect: o.expect });
            await c.checkpoint();
            return { url: page.url(), title: await page.title(), submitted: true, validation: await readValidation(page) };
        });
    }

    /** Read a table (optionally every page of a GridView) after optionally filling a filter form. */
    extractTable(o) {
        return this.#enqueue('extractTable', async (c) => {
            const page = o.path ? await c.goto(o.path) : this.bm.page;
            if (o.fields) { await fillForm(page, o.fields); if (o.submit) { await clickAndWait(page, o.submit); await c.checkpoint(); } }
            const t = o.paged ? await extractPaged(page, o.selector, { nextSelector: o.nextSelector, maxPages: o.maxPages }) : await extractTable(page, o.selector, { headerRow: o.headerRow !== false });
            return { url: page.url(), ...t };
        });
    }

    /**
     * Press an export control and capture the file. With no control given the first visible one that says Export / Excel / XLS is used (as the extension does).
     * @param {{ path?: string, fields?: object, control?: string | { postback: { target: string, argument?: string } }, outDir?: string }} o
     */
    exportFile(o = {}) {
        return this.#enqueue('exportFile', async (c) => {
            const page = o.path ? await c.goto(o.path) : this.bm.page;
            if (o.fields) await fillForm(page, o.fields);
            let trigger;
            if (o.control && typeof o.control === 'object') trigger = () => postBack(page, o.control.postback.target, o.control.postback.argument || '', { expect: 'any' }).catch(() => {});
            else {
                const loc = o.control ? await locate(page, o.control) : page.locator('input[type=submit], input[type=button], input[type=image], button, a').filter({ hasText: /export|excel|xls/i }).or(page.locator('input[value*="xport" i], input[value*="xcel" i], input[value*="xls" i]')).first();
                if (!(await loc.count())) throw new FormError(`No export control found on ${page.url()}. Give one with "control".`);
                trigger = () => loc.click().catch(() => {});
            }
            const out = await captureExport(page, trigger, { outDir: o.outDir || this.cfg.api.outDir });
            if (/<input[^>]+name="__VIEWSTATE"/i.test(out.body.subarray(0, 4000).toString('utf8')) && !/<table/i.test(out.body.toString('utf8'))) throw new SessionExpiredError('UMS answered with a page instead of the export file.');
            return { fileName: out.fileName, path: out.path, contentType: out.contentType, bytes: out.body.length, body: out.body };
        });
    }

    async close() {
        await this.#tail.catch(() => {});
        await this.bm.saveSession({ reason: 'close' }).catch(() => {});
        await this.bm.close();
        this.#set('closed');
        this.log.close?.();
    }
}

export { BridgeError };
