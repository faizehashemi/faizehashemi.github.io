// KG — Fakkul Ehraam & Atraaf roster helpers (moved unchanged from pms/app/views/kg/view.js): stats per person, the orders, the WhatsApp message, the
// per-person histogram and the Excel export.
export const LOCATIONS = ['*MP FLOOR*', '*DH FLOOR*', '*UG FLOOR*', '*SNOOD HOTEL*', '*MIZAB HOTEL*', '*LG FLOOR*'];
export const TYPES = ['FE1', 'FE2', 'Atraaf'] as const;
// this browser's list from before the cloud (offered once for upload)
export const LS_PEOPLE = 'umrah-atraaf-people-v2', LS_LOG = 'umrah-atraaf-log-v2', LS_FE1_BOOKMARK = 'umrah-fe1-bookmark-v1';

export type LogEntry = { id: number; ts: string; person: string; type: 'FE1' | 'FE2' | 'Atraaf'; location?: string };
export type KgState = { people: string[]; archived?: string[]; bookmark?: string; log: LogEntry[] };
export type Tick = { type: Set<string>; location: string; bus: string };
export type Stat = { FE1: number; FE2: number; Atraaf: number; total: number; last: string; lastFE1: string };

const pad = (n: number) => String(n).padStart(2, '0');
export const ymd = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const natural = (a: string, b: string) => a.localeCompare(b, undefined, { sensitivity: 'base', numeric: true });
export const shortDate = (iso?: string) => iso ? new Date(iso).toLocaleDateString(undefined, { day: '2-digit', month: 'short' }) : '—';
export const whenTxt = (ts: string) => new Date(ts).toLocaleString(undefined, { day: '2-digit', month: 'short', year: '2-digit', hour: '2-digit', minute: '2-digit' });
const blank = (): Stat => ({ FE1: 0, FE2: 0, Atraaf: 0, total: 0, last: '', lastFE1: '' });

export function computeStats(people: string[], history: LogEntry[]) {
    const stats = new Map<string, Stat>();
    const get = (n: string) => { if (!stats.has(n)) stats.set(n, blank()); return stats.get(n)!; };
    for (const h of history) {
        const s = get(h.person);
        s[h.type] = (s[h.type] || 0) + 1;
        s.total++;
        if (h.ts > s.last) s.last = h.ts;
        if (h.type === 'FE1' && h.ts > s.lastFE1) s.lastFE1 = h.ts;
    }
    for (const n of people) get(n);
    return stats;
}

export type SortKey = 'random' | 'az' | 'last' | 'most' | 'least' | 'FE1' | 'FE2' | 'Atraaf';
export function sorter(key: SortKey, st: (n: string) => Stat, rank: (n: string) => number) {
    const S: Record<SortKey, (a: string, b: string) => number> = {
        random: (a, b) => rank(a) - rank(b),
        az: (a, b) => natural(a, b),
        last: (a, b) => (st(b).last || '').localeCompare(st(a).last || '') || natural(a, b),
        most: (a, b) => st(b).total - st(a).total || natural(a, b),
        least: (a, b) => st(a).total - st(b).total || natural(a, b),
        FE1: (a, b) => st(a).FE1 - st(b).FE1 || (st(a).lastFE1 || '').localeCompare(st(b).lastFE1 || '') || natural(a, b),
        FE2: (a, b) => st(a).FE2 - st(b).FE2 || natural(a, b),
        Atraaf: (a, b) => st(a).Atraaf - st(b).Atraaf || natural(a, b),
    };
    return S[key] || S.random;
}

/** The next Atraaf bus: one more than the highest number given so far (1 for the first) */
export const nextBus = (ticks: Map<string, Tick>) => String(1 + Math.max(0, ...[...ticks.values()].filter(t => t.type.has('Atraaf')).map(t => parseInt(t.bus, 10)).filter(Number.isFinite)));

/** The first three lines of the message: *event*, date and weekday, time */
export function headerText(sessionLabel: string, date: string) {
    const raw = sessionLabel.trim();
    let time = '', head = raw;
    const m = raw.match(/(\d{1,2}:\d{2}\s*(?:AM|PM))/i);
    if (m) { time = m[1].toUpperCase(); head = raw.replace(m[0], '').trim().replace(/\s+/g, ' '); }
    const [y, mo, d] = (date || ymd(new Date())).split('-').map(Number);
    const wk = new Date(y, mo - 1, d).toLocaleDateString(undefined, { weekday: 'long' });
    return `*${head}*\n${pad(d)}/${pad(mo)}/${y} ${wk}\n${time || wk}`;
}

export function buildMessage(header: string, ticks: Map<string, Tick>) {
    const groups: Record<string, string[]> = {};
    for (const [name, t] of ticks) { if (!t.type.size) continue; (groups[t.location || 'Unassigned'] ||= []).push(name); }
    for (const k in groups) groups[k].sort(natural);
    const order = [...LOCATIONS.filter(l => groups[l]), ...Object.keys(groups).filter(k => !LOCATIONS.includes(k)).sort()];
    let out = header + '\n\n';
    for (const k of order) {
        out += k + '\n';
        out += groups[k].map((n, i) => { const t = ticks.get(n)!; const bus = t.type.has('Atraaf') && t.bus ? ` — Bus ${t.bus}` : ''; return `${i + 1}. ${n}${bus}`; }).join('\n') + '\n\n';
    }
    return out.trim();
}

