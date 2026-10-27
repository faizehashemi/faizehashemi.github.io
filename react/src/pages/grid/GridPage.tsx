import { useMemo, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Minus, Plus, Printer, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { useSlips } from '@/hooks/useSlips';
import { useCore, useGuard, useLoadApp, useSite } from '@/pms/PmsContext';
import { buildMatrix } from './grid';
import './grid.css';

// Grid (Rooms): one building as floors × columns at a chosen date and time — beds used / beds, the SH in the room and when the first one leaves (or
// "Vacant • Next …"). Under-assigned rooms are amber, a room in use that is not active in Rooms & Buildings has a dashed red outline. Size controls
// (width, height, text) and Print… (PDF in a new tab or Excel; views/grid/export.js reads the matrix on the page).

const pad = (n: number) => String(n).padStart(2, '0');
const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));

function Size({ label, value, onChange, min, max, step, d, lo, hi }: { label: string; value: number; onChange: (v: number) => void; min: number; max: number; step: number; d: number; lo: number; hi: number }) {
    return (
        <div className="flex items-center gap-1.5" title={label}>
            <span className="text-xs text-muted-foreground">{label}</span>
            <Button variant="outline" size="icon" className="size-8" aria-label={`${label} smaller`} onClick={() => onChange(clamp(value - d, lo, hi))}><Minus className="size-4" /></Button>
            <Slider className="w-24" min={min} max={max} step={step} value={[value]} onValueChange={v => onChange(v[0])} aria-label={label} />
            <Button variant="outline" size="icon" className="size-8" aria-label={`${label} larger`} onClick={() => onChange(clamp(value + d, lo, hi))}><Plus className="size-4" /></Button>
        </div>
    );
}

