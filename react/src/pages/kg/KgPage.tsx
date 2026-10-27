import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Archive, ClipboardCopy, Shuffle, Undo2, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useConfirm } from '@/components/ConfirmDialog';
import { cn } from '@/lib/utils';
import { useCore, useGuard, useSite } from '@/pms/PmsContext';
import { LOCATIONS, LS_FE1_BOOKMARK, LS_LOG, LS_PEOPLE, buildMessage, computeStats, drawHistogram, excelDoc, headerText, natural, nextBus, shortDate, sorter, whenTxt, ymd, type KgState, type LogEntry, type SortKey, type Tick } from './kg';

// KG — Fakkul Ehraam & Atraaf roster. The name list, FE1 bookmark and saved assignments are in the cloud, one roster per site (GET /api/kg, POST /api/kg/op,
// POST /api/kg/log, DELETE /api/kg/log/:id), so every desk of the site sees the same list and history. Ticks, bus numbers, the order and the message stay on this
// screen until saved. Order: random by default (shuffled once per visit); A–Z, last activity, most / least active, or fewest FE1 / FE2 / Atraaf first.
// Atraaf: each new tick gets the next bus number (highest given so far + 1), editable per row; the message shows it.

const TYPE_CLS: Record<string, string> = { FE1: 'bg-[#e3effb] text-[#1a5da8]', FE2: 'bg-[#e0f4ea] text-[#17784c]', Atraaf: 'bg-[#fbf0d6] text-[#8a6410]' };

