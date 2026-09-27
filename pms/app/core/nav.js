// <site-nav> — shared top bar. Same look and Alt+1..0 hotkeys as the old per-folder nav,
// plus a site switcher and a data-source toggle. The router calls setRoute() on every navigation.

import { SITES, VIEWS } from '../config.js';

const NAV_VIEWS = VIEWS.filter(v => !v.hidden);

class SiteNav extends HTMLElement {
    constructor() {
        super();
        const r = this.attachShadow({ mode: 'open' });
        r.innerHTML = `
      <nav class="rk-nav" role="navigation" aria-label="Primary">
        <div class="bar">
          <a class="brand" href="#" aria-label="Home">
            <span class="b1">Faiz E Hashemi</span><span class="b2"></span>
          </a>
          <div class="links" role="menubar">
            ${NAV_VIEWS.map(v => `
              <a class="item" role="menuitem" data-view="${v.id}" href="#">
                <span class="t">${v.label}</span>
              </a>`).join('')}
            <span class="hoverline" aria-hidden="true"></span>
          </div>
          <div class="ctx">
            <div class="seg" role="group" aria-label="Site">
              ${Object.values(SITES).map(s => `<button type="button" data-site="${s.id}">${s.label}</button>`).join('')}
            </div>
            <span class="desk" id="desk"></span>
            <button type="button" class="logout" id="logout">Log out</button>
            <span class="badge" id="badge"></span>
          </div>
        </div>
        <div class="progress" aria-hidden="true"></div>
      </nav>
      <style>
        :host{
          --gold: #e6b422;
          --gold-soft: #f3d984;
          --ink: #0b1220;
          --glass: rgba(255,255,255,.96);
          --edge: rgba(230,180,34,.28);
          --shadow: 0 10px 26px rgba(10,20,30,.10);
          display:block;
          position: sticky; top: 0; z-index: 1000;
        }
        :host([hidden]){ display: none }
        .rk-nav{
          position: relative;
          background: linear-gradient(145deg, var(--edge), transparent 60%), var(--glass);
          -webkit-backdrop-filter: blur(8px) saturate(120%);
          backdrop-filter: blur(8px) saturate(120%);
          box-shadow: var(--shadow);
          border-bottom: 1px solid #e9eef4;
          font: 14px/1.45 system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;
        }
        .bar{
          max-width: 1400px; margin: 0 auto; padding: 10px 14px;
          display: grid; grid-template-columns: max-content 1fr max-content;
          align-items: center; gap: 12px;
        }
        .brand{
          display: inline-grid; grid-auto-flow: column; gap: 6px;
          text-decoration: none; color: var(--ink);
          font-weight: 800; letter-spacing: .14em; text-transform: uppercase;
          font-size: 15px; position: relative; white-space: nowrap; justify-self: start;
        }
        .brand .b2{ color: var(--gold) }
        .brand::after{
          content:""; position:absolute; left:-6px; right:-6px; bottom:-6px; height:2px;
          background: linear-gradient(90deg, transparent, var(--gold), transparent);
          transform: scaleX(0); transform-origin: 0 50%;
          transition: transform .45s cubic-bezier(.2,.8,.2,1);
        }
        .brand:hover::after{ transform: scaleX(1) }
        .links{ justify-self: end; position: relative; display:flex; flex-wrap:wrap; gap: 2px 10px }
        .item{
          position: relative; display:inline-flex; align-items:center;
          padding: 8px 10px; border-radius: 10px;
          color: var(--ink); text-decoration: none;
          text-transform: uppercase; letter-spacing: .11em; font-weight: 700; font-size: 12px;
          transition: transform .25s cubic-bezier(.2,.8,.2,1), color .2s ease;
          outline: none;
        }
        .item:hover{ transform: translateY(-1px) }
        .item[aria-current="page"]{ color: var(--gold) }
        .item:focus-visible{ box-shadow: 0 0 0 2px var(--gold-soft); border-radius: 12px; }
        .hoverline{
          position:absolute; left:0; bottom:2px; height:2px; width:0;
          background: linear-gradient(90deg, transparent, var(--gold), transparent);
          border-radius:2px; opacity:0;
          transition: width .35s cubic-bezier(.2,.8,.2,1), transform .35s cubic-bezier(.2,.8,.2,1), opacity .2s ease;
          pointer-events:none;
        }
        .ctx{ display:flex; align-items:center; gap:8px; flex-wrap:wrap; justify-content:flex-end }
        .seg{ display:inline-flex; border:1px solid var(--gold); border-radius:999px; overflow:hidden }
        .seg button{
          font: inherit; font-size: 12px; font-weight: 700; letter-spacing:.04em;
          padding: 5px 10px; border: 0; background: transparent; color: #7a5b13; cursor: pointer;
        }
        .seg button + button{ border-left: 1px solid var(--gold) }
        .seg button[aria-pressed="true"]{ background: var(--gold); color: #fff }
        .desk{ font-size: 12px; font-weight: 700; color: var(--ink); white-space: nowrap }
        .desk .role{ font-weight: 600; color: #7a5b13; margin-left: 4px; font-size: 11px; text-transform: uppercase; letter-spacing: .06em }
        .logout{ font: inherit; font-size: 12px; padding: 4px 10px; border: 1px solid var(--gold); border-radius: 999px; background: transparent; color: #7a5b13; cursor: pointer }
        .logout:hover{ background: #fff6dd }
        .badge{ font-size: 11px; color: #6b5e4a; white-space: nowrap }
        .badge.warn{ color: #a12a2a; font-weight: 700 }
        .progress{
          position:absolute; inset:auto 0 0 0; height:2px; width:0%;
          background: linear-gradient(90deg, #ffe9a6, var(--gold), #b88900);
          box-shadow: 0 0 12px rgba(230,180,34,.35);
          transition: width .1s linear;
        }
        @media (max-width: 1100px){
          .bar{ grid-template-columns: minmax(0, 1fr); gap: 8px }
          .ctx{ order: 1; justify-content: flex-start }
          .links{ order: 2; justify-self: start }
          .badge{ white-space: normal }
        }
        @media (max-width: 860px){
          .item{ letter-spacing:.1em; padding: 7px 8px }
          .bar{ padding: 8px 10px }
        }
        @media print{ .rk-nav{ display:none } }
      </style>
    `;
    }

