// The bridge to the React pages (built from /react into pms/react/). The legacy router (main.js) calls reactPageOn(viewId) for
// every page; for pages switched to React it calls mountReact(viewId, ctx) instead of loading app/views/<id>/view.js.
//
// Which pages are React (a page not in any of these lists stays the legacy page):
//   config.js REACT_PAGES      the pages switched on for everybody (empty until a page has been approved on staging)
//   prefs.reactPages           pages switched on for one login (canary) — Settings keeps it per login
//   localStorage pms_react_pages   "paxchart,grid" — this browser only (staging / testing)
//   ?legacy=1 in the address   forces the legacy page (way back while testing)
// The core modules are imported here once and handed to the page in ctx.core, so React pages and legacy pages share the same
// instances (login session, IndexedDB mirror, sync, prefs).

import { REACT_PAGES, VIEWS } from './config.js';
import { getPrefs } from './core/prefs.js';

export function reactPageOn(viewId) {
    try { if (new URLSearchParams(location.search).get('legacy') === '1' || new URLSearchParams(location.hash.split('?')[1] || '').get('legacy') === '1') return false; } catch { }   // ?legacy=1 before or after the #
    if ((REACT_PAGES || []).includes(viewId)) return true;
    if ((getPrefs().reactPages || []).includes(viewId)) return true;
    try { if ((localStorage.getItem('pms_react_pages') || '').split(',').map(s => s.trim()).includes(viewId)) return true; } catch { }
    return false;
}

let cssLoaded = false;
function loadReactCss() {
    if (cssLoaded || document.getElementById('pms-react-css')) { cssLoaded = true; return; }
    const link = document.createElement('link');
    link.id = 'pms-react-css';
    link.rel = 'stylesheet';
    link.href = new URL('../react/style.css', import.meta.url).href;
    document.head.appendChild(link);
    cssLoaded = true;
}

export async function mountReact(viewId, ctx) {
    loadReactCss();
    const [bridge, cloud, stay, rooms, prefs, settings, ums, transport, checkin, timefmt] = await Promise.all([
        import('../react/bridge.js'),
        import('./core/cloud.js'), import('./core/stay.js'), import('./core/rooms.js'), import('./core/prefs.js'),
        import('./core/settings.js'), import('./core/ums.js'), import('./core/transport.js'), import('./core/checkin.js'), import('./core/timefmt.js'),
    ]);
    // loadCore('hijri') → any other core module a page needs, imported lazily and shared with the legacy pages
    const loadCore = (name) => import(`./core/${name}.js`);
    const loadApp = (path) => import(`./${path}`);        // any file of pms/app (e.g. views/changelog/data.js, regenerated at every deploy)
    return bridge.mountPage(viewId, { ...ctx, views: VIEWS, loadCore, loadApp, core: { cloud, stay, rooms, prefs, settings, ums, transport, checkin, timefmt } });
}

/** Download a React page's code (and the shared modules) without showing it — see warmAllPages in main.js. */
export async function preloadReact(viewId) {
    loadReactCss();
    const bridge = await import('../react/bridge.js');
    await Promise.all(['cloud', 'stay', 'rooms', 'prefs', 'settings', 'ums', 'transport', 'checkin', 'timefmt'].map(n => import(`./core/${n}.js`)));
    await bridge.preloadPage(viewId);
}
