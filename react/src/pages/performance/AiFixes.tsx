import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useCore } from '@/pms/PmsContext';

// Performance → "AI fixes": approve a problem (an issue report, an error, or one written here) and an AI writes the fix and deploys it
// live — staging first, then production, rolled back by itself if the live site stops answering. Server: POST /api/ai/fix (ONLY the
// login mukrram — the server refuses everybody else, admins included), GET /api/ai/jobs; GitHub workflow .github/workflows/pms-ai-fix.yml.

export type AiJob = { id: number; title: string; status: string; message?: string; note?: string; requested_name?: string; requested_at: string; updated_at: string;
    run_url?: string; commit_sha?: string; deploy_web?: string; deploy_api?: string; files?: string; summary?: string; source?: string; source_id?: string };
export type AiJobs = { jobs: AiJob[]; can_approve: boolean; configured: boolean };

const when = (iso?: string) => (iso ? new Date(iso).toLocaleString(undefined, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '');
const TONE: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = { done: 'default', running: 'secondary', queued: 'secondary', failed: 'destructive', 'rolled-back': 'destructive', 'no-change': 'outline', 'not-configured': 'destructive' };
const LABEL: Record<string, string> = { done: '✅ Fixed & live', running: '⏳ Working', queued: '⏳ Queued', failed: '❌ Failed', 'rolled-back': '↩ Rolled back', 'no-change': '— No change', 'not-configured': '⚙ Not connected' };

/** "🤖 Fix with AI" — only rendered for the approving login; the server checks again. */
export function AiFixButton({ can, source, sourceId, title, detail, onDone }: { can: boolean; source: string; sourceId?: string | number; title: string; detail: string; onDone?: () => void }) {
    const { cloud } = useCore();
    const [open, setOpen] = useState(false), [note, setNote] = useState(''), [busy, setBusy] = useState(false), [msg, setMsg] = useState('');
    if (!can) return null;
    if (!open) return <Button size="sm" variant="outline" onClick={e => { e.stopPropagation(); setOpen(true); }}>🤖 Fix with AI</Button>;
    return (
        <div className="grid w-full max-w-xl gap-2 rounded-lg border border-gold/50 bg-gold/5 p-2 text-sm" onClick={e => e.stopPropagation()}>
            <b>🤖 Fix with AI — {title.slice(0, 90)}</b>
            <textarea className="min-h-16 rounded-md border bg-white p-2" placeholder="Instructions for the AI (optional) — what the right behaviour is, what not to touch…" value={note} onChange={e => setNote(e.target.value)} />
            <span className="text-xs text-muted-foreground">The AI changes the code, deploys to staging, checks it, then deploys live and reports here. It never changes the database.</span>
            <div className="flex flex-wrap items-center gap-2">
                <Button size="sm" disabled={busy} onClick={async () => {
                    setBusy(true); setMsg('');
                    try { const r: any = await cloud.request('POST', '/api/ai/fix', { source, source_id: String(sourceId ?? ''), title, detail, note }); setMsg(`#${r.job.id}: ${r.job.message || r.job.status}`); setOpen(false); onDone?.(); }
                    catch (e: any) { setMsg(e?.message || 'Could not start.'); } finally { setBusy(false); }
                }}>Approve & start</Button>
                <Button size="sm" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button><span className="text-xs">{msg}</span>
            </div>
        </div>
    );
}

export function AiFixesSection({ data, onChanged }: { data?: AiJobs; onChanged: () => void }) {
    const [openId, setOpenId] = useState<number | null>(null), [title, setTitle] = useState(''), [detail, setDetail] = useState('');
    const jobs = data?.jobs ?? [];
    return (
        <div className="grid gap-3">
            <div className="flex flex-wrap items-center gap-2"><h2 className="text-lg font-bold">AI fixes</h2>
                <span className="text-xs text-muted-foreground">approved by mukrram only · the AI fixes the code, deploys staging → live, and reports back · it never changes the database</span></div>
            {data && !data.configured && <p className="rounded-md border border-warn/50 bg-warn/10 p-2 text-sm">GitHub is not connected yet, so approved fixes cannot start. (Server secret GITHUB_DISPATCH_TOKEN.)</p>}
            {data?.can_approve && (
                <div className="grid max-w-2xl gap-2 rounded-lg border p-3">
                    <b className="text-sm">Describe a problem to fix</b>
                    <input className="rounded-md border p-2 text-sm" placeholder="What is wrong — e.g. “Home page takes 5 s on phones”" value={title} onChange={e => setTitle(e.target.value)} />
                    <textarea className="min-h-20 rounded-md border p-2 text-sm" placeholder="Details: which page, what you see, what should happen" value={detail} onChange={e => setDetail(e.target.value)} />
                    {title.trim() && <AiFixButton can source="manual" title={title.trim()} detail={detail} onDone={() => { setTitle(''); setDetail(''); onChanged(); }} />}
                </div>
            )}
            {jobs.length ? (
                <div className="overflow-x-auto rounded-lg border">
                    <Table>
                        <TableHeader><TableRow><TableHead>#</TableHead><TableHead>Approved</TableHead><TableHead>Problem</TableHead><TableHead>Status</TableHead><TableHead>Result</TableHead></TableRow></TableHeader>
                        <TableBody>{jobs.map(j => [
                            <TableRow key={j.id} className="cursor-pointer" onClick={() => setOpenId(openId === j.id ? null : j.id)}>
                                <TableCell>{j.id}</TableCell><TableCell className="whitespace-nowrap">{when(j.requested_at)}<small className="block text-muted-foreground">{j.requested_name}</small></TableCell>
                                <TableCell className="max-w-[30rem] whitespace-normal"><b>{j.title}</b>{j.source && j.source !== 'manual' ? <small className="ml-1 text-muted-foreground">({j.source} {j.source_id})</small> : ''}</TableCell>
                                <TableCell><Badge variant={TONE[j.status] || 'outline'}>{LABEL[j.status] || j.status}</Badge><small className="block text-muted-foreground">{when(j.updated_at)}</small></TableCell>
                                <TableCell className="max-w-[26rem] whitespace-normal text-xs">{j.message}</TableCell>
                            </TableRow>,
                            openId === j.id && <TableRow key={`${j.id}-d`}><TableCell colSpan={5} className="whitespace-normal bg-muted/30 text-sm">
                                <div className="grid gap-1">
                                    {j.note && <span><b>Instructions</b> {j.note}</span>}
                                    {j.summary && <div><b>What the AI did</b><pre className="mt-1 max-h-72 overflow-auto whitespace-pre-wrap font-sans text-xs">{j.summary}</pre></div>}
                                    {j.files && <span><b>Files</b> <span className="font-mono text-xs">{j.files}</span></span>}
                                    <span className="flex flex-wrap gap-3">{j.run_url && <a className="underline" href={j.run_url} target="_blank" rel="noopener">GitHub run</a>}
                                        {j.commit_sha && <a className="underline" href={`https://github.com/faizehashemi/faizehashemi.github.io/commit/${j.commit_sha}`} target="_blank" rel="noopener">commit {j.commit_sha.slice(0, 7)}</a>}
                                        {j.deploy_web && <span>web {j.deploy_web.slice(0, 8)}</span>}{j.deploy_api && <span>api {j.deploy_api.slice(0, 8)}</span>}</span>
                                </div></TableCell></TableRow>,
                        ])}</TableBody>
                    </Table>
                </div>
            ) : <p className="text-sm text-muted-foreground">No AI fixes yet.</p>}
        </div>
    );
}
