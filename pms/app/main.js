// SPA shell: hash router + view lifecycle.
//
// Routes: #/<site>/<view>?<params>   e.g. #/makkah/slip?sh_no=38480
// Each view lives in app/views/<id>/ as view.html + view.css + view.js (default export mount(ctx)).
// Only one view is mounted at a time, so each view keeps its original page-level CSS untouched.
// Anything a view attaches to window/document/body/head is tracked and undone on navigation.

import { SITES, VIEWS, NAV, DEFAULT_SITE, LEGACY_PAGES } from './config.js';
import { createDb } from './core/db.js';
import { currentDesk, logout, sync, state, mirrorAll, canOpen, siteFor, refreshDesk, firstPage } from './core/cloud.js';
import './core/nav.js';
import './core/ums-auto.js'; // listens for the UMS extension from page load, on every view
import { watchTables } from './core/cards.js';
import { initAnalytics, pageview, identify, resetAnalytics, track } from './core/analytics.js';
import { loadBuildings } from './core/rooms.js';
import { applyPrefs, getPrefs, loadServerPrefs } from './core/prefs.js';

applyPrefs(); // this browser's Settings, before anything is drawn

const nav = document.querySelector('site-nav');
const outlet = document.getElementById('view');
let cssLink = null; // <link> of the mounted view's stylesheet
const LAST_SITE_KEY = 'pms_last_site';

/* ------------------------- listener tracking ------------------------- */

const origAdd = EventTarget.prototype.addEventListener;
const origRemove = EventTarget.prototype.removeEventListener;
let tracked = null; // listeners added to window/document by the current view

for (const target of [window, document]) {
    target.addEventListener = function (type, fn, opts) {
        // Views were written as standalone pages; the page has already loaded by the time they mount.
        if ((type === 'DOMContentLoaded' && document.readyState !== 'loading') ||
            (type === 'load' && this === window && document.readyState === 'complete')) {
            setTimeout(() => typeof fn === 'function' ? fn.call(this, new Event(type)) : fn.handleEvent(new Event(type)), 0);
            return;
        }
        if (tracked) tracked.push([this, type, fn, opts]);
        return origAdd.call(this, type, fn, opts);
    };
}

/* ------------------------------ routing ------------------------------ */

