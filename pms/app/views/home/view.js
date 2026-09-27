// Ported from pms/index.html. Page logic is kept as it was; storage goes through ctx.db (app/core/db.js).
// A building set up in Rooms & Buildings uses its real bed total as capacity (no manual number).

import { loadBuildings, buildingsOfSite, totalBeds } from '../../core/rooms.js';

export default async function mount(ctx) {
const { db } = ctx;
let BUILDER_BEDS = {}; // building → beds from Rooms & Buildings

    /* ===== Data (this site's slips, local or cloud) ===== */
    const getAllSlips = () => db.all();

    /* ===== Capacity storage (per building) ===== */
    const CAP_KEY = 'pms_building_capacity_v1';
    function loadCaps(){ try{ return JSON.parse(localStorage.getItem(CAP_KEY)||'{}'); }catch{ return {}; } }
    function saveCaps(m){ localStorage.setItem(CAP_KEY, JSON.stringify(m||{})); }

    /* ===== Data processing ===== */
    function parseNum(x){ const n = Number(x); return Number.isFinite(n)? n : 0; }
    function dateOnlyStr(d){ return new Date(d.getFullYear(), d.getMonth(), d.getDate()).toISOString().slice(0,10); }
    function inStay(dStr, ciStr, coStr){
      if(!ciStr || !coStr) return false;
      const d = new Date(dStr), ci = new Date(ciStr), co = new Date(coStr);
      // Count inclusive of check-in, exclusive of checkout morning
      return d >= new Date(ci.getFullYear(),ci.getMonth(),ci.getDate()) &&
             d <= new Date(co.getFullYear(),co.getMonth(),co.getDate());
    }

    function unique(arr){ return Array.from(new Set(arr)); }

    /* ===== UI: Batteries ===== */
    function batteryClass(p){
      if(p >= 85) return '';
      if(p >= 60) return 'warn';
      return 'bad';
    }

    function renderBatteries(buildings, caps, todayTotals){
      const grid = document.getElementById('batteryGrid');
      grid.innerHTML = '';
      buildings.forEach(b=>{
        const fromBuilder = BUILDER_BEDS[b];
        const cap = fromBuilder ?? caps[b] ?? 100;
        const used = todayTotals[b] ?? 0;
        const pct = cap>0 ? Math.min(100, Math.round(used*100/cap)) : 0;
        const cls = batteryClass(pct);
        const card = document.createElement('div');
        card.className = 'battery-card';
        card.innerHTML = `
          <div class="b-head">
            <div>
              <div class="b-name">${b || '(Unassigned)'}</div>
              <div class="b-cap">Capacity: <b>${cap}</b> • Used: <b>${used}</b></div>
            </div>
            ${fromBuilder != null
              ? `<a class="cap-link" href="${ctx.href('builder')}" title="Bed total from Rooms &amp; Buildings">Edit rooms</a>`
              : `<div class="cap-edit" aria-label="Capacity editor">
              <label for="cap_${cssId(b)}" class="sr-only">Capacity</label>
              <input id="cap_${cssId(b)}" type="number" min="0" value="${cap}" />
              <button data-b="${encodeURIComponent(b)}">Save</button>
            </div>`}
          </div>
          <div class="battery ${cls}">
            <div class="fill" style="width:${pct}%;"></div>
            <div class="meter">${pct}%</div>
          </div>
          <div class="b-stats">
            <div>Today: <b>${used}</b></div>
            <div>Free: <b>${Math.max(0, cap-used)}</b></div>
          </div>
        `;
        card.querySelector('.cap-edit button')?.addEventListener('click', ()=>{
          const nb = decodeURIComponent(card.querySelector('button').dataset.b);
          const v = parseNum(card.querySelector('input').value);
          const all = loadCaps(); all[nb]=v; saveCaps(all);
          hydrate(); // re-render everything
        });
        grid.appendChild(card);
      });
    }

    function cssId(t){ return String(t||'unassigned').replace(/[^a-z0-9]+/gi,'_'); }

    /* ===== UI: Building chips & Histogram ===== */
    function renderChips(buildings, active){
      const wrap = document.getElementById('buildingChips');
      wrap.innerHTML = '';
      const allBtn = document.createElement('button');
      allBtn.className='chip';
      allBtn.setAttribute('aria-pressed', String(active==='_ALL'));
      allBtn.textContent='All';
      allBtn.addEventListener('click', ()=>{ state.filter='_ALL'; drawChart(); });
      wrap.appendChild(allBtn);
      buildings.forEach(b=>{
        const btn = document.createElement('button');
        btn.className='chip';
        btn.setAttribute('aria-pressed', String(state.filter===b));
        btn.textContent = b || '(Unassigned)';
        btn.addEventListener('click', ()=>{ state.filter=b; drawChart(); });
        wrap.appendChild(btn);
      });
    }

    function drawChart(){
      const svg = document.getElementById('histChart');
      const w = 800, h = 220, padL=46, padR=10, padT=14, padB=26;
      svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
      svg.innerHTML = '';

      const dates = state.dates;
      const active = state.filter;
      const label = active==='_ALL' ? 'All buildings' : (active||'(Unassigned)');
      document.getElementById('chartSubtitle').textContent = label;

      // pick series
      let series = [];
      dates.forEach(d=>{
        const m = state.byDate[d];
        let sum = 0;
        if(active==='_ALL'){
          Object.values(m).forEach(v=> sum+=v);
        } else {
          sum = m[active] || 0;
        }
        series.push({d, y: sum});
      });

      const maxY = Math.max(10, ...series.map(s=>s.y));
      const xStep = (w - padL - padR) / Math.max(1, series.length);
      const yScale = (h - padT - padB) / maxY;

      // grid & axes
      const gGrid = document.createElementNS('http://www.w3.org/2000/svg','g'); gGrid.setAttribute('class','grid');
      for(let k=0;k<=5;k++){
        const y = h - padB - k*(h - padT - padB)/5;
        const line = document.createElementNS('http://www.w3.org/2000/svg','line');
        line.setAttribute('x1', padL); line.setAttribute('x2', w - padR);
        line.setAttribute('y1', y); line.setAttribute('y2', y);
        gGrid.appendChild(line);
      }
      svg.appendChild(gGrid);

      // y axis
      const yAxis = document.createElementNS('http://www.w3.org/2000/svg','path');
      yAxis.setAttribute('class','axis');
      yAxis.setAttribute('d', `M ${padL} ${padT} V ${h-padB}`);
      svg.appendChild(yAxis);
      // x axis
      const xAxis = document.createElementNS('http://www.w3.org/2000/svg','path');
      xAxis.setAttribute('class','axis');
      xAxis.setAttribute('d', `M ${padL} ${h-padB} H ${w-padR}`);
      svg.appendChild(xAxis);

      // bars
      series.forEach((s,i)=>{
        const barW = Math.max(6, xStep*0.7);
        const x = padL + i*xStep + (xStep - barW)/2;
        const y = h - padB - s.y*yScale;
        const rect = document.createElementNS('http://www.w3.org/2000/svg','rect');
        rect.setAttribute('class','bar');
        rect.setAttribute('x', x); rect.setAttribute('y', y);
        rect.setAttribute('width', barW); rect.setAttribute('height', Math.max(0, s.y*yScale));
        rect.setAttribute('role','img'); rect.setAttribute('aria-label', `${s.d}: ${s.y}`);
        svg.appendChild(rect);

        // x ticks at reasonable density
        if(series.length<=20 || i%Math.ceil(series.length/20)===0){
          const tx = document.createElementNS('http://www.w3.org/2000/svg','text');
          tx.setAttribute('x', x + barW/2); tx.setAttribute('y', h - 6);
          tx.setAttribute('text-anchor','middle'); tx.setAttribute('font-size','10');
          tx.textContent = s.d.slice(5); // show MM-DD
          svg.appendChild(tx);
        }
      });

      // y labels
      for(let k=0;k<=5;k++){
        const val = Math.round(maxY*k/5);
        const ty = h - padB - val*yScale;
        const t = document.createElementNS('http://www.w3.org/2000/svg','text');
        t.setAttribute('x', padL - 6); t.setAttribute('y', ty+3);
        t.setAttribute('text-anchor','end'); t.setAttribute('font-size','10');
        t.textContent = val;
        svg.appendChild(t);
      }
    }

    /* ===== State + hydration ===== */
    const state = {
      slips: [],
      buildings: [],
      byDate: {},  // { 'YYYY-MM-DD': { building: total, ... } }
      dates: [],
      todayTotals: {}, // { building: usedToday }
      filter: '_ALL'
    };

    async function hydrate(){
      // DB health panel (same logic as your original)
      checkDB();

      const slips = await getAllSlips();
      state.slips = slips;

      // Collect building names
      const builder = buildingsOfSite(await ctx.guard(loadBuildings()), ctx.siteId).filter(b => b.rooms.length);
      BUILDER_BEDS = Object.fromEntries(builder.map(b => [b.name, totalBeds(b)]));
      const buildings = unique([...builder.map(b => b.name), ...slips.map(s=> String(s.building||'').trim())]).sort((a,b)=> a.localeCompare(b));
      state.buildings = buildings.length ? buildings : [''];

      // Build byDate map using checkin_date as X and total as Y
      const byDate = {};
      slips.forEach(s=>{
        const d = (s.checkin_date||'').trim();
        if(!d) return;
        const b = String(s.building||'').trim();
        const y = parseNum(s.total);
        byDate[d] = byDate[d] || {};
        byDate[d][b] = (byDate[d][b]||0) + y;
      });
      state.byDate = byDate;
      state.dates = Object.keys(byDate).sort(); // chronological

      // Compute "today" usage per building from stays spanning today
      const todayStr = dateOnlyStr(new Date());
      const todayTotals = {};
      slips.forEach(s=>{
        const b = String(s.building||'').trim();
        if(inStay(todayStr, s.checkin_date, s.checkout_date)){
          todayTotals[b] = (todayTotals[b]||0) + parseNum(s.total);
        }
      });
      state.todayTotals = todayTotals;

      // Render
      const caps = loadCaps();
      renderBatteries(state.buildings, caps, state.todayTotals);
      renderChips(state.buildings, state.filter);
      drawChart();
    }

    /* ===== DB health (copied from your file, minor tidy) ===== */
    async function checkDB(){
      const outOpen = document.getElementById('dbOpen');
      const outVer  = document.getElementById('dbVersion');
      const outStores = document.getElementById('dbStores');
      const outCount = document.getElementById('slipCount');
      const note = document.getElementById('dbNote');
      outOpen.textContent='Testing…'; outOpen.className='pill wait';
      outVer.textContent='—'; outStores.textContent='—'; outCount.textContent='—'; note.textContent='';
      try{
        const h = await db.health();
        outOpen.textContent = h.stores[0] === 'OFFLINE' ? 'Offline' : 'Online'; outOpen.className = 'pill ' + (h.stores[0] === 'OFFLINE' ? 'wait' : 'ok');
        outVer.textContent = h.version;
        outStores.textContent = h.stores.join(', ') || '—';
        outCount.textContent = `${h.count} (${ctx.site.label})`;
        note.textContent = db.readonly ? db.readonlyReason : 'Shared by every desk; each browser keeps a synced copy.';
      } catch{
        outOpen.textContent='Blocked'; outOpen.className='pill fail';
        note.textContent = 'Could not read the synced copy of the data.';
      }
    }
    document.getElementById('btnRecheck').addEventListener('click', checkDB);

    // Boot
    hydrate();

}
