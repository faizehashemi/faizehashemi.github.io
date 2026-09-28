// Meal counts (Mawaid rules) — one source for the Mawaid page and the Home page.
// A guest counts for a meal when the stay overlaps the meal window ([check-in, check-out) vs [start, end));
// a group checking in at exactly 15:00 gets no lunch that day. Thals = pax ÷ thal size, rounded up per row.

// The Mawaid page's starting values (its inputs can change them for the page)
export const MEAL_DEFAULTS = {
    ranges: { B: { start: '04:00', end: '09:30' }, L: { start: '11:00', end: '16:00' }, D: { start: '18:00', end: '23:00' } },
    thal: 8,
    incAdults: true, incChildren: false, incInfants: false,
};

export function parseLocalDateTime(d, t) {
    if (!d) return null;
    const s = t && t.length ? t : '00:00';
    const [y, m, dd] = d.split('-').map(Number);
    const [hh, mi] = s.split(':').map(Number);
    const dt = new Date(y, (m || 1) - 1, (dd || 1), hh || 0, mi || 0, 0, 0);
    return isNaN(dt) ? null : dt;
}
function overlap(aStart, aEnd, bStart, bEnd) {
    return aStart < bEnd && bStart < aEnd; // proper interval overlap on [start, end)
}
function uniq(a) { return Array.from(new Set(a)); }

/* Pax totals controlled by include toggles */
export function paxOf(rec, incA, incC, incI) {
    const total = Number(rec.total);
    const g = Number(rec.gents) || 0, l = Number(rec.ladies) || 0, c = Number(rec.children) || 0, i = Number(rec.infants) || 0;
    const wantAll = incA && incC && incI;
    if (Number.isFinite(total) && total > 0 && wantAll) return total;
    let s = 0; if (incA) s += g + l; if (incC) s += c; if (incI) s += i;
    return s || (Number.isFinite(total) ? total : 0);
}

function parseRange(dateStr, tStart, tEnd) {
    const start = parseLocalDateTime(dateStr, tStart);
    const end = parseLocalDateTime(dateStr, tEnd);
    if (!start || !end || end <= start) return null;
    return [start, end];
}

export function computeByBuilding(slips, dateStr, ranges, thal, incA, incC, incI) {
    const bR = parseRange(dateStr, ranges.B.start, ranges.B.end);
    const lR = parseRange(dateStr, ranges.L.start, ranges.L.end);
    const dR = parseRange(dateStr, ranges.D.start, ranges.D.end);
    if (!bR || !lR || !dR) return null;

    const buildings = uniq(
        slips.map(r => (r.building || '').trim()).filter(Boolean)
    ).sort((a, b) => a.localeCompare(b));

    const agg = new Map();
    for (const b of buildings) {
        agg.set(b, {
            bp: 0, lp: 0, dp: 0,
            b: { g: 0, l: 0, c: 0, i: 0 },
            l: { g: 0, l: 0, c: 0, i: 0 },
            d: { g: 0, l: 0, c: 0, i: 0 }
        });
    }

    for (const rec of slips) {
        const b = (rec.building || '').trim();
        if (!b || !agg.has(b)) continue;

        const ci = parseLocalDateTime(rec.checkin_date, rec.checkin_time);
        const co = parseLocalDateTime(rec.checkout_date, rec.checkout_time);
        if (!ci || !co) continue;

        const pax = paxOf(rec, incA, incC, incI);
        const g = Number(rec.gents) || 0;
        const l = Number(rec.ladies) || 0;
        const c = Number(rec.children) || 0;
        const i = Number(rec.infants) || 0;

        const a = agg.get(b);

        // Breakfast
        if (overlap(ci, co, bR[0], bR[1])) {
            a.bp += pax; a.b.g += g; a.b.l += l; a.b.c += c; a.b.i += i;
        }

        // Lunch: skip only if today is the check-in date AND time is exactly 15:00
        const skipLunchToday =
            dateStr === (rec.checkin_date || '').trim() &&
            ((rec.checkin_time || '').trim() === '15:00');

        if (!skipLunchToday && overlap(ci, co, lR[0], lR[1])) {
            a.lp += pax; a.l.g += g; a.l.l += l; a.l.c += c; a.l.i += i;
        }

        // Dinner
        if (overlap(ci, co, dR[0], dR[1])) {
            a.dp += pax; a.d.g += g; a.d.l += l; a.d.c += c; a.d.i += i;
        }
    }

    let tBP = 0, tLP = 0, tDP = 0;
    const rows = [];
    for (const [b, v] of agg.entries()) {
        tBP += v.bp; tLP += v.lp; tDP += v.dp;
        rows.push({
            building: b,
            bp: v.bp, bt: Math.ceil(v.bp / thal),
            lp: v.lp, lt: Math.ceil(v.lp / thal),
            dp: v.dp, dt: Math.ceil(v.dp / thal),
            b: v.b, l: v.l, d: v.d
        });
    }

    rows.sort((a, b) => a.building.localeCompare(b.building, undefined, { numeric: true }));

    return {
        rows,
        totals: {
            tBP,
            tLP,
            tDP,
            tBT: Math.ceil(tBP / thal),
            tLT: Math.ceil(tLP / thal),
            tDT: Math.ceil(tDP / thal)
        },
        when: { B: bR, L: lR, D: dR }
    };
}

