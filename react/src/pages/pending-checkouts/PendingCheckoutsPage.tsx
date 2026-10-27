import { useEffect, useMemo, useState } from 'react';
import { Printer } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { dmy } from '@/lib/format';
import { useDb, useGuard, useNav, useSite, useLoadCore } from '@/pms/PmsContext';

// Accounts → Pending checkouts: load the UMS checkout list (Excel or PDF), show the groups with zero advance and the full list, each with the
// building and rooms the PMS has for its SH. Nothing is stored — the list lives only in this page and is gone when it closes.

type Stay = { building?: string; checkout?: string; rooms: { no: string; side: string }[] };
type Row = {
    sh: string; groupId: string; leader: string; operator: string; pax?: number; checkoutDate: string; checkoutTime: string; arrival: string; location: string;
    advance: number | null; found: boolean; umsRooms: string[]; stays: Stay[]; roomMismatch?: boolean; dateMismatch?: boolean;
};
type Parsed = { fatal?: string; groups: any[]; warnings: string[]; source?: string; hasAdvance?: boolean };

const money = (n: number | null) => n == null ? '—' : n.toLocaleString(undefined, { maximumFractionDigits: 2 });
const ymd = (t: number) => { const d = new Date(t); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };

function Room({ no, side, hot, title }: { no: string; side?: string; hot?: boolean; title?: string }) {
    return <span title={title || side} className={cn('mr-1 inline-block rounded-md border px-2 py-0.5 text-xs font-bold', hot ? 'border-destructive/40 bg-bad-soft text-destructive' : 'bg-white', side === 'ladies' && 'italic')}>{no}</span>;
}

