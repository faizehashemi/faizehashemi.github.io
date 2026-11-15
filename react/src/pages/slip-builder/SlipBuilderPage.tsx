import { useEffect, useMemo, useState } from 'react';
import { ChevronDown, ChevronUp, Plus, Printer, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { useConfirm } from '@/components/ConfirmDialog';
import { useSlips } from '@/hooks/useSlips';
import { useCore, useGuard, useLoadCore, useSite } from '@/pms/PmsContext';

// Front desk → Slip builder (Madina): arrange the accommodation slip — rows of one or two fields in any order, each field's label, colour, weight and size,
// the room tables and the footer — with a live preview of a real slip. Saved for the whole site (setting slip_layout); Print slips and the GL copy follow it.
// The drawing is core/slip-print.js layoutSlip, the same code that prints.

type Row = Record<string, any>;
type Layout = { title: string; titleSize: number; size: number; rows: string[][]; fields: Record<string, Row>; rooms: Row; notes: boolean; adminBox: boolean; note: string };
const clone = <T,>(o: T): T => JSON.parse(JSON.stringify(o));
const sel = 'h-8 min-w-0 rounded-md border bg-background px-1.5 text-sm';

export default function SlipBuilderPage() {
    const { cloud } = useCore();
    const loadCore = useLoadCore();
    const guard = useGuard();
    const { siteId } = useSite();
    const { ask, dialog } = useConfirm();
    const slips = useSlips();
    const [sp, setSp] = useState<any>(null);
    const [L, setL] = useState<Layout | null>(null);
    const [saved, setSaved] = useState('');
    const [msg, setMsg] = useState<{ t: string; bad?: boolean }>({ t: '' });
    const [busy, setBusy] = useState(false);
    const [sh, setSh] = useState('');
    const writable = cloud.canWrite(siteId);
    const dirty = !!L && JSON.stringify(L) !== saved;

    useEffect(() => { void loadCore('slip-print').then(async (m: any) => { setSp(m); const l = clone(await m.loadSlipLayout('medina')); setL(l); setSaved(JSON.stringify(l)); }); }, []);   // eslint-disable-line react-hooks/exhaustive-deps
    // a real slip of the site for the preview: the one asked for, else the latest with rooms
    const sample = useMemo(() => {
        const list = (slips.data ?? []).filter((s: Row) => !s.deleted);
        const want = sh.trim() && list.find((s: Row) => String(s.sh_no).toUpperCase() === sh.trim().toUpperCase());
        return want || [...list].reverse().find((s: Row) => (s.rooms?.gents?.length || s.rooms?.ladies?.length)) || list[list.length - 1]
            || { id: 0, site: 'medina', sh_no: '43674', tour_name: 'SAMPLE GROUP', group_leader: '-', building: 'ARTAAL TAIBA', checkin_date: '2026-11-15', checkin_time: '12:00', checkout_date: '2026-11-19', checkout_time: '08:00', gents: 3, ladies: 2, children: 1, infants: 0, total: 6, from_place: 'Makkah', to_place: 'Makkah', rooms: { gents: [{ room_no: '132', assigned: 3 }], ladies: [{ room_no: '134', assigned: 3 }] } };
    }, [slips.data, sh]);

    if (siteId !== 'medina') return <div className="mx-auto max-w-3xl px-4 pt-8"><Card className="p-6"><h1 className="text-2xl font-bold text-primary">Slip builder</h1><p className="mt-2 text-muted-foreground">The slip builder is set up for the Madina site. Switch to Madina to arrange its slip.</p></Card></div>;
    if (!sp || !L) return <div className="p-6 text-muted-foreground">Loading…</div>;

    const F: Record<string, any[]> = sp.SLIP_FIELDS;
    const ids = Object.keys(F);
    const used = [...new Set(L.rows.flat())].filter(id => F[id]);
    const set = (f: (l: Layout) => void) => setL(l => { const d = clone(l!); f(d); return d; });
    const fieldSet = (id: string, k: string, v: any) => set(l => { l.fields[id] = { ...(l.fields[id] || {}), [k]: v }; if (v === '' || v === false || v == null) delete l.fields[id][k]; });
    const move = (i: number, d: number) => set(l => { const j = i + d; if (j < 0 || j >= l.rows.length) return; const [x] = l.rows.splice(i, 1); l.rows.splice(j, 0, x); });
    const html = sp.layoutSlip({ ...sample, site: 'medina' }, sp.rowsFor(sample), { admin: true }, L);

    async function save(layout: Layout | null) {
        setBusy(true);
        try {
            await guard((cloud as any).request('PUT', '/api/slip-layout', { site: 'medina', layout }));
            const l = clone(layout || sp.DEFAULT_LAYOUT);
            sp.setSlipLayout('medina', layout);
            setL(l); setSaved(JSON.stringify(l));
            setMsg({ t: layout ? 'Saved. Print slips and the GL copy use this layout now.' : 'Back to the standard slip.' });
        } catch (e: any) { setMsg({ t: e instanceof cloud.UserError ? e.message : 'Could not save: ' + (e.message || e), bad: true }); }
        finally { setBusy(false); }
    }
    function testPrint() { sp.setSlipLayout('medina', L); sp.printSlips([{ ...sample, site: 'medina' }], { title: 'Slip builder test' }); sp.setSlipLayout('medina', JSON.parse(saved)); }

    const fieldOpts = (cur: string, blank = false) => <>{blank && <option value="">—</option>}{ids.map(id => <option key={id} value={id}>{(L.fields[id]?.label || F[id][0])}{F[id][2] === 'dt' ? ' (date + time)' : ''}{id === cur ? '' : ''}</option>)}</>;

    return (
        <div className="mx-auto grid max-w-[2400px] min-w-0 gap-3 px-3 pb-10 pt-4 sm:px-4">
            <header className="flex flex-wrap items-end justify-between gap-3">
                <div><h1 className="text-2xl font-bold text-primary">Slip builder — Madina</h1>
                    <p className="text-sm text-muted-foreground">Arrange the accommodation slip: rows, labels, colours and sizes. Print slips and the GL copy follow the saved layout.</p></div>
                <div className="flex flex-wrap items-center gap-2">
                    <Button variant="outline" onClick={testPrint}><Printer className="size-4" />Test print</Button>
                    {writable && <Button variant="outline" disabled={busy} onClick={async () => { if (await ask({ title: 'Go back to the standard slip?', body: 'Your layout is replaced by the standard Madina slip for every desk.', confirmLabel: 'Use standard' })) void save(null); }}>Standard slip</Button>}
                    {writable && <Button disabled={!dirty || busy} onClick={() => void save(L)}>Save layout</Button>}
                    {dirty && <Button variant="ghost" onClick={() => setL(JSON.parse(saved))}>Discard</Button>}
                </div>
            </header>
            {msg.t && <p className={cn('text-sm', msg.bad ? 'text-destructive' : 'text-muted-foreground')} role="status">{msg.t}</p>}

            <div className="grid min-w-0 items-start gap-3 lg:grid-cols-[minmax(0,1fr)_560px]">
                <div className="grid min-w-0 gap-3">
                    <Card className="grid gap-3 p-4">
                        <h2 className="font-bold">Heading and text</h2>
                        <div className="grid gap-2 sm:grid-cols-[1fr_7rem_7rem]">
                            <div className="grid gap-1"><Label htmlFor="sbT">Title</Label><Input id="sbT" value={L.title} onChange={e => set(l => { l.title = e.target.value; })} /></div>
                            <div className="grid gap-1"><Label htmlFor="sbTs">Title size</Label><Input id="sbTs" type="number" min={8} max={40} value={L.titleSize} onChange={e => set(l => { l.titleSize = Number(e.target.value) || 14; })} /></div>
                            <div className="grid gap-1"><Label htmlFor="sbS">Text size</Label><Input id="sbS" type="number" min={7} max={24} value={L.size} onChange={e => set(l => { l.size = Number(e.target.value) || 11; })} /></div>
                        </div>
                    </Card>

                    <Card className="grid gap-2 p-4">
                        <div className="flex items-center justify-between"><h2 className="font-bold">Rows</h2><span className="text-xs text-muted-foreground">One field fills the row; two share it</span></div>
                        {L.rows.map((r, i) => (
                            <div key={i} className="grid grid-cols-[2rem_minmax(0,1fr)_minmax(0,1fr)_auto] items-center gap-2">
                                <span className="text-center text-xs text-muted-foreground">{i + 1}</span>
                                <select aria-label={`Row ${i + 1} first field`} className={sel} value={r[0]} onChange={e => set(l => { l.rows[i][0] = e.target.value; })}>{fieldOpts(r[0])}</select>
                                <select aria-label={`Row ${i + 1} second field`} className={sel} value={r[1] || ''} onChange={e => set(l => { l.rows[i] = e.target.value ? [l.rows[i][0], e.target.value] : [l.rows[i][0]]; })}>{fieldOpts(r[1] || '', true)}</select>
                                <span className="flex">
                                    <Button variant="ghost" size="icon" className="size-8" aria-label="Up" disabled={i === 0} onClick={() => move(i, -1)}><ChevronUp className="size-4" /></Button>
                                    <Button variant="ghost" size="icon" className="size-8" aria-label="Down" disabled={i === L.rows.length - 1} onClick={() => move(i, 1)}><ChevronDown className="size-4" /></Button>
                                    <Button variant="ghost" size="icon" className="size-8 text-destructive" aria-label="Remove row" onClick={() => set(l => { l.rows.splice(i, 1); })}><Trash2 className="size-4" /></Button>
                                </span>
                            </div>
                        ))}
                        <Button variant="outline" size="sm" className="justify-self-start" disabled={L.rows.length >= 40} onClick={() => set(l => { l.rows.push(['tour']); })}><Plus className="size-4" />Add row</Button>
                    </Card>

                    <Card className="grid gap-2 p-4">
                        <h2 className="font-bold">How each field looks</h2>
                        <div className="grid grid-cols-[minmax(0,1.4fr)_3.2rem_3rem_4.5rem] items-center gap-x-2 gap-y-1.5 text-xs font-semibold text-muted-foreground"><span>Label</span><span>Colour</span><span>Bold</span><span>Size</span></div>
                        {used.map(id => { const st = L.fields[id] || {}; return (
                            <div key={id} className="grid grid-cols-[minmax(0,1.4fr)_3.2rem_3rem_4.5rem] items-center gap-2">
                                <Input className="h-8" aria-label={`${id} label`} placeholder={F[id][0]} value={st.label || ''} onChange={e => fieldSet(id, 'label', e.target.value)} />
                                <input type="color" aria-label={`${id} colour`} className="h-8 w-12 rounded border" value={st.color || '#111111'} onChange={e => fieldSet(id, 'color', e.target.value === '#111111' ? '' : e.target.value)} />
                                <input type="checkbox" aria-label={`${id} bold`} className="size-5" checked={!!st.bold} onChange={e => fieldSet(id, 'bold', e.target.checked)} />
                                <Input className="h-8" type="number" min={7} max={30} step={0.5} aria-label={`${id} size`} placeholder={String(L.size)} value={st.size ?? ''} onChange={e => fieldSet(id, 'size', e.target.value === '' ? '' : Number(e.target.value))} />
                            </div>); })}
                    </Card>

                    <Card className="grid gap-3 p-4">
                        <div className="flex items-center justify-between"><h2 className="font-bold">Room tables</h2>
                            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={L.rooms.show !== false} onChange={e => set(l => { l.rooms.show = e.target.checked; })} />Show</label></div>
                        <div className="grid gap-2 sm:grid-cols-4">
                            {[['gentsTitle', 'Gents title'], ['ladiesTitle', 'Ladies title'], ['roomLabel', 'Room column'], ['bedsLabel', 'Beds column']].map(([k, t]) => <div key={k} className="grid gap-1"><Label>{t}</Label><Input className="h-8" value={L.rooms[k] || ''} onChange={e => set(l => { l.rooms[k] = e.target.value; })} /></div>)}
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-sm">Room numbers:
                            <input type="color" aria-label="Room number colour" className="h-8 w-12 rounded border" value={L.rooms.color || '#111111'} onChange={e => set(l => { l.rooms.color = e.target.value; })} />
                            <label className="flex items-center gap-1.5"><input type="checkbox" checked={!!L.rooms.bold} onChange={e => set(l => { l.rooms.bold = e.target.checked; })} />Bold</label>
                            <label className="flex items-center gap-1.5">Size <Input className="h-8 w-20" type="number" min={7} max={30} value={L.rooms.size ?? ''} onChange={e => set(l => { l.rooms.size = Number(e.target.value) || undefined; })} /></label>
                        </div>
                    </Card>

                    <Card className="grid gap-3 p-4">
                        <h2 className="font-bold">Footer</h2>
                        <div className="flex flex-wrap gap-5 text-sm">
                            <label className="flex items-center gap-2"><input type="checkbox" checked={L.notes !== false} onChange={e => set(l => { l.notes = e.target.checked; })} />The slip's own notes</label>
                            <label className="flex items-center gap-2"><input type="checkbox" checked={L.adminBox !== false} onChange={e => set(l => { l.adminBox = e.target.checked; })} />Checkout box (admin use only) on printed slips</label>
                        </div>
                        <div className="grid gap-1"><Label htmlFor="sbN">Note at the foot (empty = none)</Label><Input id="sbN" value={L.note || ''} onChange={e => set(l => { l.note = e.target.value; })} /></div>
                    </Card>
                </div>

                <Card className="sticky top-16 grid gap-2 p-4">
                    <div className="flex items-center justify-between gap-2"><h2 className="font-bold">Preview</h2>
                        <Input className="h-8 w-40" placeholder="SH of a slip" aria-label="Preview a slip by SH" value={sh} onChange={e => setSh(e.target.value)} /></div>
                    <style>{sp.SLIP_CSS}</style>
                    <div className="pms-slips rounded-md bg-white p-3"><div dangerouslySetInnerHTML={{ __html: html }} /></div>
                    <p className="text-xs text-muted-foreground">Showing SH {String(sample.sh_no)}. Printed, each copy is fitted to half of an A5 page.</p>
                </Card>
            </div>
            {dialog}
        </div>
    );
}
