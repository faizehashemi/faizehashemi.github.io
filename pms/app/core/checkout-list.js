// UMS "pending checkout" list (Accounts → Pending checkouts). Read from the Excel or the PDF export,
// then matched to this site's slips by SH (= the list's BOOKING REF) to show building and rooms.
// Nothing is saved: the list lives only in the open page.
//
// Columns: GROUP ID · BOOKING REF · TOUR OPERATOR · GR LDR NAME · TOTAL PAX · ARRIVAL DATE ·
//          EXPECTED CHECKOUT · PRESENT LOCATION · MAKKAH ROOMS · [Total Advance] · [CHECKOUT NOW]
// The PDF export has no Total Advance column; then `hasAdvance` is false.

import { loadScript, LIBS } from './lib.js';
import { baseSh } from './ums.js';

const norm = (s) => String(s ?? '').replace(/\s+/g, ' ').trim();
const key = (s) => norm(s).toLowerCase().replace(/[^a-z0-9]/g, '');

// header text (normalised) → field
const COLUMNS = [
    ['groupId', k => k === 'groupid'],
    ['sh', k => k === 'bookingref' || k === 'shref'],
    ['operator', k => k === 'touroperator'],
    ['leader', k => k === 'grldrname' || k === 'groupleadername'],
    ['pax', k => k === 'totalpax'],
    ['arrival', k => k === 'arrivaldate'],
    ['checkout', k => k === 'expectedcheckout'],
    ['location', k => k === 'presentlocation'],
    ['umsRooms', k => /rooms$/.test(k)],
    ['advance', k => /advance/.test(k)],
    ['checkoutNow', k => k === 'checkoutnow'],
];
const REQUIRED = ['sh', 'leader', 'checkout'];

const fieldOf = (text) => { const k = key(text); return (COLUMNS.find(([, t]) => t(k)) || [])[0] || null; };

// "03-10-2026 06:30" / "26/08/2026" → { date: "2026-10-03", time: "06:30" }
function parseWhen(text) {
    const m = norm(text).match(/(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})(?:\s+(\d{1,2}):(\d{2}))?/);
    if (!m) return { date: '', time: '' };
    const p2 = (n) => String(n).padStart(2, '0');
    return { date: `${m[3]}-${p2(m[2])}-${p2(m[1])}`, time: m[4] ? `${p2(m[4])}:${m[5]}` : '' };
}

function toNumber(v) {
    if (typeof v === 'number') return v;
    const t = norm(v).replace(/,/g, '');
    if (!t) return null;
    const n = Number(t);
    return Number.isFinite(n) ? n : null;
}

// One row of cell texts (keyed by field) → a group, or null for blank / total rows
function toGroup(cell) {
    const sh = norm(cell.sh).replace(/\.0+$/, '');
    if (!/^S?\d+$/i.test(sh)) return null;
    const checkout = parseWhen(cell.checkout);
    return {
        groupId: norm(cell.groupId).replace(/\.0+$/, ''),
        sh,
        operator: norm(cell.operator),
        leader: norm(cell.leader),
        pax: toNumber(cell.pax),
        arrival: parseWhen(cell.arrival).date,
        checkoutDate: checkout.date,
        checkoutTime: checkout.time,
        location: norm(cell.location),
        umsRooms: norm(cell.umsRooms).split(/[,;]/).map(norm).filter(Boolean),
        advance: toNumber(cell.advance),
    };
}

function finish(res) {
    const seen = new Set();
    for (const g of res.groups) {
        if (seen.has(g.sh)) res.warnings.push(`SH ${g.sh} appears more than once.`);
        seen.add(g.sh);
    }
    if (!res.groups.length && !res.fatal) res.fatal = 'No group rows found in this file.';
    return res;
}

/* --------------------------------- Excel --------------------------------- */

/** Excel (.xlsx / .xls, including the HTML-table .xls UMS writes). */
export async function parseExcel(buffer) {
    await loadScript(LIBS.xlsx);
    const wb = window.XLSX.read(buffer, { type: 'array' });
    const res = { groups: [], warnings: [], fatal: null, hasAdvance: false, source: 'Excel' };
    for (const name of wb.SheetNames) {
        const rows = window.XLSX.utils.sheet_to_json(wb.Sheets[name], { header: 1, raw: true, defval: '' });
        const h = rows.findIndex(r => r.some(c => fieldOf(c) === 'sh'));
        if (h < 0) continue;
        const col = {};
        rows[h].forEach((c, i) => { const f = fieldOf(c); if (f && col[f] === undefined) col[f] = i; });
        const missing = REQUIRED.filter(f => col[f] === undefined);
        if (missing.length) { res.fatal = `Column(s) not found: ${missing.join(', ')}.`; return res; }
        res.hasAdvance = col.advance !== undefined;
        for (const r of rows.slice(h + 1)) {
            const cell = {};
            for (const [f, i] of Object.entries(col)) cell[f] = r[i];
            const g = toGroup(cell);
            if (g) res.groups.push(g);
        }
        return finish(res);
    }
    res.fatal = 'This does not look like the UMS checkout list (no "BOOKING REF" column).';
    return res;
}

