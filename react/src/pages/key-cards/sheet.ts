// The printed key cards: a page of its own (opened in a new tab) so the screen's layout never decides the paper. The desks' own sheet: one block per group —
// Departure Date, SH No. and Group Leader, the group and its pax, then the rooms eight to a line with the cards of each room under it, and BUS with its number
// in the bottom right corner. Every block is a plain table of fixed columns: lines grow with their text and blocks never split over a page; nothing is fitted
// or resized by script, so no room number can be cut off at any print scale.
export const LAYOUTS = [
    { id: 'portrait', label: 'A4 portrait' },
    { id: 'landscape', label: 'A4 landscape' },
];

export type SheetCard = { group: string; leader: string; pax: number; sh: string; part: boolean; rooms: [string, number][]; busWord: string; busNo: string };

const COLS = 8;
const esc = (v: unknown) => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));

/** The rooms in lines of eight; the last line keeps its last column free for BUS (eight rooms exactly: an empty line follows, as on the desks' sheet). */
export function roomLines(rooms: [string, number][]) {
    const lines: [string, number][][] = [];
    for (let i = 0; i < rooms.length; i += COLS) lines.push(rooms.slice(i, i + COLS));
    if (!lines.length || lines[lines.length - 1].length === COLS) lines.push([]);
    return lines;
}

function block(c: SheetCard, day: string) {
    const lines = roomLines(c.rooms);
    const body = lines.map((line, li) => {
        const last = li === lines.length - 1, free = COLS - line.length - (last ? 1 : 0);
        const gap = (span: number) => (span > 0 ? `<td class="gap" colspan="${span}" rowspan="2"></td>` : '');
        return `<tr class="rn">${line.map(([room]) => `<td>${esc(room)}</td>`).join('')}${gap(free)}${last ? `<td class="bw">${esc(c.busWord)}</td>` : ''}</tr>
            <tr class="rc">${line.map(([, n]) => `<td>${n}</td>`).join('')}${last ? `<td class="bn">${esc(c.busNo)}</td>` : ''}</tr>`;
    }).join('');
    return `<table class="kc"><colgroup>${'<col>'.repeat(COLS)}</colgroup><tbody>
        <tr class="top"><td colspan="4">Departure Date -</td><td colspan="4">${esc(day)}</td></tr>
        <tr class="sh"><td colspan="2">SH NO.</td><td colspan="2">${esc(c.sh)}</td><td colspan="2">Group Leader</td><td colspan="2" class="ld">${esc(c.leader) || '-'}</td></tr>
        <tr class="gr"><td colspan="6">${esc(c.group) || '-'}${c.part ? ' <small>(these rooms only)</small>' : ''}</td><td colspan="2">${c.pax}</td></tr>
        ${body}</tbody></table>`;
}

export function cardsSheet({ day, layout, site, cards }: { day: string; layout: string; site: string; cards: SheetCard[] }) {
    const landscape = layout === 'landscape';
    return `<!doctype html><html><head><meta charset="utf-8"><title>Room key cards ${esc(day)} — ${esc(site)}</title><style>
        @page { size: A4 ${landscape ? 'landscape' : 'portrait'}; margin: 8mm; }
        * { box-sizing: border-box; }
        html, body { margin: 0; padding: 0; background: #fff; color: #000; font: 700 12pt/1.2 "Times New Roman", Times, serif; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        table.kc { width: 100%; border-collapse: collapse; table-layout: fixed; margin: 0 0 4.5mm; break-inside: avoid; page-break-inside: avoid; }
        .kc td { border: 1px solid #000; padding: .6mm 1mm; text-align: center; vertical-align: middle; overflow-wrap: anywhere; }
        tr.top td { background: #bfbfbf; font-size: 13pt; } tr.sh td { background: #d9d9d9; font-size: 13pt; } tr.sh td.ld { background: #f2f2f2; font-size: 11pt; }
        tr.gr td { background: #f2f2f2; font-size: 13pt; } small { font-size: 9pt; font-weight: 400; }
        tr.rn td { font-size: 17pt; } tr.rc td { font-size: 12pt; }
        td.gap { background: #fff; }
        tr.rn td.bw { background: #d9d9d9; font-size: 15pt; } tr.rc td.bn { background: #d9d9d9; font-size: 18pt; }
        p.none { font: 400 11pt Arial, sans-serif; }
        @media screen { body { padding: 8mm; background: #eee; } .page { background: #fff; padding: 8mm; max-width: ${landscape ? 297 : 210}mm; margin: 0 auto; } }
    </style></head><body><div class="page">${cards.map(c => block(c, day)).join('') || '<p class="none">No group leaves on this day.</p>'}</div>
    <script>window.addEventListener('load', () => setTimeout(() => window.print(), 250));</script></body></html>`;
}
