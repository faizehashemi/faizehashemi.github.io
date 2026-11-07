import { useEffect, useMemo, useRef, useState } from 'react';
import { Download, Play } from 'lucide-react';
import { AllocLog } from '@/components/AllocLog';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCore, useDb, useGuard, useLoadApp, useLoadCore, usePmsCtx, useSite } from '@/pms/PmsContext';
import css from './forecast.css?raw';
import { vacancy, type Vacancy, type VacRow } from './vacancy';

// Forecast, in three tabs. Vacancy forecast: the user builds the question (from → to, which buildings), presses Run forecast and gets, per room, its beds,
// the most beds in use in that period and the beds still free — with an Excel download of exactly what is shown. Building planner and Day allocation are the
// framework-free windows of the old page (views/forecast/planner.js and allocate.js), kept mounted while hidden; the log of bulk changes sits under them.

type Row = Record<string, any>;
const pad = (n: number) => String(n).padStart(2, '0');
const local = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
const show = (ms: number) => new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(ms);
const FILTERS = [['all', 'All rooms'], ['space', 'With free beds'], ['vacant', 'Empty'], ['full', 'Full']] as const;
type Filter = typeof FILTERS[number][0];
const keep = (f: Filter) => (r: VacRow) => f === 'all' || (f === 'vacant' ? r.used === 0 : f === 'full' ? r.free === 0 : (r.free ?? 0) > 0);

