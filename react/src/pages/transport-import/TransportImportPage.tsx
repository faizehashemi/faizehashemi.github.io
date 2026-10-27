import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { useCore, useGuard, useNav, useSite } from '@/pms/PmsContext';
import { cleanText } from '../transport/DayNav';

// Transport import: paste the transport list → one card per day in it.
//   New day: preview with the bus numbers it will get → Save.
//   Day already saved: what changed (new / changed / gone trips), each with a tick → Apply the ticked ones.
//   Bus numbers already given stay; new signage trips get the next free numbers of their destination.
// Below: a trip added by hand (stays on the day when a list is pasted again).

type Row = Record<string, any>;
type Plan = { day: string; rows: Row[]; saved: Row; diff: Row; done?: boolean; error?: string; picks: Set<string> };
const DRAFT_KEY = 'pms_transport_draft';
const sub = (t: React.ReactNode) => <small className="block text-xs text-muted-foreground">{t}</small>;

export default function TransportImportPage() {
    const { cloud, transport } = useCore();
    const T = transport as any;
    const guard = useGuard();
    const { site, siteId } = useSite();
    const { href } = useNav();
    const writable = cloud.canWrite(siteId);
    const keep = T.routesFor(siteId) as string[] | null;   // Medina takes only its own routes from a pasted list (grouped trips follow their vehicle's route)

    const [text, setText] = useState(() => { try { return sessionStorage.getItem(DRAFT_KEY) || ''; } catch { return ''; } });
    const [plans, setPlans] = useState<Plan[]>([]);
    const [status, setStatus] = useState('');
    const setDraft = (v: string) => { setText(v); try { sessionStorage.setItem(DRAFT_KEY, v); } catch { /* ignore */ } };
    const onlyOurs = (list: Row[]) => {
        if (!keep) return list;
        const info = T.resolve(list) as Map<string, Row>;
        return list.filter(r => keep.includes(T.normRoute(info.get(r.key)!.route)));
    };

    async function read() {
        const parsed = T.parseTransport(text);
        let rows: Row[] = parsed.rows, left = 0;
        const { skipped } = parsed;
        if (keep && rows.length) {
            const ours = ([...T.byDay(rows).values()] as Row[][]).flatMap(onlyOurs);
            left = rows.length - ours.length; rows = ours;
            if (!rows.length) { setStatus(`None of the ${left} trips is on ${keep.join(', ')} — nothing to load for ${site.label}.`); setPlans([]); return; }
        }
        if (!rows.length) { setStatus('No trips found. Copy the whole list, including the date column.'); setPlans([]); return; }
        setStatus('Comparing with the saved days…');
        try {
            const days = T.byDay(rows) as Map<string, Row[]>;
            const next: Plan[] = await guard(Promise.all([...days].map(async ([day, list]) => {
                const saved = await T.loadDay(siteId, day);
                const diff = T.diffDay(saved.rows, list);
                return { day, rows: list, saved, diff, picks: new Set<string>([...diff.added.map((r: Row) => `add:${r.key}`), ...diff.changed.map((c: Row) => `chg:${c.now.key}`), ...diff.removed.map((r: Row) => `del:${r.key}`)]) };
            })));
            setPlans(next);
            setStatus(`${rows.length} trips on ${next.length} day${next.length === 1 ? '' : 's'}${skipped ? ` · ${skipped} line${skipped === 1 ? '' : 's'} without a booking ref skipped (hotel shuttles)` : ''}${left ? ` · ${left} trip${left === 1 ? '' : 's'} on other routes left out` : ''}.`);
        } catch (e: any) { setStatus(e instanceof cloud.UserError ? e.message : 'Could not reach the server.'); setPlans([]); }
    }
    const patch = (i: number, p: Partial<Plan>) => setPlans(ps => ps.map((x, k) => (k === i ? { ...x, ...p } : x)));
    async function save(i: number, rows: Row[], note: string) {
        const p = plans[i];
        patch(i, { error: '' });
        try { await guard(T.saveDay(siteId, p.day, rows, p.saved.version, note)); patch(i, { done: true }); }
        catch (e: any) { patch(i, { error: (e instanceof cloud.UserError ? e.message : 'Could not save.') + (e.status === 409 ? ' Press “Read the list” again to compare with the latest.' : '') }); }
    }
    const tripsLine = (rows: Row[]) => {
        const s = (T.signage(rows, siteId) as Row[]).filter(x => x.buses.length);
        return `${rows.length} trips${s.length ? ' · ' + s.map(x => `${x.dest.title} ${x.buses.length} bus${x.buses.length === 1 ? '' : 'es'}`).join(', ') : ' · none for signage'}`;
    };
    const who = (r: Row) => <><b>{r.ref}</b> · {r.leader || '—'}{sub(`${r.operator || ''}${r.route ? ' · ' + r.route : ''} · ${T.time12(r.at)} · ${r.pax} pax`)}</>;

    function previewTable(rows: Row[]) {
        const info = T.resolve(rows) as Map<string, Row>;
        const list = [...rows].sort((a, b) => a.at.localeCompare(b.at));
        return <div className="overflow-x-auto"><Table>
            <TableHeader><TableRow><TableHead>Time</TableHead><TableHead>Route</TableHead><TableHead>Bus</TableHead><TableHead>SH</TableHead><TableHead>Tour operator</TableHead><TableHead>Group leader</TableHead><TableHead className="text-right">Pax</TableHead><TableHead>Transporter</TableHead><TableHead>Remarks</TableHead></TableRow></TableHeader>
            <TableBody>{list.map(r => { const i = info.get(r.key)!; return (
                <TableRow key={r.key} className={cn(i.parent && 'bg-muted/40')}>
                    <TableCell className="whitespace-nowrap">{T.time12(r.at)}</TableCell><TableCell>{i.route || '—'}{i.parent ? sub('grouped') : null}</TableCell>
                    <TableCell>{i.dest ? i.bus ?? '' : ''}</TableCell><TableCell><b>{r.ref}</b></TableCell><TableCell>{r.operator}</TableCell><TableCell>{r.leader}</TableCell>
                    <TableCell className="text-right">{r.pax}</TableCell><TableCell>{r.transporter}{r.vch ? sub(`Vch ${r.vch}`) : null}</TableCell><TableCell>{r.remarks}</TableCell>
                </TableRow>); })}</TableBody></Table></div>;
    }
    function changeTable(i: number, p: Plan) {
        const d = p.diff;
        const toggle = (k: string, on: boolean) => { const s = new Set(p.picks); if (on) s.add(k); else s.delete(k); patch(i, { picks: s }); };
        const line = (k: string, what: string, cls: string, r: Row, detail: React.ReactNode) => (
            <TableRow key={k} className={cls}><TableCell><Checkbox aria-label="Apply" checked={p.picks.has(k)} onCheckedChange={v => toggle(k, v === true)} /></TableCell><TableCell className="font-bold">{what}</TableCell><TableCell>{who(r)}</TableCell><TableCell>{detail}</TableCell></TableRow>);
        return <div className="overflow-x-auto"><Table>
            <TableHeader><TableRow><TableHead /><TableHead>Change</TableHead><TableHead>Trip</TableHead><TableHead>Details</TableHead></TableRow></TableHeader>
            <TableBody>
                {d.added.map((r: Row) => line(`add:${r.key}`, 'New', 'bg-ok-soft/50', r, '—'))}
                {d.changed.map((c: Row) => line(`chg:${c.now.key}`, 'Changed', 'bg-accent/50', c.now,
                    <ul className="list-disc pl-4">{c.fields.map(([label, a, b]: string[], k: number) => <li key={k}>{label}: <del>{a || '(empty)'}</del> → <ins className="font-bold no-underline">{b || '(empty)'}</ins></li>)}</ul>))}
                {d.removed.map((r: Row) => line(`del:${r.key}`, 'Gone', 'bg-destructive/10', r, `Not in the new list — ${r.bus != null ? `frees bus ${r.bus}` : 'will be removed'}`))}
            </TableBody></Table></div>;
    }
    const readOnly = <span className="rounded-md border border-warn/40 bg-warn-soft px-2 py-1 text-sm">This login cannot save here (read-only).</span>;

    function dayCard(p: Plan, i: number) {
        const saved = !!p.saved.version, d = p.diff, n = d.added.length + d.changed.length + d.removed.length;
        return (
            <Card key={p.day}>
                <CardHeader><CardTitle className="flex flex-wrap items-center gap-2 text-base">{T.longDate(p.day)} <Badge variant={saved ? 'outline' : 'default'}>{saved ? 'already saved' : 'new day'}</Badge>
                    <small className="font-normal text-muted-foreground">{tripsLine(p.rows)}</small></CardTitle></CardHeader>
                <CardContent className="grid gap-3">
                    {p.error && <div className="rounded-md border border-destructive bg-destructive/10 px-3 py-2 text-sm text-destructive">{p.error}</div>}
                    {p.done ? <div className="rounded-md border border-ok/40 bg-ok-soft px-3 py-2 text-sm text-ok">Saved ✓ — <a className="underline" href={href('transport', { day: p.day })}>open the day</a> · <a className="underline" href={href('transport-print', { day: p.day })}>bus sheets</a></div>
                        : !saved ? <>{previewTable(T.assignBuses(p.rows.map((r: Row) => ({ ...r }))))}
                            <div>{writable ? <Button onClick={() => void save(i, T.assignBuses(p.rows.map((r: Row) => ({ ...r }))), `import: ${p.rows.length} trips`)}>Save {p.day}</Button> : readOnly}</div></>
                            : <>
                                <p className="text-sm text-muted-foreground">Saved list: {p.saved.rows.length} trips{p.saved.updated_at ? ` · ${new Date(p.saved.updated_at).toLocaleString()}` : ''}{p.saved.updated_by ? ' by ' + p.saved.updated_by : ''}</p>
                                <div className="flex flex-wrap gap-2"><Badge>{d.added.length} new</Badge><Badge variant="outline">{d.changed.length} changed</Badge><Badge variant="destructive">{d.removed.length} gone</Badge><Badge variant="secondary">{d.same} unchanged</Badge></div>
                                {n ? <>{changeTable(i, p)}
                                    <div className="flex flex-wrap items-center gap-2">{writable ? <>
                                        <Button disabled={!p.picks.size} onClick={() => {
                                            const c = (t: string) => [...p.picks].filter(k => k.startsWith(t)).length;
                                            void save(i, T.applyChanges(p.saved.rows, p.diff, p.picks), `update: ${c('add:')} new, ${c('chg:')} changed, ${c('del:')} removed`);
                                        }}>Apply ticked changes</Button>
                                        <Button variant="outline" onClick={() => patch(i, { picks: new Set([...d.added.map((r: Row) => `add:${r.key}`), ...d.changed.map((c: Row) => `chg:${c.now.key}`), ...d.removed.map((r: Row) => `del:${r.key}`)]) })}>Tick all</Button>
                                        <Button variant="outline" onClick={() => patch(i, { picks: new Set() })}>Untick all</Button></> : readOnly}
                                        <span className="text-sm text-muted-foreground">Bus numbers already given stay the same; new trips get the next free numbers.</span></div></>
                                    : <div className="rounded-md border border-ok/40 bg-ok-soft px-3 py-2 text-sm text-ok">Nothing changed — the saved list is already the same.</div>}
                            </>}
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="mx-auto grid grid-cols-[minmax(0,1fr)] max-w-[2400px] min-w-0 gap-3 px-3 pb-10 pt-4 sm:px-4">
            <header className="flex flex-wrap items-start justify-between gap-3">
                <div><h1 className="text-2xl font-bold text-primary">Transport import</h1>
                    <p className="text-sm text-muted-foreground">Paste the transport list (with or without its heading row). Days that are already saved are compared first — you choose which changes to apply.{' '}
                        {keep && <b>{site.label} keeps only {keep.join(', ')} — every other route in the list is left out.</b>}</p></div>
                <Button asChild variant="outline"><a href={href('transport')}>🚌 Transport day</a></Button>
            </header>
            <Card><CardHeader><CardTitle className="text-base">Paste the list</CardTitle></CardHeader>
                <CardContent className="grid gap-3">
                    <Textarea spellCheck={false} className="min-h-40 font-mono text-xs" value={text} onChange={e => setDraft(e.target.value)} placeholder={'Booking Ref\tDora No\tVch No\tTransporter\tDate\tTour Operator\tGr Leader\tSource-Destination\tPax Count\tTotal Pax\tRooms Allocated\tRemarks\tUser Loc'} />
                    <div className="flex flex-wrap items-center gap-2"><Button onClick={() => void read()}>Read the list</Button>
                        <Button variant="outline" onClick={() => { setDraft(''); setPlans([]); setStatus(''); }}>Clear</Button><span className="text-sm text-muted-foreground">{status}</span></div>
                </CardContent></Card>
            {plans.map(dayCard)}
            <ManualTrip />
        </div>
    );
}

// a trip added by hand (stays on the day when a list is pasted again: manual)
function ManualTrip() {
    const { cloud, transport } = useCore();
    const T = transport as any;
    const guard = useGuard();
    const { siteId } = useSite();
    const { href } = useNav();
    const writable = cloud.canWrite(siteId);
    const dests = T.destsFor(siteId) as Row[];
    const blank = { day: T.today() as string, time: '', route: dests[0]?.route ?? '', other: '', vehicle: 'bus', ref: '', operator: '', leader: '', m: 0, f: 0, c: 0, pax: 0, transporter: '', vch: '', rooms: '', remarks: '' };
    const [f, setF] = useState(blank);
    const [msg, setMsg] = useState<React.ReactNode>(writable ? '' : 'This login cannot save here (read-only).');
    const [busy, setBusy] = useState(false);
    const n = (v: unknown) => Math.max(0, parseInt(String(v), 10) || 0);
    const set = (k: keyof typeof blank) => (e: React.ChangeEvent<HTMLInputElement>) => setF(p => {
        const next = { ...p, [k]: e.target.value };
        return ['m', 'f', 'c'].includes(k) ? { ...next, pax: n(next.m) + n(next.f) + n(next.c) } : next;
    });
    async function submit(e: React.FormEvent) {
        e.preventDefault();
        const route = T.normRoute(f.route || f.other);
        if (!f.day || !f.time) { setMsg('Give the date and time.'); return; }
        if (!route) { setMsg('Choose a route or type its name.'); return; }
        if (!n(f.pax)) { setMsg('Give the pax.'); return; }
        const key = `M${Date.now().toString(36).toUpperCase()}`;
        const trip: Row = { key, ref: cleanText(f.ref) || key, dora: '', vch: cleanText(f.vch), transporter: cleanText(f.transporter), day: f.day, at: `${f.day}T${f.time}`, operator: cleanText(f.operator), leader: cleanText(f.leader), route,
            m: n(f.m), f: n(f.f), c: n(f.c), pax: n(f.pax), rooms: cleanText(f.rooms).split(/[,\s]+/).filter(Boolean), remarks: cleanText(f.remarks), adj: '', loc: '', manual: true, ...(f.vehicle === 'car' ? { vehicle: 'car' } : {}) };
        setBusy(true); setMsg('Saving…');
        try {
            const saved = await guard<any>(T.loadDay(siteId, f.day));
            const rows: Row[] = T.assignBuses([...saved.rows.map((r: Row) => ({ ...r })), trip].sort((a, b) => a.at.localeCompare(b.at)), saved.rows);
            await guard(T.saveDay(siteId, f.day, rows, saved.version || 0, `added by hand: ${trip.ref} ${route}`));
            const got = rows.find(r => r.key === key);
            setMsg(<>Added ✓ {route} at {T.time12(trip.at)}{got?.bus ? ` · bus ${got.bus}` : ''} — <a className="underline" href={href('transport', { day: f.day })}>open {f.day}</a></>);
            setF(p => ({ ...p, ref: '', operator: '', leader: '', transporter: '', vch: '', rooms: '', remarks: '', m: 0, f: 0, c: 0, pax: 0 }));
        } catch (err: any) { setMsg(err instanceof cloud.UserError ? err.message + ((err as any).status === 409 ? ' Try again.' : '') : 'Could not save.'); }
        finally { setBusy(false); }
    }
    const field = (label: string, k: keyof typeof blank, props: React.ComponentProps<typeof Input> = {}, cls = '') => <div className={cn('grid gap-1', cls)}><Label>{label}</Label><Input value={f[k] as string | number} onChange={set(k)} {...props} /></div>;
    return (
        <Card><CardHeader><CardTitle className="text-base">Add a trip by hand</CardTitle>
            <p className="text-sm text-muted-foreground">For a trip that is not in the pasted list. It goes onto that day's list (a new day is started if none is saved) and stays there when a list is pasted again.</p></CardHeader>
            <CardContent>
                <form autoComplete="off" onSubmit={e => void submit(e)} className="grid grid-cols-2 items-end gap-3 sm:grid-cols-4">
                    {field('Date', 'day', { type: 'date', required: true })}{field('Time', 'time', { type: 'time', required: true })}
                    <div className="col-span-2 grid gap-1"><Label>Route</Label>
                        <Select value={f.route || '__other'} onValueChange={v => setF(p => ({ ...p, route: v === '__other' ? '' : v }))}><SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                            <SelectContent>{dests.map(d => <SelectItem key={d.id} value={d.route}>{d.icon} {d.title} — {d.route}</SelectItem>)}<SelectItem value="__other">Other route…</SelectItem></SelectContent></Select></div>
                    {!f.route && field('Route name', 'other', { maxLength: 60, placeholder: 'e.g. MADINA-BADR' }, 'col-span-2')}
                    <div className="grid gap-1"><Label>Vehicle</Label>
                        <Select value={f.vehicle} onValueChange={v => setF(p => ({ ...p, vehicle: v }))}><SelectTrigger className="w-full"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="bus">Bus</SelectItem><SelectItem value="car">Car</SelectItem></SelectContent></Select></div>
                    {field('SH / booking ref', 'ref', { maxLength: 30, placeholder: 'optional' })}
                    {field('Tour operator', 'operator', { maxLength: 80 }, 'col-span-2')}{field('Group leader', 'leader', { maxLength: 80 }, 'col-span-2')}
                    {field('M', 'm', { type: 'number', min: 0 })}{field('F', 'f', { type: 'number', min: 0 })}{field('C', 'c', { type: 'number', min: 0 })}{field('Total pax', 'pax', { type: 'number', min: 0 })}
                    {field('Transporter', 'transporter', { maxLength: 60 })}{field('Vch No', 'vch', { maxLength: 20 })}{field('Rooms', 'rooms', { maxLength: 200, placeholder: 'e.g. 101, 102' }, 'col-span-2')}
                    {field('Remarks', 'remarks', { maxLength: 200 }, 'col-span-2 sm:col-span-4')}
                    <div className="col-span-full flex flex-wrap items-center gap-2"><Button type="submit" disabled={!writable || busy}>Add trip</Button><span className="text-sm text-muted-foreground">{msg}</span></div>
                </form>
            </CardContent></Card>
    );
}
