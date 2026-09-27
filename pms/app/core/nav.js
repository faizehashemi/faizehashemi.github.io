// <site-nav> — the app's navigation.
//   Laptop (> 900px): one bar — brand · category menus · desk menu · sync status, then the quick links.
//   Phone/tablet (≤ 900px): compact bar with ☰; the menu opens as a side drawer.
// Categories and pages come from NAV / VIEWS in config.js. Alt+<key> shortcuts are kept.
// API used by the shell: setRoute(siteId, viewId, desk), setBadge(text, warn);
// events: 'site-change' (detail = siteId; admins only — other logins stay on their own site), 'logout'.
// Only pages the login may open are listed (canOpen); quick links come from Settings.

import { SITES, VIEWS, NAV } from '../config.js';
import { getPrefs, shortcutFor, modLabel, matchesShortcut } from './prefs.js';
import { canOpen } from './cloud.js';

const viewById = Object.fromEntries(VIEWS.map(v => [v.id, v]));
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

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

        <nav class="cats" id="cats">
          ${NAV.map(c => c.views.length === 1
            ? `<a class="cat solo" data-cat="${c.id}" data-view="${c.views[0]}" href="#">${esc(c.label)}</a>`
            : `<div class="dd" data-cat="${c.id}">
                 <button type="button" class="cat" aria-haspopup="true" aria-expanded="false">${esc(c.label)}<i class="caret"></i></button>
                 <div class="menu" role="menu">${menuItems(c)}</div>
               </div>`).join('')}
        </nav>

        <div class="tools">
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
        <div class="dr-body">
          ${NAV.map(c => `<section class="dr-sec"><h4>${esc(c.label)}</h4>${menuItems(c)}</section>`).join('')}
        </div>
        <div class="dr-foot">
          <div class="dr-desk" id="drDesk"></div>
          <div class="dr-sync" id="drSync"></div>
          <a class="dr-link" data-view="settings" data-anchor="password" href="#">Change password</a>
          <div class="dr-admin" data-admin-only hidden>${Object.values(SITES).map(s => `<button type="button" class="dr-link" data-site="${s.id}">View ${esc(s.label)} (admin)</button>`).join('')}</div>
          <button type="button" class="dr-logout" data-logout>Log out</button>
        </div>
      </aside>

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

        @media (max-width:1180px){ .sync #syncText{ display:none } .cat{ padding:8px 9px } }
        @media (max-width:900px){
          .bar{ gap:8px; padding:6px 10px; min-height:52px }
          .burger{ display:inline-grid; gap:4px; place-content:center; width:42px; height:42px; border:0; background:none; border-radius:10px; flex:none }
          .burger span{ display:block; width:20px; height:2px; background:var(--ink); border-radius:2px }
          .burger:hover{ background:#fbf1d8 }
          .brand{ font-size:12.5px; letter-spacing:.1em }
          .here{ display:block; font-weight:650; font-size:13px; color:#8a6512; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; min-width:0 }
          .cats, .desk-dd{ display:none }
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
        const dds = [...r.querySelectorAll('.bar .dd')];
        const closeMenus = (except) => dds.forEach(d => { if (d !== except) { d.classList.remove('open'); d.querySelector(':scope > button')?.setAttribute('aria-expanded', 'false'); } });

        // dropdowns: click to toggle, hover to switch between open menus
        dds.forEach(dd => {
            const btn = dd.querySelector(':scope > button');
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const open = !dd.classList.contains('open');
                closeMenus(dd);
                dd.classList.toggle('open', open);
                btn.setAttribute('aria-expanded', String(open));
                if (open && e.detail === 0) dd.querySelector('.mi:not(.static)')?.focus(); // opened by keyboard
            });
            dd.addEventListener('mouseenter', () => {
                if (dds.some(d => d !== dd && d.classList.contains('open'))) { closeMenus(dd); dd.classList.add('open'); btn.setAttribute('aria-expanded', 'true'); }
            });
        });
        const onDocClick = (e) => { if (!e.composedPath().includes(this)) closeMenus(); };
        document.addEventListener('click', onDocClick);
        r.addEventListener('click', (e) => {
            if (e.target.closest('.menu a, .dr-body a, .dr-foot a, a.cat, .brand')) { closeMenus(); this.closeDrawer(); }
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
            if (e.key === 'Escape') { closeMenus(); this.closeDrawer(); return; }
            if (!e.altKey || isEditable(document.activeElement)) return;
            const id = matchesShortcut(e); // keys and modifier from Settings
            if (!id || !this._site) return;
            e.preventDefault();
            location.hash = `#/${this._site}/${id}`;
        };
        window.addEventListener('keydown', onKey);
        const onPrefs = () => this.applyPrefs();
        window.addEventListener('pms:prefs', onPrefs);
        this.applyPrefs();
        r.addEventListener('keydown', (e) => { if (e.key === 'Escape') { closeMenus(); this.closeDrawer(); } });

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
        const onMq = () => { if (mq.matches) this.closeDrawer(); };
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
        r.querySelectorAll('.cats .mi[data-view], .dr-body .mi[data-view], .desk-dd .mi[data-view], a.cat[data-view]').forEach(a => { a.hidden = !canOpen(a.dataset.view, desk); });
        r.querySelectorAll('.bar .dd[data-cat], .dr-sec').forEach(el => { el.hidden = !el.querySelector('.mi[data-view]:not([hidden])'); });
        r.querySelectorAll('[data-admin-only]').forEach(el => { el.hidden = desk?.role !== 'admin'; });
        r.querySelectorAll('.brand').forEach(b => { b.setAttribute('href', `#/${siteId}/home`); b.querySelector('.b2').textContent = SITES[siteId].brand; });
        r.querySelectorAll('[data-view]').forEach(a => {
            a.setAttribute('href', `#/${siteId}/${a.dataset.view}${a.dataset.anchor ? '?section=' + a.dataset.anchor : ''}`);
            if (a.dataset.view === viewId && !a.dataset.anchor) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
        });
        const cat = NAV.find(c => c.views.includes(viewId));
        r.querySelectorAll('.bar [data-cat]').forEach(el => el.classList.toggle('active', !!cat && el.dataset.cat === cat.id));
        r.getElementById('here').textContent = viewById[viewId]?.hidden ? '' : (viewById[viewId]?.label || '');
        r.querySelectorAll('[data-site]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.site === siteId)));
        this.renderQuick();
        if (desk) {
            const canEdit = desk.role === 'admin' || (desk.role === 'desk' && desk.site === siteId);
            const role = canEdit ? desk.role : `${desk.role} · view only here`;
            r.getElementById('deskName').textContent = `${desk.name} · ${SITES[siteId]?.label || ''}`;
            r.getElementById('deskInfo').innerHTML = `<span class="mi-l">${esc(desk.name)}</span><span class="mi-h">${esc(SITES[desk.site]?.label)} · ${esc(role)}</span>`;
            r.getElementById('drDesk').innerHTML = `${esc(desk.name)}<small>${esc(SITES[desk.site]?.label)} · ${esc(role)}</small>`;
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
    }
}

if (!customElements.get('site-nav')) customElements.define('site-nav', SiteNav);
