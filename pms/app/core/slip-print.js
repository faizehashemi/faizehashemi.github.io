// The accommodation slip as printed (Print slips page) — one source for every page that shows slips:
//   slipHTML(rec, rows)       one copy of the slip (same markup the Print page always used)
//   printSlips(recs)          print A5 landscape, two copies per page, one page per slip
//   openGlCopies(recs, opts)  a window with each slip as an A5 card in its building colour, to snip
//                             or copy as an image for the group leader
// The Print page keeps its own stylesheet; other pages get SLIP_CSS (scoped to .pms-slips).

import { loadScript } from './lib.js';

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
function ymdToDMY(ymd) { if (!ymd) return ''; const [y, m, d] = ymd.split('-'); return `${d}/${m}/${y}`; }
function hhmmToHMS(hhmm) { if (!hhmm) return ''; const [h, m] = hhmm.split(':'); return `${h}:${m}:00`; }

// GL copy colour per building
export function themeForBuilding(rec) {
    const src = String(rec.building || '').toUpperCase();
    if (src.includes('MOHAMMEDI')) return 'theme-mohammedi';
    if (src.includes('MUFADDAL')) return 'theme-mufaddal';
    if (src.includes('SNOOD')) return 'theme-snood';
    if (src.includes('BAHA')) return 'theme-baha';
    return 'theme-snood'; // default: black
}

// SNOOD rooms that share an entrance (x02+x03, x08+x09, x12+x13, x18+x19)
export function findCombinedRooms(rec, rows) {
    const pairs = [['2', '3'], ['8', '9'], ['12', '13'], ['18', '19']];
    const g = (rec.rooms?.gents || []).slice(0, rows);
    const l = (rec.rooms?.ladies || []).slice(0, rows);
    const rooms = new Set([...g, ...l].map(r => String(r?.room_no || '').trim()).filter(Boolean));
    const combos = new Set();
    for (const room of rooms) {
        if (!/^\d+$/.test(room)) continue;
        for (const [a, b] of pairs) {
            for (const [s1, s2] of [[a, b], [b, a]]) {
                if (room.endsWith(s1)) {
                    const prefix = room.slice(0, room.length - s1.length);
                    if (rooms.has(prefix + s2)) combos.add(`${prefix + a} & ${prefix + b}`);
                }
            }
        }
    }
    return Array.from(combos).sort((x, y) => x.localeCompare(y, undefined, { numeric: true }));
}

/** Room rows a slip needs so that none is cut off (at least `min`). */
export const rowsFor = (rec, min = 8) => Math.max(min, (rec.rooms?.gents || []).length, (rec.rooms?.ladies || []).length);

/** One copy of the slip. */
export function slipHTML(rec, rows) {
    const gents = (rec.rooms?.gents || []).slice(0, rows);
    const ladies = (rec.rooms?.ladies || []).slice(0, rows);
    const fillRows = (arr) => {
        const out = [];
        for (let i = 0; i < rows; i++) {
            const r = arr[i];
            const room = r && r.room_no ? r.room_no : '-';
            const beds = r && (r.assigned !== '' && r.assigned != null) ? r.assigned
                : (r && (r.capacity !== '' && r.capacity != null) ? r.capacity : 0);
            out.push(`<tr><td>${esc(room)}</td><td>${esc(beds)}</td></tr>`);
        }
        return out.join('');
    };
    let noteHTML = '';
    if (String(rec.building || '').toUpperCase().includes('SNOOD')) {
        const combos = findCombinedRooms(rec, rows);
        if (combos.length) noteHTML = `<div class="gl-note">Please note: these rooms have combined entrance: ${esc(combos.join(', '))}</div>`;
    }
    return `
  <div class="slip" data-rec-id="${esc(rec.id)}">
    <div class="title">ACCOMODATION DETAILS</div>
    <table class="grid pair">
      <tbody>
        <tr><th>TOUR NAME</th><td colspan="3">${esc(rec.tour_name)}</td></tr>
        <tr><th>GRP LEADER</th><td colspan="3">${esc(rec.group_leader)}</td></tr>
        <tr><th>CHECK IN</th><td>${ymdToDMY(rec.checkin_date || '')}</td><td>${hhmmToHMS(rec.checkin_time || '')}</td><td></td></tr>
        <tr><th>CHECK OUT</th><td>${ymdToDMY(rec.checkout_date || '')}</td><td>${hhmmToHMS(rec.checkout_time || '')}</td><td></td></tr>
        <tr><th>BUILDING</th><td colspan="3">${esc(rec.building)}</td></tr>
        <tr><th>SH NO.</th><td>${esc(rec.sh_no)}</td><th>TOTAL</th><td>${esc(rec.total)}</td></tr>
        <tr><th>GENTS</th><td>${esc(rec.gents)}</td><th>LADIES</th><td>${esc(rec.ladies)}</td></tr>
        <tr><th>CHILDREN</th><td>${esc(rec.children)}</td><th>INFANTS</th><td>${esc(rec.infants)}</td></tr>
      </tbody>
    </table>
    <div class="subtables">
      <table class="mini"><caption>GENTS</caption><thead><tr><th>Room No</th><th>Assigned Beds</th></tr></thead><tbody>${fillRows(gents)}</tbody></table>
      <table class="mini"><caption>LADIES</caption><thead><tr><th>Room No</th><th>Assigned Beds</th></tr></thead><tbody>${fillRows(ladies)}</tbody></table>
    </div>
    ${noteHTML}
  </div>`;
}

