import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { useSlips } from '@/hooks/useSlips';
import { useCore, useGuard, useSite } from '@/pms/PmsContext';
import { MAX_NIGHTS, computeHisaab, hisaabHtml, money, pct, ymd } from './hisaab';

// Accounts → Building Hisaab: each room's charge per night (kept in this browser only), a period from a date and time to a date and time, the time a night is
// counted at, and the room × night chart of occupied (✓) / vacant (✗) from the slips — with the payable, room-nights occupied and vacant, and a printable statement.

type Row = Record<string, any>;
const MARK = { yes: '✓', no: '✗', gone: '—' } as const;
const dShort = (d: string) => new Date(`${d}T12:00`).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
const wd = (d: string) => new Date(`${d}T12:00`).toLocaleDateString('en-GB', { weekday: 'short' });
const RKEY = (site: string, b: string) => `pms_hisaab_rates:${site}:${b}`;
const readRates = (site: string, b: string): Record<string, number> => { try { return JSON.parse(localStorage.getItem(RKEY(site, b)) || '{}') || {}; } catch { return {}; } };
const plus = (d: string, n: number) => { const x = new Date(`${d}T12:00`); x.setDate(x.getDate() + n); return ymd(x); };

export default function BuildingHisaabPage() {
    const { rooms: R, stay, cloud } = useCore();
    const r = R as any;
    const guard = useGuard();
    const { site, siteId } = useSite();
    const today = ymd(new Date());
    const slips = useSlips();
    const builders = useQuery({ queryKey: ['buildings-force', siteId], queryFn: async () => r.buildingsOfSite(await guard(r.loadBuildings({ force: true })), siteId) as Row[] });
    const [bld, setBld] = useState('');
    const [p, setP] = useState({ fd: plus(today, -6), ft: '12:00', td: today, tt: '12:00' });
    const [rates, setRatesRaw] = useState<Record<string, number>>({});   // room → SAR per night, this browser (localStorage)
    const [at, setAt] = useState(() => { try { return localStorage.getItem('pms_hisaab_at') || '22:00'; } catch { return '22:00'; } });
    const [all, setAll] = useState('');
    const [msg, setMsg] = useState<{ t: string; bad?: boolean }>({ t: '' });

    const list = builders.data ?? [];
    useEffect(() => { if (!bld && list.length) setBld(list[0].name); }, [list.length]);   // eslint-disable-line react-hooks/exhaustive-deps
    const b = list.find(x => x.name === bld);
    useEffect(() => { setRatesRaw(bld ? readRates(siteId, bld) : {}); }, [bld, siteId]);
    // every change is kept at once (no Save): the charges never leave this computer
    const setRates = (f: (x: Record<string, number>) => Record<string, number>) => setRatesRaw(x => { const n = f(x); try { localStorage.setItem(RKEY(siteId, bld), JSON.stringify(n)); } catch { } return n; });
    useEffect(() => { try { localStorage.setItem('pms_hisaab_at', at); } catch { } }, [at]);
    const from = Date.parse(`${p.fd}T${p.ft}`), to = Date.parse(`${p.td}T${p.tt}`);
    const bad = !p.fd || !p.td || Number.isNaN(from) || Number.isNaN(to) ? 'Choose both dates.' : to <= from ? 'The end must be after the beginning.' : '';
    const H = useMemo(() => (b && slips.data && !bad ? computeHisaab(slips.data, b, from, to, stay, R, rates, at || '22:00') : null), [b, slips.data, from, to, rates, bad, at]);   // eslint-disable-line react-hooks/exhaustive-deps
    const nights = H ? H.occ + H.vac : 0;

    function setForAll() {
        const v = Number(all);
        if (!(v >= 0) || all === '') { setMsg({ t: 'Enter the charge per night first.', bad: true }); return; }
        setRates(x => { const n = { ...x }; for (const rm of H?.rooms ?? []) n[rm.no] = v; return n; });
    }
    function print() {
        if (!H) return;
        const w = window.open('', '_blank');
        if (!w) { setMsg({ t: 'The browser blocked the new tab: allow pop-ups for this site.', bad: true }); return; }
        w.document.open(); w.document.write(hisaabHtml(H, site.label, String(cloud.currentDesk()?.name || ''))); w.document.close();
    }

    const kpi = (label: string, value: string, sub?: string, main?: boolean) => (
        <div className={cn('rounded-lg border p-3', main ? 'border-primary bg-primary text-primary-foreground' : 'bg-card')}><div className={cn('text-xs font-semibold uppercase tracking-wide', main ? 'opacity-90' : 'text-muted-foreground')}>{label}</div><div className="text-2xl font-bold">{value}</div>{sub && <div className="text-xs opacity-80">{sub}</div>}</div>
    );

    return (
        <div className="mx-auto grid max-w-[2400px] min-w-0 gap-3 px-3 pb-10 pt-4 sm:px-4">
            <header><h1 className="text-2xl font-bold text-primary">Building Hisaab — {site.label}</h1>
                <p className="text-sm text-muted-foreground">Set each room's charge per night, choose the period: the chart shows each night (counted at the time you choose, 22:00 unless changed) whether the room was occupied (✓) or vacant (✗), and the payable is occupied nights × charge.</p></header>

            <Card className="flex-row flex-wrap items-end gap-3 p-3">
                <div className="grid gap-1"><Label htmlFor="hbB">Building</Label>
                    <select id="hbB" className="h-9 min-w-40 rounded-md border bg-background px-2 text-sm" value={bld} onChange={e => setBld(e.target.value)}>{list.map(x => <option key={x.name}>{x.name}</option>)}</select></div>
                <div className="grid gap-1"><Label htmlFor="hbFd">From</Label><div className="flex gap-1"><Input id="hbFd" type="date" className="h-9 w-40" value={p.fd} onChange={e => setP({ ...p, fd: e.target.value })} /><Input aria-label="From time" type="time" className="h-9 w-28" value={p.ft} onChange={e => setP({ ...p, ft: e.target.value })} /></div></div>
                <div className="grid gap-1"><Label htmlFor="hbTd">To</Label><div className="flex gap-1"><Input id="hbTd" type="date" className="h-9 w-40" value={p.td} onChange={e => setP({ ...p, td: e.target.value })} /><Input aria-label="To time" type="time" className="h-9 w-28" value={p.tt} onChange={e => setP({ ...p, tt: e.target.value })} /></div></div>
                <div className="grid gap-1"><Label htmlFor="hbAt">Count each night at</Label><Input id="hbAt" type="time" className="h-9 w-28" value={at} onChange={e => setAt(e.target.value)} title="A room is occupied on a night when a stay covers this time" /></div>
                <Button variant="outline" disabled={!H} onClick={print}><Printer className="size-4" />Print statement</Button>
                <span className={cn('text-sm', bad || msg.bad ? 'text-destructive' : 'text-muted-foreground')} role="status">{bad || msg.t}</span>
            </Card>

            {!list.length && builders.isSuccess && <Card className="p-4 text-sm">No buildings are set up for {site.label} in Rooms &amp; Buildings.</Card>}
            {H && <>
                <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
                    {kpi('Total payable', `SAR ${money(H.payable)}`, `${H.days.length} nights · ${H.rooms.length} rooms`, true)}
                    {kpi('Room-nights occupied', String(H.occ), `${pct(H.occ, nights)}%`)}
                    {kpi('Room-nights vacant', String(H.vac), `${pct(H.vac, nights)}%`)}
                    {kpi('Occupancy', `${pct(H.occ, nights)}%`)}
                    {kpi('Vacancy', `${pct(H.vac, nights)}%`)}
                </div>
                {(H.noRate > 0 || H.cut) && <p className="text-sm text-warn">{H.noRate > 0 && `${H.noRate} room(s) have no charge set (counted as 0). `}{H.cut && `Only the first ${MAX_NIGHTS} nights are shown.`}</p>}

                <Card className="flex-row flex-wrap items-end gap-2 p-3">
                    <div className="grid gap-1"><Label htmlFor="hbAll">Charge per night for every room (SAR)</Label><Input id="hbAll" type="number" min={0} step="any" className="h-9 w-36" value={all} onChange={e => setAll(e.target.value)} /></div>
                    <Button variant="outline" onClick={setForAll}>Set for all rooms</Button>
                    <span className="text-xs text-muted-foreground">Or type a charge on any room below. Charges are kept on this computer only (this browser), for each building — they are not sent to the server.</span>
                </Card>

                <Card className="overflow-auto p-0">
                    <table className="w-max min-w-full border-collapse text-sm">
                        <thead className="sticky top-0 z-10 bg-secondary">
                            <tr><th className="sticky left-0 z-20 bg-secondary p-1.5 text-left">Room</th><th className="p-1.5">SAR / night</th>
                                {H.days.map(d => <th key={d} className="p-1 text-center leading-tight"><span className="block text-[10px] font-medium text-muted-foreground">{wd(d)}</span>{dShort(d)}</th>)}
                                <th className="border-l-2 border-gold p-1.5">Nights</th><th className="p-1.5 text-right">Amount</th></tr>
                        </thead>
                        <tbody>
                            {H.rooms.map(rm => (
                                <tr key={rm.no} className="border-b">
                                    <th className="sticky left-0 z-10 bg-card p-1.5 text-left">{rm.no}</th>
                                    <td className="p-1"><Input aria-label={`Charge for room ${rm.no}`} type="number" min={0} step="any" className="h-7 w-24 text-right" value={rates[rm.no] ?? ''} onChange={e => setRates(x => ({ ...x, [rm.no]: Number(e.target.value) || 0 }))} /></td>
                                    {rm.cells.map((c, i) => <td key={i} className={cn('border-l p-1 text-center font-bold', c === 'yes' ? 'text-good' : c === 'no' ? 'text-destructive' : 'bg-muted text-muted-foreground')} title={`${rm.no} · ${dShort(H.days[i])}: ${c === 'yes' ? 'occupied' : c === 'no' ? 'vacant' : 'handed back to the hotel'}`}>{MARK[c]}</td>)}
                                    <td className="border-l-2 border-gold p-1.5 text-center">{rm.occ}</td><td className="p-1.5 text-right">{money(rm.amount)}</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot className="bg-secondary font-bold">
                            <tr><th className="sticky left-0 bg-secondary p-1.5 text-left">Occupied</th><td />{H.perDay.map(d => <td key={d.day} className="p-1 text-center">{d.occ}</td>)}<td className="border-l-2 border-gold p-1.5 text-center">{H.occ}</td><td className="p-1.5 text-right">SAR {money(H.payable)}</td></tr>
                            <tr><th className="sticky left-0 bg-secondary p-1.5 text-left">Vacant</th><td />{H.perDay.map(d => <td key={d.day} className="p-1 text-center">{d.vac}</td>)}<td className="border-l-2 border-gold p-1.5 text-center">{H.vac}</td><td /></tr>
                            <tr><th className="sticky left-0 bg-secondary p-1.5 text-left">Payable</th><td />{H.perDay.map(d => <td key={d.day} className="p-1 text-center text-xs">{money(d.amount)}</td>)}<td className="border-l-2 border-gold" /><td /></tr>
                        </tfoot>
                    </table>
                </Card>
            </>}
            {!H && !bad && <Card className="p-4 text-sm text-muted-foreground">Loading…</Card>}
        </div>
    );
}
