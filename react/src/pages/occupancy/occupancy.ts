// Occupancy numbers (moved unchanged from pms/app/views/occupancy/view.js): beds in use each night of a period.
//   A night is counted at 22:00: a slip's beds count when check-in ≤ 22:00 < check-out.
//   Beds in use = the beds each room row BLOCKS (an Exclusive row blocks the whole room); a delayed group's rows leave on their own.
//   Capacity = active rooms in Rooms & Buildings. Guests whose slip has a building but no rooms yet are counted apart ("without rooms").
import type { CoreModules } from '@/pms/types';

type Stay = Pick<CoreModules['stay'], 'rowsOf' | 'slipEnd' | 'isDelayed' | 'paxAt' | 'normB'>;
type Rooms = Pick<CoreModules['rooms'], 'normRoom' | 'floorOf'>;

export const MAX_DAYS = 62;
export const num = (v: unknown) => { const x = Number(v); return Number.isFinite(x) ? x : 0; };
const pad = (n: number) => String(n).padStart(2, '0');
export const ymd = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const shift = (d: string, n: number) => { const x = new Date(`${d}T12:00`); x.setDate(x.getDate() + n); return ymd(x); };
const parseDT = (d?: string, t?: string) => { if (!d) return null; const v = new Date(`${d}T${t && t.length ? t : '00:00'}`); return isNaN(v.getTime()) ? null : v.getTime(); };
export const natural = (a: unknown, b: unknown) => String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: 'base' });
export const pct = (u: number, c: number) => c ? Math.round(100 * u / c) : 0;
export const sum = (a: number[]) => a.reduce((n, v) => n + v, 0);

export type RoomIn = { room_no: string; floor?: string; capacity: number };
export type BuildingIn = { name: string; rooms: RoomIn[] };
export type RoomOut = { no: string; key: string; floor: string; cap: number; used: number[]; off?: boolean };
export type BuildingOut = { name: string; rooms: RoomOut[]; byKey: Map<string, RoomOut>; cap: number; used: number[]; unroomed: number[]; extra: Map<string, RoomOut> };
export type Model = { days: string[]; blds: BuildingOut[]; total: { cap: number; used: number[]; unroomed: number[] }; cut: boolean };

export function computeOccupancy(slips: Record<string, any>[], buildings: BuildingIn[], opts: { from: string; to: string; only?: string }, stay: Stay, rooms: Rooms): Model {
    let { from, to } = opts;
    if (from > to) [from, to] = [to, from];
    const days: string[] = [];
    for (let d = from; d <= to && days.length < MAX_DAYS; d = shift(d, 1)) days.push(d);
    const nights = days.map(d => parseDT(d, '22:00')!);
    const blds: BuildingOut[] = buildings.filter(b => !opts.only || b.name === opts.only).map(b => {
        const rs: RoomOut[] = b.rooms.map(r => ({ no: String(r.room_no).trim(), key: rooms.normRoom(r.room_no), floor: String(r.floor || '').trim() || rooms.floorOf(r.room_no), cap: num(r.capacity), used: days.map(() => 0) }))
            .sort((x, y) => natural(x.floor, y.floor) || natural(x.no, y.no));
        return { name: b.name, rooms: rs, byKey: new Map(rs.map(r => [r.key, r])), cap: rs.reduce((n, r) => n + r.cap, 0), used: days.map(() => 0), unroomed: days.map(() => 0), extra: new Map() };
    });
    const byName = new Map(blds.map(b => [b.name, b]));
    for (const s of slips) {
        if (s.deleted) continue;
        const ci = parseDT(s.checkin_date, s.checkin_time), co = stay.slipEnd(s);       // a delayed group: its last room
        if (!ci || !co) continue;
        const on = nights.map(t => ci <= t && t < co);
        if (!on.some(Boolean)) continue;
        const rows = stay.rowsOf(s);                                                    // each room row's own window (core/stay.js)
        if (!rows.length) {
            const b = byName.get(stay.normB(s.building));
            if (!b) continue;
            const beds = (num(s.gents) + num(s.ladies) + num(s.children)) || num(s.total);
            on.forEach((v, i) => { if (v) b.unroomed[i] += stay.isDelayed(s) ? stay.paxAt(s, nights[i]).total : beds; });
            continue;
        }
        for (const w of rows) {
            if (w.block <= 0) continue;                                                 // an Exclusive row blocks the whole room, not just its guests
            const b = byName.get(stay.normB(w.building));                               // the row's own building (Exclusive rows may be elsewhere)
            if (!b) continue;
            let room = b.byKey.get(rooms.normRoom(w.room_no));
            if (!room) {                                                                // a room the slips use that is not active in Rooms & Buildings
                const k = rooms.normRoom(w.room_no);
                room = b.extra.get(k) || { no: w.room_no, key: k, floor: rooms.floorOf(w.room_no), cap: 0, used: days.map(() => 0), off: true };
                b.extra.set(k, room);
            }
            nights.forEach((t, i) => { if (w.start! <= t && t < w.end!) { room!.used[i] += w.block; if (!room!.off) b.used[i] += w.block; } });
        }
    }
    for (const b of blds) b.rooms.push(...[...b.extra.values()].sort((x, y) => natural(x.no, y.no)));
    const total = { cap: blds.reduce((n, b) => n + b.cap, 0), used: days.map((_, i) => blds.reduce((n, b) => n + b.used[i], 0)), unroomed: days.map((_, i) => blds.reduce((n, b) => n + b.unroomed[i], 0)) };
    return { days, blds, total, cut: days.length === MAX_DAYS && days[days.length - 1] < to };
}
