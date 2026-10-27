import { useState } from 'react';
import { Printer } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useConfirm } from '@/components/ConfirmDialog';
import { usePrompt } from '@/components/PromptDialog';
import { useDb, useGuard } from '@/pms/PmsContext';
import './grouping.css';

// Groups (Groups & meals): load the arrivals of a period, put groups into slots (one group each, or several bundled into one) and print one big sticker
// per slot — tour name(s), leader(s) and the pax limit — A4 landscape, one per page. Ported from pms/fega.html; nothing here is saved.

type Slip = Record<string, any>;
type Tour = { tour_name: string; group_leader: string; sh: string };
type Slot = { id: string; tours: Tour[]; pax: number };
const pad2 = (n: number) => String(n).padStart(2, '0');
const toDateObj = (dstr: string, tstr?: string) => { if (!dstr) return null; const [y, m, d] = dstr.split('-').map(Number); let hh = 0, mm = 0; if (tstr && /^\d{1,2}:\d{2}$/.test(tstr)) [hh, mm] = tstr.split(':').map(Number); return new Date(y, (m || 1) - 1, d || 1, hh || 0, mm || 0, 0, 0); };
const norm = (s: unknown) => (s == null ? '' : String(s)).trim();
const uniq = <T,>(a: T[]) => Array.from(new Set(a));
const sum = (a: number[]) => a.reduce((x, y) => x + Number(y || 0), 0);
let counter = 1;
const makeSlot = (items: { tour_name: string; group_leader: string; sh_no: string; total: number }[]): Slot => ({ id: 'S' + (counter++), tours: items.map(it => ({ tour_name: norm(it.tour_name), group_leader: norm(it.group_leader), sh: norm(it.sh_no) })), pax: sum(items.map(it => Number(it.total || 0))) || 0 });
const titles = (s: Slot) => s.tours.map(t => t.tour_name || '(Untitled)');
const leadersOf = (s: Slot) => uniq(s.tours.map(t => t.group_leader).filter(Boolean)).join(' | ');

