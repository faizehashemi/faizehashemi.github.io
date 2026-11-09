import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { useConfirm } from '@/components/ConfirmDialog';
import { useCore, useGuard, useLoadCore, useSite } from '@/pms/PmsContext';
import { Chk, Num, Sel, Txt } from './inspector';

// Signage Builder → Screen 1 / Screen 2: the notice screens /<site>/signage1 and /signage2, TVs hung on their side beside the transport board.
// A list of slides — the Important Notice poster (edited here: sections of text, a table, a picture such as a QR code), pictures, videos, PDF and PowerPoint
// pages — each shown for its seconds (a video plays to its end), each with its own schedule. Drawing and schedules: core/screen.js (shared with the screen);
// files: core/screen-media.js (PowerPoint and PDF become pictures here, before they go up).

type Row = Record<string, any>;
const clone = <T,>(o: T): T => JSON.parse(JSON.stringify(o));
const KIND: Record<string, string> = { notice: '📋 Notice', image: '🖼️ Picture', video: '🎬 Video', pages: '📑 Pages' };
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const TURN: [string, string][] = [['90', 'TV turned anticlockwise (top edge on the left)'], ['-90', 'TV turned clockwise (top edge on the right)'], ['0', 'TV set to portrait itself'], ['180', 'Upside down']];

