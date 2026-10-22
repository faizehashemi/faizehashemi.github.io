// Delayed Departure Report (Excel), from the Delayed departures page — one row per partial departure of each delayed
// group, in the desks' layout: booking, group, pax, the actual schedule (arrival, Makkah → Madina, Madina → Makkah,
// departure), remaining pax, pax departed, balance, the extended departure date, days extended and beds used
// (= guests who left × days extended). Infants are left out of every count: they are never given a bed.
// Only departures after the group's Madina → Makkah date (Column M) are listed; a group with no such date: after
// its airport departure (Column N).
// Makkah → Madina / Madina → Makkah: from the UMS import (madinaDate / makkahDate), else from the group's other stays
// (its Madina stay, its second Makkah stay "S…").
// Split groups: a desk may move part of a group to a slip of its own (E42878 / ES42878 next to 42878 / S42878).
// Slips of the same site whose SH has the same digits and whose stays overlap are reported as one group:
// the pax columns add up to the whole booking and every part's departures are rows of that group.

import { loadScript } from '../../core/lib.js';
import { isDelayed, paxAt, departuresOf, slipStart, slipEnd } from '../../core/stay.js';
import { baseSh } from '../../core/ums.js';

const EXCELJS = 'https://cdn.jsdelivr.net/npm/exceljs@4.4.0/dist/exceljs.min.js';
const pad = (n) => String(n).padStart(2, '0');
const dmy = (iso) => { const m = String(iso || '').match(/^(\d{4})-(\d{2})-(\d{2})/); return m ? `${m[3]}-${m[2]}-${m[1]}` : ''; };
const ymdOf = (ms) => { const d = new Date(ms); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; };
const days = (a, b) => Math.round((Date.parse(`${b}T12:00`) - Date.parse(`${a}T12:00`)) / 864e5);
const cap = (s) => { const t = String(s || '').trim().toLowerCase(); return t ? t[0].toUpperCase() + t.slice(1) : ''; };
const num = (v) => { const x = Number(v); return Number.isFinite(x) ? x : 0; };
// 42878, S42878, E42878, ES42878 → "42878"
const digitsOf = (sh) => String(sh ?? '').trim().toUpperCase().replace(/^[A-Z]+(?=\d)/, '');

