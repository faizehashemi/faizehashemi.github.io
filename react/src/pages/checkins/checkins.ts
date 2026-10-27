// Check-ins & Check-outs (Front desk): the data side of the page (moved unchanged from pms/app/views/checkins/view.js): the slips arriving and leaving in a window
// (a delayed group leaves in parts), the split by where a stay comes from / goes to, the totals row, the CSV and the printed table.
// Default window today 03:00 → tomorrow 03:00; "Date to" follows "Date from" unless edited; presets span 03:00 → 03:00 of the next day; an empty or reversed
// range becomes 24 h. The live flight status panel stays switched off (FLIGHT_API in the legacy page): only the Check 1 / Check 2 links are shown.
import type { CoreModules } from '@/pms/types';

type Slip = Record<string, any>;
type Stay = Pick<CoreModules['stay'], 'isDelayed' | 'departuresOf' | 'paxAt'>;
export type Row = Slip & { _dep?: { rooms: any[]; status: string; last: boolean; pax: number } };

const pad = (n: number) => String(n).padStart(2, '0');
export const num = (v: unknown) => { const x = Number(v); return Number.isFinite(x) ? x : 0; };
export const parseDT = (d?: string, t?: string) => { if (!d) return null; const v = new Date(`${d}T${t && t.length ? t : '00:00'}`); return isNaN(v.getTime()) ? null : v; };
export const ymd = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export function plusOneDay(s: string) { if (!s) return ''; const [y, m, d] = s.split('-').map(Number); const dt = new Date(y, (m || 1) - 1, d || 1); dt.setDate(dt.getDate() + 1); return ymd(dt); }
export const fmtDT = (dt: Date | null) => { if (!dt) return ''; try { return dt.toLocaleString([], { year: '2-digit', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' }); } catch { return dt.toISOString().slice(0, 16).replace('T', ' '); } };
const within = (dt: Date | null, a: Date, b: Date) => !!dt && dt >= a && dt <= b;
const byRoom = (a: string, b: string) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });   // 2, 10, 101; 12A after 12

// a partial departure (delayed group, core/stay.js) lists only the rooms leaving then
export function roomsFromSlip(r: Row): string[] {
    if (r._dep) return [...new Set(r._dep.rooms.map(x => String(x.room_no)))].sort(byRoom);
    const bag: string[] = [];
    (r.rooms?.gents || []).forEach((x: any) => bag.push(String(x.room_no || '').trim()));
    (r.rooms?.ladies || []).forEach((x: any) => bag.push(String(x.room_no || '').trim()));
    return Array.from(new Set(bag.filter(Boolean))).sort(byRoom);
}
export function guests(r: Row) { if (r._dep) return r._dep.pax; const tot = num(r.total); if (tot) return tot; return num(r.gents) + num(r.ladies) + num(r.children ?? r.child) + num(r.infants ?? r.infant); }
// Assigned guests: explicit numeric field -> per-room sum -> headcount total
export function assignedCount(r: Row) {
    const direct = Number(r.assigned ?? r.assigned_count ?? r.assignedGuests ?? r.assignedRoomsCount);
    if (Number.isFinite(direct) && direct >= 0) return direct;
    if (r.rooms && (Array.isArray(r.rooms.gents) || Array.isArray(r.rooms.ladies))) {
        const sumAssigned = (arr: any[]) => (Array.isArray(arr) ? arr.reduce((s, x) => s + (Number(x?.assigned) || 0), 0) : 0);
        return sumAssigned(r.rooms.gents) + sumAssigned(r.rooms.ladies);
    }
    return num(r.total) || (num(r.gents) + num(r.ladies) + num(r.children ?? r.child) + num(r.infants ?? r.infant));
}

export function computeWindow(slips: Slip[], start: Date, end: Date, stay: Stay) {
    const ins: Row[] = [], outs: Row[] = [];
    for (const r of slips) {
        const ci = parseDT(r.checkin_date, r.checkin_time), co = parseDT(r.checkout_date, r.checkout_time);
        if (within(ci, start, end)) ins.push(r);
        if (!stay.isDelayed(r)) { if (within(co, start, end)) outs.push(r); continue; }
        // delayed: one check-out row per departure (the rooms and guests leaving then)
        for (const d of stay.departuresOf(r) as any[]) {
            const at = new Date(d.at);
            if (!within(at, start, end)) continue;
            outs.push({ ...r, checkout_date: ymd(at), checkout_time: `${pad(at.getHours())}:${pad(at.getMinutes())}`, _dep: { rooms: d.rooms, status: d.status, last: d.last, pax: stay.paxAt(r, d.at - 1).total - stay.paxAt(r, d.at).total } });
        }
    }
    const t = (r: Row, k: 'checkin' | 'checkout') => +(parseDT(r[`${k}_date`], r[`${k}_time`]) ?? 0);
    ins.sort((a, b) => t(a, 'checkin') - t(b, 'checkin'));
    outs.sort((a, b) => t(a, 'checkout') - t(b, 'checkout'));
    return { ins, outs };
}

/* ===== Split view: where a stay comes from and goes to ===== */
// UMS slips: the stay's place in the group's itinerary (e.g. MAKKAH→MADINA→MAKKAH, 2nd Makkah stay = from Madina, to the airport). Slips made by hand: an SH
// starting with S came from the other city; it leaves for the other city when the same group has a stay there starting within a day of this check-out, else
// for the airport.
const CITY: Record<string, string> = { MAKKAH: 'makkah', MADINA: 'medina' };
export type Place = 'airport' | 'makkah' | 'medina';
export function legOf(r: Row, siteId: string, other: Slip[], baseSh: (s: unknown) => string): { from: Place; to: Place } {
    const otherSite = (siteId === 'makkah' ? 'medina' : 'makkah') as Place;
    const it = String(r.ums?.itinerary || '');
    if (it) {
        const legs = it.split('→').map(c => CITY[c.trim()]);
        const seg = Number(r.ums?.seg) || 1;
        let idx = -1, n = 0;
        for (let i = 0; i < legs.length; i++) if (legs[i] === siteId && ++n === seg) { idx = i; break; }
        if (idx >= 0) return { from: (idx === 0 ? 'airport' : legs[idx - 1]) as Place, to: (idx === legs.length - 1 ? 'airport' : legs[idx + 1]) as Place };
    }
    const from: Place = /^S/i.test(String(r.sh_no ?? '').trim()) ? otherSite : 'airport';
    const co = r.checkout_date, key = baseSh(r.sh_no);
    const day = (d: string, n: number) => { const x = new Date(`${d}T12:00`); x.setDate(x.getDate() + n); return ymd(x); };
    const next = key && co && other.some(o => !o.deleted && baseSh(o.sh_no) === key && o.checkin_date >= day(co, -1) && o.checkin_date <= day(co, 1));
    return { from, to: next ? otherSite : 'airport' };
}

/** [[title, rows]]: one untitled part, or (split view) arrivals by where from / departures by where to. The table, the CSV and Print table all use it. */
export function partsOf(rows: Row[], key: 'checkin' | 'checkout', split: boolean, leg: (r: Row) => { from: Place; to: Place }, otherSite: string, otherLabel: string): [string | null, Row[]][] {
    if (!split) return [[null, rows]];
    const side = key === 'checkin' ? 'from' : 'to';
    const pick = (w: string) => rows.filter(r => leg(r)[side] === w);
    return key === 'checkin'
        ? [['From the airport', pick('airport')], [`From ${otherLabel}`, pick(otherSite)]]
        : [['Departing to the airport', pick('airport')], [`Departing to ${otherLabel}`, pick(otherSite)]];
}

// Totals of what the table shows, as a row: As. (assigned), T (guests), G, L, C, I — the same numbers as the rows above it
export const countsOf = (list: Row[]) => ({
    n: list.length, as: list.reduce((s, r) => s + assignedCount(r), 0), t: list.reduce((s, r) => s + guests(r), 0),
    g: list.reduce((s, r) => s + num(r.gents), 0), l: list.reduce((s, r) => s + num(r.ladies), 0),
    c: list.reduce((s, r) => s + num(r.children ?? r.child), 0), i: list.reduce((s, r) => s + num(r.infants ?? r.infant), 0),
});
export const partSum = (list: Row[]) => `${list.length} slip${list.length === 1 ? '' : 's'} · ${list.reduce((s, r) => s + guests(r), 0)} guests`;

/* ===== CSV ===== */
export const COL_IDS = ['time', 'fl', 'sh', 'group', 'leader', 'building', 'rooms', 'as', 't', 'g', 'l', 'c', 'i', 'other'] as const;
export function toCSV(kind: 'in' | 'out', parts: [string | null, Row[]][], opts: { flights: boolean; hidden: string[]; flightText: (r: Row) => string }) {
    const head = kind === 'in'
        ? ['Check-in', ...(opts.flights ? ['Flight'] : []), 'SH No', 'Group', 'Group Leader', 'Building', 'Rooms', 'As.', 'T', 'G', 'L', 'C', 'I', 'Check-out']
        : ['Check-out', ...(opts.flights ? ['Flight'] : []), 'SH No', 'Group', 'Group Leader', 'Building', 'Rooms', 'As.', 'T', 'G', 'L', 'C', 'I', 'Check-in'];
    const esc = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    // the same columns as the table on screen (Settings → Check-ins page)
    const ids = ['time', ...(opts.flights ? ['fl'] : []), 'sh', 'group', 'leader', 'building', 'rooms', 'as', 't', 'g', 'l', 'c', 'i', 'other'];
    const keep = (i: number) => !opts.hidden.includes(ids[i]);
    const lines: string[] = [];
    for (const [title, list] of parts) {
        if (title) { if (lines.length) lines.push(''); lines.push(esc(`${title} — ${partSum(list)}`)); }
        lines.push(head.filter((_, i) => keep(i)).join(','));
        for (const r of list) {
            const ci = parseDT(r.checkin_date, r.checkin_time), co = parseDT(r.checkout_date, r.checkout_time);
            const mid = [r.sh_no || '', r.tour_name || '', String(r.group_leader ?? '').trim() || '-', (r.building || '').trim(), roomsFromSlip(r).join(' '), assignedCount(r), guests(r), num(r.gents), num(r.ladies), num(r.children ?? r.child), num(r.infants ?? r.infant)];
            const fl = opts.flights ? [opts.flightText(r)] : [];
            const row = kind === 'in' ? [fmtDT(ci), ...fl, ...mid, fmtDT(co)] : [fmtDT(co), ...fl, ...mid, fmtDT(ci)];
            lines.push(row.filter((_, i) => keep(i)).map(esc).join(','));
        }
        const k = countsOf(list), fl = opts.flights ? [''] : [];
        lines.push(['Total', ...fl, '', `${k.n} slips`, '', '', '', k.as, k.t, k.g, k.l, k.c, k.i, ''].filter((_, i) => keep(i)).map(esc).join(','));
    }
    return lines.join('\r\n');
}

/* ===== Print table: A4 landscape, 1 cm margins, in a tab of its own ===== */
const escH = (s: unknown) => String(s ?? '').replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]!));
export function printTableHtml(kind: 'in' | 'out', rows: Row[], parts: [string | null, Row[]][], siteLabel: string, rangeLabel: string) {
    const title = `${kind === 'in' ? 'Check-ins' : 'Check-outs'} · ${siteLabel}`;
    const total = rows.reduce((s, r) => s + guests(r), 0);
    const rowHtml = (r: Row) => {
        const ci = parseDT(r.checkin_date, r.checkin_time), co = parseDT(r.checkout_date, r.checkout_time);
        return `<tr><td>${escH(r.sh_no ?? '')}</td><td><b>${escH(r.tour_name || '-')}</b><br><span class="gl">${escH(String(r.group_leader ?? '').trim() || '-')}</span></td><td>${escH((r.building || '').trim() || '-')}</td><td class="rooms">${escH(roomsFromSlip(r).join(', ') || '-')}</td><td><b>${guests(r)}</b></td><td>${escH(fmtDT(ci))}</td><td>${escH(fmtDT(co))}</td></tr>`;
    };
    const thead = '<thead><tr><th>SH No</th><th>Group / Group Leader</th><th>Building</th><th>Rooms</th><th>Total Pax</th><th>Check-in</th><th>Check-out</th></tr></thead>';
    const colgroup = '<colgroup><col style="width:8%"><col style="width:25%"><col style="width:10%"><col style="width:25%"><col style="width:8%"><col style="width:12%"><col style="width:12%"></colgroup>';
    const tables = parts.map(([t, list]) => (t ? `<h2>${escH(t)} <small>${escH(partSum(list))}</small></h2>` : '') + `<table>${colgroup}${thead}<tbody>${list.length ? list.map(rowHtml).join('') : '<tr><td colspan="7">None in this range.</td></tr>'}</tbody></table>`).join('');
    return `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><title>${escH(title)}</title>
<style>
@page { size: A4 landscape; margin: 10mm; }
html, body { margin: 0; background: #fff; color: #000; font: 11px/1.3 Arial, Helvetica, sans-serif; }
body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
h1 { font-size: 15px; margin: 0 0 2px; text-align: center; }
h2 { font-size: 13px; margin: 10px 0 4px; break-after: avoid; page-break-after: avoid; }
h2 small { font-weight: normal; font-size: 11px; margin-left: 6px; }
.sub { text-align: center; font-size: 11px; margin: 0 0 6px; }
table { width: 100%; border-collapse: collapse; table-layout: fixed; }
th, td { border: 1px solid #000; padding: 3px 4px; text-align: center; vertical-align: middle; overflow-wrap: anywhere; }
th { background: #eee; font-size: 11px; }
thead { display: table-header-group; }
tr { break-inside: avoid; page-break-inside: avoid; }
td .gl { font-size: 10px; }
td.rooms { font-size: 10px; }
.bar { position: sticky; top: 0; display: flex; gap: 10px; align-items: center; padding: 8px 12px; background: #fffaf1; border-bottom: 1px solid #dcc7a4; font: 13px system-ui, sans-serif; }
.bar button { font: inherit; padding: 5px 14px; border: 1px solid #d4af37; border-radius: 8px; background: #d4af37; color: #fff; font-weight: 700; cursor: pointer; }
@media screen { body { background: #e9e6df; } .page { width: 277mm; margin: 10mm auto; padding: 10mm; background: #fff; box-shadow: 0 4px 16px rgba(0,0,0,.15); } }
@media print { .bar { display: none; } }
</style></head>
<body>
<div class="bar"><button type="button" onclick="window.print()">Print</button><span>A4 landscape · 1 cm margins — choose A4 and Landscape if the printer asks</span></div>
<div class="page">
<h1>${escH(title)}</h1>
<p class="sub">${escH(rangeLabel)} · ${rows.length} group${rows.length === 1 ? '' : 's'} · ${total} pax</p>
${tables}
</div>
<script>
window.addEventListener('load', function () { setTimeout(function () { window.focus(); window.print(); }, 250); });
</script>
</body></html>`;
}
