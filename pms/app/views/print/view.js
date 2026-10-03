// Ported from pms/print_slip_a5.html. Page logic is kept as it was; storage goes through ctx.db (app/core/db.js).
import { slipHTML, glColors, glColor } from '../../core/slip-print.js';

export default async function mount(ctx) {
const { db } = ctx;

/* ===== Data (this site) ===== */
        const getAllRecords = () => db.all();

        /* ===== Helpers ===== */
        function $(id) { return document.getElementById(id) }
        let CACHE = []; let CURRENT = []; // array of selected records
        function ymdToDMY(ymd) { if (!ymd) return ''; const [y, m, d] = ymd.split('-'); return `${d}/${m}/${y}` }
        function hhmmToHMS(hhmm) { if (!hhmm) return ''; const [h, m] = hhmm.split(':'); return `${h}:${m}:00` }
        function parseShList(text) { if (!text) return []; return Array.from(new Set(text.split(/[,.\-\s\*]+/).map(s => s.trim()).filter(Boolean))) }

        // glColors / glColor (Setup → GL copy colours), slipHTML, findCombinedRooms: app/core/slip-print.js (shared with Check-ins)

        function renderSlips() {
            const area = $('sheet'); area.innerHTML = '';
            const rows = Math.max(4, Math.min(12, Number($('rows').value || 8)));
            const arr = Array.isArray(CURRENT) ? CURRENT : (CURRENT ? [CURRENT] : []);
            if (!arr.length) {
                area.insertAdjacentHTML('beforeend', `<div class="sheet" data-sh=""><div class="slip" data-rec-id=""><div class="title">ACCOMODATION DETAILS</div><div style="padding:4mm; font-size:11px;">No slip loaded.</div></div><div class="slip" data-rec-id=""><div class="title">ACCOMODATION DETAILS</div><div style="padding:4mm; font-size:11px;">No slip loaded.</div></div></div>`);
                return;
            }
            for (const rec of arr) {
                const block = document.createElement('div');
                block.className = 'sheet';
                block.setAttribute('data-sh', rec.sh_no ?? '');
                // two copies per sheet
                block.insertAdjacentHTML('beforeend', slipHTML(rec, rows));
                block.insertAdjacentHTML('beforeend', slipHTML(rec, rows));
                area.appendChild(block);
            }
        }

        /* Populate dropdown */
        async function refreshList() {
            CACHE = await getAllRecords(); const list = $('savedList'); list.innerHTML = '';
            if (!CACHE.length) { const opt = document.createElement('option'); opt.value = ''; opt.textContent = 'No slips found'; list.appendChild(opt); }
            else { const sorted = [...CACHE].sort((a, b) => (a.createdAt > b.createdAt ? -1 : 1)); for (const r of sorted) { const when = new Date(r.createdAt).toLocaleString(); const name = r.tour_name || '(unnamed tour)'; const sh = r.sh_no ?? ''; const o = document.createElement('option'); o.value = r.id; o.textContent = `#${r.id} — ${name}${sh !== '' ? ' — SH ' + sh : ''} — ${when}`; list.appendChild(o); } }
            $('status').textContent = `${CACHE.length} slip(s) in DB. Load or fetch to preview.`;
        }

        /* ===== GL Copy theming (per Building) ===== */
        let GL_MODE_ACTIVE = false;
        let GL_COLORS = {};
        glColors().then(c => { GL_COLORS = c; }); // Setup → GL copy colours

        function clearThemes() {
            $('printArea').classList.remove('gl-mode');
            document.querySelectorAll('.slip').forEach(el => {
                el.style.removeProperty('--ink');
                el.style.removeProperty('--border');
            });
        }

        function applyThemesForGL() {
            const area = $('printArea');
            area.classList.add('gl-mode');
            const all = document.querySelectorAll('.slip');
            for (const el of all) {
                const id = Number(el.getAttribute('data-rec-id') || '');
                const rec = CACHE.find(x => x.id === id) || CURRENT.find(x => x.id === id) || {};
                const c = glColor(rec, GL_COLORS);
                el.style.setProperty('--ink', c);
                el.style.setProperty('--border', c);
            }
        }

        // Extra-safe: if the browser fires beforeprint late, re-apply themes
        function beforePrint() { if (GL_MODE_ACTIVE) { applyThemesForGL(); } }
        function afterPrint() { clearThemes(); GL_MODE_ACTIVE = false; }
        if ('onbeforeprint' in window) window.addEventListener('beforeprint', beforePrint);
        if ('onafterprint' in window) window.addEventListener('afterprint', afterPrint);
        let stopPrintMql = null;
        if (window.matchMedia) {
            const mql = window.matchMedia('print');
            const onMql = e => { if (e.matches) beforePrint(); else afterPrint(); };
            try { mql.addEventListener('change', onMql); stopPrintMql = () => mql.removeEventListener('change', onMql); }
            catch { mql.addListener(onMql); stopPrintMql = () => mql.removeListener(onMql); }
        }

        // Force a couple of animation frames and font readiness so page 1 is correct
        function nextFrames(n = 2) { return new Promise(res => { const tick = () => { if (n-- <= 0) res(); else requestAnimationFrame(tick) }; requestAnimationFrame(tick); }); }
        async function stablePrint() {
            try { if (document.fonts && document.fonts.ready) await document.fonts.ready; } catch { }
            // flush layout twice
            await nextFrames(2); void document.documentElement.offsetHeight; await nextFrames(1);
            window.print();
        }

        /* Wire events */
        $('btnLoad').addEventListener('click', () => { const id = Number($('savedList').value); const rec = CACHE.find(x => x.id === id); if (!rec) { alert('Select a valid slip.'); return; } CURRENT = [rec]; renderSlips(); $('status').textContent = `Loaded #${rec.id}${rec.sh_no ? ' (SH ' + rec.sh_no + ')' : ''}`; });

        $('btnFetch').addEventListener('click', async () => { const raw = $('shFetch').value || ''; const tokens = parseShList(raw); if (!tokens.length) { alert('Enter one or more SH numbers.'); return; } if (!CACHE.length) CACHE = await getAllRecords(); const found = []; const missed = []; for (const t of tokens) { const rec = CACHE.find(r => String(r.sh_no || '').trim().toUpperCase() === String(t).trim().toUpperCase()); if (rec) found.push(rec); else missed.push(t); } CURRENT = found; renderSlips(); const msg = `Fetched ${found.length}/${tokens.length} slip(s)` + (missed.length ? `. Missing: ${missed.join(', ')}` : ''); $('status').textContent = msg; });

        $('shFetch').addEventListener('keydown', (e) => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey || !e.shiftKey)) { e.preventDefault(); $('btnFetch').click(); } });

        $('rows').addEventListener('change', renderSlips);

        // Plain Print: ensure no GL theming bleeds into it
        $('btnPrint').addEventListener('click', () => { clearThemes(); GL_MODE_ACTIVE = false; window.print(); });

        // GL Copy: apply building-based colors just for this print, then restore
        $('btnGLCopy').addEventListener('click', async () => {
            clearThemes();
            GL_MODE_ACTIVE = true; // used by beforeprint hook
            applyThemesForGL();
            // give the DOM time to paint the first page with themes
            await stablePrint();
            // fallback cleanup in case afterprint never fires
            setTimeout(() => { if (GL_MODE_ACTIVE) { afterPrint(); } }, 2000);
        });

        (async function init() { await refreshList(); renderSlips(); })();

        return () => stopPrintMql?.();
}
