import { useRef, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { BarChart, Err, Kpi, Loading, Pic, RangeBar, useLa, useLoad, useRange } from './la';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { printHtml, staffBillHtml, staffStatementHtml } from './staffprint';
import { exportBuilding, exportPdf, exportXlsx, limitText, stats, fileTag, type Stats } from './ladmin';

type Row = Record<string, any>;
const nBills = (n: number) => `${n} bill${n === 1 ? '' : 's'}`;
const Mono = ({ children }: { children: React.ReactNode }) => <span className="font-mono text-xs">{children}</span>;
const Sm = ({ children }: { children: React.ReactNode }) => <small className="block text-xs text-muted-foreground">{children}</small>;
const clickRow = 'cursor-pointer hover:bg-accent/50';

/** Who a bill is for, as one line. */
export function whoOf(b: Row) {
    if (b.kind === 'paid' && b.staff_id) return `👷 ${b.staff_name || b.customer?.name || ''}${b.customer?.room ? ' · Room ' + b.customer.room : ''} · 💵 staff`;   // paid-mode staff
    return b.kind === 'free' ? `👷 ${b.staff_name}` : b.kind === 'building' ? `🏨 Building linen${b.customer?.building ? ' · ' + b.customer.building : ''}` : [b.customer?.building, b.customer?.room].filter(Boolean).join(' · ') || b.customer?.name || '—';
}
export function StaffPhoto({ id, cls = 'size-9' }: { id: number; cls?: string }) {
    const { staff } = useLa();
    const s = staff.find(x => x.id === id);
    return s?.photo ? <img className={cn(cls, 'inline-block rounded-full object-cover align-middle')} src={s.photo} alt="" /> : <span className={cn(cls, 'inline-grid place-items-center rounded-full bg-muted align-middle')}>👤</span>;
}

function KpiBlocks({ s }: { s: Stats }) {
    const { libs } = useLa(); const sar = libs.sar;
    return <>
        <div className="grid gap-3 lg:grid-cols-2">
            <Card><CardHeader><CardTitle className="text-base">🧺 Normal laundry (paid)</CardTitle></CardHeader><CardContent className="flex flex-wrap gap-2">
                <Kpi icon="🙂" value={s.paid.customers} label="customers" /><Kpi icon="🧾" value={s.paid.bills} label="bills" /><Kpi icon="👕" value={s.paid.items} label="items" />
                <Kpi icon="💰" value={sar(s.paid.sales)} label="sales SAR" tone="big" /><Kpi icon="💵" value={sar(s.paid.cash)} label="cash SAR" /><Kpi icon="💳" value={sar(s.paid.card)} label="card SAR" />{s.paid.other ? <Kpi icon="🔁" value={sar(s.paid.other)} label="other SAR" /> : null}</CardContent></Card>
            <Card><CardHeader><CardTitle className="text-base">👷 Staff only laundry</CardTitle></CardHeader><CardContent className="flex flex-wrap gap-2">
                <Kpi icon="👤" value={s.free.staff} label="staff" /><Kpi icon="🧾" value={s.free.bills} label="bills" /><Kpi icon="👕" value={s.free.items} label="items" /><Kpi icon="🏷️" value={sar(s.free.value)} label="laundry value SAR" tone="big" /><Kpi icon="💵" value={0} label="collected SAR" /></CardContent></Card>
        </div>
        <Card className="p-3 text-sm"><b>Total laundry activity:</b> {s.paid.items + s.free.items} items processed ({s.paid.items} paid + {s.free.items} free) · <b>Actual cash received: {sar(s.paid.cash)} SAR</b>{s.voided ? <span className="text-muted-foreground"> · {s.voided} cancelled bill{s.voided === 1 ? '' : 's'} not counted</span> : null}</Card>
    </>;
}

/* ------------------------------ bills ------------------------------ */
// Cash bills only. Unpaid = the worker still holds the cash; the admin marks bills Paid when it is handed over: one bill (✔ button), ticked bills, or
// "amount collected" (ticks the oldest unpaid bills that fit that amount). "From" starts at the oldest unpaid bill (or the last 7 days when all are paid).
// Bills: two parts — Guests (the room cash bills, as before) and Staff (staff in paid mode, 1 SAR a piece: their bills only here, with the printed
// invoice of one bill and the statement of every unpaid one)
export function BillsSplit() {
    // split view (default): guest cash bills and staff paid-laundry bills side by side (stacked on narrow screens); or one of them alone
    type Mode = 'split' | 'guest' | 'staff';
    const [mode, setMode] = useState<Mode>(() => { try { const v = localStorage.getItem('pms_la_bills_view'); return v === 'guest' || v === 'staff' ? v : 'split'; } catch { return 'split'; } });
    const pick = (m: Mode) => { setMode(m); try { localStorage.setItem('pms_la_bills_view', m); } catch { /* ignore */ } };
    const pane = (who: 'guest' | 'staff') => <Card className="min-w-0 gap-2 p-3"><h3 className="font-bold">{who === 'guest' ? '🚪 Guests — paid laundry (room cash bills)' : '👷 Staff — paid laundry bills'}</h3><div className="overflow-x-auto"><BillsTab who={who} /></div></Card>;
    return (
        <div className="grid gap-3">
            <div className="flex flex-wrap gap-1">{([['split', '◫ Split view'], ['guest', '🚪 Guests only'], ['staff', '👷 Staff only']] as [Mode, string][]).map(([m, l]) =>
                <Button key={m} size="sm" variant={mode === m ? 'default' : 'outline'} onClick={() => pick(m)}>{l}</Button>)}</div>
            {mode === 'split' ? <div className="grid items-start gap-3 2xl:grid-cols-2">{pane('guest')}{pane('staff')}</div> : pane(mode)}
        </div>
    );
}

export function BillsTab({ who = 'guest' }: { who?: 'guest' | 'staff' }) {
    const { api, canPay, libs, fmtDay, indexBills, billIndex, site, confirm, openBill } = useLa();
    const staffPart = who === 'staff', siteLabel = site === 'medina' ? 'Madina' : 'Makkah';
    const { sar, jeddahDay, jeddahTime, jeddahDate } = libs;
    const [from, setFrom] = useState<string | null>(null), [to, setTo] = useState(jeddahDay());
    const [sel, setSel] = useState<Set<number>>(new Set()), [collect, setCollect] = useState(''), [note, setNote] = useState(''), [unpaidFirst, setUnpaidFirst] = useState(true);
    const { data: bills, err, reload, set } = useLoad<Row[]>(async () => {
        let f = from;
        if (f === null) { try { const d = (await api('GET', `/api/laundry/oldest-unpaid?site=${site}`)).day; f = d || libs.addDays(jeddahDay(), -6); } catch { f = libs.addDays(jeddahDay(), -6); } setFrom(f); }
        const list = ((await api('GET', `/api/laundry/bills?site=${site}&from=${f}&to=${to}&kind=paid&all=1`)).bills as Row[]).filter(b => !b.voided && (staffPart ? !!b.staff_id : !b.staff_id)).sort((a, b) => a.given_at.localeCompare(b.given_at));
        indexBills(list);
        setSel(s => new Set([...s].filter(id => list.some(b => b.id === id && !b.settled_at))));
        return list;
    }, [from, to]);
    if (err) return <Err e={err} />;
    if (!bills) return <Loading />;
    const unpaid = bills.filter(b => !b.settled_at), paid = bills.filter(b => b.settled_at);
    const sum = (a: Row[]) => a.reduce((n, b) => n + b.paid, 0);
    const picked = unpaid.filter(b => sel.has(b.id));
    const shown = unpaidFirst ? [...unpaid, ...paid] : bills;   // unpaid bills on top (each group stays oldest first)

    async function settle(ids: number[], paidFlag = true) {
        const list = bills!.filter(b => ids.includes(b.id));
        if (!list.length) return;
        const ok = await confirm({ title: paidFlag ? `Mark ${list.length} bill${list.length === 1 ? '' : 's'} PAID?` : 'Mark UNPAID again?', confirmLabel: paidFlag ? 'Mark paid' : 'Mark unpaid',
            body: paidFlag ? `${sar(list.reduce((n, b) => n + b.paid, 0))} SAR received from the worker.` : list.map(b => b.receipt_no).join(', ') });
        if (!ok) return;
        try {
            const r = await api('POST', '/api/laundry/settle', { ids, paid: paidFlag });
            set(bills!.map(b => r.bills.find((x: Row) => x.id === b.id) || b));
            for (const b of r.bills) billIndex.current.set(b.id, b);
            setSel(s => { const n = new Set(s); ids.forEach(i => n.delete(i)); return n; });
        } catch (e: any) { setNote(e.message); }
    }
    function pickByAmount() {
        const amt = Math.round(Number(collect) * 100);
        if (!(amt > 0)) { setNote('Enter the amount collected (SAR).'); return; }
        const n = new Set<number>(); let left = amt;
        for (const b of unpaid) if (b.paid <= left) { n.add(b.id); left -= b.paid; }   // oldest unpaid bills first, as long as they fit
        setSel(n); setNote(left ? `${sar(amt - left)} SAR selected; ${sar(left)} SAR of the amount does not match a whole bill.` : '');
    }
    return (
        <div className="grid gap-3">
            <div className="flex flex-wrap items-end gap-3">
                <div className="grid gap-1"><Label>From</Label><Input type="date" value={from ?? ''} onChange={e => { const f = e.target.value || jeddahDay(); setFrom(f); if (to < f) setTo(f); }} /></div>
                <div className="grid gap-1"><Label>To</Label><Input type="date" value={to} onChange={e => { const t = e.target.value || from || jeddahDay(); setTo(t); if (from && t < from) setFrom(t); }} /></div>
                <Button variant="outline" onClick={reload}>Refresh</Button>
                <Label className="gap-2"><Checkbox checked={unpaidFirst} onCheckedChange={v => setUnpaidFirst(v === true)} />Unpaid first</Label>
            </div>
            <div className="flex flex-wrap gap-2"><Kpi icon="⏳" value={sar(sum(unpaid))} label={`unpaid SAR · ${nBills(unpaid.length)}`} tone="bigneg" /><Kpi icon="✅" value={sar(sum(paid))} label={`paid SAR · ${nBills(paid.length)}`} tone="big" /><Kpi icon="🧾" value={sar(sum(bills))} label={`cash SAR · ${nBills(bills.length)}`} /></div>
            {canPay && <div className="flex flex-wrap items-center gap-2 rounded-xl border bg-card p-2">
                <Button size="sm" variant="outline" onClick={() => setSel(unpaid.length && picked.length === unpaid.length ? new Set() : new Set(unpaid.map(b => b.id)))}>{unpaid.length && picked.length === unpaid.length ? '☐ Clear selection' : '☑ Select all unpaid'}</Button>
                <Label className="flex items-center gap-1.5">Amount collected <Input type="number" min={0} step={0.5} placeholder="SAR" className="h-8 w-28" value={collect} onChange={e => setCollect(e.target.value)} /></Label>
                <Button size="sm" variant="outline" onClick={pickByAmount}>Select bills for this amount</Button>
                <span className="ml-auto text-sm font-bold">{picked.length} selected · {sar(sum(picked))} SAR</span>
                <Button size="sm" disabled={!picked.length} onClick={() => void settle([...sel])}>✔ Mark selected paid</Button></div>}
            {staffPart && <div className="flex flex-wrap items-center gap-2"><Button variant="outline" disabled={!unpaid.length} onClick={() => { if (!printHtml(staffStatementHtml(unpaid, siteLabel))) setNote('Allow pop-ups to print.'); }}>🖨 Print all unpaid ({unpaid.length})</Button>
                <small className="text-muted-foreground">One A4 statement, person by person · or 🖨 on a bill for its own invoice.</small></div>}
            {note && <p className="text-sm text-muted-foreground">{note}</p>}
            {bills.length ? <Table>
                <TableHeader><TableRow>{canPay && <TableHead />}<TableHead>Date</TableHead><TableHead>Time</TableHead><TableHead>Receipt</TableHead><TableHead>{staffPart ? 'Staff · room' : 'Building · room'}</TableHead><TableHead className="text-right">Items</TableHead><TableHead className="text-right">Amount SAR</TableHead><TableHead>Worker</TableHead><TableHead>Status</TableHead>{canPay && <TableHead />}{staffPart && <TableHead />}</TableRow></TableHeader>
                <TableBody>{shown.map(b => (
                    <TableRow key={b.id} className={cn(clickRow, b.settled_at ? '' : 'bg-warn-soft/30', sel.has(b.id) && 'bg-accent')} onClick={() => openBill(b)}>
                        {canPay && <TableCell onClick={e => e.stopPropagation()}>{!b.settled_at && <Checkbox aria-label={`Select ${b.receipt_no}`} checked={sel.has(b.id)} onCheckedChange={v => setSel(s => { const n = new Set(s); if (v === true) n.add(b.id); else n.delete(b.id); return n; })} />}</TableCell>}
                        <TableCell>{fmtDay(b.day)}</TableCell><TableCell>{jeddahTime(b.given_at)}</TableCell><TableCell><Mono>{b.receipt_no}</Mono></TableCell><TableCell>{whoOf(b)}</TableCell>
                        <TableCell className="text-right">{b.items}</TableCell><TableCell className="text-right"><b>{sar(b.paid)}</b></TableCell><TableCell>{b.worker}</TableCell>
                        <TableCell>{b.settled_at ? <><Badge>Paid</Badge> <small className="text-muted-foreground">{jeddahDate(b.settled_at)}{b.settled_by ? ' · ' + b.settled_by : ''}{b.settlement_id ? ' · #' + b.settlement_id : ''}</small></> : <Badge variant="outline">Unpaid</Badge>}</TableCell>
                        {canPay && <TableCell onClick={e => e.stopPropagation()}>{b.settled_at ? <Button size="sm" variant="outline" onClick={() => void settle([b.id], false)}>↩ Unpaid</Button> : <Button size="sm" onClick={() => void settle([b.id])}>✔ Paid</Button>}</TableCell>}
                        {staffPart && <TableCell onClick={e => e.stopPropagation()}><Button size="sm" variant="outline" aria-label={`Print ${b.receipt_no}`} onClick={() => { if (!printHtml(staffBillHtml(b, siteLabel))) setNote('Allow pop-ups to print.'); }}>🖨</Button></TableCell>}
                    </TableRow>))}</TableBody></Table> : <p className="text-sm text-muted-foreground">{staffPart ? 'No paid staff laundry in these dates.' : 'No cash bills in these dates.'}</p>}
        </div>
    );
}

/* ----------------------------- payments log ----------------------------- */
export function PaymentsTab() {
    const { api, site, libs, fmtDay } = useLa();
    const { sar, jeddahTime, jeddahDate } = libs;
    const [r, setR] = useRange('week');
    const [open, setOpen] = useState<Row | null>(null);
    const { data, err } = useLoad<Row[]>(async () => (await api('GET', `/api/laundry/settlements?site=${site}&from=${r.from}&to=${r.to}`)).settlements, [r.from, r.to]);
    const paid = (data ?? []).filter(p => p.action === 'paid'), undone = (data ?? []).filter(p => p.action === 'unpaid');
    const sum = (a: Row[]) => a.reduce((n, p) => n + p.total, 0);
    return (
        <div className="grid gap-3"><RangeBar value={r} onChange={setR} />
            {err ? <Err e={err} /> : !data ? <Loading /> : <>
                <div className="flex flex-wrap gap-2"><Kpi icon="💰" value={sar(sum(paid))} label={`received SAR · ${paid.length} payment${paid.length === 1 ? '' : 's'}`} tone="big" /><Kpi icon="🧾" value={paid.reduce((n, p) => n + p.count, 0)} label="bills marked paid" />{undone.length ? <Kpi icon="↩" value={sar(sum(undone))} label={`undone SAR · ${undone.length}`} tone="neg" /> : null}</div>
                <Card><CardHeader><CardTitle className="text-base">💰 Payments log</CardTitle></CardHeader><CardContent>{data.length ? <Table>
                    <TableHeader><TableRow><TableHead>#</TableHead><TableHead>Date</TableHead><TableHead>Time</TableHead><TableHead>Action</TableHead><TableHead>Marked by</TableHead><TableHead className="text-right">Bills</TableHead><TableHead className="text-right">Amount SAR</TableHead><TableHead>Receipts</TableHead></TableRow></TableHeader>
                    <TableBody>{data.map(p => <TableRow key={p.id} className={clickRow} onClick={() => setOpen(p)}><TableCell><Mono>#{p.id}</Mono></TableCell><TableCell>{fmtDay(p.day)}</TableCell><TableCell>{jeddahTime(p.at)}</TableCell>
                        <TableCell>{p.action === 'paid' ? <Badge>Paid</Badge> : <Badge variant="outline">↩ Unpaid again</Badge>}</TableCell><TableCell>{p.by_name}</TableCell><TableCell className="text-right">{p.count}</TableCell>
                        <TableCell className={cn('text-right font-bold', p.action !== 'paid' && 'text-destructive')}>{p.action === 'paid' ? '' : '−'}{sar(p.total)}</TableCell>
                        <TableCell><Mono>{p.bills.slice(0, 3).map((b: Row) => b.receipt_no).join(', ')}{p.bills.length > 3 ? ` +${p.bills.length - 3} more` : ''}</Mono></TableCell></TableRow>)}</TableBody></Table>
                    : <p className="text-sm text-muted-foreground">No payments in this period.</p>}</CardContent></Card></>}
            <Dialog open={!!open} onOpenChange={o => !o && setOpen(null)}><DialogContent className="max-w-[calc(100%-1rem)] sm:max-w-3xl">
                {open && <><DialogHeader><DialogTitle>💰 Payment #{open.id} · {open.action === 'paid' ? 'Paid' : 'Unpaid again'}</DialogTitle></DialogHeader>
                    <p className="text-sm">{jeddahDate(open.at)} {jeddahTime(open.at)} · marked by <b>{open.by_name}</b> · {nBills(open.count)} · <b>{sar(open.total)} SAR</b></p>
                    <Table><TableHeader><TableRow><TableHead>Receipt</TableHead><TableHead>Bill date</TableHead><TableHead>Building · room</TableHead><TableHead>Worker</TableHead><TableHead className="text-right">Amount SAR</TableHead></TableRow></TableHeader>
                        <TableBody>{open.bills.map((b: Row, i: number) => <TableRow key={i}><TableCell><Mono>{b.receipt_no}</Mono></TableCell><TableCell>{fmtDay(b.day)}</TableCell><TableCell>{b.room || ''}</TableCell><TableCell>{b.worker || ''}</TableCell><TableCell className="text-right">{sar(b.amount)}</TableCell></TableRow>)}</TableBody>
                        <TableFooter><TableRow><TableCell colSpan={4}><b>Total</b></TableCell><TableCell className="text-right"><b>{sar(open.total)}</b></TableCell></TableRow></TableFooter></Table>
                    <p className="text-xs text-muted-foreground">Bill numbers as they were when the payment was recorded.</p></>}</DialogContent></Dialog>
        </div>
    );
}

/* ----------------------------- reports ----------------------------- */
export function ReportsTab() {
    const { api, site, libs, fmtDay, indexBills, items } = useLa();
    const { sar } = libs;
    const [r, setR] = useRange('week');
    const [msg, setMsg] = useState('');
    const { data, err } = useLoad(async () => { const { bills } = await api('GET', `/api/laundry/bills?site=${site}&from=${r.from}&to=${r.to}&all=1`); indexBills(bills); return { bills: bills as Row[], s: stats(bills) }; }, [r.from, r.to]);
    const exp = (f: typeof exportXlsx) => data && f(libs, { r, bills: data.bills, s: data.s }).catch((e: Error) => setMsg(e.message));
    return (
        <div className="grid gap-3"><RangeBar value={r} onChange={setR} />
            {err ? <Err e={err} /> : !data ? <Loading /> : (() => { const s = data.s; return <>
                <div className="flex flex-wrap items-center gap-2"><b>{fmtDay(r.from)} → {fmtDay(r.to)}</b><span className="grow" /><Button size="sm" variant="outline" onClick={() => exp(exportXlsx)}>⬇️ Excel</Button><Button size="sm" variant="outline" onClick={() => exp(exportPdf)}>⬇️ PDF</Button></div>
                {msg && <p className="text-sm text-destructive">{msg}</p>}
                <KpiBlocks s={s} />
                <Card><CardHeader><CardTitle className="text-base">📅 Daily sales (SAR)</CardTitle></CardHeader><CardContent><BarChart rows={s.days.map(d => ({ label: fmtDay(d.day), value: d.sales / 100, note: `${d.bills} bills · ${d.items} items · ${d.customers.size} customers · free ${d.free_items} items` }))} /></CardContent></Card>
                <Card><CardHeader><CardTitle className="text-base">👷 Worker-wise collection</CardTitle></CardHeader><CardContent><Table>
                    <TableHeader><TableRow><TableHead>Worker</TableHead><TableHead className="text-right">Bills</TableHead><TableHead className="text-right">Items</TableHead><TableHead className="text-right">Cash</TableHead><TableHead className="text-right">Card</TableHead><TableHead className="text-right">Other</TableHead><TableHead className="text-right">Collection</TableHead><TableHead className="text-right">Free bills · items · value</TableHead></TableRow></TableHeader>
                    <TableBody>{s.workers.length ? s.workers.map(w => <TableRow key={w.worker}><TableCell><b>{w.worker}</b></TableCell><TableCell className="text-right">{w.bills}</TableCell><TableCell className="text-right">{w.items}</TableCell><TableCell className="text-right">{sar(w.cash || 0)}</TableCell><TableCell className="text-right">{sar(w.card || 0)}</TableCell><TableCell className="text-right">{sar(w.other || 0)}</TableCell><TableCell className="text-right"><b>{sar(w.total)}</b></TableCell><TableCell className="text-right">{w.free_bills} · {w.free_items} · {sar(w.free_value)}</TableCell></TableRow>) : <TableRow><TableCell colSpan={8} className="text-muted-foreground">No bills.</TableCell></TableRow>}</TableBody></Table></CardContent></Card>
                <Card><CardHeader><CardTitle className="text-base">👕 Item-wise</CardTitle></CardHeader><CardContent className="grid gap-3"><Table>
                    <TableHeader><TableRow><TableHead>Item</TableHead><TableHead className="text-right">Paid qty</TableHead><TableHead className="text-right">Revenue SAR</TableHead><TableHead className="text-right">Free qty</TableHead><TableHead className="text-right">Free value SAR</TableHead></TableRow></TableHeader>
                    <TableBody>{s.items.length ? s.items.map(i => <TableRow key={i.name}><TableCell><Pic item={items.find(x => x.name === i.name)} /> {i.name}</TableCell><TableCell className="text-right">{i.qty}</TableCell><TableCell className="text-right">{sar(i.revenue)}</TableCell><TableCell className="text-right">{i.free_qty}</TableCell><TableCell className="text-right">{sar(i.free_value)}</TableCell></TableRow>) : <TableRow><TableCell colSpan={5} className="text-muted-foreground">No items.</TableCell></TableRow>}</TableBody></Table>
                    <BarChart unit="items" rows={s.items.map(i => ({ label: i.name, value: i.qty + i.free_qty, note: `${i.qty} paid + ${i.free_qty} free` }))} /></CardContent></Card></>; })()}
        </div>
    );
}

/* ---------------------------- free laundry ---------------------------- */
export function FreeTab() {
    const { api, site, libs, fmtDay, indexBills, loadStaff, openBill, openStaffHistory } = useLa();
    const { sar, jeddahDate, jeddahTime } = libs;
    const [r, setR] = useRange('today');
    const { data, err } = useLoad(async () => { await loadStaff(); const { bills } = await api('GET', `/api/laundry/bills?site=${site}&from=${r.from}&to=${r.to}&all=1`); const free = (bills as Row[]).filter(b => b.kind === 'free'); indexBills(free); return { free, s: stats(free) }; }, [r.from, r.to]);
    return (
        <div className="grid gap-3"><RangeBar value={r} onChange={setR} />
            {err ? <Err e={err} /> : !data ? <Loading /> : <>
                <Card><CardHeader><CardTitle className="text-base">👷 STAFF ONLY LAUNDRY · {fmtDay(r.from)}{r.to !== r.from ? ' → ' + fmtDay(r.to) : ''}</CardTitle></CardHeader><CardContent className="flex flex-wrap gap-2">
                    <Kpi icon="👤" value={data.s.free.staff} label="staff" /><Kpi icon="🧾" value={data.s.free.bills} label="transactions" /><Kpi icon="👕" value={data.s.free.items} label="clothes" /><Kpi icon="🏷️" value={sar(data.s.free.value)} label="laundry value SAR" tone="big" /><Kpi icon="💵" value={0} label="collected SAR" /></CardContent></Card>
                <Card><CardHeader><CardTitle className="text-base">Staff-wise</CardTitle></CardHeader><CardContent><Table>
                    <TableHeader><TableRow><TableHead>Staff</TableHead><TableHead className="text-right">Transactions</TableHead><TableHead className="text-right">Clothes</TableHead><TableHead className="text-right">Laundry value</TableHead></TableRow></TableHeader>
                    <TableBody>{data.s.staff.length ? data.s.staff.map(x => <TableRow key={x.staff_id} className={clickRow} onClick={() => openStaffHistory(x.staff_id)}><TableCell><StaffPhoto id={x.staff_id} cls="size-7" /> {x.name}</TableCell><TableCell className="text-right">{x.bills}</TableCell><TableCell className="text-right">{x.items}</TableCell><TableCell className="text-right">{sar(x.value)} SAR</TableCell></TableRow>) : <TableRow><TableCell colSpan={4} className="text-muted-foreground">No free laundry in this period.</TableCell></TableRow>}</TableBody></Table></CardContent></Card>
                <Card><CardHeader><CardTitle className="text-base">📒 Staff free laundry register</CardTitle></CardHeader><CardContent><Table>
                    <TableHeader><TableRow><TableHead>Photo</TableHead><TableHead>Staff name</TableHead><TableHead>Given</TableHead><TableHead className="text-right">Count</TableHead><TableHead className="text-right">Value</TableHead><TableHead>Accepted by</TableHead></TableRow></TableHeader>
                    <TableBody>{data.free.length ? data.free.map(b => <TableRow key={b.id} className={cn(clickRow, b.voided && 'opacity-50 line-through')} onClick={() => openBill(b)}><TableCell><StaffPhoto id={b.staff_id} /></TableCell><TableCell><b>{b.staff_name}</b></TableCell><TableCell>{jeddahDate(b.given_at)} {jeddahTime(b.given_at)}</TableCell><TableCell className="text-right">{b.items}</TableCell><TableCell className="text-right">{sar(b.value)} SAR</TableCell><TableCell>{b.worker}{b.voided ? ' · ❌ cancelled' : ''}</TableCell></TableRow>) : <TableRow><TableCell colSpan={6} className="text-muted-foreground">No entries.</TableCell></TableRow>}</TableBody></Table></CardContent></Card></>}
        </div>
    );
}

/* ---------------------------- building linen ---------------------------- */
// Bills of kind 'building' from the laundry screen: towels, bedsheets… sent for washing (no money involved)
export function BuildingTab() {
    const { api, site, libs, fmtDay, indexBills, items, loadItems, openBill } = useLa();
    const { jeddahTime } = libs;
    const [r, setR] = useRange('week');
    const [msg, setMsg] = useState('');
    const { data, err } = useLoad(async () => {
        if (!items.length) await loadItems().catch(() => { /* ignore */ });
        const bills = (await api('GET', `/api/laundry/bills?site=${site}&from=${r.from}&to=${r.to}&kind=building&all=1`)).bills as Row[];
        indexBills(bills);
        const live = bills.filter(b => !b.voided), byItem = new Map<string, number>(), byDay = new Map<string, Row>();
        for (const b of live) {
            for (const l of b.lines) byItem.set(l.name, (byItem.get(l.name) || 0) + l.qty);
            const d = byDay.get(b.day) || { day: b.day, entries: 0, pieces: 0, items: new Map<string, number>() };
            d.entries++; d.pieces += b.items;
            for (const l of b.lines) d.items.set(l.name, (d.items.get(l.name) || 0) + l.qty);
            byDay.set(b.day, d);
        }
        return { bills, live, byItem, days: [...byDay.values()].sort((a, b) => b.day.localeCompare(a.day)) };
    }, [r.from, r.to]);
    if (err) return <div className="grid gap-3"><RangeBar value={r} onChange={setR} /><Err e={err} /></div>;
    // every linen item on the price list, in screen order, then any old names still on bills
    const names = data ? [...items.filter(i => i.category === 'building').map(i => i.name), ...[...data.byItem.keys()].filter(n => !items.some(i => i.category === 'building' && i.name === n))] : [];
    return (
        <div className="grid gap-3"><RangeBar value={r} onChange={setR} />
            {!data ? <Loading /> : <>
                <div className="flex flex-wrap items-center gap-2"><b>{fmtDay(r.from)}{r.to !== r.from ? ' → ' + fmtDay(r.to) : ''}</b><span className="grow" /><Button size="sm" variant="outline" onClick={() => void exportBuilding(libs, { r, live: data.live, names, byItem: data.byItem, days: data.days }).catch((e: Error) => setMsg(e.message))}>⬇️ Excel</Button></div>
                {msg && <p className="text-sm text-destructive">{msg}</p>}
                <Card><CardHeader><CardTitle className="text-base">🏨 BUILDING LINEN</CardTitle></CardHeader><CardContent className="grid gap-3">
                    <div className="flex flex-wrap gap-2"><Kpi icon="🧾" value={data.live.length} label={data.live.length === 1 ? 'entry' : 'entries'} /><Kpi icon="🧺" value={data.live.reduce((n, b) => n + b.items, 0)} label="pieces sent" tone="big" /><Kpi icon="📅" value={data.days.length} label={data.days.length === 1 ? 'day' : 'days'} /></div>
                    <div className="grid grid-cols-[repeat(auto-fill,minmax(7rem,1fr))] gap-2">{names.map(n => <div key={n} className={cn('grid justify-items-center gap-0.5 rounded-xl border bg-card p-2 text-center', !data.byItem.get(n) && 'opacity-50')}><Pic item={items.find(i => i.name === n) || { name: n }} cls="la-ipic big" /><b>{data.byItem.get(n) || 0}</b><small>{n}</small></div>)}</div></CardContent></Card>
                <Card><CardHeader><CardTitle className="text-base">📅 Day-wise</CardTitle></CardHeader><CardContent><Table>
                    <TableHeader><TableRow><TableHead>Day</TableHead>{names.map(n => <TableHead key={n} className="text-right">{n}</TableHead>)}<TableHead className="text-right">Pieces</TableHead><TableHead className="text-right">Entries</TableHead></TableRow></TableHeader>
                    <TableBody>{data.days.length ? data.days.map(d => <TableRow key={d.day}><TableCell>{fmtDay(d.day)}</TableCell>{names.map(n => <TableCell key={n} className="text-right">{d.items.get(n) || ''}</TableCell>)}<TableCell className="text-right"><b>{d.pieces}</b></TableCell><TableCell className="text-right">{d.entries}</TableCell></TableRow>) : <TableRow><TableCell colSpan={names.length + 3} className="text-muted-foreground">Nothing sent in this period.</TableCell></TableRow>}</TableBody></Table></CardContent></Card>
                <Card><CardHeader><CardTitle className="text-base">🧾 Every entry</CardTitle></CardHeader><CardContent>{data.bills.length ? <Table>
                    <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Time</TableHead><TableHead>Receipt</TableHead><TableHead>Items</TableHead><TableHead className="text-right">Pieces</TableHead><TableHead>Worker</TableHead></TableRow></TableHeader>
                    <TableBody>{data.bills.map(b => <TableRow key={b.id} className={cn(clickRow, b.voided && 'opacity-50 line-through')} onClick={() => openBill(b)}><TableCell>{fmtDay(b.day)}</TableCell><TableCell>{jeddahTime(b.given_at)}</TableCell><TableCell><Mono>{b.receipt_no}</Mono></TableCell>
                        <TableCell>{b.lines.map((l: Row) => `${l.name} × ${l.qty}`).join(', ')}</TableCell><TableCell className="text-right"><b>{b.items}</b></TableCell><TableCell>{b.worker}{b.voided ? ' · ❌ cancelled' : ''}</TableCell></TableRow>)}</TableBody></Table> : <p className="text-sm text-muted-foreground">No entries.</p>}</CardContent></Card></>}
        </div>
    );
}

/* ------------------------------ prices ------------------------------ */
export function PricesTab() {
    const { isAdmin, items, loadItems, libs, openItemForm } = useLa();
    const { data: ok, err } = useLoad(async () => { await loadItems(); return true; }, []);
    const card = (i: Row) => (
        <div key={i.id} className={cn('flex items-center gap-3 rounded-xl border bg-card p-3', !i.active && 'opacity-60')}>
            <Pic item={i} cls="la-ipic big" /><div className="grow"><b>{i.name}</b>{i.name_local ? <Sm>{i.name_local}</Sm> : null}<span className="block text-sm font-bold text-primary">{libs.sar(i.price)} SAR</span>{i.active ? null : <Sm>hidden from the worker</Sm>}</div>
            {isAdmin && <Button size="sm" variant="outline" onClick={() => openItemForm(i)}>✏️ Edit</Button>}</div>);
    if (err) return <Err e={err} />;
    if (!ok) return <Loading />;
    const guest = items.filter(i => (i.category || 'guest') === 'guest'), bld = items.filter(i => i.category === 'building');
    return (
        <div className="grid gap-3">
            <div className="flex flex-wrap items-center gap-2"><p className="grow text-sm text-muted-foreground">New prices apply to new bills only; old bills keep the price they were billed at.</p>{isAdmin && <Button onClick={() => openItemForm(null)}>➕ Add item</Button>}</div>
            <h3 className="font-bold">🧺 Clothes (New bill · Staff only)</h3><div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">{guest.map(card)}</div>
            <h3 className="font-bold">🏨 Building linen (Building tab)</h3><div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">{bld.length ? bld.map(card) : <p className="text-sm text-muted-foreground">None yet.</p>}</div>
        </div>
    );
}

/* ------------------------------ staff ------------------------------ */
// Staff profiles: tick people (or a whole category) for bulk changes — archive / restore, paid mode on / off, move to a category — and print
// person-wise bills for a date range (dates and pieces only). Paid mode = 1 SAR a piece, receipts NAME-ROOM-01, 02 … per person, shown as unpaid
// cash bills until marked paid (Bills tab / Pending cash). Archived people leave the laundry screen; their history stays.
const esc = (v: unknown) => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string));
export function personBillsHtml(people: Row[], bills: Row[], from: string, to: string, fmt: (d: string) => string) {
    const pages = people.map(p => {
        const mine = bills.filter(b => b.staff_id === p.id && !b.voided && (b.kind === 'free' || b.kind === 'paid'));
        const byDay = new Map<string, number>();
        for (const b of mine) byDay.set(b.day, (byDay.get(b.day) || 0) + b.items);
        const days = [...byDay].sort((a, b) => a[0].localeCompare(b[0]));
        const total = days.reduce((n, [, q]) => n + q, 0);
        return `<section class="pb"><h1>${esc(p.name)}</h1><p class="sub">${[p.room && 'Room ' + esc(p.room), p.category && esc(p.category), p.charged ? 'Paid laundry' : 'Staff laundry'].filter(Boolean).join(' · ')}</p>
            <p class="sub">${fmt(from)} → ${fmt(to)}</p>
            <table><thead><tr><th>Date</th><th>Pieces</th></tr></thead><tbody>${days.length ? days.map(([d, q]) => `<tr><td>${fmt(d)}</td><td>${q}</td></tr>`).join('') : '<tr><td colspan="2">No laundry in these dates</td></tr>'}</tbody>
            <tfoot><tr><th>Total</th><th>${total}</th></tr></tfoot></table></section>`;
    }).join('');
    return `<!doctype html><html><head><meta charset="utf-8"><title>Staff laundry ${from} to ${to}</title><style>
        @page{size:A5;margin:10mm} body{font:13px system-ui,sans-serif;color:#111;margin:0}
        .pb{page-break-after:always} .pb:last-child{page-break-after:auto} h1{font-size:20px;margin:0 0 2px} .sub{margin:0 0 4px;color:#444}
        table{width:100%;border-collapse:collapse;margin-top:8px} th,td{border:1px solid #333;padding:5px 8px;text-align:left} td:last-child,th:last-child{text-align:right;width:30%}
        thead th{background:#eee} tfoot th{font-size:15px}</style></head><body>${pages}</body></html>`;
}

