// Laundry admin → Bills → Staff: the printed bills of staff in paid mode (1 SAR a piece) — one bill on A5, or every unpaid bill as an A4 statement,
// person by person. Opened in a print tab (Save as PDF works too).
type Row = Record<string, any>;
const esc = (v: unknown) => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string));
const sar = (h: number) => (h / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const dt = (iso: string) => new Date(iso).toLocaleString('en-GB', { timeZone: 'Asia/Riyadh', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
const day = (d: string) => new Date(`${d}T12:00`).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
const FONTS = `<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,700;9..144,900&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">`;
const BASE = `* { box-sizing: border-box; } html, body { margin: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
body { font: 10pt/1.45 Inter, "Segoe UI", Arial, sans-serif; color: #1c1917; background: #efe9dc; }
.sheet { background: #fffdf8; margin: 0 auto; position: relative; overflow: hidden; }
@media screen { .sheet { margin: 16px auto; box-shadow: 0 10px 40px #0003; } }
.band { position: relative; color: #fff; background: radial-gradient(130% 160% at 100% 0%, #8a6a1f 0%, #0b1020 58%); overflow: hidden; }
.band::after { content: ""; position: absolute; right: -18mm; bottom: -26mm; width: 70mm; height: 70mm; border-radius: 50%; border: 1px solid #ffffff2e; box-shadow: 0 0 0 7mm #ffffff09, 0 0 0 14mm #ffffff06; }
.eyebrow { font: 600 7.5pt Inter, sans-serif; letter-spacing: .34em; text-transform: uppercase; color: #f5d78e; }
.band h1 { font: 900 22pt/1.05 Fraunces, Georgia, serif; margin: 2mm 0 1mm; }
.gold { height: 2px; background: linear-gradient(90deg, #f5d78e, transparent); margin-top: 4mm; width: 40mm; }
.lbl { font: 600 7pt Inter, sans-serif; letter-spacing: .16em; text-transform: uppercase; color: #8b8378; }
.val { font: 700 12pt Fraunces, Georgia, serif; color: #0b1020; }
table.t { width: 100%; border-collapse: collapse; }
table.t th { font: 700 7pt Inter, sans-serif; letter-spacing: .1em; text-transform: uppercase; color: #fff; background: #0b1020; padding: 2mm 2.5mm; text-align: left; }
table.t td { padding: 1.8mm 2.5mm; border-bottom: 1px solid #e7e0d2; }
table.t tbody tr:nth-child(even) td { background: #faf6ee; }
table.t .n { text-align: right; font-variant-numeric: tabular-nums; }
.stamp { display: inline-block; padding: 1mm 4mm; border: 2px solid currentColor; border-radius: 2mm; font: 900 12pt Fraunces, Georgia, serif; letter-spacing: .12em; transform: rotate(-6deg); }
.stamp.paid { color: #0a7a3a; } .stamp.unpaid { color: #b91c1c; }
.sign { display: grid; grid-template-columns: 1fr 1fr; gap: 10mm; margin-top: 12mm; } .sign div { border-top: 1px solid #1c1917; padding-top: 1.5mm; font-size: 8pt; color: #57534e; }`;

const items = (b: Row) => (b.lines || []).map((l: Row) => `<tr><td>${esc(l.name)}</td><td class="n">${l.qty}</td><td class="n">${sar(l.price)}</td><td class="n"><b>${sar(l.amount)}</b></td></tr>`).join('');
const who = (b: Row) => b.staff_name || b.customer?.name || 'Staff';

/** One staff bill on A5 */
export function staffBillHtml(b: Row, site: string) {
    const paid = !!b.settled_at;
    return `<!doctype html><html><head><meta charset="utf-8"><title>${esc(b.receipt_no)}</title>${FONTS}<style>@page { size: A5 portrait; margin: 0; } ${BASE}
.sheet { width: 148mm; min-height: 209mm; padding: 0 0 9mm; } .band { padding: 10mm 10mm 9mm; } .body { padding: 0 10mm; }
.no { font: 800 13pt/1.1 "JetBrains Mono", Consolas, monospace; color: #fde7b0; letter-spacing: .02em; word-break: break-all; }
.card { margin: -6mm 0 5mm; position: relative; z-index: 1; background: #fff; border-radius: 3mm; box-shadow: 0 2mm 6mm #0b10201f; padding: 4mm 5mm; display: grid; grid-template-columns: 1.4fr 1fr; gap: 3mm 6mm; border-top: 1.2mm solid #b8912f; }
.tot { display: flex; align-items: center; justify-content: space-between; margin: 5mm 0 0; padding: 4mm 5mm; border-radius: 3mm; background: #0b1020; color: #fff; }
.tot b { font: 900 20pt Fraunces, Georgia, serif; color: #f5d78e; } .tot span { font: 600 8pt Inter, sans-serif; letter-spacing: .2em; text-transform: uppercase; }
.meta { display: flex; justify-content: space-between; align-items: center; margin-top: 5mm; }
.foot { margin: 8mm 10mm 0; font-size: 7pt; color: #a8a29e; text-align: center; letter-spacing: .08em; }</style></head><body>
<div class="sheet"><div class="band"><div class="eyebrow">Mohammedi Makan · ${esc(site)} · Laundry</div><h1>Staff Laundry Invoice</h1><div class="no">${esc(b.receipt_no)}</div><div class="gold"></div></div>
<div class="body"><div class="card"><div><div class="lbl">Billed to</div><div class="val">${esc(who(b))}</div></div><div><div class="lbl">Room</div><div class="val">${esc(b.customer?.room || '—')}</div></div>
<div><div class="lbl">Date</div><div class="val" style="font-size:10pt">${esc(dt(b.given_at || b.created_at))}</div></div><div><div class="lbl">Pieces</div><div class="val">${b.items}</div></div></div>
<table class="t"><thead><tr><th>Item</th><th class="n">Qty</th><th class="n">Rate SAR</th><th class="n">Amount SAR</th></tr></thead><tbody>${items(b)}</tbody></table>
<div class="tot"><span>Total due · 1 SAR a piece</span><b>${sar(b.paid)} SAR</b></div>
<div class="meta"><span class="stamp ${paid ? 'paid' : 'unpaid'}">${paid ? 'PAID' : 'UNPAID'}</span><span style="font-size:8pt;color:#57534e">${paid ? `Paid ${esc(dt(b.settled_at))}${b.settled_by ? ' · ' + esc(b.settled_by) : ''}` : `Taken by ${esc(b.worker || '')}`}</span></div>
<div class="sign"><div>Staff signature</div><div>Laundry admin</div></div></div>
<div class="foot">Thank you · Keep this invoice until it is settled</div></div></body></html>`;
}

/** Every unpaid staff bill: an A4 statement, person by person, with each person's total and the grand total */
export function staffStatementHtml(bills: Row[], site: string) {
    const by = new Map<string, Row[]>();
    for (const b of bills) { const k = `${b.staff_id}`; by.set(k, [...(by.get(k) || []), b]); }
    const people = [...by.values()].map(list => ({ name: who(list[0]), room: list[0].customer?.room || '', list: [...list].sort((a, z) => a.given_at.localeCompare(z.given_at)) }))
        .sort((a, z) => a.name.localeCompare(z.name));
    const total = bills.reduce((n, b) => n + b.paid, 0), pcs = bills.reduce((n, b) => n + b.items, 0);
    const made = new Date().toLocaleString('en-GB', { timeZone: 'Asia/Riyadh', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    return `<!doctype html><html><head><meta charset="utf-8"><title>Unpaid staff laundry · ${esc(site)}</title>${FONTS}<style>@page { size: A4 portrait; margin: 12mm 12mm 14mm; } ${BASE}
.sheet { max-width: 186mm; padding: 0 0 8mm; } .band { padding: 13mm 12mm 12mm; } .band h1 { font-size: 30pt; } .body { padding: 0 12mm; }
.kpis { display: grid; grid-template-columns: repeat(3, 1fr); gap: 3mm; margin: -7mm 0 7mm; position: relative; z-index: 1; }
.kpi { background: #fff; border-radius: 3mm; box-shadow: 0 2mm 6mm #0b10201f; padding: 4mm; border-top: 1.2mm solid #b8912f; } .kpi b { display: block; font: 800 20pt/1.1 Fraunces, Georgia, serif; color: #0b1020; }
.person { break-inside: avoid; margin: 0 0 7mm; border: 1px solid #e7e0d2; border-radius: 3mm; overflow: hidden; }
.ph { display: flex; justify-content: space-between; align-items: baseline; padding: 3mm 4mm; background: linear-gradient(90deg, #f5ecd7, #fffdf8); border-bottom: 1px solid #e7e0d2; }
.ph h2 { margin: 0; font: 800 14pt Fraunces, Georgia, serif; color: #0b1020; } .ph span { color: #57534e; font-size: 8.5pt; }
.ph b { font: 800 13pt Fraunces, Georgia, serif; color: #8a6a1f; }
.grand { display: flex; justify-content: space-between; align-items: center; padding: 5mm 6mm; border-radius: 3mm; background: #0b1020; color: #fff; margin-top: 4mm; break-inside: avoid; }
.grand b { font: 900 24pt Fraunces, Georgia, serif; color: #f5d78e; } .grand span { font: 600 8pt Inter, sans-serif; letter-spacing: .22em; text-transform: uppercase; }
.foot { margin: 8mm 12mm 0; padding-top: 3mm; border-top: 1px solid #e7e0d2; display: flex; justify-content: space-between; font-size: 7.5pt; color: #a8a29e; }</style></head><body>
<div class="sheet"><div class="band"><div class="eyebrow">Mohammedi Makan · ${esc(site)} · Laundry</div><h1>Unpaid Staff Laundry</h1><div style="font:500 12pt Fraunces,Georgia,serif;color:#fde7b0">Statement as of ${esc(made)}</div><div class="gold"></div></div>
<div class="body"><div class="kpis"><div class="kpi"><b>${sar(total)}</b><span class="lbl">SAR due</span></div><div class="kpi"><b>${people.length}</b><span class="lbl">Staff</span></div><div class="kpi"><b>${pcs}</b><span class="lbl">Pieces · ${bills.length} bills</span></div></div>
${people.map(p => `<div class="person"><div class="ph"><div><h2>${esc(p.name)}</h2><span>${p.room ? 'Room ' + esc(p.room) + ' · ' : ''}${p.list.length} bill${p.list.length === 1 ? '' : 's'} · ${p.list.reduce((n, b) => n + b.items, 0)} pieces</span></div><b>${sar(p.list.reduce((n, b) => n + b.paid, 0))} SAR</b></div>
<table class="t"><thead><tr><th>Receipt</th><th>Date</th><th class="n">Pieces</th><th class="n">SAR</th></tr></thead><tbody>${p.list.map(b => `<tr><td style="font-family:Consolas,monospace;font-size:8.5pt">${esc(b.receipt_no)}</td><td>${esc(day(b.day))}</td><td class="n">${b.items}</td><td class="n"><b>${sar(b.paid)}</b></td></tr>`).join('')}</tbody></table></div>`).join('') || '<p>No unpaid staff bills.</p>'}
<div class="grand"><span>Grand total due</span><b>${sar(total)} SAR</b></div>
<div class="sign"><div>Prepared by</div><div>Laundry admin</div></div></div>
<div class="foot"><span>Staff laundry · 1 SAR a piece</span><span>${esc(site)}</span></div></div></body></html>`;
}

export function printHtml(html: string) {
    const w = window.open('', '_blank');
    if (!w) return false;
    w.document.open();
    w.document.write(html.replace('</body>', '<script>(async function(){try{await document.fonts.ready}catch(e){}setTimeout(function(){window.focus();window.print()},400)})()<\/script></body>'));
    w.document.close();
    return true;
}
