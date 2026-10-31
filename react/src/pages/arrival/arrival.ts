// The Arrival sheet (Transport): everyone reaching this site's hotels on a day — the groups coming by bus from the other city first (numbered as the other
// site's transport list numbers them), then the groups that land at an airport — each with the time they are expected at the hotel, the floor and the pax.
// The rows come from this site's slips (check-in that day) and the other site's transport day; nothing here is saved.
type Row = Record<string, any>;

const esc = (s: unknown) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string));
const base = (sh: unknown) => String(sh ?? '').trim().replace(/^S(?=\d)/i, '');
/** the airport a site's own city is served by; a landing anywhere else counts as "another city" */
export const HOME_PORT: Record<string, string> = { makkah: 'JEDDAH', medina: 'MADINA' };
const portName = (p: string) => { const u = String(p || '').trim().toUpperCase(); return u === 'MEDINA' || u === 'MADINAH' ? 'MADINA' : u; };
export const otherSite = (id: string) => (id === 'makkah' ? 'medina' : 'makkah');
/** the other site's destination that ends at this site */
export const INBOUND_DEST: Record<string, string> = { medina: 'madina', makkah: 'mdmakkah' };

export type ArrivalRow = { kind: 'bus' | 'air' | 'other'; bus: string; time: string; ref: string; group: string; leader: string; floor: string; pax: number; order: number[] };
type Libs = { T: any; floorOf: (room: string) => string; shiftTime: (d: string, t: string, h: number) => { date: string; time: string }; byRoad: (leg: Row) => boolean };

const natural = (a: string, b: string) => a.localeCompare(b, undefined, { numeric: true });
const floorsOf = (s: Row | undefined, floorOf: Libs['floorOf']) => !s ? '' : [...new Set(['gents', 'ladies'].flatMap(k => (s.rooms?.[k] || []).map((r: Row) => String(r.room_no || '').trim()).filter(Boolean).map((r: string) => String(floorOf(r) ?? '').trim()).filter(Boolean)))].sort(natural).join(', ');
const slipPaxOf = (s: Row) => Number(s.total) || ['gents', 'ladies', 'children', 'infants'].reduce((n, k) => n + (Number(s[k]) || 0), 0);

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
            rows.push({
                kind: 'bus', bus: String(T.vehicleNo(b.bus, b.vehicle, b.vlabel) || ''), time: t ? T.time12(`${t.date}T${t.time}`) : '', ref: String(r.ref ?? ''), group: String(r.operator || s?.tour_name || ''),
                leader: String(r.leader || s?.group_leader || '').trim(), floor: floorsOf(s, floorOf), pax: Number(r.pax) || (s ? slipPaxOf(s) : 0), order: [VORD[b.vehicle] ?? 3, b.bus ?? 1e9],
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
        rows.push({ kind, bus: kind === 'air' ? 'AIRPORT' : '', time, ref: String(s.sh_no ?? ''), group: String(s.tour_name || ''), leader: String(s.group_leader || '').trim(), floor: floorsOf(s, floorOf), pax: slipPaxOf(s), order: [kind === 'air' ? 5 : 4, ord] });
    }
    return rows.sort((a, b) => a.order[0] - b.order[0] || a.order[1] - b.order[1] || natural(a.ref, b.ref));
}

export const ARRIVAL_CSS = `
.arr { width: 100%; border-collapse: collapse; table-layout: fixed; color: #000; background: #fff; font-family: "Times New Roman", Times, serif; }
.arr th, .arr td { border: 1.5px solid #000; padding: 1.2mm 2mm; text-align: center; vertical-align: middle; }
.arr .ttl th { background: #ffff00; font: 900 34pt Arial, Helvetica, sans-serif; padding: 1mm; }
.arr .dt th { font: 900 24pt Arial, Helvetica, sans-serif; background: #fff; }
.arr .dt th.v { background: #9fc5e8; color: #e00000; }
.arr .hd th { background: #f4b183; font: 700 9.5pt Arial, Helvetica, sans-serif; }
.arr .hd th.fl { color: #e00000; }
.arr td { font-weight: 700; font-size: 10.5pt; text-transform: uppercase; }
.arr td.bus { font: 900 28pt Arial, Helvetica, sans-serif; color: #e00000; line-height: 1; }
.arr td.bus.air { font-size: 17pt; }
.arr td.fl { font: 900 20pt Arial, Helvetica, sans-serif; color: #e00000; }
.arr td.px { font: 900 16pt Arial, Helvetica, sans-serif; }
.arr td.tm { font: 700 12pt Arial, Helvetica, sans-serif; text-transform: none; white-space: nowrap; }
.arr td.ref { font: 700 10pt Times, serif; }
.arr tfoot td { font: 900 15pt Arial, Helvetica, sans-serif; background: #fff; }
.arr tbody tr { break-inside: avoid; page-break-inside: avoid; }
.arr thead { display: table-header-group; }
.arr .none { padding: 8mm; font: 400 12pt Arial, sans-serif; text-transform: none; }
`;

export function arrivalHtml(rows: ArrivalRow[], dateText: string) {
    const total = rows.reduce((n, r) => n + r.pax, 0);
    return `<table class="arr">
      <colgroup><col style="width:9%"><col style="width:11%"><col style="width:8%"><col style="width:26%"><col style="width:26%"><col style="width:10%"><col style="width:10%"></colgroup>
      <thead>
        <tr class="ttl"><th colspan="7">ARRIVAL</th></tr>
        <tr class="dt"><th colspan="3">DATE:-</th><th class="v" colspan="4">${esc(dateText)}</th></tr>
        <tr class="hd"><th>BUS NO</th><th>ARRIVAL<br>TIME</th><th>REF NO</th><th>GROUP NAME</th><th></th><th class="fl">FLOOR</th><th>PAX</th></tr>
      </thead>
      <tbody>${rows.length ? rows.map(r => `<tr><td class="bus${r.kind === 'air' ? ' air' : ''}">${esc(r.bus)}</td><td class="tm">${esc(r.time)}</td><td class="ref">${esc(r.ref)}</td><td>${esc(r.group)}</td><td>${esc(r.leader || '-')}</td><td class="fl">${esc(r.floor)}</td><td class="px">${r.pax || ''}</td></tr>`).join('')
        : '<tr><td class="none" colspan="7">No arrivals for this day.</td></tr>'}</tbody>
      <tfoot><tr><td colspan="6">TOTAL</td><td>${total}</td></tr></tfoot>
    </table>`;
}
