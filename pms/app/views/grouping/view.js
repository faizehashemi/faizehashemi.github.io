// Ported from pms/fega.html. Page logic is kept as it was; storage goes through ctx.db (app/core/db.js).

export default async function mount(ctx) {
const { db } = ctx;

/* =================== Data (this site) =================== */
const getAllSlips = () => db.all();

/* =================== Utilities =================== */
const $ = sel => document.querySelector(sel);
const $$ = sel => Array.from(document.querySelectorAll(sel));
function pad2(n){ return String(n).padStart(2,'0'); }
function toDateObj(dstr, tstr){
  if(!dstr) return null;
  const [y,m,d] = dstr.split('-').map(Number);
  let hh=0, mm=0;
  if(tstr && /^\d{1,2}:\d{2}$/.test(tstr)){ [hh,mm] = tstr.split(':').map(Number); }
  return new Date(y, (m||1)-1, d||1, hh||0, mm||0, 0, 0);
}
function normalize(str){ return (str==null?'':String(str)).trim(); }
function uniq(arr){ return Array.from(new Set(arr)); }
function sum(arr){ return arr.reduce((a,b)=>a+Number(b||0),0); }

/* =================== State =================== */
let ALL = [];                 // all slips in DB
let RESULTS = [];             // filtered arrivals
let ASSIGN = [];              // assignment slots: {id, tours:[{tour_name, leader, sh}], pax}
let idCounter = 1;

/* Slot helpers */
function makeSlot(fromItems){
  // fromItems: array of arrivals {tour_name, group_leader, sh_no, total}
  const tours = fromItems.map(it=>({ tour_name: normalize(it.tour_name), group_leader: normalize(it.group_leader), sh: normalize(it.sh_no) }));
  return {
    id: 'S'+(idCounter++),
    tours,
    pax: sum(fromItems.map(it=> Number(it.total||0))) || 0
  };
}

/* =================== Renderers =================== */
function renderResults(){
  const wrap = $('#resultsWrap'), tools = $('#resultsTools');
  const tbody = $('#resultsTbl tbody');
  tbody.innerHTML = '';
  $('#foundInfo').textContent = `${RESULTS.length} found`;
  wrap.style.display = RESULTS.length ? '' : 'none';
  tools.style.display = RESULTS.length ? '' : 'none';

  for(const r of RESULTS){
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><input type="checkbox" class="sel"></td>
      <td>${r.tour_name || ''}</td>
      <td>${r.group_leader || ''}</td>
      <td>${r.sh_no || ''}</td>
      <td>${r.checkin_date || ''} <span class="small">${r.checkin_time || ''}</span></td>
      <td>${r.building || ''}</td>
      <td>${r.total || 0}</td>
      <td><button class="ghost add">Add</button></td>
    `;
    tr.querySelector('.add').addEventListener('click', ()=>{
      const slot = makeSlot([r]);
      ASSIGN.push(slot);
      renderAssign();
    });
    tbody.appendChild(tr);
  }

  // select all hook
  const selAll = $('#selAll');
  selAll.checked = false;
  selAll.onchange = ()=> $$('#resultsTbl tbody .sel').forEach(cb => cb.checked = selAll.checked);
}

function slotTitle(slot){
  // Big title: each tour on its own line
  const names = slot.tours.map(t=>t.tour_name || '(Untitled)');
  return names.join('\n');
}
function slotLeaders(slot){
  const leaders = uniq(slot.tours.map(t=> t.group_leader).filter(Boolean));
  return leaders.length ? leaders.join(' | ') : '';
}
function renderAssign(){
  const tbody = $('#assignTbl tbody');
  tbody.innerHTML = '';
  for(const s of ASSIGN){
    const tr = document.createElement('tr');
    const names = slotTitle(s).replace(/\n/g,'<br>');
    const leaders = slotLeaders(s);
    tr.innerHTML = `
      <td><input type="checkbox" class="pick"></td>
      <td>${names}</td>
      <td>${leaders}</td>
      <td><input type="number" min="0" value="${s.pax}" class="pax" style="width:90px"></td>
      <td class="tools">
        <button class="ghost split">Split</button>
        <button class="ghost remove">Remove</button>
      </td>
    `;
    tr.querySelector('.pax').addEventListener('change', e=>{
      s.pax = Math.max(0, Number(e.target.value||0));
      renderStickers();
    });
    tr.querySelector('.split').addEventListener('click', ()=>{
      // prompt for two numbers that sum to s.pax
      const tot = Number(s.pax||0);
      const a = prompt(`Split "${slotTitle(s).replace(/\n/g,' + ')}"\nTotal ${tot}. Enter first half pax:`, Math.floor(tot/2));
      if(a==null) return;
      const aNum = Math.max(0, Number(a||0));
      const bNum = Math.max(0, tot - aNum);
      const slot1 = { id: 'S'+(idCounter++), tours: JSON.parse(JSON.stringify(s.tours)), pax: aNum };
      const slot2 = { id: 'S'+(idCounter++), tours: JSON.parse(JSON.stringify(s.tours)), pax: bNum };
      // replace
      ASSIGN = ASSIGN.filter(x=> x!==s).concat([slot1, slot2]);
      renderAssign();
    });
    tr.querySelector('.remove').addEventListener('click', ()=>{
      ASSIGN = ASSIGN.filter(x=> x!==s);
      renderAssign();
    });
    tbody.appendChild(tr);
  }

  // select all for slots
  const sel = $('#assignAll');
  sel.checked = false;
  sel.onchange = ()=> $$('#assignTbl tbody .pick').forEach(cb => cb.checked = sel.checked);

  renderStickers();
}

function renderStickers(){
  const cont = $('#stickers');
  cont.innerHTML = '';
  for(const s of ASSIGN){
    const div = document.createElement('div');
    div.className = 'sticker';
    const title = slotTitle(s).split('\n').map(t=> `<div>${t}</div>`).join('');
    const leaders = slotLeaders(s);
    div.innerHTML = `
      <div class="stack">
        <div class="tour">${title}</div>
        <div class="leader">${leaders || '&nbsp;'}</div>
        <div class="pax">PAX LIMIT: <strong>${Number(s.pax||0)}</strong></div>
      </div>
    `;
    cont.appendChild(div);
  }
}

/* =================== Actions =================== */
// Load arrivals by date/time/building
$('#btnSearch').addEventListener('click', async ()=>{
  if (!ALL.length) ALL = await getAllSlips();
  const df = $('#dateFrom').value, dt = $('#dateTo').value;
  if(!df || !dt){ alert('Pick a date range.'); return; }
  const tf = $('#timeFrom').value, tt = $('#timeTo').value;
  const b = normalize($('#building').value);

  const start = toDateObj(df, tf || '00:00');
  const end   = toDateObj(dt, tt || '23:59');

  const inRange = (s)=>{
    const d = toDateObj(s.checkin_date, s.checkin_time);
    if(!d) return false;
    return d >= start && d <= end;
  };

  RESULTS = ALL
    .filter(s => inRange(s))
    .filter(s => !b || normalize(s.building) === b)
    .map(s => ({
      tour_name: s.tour_name || '',
      group_leader: s.group_leader || '',
      sh_no: s.sh_no || '',
      checkin_date: s.checkin_date || '',
      checkin_time: s.checkin_time || '',
      building: s.building || '',
      total: Number(s.total||0)
    }))
    .sort((a,b)=> (a.checkin_date+a.checkin_time).localeCompare(b.checkin_date+b.checkin_time));

  renderResults();
});

// Add selected arrivals
$('#btnAddSelected').addEventListener('click', ()=>{
  const rows = $$('#resultsTbl tbody tr');
  const chosen = rows.filter(r => r.querySelector('.sel').checked).map(tr => {
    const td = tr.children;
    return {
      tour_name: td[1].textContent.trim(),
      group_leader: td[2].textContent.trim(),
      sh_no: td[3].textContent.trim(),
      checkin_date: td[4].textContent.split(' ')[0],
      checkin_time: td[4].querySelector('.small')?.textContent.trim() || '',
      building: td[5].textContent.trim(),
      total: Number(td[6].textContent.trim() || 0)
    };
  });
  if(!chosen.length){ alert('Select arrivals first.'); return; }
  chosen.forEach(c => ASSIGN.push(makeSlot([c])));
  renderAssign();
});

// Bundle selected arrivals into one slot
$('#btnBundleSelected').addEventListener('click', ()=>{
  const rows = $$('#resultsTbl tbody tr');
  const chosen = rows.filter(r => r.querySelector('.sel').checked).map(tr => {
    const td = tr.children;
    return {
      tour_name: td[1].textContent.trim(),
      group_leader: td[2].textContent.trim(),
      sh_no: td[3].textContent.trim(),
      total: Number(td[6].textContent.trim() || 0)
    };
  });
  if(chosen.length < 2){ alert('Select at least two arrivals to bundle.'); return; }
  ASSIGN.push(makeSlot(chosen));
  renderAssign();
});

// Split selected slot into two
$('#btnSplit').addEventListener('click', ()=>{
  const rows = $$('#assignTbl tbody tr');
  const picks = rows.filter(r => r.querySelector('.pick').checked);
  if(picks.length !== 1){ alert('Pick exactly one slot to split.'); return; }
  const idx = rows.indexOf(picks[0]);
  const slot = ASSIGN[idx];
  const tot = Number(slot.pax||0);
  const a = prompt(`Split "${slotTitle(slot).replace(/\n/g,' + ')}"\nTotal ${tot}. Enter first half pax:`, Math.floor(tot/2));
  if(a==null) return;
  const aNum = Math.max(0, Number(a||0));
  const bNum = Math.max(0, tot - aNum);
  const slot1 = { id: 'S'+(idCounter++), tours: JSON.parse(JSON.stringify(slot.tours)), pax: aNum };
  const slot2 = { id: 'S'+(idCounter++), tours: JSON.parse(JSON.stringify(slot.tours)), pax: bNum };
  ASSIGN.splice(idx,1, slot1, slot2);
  renderAssign();
});

// Bundle selected slots into one
$('#btnBundleSlots').addEventListener('click', ()=>{
  const rows = $$('#assignTbl tbody tr');
  const picks = rows.map((r,i)=>({row:r, idx:i})).filter(p => p.row.querySelector('.pick').checked);
  if(picks.length < 2){ alert('Pick at least two slots to bundle.'); return; }
  const items = picks.map(p => ASSIGN[p.idx]);
  const merged = {
    id: 'S'+(idCounter++),
    tours: items.flatMap(s=> s.tours),
    pax: sum(items.map(s=> s.pax||0))
  };
  // remove higher indices first
  picks.sort((a,b)=> b.idx - a.idx).forEach(p => ASSIGN.splice(p.idx,1));
  ASSIGN.push(merged);
  renderAssign();
});

// Clear assignment list
$('#btnClearList').addEventListener('click', ()=>{
  if(confirm('Clear the assignment list?')){ ASSIGN = []; renderAssign(); }
});

// Print
$('#btnPrint').addEventListener('click', ()=>{
  if(!ASSIGN.length){ alert('Nothing to print. Add slots first.'); return; }
  window.print();
});

/* =================== Boot defaults =================== */
(function initDefaults(){
  // default range = today
  const now = new Date();
  const yyyy = now.getFullYear(), mm = pad2(now.getMonth()+1), dd = pad2(now.getDate());
  $('#dateFrom').value = `${yyyy}-${mm}-${dd}`;
  $('#dateTo').value   = `${yyyy}-${mm}-${dd}`;
})();

}
