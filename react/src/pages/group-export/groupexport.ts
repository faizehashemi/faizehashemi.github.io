// Fakkul Ehraam Groups — PDF / DOCX generators (moved unchanged from pms/app/views/group-export/view.js). The libraries (jsPDF, docx, FileSaver)
// load on first use through core/lib.js, shared with the legacy pages.
export type Tour = { tour_name: string; group_leader: string; sh: string; total: number };
export type Slot = { id: string; tours: Tour[]; pax: number; showLeaderByKey: Record<string, boolean> };
type Lib = { loadScript: (url: string) => Promise<unknown>; LIBS: Record<string, string> };

export const N = (v: unknown) => Number(v || 0);
export const clean = (s: unknown) => String(s ?? '').trim();
const pad2 = (n: number) => String(n).padStart(2, '0');
export const sentenceCase = (str: unknown) => { const s = clean(str).toLowerCase(); return s ? s.charAt(0).toUpperCase() + s.slice(1) : ''; };
export const newId = () => 'S' + (crypto.randomUUID?.().slice(0, 8) || Math.random().toString(36).slice(2, 10));
export const stamp = () => { const now = new Date(); return `${now.getFullYear()}${pad2(now.getMonth() + 1)}${pad2(now.getDate())}_${pad2(now.getHours())}${pad2(now.getMinutes())}`; };
export const keyOf = (p: { tour_name: string; group_leader: string }) => p.tour_name + '|' + p.group_leader;

export type Pair = { tour_name: string; group_leader: string; count: number };
export function pairAgg(slot: Pick<Slot, 'tours'>): Pair[] {
    const map = new Map<string, Pair>();
    for (const t of slot.tours) {
        const tour = clean(t.tour_name), leader = clean(t.group_leader);
        if (!tour && !leader) continue;
        const key = tour + '|' + leader;
        if (!map.has(key)) map.set(key, { tour_name: tour, group_leader: leader, count: 0 });
        map.get(key)!.count += (Number.isFinite(N(t.total)) && N(t.total) > 0) ? N(t.total) : 1;
    }
    return Array.from(map.values());
}

export function makeSlot(items: { tour_name: string; group_leader: string; sh_no?: string; sh?: string; total: number }[]): Slot {
    const tours = items.map(it => ({ tour_name: clean(it.tour_name), group_leader: clean(it.group_leader), sh: clean(it.sh_no ?? it.sh), total: N(it.total) }));
    const slot: Slot = { id: newId(), tours, pax: items.reduce((s, x) => s + N(x.total), 0) || items.length, showLeaderByKey: {} };
    // DOCX default: show leaders when the slot has at most two lines
    const pairs = pairAgg(slot);
    for (const p of pairs) slot.showLeaderByKey[keyOf(p)] = pairs.length <= 2;
    return slot;
}

/* ===== PDF ===== */
const pickCols = (n: number) => n >= 9 ? 3 : n >= 4 ? 2 : 1;

export async function downloadPDF(slots: Slot[], lib: Lib) {
    try { await lib.loadScript(lib.LIBS.jspdf); } catch { /* reported below */ }
    const w: any = window;
    if (!(w.jspdf && w.jspdf.jsPDF)) throw new Error('PDF engine not loaded. Check your connection.');
    const doc = new w.jspdf.jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const pageW = doc.internal.pageSize.getWidth(), pageH = doc.internal.pageSize.getHeight();
    const margin = 8, gutter = 6;
    const measureWidth = (text: string, size: number) => { doc.setFontSize(size); return doc.getTextWidth(text); };
    const centerText = (t: string, x: number, y: number, size: number) => { doc.setFont('helvetica', 'bold'); doc.setFontSize(size); doc.text(t, x, y, { align: 'center', baseline: 'alphabetic' }); };
    const centerNormal = (t: string, x: number, y: number, size: number) => { doc.setFont('helvetica', 'normal'); doc.setFontSize(size); doc.text(t, x, y, { align: 'center', baseline: 'alphabetic' }); };

    slots.forEach((slot, si) => {
        if (si > 0) doc.addPage('a4', 'landscape');
        const pairs = pairAgg(slot);
        const cols = pickCols(pairs.length);
        const colW = (pageW - margin * 2 - gutter * (cols - 1)) / cols;
        const rows = Math.ceil(pairs.length / cols);

        // base sizes, then scale to fit width and height
        const tour = 100, leader = 50, lineGap = 1, paxSize = 50;
        const totalHeight = (scale: number) => { const t = tour * scale, l = leader * scale; const rowH = t * 1.08 + (l > 0 ? l * 1.05 : 0) + lineGap * 2; return rows * rowH + 12 + paxSize * scale + 4; };
        const widthScale = () => { let s = 1; for (const p of pairs) { const wd = measureWidth(`${p.tour_name} (${p.count})`, tour); s = Math.min(s, (colW * 0.96) / wd); } return Math.min(1, s); };   // 4% padding inside column
        let scale = Math.min(1, widthScale());
        const hNeed = totalHeight(scale);
        if (hNeed > (pageH - 2 * margin)) scale *= ((pageH - 2 * margin) / hNeed);

        const tSize = tour * scale, lSize = leader * scale, gap = lineGap * scale, pax = paxSize * scale;
        const rowH = tSize * 1.08 + (lSize > 0 ? lSize * 1.05 : 0) + gap * 2;
        let y0 = margin + ((pageH - 2 * margin - rows * rowH - pax - 6) / 2);
        if (y0 < margin) y0 = margin;

        for (let i = 0; i < pairs.length; i++) {
            const c = i % cols, r = Math.floor(i / cols);
            const x = margin + c * (colW + gutter) + colW / 2;
            const y = y0 + r * rowH + tSize;                       // baseline for title
            const p = pairs[i];
            centerText(`${p.tour_name} (${p.count})`, x, y, tSize);
            const leaderLine = sentenceCase(p.group_leader);
            if (leaderLine) centerNormal(leaderLine, x, y + tSize * 0.15 + lSize + gap, lSize);
        }
        centerText(`PAX LIMIT: ${N(slot.pax)}`, pageW / 2, pageH - margin - 4, pax);
    });
    doc.save(`Groups_${stamp()}.pdf`);
}

