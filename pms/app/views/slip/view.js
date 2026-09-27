// Ported from pms/accommodation_slip.html (its five scripts merged into one module).
// Behaviour is unchanged; storage goes through ctx.db (the cloud).

import { UserError } from '../../core/cloud.js';
import { loadBuildings, buildingNames, builderCapacity } from '../../core/rooms.js';

export default async function mount(ctx) {
    const { db, site, params } = ctx;

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

    async function refreshDBCache() {
        DB_CACHE = await getAllRecords();
    }

    // Buildings from Rooms & Buildings (plus the site config); capacities prefer the builder too
    let BUILDINGS = await loadBuildings();
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

        // Delete
        const tdDel = document.createElement('td');
        const btnDel = document.createElement('button');
        btnDel.className = 'row-btn';
        btnDel.type = 'button';
        btnDel.textContent = 'X';
        btnDel.title = 'Delete row';
        btnDel.onclick = () => tr.remove();
        tdDel.appendChild(btnDel);

        tr.append(tdRoom, tdCap, tdAsg, tdDel);
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
                rows.push({ room_no, capacity, assigned });
            }
        });
        return rows;
    }

    function setRows(group, arr) {
        const tbody = $(group + '-tbody');
        tbody.innerHTML = '';
        if (!arr || !arr.length) { addRow(group); return; }
        arr.forEach(r => addRow(group, r));
    }

    function getFormData() {
        return {
            tour_name: $('tour_name').value.trim(),
            group_leader: $('group_leader').value.trim(),
            checkin_date: $('checkin_date').value || '',
            checkin_time: $('checkin_time').value || '',
            checkout_date: $('checkout_date').value || '',
            checkout_time: $('checkout_time').value || '',
            building: $('building').value || '',
            sh_no: $('sh_no').value === '' ? '' : Number($('sh_no').value),
            total: $('total').value === '' ? '' : Number($('total').value),
            gents: $('gents').value === '' ? '' : Number($('gents').value),
            ladies: $('ladies').value === '' ? '' : Number($('ladies').value),
            infants: $('infants').value === '' ? '' : Number($('infants').value),
            children: $('children').value === '' ? '' : Number($('children').value),
            rooms: {
                gents: collectRows('gents'),
                ladies: collectRows('ladies')
            },
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
        setRows('gents', data.rooms?.gents || []);
        setRows('ladies', data.rooms?.ladies || []);
    }

    function clearForm() {
        CURRENT_ID = null;
        setFormData({
            tour_name: '', group_leader: '', checkin_date: '', checkin_time: '',
            checkout_date: '', checkout_time: '', building: '', sh_no: '',
            total: '', gents: '', ladies: '', infants: '', children: '',
            rooms: { gents: [], ladies: [] }
        });
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
        BUILDINGS = await loadBuildings();

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

    async function checkAvailability() {
        await refreshDBCache();

        const bld = ($('building').value || '').trim();
        const ci = parseDT($('checkin_date').value, $('checkin_time').value);
        const co = parseDT($('checkout_date').value, $('checkout_time').value);

        if (!bld || !ci || !co || co <= ci) {
            alert('Enter a valid building and check-in/check-out window first.');
            return false;
        }

        // Current rows with per-room wanted assignment and local capacity
        const rowsAll = [...collectRows('gents'), ...collectRows('ladies')];
        const roomInfo = new Map(); // room -> { want, capLocal }
        for (const r of rowsAll) {
            const room = cleanRoom(r.room_no);
            if (!room) continue;
            const want = Number.isFinite(+r.assigned) ? +r.assigned : 0;
            const capLocal = Number.isFinite(+r.capacity) ? +r.capacity : 0;
            const prev = roomInfo.get(room) || { want: 0, capLocal: 0 };
            roomInfo.set(room, { want: prev.want + want, capLocal: prev.capLocal || capLocal });
        }
        const uniqRooms = Array.from(roomInfo.keys());

        // Per-room stats from overlapping OTHER slips
        const stats = new Map(); // room -> { existing: number, freeAt: Date|null }
        for (const room of uniqRooms) stats.set(room, { existing: 0, freeAt: null });

        for (const r of DB_CACHE) {
            if (CURRENT_ID && r.id === CURRENT_ID) continue; // ignore self
            const rb = (r.building || '').trim();
            if (rb !== bld) continue;
            const rci = parseDT(r.checkin_date, r.checkin_time);
            const rco = parseDT(r.checkout_date, r.checkout_time);
            if (!rci || !rco) continue;
            if (!overlaps(ci, co, rci, rco)) continue;
            const used = [...(r.rooms?.gents || []), ...(r.rooms?.ladies || [])];
            for (const x of used) {
                const room = cleanRoom(x.room_no);
                if (!room || !roomInfo.has(room)) continue;
                const s = stats.get(room);
                const a = Number.isFinite(+x.assigned) ? +x.assigned : 0;
                s.existing += a;
                // latest checkout among overlapping stays decides "free at"
                if (!s.freeAt || s.freeAt < rco) s.freeAt = rco;
            }
        }

        // Capacity from the current row first, then Rooms & Buildings, then last-known from history
        function resolveCapacity(room) {
            const local = roomInfo.get(room)?.capLocal || 0;
            if (local > 0) return local;
            const fromBuilder = builderCapacity(BUILDINGS, bld, room);
            if (fromBuilder > 0) return fromBuilder;
            for (let i = DB_CACHE.length - 1; i >= 0; i--) {
                const rec = DB_CACHE[i];
                const rb = (rec.building || '').trim();
                if (rb !== bld) continue;
                const arr = [...(rec.rooms?.gents || []), ...(rec.rooms?.ladies || [])];
                const hit = arr.find(z => cleanRoom(z.room_no) === room);
                const histCap = Number.isFinite(+hit?.capacity) ? +hit.capacity : 0;
                if (histCap > 0) return histCap;
            }
            return 0; // unknown
        }

        // Per room: allowed when (existing + want) <= capacity
        const blocked = new Set();
        const lines = [];
        for (const room of uniqRooms) {
            const { want } = roomInfo.get(room);
            const existing = stats.get(room)?.existing || 0;
            const freeAt = stats.get(room)?.freeAt || null;
            const cap = resolveCapacity(room);

            if (!cap) {
                blocked.add(room);
                lines.push(`${room}: capacity unknown. Enter capacity for this slip.`);
                continue;
            }

            const after = existing + (Number.isFinite(+want) ? +want : 0);
            if (after < cap + 1) {
                const remainingNow = Math.max(0, cap - after);
                lines.push(`${room}: OK. Before Assigned: ${existing}/${cap}. After Assignment: ${after}/${cap}. Remaining now ${remainingNow}.`);
            } else {
                blocked.add(room);
                const freeStr = freeAt ? fmt(freeAt) : '(checkout unknown)';
                lines.push(`${room}: BLOCKED. Existing ${existing}/${cap}, assigning ${want || 0} would be ${after}/${cap}. Expected chechout after ${freeStr}.`);
            }
        }

        highlightConflicts(blocked);

        if (blocked.size) {
            alert(lines.join('\n'));
            $('status').textContent = `${blocked.size} room(s) at or over capacity.`;
            return false;
        } else {
            alert(lines.join('\n') + '\nAll entered rooms are available within capacity.');
            $('status').textContent = 'Availability OK.';
            return true;
        }
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
    const saveFailed = (err, fallback) => alert(err instanceof UserError ? err.message : fallback);

    $('btnSave').addEventListener('click', async () => {
        try {
            if (CURRENT_ID && DB_CACHE.find(r => r.id === CURRENT_ID)?.ums &&
                !confirm('This slip comes from the UMS import.\n\nUse "Edit" to update it (rooms, building, times).\n"Save" creates a separate copy that will double-count.\n\nCreate a separate copy anyway?')) return;
            const data = getFormData();
            const ok = await checkAvailability(); // guard before saving
            if (ok === false) return;
            const id = await addRecord(data);
            CURRENT_ID = id;
            $('status').textContent = `Saved as #${id}`;
        } catch (err) {
            $('status').textContent = err instanceof UserError ? err.message : 'Save failed. Check console.';
            console.error('Save error:', err);
            saveFailed(err, 'Failed to save. Your browser may block IndexedDB in this context.');
        }
    });

    $('btnEdit').addEventListener('click', async () => {
        try {
            if (!CURRENT_ID) { alert('Load a slip (Saved list or SH Fetch) before editing.'); return; }
            const data = getFormData();
            const ok = await checkAvailability(); // validate before edit too
            if (ok === false) return;
            delete data.createdAt; // keep original
            const id = await updateRecord(CURRENT_ID, data);
            $('status').textContent = `Updated #${id}`;
        } catch (err) {
            $('status').textContent = err instanceof UserError ? err.message : 'Edit failed. See console.';
            console.error('Edit error:', err);
            saveFailed(err, 'Edit failed.');
        }
    });

    $('btnNew').addEventListener('click', () => {
        clearForm();
        $('stayPick').hidden = true;
        $('status').textContent = 'New blank slip';
    });

    // A UMS import can give one SH several stays at this site (e.g. Makkah before and after
    // Madina). Those get a picker; without UMS stays the latest slip loads, as before.
    async function pickStayFor(sh) {
        const dmy = (d) => (d || '').split('-').reverse().join('/');
        const stays = (await getAllRecords())
            .filter(r => r.ums && String(r.sh_no ?? '').trim() === String(sh).trim())
            .sort((a, b) => `${a.checkin_date}T${a.checkin_time}`.localeCompare(`${b.checkin_date}T${b.checkin_time}`));
        const pick = $('stayPick');
        pick.hidden = stays.length < 2;
        pick.innerHTML = stays.map(r => `<option value="${r.id}">Stay ${dmy(r.checkin_date)} → ${dmy(r.checkout_date)}${r.building ? ' · ' + r.building : ''}</option>`).join('');
        if (!stays.length) return getLatestBySh(sh);
        const today = new Date().toISOString().slice(0, 10);
        const rec = stays.find(r => (r.checkout_date || '') >= today) || stays[stays.length - 1];
        pick.value = String(rec.id);
        return rec;
    }

    async function fetchBySh() {
        const raw = $('sh_no').value;
        if (raw === '' || isNaN(Number(raw))) { alert('Enter a valid SH No.'); return; }
        const rec = await pickStayFor(Number(raw));
        if (!rec) { $('status').textContent = 'No slip found for that SH.'; return; }
        CURRENT_ID = rec.id;
        setFormData(rec);
        $('status').textContent = `Loaded latest slip for SH ${rec.sh_no} (#${rec.id})`;
    }
    $('btnFetchSh').addEventListener('click', fetchBySh);

    $('stayPick').addEventListener('change', async () => {
        const rec = (await getAllRecords()).find(r => r.id === Number($('stayPick').value));
        if (!rec) return;
        CURRENT_ID = rec.id;
        setFormData(rec);
        $('status').textContent = `Loaded stay #${rec.id} for SH ${rec.sh_no}`;
    });

    $('sh_no').addEventListener('blur', async () => {
        const hasAny = ($('tour_name').value || $('group_leader').value || $('building').value);
        if (hasAny) return;
        const raw = $('sh_no').value;
        if (raw !== '' && !isNaN(Number(raw))) {
            const rec = await pickStayFor(Number(raw));
            if (rec) {
                CURRENT_ID = rec.id;
                setFormData(rec);
                $('status').textContent = `Auto-loaded latest slip for SH ${rec.sh_no} (#${rec.id})`;
            }
        }
    });

    $('btnFetchCap').addEventListener('click', fetchCapacities);
    $('btnCheckAvail').addEventListener('click', checkAvailability);
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
