// CAPTCHA detection and the pause for a person. The bridge NEVER solves, bypasses or fakes a CAPTCHA (no solver services, no token injection, no stealth tricks):
// when one blocks the way it stops, tells whoever is listening, and waits until a human has completed it in the browser window.
import { CaptchaTimeoutError } from './errors.js';

/** Runs inside the page: the raw facts, no decisions. */
export function collectSignals() {
    const vis = (el) => { const r = el.getBoundingClientRect(), s = getComputedStyle(el); return r.width >= 20 && r.height >= 20 && s.visibility !== 'hidden' && s.display !== 'none' && s.opacity !== '0'; };
    return {
        url: location.href,
        title: document.title,
        text: (document.body?.innerText || '').slice(0, 600),
        iframes: [...document.querySelectorAll('iframe')].map(f => ({ src: f.src || '', title: f.title || '', visible: vis(f) })),
        widgets: [...document.querySelectorAll('.g-recaptcha, .h-captcha, .cf-turnstile, [data-sitekey]')].map(w => ({ cls: w.className || '', sitekey: !!w.getAttribute('data-sitekey'), visible: vis(w) })),
        badge: !!document.querySelector('.grecaptcha-badge'),
        scripts: [...document.scripts].map(s => s.src).filter(Boolean).filter(s => /recaptcha|hcaptcha|turnstile/i.test(s)),
        tokens: [...document.querySelectorAll('textarea[name="g-recaptcha-response"], textarea[name="h-captcha-response"], input[name="cf-turnstile-response"]')].map(t => (t.value || '').length),
    };
}

const RE = { recaptcha: /google\.com\/recaptcha|recaptcha\.net|gstatic\.com\/recaptcha/i, hcaptcha: /hcaptcha\.com/i, turnstile: /challenges\.cloudflare\.com/i };

/** Pure: facts → { present, kind, blocking, solved, needsHuman }. needsHuman = a visible challenge with no token yet. */
export function classify(sig) {
    const urls = [...sig.iframes.map(f => f.src), ...sig.scripts];
    const kindOf = (s) => (RE.recaptcha.test(s) ? 'recaptcha' : RE.hcaptcha.test(s) ? 'hcaptcha' : RE.turnstile.test(s) ? 'turnstile' : null);
    let kind = urls.map(kindOf).find(Boolean) || null;
    if (!kind) {
        const cls = sig.widgets.map(w => w.cls).join(' ');
        kind = /g-recaptcha/.test(cls) ? 'recaptcha' : /h-captcha/.test(cls) ? 'hcaptcha' : /cf-turnstile/.test(cls) ? 'turnstile' : null;
    }
    const sorry = /google\.[a-z.]+\/sorry\//i.test(sig.url) || /unusual traffic from your computer network/i.test(sig.text);
    if (sorry) kind = 'recaptcha';
    const challengeFrame = sig.iframes.some(f => f.visible && (kindOf(f.src) || /captcha|challenge/i.test(f.title)));
    const visibleWidget = sig.widgets.some(w => w.visible && (w.cls.trim() !== '' || w.sitekey));
    const blocking = challengeFrame || visibleWidget || sorry;
    const present = !!kind || blocking || sig.badge;
    const solved = sig.tokens.some(n => n > 20);
    return { present, kind, blocking, solved, needsHuman: blocking && !solved, invisibleOnly: present && !blocking };
}

export async function detectCaptcha(page) {
    let sig;
    try { sig = await page.evaluate(collectSignals); } catch { return { present: false, kind: null, blocking: false, solved: false, needsHuman: false, invisibleOnly: false }; }
    return classify(sig);
}

/**
 * Wait for a person to deal with the CAPTCHA. Returns 'cleared' (challenge gone / token present) or 'done' (isDone() says the page moved on, e.g. they logged in).
 * @param {import('playwright').Page} page
 * @param {{ isDone?: () => Promise<boolean>, timeoutMs: number, pollMs?: number, logger?: any, signal?: AbortSignal, kind?: string }} o
 */
export async function waitForHuman(page, { isDone, onlyDone = false, timeoutMs, pollMs = 1000, logger, signal, kind } = {}) {
    const deadline = Date.now() + timeoutMs;
    let announced = 0;
    for (;;) {
        if (signal?.aborted) throw new CaptchaTimeoutError(kind, timeoutMs, { details: { aborted: true } });
        if (page.isClosed()) throw new CaptchaTimeoutError(kind, timeoutMs, { details: { pageClosed: true } });
        if (isDone && await isDone().catch(() => false)) return 'done';
        const c = await detectCaptcha(page);
        if (!onlyDone && !c.needsHuman) return 'cleared';
        if (Date.now() - announced > 30000) { logger?.info(onlyDone ? 'waiting for a person to log in' : 'waiting for a person to complete the CAPTCHA', { kind: c.kind, remainingS: Math.round((deadline - Date.now()) / 1000) }); announced = Date.now(); }
        if (Date.now() > deadline) throw new CaptchaTimeoutError(onlyDone ? 'login' : (c.kind || kind), timeoutMs);
        await page.waitForTimeout(pollMs).catch(() => {});
    }
}
