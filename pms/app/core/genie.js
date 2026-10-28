// Genie page change: when a desk clicks the menu, the old page is sucked up into the clicked item and the new page pours out of it.
// It moves a picture of the page (the page cut into horizontal slices, each on its own delayed clock, which makes the narrow neck),
// never the live page, so nothing on the page is touched. Only menu clicks start it; reload, back / forward, login, the laundry kiosk,
// reduced-motion settings and very heavy pages (a clone with too many elements) simply change page as before.
const DUR_OUT = 1, DUR_IN = 1, DELAY = 0.55, MAX_NODES = 6000, NODE_BUDGET = 40000;
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
// the speed is logarithmic (a quick start, a long soft landing) and every slice follows an S-curve, so the fold is a curve, not a straight line
const logEase = (t) => Math.log1p(12 * t) / Math.log1p(12);
const ease = (t) => t * t * (3 - 2 * t);

let origin = null, overlays = new Set();

let busy = false;

/**
 * Menu clicks: the page does NOT change at the click. The old page (still the live one) is wrapped up into the clicked item first; only when that has
 * finished does the address change, the router swap the page, and the new page unfold out of the same item. Back / forward, reload, modified clicks
 * (new tab), the laundry kiosk, reduced motion and a click while one is already running change page at once, as before.
 */
export function watchMenuClicks(outlet) {
    document.addEventListener('click', (e) => {
        const path = e.composedPath ? e.composedPath() : [];
        if (!path.some(n => n.tagName === 'SITE-NAV')) { origin = null; return; }
        const a = path.find(n => n.tagName === 'A');
        if (!a) return;
        const r = a.getBoundingClientRect();
        if (r.width) origin = { x: r.left + r.width / 2, y: r.bottom, at: performance.now() };
        const href = a.getAttribute('href') || '';
        if (!href.startsWith('#/') || href === location.hash || e.defaultPrevented || e.button || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;
        if (busy) { reset(outlet); busy = false; return; }                  // a second click while one runs: go there at once
        if (!allowed() || !outlet.firstElementChild) return;
        const o = origin;
        const wrap = play(outlet, o, -1, true);
        if (!wrap) return;                                                   // nothing to play (too heavy …): the normal change of page
        e.preventDefault();
        busy = true;
        wrap.catch(() => { }).then(() => {
            if (!busy) return;                                               // reset by a newer click
            busy = false;
            origin = { ...o, at: performance.now() };                         // the router reads it for the unfolding
            location.hash = href;
            setTimeout(() => { if (!overlays.size && !busy && outlet.style.visibility === 'hidden') outlet.style.visibility = ''; }, 6000);   // the router did not swap the page after all
        });
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

// Only what is in the window is copied: whatever lies below the screen is left out, and whatever is above it is kept as an empty box of the same height
// (so the visible part stays exactly where it is). Walks the live page and its copy side by side.
function prune(orig, clone, vh) {
    const oc = orig.children, cc = clone.children;
    for (let i = Math.min(oc.length, cc.length) - 1; i >= 0; i--) {
        const o = oc[i], c = cc[i], r = o.getBoundingClientRect();
        if (!r.width && !r.height) continue;
        if (r.top > vh + 40) c.remove();
        else if (r.bottom < -40) { c.replaceChildren(); c.style.height = `${r.height}px`; c.style.overflow = 'hidden'; }
        else if (o.children.length) prune(o, c, vh);
    }
}

// a picture-ready copy of the page (only the part in the window), or null when it is still too heavy
function snapshot(el) {
    const c = el.cloneNode(true);
    c.style.cssText = `position:absolute;left:0;top:0;width:${el.offsetWidth}px;margin:0;min-height:0;visibility:visible;`;
    c.querySelectorAll('canvas.pms-beam').forEach(n => n.remove());
    prune(el, c, innerHeight);
    c.setAttribute('aria-hidden', 'true');
    const nodes = c.querySelectorAll('*').length;
    return nodes > MAX_NODES ? null : { el: c, nodes };
}

/**
 * dir = -1: the page goes up into (ox, oy); dir = 1: it comes out of it. Returns a promise that resolves when it has settled (at once when it cannot
 * play). With `live`, the live page is hidden while its picture plays and the result is null when there is nothing to play.
 */
export function play(el, o, dir, live = false) {
    const none = () => (live ? null : Promise.resolve());
    if (!o || !allowed() || !el.offsetHeight) return none();
    const rect = el.getBoundingClientRect();
    const startY = dir < 0 ? Math.max(0, -rect.top) : 0;                    // the old page is shown from where it was scrolled to
    const H = Math.min(el.offsetHeight - startY, innerHeight * 1.1);
    if (H < 60) return none();
    const snap = snapshot(el);
    if (!snap) return none();
    const tpl = snap.el;
    // a page full of data is copied once per slice, so it gets fewer slices than a light one
    const n = clamp(Math.floor(NODE_BUDGET / Math.max(1, snap.nodes)), 10, innerWidth < 700 ? 14 : 22), hs = H / n, W = el.offsetWidth;
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
    if (live) el.style.visibility = 'hidden';                               // the picture stands in for the live page while it plays
    return new Promise((done) => {
        const secs = dir < 0 ? DUR_OUT : DUR_IN, t0 = performance.now();
        const finish = () => { box.remove(); overlays.delete(box); done(); };
        setTimeout(() => { if (overlays.has(box)) finish(); }, (secs + 1.5) * 1000);   // never leave a picture behind (a tab that stopped drawing)
        (function tick(now) {
            if (!overlays.has(box)) return done();                              // reset() took it away
            const p = clamp((now - t0) / (secs * 1000)), q = dir > 0 ? logEase(p) : 1 - logEase(p);
            const tt = (i) => clamp(q * (1 + DELAY) - DELAY * (i / n));          // the top leads, the bottom follows
            const yb = [], sx = [], cx = [];
            for (let i = 0; i <= n; i++) {
                const e = ease(tt(Math.min(i, n - 1)));
                yb[i] = Math.max(i ? yb[i - 1] : 0, oy + (i * hs - oy) * e);
                sx[i] = clamp(0.06 + 0.94 * Math.pow(e, 1.6), 0.06, 1);
                cx[i] = ox + (W / 2 - ox) * e + Math.sin(Math.PI * e) * W * 0.06 * (ox < W / 2 ? -1 : 1);   // the neck bows out a little, then straightens
            }
            slices.forEach((s, i) => {
                s.style.opacity = clamp(tt(i) * 4);
                s.style.transform = `translate(${cx[i] - sx[i] * W / 2}px,${yb[i]}px) scale(${sx[i]},${Math.max(0.0005, (yb[i + 1] - yb[i]) / hs)})`;
            });
            if (p < 1) requestAnimationFrame(tick); else finish();
        })(t0);
    });
}
