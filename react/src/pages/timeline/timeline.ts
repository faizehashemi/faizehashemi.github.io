// Room Timeline as a grid: one row per room of a building (more rows only when groups really share a room at the same time), one column per time
// cell (a day, 12 h, 6 h …). A stay is a coloured block that names the tour operator, the group leader and the pax of that group in that room.
// Times are exact: a group leaving at 08:00 and the next arriving at 12:00 the same day do NOT overlap — they stay on one line, and the beds in
// use are counted from the real times, never per cell. When such stays touch the same cell, that room's cells are split (½, ⅓, ¼ … down to an
// hour) until each stay has pieces of its own; the split shows as fine lines inside the cells.
// The rooms come from Rooms & Buildings (with their beds) plus any room a slip uses; the stays from the slips, each room row with its own window
// (a delayed group's rooms leave on their own dates — core/stay.js rowsOf).
type Row = Record<string, any>;

export type Stay = {
    key: string; slipId: number; sh: string; tour: string; gl: string; pax: number; groupPax: number; sides: string; excl: boolean;
    start: number; end: number; s0: number; s1: number; color: string;   // s0 / s1: first and last piece in the room's split cells
};
export type RoomLine = { room: string; floor: string; capacity: number | null; lanes: Stay[][]; peak: number; split: number; hidden: number };   // hidden: overlapping stays past MAX_LANES (not drawn)
export type Grid = { cells: number[]; step: number; rooms: RoomLine[]; groups: number; tooMany: boolean };
type Libs = { rowsOf: (s: Row) => Row[]; normB: (b: string) => string; floorOf: (room: string) => string };

const natural = (a: string, b: string) => a.localeCompare(b, undefined, { numeric: true });
export const MAX_CELLS = 600;
/** how finely a room's cells may be split, in pieces per cell (never finer than an hour) */
export const SPLITS = [1, 2, 3, 4, 6, 8, 12, 24];
// Guardrails, so bad data (e.g. dozens of groups booked into one room at once) can never blow the page up: splitting only separates stays
// that FOLLOW each other on a line (real overlaps go to separate lines, never to finer splitting), it stops at an hour, a row never has more
// than MAX_PIECES pieces, and a room shows at most MAX_LANES overlapping lines (the rest are counted, not drawn).
export const MAX_PIECES = 4000, MAX_LANES = 8;
// soft, readable colours; a group keeps its colour wherever it appears
const PALETTE = ['#f7d58b', '#a8d8b9', '#9ec9f0', '#f4b6c2', '#c9b6f2', '#f6c29b', '#b5e0e6', '#dcd59a', '#e9b8e0', '#bcd99a', '#f2a7a0', '#a9c4e8'];
export const colorOf = (sh: string) => { let h = 0; for (const ch of String(sh)) h = (h * 31 + ch.charCodeAt(0)) >>> 0; return PALETTE[h % PALETTE.length]; };
const groupPaxOf = (s: Row) => Number(s.total) || ['gents', 'ladies', 'children', 'infants'].reduce((n, k) => n + (Number(s[k]) || 0), 0);

/** the most beds in use at one moment, from the exact times (a check-out at 08:00 frees the beds before a 12:00 check-in) */
export function peakBeds(stays: { start: number; end: number; pax: number }[]) {
    const ev = stays.flatMap(s => [[s.start, s.pax], [s.end, -s.pax]] as [number, number][]).sort((a, b) => a[0] - b[0] || a[1] - b[1]);   // leaving before arriving at the same minute
    let now = 0, peak = 0;
    for (const [, d] of ev) { now += d; peak = Math.max(peak, now); }
    return peak;
}

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
                sides: side, excl: !!w.exclusive, start: w.start, end: w.end, s0: 0, s1: 0, color: colorOf(String(s.sh_no ?? s.id)),
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
            // lines by the exact times: one leaving at 08:00 and one arriving at 12:00 share a line; only a real overlap opens another
            const lanes: Stay[][] = [];
            let hidden = 0;
            for (const st of [...stays].sort((a, b) => a.start - b.start || a.end - b.end)) {
                const lane = lanes.find(l => l[l.length - 1].end <= st.start);
                if (lane) lane.push(st); else if (lanes.length < MAX_LANES) lanes.push([st]); else hidden++;
            }
            // split this room's cells until stays next to each other on a line no longer share a piece (an hour at the finest)
            const pieceOf = (k: number) => {
                const sub = step / k, last = n * k - 1;
                return (st: Stay) => [Math.max(0, Math.floor((st.start - from) / sub)), Math.min(last, Math.ceil((st.end - from) / sub) - 1)];
            };
            const allowed = SPLITS.filter(k => step / k >= 3600e3 && n * k <= MAX_PIECES);
            if (!allowed.length) allowed.push(1);
            let split = allowed[allowed.length - 1];
            for (const k of allowed) {
                const p = pieceOf(k);
                if (lanes.every(l => l.every((st, i) => i === 0 || p(l[i - 1])[1] < p(st)[0]))) { split = k; break; }
            }
            const p = pieceOf(split);
            for (const st of stays) [st.s0, st.s1] = p(st);
            // even an hour may not separate a hand-over inside one hour (out 11:20, in 11:40): nudge the later stay one piece on, never overlapping
            const lastPiece = n * split - 1;
            for (const l of lanes) for (let i = 1; i < l.length; i++) {
                if (l[i].s0 <= l[i - 1].s1) { l[i].s0 = Math.min(lastPiece, l[i - 1].s1 + 1); if (l[i].s1 < l[i].s0) l[i].s1 = l[i].s0; }
            }
            return { room: rm, floor: String(libs.floorOf(rm) ?? ''), capacity: cap.get(rm) ?? null, lanes, peak: peakBeds(stays), split, hidden };
        });
    const groups = new Set(rooms.flatMap(r => r.lanes.flat().map(st => st.slipId))).size;
    return { cells, step, rooms, groups, tooMany: false };
}

/** the label written across a stay */
export const stayLabel = (st: Stay) => (st.excl ? '🔒 ' : '') + [st.tour || `SH ${st.sh}`, st.gl, `${st.pax}${st.groupPax > st.pax ? `/${st.groupPax}` : ''} pax`].filter(Boolean).join(' · ');
/** "12 h pieces", "3 h pieces" … for a room whose cells are split */
export const splitText = (split: number, stepH: number) => {
    if (split <= 1) return '';
    const h = stepH / split;
    return h >= 1 && Number.isInteger(h) ? `${h} h pieces` : `split in ${split}`;
};
