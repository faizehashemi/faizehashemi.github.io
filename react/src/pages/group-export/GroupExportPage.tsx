import { useState } from 'react';
import { Download } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useConfirm } from '@/components/ConfirmDialog';
import { usePrompt } from '@/components/PromptDialog';
import { useDb, useGuard, useLoadCore } from '@/pms/PmsContext';
import { N, clean, downloadDOCX, downloadPDF, keyOf, makeSlot, newId, pairAgg, sentenceCase, type Slot } from './groupexport';

// Fakkul Ehraam Groups — PDF / DOCX: arrivals of a period → slots (one group each, or several bundled) → one sheet per slot as a PDF or a Word file.
// The PDF and the DOCX share one assignment list; the libraries load on first use. Nothing here is saved.

type Slip = Record<string, any>;
const pad2 = (n: number) => String(n).padStart(2, '0');
const toDateObj = (dstr: string, tstr: string) => { if (!dstr) return null; const [y, m, d] = dstr.split('-').map(Number); let hh = 0, mm = 0; if (tstr && /^\d{1,2}:\d{2}$/.test(tstr)) [hh, mm] = tstr.split(':').map(Number); return new Date(y, (m || 1) - 1, d || 1, hh || 0, mm || 0, 0, 0); };
const toggle = <T,>(set: Set<T>, k: T, on: boolean) => { const n = new Set(set); if (on) n.add(k); else n.delete(k); return n; };

