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

    function render() {
        if (!$('hkBld').value) {
            $('hkKpis').innerHTML = '';
            $('hkList').innerHTML = '<p class="hk-note">Choose a building to see which rooms to do first.</p>';
            return;
        }
        const { day, rows } = compute();
        const done = getDone();
        const count = (p) => rows.filter(r => r.p === p);
        const left = (p) => count(p).filter(r => !done.has(`${r.bld}|${r.room}`)).length;
        $('hkKpis').innerHTML = [1, 2, 3, 4].map(p => `<div class="hk-kpi p${p}"><span>${p} ${PRIO[p]}</span><b>${count(p).length}</b><small>${left(p)} still to do</small></div>`).join('')
            + `<div class="hk-kpi"><span>Guests arriving</span><b>${rows.reduce((n, r) => n + r.ins.reduce((m, w) => m + w.beds, 0), 0)}</b><small>beds to make ready · ${new Date(`${day}T12:00`).toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'short' })}</small></div>`;
        const hide = $('hkHideDone').checked;
        const who = (ws, at) => ws.map(w => `<span class="hk-who">${at === 'out' ? hm(w.end) : at === 'stay' ? `until ${dayTime(w.end)}` : hm(w.start)} · SH ${esc(w.sh)} · ${w.beds} bed${w.beds === 1 ? '' : 's'}${w.delayed ? ' <em>delayed</em>' : ''}</span>`).join('');
        const shown = rows.filter(r => !hide || !done.has(`${r.bld}|${r.room}`));
        $('hkList').innerHTML = shown.length ? `<table class="hk-tbl">
            <thead><tr><th>Done</th><th>#</th><th>Priority</th><th>Building · room</th><th>Leaves</th><th>Arrives</th><th>Note</th></tr></thead>
            <tbody>${shown.map((r, i) => { const k = `${r.bld}|${r.room}`; return `<tr class="${done.has(k) ? 'done' : ''}">
                <td><input type="checkbox" data-done="${esc(k)}" ${done.has(k) ? 'checked' : ''} aria-label="Room ${esc(r.room)} done"></td>
                <td class="n">${i + 1}</td>
                <td><span class="hk-p p${r.p}">${r.p} ${PRIO[r.p]}</span></td>
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
    $('hkPrint').addEventListener('click', () => window.print());
    await loadBuildingsList();
    // other desks' check-ins: refresh every 2 minutes while open
    const t = setInterval(() => { if (document.visibilityState === 'visible') load().catch(() => { }); }, 120e3);
    return () => clearInterval(t);
}
