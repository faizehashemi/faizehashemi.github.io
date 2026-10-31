import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ImageDown, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSlips } from '@/hooks/useSlips';
import { useCore, useGuard, useLoadCore, useNav, useParams, useSite } from '@/pms/PmsContext';
import { DayNav } from '../transport/DayNav';
import { ARRIVAL_CSS, INBOUND_DEST, arrivalHtml, buildArrival, otherSite } from './arrival';

// Arrival sheet: who reaches this site's hotels on a day, to hand to the reception and the floor staff. Buses from the other city first (from that site's transport
// list, numbered as there), then the airport arrivals; each row has the time the group is expected at the hotel (Setup → Travel times), its floor and pax.
// Print opens a preview tab and then the print dialog. #/<site>/arrival?day=YYYY-MM-DD

type Row = Record<string, any>;

export default function ArrivalPage() {
    const { transport, rooms, settings, ums } = useCore();
    const T = transport as any;
    const guard = useGuard(), params = useParams(), loadCore = useLoadCore();
    const { site, siteId } = useSite();
    const { navigate } = useNav();
    const day = /^\d{4}-\d{2}-\d{2}$/.test(params.get('day') || '') ? (params.get('day') as string) : (T.today() as string);
    const other = otherSite(siteId), otherName = other === 'makkah' ? 'Makkah' : 'Medina';
    const slips = useSlips();
    const [msg, setMsg] = useState(''), [note, setNote] = useState('');
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
    const model = useMemo(() => buildArrival({
        day, hostId: siteId, slips: slips.data ?? [], buses: bus.data ?? [],
        hours: { own: Number(cfg.data?.arrival_commute_hours ?? 3), other: Number(cfg.data?.arrival_other_hours ?? 5) },
        libs: { T, floorOf: (rooms as any).floorOf, shiftTime: (settings as any).shiftTime, byRoad: (ums as any).byRoad },
    }), [day, siteId, slips.data, bus.data, cfg.data]);   // eslint-disable-line react-hooks/exhaustive-deps
    const html = arrivalHtml(model, day.split('-').reverse().join('-'));

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

    return (
        <div className="mx-auto grid grid-cols-[minmax(0,1fr)] max-w-[2400px] min-w-0 gap-3 px-3 pb-10 pt-4 sm:px-4">
            <header className="flex flex-wrap items-start justify-between gap-3">
                <div><h1 className="text-2xl font-bold text-primary">Arrival sheet</h1>
                    <p className="text-sm text-muted-foreground">Who reaches {site.label} on this day: the buses from {otherName} (numbered as on that site's transport list), then the airport arrivals. Time = when the group is expected at the hotel (Setup → Travel times).</p></div>
                <div className="flex flex-wrap gap-2">
                    <Button onClick={print} disabled={!model.length}><Printer className="size-4" />Print</Button>
                    <Button variant="outline" onClick={() => void copyImage()} disabled={!model.length}><ImageDown className="size-4" />Copy image</Button>
                </div>
            </header>
            <DayNav day={day} days={days} onChange={d => navigate('arrival', { day: d })} />
            {note && <div className="rounded-md border border-ok/40 bg-ok-soft px-3 py-2 text-sm text-ok">{note}</div>}
            {(msg || bus.isError) && <div className="rounded-md border border-destructive bg-destructive/10 px-3 py-2 text-sm text-destructive">{msg || `Could not load the ${otherName} transport list — the bus rows are missing.`}</div>}
            <style>{ARRIVAL_CSS}</style>
            <div className="overflow-auto rounded-lg border bg-white" dangerouslySetInnerHTML={{ __html: html }} />
        </div>
    );
}
