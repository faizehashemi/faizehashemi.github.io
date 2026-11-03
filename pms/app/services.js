// What runs behind every page, whichever shell draws the menu and the pages (legacy-shell.js or the React shell, see main.js):
// telemetry, issue reports, Settings, update checks, login / logout / desk-changed events, sync timers, the sync badge, the UMS
// auto-import notice, analytics, quiet download of the other pages, and the watchdog over the local copy of the slips.
//
// startServices(shell) — call once at start, before the first page is routed. `shell` gives:
//   route()                 draw the page the address names (again)
//   unmount()               take the current page down (logout)
//   forceRoute()            route even if the address did not change (the login's rights changed)
//   setBadge(text, warn)    the sync line in the menu
//   setRoute()              redraw the menu for the current page (rights changed, page still allowed)
//   siteId()                the site in the address
//   preload(viewId)         download a page's code without showing it

import { SITES, VIEWS } from './config.js';
import { currentDesk, sync, state, mirrorAll, canOpen, siteFor, refreshDesk, verifyMirror } from './core/cloud.js';
import './core/ums-auto.js'; // listens for the UMS extension from page load, on every view
import { initAnalytics, identify, resetAnalytics, track } from './core/analytics.js';
import { loadBuildings } from './core/rooms.js';
import { applyPrefs, getPrefs, loadServerPrefs } from './core/prefs.js';
import { watchForUpdates } from './core/update.js';
import { startTelemetry } from './core/telemetry.js';
import { startIssueReports } from './core/issue-report.js';