export default function GridPage() {
    const { rooms: roomsLib, stay } = useCore();
    const guard = useGuard();
    const loadApp = useLoadApp();
    const { site, siteId } = useSite();
    const n = new Date();
    const [date, setDate] = useState(`${n.getFullYear()}-${pad(n.getMonth() + 1)}-${pad(n.getDate())}`), [time, setTime] = useState(`${pad(n.getHours())}:${pad(n.getMinutes())}`);
    const [applied, setApplied] = useState({ date, time });
    const [tab, setTab] = useState('');
    const [w, setW] = useState(65), [h, setH] = useState(35), [f, setF] = useState(10);
    const mx = useRef<HTMLDivElement>(null);
    const slips = useSlips(60_000);
    const builders = useQuery({ queryKey: ['buildings-force', siteId], queryFn: async () => await guard(roomsLib.loadBuildings({ force: true })) as any[] });   // latest Rooms & Buildings edits

    const buildings = useMemo(() => {
        const fromBuilder = roomsLib.buildingsOfSite(builders.data ?? [], siteId).filter((b: any) => b.rooms.length).map((b: any) => b.name as string);
        const fromSlips = (slips.data ?? []).map(r => (r.building || '').trim()).filter(Boolean);
        return [...new Set([...fromBuilder, ...fromSlips])];
    }, [builders.data, slips.data, siteId, roomsLib]);
    const current = tab && buildings.includes(tab) ? tab : buildings[0] || '';
    const when = new Date(`${applied.date}T${applied.time}`);
    const M = useMemo(() => slips.data && builders.data && current && !isNaN(+when) ? buildMatrix(slips.data, builders.data, current, when, stay, roomsLib) : null, [slips.data, builders.data, current, applied, stay, roomsLib]);   // eslint-disable-line react-hooks/exhaustive-deps

    async function print() {
        if (!mx.current) return;
        const mod = await loadApp('views/grid/export.js');
        mod.printGrid(mx.current, { building: current, date: applied.date, time: applied.time, site: site.label });
    }

    return (
        <div className="mx-auto grid grid-cols-[minmax(0,1fr)] max-w-[1800px] min-w-0 gap-3 px-3 pb-10 pt-4 sm:px-4">
            <div className="flex flex-wrap items-end gap-3">
                <div className="grid gap-1"><Label htmlFor="asof_date">Date</Label><Input id="asof_date" type="date" value={date} onChange={e => { setDate(e.target.value); if (e.target.value && time) setApplied({ date: e.target.value, time }); }} /></div>
                <div className="grid gap-1"><Label htmlFor="asof_time">Time</Label><Input id="asof_time" type="time" step={60} value={time} onChange={e => { setTime(e.target.value); if (date && e.target.value) setApplied({ date, time: e.target.value }); }} /></div>
                <Button onClick={() => { if (!date || !time) { alert('Choose date and time'); return; } setApplied({ date, time }); }}>Recalculate</Button>
                <Button variant="outline" onClick={() => { void slips.refetch(); void builders.refetch(); }}><RefreshCw className={cn('size-4', slips.isFetching && 'animate-spin')} />Refresh DB</Button>
                <Button variant="outline" onClick={() => void print()}><Printer className="size-4" />Print…</Button>
                <div className="ml-auto flex flex-wrap items-center gap-4">
                    <Size label="Width" value={w} onChange={setW} min={1} max={240} step={2} d={8} lo={80} hi={240} />
                    <Size label="Height" value={h} onChange={setH} min={1} max={200} step={2} d={8} lo={60} hi={200} />
                    <Size label="Text" value={f} onChange={setF} min={1} max={20} step={1} d={1} lo={9} hi={20} />
                </div>
            </div>

            <div role="tablist" className="flex flex-wrap gap-1.5 rounded-xl border bg-card p-2">
                {buildings.map(b => <button key={b} role="tab" aria-selected={b === current} onClick={() => setTab(b)} className={cn('rounded-full border bg-[#fffdf5] px-3 py-1.5 text-sm hover:bg-accent', b === current && 'border-gold bg-accent font-bold')}>{b}</button>)}
            </div>

            <div className="overflow-hidden rounded-xl border bg-card">
                <div className="gridp max-h-[75vh] overflow-auto" style={{ ['--cellW' as any]: `${clamp(w, 80, 240)}px`, ['--cellH' as any]: `${clamp(h, 60, 200)}px`, ['--fs' as any]: `${clamp(f, 9, 20)}px` }}>
                    {!M ? <p className="p-3 text-sm text-muted-foreground">Loading DB…</p> : !M.flist.length ? <p className="p-3">No rooms found for this building.</p> : (
                        <div ref={mx} id="matrix" className="matrix" style={{ gridTemplateColumns: `repeat(${M.clist.length + 1}, max-content)` }}>
                            <div className="hcell corner">{M.building}</div>
                            {M.clist.map(c => <div key={c} className="hcell">{c}</div>)}
                            {M.flist.flatMap(floor => [
                                <div key={`f-${floor}`} className="rcell">{`FLOOR ${floor}`}</div>,
                                ...M.clist.map(col => {
                                    const c = M.cells.get(`${floor}|${col}`)!;
                                    if (c.kind === 'none') return <div key={`${floor}|${col}`} className="cell"><div className="cap">—</div><div className="meta">&nbsp;</div></div>;
                                    if (c.kind === 'vacant') return <div key={`${floor}|${col}`} className="cell"><div className="cap">{c.cap}</div><div className="meta">{c.meta}</div></div>;
                                    return <div key={`${floor}|${col}`} className={cn('cell occ', c.under && 'under', c.off && 'off-list')} title={c.off ? `Room ${c.room} is not an active room in Rooms & Buildings` : undefined}><div className="cap">{c.cap}</div><div className="meta">{c.meta}</div></div>;
                                }),
                            ])}
                        </div>
                    )}
                </div>
                <div className="border-t bg-card px-3 py-1.5 text-xs text-muted-foreground">{M ? `${M.building} • Floors ${M.flist.join(', ')} • ${M.clist.length} columns • ${M.slipCount} slip(s)${M.offCount ? ` • ${M.offCount} room(s) in use but not active in Rooms & Buildings (dashed)` : ''}` : 'Loading DB…'}</div>
            </div>
        </div>
    );
}
