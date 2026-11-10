import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { useSlips } from '@/hooks/useSlips';
import { useCore, useGuard, useSite } from '@/pms/PmsContext';
import { MAX_NIGHTS, computeHisaab, hisaabHtml, money, pct, ymd, type Hisaab } from './hisaab';

// Accounts → Building Hisaab: one charge per room per day, a period from a date and time to a date and time cut into 24-hour days from its From time
// (the counting: hisaab.ts) — Calculate reads the latest slips afresh each time (nothing is kept) and shows the room × day chart of occupied (✓) / vacant (✗) from the slips — with the payable, room-nights occupied and vacant, and a printable statement.

type Row = Record<string, any>;
const MARK = { yes: '✓', no: '✗', gone: '—', off: '·' } as const;
const dShort = (d: string) => new Date(`${d}T12:00`).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
const wd = (d: string) => new Date(`${d}T12:00`).toLocaleDateString('en-GB', { weekday: 'short' });
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
    const [rate, setRate] = useState('');
    const [H, setH] = useState<Hisaab | null>(null);
    const [prog, setProg] = useState<{ t: string; f: number } | null>(null);   // while calculating
    const [msg, setMsg] = useState<{ t: string; bad?: boolean }>({ t: '' });

    // charges are no longer kept: what the earlier version left in this browser goes
    useEffect(() => { try { Object.keys(localStorage).filter(k => k.startsWith('pms_hisaab_')).forEach(k => localStorage.removeItem(k)); } catch { /* nothing kept */ } }, []);
    const list = builders.data ?? [];
    useEffect(() => { if (!bld && list.length) setBld(list[0].name); }, [list.length]);   // eslint-disable-line react-hooks/exhaustive-deps
    const from = Date.parse(`${p.fd}T${p.ft}`), to = Date.parse(`${p.td}T${p.tt}`);
    const bad = !p.fd || !p.td || Number.isNaN(from) || Number.isNaN(to) ? 'Choose both dates.' : to <= from ? 'The end must be after the beginning.' : '';
    // any change of building, period or charge: the old result goes (it no longer matches)
    useEffect(() => { setH(null); }, [bld, p.fd, p.ft, p.td, p.tt, rate]);
    const nights = H ? H.occ + H.vac : 0;

    async function calculate() {
        const v = Number(rate);
        if (bad) { setMsg({ t: bad, bad: true }); return; }
        if (rate === '' || !(v >= 0)) { setMsg({ t: 'Enter the charge per room per day.', bad: true }); return; }
        setH(null); setMsg({ t: '' });
        try {
            setProg({ t: 'Reading the latest slips and buildings…', f: 0.05 });
            const [s, bl] = await Promise.all([slips.refetch(), builders.refetch()]);
            const b = (bl.data ?? []).find((x: Row) => x.name === bld);
            if (!b) throw new Error('Building not found');
            const res = await computeHisaab(s.data ?? [], b, from, to, stay, R, v, (d, t) => setProg({ t: `Checking the stays — ${d} of ${t} slips`, f: 0.1 + 0.85 * (t ? d / t : 1) }));
            setH(res);
            setMsg({ t: `Calculated ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.` });
        } catch (e: any) { setMsg({ t: 'Could not calculate: ' + (e.message || e), bad: true }); }
        finally { setProg(null); }
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
                <p className="text-sm text-muted-foreground">Enter the charge per room per day and the period, then Calculate. The period is cut into 24-hour days from the From time; a room is occupied (✓) on a day if a guest was in it at any time of those 24 hours, else vacant (✗). Payable = occupied room-days × charge. Nothing is kept: each Calculate reads the latest slips.</p></header>

            <Card className="flex-row flex-wrap items-end gap-3 p-3">
                <div className="grid gap-1"><Label htmlFor="hbB">Building</Label>
                    <select id="hbB" className="h-9 min-w-40 rounded-md border bg-background px-2 text-sm" value={bld} onChange={e => setBld(e.target.value)}>{list.map(x => <option key={x.name}>{x.name}</option>)}</select></div>
                <div className="grid gap-1"><Label htmlFor="hbFd">From</Label><div className="flex gap-1"><Input id="hbFd" type="date" className="h-9 w-40" value={p.fd} onChange={e => setP({ ...p, fd: e.target.value })} /><Input aria-label="From time" type="time" className="h-9 w-28" value={p.ft} onChange={e => setP({ ...p, ft: e.target.value })} /></div></div>
                <div className="grid gap-1"><Label htmlFor="hbTd">To</Label><div className="flex gap-1"><Input id="hbTd" type="date" className="h-9 w-40" value={p.td} onChange={e => setP({ ...p, td: e.target.value })} /><Input aria-label="To time" type="time" className="h-9 w-28" value={p.tt} onChange={e => setP({ ...p, tt: e.target.value })} /></div></div>
                <div className="grid gap-1"><Label htmlFor="hbRate">Charge per room per day (SAR)</Label><Input id="hbRate" type="number" min={0} step="any" className="h-9 w-40" value={rate} onChange={e => setRate(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') void calculate(); }} /></div>
                <Button disabled={!!prog || !list.length} onClick={() => void calculate()}>{prog ? 'Calculating…' : 'Calculate'}</Button>
                <Button variant="outline" disabled={!H || !!prog} onClick={print}><Printer className="size-4" />Print statement</Button>
                <span className={cn('text-sm', bad || msg.bad ? 'text-destructive' : 'text-muted-foreground')} role="status">{bad || msg.t}</span>
            </Card>

            {prog && <Card className="grid gap-2 p-4" aria-busy="true">
                <span className="text-sm font-semibold">{prog.t}</span>
                <div className="h-2.5 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary transition-[width]" style={{ width: `${Math.round(prog.f * 100)}%` }} /></div>
            </Card>}
            {!list.length && builders.isSuccess && <Card className="p-4 text-sm">No buildings are set up for {site.label} in Rooms &amp; Buildings.</Card>}
            {!H && !prog && list.length > 0 && <Card className="p-4 text-sm text-muted-foreground">Enter the charge and the period, then press Calculate.</Card>}
            {H && <>
                <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
                    {kpi('Total payable', `SAR ${money(H.payable)}`, `${H.days.length} days · ${H.rooms.length} rooms · SAR ${money(H.rate)} a day`, true)}
                    {kpi('Room-days occupied', String(H.occ), `${pct(H.occ, nights)}%`)}
                    {kpi('Room-days vacant', String(H.vac), `${pct(H.vac, nights)}%`)}
                    {kpi('Occupancy', `${pct(H.occ, nights)}%`)}
                    {kpi('Vacancy', `${pct(H.vac, nights)}%`)}
                </div>
                {H.cut && <p className="text-sm text-warn">Only the first {MAX_NIGHTS} days are shown.</p>}

                <Card className="overflow-auto p-0">
                    <table className="w-max min-w-full border-collapse text-sm">
                        <thead className="sticky top-0 z-10 bg-secondary">
                            <tr><th className="sticky left-0 z-20 bg-secondary p-1.5 text-left">Room</th>
                                {H.days.map(d => <th key={d} className="p-1 text-center leading-tight"><span className="block text-[10px] font-medium text-muted-foreground">{wd(d)}</span>{dShort(d)}</th>)}
                                <th className="border-l-2 border-gold p-1.5">Days</th><th className="p-1.5 text-right">Amount</th></tr>
                        </thead>
                        <tbody>
                            {H.rooms.map(rm => (
                                <tr key={rm.no} className="border-b">
                                    <th className="sticky left-0 z-10 bg-card p-1.5 text-left">{rm.no}{rm.off && <small className="block text-[10px] font-normal text-warn" title="Inactive in Rooms & Buildings, but a slip used it in this period">inactive</small>}</th>
                                    {rm.cells.map((c, i) => <td key={i} className={cn('border-l p-1 text-center font-bold', c === 'yes' ? 'text-good' : c === 'no' ? 'text-destructive' : 'bg-muted text-muted-foreground')} title={`${rm.no} · ${dShort(H.days[i])}: ${c === 'yes' ? 'occupied' : c === 'no' ? 'vacant' : c === 'off' ? 'inactive room, not used' : 'handed back to the hotel'}`}>{MARK[c]}</td>)}
                                    <td className="border-l-2 border-gold p-1.5 text-center">{rm.occ}</td><td className="p-1.5 text-right">{money(rm.amount)}</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot className="bg-secondary font-bold">
                            <tr><th className="sticky left-0 bg-secondary p-1.5 text-left">Occupied</th>{H.perDay.map(d => <td key={d.day} className="p-1 text-center">{d.occ}</td>)}<td className="border-l-2 border-gold p-1.5 text-center">{H.occ}</td><td className="p-1.5 text-right">SAR {money(H.payable)}</td></tr>
                            <tr><th className="sticky left-0 bg-secondary p-1.5 text-left">Vacant</th>{H.perDay.map(d => <td key={d.day} className="p-1 text-center">{d.vac}</td>)}<td className="border-l-2 border-gold p-1.5 text-center">{H.vac}</td><td /></tr>
                            <tr><th className="sticky left-0 bg-secondary p-1.5 text-left">Payable</th>{H.perDay.map(d => <td key={d.day} className="p-1 text-center text-xs">{money(d.amount)}</td>)}<td className="border-l-2 border-gold" /><td /></tr>
                        </tfoot>
                    </table>
                </Card>
            </>}
        </div>
    );
}
