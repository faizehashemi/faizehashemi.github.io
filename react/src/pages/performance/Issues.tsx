import { useEffect, useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useCore, useGuard } from '@/pms/PmsContext';

// Performance → "Issue reports": what the desks sent with "Facing an issue?" (core/issue-report.js → POST /api/issues) — their words, a picture of their screen
// and what their browser knew (window size, device, recent errors and failed calls, the text on the page, anything wider than the window). Opening one marks it Seen.

export type IssueRow = { id: number; at: string; desk: string; site?: string; role?: string; page?: string; url?: string; text: string; viewport?: string; device?: string; browser?: string; build?: string; colo?: string; country?: string; status: string; has_shot?: number };
type Row = Record<string, any>;
const when = (iso?: string) => (iso ? new Date(iso).toLocaleString(undefined, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—');
const SITE: Record<string, string> = { makkah: 'Makkah', medina: 'Medina' };
const Items = ({ title, items, mono = true }: { title: string; items?: string[]; mono?: boolean }) => (items?.length ? <div><h4 className="mt-2 text-sm font-bold">{title}</h4><ul className={`ml-5 list-disc text-xs ${mono ? 'font-mono' : ''}`}>{items.map((x, i) => <li key={i}>{x}</li>)}</ul></div> : null);

function Detail({ row, onStatus }: { row: IssueRow; onStatus: (s: string) => void }) {
    const { cloud } = useCore();
    const guard = useGuard();
    const [issue, setIssue] = useState<Row | null>(null), [err, setErr] = useState(''), [copied, setCopied] = useState('');
    useEffect(() => {
        void guard<any>(cloud.request('GET', `/api/issues/${row.id}`)).then(r => { setIssue(r.issue); if (row.status === 'new') { void cloud.request('PATCH', `/api/issues/${row.id}`, { status: 'seen' }).then(() => onStatus('seen')).catch(() => { /* ignore */ }); } }).catch(e => setErr(e.message || 'Could not load.'));
    }, [row.id]);   // eslint-disable-line react-hooks/exhaustive-deps
    if (err) return <p className="text-sm text-destructive">{err}</p>;
    if (!issue) return <p className="text-sm text-muted-foreground">Loading…</p>;
    const d = issue.diag || {}, v = d.viewport || {}, c = d.ctx || {}, s = d.settings || {};
    return (
        <div className="grid gap-2 text-sm">
            <p className="whitespace-pre-wrap font-bold">{issue.text}</p>
            {issue.shot ? <a href={issue.shot} target="_blank" rel="noopener" title="Open the picture full size"><img alt="Screenshot from the desk" src={issue.shot} className="block max-h-[420px] max-w-full rounded-lg border" /></a>
                : <p className="text-muted-foreground">No picture{d.shot_error ? ` (${d.shot_error})` : ' sent'}.</p>}
            <div className="grid gap-1">
                <span><b>Page</b> {issue.page} · {issue.url}{d.react ? ' · React page' : ''}</span>
                <span><b>Window</b> {v.w}×{v.h} px, ratio {v.dpr}, scrolled {v.scrollX}/{v.scrollY}, page is {v.pageW}×{v.pageH}{v.pageW > v.w + 2 && <Badge variant="destructive" className="ml-1">wider than the window</Badge>} · {v.orientation}</span>
                <span><b>Device</b> {c.device} · {c.os} · {c.browser} {c.browser_ver} · {c.app}{d.standalone ? ' (installed app)' : ''} · screen {c.screen} · {c.net_type || ''} {d.online === false ? '· offline' : ''}</span>
                <span><b>Build</b> {c.build} · page opened in {d.page_ms != null ? `${d.page_ms} ms` : '—'} · looks: {s.theme}, text {s.textScale}%, {s.density}{s.phoneCards === false ? ', cards off' : ''}</span>
                <span><b>Who</b> {issue.desk} ({issue.role}) · {SITE[issue.site] || issue.site || ''} · {issue.colo || ''} {issue.country || ''}</span></div>
            <Items title="Wider than the window" items={d.wider_than_window} /><Items title="Errors in this browser" items={d.errors} /><Items title="Failed calls" items={d.failed_calls} />
            <Items title="Pages visited just before" items={d.recent_pages} /><Items title="Dialogs open" items={d.open_dialogs} mono={false} />
            {d.dom && <details><summary className="cursor-pointer">Text on the page</summary><pre className="max-h-64 overflow-auto whitespace-pre-wrap font-mono text-xs">{d.dom}</pre></details>}
            <div className="flex flex-wrap items-center gap-2">
                <Button size="sm" variant="outline" onClick={async () => { const { shot: _s, ...rest } = issue; try { await navigator.clipboard.writeText(JSON.stringify(rest, null, 2)); setCopied('Copied ✓'); } catch { setCopied('Could not copy'); } }}>Copy the full report (JSON, without the picture)</Button><span className="text-xs">{copied}</span>
                <label className="ml-auto flex items-center gap-2">Status
                    <Select value={row.status} onValueChange={st => { void cloud.request('PATCH', `/api/issues/${row.id}`, { status: st }).then(() => onStatus(st)); }}><SelectTrigger className="h-8 w-28"><SelectValue /></SelectTrigger><SelectContent>{['new', 'seen', 'handled'].map(x => <SelectItem key={x} value={x}>{x}</SelectItem>)}</SelectContent></Select></label></div>
        </div>
    );
}

export function IssuesSection({ list, onStatus }: { list: IssueRow[]; onStatus: (id: number, status: string) => void }) {
    const [status, setStatus] = useState('open'), [page, setPage] = useState('all'), [showHandled, setShowHandled] = useState(false), [openId, setOpenId] = useState<number | null>(null);
    const pages = useMemo(() => [...new Set(list.map(i => i.page).filter(Boolean))].sort() as string[], [list]);
    // new and seen only, unless "Show handled" is ticked
    const rows = list.filter(i => (showHandled || i.status !== 'handled') && (status === 'open' || i.status === status) && (page === 'all' || i.page === page));
    const hidden = list.length - list.filter(i => i.status !== 'handled').length;
    return (
        <div className="grid gap-2">
            <div className="flex flex-wrap items-center gap-2"><h2 className="text-lg font-bold">Issue reports</h2><span className="text-xs text-muted-foreground">from the “Facing an issue?” button — click a row for the picture and the details</span>
                <span className="ml-auto flex flex-wrap items-center gap-2">
                    <label className="flex items-center gap-1.5 text-sm"><input type="checkbox" checked={showHandled} onChange={e => setShowHandled(e.target.checked)} />Show handled{hidden ? ` (${hidden})` : ''}</label>
                    <Select value={status} onValueChange={setStatus}><SelectTrigger className="h-8 w-32"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="open">New + seen</SelectItem><SelectItem value="new">New</SelectItem><SelectItem value="seen">Seen</SelectItem><SelectItem value="handled">Handled</SelectItem></SelectContent></Select>
                    <Select value={page} onValueChange={setPage}><SelectTrigger className="h-8 w-36"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All pages</SelectItem>{pages.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent></Select></span></div>
            {rows.length ? (
                <div className="overflow-x-auto rounded-lg border">
                    <Table>
                        <TableHeader><TableRow><TableHead>#</TableHead><TableHead>When</TableHead><TableHead>Login</TableHead><TableHead>Site</TableHead><TableHead>Page</TableHead><TableHead>Device</TableHead><TableHead>Status</TableHead><TableHead>Report</TableHead></TableRow></TableHeader>
                        <TableBody>{rows.map(i => [
                            <TableRow key={i.id} className="cursor-pointer" onClick={() => setOpenId(openId === i.id ? null : i.id)}>
                                <TableCell>{i.id}</TableCell><TableCell className="whitespace-nowrap">{when(i.at)}</TableCell><TableCell><b>{i.desk}</b></TableCell><TableCell>{SITE[i.site || ''] || i.site || ''}</TableCell><TableCell>{i.page || '—'}</TableCell>
                                <TableCell className="whitespace-nowrap">{i.device} <small className="text-muted-foreground">{i.viewport}</small> {i.has_shot ? '📷' : ''}</TableCell>
                                <TableCell><Badge variant={i.status === 'new' ? 'destructive' : 'outline'}>{i.status}</Badge></TableCell>
                                <TableCell className="max-w-[34rem] whitespace-normal">{i.text.slice(0, 140)}{i.text.length > 140 ? '…' : ''}</TableCell>
                            </TableRow>,
                            openId === i.id && <TableRow key={`${i.id}-d`}><TableCell colSpan={8} className="whitespace-normal bg-muted/30"><Detail row={i} onStatus={s => onStatus(i.id, s)} /></TableCell></TableRow>,
                        ])}</TableBody>
                    </Table>
                </div>
            ) : <p className="text-sm text-muted-foreground">{list.length ? 'Nothing new or seen — tick “Show handled” to see the rest.' : 'No issue reports in this period.'}</p>}
        </div>
    );
}
