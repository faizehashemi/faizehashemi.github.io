import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSlips } from '@/hooks/useSlips';
import { useCore, useGuard, useNav, useParams, useSite } from '@/pms/PmsContext';
import { buildGrid, splitText, stayLabel, type Stay } from './timeline';

// Room Timeline (Rooms): who is in which room over time, as a grid — one row per room of the building (more rows when groups share a room at the same
// time), one column per time cell. A stay is one coloured block naming the tour operator, the group leader and that group's pax in the room (pax here /
// the whole group); 🔒 = an Exclusive room. Times are exact: when a check-out and a check-in fall in the same cell, that room's cells are split into
// finer pieces (fine lines) so the two never look double-booked. Hover a block for the details, click it to open the slip. Optional floor / room filter.
// Can be opened from a link (building, room, from, to).

const toLocalDT = (d: Date) => { const z = new Date(d.getTime() - d.getTimezoneOffset() * 60000); return z.toISOString().slice(0, 16); };
const parseIn = (v: string | null) => (v ? (v.length === 10 ? `${v}T00:00` : v.slice(0, 16)) : '');
const STEPS: { h: number; label: string; w: number }[] = [{ h: 24, label: 'Day', w: 96 }, { h: 12, label: '12 h', w: 60 }, { h: 6, label: '6 h', w: 44 }, { h: 3, label: '3 h', w: 36 }, { h: 1, label: '1 h', w: 30 }];
const dayKey = (t: number) => { const d = new Date(t); return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`; };
const dayText = (t: number) => new Date(t).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' });
const hourText = (t: number) => new Date(t).toLocaleTimeString(undefined, { hour: 'numeric' });
const when = (t: number) => new Date(t).toLocaleString(undefined, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

export default function TimelinePage() {
    const { rooms: roomsLib, stay } = useCore();
    const R = roomsLib as any, S = stay as any;
    const guard = useGuard(), params = useParams(), { navigate } = useNav();
    const { siteId } = useSite();
    const slips = useSlips(120_000);
    const builders = useQuery({ queryKey: ['buildings', siteId], queryFn: async () => R.buildingsOfSite(await guard(R.loadBuildings()), siteId) as any[] });

    const today = new Date(); today.setHours(0, 0, 0, 0);
    const [building, setBuilding] = useState(params.get('building') || '');
    const [room, setRoom] = useState(params.get('room') || ''), [floor, setFloor] = useState('all');
    const [start, setStart] = useState(parseIn(params.get('from')) || toLocalDT(new Date(+today - 864e5)));
    const [end, setEnd] = useState(parseIn(params.get('to')) || toLocalDT(new Date(+today + 13 * 864e5)));
    const [step, setStep] = useState(params.get('from') && params.get('to') && (Date.parse(params.get('to')!) - Date.parse(params.get('from')!)) < 4 * 864e5 ? '3' : '24');
    const [onlyBusy, setOnlyBusy] = useState(false);
    // drag to pan: hold the left mouse button anywhere on the table and move (a hand pointer shows it); a drag is not a click, so it never opens a slip
    const scroller = useRef<HTMLDivElement>(null), drag = useRef<{ x: number; y: number; left: number; top: number; moved: boolean } | null>(null), swallowClick = useRef(false);
    const [dragging, setDragging] = useState(false);
    const onDown = (e: React.PointerEvent) => {
        if (e.pointerType !== 'mouse' || e.button !== 0 || !scroller.current) return;   // fingers scroll the page as usual
        drag.current = { x: e.clientX, y: e.clientY, left: scroller.current.scrollLeft, top: scroller.current.scrollTop, moved: false };
    };
    const onMove = (e: React.PointerEvent) => {
        const d = drag.current, el = scroller.current;
        if (!d || !el) return;
        const dx = e.clientX - d.x, dy = e.clientY - d.y;
        if (!d.moved && Math.abs(dx) + Math.abs(dy) < 5) return;
        if (!d.moved) { d.moved = true; setDragging(true); el.setPointerCapture?.(e.pointerId); }
        el.scrollLeft = d.left - dx; el.scrollTop = d.top - dy;
    };
    const onUp = (e: React.PointerEvent) => {
        if (drag.current?.moved) { swallowClick.current = true; setTimeout(() => { swallowClick.current = false; }, 0); scroller.current?.releasePointerCapture?.(e.pointerId); }
        drag.current = null; setDragging(false);
    };

    // buildings: Rooms & Buildings, plus any building a slip names
    const buildingNames = useMemo(() => {
        const set = new Set<string>((builders.data ?? []).map(b => b.name));
        for (const s of slips.data ?? []) if (s.building) set.add(String(s.building).trim());
        return [...set].filter(Boolean).sort();
    }, [builders.data, slips.data]);
    useEffect(() => { if (!building && buildingNames.length) setBuilding(buildingNames[0]); }, [buildingNames]);   // eslint-disable-line react-hooks/exhaustive-deps
    const setUp = (builders.data ?? []).find(b => String(b.name).toUpperCase() === building.toUpperCase())?.rooms ?? [];
    const floors = useMemo(() => [...new Set(setUp.map((r: any) => String(R.floorOf(String(r.room_no)) ?? '')).filter(Boolean))].sort((a: any, b: any) => String(a).localeCompare(String(b), undefined, { numeric: true })) as string[], [setUp]);   // eslint-disable-line react-hooks/exhaustive-deps

    const st = STEPS.find(x => String(x.h) === step) ?? STEPS[0];
    const from = Date.parse(start), to = Date.parse(end);
    const grid = useMemo(() => (building && from < to ? buildGrid({
        slips: slips.data ?? [], building, roomsSetUp: setUp.map((r: any) => ({ room_no: String(r.room_no), capacity: Number(r.capacity) || null })),
        from, to, stepH: st.h, room, floor: floor === 'all' ? '' : floor, libs: { rowsOf: S.rowsOf, normB: S.normB, floorOf: R.floorOf },
    }) : null), [slips.data, building, setUp, from, to, st.h, room, floor]);   // eslint-disable-line react-hooks/exhaustive-deps
    const rooms = (grid?.rooms ?? []).filter(r => !onlyBusy || r.lanes.length);
    const cells = grid?.cells ?? [];
    const nowX = cells.length && grid && Date.now() >= from && Date.now() < from + cells.length * grid.step ? ((Date.now() - from) / grid.step) * st.w : null;
    // the date header: one cell per day spanning its time cells (with 24 h cells the day itself is the cell)
    const days: { key: string; t: number; span: number }[] = [];
    for (const t of cells) { const k = dayKey(t), last = days[days.length - 1]; if (last && last.key === k) last.span++; else days.push({ key: k, t, span: 1 }); }
    const shift = (n: number) => { const ms = n * 864e5; setStart(toLocalDT(new Date(from + ms))); setEnd(toLocalDT(new Date(to + ms))); };
    const tip = (s: Stay) => `SH ${s.sh} — ${s.tour}${s.gl ? `\nGroup leader: ${s.gl}` : ''}\nIn this room: ${s.pax} pax (${s.sides === 'GL' ? 'gents + ladies' : s.sides === 'L' ? 'ladies' : 'gents'})${s.groupPax ? ` · whole group ${s.groupPax}` : ''}\n${when(s.start)} → ${when(s.end)}${s.excl ? '\n🔒 Exclusive — the whole room is kept for them' : ''}\nClick to open the slip`;

    return (
        <div className="mx-auto grid grid-cols-[minmax(0,1fr)] max-w-[2400px] min-w-0 gap-3 px-3 pb-10 pt-4 sm:px-4">
            <style>{`
                .tl-scroll { overflow-x: scroll; overflow-y: auto; cursor: grab; scrollbar-width: auto; scrollbar-color: #b9975a #f3e8d2; }
                .tl-scroll.dragging, .tl-scroll.dragging .blk { cursor: grabbing; user-select: none; }
                .tl-scroll::-webkit-scrollbar { height: 14px; width: 12px; } .tl-scroll::-webkit-scrollbar-track { background: #f3e8d2; }
                .tl-scroll::-webkit-scrollbar-thumb { background: #b9975a; border-radius: 8px; border: 3px solid #f3e8d2; } .tl-scroll::-webkit-scrollbar-thumb:hover { background: #9a7414; }
                .tlg { border-collapse: separate; border-spacing: 0; table-layout: fixed; font-size: 12px; }
                .tlg th, .tlg td { border-right: 1px solid var(--border, #e6d8bd); border-bottom: 1px solid var(--border, #e6d8bd); height: 30px; padding: 0; }
                .tlg thead th { position: sticky; z-index: 3; background: #f6ecd6; font-weight: 700; text-align: center; white-space: nowrap; }
                .tlg thead tr:first-child th { top: 0; } .tlg thead tr:nth-child(2) th { top: 30px; font-weight: 500; font-size: 11px; }
                .tlg .rm { position: sticky; left: 0; z-index: 2; background: #fffaf0; text-align: left; padding: 0 8px; min-width: 128px; width: 128px; }
                .tlg thead .rm { z-index: 4; background: #f3e4c4; }
                .tlg .rm b { font-size: 14px; } .tlg .rm small { display: block; color: #8a7652; font-size: 10.5px; line-height: 1.15; }
                .tlg .rm small.full { color: #b3261e; font-weight: 700; }
                .tlg tbody tr.first td, .tlg tbody tr.first th { border-top: 2px solid #d9c49c; }
                .tlg td.lane { position: relative; }
                .tlg .strip { position: relative; display: grid; height: 30px; align-items: stretch;
                    background-image: repeating-linear-gradient(90deg, transparent 0 calc(var(--cw) - 1px), #e6d8bd calc(var(--cw) - 1px) var(--cw)),
                                      repeating-linear-gradient(90deg, transparent 0 calc(var(--pw) - 1px), var(--pl, transparent) calc(var(--pw) - 1px) var(--pw)); }
                .tlg .strip.split { --pl: #f1e6cf; }
                .tlg .now-line { position: absolute; top: 0; bottom: 0; width: 2px; background: #c0392b; z-index: 1; pointer-events: none; }
                .tlg .blk { margin: 2px 1px; padding: 0 6px; display: flex; align-items: center; font-weight: 600; color: #2b1e15; cursor: pointer; overflow: hidden; white-space: nowrap; text-overflow: ellipsis;
                    border-radius: 6px; border: 1px solid rgba(0,0,0,.12); min-width: 0; z-index: 2; }
                .tlg .blk span.t { overflow: hidden; text-overflow: ellipsis; }
                .tlg .blk:hover { filter: brightness(.95); outline: 2px solid #9a7414; outline-offset: -2px; }
                .tlg .blk.excl { background-image: repeating-linear-gradient(135deg, rgba(0,0,0,.07) 0 6px, transparent 6px 12px); }
                .tlg .blk .sh { font-weight: 800; margin-right: 4px; opacity: .7; flex: none; }
                .tlg .rm small.split { color: #6b5a35; font-style: italic; }
            `}</style>
            <div className="flex flex-wrap items-end gap-3">
                <div className="grid gap-1"><Label htmlFor="building">Building</Label>
                    <Select value={building} onValueChange={v => { setBuilding(v); setRoom(''); setFloor('all'); }}><SelectTrigger id="building" className="min-w-48"><SelectValue placeholder="Select building…" /></SelectTrigger>
                        <SelectContent>{buildingNames.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent></Select></div>
                <div className="grid gap-1"><Label htmlFor="floor">Floor</Label>
                    <Select value={floor} onValueChange={setFloor}><SelectTrigger id="floor" className="w-28"><SelectValue /></SelectTrigger>
                        <SelectContent><SelectItem value="all">All floors</SelectItem>{floors.map(f => <SelectItem key={f} value={f}>Floor {f}</SelectItem>)}</SelectContent></Select></div>
                <div className="grid gap-1"><Label htmlFor="room">Room <span className="text-muted-foreground">(optional)</span></Label><Input id="room" placeholder="all rooms" className="w-28" value={room} onChange={e => setRoom(e.target.value)} /></div>
                <div className="grid gap-1"><Label htmlFor="start">From</Label><Input id="start" type="datetime-local" value={start} onChange={e => setStart(e.target.value)} /></div>
                <div className="grid gap-1"><Label htmlFor="end">To</Label><Input id="end" type="datetime-local" value={end} onChange={e => setEnd(e.target.value)} /></div>
                <div className="grid gap-1"><Label htmlFor="step">Each cell</Label>
                    <Select value={step} onValueChange={setStep}><SelectTrigger id="step" className="w-24"><SelectValue /></SelectTrigger><SelectContent>{STEPS.map(x => <SelectItem key={x.h} value={String(x.h)}>{x.label}</SelectItem>)}</SelectContent></Select></div>
                <div className="flex gap-1"><Button variant="outline" onClick={() => shift(-7)} title="A week earlier">◀ 7 days</Button><Button variant="outline" onClick={() => shift(7)} title="A week later">7 days ▶</Button></div>
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={onlyBusy} onChange={e => setOnlyBusy(e.target.checked)} />Only rooms in use</label>
                {grid && !grid.tooMany && <div className="ml-auto flex flex-wrap gap-2"><Badge variant="secondary">{rooms.length} room{rooms.length === 1 ? '' : 's'}</Badge><Badge variant="secondary">{grid.groups} group{grid.groups === 1 ? '' : 's'}</Badge></div>}
            </div>

            {!building && <p className="text-sm text-muted-foreground">Pick a building.</p>}
            {from >= to && <p className="text-sm text-destructive">“From” must be before “To”.</p>}
            {grid?.tooMany && <p className="text-sm text-destructive">That is too many cells for this period — choose bigger cells (e.g. Day) or a shorter period.</p>}
            {slips.isError && <p className="text-sm text-destructive">Could not load the slips.</p>}
            {grid && !grid.tooMany && (
                <div ref={scroller} className={`tl-scroll max-h-[75vh] rounded-lg border bg-white${dragging ? ' dragging' : ''}`} title="Hold the left mouse button and drag to move around"
                    onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp} onClickCapture={e => { if (swallowClick.current) { e.stopPropagation(); e.preventDefault(); } }}>
                    <table className="tlg" style={{ width: 128 + cells.length * st.w }}>
                        <colgroup><col style={{ width: 128 }} />{cells.map(t => <col key={t} style={{ width: st.w }} />)}</colgroup>
                        <thead>
                            <tr><th className="rm" rowSpan={st.h < 24 ? 2 : 1}>Room</th>{days.map(d => <th key={d.key} colSpan={d.span}>{dayText(d.t)}</th>)}</tr>
                            {st.h < 24 && <tr>{cells.map(t => <th key={t}>{hourText(t)}</th>)}</tr>}
                        </thead>
                        <tbody>
                            {rooms.length ? rooms.map(r => {
                                const lanes = r.lanes.length ? r.lanes : [[]];
                                return <Fragment key={r.room}>{lanes.map((lane, li) => (
                                    <tr key={li} className={li === 0 ? 'first' : undefined}>
                                        {li === 0 && <th className="rm" rowSpan={lanes.length}><b>{r.room}</b>
                                            {r.capacity != null && <small className={r.peak > r.capacity ? 'full' : undefined}>{r.peak ? `${r.peak} of ${r.capacity} bed${r.capacity === 1 ? '' : 's'} at most` : `${r.capacity} bed${r.capacity === 1 ? '' : 's'} · free`}</small>}
                                            {r.capacity == null && r.peak > 0 && <small>{r.peak} bed{r.peak === 1 ? '' : 's'} at most</small>}
                                            {r.split > 1 && <small className="split" title="A check-out and a check-in fall in the same cell, so this room's cells are split into finer pieces">{splitText(r.split, st.h)}</small>}
                                            {r.hidden > 0 && <small className="full" title="More groups overlap in this room at the same time than can be drawn — check these slips">+{r.hidden} more overlapping (not drawn)</small>}</th>}
                                        {/* one strip per line: the room's cells split into r.split pieces each; a stay covers its own pieces */}
                                        <td className="lane" colSpan={cells.length}>
                                            <div className={`strip${r.split > 1 ? ' split' : ''}`} style={{ gridTemplateColumns: `repeat(${cells.length * r.split}, 1fr)`, ['--cw' as string]: `${st.w}px`, ['--pw' as string]: `${st.w / r.split}px` }}>
                                                {nowX != null && <i className="now-line" style={{ left: nowX }} />}
                                                {lane.map(s => (
                                                    <div key={s.key} className={`blk${s.excl ? ' excl' : ''}`} style={{ background: s.color, gridColumn: `${s.s0 + 1} / ${s.s1 + 2}`, gridRow: 1 }} title={tip(s)}
                                                        onClick={() => navigate('slip', { sh_no: s.sh })}><span className="sh">{s.sh}</span><span className="t">{stayLabel(s)}</span></div>
                                                ))}
                                            </div>
                                        </td>
                                    </tr>
                                ))}</Fragment>;
                            }) : <tr><td colSpan={cells.length + 1} className="p-4 text-center text-muted-foreground">{onlyBusy ? 'No room is in use in this period.' : 'This building has no rooms set up (Rooms & Buildings) and no slip uses one.'}</td></tr>}
                        </tbody>
                    </table>
                </div>
            )}
            <p className="text-xs text-muted-foreground">Each coloured block is one group in that room: SH · tour operator · group leader · pax in the room / whole group. 🔒 striped = Exclusive room. Times are exact — when one group leaves and the next arrives in the same cell, that room's cells are split into finer pieces (fine lines) instead of showing a double booking. A red line marks now. Hover for times, click to open the slip. Hold the left mouse button and drag to move around the grid.</p>
        </div>
    );
}
