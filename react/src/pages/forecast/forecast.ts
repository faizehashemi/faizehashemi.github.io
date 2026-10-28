// Vacancy forecast: which rooms are occupied / vacant at a chosen moment, the capacity deviations and the headcount (moved unchanged from views/forecast/view.js).
// Rooms and bed counts come from Rooms & Buildings when it has the building (else from slip history).
import type { CoreModules } from '@/pms/types';

type Slip = Record<string, any>;
type Stay = CoreModules['stay'];
type Rooms = CoreModules['rooms'];
export type OccRow = { room: string; tour: string; leader: string; gender: string; excl: boolean; eff: number; win: string; bld: string; sh: unknown };
export type FreeRow = { room: string; cap: number | null; note: string };
export type UnderRow = { building: string; room: string; asg: number; cap: number; delta: number };

const toInt = (v: unknown) => Number.parseInt(String(v ?? '').trim(), 10) || 0;
const clean = (s: unknown) => String(s ?? '').trim();
const normRoom = (s: unknown) => String(s || '').toUpperCase().replace(/\s+/g, '').replace(/[-_.]/g, '').replace(/^0+(?=\d)/, '');
export const parseDT = (d?: string, t?: string) => { if (!d) return null; const v = new Date(`${d}T${t && t.length ? t : '00:00'}`); return isNaN(+v) ? null : v; };
export const fmt = (dt: Date | null) => (dt ? new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(dt) : '');
const unique = <T,>(a: T[]) => Array.from(new Set(a));
const byNum = (a: string, b: string) => a.localeCompare(b, undefined, { numeric: true });

