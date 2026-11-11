import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useCore, useDb, useLoadCore, useSite } from '@/pms/PmsContext';

// UMS Import → Undo / Redo: the imports this computer applied (core/ums-undo.js), the newest one still applied can be undone and the last one
// undone redone — each after the login types its own password.

type Row = Record<string, any>;
const when = (iso?: string) => (iso ? new Date(iso).toLocaleString([], { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '');

export function ImportUndo({ refresh, onDone }: { refresh: number; onDone: () => void }) {
    const { cloud } = useCore();
    const db = useDb();
    const loadCore = useLoadCore();
    const { siteId } = useSite();
    const [U, setU] = useState<any>(null);
    const [list, setList] = useState<Row[]>([]);
    const [ask, setAsk] = useState<{ e: Row; way: 'undo' | 'redo' } | null>(null);
    const [pw, setPw] = useState(''), [busy, setBusy] = useState(false), [msg, setMsg] = useState(''), [err, setErr] = useState('');
    useEffect(() => { void loadCore('ums-undo').then(setU); }, []);   // eslint-disable-line react-hooks/exhaustive-deps
    useEffect(() => { if (U) void U.listImports(siteId).then(setList); }, [U, siteId, refresh]);

    async function go() {
        if (!ask || !U) return;
        setBusy(true); setErr('');
        try {
            await U.confirmPassword(pw);
        } catch (e: any) { setErr(e instanceof (cloud as any).UserError ? e.message : 'Could not check the password: ' + (e.message || e)); setBusy(false); return; }
        try {
            const r = await U.replay(db, ask.e, ask.way);
            setMsg(`${ask.way === 'undo' ? 'Undone' : 'Redone'}: ${r.updated} slip(s) put back${r.deleted ? `, ${r.deleted} new slip(s) deleted` : ''}${r.created ? `, ${r.created} slip(s) made again` : ''}.${r.skipped.length ? ` Not touched: ${r.skipped.join('; ')}.` : ''}`);
            setAsk(null); setPw('');
            setList(await U.listImports(siteId)); onDone();
        } catch (e: any) { setErr('Could not finish: ' + (e.message || e)); }
        finally { setBusy(false); }
    }

    return (
        <Card><CardHeader><CardTitle className="text-base">Undo / Redo imports <span className="text-sm font-normal text-muted-foreground">— the imports this computer applied; asks for your password</span></CardTitle></CardHeader>
            <CardContent className="grid gap-2">
                {msg && <p className="text-sm" role="status">{msg}</p>}
                <Table><TableHeader><TableRow>{['When', 'How', 'File', 'Changed', 'State', ''].map(h => <TableHead key={h}>{h}</TableHead>)}</TableRow></TableHeader>
                    <TableBody>{list.length ? list.map(e => {
                        const last = e.history?.[e.history.length - 1];
                        return <TableRow key={e.id}><TableCell>{when(e.at)}</TableCell><TableCell>{e.via || ''}</TableCell><TableCell className="max-w-48 truncate text-xs" title={e.fileName}>{e.fileName || ''}</TableCell>
                            <TableCell>{e.created.length} new, {e.updates.length} updated</TableCell>
                            <TableCell>{e.applied ? (last ? `redone ${when(last.at)}` : 'applied') : `undone ${when(last?.at)}`}</TableCell>
                            <TableCell className="space-x-1">{U?.canUndo(list, e) && <Button size="sm" variant="outline" disabled={db.readonly} onClick={() => { setAsk({ e, way: 'undo' }); setPw(''); setErr(''); }}>Undo</Button>}
                                {U?.canRedo(list, e) && <Button size="sm" variant="outline" disabled={db.readonly} onClick={() => { setAsk({ e, way: 'redo' }); setPw(''); setErr(''); }}>Redo</Button>}</TableCell></TableRow>;
                    }) : <TableRow><TableCell colSpan={6} className="text-muted-foreground">No import applied on this computer yet.</TableCell></TableRow>}</TableBody></Table>
                <p className="text-xs text-muted-foreground">Undo puts back only what that import changed; other edits made since stay. New slips it made are deleted unless rooms were assigned to them since. An automatic import of a newer file applies UMS again.</p>
            </CardContent>
            {ask && <Dialog open onOpenChange={o => { if (!o && !busy) setAsk(null); }}>
                <DialogContent className="max-w-[calc(100%-1rem)] sm:max-w-sm">
                    <DialogHeader><DialogTitle>{ask.way === 'undo' ? 'Undo' : 'Redo'} the import of {when(ask.e.at)}?</DialogTitle></DialogHeader>
                    <p className="text-sm text-muted-foreground">{ask.e.created.length} new slip(s), {ask.e.updates.length} updated. Type the password of <b>{String(cloud.currentDesk()?.name || '')}</b> to confirm.</p>
                    <Input type="password" autoFocus autoComplete="current-password" aria-label="Your password" value={pw} onChange={e => setPw(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && pw) void go(); }} />
                    {err && <p className="text-sm text-destructive" role="alert">{err}</p>}
                    <DialogFooter className="gap-2"><Button variant="outline" disabled={busy} onClick={() => setAsk(null)}>Cancel</Button><Button disabled={busy || !pw} onClick={() => void go()}>{busy ? 'Working…' : ask.way === 'undo' ? 'Undo' : 'Redo'}</Button></DialogFooter>
                </DialogContent>
            </Dialog>}
        </Card>
    );
}
