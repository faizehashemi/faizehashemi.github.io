// The printed key cards: a page of its own (opened in a new tab) so the screen's layout never decides the paper. A4 landscape, a fixed grid of
// cards per page chosen by the desk; every card has a fixed size, its text wraps inside it and is stepped down until it fits.
export const LAYOUTS = [
    { id: '2x2', cols: 2, rows: 2, label: '4 per page (2 × 2)' },
    { id: '3x2', cols: 3, rows: 2, label: '6 per page (3 × 2)' },
    { id: '3x3', cols: 3, rows: 3, label: '9 per page (3 × 3)' },
    { id: '4x3', cols: 4, rows: 3, label: '12 per page (4 × 3)' },
    { id: '4x4', cols: 4, rows: 4, label: '16 per page (4 × 4)' },
    { id: '5x4', cols: 5, rows: 4, label: '20 per page (5 × 4)' },
];

export type SheetCard = { name: string; pax: number; sh: string; building: string; at: string; part: boolean; rooms: [string, number][] };

const esc = (v: unknown) => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));

export function cardsSheet({ day, layout, site, cards }: { day: string; layout: string; site: string; cards: SheetCard[] }) {
    const L = LAYOUTS.find(l => l.id === layout) ?? LAYOUTS[2], per = L.cols * L.rows;
    const pages: SheetCard[][] = [];
    for (let i = 0; i < cards.length; i += per) pages.push(cards.slice(i, i + per));
    const card = (c: SheetCard) => `<article class="c"><div class="in">
        <div class="d">Departure Date: ${esc(day)}</div>
        <div class="n">${esc(c.name)} ${c.pax}pax</div>
        <div class="m">SH ${esc(c.sh)}${c.building ? ` · ${esc(c.building)}` : ''} · ${esc(c.at)}${c.part ? ' · these rooms only' : ''}</div>
        <div class="r">${c.rooms.map(([room, n]) => `<span><b>${esc(room)}</b> ×${n}<i></i></span>`).join('')}</div>
        <div class="t">${c.rooms.reduce((n, [, x]) => n + x, 0)} cards given</div></div></article>`;
    return `<!doctype html><html><head><meta charset="utf-8"><title>Room key cards ${esc(day)} — ${esc(site)}</title><style>
        @page { size: A4 landscape; margin: 8mm; }
        * { box-sizing: border-box; }
        html, body { margin: 0; padding: 0; background: #fff; color: #000; font-family: Arial, Helvetica, sans-serif; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        .pg { width: 281mm; height: 193mm; display: grid; grid-template-columns: repeat(${L.cols}, 1fr); grid-template-rows: repeat(${L.rows}, 1fr); gap: 2mm; overflow: hidden; }
        .pg + .pg { break-before: page; page-break-before: always; }
        .c { border: 1.2px solid #000; border-radius: 1.5mm; overflow: hidden; min-height: 0; min-width: 0; }
        .in { padding: 1.4mm 1.8mm; font-size: 10pt; line-height: 1.2; overflow-wrap: anywhere; }
        .d { font-size: .8em; font-weight: 700; border-bottom: 1px solid #999; padding-bottom: .5mm; margin-bottom: .8mm; }
        .n { font-weight: 800; }
        .m { font-size: .8em; color: #333; margin-bottom: 1mm; }
        .r { display: flex; flex-wrap: wrap; gap: .8mm 2.2mm; }
        .r span { white-space: nowrap; }
        .r i { display: inline-block; width: 5mm; height: 3.4mm; border: 1px solid #000; margin-left: 1mm; vertical-align: -0.6mm; }
        .t { font-size: .8em; margin-top: 1mm; border-top: 1px solid #999; padding-top: .5mm; font-weight: 700; }
        @media screen { body { padding: 8mm; background: #eee; } .pg { background: #fff; margin: 0 auto 8mm; outline: 1px solid #bbb; } }
    </style></head><body>${pages.map(p => `<section class="pg">${p.map(card).join('')}</section>`).join('')}
    <script>
        // step each card's text down until it fits its cell, then open the print dialog
        for (const c of document.querySelectorAll('.c')) {
            const inn = c.firstElementChild; let pt = ${L.cols >= 4 ? 8.5 : L.cols === 3 ? 9.5 : 11};
            inn.style.fontSize = pt + 'pt';
            while (pt > 4.5 && (inn.scrollHeight > c.clientHeight + 1 || inn.scrollWidth > c.clientWidth + 1)) { pt -= 0.25; inn.style.fontSize = pt + 'pt'; }
        }
        window.addEventListener('load', () => setTimeout(() => window.print(), 250));
    </script></body></html>`;
}
