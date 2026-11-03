// The printed key cards: a page of its own (opened in a new tab) so the screen's layout never decides the paper. A plain table — one row per room
// (the group's name, building and time on its first row, the SH on every row), a box to write the cards that came back, and a total row per group.
// Rows grow with their text and break cleanly between pages (the heading repeats on every page); nothing is fitted or resized by script, so no room
// number can be cut off at any print scale. (It used to be boxed cards whose room list was scaled to fit — rooms vanished at some scales.)
export const LAYOUTS = [
    { id: 'portrait', label: 'A4 portrait' },
    { id: 'landscape', label: 'A4 landscape' },
];

export type SheetCard = { bus?: string; name: string; pax: number; sh: string; building: string; at: string; part: boolean; rooms: [string, number][] };

const esc = (v: unknown) => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));

export function cardsSheet({ day, layout, site, cards }: { day: string; layout: string; site: string; cards: SheetCard[] }) {
    const landscape = layout === 'landscape';
    const total = cards.reduce((n, c) => n + c.rooms.reduce((m, [, x]) => m + x, 0), 0);
    const rows = cards.map((c, gi) => {
        const given = c.rooms.reduce((n, [, x]) => n + x, 0);
        const roomRows = c.rooms.map(([room, n], i) => `<tr class="${i === 0 ? 'first' : ''}">
            <td class="n">${i === 0 ? gi + 1 : ''}</td>
            <td class="g">${i === 0 ? `<b>${esc(c.name)}</b> · ${c.pax} pax${c.bus ? `<br><span class="bus">🚌 ${esc(c.bus)}</span>` : ''}${c.part ? '<br><small>these rooms only</small>' : ''}` : ''}</td>
            <td class="sh">${esc(c.sh)}</td>
            <td class="b">${i === 0 ? esc(c.building) : ''}</td>
            <td class="tm">${i === 0 ? esc(c.at) : ''}</td>
            <td class="rm">${esc(room)}</td>
            <td class="k">${n}</td>
            <td class="box"></td>
        </tr>`).join('');
        return `<tbody>${roomRows}<tr class="tot"><td></td><td colspan="5">Total for SH ${esc(c.sh)} — ${c.rooms.length} room${c.rooms.length === 1 ? '' : 's'}</td><td class="k">${given}</td><td class="box"></td></tr></tbody>`;
    }).join('');
    return `<!doctype html><html><head><meta charset="utf-8"><title>Room key cards ${esc(day)} — ${esc(site)}</title><style>
        @page { size: A4 ${landscape ? 'landscape' : 'portrait'}; margin: 10mm; }
        * { box-sizing: border-box; }
        html, body { margin: 0; padding: 0; background: #fff; color: #000; font: 10pt/1.3 Arial, Helvetica, sans-serif; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        h1 { font-size: 14pt; margin: 0 0 1mm; } p.sub { margin: 0 0 3mm; font-size: 9pt; color: #333; }
        table { width: 100%; border-collapse: collapse; table-layout: fixed; }
        thead { display: table-header-group; }   /* the heading on every page */
        th, td { border: 1px solid #000; padding: 1.4mm 1.6mm; vertical-align: top; text-align: left; overflow-wrap: anywhere; }
        th { background: #e8e8e8; font-size: 9pt; }
        tr { break-inside: avoid; page-break-inside: avoid; }
        tr.first td { border-top: 2px solid #000; }
        td.n, td.k, th.k { text-align: center; } td.n { color: #555; }
        td.rm { font-weight: 800; font-size: 12pt; white-space: nowrap; }
        td.sh { font-size: 9pt; white-space: nowrap; } td.tm { white-space: nowrap; } td.b { font-size: 9pt; overflow-wrap: normal; word-break: normal; }
        td.k { font-weight: 700; font-size: 11pt; }
        td.box { background: #fff; }
        tr.tot td { background: #f3f3f3; font-weight: 700; font-size: 9pt; }
        small { font-weight: 400; color: #444; }
        .bus { display: inline-block; margin-top: .6mm; padding: 0 1.4mm; border: 1px solid #000; border-radius: 1mm; font-weight: 700; }
        @media screen { body { padding: 10mm; background: #eee; } .page { background: #fff; padding: 8mm; max-width: ${landscape ? 297 : 210}mm; margin: 0 auto; } }
    </style></head><body><div class="page">
        <h1>Room key cards — departure ${esc(day)}</h1>
        <p class="sub">${esc(site)} · ${cards.length} group${cards.length === 1 ? '' : 's'} · ${total} cards given · write the cards that came back in the last column</p>
        <table>
            <colgroup><col style="width:5%"><col style="width:${landscape ? 29 : 25}%"><col style="width:10%"><col style="width:${landscape ? 14 : 14}%"><col style="width:8%"><col style="width:${landscape ? 12 : 13}%"><col style="width:${landscape ? 9 : 11}%"><col style="width:${landscape ? 13 : 14}%"></colgroup>
            <thead><tr><th>#</th><th>Group · leader</th><th>SH</th><th>Building</th><th>Time</th><th>Room</th><th class="k">Cards given</th><th class="k">Cards back</th></tr></thead>
            ${rows || '<tbody><tr><td colspan="8">No group leaves on this day.</td></tr></tbody>'}
        </table>
    </div>
    <script>window.addEventListener('load', () => setTimeout(() => window.print(), 250));</script></body></html>`;
}