function VacancyTab() {
    const { stay, rooms } = useCore();
    const R = rooms as any, S = stay as any;
    const db = useDb();
    const guard = useGuard();
    const loadCore = useLoadCore();
    const { siteId } = useSite();
    const now = new Date();
    const [from, setFrom] = useState(local(now)), [to, setTo] = useState(local(new Date(+now + 24 * 3600e3)));
    const [blds, setBlds] = useState<Row[]>([]), [slips, setSlips] = useState<Row[] | null>(null), [picked, setPicked] = useState<string[]>([]);
    const [res, setRes] = useState<(Vacancy & { from: number; to: number; buildings: string[] }) | null>(null);
    const [filter, setFilter] = useState<Filter>('all'), [msg, setMsg] = useState(''), [busy, setBusy] = useState(false);

    useEffect(() => {
        void (async () => {
            try { const [b, s] = await Promise.all([guard<Row[]>(R.loadBuildings()), db.all() as Promise<Row[]>]); setBlds(b); setSlips(s); }
            catch (e) { console.error(e); setMsg('Could not read the slips in this browser. Open the slip page once, then come back.'); }
        })();
    }, []);   // eslint-disable-line react-hooks/exhaustive-deps
    const options = useMemo(() => {
        const set = R.buildingNames(blds, siteId) as string[];
        return set.length ? set : [...new Set((slips || []).map(s => String(s.building || '').trim().toUpperCase()).filter(Boolean))].sort();
    }, [blds, slips, siteId]);   // eslint-disable-line react-hooks/exhaustive-deps

    const f = Date.parse(from), t = Date.parse(to);
    const problem = !(f > 0) || !(t > 0) ? 'Choose both dates and times.' : t <= f ? '"To" must be after "From".' : !picked.length ? 'Pick at least one building.' : !slips ? 'Loading the slips…' : '';
    const run = () => {
        if (problem) return;
        setBusy(true);
        setTimeout(() => {   // let the button show "Working…" first
            try { setRes({ ...vacancy({ slips: slips!, buildings: picked, from: f, to: t, libs: { rowsOf: S.rowsOf, normB: S.normB, activeRooms: (b: string) => R.activeRooms(blds, b, t) } }), from: f, to: t, buildings: picked }); setFilter('all'); setMsg(''); }
            catch (e: any) { setMsg('The forecast failed: ' + (e?.message || e)); }
            finally { setBusy(false); }
        }, 0);
    };
    const shown = res ? res.rows.filter(keep(filter)) : [];
    const many = (res?.buildings.length ?? 0) > 1;
    async function excel() {
        if (!res) return;
        const lib = await loadCore('lib');
        await lib.loadScript(lib.LIBS.xlsx);
        const X = (window as any).XLSX, wb = X.utils.book_new();
        X.utils.book_append_sheet(wb, X.utils.aoa_to_sheet([
            ['Vacancy forecast'], ['From', show(res.from)], ['To', show(res.to)], ['Buildings', res.buildings.join(', ')], ['Showing', FILTERS.find(x => x[0] === filter)![1]], [],
            ['Rooms', res.rooms], ['Empty rooms', res.vacant], ['Rooms with some beds free', res.withSpace], ['Full rooms', res.full], ['Free beds', res.freeBeds],
        ]), 'Summary');
        X.utils.book_append_sheet(wb, X.utils.json_to_sheet(shown.map(r => ({ Building: r.building, Room: r.room, Beds: r.capacity ?? '', 'Beds in use (most)': r.used, 'Free beds': r.free ?? '', Groups: r.groups }))), 'Rooms');
        X.writeFile(wb, `Vacancy ${from.slice(0, 10)} to ${to.slice(0, 10)}.xlsx`);
    }

    return (
        <div className="grid gap-4">
            <section className="grid gap-4 rounded-xl border bg-card p-4">
                <div className="flex flex-wrap items-end gap-4">
                    <div className="grid gap-1.5"><Label htmlFor="vf-from">From</Label><Input id="vf-from" type="datetime-local" value={from} onChange={e => setFrom(e.target.value)} className="w-56" /></div>
                    <div className="grid gap-1.5"><Label htmlFor="vf-to">To</Label><Input id="vf-to" type="datetime-local" value={to} min={from} onChange={e => setTo(e.target.value)} className="w-56" /></div>
                </div>
                <div className="grid gap-2">
                    <div className="flex items-center gap-3"><span className="text-sm font-medium">Buildings</span>
                        <button type="button" className="text-xs text-primary underline" onClick={() => setPicked(options)}>All</button>
                        <button type="button" className="text-xs text-primary underline" onClick={() => setPicked([])}>None</button></div>
                    <div className="flex flex-wrap gap-2">
                        {options.map(b => (
                            <Label key={b} className={`cursor-pointer gap-2 rounded-lg border px-3 py-2 ${picked.includes(b) ? 'border-primary bg-primary/10' : ''}`}>
                                <Checkbox checked={picked.includes(b)} onCheckedChange={v => setPicked(p => (v === true ? [...p, b] : p.filter(x => x !== b)))} />{b}
                            </Label>
                        ))}
                        {!options.length && <span className="text-sm text-muted-foreground">{slips ? 'No buildings set up for this site.' : 'Loading…'}</span>}
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <Button size="lg" onClick={run} disabled={!!problem || busy} className="shadow-md ring-2 ring-primary/30"><Play className="size-4" />{busy ? 'Working…' : 'Run forecast'}</Button>
                    {problem && <span className="text-sm text-muted-foreground">{problem}</span>}
                </div>
                {msg && <p className="text-sm text-destructive">{msg}</p>}
            </section>

            {res && (
                <section className="grid gap-3 rounded-xl border bg-card p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                        <div><h2 className="text-lg font-bold">{show(res.from)} → {show(res.to)}</h2><p className="text-sm text-muted-foreground">{res.buildings.join(', ')}</p></div>
                        <Button variant="outline" onClick={() => void excel()} disabled={!shown.length}><Download className="size-4" />Download Excel</Button>
                    </div>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                        {[['Free beds', res.freeBeds, 'text-emerald-700'], ['Rooms', res.rooms, ''], ['Empty rooms', res.vacant, ''], ['Rooms with some beds free', res.withSpace, ''], ['Full rooms', res.full, '']].map(([l, v, c]) => (
                            <div key={l as string} className="rounded-lg border p-3"><div className={`text-2xl font-bold ${c}`}>{v}</div><div className="text-xs text-muted-foreground">{l}</div></div>
                        ))}
                    </div>
                    <p className="text-xs text-muted-foreground">Free beds = beds still free for the whole period (beds minus the most in use at any one time). An Exclusive room counts as full.</p>
                    <div className="flex flex-wrap gap-1.5">
                        {FILTERS.map(([k, l]) => <Button key={k} size="sm" variant={filter === k ? 'default' : 'outline'} onClick={() => setFilter(k)}>{l} ({res.rows.filter(keep(k)).length})</Button>)}
                    </div>
                    <div className="max-h-[65vh] overflow-auto rounded-lg border">
                        <table className="w-full text-sm">
                            <thead className="sticky top-0 bg-muted text-left"><tr>
                                {many && <th className="p-2">Building</th>}<th className="p-2">Room</th><th className="p-2 text-right">Beds</th><th className="p-2 text-right">In use (most)</th><th className="p-2 text-right">Free beds</th><th className="p-2">Groups in the period</th>
                            </tr></thead>
                            <tbody>
                                {shown.map(r => (
                                    <tr key={r.building + r.room} className="border-t">
                                        {many && <td className="p-2">{r.building}</td>}<td className="p-2 font-medium">{r.room}</td><td className="p-2 text-right">{r.capacity ?? '?'}</td><td className="p-2 text-right">{r.used || ''}</td>
                                        <td className={`p-2 text-right font-bold ${r.free ? 'text-emerald-700' : 'text-muted-foreground'}`}>{r.free ?? '?'}</td><td className="p-2 text-xs text-muted-foreground">{r.groups}</td>
                                    </tr>
                                ))}
                                {!shown.length && <tr><td colSpan={6} className="p-6 text-center text-muted-foreground">No rooms here.</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </section>
            )}
        </div>
    );
}

export default function ForecastPage() {
    const ctx = usePmsCtx();
    const loadApp = useLoadApp();
    const plRef = useRef<HTMLElement>(null), alRef = useRef<HTMLElement>(null);
    const [tab, setTab] = useState('vacancy');
    useEffect(() => {
        let alive = true;
        void (async () => {
            const [pl, al] = await Promise.all([loadApp('views/forecast/planner.js'), loadApp('views/forecast/allocate.js')]);
            if (!alive || !plRef.current || !alRef.current) return;
            const planner = pl.mountPlanner({ ctx, host: plRef.current });
            al.mountAllocator({ ctx, host: alRef.current, planner });
        })();
        return () => { alive = false; };
    }, []);   // eslint-disable-line react-hooks/exhaustive-deps
    const TABS: [string, string][] = [['vacancy', 'Vacancy forecast'], ['planner', 'Building planner'], ['allocator', 'Day allocation']];
    return (
        <div className="mx-auto grid grid-cols-[minmax(0,1fr)] max-w-[2400px] min-w-0 gap-3 px-3 pb-10 pt-4 sm:px-4">
            <style>{`.fc-legacy {\n${css}\n}`}</style>
            <PageHeader view="forecast" title="Forecast" current={TABS.find(t => t[0] === tab)?.[1]} />
            <Tabs value={tab} onValueChange={setTab}>
                <TabsList variant="underline">{TABS.map(([k, l]) => <TabsTrigger key={k} value={k}>{l}</TabsTrigger>)}</TabsList>
                <TabsContent value="vacancy" forceMount className="data-[state=inactive]:hidden"><VacancyTab /></TabsContent>
                {/* all kept mounted while hidden (the results stay when switching tabs); the planner and allocator are drawn once into these hosts and the allocator talks to the planner */}
                <TabsContent value="planner" forceMount className="fc-legacy data-[state=inactive]:hidden"><section ref={plRef} className="wrap pl" id="planner" /></TabsContent>
                <TabsContent value="allocator" forceMount className="fc-legacy data-[state=inactive]:hidden">
                    <section ref={alRef} className="wrap pl al" id="allocator" />
                    <section className="wrap pl lg" id="alloclog"><AllocLog /></section>
                </TabsContent>
            </Tabs>
        </div>
    );
}