/* ===== DOCX ===== */
export async function downloadDOCX(slots: Slot[], lib: Lib) {
    try { await Promise.all([lib.loadScript(lib.LIBS.docx), lib.loadScript(lib.LIBS.fileSaver)]); } catch { /* reported below */ }
    const w: any = window;
    if (!(w.docx && w.saveAs)) throw new Error('DOCX engine not loaded.');
    const { Document, Paragraph, TextRun, AlignmentType, PageOrientation, convertMillimetersToTwip } = w.docx;

    // A4 landscape on every section
    const page = {
        size: { width: convertMillimetersToTwip(297), height: convertMillimetersToTwip(210), orientation: PageOrientation.LANDSCAPE },
        margin: { top: convertMillimetersToTwip(8), right: convertMillimetersToTwip(8), bottom: convertMillimetersToTwip(8), left: convertMillimetersToTwip(8) },
    };
    const BASE = { tour: 44, leader: 22, pax: 26 };
    const visiblePairs = (slot: Slot) => pairAgg(slot).map(p => ({ ...p, showLeader: !!slot.showLeaderByKey[keyOf(p)] }));

    function computeScaleForPairs(pairs: ReturnType<typeof visiblePairs>, includePax: boolean) {
        if (pairs.length <= 1) return { ...BASE };                 // single line: fixed sizes
        const mm2pt = (mm: number) => mm * 2.83464567;
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
        const titleCap = 32, leaderCap = 48;                       // chars across landscape width at base sizes
        const widthScale = Math.min(1, maxTitleLen ? (titleCap / maxTitleLen) : 1, maxLeaderLen ? (leaderCap / maxLeaderLen) : 1);
        const scale = Math.max(0.35, Math.min(heightScale, widthScale));
        return { tour: Math.round(BASE.tour * scale), leader: Math.round(BASE.leader * scale), pax: Math.round(BASE.pax * scale) };
    }

    function blockFromPairs(pairs: ReturnType<typeof visiblePairs>, paxValue: number, sizes: { tour: number; leader: number; pax: number }) {
        const children: any[] = [];
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

    const sections: any[] = [];
    // 1) all bundled slots together on one section, dynamic font sizes
    const bundled = slots.filter(s => (s.tours || []).length > 1);
    if (bundled.length) {
        const children: any[] = [];
        bundled.forEach((slot, idx) => {
            const pairs = visiblePairs(slot);
            if (idx > 0) children.push(new Paragraph({ text: '', spacing: { before: 80, after: 80 } }));
            children.push(...blockFromPairs(pairs, slot.pax, computeScaleForPairs(pairs, true)));
        });
        sections.push({ properties: { page }, children });
    }
    // 2) one section per unbundled slot, fixed sizes
    for (const slot of slots.filter(s => (s.tours || []).length <= 1)) sections.push({ properties: { page }, children: blockFromPairs(visiblePairs(slot), slot.pax, { ...BASE }) });

    const blob = await w.docx.Packer.toBlob(new Document({ sections }));
    w.saveAs(blob, `Groups_${stamp()}.docx`);
}
