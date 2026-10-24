// Medina Ziyarat, gents and ladies apart (Medina only, route MADINA-MADINA ZIYARAT).
// On the Transport day a Ziyarat bus can be split: every group on it gets a GENTS trip (adults, gents' children,
// infants) and a LADIES trip (adults, ladies' children, infants), each at its own time — the gents part keeps the
// group's own trip (key), the ladies part is a new trip "<key>-L" (manual, so a pasted list never removes it).
// The Bus sheets' Print summary then lists them as the desks' Ziyarat sheets: one table per part and time
// ("MADINA ZIYARAT GENTS-04:00 PM 21/10/26"), with GENTS / G-C / IFN / T-P and the hotel.
// Trip fields: part 'gents' | 'ladies'; m (gents adults) or f (ladies adults), c (children), inf (infants);
// split_orig (the gents trip's numbers and time before the split, for "Undo split").

import { normRoute, time12 } from './transport.js';

export const ZIYARAT_ROUTE = 'MADINA-MADINA ZIYARAT';
export const isZiyarat = (site, route) => site === 'medina' && normRoute(route) === ZIYARAT_ROUTE;
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const n = (v) => Math.max(0, parseInt(v, 10) || 0);
const pad = (x) => String(x).padStart(2, '0');

/**
 * The split window for one Ziyarat bus. main = its own trip, riders = the groups riding with it, all = the day's rows.
 * Resolves with the day's new rows, or null when cancelled.
 */
