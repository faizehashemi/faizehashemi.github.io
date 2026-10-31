// Owns the Playwright browser: starts it (hidden or visible), restores the stored session into it, saves it back, and can swap a hidden browser for a visible
// one at the same address when a person has to step in (CAPTCHA, manual login). Navigation is limited to the configured UMS host(s).
import { ConfigError, NavigationError, SessionExpiredError } from './errors.js';
import { HOOK_SCRIPT } from './webforms.js';

export class BrowserManager {
    constructor(cfg, logger, store) { this.cfg = cfg; this.log = logger; this.store = store; this.browser = null; this.context = null; this.page = null; this.headless = true; this.restored = false; }

    async #playwright() {
        try { return (await import('playwright')).chromium; }
        catch (e) { throw new ConfigError('Playwright is not installed. In tools/ums-bridge run: npm install && npx playwright install chromium', { cause: e }); }
    }

    get started() { return !!this.page && !this.page.isClosed(); }

    async start({ headed = false } = {}) {
        const chromium = await this.#playwright();
        this.headless = !headed;
        this.browser = await chromium.launch({ headless: this.headless, slowMo: this.cfg.browser.slowMo, channel: this.cfg.browser.channel });
        const stored = this.store.load();
        this.restored = !!stored;
        this.context = await this.browser.newContext({ storageState: stored?.state, acceptDownloads: true, viewport: { width: 1280, height: 900 } });
        this.context.setDefaultNavigationTimeout(this.cfg.browser.navTimeoutMs);
        this.context.setDefaultTimeout(this.cfg.browser.actionTimeoutMs);
        await this.context.addInitScript(HOOK_SCRIPT);
        this.page = await this.context.newPage();
        this.log.info('browser started', { headless: this.headless, restoredSession: !!stored });
        return this.page;
    }

    async saveSession(meta) {
        if (!this.context) return;
        this.store.save(await this.context.storageState(), meta);
    }

    /** Close and reopen in the other mode at the same address, carrying the session over. */
    async restart({ headed }) {
        const url = this.page && !this.page.isClosed() ? this.page.url() : '';
        await this.saveSession({ reason: 'restart' }).catch(() => {});
        await this.close();
        await this.start({ headed });
        if (url && url !== 'about:blank') await this.page.goto(url, { waitUntil: 'domcontentloaded' }).catch(() => {});
        this.log.info('browser restarted', { headed });
        return this.page;
    }

    resolve(p) {
        const url = new URL(p, this.cfg.baseUrl + '/');
        if (!this.cfg.allowedHosts.includes(url.host)) throw new NavigationError(`Refusing to open ${url.host}: only ${this.cfg.allowedHosts.join(', ')} is allowed.`, { details: { url: url.href } });
        return url.href;
    }

    async goto(p) {
        const url = this.resolve(p);
        const res = await this.page.goto(url, { waitUntil: 'domcontentloaded' }).catch(e => { throw new NavigationError(`Could not open ${url}: ${e.message}`, { cause: e, details: { url } }); });
        const host = new URL(this.page.url()).host;
        if (!this.cfg.allowedHosts.includes(host)) throw new NavigationError(`The page redirected to ${host}, which is not allowed.`, { details: { url: this.page.url() } });
        const status = res?.status() ?? 0;
        if (status === 401 || status === 403) throw new SessionExpiredError(`UMS answered ${status}.`);
        if (status >= 400) throw new NavigationError(`UMS answered ${status} for ${url}.`, { details: { url, status } });
        return res;
    }

    async screenshot(file) { try { await this.page?.screenshot({ path: file, fullPage: true }); return file; } catch { return null; } }

    async close() {
        try { await this.context?.close(); } catch { /* already closed */ }
        try { await this.browser?.close(); } catch { /* already closed */ }
        this.browser = this.context = this.page = null;
    }
}
