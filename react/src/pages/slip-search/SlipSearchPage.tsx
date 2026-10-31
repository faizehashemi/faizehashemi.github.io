import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { natural, num, roomsOf, slipPax, stamp, when } from '@/lib/format';
import { useSlips } from '@/hooks/useSlips';
import { useCore, useSite } from '@/pms/PmsContext';

const LIMIT = 300;
type Slip = Record<string, any>;

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return <div className="grid gap-0.5 rounded-lg border bg-white p-2"><span className="text-xs text-muted-foreground">{label}</span><b className="break-words text-sm">{children}</b></div>;
}

function RoomTable({ s, k, label }: { s: Slip; k: string; label: string }) {
    const { stay } = useCore();
    const delayed = stay.isDelayed(s);
    const rows = stay.rowsOf(s).filter((r: any) => r.side === k);
    if (!rows.length) return null;
    return (
        <div className="grid gap-1.5">
            <h3 className="text-sm font-bold text-primary">{label}</h3>
            <Table>
                <TableHeader><TableRow><TableHead>Room</TableHead><TableHead className="text-right">Beds</TableHead>{delayed && <TableHead>Leaves</TableHead>}</TableRow></TableHeader>
                <TableBody>
                    {rows.map((r: any, i: number) => (
                        <TableRow key={i}>
                            <TableCell>
                                {r.room_no}
                                {r.exclusive && <Badge variant="outline" className="ml-1.5" title="The whole room is kept for these guests">exclusive · {r.block} beds kept</Badge>}
                                {r.building && r.building !== String(s.building || '').trim() && <small className="ml-1 text-muted-foreground">{r.building}</small>}
                            </TableCell>
                            <TableCell className="text-right">{r.beds}</TableCell>
                            {delayed && <TableCell>{when(r.end)}{r.status !== 'booked' && <Badge variant="outline" className="ml-1.5">{r.status}</Badge>}</TableCell>}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}

// Every transport trip of this slip: the saved transport days around its stay, the rows whose SH ref is this slip's, each with its vehicle, bus number
// and the other groups riding the same vehicle. A grouped trip (adjusted into another vehicle) shows that vehicle's route and number.
function TransportBox({ s }: { s: Slip }) {
    const { stay, transport } = useCore();
    const T = transport as any;
    const { siteId } = useSite();
    const ref = String(s.sh_no ?? '').replace(/^S/i, '');
    const q = useQuery({
        queryKey: ['slip-transport', siteId, s.id, s.sh_no, s.checkin_date, s.checkout_date],
        queryFn: async () => {
            const a = stay.slipStart(s), b = stay.slipEnd(s);
            if (!a || !b) return [];
            const lo = T.addDays(T.ymd(new Date(a)), -2), hi = T.addDays(T.ymd(new Date(b)), 2);
            const days = ((await T.listDays(siteId)) as { day: string }[]).map(d => d.day).filter(d => d >= lo && d <= hi).slice(0, 30);
            const docs = await Promise.all(days.map(d => T.loadDay(siteId, d)));
            const out: Slip[] = [];
            for (const doc of docs) {
                const rows: Slip[] = doc.rows || [], info = T.resolve(rows);
                for (const r of rows.filter(x => String(x.ref ?? '').replace(/^S/i, '') === ref)) {
                    const i = info.get(r.key) || {}, main = i.parent || r;
                    const riders = rows.filter(x => x.key !== r.key && (x.key === main.key || info.get(x.key)?.parent === main));
                    out.push({ r, i, main, riders, day: doc.day || r.day });
                }
            }
            return out.sort((x, y) => String(x.day + (x.r.at || '')).localeCompare(String(y.day + (y.r.at || ''))));
        },
        staleTime: 60_000,
    });
    const list = q.data ?? [];
    return (
        <div className="grid gap-2">
            <h3 className="text-sm font-bold text-primary">Transport</h3>
            {q.isLoading ? <p className="text-sm text-muted-foreground">Loading transport…</p>
                : q.isError ? <p className="text-sm text-destructive">Could not load the transport list.</p>
                : !list.length ? <p className="text-sm text-muted-foreground">No transport trip is saved for this slip.</p>
                : list.map(({ r, i, main, riders, day }, n) => {
                    const dest = T.destById?.[i.dest];
                    const veh = T.vehicleWord(i.vehicle, i.vlabel), no = i.bus;
                    return (
                        <div key={n} className="grid gap-1.5 rounded-lg border bg-white p-2.5">
                            <div className="flex flex-wrap items-baseline justify-between gap-2"><b>{T.longDate(day)}{r.at ? ` · ${T.time12(r.at)}` : ''}</b><Badge variant="outline">{dest ? dest.title : (i.route || r.route || '—')}</Badge></div>
                            <div className="grid grid-cols-2 gap-2">
                                <Field label="Route">{i.route || r.route || '—'}</Field>
                                <Field label="Vehicle">{no != null && no !== '' ? `${veh} no. ${no}` : veh}{i.parent && <small className="ml-1 font-normal">(adjusted into {main.vch || main.operator})</small>}</Field>
                                <Field label="Pax">{r.pax || '—'}{(r.m || r.f || r.c) ? ` (M ${r.m || 0} · F ${r.f || 0} · C ${r.c || 0})` : ''}</Field>
                                <Field label="Building">{i.building || r.building || '—'}</Field>
                                {(main.transporter || r.transporter) && <Field label="Transporter">{main.transporter || r.transporter}</Field>}
                                {(main.vch || r.vch) && <Field label="Vch No">{main.vch || r.vch}</Field>}
                                {(r.dora || main.dora) && <Field label="Dora No">{r.dora || main.dora}</Field>}
                                {(r.rooms || []).length > 0 && <Field label="Rooms">{r.rooms.join(', ')}</Field>}
                            </div>
                            {r.remarks && <p className="text-sm"><b>Remarks:</b> {r.remarks}</p>}
                            {riders.length > 0 && <div className="text-sm"><b>Also on this vehicle:</b> {riders.map((x: Slip) => `${x.operator || '—'} (SH ${x.ref}, ${x.pax || 0} pax)`).join(' · ')}</div>}
                        </div>
                    );
                })}
        </div>
    );
}

function Detail({ s }: { s: Slip }) {
    const { stay } = useCore();
    const delayed = stay.isDelayed(s);
    const note = String(s.notes || s.remarks || '').trim();
    return (
        <div className="grid gap-3">
            <h2 className="text-lg font-bold text-primary">SH {s.sh_no}</h2>
            <div className="grid grid-cols-2 gap-2">
                <Field label="Group">{s.tour_name || '—'}</Field>
                <Field label="Group leader">{String(s.group_leader || '').trim() || '-'}</Field>
                <Field label="Building">{s.building || '—'}</Field>
                {(s.from_place || s.to_place) && <Field label="From → To">{s.from_place || '—'} → {s.to_place || '—'}</Field>}
                <Field label="Check-in">{when(stay.slipStart(s))}</Field>
                {s.checked_in && <Field label="Checked in">yes</Field>}
                <Field label="Check-out">{when(stay.slipEnd(s))}{delayed && <Badge variant="outline" className="ml-1.5">delayed</Badge>}</Field>
                <Field label="Total pax">{slipPax(s) || '—'}</Field>
                <Field label="Gents · Ladies">{num(s.gents)} · {num(s.ladies)}</Field>
                <Field label="Children · Infants">{num(s.children ?? s.child)} · {num(s.infants ?? s.infant)}</Field>
                {s.ums?.key && <Field label="From UMS">{stamp(s.ums.importedAt)}</Field>}
                <Field label="Created">{stamp(s.createdAt)}</Field>
                {s.updatedAt && <Field label="Last changed">{stamp(s.updatedAt)}</Field>}
            </div>
            <RoomTable s={s} k="gents" label="Gents rooms" />
            <RoomTable s={s} k="ladies" label="Ladies rooms" />
            {!stay.rowsOf(s).length && <p className="text-muted-foreground">No rooms assigned yet.</p>}
            {note && <div><h3 className="text-sm font-bold text-primary">Notes</h3><p className="whitespace-pre-wrap">{note}</p></div>}
            <TransportBox s={s} />
        </div>
    );
}

// Search slips (Data): find a slip and read it. View only — no edit, delete, import, export or print.
export default function SlipSearchPage() {
    const { stay } = useCore();
    const slips = useSlips();
    const [q, setQ] = useState(''), [room, setRoom] = useState(''), [bld, setBld] = useState('all'), [from, setFrom] = useState(''), [to, setTo] = useState('');
    const [currentId, setCurrentId] = useState<number | null>(null);

    const all = slips.data ?? [];
    const buildings = useMemo(() => [...new Set(all.map(s => String(s.building || '').trim()).filter(Boolean))].sort(natural), [all]);
    const shown = useMemo(() => {
        const qq = q.trim().toLowerCase(), rr = room.trim().toLowerCase();
        const f = from ? new Date(`${from}T00:00`).getTime() : null, t = to ? new Date(`${to}T23:59:59`).getTime() : null;
        return all.filter(s => {
            if (bld !== 'all' && String(s.building || '').trim() !== bld) return false;
            if (qq && ![s.sh_no, s.tour_name, s.group_leader, s.building].join(' ').toLowerCase().includes(qq)) return false;
            if (rr && !roomsOf(s).some(r => r.toLowerCase().includes(rr))) return false;
            if (f && (stay.slipEnd(s) || 0) < f) return false;          // staying at any time between the two dates
            if (t && (stay.slipStart(s) || Infinity) > t) return false;
            return true;
        }).sort((a, b) => (stay.slipStart(b) || 0) - (stay.slipStart(a) || 0));
    }, [all, q, room, bld, from, to, stay]);
    const list = shown.slice(0, LIMIT);
    const current = all.find(s => s.id === currentId) ?? null;

    return (
        <div className="mx-auto grid grid-cols-[minmax(0,1fr)] max-w-[2400px] min-w-0 gap-3 px-3 pb-8 pt-4 sm:px-4">
            <header className="grid gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-primary">Search slips</h1>
                    <p className="text-sm text-muted-foreground">Find a slip and see its details. View only — nothing can be changed here.</p>
                </div>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
                    <div className="col-span-2 grid gap-1 sm:col-span-1"><Label htmlFor="ssQ">Search</Label><Input id="ssQ" type="search" placeholder="SH, group, leader, building" autoComplete="off" value={q} onChange={e => setQ(e.target.value)} /></div>
                    <div className="grid gap-1"><Label htmlFor="ssRoom">Room</Label><Input id="ssRoom" type="search" placeholder="e.g. 501" autoComplete="off" value={room} onChange={e => setRoom(e.target.value)} /></div>
                    <div className="grid gap-1"><Label htmlFor="ssBld">Building</Label>
                        <Select value={bld} onValueChange={setBld}>
                            <SelectTrigger id="ssBld" className="w-full"><SelectValue /></SelectTrigger>
                            <SelectContent><SelectItem value="all">All buildings</SelectItem>{buildings.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
                        </Select></div>
                    <div className="grid gap-1"><Label htmlFor="ssFrom">Staying from</Label><Input id="ssFrom" type="date" value={from} onChange={e => setFrom(e.target.value)} /></div>
                    <div className="grid gap-1"><Label htmlFor="ssTo">to</Label><Input id="ssTo" type="date" value={to} onChange={e => setTo(e.target.value)} /></div>
                </div>
            </header>

            <div className="grid min-w-0 items-start gap-3 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
                <Card className="min-w-0 gap-0 py-0">
                    <CardHeader className="flex-row items-center justify-between border-b py-2.5">
                        <CardTitle className="text-base">Slips</CardTitle>
                        <span className="text-xs text-muted-foreground">
                            {slips.isLoading ? 'Loading…' : shown.length > LIMIT ? `${shown.length} slips · first ${LIMIT} shown, narrow the search` : `${shown.length} slip${shown.length === 1 ? '' : 's'}`}
                        </span>
                    </CardHeader>
                    <CardContent className="max-h-[70vh] overflow-auto p-0">
                        <Table>
                            <TableHeader><TableRow><TableHead>SH</TableHead><TableHead>Group · leader</TableHead><TableHead>Building · rooms</TableHead><TableHead>Check-in</TableHead><TableHead>Check-out</TableHead><TableHead className="text-right">Pax</TableHead></TableRow></TableHeader>
                            <TableBody>
                                {list.length ? list.map(s => {
                                    const rooms = roomsOf(s);
                                    return (
                                        <TableRow key={s.id} tabIndex={0} data-state={currentId === s.id ? 'selected' : undefined}
                                            className={cn('cursor-pointer', currentId === s.id && 'bg-accent')}
                                            onClick={() => setCurrentId(s.id)} onKeyDown={e => { if (e.key === 'Enter') setCurrentId(s.id); }}>
                                            <TableCell><b>{s.sh_no}</b></TableCell>
                                            <TableCell>{s.tour_name}<small className="block text-muted-foreground">{String(s.group_leader || '').trim() || '-'}</small></TableCell>
                                            <TableCell>{s.building || '—'}{rooms.length > 0 && <small className="block text-muted-foreground">{rooms.join(', ')}</small>}</TableCell>
                                            <TableCell className="whitespace-nowrap">{when(stay.slipStart(s))}</TableCell>
                                            <TableCell className="whitespace-nowrap">{when(stay.slipEnd(s))}{stay.isDelayed(s) && <Badge variant="outline" className="ml-1.5">delayed</Badge>}</TableCell>
                                            <TableCell className="text-right">{slipPax(s) || '—'}</TableCell>
                                        </TableRow>
                                    );
                                }) : <TableRow><TableCell colSpan={6} className="text-muted-foreground">No slips match.</TableCell></TableRow>}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
                <Card className="min-w-0 lg:sticky lg:top-3"><CardContent>
                    {current ? <Detail s={current} /> : <p className="text-muted-foreground">Tap a slip to see its details.</p>}
                </CardContent></Card>
            </div>
        </div>
    );
}
