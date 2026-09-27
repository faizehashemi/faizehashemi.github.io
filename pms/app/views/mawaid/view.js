// Ported from pms/mawaid.html. Page logic is kept as it was; storage goes through ctx.db (app/core/db.js).

export default async function mount(ctx) {
const { db } = ctx;

/* ====== Data (this site) ====== */
        const DB_NAME = 'PMS cloud'; // labels for status text
        const STORE = `slips (${ctx.site.label})`;
        const getAllSlips = () => db.all();

        /* ====== Utils ====== */
        const $ = id => document.getElementById(id);
        const pad = n => String(n).padStart(2, '0');
        function parseLocalDateTime(d, t) {
            if (!d) return null;
            const s = t && t.length ? t : '00:00';
            const [y, m, dd] = d.split('-').map(Number);
            const [hh, mi] = s.split(':').map(Number);
            const dt = new Date(y, (m || 1) - 1, (dd || 1), hh || 0, mi || 0, 0, 0);
            return isNaN(dt) ? null : dt;
        }
        function overlap(aStart, aEnd, bStart, bEnd) {
            return aStart < bEnd && bStart < aEnd; // proper interval overlap on [start, end)
        }
        function uniq(a) { return Array.from(new Set(a)); }

        /* Pax totals controlled by include toggles */
        function paxOf(rec, incA, incC, incI) {
            const total = Number(rec.total);
            const g = Number(rec.gents) || 0, l = Number(rec.ladies) || 0, c = Number(rec.children) || 0, i = Number(rec.infants) || 0;
            const wantAll = incA && incC && incI;
            if (Number.isFinite(total) && total > 0 && wantAll) return total;
            let s = 0; if (incA) s += g + l; if (incC) s += c; if (incI) s += i;
            return s || (Number.isFinite(total) ? total : 0);
        }

        /* ====== Compute over ranges ====== */
        let DB_CACHE = [];

        function parseRange(dateStr, tStart, tEnd) {
            const start = parseLocalDateTime(dateStr, tStart);
            const end = parseLocalDateTime(dateStr, tEnd);
            if (!start || !end || end <= start) return null;
            return [start, end];
        }

        function computeByBuilding(dateStr, ranges, thal, incA, incC, incI) {
            const bR = parseRange(dateStr, ranges.B.start, ranges.B.end);
            const lR = parseRange(dateStr, ranges.L.start, ranges.L.end);
            const dR = parseRange(dateStr, ranges.D.start, ranges.D.end);
            if (!bR || !lR || !dR) return null;

            const buildings = uniq(DB_CACHE.map(r => (r.building || '').trim()).filter(Boolean)).sort((a, b) => a.localeCompare(b));
            const agg = new Map();
            for (const b of buildings) agg.set(b, {
                bp: 0, lp: 0, dp: 0,
                b: { g: 0, l: 0, c: 0, i: 0 },
                l: { g: 0, l: 0, c: 0, i: 0 },
                d: { g: 0, l: 0, c: 0, i: 0 }
            });

            for (const rec of DB_CACHE) {
                const b = (rec.building || '').trim(); if (!b || !agg.has(b)) continue;

                const ci = parseLocalDateTime(rec.checkin_date, rec.checkin_time);
                const co = parseLocalDateTime(rec.checkout_date, rec.checkout_time);
                if (!ci || !co) continue;

                const pax = paxOf(rec, incA, incC, incI);
                const g = Number(rec.gents) || 0, l = Number(rec.ladies) || 0, c = Number(rec.children) || 0, i = Number(rec.infants) || 0;
                const a = agg.get(b);

                if (overlap(ci, co, bR[0], bR[1])) { a.bp += pax; a.b.g += g; a.b.l += l; a.b.c += c; a.b.i += i; }
                if (overlap(ci, co, lR[0], lR[1])) { a.lp += pax; a.l.g += g; a.l.l += l; a.l.c += c; a.l.i += i; }
                if (overlap(ci, co, dR[0], dR[1])) { a.dp += pax; a.d.g += g; a.d.l += l; a.d.c += c; a.d.i += i; }
            }

            let tBP = 0, tLP = 0, tDP = 0;
            const rows = [];
            for (const [b, v] of agg.entries()) {
                tBP += v.bp; tLP += v.lp; tDP += v.dp;
                rows.push({
                    building: b,
                    bp: v.bp, bt: Math.ceil(v.bp / thal),
                    lp: v.lp, lt: Math.ceil(v.lp / thal),
                    dp: v.dp, dt: Math.ceil(v.dp / thal),
                    b: v.b, l: v.l, d: v.d
                });
            }
            rows.sort((a, b) => a.building.localeCompare(b.building, undefined, { numeric: true }));

            return {
                rows,
                totals: { tBP, tLP, tDP, tBT: Math.ceil(tBP / thal), tLT: Math.ceil(tLP / thal), tDT: Math.ceil(tDP / thal) },
                when: {
                    B: bR, L: lR, D: dR
                }
            };
        }

        /* ====== Render (dynamic columns) ====== */
        let CURRENT_COLUMNS = []; // for CSV export

        function buildHeader(show) {
            const thead = document.querySelector('#tbl thead');
            const subCols = ['Pax', 'Thals']
                .concat(show.g ? ['Gents'] : [])
                .concat(show.l ? ['Ladies'] : [])
                .concat(show.c ? ['Children'] : [])
                .concat(show.i ? ['Infants'] : []);

            const top = `<tr>
          <th rowspan="2">Building</th>
          <th colspan="${subCols.length}">Breakfast</th>
          <th colspan="${subCols.length}">Lunch</th>
          <th colspan="${subCols.length}">Dinner</th>
        </tr>`;

            const sub = `<tr>${['Breakfast', 'Lunch', 'Dinner'].map(() => subCols.map(s => `<th>${s}</th>`).join('')).join('')}</tr>`;
            thead.innerHTML = top + sub;

            CURRENT_COLUMNS = ['Building'];
            for (const meal of ['B', 'L', 'D']) {
                CURRENT_COLUMNS.push(`${meal}:Pax`, `${meal}:Thals`);
                if (show.g) CURRENT_COLUMNS.push(`${meal}:Gents`);
                if (show.l) CURRENT_COLUMNS.push(`${meal}:Ladies`);
                if (show.c) CURRENT_COLUMNS.push(`${meal}:Children`);
                if (show.i) CURRENT_COLUMNS.push(`${meal}:Infants`);
            }
        }

        function renderBody(stats, show) {
            const tb = document.querySelector('#tbl tbody');
            tb.innerHTML = '';
            for (const r of stats.rows) {
                const cells = [
                    `<td>${r.building}</td>`,

                    `<td>${r.bp}</td>`,
                    `<td class="thal">${r.bt}</td>`,
                    ...(show.g ? [`<td>${r.b.g}</td>`] : []),
                    ...(show.l ? [`<td>${r.b.l}</td>`] : []),
                    ...(show.c ? [`<td>${r.b.c}</td>`] : []),
                    ...(show.i ? [`<td>${r.b.i}</td>`] : []),

                    `<td>${r.lp}</td>`,
                    `<td class="thal">${r.lt}</td>`,
                    ...(show.g ? [`<td>${r.l.g}</td>`] : []),
                    ...(show.l ? [`<td>${r.l.l}</td>`] : []),
                    ...(show.c ? [`<td>${r.l.c}</td>`] : []),
                    ...(show.i ? [`<td>${r.l.i}</td>`] : []),

                    `<td>${r.dp}</td>`,
                    `<td class="thal">${r.dt}</td>`,
                    ...(show.g ? [`<td>${r.d.g}</td>`] : []),
                    ...(show.l ? [`<td>${r.d.l}</td>`] : []),
                    ...(show.c ? [`<td>${r.d.c}</td>`] : []),
                    ...(show.i ? [`<td>${r.d.i}</td>`] : [])
                ];
                const tr = document.createElement('tr');
                tr.innerHTML = cells.join('');
                tb.appendChild(tr);
            }
        }

        function renderFoot(stats, thal, show) {
            const tf = document.querySelector('#tbl tfoot');
            const sum = (getter) => stats.rows.reduce((a, r) => a + getter(r), 0);

            const row = [
                `<td>Total</td>`,
                `<td>${stats.totals.tBP}</td>`,
                `<td class="thal">${stats.totals.tBT}</td>`,
                (show.g ? `<td>${sum(r => r.b.g)}</td>` : ''),
                (show.l ? `<td>${sum(r => r.b.l)}</td>` : ''),
                (show.c ? `<td>${sum(r => r.b.c)}</td>` : ''),
                (show.i ? `<td>${sum(r => r.b.i)}</td>` : ''),

                `<td>${stats.totals.tLP}</td>`,
                `<td class="thal">${stats.totals.tLT}</td>`,
                (show.g ? `<td>${sum(r => r.l.g)}</td>` : ''),
                (show.l ? `<td>${sum(r => r.l.l)}</td>` : ''),
                (show.c ? `<td>${sum(r => r.l.c)}</td>` : ''),
                (show.i ? `<td>${sum(r => r.l.i)}</td>` : ''),

                `<td>${stats.totals.tDP}</td>`,
                `<td class="thal">${stats.totals.tDT}</td>`,
                (show.g ? `<td>${sum(r => r.d.g)}</td>` : ''),
                (show.l ? `<td>${sum(r => r.d.l)}</td>` : ''),
                (show.c ? `<td>${sum(r => r.d.c)}</td>` : ''),
                (show.i ? `<td>${sum(r => r.d.i)}</td>` : '')
            ].join('');
            tf.innerHTML = `<tr>${row}</tr>`;

            $('pillThal').textContent = thal;
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
        (async function init() {
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

                const show = { g: $('showG').checked, l: $('showL').checked, c: $('showC').checked, i: $('showI').checked };

                const stats = computeByBuilding(dateStr, ranges, thal, incA, incC, incI);
                if (!stats) { alert('Check your start/end times; end must be after start for each meal.'); return; }

                buildHeader(show);
                renderBody(stats, show);
                renderFoot(stats, thal, show);

                const fmtR = ([s, e]) => `${pad(s.getHours())}:${pad(s.getMinutes())}–${pad(e.getHours())}:${pad(e.getMinutes())}`;
                $('pillDate').textContent = `${pad(stats.when.B[0].getDate())}/${pad(stats.when.B[0].getMonth() + 1)}/${stats.when.B[0].getFullYear()}`;
                $('pillB').textContent = fmtR(stats.when.B);
                $('pillL').textContent = fmtR(stats.when.L);
                $('pillD').textContent = fmtR(stats.when.D);

                $('status').textContent = `Computed from ${DB_CACHE.length} slips in ${DB_NAME}/${STORE}. Breakdown visible: `
                    + Object.entries(show).filter(([, v]) => v).map(([k]) => k.toUpperCase()).join(', ') || 'none';
            };

            [
                'statDate', 'timeBStart', 'timeBEnd', 'timeLStart', 'timeLEnd', 'timeDStart', 'timeDEnd',
                'thalSize', 'incAdults', 'incChildren', 'incInfants', 'showG', 'showL', 'showC', 'showI'
            ].forEach(id => $(id).addEventListener('input', run));

            $('btnRun').addEventListener('click', run);
            $('btnRefresh').addEventListener('click', async () => {
                try {
                    DB_CACHE = await getAllSlips();
                    $('status').textContent = `Loaded ${DB_CACHE.length} slips from ${DB_NAME}/${STORE}.`;
                    run();
                } catch (e) {
                    console.error(e);
                    $('status').textContent = e.message + ' Use the same origin where slips were saved (e.g., http://localhost:8000).';
                }
            });

            // initial read
            try {
                DB_CACHE = await getAllSlips();
                $('status').textContent = `Loaded ${DB_CACHE.length} slips from ${DB_NAME}/${STORE}.`;
            } catch (e) {
                console.error(e);
                $('status').textContent = e.message + ' Use the same origin where slips were saved (e.g., http://localhost:8000).';
            }

            run();
        })();

}
