// Transport day: the saved trips of one day (cloud, GET /api/transport), bus numbers per destination
// (type one in to change it — kept by later imports), and links to the import page, bus sheets and signage.
// Day in the address: #/<site>/transport?day=YYYY-MM-DD (default today).
import { canWrite, canOpen, currentDesk, UserError } from '../../core/cloud.js';
import { DESTS, resolve, signage, renumber, loadDay, listDays, saveDay, deleteDay, today, time12 } from '../../core/transport.js';
import { esc, renderDayNav } from '../../core/transport-ui.js';

export default async function mount(ctx) {
    const $ = (id) => ctx.root.querySelector('#' + id);
    const day = /^\d{4}-\d{2}-\d{2}$/.test(ctx.params.get('day') || '') ? ctx.params.get('day') : today();
    const writable = canWrite(ctx.siteId);
    const desk = currentDesk();
    let doc = { rows: [], version: 0 }, days = [], filter = 'sign', saving = false;

    $('tpImport').href = ctx.href('transport-import');
    $('tpPrint').href = ctx.href('transport-print', { day });
    $('tpSignage').href = `signage/?site=${encodeURIComponent(ctx.siteId)}&day=${day}`;
    $('tpImport').hidden = !canOpen('transport-import', desk) || !writable;
    $('tpPrint').hidden = !canOpen('transport-print', desk);
    $('tpRenumber').hidden = $('tpDelete').hidden = !writable;

    const msg = (text, kind = 'ok') => { $('tpMsg').innerHTML = text ? `<div class="tp-msg ${kind}">${esc(text)}</div>` : ''; };
    const go = (d) => ctx.navigate('transport', { day: d });

    function nav() { renderDayNav($('tpNav'), { day, days, onChange: go }); }

    function tiles() {
        $('tpTiles').innerHTML = signage(doc.rows).map(s => `
          <div class="tp-tile"><span class="ico" aria-hidden="true">${s.dest.icon}</span>
            <b>${s.pax}</b><span>${esc(s.dest.title)}</span>
            <small>${s.buses.length} bus${s.buses.length === 1 ? '' : 'es'} · ${s.groups} group${s.groups === 1 ? '' : 's'}${s.buses.length ? ` · ${time12(s.buses.reduce((a, b) => a.at < b.at ? a : b).at)} first` : ''}</small>
          </div>`).join('');
    }

    const nowAt = () => { const d = new Date(); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0, 16); };
    const matches = (r, q) => !q || [r.ref, r.operator, r.leader, r.transporter, r.vch, r.dora, r.route, r.remarks, ...(r.rooms || [])]
        .some(v => String(v ?? '').toLowerCase().includes(q));
    const pax = (r) => `<b>${esc(r.pax)}</b><small>${[r.m && `M${r.m}`, r.f && `F${r.f}`, r.c && `C${r.c}`].filter(Boolean).join(' ')}</small>`;

    function list() {
        const q = $('tpFind').value.trim().toLowerCase();
        const info = resolve(doc.rows);
        const past = nowAt();
        if (!doc.rows.length) {
            $('tpList').innerHTML = `<p class="tp-empty">No transport list saved for this day.${writable && canOpen('transport-import', desk) ? ` <a href="${ctx.href('transport-import')}">Import one →</a>` : ''}</p>`;
            return;
        }
        if (filter === 'sign') {
            const html = signage(doc.rows).map(s => {
                // duplicate numbers in one destination are flagged (typed in by hand)
                const count = new Map();
                for (const b of s.buses) if (b.bus != null) count.set(b.bus, (count.get(b.bus) || 0) + 1);
                const body = s.buses.flatMap(b => b.rows.map((r, i) => ({ r, b, i }))).filter(x => matches(x.r, q)).map(({ r, b, i }) => `
                  <tr class="${i ? 'rider' : ''}${r.at < past ? ' past' : ''}">
                    <td class="bus">${i ? `↳ ${esc(b.bus ?? '')}` : writable
                        ? `<input type="number" min="1" max="999" inputmode="numeric" value="${esc(b.bus ?? '')}" data-key="${esc(r.key)}" class="${r.bus_manual ? 'manual' : ''}${count.get(b.bus) > 1 ? ' dup' : ''}" aria-label="Bus number" title="${r.bus_manual ? 'Typed in by hand' : 'Given by the import'}${count.get(b.bus) > 1 ? ' · used twice' : ''}">`
                        : esc(b.bus ?? '—')}</td>
                    <td class="t">${esc(time12(r.at))}</td>
                    <td><b>${esc(r.ref)}</b>${r.dora ? `<small>Dora ${esc(r.dora)}</small>` : ''}</td>
                    <td>${esc(r.operator || '—')}</td>
                    <td>${esc(r.leader || '—')}</td>
                    <td class="n">${pax(r)}</td>
                    <td>${esc(r.transporter || (i ? 'with the bus above' : '—'))}${r.vch ? `<small>Vch ${esc(r.vch)}</small>` : ''}</td>
                    <td>${esc(r.remarks)}</td>
                  </tr>`).join('');
                return `<div class="tp-dest"><span aria-hidden="true">${s.dest.icon}</span>${esc(s.dest.label)}
                    <small>${s.buses.length} bus${s.buses.length === 1 ? '' : 'es'} · ${s.groups} groups · ${s.pax} pax</small></div>
                  ${body ? `<div class="tp-scroll"><table class="tp-tbl"><thead><tr><th>Bus</th><th>Time</th><th>SH</th><th>Tour operator</th><th>Group leader</th><th class="n">Pax</th><th>Transporter</th><th>Remarks</th></tr></thead>
                    <tbody>${body}</tbody></table></div>` : `<p class="tp-empty">${s.buses.length ? 'Nothing matches.' : 'No trips.'}</p>`}`;
            }).join('');
            $('tpList').innerHTML = html;
        } else {
            const rows = [...doc.rows].sort((a, b) => a.at.localeCompare(b.at)).filter(r => matches(r, q));
            $('tpList').innerHTML = rows.length ? `<div class="tp-scroll"><table class="tp-tbl">
              <thead><tr><th>Time</th><th>Route</th><th>Bus</th><th>SH</th><th>Tour operator</th><th>Group leader</th><th class="n">Pax</th><th>Transporter</th><th>Rooms</th><th>Remarks</th></tr></thead>
              <tbody>${rows.map(r => { const i = info.get(r.key); return `
                <tr class="${i.parent ? 'rider' : ''}${r.at < past ? ' past' : ''}">
                  <td class="t">${esc(time12(r.at))}</td>
                  <td>${esc(i.route || '—')}${i.parent ? '<small>grouped</small>' : ''}</td>
                  <td class="bus">${i.dest ? esc(i.bus ?? '—') : ''}</td>
                  <td><b>${esc(r.ref)}</b>${r.dora ? `<small>Dora ${esc(r.dora)}</small>` : ''}</td>
                  <td>${esc(r.operator || '—')}</td>
                  <td>${esc(r.leader || '—')}</td>
                  <td class="n">${pax(r)}</td>
                  <td>${esc(r.transporter || '—')}${r.vch ? `<small>Vch ${esc(r.vch)}</small>` : ''}</td>
                  <td>${esc((r.rooms || []).join(', '))}</td>
                  <td>${esc(r.remarks)}</td>
                </tr>`; }).join('')}</tbody></table></div>` : '<p class="tp-empty">Nothing matches.</p>';
        }
    }

    function meta() {
        const n = doc.rows.length;
        $('tpMeta').textContent = doc.version ? `${n} trips · saved ${new Date(doc.updated_at).toLocaleString()}${doc.updated_by ? ' by ' + doc.updated_by : ''}` : '';
        $('tpDelete').disabled = $('tpRenumber').disabled = !doc.version;
    }

    function draw() { nav(); tiles(); list(); meta(); }

    async function load({ quiet = false } = {}) {
        try {
            const [d, ds] = await ctx.guard(Promise.all([loadDay(ctx.siteId, day), listDays(ctx.siteId)]));
            const changed = d.version !== doc.version || ds.length !== days.length;
            doc = d; days = ds;
            if (!quiet || changed) draw();
        } catch (e) {
            if (!quiet) { msg(e instanceof UserError ? e.message : 'Could not load the transport list.', 'bad'); nav(); $('tpList').innerHTML = ''; }
        }
    }

    async function save(rows, note) {
        saving = true;
        try {
            doc = await ctx.guard(saveDay(ctx.siteId, day, rows, doc.version, note));
            msg('Saved.');
        } catch (e) {
            msg(e instanceof UserError ? e.message : 'Could not save.', 'bad');
            if (e.status === 409) await load();
        } finally { saving = false; draw(); }
    }

    $('tpFilter').addEventListener('click', (e) => {
        const b = e.target.closest('button[data-f]');
        if (!b) return;
        filter = b.dataset.f;
        $('tpFilter').querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
        list();
    });
    $('tpFind').addEventListener('input', list);
    $('tpList').addEventListener('change', (e) => {
        const inp = e.target.closest('input[data-key]');
        if (!inp) return;
        const n = parseInt(inp.value, 10);
        if (!(n > 0)) { inp.value = doc.rows.find(r => r.key === inp.dataset.key)?.bus ?? ''; return; }
        const rows = doc.rows.map(r => r.key === inp.dataset.key ? { ...r, bus: n, bus_manual: true } : r);
        save(rows, `bus ${n} for SH ${inp.dataset.key}`);
    });
    $('tpRenumber').addEventListener('click', () => {
        if (!confirm('Number every destination again from 1, in time order?\nBus numbers typed in by hand are replaced, and sheets already stuck on buses may no longer match.')) return;
        save(renumber(doc.rows), 'renumbered');
    });
    $('tpDelete').addEventListener('click', async () => {
        if (!confirm(`Delete the whole transport list of ${day}? Signage and bus sheets for the day go with it.`)) return;
        try { await ctx.guard(deleteDay(ctx.siteId, day, doc.version)); msg('Deleted.'); } catch (e) { msg(e.message || 'Could not delete.', 'bad'); }
        await load();
    });

    await load();
    // other desks' imports: check every 30 s (not while a bus number is being typed)
    const t = setInterval(() => {
        if (saving || document.visibilityState !== 'visible' || ctx.root.contains(document.activeElement) && document.activeElement.matches('input[data-key]')) return;
        load({ quiet: true });
    }, 30e3);
    return () => clearInterval(t);
}
