// Mawaid counts: the building table with BAHA+HUSN merged, a Cooking Count (BAHA+HUSN+MOHAMMEDI+MUFADDAL merged) and Manda Counts (lunch/dinner
// thals × multipliers). Moved unchanged from pms/app/views/mawaid/view.js; the counting itself is core/meals.js (shared with the Home page).
export type Split = { g: number; l: number; c: number; i: number };
export type MealRow = { building: string; bp: number; lp: number; dp: number; bt: number; lt: number; dt: number; b: Split; l: Split; d: Split };
export type Stats = { rows: MealRow[]; totals: { tBP: number; tLP: number; tDP: number; tBT: number; tLT: number; tDT: number } };
export type Show = { p: boolean; g: boolean; l: boolean; c: boolean; i: boolean };

/** a unique, dark colour per building name */
export function colorOf(s: string) {
    let h = 0;
    for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
    return `hsl(${h % 360} 70% 35%)`;
}

// Cooking Count: HUSN+BAHA+MOHAMMEDI+MUFADDAL merged into one row (all meals); thals recomputed from the merged pax.
export function buildCooking(stats: Stats, thal: number): Stats {
    const MERGE = new Set(['BAHA', 'HUSN', 'MOHAMMEDI', 'MUFADDAL']);
    const byName = new Map(stats.rows.map(r => [r.building, r]));
    const rows: MealRow[] = stats.rows.filter(r => !MERGE.has(r.building)).map(r => JSON.parse(JSON.stringify(r)));
    const parts = ['BAHA', 'HUSN', 'MOHAMMEDI', 'MUFADDAL'].map(n => byName.get(n)).filter(Boolean) as MealRow[];
    if (parts.length) {
        const sum = (get: (p: MealRow) => number) => parts.reduce((a, p) => a + get(p), 0);
        const sp = (k: 'b' | 'l' | 'd'): Split => ({ g: sum(p => p[k].g), l: sum(p => p[k].l), c: sum(p => p[k].c), i: sum(p => p[k].i) });
        rows.push({ building: 'BAHA+HUSN+MOHAMMEDI+MUFADDAL', bp: sum(p => p.bp), lp: sum(p => p.lp), dp: sum(p => p.dp), bt: 0, lt: 0, dt: 0, b: sp('b'), l: sp('l'), d: sp('d') });
    }
    for (const r of rows) { r.bt = Math.ceil(r.bp / thal); r.lt = Math.ceil(r.lp / thal); r.dt = Math.ceil(r.dp / thal); }
    const totals = rows.reduce((t, r) => { t.tBP += r.bp; t.tLP += r.lp; t.tDP += r.dp; t.tBT += r.bt; t.tLT += r.lt; t.tDT += r.dt; return t; }, { tBP: 0, tLP: 0, tDP: 0, tBT: 0, tLT: 0, tDT: 0 });
    return { rows, totals };
}

// Manda Counts: lunch / dinner thals × multipliers (rounded), MUFADDAL+MOHAMMEDI and HUSN+BAHA merged
export function buildManda(stats: Stats, multL: number, multD: number) {
    const pairs = [{ name: 'MUFADDAL+MOHAMMEDI', members: ['MUFADDAL', 'MOHAMMEDI'] }, { name: 'HUSN+BAHA', members: ['HUSN', 'BAHA'] }];
    const skip = new Set(pairs.flatMap(p => p.members));
    const byName = new Map(stats.rows.map(r => [r.building, r]));
    const rows: { building: string; ltx: number; dtx: number }[] = [];
    for (const r of stats.rows) { if (skip.has(r.building)) continue; rows.push({ building: r.building, ltx: Math.round((r.lt || 0) * multL), dtx: Math.round((r.dt || 0) * multD) }); }
    for (const p of pairs) {
        const parts = p.members.map(n => byName.get(n)).filter(Boolean) as MealRow[];
        if (!parts.length) continue;
        rows.push({ building: p.name, ltx: Math.round(parts.reduce((a, r) => a + (r.lt || 0), 0) * multL), dtx: Math.round(parts.reduce((a, r) => a + (r.dt || 0), 0) * multD) });
    }
    return { rows, totals: rows.reduce((t, r) => ({ ltx: t.ltx + r.ltx, dtx: t.dtx + r.dtx }), { ltx: 0, dtx: 0 }) };
}
