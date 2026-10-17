// <site-nav> — the app's navigation.
//   Laptop (> 900px): Settings → Menu → layout "top" (one bar — brand · category menus · desk menu · sync) or "side"
//   (a left sidebar; categories cascade one at a time), then the quick links.
//   Phone/tablet (≤ 900px): compact bar with ☰; the menu opens as a side drawer (same one-at-a-time cascade).
// Categories: NAV / VIEWS in config.js, or the login's own menu (Settings → Menu: prefs navMenu / navHidden; two
// levels only — categories and their pages; pages added to the PMS later land in "New pages"). Alt+<key> shortcuts
// are kept; Ctrl+K (or 🔍) opens a quick search for any page.
// API used by the shell: setRoute(siteId, viewId, desk), setBadge(text, warn);
// events: 'site-change' (detail = siteId; admins only — other logins stay on their own site), 'logout'.
// Only pages the login may open are listed (canOpen); quick links come from Settings.

import { SITES, VIEWS, NAV } from '../config.js';
import { getPrefs, shortcutFor, modLabel, matchesShortcut } from './prefs.js';
import { canOpen } from './cloud.js';

const viewById = Object.fromEntries(VIEWS.map(v => [v.id, v]));
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// Pages never offered in a menu group of their own
const NOT_IN_MENU = new Set(['home', 'login', 'blank']);

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

function menuItems(cat) {
    return cat.views.map(id => viewById[id]).filter(Boolean).map(v => `
        <a class="mi" role="menuitem" data-view="${v.id}" href="#">
            <span class="mi-l">${esc(v.label)}<kbd data-kbd="${v.id}" hidden></kbd></span>
            <span class="mi-h">${esc(v.hint || '')}</span>
        </a>`).join('');
}

