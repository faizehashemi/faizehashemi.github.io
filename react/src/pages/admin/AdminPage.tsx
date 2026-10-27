import { useMemo, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { useConfirm } from '@/components/ConfirmDialog';
import { usePrompt } from '@/components/PromptDialog';
import { useDb, useGuard, useLoadApp, useSite } from '@/pms/PmsContext';

// Slip Admin — delete & backup: filter this site's slips, preview one, delete the ticked ones (or all), export / import JSON, print the list.

type Row = Record<string, any>;
const fmt = (dt: unknown) => { const d = new Date(dt as string); return isNaN(+d) ? '' : new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(d); };
const roomList = (r: Row) => [...new Set([...(r.rooms?.gents || []), ...(r.rooms?.ladies || [])].map((x: Row) => String(x.room_no || '').trim()).filter(Boolean))] as string[];
const when = (d?: string, t?: string) => (d ? fmt(new Date(`${d}T${t || '00:00'}`)) : '');

export default function AdminPage() {
    const db = useDb();
    const guard = useGuard();
    const loadApp = useLoadApp();
    const { site, siteId } = useSite();
    const { ask: confirm, dialog: confirmDialog } = useConfirm();
    const { ask: prompt, dialog: promptDialog } = usePrompt();
    const all = useQuery({ queryKey: ['admin-slips', siteId], queryFn: async () => (await guard(db.all())) as Row[] });
    const [f, setF] = useState({ q: '', room: '', bld: '', from: '', to: '' });
    const [sel, setSel] = useState<Set<number>>(new Set());
    const [view, setView] = useState<Row | null>(null);
    const [status, setStatus] = useState('');
    const file = useRef<HTMLInputElement>(null);
    const cache = all.data ?? [];
    const blocked = () => { if (!db.readonly) return false; setStatus(db.readonlyReason); return true; };

    const buildings = useMemo(() => [...new Set(cache.map(r => (r.building || '').trim()).filter(Boolean))].sort(), [cache]);
    const rows = useMemo(() => {
        const q = f.q.trim().toLowerCase(), rq = f.room.trim().toLowerCase();
        const from = f.from ? new Date(f.from + 'T00:00') : null, to = f.to ? new Date(f.to + 'T23:59:59') : null;
        return cache.filter(r => {
            if (f.bld && (r.building || '').trim() !== f.bld) return false;
            if (from && new Date(r.createdAt) < from) return false;
            if (to && new Date(r.createdAt) > to) return false;
            if (q && ![r.tour_name || '', r.group_leader || '', r.building || '', String(r.sh_no || ''), String(r.total || '')].join(' ').toLowerCase().includes(q)) return false;
            if (rq && !roomList(r).some(x => x.toLowerCase().includes(rq))) return false;
            return true;
        }).sort((a, b) => (a.createdAt > b.createdAt ? -1 : 1));
    }, [cache, f]);
    const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => { setF(p => ({ ...p, [k]: e.target.value })); setSel(new Set()); };
    const refresh = async () => { setView(null); await all.refetch(); };

    async function delSel() {
        if (blocked()) return;
        const ids = [...sel];
        if (!ids.length) { setStatus('Select at least one slip to delete.'); return; }
        if (!(await confirm({ title: `Delete ${ids.length} selected slip(s)?`, body: 'This cannot be undone.', confirmLabel: 'Delete' }))) return;
        let ok = 0, fail = 0;
        for (const id of ids) { try { await db.remove(id); ok++; } catch { fail++; } }
        setSel(new Set()); await refresh(); setStatus(`Deleted ${ok} slip(s). ${fail ? fail + ' failed.' : ''}`);
    }
    async function delAll() {
        if (blocked()) return;
        const msg = await prompt({ title: `Type DELETE to erase ALL ${site.label} slips for every desk.`, body: 'No backsies.' });
        if (msg !== 'DELETE') return;
        try { const { deleted } = await db.clear(); await refresh(); setStatus(`Deleted ${deleted} ${site.label} slip(s).`); } catch (e: any) { setStatus(e.message); }
    }
    async function exportJson() {
        const data = (await guard(db.all())) as Row[];
        const blob = new Blob([JSON.stringify({ exportedAt: new Date().toISOString(), site: siteId, count: data.length, slips: data }, null, 2)], { type: 'application/json' });
        const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
        a.download = `pms_slips_${siteId}_backup_${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
        document.body.appendChild(a); a.click(); a.remove();
    }
    async function importJson(fl?: File) {
        if (!fl) return;
        try {
            const json = JSON.parse(await fl.text());
            const slips: Row[] = Array.isArray(json) ? json : (json.slips || json.db?.stores?.slips?.rows || []);
            if (!Array.isArray(slips) || !slips.length) { setStatus('No slips found in file.'); return; }
            const { siteOfBuilding } = await loadApp('config.js');
            // only this site's slips (by site field or building); the other site's are left out
            const mine = slips.filter(s => (s.site || siteOfBuilding(s.building) || siteId) === siteId), other = slips.length - mine.length;
            if (!mine.length) { setStatus(`All ${slips.length} slip(s) in this file belong to the other site. Import them from that site.`); return; }
            const add = await confirm({ title: `${mine.length} ${site.label} slip(s) to import${other ? ` (${other} of the other site will be left out)` : ''}`, body: 'Add to existing, or replace all of this site\'s slips first?', confirmLabel: 'Add to existing' });
            if (!add) {
                const msg = await prompt({ title: `Type REPLACE to delete ALL ${site.label} slips for every desk, then import.` });
                if (msg !== 'REPLACE') return;
                await db.clear();
            }
            const res = await db.bulkWrite({ add: mine.map(({ id: _i, _v, _seq, ...rest }) => ({ ...rest, site: siteId })) }, 'json-import');
            await refresh(); setStatus(`Imported ${res.created} slip(s)${res.skipped ? `, ${res.skipped} already there` : ''}${other ? `, ${other} of the other site left out` : ''}.`);
        } catch (e: any) { setStatus('Import failed: ' + (e.message || e)); }
        finally { if (file.current) file.current.value = ''; }
    }

    const fld = (label: string, el: React.ReactNode) => <div className="grid gap-1"><Label>{label}</Label>{el}</div>;
    return (
        <div className="mx-auto grid grid-cols-[minmax(0,1fr)] max-w-[2400px] min-w-0 gap-3 px-3 pb-10 pt-4 sm:px-4">
            <h1 className="text-2xl font-bold text-primary print:text-black">Slip Admin — Delete &amp; Backup</h1>
            <div className="grid grid-cols-2 items-end gap-3 sm:grid-cols-3 lg:grid-cols-5 print:hidden">
                {fld('Search (tour / leader / building / SH)', <Input placeholder="type to filter…" value={f.q} onChange={set('q')} />)}
                {fld('Search by room', <Input placeholder="e.g., 501 or 12A" value={f.room} onChange={set('room')} />)}
                {fld('Building', <select className="h-9 rounded-md border bg-background px-2 text-sm" value={f.bld} onChange={set('bld')}><option value="">All buildings</option>{buildings.map(b => <option key={b}>{b}</option>)}</select>)}
                {fld('Created from', <Input type="date" value={f.from} onChange={set('from')} />)}{fld('Created to', <Input type="date" value={f.to} onChange={set('to')} />)}
                <div className="col-span-full flex flex-wrap gap-2">
                    <Button variant="outline" onClick={() => void refresh()}>Refresh</Button><Button variant="outline" onClick={() => void exportJson()}>Export JSON</Button>
                    <input ref={file} hidden type="file" accept="application/json" onChange={e => void importJson(e.target.files?.[0])} /><Button variant="outline" onClick={() => { if (!blocked()) file.current?.click(); }}>Import JSON</Button>
                    <Button variant="outline" onClick={() => window.print()}>Print List</Button></div>
            </div>
            <div className="grid items-start gap-3 lg:grid-cols-[minmax(0,1fr)_22rem]">
                <div className="grid gap-2">
                    <Table>
                        <TableHeader><TableRow><TableHead className="w-9 print:hidden"><Checkbox aria-label="Select all" checked={rows.length > 0 && sel.size === rows.length} onCheckedChange={v => setSel(v === true ? new Set(rows.map(r => r.id)) : new Set())} /></TableHead>
                            <TableHead>ID</TableHead><TableHead>Tour</TableHead><TableHead>Leader</TableHead><TableHead>Building</TableHead><TableHead>SH</TableHead><TableHead>Check-in</TableHead><TableHead>Check-out</TableHead><TableHead>Created</TableHead></TableRow></TableHeader>
                        <TableBody>{rows.map(r => (
                            <TableRow key={r.id} className={cn('cursor-pointer', view?.id === r.id && 'bg-accent')} onClick={() => setView(r)}>
                                <TableCell className="print:hidden" onClick={e => e.stopPropagation()}><Checkbox aria-label={`Select ${r.id}`} checked={sel.has(r.id)} onCheckedChange={v => setSel(s => { const n = new Set(s); if (v === true) n.add(r.id); else n.delete(r.id); return n; })} /></TableCell>
                                <TableCell>{r.id}</TableCell><TableCell>{r.tour_name || ''}</TableCell><TableCell>{r.group_leader || ''}</TableCell><TableCell>{(r.building || '').trim()}</TableCell><TableCell>{r.sh_no ?? ''}</TableCell>
                                <TableCell>{when(r.checkin_date, r.checkin_time)}</TableCell><TableCell>{when(r.checkout_date, r.checkout_time)}</TableCell><TableCell>{fmt(r.createdAt)}</TableCell></TableRow>))}</TableBody></Table>
                    <div className="flex flex-wrap items-center gap-2 print:hidden">
                        <Button variant="outline" className="text-destructive" onClick={() => void delSel()}>Delete selected</Button><Button variant="outline" className="text-destructive" onClick={() => void delAll()}>Delete ALL</Button>
                        <span className="text-sm text-muted-foreground">{rows.length} slip(s) shown</span></div>
                </div>
                <Card className="gap-1 p-3 text-sm print:hidden"><h3 className="font-bold">Preview</h3>
                    {!view ? <p className="text-muted-foreground">Select a row to preview its details.</p> : (() => { const r = view, cap = (x: Row) => `${x.room_no || ''} (cap ${x.capacity ?? '?'})`;
                        return <div className="grid gap-1"><div><b>ID</b> #{r.id} · <b>Created</b> {fmt(r.createdAt)}{r.updatedAt ? <> · <b>Updated</b> {fmt(r.updatedAt)}</> : null}</div>
                            <div><b>Tour:</b> {r.tour_name}</div><div><b>Leader:</b> {r.group_leader}</div><div><b>Building:</b> {(r.building || '').trim()} &nbsp; <b>SH:</b> {r.sh_no ?? ''}</div>
                            <div><b>Check-in:</b> {r.checkin_date} {r.checkin_time}</div><div><b>Check-out:</b> {r.checkout_date} {r.checkout_time}</div>
                            <div className="mt-1"><b>Rooms:</b> {roomList(r).join(', ') || '—'}</div>
                            <div><b>Gents rooms:</b> {(r.rooms?.gents || []).map(cap).join(', ') || '—'}</div><div><b>Ladies rooms:</b> {(r.rooms?.ladies || []).map(cap).join(', ') || '—'}</div>
                            <div className="mt-1"><b>Totals:</b> Total {r.total ?? ''} | Gents {r.gents ?? ''} | Ladies {r.ladies ?? ''} | Children {r.children ?? ''} | Infants {r.infants ?? ''}</div></div>; })()}</Card>
            </div>
            <p className="text-sm text-muted-foreground">{status || `${cache.length} ${site.label} slip(s).${db.readonly ? ' ' + db.readonlyReason : ''}`}</p>
            {confirmDialog}{promptDialog}
        </div>
    );
}
