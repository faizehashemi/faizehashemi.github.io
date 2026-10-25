// Bus sheets: one A4 landscape page per bus (or car) of the day (Atraaf, Madina, Jeddah Airport, Madina Airport, Taif), laid out like the
// printed signs — date and time, BUS + number, destination, then group · leader · SH ref · pax for the trip
// and the groups adjusted into the same bus. "Print summary" prints the same choice as one list per destination.
// #/<site>/transport-print?day=YYYY-MM-DD
import { loadDay, listDays, signage, destsFor, vehicleWord, today, sheetDate, time12 } from '../../core/transport.js';
import { esc, renderDayNav } from '../../core/transport-ui.js';
import { ziyaratSummary } from '../../core/ziyarat.js';
import { tripRows } from './export.js';
import { UserError, canOpen } from '../../core/cloud.js';

// the destinations a desk unticked (a destination added later starts ticked); the old key kept the ticked ones
const OFF_KEY = 'pms_transport_print_off', OLD_PICK_KEY = 'pms_transport_print_dests', OLD_DESTS = ['atraaf', 'madina', 'airport'];

// "3, 5-7" → Set {3,5,6,7}; empty → null (all)
function parseOnly(text) {
    const out = new Set();
    for (const part of String(text).split(/[,\s]+/).filter(Boolean)) {
        const m = part.match(/^(\d+)(?:-(\d+))?$/);
        if (!m) continue;
        const a = Number(m[1]), b = Number(m[2] || m[1]);
        for (let n = Math.min(a, b); n <= Math.max(a, b) && out.size < 1000; n++) out.add(n);
    }
    return out.size ? out : null;
}

// "Departs from SNOOD" — plus the pick-ups of grouped trips given another building on the Transport day page
function fromLine(b) {
    const other = b.rows.slice(1).filter(r => r.building && r.building !== b.building);
    if (!b.building && !other.length) return '';
    return `<b class="from">${b.building ? `Departs from ${esc(b.building)}` : 'Departs from —'}${other.length
        ? `<small> · pick up ${other.map(r => `SH ${esc(r.ref)} at ${esc(r.building)}`).join(', ')}</small>` : ''}</b>`;
}

// A sheet is one fixed page: with many groups, step its text down (fit1 → fit4) until nothing — not the
// "Departs from … · Total pax" line either — runs past the bottom edge.
function fitSheets() {
    for (const s of document.querySelectorAll('.sheet')) {
        s.classList.remove('fit1', 'fit2', 'fit3', 'fit4');
        for (let k = 1; k <= 4 && s.scrollHeight > s.clientHeight + 1; k++) { if (k > 1) s.classList.remove(`fit${k - 1}`); s.classList.add(`fit${k}`); }
    }
}

function sheet(day, dest, b) {
    const many = b.rows.length > 3;
    return `<section class="sheet${many ? ' many' : ''}">
      <table>
        <colgroup><col style="width:24%"><col style="width:46%"><col style="width:17%"><col style="width:13%"></colgroup>
        <tr><td class="h date">${esc(sheetDate(day))}</td>
            <td class="h bus${vehicleWord(b.vehicle, b.vlabel).length > 5 ? ' long' : ''}" rowspan="2"><span class="w">${esc(vehicleWord(b.vehicle, b.vlabel))}</span><span class="n">${esc(b.bus ?? '')}</span></td>
            <td class="h dest${(dest.label + (b.rows[0]?.part ? ' X GENTS' : '')).length > 8 ? ' long' : ''}" colspan="2">${esc(dest.label)}${b.rows[0]?.part ? `<br>${b.rows[0].part === 'gents' ? 'GENTS' : 'LADIES'}` : ''}</td></tr>
        <tr><td class="h time">${esc(time12(b.at))}</td><td class="h col">SH REF</td><td class="h col">PAX NO</td></tr>
        ${b.rows.map(r => `<tr class="row"><td>${esc(r.operator || '')}</td><td>${esc(r.leader || '')}</td><td>${esc(r.ref)}</td><td>${esc(r.pax)}</td></tr>`).join('')}
      </table>
      <div class="foot"><span>${fromLine(b)}${esc([b.transporter, b.vch && `Vch ${b.vch}`].filter(Boolean).join(' · '))}</span>
        ${b.rows.length > 1 ? `<span>Total pax <span class="total">${esc(b.pax)}</span></span>` : ''}</div>
    </section>`;
}

