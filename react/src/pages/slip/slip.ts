// Slip: the rules that do not depend on the screen — the room rows, the form → slip record, and the availability check (every room of this slip against the other
// slips in it, at the busiest moment). Moved unchanged from views/slip/view.js so the capacity rules stay exactly as they were: Rooms & Buildings capacity beats
// history, an Exclusive row blocks the whole room, a gents room never takes ladies (new rooms only), and nothing is saved over a room's beds.
import type { CoreModules } from '@/pms/types';

type Slip = Record<string, any>;
export type RoomRow = {
    uid: number; room_no: string; capacity: string; assigned: string; dirty: boolean; gl?: boolean; exclusive?: boolean; building?: string;
    out_date: string; out_time: string; out_status: string;
};
export type Form = {
    sh_no: string; tour_name: string; group_leader: string; building: string; gents: string; ladies: string; children: string; infants: string; total: string;
    checkin_date: string; checkin_time: string; checkout_date: string; checkout_time: string; from_place: string; to_place: string; notes: string;
};
export type Delay = { on: boolean; status: string; note: string; orig: { date: string; time: string } | null };
export const emptyForm = (): Form => ({ sh_no: '', tour_name: '', group_leader: '', building: '', gents: '', ladies: '', children: '', infants: '', total: '', checkin_date: '', checkin_time: '', checkout_date: '', checkout_time: '', from_place: '', to_place: '', notes: '' });
export const emptyDelay = (): Delay => ({ on: false, status: 'tentative', note: '', orig: null });

let uidN = 0;
export const newRow = (data: Slip = {}): RoomRow => {
    const capacity = (data.capacity ?? '') === '' ? '' : String(data.capacity);
    const hasAssigned = data.assigned != null && data.assigned !== '';
    return {
        uid: ++uidN, room_no: data.room_no || '', capacity, assigned: hasAssigned ? String(data.assigned) : capacity, dirty: hasAssigned,   // an explicit assigned value is respected and stops the auto-sync
        ...(data.gl ? { gl: true } : {}), exclusive: !!data.exclusive, building: data.exclusive ? data.building || '' : '',
        out_date: data.out?.date || '', out_time: data.out?.time || '', out_status: data.out_status || 'confirmed',
    };
};
export const cleanRoom = (x: unknown) => String(x ?? '').trim();
export const parseDT = (d?: string, t?: string) => { if (!d) return null; const v = new Date(`${d}T${t && t.length ? t : '00:00'}`); return isNaN(+v) ? null : v; };
export const shValue = (v: unknown) => { const s = String(v ?? '').trim().toUpperCase(); return s === '' ? '' : /^\d+$/.test(s) ? Number(s) : s; };
const pad2 = (n: number) => String(n).padStart(2, '0');
export const holdUntil = (days: number, time: string) => { const d = new Date(); d.setDate(d.getDate() + days); return { date: `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`, time: time || '10:00' }; };

/** The rows as saved: only rows with something in them; a delayed slip's rows carry their own check-out (blank = the slip's). */
export function collectRows(rows: RoomRow[], delayOn: boolean, f: Form) {
    const out: Slip[] = [];
    for (const r of rows) {
        const room_no = r.room_no.trim(), capRaw = r.capacity.trim(), asgRaw = r.assigned.trim();
        if (room_no === '' && capRaw === '' && asgRaw === '') continue;
        const row: Slip = { room_no, capacity: /^\d+$/.test(capRaw) ? Number(capRaw) : '', assigned: /^\d+$/.test(asgRaw) ? Number(asgRaw) : '', ...(r.gl ? { gl: true } : {}) };
        if (r.exclusive) { row.exclusive = true; const b = (r.building || '').trim(); if (b) row.building = b; }   // Exclusive: the whole room is kept; maybe in another building
        if (delayOn) { row.out = { date: r.out_date || f.checkout_date || '', time: r.out_time || f.checkout_time || '' }; row.out_status = r.out_status || 'confirmed'; }
        out.push(row);
    }
    return out;
}

export function formData(f: Form, gents: RoomRow[], ladies: RoomRow[], d: Delay) {
    const rooms = { gents: collectRows(gents, d.on, f), ladies: collectRows(ladies, d.on, f) };
    let { checkout_date, checkout_time } = f;
    let delayed: Slip | null = null;
    if (d.on) {
        // the slip's check-out = the last room to leave (pages that read one check-out stay right)
        const ends = [...rooms.gents, ...rooms.ladies].filter(r => r.out?.date).map(r => `${r.out.date}T${r.out.time || '00:00'}`).sort();
        if (ends.length) [checkout_date, checkout_time] = ends.at(-1)!.split('T');
        delayed = { on: true, status: d.status, note: d.note.trim(), original_checkout: d.orig || { date: checkout_date, time: checkout_time }, updated_at: new Date().toISOString() };
    }
    const n = (v: string) => (v === '' ? '' : Number(v));
    return {
        tour_name: f.tour_name.trim(), group_leader: f.group_leader.trim(), checkin_date: f.checkin_date || '', checkin_time: f.checkin_time || '', checkout_date, checkout_time,
        building: f.building || '', sh_no: shValue(f.sh_no), notes: f.notes.trim(), from_place: f.from_place || '', to_place: f.to_place || '',   // kept even while hidden in Settings
        total: n(f.total), gents: n(f.gents), ladies: n(f.ladies), infants: n(f.infants), children: n(f.children), rooms, delayed, createdAt: new Date().toISOString(),
    };
}

