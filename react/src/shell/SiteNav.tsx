import { Fragment, useEffect, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import navCss from './nav.css?raw';
import { navStore } from './store';
import type { Desk, View } from './route';

// The menu bar of the React shell — the same bar as core/nav.js (same markup, classes and stylesheet, inside the <site-nav> element's shadow root):
//   laptop (> 900px): one top bar (brand · menu groups · ✨ · 🔍 · login menu) or, Settings → Menu → Left side, a sidebar; then the quick links
//   phone / tablet (≤ 900px): a compact bar with ☰ opening a drawer
// Groups come from core/menu.js (the standard NAV or the login's own menu). Only pages the login may open are listed. Alt+<key> page shortcuts
// (Settings), Ctrl+K quick search, Esc closes. The sync line and notices come from the shell (store.ts).

declare module 'react' {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace JSX { interface IntrinsicElements { 'site-nav': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & { 'data-shell'?: string } } }
}

type Group = { id: string; label: string; views: string[] };
export type NavDeps = {
    SITES: Record<string, { id: string; label: string; brand?: string }>;
    VIEWS: View[];
    menuFor: (prefs?: any) => Group[];
    NOT_IN_SEARCH: Set<string>;
    prefs: { getPrefs: () => any; shortcutFor: (id: string) => string; modLabel: () => string; matchesShortcut: (e: KeyboardEvent) => string | null };
    canOpen: (viewId: string, desk: Desk) => boolean;
    openAssistant: () => Promise<unknown>;
};

const isEditable = (el: Element | null) => !!el && (['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName) || (el as HTMLElement).isContentEditable);
const sideMq = () => window.matchMedia('(min-width: 901px)');

export function SiteNav({ deps, siteId, viewId, desk, onSiteChange, onLogout }: {
    deps: NavDeps; siteId: string; viewId: string; desk: Desk | null; onSiteChange: (site: string) => void; onLogout: () => void;
}) {
    const hostRef = useRef<HTMLElement>(null);
    const [shadow, setShadow] = useState<ShadowRoot | null>(null);
    useLayoutEffect(() => { const h = hostRef.current!; setShadow(h.shadowRoot || h.attachShadow({ mode: 'open' })); }, []);
    const [prefs, setPrefs] = useState(() => deps.prefs.getPrefs());
    const [wide, setWide] = useState(() => sideMq().matches);
    const side = prefs.navLayout === 'side' && wide && !!desk;
    useEffect(() => {
        const onPrefs = () => setPrefs(deps.prefs.getPrefs());
        const mq = sideMq(), onMq = () => setWide(mq.matches);
        window.addEventListener('pms:prefs', onPrefs);
        mq.addEventListener('change', onMq);
        return () => { window.removeEventListener('pms:prefs', onPrefs); mq.removeEventListener('change', onMq); };
    }, []);   // eslint-disable-line react-hooks/exhaustive-deps
    // the page moves right of the sidebar (core/responsive.css: html[data-nav="side"])
    useEffect(() => {
        const h = hostRef.current!;
        if (side) { h.setAttribute('data-layout', 'side'); document.documentElement.dataset.nav = 'side'; }
        else { h.removeAttribute('data-layout'); delete document.documentElement.dataset.nav; }
        h.toggleAttribute('data-no-sync-text', !prefs.showSyncText);
    }, [side, prefs.showSyncText]);

    return (
        <site-nav ref={hostRef} data-shell="" hidden={!desk || undefined}>{/* React 18 writes hidden="false" on a custom element, which still hides it */}
            {shadow && desk && createPortal(<>
                <style>{navCss}</style>
                <Bar deps={deps} siteId={siteId} viewId={viewId} desk={desk} prefs={prefs} wide={wide} host={hostRef} onSiteChange={onSiteChange} onLogout={onLogout} />
            </>, shadow)}
        </site-nav>
    );
}

function Bar({ deps, siteId, viewId, desk, prefs, wide, host, onSiteChange, onLogout }: {
    deps: NavDeps; siteId: string; viewId: string; desk: Desk; prefs: any; wide: boolean; host: React.RefObject<HTMLElement | null>; onSiteChange: (s: string) => void; onLogout: () => void;
}) {
    const { SITES, VIEWS, canOpen } = deps;
    const viewById = useMemo(() => Object.fromEntries(VIEWS.map(v => [v.id, v])), [VIEWS]);
    const { badge, notice } = useSyncExternalStore(navStore.subscribe, navStore.get);
    const [dd, setDd] = useState<string | null>(null);                  // open dropdown: a group id or 'desk'
    const [drawer, setDrawer] = useState(false), [backdrop, setBackdrop] = useState(false);
    const [search, setSearch] = useState(false), [q, setQ] = useState(''), [sel, setSel] = useState(0);
    const menu = useMemo(() => deps.menuFor(prefs).map(g => ({ ...g, views: g.views.filter(v => viewById[v] && canOpen(v, desk)) })).filter(g => g.views.length), [prefs, desk, viewById]);   // eslint-disable-line react-hooks/exhaustive-deps
    const cat = menu.find(c => c.views.includes(viewId));
    const [openGrp, setOpenGrp] = useState<string | null>(cat?.id ?? null);   // sidebar / drawer: the group shown open
    useEffect(() => { setOpenGrp(cat?.id ?? null); }, [viewId, cat?.id]);
    const progRef = useRef<HTMLDivElement>(null), drawerRef = useRef<HTMLElement>(null), burgerRef = useRef<HTMLButtonElement>(null), qsRef = useRef<HTMLInputElement>(null);
    const isAdmin = desk.role === 'admin';
    const canEdit = desk.role === 'admin' || ((desk.role === 'desk' || desk.role === 'siteadmin') && desk.site === siteId);
    const role = canEdit ? desk.role : `${desk.role} · view only here`;
    const to = (v: string, anchor?: string) => `#/${siteId}/${v}${anchor ? `?section=${anchor}` : ''}`;
    const cur = (v: string, anchor?: string) => (v === viewId && !anchor ? 'page' as const : undefined);

    const closeAll = () => { setDd(null); closeDrawer(); };
    const openDrawer = () => { setBackdrop(true); requestAnimationFrame(() => setDrawer(true)); };
    function closeDrawer() {
        setDrawer(d => {
            if (d) { setTimeout(() => setBackdrop(false), 200); burgerRef.current?.focus({ preventScroll: true }); }
            return false;
        });
    }
    const openSearch = () => { setDd(null); closeDrawer(); setQ(''); setSel(0); setSearch(true); setTimeout(() => qsRef.current?.focus(), 0); };
    useEffect(() => {
        if (drawer) ((drawerRef.current?.querySelector('.dr-body .mi[aria-current="page"]') || drawerRef.current?.querySelector('#drClose')) as HTMLElement | null)?.focus();
    }, [drawer]);
    useEffect(() => { if (wide) closeDrawer(); }, [wide]);   // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        const onDocClick = (e: MouseEvent) => { if (host.current && !e.composedPath().includes(host.current)) setDd(null); };
        const onKey = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && !e.altKey && (e.key === 'k' || e.key === 'K')) { e.preventDefault(); openSearch(); return; }
            if (e.key === 'Escape') { setDd(null); closeDrawer(); setSearch(false); return; }
            if (!e.altKey || isEditable(document.activeElement)) return;
            const id = deps.prefs.matchesShortcut(e);   // keys and modifier from Settings
            if (!id) return;
            e.preventDefault();
            location.hash = `#/${siteId}/${id}`;
        };
        const onScroll = () => {
            const top = document.documentElement.scrollTop || document.body.scrollTop;
            const h = (document.documentElement.scrollHeight - document.documentElement.clientHeight) || 1;
            if (progRef.current) progRef.current.style.width = `${Math.max(0, Math.min(1, top / h)) * 100}%`;
        };
        document.addEventListener('click', onDocClick);
        window.addEventListener('keydown', onKey);
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => { document.removeEventListener('click', onDocClick); window.removeEventListener('keydown', onKey); window.removeEventListener('scroll', onScroll); };
    }, [siteId]);   // eslint-disable-line react-hooks/exhaustive-deps

    const kbd = (id: string) => {
        const key = deps.prefs.shortcutFor(id);
        return <kbd hidden={!key || !prefs.showKeyHints}>{key ? `${deps.prefs.modLabel()} ${key.toUpperCase()}` : ''}</kbd>;
    };
    const items = (g: Group) => g.views.map(id => (
        <a key={id} className="mi" role="menuitem" href={to(id)} aria-current={cur(id)} onClick={closeAll}><span className="mi-l">{viewById[id].label}{kbd(id)}</span></a>
    ));
    const caret = <i className="caret" />;
    const brand = (cls = 'brand', id?: string) => <a className={cls} id={id} href={`#/${siteId}/home`} onClick={closeAll}><span className="b1">Faiz E Hashemi</span><span className="b2">{SITES[siteId]?.brand}</span></a>;
    const pickSite = (s: string) => { closeAll(); onSiteChange(s); };
    const logout = () => { closeAll(); onLogout(); };
    const quick = (prefs.quickLinks || []).filter((id: string) => viewById[id] && canOpen(id, desk));

    // quick search over every page this login may open
    const groupOf = Object.fromEntries(menu.flatMap(g => g.views.map(v => [v, g.label])));
    const found = useMemo(() => {
        if (!search) return [];
        const s = q.trim().toLowerCase();
        return VIEWS.filter(v => (!v.hidden || v.id === 'settings') && !deps.NOT_IN_SEARCH.has(v.id) && canOpen(v.id, desk))
            .map(v => ({ v, hay: `${v.label} ${v.title} ${v.hint || ''} ${groupOf[v.id] || ''}`.toLowerCase() }))
            .filter(x => !s || s.split(/\s+/).every(w => x.hay.includes(w)))
            .sort((a, b) => (Number(!!s && b.v.label.toLowerCase().startsWith(s)) - Number(!!s && a.v.label.toLowerCase().startsWith(s))) || a.v.label.localeCompare(b.v.label))
            .slice(0, 30);
    }, [search, q, desk]);   // eslint-disable-line react-hooks/exhaustive-deps
    const go = (id: string) => { location.hash = to(id); setSearch(false); };

    const deskMenu = (
        <div className="menu right" role="menu">
            <div className="mi static"><span className="mi-l">{desk.name}</span><span className="mi-h">{SITES[desk.site]?.label} · {role}</span></div>
            {isAdmin && <div className="site-sw">{Object.values(SITES).map(s => (
                <button key={s.id} type="button" className="mi site-mi" role="menuitem" aria-pressed={s.id === siteId} onClick={() => pickSite(s.id)}><span className="mi-l">{s.label}</span><span className="mi-h">Show {s.label} data</span></button>))}</div>}
            {canOpen('settings', desk) && <>
                <a className="mi" role="menuitem" href={to('settings')} aria-current={cur('settings')} onClick={closeAll}><span className="mi-l">Settings</span><span className="mi-h">Look, quick links, shortcuts — same on every device</span></a>
                <a className="mi" role="menuitem" href={to('settings', 'password')} onClick={closeAll}><span className="mi-l">Change password</span><span className="mi-h">For this desk login</span></a></>}
            {canOpen('setup', desk) && <a className="mi" role="menuitem" href={to('setup')} aria-current={cur('setup')} onClick={closeAll}><span className="mi-l">Setup</span><span className="mi-h">This desk, sync, desk logins</span></a>}
            <button type="button" className="mi logout" role="menuitem" onClick={logout}><span className="mi-l">Log out</span><span className="mi-h">Removes this computer's copy of the data</span></button>
        </div>
    );
    const ddProps = (id: string) => ({
        className: `dd${dd === id ? ' open' : ''}${cat?.id === id ? ' active' : ''}`,
        onMouseEnter: () => { if (dd && dd !== id && dd !== 'desk') setDd(id); },
    });
    const toggle = (id: string) => (e: React.MouseEvent) => {
        e.stopPropagation();
        const open = dd !== id;
        setDd(open ? id : null);
        const el = e.currentTarget.parentElement;
        if (open && e.detail === 0) setTimeout(() => (el?.querySelector('.mi:not(.static)') as HTMLElement | null)?.focus(), 0);   // opened by keyboard
    };
    const grpToggle = (id: string) => () => setOpenGrp(g => (g === id ? null : id));

    return (<>
        <header className="bar" role="navigation" aria-label="Main" onKeyDown={e => { if (e.key === 'Escape') closeAll(); }}>
            <button type="button" ref={burgerRef} className="burger" id="burger" aria-label="Open menu" aria-controls="drawer" aria-expanded={drawer} onClick={openDrawer}><span /><span /><span /></button>
            {brand('brand', 'brand')}
            <span className="here" id="here">{viewById[viewId]?.hidden ? '' : viewById[viewId]?.label || ''}</span>
            <nav className="cats" id="cats">
                {menu.map(c => c.views.length === 1
                    ? <a key={c.id} className={`cat solo${cat?.id === c.id ? ' active' : ''}`} href={to(c.views[0])} aria-current={cur(c.views[0])} onClick={closeAll}>{c.label}</a>
                    : <div key={c.id} {...ddProps(c.id)}>
                        <button type="button" className="cat" aria-haspopup="true" aria-expanded={dd === c.id} onClick={toggle(c.id)}>{c.label}{caret}</button>
                        <div className="menu" role="menu">{items(c)}</div>
                    </div>)}
            </nav>
            <div className="tools">
                <button type="button" className="srch ai" title="Ask the PMS — read-only AI assistant" aria-label="Ask the PMS (AI assistant)" onClick={() => { closeAll(); deps.openAssistant().catch(() => { }); }}>✨</button>
                <button type="button" className="srch" title="Find a page (Ctrl+K)" aria-label="Find a page" onClick={openSearch}>🔍</button>
                <div className={`dd desk-dd${dd === 'desk' ? ' open' : ''}`}>
                    <button type="button" className="desk" id="deskBtn" aria-haspopup="true" aria-expanded={dd === 'desk'} onClick={toggle('desk')}><span id="deskName">{desk.name} · {SITES[siteId]?.label || ''}</span>{caret}</button>
                    {deskMenu}
                </div>
                <span className={`sync${badge.warn ? ' warn' : ''}`} id="sync" title={badge.text}><i /><span id="syncText">{badge.warn ? 'Offline' : badge.text.replace(/ ·.*$/, '')}</span></span>
            </div>
            <div className="progress" aria-hidden="true" ref={progRef} />
        </header>
        <nav className="quick" id="quick" aria-label="Quick links" hidden={!quick.length}>
            {quick.map((id: string) => <a key={id} href={to(id)} aria-current={cur(id)}>{viewById[id].label}</a>)}
        </nav>
        <div className="notice" id="notice" role="status" hidden={!notice}>{notice}</div>

        <div className={`backdrop${drawer ? ' show' : ''}`} id="backdrop" hidden={!backdrop} onClick={closeDrawer} />
        <aside ref={drawerRef} className={`drawer${drawer ? ' open' : ''}`} id="drawer" aria-label="Menu" aria-hidden={!drawer}>
            <div className="dr-head">{brand('brand', 'drBrand')}<button type="button" className="close" id="drClose" aria-label="Close menu" onClick={closeDrawer}>✕</button></div>
            <div className="dr-body" id="drBody">
                {menu.map(c => (
                    <section key={c.id} className={`dr-sec${openGrp === c.id ? ' open' : ''}`}>
                        <button type="button" className="dr-h" aria-expanded={openGrp === c.id} onClick={grpToggle(c.id)}>{c.label}{caret}</button>
                        <div className="dr-items">{items(c)}</div>
                    </section>))}
            </div>
            <div className="dr-foot">
                <div className="dr-desk" id="drDesk">{desk.name}<small>{SITES[desk.site]?.label} · {role}</small></div>
                <div className={`dr-sync${badge.warn ? ' warn' : ''}`} id="drSync">{badge.text}</div>
                {canOpen('settings', desk) && <><a className="dr-link" href={to('settings')} onClick={closeAll}>Settings</a><a className="dr-link" href={to('settings', 'password')} onClick={closeAll}>Change password</a></>}
                {isAdmin && <div className="dr-admin">{Object.values(SITES).map(s => <button key={s.id} type="button" className="dr-link" aria-pressed={s.id === siteId} onClick={() => pickSite(s.id)}>View {s.label} (admin)</button>)}</div>}
                <button type="button" className="dr-logout" onClick={logout}>Log out</button>
            </div>
        </aside>

        <aside className="side" id="side" aria-label="Menu">
            {brand('brand sd-brand')}
            <button type="button" className="sd-search" onClick={openSearch}>🔍 <span>Find a page</span><kbd>Ctrl K</kbd></button>
            <div className="sd-body" id="sdBody">
                {menu.map(c => c.views.length === 1
                    ? <a key={c.id} className={`sd-solo${cat?.id === c.id ? ' active' : ''}`} href={to(c.views[0])} aria-current={cur(c.views[0])}>{c.label}</a>
                    : <section key={c.id} className={`sd-grp${openGrp === c.id ? ' open' : ''}${cat?.id === c.id ? ' active' : ''}`}>
                        <button type="button" className="sd-h" aria-expanded={openGrp === c.id} onClick={grpToggle(c.id)}>{c.label}{caret}</button>
                        <div className="sd-items">{items(c)}</div>
                    </section>)}
            </div>
            <div className="sd-foot">
                <div className="sd-desk" id="sdDesk">{desk.name} · {SITES[siteId]?.label || ''}<small>{role}</small></div>
                <div className={`sd-sync${badge.warn ? ' warn' : ''}`} id="sdSync">{badge.text}</div>
                <div className="sd-links">
                    {canOpen('settings', desk) && <a href={to('settings')} aria-current={cur('settings')}>Settings</a>}
                    {canOpen('setup', desk) && <a href={to('setup')} aria-current={cur('setup')}>Setup</a>}
                    {isAdmin && <span>{Object.values(SITES).map(s => <button key={s.id} type="button" aria-pressed={s.id === siteId} onClick={() => pickSite(s.id)}>{s.label}</button>)}</span>}
                    <button type="button" className="sd-logout" onClick={logout}>Log out</button>
                </div>
            </div>
        </aside>

        {search && (
            <div className="qs-back" id="qsBack" onClick={e => { if (e.target === e.currentTarget) setSearch(false); }}>
                <div className="qs" role="dialog" aria-modal="true" aria-label="Find a page">
                    <input ref={qsRef} id="qsIn" type="search" placeholder="Find a page…" autoComplete="off" spellCheck={false} value={q}
                        onChange={e => { setQ(e.target.value); setSel(0); }}
                        onKeyDown={e => {
                            if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); if (found.length) setSel(i => (i + (e.key === 'ArrowDown' ? 1 : -1) + found.length) % found.length); }
                            else if (e.key === 'Enter') { e.preventDefault(); const x = found[Math.max(0, sel)]; if (x) go(x.v.id); }
                        }} />
                    <div className="qs-list" id="qsList" role="listbox">
                        {found.length ? found.map((x, i) => (
                            <Fragment key={x.v.id}>
                                <a href={to(x.v.id)} className={i === sel ? 'on' : ''} role="option" aria-selected={i === sel} ref={el => { if (i === sel) el?.scrollIntoView({ block: 'nearest' }); }} onClick={() => setSearch(false)}>
                                    <b>{x.v.label}</b><em>{groupOf[x.v.id] || 'not in menu'}</em><small>{x.v.hint || ''}</small>
                                </a>
                            </Fragment>)) : <div className="qs-empty">No page matches.</div>}
                    </div>
                    <div className="qs-hint">↑ ↓ to choose · Enter to open · Esc to close</div>
                </div>
            </div>
        )}
    </>);
}
