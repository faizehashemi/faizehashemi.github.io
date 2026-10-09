// Transport: the day's vehicle list pasted from the transport system (tab-separated text, see parseTransport),
// bus numbers for the trips that get signage, and the comparison shown before a re-import changes a day.
//
// One document per site and day in the cloud (GET/PUT/DELETE /api/transport, worker.js):
//   { site, day: 'YYYY-MM-DD', rows: [trip…], version }
// A trip: { key, ref, dora, vch, transporter, at: 'YYYY-MM-DDTHH:MM', operator, leader, route,
//           m, f, c, pax, rooms: [], remarks, adj, loc, bus, bus_manual, vehicle }
//   adj  — "[ADJ WITH TRANSVCHID:48963]": this group rides in vehicle 48963 (another trip's vch);
//          it has no route of its own and shares that trip's bus. A trip without route or remark joins the
//          trip with the same Dora No.
//   bus  — vehicle number within its destination (each destination counts from 1); kept across re-imports.
//   vehicle — 'car' when switched on the Transport day page (cars count from 1 on their own); else a bus.
//   at_manual, at_import — the time was changed by hand on the Transport day page; at_import = the list's time.
//          A re-import keeps the hand-set time unless the list itself brings a different time.

import { request } from './cloud.js';

// The trips that get a bus number, signage and a bus sheet (Makkah departures), in Home's order
export const DESTS = [
    { id: 'atraaf', route: 'MAKKAH-MAKKAH ATRAAF', label: 'ATRAAF', title: 'Atraaf', icon: '🕋' },
    { id: 'madina', route: 'MAKKAH-MADINA', label: 'MADINA', title: 'Madina', icon: '🕌' },
    { id: 'airport', route: 'MAKKAH-JEDDAH AIRPORT', label: 'JEDDAH AIRPORT', title: 'Jeddah Airport', icon: '✈️' },
];
export const destById = Object.fromEntries(DESTS.map(d => [d.id, d]));

const normRoute = (s) => String(s || '').toUpperCase().replace(/\s*-\s*/g, '-').replace(/\s+/g, ' ').trim();
const DEST_OF_ROUTE = Object.fromEntries(DESTS.map(d => [normRoute(d.route), d.id]));

const pad = (n) => String(n).padStart(2, '0');
export const ymd = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const today = () => ymd(new Date());
export const addDays = (day, n) => { const d = new Date(`${day}T12:00`); d.setDate(d.getDate() + n); return ymd(d); };
const num = (v) => { const x = parseInt(String(v ?? '').trim(), 10); return Number.isFinite(x) ? x : 0; };
const clean = (v) => String(v ?? '').replace(/^"+|"+$/g, '').replace(/\s+/g, ' ').trim();
const zeroBlank = (v) => { const s = clean(v); return s === '0' ? '' : s; };

/* --------------------------------- parsing --------------------------------- */

const DATE_RE = /^(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{2})/;
const COUNT_RE = /^([MFCI])\s*:\s*(\d+)/i;

/**
 * Read the pasted list. Columns: Booking Ref, Dora No, Vch No, Transporter, Date, Tour Operator, Gr Leader,
 * Source-Destination, Pax Count (several lines: "M:5", "F: 8"…), Total Pax, Rooms Allocated, Remarks, User Loc.
 * Grouped trips ("ADJ WITH TRANSVCHID") come without Vch No, Transporter and Source-Destination.
 * @returns {{ rows: object[], skipped: number }} rows without a booking ref (hotel shuttles) are skipped
 */
