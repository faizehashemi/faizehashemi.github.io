// Occupancy details → Print: "<BUILDING> - ROOMS ALLOCATION (MIQAAT -<Hijri year>)", one building at a time, in a
// tab of its own — every group staying in the building during the chosen period:
//   S.NO · GROUP NAME · PAX · SH. NO · ROOM NO · CHK IN · CHK OUT · DAYS COUNT · ROOM COUNT · TOTAL COUNT
//   (days = nights from check-in to check-out; rooms = the slip's rooms in this building; total = days × rooms).

import { rowsOf, slipEnd } from '../../core/stay.js';
import { toHijri } from '../../core/hijri.js';

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const pad = (n) => String(n).padStart(2, '0');
const dmy = (ms) => { const d = new Date(ms); return `${pad(d.getDate())}-${pad(d.getMonth() + 1)}-${d.getFullYear()}`; };
const midnight = (ms) => { const d = new Date(ms); d.setHours(12, 0, 0, 0); return d.getTime(); };
const natural = (a, b) => String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: 'base' });
const num = (v) => { const x = Number(v); return Number.isFinite(x) ? x : 0; };

export function allocationRows(slips, building, from, to) {
    const start = new Date(`${from}T00:00`).getTime(), end = new Date(`${to}T00:00`).getTime() + 864e5;
    const B = String(building).trim().toUpperCase();
    return slips.filter(s => !s.deleted && String(s.building || '').trim().toUpperCase() === B).map(s => {
        const ci = new Date(`${s.checkin_date}T${s.checkin_time || '00:00'}`).getTime(), co = slipEnd(s);
        if (!ci || !co || !(ci < end && co > start)) return null;
        const rooms = [...new Set(rowsOf(s).map(r => r.room_no))].sort(natural);
        const days = Math.max(0, Math.round((midnight(co) - midnight(ci)) / 864e5));
        const pax = num(s.total) || num(s.gents) + num(s.ladies) + num(s.children ?? s.child) + num(s.infants ?? s.infant);
        return { ci, co, group: String(s.tour_name || '').trim(), pax, sh: String(s.sh_no ?? ''), rooms, days, roomCount: rooms.length, total: days * rooms.length };
    }).filter(Boolean).sort((a, b) => a.ci - b.ci || natural(a.sh, b.sh));
}

export function printAllocation(slips, building, from, to) {
    const rows = allocationRows(slips, building, from, to);
    const year = toHijri(new Date(`${from}T12:00`)).year;
    const title = `${String(building).toUpperCase()} - ROOMS ALLOCATION (MIQAAT -${year})`;
    const w = window.open('', '_blank');
    if (!w) { alert('The browser blocked the new tab. Allow pop-ups for this site, then press Print again.'); return; }
    const sum = (k) => rows.reduce((n, r) => n + r[k], 0);
    const body = rows.length ? rows.map((r, i) => `<tr>
        <td class="c">${i + 1}</td><td>${esc(r.group)}</td><td class="c">${r.pax}</td><td class="c">${esc(r.sh)}</td>
        <td>${esc(r.rooms.join(', '))}</td><td class="c">${dmy(r.ci)}</td><td class="c">${dmy(r.co)}</td>
        <td class="c">${r.days}</td><td class="c">${r.roomCount}</td><td class="c">${r.total}</td></tr>`).join('')
        : '<tr><td colspan="10" class="c">No groups in this building in the period.</td></tr>';
    w.document.open();
    w.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>${esc(title)}</title><style>
        @page { size: A4 portrait; margin: 10mm; }
        body { font: 11px/1.25 Calibri, Arial, Helvetica, sans-serif; color: #000; margin: 0; }
        h1 { text-align: center; font-size: 17px; font-weight: 800; margin: 0 0 6px; letter-spacing: .02em; }
        .sub { text-align: center; font-size: 11px; margin: 0 0 6px; }
        table { width: 100%; border-collapse: collapse; table-layout: fixed; }
        th, td { border: 1px solid #000; padding: 2px 4px; vertical-align: middle; }
        th { font-weight: 800; font-size: 10.5px; text-align: center; background: #fff; }
        thead { display: table-header-group; } tr { break-inside: avoid; }
        td.c { text-align: center; white-space: nowrap; }
        tfoot td { font-weight: 800; }
        col.n { width: 4.5%; } col.g { width: 19%; } col.p { width: 5%; } col.s { width: 7%; } col.r { width: 31%; }
        col.d { width: 8%; } col.k { width: 5.5%; }
    </style></head><body>
      <h1>${esc(title)}</h1>
      <p class="sub">${dmy(new Date(`${from}T12:00`))} to ${dmy(new Date(`${to}T12:00`))}</p>
      <table><colgroup><col class="n"><col class="g"><col class="p"><col class="s"><col class="r"><col class="d"><col class="d"><col class="k"><col class="k"><col class="k"></colgroup>
        <thead><tr><th>S.NO</th><th>GROUP NAME</th><th>PAX</th><th>SH. NO</th><th>ROOM NO</th><th>CHK IN</th><th>CHK OUT</th><th>DAYS COUNT</th><th>ROOM COUNT</th><th>TOTAL COUNT</th></tr></thead>
        <tbody>${body}</tbody>
        ${rows.length ? `<tfoot><tr><td colspan="2">Total · ${rows.length} group${rows.length === 1 ? '' : 's'}</td><td class="c">${sum('pax')}</td><td></td><td></td><td></td><td></td><td></td><td class="c">${sum('roomCount')}</td><td class="c">${sum('total')}</td></tr></tfoot>` : ''}
      </table>
      <script>window.addEventListener('load', function () { setTimeout(function () { window.focus(); window.print(); }, 200); });<\/script>
    </body></html>`);
    w.document.close();
}
