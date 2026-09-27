// Ported from pms_web/movement.html (mobile check-ins/check-outs). Its two scripts are merged;
// the range behaviour matches the Checkins view (today 03:00 → tomorrow 03:00 by default).
// It used to read IndexedDB and fall back to the Gist; that choice is now the nav's data source.

export default async function mount(ctx) {
    const { db, site } = ctx;

    // ===== data (this site) =====
    const getAllRecords = () => db.all();

    // ===== helpers =====
    const $ = s => document.querySelector(s);
    const $$ = s => Array.from(document.querySelectorAll(s));
    const pad2 = n => String(n).padStart(2, '0');
    const ymd = d => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
    function parseDT(d, t) { if (!d) return null; const [y, m, day] = String(d).split('-').map(Number); let hh = 0, mm = 0; if (t && /^\d{1,2}:\d{2}$/.test(t)) { [hh, mm] = t.split(':').map(Number) } return new Date(y, (m || 1) - 1, day || 1, hh || 0, mm || 0, 0, 0); }
    const fmt = dt => dt ? new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short', hour12: false }).format(dt) : '';
    const nz = v => Number(v || 0);
    function plusOneDay(yyyy_mm_dd) {
        if (!yyyy_mm_dd) return '';
        const [y, m, d] = yyyy_mm_dd.split('-').map(Number);
        const dt = new Date(y, (m || 1) - 1, d || 1);
        dt.setDate(dt.getDate() + 1);
        return ymd(dt);
    }

    function roomList(rec) { const all = []; (rec.rooms?.gents || []).forEach(x => all.push(String(x.room_no || '').trim())); (rec.rooms?.ladies || []).forEach(x => all.push(String(x.room_no || '').trim())); const uniq = [...new Set(all.filter(Boolean))]; return uniq.sort((a, b) => a.localeCompare(b, undefined, { numeric: true })).join(', '); }
    function assignedSum(rec) { let s = 0; (rec.rooms?.gents || []).forEach(x => { const a = Number(x.assigned); if (Number.isFinite(a)) s += a }); (rec.rooms?.ladies || []).forEach(x => { const a = Number(x.assigned); if (Number.isFinite(a)) s += a }); return s || ''; }

    const observers = [];
    function bindTableControls(ctrlId, wrapId, tableId, toggleId) {
        const ctrl = document.getElementById(ctrlId), wrap = document.getElementById(wrapId), table = document.getElementById(tableId), toggle = document.getElementById(toggleId);
        if (!ctrl || !wrap || !table) return;
        ctrl.querySelectorAll('input[type="range"]').forEach(r => {
            const bind = r.dataset.bind;
            const apply = () => {
                if (bind === 'font') table.style.setProperty('--t-font', r.value);
                if (bind === 'pad') { table.style.setProperty('--t-pad', r.value); table.classList.toggle('compact', Number(r.value) <= 5); }
                if (bind === 'minw') table.style.setProperty('--t-minw', r.value + 'px');
            };
            r.addEventListener('input', apply); apply();
        });
        toggle?.addEventListener('click', () => table.classList.toggle('compact'));
        const cue = () => { const L = wrap.scrollLeft <= 0; const R = Math.ceil(wrap.scrollLeft + wrap.clientWidth) >= wrap.scrollWidth; wrap.classList.toggle('is-scrolling-left', !L); wrap.classList.toggle('is-scrolling-right', !R); };
        wrap.addEventListener('scroll', cue, { passive: true });
        const ro = new ResizeObserver(cue); ro.observe(wrap); observers.push(ro);
        cue();
    }

    function tableToCSV(table) {
        const rows = [...table.querySelectorAll('tr')];
        return rows.map(tr => [...tr.children].map(td => { const t = td.textContent.replace(/\s+/g, ' ').trim(); return /[",\n]/.test(t) ? '"' + t.replace(/"/g, '""') + '"' : t; }).join(',')).join('\n');
    }

    function download(name, text) { const blob = new Blob([text], { type: 'text/plain' }); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 500); }

    /* ===== Luggage column helpers ===== */
    let SH_INDEX = new Map();
    function indexBySh(rows) {
        SH_INDEX = new Map();
        for (const r of rows) {
            const key = String(r.sh_no ?? '').trim();
            if (key && !SH_INDEX.has(key)) SH_INDEX.set(key, r);
        }
    }
    // A 6-digit SH starting with '33' has its luggage with SH minus the first '3' (5 digits)
    function normalizeLuggageSH(sh) {
        const s = String(sh ?? '').replace(/\D/g, '');
        if (/^33\d{4}$/.test(s)) return s.slice(1);
        return null;
    }
    function luggageAt(sh) {
        const key = normalizeLuggageSH(sh);
        if (!key) return '';
        const rec = SH_INDEX.get(key);
        return rec?.building ? String(rec.building).trim() : '';
    }

    // ===== column visibility (the style tag is removed by the shell on navigation) =====
    function applyColumnVisibility() {
        const hidden = $$('#colChooser input[type="checkbox"]').filter(cb => !cb.checked).map(cb => cb.dataset.col);
        const style = document.getElementById('colStyle') || (() => { const el = document.createElement('style'); el.id = 'colStyle'; document.head.appendChild(el); return el; })();
        if (!hidden.length) { style.textContent = ''; return; }
        style.textContent = `${hidden.map(k => `#tblIn [data-col="${k}"], #tblOut [data-col="${k}"]`).join(',')}{display:none}`;
    }

    // ===== date range (same rules as the Checkins view) =====
    let userEditedDateTo = false;
    let lastAutoTo = '';
    function ensureDateRange() {
        const df = $('#dateFrom').value;
        if (!$('#dateTo').value && df) {
            $('#dateTo').value = plusOneDay(df);
            lastAutoTo = $('#dateTo').value;
            userEditedDateTo = false;
        }
        const tf = $('#timeFrom').value || '03:00';
        const tt = $('#timeTo').value || '03:00';
        const start = df ? new Date(`${df}T${tf}`) : null;
        const dt = $('#dateTo').value;
        let end = dt ? new Date(`${dt}T${tt}`) : null;
        if (start && end && !(end > start)) {
            end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
            $('#dateTo').value = ymd(end);
            $('#timeTo').value = pad2(end.getHours()) + ':' + pad2(end.getMinutes());
            lastAutoTo = $('#dateTo').value;
            userEditedDateTo = false;
        }
    }

    // ===== data + render =====
    let DB_CACHE = [];

    function currentRange() {
        const df = $('#dateFrom').value, tf = $('#timeFrom').value || '03:00', dt = $('#dateTo').value, tt = $('#timeTo').value || '03:00';
        return { start: parseDT(df, tf), end: parseDT(dt, tt) };
    }

    function run() {
        ensureDateRange();
        const { start, end } = currentRange(); if (!start || !end || !(end >= start)) { alert('Choose a valid date/time range.'); return; }
        const b = (($('#building').value) || '').trim();
        const ins = [], outs = [];
        for (const r of DB_CACHE) {
            const bld = (r.building || '').trim(); if (b && bld !== b) continue;
            const ci = parseDT(r.checkin_date, r.checkin_time); const co = parseDT(r.checkout_date, r.checkout_time);
            if (ci && ci >= start && ci <= end) ins.push(r);
            if (co && co >= start && co <= end) outs.push(r);
        }
        ins.sort((a, b) => (a.checkin_date + a.checkin_time).localeCompare(b.checkin_date + b.checkin_time));
        outs.sort((a, b) => (a.checkout_date + a.checkout_time).localeCompare(b.checkout_date + b.checkout_time));
        renderRows('#tblIn', '#sumIn', ins, 'cin', 'cout');
        renderRows('#tblOut', '#sumOut', outs, 'cout', 'cin');
        applyColumnVisibility();
        $('#status').textContent = `${DB_CACHE.length} slip(s) loaded • range ${fmt(start)} → ${fmt(end)}`;
    }

    // first/last columns are the event time and the opposite time (cin/cout)
    function renderRows(tableSel, sumSel, rows, firstCol, lastCol) {
        const tb = $(`${tableSel} tbody`); tb.innerHTML = ''; let slips = 0, guests = 0;
        const when = { cin: r => fmt(parseDT(r.checkin_date, r.checkin_time)), cout: r => fmt(parseDT(r.checkout_date, r.checkout_time)) };
        for (const r of rows) {
            slips++; const g = nz(r.gents), l = nz(r.ladies), c = nz(r.children), i = nz(r.infants);
            const t = nz(r.total) || (g + l + c + i); guests += t;
            const tr = document.createElement('tr'); tr.innerHTML = `
      <td data-col="${firstCol}">${when[firstCol](r)}</td>
      <td data-col="sh">${r.sh_no ?? ''}</td>
      <td data-col="lug">${luggageAt(r.sh_no)}</td>
      <td data-col="group" title="${r.tour_name || ''}">${r.tour_name || ''}</td>
      <td data-col="leader" title="${r.group_leader || ''}">${(r.group_leader || '')}</td>
      <td data-col="bld">${(r.building || '')}</td>
      <td data-col="rooms" title="${roomList(r)}">${roomList(r)}</td>
      <td data-col="as" class="right">${assignedSum(r)}</td>
      <td data-col="t">${t}</td>
      <td data-col="g">${g}</td>
      <td data-col="l">${l}</td>
      <td data-col="c">${c}</td>
      <td data-col="i">${i}</td>
      <td data-col="${lastCol}">${when[lastCol](r)}</td>`;
            tb.appendChild(tr);
        }
        $(sumSel).textContent = `${slips} slip${slips !== 1 ? 's' : ''} • ${guests} guests`;
    }

    // ===== boot =====
    async function refresh() {
        DB_CACHE = await getAllRecords().catch(() => []);
        indexBySh(DB_CACHE);
        run();
        if (!DB_CACHE.length) $('#status').textContent = 'No slips found. Open the slip page once to seed local DB, or switch to Cloud.';
    }

    for (const b of site.buildings) {
        const o = document.createElement('option'); o.textContent = b; $('#building').appendChild(o);
    }

    const today = ymd(new Date());
    $('#dateFrom').value = today; $('#dateTo').value = plusOneDay(today);
    $('#timeFrom').value = '03:00'; $('#timeTo').value = '03:00';
    lastAutoTo = $('#dateTo').value;

    $('#dateFrom').addEventListener('input', () => {
        const df = $('#dateFrom').value;
        if (!df) return;
        if (!userEditedDateTo || $('#dateTo').value === lastAutoTo) {
            const next = plusOneDay(df);
            $('#dateTo').value = next; lastAutoTo = next; userEditedDateTo = false;
        }
    });
    $('#dateTo').addEventListener('input', () => { userEditedDateTo = true; });

    $('#btnRun').addEventListener('click', run);
    $('#btnRefresh').addEventListener('click', refresh);
    bindTableControls('ctrlIn', 'wrapIn', 'tblIn', 'toggleIn');
    bindTableControls('ctrlOut', 'wrapOut', 'tblOut', 'toggleOut');
    const stamp = today.replace(/-/g, '');
    $('#csvIn').addEventListener('click', () => download(`checkins_${stamp}.csv`, tableToCSV(document.getElementById('tblIn'))));
    $('#csvOut').addEventListener('click', () => download(`checkouts_${stamp}.csv`, tableToCSV(document.getElementById('tblOut'))));
    $('#printIn').addEventListener('click', () => window.print());
    $('#printOut').addEventListener('click', () => window.print());
    document.getElementById('colChooser').addEventListener('change', (e) => {
        if (e.target.matches('input[type="checkbox"][data-col]')) applyColumnVisibility();
    });
    applyColumnVisibility(); // As., G, L, C, I start unchecked → hidden

    await refresh();
    return () => observers.forEach(o => o.disconnect());
}
