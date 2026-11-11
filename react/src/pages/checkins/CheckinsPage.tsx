import { Fragment, useEffect, useMemo, useState } from 'react';
import { Download, Printer } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { useSlips } from '@/hooks/useSlips';
import { usePrefs } from '@/hooks/usePrefs';
import { useCore, useDb, useLoadCore, useNav, useSite } from '@/pms/PmsContext';
import { assignedCount, computeWindow, countsOf, fmtDT, guests, legOf, luggageAt, luggageIndex, num, parseDT, partSum, partsOf, paxOrder, plusOneDay, printTableHtml, roomsFromSlip, splitExcl, toCSV, ymd, type Row } from './checkins';

// Check-ins & Check-outs (Front desk): filter by one day or a date/time range; the results are read-only and come from the shared PMS data. Each table has a
// totals row, optional columns (Settings → Check-ins page), CSV, Print table, Print slips and GL copy; Check-ins also carry the Check in flag (a signal for the
// other desks, nothing else depends on it). The window is today 03:00 → tomorrow 03:00 by default. The live flight status panel stays switched off.

const PAX_LABEL: Record<string, string> = { as: 'As.', t: 'T', g: 'G', l: 'L', c: 'C', i: 'I' };
// Madina's pax columns read As. T G C L I (paxOrder) — on screen, in the CSV and on the Print table
const colsFor = (site: string): { id: string; label: string; right?: boolean }[] => [
    { id: 'sh', label: 'SH No' }, { id: 'lug', label: 'First accommodation' }, { id: 'group', label: 'Group' }, { id: 'leader', label: 'Group Leader' }, { id: 'building', label: 'Building' }, { id: 'rooms', label: 'Rooms' },
    ...paxOrder(site).map(id => ({ id, label: PAX_LABEL[id], right: true })),
];
const dayShift = (n: number) => { const d = new Date(); d.setDate(d.getDate() + n); return ymd(d); };
const isDelayed = (r: Row) => !!(r.delayed && r.delayed.on);

