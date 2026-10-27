import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useSlips } from '@/hooks/useSlips';
import { useCore, useGuard, useLoadApp, useSite } from '@/pms/PmsContext';
import { MAX_DAYS, computeOccupancy, num, pct, shift, sum, ymd, type BuildingIn } from './occupancy';

// Occupancy details (Rooms): beds in use each night of a period — the whole site first (totals and averages), then each building (period averages,
// night by night), then every room bed by bed. A night is counted at 22:00. From the rooms assigned on the slips; beds come from Rooms & Buildings.

const dayLbl = (d: string) => new Date(`${d}T12:00`).toLocaleDateString(undefined, { day: '2-digit', month: 'short' });
const wkLbl = (d: string) => new Date(`${d}T12:00`).toLocaleDateString(undefined, { weekday: 'short' });
const RANGES: [string, number, number][] = [['Next 7 days', 0, 6], ['Next 14', 0, 13], ['Next 30', 0, 29], ['Last 7', -7, -1], ['Last 30', -30, -1]];

// a green that deepens with the share of beds in use (the legacy page's colour mix)
const heat = (p: number): React.CSSProperties => ({ background: `color-mix(in srgb, #2f7d32 ${Math.min(100, p)}%, #fbf6ea)`, fontWeight: 700, color: '#2b1e15' });

function Dots({ used, cap }: { used: number; cap: number }) {
    if (cap > 12 || used > 16) return <span className="text-xs font-bold">{used}/{cap}</span>;
    return <span className="inline-flex max-w-16 flex-wrap justify-center gap-0.5">{Array.from({ length: Math.max(cap, used) }, (_, k) =>
        <i key={k} className={cn('size-2 rounded-full border', k >= cap ? 'border-destructive bg-destructive' : k < used ? 'border-ok bg-ok' : 'border-[#c9b48e] bg-white')} />)}</span>;
}

