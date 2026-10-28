// Genie page change: when a desk clicks the menu, the old page is sucked up into the clicked item and the new page pours out of it.
// It moves a picture of the page (the page cut into horizontal slices, each on its own delayed clock, which makes the narrow neck),
// never the live page, so nothing on the page is touched. Only menu clicks start it; reload, back / forward, login, the laundry kiosk,
// reduced-motion settings and very heavy pages (a clone with too many elements) simply change page as before.
const DUR_OUT = 0.4, DUR_IN = 0.7, DELAY = 0.55, MAX_NODES = 1500, KEEP_ROWS = 40;
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const ease = (t) => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

let origin = null, overlays = new Set();

/** Remember which menu item was clicked (viewport coordinates of its bottom centre). */
export function watchMenuClicks() {
    document.addEventListener('click', (e) => {
        const path = e.composedPath ? e.composedPath() : [];
        if (!path.some(n => n.tagName === 'SITE-NAV')) { origin = null; return; }
        const a = path.find(n => n.tagName === 'A');
        if (!a || (!a.dataset.view && !a.classList.contains('brand') && !a.dataset.cat)) return;
        const r = a.getBoundingClientRect();
        if (!r.width) return;
        origin = { x: r.left + r.width / 2, y: r.bottom, at: performance.now() };
    }, true);
}

/** The menu click that caused this page change (once), if it was just now. */
export function takeOrigin() {
    const o = origin && performance.now() - origin.at < 1500 ? origin : null;
    origin = null;
    return o;
}

export const allowed = () => !matchMedia('(prefers-reduced-motion: reduce)').matches && !document.querySelector('.ld-bar') && !document.hidden;

/** Stop whatever is playing and leave nothing behind. */
export function reset(el) {
    for (const o of overlays) o.remove();
    overlays.clear();
    if (el) el.style.visibility = '';
}

// a copy of the page with long tables cut short (only the top of the page is ever shown), or null when it is still too heavy
function snapshot(el) {
    const c = el.cloneNode(true);
    c.style.cssText = `position:absolute;left:0;top:0;width:${el.offsetWidth}px;margin:0;min-height:0;visibility:visible;`;
    c.querySelectorAll('canvas.pms-beam').forEach(n => n.remove());
    c.querySelectorAll('tbody').forEach(tb => { while (tb.rows.length > KEEP_ROWS) tb.deleteRow(tb.rows.length - 1); });
    c.setAttribute('aria-hidden', 'true');
    return c.querySelectorAll('*').length > MAX_NODES ? null : c;
}

/**
 * dir = -1: the page goes up into (ox, oy); dir = 1: it comes out of it. Resolves when it has settled (or at once when it cannot play).
 * `el` stays where it is; the caller hides it (visibility) while a picture of it plays.
 */
export function play(el, o, dir) {
    return new Promise((done) => {
        if (!o || !allowed() || !el.offsetHeight) return done();
        const rect = el.getBoundingClientRect();
        const startY = dir < 0 ? Math.max(0, -rect.top) : 0;                  // the old page is shown from where it was scrolled to
        const H = Math.min(el.offsetHeight - startY, innerHeight * 1.1);
        if (H < 60) return done();
        const tpl = snapshot(el);
        if (!tpl) return done();
        const n = innerWidth < 700 ? 14 : 22, hs = H / n, W = el.offsetWidth;
        const box = document.createElement('div');
        box.setAttribute('aria-hidden', 'true');
        box.style.cssText = `position:fixed;left:${rect.left}px;top:${rect.top + startY}px;width:${W}px;height:${H}px;z-index:50;pointer-events:none;`;
        const ox = o.x - rect.left, oy = o.y - (rect.top + startY);
        const slices = [];
        for (let i = 0; i < n; i++) {
            const s = document.createElement('div');
            s.style.cssText = `position:absolute;left:0;top:0;width:${W}px;height:${hs + 0.5}px;overflow:hidden;transform-origin:0 0;will-change:transform;`;
            const inner = document.createElement('div');
            inner.style.cssText = `position:absolute;left:0;top:${-(startY + i * hs)}px;width:${W}px;`;
            inner.appendChild(i ? tpl.cloneNode(true) : tpl);
            s.appendChild(inner); box.appendChild(s); slices.push(s);
        }
        document.body.appendChild(box); overlays.add(box);
        const secs = dir < 0 ? DUR_OUT : DUR_IN, t0 = performance.now();
        const finish = () => { box.remove(); overlays.delete(box); done(); };
        setTimeout(() => { if (overlays.has(box)) finish(); }, (secs + 1.5) * 1000);   // never leave a picture behind (a tab that stopped drawing)
        (function tick(now) {
            if (!overlays.has(box)) return done();                              // reset() took it away
            const p = clamp((now - t0) / (secs * 1000)), q = dir > 0 ? p : 1 - p;
            const tt = (i) => clamp(q * (1 + DELAY) - DELAY * (i / n));          // the top leads, the bottom follows
            const yb = [], sx = [], cx = [];
            for (let i = 0; i <= n; i++) {
                const e = ease(tt(Math.min(i, n - 1)));
                yb[i] = Math.max(i ? yb[i - 1] : 0, oy + (i * hs - oy) * e);
                sx[i] = clamp(0.06 + 0.94 * Math.pow(e, 1.6), 0.06, 1);
                cx[i] = ox + (W / 2 - ox) * e;
            }
            slices.forEach((s, i) => {
                s.style.opacity = clamp(tt(i) * 4);
                s.style.transform = `translate(${cx[i] - sx[i] * W / 2}px,${yb[i]}px) scale(${sx[i]},${Math.max(0.0005, (yb[i + 1] - yb[i]) / hs)})`;
            });
            if (p < 1) requestAnimationFrame(tick); else finish();
        })(t0);
    });
}
