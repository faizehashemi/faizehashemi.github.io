// Grid → Print: a small window asks PDF or Excel. PDF opens the grid in a tab of its own, A4 landscape, and prints it
// (choose "Save as PDF" in the print window); Excel downloads a styled .xlsx of the same grid.
// The grid is read from the matrix on the page (header row, then one row per floor), so both show what is on screen.

import { loadScript } from '../../core/lib.js';

const EXCELJS = 'https://cdn.jsdelivr.net/npm/exceljs@4.4.0/dist/exceljs.min.js';
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/** The matrix as rows of cells: { text, lines: [cap, meta], kind: 'head' | 'floor' | 'occ' | 'under' | 'vacant' | 'none', off } */
function readMatrix(mx) {
    const kids = [...mx.children];
    const n = mx.querySelectorAll('.hcell').length; // the corner and the column headings
    if (!n) return [];
    const rows = [];
    for (let i = 0; i < kids.length; i += n) {
        rows.push(kids.slice(i, i + n).map(el => {
            if (el.classList.contains('hcell')) return { kind: 'head', lines: [el.textContent.trim()] };
            if (el.classList.contains('rcell')) return { kind: 'floor', lines: [el.textContent.trim()] };
            const cap = el.querySelector('.cap')?.textContent.trim() || '', meta = el.querySelector('.meta')?.textContent.replace(/\s+/g, ' ').trim() || '';
            const kind = cap === '—' ? 'none' : el.classList.contains('under') ? 'under' : el.classList.contains('occ') ? 'occ' : 'vacant';
            return { kind, lines: [cap, meta].filter(x => x && x !== ' '), off: el.classList.contains('off-list') };
        }));
    }
    return rows;
}

