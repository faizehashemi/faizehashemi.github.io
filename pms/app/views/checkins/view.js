// Ported from pms/checkins_checkouts.html. The page had three stacked scripts (one a no-op, two
// patching each other through window.run); this is the behaviour they produced, as one module:
// default window today 03:00 → tomorrow 03:00, "Date to" follows "Date from" unless edited,
// presets span 03:00 → 03:00 of the following day, and an empty/reversed range becomes 24h.

import { printSlips, openGlCopies } from '../../core/slip-print.js';
import { canOpen } from '../../core/cloud.js';

export default async function mount(ctx) {
    const { db } = ctx;

    /* ===== Data (this site) ===== */
    const getAllRecords = () => db.all();

    /* ===== Helpers ===== */
    function $(id) { return document.getElementById(id) }
    function pad(n) { return String(n).padStart(2, '0') }
    function num(v) { const x = Number(v); return Number.isFinite(x) ? x : 0; }
    function parseDT(d, t) { if (!d) return null; const tt = t && t.length ? t : '00:00'; const v = new Date(`${d}T${tt}`); return isNaN(v) ? null : v; }
    function ymd(d) { return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` }
    function plusOneDay(yyyy_mm_dd) {
        if (!yyyy_mm_dd) return '';
        const [y, m, d] = yyyy_mm_dd.split('-').map(Number);
        const dt = new Date(y, (m || 1) - 1, d || 1); // local midnight
        dt.setDate(dt.getDate() + 1);
        return ymd(dt);
    }
    function roomsFromSlip(r) { const bag = []; (r.rooms?.gents || []).forEach(x => bag.push(String(x.room_no || '').trim())); (r.rooms?.ladies || []).forEach(x => bag.push(String(x.room_no || '').trim())); return Array.from(new Set(bag.filter(Boolean))); }
    function guests(r) { const tot = num(r.total); if (tot) return tot; const kids = num(r.children ?? r.child); const inf = num(r.infants ?? r.infant); return num(r.gents) + num(r.ladies) + kids + inf; }
    function fmtDT(dt) { if (!dt) return ''; try { return dt.toLocaleString([], { year: '2-digit', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' }) } catch (e) { return dt.toISOString().slice(0, 16).replace('T', ' ') } }
    function within(dt, start, end) { return dt && dt >= start && dt <= end; }
    function escapeHTML(s) { return String(s).replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m])) }

    // Assigned guests: explicit numeric field -> per-room sum -> headcount total
    function assignedCount(r) {
        const direct = r.assigned ?? r.assigned_count ?? r.assignedGuests ?? r.assignedRoomsCount;
        const directNum = Number(direct);
        if (Number.isFinite(directNum) && directNum >= 0) return directNum;
        if (r.rooms && (Array.isArray(r.rooms.gents) || Array.isArray(r.rooms.ladies))) {
            const sumAssigned = (arr) => (Array.isArray(arr) ? arr.reduce((s, x) => s + (Number(x?.assigned) || 0), 0) : 0);
            return sumAssigned(r.rooms.gents) + sumAssigned(r.rooms.ladies);
        }
        const kids = num(r.children ?? r.child);
        const inf = num(r.infants ?? r.infant);
        return num(r.total) || (num(r.gents) + num(r.ladies) + kids + inf);
    }

    let CACHE = [];

    // Cross-links follow the login's page access (Setup → Page access): no Slip page → no Open column,
    // no Print slips page → no Print slips / GL copy buttons.
    const may = { slip: canOpen('slip'), print: canOpen('print') };
    function applyAccess() {
        may.slip = canOpen('slip'); may.print = canOpen('print');
        ['slipsIn', 'slipsOut', 'glIn', 'glOut'].forEach(id => { $(id).hidden = !may.print; });
        ['tblIn', 'tblOut'].forEach(id => $(id).classList.toggle('no-open', !may.slip));
    }
    let SHOWN = { in: [], out: [] }; // the rows in each table, in table order (Print slips / GL copy)

    /* ===== Date range wiring ===== */
    let userEditedDateTo = false;
    let lastAutoTo = ''; // last automatically set dateTo, to avoid fighting the user

    // A same-time or reversed range (e.g. 03:00 → 03:00) means "the 24h from start"
    function ensureDateRange() {
        const df = $('dateFrom').value;
        if (!$('dateTo').value && df) {
            $('dateTo').value = plusOneDay(df);
            lastAutoTo = $('dateTo').value;
            userEditedDateTo = false;
        }
        const tf = $('timeFrom').value || '03:00';
        const tt = $('timeTo').value || '03:00';
        const start = df ? new Date(`${df}T${tf}`) : null;
        const dt = $('dateTo').value;
        let end = dt ? new Date(`${dt}T${tt}`) : null;
        if (start && end && !(end > start)) {
            end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
            $('dateTo').value = ymd(end);
            $('timeTo').value = pad(end.getHours()) + ':' + pad(end.getMinutes());
            lastAutoTo = $('dateTo').value;
            userEditedDateTo = false;
        }
        return { start, end };
    }

    function setRange(df, dt) {
        $('dateFrom').value = df;
        $('dateTo').value = dt;
        $('timeFrom').value = '03:00';
        $('timeTo').value = '03:00';
        lastAutoTo = dt; userEditedDateTo = false;
        run();
    }

    /* ===== Render ===== */
    function run() {
        ensureDateRange();
        const df = $('dateFrom').value, dt = $('dateTo').value;
        const tf = $('timeFrom').value || '00:00', tt = $('timeTo').value || '23:59';
        if (!df || !dt) { alert('Pick both Date from and Date to.'); return; }
        const start = new Date(`${df}T${tf}`);
        let end = new Date(`${dt}T${tt}`);
        if (!(end > start)) end = new Date(start.getTime() + 24 * 60 * 60 * 1000);

        const mode = $('mode').value;
        const ins = [], outs = [];
        for (const r of CACHE) {
            const ci = parseDT(r.checkin_date, r.checkin_time);
            const co = parseDT(r.checkout_date, r.checkout_time);
            if (ci && within(ci, start, end)) ins.push(r);
            if (co && within(co, start, end)) outs.push(r);
        }
        ins.sort((a, b) => parseDT(a.checkin_date, a.checkin_time) - parseDT(b.checkin_date, b.checkin_time));
        outs.sort((a, b) => parseDT(a.checkout_date, a.checkout_time) - parseDT(b.checkout_date, b.checkout_time));

        SHOWN = { in: ins, out: outs };
        renderTable('In', ins, 'checkin');
        renderTable('Out', outs, 'checkout');

        $('panelIn').hidden = !(mode === 'in' || mode === 'both');
        $('panelOut').hidden = !(mode === 'out' || mode === 'both');

        $('sumIn').textContent = `${ins.length} slips • ${ins.reduce((s, r) => s + guests(r), 0)} guests`;
        $('sumOut').textContent = `${outs.length} slips • ${outs.reduce((s, r) => s + guests(r), 0)} guests`;
        $('status').textContent = `Range ${df} ${tf} → ${dt} ${tt} • ${CACHE.length} slip(s) in DB`;
    }

    function renderTable(kind, rows, key) {
        const tbody = $(`tbl${kind}`).querySelector('tbody');
        tbody.innerHTML = '';
        for (const r of rows) {
            const ci = parseDT(r.checkin_date, r.checkin_time);
            const co = parseDT(r.checkout_date, r.checkout_time);
            const t = key === 'checkin' ? fmtDT(ci) : fmtDT(co);
            const sh = String(r.sh_no || '').trim();
            const href = sh ? ctx.href('slip', { sh_no: sh }) : ctx.href('slip');
            const gl = String(r.group_leader ?? '').trim() || '-';
            const openCell = !may.slip ? ''
                : sh ? `<a class="btn-open" href="${href}" target="_blank" rel="noopener">Open</a>`
                : `<a class="btn-open" aria-disabled="true" title="No SH number">Open</a>`;

            const tr = document.createElement('tr');
            tr.innerHTML = `
      <td class="nowrap">${t}</td>
      <td>${escapeHTML(r.sh_no || '')}</td>
      <td>${escapeHTML(r.tour_name || '')}</td>
      <td>${escapeHTML(gl)}</td>
      <td>${escapeHTML((r.building || '').trim())}</td>
      <td>${escapeHTML(roomsFromSlip(r).join(', '))}</td>
      <td>${assignedCount(r)}</td>
      <td>${guests(r)}</td>
      <td>${num(r.gents)}</td>
      <td>${num(r.ladies)}</td>
      <td>${num(r.children ?? r.child)}</td>
      <td>${num(r.infants ?? r.infant)}</td>
      <td class="nowrap">${key === 'checkin' ? fmtDT(co) : fmtDT(ci)}</td>
      <td class="nowrap">${openCell}</td>
    `;
            tbody.appendChild(tr);
        }
    }

    /* ===== CSV export ===== */
    function toCSV(rows, kind) {
        const head = kind === 'in'
            ? ['Check-in', 'SH No', 'Group', 'Group Leader', 'Building', 'Rooms', 'As.', 'T', 'G', 'L', 'C', 'I', 'Check-out']
            : ['Check-out', 'SH No', 'Group', 'Group Leader', 'Building', 'Rooms', 'As.', 'T', 'G', 'L', 'C', 'I', 'Check-in'];
        const esc = v => `"${String(v ?? '').replace(/"/g, '""')}"`;
        const lines = [head.join(',')];
        for (const r of rows) {
            const ci = parseDT(r.checkin_date, r.checkin_time);
            const co = parseDT(r.checkout_date, r.checkout_time);
            const gl = String(r.group_leader ?? '').trim() || '-';
            const mid = [r.sh_no || '', r.tour_name || '', gl, (r.building || '').trim(),
                roomsFromSlip(r).join(' '), assignedCount(r), guests(r),
                num(r.gents), num(r.ladies), num(r.children ?? r.child), num(r.infants ?? r.infant)];
            const row = kind === 'in' ? [fmtDT(ci), ...mid, fmtDT(co)] : [fmtDT(co), ...mid, fmtDT(ci)];
            lines.push(row.map(esc).join(','));
        }
        return lines.join('\r\n');
    }

    function downloadCSV(text, filename) {
        const blob = new Blob([text], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = filename;
        document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
    }

    function exportRows(kind) {
        const df = $('dateFrom').value, dt = $('dateTo').value, tf = $('timeFrom').value || '00:00', tt = $('timeTo').value || '23:59';
        const start = new Date(`${df}T${tf}`), end = new Date(`${dt}T${tt}`);
        const pick = kind === 'in' ? r => parseDT(r.checkin_date, r.checkin_time) : r => parseDT(r.checkout_date, r.checkout_time);
        const rows = CACHE.filter(r => { const d = pick(r); return d && d >= start && d <= end; }).sort((a, b) => pick(a) - pick(b));
        downloadCSV(toCSV(rows, kind), `${kind === 'in' ? 'checkins' : 'checkouts'}_${df}_${dt}.csv`);
    }

    // Print table: the rows shown, in a tab of their own laid out for A4 landscape with 1 cm margins —
    // SH · Group (group leader beneath) · Building · Rooms (wraps) · Total Pax · Check-in · Check-out, all centred.
    // The page on screen keeps its own columns. Call straight from the click so the browser allows the tab.
    function printTable(kind) {
        const rows = kind === 'in' ? SHOWN.in : SHOWN.out;
        if (!rows.length) { alert('No rows to print in this table.'); return; }
        const w = window.open('', '_blank');
        if (!w) { alert('The browser blocked the new tab. Allow pop-ups for this site, then press Print table again.'); return; }
        const title = `${kind === 'in' ? 'Check-ins' : 'Check-outs'} · ${ctx.site.label}`;
        const total = rows.reduce((s, r) => s + guests(r), 0);
        const body = rows.map(r => {
            const ci = parseDT(r.checkin_date, r.checkin_time), co = parseDT(r.checkout_date, r.checkout_time);
            return `<tr>
              <td>${escapeHTML(r.sh_no ?? '')}</td>
              <td><b>${escapeHTML(r.tour_name || '-')}</b><br><span class="gl">${escapeHTML(String(r.group_leader ?? '').trim() || '-')}</span></td>
              <td>${escapeHTML((r.building || '').trim() || '-')}</td>
              <td class="rooms">${escapeHTML(roomsFromSlip(r).join(', ') || '-')}</td>
              <td><b>${guests(r)}</b></td>
              <td>${escapeHTML(fmtDT(ci))}</td>
              <td>${escapeHTML(fmtDT(co))}</td>
            </tr>`;
        }).join('');
        w.document.open();
        w.document.write(`<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><title>${escapeHTML(title)}</title>
<style>
@page { size: A4 landscape; margin: 10mm; }
html, body { margin: 0; background: #fff; color: #000; font: 11px/1.3 Arial, Helvetica, sans-serif; }
body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
h1 { font-size: 15px; margin: 0 0 2px; text-align: center; }
.sub { text-align: center; font-size: 11px; margin: 0 0 6px; }
table { width: 100%; border-collapse: collapse; table-layout: fixed; }
th, td { border: 1px solid #000; padding: 3px 4px; text-align: center; vertical-align: middle; overflow-wrap: anywhere; }
th { background: #eee; font-size: 11px; }
thead { display: table-header-group; }
tr { break-inside: avoid; page-break-inside: avoid; }
td .gl { font-size: 10px; }
td.rooms { font-size: 10px; }
.bar { position: sticky; top: 0; display: flex; gap: 10px; align-items: center; padding: 8px 12px; background: #fffaf1; border-bottom: 1px solid #dcc7a4; font: 13px system-ui, sans-serif; }
.bar button { font: inherit; padding: 5px 14px; border: 1px solid #d4af37; border-radius: 8px; background: #d4af37; color: #fff; font-weight: 700; cursor: pointer; }
@media screen { body { background: #e9e6df; } .page { width: 277mm; margin: 10mm auto; padding: 10mm; background: #fff; box-shadow: 0 4px 16px rgba(0,0,0,.15); } }
@media print { .bar { display: none; } }
</style></head>
<body>
<div class="bar"><button type="button" onclick="window.print()">Print</button><span>A4 landscape · 1 cm margins — choose A4 and Landscape if the printer asks</span></div>
<div class="page">
<h1>${escapeHTML(title)}</h1>
<p class="sub">${escapeHTML(rangeLabel())} · ${rows.length} group${rows.length === 1 ? '' : 's'} · ${total} pax</p>
<table>
<colgroup><col style="width:8%"><col style="width:25%"><col style="width:10%"><col style="width:25%"><col style="width:8%"><col style="width:12%"><col style="width:12%"></colgroup>
<thead><tr><th>SH No</th><th>Group / Group Leader</th><th>Building</th><th>Rooms</th><th>Total Pax</th><th>Check-in</th><th>Check-out</th></tr></thead>
<tbody>${body}</tbody>
</table>
</div>
<script>
window.addEventListener('load', function () { setTimeout(function () { window.focus(); window.print(); }, 250); });
</script>
</body></html>`);
        w.document.close();
    }

    /* ===== Wiring ===== */
    $('dateFrom').addEventListener('input', () => {
        const df = $('dateFrom').value;
        if (!df) return;
        if (!userEditedDateTo || $('dateTo').value === lastAutoTo) {
            const next = plusOneDay(df);
            $('dateTo').value = next;
            lastAutoTo = next;
            userEditedDateTo = false;
        }
    });
    $('dateTo').addEventListener('input', () => { userEditedDateTo = true; });

    $('presetToday').addEventListener('click', () => { const df = ymd(new Date()); setRange(df, plusOneDay(df)); });
    $('presetYesterday').addEventListener('click', () => { const d = new Date(); d.setDate(d.getDate() - 1); const df = ymd(d); setRange(df, plusOneDay(df)); });
    $('preset7').addEventListener('click', () => { const end = new Date(); const start = new Date(); start.setDate(end.getDate() - 6); setRange(ymd(start), plusOneDay(ymd(end))); });
    $('preset30').addEventListener('click', () => { const end = new Date(); const start = new Date(); start.setDate(end.getDate() - 29); setRange(ymd(start), plusOneDay(ymd(end))); });

    $('btnRefresh').addEventListener('click', refresh);
    $('btnRun').addEventListener('click', run);
    $('csvIn').addEventListener('click', () => exportRows('in'));
    $('csvOut').addEventListener('click', () => exportRows('out'));
    $('printIn').addEventListener('click', () => printTable('in'));
    $('printOut').addEventListener('click', () => printTable('out'));
    const rangeLabel = () => `${$('dateFrom').value} ${$('timeFrom').value} → ${$('dateTo').value} ${$('timeTo').value}`;
    // the admin changed this login's pages while the page is open
    window.addEventListener('pms:desk-changed', () => { applyAccess(); run(); });
    applyAccess();
    $('slipsIn').addEventListener('click', () => may.print && printSlips(SHOWN.in, { title: `check-ins ${rangeLabel()}` }));
    $('slipsOut').addEventListener('click', () => may.print && printSlips(SHOWN.out, { title: `check-outs ${rangeLabel()}` }));
    $('glIn').addEventListener('click', () => may.print && openGlCopies(SHOWN.in, { title: `check-ins ${rangeLabel()}`, host: ctx.root }));
    $('glOut').addEventListener('click', () => may.print && openGlCopies(SHOWN.out, { title: `check-outs ${rangeLabel()}`, host: ctx.root }));

    /* ===== Boot ===== */
    async function refresh() {
        try {
            CACHE = await getAllRecords();
            const today = ymd(new Date());
            setRange(today, plusOneDay(today));
        } catch (e) {
            console.error(e);
            $('status').textContent = 'Could not load slips: ' + (e.message || e);
        }
    }

    await refresh();
}