export function drawHistogram(cv: HTMLCanvasElement, people: string[], st: (n: string) => Stat) {
    if (!cv.clientWidth) return;
    const g = cv.getContext('2d')!;
    const W = cv.width = cv.clientWidth, H = cv.height = cv.clientHeight;
    const rows = [...people].sort(natural).map(n => ({ name: n, ...st(n) }));
    const maxV = Math.max(1, ...rows.map(r => Math.max(r.FE1, r.FE2, r.Atraaf)));
    const padL = 34, padR = 8, padT = 12, padB = 46, chartW = W - padL - padR, chartH = H - padT - padB;
    g.clearRect(0, 0, W, H);
    g.fillStyle = '#fffdf8'; g.fillRect(0, 0, W, H);
    const steps = Math.min(5, maxV);
    for (let i = 0; i <= steps; i++) {
        const y = H - padB - (i / steps) * chartH;
        g.strokeStyle = i ? 'rgba(154,116,20,.18)' : '#9a7414'; g.beginPath(); g.moveTo(padL, y); g.lineTo(W - padR, y); g.stroke();
        g.fillStyle = '#6b5e4a'; g.font = '11px system-ui, sans-serif'; g.textAlign = 'right';
        g.fillText(String(Math.round((i / steps) * maxV)), padL - 6, y + 4);
    }
    const groupW = chartW / Math.max(1, rows.length), barW = Math.max(2, Math.min(14, groupW / 4));
    rows.forEach((r, idx) => {
        const x0 = padL + idx * groupW + (groupW - 3 * barW) / 2;
        [r.FE1, r.FE2, r.Atraaf].forEach((v, j) => { const h = (v / maxV) * (chartH - 2); g.fillStyle = ['#2e7dd1', '#23a56b', '#e3a92b'][j]; g.fillRect(x0 + j * barW, H - padB - h, barW - 1, h); });
        g.fillStyle = '#6b5e4a'; g.font = '10px system-ui, sans-serif'; g.textAlign = 'right';
        g.save(); g.translate(padL + idx * groupW + groupW / 2, H - padB + 8); g.rotate(-Math.PI / 4);
        g.fillText(r.name.length > 12 ? r.name.slice(0, 11) + '…' : r.name, 0, 0); g.restore();
    });
}

/* ----------------------------- Excel (.xls as HTML) ----------------------------- */
const esc = (s: unknown) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
const fmtShort = (iso: string) => { const d = new Date(iso); return `${pad(d.getDate())}-${d.toLocaleString(undefined, { month: 'short' })}`; };
function datesByPerson(people: string[], history: LogEntry[], types: Set<string>) {
    const m = new Map<string, string[]>(people.map(n => [n, []]));
    for (const r of [...history].sort((a, b) => a.ts.localeCompare(b.ts))) {
        if (!types.has(r.type)) continue;
        if (!m.has(r.person)) m.set(r.person, []);
        m.get(r.person)!.push(fmtShort(r.ts));
    }
    for (const [k, arr] of m) m.set(k, [...new Set(arr)]);
    return m;
}
function tableHTML(title: string, rows: [string, string[]][], cols: number) {
    const b = 'border:1px solid #000;';
    const th = `style="${b} font-weight:bold; text-align:center; padding:4px 6px;"`, td = `style="${b} padding:4px 6px;"`;
    let h = `<table cellspacing="0" cellpadding="0" style="border-collapse:collapse; ${b} width:100%;">`;
    h += `<tr><th colspan="${cols + 2}" style="${b} font-size:18px; color:#c00000; text-align:center;">${title}</th></tr>`;
    h += `<tr><th ${th}>SR NO.</th><th ${th}>NAME</th>${('<th ' + th + '>DATE</th>').repeat(cols)}</tr>`;
    rows.forEach(([name, dates], i) => {
        h += `<tr><td ${td} style="text-align:center;">${i + 1}</td><td ${td}>${esc(name)}</td>`;
        for (let c = 0; c < cols; c++) h += `<td ${td}>${dates[c] || ''}</td>`;
        h += '</tr>';
    });
    return h + '</table>';
}
/** FAKKUL EHRAAM (FE1 + FE2) and ATRAAF sheets, one row per name with the dates */
export function excelDoc(people: string[], history: LogEntry[], event: string, date: string) {
    const fe = datesByPerson(people, history, new Set(['FE1', 'FE2'])), at = datesByPerson(people, history, new Set(['Atraaf']));
    const feRows = people.map(n => [n, fe.get(n) || []] as [string, string[]]), atRows = people.map(n => [n, at.get(n) || []] as [string, string[]]);
    return `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
        <head><meta charset="utf-8"></head><body>
        <div style="font-family:Calibri,Arial; font-size:12px; margin:6px 0 10px;"><strong>Event:</strong> ${esc(event || '—')} | <strong>Date:</strong> ${esc(date || ymd(new Date()))}</div>
        ${tableHTML('FAKKUL EHRAAM', feRows, Math.max(14, ...feRows.map(r => r[1].length)))}
        <div style="height:16px"></div>
        ${tableHTML('ATRAAF', atRows, Math.max(14, ...atRows.map(r => r[1].length)))}
        </body></html>`;
}
