import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Minus, Plus, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useConfirm } from '@/components/ConfirmDialog';
import { cn } from '@/lib/utils';
import { dmy, natural } from '@/lib/format';
import { useSlips } from '@/hooks/useSlips';
import { useCore, useGuard, useSite } from '@/pms/PmsContext';
import './key-cards.css';

// Room Key Cards (Rooms): the key cards given to the rooms of every group leaving on a day (one card per assigned bed) and how many came back.
// Groups and rooms come from the slips (core/stay.js departuresOf — a delayed group leaves room by room, so only the rooms leaving that day
// show); only the returned count is saved (GET / PUT /api/key-cards), per slip, room and day, shared by every desk of the site.
// Taps are saved after half a second, together.

const pad = (n: number) => String(n).padStart(2, '0');
const ymd = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const shift = (day: string, n: number) => { const x = new Date(`${day}T12:00`); x.setDate(x.getDate() + n); return ymd(x); };
const hm = (ms: number) => new Date(ms).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
const MAX = 99;
const key = (slipId: number | string, room: string) => `${slipId}|${room}`;

type Slip = Record<string, any>;
type Group = { slip: Slip; at: number; part: boolean; rooms: [string, number][]; pax: number };

export default function KeyCardsPage() {
    const { cloud, stay } = useCore();
    const guard = useGuard();
    const { site, siteId } = useSite();
    const { ask, dialog } = useConfirm();
    const writable = cloud.canWrite(siteId);
    const slips = useSlips(30_000);

    const [day, setDay] = useState(ymd(new Date()));
    const [bld, setBld] = useState('all'), [find, setFind] = useState(''), [onlyOut, setOnlyOut] = useState(false);
    const [ret, setRet] = useState<Map<string, number>>(new Map());
    const [msg, setMsg] = useState<{ text: string; bad?: boolean }>({ text: '' });
    const pending = useRef(new Map<string, { slip_id: number; room_no: string; returned: number }>());
    const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const retRef = useRef(ret); retRef.current = ret;
    const say = (text: string, bad = false) => { setMsg({ text, bad }); if (text && !bad) setTimeout(() => setMsg(m => m.text === text ? { text: '' } : m), 2500); };

    const groups = useMemo<Group[]>(() => {
        const out: Group[] = [];
        for (const s of slips.data ?? []) {
            for (const d of stay.departuresOf(s)) {
                if (ymd(new Date(d.at)) !== day) continue;
                const by = new Map<string, number>();
                for (const r of d.rooms) { const n = String(r.room_no || '').trim(); if (n) by.set(n, (by.get(n) || 0) + (Number(r.beds) || 0)); }
                const rooms = [...by].filter(([, n]) => n > 0).sort((a, b) => natural(a[0], b[0]));
                if (!rooms.length) continue;
                const total = Number(s.total) || 0;
                const beds = rooms.reduce((n, [, b]) => n + b, 0);
                const leaving = stay.isDelayed(s) ? Math.max(0, stay.paxAt(s, d.at - 1).total - stay.paxAt(s, d.at).total) : total;
                out.push({ slip: s, at: d.at, part: stay.isDelayed(s) && !d.last, rooms, pax: leaving || beds });   // a slip without pax counts: the beds leaving
            }
        }
        return out.sort((a, b) => a.at - b.at || natural(a.slip.tour_name || '', b.slip.tour_name || '') || natural(a.slip.sh_no, b.slip.sh_no));
    }, [slips.data, day, stay]);

    const back = (g: Group, room: string) => Math.min(MAX, ret.get(key(g.slip.id, room)) || 0);
    const stats = (g: Group) => {
        const issued = g.rooms.reduce((n, [, i]) => n + i, 0);
        const got = g.rooms.reduce((n, [r]) => n + back(g, r), 0);
        const out = g.rooms.reduce((n, [r, i]) => n + Math.max(0, i - back(g, r)), 0);
        return { issued, got, out };
    };

    // the server's counts for the day, with this screen's unsent taps on top
    const loadCards = useCallback(async () => {
        try {
            const r: any = await guard(cloud.request('GET', `/api/key-cards?site=${siteId}&day=${day}`));
            const next = new Map<string, number>();
            for (const x of r.rows) next.set(key(x.slip_id, x.room_no), x.returned);
            for (const [k, p] of pending.current) next.set(k, p.returned);
            setRet(next);
        } catch (e) { say(e instanceof cloud.UserError ? e.message : 'Could not load the cards.', true); }
    }, [day, siteId]);   // eslint-disable-line react-hooks/exhaustive-deps
    useEffect(() => { void loadCards(); const t = setInterval(() => { if (document.visibilityState === 'visible' && !pending.current.size) void loadCards(); }, 30_000); return () => clearInterval(t); }, [loadCards]);

    const flush = useCallback(async () => {
        if (timer.current) clearTimeout(timer.current);
        if (!pending.current.size) return;
        const items = [...pending.current.values()];
        for (let i = 0; i < items.length; i += 40) {
            const chunk = items.slice(i, i + 40);
            try {
                await guard(cloud.request('PUT', '/api/key-cards', { site: siteId, day, items: chunk }));
                for (const it of chunk) { const k = key(it.slip_id, it.room_no); if (pending.current.get(k)?.returned === it.returned) pending.current.delete(k); }
            } catch (e) { say(e instanceof cloud.UserError ? e.message : 'Could not save the cards — check the connection.', true); return; }
        }
    }, [day, siteId]);   // eslint-disable-line react-hooks/exhaustive-deps
    useEffect(() => {
        const onHide = () => { if (document.visibilityState === 'hidden') void flush(); };
        document.addEventListener('visibilitychange', onHide);
        return () => { document.removeEventListener('visibilitychange', onHide); void flush(); };
    }, [flush]);

    const setReturned = (slipId: number, room: string, value: number) => {
        const n = Math.max(0, Math.min(MAX, Math.round(Number(value) || 0)));
        setRet(m => new Map(m).set(key(slipId, room), n));
        pending.current.set(key(slipId, room), { slip_id: Number(slipId), room_no: room, returned: n });
        if (timer.current) clearTimeout(timer.current);
        timer.current = setTimeout(() => void flush(), 500);
    };

    const buildings = useMemo(() => [...new Set(groups.map(g => g.slip.building || '').filter(Boolean))].sort(natural), [groups]);
    const list = groups.filter(g => (bld === 'all' || (g.slip.building || '') === bld)
        && (!find.trim() || [g.slip.tour_name, g.slip.group_leader, g.slip.sh_no, ...g.rooms.map(r => r[0])].some(x => String(x || '').toLowerCase().includes(find.trim().toLowerCase())))
        && (!onlyOut || stats(g).out > 0));
    const all = list.map(stats);
    const issued = all.reduce((n, x) => n + x.issued, 0), got = all.reduce((n, x) => n + x.got, 0), out = all.reduce((n, x) => n + x.out, 0);
    const done = all.filter(x => x.issued && !x.out).length;
    const kpis: [string, string | number, string, string][] = [
        ['Cards given', issued, `${list.length} group${list.length === 1 ? '' : 's'} leaving`, ''],
        ['Cards back', got, issued ? `${Math.round(got / issued * 100)}% collected` : '', got ? 'ok' : ''],
        ['Still out', out, out ? 'to collect' : 'all collected', out ? 'bad' : 'ok'],
        ['Groups complete', `${done} / ${list.length}`, '', done === list.length && list.length ? 'ok' : ''],
    ];

    async function clearGroup(g: Group) {
        if (!await ask({ title: 'Clear cards?', confirmLabel: 'Clear', body: `Clear the cards recorded back for ${g.slip.tour_name || 'this group'}?` })) return;
        g.rooms.forEach(([room]) => setReturned(g.slip.id, room, 0));
    }

    return (
        <div className="kc-print mx-auto grid grid-cols-[minmax(0,1fr)] max-w-[1300px] min-w-0 gap-3 px-3 pb-10 pt-4 sm:px-4 print:p-0">
            <header className="grid gap-3 print:hidden">
                <div>
                    <h1 className="text-2xl font-bold text-primary">Room Key Cards</h1>
                    <p className="text-sm text-muted-foreground">Cards given to the rooms of every group leaving that day (one card per assigned bed). Record how many came back.</p>
                </div>
                <div className="flex flex-wrap items-end gap-3">
                    <div className="grid gap-1"><Label htmlFor="kcDay">Departure day</Label><Input id="kcDay" type="date" value={day} onChange={e => { void flush(); setDay(e.target.value || ymd(new Date())); setBld('all'); }} /></div>
                    <div className="flex gap-1.5">{[['Yesterday', -1], ['Today', 0], ['Tomorrow', 1]].map(([l, n]) => <Button key={l} variant="outline" onClick={() => { void flush(); setDay(shift(ymd(new Date()), n as number)); setBld('all'); }}>{l}</Button>)}</div>
                    <div className="grid gap-1"><Label htmlFor="kcBld">Building</Label>
                        <Select value={bld} onValueChange={setBld}><SelectTrigger id="kcBld" className="min-w-40"><SelectValue /></SelectTrigger>
                            <SelectContent><SelectItem value="all">All buildings</SelectItem>{buildings.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent></Select></div>
                    <div className="grid gap-1"><Label htmlFor="kcFind">Find</Label><Input id="kcFind" type="search" placeholder="Group, leader, SH, room" autoComplete="off" value={find} onChange={e => setFind(e.target.value)} /></div>
                    <div className="flex items-center gap-2 pb-2"><Checkbox id="kcOut" checked={onlyOut} onCheckedChange={v => setOnlyOut(v === true)} /><Label htmlFor="kcOut">Only cards still out</Label></div>
                    <Button onClick={() => window.print()}><Printer className="size-4" />Print</Button>
                </div>
            </header>
            {!writable && <p className="text-sm font-semibold text-muted-foreground print:hidden">View only — this login cannot record cards for {site.label}.</p>}
            {msg.text && <p role="status" className={cn('text-sm font-semibold print:hidden', msg.bad ? 'text-destructive' : 'text-ok')}>{msg.text}</p>}

            <section className="grid grid-cols-2 gap-2 sm:grid-cols-4 print:hidden">
                {kpis.map(([l, v, sub, c]) => (
                    <div key={l} className={cn('grid gap-0.5 rounded-xl border bg-card p-3', c === 'ok' && 'border-ok/40', c === 'bad' && 'border-destructive/40')}>
                        <span className="text-xs text-muted-foreground">{l}</span>
                        <b className={cn('text-2xl', c === 'ok' && 'text-ok', c === 'bad' && 'text-destructive')}>{v}</b>
                        <small className="text-xs text-muted-foreground">{sub}</small>
                    </div>
                ))}
            </section>

            <section className="grid items-start gap-3 sm:grid-cols-2 xl:grid-cols-3 print:grid-cols-2 print:gap-2">
                {list.length ? list.map(g => {
                    const s = g.slip, st = stats(g), complete = st.out === 0 && st.issued > 0;
                    return (
                        <article key={`${s.id}-${g.at}`} className={cn('break-inside-avoid overflow-hidden rounded border-[1.5px] border-foreground bg-white', complete && 'border-ok shadow-[0_0_0_2px_rgba(31,111,67,.25)] print:shadow-none')}>
                            <div className="border-b bg-muted px-3 py-1 text-xs font-bold">Departure Date: {dmy(day)}</div>
                            <div className="px-3 py-2 font-bold">
                                {s.tour_name || '—'}{s.group_leader ? ` (${s.group_leader})` : ''} {g.pax}pax
                                <small className="block text-xs font-normal text-muted-foreground">SH {s.sh_no || '—'} · {s.building || 'no building'} · leaves {hm(g.at)}{g.part ? ' · only these rooms leave today' : ''}</small>
                            </div>
                            <div className="grid gap-1 px-3 pb-2">
                                {g.rooms.map(([room, iss]) => {
                                    const n = back(g, room);
                                    const cls = n === 0 ? '' : n > iss ? 'bg-bad-soft' : n === iss ? 'bg-ok-soft' : 'bg-warn-soft';
                                    return (
                                        <div key={room} className={cn('flex items-center gap-2 rounded-md border px-2 py-1', cls)}>
                                            <div className="w-16 font-bold">{room}</div>
                                            <div className="w-8 text-center text-sm text-muted-foreground" title="cards given">{iss}</div>
                                            <div className="ml-auto flex items-center gap-1">
                                                <Button variant="outline" size="icon" className="size-9 print:hidden" disabled={!writable || n <= 0} aria-label={`One card less in room ${room}`} onClick={() => setReturned(s.id, room, n - 1)}><Minus className="size-4" /></Button>
                                                <b className="kc-ret-num w-7 text-center" title="cards back">{n}</b>
                                                <span className="kc-ret-box hidden" aria-hidden="true" />
                                                <Button variant="outline" size="icon" className="size-9 print:hidden" disabled={!writable || n >= MAX} aria-label={`One card more in room ${room}`} onClick={() => setReturned(s.id, room, n + 1)}><Plus className="size-4" /></Button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="flex flex-wrap items-center gap-2 border-t bg-muted/40 px-3 py-2 text-sm">
                                <span className={cn('font-semibold', complete ? 'text-ok' : st.got ? 'text-warn' : '')}>{st.got} / {st.issued} cards back{st.out ? ` · ${st.out} still out` : ' ✓'}</span>
                                <span className="h-1.5 min-w-16 flex-1 overflow-hidden rounded-full bg-border print:hidden"><i className={cn('block h-full', complete ? 'bg-ok' : 'bg-gold')} style={{ width: `${st.issued ? Math.min(100, Math.round(st.got / st.issued * 100)) : 0}%` }} /></span>
                                <Button variant="outline" size="sm" className="print:hidden" disabled={!writable || !st.out} onClick={() => g.rooms.forEach(([room, iss]) => setReturned(s.id, room, Math.max(iss, ret.get(key(s.id, room)) || 0)))}>All back</Button>
                                <Button variant="outline" size="sm" className="print:hidden" disabled={!writable || !st.got} onClick={() => void clearGroup(g)}>Clear</Button>
                            </div>
                        </article>
                    );
                }) : <p className="col-span-full p-6 text-center text-muted-foreground">{slips.isLoading ? 'Loading…' : groups.length ? 'No group matches the filters.' : `No group with assigned rooms leaves on ${dmy(day)}.`}</p>}
            </section>
            {dialog}
        </div>
    );
}
