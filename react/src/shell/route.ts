// Which page an address opens (the rules of the legacy router, pms/app/legacy-shell.js route()), as a pure function:
// #/<site>/<view>?<params>, e.g. #/makkah/slip?sh_no=38480. Not logged in → the login page; no page in the address → the login's start page
// (Settings); a page the login may not open → its first allowed page (with a notice, except for Home); a non-admin login stays on its own site.
export type View = { id: string; label: string; title: string; hidden?: boolean; hint?: string; key?: string };
export type Desk = { id: number; name: string; site: string; role: string; [k: string]: unknown };
export type RouteDeps = {
    SITES: Record<string, { id: string; label: string; brand?: string; [k: string]: unknown }>;
    VIEWS: View[];
    NAV: { label: string; views: string[] }[];
    DEFAULT_SITE: string;
    desk: Desk | null;
    prefs: { startSite?: string; startView?: string };
    lastSite: string | null;                       // localStorage pms_last_site
    siteFor: (desk: Desk, siteId: string) => string;
    canOpen: (viewId: string, desk: Desk) => boolean;
    firstPage: (desk: Desk, order: string[]) => string;
};
export type Resolved = { siteId: string; view: View; params: URLSearchParams; replace: string | null; notice: string | null; key: string };

// pages that were removed open the page that took over their job (Movement was folded into Check-ins, 2026-10-27)
const VIEW_ALIAS: Record<string, string> = { movement: 'checkins' };

export function parseHash(hash: string) {
    const raw = hash.replace(/^#\/?/, '');
    const [path, query = ''] = raw.split('?');
    const [siteId = '', rawView = ''] = path.split('/');
    return { siteId, viewId: VIEW_ALIAS[rawView] || rawView, params: new URLSearchParams(query) };
}

export function href(siteId: string, viewId: string, params?: URLSearchParams | Record<string, string>) {
    const q = params ? new URLSearchParams(params as Record<string, string>).toString() : '';
    return `#/${siteId}/${viewId}${q ? '?' + q : ''}`;
}

export function resolve(hash: string, d: RouteDeps): Resolved {
    const asked = parseHash(hash);
    const { desk } = d;
    const byId = (id: string) => d.VIEWS.find(v => v.id === id);
    const lastSite = d.SITES[d.prefs.startSite || ''] ? d.prefs.startSite! : d.SITES[d.lastSite || ''] ? d.lastSite! : d.DEFAULT_SITE;
    let siteId = d.SITES[asked.siteId] ? asked.siteId : desk?.site || lastSite;
    if (desk) siteId = d.siteFor(desk, siteId);
    const start = !asked.viewId ? d.VIEWS.find(v => v.id === d.prefs.startView && v.id !== 'login') : undefined;
    let view = !desk ? byId('login')! : d.VIEWS.find(v => v.id === asked.viewId && v.id !== 'login') || start || byId('home')!;
    let notice: string | null = null;
    if (desk && !d.canOpen(view.id, desk)) {
        if (view.id !== 'home') notice = `${view.label} is not available for ${desk.name}. Ask the admin if you need it.`;
        view = byId(d.firstPage(desk, d.NAV.flatMap(c => c.views))) || byId('blank') || view;
    }
    const params = new URLSearchParams(asked.params);
    params.delete('source');   // old *_web redirects asked for the Cloud source; everything is cloud now
    const replace = desk && (siteId !== asked.siteId || view.id !== asked.viewId || asked.params.has('source')) ? href(siteId, view.id, params) : null;
    return { siteId, view, params, replace, notice, key: `${desk ? desk.id : '-'}/${siteId}/${view.id}/${params}` };
}
