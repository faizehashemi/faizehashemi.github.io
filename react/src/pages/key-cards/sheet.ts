// The printed key cards: a page of its own (opened in a new tab) so the screen's layout never decides the paper. A plain, compact table — one row per
// group, its rooms in one cell ("501 ×4  502 ×2"), the cards given and a box to write the cards that came back; a total at the end.
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
        return `<tr>
            <td class="n">${gi + 1}</td>
            <td class="g"><b>${esc(c.name)}</b> · ${c.pax} pax${c.bus ? `<br><span class="bus">🚌 ${esc(c.bus)}</span>` : ''}${c.part ? '<br><small>these rooms only</small>' : ''}</td>
            <td class="sh">${esc(c.sh)}</td>
            <td class="b">${esc(c.building)}</td>
            <td class="tm">${esc(c.at)}</td>
            <td class="rm">${c.rooms.map(([room, n]) => `<span><b>${esc(room)}</b> ×${n}</span>`).join(' ')}</td>
            <td class="k">${given}</td>
            <td class="box"></td>
        </tr>`;
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
        td.n, td.k, th.k { text-align: center; } td.n { color: #555; }
        td.rm { font-size: 10pt; line-height: 1.5; } td.rm span { display: inline-block; white-space: nowrap; margin-right: 2.2mm; } td.rm b { font-weight: 800; font-size: 11pt; }
        td.sh { font-size: 9pt; white-space: nowrap; } td.tm { font-size: 9pt; } td.g { font-size: 9pt; } td.b { font-size: 9pt; overflow-wrap: normal; word-break: normal; }
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
            <colgroup><col style="width:4%"><col style="width:${landscape ? 25 : 23}%"><col style="width:${landscape ? 7 : 8}%"><col style="width:${landscape ? 10 : 12}%"><col style="width:${landscape ? 7 : 9}%"><col style="width:${landscape ? 34 : 29}%"><col style="width:6%"><col style="width:${landscape ? 7 : 9}%"></colgroup>
            <thead><tr><th>#</th><th>Group · leader</th><th>SH</th><th>Building</th><th>Time</th><th>Rooms × cards</th><th class="k">Given</th><th class="k">Back</th></tr></thead>
            <tbody>${rows || '<tr><td colspan="8">No group leaves on this day.</td></tr>'}${rows ? `<tr class="tot"><td></td><td colspan="5">Total — ${cards.length} group${cards.length === 1 ? '' : 's'}, ${cards.reduce((n, c) => n + c.rooms.length, 0)} rooms</td><td class="k">${total}</td><td class="box"></td></tr>` : ''}</tbody>
        </table>
    </div>
    <script>window.addEventListener('load', () => setTimeout(() => window.print(), 250));</script></body></html>`;
}
