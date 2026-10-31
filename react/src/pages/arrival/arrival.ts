// The Arrival sheet (Transport): everyone reaching this site's hotels on a day — the groups coming by bus from the other city first (numbered as the other
// site's transport list numbers them), then the groups that land at an airport — each with the time they are expected at the hotel, the floor most of the
// group's rooms are on, and the pax (male · female · children · infants · total).
// The rows come from this site's slips (check-in that day) and the other site's transport day. The desks may then change any cell, add or hide rows and
// rename the headings: those edits (a Sheet) are kept for this sheet only (GET/PUT /api/arrival-sheet) and are laid over the rows here — they never change
// a slip or the transport list, and arrivals added in the PMS later still appear.
type Row = Record<string, any>;

const esc = (s: unknown) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string));
const base = (sh: unknown) => String(sh ?? '').trim().replace(/^S(?=\d)/i, '');
/** the airport a site's own city is served by; a landing anywhere else counts as "another city" */
export const HOME_PORT: Record<string, string> = { makkah: 'JEDDAH', medina: 'MADINA' };
const portName = (p: string) => { const u = String(p || '').trim().toUpperCase(); return u === 'MEDINA' || u === 'MADINAH' ? 'MADINA' : u; };
export const otherSite = (id: string) => (id === 'makkah' ? 'medina' : 'makkah');
/** the other site's destination that ends at this site */
export const INBOUND_DEST: Record<string, string> = { medina: 'madina', makkah: 'mdmakkah' };

export type ArrivalRow = { key: string; kind: 'bus' | 'air' | 'other'; bus: string; time: string; ref: string; group: string; leader: string; floor: string;
    m: number | null; f: number | null; c: number | null; i: number | null; pax: number; order: number[] };
type Libs = { T: any; floorOf: (room: string) => string; shiftTime: (d: string, t: string, h: number) => { date: string; time: string }; byRoad: (leg: Row) => boolean };

const natural = (a: string, b: string) => a.localeCompare(b, undefined, { numeric: true });
/** the floor most of the slip's rooms are on (a tie goes to the lower floor) */
export const mainFloor = (s: Row | undefined, floorOf: Libs['floorOf']) => {
    if (!s) return '';
    const rooms = [...new Set(['gents', 'ladies'].flatMap(k => (s.rooms?.[k] || []).map((r: Row) => String(r.room_no || '').trim()).filter(Boolean)))] as string[];
    const count = new Map<string, number>();
    for (const r of rooms) { const f = String(floorOf(r) ?? '').trim(); if (f) count.set(f, (count.get(f) || 0) + 1); }
    return [...count].sort((a, b) => b[1] - a[1] || natural(a[0], b[0]))[0]?.[0] ?? '';
};
const slipPaxOf = (s: Row) => Number(s.total) || ['gents', 'ladies', 'children', 'infants'].reduce((n, k) => n + (Number(s[k]) || 0), 0);
const split = (s: Row | undefined) => (s ? { m: Number(s.gents) || 0, f: Number(s.ladies) || 0, c: Number(s.children) || 0, i: Number(s.infants) || 0 } : { m: null, f: null, c: null, i: null });

export function buildArrival({ day, hostId, slips, buses, hours, libs }: { day: string; hostId: string; slips: Row[]; buses: Row[]; hours: { own: number; other: number }; libs: Libs }): ArrivalRow[] {
    const { T, floorOf, shiftTime, byRoad } = libs;
    const mine = slips.filter(s => !s.deleted && s.checkin_date === day);
    const slipOf = (ref: string) => { const m = slips.filter(s => !s.deleted && base(s.sh_no) === ref); return m.find(s => s.checkin_date === day) || m[0]; };
    const used = new Set<number>();
    const rows: ArrivalRow[] = [];
    const VORD: Record<string, number> = { bus: 0, car: 1, other: 2 };
    for (const b of buses) {
        const t = b.at ? shiftTime(String(b.at).slice(0, 10), String(b.at).slice(11, 16), hours.other) : null;
        for (const r of b.rows as Row[]) {
            const ref = base(r.ref), s = slipOf(ref);
            if (s) used.add(s.id);
            const busNo = String(T.vehicleNo(b.bus, b.vehicle, b.vlabel) || '');
            rows.push({
                key: `bus|${busNo}|${String(r.ref ?? '')}`, kind: 'bus', bus: busNo, time: t ? T.time12(`${t.date}T${t.time}`) : '', ref: String(r.ref ?? ''), group: String(r.operator || s?.tour_name || ''),
                leader: String(r.leader || s?.group_leader || '').trim(), floor: mainFloor(s, floorOf), ...split(s), pax: Number(r.pax) || (s ? slipPaxOf(s) : 0), order: [VORD[b.vehicle] ?? 3, b.bus ?? 1e9],
            });
        }
    }
    for (const s of mine.filter(x => !used.has(x.id))) {
        const a = s.ums?.arrival;
        let time = '', kind: ArrivalRow['kind'] = 'other', ord = 1e9;
        if (a?.date && a?.time) {
            if (byRoad(a)) time = T.time12(`${a.date}T${a.time}`);
            else {
                kind = 'air';
                const t = shiftTime(a.date, a.time, portName(a.port) === HOME_PORT[hostId] ? hours.own : hours.other);
                time = T.time12(`${t.date}T${t.time}`); ord = Number(`${t.date.replace(/-/g, '')}${t.time.replace(':', '')}`);
            }
        } else if (s.checkin_time) time = T.time12(`${s.checkin_date}T${s.checkin_time}`);
        rows.push({ key: `${kind}|${String(s.sh_no ?? '')}`, kind, bus: kind === 'air' ? 'AIRPORT' : '', time, ref: String(s.sh_no ?? ''), group: String(s.tour_name || ''), leader: String(s.group_leader || '').trim(),
            floor: mainFloor(s, floorOf), ...split(s), pax: slipPaxOf(s), order: [kind === 'air' ? 5 : 4, ord] });
    }
    return rows.sort((a, b) => a.order[0] - b.order[0] || a.order[1] - b.order[1] || natural(a.ref, b.ref));
}

