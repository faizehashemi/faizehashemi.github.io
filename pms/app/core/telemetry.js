// Page timings for the Performance page (Data). One small record per page opened (kind 'route'), per full load of
// the PMS (kind 'load') and per error (kind 'error'); kept in this browser and sent in batches every few minutes and
// when the tab is hidden (POST /api/telemetry). Nothing is sent while logged out or offline; no guest data.
//   route: ms_total (menu click → page drawn), ms_server + server_calls (server waits that page made), long_ms (time
//          the screen was frozen by long tasks), inp (slowest tap response while on the page)
//   load:  ttfb, dom_ready, load_ms (browser navigation timing), lcp, cls
//   every record: the device, browser and connection (navigator.connection where the browser has it)

import { currentDesk, request, getSession, apiBase } from './cloud.js';
import { currentBuild } from './update.js';

const KEY = 'pms_telemetry_queue';
const MAX_QUEUE = 300;
const FLUSH_MS = 3 * 60 * 1000;
const SELF = /\/api\/(telemetry|feedback)\b/;

const read = () => { try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; } };
const write = (q) => { try { localStorage.setItem(KEY, JSON.stringify(q.slice(-MAX_QUEUE))); } catch { } };
const push = (e) => { if (!currentDesk()) return; const q = read(); q.push({ at: new Date().toISOString(), ...e }); write(q); };

