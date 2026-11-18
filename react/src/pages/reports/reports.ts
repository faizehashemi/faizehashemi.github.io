// Reports (main menu → Reports): one card per report; each one is worked out for a From → To range and printed as an A4 PDF (the print tab's
// "Save as PDF"). This file holds the pure parts: the numbers of each report and the printed document (cover band, figures, bar charts, tables).
type Row = Record<string, any>;

export const MAX_DAYS = 62;
const pad = (n: number) => String(n).padStart(2, '0');
export const ymd = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const plus = (d: string, n: number) => { const x = new Date(`${d}T12:00`); x.setDate(x.getDate() + n); return ymd(x); };
export function daysOf(from: string, to: string) { const out: string[] = []; for (let d = from; d <= to && out.length < 400; d = plus(d, 1)) out.push(d); return out; }
export const fmtDay = (d: string) => new Date(`${d}T12:00`).toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short' });
export const fmtLong = (d: string) => new Date(`${d}T12:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
const esc = (v: unknown) => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string));
const n0 = (v: number) => (Number.isFinite(v) ? Math.round(v).toLocaleString('en-US') : '—');
const n1 = (v: number) => (Number.isFinite(v) ? (Math.round(v * 10) / 10).toLocaleString('en-US') : '—');
const sum = (a: number[]) => a.reduce((s, v) => s + (Number(v) || 0), 0);
const avg = (a: number[]) => { const x = a.filter(v => Number(v) > 0); return x.length ? sum(x) / x.length : 0; };   // over the days that had any

export type ReportId = 'mawaid' | 'occupancy' | 'transport' | 'website' | 'softdev' | 'kg' | 'laundry';
export const REPORTS: { id: ReportId; icon: string; title: string; blurb: string; hue: string; maxDays?: number; sites?: string[] }[] = [
    { id: 'mawaid', icon: '🍽️', title: 'Mawaid stats', blurb: 'Breakfast, lunch and dinner — thals and pax for every day', hue: '#b45309', maxDays: MAX_DAYS },
    { id: 'occupancy', icon: '🏨', title: 'Occupancy & vacancy', blurb: 'Beds in use and beds free, per night and per building', hue: '#0f766e', maxDays: MAX_DAYS },
    { id: 'transport', icon: '🚌', title: 'Transport', blurb: 'Groups, guests and vehicles by day and by destination', hue: '#1d4ed8', maxDays: MAX_DAYS },
    { id: 'website', icon: '🌐', title: 'Website stats', blurb: 'Page visits, speed, errors and desk feedback', hue: '#7c3aed' },
    { id: 'softdev', icon: '🛠️', title: 'Software development', blurb: 'What was built and shipped, from the change log', hue: '#be123c' },
    { id: 'kg', icon: '🕋', title: 'Fakkul Ehraam KG stats', blurb: 'FE1, FE2 and Atraaf duties per person and per day', hue: '#065f46' },
    { id: 'laundry', icon: '🧺', title: 'Laundry stats', blurb: 'Bills, pieces, cash, staff laundry and building linen', hue: '#0e7490' },
];

/* ------------------------------ the printed document ------------------------------ */
export type Kpi = { label: string; value: string; sub?: string };
export type Section = { title: string; note?: string; html: string };
export type Doc = { id: ReportId; title: string; icon: string; hue: string; site: string; from: string; to: string; kpis: Kpi[]; sections: Section[]; empty?: string };

/** Horizontal bars: label · bar · value (largest = full width) */
export function bars(items: { label: string; value: number; text?: string }[], hue: string) {
    const max = Math.max(1, ...items.map(i => i.value));
    return `<table class="bars">${items.map(i => `<tr><th>${esc(i.label)}</th><td><span class="bar" style="width:${Math.max(0.5, (i.value / max) * 100).toFixed(1)}%;background:${hue}"></span></td><td class="v">${esc(i.text ?? n0(i.value))}</td></tr>`).join('')}</table>`;
}
/** Vertical columns for a day series (one or two stacked values per day) */
export function columns(days: string[], a: number[], hue: string, b?: number[], labels?: [string, string?]) {
    const max = Math.max(1, ...days.map((_, i) => (a[i] || 0) + (b ? b[i] || 0 : 0)));
    const w = days.length > 40 ? 'thin' : days.length > 20 ? 'mid' : '';
    return `<div class="cols ${w}">${days.map((d, i) => {
        const ha = ((a[i] || 0) / max) * 100, hb = b ? ((b[i] || 0) / max) * 100 : 0;
        return `<div class="col" title="${esc(fmtDay(d))}"><div class="stack">${b ? `<span style="height:${hb}%;background:${hue}33"></span>` : ''}<span style="height:${ha}%;background:${hue}"></span></div><small>${d.slice(8)}</small></div>`;
    }).join('')}</div>${labels ? `<p class="legend"><i style="background:${hue}"></i>${esc(labels[0])}${b && labels[1] ? ` <i style="background:${hue}33"></i>${esc(labels[1])}` : ''}</p>` : ''}`;
}
export function table(head: string[], rows: (string | number)[][], foot?: (string | number)[], numFrom = 1) {
    const cell = (v: string | number, i: number, tag = 'td') => `<${tag}${i >= numFrom ? ' class="n"' : ''}>${typeof v === 'number' ? n0(v) : v}</${tag}>`;
    return `<table class="grid"><thead><tr>${head.map((h, i) => cell(esc(h), i, 'th')).join('')}</tr></thead><tbody>${rows.map(r => `<tr>${r.map((v, i) => cell(v, i)).join('')}</tr>`).join('')}</tbody>${foot ? `<tfoot><tr>${foot.map((v, i) => cell(v, i)).join('')}</tr></tfoot>` : ''}</table>`;
}

export function docHtml(d: Doc) {
    const made = new Date().toLocaleString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    const period = d.from === d.to ? fmtLong(d.from) : `${fmtLong(d.from)} — ${fmtLong(d.to)}`;
    return `<!doctype html><html><head><meta charset="utf-8"><title>${esc(d.title)} · ${esc(d.site)} · ${d.from}${d.to !== d.from ? ' to ' + d.to : ''}</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,700;9..144,900&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
@page { size: A4 portrait; margin: 12mm 12mm 14mm; }
* { box-sizing: border-box; }
html, body { margin: 0; background: #f3efe6; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
body { font: 10pt/1.45 Inter, "Segoe UI", Arial, sans-serif; color: #1c1917; }
.page { max-width: 186mm; margin: 0 auto; background: #fffdf8; }
@media screen { .page { margin: 16px auto; box-shadow: 0 10px 40px #0002; padding: 0 0 10mm; } }
.cover { position: relative; color: #fff; padding: 13mm 12mm 11mm; background: radial-gradient(120% 140% at 100% 0%, ${d.hue} 0%, #0b1020 62%); overflow: hidden; }
.cover::after { content: ""; position: absolute; inset: auto -20mm -28mm auto; width: 90mm; height: 90mm; border-radius: 50%; border: 1px solid #ffffff2a; box-shadow: 0 0 0 8mm #ffffff08, 0 0 0 16mm #ffffff06; }
.eyebrow { font: 600 8pt Inter, sans-serif; letter-spacing: .32em; text-transform: uppercase; color: #f5d78e; }
.cover h1 { font: 900 30pt/1.02 Fraunces, Georgia, serif; margin: 3mm 0 2mm; letter-spacing: -.01em; }
.cover h1 .ic { font-size: 24pt; margin-right: 3mm; }
.cover .period { font: 500 12pt Fraunces, Georgia, serif; color: #fde7b0; }
.cover .rule { height: 2px; width: 46mm; margin: 5mm 0 0; background: linear-gradient(90deg, #f5d78e, transparent); }
.body { padding: 0 12mm; }
.kpis { display: grid; grid-template-columns: repeat(${Math.min(4, Math.max(1, d.kpis.length))}, 1fr); gap: 3mm; margin: -7mm 0 6mm; position: relative; z-index: 1; }
.kpi { background: #fff; border-radius: 3mm; padding: 3.5mm 4mm; box-shadow: 0 2mm 6mm #0b10201f; border-top: 1.2mm solid ${d.hue}; break-inside: avoid; }
.kpi b { display: block; font: 800 19pt/1.1 Fraunces, Georgia, serif; color: #0b1020; }
.kpi span { display: block; font: 600 7.5pt Inter, sans-serif; letter-spacing: .12em; text-transform: uppercase; color: #78716c; margin-top: 1mm; }
.kpi small { display: block; color: ${d.hue}; font-weight: 600; margin-top: .6mm; }
h2 { font: 800 14pt Fraunces, Georgia, serif; color: #0b1020; margin: 7mm 0 1mm; display: flex; align-items: center; gap: 3mm; break-after: avoid; }
h2::before { content: ""; width: 2.2mm; height: 6mm; border-radius: 1mm; background: ${d.hue}; }
.note { color: #78716c; margin: 0 0 2.5mm; font-size: 8.5pt; }
section { break-inside: auto; }
table.grid { width: 100%; border-collapse: collapse; font-size: 8.8pt; margin: 2mm 0; }
table.grid th { text-align: left; font: 700 7.5pt Inter, sans-serif; letter-spacing: .08em; text-transform: uppercase; color: #fff; background: #0b1020; padding: 2mm 2.4mm; }
table.grid td { padding: 1.6mm 2.4mm; border-bottom: 1px solid #e7e0d2; }
table.grid tbody tr:nth-child(even) td { background: #faf6ee; }
table.grid tfoot td { font-weight: 800; border-top: 2px solid #0b1020; border-bottom: 0; background: #f5ecd7; }
table.grid .n { text-align: right; font-variant-numeric: tabular-nums; }
table.grid tr { break-inside: avoid; }
table.bars { width: 100%; border-collapse: collapse; margin: 2mm 0; font-size: 8.8pt; }
table.bars th { text-align: left; font-weight: 600; width: 34%; padding: 1.2mm 2mm 1.2mm 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 60mm; }
table.bars td { padding: 1.2mm 0; } table.bars td.v { width: 18%; text-align: right; font-weight: 700; font-variant-numeric: tabular-nums; padding-left: 2mm; }
.bar { display: block; height: 3.6mm; border-radius: 0 2mm 2mm 0; }
.cols { display: flex; align-items: flex-end; gap: 1mm; height: 38mm; padding: 2mm 0 0; border-bottom: 1px solid #d6cdb9; margin: 2mm 0 0; }
.col { flex: 1; display: flex; flex-direction: column; align-items: center; height: 100%; min-width: 0; }
.col .stack { flex: 1; width: 100%; display: flex; flex-direction: column-reverse; justify-content: flex-start; }
.col .stack span { display: block; width: 100%; border-radius: .8mm .8mm 0 0; }
.col small { font-size: 6pt; color: #78716c; margin-top: .8mm; }
.cols.mid small { font-size: 5pt; } .cols.thin small { display: none; } .cols.thin { gap: .4mm; }
.legend { font-size: 7.5pt; color: #57534e; margin: 1.5mm 0 0; } .legend i { display: inline-block; width: 3mm; height: 3mm; border-radius: .6mm; margin: 0 1mm -0.4mm 3mm; } .legend i:first-child { margin-left: 0; }
.two { display: grid; grid-template-columns: 1fr 1fr; gap: 6mm; } .two > div { min-width: 0; }
.empty { margin: 10mm 0; padding: 8mm; text-align: center; border: 1px dashed #c9bfa8; border-radius: 3mm; color: #78716c; font: 500 12pt Fraunces, Georgia, serif; }
.foot { margin: 9mm 12mm 0; padding-top: 3mm; border-top: 1px solid #e7e0d2; display: flex; justify-content: space-between; font-size: 7.5pt; color: #a8a29e; letter-spacing: .06em; }
.pill { display: inline-block; padding: .3mm 2mm; border-radius: 9mm; background: ${d.hue}1f; color: ${d.hue}; font-weight: 700; font-size: 7.5pt; }
</style></head><body><div class="page">
<header class="cover"><div class="eyebrow">Faiz e Hashemi · ${esc(d.site)} · Report</div><h1><span class="ic">${d.icon}</span>${esc(d.title)}</h1><div class="period">${esc(period)}</div><div class="rule"></div></header>
<div class="body">
${d.kpis.length ? `<div class="kpis">${d.kpis.map(k => `<div class="kpi"><b>${esc(k.value)}</b><span>${esc(k.label)}</span>${k.sub ? `<small>${esc(k.sub)}</small>` : ''}</div>`).join('')}</div>` : '<div style="height:6mm"></div>'}
${d.empty ? `<div class="empty">${esc(d.empty)}</div>` : d.sections.map(s => `<section><h2>${esc(s.title)}</h2>${s.note ? `<p class="note">${esc(s.note)}</p>` : ''}${s.html}</section>`).join('')}
</div>
<div class="foot"><span>PMS · ${esc(d.site)}</span><span>Prepared ${esc(made)}</span></div>
</div></body></html>`;
}

/* ------------------------------ the reports ------------------------------ */
type Base = { site: string; from: string; to: string };
const base = (id: ReportId, b: Base) => { const r = REPORTS.find(x => x.id === id)!; return { id, title: r.title, icon: r.icon, hue: r.hue, site: b.site, from: b.from, to: b.to }; };
const peak = (days: string[], v: number[]) => { let i = -1; v.forEach((x, k) => { if (i < 0 || x > v[i]) i = k; }); return i >= 0 && v[i] > 0 ? `peak ${n0(v[i])} · ${fmtDay(days[i])}` : undefined; };

/** Mawaid: per day the thals and pax of each meal (meals.mealThalsFor) */
export function mawaidDoc(b: Base, days: string[], perDay: ({ breakfast: number; lunch: number; dinner: number; pax: { breakfast: number; lunch: number; dinner: number } } | null)[]): Doc {
    const d = days.map((day, i) => ({ day, m: perDay[i] })).filter(x => x.m);
    const T = (k: 'breakfast' | 'lunch' | 'dinner') => d.map(x => x.m![k]), P = (k: 'breakfast' | 'lunch' | 'dinner') => d.map(x => x.m!.pax[k]);
    const thals = d.map(x => x.m!.breakfast + x.m!.lunch + x.m!.dinner), servings = d.map(x => x.m!.pax.breakfast + x.m!.pax.lunch + x.m!.pax.dinner);
    if (!d.length || !sum(servings)) return { ...base('mawaid', b), kpis: [], sections: [], empty: 'No guests in house for meals in these dates.' };
    const hue = base('mawaid', b).hue;
    return {
        ...base('mawaid', b),
        kpis: [{ label: 'Meals served (pax)', value: n0(sum(servings)), sub: peak(d.map(x => x.day), servings) }, { label: 'Thals in all', value: n0(sum(thals)) },
            { label: 'Average lunch pax', value: n0(avg(P('lunch'))) }, { label: 'Average dinner pax', value: n0(avg(P('dinner'))) }],
        sections: [
            { title: 'Pax per day', note: 'Lunch (dark) and dinner (light) — the guests in house in each meal window.', html: columns(d.map(x => x.day), P('lunch'), hue, P('dinner'), ['Lunch', 'Dinner']) },
            { title: 'By meal', html: bars([{ label: 'Breakfast', value: sum(P('breakfast')) }, { label: 'Lunch', value: sum(P('lunch')) }, { label: 'Dinner', value: sum(P('dinner')) }].map(x => ({ ...x, text: `${n0(x.value)} pax` })), hue) },
            { title: 'Day by day', html: table(['Day', 'Breakfast pax', 'thals', 'Lunch pax', 'thals', 'Dinner pax', 'thals'],
                d.map(x => [fmtDay(x.day), x.m!.pax.breakfast, x.m!.breakfast, x.m!.pax.lunch, x.m!.lunch, x.m!.pax.dinner, x.m!.dinner]),
                ['Total', sum(P('breakfast')), sum(T('breakfast')), sum(P('lunch')), sum(T('lunch')), sum(P('dinner')), sum(T('dinner'))]) },
        ],
    };
}

/** Occupancy & vacancy: the Occupancy page's model (beds per night, per building) */
export function occupancyDoc(b: Base, M: { days: string[]; blds: { name: string; capN: number[]; used: number[] }[]; total: { capN: number[]; used: number[]; roomsUsed: number[] } }): Doc {
    const cap = M.total.capN, used = M.total.used, free = cap.map((c, i) => Math.max(0, c - (used[i] || 0)));
    const nights = sum(cap), usedN = sum(used.map((u, i) => Math.min(u, cap[i] || u)));
    if (!nights) return { ...base('occupancy', b), kpis: [], sections: [], empty: 'No rooms in service in these dates.' };
    const hue = base('occupancy', b).hue, rate = (u: number, c: number) => (c ? `${n1((100 * u) / c)}%` : '—');
    const blds = M.blds.map(x => ({ name: x.name, cap: sum(x.capN), used: sum(x.used.map((u, i) => Math.min(u, x.capN[i] || u))) })).filter(x => x.cap);
    return {
        ...base('occupancy', b),
        kpis: [{ label: 'Occupancy', value: rate(usedN, nights), sub: `${n0(usedN)} of ${n0(nights)} bed-nights` }, { label: 'Vacant bed-nights', value: n0(nights - usedN) },
            { label: 'Average guests / night', value: n0(avg(used)), sub: peak(M.days, used) }, { label: 'Beds in service', value: n0(Math.max(...cap)) }],
        sections: [
            { title: 'Beds per night', note: 'In use (dark) and free (light).', html: columns(M.days, used.map((u, i) => Math.min(u, cap[i] || u)), hue, free, ['In use', 'Free']) },
            { title: 'By building', html: bars(blds.map(x => ({ label: x.name, value: x.cap ? (100 * x.used) / x.cap : 0, text: rate(x.used, x.cap) })), hue)
                + table(['Building', 'Bed-nights', 'In use', 'Vacant', 'Occupancy'], blds.map(x => [esc(x.name), x.cap, x.used, x.cap - x.used, rate(x.used, x.cap)]), ['All', nights, usedN, nights - usedN, rate(usedN, nights)]) },
            { title: 'Night by night', html: table(['Night', 'Beds', 'In use', 'Free', 'Rooms used', 'Occupancy'], M.days.map((d, i) => [fmtDay(d), cap[i] || 0, used[i] || 0, free[i], M.total.roomsUsed[i] || 0, rate(used[i] || 0, cap[i] || 0)])) },
        ],
    };
}

/** Transport: every saved Transport day in the range (rows = groups; vehicles = distinct destination + bus) */
export function transportDoc(b: Base, days: { day: string; rows: Row[]; ride: Map<string, { route?: string; parent?: Row | null }> }[], destLabel: (route: string) => string): Doc {
    const hue = base('transport', b).hue;
    const per = days.map(({ day, rows, ride }) => {
        const veh = new Set<string>(), byDest = new Map<string, { g: number; pax: number; veh: Set<string> }>();
        for (const r of rows) {
            // a group without a route of its own rides in its parent trip's vehicle (transport.resolve)
            const x = ride.get(r.key), dest = destLabel(String(x?.route || r.route || '')) || 'Other';
            const v = String(x?.parent?.key ?? r.key);
            veh.add(v);
            const e = byDest.get(dest) || { g: 0, pax: 0, veh: new Set<string>() };
            e.g++; e.pax += Number(r.pax) || 0; e.veh.add(v); byDest.set(dest, e);
        }
        return { day, groups: rows.length, pax: sum(rows.map(r => Number(r.pax) || 0)), veh: veh.size, byDest };
    });
    if (!per.some(p => p.groups)) return { ...base('transport', b), kpis: [], sections: [], empty: 'No transport saved in these dates.' };
    const dests = new Map<string, { g: number; pax: number; veh: number }>();
    for (const p of per) for (const [k, v] of p.byDest) { const e = dests.get(k) || { g: 0, pax: 0, veh: 0 }; e.g += v.g; e.pax += v.pax; e.veh += v.veh.size; dests.set(k, e); }
    const D = [...dests].sort((a, z) => z[1].pax - a[1].pax);
    return {
        ...base('transport', b),
        kpis: [{ label: 'Guests moved', value: n0(sum(per.map(p => p.pax))), sub: peak(per.map(p => p.day), per.map(p => p.pax)) }, { label: 'Group trips', value: n0(sum(per.map(p => p.groups))) },
            { label: 'Vehicles', value: n0(sum(per.map(p => p.veh))) }, { label: 'Destinations', value: n0(dests.size) }],
        sections: [
            { title: 'Guests per day', html: columns(per.map(p => p.day), per.map(p => p.pax), hue, undefined, ['Guests']) },
            { title: 'By destination', html: bars(D.map(([k, v]) => ({ label: k, value: v.pax, text: `${n0(v.pax)} pax` })), hue)
                + table(['Destination', 'Group trips', 'Guests', 'Vehicles'], D.map(([k, v]) => [esc(k), v.g, v.pax, v.veh]), ['All', sum(D.map(x => x[1].g)), sum(D.map(x => x[1].pax)), sum(D.map(x => x[1].veh))]) },
            { title: 'Day by day', html: table(['Day', 'Group trips', 'Guests', 'Vehicles', 'Destinations'], per.filter(p => p.groups).map(p => [fmtDay(p.day), p.groups, p.pax, p.veh, esc([...p.byDest.keys()].join(', '))])) },
        ],
    };
}

/** Website stats: /api/perf/summary (page visits and speed per day, pages, errors, feedback stars) */
export function websiteDoc(b: Base, s: Row): Doc {
    const hue = base('website', b).hue;
    const day = ((s.day || []) as Row[]).filter(x => x.key >= b.from && x.key <= b.to);
    const visits = sum(day.map(x => x.n));
    if (!visits) return { ...base('website', b), kpis: [], sections: [], empty: 'No page visits recorded in these dates (the site keeps 90 days).' };
    const ms = (v: unknown) => (v == null ? '—' : `${n0(Number(v))} ms`);
    const pages = ((s.pages || []) as Row[]).slice(0, 15);
    return {
        ...base('website', b),
        kpis: [{ label: 'Page visits', value: n0(visits), sub: peak(day.map(x => x.key), day.map(x => x.n)) }, { label: 'Typical page time', value: ms(s.totals?.p50), sub: `slowest 5%: ${ms(s.totals?.p95)}` },
            { label: 'Desks using it', value: n0(s.totals?.desks ?? 0) }, { label: 'Feedback', value: s.totals?.stars != null ? `${n1(s.totals.stars)} ★` : '—', sub: `${n0(s.totals?.feedback ?? 0)} ratings` }],
        sections: [
            { title: 'Visits per day', html: columns(day.map(x => x.key), day.map(x => x.n), hue, undefined, ['Page visits']) },
            { title: 'Most used pages', note: `Since ${fmtLong(String(s.since || '').slice(0, 10) || b.from)}.`, html: table(['Page', 'Visits', 'Typical', 'Slowest 5%', 'Errors', 'Stars'], pages.map(p => [esc(p.key), p.n, ms(p.p50), ms(p.p95), p.errors || 0, p.stars != null ? `${n1(p.stars)} ★` : '—'])) },
            { title: 'Speed', html: table(['Measure', 'Value'], [['Server first byte (median)', ms(s.vitals?.ttfb)], ['Page ready (median)', ms(s.vitals?.dom_ready)], ['Largest paint (median)', ms(s.vitals?.lcp)], ['Response to taps (75%)', ms(s.vitals?.inp)], ['Errors recorded', n0(s.totals?.errors ?? 0)]]) },
            { title: 'Devices & browsers', html: `<div class="two"><div>${bars(((s.device || []) as Row[]).slice(0, 6).map(x => ({ label: x.key || '—', value: x.n })), hue)}</div><div>${bars(((s.browser || []) as Row[]).slice(0, 6).map(x => ({ label: x.key || '—', value: x.n })), hue)}</div></div>` },
        ],
    };
}

/** Software development: the change log (CHANGES {d, f, m}, FEATURES names, DEPLOYS {w, at}) */
export function softdevDoc(b: Base, data: { CHANGES: Row[]; FEATURES: Record<string, string>; DEPLOYS?: Row[] }): Doc {
    const hue = base('softdev', b).hue;
    const ch = data.CHANGES.filter(c => c.d >= b.from && c.d <= b.to);
    if (!ch.length) return { ...base('softdev', b), kpis: [], sections: [], empty: 'No changes in the change log for these dates.' };
    const days = daysOf(b.from, b.to), byDay = days.map(d => ch.filter(c => c.d === d).length);
    const feat = new Map<string, number>(); for (const c of ch) feat.set(c.f, (feat.get(c.f) || 0) + 1);
    const F = [...feat].sort((a, z) => z[1] - a[1]);
    const dep = (data.DEPLOYS || []).filter(x => String(x.at).slice(0, 10) >= b.from && String(x.at).slice(0, 10) <= b.to);
    const name = (f: string) => data.FEATURES[f] || f || 'General';
    return {
        ...base('softdev', b),
        kpis: [{ label: 'Changes shipped', value: n0(ch.length), sub: peak(days, byDay) }, { label: 'Areas improved', value: n0(feat.size) },
            { label: 'Active days', value: n0(byDay.filter(Boolean).length), sub: `of ${days.length}` }, ...(dep.length ? [{ label: 'Deploys logged', value: n0(dep.length) }] : [{ label: 'Per active day', value: n1(ch.length / Math.max(1, byDay.filter(Boolean).length)) }])],
        sections: [
            { title: 'Changes per day', html: columns(days, byDay, hue, undefined, ['Changes']) },
            { title: 'By area', html: bars(F.slice(0, 16).map(([f, n]) => ({ label: name(f), value: n })), hue) },
            { title: 'Every change', html: table(['Date', 'Area', 'What changed'], [...ch].sort((a, z) => z.d.localeCompare(a.d)).map(c => [fmtDay(c.d), `<span class="pill">${esc(name(c.f))}</span>`, esc(c.m)]), undefined, 99) },
        ],
    };
}

/** Fakkul Ehraam KG: the duty log (FE1, FE2, Atraaf) per person and per day */
export function kgDoc(b: Base, st: { people: string[]; log: Row[] }): Doc {
    const hue = base('kg', b).hue;
    const day = (ts: string) => ymd(new Date(ts));
    const log = (st.log || []).filter(e => { const d = day(e.ts); return d >= b.from && d <= b.to; });
    if (!log.length) return { ...base('kg', b), kpis: [], sections: [], empty: 'No KG duties recorded in these dates.' };
    const types = ['FE1', 'FE2', 'Atraaf'], cnt = (t: string) => log.filter(e => e.type === t).length;
    const per = new Map<string, Record<string, number>>();
    for (const e of log) { const p = per.get(e.person) || { FE1: 0, FE2: 0, Atraaf: 0, total: 0 }; p[e.type] = (p[e.type] || 0) + 1; p.total++; per.set(e.person, p); }
    const P = [...per].sort((a, z) => z[1].total - a[1].total || a[0].localeCompare(z[0]));
    const days = daysOf(b.from, b.to), byDay = days.map(d => log.filter(e => day(e.ts) === d).length);
    const idle = (st.people || []).filter(n => !per.has(n));
    return {
        ...base('kg', b),
        kpis: [{ label: 'Duties done', value: n0(log.length), sub: peak(days, byDay) }, ...types.map(t => ({ label: t, value: n0(cnt(t)) }))],
        sections: [
            { title: 'Duties per day', html: columns(days, byDay, hue, undefined, ['Duties']) },
            { title: 'Who served most', html: bars(P.slice(0, 15).map(([n, v]) => ({ label: n, value: v.total })), hue) },
            { title: 'Every person', html: table(['Name', 'FE1', 'FE2', 'Atraaf', 'Total'], P.map(([n, v]) => [esc(n), v.FE1, v.FE2, v.Atraaf, v.total]), ['All', cnt('FE1'), cnt('FE2'), cnt('Atraaf'), log.length]) },
            ...(idle.length ? [{ title: 'No duty in these dates', html: `<p>${idle.map(esc).join(' · ')}</p>` }] : []),
        ],
    };
}

/** Laundry: bills of the range (cash, staff, building linen) */
export function laundryDoc(b: Base, bills: Row[]): Doc {
    const hue = base('laundry', b).hue, sar = (h: number) => (h / 100).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
    const live = bills.filter(x => !x.voided), cash = live.filter(x => x.kind === 'paid'), staff = live.filter(x => x.kind === 'free'), bld = live.filter(x => x.kind === 'building');
    if (!live.length) return { ...base('laundry', b), kpis: [], sections: [], empty: 'No laundry in these dates.' };
    const days = daysOf(b.from, b.to), pcs = (a: Row[]) => sum(a.map(x => x.items));
    const items = new Map<string, number>(); for (const x of live) for (const l of x.lines || []) items.set(l.name, (items.get(l.name) || 0) + l.qty);
    const I = [...items].sort((a, z) => z[1] - a[1]);
    const unpaid = cash.filter(x => !x.settled_at);
    return {
        ...base('laundry', b),
        kpis: [{ label: 'Pieces washed', value: n0(pcs(live)), sub: peak(days, days.map(d => pcs(live.filter(x => x.day === d)))) }, { label: 'Cash SAR', value: sar(sum(cash.map(x => x.paid))), sub: `${n0(cash.length)} bills` },
            { label: 'Staff laundry pieces', value: n0(pcs(staff)), sub: `${n0(staff.length)} times` }, { label: 'Building linen', value: n0(pcs(bld)), sub: 'pieces' }],
        sections: [
            { title: 'Pieces per day', note: 'Paid laundry (dark) and staff + building linen (light).', html: columns(days, days.map(d => pcs(cash.filter(x => x.day === d))), hue, days.map(d => pcs([...staff, ...bld].filter(x => x.day === d))), ['Paid', 'Staff & building']) },
            { title: 'Most washed', html: bars(I.slice(0, 14).map(([n, q]) => ({ label: n, value: q })), hue) },
            { title: 'Cash', html: table(['', 'Bills', 'Pieces', 'SAR'], [['Paid (handed over)', cash.length - unpaid.length, pcs(cash.filter(x => x.settled_at)), sar(sum(cash.filter(x => x.settled_at).map(x => x.paid)))], ['Unpaid', unpaid.length, pcs(unpaid), sar(sum(unpaid.map(x => x.paid)))]], ['All cash', cash.length, pcs(cash), sar(sum(cash.map(x => x.paid)))]) },
            { title: 'Day by day', html: table(['Day', 'Cash bills', 'Cash SAR', 'Paid pieces', 'Staff pieces', 'Linen pieces'], days.filter(d => live.some(x => x.day === d)).map(d => { const c = cash.filter(x => x.day === d); return [fmtDay(d), c.length, sar(sum(c.map(x => x.paid))), pcs(c), pcs(staff.filter(x => x.day === d)), pcs(bld.filter(x => x.day === d))]; })) },
        ],
    };
}