export default function CheckinsPage() {
    const { cloud, stay, ums, checkin } = useCore();
    const db = useDb();
    const loadCore = useLoadCore();
    const { site, siteId } = useSite();
    const { href } = useNav();
    const { prefs } = usePrefs();
    const slips = useSlips(120_000);
    const [exclB, setExclB] = useState(() => { try { return localStorage.getItem('pms_excl_building') === '1'; } catch { return false; } });
    const pickExclB = (v: boolean) => { try { localStorage.setItem('pms_excl_building', v ? '1' : '0'); } catch { /* not saved */ } setExclB(v); };
    const [libs, setLibs] = useState<{ flights: any; slipPrint: any; colsMod: any; mode: any; transport: any } | null>(null);
    useEffect(() => { void Promise.all([loadCore('flights'), loadCore('slip-print'), loadCore('checkins-cols'), loadCore('travel-mode'), loadCore('transport')]).then(([flights, slipPrint, colsMod, mode, transport]) => setLibs({ flights, slipPrint, colsMod, mode, transport })); }, []);   // eslint-disable-line react-hooks/exhaustive-deps

    const today = ymd(new Date());
    const [df, setDf] = useState(today), [dt, setDt] = useState(plusOneDay(today)), [tf, setTf] = useState('03:00'), [tt, setTt] = useState('03:00');
    const [dtEdited, setDtEdited] = useState(false);
    const [mode, setMode] = useState('both');
    const [bldFilter, setBldFilter] = useState('all'), [sortBy, setSortBy] = useState('time');   // Building: only that building's groups; Sort: by time (default) or by building
    const [split, setSplit] = useState(!!prefs.checkinsSplit);
    const [glci, setGlci] = useState(false);   // Print table: add G L C I columns with totals (off each time the page opens)
    const [showLug, setShowLug] = useState(() => { try { return localStorage.getItem('pms_checkins_lug_col') === '1'; } catch { return false; } });   // hidden unless ticked: only one desk looks at it, once a day
    // Madina: a column on Check-ins after Group with each group's check-out and how it leaves (Transport day, else the slip / UMS — core/travel-mode.js); always shown
    const [trips, setTrips] = useState<Map<string, any>>(new Map());
    const [showFl, setShowFl] = useState(() => { try { return localStorage.getItem('pms_checkins_flight_col') === '1'; } catch { return false; } });
    const [range, setRange] = useState({ df, dt, tf, tt });
    const [other, setOther] = useState<any[]>([]);
    const [status, setStatus] = useState('');
    const [busy, setBusy] = useState('');
    const may = { slip: cloud.canOpen('slip'), print: cloud.canOpen('print') };
    const otherSite = siteId === 'makkah' ? 'medina' : 'makkah', otherLabel = otherSite === 'medina' ? 'Madina' : 'Makkah';
    useEffect(() => { void cloud.mirrorAll().then((all: any[]) => setOther(all.filter(r => r.site === otherSite))).catch(() => setOther([])); }, [siteId, slips.dataUpdatedAt]);   // eslint-disable-line react-hooks/exhaustive-deps

    const all = slips.data ?? [];
    const win = useMemo(() => {
        const start = new Date(`${range.df}T${range.tf || '00:00'}`);
        let end = new Date(`${range.dt}T${range.tt || '23:59'}`);
        if (!(end > start)) end = new Date(start.getTime() + 864e5);
        return { start, end, ...computeWindow(all, start, end, stay) };
    }, [all, range, stay]);
    const lugIdx = useMemo(() => luggageIndex(all), [all]);
    const lug = (r: Row) => luggageAt(lugIdx, r.sh_no);
    const bldNames = useMemo(() => [...new Set([...win.ins, ...win.outs].map(r => String(r.building || '').trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b, undefined, { numeric: true })), [win]);
    const shown = useMemo(() => {
        const pick = (rows: Row[], timeOf: (r: Row) => string) => {
            const f = bldFilter === 'all' ? rows : rows.filter(r => String(r.building || '').trim() === bldFilter);
            return sortBy === 'building' ? [...f].sort((a, b) => String(a.building || '').trim().localeCompare(String(b.building || '').trim(), undefined, { numeric: true }) || timeOf(a).localeCompare(timeOf(b))) : f;
        };
        return { ins: pick(win.ins, r => `${r.checkin_date}${r.checkin_time}`), outs: pick(win.outs, r => `${r.checkout_date}${r.checkout_time}`) };
    }, [win, bldFilter, sortBy]);
    const leg = (r: Row) => legOf(r, siteId, other, ums.baseSh);
    const outCol = siteId === 'medina';
    // the Transport day trips of the check-out days of the check-ins shown: SH → trip (the day's list of this site)
    const outDays = useMemo(() => [...new Set([...win.ins, ...win.outs].map(r => String(r.checkout_date || '')).filter(Boolean))].sort().slice(0, 40).join(','), [win]);
    useEffect(() => {
        if (!outCol || !libs || !outDays) return;
        let off = false;
        void Promise.all(outDays.split(',').map(d => libs.transport.loadDay(siteId, d).then((x: any) => x.rows || [], () => []))).then(lists => {
            if (off) return;
            const m = new Map<string, any>();
            for (const list of lists) {
                const info = libs.transport.resolve(list) as Map<string, any>;
                for (const t of list) {
                    const k = ums.baseSh(t.ref), i = info.get(t.key) || {};
                    if (k && !m.has(`${t.day}|${k}`)) m.set(`${t.day}|${k}`, { ...t, route: i.route || t.route, bus: i.bus ?? t.bus, vehicle: i.vehicle || t.vehicle, vehicle_label: i.vlabel || t.vehicle_label });
                }
            }
            setTrips(m);
        });
        return () => { off = true; };
    }, [outCol, libs, outDays, siteId]);   // eslint-disable-line react-hooks/exhaustive-deps
    const withLeave = (rows: Row[]) => siteId === 'medina' ? rows.map(r => { const t = tripOf(r); return t ? { ...r, _leave: libs?.mode.tripMode(t) } : r; }) : rows;
    const tripOf = (r: Row) => trips.get(`${r.checkout_date}|${ums.baseSh(r.sh_no)}`);
    const leaveOf = (r: Row) => (libs ? libs.mode.leaveMode(r, tripOf(r)) : { mode: '', src: '' });
    const KNOWN: string[] = libs ? libs.colsMod.CHECKINS_COLS.map((c: any) => c[0]) : [];
    const hiddenCols = (kind: 'in' | 'out') => [...((prefs[kind === 'in' ? 'checkinsHideIn' : 'checkinsHideOut'] || []) as string[]).filter(id => KNOWN.includes(id)), ...(showLug ? [] : ['lug'])];
    const flightOf = (r: Row, key: 'checkin' | 'checkout'): any => {
        if (!libs) return { kind: 'none' };
        if (leg(r)[key === 'checkin' ? 'from' : 'to'] !== 'airport') return { kind: 'city' };
        return { ...libs.flights.legOf(r, key === 'checkin' ? 'arr' : 'dep'), dir: key === 'checkin' ? 'arr' : 'dep' };
    };
    const flightText = (r: Row, key: 'checkin' | 'checkout') => { const f = flightOf(r, key); if (f.kind !== 'flight') return f.kind === 'road' ? `by ${(f.mode || 'road').toLowerCase()}` : ''; return f.code; };
    const parts = (rows: Row[], key: 'checkin' | 'checkout') => partsOf(rows, key, split, leg, otherSite, otherLabel);
    const rangeLabel = `${range.df} ${range.tf} → ${range.dt} ${range.tt}`;

    function submit(next?: Partial<typeof range>) {
        let r = { df, dt, tf, tt, ...next };
        if (!r.df || !r.dt) { alert('Pick both Date from and Date to.'); return; }
        const start = new Date(`${r.df}T${r.tf || '03:00'}`);
        let end = new Date(`${r.dt}T${r.tt || '03:00'}`);
        if (!(end > start)) { end = new Date(start.getTime() + 864e5); r = { ...r, dt: ymd(end), tt: `${String(end.getHours()).padStart(2, '0')}:${String(end.getMinutes()).padStart(2, '0')}` }; setDt(r.dt); setTt(r.tt); setDtEdited(false); }
        setRange(r);
    }
    const preset = (a: string, z: string) => { setDf(a); setDt(z); setTf('03:00'); setTt('03:00'); setDtEdited(false); submit({ df: a, dt: z, tf: '03:00', tt: '03:00' }); };
    async function getData() { setStatus('Getting data…'); try { await slips.refetch(); setStatus(''); } catch (e: any) { setStatus('Could not load slips: ' + (e?.message || e)); } }
    async function toggle(slip: Row, on: boolean) {
        setBusy(String(slip.id));
        try { await checkin.setCheckedIn(db, slip, on); await slips.refetch(); } catch (e: any) { alert(e?.message || 'Could not save the check-in.'); } finally { setBusy(''); }
    }
    const rowsOf = (kind: 'in' | 'out') => (kind === 'in' ? shown.ins : shown.outs);

    function csv(kind: 'in' | 'out') {
        const text = toCSV(kind, parts(rowsOf(kind), kind === 'in' ? 'checkin' : 'checkout'), { flights: showFl, hidden: hiddenCols(kind), flightText: r => flightText(r, kind === 'in' ? 'checkin' : 'checkout'), luggage: showLug ? lug : () => '', pax: paxOrder(siteId) });
        const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([text], { type: 'text/csv' }));
        a.download = `${kind === 'in' ? 'checkins' : 'checkouts'}_${range.df}_${range.dt}${split ? '_split' : ''}.csv`;
        document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(a.href);
    }
    function printTable(kind: 'in' | 'out') {
        const rows = rowsOf(kind);
        if (!rows.length) { alert('No rows to print in this table.'); return; }
        const w = window.open('', '_blank');
        if (!w) { alert('The browser blocked the new tab. Allow pop-ups for this site, then press Print table again.'); return; }
        w.document.open(); w.document.write(printTableHtml(kind, rows, parts(rows, kind === 'in' ? 'checkin' : 'checkout'), site.label, rangeLabel, showLug ? lug : () => '', glci, siteId === 'medina' ? paxOrder(siteId).filter(id => id === 't' || !hiddenCols(kind).includes(id)) : undefined)); w.document.close();
    }

    const checkLink = (code: string, o: any) => {
        const l = libs?.flights.checkLinks(code, o);
        if (!l) return null;
        const t1 = l.tripTab || !l.date;
        return <span className="flex flex-wrap gap-x-1 text-xs">{t1 && <><a className="text-primary underline" href={l.trip} target="_blank" rel="noopener" title={`${code} on Trip.com${l.tripTab ? ` — tap the “${l.tripTab}” tab` : ''}`}>Check 1</a> · </>}
            <a className="text-primary underline" href={l.fa} target="_blank" rel="noopener" title={`${l.ident} on FlightAware${l.dateLabel ? ` — ${l.dateLabel}` : ''}`}>Check 2</a></span>;
    };
    const flightCell = (r: Row, key: 'checkin' | 'checkout') => {
        const f = flightOf(r, key);
        if (f.kind === 'city') return <span className="text-xs text-muted-foreground">{key === 'checkin' ? 'from' : 'to'} {otherLabel}</span>;
        if (f.kind === 'road') return <span className="text-xs text-muted-foreground">by {String(f.mode || 'road').toLowerCase()}</span>;
        if (f.kind !== 'flight') return <span className="text-xs text-muted-foreground">—</span>;
        return <span title={f.code}>{checkLink(f.code, { dir: f.dir, date: f.leg?.date })}</span>;
    };
    const val = (r: Row, id: string): React.ReactNode => {
        switch (id) {
            case 'sh': return r.sh_no || '';
            case 'lug': return lug(r);
            case 'group': return <>{r.tour_name || ''}{isDelayed(r) && <Badge variant="outline" className="ml-1.5 text-warn" title={r.delayed.note || ''}>Delayed · {r._dep ? r._dep.status : (r.delayed.status || '')}{r._dep && !r._dep.last ? ' · part' : ''}</Badge>}</>;
            case 'leader': return String(r.group_leader ?? '').trim() || '-';
            case 'building': return (r.building || '').trim(); case 'rooms': return roomsFromSlip(r).map((l, i) => { const x = splitExcl(l); return <span key={i} className="whitespace-nowrap">{i ? ', ' : ''}{x.room}{x.tag && <span className="ml-1 rounded border border-foreground px-1 text-[0.8em] font-bold" title="Exclusive room — this group has the whole room">{x.tag}</span>}</span>; });
            case 'as': return assignedCount(r); case 't': return guests(r); case 'g': return num(r.gents); case 'l': return num(r.ladies); case 'c': return num(r.children ?? r.child); case 'i': return num(r.infants ?? r.infant);
        }
        return '';
    };

    function renderTable(kind: 'in' | 'out') {
        const key = kind === 'in' ? 'checkin' : 'checkout';
        const rows = rowsOf(kind), hidden = hiddenCols(kind);
        const cols = colsFor(siteId).filter(c => !hidden.includes(c.id));
        const showOther = !hidden.includes('other'), showSlip = !hidden.includes('slip') && may.slip;
        const lastOut = outCol;   // Madina: on Check-ins the check-out with its transport; on Check-outs (the date is the row's own) the transport only
        // Madina check-ins: the Check-out & transport column sits right after Group (before Group Leader); with Group hidden, where it would be
        const outAt = !lastOut ? -1 : (() => { const g = cols.findIndex(c => c.id === 'group'); if (g >= 0) return g + 1; const l = cols.findIndex(c => c.id === 'leader'); return l >= 0 ? l : 0; })();
        const outCell = (r: Row, co: Date | null) => (() => { const t = tripOf(r), lm = leaveOf(r); return <TableCell className="whitespace-nowrap">{kind === 'in' && fmtDT(co)}<span className={cn(kind === 'in' ? 'block text-xs' : 'text-sm')}>{lm.mode ? <b>{lm.mode}</b> : <span className="text-muted-foreground">mode not known</span>}{t ? <span className="text-muted-foreground"> · {(!/ZIYARAT/i.test(String(t.route || '')) && String(r.to_place || '').trim()) ? String(r.to_place).trim().toUpperCase() : String(t.route || '').split('-').slice(1).join('-')}{t.at ? ` ${String(t.at).slice(11, 16)}` : ''}{t.bus != null && t.bus !== '' ? ` · ${libs?.transport.vehicleNo(t.bus, t.vehicle, t.vehicle_label)}` : ''}</span> : lm.src && <span className="text-muted-foreground"> · {lm.src === 'ums' ? 'UMS' : 'slip'}</span>}</span></TableCell>; })();
        const withOut = (cells: React.ReactNode[], out: React.ReactNode) => (outAt < 0 ? cells : [...cells.slice(0, outAt), out, ...cells.slice(outAt)]);
        const n = 1 + (showFl ? 1 : 0) + cols.length + (showOther ? 1 : 0) + (showSlip ? 1 : 0) + (kind === 'in' ? 1 : 0) + (lastOut ? 1 : 0);
        const head = (
            <TableRow><TableHead>{kind === 'in' ? 'Check-in' : 'Check-out'}</TableHead>{showFl && <TableHead>Flight</TableHead>}{withOut(cols.map(c => <TableHead key={c.id} className={cn(c.right && 'text-right')}>{c.label}</TableHead>), <TableHead key="out" className="whitespace-nowrap">{kind === 'in' ? <>Check-out &amp; transport</> : 'Transport'}</TableHead>)}{showOther && <TableHead className="whitespace-nowrap">{kind === 'in' ? 'Check-out' : 'Check-in'}</TableHead>}{showSlip && <TableHead>Slip</TableHead>}{kind === 'in' && <TableHead>Status</TableHead>}</TableRow>
        );
        const tot = (list: Row[], label: string, cls: string) => {
            const k = countsOf(list), v: Record<string, number> = { as: k.as, t: k.t, g: k.g, l: k.l, c: k.c, i: k.i };
            return <TableRow className={cls}><TableCell className="font-bold">{label}</TableCell>{showFl && <TableCell />}{withOut(cols.map(c => <TableCell key={c.id} className={cn(c.right && 'text-right', 'font-bold')}>{c.id === 'group' ? `${k.n} slip${k.n === 1 ? '' : 's'}` : v[c.id] ?? ''}</TableCell>), <TableCell key="out" />)}{showOther && <TableCell />}{showSlip && <TableCell />}{kind === 'in' && <TableCell />}</TableRow>;
        };
        return (
            <Table>
                {!split && <TableHeader>{head}</TableHeader>}
                {parts(rows, key).map(([title, list], pi) => (
                    <TableBody key={pi}>
                        {title && <>
                            <TableRow className="bg-secondary"><TableCell colSpan={n} className="font-bold">{title}<small className="ml-2 font-normal text-muted-foreground">{partSum(list)}</small></TableCell></TableRow>
                            <TableRow className="bg-muted/60">{(head.props as any).children}</TableRow>
                            {!list.length && <TableRow><TableCell colSpan={n} className="text-muted-foreground">None in this range.</TableCell></TableRow>}
                        </>}
                        {list.map((r, i) => {
                            const ci = parseDT(r.checkin_date, r.checkin_time), co = parseDT(r.checkout_date, r.checkout_time), sh = String(r.sh_no || '').trim();
                            return (
                                <TableRow key={`${r.id}-${i}`}>
                                    <TableCell className="whitespace-nowrap">{fmtDT(kind === 'in' ? ci : co)}</TableCell>
                                    {showFl && <TableCell>{flightCell(r, key)}</TableCell>}
                                    {withOut(cols.map(c => <TableCell key={c.id} className={cn(c.right && 'text-right')}>{val(r, c.id)}</TableCell>), <Fragment key="out">{outCell(r, co)}</Fragment>)}
                                    {showOther && <TableCell className="whitespace-nowrap">{fmtDT(kind === 'in' ? co : ci)}</TableCell>}
                                    {showSlip && <TableCell>{sh ? <a className="rounded border border-gold bg-accent px-2 py-0.5 text-xs font-bold text-primary" href={href('slip', { sh_no: sh })} target="_blank" rel="noopener">Open</a> : <span className="text-muted-foreground" title="No SH number">Open</span>}</TableCell>}
                                    {kind === 'in' && <TableCell className="whitespace-nowrap">{checkin.isCheckedIn(r)
                                        ? <><span className="rounded-full bg-ok-soft px-2 py-0.5 text-xs font-bold text-ok">✓ Checked in</span>{!db.readonly && <button type="button" disabled={busy === String(r.id)} className="ml-1 text-xs text-muted-foreground underline" title="Undo: the group has not checked in" onClick={() => void toggle(r, false)}>Undo</button>}</>
                                        : db.readonly ? <span className="rounded-full bg-muted px-2 py-0.5 text-xs">—</span> : <Button size="sm" variant="outline" disabled={busy === String(r.id)} onClick={() => void toggle(r, true)}>Check in</Button>}</TableCell>}
                                
                                    
</TableRow>
                            );
                        })}
                        {title && list.length > 0 && tot(list, 'Subtotal', 'bg-muted/60')}
                    </TableBody>
                ))}
                <TableFooter>{tot(rows, 'Total', 'bg-accent')}</TableFooter>
            </Table>
        );
    }
    function renderPanel(kind: 'in' | 'out') {
        const rows = rowsOf(kind);
        return (
            <Card className="gap-0 py-0">
                <CardHeader className="flex-row flex-wrap items-center justify-between gap-2 border-b py-3 print:hidden"><CardTitle className="text-base">{kind === 'in' ? 'Check-ins' : 'Check-outs'}</CardTitle>
                    <div className="flex flex-wrap items-center gap-2"><span className="text-sm text-muted-foreground">{rows.length} slips • {rows.reduce((s, r) => s + guests(r), 0)} guests</span>
                        <Button size="sm" variant="outline" onClick={() => csv(kind)}><Download className="size-3.5" />Export CSV</Button>
                        <Button size="sm" variant="outline" onClick={() => printTable(kind)}><Printer className="size-3.5" />Print table</Button>
                        {siteId !== 'medina' && <label className="flex items-center gap-1.5 text-sm" title="Print table adds Gents, Ladies, Children and Infants columns, with totals"><input type="checkbox" checked={glci} onChange={e => setGlci(e.target.checked)} />G L C I</label>}
                        <label className="flex items-center gap-1.5 text-sm" title="Exclusive rooms show only 'Excl' unless this is ticked (table, printed table and printed slips)"><input type="checkbox" checked={exclB} onChange={e => pickExclB(e.target.checked)} />show building on Excl rooms</label>
                        {may.print && libs && <>
                            <Button size="sm" title="Print every slip in this table (A5, like Print slips)" onClick={() => libs.slipPrint.printSlips(withLeave(rows), { title: `check-${kind}s ${rangeLabel}` })}>Print slips</Button>
                            <Button size="sm" title="The A4 itinerary letter of every slip in this table" onClick={() => libs.slipPrint.printItineraries(rows, slips.data ?? [], { title: `check-${kind}s ${rangeLabel}` })}>Print itinerary</Button>
                            <Button size="sm" title="Each slip as an A5 picture to send to its group leader" onClick={() => libs.slipPrint.openGlCopies(withLeave(rows), { title: `check-${kind}s ${rangeLabel}` })}>GL copy</Button></>}
                    </div></CardHeader>
                <CardContent className="overflow-x-auto p-0">{renderTable(kind)}</CardContent>
            </Card>
        );
    }

    const presets: [string, () => void][] = [
        ['Today', () => { const a = ymd(new Date()); preset(a, plusOneDay(a)); }], ['Yesterday', () => { const a = dayShift(-1); preset(a, plusOneDay(a)); }], ['Tomorrow', () => { const a = dayShift(1); preset(a, plusOneDay(a)); }],
        ['Last 7 days', () => preset(dayShift(-6), plusOneDay(ymd(new Date())))], ['Last 30 days', () => preset(dayShift(-29), plusOneDay(ymd(new Date())))],
    ];
    return (
        <div className="mx-auto grid grid-cols-[minmax(0,1fr)] max-w-[2400px] min-w-0 gap-3 px-3 pb-10 pt-4 sm:px-4">
            <header className="grid gap-3 print:hidden">
                <div><h1 className="text-2xl font-bold text-primary">Check-ins &amp; Check-outs</h1><p className="text-sm text-muted-foreground">Filter by single day or a date/time range. Results are read-only and come from the shared PMS data.</p></div>
                <div className="grid grid-cols-2 items-end gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-8">
                    <div className="grid gap-1"><Label htmlFor="dateFrom">Date from</Label><Input id="dateFrom" type="date" value={df} onChange={e => { setDf(e.target.value); if (e.target.value && !dtEdited) setDt(plusOneDay(e.target.value)); }} /></div>
                    <div className="grid gap-1"><Label htmlFor="dateTo">Date to</Label><Input id="dateTo" type="date" value={dt} onChange={e => { setDt(e.target.value); setDtEdited(true); }} /></div>
                    <div className="grid gap-1"><Label htmlFor="timeFrom">Time from</Label><Input id="timeFrom" type="time" step={60} value={tf} onChange={e => setTf(e.target.value)} /></div>
                    <div className="grid gap-1"><Label htmlFor="timeTo">Time to</Label><Input id="timeTo" type="time" step={60} value={tt} onChange={e => setTt(e.target.value)} /></div>
                    <div className="grid gap-1"><Label htmlFor="mode">Mode</Label>
                        <Select value={mode} onValueChange={setMode}><SelectTrigger id="mode" className="w-full"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="both">Both</SelectItem><SelectItem value="in">Check-ins</SelectItem><SelectItem value="out">Check-outs</SelectItem></SelectContent></Select></div>
                    <div className="grid gap-1"><Label htmlFor="bld">Building</Label>
                        <Select value={bldFilter} onValueChange={setBldFilter}><SelectTrigger id="bld" className="w-full"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All buildings</SelectItem>{bldNames.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent></Select></div>
                    <div className="grid gap-1"><Label htmlFor="sortby">Sort by</Label>
                        <Select value={sortBy} onValueChange={setSortBy}><SelectTrigger id="sortby" className="w-full"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="time">Time</SelectItem><SelectItem value="building">Building, then time</SelectItem></SelectContent></Select></div>
                    <div className="grid gap-1.5 text-sm"><Label>View</Label>
                        <label className="flex items-center gap-2" title="Check-ins: from the airport / from the other city · Check-outs: to the airport / to the other city"><Checkbox checked={split} onCheckedChange={v => setSplit(v === true)} />Split by from / to</label>
                        
                        <label className="flex items-center gap-2" title="Check 1 (Trip.com) and Check 2 (FlightAware) links for each group's flight"><Checkbox checked={showFl} onCheckedChange={v => { setShowFl(v === true); try { localStorage.setItem('pms_checkins_flight_col', v === true ? '1' : '0'); } catch { /* ignore */ } }} />Flight status</label>
                        <label className="flex items-center gap-2" title="Show where each S-prefixed group's first stay (and its luggage) was"><Checkbox checked={showLug} onCheckedChange={v => { setShowLug(v === true); try { localStorage.setItem('pms_checkins_lug_col', v === true ? '1' : '0'); } catch { /* ignore */ } }} />First accommodation</label></div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    {presets.map(([l, f]) => <Button key={l} variant="outline" size="sm" onClick={f}>{l}</Button>)}
                    <Button onClick={() => { submit(); void getData(); }}>Get Data</Button>
                    <span className="text-xs text-muted-foreground">{status || `Range ${rangeLabel} • ${slips.data?.length ?? 0} slip(s) in DB`}</span>
                </div>
            </header>
            {slips.isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
            {(mode === 'in' || mode === 'both') && renderPanel('in')}
            {(mode === 'out' || mode === 'both') && renderPanel('out')}
        </div>
    );
}
