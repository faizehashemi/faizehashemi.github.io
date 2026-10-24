// Stays with per-room check-out windows (delayed departures).
//
// A slip normally has one check-out for everybody. When a group's departure is delayed (slip.delayed.on), each room
// row may carry its own end: rooms.gents[i].out = { date, time } with out_status 'confirmed' | 'tentative' | 'unknown'.
// A room can appear in several rows (e.g. 2 of its 4 beds leave on the 14th, 2 stay) — pax-level windows inside one
// slip. Rows without `out` end at the slip's check-out. Every page that asks "who is here when" uses these helpers,
// so rooms, meals, counts and check-outs agree.
//
//   rowsOf(slip)        [{ side, room_no, beds, block, building, exclusive, start, end, status }]  (ms timestamps;
//                       beds = guests in the room (assigned, else capacity) — what pax counts use;
//                       block = beds the room is kept for — what occupancy and availability use: an EXCLUSIVE row
//                       (couple / single room) blocks the whole room capacity while only `beds` guests are in it;
//                       building = the row's own building (exclusive rows may sit in another building) else the slip's)
//   slipStart / slipEnd (ms) — slipEnd is the latest row end (or the slip check-out)
//   isDelayed(slip)
//   presentAt(slip, t)  true while any part of the group is in house at t
//   paxAt(slip, t)      { gents, ladies, children, infants, total } present at t (rows still there; ladies' rows hold
//                       ladies + children in proportion; infants stay until the last row leaves)
//   departuresOf(slip)  [{ at, rooms:[{side, room_no, beds}], beds, pax:{…}, status }] — one per distinct end
//   effectiveCheckout(slip) { date, time } of slipEnd (what slip.checkout_* should hold)