export default function GroupingPage() {
    const db = useDb();
    const guard = useGuard();
    const { ask: askConfirm, dialog: confirmDialog } = useConfirm();
    const { ask: askPrompt, dialog: promptDialog } = usePrompt();
    const t0 = new Date(), today = `${t0.getFullYear()}-${pad2(t0.getMonth() + 1)}-${pad2(t0.getDate())}`;
    const [df, setDf] = useState(today), [dt, setDt] = useState(today), [tf, setTf] = useState(''), [tt, setTt] = useState(''), [bld, setBld] = useState('');
    const [results, setResults] = useState<Slip[]>([]);
    const [found, setFound] = useState(false);
    const [pickedR, setPickedR] = useState<Set<number>>(new Set());
    const [slots, setSlots] = useState<Slot[]>([]);
    const [pickedS, setPickedS] = useState<Set<string>>(new Set());
    const [note, setNote] = useState('');

    async function load() {
        if (!df || !dt) { setNote('Pick a date range.'); return; }
        const all: Slip[] = await guard(db.all());
        const start = toDateObj(df, tf || '00:00')!, end = toDateObj(dt, tt || '23:59')!, b = norm(bld);
        const list = all.filter(s => { const d = toDateObj(s.checkin_date, s.checkin_time); return !!d && d >= start && d <= end; })
            .filter(s => !b || norm(s.building) === b)
            .map(s => ({ tour_name: s.tour_name || '', group_leader: s.group_leader || '', sh_no: s.sh_no || '', checkin_date: s.checkin_date || '', checkin_time: s.checkin_time || '', building: s.building || '', total: Number(s.total || 0) }))
            .sort((a, c) => (a.checkin_date + a.checkin_time).localeCompare(c.checkin_date + c.checkin_time));
        setResults(list); setPickedR(new Set()); setFound(true); setNote('');
    }
    const chosen = () => results.filter((_, i) => pickedR.has(i));
    const addSelected = () => { const c = chosen(); if (!c.length) { setNote('Select arrivals first.'); return; } setSlots(s => [...s, ...c.map(x => makeSlot([x as any]))]); setNote(''); };
    const bundleSelected = () => { const c = chosen(); if (c.length < 2) { setNote('Select at least two arrivals to bundle.'); return; } setSlots(s => [...s, makeSlot(c as any)]); setNote(''); };

    async function splitSlot(s: Slot) {
        const tot = Number(s.pax || 0);
        const a = await askPrompt({ title: `Split ${titles(s).join(' + ')}`, body: `Total ${tot}. Enter first half pax:`, value: String(Math.floor(tot / 2)), type: 'number' });
        if (a == null) return;
        const aNum = Math.max(0, Number(a || 0)), bNum = Math.max(0, tot - aNum);
        const s1: Slot = { id: 'S' + (counter++), tours: JSON.parse(JSON.stringify(s.tours)), pax: aNum }, s2: Slot = { id: 'S' + (counter++), tours: JSON.parse(JSON.stringify(s.tours)), pax: bNum };
        setSlots(list => { const i = list.indexOf(s); return i < 0 ? list : [...list.slice(0, i), s1, s2, ...list.slice(i + 1)]; });
        setPickedS(new Set());
    }
    function splitPicked() {
        const ps = slots.filter(s => pickedS.has(s.id));
        if (ps.length !== 1) { setNote('Pick exactly one slot to split.'); return; }
        void splitSlot(ps[0]);
    }
    function bundlePicked() {
        const ps = slots.filter(s => pickedS.has(s.id));
        if (ps.length < 2) { setNote('Pick at least two slots to bundle.'); return; }
        const merged: Slot = { id: 'S' + (counter++), tours: ps.flatMap(s => s.tours), pax: sum(ps.map(s => s.pax || 0)) };
        setSlots(list => [...list.filter(s => !pickedS.has(s.id)), merged]); setPickedS(new Set()); setNote('');
    }
    async function clearList() { if (await askConfirm({ title: 'Clear the list?', confirmLabel: 'Clear', body: 'Clear the assignment list?' })) { setSlots([]); setPickedS(new Set()); } }
    const toggle = <T,>(set: Set<T>, k: T, on: boolean) => { const n = new Set(set); if (on) n.add(k); else n.delete(k); return n; };

    return (
        <div className="gp-print mx-auto grid grid-cols-[minmax(0,1fr)] max-w-[2400px] min-w-0 gap-3 px-3 pb-10 pt-4 sm:px-4">
            <Card className="print:hidden"><CardContent className="grid gap-3">
                <div className="grid grid-cols-2 items-end gap-3 sm:grid-cols-3 lg:grid-cols-6">
                    <div className="grid gap-1"><Label htmlFor="dateFrom">Arrivals from (date)</Label><Input id="dateFrom" type="date" value={df} onChange={e => setDf(e.target.value)} /></div>
                    <div className="grid gap-1"><Label htmlFor="dateTo">Arrivals to (date)</Label><Input id="dateTo" type="date" value={dt} onChange={e => setDt(e.target.value)} /></div>
                    <div className="grid gap-1"><Label htmlFor="timeFrom">Time from (optional)</Label><Input id="timeFrom" type="time" value={tf} onChange={e => setTf(e.target.value)} /></div>
                    <div className="grid gap-1"><Label htmlFor="timeTo">Time to (optional)</Label><Input id="timeTo" type="time" value={tt} onChange={e => setTt(e.target.value)} /></div>
                    <div className="col-span-2 grid gap-1 sm:col-span-1"><Label htmlFor="building">Building (optional)</Label><Input id="building" placeholder="exact match or blank" value={bld} onChange={e => setBld(e.target.value)} /></div>
                    <div className="flex items-center gap-2"><Button onClick={() => void load()}>Load arrivals</Button><Badge variant="secondary">{results.length} found</Badge></div>
                </div>
                {note && <p role="status" className="text-sm font-semibold text-destructive">{note}</p>}
                {found && results.length > 0 && <>
                    <div className="max-h-96 overflow-auto rounded-lg border">
                        <Table>
                            <TableHeader><TableRow><TableHead><Checkbox aria-label="Select all arrivals" checked={pickedR.size === results.length && results.length > 0} onCheckedChange={on => setPickedR(on === true ? new Set(results.map((_, i) => i)) : new Set())} /></TableHead><TableHead>Tour Name</TableHead><TableHead>Leader</TableHead><TableHead>SH</TableHead><TableHead>Check-in</TableHead><TableHead>Building</TableHead><TableHead className="text-right">Total</TableHead><TableHead>Add</TableHead></TableRow></TableHeader>
                            <TableBody>{results.map((r, i) => (
                                <TableRow key={i}>
                                    <TableCell><Checkbox aria-label={`Select SH ${r.sh_no}`} checked={pickedR.has(i)} onCheckedChange={on => setPickedR(p => toggle(p, i, on === true))} /></TableCell>
                                    <TableCell>{r.tour_name}</TableCell><TableCell>{r.group_leader}</TableCell><TableCell>{r.sh_no}</TableCell>
                                    <TableCell className="whitespace-nowrap">{r.checkin_date} <small className="text-muted-foreground">{r.checkin_time}</small></TableCell>
                                    <TableCell>{r.building}</TableCell><TableCell className="text-right">{r.total || 0}</TableCell>
                                    <TableCell><Button size="sm" variant="outline" onClick={() => setSlots(s => [...s, makeSlot([r as any])])}>Add</Button></TableCell>
                                </TableRow>
                            ))}</TableBody>
                        </Table>
                    </div>
                    <div className="flex flex-wrap gap-2"><Button variant="outline" onClick={addSelected}>Add selected to assignment</Button><Button variant="outline" title="Bundle selected arrivals into one slot" onClick={bundleSelected}>Bundle selected</Button></div>
                </>}
            </CardContent></Card>

            <div className="grid min-w-0 items-start gap-3 lg:grid-cols-2">
                <Card className="print:hidden"><CardContent className="grid gap-3">
                    <div className="flex items-center justify-between"><b>Assignment list</b><Button variant="ghost" size="sm" onClick={() => void clearList()}>Clear</Button></div>
                    <div className="overflow-x-auto rounded-lg border">
                        <Table>
                            <TableHeader><TableRow><TableHead><Checkbox aria-label="Select all slots" checked={pickedS.size === slots.length && slots.length > 0} onCheckedChange={on => setPickedS(on === true ? new Set(slots.map(s => s.id)) : new Set())} /></TableHead><TableHead>Tour Name(s)</TableHead><TableHead>Leader(s)</TableHead><TableHead>Pax limit</TableHead><TableHead>Tools</TableHead></TableRow></TableHeader>
                            <TableBody>{slots.length ? slots.map(s => (
                                <TableRow key={s.id}>
                                    <TableCell><Checkbox aria-label="Pick slot" checked={pickedS.has(s.id)} onCheckedChange={on => setPickedS(p => toggle(p, s.id, on === true))} /></TableCell>
                                    <TableCell>{titles(s).map((t, i) => <div key={i}>{t}</div>)}</TableCell><TableCell>{leadersOf(s)}</TableCell>
                                    <TableCell><Input type="number" min={0} className="w-24" value={s.pax} onChange={e => { const v = Math.max(0, Number(e.target.value || 0)); setSlots(l => l.map(x => x.id === s.id ? { ...x, pax: v } : x)); }} /></TableCell>
                                    <TableCell className="whitespace-nowrap"><Button variant="ghost" size="sm" onClick={() => void splitSlot(s)}>Split</Button><Button variant="ghost" size="sm" onClick={() => setSlots(l => l.filter(x => x.id !== s.id))}>Remove</Button></TableCell>
                                </TableRow>
                            )) : <TableRow><TableCell colSpan={5} className="text-muted-foreground">Add arrivals above — each becomes a sticker.</TableCell></TableRow>}</TableBody>
                        </Table>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Button variant="outline" title="Split one selected slot into two" onClick={splitPicked}>Split selected</Button>
                        <Button variant="outline" title="Bundle selected slots into one" onClick={bundlePicked}>Bundle selected</Button>
                        <Button onClick={() => { if (!slots.length) { setNote('Nothing to print. Add slots first.'); return; } window.print(); }}><Printer className="size-4" />Print stickers (A4 landscape)</Button>
                    </div>
                </CardContent></Card>

                <Card className="print:border-0 print:p-0 print:shadow-none"><CardContent className="print:p-0">
                    <div>{slots.map(s => (
                        <div key={s.id} className="gp-sticker">
                            <div className="flex flex-col gap-0.5">
                                <div className="tour">{titles(s).map((t, i) => <div key={i}>{t}</div>)}</div>
                                <div className="leader">{leadersOf(s) || ' '}</div>
                                <div className="pax">PAX LIMIT: <strong>{Number(s.pax || 0)}</strong></div>
                            </div>
                        </div>
                    ))}{!slots.length && <p className="text-sm text-muted-foreground print:hidden">The stickers appear here.</p>}</div>
                </CardContent></Card>
            </div>
            {confirmDialog}{promptDialog}
        </div>
    );
}
