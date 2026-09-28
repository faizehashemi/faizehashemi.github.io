// Personal settings of each login (look, quick links, shortcuts, Slip defaults…). They are saved on the
// server with the login (GET/PUT /api/me/prefs), so the same login sees its own settings on any device;
// each browser keeps a copy per login (localStorage "pms_prefs:<desk id>") for instant start and offline.
// The Settings page edits them; the shell applies them at once.
//
//   getPrefs()            current settings (defaults filled in)
//   setPrefs(patch)       merge + save (here and on the server) + apply; fires 'pms:prefs' on window
//   resetPrefs(section?)  back to defaults (all, or one section key list)
//   loadServerPrefs()     after login / on start: take this login's settings from the server
//   shortcutFor(viewId)   the key for Alt+<key> (or the chosen modifier)
//   matchesShortcut(e)    view id for a keydown, or null

import { VIEWS } from '../config.js';
import { currentDesk, request } from './cloud.js';

const LEGACY_KEY = 'pms_prefs'; // before settings moved to the server: one set per browser
const keyFor = () => { const d = currentDesk(); return d ? `pms_prefs:${d.id}` : null; };
const dirtyKey = () => { const k = keyFor(); return k && `${k}:unsaved`; };
const ls = {
    get: (k) => { try { return k ? localStorage.getItem(k) : null; } catch { return null; } },
    set: (k, v) => { try { if (k) localStorage.setItem(k, v); } catch { } },
    del: (k) => { try { if (k) localStorage.removeItem(k); } catch { } },
};

export const DEFAULT_PREFS = {
    // appearance
    textScale: 100,            // % — the whole page (views, menu, footer)
    density: 'normal',         // compact | normal | comfortable (table rows, form fields)
    theme: 'light',            // light | dark (night mode) | contrast
    reduceMotion: false,
    // layout
    stickyNav: true,
    showKeyHints: true,        // Alt+1 labels in the menus
    showSyncText: true,        // "Synced 12:03" next to the dot
    showFooter: true,
    phoneCards: true,          // data tables as cards on small screens
    // start
    startView: 'home',         // page opened when the address has no page
    startSite: 'last',         // 'last' or a site id
    // quick links: pages shown as a strip under the menu bar, in this order
    quickLinks: [],
    // shortcuts
    shortcutsOn: true,
    shortcutMod: 'alt',        // alt | alt+shift | ctrl+alt
    shortcuts: Object.fromEntries(VIEWS.filter(v => v.key).map(v => [v.id, v.key])),
    // slip page
    slipDefaultBuilding: '',
    slipCheckinTime: '',
    slipCheckoutTime: '',
    slipAutoLoadSh: true,      // load the slip when an SH is typed into an empty form
    pickerOnlyFree: true,      // Pick rooms…: hide full rooms at first
    // data + privacy
    syncSeconds: 30,           // 0 = only on page change / when back online
    analytics: true,           // anonymous usage statistics (PostHog)
};

let cache = null;
let cacheFor = undefined; // desk id the cache belongs to

function read() {
    // a login's first start on this browser uses the browser's older (pre-server) settings until the server answers
    try { return JSON.parse(ls.get(keyFor()) ?? ls.get(LEGACY_KEY) ?? '{}') || {}; } catch { return {}; }
}

const withDefaults = (saved) => ({ ...DEFAULT_PREFS, ...saved, shortcuts: { ...DEFAULT_PREFS.shortcuts, ...(saved.shortcuts || {}) } });

export function getPrefs() {
    const id = currentDesk()?.id ?? null;
    if (!cache || cacheFor !== id) { cache = withDefaults(id == null ? {} : read()); cacheFor = id; } // logged out: defaults
    return cache;
}

// only what differs from the defaults is stored, so later default changes still reach every login
function diffOf(p) {
    const diff = {};
    for (const [k, v] of Object.entries(p)) {
        if (!(k in DEFAULT_PREFS)) continue;
        if (k === 'shortcuts') {
            const s = Object.fromEntries(Object.entries(v).filter(([id, key]) => DEFAULT_PREFS.shortcuts[id] !== key));
            if (Object.keys(s).length) diff.shortcuts = s;
        } else if (JSON.stringify(v) !== JSON.stringify(DEFAULT_PREFS[k])) diff[k] = v;
    }
    return diff;
}

/* ------------------------------ server copy ------------------------------ */

let pushTimer = null;
function schedulePush() {
    if (!keyFor()) return;
    ls.set(dirtyKey(), '1');
    clearTimeout(pushTimer);
    pushTimer = setTimeout(pushNow, 700); // a slider drag sends one request, not twenty
}

async function pushNow() {
    const key = keyFor(), dirty = dirtyKey();
    if (!key) return false;
    try {
        await request('PUT', '/api/me/prefs', { prefs: JSON.parse(ls.get(key) || '{}') });
        if (keyFor() === key) ls.del(dirty);
        window.dispatchEvent(new CustomEvent('pms:prefs-saved', { detail: { ok: true } }));
        return true;
    } catch {
        // offline or server not updated yet: kept here and sent at the next start or change
        window.dispatchEvent(new CustomEvent('pms:prefs-saved', { detail: { ok: false } }));
        return false;
    }
}

