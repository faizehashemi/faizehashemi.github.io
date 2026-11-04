// Vacancy reports of Occupancy details, for printing: which rooms stood empty in a period, from the same numbers as the page (a night is counted at 22:00).
// A room is empty on a night when no bed in it is in use; rooms with some beds free are not empty. Only active rooms of Rooms & Buildings count.
//   by date: each date, the empty rooms of each building, with counts and a total
//   by room: each room that was empty at least one night, on which dates, with counts and a total
import type { Model, RoomOut } from './occupancy';

const esc = (v: unknown) => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
const dLabel = (d: string) => new Date(`${d}T12:00`).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
const wLabel = (d: string) => new Date(`${d}T12:00`).toLocaleDateString('en-GB', { weekday: 'short' });
const counted = (r: RoomOut) => !r.off && r.cap > 0;

export type DateRow = { day: string; blds: { name: string; rooms: string[]; beds: number }[]; rooms: number; beds: number };
export type RoomRow = { building: string; room: string; cap: number; days: string[] };

export function vacancyByDate(m: Model): DateRow[] {
    return m.days.map((day, i) => {
        const blds = m.blds.map(b => {
            const free = b.rooms.filter(r => counted(r) && !r.used[i]);
            return { name: b.name, rooms: free.map(r => r.no), beds: free.reduce((n, r) => n + r.cap, 0) };
        });
        return { day, blds, rooms: blds.reduce((n, b) => n + b.rooms.length, 0), beds: blds.reduce((n, b) => n + b.beds, 0) };
    });
}

export function vacancyByRoom(m: Model): RoomRow[] {
    return m.blds.flatMap(b => b.rooms.filter(counted).map(r => ({ building: b.name, room: r.no, cap: r.cap, days: m.days.filter((_, i) => !r.used[i]) })).filter(r => r.days.length));
}

/** consecutive dates as ranges: ["…-03", "…-04", "…-05", "…-09"] → "03 Nov – 05 Nov, 09 Nov" */
export function dateRanges(days: string[], all: string[]) {
    const out: string[] = [];
    let start = -1, prev = -2;
    const close = () => { if (start >= 0) out.push(start === prev ? dLabel(all[start]) : `${dLabel(all[start])} – ${dLabel(all[prev])}`); };
    for (const d of days) {
        const i = all.indexOf(d);
        if (i !== prev + 1) { close(); start = i; }
        prev = i;
    }
    close();
    return out.join(', ');
}

const page = (title: string, sub: string, body: string) => `<!doctype html><html><head><meta charset="utf-8"><title>${esc(title)}</title><style>
    @page { size: A4 portrait; margin: 10mm; }
    * { box-sizing: border-box; }
    html, body { margin: 0; padding: 0; background: #fff; color: #000; font: 10pt/1.3 Arial, Helvetica, sans-serif; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    h1 { font-size: 14pt; margin: 0 0 1mm; } p.sub { margin: 0 0 3mm; font-size: 9pt; color: #333; }
    table { width: 100%; border-collapse: collapse; table-layout: fixed; }
    thead { display: table-header-group; }
    th, td { border: 1px solid #000; padding: 1.2mm 1.6mm; vertical-align: top; text-align: left; overflow-wrap: anywhere; }
    th { background: #e8e8e8; font-size: 9pt; }
    tr { break-inside: avoid; page-break-inside: avoid; }
    td.n, th.n { text-align: center; white-space: nowrap; } td.b { font-weight: 700; }
    tr.first td { border-top: 2px solid #000; }
    tr.sub td { background: #f3f3f3; font-weight: 700; font-size: 9pt; }
    tr.tot td { background: #e0e0e0; font-weight: 800; border-top: 2px solid #000; }
    @media screen { body { padding: 10mm; background: #eee; } .page { background: #fff; padding: 8mm; max-width: 210mm; margin: 0 auto; } }
</style></head><body><div class="page"><h1>${esc(title)}</h1><p class="sub">${esc(sub)}</p>${body}</div>
<script>window.addEventListener('load', () => setTimeout(() => window.print(), 250));</script></body></html>`;