/** The rows of the report (also used to count before writing). */
/** range: { from, to } 'YYYY-MM-DD' — only departures (Extended Departure Date) inside it; SR NO counts the groups shown */
export function reportRows(slips, all, range = {}) {
    const delayed = slips.filter(s => !s.deleted && isDelayed(s))
        .sort((a, b) => String(a.delayed?.original_checkout?.date || a.checkout_date).localeCompare(String(b.delayed?.original_checkout?.date || b.checkout_date)) || String(a.sh_no).localeCompare(String(b.sh_no), undefined, { numeric: true }));
    const out = [], done = new Set();
    delayed.forEach((s, gi) => {
        if (done.has(s.id)) return; // already reported as part of a split group
        const u = s.ums || {}, key = baseSh(s.sh_no);
        const a0 = slipStart(s), z0 = slipEnd(s);
        const parts = [s, ...all.filter(o => !o.deleted && o.id !== s.id && o.site === s.site && digitsOf(o.sh_no) === digitsOf(s.sh_no)
            && slipStart(o) < z0 && slipEnd(o) > a0)];
        parts.forEach(p => done.add(p.id));
        const sum = (f) => parts.reduce((n, p) => n + num(f(p)), 0);
        const at = (t) => parts.map(p => paxAt(p, t)).reduce((x, y) => ({ gents: x.gents + y.gents, ladies: x.ladies + y.ladies, children: x.children + y.children }), { gents: 0, ladies: 0, children: 0 });
        // every part's departures, one row per moment (two parts leaving together are one row)
        const events = new Map();
        for (const p of parts) for (const d of departuresOf(p)) if (!events.has(d.at)) events.set(d.at, d);
        const split = parts.length > 1 ? `\n(${parts.map(p => `${p.sh_no} ${num(p.gents) + num(p.ladies) + num(p.children ?? p.child)}`).join(' + ')})` : '';
        const others = all.filter(o => !o.deleted && o.id !== s.id && baseSh(o.sh_no) === key);
        const medina = [s, ...others].find(o => o.site === 'medina');
        const second = [s, ...others].find(o => o.site === 'makkah' && /^S/i.test(String(o.sh_no)));
        const toMadina = u.madinaDate || (medina && (u.firstArrival || 'MAKKAH') !== 'MADINA' ? medina.checkin_date : '');
        // the airport departure (Column N): from the group's latest UMS import — each stay keeps the date of its own import
        const airport = [s, ...others].filter(o => o.ums?.departure?.date)
            .sort((a, b) => String(b.ums.importedAt || '').localeCompare(String(a.ums.importedAt || '')))[0]?.ums.departure.date;
        const toMakkah = u.makkahDate || (second ? second.checkin_date : (medina && u.firstArrival === 'MADINA' ? medina.checkout_date : ''));
        const g = sum(p => p.gents), l = sum(p => p.ladies), c = sum(p => p.children ?? p.child);
        const booked = s.delayed?.original_checkout?.date || s.checkout_date;
        for (const d of [...events.values()].sort((x, y) => x.at - y.at)) {
            const before = at(d.at - 1), after = at(d.at);
            const adults = (before.gents + before.ladies) - (after.gents + after.ladies);
            // infants have no bed of their own: not counted in CH, the pax columns or the beds used
            const beds = (p) => p.gents + p.ladies + p.children;
            const ch = before.children - after.children;
            const left = beds(before) - beds(after);
            // days extended = Extended Departure Date − Departure (the column shown)
            const depDay = airport || booked;
            const ext = ymdOf(d.at), extDays = days(depDay, ext);
            if ((range.from && ext < range.from) || (range.to && ext > range.to)) continue;
            // only stays past the Madina → Makkah date (Column M): a group held over on the first leg (Makkah before
            // Madina) leaves before it and is not listed. No Column M date: past the airport departure (Column N).
            const cutoff = String(toMakkah || '').slice(0, 10) || depDay;
            if (!(ext > cutoff)) continue;
            out.push({
                sr: gi + 1, ref: (key || String(s.sh_no ?? '')) + split, kind: u.family ? 'Individual' : 'Group', operator: u.operator || s.tour_name || '',
                leader: String(s.group_leader || u.glName || '').trim() || '-', country: u.country || '', first: cap(u.firstArrival || (s.site === 'medina' ? 'Madina' : 'Makkah')),
                a: g + l, ch: c, tot: g + l + c,
                arrival: dmy(u.arrival?.date || s.checkin_date), toMadina: dmy(toMadina), toMakkah: dmy(toMakkah), departure: dmy(depDay),
                remaining: beds(before), da: adults, dch: ch, dt: left, balance: beds(after),
                extended: dmy(ext), extDays, beds: left * Math.max(0, extDays), status: d.status,
            });
        }
    });
    // SR NO: 1, 2, 3 … for the groups that have a departure in the range
    const sr = new Map();
    for (const r of out) { if (!sr.has(r.sr)) sr.set(r.sr, sr.size + 1); r.sr = sr.get(r.sr); }
    return out;
}

