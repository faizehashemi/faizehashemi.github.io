import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { Kpi, Pic, useLa } from './la';
import { limitText } from './ladmin';
import { StaffPhoto } from './tabs';

type Row = Record<string, any>;
const Sm = ({ children }: { children: React.ReactNode }) => <small className="block text-xs text-muted-foreground">{children}</small>;
const field = (label: string, el: React.ReactNode, cls = '') => <div className={cn('grid gap-1', cls)}><Label>{label}</Label>{el}</div>;

/** One bill: the receipt, details, audit, and (admin) edit / cancel / reprint. */
export function BillDialog({ bill, onClose, onEdit, onChanged }: { bill: Row | null; onClose: () => void; onEdit: (b: Row) => void; onChanged: () => void }) {
    const { api, isAdmin, libs, staff, prompt, billIndex } = useLa();
    const { sar, jeddahDate, jeddahTime } = libs;
    const [log, setLog] = useState<Row[]>([]), [err, setErr] = useState('');
    const b = bill;
    useEffect(() => { setErr(''); setLog([]); if (b) api('GET', '/api/laundry/audit').then(r => setLog((r.audit as Row[]).filter(a => (a.detail || '').includes(b.receipt_no)))).catch(() => { /* ignore */ }); }, [b?.id, b?.version]);   // eslint-disable-line react-hooks/exhaustive-deps
    async function voidIt() {
        if (!b) return;
        const why = await prompt({ title: `Cancel ${b.receipt_no} (${b.kind === 'free' ? 'free' : sar(b.paid) + ' SAR'})?`, body: 'It stays in the records, marked cancelled. Reason:' });
        if (!why) return;
        try { const r = await api('POST', `/api/laundry/bills/${b.id}/void`, { reason: why }); billIndex.current.set(b.id, r.bill); onClose(); onChanged(); } catch (e: any) { setErr(e.message); }
    }
    const photoSm = b?.kind === 'free' ? staff.find(s => s.id === b.staff_id) : null;
    return (
        <Dialog open={!!b} onOpenChange={o => !o && onClose()}>
            <DialogContent className="max-h-[92vh] max-w-[calc(100%-1rem)] overflow-y-auto sm:max-w-4xl">
                {b && <>
                    <DialogHeader><DialogTitle>{b.receipt_no} {b.voided ? <Badge variant="destructive">❌ CANCELLED</Badge> : null}</DialogTitle><DialogDescription className="sr-only">Bill details</DialogDescription></DialogHeader>
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="overflow-auto rounded-lg border bg-white p-2" dangerouslySetInnerHTML={{ __html: libs.laundry.receiptHTML(b, '') }} />
                        <div className="grid content-start gap-2 text-sm">
                            {b.kind === 'free' && <div className="flex items-center gap-2"><StaffPhoto id={b.staff_id} cls="size-12" /><div><b>{b.staff_name}</b><Sm>Free staff laundry · value {sar(b.value)} SAR · paid 0</Sm></div></div>}
                            {photoSm ? null : null}
                            <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
                                <dt className="text-muted-foreground">Given</dt><dd>{jeddahDate(b.given_at)} {jeddahTime(b.given_at)} · by {b.worker}</dd>
                                {b.kind === 'paid' && <><dt className="text-muted-foreground">Cash</dt><dd>{b.settled_at ? <><Badge>Paid</Badge> {jeddahDate(b.settled_at)} {jeddahTime(b.settled_at)}{b.settled_by ? ' · marked by ' + b.settled_by : ''}{b.settlement_id ? ` · payment #${b.settlement_id}` : ''}</> : <Badge variant="outline">Unpaid</Badge>}</dd></>}
                                {b.old_receipt_no && b.old_receipt_no !== b.receipt_no && <><dt className="text-muted-foreground">Earlier No.</dt><dd><span className="font-mono">{b.old_receipt_no}</span> <small className="text-muted-foreground">(printed before the 4 Oct renumbering)</small></dd></>}
                                {b.customer?.group && <><dt className="text-muted-foreground">Group</dt><dd>{b.customer.group}{b.customer.building ? ' · ' + b.customer.building : ''}</dd></>}
                                {b.customer?.contact && <><dt className="text-muted-foreground">Contact</dt><dd>{b.customer.contact}</dd></>}
                                {b.approval_by && <><dt className="text-muted-foreground">Approved by</dt><dd>{b.approval_by}</dd></>}
                                {b.warnings?.length ? <><dt className="text-muted-foreground">Limits</dt><dd className="text-warn">{b.warnings.map((w: string, i: number) => <span key={i}>{w}<br /></span>)}</dd></> : null}
                                {b.voided && <><dt className="text-muted-foreground">Cancelled</dt><dd>{b.void_reason || ''}</dd></>}
                                {b.updated_by && <><dt className="text-muted-foreground">Last change</dt><dd>{b.updated_by} · {jeddahDate(b.updated_at)} {jeddahTime(b.updated_at)}</dd></>}
                            </dl>
                            <h3 className="font-bold">History</h3>
                            {log.length ? <ul className="grid gap-1">{log.map((a, i) => <li key={i}><small className="block text-xs text-muted-foreground">{jeddahDate(a.at)} {jeddahTime(a.at)} · {a.desk || ''}</small>{a.detail}</li>)}</ul> : <p className="text-muted-foreground">No changes since it was saved.</p>}
                            {err && <p className="text-destructive">{err}</p>}
                            <div className="flex flex-wrap gap-2"><Button variant="outline" onClick={() => libs.laundry.printReceipt(b, libs.info)}>🖨 Reprint</Button>
                                {isAdmin && !b.voided && <><Button variant="outline" onClick={() => onEdit(b)}>✏️ Edit</Button><Button variant="outline" className="text-destructive" onClick={() => void voidIt()}>❌ Cancel bill</Button></>}</div>
                        </div>
                    </div>
                </>}
            </DialogContent>
        </Dialog>
    );
}

