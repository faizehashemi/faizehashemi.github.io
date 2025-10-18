// site-nav.js — fully rewritten
// Usage: <site-nav></site-nav>
// Optional: window.SITE_NAV_ITEMS = [{label:'HOME', href:'./'}, ...]
// Optional: <site-nav current="TIMELINE"></site-nav> to force active label.

(() => {
  const tpl = document.createElement('template');
  tpl.innerHTML = `
    <style>
      :host{
        --ink: #1d2129;
        --muted: #6b5e4a;
        --gold: #d4af37;
        --card: #fffaf1;
        --border: #dcc7a4;
        --fade: rgba(0,0,0,.05);
        display:block;
      }
      .bar{
        display:grid;
        grid-template-columns:auto 1fr;
        align-items:center;
        gap: 18px;
        padding: 10px 12px;
        background: var(--card);
        border: 1px solid var(--border);
        border-radius: 12px;
        position: relative;
      }
      .brand{
        display: inline-grid;
        gap: 2px;
        color: var(--ink);
        text-decoration: none;
        user-select:none;
        white-space:nowrap;
      }
      .brand .t1{ font-weight: 800; text-transform: uppercase; letter-spacing: .12em; font-size: 14px }
      .brand .t1 .pms{ color: var(--gold) }
      .brand .t2{ font-weight: 700; letter-spacing:.14em; font-size: 11px; color: var(--muted) }

      /* Links container: one line, scroll when needed */
      .links{
        position: relative;
        display:flex;
        flex-wrap: nowrap;
        gap: 0 18px;
        overflow-x: auto; overflow-y: hidden;
        -webkit-overflow-scrolling: touch;
        scrollbar-gutter: stable both-edges;
        white-space: nowrap;
        align-items:center;
        padding-bottom: 2px; /* room for underline */
      }
      .links::-webkit-scrollbar{ height: 6px }
      .links::-webkit-scrollbar-track{ background: transparent }
      .links::-webkit-scrollbar-thumb{ background: rgba(0,0,0,.12); border-radius: 999px }
      .links:hover::-webkit-scrollbar-thumb{ background: rgba(0,0,0,.22) }

      .item{
        position: relative;
        display: inline-flex; align-items:center; justify-content:center;
        padding: 8px 10px;
        border-radius: 10px;
        color: var(--ink);
        text-decoration: none;
        text-transform: uppercase;
        letter-spacing: .11em;
        font-weight: 800;
        font-size: 12px;
        outline: none;
        white-space: nowrap;
        transition: transform .25s cubic-bezier(.2,.8,.2,1), color .18s ease;
        will-change: transform;
      }
      .item:hover{ background: var(--fade) }
      .item[aria-current="page"]{ color: #0c1b2a }

      /* underline */
      .line{
        position:absolute; left:0; bottom:0;
        height: 2px; width: 0;
        background: var(--gold);
        border-radius: 2px;
        opacity: 0; transform: translateX(0);
        transition: transform .22s cubic-bezier(.2,.8,.2,1), width .22s cubic-bezier(.2,.8,.2,1), opacity .2s ease;
        pointer-events:none;
      }

      /* tiny screens: tighter text */
      @media (max-width: 860px){
        .item{ letter-spacing:.06em; font-size: 11px; padding: 7px 8px }
        .brand .t1{ letter-spacing:.10em }
      }
    </style>

    <div class="bar">
      <a class="brand" href="#">
        <div class="t1">FAIZ E HASHEMI <span class="pms">PMS</span></div>
        <div class="t2">MAWAID</div>
      </a>

      <div class="links" part="links"></div>
      <div class="line" part="line"></div>
    </div>
  `;

  class SiteNav extends HTMLElement {
    constructor(){
      super();
      this.attachShadow({mode:'open'}).appendChild(tpl.content.cloneNode(true));
      this._els = {
        bar:   this.shadowRoot.querySelector('.bar'),
        links: this.shadowRoot.querySelector('.links'),
        line:  this.shadowRoot.querySelector('.line'),
        brand: this.shadowRoot.querySelector('.brand'),
      };
      this._items = [];
      this._ro = new ResizeObserver(()=> this._syncLine());
    }

    static get observedAttributes(){ return ['current']; }
    attributeChangedCallback(name){
      if(name==='current') this._markActiveByLabel(this.getAttribute('current'));
    }

    connectedCallback(){
      this._build();
      this._wire();
      this._ro.observe(this._els.links);
      // initial underline on current item
      const current = this._els.links.querySelector('.item[aria-current="page"]') || this._els.links.querySelector('.item');
      if(current) this._moveLine(current, true);
    }

    disconnectedCallback(){
      this._ro.disconnect();
    }

    _defaults(){
      return [
        {label:'HOME',                href:'./'},
        {label:'SLIP',                href:'./accommodation_slip.html'},
        {label:'FORECAST',            href:'#'},
        {label:'LEGEND GRID',         href:'./building_legend_grid.html'},
        {label:'TIMELINE',            href:'./timeline_db.html'},
        {label:'CHECKINS/CHECKOUTS',  href:'#'},
        {label:'FE GROUP',            href:'#'},
        {label:'FE KG',               href:'#'},
        {label:'PRINT',               href:'#'},
        {label:'ADMIN',               href:'#'}
      ];
    }

    _build(){
      const src = Array.isArray(window.SITE_NAV_ITEMS) && window.SITE_NAV_ITEMS.length
        ? window.SITE_NAV_ITEMS
        : this._defaults();

      // clear links
      this._els.links.textContent = '';
      this._items = src.map(item => {
        const a = document.createElement('a');
        a.className = 'item';
        a.textContent = item.label;
        a.href = item.href || '#';
        a.setAttribute('data-label', item.label);
        // auto-mark current using location if it matches last path segment
        try{
          const lh = (location.pathname.split('/').pop()||'').toLowerCase();
          const ih = (new URL(a.href, location.href).pathname.split('/').pop()||'').toLowerCase();
          if(lh && ih && lh === ih) a.setAttribute('aria-current','page');
        }catch{ /* relative href with weird base, ignore */ }
        this._els.links.appendChild(a);
        return a;
      });

      // attribute-based override: current="TIMELINE"
      if(this.hasAttribute('current')) this._markActiveByLabel(this.getAttribute('current'));
    }

    _wire(){
      const track = this._els.links;
      const line  = this._els.line;

      const moveLine = el => {
        if(!el || !track.isConnected) return;
        const tb = track.getBoundingClientRect();
        const eb = el.getBoundingClientRect();
        const sl = track.scrollLeft;
        line.style.transform = `translateX(${(eb.left - tb.left) + sl}px)`;
        line.style.width = `${eb.width}px`;
        line.style.opacity = '1';
      };
      const hideLine = () => { line.style.opacity = '0'; };

      // hover/focus underline
      this._items.forEach(a => {
        a.addEventListener('mouseenter', ()=> moveLine(a));
        a.addEventListener('focus',     ()=> moveLine(a));
        a.addEventListener('mouseleave', hideLine);
        a.addEventListener('blur',      hideLine);
        a.addEventListener('click',     ()=> this._setCurrent(a));
      });

      // keep underline synced to current while scrolling
      track.addEventListener('scroll', () => {
        const cur = track.querySelector('.item[aria-current="page"]');
        if(cur) moveLine(cur);
      }, {passive:true});

      // vertical wheel scroll -> horizontal scroll
      track.addEventListener('wheel', e => {
        if(Math.abs(e.deltaY) > Math.abs(e.deltaX)){
          track.scrollLeft += e.deltaY;
          e.preventDefault();
        }
      }, {passive:false});

      // subtle parallax so it feels alive
      this.addEventListener('mousemove', e => {
        const mx = e.clientX, my = e.clientY;
        this._items.forEach(a => {
          const b = a.getBoundingClientRect();
          const dx = (mx - (b.left + b.width/2)) / Math.max(b.width, 1);
          const dy = (my - (b.top  + b.height/2)) / Math.max(b.height, 1);
          a.style.transform = `translate(${dx*2}px, ${dy*.5}px)`;
        });
      });

      // blur cleanup
      this.addEventListener('mouseleave', () => {
        this._items.forEach(a => a.style.transform = 'translate(0,0)');
        hideLine();
      });

      // expose helpers
      this._moveLine = moveLine;
      this._hideLine = hideLine;
    }

    _setCurrent(a){
      this._items.forEach(x => x.removeAttribute('aria-current'));
      a.setAttribute('aria-current','page');
      this._moveLine(a);
    }

    _markActiveByLabel(label){
      if(!label) return;
      const a = this._items.find(x => (x.dataset.label||'').toLowerCase() === String(label).toLowerCase());
      if(a) this._setCurrent(a);
    }

    _syncLine(){
      const cur = this.shadowRoot.querySelector('.item[aria-current="page"]');
      if(cur) this._moveLine(cur, true);
    }
  }

  customElements.define('site-nav', SiteNav);
})();