class SiteNav extends HTMLElement {
    constructor() {
        super();
        const r = this.attachShadow({ mode: 'open' });
        // admins only: look at the other site (every other login works on its own site)
        const sites = Object.values(SITES).map(s => `<button type="button" class="mi site-mi" role="menuitem" data-site="${s.id}"><span class="mi-l">${esc(s.label)}</span><span class="mi-h">Show ${esc(s.label)} data</span></button>`).join('');
        r.innerHTML = `
      <header class="bar" role="navigation" aria-label="Main">
        <button type="button" class="burger" id="burger" aria-label="Open menu" aria-controls="drawer" aria-expanded="false">
          <span></span><span></span><span></span>
        </button>
        <a class="brand" href="#" id="brand"><span class="b1">Faiz E Hashemi</span><span class="b2"></span></a>
        <span class="here" id="here"></span>

        <nav class="cats" id="cats"></nav>

        <div class="tools">
          <button type="button" class="srch" data-search title="Find a page (Ctrl+K)" aria-label="Find a page">🔍</button>
          <div class="dd desk-dd">
            <button type="button" class="desk" id="deskBtn" aria-haspopup="true" aria-expanded="false"><span id="deskName"></span><i class="caret"></i></button>
            <div class="menu right" role="menu">
              <div class="mi static" id="deskInfo"></div>
              <div class="site-sw" data-admin-only hidden>${sites}</div>
              <a class="mi" role="menuitem" data-view="settings" href="#"><span class="mi-l">Settings</span><span class="mi-h">Look, quick links, shortcuts — same on every device</span></a>
              <a class="mi" role="menuitem" data-view="settings" data-anchor="password" href="#"><span class="mi-l">Change password</span><span class="mi-h">For this desk login</span></a>
              <a class="mi" role="menuitem" data-view="setup" href="#"><span class="mi-l">Setup</span><span class="mi-h">This desk, sync, desk logins</span></a>
              <button type="button" class="mi logout" role="menuitem" data-logout><span class="mi-l">Log out</span><span class="mi-h">Removes this computer's copy of the data</span></button>
            </div>
          </div>
          <span class="sync" id="sync" title=""><i></i><span id="syncText"></span></span>
        </div>
        <div class="progress" aria-hidden="true"></div>
      </header>
      <nav class="quick" id="quick" aria-label="Quick links" hidden></nav>
      <div class="notice" id="notice" role="status" hidden></div>

      <div class="backdrop" id="backdrop" hidden></div>
      <aside class="drawer" id="drawer" aria-label="Menu" aria-hidden="true">
        <div class="dr-head">
          <a class="brand" href="#" id="drBrand"><span class="b1">Faiz E Hashemi</span><span class="b2"></span></a>
          <button type="button" class="close" id="drClose" aria-label="Close menu">✕</button>
        </div>
        <div class="dr-body" id="drBody"></div>
        <div class="dr-foot">
          <div class="dr-desk" id="drDesk"></div>
          <div class="dr-sync" id="drSync"></div>
          <a class="dr-link" data-view="settings" data-anchor="password" href="#">Change password</a>
          <div class="dr-admin" data-admin-only hidden>${Object.values(SITES).map(s => `<button type="button" class="dr-link" data-site="${s.id}">View ${esc(s.label)} (admin)</button>`).join('')}</div>
          <button type="button" class="dr-logout" data-logout>Log out</button>
        </div>
      </aside>

      <!-- left sidebar (Settings → Menu → Left side; laptops) -->
      <aside class="side" id="side" aria-label="Menu">
        <a class="brand sd-brand" href="#"><span class="b1">Faiz E Hashemi</span><span class="b2"></span></a>
        <button type="button" class="sd-search" data-search>🔍 <span>Find a page</span><kbd>Ctrl K</kbd></button>
        <div class="sd-body" id="sdBody"></div>
        <div class="sd-foot">
          <div class="sd-desk" id="sdDesk"></div>
          <div class="sd-sync" id="sdSync"></div>
          <div class="sd-links">
            <a data-view="settings" href="#">Settings</a><a data-view="setup" href="#">Setup</a>
            <span data-admin-only hidden>${Object.values(SITES).map(s => `<button type="button" data-site="${s.id}">${esc(s.label)}</button>`).join('')}</span>
            <button type="button" class="sd-logout" data-logout>Log out</button>
          </div>
        </div>
      </aside>

      <!-- quick search (Ctrl+K) -->
      <div class="qs-back" id="qsBack" hidden>
        <div class="qs" role="dialog" aria-modal="true" aria-label="Find a page">
          <input id="qsIn" type="search" placeholder="Find a page…" autocomplete="off" spellcheck="false">
          <div class="qs-list" id="qsList" role="listbox"></div>
          <div class="qs-hint">↑ ↓ to choose · Enter to open · Esc to close</div>
        </div>
      </div>

      <style>
        :host{
          --gold:#d4af37; --gold-2:#e6b422; --gold-soft:#f3d984; --ink:#1f160f; --muted:#6b5e4a;
          --edge:#e8dcc4; --panel:#fffdf8; --shadow:0 10px 30px rgba(60,40,10,.12);
          display:block; position:sticky; top:0; z-index:1000;
          font:14px/1.4 system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif; color:var(--ink);
        }
        :host([hidden]){ display:none }
        *{ box-sizing:border-box }
        a{ color:inherit; text-decoration:none }
        button{ font:inherit; color:inherit; cursor:pointer }
        kbd{ font:10px/1 ui-monospace,Consolas,monospace; color:var(--muted); border:1px solid var(--edge); border-radius:4px; padding:2px 4px; margin-left:8px; background:#fff }

        .bar{
          position:relative; display:flex; align-items:center; gap:14px;
          padding:8px 18px; min-height:56px;
          background:linear-gradient(180deg,#fffefa,#fff9ec); border-bottom:1px solid var(--edge); box-shadow:var(--shadow);
        }
        .brand{ display:inline-flex; gap:6px; font-weight:800; letter-spacing:.14em; text-transform:uppercase; font-size:14px; white-space:nowrap }
        .brand .b2{ color:var(--gold) }
        .burger, .here{ display:none }

        .cats{ display:flex; align-items:center; gap:2px; margin-left:8px }
        .cat{
          display:inline-flex; align-items:center; gap:6px; border:0; background:none;
          padding:8px 12px; border-radius:10px; font-weight:650; font-size:13.5px; white-space:nowrap;
        }
        .cat:hover, .dd.open > .cat{ background:#fbf1d8 }
        .cat.active, .dd.active > .cat{ color:#8a6512; box-shadow:inset 0 -2px 0 var(--gold) }
        .caret{ width:6px; height:6px; border-right:1.5px solid currentColor; border-bottom:1.5px solid currentColor; transform:rotate(45deg) translateY(-2px); opacity:.6 }

        .dd{ position:relative }
        .menu{
          position:absolute; top:calc(100% + 6px); left:0; min-width:270px; padding:6px;
          background:var(--panel); border:1px solid var(--edge); border-radius:12px; box-shadow:0 18px 40px rgba(60,40,10,.18);
          display:none; z-index:10;
        }
        .menu.right{ left:auto; right:0 }
        .dd.open > .menu{ display:grid; gap:2px }
        .mi{ display:grid; gap:1px; padding:8px 10px; border-radius:8px; border:0; background:none; text-align:left; width:100% }
        .mi:hover, .mi:focus-visible{ background:#fbf1d8; outline:none }
        .mi[aria-current="page"]{ background:#f6e7bf }
        .mi-l{ font-weight:650; display:flex; align-items:center; justify-content:space-between }
        .mi-h{ font-size:12px; color:var(--muted) }
        .mi.static{ cursor:default; border-bottom:1px solid var(--edge); border-radius:8px 8px 0 0; margin-bottom:4px }
        .mi.static:hover{ background:none }
        .logout .mi-l{ color:#a12a2a }

        .tools{ margin-left:auto; display:flex; align-items:center; gap:10px }
        .site-sw{ border-bottom:1px solid var(--edge); margin-bottom:4px; padding-bottom:4px }
        .site-mi[aria-pressed="true"]{ background:#f6e7bf }
        .site-mi[aria-pressed="true"] .mi-h::after{ content:" · showing now" }
        .quick{ display:flex; gap:6px; padding:6px 18px; overflow-x:auto; scrollbar-width:thin;
          background:#fffaf0; border-bottom:1px solid var(--edge); box-shadow:0 4px 12px rgba(60,40,10,.06) }
        .quick a{ flex:none; padding:4px 12px; border:1px solid var(--edge); border-radius:999px; background:#fff;
          font-size:12.5px; font-weight:650; white-space:nowrap }
        .quick a:hover{ background:#fbf1d8; border-color:var(--gold) }
        .quick a[aria-current="page"]{ background:var(--gold); border-color:var(--gold); color:#fff }
        .notice{ padding:6px 18px; background:#fff4de; color:#8a5a00; border-bottom:1px solid #f3d984; font-size:13px; font-weight:600 }
        [hidden]{ display:none !important }
        .seg{ display:inline-flex; border:1px solid var(--gold); border-radius:999px; overflow:hidden; flex:none }
        .seg button{ border:0; background:transparent; padding:5px 12px; font-size:12.5px; font-weight:700; color:#7a5b13 }
        .seg button + button{ border-left:1px solid var(--gold) }
        .seg button[aria-pressed="true"]{ background:var(--gold); color:#fff }
        .desk{ display:inline-flex; align-items:center; gap:8px; border:1px solid var(--edge); background:#fff; border-radius:999px; padding:5px 12px; font-size:12.5px; font-weight:650; white-space:nowrap; max-width:220px }
        .desk #deskName{ overflow:hidden; text-overflow:ellipsis }
        .desk:hover, .desk-dd.open .desk{ background:#fbf1d8 }
        .sync{ display:inline-flex; align-items:center; gap:6px; font-size:12px; color:var(--muted); white-space:nowrap }
        .sync i{ width:8px; height:8px; border-radius:50%; background:#2f9e44; box-shadow:0 0 0 3px rgba(47,158,68,.15) }
        :host([data-no-sync-text]) #syncText{ display:none }
        .sync.warn{ color:#a12a2a; font-weight:650 }
        .sync.warn i{ background:#d9480f; box-shadow:0 0 0 3px rgba(217,72,15,.18) }

        .progress{ position:absolute; left:0; bottom:-1px; height:2px; width:0; background:linear-gradient(90deg,#ffe9a6,var(--gold),#b88900); transition:width .1s linear }

        /* drawer (phones) */
        .backdrop{ position:fixed; inset:0; background:rgba(20,14,8,.45); z-index:1001; opacity:0; transition:opacity .2s }
        .backdrop.show{ opacity:1 }
        .drawer{
          position:fixed; top:0; bottom:0; left:0; width:min(320px, 86vw); z-index:1002;
          background:var(--panel); box-shadow:10px 0 40px rgba(20,14,8,.25);
          display:flex; flex-direction:column; transform:translateX(-105%); transition:transform .25s cubic-bezier(.2,.8,.2,1);
          visibility:hidden;
        }
        .drawer.open{ transform:none; visibility:visible }
        .dr-head{ display:flex; align-items:center; justify-content:space-between; padding:14px 14px 10px; border-bottom:1px solid var(--edge) }
        .close{ border:0; background:none; font-size:18px; width:40px; height:40px; border-radius:10px }
        .close:hover{ background:#fbf1d8 }
        .dr-body{ flex:1; overflow:auto; overscroll-behavior:contain; padding:0 8px 12px }
        .dr-sec h4{ margin:14px 8px 4px; font-size:11px; letter-spacing:.12em; text-transform:uppercase; color:var(--muted) }
        .dr-sec .mi{ padding:10px 10px }
        .dr-sec kbd{ display:none }
        .dr-foot{ border-top:1px solid var(--edge); padding:12px 14px calc(12px + env(safe-area-inset-bottom)); display:grid; gap:8px }
        .dr-desk{ font-weight:700 } .dr-desk small{ display:block; font-weight:500; color:var(--muted) }
        .dr-sync{ font-size:12px; color:var(--muted) } .dr-sync.warn{ color:#a12a2a; font-weight:650 }
        .dr-link{ font-size:13px; color:#7a5b13; text-decoration:underline; border:0; background:none; padding:0; text-align:left }
        .dr-admin{ display:flex; flex-wrap:wrap; gap:4px 14px }
        .dr-admin [aria-pressed="true"]{ display:none }
        .dr-logout{ border:1px solid #e6bcbc; background:#fff; color:#a12a2a; border-radius:10px; padding:9px; font-weight:650 }

        /* drawer groups: one open at a time */
        .dr-sec > button.dr-h{ display:flex; width:100%; align-items:center; justify-content:space-between; margin:6px 0 0; padding:10px 8px; border:0; background:none;
          font-size:12px; letter-spacing:.1em; text-transform:uppercase; color:var(--muted); font-weight:700; border-radius:8px }
        .dr-sec > button.dr-h:hover{ background:#fbf1d8 }
        .dr-sec .dr-items{ display:none }
        .dr-sec.open .dr-items{ display:grid }
        .dr-sec.open > .dr-h{ color:#8a6512 }
        .dr-sec.open > .dr-h .caret, .sd-grp.open > .sd-h .caret{ transform:rotate(-135deg) translateY(-2px) }
        .srch{ border:1px solid var(--edge); background:#fff; border-radius:999px; width:34px; height:34px; display:inline-grid; place-items:center; font-size:14px }
        .srch:hover{ background:#fbf1d8 }

        /* left sidebar */
        .side{ display:none }
        :host([data-layout="side"]) .side{ position:fixed; top:0; bottom:0; left:0; width:252px; z-index:1000; display:flex; flex-direction:column;
          background:linear-gradient(180deg,#fffefa,#fff6e2); border-right:1px solid var(--edge); box-shadow:6px 0 24px rgba(60,40,10,.08) }
        :host([data-layout="side"]) .bar{ display:none }
        .sd-brand{ padding:16px 16px 8px; font-size:13px }
        .sd-search{ margin:4px 12px 8px; display:flex; align-items:center; gap:8px; padding:8px 10px; border:1px solid var(--edge); border-radius:10px; background:#fff; color:var(--muted); font-size:13px; text-align:left }
        .sd-search span{ flex:1 } .sd-search kbd{ margin:0 }
        .sd-search:hover{ border-color:var(--gold) }
        .sd-body{ flex:1; overflow:auto; overscroll-behavior:contain; padding:4px 8px 12px }
        .sd-grp{ margin-bottom:2px }
        .sd-h{ display:flex; width:100%; align-items:center; justify-content:space-between; gap:8px; padding:9px 10px; border:0; background:none; border-radius:10px; font-weight:750; font-size:13.5px; text-align:left }
        .sd-h:hover{ background:#fbf1d8 }
        .sd-grp.active > .sd-h, a.sd-solo.active{ color:#8a6512 }
        .sd-items{ display:none; padding:2px 0 6px 8px; border-left:2px solid #f0e2c2; margin-left:12px }
        .sd-grp.open .sd-items{ display:grid; gap:1px }
        .sd-items .mi{ padding:7px 10px }
        .sd-items .mi-h{ display:none }
        a.sd-solo{ display:block; padding:9px 10px; border-radius:10px; font-weight:750; font-size:13.5px }
        a.sd-solo:hover{ background:#fbf1d8 } a.sd-solo[aria-current="page"]{ background:#f6e7bf }
        .sd-foot{ border-top:1px solid var(--edge); padding:10px 14px 14px; display:grid; gap:6px; font-size:12.5px }
        .sd-desk{ font-weight:700 } .sd-desk small{ display:block; font-weight:500; color:var(--muted) }
        .sd-sync{ color:var(--muted); font-size:12px } .sd-sync.warn{ color:#a12a2a; font-weight:650 }
        .sd-links{ display:flex; flex-wrap:wrap; gap:4px 12px; align-items:center }
        .sd-links a, .sd-links button{ border:0; background:none; padding:0; color:#7a5b13; text-decoration:underline; font-size:12.5px }
        .sd-links [aria-pressed="true"]{ font-weight:800; text-decoration:none }
        .sd-links .sd-logout{ color:#a12a2a }

        /* quick search */
        .qs-back{ position:fixed; inset:0; z-index:1100; background:rgba(20,14,8,.4); display:grid; place-items:start center; padding-top:12vh }
        .qs{ width:min(560px,92vw); background:var(--panel); border:1px solid var(--edge); border-radius:14px; box-shadow:0 24px 60px rgba(20,14,8,.35); overflow:hidden }
        .qs input{ width:100%; border:0; border-bottom:1px solid var(--edge); padding:14px 16px; font:inherit; font-size:16px; outline:none; background:#fff }
        .qs-list{ max-height:50vh; overflow:auto; padding:6px }
        .qs-list a{ display:grid; grid-template-columns:1fr auto; gap:2px 10px; padding:9px 10px; border-radius:8px }
        .qs-list a small{ grid-column:1 / -1; color:var(--muted); font-size:12px }
        .qs-list a em{ font-style:normal; font-size:11px; color:var(--muted); align-self:center }
        .qs-list a.on, .qs-list a:hover{ background:#fbf1d8 }
        .qs-empty{ padding:14px; color:var(--muted) }
        .qs-hint{ padding:6px 12px; font-size:11px; color:var(--muted); border-top:1px solid var(--edge) }

        @media (max-width:1180px){ .sync #syncText{ display:none } .cat{ padding:8px 9px } }
        @media (max-width:900px){
          .bar{ gap:8px; padding:6px 10px; min-height:52px }
          .burger{ display:inline-grid; gap:4px; place-content:center; width:42px; height:42px; border:0; background:none; border-radius:10px; flex:none }
          .burger span{ display:block; width:20px; height:2px; background:var(--ink); border-radius:2px }
          .burger:hover{ background:#fbf1d8 }
          .brand{ font-size:12.5px; letter-spacing:.1em }
          .here{ display:block; font-weight:650; font-size:13px; color:#8a6512; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; min-width:0 }
          .cats, .desk-dd{ display:none }
          :host([data-layout="side"]) .bar{ display:flex }
          :host([data-layout="side"]) .side{ display:none }
          .quick{ padding:6px 10px }
          .tools{ gap:6px }
          .sync #syncText{ display:none }
        }
        @media (max-width:420px){ .bar .brand .b1{ display:none } }
        @media print{ :host{ display:none } }
      </style>`;
    }

