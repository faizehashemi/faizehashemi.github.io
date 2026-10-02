// Laundry admin (PC): cash bills (from → to; mark Paid one by one, by selection or by the amount the worker
// handed over — audited; open a bill to edit / cancel / reprint), reports, staff-only laundry (dashboard,
// register, staff history), prices (clothes and building linen, with pictures), staff profiles (photo, limits)
// and the laundry notice. Admin logins change things; viewer logins only look. Exports: Excel and PDF.

import { request, currentDesk, UserError } from '../../core/cloud.js';
import { loadScript, LIBS } from '../../core/lib.js';
import { sar, esc, jeddahDay, jeddahTime, jeddahDate, STATUS, DEFAULT_INFO, itemPic, shrinkImage, receiptHTML, printReceipt, RECEIPT_CSS } from '../../core/laundry.js';

const DAY = 864e5;
const addDays = (ymd, n) => jeddahDay(Date.parse(ymd + 'T12:00:00+03:00') + n * DAY);
const weekday = (ymd) => new Date(Date.parse(ymd + 'T12:00:00+03:00')).getUTCDay(); // 0 = Sunday
const fmtDay = (ymd) => new Date(ymd + 'T12:00:00+03:00').toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short' });

function presets() {
    const t = jeddahDay(), ws = addDays(t, -weekday(t)); // week starts Sunday
    const ms = t.slice(0, 8) + '01', lmEnd = addDays(ms, -1), lms = lmEnd.slice(0, 8) + '01';
    return {
        today: ['Today', t, t], yesterday: ['Yesterday', addDays(t, -1), addDays(t, -1)], week: ['This week', ws, t],
        lastweek: ['Last week', addDays(ws, -7), addDays(ws, -1)], month: ['This month', ms, t], lastmonth: ['Last month', lms, lmEnd],
    };
}

