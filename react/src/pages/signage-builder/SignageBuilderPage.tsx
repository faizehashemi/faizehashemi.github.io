import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, ChevronUp, Redo2, Trash2, Undo2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { useConfirm } from '@/components/ConfirmDialog';
import { useCore, useGuard, useLoadCore, useNav, useSite } from '@/pms/PmsContext';
import { Chk, Col, Num, Sel, Txt, readImage } from './inspector';

// Signage Builder (Transport): design templates for the public board /<site>/signage on a 1920×1080 screen — drag elements from the palette (title, texts, date,
// clock, image, data table), move and resize them, pick and order the table's columns, set colours and a background image — save as templates in the cloud, and
// choose per trip type which template shows it and for how many seconds a slide. The drawing itself is shared with the board (core/signage.js renderTemplate);
// templates and slides live in the cloud (core/signage-api.js). The canvas is drawn by that shared code; everything around it is React.

type Row = Record<string, any>;
const GRID = 10;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const clone = <T,>(o: T): T => JSON.parse(JSON.stringify(o));
const ELEMENTS: [string, string, string?][] = [['title', '🅃 Title'], ['heading', '🏷️ Trip type heading'], ['text', '✏️ Text'], ['date', '📅 Date'], ['sdate', '📆 Short date'],
    ['rdate', '🗓️ Relative date', "The date(s) of the trips shown on the slide — not today's"], ['clock', '🕒 Clock'], ['image', '🖼️ Image'], ['table', '▦ Data table']];

