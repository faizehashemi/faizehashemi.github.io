// Bus sheets: one A4 landscape page per bus of the day (Atraaf, Madina, Jeddah Airport), laid out like the
// printed signs — date and time, BUS + number, destination, then group · leader · SH ref · pax for the trip
// and the groups adjusted into the same bus. #/<site>/transport-print?day=YYYY-MM-DD
import { loadDay, listDays, signage, DESTS, today, sheetDate, time12 } from '../../core/transport.js';
import { esc, renderDayNav } from '../../core/transport-ui.js';
import { UserError } from '../../core/cloud.js';

const PICK_KEY = 'pms_transport_print_dests';

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

function sheet(day, dest, b) {
    const many = b.rows.length > 3;
    return `<section class="sheet${many ? ' many' : ''}">
      <table>
        <colgroup><col style="width:24%"><col style="width:46%"><col style="width:17%"><col style="width:13%"></colgroup>
        <tr><td class="h date">${esc(sheetDate(day))}</td>
            <td class="h bus" rowspan="2"><span class="w">BUS</span><span class="n">${esc(b.bus ?? '')}</span></td>
            <td class="h dest${dest.label.length > 8 ? ' long' : ''}" colspan="2">${esc(dest.label)}</td></tr>
        <tr><td class="h time">${esc(time12(b.at))}</td><td class="h col">SH REF</td><td class="h col">PAX NO</td></tr>
        ${b.rows.map(r => `<tr class="row"><td>${esc(r.operator || '')}</td><td>${esc(r.leader || '')}</td><td>${esc(r.ref)}</td><td>${esc(r.pax)}</td></tr>`).join('')}
      </table>
      <div class="foot"><span>${esc([b.transporter, b.vch && `Vch ${b.vch}`].filter(Boolean).join(' · '))}</span>
        ${b.rows.length > 1 ? `<span>Total pax <span class="total">${esc(b.pax)}</span></span>` : ''}</div>
    </section>`;
}

export default async function mount(ctx) {
    const $ = (id) => ctx.root.querySelector('#' + id);
    const day = /^\d{4}-\d{2}-\d{2}$/.test(ctx.params.get('day') || '') ? ctx.params.get('day') : today();
    $('tqDay').href = ctx.href('transport', { day });
    let picked = DESTS.map(d => d.id);
    try { const s = JSON.parse(localStorage.getItem(PICK_KEY) || 'null'); if (Array.isArray(s)) picked = s; } catch { }

    let doc = { rows: [] }, days = [];
    try {
        [doc, days] = await ctx.guard(Promise.all([loadDay(ctx.siteId, day), listDays(ctx.siteId)]));
    } catch (e) {
        $('tqMsg').innerHTML = `<div class="tp-msg bad">${esc(e instanceof UserError ? e.message : 'Could not load the transport list.')}</div>`;
    }
    renderDayNav($('tqNav'), { day, days, onChange: (d) => ctx.navigate('transport-print', { day: d }) });
    const groups = signage(doc.rows);
    $('tqDests').innerHTML = groups.map(g => `<label><input type="checkbox" value="${g.dest.id}"${picked.includes(g.dest.id) ? ' checked' : ''}> ${esc(g.dest.title)} <span class="tp-muted">(${g.buses.length})</span></label>`).join(' ');

    function render() {
        const only = parseOnly($('tqOnly').value);
        const pages = groups.filter(g => picked.includes(g.dest.id))
            .flatMap(g => g.buses.filter(b => !only || only.has(Number(b.bus))).map(b => sheet(day, g.dest, b)));
        $('tqSheets').innerHTML = pages.join('') || `<p class="tq-none">${doc.rows.length ? 'No buses for this choice.' : 'No transport list saved for this day.'}</p>`;
        $('tqCount').textContent = `${pages.length} sheet${pages.length === 1 ? '' : 's'}`;
        $('tqPrint').disabled = !pages.length;
    }
    $('tqDests').addEventListener('change', () => {
        picked = [...$('tqDests').querySelectorAll('input:checked')].map(x => x.value);
        try { localStorage.setItem(PICK_KEY, JSON.stringify(picked)); } catch { }
        render();
    });
    $('tqOnly').addEventListener('input', render);
    $('tqPrint').addEventListener('click', () => window.print());
    render();
}
