import { useEffect, useMemo, useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { EyeOff, ImageDown, Plus, Printer, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSlips } from '@/hooks/useSlips';
import { useCore, useGuard, useLoadCore, useNav, useParams, useSite } from '@/pms/PmsContext';
import { DayNav } from '../transport/DayNav';
import {
    ARRIVAL_CSS, COL_WIDTHS, INBOUND_DEST, applySheet, arrivalHtml, buildArrival, busSize, columnTotal, label, otherSite,
    type Field, type Sheet, type ShownRow,
} from './arrival';

// Arrival sheet: who reaches this site's hotels on a day, to hand to the reception and the floor staff. Buses from the other city first (from that site's transport
// list, numbered as there), then the airport arrivals; each row has the time the group is expected at the hotel (Setup → Travel times), its main floor and pax.
// Every cell — headings, title and date too — can be changed by clicking it; rows can be added or hidden. Those edits belong to this sheet only (site + day,
// GET/PUT /api/arrival-sheet), are saved by themselves and seen by every desk, and never change a slip or the transport list. "Back to PMS data" clears them.
// Viewer logins see the sheet read only. Print opens a preview tab and then the print dialog. #/<site>/arrival?day=YYYY-MM-DD

type Row = Record<string, any>;
type Saved = { sheet: Sheet | null; updated_at: string | null; updated_by: string | null };

/** one editable cell: click and type; Enter or leaving the cell keeps the change */
function Cell({ as: Tag = 'td', value, onSave, editable, className, colSpan, rowSpan, numeric, edited }: {
    as?: 'td' | 'th'; value: string; onSave: (v: string) => void; editable: boolean; className?: string; colSpan?: number; rowSpan?: number; numeric?: boolean; edited?: boolean;
}) {
    const ref = useRef<HTMLElement | null>(null);
    useEffect(() => { if (ref.current && document.activeElement !== ref.current && ref.current.innerText !== value) ref.current.innerText = value; }, [value]);
    return (
        <Tag ref={ref as any} colSpan={colSpan} rowSpan={rowSpan} className={[className, editable ? 'ed' : '', edited ? 'edited' : ''].filter(Boolean).join(' ')}
            contentEditable={editable} suppressContentEditableWarning spellCheck={false} title={editable ? 'Click to change' : undefined}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); (e.currentTarget as HTMLElement).blur(); } if (e.key === 'Escape') { (e.currentTarget as HTMLElement).innerText = value; (e.currentTarget as HTMLElement).blur(); } }}
            onBlur={e => { let v = (e.currentTarget as HTMLElement).innerText.replace(/ /g, ' ').trim(); if (numeric) v = v.replace(/[^\d]/g, ''); if (v !== value) onSave(v); else (e.currentTarget as HTMLElement).innerText = value; }}>
            {value}
        </Tag>
    );
}

