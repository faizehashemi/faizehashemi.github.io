// Mawaid counts, redesigned after the pms_web version (pms_web/mawaid.html): the building table with
// BAHA+HUSN merged, a Cooking Count (BAHA+HUSN+MOHAMMEDI+MUFADDAL merged) and Manda Counts (lunch/dinner
// thals × multipliers). Slips come from the cloud for the site being viewed (ctx.db).

import { computeByBuilding as mealsCompute, buildFirstMerged } from '../../core/meals.js';

export default async function mount(ctx) {
        const { db } = ctx;
        const getAllSlips = () => db.all();
        const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
        document.getElementById('heroInfo').textContent = `${ctx.site.label} · a guest counts for a meal when their stay overlaps the meal time. Thals = pax ÷ thal size, rounded up.`;


             /* ====== Color helpers ====== */
        function pastelColorFromString(s) {
            // hash string to hue
            let h = 0;
            for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
            const hue = h % 360;
            const sat = 70;   // stronger saturation for boldness
            const light = 35; // darker (lower lightness value)
            return `hsl(${hue} ${sat}% ${light}%)`;
        }

        /* ====== Utils ====== */


        const $ = id => document.getElementById(id);
        const pad = n => String(n).padStart(2, '0');
        /* ====== Compute over ranges ====== */
        let DB_CACHE = [];

        // computeByBuilding / buildFirstMerged live in app/core/meals.js (shared with the Home page)
        const computeByBuilding = (dateStr, ranges, thal, incA, incC, incI) => mealsCompute(DB_CACHE, dateStr, ranges, thal, incA, incC, incI);

        function cloneRow(r) {
            return JSON.parse(JSON.stringify(r));
        }

        // Merge BAHA + HUSN for the FIRST table only
        // Build a derived dataset for Cooking Count:
        // - Merge HUSN and BAHA into one row (all meals).
        // - Add an extra combined row for MUFADDAL+MOHAMMEDI for Lunch & Dinner only.
        function buildCookingFrom(stats) {
            const MERGE_SET = new Set(['BAHA', 'HUSN', 'MOHAMMEDI', 'MUFADDAL']);
            const byName = new Map(stats.rows.map(r => [r.building, r]));

            // Start with all rows EXCEPT the ones we will merge
            const rows = [];
            for (const r of stats.rows) {
                if (MERGE_SET.has(r.building)) continue; // drop individuals for these four
                rows.push(JSON.parse(JSON.stringify(r)));
            }

            // Build the single merged row across Breakfast, Lunch, Dinner
            const parts = ['BAHA', 'HUSN', 'MOHAMMEDI', 'MUFADDAL']
                .map(n => byName.get(n))
                .filter(Boolean);

            if (parts.length) {
                // Sum helper
                const sum = (getter) => parts.reduce((a, p) => a + getter(p), 0);

                const merged = {
                    building: 'BAHA+HUSN+MOHAMMEDI+MUFADDAL',

                    // Pax per meal (include breakfast too)
                    bp: sum(p => p.bp),
                    lp: sum(p => p.lp),
                    dp: sum(p => p.dp),

                    // Thals will be recomputed below from pax; set placeholders for now
                    bt: 0, lt: 0, dt: 0,

                    // Breakdown blocks summed across all four for each meal
                    b: {
                        g: sum(p => p.b.g), l: sum(p => p.b.l),
                        c: sum(p => p.b.c), i: sum(p => p.b.i)
                    },
                    l: {
                        g: sum(p => p.l.g), l: sum(p => p.l.l),
                        c: sum(p => p.l.c), i: sum(p => p.l.i)
                    },
                    d: {
                        g: sum(p => p.d.g), l: sum(p => p.d.l),
                        c: sum(p => p.d.c), i: sum(p => p.d.i)
                    }
                };

                rows.push(merged); // add exactly one merged row
            }

            // Totals and thals recompute for the cooking table from pax
            const thal = Math.max(1, Number(document.getElementById('thalSize').value) || 8);

            // Compute thals per row based on pax
            for (const r of rows) {
                r.bt = Math.ceil(r.bp / thal);
                r.lt = Math.ceil(r.lp / thal);
                r.dt = Math.ceil(r.dp / thal);
            }

            // Table totals
            const totals = rows.reduce((t, r) => {
                t.tBP += r.bp; t.tLP += r.lp; t.tDP += r.dp;
                t.tBT += r.bt; t.tLT += r.lt; t.tDT += r.dt;
                return t;
            }, { tBP: 0, tLP: 0, tDP: 0, tBT: 0, tLT: 0, tDT: 0 });

            return { rows, totals };
        }


        function buildMandaFrom(stats, multL, multD) {
            const pairs = [
                { name: 'MUFADDAL+MOHAMMEDI', members: ['MUFADDAL', 'MOHAMMEDI'] },
                { name: 'HUSN+BAHA', members: ['HUSN', 'BAHA'] }
            ];

            const skip = new Set(pairs.flatMap(p => p.members));
            const byName = new Map(stats.rows.map(r => [r.building, r]));

            const rows = [];

            // Keep everyone except the merged members, using rounded integers
            for (const r of stats.rows) {
                if (skip.has(r.building)) continue;
                const lInt = Math.round((r.lt || 0) * multL);
                const dInt = Math.round((r.dt || 0) * multD);
                rows.push({ building: r.building, ltx: lInt, dtx: dInt });
            }

            // Add merged rows (rounded to whole numbers)
            for (const p of pairs) {
                const parts = p.members.map(n => byName.get(n)).filter(Boolean);
                if (!parts.length) continue;

                const lt = parts.reduce((a, r) => a + (r.lt || 0), 0);
                const dt = parts.reduce((a, r) => a + (r.dt || 0), 0);

                const lInt = Math.round(lt * multL);
                const dInt = Math.round(dt * multD);

                rows.push({ building: p.name, ltx: lInt, dtx: dInt });
            }

            // Integer totals
            const totals = rows.reduce((t, r) => ({
                ltx: t.ltx + r.ltx,
                dtx: t.dtx + r.dtx
            }), { ltx: 0, dtx: 0 });

            return { rows, totals, multL, multD };
        }



        // Simple renderers for the two extra tables
        function buildMandaHeader(tableId = '#tblManda') {
            const thead = document.querySelector(`${tableId} thead`);
            thead.innerHTML = `<tr>
    <th>Building</th>
    <th class="mealL">Lunch Thals×</th>
    <th class="mealD">Dinner Thals×</th>
    <th>Total</th>
  </tr>`;
        }

        function renderMandaBody(manda, tableId = '#tblManda') {
            const tb = document.querySelector(`${tableId} tbody`);
            tb.innerHTML = '';
            for (const r of manda.rows) {
                const tr = document.createElement('tr');
                tr.innerHTML = `
      <td class="building"><span class="building-name">${esc(r.building)}</span></td>
      <td class="mealL thal">${r.ltx}</td>
      <td class="mealD thal">${r.dtx}</td>
      <td>${+(r.ltx + r.dtx).toFixed(2)}</td>`;
                tr.style.color = pastelColorFromString(r.building);
                tb.appendChild(tr);
            }
        }

        function renderMandaFoot(manda, tableId = '#tblManda') {
            const tf = document.querySelector(`${tableId} tfoot`);
            const total = +(manda.totals.ltx + manda.totals.dtx).toFixed(2);
            tf.innerHTML = `<tr>
    <td>Total</td>
    <td class="mealL thal">${manda.totals.ltx}</td>
    <td class="mealD thal">${manda.totals.dtx}</td>
    <td>${total}</td>
  </tr>`;
        }

        /* ====== Render (dynamic columns) ====== */
        let CURRENT_COLUMNS = []; // for CSV export

        function buildHeader(show, tableId = '#tbl') {
            const thead = document.querySelector(`${tableId} thead`);

            const subCols = []
                .concat(show.p ? ['Pax'] : [])
                .concat(['Thals'])
                .concat(show.g ? ['Gents'] : [])
                .concat(show.l ? ['Ladies'] : [])
                .concat(show.c ? ['Children'] : [])
                .concat(show.i ? ['Infants'] : []);

            const top = `<tr>
    <th rowspan="2">Building</th>
    <th class="mealB" colspan="${subCols.length}">Breakfast</th>
    <th class="mealL" colspan="${subCols.length}">Lunch</th>
    <th class="mealD" colspan="${subCols.length}">Dinner</th>
  </tr>`;

            const sub = `<tr>${['mealB', 'mealL', 'mealD']
                .map(mealClass => subCols.map(s => `<th class="${mealClass}">${s}</th>`).join(''))
                .join('')
                }</tr>`;

            thead.innerHTML = top + sub;

            CURRENT_COLUMNS = ['Building'];
            for (const meal of ['B', 'L', 'D']) {
                if (show.p) CURRENT_COLUMNS.push(`${meal}:Pax`);
                CURRENT_COLUMNS.push(`${meal}:Thals`);
                if (show.g) CURRENT_COLUMNS.push(`${meal}:Gents`);
                if (show.l) CURRENT_COLUMNS.push(`${meal}:Ladies`);
                if (show.c) CURRENT_COLUMNS.push(`${meal}:Children`);
                if (show.i) CURRENT_COLUMNS.push(`${meal}:Infants`);
            }
        }



        function renderBody(stats, show, tableId = '#tbl') {
            const tb = document.querySelector(`${tableId} tbody`);
            tb.innerHTML = '';
            for (const r of stats.rows) {
                const bColor = pastelColorFromString(r.building);

                const bCells = []
                    .concat(show.p ? [`<td class="mealB">${r.bp}</td>`] : [])
                    .concat([`<td class="mealB thal">${r.bt}</td>`])
                    .concat(show.g ? [`<td class="mealB">${r.b.g}</td>`] : [])
                    .concat(show.l ? [`<td class="mealB">${r.b.l}</td>`] : [])
                    .concat(show.c ? [`<td class="mealB">${r.b.c}</td>`] : [])
                    .concat(show.i ? [`<td class="mealB">${r.b.i}</td>`] : []);

                const lCells = []
                    .concat(show.p ? [`<td class="mealL">${r.lp}</td>`] : [])
                    .concat([`<td class="mealL thal">${r.lt}</td>`])
                    .concat(show.g ? [`<td class="mealL">${r.l.g}</td>`] : [])
                    .concat(show.l ? [`<td class="mealL">${r.l.l}</td>`] : [])
                    .concat(show.c ? [`<td class="mealL">${r.l.c}</td>`] : [])
                    .concat(show.i ? [`<td class="mealL">${r.l.i}</td>`] : []);

                const dCells = []
                    .concat(show.p ? [`<td class="mealD">${r.dp}</td>`] : [])
                    .concat([`<td class="mealD thal">${r.dt}</td>`])
                    .concat(show.g ? [`<td class="mealD">${r.d.g}</td>`] : [])
                    .concat(show.l ? [`<td class="mealD">${r.d.l}</td>`] : [])
                    .concat(show.c ? [`<td class="mealD">${r.d.c}</td>`] : [])
                    .concat(show.i ? [`<td class="mealD">${r.d.i}</td>`] : []);

                const tr = document.createElement('tr');
                tr.innerHTML = [
                    `<td class="building"><span class="building-name">${esc(r.building)}</span></td>`,
                    ...bCells, ...lCells, ...dCells
                ].join('');

                tr.style.color = bColor;
                tb.appendChild(tr);
            }
        }




        function renderFoot(stats, thal, show, tableId = '#tbl') {
            const tf = document.querySelector(`${tableId} tfoot`);
            const sum = (getter) => stats.rows.reduce((a, r) => a + getter(r), 0);

            const cells = [];

            // Breakfast
            if (show.p) cells.push(`<td class="mealB">${stats.totals.tBP}</td>`);
            cells.push(`<td class="mealB thal">${stats.totals.tBT}</td>`);
            if (show.g) cells.push(`<td class="mealB">${sum(r => r.b.g)}</td>`);
            if (show.l) cells.push(`<td class="mealB">${sum(r => r.b.l)}</td>`);
            if (show.c) cells.push(`<td class="mealB">${sum(r => r.b.c)}</td>`);
            if (show.i) cells.push(`<td class="mealB">${sum(r => r.b.i)}</td>`);

            // Lunch
            if (show.p) cells.push(`<td class="mealL">${stats.totals.tLP}</td>`);
            cells.push(`<td class="mealL thal">${stats.totals.tLT}</td>`);
            if (show.g) cells.push(`<td class="mealL">${sum(r => r.l.g)}</td>`);
            if (show.l) cells.push(`<td class="mealL">${sum(r => r.l.l)}</td>`);
            if (show.c) cells.push(`<td class="mealL">${sum(r => r.l.c)}</td>`);
            if (show.i) cells.push(`<td class="mealL">${sum(r => r.l.i)}</td>`);

            // Dinner
            if (show.p) cells.push(`<td class="mealD">${stats.totals.tDP}</td>`);
            cells.push(`<td class="mealD thal">${stats.totals.tDT}</td>`);
            if (show.g) cells.push(`<td class="mealD">${sum(r => r.d.g)}</td>`);
            if (show.l) cells.push(`<td class="mealD">${sum(r => r.d.l)}</td>`);
            if (show.c) cells.push(`<td class="mealD">${sum(r => r.d.c)}</td>`);
            if (show.i) cells.push(`<td class="mealD">${sum(r => r.d.i)}</td>`);

            tf.innerHTML = `<tr><td>Total</td>${cells.join('')}</tr>`;
        }




        /* ====== CSV Export ====== */
        function exportCSV() {
            const lines = [];
            lines.push(CURRENT_COLUMNS.join(','));

            document.querySelectorAll('#tbl tbody tr').forEach(tr => {
                const cells = Array.from(tr.children).map(td => td.textContent.replace(/,/g, ''));
                lines.push(cells.join(','));
            });

            const tot = Array.from(document.querySelector('#tbl tfoot tr').children)
                .map(td => td.textContent.replace(/,/g, ''));
            lines.push(tot.join(','));

            const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = `mawaid_${$('statDate').value || 'date'}.csv`;
            a.click(); URL.revokeObjectURL(a.href);
        }

        /* ====== Boot ====== */
        await (async function init() {
            const now = new Date();
            $('statDate').value = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;

            $('btnPrint').addEventListener('click', () => window.print());
            $('btnCSV').addEventListener('click', exportCSV);

            const run = () => {
                const dateStr = $('statDate').value;
                const ranges = {
                    B: { start: $('timeBStart').value || '04:00', end: $('timeBEnd').value || '09:30' },
                    L: { start: $('timeLStart').value || '11:00', end: $('timeLEnd').value || '16:00' },
                    D: { start: $('timeDStart').value || '18:00', end: $('timeDEnd').value || '23:00' },
                };
                const thal = Math.max(1, Number($('thalSize').value) || 8);

                const incA = $('incAdults').checked;
                const incC = $('incChildren').checked;
                const incI = $('incInfants').checked;

                const show = {
                    p: $('showPax').checked,
                    g: $('showG').checked, l: $('showL').checked,
                    c: $('showC').checked, i: $('showI').checked
                };


                const stats = computeByBuilding(dateStr, ranges, thal, incA, incC, incI);
                if (!stats) { alert('Check your start/end times; end must be after start for each meal.'); return; }

                // Main table
                // Main table with BAHA+HUSN merged
                const statsMergedFirst = buildFirstMerged(stats, thal);
                buildHeader(show, '#tbl');
                renderBody(statsMergedFirst, show, '#tbl');
                renderFoot(statsMergedFirst, thal, show, '#tbl');


                // Cooking Count
                const cook = buildCookingFrom(stats);
                buildHeader(show, '#tblCook');
                renderBody(cook, show, '#tblCook');
                renderFoot(cook, thal, show, '#tblCook');

                // Manda
                const multL = Number($('multL').value) || 3;
                const multD = Number($('multD').value) || 2.5;
                const manda = buildMandaFrom(stats, multL, multD);
                buildMandaHeader('#tblManda');
                renderMandaBody(manda, '#tblManda');
                renderMandaFoot(manda, '#tblManda');


                const fmtR = ([s, e]) => `${pad(s.getHours())}:${pad(s.getMinutes())}–${pad(e.getHours())}:${pad(e.getMinutes())}`;



            };
            [
                'statDate', 'timeBStart', 'timeBEnd', 'timeLStart', 'timeLEnd', 'timeDStart', 'timeDEnd',
                'thalSize', 'incAdults', 'incChildren', 'incInfants',
                'showPax', 'showG', 'showL', 'showC', 'showI',
                'multL', 'multD'
            ].forEach(id => $(id).addEventListener('input', run));


            $('btnRun').addEventListener('click', run);
            $('btnRefresh').addEventListener('click', async () => {
                try {
                    DB_CACHE = await getAllSlips();
                    $('status').textContent = `${DB_CACHE.length} ${ctx.site.label} slip(s).`;
                    run();
                } catch (e) {
                    console.error(e);
                    $('status').textContent = 'Could not load slips: ' + e.message;
                }
            });

            // initial read
            try {
                DB_CACHE = await getAllSlips();

            } catch (e) {
                console.error(e);
                $('status').textContent = 'Could not load slips: ' + e.message;
            }

            run();
        })();
}
