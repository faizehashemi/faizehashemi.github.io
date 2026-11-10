// Accounts → Building Hisaab: what is payable to a building for a period — each room's charge per day × the days it was occupied. The period is cut into
// 24-hour days from its From time (From 10 Nov 12:00 → 10 Nov 12:00–11 Nov 12:00, …; a shorter last piece is a day too). A room is occupied on a day when any
// slip has a stay in it at any moment of those 24 hours — once is enough, so no hour or minute counting (a stay before a room change counts in the room it was
// in; a stay ending exactly when the day begins does not). The charges are kept in this browser only (localStorage), per site and building.
// Inactive rooms (Rooms & Buildings) come in only when a slip used them in the period: their occupied days count, the others are "off" (neither occupied
// nor vacant). A room handed back to the hotel stops counting from that moment ("—", neither occupied nor vacant).

type Row = Record<string, any>;
export type Cell = 'yes' | 'no' | 'gone' | 'off';
export type HRoom = { no: string; off?: boolean; rate: number; cells: Cell[]; occ: number; vac: number; amount: number };
export type HDay = { day: string; occ: number; vac: number; amount: number };
export type Hisaab = { building: string; from: number; to: number; days: string[]; rooms: HRoom[]; perDay: HDay[]; occ: number; vac: number; payable: number; noRate: number; cut: boolean };

const pad = (n: number) => String(n).padStart(2, '0');
export const ymd = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const natural = (a: string, b: string) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
export const MAX_NIGHTS = 120;

/** The 24-hour days of [from, to): { day (the date it begins), a, b } — the last one ends at `to` */
export function daysOf(from: number, to: number) {
    const out: { day: string; a: number; b: number }[] = [];
    const d = new Date(from);
    while (+d < to && out.length < MAX_NIGHTS + 1) {
        const a = +d; d.setDate(d.getDate() + 1);   // the same clock time next day (24 h)
        out.push({ day: ymd(new Date(a)), a, b: Math.min(+d, to) });
    }
    return out;
}

export function computeHisaab(slips: Row[], building: Row, from: number, to: number, stay: any, rooms: any, rates: Record<string, number> = {}): Hisaab {
    const all = daysOf(from, to), cut = all.length > MAX_NIGHTS, nights = all.slice(0, MAX_NIGHTS);
    const list = (building.rooms || []).filter((r: Row) => String(r.room_no || '').trim()).sort((a: Row, b: Row) => natural(String(a.room_no).trim(), String(b.room_no).trim()));
    const used = new Map<string, boolean[]>(list.map((r: Row) => [rooms.normRoom(r.room_no), nights.map(() => false)]));
    const bn = stay.normB(building.name);
    for (const s of slips) {
        if (s.deleted) continue;
        for (const w of stay.rowsOf(s) as Row[]) {
            if (stay.normB(w.building) !== bn || !w.start || !w.end) continue;
            const u = used.get(rooms.normRoom(w.room_no));
            if (u) nights.forEach((n, i) => { if (!u[i] && w.start < n.b && w.end > n.a) u[i] = true; });   // in the room at any moment of the day
        }
    }
    const perDay: HDay[] = nights.map(n => ({ day: n.day, occ: 0, vac: 0, amount: 0 }));
    let noRate = 0;
    // an inactive room stays out unless a slip used it in the period
    const shown = list.filter((r: Row) => r.active !== false || used.get(rooms.normRoom(r.room_no))!.some(Boolean));
    const out: HRoom[] = shown.map((r: Row) => {
        const no = String(r.room_no).trim(), key = rooms.normRoom(no), u = used.get(key)!, off = r.active === false;
        const rate = Number(rates[no]) || 0;
        if (!rate) noRate++;
        const gone = rooms.handedAt ? rooms.handedAt(r) : null;
        const cells: Cell[] = nights.map((n, i) => (gone !== null && gone <= n.a ? 'gone' : u[i] ? 'yes' : off ? 'off' : 'no'));
        const occ = cells.filter(c => c === 'yes').length, vac = cells.filter(c => c === 'no').length;
        cells.forEach((c, i) => { if (c === 'yes') { perDay[i].occ++; perDay[i].amount += rate; } else if (c === 'no') perDay[i].vac++; });
        return { no, ...(off ? { off } : {}), rate, cells, occ, vac, amount: occ * rate };
    });
    const occ = out.reduce((n, r) => n + r.occ, 0), vac = out.reduce((n, r) => n + r.vac, 0);
    return { building: building.name, from, to, days: nights.map(n => n.day), rooms: out, perDay, occ, vac, payable: out.reduce((n, r) => n + r.amount, 0), noRate, cut };
}

export const money = (n: number) => n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
export const pct = (a: number, b: number) => (b ? Math.round((a / b) * 1000) / 10 : 0);
const esc = (v: unknown) => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
const dShort = (d: string) => new Date(`${d}T12:00`).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
const wd = (d: string) => new Date(`${d}T12:00`).toLocaleDateString('en-GB', { weekday: 'short' });
const when = (t: number) => new Date(t).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
const MARK: Record<Cell, string> = { yes: '✓', no: '✗', gone: '—', off: '·' };