export default function OccupancyPage() {
    const { rooms: roomsLib, stay } = useCore();
    const guard = useGuard();
    const loadApp = useLoadApp();
    const { siteId } = useSite();
    const today = ymd(new Date());
    const [from, setFrom] = useState(today), [to, setTo] = useState(shift(today, 13)), [bld, setBld] = useState('all');
    const [printOpen, setPrintOpen] = useState(false), [printBld, setPrintBld] = useState('');

    const slips = useSlips();
    const builders = useQuery({ queryKey: ['buildings-force', siteId], queryFn: async () => roomsLib.buildingsOfSite(await guard(roomsLib.loadBuildings({ force: true })), siteId) });
    const buildings = useMemo<BuildingIn[]>(() => (builders.data ?? []).map((b: any) => ({ name: b.name, rooms: b.rooms.filter((r: any) => r.active !== false && num(r.capacity) > 0) })).filter((b: BuildingIn) => b.rooms.length), [builders.data]);

    const M = useMemo(() => slips.data && builders.data ? computeOccupancy(slips.data, buildings, { from: from || today, to: to || from || today, only: bld === 'all' ? undefined : bld }, stay, roomsLib) : null, [slips.data, buildings, from, to, bld, stay, roomsLib, builders.data]);   // eslint-disable-line react-hooks/exhaustive-deps

    async function doPrint() {
        if (!printBld) return;
        let f = from || today, t = to || f;
        if (f > t) [f, t] = [t, f];
        setPrintOpen(false);
        const mod = await loadApp('views/occupancy/allocprint.js');
        mod.printAllocation(slips.data ?? [], printBld, f, t);
    }

    return (
        <div className="mx-auto grid grid-cols-[minmax(0,1fr)] max-w-[2400px] min-w-0 gap-3 px-3 pb-10 pt-4 sm:px-4">
            <header className="grid gap-3 print:hidden">
                <div>
                    <h1 className="text-2xl font-bold text-primary">Occupancy details</h1>
                    <p className="text-sm text-muted-foreground">Beds in use each night (counted at 22:00) — totals first, then each building, then every room and bed. From the rooms assigned on the slips; beds come from Rooms &amp; Buildings.</p>
                </div>
                <div className="flex flex-wrap items-end gap-3">
                    <div className="grid gap-1"><Label htmlFor="ocFrom">From</Label><Input id="ocFrom" type="date" value={from} onChange={e => setFrom(e.target.value)} /></div>
                    <div className="grid gap-1"><Label htmlFor="ocTo">To</Label><Input id="ocTo" type="date" value={to} onChange={e => setTo(e.target.value)} /></div>
                    <div className="grid gap-1"><Label htmlFor="ocBld">Building</Label>
                        <Select value={bld} onValueChange={setBld}><SelectTrigger id="ocBld" className="min-w-44"><SelectValue /></SelectTrigger>
                            <SelectContent><SelectItem value="all">All buildings</SelectItem>{buildings.map(b => <SelectItem key={b.name} value={b.name}>{b.name}</SelectItem>)}</SelectContent></Select></div>
                    <div className="flex flex-wrap gap-1.5">{RANGES.map(([l, a, z]) => <Button key={l} variant="outline" size="sm" onClick={() => { setFrom(shift(today, a)); setTo(shift(today, z)); }}>{l}</Button>)}</div>
                    <Button onClick={() => { if (!buildings.length) { alert('No buildings in Rooms & Buildings for this site.'); return; } setPrintBld(bld === 'all' ? '' : bld); setPrintOpen(true); }}><Printer className="size-4" />Print</Button>
                </div>
            </header>

            {!M && <p className="text-sm text-muted-foreground">Loading…</p>}
            {M && (() => {
                const { days, blds, total } = M, D = days.length;
                const usedN = sum(total.used), capN = total.cap * D;
                const nightPct = total.used.map(u => pct(u, total.cap));
                const peakI = nightPct.indexOf(Math.max(...nightPct)), lowI = nightPct.indexOf(Math.min(...nightPct));
                const emptyAvg = Math.round((capN - usedN) / D);
                const unroomedAvg = Math.round(sum(total.unroomed) / D);
                const roomsAll = blds.flatMap(b => b.rooms.filter(r => !r.off));
                const emptyRoomsAvg = Math.round(sum(days.map((_, i) => roomsAll.filter(r => r.used[i] === 0).length)) / D);
                const kpis: [string, React.ReactNode, string, string?][] = [
                    ['Average occupancy', `${pct(usedN, capN)}%`, `${dayLbl(days[0])} → ${dayLbl(days[D - 1])} · ${D} night${D === 1 ? '' : 's'}`, 'big'],
                    ['Beds', total.cap, `${roomsAll.length} rooms · ${blds.length} building${blds.length === 1 ? '' : 's'}`],
                    ['Beds in use per night', Math.round(usedN / D), `average · ${emptyAvg} empty`],
                    ['Busiest night', `${nightPct[peakI] || 0}%`, `${wkLbl(days[peakI])} ${dayLbl(days[peakI])} · ${total.used[peakI]} beds`],
                    ['Quietest night', `${nightPct[lowI] || 0}%`, `${wkLbl(days[lowI])} ${dayLbl(days[lowI])} · ${total.used[lowI]} beds`],
                    ['Bed-nights', usedN, `used of ${capN}`],
                    ['Empty rooms per night', emptyRoomsAvg, 'average'],
                    ...(unroomedAvg ? [['Guests without rooms', unroomedAvg, 'per night, average — not in the %', 'warn'] as [string, React.ReactNode, string, string]] : []),
                ];
                const head = (
                    <tr>
                        <th className="sticky left-0 z-10 bg-card p-1.5 text-left">Building</th>
                        {days.map(d => <th key={d} className="bg-secondary p-1.5 leading-tight"><span className="block text-[10px] font-medium text-muted-foreground">{wkLbl(d)}</span>{dayLbl(d)}</th>)}
                        <th className="border-l-2 border-gold bg-secondary p-1.5">Avg</th>
                    </tr>
                );
                const nightRow = (name: string, cap: number, used: number[], unroomed: number[], total?: boolean) => (
                    <tr key={name} className={cn(total && 'border-b-2 border-gold')}>
                        <th className="sticky left-0 z-10 bg-card p-1.5 text-left">{name}<small className="block text-[10px] font-medium text-muted-foreground">{cap} beds</small></th>
                        {used.map((u, i) => { const p = pct(u, cap); return <td key={i} style={heat(p)} className="border p-1.5 text-center" title={`${name} ${dayLbl(days[i])}: ${u} of ${cap} beds${unroomed[i] ? ` · ${unroomed[i]} guests without rooms` : ''}`}>{p}%{unroomed[i] ? <sup className="font-extrabold text-warn">+</sup> : null}</td>; })}
                        <td style={heat(pct(sum(used), cap * D))} className="border border-l-2 border-gold p-1.5 text-center">{pct(sum(used), cap * D)}%</td>
                    </tr>
                );
                return <>
                    <section className="grid grid-cols-2 gap-2 sm:grid-cols-4 xl:grid-cols-8">
                        {kpis.map(([l, v, s, c]) => (
                            <div key={l} className={cn('grid gap-0.5 rounded-xl border bg-card p-3', c === 'big' && 'col-span-2 border-gold/60 bg-accent/40', c === 'warn' && 'border-warn/50 bg-warn-soft')}>
                                <span className="text-xs text-muted-foreground">{l}</span><b className="text-2xl">{v}</b><small className="text-xs text-muted-foreground">{s}</small>
                            </div>
                        ))}
                    </section>

                    <Card><CardHeader><CardTitle className="text-base">Buildings — period averages <span className="ml-1 text-xs font-normal text-muted-foreground">average and busiest night per building over the period</span></CardTitle></CardHeader>
                        <CardContent className="grid gap-3">
                            {blds.length ? blds.map(b => {
                                const p = b.used.map(u => pct(u, b.cap)), avg = pct(sum(b.used), b.cap * D), pk = Math.max(...p), pkI = p.indexOf(pk);
                                return (
                                    <div key={b.name} className="grid gap-1 sm:grid-cols-[10rem_minmax(0,1fr)] sm:items-center sm:gap-3">
                                        <b>{b.name}</b>
                                        <div className="grid gap-1">
                                            <span className="relative h-3.5 rounded-full bg-muted"><i className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-gold to-primary" style={{ width: `${Math.min(100, avg)}%` }} /><em title="busiest night" className="absolute -inset-y-0.5 w-[3px] rounded bg-destructive" style={{ left: `${Math.min(100, pk)}%` }} /></span>
                                            <span className="text-xs text-muted-foreground"><b className="text-foreground">{avg}%</b> avg · {pk}% busiest ({dayLbl(days[pkI])}) · {b.cap} beds · {Math.round(sum(b.used) / D)} in use per night{sum(b.unroomed) ? ` · ${Math.round(sum(b.unroomed) / D)} without rooms` : ''}</span>
                                        </div>
                                    </div>
                                );
                            }) : <p className="text-sm text-muted-foreground">No buildings with rooms — add them in Rooms &amp; Buildings.</p>}
                        </CardContent></Card>

                    <Card className="gap-0 py-0"><CardHeader className="border-b py-3"><CardTitle className="text-base">Night by night <span className="ml-1 text-xs font-normal text-muted-foreground">% of beds in use · hover a cell for beds · the first row is all buildings, the last column the average</span></CardTitle></CardHeader>
                        <CardContent className="overflow-x-auto p-0">
                            <table className="w-max min-w-full text-xs"><thead>{head}</thead><tbody>
                                {blds.length > 1 && nightRow('All buildings', total.cap, total.used, total.unroomed, true)}
                                {blds.map(b => nightRow(b.name, b.cap, b.used, b.unroomed))}
                            </tbody></table>
                            {sum(total.unroomed) > 0 && <p className="p-3 text-xs text-muted-foreground"><sup>+</sup> some guests that night have a building but no rooms yet (hover for how many) — they are not in the %.</p>}
                        </CardContent></Card>

                    <Card><CardHeader><CardTitle className="text-base">Rooms and beds <span className="ml-1 text-xs font-normal text-muted-foreground">each dot is a bed: filled = in use that night · red = more guests than beds · avg = share of the room's bed-nights used</span></CardTitle></CardHeader>
                        <CardContent className="grid gap-2">
                            {blds.map((b, bi) => {
                                const floors = [...new Set(b.rooms.map(r => r.floor))];
                                return (
                                    <details key={b.name} open={bi === 0 || blds.length === 1} className="rounded-lg border">
                                        <summary className="cursor-pointer p-2.5 text-sm"><b>{b.name}</b> · {b.rooms.filter(r => !r.off).length} rooms · {b.cap} beds · <b>{pct(sum(b.used), b.cap * D)}%</b> average</summary>
                                        <div className="overflow-x-auto">
                                            <table className="w-max min-w-full text-xs">
                                                <thead><tr><th className="sticky left-0 z-10 bg-card p-1.5 text-left">Room</th><th className="p-1.5">Beds</th>{days.map(d => <th key={d} className="bg-secondary p-1.5 leading-tight"><span className="block text-[10px] font-medium text-muted-foreground">{wkLbl(d)}</span>{dayLbl(d)}</th>)}<th className="border-l-2 border-gold bg-secondary p-1.5">Avg</th></tr></thead>
                                                <tbody>{floors.map(f => [
                                                    <tr key={`f-${f}`}><td colSpan={D + 3} className="bg-muted p-1.5 text-left font-bold">Floor {f}</td></tr>,
                                                    ...b.rooms.filter(r => r.floor === f).map(r => {
                                                        const avg = r.cap ? pct(sum(r.used), r.cap * D) : 0;
                                                        return (
                                                            <tr key={r.key} className={cn(r.off && 'opacity-70')}>
                                                                <th className="sticky left-0 z-10 bg-card p-1.5 text-left">{r.no}{r.off && <small className="block text-[10px] font-medium text-muted-foreground">not in Rooms &amp; Buildings</small>}</th>
                                                                <td className="border p-1.5 text-center">{r.cap || '—'}</td>
                                                                {r.used.map((u, i) => <td key={i} className={cn('border p-1.5 text-center', u > r.cap && 'bg-bad-soft')} title={`Room ${r.no} ${dayLbl(days[i])}: ${u} of ${r.cap} beds`}><Dots used={u} cap={r.cap} /></td>)}
                                                                <td style={r.cap ? heat(avg) : undefined} className="border border-l-2 border-gold p-1.5 text-center">{r.cap ? `${avg}%` : '—'}</td>
                                                            </tr>
                                                        );
                                                    }),
                                                ])}</tbody>
                                                <tfoot><tr><th className="sticky left-0 z-10 bg-card p-1.5 text-left">Total</th><td className="p-1.5 text-center">{b.cap}</td>{b.used.map((u, i) => <td key={i} className="border p-1.5 text-center">{u}<small className="block text-[10px] text-muted-foreground">{pct(u, b.cap)}%</small></td>)}<td className="border border-l-2 border-gold p-1.5 text-center font-bold">{pct(sum(b.used), b.cap * D)}%</td></tr></tfoot>
                                            </table>
                                        </div>
                                    </details>
                                );
                            })}
                        </CardContent></Card>

                    <p className="text-xs text-muted-foreground">{D} night{D === 1 ? '' : 's'} · counted at 22:00{M.cut ? ` · only the first ${MAX_DAYS} nights are shown` : ''}</p>
                </>;
            })()}

            <Dialog open={printOpen} onOpenChange={setPrintOpen}>
                <DialogContent className="max-w-[calc(100%-1rem)] sm:max-w-sm">
                    <DialogHeader><DialogTitle>Print rooms allocation</DialogTitle></DialogHeader>
                    <p className="text-sm text-muted-foreground">One building at a time, for the period above.</p>
                    <div className="grid gap-1.5"><Label htmlFor="ocPrintBld">Building</Label>
                        <Select value={printBld} onValueChange={setPrintBld}><SelectTrigger id="ocPrintBld" className="w-full"><SelectValue placeholder="Choose a building…" /></SelectTrigger>
                            <SelectContent>{buildings.map(b => <SelectItem key={b.name} value={b.name}>{b.name}</SelectItem>)}</SelectContent></Select></div>
                    <DialogFooter className="gap-2"><Button variant="outline" onClick={() => setPrintOpen(false)}>Cancel</Button><Button disabled={!printBld} onClick={() => void doPrint()}><Printer className="size-4" />Open &amp; print</Button></DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
