// Personal settings for THIS browser only (localStorage) — nothing here is sent to the server or
// shared with other desks. The Settings page edits them; the shell applies them at once.
//
//   getPrefs()            current settings (defaults filled in)
//   setPrefs(patch)       merge + save + apply; fires 'pms:prefs' on window
//   resetPrefs(section?)  back to defaults (all, or one section key list)
//   shortcutFor(viewId)   the key for Alt+<key> (or the chosen modifier)
//   matchesShortcut(e)    view id for a keydown, or null

import { VIEWS } from '../config.js';

const KEY = 'pms_prefs';

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
    confirmLogout: true,
    analytics: true,           // anonymous usage statistics (PostHog)
};

let cache = null;

function read() {
    try { return JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch { return {}; }
}

export function getPrefs() {
    if (!cache) {
        const saved = read();
        cache = { ...DEFAULT_PREFS, ...saved, shortcuts: { ...DEFAULT_PREFS.shortcuts, ...(saved.shortcuts || {}) } };
    }
    return cache;
}

export function setPrefs(patch) {
    const next = { ...getPrefs(), ...patch };
    if (patch.shortcuts) next.shortcuts = { ...getPrefs().shortcuts, ...patch.shortcuts };
    cache = next;
    // only what differs from the defaults is stored, so later default changes still reach this browser
    const diff = {};
    for (const [k, v] of Object.entries(next)) {
        if (k === 'shortcuts') {
            const s = Object.fromEntries(Object.entries(v).filter(([id, key]) => DEFAULT_PREFS.shortcuts[id] !== key));
            if (Object.keys(s).length) diff.shortcuts = s;
        } else if (JSON.stringify(v) !== JSON.stringify(DEFAULT_PREFS[k])) diff[k] = v;
    }
    try { localStorage.setItem(KEY, JSON.stringify(diff)); } catch { }
    applyPrefs();
    window.dispatchEvent(new CustomEvent('pms:prefs', { detail: next }));
    return next;
}

export function resetPrefs(keys) {
    if (!keys) { cache = null; try { localStorage.removeItem(KEY); } catch { } return setPrefs({}); }
    return setPrefs(Object.fromEntries(keys.map(k => [k, structuredClone(DEFAULT_PREFS[k])])));
}

export function exportPrefs() { return JSON.stringify(read(), null, 2); }

export function importPrefs(text) {
    const obj = JSON.parse(text);
    if (!obj || typeof obj !== 'object' || Array.isArray(obj)) throw new Error('Not a settings file.');
    const clean = Object.fromEntries(Object.entries(obj).filter(([k]) => k in DEFAULT_PREFS));
    cache = null;
    try { localStorage.setItem(KEY, '{}'); } catch { }
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
