import { Component, Suspense, lazy, useEffect, useMemo, useRef, useState, useSyncExternalStore, type ComponentType, type LazyExoticComponent, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/sonner';
import { PmsProvider } from '@/pms/PmsContext';
import type { CoreModules, PmsCtx } from '@/pms/types';
import { PAGES } from '@/page-list';
import { href, parseHash, resolve, type Desk, type Resolved, type View } from './route';
import { SiteNav } from './SiteNav';
import { navStore, store } from './store';

// The React shell: the menu bar (SiteNav), the hash router (route.ts — the legacy router's rules) and the frame every page opens in, all in one
// React root, so moving between pages no longer builds a new React app each time. Started by pms/app/react-shell.js when switched on (main.js);
// what runs behind the pages (sync, login events, badge, watchdog …) stays in pms/app/services.js, which drives this shell through mountShell()'s API.
// A page that is not React yet (Print slips) or is asked for with ?legacy=1 opens as its old view (app/views/<id>/) inside the same frame.
// What a page leaves behind is cleaned up when it is left, as the legacy router did: elements it added to <body>, <style> tags it added to <head>,
// and the inline style / class it set on <html> and <body>.

export type ShellDeps = {
    core: CoreModules;
    config: { SITES: Record<string, any>; VIEWS: View[]; NAV: { label: string; views: string[] }[]; DEFAULT_SITE: string; LEGACY_PAGES?: Record<string, string> };
    menu: { menuFor: (p?: any) => { id: string; label: string; views: string[] }[]; NOT_IN_SEARCH: Set<string> };
    analytics: { pageview: (siteId: string, viewId: string) => void };
    watchTables: (root: HTMLElement) => () => void;
    createDb: (siteId: string) => any;
    loadCore: (name: string) => Promise<any>;
    loadApp: (path: string) => Promise<any>;
    openAssistant: () => Promise<unknown>;
};
type Route = Resolved & { nonce: number };

const LAST_SITE_KEY = 'pms_last_site';
const routeStore = store<Route | null>(null);
const deskTick = store(0);   // the login's rights / name changed while the page stays: redraw the menu
const lazyPages = new Map<string, LazyExoticComponent<ComponentType>>();
const pageOf = (id: string) => { if (!lazyPages.has(id)) lazyPages.set(id, lazy(PAGES[id])); return lazyPages.get(id)!; };
const legacyAsked = () => {
    try { return new URLSearchParams(location.search).get('legacy') === '1' || new URLSearchParams(location.hash.split('?')[1] || '').get('legacy') === '1'; } catch { return false; }
};
const outlet = () => document.getElementById('view');

/** Start the shell; returns the API services.js uses (see pms/app/services.js). */
export function mountShell(deps: ShellDeps) {
    const { core, config } = deps;
    const cloud = core.cloud as any, prefs = core.prefs as any;
    let nonce = 0;
    // the placeholders of index.html (the legacy shell's <site-nav> and #view) give way to the shell's own
    document.querySelectorAll('body > site-nav, body > #view').forEach(el => el.remove());
    const host = document.createElement('div');
    host.id = 'pms-shell';
    host.dataset.shell = '';
    host.style.display = 'contents';   // no box of its own: the menu bar stays sticky to the page, #view keeps its place in the page CSS
    document.body.prepend(host);

    function route(force = false) {
        const desk = cloud.currentDesk() as Desk | null;
        let lastSite: string | null = null;
        try { lastSite = localStorage.getItem(LAST_SITE_KEY); } catch { /* private window */ }
        const r = resolve(location.hash, {
            SITES: config.SITES, VIEWS: config.VIEWS, NAV: config.NAV, DEFAULT_SITE: config.DEFAULT_SITE, desk, prefs: prefs.getPrefs(), lastSite,
            siteFor: cloud.siteFor, canOpen: cloud.canOpen, firstPage: cloud.firstPage,
        });
        if (r.replace) history.replaceState(null, '', r.replace);
        try { localStorage.setItem(LAST_SITE_KEY, r.siteId); } catch { /* private window */ }
        if (r.notice) navStore.notice(r.notice);
        const prev = routeStore.get();
        if (!force && prev && prev.key === r.key) return;
        document.title = `${r.view.title} · ${config.SITES[r.siteId].label}`;
        deps.analytics.pageview(r.siteId, r.view.id);
        // keep the old page's height while the new one loads, so the footer and the rest do not jump up and back down
        const out = outlet();
        if (out) { if (out.offsetHeight) out.style.minHeight = `${out.offsetHeight}px`; out.setAttribute('aria-busy', 'true'); }
        window.dispatchEvent(new CustomEvent('pms:route-start', { detail: { view: r.view.id, site: r.siteId } }));
        routeStore.set({ ...r, nonce: ++nonce });
    }
    window.addEventListener('hashchange', () => route());

    createRoot(host).render(<ShellRoot deps={deps} />);

    return {
        route: () => route(),
        forceRoute: () => route(true),
        unmount: () => routeStore.set(null),
        setBadge: (text: string, warn?: boolean) => navStore.setBadge(text, warn),
        notice: (text: string) => navStore.notice(text),
        setRoute: () => deskTick.set(deskTick.get() + 1),
        siteId: () => parseHash(location.hash).siteId,
        viewId: () => parseHash(location.hash).viewId,
        preload: async (id: string) => {
            if (PAGES[id]) { await PAGES[id](); return; }
            await Promise.all([legacyHtml(id), deps.loadApp(`views/${id}/view.js`), fetch(`app/views/${id}/view.css`)]);
        },
    };
}

function ShellRoot({ deps }: { deps: ShellDeps }) {
    const r = useSyncExternalStore(routeStore.subscribe, routeStore.get);
    useSyncExternalStore(deskTick.subscribe, deskTick.get);
    const cloud = deps.core.cloud as any;
    const desk = r ? (cloud.currentDesk() as Desk | null) : null;
    const navDeps = useMemo(() => ({
        SITES: deps.config.SITES, VIEWS: deps.config.VIEWS, menuFor: deps.menu.menuFor, NOT_IN_SEARCH: deps.menu.NOT_IN_SEARCH,
        prefs: deps.core.prefs as any, canOpen: cloud.canOpen, openAssistant: deps.openAssistant,
    }), [deps]);   // eslint-disable-line react-hooks/exhaustive-deps
    const siteChange = (s: string) => { const { viewId, params } = parseHash(location.hash); location.hash = href(s, viewId || 'home', params); };
    return (
        <TooltipProvider>
            <SiteNav deps={navDeps} siteId={r?.siteId || ''} viewId={r?.view.id || ''} desk={desk} onSiteChange={siteChange} onLogout={() => { void cloud.logout(); }} />
            <div id="view" data-shell="" data-view={r?.view.id}>
                {r && <PageFrame key={`${r.key}#${r.nonce}`} r={r} deps={deps} />}
            </div>
            <div className="pms-react"><Toaster /></div>
        </TooltipProvider>
    );
}

// Each page gets a slips db whose calls stop settling once the page is left, so a page still loading cannot write into the next one (as the legacy router).
function scopeDb(base: any) {
    const scope = { alive: true };
    const never = () => new Promise<never>(() => { });
    const db: any = { ...base };
    for (const [k, fn] of Object.entries(base)) {
        if (typeof fn !== 'function') continue;
        db[k] = (...args: unknown[]) => {
            if (!scope.alive) return never();
            return (fn as (...a: unknown[]) => Promise<unknown>)(...args).then(v => (scope.alive ? v : never()), e => (scope.alive ? Promise.reject(e) : never()));
        };
    }
    const guard = <T,>(p: Promise<T>) => Promise.resolve(p).then(v => (scope.alive ? v : never()), e => (scope.alive ? Promise.reject(e) : never()));
    return { db, guard, end: () => { scope.alive = false; } };
}

// The inline style / class of <html> and <body> before any page: every page leaves them as they were then. Not taken per page — the next page is
// drawn while the one before is still up, so a dialog open on it (Radix puts pointer-events: none on <body>) would be taken for "how it was" and
// put back later, leaving the whole page unclickable (seen 2026-11-02).
let baseAttrs: { rootStyle: string | null; bodyStyle: string | null; bodyClass: string | null } | null = null;

function PageFrame({ r, deps }: { r: Route; deps: ShellDeps }) {
    const { siteId, view, params } = r;
    // taken while rendering, before this page adds anything (what the page before left is removed by its own clean-up)
    const [before] = useState(() => {
        baseAttrs ??= { rootStyle: document.documentElement.getAttribute('style'), bodyStyle: document.body.getAttribute('style'), bodyClass: document.body.getAttribute('class') };
        return { body: new Set(Array.from(document.body.children)), head: new Set(Array.from(document.head.children)), ...baseAttrs };
    });
    const [scoped] = useState(() => scopeDb(deps.createDb(siteId)));
    const [client] = useState(() => new QueryClient({ defaultOptions: { queries: { retry: false, refetchOnWindowFocus: false } } }));
    const ctx = useMemo<PmsCtx>(() => ({
        site: deps.config.SITES[siteId], siteId, db: scoped.db, guard: scoped.guard, params,
        get root() { return outlet()!; },   // #view is drawn in the same pass as the first page, so it is looked up when asked for
        navigate: (v, p) => { location.hash = href(siteId, v, p); }, href: (v, p) => href(siteId, v, p),
        core: deps.core, views: deps.config.VIEWS, loadApp: deps.loadApp, loadCore: deps.loadCore,
    }), []);   // eslint-disable-line react-hooks/exhaustive-deps
    const sent = useRef(false);
    const done = (ok: boolean) => {
        if (sent.current) return;
        sent.current = true;
        const out = outlet();
        if (out) { out.removeAttribute('aria-busy'); out.style.minHeight = ''; }
        window.dispatchEvent(new CustomEvent('pms:route-done', { detail: { view: view.id, site: siteId, ok } }));
    };
    useEffect(() => {
        window.scrollTo(0, 0);
        return () => {
            scoped.end();
            client.clear();
            for (const el of Array.from(document.body.children)) if (!before.body.has(el) && !('shell' in (el as HTMLElement).dataset)) el.remove();
            for (const el of Array.from(document.head.children)) if (!before.head.has(el) && el.tagName === 'STYLE') el.remove();
            const restore = (el: Element, attr: string, val: string | null) => (val == null ? el.removeAttribute(attr) : el.setAttribute(attr, val));
            restore(document.documentElement, 'style', before.rootStyle);
            restore(document.body, 'style', before.bodyStyle);
            restore(document.body, 'class', before.bodyClass);
        };
    }, []);   // eslint-disable-line react-hooks/exhaustive-deps

    if (!PAGES[view.id] || legacyAsked()) return <LegacyPage id={view.id} ctx={ctx} deps={deps} onDone={done} />;
    const Page = pageOf(view.id);
    return (
        <QueryClientProvider client={client}>
            <PmsProvider ctx={ctx}>
                <div className="pms-react">
                    <Failsafe title={view.title} onError={() => done(false)}>
                        <Suspense fallback={null}><Mounted onMounted={() => done(true)}><Page /></Mounted></Suspense>
                    </Failsafe>
                </div>
            </PmsProvider>
        </QueryClientProvider>
    );
}

/** tells the shell the page is showing (its own effects have run: children's effects run before this one) */
function Mounted({ onMounted, children }: { onMounted: () => void; children: ReactNode }) {
    useEffect(() => { onMounted(); }, []);   // eslint-disable-line react-hooks/exhaustive-deps
    return <>{children}</>;
}

const failBox = (title: string, err: unknown) => (
    <div style={{ maxWidth: 720, margin: '40px auto', padding: 16, border: '1px solid #e6bcbc', background: '#fff1f1', borderRadius: 12, font: '14px system-ui' }}>
        <b>Could not open “{title}”.</b><br />{String((err as Error)?.message || err)}
    </div>
);
class Failsafe extends Component<{ title: string; onError: () => void; children: ReactNode }, { err: unknown }> {
    state = { err: null as unknown };
    static getDerivedStateFromError(err: unknown) { return { err }; }
    componentDidCatch(err: unknown) { console.error(err); this.props.onError(); }
    render() { return this.state.err ? failBox(this.props.title, this.state.err) : this.props.children; }
}

// ---- pages that are not React yet: app/views/<id>/view.html + view.css + view.js (default export mount(ctx)) ----
const htmlCache = new Map<string, Promise<string>>();
const legacyHtml = (id: string) => {
    if (!htmlCache.has(id)) htmlCache.set(id, fetch(`app/views/${id}/view.html`).then(r => { if (!r.ok) throw new Error(`No page "${id}"`); return r.text(); }));
    return htmlCache.get(id)!;
};

function LegacyPage({ id, ctx, deps, onDone }: { id: string; ctx: PmsCtx; deps: ShellDeps; onDone: (ok: boolean) => void }) {
    const hostRef = useRef<HTMLDivElement>(null);
    const [err, setErr] = useState<unknown>(null);
    useEffect(() => {
        let alive = true, cleanup: (() => void) | undefined, stopTables: (() => void) | undefined;
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = `app/views/${id}/view.css`;
        link.dataset.shell = '';
        const cssLoaded = new Promise(res => { link.onload = link.onerror = res; });
        document.head.insertBefore(link, document.getElementById('responsive-css'));   // before the shell's responsive.css so its phone rules win
        void (async () => {
            try {
                const [html, mod] = await Promise.all([legacyHtml(id), deps.loadApp(`views/${id}/view.js`), cssLoaded]);
                const root = hostRef.current;
                if (!alive || !root) return;
                root.innerHTML = html;
                // old links inside the markup (href="accommodation_slip.html") → hash routes
                const legacy = deps.config.LEGACY_PAGES || {};
                root.querySelectorAll('a[href]').forEach(a => {
                    const m = (a.getAttribute('href') || '').match(/^(?:\.\/)?([\w-]+\.html)(\?.*)?$/);
                    if (m && legacy[m[1]]) a.setAttribute('href', `#/${ctx.siteId}/${legacy[m[1]]}${m[2] || ''}`);
                });
                stopTables = deps.watchTables(root);   // data tables become cards on phones
                const c = await mod.default({ ...ctx, root });
                if (typeof c === 'function') { if (alive) cleanup = c; else c(); }
                onDone(true);
            } catch (e) {
                console.error(e);
                if (alive) { setErr(e); onDone(false); }
            }
        })();
        return () => {
            alive = false;
            try { cleanup?.(); } catch (e) { console.error('view cleanup failed', e); }
            stopTables?.();
            link.remove();
        };
    }, []);   // eslint-disable-line react-hooks/exhaustive-deps
    return err ? failBox(id, err) : <div ref={hostRef} className="pms-legacy-view" style={{ display: 'contents' }} />;
}
