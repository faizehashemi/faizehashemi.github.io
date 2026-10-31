// The passport release slip: a note from Accounts to the reception — the group's dues are cleared, please hand back their passports.
// Printed in a tab of its own (A5 landscape) that opens the print dialog.
type Row = Record<string, any>;

const esc = (s: unknown) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string));
const dmy = (d?: string) => (d ? d.split('-').reverse().join('/') : '—');

/** "501, 502, 601" — every room of the slip, gents then ladies */
export const roomList = (s: Row): string[] => [...new Set(['gents', 'ladies'].flatMap(k => (s.rooms?.[k] || []).map((r: Row) => String(r.room_no || '').trim()).filter(Boolean)))];
export const paxOf = (s: Row) => Number(s.total) || ['gents', 'ladies', 'children', 'infants'].reduce((n, k) => n + (Number(s[k]) || 0), 0);

export function passportSlipHTML(s: Row, site: string, printedAt: Date) {
    const rooms = roomList(s);
    const when = printedAt.toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    const line = (k: string, v: string) => `<div><span>${esc(k)}</span><b>${esc(v || '—')}</b></div>`;
    return `<!doctype html><html><head><meta charset="utf-8"><title>Passport release — SH ${esc(s.sh_no)}</title><style>
        @page { size: A5 landscape; margin: 8mm; }
        * { box-sizing: border-box; }
        html, body { margin: 0; background: #fff; color: #000; font-family: Arial, Helvetica, sans-serif; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        .slip { width: 100%; min-height: 130mm; border: 2px solid #000; border-radius: 3mm; padding: 6mm 8mm; display: flex; flex-direction: column; gap: 4mm; }
        .head { display: flex; justify-content: space-between; align-items: baseline; border-bottom: 2px solid #000; padding-bottom: 3mm; }
        .head h1 { margin: 0; font-size: 20pt; letter-spacing: .04em; }
        .head small { font-size: 9.5pt; color: #333; text-align: right; }
        .to { font-size: 12pt; }
        .grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 3mm 6mm; }
        .grid div { border-bottom: 1px dotted #777; padding-bottom: 1.2mm; }
        .grid .w2 { grid-column: span 2; } .grid .w3 { grid-column: span 3; }
        .grid span { display: block; font-size: 8pt; letter-spacing: .1em; text-transform: uppercase; color: #444; }
        .grid b { font-size: 13pt; }
        .msg { border: 2px solid #000; border-radius: 2mm; padding: 4mm 5mm; font-size: 13pt; line-height: 1.45; text-align: center; font-weight: 700; }
        .sign { margin-top: auto; display: grid; grid-template-columns: 1fr 1fr; gap: 12mm; font-size: 9.5pt; }
        .sign div { border-top: 1.5px solid #000; padding-top: 1.5mm; text-align: center; }
        .bar { position: sticky; top: 0; display: flex; gap: 10px; align-items: center; padding: 10px 16px; background: #fffaf1; border-bottom: 1px solid #dcc7a4; font: 14px system-ui, sans-serif; z-index: 1; }
        .bar button { font: inherit; padding: 6px 14px; border: 1px solid #d4af37; border-radius: 8px; background: #d4af37; color: #fff; font-weight: 700; cursor: pointer; }
        @media screen { body { background: #e9e6df; } .slip { width: 210mm; margin: 10mm auto; background: #fff; box-shadow: 0 4px 16px rgba(0,0,0,.15); } }
        @media print { .bar { display: none; } }
    </style></head><body>
    <div class="bar"><button type="button" onclick="window.print()">Print</button><span>A5 landscape</span></div>
    <div class="slip">
        <div class="head"><h1>PASSPORT RELEASE SLIP</h1><small>${esc(site)}<br>Printed ${esc(when)}</small></div>
        <div class="to"><b>To: Reception</b></div>
        <div class="grid">
            ${line('SH No.', String(s.sh_no ?? ''))}${line('Pax', String(paxOf(s) || ''))}${line('Building', String(s.building || ''))}
            <div class="w3"><span>Group</span><b>${esc(s.tour_name || '—')}</b></div>
            <div class="w2"><span>Group leader</span><b>${esc(String(s.group_leader || '').trim() || '—')}</b></div>
            ${line('Check-out', `${dmy(s.checkout_date)} ${s.checkout_time || ''}`.trim())}
            <div class="w3"><span>Rooms</span><b>${esc(rooms.join(', ') || '—')}</b></div>
        </div>
        <div class="msg">Please hand over the passports of this group.<br>Their dues are cleared by Accounts.</div>
        <div class="sign"><div>Accounts — name &amp; signature</div><div>Reception — passports handed over (date &amp; signature)</div></div>
    </div>
    <script>window.addEventListener('load', function () { setTimeout(function () { window.focus(); window.print(); }, 250); });<\/script>
    </body></html>`;
}

export function printPassportSlip(s: Row, site: string) {
    const w = window.open('', '_blank');
    if (!w) return false;
    w.document.open(); w.document.write(passportSlipHTML(s, site, new Date())); w.document.close();
    return true;
}
