import { useMemo, useState } from 'react';
import { Download, Printer } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { useSlips } from '@/hooks/useSlips';
import { useCore, useSite } from '@/pms/PmsContext';
import { assignedSum, computeMovement, fmt, luggageAt, luggageIndex, nz, parseDT, plusOneDay, roomList, ymd } from './movement';

// Check-ins & Check-outs (mobile): the arrivals and departures of a period, two tables you can resize (text, row height, minimum width), hide columns
// from, export as CSV or print. Default range: today 03:00 → tomorrow 03:00. As., G, L, C and I start hidden.

type Slip = Record<string, any>;
type Col = { id: string; label: string; cls?: string };
const COLS: Col[] = [['sh', 'SH No'], ['lug', 'Luggage at'], ['group', 'Group'], ['leader', 'Leader'], ['bld', 'Building'], ['rooms', 'Rooms'], ['as', 'As.'], ['t', 'T'], ['g', 'G'], ['l', 'L'], ['c', 'C'], ['i', 'I']].map(([id, label]) => ({ id, label }));
const OPTIONAL = ['as', 'g', 'l', 'c', 'i'];

function MovementTable({ title, firstCol, lastCol, rows, lug, hidden, csvName }: { title: string; firstCol: 'cin' | 'cout'; lastCol: 'cin' | 'cout'; rows: Slip[]; lug: Map<string, Slip[]>; hidden: Set<string>; csvName: string }) {
    const [font, setFont] = useState(13), [pad, setPad] = useState(6), [minw, setMinw] = useState(720), [compact, setCompact] = useState(false);
    const when = (r: Slip, c: 'cin' | 'cout') => c === 'cin' ? fmt(parseDT(r.checkin_date, r.checkin_time)) : fmt(parseDT(r.checkout_date, r.checkout_time));
    let slips = 0, guests = 0;
    const body = rows.map(r => { const g = nz(r.gents), l = nz(r.ladies), c = nz(r.children), i = nz(r.infants), t = nz(r.total) || (g + l + c + i); slips++; guests += t; return { r, g, l, c, i, t }; });
    const show = (id: string) => !hidden.has(id);
    const lab = (c: 'cin' | 'cout') => c === 'cin' ? 'Check-in' : 'Check-out';
    const cellPad = `${compact || pad <= 5 ? Math.max(1, pad - 2) : pad}px 8px`;

    function csv() {
        const head = [lab(firstCol), ...COLS.filter(c => show(c.id)).map(c => c.label), lab(lastCol)];
        const lines = [head, ...body.map(({ r, g, l, c, i, t }) => [when(r, firstCol),
            ...COLS.filter(x => show(x.id)).map(x => ({ sh: r.sh_no ?? '', lug: luggageAt(lug, r.sh_no), group: r.tour_name || '', leader: r.group_leader || '', bld: r.building || '', rooms: roomList(r), as: assignedSum(r), t, g, l, c, i } as Record<string, any>)[x.id]),
            when(r, lastCol)])];
        const text = lines.map(row => row.map(v => { const s = String(v ?? '').replace(/\s+/g, ' ').trim(); return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; }).join(',')).join('\n');
        const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([text], { type: 'text/plain' })); a.download = csvName;
        document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 500);
    }

    return (
        <Card className="gap-0 py-0">
            <CardHeader className="flex-row flex-wrap items-center justify-between gap-2 border-b py-3 print:hidden"><CardTitle className="text-base">{title}</CardTitle>
                <div className="flex flex-wrap items-center gap-3 text-xs">
                    <Badge variant="secondary">{slips} slip{slips !== 1 ? 's' : ''} • {guests} guests</Badge>
                    <label className="flex items-center gap-2">Text <Slider className="w-20" min={10} max={18} value={[font]} onValueChange={v => setFont(v[0])} aria-label="Text size" /></label>
                    <label className="flex items-center gap-2">Rows <Slider className="w-20" min={4} max={12} value={[pad]} onValueChange={v => setPad(v[0])} aria-label="Row height" /></label>
                    <label className="flex items-center gap-2">Min‑W <Slider className="w-20" min={520} max={1200} value={[minw]} onValueChange={v => setMinw(v[0])} aria-label="Minimum width" /></label>
                    <Button size="sm" variant="outline" onClick={() => setCompact(c => !c)}>Compact</Button>
                    <Button size="sm" variant="outline" onClick={csv}><Download className="size-3.5" />CSV</Button>
                    <Button size="sm" variant="outline" onClick={() => window.print()}><Printer className="size-3.5" />Print</Button>
                </div>
            </CardHeader>
            <CardContent className="overflow-x-auto p-0">
                <table className="w-full" style={{ fontSize: font, minWidth: minw }}>
                    <thead><tr className="bg-secondary text-left">
                        <th className="whitespace-nowrap" style={{ padding: cellPad }}>{lab(firstCol)}</th>
                        {COLS.filter(c => show(c.id)).map(c => <th key={c.id} style={{ padding: cellPad }}>{c.label}</th>)}
                        <th className="whitespace-nowrap" style={{ padding: cellPad }}>{lab(lastCol)}</th>
                    </tr></thead>
                    <tbody>{body.map(({ r, g, l, c, i, t }, k) => {
                        const v: Record<string, React.ReactNode> = { sh: r.sh_no ?? '', lug: luggageAt(lug, r.sh_no), group: r.tour_name || '', leader: r.group_leader || '', bld: r.building || '', rooms: roomList(r), as: assignedSum(r), t, g, l, c, i };
                        return <tr key={k} className="border-t odd:bg-white/60">
                            <td className="whitespace-nowrap" style={{ padding: cellPad }}>{when(r, firstCol)}</td>
                            {COLS.filter(x => show(x.id)).map(x => <td key={x.id} className={cn(['as', 't', 'g', 'l', 'c', 'i'].includes(x.id) && 'text-right', ['group', 'leader', 'rooms'].includes(x.id) && 'max-w-56 truncate')} title={['group', 'leader', 'rooms'].includes(x.id) ? String(v[x.id] ?? '') : undefined} style={{ padding: cellPad }}>{v[x.id]}</td>)}
                            <td className="whitespace-nowrap" style={{ padding: cellPad }}>{when(r, lastCol)}</td>
                        </tr>;
                    })}{!body.length && <tr><td colSpan={COLS.length + 2} className="p-3 text-muted-foreground">Nothing in this range.</td></tr>}</tbody>
                </table>
            </CardContent>
        </Card>
    );
}