/* ---------------------------------- PDF ---------------------------------- */

const PDFJS = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.min.js';
const PDFJS_WORKER = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js';

// Text runs of one page → lines (top to bottom), each a list of runs (left to right).
// Runs on the same line that nearly touch are joined ("FAYZ" "E" → "FAYZ E").
function linesOf(items) {
    const runs = items.filter(it => norm(it.str)).map(it => ({ x: it.transform[4], y: it.transform[5], w: it.width, str: it.str }));
    runs.sort((a, b) => b.y - a.y || a.x - b.x);
    const lines = [];
    for (const r of runs) {
        const line = lines.find(l => Math.abs(l.y - r.y) < 2.5);
        if (line) line.runs.push(r); else lines.push({ y: r.y, runs: [r] });
    }
    for (const l of lines) {
        l.runs.sort((a, b) => a.x - b.x);
        const joined = [];
        for (const r of l.runs) {
            const prev = joined[joined.length - 1];
            if (prev && r.x - (prev.x + prev.w) < 3) { prev.str = norm(prev.str + ' ' + r.str); prev.w = r.x + r.w - prev.x; }
            else joined.push({ ...r, str: norm(r.str) });
        }
        l.runs = joined;
    }
    return lines.sort((a, b) => b.y - a.y);
}

// Assign data columns (left edges, sorted) to headers (centres, sorted), keeping the order and
// making the total distance smallest. A column nobody uses in the data simply gets no edge.
function matchColumns(edges, centres) {
    const n = edges.length, m = centres.length;
    const INF = 1e12;
    const cost = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(INF));
    const pick = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(false));
    for (let j = 0; j <= m; j++) cost[0][j] = 0;
    for (let i = 1; i <= n; i++) for (let j = 1; j <= m; j++) {
        const skip = cost[i][j - 1];
        const take = cost[i - 1][j - 1] + Math.abs(edges[i - 1] - centres[j - 1]);
        if (take <= skip) { cost[i][j] = take; pick[i][j] = true; } else cost[i][j] = skip;
    }
    const out = new Array(n);
    for (let i = n, j = m; i > 0 && j > 0;) {
        if (pick[i][j]) { out[i - 1] = j - 1; i--; j--; } else j--;
    }
    return out;
}

const HEADER_WORDS = /^(group|id|booking|ref|tour|operator|gr ldr name|total|pax|arrival|date|expected|checkout|present|location|makkah|madina|rooms|advance|total advance|now|checkout now)$/i;
const isHeaderLine = (l) => l.runs.every(r => HEADER_WORDS.test(r.str));