export default function GroupExportPage() {
    const db = useDb();
    const guard = useGuard();
    const loadCore = useLoadCore();
    const { ask: askConfirm, dialog: confirmDialog } = useConfirm();
    const { ask: askPrompt, dialog: promptDialog } = usePrompt();
    const n0 = new Date(), today = `${n0.getFullYear()}-${pad2(n0.getMonth() + 1)}-${pad2(n0.getDate())}`;
    const [df, setDf] = useState(today), [dt, setDt] = useState(today), [tf, setTf] = useState(''), [tt, setTt] = useState(''), [bld, setBld] = useState('');
    const [results, setResults] = useState<Slip[]>([]);
    const [found, setFound] = useState(false);
    const [pickedR, setPickedR] = useState<Set<number>>(new Set());
    const [slots, setSlots] = useState<Slot[]>([]);
    const [pickedS, setPickedS] = useState<Set<string>>(new Set());
    const [note, setNote] = useState<{ text: string; bad?: boolean }>({ text: '' });
    const [busy, setBusy] = useState('');
    const say = (text: string, bad = true) => setNote({ text, bad });

    async function load() {
        if (!df || !dt) { say('Pick a date range.'); return; }
        const all: Slip[] = await guard(db.all());
        const start = toDateObj(df, tf || '00:00')!, end = toDateObj(dt, tt || '23:59')!, b = clean(bld);
        const list = all.filter(s => { const d = toDateObj(s.checkin_date, s.checkin_time); return !!d && d >= start && d <= end; }).filter(s => !b || clean(s.building) === b)
            .map(s => ({ tour_name: clean(s.tour_name), group_leader: clean(s.group_leader), sh_no: clean(s.sh_no), checkin_date: s.checkin_date || '', checkin_time: s.checkin_time || '', building: clean(s.building), total: N(s.total) }))
            .sort((a, c) => (a.checkin_date + a.checkin_time).localeCompare(c.checkin_date + c.checkin_time));
        setResults(list); setPickedR(new Set()); setFound(true); setNote({ text: '' });
    }
    const chosen = () => results.filter((_, i) => pickedR.has(i));
    const addSelected = () => { const c = chosen(); if (!c.length) { say('Select arrivals first.'); return; } setSlots(s => [...s, ...c.map(x => makeSlot([x as any]))]); setNote({ text: '' }); };
    const bundleSelected = () => { const c = chosen(); if (c.length < 2) { say('Select at least two arrivals to bundle.'); return; } setSlots(s => [...s, makeSlot(c as any)]); setNote({ text: '' }); };
    function bundleSlots() {
        const items = slots.filter(s => pickedS.has(s.id));
        if (items.length < 2) { say('Pick at least two slots.'); return; }
        const merged: Slot = { id: newId(), tours: items.flatMap(s => s.tours), pax: items.reduce((s, x) => s + N(x.pax), 0), showLeaderByKey: {} };
        // defaults for the merged slot, then keep any leader line that was switched on before
        merged.showLeaderByKey = makeSlot(merged.tours).showLeaderByKey;
        for (const s of items) for (const k in s.showLeaderByKey) if (s.showLeaderByKey[k]) merged.showLeaderByKey[k] = true;
        setSlots(list => [...list.filter(s => !pickedS.has(s.id)), merged]); setPickedS(new Set()); setNote({ text: '' });
    }
    async function split(s: Slot) {
        const tot = N(s.pax);
        const a = await askPrompt({ title: 'Split slot', body: `Total ${tot}. Enter first half pax:`, value: String(Math.floor(tot / 2)), type: 'number' });
        if (a == null) return;
        const aNum = Math.max(0, N(a)), bNum = Math.max(0, tot - aNum);
        const copy = (pax: number): Slot => ({ id: newId(), tours: JSON.parse(JSON.stringify(s.tours)), pax, showLeaderByKey: { ...s.showLeaderByKey } });
        setSlots(list => { const i = list.indexOf(s); return i < 0 ? list : [...list.slice(0, i), ...[copy(aNum), copy(bNum)], ...list.slice(i + 1)]; });
    }
    async function clearList() { if (await askConfirm({ title: 'Clear the list?', confirmLabel: 'Clear', body: 'Clear the assignment list?' })) { setSlots([]); setPickedS(new Set()); } }
    async function make(kind: 'pdf' | 'docx') {
        if (!slots.length) { say('Add or bundle something first.'); return; }
        setBusy(kind);
        try { const lib = await loadCore('lib'); await (kind === 'pdf' ? downloadPDF(slots, lib) : downloadDOCX(slots, lib)); setNote({ text: '' }); }
        catch (e: any) { say(e?.message || String(e)); }
        finally { setBusy(''); }
    }

    return (
        <div className="mx-auto grid grid-cols-[minmax(0,1fr)] max-w-[2400px] min-w-0 gap-3 px-3 pb-10 pt-4 sm:px-4">
            <h1 className="text-2xl font-bold text-primary">Fakkul Ehraam Groups — PDF / DOCX</h1>
            <Card><CardContent className="grid gap-3">
                <div className="grid grid-cols-2 items-end gap-3 sm:grid-cols-3 lg:grid-cols-6">
                    <div className="grid gap-1"><Label htmlFor="dateFrom">Arrivals from</Label><Input id="dateFrom" type="date" value={df} onChange={e => setDf(e.target.value)} /></div>
                    <div className="grid gap-1"><Label htmlFor="dateTo">Arrivals to</Label><Input id="dateTo" type="date" value={dt} onChange={e => setDt(e.target.value)} /></div>
                    <div className="grid gap-1"><Label htmlFor="timeFrom">Time from</Label><Input id="timeFrom" type="time" value={tf} onChange={e => setTf(e.target.value)} /></div>
                    <div className="grid gap-1"><Label htmlFor="timeTo">Time to</Label><Input id="timeTo" type="time" value={tt} onChange={e => setTt(e.target.value)} /></div>
                    <div className="col-span-2 grid gap-1 sm:col-span-1"><Label htmlFor="building">Building</Label><Input id="building" placeholder="exact match or blank" value={bld} onChange={e => setBld(e.target.value)} /></div>
                    <div className="flex items-center gap-2"><Button onClick={() => void load()}>Load arrivals</Button><Badge variant="secondary">{results.length} found</Badge></div>
                </div>
                {found && results.length > 0 && <>
                    <div className="max-h-96 overflow-auto rounded-lg border">
                        <Table>
                            <TableHeader><TableRow><TableHead><Checkbox aria-label="Select all arrivals" checked={pickedR.size === results.length} onCheckedChange={on => setPickedR(on === true ? new Set(results.map((_, i) => i)) : new Set())} /></TableHead><TableHead>Tour Name</TableHead><TableHead>Leader</TableHead><TableHead>SH</TableHead><TableHead>Check-in</TableHead><TableHead>Building</TableHead><TableHead className="text-right">Total</TableHead><TableHead>Add</TableHead></TableRow></TableHeader>
                            <TableBody>{results.map((r, i) => (
                                <TableRow key={i}><TableCell><Checkbox aria-label={`Select SH ${r.sh_no}`} checked={pickedR.has(i)} onCheckedChange={on => setPickedR(p => toggle(p, i, on === true))} /></TableCell>
                                    <TableCell>{r.tour_name}</TableCell><TableCell>{r.group_leader}</TableCell><TableCell>{r.sh_no}</TableCell><TableCell className="whitespace-nowrap">{r.checkin_date} <small className="text-muted-foreground">{r.checkin_time}</small></TableCell><TableCell>{r.building}</TableCell><TableCell className="text-right">{r.total}</TableCell>
                                    <TableCell><Button size="sm" variant="outline" onClick={() => setSlots(s => [...s, makeSlot([r as any])])}>Add</Button></TableCell></TableRow>
                            ))}</TableBody>
                        </Table>
                    </div>
                    <div className="flex flex-wrap gap-2"><Button variant="outline" onClick={addSelected}>Add selected</Button><Button variant="outline" onClick={bundleSelected}>Bundle selected</Button></div>
                </>}
            </CardContent></Card>

            <Card><CardContent className="grid gap-3">
                <div className="flex flex-wrap items-center gap-2">
                    <Button variant="outline" onClick={bundleSlots}>Bundle selected from list</Button>
                    <Button variant="outline" onClick={() => void clearList()}>Clear</Button>
                    <Button disabled={!!busy} onClick={() => void make('pdf')}><Download className="size-4" />Download PDF</Button>
                    <Button disabled={!!busy} onClick={() => void make('docx')}><Download className="size-4" />Download DOCX</Button>
                    <Badge variant="secondary">{slots.length} slot{slots.length !== 1 ? 's' : ''}</Badge>
                    {busy && <span className="text-sm text-muted-foreground">Making the {busy.toUpperCase()}…</span>}
                    {note.text && <span role="status" className="text-sm font-semibold text-destructive">{note.text}</span>}
                </div>
                <div className="overflow-x-auto rounded-lg border">
                    <Table>
                        <TableHeader><TableRow><TableHead className="w-11"><Checkbox aria-label="Select all slots" checked={pickedS.size === slots.length && slots.length > 0} onCheckedChange={on => setPickedS(on === true ? new Set(slots.map(s => s.id)) : new Set())} /></TableHead><TableHead>Tour &amp; Leader</TableHead><TableHead className="w-32">Pax limit</TableHead><TableHead className="w-44">Tools</TableHead></TableRow></TableHeader>
                        <TableBody>{slots.length ? slots.map(s => (
                            <TableRow key={s.id}>
                                <TableCell><Checkbox aria-label="Pick slot" checked={pickedS.has(s.id)} onCheckedChange={on => setPickedS(p => toggle(p, s.id, on === true))} /></TableCell>
                                <TableCell>{pairAgg(s).map(p => {
                                    const k = keyOf(p), l = sentenceCase(p.group_leader);
                                    return <div key={k} className="mb-1.5"><div className="font-bold">{p.tour_name} <span className="font-normal opacity-75">({p.count})</span></div>
                                        {l && <label className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground"><Checkbox checked={!!s.showLeaderByKey[k]} onCheckedChange={on => setSlots(list => list.map(x => x.id === s.id ? { ...x, showLeaderByKey: { ...x.showLeaderByKey, [k]: on === true } } : x))} />{l} <span className="opacity-70">(show in DOCX)</span></label>}</div>;
                                })}</TableCell>
                                <TableCell><Input type="number" min={0} className="w-24" value={N(s.pax)} onChange={e => { const v = Math.max(0, N(e.target.value)); setSlots(list => list.map(x => x.id === s.id ? { ...x, pax: v } : x)); }} /></TableCell>
                                <TableCell className="whitespace-nowrap"><Button variant="ghost" size="sm" onClick={() => void split(s)}>Split</Button><Button variant="ghost" size="sm" onClick={() => setSlots(list => list.filter(x => x.id !== s.id))}>Remove</Button></TableCell>
                            </TableRow>
                        )) : <TableRow><TableCell colSpan={4} className="text-muted-foreground">Load arrivals and add them — each slot becomes a sheet.</TableCell></TableRow>}</TableBody>
                    </Table>
                </div>
            </CardContent></Card>
            {confirmDialog}{promptDialog}
        </div>
    );
}
