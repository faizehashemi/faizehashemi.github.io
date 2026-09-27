// Ported from pms/print_slip_a5.html. Page logic is kept as it was; storage goes through ctx.db (app/core/db.js).

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

        // Theme mapping by BUILDING text (not leader)
        function themeForBuilding(rec) {
            const src = (rec.building || '').toString().toUpperCase();
            if (src.includes('MOHAMMEDI')) return 'theme-mohammedi';
            if (src.includes('MUFADDAL')) return 'theme-mufaddal';
            if (src.includes('SNOOD')) return 'theme-snood';
            if (src.includes('BAHA')) return 'theme-baha';
            return 'theme-snood'; // default: black
        }

        /* Build the slip HTML for one copy */
        function slipHTML(rec, rows) {
            const title = 'ACCOMODATION DETAILS';
            const ciDate = ymdToDMY(rec.checkin_date || '');
            const coDate = ymdToDMY(rec.checkout_date || '');
            const ciTime = hhmmToHMS(rec.checkin_time || '');
            const coTime = hhmmToHMS(rec.checkout_time || '');

            const gents = (rec.rooms?.gents || []).slice(0, rows);
            const ladies = (rec.rooms?.ladies || []).slice(0, rows);

            function fillRows(arr) {
                const out = [];
                for (let i = 0; i < rows; i++) {
                    const r = arr[i];
                    const room = r && r.room_no ? r.room_no : '-';
                    const beds = r && (r.assigned !== '' && r.assigned != null) ? r.assigned
                        : (r && (r.capacity !== '' && r.capacity != null) ? r.capacity : 0);
                    out.push(`<tr><td>${room}</td><td>${beds}</td></tr>`);
                }
                return out.join('');
            }

            // Build the GL-only note for SNOOD combined rooms
            let noteHTML = '';
            const isSnood = String(rec.building || '').toUpperCase().includes('SNOOD');
            if (isSnood) {
                const combos = findCombinedRooms(rec, rows);
                if (combos.length) {
                    noteHTML = `<div class="gl-note">Please note: these rooms have combined entrance: ${combos.join(', ')}</div>`;
                }
            }

            return `
  <div class="slip" data-rec-id="${rec.id}">
    <div class="title">${title}</div>
    <table class="grid pair">
      <tbody>
        <tr><th>TOUR NAME</th><td colspan="3">${rec.tour_name || ''}</td></tr>
        <tr><th>GRP LEADER</th><td colspan="3">${rec.group_leader || ''}</td></tr>
        <tr><th>CHECK IN</th><td>${ciDate}</td><td>${ciTime}</td><td></td></tr>
        <tr><th>CHECK OUT</th><td>${coDate}</td><td>${coTime}</td><td></td></tr>
        <tr><th>BUILDING</th><td colspan="3">${rec.building || ''}</td></tr>
        <tr><th>SH NO.</th><td>${rec.sh_no ?? ''}</td><th>TOTAL</th><td>${rec.total ?? ''}</td></tr>
        <tr><th>GENTS</th><td>${rec.gents ?? ''}</td><th>LADIES</th><td>${rec.ladies ?? ''}</td></tr>
        <tr><th>CHILDREN</th><td>${rec.children ?? ''}</td><th>INFANTS</th><td>${rec.infants ?? ''}</td></tr>
      </tbody>
    </table>

    <div class="subtables">
      <table class="mini">
        <caption>GENTS</caption>
        <thead><tr><th>Room No</th><th>Assigned Beds</th></tr></thead>
        <tbody>${fillRows(gents)}</tbody>
      </table>
      <table class="mini">
        <caption>LADIES</caption>
        <thead><tr><th>Room No</th><th>Assigned Beds</th></tr></thead>
        <tbody>${fillRows(ladies)}</tbody>
      </table>
    </div>

    ${noteHTML}
  </div>`;
        }

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

        function clearThemes() {
            $('printArea').classList.remove('gl-mode');
            document.querySelectorAll('.slip').forEach(el => {
                if (el.dataset.classBackup) { el.className = el.dataset.classBackup; delete el.dataset.classBackup; }
                else {
                    // remove any theme-* class without clobbering other classes
                    el.className = el.className.replace(/\btheme-(mohammedi|mufaddal|snood|baha)\b/g, '').replace(/\s{2,}/g, ' ').trim();
                }
            });
        }

        function applyThemesForGL() {
            const area = $('printArea');
            area.classList.add('gl-mode');
            const all = document.querySelectorAll('.slip');
            for (const el of all) {
                if (!el.dataset.classBackup) el.dataset.classBackup = el.className;
                const id = Number(el.getAttribute('data-rec-id') || '');
                const rec = CACHE.find(x => x.id === id) || CURRENT.find(x => x.id === id) || {};
                const theme = themeForBuilding(rec);
                // strip existing theme-*, then add
                el.className = el.className.replace(/\btheme-(mohammedi|mufaddal|snood|baha)\b/g, '').trim();
                el.classList.add(theme);
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

        function findCombinedRooms(rec, rows) {
            const pairs = [['2', '3'], ['8', '9'], ['12', '13'], ['18', '19']];
            const g = (rec.rooms?.gents || []).slice(0, rows);
            const l = (rec.rooms?.ladies || []).slice(0, rows);
            const rooms = new Set([...g, ...l].map(r => String(r?.room_no || '').trim()).filter(Boolean));

            const combos = new Set();
            for (const room of rooms) {
                if (!/^\d+$/.test(room)) continue; // only pure numerics like 102, 113
                for (const [a, b] of pairs) {
                    // check both directions so any one present can discover its partner
                    for (const [s1, s2] of [[a, b], [b, a]]) {
                        const L = s1.length;
                        if (room.endsWith(s1)) {
                            const prefix = room.slice(0, room.length - L);
                            const partner = prefix + s2;
                            if (rooms.has(partner)) {
                                const left = prefix + a;
                                const right = prefix + b;
                                combos.add(`${left} & ${right}`);
                            }
                        }
                    }
                }
            }
            return Array.from(combos).sort((x, y) => x.localeCompare(y, { numeric: true }));
        }

        return () => stopPrintMql?.();
}