export function openZiyaratSplit(main, riders, all) {
    return new Promise((resolve) => {
        const groups = [main, ...riders];
        const ladiesOf = (r) => all.find(x => x.key === `${r.key}-L`);
        const split = main.part === 'gents';
        const day = main.at.slice(0, 10);
        const gTime = main.at.slice(11, 16);
        const lTime = split ? (ladiesOf(main)?.at || main.at).slice(11, 16) : '';
        const row = (r, i) => {
            const L = ladiesOf(r);
            const g = split ? [r.m || 0, r.c || 0, r.inf || 0] : [r.m || 0, 0, 0];
            const l = split ? [L?.f || 0, L?.c || 0, L?.inf || 0] : [r.f || 0, r.c || 0, 0];
            return `<tr data-k="${esc(r.key)}"><td class="z-n">${i + 1}</td><td><b>${esc(r.ref || '—')}</b><small>${esc(r.operator || '')}${r.leader ? ` · ${esc(r.leader)}` : ''}</small></td>
              ${['g', 'gc', 'gi'].map((f, k) => `<td class="z-g"><input type="number" min="0" max="999" inputmode="numeric" data-f="${f}" value="${g[k]}"></td>`).join('')}
              ${['l', 'lc', 'li'].map((f, k) => `<td class="z-l"><input type="number" min="0" max="999" inputmode="numeric" data-f="${f}" value="${l[k]}"></td>`).join('')}
              <td class="z-t">${(r.pax || 0)}</td></tr>`;
        };
        const dlg = document.createElement('dialog');
        dlg.className = 'z-dlg';
        dlg.innerHTML = `<style>
            .z-dlg { border: 0; border-radius: 16px; padding: 0; width: min(96vw, 860px); max-height: 90vh; box-shadow: 0 24px 70px rgba(0,0,0,.3); font: 14px/1.45 system-ui, sans-serif; color: #2b1e15; }
            .z-dlg::backdrop { background: rgba(43, 30, 21, .4); }
            .z-dlg header { padding: 14px 18px; color: #fff; font-weight: 800; font-size: 16px; background: linear-gradient(135deg, #7a5410, #b8871d 55%, #d4af37); }
            .z-dlg .z-body { padding: 12px 18px; overflow: auto; max-height: calc(90vh - 130px); }
            .z-dlg .z-times { display: flex; flex-wrap: wrap; gap: 10px 18px; margin-bottom: 10px; }
            .z-dlg .z-times label { display: grid; gap: 3px; font-size: 12px; font-weight: 700; }
            .z-dlg input { font: inherit; padding: 5px 7px; border: 1px solid #d9c49d; border-radius: 8px; width: 64px; }
            .z-dlg .z-times input { width: 120px; }
            .z-dlg table { width: 100%; border-collapse: collapse; font-size: 13px; }
            .z-dlg th, .z-dlg td { border: 1px solid #e3d2b1; padding: 4px 6px; text-align: center; vertical-align: middle; }
            .z-dlg td:nth-child(2) { text-align: left; } .z-dlg td small { display: block; color: #6b5e4a; font-size: 11.5px; }
            .z-dlg th.z-g, .z-dlg td.z-g { background: #eef5ff; } .z-dlg th.z-l, .z-dlg td.z-l { background: #fff0f5; }
            .z-dlg .z-note { font-size: 12.5px; color: #6b5e4a; margin: 8px 0 0; }
            .z-dlg footer { padding: 10px 18px 14px; display: flex; flex-wrap: wrap; gap: 8px; justify-content: flex-end; }
            .z-dlg footer button { font: inherit; font-weight: 800; padding: 8px 16px; border-radius: 999px; border: 1px solid #b8931f; background: #fff; color: #7a5410; cursor: pointer; }
            .z-dlg footer .main { background: #9a7414; color: #fff; border-color: #9a7414; }
            .z-dlg footer .undo { margin-right: auto; color: #a12a2a; border-color: #e3b0aa; }
            .z-dlg .z-msg { color: #a12a2a; font-weight: 700; align-self: center; }
          </style>
          <header>🕌 Ziyarat — gents and ladies · ${esc(time12(main.at))} bus${main.ref ? ` · SH ${esc(main.ref)}` : ''}</header>
          <div class="z-body">
            <div class="z-times">
              <label>Gents leave at<input type="time" data-t="g" value="${esc(gTime)}" required></label>
              <label>Ladies leave at<input type="time" data-t="l" value="${esc(lTime)}" required></label>
            </div>
            <table><thead>
              <tr><th rowspan="2">#</th><th rowspan="2">SH · group</th><th class="z-g" colspan="3">GENTS trip</th><th class="z-l" colspan="3">LADIES trip</th><th rowspan="2">Pax now</th></tr>
              <tr><th class="z-g">Gents</th><th class="z-g">G-C</th><th class="z-g">IFN</th><th class="z-l">Ladies</th><th class="z-l">L-C</th><th class="z-l">IFN</th></tr>
            </thead><tbody>${groups.map(row).join('')}</tbody></table>
            <p class="z-note">G-C / L-C = children with the gents / with the ladies · IFN = infants. Each part gets its own bus number; a group with 0 in a part has no trip there.</p>
          </div>
          <footer>${split ? '<button type="button" class="undo" data-a="undo">Undo split</button>' : ''}<span class="z-msg"></span>
            <button type="button" data-a="cancel">Cancel</button><button type="button" class="main" data-a="save">${split ? 'Save' : 'Split into gents and ladies'}</button></footer>`;
        document.body.appendChild(dlg);
        const done = (v) => { dlg.close(); dlg.remove(); resolve(v); };
        dlg.addEventListener('cancel', () => done(null));
        dlg.addEventListener('click', (e) => {
            const a = e.target.closest('[data-a]')?.dataset.a;
            if (!a) return;
            if (a === 'cancel') return done(null);
            const keys = new Set(groups.map(g => g.key)), lKeys = new Set(groups.map(g => `${g.key}-L`));
            if (a === 'undo') {
                // back to one trip per group with the numbers and time from before the split
                const rows = all.filter(r => !lKeys.has(r.key)).map(r => {
                    if (!keys.has(r.key) || !r.split_orig) return r;
                    const { part, inf, split_orig: o, at_manual, at_import, pax_manual, ...x } = r;
                    return { ...x, ...o };
                });
                return done(rows);
            }
            const gT = dlg.querySelector('[data-t="g"]').value, lT = dlg.querySelector('[data-t="l"]').value;
            if (!/^\d{2}:\d{2}$/.test(gT) || !/^\d{2}:\d{2}$/.test(lT)) { dlg.querySelector('.z-msg').textContent = 'Fill in both times.'; return; }
            const val = (k, f) => n(dlg.querySelector(`tr[data-k="${CSS.escape(k)}"] [data-f="${f}"]`).value);
            const gAt = `${day}T${gT}`, lAt = `${day}T${lT}`;
            const out = [];
            for (const r of all) {
                if (lKeys.has(r.key)) continue; // the ladies trips are made again below
                if (!keys.has(r.key)) { out.push(r); continue; }
                const isMain = r.key === main.key;
                const orig = r.split_orig || { m: r.m, f: r.f, c: r.c, pax: r.pax, at: r.at, ...(r.at_manual ? { at_manual: true, at_import: r.at_import } : {}), ...(r.pax_manual ? { pax_manual: true } : {}) };
                const g = [val(r.key, 'g'), val(r.key, 'gc'), val(r.key, 'gi')], l = [val(r.key, 'l'), val(r.key, 'lc'), val(r.key, 'li')];
                const listAt = r.at_manual ? r.at_import : r.at;
                out.push({ ...r, part: 'gents', m: g[0], f: 0, c: g[1], inf: g[2], pax: g[0] + g[1] + g[2], pax_manual: true, split_orig: orig,
                    at: gAt, ...(gAt === listAt ? { at_manual: false } : { at_manual: true, at_import: listAt }) });
                if (l[0] + l[1] + l[2] > 0 || isMain) {
                    const { bus, bus_manual, split_orig, at_manual, at_import, pax_manual, names_manual, transporter_manual, vch_import, vch, transporter, adj, dora, with: w, ...base } = r;
                    out.push({ ...base, key: `${r.key}-L`, part: 'ladies', m: 0, f: l[0], c: l[1], inf: l[2], pax: l[0] + l[1] + l[2], at: lAt, manual: true,
                        remarks: `ladies part of SH ${r.ref || ''}`.trim(), dora: '', adj: '', vch: '', transporter: isMain ? r.transporter || '' : '',
                        ...(isMain ? { route: r.route } : { route: '', with: `${main.key}-L` }) });
                }
            }
            done(out.sort((a, b) => a.at.localeCompare(b.at)));
        });
        dlg.showModal();
    });
}

