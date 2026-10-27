// Grid (Rooms): one building as floors × columns at a chosen moment — who is in each room, beds used / beds, when the first one leaves, or when the next group
// arrives. Moved unchanged from pms/app/views/grid/view.js. The rooms come from Rooms & Buildings (active rooms, on the floor set there, with their bed counts);
// a room a slip uses at the chosen time but that is not active there still shows, marked, so no guest drops off the grid. Only a building the builder has
// no rooms for falls back to the rooms named on its slips.
import type { CoreModules } from '@/pms/types';

type Slip = Record<string, any>;
type Stay = Pick<CoreModules['stay'], 'rowsOf' | 'normB' | 'slipTouches'>;
type Rooms = Pick<CoreModules['rooms'], 'findBuilding'>;

export const parseDT = (d?: string, t?: string) => { if (!d) return null; const v = new Date(`${d}T${t && t.length ? t : '00:00'}`); return isNaN(v.getTime()) ? null : v; };
export const fmtDT = (dt: Date) => { try { return dt.toLocaleString([], { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' }); } catch { return dt.toISOString().slice(5, 16).replace('T', ' '); } };
const cleanRoom = (x: unknown) => String(x ?? '').trim();
export const normRoom = (x: unknown) => cleanRoom(x).replace(/\s+/g, '').toUpperCase();
const overlapsIn = (when: Date, ci: number, co: number) => +when >= ci && +when < co;

/** floor/column from a room token like 1203A -> floor 12, col 03A */
export function parseRoomToken(room: string) {
    const r = normRoom(room);
    const m = r.match(/^(\d+)([A-Z]*)$/i);
    if (!m) return { floor: '?', col: r };
    const digits = m[1], suf = m[2] || '';
    if (digits.length <= 2) return { floor: '0', col: digits + suf };
    return { floor: digits.slice(0, -2), col: digits.slice(-2) + suf };
}

export type Cell =
    | { kind: 'none' }
    | { kind: 'occ'; cap: string; meta: string; under: boolean; off: boolean; room: string }
    | { kind: 'vacant'; cap: string; meta: string };
export type Matrix = { building: string; flist: string[]; clist: string[]; cells: Map<string, Cell>; offCount: number; slipCount: number };

export function buildMatrix(slips: Slip[], builders: any[], building: string, when: Date, stay: Stay, rooms: Rooms): Matrix {
    const b = (building || '').trim();
    const roomsFromSlip = (rec: Slip, bb?: string) => {
        const mine = (x: any) => !bb || stay.normB(x.building || rec.building) === stay.normB(bb);
        const g = (rec.rooms?.gents || []).filter(mine).map((x: any) => normRoom(x.room_no ?? x));
        const l = (rec.rooms?.ladies || []).filter(mine).map((x: any) => normRoom(x.room_no ?? x));
        return [...g, ...l].filter(Boolean);
    };

    // the building's rooms: Rooms & Buildings first, slips only where the builder knows nothing
    const builder: any[] = rooms.findBuilding(builders, b)?.rooms || [];
    const roomMap = new Map<string, { floor: string; offList: boolean }>();
    for (const r of builder) { const k = normRoom(r.room_no); if (k && r.active !== false) roomMap.set(k, { floor: String(r.floor || '').trim() || parseRoomToken(k).floor, offList: false }); }
    const useBuilder = roomMap.size > 0;
    for (const r of slips) {
        if (!stay.slipTouches(r, b)) continue;
        if (useBuilder && !(stay.rowsOf(r) as any[]).some(w => stay.normB(w.building) === stay.normB(b) && w.start && w.end && overlapsIn(when, w.start, w.end))) continue;   // only rooms someone is in at the chosen time
        for (const k of roomsFromSlip(r, b)) {
            if (roomMap.has(k)) continue;
            const inactive = builder.find(x => normRoom(x.room_no) === k);
            roomMap.set(k, { floor: String(inactive?.floor || '').trim() || parseRoomToken(k).floor, offList: useBuilder });
        }
    }
    const floors = new Map<string, Set<string>>(), cellToRoom = new Map<string, string>(), offList = new Set<string>();
    for (const [room, info] of roomMap) {
        const { col } = parseRoomToken(room);
        if (!floors.has(info.floor)) floors.set(info.floor, new Set());
        floors.get(info.floor)!.add(col);
        cellToRoom.set(`${info.floor}|${col}`, room);
        if (info.offList) offList.add(room);
    }
    // lettered floors (G, M…) before the numbered ones, then in order
    const flist = [...floors.keys()].sort((a, c) => (Number(/^\d/.test(a)) - Number(/^\d/.test(c))) || a.localeCompare(c, undefined, { numeric: true, sensitivity: 'base' }));
    const allCols = new Set<string>(); flist.forEach(f => floors.get(f)!.forEach(c => allCols.add(c)));
    const clist = [...allCols].sort((a, c) => { const an = parseInt(a, 10), bn = parseInt(c, 10); if (!isNaN(an) && !isNaN(bn) && an !== bn) return an - bn; return a.localeCompare(c, undefined, { numeric: true, sensitivity: 'base' }); });

    // index of this building's slips by room, built once per draw (rooms × slips work otherwise)
    const rowsBy = new Map<string, { rec: Slip; ws: any[] }[]>(), slipsBy = new Map<string, Slip[]>(), ciOf = new Map<Slip, Date | null>();
    for (const r of slips) {
        if (!stay.slipTouches(r, b)) continue;
        const mine = new Map<string, any[]>();
        for (const w of stay.rowsOf(r) as any[]) { if (stay.normB(w.building) !== stay.normB(b)) continue; const k = normRoom(w.room_no); if (!mine.has(k)) mine.set(k, []); mine.get(k)!.push(w); }
        for (const [k, ws] of mine) { if (!rowsBy.has(k)) rowsBy.set(k, []); rowsBy.get(k)!.push({ rec: r, ws }); }
        for (const k of roomsFromSlip(r, b)) { if (!slipsBy.has(k)) slipsBy.set(k, []); slipsBy.get(k)!.push(r); }
        ciOf.set(r, parseDT(r.checkin_date, r.checkin_time));
    }
    const hereNow = (ws: any[]) => ws.filter(w => w.start && w.end && overlapsIn(when, w.start, w.end));

    // capacity per physical room (latest non-null wins; Rooms & Buildings wins over the slips)
    const cap = new Map<string, number | null>();
    for (const r of [...slips].sort((x, y) => (x.createdAt > y.createdAt ? -1 : 1))) {
        if (!stay.slipTouches(r, b)) continue;
        for (const side of ['gents', 'ladies']) for (const it of (r.rooms?.[side] || [])) {
            if (stay.normB(it.building || r.building) !== stay.normB(b)) continue;
            const rn = normRoom(it.room_no ?? it), c = (it.capacity === '' || it.capacity == null) ? null : Number(it.capacity);
            if (!cap.has(rn) && c != null) cap.set(rn, c);
        }
    }
    for (const r of builder) cap.set(normRoom(r.room_no), r.capacity);

    const summarizeSH = (list: string[], max = 3) => { const u = [...new Set(list)]; return u.length <= max ? u.join(', ') : u.slice(0, max).join(', ') + ` (+${u.length - max})`; };
    const cells = new Map<string, Cell>();
    for (const floor of flist) for (const col of clist) {
        const key = `${floor}|${col}`, roomNorm = cellToRoom.get(key);
        if (!roomNorm) { cells.set(key, { kind: 'none' }); continue; }
        const active = (rowsBy.get(roomNorm) || []).filter(e => hereNow(e.ws).length);
        const capVal = cap.get(roomNorm) ?? null;
        if (active.length) {
            let assigned = 0, blocked = 0, excl = false; const shNos: string[] = [], coTimes: number[] = [];
            for (const e of active) {
                const here = hereNow(e.ws);
                assigned += here.reduce((s, w) => s + (Number(w.row.assigned ?? w.row.pax ?? w.row.count ?? 0) || 0), 0);
                blocked += here.reduce((s, w) => s + w.block, 0);                  // beds kept: the whole room for an Exclusive row
                if (here.some(w => w.exclusive)) excl = true;
                if (e.rec.sh_no != null) shNos.push(String(e.rec.sh_no));
                for (const w of here) coTimes.push(w.end);
            }
            const cv = capVal != null && !Number.isNaN(capVal) ? capVal : null;
            const asg = Number.isFinite(assigned) ? assigned : 0, blk = Number.isFinite(blocked) ? blocked : asg;
            const under = cv != null && blk < cv;       // an Exclusive row keeps the whole room: it is not "under" even when fewer guests are in it
            const vac = cv != null ? Math.max(0, cv - blk) : null;
            cells.set(key, { kind: 'occ', room: roomNorm, off: offList.has(roomNorm), under,
                cap: `${cv != null ? `${asg}/${cv}` : `${asg}/—`}${excl ? ' · Excl.' : ''}${under && vac != null ? ' · Vac ' + vac : ''}`,
                meta: `SH ${shNos.length ? summarizeSH(shNos) : '—'} • Out ${coTimes.length ? fmtDT(new Date(Math.min(...coTimes))) : '—'}` });
        } else {
            let next: Slip | null = null, nextAt: Date | null = null;
            for (const r of slipsBy.get(roomNorm) || []) { const at = ciOf.get(r); if (!at || !(+at > +when)) continue; if (!next || +at < +nextAt!) { next = r; nextAt = at; } }
            const nsh = next ? (next.sh_no ?? '') : '';
            cells.set(key, { kind: 'vacant', cap: capVal != null ? String(capVal) : '—', meta: next ? `Vacant • Next ${fmtDT(nextAt!)}${nsh ? ' • SH ' + nsh : ''}` : 'Vacant' });
        }
    }
    return { building: b, flist, clist, cells, offCount: offList.size, slipCount: slips.length };
}