const heading = (m: Model, site: string, what: string) => {
    const D = m.days.length, names = m.blds.map(b => b.name).join(', ');
    return `${site} · ${names} · ${dLabel(m.days[0])} – ${dLabel(m.days[D - 1])} (${D} night${D === 1 ? '' : 's'}) · ${what} · a room is empty when no bed in it is in use at 22:00${m.cut ? ' · only the first 62 nights' : ''}`;
};

export function vacancyByDateHtml(m: Model, site: string) {
    const rows = vacancyByDate(m), many = m.blds.length > 1;
    const body = rows.map(r => {
        const list = r.blds.filter(b => b.rooms.length || !many);
        const lines = list.map((b, i) => `<tr class="${i === 0 ? 'first' : ''}"><td class="b">${i === 0 ? `${esc(wLabel(r.day))} ${esc(dLabel(r.day))}` : ''}</td>${many ? `<td>${esc(b.name)}</td>` : ''}<td>${esc(b.rooms.join(', ')) || '—'}</td><td class="n">${b.rooms.length}</td><td class="n">${b.beds}</td></tr>`).join('');
        if (!list.length) return `<tr class="first"><td class="b">${esc(wLabel(r.day))} ${esc(dLabel(r.day))}</td>${many ? '<td></td>' : ''}<td>No empty room</td><td class="n">0</td><td class="n">0</td></tr>`;
        return lines + (list.length > 1 ? `<tr class="sub"><td></td><td colspan="2">Total ${esc(dLabel(r.day))}</td><td class="n">${r.rooms}</td><td class="n">${r.beds}</td></tr>` : '');
    }).join('');
    const rooms = rows.reduce((n, r) => n + r.rooms, 0), beds = rows.reduce((n, r) => n + r.beds, 0);
    return page('Vacancy report — date wise', heading(m, site, 'empty rooms on each date'), `<table>
        <colgroup><col style="width:15%">${many ? '<col style="width:15%">' : ''}<col><col style="width:9%"><col style="width:9%"></colgroup>
        <thead><tr><th>Date</th>${many ? '<th>Building</th>' : ''}<th>Empty rooms</th><th class="n">Rooms</th><th class="n">Beds</th></tr></thead>
        <tbody>${body}<tr class="tot"><td colspan="${many ? 3 : 2}">Total of the period (room-nights and bed-nights empty)</td><td class="n">${rooms}</td><td class="n">${beds}</td></tr></tbody></table>`);
}

export function vacancyByRoomHtml(m: Model, site: string) {
    const rows = vacancyByRoom(m), D = m.days.length, many = m.blds.length > 1;
    const line = (r: RoomRow, first: boolean) => `<tr class="${first ? 'first' : ''}"><td class="b">${esc(r.room)}</td><td class="n">${r.cap}</td><td>${r.days.length === D ? 'Every night' : esc(dateRanges(r.days, m.days))}</td><td class="n">${r.days.length}</td></tr>`;
    const nights = (l: RoomRow[]) => l.reduce((n, r) => n + r.days.length, 0);
    const body = m.blds.map(b => {
        const list = rows.filter(r => r.building === b.name);
        const all = b.rooms.filter(counted).length;
        return `${many ? `<tr class="sub"><td colspan="4">${esc(b.name)}</td></tr>` : ''}${list.map((r, i) => line(r, i === 0)).join('') || '<tr><td colspan="4">No room stood empty on any night</td></tr>'}
            <tr class="sub"><td colspan="3">${many ? `Total ${esc(b.name)}: ` : 'Total: '}${list.length} of ${all} rooms empty at least one night</td><td class="n">${nights(list)}</td></tr>`;
    }).join('');
    return page('Vacancy report — room wise', heading(m, site, 'dates each room stood empty'), `<table>
        <colgroup><col style="width:13%"><col style="width:8%"><col><col style="width:11%"></colgroup>
        <thead><tr><th>Room</th><th class="n">Beds</th><th>Empty on</th><th class="n">Nights</th></tr></thead>
        <tbody>${body}${many ? `<tr class="tot"><td colspan="3">Total: ${rows.length} rooms empty at least one night</td><td class="n">${nights(rows)}</td></tr>` : ''}</tbody></table>`);
}