export function runForecast(o: { when: Date; building: string; mode: string; manualText: string; slips: Slip[]; buildings: any[]; siteId: string; stay: Stay; rooms: Rooms }) {
    const { when, building, mode, manualText, slips: DB, buildings: B, siteId } = o;
    const stay = o.stay as any, R = o.rooms as any;

    // Two lookup tables, each built by ONE pass over the slips the first time it is needed (the page used to scan every slip again for every room):
    // the capacities the slips quote for a room, and the beds each room keeps at this instant.
    let capIndex: Map<string, Map<number, number>> | null = null;
    const capFreq = (bld: string, room: string) => {
        if (!capIndex) {
            capIndex = new Map();
            for (const rec of DB) {
                const b = clean(rec.building);
                const take = (x: Slip) => { const raw = clean(x.room_no); if (!raw) return; const c = toInt(x.capacity); if (c <= 0) return; const k = `${b}|${normRoom(raw)}`; const f = capIndex!.get(k) ?? capIndex!.set(k, new Map()).get(k)!; f.set(c, (f.get(c) || 0) + 1); };
                (rec.rooms?.gents || []).forEach(take); (rec.rooms?.ladies || []).forEach(take);
            }
        }
        return capIndex.get(`${bld}|${normRoom(room)}`);
    };
    let bedsIndex: Map<string, number> | null = null;
    const bedsKey = (bld: string, room: string) => `${stay.normB(bld)}|${normRoom(room)}`;

    /* Integer capacity for a room, by majority vote across entries (no decimals) */
    const capacityFor = (bld: string, room: string) => {
        const fromBuilder = R.builderCapacity(B, bld, room);
        if (fromBuilder != null) return fromBuilder as number;
        const freq = capFreq(bld, room);
        if (!freq || !freq.size) return null;
        let best: number | null = null, bn = -1;
        for (const [cap, cnt] of freq) if (cnt > bn || (cnt === bn && cap > (best ?? 0))) { best = cap; bn = cnt; }
        return best;
    };
    /* Beds a room keeps at this exact instant (snapshot): guests' beds, the whole room for an Exclusive row */
    const assignedNow = (bld: string, room: string) => {
        if (!bedsIndex) {
            bedsIndex = new Map();
            for (const rec of DB) for (const w of stay.rowsOf(rec) as Slip[]) {
                if (!(w.start <= +when && +when < w.end)) continue;
                const k = bedsKey(w.building, w.room_no);
                bedsIndex.set(k, (bedsIndex.get(k) || 0) + (w.exclusive ? w.block : toInt(w.row.assigned)));
            }
        }
        return bedsIndex.get(bedsKey(bld, room)) || 0;
    };
    const inventoryRooms = (): string[] => {
        if (mode === 'manual') return unique(manualText.split(/[\n,]+/).map(s => clean(s)).filter(Boolean)).sort(byNum);
        if (mode === 'builder') {
            const names = building && building !== 'ALL' ? [building] : (R.buildingsOfSite(B, siteId) as Slip[]).map(b => b.name);
            const rooms = names.flatMap(n => (R.activeRooms(B, n) as Slip[]).map(r => clean(r.room_no)));
            if (rooms.length) return unique(rooms).sort(byNum);
            // the builder has no rooms for this building yet: fall back to what the slips show
        }
        const bag: string[] = [];
        for (const r of DB) {
            if (building && building !== 'ALL' && !stay.slipTouches(r, building)) continue;
            const inB = (x: Slip) => !building || building === 'ALL' || stay.normB(x.building || r.building) === stay.normB(building);
            (r.rooms?.gents || []).filter(inB).forEach((x: Slip) => bag.push(clean(x.room_no))); (r.rooms?.ladies || []).filter(inB).forEach((x: Slip) => bag.push(clean(x.room_no)));
        }
        return unique(bag.filter(Boolean)).sort(byNum);
    };

    const inventory = inventoryRooms();
    const active = DB.filter(r => { if (building !== 'ALL' && clean(r.building) !== building) return false; return stay.presentAt(r, +when); });   // headcount: a slip's guests count in its own building
    const activeSlips = DB.filter(r => { if (building !== 'ALL' && !stay.slipTouches(r, building)) return false; return stay.presentAt(r, +when); });   // rooms: also an Exclusive row in this building
    const occ = new Map<string, any[]>();
    for (const r of activeSlips) {
        const base = { tour: clean(r.tour_name), leader: clean(r.group_leader), sh: r.sh_no ?? '' };
        for (const w of stay.rowsOf(r) as Slip[]) if (w.start <= +when && +when < w.end && (building === 'ALL' || stay.normB(w.building) === stay.normB(building))) {   // only the rooms still in house, in this building
            const key = clean(w.room_no); if (!key) continue;
            if (!occ.has(key)) occ.set(key, []);
            occ.get(key)!.push({ ...base, bld: clean(w.building), gender: w.side === 'gents' ? 'Gents' : 'Ladies', cap: toInt(w.row.capacity), asg: w.exclusive ? w.block : toInt(w.row.assigned), excl: w.exclusive, win: `${fmt(new Date(w.start))} → ${fmt(new Date(w.end))}` });
        }
    }
    const occRooms = [...occ.keys()].sort(byNum);
    const occRows: OccRow[] = []; let occCapEff = 0;
    for (const room of occRooms) for (const e of occ.get(room)!) {
        const eff = e.asg > 0 ? e.asg : e.cap;
        occRows.push({ room, tour: e.tour, leader: e.leader, gender: e.gender, excl: e.excl, eff, win: e.win, bld: e.bld, sh: e.sh });
        if (Number.isInteger(eff)) occCapEff += eff;
    }
    const occSet = new Set(occRooms);
    const freeRooms = inventory.filter(r => !occSet.has(r));
    const freeRows: FreeRow[] = freeRooms.map(room => {
        let cap: number | null = null, note = '';
        if (building !== 'ALL') { cap = capacityFor(building, room); note = cap == null ? 'capacity unknown' : ''; } else note = 'building=ALL (cap not shown)';
        return { room, cap, note };
    });
    // deviations (snapshot only) — only for a specific building
    const underRows: UnderRow[] = []; let underCount = 0;
    if (building !== 'ALL') {
        for (const room of occRooms) {
            const cap = capacityFor(building, room); if (cap == null) continue;
            const asg = assignedNow(building, room); if (asg === cap) continue;
            const delta = asg - cap; underRows.push({ building, room, asg, cap, delta }); if (delta < 0) underCount++;
        }
    }
    // known free capacity (integers only)
    let freeCapTotal = 0;
    if (building !== 'ALL') {
        for (const room of freeRooms) { const cap = capacityFor(building, room); if (Number.isInteger(cap)) freeCapTotal += cap as number; }   // 1) fully vacant rooms
        for (const room of occRooms) { const cap = capacityFor(building, room) || 0, asg = assignedNow(building, room) || 0; if (cap > asg) freeCapTotal += cap - asg; }   // 2) leftover in occupied-but-not-full rooms
    }
    const sums = active.reduce((a, r) => { a.g += toInt(r.gents); a.l += toInt(r.ladies); a.c += toInt(r.children || r.child); a.i += toInt(r.infants || r.infant); return a; }, { g: 0, l: 0, c: 0, i: 0 });
    return {
        occRows, freeRows, underRows,
        summary: { total: inventory.length, occ: occRooms.length, free: freeRooms.length, occCap: occCapEff, freeCap: freeCapTotal, under: underCount, head: sums.g + sums.l + sums.c + sums.i, sums },
        status: `Snapshot: ${fmt(when)} • ${building === 'ALL' ? 'All buildings' : 'Building: ' + building} • Active slips: ${active.length}`,
    };
}
