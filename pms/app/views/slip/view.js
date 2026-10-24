// Ported from pms/accommodation_slip.html (its five scripts merged into one module).
// Behaviour is unchanged; storage goes through ctx.db (the cloud).

import { UserError, sync, state } from '../../core/cloud.js';
import { recordSlipDenial } from '../../core/telemetry.js';
import { loadBuildings, buildingNames, builderCapacity, findBuilding, normRoom } from '../../core/rooms.js';
import { baseSh } from '../../core/ums.js';
import { openRoomPicker } from './room-picker.js';
import { getPrefs } from '../../core/prefs.js';
import { loadSettings, DEFAULTS, shPattern } from '../../core/settings.js';
import { rowsOf, normB } from '../../core/stay.js';
import { enhanceTimes, use24 } from '../../core/timefmt.js';

// SH numbers: 44030, or with a prefix from Setup → SH prefixes (S44030 a group's second check-in at this site, E…, ES…)
let SH_PREFIXES = DEFAULTS.sh_prefixes;
let SH_RE = shPattern(SH_PREFIXES);
const shValue = (v) => { const s = String(v ?? '').trim().toUpperCase(); return s === '' ? '' : /^\d+$/.test(s) ? Number(s) : s; };

import { showSlipReport } from './checkmodal.js';
import { mountSlipHistory } from './history.js';

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
    let HISTORY = null;    // the History panel (history.js), mounted at boot
    let DB_CACHE = []; // for capacity + availability lookup

    function parseDT(d, t) { if (!d) return null; const tt = t && t.length ? t : '00:00'; const v = new Date(`${d}T${tt}`); return isNaN(v) ? null : v; }
    function fmt(dt) { if (!dt) return ''; return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short', hour12: !use24() }).format(dt); }   // 12-hour unless Settings → 24-hour times
    function cleanRoom(x) { return String(x ?? '').trim(); }

    // A loaded slip is changed with Edit; Save (a new slip) is locked so it can't be duplicated by accident.
    function setCurrent(id) {
        CURRENT_ID = id ?? null;
        HISTORY?.load(CURRENT_ID);
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

    // the buildings an Exclusive room can be given: "same as the slip", then the site's buildings (and the row's own if it is not listed)
    function fillExclBuildings(sel, current) {
        const names = [...buildingNames(BUILDINGS, ctx.siteId)];
        if (current && !names.some(n => normB(n) === normB(current))) names.push(current);
        sel.innerHTML = `<option value="">Same as the slip</option>` + names.map(n => `<option>${n.replace(/[<>&"]/g, '')}</option>`).join('');
    }
    // an Exclusive row blocks the room's whole capacity, so the bed count must be known: take it from Rooms & Buildings
    // for the row's building (its own, else the slip's); the guests assigned (pax) are not touched
    function fillExclCapacity(tr) {
        const [roomEl, capEl] = tr.querySelectorAll('input');
        const room = cleanRoom(roomEl.value), b = (tr.querySelector('.excl-bld')?.value || '').trim() || ($('building').value || '').trim();
        if (!room || !b) return;
        const cap = builderCapacity(BUILDINGS, b, room);
        if (cap != null && cap > 0) { capEl.placeholder = ''; if (String(capEl.value) !== String(cap)) capEl.value = cap; }
    }

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

        // Exclusive: the room is kept for these guests alone (a couple, a single who wants privacy) — its WHOLE capacity is
        // blocked although fewer guests are assigned (Assigned stays the guests = pax; the blocked beds are not pax).
        // An Exclusive room may be in another building than the slip's: pick it here.
        const tdEx = document.createElement('td');
        tdEx.className = 'excl-cell';
        tdEx.innerHTML = `<label class="excl-on" title="Keep the whole room for these guests"><input type="checkbox" class="excl-chk" aria-label="Exclusive room"> <span>Excl.</span></label>
            <select class="excl-bld" aria-label="Building of this exclusive room" hidden></select>`;
        const exChk = tdEx.querySelector('.excl-chk'), exBld = tdEx.querySelector('.excl-bld');
        fillExclBuildings(exBld, data.building);
        exChk.checked = !!data.exclusive;
        exBld.hidden = !exChk.checked;
        if (data.exclusive && data.building) exBld.value = data.building;
        tr.classList.toggle('excl', exChk.checked);
        exChk.addEventListener('change', () => {
            exBld.hidden = !exChk.checked;
            if (!exChk.checked) exBld.value = '';
            tr.classList.toggle('excl', exChk.checked);
            if (exChk.checked) { fillExclCapacity(tr); inpAsg.focus(); inpAsg.select(); }
            showAllocSum();
        });
        exBld.addEventListener('change', () => fillExclCapacity(tr));

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

        tr.append(tdRoom, tdCap, tdAsg, tdEx, tdOut, tdDel);
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
                if (tr.querySelector('.excl-chk')?.checked) {            // Exclusive: the whole room is kept; maybe in another building
                    row.exclusive = true;
                    const b = (tr.querySelector('.excl-bld')?.value || '').trim();
                    if (b) row.building = b;
                }
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
            ...(tr.querySelector('.excl-chk')?.checked ? { exclusive: true, building: tr.querySelector('.excl-bld')?.value || '' } : {}),
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
            from_place: $('from_place').value || '', to_place: $('to_place').value || '',     // kept even while hidden in Settings
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

    // From / To: where the group or self comes from and goes to. The row is shown only when Settings → Slip page → From / To is on.
    const PLACES = ['Madina Airport', 'Jeddah Airport', 'Makkah', 'Medina', 'By car', 'By bus', 'By train'];
    for (const id of ['from_place', 'to_place']) $(id).insertAdjacentHTML('beforeend', PLACES.map(p => `<option>${p}</option>`).join(''));
    $('fromToRow').hidden = !getPrefs().slipFromTo;
    function setPlace(id, v) {
        const sel = $(id), val = String(v || '');
        if (val && ![...sel.options].some(o => o.value === val)) sel.insertAdjacentHTML('beforeend', `<option>${val.replace(/[<>&"]/g, '')}</option>`);   // an older / other value stays selectable
        sel.value = val;
    }

    // (side|room|building) of the rooms the loaded slip already has: the gents / ladies room rule is checked for new rooms only,
    // so an older slip with a room on the "wrong" side can still be edited until that room is changed
    let LOADED_ROOMS = new Set();
    const roomKey = (side, room, building) => `${side}|${normRoom(room)}|${normB(building)}`;
    const roomType = (building, room) => findBuilding(BUILDINGS, building)?.rooms?.find(r => normRoom(r.room_no) === normRoom(room))?.type || '';

    function setFormData(data) {
        LOADED_ROOMS = new Set(['gents', 'ladies'].flatMap(side => (data.rooms?.[side] || []).map(x => roomKey(side, x.room_no, x.building || data.building))));
        $('tour_name').value = data.tour_name || '';
        $('group_leader').value = data.group_leader || '';
        $('checkin_date').value = data.checkin_date || '';
        $('checkin_time').value = data.checkin_time || '';
        $('checkout_date').value = data.checkout_date || '';
        $('checkout_time').value = data.checkout_time || '';
        if (data.building) addBuildingOption(data.building); // a slip for a building not (or no longer) in the list
        $('building').value = data.building || '';
        $('sh_no').value = data.sh_no ?? '';
        setPlace('from_place', data.from_place); setPlace('to_place', data.to_place);
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
            for (const side of ['gents', 'ladies']) (r.rooms?.[side] || []).forEach(x => {
                const b = String(x.building || r.building || '').trim();                 // an Exclusive row can be in another building
                if (buildingFilter && b !== buildingFilter) return;
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
        const capMaps = new Map([[b, buildCapacityMap(b)]]);
        BUILDINGS = await ctx.guard(loadBuildings({ force: true })); // rooms edited on another desk count too

        let filled = 0, unknown = 0;
        ['gents', 'ladies'].forEach(group => {
            document.querySelectorAll(`#${group}-tbody tr`).forEach(tr => {
                tr.classList.remove('okfill');
                const [roomEl, capEl] = tr.querySelectorAll('input');
                const room = cleanRoom(roomEl.value);
                if (!room) return;
                const rb = (tr.querySelector('.excl-bld')?.value || '').trim() || b;      // an Exclusive room's own building
                if (!capMaps.has(rb)) capMaps.set(rb, buildCapacityMap(rb));
                const capMap = capMaps.get(rb);
                const key = `${rb}|${room}`;
                const fromBuilder = builderCapacity(BUILDINGS, rb, room);
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
        // the latest slips from every desk first — a check-out corrected on another desk a minute ago must count
        // (offline: this browser's copy; how old it was goes into the record of a refused save)
        let synced = true;
        try { await sync({ force: true }); } catch (e) { synced = false; if (!(e instanceof UserError)) console.warn('sync before check', e); }
        await refreshDBCache();
        const copy = { synced, last_sync: state.lastSync ? new Date(state.lastSync).toISOString() : null, slips: DB_CACHE.length, online: navigator.onLine };

        const bld = ($('building').value || '').trim();
        const ci = parseDT($('checkin_date').value, $('checkin_time').value);
        const co = parseDT($('checkout_date').value, $('checkout_time').value);

        if (!bld || !ci || !co || co <= ci) return { pass: false, okRooms: [], issues: [{ kind: 'window', missing: [!bld && 'building', !ci && 'check-in', !co && 'check-out', ci && co && co <= ci && 'check-out not after check-in'].filter(Boolean) }], building: bld, copy, own: [] };
        const issues = [], okRooms = [];

        // This slip's rows: each row is a window (delayed departures give rows their own check-out). A row is in the
        // slip's building unless it is an Exclusive row given its own; an Exclusive row keeps the whole room.
        const own = [];
        const capLocalOf = new Map();
        const keyOf = (building, room) => `${normB(building)}|${room}`;
        for (const side of ['gents', 'ladies']) for (const r of collectRows(side)) {
            const room = cleanRoom(r.room_no);
            if (!room) continue;
            const building = (r.building || '').trim() || bld;
            const beds = Number.isFinite(+r.assigned) ? +r.assigned : 0;
            const end = (r.out && parseDT(r.out.date, r.out.time)) || co;
            if (end <= ci) { issues.push({ kind: 'badtime', room, out: r.out }); continue; }
            own.push({ room, building, key: keyOf(building, room), side, start: +ci, end: +end, beds, excl: !!r.exclusive, cap_row: Number(r.capacity) || null });
            // a gents room never takes ladies and a ladies room never takes gents (Rooms & Buildings → type); family / any take both
            const typ = roomType(building, room);
            if ((typ === 'gents' || typ === 'ladies') && typ !== side && !LOADED_ROOMS.has(roomKey(side, room, building))) {
                issues.push({ kind: 'roomtype', room, side, type: typ, ...(normB(building) === normB(bld) ? {} : { building }) });
            }
            if (!capLocalOf.get(keyOf(building, room)) && Number.isFinite(+r.capacity) && +r.capacity > 0) capLocalOf.set(keyOf(building, room), +r.capacity);
        }
        const uniqKeys = [...new Set(own.map(o => o.key))];
        const lastEnd = Math.max(+co, ...own.map(o => o.end));

        // Other slips' windows in the same rooms (their own per-row check-outs count too; an Exclusive row keeps its whole room)
        const others = new Map(uniqKeys.map(k => [k, []]));
        for (const r of DB_CACHE) {
            if (CURRENT_ID && r.id === CURRENT_ID) continue; // ignore self
            for (const w of rowsOf(r)) {
                const key = keyOf(w.building, cleanRoom(w.room_no));
                if (!others.has(key) || !w.start || !w.end || w.block <= 0) continue;
                if (!(w.start < lastEnd && w.end > +ci)) continue;
                others.get(key).push({ start: w.start, end: w.end, beds: w.block, pax: w.beds, excl: w.exclusive, sh: r.sh_no, id: r.id, status: w.status, ums: !!r.ums });
            }
        }

        // Capacity from the current row first, then Rooms & Buildings, then last-known from history
        // (capSource keeps which one was used and what the others said — a row capacity that disagrees with
        // Rooms & Buildings is a common reason for a surprise "over its beds")
        const capSource = new Map();
        function resolveCapacity(building, room) {
            const key = keyOf(building, room);
            const local = capLocalOf.get(key) || 0;
            const fromBuilder = builderCapacity(BUILDINGS, building, room);
            const src = { row: local || null, builder: fromBuilder ?? null, used: null };
            capSource.set(key, src);
            if (local > 0) { src.used = 'row'; return local; }
            if (fromBuilder > 0) { src.used = 'builder'; return fromBuilder; }
            for (let i = DB_CACHE.length - 1; i >= 0; i--) {
                const rec = DB_CACHE[i];
                const arr = [...(rec.rooms?.gents || []), ...(rec.rooms?.ladies || [])].filter(z => normB(z.building || rec.building) === normB(building));
                const hit = arr.find(z => cleanRoom(z.room_no) === room);
                const histCap = Number.isFinite(+hit?.capacity) ? +hit.capacity : 0;
                if (histCap > 0) { src.used = 'history'; src.history = histCap; src.history_slip = rec.id; return histCap; }
            }
            return 0; // unknown
        }

        // Per room: the busiest moment while this group is in it — other groups there then + this group's beds then
        const blocked = new Set();
        for (const key of uniqKeys) {
            const mine = own.filter(o => o.key === key), theirs = others.get(key);
            const room = mine[0].room, building = mine[0].building;
            const cap = resolveCapacity(building, room);
            const where = normB(building) === normB(bld) ? {} : { building };      // an Exclusive row in another building says which
            if (!cap) { blocked.add(room); issues.push({ kind: 'nocap', room, ...where, excl: mine.some(o => o.excl), cap_source: capSource.get(key) }); continue; }
            const times = new Set([...mine.map(o => o.start), ...theirs.map(e => e.start)]);
            let worst = { total: -1, existing: 0, want: 0, t: null, who: [] };
            for (const t of times) {
                // beds this group keeps then: its guests' beds, or the whole room for an Exclusive row
                const want = mine.filter(o => o.start <= t && t < o.end).reduce((s, o) => s + (o.excl ? Math.max(cap, o.beds) : o.beds), 0);
                if (!want) continue;
                const here = theirs.filter(e => e.start <= t && t < e.end);
                const existing = here.reduce((s, e) => s + e.beds, 0);
                if (existing + want > worst.total) worst = { total: existing + want, existing, want, t, who: here };
            }
            if (worst.total < 0) continue;
            const excl = mine.some(o => o.excl);
            if (worst.total <= cap) {
                okRooms.push({ room, ...where, before: worst.existing, after: worst.total, cap, excl, cap_source: capSource.get(key) });
            } else {
                blocked.add(room);
                issues.push({ kind: 'blocked', room, ...where, excl, at: worst.t, cap, existing: worst.existing, want: worst.want, total: worst.total, who: worst.who,
                    cap_source: capSource.get(key), others: theirs });
            }
        }

        highlightConflicts(blocked);
        const pass = !issues.length;
        $('status').textContent = pass ? 'Availability OK.' : `${issues.length} room problem${issues.length === 1 ? '' : 's'} — see the window.`;
        return { pass, okRooms, issues, building: bld, start: +ci, end: lastEnd, copy, own };
    }
    const timelineHref = (p) => ctx.href('timeline', p);
    const report = (r, extra) => showSlipReport({ ok: r.okRooms, issues: r.issues, building: r.building, start: r.start, end: r.end, ...extra }, timelineHref);
    // A refused Save / Edit / Save as a copy goes to the Performance page with every condition that was checked:
    // what was typed, each room's beds and where the capacity came from, every other stay in those rooms,
    // and how fresh this browser's copy of the slips was (core/telemetry.js → POST /api/slip-denials)
    const iso = (ms) => ms ? new Date(ms).toISOString() : null;
    const win = (w) => ({ ...w, start: iso(w.start), end: iso(w.end) });
    function logDenial(action, r, server) {
        try {
            const v = (id) => $(id).value;
            recordSlipDenial({
                site: ctx.siteId, action, sh_no: v('sh_no').trim(), slip_id: CURRENT_ID || null, building: (v('building') || '').trim(),
                form: { checkin: `${v('checkin_date')} ${v('checkin_time')}`, checkout: `${v('checkout_date')} ${v('checkout_time')}`,
                    gents: v('gents'), ladies: v('ladies'), children: v('children'), infants: v('infants'), total: v('total'), delayed: $('delayOn')?.checked || false },
                stay: r ? { start: iso(r.start), end: iso(r.end) } : null,
                rows: (r?.own || []).map(win),
                issues: r ? r.issues.map(x => ({ ...x, at: iso(x.at), who: x.who?.map(win), others: x.others?.map(win) })) : [{ kind: 'server', ...server }],
                ok_rooms: r?.okRooms || [],
                copy: r?.copy || null,
            });
        } catch (e) { console.warn('could not record the refused save', e); }
    }
    const notSaved = (r, what, action) => {
        logDenial(action, r);
        report(r, { tone: 'bad', title: `Not ${what} — ${r.issues.length} problem${r.issues.length === 1 ? '' : 's'} to fix`,
            lead: 'Nothing was saved. Fix the points in bold, then press the button again.' });
    };
    // a save the server refused: what it means and what to do
    function saveError(err, what) {
        logDenial(what === 'Save' ? (CURRENT_ID ? 'copy' : 'save') : 'update', null, { status: err?.status ?? null, message: String(err?.message || err).slice(0, 300) });
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
            if (!r.pass) { notSaved(r, 'saved', CURRENT_ID ? 'copy' : 'save'); return; }
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
            if (!r.pass) { notSaved(r, 'updated', 'update'); return; }
            delete data.createdAt; // keep original
            const id = await updateRecord(CURRENT_ID, data);
            $('status').textContent = `Updated #${id}`;
            HISTORY?.load(CURRENT_ID);
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
        // the picker works on this slip's building; Exclusive rows kept in another building are left as they are
        const cur = { gents: collectRows('gents'), ladies: collectRows('ladies') };
        const here = (r) => !r.building || normB(r.building) === normB(building);
        openRoomPicker({
            builderHref: ctx.href('builder'),
            building, host: ctx.root, onlyFree: getPrefs().pickerOnlyFree,
            checkin: { date: $('checkin_date').value, time: $('checkin_time').value },
            checkout: { date: $('checkout_date').value, time: $('checkout_time').value },
            slips: DB_CACHE, buildings: BUILDINGS, excludeId: CURRENT_ID,
            historyCap: (room) => history.get(`${building}|${cleanRoom(room)}`) ?? null,
            current: { gents: cur.gents.filter(here), ladies: cur.ladies.filter(here) },
            needs: { gents: $('gents').value, ladies: $('ladies').value, children: $('children').value, infants: $('infants').value },
            onApply: (gents, ladies) => { setRows('gents', [...gents, ...cur.gents.filter(r => !here(r))]); setRows('ladies', [...ladies, ...cur.ladies.filter(r => !here(r))]); },
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
    // Version history of the loaded slip; making an older version the version in use reloads the form from it
    HISTORY = mountSlipHistory({
        host: $('slipHistory'), api: db, current: () => CURRENT_ID, canWrite: () => !db.readonly,
        onActivated: async (slip) => { setFormData(slip); await refreshDBCache(); $('status').textContent = `Version in use changed — SH ${slip.sh_no || ''} (#${slip.id})`; },
    });
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
    // 24-hour times (Settings → Slip page): the time fields become hour / minute pickers; off = the browser's own field
    const stopTimes = enhanceTimes(ctx.root);
    return () => stopTimes();
}
