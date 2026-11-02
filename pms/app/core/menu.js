// The menu groups a login sees: the standard NAV (config.js) or the login's own (Settings → Menu: prefs navMenu / navHidden; two levels only —
// groups and their pages; pages added to the PMS later land in "New pages"). Shared by the old menu bar (core/nav.js), the React shell and Settings.
import { VIEWS, NAV } from '../config.js';
import { getPrefs } from './prefs.js';

const viewById = Object.fromEntries(VIEWS.map(v => [v.id, v]));

// Pages never offered in a menu group of their own (Settings lives in the login's dropdown)
export const NOT_IN_MENU = new Set(['home', 'login', 'blank', 'settings']);
export const NOT_IN_SEARCH = new Set(['home', 'login', 'blank']);

/** The menu to show: the login's own groups (Settings → Menu) or the standard NAV; unplaced new pages at the end. */
export function menuFor(p = getPrefs()) {
    if (!Array.isArray(p.navMenu)) return NAV.map((c, i) => ({ id: `g${i}`, label: c.label, views: c.views.filter(id => viewById[id]) }));
    const used = new Set(), groups = [];
    for (const g of p.navMenu) {
        const views = (Array.isArray(g?.views) ? g.views : []).filter(id => viewById[id] && !NOT_IN_MENU.has(id) && !used.has(id));
        views.forEach(v => used.add(v));
        groups.push({ id: `g${groups.length}`, label: String(g?.label || '').trim() || 'Untitled', views });
    }
    const hidden = new Set(Array.isArray(p.navHidden) ? p.navHidden : []);
    const fresh = VIEWS.filter(v => !v.hidden && !NOT_IN_MENU.has(v.id) && !used.has(v.id) && !hidden.has(v.id)).map(v => v.id);
    if (fresh.length) groups.push({ id: `g${groups.length}`, label: 'New pages', views: fresh });
    return groups;
}