export function ScreensPanel({ n }: { n: number }) {
    const { cloud } = useCore();
    const loadCore = useLoadCore();
    const guard = useGuard();
    const { siteId } = useSite();
    const { ask: confirmAsk, dialog: confirmDialog } = useConfirm();
    const writable = cloud.canWrite(siteId), dis = !writable;
    const [L, setL] = useState<{ S: any; M: any } | null>(null);
    const [cfg, setCfg] = useState<Row | null>(null);
    const [version, setVersion] = useState(0);
    const [saved, setSaved] = useState('');
    const [sel, setSel] = useState(0);
    const [busy, setBusy] = useState('');
    const [msg, setMsg] = useState<{ t: string; bad?: boolean }>({ t: '' });
    const [secOpen, setSecOpen] = useState<number | null>(0);
    const uploaded = useRef(new Set<string>());   // files sent up while editing: those no slide keeps are deleted after a save
    const dirty = !!cfg && JSON.stringify(cfg) !== saved;

    useEffect(() => { void Promise.all([loadCore('screen'), loadCore('screen-media')]).then(([S, M]) => setL({ S, M })); }, []);   // eslint-disable-line react-hooks/exhaustive-deps
    async function reload() {
        if (!L) return;
        try {
            const r = await guard<Row>(L.M.loadScreen(siteId, n));
            const c = r.config || L.S.defaultScreen(n);
            setCfg(c); setSaved(JSON.stringify(c)); setVersion(r.version || 0); setSel(0);
            setMsg({ t: r.config ? `Saved ${r.updated_at ? new Date(r.updated_at).toLocaleString() : ''}${r.updated_by ? ` by ${r.updated_by}` : ''}` : 'Not saved yet: the screen shows this default content.' });
        } catch (e: any) { setMsg({ t: 'Could not load: ' + (e.message || e), bad: true }); }
    }
    useEffect(() => { void reload(); }, [L, n, siteId]);   // eslint-disable-line react-hooks/exhaustive-deps

    if (!L || !cfg) return <Card className="p-4 text-sm text-muted-foreground">Loading screen {n}…</Card>;
    const { S, M } = L;
    const url = (id: string) => String(id).startsWith('asset:') ? new URL('assets/' + String(id).slice(6), location.href).href : S.mediaUrl(cloud.apiBase(), id);
    const slides: Row[] = cfg.slides;
    const cur: Row | undefined = slides[sel];
    const set = (f: (c: Row) => void) => setCfg(c => { const d = clone(c!); f(d); return d; });
    const setSlide = (k: string, v: unknown) => set(c => { c.slides[sel][k] = v; });
    const setSched = (k: string, v: unknown) => set(c => { c.slides[sel].sched = { ...(c.slides[sel].sched || {}), [k]: v }; });
    const setNotice = (k: string, v: unknown) => set(c => { c.slides[sel].notice[k] = v; });
    const setSec = (i: number, k: string, v: unknown) => set(c => { c.slides[sel].notice.sections[i][k] = v; });
    const move = (i: number, d: number) => { const j = i + d; if (j < 0 || j >= slides.length) return; set(c => { const [x] = c.slides.splice(i, 1); c.slides.splice(j, 0, x); }); setSel(j); };

    async function save() {
        setBusy('Saving…');
        try {
            const r = await guard<Row>(M.saveScreen(siteId, n, cfg, version));
            setCfg(r.config); setSaved(JSON.stringify(r.config)); setVersion(r.version);
            setMsg({ t: `Saved — the screen changes within a minute.` });
            const keep = JSON.stringify(r.config);
            for (const id of [...uploaded.current]) if (!keep.includes(`"${id}"`)) { uploaded.current.delete(id); void cloud.request('DELETE', `/api/signage/media/${id}`).catch(() => { }); }
        } catch (e: any) { setMsg({ t: (e instanceof cloud.UserError ? e.message : 'Could not save: ' + (e.message || e)), bad: true }); }
        finally { setBusy(''); }
    }
    async function upload(blobs: Blob[], name: string) {
        const ids: string[] = [];
        for (let i = 0; i < blobs.length; i++) ids.push(await M.uploadMedia(siteId, blobs[i], name, (f: number) => setBusy(`Uploading ${name}${blobs.length > 1 ? ` — ${i + 1} of ${blobs.length}` : ''} · ${Math.round(f * 100)}%`)));
        ids.forEach(id => uploaded.current.add(id));
        return ids;
    }
    async function addFile(file?: File | null) {
        if (!file) return;
        const kind = M.kindOf(file), name = file.name.replace(/\.[^.]+$/, '');
        if (!kind) { setMsg({ t: 'Pictures, videos (MP4, WebM), PDF and PowerPoint (.pptx) files only.', bad: true }); return; }
        if (kind === 'ppt') { setMsg({ t: 'An old PowerPoint (.ppt): open it in PowerPoint and save it as .pptx (or as PDF), then add that file.', bad: true }); return; }
        try {
            let slide: Row;
            if (kind === 'image') slide = { kind: 'image', media: await upload([await M.prepImage(file)], name), seconds: 15 };
            else if (kind === 'video') slide = { kind: 'video', media: await upload([file], name), seconds: 0 };
            else {
                const pages: Blob[] = kind === 'pdf'
                    ? await M.pdfToImages(file, (d: number, t: number) => setBusy(`Reading the PDF — page ${d} of ${t}`))
                    : await M.pptxToImages(file, (d: number, t: number) => setBusy(`Drawing the PowerPoint — slide ${d} of ${t}`));
                slide = { kind: 'pages', media: await upload(pages, name), seconds: 12 };
            }
            set(c => { c.slides.push({ id: S.newId(), name, on: true, fit: 'contain', bg: '#000000', sched: { on: false }, ...slide }); });
            setSel(slides.length);
            setMsg({ t: `Added "${name}"${kind === 'pptx' ? ' — check the pages in the preview: a slide with unusual effects can differ a little (a PDF saved from PowerPoint is exact)' : ''}. Save to send it to the screen.` });
        } catch (e: any) { setMsg({ t: (e instanceof cloud.UserError ? e.message : 'Could not add the file: ' + (e.message || e)), bad: true }); }
        finally { setBusy(''); }
    }
    async function pickInto(accept: string, then: (id: string) => void) {
        const inp = document.createElement('input'); inp.type = 'file'; inp.accept = accept;
        inp.onchange = async () => {
            const f = inp.files?.[0]; if (!f) return;
            try { const k = M.kindOf(f); const [id] = await upload([k === 'image' ? await M.prepImage(f) : f], f.name); then(id); }
            catch (e: any) { setMsg({ t: 'Could not upload: ' + (e.message || e), bad: true }); }
            finally { setBusy(''); }
        };
        inp.click();
    }
    async function remove(i: number) {
        if (!(await confirmAsk({ title: `Remove "${slides[i].name}"?`, body: 'It leaves this screen when you save.', confirmLabel: 'Remove' }))) return;
        set(c => { c.slides.splice(i, 1); }); setSel(Math.max(0, Math.min(sel, slides.length - 2)));
    }

    const sc = cur?.sched || {};
    return (
        <>
            <Card className="flex-row flex-wrap items-end gap-3 p-3">
                <div className="grid gap-1"><Label htmlFor="scTurn">Turn the picture</Label>
                    <select id="scTurn" className="h-9 rounded-md border bg-background px-2 text-sm" disabled={dis} value={String(cfg.rotate ?? 90)} onChange={e => set(c => { c.rotate = Number(e.target.value); })}>{TURN.map(([v, t]) => <option key={v} value={v}>{t}</option>)}</select></div>
                <div className="grid gap-1"><Label htmlFor="scFade">Transition (s)</Label><Input id="scFade" className="h-9 w-20" type="number" min={0} max={3} step={0.1} disabled={dis} value={cfg.fade ?? 0.6} onChange={e => set(c => { c.fade = Number(e.target.value); })} /></div>
                <div className="flex flex-wrap items-center gap-2">
                    {writable && <Button disabled={!dirty || !!busy} onClick={() => void save()}>Save screen {n}</Button>}
                    {dirty && <Button variant="outline" disabled={!!busy} onClick={() => void reload()}>Discard changes</Button>}
                    <Button asChild variant="outline"><a href={`${siteId}/signage${n}`} target="_blank" rel="noopener">📺 Open screen {n} ↗</a></Button>
                </div>
                <span className={cn('text-sm', msg.bad ? 'text-destructive' : 'text-muted-foreground')} role="status">{busy || msg.t}</span>
            </Card>

            <div className="grid gap-3 lg:grid-cols-[minmax(0,20rem)_auto_minmax(0,1fr)]">
                <Card className="grid content-start gap-2 p-3">
                    <h2 className="font-bold">Slides of screen {n}</h2>
                    <p className="text-xs text-muted-foreground">Played top to bottom. A slide with a schedule shows only in its hours (Saudi time).</p>
                    {slides.map((s, i) => (
                        <div key={s.id} className={cn('grid cursor-pointer grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 rounded-lg border p-2', i === sel && 'border-gold bg-accent/50', s.on === false && 'opacity-55')} onClick={() => setSel(i)}>
                            <input type="checkbox" aria-label={`Show ${s.name}`} title="Shown on the screen" disabled={dis} checked={s.on !== false} onClick={e => e.stopPropagation()} onChange={e => set(c => { c.slides[i].on = e.target.checked; })} />
                            <div className="min-w-0"><b className="block truncate text-sm">{s.name}</b><span className="text-xs text-muted-foreground">{KIND[s.kind]}{s.kind === 'pages' ? ` · ${s.media.length}` : ''} · {s.kind === 'video' ? 'to its end' : `${s.seconds}s${s.kind === 'pages' ? ' each' : ''}`} · {S.schedLabel(s.sched)}</span></div>
                            <span className="flex">
                                <Button variant="ghost" size="icon" className="size-7" aria-label="Up" disabled={dis || i === 0} onClick={e => { e.stopPropagation(); move(i, -1); }}><ChevronUp className="size-4" /></Button>
                                <Button variant="ghost" size="icon" className="size-7" aria-label="Down" disabled={dis || i === slides.length - 1} onClick={e => { e.stopPropagation(); move(i, 1); }}><ChevronDown className="size-4" /></Button>
                                <Button variant="ghost" size="icon" className="size-7 text-destructive" aria-label={`Remove ${s.name}`} disabled={dis} onClick={e => { e.stopPropagation(); void remove(i); }}><Trash2 className="size-4" /></Button>
                            </span>
                        </div>
                    ))}
                    {!slides.length && <p className="text-sm text-muted-foreground">No slides: the screen stays black.</p>}
                    {writable && <div className="grid gap-2 pt-1">
                        <label className={cn('inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-md border bg-background px-3 py-2 text-sm font-semibold hover:border-gold', busy && 'pointer-events-none opacity-50')}>＋ Add picture, video, PDF or PowerPoint
                            <input type="file" className="sr-only" accept="image/*,video/mp4,video/webm,.mp4,.webm,application/pdf,.pdf,.pptx,.ppt" onChange={e => { const f = e.target.files?.[0]; e.target.value = ''; void addFile(f); }} /></label>
                        <Button variant="outline" disabled={!!busy} onClick={() => { set(c => { c.slides.push({ ...clone(S.defaultScreen(n).slides[0]), id: S.newId(), name: 'Notice' }); }); setSel(slides.length); }}>＋ Notice poster</Button>
                    </div>}
                </Card>

                <Card className="grid content-start justify-items-center gap-2 p-3">
                    <h2 className="justify-self-start font-bold">Preview</h2>
                    {cur ? <Preview slide={cur} S={S} url={url} /> : <p className="text-sm text-muted-foreground">Add a slide.</p>}
                    {cur?.kind === 'pages' && <p className="text-xs text-muted-foreground">{cur.media.length} pages — the first is shown; the screen shows each in turn.</p>}
                </Card>

                {cur && <Card className="grid content-start gap-2 p-3 lg:max-h-[calc(100vh-140px)] lg:overflow-auto">
                    <h2 className="font-bold">{KIND[cur.kind]}</h2>
                    <label className="grid gap-1 text-xs font-semibold">Name<Input className="h-8" disabled={dis} value={cur.name} onChange={e => setSlide('name', e.target.value)} /></label>
                    {cur.kind !== 'video' && <Num label={cur.kind === 'pages' ? 'Seconds a page' : 'Seconds'} min={3} max={600} disabled={dis} value={cur.seconds} onChange={v => setSlide('seconds', Math.max(3, Number(v) || 10))} />}
                    {cur.kind !== 'notice' && <><Sel label="Fit" disabled={dis} value={cur.fit} list={[['contain', 'Whole picture (bars around)'], ['cover', 'Fill the screen (edges cut)']]} onChange={v => setSlide('fit', v)} />
                        <Num label="Bars colour" as="color" disabled={dis} value={cur.bg} onChange={v => setSlide('bg', v)} /></>}

                    <div className="mt-1 grid gap-2 rounded-lg border p-2">
                        <Chk label="Show only at certain times" disabled={dis} value={sc.on} onChange={v => setSched('on', v)} />
                        {sc.on && <>
                            <div className="flex flex-wrap gap-1">{DAYS.map((d, i) => { const on = !sc.days?.length || sc.days.includes(i); return <button key={d} type="button" disabled={dis} className={cn('rounded border px-2 py-0.5 text-xs', on ? 'border-gold bg-accent font-bold' : 'text-muted-foreground')} onClick={() => { const all = sc.days?.length ? sc.days : [0, 1, 2, 3, 4, 5, 6]; setSched('days', on ? all.filter((x: number) => x !== i) : [...all, i].sort()); }}>{d}</button>; })}</div>
                            <div className="grid grid-cols-2 gap-2">
                                <label className="grid gap-1 text-xs font-semibold">From<Input type="time" className="h-8" disabled={dis} value={sc.from || '00:00'} onChange={e => setSched('from', e.target.value)} /></label>
                                <label className="grid gap-1 text-xs font-semibold">To<Input type="time" className="h-8" disabled={dis} value={sc.to || '23:59'} onChange={e => setSched('to', e.target.value)} /></label>
                                <label className="grid gap-1 text-xs font-semibold">First date<Input type="date" className="h-8" disabled={dis} value={sc.dateFrom || ''} onChange={e => setSched('dateFrom', e.target.value)} /></label>
                                <label className="grid gap-1 text-xs font-semibold">Last date<Input type="date" className="h-8" disabled={dis} value={sc.dateTo || ''} onChange={e => setSched('dateTo', e.target.value)} /></label>
                            </div>
                            <Chk label="Only this while it is on (the other slides pause)" disabled={dis} value={sc.only} onChange={v => setSched('only', v)} />
                            <p className="text-xs text-muted-foreground">Saudi time. From 22:00 to 02:00 runs past midnight. {S.schedLabel(sc)}</p>
                        </>}
                    </div>

                    {cur.kind === 'notice' && <NoticeEditor nt={cur.notice} dis={dis} busy={!!busy} open={secOpen} setOpen={setSecOpen} setNotice={setNotice} setSec={setSec} S={S}
                        set={f => set(c => f(c.slides[sel].notice))} pick={(k, accept) => pickInto(accept, id => setNotice(k, id))} pickSec={i => pickInto('image/*', id => setSec(i, 'image', id))} />}
                </Card>}
            </div>
            {confirmDialog}
        </>
    );
}