export function StaffTab() {
    const { isAdmin, staff, cats, loadStaff, api, site, setCats, setStaff, libs, confirm, prompt, openStaffForm, openStaffHistory, fmtDay } = useLa();
    const [q, setQ] = useState(''), [cat, setCat] = useState('*'), [newCat, setNewCat] = useState(''), [msg, setMsg] = useState('');
    const [view, setView] = useState<'live' | 'archived'>('live'), [sel, setSel] = useState<Set<number>>(new Set()), [moveTo, setMoveTo] = useState('');
    const today = libs.jeddahDay();
    const [pr, setPr] = useState<{ open: boolean; from: string; to: string; busy: boolean }>({ open: false, from: today.slice(0, 8) + '01', to: today, busy: false });
    const printFor = useRef<number[]>([]);
    const { data: ok, err } = useLoad(async () => { await loadStaff(); return true; }, []);
    if (err) return <Err e={err} />;
    if (!ok) return <Loading />;
    const catOf = (s: Row) => (cats.includes(s.category) ? s.category : '');
    const people = staff.filter(s => !s.deleted && (view === 'archived' ? s.archived : !s.archived));
    const n = (c: string) => people.filter(s => (c === '' ? !cats.includes(s.category) : s.category === c)).length;
    const list = people.filter(s => cat === '*' || catOf(s) === cat).filter(s => !q.trim() || [s.name, s.staff_code, s.room, s.contact, s.department].some(v => String(v || '').toLowerCase().includes(q.trim().toLowerCase())));
    const picked = people.filter(s => sel.has(s.id));
    const inCat = (c: string) => people.filter(s => catOf(s) === c);
    const catState = (c: string) => { const m = inCat(c); const k = m.filter(s => sel.has(s.id)).length; return !m.length || !k ? false : k === m.length ? true : 'indeterminate' as const; };
    const tick = (ids: number[], on: boolean) => setSel(x => { const nx = new Set(x); ids.forEach(i => (on ? nx.add(i) : nx.delete(i))); return nx; });
    async function saveCats(categories: string[], renames: Record<string, string> = {}) {
        try { const r = await api('PUT', '/api/laundry/staff-categories', { site, categories, renames }); setCats(r.categories); setStaff(r.staff); setMsg(''); } catch (e: any) { setMsg(e.message); }
    }
    async function rename(old: string) {
        const name = ((await prompt({ title: `Rename "${old}" to:`, value: old })) || '').trim();
        if (!name || name === old) return;
        if (cats.some(c => c !== old && c.toLowerCase() === name.toLowerCase())) { setMsg(`"${name}" is already a category.`); return; }
        await saveCats(cats.map(c => (c === old ? name : c)), { [old]: name });
    }
    async function del(s: Row) {
        // "Delete" hides the profile everywhere; the record and its free-laundry history stay in the database
        if (!(await confirm({ title: `Delete ${s.name}?`, confirmLabel: 'Delete', body: "The profile disappears from this list and from the worker's free-laundry search, so no new free laundry can be given.\nThe record and all past free-laundry entries stay saved (register, reports, history)." }))) return;
        try { setStaff((await api('DELETE', `/api/laundry/staff/${s.id}`)).staff); } catch (e: any) { setMsg(e.message); }
    }
    const LABEL: Record<string, string> = { archive: '🗄 Archive', restore: '♻️ Restore', charged: '💵 Paid mode on', free: '🆓 Free (paid mode off)', category: '🗂️ Move' };
    async function bulk(action: string, ids: number[], extra: Row = {}) {
        if (!ids.length) return;
        const who = people.filter(s => ids.includes(s.id));
        const body = action === 'charged' ? 'Their next laundry costs 1 SAR a piece, gets their own receipt number (NAME-ROOM-01, 02 …) and waits as unpaid until marked paid.'
            : action === 'free' ? 'Their next laundry is free staff laundry again. Bills already made stay as they are.'
            : action === 'archive' ? 'They leave the laundry screen. Their history stays; restore them any time from "Archived".' : undefined;
        if (!(await confirm({ title: `${LABEL[action]}${action === 'category' ? ` to "${extra.category || 'Uncategorized'}"` : ''} — ${who.length} ${who.length === 1 ? 'person' : 'people'}?`, body: <>{body && <p>{body}</p>}<p className="text-xs text-muted-foreground">{who.map(s => s.name).join(', ')}</p></>, confirmLabel: 'Apply' }))) return;
        try { const r = await api('POST', '/api/laundry/staff-bulk', { site, ids, action, ...extra }); setStaff(r.staff); setSel(new Set()); setMsg(`${r.changed} updated.`); } catch (e: any) { setMsg(e.message); }
    }
    async function printBills(ids: number[]) {
        if (!ids.length) return;
        if (pr.from > pr.to) { setMsg('"From" is after "To".'); return; }
        setPr(p => ({ ...p, busy: true }));
        try {
            const { bills } = await api('GET', `/api/laundry/bills?site=${site}&from=${pr.from}&to=${pr.to}&all=1`);
            const w = window.open('', '_blank');
            if (!w) { setMsg('Allow pop-ups to print.'); return; }
            w.document.write(personBillsHtml(staff.filter(s => ids.includes(s.id)), bills, pr.from, pr.to, fmtDay));
            w.document.close(); w.focus(); setTimeout(() => w.print(), 300);
            setPr(p => ({ ...p, open: false }));
        } catch (e: any) { setMsg(e.message); } finally { setPr(p => ({ ...p, busy: false })); }
    }
    const openPrint = (ids: number[]) => { printFor.current = ids; setPr(p => ({ ...p, open: true })); };
    const allShown = list.length > 0 && list.every(s => sel.has(s.id));
    return (
        <div className="grid gap-3">
            <Card><CardHeader><CardTitle className="text-base">🗂️ Staff categories <small className="font-normal text-muted-foreground">— tick a category to select all its people; the laundry screen shows these first</small></CardTitle></CardHeader><CardContent className="grid gap-3">
                <div className="flex flex-wrap gap-2">{[...cats, ''].map(c => <span key={c || '-'} className={cn('inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm', c ? 'bg-accent' : 'text-muted-foreground')}>
                    <Checkbox aria-label={`Select everyone in ${c || 'Uncategorized'}`} checked={catState(c)} disabled={!inCat(c).length} onCheckedChange={v => tick(inCat(c).map(s => s.id), v === true)} />
                    <b>{c || 'Uncategorized'}</b> <small>{n(c)}</small>
                    {isAdmin && c && <><button type="button" aria-label={`Rename ${c}`} onClick={() => void rename(c)}>✏️</button><button type="button" aria-label={`Delete ${c}`} onClick={async () => { if (await confirm({ title: `Delete the category "${c}"?`, body: 'Its staff stay, under "Uncategorized".', confirmLabel: 'Delete' })) await saveCats(cats.filter(x => x !== c)); }}>🗑</button></>}</span>)}</div>
                {isAdmin && <div className="flex flex-wrap gap-2"><Input className="max-w-xs" maxLength={40} placeholder="New category, e.g. Kitchen" value={newCat} onChange={e => setNewCat(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(), document.getElementById('catAdd')?.click(); }} />
                    <Button id="catAdd" onClick={async () => { const name = newCat.trim(); if (!name) return; if (cats.some(c => c.toLowerCase() === name.toLowerCase())) { setMsg(`"${name}" is already a category.`); return; } setNewCat(''); await saveCats([...cats, name]); }}>➕ Add category</Button></div>}
                </CardContent></Card>
            <div className="flex flex-wrap items-center gap-2"><Input type="search" className="max-w-xs" placeholder="🔎 Name, staff ID, room, mobile" value={q} onChange={e => setQ(e.target.value)} />
                <select aria-label="Category" className="h-9 rounded-md border bg-background px-2 text-sm" value={cat} onChange={e => setCat(e.target.value)}><option value="*">All categories</option>{cats.map(c => <option key={c} value={c}>{c}</option>)}<option value="">Uncategorized</option></select>
                <div className="inline-flex rounded-md border p-0.5 text-sm">{(['live', 'archived'] as const).map(v => <button key={v} type="button" className={cn('rounded px-3 py-1', view === v && 'bg-primary text-primary-foreground')} onClick={() => { setView(v); setSel(new Set()); }}>{v === 'live' ? `👥 Current (${staff.filter(s => !s.deleted && !s.archived).length})` : `🗄 Archived (${staff.filter(s => !s.deleted && s.archived).length})`}</button>)}</div>
                {isAdmin && <Button onClick={() => openStaffForm(null)}>➕ Add staff</Button>}</div>
            <div className="sticky top-14 z-10 flex flex-wrap items-center gap-2 rounded-xl border bg-card p-2 shadow-sm">
                <Label className="gap-2"><Checkbox checked={allShown ? true : list.some(s => sel.has(s.id)) ? 'indeterminate' : false} onCheckedChange={v => tick(list.map(s => s.id), v === true)} />Select all shown</Label>
                <b className="text-sm">{picked.length} selected</b>{picked.length > 0 && <Button size="sm" variant="ghost" onClick={() => setSel(new Set())}>Clear</Button>}
                <span className="grow" />
                <Button size="sm" variant="outline" disabled={!picked.length} onClick={() => openPrint(picked.map(s => s.id))}>🖨 Print bills</Button>
                {isAdmin && <>
                    {view === 'live' ? <Button size="sm" variant="outline" disabled={!picked.length} onClick={() => void bulk('archive', picked.map(s => s.id))}>{LABEL.archive}</Button>
                        : <Button size="sm" variant="outline" disabled={!picked.length} onClick={() => void bulk('restore', picked.map(s => s.id))}>{LABEL.restore}</Button>}
                    <Button size="sm" variant="outline" disabled={!picked.length} onClick={() => void bulk('charged', picked.map(s => s.id))}>{LABEL.charged}</Button>
                    <Button size="sm" variant="outline" disabled={!picked.length} onClick={() => void bulk('free', picked.map(s => s.id))}>{LABEL.free}</Button>
                    <select aria-label="Move to category" className="h-8 rounded-md border bg-background px-2 text-sm" value={moveTo} onChange={e => setMoveTo(e.target.value)}><option value="">Uncategorized</option>{cats.map(c => <option key={c} value={c}>{c}</option>)}</select>
                    <Button size="sm" variant="outline" disabled={!picked.length} onClick={() => void bulk('category', picked.map(s => s.id), { category: moveTo })}>{LABEL.category}</Button></>}
            </div>
            {msg && <p className="text-sm text-muted-foreground">{msg}</p>}
            <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">{list.map(s => (
                <div key={s.id} className={cn('flex gap-3 rounded-xl border bg-card p-3', (!(s.active && s.free) || s.archived) && 'opacity-60', sel.has(s.id) && 'ring-2 ring-primary')}>
                    <Checkbox className="mt-1" aria-label={`Select ${s.name}`} checked={sel.has(s.id)} onCheckedChange={v => tick([s.id], v === true)} />
                    {s.photo ? <img src={s.photo} alt="" className="size-16 rounded-lg object-cover" /> : <span className="grid size-16 place-items-center rounded-lg bg-muted text-2xl">👤</span>}
                    <div className="grid min-w-0 gap-0.5"><b>{s.name}</b><Sm>🗂️ {catOf(s) || 'Uncategorized'}</Sm><Sm>{[s.staff_code && 'ID ' + s.staff_code, s.department, s.room && 'Room ' + s.room].filter(Boolean).join(' · ')}</Sm>
                        <Sm>{s.archived ? '🗄 Archived' : !(s.active && s.free) ? '⛔ Not active' : s.charged ? '💵 Paid · 1 SAR a piece' : '🆓 Free laundry'}{!s.charged && Object.keys(s.limits || {}).some(k => k !== 'enforce' && s.limits[k]) ? ' · ' + limitText(libs.sar, s.limits) : ''}</Sm>
                        <span className="mt-1 flex flex-wrap gap-1"><Button size="sm" variant="outline" onClick={() => openStaffHistory(s.id)}>📒 History</Button><Button size="sm" variant="outline" onClick={() => openPrint([s.id])}>🖨 Bills</Button>
                            {isAdmin && <><Button size="sm" variant="outline" onClick={() => openStaffForm(s)}>✏️ Edit</Button>
                                <Button size="sm" variant="outline" onClick={() => void bulk(s.charged ? 'free' : 'charged', [s.id])}>{s.charged ? '🆓 Make free' : '💵 Make paid'}</Button>
                                <Button size="sm" variant="outline" onClick={() => void bulk(s.archived ? 'restore' : 'archive', [s.id])}>{s.archived ? LABEL.restore : LABEL.archive}</Button>
                                <Button size="sm" variant="outline" className="text-destructive" onClick={() => void del(s)}>🗑 Delete</Button></>}</span></div></div>))}
                {!list.length && <p className="text-sm text-muted-foreground">{people.length ? 'Nobody matches.' : view === 'archived' ? 'Nobody is archived.' : 'No staff yet.'}</p>}</div>
            <Dialog open={pr.open} onOpenChange={o => setPr(p => ({ ...p, open: o }))}>
                <DialogContent className="max-w-sm"><DialogHeader><DialogTitle>🖨 Person-wise bills</DialogTitle></DialogHeader>
                    <p className="text-sm text-muted-foreground">{printFor.current.length === 1 ? staff.find(s => s.id === printFor.current[0])?.name : `${printFor.current.length} people`} — one page each, dates and pieces only.</p>
                    <div className="grid grid-cols-2 gap-2"><div className="grid gap-1"><Label>From</Label><Input type="date" value={pr.from} onChange={e => setPr(p => ({ ...p, from: e.target.value || p.from }))} /></div>
                        <div className="grid gap-1"><Label>To</Label><Input type="date" value={pr.to} onChange={e => setPr(p => ({ ...p, to: e.target.value || p.to }))} /></div></div>
                    <Button disabled={pr.busy} onClick={() => void printBills(printFor.current)}>{pr.busy ? 'Loading…' : '🖨 Print'}</Button></DialogContent></Dialog>
        </div>
    );
}