/** "21/10/26" */
const shortDate = (day) => { const [y, m, d] = day.split('-'); return `${d}/${m}/${y.slice(2)}`; };
const isCoaster = (b) => b.vehicle === 'other' && /coaster/i.test(b.vlabel || '');
/** "04:00 PM" (two-digit hour, as on the desks' sheets) */
const t12 = (at) => { const [h, m] = String(at).slice(11, 16).split(':').map(Number); return `${pad(h % 12 || 12)}:${pad(m)} ${h < 12 ? 'AM' : 'PM'}`; };

/**
 * The split Ziyarat buses of a day as tables, one per part and departure time, in the desks' sheet format. Used by the
 * print summary (HTML, below) and the Excel export. group = the Medina Ziyarat destination from signage();
 * returns { tables, rest } — rest = buses not split (they get the normal summary table).
 * table: { G, part, at, title: 'MADINA ZIYARAT GENTS-04:00 PM 21/10/26', rows: [{ sn, ref, operator, leader, adults, c, inf, pax, hotel }],
 *          perBus, coasters, perCoaster, bigN, total: { label, adults, c, inf, pax } }
 */
export function ziyaratTables(day, group) {
    const parts = new Map(), rest = [];
    for (const b of group.buses) {
        const part = b.rows[0]?.part;
        if (part !== 'gents' && part !== 'ladies') { rest.push(b); continue; }
        const k = `${part}|${b.at.slice(11, 16)}`;
        if (!parts.has(k)) parts.set(k, { part, at: b.at, buses: [] });
        parts.get(k).buses.push(b);
    }
    const tables = [...parts.values()].sort((a, b) => a.at.localeCompare(b.at) || a.part.localeCompare(b.part)).map(({ part, at, buses }) => {
        const G = part === 'gents';
        const list = buses.flatMap(b => b.rows.map(r => ({ r, b }))).filter(({ r }) => (r.pax || 0) > 0);
        const adults = (r) => G ? (r.m || 0) : (r.f || 0);
        const sum = (f) => list.reduce((s, x) => s + f(x.r), 0);
        const big = buses.filter(b => !isCoaster(b)), small = buses.filter(isCoaster);
        const per = (l) => l.map(b => b.pax).join(' / ') || '00';
        return {
            G, part, at, title: `MADINA ZIYARAT ${G ? 'GENTS' : 'LADIES'}-${t12(at)} ${shortDate(day)}`,
            rows: list.map(({ r, b }, i) => ({ sn: i + 1, ref: r.ref || '', operator: r.operator || '', leader: r.leader || '', adults: adults(r) || '', c: r.c || '', inf: r.inf || '', pax: r.pax || 0, hotel: r.building || b.building || '' })),
            perBus: per(big), bigN: pad(big.length), coasters: pad(small.length), perCoaster: per(small),
            total: { label: `TOTAL PAX. ${G ? 'GENTS' : 'LADIES'}`, adults: sum(adults), c: sum(r => r.c || 0), inf: sum(r => r.inf || 0), pax: sum(r => r.pax || 0) },
        };
    });
    return { tables, rest };
}

