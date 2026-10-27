import { useEffect, useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLoadApp } from '@/pms/PmsContext';

// Change log (Data): every deployed change, by feature or day by day. The data (views/changelog/data.js) is regenerated from the GitHub history at
// every deploy; this page imports it at run time instead of bundling it, so a deploy never needs a React rebuild for a new entry.

type Change = { d: string; h?: string; f: string; m: string };
type Data = { FEATURES: Record<string, string>; CHANGES: Change[]; DEPLOYS: { at: string; w: string }[] };

const dmy = (d: string) => new Date(`${d}T12:00`).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
const dayLong = (d: string) => new Date(`${d}T12:00`).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
const monthOf = (d: string) => new Date(`${d.slice(0, 7)}-15T12:00`).toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
const REPO = 'https://github.com/faizehashemi/faizehashemi.github.io/commit/';

const Commit = ({ c }: { c: Change }) => c.h ? <> <a className="inline-block px-1 py-1 font-mono text-xs text-primary underline" href={REPO + c.h} target="_blank" rel="noopener">{c.h}</a></> : null;

function Kpi({ label, value, sub }: { label: string; value: React.ReactNode; sub: string }) {
    return <div className="grid gap-0.5 rounded-xl border bg-card p-3"><span className="text-xs text-muted-foreground">{label}</span><b className="text-2xl">{value}</b><small className="text-xs text-muted-foreground">{sub}</small></div>;
}

export default function ChangelogPage() {
    const loadApp = useLoadApp();
    const [data, setData] = useState<Data | null>(null);
    const [failed, setFailed] = useState(false);
    const [q, setQ] = useState('');
    const [mode, setMode] = useState<'feature' | 'time'>('feature');
    useEffect(() => { loadApp('views/changelog/data.js').then(setData).catch(() => setFailed(true)); }, []);   // eslint-disable-line react-hooks/exhaustive-deps

    const view = useMemo(() => {
        if (!data) return null;
        const { FEATURES, CHANGES } = data, qq = q.trim().toLowerCase();
        const rows = CHANGES.filter(c => !qq || c.m.toLowerCase().includes(qq) || (FEATURES[c.f] || '').toLowerCase().includes(qq));
        const days = [...new Set(CHANGES.map(c => c.d))];
        return { rows, days, since: CHANGES.filter(c => c.d >= '2026-09-27').length, features: new Set(CHANGES.map(c => c.f)).size, lastCount: CHANGES.filter(c => c.d === days[days.length - 1]).length };
    }, [data, q]);

    if (failed) return <p className="p-6 text-destructive">Could not load the change log.</p>;
    if (!data || !view) return <p className="p-6 text-muted-foreground">Loading…</p>;
    const { FEATURES, CHANGES, DEPLOYS } = data, { rows, days } = view;

    let body: React.ReactNode;
    if (!rows.length) body = <Card><CardContent className="text-muted-foreground">Nothing matches.</CardContent></Card>;
    else if (mode === 'feature') {
        const ids = [...new Set(rows.map(c => c.f))];
        // newest-touched feature first; inside each, newest change first
        const last = (id: string) => rows.filter(c => c.f === id).at(-1)!.d;
        ids.sort((a, b) => last(b).localeCompare(last(a)) || (FEATURES[a] || a).localeCompare(FEATURES[b] || b));
        body = (
            <div className="grid gap-2">{ids.map(id => {
                const list = rows.filter(c => c.f === id).reverse();
                return (
                    <Card key={id} className="py-0"><details open={!!q.trim() || ids.length <= 3} className="group">
                        <summary className="flex cursor-pointer flex-wrap items-center gap-2 p-3"><b>{FEATURES[id] || id}</b><Badge variant="secondary">{list.length}</Badge><small className="text-muted-foreground">{dmy(list[list.length - 1].d)} – {dmy(list[0].d)}</small></summary>
                        <ul className="grid gap-1.5 border-t p-3 text-sm">{list.map((c, i) => <li key={i} className="grid gap-x-3 sm:grid-cols-[7.5rem_1fr]"><time className="text-muted-foreground">{dmy(c.d)}</time><span className="min-w-0 break-words">{c.m}<Commit c={c} /></span></li>)}</ul>
                    </details></Card>
                );
            })}</div>
        );
    } else {
        const byDay = [...new Set(rows.map(c => c.d))].reverse();
        let month = '';
        body = (
            <Card><CardContent className="grid gap-3">{byDay.map(d => {
                const m = monthOf(d), head = m !== month ? <h2 key={`m-${d}`} className="mt-2 text-lg font-bold text-primary">{m}</h2> : null;
                month = m;
                return (
                    <div key={d} className="grid gap-1.5">{head}
                        <h3 className="font-bold">{dayLong(d)}</h3>
                        <ul className="grid gap-1.5 text-sm">{rows.filter(c => c.d === d).map((c, i) => <li key={i} className="flex flex-wrap items-start gap-2"><Badge variant="secondary">{FEATURES[c.f] || c.f}</Badge><span className="min-w-0 flex-1 break-words">{c.m}<Commit c={c} /></span></li>)}</ul>
                    </div>
                );
            })}</CardContent></Card>
        );
    }

    return (
        <div className="mx-auto grid grid-cols-[minmax(0,1fr)] max-w-[2400px] min-w-0 gap-3 px-3 pb-10 pt-4 sm:px-4">
            <header className="flex flex-wrap items-end justify-between gap-3">
                <div className="min-w-0 flex-1"><h1 className="text-2xl font-bold text-primary">Change log</h1><p className="text-sm text-muted-foreground">Every change deployed to the PMS since the first page, by feature or day by day.</p></div>
                <div className="flex flex-wrap items-end gap-3">
                    <div className="grid gap-1"><Label htmlFor="clQ">Search</Label><Input id="clQ" type="search" placeholder="e.g. laundry, print, KG" autoComplete="off" value={q} onChange={e => setQ(e.target.value)} /></div>
                    <Tabs value={mode} onValueChange={v => setMode(v as 'feature' | 'time')}><TabsList><TabsTrigger value="feature">By feature</TabsTrigger><TabsTrigger value="time">Day by day</TabsTrigger></TabsList></Tabs>
                </div>
            </header>
            <section className="grid grid-cols-2 gap-2 md:grid-cols-4">
                <Kpi label="Changes" value={CHANGES.length} sub={`${view.since} since the cloud PMS (27 Sep 2026)`} />
                <Kpi label="Deploy days" value={days.length} sub={`first ${dmy(days[0])}`} />
                <Kpi label="Features" value={view.features} sub="areas of the PMS" />
                <Kpi label="Latest" value={dmy(days[days.length - 1])} sub={`${view.lastCount} change(s) that day`} />
            </section>
            {body}
            <Card className="gap-2"><CardContent className="grid gap-2">
                <h2 className="text-base font-bold text-primary">Latest Cloudflare deploys</h2>
                <p className="text-xs text-muted-foreground">Site = pages and screens (pms-web) · API = server and database (pms-api). Cloudflare keeps only the last few; the list above is the full history.</p>
                <div className="overflow-x-auto"><Table><TableHeader><TableRow><TableHead>When</TableHead><TableHead>What</TableHead></TableRow></TableHeader>
                    <TableBody>{DEPLOYS.map((x, i) => <TableRow key={i}><TableCell className="whitespace-nowrap">{new Date(x.at).toLocaleString(undefined, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</TableCell><TableCell>{x.w === 'site' ? 'Site (pages and screens)' : 'API (server and database)'}</TableCell></TableRow>)}</TableBody></Table></div>
            </CardContent></Card>
        </div>
    );
}
