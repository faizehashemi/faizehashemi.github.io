import { useEffect, useMemo, useRef, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSlips } from '@/hooks/useSlips';
import { useConfirm } from '@/components/ConfirmDialog';
import { useCore, useGuard, useParams, useSite } from '@/pms/PmsContext';
import { useQuery } from '@tanstack/react-query';
import { TimelineChart, type Ev } from './chart';

// Room Timeline (Rooms): who is in one room, over time — pick a building and a room, a period and a granularity, press Enter. Each row is an SH, each bar a stay
// of this room (a delayed group's rooms leave on their own dates, an Exclusive row keeps the whole room). Drag to pan, wheel / pinch to zoom, double-click for now.
// Can be opened from a link (building, room, from, to): that room is drawn at once.

const pad = (n: number) => String(n).padStart(2, '0');
const toLocalDT = (d: Date) => { const z = new Date(d.getTime() - d.getTimezoneOffset() * 60000); return z.toISOString().slice(0, 16); };
const natural = (a: string, b: string) => a.localeCompare(b, undefined, { numeric: true });
void pad;

export default function TimelinePage() {
    const { rooms: roomsLib, stay } = useCore();
    const guard = useGuard();
    const params = useParams();
    const { siteId } = useSite();
    const { ask, dialog } = useConfirm();
    const slips = useSlips(120_000);
    const builders = useQuery({ queryKey: ['buildings', siteId], queryFn: async () => roomsLib.buildingsOfSite(await guard(roomsLib.loadBuildings()), siteId) });

    const stageRef = useRef<HTMLDivElement>(null), canvasRef = useRef<HTMLCanvasElement>(null);
    const chart = useRef<TimelineChart | null>(null);
    const [tip, setTip] = useState<{ html: string; x: number; y: number } | null>(null);
    const [info, setInfo] = useState({ zoom: 'Zoom 100%', range: '—' });
    const [drawn, setDrawn] = useState(false);
    const [error, setError] = useState('');

    const now = new Date(), s0 = new Date(+now - 24 * 3600e3); s0.setMinutes(0, 0, 0); now.setMinutes(0, 0, 0);
    const [building, setBuilding] = useState(params.get('building') || ''), [room, setRoom] = useState(params.get('room') || '');
    const [start, setStart] = useState(params.get('from') || toLocalDT(s0)), [end, setEnd] = useState(params.get('to') || toLocalDT(now));
    const [gran, setGran] = useState('1');

    // buildings and their rooms: from the slips (an Exclusive row may sit in another building) plus every room set up in Rooms & Buildings
    const byB = useMemo(() => {
        const m = new Map<string, Set<string>>();
        for (const r of slips.data ?? []) {
            const eat = (arr?: any[]) => arr?.forEach(x => { const b = String(x.building || r.building || '').trim(); if (!b) return; const rm = String(x.room_no || '').trim(); if (!m.has(b)) m.set(b, new Set()); if (rm) m.get(b)!.add(rm); });
            eat(r.rooms?.gents); eat(r.rooms?.ladies);
            const b0 = (r.building || '').trim(); if (b0 && !m.has(b0)) m.set(b0, new Set());
        }
        for (const b of builders.data ?? []) { if (!m.has(b.name)) m.set(b.name, new Set()); b.rooms.forEach((r: any) => m.get(b.name)!.add(String(r.room_no).trim())); }
        return m;
    }, [slips.data, builders.data]);
    const buildingNames = [...byB.keys()].sort();
    const roomNames = building && byB.has(building) ? [...byB.get(building)!].sort(natural) : [];

    useEffect(() => {
        if (!canvasRef.current || !stageRef.current) return;
        const c = new TimelineChart(canvasRef.current, stageRef.current);
        c.onInfo = (zoom, range) => setInfo({ zoom, range });
        c.onTip = (html, x, y) => setTip(html ? { html, x, y } : null);
        chart.current = c;
        return () => { c.destroy(); chart.current = null; };
    }, []);
    useEffect(() => { chart.current?.setGranularity(Number(gran)); }, [gran]);

    async function enter() {
        const bld = building.trim(), rm = room.trim();
        if (!bld || !rm) { await ask({ title: 'Missing', confirmLabel: 'OK', body: 'Pick a building and enter a room.' }); return; }
        if (!start || !end) { await ask({ title: 'Missing', confirmLabel: 'OK', body: 'Select a start and end date/time.' }); return; }
        const c = chart.current!;
        c.setGranularity(Number(gran));
        const vs = c.qFloor(new Date(start)), ve = c.qCeil(new Date(end));
        if (!(+vs < +ve)) { await ask({ title: 'Check the dates', confirmLabel: 'OK', body: 'Start must be before End.' }); return; }
        const all: Record<string, any>[] = slips.data ?? [];
        const out: Ev[] = [];
        for (const r of all.filter(r => stay.slipTouches(r, bld))) {
            // each room row's own window (a delayed departure gives rows their own check-out — core/stay.js)
            for (const w of stay.rowsOf(r) as any[]) {
                const assigned = Number(w.row.assigned || 0);
                if (stay.normB(w.building) !== stay.normB(bld)) continue;
                if (w.room_no === rm && assigned > 0 && w.start && w.end && w.end > w.start) out.push({ sh_no: r.sh_no, start: new Date(w.start), end: new Date(w.end), assigned, block: w.block, excl: w.exclusive });
            }
        }
        setError(''); setDrawn(true);
        requestAnimationFrame(() => c.show(out, new Date(start), new Date(end)));
    }
    // opened from a link: that room, those dates, drawn at once (once the slips are there)
    const auto = useRef(false);
    useEffect(() => { if (!auto.current && slips.data && builders.data && params.get('building') && params.get('room')) { auto.current = true; void enter(); } }, [slips.data, builders.data]);   // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <div className="mx-auto grid grid-cols-[minmax(0,1fr)] max-w-[2400px] min-w-0 gap-3 px-3 pb-10 pt-4 sm:px-4">
            <div className="flex flex-wrap items-end gap-3">
                <div className="grid gap-1"><Label htmlFor="building">Building</Label>
                    <Select value={building} onValueChange={v => { setBuilding(v); setRoom(''); }}><SelectTrigger id="building" className="min-w-48"><SelectValue placeholder="Select building…" /></SelectTrigger>
                        <SelectContent>{buildingNames.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent></Select></div>
                <div className="grid gap-1"><Label htmlFor="room">Room</Label><Input id="room" list="roomsList" placeholder="e.g. 505" className="w-32" value={room} onChange={e => setRoom(e.target.value)} /><datalist id="roomsList">{roomNames.map(r => <option key={r} value={r} />)}</datalist></div>
                <div className="grid gap-1"><Label htmlFor="start">Start</Label><Input id="start" type="datetime-local" value={start} onChange={e => setStart(e.target.value)} /></div>
                <div className="grid gap-1"><Label htmlFor="end">End</Label><Input id="end" type="datetime-local" value={end} onChange={e => setEnd(e.target.value)} /></div>
                <div className="grid gap-1"><Label htmlFor="gran">Granularity</Label>
                    <Select value={gran} onValueChange={setGran}><SelectTrigger id="gran" className="w-24"><SelectValue /></SelectTrigger><SelectContent>{['1', '2', '3', '6', '12', '24'].map(g => <SelectItem key={g} value={g}>{g}h</SelectItem>)}</SelectContent></Select></div>
                <Button onClick={() => void enter()}>Enter</Button>
                <Button variant="outline" disabled={!drawn} title="Center on now" onClick={() => chart.current?.centerOnNow()}>Now</Button>
                {drawn && <div className="ml-auto flex flex-wrap gap-2"><Badge variant="secondary">{info.range}</Badge><Badge variant="secondary">{info.zoom}</Badge></div>}
            </div>

            <Card className="relative h-[70vh] min-h-96 overflow-hidden p-0">
                <div ref={stageRef} className="absolute inset-0">
                    {!drawn && <div className="grid h-full place-items-center p-6 text-center text-muted-foreground">Fill the toolbar, then click <b className="mx-1">Enter</b>. Nothing draws until you do.</div>}
                    <canvas ref={canvasRef} className={drawn ? 'block touch-none' : 'hidden'} />
                    {drawn && <div className="pointer-events-none absolute right-3 top-14 rounded-lg border bg-card/90 px-2.5 py-1.5 text-xs text-muted-foreground">Filled = occupied<br />Empty = vacant</div>}
                </div>
            </Card>
            {tip && <div className="pointer-events-none fixed z-50 rounded-lg border bg-popover px-3 py-2 text-xs shadow-lg" style={{ left: tip.x, top: tip.y }} dangerouslySetInnerHTML={{ __html: tip.html }} />}
            {error && <p className="text-sm text-destructive">{error}</p>}
            {slips.isError && <p className="text-sm text-destructive">DB error: could not load the slips.</p>}
            {dialog}
        </div>
    );
}
