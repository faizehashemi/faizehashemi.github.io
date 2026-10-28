import { useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';

// Performance → "Slip saves refused": every Save / Edit / Save as a copy the Slip page stopped (POST /api/slip-denials), with the conditions it
// checked — so "why won't it let us?" has an answer. Each record's detail: form (as typed), rows (this slip's rooms and beds), issues (blocked = over
// the beds at the busiest moment, with every other stay in that room; nocap = no bed count anywhere; badtime = a row's own check-out before the
// check-in; window = building / dates missing; server = the server refused), ok_rooms, copy (how fresh this browser's copy of the slips was).

export type Denial = { id: number; at: string; desk: string; site?: string; action: string; sh_no?: string; slip_id?: number; building?: string; rooms?: string; kinds?: string; detail?: string };

const when = (iso?: string) => iso ? new Date(iso).toLocaleString(undefined, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—';
const REASON: Record<string, string> = { blocked: 'Over the beds', nocap: 'No bed count', badtime: 'Row check-out before check-in', window: 'Building / dates missing', server: 'Server refused' };
const ACTION: Record<string, string> = { save: 'Save', update: 'Edit', copy: 'Save as a copy' };
const CAP_FROM: Record<string, string> = { row: "this slip's row", builder: 'Rooms & Buildings', history: 'an older slip' };
const SITE: Record<string, string> = { makkah: 'Makkah', medina: 'Medina' };

const parse = (d: Denial): any => { try { return JSON.parse(d.detail || '{}'); } catch { return {}; } };
const kindsOf = (d: Denial) => (d.kinds || '').split(',').filter(Boolean);
const minutesOld = (copy: any, at: string) => copy?.last_sync ? Math.round((Date.parse(at) - Date.parse(copy.last_sync)) / 60000) : null;
const count = (keys: string[]) => { const m = new Map<string, number>(); keys.forEach(k => m.set(k, (m.get(k) || 0) + 1)); return [...m].sort((a, b) => b[1] - a[1]); };

function CapLine({ cs, cap }: { cs?: any; cap?: number }) {
    if (!cs) return <>{cap ?? '?'} beds</>;
    const also = [cs.used !== 'row' && cs.row ? `row says ${cs.row}` : '', cs.used !== 'builder' && cs.builder ? `Rooms & Buildings says ${cs.builder}` : '', !cs.builder ? 'not in Rooms & Buildings' : ''].filter(Boolean);
    const clash = cs.row && cs.builder && cs.row !== cs.builder;
    return <><b>{cap ?? '?'} beds</b> from {CAP_FROM[cs.used] || 'nowhere'}{also.length > 0 && ` (${also.join('; ')})`}{clash && <Badge variant="destructive" className="ml-1.5">row ≠ Rooms &amp; Buildings</Badge>}</>;
}

function Issue({ x, d }: { x: any; d: any }) {
    const bad = 'font-bold text-destructive';
    if (x.kind === 'blocked') {
        const others: any[] = x.others?.length ? x.others : x.who || [];
        return (
            <li className="grid gap-1">
                <span><b className={bad}>Room {x.room}: {x.total}/{x.cap} on {when(x.at)}</b> — other groups {x.existing} + this slip {x.want}.</span>
                <span className="text-xs text-muted-foreground">Capacity: <CapLine cs={x.cap_source} cap={x.cap} /></span>
                {others.length > 0 && <>
                    <Table>
                        <TableHeader><TableRow><TableHead>Other stays in the room during this slip</TableHead><TableHead className="text-right">Beds</TableHead><TableHead>From → to</TableHead><TableHead /></TableRow></TableHeader>
                        <TableBody>{others.map((w, i) => {
                            const atWorst = x.at && Date.parse(w.start) <= Date.parse(x.at) && Date.parse(x.at) < Date.parse(w.end);
                            return <TableRow key={i} className={cn(atWorst && 'bg-bad-soft')}>
                                <TableCell>SH {w.sh || '—'}{w.id && <small className="ml-1 text-muted-foreground">#{w.id}</small>}{w.ums && <small className="ml-1 text-muted-foreground">UMS</small>}</TableCell>
                                <TableCell className="text-right">{w.beds}</TableCell><TableCell>{when(w.start)} → {when(w.end)}</TableCell><TableCell>{w.status && w.status !== 'booked' ? `delayed · ${w.status}` : ''}</TableCell></TableRow>;
                        })}</TableBody>
                    </Table>
                    <small className="text-muted-foreground">Highlighted = in the room at the busiest moment.</small></>}
            </li>
        );
    }
    if (x.kind === 'nocap') return <li><b className={bad}>Room {x.room}: no bed count</b> — <CapLine cs={x.cap_source} cap={0} /></li>;
    if (x.kind === 'badtime') return <li><b className={bad}>Room {x.room}: its own check-out is before the check-in</b>{x.out && ` (row leaves ${x.out.date} ${x.out.time})`}</li>;
    if (x.kind === 'window') return <li><b className={bad}>{x.missing?.length ? `Missing or wrong: ${x.missing.join(', ')}` : 'Building or dates missing'}</b> (typed: building “{d.building}”, {d.form?.checkin} → {d.form?.checkout})</li>;
    if (x.kind === 'server') return <li><b className={bad}>Server refused{x.status ? ` (${x.status})` : ''}:</b> {x.message}</li>;
    return <li>{JSON.stringify(x)}</li>;
}

function Detail({ row }: { row: Denial }) {
    const d = parse(row), f = d.form || {}, c = d.copy, old = minutesOld(c, row.at);
    const [copied, setCopied] = useState('');
    return (
        <div className="grid gap-2 border-t bg-white p-3 text-sm">
            <div className="grid gap-1">
                <span><b>Typed</b> {f.checkin} → {f.checkout} · G {f.gents || 0} · L {f.ladies || 0} · C {f.children || 0} · I {f.infants || 0} · total {f.total || 0}{f.delayed ? ' · delayed departure on' : ''}</span>
                <span><b>Rooms in this slip</b> {(d.rows || []).map((r: any) => `${r.room} × ${r.beds}${r.cap_row ? ` (row cap ${r.cap_row})` : ''}`).join(', ') || '—'}</span>
                <span><b>Data used</b> {c ? <>{c.synced ? 'fresh from the server' : <Badge variant="destructive">could not reach the server — this browser's copy</Badge>} · {c.slips} slips{old != null ? ` · last sync ${old <= 0 ? 'just before' : `${old} min before`}` : ' · never synced'}{c.online === false && ' · offline'}</> : '—'}</span>
            </div>
            <ol className="grid list-decimal gap-2 pl-5">{(d.issues || []).map((x: any, i: number) => <Issue key={i} x={x} d={d} />)}</ol>
            {d.ok_rooms?.length > 0 && <p className="font-semibold text-ok">✓ OK: {d.ok_rooms.map((o: any) => `${o.room} ${o.after}/${o.cap}`).join(' · ')}</p>}
            <div><Button size="sm" variant="outline" onClick={async () => {
                try { await navigator.clipboard.writeText(JSON.stringify({ ...row, detail: parse(row) }, null, 2)); setCopied('Copied ✓'); } catch { setCopied('Could not copy'); }
            }}>{copied || 'Copy the full record (JSON)'}</Button></div>
        </div>
    );
}

function Chips({ title, pairs }: { title: string; pairs: [string, number][] }) {
    if (!pairs.length) return null;
    return <div className="flex flex-wrap items-center gap-1.5"><b className="text-sm">{title}</b>{pairs.map(([k, n]) => <Badge key={k} variant="secondary" className="font-normal">{k} <i className="ml-1 font-bold not-italic">{n}</i></Badge>)}</div>;
}

export function DenialsSection({ list }: { list: Denial[] }) {
    const [kind, setKind] = useState('all'), [desk, setDesk] = useState('all'), [find, setFind] = useState(''), [earlier, setEarlier] = useState(false), [openId, setOpenId] = useState<number | null>(null);
    const today = new Date().toDateString();
    const isToday = (d: Denial) => new Date(d.at).toDateString() === today;
    const kinds = Object.keys(REASON).filter(k => list.some(d => kindsOf(d).includes(k)));
    const desks = [...new Set(list.map(d => d.desk))].sort();
    const shown = useMemo(() => {
        const f = find.trim().toUpperCase();
        return list.filter(d => (earlier || isToday(d)) && (kind === 'all' || kindsOf(d).includes(kind)) && (desk === 'all' || d.desk === desk)
            && (!f || String(d.sh_no || '').toUpperCase().includes(f) || `,${d.rooms || ''},`.toUpperCase().includes(`,${f},`)));
    }, [list, kind, desk, find, earlier]);   // eslint-disable-line react-hooks/exhaustive-deps
    const stale = list.filter(d => parse(d).copy?.synced === false).length;
    const capClash = list.filter(d => (parse(d).issues || []).some((x: any) => x.cap_source?.row && x.cap_source?.builder && x.cap_source.row !== x.cap_source.builder)).length;

    return (
        <section className="grid gap-3">
            <div className="flex flex-wrap items-center gap-2">
                <h2 className="mr-2 text-base font-bold text-primary">Slip saves refused</h2>
                <span className="min-w-0 flex-1 text-xs text-muted-foreground">every Save / Edit / Save as a copy the Slip page stopped, with each condition it checked — open one to see why</span>
                <Select value={kind} onValueChange={setKind}><SelectTrigger className="w-44" aria-label="Reason"><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="all">All reasons</SelectItem>{kinds.map(k => <SelectItem key={k} value={k}>{REASON[k]}</SelectItem>)}</SelectContent></Select>
                <Select value={desk} onValueChange={setDesk}><SelectTrigger className="w-36" aria-label="Login"><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="all">All logins</SelectItem>{desks.map(x => <SelectItem key={x} value={x}>{x}</SelectItem>)}</SelectContent></Select>
                <Input className="w-40" type="search" placeholder="SH or room" aria-label="Find SH or room" value={find} onChange={e => setFind(e.target.value)} />
                <label className="flex items-center gap-1.5 text-sm"><input type="checkbox" checked={earlier} onChange={e => setEarlier(e.target.checked)} />Show earlier days{list.some(x => !isToday(x)) ? ` (${list.filter(x => !isToday(x)).length})` : ''}</label>
            </div>
            {list.length > 0 && (
                <div className="grid gap-2 rounded-lg bg-muted p-3">
                    <Chips title="Reasons" pairs={count(list.flatMap(kindsOf)).map(([k, n]) => [REASON[k] || k, n])} />
                    <Chips title="Logins" pairs={count(list.map(d => d.desk))} />
                    <Chips title="Rooms" pairs={count(list.flatMap(d => (d.rooms || '').split(',').filter(Boolean).map(r => `${d.building} ${r}`))).slice(0, 12)} />
                    <Chips title="Groups (SH)" pairs={count(list.map(d => d.sh_no || '').filter(Boolean)).filter(([, n]) => n > 1).slice(0, 12)} />
                    {(stale > 0 || capClash > 0) && <p className="text-sm font-semibold text-warn">{stale > 0 && `${stale} refused on a copy that could not be refreshed from the server. `}{capClash > 0 && `${capClash} had a row capacity different from Rooms & Buildings.`}</p>}
                </div>
            )}
            {shown.length ? (
                <div className="overflow-x-auto rounded-lg border">
                    <Table>
                        <TableHeader><TableRow><TableHead>When</TableHead><TableHead>Login</TableHead><TableHead>Site</TableHead><TableHead>Action</TableHead><TableHead>SH</TableHead><TableHead>Building</TableHead><TableHead>Rooms</TableHead><TableHead>Why</TableHead></TableRow></TableHeader>
                        <TableBody>{shown.map(x => [
                            <TableRow key={x.id} className="cursor-pointer" onClick={() => setOpenId(openId === x.id ? null : x.id)}>
                                <TableCell className="whitespace-nowrap">{when(x.at)}</TableCell><TableCell><b>{x.desk}</b></TableCell><TableCell>{SITE[x.site || ''] || x.site || ''}</TableCell><TableCell>{ACTION[x.action] || x.action}</TableCell>
                                <TableCell><b>{x.sh_no || '—'}</b>{x.slip_id && <small className="ml-1 text-muted-foreground">#{x.slip_id}</small>}</TableCell><TableCell>{x.building || '—'}</TableCell>
                                <TableCell className="whitespace-normal">{(x.rooms || '').split(',').filter(Boolean).join(', ')}</TableCell>
                                <TableCell className="whitespace-normal"><span className="flex flex-wrap gap-1">{kindsOf(x).map(k => <Badge key={k} variant="destructive">{REASON[k] || k}</Badge>)}</span></TableCell>
                            </TableRow>,
                            openId === x.id && <TableRow key={`${x.id}-d`}><TableCell colSpan={8} className="whitespace-normal p-0"><Detail row={x} /></TableCell></TableRow>,
                        ])}</TableBody>
                    </Table>
                </div>
            ) : <p className="text-sm text-muted-foreground">{list.length ? (earlier ? 'None match.' : 'No refused saves today — tick “Show earlier days” to see the rest.') : 'No refused slip saves in this period.'}</p>}
        </section>
    );
}

// the detail is drawn when its record is opened (the browser renders closed <details> content too, so it is mounted only on demand)
function DetailLazy({ row }: { row: Denial }) {
    return <Detail row={row} />;
}
