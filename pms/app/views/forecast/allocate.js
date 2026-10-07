// Allocate rooms for a day's check-ins (Forecast page): every group checking in on the chosen date that has no
// rooms yet gets a building and rooms in one go, shown as a summary first; one click writes them all.
//
//   Building  the slip's own building if it has one; else the building the planner's plan on screen suggests;
//             else the most wanted building (planner order and targets) with enough free beds for the whole stay.
//   Rooms     like Pick rooms → Fill automatically: free beds count the whole stay (capacity minus the busiest
//             moment, counting every other slip and the groups allocated before in this run); gents get gents /
//             family / untyped rooms, ladies + children get ladies / family / untyped rooms; empty rooms first,
//             then the most free beds, then low floors; a room never mixes gents and ladies of different groups.
//             Infants get no bed. Groups are not split across buildings.
//   Order     biggest groups first, so they find whole rooms.
//   Apply     writes building + rooms onto the ticked slips (complete allocations are ticked).

import { findBuilding, normRoom, floorOf } from '../../core/rooms.js';
import { recordApply } from './alloclog.js';

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const num = (v) => { const x = Number(v); return Number.isFinite(x) ? x : 0; };
const pad = (n) => String(n).padStart(2, '0');
const ymd = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const parseDT = (d, t) => { if (!d) return null; const v = new Date(`${d}T${t && t.length ? t : '00:00'}`); return isNaN(v) ? null : v.getTime(); };
const natural = (a, b) => String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: 'base' });
const hasRooms = (r) => ['gents', 'ladies'].some(s => (r.rooms?.[s] || []).some(x => String(x.room_no || '').trim()));
const fmtT = (t) => new Date(t).toLocaleString(undefined, { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
const SIDE = { gents: 'Gents', ladies: 'Ladies' };

/** @param {{ ctx: object, host: Element, planner: object }} o */
export function mountAllocator({ ctx, host, planner }) {
    host.innerHTML = `
      <div class="pl-head"><h2>🛏️ Allocate rooms for a day's check-ins</h2>
        <p>Gives every group checking in on the date (and without rooms yet) a building and rooms, like <i>Fill automatically</i> in Pick rooms. Buildings follow the planner order above. Check the summary, then apply it in one click.</p></div>
      <div class="pl-run al-run">
        <label>Check-in date <input type="date" id="alDate"></label>
        <button type="button" id="alGo" class="pl-btn primary">Allocate rooms</button>
        <span id="alStatus" class="pl-hint"></span>
      </div>
      <div id="alOut"></div>`;
    const $ = (id) => host.querySelector('#' + id);
    $('alDate').value = ymd(new Date());
    let RESULT = null;

    function allocate(slips, buildingsAll, date) {
        const prio = planner.priority();
        const capOf = Object.fromEntries(prio.map(p => [p.name, p.cap]));
        // every room's bookings: norm room → [{ start, end, beds }], per building
        const book = new Map();
        const key = (b, room) => `${b}|${normRoom(room)}`;
        const addBooking = (b, room, start, end, beds, side) => { const k = key(b, room); if (!book.has(k)) book.set(k, []); book.get(k).push({ start, end, beds, side }); };
        for (const r of slips) {
            if (r.deleted) continue;
            const b = String(r.building || '').trim().toUpperCase();
            const ci = parseDT(r.checkin_date, r.checkin_time), co = parseDT(r.checkout_date, r.checkout_time);
            if (!b || !ci || !co) continue;
            for (const s of ['gents', 'ladies']) for (const x of r.rooms?.[s] || []) {
                const beds = x.assigned !== '' && x.assigned != null ? num(x.assigned) : num(x.capacity);
                if (String(x.room_no || '').trim() && beds > 0) addBooking(b, x.room_no, ci, co, beds, s);
            }
        }
        // busiest moment in [ci, co) for a room
        const peak = (b, room, ci, co) => {
            const ev = (book.get(key(b, room)) || []).filter(e => e.start < co && e.end > ci);
            if (!ev.length) return 0;
            const cuts = [...new Set([ci, ...ev.map(e => Math.max(e.start, ci))])];
            return Math.max(...cuts.map(t => ev.reduce((n, e) => n + (e.start <= t && t < e.end ? e.beds : 0), 0)));
        };
        // a room already holding the other side during the stay is not shared (no gents and ladies of different groups together)
        const otherSide = (b, room, ci, co, side) => (book.get(key(b, room)) || []).some(e => e.start < co && e.end > ci && e.side && e.side !== side);
        const roomsOf = (b) => (findBuilding(buildingsAll, b)?.rooms || []).filter(r => r.active !== false && num(r.capacity) > 0);
        const freeBeds = (b, ci, co) => roomsOf(b).reduce((n, r) => n + Math.max(0, num(r.capacity) - peak(b, r.room_no, ci, co)), 0);
        // building load at its busiest moment of the stay (for the planner's target caps)
        const load = (b, ci, co) => {
            const all = roomsOf(b).flatMap(r => (book.get(key(b, r.room_no)) || []).filter(e => e.start < co && e.end > ci));
            const cuts = [...new Set([ci, ...all.map(e => Math.max(e.start, ci))])];
            return Math.max(0, ...cuts.map(t => all.reduce((n, e) => n + (e.start <= t && t < e.end ? e.beds : 0), 0)));
        };

        const day = slips.filter(r => !r.deleted && r.checkin_date === date);
        const todo = day.filter(r => !hasRooms(r));
        const done = day.filter(hasRooms);
        const need = (r) => ({ gents: num(r.gents), ladies: num(r.ladies) + num(r.children) });
        const total = (r) => need(r).gents + need(r).ladies;
        todo.sort((a, b) => total(b) - total(a) || natural(a.sh_no, b.sh_no));

        const rows = [];
        for (const r of todo) {
            const ci = parseDT(r.checkin_date, r.checkin_time), co = parseDT(r.checkout_date, r.checkout_time);
            const n = need(r), beds = n.gents + n.ladies;
            const row = { r, need: n, beds, building: '', rooms: { gents: [], ladies: [] }, short: 0, note: '' };
            rows.push(row);
            if (!ci || !co || co <= ci) { row.note = 'check-in / check-out missing'; row.short = beds; continue; }
            if (!beds) { row.note = 'no guest counts'; continue; }
            const own = String(r.building || '').trim().toUpperCase();
            const fitsIn = (b) => freeBeds(b, ci, co) >= beds && (capOf[b] == null || load(b, ci, co) + beds <= capOf[b]);
            let b = own;
            if (!b) {
                const sug = planner.suggestion(r.id);
                if (sug && fitsIn(sug)) b = sug;
                else b = prio.map(p => p.name).find(fitsIn) || '';
                if (!b) { row.note = 'no building has enough free beds for the whole stay'; row.short = beds; continue; }
                row.note = sug === b ? 'planner suggestion' : `${prio.findIndex(p => p.name === b) + 1}${['st', 'nd', 'rd'][prio.findIndex(p => p.name === b)] || 'th'} choice with room`;
            } else row.note = 'building already on the slip';
            row.building = b;
            const used = new Set();
            for (const side of ['gents', 'ladies']) {
                let left = n[side];
                const cands = roomsOf(b)
                    .filter(x => !x.type || x.type === 'family' || x.type === side)
                    .map(x => ({ x, p: peak(b, x.room_no, ci, co) }))
                    .map(o => ({ ...o, free: Math.max(0, num(o.x.capacity) - o.p) }))
                    .filter(o => o.free > 0 && !used.has(normRoom(o.x.room_no)) && !otherSide(b, o.x.room_no, ci, co, side))
                    .sort((A, B) => (A.p > 0) - (B.p > 0) || B.free - A.free || natural(A.x.floor || floorOf(A.x.room_no), B.x.floor || floorOf(B.x.room_no)) || natural(A.x.room_no, B.x.room_no));
                for (const o of cands) {
                    if (left <= 0) break;
                    const give = Math.min(o.free, left);
                    row.rooms[side].push({ room_no: o.x.room_no, capacity: num(o.x.capacity), assigned: give });
                    used.add(normRoom(o.x.room_no));
                    addBooking(b, o.x.room_no, ci, co, give, side);
                    left -= give;
                }
                row.short += Math.max(0, left);
            }
            for (const s of ['gents', 'ladies']) row.rooms[s].sort((x, y) => natural(x.room_no, y.room_no));
        }
        return { date, rows, done };
    }

    function render() {
        const { date, rows, done } = RESULT;
        if (!rows.length) {
            $('alOut').innerHTML = `<p class="pl-msg">${done.length ? `All ${done.length} group${done.length === 1 ? '' : 's'} checking in on ${esc(date)} already have rooms.` : `No check-ins on ${esc(date)}.`}</p>`;
            return;
        }
        const ok = rows.filter(x => x.building && !x.short);
        const byB = {};
        for (const x of rows) if (x.building) { const s = (byB[x.building] ||= { groups: 0, beds: 0, rooms: 0 }); s.groups++; s.beds += x.beds - x.short; s.rooms += x.rooms.gents.length + x.rooms.ladies.length; }
        const list = (arr) => arr.length ? arr.map(o => `${esc(o.room_no)}<sup>${o.assigned}</sup>`).join(' ') : '—';
        $('alOut').innerHTML = `
          <div class="al-sum">
            <div class="al-kpi"><b>${rows.length}</b><span>group${rows.length === 1 ? '' : 's'} without rooms</span></div>
            <div class="al-kpi ok"><b>${ok.length}</b><span>fully allocated</span></div>
            <div class="al-kpi ${rows.length - ok.length ? 'bad' : ''}"><b>${rows.length - ok.length}</b><span>short of beds</span></div>
            ${Object.entries(byB).map(([b, s]) => `<div class="al-kpi"><b>${esc(b)}</b><span>${s.groups} group${s.groups === 1 ? '' : 's'} · ${s.beds} beds · ${s.rooms} rooms</span></div>`).join('')}
            ${done.length ? `<div class="al-kpi"><b>${done.length}</b><span>already had rooms (left as they are)</span></div>` : ''}
          </div>
          <div class="pl-table-head">
            <h3>Check-ins on ${esc(date)}</h3>
            ${ctx.db.readonly ? '' : `<div class="pl-apply"><button type="button" id="alApply" class="pl-btn primary" ${ok.length ? '' : 'disabled'}>✔ Apply ${ok.length} allocation${ok.length === 1 ? '' : 's'}</button></div>`}
          </div>
          <div class="pl-table-wrap"><table class="pl-table">
            <thead><tr>${ctx.db.readonly ? '' : '<th></th>'}<th>SH</th><th>Group</th><th>Check-in</th><th class="n">Gents</th><th class="n">Ladies+C</th><th>Building</th><th>Gents rooms</th><th>Ladies rooms</th><th>Note</th></tr></thead>
            <tbody>${rows.map((x, i) => {
                const full = x.building && !x.short;
                return `<tr class="${full ? '' : 'un'}">${ctx.db.readonly ? '' : `<td><input type="checkbox" data-al="${i}" ${full ? 'checked' : ''} ${x.building && (x.rooms.gents.length || x.rooms.ladies.length) ? '' : 'disabled'}></td>`}
                  <td class="sh">${esc(x.r.sh_no ?? '')}</td>
                  <td><b>${esc(x.r.tour_name || '-')}</b><small>${esc(String(x.r.group_leader ?? '').trim() || '-')}</small></td>
                  <td class="stay">${esc(fmtT(parseDT(x.r.checkin_date, x.r.checkin_time)))}<small>→ ${esc(fmtT(parseDT(x.r.checkout_date, x.r.checkout_time)) || '')}</small></td>
                  <td class="n">${x.need.gents}</td><td class="n">${x.need.ladies}</td>
                  <td>${x.building ? `<span class="pl-b r${Math.max(0, planner.priority().findIndex(p => p.name === x.building))}">${esc(x.building)}</span>` : '<span class="pl-b none">none</span>'}</td>
                  <td class="al-rooms">${list(x.rooms.gents)}</td><td class="al-rooms">${list(x.rooms.ladies)}</td>
                  <td class="why">${x.short ? `<b class="pl-bad">${x.short} bed${x.short === 1 ? '' : 's'} short</b> · ` : ''}${esc(x.note)}</td></tr>`;
            }).join('')}</tbody></table></div>
          <p class="pl-hint">Small numbers are the beds given in each room. Groups short of beds are not ticked — tick one to apply what was found, or finish it with Pick rooms on the Slip page.</p>`;
    }

    async function run() {
        const date = $('alDate').value;
        if (!date) { $('alStatus').textContent = 'Choose a date.'; return; }
        $('alGo').disabled = true; $('alStatus').textContent = 'Reading slips and rooms…';
        try {
            await planner.refresh();
            const slips = await ctx.guard(ctx.db.all());
            RESULT = allocate(slips, planner.buildings(), date);
            $('alStatus').textContent = '';
            render();
        } catch (e) { console.error(e); $('alStatus').textContent = e.message || String(e); }
        finally { $('alGo').disabled = false; }
    }
    $('alGo').addEventListener('click', run);
    window.addEventListener('pms:alloc-undone', () => { if (RESULT) run(); });

    $('alOut').addEventListener('click', async (e) => {
        if (!e.target.closest('#alApply')) return;
        const picks = [...host.querySelectorAll('[data-al]:checked')].map(c => RESULT.rows[Number(c.dataset.al)]);
        if (!picks.length) { alert('Tick the groups to apply first.'); return; }
        const rooms = picks.reduce((n, x) => n + x.rooms.gents.length + x.rooms.ladies.length, 0);
        if (!confirm(`Apply ${picks.length} allocation${picks.length === 1 ? '' : 's'} (${rooms} rooms)? Building and rooms are written onto those slips.`)) return;
        const btn = $('alApply'); btn.disabled = true; btn.textContent = 'Applying…';
        try {
            const current = new Map((await ctx.db.all()).map(r => [r.id, r]));
            const put = [], skipped = [];
            for (const x of picks) {
                const r = current.get(x.r.id);
                if (!r || hasRooms(r)) { skipped.push(x.r.sh_no); continue; } // changed on another desk meanwhile
                put.push({ ...r, building: x.building, rooms: { gents: x.rooms.gents, ladies: x.rooms.ladies } });
            }
            const res = put.length ? await ctx.guard(ctx.db.bulkWrite({ put }, 'allocate-day')) : { updated: 0 };
            if (put.length) await recordApply(ctx, 'allocate-day', `Rooms for check-ins on ${RESULT.date}`, put.map(p => [current.get(p.id), p]));
            await run();
            $('alStatus').textContent = `Applied: ${res.updated} slip${res.updated === 1 ? '' : 's'} now have rooms.${skipped.length ? ` Skipped ${skipped.length} that got rooms on another desk meanwhile (SH ${skipped.join(', ')}).` : ''}`;
        } catch (err) {
            alert(err.message || String(err));
            btn.disabled = false; btn.textContent = 'Apply';
        }
    });
}