/** The printable statement: page 1 the summary and the day-wise totals, then the full room × date chart (in blocks of dates that fit the page) */
export function hisaabHtml(h: Hisaab, site: string, by: string) {
    const nights = h.occ + h.vac, BLOCK = 16;
    const rates = [...new Set(h.rooms.map(r => r.rate))].sort((a, b) => a - b);
    const rateText = rates.length === 1 ? `SAR ${money(rates[0])} per room per day` : `SAR ${money(rates[0])} – ${money(rates[rates.length - 1])} per room per day (see each room)`;
    const kpi = (label: string, value: string, sub = '') => `<div class="kpi"><span>${esc(label)}</span><b>${esc(value)}</b>${sub ? `<small>${esc(sub)}</small>` : ''}</div>`;
    const dayRows = h.perDay.map(d => `<tr><td>${esc(wd(d.day))} ${esc(dShort(d.day))}</td><td class="n">${d.occ}</td><td class="n">${d.vac}</td><td class="n">${pct(d.occ, d.occ + d.vac)}%</td><td class="r">${money(d.amount)}</td></tr>`).join('');
    const blocks: string[] = [];
    for (let s = 0; s < h.days.length; s += BLOCK) {
        const ds = h.days.slice(s, s + BLOCK), idx = ds.map((_, i) => s + i), last = s + BLOCK >= h.days.length;
        const head = `<tr><th class="rm">Room</th><th class="n">Rate</th>${ds.map(d => `<th class="d">${esc(wd(d))}<br>${esc(dShort(d))}</th>`).join('')}${last ? '<th class="n">Days</th><th class="r">Amount</th>' : ''}</tr>`;
        const body = h.rooms.map(r => `<tr><td class="rm">${esc(r.no)}${r.off ? '<small class="off">inactive</small>' : ''}</td><td class="n">${money(r.rate)}</td>${idx.map(i => `<td class="d ${r.cells[i]}">${MARK[r.cells[i]]}</td>`).join('')}${last ? `<td class="n">${r.occ}</td><td class="r">${money(r.amount)}</td>` : ''}</tr>`).join('');
        const foot = `<tr class="tot"><td class="rm">Occupied</td><td></td>${idx.map(i => `<td class="d">${h.perDay[i].occ}</td>`).join('')}${last ? `<td class="n">${h.occ}</td><td class="r">${money(h.payable)}</td>` : ''}</tr>
            <tr class="tot"><td class="rm">Vacant</td><td></td>${idx.map(i => `<td class="d">${h.perDay[i].vac}</td>`).join('')}${last ? `<td class="n">${h.vac}</td><td></td>` : ''}</tr>`;
        blocks.push(`<h2>Room chart ${h.days.length > BLOCK ? `· ${esc(dShort(ds[0]))} – ${esc(dShort(ds[ds.length - 1]))}` : ''}</h2><table class="grid"><thead>${head}</thead><tbody>${body}</tbody><tfoot>${foot}</tfoot></table>`);
    }
    return `<!doctype html><html><head><meta charset="utf-8"><title>Building Hisaab ${esc(h.building)} ${esc(h.days[0] || '')}</title><style>
        @page { size: A4 landscape; margin: 10mm; }
        * { box-sizing: border-box; }
        html, body { margin: 0; background: #fff; color: #111; font: 9.5pt/1.35 Arial, Helvetica, sans-serif; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        .bar { position: sticky; top: 0; display: flex; gap: 10px; align-items: center; padding: 8px 12px; background: #fffaf1; border-bottom: 1px solid #dcc7a4; font: 13px system-ui, sans-serif; }
        .bar button { font: inherit; padding: 5px 14px; border: 1px solid #b08d2a; border-radius: 8px; background: #b08d2a; color: #fff; font-weight: 700; cursor: pointer; }
        header.top { display: flex; justify-content: space-between; align-items: flex-end; border-bottom: 2.5px solid #7a5c12; padding-bottom: 3mm; margin-bottom: 4mm; }
        header.top h1 { margin: 0; font-size: 18pt; color: #4a3708; letter-spacing: .5px; } header.top .who { text-align: right; font-size: 9pt; color: #444; }
        .meta { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2mm 6mm; margin-bottom: 4mm; font-size: 10pt; } .meta b { color: #4a3708; }
        .kpis { display: grid; grid-template-columns: repeat(5, 1fr); gap: 3mm; margin-bottom: 5mm; }
        .kpi { border: 1px solid #cdb67a; border-radius: 2mm; padding: 2.5mm 3mm; background: #fdf8ec; } .kpi span { display: block; font-size: 8pt; color: #6b5a2e; text-transform: uppercase; letter-spacing: .4px; }
        .kpi b { display: block; font-size: 15pt; color: #2b2105; margin-top: 1mm; } .kpi small { color: #555; }
        .kpi.main { background: #4a3708; border-color: #4a3708; } .kpi.main span, .kpi.main b, .kpi.main small { color: #fff; }
        h2 { font-size: 11.5pt; margin: 0 0 2mm; color: #4a3708; break-after: avoid; }
        table { border-collapse: collapse; width: 100%; } th, td { border: 1px solid #9a8a5e; padding: 1.2mm 1.6mm; }
        th { background: #efe4c4; font-size: 8.5pt; } thead { display: table-header-group; } tfoot { display: table-footer-group; } tr { break-inside: avoid; }
        .n { text-align: center; white-space: nowrap; } .r { text-align: right; white-space: nowrap; }
        .days { width: 60%; } .days td:first-child { white-space: nowrap; }
        table.grid { table-layout: fixed; font-size: 8.5pt; } table.grid th.rm, table.grid td.rm { width: 15mm; text-align: left; font-weight: 700; } table.grid th.d, table.grid td.d { text-align: center; padding: .8mm .3mm; }
        table.grid th.n, table.grid td.n { width: 13mm; } table.grid th.r, table.grid td.r { width: 20mm; }
        td.yes { color: #146c2e; font-weight: 700; } td.off { color: #aaa; background: #fafafa; } small.off { display: block; font-size: 6.5pt; font-weight: 400; color: #8a6d00; } td.no { color: #b42318; } td.gone { color: #888; background: #f1f1f1; }
        tr.tot td { background: #f6efda; font-weight: 700; }
        .page2 { break-before: page; } .page2 + .page2 { break-before: page; }
        .note { font-size: 8.5pt; color: #555; margin-top: 3mm; }
        .sign { display: grid; grid-template-columns: 1fr 1fr; gap: 20mm; margin-top: 12mm; font-size: 9pt; } .sign div { border-top: 1px solid #333; padding-top: 1.5mm; }
        @media screen { body { background: #e9e6df; } .page { width: 277mm; margin: 8mm auto; padding: 10mm; background: #fff; box-shadow: 0 4px 16px rgba(0,0,0,.15); } }
        @media print { .bar { display: none; } }
    </style></head><body>
    <div class="bar"><button type="button" onclick="window.print()">Print / Save as PDF</button><span>A4 landscape — page 1 is the summary, then the room chart</span></div>
    <div class="page">
        <header class="top"><div><h1>Building Hisaab — ${esc(h.building)}</h1><div>${esc(site)}</div></div><div class="who">Prepared ${esc(when(Date.now()))}${by ? `<br>by ${esc(by)}` : ''}</div></header>
        <div class="meta"><div><b>Period:</b> ${esc(when(h.from))} → ${esc(when(h.to))}</div><div><b>Days:</b> ${h.days.length} (24 hours each from ${esc(new Date(h.from).toTimeString().slice(0, 5))})${h.cut ? ' — first 120 only' : ''}</div><div><b>Rooms:</b> ${h.rooms.length}</div><div><b>Charge:</b> ${esc(rateText)}</div><div><b>Room-days:</b> ${nights}</div>${h.noRate ? `<div><b>No charge set:</b> ${h.noRate} room(s)</div>` : ''}</div>
        <div class="kpis">${kpi('Total payable', `SAR ${money(h.payable)}`, 'occupied room-days × charge').replace('class="kpi"', 'class="kpi main"')}${kpi('Room-days occupied', String(h.occ), `${pct(h.occ, nights)}%`)}${kpi('Room-days vacant', String(h.vac), `${pct(h.vac, nights)}%`)}${kpi('Occupancy', `${pct(h.occ, nights)}%`)}${kpi('Vacancy', `${pct(h.vac, nights)}%`)}</div>
        <h2>Day by day</h2>
        <table class="days"><thead><tr><th>Day</th><th class="n">Rooms occupied</th><th class="n">Rooms vacant</th><th class="n">Occupancy</th><th class="r">Payable (SAR)</th></tr></thead>
            <tbody>${dayRows}</tbody><tfoot><tr class="tot"><td>Total</td><td class="n">${h.occ}</td><td class="n">${h.vac}</td><td class="n">${pct(h.occ, nights)}%</td><td class="r">${money(h.payable)}</td></tr></tfoot></table>
        <p class="note">✓ occupied · ✗ vacant · — handed back to the hotel (not counted) · · inactive room, counted only on the days it was occupied. Rooms in number order. A room is occupied on a day when a guest stay is in it at any time of those 24 hours, from the slips of the PMS.</p>
        <div class="sign"><div>Prepared by</div><div>Checked / received by (${esc(h.building)})</div></div>
        ${blocks.map(b => `<section class="page2">${b}</section>`).join('')}
    </div><script>window.addEventListener('load', () => setTimeout(() => window.print(), 300));</script></body></html>`;
}