function NoticeEditor({ nt, dis, busy, open, setOpen, setNotice, setSec, set, pick, pickSec, S }: {
    nt: Row; dis: boolean; busy: boolean; open: number | null; setOpen: (i: number | null) => void; setNotice: (k: string, v: unknown) => void; setSec: (i: number, k: string, v: unknown) => void;
    set: (f: (n: Row) => void) => void; pick: (k: string, accept: string) => void; pickSec: (i: number) => void; S: any;
}) {
    const secs: Row[] = nt.sections || [];
    return (
        <div className="grid gap-2">
            <label className="grid gap-1 text-xs font-semibold">Side title<Input className="h-8" disabled={dis} value={nt.title} onChange={e => setNotice('title', e.target.value)} /></label>
            <Sel label="Side strip" disabled={dis} value={nt.side} list={[['left', 'On the left'], ['right', 'On the right']]} onChange={v => setNotice('side', v)} />
            <Num label="Strip colour" as="color" disabled={dis} value={nt.strip} onChange={v => setNotice('strip', v)} />
            <Num label="Text colour" as="color" disabled={dis} value={nt.color} onChange={v => setNotice('color', v)} />
            <div className="flex flex-wrap items-center gap-2 text-xs"><b>Background:</b>
                <span className="text-muted-foreground">{nt.bgVideo ? (String(nt.bgVideo).startsWith('asset:') ? 'bubbles video' : 'own video') : nt.bgImage ? 'picture' : 'colour'}</span>
                <Button size="sm" variant="outline" className="h-7" disabled={dis || busy} onClick={() => pick('bgImage', 'image/*')}>Picture…</Button>
                <Button size="sm" variant="outline" className="h-7" disabled={dis || busy} onClick={() => pick('bgVideo', 'video/mp4,video/webm')}>Video…</Button>
                <Button size="sm" variant="outline" className="h-7" disabled={dis} onClick={() => set(n => { n.bgVideo = 'asset:signage/notice-bg.mp4'; n.bgImage = 'asset:signage/notice-bg.jpg'; })}>Bubbles</Button>
                <Button size="sm" variant="outline" className="h-7" disabled={dis} onClick={() => set(n => { n.bgVideo = ''; n.bgImage = ''; })}>Colour only</Button>
            </div>
            {!nt.bgVideo && !nt.bgImage && <Num label="Colour" as="color" disabled={dis} value={nt.bg || '#dcebfb'} onChange={v => setNotice('bg', v)} />}
            <p className="text-xs text-muted-foreground">In the text: **bold**, !!red!!, __underline__. Table: one row a line, cells split by |; a line starting with # is a heading row; ^ joins a cell with the one above.</p>
            {secs.map((s, i) => (
                <div key={i} className="grid gap-1.5 rounded-lg border p-2">
                    <div className="flex items-center gap-1">
                        <button type="button" className="min-w-0 flex-1 truncate text-left text-sm font-bold" onClick={() => setOpen(open === i ? null : i)}>{open === i ? '▾' : '▸'} {s.icon} {s.title}</button>
                        <Button variant="ghost" size="icon" className="size-7" aria-label="Section up" disabled={dis || i === 0} onClick={() => set(n => { const [x] = n.sections.splice(i, 1); n.sections.splice(i - 1, 0, x); })}><ChevronUp className="size-4" /></Button>
                        <Button variant="ghost" size="icon" className="size-7" aria-label="Section down" disabled={dis || i === secs.length - 1} onClick={() => set(n => { const [x] = n.sections.splice(i, 1); n.sections.splice(i + 1, 0, x); })}><ChevronDown className="size-4" /></Button>
                        <Button variant="ghost" size="icon" className="size-7 text-destructive" aria-label="Remove section" disabled={dis} onClick={() => set(n => { n.sections.splice(i, 1); })}><Trash2 className="size-4" /></Button>
                    </div>
                    {open === i && <>
                        <div className="grid grid-cols-[3.5rem_minmax(0,1fr)] gap-1.5"><Input className="h-8 text-center" aria-label="Icon" disabled={dis} value={s.icon} onChange={e => setSec(i, 'icon', e.target.value)} /><Input className="h-8" aria-label="Heading" disabled={dis} value={s.title} onChange={e => setSec(i, 'title', e.target.value)} /></div>
                        <Num label="Band colour" as="color" disabled={dis} value={s.band} onChange={v => setSec(i, 'band', v)} />
                        <Txt label="Text" disabled={dis} value={s.text} onChange={v => setSec(i, 'text', v)} />
                        <Sel label="Text align" disabled={dis} value={s.align} list={[['left', 'Left'], ['center', 'Centre']]} onChange={v => setSec(i, 'align', v)} />
                        <Txt label="Table (optional)" disabled={dis} value={s.table} onChange={v => setSec(i, 'table', v)} />
                        <Txt label="Line under the table (optional)" disabled={dis} value={s.note} onChange={v => setSec(i, 'note', v)} />
                        <div className="flex items-center gap-2 text-xs"><b>Picture (QR code…):</b>{s.image ? <span className="text-muted-foreground">set</span> : <span className="text-muted-foreground">none</span>}
                            <Button size="sm" variant="outline" className="h-7" disabled={dis || busy} onClick={() => pickSec(i)}>{s.image ? 'Change…' : 'Add…'}</Button>
                            {s.image && <Button size="sm" variant="ghost" className="h-7 text-destructive" disabled={dis} onClick={() => setSec(i, 'image', '')}>Remove</Button>}</div>
                    </>}
                </div>
            ))}
            {!dis && <Button variant="outline" size="sm" onClick={() => { set(n => { n.sections.push(S.blankSection()); }); setOpen(secs.length); }}>＋ Section</Button>}
        </div>
    );
}

