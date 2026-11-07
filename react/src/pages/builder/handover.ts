// The room hand-over form: filled when rented rooms go back to the hotel with their key cards — the rooms in three columns, the total, name and sign.
const esc = (v: unknown) => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));

/** Rooms in three columns, filled top to bottom, ten deep (deeper when more than thirty rooms go back), as on the paper form. */
export function formColumns(rooms: string[]) {
    const depth = Math.max(10, Math.ceil(rooms.length / 3));
    return [0, 1, 2].map(c => rooms.slice(c * depth, (c + 1) * depth));
}

export function handoverForm({ building, at, rooms }: { building: string; at: string; rooms: string[] }) {
    const [date, time] = at.split('T');
    const hm = (() => { const [h, m] = time.split(':').map(Number); return `${String(h % 12 || 12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`; })();
    const cols = formColumns(rooms), depth = Math.max(...cols.map(c => c.length));
    const rows = Array.from({ length: depth }, (_, i) => `<tr>${cols.map(c => `<td>${esc(c[i] ?? '')}</td>`).join('')}</tr>`).join('');
    return `<!doctype html><html><head><meta charset="utf-8"><title>Room hand-over ${esc(building)} ${esc(date)}</title><style>
        @page { size: A4 portrait; margin: 12mm; }
        * { box-sizing: border-box; }
        html, body { margin: 0; background: #fff; color: #000; font: 700 12pt/1.3 Arial, Helvetica, sans-serif; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        table { width: 100%; border-collapse: collapse; table-layout: fixed; }
        td { border: 1.2px solid #000; padding: 3mm 2mm; text-align: center; overflow-wrap: anywhere; }
        .h td { font-size: 14pt; padding: 4.5mm 2mm; } .gap td { height: 11mm; } .sign td { height: 30mm; }
        .tot td:last-child { width: 33.33%; }
        @media screen { body { padding: 10mm; background: #eee; } .page { background: #fff; padding: 8mm; max-width: 190mm; margin: 0 auto; } }
    </style></head><body><div class="page">
        <table><tbody><tr class="h"><td>ROOM KEY'S HAND OVER TO HOTEL ${esc(building)}</td></tr><tr><td>DATE :- ${esc(date.split('-').reverse().join('/'))}</td></tr><tr><td>TIME :- ${esc(hm)}</td></tr></tbody></table>
        <table><tbody>${rows}</tbody></table>
        <table><tbody><tr class="gap"><td></td></tr></tbody></table>
        <table><tbody><tr class="tot"><td>TOTAL</td><td>${rooms.length}</td></tr><tr class="sign"><td>NAME AND SIGN</td><td></td></tr></tbody></table>
    </div><script>window.addEventListener('load', () => setTimeout(() => window.print(), 250));</script></body></html>`;
}