export function buildFirstMerged(stats, thal) {
    const byName = new Map(stats.rows.map(r => [r.building, r]));

    // keep everyone except BAHA/HUSN
    const rows = [];
    const skip = new Set(['BAHA', 'HUSN']);
    for (const r of stats.rows) {
        if (skip.has(r.building)) continue;
        rows.push(JSON.parse(JSON.stringify(r)));
    }

    // merge BAHA + HUSN into one row
    const parts = ['BAHA', 'HUSN'].map(n => byName.get(n)).filter(Boolean);
    if (parts.length) {
        const sum = (get) => parts.reduce((a, p) => a + get(p), 0);

        const merged = {
            building: 'BAHA+HUSN',
            bp: sum(p => p.bp),
            lp: sum(p => p.lp),
            dp: sum(p => p.dp),
            bt: 0, lt: 0, dt: 0,
            b: { g: sum(p => p.b.g), l: sum(p => p.b.l), c: sum(p => p.b.c), i: sum(p => p.b.i) },
            l: { g: sum(p => p.l.g), l: sum(p => p.l.l), c: sum(p => p.l.c), i: sum(p => p.l.i) },
            d: { g: sum(p => p.d.g), l: sum(p => p.d.l), c: sum(p => p.d.c), i: sum(p => p.d.i) }
        };

        rows.push(merged);
    }

    // recompute thals per row using current thal size
    for (const r of rows) {
        r.bt = Math.ceil(r.bp / thal);
        r.lt = Math.ceil(r.lp / thal);
        r.dt = Math.ceil(r.dp / thal);
    }

    // recompute table totals
    const totals = rows.reduce((t, r) => {
        t.tBP += r.bp; t.tLP += r.lp; t.tDP += r.dp;
        t.tBT += r.bt; t.tLT += r.lt; t.tDT += r.dt;
        return t;
    }, { tBP: 0, tLP: 0, tDP: 0, tBT: 0, tLT: 0, tDT: 0 });

    return { rows, totals };
}

/** Thals per meal for one day with the Mawaid page's default settings (the Mawaid page's first table total). */
export function mealThalsFor(slips, dateStr, opts = MEAL_DEFAULTS) {
    const stats = computeByBuilding(slips, dateStr, opts.ranges, opts.thal, opts.incAdults, opts.incChildren, opts.incInfants);
    if (!stats) return null;
    const m = buildFirstMerged(stats, opts.thal);
    return { breakfast: m.totals.tBT, lunch: m.totals.tLT, dinner: m.totals.tDT, pax: { breakfast: m.totals.tBP, lunch: m.totals.tLP, dinner: m.totals.tDP } };
}
