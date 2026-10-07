// Ported from pms/vacancy_forecast.html. Page logic is kept as it was; storage goes through ctx.db (app/core/db.js).
// Rooms and bed counts come from Rooms & Buildings when it has the building (else from slip history).

import { loadBuildings, buildingsOfSite, buildingNames, builderCapacity, activeRooms } from '../../core/rooms.js';
import { mountPlanner } from './planner.js';
import { mountAllocator } from './allocate.js';
import { mountAllocLog } from './alloclog.js';

export default async function mount(ctx) {
const { db } = ctx;
let BUILDINGS = [];

/* -------------------------- Data (this site) -------------------------- */
        const getAllRecords = () => db.all();

        /* ---------------------------- Helpers ---------------------------- */
        const $ = id => document.getElementById(id);
        let CANON_BUILDINGS = [];
        const toInt = v => Number.parseInt(String(v ?? '').trim(), 10) || 0;   // force integers only
        const clean = s => String(s ?? '').trim();
        const cleanRoom = x => String(x ?? '').trim();
        const normRoom = s => String(s || '').toUpperCase().replace(/\s+/g, '').replace(/[-_.]/g, '').replace(/^0+(?=\d)/, '');

        function parseDT(d, t) { if (!d) return null; const tt = t && t.length ? t : '00:00'; const v = new Date(`${d}T${tt}`); return isNaN(v) ? null : v; }
        function fmt(dt) { if (!dt) return ''; return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(dt); }
        function unique(arr) { return Array.from(new Set(arr)); }

        /* Integer capacity for a room, by majority vote across entries (no decimals) */
        function capacityFor(building, room) {
            const fromBuilder = builderCapacity(BUILDINGS, building, room);
            if (fromBuilder != null) return fromBuilder;
            const target = normRoom(room); const freq = new Map();
            for (const rec of DB_CACHE) {
                if (clean(rec.building) !== building) continue; const take = x => { const raw = clean(x.room_no); if (!raw || normRoom(raw) !== target) return; const c = toInt(x.capacity); if (c > 0) freq.set(c, (freq.get(c) || 0) + 1); };
                (rec.rooms?.gents || []).forEach(take); (rec.rooms?.ladies || []).forEach(take);
            }
            if (!freq.size) return null; let best = null, bn = -1; for (const [cap, cnt] of freq) { if (cnt > bn || (cnt === bn && cap > (best ?? 0))) { best = cap; bn = cnt; } } return best;
        }

        /* Sum assigned beds for a room at this exact instant (snapshot) */
        function assignedNow(building, room, when) {
            const target = normRoom(room); let sum = 0;
            for (const rec of DB_CACHE) {
                if (clean(rec.building) !== building) continue; const ci = parseDT(rec.checkin_date, rec.checkin_time); const co = parseDT(rec.checkout_date, rec.checkout_time); if (!ci || !co || (when < ci || when >= co)) continue; const take = x => { const raw = clean(x.room_no); if (!raw || normRoom(raw) !== target) return; sum += toInt(x.assigned); };
                (rec.rooms?.gents || []).forEach(take); (rec.rooms?.ladies || []).forEach(take);
            }
            return sum;
        }

        /* Build inventory list */
        function getInventoryRooms(mode, manualText, recs, building) {
            if (mode === 'manual') {
                const raw = manualText.split(/[\n,]+/).map(s => cleanRoom(s)).filter(Boolean);
                return unique(raw).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
            }
            if (mode === 'builder') {
                const names = building && building !== 'ALL' ? [building] : buildingsOfSite(BUILDINGS, ctx.siteId).map(b => b.name);
                const rooms = names.flatMap(n => activeRooms(BUILDINGS, n).map(r => cleanRoom(r.room_no)));
                if (rooms.length) return unique(rooms).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
                // the builder has no rooms for this building yet: fall back to what the slips show
            }
            const bag = []; for (const r of recs) { if (building && building !== 'ALL' && clean(r.building) !== building) continue; (r.rooms?.gents || []).forEach(x => bag.push(cleanRoom(x.room_no))); (r.rooms?.ladies || []).forEach(x => bag.push(cleanRoom(x.room_no))); }
            return unique(bag.filter(Boolean)).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
        }

        /* ---------------------------- UI wiring --------------------------- */
        let DB_CACHE = [];

        function populateBuildingFilter() {
            const sel = $('building'); const present = unique(DB_CACHE.map(r => clean(r.building)).filter(Boolean)); const merged = unique(['ALL', ...CANON_BUILDINGS, ...present]).filter(Boolean);
            sel.innerHTML = ''; merged.forEach(v => { const o = document.createElement('option'); o.value = v; o.textContent = (v === 'ALL' ? 'ALL BUILDINGS' : v); sel.appendChild(o); }); sel.value = 'ALL';
        }

        async function refreshDB() { BUILDINGS = await ctx.guard(loadBuildings()); CANON_BUILDINGS = buildingNames(BUILDINGS, ctx.siteId); DB_CACHE = await getAllRecords(); $('status').textContent = `${DB_CACHE.length} slip(s) loaded from DB.`; populateBuildingFilter(); }
        function currentWhen() { return parseDT($('when_date').value, $('when_time').value); }

        function runForecast() {
            const when = currentWhen(); if (!when) { alert('Choose a valid date and time.'); return; }
            const building = $('building').value || 'ALL';
            const mode = $('inventory_mode').value; const manualText = $('inventory_text').value || '';

            const inventory = getInventoryRooms(mode, manualText, DB_CACHE, building);

            // Active slips at snapshot
            const active = DB_CACHE.filter(r => { if (building !== 'ALL' && clean(r.building) !== building) return false; const ci = parseDT(r.checkin_date, r.checkin_time); const co = parseDT(r.checkout_date, r.checkout_time); return ci && co && when >= ci && when < co; });

            // Occupancy map: room -> list of active entries
            const occ = new Map();
            const pushOcc = (room, entry) => { const key = cleanRoom(room); if (!key) return; if (!occ.has(key)) occ.set(key, []); occ.get(key).push(entry); };
            for (const r of active) {
                const base = { tour: clean(r.tour_name), leader: clean(r.group_leader), sh: r.sh_no ?? '', bld: clean(r.building), win: `${fmt(parseDT(r.checkin_date, r.checkin_time))} → ${fmt(parseDT(r.checkout_date, r.checkout_time))}` };
                (r.rooms?.gents || []).forEach(x => pushOcc(x.room_no, { ...base, gender: 'Gents', cap: toInt(x.capacity), asg: toInt(x.assigned) }));
                (r.rooms?.ladies || []).forEach(x => pushOcc(x.room_no, { ...base, gender: 'Ladies', cap: toInt(x.capacity), asg: toInt(x.assigned) }));
            }

            // Render Occupied
            const tbodyOcc = $('tblOcc').querySelector('tbody'); tbodyOcc.innerHTML = '';
            const occRooms = Array.from(occ.keys()).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
            let occCount = 0, occCapEff = 0;
            for (const room of occRooms) {
                const entries = occ.get(room);
                for (const e of entries) {
                    const eff = e.asg > 0 ? e.asg : e.cap; const tr = document.createElement('tr'); tr.innerHTML = `
          <td class="nowrap">${room}</td>
          <td>${e.tour}</td>
          <td>${e.leader}</td>
          <td>${e.gender}</td>
          <td class="right">${Number.isInteger(eff) ? eff : ''}</td>
          <td>${e.win}</td>
          <td>${e.bld}</td>
          <td>${e.sh}</td>`; tbodyOcc.appendChild(tr); if (Number.isInteger(eff)) occCapEff += eff;
                }
                occCount += 1;
            }

            // Free rooms
            const occSet = new Set(occRooms);
            const freeRooms = inventory.filter(r => !occSet.has(r));

            // Render Free
            const tbodyFree = $('tblFree').querySelector('tbody'); tbodyFree.innerHTML = '';
            for (const room of freeRooms) {
                let cap = null, note = ''; if (building !== 'ALL') { cap = capacityFor(building, room); note = cap == null ? 'capacity unknown' : ''; } else { note = 'building=ALL (cap not shown)'; }
                const tr = document.createElement('tr'); tr.innerHTML = `
          <td class="nowrap">${room}</td>
          <td class="right">${cap == null ? '' : cap}</td>
          <td class="muted">${note}</td>`; tbodyFree.appendChild(tr);
            }

            // Deviations table (SNAPSHOT ONLY) — only for a specific building
            const tbodyUnder = $('tblUnder').querySelector('tbody'); tbodyUnder.innerHTML = '';
            let underCount = 0;
            if (building !== 'ALL') {
                for (const room of occRooms) {
                    const cap = capacityFor(building, room); if (cap == null) continue; const asg = assignedNow(building, room, when); if (asg === cap) continue; const delta = asg - cap; const tr = document.createElement('tr'); tr.innerHTML = `
            <td>${building}</td>
            <td class="nowrap">${room}</td>
            <td class="right">${asg}</td>
            <td class="right">${cap}</td>
            <td class="right ${delta < 0 ? 'delta-neg' : 'delta-pos'}">${delta > 0 ? ('+' + delta) : delta}</td>
            <td class="muted">${delta < 0 ? 'under-assigned' : 'over-assigned'}</td>`; tbodyUnder.appendChild(tr); if (delta < 0) underCount++;
                }
            }

            // Known free capacity (integers only)
            let freeCapTotal = 0;
            if (building !== 'ALL') {
                // 1) capacity of fully vacant rooms
                for (const room of freeRooms) { const cap = capacityFor(building, room); if (Number.isInteger(cap)) freeCapTotal += cap; }
                // 2) leftover in occupied-but-not-full rooms
                for (const room of occRooms) { const cap = capacityFor(building, room) || 0; const asg = assignedNow(building, room, when) || 0; if (cap > asg) freeCapTotal += (cap - asg); }
            }

            // Headcount now
            const sums = active.reduce((acc, r) => { acc.g += toInt(r.gents); acc.l += toInt(r.ladies); acc.c += toInt(r.children || r.child); acc.i += toInt(r.infants || r.infant); return acc; }, { g: 0, l: 0, c: 0, i: 0 });
            const headTotal = sums.g + sums.l + sums.c + sums.i;

            // Summary pills
            $('sum_total').textContent = inventory.length;
            $('sum_occ').textContent = occCount;
            $('sum_free').textContent = freeRooms.length;
            $('sum_occ_cap').textContent = occCapEff;
            $('sum_free_cap').textContent = freeCapTotal;
            $('sum_under').textContent = underCount;
            $('sum_head').textContent = headTotal;
            $('sum_head_break').textContent = `(G ${sums.g} / L ${sums.l} / C ${sums.c} / I ${sums.i})`;
            $('status').textContent = `Snapshot: ${fmt(when)} • ${building === 'ALL' ? 'All buildings' : ('Building: ' + building)} • Active slips: ${active.length}`;
        }

        /* ------------------------------ Boot ------------------------------- */
        (function init() {
            const now = new Date(); const pad = n => String(n).padStart(2, '0');
            $('when_date').value = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
            $('when_time').value = `${pad(now.getHours())}:${pad(now.getMinutes())}`;

            $('inventory_mode').addEventListener('change', () => { const on = $('inventory_mode').value === 'manual'; $('inventory_text').disabled = !on; $('inventory_text').style.opacity = on ? '1' : '.6'; });
            $('inventory_text').disabled = true;

            $('btnRefresh').addEventListener('click', refreshDB);
            $('btnRun').addEventListener('click', runForecast);
            $('btnPrint').addEventListener('click', () => window.print());

            const planner = mountPlanner({ ctx, host: $('planner') });
            mountAllocator({ ctx, host: $('allocator'), planner });
            mountAllocLog({ ctx, host: $('alloclog') });
            refreshDB().then(runForecast).catch(err => { console.error(err); $('status').textContent = 'Could not read local DB. Open the slip page first in this browser and save at least one slip.'; });
        })();

}