/* ------------------------------ shared styles ------------------------------ */

export const SLIP_CSS = `
.pms-slips { --ink:#111; --border:#111; font-family: Arial, Helvetica, sans-serif; color: var(--ink); }
.pms-slips .sheet { display: flex; gap: 6mm; }
.pms-slips .slip { flex: 1 1 0; border: 1px solid var(--border); padding: 2mm; color: var(--ink); background: #fff; }
.pms-slips .title { text-align: center; font-weight: 700; font-size: 14px; letter-spacing: .3px; border-bottom: 1px solid var(--border);
  padding: 1mm 0 1.5mm; margin-bottom: 1.5mm; text-transform: uppercase; color: var(--ink); }
.pms-slips table.grid, .pms-slips .mini { width: 100%; border-collapse: collapse; color: var(--ink); background: #fff; }
/* host pages may style .grid / th themselves (e.g. Check-ins lays out with .grid) */
.pms-slips table.grid { display: table; margin: 0; gap: 0; }
.pms-slips th, .pms-slips td { box-shadow: none; }
.pms-slips table.grid th, .pms-slips table.grid td, .pms-slips .mini th, .pms-slips .mini td {
  border: 1px solid var(--border); padding: 1.2mm 1.6mm; font-size: 11px; vertical-align: middle; text-align: center !important; color: var(--ink); background: #fff; }
.pms-slips table.grid th { font-weight: 700; white-space: nowrap; }
.pms-slips .pair th { width: 28%; }
.pms-slips .subtables { display: grid; grid-template-columns: 1fr 1fr; gap: 2mm; margin-top: 2mm; }
.pms-slips .mini caption { caption-side: top; text-align: left; font-weight: 700; font-size: 11px; margin-bottom: 1mm; color: var(--ink); }
.pms-slips .gl-note { display: none; font-size: 10px; margin-top: 4px; color: var(--ink); }
.pms-slips.gl .gl-note { display: block; }
.pms-slips.gl .theme-mohammedi { --ink:#d35400; --border:#d35400; }
.pms-slips.gl .theme-mufaddal { --ink:#e91e63; --border:#e91e63; }
.pms-slips.gl .theme-snood { --ink:#000; --border:#000; }
.pms-slips.gl .theme-baha { --ink:#2ecc71; --border:#2ecc71; }
`;

// A <style> in <head>; the router removes it when the page is left, so check each time
function ensureCss() {
    if (document.getElementById('pms-slip-css')) return;
    const st = document.createElement('style');
    st.id = 'pms-slip-css';
    st.textContent = SLIP_CSS + GL_CSS;
    document.head.appendChild(st);
}

/* --------------------------------- printing --------------------------------- */

/**
 * Print the slips: A5 landscape, two copies side by side, one page per slip (like the Print page).
 * They open in a tab of their own that holds nothing but the slips (no page background, menus or page
 * styles to leak into the print); that tab opens the print dialog itself. Call it straight from the
 * click, so the browser allows the new tab.
 */
