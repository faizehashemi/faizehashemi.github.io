import { useEffect, useMemo, useState } from 'react';
import { Download, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AllocLog } from '@/components/AllocLog';
import { useConfirm } from '@/components/ConfirmDialog';
import { recordApply } from '@/lib/alloclog';
import { cn } from '@/lib/utils';
import { useSlips } from '@/hooks/useSlips';
import { useQuery } from '@tanstack/react-query';
import { useCore, useDb, useGuard, useLoadApp, useNav, useSite } from '@/pms/PmsContext';

// Delayed departures (Front desk). Groups that could not leave on their booked date (airspace closures, tickets not confirmed). Each room row of a
// delayed slip has its own check-out and status (core/stay.js): confirmed · tentative (ticket not confirmed) · unknown (beds held until today + Setup's
// hold days). Top: totals. Then every delayed group with its rooms, the next group booked into each room and any clash; tick rooms to set their
// check-out / status, hold them, or mark them left. Every change is checked against incoming bookings first, written in one go and kept in the bulk-change
// log with Undo. Below: guests leaving per day (for transport) and groups booked to leave today/tomorrow that can be marked delayed.

const pad = (n: number) => String(n).padStart(2, '0');
const ymd = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const hm = (d: Date) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;
const fmt = (ms?: number | null) => ms ? new Date(ms).toLocaleString(undefined, { weekday: 'short', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—';
const DAY = 864e5;
type Slip = Record<string, any>;
const ST: Record<string, string> = { confirmed: 'bg-ok-soft text-ok', tentative: 'bg-warn-soft text-warn', unknown: 'bg-bad-soft text-destructive', booked: 'bg-muted text-muted-foreground', left: 'bg-muted text-muted-foreground' };
const StBadge = ({ s }: { s: string }) => <span className={cn('rounded-full px-2 py-0.5 text-xs font-bold', ST[s] || 'bg-muted')}>{s}</span>;

export default function DeparturesPage() {
    const { rooms: roomsLib, stay, settings, cloud } = useCore();
    const db = useDb();
    const guard = useGuard();
    const loadApp = useLoadApp();
    const { site, siteId } = useSite();
    const { href } = useNav();
    const { ask, dialog } = useConfirm();
    const writable = !db.readonly;
    const slipsQ = useSlips(60_000);
    const extra = useQuery({
        queryKey: ['departures-extra', siteId],
        queryFn: async () => {
            const [blds, st] = await Promise.all([guard(roomsLib.loadBuildings({ force: true })), guard(settings.loadSettings()).catch(() => null)]);
            return { blds: blds as any[], hold: Number((st as any)?.settings?.delay_hold_days) || settings.DEFAULTS.delay_hold_days };
        },
    });
    const SLIPS = slipsQ.data ?? [];
    const BLD = extra.data?.blds ?? [];
    const HOLD = extra.data?.hold ?? settings.DEFAULTS.delay_hold_days;
    const capOf = (b: string, room: string) => roomsLib.builderCapacity(BLD, b, room);

    const tomorrow0 = (() => { const t = new Date(); t.setDate(t.getDate() + 1); return ymd(t); })();
    const [ticked, setTicked] = useState<Set<string>>(new Set());          // "slipId|side|index"
    const [date, setDate] = useState(tomorrow0), [time, setTime] = useState('10:00'), [status, setStatus] = useState('tentative');
    const [msg, setMsg] = useState<{ text: string; bad?: boolean }>({ text: '' });
    const [from, setFrom] = useState(() => { const t = new Date(); return `${t.getFullYear()}-${pad(t.getMonth() + 1)}-01`; });
    const [to, setTo] = useState(ymd(new Date()));
    const [exporting, setExporting] = useState(false);
    const say = (text: string, bad = false) => setMsg({ text, bad });
    useEffect(() => { const h = () => { void slipsQ.refetch(); }; window.addEventListener('pms:alloc-undone', h); return () => window.removeEventListener('pms:alloc-undone', h); }, []);   // eslint-disable-line react-hooks/exhaustive-deps

    const now = Date.now();
    const v = useMemo(() => {
        const delayed = SLIPS.filter(s => stay.isDelayed(s) && stay.slipEnd(s)! > now).sort((a, b) => stay.slipEnd(a)! - stay.slipEnd(b)!);
        const conf = new Map<number, any[]>(delayed.map(s => [s.id, stay.roomConflicts(s, SLIPS, capOf, now)]));
        const rowsLeft = delayed.flatMap(s => stay.rowsOf(s).filter((w: any) => w.end > now).map((w: any) => ({ s, w })));
        const beds = (st: string) => rowsLeft.filter(x => x.w.status === st).reduce((n, x) => n + x.w.beds, 0);
        const today = ymd(new Date()), tomorrow = ymd(new Date(now + DAY));
        const leaving = (day: string) => delayed.flatMap(s => stay.departuresOf(s).filter((d: any) => ymd(new Date(d.at)) === day).map((d: any) => stay.paxAt(s, d.at - 1).total - stay.paxAt(s, d.at).total)).reduce((n, x) => n + x, 0);
        const allConf = [...conf.values()].flat();
        const days: string[] = [];
        for (let i = 0; i < 14; i++) days.push(ymd(new Date(now + i * DAY)));
        const per = days.map(d => {
            const r: Record<string, any> = { d, confirmed: 0, tentative: 0, unknown: 0 };
            for (const s of delayed) for (const e of stay.departuresOf(s) as any[]) {
                if (ymd(new Date(e.at)) !== d) continue;
                const n = stay.paxAt(s, e.at - 1).total - stay.paxAt(s, e.at).total;
                const k = e.status === 'booked' ? 'confirmed' : e.status;
                r[k] = (r[k] || 0) + n;
            }
            return r;
        }).filter(r => r.confirmed + r.tentative + r.unknown);
        const soon = SLIPS.filter(s => !stay.isDelayed(s) && [today, tomorrow].includes(s.checkout_date) && stay.slipEnd(s)! > now - 6 * 36e5).sort((a, b) => stay.slipEnd(a)! - stay.slipEnd(b)!);
        return { delayed, conf, beds, leaving: { today: leaving(today), tomorrow: leaving(tomorrow) }, clashes: allConf.filter(c => c.clash).length, tight: allConf.filter(c => c.tight).length, per, soon };
    }, [SLIPS, BLD]);   // eslint-disable-line react-hooks/exhaustive-deps

    const toggle = (k: string, on: boolean) => setTicked(t => { const n = new Set(t); if (on) n.add(k); else n.delete(k); return n; });

    /* ------------------------------ writing ------------------------------ */
    const clone = (s: Slip) => JSON.parse(JSON.stringify(s));
    function fixCheckout(s: Slip) {       // the slip's check-out = the last room to leave
        const ends = ['gents', 'ladies'].flatMap(k => (s.rooms?.[k] || []).filter((x: any) => x.out?.date).map((x: any) => `${x.out.date}T${x.out.time || '00:00'}`)).sort();
        if (ends.length) [s.checkout_date, s.checkout_time] = ends[ends.length - 1].split('T');
    }
    // change the ticked rows (or given slips), check them against incoming bookings, write all, log with undo
    async function write(note: string, change: (s: Slip, rows: [string, number][] | null) => void, ids: number[] | null = null) {
        const byId = new Map(SLIPS.map(s => [s.id, s]));
        const targets = new Map<number, [string, number][] | null>();
        if (ids) for (const id of ids) targets.set(id, null);
        else for (const k of ticked) { const [id, side, i] = k.split('|'); const id2 = Number(id); if (!targets.has(id2)) targets.set(id2, []); targets.get(id2)!.push([side, Number(i)]); }
        if (!targets.size) { say('Tick the rooms first.', true); return; }
        const pairs: [Slip, Slip][] = [];
        for (const [id, rows] of targets) {
            const before = byId.get(id);
            if (!before) continue;
            const after = clone(before);
            change(after, rows);
            fixCheckout(after);
            pairs.push([before, after]);
        }
        // check: no room may overflow with the next groups once these are applied
        const after = new Map(pairs.map(([b, a]) => [b.id, a]));
        const view = SLIPS.map(s => after.get(s.id) || s);
        // only the rooms this change moves (a clash already there on another room must not stop fixing the rest)
        const moved = (b: Slip, a: Slip, x: any) => { const side = (a.rooms.gents || []).includes(x) ? 'gents' : 'ladies'; const i = a.rooms[side].indexOf(x); const y = b.rooms?.[side]?.[i]; return !y || JSON.stringify(y.out || null) !== JSON.stringify(x.out || null); };
        const clashes = pairs.flatMap(([b, a]) => (stay.roomConflicts(a, view, capOf) as any[]).filter(c => c.clash && moved(b, a, c.row.row))
            .map(c => `SH ${a.sh_no} room ${c.row.room_no}: ${c.peak}/${c.cap} beds on ${fmt(c.at)} with ${c.who.map((o: any) => `SH ${o.sh}`).join(', ')}`));
        if (clashes.length) {
            await ask({ title: 'Not saved', confirmLabel: 'OK', body: `These rooms would overflow with groups booked in after:\n\n${clashes.join('\n')}\n\nMove the delayed guests to other rooms (Slip page → Pick rooms…) or choose an earlier date.` });
            return;
        }
        say('Saving…');
        try {
            const res: any = await guard(db.bulkWrite({ put: pairs.map(([, a]) => a) }, 'delay'));
            await recordApply(cloud, siteId, 'delay', note, pairs);
            setTicked(new Set());
            await slipsQ.refetch();
            say(`Saved ${res.updated} slip${res.updated === 1 ? '' : 's'}. Undo is in “Bulk changes” below.`);
        } catch (e: any) { say(e.message || String(e), true); }
    }
    const setRow = (s: Slip, side: string, i: number, out: { date: string; time: string }, st: string) => { const x = s.rooms[side][i]; x.out = out; x.out_status = st; };
    const apply = () => {
        if (!date) { say('Choose the date.', true); return; }
        void write(`${ticked.size} room(s) → ${date} ${time || '10:00'} (${status})`, (s, rows) => rows!.forEach(([side, i]) => setRow(s, side, i, { date, time: time || '10:00' }, status)));
    };
    const hold = () => {
        const d = new Date(Date.now() + HOLD * DAY);
        void write(`${ticked.size} room(s) held ${HOLD} days (unknown)`, (s, rows) => rows!.forEach(([side, i]) => setRow(s, side, i, { date: ymd(d), time: s.rooms[side][i].out?.time || s.checkout_time || '10:00' }, 'unknown')));
    };
    async function left() {
        if (!await ask({ title: 'Mark as left?', confirmLabel: 'Mark left', body: `Mark the ${ticked.size} ticked room(s) as left now? Their beds are free from this minute.` })) return;
        const n = new Date();
        void write(`${ticked.size} room(s) left`, (s, rows) => rows!.forEach(([side, i]) => setRow(s, side, i, { date: ymd(n), time: hm(n) }, 'confirmed')));
    }
    async function markDelayed(s: Slip) {
        if (!await ask({ title: 'Mark delayed?', confirmLabel: 'Mark delayed', body: `Mark SH ${s.sh_no} as a delayed departure? Every room keeps today's check-out as tentative; change the dates above.` })) return;
        void write(`SH ${s.sh_no} marked delayed`, (a) => {
            a.delayed = { on: true, status: 'tentative', note: '', original_checkout: { date: a.checkout_date, time: a.checkout_time }, updated_at: new Date().toISOString() };
            for (const side of ['gents', 'ladies']) for (const x of a.rooms?.[side] || []) if (String(x.room_no || '').trim()) { x.out = { date: a.checkout_date, time: a.checkout_time }; x.out_status = 'tentative'; }
        }, [s.id]);
    }
    // Delayed Departure Report (Excel): every delayed group of this site, one row per departure (views/departures/report.js)
    async function exportExcel() {
        let f = from, t = to;
        if (f && t && f > t) [f, t] = [t, f];
        setExporting(true);
        try {
            const all = await guard(cloud.mirrorAll()).catch(() => SLIPS);
            const mod = await loadApp('views/departures/report.js');
            const rows = mod.reportRows(SLIPS, all, { from: f, to: t });
            if (!rows.length) { say('No delayed departures in these dates.', true); return; }
            await mod.exportReport(rows, site.label, { from: f, to: t });
            say(`Exported ${rows.length} row${rows.length === 1 ? '' : 's'}.`);
        } catch (e: any) { say(e.message || String(e), true); }
        finally { setExporting(false); }
    }

    const kpis: [string, React.ReactNode, string, string?][] = [
        ['Delayed groups', v.delayed.length, `${v.delayed.reduce((n, s) => n + stay.paxAt(s, now).total, 0)} guests in house`, 'big'],
        ['Unknown date', v.beds('unknown'), 'beds held', 'warn'],
        ['Tentative', v.beds('tentative'), 'beds, ticket not confirmed'],
        ['Confirmed', v.beds('confirmed'), 'beds with a new date'],
        ['Leaving today', v.leaving.today, 'guests'],
        ['Leaving tomorrow', v.leaving.tomorrow, 'guests'],
        ['Rooms clashing', v.clashes, 'overflow with the next group', v.clashes ? 'bad' : ''],
        ['Rooms tight', v.tight, 'next group within 2 days', v.tight ? 'amber' : ''],
    ];

    return (
        <div className="mx-auto grid grid-cols-[minmax(0,1fr)] max-w-[2400px] min-w-0 gap-3 px-3 pb-10 pt-4 sm:px-4">
            <header className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                    <h1 className="text-2xl font-bold text-primary">Delayed departures</h1>
                    <p className="text-sm text-muted-foreground">Groups that could not leave on their booked date. Each room has its own check-out: <b>confirmed</b>, <b>tentative</b> (ticket not confirmed) or <b>unknown</b> (beds held). Every change is checked against the groups booked into those rooms next.</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <span className="flex flex-wrap items-center gap-1.5 text-sm" title="Only the departures (Extended Departure Date) between these days">Departed from <Input type="date" className="w-40" value={from} onChange={e => setFrom(e.target.value)} /> to <Input type="date" className="w-40" value={to} onChange={e => setTo(e.target.value)} /></span>
                    <Button disabled={exporting} onClick={() => void exportExcel()} title="Delayed Departure Report — one row per departure of each delayed group, between the two dates"><Download className="size-4" />Export Excel</Button>
                    <Button variant="outline" onClick={() => void slipsQ.refetch().then(() => say(''))}><RefreshCw className="size-4" />Refresh</Button>
                </div>
            </header>

            <section className="grid grid-cols-2 gap-2 sm:grid-cols-4 xl:grid-cols-8">
                {kpis.map(([l, val, s, c]) => (
                    <div key={l} className={cn('grid gap-0.5 rounded-xl border bg-card p-3', c === 'big' && 'col-span-2 border-gold/60 bg-accent/40', c === 'warn' && 'border-warn/50 bg-warn-soft', c === 'bad' && 'border-destructive/50 bg-bad-soft', c === 'amber' && 'border-warn/50')}>
                        <span className="text-xs text-muted-foreground">{l}</span><b className="text-2xl">{val}</b><small className="text-xs text-muted-foreground">{s}</small>
                    </div>
                ))}
            </section>

            {writable && (
                <section className="sticky top-0 z-20 flex flex-wrap items-center gap-2 rounded-xl border bg-card p-3 shadow-sm">
                    <span className="text-sm font-bold">{ticked.size} room{ticked.size === 1 ? '' : 's'} ticked</span>
                    <span className="flex flex-wrap items-center gap-1.5 text-sm">Leaves <Input type="date" className="w-40" value={date} onChange={e => setDate(e.target.value)} /><Input type="time" className="w-28" value={time} onChange={e => setTime(e.target.value)} />
                        <Select value={status} onValueChange={setStatus}><SelectTrigger className="w-32" aria-label="Status"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="tentative">tentative</SelectItem><SelectItem value="confirmed">confirmed</SelectItem><SelectItem value="unknown">unknown</SelectItem></SelectContent></Select>
                        <Button onClick={apply}>Set for ticked</Button></span>
                    <Button variant="outline" onClick={hold}>Hold unknown</Button>
                    <Button variant="outline" onClick={() => void left()}>Left now</Button>
                    {msg.text && <span role="status" className={cn('text-sm font-semibold', msg.bad ? 'text-destructive' : 'text-ok')}>{msg.text}</span>}
                </section>
            )}

            <Card className="gap-0 py-0">
                <CardHeader className="border-b py-3"><CardTitle className="text-base">Delayed groups <span className="ml-1 text-xs font-normal text-muted-foreground">tick rooms, then use the bar above · red = the room overflows with the next group · amber = next group within 2 days</span></CardTitle></CardHeader>
                <CardContent className="grid gap-3 p-3">
                    {v.delayed.length ? v.delayed.map(s => {
                        const cs = v.conf.get(s.id) || [];
                        const u = s.ums || {};
                        const gl = String(s.group_leader || u.glName || '').trim(), phone = u.glPhone || u.phone || '';
                        const rowItems: React.ReactNode[] = [];
                        for (const side of ['gents', 'ladies']) (s.rooms?.[side] || []).forEach((x: any, i: number) => {
                            if (!String(x.room_no || '').trim()) return;
                            const w = (stay.rowsOf({ ...s, rooms: { gents: side === 'gents' ? [x] : [], ladies: side === 'ladies' ? [x] : [] } }) as any[])[0];
                            const c = cs.find((k: any) => k.row.row === x);
                            const key = `${s.id}|${side}|${i}`;
                            const gone = w.end <= now;
                            const review = !gone && w.status !== 'confirmed' && w.end - now < 2 * DAY;
                            rowItems.push(
                                <TableRow key={key} className={cn(gone && 'opacity-50', !gone && c?.clash && 'bg-bad-soft', !gone && !c?.clash && c?.tight && 'bg-warn-soft/60', review && 'outline outline-1 -outline-offset-1 outline-warn/50')}>
                                    <TableCell>{writable && !gone ? <Checkbox checked={ticked.has(key)} onCheckedChange={on => toggle(key, on === true)} aria-label={`Room ${x.room_no}`} /> : null}</TableCell>
                                    <TableCell><b>{x.room_no}</b><small className="block text-muted-foreground">{side === 'gents' ? 'Gents' : 'Ladies'}{x.gl ? ' · GL' : ''}</small></TableCell>
                                    <TableCell className="text-right">{w.beds}</TableCell>
                                    <TableCell>{fmt(w.end)}{review && <small className="block text-warn">review — leaves soon, not confirmed</small>}</TableCell>
                                    <TableCell><StBadge s={gone ? 'left' : w.status === 'booked' ? 'booked' : w.status} /></TableCell>
                                    <TableCell className="text-sm">{gone ? '' : c?.clash ? <><b className="text-destructive">Overflows</b> {fmt(c.at)}: {c.peak}/{c.cap} beds with {c.who.map((o: any) => `SH ${o.sh}`).join(', ')}</>
                                        : c?.next ? `next: SH ${c.next.sh} from ${fmt(c.next.start)}` : <span className="text-muted-foreground">no one booked after</span>}</TableCell>
                                </TableRow>,
                            );
                        });
                        return (
                            <article key={s.id} className="grid gap-2 rounded-xl border bg-white p-3">
                                <header className="flex flex-wrap items-start justify-between gap-2">
                                    <div className="min-w-0"><a className="font-bold text-primary underline" href={href('slip', { sh_no: s.sh_no })} title="Open the slip">SH {s.sh_no}</a> <b>{s.tour_name || '-'}</b>
                                        <small className="block text-muted-foreground">{gl || '-'}{phone ? ` · ${phone}` : ''} · {s.building || 'no building'}</small></div>
                                    <div className="flex flex-wrap items-center gap-2 text-sm"><StBadge s={s.delayed.status || ''} /><span>{stay.paxAt(s, now).total} in house</span>
                                        <span className="text-xs text-muted-foreground">booked to leave {s.delayed.original_checkout ? `${s.delayed.original_checkout.date} ${s.delayed.original_checkout.time}` : '—'}</span></div>
                                </header>
                                {s.delayed.note && <p className="rounded bg-muted p-2 text-sm">{s.delayed.note}</p>}
                                {rowItems.length ? (
                                    <div className="overflow-x-auto"><Table>
                                        <TableHeader><TableRow><TableHead>{writable && <Checkbox aria-label="Tick all rooms" onCheckedChange={on => ['gents', 'ladies'].forEach(side => (s.rooms?.[side] || []).forEach((x: any, i: number) => { if (String(x.room_no || '').trim()) toggle(`${s.id}|${side}|${i}`, on === true); }))} />}</TableHead><TableHead>Room</TableHead><TableHead className="text-right">Beds</TableHead><TableHead>Leaves</TableHead><TableHead>Status</TableHead><TableHead>Next group in the room</TableHead></TableRow></TableHeader>
                                        <TableBody>{rowItems}</TableBody></Table></div>
                                ) : <p className="text-sm text-muted-foreground">No rooms on this slip — the whole group leaves at the slip's check-out.</p>}
                            </article>
                        );
                    }) : <p className="text-sm text-muted-foreground">No delayed groups. Mark one from the list below or on the Slip page (Delayed departure).</p>}
                </CardContent>
            </Card>

            <section className="grid gap-3 lg:grid-cols-2">
                <Card className="gap-0 py-0"><CardHeader className="border-b py-3"><CardTitle className="text-base">Leaving per day <span className="ml-1 text-xs font-normal text-muted-foreground">guests leaving from delayed groups — for transport</span></CardTitle></CardHeader>
                    <CardContent className="overflow-x-auto p-0">
                        {v.per.length ? <Table><TableHeader><TableRow><TableHead>Day</TableHead><TableHead className="text-right">Confirmed</TableHead><TableHead className="text-right">Tentative</TableHead><TableHead className="text-right">Unknown (hold ends)</TableHead><TableHead className="text-right">Total</TableHead></TableRow></TableHeader>
                            <TableBody>{v.per.map(r => <TableRow key={r.d}><TableCell>{new Date(`${r.d}T12:00`).toLocaleDateString(undefined, { weekday: 'short', day: '2-digit', month: 'short' })}</TableCell><TableCell className="text-right">{r.confirmed || ''}</TableCell><TableCell className="text-right">{r.tentative || ''}</TableCell><TableCell className="text-right">{r.unknown || ''}</TableCell><TableCell className="text-right"><b>{r.confirmed + r.tentative + r.unknown}</b></TableCell></TableRow>)}</TableBody></Table>
                            : <p className="p-3 text-sm text-muted-foreground">No delayed guests leaving in the next 14 days.</p>}
                    </CardContent></Card>
                <Card className="gap-0 py-0"><CardHeader className="border-b py-3"><CardTitle className="text-base">Booked to leave today &amp; tomorrow <span className="ml-1 text-xs font-normal text-muted-foreground">mark a group delayed if its flight is off</span></CardTitle></CardHeader>
                    <CardContent className="overflow-x-auto p-0">
                        {v.soon.length ? <Table><TableHeader><TableRow><TableHead>SH</TableHead><TableHead>Group</TableHead><TableHead>Leaves</TableHead><TableHead className="text-right">Pax</TableHead><TableHead /></TableRow></TableHeader>
                            <TableBody>{v.soon.map(s => <TableRow key={s.id}><TableCell><b>{s.sh_no}</b></TableCell><TableCell>{s.tour_name || '-'}<small className="block text-muted-foreground">{s.building || ''}</small></TableCell><TableCell>{fmt(stay.slipEnd(s))}</TableCell><TableCell className="text-right">{stay.paxAt(s, stay.slipEnd(s)! - 1).total}</TableCell>
                                <TableCell>{writable && <Button size="sm" variant="outline" onClick={() => void markDelayed(s)}>Mark delayed</Button>}</TableCell></TableRow>)}</TableBody></Table>
                            : <p className="p-3 text-sm text-muted-foreground">No groups booked to leave today or tomorrow.</p>}
                    </CardContent></Card>
            </section>

            <AllocLog />
            {dialog}
            {extra.isError && <Badge variant="destructive">Could not load the rooms.</Badge>}
        </div>
    );
}