/* ---------------- the desks' edits ---------------- */
export const FIELDS = ['bus', 'time', 'ref', 'group', 'leader', 'floor', 'm', 'f', 'c', 'i', 'pax'] as const;
export type Field = typeof FIELDS[number];
export const NUM_FIELDS: Field[] = ['m', 'f', 'c', 'i', 'pax'];
export type Sheet = { labels?: Record<string, string>; cells?: Record<string, Partial<Record<Field, string>>>; added?: { key: string; v: Partial<Record<Field, string>> }[]; hidden?: string[] };
export type ShownRow = { key: string; kind: string; added: boolean; edited: Partial<Record<Field, boolean>>; v: Record<Field, string> };
export const LABELS: Record<string, string> = {
    title: 'ARRIVAL', dateLbl: 'DATE:-', bus: 'BUS NO', time: 'ARRIVAL\nTIME', ref: 'REF NO', group: 'GROUP NAME', leader: '', floor: 'FLOOR',
    pax: 'PAX', m: 'MALE', f: 'FEMALE', c: 'CHILD', i: 'INFANT', total: 'TOTAL', sum: 'TOTAL',
};
const asText = (n: number | null) => (n == null ? '' : String(n));

/** the rows as shown: the PMS rows (minus hidden ones) with the desks' cell changes on top, then the rows the desks added */
export function applySheet(rows: ArrivalRow[], sheet: Sheet | null | undefined): ShownRow[] {
    const cells = sheet?.cells || {}, hidden = new Set(sheet?.hidden || []);
    const out: ShownRow[] = rows.filter(r => !hidden.has(r.key)).map(r => {
        const own = cells[r.key] || {};
        const v = { bus: r.bus, time: r.time, ref: r.ref, group: r.group, leader: r.leader || '-', floor: r.floor, m: asText(r.m), f: asText(r.f), c: asText(r.c), i: asText(r.i), pax: r.pax ? String(r.pax) : '' } as Record<Field, string>;
        const edited: ShownRow['edited'] = {};
        for (const k of FIELDS) if (own[k] != null) { v[k] = own[k] as string; edited[k] = true; }
        return { key: r.key, kind: r.kind, added: false, edited, v };
    });
    for (const a of sheet?.added || []) out.push({ key: a.key, kind: 'added', added: true, edited: {}, v: Object.fromEntries(FIELDS.map(k => [k, String(a.v?.[k] ?? '')])) as Record<Field, string> });
    return out;
}
export const label = (sheet: Sheet | null | undefined, id: string, dateText = '') => sheet?.labels?.[id] ?? (id === 'date' ? dateText : LABELS[id] ?? '');
const num = (s: string) => { const n = Number(String(s).replace(/[^\d.-]/g, '')); return Number.isFinite(n) ? n : 0; };
export const columnTotal = (rows: ShownRow[], k: Field) => rows.reduce((n, r) => n + num(r.v[k]), 0);

/** the bus-number cell's size class: numbers big, words (AIRPORT, TRAIN, CAR …) smaller so they fit the narrow column */
export const busSize = (t: string) => { const s = String(t || '').trim(); return /^\d{1,3}$/.test(s) ? 'n' : s.length <= 3 ? 'w3' : s.length <= 5 ? 'w5' : 'w8'; };

