import { useEffect, useMemo, useRef, useState } from 'react';
import { ImageDown, Printer } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSlips } from '@/hooks/useSlips';
import { cn } from '@/lib/utils';
import { useCore, useLoadCore, useSite } from '@/pms/PmsContext';
import { buildCooking, buildManda, colorOf, type MealRow, type Show, type Stats } from './mawaid';

// Mawaid counts (Groups & meals): the building table (BAHA+HUSN merged), a Cooking Count and Manda Counts. A guest counts for a meal when their stay
// overlaps the meal time. Thals = pax ÷ thal size, rounded up. Slips come from the cloud for the site being viewed.

const pad = (n: number) => String(n).padStart(2, '0');
const MEAL = { B: 'bg-[#fff8e6]', L: 'bg-[#eaf9ff]', D: 'bg-[#f3e9ff]' } as const;
const MEAL_NAMES = { B: 'Breakfast', L: 'Lunch', D: 'Dinner' } as const;

function MealTable({ stats, show, tableRef, id }: { stats: Stats; show: Show; tableRef: React.RefObject<HTMLTableElement>; id: string }) {
    const sub = [show.p && 'Pax', 'Thals', show.g && 'Gents', show.l && 'Ladies', show.c && 'Children', show.i && 'Infants'].filter(Boolean) as string[];
    const sum = (get: (r: MealRow) => number) => stats.rows.reduce((a, r) => a + get(r), 0);
    const cells = (r: MealRow, k: 'B' | 'L' | 'D') => {
        const sp = r[k.toLowerCase() as 'b' | 'l' | 'd'], pax = k === 'B' ? r.bp : k === 'L' ? r.lp : r.dp, th = k === 'B' ? r.bt : k === 'L' ? r.lt : r.dt;
        return [show.p && pax, th, show.g && sp.g, show.l && sp.l, show.c && sp.c, show.i && sp.i].map((v, i) => v === false ? null : <td key={`${k}${i}`} className={cn('border px-2 py-1.5 text-center', MEAL[k], sub[[show.p, true, show.g, show.l, show.c, show.i].slice(0, i + 1).filter(Boolean).length - 1] === 'Thals' && 'font-bold')}>{v}</td>);
    };
    const foot = (k: 'B' | 'L' | 'D') => {
        const t = stats.totals, key = k.toLowerCase() as 'b' | 'l' | 'd';
        const vals = [show.p && (k === 'B' ? t.tBP : k === 'L' ? t.tLP : t.tDP), k === 'B' ? t.tBT : k === 'L' ? t.tLT : t.tDT, show.g && sum(r => r[key].g), show.l && sum(r => r[key].l), show.c && sum(r => r[key].c), show.i && sum(r => r[key].i)];
        return vals.map((v, i) => v === false ? null : <td key={`${k}${i}`} className={cn('border px-2 py-1.5 text-center font-bold', MEAL[k])}>{v}</td>);
    };
    return (
        <div className="overflow-x-auto"><table id={id} ref={tableRef} className="w-full text-sm">
            <thead>
                <tr className="bg-[#f3e6ca]"><th rowSpan={2} className="border px-2 py-1.5">Building</th>{(['B', 'L', 'D'] as const).map(k => <th key={k} colSpan={sub.length} className={cn('border px-2 py-1.5', MEAL[k])}>{MEAL_NAMES[k]}</th>)}</tr>
                <tr className="bg-[#f3e6ca]">{(['B', 'L', 'D'] as const).flatMap(k => sub.map(s => <th key={k + s} className={cn('border px-2 py-1.5 text-xs', MEAL[k])}>{s}</th>))}</tr>
            </thead>
            <tbody>{stats.rows.map(r => <tr key={r.building} style={{ color: colorOf(r.building) }}><td className="border px-2 py-1.5 text-left font-bold">{r.building}</td>{cells(r, 'B')}{cells(r, 'L')}{cells(r, 'D')}</tr>)}</tbody>
            <tfoot><tr className="bg-[#fbf2dc] font-bold"><td className="border px-2 py-1.5">Total</td>{foot('B')}{foot('L')}{foot('D')}</tr></tfoot>
        </table></div>
    );
}