export function startServices(shell) {
    startTelemetry(); // page timings → Performance page
    startIssueReports();  // the "Facing an issue?" button (a report with a picture of the screen goes to the Performance page)
    applyPrefs(); // this browser's Settings, before anything is drawn
    watchForUpdates(); // new website build → reload; Android app too old → "Update required" (core/update.js)

    // "Synced 12:03 · 911 Makkah slips" / "OFFLINE — showing data from 12:03 · read-only"
    async function refreshBadge() {
        if (!currentDesk()) return;
        const siteId = shell.siteId();
        if (!SITES[siteId]) return;
        const n = (await mirrorAll(siteId).catch(() => [])).length;
        const at = state.lastSync ? new Date(state.lastSync).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—';
        if (!state.online) shell.setBadge(`OFFLINE — data from ${at} · saving is paused`, true);
        else shell.setBadge(`Synced ${at} · ${n} ${SITES[siteId].label} slips`);
    }
    window.addEventListener('pms:route-done', () => { if (currentDesk()) refreshBadge(); });

    // Settings belong to the login: switch to its copy at once, then take the server's (other devices)
    const prefsChanged = () => { applyPrefs(); window.dispatchEvent(new CustomEvent('pms:prefs', { detail: getPrefs() })); };
    window.addEventListener('pms:logged-in', () => {
        prefsChanged();
        loadServerPrefs().catch(() => { });
        identify(currentDesk());
        track('login');
        loadBuildings({ force: true }).catch(() => { });
        shell.route(); // route key includes the desk, so the login view is replaced
    });
    window.addEventListener('pms:logged-out', (e) => {
        prefsChanged(); // back to the defaults on the login screen
        track('logout', { reason: e.detail?.reason ? 'expired' : 'manual' });
        resetAnalytics();
        try { if (e.detail?.reason) sessionStorage.setItem('pms_logout_reason', e.detail.reason); } catch { }
        shell.unmount();
        shell.route();
    });
    window.addEventListener('pms:sync', refreshBadge);
    // the admin changed this login's pages / site / role: redraw the menu, leave a page it may no longer open
    window.addEventListener('pms:desk-changed', () => {
        const desk = currentDesk();
        if (!desk) return;
        const siteId = shell.siteId(), viewId = shell.viewId();
        if (!canOpen(viewId, desk) || siteFor(desk, siteId) !== siteId) shell.forceRoute();
        else shell.setRoute();
    });
    // The login (name, site, role, pages) and the time its settings were last saved come with every sync (/api/sync,
    // every 30 s and when the page comes back into view). Settings are fetched only when that time changes.
    let prefsAt;
    window.addEventListener('pms:prefs-stamp', (e) => {
        const at = e.detail ? e.detail.at : null;
        if (prefsAt !== undefined && at !== prefsAt) loadServerPrefs().catch(() => { }); // changed on another device
        prefsAt = at;
    });
    window.addEventListener('pms:logged-out', () => { prefsAt = undefined; });
    // with automatic sync switched off (Settings → Data), the login is still checked every minute
    const checkDesk = () => {
        if (!currentDesk() || document.visibilityState !== 'visible' || Number(getPrefs().syncSeconds) > 0) return;
        refreshDesk().catch(() => { });
        loadServerPrefs().catch(() => { });
    };
    setInterval(checkDesk, 60000);
    document.addEventListener('visibilitychange', checkDesk);
    let wasOnline = true;
    window.addEventListener('pms:sync', (e) => {
        if (wasOnline && e.detail && e.detail.online === false) track('went_offline');
        wasOnline = !e.detail || e.detail.online !== false;
    });
    window.addEventListener('online', () => sync({ force: true }).catch(() => { }));
    // keep every open desk current without anyone pressing Refresh
    // (every 30 s by default; Settings → Data can change or stop it)
    let syncTimer = null;
    function startSyncTimer() {
        clearInterval(syncTimer);
        const s = Number(getPrefs().syncSeconds) || 0;
        if (s > 0) syncTimer = setInterval(() => { if (document.visibilityState === 'visible') sync().catch(() => { }); }, Math.max(10, s) * 1000);
    }
    startSyncTimer();
    window.addEventListener('pms:prefs', startSyncTimer);
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') sync().catch(() => { }); });
    window.addEventListener('pms:ums-applied', (e) => {
        const d = e.detail || {};
        const label = SITES[d.siteId]?.label || '';
        if (d.error) shell.setBadge(`UMS auto-import (${label}): ${d.held ? 'held for review' : 'failed'}`, true);
        else if (d.summary) shell.setBadge(`UMS → ${label}: ${d.summary.created} new, ${d.summary.updated} updated · reopen page to refresh`);
    });
    initAnalytics();
    if (currentDesk()) identify(currentDesk());

    // Once the first page is showing, every other page the desk may open is downloaded quietly, one at a time, so a menu click never waits for code
    // (a menu click then has nothing left to download). Skipped on data-saver connections and the laundry kiosk.
    let warmed = false;
    // What this desk opens, and what it opens after what, is remembered in this browser: the pages it is most likely to open next are downloaded first.
    const NAV_KEY = 'pms_nav_stats';
    const navStats = () => { try { return JSON.parse(localStorage.getItem(NAV_KEY)) || { n: {}, next: {} }; } catch { return { n: {}, next: {} }; } };
    let lastView = null;
    window.addEventListener('pms:route-done', (e) => {
        const v = e.detail && e.detail.ok !== false ? e.detail.view : null;
        if (!v) return;
        try {
            const st = navStats();
            st.n[v] = (st.n[v] || 0) + 1;
            if (lastView && lastView !== v) { st.next[lastView] = st.next[lastView] || {}; st.next[lastView][v] = (st.next[lastView][v] || 0) + 1; }
            localStorage.setItem(NAV_KEY, JSON.stringify(st));
        } catch { }
        lastView = v;
    });
    window.addEventListener('pms:route-done', function warm() {
        if (warmed || !currentDesk()) return;
        warmed = true;
        const idle = window.requestIdleCallback || ((f) => setTimeout(f, 1200));
        idle(async () => {
            try {
                // not on phones / slow connections: there the downloads competed with the page in use (Home took 4–6 s on the desks' phones, 2026-11)
                const c = navigator.connection;
                if (c?.saveData || c?.type === 'cellular' || /(^|-)(2g|3g)$/.test(c?.effectiveType || '') || window.matchMedia('(max-width: 900px)').matches || document.querySelector('.ld-bar')) return;
                const desk = currentDesk();
                const st = navStats();
                const score = (id) => (st.n[id] || 0) + 3 * ((st.next[lastView] || {})[id] || 0);
                const order = VIEWS.filter(v => v.id !== 'laundry' && !(desk && !canOpen(v.id, desk))).sort((a, b) => score(b.id) - score(a.id));
                const load = (v) => Promise.resolve(shell.preload(v.id)).catch(() => { });
                // two pages at a time, the likeliest first, with a pause between pairs so the page in use is never starved
                for (let i = 0; i < order.length; i += 2) {
                    await Promise.all(order.slice(i, i + 2).map(load));
                    await new Promise(r => setTimeout(r, 150));
                }
            } catch { }
        });
    });

    // The watchdog: the slips are kept in this browser and brought up to date every 30 s; every 20 minutes (and when the tab returns after a long time away)
    // a fingerprint of the local copy is compared with the server's. A difference means a missed change: the copy is downloaded again.
    let lastVerify = Date.now();
    const watchdog = async () => {
        if (!currentDesk() || document.visibilityState !== 'visible' || document.querySelector('.ld-bar')) return;
        lastVerify = Date.now();
        const r = await verifyMirror();
        if (r === 'repaired') shell.setBadge('Your copy of the slips was out of date and has been refreshed.');
    };
    setInterval(() => { if (Date.now() - lastVerify > 20 * 60e3) watchdog(); }, 60e3);
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible' && Date.now() - lastVerify > 10 * 60e3) setTimeout(watchdog, 3000); });

    /** after the first route: the first sync, the buildings and the login check */
    return function started() {
        if (currentDesk()) { sync().catch(() => { }); loadBuildings().catch(() => { }); checkDesk(); }
    };
}
