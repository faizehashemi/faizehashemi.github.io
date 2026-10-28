// The printed bus sign, the luggage sheet and the day's summary as HTML — the same markup as the old page (views/transport-print/view.js), so the
// paper output (sheets.css) does not change. They are drawn into the page with dangerouslySetInnerHTML; every value goes through esc().
type Row = Record<string, any>;
export const esc = (s: unknown) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string));

/** "3, 5-7" → Set {3,5,6,7}; empty → null (all) */
export function parseOnly(text: string): Set<number> | null {
    const out = new Set<number>();
    for (const part of String(text).split(/[,\s]+/).filter(Boolean)) {
        const m = part.match(/^(\d+)(?:-(\d+))?$/);
        if (!m) continue;
        const a = Number(m[1]), b = Number(m[2] || m[1]);
        for (let n = Math.min(a, b); n <= Math.max(a, b) && out.size < 1000; n++) out.add(n);
    }
    return out.size ? out : null;
}

type T = { vehicleWord: (v: string, l?: string) => string; sheetDate: (d: string) => string; time12: (a: string) => string };

// "Departs from SNOOD" — plus the pick-ups of grouped trips given another building on the Transport day page
function fromLine(b: Row) {
    const other = (b.rows as Row[]).slice(1).filter(r => r.building && r.building !== b.building);
    if (!b.building && !other.length) return '';
    return `<b class="from">${b.building ? `Departs from ${esc(b.building)}` : 'Departs from —'}${other.length
        ? `<small> · pick up ${other.map(r => `SH ${esc(r.ref)} at ${esc(r.building)}`).join(', ')}</small>` : ''}</b>`;
}

export function sheet(T: T, day: string, dest: Row, b: Row) {
    const many = b.rows.length > 3;
    return `<section class="sheet${many ? ' many' : ''}">
      <table>
        <colgroup><col style="width:24%"><col style="width:46%"><col style="width:17%"><col style="width:13%"></colgroup>
        <tr><td class="h date">${esc(T.sheetDate(day))}</td>
            <td class="h bus${T.vehicleWord(b.vehicle, b.vlabel).length > 5 ? ' long' : ''}" rowspan="2"><span class="w">${esc(T.vehicleWord(b.vehicle, b.vlabel))}</span><span class="n">${esc(b.bus ?? '')}</span></td>
            <td class="h dest${(dest.label + (b.rows[0]?.part ? ' X GENTS' : '')).length > 8 ? ' long' : ''}" colspan="2">${esc(dest.label)}${b.rows[0]?.part ? `<br>${b.rows[0].part === 'gents' ? 'GENTS' : 'LADIES'}` : ''}</td></tr>
        <tr><td class="h time">${esc(T.time12(b.at))}</td><td class="h col">SH REF</td><td class="h col">PAX NO</td></tr>
        ${b.rows.map((r: Row) => `<tr class="row"><td>${esc(r.operator || '')}</td><td>${esc(r.leader || '')}</td><td>${esc(r.ref)}</td><td>${esc(r.pax)}</td></tr>`).join('')}
      </table>
      <div class="foot"><span>${fromLine(b)}${esc([b.transporter, b.vch && `Vch ${b.vch}`].filter(Boolean).join(' · '))}</span>
        ${b.rows.length > 1 ? `<span>Total pax <span class="total">${esc(b.pax)}</span></span>` : ''}</div>
    </section>`;
}

// Luggage sheet: A4 landscape, one per bus. The bus number small on top, the groups in a table of big bold black type, and the total.
export function luggageSheet(T: T, b: Row) {
    const n = b.rows.length, size = n <= 3 ? 'l1' : n <= 6 ? 'l2' : n <= 10 ? 'l3' : 'l4';
    return `<section class="lug ${size}">
      <div class="lug-no">${esc(T.vehicleWord(b.vehicle, b.vlabel))} No. ${esc(b.bus ?? '')}</div>
      <table class="lug-tbl">
        <thead><tr><th>GROUP NAME</th><th>GROUP LEADER</th><th>SH NO.</th><th>PAX</th></tr></thead>
        <tbody>${b.rows.map((r: Row) => `<tr><td>${esc(r.operator || '')}</td><td>${esc(r.leader || '')}</td><td class="n">${esc(r.ref)}</td><td class="n">${esc(r.pax)}</td></tr>`).join('')}</tbody>
        ${n > 1 ? `<tfoot><tr><td colspan="4">TOTAL</td><td class="n">${esc(b.pax)}</td></tr></tfoot>` : ''}
      </table>
    </section>`;
}

export type Libs = T & { tripRows: (buses: Row[]) => { r: Row; b: Row; rider: boolean }[]; ziyaratSummary: (day: string, g: Row) => { html: string; rest: Row[] } };

function table(L: Libs, day: string, { dest, buses }: { dest: Row; buses: Row[] }) {
    const pax = buses.reduce((s, b) => s + b.pax, 0);
    return `<table class="sum">
      <colgroup><col style="width:7%"><col style="width:19%"><col style="width:27%"><col style="width:10%"><col style="width:7%"><col style="width:10%"><col style="width:12%"><col style="width:8%"></colgroup>
      <thead>
        <tr class="band"><th class="d" colspan="2">${esc(L.sheetDate(day))}</th><th class="t" colspan="6">${esc(dest.label)}</th></tr>
        <tr class="cols"><th>BUS NO</th><th>GROUP</th><th>GROUP LEADER</th><th>SH REF</th><th>PAX</th><th>TIME</th><th>BUILDING</th><th>VEHICLE</th></tr>
      </thead>
      <tbody>${L.tripRows(buses).map(({ r, b, rider }) => `<tr${rider ? ' class="rider"' : ''}>
        <td class="n">${esc(b.bus ?? '')}</td><td>${esc(r.operator || '')}</td><td>${esc(r.leader || '')}</td><td class="n">${esc(r.ref)}</td><td class="n">${esc(r.pax)}</td>
        <td class="n">${esc(L.time12(b.at))}</td><td>${esc(r.building || b.building || '')}</td><td>${esc(L.vehicleWord(b.vehicle, b.vlabel))}</td></tr>`).join('')}</tbody>
      <tfoot><tr><td colspan="4">${buses.length} vehicle${buses.length === 1 ? '' : 's'} · ${buses.reduce((s, b) => s + b.rows.length, 0)} groups</td><td class="n">${pax}</td><td colspan="3"></td></tr></tfoot>
    </table>`;
}

/** The day's summary: per destination, in the sheet yellows — every chosen trip with its time, vehicle and number */
export function summary(L: Libs, day: string, groups: Row[]) {
    return groups.map(g => {
        // Medina Ziyarat split into gents / ladies: the desks' Ziyarat sheets, then any bus not split as usual
        if (g.dest.id === 'mdziyarat') { const z = L.ziyaratSummary(day, g); return z.html + (z.rest.length ? table(L, day, { dest: g.dest, buses: z.rest }) : ''); }
        return table(L, day, g as { dest: Row; buses: Row[] });
    }).join('');
}

/** A sheet is one fixed page: with many groups, step its text down (fit1 → fit4) until nothing runs past the bottom edge. */
export function fitSheets(root: ParentNode) {
    for (const s of root.querySelectorAll<HTMLElement>('.sheet')) {
        s.classList.remove('fit1', 'fit2', 'fit3', 'fit4');
        for (let k = 1; k <= 4 && s.scrollHeight > s.clientHeight + 1; k++) { if (k > 1) s.classList.remove(`fit${k - 1}`); s.classList.add(`fit${k}`); }
    }
}