export default async function mount(ctx) {
    const $ = (id) => ctx.root.querySelector('#' + id);
    const site = ctx.siteId;
    const me = currentDesk();
    const isAdmin = me?.role === 'admin';
    const S = { tab: 'bills', items: [], staff: [], cats: [], info: DEFAULT_INFO, ranges: {} };
    const rcss = document.createElement('style'); rcss.textContent = RECEIPT_CSS; document.head.appendChild(rcss);
    if (!isAdmin) ctx.root.querySelectorAll('[data-admin]').forEach(b => { b.hidden = true; });
    $('laSub').textContent = `${ctx.site.label} · ${isAdmin ? 'admin' : 'view only'}`;

    const api = (m, p, b) => ctx.guard(request(m, p, b));
    const loadItems = async () => { S.items = (await api('GET', `/api/laundry/items?site=${site}`)).items; };
    // deleted profiles come too: their photos still show in the register and histories, never in the Staff list
    const loadStaff = async () => { S.staff = (await api('GET', `/api/laundry/staff?site=${site}&deleted=1`)).staff; };
    const billsIn = async (from, to) => (await api('GET', `/api/laundry/bills?site=${site}&from=${from}&to=${to}`));
    const who = (b) => b.kind === 'free' ? `👷 ${esc(b.staff_name)}` : b.kind === 'building' ? `🏨 Building linen${b.customer?.building ? ' · ' + esc(b.customer.building) : ''}` : esc([b.customer?.building, b.customer?.room].filter(Boolean).join(' · ') || b.customer?.name || '—');
    const staffPhoto = (id, cls = 'la-thumb') => { const s = S.staff.find(x => x.id === id); return s?.photo ? `<img class="${cls}" src="${s.photo}" alt="">` : `<span class="${cls} none">👤</span>`; };
    const errBox = (e) => `<p class="la-err">${esc(e?.message || String(e))}</p>`;

    /* ------------------------------ tabs ------------------------------ */
    function showTab(tab) {
        S.tab = tab;
        ctx.root.querySelectorAll('.la-tabs [data-tab]').forEach(b => b.setAttribute('aria-selected', String(b.dataset.tab === tab)));
        ctx.root.querySelectorAll('.la-pane').forEach(p => { p.hidden = p.id !== 'tab-' + tab; });
        ({ reports: drawReports, bills: drawBills, free: drawFree, prices: drawPrices, staff: drawStaff, notice: drawNotice })[tab]();
    }
    ctx.root.querySelector('.la-tabs').addEventListener('click', (e) => { const b = e.target.closest('[data-tab]'); if (b) showTab(b.dataset.tab); });

    // date range pickers (presets + custom), one per tab
    function rangeUI(key, onChange, def = 'today') {
        const box = ctx.root.querySelector(`.la-range[data-range="${key}"]`);
        const P = presets();
        if (!S.ranges[key]) S.ranges[key] = { preset: def, from: P[def][1], to: P[def][2] };
        const r = S.ranges[key];
        box.innerHTML = Object.entries(P).map(([k, [l]]) => `<button type="button" data-p="${k}" aria-pressed="${r.preset === k}">${l}</button>`).join('')
            + `<span class="la-custom"><input type="date" data-f value="${r.from}"> → <input type="date" data-t value="${r.to}"></span>`;
        box.onclick = (e) => { const b = e.target.closest('[data-p]'); if (!b) return; const [, f, t] = P[b.dataset.p]; Object.assign(r, { preset: b.dataset.p, from: f, to: t }); rangeUI(key, onChange, def); onChange(); };
        box.onchange = (e) => { if (e.target.matches('[data-f],[data-t]')) { r.preset = 'custom'; r.from = box.querySelector('[data-f]').value || r.from; r.to = box.querySelector('[data-t]').value || r.to; if (r.to < r.from) r.to = r.from; rangeUI(key, onChange, def); onChange(); } };
        return r;
    }

    /* ------------------------------ stats ------------------------------ */
    function stats(bills) {
        const live = bills.filter(b => !b.voided && b.kind !== 'building'), paid = live.filter(b => b.kind === 'paid'), free = live.filter(b => b.kind === 'free');
        const sum = (a, f) => a.reduce((n, b) => n + f(b), 0);
        const custKey = (b) => `${String(b.customer?.room || '').toUpperCase()}|${String(b.customer?.name || '').toLowerCase()}`;
        const byWorker = new Map();
        for (const b of live) {
            const w = byWorker.get(b.worker) || { worker: b.worker, bills: 0, items: 0, cash: 0, card: 0, other: 0, total: 0, free_bills: 0, free_items: 0, free_value: 0 };
            if (b.kind === 'paid') { w.bills++; w.items += b.items; w[b.method] = (w[b.method] || 0) + b.paid; w.total += b.paid; }
            else { w.free_bills++; w.free_items += b.items; w.free_value += b.value; }
            byWorker.set(b.worker, w);
        }
        const byItem = new Map();
        for (const b of live) for (const l of b.lines) {
            const it = byItem.get(l.name) || { name: l.name, qty: 0, revenue: 0, free_qty: 0, free_value: 0 };
            if (b.kind === 'paid') { it.qty += l.qty; it.revenue += l.amount; } else { it.free_qty += l.qty; it.free_value += l.amount; }
            byItem.set(l.name, it);
        }
        const byStaff = new Map();
        for (const b of free) {
            const s = byStaff.get(b.staff_id) || { staff_id: b.staff_id, name: b.staff_name, bills: 0, items: 0, value: 0 };
            s.bills++; s.items += b.items; s.value += b.value;
            byStaff.set(b.staff_id, s);
        }
        const byDay = new Map();
        for (const b of live) {
            const d = byDay.get(b.day) || { day: b.day, sales: 0, bills: 0, items: 0, free_items: 0, free_value: 0, customers: new Set() };
            if (b.kind === 'paid') { d.sales += b.paid; d.bills++; d.items += b.items; d.customers.add(custKey(b)); } else { d.free_items += b.items; d.free_value += b.value; }
            byDay.set(b.day, d);
        }
        return {
            paid: { customers: new Set(paid.map(custKey)).size, bills: paid.length, items: sum(paid, b => b.items), sales: sum(paid, b => b.paid),
                cash: sum(paid.filter(b => b.method === 'cash'), b => b.paid), card: sum(paid.filter(b => b.method === 'card'), b => b.paid), other: sum(paid.filter(b => b.method === 'other'), b => b.paid) },
            free: { staff: new Set(free.map(b => b.staff_id)).size, bills: free.length, items: sum(free, b => b.items), value: sum(free, b => b.value) },
            voided: bills.filter(b => b.voided).length,
            workers: [...byWorker.values()].sort((a, b) => b.total - a.total),
            items: [...byItem.values()].sort((a, b) => (b.qty + b.free_qty) - (a.qty + a.free_qty)),
            staff: [...byStaff.values()].sort((a, b) => b.value - a.value),
            days: [...byDay.values()].sort((a, b) => a.day.localeCompare(b.day)),
        };
    }
    const kpi = (icon, value, label, cls = '') => `<div class="la-kpi ${cls}"><span>${icon}</span><b>${value}</b><small>${label}</small></div>`;
    function kpiBlocks(s) {
        return `<div class="la-split">
          <div class="la-card"><h3>🧺 Normal laundry (paid)</h3><div class="la-kpis">
            ${kpi('🙂', s.paid.customers, 'customers')}${kpi('🧾', s.paid.bills, 'bills')}${kpi('👕', s.paid.items, 'items')}
            ${kpi('💰', sar(s.paid.sales), 'sales SAR', 'big')}${kpi('💵', sar(s.paid.cash), 'cash SAR')}${kpi('💳', sar(s.paid.card), 'card SAR')}${s.paid.other ? kpi('🔁', sar(s.paid.other), 'other SAR') : ''}</div></div>
          <div class="la-card free"><h3>👷 Staff only laundry</h3><div class="la-kpis">
            ${kpi('👤', s.free.staff, 'staff')}${kpi('🧾', s.free.bills, 'bills')}${kpi('👕', s.free.items, 'items')}
            ${kpi('🏷️', sar(s.free.value), 'laundry value SAR', 'big')}${kpi('💵', 0, 'collected SAR')}</div></div>
        </div>
        <div class="la-card la-total"><b>Total laundry activity:</b> ${s.paid.items + s.free.items} items processed (${s.paid.items} paid + ${s.free.items} free) ·
          <b>Actual cash received: ${sar(s.paid.cash)} SAR</b>${s.voided ? ` · <span class="la-muted">${s.voided} cancelled bill${s.voided === 1 ? '' : 's'} not counted</span>` : ''}</div>`;
    }
    function workerTable(ws) {
        return `<table class="la-t"><thead><tr><th>Worker</th><th class="n">Bills</th><th class="n">Items</th><th class="n">Cash</th><th class="n">Card</th><th class="n">Other</th><th class="n">Collection</th><th class="n">Free bills · items · value</th></tr></thead><tbody>
            ${ws.map(w => `<tr><td><b>${esc(w.worker)}</b></td><td class="n">${w.bills}</td><td class="n">${w.items}</td><td class="n">${sar(w.cash || 0)}</td><td class="n">${sar(w.card || 0)}</td><td class="n">${sar(w.other || 0)}</td>
              <td class="n"><b>${sar(w.total)}</b></td><td class="n">${w.free_bills} · ${w.free_items} · ${sar(w.free_value)}</td></tr>`).join('') || '<tr><td colspan="8" class="la-muted">No bills.</td></tr>'}</tbody></table>`;
    }
    ctx.root.addEventListener('click', (e) => {
        const tr = e.target.closest('tr[data-bill]');
        if (tr && S.billIndex) openBill(S.billIndex.get(Number(tr.dataset.bill)));
    });
    ctx.root.addEventListener('keydown', (e) => { if (e.key === 'Enter') { const tr = e.target.closest('tr[data-bill]'); if (tr && S.billIndex) openBill(S.billIndex.get(Number(tr.dataset.bill))); } });
    const indexBills = (bills) => { S.billIndex = S.billIndex || new Map(); for (const b of bills) S.billIndex.set(b.id, b); };

    /* ----------------------------- reports ----------------------------- */
    let lastReport = null;
    async function drawReports() {
        const r = rangeUI('reports', drawReports, 'week');
        const body = $('repBody');
        body.innerHTML = '<p class="la-muted">Loading…</p>';
        try {
            const { bills } = await billsIn(r.from, r.to);
            indexBills(bills);
            const s = stats(bills);
            lastReport = { r, bills, s };
            body.innerHTML = `<div class="la-bar"><b>${esc(fmtDay(r.from))} → ${esc(fmtDay(r.to))}</b><span class="la-grow"></span>
                  <button type="button" data-export="xlsx">⬇️ Excel</button><button type="button" data-export="pdf">⬇️ PDF</button></div>
                ${kpiBlocks(s)}
                <div class="la-card"><h3>📅 Daily sales (SAR)</h3>${barChart(s.days.map(d => ({ label: fmtDay(d.day), value: d.sales / 100, note: `${d.bills} bills · ${d.items} items · ${d.customers.size} customers · free ${d.free_items} items` })))}</div>
                <div class="la-card"><h3>👷 Worker-wise collection</h3>${workerTable(s.workers)}</div>
                <div class="la-card"><h3>👕 Item-wise</h3><table class="la-t"><thead><tr><th>Item</th><th class="n">Paid qty</th><th class="n">Revenue SAR</th><th class="n">Free qty</th><th class="n">Free value SAR</th></tr></thead><tbody>
                  ${s.items.map(i => `<tr><td>${itemPic(S.items.find(x => x.name === i.name), 'la-ipic')} ${esc(i.name)}</td><td class="n">${i.qty}</td><td class="n">${sar(i.revenue)}</td><td class="n">${i.free_qty}</td><td class="n">${sar(i.free_value)}</td></tr>`).join('') || '<tr><td colspan="5" class="la-muted">No items.</td></tr>'}</tbody></table>
                  ${barChart(s.items.map(i => ({ label: i.name, value: i.qty + i.free_qty, note: `${i.qty} paid + ${i.free_qty} free` })), 'items')}</div>`;
        } catch (e) { body.innerHTML = errBox(e); }
    }
    $('repBody').addEventListener('click', (e) => { const b = e.target.closest('[data-export]'); if (b && lastReport) (b.dataset.export === 'xlsx' ? exportXlsx : exportPdf)(lastReport).catch(err => alert(err.message)); });

    function barChart(rows, unit = 'SAR') {
        if (!rows.length) return '<p class="la-muted">Nothing in this period.</p>';
        const max = Math.max(1, ...rows.map(r => r.value));
        return `<div class="la-chart">${rows.map(r => `<div class="la-barrow" title="${esc(r.note || '')}"><span class="l">${esc(r.label)}</span>
            <span class="b"><i style="width:${(r.value / max * 100).toFixed(1)}%"></i></span><b>${unit === 'SAR' ? sar(Math.round(r.value * 100)) : r.value}</b></div>`).join('')}</div>`;
    }

    /* ------------------------------ exports ------------------------------ */
    const fileTag = (r) => r.from === r.to ? r.from : `${r.from}_to_${r.to}`;
    const billRows = (bills) => bills.map(b => ({
        Date: b.day, Time: jeddahTime(b.given_at), Receipt: b.receipt_no, Type: b.kind === 'free' ? 'Free (staff)' : 'Paid', Customer: b.kind === 'free' ? b.staff_name : b.customer?.name || '',
        Room: b.customer?.room || '', Group: b.customer?.group || '', Items: b.items, 'Item list': b.lines.map(l => `${l.name} x${l.qty}`).join(', '),
        'Value SAR': b.value / 100, 'Paid SAR': b.paid / 100, Payment: b.method || '', Worker: b.worker, Status: b.voided ? 'Cancelled' : b.status,
        'Collected at': b.collected_at ? `${jeddahDate(b.collected_at)} ${jeddahTime(b.collected_at)}` : '', 'Cancel reason': b.void_reason || '',
    }));
    async function exportXlsx({ r, bills, s }) {
        await loadScript(LIBS.xlsx);
        const X = window.XLSX, wb = X.utils.book_new();
        const summary = [
            ['Laundry report', `${r.from} to ${r.to}`], [], ['NORMAL LAUNDRY'], ['Customers', s.paid.customers], ['Bills', s.paid.bills], ['Items', s.paid.items],
            ['Sales SAR', s.paid.sales / 100], ['Cash SAR', s.paid.cash / 100], ['Card SAR', s.paid.card / 100], ['Other SAR', s.paid.other / 100], [],
            ['FREE STAFF LAUNDRY'], ['Staff', s.free.staff], ['Bills', s.free.bills], ['Items', s.free.items], ['Laundry value SAR', s.free.value / 100], ['Collected SAR', 0], [],
            ['TOTAL ITEMS PROCESSED', s.paid.items + s.free.items], ['ACTUAL CASH RECEIVED SAR', s.paid.cash / 100],
        ];
        X.utils.book_append_sheet(wb, X.utils.aoa_to_sheet(summary), 'Summary');
        X.utils.book_append_sheet(wb, X.utils.json_to_sheet(billRows(bills)), 'Transactions');
        X.utils.book_append_sheet(wb, X.utils.json_to_sheet(s.workers.map(w => ({ Worker: w.worker, Bills: w.bills, Items: w.items, 'Cash SAR': (w.cash || 0) / 100, 'Card SAR': (w.card || 0) / 100, 'Other SAR': (w.other || 0) / 100, 'Collection SAR': w.total / 100, 'Free bills': w.free_bills, 'Free items': w.free_items, 'Free value SAR': w.free_value / 100 }))), 'Workers');
        X.utils.book_append_sheet(wb, X.utils.json_to_sheet(s.items.map(i => ({ Item: i.name, 'Paid qty': i.qty, 'Revenue SAR': i.revenue / 100, 'Free qty': i.free_qty, 'Free value SAR': i.free_value / 100 }))), 'Items');
        X.utils.book_append_sheet(wb, X.utils.json_to_sheet(s.staff.map(x => ({ Staff: x.name, 'Free bills': x.bills, Items: x.items, 'Value SAR': x.value / 100 }))), 'Free laundry');
        X.writeFile(wb, `Laundry Report – ${fileTag(r)}.xlsx`);
    }
    async function exportPdf({ r, bills, s }) {
        await loadScript(LIBS.jspdf);
        await loadScript(LIBS.autotable);
        const doc = new window.jspdf.jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
        doc.setFontSize(14); doc.text(`MOHAMMEDI MAKAN — Laundry Report ${r.from === r.to ? r.from : `${r.from} to ${r.to}`}`, 14, 14);
        doc.setFontSize(10);
        doc.text(`Normal: ${s.paid.customers} customers · ${s.paid.bills} bills · ${s.paid.items} items · sales ${sar(s.paid.sales)} SAR (cash ${sar(s.paid.cash)}, card ${sar(s.paid.card)}, other ${sar(s.paid.other)})`, 14, 21);
        doc.text(`Free staff laundry: ${s.free.staff} staff · ${s.free.bills} bills · ${s.free.items} items · value ${sar(s.free.value)} SAR · collected 0`, 14, 26);
        doc.text(`Total items processed: ${s.paid.items + s.free.items} · Actual cash received: ${sar(s.paid.cash)} SAR`, 14, 31);
        doc.autoTable({ startY: 35, head: [['Worker', 'Bills', 'Items', 'Cash', 'Card', 'Other', 'Collection', 'Free bills/items/value']],
            body: s.workers.map(w => [w.worker, w.bills, w.items, sar(w.cash || 0), sar(w.card || 0), sar(w.other || 0), sar(w.total), `${w.free_bills} / ${w.free_items} / ${sar(w.free_value)}`]), styles: { fontSize: 8 } });
        doc.autoTable({ startY: doc.lastAutoTable.finalY + 6, head: [['Item', 'Paid qty', 'Revenue', 'Free qty', 'Free value']],
            body: s.items.map(i => [i.name, i.qty, sar(i.revenue), i.free_qty, sar(i.free_value)]), styles: { fontSize: 8 } });
        doc.autoTable({ startY: doc.lastAutoTable.finalY + 6, head: [['Date', 'Time', 'Receipt', 'Type', 'Customer / staff', 'Room', 'Items', 'Value', 'Paid', 'Payment', 'Worker', 'Status']],
            body: billRows(bills).map(x => [x.Date, x.Time, x.Receipt, x.Type, x.Customer, x.Room, x.Items, x['Value SAR'], x['Paid SAR'], x.Payment, x.Worker, x.Status]), styles: { fontSize: 7 } });
        doc.save(`Laundry ${r.from === r.to ? 'Daily ' : ''}Report – ${fileTag(r)}.pdf`);
    }

    /* ------------------------------ bills ------------------------------ */
    // Cash bills only. Unpaid = the worker still holds the cash; the admin marks bills Paid when it is handed over:
    // one bill (✔ button), ticked bills, or "amount collected" (ticks the oldest unpaid bills that fit that amount).
    const B = { from: addDays(jeddahDay(), -6), to: jeddahDay(), bills: [], sel: new Set() };
    $('bFrom').value = B.from; $('bTo').value = B.to;
    async function drawBills() {
        $('bBody').innerHTML = '<p class="la-muted">Loading…</p>';
        try {
            B.bills = (await api('GET', `/api/laundry/bills?site=${site}&from=${B.from}&to=${B.to}&kind=paid`)).bills.filter(b => !b.voided)
                .sort((a, b) => a.given_at.localeCompare(b.given_at));
            indexBills(B.bills);
            for (const id of [...B.sel]) if (!B.bills.some(b => b.id === id && !b.settled_at)) B.sel.delete(id);
            renderBills();
        } catch (e) { $('bBody').innerHTML = errBox(e); }
    }
    const nBills = (n) => `${n} bill${n === 1 ? '' : 's'}`;
    function renderBills() {
        const unpaid = B.bills.filter(b => !b.settled_at), paid = B.bills.filter(b => b.settled_at);
        const sum = (a) => a.reduce((n, b) => n + b.paid, 0);
        const sel = unpaid.filter(b => B.sel.has(b.id));
        $('bBody').innerHTML = `<div class="la-kpis">${kpi('⏳', sar(sum(unpaid)), `unpaid SAR · ${nBills(unpaid.length)}`, 'big neg')}${kpi('✅', sar(sum(paid)), `paid SAR · ${nBills(paid.length)}`, 'big')}${kpi('🧾', sar(sum(B.bills)), `cash SAR · ${nBills(B.bills.length)}`)}</div>
            ${isAdmin ? `<div class="la-paybar">
              <button type="button" data-selall>${unpaid.length && sel.length === unpaid.length ? '☐ Clear selection' : '☑ Select all unpaid'}</button>
              <label>Amount collected <input type="number" id="bCollect" min="0" step="0.5" placeholder="SAR"></label><button type="button" data-collect>Select bills for this amount</button>
              <span class="la-grow"></span>
              <b>${sel.length} selected · ${sar(sum(sel))} SAR</b>
              <button type="button" class="la-primary" data-markpaid ${sel.length ? '' : 'disabled'}>✔ Mark selected paid</button></div>` : ''}
            ${B.bills.length ? `<div class="la-scroll"><table class="la-t la-bills"><thead><tr>${isAdmin ? '<th></th>' : ''}<th>Date</th><th>Time</th><th>Receipt</th><th>Building · room</th><th class="n">Items</th><th class="n">Amount SAR</th><th>Worker</th><th>Status</th>${isAdmin ? '<th></th>' : ''}</tr></thead><tbody>
              ${B.bills.map(b => `<tr data-bill="${b.id}" class="${b.settled_at ? 'paid' : 'unpaid'}${B.sel.has(b.id) ? ' sel' : ''}">
                ${isAdmin ? `<td>${b.settled_at ? '' : `<input type="checkbox" data-sel="${b.id}" ${B.sel.has(b.id) ? 'checked' : ''} aria-label="Select ${esc(b.receipt_no)}">`}</td>` : ''}
                <td>${esc(fmtDay(b.day))}</td><td>${esc(jeddahTime(b.given_at))}</td><td class="mono">${esc(b.receipt_no)}</td><td>${who(b)}</td><td class="n">${b.items}</td><td class="n"><b>${sar(b.paid)}</b></td><td>${esc(b.worker)}</td>
                <td>${b.settled_at ? `<span class="la-tag paid">Paid</span> <small class="la-muted">${esc(jeddahDate(b.settled_at))}${b.settled_by ? ' · ' + esc(b.settled_by) : ''}</small>` : '<span class="la-tag unpaid">Unpaid</span>'}</td>
                ${isAdmin ? `<td>${b.settled_at ? `<button type="button" class="la-mini" data-unpay="${b.id}">↩ Unpaid</button>` : `<button type="button" class="la-mini ok" data-pay="${b.id}">✔ Paid</button>`}</td>` : ''}</tr>`).join('')}</tbody></table></div>`
            : '<p class="la-muted">No cash bills in these dates.</p>'}`;
    }
    async function settle(ids, paid = true) {
        const list = B.bills.filter(b => ids.includes(b.id));
        if (!list.length) return;
        const amt = sar(list.reduce((n, b) => n + b.paid, 0));
        if (!confirm(paid ? `Mark ${list.length} bill${list.length === 1 ? '' : 's'} PAID (${amt} SAR received from the worker)?` : `Mark ${list.map(b => b.receipt_no).join(', ')} UNPAID again?`)) return;
        try {
            const r = await api('POST', '/api/laundry/settle', { ids, paid });
            for (const b of r.bills) { const i = B.bills.findIndex(x => x.id === b.id); if (i >= 0) B.bills[i] = b; S.billIndex?.set(b.id, b); }
            ids.forEach(id => B.sel.delete(id));
            renderBills();
        } catch (err) { alert(err.message); }
    }
    $('bFrom').addEventListener('change', () => { B.from = $('bFrom').value || jeddahDay(); if (B.to < B.from) { B.to = B.from; $('bTo').value = B.to; } drawBills(); });
    $('bTo').addEventListener('change', () => { B.to = $('bTo').value || B.from; if (B.to < B.from) { B.from = B.to; $('bFrom').value = B.from; } drawBills(); });
    $('bBody').addEventListener('click', (e) => {
        const t = e.target;
        if (t.closest('[data-sel]')) { const id = Number(t.closest('[data-sel]').dataset.sel); t.checked ? B.sel.add(id) : B.sel.delete(id); renderBills(); e.stopPropagation(); return; }
        if (t.closest('[data-pay]')) { e.stopPropagation(); settle([Number(t.closest('[data-pay]').dataset.pay)]); return; }
        if (t.closest('[data-unpay]')) { e.stopPropagation(); settle([Number(t.closest('[data-unpay]').dataset.unpay)], false); return; }
        if (t.closest('[data-markpaid]')) { settle([...B.sel]); return; }
        if (t.closest('[data-selall]')) {
            const unpaid = B.bills.filter(b => !b.settled_at);
            if (unpaid.every(b => B.sel.has(b.id))) B.sel.clear(); else unpaid.forEach(b => B.sel.add(b.id));
            renderBills(); return;
        }
        if (t.closest('[data-collect]')) {
            // oldest unpaid bills first, as long as they fit in the amount handed over
            const amt = Math.round(Number($('bCollect').value) * 100);
            if (!(amt > 0)) { alert('Enter the amount collected (SAR).'); return; }
            B.sel.clear();
            let left = amt;
            for (const b of B.bills.filter(x => !x.settled_at)) if (b.paid <= left) { B.sel.add(b.id); left -= b.paid; }
            renderBills();
            $('bCollect').value = amt / 100;
            if (left) alert(`${sar(amt - left)} SAR selected; ${sar(left)} SAR of the amount does not match a whole bill.`);
        }
    }, true);

    // one bill: details, audit, and (admin) edit / cancel / reprint
    async function openBill(b) {
        if (!b) return;
        const dlg = document.createElement('dialog');
        dlg.className = 'la-dlg wide';
        let log = [];
        try { log = (await api('GET', '/api/laundry/audit')).audit.filter(a => (a.detail || '').includes(b.receipt_no)); } catch { }
        dlg.innerHTML = `<div class="la-dlg-h"><h2>${esc(b.receipt_no)} ${b.voided ? '<span class="la-err-tag">❌ CANCELLED</span>' : ''}</h2><button type="button" data-x aria-label="Close">✕</button></div>
          <div class="la-bill">
            <div>${receiptHTML(b, '')}</div>
            <div class="la-bill-side">
              ${b.kind === 'free' ? `<div class="la-staffline">${staffPhoto(b.staff_id, 'la-photo-sm')}<div><b>${esc(b.staff_name)}</b><small>Free staff laundry · value ${sar(b.value)} SAR · paid 0</small></div></div>` : ''}
              <dl class="la-dl">
                <dt>Given</dt><dd>${esc(jeddahDate(b.given_at))} ${esc(jeddahTime(b.given_at))} · by ${esc(b.worker)}</dd>
                <dt>Status</dt><dd>${STATUS[b.status]}${b.ready_at ? ` · ready ${esc(jeddahDate(b.ready_at))} ${esc(jeddahTime(b.ready_at))}` : ''}</dd>
                <dt>Collected</dt><dd>${b.collected_at ? `${esc(jeddahDate(b.collected_at))} ${esc(jeddahTime(b.collected_at))} · marked by ${esc(b.collected_by || '')}` : '—'}</dd>
                ${b.customer?.group ? `<dt>Group</dt><dd>${esc(b.customer.group)}${b.customer.building ? ' · ' + esc(b.customer.building) : ''}</dd>` : ''}
                ${b.customer?.contact ? `<dt>Contact</dt><dd>${esc(b.customer.contact)}</dd>` : ''}
                ${b.approval_by ? `<dt>Approved by</dt><dd>${esc(b.approval_by)}</dd>` : ''}
                ${b.warnings?.length ? `<dt>Limits</dt><dd class="la-warn">${b.warnings.map(esc).join('<br>')}</dd>` : ''}
                ${b.voided ? `<dt>Cancelled</dt><dd>${esc(b.void_reason || '')}</dd>` : ''}
                ${b.updated_by ? `<dt>Last change</dt><dd>${esc(b.updated_by)} · ${esc(jeddahDate(b.updated_at))} ${esc(jeddahTime(b.updated_at))}</dd>` : ''}
              </dl>
              <h3>History</h3>
              ${log.length ? `<ul class="la-log">${log.map(a => `<li><small>${esc(jeddahDate(a.at))} ${esc(jeddahTime(a.at))} · ${esc(a.desk || '')}</small>${esc(a.detail)}</li>`).join('')}</ul>` : '<p class="la-muted">No changes since it was saved.</p>'}
              <div class="la-actions">
                <button type="button" data-print>🖨 Reprint</button>
                ${isAdmin && !b.voided ? '<button type="button" data-edit>✏️ Edit</button><button type="button" class="danger" data-void>❌ Cancel bill</button>' : ''}
              </div>
            </div>
          </div>`;
        ctx.root.appendChild(dlg);
        dlg.addEventListener('click', async (e) => {
            if (e.target.closest('[data-x]')) dlg.close();
            if (e.target.closest('[data-print]')) printReceipt(b, S.info);
            if (e.target.closest('[data-edit]')) { dlg.close(); editBill(b); }
            if (e.target.closest('[data-void]')) {
                const why = prompt(`Cancel ${b.receipt_no} (${b.kind === 'free' ? 'free' : sar(b.paid) + ' SAR'})? It stays in the records, marked cancelled.\n\nReason:`);
                if (!why) return;
                try { const r = await api('POST', `/api/laundry/bills/${b.id}/void`, { reason: why }); S.billIndex.set(b.id, r.bill); dlg.close(); refreshCurrent(); }
                catch (err) { alert(err.message); }
            }
        });
        dlg.addEventListener('close', () => dlg.remove());
        dlg.showModal();
    }

    function editBill(b) {
        const qty = new Map(b.lines.map(l => [l.item_id, l.qty]));
        const dlg = document.createElement('dialog');
        dlg.className = 'la-dlg';
        const draw = () => {
            const known = new Map(b.lines.map(l => [l.item_id, l]));
            const rows = [...qty].map(([id, q]) => { const l = known.get(id) || S.items.find(i => i.id === id); return `<tr><td>${esc(l.name)} <small>${sar(l.price)} SAR${known.has(id) ? '' : ' (today\'s price)'}</small></td>
                <td class="n"><button type="button" data-d="${id}">−</button> <b>${q}</b> <button type="button" data-i="${id}">+</button></td></tr>`; }).join('');
            dlg.querySelector('#eRows').innerHTML = rows;
            dlg.querySelector('#eAdd').innerHTML = '<option value="">➕ Add an item…</option>' + S.items.filter(i => i.active && !qty.has(i.id) && (i.category || 'guest') === (b.kind === 'building' ? 'building' : 'guest')).map(i => `<option value="${i.id}">${esc(i.name)} · ${sar(i.price)} SAR</option>`).join('');
        };
        dlg.innerHTML = `<form class="la-form" method="dialog"><div class="la-dlg-h"><h2>✏️ Edit ${esc(b.receipt_no)}</h2><button type="button" data-x aria-label="Close">✕</button></div>
            ${b.kind === 'paid' ? `<div class="la-grid2">
              <label>Name<input name="name" value="${esc(b.customer.name || '')}"></label><label>Room<input name="room" value="${esc(b.customer.room || '')}"></label>
              <label>Building<input name="building" value="${esc(b.customer.building || '')}"></label><label>Group<input name="group" value="${esc(b.customer.group || '')}"></label>
              <label>Contact<input name="contact" value="${esc(b.customer.contact || '')}"></label></div>` : b.kind === 'building' ? '<p>🏨 Building linen</p>' : `<p>👷 ${esc(b.staff_name)} (staff only)</p>`}
            <table class="la-t"><tbody id="eRows"></tbody></table>
            <select id="eAdd"></select>
            <p class="la-muted">Lines already on the bill keep the price they were billed at. Every change is written to the history.</p>
            <div class="la-actions"><button type="button" data-x>Cancel</button><button type="submit" class="la-primary">Save changes</button></div></form>`;
        ctx.root.appendChild(dlg);
        dlg.addEventListener('click', (e) => {
            if (e.target.closest('[data-x]')) dlg.close();
            const d = e.target.closest('[data-d]'), i = e.target.closest('[data-i]');
            if (d) { const id = Number(d.dataset.d), q = qty.get(id) - 1; if (q > 0) qty.set(id, q); else qty.delete(id); draw(); }
            if (i) { const id = Number(i.dataset.i); qty.set(id, qty.get(id) + 1); draw(); }
        });
        dlg.querySelector('#eAdd').addEventListener('change', (e) => { const id = Number(e.target.value); if (id) { qty.set(id, 1); draw(); } });
        dlg.querySelector('form').addEventListener('submit', async (e) => {
            e.preventDefault();
            if (!qty.size) { alert('A bill needs at least one item. To remove it completely, cancel the bill instead.'); return; }
            const f = e.target;
            const payload = { version: b.version, lines: [...qty].map(([item_id, q]) => ({ item_id, qty: q })) };
            if (b.kind === 'paid') { payload.customer = { name: f.name.value, room: f.room.value, building: f.building.value, group: f.group.value, contact: f.contact.value }; payload.method = 'cash'; payload.received = ''; }
            try { const r = await api('PUT', `/api/laundry/bills/${b.id}`, payload); S.billIndex.set(b.id, r.bill); dlg.close(); refreshCurrent(); openBill(r.bill); }
            catch (err) { alert(err.message); }
        });
        dlg.addEventListener('close', () => dlg.remove());
        draw();
        dlg.showModal();
    }
    function refreshCurrent() { showTab(S.tab); }

    /* ---------------------------- free laundry ---------------------------- */
    async function drawFree() {
        const r = rangeUI('free', drawFree, 'today');
        const body = $('freeBody');
        body.innerHTML = '<p class="la-muted">Loading…</p>';
        try {
            await loadStaff();
            const { bills } = await billsIn(r.from, r.to);
            const free = bills.filter(b => b.kind === 'free');
            indexBills(free);
            const s = stats(free);
            body.innerHTML = `<div class="la-card free"><h3>👷 STAFF ONLY LAUNDRY · ${esc(fmtDay(r.from))}${r.to !== r.from ? ' → ' + esc(fmtDay(r.to)) : ''}</h3><div class="la-kpis">
                  ${kpi('👤', s.free.staff, 'staff')}${kpi('🧾', s.free.bills, 'transactions')}${kpi('👕', s.free.items, 'clothes')}${kpi('🏷️', sar(s.free.value), 'laundry value SAR', 'big')}${kpi('💵', 0, 'collected SAR')}</div></div>
                <div class="la-card"><h3>Staff-wise</h3><table class="la-t"><thead><tr><th>Staff</th><th class="n">Transactions</th><th class="n">Clothes</th><th class="n">Laundry value</th></tr></thead><tbody>
                  ${s.staff.map(x => `<tr class="click" data-staffh="${x.staff_id}"><td>${staffPhoto(x.staff_id, 'la-thumb sm')} ${esc(x.name)}</td><td class="n">${x.bills}</td><td class="n">${x.items}</td><td class="n">${sar(x.value)} SAR</td></tr>`).join('') || '<tr><td colspan="4" class="la-muted">No free laundry in this period.</td></tr>'}</tbody></table></div>
                <div class="la-card"><h3>📒 Staff free laundry register</h3><div class="la-scroll"><table class="la-t"><thead><tr><th>Photo</th><th>Staff name</th><th>Given</th><th>Collection</th><th class="n">Count</th><th class="n">Value</th><th>Status</th><th>Accepted by</th></tr></thead><tbody>
                  ${free.map(b => `<tr class="${b.voided ? 'void' : ''} click" data-bill="${b.id}"><td>${staffPhoto(b.staff_id)}</td><td><b>${esc(b.staff_name)}</b></td><td>${esc(jeddahDate(b.given_at))} ${esc(jeddahTime(b.given_at))}</td>
                    <td>${b.collected_at ? `${esc(jeddahDate(b.collected_at))} ${esc(jeddahTime(b.collected_at))}` : '—'}</td><td class="n">${b.items}</td><td class="n">${sar(b.value)} SAR</td><td>${b.voided ? '❌ Cancelled' : STATUS[b.status]}</td><td>${esc(b.worker)}</td></tr>`).join('') || '<tr><td colspan="8" class="la-muted">No entries.</td></tr>'}</tbody></table></div></div>`;
        } catch (e) { body.innerHTML = errBox(e); }
    }
    $('freeBody').addEventListener('click', (e) => { const tr = e.target.closest('[data-staffh]'); if (tr) staffHistory(Number(tr.dataset.staffh)); });

    async function staffHistory(id) {
        let data;
        try { data = await api('GET', `/api/laundry/staff/${id}?bills=1`); } catch (e) { alert(e.message); return; }
        const s = data.staff, bills = data.bills || [];
        indexBills(bills);
        const live = bills.filter(b => !b.voided);
        const months = new Map();
        for (const b of live) { const m = months.get(b.day.slice(0, 7)) || { m: b.day.slice(0, 7), bills: 0, items: 0, value: 0 }; m.bills++; m.items += b.items; m.value += b.value; months.set(m.m, m); }
        const dlg = document.createElement('dialog');
        dlg.className = 'la-dlg wide';
        dlg.innerHTML = `<div class="la-dlg-h"><h2>${esc(s.name)}</h2><button type="button" data-x aria-label="Close">✕</button></div>
          <div class="la-profile">${s.photo ? `<img src="${s.photo}" alt="">` : '<span class="la-photo-none">👤</span>'}
            <div><p>${esc([s.staff_code && 'ID ' + s.staff_code, s.department, s.room && 'Room ' + s.room, s.contact].filter(Boolean).join(' · '))}</p>
              <div class="la-kpis">${kpi('🧾', live.length, 'transactions')}${kpi('👕', live.reduce((n, b) => n + b.items, 0), 'clothes')}${kpi('🏷️', sar(live.reduce((n, b) => n + b.value, 0)), 'value SAR', 'big')}${kpi('💵', 0, 'paid SAR')}</div>
              <p class="la-muted">This month so far: ${data.usage.month_bills} times · ${data.usage.month_items} clothes · ${sar(data.usage.month_value)} SAR${s.limits && Object.keys(s.limits).some(k => k !== 'enforce' && s.limits[k]) ? ` · limits: ${esc(limitText(s.limits))}` : ''}</p></div></div>
          <h3>By month</h3><table class="la-t"><thead><tr><th>Month</th><th class="n">Submissions</th><th class="n">Clothes</th><th class="n">Laundry value</th></tr></thead><tbody>
            ${[...months.values()].sort((a, b) => b.m.localeCompare(a.m)).map(m => `<tr><td>${esc(new Date(m.m + '-15T12:00:00Z').toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }))}</td><td class="n">${m.bills}</td><td class="n">${m.items}</td><td class="n">${sar(m.value)} SAR</td></tr>`).join('') || '<tr><td colspan="4" class="la-muted">No free laundry yet.</td></tr>'}</tbody></table>
          <h3>Transaction history</h3><div class="la-scroll"><table class="la-t"><thead><tr><th>Date</th><th>Given</th><th>Collection</th><th class="n">Clothes</th><th class="n">Value</th><th>Status</th><th>Accepted by</th><th>Handed back by</th></tr></thead><tbody>
            ${bills.map(b => `<tr class="${b.voided ? 'void' : ''} click" data-bill="${b.id}"><td>${esc(fmtDay(b.day))}</td><td>${esc(jeddahTime(b.given_at))}</td><td>${b.collected_at ? `${esc(jeddahDate(b.collected_at))} ${esc(jeddahTime(b.collected_at))}` : '—'}</td>
              <td class="n">${b.items}</td><td class="n">${sar(b.value)} SAR</td><td>${b.voided ? '❌ Cancelled' : STATUS[b.status]}</td><td>${esc(b.worker)}</td><td>${esc(b.collected_by || '')}</td></tr>`).join('')}</tbody></table></div>`;
        ctx.root.appendChild(dlg);
        dlg.addEventListener('click', (e) => { if (e.target.closest('[data-x]')) dlg.close(); const tr = e.target.closest('tr[data-bill]'); if (tr) { dlg.close(); openBill(S.billIndex.get(Number(tr.dataset.bill))); } });
        dlg.addEventListener('close', () => dlg.remove());
        dlg.showModal();
    }
    const limitText = (L) => [L.per_bill_items && `${L.per_bill_items}/submission`, L.per_day_items && `${L.per_day_items}/day`, L.per_week_items && `${L.per_week_items}/week`,
        L.per_month_value && `${sar(L.per_month_value)} SAR/month`, L.per_month_bills && `${L.per_month_bills} times/month`].filter(Boolean).join(', ') + (L.enforce ? ' (approval needed above)' : ' (warning only)');

    /* ------------------------------ prices ------------------------------ */
    async function drawPrices() {
        const body = $('priceBody');
        try {
            await loadItems();
            const card = (i) => `<div class="la-item ${i.active ? '' : 'off'}">
                ${itemPic(i, 'la-ipic big')}<div><b>${esc(i.name)}</b>${i.name_local ? `<small>${esc(i.name_local)}</small>` : ''}<span class="la-price">${sar(i.price)} SAR</span>${i.active ? '' : '<small>hidden from the worker</small>'}</div>
                ${isAdmin ? `<button type="button" data-item="${i.id}">✏️ Edit</button>` : ''}</div>`;
            body.innerHTML = `<h3>🧺 Clothes (New bill · Staff only)</h3><div class="la-items">${S.items.filter(i => (i.category || 'guest') === 'guest').map(card).join('')}</div>
                <h3>🏨 Building linen (Building tab)</h3><div class="la-items">${S.items.filter(i => i.category === 'building').map(card).join('') || '<p class="la-muted">None yet.</p>'}</div>`;
        } catch (e) { body.innerHTML = errBox(e); }
    }
    $('priceBody').addEventListener('click', (e) => { const b = e.target.closest('[data-item]'); if (b) itemForm(S.items.find(i => i.id === Number(b.dataset.item))); });
    $('addItem').addEventListener('click', () => itemForm(null));

    function itemForm(item) {
        let image = item?.image || '';
        const dlg = document.createElement('dialog');
        dlg.className = 'la-dlg';
        dlg.innerHTML = `<form class="la-form" method="dialog"><div class="la-dlg-h"><h2>${item ? '✏️ ' + esc(item.name) : '➕ New item'}</h2><button type="button" data-x aria-label="Close">✕</button></div>
            <div class="la-picedit"><div class="la-picprev" id="pPrev"></div>
              <div><label class="la-file">📷 Take / choose a photo<input type="file" accept="image/*" capture="environment" id="pFile"></label>
                <label>or an emoji<input id="pEmoji" maxlength="8" placeholder="👕" value="${image.startsWith('data:') ? '' : esc(image)}"></label>
                <button type="button" id="pClear">Remove picture</button></div></div>
            <p class="la-muted">A clear photo of the item helps workers who do not read.</p>
            <div class="la-grid2"><label>Name<input name="name" required maxlength="40" value="${esc(item?.name || '')}"></label>
              <label>Name in another language<input name="name_local" maxlength="40" value="${esc(item?.name_local || '')}" placeholder="optional"></label>
              <label>Price (SAR)<input name="price" type="number" min="0" max="1000" step="0.25" required value="${item ? item.price / 100 : ''}"></label>
              <label>Order on the screen<input name="sort" type="number" step="1" value="${item?.sort ?? (S.items.length + 1)}"></label>
              <label>Tab<select name="category"><option value="guest" ${item?.category === 'building' ? '' : 'selected'}>🧺 Clothes (New bill · Staff only)</option><option value="building" ${item?.category === 'building' ? 'selected' : ''}>🏨 Building linen</option></select></label></div>
            <label class="la-chk"><input type="checkbox" name="active" ${!item || item.active ? 'checked' : ''}> Show to the worker</label>
            ${item ? `<p class="la-muted">Changing the price affects new bills only.</p>` : ''}
            <div class="la-actions"><button type="button" data-x>Cancel</button><button type="submit" class="la-primary">Save</button></div></form>`;
        ctx.root.appendChild(dlg);
        const prev = () => { dlg.querySelector('#pPrev').innerHTML = itemPic({ image, name: dlg.querySelector('[name=name]').value }, 'la-ipic huge'); };
        dlg.querySelector('#pFile').addEventListener('change', async (e) => { try { image = await shrinkImage(e.target.files[0], 320); dlg.querySelector('#pEmoji').value = ''; prev(); } catch (err) { alert(err.message); } });
        dlg.querySelector('#pEmoji').addEventListener('input', (e) => { image = e.target.value.trim(); prev(); });
        dlg.querySelector('#pClear').addEventListener('click', () => { image = ''; dlg.querySelector('#pEmoji').value = ''; prev(); });
        dlg.addEventListener('click', (e) => { if (e.target.closest('[data-x]')) dlg.close(); });
        dlg.querySelector('form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const f = e.target;
            const payload = { site, name: f.name.value, name_local: f.name_local.value, price: Number(f.price.value), sort: Number(f.sort.value), active: f.active.checked, category: f.category.value, image };
            try { const r = await api(item ? 'PUT' : 'POST', item ? `/api/laundry/items/${item.id}` : '/api/laundry/items', payload); S.items = r.items; dlg.close(); drawPrices(); }
            catch (err) { alert(err.message); }
        });
        dlg.addEventListener('close', () => dlg.remove());
        prev();
        dlg.showModal();
    }

    /* ------------------------------ staff ------------------------------ */
    async function drawStaff() {
        const body = $('staffBody');
        try {
            await loadStaff();
            drawCats();
            const q = $('sQ').value.trim().toLowerCase(), cat = $('sCat').value;
            const catOf = (s) => S.cats.includes(s.category) ? s.category : '';
            const list = S.staff.filter(s => !s.deleted).filter(s => cat === '*' || catOf(s) === cat)
                .filter(s => !q || [s.name, s.staff_code, s.room, s.contact, s.department].some(v => String(v || '').toLowerCase().includes(q)));
            body.innerHTML = `<div class="la-staffgrid">${list.map(s => `<div class="la-staffcard ${s.active && s.free ? '' : 'off'}">
                ${s.photo ? `<img src="${s.photo}" alt="">` : '<span class="la-photo-none">👤</span>'}
                <div><b>${esc(s.name)}</b><small>🗂️ ${esc(catOf(s) || 'Uncategorized')}</small><small>${esc([s.staff_code && 'ID ' + s.staff_code, s.department, s.room && 'Room ' + s.room].filter(Boolean).join(' · '))}</small>
                  <small>${s.active && s.free ? '🆓 Free laundry' : '⛔ Not active'}${Object.keys(s.limits || {}).some(k => k !== 'enforce' && s.limits[k]) ? ' · ' + esc(limitText(s.limits)) : ''}</small>
                  <span class="la-actions"><button type="button" data-hist="${s.id}">📒 History</button>${isAdmin ? `<button type="button" data-staff="${s.id}">✏️ Edit</button><button type="button" class="danger" data-del="${s.id}">🗑 Delete</button>` : ''}</span></div></div>`).join('')
                || `<p class="la-muted">${S.staff.some(s => !s.deleted) ? 'Nobody matches.' : 'No free-laundry staff yet.'}</p>`}</div>`;
        } catch (e) { body.innerHTML = errBox(e); }
    }
    $('sQ').addEventListener('input', drawStaff);
    $('sCat').addEventListener('change', drawStaff);

    // staff categories: add, rename (its staff move along), delete (its staff become uncategorised)
    function drawCats() {
        const n = (c) => S.staff.filter(s => !s.deleted && (c === '' ? !S.cats.includes(s.category) : s.category === c)).length;
        $('catList').innerHTML = S.cats.map((c, i) => `<span class="la-catchip"><b>${esc(c)}</b> <small>${n(c)}</small>
            ${isAdmin ? `<button type="button" data-catren="${i}" aria-label="Rename ${esc(c)}">✏️</button><button type="button" data-catdel="${i}" aria-label="Delete ${esc(c)}">🗑</button>` : ''}</span>`).join('')
            + `<span class="la-catchip none"><b>Uncategorized</b> <small>${n('')}</small></span>`;
        const cur = $('sCat').value;
        $('sCat').innerHTML = '<option value="*">All categories</option>' + S.cats.map(c => `<option value="${esc(c)}">${esc(c)}</option>`).join('') + '<option value="">Uncategorized</option>';
        $('sCat').value = [...$('sCat').options].some(o => o.value === cur) ? cur : '*';
    }
    async function saveCats(categories, renames = {}) {
        try { const r = await api('PUT', '/api/laundry/staff-categories', { site, categories, renames }); S.cats = r.categories; S.staff = r.staff; drawStaff(); }
        catch (err) { alert(err.message); }
    }
    $('catAdd').addEventListener('click', () => {
        const name = $('catNew').value.trim();
        if (!name) return;
        if (S.cats.some(c => c.toLowerCase() === name.toLowerCase())) { alert(`"${name}" is already a category.`); return; }
        $('catNew').value = '';
        saveCats([...S.cats, name]);
    });
    $('catNew').addEventListener('keydown', (e) => { if (e.key === 'Enter') $('catAdd').click(); });
    $('catList').addEventListener('click', (e) => {
        const r = e.target.closest('[data-catren]'), d = e.target.closest('[data-catdel]');
        if (r) {
            const old = S.cats[Number(r.dataset.catren)], name = (prompt(`Rename "${old}" to:`, old) || '').trim();
            if (!name || name === old) return;
            if (S.cats.some(c => c !== old && c.toLowerCase() === name.toLowerCase())) { alert(`"${name}" is already a category.`); return; }
            saveCats(S.cats.map(c => c === old ? name : c), { [old]: name });
        }
        if (d) {
            const c = S.cats[Number(d.dataset.catdel)];
            if (confirm(`Delete the category "${c}"?\n\nIts staff stay, under "Uncategorized".`)) saveCats(S.cats.filter(x => x !== c));
        }
    });
    $('staffBody').addEventListener('click', (e) => {
        const ed = e.target.closest('[data-staff]'), h = e.target.closest('[data-hist]'), del = e.target.closest('[data-del]');
        if (ed) staffForm(S.staff.find(s => s.id === Number(ed.dataset.staff)));
        if (h) staffHistory(Number(h.dataset.hist));
        if (del) deleteStaff(S.staff.find(s => s.id === Number(del.dataset.del)));
    });
    $('addStaff').addEventListener('click', () => staffForm(null));

    // "Delete" hides the profile everywhere; the record and its free-laundry history stay in the database
    async function deleteStaff(s) {
        if (!s || !confirm(`Delete ${s.name}?

The profile disappears from this list and from the worker's free-laundry search, so no new free laundry can be given.
The record and all past free-laundry entries stay saved (register, reports, history).`)) return;
        try { S.staff = (await api('DELETE', `/api/laundry/staff/${s.id}`)).staff; drawStaff(); }
        catch (err) { alert(err.message); }
    }

    function staffForm(s) {
        let photo = s?.photo || '';
        const L = s?.limits || {};
        const dlg = document.createElement('dialog');
        dlg.className = 'la-dlg';
        dlg.innerHTML = `<form class="la-form" method="dialog"><div class="la-dlg-h"><h2>${s ? '✏️ ' + esc(s.name) : '➕ Free-laundry staff'}</h2><button type="button" data-x aria-label="Close">✕</button></div>
            <div class="la-picedit"><div class="la-photoprev" id="fPrev"></div>
              <div><label class="la-file">📷 Take / choose photo<input type="file" accept="image/*" capture="user" id="fFile"></label><button type="button" id="fClear">Remove photo</button>
                <p class="la-muted">The worker checks this photo before accepting clothes.</p></div></div>
            <div class="la-grid2">
              <label>Staff name<input name="name" required maxlength="80" value="${esc(s?.name || '')}"></label><label>Staff ID<input name="staff_code" maxlength="30" value="${esc(s?.staff_code || '')}"></label>
              <label>Room / accommodation<input name="room" maxlength="20" value="${esc(s?.room || '')}"></label><label>Department<input name="department" maxlength="60" value="${esc(s?.department || '')}"></label>
              <label>Mobile<input name="contact" maxlength="30" value="${esc(s?.contact || '')}"></label><label>Free laundry from<input name="started_on" type="date" value="${esc(s?.started_on || '')}"></label>
              <label>Category<select name="category"><option value="">Uncategorized</option>${S.cats.map(c => `<option value="${esc(c)}" ${s?.category === c ? 'selected' : ''}>${esc(c)}</option>`).join('')}</select></label></div>
            <label>Remarks<input name="remarks" maxlength="300" value="${esc(s?.remarks || '')}"></label>
            <div class="la-grid2"><label class="la-chk"><input type="checkbox" name="free" ${!s || s.free ? 'checked' : ''}> Free laundry: YES</label><label class="la-chk"><input type="checkbox" name="active" ${!s || s.active ? 'checked' : ''}> Active</label></div>
            <fieldset><legend>Limits (optional — leave empty for none)</legend><div class="la-grid2">
              <label>Max pieces per submission<input name="per_bill_items" type="number" min="1" value="${L.per_bill_items || ''}"></label>
              <label>Max pieces per day<input name="per_day_items" type="number" min="1" value="${L.per_day_items || ''}"></label>
              <label>Max pieces per week<input name="per_week_items" type="number" min="1" value="${L.per_week_items || ''}"></label>
              <label>Max value per month (SAR)<input name="per_month_value" type="number" min="1" step="0.5" value="${L.per_month_value ? L.per_month_value / 100 : ''}"></label>
              <label>Max free bills per month<input name="per_month_bills" type="number" min="1" value="${L.per_month_bills || ''}"></label></div>
              <label class="la-chk"><input type="checkbox" name="enforce" ${L.enforce ? 'checked' : ''}> Above a limit, the worker needs a supervisor's approval (otherwise only a warning)</label></fieldset>
            <div class="la-actions"><button type="button" data-x>Cancel</button><button type="submit" class="la-primary">Save</button></div></form>`;
        ctx.root.appendChild(dlg);
        const prev = () => { dlg.querySelector('#fPrev').innerHTML = photo ? `<img src="${photo}" alt="">` : '<span class="la-photo-none">👤</span>'; };
        dlg.querySelector('#fFile').addEventListener('change', async (e) => { try { photo = await shrinkImage(e.target.files[0], 360, 0.82); prev(); } catch (err) { alert(err.message); } });
        dlg.querySelector('#fClear').addEventListener('click', () => { photo = ''; prev(); });
        dlg.addEventListener('click', (e) => { if (e.target.closest('[data-x]')) dlg.close(); });
        dlg.querySelector('form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const f = e.target;
            const payload = { site, name: f.name.value, staff_code: f.staff_code.value, room: f.room.value, department: f.department.value, contact: f.contact.value, category: f.category.value,
                started_on: f.started_on.value, remarks: f.remarks.value, free: f.free.checked, active: f.active.checked, photo,
                limits: { per_bill_items: f.per_bill_items.value, per_day_items: f.per_day_items.value, per_week_items: f.per_week_items.value, per_month_value: f.per_month_value.value, per_month_bills: f.per_month_bills.value, enforce: f.enforce.checked } };
            try { const r = await api(s ? 'PUT' : 'POST', s ? `/api/laundry/staff/${s.id}` : '/api/laundry/staff', payload); S.staff = r.staff; dlg.close(); drawStaff(); }
            catch (err) { alert(err.message); }
        });
        dlg.addEventListener('close', () => dlg.remove());
        prev();
        dlg.showModal();
    }

    /* --------------------------- notice & log --------------------------- */
    async function drawNotice() {
        try { const r = await api('GET', '/api/settings'); S.info = r.settings.laundry_info || DEFAULT_INFO; } catch { }
        $('nText').value = S.info;
        $('nText').readOnly = !isAdmin;
        try {
            const { audit } = await api('GET', '/api/laundry/audit');
            $('logBody').innerHTML = `<ul class="la-log">${audit.map(a => `<li><small>${esc(jeddahDate(a.at))} ${esc(jeddahTime(a.at))} · ${esc(a.desk || '')} · ${esc(a.action.replace('laundry-', ''))}</small>${esc(a.detail || '')}</li>`).join('') || '<li class="la-muted">Nothing yet.</li>'}</ul>`;
        } catch (e) { $('logBody').innerHTML = errBox(e); }
    }
    $('nSave').addEventListener('click', async () => {
        try { await api('PUT', '/api/settings', { settings: { laundry_info: $('nText').value.trim() } }); $('nMsg').textContent = 'Saved — shown on the laundry screen and receipts.'; }
        catch (e) { $('nMsg').textContent = e.message; }
    });

    /* ------------------------------ start ------------------------------ */
    await Promise.all([loadItems().catch(() => { }), loadStaff().catch(() => { })]);
    try { const r = await api('GET', '/api/settings'); S.info = r.settings.laundry_info || DEFAULT_INFO; S.cats = r.settings.laundry_staff_categories?.[site] || []; } catch { }
    showTab('bills');
}