// Luggage sheet: A4 landscape, one per bus. The bus number small on top, the groups (group · leader · SH · pax) in a table of
// big bold black type, then a big arrow pointing down at where the luggage is put.
function luggageSheet(b) {
    const n = b.rows.length, size = n <= 3 ? 'l1' : n <= 6 ? 'l2' : n <= 10 ? 'l3' : 'l4';
    return `<section class="lug ${size}">
      <div class="lug-no">${esc(vehicleWord(b.vehicle, b.vlabel))} No. ${esc(b.bus ?? '')}</div>
      <table class="lug-tbl">
        <thead><tr><th>GROUP NAME</th><th>GROUP LEADER</th><th>SH NO.</th><th>PAX</th></tr></thead>
        <tbody>${b.rows.map(r => `<tr><td>${esc(r.operator || '')}</td><td>${esc(r.leader || '')}</td><td class="n">${esc(r.ref)}</td><td class="n">${esc(r.pax)}</td></tr>`).join('')}</tbody>
        ${n > 1 ? `<tfoot><tr><td colspan="3">TOTAL</td><td class="n">${esc(b.pax)}</td></tr></tfoot>` : ''}
      </table>
      <svg class="lug-arrow" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet" aria-hidden="true"><path d="M30 0h40v50h25L50 100 5 50h25z" fill="#000"/></svg>
    </section>`;
}

// The day's summary: per destination, in the sheet yellows — every chosen trip with its time, vehicle and number
function summary(day, groups) {
    return groups.map((g) => {
        // Medina Ziyarat split into gents / ladies: the desks' Ziyarat sheets, then any bus not split as usual
        if (g.dest.id === 'mdziyarat') {
            const z = ziyaratSummary(day, g);
            return z.html + (z.rest.length ? table(day, { dest: g.dest, buses: z.rest }) : '');
        }
        return table(day, g);
    }).join('');
}
function table(day, { dest, buses }) {
    {
        const pax = buses.reduce((s, b) => s + b.pax, 0);
        return `<table class="sum">
          <colgroup><col style="width:19%"><col style="width:28%"><col style="width:10%"><col style="width:7%"><col style="width:10%"><col style="width:12%"><col style="width:8%"><col style="width:6%"></colgroup>
          <thead>
            <tr class="band"><th class="d">${esc(sheetDate(day))}</th><th class="t" colspan="7">${esc(dest.label)}</th></tr>
            <tr class="cols"><th>GROUP</th><th>GROUP LEADER</th><th>SH REF</th><th>PAX</th><th>TIME</th><th>BUILDING</th><th>VEHICLE</th><th>NO</th></tr>
          </thead>
          <tbody>${tripRows(buses)
              .map(({ r, b, rider }) => `<tr${rider ? ' class="rider"' : ''}>
            <td>${esc(r.operator || '')}</td><td>${esc(r.leader || '')}</td><td class="n">${esc(r.ref)}</td><td class="n">${esc(r.pax)}</td>
            <td class="n">${esc(time12(b.at))}</td><td>${esc(r.building || b.building || '')}</td><td>${esc(vehicleWord(b.vehicle, b.vlabel))}</td><td class="n">${esc(b.bus ?? '')}</td></tr>`).join('')}</tbody>
          <tfoot><tr><td colspan="3">${buses.length} vehicle${buses.length === 1 ? '' : 's'} · ${buses.reduce((s, b) => s + b.rows.length, 0)} groups</td><td class="n">${pax}</td><td colspan="4"></td></tr></tfoot>
        </table>`;
    }
}