    connectedCallback() {
        const r = this.shadowRoot;
        const $ = (id) => r.getElementById(id);
        this.renderMenus();
        const dds = () => [...r.querySelectorAll('.bar .dd')];
        const closeMenus = (except) => dds().forEach(d => { if (d !== except) { d.classList.remove('open'); d.querySelector(':scope > button')?.setAttribute('aria-expanded', 'false'); } });
        this._closeMenus = closeMenus;

        // dropdowns (delegated, so the menu can be rebuilt): click to toggle, hover to switch between open menus
        r.addEventListener('click', (e) => {
            const btn = e.target.closest('.bar .dd > button');
            if (btn) {
                e.stopPropagation();
                const dd = btn.parentElement, open = !dd.classList.contains('open');
                closeMenus(dd);
                dd.classList.toggle('open', open);
                btn.setAttribute('aria-expanded', String(open));
                if (open && e.detail === 0) dd.querySelector('.mi:not(.static)')?.focus(); // opened by keyboard
                return;
            }
            // sidebar / drawer groups: open one, close the others
            const h = e.target.closest('.sd-h, .dr-h');
            if (h) {
                const grp = h.parentElement, open = !grp.classList.contains('open');
                grp.parentElement.querySelectorAll(':scope > .open').forEach(g => g.classList.remove('open'));
                grp.classList.toggle('open', open);
                h.setAttribute('aria-expanded', String(open));
                return;
            }
            if (e.target.closest('[data-search]')) { closeMenus(); this.closeDrawer(); this.openSearch(); }
        });
        r.addEventListener('mouseover', (e) => {
            const dd = e.target.closest('.bar .dd');
            if (!dd || dd.classList.contains('open') || !dds().some(d => d.classList.contains('open'))) return;
            closeMenus(dd); dd.classList.add('open'); dd.querySelector(':scope > button')?.setAttribute('aria-expanded', 'true');
        });
        const onDocClick = (e) => { if (!e.composedPath().includes(this)) closeMenus(); };
        document.addEventListener('click', onDocClick);
        r.addEventListener('click', (e) => {
            if (e.target.closest('.menu a, .dr-body a, .dr-foot a, a.cat, .brand, .sd-body a, .sd-links a')) { closeMenus(); this.closeDrawer(); }
            if (e.target.closest('.menu [data-site]')) closeMenus();
            if (e.target.closest('[data-logout]')) { closeMenus(); this.closeDrawer(); this.dispatchEvent(new CustomEvent('logout')); }
            const s = e.target.closest('[data-site]');
            if (s) { this.closeDrawer(); this.dispatchEvent(new CustomEvent('site-change', { detail: s.dataset.site })); }
        });

        // drawer
        $('burger').addEventListener('click', () => this.openDrawer());
        $('drClose').addEventListener('click', () => this.closeDrawer());
        $('backdrop').addEventListener('click', () => this.closeDrawer());

        // keyboard: Esc closes; Alt+<key> jumps (not while typing)
        const isEditable = (el) => !!el && (['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName) || el.isContentEditable);
        const onKey = (e) => {
            if ((e.ctrlKey || e.metaKey) && !e.altKey && (e.key === 'k' || e.key === 'K') && this._desk) { e.preventDefault(); closeMenus(); this.closeDrawer(); this.openSearch(); return; }
            if (e.key === 'Escape') { closeMenus(); this.closeDrawer(); this.closeSearch(); return; }
            if (!e.altKey || isEditable(document.activeElement)) return;
            const id = matchesShortcut(e); // keys and modifier from Settings
            if (!id || !this._site) return;
            e.preventDefault();
            location.hash = `#/${this._site}/${id}`;
        };
        window.addEventListener('keydown', onKey);
        // Settings changed: the menu or its layout may have changed too
        const onPrefs = () => { this.renderMenus(); this.applyPrefs(); if (this._site) this.setRoute(this._site, this._view, this._desk); };
        window.addEventListener('pms:prefs', onPrefs);
        this.applyPrefs();
        r.addEventListener('keydown', (e) => { if (e.key === 'Escape') { closeMenus(); this.closeDrawer(); } });

        // quick search: type, ↑↓, Enter
        $('qsIn').addEventListener('input', () => this.renderSearch());
        $('qsIn').addEventListener('keydown', (e) => {
            const items = [...r.querySelectorAll('#qsList a')];
            const i = items.findIndex(a => a.classList.contains('on'));
            if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                e.preventDefault();
                const n = items.length ? (i + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length : -1;
                items.forEach((a, k) => a.classList.toggle('on', k === n));
                items[n]?.scrollIntoView({ block: 'nearest' });
            } else if (e.key === 'Enter') { e.preventDefault(); const a = items[Math.max(0, i)]; if (a) { location.hash = a.getAttribute('href'); this.closeSearch(); } }
        });
        $('qsBack').addEventListener('click', (e) => { if (e.target === $('qsBack') || e.target.closest('#qsList a')) this.closeSearch(); });

        // scroll progress
        const prog = r.querySelector('.progress');
        const onScroll = () => {
            const top = document.documentElement.scrollTop || document.body.scrollTop;
            const h = (document.documentElement.scrollHeight - document.documentElement.clientHeight) || 1;
            prog.style.width = `${Math.max(0, Math.min(1, top / h)) * 100}%`;
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        // leaving phone width with the drawer open
        const mq = window.matchMedia('(min-width: 901px)');
        const onMq = () => { if (mq.matches) this.closeDrawer(); this.applyLayout(); };
        mq.addEventListener('change', onMq);

        this._cleanup = () => {
            document.removeEventListener('click', onDocClick);
            window.removeEventListener('keydown', onKey);
            window.removeEventListener('pms:prefs', onPrefs);
            window.removeEventListener('scroll', onScroll);
            mq.removeEventListener('change', onMq);
        };
    }

    disconnectedCallback() { this._cleanup?.(); }

    // The menu (standard or the login's own) into the top bar, the sidebar and the phone drawer
    renderMenus() {
        const r = this.shadowRoot;
        const menu = menuFor();
        this._menu = menu;
        r.getElementById('cats').innerHTML = menu.map(c => c.views.length === 1
            ? `<a class="cat solo" data-cat="${c.id}" data-view="${c.views[0]}" href="#">${esc(c.label)}</a>`
            : `<div class="dd" data-cat="${c.id}">
                 <button type="button" class="cat" aria-haspopup="true" aria-expanded="false">${esc(c.label)}<i class="caret"></i></button>
                 <div class="menu" role="menu">${menuItems(c)}</div>
               </div>`).join('');
        r.getElementById('sdBody').innerHTML = menu.map(c => c.views.length === 1
            ? `<a class="sd-solo" data-cat="${c.id}" data-view="${c.views[0]}" href="#">${esc(c.label)}</a>`
            : `<section class="sd-grp" data-cat="${c.id}"><button type="button" class="sd-h" aria-expanded="false">${esc(c.label)}<i class="caret"></i></button>
                 <div class="sd-items">${menuItems(c)}</div></section>`).join('');
        r.getElementById('drBody').innerHTML = menu.map(c => `<section class="dr-sec" data-cat="${c.id}"><button type="button" class="dr-h" aria-expanded="false">${esc(c.label)}<i class="caret"></i></button>
                 <div class="dr-items">${menuItems(c)}</div></section>`).join('');
        this.applyLayout();
    }

    // top bar or left sidebar (laptops only; phones always use the bar + drawer)
    applyLayout() {
        const side = getPrefs().navLayout === 'side' && window.matchMedia('(min-width: 901px)').matches && !!this._desk;
        this.toggleAttribute('data-layout', false);
        if (side) this.setAttribute('data-layout', 'side');
        // the page moves right of the sidebar (core/responsive.css: html[data-nav="side"])
        if (side) document.documentElement.dataset.nav = 'side'; else delete document.documentElement.dataset.nav;
    }

    openSearch() {
        if (!this._desk) return;
        const r = this.shadowRoot;
        r.getElementById('qsBack').hidden = false;
        r.getElementById('qsIn').value = '';
        this.renderSearch();
        setTimeout(() => r.getElementById('qsIn').focus(), 0);
    }
    closeSearch() { const b = this.shadowRoot.getElementById('qsBack'); if (b) b.hidden = true; }
    renderSearch() {
        const r = this.shadowRoot;
        const q = r.getElementById('qsIn').value.trim().toLowerCase();
        const groupOf = Object.fromEntries((this._menu || []).flatMap(g => g.views.map(v => [v, g.label])));
        const list = VIEWS.filter(v => !v.hidden && !NOT_IN_MENU.has(v.id) && canOpen(v.id, this._desk))
            .map(v => ({ v, hay: `${v.label} ${v.title} ${v.hint || ''} ${groupOf[v.id] || ''}`.toLowerCase() }))
            .filter(x => !q || q.split(/\s+/).every(w => x.hay.includes(w)))
            .sort((a, b) => (q && b.v.label.toLowerCase().startsWith(q)) - (q && a.v.label.toLowerCase().startsWith(q)) || a.v.label.localeCompare(b.v.label))
            .slice(0, 30);
        r.getElementById('qsList').innerHTML = list.length ? list.map((x, i) => `<a href="#/${this._site}/${x.v.id}" class="${i === 0 ? 'on' : ''}" role="option">
            <b>${esc(x.v.label)}</b><em>${esc(groupOf[x.v.id] || 'not in menu')}</em><small>${esc(x.v.hint || '')}</small></a>`).join('')
            : '<div class="qs-empty">No page matches.</div>';
    }

    // Settings → shortcut labels in the menus, sync text
    applyPrefs() {
        const r = this.shadowRoot, p = getPrefs();
        r.querySelectorAll('kbd[data-kbd]').forEach(k => {
            const key = shortcutFor(k.dataset.kbd);
            k.textContent = key ? `${modLabel()} ${key.toUpperCase()}` : '';
            k.hidden = !key || !p.showKeyHints;
        });
        r.host.toggleAttribute('data-no-sync-text', !p.showSyncText);
        this.renderQuick();
    }

    // Settings → Quick links: a strip of the chosen pages under the bar (only pages this login may open)
    renderQuick() {
        const r = this.shadowRoot;
        const q = r.getElementById('quick');
        const ids = (getPrefs().quickLinks || []).filter(id => viewById[id] && canOpen(id, this._desk));
        q.hidden = !ids.length || !this._desk;
        q.innerHTML = ids.map(id => `<a data-view="${id}" href="#/${this._site || ''}/${id}"${id === this._view ? ' aria-current="page"' : ''}>${esc(viewById[id].label)}</a>`).join('');
    }

    notice(text) {
        const n = this.shadowRoot.getElementById('notice');
        n.textContent = text;
        n.hidden = false;
        clearTimeout(this._noticeTimer);
        this._noticeTimer = setTimeout(() => { n.hidden = true; }, 6000);
    }

    openDrawer() {
        const r = this.shadowRoot;
        r.getElementById('backdrop').hidden = false;
        requestAnimationFrame(() => r.getElementById('backdrop').classList.add('show'));
        r.getElementById('drawer').classList.add('open');
        r.getElementById('drawer').setAttribute('aria-hidden', 'false');
        r.getElementById('burger').setAttribute('aria-expanded', 'true');
        (r.querySelector('.dr-body .mi[aria-current="page"]') || r.getElementById('drClose')).focus();
    }

    closeDrawer() {
        const r = this.shadowRoot;
        const d = r.getElementById('drawer');
        if (!d.classList.contains('open')) return;
        d.classList.remove('open');
        d.setAttribute('aria-hidden', 'true');
        r.getElementById('backdrop').classList.remove('show');
        setTimeout(() => { r.getElementById('backdrop').hidden = true; }, 200);
        r.getElementById('burger').setAttribute('aria-expanded', 'false');
        r.getElementById('burger').focus({ preventScroll: true });
    }

    setRoute(siteId, viewId, desk) {
        const r = this.shadowRoot;
        this._site = siteId;
        this._view = viewId;
        this._desk = desk;
        // pages this login may not open disappear from the menus (and empty categories with them)
        this.applyLayout();
        r.querySelectorAll('.cats .mi[data-view], .dr-body .mi[data-view], .sd-body .mi[data-view], .desk-dd .mi[data-view], a.cat[data-view], a.sd-solo[data-view], .sd-links a[data-view]').forEach(a => { a.hidden = !canOpen(a.dataset.view, desk); });
        r.querySelectorAll('.bar .dd[data-cat], .dr-sec, .sd-grp').forEach(el => { el.hidden = !el.querySelector('.mi[data-view]:not([hidden])'); });
        r.querySelectorAll('[data-admin-only]').forEach(el => { el.hidden = desk?.role !== 'admin'; });
        r.querySelectorAll('.brand').forEach(b => { b.setAttribute('href', `#/${siteId}/home`); b.querySelector('.b2').textContent = SITES[siteId].brand; });
        r.querySelectorAll('[data-view]').forEach(a => {
            a.setAttribute('href', `#/${siteId}/${a.dataset.view}${a.dataset.anchor ? '?section=' + a.dataset.anchor : ''}`);
            if (a.dataset.view === viewId && !a.dataset.anchor) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
        });
        const cat = (this._menu || []).find(c => c.views.includes(viewId));
        r.querySelectorAll('.bar [data-cat], .sd-body [data-cat]').forEach(el => el.classList.toggle('active', !!cat && el.dataset.cat === cat.id));
        // sidebar and drawer: the group of the open page is the one shown open
        r.querySelectorAll('.sd-grp, .dr-sec').forEach(el => {
            const on = !!cat && el.dataset.cat === cat.id;
            el.classList.toggle('open', on);
            el.querySelector(':scope > button')?.setAttribute('aria-expanded', String(on));
        });
        r.getElementById('here').textContent = viewById[viewId]?.hidden ? '' : (viewById[viewId]?.label || '');
        r.querySelectorAll('[data-site]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.site === siteId)));
        this.renderQuick();
        if (desk) {
            const canEdit = desk.role === 'admin' || (desk.role === 'desk' && desk.site === siteId);
            const role = canEdit ? desk.role : `${desk.role} · view only here`;
            r.getElementById('deskName').textContent = `${desk.name} · ${SITES[siteId]?.label || ''}`;
            r.getElementById('deskInfo').innerHTML = `<span class="mi-l">${esc(desk.name)}</span><span class="mi-h">${esc(SITES[desk.site]?.label)} · ${esc(role)}</span>`;
            r.getElementById('drDesk').innerHTML = `${esc(desk.name)}<small>${esc(SITES[desk.site]?.label)} · ${esc(role)}</small>`;
            r.getElementById('sdDesk').innerHTML = `${esc(desk.name)} · ${esc(SITES[siteId]?.label || '')}<small>${esc(role)}</small>`;
        }
    }

    setBadge(text, warn = false) {
        const r = this.shadowRoot;
        const short = warn ? 'Offline' : (text || '').replace(/ ·.*$/, '');
        r.getElementById('sync').classList.toggle('warn', !!warn);
        r.getElementById('sync').title = text || '';
        r.getElementById('syncText').textContent = short;
        r.getElementById('drSync').textContent = text || '';
        r.getElementById('drSync').classList.toggle('warn', !!warn);
        r.getElementById('sdSync').textContent = text || '';
        r.getElementById('sdSync').classList.toggle('warn', !!warn);
    }
}

if (!customElements.get('site-nav')) customElements.define('site-nav', SiteNav);