export function formFrom(data: Slip): { form: Form; delay: Delay; gents: RoomRow[]; ladies: RoomRow[] } {
    const s = (v: unknown) => (v == null ? '' : String(v));
    const d = data.delayed && data.delayed.on ? data.delayed : null;
    return {
        form: { sh_no: s(data.sh_no), tour_name: s(data.tour_name), group_leader: s(data.group_leader), building: s(data.building), gents: s(data.gents), ladies: s(data.ladies), children: s(data.children),
            infants: s(data.infants), total: s(data.total), checkin_date: s(data.checkin_date), checkin_time: s(data.checkin_time), checkout_date: s(data.checkout_date), checkout_time: s(data.checkout_time),
            from_place: s(data.from_place), to_place: s(data.to_place), notes: s(data.notes) },
        delay: { on: !!d, status: d?.status || 'tentative', note: d?.note || '', orig: d?.original_checkout || null },
        gents: (data.rooms?.gents || []).map((r: Slip) => newRow(r)), ladies: (data.rooms?.ladies || []).map((r: Slip) => newRow(r)),
    };
}

/** Capacity lookup (most recent per building|room) from the slips. */
export function buildCapacityMap(db: Slip[], buildingFilter: string) {
    const cap = new Map<string, number>();
    for (const r of [...db].sort((a, b) => (a.createdAt > b.createdAt ? -1 : 1))) {
        for (const side of ['gents', 'ladies']) (r.rooms?.[side] || []).forEach((x: Slip) => {
            const b = String(x.building || r.building || '').trim();                 // an Exclusive row can be in another building
            if (buildingFilter && b !== buildingFilter) return;
            const key = `${b}|${cleanRoom(x.room_no)}`;
            const c = (x.capacity === '' || x.capacity == null) ? null : Number(x.capacity);
            if (!cap.has(key) && c != null) cap.set(key, c);
        });
    }
    return cap;
}

type Env = { db: Slip[]; buildings: any[]; currentId: number | null; loadedRooms: Set<string>; stay: CoreModules['stay']; rooms: CoreModules['rooms']; delayOn: boolean; copy: Slip };