export default function KgPage() {
    const { cloud, settings } = useCore();
    const guard = useGuard();
    const { site, siteId } = useSite();
    const { ask, dialog } = useConfirm();
    const writable = cloud.canWrite(siteId);
    const [state, setState] = useState<KgState>({ people: [], archived: [], bookmark: '', log: [] });
    const [loaded, setLoaded] = useState(false);
    const sig = useRef('');
    const [ticks, setTicks] = useState<Map<string, Tick>>(new Map());
    const ticksRef = useRef(ticks); ticksRef.current = ticks;
    const ranks = useRef(new Map<string, number>());
    const [shuffle, setShuffle] = useState(0);
    const rank = (n: string) => { if (!ranks.current.has(n)) ranks.current.set(n, Math.random()); return ranks.current.get(n)!; };
    const [sortBy, setSortBy] = useState<SortKey>('random'), [find, setFind] = useState(''), [newName, setNewName] = useState('');
    const [sessions, setSessions] = useState<{ name: string; time: string }[]>(settings.DEFAULTS.kg_sessions);
    const [session, setSession] = useState(''), [date, setDate] = useState(ymd(new Date()));
    const [message, setMessage] = useState('');
    const [recCount, setRecCount] = useState('3'), [recCount2, setRecCount2] = useState('3'), [bookmarkPick, setBookmarkPick] = useState('');
    const [profileOf, setProfileOf] = useState('');
    const [tab, setTab] = useState('msg');
    const canvas = useRef<HTMLCanvasElement>(null);
    const [oldList, setOldList] = useState<{ people: string[]; log: any[]; mark: string } | null>(null);

    useEffect(() => { void guard(settings.loadSettings()).then((s: any) => setSessions(s.settings.kg_sessions || settings.DEFAULTS.kg_sessions)).catch(() => { }); }, []);   // eslint-disable-line react-hooks/exhaustive-deps
    const sessionLabel = (s: { name: string; time: string }) => `${s.name} ${settings.to12h(s.time)}`;
    useEffect(() => { if (!session && sessions[0]) setSession(sessionLabel(sessions[0])); }, [sessions]);   // eslint-disable-line react-hooks/exhaustive-deps

    /* ------------------------------ state from the cloud ------------------------------ */
    const q = useQuery({ queryKey: ['kg', siteId], queryFn: async () => (await guard(cloud.request('GET', `/api/kg?site=${siteId}`))) as KgState, refetchInterval: () => document.visibilityState === 'visible' ? 30_000 : false });
    const apply = useCallback((s: KgState) => {
        const sg = JSON.stringify([s.people, s.archived, s.bookmark, s.log.length, s.log[s.log.length - 1]?.id]);
        if (sg === sig.current) return;
        sig.current = sg;
        setState(s); setLoaded(true);
        setTicks(t => { const n = new Map(t); for (const k of [...n.keys()]) if (!s.people.includes(k)) n.delete(k); return n; });
    }, []);
    useEffect(() => { if (q.data) apply(q.data); }, [q.data, apply]);
    useEffect(() => { if (q.isError) toast.error(q.error instanceof cloud.UserError ? q.error.message : 'Could not load the KG list.'); }, [q.isError]);   // eslint-disable-line react-hooks/exhaustive-deps

    // a write, then the new state; a refused write says why
    async function write<T>(call: () => Promise<T>): Promise<T | null> {
        if (!writable) { toast(`This login can only view the ${site.label} KG list.`); return null; }
        try { const s: any = await guard(call()); if (s && Array.isArray(s.people)) apply(s); return s; }
        catch (e) { toast.error(e instanceof cloud.UserError ? e.message : 'Could not save. Check the connection.'); return null; }
    }
    const op = (name: string, kind: string, done?: string) => write(() => cloud.request('POST', '/api/kg/op', { site: siteId, op: kind, name })).then(s => { if (s && done) toast(done); return s; });

    const { people, archived = [], bookmark = '', log: history } = state;
    const stats = useMemo(() => computeStats(people, history), [people, history]);
    const st = (n: string) => stats.get(n) || { FE1: 0, FE2: 0, Atraaf: 0, total: 0, last: '', lastFE1: '' };
    const ordered = useMemo(() => [...people].sort(sorter(sortBy, st, rank)), [people, sortBy, stats, shuffle]);   // eslint-disable-line react-hooks/exhaustive-deps
    const fe1Order = useMemo(() => [...people].sort(sorter('FE1', st, rank)), [people, stats]);   // eslint-disable-line react-hooks/exhaustive-deps

    /* ------------------------------------ ticks and message ------------------------------------ */
    const edit = (name: string, fn: (t: Tick) => void) => setTicks(m => { const n = new Map(m); const t = { ...(n.get(name) || { type: new Set<string>(), location: '', bus: '' }) }; t.type = new Set(t.type); fn(t); n.set(name, t); return n; });
    const tickedCount = [...ticks.values()].filter(t => t.type.size).length;
    const header = headerText(session, date);
    // the message follows the ticks; a new event or date rewrites only its first three lines (keeps hand edits below)
    const lastHeader = useRef(header);
    useEffect(() => { setMessage(buildMessage(header, ticks)); lastHeader.current = header; }, [ticks]);   // eslint-disable-line react-hooks/exhaustive-deps
    useEffect(() => {
        const lines = message.split('\n');
        if (lines.length < 3) { setMessage(buildMessage(header, ticks)); }
        else { lines.splice(0, 3, ...header.split('\n')); setMessage(lines.join('\n')); }
        lastHeader.current = header;
    }, [header]);   // eslint-disable-line react-hooks/exhaustive-deps
    const toggleType = (name: string, type: string, on: boolean) => edit(name, t => {
        if (on) t.type.add(type); else t.type.delete(type);
        if (type === 'Atraaf' && on && !t.bus) t.bus = nextBus(ticksRef.current);
    });
    const markFE1 = (names: string[]) => setTicks(m => { const n = new Map(m); for (const name of names) { const t = { ...(n.get(name) || { type: new Set<string>(), location: '', bus: '' }) }; t.type = new Set(t.type).add('FE1'); n.set(name, t); } return n; });

    async function save() {
        const now = new Date();
        let ts = now.toISOString();
        if (date && date !== ymd(now)) { const [y, m, d] = date.split('-').map(Number); ts = new Date(y, m - 1, d, now.getHours(), now.getMinutes(), now.getSeconds()).toISOString(); }
        const entries: any[] = [];
        for (const [name, t] of ticks) for (const type of t.type) entries.push({ ts, person: name, type, location: t.location || '' });
        if (!entries.length) { toast('Nothing ticked yet.'); return; }
        const s: any = await write(() => cloud.request('POST', '/api/kg/log', { site: siteId, entries }));
        if (s) { setTicks(new Map()); toast(`Saved ${s.added} assignment${s.added === 1 ? '' : 's'}${s.added < entries.length ? ` (${entries.length - s.added} were already saved)` : ''}.`); }
    }
    async function copy() {
        const text = message.trim();
        if (!text) { toast('Nothing to copy.'); return; }
        try { await navigator.clipboard.writeText(text); } catch { const ta = document.createElement('textarea'); ta.value = text; document.body.append(ta); ta.select(); document.execCommand('copy'); ta.remove(); }
        toast('Copied — paste it into the group.');
    }
    async function addPerson() {
        const name = newName.trim();
        if (!name) { toast('Type a name first.'); return; }
        if (people.includes(name)) { toast('That name is already in the list.'); return; }
        if (await op(name, 'add-person', `${name} added.`)) setNewName('');
    }
    async function archive(name: string) {
        if (!await ask({ title: `Archive ${name}?`, confirmLabel: 'Archive', body: `Archive ${name}? They stay out of the assignment list but keep their record and history — restore them any time from "Archived".` })) return;
        setTicks(m => { const n = new Map(m); n.delete(name); return n; });
        void op(name, 'archive-person', `${name} archived.`);
    }
    async function removeFromRoster(name: string) {
        if (!await ask({ title: `Remove ${name}?`, confirmLabel: 'Remove', body: `Remove ${name} from the roster entirely? Their saved assignments stay in the records, but the name is taken off the list. (Use Restore instead to keep them.)` })) return;
        void op(name, 'remove-person', `${name} removed from the roster.`);
    }
    const saveBookmark = (name: string) => void write(() => cloud.request('POST', '/api/kg/op', { site: siteId, op: 'bookmark', name }));
    function tickNext() {
        if (!people.length) { toast('No people to assign.'); return; }
        const n = Math.max(1, parseInt(recCount2 || '3', 10));
        const start = bookmark ? people.indexOf(bookmark) : -1, chosen: string[] = [];
        for (let i = 1; i <= people.length && chosen.length < n; i++) chosen.push(people[(start + i) % people.length]);
        markFE1(chosen);
        if (chosen.length) saveBookmark(chosen[chosen.length - 1]);
    }

    /* ------------------------------------ stats and history ------------------------------------ */
    const today = ymd(new Date());
    const isToday = (ts: string) => ymd(new Date(ts)) === today;
    const kpi = (t: string) => history.filter(h => h.type === t && isToday(h.ts)).length;
    useEffect(() => { if (tab === 'stats' && canvas.current) drawHistogram(canvas.current, people, st); }, [tab, people, stats]);   // eslint-disable-line react-hooks/exhaustive-deps
    useEffect(() => { const h = () => { if (tab === 'stats' && canvas.current) drawHistogram(canvas.current, people, st); }; window.addEventListener('resize', h); return () => window.removeEventListener('resize', h); }, [tab, people, stats]);   // eslint-disable-line react-hooks/exhaustive-deps
    const names = useMemo(() => [...new Set([...people, ...history.map(h => h.person)])].sort(natural), [people, history]);
    const sorted = useMemo(() => [...history].sort((a, b) => b.ts.localeCompare(a.ts)), [history]);
    const mine = profileOf ? sorted.filter(h => h.person === profileOf) : [];
    async function delEntry(r: LogEntry) {
        if (!await ask({ title: 'Delete this entry?', confirmLabel: 'Delete', body: `Delete ${r.person}'s ${r.type} on ${whenTxt(r.ts)}?` })) return;
        const s = await write(() => cloud.request('DELETE', `/api/kg/log/${r.id}?site=${siteId}`));
        if (s) toast('Assignment deleted.');
    }
    const DelBtn = ({ r }: { r: LogEntry }) => <Button variant="ghost" size="icon" className="size-8" aria-label={`Delete ${r.type} on ${whenTxt(r.ts)}`} onClick={() => void delEntry(r)}><X className="size-4" /></Button>;
    function download(name: string, blob: Blob) { const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 2000); }
    async function uploadLog(entries: any[]) {
        let added = 0;
        for (let i = 0; i < entries.length; i += 400) { const s: any = await write(() => cloud.request('POST', '/api/kg/log', { site: siteId, entries: entries.slice(i, i + 400) })); if (!s) break; added += s.added; }
        return added;
    }
    function importJson() {
        const inp = document.createElement('input'); inp.type = 'file'; inp.accept = 'application/json';
        inp.onchange = async (e: any) => {
            const file = e.target.files[0]; if (!file) return;
            let data: any = []; try { data = JSON.parse(await file.text()); } catch { toast('That file is not valid JSON.'); return; }
            const entries = (Array.isArray(data) ? data : []).filter((r: any) => r && r.ts && r.person && r.type).map((r: any) => ({ ts: r.ts, person: r.person, type: r.type, location: r.location || '' }));
            if (!entries.length) { toast('No entries in that file.'); return; }
            const added = await uploadLog(entries); toast(`Imported ${added} new entr${added === 1 ? 'y' : 'ies'}.`);
        };
        inp.click();
    }
    async function reset() {
        if (!await ask({ title: 'Reset everything?', confirmLabel: 'Wipe everything', body: `Wipe ALL saved history and the names for ${site.label}? Every desk of this site loses them.` })) return;
        void op('', 'reset', 'Everything was reset.');
    }

    // this browser's list from before the cloud: offer to move it once
    useEffect(() => {
        if (!loaded || !writable) return;
        let p: string[] = [], l: any[] = [];
        try { p = JSON.parse(localStorage.getItem(LS_PEOPLE) || '[]') || []; } catch { /* none */ }
        try { l = JSON.parse(localStorage.getItem(LS_LOG) || '[]') || []; } catch { /* none */ }
        const mark = (() => { try { return localStorage.getItem(LS_FE1_BOOKMARK) || ''; } catch { return ''; } })();
        if (p.length || l.length) setOldList({ people: p, log: l, mark });
    }, [loaded, writable]);
    async function moveOld() {
        if (!oldList) return;
        for (const n of oldList.people) if (!people.includes(n)) await write(() => cloud.request('POST', '/api/kg/op', { site: siteId, op: 'add-person', name: n }));
        if (oldList.mark && !bookmark) await write(() => cloud.request('POST', '/api/kg/op', { site: siteId, op: 'bookmark', name: oldList.mark }));
        const entries = oldList.log.filter(r => r && r.ts && r.person && r.type).map(r => ({ ts: r.ts, person: r.person, type: r.type, location: r.location || '' }));
        const added = await uploadLog(entries);
        [LS_PEOPLE, LS_LOG, LS_FE1_BOOKMARK].forEach(k => { try { localStorage.removeItem(k); } catch { /* ignore */ } });
        setOldList(null); toast(`Moved: ${oldList.people.length} names, ${added} new assignments.`);
    }

    const qq = find.trim().toLowerCase();
    return (
        <div className="mx-auto grid grid-cols-[minmax(0,1fr)] max-w-[1400px] min-w-0 gap-3 px-3 pb-10 pt-4 sm:px-4">
            {oldList && <div className="flex flex-wrap items-center gap-2 rounded-xl border border-gold bg-accent p-3 text-sm"><span className="min-w-0 flex-1">This browser still has its own KG list from before ({oldList.people.length} name{oldList.people.length === 1 ? '' : 's'}, {oldList.log.length} saved assignment{oldList.log.length === 1 ? '' : 's'}). Move it to the {site.label} cloud list so every desk sees it?</span><Button size="sm" onClick={() => void moveOld()}>Move to cloud</Button><Button size="sm" variant="outline" onClick={() => setOldList(null)}>Not now</Button></div>}
            <header className="flex flex-wrap items-end justify-between gap-3">
                <div><h1 className="text-2xl font-bold text-primary">Fakkul Ehraam &amp; Atraaf</h1><p className="text-sm text-muted-foreground">Tick who goes, pick a floor, copy the message. Saving logs it for the counts.</p></div>
                <div className="flex flex-wrap gap-3">
                    <div className="grid gap-1"><Label htmlFor="sessionTitle">Event</Label>
                        <Select value={session} onValueChange={setSession}><SelectTrigger id="sessionTitle" className="min-w-56"><SelectValue /></SelectTrigger><SelectContent>{sessions.map((s, i) => <SelectItem key={i} value={sessionLabel(s)}>{sessionLabel(s)}</SelectItem>)}</SelectContent></Select></div>
                    <div className="grid gap-1"><Label htmlFor="sessionDate">Date</Label><Input id="sessionDate" type="date" value={date} onChange={e => setDate(e.target.value)} /></div>
                </div>
            </header>

            <div className="grid min-w-0 items-start gap-3 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
                <Card className="min-w-0"><CardContent className="grid gap-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-2">
                            <Select value={sortBy} onValueChange={v => setSortBy(v as SortKey)}><SelectTrigger className="w-60" aria-label="Order"><SelectValue /></SelectTrigger>
                                <SelectContent>{([['random', 'Random'], ['az', 'A – Z'], ['last', 'Last activity'], ['most', 'Most active'], ['least', 'Least active'], ['FE1', 'Fakkul Ehraam 1 (fewest first)'], ['FE2', 'Fakkul Ehraam 2 (fewest first)'], ['Atraaf', 'Atraaf (fewest first)']] as const).map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}</SelectContent></Select>
                            <Button variant="outline" title="A new random order" onClick={() => { ranks.current.clear(); setSortBy('random'); setShuffle(x => x + 1); }}><Shuffle className="size-4" />Shuffle</Button>
                            <Input type="search" className="w-40" placeholder="Find name…" aria-label="Find name" autoComplete="off" value={find} onChange={e => setFind(e.target.value)} />
                        </div>
                        <div className="flex flex-wrap items-center gap-2"><Badge variant="secondary">{tickedCount} ticked</Badge><Button variant="outline" title="Untick everything" onClick={() => setTicks(new Map())}>Clear ticks</Button><Button onClick={() => void save()}>Save assignment</Button></div>
                    </div>
                    <div className="grid gap-1.5">
                        {ordered.length ? ordered.map((name, i) => {
                            if (qq && !name.toLowerCase().includes(qq)) return null;
                            const t = ticks.get(name), s = st(name), on = !!t && t.type.size > 0;
                            return (
                                <div key={name} className={cn('grid items-center gap-2 rounded-lg border bg-white p-2 sm:grid-cols-[2rem_minmax(0,1.6fr)_auto_auto_auto_minmax(0,11rem)_auto]', on && 'border-gold bg-accent/50')}>
                                    <span className="text-xs text-muted-foreground">{i + 1}</span>
                                    <div className="min-w-0"><b className="break-words">{name}</b>
                                        <span className="flex flex-wrap gap-x-2 text-[11px] text-muted-foreground"><i title="Fakkul Ehraam 1">FE1 {s.FE1}</i><i title="Fakkul Ehraam 2">FE2 {s.FE2}</i><i title="Fakkul Ehraam total (FE1 + FE2)">FE total {s.FE1 + s.FE2}</i><i title="Atraaf">AT {s.Atraaf}</i><i title="Last activity">{shortDate(s.last)}</i></span></div>
                                    {(['FE1', 'FE2'] as const).map(k => <label key={k} className="flex items-center gap-1.5 text-sm"><Checkbox checked={!!t?.type.has(k)} onCheckedChange={v => toggleType(name, k, v === true)} />{k}</label>)}
                                    <div className="flex items-center gap-1.5"><label className="flex items-center gap-1.5 text-sm"><Checkbox checked={!!t?.type.has('Atraaf')} onCheckedChange={v => toggleType(name, 'Atraaf', v === true)} />Atraaf</label>
                                        {t?.type.has('Atraaf') && <Input className="h-8 w-16" maxLength={6} placeholder="Bus" aria-label={`Bus number for ${name}`} value={t.bus} onChange={e => edit(name, x => { x.bus = e.target.value.trim(); })} />}</div>
                                    <Select value={t?.location || 'none'} onValueChange={v => edit(name, x => { x.location = v === 'none' ? '' : v; })}><SelectTrigger className="h-8 w-full" aria-label={`Location for ${name}`}><SelectValue placeholder="Location…" /></SelectTrigger>
                                        <SelectContent><SelectItem value="none">Location…</SelectItem>{LOCATIONS.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent></Select>
                                    <Button variant="ghost" size="icon" className="size-8" title={`Archive ${name} — keeps the record, hides them from assignment`} aria-label={`Archive ${name}`} onClick={() => void archive(name)}><Archive className="size-4" /></Button>
                                </div>
                            );
                        }) : <p className="p-3 text-center text-muted-foreground">{loaded ? 'No names yet — add the first one below.' : 'Loading…'}</p>}
                    </div>
                    {archived.length > 0 && (
                        <details className="rounded-lg border bg-white p-2.5"><summary className="cursor-pointer text-sm font-semibold">Archived <Badge variant="secondary">{archived.length}</Badge></summary>
                            <p className="my-2 text-xs text-muted-foreground">Hidden from the assignment list; their saved history is kept. Restore to assign them again.</p>
                            <ul className="grid gap-1">{[...archived].sort(natural).map(n => { const s = st(n); return (
                                <li key={n} className="flex flex-wrap items-center gap-2 text-sm"><span className="font-semibold">{n}</span><small className="min-w-0 flex-1 text-muted-foreground">FE1 {s.FE1} · FE2 {s.FE2} · AT {s.Atraaf}{s.last ? ` · last ${shortDate(s.last)}` : ' · no history'}</small>
                                    <Button size="sm" variant="outline" onClick={() => void op(n, 'unarchive-person', `${n} restored.`)}><Undo2 className="size-3.5" />Restore</Button>
                                    <Button size="icon" variant="ghost" className="size-8" title={`Take ${n} off the roster entirely (saved history still kept)`} aria-label={`Remove ${n} from the roster`} onClick={() => void removeFromRoster(n)}><X className="size-4" /></Button></li>); })}</ul></details>
                    )}
                    <div className="flex gap-2"><Input placeholder="Add a person, e.g. M Taha Kamlapur" autoComplete="off" value={newName} onChange={e => setNewName(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); void addPerson(); } }} /><Button variant="outline" onClick={() => void addPerson()}>➕ Add</Button></div>
                </CardContent></Card>

                <Card className="min-w-0"><CardContent>
                    <Tabs value={tab} onValueChange={setTab}>
                        <TabsList className="flex h-auto flex-wrap"><TabsTrigger value="msg">✉️ Message</TabsTrigger><TabsTrigger value="fe1">⚖️ FE1 helper</TabsTrigger><TabsTrigger value="stats">📊 Stats</TabsTrigger><TabsTrigger value="hist">🕘 History</TabsTrigger></TabsList>

                        <TabsContent value="msg" className="grid gap-2 pt-3">
                            <div className="flex items-center justify-between"><h2 className="font-bold text-primary">Message</h2><Button onClick={() => void copy()}><ClipboardCopy className="size-4" />Copy</Button></div>
                            <Textarea rows={14} spellCheck={false} className="min-h-72 font-mono text-sm" value={message} onChange={e => setMessage(e.target.value)} />
                            <p className="text-xs text-muted-foreground">Names are numbered under each floor; Atraaf names carry their bus. FE1 / FE2 are not shown in the message. You can edit the text before copying.</p>
                        </TabsContent>

                        <TabsContent value="fe1" className="grid gap-3 pt-3">
                            <h2 className="font-bold text-primary">FE1 balance helper</h2>
                            <div className="grid gap-1.5"><p className="text-xs text-muted-foreground">Tick FE1 for the people with the fewest FE1 (ties: longest since their last FE1).</p>
                                <div className="flex gap-2"><Input type="number" min={1} step={1} className="w-20" aria-label="How many" value={recCount} onChange={e => setRecCount(e.target.value)} /><Button variant="outline" onClick={() => markFE1(fe1Order.slice(0, Math.max(1, parseInt(recCount || '3', 10))))}>Tick lowest FE1</Button></div></div>
                            <div className="grid gap-1.5"><p className="text-xs text-muted-foreground">Or go round the list: tick the next N after the bookmark, then move the bookmark on.</p>
                                <div className="flex gap-2"><Select value={bookmarkPick || bookmark || 'none'} onValueChange={v => setBookmarkPick(v === 'none' ? '' : v)}><SelectTrigger className="w-full" aria-label="Bookmark"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="none">— choose —</SelectItem>{people.map(n => <SelectItem key={n} value={n}>{n}</SelectItem>)}</SelectContent></Select>
                                    <Button variant="ghost" onClick={() => { const v = bookmarkPick || bookmark; if (!v) { toast('Pick a name to bookmark.'); return; } if (!people.includes(v)) { toast('That name is not in the list.'); return; } saveBookmark(v); }}>Set bookmark</Button></div>
                                <div className="flex flex-wrap items-center gap-2"><Input type="number" min={1} step={1} className="w-20" aria-label="How many" value={recCount2} onChange={e => setRecCount2(e.target.value)} /><Button variant="outline" onClick={tickNext}>Tick next N</Button><span className="text-xs text-muted-foreground">Bookmark: {bookmark || '—'}</span></div></div>
                            <h3 className="font-bold">FE1 so far <span className="text-xs font-normal text-muted-foreground">fewest first</span></h3>
                            <ol className="grid gap-1 text-sm">{fe1Order.map(n => <li key={n} className="flex items-center gap-2 rounded border bg-white px-2 py-1"><span className="min-w-0 flex-1 truncate">{n}</span><b>{st(n).FE1}</b><small className="text-muted-foreground">{shortDate(st(n).lastFE1)}</small></li>)}</ol>
                        </TabsContent>

                        <TabsContent value="stats" className="grid gap-3 pt-3">
                            <h2 className="font-bold text-primary">Today</h2>
                            <div className="grid grid-cols-4 gap-2 text-center">{[['FE1', kpi('FE1')], ['FE2', kpi('FE2')], ['Atraaf', kpi('Atraaf')], ['All time', history.length]].map(([l, v]) => <div key={l} className="rounded-lg border bg-white p-2"><b className="block text-xl">{v}</b><span className="text-xs text-muted-foreground">{l}</span></div>)}</div>
                            <h3 className="font-bold">Per person <span className="text-xs font-normal text-muted-foreground"><i className="mx-1 inline-block size-2.5 rounded-sm bg-[#2e7dd1]" />FE1 <i className="mx-1 inline-block size-2.5 rounded-sm bg-[#23a56b]" />FE2 <i className="mx-1 inline-block size-2.5 rounded-sm bg-[#e3a92b]" />Atraaf</span></h3>
                            <canvas ref={canvas} className="h-64 w-full rounded-lg border" />
                            <div className="flex flex-wrap gap-2">
                                <Button onClick={() => download('Assignments_FE_AT.xls', new Blob([excelDoc(people, history, session, date)], { type: 'application/vnd.ms-excel' }))}>⬇ Excel (.xls)</Button>
                                <Button variant="outline" onClick={() => download('umrah-atraaf-history.json', new Blob([JSON.stringify(history, null, 2)], { type: 'application/json' }))}>Export JSON</Button>
                                <Button variant="outline" onClick={importJson}>Import JSON</Button>
                                <Button variant="destructive" onClick={() => void reset()}>Reset all</Button>
                            </div>
                            <p className="text-xs text-muted-foreground">Export / import cover the saved history. Reset wipes the history and the names for every desk of this site.</p>
                        </TabsContent>

                        <TabsContent value="hist" className="grid gap-3 pt-3">
                            <div className="flex items-center justify-between gap-2"><h2 className="font-bold text-primary">Saved assignments</h2>
                                <Select value={profileOf || 'all'} onValueChange={v => setProfileOf(v === 'all' ? '' : v)}><SelectTrigger className="w-48" aria-label="Show one person"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Everyone</SelectItem>{names.map(n => <SelectItem key={n} value={n}>{n}</SelectItem>)}</SelectContent></Select></div>
                            {!profileOf ? (
                                <div className="max-h-[28rem] overflow-auto rounded-lg border"><Table>
                                    <TableHeader><TableRow><TableHead>When</TableHead><TableHead>Type</TableHead><TableHead>Person</TableHead><TableHead>Location</TableHead><TableHead /></TableRow></TableHeader>
                                    <TableBody>{sorted.length ? sorted.map(r => <TableRow key={r.id}><TableCell className="whitespace-nowrap">{whenTxt(r.ts)}</TableCell><TableCell><span className={cn('rounded-full px-2 py-0.5 text-xs font-bold', TYPE_CLS[r.type])}>{r.type}</span></TableCell>
                                        <TableCell><button type="button" className="font-semibold text-primary underline" title={`Open ${r.person}'s profile`} onClick={() => setProfileOf(r.person)}>{r.person}</button></TableCell><TableCell>{r.location || ''}</TableCell><TableCell><DelBtn r={r} /></TableCell></TableRow>) : <TableRow><TableCell colSpan={5} className="text-muted-foreground">Nothing saved yet.</TableCell></TableRow>}</TableBody></Table></div>
                            ) : (() => {
                                const c = (k: string) => mine.filter(h => h.type === k).length;
                                return <div className="grid gap-3">
                                    <div className="flex items-center gap-3"><Button variant="outline" onClick={() => setProfileOf('')}>← Everyone</Button>
                                        <div><h3 className="text-lg font-bold">{profileOf}</h3><p className="text-xs text-muted-foreground">{mine.length ? `${mine.length} assignment${mine.length === 1 ? '' : 's'} · first ${whenTxt(mine[mine.length - 1].ts)} · last ${whenTxt(mine[0].ts)}` : 'No saved assignments yet.'}{people.includes(profileOf) ? '' : archived.includes(profileOf) ? ' · archived' : ' · no longer in the name list'}</p></div></div>
                                    <div className="grid grid-cols-4 gap-2 text-center">{[['FE1', c('FE1')], ['FE2', c('FE2')], ['FE total', c('FE1') + c('FE2')], ['Atraaf', c('Atraaf')]].map(([l, v]) => <div key={l} className="rounded-lg border bg-white p-2"><b className="block text-xl">{v}</b><span className="text-xs text-muted-foreground">{l}</span></div>)}</div>
                                    <div className="max-h-96 overflow-auto rounded-lg border"><Table><TableHeader><TableRow><TableHead>When</TableHead><TableHead>Type</TableHead><TableHead>Location</TableHead><TableHead /></TableRow></TableHeader>
                                        <TableBody>{mine.length ? mine.map(r => <TableRow key={r.id}><TableCell className="whitespace-nowrap">{whenTxt(r.ts)}</TableCell><TableCell><span className={cn('rounded-full px-2 py-0.5 text-xs font-bold', TYPE_CLS[r.type])}>{r.type}</span></TableCell><TableCell>{r.location || ''}</TableCell><TableCell><DelBtn r={r} /></TableCell></TableRow>) : <TableRow><TableCell colSpan={4} className="text-muted-foreground">Nothing saved yet.</TableCell></TableRow>}</TableBody></Table></div>
                                </div>;
                            })()}
                        </TabsContent>
                    </Tabs>
                </CardContent></Card>
            </div>
            {dialog}
        </div>
    );
}
