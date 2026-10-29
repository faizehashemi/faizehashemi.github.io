import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageHeader } from '@/components/PageHeader';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { useCore, useGuard, useViews } from '@/pms/PmsContext';
import { DenialsSection, type Denial } from './Denials';
import { IssuesSection, type IssueRow } from './Issues';

// Performance & feedback (Data, admins): page timings from every desk's browser (core/telemetry.js → perf_events) and the in-page feedback
// (core/feedback.js → feedback). Server: GET /api/perf/summary, GET /api/feedback, PATCH /api/feedback/:id, GET /api/slip-denials.

type Group = { key: string; n: number; min?: number | null; p10?: number | null; p25?: number | null; p75?: number | null; max?: number | null; p50?: number | null; p95?: number | null; server_p50?: number | null; calls?: number; errors?: number; stars?: number | null; ratings?: number };
type Summary = {
    totals: { routes: number; desks: number; loads: number; p50?: number | null; p95?: number | null; errors: number; feedback: number; stars?: number | null };
    pages: Group[]; device: Group[]; browser: Group[]; net: Group[]; os: Group[]; app: Group[]; site_groups: Group[]; colo: Group[]; build: Group[]; day: Group[];
    vitals: Record<string, number | null>; errors: { at: string; page: string; err: string; desk: string; device?: string; browser?: string }[];
};
type Feedback = { id: number; rating: number; status: string; page: string; at: string; desk?: string; site?: string; trigger?: string; tags?: string; text?: string; page_ms?: number | null; device?: string; browser?: string; net_type?: string; colo?: string; country?: string; build?: string };