export default async function mount(ctx) {
    const $ = (id) => ctx.root.querySelector('#' + id);
    const day = /^\d{4}-\d{2}-\d{2}$/.test(ctx.params.get('day') || '') ? ctx.params.get('day') : today();
    $('tqDay').href = ctx.href('transport', { day });
    $('tqTosha').href = ctx.href('tosha');
    $('tqTosha').hidden = !canOpen('tosha');
    let off = [];
    try {
        const s = JSON.parse(localStorage.getItem(OFF_KEY) || 'null');
        const old = JSON.parse(localStorage.getItem(OLD_PICK_KEY) || 'null');
        if (Array.isArray(s)) off = s;
        else if (Array.isArray(old)) off = OLD_DESTS.filter(id => !old.includes(id));
    } catch { }
    const DESTS = destsFor(ctx.siteId);
    let picked = DESTS.map(d => d.id).filter(id => !off.includes(id));

    let doc = { rows: [] }, days = [];
    try {
        [doc, days] = await ctx.guard(Promise.all([loadDay(ctx.siteId, day), listDays(ctx.siteId)]));
    } catch (e) {
        $('tqMsg').innerHTML = `<div class="tp-msg bad">${esc(e instanceof UserError ? e.message : 'Could not load the transport list.')}</div>`;
    }
    renderDayNav($('tqNav'), { day, days, onChange: (d) => ctx.navigate('transport-print', { day: d }) });
    const groups = signage(doc.rows, ctx.siteId);
    $('tqDests').innerHTML = groups.map(g => `<label><input type="checkbox" value="${g.dest.id}"${picked.includes(g.dest.id) ? ' checked' : ''}> ${esc(g.dest.title)} <span class="tp-muted">(${g.buses.length})</span></label>`).join(' ');

    // the chosen destinations, each with only the chosen numbers
    const chosen = () => {
        const only = parseOnly($('tqOnly').value);
        return groups.filter(g => picked.includes(g.dest.id))
            .map(g => ({ ...g, buses: g.buses.filter(b => !only || only.has(Number(b.bus))) })).filter(g => g.buses.length);
    };
    function render() {
        const pages = chosen().flatMap(g => g.buses.map(b => sheet(day, g.dest, b)));
        $('tqSheets').innerHTML = pages.join('') || `<p class="tq-none">${doc.rows.length ? 'No buses for this choice.' : 'No transport list saved for this day.'}</p>`;
        fitSheets();
        $('tqCount').textContent = `${pages.length} sheet${pages.length === 1 ? '' : 's'}`;
        $('tqPrint').disabled = $('tqSummary').disabled = $('tqXlSheets').disabled = $('tqXlSum').disabled = !pages.length;
    }
    $('tqDests').addEventListener('change', () => {
        picked = [...$('tqDests').querySelectorAll('input:checked')].map(x => x.value);
        try { localStorage.setItem(OFF_KEY, JSON.stringify([...off.filter(id => !DESTS.some(d => d.id === id)), ...DESTS.map(d => d.id).filter(id => !picked.includes(id))])); localStorage.removeItem(OLD_PICK_KEY); } catch { }
        render();
    });
    $('tqOnly').addEventListener('input', render);
    $('tqPrint').addEventListener('click', () => window.print());
    // Luggage sheet: tick the routes, print one A4 page per bus of them
    let lugOff = new Set();
    function lugDraw() {
        $('tqLugRoutes').innerHTML = groups.filter(g => g.buses.length).map(g => `<label><input type="checkbox" value="${g.dest.id}"${lugOff.has(g.dest.id) ? '' : ' checked'}> ${esc(g.dest.title)} <span class="tp-muted">(${g.buses.length})</span></label>`).join('')
            || '<span class="tp-muted">No buses on this day.</span>';
        const n = groups.filter(g => !lugOff.has(g.dest.id)).reduce((s, g) => s + g.buses.length, 0);
        $('tqLugCount').textContent = `${n} page${n === 1 ? '' : 's'}`;
        $('tqLugPrint').disabled = !n;
    }
    $('tqLugBtn').addEventListener('click', () => { $('tqLugPanel').hidden = !$('tqLugPanel').hidden; if (!$('tqLugPanel').hidden) lugDraw(); });
    $('tqLugRoutes').addEventListener('change', (e) => { const id = e.target.value; if (e.target.checked) lugOff.delete(id); else lugOff.add(id); lugDraw(); });
    const endLug = () => { document.documentElement.classList.remove('tq-print-lug'); const el = $('tqLug'); if (el) el.innerHTML = ''; };
    $('tqLugPrint').addEventListener('click', () => {
        $('tqLug').innerHTML = groups.filter(g => !lugOff.has(g.dest.id)).flatMap(g => g.buses.map(luggageSheet)).join('');
        document.documentElement.classList.add('tq-print-lug');
        window.print();
        setTimeout(endLug, 500);
    });
    // Print summary: the same choice as one list; the sheets step aside while it prints
    const root = document.documentElement;
    const endSummary = () => { root.classList.remove('tq-print-summary'); const el = $('tqSum'); if (el) el.innerHTML = ''; }; // the page may be gone
    $('tqSummary').addEventListener('click', () => {
        $('tqSum').innerHTML = summary(day, chosen());
        root.classList.add('tq-print-summary');
        window.print();
        setTimeout(endSummary, 500); // print() returns once the dialog closes
    });
    // Excel: the chosen sheets, or the summary (ExcelJS loads on first use; export.js)
    const toExcel = (what) => async () => {
        const b = $(what === 'sheets' ? 'tqXlSheets' : 'tqXlSum'), label = b.textContent;
        b.disabled = true; b.textContent = '⏳ Building…';
        try {
            const { exportSheets, exportSummary } = await import('./export.js');
            await (what === 'sheets' ? exportSheets : exportSummary)(day, chosen(), ctx.site.label);
        } catch (e) { $('tqMsg').innerHTML = `<div class="tp-msg bad">${esc(e && e.message || 'Could not make the Excel file.')}</div>`; }
        finally { b.disabled = false; b.textContent = label; }
    };
    $('tqXlSheets').addEventListener('click', toExcel('sheets'));
    $('tqXlSum').addEventListener('click', toExcel('summary'));
    window.addEventListener('afterprint', () => { if (root.classList.contains('tq-print-summary')) endSummary(); if (root.classList.contains('tq-print-lug')) endLug(); });
    render();
}