/* ------------------------------ device, browser, connection ------------------------------ */
function browserOf() {
    const ua = navigator.userAgent;
    const m = (re) => (ua.match(re) || [])[1] || '';
    if (/Edg\//.test(ua)) return ['Edge', m(/Edg\/(\d+)/)];
    if (/OPR\//.test(ua)) return ['Opera', m(/OPR\/(\d+)/)];
    if (/SamsungBrowser\//.test(ua)) return ['Samsung', m(/SamsungBrowser\/(\d+)/)];
    if (/Firefox\//.test(ua)) return ['Firefox', m(/Firefox\/(\d+)/)];
    if (/Chrome\//.test(ua)) return ['Chrome', m(/Chrome\/(\d+)/)];
    if (/Safari\//.test(ua)) return ['Safari', m(/Version\/(\d+)/)];
    return ['Other', ''];
}
function osOf() {
    const ua = navigator.userAgent;
    if (/Android/.test(ua)) return 'Android';
    if (/iPhone|iPad|iPod/.test(ua)) return 'iOS';
    if (/Windows/.test(ua)) return 'Windows';
    if (/Mac OS X/.test(ua)) return 'macOS';
    if (/Linux/.test(ua)) return 'Linux';
    return 'Other';
}
export function context() {
    const [browser, browser_ver] = browserOf();
    const touch = navigator.maxTouchPoints > 0, w = Math.min(screen.width, screen.height);
    const device = navigator.userAgentData?.mobile || /Mobi|iPhone|Android.+Mobile/.test(navigator.userAgent) ? 'phone'
        : touch && w >= 600 && /Android|iPad|Macintosh/.test(navigator.userAgent) ? 'tablet' : 'desktop';
    const c = navigator.connection || {};
    return {
        device, os: osOf(), browser, browser_ver,
        app: matchMedia('(display-mode: standalone)').matches || sessionStorage.getItem('pms_appv') != null ? 'app' : 'browser',
        screen: `${screen.width}x${screen.height}`, mem: navigator.deviceMemory ?? null, cores: navigator.hardwareConcurrency ?? null,
        net_type: c.effectiveType || null, downlink: c.downlink ?? null, rtt: c.rtt ?? null, save_data: !!c.saveData,
        build: currentBuild() || null,
    };
}

/* ------------------------------ timings ------------------------------ */
let route = null;          // the page being opened / shown: { page, site, t0, server, calls, long, inp }
let lastPageMs = {};       // page → ms of its latest opening (feedback adds it)
export const lastLoadOf = (page) => lastPageMs[page] ?? null;

function observe(type, fn, opts = {}) {
    try { new PerformanceObserver((l) => l.getEntries().forEach(fn)).observe({ type, buffered: true, ...opts }); } catch { }
}

export function startTelemetry() {
    // server waits made while a page opens or is shown (every call goes through cloud.request)
    window.addEventListener('pms:request', (e) => {
        const d = e.detail;
        if (!route || !d || SELF.test(d.path)) return;
        route.server += d.ms; route.calls++;
    });
    window.addEventListener('pms:route-start', (e) => {
        route = { page: e.detail.view, site: e.detail.site, t0: performance.now(), server: 0, calls: 0, long: 0, inp: 0, done: false };
    });
    window.addEventListener('pms:route-done', (e) => {
        if (!route || route.page !== e.detail.view || route.done) return;
        route.done = true;
        const ms = Math.round(performance.now() - route.t0);
        lastPageMs[route.page] = ms;
        const c = navigator.connection || {};
        push({ kind: 'route', page: route.page, site: route.site, ms_total: ms, ms_server: Math.round(route.server), server_calls: route.calls,
            long_ms: Math.round(route.long), inp: route.inp || null, net_type: c.effectiveType || null, downlink: c.downlink ?? null, rtt: c.rtt ?? null,
            ...(e.detail.ok === false ? { err: 'page could not open' } : {}) });
    });
    observe('longtask', (en) => { if (route) route.long += en.duration; });
    observe('event', (en) => { if (route && en.interactionId) route.inp = Math.max(route.inp, Math.round(en.duration)); }, { durationThreshold: 40 });

    // the first full load of the PMS in this tab
    let lcp = null, cls = 0;
    observe('largest-contentful-paint', (en) => { lcp = Math.round(en.startTime); });
    observe('layout-shift', (en) => { if (!en.hadRecentInput) cls += en.value; });
    setTimeout(() => {
        const n = performance.getEntriesByType('navigation')[0];
        if (!n) return;
        push({ kind: 'load', page: (location.hash.split('/')[2] || 'home').split('?')[0], ttfb: Math.round(n.responseStart), dom_ready: Math.round(n.domContentLoadedEventEnd),
            load_ms: Math.round(n.loadEventEnd || n.domComplete), lcp, cls: Math.round(cls * 1000) / 1000 });
    }, 15000);

    // errors: the page and a short message
    const err = (msg) => push({ kind: 'error', page: route?.page || null, site: route?.site || null, err: String(msg || 'error').slice(0, 300) });
    // only the PMS's own files and code: a blocked add-on of another site (e.g. Cloudflare's visitor counter
    // static.cloudflareinsights.com, stopped by ad blockers) is not a PMS error
    const own = (url) => { try { return new URL(url, location.href).origin === location.origin; } catch { return false; } };
    window.addEventListener('error', (e) => {
        const src = e.target && (e.target.src || e.target.href);
        if (src) { if (own(src)) err(`could not load ${src}`); return; }          // a file that failed to load
        if (e.filename && !own(e.filename)) return;                              // another site's script
        if (!e.filename && /^Script error\.?$/.test(e.message || '')) return;  // a cross-origin script, details hidden
        err(e.message || 'error');
    }, true);
    window.addEventListener('unhandledrejection', (e) => err(e.reason && (e.reason.message || e.reason)));

    // send: every few minutes, and when the tab goes to the background (closing, switching apps)
    setInterval(() => { if (document.visibilityState === 'visible') flush(); }, FLUSH_MS);
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') flush(true); });
}

let sending = false;
export async function flush(leaving = false) {
    const q = read();
    if (!q.length || sending || !currentDesk() || !navigator.onLine) return;
    sending = true;
    const batch = q.slice(0, 60);
    try {
        if (leaving) {
            // the tab may be closing: keepalive lets the request finish
            const s = getSession();
            await fetch(`${apiBase()}/api/telemetry`, { method: 'POST', keepalive: true, headers: { 'Content-Type': 'application/json', ...(s ? { Authorization: 'Bearer ' + s.token } : {}) },
                body: JSON.stringify({ events: batch, ctx: context() }) });
        } else {
            await request('POST', '/api/telemetry', { events: batch, ctx: context() });
        }
        const keys = new Set(batch.map(x => x.at + x.kind + (x.page || '')));
        write(read().filter(x => !keys.has(x.at + x.kind + (x.page || ''))));
    } catch { /* offline or server busy: kept for the next try */ }
    finally { sending = false; }
}
