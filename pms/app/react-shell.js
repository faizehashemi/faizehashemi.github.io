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

const shell = bridge.mountShell({
    core, config: { SITES, VIEWS, NAV, DEFAULT_SITE, LEGACY_PAGES }, menu, analytics, watchTables: cards.watchTables, createDb: db.createDb,
    loadCore: (name) => import(`./core/${name}.js`),   // any other core module a page needs, imported lazily
    loadApp: (path) => import(`./${path}`),             // any file of pms/app (e.g. views/changelog/data.js, regenerated at every deploy)
    openAssistant: () => import('./core/ai-assistant.js').then(m => m.toggleAssistant()),
});
const started = startServices(shell);
shell.route();
started();