/** The slide on a small upright copy of the screen (1080 × 1920 scaled down) */
function Preview({ slide, S, url }: { slide: Row; S: any; url: (id: string) => string }) {
    const W = 300, k = W / S.STAGE_W;
    const box = useRef<HTMLDivElement>(null);
    const html = slide.kind === 'notice' ? S.noticeHtml(slide.notice, url) : '';
    useLayoutEffect(() => { if (box.current && slide.kind === 'notice') S.fitNotice(box.current); }, [html]);   // eslint-disable-line react-hooks/exhaustive-deps
    const media = slide.media?.[0];
    return (
        <div className="relative overflow-hidden rounded-md border bg-black shadow" style={{ width: W, height: S.STAGE_H * k }}>
            {slide.kind === 'notice'
                ? <div ref={box} className="absolute left-0 top-0 origin-top-left" style={{ width: S.STAGE_W, height: S.STAGE_H, transform: `scale(${k})` }} dangerouslySetInnerHTML={{ __html: html }} />
                : <div className="absolute left-0 top-0 origin-top-left" style={{ width: S.STAGE_W, height: S.STAGE_H, transform: `scale(${k})`, background: slide.bg || '#000' }}>
                    {slide.kind === 'video' && media && <video key={media} src={url(media)} muted autoPlay loop playsInline className="absolute inset-0 size-full" style={{ objectFit: slide.fit === 'cover' ? 'cover' : 'contain' }} />}
                    {(slide.kind === 'image' || slide.kind === 'pages') && media && <img src={url(media)} alt="" className="absolute inset-0 size-full" style={{ objectFit: slide.fit === 'cover' ? 'cover' : 'contain' }} />}
                </div>}
            {slide.kind !== 'notice' && !media && <Badge className="absolute left-2 top-2">No file</Badge>}
        </div>
    );
}
