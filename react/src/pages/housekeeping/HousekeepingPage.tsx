import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Printer, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useConfirm } from '@/components/ConfirmDialog';
import { cn } from '@/lib/utils';
import { usePrefs } from '@/hooks/usePrefs';
import { useSlips } from '@/hooks/useSlips';
import { useCore, useGuard, useSite } from '@/pms/PmsContext';
import { PRIO, computeHousekeeping, dayTime, hm, natural, printHtml, shift, ymd, type BuildingIn, type Win } from './housekeeping';

// Room cleaning (Rooms): which rooms housekeeping should do first on a day, building by building. "Done" ticks stay on this device, per day and room.
// Staff on floors are kept with the login (server-side prefs): a floor can have several staff, a staff several floors.

const PCLS: Record<number, string> = { 1: 'bg-bad-soft text-destructive', 2: 'bg-warn-soft text-warn', 3: 'bg-secondary text-secondary-foreground', 4: 'bg-muted text-muted-foreground' };

function Who({ ws, at }: { ws: Win[]; at: 'out' | 'in' | 'stay' }) {
    return <>{ws.map((w, i) => <span key={i} className="block whitespace-nowrap">{at === 'out' ? hm(w.end) : at === 'stay' ? `until ${dayTime(w.end)}` : hm(w.start)} · SH {w.sh} · {w.beds} bed{w.beds === 1 ? '' : 's'}{w.delayed && <i className="ml-1 text-xs text-warn">delayed</i>}</span>)}</>;
}