export function printSlips(recs, opts = {}) {
    if (!recs.length) { alert('No slips to print in this table.'); return; }
    const w = window.open('', '_blank');
    if (!w) { alert('The browser blocked the new tab. Allow pop-ups for this site, then press Print slips again.'); return; }
    const title = `Slips${opts.title ? ' — ' + opts.title : ''}`;
    const sheets = recs.map(rec => { const rows = rowsFor(rec); return `<div class="sheet">${slipHTML(rec, rows)}${slipHTML(rec, rows)}</div>`; }).join('');
    w.document.open();
    w.document.write(`<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><title>${esc(title)}</title>
<style>
${SLIP_CSS}
@page { size: A5 landscape; margin: 6mm; }
* { box-sizing: border-box; }
html, body { margin: 0; background: #fff; }
body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
.sheet { break-inside: avoid; page-break-inside: avoid; }
.sheet + .sheet { break-before: page; page-break-before: always; }
.bar { position: sticky; top: 0; display: flex; gap: 10px; align-items: center; padding: 10px 16px; background: #fffaf1;
  border-bottom: 1px solid #dcc7a4; font: 14px system-ui, sans-serif; color: #2b1e15; z-index: 1; }
.bar button { font: inherit; padding: 6px 14px; border: 1px solid #d4af37; border-radius: 8px; background: #d4af37; color: #fff; font-weight: 700; cursor: pointer; }
.bar span { color: #6b5e4a; font-size: 12px; }
@media screen {
  body { background: #e9e6df; }
  /* each page as it will print: A5 landscape */
  .sheet { width: 210mm; min-height: 148mm; padding: 6mm; margin: 10mm auto; background: #fff; box-shadow: 0 4px 16px rgba(0,0,0,.15); }
}
@media print { .bar { display: none; } }
</style></head>
<body class="pms-slips">
<div class="bar"><button type="button" onclick="window.print()">Print</button>
<span>${recs.length} slip${recs.length === 1 ? '' : 's'} · A5 landscape, two copies per page · choose paper size A5 and orientation Landscape if the printer asks</span></div>
${sheets}
<script>
window.addEventListener('load', function () {
  var go = function () { window.focus(); window.print(); };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { setTimeout(go, 200); }); else setTimeout(go, 300);
});
</script>
</body></html>`);
    w.document.close();
}

/* --------------------------------- GL copies --------------------------------- */

const GL_CSS = `
dialog.gl-dlg { width: min(1180px, 96vw); height: 92vh; max-width: none; max-height: none; padding: 0; border: 0; border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0,0,0,.35); background: #efe9dc; font: 14px/1.4 system-ui, -apple-system, "Segoe UI", sans-serif; color: #1c2430; }
dialog.gl-dlg::backdrop { background: rgba(15, 23, 42, .55); }
.gl-dlg .gl-wrap { display: flex; flex-direction: column; height: 100%; }
.gl-dlg .gl-head { display: flex; align-items: center; gap: 12px; padding: 12px 16px; background: #fffaf1; border-bottom: 1px solid #dcc7a4; }
.gl-dlg .gl-head h2 { margin: 0; font-size: 17px; flex: 1; }
.gl-dlg .gl-head p { margin: 2px 0 0; font-size: 12px; color: #6b5e4a; }
.gl-dlg button { font: inherit; cursor: pointer; border: 1px solid #d4af37; background: #fffdf5; color: #7a5b13; border-radius: 8px; padding: 6px 12px; }
.gl-dlg button:hover { background: #fff6dd; }
.gl-dlg button:disabled { opacity: .5; cursor: progress; }
.gl-dlg .gl-list { flex: 1; overflow: auto; padding: 18px; display: flex; flex-wrap: wrap; gap: 22px; justify-content: center; align-content: flex-start; }
.gl-dlg .gl-item { display: grid; gap: 8px; justify-items: center; }
.gl-dlg .gl-bar { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; justify-content: center; font-size: 12px; }
.gl-dlg .gl-bar b { color: #2b1e15; }
.gl-dlg .gl-msg { font-size: 12px; min-height: 16px; color: #1f6f43; }
.gl-dlg .gl-msg.bad { color: #a12a2a; }
/* the card: A5 portrait, sized for a phone screen when sent as a picture */
.gl-dlg .gl-card { width: 148mm; min-height: 210mm; background: #fff; padding: 8mm; box-shadow: 0 6px 20px rgba(0,0,0,.18); display: flex; flex-direction: column; }
.gl-dlg .gl-card .slip { flex: 1; padding: 4mm; }
.gl-dlg .gl-card .title { font-size: 20px; padding: 2mm 0 3mm; margin-bottom: 3mm; }
.gl-dlg .gl-card table.grid th, .gl-dlg .gl-card table.grid td, .gl-dlg .gl-card .mini th, .gl-dlg .gl-card .mini td { font-size: 14px; padding: 2mm 2mm; }
.gl-dlg .gl-card .mini caption { font-size: 14px; margin-bottom: 1.5mm; }
.gl-dlg .gl-card .subtables { gap: 4mm; margin-top: 4mm; }
.gl-dlg .gl-card .gl-note { font-size: 13px; margin-top: 3mm; }
@media (max-width: 700px) {
  dialog.gl-dlg { width: 100vw; height: 100dvh; max-height: 100dvh; border-radius: 0; margin: 0; }
  .gl-dlg .gl-head { flex-wrap: wrap; }
  .gl-dlg .gl-list { padding: 10px; }
  .gl-dlg .gl-card { zoom: .62; }
}
@media print { dialog.gl-dlg { display: none; } }
`;

