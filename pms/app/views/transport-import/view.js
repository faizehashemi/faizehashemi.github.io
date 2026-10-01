// Transport import: paste the transport list → one card per day in it.
//   New day: preview with the bus numbers it will get → Save.
//   Day already saved: what changed (new / changed / gone trips), each with a tick → Apply the ticked ones.
//   Bus numbers already given stay; new signage trips get the next free numbers of their destination.
import { canWrite, UserError } from '../../core/cloud.js';
import { parseTransport, byDay, assignBuses, signage, diffDay, applyChanges, loadDay, saveDay, resolve, longDate, time12 } from '../../core/transport.js';
import { esc } from '../../core/transport-ui.js';

const DRAFT_KEY = 'pms_transport_draft';

export default async function mount(ctx) {
    const $ = (id) => ctx.root.querySelector('#' + id);
    const writable = canWrite(ctx.siteId);
    $('tiDay').href = ctx.href('transport');
    // an unsaved paste survives switching pages (this browser only)
    try { $('tiText').value = sessionStorage.getItem(DRAFT_KEY) || ''; } catch { }
    $('tiText').addEventListener('input', () => { try { sessionStorage.setItem(DRAFT_KEY, $('tiText').value); } catch { } });

    let plans = []; // [{ day, rows, saved, diff }]

    const tripsLine = (rows) => {
        const s = signage(rows).filter(x => x.buses.length);
        return `${rows.length} trips${s.length ? ' · ' + s.map(x => `${x.dest.title} ${x.buses.length} bus${x.buses.length === 1 ? '' : 'es'}`).join(', ') : ' · none for signage'}`;
    };
    const who = (r) => `<b>${esc(r.ref)}</b> · ${esc(r.leader || '—')}<small>${esc(r.operator || '')}${r.route ? ' · ' + esc(r.route) : ''} · ${esc(time12(r.at))} · ${esc(r.pax)} pax</small>`;

    function previewTable(rows) {
        const info = resolve(rows);
        const list = [...rows].sort((a, b) => a.at.localeCompare(b.at));
        return `<div class="tp-scroll"><table class="tp-tbl">
          <thead><tr><th>Time</th><th>Route</th><th>Bus</th><th>SH</th><th>Tour operator</th><th>Group leader</th><th class="n">Pax</th><th>Transporter</th><th>Remarks</th></tr></thead>
          <tbody>${list.map(r => { const i = info.get(r.key); return `<tr class="${i.parent ? 'rider' : ''}">
            <td class="t">${esc(time12(r.at))}</td><td>${esc(i.route || '—')}${i.parent ? '<small>grouped</small>' : ''}</td>
            <td class="bus">${i.dest ? esc(i.bus ?? '') : ''}</td><td><b>${esc(r.ref)}</b></td><td>${esc(r.operator)}</td><td>${esc(r.leader)}</td>
            <td class="n">${esc(r.pax)}</td><td>${esc(r.transporter)}${r.vch ? `<small>Vch ${esc(r.vch)}</small>` : ''}</td><td>${esc(r.remarks)}</td></tr>`; }).join('')}</tbody>
        </table></div>`;
    }

    function changeTable(p) {
        const d = p.diff;
        const rows = [
            ...d.added.map(r => `<tr class="add"><td class="k"><input type="checkbox" data-pick="add:${esc(r.key)}" checked aria-label="Apply"></td><td class="what">New</td><td>${who(r)}</td><td>—</td></tr>`),
            ...d.changed.map(c => `<tr class="chg"><td class="k"><input type="checkbox" data-pick="chg:${esc(c.now.key)}" checked aria-label="Apply"></td><td class="what">Changed</td><td>${who(c.now)}</td>
                <td><ul>${c.fields.map(([label, a, b]) => `<li>${esc(label)}: <del>${esc(a || '(empty)')}</del> → <ins>${esc(b || '(empty)')}</ins></li>`).join('')}</ul></td></tr>`),
            ...d.removed.map(r => `<tr class="del"><td class="k"><input type="checkbox" data-pick="del:${esc(r.key)}" checked aria-label="Apply"></td><td class="what">Gone</td><td>${who(r)}</td>
                <td>Not in the new list — ${r.bus != null ? `frees bus ${esc(r.bus)}` : 'will be removed'}</td></tr>`),
        ];
        return `<div class="tp-scroll"><table class="tp-tbl ti-chg"><thead><tr><th></th><th>Change</th><th>Trip</th><th>Details</th></tr></thead><tbody>${rows.join('')}</tbody></table></div>`;
    }

    function render() {
        $('tiResult').innerHTML = plans.map((p, i) => {
            const head = `<h2>${esc(longDate(p.day))} <span class="ti-badge ${p.saved.version ? 'upd' : 'new'}">${p.saved.version ? 'already saved' : 'new day'}</span>
                <small>${esc(tripsLine(p.rows))}</small></h2>`;
            let bodyHtml;
            if (p.done) {
                bodyHtml = `<div class="tp-msg ok">Saved ✓ — <a href="${ctx.href('transport', { day: p.day })}">open the day</a> · <a href="${ctx.href('transport-print', { day: p.day })}">bus sheets</a></div>`;
            } else if (!p.saved.version) {
                bodyHtml = `${previewTable(assignBuses(p.rows.map(r => ({ ...r }))))}
                  <div class="ti-actions">${writable ? `<button type="button" class="tp-btn gold" data-save="${i}">Save ${esc(p.day)}</button>` : '<span class="tp-msg warn">This login cannot save here (read-only).</span>'}</div>`;
            } else {
                const d = p.diff, n = d.added.length + d.changed.length + d.removed.length;
                bodyHtml = `<p class="tp-muted">Saved list: ${p.saved.rows.length} trips${p.saved.updated_at ? ` · ${new Date(p.saved.updated_at).toLocaleString()}` : ''}${p.saved.updated_by ? ' by ' + esc(p.saved.updated_by) : ''}</p>
                  <div class="ti-sum"><span class="ti-badge new">${d.added.length} new</span><span class="ti-badge upd">${d.changed.length} changed</span>
                    <span class="ti-badge" style="background:#fde7e7;color:#a12a2a">${d.removed.length} gone</span><span class="ti-badge">${d.same} unchanged</span></div>
                  ${n ? `${changeTable(p)}
                  <div class="ti-actions">${writable ? `<button type="button" class="tp-btn gold" data-apply="${i}">Apply ticked changes</button>
                    <button type="button" class="tp-btn" data-all="${i}">Tick all</button><button type="button" class="tp-btn" data-none="${i}">Untick all</button>` : '<span class="tp-msg warn">This login cannot save here (read-only).</span>'}
                    <span class="tp-muted">Bus numbers already given stay the same; new trips get the next free numbers.</span></div>`
                    : '<div class="tp-msg ok">Nothing changed — the saved list is already the same.</div>'}`;
            }
            return `<section class="tp-card ti-day" data-i="${i}">${head}${p.error ? `<div class="tp-msg bad">${esc(p.error)}</div>` : ''}${bodyHtml}</section>`;
        }).join('');
    }

    async function read() {
        const { rows, skipped } = parseTransport($('tiText').value);
        if (!rows.length) { $('tiStatus').textContent = 'No trips found. Copy the whole list, including the date column.'; plans = []; render(); return; }
        $('tiStatus').textContent = 'Comparing with the saved days…';
        try {
            const days = byDay(rows);
            plans = await ctx.guard(Promise.all([...days].map(async ([day, list]) => {
                const saved = await loadDay(ctx.siteId, day);
                return { day, rows: list, saved, diff: diffDay(saved.rows, list) };
            })));
            $('tiStatus').textContent = `${rows.length} trips on ${plans.length} day${plans.length === 1 ? '' : 's'}${skipped ? ` · ${skipped} line${skipped === 1 ? '' : 's'} without a booking ref skipped (hotel shuttles)` : ''}.`;
        } catch (e) {
            $('tiStatus').textContent = e instanceof UserError ? e.message : 'Could not reach the server.';
            plans = [];
        }
        render();
    }

    async function save(i, rows, note) {
        const p = plans[i];
        p.error = '';
        try {
            await ctx.guard(saveDay(ctx.siteId, p.day, rows, p.saved.version, note));
            p.done = true;
        } catch (e) {
            p.error = e instanceof UserError ? e.message : 'Could not save.';
            if (e.status === 409) p.error += ' Press “Read the list” again to compare with the latest.';
        }
        render();
    }

    $('tiRead').addEventListener('click', read);
    $('tiClear').addEventListener('click', () => { $('tiText').value = ''; try { sessionStorage.removeItem(DRAFT_KEY); } catch { } plans = []; $('tiStatus').textContent = ''; render(); });
    $('tiResult').addEventListener('click', (e) => {
        const b = e.target.closest('button');
        if (!b || b.disabled) return;
        const card = b.closest('[data-i]');
        if (b.dataset.save != null) {
            const p = plans[Number(b.dataset.save)];
            b.disabled = true;
            save(Number(b.dataset.save), assignBuses(p.rows.map(r => ({ ...r }))), `import: ${p.rows.length} trips`);
        } else if (b.dataset.apply != null) {
            const i = Number(b.dataset.apply), p = plans[i];
            const pick = new Set([...card.querySelectorAll('input[data-pick]:checked')].map(x => x.dataset.pick));
            if (!pick.size) return;
            const count = (t) => [...pick].filter(k => k.startsWith(t)).length;
            b.disabled = true;
            save(i, applyChanges(p.saved.rows, p.diff, pick), `update: ${count('add:')} new, ${count('chg:')} changed, ${count('del:')} removed`);
        } else if (b.dataset.all != null || b.dataset.none != null) {
            card.querySelectorAll('input[data-pick]').forEach(x => { x.checked = b.dataset.all != null; });
        }
    });
}
