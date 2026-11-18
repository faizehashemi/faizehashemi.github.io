import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSlips } from '@/hooks/useSlips';
import { useCore, useGuard, useLoadApp, useLoadCore, useSite } from '@/pms/PmsContext';
import { computeOccupancy, type BuildingIn } from '@/pages/occupancy/occupancy';
import { REPORTS, daysOf, docHtml, kgDoc, laundryDoc, mawaidDoc, occupancyDoc, plus, softdevDoc, transportDoc, websiteDoc, ymd, type Doc, type ReportId } from './reports';

// Reports (main menu): a card per report; a card opens a window for the From → To dates and "Download PDF", which works the report out from the
// latest data and opens it in a print tab (Save as PDF). The numbers and the printed design are in reports.ts.

type Row = Record<string, any>;

export default function ReportsPage() {
    const { rooms: R, stay, cloud, transport: T } = useCore() as any;
    const guard = useGuard();
    const loadCore = useLoadCore();
    const loadApp = useLoadApp();
    const { site, siteId } = useSite();
    const slips = useSlips();
    const builders = useQuery({ queryKey: ['buildings-force', siteId], queryFn: async () => R.buildingsOfSite(await guard(R.loadBuildings({ force: true })), siteId) as Row[] });
    const today = ymd(new Date());
    const [open, setOpen] = useState<ReportId | null>(null);
    const [from, setFrom] = useState(today.slice(0, 8) + '01'), [to, setTo] = useState(today);
    const [busy, setBusy] = useState(''), [err, setErr] = useState('');
    const rep = REPORTS.find(r => r.id === open);
    const span = daysOf(from, to).length;
    const tooLong = !!rep?.maxDays && span > rep.maxDays;

    async function build(id: ReportId, f: string, t: string): Promise<Doc> {
        const b = { site: site.label, from: f, to: t };
        const days = daysOf(f, t);
        if (id === 'mawaid') {
            const meals = await loadCore('meals'), all = slips.data ?? [];
            const opts = { ...meals.MEAL_DEFAULTS, incChildren: siteId === 'medina' };   // as the Mawaid page counts by default
            return mawaidDoc(b, days, days.map(d => meals.mealThalsFor(all, d, opts)));
        }
        if (id === 'occupancy') {
            const blds: BuildingIn[] = (builders.data ?? []).map((x: Row) => ({ name: x.name, rooms: x.rooms.filter((r: Row) => r.active !== false && Number(r.capacity) > 0).map((r: Row) => ({ ...r, until: R.handedAt(r) ?? undefined })) })).filter((x: BuildingIn) => x.rooms.length);
            return occupancyDoc(b, computeOccupancy(slips.data ?? [], blds, { from: f, to: t, perRoom: false }, stay, R));
        }
        if (id === 'transport') {
            const saved = new Set<string>(((await guard(T.listDays(siteId))) as (string | Row)[]).map(d => (typeof d === 'string' ? d : d.day)));
            const want = days.filter(d => saved.has(d));
            const loaded = await Promise.all(want.map(d => T.loadDay(siteId, d).then((x: Row) => x.rows || [], () => [])));
            const dests = (T.DESTS_BY_SITE?.[siteId] || []) as Row[], norm = (s: string) => String(s || '').toUpperCase().replace(/\s+/g, ' ').trim();
            const label = (route: string) => dests.find(x => norm(x.route) === norm(route))?.title || (route ? norm(route).split('-').slice(1).join('-').toLowerCase().replace(/\b\w/g, c => c.toUpperCase()) : '');
            return transportDoc(b, want.map((day, i) => ({ day, rows: loaded[i], ride: T.resolve(loaded[i]) })), label);
        }
        if (id === 'website') {
            const back = Math.min(90, Math.max(1, daysOf(f, today).length));
            return websiteDoc(b, await guard(cloud.request('GET', `/api/perf/summary?days=${back}&site=${siteId}`)) as Row);
        }
        if (id === 'softdev') return softdevDoc(b, await loadApp('views/changelog/data.js'));
        if (id === 'kg') return kgDoc(b, await guard(cloud.request('GET', `/api/kg?site=${siteId}`)) as Row as any);
        const { bills } = (await guard(cloud.request('GET', `/api/laundry/bills?site=${siteId}&from=${f}&to=${t}&all=1`))) as Row;
        return laundryDoc(b, bills);
    }

    async function download() {
        if (!rep) return;
        const [f, t] = from <= to ? [from, to] : [to, from];
        // the tab opens on the click (a tab opened after waiting for data is blocked as a pop-up), then gets the report
        const w = window.open('', '_blank');
        if (!w) { setErr('The browser blocked the new tab. Allow pop-ups for this site, then try again.'); return; }
        w.document.write('<p style="font:16px system-ui;padding:24px">Preparing the report…</p>');
        setBusy(rep.id); setErr('');
        try {
            const html = docHtml(await build(rep.id, f, t));
            w.document.open(); w.document.write(html.replace('</body>', `<script>(async function(){try{await document.fonts.ready}catch(e){}setTimeout(function(){window.focus();window.print()},400)})()<\/script></body>`)); w.document.close();
            setOpen(null);
        } catch (e: any) { w.close(); setErr(e?.message || String(e)); }
        finally { setBusy(''); }
    }
    const preset = (f: string, t: string) => { setFrom(f); setTo(t); };
    const ms = today.slice(0, 8) + '01', lastEnd = plus(ms, -1);

    return (
        <div className="mx-auto grid max-w-[1500px] gap-5 px-3 pb-12 pt-4 sm:px-5">
            <header className="relative overflow-hidden rounded-3xl bg-[radial-gradient(120%_140%_at_100%_0%,#7c5a1c_0%,#0b1020_60%)] px-6 py-8 text-white shadow-xl sm:px-10">
                <div className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[#f5d78e]">{site.label} · Reports</div>
                <h1 className="mt-2 font-serif text-4xl font-black tracking-tight sm:text-5xl">Reports</h1>
                <p className="mt-2 max-w-2xl text-sm text-[#fde7b0]/90">Pick a report, choose the dates, and download a print-ready PDF.</p>
                <div className="pointer-events-none absolute -bottom-24 -right-16 size-72 rounded-full border border-white/15 shadow-[0_0_0_28px_rgba(255,255,255,0.03),0_0_0_56px_rgba(255,255,255,0.02)]" />
            </header>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {REPORTS.map(r => (
                    <button key={r.id} type="button" onClick={() => { setOpen(r.id); setErr(''); }}
                        className="group relative flex min-h-44 flex-col gap-2 overflow-hidden rounded-2xl border bg-card p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2"
                        style={{ borderTop: `6px solid ${r.hue}` }}>
                        <span className="grid size-12 place-items-center rounded-xl text-2xl" style={{ background: `${r.hue}1a` }} aria-hidden>{r.icon}</span>
                        <b className="font-serif text-xl leading-tight">{r.title}</b>
                        <span className="text-sm text-muted-foreground">{r.blurb}</span>
                        <span className="mt-auto pt-2 text-sm font-semibold" style={{ color: r.hue }}>Choose dates → PDF</span>
                    </button>))}
            </div>
            {err && !open && <p className="text-sm text-destructive">{err}</p>}
            <Dialog open={!!open} onOpenChange={o => { if (!o) setOpen(null); }}>
                <DialogContent className="max-w-md">
                    {rep && <>
                        <DialogHeader><DialogTitle className="flex items-center gap-2 font-serif text-2xl"><span aria-hidden>{rep.icon}</span>{rep.title}</DialogTitle>
                            <DialogDescription>{rep.blurb}.</DialogDescription></DialogHeader>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="grid gap-1"><Label htmlFor="rf">From</Label><Input id="rf" type="date" value={from} max={to} onChange={e => setFrom(e.target.value || from)} /></div>
                            <div className="grid gap-1"><Label htmlFor="rt">To</Label><Input id="rt" type="date" value={to} min={from} onChange={e => setTo(e.target.value || to)} /></div>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                            <Button size="sm" variant="outline" onClick={() => preset(today, today)}>Today</Button>
                            <Button size="sm" variant="outline" onClick={() => preset(plus(today, -6), today)}>Last 7 days</Button>
                            <Button size="sm" variant="outline" onClick={() => preset(ms, today)}>This month</Button>
                            <Button size="sm" variant="outline" onClick={() => preset(lastEnd.slice(0, 8) + '01', lastEnd)}>Last month</Button>
                        </div>
                        {tooLong && <p className="text-sm text-destructive">At most {rep.maxDays} days for this report — {span} chosen.</p>}
                        {rep.id === 'website' && <p className="text-xs text-muted-foreground">The site keeps page visits for 90 days.</p>}
                        {err && <p className="text-sm text-destructive">{err}</p>}
                        <Button size="lg" disabled={!!busy || tooLong || (rep.id === 'mawaid' || rep.id === 'occupancy' ? !slips.data || (rep.id === 'occupancy' && !builders.data) : false)} onClick={() => void download()} style={{ background: rep.hue }} className="text-white hover:opacity-90">
                            <Download className="size-4" />{busy ? 'Preparing…' : 'Download PDF'}</Button>
                        <p className="text-xs text-muted-foreground">Opens in a new tab: choose “Save as PDF” in the print window.</p>
                    </>}
                </DialogContent>
            </Dialog>
        </div>
    );
}
