import { useEffect, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Camera, Plus, Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { useCore, useGuard, useLoadCore, useSite } from '@/pms/PmsContext';

// Rooms → Lost & Found: items left in rooms, with a photo, who found them, who holds them, and every hand-over until the guest has it back.
// Every login sees the list and can search it; desks and admins add, edit and record hand-overs (view-only logins look only). Server: /api/lost.

type Row = Record<string, any>;
type Status = 'found' | 'handed' | 'returned';
const STATUS: Record<Status, { label: string; sub: string; cls: string; icon: string }> = {
    found: { label: 'Found', sub: 'Awaiting collection', cls: 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950 dark:text-amber-200', icon: '🟡' },
    handed: { label: 'Handed over', sub: 'In custody', cls: 'bg-sky-100 text-sky-900 border-sky-300 dark:bg-sky-950 dark:text-sky-200', icon: '🔵' },
    returned: { label: 'Returned to guest', sub: 'Completed', cls: 'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-200', icon: '✅' },
};
const ACTION: Record<string, string> = { found: 'Registered', handed: 'Handed over', returned: 'Returned to guest', edit: 'Edited', reopen: 'Reopened' };
const pad = (n: number) => String(n).padStart(2, '0');
const nowLocal = () => { const d = new Date(); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`; };
const fmt = (s: string) => (s ? new Date(s.length <= 16 ? s : s).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—');
/** Where an item was found, in a few words */
export const whereOf = (x: Row) => (x.place === 'bus' ? `🚌 ${/^bus/i.test(x.spot) ? '' : 'Bus '}${x.spot}` : x.place === 'other' ? `📍 ${x.spot}` : `🚪 Room ${x.room}${x.building ? ` · ${x.building}` : ''}${x.floor ? ` · floor ${x.floor}` : ''}`);
const natural = (a: string, b: string) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });

function StatusBadge({ s }: { s: Status }) {
    const x = STATUS[s] || STATUS.found;
    return <span className={cn('inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold', x.cls)}>{x.icon} {x.label}</span>;
}

export default function LostFoundPage() {
    const { cloud, rooms: R } = useCore() as any;
    const guard = useGuard();
    const loadCore = useLoadCore();
    const { site, siteId } = useSite();
    const qc = useQueryClient();
    const list = useQuery({ queryKey: ['lost', siteId], queryFn: async () => (await guard(cloud.request('GET', `/api/lost?site=${siteId}`))) as { items: Row[]; can_edit: boolean }, refetchInterval: 60_000 });
    const blds = useQuery({ queryKey: ['buildings', siteId], queryFn: async () => R.buildingsOfSite(await guard(R.loadBuildings()), siteId) as Row[] });
    const [q, setQ] = useState(''), [st, setSt] = useState<'all' | Status>('all'), [day, setDay] = useState('');
    const [form, setForm] = useState<Row | null>(null), [view, setView] = useState<number | null>(null);
    const items = list.data?.items ?? [], canEdit = !!list.data?.can_edit;
    const refresh = () => qc.invalidateQueries({ queryKey: ['lost', siteId] });

    const shown = useMemo(() => {
        const t = q.trim().toLowerCase();
        return items.filter(x => (st === 'all' || x.status === st) && (!day || String(x.found_at).slice(0, 10) === day)
            && (!t || [x.ref, x.room, x.spot, x.building, x.floor, x.item, x.found_by, x.custodian].some(v => String(v || '').toLowerCase().includes(t))));
    }, [items, q, st, day]);
    const n = (s: Status) => items.filter(x => x.status === s).length;

    return (
        <div className="mx-auto grid max-w-[1600px] gap-4 px-3 pb-12 pt-4 sm:px-5">
            <header className="relative overflow-hidden rounded-3xl bg-[radial-gradient(120%_150%_at_100%_0%,#7a5a14_0%,#0b1020_60%)] px-6 py-7 text-white shadow-xl sm:px-9">
                <div className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[#f5d78e]">{site.label} · Rooms</div>
                <h1 className="mt-1 font-serif text-4xl font-black tracking-tight">Lost &amp; Found</h1>
                <p className="mt-1 text-sm text-[#fde7b0]/90">Every item left in a room — photo, who found it, who holds it, and when it went back to the guest.</p>
                {canEdit && <Button className="mt-4 bg-[#f5d78e] text-[#0b1020] hover:bg-[#f0cb6c]" onClick={() => setForm({})}><Plus className="size-4" />Add lost item</Button>}
            </header>
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                {([['all', '📦', 'Total found', items.length], ['found', '🟡', 'Pending', n('found')], ['handed', '🔵', 'Handed over', n('handed')], ['returned', '✅', 'Returned', n('returned')]] as const).map(([k, ic, label, v]) => (
                    <button key={k} type="button" onClick={() => setSt(k as any)} className={cn('rounded-2xl border bg-card p-4 text-left shadow-sm transition hover:shadow-md', st === k && 'ring-2 ring-primary')}>
                        <span className="text-xl" aria-hidden>{ic}</span><b className="block font-serif text-3xl">{v}</b><small className="text-xs uppercase tracking-wider text-muted-foreground">{label}</small></button>))}
            </div>
            <div className="flex flex-wrap items-end gap-2">
                <div className="relative min-w-60 flex-1"><Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" /><Input type="search" className="pl-8" placeholder="Search room, building, item, reference, name" value={q} onChange={e => setQ(e.target.value)} /></div>
                <div className="grid gap-1"><Label htmlFor="lfday" className="text-xs">Date found</Label><Input id="lfday" type="date" value={day} onChange={e => setDay(e.target.value)} /></div>
                {(q || day || st !== 'all') && <Button variant="ghost" onClick={() => { setQ(''); setDay(''); setSt('all'); }}>Clear</Button>}
            </div>
            {list.isError && <p className="text-sm text-destructive">{String((list.error as Error)?.message || list.error)}</p>}
            {list.isLoading ? <p className="text-sm text-muted-foreground">Loading…</p> : shown.length ? (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
                    {shown.map(x => (
                        <button key={x.id} type="button" onClick={() => setView(x.id)} className={cn('flex gap-3 rounded-2xl border bg-card p-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md', x.status === 'returned' && 'opacity-75')}>
                            {x.thumb ? <img src={x.thumb} alt="" className="size-24 shrink-0 rounded-xl object-cover" /> : <span className="grid size-24 shrink-0 place-items-center rounded-xl bg-muted text-3xl">📦</span>}
                            <span className="grid min-w-0 content-start gap-1">
                                <span className="font-mono text-[11px] text-muted-foreground">{x.ref}</span>
                                <b className="line-clamp-2 leading-tight">{x.item}</b>
                                <span className="text-sm">{whereOf(x)}</span>
                                <small className="text-muted-foreground">Found {fmt(x.found_at)}</small>
                                <span className="flex flex-wrap items-center gap-1.5"><StatusBadge s={x.status} />{x.status !== 'returned' && x.custodian && <small className="text-muted-foreground">with {x.custodian}</small>}</span>
                            </span>
                        </button>))}
                </div>) : <p className="rounded-2xl border border-dashed p-8 text-center text-muted-foreground">{items.length ? 'Nothing matches.' : 'No lost items registered yet.'}</p>}
            {form && <ItemForm init={form} blds={blds.data ?? []} siteId={siteId} cloud={cloud} guard={guard} loadCore={loadCore} onClose={() => setForm(null)} onSaved={it => { setForm(null); void refresh(); setView(it.id); }} />}
            {view != null && <ItemView id={view} cloud={cloud} guard={guard} canEdit={canEdit} onClose={() => setView(null)} onEdit={it => { setView(null); setForm(it); }} onChanged={() => void refresh()} />}
        </div>
    );
}

function ItemForm({ init, blds, siteId, cloud, guard, loadCore, onClose, onSaved }: { init: Row; blds: Row[]; siteId: string; cloud: any; guard: any; loadCore: any; onClose: () => void; onSaved: (it: Row) => void }) {
    const edit = !!init.id;
    const [f, setF] = useState<Row>(() => ({ place: init.place || 'room', spot: init.spot || '', building: init.building || blds[0]?.name || '', floor: init.floor || '', room: init.room || '', item: init.item || '', found_at: init.found_at || nowLocal(),
        found_by: init.found_by || '', custodian: init.custodian || '', remarks: init.remarks || '' }));
    const [photo, setPhoto] = useState<{ photo?: string; thumb?: string }>(edit ? {} : {}), [preview, setPreview] = useState<string>(init.photo || init.thumb || '');
    const [err, setErr] = useState(''), [busy, setBusy] = useState(false);
    const b = blds.find(x => x.name === f.building);
    const roomsOf = (b?.rooms || []).filter((r: Row) => String(r.room_no || '').trim());
    const floors = ([...new Set(roomsOf.map((r: Row) => String(r.floor ?? '').trim()).filter(Boolean))] as string[]).sort(natural);
    const roomList = roomsOf.filter((r: Row) => !f.floor || String(r.floor ?? '').trim() === f.floor).map((r: Row) => String(r.room_no)).sort(natural);
    const set = (k: string, v: string) => setF(p => ({ ...p, [k]: v }));
    useEffect(() => { if (f.room && !roomList.includes(f.room) && roomsOf.length) set('room', ''); }, [f.building, f.floor]);   // eslint-disable-line react-hooks/exhaustive-deps
    async function pick(file: File | undefined) {
        if (!file) return;
        try {
            const L = await loadCore('laundry');
            const big = await L.shrinkImage(file, 1000, 0.72), small = await L.shrinkImage(file, 220, 0.7);
            setPhoto({ photo: big, thumb: small }); setPreview(big); setErr('');
        } catch (e: any) { setErr(e.message); }
    }
    async function save(e: React.FormEvent) {
        e.preventDefault(); setBusy(true); setErr('');
        try {
            const payload = { site: siteId, ...f, ...photo, version: init.version };
            const r = await guard(edit ? cloud.request('PUT', `/api/lost/${init.id}`, payload) : cloud.request('POST', '/api/lost', payload));
            onSaved(r.item);
        } catch (er: any) { setErr(er.message); } finally { setBusy(false); }
    }
    const sel = 'h-9 w-full rounded-md border bg-background px-2 text-sm';
    return (
        <Dialog open onOpenChange={o => { if (!o) onClose(); }}>
            <DialogContent className="flex max-h-[92vh] max-w-xl flex-col">
                <DialogHeader><DialogTitle className="font-serif text-2xl">{edit ? `Edit ${init.ref}` : 'Add lost item'}</DialogTitle><DialogDescription>Where it was found, a photo, and who has it now.</DialogDescription></DialogHeader>
                <form onSubmit={save} className="grid min-h-0 gap-3 overflow-y-auto pr-1">
                    <div className="grid gap-1"><Label>Found in</Label>
                        <div className="inline-flex w-fit rounded-lg border p-0.5 text-sm" role="radiogroup" aria-label="Found in">{([['room', '🚪 Room'], ['bus', '🚌 Bus'], ['other', '📍 Other place']] as const).map(([k, l]) => (
                            <button key={k} type="button" role="radio" aria-checked={f.place === k} className={cn('rounded-md px-3 py-1.5', f.place === k && 'bg-primary text-primary-foreground')} onClick={() => set('place', k)}>{l}</button>))}</div></div>
                    {f.place !== 'room' && <div className="grid gap-1"><Label>{f.place === 'bus' ? 'Bus (number / trip / date)' : 'Where it was found'}</Label><Input required maxLength={120} value={f.spot} onChange={e => set('spot', e.target.value)} placeholder={f.place === 'bus' ? 'e.g. Bus 3 · Madina trip 18 Nov' : 'e.g. Mawaid hall, lobby, lift'} /></div>}
                    {f.place === 'room' && <div className="grid grid-cols-3 gap-2">
                        <div className="grid gap-1"><Label>Building</Label><select className={sel} value={f.building} onChange={e => { set('building', e.target.value); set('floor', ''); }}>{blds.map(x => <option key={x.name} value={x.name}>{x.name}</option>)}{!blds.length && <option value="">—</option>}</select></div>
                        <div className="grid gap-1"><Label>Floor</Label><select className={sel} value={f.floor} onChange={e => set('floor', e.target.value)}><option value="">All floors</option>{floors.map(x => <option key={x} value={x}>{x}</option>)}</select></div>
                        <div className="grid gap-1"><Label>Room</Label>{roomList.length ? <select className={sel} required value={f.room} onChange={e => { set('room', e.target.value); const r = roomsOf.find((x: Row) => String(x.room_no) === e.target.value); if (r && !f.floor && r.floor != null) set('floor', String(r.floor)); }}><option value="">Choose…</option>{roomList.map((x: string) => <option key={x} value={x}>{x}</option>)}</select>
                            : <Input required value={f.room} onChange={e => set('room', e.target.value)} placeholder="Room no." />}</div>
                    </div>}
                    <div className="grid gap-1"><Label>Item name / description</Label><Textarea required rows={2} maxLength={300} value={f.item} onChange={e => set('item', e.target.value)} placeholder="e.g. Black leather wallet with ID card" /></div>
                    <div className="grid gap-2"><Label>Item photo</Label>
                        <div className="flex items-center gap-3">{preview ? <img src={preview} alt="The item" className="size-28 rounded-xl object-cover" /> : <span className="grid size-28 place-items-center rounded-xl bg-muted text-3xl">📷</span>}
                            <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm"><Camera className="size-4" />Take / choose photo<input hidden type="file" accept="image/*" capture="environment" onChange={e => void pick(e.target.files?.[0])} /></label></div></div>
                    <div className="grid gap-2 sm:grid-cols-2">
                        <div className="grid gap-1"><Label>Date &amp; time found</Label><Input required type="datetime-local" value={f.found_at} onChange={e => set('found_at', e.target.value)} /></div>
                        <div className="grid gap-1"><Label>Found by (supervisor)</Label><Input required maxLength={80} value={f.found_by} onChange={e => set('found_by', e.target.value)} /></div>
                        <div className="grid gap-1 sm:col-span-2"><Label>Current custodian</Label><Input maxLength={80} value={f.custodian} onChange={e => set('custodian', e.target.value)} placeholder="Supervisor or authorised person holding it" /></div>
                    </div>
                    <div className="grid gap-1"><Label>Remarks (optional)</Label><Textarea rows={2} maxLength={600} value={f.remarks} onChange={e => set('remarks', e.target.value)} /></div>
                    {err && <p className="text-sm text-destructive">{err}</p>}
                    <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={onClose}>Cancel</Button><Button type="submit" disabled={busy}>{busy ? 'Saving…' : edit ? 'Save changes' : 'Register item'}</Button></div>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function ItemView({ id, cloud, guard, canEdit, onClose, onEdit, onChanged }: { id: number; cloud: any; guard: any; canEdit: boolean; onClose: () => void; onEdit: (it: Row) => void; onChanged: () => void }) {
    const [it, setIt] = useState<Row | null>(null), [err, setErr] = useState('');
    const [mv, setMv] = useState<Status | null>(null), [m, setM] = useState<Row>({}), [busy, setBusy] = useState(false);
    useEffect(() => { guard(cloud.request('GET', `/api/lost/${id}`)).then((r: Row) => setIt(r.item), (e: Error) => setErr(e.message)); }, [id]);   // eslint-disable-line react-hooks/exhaustive-deps
    const start = (s: Status) => { setMv(s); setM({ by: it?.custodian || it?.found_by || '', to: '', at: nowLocal(), remarks: '', confirmed: s === 'returned' }); setErr(''); };
    async function move(e: React.FormEvent) {
        e.preventDefault(); if (!it || !mv) return; setBusy(true); setErr('');
        try { const r = await guard(cloud.request('POST', `/api/lost/${it.id}/move`, { ...m, status: mv, version: it.version })); setIt(r.item); setMv(null); onChanged(); }
        catch (er: any) { setErr(er.message); } finally { setBusy(false); }
    }
    return (
        <Dialog open onOpenChange={o => { if (!o) onClose(); }}>
            <DialogContent className="flex max-h-[92vh] max-w-2xl flex-col">
                {!it ? <p className="text-sm">{err || 'Loading…'}</p> : <>
                    <DialogHeader><DialogTitle className="font-serif text-2xl">{it.item}</DialogTitle>
                        <DialogDescription className="flex flex-wrap items-center gap-2"><span className="font-mono">{it.ref}</span><StatusBadge s={it.status} /><span>{STATUS[it.status as Status]?.sub}</span></DialogDescription></DialogHeader>
                    <div className="grid min-h-0 gap-4 overflow-y-auto pr-1">
                        <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                            {it.photo ? <a href={it.photo} target="_blank" rel="noopener"><img src={it.photo} alt={it.item} className="max-h-72 w-full rounded-2xl object-cover" /></a> : <span className="grid h-48 place-items-center rounded-2xl bg-muted text-5xl">📦</span>}
                            <dl className="grid content-start gap-2 text-sm">
                                {([['Found in', whereOf(it)], ['Found', fmt(it.found_at)], ['Found by', it.found_by || '—'], ['Custodian', it.custodian || '—'], ['Remarks', it.remarks || '—']] as const).map(([k, v]) => (
                                    <div key={k}><dt className="text-xs uppercase tracking-wider text-muted-foreground">{k}</dt><dd className="font-medium">{v}</dd></div>))}
                            </dl>
                        </div>
                        <section><h3 className="mb-2 font-serif text-lg font-bold">History</h3>
                            <ol className="relative grid gap-3 border-l-2 border-muted pl-4">
                                {[...(it.history || [])].reverse().map((h: Row, i: number) => (
                                    <li key={i} className="relative"><span className="absolute -left-[23px] top-1 size-3 rounded-full border-2 border-background bg-primary" />
                                        <b>{ACTION[h.action] || h.action}</b> <small className="text-muted-foreground">{fmt(h.when || h.at)} · entered by {h.desk}</small>
                                        <div className="text-sm">{h.action === 'found' ? <>Found by <b>{h.by}</b>{h.to ? <> · held by <b>{h.to}</b></> : null}</> : h.action === 'edit' ? null : <>From <b>{h.from || h.by}</b>{h.to ? <> to <b>{h.to}</b></> : null}{h.confirmed ? ' · ✔ confirmed' : ''}</>}</div>
                                        {h.remarks && <div className="text-sm text-muted-foreground">{h.remarks}</div>}</li>))}
                            </ol></section>
                        {mv && <form onSubmit={move} className="grid gap-2 rounded-xl border bg-muted/40 p-3">
                            <b>{mv === 'handed' ? '🔵 Hand over to an authorised person' : mv === 'returned' ? '✅ Return to the guest (Haaji)' : '🟡 Reopen as found'}</b>
                            <div className="grid gap-2 sm:grid-cols-2">
                                <div className="grid gap-1"><Label>Given by</Label><Input required maxLength={80} value={m.by} onChange={e => setM(p => ({ ...p, by: e.target.value }))} /></div>
                                <div className="grid gap-1"><Label>{mv === 'returned' ? "Guest's name (received by)" : 'Received by'}</Label><Input required={mv !== 'found'} maxLength={80} value={m.to} onChange={e => setM(p => ({ ...p, to: e.target.value }))} /></div>
                                <div className="grid gap-1"><Label>Date &amp; time</Label><Input type="datetime-local" value={m.at} onChange={e => setM(p => ({ ...p, at: e.target.value }))} /></div>
                                <label className="flex items-center gap-2 self-end pb-2 text-sm"><Checkbox checked={!!m.confirmed} onCheckedChange={v => setM(p => ({ ...p, confirmed: v === true }))} />{mv === 'returned' ? 'Guest confirmed it is theirs' : 'Receipt confirmed'}</label>
                            </div>
                            <div className="grid gap-1"><Label>Confirmation / remarks</Label><Textarea rows={2} maxLength={600} value={m.remarks} onChange={e => setM(p => ({ ...p, remarks: e.target.value }))} placeholder={mv === 'returned' ? 'e.g. ID checked, group 44001' : ''} /></div>
                            {err && <p className="text-sm text-destructive">{err}</p>}
                            <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setMv(null)}>Cancel</Button><Button type="submit" disabled={busy}>{busy ? 'Saving…' : 'Record'}</Button></div>
                        </form>}
                    </div>
                    {canEdit && !mv && <div className="flex flex-wrap justify-end gap-2 border-t pt-3">
                        <Button variant="outline" onClick={() => onEdit(it)}>✏️ Edit</Button>
                        {it.status !== 'returned' && <Button variant="outline" onClick={() => start('handed')}>🔵 Hand over</Button>}
                        {it.status !== 'returned' && <Button onClick={() => start('returned')}>✅ Returned to guest</Button>}
                        {it.status === 'returned' && <Button variant="outline" onClick={() => start('found')}>↩ Reopen</Button>}
                    </div>}
                    {!canEdit && <Badge variant="outline" className="w-fit">View only</Badge>}
                </>}
            </DialogContent>
        </Dialog>
    );
}