export default function MovementPage() {
    const { stay } = useCore();
    const { site } = useSite();
    const slips = useSlips(60_000);
    const today = ymd(new Date());
    const [df, setDf] = useState(today), [tf, setTf] = useState('03:00'), [dt, setDt] = useState(plusOneDay(today)), [tt, setTt] = useState('03:00');
    const [dtEdited, setDtEdited] = useState(false);
    const [bld, setBld] = useState('all');
    const [hidden, setHidden] = useState<Set<string>>(new Set(OPTIONAL));
    const [range, setRange] = useState({ df: today, tf: '03:00', dt: plusOneDay(today), tt: '03:00' });   // applied with "Submit"
    const [error, setError] = useState('');

    const all = slips.data ?? [];
    const lug = useMemo(() => luggageIndex(all), [all]);
    const res = useMemo(() => {
        const start = parseDT(range.df, range.tf || '03:00'), end = parseDT(range.dt, range.tt || '03:00');
        if (!start || !end || !(end >= start)) return null;
        return { start, end, ...computeMovement(all, start, end, bld === 'all' ? '' : bld, stay) };
    }, [all, range, bld, stay]);

    function submit() {
        let d2 = dt, t2 = tt;
        const start = df ? new Date(`${df}T${tf || '03:00'}`) : null;
        let end = d2 ? new Date(`${d2}T${t2 || '03:00'}`) : null;
        if (start && !d2) { d2 = plusOneDay(df); end = new Date(`${d2}T${t2 || '03:00'}`); }
        if (start && end && !(end > start)) { end = new Date(start.getTime() + 864e5); d2 = ymd(end); t2 = `${String(end.getHours()).padStart(2, '0')}:${String(end.getMinutes()).padStart(2, '0')}`; setDt(d2); setTt(t2); setDtEdited(false); }
        const s2 = parseDT(df, tf || '03:00'), e2 = parseDT(d2, t2 || '03:00');
        if (!s2 || !e2 || !(e2 >= s2)) { setError('Choose a valid date/time range.'); return; }
        setError(''); setRange({ df, tf, dt: d2, tt: t2 });
    }
    const stamp = today.replace(/-/g, '');

    return (
        <div className="mx-auto grid grid-cols-[minmax(0,1fr)] max-w-[1400px] min-w-0 gap-3 px-3 pb-10 pt-4 sm:px-4">
            <header className="flex flex-wrap items-center gap-3 print:hidden"><h1 className="text-2xl font-bold text-primary">Check‑ins &amp; Check‑outs</h1>
                <Badge variant="secondary">{slips.isLoading ? 'Loading…' : res ? `${all.length} slip(s) loaded • range ${fmt(res.start)} → ${fmt(res.end)}` : `${all.length} slip(s) loaded`}</Badge></header>

            <div className="grid grid-cols-2 items-end gap-3 sm:grid-cols-3 lg:grid-cols-7 print:hidden">
                <div className="grid gap-1"><Label htmlFor="dateFrom">From date</Label><Input id="dateFrom" type="date" value={df} onChange={e => { setDf(e.target.value); if (e.target.value && !dtEdited) setDt(plusOneDay(e.target.value)); }} /></div>
                <div className="grid gap-1"><Label htmlFor="timeFrom">From time</Label><Input id="timeFrom" type="time" value={tf} onChange={e => setTf(e.target.value)} /></div>
                <div className="grid gap-1"><Label htmlFor="dateTo">To date</Label><Input id="dateTo" type="date" value={dt} onChange={e => { setDt(e.target.value); setDtEdited(true); }} /></div>
                <div className="grid gap-1"><Label htmlFor="timeTo">To time</Label><Input id="timeTo" type="time" value={tt} onChange={e => setTt(e.target.value)} /></div>
                <div className="col-span-2 grid gap-1 sm:col-span-1"><Label htmlFor="building">Building</Label>
                    <Select value={bld} onValueChange={setBld}><SelectTrigger id="building" className="w-full"><SelectValue /></SelectTrigger>
                        <SelectContent><SelectItem value="all">All buildings</SelectItem>{(site.buildings as string[] | undefined)?.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent></Select></div>
                <div className="col-span-2 flex gap-2"><Button onClick={submit}>Submit</Button><Button variant="outline" onClick={() => void slips.refetch()}>Refresh DB</Button></div>
            </div>
            {error && <p role="alert" className="text-sm font-semibold text-destructive">{error}</p>}

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl border bg-card p-3 text-sm print:hidden">
                <Badge variant="secondary">Columns: only checked are shown</Badge>
                <Badge variant="outline" title="Luggage at">Luggage at: SH with prefix <b className="mx-1">S</b> (e.g. S44030) → building of its first stay (44030)</Badge>
                <div className="flex flex-wrap gap-3">{OPTIONAL.map(id => <label key={id} className="flex items-center gap-1.5"><Checkbox checked={!hidden.has(id)} onCheckedChange={on => setHidden(h => { const n = new Set(h); if (on === true) n.delete(id); else n.add(id); return n; })} />{COLS.find(c => c.id === id)!.label}</label>)}</div>
            </div>

            {res && <>
                <MovementTable title="Check‑ins" firstCol="cin" lastCol="cout" rows={res.ins} lug={lug} hidden={hidden} csvName={`checkins_${stamp}.csv`} />
                <MovementTable title="Check‑outs" firstCol="cout" lastCol="cin" rows={res.outs} lug={lug} hidden={hidden} csvName={`checkouts_${stamp}.csv`} />
            </>}
        </div>
    );
}
