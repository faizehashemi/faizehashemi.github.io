// Room cleaning (Rooms): which rooms housekeeping should do first on a day, building by building.
// The day runs 03:00 → 03:00 (as on the Check-ins page). Each room row of every slip is a window (core/stay.js —
// a delayed group's rooms leave on their own dates). For each room of Rooms & Buildings:
//   1 Turnover   someone leaves and someone arrives today → clean in the gap (shortest gap / earliest arrival first)
//   2 Get ready  someone arrives, nobody leaves today → ready before the arrival (earliest arrival first)
//   3 Check-out  someone leaves, nobody arrives today → clean after they leave (soonest next arrival first)
//   4 Stay-over  guests stay through the day → light service
// "Done" ticks stay on this device, per day and room.

import { loadBuildings, buildingsOfSite, normRoom, floorOf } from '../../core/rooms.js';
import { rowsOf } from '../../core/stay.js';
import { getPrefs, setPrefs } from '../../core/prefs.js';

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const pad = (n) => String(n).padStart(2, '0');
const ymd = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const shift = (d, n) => { const x = new Date(`${d}T12:00`); x.setDate(x.getDate() + n); return ymd(x); };
const natural = (a, b) => String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: 'base' });
const hm = (ms) => new Date(ms).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
const dayTime = (ms) => new Date(ms).toLocaleString(undefined, { weekday: 'short', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
const gapTxt = (ms) => { const m = Math.round(ms / 60000); return m < 60 ? `${m} min` : `${Math.floor(m / 60)} h${m % 60 ? ` ${m % 60} min` : ''}`; };
const PRIO = { 1: 'Urgent', 2: 'Check Required', 3: 'Checkout House keeping', 4: 'Daily Housekeeping' };

export default async function mount(ctx) {
    const $ = (id) => ctx.root.querySelector('#' + id);
    $('hkDay').value = ymd(new Date());
    let BLD = [], SLIPS = [];
    const doneKey = () => `pms_hk_done:${ctx.siteId}:${$('hkDay').value}`;
    const getDone = () => { try { return new Set(JSON.parse(localStorage.getItem(doneKey()) || '[]')); } catch { return new Set(); } };
    const setDone = (s) => { try { localStorage.setItem(doneKey(), JSON.stringify([...s])); } catch { } };

    // nothing is loaded until a building is chosen (only the list of buildings)
    async function loadBuildingsList() {
        BLD = buildingsOfSite(await ctx.guard(loadBuildings({ force: true })), ctx.siteId).filter(b => b.rooms.some(r => r.active !== false));
        $('hkBld').innerHTML = '<option value="">Choose a building…</option>' + BLD.map(b => `<option>${esc(b.name)}</option>`).join('') + '<option value="*">All buildings</option>';
        render();
    }
    async function load() {
        if (!$('hkBld').value) { render(); return; }
        SLIPS = await ctx.db.all();
        render();
    }

    function compute() {
        const day = $('hkDay').value || ymd(new Date());
        const from = new Date(`${day}T03:00`).getTime(), to = from + 864e5;
        const only = $('hkBld').value === '*' ? '' : $('hkBld').value;
        // every room row window by building|room
        const win = new Map();
        for (const s of SLIPS) {
            if (s.deleted) continue;
            const b = String(s.building || '').trim().toUpperCase();
            for (const w of rowsOf(s)) {
                if (!w.start || !w.end || w.beds <= 0) continue;
                const k = `${b}|${normRoom(w.room_no)}`;
                if (!win.has(k)) win.set(k, []);
                win.get(k).push({ ...w, sh: s.sh_no, tour: s.tour_name || '', delayed: w.status !== 'booked' });
            }
        }
        const rows = [];
        for (const b of BLD.filter(x => !only || x.name === only)) {
            for (const r of b.rooms.filter(x => x.active !== false)) {
                const list = win.get(`${b.name}|${normRoom(r.room_no)}`) || [];
                const outs = list.filter(w => w.end >= from && w.end < to);
                const ins = list.filter(w => w.start >= from && w.start < to);
                const stays = list.filter(w => w.start < from && w.end >= to);
                if (!outs.length && !ins.length && !stays.length) continue;
                const lastOut = outs.length ? Math.max(...outs.map(w => w.end)) : null;
                const firstIn = ins.length ? Math.min(...ins.map(w => w.start)) : null;
                const next = !ins.length ? list.filter(w => w.start >= to).sort((a, c) => a.start - c.start)[0] || null : null;
                let p, note, sortKey;
                if (outs.length && ins.length) {
                    p = 1;
                    const gap = firstIn - lastOut;
                    note = gap > 0 ? `${gapTxt(gap)} between them` : 'arrival before the last leaves — check with the desk';
                    sortKey = [Math.max(0, gap), firstIn];
                } else if (ins.length) { p = 2; note = stays.length ? 'others staying in the room' : 'room empty until then'; sortKey = [firstIn, 0]; }
                else if (outs.length) { p = 3; note = next ? `next arrival ${dayTime(next.start)}` : 'no one booked after'; sortKey = [next ? next.start : Infinity, lastOut]; }
                else { p = 4; note = 'stay-over'; sortKey = [0, 0]; }
                rows.push({ p, sortKey, bld: b.name, room: String(r.room_no).trim(), floor: String(r.floor || '').trim() || floorOf(r.room_no), cap: Number(r.capacity) || 0,
                    outs, ins, stays, lastOut, firstIn, note });
            }
        }
        rows.sort((a, c) => a.p - c.p || a.sortKey[0] - c.sortKey[0] || a.sortKey[1] - c.sortKey[1] || natural(a.bld, c.bld) || natural(a.room, c.room));
        return { day, rows };
    }

    /* staff on floors (kept with the login, on the server): a floor can have several staff, a staff several floors */
    const fkey = (bld) => `${ctx.siteId}|${bld}`;
    const staffOn = (bld, floor) => (getPrefs().hkFloors?.[fkey(bld)]?.[floor]) || [];
    function setStaffOn(bld, floor, names) {
        const all = { ...(getPrefs().hkFloors || {}) };
        const b = { ...(all[fkey(bld)] || {}) };
        if (names.length) b[floor] = names; else delete b[floor];
        if (Object.keys(b).length) all[fkey(bld)] = b; else delete all[fkey(bld)];
        setPrefs({ hkFloors: all });
    }
    const floorOfRoom = (r) => String(r.floor || '').trim() || floorOf(r.room_no);
    const floorsOf = (b) => [...new Set(b.rooms.filter(r => r.active !== false).map(floorOfRoom))].sort(natural);
    function renderStaff() {
        const sel = $('hkBld').value;
        $('hkStaffCard').hidden = !sel;
        if (!sel) return;
        const staff = getPrefs().hkStaff || [];
        const blds = BLD.filter(b => sel === '*' || b.name === sel);
        const opts = '<option value="">+ staff</option>' + staff.map(n => `<option>${esc(n)}</option>`).join('');
        $('hkFloors').innerHTML = blds.flatMap(b => floorsOf(b).map(f => {
            const on = staffOn(b.name, f);
            const n = b.rooms.filter(r => r.active !== false && floorOfRoom(r) === f).length;
            return `<div class="hk-fl" data-bld="${esc(b.name)}" data-floor="${esc(f)}">
                <b>${sel === '*' ? `${esc(b.name)} · ` : ''}Floor ${esc(f)} <small>${n} room${n === 1 ? '' : 's'}</small></b>
                <div class="hk-chipsRow">${on.length ? on.map((x, i) => `<span class="hk-chip">${esc(x)}<button type="button" data-unstaff="${i}" title="Take off this floor" aria-label="Take ${esc(x)} off floor ${esc(f)}">×</button></span>`).join('') : '<span class="hk-none">no staff yet</span>'}</div>
                <select data-staff aria-label="Add staff to floor ${esc(f)}" ${staff.length ? '' : 'disabled'}>${opts}</select></div>`;
        })).join('') || '<p class="hk-note">This building has no floors.</p>';
        $('hkStaffList').innerHTML = staff.length
            ? `Staff: ${staff.map(x => `<span class="hk-chip">${esc(x)}<button type="button" data-delstaff="${esc(x)}" title="Remove from the staff list" aria-label="Remove ${esc(x)}">×</button></span>`).join('')}`
            : 'No staff yet — add names above, then put them on floors.';
    }
    $('hkAddStaff').addEventListener('submit', (e) => {
        e.preventDefault();
        const n = $('hkNewStaff').value.replace(/[<>]/g, '').replace(/\s+/g, ' ').trim().slice(0, 60);
        if (!n) return;
        const staff = getPrefs().hkStaff || [];
        if (!staff.some(x => x.toLowerCase() === n.toLowerCase())) setPrefs({ hkStaff: [...staff, n].sort(natural) });
        $('hkNewStaff').value = '';
        renderStaff();
    });
    $('hkFloors').addEventListener('change', (e) => {
        const s = e.target.closest('select[data-staff]');
        if (!s || !s.value) return;
        const fl = s.closest('.hk-fl');
        setStaffOn(fl.dataset.bld, fl.dataset.floor, [...staffOn(fl.dataset.bld, fl.dataset.floor), s.value]);
        renderStaff();
    });
    $('hkStaffCard').addEventListener('click', (e) => {
        const un = e.target.closest('[data-unstaff]'), del = e.target.closest('[data-delstaff]');
        if (un) {
            const fl = un.closest('.hk-fl');
            const names = [...staffOn(fl.dataset.bld, fl.dataset.floor)]; names.splice(Number(un.dataset.unstaff), 1);
            setStaffOn(fl.dataset.bld, fl.dataset.floor, names);
        } else if (del) {
            const n = del.dataset.delstaff;
            if (!confirm(`Remove ${n} from the staff list and from every floor?`)) return;
            const floors = {};
            for (const [k, b] of Object.entries(getPrefs().hkFloors || {})) {
                const kept = Object.fromEntries(Object.entries(b).map(([f, ns]) => [f, ns.filter(x => x !== n)]).filter(([, ns]) => ns.length));
                if (Object.keys(kept).length) floors[k] = kept;
            }
            setPrefs({ hkStaff: (getPrefs().hkStaff || []).filter(x => x !== n), hkFloors: floors });
        } else return;
        renderStaff();
    });

    function render() {
        renderStaff();
        if (!$('hkBld').value) {
            $('hkKpis').innerHTML = '';
            $('hkList').innerHTML = '<p class="hk-note">Choose a building to see which rooms to do first.</p>';
            return;
        }
        const { day, rows } = compute();
        const done = getDone();
        const count = (p) => rows.filter(r => r.p === p);
        const left = (p) => count(p).filter(r => !done.has(`${r.bld}|${r.room}`)).length;
        $('hkKpis').innerHTML = [1, 2, 3, 4].map(p => `<div class="hk-kpi p${p}"><span>${PRIO[p]}</span><b>${count(p).length}</b><small>${left(p)} still to do</small></div>`).join('')
            + `<div class="hk-kpi"><span>Guests arriving</span><b>${rows.reduce((n, r) => n + r.ins.reduce((m, w) => m + w.beds, 0), 0)}</b><small>beds to make ready · ${new Date(`${day}T12:00`).toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'short' })}</small></div>`;
        const hide = $('hkHideDone').checked;
        const who = (ws, at) => ws.map(w => `<span class="hk-who">${at === 'out' ? hm(w.end) : at === 'stay' ? `until ${dayTime(w.end)}` : hm(w.start)} · SH ${esc(w.sh)} · ${w.beds} bed${w.beds === 1 ? '' : 's'}${w.delayed ? ' <em>delayed</em>' : ''}</span>`).join('');
        const shown = rows.filter(r => !hide || !done.has(`${r.bld}|${r.room}`));
        $('hkList').innerHTML = shown.length ? `<table class="hk-tbl">
            <thead><tr><th>Done</th><th>#</th><th>Priority</th><th>Building · room</th><th>Leaves</th><th>Arrives</th><th>Note</th></tr></thead>
            <tbody>${shown.map((r, i) => { const k = `${r.bld}|${r.room}`; return `<tr class="${done.has(k) ? 'done' : ''}">
                <td><input type="checkbox" data-done="${esc(k)}" ${done.has(k) ? 'checked' : ''} aria-label="Room ${esc(r.room)} done"></td>
                <td class="n">${i + 1}</td>
                <td><span class="hk-p p${r.p}">${PRIO[r.p]}</span></td>
                <td><b>${esc(r.room)}</b><small>${esc(r.bld)} · floor ${esc(r.floor)} · ${r.cap} beds</small></td>
                <td>${who(r.outs, 'out') || (r.p === 4 ? who(r.stays, 'stay') : '—')}</td>
                <td>${who(r.ins, 'in') || '—'}</td>
                <td class="hk-noteCell">${esc(r.note)}</td></tr>`; }).join('')}</tbody></table>`
            : `<p class="hk-note">No check-ins, check-outs or stays ${$('hkBld').value ? `in ${esc($('hkBld').value)} ` : ''}on this day.</p>`;
    }

    $('hkList').addEventListener('change', (e) => {
        const k = e.target.dataset.done;
        if (!k) return;
        const d = getDone(); e.target.checked ? d.add(k) : d.delete(k); setDone(d);
        render();
    });
    ['hkDay', 'hkHideDone'].forEach(id => $(id).addEventListener('change', render));
    $('hkBld').addEventListener('change', () => load().catch(e => console.warn(e)));
    ctx.root.querySelector('.hk-chips').addEventListener('click', (e) => {
        const b = e.target.closest('[data-day]');
        if (b) { $('hkDay').value = shift(ymd(new Date()), Number(b.dataset.day)); render(); }
    });
    // Print: just each category and its room numbers, in a tab of its own
    $('hkPrint').addEventListener('click', () => {
        if (!$('hkBld').value) { alert('Choose a building first.'); return; }
        const { rows } = compute();
        const all = $('hkBld').value === '*';
        const w = window.open('', '_blank');
        if (!w) { alert('The browser blocked the new tab. Allow pop-ups for this site, then press Print again.'); return; }
        // floor by floor (building first when all buildings), then each category's rooms on that floor
        const floors = [...new Set(rows.map(r => `${r.bld}|${r.floor}`))].sort((x, y) => natural(x.split('|')[0], y.split('|')[0]) || natural(x.split('|')[1], y.split('|')[1]));
        const body = floors.map(f => {
            const [bld, floor] = f.split('|');
            const here = rows.filter(r => r.bld === bld && r.floor === floor);
            const cats = [1, 2, 3, 4].map(p => {
                const rooms = here.filter(r => r.p === p).map(r => r.room).sort(natural);
                return rooms.length ? `<div class="cat"><b>${esc(PRIO[p])}</b> ${rooms.map(esc).join(', ')}</div>` : '';
            }).join('');
            const staff = staffOn(bld, floor);
            return `<section><h2>${all ? `${esc(bld)} · ` : ''}Floor ${esc(floor)}${staff.length ? ` <span class="staff">— ${staff.map(esc).join(', ')}</span>` : ''}</h2>${cats}</section>`;
        }).join('') || '<p>—</p>';
        w.document.open();
        w.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Room cleaning</title><style>
            @page { margin: 12mm; } body { font: 16px/1.5 Arial, Helvetica, sans-serif; color: #000; margin: 0; }
            section { break-inside: avoid; padding: 6px 0 8px; border-bottom: 1px solid #999; }
            h2 { font-size: 18px; margin: 8px 0 4px; } h2 .staff { font-weight: 600; } .cat { font-size: 18px; margin: 2px 0; } .cat b { display: inline-block; min-width: 230px; font-size: 15px; }
            </style></head><body>${body}<script>window.addEventListener('load', function () { setTimeout(function () { window.focus(); window.print(); }, 200); });<\/script></body></html>`);
        w.document.close();
    });
    await loadBuildingsList();
    // other desks' check-ins: refresh every 2 minutes while open
    const t = setInterval(() => { if (document.visibilityState === 'visible') load().catch(() => { }); }, 120e3);
    return () => clearInterval(t);
}