function parseHash() {
    const raw = location.hash.replace(/^#\/?/, '');
    const [path, query = ''] = raw.split('?');
    const [siteId, viewId] = path.split('/');
    return { siteId, viewId, params: new URLSearchParams(query) };
}

function lastSite() {
    const pref = getPrefs().startSite;
    if (SITES[pref]) return pref;
    try { const s = localStorage.getItem(LAST_SITE_KEY); return SITES[s] ? s : DEFAULT_SITE; }
    catch { return DEFAULT_SITE; }
}

export function href(siteId, viewId, params) {
    const q = params ? new URLSearchParams(params).toString() : '';
    return `#/${siteId}/${viewId}${q ? '?' + q : ''}`;
}

// Legacy links inside view markup (e.g. href="accommodation_slip.html") → hash routes
function rewriteLegacyLinks(root, siteId) {
    root.querySelectorAll('a[href]').forEach(a => {
        const h = a.getAttribute('href');
        const m = h.match(/^(?:\.\/)?([\w-]+\.html)(\?.*)?$/);
        if (m && LEGACY_PAGES[m[1]]) a.setAttribute('href', `#/${siteId}/${LEGACY_PAGES[m[1]]}${m[2] || ''}`);
    });
}

/* ---------------------------- view lifecycle --------------------------- */

// A view that is still loading when the user navigates away would otherwise resume and write
// into the next view's DOM (views share ids like #status, #dateFrom, #tblIn). Each mount gets a
// db whose calls stop settling once it is unmounted, so stale code halts at its next await.
function scopeDb(base) {
    const scope = { alive: true };
    const never = () => new Promise(() => { });
    const db = { ...base };
    for (const [k, fn] of Object.entries(base)) {
        if (typeof fn !== 'function') continue;
        db[k] = (...args) => {
            if (!scope.alive) return never();
            return fn(...args).then(v => scope.alive ? v : never(), e => scope.alive ? Promise.reject(e) : never());
        };
    }
    // ctx.guard(promise): the same for any other wait a view does (buildings, settings, requests)
    const guard = (p) => Promise.resolve(p).then(v => scope.alive ? v : never(), e => scope.alive ? Promise.reject(e) : never());
    return { db, guard, end: () => { scope.alive = false; } };
}

const htmlCache = new Map();
let current = null; // { key, endDb, cleanup, listeners, bodyBefore, headBefore, rootStyle, bodyStyle, bodyClass }
let routeSeq = 0;   // bumps on every navigation; an older in-flight route() gives up

// Loads the view's stylesheet, then drops the previous one (no flash of unstyled content)
// `seq` is the navigation it belongs to: a stylesheet that finishes loading after the user has already
// moved on is dropped, so it can never replace the stylesheet of the page now showing.
async function loadCss(viewId, seq) {
    const url = `app/views/${viewId}/view.css`;
    if (cssLink?.getAttribute('href') === url) return;
    const next = document.createElement('link');
    next.rel = 'stylesheet';
    next.href = url;
    next.dataset.shell = '';
    // before the shell's responsive.css so its phone rules win over page styles
    await new Promise(res => { next.onload = next.onerror = res; document.head.insertBefore(next, document.getElementById('responsive-css')); });
    if (seq !== routeSeq) { next.remove(); return; }
    if (cssLink !== next) cssLink?.remove();
    cssLink = next;
}

function unmount() {
    if (!current) return;
    const c = current;
    current = null;
    tracked = null;
    c.endDb();
    c.stopTables?.();
    try { c.cleanup?.(); } catch (e) { console.error('view cleanup failed', e); }
    for (const [t, type, fn, opts] of c.listeners) origRemove.call(t, type, fn, opts);
    for (const el of Array.from(document.body.children)) {
        if (!c.bodyBefore.has(el) && !('shell' in el.dataset)) el.remove();
    }
    for (const el of Array.from(document.head.children)) {
        if (!c.headBefore.has(el) && el.tagName === 'STYLE') el.remove();
    }
    const restore = (el, attr, val) => val == null ? el.removeAttribute(attr) : el.setAttribute(attr, val);
    restore(document.documentElement, 'style', c.rootStyle);
    restore(document.body, 'style', c.bodyStyle);
    restore(document.body, 'class', c.bodyClass);
    outlet.innerHTML = '';
}

async function route() {
    let { siteId, viewId, params } = parseHash();
    const desk = currentDesk();

    if (!SITES[siteId]) siteId = desk?.site || lastSite();
    // a Makkah login works on Makkah, a Medina login on Medina; only an admin can look at the other site
    if (desk) siteId = siteFor(desk, siteId);
    // Not logged in: the login screen, whatever the address says (it is kept for after login)
    // no page in the address (opening the app): the start page from Settings
    const start = !viewId && VIEWS.find(v => v.id === getPrefs().startView && !['login'].includes(v.id));
    let view = !desk ? VIEWS.find(v => v.id === 'login')
        : VIEWS.find(v => v.id === viewId && v.id !== 'login') || start || VIEWS.find(v => v.id === 'home');
    // pages the admin has not given this login (Setup → Page access)
    if (desk && !canOpen(view.id, desk)) {
        // Home not allowed (or the start page): go to the login's first allowed page — quietly for Home
        if (view.id !== 'home') nav.notice(`${view.label} is not available for ${desk.name}. Ask the admin if you need it.`);
        view = VIEWS.find(v => v.id === firstPage(desk, NAV.flatMap(c => c.views)));
        history.replaceState(null, '', href(siteId, view.id));
    }

    params.delete('source'); // old *_web redirects asked for the Cloud source; everything is cloud now
    if (desk && (siteId !== parseHash().siteId || view.id !== viewId || parseHash().params.has('source'))) {
        history.replaceState(null, '', href(siteId, view.id, params));
    }
    try { localStorage.setItem(LAST_SITE_KEY, siteId); } catch { }

    const key = `${desk ? desk.id : '-'}/${siteId}/${view.id}/${params}`;
    if (current?.key === key) return;

    const seq = ++routeSeq;
    const db = createDb(siteId);
    nav.hidden = !desk;
    if (desk) nav.setRoute(siteId, view.id, desk);
    document.title = `${view.title} · ${SITES[siteId].label}`;
    pageview(siteId, view.id);

    unmount();
    outlet.setAttribute('aria-busy', 'true');
    try {
        if (!htmlCache.has(view.id)) {
            const resp = await fetch(`app/views/${view.id}/view.html`);
            htmlCache.set(view.id, await resp.text());
        }
        const [{ default: mount }] = await Promise.all([
            import(`./views/${view.id}/view.js`),
            loadCss(view.id, seq),
        ]);
        if (seq !== routeSeq) return; // user navigated (view, site or source) while loading

        const scoped = scopeDb(db);
        current = {
            key,
            endDb: scoped.end,
            listeners: (tracked = []),
            bodyBefore: new Set(document.body.children),
            headBefore: new Set(document.head.children),
            rootStyle: document.documentElement.getAttribute('style'),
            bodyStyle: document.body.getAttribute('style'),
            bodyClass: document.body.getAttribute('class'),
        };
        outlet.innerHTML = htmlCache.get(view.id);
        outlet.dataset.view = view.id;
        rewriteLegacyLinks(outlet, siteId);
        current.stopTables = watchTables(outlet); // data tables become cards on phones
        window.scrollTo(0, 0);

        const ctx = {
            site: SITES[siteId],
            siteId,
            db: scoped.db,
            guard: scoped.guard,
            params,
            root: outlet,
            navigate: (v, p) => { location.hash = href(siteId, v, p); },
            href: (v, p) => href(siteId, v, p),
        };
        const mine = current;
        const cleanup = await mount(ctx);
        if (typeof cleanup === 'function') {
            if (current === mine) mine.cleanup = cleanup; else cleanup();
        }
    } catch (err) {
        console.error(err);
        outlet.innerHTML = `<div style="max-width:720px;margin:40px auto;padding:16px;border:1px solid #e6bcbc;background:#fff1f1;border-radius:12px;font:14px system-ui">
            <b>Could not open “${view.title}”.</b><br>${String(err && err.message || err)}</div>`;
    } finally {
        if (seq === routeSeq) outlet.removeAttribute('aria-busy');
    }
    if (seq === routeSeq && desk) refreshBadge();
}

// "Synced 12:03 · 911 Makkah slips" / "OFFLINE — showing data from 12:03 · read-only"
async function refreshBadge() {
    if (!currentDesk()) return;
    const siteId = parseHash().siteId;
    if (!SITES[siteId]) return;
    const n = (await mirrorAll(siteId).catch(() => [])).length;
    const at = state.lastSync ? new Date(state.lastSync).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—';
    if (!state.online) nav.setBadge(`OFFLINE — data from ${at} · saving is paused`, true);
    else nav.setBadge(`Synced ${at} · ${n} ${SITES[siteId].label} slips`);
}

/* -------------------------------- boot -------------------------------- */

nav.addEventListener('site-change', (e) => {
    const { viewId, params } = parseHash();
    location.hash = href(e.detail, viewId || 'home', params);
});
nav.addEventListener('logout', async () => {
    await logout(); // → 'pms:logged-out' → route()
});
// Settings belong to the login: switch to its copy at once, then take the server's (other devices)
const prefsChanged = () => { applyPrefs(); window.dispatchEvent(new CustomEvent('pms:prefs', { detail: getPrefs() })); };
origAdd.call(window, 'pms:logged-in', () => {
    prefsChanged();
    loadServerPrefs().catch(() => { });
    identify(currentDesk());
    track('login');
    loadBuildings({ force: true }).catch(() => { });
    route(); // route key includes the desk, so the login view is replaced
});
origAdd.call(window, 'pms:logged-out', (e) => {
    prefsChanged(); // back to the defaults on the login screen
    track('logout', { reason: e.detail?.reason ? 'expired' : 'manual' });
    resetAnalytics();
    try { if (e.detail?.reason) sessionStorage.setItem('pms_logout_reason', e.detail.reason); } catch { }
    unmount();
    route();
});
origAdd.call(window, 'pms:sync', refreshBadge);
// the admin changed this login's pages / site / role: redraw the menu, leave a page it may no longer open
origAdd.call(window, 'pms:desk-changed', () => {
    const desk = currentDesk();
    const { siteId, viewId } = parseHash();
    if (!desk) return;
    if (!canOpen(viewId, desk) || siteFor(desk, siteId) !== siteId) { if (current) current.key = null; route(); }
    else nav.setRoute(siteId, viewId, desk);
});
const checkDesk = () => {
    if (!currentDesk() || document.visibilityState !== 'visible') return;
    refreshDesk().catch(() => { });
    loadServerPrefs().catch(() => { }); // settings changed on another device
};
setInterval(checkDesk, 60000);
origAdd.call(document, 'visibilitychange', checkDesk);
let wasOnline = true;
origAdd.call(window, 'pms:sync', (e) => {
    if (wasOnline && e.detail && e.detail.online === false) track('went_offline');
    wasOnline = !e.detail || e.detail.online !== false;
});
origAdd.call(window, 'online', () => sync({ force: true }).catch(() => { }));
// keep every open desk current without anyone pressing Refresh
// (every 30 s by default; Settings → Data can change or stop it)
let syncTimer = null;
function startSyncTimer() {
    clearInterval(syncTimer);
    const s = Number(getPrefs().syncSeconds) || 0;
    if (s > 0) syncTimer = setInterval(() => { if (document.visibilityState === 'visible') sync().catch(() => { }); }, Math.max(10, s) * 1000);
}
startSyncTimer();
origAdd.call(window, 'pms:prefs', startSyncTimer);
origAdd.call(document, 'visibilitychange', () => { if (document.visibilityState === 'visible') sync().catch(() => { }); });
origAdd.call(window, 'hashchange', route);
origAdd.call(window, 'pms:ums-applied', (e) => {
    const d = e.detail || {};
    const label = SITES[d.siteId]?.label || '';
    if (d.error) nav.setBadge(`UMS auto-import (${label}): ${d.held ? 'held for review' : 'failed'}`, true);
    else if (d.summary) nav.setBadge(`UMS → ${label}: ${d.summary.created} new, ${d.summary.updated} updated · reopen page to refresh`);
});
initAnalytics();
if (currentDesk()) identify(currentDesk());
route();
if (currentDesk()) { sync().catch(() => { }); loadBuildings().catch(() => { }); checkDesk(); }