export async function exportReport(rows, siteLabel, range = {}) {
    const span = range.from || range.to ? ` · ${range.from ? dmy(range.from) : '…'} to ${range.to ? dmy(range.to) : '…'}` : '';
    await loadScript(EXCELJS);
    const wb = new window.ExcelJS.Workbook();
    const ws = wb.addWorksheet('Delayed Departure Report', { views: [{ state: 'frozen', ySplit: 3 }], pageSetup: { orientation: 'landscape', fitToPage: true, fitToWidth: 1, fitToHeight: 0, paperSize: 9 } });
    const thin = { style: 'thin', color: { argb: 'FF000000' } }, border = { top: thin, left: thin, bottom: thin, right: thin };
    const fill = (argb) => ({ type: 'pattern', pattern: 'solid', fgColor: { argb } });
    const C = { blue: 'FFDCE6F1', grey: 'FFD9D9D9', green: 'FFE2EFDA', balance: 'FFB4C6E7', red: 'FFFF7C80', white: 'FFFFFFFF' };
    ws.columns = [6, 10, 12, 18, 26, 10, 9, 5, 5, 6, 11, 12, 12, 11, 10, 5, 5, 5, 6, 12, 10, 11].map(width => ({ width }));

    ws.mergeCells('A1:V1');
    Object.assign(ws.getCell('A1'), { value: `Delayed Departure Report${siteLabel ? ` · ${siteLabel}` : ''}${span}` });
    ws.getCell('A1').font = { bold: true, size: 16, color: { argb: 'FFFF0000' } };
    ws.getCell('A1').alignment = { horizontal: 'center', vertical: 'middle' };
    ws.getRow(1).height = 26;

    // two header rows: groups on row 2, sub-columns on row 3
    const single = [['A', 'SR NO'], ['B', 'Booking Ref'], ['C', 'Individuals / Groups'], ['D', 'Tour Operator'], ['E', 'Group Leader Name'], ['F', 'Country'], ['G', 'First Arrival'],
        ['O', 'Remaining Pax'], ['S', 'Balance Pax'], ['T', 'Extended Departure Date'], ['U', 'No. Of Days Extended'], ['V', 'No. of Beds Used']];
    for (const [col, text] of single) { ws.mergeCells(`${col}2:${col}3`); ws.getCell(`${col}2`).value = text; }
    for (const [range, text] of [['H2:J2', 'Count of Pax in Group'], ['K2:N2', 'Actual Schedule'], ['P2:R2', 'Count of Pax Departed']]) { ws.mergeCells(range); ws.getCell(range.split(':')[0]).value = text; }
    [['H3', 'A'], ['I3', 'CH'], ['J3', 'Tot'], ['K3', 'Arrival'], ['L3', 'MAKKAH TO MADINA'], ['M3', 'Madina - Makkah'], ['N3', 'Departure'], ['P3', 'A'], ['Q3', 'CH'], ['R3', 'T']]
        .forEach(([a, t]) => { ws.getCell(a).value = t; });
    for (const r of [2, 3]) {
        ws.getRow(r).height = r === 2 ? 30 : 30;
        for (let c = 1; c <= 22; c++) {
            const cell = ws.getCell(r, c);
            cell.font = { bold: true, size: 11 };
            cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
            cell.border = border;
        }
    }
    ws.getCell('B2').font = { bold: true, size: 11, color: { argb: 'FFC00000' } };
    ws.getCell('L3').font = { bold: true, size: 11, color: { argb: 'FF7030A0' } };
    ws.getCell('O2').fill = fill(C.green);
    ws.getCell('S2').fill = fill(C.balance);
    for (const a of ['T2', 'U2', 'V2']) ws.getCell(a).fill = fill(C.red);

    rows.forEach((x, k) => {
        const row = ws.addRow([x.sr, x.ref, x.kind, x.operator, x.leader, x.country, x.first, x.a, x.ch, x.tot,
            x.arrival, x.toMadina, x.toMakkah, x.departure, x.remaining, x.da, x.dch, x.dt, x.balance, x.extended, x.extDays, x.beds]);
        row.height = 42;
        row.eachCell({ includeEmpty: true }, (cell, c) => {
            cell.border = border;
            cell.alignment = { horizontal: c === 4 || c === 5 ? 'left' : 'center', vertical: 'middle', wrapText: true };
            cell.font = { size: c === 5 ? 9 : 11 };
            cell.fill = fill(c >= 11 && c <= 14 ? C.grey : c >= 15 && c <= 15 ? C.green : c === 19 ? C.balance : c >= 20 ? C.white : C.blue);
        });
        row.getCell(2).font = { bold: true, size: 11, color: { argb: 'FFC65911' } };
        for (const c of [4, 5, 10, 16, 17, 18]) row.getCell(c).font = { ...row.getCell(c).font, color: { argb: 'FF2F5597' } };
        row.getCell(12).font = { bold: true, size: 11, color: { argb: 'FF7030A0' } };
        row.getCell(13).font = { bold: true, size: 11 };
    });

    const buf = await wb.xlsx.writeBuffer();
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }));
    const d = new Date();
    a.download = `Delayed Departure Report${siteLabel ? ` ${siteLabel}` : ''}${range.from || range.to ? ` ${range.from ? dmy(range.from) : ''} to ${range.to ? dmy(range.to) : ''}` : ` ${pad(d.getDate())}-${pad(d.getMonth() + 1)}-${d.getFullYear()}`}.xlsx`;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}