export function parseTransport(text) {
    const lines = String(text || '').replace(/\r\n?/g, '\n').split('\n');
    const records = [];
    let cur = null;
    for (const line of lines) {
        const cells = line.split('\t');
        const di = cells.findIndex(c => DATE_RE.test(clean(c)));
        if (di >= 1 && di <= 5) { cur = { cells, di, more: [] }; records.push(cur); continue; }
        if (cur) cur.more.push(line);
    }
    const rows = [];
    let skipped = 0;
    for (const { cells, di, more } of records) {
        // On the date's line: Tour Operator, Gr Leader and (not for grouped trips) Source-Destination.
        // The Pax Count cell runs over the next lines ("M:5", "F: 8"), then Total Pax, Rooms, Remarks, User Loc.
        const head = cells.slice(di + 1).map(c => c.replace(/"/g, ''));
        while (head.length > 2 && !clean(head[head.length - 1])) head.pop(); // the trailing tab before the Pax Count lines
        const isRoute = (c) => c !== undefined && /[A-Z]/i.test(c) && !COUNT_RE.test(clean(c));
        const operator = clean(head[0]), leader = clean(head[1]);
        const route = isRoute(head[2]) ? normRoute(head[2]) : '';
        const tail = [head.slice(route ? 3 : 2).join('\t'), ...more].join('\n').replace(/"/g, '')
            .split('\n').flatMap(l => l.split('\t'));
        const counts = { M: 0, F: 0, C: 0, I: 0 };
        let total = null, k = 0;
        for (; k < tail.length; k++) {
            const c = clean(tail[k]), m = c.match(COUNT_RE);
            if (m) counts[m[1].toUpperCase()] += Number(m[2]);
            else if (/^\d+$/.test(c)) { total = Number(c); k++; break; }
            else if (c) break; // no total: the cell is already Rooms
        }
        const roomsCell = tail[k] ?? '', remarks = clean(tail[k + 1]), loc = clean(tail[k + 2]);
        const ref = clean(cells[0]);
        if (!ref || ref === '0') { skipped++; continue; }
        const [, dd, mm, yyyy, hh, mi] = clean(cells[di]).match(DATE_RE);
        const day = `${yyyy}-${pad(mm)}-${pad(dd)}`;
        const adj = (remarks.match(/TRANSVCHID\s*:\s*(\d+)/i) || [])[1] || '';
        rows.push({
            key: '', ref, dora: zeroBlank(cells[1]), vch: di >= 3 ? zeroBlank(cells[2]) : '', transporter: di >= 4 ? clean(cells[3]).replace(/-$/, '') : '',
            day, at: `${day}T${pad(hh)}:${mi}`, operator, leader, route,
            m: counts.M, f: counts.F, c: counts.C + counts.I, pax: total ?? (counts.M + counts.F + counts.C + counts.I),
            rooms: [...String(roomsCell).matchAll(/\[([^\]]+)\]/g)].map(x => clean(x[1])),
            remarks, adj, loc,
        });
    }
    // keys: the booking ref; a second trip of the same booking on the same day gets "#2"
    const seen = new Map();
    for (const r of rows) {
        const k = `${r.day}|${r.ref}`;
        const n = (seen.get(k) || 0) + 1;
        seen.set(k, n);
        r.key = n === 1 ? r.ref : `${r.ref}#${n}`;
    }
    return { rows, skipped };
}

/** The pasted rows by day: Map day → rows (in list order) */
export function byDay(rows) {
    const out = new Map();
    for (const r of rows) { if (!out.has(r.day)) out.set(r.day, []); out.get(r.day).push(r); }
    return new Map([...out].sort(([a], [b]) => a.localeCompare(b)));
}

/* ------------------------------ buses and signage ------------------------------ */

const byTime = (a, b) => a.at.localeCompare(b.at);
/** 'bus' (default) or 'car' */
export const vehicleOf = (r) => r && r.vehicle === 'car' ? 'car' : 'bus';
export const VEHICLES = { bus: { label: 'BUS', title: 'Bus', icon: '🚌' }, car: { label: 'CAR', title: 'Car', icon: '🚗' } };
/** "3" for a bus, "Car 1" for a car (tables, signage) */
export const vehicleNo = (n, vehicle) => n == null || n === '' ? '' : vehicle === 'car' ? `Car ${n}` : String(n);

/**
 * Who rides where. Grouped trips (adj) take their vehicle's route and bus.
 * @returns {Map<key, { dest: string|null, bus: number|null, parent: object|null }>}
 */
export function resolve(rows) {
    const byVch = new Map(rows.filter(r => r.vch && r.route).map(r => [r.vch, r]));
    const byDora = new Map();
    for (const r of rows) if (r.dora && r.route && !byDora.has(r.dora)) byDora.set(r.dora, r);
    const out = new Map();
    for (const r of rows) {
        // no route of its own: the vehicle named in the remarks, else the trip with the same Dora No
        const parent = r.route ? null : (r.adj && byVch.get(r.adj)) || (r.dora && byDora.get(r.dora)) || null;
        const route = parent ? parent.route : r.route;
        const dest = DEST_OF_ROUTE[normRoute(route)] || null;
        out.set(r.key, { dest, route, parent, bus: dest ? ((parent || r).bus ?? null) : null, vehicle: vehicleOf(parent || r) });
    }
    return out;
}

/**
 * Give every signage trip a vehicle number, each destination counting from 1 in time order — buses and cars
 * each on their own. With `prev` (the saved day): trips already there keep their number (stickers may be on the
 * buses) as long as the vehicle type is the same; new trips get the next free numbers after the highest in use.
 */
export function assignBuses(rows, prev = []) {
    const before = new Map(prev.map(r => [r.key, r]));
    const prevInfo = resolve(prev);
    const info = resolve(rows);
    for (const r of rows) { if (!(info.get(r.key).dest && !info.get(r.key).parent)) { r.bus = null; r.bus_manual = false; } }
    for (const d of DESTS) for (const v of Object.keys(VEHICLES)) {
        const list = rows.filter(r => { const i = info.get(r.key); return i.dest === d.id && !i.parent && vehicleOf(r) === v; }).sort(byTime);
        const used = new Set();
        const fresh = [];
        for (const r of list) {
            const old = before.get(r.key);
            const n = old && prevInfo.get(old.key)?.dest === d.id && vehicleOf(old) === v ? Number(old.bus) : NaN;
            if (Number.isInteger(n) && n > 0 && !used.has(n)) { r.bus = n; r.bus_manual = !!old.bus_manual; used.add(n); }
            else fresh.push(r);
        }
        let next = used.size ? Math.max(...used) + 1 : 1;
        for (const r of fresh) { r.bus = next++; r.bus_manual = false; }
    }
    return rows;
}

/** Number every destination again from 1 in time order, buses and cars apart (forgets typed-in numbers) */
export const renumber = (rows) => assignBuses(rows.map(r => ({ ...r, bus: null, bus_manual: false })), []);

/**
 * The signage / bus-sheet view of a day: per destination, its buses in number order; each bus holds its trip
 * and the groups adjusted into it.
 * @returns {{ dest, buses: { bus, at, rows: object[], pax, transporter, vch }[], pax, groups }[]}
 */
export function signage(rows) {
    const info = resolve(rows);
    return DESTS.map(d => {
        const mains = rows.filter(r => { const i = info.get(r.key); return i.dest === d.id && !i.parent; })
            .sort((a, b) => (vehicleOf(a) === vehicleOf(b) ? 0 : vehicleOf(a) === 'bus' ? -1 : 1) || (a.bus ?? 1e9) - (b.bus ?? 1e9) || byTime(a, b));
        const buses = mains.map(r => {
            const riders = [r, ...rows.filter(x => info.get(x.key).parent === r)];
            return { bus: r.bus, vehicle: vehicleOf(r), at: r.at, rows: riders, pax: riders.reduce((s, x) => s + (Number(x.pax) || 0), 0), transporter: r.transporter, vch: r.vch };
        });
        return { dest: d, buses, pax: buses.reduce((s, b) => s + b.pax, 0), groups: buses.reduce((s, b) => s + b.rows.length, 0) };
    });
}

/* ---------------------------------- display ---------------------------------- */

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
/** '2026-09-28' → '28-Sep-26' (as on the printed sheets) */
export const sheetDate = (day) => { const [y, m, d] = String(day).split('-'); return `${Number(d)}-${MONTHS[Number(m) - 1]}-${y.slice(2)}`; };
/** '2026-09-28T14:30' → '2:30 pm' */
export const time12 = (at) => {
    const [h, m] = String(at).slice(11, 16).split(':').map(Number);
    if (!Number.isFinite(h)) return '';
    return `${h % 12 || 12}:${pad(m)} ${h < 12 ? 'am' : 'pm'}`;
};
export const longDate = (day) => new Date(`${day}T12:00`).toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

/* ---------------------------------- re-import ---------------------------------- */

export const FIELDS = [
    ['at', 'Time', (r) => time12(r.at)], ['route', 'Route'], ['operator', 'Tour operator'], ['leader', 'Group leader'],
    ['pax', 'Pax'], ['m', 'M'], ['f', 'F'], ['c', 'C'], ['transporter', 'Transporter'], ['vch', 'Vch No'], ['dora', 'Dora No'],
    ['rooms', 'Rooms', (r) => (r.rooms || []).join(', ')], ['remarks', 'Remarks'],
];
const show = (r, [k, , f]) => String(f ? f(r) : (r[k] ?? ''));

/**
 * What a new paste would change on a saved day.
 * @returns {{ added: object[], removed: object[], changed: { old, now, fields: [label, before, after][] }[], same: number }}
 */
export function diffDay(saved, incoming) {
    const old = new Map(saved.map(r => [r.key, r]));
    const seen = new Set();
    const out = { added: [], removed: [], changed: [], same: 0 };
    for (let r of incoming) {
        seen.add(r.key);
        const o = old.get(r.key);
        // a time set by hand stays while the list still has the time it had then
        if (o && o.at_manual && r.at === o.at_import) r = { ...r, at: o.at, at_manual: true, at_import: o.at_import };
        if (!o) { out.added.push(r); continue; }
        const fields = FIELDS.filter(f => show(o, f) !== show(r, f)).map(f => [f[1], show(o, f), show(r, f)]);
        if (fields.length) out.changed.push({ old: o, now: r, fields }); else out.same++;
    }
    for (const o of saved) if (!seen.has(o.key)) out.removed.push(o);
    return out;
}

/**
 * The saved day with the chosen changes applied (keys in `pick`: 'add:KEY', 'chg:KEY', 'del:KEY').
 * Bus numbers already given stay; new signage trips get the next numbers.
 */
export function applyChanges(saved, diff, pick) {
    const map = new Map(saved.map(r => [r.key, { ...r }]));
    for (const r of diff.added) if (pick.has('add:' + r.key)) map.set(r.key, { ...r });
    for (const c of diff.changed) if (pick.has('chg:' + c.now.key)) map.set(c.now.key, { ...c.now, bus: c.old.bus, bus_manual: c.old.bus_manual, ...(c.old.vehicle ? { vehicle: c.old.vehicle } : {}) });
    for (const r of diff.removed) if (pick.has('del:' + r.key)) map.delete(r.key);
    const rows = [...map.values()].sort(byTime);
    return assignBuses(rows, saved);
}

/* ------------------------------------ cloud ------------------------------------ */

const strip = ({ day, ...r }) => r; // the day is the document's

export async function loadDay(site, day) {
    const d = await request('GET', `/api/transport?site=${encodeURIComponent(site)}&day=${encodeURIComponent(day)}`);
    d.rows = (d.rows || []).map(r => ({ ...r, day }));
    return d;
}
export const listDays = (site) => request('GET', `/api/transport/days?site=${encodeURIComponent(site)}`).then(d => d.days || []);
/** Save a whole day. `version` is the one loaded (0 = new day); a newer save by another desk → 409. */
export async function saveDay(site, day, rows, version, note = '') {
    const d = await request('PUT', '/api/transport', { site, day, rows: rows.map(strip), version, note });
    d.rows = (d.rows || []).map(r => ({ ...r, day }));
    return d;
}
export const deleteDay = (site, day, version) =>
    request('DELETE', `/api/transport?site=${encodeURIComponent(site)}&day=${encodeURIComponent(day)}&version=${version}`);