export default function PendingCheckoutsPage() {
    const db = useDb();
    const guard = useGuard();
    const { site } = useSite();
    const { href } = useNav();
    const loadCore = useLoadCore();
    const [data, setData] = useState<{ file: File; parsed: Parsed; rows: Row[] } | null>(null);
    const [status, setStatus] = useState<{ reading?: string; fatal?: string }>({});
    const [tab, setTab] = useState<'zero' | 'all'>('zero');
    const [q, setQ] = useState('');
    const [over, setOver] = useState(false);

    // Leaving with a list on screen: the browser asks first (it would be lost)
    useEffect(() => {
        if (!data) return;
        const h = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = ''; };
        window.addEventListener('beforeunload', h);
        return () => window.removeEventListener('beforeunload', h);
    }, [data]);

    async function load(file?: File) {
        if (!file) return;
        setStatus({ reading: file.name });
        const { parseCheckoutFile, matchGroups } = await loadCore('checkout-list');
        let parsed: Parsed;
        try { parsed = await guard(parseCheckoutFile(file)); }
        catch (e: any) { console.error(e); parsed = { fatal: 'Could not read this file: ' + (e.message || e), groups: [], warnings: [] }; }
        if (parsed.fatal) { setData(null); setStatus({ fatal: parsed.fatal, reading: undefined }); return; }
        const rows: Row[] = (matchGroups(parsed.groups, await db.all()) as Row[])
            .sort((a, b) => `${a.checkoutDate} ${a.checkoutTime}`.localeCompare(`${b.checkoutDate} ${b.checkoutTime}`));
        if (!parsed.hasAdvance) setTab('all');
        setData({ file, parsed, rows });
        setStatus({});
    }

    const today = ymd(Date.now()), tomorrow = ymd(Date.now() + 86400000);
    const due = (d: string) => !d ? null : d < today ? <Badge variant="destructive" className="ml-1.5">passed</Badge> : d === today ? <Badge className="ml-1.5">today</Badge> : d === tomorrow ? <Badge variant="secondary" className="ml-1.5">tomorrow</Badge> : null;

    const view = useMemo(() => {
        if (!data) return null;
        const { rows, parsed } = data;
        const zero = rows.filter(r => r.advance === 0);
        const qq = q.trim().toLowerCase();
        const match = (r: Row) => !qq || [r.sh, r.groupId, r.leader, r.operator, r.location, ...r.umsRooms, ...r.stays.flatMap(s => [s.building, ...s.rooms.map(x => x.no)])].some(v => String(v ?? '').toLowerCase().includes(qq));
        const list = (tab === 'zero' ? (parsed.hasAdvance ? zero : []) : rows).filter(match);
        const byBuilding = tab !== 'zero' ? [] : Object.entries(list.reduce((m: Record<string, { no: string; sh: string }[]>, r) => {
            for (const s of r.stays) (m[s.building || 'No building'] ||= []).push(...s.rooms.map(x => ({ ...x, sh: r.sh })));
            return m;
        }, {})).sort(([a], [b]) => a.localeCompare(b)).map(([b, rooms]) => [b, [...rooms].sort((x, y) => x.no.localeCompare(y.no, undefined, { numeric: true }))] as const);
        const notes = [
            ...parsed.warnings,
            ...rows.filter(r => r.roomMismatch).map(r => `SH ${r.sh}: UMS lists ${r.umsRooms.join(', ')}, the PMS slip has ${r.stays.flatMap(s => s.rooms.map(x => x.no)).join(', ') || 'no rooms'}.`),
            ...rows.filter(r => r.dateMismatch).map(r => `SH ${r.sh}: UMS checkout ${dmy(r.checkoutDate)}, the PMS slip says ${r.stays.map(s => dmy(s.checkout)).join(', ')}.`),
        ];
        return { zero, list, byBuilding, notes, notFound: rows.filter(r => !r.found).length };
    }, [data, tab, q]);

    return (
        <div className="mx-auto grid grid-cols-[minmax(0,1fr)] max-w-[1200px] min-w-0 gap-3 px-3 pb-10 pt-4 sm:px-4">
            <header className="print:hidden">
                <h1 className="text-2xl font-bold text-primary">Pending Checkouts — {site.label}</h1>
                <p className="text-sm text-muted-foreground">Load the UMS checkout list (Excel or PDF). Each group is found in the PMS by its SH (the list's Booking Ref) to show its building and rooms.</p>
            </header>

            <div role="alert" className="rounded-lg border-2 border-destructive/50 bg-bad-soft px-3 py-2 text-sm text-destructive print:hidden">
                <b>⚠ Nothing on this page is saved.</b> Closing the tab, refreshing or opening another page wipes the list. Take a screenshot (or print) before you close it.
            </div>

            <Card className="print:hidden"><CardContent className="grid gap-3">
                <h3 className="font-bold text-primary">Load the list</h3>
                <label
                    onDragOver={e => { e.preventDefault(); setOver(true); }} onDragLeave={() => setOver(false)}
                    onDrop={e => { e.preventDefault(); setOver(false); void load(e.dataTransfer.files[0]); }}
                    className={cn('grid cursor-pointer place-items-center gap-1 rounded-xl border-2 border-dashed border-gold bg-accent/40 p-6 text-center', over && 'bg-accent')}>
                    <input type="file" className="sr-only" accept=".xlsx,.xls,.pdf,application/pdf" onChange={e => { void load(e.target.files?.[0]); e.target.value = ''; }} />
                    <span>Drop the <b>Excel</b> or <b>PDF</b> here, or <u>choose the file</u></span>
                </label>
                <div className="flex flex-wrap gap-1.5">
                    {status.reading && <Badge variant="secondary">Reading {status.reading}…</Badge>}
                    {data && <>
                        <Badge variant="secondary">{data.file.name} · {data.parsed.source}</Badge>
                        <Badge className="bg-ok-soft text-ok">{data.rows.length} groups</Badge>
                        {data.parsed.hasAdvance ? <Badge variant="destructive">{view?.zero.length} with advance 0</Badge> : <Badge className="bg-warn-soft text-warn">no advance column</Badge>}
                        {view && view.notFound > 0 && <Badge className="bg-warn-soft text-warn">{view.notFound} SH not found in {site.label}</Badge>}
                    </>}
                </div>
                {status.fatal && <p className="text-destructive">{status.fatal}</p>}
                {view && view.notes.length > 0 && (
                    <details><summary className="cursor-pointer text-sm">{view.notes.length} difference(s) between the list and the PMS</summary>
                        <ul className="mt-1 list-disc pl-5 text-sm">{view.notes.map((n, i) => <li key={i}>{n}</li>)}</ul></details>
                )}
            </CardContent></Card>

            {data && view && (
                <Card><CardContent className="grid gap-3">
                    <div className="flex flex-wrap items-center gap-2 print:hidden">
                        <Tabs value={tab} onValueChange={v => setTab(v as 'zero' | 'all')}>
                            <TabsList>
                                <TabsTrigger value="zero">Advance 0 <Badge variant="secondary" className="ml-1">{data.parsed.hasAdvance ? view.zero.length : '—'}</Badge></TabsTrigger>
                                <TabsTrigger value="all">Full list <Badge variant="secondary" className="ml-1">{data.rows.length}</Badge></TabsTrigger>
                            </TabsList>
                        </Tabs>
                        <Input type="search" className="min-w-48 flex-1" placeholder="Search SH, name, room…" value={q} onChange={e => setQ(e.target.value)} />
                        <Button variant="outline" onClick={() => window.print()}><Printer className="size-4" />Print</Button>
                    </div>
                    {tab === 'zero' && !data.parsed.hasAdvance && (
                        <p className="rounded-lg bg-warn-soft p-2 text-sm text-warn">This file has no <b>Total Advance</b> column (the PDF export leaves it out), so groups with zero advance cannot be picked out. Load the Excel file for this view, or use the full list.</p>
                    )}
                    {view.byBuilding.map(([b, rooms]) => (
                        <div key={b} className="grid gap-1"><h4 className="font-bold">{b} <span className="font-normal text-muted-foreground">· {rooms.length} room(s)</span></h4>
                            <div>{rooms.map((x, i) => <Room key={i} no={x.no} hot title={`SH ${x.sh}`} />)}</div></div>
                    ))}
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader><TableRow><TableHead>SH</TableHead><TableHead>Group leader</TableHead><TableHead className="text-right">Pax</TableHead><TableHead>Expected checkout</TableHead><TableHead>Location</TableHead><TableHead className="text-right">Advance</TableHead><TableHead>Building &amp; rooms (PMS)</TableHead></TableRow></TableHeader>
                            <TableBody>
                                {view.list.length ? view.list.map((r, i) => {
                                    const isZero = r.advance === 0;
                                    return (
                                        <TableRow key={i} className={cn(isZero && tab === 'all' && 'bg-bad-soft/50')}>
                                            <TableCell className="whitespace-nowrap"><a className="font-bold text-primary underline" href={href('slip', { sh_no: r.sh })} target="_blank" rel="noopener" title="Open the slip in a new tab">{r.sh}</a><small className="block text-muted-foreground">Group {r.groupId}</small></TableCell>
                                            <TableCell>{r.leader}<small className="block text-muted-foreground">{r.operator}</small></TableCell>
                                            <TableCell className="text-right">{r.pax ?? ''}</TableCell>
                                            <TableCell className="whitespace-nowrap">{dmy(r.checkoutDate)} {r.checkoutTime}{due(r.checkoutDate)}<small className="block text-muted-foreground">arrived {dmy(r.arrival)}</small></TableCell>
                                            <TableCell>{r.location}</TableCell>
                                            <TableCell className="text-right">{isZero ? <b className="text-destructive">0</b> : money(r.advance)}</TableCell>
                                            <TableCell>
                                                {!r.found ? <><span className="text-muted-foreground">Not in {site.label} PMS</span><small className="block text-muted-foreground">UMS: {r.umsRooms.join(', ') || '—'}</small></> : <>
                                                    {r.stays.map((s, j) => (
                                                        <div key={j} className="mb-1"><b className="mr-1.5 text-xs">{s.building || 'No building'}</b>
                                                            {s.rooms.length ? s.rooms.map((x, k) => <Room key={k} no={x.no} side={x.side} hot={isZero} />) : <span className="text-muted-foreground">no rooms assigned</span>}</div>
                                                    ))}
                                                    {r.roomMismatch && <span className="text-xs font-bold text-warn">UMS: {r.umsRooms.join(', ')}</span>}
                                                </>}
                                            </TableCell>
                                        </TableRow>
                                    );
                                }) : <TableRow><TableCell colSpan={7} className="text-muted-foreground">{tab === 'zero' && !data.parsed.hasAdvance ? 'No advance column in this file.' : 'Nothing here.'}</TableCell></TableRow>}
                            </TableBody>
                        </Table>
                    </div>
                    <p className="text-xs text-muted-foreground">Rooms come from this site's slips. <span className="font-bold text-warn">UMS: …</span> marks a room UMS lists that the slip does not have.</p>
                </CardContent></Card>
            )}
        </div>
    );
}
