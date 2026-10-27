import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Plus, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { useConfirm } from '@/components/ConfirmDialog';
import { usePrompt } from '@/components/PromptDialog';
import { useCore, useDb, useGuard, useSite } from '@/pms/PmsContext';

// Rooms & Buildings builder: buildings of this site, their rooms and bed counts. Saved per building on the server (with version protection); every other page
// reads capacities from here (core/rooms.js). Unsaved edits are kept as a draft per building until saved or discarded.

type Row = Record<string, any>;
type Room = { room_no: string; floor: string; capacity: number; type: string; notes: string; active: boolean };
const TYPES = ['', 'gents', 'ladies', 'family'];
const natural = (a: unknown, b: unknown) => String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: 'base' });
const clone = <T,>(x: T): T => JSON.parse(JSON.stringify(x));
const sel = 'h-9 rounded-md border bg-background px-2 text-sm';

export default function BuilderPage() {
    const { cloud, rooms: R } = useCore();
    const r = R as any;
    const db = useDb();
    const guard = useGuard();
    const { site, siteId } = useSite();
    const { ask: confirm, dialog: confirmDialog } = useConfirm();
    const { ask: prompt, dialog: promptDialog } = usePrompt();
    const writable = cloud.canWrite(siteId);
    const [saved, setSaved] = useState<Row[]>([]);
    const [drafts, setDrafts] = useState<Record<string, Row>>({});
    const [key, setKey] = useState<string | null>(null);
    const [selected, setSelected] = useState<Set<number>>(new Set());
    const [f, setF] = useState({ q: '', floor: '' });
    const [notice, setNotice] = useState<{ t: string; bad: boolean } | null>(null);
    const [msg, setMsg] = useState('');
    const [bad, setBad] = useState<Set<number>>(new Set());
    const [busy, setBusy] = useState(false);
    const [gen, setGen] = useState({ from: '', to: '', cap: 4, type: '' }), [paste, setPaste] = useState('');
    const [seed, setSeed] = useState<Row[]>([]), [mapOpen, setMapOpen] = useState(false);
    const counter = useRef(0);
    const [ready, setReady] = useState(false);

    const keyOf = (b: Row) => (b.id ? `id${b.id}` : b._key);
    const original = (k: string | null) => saved.find(b => keyOf(b) === k) || null;
    const isDirty = (k: string) => {
        const d = drafts[k]; if (!d) return false;
        const o = original(k); if (!o) return true;
        const pick = (b: Row) => JSON.stringify({ name: b.name, sort: Number(b.sort) || 0, notes: b.notes || '', rooms: b.rooms });
        return pick(d) !== pick(o);
    };
    const cur = key ? drafts[key] : null;
    const off = !writable || !(r.roomsState.serverSupportsRooms);

    const load = useCallback(async (keep?: string | null) => {
        const all = await guard<any[]>(r.loadBuildings({ force: true }));
        if (!r.roomsState.serverSupportsRooms) setNotice({ t: 'The PMS server has not been updated for Rooms & Buildings yet. Ask the admin to redeploy worker.js and run schema.sql (see worker/README.md).', bad: true });
        else if (!writable) setNotice({ t: db.readonlyReason || 'Read-only.', bad: false }); else setNotice(null);
        const list = (r.buildingsOfSite(all, siteId) as Row[]).map(clone);
        setSaved(list);
        setDrafts(d => { const n: Record<string, Row> = {}; for (const [k, v] of Object.entries(d)) if (!k.startsWith('id') || list.some(b => keyOf(b) === k)) n[k] = v; return n; });
        setKey(k => { const want = keep !== undefined ? keep : k; return want && (list.some(b => keyOf(b) === want) || want.startsWith('new')) ? want : (list[0] ? keyOf(list[0]) : null); });
        setReady(true);
    }, [siteId]);   // eslint-disable-line react-hooks/exhaustive-deps
    useEffect(() => { void load(); }, [load]);
    // opening a building makes its working copy
    useEffect(() => { if (key && !drafts[key]) { const o = original(key); if (o) setDrafts(d => ({ ...d, [key]: clone(o) })); } setSelected(new Set()); setBad(new Set()); setF({ q: '', floor: '' }); }, [key, saved]);   // eslint-disable-line react-hooks/exhaustive-deps
    useEffect(() => {
        const h = (e: BeforeUnloadEvent) => { if (Object.keys(drafts).some(isDirty)) { e.preventDefault(); e.returnValue = ''; } };
        window.addEventListener('beforeunload', h); return () => window.removeEventListener('beforeunload', h);
    });   // eslint-disable-line react-hooks/exhaustive-deps
    useEffect(() => { void (async () => { if (!writable) return; try { setSeed(((await guard<any>(fetch('app/data/rooms-seed.json').then(x => x.json()))).buildings as Row[]).filter(b => b.site === siteId)); } catch { setSeed([]); } })(); }, []);   // eslint-disable-line react-hooks/exhaustive-deps

    const upd = (fn: (d: Row) => void) => { if (!key) return; setDrafts(ds => { const d = clone(ds[key]); fn(d); return { ...ds, [key]: d }; }); };
    const entries = useMemo(() => { const out = saved.map(b => drafts[keyOf(b)] || b); for (const d of Object.values(drafts)) if (!d.id) out.push(d); return out; }, [saved, drafts]);   // eslint-disable-line react-hooks/exhaustive-deps
    const floorOf = (rm: Room) => rm.floor || r.floorOf(rm.room_no);
    const floors = cur ? [...new Set((cur.rooms as Room[]).map(floorOf))].sort(natural) : [];
    const visible: number[] = cur ? (cur.rooms as Room[]).map((_, i) => i).filter(i => {
        const rm = cur.rooms[i] as Room, q = r.normRoom(f.q);
        if (q && !r.normRoom(rm.room_no).includes(q) && !String(rm.notes || '').toUpperCase().includes(q)) return false;
        return !(f.floor && floorOf(rm) !== f.floor);
    }) : [];
    const before = new Map<string, string>((original(key)?.rooms || []).map((x: Room) => [r.normRoom(x.room_no), JSON.stringify(x)]));

    function newBuilding() {
        void (async () => {
            const name = ((await prompt({ title: 'Name of the new building:' })) || '').trim().toUpperCase();
            if (!name) return;
            if (entries.some(b => b.name === name)) { setMsg(`${name} already exists.`); return; }
            const k = `new${++counter.current}`;
            setDrafts(d => ({ ...d, [k]: { _key: k, site: siteId, name, sort: entries.length, notes: '', rooms: [] } })); setKey(k);
        })();
    }
    function upsert(list: { room_no: string; capacity: number; type?: string }[], overwrite: boolean) {
        let added = 0, updated = 0;
        upd(d => {
            const byNo = new Map<string, Room>((d.rooms as Room[]).map(x => [r.normRoom(x.room_no), x]));
            for (const x of list) {
                const hit = byNo.get(r.normRoom(x.room_no));
                if (hit) { if (overwrite && hit.capacity !== x.capacity) { hit.capacity = x.capacity; updated++; } continue; }
                const nr: Room = { room_no: x.room_no, floor: r.floorOf(x.room_no), capacity: x.capacity, type: x.type || '', notes: '', active: true };
                d.rooms.push(nr); byNo.set(r.normRoom(nr.room_no), nr); added++;
            }
            d.rooms.sort((a: Room, b: Room) => natural(a.room_no, b.room_no));
        });
        setSelected(new Set());
        return { added, updated };
    }
    function genRange() {
        const { from, cap } = gen, to = gen.to.trim() || from.trim();
        if (!/^\d+$/.test(from.trim()) || !/^\d+$/.test(to) || Number(to) < Number(from)) { setMsg('Enter two room numbers, e.g. 501 and 520.'); return; }
        if (Number(to) - Number(from) > 500) { setMsg('At most 500 rooms at once.'); return; }
        if (!Number.isInteger(Number(cap)) || cap < 0 || cap > 50) { setMsg('Beds must be 0–50.'); return; }
        const list = []; for (let n = Number(from); n <= Number(to); n++) list.push({ room_no: String(n).padStart(from.trim().length, '0'), capacity: Number(cap), type: gen.type });
        const have = new Set((cur!.rooms as Room[]).map(x => r.normRoom(x.room_no))); const added = list.filter(x => !have.has(r.normRoom(x.room_no))).length;
        upsert(list, false); setMsg(`${added} room(s) added${list.length - added ? `, ${list.length - added} already existed` : ''} — not saved yet.`);
    }
    function pasteList() {
        const items = paste.split(/[,;\n]+/).map(s => s.trim()).filter(Boolean), list: { room_no: string; capacity: number }[] = [], badItems: string[] = [];
        for (const it of items) { const m = it.match(/^([A-Za-z0-9-]{1,12})\s*[:\s]\s*(\d{1,2})$/); if (m && Number(m[2]) <= 50) list.push({ room_no: m[1].toUpperCase(), capacity: Number(m[2]) }); else badItems.push(it); }
        if (!list.length) { setMsg('Nothing recognised. Use e.g. 501:4, 502:3'); return; }
        const { added, updated } = upsert(list, true);
        setMsg(`${added} added, ${updated} updated${badItems.length ? `, ${badItems.length} not understood: ${badItems.slice(0, 5).join(', ')}` : ''} — not saved yet.`);
        if (!badItems.length) setPaste('');
    }
    const forSelected = (fn: (x: Room) => void, what: string) => {
        if (!selected.size) { setMsg('Tick the rooms first (the box at the start of each row).'); return; }
        upd(d => { for (const i of selected) fn(d.rooms[i]); }); setMsg(`${what} for ${selected.size} room(s) — not saved yet.`);
    };
    const [selCap, setSelCap] = useState('');
    async function slipsUsing(name: string) { return ((await db.all()) as Row[]).filter(x => String(x.building || '').trim().toUpperCase() === name).length; }
    async function saveIt() {
        const d = cur!;
        if (!d.name.trim()) { setMsg('Give the building a name.'); return; }
        const seen = new Map<string, number>(), problems = new Set<number>();
        (d.rooms as Room[]).forEach((x, i) => { const k = r.normRoom(x.room_no); if (!k) problems.add(i); else if (seen.has(k)) { problems.add(i); problems.add(seen.get(k)!); } else seen.set(k, i); if (!Number.isInteger(x.capacity) || x.capacity < 0 || x.capacity > 50) problems.add(i); });
        if (problems.size) { setF({ q: '', floor: '' }); setBad(problems); setMsg(`${problems.size} room(s) need fixing (highlighted): each room needs a unique number and 0–50 beds.`); return; }
        const o = original(key);
        if (o && o.name !== d.name) { const n = await slipsUsing(o.name); if (n && !(await confirm({ title: `Rename to ${d.name} anyway?`, body: `${n} slip(s) are for building ${o.name}. They keep that name — renaming here does not change them.`, confirmLabel: 'Rename' }))) return; }
        setBusy(true); setMsg('Saving…');
        try {
            const b = await guard<any>(r.saveBuilding(d));
            setDrafts(ds => { const n = { ...ds }; delete n[key!]; return n; });
            await load(keyOf(b)); setMsg(`Saved ${b.name}: ${b.rooms.length} rooms, ${r.totalBeds(b)} beds.`);
        } catch (e: any) {
            setMsg(e instanceof cloud.UserError ? e.message : 'Save failed: ' + (e.message || e));
            if (e.status === 409 && await confirm({ title: `Throw away your changes to ${d.name} and load the latest version?`, body: e.message, confirmLabel: 'Load latest' })) { setDrafts(ds => { const n = { ...ds }; delete n[key!]; return n; }); await load(key); }
        } finally { setBusy(false); }
    }
    async function discard() {
        if (!key || !isDirty(key) || !(await confirm({ title: 'Throw away the unsaved changes to this building?', confirmLabel: 'Discard' }))) return;
        const wasNew = !original(key), k = key;
        setDrafts(ds => { const n = { ...ds }; delete n[k]; return n; }); if (wasNew) setKey(saved[0] ? keyOf(saved[0]) : null);
    }
    async function del() {
        const d = cur!;
        if (!d.id) { setDrafts(ds => { const n = { ...ds }; delete n[key!]; return n; }); setKey(saved[0] ? keyOf(saved[0]) : null); return; }
        const n = await slipsUsing(d.name);
        if (!(await confirm({ title: `Delete building ${d.name} with ${d.rooms.length} rooms?`, body: n ? `${n} slip(s) are for this building; they are not deleted, but capacities for it will come from old slips again.` : undefined, confirmLabel: 'Delete' }))) return;
        try { await guard(r.removeBuilding(original(key))); setDrafts(ds => { const x = { ...ds }; delete x[key!]; return x; }); await load(null); } catch (e: any) { setMsg(e.message || String(e)); }
    }
    const todoSeed = seed.filter(s => { const b = saved.find(x => x.name === s.name); return !b || !b.rooms.length; });
    async function runSeed() {
        if (!(await confirm({ title: `Create ${todoSeed.map(s => s.name).join(', ')} with their rooms and bed counts?`, confirmLabel: 'Create' }))) return;
        setBusy(true);
        try {
            for (const [i, s] of todoSeed.entries()) {
                const existing = saved.find(x => x.name === s.name);
                const rooms = (s.rooms as Row[]).map(x => ({ room_no: x.room_no, floor: r.floorOf(x.room_no), capacity: x.capacity, type: '', notes: x.capacity ? '' : 'no beds in the original list', active: true })).sort((a, b) => natural(a.room_no, b.room_no));
                await guard(r.saveBuilding(existing ? { ...existing, rooms } : { site: siteId, name: s.name, sort: i, notes: '', rooms }));
            }
            await load(); setNotice({ t: `Created ${todoSeed.length} building(s) from the room lists.`, bad: false });
        } catch (e: any) { setMsg(e.message || String(e)); } finally { setBusy(false); }
    }

    const setRoom = (i: number, k: keyof Room, v: any) => upd(d => { d.rooms[i][k] = v; });
    const totalAll = entries.reduce((n, b) => n + b.rooms.length, 0);
    const stats = cur ? (() => { const act = (cur.rooms as Room[]).filter(x => x.active !== false); return { active: act.length, floors: new Set((cur.rooms as Room[]).map(floorOf)).size, zero: act.filter(x => !x.capacity).length }; })() : null;
    if (!ready) return <div className="mx-auto max-w-[2400px] p-4 text-sm text-muted-foreground">Loading…</div>;
    const fld = (label: string, el: React.ReactNode, cls = '') => <div className={cn('grid gap-1', cls)}><Label>{label}</Label>{el}</div>;
    return (
        <div className="mx-auto grid grid-cols-[minmax(0,1fr)] max-w-[2400px] min-w-0 gap-3 px-3 pb-10 pt-4 sm:px-4">
            <header className="grid gap-1"><h1 className="text-2xl font-bold text-primary">Rooms &amp; Buildings — {site.label}</h1>
                <p className="text-sm text-muted-foreground">Every building, room and bed count for this site. Slip, Forecast, Grid, Timeline and Home read capacities from here.</p>
                {notice && <p className={cn('rounded-md border px-3 py-2 text-sm', notice.bad ? 'border-destructive bg-destructive/10 text-destructive' : 'bg-accent')}>{notice.t}</p>}</header>
            {todoSeed.length > 0 && !off && <Card className="flex-row flex-wrap items-center justify-between gap-3 p-4"><div><h3 className="font-bold">Start from the original room lists</h3>
                <p className="text-sm text-muted-foreground">{todoSeed.map(s => `${s.name} (${s.rooms.length} rooms, ${(s.rooms as Row[]).reduce((n, x) => n + x.capacity, 0)} beds)`).join(' · ')} — from the original PMS room lists. Everything stays editable afterwards.</p></div>
                <Button disabled={busy} onClick={() => void runSeed()}>Create from room lists</Button></Card>}

            <div className="grid items-start gap-3 lg:grid-cols-[16rem_minmax(0,1fr)]">
                <Card className="gap-2 p-3">
                    <div className="flex items-center justify-between"><h3 className="font-bold">Buildings</h3>{writable && r.roomsState.serverSupportsRooms && <Button size="sm" variant="outline" onClick={newBuilding}><Plus className="size-3.5" />Building</Button>}</div>
                    <select className={cn(sel, 'lg:hidden')} aria-label="Building" value={key ?? ''} onChange={e => setKey(e.target.value)}>{entries.map(b => <option key={keyOf(b)} value={keyOf(b)}>{b.name}{isDirty(keyOf(b)) ? ' • unsaved' : ''} ({b.rooms.length} rooms)</option>)}</select>
                    <ul className="hidden gap-1 lg:grid">{entries.length ? entries.map(b => { const k = keyOf(b); return <li key={k}><button type="button" aria-current={k === key} className={cn('grid w-full rounded-lg border px-3 py-2 text-left text-sm hover:bg-accent', k === key && 'border-gold bg-accent')} onClick={() => setKey(k)}>
                        <b>{b.name || '(unnamed)'}{isDirty(k) && <em className="ml-2 text-xs font-normal text-warn">unsaved</em>}</b><span className="text-xs text-muted-foreground">{b.rooms.length} rooms · {r.totalBeds(b)} beds</span></button></li>; }) : <li className="text-sm text-muted-foreground">No buildings yet.</li>}</ul>
                    <div className="text-xs text-muted-foreground">{entries.length ? `${site.label}: ${entries.length} buildings · ${totalAll} rooms · ${entries.reduce((n, b) => n + r.totalBeds(b), 0)} beds` : ''}</div>
                </Card>

                {!cur ? <Card className="p-6 text-sm text-muted-foreground">Choose a building on the left, or add one.</Card> : (
                    <Card className="gap-3 p-4">
                        <div className="flex flex-wrap items-end gap-3">
                            {fld('Building name', <Input maxLength={40} autoComplete="off" disabled={off} value={cur.name} onChange={e => upd(d => { d.name = e.target.value.toUpperCase(); })} />, 'min-w-48 flex-1')}
                            {fld('Order', <Input type="number" step={1} className="w-24" disabled={off} value={cur.sort || 0} onChange={e => upd(d => { d.sort = Number(e.target.value) || 0; })} />)}
                            <div className="flex flex-wrap gap-1.5"><Badge variant="outline">{cur.rooms.length} rooms</Badge><Badge variant="outline">{stats!.active} active</Badge><Badge variant="outline"><b>{r.totalBeds(cur)}</b>&nbsp;beds</Badge><Badge variant="outline">{stats!.floors} floors</Badge>
                                {stats!.zero > 0 && <Badge variant="outline" className="border-warn text-warn">{stats!.zero} active with 0 beds</Badge>}{isDirty(key!) && <Badge variant="outline" className="border-warn text-warn">unsaved changes</Badge>}</div></div>
                        {fld('Notes', <Input maxLength={500} placeholder="e.g. entrance, lifts, contact at reception" disabled={off} value={cur.notes || ''} onChange={e => upd(d => { d.notes = e.target.value; })} />)}

                        <details open className="rounded-lg border p-2"><summary className="cursor-pointer font-bold">Add rooms</summary>
                            <div className="mt-2 flex flex-wrap items-end gap-2">
                                {fld('From', <Input className="w-24" placeholder="501" inputMode="numeric" disabled={off} value={gen.from} onChange={e => setGen(g => ({ ...g, from: e.target.value }))} />)}
                                {fld('To', <Input className="w-24" placeholder="520" inputMode="numeric" disabled={off} value={gen.to} onChange={e => setGen(g => ({ ...g, to: e.target.value }))} />)}
                                {fld('Beds', <Input type="number" min={0} max={50} className="w-20" disabled={off} value={gen.cap} onChange={e => setGen(g => ({ ...g, cap: Number(e.target.value) }))} />)}
                                {fld('Type', <select className={sel} disabled={off} value={gen.type} onChange={e => setGen(g => ({ ...g, type: e.target.value }))}><option value="">any</option><option value="gents">gents</option><option value="ladies">ladies</option><option value="family">family</option></select>)}
                                <Button variant="outline" disabled={off} onClick={genRange}>Add range</Button></div>
                            <p className="mt-1 text-xs text-muted-foreground">Numbers only: 501 to 520 adds 501, 502 … 520. Existing rooms are left as they are.</p></details>
                        <details className="rounded-lg border p-2"><summary className="cursor-pointer font-bold">Paste a list</summary>
                            <Textarea rows={4} className="mt-2" placeholder={'501:4, 502:3, 503:5\nor one per line: 1203A 2'} disabled={off} value={paste} onChange={e => setPaste(e.target.value)} />
                            <div className="mt-2 flex flex-wrap items-center gap-2"><Button variant="outline" disabled={off} onClick={pasteList}>Add / update from list</Button><span className="text-xs text-muted-foreground">Room and beds separated by : or space. Existing rooms get the new bed count.</span></div></details>

                        <div className="flex flex-wrap items-center gap-2">
                            <Input type="search" className="w-44" placeholder="Find room…" aria-label="Find room" value={f.q} onChange={e => setF(x => ({ ...x, q: e.target.value }))} />
                            <select className={sel} aria-label="Floor" value={f.floor} onChange={e => setF(x => ({ ...x, floor: e.target.value }))}><option value="">All floors</option>{floors.map(fl => <option key={fl} value={fl}>Floor {fl}</option>)}</select>
                            <span className="grow" /><span className="text-xs text-muted-foreground">{selected.size ? `${selected.size} selected` : ''}</span>
                            <Input type="number" min={0} max={50} className="w-24" placeholder="beds" aria-label="Beds for selected" disabled={off} value={selCap} onChange={e => setSelCap(e.target.value)} />
                            <Button variant="outline" size="sm" disabled={off} onClick={() => { const v = Number(selCap); if (!Number.isInteger(v) || v < 0 || v > 50) { setMsg('Enter beds 0–50.'); return; } forSelected(x => { x.capacity = v; }, `Beds set to ${v}`); }}>Set beds</Button>
                            <Button variant="outline" size="sm" disabled={off} onClick={() => forSelected(x => { x.active = true; }, 'Marked active')}>Active</Button>
                            <Button variant="outline" size="sm" disabled={off} onClick={() => forSelected(x => { x.active = false; }, 'Marked inactive')}>Inactive</Button>
                            <Button variant="outline" size="sm" className="text-destructive" disabled={off} onClick={async () => { if (!selected.size) { setMsg('Tick the rooms first.'); return; } if (!(await confirm({ title: `Remove ${selected.size} room(s) from ${cur.name}?`, confirmLabel: 'Remove' }))) return; const s = selected; upd(d => { d.rooms = d.rooms.filter((_: Room, i: number) => !s.has(i)); }); setSelected(new Set()); }}>Delete</Button></div>

                        <div className="overflow-x-auto"><table className="w-full text-sm">
                            <thead><tr className="border-b text-left"><th className="w-9 p-1"><Checkbox aria-label="Select all shown" checked={visible.length > 0 && visible.every(i => selected.has(i))} onCheckedChange={v => setSelected(s => { const n = new Set(s); visible.forEach(i => (v === true ? n.add(i) : n.delete(i))); return n; })} /></th><th className="p-1">Room</th><th className="p-1">Floor</th><th className="p-1">Beds</th><th className="p-1">Type</th><th className="p-1">Notes</th><th className="p-1">Active</th><th /></tr></thead>
                            <tbody>{visible.length ? visible.map(i => { const x = cur.rooms[i] as Room; const changed = original(key) && before.get(r.normRoom(x.room_no)) !== JSON.stringify(x);
                                return <tr key={i} className={cn('border-b', x.active === false && 'opacity-55', changed && 'bg-accent/50', bad.has(i) && 'bg-destructive/15')}>
                                    <td className="p-1"><Checkbox aria-label={`Select room ${x.room_no}`} checked={selected.has(i)} onCheckedChange={v => setSelected(s => { const n = new Set(s); if (v === true) n.add(i); else n.delete(i); return n; })} /></td>
                                    <td className="p-1"><Input className="h-8 w-28" maxLength={12} aria-label="Room number" disabled={off} value={x.room_no} onChange={e => setRoom(i, 'room_no', e.target.value.trim())} /></td>
                                    <td className="p-1"><Input className="h-8 w-20" maxLength={10} placeholder={r.floorOf(x.room_no)} aria-label="Floor" disabled={off} value={x.floor} onChange={e => setRoom(i, 'floor', e.target.value)} /></td>
                                    <td className="p-1"><Input type="number" min={0} max={50} className="h-8 w-20" aria-label="Beds" disabled={off} value={x.capacity} onChange={e => setRoom(i, 'capacity', e.target.value === '' ? 0 : Math.max(0, Math.min(50, Math.round(Number(e.target.value)) || 0)))} /></td>
                                    <td className="p-1"><select className={cn(sel, 'h-8')} aria-label="Type" disabled={off} value={x.type || ''} onChange={e => setRoom(i, 'type', e.target.value)}>{TYPES.map(t => <option key={t} value={t}>{t || 'any'}</option>)}</select></td>
                                    <td className="p-1"><Input className="h-8 min-w-40" maxLength={200} aria-label="Notes" disabled={off} value={x.notes} onChange={e => setRoom(i, 'notes', e.target.value)} /></td>
                                    <td className="p-1"><Checkbox aria-label="Active" disabled={off} checked={x.active !== false} onCheckedChange={v => setRoom(i, 'active', v === true)} /></td>
                                    <td className="p-1"><Button size="icon" variant="ghost" className="size-7" title="Remove room" aria-label="Remove room" disabled={off} onClick={() => { upd(d => { d.rooms.splice(i, 1); }); setSelected(new Set()); }}><X className="size-4" /></Button></td></tr>; })
                                : <tr><td colSpan={8} className="p-2 text-muted-foreground">{cur.rooms.length ? 'No room matches the filter.' : 'No rooms yet — use “Add rooms”.'}</td></tr>}</tbody></table></div>
                        <div><Button variant="outline" size="sm" disabled={off} onClick={() => { upd(d => { d.rooms.push({ room_no: '', floor: '', capacity: 0, type: '', notes: '', active: true }); }); setF({ q: '', floor: '' }); }}><Plus className="size-3.5" />Room</Button></div>

                        <details className="rounded-lg border p-2" open={mapOpen} onToggle={e => setMapOpen((e.target as HTMLDetailsElement).open)}><summary className="cursor-pointer font-bold">Floor map</summary>
                            {mapOpen && (() => { const by = new Map<string, Room[]>(); for (const x of cur.rooms as Room[]) { const fl = floorOf(x) || '?'; (by.get(fl) ?? by.set(fl, []).get(fl)!).push(x); }
                                return <div className="mt-2 grid gap-2">{by.size ? [...by.keys()].sort(natural).map(fl => <div key={fl}><b className="text-sm">Floor {fl}</b><div className="mt-1 flex flex-wrap gap-1">{by.get(fl)!.sort((a, b) => natural(a.room_no, b.room_no)).map((x, i) => <span key={i} title={`${x.type || 'any'}${x.notes ? ' — ' + x.notes : ''}`} className={cn('rounded-md border px-2 py-0.5 text-xs', x.active === false && 'opacity-50', x.type === 'gents' && 'bg-blue-50', x.type === 'ladies' && 'bg-pink-50', x.type === 'family' && 'bg-green-50')}>{x.room_no} · {x.capacity}</span>)}</div></div>) : <p className="text-sm text-muted-foreground">No rooms.</p>}</div>; })()}</details>

                        <div className="sticky bottom-0 flex flex-wrap items-center gap-2 border-t bg-card py-2">
                            <Button disabled={off || busy} onClick={() => void saveIt()}>Save building</Button><Button variant="outline" disabled={off} onClick={() => void discard()}>Discard changes</Button>
                            <span className="grow text-sm text-muted-foreground">{msg || (cur.updated_by ? `Last saved by ${cur.updated_by}, ${new Date(cur.updated_at).toLocaleString()}` : (cur.id ? '' : 'Not saved yet'))}</span>
                            <Button variant="outline" className="text-destructive" disabled={off} onClick={() => void del()}>Delete building</Button></div>
                    </Card>)}
            </div>
            {confirmDialog}{promptDialog}
        </div>
    );
}