const sec = (ms?: number | null) => ms == null ? '—' : ms < 1000 ? `${ms} ms` : `${(ms / 1000).toFixed(ms < 10000 ? 2 : 1)} s`;
const when = (iso?: string) => iso ? new Date(iso).toLocaleString(undefined, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '';
const stars = (n: number) => '★'.repeat(n) + '☆'.repeat(5 - n);
// a colour for a page time: green under 1 s, amber under 3 s, red above
const toneOf = (ms?: number | null) => ms == null ? '' : ms < 1000 ? 'ok' : ms < 3000 ? 'mid' : 'bad';
const toneClass = (t: string) => t === 'ok' ? 'text-ok' : t === 'mid' ? 'text-warn' : t === 'bad' ? 'text-destructive' : '';
const PTAB_LABEL: Record<string, string> = { overview: 'Overview', issues: 'Issues', refused: 'Refused saves', feedback: 'Feedback', errors: 'Errors' };
const none = <p className="p-3 text-sm text-muted-foreground">No data yet.</p>;

function Kpi({ label, value, sub, tone }: { label: string; value: React.ReactNode; sub?: string; tone?: string }) {
    return (
        <div className={cn('grid gap-0.5 rounded-xl border bg-card p-3', tone === 'ok' && 'border-ok/40', tone === 'bad' && 'border-destructive/40', tone === 'mid' && 'border-warn/40')}>
            <span className="text-xs text-muted-foreground">{label}</span><b className={cn('text-2xl', toneClass(tone || ''))}>{value ?? '—'}</b>{sub && <small className="text-xs text-muted-foreground">{sub}</small>}
        </div>
    );
}

function Block({ title, note, children }: { title: string; note?: string; children: React.ReactNode }) {
    return (
        <Card className="min-w-0 gap-0 py-0">
            <CardHeader className="border-b py-3"><CardTitle className="text-base">{title}{note && <span className="ml-2 text-xs font-normal text-muted-foreground">{note}</span>}</CardTitle></CardHeader>
            <CardContent className="overflow-x-auto p-0">{children}</CardContent>
        </Card>
    );
}

function GroupTable({ rows, label }: { rows: Group[]; label: string }) {
    if (!rows.length) return none;
    return (
        <Table>
            <TableHeader><TableRow><TableHead>{label}</TableHead><TableHead className="text-right">Opened</TableHead><TableHead className="text-right">Typical</TableHead><TableHead className="text-right">Slow (95%)</TableHead><TableHead className="text-right">Server</TableHead></TableRow></TableHeader>
            <TableBody>{rows.map(g => (
                <TableRow key={g.key}><TableCell>{g.key}</TableCell><TableCell className="text-right">{g.n}</TableCell>
                    <TableCell className={cn('text-right', toneClass(toneOf(g.p50)))}>{sec(g.p50)}</TableCell><TableCell className={cn('text-right', toneClass(toneOf(g.p95)))}>{sec(g.p95)}</TableCell><TableCell className="text-right">{sec(g.server_p50)}</TableCell></TableRow>
            ))}</TableBody>
        </Table>
    );
}

// The Pages table: every column sorts, highest to lowest and back (click the heading again). Times in seconds.
type PageCol = { id: string; label: string; get: (g: Group & { name: string }) => number | string | null | undefined; time?: boolean };
const PAGE_COLS: PageCol[] = [
    { id: 'name', label: 'Page', get: g => g.name },
    { id: 'n', label: 'Opened', get: g => g.n },
    { id: 'min', label: 'Fastest', get: g => g.min, time: true },
    { id: 'p10', label: 'P10', get: g => g.p10, time: true },
    { id: 'p25', label: 'P25', get: g => g.p25, time: true },
    { id: 'p50', label: 'P50 (typical)', get: g => g.p50, time: true },
    { id: 'p75', label: 'P75', get: g => g.p75, time: true },
    { id: 'p95', label: 'P95 (slow)', get: g => g.p95, time: true },
    { id: 'max', label: 'Worst', get: g => g.max, time: true },
    { id: 'server', label: 'Server', get: g => g.server_p50, time: true },
    { id: 'calls', label: 'Calls', get: g => g.calls },
    { id: 'errors', label: 'Errors', get: g => g.errors ?? 0 },
];
function PagesTable({ rows, pageName }: { rows: Group[]; pageName: (id?: string) => string }) {
    const [sort, setSort] = useState<{ id: string; dir: 1 | -1 }>({ id: 'n', dir: -1 });
    const list = useMemo(() => {
        const col = PAGE_COLS.find(c => c.id === sort.id)!;
        return rows.map(g => ({ ...g, name: pageName(g.key) })).sort((x, y) => {
            const a = col.get(x), b = col.get(y);
            if (a == null && b == null) return 0;
            if (a == null) return 1;          // empty cells always last
            if (b == null) return -1;
            return (typeof a === 'string' ? a.localeCompare(String(b)) : Number(a) - Number(b)) * sort.dir;
        });
    }, [rows, sort, pageName]);
    if (!rows.length) return none;
    return (
        <Table>
            <TableHeader><TableRow>{PAGE_COLS.map(c => (
                <TableHead key={c.id} className={c.id === 'name' ? '' : 'text-right'} aria-sort={sort.id === c.id ? (sort.dir === 1 ? 'ascending' : 'descending') : 'none'}>
                    <button type="button" className="inline-flex items-center gap-1 whitespace-nowrap font-semibold hover:text-primary" title="Sort highest to lowest, click again for lowest to highest"
                        onClick={() => setSort(s => (s.id === c.id ? { id: c.id, dir: (-s.dir) as 1 | -1 } : { id: c.id, dir: c.id === 'name' ? 1 : -1 }))}>
                        {c.label}<span className={cn('text-[10px]', sort.id === c.id ? 'text-primary' : 'text-muted-foreground/60')}>{sort.id === c.id ? (sort.dir === 1 ? '▲' : '▼') : '⇅'}</span>
                    </button>
                </TableHead>))}</TableRow></TableHeader>
            <TableBody>{list.map(g => (
                <TableRow key={g.key}>{PAGE_COLS.map(c => {
                    const v = c.get(g);
                    if (c.id === 'name') return <TableCell key={c.id}><b>{g.name}</b></TableCell>;
                    if (c.time) return <TableCell key={c.id} className={cn('text-right', c.id !== 'server' && toneClass(toneOf(v as number | null)))}>{sec(v as number | null)}</TableCell>;
                    return <TableCell key={c.id} className={cn('text-right', c.id === 'errors' && v ? 'text-destructive' : '')}>{v || (c.id === 'errors' ? '' : v)}</TableCell>;
                })}</TableRow>
            ))}</TableBody>
        </Table>
    );
}

export default function PerformancePage() {
    const { cloud } = useCore();
    const guard = useGuard();
    const views = useViews();
    const qc = useQueryClient();
    const isAdmin = cloud.currentDesk()?.role === 'admin';
    const [days, setDays] = useState('7'), [site, setSite] = useState('all'), [ptab, setPtab] = useState('overview');
    const [fbStars, setFbStars] = useState('all'), [fbStatus, setFbStatus] = useState('all'), [fbPage, setFbPage] = useState('all');
    const pageName = (id?: string) => views.find(v => v.id === id)?.label || id || '—';

    const data = useQuery({
        queryKey: ['perf', days, site], enabled: isAdmin,
        queryFn: async () => {
            const [s, f, dn, is] = await guard(Promise.all([
                cloud.request('GET', `/api/perf/summary?days=${days}${site !== 'all' ? `&site=${site}` : ''}`),
                cloud.request('GET', `/api/feedback?days=${Math.max(30, Number(days))}`),
                cloud.request('GET', `/api/slip-denials?days=${days}${site !== 'all' ? `&site=${site}` : ''}`),
                cloud.request('GET', `/api/issues?days=${Math.max(30, Number(days))}`).catch(() => ({ issues: [] })),   // an older Worker has no issue reports yet
            ])) as [Summary, { feedback: Feedback[] }, { denials: Denial[] }, { issues: IssueRow[] }];
            return { s, fb: f.feedback.filter(x => site === 'all' || x.site === site), denials: dn.denials, issues: is.issues.filter(x => site === 'all' || x.site === site) };
        },
    });
    const setStatus = useMutation({
        mutationFn: ({ id, status }: { id: number; status: string }) => guard(cloud.request('PATCH', `/api/feedback/${id}`, { status })),
        onSuccess: (_r, v) => qc.setQueryData(['perf', days, site], (old: any) => old && ({ ...old, fb: old.fb.map((f: Feedback) => f.id === v.id ? { ...f, status: v.status } : f) })),
    });

    const fb = data.data?.fb ?? [];
    const fbPages = useMemo(() => [...new Set(fb.map(f => f.page))].sort(), [fb]);
    const fbList = fb.filter(f => (fbStars === 'all' || (fbStars === '1-2' ? f.rating <= 2 : fbStars === '3' ? f.rating === 3 : f.rating >= 4)) && (fbStatus === 'all' || f.status === fbStatus) && (fbPage === 'all' || f.page === fbPage));

    if (!isAdmin) return <p className="mx-auto max-w-3xl p-6 text-destructive">Only admin logins can see performance and feedback.</p>;
    const s = data.data?.s;
    const t = s?.totals;
    const den = data.data?.denials ?? [];
    const dayMax = Math.max(1, ...(s?.day ?? []).map(d => d.p50 || 0));
    // add-ons of another site (Cloudflare's visitor counter, stopped by ad blockers) are not PMS errors
    const errs = (s?.errors ?? []).filter(e => !/cloudflareinsights/i.test(e.err || ''));
    const newIssues = (data.data?.issues ?? []).filter(i => i.status === 'new').length;
    const newFb = fb.filter(f => f.status === 'new').length;
    const denToday = den.filter(d => new Date(d.at).toDateString() === new Date().toDateString()).length;

    return (
        <div className="mx-auto grid grid-cols-[minmax(0,1fr)] max-w-[2400px] min-w-0 gap-3 px-3 pb-10 pt-4 sm:px-4">
            <header className="flex flex-wrap items-end justify-between gap-3">
                <div className="min-w-0 flex-1">
                    <PageHeader view="performance" title="Performance & feedback" current={PTAB_LABEL[ptab]} />
                    <p className="mt-1 text-sm text-muted-foreground">How long pages take on the desks' own devices and connections, what breaks, and what the desks say about each page.</p>
                </div>
                <div className="flex flex-wrap items-end gap-2">
                    <Select value={days} onValueChange={setDays}><SelectTrigger className="w-40" aria-label="Period"><SelectValue /></SelectTrigger>
                        <SelectContent><SelectItem value="1">Last 24 hours</SelectItem><SelectItem value="7">Last 7 days</SelectItem><SelectItem value="30">Last 30 days</SelectItem><SelectItem value="90">Last 90 days</SelectItem></SelectContent></Select>
                    <Select value={site} onValueChange={setSite}><SelectTrigger className="w-36" aria-label="Site"><SelectValue /></SelectTrigger>
                        <SelectContent><SelectItem value="all">Both sites</SelectItem><SelectItem value="makkah">Makkah</SelectItem><SelectItem value="medina">Medina</SelectItem></SelectContent></Select>
                    <Button variant="outline" onClick={() => void data.refetch()}><RefreshCw className={cn('size-4', data.isFetching && 'animate-spin')} />Refresh</Button>
                </div>
            </header>
            {data.isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
            {data.isError && <p className="text-sm text-destructive">{data.error instanceof cloud.UserError ? data.error.message : 'Could not load.'}</p>}
            {s && !s.totals.routes && <p className="text-sm text-muted-foreground">No page timings yet — they arrive as desks use the PMS (sent every few minutes).</p>}

            {s && t && <>
                <Tabs value={ptab} onValueChange={setPtab} className="gap-3">
                    <TabsList variant="underline">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="issues">Issues{newIssues ? ` (${newIssues} new)` : ''}</TabsTrigger>
                        <TabsTrigger value="refused">Refused saves{denToday ? ` (${denToday} today)` : ''}</TabsTrigger>
                        <TabsTrigger value="feedback">Feedback{newFb ? ` (${newFb} new)` : ''}</TabsTrigger>
                        <TabsTrigger value="errors">Errors{errs.length ? ` (${errs.length})` : ''}</TabsTrigger>
                    </TabsList>
                    <TabsContent value="overview" className="grid gap-3">
                <section className="grid grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-6">
                    <Kpi label="Pages opened" value={t.routes} sub={`${t.desks} login${t.desks === 1 ? '' : 's'} · ${t.loads} full loads`} />
                    <Kpi label="Typical page" value={sec(t.p50)} sub="median, menu click → page drawn" tone={toneOf(t.p50)} />
                    <Kpi label="Slow pages" value={sec(t.p95)} sub="95% of openings are faster" tone={toneOf(t.p95)} />
                    <Kpi label="Errors" value={t.errors} sub="pages that failed / script errors" tone={t.errors ? 'bad' : 'ok'} />
                    <Kpi label="Slip saves refused" value={den.length} sub={'see "Slip saves refused" below'} tone={den.length ? 'mid' : 'ok'} />
                    <Kpi label="Feedback" value={t.feedback} sub={t.stars != null ? `average ${t.stars} ★` : 'no ratings yet'} tone={t.stars == null ? '' : t.stars >= 4 ? 'ok' : t.stars >= 3 ? 'mid' : 'bad'} />
                </section>

                <Block title="Pages" note="time from the menu click until the page is drawn · typical (median) and slow (95th percentile) · server = time waiting for the server">
                    <PagesTable rows={s.pages} pageName={pageName} />
                </Block>

                <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                    <Block title="By device"><GroupTable rows={s.device} label="Device" /></Block>
                    <Block title="By browser"><GroupTable rows={s.browser} label="Browser" /></Block>
                    <Block title="By connection" note="as the browser reports it (Chrome, Edge, Android)"><GroupTable rows={s.net} label="Connection" /></Block>
                    <Block title="By system & app"><GroupTable rows={[...s.os, ...s.app.map(a => ({ ...a, key: a.key === 'app' ? 'Android app' : 'In a browser' }))]} label="System / app" /></Block>
                    <Block title="By site"><GroupTable rows={s.site_groups.map(g => ({ ...g, key: g.key === 'medina' ? 'Medina' : g.key === 'makkah' ? 'Makkah' : g.key }))} label="Site" /></Block>
                    <Block title="By Cloudflare location"><GroupTable rows={s.colo} label="Location" /></Block>
                </section>

                <section className="grid gap-3 md:grid-cols-2">
                    <Block title="Day by day" note="median page time per day">
                        {s.day.length ? (
                            <div className="flex h-44 items-end gap-1 overflow-x-auto p-3">
                                {s.day.map(d => (
                                    <div key={d.key} className="flex h-full min-w-9 flex-1 flex-col items-center justify-end gap-0.5 text-[10px]" title={`${d.key}: ${sec(d.p50)} typical · ${d.n} pages`}>
                                        <b>{sec(d.p50)}</b>
                                        <i className={cn('block w-full rounded-t', toneOf(d.p50) === 'ok' ? 'bg-ok' : toneOf(d.p50) === 'mid' ? 'bg-warn' : 'bg-destructive')} style={{ height: `${Math.max(4, (d.p50 || 0) / dayMax * 100)}%` }} />
                                        <small className="text-muted-foreground">{d.key.slice(5)}</small>
                                    </div>
                                ))}
                            </div>
                        ) : none}
                    </Block>
                    <Block title="By build" note="each deploy of the website — did it get slower?"><GroupTable rows={s.build} label="Build" /></Block>
                </section>

                <Block title="Full loads (opening the PMS)" note="median · first byte from the server, page ready, everything loaded, main content shown (LCP), slowest tap response (INP), layout shift (CLS)">
                    <div className="grid grid-cols-2 gap-2 p-3 sm:grid-cols-3 lg:grid-cols-6">
                        {([['First byte', 'ttfb'], ['Page ready', 'dom_ready'], ['All loaded', 'load'], ['Main content (LCP)', 'lcp'], ['Tap response (INP)', 'inp']] as const).map(([l, k]) => <Kpi key={k} label={l} value={sec(s.vitals[k])} tone={toneOf(s.vitals[k])} />)}
                        <Kpi label="Layout shift (CLS)" value={s.vitals.cls ?? '—'} tone={s.vitals.cls == null ? '' : s.vitals.cls < .1 ? 'ok' : s.vitals.cls < .25 ? 'mid' : 'bad'} />
                    </div>
                </Block>

                    </TabsContent>
                    <TabsContent value="issues">
                <Card><CardContent><IssuesSection list={data.data?.issues ?? []} onStatus={(id, status) => qc.setQueryData(['perf', days, site], (old: any) => old && ({ ...old, issues: old.issues.map((x: IssueRow) => x.id === id ? { ...x, status } : x) }))} /></CardContent></Card>

                    </TabsContent>
                    <TabsContent value="refused">
                <Card><CardContent><DenialsSection list={den} /></CardContent></Card>

                    </TabsContent>
                    <TabsContent value="feedback">
                <Card>
                    <CardHeader><CardTitle className="flex flex-wrap items-center gap-2 text-base">Feedback
                        <span className="ml-auto flex flex-wrap gap-2">
                            <Select value={fbStars} onValueChange={setFbStars}><SelectTrigger className="w-32" aria-label="Stars"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All stars</SelectItem><SelectItem value="1-2">1–2 ★</SelectItem><SelectItem value="3">3 ★</SelectItem><SelectItem value="4-5">4–5 ★</SelectItem></SelectContent></Select>
                            <Select value={fbStatus} onValueChange={setFbStatus}><SelectTrigger className="w-32" aria-label="Status"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Any status</SelectItem><SelectItem value="new">New</SelectItem><SelectItem value="seen">Seen</SelectItem><SelectItem value="handled">Handled</SelectItem></SelectContent></Select>
                            <Select value={fbPage} onValueChange={setFbPage}><SelectTrigger className="w-40" aria-label="Page"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All pages</SelectItem>{fbPages.map(p => <SelectItem key={p} value={p}>{pageName(p)}</SelectItem>)}</SelectContent></Select>
                        </span></CardTitle></CardHeader>
                    <CardContent className="overflow-x-auto p-0">
                        {fbList.length ? (
                            <Table>
                                <TableHeader><TableRow><TableHead>When</TableHead><TableHead>Stars</TableHead><TableHead>Page</TableHead><TableHead>Login</TableHead><TableHead>Status</TableHead><TableHead>Tags</TableHead><TableHead>Comment</TableHead><TableHead>Details</TableHead></TableRow></TableHeader>
                                <TableBody>{fbList.map(f => (
                                    <TableRow key={f.id} className={cn(f.status === 'handled' && 'opacity-70')}>
                                        <TableCell className="whitespace-nowrap">{when(f.at)}</TableCell><TableCell className="whitespace-nowrap text-gold">{stars(f.rating)}</TableCell><TableCell><b>{pageName(f.page)}</b></TableCell>
                                        <TableCell className="whitespace-nowrap">{f.desk || ''}{f.site ? <small className="ml-1 text-muted-foreground">{f.site === 'medina' ? 'Medina' : 'Makkah'}</small> : ''}<small className="block text-muted-foreground">{f.trigger === 'after-save' ? 'after a save' : 'on the page'}</small></TableCell>
                                        <TableCell><Select value={f.status} onValueChange={status => setStatus.mutate({ id: f.id, status })}><SelectTrigger className="h-8 w-28" aria-label="Status"><SelectValue /></SelectTrigger>
                                            <SelectContent>{['new', 'seen', 'handled'].map(x => <SelectItem key={x} value={x}>{x}</SelectItem>)}</SelectContent></Select></TableCell>
                                        <TableCell className="whitespace-normal">{f.tags ? <span className="flex flex-wrap gap-1">{f.tags.split(', ').map(x => <Badge key={x} variant="secondary">{x}</Badge>)}</span> : ''}</TableCell>
                                        <TableCell className="max-w-[28rem] whitespace-pre-wrap">{f.text || ''}</TableCell>
                                        <TableCell className="whitespace-normal text-xs text-muted-foreground">{[f.page_ms != null ? `took ${sec(f.page_ms)}` : '', f.device, f.browser, f.net_type, f.colo && `${f.colo} (${f.country || '?'})`, f.build && `build ${f.build}`].filter(Boolean).join(' · ')}</TableCell>
                                    </TableRow>
                                ))}</TableBody>
                            </Table>
                        ) : <p className="p-3 text-sm text-muted-foreground">No feedback matches.</p>}
                        {setStatus.isError && <p className="p-3 text-sm text-destructive">Could not save.</p>}
                    </CardContent>
                </Card>

                    </TabsContent>
                    <TabsContent value="errors">
                <Block title="Recent errors" note="pages that could not open and script errors, newest first">
                    {errs.length ? (
                        <Table>
                            <TableHeader><TableRow><TableHead>When</TableHead><TableHead>Page</TableHead><TableHead>Error</TableHead><TableHead>Login</TableHead><TableHead>Device</TableHead></TableRow></TableHeader>
                            <TableBody>{errs.map((e, i) => <TableRow key={i}><TableCell className="whitespace-nowrap">{when(e.at)}</TableCell><TableCell>{pageName(e.page)}</TableCell><TableCell className="break-all font-mono text-xs text-destructive">{e.err}</TableCell><TableCell>{e.desk}</TableCell><TableCell>{[e.device, e.browser].filter(Boolean).join(' · ')}</TableCell></TableRow>)}</TableBody>
                        </Table>
                    ) : <p className="p-3 text-sm text-muted-foreground">No errors in this period. 🎉</p>}
                </Block>
                    </TabsContent>
                </Tabs>
            </>}
        </div>
    );
}
