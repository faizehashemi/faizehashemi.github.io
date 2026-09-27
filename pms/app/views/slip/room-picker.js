// Room picker for the Slip page: a visual map of one building for the slip's stay window.
//
// For every room it looks at the WHOLE stay (arrival → departure), not just the arrival moment:
// "free" is capacity minus the busiest moment of the stay, so a bed is never handed out twice.
// Each tile carries a small timeline of the room across the stay; the side panel shows who is in
// the selected room and when. Allocating is per room and per side (gents or ladies), capped at
// the room's free beds. Apply writes the choice into the slip's room tables; Save/Edit still runs
// the normal availability check.

import { findBuilding, normRoom, floorOf } from '../../core/rooms.js';

const natural = (a, b) => String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: 'base' });
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const parseDT = (d, t) => { if (!d) return null; const v = new Date(`${d}T${t && t.length ? t : '00:00'}`); return isNaN(v) ? null : v; };
const fmt = (dt) => dt.toLocaleString([], { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
const SIDES = { gents: 'Gents', ladies: 'Ladies' };

/** Busiest moment and the occupancy profile of a room across [from, to). */
function profile(events, from, to) {
    const cuts = [...new Set([+from, +to, ...events.flatMap(e => [+e.start, +e.end])])].filter(t => t >= +from && t <= +to).sort((a, b) => a - b);
    const segs = [];
    for (let i = 0; i < cuts.length - 1; i++) {
        const a = cuts[i], b = cuts[i + 1];
        const used = events.reduce((n, e) => n + (+e.start < b && +e.end > a ? e.beds : 0), 0);
        segs.push({ from: a, to: b, used });
    }
    const peakSeg = segs.reduce((m, s) => (s.used > (m?.used ?? -1) ? s : m), null);
    return { segs, peak: peakSeg ? peakSeg.used : 0, peakSeg };
}

/**
 * @param {object} o
 *   building, checkin:{date,time}, checkout:{date,time}, slips (this site), buildings (builder list),
 *   historyCap(room) → capacity from old slips or null, excludeId (the slip being edited),
 *   current {gents:[rows], ladies:[rows]}, needs {gents, ladies, children, infants},
 *   onApply(gentsRows, ladiesRows), host (element to attach the dialog to)
 */
export function openRoomPicker(o) {
    const ci = parseDT(o.checkin.date, o.checkin.time);
    const co = parseDT(o.checkout.date, o.checkout.time);
    const bld = String(o.building || '').trim().toUpperCase();

    /* ------------------------------ rooms + usage ------------------------------ */
    const rooms = new Map(); // norm → { room_no, cap, type, floor, known }
    const builder = findBuilding(o.buildings, bld);
    for (const r of builder?.rooms || []) {
        if (r.active === false) continue;
        rooms.set(normRoom(r.room_no), { room_no: r.room_no, cap: r.capacity, type: r.type || '', floor: r.floor || floorOf(r.room_no), known: 'builder' });
    }
    const usage = new Map(); // norm → [events]
    for (const s of o.slips) {
        if (s.id === o.excludeId || String(s.building || '').trim().toUpperCase() !== bld) continue;
        const rci = parseDT(s.checkin_date, s.checkin_time), rco = parseDT(s.checkout_date, s.checkout_time);
        const stays = rci && rco && rci < co && rco > ci;
        for (const side of ['gents', 'ladies']) {
            for (const x of s.rooms?.[side] || []) {
                const k = normRoom(x.room_no);
                if (!k) continue;
                if (!rooms.has(k)) { // a room only known from slips
                    const cap = o.historyCap(x.room_no);
                    rooms.set(k, { room_no: String(x.room_no).trim(), cap: cap ?? (Number(x.capacity) || 0), type: '', floor: floorOf(x.room_no), known: 'slips' });
                }
                const beds = Number(x.assigned) || 0;
                if (!stays || beds <= 0) continue;
                if (!usage.has(k)) usage.set(k, []);
                usage.get(k).push({ start: new Date(Math.max(+rci, +ci)), end: new Date(Math.min(+rco, +co)), fullStart: rci, fullEnd: rco, beds, side, sh: s.sh_no, tour: s.tour_name || '' });
            }
        }
    }
    for (const side of ['gents', 'ladies']) for (const x of o.current[side] || []) {
        const k = normRoom(x.room_no);
        if (k && !rooms.has(k)) rooms.set(k, { room_no: String(x.room_no).trim(), cap: Number(x.capacity) || o.historyCap(x.room_no) || 0, type: '', floor: floorOf(x.room_no), known: 'slip' });
    }
    for (const [k, r] of rooms) {
        r.events = usage.get(k) || [];
        Object.assign(r, profile(r.events, ci, co));
        r.free = Math.max(0, (r.cap || 0) - r.peak);
    }

    /* ------------------------------- allocation ------------------------------- */
    const alloc = new Map(); // norm → { side, beds }
    for (const side of ['gents', 'ladies']) for (const x of o.current[side] || []) {
        const k = normRoom(x.room_no);
        const beds = Number(x.assigned) || Number(x.capacity) || 0;
        if (k && beds > 0 && !alloc.has(k)) alloc.set(k, { side, beds });
    }
    const allocated = (side) => [...alloc.values()].filter(a => a.side === side).reduce((n, a) => n + a.beds, 0);
    let selected = null;

    /* --------------------------------- dialog --------------------------------- */
    const dlg = document.createElement('dialog');
    dlg.className = 'rp';
    const nights = Math.max(0, Math.round((new Date(o.checkout.date) - new Date(o.checkin.date)) / 864e5));
    const floors = [...new Set([...rooms.values()].map(r => r.floor))].sort(natural);
    dlg.innerHTML = `
      <form method="dialog" class="rp-wrap">
        <header class="rp-head">
          <div>
            <h2>Pick rooms — ${esc(bld)}</h2>
            <p>${esc(fmt(ci))} → ${esc(fmt(co))} · ${nights} night${nights === 1 ? '' : 's'} · free beds count the whole stay</p>
          </div>
          <button type="button" class="rp-x" data-act="close" aria-label="Close">✕</button>
        </header>
        <div class="rp-needs" id="rpNeeds"></div>
        <div class="rp-body">
          <section class="rp-main">
            <div class="rp-filters">
              <select id="rpFloor" aria-label="Floor"><option value="">All floors</option>${floors.map(f => `<option value="${esc(f)}">Floor ${esc(f)}</option>`).join('')}</select>
              <label><input type="checkbox" id="rpSpace" ${o.onlyFree === false ? '' : 'checked'}> Only rooms with space</label>
              <input type="search" id="rpFind" placeholder="Find room…" aria-label="Find room">
              <span class="rp-legend"><i class="l-free"></i>free <i class="l-part"></i>part used <i class="l-full"></i>full <i class="l-mine"></i>this slip</span>
            </div>
            <div class="rp-floors" id="rpFloors"></div>
          </section>
          <aside class="rp-side">
            <div class="rp-detail" id="rpDetail"><p class="rp-muted">Choose a room to see who is in it during this stay and to give it beds.</p></div>
            <h3>This slip's rooms</h3>
            <div class="rp-list" id="rpList"></div>
          </aside>
        </div>
        <footer class="rp-foot">
          <button type="button" data-act="auto">Fill automatically</button>
          <button type="button" data-act="clear">Clear</button>
          <span class="rp-grow"></span>
          <button type="button" data-act="close">Cancel</button>
          <button type="button" class="rp-primary" data-act="apply">Apply to slip</button>
        </footer>
      </form>`;
    (o.host || document.body).appendChild(dlg);
    const $ = (id) => dlg.querySelector('#' + id);

    const pct = (t) => ((t - +ci) / Math.max(1, +co - +ci)) * 100;
    function bar(r, big = false) {
        if (!r.segs.length) return `<div class="rp-bar${big ? ' big' : ''}"></div>`;
        return `<div class="rp-bar${big ? ' big' : ''}">${r.segs.filter(s => s.used > 0).map(s => {
            const ratio = r.cap ? s.used / r.cap : 1;
            return `<span class="${ratio >= 1 ? 'full' : 'part'}" style="left:${pct(s.from)}%;width:${pct(s.to) - pct(s.from)}%" title="${esc(fmt(new Date(s.from)))} → ${esc(fmt(new Date(s.to)))}: ${s.used}/${r.cap} beds taken"></span>`;
        }).join('')}</div>`;
    }

    function renderNeeds() {
        const n = o.needs;
        const part = (side) => {
            const need = Number(n[side]) || 0, got = allocated(side);
            const cls = got === need ? 'ok' : got > need ? 'over' : 'short';
            return `<span class="rp-need ${cls}"><b>${SIDES[side]}</b> ${got} of ${need} bed${need === 1 ? '' : 's'}${cls === 'short' ? ` · ${need - got} to go` : cls === 'over' ? ` · ${got - need} extra` : ' ✓'}</span>`;
        };
        $('rpNeeds').innerHTML = part('gents') + part('ladies') +
            ((Number(n.children) || Number(n.infants)) ? `<span class="rp-note">+ ${Number(n.children) || 0} children, ${Number(n.infants) || 0} infants — add beds for them if they need their own</span>` : '');
    }

    function renderRooms() {
        const floor = $('rpFloor').value, onlySpace = $('rpSpace').checked, q = normRoom($('rpFind').value);
        const list = [...rooms.entries()].filter(([k, r]) => (!floor || r.floor === floor) && (!q || k.includes(q)) && (!onlySpace || r.free > 0 || alloc.has(k)));
        const byFloor = new Map();
        for (const [k, r] of list.sort((a, b) => natural(a[1].room_no, b[1].room_no))) {
            if (!byFloor.has(r.floor)) byFloor.set(r.floor, []);
            byFloor.get(r.floor).push([k, r]);
        }
        $('rpFloors').innerHTML = [...byFloor.keys()].sort(natural).map(f => `
            <div class="rp-floor"><h4>Floor ${esc(f)}</h4><div class="rp-tiles">${byFloor.get(f).map(([k, r]) => {
                const a = alloc.get(k);
                const state = a ? 'mine' : r.free <= 0 ? 'full' : r.peak > 0 ? 'part' : 'free';
                const left = r.free - (a ? a.beds : 0);
                return `<button type="button" class="rp-tile ${state} ${selected === k ? 'sel' : ''}" data-room="${esc(k)}"
                    title="${esc(r.room_no)}: ${r.free} of ${r.cap} beds free for the whole stay${r.events.length ? ` · shared with ${r.events.map(e => 'SH ' + e.sh).join(', ')}` : ''}">
                    <span class="rp-no">${esc(r.room_no)}${r.type ? `<em>${esc(r.type[0].toUpperCase())}</em>` : ''}</span>
                    <span class="rp-free">${a ? `${SIDES[a.side][0]} ${a.beds} · ${left} left` : `${r.free}/${r.cap} free`}</span>
                    ${bar(r)}
                </button>`;
            }).join('')}</div></div>`).join('') || `<p class="rp-muted">${rooms.size ? 'No room matches. Untick “Only rooms with space” to see full rooms.' : `No rooms known for ${esc(bld)}. Add them in Rooms & Buildings.`}</p>`;
    }

    function renderDetail() {
        if (!selected || !rooms.has(selected)) { $('rpDetail').innerHTML = '<p class="rp-muted">Choose a room to see who is in it during this stay and to give it beds.</p>'; return; }
        const r = rooms.get(selected), a = alloc.get(selected);
        const side = a?.side || (r.type === 'ladies' ? 'ladies' : 'gents');
        const beds = a?.beds || 0;
        const clash = r.type && r.type !== 'family' && r.type !== side;
        $('rpDetail').innerHTML = `
            <div class="rp-dhead"><b>Room ${esc(r.room_no)}</b><span>${r.cap} bed${r.cap === 1 ? '' : 's'}${r.type ? ' · ' + esc(r.type) : ''}${r.known === 'slips' ? ' · capacity from old slips' : ''}</span></div>
            <p class="rp-big">${r.free} free for the whole stay${r.peakSeg && r.peak ? ` <span class="rp-muted">(busiest ${esc(fmt(new Date(r.peakSeg.from)))} → ${esc(fmt(new Date(r.peakSeg.to)))}: ${r.peak} taken)</span>` : ''}</p>
            ${bar(r, true)}
            <div class="rp-axis"><span>${esc(fmt(ci))}</span><span>${esc(fmt(co))}</span></div>
            ${r.events.length ? `<ul class="rp-others">${r.events.map(e => `<li><b>SH ${esc(e.sh)}</b> ${esc(e.tour)} · ${e.beds} ${esc(e.side)} bed${e.beds === 1 ? '' : 's'}<br><span class="rp-muted">${esc(fmt(e.fullStart))} → ${esc(fmt(e.fullEnd))}</span></li>`).join('')}</ul>` : '<p class="rp-muted">Nobody else in this room during the stay.</p>'}
            <div class="rp-assign">
              <div class="rp-seg" role="group" aria-label="Side">${Object.entries(SIDES).map(([k, l]) => `<button type="button" data-side="${k}" aria-pressed="${k === side}">${l}</button>`).join('')}</div>
              <div class="rp-step"><button type="button" data-step="-1" aria-label="One bed less">−</button><output id="rpBeds">${beds}</output><button type="button" data-step="1" aria-label="One bed more">+</button></div>
              <button type="button" data-act="max">All ${r.free}</button>
            </div>
            ${clash ? `<p class="rp-warn">This room is marked for ${esc(r.type)}.</p>` : ''}
            ${r.free <= 0 && !a ? '<p class="rp-warn">No bed is free for the whole stay.</p>' : ''}`;
        dlg._side = side;
    }

    function renderList() {
        const rows = [...alloc.entries()].sort((x, y) => natural(x[1].side + rooms.get(x[0])?.room_no, y[1].side + rooms.get(y[0])?.room_no));
        $('rpList').innerHTML = rows.length ? rows.map(([k, a]) => `<div class="rp-item"><button type="button" class="rp-link" data-room="${esc(k)}">${esc(rooms.get(k)?.room_no || k)}</button><span>${SIDES[a.side]}</span><b>${a.beds}</b><button type="button" class="rp-rm" data-remove="${esc(k)}" aria-label="Remove">✕</button></div>`).join('') : '<p class="rp-muted">No rooms yet.</p>';
    }

    const renderAll = () => { renderNeeds(); renderRooms(); renderDetail(); renderList(); };

    function setAlloc(k, side, beds) {
        const r = rooms.get(k);
        beds = Math.max(0, Math.min(r.free, beds));
        if (!beds) alloc.delete(k); else alloc.set(k, { side, beds });
        renderAll();
    }

    function autoFill() {
        for (const side of ['gents', 'ladies']) {
            let left = (Number(o.needs[side]) || 0) - allocated(side);
            if (left <= 0) continue;
            const cands = [...rooms.entries()]
                .filter(([k, r]) => !alloc.has(k) && r.free > 0 && (!r.type || r.type === 'family' || r.type === side))
                // empty rooms first, then the most free beds, then keep to low floors / room order
                .sort((a, b) => (a[1].peak > 0) - (b[1].peak > 0) || b[1].free - a[1].free || natural(a[1].floor, b[1].floor) || natural(a[1].room_no, b[1].room_no));
            for (const [k, r] of cands) {
                if (left <= 0) break;
                const beds = Math.min(r.free, left);
                alloc.set(k, { side, beds });
                left -= beds;
            }
        }
        renderAll();
    }

    dlg.addEventListener('click', (e) => {
        const t = e.target.closest('button');
        if (!t) return;
        const act = t.dataset.act;
        if (t.dataset.room) { selected = t.dataset.room; renderAll(); return; }
        if (t.dataset.remove) { alloc.delete(t.dataset.remove); renderAll(); return; }
        if (t.dataset.side && selected) { const a = alloc.get(selected); if (a) setAlloc(selected, t.dataset.side, a.beds); else { dlg._side = t.dataset.side; renderDetail(); dlg.querySelectorAll('[data-side]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.side === t.dataset.side))); } return; }
        if (t.dataset.step && selected) { const a = alloc.get(selected); setAlloc(selected, a?.side || dlg._side, (a?.beds || 0) + Number(t.dataset.step)); return; }
        if (act === 'max' && selected) { setAlloc(selected, alloc.get(selected)?.side || dlg._side, rooms.get(selected).free); return; }
        if (act === 'auto') autoFill();
        if (act === 'clear') { alloc.clear(); renderAll(); }
        if (act === 'close') dlg.close();
        if (act === 'apply') {
            const out = { gents: [], ladies: [] };
            for (const [k, a] of alloc) { const r = rooms.get(k); out[a.side].push({ room_no: r.room_no, capacity: r.cap, assigned: a.beds }); }
            out.gents.sort((x, y) => natural(x.room_no, y.room_no));
            out.ladies.sort((x, y) => natural(x.room_no, y.room_no));
            o.onApply(out.gents, out.ladies);
            dlg.close();
        }
    });
    $('rpFloor').addEventListener('change', renderRooms);
    $('rpSpace').addEventListener('change', renderRooms);
    $('rpFind').addEventListener('input', renderRooms);
    dlg.addEventListener('close', () => dlg.remove());

    renderAll();
    dlg.showModal();
    return dlg;
}
