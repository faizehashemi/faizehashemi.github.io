// Ported from pms/accommodation_slip.html (its five scripts merged into one module).
// Behaviour is unchanged; storage goes through ctx.db (the cloud).

import { UserError, sync } from '../../core/cloud.js';
import { loadBuildings, buildingNames, builderCapacity } from '../../core/rooms.js';
import { baseSh } from '../../core/ums.js';
import { openRoomPicker } from './room-picker.js';
import { getPrefs } from '../../core/prefs.js';
import { loadSettings, DEFAULTS, shPattern } from '../../core/settings.js';
import { rowsOf } from '../../core/stay.js';

// SH numbers: 44030, or with a prefix from Setup → SH prefixes (S44030 a group's second check-in at this site, E…, ES…)
let SH_PREFIXES = DEFAULTS.sh_prefixes;
let SH_RE = shPattern(SH_PREFIXES);
const shValue = (v) => { const s = String(v ?? '').trim().toUpperCase(); return s === '' ? '' : /^\d+$/.test(s) ? Number(s) : s; };

import { showSlipReport } from './checkmodal.js';

export default async function mount(ctx) {
    const { db, site, params } = ctx;
    let HOLD_DAYS = DEFAULTS.delay_hold_days; // Setup → Delayed departures: an unknown date holds the beds this long
    try {
        const st = (await ctx.guard(loadSettings())).settings;
        SH_PREFIXES = st.sh_prefixes || SH_PREFIXES; SH_RE = shPattern(SH_PREFIXES);
        HOLD_DAYS = Number(st.delay_hold_days) || HOLD_DAYS;
    } catch { }

    /* ------------------------------ Data ------------------------------ */
    const addRecord = (data) => db.add(data);
    const updateRecord = (id, patch) => db.update(id, patch);
    const getAllRecords = () => db.all();
    const getLatestBySh = (sh) => db.latestBySh(sh);

    /* ------------------------------ Helpers ----------------------------- */
    function $(id) { return document.getElementById(id); }
    let CURRENT_ID = null;
    let DB_CACHE = []; // for capacity + availability lookup

    function parseDT(d, t) { if (!d) return null; const tt = t && t.length ? t : '00:00'; const v = new Date(`${d}T${tt}`); return isNaN(v) ? null : v; }
    function fmt(dt) { if (!dt) return ''; return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(dt); }
    function cleanRoom(x) { return String(x ?? '').trim(); }

    // A loaded slip is changed with Edit; Save (a new slip) is locked so it can't be duplicated by accident.
    function setCurrent(id) {
        CURRENT_ID = id ?? null;
        const loaded = CURRENT_ID != null;
        $('btnSave').disabled = loaded || !!db.readonly;
        $('btnSave').title = loaded ? 'This slip is already saved — use Edit to change it (New Slip to start another)' : 'Save as a new slip';
        $('btnEdit').disabled = !loaded || !!db.readonly;
        $('btnEdit').classList.toggle('btn-hot', loaded);
        $('btnUnlockSave').hidden = !loaded || !!db.readonly;
        $('btnSave').classList.remove('btn-warn');
    }

    async function refreshDBCache() {
        DB_CACHE = await getAllRecords();
    }

    // Buildings from Rooms & Buildings (plus the site config); capacities prefer the builder too
    let BUILDINGS = await ctx.guard(loadBuildings());
    const addBuildingOption = (b) => {
        if ([...$('building').options].some(o => o.value === b)) return;
        const o = document.createElement('option');
        o.textContent = b;
        $('building').appendChild(o);
    };
    buildingNames(BUILDINGS, ctx.siteId).forEach(addBuildingOption);

    function addRow(group, data = { room_no: '', capacity: '', assigned: '' }) {
        const tbody = $(group + '-tbody');
        const tr = document.createElement('tr');

        // Room
        const tdRoom = document.createElement('td');
        const inpRoom = document.createElement('input');
        inpRoom.type = 'text';
        inpRoom.placeholder = '';
        inpRoom.value = data.room_no || '';
        tdRoom.appendChild(inpRoom);
        // the group leader's room (set by Pick rooms…), kept on the row as gl: true
        if (data.gl) {
            tr.dataset.gl = '1';
            const tag = document.createElement('span');
            tag.className = 'gl-badge';
            tag.textContent = 'GL';
            tag.title = "Group leader's room";
            tdRoom.appendChild(tag);
        }

        // Capacity (reference/nominal)
        const tdCap = document.createElement('td');
        const inpCap = document.createElement('input');
        inpCap.type = 'number';
        inpCap.min = '0';
        inpCap.step = '1';
        inpCap.inputMode = 'numeric';
        inpCap.value = (data.capacity ?? '') === '' ? '' : String(data.capacity);
        tdCap.appendChild(inpCap);

        // Assigned (mirrors capacity until the user edits it)
        const tdAsg = document.createElement('td');
        const inpAsg = document.createElement('input');
        inpAsg.type = 'number';
        inpAsg.min = '0';
        inpAsg.step = '1';
        inpAsg.inputMode = 'numeric';
        inpAsg.placeholder = 'assigned';
        tdAsg.appendChild(inpAsg);

        bindAssignedToCapacity(inpCap, inpAsg, data.assigned);

        function bindAssignedToCapacity(cap, asg, initialAssigned) {
            // an explicit assigned value is respected and stops the auto-sync
            const hasAssigned = initialAssigned != null && initialAssigned !== '';
            let dirty = hasAssigned;
            asg.value = hasAssigned ? String(initialAssigned) : String(cap.value ?? '');
            const sync = () => { if (!dirty) asg.value = cap.value; };
            cap.addEventListener('input', sync);
            cap.addEventListener('change', sync);
            asg.addEventListener('input', () => { dirty = true; });
            // catch programmatic cap.value = '...' (no input event fired)
            patchValueSetter(cap, sync);
        }

        // fire `input` whenever .value is set programmatically on this element
        function patchValueSetter(input, onSet) {
            if (input.__patchedValueSetter) return;
            input.__patchedValueSetter = true;
            const proto = Object.getPrototypeOf(input);
            const desc = Object.getOwnPropertyDescriptor(proto, 'value')
                || Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value');
            const _get = desc.get;
            const _set = desc.set;
            Object.defineProperty(input, 'value', {
                configurable: true,
                enumerable: desc.enumerable,
                get() { return _get.call(this); },
                set(v) {
                    _set.call(this, v);
                    try { onSet && onSet(); } catch (_) { }
                    this.dispatchEvent(new Event('input', { bubbles: true }));
                }
            });
        }

        // Leaves (delayed departure): this row's own check-out, status, and split
        const tdOut = document.createElement('td');
        tdOut.className = 'out-cell';
        tdOut.innerHTML = `<input type="date" class="out-date" aria-label="Leaves on"><input type="time" class="out-time" aria-label="Leaves at">
            <select class="out-status" aria-label="Status"><option value="confirmed">confirmed</option><option value="tentative">tentative</option><option value="unknown">unknown</option></select>
            <button type="button" class="row-btn out-split" title="Split this row: some of its beds leave at a different time">✂</button>`;
        tdOut.querySelector('.out-date').value = data.out?.date || '';
        tdOut.querySelector('.out-time').value = data.out?.time || '';
        tdOut.querySelector('.out-status').value = data.out_status || 'confirmed';
        tdOut.querySelector('.out-status').addEventListener('change', (e) => {
            if (e.target.value === 'unknown') { const h = holdUntil(); tdOut.querySelector('.out-date').value = h.date; tdOut.querySelector('.out-time').value = h.time; }
        });
        tdOut.querySelector('.out-split').addEventListener('click', () => splitRow(group, tr));

        // Delete
        const tdDel = document.createElement('td');
        const btnDel = document.createElement('button');
        btnDel.className = 'row-btn';
        btnDel.type = 'button';
        btnDel.textContent = 'X';
        btnDel.title = 'Delete row';
        btnDel.onclick = () => { tr.remove(); showAllocSum(); };
        tdDel.appendChild(btnDel);

        tr.append(tdRoom, tdCap, tdAsg, tdOut, tdDel);
        tbody.appendChild(tr);
    }

    function collectRows(group) {
        const rows = [];
        document.querySelectorAll(`#${group}-tbody tr`).forEach(tr => {
            const [roomNoEl, capEl, asgEl] = tr.querySelectorAll('input');
            const room_no = (roomNoEl?.value || '').trim();
            const capRaw = (capEl?.value || '').trim();
            const capacity = /^\d+$/.test(capRaw) ? Number(capRaw) : '';
            const asgRaw = (asgEl?.value || '').trim();
            const assigned = /^\d+$/.test(asgRaw) ? Number(asgRaw) : '';
            if (room_no !== '' || capRaw !== '' || asgRaw !== '') {
                const row = { room_no, capacity, assigned, ...(tr.dataset.gl ? { gl: true } : {}) };
                if (delayOn()) { // every row of a delayed slip carries its own check-out (blank = the slip's)
                    row.out = { date: tr.querySelector('.out-date')?.value || $('checkout_date').value || '', time: tr.querySelector('.out-time')?.value || $('checkout_time').value || '' };
                    row.out_status = tr.querySelector('.out-status')?.value || 'confirmed';
                }
                rows.push(row);
            }
        });
        return rows;
    }

    function setRows(group, arr) {
        const tbody = $(group + '-tbody');
        tbody.innerHTML = '';
        if (!arr || !arr.length) addRow(group); else arr.forEach(r => addRow(group, r));
        showAllocSum();
    }

    // Beside Pick rooms…: beds on the room tables vs the counts — Gents, and Ladies + Children (infants get
    // no bed). The group leader is inside the Gents or Ladies count, on the side of their room (GL).
    function showAllocSum() {
        const el = $('allocSum');
        if (!el) return;
        const beds = (group) => collectRows(group).reduce((n, r) => n + (r.assigned !== '' ? r.assigned : Number(r.capacity) || 0), 0);
        const num = (id) => Number($(id).value) || 0;
        const glSide = collectRows('gents').some(r => r.gl) ? 'Gents' : collectRows('ladies').some(r => r.gl) ? 'Ladies' : '';
        const g = beds('gents'), l = beds('ladies'), wantG = num('gents'), wantL = num('ladies') + num('children');
        if (!g && !l && !wantG && !wantL) { el.innerHTML = ''; return; }
        const part = (label, got, want, note) => `<span class="${want && got === want ? 'ok' : ''}">${label} <b>${got}</b>${want ? ` / ${want}` : ''}${note ? ` <small>${note}</small>` : ''}</span>`;
        el.innerHTML = 'Assigned: ' + part('Gents', g, wantG, glSide === 'Gents' ? 'incl. GL' : '')
            + part('Ladies', l, wantL, [num('children') ? `${num('ladies')} + ${num('children')} children` : '', glSide === 'Ladies' ? 'incl. GL' : ''].filter(Boolean).join(' · '));
    }
    for (const id of ['gents-tbody', 'ladies-tbody']) $(id).addEventListener('input', showAllocSum);
    for (const id of ['gents', 'ladies', 'children']) $(id).addEventListener('input', showAllocSum);

    /* ------------------------- Delayed departure ------------------------- */
    let DELAY_ORIG = null; // the booked check-out, kept while delayed
    const delayOn = () => !!$('delayOn')?.checked;
    const pad2 = (n) => String(n).padStart(2, '0');
    function holdUntil() { // today + the Setup hold, at the slip's check-out time
        const d = new Date(); d.setDate(d.getDate() + HOLD_DAYS);
        return { date: `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`, time: $('checkout_time').value || '10:00' };
    }
    function showDelay() {
        const on = delayOn();
        $('delayCtl').hidden = !on;
        document.querySelector('.subtables')?.classList.toggle('delayed', on);
        $('delayBox').classList.toggle('on', on);
        $('delayInfo').textContent = on
            ? `Booked check-out ${DELAY_ORIG ? `${DELAY_ORIG.date} ${DELAY_ORIG.time}` : '—'} · set each room's own check-out below (✂ splits a room's beds). Unknown holds the beds ${HOLD_DAYS} days.`
            : 'Tick when the group cannot leave on its booked date — each room row then gets its own check-out.';
    }
    function fillOuts(date, time, status, onlyBlank) {
        document.querySelectorAll('#gents-tbody tr, #ladies-tbody tr').forEach(tr => {
            const d = tr.querySelector('.out-date'), t2 = tr.querySelector('.out-time'), s = tr.querySelector('.out-status');
            if (!d || (onlyBlank && d.value)) return;
            if (date) d.value = date;
            if (time) t2.value = time;
            if (status) s.value = status;
        });
    }
    $('delayOn').addEventListener('change', () => {
        if (delayOn()) {
            DELAY_ORIG = DELAY_ORIG || { date: $('checkout_date').value, time: $('checkout_time').value };
            fillOuts($('checkout_date').value, $('checkout_time').value, 'tentative', true);
            $('delayStatus').value = $('delayStatus').value || 'tentative';
        } else if (!confirm('Remove the delayed departure? Every room goes back to one check-out for the whole slip (the check-out above).')) {
            $('delayOn').checked = true; return;
        }
        showDelay();
    });
    $('delayApplyAll').addEventListener('click', () => {
        let date = $('delayAllDate').value, time = $('delayAllTime').value;
        const status = $('delayAllStatus').value;
        if (status === 'unknown' && !date) ({ date, time } = holdUntil());
        if (!date) { alert('Choose the date for all rows (or status "unknown" to hold them).'); return; }
        fillOuts(date, time || $('checkout_time').value, status, false);
    });
    // ✂ split: n of this row's beds leave at another time — the row becomes two rows of the same room
    function splitRow(group, tr) {
        const [roomEl, capEl, asgEl] = tr.querySelectorAll('input');
        const beds = Number(asgEl.value) || Number(capEl.value) || 0;
        if (beds < 2) { alert('A row needs at least 2 beds to split.'); return; }
        const n = Number(prompt(`Room ${roomEl.value}: ${beds} beds. How many of them leave at a DIFFERENT time (they get a new row)?`, '1'));
        if (!Number.isInteger(n) || n < 1 || n >= beds) return;
        asgEl.value = String(beds - n);
        asgEl.dispatchEvent(new Event('input', { bubbles: true }));
        addRow(group, { room_no: roomEl.value, capacity: capEl.value, assigned: n,
            out: { date: tr.querySelector('.out-date').value, time: tr.querySelector('.out-time').value }, out_status: tr.querySelector('.out-status').value });
        tr.after($(group + '-tbody').lastElementChild);
        showAllocSum();
    }

    function getFormData() {
        const rooms = { gents: collectRows('gents'), ladies: collectRows('ladies') };
        let checkout_date = $('checkout_date').value || '', checkout_time = $('checkout_time').value || '';
        let delayed = null;
        if (delayOn()) {
            // the slip's check-out = the last room to leave (pages that read one check-out stay right)
            const ends = [...rooms.gents, ...rooms.ladies].filter(r => r.out?.date).map(r => `${r.out.date}T${r.out.time || '00:00'}`).sort();
            if (ends.length) [checkout_date, checkout_time] = ends.at(-1).split('T');
            delayed = { on: true, status: $('delayStatus').value, note: $('delayNote').value.trim(), original_checkout: DELAY_ORIG || { date: checkout_date, time: checkout_time }, updated_at: new Date().toISOString() };
        }
        return {
            tour_name: $('tour_name').value.trim(),
            group_leader: $('group_leader').value.trim(),
            checkin_date: $('checkin_date').value || '',
            checkin_time: $('checkin_time').value || '',
            checkout_date, checkout_time,
            building: $('building').value || '',
            sh_no: shValue($('sh_no').value),
            total: $('total').value === '' ? '' : Number($('total').value),
            gents: $('gents').value === '' ? '' : Number($('gents').value),
            ladies: $('ladies').value === '' ? '' : Number($('ladies').value),
            infants: $('infants').value === '' ? '' : Number($('infants').value),
            children: $('children').value === '' ? '' : Number($('children').value),
            rooms,
            delayed,
            createdAt: new Date().toISOString()
        };
    }

    function setFormData(data) {
        $('tour_name').value = data.tour_name || '';
        $('group_leader').value = data.group_leader || '';
        $('checkin_date').value = data.checkin_date || '';
        $('checkin_time').value = data.checkin_time || '';
        $('checkout_date').value = data.checkout_date || '';
        $('checkout_time').value = data.checkout_time || '';
        if (data.building) addBuildingOption(data.building); // a slip for a building not (or no longer) in the list
        $('building').value = data.building || '';
        $('sh_no').value = data.sh_no ?? '';
        $('total').value = data.total ?? '';
        $('gents').value = data.gents ?? '';
        $('ladies').value = data.ladies ?? '';
        $('infants').value = data.infants ?? '';
        $('children').value = data.children ?? '';
        const d = data.delayed && data.delayed.on ? data.delayed : null;
        $('delayOn').checked = !!d;
        $('delayStatus').value = d?.status || 'tentative';
        $('delayNote').value = d?.note || '';
        DELAY_ORIG = d?.original_checkout || null;
        setRows('gents', data.rooms?.gents || []);
        setRows('ladies', data.rooms?.ladies || []);
        showDelay();
    }

    function clearForm() {
        setCurrent(null);
        setFormData({
            tour_name: '', group_leader: '', checkin_date: '', checkin_time: '',
            checkout_date: '', checkout_time: '', building: '', sh_no: '',
            total: '', gents: '', ladies: '', infants: '', children: '',
            rooms: { gents: [], ladies: [] }
        });
        // this browser's defaults for a new slip (Settings → Slip page)
        const p = getPrefs();
        if (p.slipDefaultBuilding) { addBuildingOption(p.slipDefaultBuilding); $('building').value = p.slipDefaultBuilding; }
        if (p.slipCheckinTime) $('checkin_time').value = p.slipCheckinTime;
        if (p.slipCheckoutTime) $('checkout_time').value = p.slipCheckoutTime;
    }

    /* ---------------- Capacity lookup (most recent per building|room) --------------- */
    function buildCapacityMap(buildingFilter) {
        const cap = new Map(); // key: building|room -> capacity
        const items = [...DB_CACHE].sort((a, b) => (a.createdAt > b.createdAt ? -1 : 1));
        for (const r of items) {
            const b = (r.building || '').trim();
            if (buildingFilter && b !== buildingFilter) continue;
            (r.rooms?.gents || []).forEach(x => {
                const key = `${b}|${cleanRoom(x.room_no)}`;
                const c = (x.capacity === '' || x.capacity == null) ? null : Number(x.capacity);
                if (!cap.has(key) && c != null) cap.set(key, c);
            });
            (r.rooms?.ladies || []).forEach(x => {
                const key = `${b}|${cleanRoom(x.room_no)}`;
                const c = (x.capacity === '' || x.capacity == null) ? null : Number(x.capacity);
                if (!cap.has(key) && c != null) cap.set(key, c);
            });
        }
        return cap;
    }

    function setUnassigned(input) {
        input.value = '';
        input.placeholder = 'unassigned';
    }

    /* Fill capacities for both tables based on entered rooms */
    async function fetchCapacities() {
        await refreshDBCache();
        const b = ($('building').value || '').trim();
        if (!b) { alert('Select a building first.'); return; }
        const capMap = buildCapacityMap(b);
        BUILDINGS = await ctx.guard(loadBuildings({ force: true })); // rooms edited on another desk count too

        let filled = 0, unknown = 0;
        ['gents', 'ladies'].forEach(group => {
            document.querySelectorAll(`#${group}-tbody tr`).forEach(tr => {
                tr.classList.remove('okfill');
                const [roomEl, capEl] = tr.querySelectorAll('input');
                const room = cleanRoom(roomEl.value);
                if (!room) return;
                const key = `${b}|${room}`;
                const fromBuilder = builderCapacity(BUILDINGS, b, room);
                if (fromBuilder != null || capMap.has(key)) {
                    capEl.value = fromBuilder != null ? fromBuilder : capMap.get(key);
                    capEl.placeholder = '';
                    tr.classList.add('okfill');
                    filled++;
                } else {
                    setUnassigned(capEl);
                    unknown++;
                }
            });
        });

        $('status').textContent = `Capacity fetch: filled ${filled} item(s); ${unknown} unassigned.`;
    }

    /* ---------------- Availability check ---------------- */
    function overlaps(aStart, aEnd, bStart, bEnd) {
        return aStart < bEnd && aEnd > bStart; // [start, end)
    }

    function highlightConflicts(confRooms) {
        ['gents', 'ladies'].forEach(group => {
            document.querySelectorAll(`#${group}-tbody tr`).forEach(tr => tr.classList.remove('conflict'));
        });
        if (!confRooms.size) return;
        ['gents', 'ladies'].forEach(group => {
            document.querySelectorAll(`#${group}-tbody tr`).forEach(tr => {
                const [roomEl] = tr.querySelectorAll('input');
                const room = cleanRoom(roomEl.value);
                if (confRooms.has(room)) tr.classList.add('conflict');
            });
        });
    }

    // Every room of this slip against the other slips in it: { pass, okRooms, issues, building, start, end }.
    // The result is shown in a window (checkmodal.js) — by "Check availability", and by Save / Edit when it fails.
    async function checkAvailability() {
        await refreshDBCache();

        const bld = ($('building').value || '').trim();
        const ci = parseDT($('checkin_date').value, $('checkin_time').value);
        const co = parseDT($('checkout_date').value, $('checkout_time').value);

        if (!bld || !ci || !co || co <= ci) return { pass: false, okRooms: [], issues: [{ kind: 'window' }], building: bld };
        const issues = [], okRooms = [];

        // This slip's rows: each row is a window (delayed departures give rows their own check-out)
        const own = [];
        const capLocalOf = new Map();
        for (const side of ['gents', 'ladies']) for (const r of collectRows(side)) {
            const room = cleanRoom(r.room_no);
            if (!room) continue;
            const beds = Number.isFinite(+r.assigned) ? +r.assigned : 0;
            const end = (r.out && parseDT(r.out.date, r.out.time)) || co;
            if (end <= ci) { issues.push({ kind: 'badtime', room }); continue; }
            own.push({ room, start: +ci, end: +end, beds });
            if (!capLocalOf.get(room) && Number.isFinite(+r.capacity) && +r.capacity > 0) capLocalOf.set(room, +r.capacity);
        }
        const uniqRooms = [...new Set(own.map(o => o.room))];
        const lastEnd = Math.max(+co, ...own.map(o => o.end));

        // Other slips' windows in the same rooms (their own per-row check-outs count too)
        const others = new Map(uniqRooms.map(r => [r, []]));
        for (const r of DB_CACHE) {
            if (CURRENT_ID && r.id === CURRENT_ID) continue; // ignore self
            if ((r.building || '').trim() !== bld) continue;
            for (const w of rowsOf(r)) {
                const room = cleanRoom(w.room_no);
                if (!others.has(room) || !w.start || !w.end || w.beds <= 0) continue;
                if (!(w.start < lastEnd && w.end > +ci)) continue;
                others.get(room).push({ start: w.start, end: w.end, beds: w.beds, sh: r.sh_no });
            }
        }

        // Capacity from the current row first, then Rooms & Buildings, then last-known from history
        function resolveCapacity(room) {
            const local = capLocalOf.get(room) || 0;
            if (local > 0) return local;
            const fromBuilder = builderCapacity(BUILDINGS, bld, room);
            if (fromBuilder > 0) return fromBuilder;
            for (let i = DB_CACHE.length - 1; i >= 0; i--) {
                const rec = DB_CACHE[i];
                if ((rec.building || '').trim() !== bld) continue;
                const arr = [...(rec.rooms?.gents || []), ...(rec.rooms?.ladies || [])];
                const hit = arr.find(z => cleanRoom(z.room_no) === room);
                const histCap = Number.isFinite(+hit?.capacity) ? +hit.capacity : 0;
                if (histCap > 0) return histCap;
            }
            return 0; // unknown
        }

        // Per room: the busiest moment while this group is in it — other groups there then + this group's beds then
        const blocked = new Set();
        for (const room of uniqRooms) {
            const cap = resolveCapacity(room);
            if (!cap) { blocked.add(room); issues.push({ kind: 'nocap', room }); continue; }
            const mine = own.filter(o => o.room === room), theirs = others.get(room);
            const times = new Set([...mine.map(o => o.start), ...theirs.map(e => e.start)]);
            let worst = { total: -1, existing: 0, want: 0, t: null, who: [] };
            for (const t of times) {
                const want = mine.filter(o => o.start <= t && t < o.end).reduce((s, o) => s + o.beds, 0);
                if (!want) continue;
                const here = theirs.filter(e => e.start <= t && t < e.end);
                const existing = here.reduce((s, e) => s + e.beds, 0);
                if (existing + want > worst.total) worst = { total: existing + want, existing, want, t, who: here };
            }
            if (worst.total < 0) continue;
            if (worst.total <= cap) {
                okRooms.push({ room, before: worst.existing, after: worst.total, cap });
            } else {
                blocked.add(room);
                issues.push({ kind: 'blocked', room, at: worst.t, cap, existing: worst.existing, want: worst.want, total: worst.total, who: worst.who });
            }
        }

        highlightConflicts(blocked);
        const pass = !issues.length;
        $('status').textContent = pass ? 'Availability OK.' : `${issues.length} room problem${issues.length === 1 ? '' : 's'} — see the window.`;
        return { pass, okRooms, issues, building: bld, start: +ci, end: lastEnd };
    }
    const timelineHref = (p) => ctx.href('timeline', p);
    const report = (r, extra) => showSlipReport({ ok: r.okRooms, issues: r.issues, building: r.building, start: r.start, end: r.end, ...extra }, timelineHref);
    const notSaved = (r, what) => report(r, { tone: 'bad', title: `Not ${what} — ${r.issues.length} problem${r.issues.length === 1 ? '' : 's'} to fix`,
        lead: 'Nothing was saved. Fix the points in bold, then press the button again.' });
    // a save the server refused: what it means and what to do
    function saveError(err, what) {
        const msg = err instanceof UserError ? err.message : `${what} failed: ${err?.message || err}`;
        const help = err?.status === 409 ? ['Another desk changed this slip a moment ago. Load it again (type its SH No. and fetch), check the changes, then save again.']
            : /offline|connection/i.test(msg) ? ['The PMS cannot reach the server. Check the internet connection, then save again — nothing was saved yet.']
            : err?.status === 403 ? ['This login may not change this site\'s slips. Ask an admin, or log in with a desk login of this site.']
            : ['Try again in a moment. If it keeps failing, note the SH No. and tell the admin.'];
        showSlipReport({ tone: 'bad', title: `${what} failed`, issues: [{ kind: 'text', text: msg, help }] }, timelineHref);
    }

    /* ========= Bulk Rooms: multi-separator + bold big beds count ========= */

    /* Split by: comma, slash, asterisk, dash, dot, any whitespace */
    function bulkParse(str) {
        if (!str) return [];
        const parts = str.split(/[,\s\/\*\-\.]+/).map(s => s.trim()).filter(Boolean);
        // de-dupe case-insensitively, preserve order
        const out = [];
        const seen = new Set();
        for (const r of parts) {
            const k = r.toLowerCase();
            if (!seen.has(k)) { seen.add(k); out.push(r); }
        }
        return out;
    }

    /* Replace rows for a group with provided room list */
    function bulkFillGroup(group, rooms) {
        const tbody = document.getElementById(group + '-tbody');
        if (!tbody) return;
        tbody.innerHTML = '';
        if (!rooms.length) { addRow(group); return; }
        rooms.forEach(r => addRow(group, { room_no: r, capacity: '' }));
    }

    /* Sum numeric capacities across both tables (gents + ladies) */
    function sumAssignedBeds() {
        const sumFor = (group) => {
            let s = 0;
            document.querySelectorAll(`#${group}-tbody tr`).forEach(tr => {
                const capEl = tr.querySelector('td:nth-child(2) input');
                const n = Number(capEl && capEl.value);
                if (Number.isFinite(n)) s += n;
            });
            return s;
        };
        return sumFor('gents') + sumFor('ladies');
    }

    /* Load lists → fetch capacities → show bold big beds count */
    async function bulkLoadRooms() {
        bulkFillGroup('gents', bulkParse(document.getElementById('gentsBulk').value));
        bulkFillGroup('ladies', bulkParse(document.getElementById('ladiesBulk').value));

        await fetchCapacities();

        const bedsAssigned = sumAssignedBeds();
        const rep = document.getElementById('bulkReport');
        if (rep) {
            rep.innerHTML = `Beds assigned: <span id="bedsAssignedVal">${bedsAssigned}</span>`;
            const val = document.getElementById('bedsAssignedVal');
            rep.style.fontWeight = '700';
            rep.style.fontSize = '22px';
            rep.style.color = '#654321';
            if (val) { val.style.fontWeight = '800'; val.style.fontSize = '26px'; }
        }
        $('status').textContent = `Bulk loaded; beds assigned = ${bedsAssigned}.`;
    }

    /* ---------------------------- Events --------------------------- */

    $('btnSave').addEventListener('click', async () => {
        try {
            if (CURRENT_ID && DB_CACHE.find(r => r.id === CURRENT_ID)?.ums &&
                !confirm('This slip comes from the UMS import.\n\nUse "Edit" to update it (rooms, building, times).\n"Save" creates a separate copy that will double-count.\n\nCreate a separate copy anyway?')) return;
            const data = getFormData();
            const r = await checkAvailability(); // guard before saving
            if (!r.pass) { notSaved(r, 'saved'); return; }
            const id = await addRecord(data);
            setCurrent(id);
            $('status').textContent = `Saved as #${id}`;
            report(r, { tone: 'ok', title: `Saved ✓ — SH ${data.sh_no || '—'} (#${id})`, lead: `${data.building || ''}${r.okRooms.length ? ` · ${r.okRooms.length} room${r.okRooms.length === 1 ? '' : 's'}` : ' · no rooms yet'} · ${fmt(new Date(r.start))} → ${fmt(new Date(r.end))}` });
        } catch (err) {
            $('status').textContent = err instanceof UserError ? err.message : 'Save failed. Check console.';
            console.error('Save error:', err);
            saveError(err, 'Save');
        }
    });

    $('btnEdit').addEventListener('click', async () => {
        try {
            if (!CURRENT_ID) { showSlipReport({ tone: 'warn', title: 'No slip loaded', issues: [{ kind: 'text', text: 'Edit changes a slip that is already saved.', help: ['Type its SH No. and fetch it (or open it from a list) first, then press Edit.', 'For a brand-new slip use Save instead.'] }] }, timelineHref); return; }
            const data = getFormData();
            const r = await checkAvailability(); // validate before edit too
            if (!r.pass) { notSaved(r, 'updated'); return; }
            delete data.createdAt; // keep original
            const id = await updateRecord(CURRENT_ID, data);
            $('status').textContent = `Updated #${id}`;
            report(r, { tone: 'ok', title: `Updated ✓ — SH ${data.sh_no || '—'} (#${id})`, lead: `${data.building || ''}${r.okRooms.length ? ` · ${r.okRooms.length} room${r.okRooms.length === 1 ? '' : 's'}` : ' · no rooms yet'} · ${fmt(new Date(r.start))} → ${fmt(new Date(r.end))}` });
        } catch (err) {
            $('status').textContent = err instanceof UserError ? err.message : 'Edit failed. See console.';
            console.error('Edit error:', err);
            saveError(err, 'Update');
        }
    });

    $('btnUnlockSave').addEventListener('click', () => {
        if (!confirm('Save creates a SECOND, separate slip (the loaded one stays). Rooms and pax would count twice.' + '\n\n' + 'Unlock Save for a copy?')) return;
        $('btnSave').disabled = false;
        $('btnSave').classList.add('btn-warn');
        $('btnUnlockSave').hidden = true;
    });

    $('btnNew').addEventListener('click', () => {
        clearForm();
        $('stayPick').hidden = true;
        $('status').textContent = 'New blank slip';
    });

    // A group can check in twice at this site (e.g. Makkah before and after Madina). The UMS import
    // numbers the second check-in S44030; typing either loads that stay, and the picker shows both.
    async function pickStayFor(sh) {
        const dmy = (d) => (d || '').split('-').reverse().join('/');
        const wanted = String(sh).trim().toUpperCase();
        const stays = (await getAllRecords())
            .filter(r => r.ums && baseSh(r.sh_no) === baseSh(wanted))
            .sort((a, b) => `${a.checkin_date}T${a.checkin_time}`.localeCompare(`${b.checkin_date}T${b.checkin_time}`));
        const pick = $('stayPick');
        pick.hidden = stays.length < 2;
        pick.innerHTML = stays.map(r => `<option value="${r.id}">${r.sh_no} · ${dmy(r.checkin_date)} → ${dmy(r.checkout_date)}${r.building ? ' · ' + r.building : ''}</option>`).join('');
        if (!stays.length) return getLatestBySh(shValue(wanted));
        const today = new Date().toISOString().slice(0, 10);
        const rec = stays.find(r => String(r.sh_no).toUpperCase() === wanted)
            || stays.find(r => (r.checkout_date || '') >= today) || stays[stays.length - 1];
        pick.value = String(rec.id);
        return rec;
    }

    async function fetchBySh() {
        const raw = $('sh_no').value.trim();
        if (!SH_RE.test(raw)) { alert(`Enter a valid SH No.: digits (e.g. 44030)${SH_PREFIXES.length ? `, optionally after ${SH_PREFIXES.join(', ')} (e.g. ${SH_PREFIXES[0]}44030)` : ''}.`); return; }
        const rec = await pickStayFor(raw);
        if (!rec) { $('status').textContent = 'No slip found for that SH.'; return; }
        setCurrent(rec.id);
        setFormData(rec);
        $('status').textContent = `Loaded latest slip for SH ${rec.sh_no} (#${rec.id})`;
    }
    $('btnFetchSh').addEventListener('click', fetchBySh);

    $('stayPick').addEventListener('change', async () => {
        const rec = (await getAllRecords()).find(r => r.id === Number($('stayPick').value));
        if (!rec) return;
        setCurrent(rec.id);
        setFormData(rec);
        $('status').textContent = `Loaded stay #${rec.id} for SH ${rec.sh_no}`;
    });

    $('sh_no').addEventListener('blur', async () => {
        if (!getPrefs().slipAutoLoadSh) return;
        // a default building alone does not count as "already filled in"
        const hasAny = ($('tour_name').value || $('group_leader').value || ($('building').value && $('building').value !== getPrefs().slipDefaultBuilding));
        if (hasAny) return;
        const raw = $('sh_no').value.trim();
        if (SH_RE.test(raw)) {
            const rec = await pickStayFor(raw);
            if (rec) {
                setCurrent(rec.id);
                setFormData(rec);
                $('status').textContent = `Auto-loaded latest slip for SH ${rec.sh_no} (#${rec.id})`;
            }
        }
    });

    $('btnFetchCap').addEventListener('click', fetchCapacities);
    $('btnCheckAvail').addEventListener('click', async () => {
        const r = await checkAvailability();
        if (r.pass) report(r, { tone: 'ok', title: 'Availability OK ✓', lead: r.okRooms.length ? 'Every room has room for this group for the whole stay.' : 'No rooms entered yet.' });
        else report(r, { tone: 'bad', title: `${r.issues.length} problem${r.issues.length === 1 ? '' : 's'} to fix`, lead: 'Fix the points in bold before saving.' });
    });
    $('btnPickRooms').addEventListener('click', async () => {
        const building = ($('building').value || '').trim();
        const ci = parseDT($('checkin_date').value, $('checkin_time').value);
        const co = parseDT($('checkout_date').value, $('checkout_time').value);
        if (!building) { alert('Choose the building first.'); return; }
        if (!ci || !co || co <= ci) { alert('Enter check-in and check-out (check-out after check-in) first.'); return; }
        // latest assignments from every desk, so no bed is handed out twice (offline: the local copy)
        try { await ctx.guard(sync({ force: true })); } catch (e) { if (!(e instanceof UserError)) throw e; }
        await refreshDBCache();
        BUILDINGS = await ctx.guard(loadBuildings({ force: true })); // rooms edited on another desk count too
        const history = buildCapacityMap(building);
        openRoomPicker({
            building, host: ctx.root, onlyFree: getPrefs().pickerOnlyFree,
            checkin: { date: $('checkin_date').value, time: $('checkin_time').value },
            checkout: { date: $('checkout_date').value, time: $('checkout_time').value },
            slips: DB_CACHE, buildings: BUILDINGS, excludeId: CURRENT_ID,
            historyCap: (room) => history.get(`${building}|${cleanRoom(room)}`) ?? null,
            current: { gents: collectRows('gents'), ladies: collectRows('ladies') },
            needs: { gents: $('gents').value, ladies: $('ladies').value, children: $('children').value, infants: $('infants').value },
            onApply: (gents, ladies) => { setRows('gents', gents); setRows('ladies', ladies); },
        });
    });
    document.querySelectorAll('[data-add-row]').forEach(b => b.addEventListener('click', () => addRow(b.dataset.addRow)));

    $('btnBulkLoad').addEventListener('click', bulkLoadRooms);
    ['gentsBulk', 'ladiesBulk'].forEach(id => {
        $(id).addEventListener('keydown', e => {
            if (e.key === 'Enter') { e.preventDefault(); bulkLoadRooms(); }
        });
    });

    /* ------------------------------ Boot ------------------------------- */
    clearForm();
    addRow('gents'); addRow('ladies');
    if (db.readonly) $('status').textContent = db.readonlyReason;
    await refreshDBCache();

    // Deep link from Check-ins: #/<site>/slip?sh_no=38480
    const shParam = params.get('sh_no');
    if (shParam) {
        $('sh_no').value = shParam;
        await fetchBySh();
    }
}
