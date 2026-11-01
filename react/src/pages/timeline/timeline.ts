// Room Timeline as a grid: one row per room of a building (more rows when groups share a room at the same time), one column per time cell
// (a day, 12 h, 6 h …). A stay fills the cells it covers as one coloured block that names the tour operator, the group leader and the pax
// of that group in that room. The rooms come from Rooms & Buildings (with their beds) plus any room a slip uses; the stays from the slips,
// each room row with its own window (a delayed group's rooms leave on their own dates — core/stay.js rowsOf).
type Row = Record<string, any>;

export type Stay = {
    key: string; slipId: number; sh: string; tour: string; gl: string; pax: number; groupPax: number; sides: string; excl: boolean;
    start: number; end: number; c0: number; c1: number; color: string;
};
export type RoomLine = { room: string; floor: string; capacity: number | null; lanes: Stay[][]; peak: number };
export type Grid = { cells: number[]; step: number; rooms: RoomLine[]; groups: number; tooMany: boolean };
type Libs = { rowsOf: (s: Row) => Row[]; normB: (b: string) => string; floorOf: (room: string) => string };

const natural = (a: string, b: string) => a.localeCompare(b, undefined, { numeric: true });
export const MAX_CELLS = 600;
// soft, readable colours; a group keeps its colour wherever it appears
const PALETTE = ['#f7d58b', '#a8d8b9', '#9ec9f0', '#f4b6c2', '#c9b6f2', '#f6c29b', '#b5e0e6', '#dcd59a', '#e9b8e0', '#bcd99a', '#f2a7a0', '#a9c4e8'];
export const colorOf = (sh: string) => { let h = 0; for (const ch of String(sh)) h = (h * 31 + ch.charCodeAt(0)) >>> 0; return PALETTE[h % PALETTE.length]; };
const groupPaxOf = (s: Row) => Number(s.total) || ['gents', 'ladies', 'children', 'infants'].reduce((n, k) => n + (Number(s[k]) || 0), 0);

/** the grid for one building between from and to (ms), cells of stepH hours; optional room / floor filter */
export function buildGrid({ slips, building, roomsSetUp, from, to, stepH, room, floor, libs }: {
    slips: Row[]; building: string; roomsSetUp: { room_no: string; capacity?: number }[]; from: number; to: number; stepH: number; room?: string; floor?: string; libs: Libs;
}): Grid {
    const step = Math.max(1, stepH) * 3600e3;
    const n = Math.ceil((to - from) / step);
    if (!(n > 0)) return { cells: [], step, rooms: [], groups: 0, tooMany: false };
    if (n > MAX_CELLS) return { cells: [], step, rooms: [], groups: 0, tooMany: true };
    const cells = Array.from({ length: n }, (_, i) => from + i * step);
    const B = libs.normB(building);
    const cap = new Map(roomsSetUp.map(r => [String(r.room_no).trim().toUpperCase(), r.capacity ?? null]));
    const byRoom = new Map<string, Stay[]>();
    for (const r of roomsSetUp) byRoom.set(String(r.room_no).trim().toUpperCase(), []);
    for (const s of slips) {
        if (s.deleted) continue;
        // a group's gents and ladies rows in the same room over the same window are one block (pax added up)
        const merged = new Map<string, Stay>();
        for (const w of libs.rowsOf(s)) {
            if (libs.normB(w.building) !== B || !w.start || !w.end || !(w.end > w.start) || !(Number(w.row?.assigned) > 0)) continue;
            if (w.end <= from || w.start >= to) continue;
            const rm = String(w.room_no).trim().toUpperCase(), k = `${rm}|${w.start}|${w.end}`;
            const pax = Number(w.row.assigned) || 0, side = w.side === 'ladies' ? 'L' : 'G';
            const got = merged.get(k);
            if (got) { got.pax += pax; if (!got.sides.includes(side)) got.sides += side; got.excl = got.excl || !!w.exclusive; continue; }
            merged.set(k, {
                key: `${s.id}|${k}`, slipId: s.id, sh: String(s.sh_no ?? ''), tour: String(s.tour_name || '').trim(), gl: String(s.group_leader || '').trim(), pax, groupPax: groupPaxOf(s),
                sides: side, excl: !!w.exclusive, start: w.start, end: w.end,
                c0: Math.max(0, Math.floor((w.start - from) / step)), c1: Math.min(n - 1, Math.ceil((w.end - from) / step) - 1), color: colorOf(String(s.sh_no ?? s.id)),
            });
            if (!byRoom.has(rm)) byRoom.set(rm, []);
        }
        for (const [k, st] of merged) byRoom.get(k.split('|')[0])!.push(st);
    }
    const wantRoom = String(room || '').trim().toUpperCase(), wantFloor = String(floor || '').trim();
    const rooms: RoomLine[] = [...byRoom.entries()]
        .filter(([rm]) => (!wantRoom || rm === wantRoom) && (!wantFloor || String(libs.floorOf(rm)) === wantFloor))
        .sort((a, b) => natural(a[0], b[0]))
        .map(([rm, stays]) => {
            // groups sharing the room at the same time go on separate lines
            const lanes: Stay[][] = [];
            for (const st of [...stays].sort((a, b) => a.c0 - b.c0 || a.start - b.start)) {
                const lane = lanes.find(l => l[l.length - 1].c1 < st.c0);
                if (lane) lane.push(st); else lanes.push([st]);
            }
            // the most beds in use at once (per cell)
            let peak = 0;
            for (let c = 0; c < n; c++) peak = Math.max(peak, stays.filter(st => st.c0 <= c && c <= st.c1).reduce((m, st) => m + st.pax, 0));
            return { room: rm, floor: String(libs.floorOf(rm) ?? ''), capacity: cap.get(rm) ?? null, lanes, peak };
        });
    const groups = new Set(rooms.flatMap(r => r.lanes.flat().map(st => st.slipId))).size;
    return { cells, step, rooms, groups, tooMany: false };
}

/** the label written across a stay's cells */
export const stayLabel = (st: Stay) => (st.excl ? '🔒 ' : '') + [st.tour || `SH ${st.sh}`, st.gl, `${st.pax}${st.groupPax > st.pax ? `/${st.groupPax}` : ''} pax`].filter(Boolean).join(' · ');
