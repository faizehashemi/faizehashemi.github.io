import { useCallback, useEffect, useState } from 'react';
import { Undo2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useConfirm } from '@/components/ConfirmDialog';
import { KIND, allocOf, allocText, sameAlloc } from '@/lib/alloclog';
import { useCore, useDb, useGuard, useSite } from '@/pms/PmsContext';

// 🧾 Bulk changes: every bulk apply made on the Forecast and Delayed departures pages, newest first, for every desk. Undo puts back each slip's
// building and rooms as they were — except slips changed since then, which are left alone and listed.

type Entry = { id: number; kind: string; note: string; count: number; by_name?: string; created_at: string; undone_at?: string; undone_by_name?: string; undo_note?: string; changes: { id: number; sh: string; before: any; after: any }[] };
const when = (iso?: string) => iso ? new Date(iso).toLocaleString(undefined, { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '';

export function AllocLog() {
    const { cloud } = useCore();
    const db = useDb();
    const guard = useGuard();
    const { siteId } = useSite();
    const { ask, dialog } = useConfirm();
    const [log, setLog] = useState<Entry[] | null>(null);
    const [error, setError] = useState('');
    const [msg, setMsg] = useState('');

    const load = useCallback(async () => {
        try { setLog(((await guard(cloud.request('GET', `/api/alloc-log?site=${siteId}`))) as any).log || []); setError(''); }
        catch (e: any) { setError(`The log is not available right now (${e?.message || e}).`); }
    }, [siteId]);   // eslint-disable-line react-hooks/exhaustive-deps
    useEffect(() => { void load(); window.addEventListener('pms:alloc-log', load); return () => window.removeEventListener('pms:alloc-log', load); }, [load]);

    async function undo(e: Entry) {
        if (!await ask({ title: 'Undo this change?', confirmLabel: 'Undo', body: `Undo “${KIND[e.kind] || e.kind}” from ${when(e.created_at)} (${e.count} slip${e.count === 1 ? '' : 's'})?\n\nEach slip gets back its building and rooms as they were, unless it was changed since.` })) return;
        const current = new Map<number, any>(((await guard(db.all())) as any[]).map(r => [r.id, r]));
        const put: any[] = [], changed: string[] = [], gone: string[] = [];
        for (const c of e.changes) {
            const r = current.get(c.id);
            if (!r) { gone.push(c.sh); continue; }
            if (!sameAlloc(allocOf(r), c.after)) { changed.push(c.sh); continue; }
            const b = c.before;
            put.push({ ...r, building: b.building, rooms: { gents: b.rooms.gents, ladies: b.rooms.ladies },
                ...('checkout_date' in b ? { checkout_date: b.checkout_date, checkout_time: b.checkout_time } : {}),
                ...('delayed' in b ? { delayed: b.delayed } : {}) });
        }
        try {
            const res: any = put.length ? await guard(db.bulkWrite({ put }, 'alloc-undo')) : { updated: 0 };
            const note = `Restored ${res.updated} slip${res.updated === 1 ? '' : 's'}.` +
                (changed.length ? ` Left ${changed.length} changed since (SH ${changed.join(', ')}).` : '') +
                (gone.length ? ` ${gone.length} no longer there (SH ${gone.join(', ')}).` : '');
            setLog(((await guard(cloud.request('POST', `/api/alloc-log/${e.id}/undo`, { note }))) as any).log || log);
            setMsg(note);
            window.dispatchEvent(new Event('pms:alloc-undone'));
        } catch (err: any) { setMsg(err?.message || String(err)); void load(); }
    }

    return (
        <Card><CardContent className="grid gap-3">
            <div><h2 className="text-base font-bold text-primary">🧾 Bulk changes</h2>
                <p className="text-sm text-muted-foreground">Every “Write building” and “Apply allocations” made here, newest first, for every desk. <b>Undo</b> puts back each slip's building and rooms as they were — except slips changed since then, which are left alone and listed.</p></div>
            {msg && <p role="status" className="text-sm font-semibold text-ok">{msg}</p>}
            {error ? <p className="text-sm text-muted-foreground">{error}</p>
                : log === null ? <p className="text-sm text-muted-foreground">Loading…</p>
                : log.length ? log.map(e => (
                    <details key={e.id} className={`rounded-lg border bg-white ${e.undone_at ? 'opacity-60' : ''}`}>
                        <summary className="flex cursor-pointer flex-wrap items-center gap-x-3 gap-y-1 p-2.5 text-sm">
                            <span className="text-muted-foreground">{when(e.created_at)}</span><b>{KIND[e.kind] || e.kind}</b>
                            <span className="min-w-0 flex-1 text-muted-foreground">{e.note} · {e.count} slip{e.count === 1 ? '' : 's'} · by {e.by_name || '—'}</span>
                            {e.undone_at ? <span className="text-xs font-semibold text-warn">Undone {when(e.undone_at)} by {e.undone_by_name || '—'}</span>
                                : db.readonly ? null : <Button variant="outline" size="sm" onClick={ev => { ev.preventDefault(); void undo(e); }}><Undo2 className="size-4" />Undo</Button>}
                        </summary>
                        {e.undo_note && <p className="px-3 pb-2 text-sm text-muted-foreground">{e.undo_note}</p>}
                        <div className="overflow-x-auto"><Table><TableHeader><TableRow><TableHead>SH</TableHead><TableHead>Before</TableHead><TableHead>After</TableHead></TableRow></TableHeader>
                            <TableBody>{e.changes.map((c, i) => <TableRow key={i}><TableCell className="font-bold">{c.sh}</TableCell><TableCell>{allocText(c.before)}</TableCell><TableCell>{allocText(c.after)}</TableCell></TableRow>)}</TableBody></Table></div>
                    </details>
                )) : <p className="text-sm text-muted-foreground">No bulk changes yet.</p>}
            {dialog}
        </CardContent></Card>
    );
}
