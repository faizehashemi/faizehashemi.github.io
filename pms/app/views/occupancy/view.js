// Occupancy details (Rooms): beds in use each night of a period — the whole site first (totals and averages),
// then each building (period averages, night by night), then every room bed by bed.
//   A night is counted at 22:00: a slip's beds count when check-in ≤ 22:00 < check-out.
//   Beds in use = the beds assigned to each room on the slips (assigned, else the room's capacity on the slip).
//   Capacity = active rooms in Rooms & Buildings. Guests whose slip has a building but no rooms yet are shown
//   apart ("without rooms"); they are not in the %.

import { loadBuildings, buildingsOfSite, normRoom, floorOf } from '../../core/rooms.js';
import { rowsOf, slipEnd, isDelayed, paxAt } from '../../core/stay.js';

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const num = (v) => { const x = Number(v); return Number.isFinite(x) ? x : 0; };
const pad = (n) => String(n).padStart(2, '0');
const ymd = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const shift = (d, n) => { const x = new Date(`${d}T12:00`); x.setDate(x.getDate() + n); return ymd(x); };
const parseDT = (d, t) => { if (!d) return null; const v = new Date(`${d}T${t && t.length ? t : '00:00'}`); return isNaN(v) ? null : v.getTime(); };
const natural = (a, b) => String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: 'base' });
const pct = (u, c) => c ? Math.round(100 * u / c) : 0;
const dayLbl = (d) => new Date(`${d}T12:00`).toLocaleDateString(undefined, { day: '2-digit', month: 'short' });
const wkLbl = (d) => new Date(`${d}T12:00`).toLocaleDateString(undefined, { weekday: 'short' });
const MAX_DAYS = 62;