/* --------------------------- notice & log --------------------------- */
export function NoticeTab() {
    const { isAdmin, api, libs, info, setInfo, site } = useLa();
    const { jeddahDate, jeddahTime } = libs;
    const [text, setText] = useState(info), [msg, setMsg] = useState('');
    const { data: audit, err } = useLoad<Row[]>(async () => { try { const r = await api('GET', `/api/settings?site=${site}`); const v = r.settings.laundry_info || libs.DEFAULT_INFO; setInfo(v); setText(v); } catch { /* ignore */ } return (await api('GET', '/api/laundry/audit')).audit; }, []);
    return (
        <div className="grid gap-3">
            <Card><CardHeader><CardTitle className="text-base">Notice for the laundry screen and receipts</CardTitle></CardHeader><CardContent className="grid gap-2">
                <Textarea rows={4} maxLength={600} readOnly={!isAdmin} value={text} onChange={e => setText(e.target.value)} />
                <div className="flex items-center gap-2"><span className="grow text-sm text-muted-foreground">{msg}</span>{isAdmin && <Button onClick={async () => { try { await api('PUT', '/api/settings', { settings: { laundry_info: text.trim() }, site }); setInfo(text.trim()); setMsg('Saved — shown on the laundry screen and receipts.'); } catch (e: any) { setMsg(e.message); } }}>Save notice</Button>}</div></CardContent></Card>
            <Card><CardHeader><CardTitle className="text-base">Laundry change log</CardTitle></CardHeader><CardContent>{err ? <Err e={err} /> : !audit ? <Loading /> : <ul className="grid gap-1.5 text-sm">{audit.length ? audit.map((a, i) => <li key={i}><small className="block text-xs text-muted-foreground">{jeddahDate(a.at)} {jeddahTime(a.at)} · {a.desk || ''} · {String(a.action).replace('laundry-', '')}</small>{a.detail || ''}</li>) : <li className="text-muted-foreground">Nothing yet.</li>}</ul>}</CardContent></Card>
        </div>
    );
}

export { fileTag };
