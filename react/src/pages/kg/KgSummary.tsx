import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useSlips } from '@/hooks/useSlips';
import { useCore, useGuard, useLoadCore, useSite } from '@/pms/PmsContext';
import { groupName, kgSummary, sectionTable, summaryDoc, type Section } from './summary';

// KG page (Makkah) → Export summary: the day's Atraaf, Wada Sabaq (with the clash), Raate Haram and Kaale Fajare Haram lists (summary.ts), each ticked in or out,
// as a PDF (print), Word, Excel or one picture on the clipboard.

type Row = Record<string, any>;

export function KgSummary({ day, onClose }: { day: string; onClose: () => void }) {
    const { transport, ums, settings } = useCore();
    const T = transport as any;
    const guard = useGuard();
    const loadCore = useLoadCore();
    const { site, siteId } = useSite();
    const slips = useSlips();
    const [secs, setSecs] = useState<Section[] | null>(null);
    const [off, setOff] = useState<Set<string>>(new Set());
    const [msg, setMsg] = useState('');
    const box = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!slips.data) return;
        let alive = true;
        void (async () => {
            try {
                const [d, s] = await Promise.all([guard<any>(T.loadDay(siteId, day)).catch(() => ({ rows: [] })), guard<any>((settings as any).loadSettings()).catch(() => null)]);
                const rows = d?.rows || [], info = T.resolve(rows) as Map<string, any>;
                const trips = rows.map((r: Row) => ({ ...r, route: info.get(r.key)?.route || r.route }));
                const win = { ...(settings as any).DEFAULTS.fe_windows, ...(s?.settings?.fe_windows || {}) };
                if (alive) setSecs(kgSummary(slips.data as Row[], trips, day, win, (ums as any).baseSh));
            } catch (e: any) { if (alive) setMsg('Could not build the summary: ' + (e.message || e)); }
        })();
        return () => { alive = false; };
    }, [slips.data, day, siteId]);   // eslint-disable-line react-hooks/exhaustive-deps

    const chosen = (secs || []).filter(s => !off.has(s.id));
    const name = `KG summary ${day}`;
    function save(kind: 'word' | 'excel') {
        const blob = new Blob([summaryDoc(chosen, day, site.label, kind)], { type: kind === 'word' ? 'application/msword' : 'application/vnd.ms-excel' });
        const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `${name}.${kind === 'word' ? 'doc' : 'xls'}`; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    }
    function pdf() {
        const w = window.open('', '_blank');
        if (!w) { setMsg('The browser blocked the new tab: allow pop-ups for this site.'); return; }
        w.document.open(); w.document.write(summaryDoc(chosen, day, site.label, 'print')); w.document.close();
    }
    async function image() {
        try {
            const ti = await loadCore('table-image');
            const tables = [...(box.current?.querySelectorAll('table.kgs') || [])].filter(t => !off.has((t as HTMLElement).dataset.id || ''));
            const how = await ti.copyTablesImage(tables, `${name}.png`);
            setMsg(how === 'copied' ? 'Copied as a picture — paste it into the chat.' : 'Saved as a picture (this browser cannot copy pictures).');
        } catch (e: any) { setMsg('Could not make the picture: ' + (e.message || e)); }
    }

    return (
        <Dialog open onOpenChange={o => { if (!o) onClose(); }}>
            <DialogContent className="max-h-[92vh] max-w-[calc(100%-1rem)] overflow-auto sm:max-w-3xl">
                <DialogHeader><DialogTitle>Export summary — {day.split('-').reverse().join('/')}</DialogTitle></DialogHeader>
                <div className="flex flex-wrap items-center gap-2">
                    <Button size="sm" disabled={!chosen.length} onClick={pdf}>PDF</Button>
                    <Button size="sm" variant="outline" disabled={!chosen.length} onClick={() => save('word')}>Word</Button>
                    <Button size="sm" variant="outline" disabled={!chosen.length} onClick={() => save('excel')}>Excel</Button>
                    <Button size="sm" variant="outline" disabled={!chosen.length} onClick={() => void image()}>Copy as image</Button>
                    <span className="text-sm text-muted-foreground" role="status">{msg}</span>
                </div>
                {!secs && !msg && <p className="text-sm text-muted-foreground">Reading the slips and the Transport day…</p>}
                {secs && <div className="flex flex-wrap gap-3 text-sm">{secs.map(s => <label key={s.id} className="flex items-center gap-1.5"><input type="checkbox" checked={!off.has(s.id)} onChange={e => setOff(o => { const n = new Set(o); if (e.target.checked) n.delete(s.id); else n.add(s.id); return n; })} />{s.title} ({s.items.length})</label>)}</div>}
                <div ref={box} className="grid gap-1 [&_table.kgs]:text-sm [&_table.kgs_td]:border [&_table.kgs_th]:border [&_table.kgs_th]:bg-secondary [&_table.kgs_th]:text-left [&_table.kgs_td]:px-2 [&_table.kgs_th]:px-2 [&_table.kgs_td]:py-1 [&_table.kgs_th]:py-1">
                    {(secs || []).map(s => <div key={s.id} className={off.has(s.id) ? 'hidden' : ''} title={s.items.map(groupName).join(', ')}
                        dangerouslySetInnerHTML={{ __html: sectionTable(s).replace('<table class="kgs"', `<table class="kgs" data-id="${s.id}"`) }} />)}
                </div>
            </DialogContent>
        </Dialog>
    );
}
