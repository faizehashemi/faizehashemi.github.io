import { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useConfirm } from '@/components/ConfirmDialog';
import { cn } from '@/lib/utils';
import { slipChanges } from '@/lib/slipDiff';
import { useCore, useGuard, useNav } from '@/pms/PmsContext';

// Backups (Data, admins): the hourly database backups the Worker keeps — health, the saved copies (download), and "find a slip in a backup":
// how a slip looked then, what restoring it would change, and a button that writes that state back as a new version (also undeletes).
// Server: GET /api/backups, POST /api/backups/run, GET /api/backups/download · /slip, POST /api/backups/restore-slip.

type Part = { rows?: number; bytes?: number; sha?: string };
type Item = { kind: 'h' | 'd'; stem: string; at: string; trigger?: string; parts: Record<string, Part> };
type Status = { ok?: boolean; ok_at?: string; bytes?: number; rows?: number; tables?: number; ms?: number; error?: string; failed_at?: string } | null;
type Match = { id: number; sh_no?: string; site: string; data: Record<string, any>; live?: { deleted?: boolean; data: Record<string, any> } | null };

const when = (iso?: string) => iso ? new Date(iso).toLocaleString(undefined, { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—';
const kb = (n?: number) => n == null ? '—' : n < 1024 * 1024 ? `${Math.max(1, Math.round(n / 1024))} KB` : `${(n / 1048576).toFixed(1)} MB`;
const ago = (ms: number) => { const m = Math.round(ms / 60000); return m < 1 ? 'just now' : m < 90 ? `${m} min ago` : m < 2880 ? `${Math.round(m / 60)} h ago` : `${Math.round(m / 1440)} days ago`; };
const label = (it: Item) => `${when(it.at)} · ${it.kind === 'd' ? 'daily' : it.trigger === 'manual' ? 'manual' : 'hourly'}`;
const key = (it: Item) => `${it.kind}|${it.stem}`;

export default function BackupsPage() {
    const { cloud } = useCore();
    const guard = useGuard();
    const { href } = useNav();
    const { ask, dialog } = useConfirm();
    const isAdmin = cloud.currentDesk()?.role === 'admin';
    const [items, setItems] = useState<Item[]>([]);
    const [status, setStatus] = useState<Status>(null);
    const [now, setNow] = useState(Date.now());
    const [msg, setMsg] = useState<{ text: string; bad?: boolean }>({ text: '' });
    const [running, setRunning] = useState(false);
    const [pick, setPick] = useState('');
    const [q, setQ] = useState('');
    const [result, setResult] = useState<{ matches: Match[]; at: string; kind: string; stem: string } | { note: string; bad?: boolean } | null>(null);
    const say = (text: string, bad = false) => setMsg({ text, bad });
    const errText = (e: unknown, fallback: string) => e instanceof cloud.UserError ? e.message : fallback;

    async function load() {
        try {
            const r: any = await guard(cloud.request('GET', '/api/backups'));
            setItems(r.items); setStatus(r.status); setNow(Date.parse(r.now) || Date.now());
            setPick(p => p || (r.items[0] ? key(r.items[0]) : ''));
        } catch (e) { say(errText(e, 'Could not load the backups.'), true); }
    }
    useEffect(() => { if (isAdmin) void load(); }, []);   // eslint-disable-line react-hooks/exhaustive-deps

    if (!isAdmin) return <p className="mx-auto max-w-3xl p-6 text-destructive">Only admin logins can see the backups.</p>;

    async function runNow() {
        setRunning(true); say('Backing up…');
        try { await guard(cloud.request('POST', '/api/backups/run')); say('Backup done ✓'); await load(); }
        catch (e) { say(errText(e, 'The backup failed.'), true); await load(); }
        finally { setRunning(false); }
    }

    // download one part with the login's token (the file is a gzip of JSON)
    async function download(kind: string, stem: string, part: string) {
        say('Preparing the download…');
        try {
            const s = cloud.getSession();
            const res = await fetch(`${cloud.apiBase()}/api/backups/download?kind=${encodeURIComponent(kind)}&stem=${encodeURIComponent(stem)}&part=${encodeURIComponent(part)}`, { headers: { Authorization: 'Bearer ' + s.token } });
            if (!res.ok) throw new cloud.UserError((await res.json().catch(() => ({}))).error || 'Could not download.');
            const a = document.createElement('a');
            a.href = URL.createObjectURL(await res.blob());
            a.download = `pms-${stem}-${part}.json.gz`;
            document.body.appendChild(a); a.click(); a.remove();
            setTimeout(() => URL.revokeObjectURL(a.href), 4000);
            say('');
        } catch (e) { say(errText(e, 'Could not download.'), true); }
    }

    async function find() {
        const [kind, stem] = pick.split('|');
        const qq = q.trim();
        if (!stem) { setResult({ note: 'Pick a backup first.' }); return; }
        if (!qq) { setResult({ note: 'Type an SH number (or # and a slip id).' }); return; }
        const arg = qq.startsWith('#') ? `id=${encodeURIComponent(qq.slice(1))}` : `sh=${encodeURIComponent(qq)}`;
        setResult({ note: 'Looking…' });
        try {
            const r: any = await guard(cloud.request('GET', `/api/backups/slip?kind=${kind}&stem=${encodeURIComponent(stem)}&${arg}`));
            setResult({ matches: r.matches, at: r.at, kind, stem });
        } catch (e) { setResult({ note: errText(e, 'Could not look in the backup.'), bad: true }); }
    }

    async function restore(m: Match, ctxResult: { kind: string; stem: string }) {
        const ok = await ask({
            title: `Restore SH ${m.sh_no || ''}?`, confirmLabel: 'Restore',
            body: `Restore SH ${m.sh_no || ''} (slip #${m.id}) to how it was in this backup?\n\nIt is saved as a NEW version in the slip's History — nothing is lost, and you can make any other version the version in use again.`,
        });
        if (!ok) return;
        try {
            await guard(cloud.request('POST', '/api/backups/restore-slip', { kind: ctxResult.kind, stem: ctxResult.stem, slip_id: Number(m.id) }));
            say(`SH ${m.sh_no || ''} restored ✓ — see its History on the Slip page.`);
            await find();
        } catch (e) { say(errText(e, 'Could not restore.'), true); }
    }

    // health
    let tone: 'ok' | 'mid' | 'bad' = 'bad', text = 'No backup yet', facts: React.ReactNode = null;
    if (status && status.ok_at) {
        const age = now - Date.parse(status.ok_at);
        tone = status.ok === false ? 'bad' : age <= 90 * 60e3 ? 'ok' : age <= 180 * 60e3 ? 'mid' : 'bad';
        text = status.ok === false ? 'The last backup FAILED' : age <= 90 * 60e3 ? `Healthy — last backup ${ago(age)}` : `Late — last backup ${ago(age)}`;
        facts = (
            <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm">
                <span>Last good backup <b>{when(status.ok_at)}</b></span><span>Size <b>{kb(status.bytes)}</b> compressed</span>
                <span><b>{status.rows}</b> rows · <b>{status.tables}</b> tables</span><span>Took <b>{status.ms} ms</b></span>
            </div>
        );
    } else if (status && status.ok === false) text = 'The last backup FAILED';
    const pill = { ok: 'bg-ok-soft text-ok', mid: 'bg-warn-soft text-warn', bad: 'bg-bad-soft text-destructive' }[tone];

    return (
        <div className="mx-auto grid grid-cols-[minmax(0,1fr)] max-w-[1100px] min-w-0 gap-3 px-3 pb-10 pt-4 sm:px-4">
            <header className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                    <h1 className="text-2xl font-bold text-primary">Backups</h1>
                    <p className="text-sm text-muted-foreground">The PMS saves a full copy of its database every hour (kept 72 hours) and one a day (kept 35 days). Find a slip as it was in any of them and put it back — as a new version, so nothing is lost.</p>
                </div>
                <Button onClick={runNow} disabled={running}><RefreshCw className={cn('size-4', running && 'animate-spin')} />Back up now</Button>
            </header>
            {msg.text && <p role="status" className={cn('text-sm font-semibold', msg.bad ? 'text-destructive' : 'text-ok')}>{msg.text}</p>}

            <Card><CardContent className="grid gap-2">
                <div className="flex flex-wrap items-center gap-2">
                    <span className={cn('rounded-full px-3 py-1 text-sm font-bold', pill)}>{text}</span>
                    <span className="text-xs text-muted-foreground">a backup is made every hour; this turns amber after 90 minutes</span>
                </div>
                {facts}
                {status && status.ok === false && <p className="text-sm text-destructive">{status.error || 'unknown error'} ({when(status.failed_at)}) — it is tried again at the next half hour.</p>}
            </CardContent></Card>

            <Card>
                <CardHeader><CardTitle className="text-base">Find a slip in a backup <span className="ml-1 text-xs font-normal text-muted-foreground">pick the copy, type the SH number (or the slip id), see what restoring would change</span></CardTitle></CardHeader>
                <CardContent className="grid gap-3">
                    <form className="grid items-end gap-3 sm:grid-cols-[minmax(0,2fr)_minmax(0,1.5fr)_auto]" onSubmit={e => { e.preventDefault(); void find(); }}>
                        <div className="grid gap-1.5"><Label htmlFor="bkPick">Backup</Label>
                            <Select value={pick} onValueChange={setPick}>
                                <SelectTrigger id="bkPick" className="w-full"><SelectValue placeholder="(none yet)" /></SelectTrigger>
                                <SelectContent>{items.map(it => <SelectItem key={key(it)} value={key(it)}>{label(it)}</SelectItem>)}</SelectContent>
                            </Select></div>
                        <div className="grid gap-1.5"><Label htmlFor="bkQ">SH number or slip id</Label><Input id="bkQ" inputMode="numeric" placeholder="e.g. 43496" autoComplete="off" value={q} onChange={e => setQ(e.target.value)} /></div>
                        <Button type="submit">Find</Button>
                    </form>
                    {result && 'note' in result && <p className={cn('text-sm', result.bad ? 'text-destructive' : 'text-muted-foreground')}>{result.note}</p>}
                    {result && 'matches' in result && (result.matches.length
                        ? result.matches.map(m => {
                            const d = m.data, live = m.live;
                            const diff = live ? slipChanges(d, live.data) : null;     // what restoring changes: now → then
                            const can = !!live && (live.deleted || (diff && diff.length));
                            return (
                                <div key={m.id} className={cn('grid gap-2 rounded-lg border bg-white p-3', live?.deleted && 'border-destructive/50')}>
                                    <h3 className="text-sm font-bold">SH {m.sh_no || '—'} <small className="font-normal text-muted-foreground">· {m.site} · slip #{m.id} · {d.building || 'no building'} · {d.checkin_date || ''} → {d.checkout_date || ''} (as in the backup of {when(result.at)})</small></h3>
                                    {!live ? <p className="text-sm text-destructive">This slip no longer exists in the database, so it cannot be restored here.</p>
                                        : live.deleted ? <p className="text-sm text-destructive">This slip is DELETED now — restoring brings it back.</p> : null}
                                    {diff && diff.length > 0 && <div className="flex flex-wrap gap-1.5">{diff.slice(0, 14).map(c => <Badge key={c.l} variant="secondary" className="whitespace-normal font-normal"><b>{c.l}</b> {c.from} → {c.to}</Badge>)}</div>}
                                    {live && !live.deleted && diff && !diff.length && <p className="text-sm text-ok">Same as now — nothing to restore.</p>}
                                    {can && <div className="flex flex-wrap items-center gap-3">
                                        <Button size="sm" onClick={() => void restore(m, result)}>Restore this state as a new version</Button>
                                        <a className="text-sm font-semibold text-primary underline" href={href('slip', { sh_no: m.sh_no || '' })}>open the slip</a>
                                    </div>}
                                </div>
                            );
                        })
                        : <p className="text-sm text-muted-foreground">No slip with that SH was in the backup of {when(result.at)}.</p>)}
                </CardContent>
            </Card>

            <Card className="gap-0 py-0">
                <CardHeader className="border-b py-3"><CardTitle className="text-base">Saved backups <span className="ml-1 text-xs font-normal text-muted-foreground">newest first · times are yours</span></CardTitle></CardHeader>
                <CardContent className="overflow-x-auto p-0">
                    <Table>
                        <TableHeader><TableRow><TableHead>Taken</TableHead><TableHead>Kind</TableHead><TableHead className="text-right">Slips</TableHead><TableHead className="text-right">All rows</TableHead><TableHead className="text-right">Size</TableHead><TableHead>Check</TableHead><TableHead /></TableRow></TableHeader>
                        <TableBody>
                            {items.length ? items.map(it => {
                                const p = it.parts, rows = (p.slips?.rows || 0) + (p.rest?.rows || 0), size = Object.values(p).reduce((n, x) => n + (x.bytes || 0), 0);
                                const k = it.kind === 'd' ? 'Daily' : it.trigger === 'manual' ? 'Manual' : 'Hourly';
                                return (
                                    <TableRow key={key(it)}>
                                        <TableCell className="whitespace-nowrap">{when(it.at)}</TableCell>
                                        <TableCell><Badge variant={it.kind === 'd' ? 'default' : 'secondary'}>{k}</Badge></TableCell>
                                        <TableCell className="text-right">{p.slips?.rows ?? '—'}</TableCell><TableCell className="text-right">{rows}</TableCell><TableCell className="text-right whitespace-nowrap">{kb(size)}</TableCell>
                                        <TableCell><code title="SHA-256 of the slips file">{(p.slips?.sha || '').slice(0, 8)}</code></TableCell>
                                        <TableCell className="whitespace-nowrap">
                                            <Button variant="link" size="sm" onClick={() => { setPick(key(it)); document.getElementById('bkQ')?.focus(); }}>Find a slip</Button>
                                            <Button variant="link" size="sm" onClick={() => void download(it.kind, it.stem, 'slips')}>⬇ slips</Button>
                                            <Button variant="link" size="sm" onClick={() => void download(it.kind, it.stem, 'rest')}>⬇ rest</Button>
                                        </TableCell>
                                    </TableRow>
                                );
                            }) : <TableRow><TableCell colSpan={7} className="text-muted-foreground">No backups kept yet — the first one is made at the next hour, or press “Back up now”.</TableCell></TableRow>}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Card><CardContent>
                <details>
                    <summary className="cursor-pointer"><b>Restoring everything</b> — if the whole database is ever lost</summary>
                    <ol className="mt-2 grid list-decimal gap-2 pl-5 text-sm">
                        <li>Do not panic and do not delete anything: switch the PMS to read-only (deploy the Worker with <code>--var MAINTENANCE:1</code>).</li>
                        <li>Download the <b>slips</b> and <b>rest</b> files of the backup you want from the table above. The login passwords are in a third file, <b>auth</b>, that this page never shows: fetch it with{' '}
                            <code className="break-all">npx wrangler kv key get "bk:h:&lt;time&gt;:auth" --namespace-id 48710e49e880465987b706a98f70096e --remote &gt; auth.json.gz</code> (the time is the one in the key, e.g. 2026-10-23T18-00).</li>
                        <li>Turn them into SQL: <code className="break-all">node tools/restore-backup.mjs slips.json.gz rest.json.gz auth.json.gz &gt; restore.sql</code>, create an empty database from <code>worker/schema.sql</code> and run <code>restore.sql</code> on it (<code>wrangler d1 execute … --file restore.sql</code>).</li>
                        <li>Point the Worker at that database (<code>worker/wrangler.toml</code>), deploy, and switch maintenance off. Cloudflare's own <b>Time Travel</b> (any minute of the last 7 days) is the other way back: <code className="break-all">wrangler d1 time-travel restore pms-weur --timestamp=…</code>.</li>
                    </ol>
                    <p className="mt-2 text-xs text-muted-foreground">One slip, or a few slips deleted or edited by mistake, do not need any of this: use <b>Find a slip in a backup</b> above.</p>
                </details>
            </CardContent></Card>
            {dialog}
        </div>
    );
}