export default function HousekeepingPage() {
    const { rooms: roomsLib, stay } = useCore();
    const guard = useGuard();
    const { siteId } = useSite();
    const { ask, dialog } = useConfirm();
    const { prefs, setPrefs } = usePrefs();
    const [day, setDay] = useState(ymd(new Date()));
    const [bld, setBld] = useState('');
    const [hideDone, setHideDone] = useState(false), [urgentOnly, setUrgentOnly] = useState(false);
    const [newStaff, setNewStaff] = useState('');
    const doneKey = `pms_hk_done:${siteId}:${day}`;
    const readDone = () => { try { return new Set<string>(JSON.parse(localStorage.getItem(doneKey) || '[]')); } catch { return new Set<string>(); } };
    const [done, setDoneState] = useState<Set<string>>(readDone);
    const [doneFor, setDoneFor] = useState(doneKey);
    if (doneFor !== doneKey) { setDoneFor(doneKey); setDoneState(readDone()); }

    // nothing is loaded until a building is chosen (only the list of buildings)
    const builders = useQuery({ queryKey: ['buildings-force', siteId], queryFn: async () => roomsLib.buildingsOfSite(await guard(roomsLib.loadBuildings({ force: true })), siteId).filter((b: any) => b.rooms.some((r: any) => r.active !== false)) as BuildingIn[] });
    const slips = useSlips();
    const buildings = builders.data ?? [];
    const rows = useMemo(() => bld && slips.data ? computeHousekeeping(slips.data, buildings, day, bld === '*' ? '' : bld, stay, roomsLib) : [], [slips.data, buildings, day, bld, stay, roomsLib]);

    const setDone = (k: string, on: boolean) => {
        const d = new Set(done); if (on) d.add(k); else d.delete(k);
        setDoneState(d);
        try { localStorage.setItem(doneKey, JSON.stringify([...d])); } catch { /* storage blocked: the ticks last until the page is left */ }
    };

    // staff on floors
    const fkey = (b: string) => `${siteId}|${b}`;
    const staff: string[] = prefs.hkStaff || [];
    const staffOn = (b: string, floor: string): string[] => prefs.hkFloors?.[fkey(b)]?.[floor] || [];
    const setStaffOn = (b: string, floor: string, names: string[]) => {
        const all = { ...(prefs.hkFloors || {}) };
        const bb = { ...(all[fkey(b)] || {}) };
        if (names.length) bb[floor] = names; else delete bb[floor];
        if (Object.keys(bb).length) all[fkey(b)] = bb; else delete all[fkey(b)];
        setPrefs({ hkFloors: all });
    };
    const floorOfRoom = (r: any) => String(r.floor || '').trim() || roomsLib.floorOf(r.room_no);
    const floorsOf = (b: BuildingIn) => [...new Set(b.rooms.filter(r => r.active !== false).map(floorOfRoom))].sort(natural);
    function addStaff() {
        const n = newStaff.replace(/[<>]/g, '').replace(/\s+/g, ' ').trim().slice(0, 60);
        if (!n) return;
        if (!staff.some(x => x.toLowerCase() === n.toLowerCase())) setPrefs({ hkStaff: [...staff, n].sort(natural) });
        setNewStaff('');
    }
    async function removeStaff(n: string) {
        if (!await ask({ title: 'Remove staff?', confirmLabel: 'Remove', body: `Remove ${n} from the staff list and from every floor?` })) return;
        const floors: Record<string, any> = {};
        for (const [k, b] of Object.entries<any>(prefs.hkFloors || {})) {
            const kept = Object.fromEntries(Object.entries<string[]>(b).map(([f, ns]) => [f, ns.filter(x => x !== n)] as const).filter(([, ns]) => ns.length));
            if (Object.keys(kept).length) floors[k] = kept;
        }
        setPrefs({ hkStaff: staff.filter(x => x !== n), hkFloors: floors });
    }

    function print() {
        if (!bld) { alert('Choose a building first.'); return; }
        const list = rows.filter(r => !urgentOnly || r.p === 1);
        if (urgentOnly && !list.length) { alert('No Urgent rooms on this day.'); return; }
        const w = window.open('', '_blank');
        if (!w) { alert('The browser blocked the new tab. Allow pop-ups for this site, then press Print again.'); return; }
        w.document.open();
        w.document.write(printHtml(list, { urgentOnly, all: bld === '*', buildingName: bld, day, staffOn }));
        w.document.close();
    }

    const count = (p: number) => rows.filter(r => r.p === p);
    const left = (p: number) => count(p).filter(r => !done.has(`${r.bld}|${r.room}`)).length;
    const shown = rows.filter(r => !hideDone || !done.has(`${r.bld}|${r.room}`));
    const selBlds = buildings.filter(b => bld === '*' || b.name === bld);

    return (
        <div className="mx-auto grid grid-cols-[minmax(0,1fr)] max-w-[2400px] min-w-0 gap-3 px-3 pb-10 pt-4 sm:px-4">
            <header className="grid gap-3">
                <h1 className="text-2xl font-bold text-primary">Room cleaning</h1>
                <div className="flex flex-wrap items-end gap-3">
                    <div className="grid gap-1"><Label htmlFor="hkDay">Day</Label><Input id="hkDay" type="date" value={day} onChange={e => setDay(e.target.value || ymd(new Date()))} /></div>
                    <div className="grid gap-1"><Label htmlFor="hkBld">Building</Label>
                        <Select value={bld} onValueChange={setBld}><SelectTrigger id="hkBld" className="min-w-52"><SelectValue placeholder="Choose a building…" /></SelectTrigger>
                            <SelectContent>{buildings.map(b => <SelectItem key={b.name} value={b.name}>{b.name}</SelectItem>)}<SelectItem value="*">All buildings</SelectItem></SelectContent></Select></div>
                    <div className="flex gap-1.5">{[['Yesterday', -1], ['Today', 0], ['Tomorrow', 1]].map(([l, n]) => <Button key={l} variant="outline" onClick={() => setDay(shift(ymd(new Date()), n as number))}>{l}</Button>)}</div>
                    <div className="flex items-center gap-2 pb-2"><Checkbox id="hkUrgent" checked={urgentOnly} onCheckedChange={v => setUrgentOnly(v === true)} /><Label htmlFor="hkUrgent">Print Urgent only</Label></div>
                    <Button onClick={print}><Printer className="size-4" />Print</Button>
                </div>
            </header>

            {bld && (
                <section className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                    {[1, 2, 3, 4].map(p => <div key={p} className="grid gap-0.5 rounded-xl border bg-card p-3"><span className={cn('w-fit rounded-full px-2 py-0.5 text-xs font-bold', PCLS[p])}>{PRIO[p]}</span><b className="text-2xl">{count(p).length}</b><small className="text-xs text-muted-foreground">{left(p)} still to do</small></div>)}
                    <div className="grid gap-0.5 rounded-xl border bg-card p-3"><span className="text-xs text-muted-foreground">Guests arriving</span><b className="text-2xl">{rows.reduce((n, r) => n + r.ins.reduce((m, w) => m + w.beds, 0), 0)}</b><small className="text-xs text-muted-foreground">beds to make ready · {new Date(`${day}T12:00`).toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'short' })}</small></div>
                </section>
            )}

            {bld && (
                <Card>
                    <CardHeader className="flex-row flex-wrap items-center justify-between gap-2"><CardTitle className="text-base">Staff on floors</CardTitle>
                        <form className="flex gap-2" onSubmit={e => { e.preventDefault(); addStaff(); }}><Input placeholder="New staff name" maxLength={60} autoComplete="off" value={newStaff} onChange={e => setNewStaff(e.target.value)} className="w-48" /><Button type="submit" variant="outline">+ Add staff</Button></form></CardHeader>
                    <CardContent className="grid gap-3">
                        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                            {selBlds.flatMap(b => floorsOf(b).map(f => {
                                const on = staffOn(b.name, f), n = b.rooms.filter(r => r.active !== false && floorOfRoom(r) === f).length;
                                return (
                                    <div key={`${b.name}|${f}`} className="grid gap-1.5 rounded-lg border bg-white p-2.5">
                                        <b className="text-sm">{bld === '*' ? `${b.name} · ` : ''}Floor {f} <small className="font-normal text-muted-foreground">{n} room{n === 1 ? '' : 's'}</small></b>
                                        <div className="flex flex-wrap gap-1">{on.length ? on.map((x, i) => (
                                            <Badge key={i} variant="secondary" className="gap-1">{x}<button type="button" title="Take off this floor" aria-label={`Take ${x} off floor ${f}`} onClick={() => setStaffOn(b.name, f, on.filter((_, j) => j !== i))}><X className="size-3" /></button></Badge>
                                        )) : <span className="text-xs text-muted-foreground">no staff yet</span>}</div>
                                        <Select value="" onValueChange={v => setStaffOn(b.name, f, [...on, v])} disabled={!staff.length}>
                                            <SelectTrigger className="h-8 w-full" aria-label={`Add staff to floor ${f}`}><SelectValue placeholder="+ staff" /></SelectTrigger>
                                            <SelectContent>{staff.map(n2 => <SelectItem key={n2} value={n2}>{n2}</SelectItem>)}</SelectContent></Select>
                                    </div>
                                );
                            })) }
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5 text-sm">{staff.length ? <>Staff: {staff.map(x => <Badge key={x} variant="secondary" className="gap-1">{x}<button type="button" title="Remove from the staff list" aria-label={`Remove ${x}`} onClick={() => void removeStaff(x)}><X className="size-3" /></button></Badge>)}</> : 'No staff yet — add names above, then put them on floors.'}</div>
                    </CardContent>
                </Card>
            )}

            <Card className="gap-0 py-0">
                <CardHeader className="flex-row items-center justify-between border-b py-3"><CardTitle className="text-base">Priority list</CardTitle>
                    <div className="flex items-center gap-2"><Checkbox id="hkHide" checked={hideDone} onCheckedChange={v => setHideDone(v === true)} /><Label htmlFor="hkHide">hide rooms marked done</Label></div></CardHeader>
                <CardContent className="overflow-x-auto p-0">
                    {!bld ? <p className="p-3 text-sm text-muted-foreground">Choose a building to see which rooms to do first.</p>
                        : shown.length ? (
                            <Table>
                                <TableHeader><TableRow><TableHead>Done</TableHead><TableHead>#</TableHead><TableHead>Priority</TableHead><TableHead>Building · room</TableHead><TableHead>Leaves</TableHead><TableHead>Arrives</TableHead><TableHead>Note</TableHead></TableRow></TableHeader>
                                <TableBody>{shown.map((r, i) => {
                                    const k = `${r.bld}|${r.room}`;
                                    return (
                                        <TableRow key={k} className={cn(done.has(k) && 'opacity-50')}>
                                            <TableCell><Checkbox checked={done.has(k)} onCheckedChange={v => setDone(k, v === true)} aria-label={`Room ${r.room} done`} /></TableCell>
                                            <TableCell>{i + 1}</TableCell>
                                            <TableCell><span className={cn('rounded-full px-2 py-0.5 text-xs font-bold whitespace-nowrap', PCLS[r.p])}>{PRIO[r.p]}</span></TableCell>
                                            <TableCell><b>{r.room}</b><small className="block text-muted-foreground">{r.bld} · floor {r.floor} · {r.cap} beds</small></TableCell>
                                            <TableCell>{r.outs.length ? <Who ws={r.outs} at="out" /> : r.p === 4 ? <Who ws={r.stays} at="stay" /> : '—'}</TableCell>
                                            <TableCell>{r.ins.length ? <Who ws={r.ins} at="in" /> : '—'}</TableCell>
                                            <TableCell className="text-sm text-muted-foreground">{r.note}</TableCell>
                                        </TableRow>
                                    );
                                })}</TableBody>
                            </Table>
                        ) : <p className="p-3 text-sm text-muted-foreground">No check-ins, check-outs or stays {bld !== '*' ? `in ${bld} ` : ''}on this day.</p>}
                </CardContent>
            </Card>
            {dialog}
        </div>
    );
}
