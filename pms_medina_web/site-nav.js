// components/site-nav.js
class SiteNav extends HTMLElement {
  constructor(){
    super();
    const r = this.attachShadow({mode:'open'});
    r.innerHTML = `
      <nav class="rk-nav" role="navigation" aria-label="Primary">
        <div class="bar">
          <a class="brand" href="checkins_checkouts.html" aria-label="Home">
            <span class="b1">Faiz E Hashemi</span><span class="b2">Miqaat 1447</span>
          </a>
          <div class="links" role="menubar">
            ${[

              { href: "checkins_checkouts.html",   text: "Checkins/Checkouts" },     
        { href: "slip_admin.html", text: "Admin" },
        { href: "mawaid.html", text: "Mawaid" },
            ].map(l => `
              <a class="item" role="menuitem" href="${l.href}">
                <span class="t">${l.text}</span>
              </a>`).join("")}
            <span class="hoverline" aria-hidden="true"></span>
          </div>
        </div>
        <div class="progress" aria-hidden="true"></div>
      </nav>
      <style>
        :host{
          --gold: #e6b422;       /* readable, classy gold */
          --gold-soft: #f3d984;  /* lighter for hover sheen */
          --ink: #0b1220;
          --glass: rgba(255,255,255,.96);
          --edge: rgba(230,180,34,.28);
          --shadow: 0 10px 26px rgba(10,20,30,.10);
          display:block;
        }

        .rk-nav{
          position: sticky; top: 0; z-index: 1000;
          background:
            linear-gradient(145deg, var(--edge), transparent 60%),
            var(--glass);
          -webkit-backdrop-filter: blur(8px) saturate(120%);
          backdrop-filter: blur(8px) saturate(120%);
          box-shadow: var(--shadow);
          border-bottom: 1px solid #e9eef4;
        }

        .bar{
          max-width: 1200px;
          margin: 0 auto;
          padding: 10px 14px;
          display: grid;
          grid-template-columns: max-content 1fr;
          align-items: center;
          gap: 12px;
        }

        .brand{
          display: inline-grid; grid-auto-flow: column; gap: 6px;
          text-decoration: none; color: var(--ink);
          font-weight: 800; letter-spacing: .14em; text-transform: uppercase;
          font-size: 15px; position: relative;
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

        .item:focus-visible{
          box-shadow: 0 0 0 2px var(--gold-soft); border-radius: 12px;
        }

        .hoverline{
          position:absolute; left:0; bottom:2px; height:2px; width:0;
          background: linear-gradient(90deg, transparent, var(--gold), transparent);
          border-radius:2px; opacity:0;
          transition:
            width .35s cubic-bezier(.2,.8,.2,1),
            transform .35s cubic-bezier(.2,.8,.2,1),
            opacity .2s ease;
          pointer-events:none;
        }

        .progress{
          position:absolute; inset:auto 0 0 0; height:2px; width:0%;
          background: linear-gradient(90deg, #ffe9a6, var(--gold), #b88900);
          box-shadow: 0 0 12px rgba(230,180,34,.35);
          transition: width .1s linear;
        }

        @media (max-width: 860px){
          .item{ letter-spacing:.1em; padding: 7px 8px }
          .bar{ padding: 8px 10px }
        }

        @media print{ .rk-nav{ display:none } }
      </style>
    `;
  }

  connectedCallback(){
    const r = this.shadowRoot;
    const track = r.querySelector('.links');
    const line  = r.querySelector('.hoverline');
    const items = Array.from(r.querySelectorAll('.item'));
    const brand = r.querySelector('.brand');
    const prog  = r.querySelector('.progress');

    // mark active by pathname
    const here = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
    (items.find(a => (a.getAttribute('href')||'').toLowerCase() === here) || items[0])
      .setAttribute('aria-current','page');

    // underline mover
    const moveLine = (el)=>{
      if(!el) return;
      const tb = track.getBoundingClientRect();
      const eb = el.getBoundingClientRect();
      line.style.transform = `translateX(${eb.left - tb.left}px)`;
      line.style.width = `${eb.width}px`;
      line.style.opacity = '1';
    };
    const hideLine = ()=>{ line.style.opacity = '0'; };

    items.forEach(a=>{
      a.addEventListener('mouseenter', ()=> moveLine(a));
      a.addEventListener('focus',     ()=> moveLine(a));
      a.addEventListener('mouseleave', hideLine);
      a.addEventListener('blur',      hideLine);
    });
    track.addEventListener('mouseleave', hideLine);

    // magnetic hover (subtle)
    const onMouseMove = (e)=>{
      const mx = e.clientX, my = e.clientY;
      items.forEach(a=>{
        const b = a.getBoundingClientRect();
        const cx = b.left + b.width/2, cy = b.top + b.height/2;
        const dx = (mx - cx) / Math.max(b.width, 1);
        const dy = (my - cy) / Math.max(b.height, 1);
        a.style.transform = `translate(${dx*2}px, ${dy*.5}px)`;
      });
    };
    this.addEventListener('mousemove', onMouseMove);

    // brand micro-kerning on hover
    brand.addEventListener('mousemove', (e)=>{
      const b = brand.getBoundingClientRect();
      const t = ((e.clientX - b.left)/b.width - .5)*2;
      brand.style.letterSpacing = `${.14 + t*.04}em`;
    });
    brand.addEventListener('mouseleave', ()=> brand.style.letterSpacing = '.14em');

    // scroll progress
    const onScroll = ()=>{
      const sTop = document.documentElement.scrollTop || document.body.scrollTop;
      const sH = (document.documentElement.scrollHeight - document.documentElement.clientHeight) || 1;
      prog.style.width = `${Math.max(0, Math.min(1, sTop / sH))*100}%`;
    };
    addEventListener('scroll', onScroll, { passive:true });
    onScroll();

    // clean
    this._cleanup = ()=>{
      removeEventListener('scroll', onScroll);
      this.removeEventListener('mousemove', onMouseMove);
    };
  }

  disconnectedCallback(){ this._cleanup?.() }
}

// Safe define (prevents “already defined” crash during reloads)
if(!customElements.get('site-nav')){
  customElements.define('site-nav', SiteNav);
}