const HTML2CANVAS = 'https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js';

async function cardToCanvas(card) {
    await loadScript(HTML2CANVAS);
    // rendered at 2x so the picture stays sharp on a phone
    return window.html2canvas(card, { scale: 2, backgroundColor: '#ffffff', logging: false, useCORS: true });
}
const canvasBlob = (canvas, type, q) => new Promise((res, rej) => canvas.toBlob(b => b ? res(b) : rej(new Error('Could not make the picture.')), type, q));

/**
 * One A5 card per slip in its building colour, each with "Copy picture" (PNG to the clipboard, ready
 * to paste into WhatsApp) and "Save JPEG". Snipping Tool works on the cards as they are.
 * @param {object[]} recs  slips
 * @param {{title?: string, host?: Element}} opts
 */
export function openGlCopies(recs, opts = {}) {
    if (!recs.length) { alert('No slips in this table.'); return; }
    ensureCss();
    const dlg = document.createElement('dialog');
    dlg.className = 'gl-dlg';
    const canCopy = !!(navigator.clipboard && window.ClipboardItem);
    dlg.innerHTML = `
      <div class="gl-wrap">
        <header class="gl-head">
          <div style="flex:1"><h2>GL copy — ${esc(opts.title || '')} (${recs.length} slip${recs.length === 1 ? '' : 's'})</h2>
            <p>Each slip is an A5 card in its building colour. Snip it, or use <b>Copy picture</b> and paste it into the group leader's chat.</p></div>
          <button type="button" data-close>Close</button>
        </header>
        <div class="gl-list pms-slips gl">
          ${recs.map((rec, i) => `
            <div class="gl-item">
              <div class="gl-bar"><b>SH ${esc(rec.sh_no)}</b> · ${esc(rec.group_leader || rec.tour_name || '')}
                ${canCopy ? `<button type="button" data-copy="${i}">Copy picture</button>` : ''}
                <button type="button" data-jpeg="${i}">Save JPEG</button></div>
              <div class="gl-card" data-card="${i}">${slipHTML(rec, rowsFor(rec)).replace('class="slip"', `class="slip ${themeForBuilding(rec)}"`)}</div>
              <div class="gl-msg" data-msg="${i}"></div>
            </div>`).join('')}
        </div>
      </div>`;
    (opts.host || document.body).appendChild(dlg);
    const msg = (i, text, bad = false) => { const m = dlg.querySelector(`[data-msg="${i}"]`); m.textContent = text; m.className = `gl-msg${bad ? ' bad' : ''}`; };

    dlg.addEventListener('click', async (e) => {
        const b = e.target.closest('button');
        if (!b) return;
        if ('close' in b.dataset) { dlg.close(); return; }
        const i = b.dataset.copy ?? b.dataset.jpeg;
        if (i == null) return;
        const rec = recs[Number(i)];
        const card = dlg.querySelector(`[data-card="${i}"]`);
        b.disabled = true;
        msg(i, 'Making the picture…');
        try {
            // phones show the card smaller; the picture is always full A5
            const zoom = card.style.zoom; card.style.zoom = '1';
            const canvas = await cardToCanvas(card);
            card.style.zoom = zoom;
            if (b.dataset.copy != null) {
                // browsers put only PNG pictures on the clipboard; chat apps take it the same way
                await navigator.clipboard.write([new ClipboardItem({ 'image/png': canvasBlob(canvas, 'image/png') })]);
                msg(i, 'Copied — paste it into the chat (Ctrl+V).');
            } else {
                const blob = await canvasBlob(canvas, 'image/jpeg', 0.92);
                const a = document.createElement('a');
                a.href = URL.createObjectURL(blob);
                a.download = `GL-${String(rec.sh_no || rec.id)}.jpg`;
                a.click();
                setTimeout(() => URL.revokeObjectURL(a.href), 2000);
                msg(i, 'Saved as JPEG.');
            }
        } catch (err) {
            msg(i, `Could not ${b.dataset.copy != null ? "copy" : "save"}: ${String(err.message || err).replace(/\.+$/, "")}. Use Save JPEG or the Snipping Tool instead.`, true);
        } finally { b.disabled = false; }
    });
    dlg.addEventListener('close', () => dlg.remove());
    dlg.showModal();
    return dlg;
}
