// Merged from pms_web/only-pdf.html and pms_web/only-docx.html. Each old page only half-worked
// (a duplicate `const` broke only-pdf's DOCX script; a stray "\1" broke only-docx's PDF script),
// so this view keeps the working PDF generator from one and the DOCX generator from the other,
// sharing one assignment list. Libraries load on first use.

import { loadScript, LIBS } from '../../core/lib.js';

export default async function mount(ctx) {
    const { db } = ctx;

    /* ===== Data (this site) ===== */
    const getAllSlips = () => db.all();

    /* ===== Helpers ===== */
    const $ = sel => document.querySelector(sel);
    const $$ = sel => Array.from(document.querySelectorAll(sel));
    const pad2 = n => String(n).padStart(2, '0');
    const N = v => Number(v || 0);
    const clean = s => String(s ?? '').trim();
    function toDateObj(dstr, tstr) { if (!dstr) return null; const [y, m, d] = dstr.split('-').map(Number); let hh = 0, mm = 0; if (tstr && /^\d{1,2}:\d{2}$/.test(tstr)) { [hh, mm] = tstr.split(':').map(Number) } return new Date(y, (m || 1) - 1, d || 1, hh || 0, mm || 0, 0, 0) }
    function sentenceCase(str) { const s = clean(str).toLowerCase(); return s ? s.charAt(0).toUpperCase() + s.slice(1) : '' }
    const newId = () => 'S' + (crypto.randomUUID?.().slice(0, 8) || Math.random().toString(36).slice(2, 10));
    const stamp = () => { const now = new Date(); return `${now.getFullYear()}${pad2(now.getMonth() + 1)}${pad2(now.getDate())}_${pad2(now.getHours())}${pad2(now.getMinutes())}`; };

    function pairAgg(slot) {
        const map = new Map();
        for (const t of slot.tours) {
            const tour = clean(t.tour_name), leader = clean(t.group_leader);
            if (!tour && !leader) continue;
            const key = tour + '|' + leader;
            if (!map.has(key)) map.set(key, { tour_name: tour, group_leader: leader, count: 0 });
            map.get(key).count += (Number.isFinite(N(t.total)) && N(t.total) > 0) ? N(t.total) : 1;
        }
        return Array.from(map.values());
    }

    function makeSlot(fromItems) {
        const tours = fromItems.map(it => ({ tour_name: clean(it.tour_name), group_leader: clean(it.group_leader), sh: clean(it.sh_no ?? it.sh), total: N(it.total) }));
        const slot = { id: newId(), tours, pax: fromItems.reduce((s, x) => s + N(x.total), 0) || fromItems.length, showLeaderByKey: {} };
        // DOCX default: show leaders when the slot has at most two lines
        const pairs = pairAgg(slot);
        for (const p of pairs) slot.showLeaderByKey[p.tour_name + '|' + p.group_leader] = pairs.length <= 2;
        return slot;
    }

    /* ===== State ===== */
    let ALL = [], RESULTS = [], ASSIGN = [];

    /* ===== UI: results and list ===== */
    function renderResults() {
        const tbody = $('#resultsTbl tbody'); tbody.innerHTML = '';
        $('#foundInfo').textContent = `${RESULTS.length} found`;
        $('#resultsWrap').style.display = RESULTS.length ? '' : 'none';
        $('#resultsTools').style.display = RESULTS.length ? '' : 'none';
        for (const r of RESULTS) {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><input type="checkbox" class="sel"></td>
                <td>${r.tour_name}</td>
                <td>${r.group_leader}</td>
                <td>${r.sh_no}</td>
                <td>${r.checkin_date} <span style="color:#777">${r.checkin_time}</span></td>
                <td>${r.building}</td>
                <td>${r.total}</td>
                <td><button class="add">Add</button></td>`;
            tr.querySelector('.add').addEventListener('click', () => { ASSIGN.push(makeSlot([r])); renderAssign(); });
            tbody.appendChild(tr);
        }
        const selAll = $('#selAll'); selAll.checked = false; selAll.onchange = () => $$('#resultsTbl tbody .sel').forEach(cb => cb.checked = selAll.checked);
    }

    function renderAssign() {
        const tbody = $('#assignTbl tbody'); tbody.innerHTML = '';
        for (const s of ASSIGN) {
            const namesHTML = pairAgg(s).map(p => {
                const key = p.tour_name + '|' + p.group_leader;
                const l = sentenceCase(p.group_leader);
                const leaderLine = l
                    ? `<label style="display:block;font-size:12px;color:#444;margin-top:2px"><input type="checkbox" class="toggleL" data-k="${key}" ${s.showLeaderByKey[key] ? 'checked' : ''}> ${l} <span style="opacity:.7">(show in DOCX)</span></label>`
                    : '';
                return `<div style="margin-bottom:6px"><div style="font-weight:700">${p.tour_name} <span style="opacity:.75">(${p.count})</span></div>${leaderLine}</div>`;
            }).join('');
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><input type="checkbox" class="pick"></td>
                <td>${namesHTML}</td>
                <td><input type="number" min="0" value="${N(s.pax)}" class="pax"></td>
                <td><button class="split">Split</button> <button class="remove">Remove</button></td>`;
            tr.querySelectorAll('.toggleL').forEach(cb => cb.addEventListener('change', e => { s.showLeaderByKey[e.target.dataset.k] = e.target.checked; }));
            tr.querySelector('.pax').addEventListener('change', e => { s.pax = Math.max(0, N(e.target.value)); });
            tr.querySelector('.split').addEventListener('click', () => {
                const tot = N(s.pax); const a = prompt(`Split slot (Total ${tot}). Enter first half pax:`, Math.floor(tot / 2)); if (a == null) return;
                const aNum = Math.max(0, N(a)); const bNum = Math.max(0, tot - aNum);
                const copy = pax => ({ id: newId(), tours: JSON.parse(JSON.stringify(s.tours)), pax, showLeaderByKey: { ...s.showLeaderByKey } });
                ASSIGN = ASSIGN.filter(x => x !== s).concat([copy(aNum), copy(bNum)]); renderAssign();
            });
            tr.querySelector('.remove').addEventListener('click', () => { ASSIGN = ASSIGN.filter(x => x !== s); renderAssign(); });
            tbody.appendChild(tr);
        }
        $('#statAssign').textContent = `${ASSIGN.length} slot${ASSIGN.length !== 1 ? 's' : ''}`;
        const sel = $('#assignAll'); sel.checked = false; sel.onchange = () => $$('#assignTbl tbody .pick').forEach(cb => cb.checked = sel.checked);
    }

    /* ===== PDF generation (from only-pdf.html) ===== */
    function pickCols(n) { if (n >= 9) return 3; if (n >= 4) return 2; return 1; }
    function measureWidth(doc, text, size) { doc.setFontSize(size); return doc.getTextWidth(text); }

    async function downloadPDF() {
        if (!ASSIGN.length) { alert('Add or bundle something first.'); return; }
        try { await loadScript(LIBS.jspdf); } catch { }
        if (!(window.jspdf && window.jspdf.jsPDF)) { alert('PDF engine not loaded. Check your connection.'); return; }
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
        const pageW = doc.internal.pageSize.getWidth();
        const pageH = doc.internal.pageSize.getHeight();
        const margin = 8; const gutter = 6;

        const centerText = (t, x, y, size) => { doc.setFont('helvetica', 'bold'); doc.setFontSize(size); doc.text(t, x, y, { align: 'center', baseline: 'alphabetic' }); };
        const centerNormal = (t, x, y, size) => { doc.setFont('helvetica', 'normal'); doc.setFontSize(size); doc.text(t, x, y, { align: 'center', baseline: 'alphabetic' }); };

        ASSIGN.forEach((slot, si) => {
            if (si > 0) doc.addPage('a4', 'landscape');
            const pairs = pairAgg(slot);
            const cols = pickCols(pairs.length);
            const colW = (pageW - margin * 2 - gutter * (cols - 1)) / cols;
            const rows = Math.ceil(pairs.length / cols);

            // base sizes, then scale to fit width and height
            const tour = 100, leader = 50, lineGap = 1, paxSize = 50;
            function totalHeight(scale) {
                const t = tour * scale, l = leader * scale; const rowH = t * 1.08 + (l > 0 ? l * 1.05 : 0) + lineGap * 2;
                return rows * rowH + 12 + paxSize * scale + 4;
            }
            function widthScale() {
                let s = 1;
                for (const p of pairs) {
                    const w = measureWidth(doc, `${p.tour_name} (${p.count})`, tour);
                    s = Math.min(s, (colW * 0.96) / w); // 4% padding inside column
                }
                return Math.min(1, s);
            }
            let scale = Math.min(1, widthScale());
            const hNeed = totalHeight(scale);
            if (hNeed > (pageH - 2 * margin)) scale *= ((pageH - 2 * margin) / hNeed);

            const tSize = tour * scale, lSize = leader * scale, gap = lineGap * scale, pax = paxSize * scale;
            const rowH = tSize * 1.08 + (lSize > 0 ? lSize * 1.05 : 0) + gap * 2;

            let y0 = margin + ((pageH - 2 * margin - rows * rowH - pax - 6) / 2);
            if (y0 < margin) y0 = margin;

            for (let i = 0; i < pairs.length; i++) {
                const c = i % cols; const r = Math.floor(i / cols);
                const x = margin + c * (colW + gutter) + colW / 2;
                const y = y0 + r * rowH + tSize; // baseline for title
                const p = pairs[i];
                centerText(`${p.tour_name} (${p.count})`, x, y, tSize);
                const leaderLine = sentenceCase(p.group_leader);
                if (leaderLine) centerNormal(leaderLine, x, y + tSize * 0.15 + lSize + gap, lSize);
            }

            centerText(`PAX LIMIT: ${N(slot.pax)}`, pageW / 2, pageH - margin - 4, pax);
        });

        doc.save(`Groups_${stamp()}.pdf`);
    }

    /* ===== DOCX generation (from only-docx.html) ===== */
    async function downloadDOCX() {
        if (!ASSIGN.length) { alert('Add or bundle something first.'); return; }
        try { await Promise.all([loadScript(LIBS.docx), loadScript(LIBS.fileSaver)]); } catch { }
        if (!(window.docx && window.saveAs)) { alert('DOCX engine not loaded.'); return; }
        const { Document, Paragraph, TextRun, AlignmentType, PageOrientation, convertMillimetersToTwip } = window.docx;

        // A4 landscape on every section
        const page = {
            size: { width: convertMillimetersToTwip(297), height: convertMillimetersToTwip(210), orientation: PageOrientation.LANDSCAPE },
            margin: { top: convertMillimetersToTwip(8), right: convertMillimetersToTwip(8), bottom: convertMillimetersToTwip(8), left: convertMillimetersToTwip(8) }
        };
        const BASE = { tour: 44, leader: 22, pax: 26 };

        const visiblePairs = (slot) => pairAgg(slot).map(p => ({ ...p, showLeader: !!slot.showLeaderByKey[p.tour_name + '|' + p.group_leader] }));

        function computeScaleForPairs(pairs, includePax) {
            if (pairs.length <= 1) return { ...BASE }; // single line: fixed sizes
            const mm2pt = mm => mm * 2.83464567;
            const contentHeightPt = mm2pt(210 - 16);
            let lines = 0, maxTitleLen = 0, maxLeaderLen = 0;
            for (const p of pairs) {
                maxTitleLen = Math.max(maxTitleLen, `${p.tour_name} (${p.count})`.length);
                lines += 1;
                if (p.showLeader && (p.group_leader || '').trim()) { maxLeaderLen = Math.max(maxLeaderLen, p.group_leader.length); lines += 1; }
            }
            if (includePax) lines += 1;
            const baseHeightPt = lines * (BASE.tour * 1.08 * 0.5 + BASE.leader * 1.08 * 0.5);
            const heightScale = Math.min(1, contentHeightPt / Math.max(1, baseHeightPt));
            const titleCap = 32, leaderCap = 48; // chars across landscape width at base sizes
            const widthScale = Math.min(1, maxTitleLen ? (titleCap / maxTitleLen) : 1, maxLeaderLen ? (leaderCap / maxLeaderLen) : 1);
            const scale = Math.max(0.35, Math.min(heightScale, widthScale));
            return { tour: Math.round(BASE.tour * scale), leader: Math.round(BASE.leader * scale), pax: Math.round(BASE.pax * scale) };
        }

        function blockFromPairs(pairs, paxValue, sizes) {
            const children = [];
            for (const p of pairs) {
                children.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 0, after: 0 }, children: [new TextRun({ text: `${p.tour_name} (${p.count})`, bold: true, size: sizes.tour * 2 })] }));
                if (p.showLeader && (p.group_leader || '').trim()) {
                    const leader = p.group_leader.charAt(0).toUpperCase() + p.group_leader.slice(1).toLowerCase();
                    children.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 0, after: 0 }, children: [new TextRun({ text: leader, size: sizes.leader * 2 })] }));
                }
            }
            children.push(new Paragraph({ text: '', spacing: { before: 0, after: 0 } }));
            children.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 0, after: 0 }, children: [new TextRun({ text: `PAX LIMIT: ${Number(paxValue || 0)}`, bold: true, size: sizes.pax * 2 })] }));
            return children;
        }

        const sections = [];
        // 1) all bundled slots together on one section, dynamic font sizes
        const bundledSlots = ASSIGN.filter(s => (s.tours || []).length > 1);
        if (bundledSlots.length) {
            const children = [];
            bundledSlots.forEach((slot, idx) => {
                const pairs = visiblePairs(slot);
                if (idx > 0) children.push(new Paragraph({ text: '', spacing: { before: 80, after: 80 } }));
                children.push(...blockFromPairs(pairs, slot.pax, computeScaleForPairs(pairs, true)));
            });
            sections.push({ properties: { page }, children });
        }
        // 2) one section per unbundled slot, fixed sizes
        for (const slot of ASSIGN.filter(s => (s.tours || []).length <= 1)) {
            sections.push({ properties: { page }, children: blockFromPairs(visiblePairs(slot), slot.pax, { ...BASE }) });
        }

        const blob = await window.docx.Packer.toBlob(new Document({ sections }));
        window.saveAs(blob, `Groups_${stamp()}.docx`);
    }

    /* ===== Actions ===== */
    const selectedResults = () => $$('#resultsTbl tbody tr').filter(r => r.querySelector('.sel').checked).map(tr => {
        const td = tr.children;
        return { tour_name: td[1].textContent.trim(), group_leader: td[2].textContent.trim(), sh_no: td[3].textContent.trim(), total: N(td[6].textContent.trim()) };
    });

    $('#btnSearch').addEventListener('click', async () => {
        if (!ALL.length) ALL = await getAllSlips();
        const df = $('#dateFrom').value, dt = $('#dateTo').value; if (!df || !dt) { alert('Pick a date range.'); return; }
        const tf = $('#timeFrom').value || '00:00', tt = $('#timeTo').value || '23:59'; const b = clean($('#building').value);
        const start = toDateObj(df, tf), end = toDateObj(dt, tt);
        const inRange = s => { const d = toDateObj(s.checkin_date, s.checkin_time); return d && d >= start && d <= end };
        RESULTS = ALL.filter(s => inRange(s)).filter(s => !b || clean(s.building) === b).map(s => ({
            tour_name: clean(s.tour_name), group_leader: clean(s.group_leader), sh_no: clean(s.sh_no), checkin_date: s.checkin_date || '', checkin_time: s.checkin_time || '', building: clean(s.building), total: N(s.total)
        })).sort((a, b) => (a.checkin_date + a.checkin_time).localeCompare(b.checkin_date + b.checkin_time));
        renderResults();
    });

    $('#btnAddSelected').addEventListener('click', () => {
        const chosen = selectedResults();
        if (!chosen.length) { alert('Select arrivals first.'); return; }
        chosen.forEach(c => ASSIGN.push(makeSlot([c]))); renderAssign();
    });

    $('#btnBundleSelected').addEventListener('click', () => {
        const chosen = selectedResults();
        if (chosen.length < 2) { alert('Select at least two arrivals to bundle.'); return; }
        ASSIGN.push(makeSlot(chosen)); renderAssign();
    });

    $('#btnBundleSlots').addEventListener('click', () => {
        const rows = $$('#assignTbl tbody tr');
        const picks = rows.map((r, i) => ({ row: r, idx: i })).filter(p => p.row.querySelector('.pick').checked);
        if (picks.length < 2) { alert('Pick at least two slots.'); return; }
        const items = picks.map(p => ASSIGN[p.idx]);
        const merged = { id: newId(), tours: items.flatMap(s => s.tours), pax: items.reduce((s, x) => s + N(x.pax), 0), showLeaderByKey: {} };
        // defaults for the merged slot, then keep any leader line that was switched on before
        merged.showLeaderByKey = makeSlot(merged.tours).showLeaderByKey;
        for (const s of items) for (const k in s.showLeaderByKey) if (s.showLeaderByKey[k]) merged.showLeaderByKey[k] = true;
        picks.sort((a, b) => b.idx - a.idx).forEach(p => ASSIGN.splice(p.idx, 1)); ASSIGN.push(merged); renderAssign();
    });

    $('#btnClearList').addEventListener('click', () => { if (confirm('Clear the assignment list?')) { ASSIGN = []; renderAssign(); } });
    $('#btnPdf').addEventListener('click', downloadPDF);
    $('#btnDocx').addEventListener('click', downloadDOCX);

    // Defaults: today
    const now = new Date();
    $('#dateFrom').value = $('#dateTo').value = `${now.getFullYear()}-${pad2(now.getMonth() + 1)}-${pad2(now.getDate())}`;
}