/** The same tables as HTML for the print summary; returns { html, rest }. */
export function ziyaratSummary(day, group) {
    const { tables, rest } = ziyaratTables(day, group);
    const html = tables.map((z) => {
        const G = z.G, head = z.title.replace('ZIYARAT', '<span class="zy-red">ZIYARAT</span>');
        return `<table class="sum zy">
          <colgroup><col style="width:5%"><col style="width:9%"><col style="width:40%"><col style="width:8%"><col style="width:7%"><col style="width:6%"><col style="width:8%"><col style="width:17%"></colgroup>
          <thead>
            <tr class="zy-title"><th colspan="8">${head}</th></tr>
            <tr class="zy-cols"><th class="zy-red">S N</th><th class="zy-red">S H NO.</th><th>GRUP-NAME</th><th class="zy-red">${G ? 'GENTS' : 'LADIES'}</th><th>${G ? 'G-C' : 'L-C'}</th><th>IFN</th><th class="zy-red">T-P</th><th>HOTEL-NAME</th></tr>
          </thead>
          <tbody>${z.rows.map((r) => `<tr>
            <td>${r.sn}</td><td>${esc(r.ref)}</td>
            <td class="zy-name">${r.operator ? `<span class="zy-red">${esc(r.operator)}</span>` : ''}${r.leader ? `<br>( ${esc(r.leader)} )` : ''}</td>
            <td>${r.adults}</td><td>${r.c}</td><td>${r.inf}</td><td class="zy-tp">${r.pax}</td><td>${esc(r.hotel)}</td></tr>`).join('')}</tbody>
          <tfoot>
            <tr class="zy-note"><td colspan="8">NOTE:- <span class="zy-red">PER BUS-${esc(z.perBus)}</span> PAX ...... ${z.coasters}-COASTER-${esc(z.perCoaster)} PAX</td></tr>
            <tr class="zy-total"><td colspan="3"><span class="zy-red">${z.total.label}</span> - ${z.total.pax} - ${z.bigN} BUS ${z.coasters}-COASTER</td>
              <td>${z.total.adults}</td><td>${z.total.c}</td><td>${z.total.inf}</td><td class="zy-tp">${z.total.pax}</td><td></td></tr>
          </tfoot>
        </table>`;
    }).join('');
    return { html, rest };
}