/** Every room of this slip against the other slips in it: { pass, okRooms, issues, building, start, end, own, blocked }. */
export function checkAvailability(f: Form, gents: RoomRow[], ladies: RoomRow[], env: Env) {
    const { db: DB, buildings: B, currentId, loadedRooms } = env, copy = env.copy;
    const stay = env.stay as any, R = env.rooms as any;
    const normB = stay.normB as (s: unknown) => string;
    const bld = (f.building || '').trim();
    const ci = parseDT(f.checkin_date, f.checkin_time), co = parseDT(f.checkout_date, f.checkout_time);
    if (!bld || !ci || !co || co <= ci) return { pass: false, okRooms: [] as Slip[], issues: [{ kind: 'window', missing: [!bld && 'building', !ci && 'check-in', !co && 'check-out', ci && co && co <= ci && 'check-out not after check-in'].filter(Boolean) }] as Slip[], building: bld, copy, own: [] as Slip[], blocked: new Set<string>(), start: 0, end: 0 };
    const issues: Slip[] = [], okRooms: Slip[] = [];
    const roomKey = (side: string, room: string, building: string) => `${side}|${R.normRoom(room)}|${normB(building)}`;
    const roomType = (building: string, room: string) => R.findBuilding(B, building)?.rooms?.find((r: Slip) => R.normRoom(r.room_no) === R.normRoom(room))?.type || '';

    // This slip's rows: each row is a window (delayed departures give rows their own check-out). A row is in the slip's building unless it is an Exclusive row
    // given its own; an Exclusive row keeps the whole room.
    const own: Slip[] = [];
    const capLocalOf = new Map<string, number>();
    const keyOf = (building: string, room: string) => `${normB(building)}|${room}`;
    for (const side of ['gents', 'ladies'] as const) for (const r of collectRows(side === 'gents' ? gents : ladies, env.delayOn, f)) {
        const room = cleanRoom(r.room_no);
        if (!room) continue;
        const building = (r.building || '').trim() || bld;
        const beds = Number.isFinite(+r.assigned) ? +r.assigned : 0;
        const end = (r.out && parseDT(r.out.date, r.out.time)) || co;
        if (end <= ci) { issues.push({ kind: 'badtime', room, out: r.out }); continue; }
        own.push({ room, building, key: keyOf(building, room), side, start: +ci, end: +end, beds, excl: !!r.exclusive, cap_row: Number(r.capacity) || null });
        // a gents room never takes ladies and a ladies room never takes gents (Rooms & Buildings → type); family / any take both
        const typ = roomType(building, room);
        if ((typ === 'gents' || typ === 'ladies') && typ !== side && !loadedRooms.has(roomKey(side, room, building))) issues.push({ kind: 'roomtype', room, side, type: typ, ...(normB(building) === normB(bld) ? {} : { building }) });
        if (!capLocalOf.get(keyOf(building, room)) && Number.isFinite(+r.capacity) && +r.capacity > 0) capLocalOf.set(keyOf(building, room), +r.capacity);
    }
    const uniqKeys = [...new Set(own.map(o => o.key))];
    const lastEnd = Math.max(+co, ...own.map(o => o.end));

    // Other slips' windows in the same rooms (their own per-row check-outs count too; an Exclusive row keeps its whole room)
    const others = new Map<string, Slip[]>(uniqKeys.map(k => [k, []]));
    for (const r of DB) {
        if (currentId && r.id === currentId) continue;   // ignore self
        for (const w of stay.rowsOf(r) as Slip[]) {
            const key = keyOf(w.building, cleanRoom(w.room_no));
            if (!others.has(key) || !w.start || !w.end || w.block <= 0) continue;
            if (!(w.start < lastEnd && w.end > +ci)) continue;
            others.get(key)!.push({ start: w.start, end: w.end, beds: w.block, pax: w.beds, excl: w.exclusive, sh: r.sh_no, id: r.id, status: w.status, ums: !!r.ums });
        }
    }

    // Capacity from the current row first, then Rooms & Buildings, then last-known from history (capSource keeps which one was used and what the others said — a row
    // capacity that disagrees with Rooms & Buildings is a common reason for a surprise "over its beds")
    const capSource = new Map<string, Slip>();
    function resolveCapacity(building: string, room: string): number {
        const key = keyOf(building, room);
        const local = capLocalOf.get(key) || 0;
        const fromBuilder = R.builderCapacity(B, building, room);
        const src: Slip = { row: local || null, builder: fromBuilder ?? null, used: null };
        capSource.set(key, src);
        if (local > 0) { src.used = 'row'; return local; }
        if (fromBuilder > 0) { src.used = 'builder'; return fromBuilder; }
        for (let i = DB.length - 1; i >= 0; i--) {
            const rec = DB[i];
            const arr = [...(rec.rooms?.gents || []), ...(rec.rooms?.ladies || [])].filter((z: Slip) => normB(z.building || rec.building) === normB(building));
            const hit = arr.find((z: Slip) => cleanRoom(z.room_no) === room);
            const histCap = Number.isFinite(+hit?.capacity) ? +hit.capacity : 0;
            if (histCap > 0) { src.used = 'history'; src.history = histCap; src.history_slip = rec.id; return histCap; }
        }
        return 0;   // unknown
    }

    // Per room: the busiest moment while this group is in it — other groups there then + this group's beds then
    const blocked = new Set<string>();
    for (const key of uniqKeys) {
        const mine = own.filter(o => o.key === key), theirs = others.get(key)!;
        const room = mine[0].room, building = mine[0].building;
        const cap = resolveCapacity(building, room);
        const where = normB(building) === normB(bld) ? {} : { building };      // an Exclusive row in another building says which
        if (!cap) { blocked.add(room); issues.push({ kind: 'nocap', room, ...where, excl: mine.some(o => o.excl), cap_source: capSource.get(key) }); continue; }
        const times = new Set<number>([...mine.map(o => o.start), ...theirs.map(e => e.start)]);
        let worst: Slip = { total: -1, existing: 0, want: 0, t: null, who: [] };
        for (const t of times) {
            // beds this group keeps then: its guests' beds, or the whole room for an Exclusive row
            const want = mine.filter(o => o.start <= t && t < o.end).reduce((s, o) => s + (o.excl ? Math.max(cap, o.beds) : o.beds), 0);
            if (!want) continue;
            const here = theirs.filter(e => e.start <= t && t < e.end);
            const existing = here.reduce((s, e) => s + e.beds, 0);
            if (existing + want > worst.total) worst = { total: existing + want, existing, want, t, who: here };
        }
        if (worst.total < 0) continue;
        const excl = mine.some(o => o.excl);
        if (worst.total <= cap) okRooms.push({ room, ...where, before: worst.existing, after: worst.total, cap, excl, cap_source: capSource.get(key) });
        else { blocked.add(room); issues.push({ kind: 'blocked', room, ...where, excl, at: worst.t, cap, existing: worst.existing, want: worst.want, total: worst.total, who: worst.who, cap_source: capSource.get(key), others: theirs }); }
    }
    return { pass: !issues.length, okRooms, issues, building: bld, start: +ci, end: lastEnd, copy, own, blocked };
}
export type Availability = ReturnType<typeof checkAvailability>;

/** Split by comma, slash, asterisk, dash, dot, any whitespace; de-duplicated case-insensitively, order kept. */
export function bulkParse(str: string): string[] {
    if (!str) return [];
    const out: string[] = [], seen = new Set<string>();
    for (const r of str.split(/[,\s/*\-.]+/).map(s => s.trim()).filter(Boolean)) { const k = r.toLowerCase(); if (!seen.has(k)) { seen.add(k); out.push(r); } }
    return out;
}