export default function ArrivalPage() {
    const { transport, rooms, settings, ums, cloud } = useCore();
    const T = transport as any;
    const guard = useGuard(), params = useParams(), loadCore = useLoadCore(), qc = useQueryClient();
    const { site, siteId } = useSite();
    const { navigate } = useNav();
    const day = /^\d{4}-\d{2}-\d{2}$/.test(params.get('day') || '') ? (params.get('day') as string) : (T.today() as string);
    const other = otherSite(siteId), otherName = other === 'makkah' ? 'Makkah' : 'Medina';
    const me = (cloud as any).currentDesk?.();
    const canEdit = !!me && me.role !== 'viewer' && (me.role === 'admin' || me.site === siteId);
    const slips = useSlips();
    const [msg, setMsg] = useState(''), [note, setNote] = useState(''), [saving, setSaving] = useState('');
    const [days, setDays] = useState<{ day: string; n: number }[]>([]);
    useEffect(() => { void guard<any>(T.listDays(other)).then(setDays, () => setDays([])); }, [other]);   // eslint-disable-line react-hooks/exhaustive-deps

    // the other site's day: the buses that end at this site
    const bus = useQuery({
        queryKey: ['arrival-buses', other, day],
        queryFn: async () => {
            const doc = await guard<any>(T.loadDay(other, day));
            return (T.signage(doc.rows || [], other) as Row[]).find(g => g.dest.id === INBOUND_DEST[siteId])?.buses ?? [];
        },
        staleTime: 30_000,
    });
    const cfg = useQuery({ queryKey: ['arrival-settings', siteId], queryFn: async () => (await (settings as any).loadSettings()).settings as Row });
    // this sheet's own edits (an older server without them: no edits)
    const savedKey = ['arrival-sheet', siteId, day];
    const saved = useQuery({ queryKey: savedKey, queryFn: () => (cloud as any).request('GET', `/api/arrival-sheet?site=${siteId}&day=${day}`).catch(() => ({ sheet: null, updated_at: null, updated_by: null })) as Promise<Saved> });
    const sheet = saved.data?.sheet ?? null;

    const model = useMemo(() => buildArrival({
        day, hostId: siteId, slips: slips.data ?? [], buses: bus.data ?? [],
        hours: { own: Number(cfg.data?.arrival_commute_hours ?? 3), other: Number(cfg.data?.arrival_other_hours ?? 5) },
        libs: { T, floorOf: (rooms as any).floorOf, shiftTime: (settings as any).shiftTime, byRoad: (ums as any).byRoad },
    }), [day, siteId, slips.data, bus.data, cfg.data]);   // eslint-disable-line react-hooks/exhaustive-deps
    const shown = useMemo(() => applySheet(model, sheet), [model, sheet]);
    const dateText = day.split('-').reverse().join('-');
    const html = arrivalHtml(shown, sheet, dateText);
    const hiddenCount = (sheet?.hidden || []).filter(k => model.some(r => r.key === k)).length;

    // every change saves the whole (small) set of edits for this sheet
    async function save(next: Sheet | null) {
        const prev = qc.getQueryData<Saved>(savedKey);
        qc.setQueryData<Saved>(savedKey, { sheet: next, updated_at: prev?.updated_at ?? null, updated_by: prev?.updated_by ?? null });
        setSaving('Saving…'); setMsg('');
        try {
            const r = await (cloud as any).request('PUT', `/api/arrival-sheet?site=${siteId}&day=${day}`, { sheet: next });
            qc.setQueryData<Saved>(savedKey, r);
            setSaving('Saved ✓');
        } catch (e: any) {
            qc.setQueryData<Saved>(savedKey, prev);
            setSaving(''); setMsg('Could not save: ' + (e?.message || e));
        }
    }
    const base = (): Sheet => ({ labels: { ...(sheet?.labels || {}) }, cells: { ...(sheet?.cells || {}) }, added: [...(sheet?.added || [])], hidden: [...(sheet?.hidden || [])] });
    const setLabel = (id: string, v: string) => { const s = base(); s.labels![id] = v; void save(s); };
    const setCell = (r: ShownRow, k: Field, v: string) => {
        const s = base();
        if (r.added) s.added = s.added!.map(a => (a.key === r.key ? { ...a, v: { ...a.v, [k]: v } } : a));
        else s.cells![r.key] = { ...(s.cells![r.key] || {}), [k]: v };
        void save(s);
    };
    const hideRow = (r: ShownRow) => { const s = base(); if (r.added) s.added = s.added!.filter(a => a.key !== r.key); else s.hidden = [...new Set([...s.hidden!, r.key])]; void save(s); };
    const addRow = () => { const s = base(); s.added = [...s.added!, { key: `add-${Date.now().toString(36)}`, v: {} }]; void save(s); };
    const showHidden = () => { const s = base(); s.hidden = []; void save(s); };
    const reset = () => { if (confirm('Throw away every change made to this sheet and show the PMS data again?')) void save(null); };

    function print() {
        const w = window.open('', '_blank');
        if (!w) { setMsg('The browser blocked the new tab. Allow pop-ups for this site, then press Print again.'); return; }
        w.document.open();
        w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>Arrival ${day}</title><style>${ARRIVAL_CSS}
            @page { size: A4 landscape; margin: 8mm; } body { margin: 0; background: #eee; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            .wrap { max-width: 1100px; margin: 12px auto; background: #fff; } @media print { body { background: #fff; } .wrap { max-width: none; margin: 0; } }
        </style></head><body><div class="wrap">${html}</div><script>window.addEventListener('load', function () { setTimeout(function () { window.focus(); window.print(); }, 250); });<\/script></body></html>`);
        w.document.close();
    }
    async function copyImage() {
        setMsg(''); setNote('');
        const host = document.createElement('div');
        host.style.cssText = 'position:fixed;left:-10000px;top:0;width:1000px;background:#fff';
        host.innerHTML = `<style>${ARRIVAL_CSS}</style>${html}`;
        document.body.appendChild(host);
        try {
            const lib = await loadCore('table-image');
            const how = await lib.copyTablesImage([...host.querySelectorAll('table')], `arrival-${site.label}-${day}.png`);
            setNote(how === 'copied' ? 'Copied as a picture — paste it into the chat.' : 'This browser cannot copy pictures — the image was downloaded instead.');
        } catch (e: any) { setMsg('Could not make the image: ' + (e?.message || e)); }
        finally { host.remove(); }
    }

    const L = (id: string) => label(sheet, id, dateText);
    const H = (id: string, props: { className?: string; colSpan?: number; rowSpan?: number } = {}) => <Cell as="th" value={L(id)} onSave={v => setLabel(id, v)} editable={canEdit} edited={sheet?.labels?.[id] != null} {...props} />;
    const PX: Field[] = ['m', 'f', 'c', 'i'];

    return (
        <div className="mx-auto grid grid-cols-[minmax(0,1fr)] max-w-[2400px] min-w-0 gap-3 px-3 pb-10 pt-4 sm:px-4">
            <header className="flex flex-wrap items-start justify-between gap-3">
                <div><h1 className="text-2xl font-bold text-primary">Arrival sheet</h1>
                    <p className="text-sm text-muted-foreground">Who reaches {site.label} on this day: the buses from {otherName} (numbered as on that site's transport list), then the airport arrivals. Arrival time = when the group is expected at the hotel (Setup → Travel times). Floor = the floor most of the group's rooms are on.</p>
                    <p className="text-sm text-muted-foreground">{canEdit ? 'Click any cell to change it — the change is kept for this sheet only (it never changes a slip or the transport list).' : 'Read only for this login.'}</p></div>
                <div className="flex flex-wrap gap-2">
                    <Button onClick={print} disabled={!shown.length}><Printer className="size-4" />Print</Button>
                    <Button variant="outline" onClick={() => void copyImage()} disabled={!shown.length}><ImageDown className="size-4" />Copy image</Button>
                </div>
            </header>
            <DayNav day={day} days={days} onChange={d => navigate('arrival', { day: d })} />
            {note && <div className="rounded-md border border-ok/40 bg-ok-soft px-3 py-2 text-sm text-ok">{note}</div>}
            {(msg || bus.isError) && <div className="rounded-md border border-destructive bg-destructive/10 px-3 py-2 text-sm text-destructive">{msg || `Could not load the ${otherName} transport list — the bus rows are missing.`}</div>}
            {canEdit && (
                <div className="flex flex-wrap items-center gap-2 text-sm">
                    <Button size="sm" variant="outline" onClick={addRow}><Plus className="size-4" />Add a row</Button>
                    {hiddenCount > 0 && <Button size="sm" variant="outline" onClick={showHidden}><EyeOff className="size-4" />Show {hiddenCount} hidden row{hiddenCount === 1 ? '' : 's'}</Button>}
                    {sheet && <Button size="sm" variant="outline" onClick={reset}><RotateCcw className="size-4" />Back to PMS data</Button>}
                    <span className="text-muted-foreground">{saving}{!saving && saved.data?.updated_by ? `Last changed by ${saved.data.updated_by} · ${new Date(saved.data.updated_at as string).toLocaleString(undefined, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}` : ''}</span>
                </div>
            )}
            <style>{ARRIVAL_CSS + `
                .arr .ed { cursor: text; outline: none; } .arr .ed:hover { box-shadow: inset 0 0 0 2px rgba(154,116,20,.35); } .arr .ed:focus { box-shadow: inset 0 0 0 2px #9a7414; background: #fffbe8; }
                .arr .edited { background-image: linear-gradient(135deg, #2b7a3f 0, #2b7a3f 6px, transparent 6px); }
                .arr td.act { border: 0; background: transparent; width: 34px; padding: 0 0 0 4px; }`}</style>
            <div className="overflow-auto rounded-lg border bg-white p-1">
                <table className="arr">
                    <colgroup>{COL_WIDTHS.map((w, i) => <col key={i} style={{ width: w }} />)}{canEdit && <col style={{ width: 34 }} />}</colgroup>
                    <thead>
                        <tr className="ttl">{H('title', { colSpan: 11 })}</tr>
                        <tr className="dt">{H('dateLbl', { colSpan: 3 })}{H('date', { className: 'v', colSpan: 8 })}</tr>
                        <tr className="hd">{H('bus', { rowSpan: 2 })}{H('time', { rowSpan: 2 })}{H('ref', { rowSpan: 2 })}{H('group', { rowSpan: 2 })}{H('leader', { rowSpan: 2 })}{H('floor', { rowSpan: 2, className: 'fl' })}{H('pax', { colSpan: 5 })}</tr>
                        <tr className="hd">{H('m', { className: 'sub' })}{H('f', { className: 'sub' })}{H('c', { className: 'sub' })}{H('i', { className: 'sub' })}{H('total', { className: 'sub' })}</tr>
                    </thead>
                    <tbody>
                        {shown.length ? shown.map(r => (
                            <tr key={r.key}>
                                {(['bus', 'time', 'ref', 'group', 'leader', 'floor'] as Field[]).map(k => (
                                    <Cell key={k} value={r.v[k]} onSave={v => setCell(r, k, v)} editable={canEdit} edited={!!r.edited[k]}
                                        className={k === 'bus' ? `bus ${busSize(r.v.bus)}` : k === 'time' ? 'tm' : k === 'ref' ? 'ref' : k === 'floor' ? 'fl' : undefined} />
                                ))}
                                {PX.map(k => <Cell key={k} value={r.v[k]} onSave={v => setCell(r, k, v)} editable={canEdit} edited={!!r.edited[k]} numeric className="px" />)}
                                <Cell value={r.v.pax} onSave={v => setCell(r, 'pax', v)} editable={canEdit} edited={!!r.edited.pax} numeric className="px tot" />
                                {canEdit && <td className="act"><Button size="icon" variant="ghost" className="size-7" title={r.added ? 'Delete this row' : 'Hide this row on the sheet'} onClick={() => hideRow(r)}>✕</Button></td>}
                            </tr>
                        )) : <tr><td className="none" colSpan={11}>No arrivals for this day.</td></tr>}
                    </tbody>
                    <tfoot><tr>{H('sum', { colSpan: 6 })}{(['m', 'f', 'c', 'i', 'pax'] as Field[]).map(k => <td key={k}>{columnTotal(shown, k)}</td>)}</tr></tfoot>
                </table>
            </div>
            {canEdit && sheet && <p className="text-xs text-muted-foreground">A green corner marks a cell changed by hand. New arrivals added in the PMS still appear here; hidden rows stay hidden until “Show hidden rows”.</p>}
        </div>
    );
}