export default function SignageBuilderPage() {
    const { cloud, transport } = useCore();
    const T = transport as any;
    const guard = useGuard();
    const loadCore = useLoadCore();
    const { siteId } = useSite();
    const { href } = useNav();
    const { ask: confirmAsk, dialog: confirmDialog } = useConfirm();
    const writable = cloud.canWrite(siteId);
    const [S, setS] = useState<any>(null);          // core/signage.js
    const [A, setA] = useState<any>(null);          // core/signage-api.js
    const [templates, setTemplates] = useState<Row[]>([]);
    const [cfg, setCfg] = useState<Row>({ slides: [], version: 0 });
    const [types, setTypes] = useState<Row[]>([]);
    const [cur, setCur] = useState<{ id: number | null; name: string; version: number; data: Row }>({ id: null, name: '', version: 0, data: { elements: [], bg: {} } });
    const [sel, setSel] = useState<string | null>(null);
    const [dirty, setDirty] = useState(false);
    const [status, setStatusRaw] = useState<{ t: string; bad: boolean }>({ t: '', bad: false });
    const [, bump] = useState(0);
    const [scale, setScale] = useState(1);
    const [drop, setDrop] = useState(false);
    const [prevDay, setPrevDay] = useState(T.today() as string), [prevType, setPrevType] = useState(''), [prevPage, setPrevPage] = useState(1);
    const [dayRows, setDayRows] = useState<Row[]>([]);
    const [order, setOrder] = useState<Row[]>([]);
    const [fade, setFade] = useState(0.3);
    const [slidesMsg, setSlidesMsg] = useState('');
    const undo = useRef<string[]>([]), redo = useRef<string[]>([]), lastKey = useRef(''), lastAt = useRef(0);
    const curRef = useRef(cur); curRef.current = cur;
    const selRef = useRef(sel); selRef.current = sel;
    const scaleRef = useRef(1); scaleRef.current = scale;
    const stageRef = useRef<HTMLDivElement>(null), canvasRef = useRef<HTMLDivElement>(null), dragCol = useRef<number | null>(null);
    const setStatus = (t: string, bad = false) => setStatusRaw({ t, bad });
    const snap = (v: number, free: boolean) => (free ? Math.round(v) : Math.round(v / GRID) * GRID);

    // ---- data ----
    useEffect(() => {
        void (async () => {
            const [s, a] = await Promise.all([loadCore('signage'), loadCore('signage-api')]);
            setS(s); setA(a);
            try {
                const [sg, ts] = await guard<any>(Promise.all([a.loadSignage(siteId), a.loadTripTypes(siteId)]));
                setCfg(sg.config); setTemplates(sg.templates); setTypes(ts); setFade(sg.config.fade ?? 0.3);
                openTemplate(sg.templates[0] ?? null, s);
                setOrder(slidesRows(sg.config, ts));
            } catch (e: any) { setStatus(e instanceof cloud.UserError ? e.message : 'Could not load the signage settings.', true); openTemplate(null, s); }
            if (!writable) setStatus('This login can look but not change the signage.');
        })();
    }, []);   // eslint-disable-line react-hooks/exhaustive-deps

    function slidesRows(c: Row, ts: Row[]) {
        const known = new Map(ts.map(t => [t.type, t]));
        const rows = (c.slides || []).map((s: Row) => ({ ...s, ...(known.get(s.type) ? { trips: known.get(s.type)!.trips, last: known.get(s.type)!.last } : { trips: 0, last: '' }) }));
        for (const t of ts) if (!rows.some((r: Row) => r.type === t.type)) rows.push({ type: t.type, template: 'none', seconds: 15, trips: t.trips, last: t.last });
        return rows;
    }
    function openTemplate(t: Row | null, mod = S, blank?: Row) {
        const base = t ? { id: t.id, name: t.name, version: t.version, data: clone(t.data) } : { id: null, name: '', version: 0, data: blank ?? mod.classicLook() };
        base.data.bg = { color: '#ffffff', image: '', fit: 'cover', ...(base.data.bg || {}) };
        base.data.elements = base.data.elements || [];
        undo.current = []; redo.current = []; lastKey.current = '';
        setCur(base); setSel(null); setDirty(false);
        setStatus(base.id ? `Template “${base.name}”${t?.updated_at ? ` · saved ${new Date(t.updated_at).toLocaleString()}${t.updated_by ? ' by ' + t.updated_by : ''}` : ''}` : 'New template — not saved yet.');
    }
    // change(fn, key): snapshot before the change (typing in one field within a second = one step)
    const change = useCallback((fn: (d: Row) => void, key = '') => {
        const t = Date.now();
        if (!key || key !== lastKey.current || t - lastAt.current > 1000) { undo.current.push(JSON.stringify(curRef.current.data)); if (undo.current.length > 80) undo.current.shift(); redo.current = []; }
        lastKey.current = key; lastAt.current = t;
        const data = clone(curRef.current.data); fn(data);
        setCur(c => ({ ...c, data })); setDirty(true); bump(n => n + 1);
    }, []);
    function step(from: string[], to: string[]) {
        if (!from.length) return;
        to.push(JSON.stringify(curRef.current.data));
        const data = JSON.parse(from.pop()!);
        setCur(c => ({ ...c, data })); lastKey.current = ''; setDirty(true);
        if (!data.elements.some((e: Row) => e.id === selRef.current)) setSel(null);
        bump(n => n + 1);
    }
    const selected = (): Row | undefined => cur.data.elements.find((e: Row) => e.id === sel);
    const e = selected();

    // ---- preview with real trips ----
    useEffect(() => { void (async () => { try { setDayRows(((await guard<any>(T.loadDay(siteId, prevDay))).rows) || []); } catch { setDayRows([]); } })(); }, [prevDay]);   // eslint-disable-line react-hooks/exhaustive-deps
    const tripsDay = useMemo(() => (S ? S.tripsOf({ rows: dayRows, days: [prevDay], from: `${prevDay}T00:00`, to: `${prevDay}T23:59` }) as Row[] : []), [S, dayRows, prevDay]);
    const typeCounts = useMemo(() => { const m = new Map<string, number>(); for (const t of tripsDay) m.set(t.type, (m.get(t.type) || 0) + 1); return [...m].sort(); }, [tripsDay]);
    const slides = useMemo(() => {
        if (!S || !prevType) return [] as Row[];
        const sl = S.buildSlides(tripsDay, [{ type: prevType, template: -1, seconds: 15 }], [{ id: -1, data: cur.data }]) as Row[];
        sl.forEach(s => { s.today = prevDay; });
        return sl;
    }, [S, prevType, tripsDay, cur.data, prevDay]);
    const preview = slides[clamp(prevPage, 1, Math.max(1, slides.length)) - 1] || null;

    // ---- canvas drawing: the board's own renderer ----
    useEffect(() => { if (S && stageRef.current) S.renderTemplate(stageRef.current, cur.data, preview); }, [S, cur.data, preview]);
    useEffect(() => {
        if (!S || !canvasRef.current) return;
        const fit = () => setScale(canvasRef.current!.clientWidth / S.STAGE_W || 1);
        const ro = new ResizeObserver(fit); ro.observe(canvasRef.current); fit();
        return () => ro.disconnect();
    }, [S]);

    // ---- move / resize with the pointer ----
    function onPointerDown(ev: React.PointerEvent) {
        const handle = (ev.target as HTMLElement).closest<HTMLElement>('.sb-sel i');
        const node = handle ? null : (ev.target as HTMLElement).closest<HTMLElement>('.sb-stage > [data-id]');
        if (!handle && !node) { setSel(null); return; }
        const id = node ? node.dataset.id! : selRef.current!;
        if (node && id !== selRef.current) setSel(id);
        const cl = curRef.current.data.elements.find((x: Row) => x.id === id);
        if (!cl || !writable) return;
        ev.preventDefault();
        canvasRef.current?.focus({ preventScroll: true });
        const start = { x: ev.clientX, y: ev.clientY, e: { ...cl } }, before = JSON.stringify(curRef.current.data), h = handle?.dataset.h;
        let moved = false;
        const work = clone(cl);
        const move = (m: PointerEvent) => {
            const dx = (m.clientX - start.x) / scaleRef.current, dy = (m.clientY - start.y) / scaleRef.current, free = m.shiftKey;
            if (!moved && Math.abs(dx) + Math.abs(dy) < 2) return;
            moved = true;
            const o = start.e;
            if (!h) { work.x = clamp(snap(o.x + dx, free), -o.w + 40, S.STAGE_W - 40); work.y = clamp(snap(o.y + dy, free), -o.h + 40, S.STAGE_H - 40); }
            else {
                let { x, y, w, h: hh } = o;
                if (h.includes('e')) w = snap(o.w + dx, free);
                if (h.includes('s')) hh = snap(o.h + dy, free);
                if (h.includes('w')) { x = snap(o.x + dx, free); w = o.w + (o.x - x); }
                if (h.includes('n')) { y = snap(o.y + dy, free); hh = o.h + (o.y - y); }
                if (w >= 30) { work.x = x; work.w = w; }
                if (hh >= 30) { work.y = y; work.h = hh; }
            }
            const n = stageRef.current?.querySelector<HTMLElement>(`[data-id="${CSS.escape(id)}"]`);
            if (n) Object.assign(n.style, { left: `${work.x}px`, top: `${work.y}px`, width: `${work.w}px`, height: `${work.h}px` });
            const ov = canvasRef.current?.querySelector<HTMLElement>('.sb-sel');
            if (ov) Object.assign(ov.style, { left: `${work.x * scaleRef.current}px`, top: `${work.y * scaleRef.current}px`, width: `${work.w * scaleRef.current}px`, height: `${work.h * scaleRef.current}px` });
        };
        const up = () => {
            removeEventListener('pointermove', move); removeEventListener('pointerup', up);
            if (!moved) return;
            undo.current.push(before); redo.current = []; lastKey.current = '';
            const data = clone(curRef.current.data); const t = data.elements.find((x: Row) => x.id === id); Object.assign(t, { x: work.x, y: work.y, w: work.w, h: work.h });
            setCur(c => ({ ...c, data })); setDirty(true);
        };
        addEventListener('pointermove', move); addEventListener('pointerup', up);
    }
    // keyboard: Delete, arrows, Ctrl+Z / Ctrl+Y / Ctrl+D, Esc
    useEffect(() => {
        const onKey = (ev: KeyboardEvent) => {
            const a = document.activeElement as HTMLElement | null;
            if (!a || !canvasRef.current?.contains(a)) return;
            if ((ev.ctrlKey || ev.metaKey) && ev.key.toLowerCase() === 'z') { ev.preventDefault(); if (ev.shiftKey) step(redo.current, undo.current); else step(undo.current, redo.current); return; }
            if ((ev.ctrlKey || ev.metaKey) && ev.key.toLowerCase() === 'y') { ev.preventDefault(); step(redo.current, undo.current); return; }
            const el = curRef.current.data.elements.find((x: Row) => x.id === selRef.current);
            if (!el || !writable) return;
            if (ev.key === 'Escape') { setSel(null); return; }
            if (ev.key === 'Delete' || ev.key === 'Backspace') { ev.preventDefault(); removeSel(); return; }
            if ((ev.ctrlKey || ev.metaKey) && ev.key.toLowerCase() === 'd') { ev.preventDefault(); duplicate(); return; }
            const d = ev.shiftKey ? 10 : 1;
            const mv = ({ ArrowLeft: [-d, 0], ArrowRight: [d, 0], ArrowUp: [0, -d], ArrowDown: [0, d] } as Record<string, number[]>)[ev.key];
            if (mv) { ev.preventDefault(); change(d2 => { const t = d2.elements.find((x: Row) => x.id === selRef.current); t.x += mv[0]; t.y += mv[1]; }, 'nudge'); }
        };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [change, writable]);   // eslint-disable-line react-hooks/exhaustive-deps
    function removeSel() { const id = selRef.current; change(d => { d.elements = d.elements.filter((x: Row) => x.id !== id); }); setSel(null); }
    function duplicate() {
        const el = curRef.current.data.elements.find((x: Row) => x.id === selRef.current); if (!el) return;
        const c = { ...clone(el), id: S.newElement('text').id, x: el.x + 30, y: el.y + 30 };
        change(d => { d.elements.push(c); }); setSel(c.id);
    }

    // ---- palette ----
    function add(kind: string, x?: number, y?: number) {
        if (!writable) return;
        const el = S.newElement(kind);
        const n = curRef.current.data.elements.length;
        el.x = clamp(snap(x == null ? 120 + (n % 6) * 40 : x - el.w / 2, false), 0, S.STAGE_W - Math.min(el.w, S.STAGE_W));
        el.y = clamp(snap(y == null ? 120 + (n % 6) * 40 : y - el.h / 2, false), 0, S.STAGE_H - Math.min(el.h, S.STAGE_H));
        change(d => { d.elements.push(el); }); setSel(el.id);
    }
    function addColumn(field: string, x?: number, y?: number) {
        if (!writable) return;
        const tables = curRef.current.data.elements.filter((t: Row) => t.type === 'table');
        const hit = x == null ? null : [...tables].reverse().find((t: Row) => x >= t.x && x <= t.x + t.w && y! >= t.y && y! <= t.y + t.h);
        const s0 = curRef.current.data.elements.find((t: Row) => t.id === selRef.current);
        const t = hit || (s0?.type === 'table' ? s0 : tables[0]);
        if (!t) { setStatus('Add a data table first, then drop columns on it.', true); return; }
        change(d => { d.elements.find((q: Row) => q.id === t.id).columns.push({ field, title: S.FIELDS[field][0], align: 'center' }); });
        setSel(t.id);
    }
    const dragStart = (v: string) => (ev: React.DragEvent) => { ev.dataTransfer.setData('text/plain', v); ev.dataTransfer.effectAllowed = 'copy'; };
    function onDrop(ev: React.DragEvent) {
        ev.preventDefault(); setDrop(false);
        const v = ev.dataTransfer.getData('text/plain') || '';
        const r = canvasRef.current!.getBoundingClientRect();
        const x = (ev.clientX - r.left) / scale, y = (ev.clientY - r.top) / scale;
        if (v.startsWith('add:')) add(v.slice(4), x, y); else if (v.startsWith('field:') && S.FIELDS[v.slice(6)]) addColumn(v.slice(6), x, y);
    }
    async function bgFile(file?: File) {
        if (!file) return;
        try { const src = await readImage(file, 1920); change(d => { d.bg.image = src; }); } catch { setStatus('Could not read that image.', true); }
    }

    // ---- templates ----
    const sizeKb = () => Math.round(JSON.stringify(cur.data).length / 1024);
    const slideUse = (id: number) => (cfg.slides || []).some((s: Row) => String(s.template) === String(id));
    const discardOk = async () => !dirty || (await confirmAsk({ title: 'Discard unsaved changes?', body: 'This template has unsaved changes.', confirmLabel: 'Discard' }));
    async function save(asCopy: boolean) {
        const name = cur.name.trim();
        if (!name) { setStatus('Give the template a name first.', true); return; }
        if (sizeKb() > 1700) { setStatus(`Too large (${sizeKb()} KB) — use smaller or fewer images.`, true); return; }
        try {
            const copyName = asCopy && templates.some(t => t.name === name) ? `${name} (copy)` : name;
            const t = cur.id && !asCopy ? await guard<any>(A.updateTemplate(cur.id, name, cur.data, cur.version)) : await guard<any>(A.createTemplate(siteId, copyName, cur.data));
            setTemplates(ts => [...ts.filter(x => x.id !== t.id), t].sort((a, b) => a.name.localeCompare(b.name)));
            openTemplate(t);
            setStatus(`Saved “${t.name}” (${Math.round(JSON.stringify(t.data).length / 1024)} KB). ${slideUse(t.id) ? 'The board shows it from its next slide.' : 'Choose below which trip types use it.'}`);
        } catch (er: any) { setStatus(er instanceof cloud.UserError ? er.message : 'Could not save.', true); }
    }
    async function del() {
        if (!cur.id) return;
        const u = (cfg.slides || []).filter((s: Row) => String(s.template) === String(cur.id)).map((s: Row) => S.travelTo(s.type));
        if (!(await confirmAsk({ title: `Delete the template “${cur.name}”?`, confirmLabel: 'Delete', body: u.length ? `It is shown for ${u.join(', ')} — those trip types will not be on the board until you choose another template.` : undefined }))) return;
        try { await guard(A.deleteTemplate(cur.id)); setTemplates(ts => ts.filter(t => t.id !== cur.id)); openTemplate(null); setStatus('Deleted.'); }
        catch (er: any) { setStatus(er.message || 'Could not delete.', true); }
    }
    async function saveSlides() {
        try {
            const r = await guard<any>(A.saveSignageConfig(siteId, { slides: order.map(({ type, template, seconds }) => ({ type, template, seconds })), fade }, cfg.version));
            setCfg(r.config); setTemplates(r.templates); setOrder(slidesRows(r.config, types)); setSlidesMsg('Saved — the board uses it from its next slide.');
        } catch (er: any) { setSlidesMsg(er instanceof cloud.UserError ? er.message : 'Could not save.'); }
    }

    if (!S || !A) return <div className="mx-auto max-w-[2400px] p-4 text-sm text-muted-foreground">Loading…</div>;
    const label = (x: Row) => (x.type === 'table' ? `Data table (${(x.columns || []).length} columns)` : x.type === 'image' ? 'Image' : `Text: ${String(x.text || '').slice(0, 24) || '(empty)'}`);
    const fonts = (S.FONTS as string[]).map(f => [f, f] as [string, string]);
    const set = (k: string, v: unknown, key = '') => change(d => { const t = d.elements.find((q: Row) => q.id === sel); if (t) t[k] = v; }, key || `${sel}.${k}`);
    const colSet = (i: number, k: string, v: unknown) => change(d => {
        const t = d.elements.find((q: Row) => q.id === sel), c = t.columns[i];
        if (k === 'field' && (c.title === S.FIELDS[c.field]?.[0] || !c.title)) c.title = S.FIELDS[v as string][0];
        c[k] = v;
    }, `${sel}.c${i}.${k}`);
    const tplLabel = (t: Row) => { const u = (cfg.slides || []).filter((s: Row) => String(s.template) === String(t.id)).map((s: Row) => S.travelTo(s.type)); return `${t.name}${u.length ? ` · shows ${u.join(', ')}` : ''}`; };
    const fadeLabel = (v: number) => (v ? `${v.toFixed(1)} s` : 'cut');
    const dis = !writable;

    return (
        <div className="mx-auto grid grid-cols-[minmax(0,1fr)] max-w-[2400px] min-w-0 gap-3 px-3 pb-10 pt-4 sm:px-4">
            <header className="flex flex-wrap items-start justify-between gap-3">
                <div><h1 className="text-2xl font-bold text-primary">Signage Builder</h1><p className="text-sm text-muted-foreground">Design the transport board: drag elements onto the screen, pick the table's columns, save it as a template — then choose below which template each trip type is shown with.</p></div>
                <div className="flex gap-2"><Button asChild variant="outline"><a href={href('transport')}>🚌 Transport day</a></Button><Button asChild><a href={`${siteId}/signage`} target="_blank" rel="noopener">📺 Open the board ↗</a></Button></div>
            </header>

            <Card className="flex-row flex-wrap items-end gap-3 p-3">
                <div className="grid gap-1"><Label>Template</Label>
                    <select aria-label="Template" className="h-9 min-w-48 rounded-md border bg-background px-2 text-sm" value={cur.id ?? ''} onChange={async ev => { const t = templates.find(x => String(x.id) === ev.target.value); if (t && await discardOk()) openTemplate(t); }}>
                        {!cur.id && <option value="">— new, not saved yet —</option>}{templates.map(t => <option key={t.id} value={t.id}>{tplLabel(t)}</option>)}</select></div>
                <div className="grid min-w-48 flex-1 gap-1"><Label htmlFor="sbName">Name</Label><Input id="sbName" maxLength={60} placeholder="e.g. Madina big screen" disabled={dis} value={cur.name} onChange={ev => { const v = ev.target.value; setCur(c => ({ ...c, name: v })); setDirty(true); }} /></div>
                <div className="flex flex-wrap gap-1.5">
                    <Button variant="outline" disabled={dis} onClick={async () => { if (await discardOk()) openTemplate(null, S, S.blankTemplate()); }}>＋ Blank</Button>
                    <Button variant="outline" disabled={dis} onClick={async () => { if (await discardOk()) openTemplate(null); }}>＋ From Classic look</Button>
                    <Button variant="outline" size="icon" title="Undo (Ctrl+Z)" aria-label="Undo" disabled={!undo.current.length} onClick={() => step(undo.current, redo.current)}><Undo2 className="size-4" /></Button>
                    <Button variant="outline" size="icon" title="Redo (Ctrl+Y)" aria-label="Redo" disabled={!redo.current.length} onClick={() => step(redo.current, undo.current)}><Redo2 className="size-4" /></Button>
                    <Button disabled={dis} onClick={() => void save(false)}>💾 Save{dirty ? ' *' : ''}</Button>
                    <Button variant="outline" disabled={!cur.id || dis} onClick={() => void save(true)}>Save as copy</Button>
                    <Button variant="outline" className="text-destructive" disabled={!cur.id || dis} onClick={() => void del()}>Delete</Button></div>
                <span className={cn('basis-full text-sm', status.bad ? 'text-destructive' : 'text-muted-foreground')}>{status.t}</span>
            </Card>

            <div className="grid items-start gap-3 lg:grid-cols-[250px_minmax(0,1fr)] xl:grid-cols-[250px_minmax(0,1fr)_300px]">
                <Card className="grid content-start gap-2 p-3 lg:max-h-[calc(100vh-140px)] lg:overflow-auto">
                    <h3 className="text-sm font-bold text-primary">Elements <small className="font-normal text-muted-foreground">drag onto the screen, or tap</small></h3>
                    <div className="flex flex-wrap gap-1.5">{ELEMENTS.map(([k, l, title]) => <button key={k} type="button" draggable title={title} className="cursor-grab touch-none rounded-full border bg-accent/40 px-2.5 py-1 text-xs font-semibold hover:border-gold" onDragStart={dragStart(`add:${k}`)} onClick={() => add(k)}>{l}</button>)}</div>
                    <h3 className="text-sm font-bold text-primary">Columns <small className="font-normal text-muted-foreground">drag onto the table</small></h3>
                    <div className="flex flex-wrap gap-1.5">{Object.entries(S.FIELDS as Record<string, string[]>).map(([k, [l]]) => <button key={k} type="button" draggable className="cursor-grab touch-none rounded-full border border-dashed bg-accent/20 px-2.5 py-1 text-xs font-semibold hover:border-gold" onDragStart={dragStart(`field:${k}`)} onClick={() => addColumn(k)}>{l}</button>)}</div>
                    <h3 className="text-sm font-bold text-primary">Background</h3>
                    <div className="grid gap-1.5 text-sm">
                        <Num as="color" label="Colour" value={/^#[0-9a-f]{6}$/i.test(cur.data.bg?.color || '') ? cur.data.bg.color : '#ffffff'} disabled={dis} onChange={v => change(d => { d.bg.color = v; }, 'bgcolor')} />
                        <label className="grid grid-cols-[5.5rem_1fr] items-center gap-1.5 text-xs font-semibold">Image<input type="file" accept="image/*" disabled={dis} className="min-w-0 text-xs" onChange={ev => { const f = ev.target.files?.[0]; ev.target.value = ''; void bgFile(f); }} /></label>
                        <Sel label="Fit" value={cur.data.bg?.fit || 'cover'} disabled={dis} list={[['cover', 'Cover the screen'], ['contain', 'Whole image'], ['fill', 'Stretch']]} onChange={v => change(d => { d.bg.fit = v; })} />
                        <Button variant="outline" size="sm" disabled={dis || !cur.data.bg?.image} onClick={() => change(d => { d.bg.image = ''; })}>Remove image</Button></div>
                    <h3 className="text-sm font-bold text-primary">Preview with real trips</h3>
                    <div className="grid gap-1.5 text-sm">
                        <label className="grid grid-cols-[5.5rem_1fr] items-center gap-1.5 text-xs font-semibold">Day<Input type="date" className="h-8" value={prevDay} onChange={ev => { setPrevDay(ev.target.value); setPrevPage(1); }} /></label>
                        <Sel label="Trip type" value={prevType} list={[['', 'Sample rows'], ...typeCounts.map(([k, n]) => [k, `${S.travelTo(k)} (${n})`] as [string, string])]} onChange={v => { setPrevType(v); setPrevPage(1); }} />
                        <Sel label="Page" value={String(clamp(prevPage, 1, Math.max(1, slides.length)))} list={(slides.length ? slides : [null]).map((_, i) => [String(i + 1), `${i + 1}${slides.length ? ` of ${slides.length}` : ''}`] as [string, string])} onChange={v => setPrevPage(Number(v))} /></div>
                </Card>

                <div className="grid min-w-0 gap-1.5">
                    <div ref={canvasRef} tabIndex={0} aria-label="Signage screen (1920 × 1080)" onPointerDown={onPointerDown} onDragOver={ev => { ev.preventDefault(); ev.dataTransfer.dropEffect = 'copy'; setDrop(true); }} onDragLeave={() => setDrop(false)} onDrop={onDrop}
                        className={cn('sb-canvas relative aspect-video w-full overflow-hidden rounded-lg shadow-md outline-none ring-1 ring-border focus-visible:ring-2 focus-visible:ring-gold', drop && 'ring-2 ring-ok')}
                        style={{ background: 'repeating-conic-gradient(#f3ead6 0 25%, #fff 0 50%) 0 0 / 24px 24px' }}>
                        <div ref={stageRef} className="sb-stage absolute left-0 top-0 origin-top-left [&>div]:cursor-move [&>div:hover]:outline-2 [&>div:hover]:-outline-offset-2 [&>div:hover]:outline-dashed [&>div:hover]:outline-blue-700/50" style={{ transform: `scale(${scale})` }} />
                        {e && <div className="sb-sel pointer-events-none absolute box-border border-2 border-blue-700" style={{ left: e.x * scale, top: e.y * scale, width: e.w * scale, height: e.h * scale }}>
                            {(['nw', 'ne', 'sw', 'se'] as const).map(h => <i key={h} data-h={h} className={cn('pointer-events-auto absolute size-3.5 rounded-sm border-2 border-blue-700 bg-white', h[0] === 'n' ? '-top-2' : '-bottom-2', h[1] === 'w' ? '-left-2' : '-right-2', h === 'nw' || h === 'se' ? 'cursor-nwse-resize' : 'cursor-nesw-resize')} />)}</div>}
                    </div>
                    <p className="text-xs text-muted-foreground">1920 × 1080 screen. Drag to move, corners to resize (snaps to 10 px — hold Shift for free). Arrow keys nudge, Delete removes. Texts can hold <code>{'{type}'}</code> <code>{'{date}'}</code> <code>{'{sdate}'}</code> <code>{'{rdate}'}</code> <code>{'{time}'}</code> <code>{'{page}'}</code>/<code>{'{pages}'}</code> <code>{'{trips}'}</code> <code>{'{pax}'}</code>.</p>
                </div>

                <Card className="grid content-start gap-2 p-3 lg:col-span-2 xl:col-span-1 xl:max-h-[calc(100vh-140px)] xl:overflow-auto">
                    {!e ? <>
                        <h3 className="text-sm font-bold text-primary">Selected element</h3><p className="text-sm text-muted-foreground">Tap an element on the screen to change it, or drag one in from the left.</p>
                        <h3 className="text-sm font-bold text-primary">Layers</h3>
                        <div className="grid gap-1">{[...cur.data.elements].reverse().map((x: Row) => <Button key={x.id} variant="outline" size="sm" className="justify-start" onClick={() => setSel(x.id)}>{label(x)}</Button>)}{!cur.data.elements.length && <span className="text-sm text-muted-foreground">Empty screen.</span>}</div></>
                        : <>
                            <h3 className="text-sm font-bold text-primary">{label(e)}</h3>
                            <div className="flex flex-wrap gap-1.5">
                                <Button size="sm" variant="outline" disabled={dis} onClick={() => change(d => { const l = d.elements.filter((x: Row) => x.id !== sel), t = d.elements.find((x: Row) => x.id === sel); d.elements = [...l, t]; })}>Bring to front</Button>
                                <Button size="sm" variant="outline" disabled={dis} onClick={() => change(d => { const l = d.elements.filter((x: Row) => x.id !== sel), t = d.elements.find((x: Row) => x.id === sel); d.elements = [t, ...l]; })}>Send to back</Button>
                                <Button size="sm" variant="outline" disabled={dis} onClick={duplicate}>Duplicate</Button><Button size="sm" variant="outline" className="text-destructive" disabled={dis} onClick={removeSel}><Trash2 className="size-3.5" />Delete</Button></div>
                            <div className="grid grid-cols-2 gap-1.5">{(['x', 'y', 'w', 'h'] as const).map(k => <Num key={k} label={k.toUpperCase()} value={e[k]} min={k === 'w' || k === 'h' ? 30 : -2000} max={4000} disabled={dis} onChange={v => { if (v !== null) set(k, v); }} />)}</div>
                            {e.type === 'text' && <div className="grid gap-1.5">
                                <Txt label="Text" value={e.text} disabled={dis} onChange={v => set('text', v)} />
                                <p className="text-xs text-muted-foreground">{'{type}'} trip type · {'{date}'} · {'{sdate}'} dd/mm/yyyy · {'{rdate}'} the rows' date(s) · {'{time}'} clock · {'{page}'} / {'{pages}'} · {'{trips}'} · {'{pax}'}</p>
                                <Sel label="Font" value={e.font} list={fonts} disabled={dis} onChange={v => set('font', v)} /><Num label="Size (px)" value={e.size} min={8} max={400} disabled={dis} onChange={v => v !== null && set('size', v)} />
                                <Num as="color" label="Colour" value={e.color} disabled={dis} onChange={v => set('color', v)} /><Num as="color" label="Box colour" value={e.bg} none disabled={dis} onChange={v => set('bg', v)} />
                                <Sel label="Align" value={e.align} list={[['left', 'Left'], ['center', 'Centre'], ['right', 'Right']]} disabled={dis} onChange={v => set('align', v)} />
                                <Sel label="Vertical" value={e.valign} list={[['top', 'Top'], ['middle', 'Middle'], ['bottom', 'Bottom']]} disabled={dis} onChange={v => set('valign', v)} />
                                <Chk label="Bold" value={e.bold} disabled={dis} onChange={v => set('bold', v)} /><Chk label="Italic" value={e.italic} disabled={dis} onChange={v => set('italic', v)} /><Chk label="Underline" value={e.underline} disabled={dis} onChange={v => set('underline', v)} />
                                <Num label="Corners" value={e.radius} min={0} max={500} disabled={dis} onChange={v => set('radius', v)} /><Num label="Padding" value={e.pad ?? 8} min={0} max={200} disabled={dis} onChange={v => set('pad', v)} /></div>}
                            {e.type === 'image' && <div className="grid gap-1.5">
                                <label className="grid grid-cols-[5.5rem_1fr] items-center gap-1.5 text-xs font-semibold">Picture<input type="file" accept="image/*" disabled={dis} className="min-w-0 text-xs" onChange={async ev => { const f = ev.target.files?.[0]; if (!f) return; try { const src = await readImage(f, 1200); set('src', src, ''); } catch { setStatus('Could not read that image.', true); } }} /></label>
                                <Sel label="Fit" value={e.fit} list={[['contain', 'Whole image'], ['cover', 'Fill the box'], ['fill', 'Stretch']]} disabled={dis} onChange={v => set('fit', v)} /><Num label="Corners" value={e.radius} min={0} max={1000} disabled={dis} onChange={v => set('radius', v)} />
                                <label className="grid grid-cols-[5.5rem_1fr] items-center gap-1.5 text-xs font-semibold">Opacity<Slider min={0} max={1} step={0.05} value={[e.opacity ?? 1]} disabled={dis} onValueChange={v => set('opacity', v[0])} /></label></div>}
                            {e.type === 'table' && <div className="grid gap-1.5">
                                <Num label="Rows / page" value={e.rows} min={1} max={30} disabled={dis} onChange={v => v !== null && set('rows', v)} /><Num label="Row height" value={e.rowHeight || ''} min={0} max={400} disabled={dis} onChange={v => set('rowHeight', v)} />
                                <Sel label="Font" value={e.font} list={fonts} disabled={dis} onChange={v => set('font', v)} /><Num label="Text size" value={e.size} min={8} max={120} disabled={dis} onChange={v => v !== null && set('size', v)} /><Num label="Heading size" value={e.headSize} min={8} max={120} disabled={dis} onChange={v => set('headSize', v)} />
                                <Num as="color" label="Heading bg" value={e.headBg} disabled={dis} onChange={v => set('headBg', v)} /><Num as="color" label="Heading text" value={e.headColor} disabled={dis} onChange={v => set('headColor', v)} />
                                <Num as="color" label="Rows" value={e.rowBg} disabled={dis} onChange={v => set('rowBg', v)} /><Num as="color" label="Every 2nd row" value={e.altBg} none disabled={dis} onChange={v => set('altBg', v)} />
                                <Num as="color" label="Row text" value={e.color} disabled={dis} onChange={v => set('color', v)} /><Num as="color" label="Lines" value={e.line} disabled={dis} onChange={v => set('line', v)} /><Num label="Heading corners" value={e.radius} min={0} max={100} disabled={dis} onChange={v => set('radius', v)} />
                                <Chk label="Write “Travel To” once per group of rows" value={e.merge} disabled={dis} onChange={v => set('merge', v)} /><Chk label="Share pages between trip types (like Classic)" value={e.combine} disabled={dis} onChange={v => set('combine', v)} />
                                <h3 className="text-sm font-bold text-primary">Columns <small className="font-normal text-muted-foreground">drag ⠿ to reorder</small></h3>
                                <div className="grid gap-1.5">{(e.columns || []).map((c: Row, i: number) => (
                                    <Col key={i} c={c} fields={S.FIELDS} disabled={dis} onDragStart={() => { dragCol.current = i; }} onDrop={() => { const from = dragCol.current; dragCol.current = null; if (from == null || from === i) return; change(d => { const t = d.elements.find((q: Row) => q.id === sel); const [m] = t.columns.splice(from, 1); t.columns.splice(i, 0, m); }); }}
                                        onSet={(k, v) => colSet(i, k, v)} onDelete={() => change(d => { d.elements.find((q: Row) => q.id === sel).columns.splice(i, 1); })} />))}</div>
                                <Sel label="＋ Add column…" value="" disabled={dis} list={[['', '＋ Add column…'], ...Object.entries(S.FIELDS as Record<string, string[]>).map(([k, [l]]) => [k, l] as [string, string])]} onChange={v => v && change(d => { d.elements.find((q: Row) => q.id === sel).columns.push({ field: v, title: S.FIELDS[v][0], align: 'center' }); })} /></div>}
                        </>}
                </Card>
            </div>

            <Card className="gap-3 p-4">
                <h2 className="font-bold">Slides — which template for which trip type</h2>
                <p className="text-sm text-muted-foreground">Every trip type found in the imported transport lists. The board shows them in this order, each slide for its seconds; a type with no trips in the window is skipped. Types on <b>Classic</b> (or on a template whose table has “share pages” ticked) share their pages. The window (which days and hours) is set on the Transport day page.</p>
                {order.length ? <div className="overflow-x-auto"><table className="w-full text-sm">
                    <thead><tr className="border-b text-left"><th className="p-2">Order</th><th className="p-2">Trip type</th><th className="p-2">Template</th><th className="p-2">Seconds a slide</th></tr></thead>
                    <tbody>{order.map((s, i) => (
                        <tr key={s.type} className={cn('border-b', s.template === 'none' && 'opacity-70')}>
                            <td className="whitespace-nowrap p-2"><Button size="icon" variant="outline" className="size-7" aria-label="Move up" disabled={dis || !i} onClick={() => { setOrder(o => { const n = [...o]; [n[i - 1], n[i]] = [n[i], n[i - 1]]; return n; }); setSlidesMsg('Not saved yet.'); }}><ChevronUp className="size-4" /></Button> <Button size="icon" variant="outline" className="size-7" aria-label="Move down" disabled={dis || i === order.length - 1} onClick={() => { setOrder(o => { const n = [...o]; [n[i + 1], n[i]] = [n[i], n[i + 1]]; return n; }); setSlidesMsg('Not saved yet.'); }}><ChevronDown className="size-4" /></Button></td>
                            <td className="p-2"><b>{S.travelTo(s.type)}</b><small className="block text-xs text-muted-foreground">{s.type} · {s.trips ? `${s.trips} trips, last ${s.last}` : 'no trips saved yet'}</small></td>
                            <td className="p-2"><select aria-label="Template" disabled={dis} className="h-9 rounded-md border bg-background px-2 text-sm" value={String(s.template)} onChange={ev => { const v = ev.target.value; setOrder(o => o.map((x, k) => k === i ? { ...x, template: v === 'none' || v === 'classic' ? v : Number(v) } : x)); setSlidesMsg('Not saved yet.'); }}>
                                {[['none', '— not shown —'], ['classic', 'Classic (sigatulhaj layout)'], ...templates.map(t => [String(t.id), t.name])].map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></td>
                            <td className="p-2"><Input type="number" min={3} max={600} className="h-9 w-24" disabled={dis} value={s.seconds} onChange={ev => { const v = clamp(Number(ev.target.value) || 15, 3, 600); setOrder(o => o.map((x, k) => k === i ? { ...x, seconds: v } : x)); setSlidesMsg('Not saved yet.'); }} /></td>
                        </tr>))}</tbody></table></div> : <p className="text-sm text-muted-foreground">No trip types yet — import a transport list first.</p>}
                <div className="flex flex-wrap items-center gap-3">
                    <label className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">Transition between slides <Slider className="w-40" min={0} max={3} step={0.1} value={[fade]} disabled={dis} onValueChange={v => { setFade(v[0]); setSlidesMsg('Not saved yet.'); }} /><output className="min-w-16 font-bold text-foreground">{fadeLabel(fade)}</output></label>
                    {writable && <Button onClick={() => void saveSlides()}>Save slides</Button>}<span className="text-sm text-muted-foreground">{slidesMsg}</span></div>
            </Card>
            {confirmDialog}
        </div>
    );
}
