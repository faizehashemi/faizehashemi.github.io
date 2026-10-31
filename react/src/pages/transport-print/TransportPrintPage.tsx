import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { ImageDown, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { useCore, useGuard, useLoadApp, useLoadCore, useNav, useParams, useSite } from '@/pms/PmsContext';
import { DayNav } from '../transport/DayNav';
import css from './sheets.css?raw';
import { fitLuggage, fitSheets, luggageSheet, parseOnly, sheet, sheet2, summary, type Libs } from './sheets';

// Bus sheets: one A4 landscape page per bus (or car) of the day, laid out like the printed signs. "Print summary" prints the same choice as one list per
// destination, "Luggage sheet" one A4 page per bus with the groups on it, and both can go to Excel. The paper output is the old page's markup and CSS
// (sheets.css, loaded only while this page is open so its @page rules cannot reach other pages). #/<site>/transport-print?day=YYYY-MM-DD

type Row = Record<string, any>;
const OFF_KEY = 'pms_transport_print_off', OLD_PICK_KEY = 'pms_transport_print_dests', OLD_DESTS = ['atraaf', 'madina', 'airport'];

export default function TransportPrintPage() {
    const { cloud, transport } = useCore();
    const T = transport as any;
    const guard = useGuard();
    const params = useParams();
    const loadApp = useLoadApp();
    const loadCore = useLoadCore();
    const { site, siteId } = useSite();
    const { href, navigate } = useNav();
    const day = /^\d{4}-\d{2}-\d{2}$/.test(params.get('day') || '') ? (params.get('day') as string) : (T.today() as string);
    const DESTS = T.destsFor(siteId) as Row[];

    // the destinations a desk unticked (a destination added later starts ticked); the old key kept the ticked ones
    const [off, setOff] = useState<string[]>(() => {
        try {
            const s = JSON.parse(localStorage.getItem(OFF_KEY) || 'null'), old = JSON.parse(localStorage.getItem(OLD_PICK_KEY) || 'null');
            if (Array.isArray(s)) return s;
            if (Array.isArray(old)) return OLD_DESTS.filter(id => !old.includes(id));
        } catch { /* ignore */ }
        return [];
    });
    const [only, setOnly] = useState('');
    const [doc, setDoc] = useState<{ rows: Row[] }>({ rows: [] });
    const [days, setDays] = useState<{ day: string; n: number }[]>([]);
    const [msg, setMsg] = useState(''), [note, setNote] = useState('');
    // sign format: 1 = A4 landscape sign, 2 = A4 portrait with a very large bus number. Medina's default is 2, Makkah's 1; a desk's own pick is kept per site.
    const fmtKey = `pms_bus_format:${siteId}`;
    const [fmt, setFmt] = useState<'1' | '2'>(() => { try { const v = localStorage.getItem(fmtKey); if (v === '1' || v === '2') return v; } catch { /* default */ } return siteId === 'medina' ? '2' : '1'; });
    const pickFmt = (v: '1' | '2') => { setFmt(v); try { localStorage.setItem(fmtKey, v); } catch { /* not saved */ } };
    const [lugOpen, setLugOpen] = useState(false);
    const [lugOff, setLugOff] = useState<string[]>([]);
    const [xl, setXl] = useState('');
    const [libs, setLibs] = useState<any>(null);
    const sheetsRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        void (async () => {
            const z = await loadCore('ziyarat'), ex = await loadApp('views/transport-print/export.js');
            setLibs({ ziyarat: z, ex });
            try { const [d, ds] = await guard<any>(Promise.all([T.loadDay(siteId, day), T.listDays(siteId)])); setDoc(d); setDays(ds); }
            catch (e: any) { setMsg(e instanceof cloud.UserError ? e.message : 'Could not load the transport list.'); }
        })();
    }, []);   // eslint-disable-line react-hooks/exhaustive-deps

    const groups = useMemo(() => T.signage(doc.rows, siteId) as Row[], [doc.rows, siteId]);   // eslint-disable-line react-hooks/exhaustive-deps
    const picked = DESTS.map(d => d.id).filter(id => !off.includes(id));
    const chosen = () => {
        const o = parseOnly(only);
        return groups.filter(g => picked.includes(g.dest.id)).map((g): Row => ({ ...g, buses: g.buses.filter((b: Row) => !o || o.has(Number(b.bus))) })).filter(g => g.buses.length);
    };
    const L: Libs | null = libs ? { vehicleWord: T.vehicleWord, sheetDate: T.sheetDate, time12: T.time12, tripRows: libs.ex.tripRows, ziyaratSummary: libs.ziyarat.ziyaratSummary } : null;
    const pages = chosen().flatMap(g => g.buses.map((b: Row) => (fmt === '2' ? sheet2(T, day, g.dest, b, site.label.toUpperCase()) : sheet(T, day, g.dest, b))));
    const sheetsHtml = pages.join('') || `<p class="tq-none">${doc.rows.length ? 'No buses for this choice.' : 'No transport list saved for this day.'}</p>`;
    useLayoutEffect(() => { if (sheetsRef.current) fitSheets(sheetsRef.current); }, [sheetsHtml, fmt]);
    // the bus number's font (Rockwell Extra Bold, assets/fonts) loads after the first fit: fit again once it is in
    useEffect(() => { if (fmt === '2') void document.fonts?.load('200pt "Rockwell Extra Bold"').then(() => { if (sheetsRef.current) fitSheets(sheetsRef.current); }); }, [sheetsHtml, fmt]);

    function toggleDest(id: string, on: boolean) {
        const nextPicked = on ? [...picked, id] : picked.filter(x => x !== id);
        const nextOff = [...off.filter(o => !DESTS.some(d => d.id === o)), ...DESTS.map(d => d.id).filter(x => !nextPicked.includes(x))];
        setOff(nextOff);
        try { localStorage.setItem(OFF_KEY, JSON.stringify(nextOff)); localStorage.removeItem(OLD_PICK_KEY); } catch { /* ignore */ }
    }
    // Every print opens its own tab with a preview of the pages, then the print dialog (as the slips do): the sheets, the summary and the luggage sheets
    function printTab(title: string, wrapCls: string, html: string) {
        const w = window.open('', '_blank');
        if (!w) { setMsg('The browser blocked the new tab. Allow pop-ups for this site, then press Print again.'); return; }
        const font = new URL('assets/fonts/rockwell-extra-bold.ttf', document.baseURI).href;
        const css2 = css.replace('url("assets/fonts/rockwell-extra-bold.ttf")', `url("${font}")`);
        w.document.open();
        w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>${title}</title><style>${css2}
            body { margin: 0; background: #eee; font-family: Arial, Helvetica, sans-serif; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            .tq-sheets { padding: 12px 12px 30px; } .tq-summary, .tq-lugsheets { display: block !important; max-width: 1060px; margin: 12px auto; padding: 8mm; background: #fff; }
            @media print { body { background: #fff; } .tq-summary, .tq-lugsheets { max-width: none; margin: 0; padding: 0; } }
        </style></head><body><div class="${wrapCls}">${html}</div><script>
            (async function () {
                try { await document.fonts.load('200pt "Rockwell Extra Bold"'); } catch (e) { }
                (${fitSheets.toString()})(document); (${fitLuggage.toString()})(document);
                setTimeout(function () { window.focus(); window.print(); }, 300);
            })();
        <\/script></body></html>`);
        w.document.close();
    }
    const printSheets = () => printTab(`Bus sheets ${day}`, 'tq-sheets', pages.join(''));
    const printSummary = () => { if (L) printTab(`Bus summary ${day}`, 'tq-summary', summary(L, day, chosen())); };
    const lugGroups = groups.filter(g => g.buses.length);
    const lugCount = groups.filter(g => !lugOff.includes(g.dest.id)).reduce((s, g) => s + g.buses.length, 0);
    const printLug = () => printTab(`Luggage sheets ${day}`, 'tq-lugsheets', groups.filter(g => !lugOff.includes(g.dest.id)).flatMap(g => g.buses.map((b: Row) => luggageSheet(T, b))).join(''));
    // the summary as one picture on the clipboard: drawn off-screen (so it has its styles), each destination's table stacked
    async function copySummaryImage() {
        if (!L) return;
        setMsg(''); setNote('');
        const host = document.createElement('div');
        host.className = 'tq-summary';
        host.style.cssText = 'display:block;position:fixed;left:-10000px;top:0;width:1000px;background:#fff';
        host.innerHTML = summary(L, day, chosen());
        document.body.appendChild(host);
        try {
            const lib = await loadCore('table-image');
            const how = await lib.copyTablesImage([...host.querySelectorAll('table')], `bus-summary-${day}.png`);
            setNote(how === 'copied' ? 'Summary copied as a picture — paste it into the chat.' : 'This browser cannot copy pictures — the image was downloaded instead.');
        } catch (e: any) { setMsg('Could not make the image: ' + (e?.message || e)); }
        finally { host.remove(); }
    }
    async function toExcel(what: 'sheets' | 'summary') {
        setXl(what); setMsg('');
        try { await (what === 'sheets' ? libs.ex.exportSheets : libs.ex.exportSummary)(day, chosen(), site.label); }
        catch (e: any) { setMsg(e?.message || 'Could not make the Excel file.'); }
        finally { setXl(''); }
    }

    const none = !pages.length;
    return (
        <>
            <style>{css}</style>
            <div className="tq-tools mx-auto grid grid-cols-[minmax(0,1fr)] max-w-[2400px] min-w-0 gap-3 px-3 pt-4 sm:px-4">
                <header className="flex flex-wrap items-start justify-between gap-3">
                    <div><h1 className="text-2xl font-bold text-primary">Bus sheets</h1><p className="text-sm text-muted-foreground">One page per bus, to stick on the bus. {fmt === '2' ? 'Format two prints A4 portrait.' : 'Format one prints A4 landscape — choose “Landscape” if the printer asks.'}</p></div>
                    <div className="flex flex-wrap gap-2">
                        <Button asChild variant="outline"><a href={href('transport', { day })}>🚌 Transport day</a></Button>
                        <select aria-label="Sign format" className="h-9 rounded-md border bg-background px-2 text-sm" value={fmt} onChange={e => pickFmt(e.target.value as '1' | '2')} title="The layout of the bus sign"><option value="1">Format 1 — landscape</option><option value="2">Format 2 — portrait, big number</option></select>
                        <Button disabled={none} onClick={printSheets}><Printer className="size-4" />Print</Button>
                        <Button variant="outline" title="One A4 landscape page per bus: the groups on it" onClick={() => setLugOpen(o => !o)}>🧳 Luggage sheet</Button>
                        <Button variant="outline" disabled={none || !L} title="One list of all the chosen trips of the day" onClick={printSummary}>📋 Print summary</Button>
                        <Button variant="outline" disabled={none || !L} title="The summary tables as one picture on the clipboard, to paste into a chat" onClick={() => void copySummaryImage()}><ImageDown className="size-4" />Copy summary image</Button>
                        <Button variant="outline" disabled={none || !libs || !!xl} title="The chosen bus sheets as an Excel file (one block per bus, a page break after each)" onClick={() => void toExcel('sheets')}>{xl === 'sheets' ? '⏳ Building…' : '📊 Excel: sheets'}</Button>
                        <Button variant="outline" disabled={none || !libs || !!xl} title="The print summary as an Excel file" onClick={() => void toExcel('summary')}>{xl === 'summary' ? '⏳ Building…' : '📊 Excel: summary'}</Button>
                        {cloud.canOpen('tosha') && <Button asChild variant="outline"><a href={href('tosha')} title="Travel refreshments for tomorrow's and today's buses">🥪 Tosha summary</a></Button>}
                    </div>
                </header>
                <DayNav day={day} days={days} onChange={d => navigate('transport-print', { day: d })} />
                <Card className="flex-row flex-wrap items-center gap-x-4 gap-y-2 p-3">
                    <span className="font-bold text-primary">Destinations</span>
                    {groups.map(g => <label key={g.dest.id} className="inline-flex items-center gap-1.5 text-sm font-semibold"><Checkbox checked={picked.includes(g.dest.id)} onCheckedChange={v => toggleDest(g.dest.id, v === true)} />{g.dest.title} <span className="font-normal text-muted-foreground">({g.buses.length})</span></label>)}
                    <label className="inline-flex items-center gap-2 text-sm">Only bus no. <Input className="h-8 w-28" placeholder="e.g. 3, 5-7" inputMode="numeric" value={only} onChange={e => setOnly(e.target.value)} /></label>
                    <span className="text-sm text-muted-foreground">{pages.length} sheet{pages.length === 1 ? '' : 's'}</span>
                </Card>
                {lugOpen && <Card className="gap-2 p-3">
                    <div><b>Luggage sheet</b> <span className="text-sm text-muted-foreground">— one A4 landscape page per bus. Tick the routes to print.</span></div>
                    <div className="flex flex-wrap gap-x-4 gap-y-2">{lugGroups.length ? lugGroups.map(g => <label key={g.dest.id} className="inline-flex items-center gap-1.5 text-sm font-semibold"><Checkbox checked={!lugOff.includes(g.dest.id)} onCheckedChange={v => setLugOff(o => (v === true ? o.filter(x => x !== g.dest.id) : [...o, g.dest.id]))} />{g.dest.title} <span className="font-normal text-muted-foreground">({g.buses.length})</span></label>) : <span className="text-sm text-muted-foreground">No buses on this day.</span>}</div>
                    <div className="flex flex-wrap items-center gap-2"><Button disabled={!lugCount} onClick={printLug}>🖨️ Print luggage sheets</Button><span className="text-sm text-muted-foreground">{lugCount} page{lugCount === 1 ? '' : 's'}</span></div>
                </Card>}
                {note && <div className="rounded-md border border-ok/40 bg-ok-soft px-3 py-2 text-sm text-ok">{note}</div>}
                {msg && <div className="rounded-md border border-destructive bg-destructive/10 px-3 py-2 text-sm text-destructive">{msg}</div>}
            </div>
            <div ref={sheetsRef} className="tq-sheets" dangerouslySetInnerHTML={{ __html: sheetsHtml }} />
        </>
    );
}