export const ARRIVAL_CSS = `
.arr { width: 100%; border-collapse: collapse; table-layout: fixed; color: #000; background: #fff; font-family: "Times New Roman", Times, serif; }
.arr th, .arr td { border: 1.5px solid #000; padding: 1.2mm 1.5mm; text-align: center; vertical-align: middle; overflow-wrap: anywhere; }
.arr .ttl th { background: #ffff00; font: 900 34pt Arial, Helvetica, sans-serif; padding: 1mm; }
.arr .dt th { font: 900 24pt Arial, Helvetica, sans-serif; background: #fff; }
.arr .dt th.v { background: #9fc5e8; color: #e00000; }
.arr .hd th { background: #f4b183; font: 700 9pt Arial, Helvetica, sans-serif; white-space: pre-line; }
.arr .hd th.fl { color: #e00000; }
.arr .hd th.sub { font-size: 8pt; padding: 1mm 0.5mm; }
.arr td { font-weight: 700; font-size: 10pt; text-transform: uppercase; }
.arr td.bus { font: 900 22pt Arial, Helvetica, sans-serif; color: #e00000; line-height: 1; white-space: nowrap; overflow: hidden; padding-left: 0.5mm; padding-right: 0.5mm; }
.arr td.bus.w3 { font-size: 15pt; } .arr td.bus.w5 { font-size: 12pt; } .arr td.bus.w8 { font-size: 10pt; }
.arr td.fl { font: 900 20pt Arial, Helvetica, sans-serif; color: #e00000; }
.arr td.px { font: 900 13pt Arial, Helvetica, sans-serif; padding-left: 0.5mm; padding-right: 0.5mm; }
.arr td.px.tot { font-size: 16pt; }
.arr td.tm { font: 700 11pt Arial, Helvetica, sans-serif; text-transform: none; }
.arr td.ref { font: 700 10pt Times, serif; }
.arr tfoot td { font: 900 14pt Arial, Helvetica, sans-serif; background: #fff; }
.arr tbody tr { break-inside: avoid; page-break-inside: avoid; }
.arr thead { display: table-header-group; }
.arr .none { padding: 8mm; font: 400 12pt Arial, sans-serif; text-transform: none; }
`;
// bus · time · ref · group · leader · floor · male · female · child · infant · total
export const COL_WIDTHS = ['10%', '9%', '8%', '19%', '17%', '7%', '5.5%', '5.5%', '5%', '5%', '9%'];

/** the sheet as plain HTML — for Print and Copy image (the page itself shows the same table with editable cells) */
export function arrivalHtml(rows: ShownRow[], sheet: Sheet | null | undefined, dateText: string) {
    const L = (id: string) => esc(label(sheet, id, dateText));
    return `<table class="arr">
      <colgroup>${COL_WIDTHS.map(w => `<col style="width:${w}">`).join('')}</colgroup>
      <thead>
        <tr class="ttl"><th colspan="11">${L('title')}</th></tr>
        <tr class="dt"><th colspan="3">${L('dateLbl')}</th><th class="v" colspan="8">${L('date')}</th></tr>
        <tr class="hd"><th rowspan="2">${L('bus')}</th><th rowspan="2">${L('time')}</th><th rowspan="2">${L('ref')}</th><th rowspan="2">${L('group')}</th><th rowspan="2">${L('leader')}</th><th rowspan="2" class="fl">${L('floor')}</th><th colspan="5">${L('pax')}</th></tr>
        <tr class="hd"><th class="sub">${L('m')}</th><th class="sub">${L('f')}</th><th class="sub">${L('c')}</th><th class="sub">${L('i')}</th><th class="sub">${L('total')}</th></tr>
      </thead>
      <tbody>${rows.length ? rows.map(r => `<tr><td class="bus ${busSize(r.v.bus)}">${esc(r.v.bus)}</td><td class="tm">${esc(r.v.time)}</td><td class="ref">${esc(r.v.ref)}</td><td>${esc(r.v.group)}</td><td>${esc(r.v.leader)}</td><td class="fl">${esc(r.v.floor)}</td>`
        + (['m', 'f', 'c', 'i'] as Field[]).map(k => `<td class="px">${esc(r.v[k])}</td>`).join('') + `<td class="px tot">${esc(r.v.pax)}</td></tr>`).join('')
        : '<tr><td class="none" colspan="11">No arrivals for this day.</td></tr>'}</tbody>
      <tfoot><tr><td colspan="6">${L('sum')}</td>${(['m', 'f', 'c', 'i', 'pax'] as Field[]).map(k => `<td>${columnTotal(rows, k)}</td>`).join('')}</tr></tfoot>
    </table>`;
}
