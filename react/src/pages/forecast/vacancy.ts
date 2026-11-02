// Vacancy forecast between two moments: for every room of the chosen buildings, its beds, the most beds in use at any one time in that period
// and so the beds still free for the whole period. Rooms and beds come from Rooms & Buildings (a building it does not know yet falls back to the
// rooms the slips use); stays from the slips, each room row with its own window (core/stay.js rowsOf; an Exclusive row keeps the whole room).
type Row = Record<string, any>;
type Libs = { rowsOf: (s: Row) => Row[]; normB: (b: string) => string; activeRooms: (b: string) => Row[] };

export type VacRow = { building: string; room: string; capacity: number | null; used: number; free: number | null; groups: string };
export type Vacancy = { rows: VacRow[]; rooms: number; vacant: number; withSpace: number; full: number; freeBeds: number };

const natural = (a: string, b: string) => a.localeCompare(b, undefined, { numeric: true });
const roomKey = (r: unknown) => String(r ?? '').trim().toUpperCase().replace(/\s+/g, '');

/** the most beds in use at one moment inside [from, to) — a check-out frees its beds before a check-in at the same minute */
export function peakIn(stays: { start: number; end: number; beds: number }[], from: number, to: number) {
    const ev = stays.filter(s => s.start < to && s.end > from)
        .flatMap(s => [[Math.max(s.start, from), s.beds], [Math.min(s.end, to), -s.beds]] as [number, number][])
        .sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    let now = 0, peak = 0;
    for (const [, d] of ev) { now += d; peak = Math.max(peak, now); }
    return peak;
}

export function vacancy({ slips, buildings, from, to, libs }: { slips: Row[]; buildings: string[]; from: number; to: number; libs: Libs }): Vacancy {
    const rows: VacRow[] = [];
    for (const bld of buildings) {
        const B = libs.normB(bld);
        const stays = new Map<string, { start: number; end: number; beds: number; label: string }[]>();
        for (const s of slips) {
            if (s.deleted) continue;
            for (const w of libs.rowsOf(s)) {
                if (libs.normB(w.building) !== B || !(w.end > from) || !(w.start < to) || !(Number(w.block) > 0)) continue;
                const k = roomKey(w.room_no);
                if (!stays.has(k)) stays.set(k, []);
                stays.get(k)!.push({ start: w.start, end: w.end, beds: Number(w.block), label: [s.sh_no, s.tour_name || s.group_leader].filter(Boolean).join(' ') });
            }
        }
        const setUp = libs.activeRooms(bld);
        const rooms = new Map<string, number | null>(setUp.map(r => [roomKey(r.room_no), Number(r.capacity) > 0 ? Number(r.capacity) : null]));
        if (!setUp.length) for (const k of stays.keys()) rooms.set(k, null);   // a building not in Rooms & Buildings: the rooms the slips use
        for (const [room, capacity] of rooms) {
            const st = stays.get(room) || [];
            const used = peakIn(st, from, to);
            rows.push({ building: bld, room, capacity, used, free: capacity == null ? null : Math.max(0, capacity - used), groups: [...new Set(st.map(x => x.label))].join(', ') });
        }
    }
    rows.sort((a, b) => natural(a.building, b.building) || natural(a.room, b.room));
    return {
        rows, rooms: rows.length,
        vacant: rows.filter(r => r.used === 0).length,
        withSpace: rows.filter(r => r.used > 0 && (r.free ?? 0) > 0).length,
        full: rows.filter(r => r.used > 0 && r.free === 0).length,
        freeBeds: rows.reduce((n, r) => n + (r.free ?? 0), 0),
    };
}
