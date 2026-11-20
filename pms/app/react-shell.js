// Starts the React shell (react/src/shell: menu bar, router, page frame — built into pms/react/bridge.js). main.js picks it when it is switched on.
// Everything is downloaded first and only then started, so a failed download leaves nothing half running and main.js falls back to the legacy shell.
// The core modules are imported here once and handed to the React code (they are never bundled), shared with the old modules the pages still reuse.
import { SITES, VIEWS, NAV, DEFAULT_SITE, LEGACY_PAGES } from './config.js';
import { startServices } from './services.js';

const CORE = ['cloud', 'stay', 'rooms', 'prefs', 'settings', 'ums', 'transport', 'checkin', 'timefmt'];
const css = document.createElement('link');
css.id = 'pms-react-css';
css.rel = 'stylesheet';
css.href = new URL('../react/style.css', import.meta.url).href;
const cssReady = new Promise(res => { css.onload = css.onerror = res; });
document.head.appendChild(css);

const [bridge, ...mods] = await Promise.all([import('../react/bridge.js'), ...CORE.map(n => import(`./core/${n}.js`)), cssReady]);
const [analytics, cards, menu, db] = await Promise.all([import('./core/analytics.js'), import('./core/cards.js'), import('./core/menu.js'), import('./core/db.js')]);
const core = Object.fromEntries(CORE.map((n, i) => [n, mods[i]]));

// A page part that fails to download (a deploy at that moment, or the network dropping) is tried once more; if it still fails, a bar offers
// to reload instead of the page showing an error. The retry asks with ?retry=… because the browser remembers a failed module address.
let bar = null;
function reloadBar() {
    if (bar) return;
    bar = document.createElement('div');
    bar.setAttribute('role', 'alert');
    bar.style.cssText = 'position:fixed;left:50%;top:12px;transform:translateX(-50%);z-index:3000;display:flex;gap:12px;align-items:center;padding:10px 14px;border-radius:12px;background:#0b1020;color:#fff;font:600 14px system-ui,sans-serif;box-shadow:0 8px 30px #0005';
    bar.innerHTML = '<span>PMS was just updated or the network dropped — part of this page did not load.</span>';
    const b = document.createElement('button');
    b.textContent = 'Reload';
    b.style.cssText = 'border:0;border-radius:8px;padding:6px 14px;background:#f5d78e;color:#0b1020;font:700 14px system-ui,sans-serif;cursor:pointer';
    b.onclick = () => location.reload();
    bar.appendChild(b);
    document.body.appendChild(bar);
}
async function importRetry(rel) {
    const url = new URL(rel, import.meta.url).href;
    try { return await import(url); } catch (e) {
        await new Promise(r => setTimeout(r, 800));
        try { return await import(`${url}?retry=${Date.now()}`); } catch (e2) { reloadBar(); throw e2; }
    }
}

const shell = bridge.mountShell({
    core, config: { SITES, VIEWS, NAV, DEFAULT_SITE, LEGACY_PAGES }, menu, analytics, watchTables: cards.watchTables, createDb: db.createDb,
    loadCore: (name) => importRetry(`./core/${name}.js`),   // any other core module a page needs, imported lazily
    loadApp: (path) => importRetry(`./${path}`),             // any file of pms/app (e.g. views/changelog/data.js, regenerated at every deploy)
    openAssistant: () => import('./core/ai-assistant.js').then(m => m.toggleAssistant()),
});
const started = startServices(shell);
shell.route();
started();