/** PDF export (text PDF, as UMS prints it). */
export async function parsePdf(buffer) {
    await loadScript(PDFJS);
    const pdfjs = window.pdfjsLib;
    pdfjs.GlobalWorkerOptions.workerSrc = PDFJS_WORKER;
    const pdf = await pdfjs.getDocument({ data: new Uint8Array(buffer) }).promise;
    const res = { groups: [], warnings: [], fatal: null, hasAdvance: false, source: 'PDF' };

    const pages = [];
    for (let p = 1; p <= pdf.numPages; p++) {
        const page = await pdf.getPage(p);
        pages.push(linesOf((await page.getTextContent()).items));
    }

    // Header: the line with GROUP and BOOKING plus the lines under it that hold only header words.
    // Runs that overlap left-right belong to the same header cell ("EXPECTED" over "CHECKOUT").
    let header = null;
    for (const lines of pages) {
        const i = lines.findIndex(l => l.runs.some(r => /^group$/i.test(r.str)) && l.runs.some(r => /^booking$/i.test(r.str)));
        if (i < 0) continue;
        const cells = [];
        for (let k = i; k < lines.length && (k === i || isHeaderLine(lines[k])); k++) {
            for (const r of lines[k].runs) {
                const c = cells.find(c => r.x < c.right && r.x + r.w > c.left);
                if (c) { c.text += ' ' + r.str; c.left = Math.min(c.left, r.x); c.right = Math.max(c.right, r.x + r.w); }
                else cells.push({ left: r.x, right: r.x + r.w, text: r.str });
            }
        }
        header = cells.sort((a, b) => a.left - b.left).map(c => ({ ...c, field: fieldOf(c.text), centre: (c.left + c.right) / 2 }));
        break;
    }
    if (!header) { res.fatal = 'This PDF does not look like the UMS checkout list (no GROUP ID / BOOKING REF header). A scanned PDF cannot be read — use the Excel file.'; return res; }
    const missing = REQUIRED.filter(f => !header.some(h => h.field === f));
    if (missing.length) { res.fatal = `Column(s) not found in the PDF: ${missing.join(', ')}.`; return res; }
    res.hasAdvance = header.some(h => h.field === 'advance');

    // A row starts at a line whose first run is the Group ID (a number) at the far left.
    const firstLeft = header[0].left;
    const startsRow = (l) => /^\d{3,}$/.test(l.runs[0].str) && l.runs[0].x < header[1].left - 2 && l.runs[0].x > firstLeft - 40;

    // Column left edges, measured on the first line of every row (every column starts on it)
    const xs = pages.flat().filter(startsRow).flatMap(l => l.runs.map(r => r.x)).sort((a, b) => a - b);
    const edges = [];
    for (const x of xs) {
        const e = edges[edges.length - 1];
        if (e && x - e.max < 4) { e.max = x; e.sum += x; e.n++; } else edges.push({ min: x, max: x, sum: x, n: 1 });
    }
    const lefts = edges.map(e => e.min);
    const toHeader = matchColumns(edges.map(e => e.sum / e.n), header.map(h => h.centre));
    const fieldAt = (x) => {
        let i = -1;
        for (let k = 0; k < lefts.length; k++) if (x >= lefts[k] - 3) i = k;
        return i < 0 ? null : header[toHeader[i]]?.field;
    };

    let cur = null;
    const flush = () => { if (cur) { const g = toGroup(cur); if (g) res.groups.push(g); } cur = null; };
    const isTotal = (l) => /^total:?$/i.test(l.runs.map(r => r.str).join(' '));
    for (const lines of pages) {
        // skip the title and the repeated header; a row cut by the page break continues under it
        let k = lines.findIndex(l => l.runs.some(r => /^group$/i.test(r.str)) && l.runs.some(r => /^booking$/i.test(r.str)));
        if (k >= 0) for (k++; k < lines.length && isHeaderLine(lines[k]); k++);
        for (const l of lines.slice(Math.max(k, 0))) {
            if (startsRow(l)) { flush(); cur = {}; }
            else if (isTotal(l)) { flush(); continue; }
            else if (!cur) continue;
            for (const r of l.runs) {
                const f = fieldAt(r.x);
                if (f) cur[f] = cur[f] ? `${cur[f]} ${r.str}` : r.str;
            }
        }
    }
    flush();
    return finish(res);
}

/** Excel or PDF, by file type */
export async function parseCheckoutFile(file) {
    const buf = await file.arrayBuffer();
    const isPdf = /\.pdf$/i.test(file.name) || file.type === 'application/pdf' || new TextDecoder().decode(buf.slice(0, 5)) === '%PDF-';
    return isPdf ? parsePdf(buf) : parseExcel(buf);
}

/* ------------------------------ match to PMS ------------------------------ */

const roomsOf = (slip) => {
    const out = [];
    for (const side of ['gents', 'ladies']) for (const r of slip.rooms?.[side] || []) {
        const no = norm(r.room_no);
        if (no && !out.some(x => x.no === no)) out.push({ no, side });
    }
    return out;
};

/**
 * The slips (with building and rooms) each group occupies, found by SH. A group can have more than
 * one slip for its stay (a second slip "S<sh>" for a split group); the ones whose checkout matches
 * the list are used, else the ones whose stay covers that day, else the latest stay.
 */
export function matchGroups(groups, slips) {
    const bySh = new Map();
    for (const s of slips) {
        const k = baseSh(s.sh_no);
        if (!k) continue;
        if (!bySh.has(k)) bySh.set(k, []);
        bySh.get(k).push(s);
    }
    return groups.map(g => {
        const all = bySh.get(baseSh(g.sh)) || [];
        const d = g.checkoutDate;
        let pick = all.filter(s => d && s.checkout_date === d);
        if (!pick.length) pick = all.filter(s => d && s.checkin_date <= d && d <= s.checkout_date);
        if (!pick.length && all.length) {
            const last = [...all].sort((a, b) => String(b.checkin_date).localeCompare(String(a.checkin_date)))[0];
            pick = all.filter(s => s.checkin_date === last.checkin_date);
        }
        const stays = pick.map(s => ({ id: s.id, sh: s.sh_no, building: norm(s.building).toUpperCase(), rooms: roomsOf(s), checkout: s.checkout_date, checkoutTime: s.checkout_time }));
        const pmsNos = new Set(stays.flatMap(s => s.rooms.map(r => r.no.toUpperCase())));
        // UMS writes rooms as "MM-615": compare the number part with the PMS rooms
        const umsNos = g.umsRooms.map(r => r.replace(/^[A-Z]+-/i, '').toUpperCase());
        const roomMismatch = stays.length > 0 && umsNos.length > 0 && umsNos.some(n => !pmsNos.has(n));
        return { ...g, stays, found: all.length > 0, roomMismatch, dateMismatch: stays.length > 0 && !!d && !stays.some(s => s.checkout === d) };
    });
}
