// Ported from pms/building_legend_grid.html. Page logic is kept as it was; storage goes through ctx.db (app/core/db.js).
// The rooms come from Rooms & Buildings (active rooms, on the floor set there, with their bed counts); a room a
// slip uses at the chosen time but that is not active there still shows, marked, so no guest drops off the grid.
// Only a building the builder has no rooms for falls back to the rooms named on its slips.

import { loadBuildings, buildingsOfSite, findBuilding } from '../../core/rooms.js';

export default async function mount(ctx) {
const { db } = ctx;
let BUILDINGS = [];

/* ================= Data (this site) ================= */
        const getAllRecords = () => db.all();

        /* ================= Helpers ================= */
        const $ = id => document.getElementById(id);
        const pad = n => String(n).padStart(2, '0');
        function parseDT(d, t) { if (!d) return null; const tt = t && t.length ? t : '00:00'; const v = new Date(`${d}T${tt}`); return isNaN(v) ? null : v; }
        function fmtDT(dt) {
            try { return dt.toLocaleString([], { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' }) }
            catch (e) { return dt.toISOString().slice(5, 16).replace('T', ' ') }
        }
        const uniq = a => Array.from(new Set(a));
        const cleanRoom = x => String(x ?? '').trim();
        const normRoom = x => cleanRoom(x).replace(/\s+/g, '').toUpperCase();

        function roomsFromSlip(rec) {
            const g = (rec.rooms?.gents || []).map(x => normRoom(x.room_no ?? x));
            const l = (rec.rooms?.ladies || []).map(x => normRoom(x.room_no ?? x));
            return [...g, ...l].filter(Boolean);
        }

        /* floor/column from a room token like 1203A -> floor 12, col 03A */
        function parseRoomToken(room) {
            const r = normRoom(room);
            const m = r.match(/^(\d+)([A-Z]*)$/i);
            if (!m) return { floor: '?', col: r };
            const digits = m[1], suf = m[2] || '';
            if (digits.length <= 2) return { floor: '0', col: digits + suf };
            return { floor: digits.slice(0, -2), col: digits.slice(-2) + suf };
        }

        /* The building's rooms: Rooms & Buildings first, slips only where the builder knows nothing */
        function buildInventoryPerBuilding(records, building, when) {
            const b = (building || '').trim();
            const builder = (findBuilding(BUILDINGS, b)?.rooms || []);
            const rooms = new Map(); // norm → { floor, offList }
            for (const r of builder) {
                const k = normRoom(r.room_no);
                if (k && r.active !== false) rooms.set(k, { floor: String(r.floor || '').trim() || parseRoomToken(k).floor, offList: false });
            }
            const useBuilder = rooms.size > 0;
            records.forEach(r => {
                if ((r.building || '').trim() !== b) return;
                if (useBuilder) { // only rooms someone is in at the chosen time
                    const ci = parseDT(r.checkin_date, r.checkin_time), co = parseDT(r.checkout_date, r.checkout_time);
                    if (!ci || !co || !overlapsIn(when, ci, co)) return;
                }
                roomsFromSlip(r).forEach(k => {
                    if (rooms.has(k)) return;
                    const inactive = builder.find(x => normRoom(x.room_no) === k);
                    rooms.set(k, { floor: String(inactive?.floor || '').trim() || parseRoomToken(k).floor, offList: useBuilder });
                });
            });

            const floors = new Map(), cellToRoom = new Map(), offList = new Set();
            for (const [room, info] of rooms) {
                const { col } = parseRoomToken(room);
                const floor = info.floor;
                if (!floors.has(floor)) floors.set(floor, new Set());
                floors.get(floor).add(col);
                cellToRoom.set(`${floor}|${col}`, room); // map grid cell to normalized room
                if (info.offList) offList.add(room);
            }

            // lettered floors (G, M…) before the numbered ones, then in order
            const flist = [...floors.keys()].sort((a, b) => (/^\d/.test(a) - /^\d/.test(b)) || a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));
            const allCols = new Set(); flist.forEach(f => floors.get(f).forEach(c => allCols.add(c)));
            const clist = [...allCols].sort((a, b) => {
                const an = parseInt(a, 10), bn = parseInt(b, 10);
                if (!isNaN(an) && !isNaN(bn) && an !== bn) return an - bn;
                return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
            });
            return { flist, clist, cellToRoom, offList };
        }

        /* Occupancy logic */
        let CACHE = [];
        const overlapsIn = (when, ci, co) => when >= ci && when < co;

        function getActiveSlipsForRoom(when, building, roomNorm) {
            const out = [];
            for (const r of CACHE) {
                if ((r.building || '').trim() !== building) continue;
                const ci = parseDT(r.checkin_date, r.checkin_time);
                const co = parseDT(r.checkout_date, r.checkout_time);
                if (!ci || !co) continue;
                if (!overlapsIn(when, ci, co)) continue;
                if (roomsFromSlip(r).includes(roomNorm)) out.push(r);
            }
            return out;
        }

        function getNextSlip(when, building, roomNorm) {
            const out = [];
            for (const r of CACHE) {
                if ((r.building || '').trim() !== building) continue;
                const ci = parseDT(r.checkin_date, r.checkin_time);
                if (!ci || !(ci > when)) continue;
                if (roomsFromSlip(r).includes(roomNorm)) out.push(r);
            }
            if (!out.length) return null;
            out.sort((a, b) => parseDT(a.checkin_date, a.checkin_time) - parseDT(b.checkin_date, b.checkin_time));
            return out[0];
        }

        /* Build a capacity map per physical room (latest non-null wins) */
        function buildCapacityMap(building) {
            const cap = new Map();
            const b = (building || '').trim();
            const sorted = [...CACHE].sort((a, b) => (a.createdAt > b.createdAt ? -1 : 1));
            for (const r of sorted) {
                if ((r.building || '').trim() !== b) continue;
                for (const side of ['gents', 'ladies']) {
                    for (const it of (r.rooms?.[side] || [])) {
                        const rn = normRoom(it.room_no ?? it);
                        const c = (it.capacity === '' || it.capacity == null) ? null : Number(it.capacity);
                        if (!cap.has(rn) && c != null) cap.set(rn, c);
                    }
                }
            }
            for (const r of findBuilding(BUILDINGS, b)?.rooms || []) cap.set(normRoom(r.room_no), r.capacity); // builder wins
            return cap; // Map<roomNorm, capacity>
        }

        function assignedInSlipForRoom(rec, roomNorm) {
            let sum = 0;
            for (const side of ['gents', 'ladies']) {
                for (const it of (rec.rooms?.[side] || [])) {
                    const rn = normRoom(it.room_no ?? it);
                    if (rn !== roomNorm) continue;
                    const a = Number(it.assigned ?? it.pax ?? it.count ?? 0);
                    if (!Number.isNaN(a)) sum += a;
                }
            }
            return sum;
        }

        function aggregateRoomTotals(building, roomNorm, when, capMap) {
            const active = getActiveSlipsForRoom(when, building, roomNorm);
            let assigned = 0, shNos = [], coTimes = [];
            for (const rec of active) {
                assigned += assignedInSlipForRoom(rec, roomNorm);
                if (rec.sh_no != null) shNos.push(String(rec.sh_no));
                const co = parseDT(rec.checkout_date, rec.checkout_time);
                if (co) coTimes.push(co);
            }
            const capacity = capMap.get(roomNorm) ?? null;
            const earliestOut = coTimes.length ? new Date(Math.min(...coTimes.map(t => t.getTime()))) : null;
            return { assigned, capacity, earliestOut, shNos };
        }

        function roomInstanceCount(building, roomNorm) {
            let count = 0;
            for (const r of CACHE) {
                if ((r.building || '').trim() !== building) continue;
                if (roomsFromSlip(r).includes(roomNorm)) count++;
            }
            return count;
        }

        function activeInstanceCount(when, building, roomNorm) {
            let count = 0;
            for (const r of CACHE) {
                if ((r.building || '').trim() !== building) continue;
                const ci = parseDT(r.checkin_date, r.checkin_time);
                const co = parseDT(r.checkout_date, r.checkout_time);
                if (!ci || !co) continue;
                if (!overlapsIn(when, ci, co)) continue;
                if (roomsFromSlip(r).includes(roomNorm)) count++;
            }
            return count;
        }

        const summarizeSH = (list, max = 3) => {
            const u = [...new Set(list)];
            return u.length <= max ? u.join(', ') : u.slice(0, max).join(', ') + ` (+${u.length - max})`;
        };

        /* ================= UI: tabs & matrix ================= */
        function renderTabs(buildings) {
            const tabs = $('tabs'); tabs.innerHTML = '';
            buildings.forEach((b, i) => {
                const btn = document.createElement('button');
                btn.className = 'tab'; btn.textContent = b;
                btn.setAttribute('role', 'tab');
                btn.setAttribute('aria-selected', String(i === 0));
                btn.addEventListener('click', () => {
                    document.querySelectorAll('.tab').forEach(t => t.setAttribute('aria-selected', 'false'));
                    btn.setAttribute('aria-selected', 'true');
                    renderMatrix(b);
                });
                tabs.appendChild(btn);
            });
        }

        function renderMatrix(building) {
            const dateStr = $('asof_date').value, timeStr = $('asof_time').value;
            if (!dateStr || !timeStr) { alert('Choose date and time'); return; }
            const when = new Date(`${dateStr}T${timeStr}`); if (isNaN(when)) { alert('Invalid date/time'); return; }

            const mx = $('matrix'); mx.innerHTML = '';
            const { flist, clist, cellToRoom, offList } = buildInventoryPerBuilding(CACHE, building, when);
            if (!flist.length) { mx.textContent = 'No rooms found for this building.'; return; }

            mx.style.gridTemplateColumns = `repeat(${clist.length + 1}, max-content)`;

            const corner = document.createElement('div');
            corner.className = 'hcell corner'; corner.style.width = '84px'; corner.style.height = '44px';
            corner.textContent = building; mx.appendChild(corner);

            clist.forEach(col => {
                const h = document.createElement('div');
                h.className = 'hcell'; h.style.width = 'var(--cellW)'; h.style.height = '44px'; h.textContent = col;
                mx.appendChild(h);
            });

            const capMap = buildCapacityMap(building);

            flist.forEach(floor => {
                const rhead = document.createElement('div');
                rhead.className = 'rcell'; rhead.style.width = '84px'; rhead.style.height = 'var(--cellH)';
                rhead.textContent = `FLOOR ${floor}`; mx.appendChild(rhead);

                clist.forEach(col => {
                    const key = `${floor}|${col}`;
                    const roomNorm = cellToRoom.get(key) || null;

                    const cell = document.createElement('div');
                    cell.className = 'cell';
                    cell.style.width = 'var(--cellW)'; cell.style.height = 'var(--cellH)';

                    if (!roomNorm) {
                        cell.innerHTML = `<div class="cap">—</div><div class="meta">&nbsp;</div>`;
                    } else {
                        const active = getActiveSlipsForRoom(when, building, roomNorm);

                        if (active.length) {
                            const agg = aggregateRoomTotals(building, roomNorm, when, capMap);
                            const capVal = (agg.capacity != null && !Number.isNaN(agg.capacity)) ? agg.capacity : null;
                            const asgVal = Number.isFinite(agg.assigned) ? agg.assigned : 0;
                            const under = (capVal != null) && (asgVal < capVal);
                            const vacBeds = (capVal != null) ? Math.max(0, capVal - asgVal) : null;

                            const capTxt = (capVal != null) ? `${asgVal}/${capVal}` : `${asgVal}/—`;
                            const shText = agg.shNos.length ? summarizeSH(agg.shNos) : '—';
                            const outText = agg.earliestOut ? fmtDT(agg.earliestOut) : '—';

                            cell.classList.add('occ');
                            if (under) cell.classList.add('under');
                            if (offList.has(roomNorm)) { cell.classList.add('off-list'); cell.title = `Room ${roomNorm} is not an active room in Rooms & Buildings`; }

                            cell.innerHTML = `
                    <div class="cap">${capTxt}${under && vacBeds != null ? ' · Vac ' + vacBeds : ''}</div>
                    <div class="meta">SH ${shText} • Out ${outText}</div>
                  `;
                        } else {
                            const next = getNextSlip(when, building, roomNorm);
                            const ci = next ? parseDT(next.checkin_date, next.checkin_time) : null;
                            const nsh = next ? (next.sh_no ?? '') : '';

                            const totalInst = roomInstanceCount(building, roomNorm);
                            const activeInst = 0; // currently zero by branch
                            const vacInst = Math.max(0, totalInst - activeInst);
                            //const vacLabel = vacInst > 1 ? `Upcoming ${vacInst} pax` : 'Vacant';
                            const vacLabel = 'Vacant';
                            const capVal = capMap.get(roomNorm) ?? null;
                            const capTxt = (capVal != null) ? String(capVal) : '—';

                            cell.innerHTML = `
                    <div class="cap">${capTxt}</div>
                    <div class="meta">
                      ${next ? `${vacLabel} • Next ${fmtDT(ci)}${nsh ? ' • SH ' + nsh : ''}` : `${vacLabel}`}
                    </div>
                  `;
                        }
                    }
                    mx.appendChild(cell);
                });
            });

            $('status').textContent = `${building} • Floors ${flist.join(', ')} • ${clist.length} columns • ${CACHE.length} slip(s)${offList.size ? ` • ${offList.size} room(s) in use but not active in Rooms & Buildings (dashed)` : ''}`;
        }

        /* ================= Size controls ================= */
        function setVar(name, val) { document.documentElement.style.setProperty(name, val); }
        const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));

        function wireSizeControls() {
            const wR = $('wRange'), hR = $('hRange'), fR = $('fRange');
            const wM = $('wMinus'), wP = $('wPlus'), hM = $('hMinus'), hP = $('hPlus'), fM = $('fMinus'), fP = $('fPlus');
            const apply = () => { setVar('--cellW', wR.value + 'px'); setVar('--cellH', hR.value + 'px'); setVar('--fs', fR.value + 'px'); };
            [wR, hR, fR].forEach(el => el.addEventListener('input', apply));
            const step = (el, d, min, max) => { el.value = clamp(Number(el.value) + d, min, max); el.dispatchEvent(new Event('input')); };
            wM.onclick = () => step(wR, -8, 80, 240);
            wP.onclick = () => step(wR, +8, 80, 240);
            hM.onclick = () => step(hR, -8, 60, 200);
            hP.onclick = () => step(hR, +8, 60, 200);
            fM.onclick = () => step(fR, -1, 9, 20);
            fP.onclick = () => step(fR, +1, 9, 20);
            apply();
        }

        /* ================= Print only the grid ================= */
        function printOnlyById(id) {
            const el = document.getElementById(id);
            if (!el) return alert('Matrix not found.');
            el.classList.add('print-scope');
            const cleanup = () => { el.classList.remove('print-scope'); window.removeEventListener('afterprint', cleanup); };
            window.addEventListener('afterprint', cleanup);
            setTimeout(() => window.print(), 0);
        }

        /* ================= Boot ================= */
        (async function boot() {
            try {
                CACHE = await getAllRecords();
            } catch (e) {
                $('status').textContent = 'Could not open local DB (IndexedDB blocked?).';
                console.error(e); return;
            }

            const now = new Date();
            const y = now.getFullYear(), m = pad(now.getMonth() + 1), d = pad(now.getDate());
            const h = pad(now.getHours()), n = pad(now.getMinutes());
            if (!$('asof_date').value) $('asof_date').value = `${y}-${m}-${d}`;
            if (!$('asof_time').value) $('asof_time').value = `${h}:${n}`;

            BUILDINGS = await ctx.guard(loadBuildings({ force: true })); // latest Rooms & Buildings edits
            const buildings = uniq([
                ...buildingsOfSite(BUILDINGS, ctx.siteId).filter(b => b.rooms.length).map(b => b.name),
                ...CACHE.map(r => (r.building || '').trim()).filter(Boolean),
            ]);
            renderTabs(buildings);
            if (buildings.length) renderMatrix(buildings[0]);

            $('btnRecalc').addEventListener('click', () => {
                const sel = document.querySelector('.tab[aria-selected="true"]')?.textContent || buildings[0];
                renderMatrix(sel);
            });
            $('btnRefresh').addEventListener('click', async () => {
                CACHE = await getAllRecords();
                BUILDINGS = await ctx.guard(loadBuildings({ force: true }));
                const sel = document.querySelector('.tab[aria-selected="true"]')?.textContent || buildings[0];
                renderMatrix(sel);
            });
            $('asof_date').addEventListener('change', () => {
                const sel = document.querySelector('.tab[aria-selected="true"]')?.textContent || buildings[0];
                renderMatrix(sel);
            });
            $('asof_time').addEventListener('change', () => {
                const sel = document.querySelector('.tab[aria-selected="true"]')?.textContent || buildings[0];
                renderMatrix(sel);
            });
            wireSizeControls();

            $('btnPrintGrid').addEventListener('click', () => printOnlyById('matrix'));
        })();

}
