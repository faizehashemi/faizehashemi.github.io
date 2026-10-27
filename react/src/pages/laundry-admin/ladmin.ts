// Laundry admin: the pure parts — date presets, the report numbers, the Excel / PDF exports (moved unchanged from views/laundry-admin/view.js).
type Row = Record<string, any>;
export type L = {
    sar: (n: number) => string; jeddahDay: (t?: number) => string; jeddahTime: (s: string) => string; jeddahDate: (s: string) => string;
};
export type Libs = L & { lib: { loadScript: (u: string) => Promise<void>; LIBS: Record<string, string> }; laundry: any; info: string; addDays: (d: string, n: number) => string; DEFAULT_INFO: string };

const DAY = 864e5;
export const makeDates = (jeddahDay: (t?: number) => string) => {
    const addDays = (ymd: string, n: number) => jeddahDay(Date.parse(ymd + 'T12:00:00+03:00') + n * DAY);
    const weekday = (ymd: string) => new Date(Date.parse(ymd + 'T12:00:00+03:00')).getUTCDay();   // 0 = Sunday
    const fmtDay = (ymd: string) => new Date(ymd + 'T12:00:00+03:00').toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short' });
    const presets = (): Record<string, [string, string, string]> => {
        const t = jeddahDay(), ws = addDays(t, -weekday(t));   // week starts Sunday
        const ms = t.slice(0, 8) + '01', lmEnd = addDays(ms, -1), lms = lmEnd.slice(0, 8) + '01';
        return { today: ['Today', t, t], yesterday: ['Yesterday', addDays(t, -1), addDays(t, -1)], week: ['This week', ws, t], lastweek: ['Last week', addDays(ws, -7), addDays(ws, -1)], month: ['This month', ms, t], lastmonth: ['Last month', lms, lmEnd] };
    };
    return { addDays, fmtDay, presets };
};