/** Take this login's settings from the server (or send ours up if this browser has unsent changes). */
export async function loadServerPrefs() {
    const key = keyFor();
    if (!key) { cache = null; applyPrefs(); return; }
    if (ls.get(dirtyKey())) { await pushNow(); return; }
    let server;
    try { server = (await request('GET', '/api/me/prefs')).prefs; } catch { return; } // offline: keep the copy here
    if (keyFor() !== key) return; // logged out meanwhile
    if (server == null) {
        // first time on the server: bring this browser's older settings along (from before the move)
        const legacy = ls.get(LEGACY_KEY);
        if (legacy && !ls.get(key)) ls.set(key, legacy);
        if (ls.get(key) && ls.get(key) !== '{}') await pushNow();
        ls.del(LEGACY_KEY);
        return;
    }
    const text = JSON.stringify(server);
    if (text === (ls.get(key) || '{}')) return;
    ls.set(key, text);
    cache = null;
    applyPrefs();
    window.dispatchEvent(new CustomEvent('pms:prefs', { detail: getPrefs() }));
}

/* --------------------------------- changes --------------------------------- */

export function setPrefs(patch) {
    const next = { ...getPrefs(), ...patch };
    if (patch.shortcuts) next.shortcuts = { ...getPrefs().shortcuts, ...patch.shortcuts };
    cache = next;
    ls.set(keyFor(), JSON.stringify(diffOf(next)));
    schedulePush();
    applyPrefs();
    window.dispatchEvent(new CustomEvent('pms:prefs', { detail: next }));
    return next;
}

export function resetPrefs(keys) {
    if (!keys) { cache = null; ls.set(keyFor(), '{}'); return setPrefs({}); }
    return setPrefs(Object.fromEntries(keys.map(k => [k, structuredClone(DEFAULT_PREFS[k])])));
}

export function exportPrefs() { return JSON.stringify(read(), null, 2); }

export function importPrefs(text) {
    const obj = JSON.parse(text);
    if (!obj || typeof obj !== 'object' || Array.isArray(obj)) throw new Error('Not a settings file.');
    const clean = Object.fromEntries(Object.entries(obj).filter(([k]) => k in DEFAULT_PREFS));
    cache = null;
    ls.set(keyFor(), '{}');
    return setPrefs(clean);
}

/* -------------------------------- shortcuts -------------------------------- */

export const shortcutFor = (viewId) => {
    const p = getPrefs();
    return p.shortcutsOn ? (p.shortcuts[viewId] || '') : '';
};

export const modLabel = () => ({ 'alt': 'Alt', 'alt+shift': 'Alt ⇧', 'ctrl+alt': 'Ctrl Alt' }[getPrefs().shortcutMod] || 'Alt');

export function matchesShortcut(e) {
    const p = getPrefs();
    if (!p.shortcutsOn || !e.altKey) return null;
    const mod = p.shortcutMod;
    if ((mod === 'alt+shift') !== e.shiftKey || (mod === 'ctrl+alt') !== e.ctrlKey || e.metaKey) return null;
    // e.code keeps working with Shift held and on non-English layouts
    const k = (/^Digit(\d)$/.exec(e.code)?.[1] ?? /^Key([A-Z])$/.exec(e.code)?.[1] ?? e.key).toUpperCase();
    const hit = Object.entries(p.shortcuts).find(([, key]) => key && key.toUpperCase() === k);
    return hit ? hit[0] : null;
}

/* ---------------------------------- apply ---------------------------------- */

// One <style> element owned by the shell (created before any page mounts, so the router keeps it)
let styleEl = null;

export function applyPrefs() {
    const p = getPrefs();
    const html = document.documentElement;
    html.dataset.pmsTheme = p.theme;
    html.dataset.pmsDensity = p.density;
    html.toggleAttribute('data-pms-no-cards', !p.phoneCards);
    if (!styleEl) {
        styleEl = document.createElement('style');
        styleEl.id = 'pms-prefs';
        styleEl.dataset.shell = '';
        document.head.appendChild(styleEl);
    }
    const scale = Math.min(150, Math.max(75, Number(p.textScale) || 100)) / 100;
    const css = [];
    if (scale !== 1) css.push(`#view, site-nav, .app-footer { zoom: ${scale}; }`);
    if (p.density === 'compact') css.push(`#view td, #view th { padding-top: 2px !important; padding-bottom: 2px !important; }
        #view input:not([type=checkbox]):not([type=radio]), #view select, #view button { padding-top: 3px !important; padding-bottom: 3px !important; }`);
    if (p.density === 'comfortable') css.push(`#view td, #view th { padding-top: 9px !important; padding-bottom: 9px !important; }
        #view input:not([type=checkbox]):not([type=radio]), #view select, #view button { min-height: 38px; }`);
    // Night mode: a see-through layer that inverts what is under it. (A filter on the page itself
    // would break the sticky menu, the phone drawer and every fixed panel.) Dialogs stay normal.
    let night = document.getElementById('pms-night');
    if (p.theme === 'dark' && !night && document.body) {
        night = document.createElement('div');
        night.id = 'pms-night';
        night.dataset.shell = '';
        night.setAttribute('aria-hidden', 'true');
        document.body.appendChild(night);
    }
    if (night) night.hidden = p.theme !== 'dark';
    css.push(`#pms-night { position: fixed; inset: 0; z-index: 2147483000; pointer-events: none;
        backdrop-filter: invert(.9) hue-rotate(180deg); -webkit-backdrop-filter: invert(.9) hue-rotate(180deg); }
        #pms-night[hidden] { display: none; } @media print { #pms-night { display: none; } }`);
    if (p.theme === 'contrast') css.push(`#view, #view * { text-shadow: none !important; }
        #view { color: #000; } #view .muted, #view .help, #view small { color: #222 !important; }
        #view input, #view select, #view textarea, #view button, #view td, #view th { border-color: #333 !important; }`);
    if (p.reduceMotion) css.push(`*, *::before, *::after { transition: none !important; animation: none !important; scroll-behavior: auto !important; }`);
    if (!p.stickyNav) css.push(`site-nav { position: relative !important; }`);
    if (!p.showFooter) css.push(`.app-footer { display: none !important; }`);
    styleEl.textContent = css.join('\n');
}
