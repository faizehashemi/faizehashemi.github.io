import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

// Signage Builder → Transport board → Data source: the switch between the PMS Transport days and the Sigatul Haj signage page (the operator's live
// list in UMS). With Sigatul Haj, its trips win for their SH numbers on the board (worker.js mergeSigatul); the board's look stays this builder's.

type Row = Record<string, any>;
const DEFAULT_URL: Record<string, string> = { makkah: 'https://sigatulhaj.org/signage/testsignage.aspx' };
const fmt = (at: string) => new Date(at).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', second: '2-digit' });

export function DataSource({ cfg, siteId, writable, cloud, save, onRoutes }: {
    cfg: Row; siteId: string; writable: boolean; cloud: any;
    save: (patch: { source: string; sh_url: string }) => Promise<string | null>; onRoutes: (routes: string[]) => void;
}) {
    const [source, setSource] = useState<string>(cfg.source || 'pms');
    const [url, setUrl] = useState<string>(cfg.sh_url || DEFAULT_URL[siteId] || '');
    const [check, setCheck] = useState<Row | null>(null), [busy, setBusy] = useState(false), [msg, setMsg] = useState('');
    useEffect(() => { setSource(cfg.source || 'pms'); setUrl(cfg.sh_url || DEFAULT_URL[siteId] || ''); }, [cfg.source, cfg.sh_url, siteId]);
    const dirty = source !== (cfg.source || 'pms') || url !== (cfg.sh_url || DEFAULT_URL[siteId] || '');
    async function test() {
        setBusy(true); setMsg('');
        try { const r = await cloud.request('GET', `/api/signage/sigatul?site=${siteId}&url=${encodeURIComponent(url)}`); setCheck(r); if (r.ok) onRoutes([...new Set((r.rows as Row[]).map(x => x.route))]); }
        catch (e: any) { setCheck({ ok: false, error: e.message }); } finally { setBusy(false); }
    }
    useEffect(() => { if ((cfg.source || 'pms') === 'sigatulhaj') void test(); }, [cfg.source]);   // eslint-disable-line react-hooks/exhaustive-deps
    const opt = (v: string, title: string, sub: string) => (
        <button type="button" role="radio" aria-checked={source === v} disabled={!writable} onClick={() => setSource(v)}
            className={cn('grid flex-1 gap-0.5 rounded-xl border-2 p-3 text-left transition', source === v ? 'border-gold bg-accent' : 'border-transparent bg-muted/50 hover:border-muted-foreground/30')}>
            <b className="flex items-center gap-2">{source === v ? '🔘' : '⚪'} {title}</b><small className="text-muted-foreground">{sub}</small></button>);
    return (
        <Card className="gap-3 p-4">
            <h2 className="font-bold">Data source — who wins on the board</h2>
            <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Data source">
                {opt('pms', 'PMS', 'The board shows the Transport days of the PMS, as now.')}
                {opt('sigatulhaj', 'Sigatul Haj', "The operator's live list on sigatulhaj.org wins for its SH numbers; other PMS trips stay. The board keeps this builder's look.")}
            </div>
            {source === 'sigatulhaj' && <div className="grid gap-2">
                <label className="grid gap-1 text-xs font-semibold">Sigatul Haj signage link<Input className="h-9 font-mono text-xs" disabled={!writable} value={url} onChange={e => setUrl(e.target.value)} placeholder="https://sigatulhaj.org/signage/…" /></label>
                <ul className="list-disc pl-5 text-xs text-muted-foreground">
                    <li>Same SH number on both: Sigatul Haj's date, time, guests and names are shown; the PMS bus number stays.</li>
                    <li>A trip only on Sigatul Haj is added. A PMS trip of an SH number Sigatul Haj now shows on another trip is hidden.</li>
                    <li>PMS trips of other SH numbers stay. Checked about every 45 seconds; if Sigatul Haj cannot be reached, the board keeps the PMS trips.</li>
                </ul>
            </div>}
            <div className="flex flex-wrap items-center gap-2">
                {writable && <Button disabled={!dirty || busy} onClick={async () => { setBusy(true); const e = await save({ source, sh_url: url }); setBusy(false); setMsg(e || 'Saved — the board switches within a minute.'); if (!e && source === 'sigatulhaj') void test(); }}>Save data source</Button>}
                {source === 'sigatulhaj' && <Button variant="outline" disabled={busy} onClick={() => void test()}>{busy ? 'Checking…' : '🔄 Check Sigatul Haj now'}</Button>}
                {msg && <span className="text-sm text-muted-foreground">{msg}</span>}
            </div>
            {source === 'sigatulhaj' && check && (check.ok
                ? <div className="grid gap-1.5">
                    <p className="text-sm"><b className="text-emerald-700 dark:text-emerald-400">✔ Read {check.rows.length} trips</b> <span className="text-muted-foreground">at {fmt(check.at)}</span></p>
                    <div className="max-h-64 overflow-auto rounded-lg border"><table className="w-full text-xs">
                        <thead className="sticky top-0 bg-muted"><tr className="text-left"><th className="p-1.5">SH</th><th className="p-1.5">Travel to</th><th className="p-1.5">Date</th><th className="p-1.5">Group</th><th className="p-1.5 text-right">Pax</th></tr></thead>
                        <tbody>{(check.rows as Row[]).map((r, i) => <tr key={i} className="border-t"><td className="p-1.5 font-mono">{r.ref}</td><td className="p-1.5">{String(r.route).split('-').slice(1).join('-')}</td><td className="p-1.5 whitespace-nowrap">{r.at.replace('T', ' ')}</td><td className="p-1.5">{[r.operator, r.leader].filter(Boolean).join(' · ')}</td><td className="p-1.5 text-right">{r.pax}</td></tr>)}</tbody>
                    </table></div>
                    <p className="text-xs text-muted-foreground">Its trip types are added to the Slides list below — give each one a template there.</p>
                </div>
                : <p className="text-sm text-destructive">Could not read Sigatul Haj: {check.error}</p>)}
        </Card>
    );
}