export default async function mount(ctx) {
    const $ = (id) => ctx.root.querySelector('#' + id);
    const today = ymd(new Date());
    $('ocFrom').value = today; $('ocTo').value = shift(today, 13);
    let BUILDINGS = [];

    async function load() {
        BUILDINGS = buildingsOfSite(await ctx.guard(loadBuildings({ force: true })), ctx.siteId)
            .map(b => ({ name: b.name, rooms: b.rooms.filter(r => r.active !== false && num(r.capacity) > 0) }))
            .filter(b => b.rooms.length);
        const keep = $('ocBld').value;
        $('ocBld').innerHTML = '<option value="">All buildings</option>' + BUILDINGS.map(b => `<option ${b.name === keep ? 'selected' : ''}>${esc(b.name)}</option>`).join('');
        return ctx.db.all();
    }

    function compute(slips) {
        let from = $('ocFrom').value || today, to = $('ocTo').value || from;
        if (from > to) [from, to] = [to, from];
        const days = [];
        for (let d = from; d <= to && days.length < MAX_DAYS; d = shift(d, 1)) days.push(d);
        const nights = days.map(d => parseDT(d, '22:00'));
        const only = $('ocBld').value;
        const blds = BUILDINGS.filter(b => !only || b.name === only).map(b => {
            const rooms = b.rooms.map(r => ({ no: String(r.room_no).trim(), key: normRoom(r.room_no), floor: String(r.floor || '').trim() || floorOf(r.room_no), cap: num(r.capacity), used: days.map(() => 0) }))
                .sort((x, y) => natural(x.floor, y.floor) || natural(x.no, y.no));
            return { name: b.name, rooms, byKey: new Map(rooms.map(r => [r.key, r])), cap: rooms.reduce((n, r) => n + r.cap, 0), used: days.map(() => 0), unroomed: days.map(() => 0), extra: new Map() };
        });
        const byName = new Map(blds.map(b => [b.name, b]));
        for (const s of slips) {
            if (s.deleted) continue;
            const b = byName.get(String(s.building || '').trim().toUpperCase());
            if (!b) continue;
            const ci = parseDT(s.checkin_date, s.checkin_time), co = slipEnd(s); // a delayed group: its last room
            if (!ci || !co) continue;
            const on = nights.map(t => ci <= t && t < co);
            if (!on.some(Boolean)) continue;
            const rows = rowsOf(s); // each room row's own window (core/stay.js)
            if (!rows.length) {
                const beds = (num(s.gents) + num(s.ladies) + num(s.children)) || num(s.total);
                on.forEach((v, i) => { if (v) b.unroomed[i] += isDelayed(s) ? paxAt(s, nights[i]).total : beds; });
                continue;
            }
            for (const w of rows) {
                if (w.beds <= 0) continue;
                let room = b.byKey.get(normRoom(w.room_no));
                if (!room) { // a room the slips use that is not active in Rooms & Buildings
                    const k = normRoom(w.room_no);
                    room = b.extra.get(k) || { no: w.room_no, key: k, floor: floorOf(w.room_no), cap: 0, used: days.map(() => 0), off: true };
                    b.extra.set(k, room);
                }
                nights.forEach((t, i) => { if (w.start <= t && t < w.end) { room.used[i] += w.beds; if (!room.off) b.used[i] += w.beds; } });
            }
        }
        for (const b of blds) b.rooms.push(...[...b.extra.values()].sort((x, y) => natural(x.no, y.no)));
        const total = { cap: blds.reduce((n, b) => n + b.cap, 0), used: days.map((_, i) => blds.reduce((n, b) => n + b.used[i], 0)), unroomed: days.map((_, i) => blds.reduce((n, b) => n + b.unroomed[i], 0)) };
        return { days, blds, total, cut: days.length === MAX_DAYS && days.at(-1) < to };
    }

    const heat = (p) => `style="--p:${Math.min(100, p)}"`;
    function render(M) {
        const { days, blds, total } = M;
        const D = days.length;
        const sum = (a) => a.reduce((n, v) => n + v, 0);
        // 1. the whole
        const usedN = sum(total.used), capN = total.cap * D;
        const nightPct = total.used.map(u => pct(u, total.cap));
        const peakI = nightPct.indexOf(Math.max(...nightPct)), lowI = nightPct.indexOf(Math.min(...nightPct));
        const emptyAvg = Math.round((capN - usedN) / D);
        const unroomedAvg = Math.round(sum(total.unroomed) / D);
        const roomsAll = blds.flatMap(b => b.rooms.filter(r => !r.off));
        const emptyRoomsAvg = Math.round(sum(days.map((_, i) => roomsAll.filter(r => r.used[i] === 0).length)) / D);
        $('ocKpis').innerHTML = [
            ['Average occupancy', `${pct(usedN, capN)}%`, `${dayLbl(days[0])} → ${dayLbl(days.at(-1))} · ${D} night${D === 1 ? '' : 's'}`, 'big'],
            ['Beds', total.cap, `${roomsAll.length} rooms · ${blds.length} building${blds.length === 1 ? '' : 's'}`],
            ['Beds in use per night', Math.round(usedN / D), `average · ${emptyAvg} empty`],
            ['Busiest night', `${nightPct[peakI] || 0}%`, `${wkLbl(days[peakI])} ${dayLbl(days[peakI])} · ${total.used[peakI]} beds`],
            ['Quietest night', `${nightPct[lowI] || 0}%`, `${wkLbl(days[lowI])} ${dayLbl(days[lowI])} · ${total.used[lowI]} beds`],
            ['Bed-nights', usedN, `used of ${capN}`],
            ['Empty rooms per night', emptyRoomsAvg, 'average'],
            ...(unroomedAvg ? [['Guests without rooms', unroomedAvg, 'per night, average — not in the %', 'warn']] : []),
        ].map(([l, v, s, cls]) => `<div class="oc-kpi ${cls || ''}"><span>${esc(l)}</span><b>${esc(v)}</b><small>${esc(s)}</small></div>`).join('');

        // 2. aggregates per building
        $('ocBldSummary').innerHTML = blds.map(b => {
            const p = b.used.map(u => pct(u, b.cap)), avg = pct(sum(b.used), b.cap * D), pk = Math.max(...p), pkI = p.indexOf(pk);
            return `<div class="oc-bar"><b>${esc(b.name)}</b><span class="oc-meter"><i style="width:${Math.min(100, avg)}%"></i><em style="left:${Math.min(100, pk)}%" title="busiest night"></em></span>
                <span class="oc-bar-num"><b>${avg}%</b> avg · ${pk}% busiest (${dayLbl(days[pkI])}) · ${b.cap} beds · ${Math.round(sum(b.used) / D)} in use per night${sum(b.unroomed) ? ` · ${Math.round(sum(b.unroomed) / D)} without rooms` : ''}</span></div>`;
        }).join('') || '<p class="oc-note">No buildings with rooms — add them in Rooms &amp; Buildings.</p>';

        // 3. night by night
        const head = `<tr><th class="oc-sticky">Building</th>${days.map(d => `<th><span>${esc(wkLbl(d))}</span>${esc(dayLbl(d))}</th>`).join('')}<th class="oc-avg">Avg</th></tr>`;
        const row = (name, cap, used, unroomed, cls = '') => `<tr class="${cls}"><th class="oc-sticky">${esc(name)}<small>${cap} beds</small></th>${used.map((u, i) => {
            const p = pct(u, cap);
            return `<td ${heat(p)} title="${esc(name)} ${dayLbl(days[i])}: ${u} of ${cap} beds${unroomed[i] ? ` · ${unroomed[i]} guests without rooms` : ''}">${p}%${unroomed[i] ? '<sup>+</sup>' : ''}</td>`;
        }).join('')}<td class="oc-avg" ${heat(pct(sum(used), cap * D))}>${pct(sum(used), cap * D)}%</td></tr>`;
        $('ocBuildings').innerHTML = `<table class="oc-tbl"><thead>${head}</thead><tbody>
            ${blds.length > 1 ? row('All buildings', total.cap, total.used, total.unroomed, 'oc-total') : ''}
            ${blds.map(b => row(b.name, b.cap, b.used, b.unroomed)).join('')}</tbody></table>
            ${sum(total.unroomed) ? '<p class="oc-note"><sup>+</sup> some guests that night have a building but no rooms yet (hover for how many) — they are not in the %.</p>' : ''}`;

        // 4. rooms and beds
        $('ocRooms').innerHTML = blds.map((b, bi) => {
            const floors = [...new Set(b.rooms.map(r => r.floor))];
            const dots = (used, cap) => {
                if (cap > 12 || used > 16) return `<span class="oc-n">${used}/${cap}</span>`;
                let s = '';
                for (let k = 0; k < Math.max(cap, used); k++) s += `<i class="${k >= cap ? 'over' : k < used ? 'on' : ''}"></i>`;
                return `<span class="oc-dots">${s}</span>`;
            };
            return `<details class="oc-bld" ${bi === 0 || blds.length === 1 ? 'open' : ''}>
              <summary><b>${esc(b.name)}</b> · ${b.rooms.filter(r => !r.off).length} rooms · ${b.cap} beds · <b>${pct(sum(b.used), b.cap * D)}%</b> average</summary>
              <div class="oc-scroll"><table class="oc-tbl oc-rooms">
                <thead><tr><th class="oc-sticky">Room</th><th>Beds</th>${days.map(d => `<th><span>${esc(wkLbl(d))}</span>${esc(dayLbl(d))}</th>`).join('')}<th class="oc-avg">Avg</th></tr></thead>
                <tbody>${floors.map(f => `<tr class="oc-floor"><td colspan="${D + 3}">Floor ${esc(f)}</td></tr>` + b.rooms.filter(r => r.floor === f).map(r => {
                    const avg = r.cap ? pct(sum(r.used), r.cap * D) : 0;
                    return `<tr class="${r.off ? 'oc-off' : ''}"><th class="oc-sticky">${esc(r.no)}${r.off ? '<small>not in Rooms &amp; Buildings</small>' : ''}</th><td>${r.cap || '—'}</td>
                      ${r.used.map((u, i) => `<td class="${u > r.cap ? 'oc-over' : ''}" title="Room ${esc(r.no)} ${dayLbl(days[i])}: ${u} of ${r.cap} beds">${dots(u, r.cap)}</td>`).join('')}
                      <td class="oc-avg" ${heat(avg)}>${r.cap ? `${avg}%` : '—'}</td></tr>`;
                }).join('')).join('')}</tbody>
                <tfoot><tr><th class="oc-sticky">Total</th><td>${b.cap}</td>${b.used.map(u => `<td>${u}<small>${pct(u, b.cap)}%</small></td>`).join('')}<td class="oc-avg">${pct(sum(b.used), b.cap * D)}%</td></tr></tfoot>
              </table></div></details>`;
        }).join('');
        $('ocStatus').textContent = `${D} night${D === 1 ? '' : 's'} · counted at 22:00${M.cut ? ` · only the first ${MAX_DAYS} nights are shown` : ''}`;
    }

    async function run() {
        try { render(compute(await load())); }
        catch (e) { console.error(e); $('ocStatus').textContent = e.message || String(e); }
    }
    ['ocFrom', 'ocTo', 'ocBld'].forEach(id => $(id).addEventListener('change', run));
    ctx.root.querySelector('.oc-chips').addEventListener('click', (e) => {
        const b = e.target.closest('[data-range]');
        if (!b) return;
        const [a, z] = b.dataset.range.split(',').map(Number);
        $('ocFrom').value = shift(today, a); $('ocTo').value = shift(today, z);
        run();
    });
    $('ocPrint').addEventListener('click', () => { ctx.root.querySelectorAll('details.oc-bld').forEach(d => { d.open = true; }); window.print(); });
    await run();
}
