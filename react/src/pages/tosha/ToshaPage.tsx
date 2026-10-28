import { useEffect, useMemo, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ClipboardCopy, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { useCore, useGuard, useNav, useSite } from '@/pms/PmsContext';
import { DEF_MADINA, atraafModel, airportModel, blobNow, blobOf, busKey, choiceOf, drawAll, drawImage, extraOf, leaders, madinaModel, plural, toolkit, type Choice, type Model } from './tosha';

// Tosha summary (Mawaid): travel refreshments for the buses of tomorrow (top) and today (bottom), from the Transport day lists — the same buses as the
// Bus sheets' Print summary. The choices are kept in the cloud per site and day (GET/PUT /api/tosha). "Copy image" draws the card as a picture and puts
// it on the clipboard for the Mawaid WhatsApp group (phones: Share).

type CardItem = { id: string; D: any; kind: 'long' | 'airport' | 'summary'; g: any; r: any };
type DayState = { groups: any[]; choice: Choice; updated_at?: string; updated_by?: string };
const canShare = typeof File === 'function' && !!navigator.canShare?.({ files: [new File([''], 'x.png', { type: 'image/png' })] });

function Big({ n, text }: { n: React.ReactNode; text: string }) { return <div className="flex items-baseline gap-2"><b className="text-4xl text-primary">{n}</b><span className="text-sm text-muted-foreground">{text}</span></div>; }
function Chips({ list }: { list: string[] }) { return <div className="flex flex-wrap gap-2">{list.map(t => <span key={t} className="rounded-full border border-gold bg-accent px-3 py-1 text-sm font-bold">{t}</span>)}</div>; }
const GroupsCell = ({ b }: { b: any }) => <>{leaders(b)[0] || ''}{b.rows.length > 1 && <small className="block text-muted-foreground">+ {plural(b.rows.length - 1, 'more group')}</small>}</>;

function DayBlock({ label, day, writable }: { label: string; day: string; writable: boolean }) {
    const { transport: t, cloud } = useCore();
    const guard = useGuard();
    const { siteId } = useSite();
    const DESTS = t.destsFor(siteId) as any[];
    const LONG = DESTS.find(x => x.tosha === 'long');
    const { fleet, vno, vlabel, busChoice } = useMemo(() => toolkit(t), [t]);
    const [state, setState] = useState<DayState | null>(null);
    const [note, setNote] = useState<Record<string, string>>({});
    const [busy, setBusy] = useState(false);
    const [err, setErr] = useState('');
    const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const q = useQuery({
        queryKey: ['tosha', siteId, day],
        queryFn: async () => {
            const [doc, tosha] = await guard(Promise.all([t.loadDay(siteId, day), cloud.request('GET', `/api/tosha?site=${encodeURIComponent(siteId)}&day=${day}`)])) as [any, any];
            return { groups: t.signage(doc.rows, siteId), choice: choiceOf(tosha.data), updated_at: tosha.updated_at, updated_by: tosha.updated_by } as DayState;
        },
        refetchInterval: 60_000,
    });
    useEffect(() => { if (q.data && !timer.current) setState(q.data); }, [q.data]);   // other desks' changes, unless this screen has an unsaved tap

    function persist(next: DayState) {
        setState(next);
        if (timer.current) clearTimeout(timer.current);
        timer.current = setTimeout(async () => {
            timer.current = null;
            try {
                const r: any = await guard(cloud.request('PUT', '/api/tosha', { site: siteId, day, data: next.choice }));
                setState(s => s && { ...s, updated_at: r.updated_at, updated_by: r.updated_by });
                setErr('');
            } catch (e: any) { setErr(e instanceof cloud.UserError ? e.message : 'Could not save the choices.'); }
        }, 500);
    }
    const setMadina = (k: string, v: any) => {
        if (!state) return;
        const m = { ...state.choice.madina, [k]: v } as any;
        if (v === true && k === 'biryani') m.burger = false;   // one or the other
        if (v === true && k === 'burger') m.biryani = false;
        persist({ ...state, choice: { ...state.choice, madina: m } });
    };
    // the + cell: buses +2, trains nothing, cars a tick box for their driver (+1)
    const plus = (b: any) => b.vehicle === 'car'
        ? <Label className="inline-flex items-center gap-1 text-xs font-bold"><Checkbox disabled={ro} checked={!!busChoice(state!.choice, b).driver} onCheckedChange={v => setBus(busKey(b), 'driver', v === true)} aria-label={`Driver of ${vno(b)}`} />+1</Label>
        : extraOf(b, state!.choice) ? `+${extraOf(b, state!.choice)}` : '';
    const setBus = (key: string, k: 'packet' | 'burger' | 'driver', v: boolean) => state && persist({ ...state, choice: { ...state.choice, buses: { ...state.choice.buses, [key]: { packet: true, burger: false, ...(state.choice.buses[key] || {}), [k]: v } } } });

    // the cards, in the site's order: the long trip first, then airports, then the rest (Makkah's Madina Airport and Taif only on days that have trips there)
    const cards = useMemo<CardItem[]>(() => {
        if (!state) return [];
        const ORDER: Record<string, number> = { long: 0, airport: 1, summary: 2 };
        return [...DESTS].sort((a, b) => ORDER[a.tosha] - ORDER[b.tosha]).flatMap((D): CardItem[] => {
            const g = state.groups.find((x: any) => x.dest.id === D.id);
            if (!g || (D.onlyWhenUsed && !g.buses.length)) return [];
            if (D.tosha === 'long') return [{ id: 'madina', D, kind: 'long' as const, g, r: madinaModel(t, day, g, state.choice, LONG) }];
            if (D.tosha === 'airport') return [{ id: D.id, D, kind: 'airport' as const, g, r: airportModel(t, day, g, D, state.choice) }];
            return [{ id: D.id, D, kind: 'summary' as const, g, r: atraafModel(t, day, g, D) }];
        });
    }, [state, day]);   // eslint-disable-line react-hooks/exhaustive-deps
    const any = state?.groups.some((g: any) => g.buses.length);

    const say = (id: string, text: string) => { setNote(n => ({ ...n, [id]: text })); setTimeout(() => setNote(n => n[id] === text ? { ...n, [id]: '' } : n), 6000); };
    async function output(id: string, canvas: HTMLCanvasElement, name: string, title: string, share: boolean) {
        if (busy) return;
        setBusy(true);
        try {
            if (share) { await navigator.share({ files: [new File([blobNow(canvas)], name, { type: 'image/png' })], title }); return; }
            await navigator.clipboard.write([new ClipboardItem({ 'image/png': blobOf(canvas) as Promise<Blob> })]);
            say(id, 'Copied — paste it in the Mawaid WhatsApp group.');
        } catch (e: any) {
            if (e?.name === 'AbortError') return;     // the share sheet was closed
            if (share) { say(id, 'Sharing did not open here — use Copy image instead.'); return; }
            // no picture clipboard in this browser: one download instead
            const a = document.createElement('a'); a.href = canvas.toDataURL('image/png'); a.download = name; a.click();
            say(id, 'This browser cannot copy pictures — the image was downloaded instead.');
        } finally { setBusy(false); }
    }
    const one = (c: CardItem, share: boolean) => void output(c.id, drawImage(c.r.model as Model), `tosha-${c.id}-${day}.png`, c.r.model.title, share);
    const all = (share: boolean) => { const models = cards.map(c => c.r.model as Model).filter(m => m.rows.length); if (models.length) void output('all', drawAll(models, `TOSHA SUMMARY · ${t.sheetDate(day)}`), `tosha-${day}.png`, 'Tosha summary', share); };

    if (q.isError) return <section className="grid gap-3"><h2 className="text-xl font-bold text-primary">{label}</h2><p className="text-destructive">Could not load the transport lists.</p></section>;
    if (!state) return <section className="grid gap-3"><h2 className="text-xl font-bold text-primary">{label}</h2><p className="text-muted-foreground">Loading…</p></section>;
    const ro = !writable;
    return (
        <section className="grid gap-3">
            <h2 className="text-xl font-bold text-primary">{label} <small className="text-sm font-normal text-muted-foreground">{t.longDate(day)}{state.updated_at ? ` · choices saved ${new Date(state.updated_at).toLocaleString()}${state.updated_by ? ' by ' + state.updated_by : ''}` : ''}</small></h2>
            {err && <p role="alert" className="text-sm font-semibold text-destructive">{err}</p>}
            {!any ? <p className="rounded-lg border bg-card p-4 text-muted-foreground">No transport list saved for {t.longDate(day)} yet.</p> : <>
                <div className="flex flex-wrap items-center gap-2">
                    <Button disabled={busy} onClick={() => all(false)}><ClipboardCopy className="size-4" />Copy all {cards.length} in one image</Button>
                    {canShare && <Button variant="outline" disabled={busy} onClick={() => all(true)}><Share2 className="size-4" />Share all {cards.length}</Button>}
                    <span className="text-xs text-muted-foreground">{note.all}</span>
                </div>
                <div className="grid items-start gap-3 xl:grid-cols-2">
                    {cards.map(c => {
                        const m = c.r.model;
                        return (
                            <Card key={c.id} className="min-w-0 gap-0 overflow-hidden py-0">
                                <div className="bg-[#f1c232] px-4 py-3 text-lg font-black text-white">{c.D.icon} {c.D.label}<small className="ml-3 text-sm font-bold">{c.kind === 'long' ? `${fleet((c.r as any).buses)} · ${(c.r as any).total} to prepare` : c.kind === 'airport' ? `${fleet((c.r as any).buses)} · ${(c.r as any).total} pax with staff` : `${fleet((c.r as any).buses)} · ${c.g.pax} pax`}</small></div>
                                <CardContent className="grid gap-3 p-4">
                                    {c.kind === 'long' && (() => {
                                        const r = c.r as ReturnType<typeof madinaModel>, mc = state.choice.madina;
                                        return <>
                                            <Big n={r.total} text={`${r.pax} pax + ${r.extra} for drivers and helpers`} />
                                            <div className="flex flex-wrap items-center gap-3">
                                                <Label className="gap-2">Preparation <Input type="time" className="w-28" disabled={ro} value={mc.time || DEF_MADINA.time} onChange={e => setMadina('time', e.target.value || '06:30')} /></Label>
                                                {(['biryani', 'burger', 'packet'] as const).map(k => <Label key={k} className="gap-2"><Checkbox disabled={ro} checked={!!mc[k]} onCheckedChange={v => setMadina(k, v === true)} />{k === 'packet' ? 'Tosha packet' : k === 'biryani' ? 'Biryani' : 'Burger'}</Label>)}
                                            </div>
                                            {r.buses.length ? <div className="overflow-x-auto"><Table>
                                                <TableHeader><TableRow><TableHead>Bus</TableHead><TableHead>Time</TableHead><TableHead>From</TableHead><TableHead>Groups</TableHead><TableHead className="text-right">Pax</TableHead><TableHead className="text-right">+</TableHead><TableHead className="text-right">Total</TableHead></TableRow></TableHeader>
                                                <TableBody>{r.buses.map((b: any) => <TableRow key={busKey(b)}><TableCell>{vlabel(b)}</TableCell><TableCell>{t.time12(b.at)}</TableCell><TableCell>{b.building || '—'}</TableCell><TableCell><GroupsCell b={b} /></TableCell><TableCell className="text-right">{b.pax}</TableCell><TableCell className="text-right">{plus(b)}</TableCell><TableCell className="text-right font-bold">{b.pax + extraOf(b, state.choice)}</TableCell></TableRow>)}</TableBody>
                                                <TableFooter><TableRow><TableCell colSpan={4}>{plural(c.g.groups, 'group')}</TableCell><TableCell className="text-right">{r.pax}</TableCell><TableCell className="text-right">+{r.extra}</TableCell><TableCell className="text-right">{r.total}</TableCell></TableRow></TableFooter></Table></div>
                                                : <p className="text-muted-foreground">No {c.D.title} buses.</p>}
                                        </>;
                                    })()}
                                    {c.kind === 'airport' && (() => {
                                        const r = c.r as ReturnType<typeof airportModel>;
                                        return <>
                                            <Big n={r.total} text={`${r.pax} pax + ${r.extra} for the buses · ${r.slots.size} departure time${r.slots.size === 1 ? '' : 's'}`} />
                                            {r.buses.length ? <div className="overflow-x-auto"><Table>
                                                <TableHeader><TableRow><TableHead>Bus</TableHead><TableHead>From</TableHead><TableHead>Groups</TableHead><TableHead className="text-right">Pax</TableHead><TableHead className="text-right">+</TableHead><TableHead className="text-right">Total</TableHead><TableHead className="text-center">Tosha packet</TableHead><TableHead className="text-center">Burger</TableHead></TableRow></TableHeader>
                                                <TableBody>{[...r.slots].flatMap(([hm, list]) => {
                                                    const sp = list.reduce((s, b) => s + b.pax, 0), se = list.reduce((s, b) => s + extraOf(b, state.choice), 0);
                                                    return [
                                                        <TableRow key={`s-${hm}`} className="bg-accent font-bold"><TableCell colSpan={3}>{t.time12(`2000-01-01T${hm}`)} · {fleet(list)}</TableCell><TableCell className="text-right">{sp}</TableCell><TableCell className="text-right">{se ? `+${se}` : ''}</TableCell><TableCell className="text-right">{sp + se}</TableCell><TableCell /><TableCell /></TableRow>,
                                                        ...list.map(b => { const ch = busChoice(state.choice, b), k = busKey(b); return (
                                                            <TableRow key={k}><TableCell>{vlabel(b)}</TableCell><TableCell>{b.building || '—'}</TableCell><TableCell><GroupsCell b={b} /></TableCell><TableCell className="text-right">{b.pax}</TableCell><TableCell className="text-right">{plus(b)}</TableCell><TableCell className="text-right font-bold">{b.pax + extraOf(b, state.choice)}</TableCell>
                                                                <TableCell className="text-center"><Checkbox disabled={ro} checked={!!ch.packet} onCheckedChange={v => setBus(k, 'packet', v === true)} aria-label={`Tosha packet for ${vno(b)}`} /></TableCell>
                                                                <TableCell className="text-center"><Checkbox disabled={ro} checked={!!ch.burger} onCheckedChange={v => setBus(k, 'burger', v === true)} aria-label={`Burger for ${vno(b)}`} /></TableCell></TableRow>); }),
                                                    ];
                                                })}</TableBody>
                                                <TableFooter><TableRow><TableCell colSpan={3}>{plural(c.g.groups, 'group')}</TableCell><TableCell className="text-right">{r.pax}</TableCell><TableCell className="text-right">+{r.extra}</TableCell><TableCell className="text-right">{r.total}</TableCell><TableCell className="text-center">{r.packets}</TableCell><TableCell className="text-center">{r.burgers}</TableCell></TableRow></TableFooter></Table></div>
                                                : <p className="text-muted-foreground">No {c.D.title} buses.</p>}
                                        </>;
                                    })()}
                                    {c.kind === 'summary' && (() => {
                                        const r = c.r as ReturnType<typeof atraafModel>;
                                        return <>
                                            <Big n={c.g.pax} text={`pax · ${plural(c.g.groups, 'group')}`} />
                                            {r.buses.length ? <div className="overflow-x-auto"><Table>
                                                <TableHeader><TableRow><TableHead>Bus</TableHead><TableHead>Time</TableHead><TableHead>From</TableHead><TableHead>Groups</TableHead><TableHead className="text-right">Pax</TableHead></TableRow></TableHeader>
                                                <TableBody>{r.buses.map((b: any) => <TableRow key={busKey(b)}><TableCell>{vlabel(b)}</TableCell><TableCell>{t.time12(b.at)}</TableCell><TableCell>{b.building || '—'}</TableCell><TableCell><GroupsCell b={b} /></TableCell><TableCell className="text-right font-bold">{b.pax}</TableCell></TableRow>)}</TableBody>
                                                <TableFooter><TableRow><TableCell colSpan={4}>Total</TableCell><TableCell className="text-right">{c.g.pax}</TableCell></TableRow></TableFooter></Table></div>
                                                : <p className="text-muted-foreground">No {c.D.title} buses.</p>}
                                        </>;
                                    })()}
                                    {m.chips.length > 0 && <Chips list={m.chips} />}
                                    <div className="flex flex-wrap items-center gap-2">
                                        <Button disabled={busy} onClick={() => one(c, false)}><ClipboardCopy className="size-4" />Copy image</Button>
                                        {canShare && <Button variant="outline" disabled={busy} onClick={() => one(c, true)}><Share2 className="size-4" />Share</Button>}
                                        <span className={cn('text-xs text-muted-foreground')}>{note[c.id]}</span>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </>}
        </section>
    );
}

export default function ToshaPage() {
    const { cloud, transport: t } = useCore();
    const { siteId } = useSite();
    const { href } = useNav();
    const writable = cloud.canWrite(siteId);
    return (
        <div className="mx-auto grid grid-cols-[minmax(0,1fr)] max-w-[2400px] min-w-0 gap-4 px-3 pb-10 pt-4 sm:px-4">
            <header className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                    <h1 className="text-2xl font-bold text-primary">Tosha summary</h1>
                    <p className="text-sm text-muted-foreground">Travel refreshments for the buses from the Transport day lists — tomorrow on top, today below. Madina and Jeddah Airport count each bus's pax + 2 (driver and helper); a car adds +1 when its driver box is ticked; a train adds nothing. “Copy image” puts the card on the clipboard to paste in the Mawaid WhatsApp group.</p>
                </div>
                <div className="flex flex-wrap gap-2"><Button variant="outline" asChild><a href={href('transport-print')}>🖨️ Bus sheets</a></Button><Button variant="outline" asChild><a href={href('transport')}>🚌 Transport day</a></Button></div>
            </header>
            <DayBlock label="Tomorrow" day={t.addDays(t.today(), 1)} writable={writable} />
            <div className="border-t-2 border-dashed" />
            <DayBlock label="Today" day={t.today()} writable={writable} />
        </div>
    );
}