const num = (v) => { const x = Number(v); return Number.isFinite(x) ? x : 0; };
const pad = (n) => String(n).padStart(2, '0');
export const parseDT = (d, t) => { if (!d) return null; const v = new Date(`${d}T${t && t.length ? t : '00:00'}`); return isNaN(v) ? null : v.getTime(); };
const toDT = (ms) => { const d = new Date(ms); return { date: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`, time: `${pad(d.getHours())}:${pad(d.getMinutes())}` }; };

export const isDelayed = (s) => !!(s && s.delayed && s.delayed.on);
export const slipStart = (s) => parseDT(s.checkin_date, s.checkin_time);
const baseEnd = (s) => parseDT(s.checkout_date, s.checkout_time);
const rowBeds = (x) => x.assigned !== '' && x.assigned != null ? num(x.assigned) : num(x.capacity);
/** Beds a row keeps for itself: the whole room for an Exclusive row (at least the guests in it), else the guests' beds. */
export const rowBlocks = (x) => x && x.exclusive ? Math.max(num(x.capacity), rowBeds(x)) : rowBeds(x);
/** A building name for comparing: trimmed, upper case. */
export const normB = (b) => String(b == null ? '' : b).trim().toUpperCase();
/** The building a room row is in: its own (Exclusive rows may be given another building) or the slip's. */
export const rowBuilding = (s, x) => String((x && x.building) || '').trim() || String((s && s.building) || '').trim();
/** Does the slip have a room row in this building? (the slip's building, or an Exclusive row's own) */
export const slipTouches = (s, building) => {
    const b = normB(building);
    if (normB(s.building) === b) return true;
    for (const side of ['gents', 'ladies']) for (const x of s.rooms?.[side] || []) if (x && x.building && normB(x.building) === b) return true;
    return false;
};

/** Room rows with their own windows. */
export function rowsOf(s) {
    const start = slipStart(s), end0 = baseEnd(s);
    const out = [];
    for (const side of ['gents', 'ladies']) for (const x of s.rooms?.[side] || []) {
        if (!String(x.room_no || '').trim()) continue;
        const own = isDelayed(s) && x.out ? parseDT(x.out.date, x.out.time) : null;
        out.push({ side, room_no: String(x.room_no).trim(), beds: rowBeds(x), block: rowBlocks(x), building: rowBuilding(s, x), exclusive: !!x.exclusive,
            start, end: own || end0, status: own ? (x.out_status || 'confirmed') : 'booked', row: x });
    }
    return out;
}

export function slipEnd(s) {
    const end0 = baseEnd(s);
    if (!isDelayed(s)) return end0;
    return Math.max(end0 || 0, ...rowsOf(s).map(r => r.end || 0)) || end0;
}
export const effectiveCheckout = (s) => { const e = slipEnd(s); return e ? toDT(e) : { date: s.checkout_date, time: s.checkout_time }; };
export const presentAt = (s, t) => { const a = slipStart(s), z = slipEnd(s); return !!a && !!z && a <= t && t < z; };

/** Guests present at t. */
export function paxAt(s, t) {
    const g = num(s.gents), l = num(s.ladies), c = num(s.children ?? s.child), i = num(s.infants ?? s.infant);
    const total = num(s.total) || g + l + c + i;
    const zero = { gents: 0, ladies: 0, children: 0, infants: 0, total: 0 };
    if (!presentAt(s, t)) return zero;
    if (!isDelayed(s)) return { gents: g, ladies: l, children: c, infants: i, total };
    const rows = rowsOf(s);
    const sideBeds = (side, onlyHere) => rows.filter(r => r.side === side && (!onlyHere || (r.start <= t && t < r.end))).reduce((n, r) => n + r.beds, 0);
    // gents rows hold the gents; ladies rows hold ladies + children (children sleep on the ladies' side);
    // a side with no rooms keeps its whole count while the group is here
    const gAll = sideBeds('gents'), lAll = sideBeds('ladies');
    const gents = gAll ? Math.min(g, sideBeds('gents', true)) : g;
    const lc = l + c;
    const lcHere = lAll ? Math.min(lc, sideBeds('ladies', true)) : lc;
    const children = lc ? Math.round(c * lcHere / lc) : 0;
    const ladies = lcHere - children;
    return { gents, ladies, children, infants: i, total: gents + ladies + children + i }; // infants stay to the end
}

/** Partial check-outs: one entry per distinct end time. */
export function departuresOf(s) {
    const rows = rowsOf(s);
    if (!isDelayed(s) || !rows.length) {
        const at = slipEnd(s);
        return at ? [{ at, rooms: rows.map(r => ({ side: r.side, room_no: r.room_no, beds: r.beds })), beds: rows.reduce((n, r) => n + r.beds, 0), status: 'booked', last: true }] : [];
    }
    const by = new Map();
    for (const r of rows) {
        if (!r.end) continue;
        const e = by.get(r.end) || { at: r.end, rooms: [], beds: 0, status: r.status };
        e.rooms.push({ side: r.side, room_no: r.room_no, beds: r.beds });
        e.beds += r.beds;
        if (r.status === 'unknown' || (r.status === 'tentative' && e.status !== 'unknown')) e.status = r.status;
        by.set(r.end, e);
    }
    const list = [...by.values()].sort((a, b) => a.at - b.at);
    if (list.length) list[list.length - 1].last = true;
    return list;
}

/**
 * Delayed rooms against the bookings that follow (Delayed departures page, Home):
 * for each room row of `slip` still to leave, the other groups in that room from now until the row leaves, the next
 * group booked into it, and whether the room overflows (clash) or the next group arrives within 2 days (tight).
 * capOf(building, room) → beds (Rooms & Buildings); the row's own capacity is the fallback.
 */
export function roomConflicts(slip, slips, capOf, now = Date.now()) {
    const mineAll = rowsOf(slip);
    const out = [];
    for (const w of mineAll) {
        if (!w.end || w.end <= now) continue;
        const b = normB(w.building);                                  // the row's own building (an Exclusive row may be elsewhere)
        const room = w.room_no.toUpperCase();
        const from = Math.max(now, w.start || now);
        const others = [];
        for (const s of slips) {
            if (s.deleted || s.id === slip.id) continue;
            for (const o of rowsOf(s)) if (normB(o.building) === b && o.room_no.toUpperCase() === room && o.block > 0 && o.end > from) others.push({ ...o, beds: o.block, sh: s.sh_no, id: s.id });
        }
        const mine = mineAll.filter(x => normB(x.building) === b && x.room_no.toUpperCase() === room).map(x => ({ ...x, beds: x.block }));
        const cap = num(capOf(b, w.room_no)) || num(w.row.capacity);
        let worst = { total: 0, who: [], at: null };
        for (const t of new Set([from, ...others.map(o => o.start).filter(t => t > from && t < w.end)])) {
            const here = others.filter(o => o.start <= t && t < o.end);
            const total = here.reduce((n, o) => n + o.beds, 0) + mine.filter(x => x.start <= t && t < x.end).reduce((n, x) => n + x.beds, 0);
            if (total > worst.total) worst = { total, who: here, at: t };
        }
        const next = others.filter(o => o.start >= from).sort((a, c) => a.start - c.start)[0] || null;
        const clash = !!cap && worst.total > cap;
        out.push({ row: w, cap, peak: worst.total, at: worst.at, who: worst.who, next, clash, tight: !clash && !!next && next.start - w.end < 2 * 864e5 });
    }
    return out;
}