export function EditBillDialog({ bill, onClose, onSaved }: { bill: Row | null; onClose: () => void; onSaved: (b: Row) => void }) {
    const { api, items, libs, billIndex } = useLa();
    const b = bill;
    const [qty, setQty] = useState<Map<number, number>>(new Map()), [cust, setCust] = useState<Row>({}), [err, setErr] = useState('');
    useEffect(() => { if (b) { setQty(new Map(b.lines.map((l: Row) => [l.item_id, l.qty]))); setCust({ ...(b.customer || {}) }); setErr(''); } }, [b?.id, b?.version]);   // eslint-disable-line react-hooks/exhaustive-deps
    if (!b) return <Dialog open={false} onOpenChange={() => { /* closed */ }}><DialogContent><DialogTitle /></DialogContent></Dialog>;
    const known = new Map<number, Row>(b.lines.map((l: Row) => [l.item_id, l]));
    const addable = items.filter(i => i.active && !qty.has(i.id) && (i.category || 'guest') === (b.kind === 'building' ? 'building' : 'guest'));
    async function save(e: React.FormEvent) {
        e.preventDefault();
        if (!qty.size) { setErr('A bill needs at least one item. To remove it completely, cancel the bill instead.'); return; }
        const payload: Row = { version: b!.version, lines: [...qty].map(([item_id, q]) => ({ item_id, qty: q })) };
        if (b!.kind === 'paid') { payload.customer = { name: cust.name || '', room: cust.room || '', building: cust.building || '', group: cust.group || '', contact: cust.contact || '' }; payload.method = 'cash'; payload.received = ''; }
        try { const r = await api('PUT', `/api/laundry/bills/${b!.id}`, payload); billIndex.current.set(b!.id, r.bill); onSaved(r.bill); } catch (er: any) { setErr(er.message); }
    }
    const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setCust(c => ({ ...c, [k]: e.target.value }));
    return (
        <Dialog open onOpenChange={o => !o && onClose()}>
            <DialogContent className="max-h-[92vh] max-w-[calc(100%-1rem)] overflow-y-auto sm:max-w-lg">
                <form className="grid gap-3" onSubmit={e => void save(e)}>
                    <DialogHeader><DialogTitle>✏️ Edit {b.receipt_no}</DialogTitle><DialogDescription className="sr-only">Edit the bill</DialogDescription></DialogHeader>
                    {b.kind === 'paid' ? <div className="grid gap-2 sm:grid-cols-2">
                        {field('Name', <Input value={cust.name || ''} onChange={set('name')} />)}{field('Room', <Input value={cust.room || ''} onChange={set('room')} />)}
                        {field('Building', <Input value={cust.building || ''} onChange={set('building')} />)}{field('Group', <Input value={cust.group || ''} onChange={set('group')} />)}{field('Contact', <Input value={cust.contact || ''} onChange={set('contact')} />)}</div>
                        : b.kind === 'building' ? <p>🏨 Building linen</p> : <p>👷 {b.staff_name} (staff only)</p>}
                    <Table><TableBody>{[...qty].map(([id, q]) => { const l = known.get(id) || items.find(i => i.id === id) || { name: '?', price: 0 };
                        return <TableRow key={id}><TableCell>{l.name} <small className="text-muted-foreground">{libs.sar(l.price)} SAR{known.has(id) ? '' : " (today's price)"}</small></TableCell>
                            <TableCell className="text-right"><Button type="button" size="sm" variant="outline" onClick={() => setQty(m => { const n = new Map(m); if (q > 1) n.set(id, q - 1); else n.delete(id); return n; })}>−</Button> <b className="mx-1">{q}</b> <Button type="button" size="sm" variant="outline" onClick={() => setQty(m => new Map(m).set(id, q + 1))}>+</Button></TableCell></TableRow>; })}</TableBody></Table>
                    <select aria-label="Add an item" className="h-9 rounded-md border bg-background px-2 text-sm" value="" onChange={e => { const id = Number(e.target.value); if (id) setQty(m => new Map(m).set(id, 1)); }}><option value="">➕ Add an item…</option>{addable.map(i => <option key={i.id} value={i.id}>{i.name} · {libs.sar(i.price)} SAR</option>)}</select>
                    <p className="text-xs text-muted-foreground">Lines already on the bill keep the price they were billed at. Every change is written to the history.</p>
                    {err && <p className="text-sm text-destructive">{err}</p>}
                    <DialogFooter className="gap-2"><Button type="button" variant="outline" onClick={onClose}>Cancel</Button><Button type="submit">Save changes</Button></DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

export function StaffHistoryDialog({ id, onClose, onBill }: { id: number | null; onClose: () => void; onBill: (b: Row) => void }) {
    const { api, libs, fmtDay, indexBills, billIndex } = useLa();
    const { sar, jeddahTime } = libs;
    const [data, setData] = useState<Row | null>(null), [err, setErr] = useState('');
    useEffect(() => { setData(null); setErr(''); if (id != null) api('GET', `/api/laundry/staff/${id}?bills=1`).then(d => { indexBills(d.bills || []); setData(d); }).catch(e => setErr(e.message)); }, [id]);   // eslint-disable-line react-hooks/exhaustive-deps
    const s = data?.staff, bills: Row[] = data?.bills || [], live = bills.filter(b => !b.voided);
    const months = new Map<string, Row>();
    for (const b of live) { const m = months.get(b.day.slice(0, 7)) || { m: b.day.slice(0, 7), bills: 0, items: 0, value: 0 }; m.bills++; m.items += b.items; m.value += b.value; months.set(m.m, m); }
    return (
        <Dialog open={id != null} onOpenChange={o => !o && onClose()}>
            <DialogContent className="max-h-[92vh] max-w-[calc(100%-1rem)] overflow-y-auto sm:max-w-3xl">
                <DialogHeader><DialogTitle>{s?.name ?? 'Staff history'}</DialogTitle><DialogDescription className="sr-only">Free laundry history</DialogDescription></DialogHeader>
                {err && <p className="text-sm text-destructive">{err}</p>}
                {s && <>
                    <div className="flex gap-3">{s.photo ? <img src={s.photo} alt="" className="size-24 rounded-lg object-cover" /> : <span className="grid size-24 place-items-center rounded-lg bg-muted text-3xl">👤</span>}
                        <div className="grid gap-2"><p className="text-sm">{[s.staff_code && 'ID ' + s.staff_code, s.department, s.room && 'Room ' + s.room, s.contact].filter(Boolean).join(' · ')}</p>
                            <div className="flex flex-wrap gap-2"><Kpi icon="🧾" value={live.length} label="transactions" /><Kpi icon="👕" value={live.reduce((n, b) => n + b.items, 0)} label="clothes" /><Kpi icon="🏷️" value={sar(live.reduce((n, b) => n + b.value, 0))} label="value SAR" tone="big" /><Kpi icon="💵" value={0} label="paid SAR" /></div>
                            <p className="text-xs text-muted-foreground">This month so far: {data!.usage.month_bills} times · {data!.usage.month_items} clothes · {sar(data!.usage.month_value)} SAR{s.limits && Object.keys(s.limits).some(k => k !== 'enforce' && s.limits[k]) ? ` · limits: ${limitText(sar, s.limits)}` : ''}</p></div></div>
                    <h3 className="font-bold">By month</h3>
                    <Table><TableHeader><TableRow><TableHead>Month</TableHead><TableHead className="text-right">Submissions</TableHead><TableHead className="text-right">Clothes</TableHead><TableHead className="text-right">Laundry value</TableHead></TableRow></TableHeader>
                        <TableBody>{months.size ? [...months.values()].sort((a, b) => b.m.localeCompare(a.m)).map(m => <TableRow key={m.m}><TableCell>{new Date(m.m + '-15T12:00:00Z').toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}</TableCell><TableCell className="text-right">{m.bills}</TableCell><TableCell className="text-right">{m.items}</TableCell><TableCell className="text-right">{sar(m.value)} SAR</TableCell></TableRow>) : <TableRow><TableCell colSpan={4} className="text-muted-foreground">No free laundry yet.</TableCell></TableRow>}</TableBody></Table>
                    <h3 className="font-bold">Transaction history</h3>
                    <Table><TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Given</TableHead><TableHead className="text-right">Clothes</TableHead><TableHead className="text-right">Value</TableHead><TableHead>Accepted by</TableHead></TableRow></TableHeader>
                        <TableBody>{bills.map(b => <TableRow key={b.id} className={cn('cursor-pointer hover:bg-accent/50', b.voided && 'opacity-50 line-through')} onClick={() => onBill(billIndex.current.get(b.id) || b)}><TableCell>{fmtDay(b.day)}</TableCell><TableCell>{jeddahTime(b.given_at)}</TableCell><TableCell className="text-right">{b.items}</TableCell><TableCell className="text-right">{sar(b.value)} SAR</TableCell><TableCell>{b.worker}{b.voided ? ' · ❌ cancelled' : ''}</TableCell></TableRow>)}</TableBody></Table>
                </>}
            </DialogContent>
        </Dialog>
    );
}

export function ItemFormDialog({ item, open, onClose }: { item: Row | null; open: boolean; onClose: () => void }) {
    const { api, site, items, setItems, libs } = useLa();
    const [f, setF] = useState<Row>({}), [image, setImage] = useState(''), [err, setErr] = useState('');
    useEffect(() => { if (open) { setF({ name: item?.name || '', name_local: item?.name_local || '', price: item ? item.price / 100 : '', sort: item?.sort ?? items.length + 1, category: item?.category === 'building' ? 'building' : 'guest', active: !item || item.active }); setImage(item?.image || ''); setErr(''); } }, [open, item?.id]);   // eslint-disable-line react-hooks/exhaustive-deps
    const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setF(p => ({ ...p, [k]: e.target.value }));
    async function save(e: React.FormEvent) {
        e.preventDefault();
        const payload = { site, name: f.name, name_local: f.name_local, price: Number(f.price), sort: Number(f.sort), active: !!f.active, category: f.category, image };
        try { const r = await api(item ? 'PUT' : 'POST', item ? `/api/laundry/items/${item.id}` : '/api/laundry/items', payload); setItems(r.items); onClose(); } catch (er: any) { setErr(er.message); }
    }
    return (
        <Dialog open={open} onOpenChange={o => !o && onClose()}>
            <DialogContent className="max-h-[92vh] max-w-[calc(100%-1rem)] overflow-y-auto sm:max-w-lg">
                <form className="grid gap-3" onSubmit={e => void save(e)}>
                    <DialogHeader><DialogTitle>{item ? '✏️ ' + item.name : '➕ New item'}</DialogTitle><DialogDescription className="sr-only">Item</DialogDescription></DialogHeader>
                    <div className="flex items-center gap-3"><Pic item={{ image, name: f.name }} cls="la-ipic huge" />
                        <div className="grid gap-2"><label className="cursor-pointer rounded-md border px-3 py-1.5 text-sm">📷 Take / choose a photo<input hidden type="file" accept="image/*" capture="environment" onChange={async e => { try { setImage(await libs.laundry.shrinkImage(e.target.files![0], 320)); } catch (er: any) { setErr(er.message); } }} /></label>
                            <Input maxLength={8} placeholder="or an emoji 👕" value={image.startsWith('data:') ? '' : image} onChange={e => setImage(e.target.value.trim())} /><Button type="button" variant="outline" size="sm" onClick={() => setImage('')}>Remove picture</Button></div></div>
                    <p className="text-xs text-muted-foreground">A clear photo of the item helps workers who do not read.</p>
                    <div className="grid gap-2 sm:grid-cols-2">
                        {field('Name', <Input required maxLength={40} value={f.name || ''} onChange={set('name')} />)}{field('Name in another language', <Input maxLength={40} placeholder="optional" value={f.name_local || ''} onChange={set('name_local')} />)}
                        {field('Price (SAR)', <Input type="number" min={0} max={1000} step={0.25} required value={f.price ?? ''} onChange={set('price')} />)}{field('Order on the screen', <Input type="number" step={1} value={f.sort ?? ''} onChange={set('sort')} />)}
                        {field('Tab', <select className="h-9 rounded-md border bg-background px-2 text-sm" value={f.category} onChange={set('category')}><option value="guest">🧺 Clothes (New bill · Staff only)</option><option value="building">🏨 Building linen</option></select>)}</div>
                    <label className="flex items-center gap-2 text-sm"><Checkbox checked={!!f.active} onCheckedChange={v => setF(p => ({ ...p, active: v === true }))} /> Show to the worker</label>
                    {item && <p className="text-xs text-muted-foreground">Changing the price affects new bills only.</p>}
                    {err && <p className="text-sm text-destructive">{err}</p>}
                    <DialogFooter className="gap-2"><Button type="button" variant="outline" onClick={onClose}>Cancel</Button><Button type="submit">Save</Button></DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

export function StaffFormDialog({ staffRow, open, onClose }: { staffRow: Row | null; open: boolean; onClose: () => void }) {
    const { api, site, cats, setStaff, libs } = useLa();
    const s = staffRow;
    const [f, setF] = useState<Row>({}), [photo, setPhoto] = useState(''), [err, setErr] = useState('');
    useEffect(() => {
        if (!open) return;
        const L = s?.limits || {};
        setF({ name: s?.name || '', staff_code: s?.staff_code || '', room: s?.room || '', department: s?.department || '', contact: s?.contact || '', started_on: s?.started_on || '', category: s?.category || '', remarks: s?.remarks || '',
            free: !s || s.free, active: !s || s.active, per_bill_items: L.per_bill_items || '', per_day_items: L.per_day_items || '', per_week_items: L.per_week_items || '', per_month_value: L.per_month_value ? L.per_month_value / 100 : '', per_month_bills: L.per_month_bills || '', enforce: !!L.enforce });
        setPhoto(s?.photo || ''); setErr('');
    }, [open, s?.id]);   // eslint-disable-line react-hooks/exhaustive-deps
    const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setF(p => ({ ...p, [k]: e.target.value }));
    async function save(e: React.FormEvent) {
        e.preventDefault();
        const payload = { site, name: f.name, staff_code: f.staff_code, room: f.room, department: f.department, contact: f.contact, category: f.category, started_on: f.started_on, remarks: f.remarks, free: !!f.free, active: !!f.active, photo,
            limits: { per_bill_items: f.per_bill_items, per_day_items: f.per_day_items, per_week_items: f.per_week_items, per_month_value: f.per_month_value, per_month_bills: f.per_month_bills, enforce: !!f.enforce } };
        try { const r = await api(s ? 'PUT' : 'POST', s ? `/api/laundry/staff/${s.id}` : '/api/laundry/staff', payload); setStaff(r.staff); onClose(); } catch (er: any) { setErr(er.message); }
    }
    const chk = (k: string, label: string) => <label className="flex items-center gap-2 text-sm"><Checkbox checked={!!f[k]} onCheckedChange={v => setF(p => ({ ...p, [k]: v === true }))} /> {label}</label>;
    const inp = (label: string, k: string, props: React.ComponentProps<typeof Input> = {}) => field(label, <Input value={f[k] ?? ''} onChange={set(k)} {...props} />);
    return (
        <Dialog open={open} onOpenChange={o => !o && onClose()}>
            <DialogContent className="max-h-[92vh] max-w-[calc(100%-1rem)] overflow-y-auto sm:max-w-2xl">
                <form className="grid gap-3" onSubmit={e => void save(e)}>
                    <DialogHeader><DialogTitle>{s ? '✏️ ' + s.name : '➕ Free-laundry staff'}</DialogTitle><DialogDescription className="sr-only">Staff profile</DialogDescription></DialogHeader>
                    <div className="flex items-center gap-3">{photo ? <img src={photo} alt="" className="size-20 rounded-lg object-cover" /> : <span className="grid size-20 place-items-center rounded-lg bg-muted text-3xl">👤</span>}
                        <div className="grid gap-2"><label className="cursor-pointer rounded-md border px-3 py-1.5 text-sm">📷 Take / choose photo<input hidden type="file" accept="image/*" capture="user" onChange={async e => { try { setPhoto(await libs.laundry.shrinkImage(e.target.files![0], 360, 0.82)); } catch (er: any) { setErr(er.message); } }} /></label>
                            <Button type="button" variant="outline" size="sm" onClick={() => setPhoto('')}>Remove photo</Button><p className="text-xs text-muted-foreground">The worker checks this photo before accepting clothes.</p></div></div>
                    <div className="grid gap-2 sm:grid-cols-2">
                        {inp('Staff name', 'name', { required: true, maxLength: 80 })}{inp('Staff ID', 'staff_code', { maxLength: 30 })}{inp('Room / accommodation', 'room', { maxLength: 20 })}{inp('Department', 'department', { maxLength: 60 })}
                        {inp('Mobile', 'contact', { maxLength: 30 })}{inp('Free laundry from', 'started_on', { type: 'date' })}
                        {field('Category', <select className="h-9 rounded-md border bg-background px-2 text-sm" value={f.category || ''} onChange={set('category')}><option value="">Uncategorized</option>{cats.map(c => <option key={c} value={c}>{c}</option>)}</select>)}</div>
                    {inp('Remarks', 'remarks', { maxLength: 300 })}
                    <div className="grid gap-2 sm:grid-cols-2">{chk('free', 'Free laundry: YES')}{chk('active', 'Active')}</div>
                    <fieldset className="grid gap-2 rounded-lg border p-3"><legend className="px-1 text-sm font-bold">Limits (optional — leave empty for none)</legend>
                        <div className="grid gap-2 sm:grid-cols-2">{inp('Max pieces per submission', 'per_bill_items', { type: 'number', min: 1 })}{inp('Max pieces per day', 'per_day_items', { type: 'number', min: 1 })}{inp('Max pieces per week', 'per_week_items', { type: 'number', min: 1 })}
                            {inp('Max value per month (SAR)', 'per_month_value', { type: 'number', min: 1, step: 0.5 })}{inp('Max free bills per month', 'per_month_bills', { type: 'number', min: 1 })}</div>
                        {chk('enforce', "Above a limit, the worker needs a supervisor's approval (otherwise only a warning)")}</fieldset>
                    {err && <p className="text-sm text-destructive">{err}</p>}
                    <DialogFooter className="gap-2"><Button type="button" variant="outline" onClick={onClose}>Cancel</Button><Button type="submit">Save</Button></DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