    connectedCallback() {
        const r = this.shadowRoot;
        const track = r.querySelector('.links');
        const line = r.querySelector('.hoverline');
        const items = Array.from(r.querySelectorAll('.item'));
        const brand = r.querySelector('.brand');
        const prog = r.querySelector('.progress');

        // Alt+1..9 → tab 1..9, Alt+0 → tab 10 (not while typing)
        const isEditable = (el) => !!el && (['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName) || el.isContentEditable);
        const onHotkey = (e) => {
            if (!e.altKey || isEditable(document.activeElement)) return;
            const k = e.key;
            const idx = (k >= '1' && k <= '9') ? Number(k) - 1 : (k === '0' ? 9 : -1);
            if (idx < 0 || !items[idx]) return;
            e.preventDefault();
            location.hash = items[idx].getAttribute('href');
        };

        const moveLine = (el) => {
            const tb = track.getBoundingClientRect(), eb = el.getBoundingClientRect();
            line.style.transform = `translateX(${eb.left - tb.left}px)`;
            line.style.width = `${eb.width}px`;
            line.style.opacity = '1';
        };
        const hideLine = () => { line.style.opacity = '0'; };
        items.forEach(a => {
            a.addEventListener('mouseenter', () => moveLine(a));
            a.addEventListener('focus', () => moveLine(a));
            a.addEventListener('mouseleave', hideLine);
            a.addEventListener('blur', hideLine);
        });
        track.addEventListener('mouseleave', hideLine);

        // magnetic hover (subtle)
        const onMouseMove = (e) => {
            items.forEach(a => {
                const b = a.getBoundingClientRect();
                const dx = (e.clientX - (b.left + b.width / 2)) / Math.max(b.width, 1);
                const dy = (e.clientY - (b.top + b.height / 2)) / Math.max(b.height, 1);
                a.style.transform = `translate(${dx * 2}px, ${dy * .5}px)`;
            });
        };
        this.addEventListener('mousemove', onMouseMove);

        brand.addEventListener('mousemove', (e) => {
            const b = brand.getBoundingClientRect();
            const t = ((e.clientX - b.left) / b.width - .5) * 2;
            brand.style.letterSpacing = `${.14 + t * .04}em`;
        });
        brand.addEventListener('mouseleave', () => brand.style.letterSpacing = '.14em');

        const onScroll = () => {
            const sTop = document.documentElement.scrollTop || document.body.scrollTop;
            const sH = (document.documentElement.scrollHeight - document.documentElement.clientHeight) || 1;
            prog.style.width = `${Math.max(0, Math.min(1, sTop / sH)) * 100}%`;
        };

        r.querySelectorAll('[data-site]').forEach(b => b.addEventListener('click', () =>
            this.dispatchEvent(new CustomEvent('site-change', { detail: b.dataset.site }))));
        r.getElementById('logout').addEventListener('click', () => this.dispatchEvent(new CustomEvent('logout')));

        window.addEventListener('keydown', onHotkey);
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
        this._cleanup = () => {
            window.removeEventListener('keydown', onHotkey);
            window.removeEventListener('scroll', onScroll);
            this.removeEventListener('mousemove', onMouseMove);
        };
    }

    disconnectedCallback() { this._cleanup?.(); }

    setRoute(siteId, viewId, desk) {
        const r = this.shadowRoot;
        const canEdit = desk && (desk.role === 'admin' || (desk.role === 'desk' && desk.site === siteId));
        r.getElementById('desk').innerHTML = '';
        if (desk) {
            r.getElementById('desk').textContent = desk.name;
            const role = document.createElement('span');
            role.className = 'role';
            role.textContent = canEdit ? desk.role : `${desk.role} · view only`;
            r.getElementById('desk').appendChild(role);
        }
        r.querySelector('.brand').setAttribute('href', `#/${siteId}/home`);
        r.querySelector('.b2').textContent = SITES[siteId].brand;
        r.querySelectorAll('.item').forEach(a => {
            a.setAttribute('href', `#/${siteId}/${a.dataset.view}`);
            if (a.dataset.view === viewId) a.setAttribute('aria-current', 'page');
            else a.removeAttribute('aria-current');
        });
        r.querySelectorAll('[data-site]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.site === siteId)));
    }

    setBadge(text, warn = false) {
        const b = this.shadowRoot.getElementById('badge');
        b.textContent = text || '';
        b.classList.toggle('warn', !!warn);
    }
}

if (!customElements.get('site-nav')) customElements.define('site-nav', SiteNav);