function asPdf(rows, title) {
    const w = window.open('', '_blank');
    if (!w) { alert('The browser blocked the new tab. Allow pop-ups for this site, then press Print again.'); return; }
    const body = rows.map((r, i) => `<tr>${r.map(c => {
        const tag = i === 0 || c.kind === 'floor' ? 'th' : 'td';
        return `<${tag} class="${c.kind}${c.off ? ' off' : ''}">${c.lines.map((l, k) => k ? `<small>${esc(l)}</small>` : `<b>${esc(l)}</b>`).join('')}</${tag}>`;
    }).join('')}</tr>`).join('');
    w.document.open();
    w.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>${esc(title)}</title><style>
        @page { size: A4 landscape; margin: 8mm; }
        body { font: 10px/1.25 Arial, Helvetica, sans-serif; color: #000; margin: 0; }
        h1 { font-size: 15px; margin: 0 0 6px; }
        table { border-collapse: collapse; width: 100%; table-layout: fixed; }
        th, td { border: 1px solid #555; padding: 2px 3px; text-align: center; vertical-align: middle; overflow-wrap: anywhere; }
        th { background: #f1e3c0; font-size: 10.5px; }
        td b, th b { display: block; } td small { display: block; font-size: 8.5px; color: #333; }
        td.occ { background: #f3dd9a; } td.under { background: #ffe9a8; } td.vacant { background: #fff; } td.none { background: #eee; color: #999; }
        td.off { outline: 1.5px dashed #c0392b; outline-offset: -2px; }
        tr { break-inside: avoid; } * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        .legend { margin-top: 6px; font-size: 9px; color: #333; }
    </style></head><body><h1>${esc(title)}</h1><table>${body}</table>
    <p class="legend">Beds in use / beds · yellow = occupied, light yellow = beds still free, white = vacant, dashed = room in use but not active in Rooms &amp; Buildings.</p>
    <script>window.addEventListener('load', function () { setTimeout(function () { window.focus(); window.print(); }, 250); });<\/script></body></html>`);
    w.document.close();
}

async function asExcel(rows, title, file) {
    await loadScript(EXCELJS);
    const wb = new window.ExcelJS.Workbook();
    const ws = wb.addWorksheet('Grid', { pageSetup: { orientation: 'landscape', paperSize: 9, fitToPage: true, fitToWidth: 1, fitToHeight: 0 } });
    const cols = rows[0]?.length || 1;
    ws.mergeCells(1, 1, 1, cols);
    ws.getCell(1, 1).value = title;
    ws.getCell(1, 1).font = { bold: true, size: 14 };
    const thin = { style: 'thin', color: { argb: 'FF555555' } };
    const fill = { head: 'FFF1E3C0', floor: 'FFF1E3C0', occ: 'FFF3DD9A', under: 'FFFFE9A8', vacant: 'FFFFFFFF', none: 'FFEEEEEE' };
    rows.forEach((r, i) => {
        const row = ws.getRow(i + 2);
        r.forEach((c, k) => {
            const cell = row.getCell(k + 1);
            cell.value = c.lines.join('\n');
            cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
            cell.border = { top: thin, left: thin, bottom: thin, right: thin };
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: fill[c.kind] || 'FFFFFFFF' } };
            cell.font = { bold: c.kind === 'head' || c.kind === 'floor', size: 9, color: { argb: c.kind === 'none' ? 'FF999999' : 'FF000000' } };
        });
        row.height = i ? 42 : 22;
    });
    ws.getColumn(1).width = 12;
    for (let k = 2; k <= cols; k++) ws.getColumn(k).width = 15;
    ws.views = [{ state: 'frozen', xSplit: 1, ySplit: 2 }];
    const buf = await wb.xlsx.writeBuffer();
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }));
    a.download = file;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}

/** Ask PDF or Excel, then make it. */
export function printGrid(mx, { building, date, time, site }) {
    const rows = readMatrix(mx);
    if (!rows.length) { alert('Open a building first.'); return; }
    const title = `${building} · rooms at ${date} ${time}${site ? ` · ${site}` : ''}`;
    document.getElementById('gridPrintDlg')?.remove();
    const dlg = document.createElement('dialog');
    dlg.id = 'gridPrintDlg';
    dlg.innerHTML = `<style>
        #gridPrintDlg { border: 0; border-radius: 16px; padding: 18px 20px; width: min(92vw, 380px); box-shadow: 0 24px 60px rgba(0,0,0,.3); font: 14px/1.45 system-ui, sans-serif; color: #2b1e15; }
        #gridPrintDlg::backdrop { background: rgba(43, 30, 21, .4); }
        #gridPrintDlg h2 { margin: 0 0 4px; font-size: 17px; color: #9a7414; }
        #gridPrintDlg p { margin: 0 0 14px; color: #6b5e4a; font-size: 13px; }
        #gridPrintDlg .gp { display: grid; gap: 8px; }
        #gridPrintDlg button { font: inherit; font-weight: 800; padding: 10px 14px; border-radius: 12px; border: 1px solid #b8931f; background: #fff; color: #7a5410; cursor: pointer; text-align: left; }
        #gridPrintDlg button.main { background: linear-gradient(#e6c65a, #d4af37); color: #3b2a06; }
        #gridPrintDlg button small { display: block; font-weight: 500; color: #6b5e4a; }
        #gridPrintDlg .x { text-align: center; border-color: #ddd; color: #6b5e4a; }
      </style>
      <h2>Print the grid</h2><p>${esc(title)}</p>
      <div class="gp">
        <button type="button" class="main" data-fmt="pdf">📄 PDF<small>Opens in a new tab, A4 landscape — choose “Save as PDF” or a printer</small></button>
        <button type="button" data-fmt="xlsx">📊 Excel<small>Downloads the grid as an .xlsx file</small></button>
        <button type="button" class="x" data-fmt="">Cancel</button>
      </div>`;
    document.body.appendChild(dlg);
    dlg.addEventListener('click', async (e) => {
        const b = e.target.closest('[data-fmt]');
        if (!b) return;
        dlg.close();
        const safe = `${building} ${date} ${time.replace(':', '')}`.replace(/[\\/:*?"<>|]+/g, '-');
        if (b.dataset.fmt === 'pdf') asPdf(rows, title);
        else if (b.dataset.fmt === 'xlsx') { try { await asExcel(rows, title, `Grid ${safe}.xlsx`); } catch (err) { alert(err.message || 'Could not make the Excel file.'); } }
    });
    dlg.addEventListener('close', () => dlg.remove());
    dlg.showModal();
}
