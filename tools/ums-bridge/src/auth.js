// Logging in to the Web Forms login page and telling whether a page is the login page / a logged-in page / an "expired" page.
import { AuthError } from './errors.js';
import { afterAction, readValidation } from './webforms.js';

const visibleFirst = async (page, selector) => {
    const loc = page.locator(selector);
    const n = await loc.count().catch(() => 0);
    for (let i = 0; i < n; i++) if (await loc.nth(i).isVisible().catch(() => false)) return loc.nth(i);
    return null;
};

export async function isLoginPage(page, cfg) { return !!(await visibleFirst(page, cfg.selectors.password)); }

export async function isLoggedIn(page, cfg) {
    if (page.isClosed()) return false;
    if (await isLoginPage(page, cfg)) return false;
    if (await page.locator(cfg.selectors.loggedIn).count().catch(() => 0)) return true;
    // no logout link to look for: logged in unless the page says otherwise
    return !(await looksExpired(page, cfg));
}

/** A page the server sent because the session is gone: the login form, "session expired", or the login URL. */
export async function looksExpired(page, cfg) {
    if (await isLoginPage(page, cfg)) return true;
    const url = page.url();
    if (cfg.expiredPatterns.some(re => re.test(url))) return true;
    const text = await page.evaluate(() => (document.body?.innerText || '').slice(0, 800)).catch(() => '');
    return cfg.expiredPatterns.filter(re => !/login\.aspx/i.test(re.source)).some(re => re.test(text));
}

/** Put the configured credentials into the login form (idempotent). Returns false when there is no form or no credentials. */
export async function fillLogin(page, cfg) {
    const { username, password } = cfg.credentials;
    const pass = await visibleFirst(page, cfg.selectors.password);
    if (!pass || !username || !password) return false;
    const user = await visibleFirst(page, cfg.selectors.username);
    if (!user) throw new AuthError('The login form has no username field I can recognise; set UMS_SEL_USER.');
    await user.fill(username);
    await pass.fill(password);
    return true;
}

/** Press the login button and wait for the answer. Throws AuthError if the server refuses the credentials. */
export async function submitLogin(page, cfg, log) {
    const btn = await visibleFirst(page, cfg.selectors.submit);
    if (!btn) throw new AuthError('The login form has no submit control I can recognise; set UMS_SEL_SUBMIT.');
    try { await afterAction(page, () => btn.click(), { timeout: cfg.browser.navTimeoutMs }); }
    catch (e) { if (!(await isLoginPage(page, cfg))) return; throw e; }
    if (await isLoginPage(page, cfg)) {
        const msgs = await readValidation(page);
        log.warn('login refused', { messages: msgs });
        throw new AuthError(msgs.length ? `UMS refused the login: ${msgs.join(' | ')}` : 'UMS showed the login page again after the login was submitted.', { details: { messages: msgs } });
    }
}