export function stats(bills: Row[]) {
    const live = bills.filter(b => !b.voided && b.kind !== 'building'), paid = live.filter(b => b.kind === 'paid'), free = live.filter(b => b.kind === 'free');
    const sum = (a: Row[], f: (b: Row) => number) => a.reduce((n, b) => n + f(b), 0);
    const custKey = (b: Row) => `${String(b.customer?.room || '').toUpperCase()}|${String(b.customer?.name || '').toLowerCase()}`;
    const byWorker = new Map<string, Row>();
    for (const b of live) {
        const w = byWorker.get(b.worker) || { worker: b.worker, bills: 0, items: 0, cash: 0, card: 0, other: 0, total: 0, free_bills: 0, free_items: 0, free_value: 0 };
        if (b.kind === 'paid') { w.bills++; w.items += b.items; w[b.method] = (w[b.method] || 0) + b.paid; w.total += b.paid; }
        else { w.free_bills++; w.free_items += b.items; w.free_value += b.value; }
        byWorker.set(b.worker, w);
    }
    const byItem = new Map<string, Row>();
    for (const b of live) for (const l of b.lines) {
        const it = byItem.get(l.name) || { name: l.name, qty: 0, revenue: 0, free_qty: 0, free_value: 0 };
        if (b.kind === 'paid') { it.qty += l.qty; it.revenue += l.amount; } else { it.free_qty += l.qty; it.free_value += l.amount; }
        byItem.set(l.name, it);
    }
    const byStaff = new Map<number, Row>();
    for (const b of free) { const s = byStaff.get(b.staff_id) || { staff_id: b.staff_id, name: b.staff_name, bills: 0, items: 0, value: 0 }; s.bills++; s.items += b.items; s.value += b.value; byStaff.set(b.staff_id, s); }
    const byDay = new Map<string, Row>();
    for (const b of live) {
        const d = byDay.get(b.day) || { day: b.day, sales: 0, bills: 0, items: 0, free_items: 0, free_value: 0, customers: new Set<string>() };
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
export type Stats = ReturnType<typeof stats>;
export type Range = { preset: string; from: string; to: string };

export const limitText = (sar: L['sar'], L: Row) => [L.per_bill_items && `${L.per_bill_items}/submission`, L.per_day_items && `${L.per_day_items}/day`, L.per_week_items && `${L.per_week_items}/week`,
    L.per_month_value && `${sar(L.per_month_value)} SAR/month`, L.per_month_bills && `${L.per_month_bills} times/month`].filter(Boolean).join(', ') + (L.enforce ? ' (approval needed above)' : ' (warning only)');

export const fileTag = (r: Range) => (r.from === r.to ? r.from : `${r.from}_to_${r.to}`);
const billRows = (L: L, bills: Row[]) => bills.map(b => ({
    Date: b.day, Time: L.jeddahTime(b.given_at), Receipt: b.receipt_no, Type: b.kind === 'free' ? 'Free (staff)' : 'Paid', Customer: b.kind === 'free' ? b.staff_name : b.customer?.name || '',
    Room: b.customer?.room || '', Group: b.customer?.group || '', Items: b.items, 'Item list': b.lines.map((l: Row) => `${l.name} x${l.qty}`).join(', '),
    'Value SAR': b.value / 100, 'Paid SAR': b.paid / 100, Payment: b.method || '', Worker: b.worker, Status: b.voided ? 'Cancelled' : '', 'Cancel reason': b.void_reason || '',
}));

export async function exportXlsx(libs: Libs, { r, bills, s }: { r: Range; bills: Row[]; s: Stats }) {
    await libs.lib.loadScript(libs.lib.LIBS.xlsx);
    const X = (window as any).XLSX, wb = X.utils.book_new();
    const summary = [
        ['Laundry report', `${r.from} to ${r.to}`], [], ['NORMAL LAUNDRY'], ['Customers', s.paid.customers], ['Bills', s.paid.bills], ['Items', s.paid.items],
        ['Sales SAR', s.paid.sales / 100], ['Cash SAR', s.paid.cash / 100], ['Card SAR', s.paid.card / 100], ['Other SAR', s.paid.other / 100], [],
        ['FREE STAFF LAUNDRY'], ['Staff', s.free.staff], ['Bills', s.free.bills], ['Items', s.free.items], ['Laundry value SAR', s.free.value / 100], ['Collected SAR', 0], [],
        ['TOTAL ITEMS PROCESSED', s.paid.items + s.free.items], ['ACTUAL CASH RECEIVED SAR', s.paid.cash / 100],
    ];
    X.utils.book_append_sheet(wb, X.utils.aoa_to_sheet(summary), 'Summary');
    X.utils.book_append_sheet(wb, X.utils.json_to_sheet(billRows(libs, bills)), 'Transactions');
    X.utils.book_append_sheet(wb, X.utils.json_to_sheet(s.workers.map(w => ({ Worker: w.worker, Bills: w.bills, Items: w.items, 'Cash SAR': (w.cash || 0) / 100, 'Card SAR': (w.card || 0) / 100, 'Other SAR': (w.other || 0) / 100, 'Collection SAR': w.total / 100, 'Free bills': w.free_bills, 'Free items': w.free_items, 'Free value SAR': w.free_value / 100 }))), 'Workers');
    X.utils.book_append_sheet(wb, X.utils.json_to_sheet(s.items.map(i => ({ Item: i.name, 'Paid qty': i.qty, 'Revenue SAR': i.revenue / 100, 'Free qty': i.free_qty, 'Free value SAR': i.free_value / 100 }))), 'Items');
    X.utils.book_append_sheet(wb, X.utils.json_to_sheet(s.staff.map(x => ({ Staff: x.name, 'Free bills': x.bills, Items: x.items, 'Value SAR': x.value / 100 }))), 'Free laundry');
    X.writeFile(wb, `Laundry Report – ${fileTag(r)}.xlsx`);
}
export async function exportPdf(libs: Libs, { r, bills, s }: { r: Range; bills: Row[]; s: Stats }) {
    const { sar } = libs;
    await libs.lib.loadScript(libs.lib.LIBS.jspdf);
    await libs.lib.loadScript(libs.lib.LIBS.autotable);
    const doc = new (window as any).jspdf.jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    doc.setFontSize(14); doc.text(`MOHAMMEDI MAKAN — Laundry Report ${r.from === r.to ? r.from : `${r.from} to ${r.to}`}`, 14, 14);
    doc.setFontSize(10);
    doc.text(`Normal: ${s.paid.customers} customers · ${s.paid.bills} bills · ${s.paid.items} items · sales ${sar(s.paid.sales)} SAR (cash ${sar(s.paid.cash)}, card ${sar(s.paid.card)}, other ${sar(s.paid.other)})`, 14, 21);
    doc.text(`Free staff laundry: ${s.free.staff} staff · ${s.free.bills} bills · ${s.free.items} items · value ${sar(s.free.value)} SAR · collected 0`, 14, 26);
    doc.text(`Total items processed: ${s.paid.items + s.free.items} · Actual cash received: ${sar(s.paid.cash)} SAR`, 14, 31);
    doc.autoTable({ startY: 35, head: [['Worker', 'Bills', 'Items', 'Cash', 'Card', 'Other', 'Collection', 'Free bills/items/value']],
        body: s.workers.map(w => [w.worker, w.bills, w.items, sar(w.cash || 0), sar(w.card || 0), sar(w.other || 0), sar(w.total), `${w.free_bills} / ${w.free_items} / ${sar(w.free_value)}`]), styles: { fontSize: 8 } });
    doc.autoTable({ startY: doc.lastAutoTable.finalY + 6, head: [['Item', 'Paid qty', 'Revenue', 'Free qty', 'Free value']], body: s.items.map(i => [i.name, i.qty, sar(i.revenue), i.free_qty, sar(i.free_value)]), styles: { fontSize: 8 } });
    doc.autoTable({ startY: doc.lastAutoTable.finalY + 6, head: [['Date', 'Time', 'Receipt', 'Type', 'Customer / staff', 'Room', 'Items', 'Value', 'Paid', 'Payment', 'Worker', 'Status']],
        body: billRows(libs, bills).map(x => [x.Date, x.Time, x.Receipt, x.Type, x.Customer, x.Room, x.Items, x['Value SAR'], x['Paid SAR'], x.Payment, x.Worker, x.Status]), styles: { fontSize: 7 } });
    doc.save(`Laundry ${r.from === r.to ? 'Daily ' : ''}Report – ${fileTag(r)}.pdf`);
}

export async function exportBuilding(libs: Libs, d: { r: Range; live: Row[]; names: string[]; byItem: Map<string, number>; days: Row[] }) {
    await libs.lib.loadScript(libs.lib.LIBS.xlsx);
    const X = (window as any).XLSX, wb = X.utils.book_new(), { r, live, names, byItem, days } = d;
    X.utils.book_append_sheet(wb, X.utils.json_to_sheet(names.map(n => ({ Item: n, Pieces: byItem.get(n) || 0 }))), 'Items');
    X.utils.book_append_sheet(wb, X.utils.json_to_sheet(days.map(x => ({ Day: x.day, ...Object.fromEntries(names.map(n => [n, x.items.get(n) || 0])), Pieces: x.pieces, Entries: x.entries }))), 'Days');
    X.utils.book_append_sheet(wb, X.utils.json_to_sheet(live.map(b => ({ Date: b.day, Time: libs.jeddahTime(b.given_at), Receipt: b.receipt_no, ...Object.fromEntries(names.map(n => [n, b.lines.filter((l: Row) => l.name === n).reduce((q: number, l: Row) => q + l.qty, 0)])), Pieces: b.items, Worker: b.worker }))), 'Entries');
    X.writeFile(wb, `Building Linen – ${fileTag(r)}.xlsx`);
}