export default function MawaidPage() {
    const { cloud } = useCore();
    const loadCore = useLoadCore();
    const { site, siteId } = useSite();
    const slips = useSlips(60_000);
    const [meals, setMeals] = useState<any>(null);
    useEffect(() => { void loadCore('meals').then(setMeals); }, []);   // eslint-disable-line react-hooks/exhaustive-deps
    void cloud;

    const now = new Date();
    const [date, setDate] = useState(`${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`);
    const [t, setT] = useState({ bS: '04:00', bE: '09:30', lS: '11:00', lE: '16:00', dS: '18:00', dE: '23:00' });
    const [thalSize, setThalSize] = useState('8');
    const [incA, setIncA] = useState(true), [incC, setIncC] = useState(siteId === 'medina'), [incI, setIncI] = useState(false);   // Medina counts children in the pax by default
    const [multL, setMultL] = useState('3'), [multD, setMultD] = useState('2.5');
    const [show, setShow] = useState<Show>({ p: false, g: false, l: false, c: false, i: false });
    const mainRef = useRef<HTMLTableElement>(null!), cookRef = useRef<HTMLTableElement>(null!), mandaRef = useRef<HTMLTableElement>(null!);
    const [status, setStatus] = useState('');

    type Res = { error: string } | { main: Stats; cook: Stats; manda: ReturnType<typeof buildManda> };
    const res = useMemo<Res | null>(() => {
        if (!meals || !slips.data) return null;
        const thal = Math.max(1, Number(thalSize) || 8);
        const ranges = { B: { start: t.bS || '04:00', end: t.bE || '09:30' }, L: { start: t.lS || '11:00', end: t.lE || '16:00' }, D: { start: t.dS || '18:00', end: t.dE || '23:00' } };
        const stats = meals.computeByBuilding(slips.data, date, ranges, thal, incA, incC, incI) as Stats | null;
        if (!stats) return { error: 'Check your start/end times; end must be after start for each meal.' };
        return { main: meals.buildFirstMerged(stats, thal) as Stats, cook: buildCooking(stats, thal), manda: buildManda(stats, Number(multL) || 3, Number(multD) || 2.5) };
    }, [meals, slips.data, date, t, thalSize, incA, incC, incI, multL, multD]);

    const exportCsv = () => {
        const table = mainRef.current; if (!table) return;
        const heads = ['Building', ...(['B', 'L', 'D'] as const).flatMap(k => [show.p && `${k}:Pax`, `${k}:Thals`, show.g && `${k}:Gents`, show.l && `${k}:Ladies`, show.c && `${k}:Children`, show.i && `${k}:Infants`].filter(Boolean))];
        const rows = [...table.querySelectorAll('tbody tr, tfoot tr')].map(tr => [...tr.children].map(td => (td.textContent || '').replace(/,/g, '')).join(','));
        const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([[heads.join(','), ...rows].join('\n')], { type: 'text/csv;charset=utf-8;' })); a.download = `mawaid_${date || 'date'}.csv`; a.click(); URL.revokeObjectURL(a.href);
    };
    async function copyImage(ref: React.RefObject<HTMLTableElement>, title: string, name: string) {
        if (!ref.current) { setStatus('Nothing to copy yet.'); return; }
        try {
            const lib = await loadCore('table-image');
            const how = await lib.copyTableImage(ref.current, `${title} · ${site.label}${date ? ' · ' + date.split('-').reverse().join('/') : ''}`, `${name}-${date}.png`);
            toast(how === 'copied' ? `${title} copied — paste it into the chat.` : 'This browser cannot copy pictures — the image was downloaded instead.');
        } catch (e: any) { setStatus('Could not make the image: ' + (e?.message || e)); }
    }
    const time = (k: keyof typeof t, label: string) => <div className="grid gap-1"><Label htmlFor={`t-${k}`}>{label}</Label><Input id={`t-${k}`} type="time" value={t[k]} onChange={e => setT(s => ({ ...s, [k]: e.target.value }))} /></div>;

    return (
        <div className="mx-auto grid grid-cols-[minmax(0,1fr)] max-w-[1300px] min-w-0 gap-3 px-3 pb-10 pt-4 sm:px-4">
            <header><h1 className="text-2xl font-bold text-primary">Mawaid Counts</h1><p className="text-sm text-muted-foreground">{site.label} · a guest counts for a meal when their stay overlaps the meal time. Thals = pax ÷ thal size, rounded up.</p></header>

            <Card className="print:hidden"><CardContent className="grid gap-4">
                <div className="grid grid-cols-2 items-end gap-3 sm:grid-cols-4 lg:grid-cols-6">
                    <div className="col-span-2 grid gap-1"><Label htmlFor="statDate">Select date</Label><Input id="statDate" type="date" value={date} onChange={e => setDate(e.target.value)} /></div>
                    {time('bS', 'Breakfast start')}{time('bE', 'Breakfast end')}{time('lS', 'Lunch start')}{time('lE', 'Lunch end')}{time('dS', 'Dinner start')}{time('dE', 'Dinner end')}
                    <div className="grid gap-1"><Label htmlFor="thalSize">Thal size</Label><Input id="thalSize" type="number" min={1} step={1} value={thalSize} onChange={e => setThalSize(e.target.value)} /></div>
                    <div className="grid gap-1"><Label htmlFor="multL">Manda: Lunch thal ×</Label><Input id="multL" type="number" step={0.1} value={multL} onChange={e => setMultL(e.target.value)} /></div>
                    <div className="grid gap-1"><Label htmlFor="multD">Manda: Dinner thal ×</Label><Input id="multD" type="number" step={0.1} value={multD} onChange={e => setMultD(e.target.value)} /></div>
                </div>
                <div className="flex flex-wrap gap-x-8 gap-y-3">
                    <div className="grid gap-1.5"><b className="text-sm">Include in Pax totals</b>
                        <div className="flex flex-wrap gap-4 text-sm">{([['Adults', incA, setIncA], ['Children', incC, setIncC], ['Infants', incI, setIncI]] as const).map(([l, v, set]) => <label key={l} className="flex items-center gap-2"><Checkbox checked={v} onCheckedChange={on => set(on === true)} />{l}</label>)}</div></div>
                    <div className="grid gap-1.5"><b className="text-sm">Show breakdown columns</b>
                        <div className="flex flex-wrap gap-4 text-sm">{([['p', 'Pax'], ['g', 'Gents'], ['l', 'Ladies'], ['c', 'Children'], ['i', 'Infants']] as const).map(([k, l]) => <label key={k} className="flex items-center gap-2"><Checkbox checked={show[k]} onCheckedChange={on => setShow(s => ({ ...s, [k]: on === true }))} />{l}</label>)}</div></div>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Button onClick={() => void slips.refetch().then(() => setStatus(`${slips.data?.length ?? 0} ${site.label} slip(s).`))}>Refresh data</Button>
                    <Button variant="outline" onClick={() => window.print()}><Printer className="size-4" />Print</Button>
                    <Button variant="outline" onClick={exportCsv}>Export CSV</Button>
                    <Button variant="outline" title="Put the table on the clipboard as a picture" onClick={() => void copyImage(mainRef, 'Mawaid counts', 'tbl')}><ImageDown className="size-4" />Copy image</Button>
                </div>
            </CardContent></Card>

            {!res && <p className="text-sm text-muted-foreground">Loading…</p>}
            {res && 'error' in res && <p role="alert" className="font-semibold text-destructive">{res.error}</p>}
            {res && 'main' in res && <>
                <Card className="gap-0 py-0"><CardContent className="p-0"><MealTable stats={res.main} show={show} tableRef={mainRef} id="tbl" /></CardContent></Card>

                <Card className="gap-0 py-0">
                    <CardHeader className="flex-row flex-wrap items-center justify-between border-b py-3"><CardTitle className="text-base">Cooking Count <span className="ml-1 text-xs font-normal text-muted-foreground">• HUSN+BAHA merged. Lunch &amp; Dinner also merge MUFADDAL+MOHAMMEDI.</span></CardTitle>
                        <Button size="sm" variant="outline" className="print:hidden" onClick={() => void copyImage(cookRef, 'Cooking count', 'tblCook')}>Copy image</Button></CardHeader>
                    <CardContent className="p-0"><MealTable stats={res.cook} show={show} tableRef={cookRef} id="tblCook" /></CardContent>
                </Card>

                <Card className="gap-0 py-0">
                    <CardHeader className="flex-row flex-wrap items-center justify-between border-b py-3"><CardTitle className="text-base">Manda Counts <span className="ml-1 text-xs font-normal text-muted-foreground">• Only Lunch &amp; Dinner thals. Multipliers applied.</span></CardTitle>
                        <Button size="sm" variant="outline" className="print:hidden" onClick={() => void copyImage(mandaRef, 'Manda counts', 'tblManda')}>Copy image</Button></CardHeader>
                    <CardContent className="overflow-x-auto p-0">
                        <table id="tblManda" ref={mandaRef} className="w-full text-sm">
                            <thead><tr className="bg-[#f3e6ca]"><th className="border px-2 py-1.5">Building</th><th className={cn('border px-2 py-1.5', MEAL.L)}>Lunch Thals×</th><th className={cn('border px-2 py-1.5', MEAL.D)}>Dinner Thals×</th><th className="border px-2 py-1.5">Total</th></tr></thead>
                            <tbody>{res.manda.rows.map(r => <tr key={r.building} style={{ color: colorOf(r.building) }}><td className="border px-2 py-1.5 text-left font-bold">{r.building}</td><td className={cn('border px-2 py-1.5 text-center font-bold', MEAL.L)}>{r.ltx}</td><td className={cn('border px-2 py-1.5 text-center font-bold', MEAL.D)}>{r.dtx}</td><td className="border px-2 py-1.5 text-center">{+(r.ltx + r.dtx).toFixed(2)}</td></tr>)}</tbody>
                            <tfoot><tr className="bg-[#fbf2dc] font-bold"><td className="border px-2 py-1.5">Total</td><td className={cn('border px-2 py-1.5 text-center', MEAL.L)}>{res.manda.totals.ltx}</td><td className={cn('border px-2 py-1.5 text-center', MEAL.D)}>{res.manda.totals.dtx}</td><td className="border px-2 py-1.5 text-center">{+(res.manda.totals.ltx + res.manda.totals.dtx).toFixed(2)}</td></tr></tfoot>
                        </table>
                    </CardContent>
                </Card>
            </>}
            <p className="text-xs text-muted-foreground print:hidden">{status}</p>
        </div>
    );
}
