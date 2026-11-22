import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

// Screen 1 / Screen 2 → a Design slide: a PowerPoint-like page on the 1080 × 1920 stage. Everything is done on the page itself —
//   insert text, titles, boxes, circles, lines, pictures, videos, tables, clocks and emoji from the ribbon (or drop / paste a picture);
//   click to select (Shift-click for several), drag to move (it snaps to the middle, the edges and the other elements), pull the handles to resize,
//   the round handle to turn; double-click a text to type in it, a table cell to change it;
//   the format bar above the page changes the font, size, colours, alignment … of what is selected;
//   Ctrl+Z / Ctrl+Y undo / redo, Ctrl+C / Ctrl+V / Ctrl+D copy, paste, duplicate, Delete, arrow keys nudge (Shift = 10 px).
// The drawing is core/screen.js (elBoxCss / elInner / designHtml), the same code the TV uses.

type El = Record<string, any>;
type D = { bg?: string; bgImage?: string; bgFit?: string; elements: El[] };
const W = 1080, H = 1920;
const clone = <T,>(o: T): T => JSON.parse(JSON.stringify(o));
const rid = () => Math.random().toString(36).slice(2, 10);
const cssObj = (css: string) => Object.fromEntries(css.split(';').map(x => x.trim()).filter(Boolean).map(x => { const i = x.indexOf(':'); return [x.slice(0, i).trim().replace(/-([a-z])/g, (_, c) => c.toUpperCase()), x.slice(i + 1).trim()]; }));
const EMOJI = ['📌', '📢', '⚠️', '✅', '❌', 'ℹ️', '🕋', '🕌', '📿', '🤲', '🍽️', '🥐', '🍛', '🍲', '☕', '🚌', '🚐', '✈️', '🧳', '🛏️', '🔑', '📶', '🧺', '💳', '📱', '☎️', '📍', '🕒', '📅', '⭐', '❤️', '👉', '⬅️', '➡️', '⬆️', '⬇️'];
const COLORS = ['#111111', '#ffffff', '#c8102e', '#e8590c', '#f59f00', '#2b8a3e', '#0f6b4c', '#1d4ed8', '#1d6fe0', '#6741d9', '#8a6a1f', '#f5d78e', '#dcebfb', '#fdf8ee', '#6b7280'];

const NEW: Record<string, (x: number, y: number) => El> = {
    text: (x, y) => ({ type: 'text', x, y, w: 700, h: 120, text: 'Double-click to type', font: 'Poppins', size: 48, color: '#111111', align: 'left', valign: 'middle' }),
    title: (x, y) => ({ type: 'text', x, y, w: 900, h: 160, text: 'Title', font: 'Playfair Display', size: 96, bold: true, color: '#0b1020', align: 'center', valign: 'middle' }),
    rect: (x, y) => ({ type: 'shape', shape: 'rect', x, y, w: 600, h: 300, fill: '#1d6fe0', radius: 24 }),
    ellipse: (x, y) => ({ type: 'shape', shape: 'ellipse', x, y, w: 360, h: 360, fill: '#f5d78e' }),
    line: (x, y) => ({ type: 'shape', shape: 'rect', x, y, w: 800, h: 10, fill: '#111111', radius: 5 }),
    table: (x, y) => ({ type: 'table', x, y, w: 900, h: 420, cells: [['Heading', 'Heading', 'Heading'], ['', '', ''], ['', '', ''], ['', '', '']], head: true, font: 'Arial', size: 36, headBg: '#1d4ed8', headColor: '#ffffff', cellBg: '#dbeafe', color: '#111111', line: '#ffffff', radius: 12 }),
    clock: (x, y) => ({ type: 'clock', fmt: 'time12', x, y, w: 560, h: 160, font: 'Montserrat', size: 110, bold: true, color: '#0b1020', align: 'center', valign: 'middle' }),
    date: (x, y) => ({ type: 'clock', fmt: 'day', x, y, w: 800, h: 110, font: 'Poppins', size: 54, color: '#0b1020', align: 'center', valign: 'middle' }),
};

function Btn({ on, title, onClick, children, disabled, dis }: { on?: boolean; title: string; onClick: () => void; children: React.ReactNode; disabled?: boolean; dis?: boolean }) {
    return <button type="button" title={title} aria-label={title} disabled={dis || disabled} onClick={onClick} className={cn('h-8 min-w-8 rounded-md border bg-background px-2 text-sm hover:border-gold disabled:opacity-40', on && 'border-gold bg-accent font-bold')}>{children}</button>;
}
function Swatch({ value, onPick, title, none, dis }: { value?: string; onPick: (c: string) => void; title: string; none?: boolean; dis?: boolean }) {
    return (
        <span className="group relative inline-flex">
            <label title={title} className="flex h-8 cursor-pointer items-center gap-1 rounded-md border bg-background px-1.5 text-xs"><span className="size-5 rounded border" style={{ background: value || 'transparent', backgroundImage: value ? undefined : 'linear-gradient(135deg,#fff 45%,#e11 50%,#fff 55%)' }} />{title}
                <input type="color" className="sr-only" disabled={dis} value={/^#[0-9a-f]{6}$/i.test(value || '') ? value : '#ffffff'} onChange={ev => onPick(ev.target.value)} /></label>
            <span className="invisible absolute left-0 top-8 z-30 grid w-44 grid-cols-5 gap-1 rounded-lg border bg-popover p-1.5 shadow-lg group-hover:visible">{COLORS.map(c => <button key={c} type="button" title={c} className="size-7 rounded border" style={{ background: c }} onClick={() => onPick(c)} />)}
                {none && <button type="button" className="col-span-5 rounded border text-xs" onClick={() => onPick('')}>None</button>}</span>
        </span>)
}

export function DesignEditor({ design, onChange, S, url, uploadFile, dis }: {
    design: D; onChange: (d: D) => void; S: any; url: (id: string) => string; uploadFile: (f: File) => Promise<string>; dis: boolean;
}) {
    const d: D = useMemo(() => ({ ...design, elements: design.elements || [] }), [design]);
    const [sel, setSel] = useState<string[]>([]);
    const [editing, setEditing] = useState<string | null>(null);
    const [cellEdit, setCellEdit] = useState<{ id: string; r: number; c: number; box: number[] } | null>(null);
    const [guides, setGuides] = useState<{ x: number[]; y: number[] }>({ x: [], y: [] });
    const [k, setK] = useState(0.3);
    const [busy, setBusy] = useState('');
    const [emojiOpen, setEmojiOpen] = useState(false);
    const past = useRef<D[]>([]), future = useRef<D[]>([]), clip = useRef<El[]>([]), latest = useRef(d);
    latest.current = d;
    const wrap = useRef<HTMLDivElement>(null), stage = useRef<HTMLDivElement>(null), root = useRef<HTMLDivElement>(null);
    const [, force] = useState(0);

    // the page fills the space it has (the whole 1080 × 1920 visible)
    useLayoutEffect(() => {
        const fit = () => { const box = wrap.current; if (!box) return; const w = box.clientWidth, h = Math.max(420, window.innerHeight - 260); setK(Math.max(0.15, Math.min(w / W, h / H))); };
        fit(); const ro = new ResizeObserver(fit); if (wrap.current) ro.observe(wrap.current); addEventListener('resize', fit);
        return () => { ro.disconnect(); removeEventListener('resize', fit); };
    }, []);

    const record = () => { past.current.push(clone(latest.current)); if (past.current.length > 100) past.current.shift(); future.current = []; force(x => x + 1); };
    const change = (f: (x: D) => void, rec = true) => { const n = clone(latest.current); f(n); if (rec) record(); onChange(n); };
    const undo = () => { const p = past.current.pop(); if (!p) return; future.current.push(clone(latest.current)); onChange(p); setSel(s => s.filter(id => p.elements.some(e => e.id === id))); force(x => x + 1); };
    const redo = () => { const f = future.current.pop(); if (!f) return; past.current.push(clone(latest.current)); onChange(f); force(x => x + 1); };
    const selected = d.elements.filter(e => sel.includes(e.id));
    const one = selected.length === 1 ? selected[0] : null;
    const setSelEl = (patch: El) => change(x => { for (const e of x.elements) if (sel.includes(e.id)) Object.assign(e, patch); });

    const add = (el: El) => { const e = { id: rid(), ...el }; change(x => { x.elements.push(e); }); setSel([e.id]); return e; };
    const insert = (kind: string) => { const f = NEW[kind]; const e = f(0, 0); add({ ...e, x: Math.round((W - e.w) / 2), y: Math.round((H - e.h) / 2) }); };
    async function addFile(file: File, at?: { x: number; y: number }) {
        const video = /^video\//.test(file.type);
        if (!/^image\//.test(file.type) && !video) return;
        setBusy(`Adding ${file.name}…`);
        try {
            const id = await uploadFile(file);
            const size = video ? { w: 960, h: 540 } : await new Promise<{ w: number; h: number }>(res => { const i = new Image(); i.onload = () => { const r = Math.min(800 / i.naturalWidth, 800 / i.naturalHeight, 1.5); res({ w: Math.round(i.naturalWidth * r), h: Math.round(i.naturalHeight * r) }); }; i.onerror = () => res({ w: 600, h: 600 }); i.src = URL.createObjectURL(file); });
            const x = at ? at.x - size.w / 2 : (W - size.w) / 2, y = at ? at.y - size.h / 2 : (H - size.h) / 2;
            add({ type: video ? 'video' : 'image', src: id, fit: 'cover', x: Math.round(x), y: Math.round(y), ...size });
        } catch (e: any) { setBusy('Could not add the file: ' + (e.message || e)); return; }
        setBusy('');
    }
    const pickFile = (accept: string, then: (f: File) => void) => { const inp = document.createElement('input'); inp.type = 'file'; inp.accept = accept; inp.onchange = () => { const f = inp.files?.[0]; if (f) then(f); }; inp.click(); };

    // ---- pointer: move, resize, turn ----
    const toStage = (cx: number, cy: number) => { const r = stage.current!.getBoundingClientRect(); return { x: (cx - r.left) / k, y: (cy - r.top) / k }; };
    const snapMove = (box: { x: number; y: number; w: number; h: number }, others: El[]) => {
        const T = 7 / k, xs = [0, W / 2, W, ...others.flatMap(o => [o.x, o.x + o.w / 2, o.x + o.w])], ys = [0, H / 2, H, ...others.flatMap(o => [o.y, o.y + o.h / 2, o.y + o.h])];
        let dx = 0, dy = 0; const gx: number[] = [], gy: number[] = [];
        let best = T; for (const c of xs) for (const v of [box.x, box.x + box.w / 2, box.x + box.w]) if (Math.abs(c - v) < best) { best = Math.abs(c - v); dx = c - v; gx[0] = c; }
        best = T; for (const c of ys) for (const v of [box.y, box.y + box.h / 2, box.y + box.h]) if (Math.abs(c - v) < best) { best = Math.abs(c - v); dy = c - v; gy[0] = c; }
        return { dx, dy, gx: gx.filter(v => v != null), gy: gy.filter(v => v != null) };
    };
    function startMove(ev: React.PointerEvent, e: El) {
        if (dis || ev.button !== 0) return;
        ev.stopPropagation();
        if (editing === e.id) return;
        setEditing(null); setCellEdit(null);
        let ids = sel;
        if (ev.shiftKey) { ids = sel.includes(e.id) ? sel.filter(x => x !== e.id) : [...sel, e.id]; setSel(ids); return; }
        if (!sel.includes(e.id)) { ids = [e.id]; setSel(ids); }
        const start = toStage(ev.clientX, ev.clientY), base = clone(latest.current), moving = base.elements.filter(x => ids.includes(x.id)), others = base.elements.filter(x => !ids.includes(x.id) && !x.locked);
        if (moving.some(m => m.locked)) return;
        const bb = { x: Math.min(...moving.map(m => m.x)), y: Math.min(...moving.map(m => m.y)), w: 0, h: 0 }; bb.w = Math.max(...moving.map(m => m.x + m.w)) - bb.x; bb.h = Math.max(...moving.map(m => m.y + m.h)) - bb.y;
        let moved = false;
        const mv = (pe: PointerEvent) => {
            const p = toStage(pe.clientX, pe.clientY); let dx = p.x - start.x, dy = p.y - start.y;
            if (!moved && Math.hypot(dx, dy) * k < 3) return;
            if (!moved) { past.current.push(base); future.current = []; moved = true; }
            const s = pe.altKey ? { dx: 0, dy: 0, gx: [], gy: [] } : snapMove({ ...bb, x: bb.x + dx, y: bb.y + dy }, others);
            dx += s.dx; dy += s.dy; setGuides({ x: s.gx, y: s.gy });
            const n = clone(base); for (const el of n.elements) if (ids.includes(el.id)) { const o = base.elements.find(q => q.id === el.id)!; el.x = Math.round(o.x + dx); el.y = Math.round(o.y + dy); }
            onChange(n);
        };
        const up = () => { removeEventListener('pointermove', mv); removeEventListener('pointerup', up); setGuides({ x: [], y: [] }); force(x => x + 1); };
        addEventListener('pointermove', mv); addEventListener('pointerup', up);
    }
    function startResize(ev: React.PointerEvent, e: El, dir: string) {
        ev.stopPropagation(); ev.preventDefault();
        const base = clone(latest.current), o = base.elements.find(q => q.id === e.id)!, start = toStage(ev.clientX, ev.clientY), ratio = o.w / o.h;
        past.current.push(base); future.current = [];
        const keep = o.type === 'image' || o.type === 'video' || o.shape === 'ellipse';
        const mv = (pe: PointerEvent) => {
            const p = toStage(pe.clientX, pe.clientY), dx = p.x - start.x, dy = p.y - start.y;
            let { x, y, w, h } = o;
            if (dir.includes('e')) w = o.w + dx; if (dir.includes('s')) h = o.h + dy;
            if (dir.includes('w')) { w = o.w - dx; x = o.x + dx; } if (dir.includes('n')) { h = o.h - dy; y = o.y + dy; }
            if ((keep !== pe.shiftKey) && dir.length === 2) { const nh = w / ratio; if (dir.includes('n')) y = o.y + o.h - nh; h = nh; }
            w = Math.max(10, w); h = Math.max(6, h);
            const n = clone(base); Object.assign(n.elements.find(q => q.id === e.id)!, { x: Math.round(x), y: Math.round(y), w: Math.round(w), h: Math.round(h) }); onChange(n);
        };
        const up = () => { removeEventListener('pointermove', mv); removeEventListener('pointerup', up); force(x => x + 1); };
        addEventListener('pointermove', mv); addEventListener('pointerup', up);
    }
    function startTurn(ev: React.PointerEvent, e: El) {
        ev.stopPropagation(); ev.preventDefault();
        const base = clone(latest.current); past.current.push(base); future.current = [];
        const cx = e.x + e.w / 2, cy = e.y + e.h / 2;
        const mv = (pe: PointerEvent) => {
            const p = toStage(pe.clientX, pe.clientY); let a = Math.atan2(p.y - cy, p.x - cx) * 180 / Math.PI + 90;
            a = ((a % 360) + 360) % 360; if (a > 180) a -= 360;
            const snap = pe.shiftKey ? 15 : 0; if (snap) a = Math.round(a / snap) * snap; else for (const t of [-180, -90, 0, 90, 180]) if (Math.abs(a - t) < 4) a = t;
            const n = clone(base); n.elements.find(q => q.id === e.id)!.rot = Math.round(a) === 0 ? 0 : Math.round(a); onChange(n);
        };
        const up = () => { removeEventListener('pointermove', mv); removeEventListener('pointerup', up); force(x => x + 1); };
        addEventListener('pointermove', mv); addEventListener('pointerup', up);
    }
    function dblClick(ev: React.MouseEvent, e: El) {
        if (dis) return;
        ev.stopPropagation();
        if (e.type === 'text') { setSel([e.id]); setEditing(e.id); return; }
        if (e.type === 'table') {
            const cell = (ev.target as HTMLElement).closest('[data-cell]') as HTMLElement | null; if (!cell) return;
            const [r, c] = cell.dataset.cell!.split(':').map(Number), a = cell.getBoundingClientRect(), s = stage.current!.getBoundingClientRect();
            setSel([e.id]); setCellEdit({ id: e.id, r, c, box: [(a.left - s.left) / k, (a.top - s.top) / k, a.width / k, a.height / k] });
        }
        if (e.type === 'image' || e.type === 'video') pickFile(e.type === 'video' ? 'video/mp4,video/webm' : 'image/*', async f => { setBusy('Replacing…'); try { const id = await uploadFile(f); change(x => { x.elements.find(q => q.id === e.id)!.src = id; }); } finally { setBusy(''); } });
    }

    // ---- keyboard & paste ----
    const onKey = useCallback((ev: KeyboardEvent) => {
        if (dis || !root.current) return;
        const t = ev.target as HTMLElement;
        if (t.closest('input,textarea,select,[contenteditable="true"]')) return;
        if (!root.current.contains(document.activeElement) && document.activeElement !== document.body) return;
        const ctrl = ev.ctrlKey || ev.metaKey, key = ev.key.toLowerCase();
        if (ctrl && key === 'z' && !ev.shiftKey) { ev.preventDefault(); undo(); return; }
        if (ctrl && (key === 'y' || (key === 'z' && ev.shiftKey))) { ev.preventDefault(); redo(); return; }
        if (ctrl && key === 'a') { ev.preventDefault(); setSel(latest.current.elements.map(e => e.id)); return; }
        if (!sel.length) { if (ctrl && key === 'v' && clip.current.length) paste(); return; }
        if (key === 'delete' || key === 'backspace') { ev.preventDefault(); change(x => { x.elements = x.elements.filter(e => !sel.includes(e.id)); }); setSel([]); return; }
        if (ctrl && key === 'c') { clip.current = clone(latest.current.elements.filter(e => sel.includes(e.id))); return; }
        if (ctrl && key === 'x') { clip.current = clone(latest.current.elements.filter(e => sel.includes(e.id))); change(x => { x.elements = x.elements.filter(e => !sel.includes(e.id)); }); setSel([]); return; }
        if (ctrl && key === 'v') { ev.preventDefault(); paste(); return; }
        if (ctrl && key === 'd') { ev.preventDefault(); duplicate(); return; }
        if (key === 'escape') { setSel([]); return; }
        if (key === 'enter' && one && one.type === 'text') { ev.preventDefault(); setEditing(one.id); return; }
        const step = ev.shiftKey ? 10 : 1, mv: Record<string, [number, number]> = { arrowleft: [-step, 0], arrowright: [step, 0], arrowup: [0, -step], arrowdown: [0, step] };
        if (mv[key]) { ev.preventDefault(); change(x => { for (const e of x.elements) if (sel.includes(e.id)) { e.x += mv[key][0]; e.y += mv[key][1]; } }); }
    }, [sel, dis, one]);   // eslint-disable-line react-hooks/exhaustive-deps
    useEffect(() => { addEventListener('keydown', onKey); return () => removeEventListener('keydown', onKey); }, [onKey]);
    useEffect(() => {
        const onPaste = (ev: ClipboardEvent) => {
            if (dis || (ev.target as HTMLElement)?.closest?.('input,textarea,[contenteditable="true"]')) return;
            if (!root.current || !(root.current.contains(document.activeElement) || document.activeElement === document.body)) return;
            const f = [...(ev.clipboardData?.files || [])].find(x => /^image\//.test(x.type)); if (f) { ev.preventDefault(); void addFile(f); }
        };
        addEventListener('paste', onPaste); return () => removeEventListener('paste', onPaste);
    });
    function paste() { if (!clip.current.length) return; const items = clip.current.map(e => ({ ...clone(e), id: rid(), x: e.x + 30, y: e.y + 30 })); clip.current = clone(items); change(x => { x.elements.push(...items); }); setSel(items.map(e => e.id)); }
    function duplicate() { const items = latest.current.elements.filter(e => sel.includes(e.id)).map(e => ({ ...clone(e), id: rid(), x: e.x + 30, y: e.y + 30 })); change(x => { x.elements.push(...items); }); setSel(items.map(e => e.id)); }
    const order = (to: 'front' | 'back' | 'up' | 'down') => change(x => {
        const ids = sel; if (!ids.length) return;
        if (to === 'front' || to === 'back') { const mine = x.elements.filter(e => ids.includes(e.id)), rest = x.elements.filter(e => !ids.includes(e.id)); x.elements = to === 'front' ? [...rest, ...mine] : [...mine, ...rest]; return; }
        const a = x.elements; if (to === 'up') for (let i = a.length - 2; i >= 0; i--) { if (ids.includes(a[i].id) && !ids.includes(a[i + 1].id)) [a[i], a[i + 1]] = [a[i + 1], a[i]]; }
        else for (let i = 1; i < a.length; i++) if (ids.includes(a[i].id) && !ids.includes(a[i - 1].id)) [a[i], a[i - 1]] = [a[i - 1], a[i]];
    });
    const alignPage = (how: string) => change(x => {
        const mine = x.elements.filter(e => sel.includes(e.id)); if (!mine.length) return;
        const box = mine.length > 1 ? { x: Math.min(...mine.map(e => e.x)), y: Math.min(...mine.map(e => e.y)), r: Math.max(...mine.map(e => e.x + e.w)), b: Math.max(...mine.map(e => e.y + e.h)) } : { x: 0, y: 0, r: W, b: H };
        for (const e of mine) {
            if (how === 'left') e.x = box.x; if (how === 'right') e.x = box.r - e.w; if (how === 'center') e.x = Math.round((box.x + box.r - e.w) / 2);
            if (how === 'top') e.y = box.y; if (how === 'bottom') e.y = box.b - e.h; if (how === 'middle') e.y = Math.round((box.y + box.b - e.h) / 2);
        }
    });

    // ---- the format bar of the selection ----
    const fonts: string[] = S.DESIGN_FONTS;
    const txt = one && (one.type === 'text' || one.type === 'clock' || one.type === 'table') ? one : null;
    const allSel = selected.length > 0;

    return (
        <div ref={root} tabIndex={-1} className="grid min-w-0 gap-2 outline-none">
            {/* ribbon */}
            <div className="flex flex-wrap items-center gap-1 rounded-xl border bg-card p-1.5 text-sm">
                <span className="px-1 text-xs font-semibold text-muted-foreground">Insert</span>
                <Btn dis={dis} title="Text" onClick={() => insert('text')}>𝐓 Text</Btn><Btn dis={dis} title="Title" onClick={() => insert('title')}>𝐇 Title</Btn>
                <Btn dis={dis} title="Box" onClick={() => insert('rect')}>▭ Box</Btn><Btn dis={dis} title="Circle" onClick={() => insert('ellipse')}>◯</Btn><Btn dis={dis} title="Line" onClick={() => insert('line')}>━</Btn>
                <Btn dis={dis} title="Picture" onClick={() => pickFile('image/*', f => void addFile(f))}>🖼 Picture</Btn><Btn dis={dis} title="Video" onClick={() => pickFile('video/mp4,video/webm', f => void addFile(f))}>🎬 Video</Btn>
                <Btn dis={dis} title="Table" onClick={() => insert('table')}>▦ Table</Btn><Btn dis={dis} title="Clock (live time)" onClick={() => insert('clock')}>🕒 Clock</Btn><Btn dis={dis} title="Date (live)" onClick={() => insert('date')}>📅 Date</Btn>
                <span className="relative"><Btn dis={dis} title="Emoji / icon" onClick={() => setEmojiOpen(o => !o)}>😀</Btn>
                    {emojiOpen && <span className="absolute left-0 top-9 z-30 grid w-72 grid-cols-9 gap-1 rounded-lg border bg-popover p-2 shadow-lg">{EMOJI.map(m => <button key={m} type="button" className="rounded p-1 text-xl hover:bg-accent" onClick={() => { setEmojiOpen(false); add({ type: 'text', text: m, x: 440, y: 860, w: 200, h: 200, size: 140, align: 'center', valign: 'middle', pad: 0 }); }}>{m}</button>)}</span>}</span>
                <span className="mx-1 h-6 w-px bg-border" />
                <Btn dis={dis} title="Undo (Ctrl+Z)" disabled={!past.current.length} onClick={undo}>↶</Btn><Btn dis={dis} title="Redo (Ctrl+Y)" disabled={!future.current.length} onClick={redo}>↷</Btn>
                <Btn dis={dis} title="Duplicate (Ctrl+D)" disabled={!allSel} onClick={duplicate}>⧉</Btn><Btn dis={dis} title="Delete (Del)" disabled={!allSel} onClick={() => { change(x => { x.elements = x.elements.filter(e => !sel.includes(e.id)); }); setSel([]); }}>🗑</Btn>
                <span className="mx-1 h-6 w-px bg-border" />
                <Btn dis={dis} title="Bring to front" disabled={!allSel} onClick={() => order('front')}>⇈</Btn><Btn dis={dis} title="Forward" disabled={!allSel} onClick={() => order('up')}>↑</Btn><Btn dis={dis} title="Backward" disabled={!allSel} onClick={() => order('down')}>↓</Btn><Btn dis={dis} title="Send to back" disabled={!allSel} onClick={() => order('back')}>⇊</Btn>
                <span className="mx-1 h-6 w-px bg-border" />
                <span className="px-1 text-xs font-semibold text-muted-foreground">{selected.length > 1 ? 'Align together' : 'Align on page'}</span>
                <Btn dis={dis} title="Left" disabled={!allSel} onClick={() => alignPage('left')}>⇤</Btn><Btn dis={dis} title="Centre" disabled={!allSel} onClick={() => alignPage('center')}>↔</Btn><Btn dis={dis} title="Right" disabled={!allSel} onClick={() => alignPage('right')}>⇥</Btn>
                <Btn dis={dis} title="Top" disabled={!allSel} onClick={() => alignPage('top')}>⤒</Btn><Btn dis={dis} title="Middle" disabled={!allSel} onClick={() => alignPage('middle')}>↕</Btn><Btn dis={dis} title="Bottom" disabled={!allSel} onClick={() => alignPage('bottom')}>⤓</Btn>
                <span className="mx-1 h-6 w-px bg-border" />
                <span className="px-1 text-xs font-semibold text-muted-foreground">Page</span>
                <Swatch dis={dis} title="Background" value={d.bg} onPick={c => change(x => { x.bg = c || '#ffffff'; })} />
                <Btn dis={dis} title="Background picture" onClick={() => pickFile('image/*', async f => { setBusy('Uploading…'); try { const id = await uploadFile(f); change(x => { x.bgImage = id; }); } finally { setBusy(''); } })}>🖼 Bg</Btn>
                {d.bgImage && <Btn dis={dis} title="Remove the background picture" onClick={() => change(x => { x.bgImage = ''; })}>✕ Bg</Btn>}
            </div>
            {/* format bar of the selection */}
            <div className="flex h-[6.2rem] flex-wrap content-start items-center gap-1 overflow-y-auto rounded-xl border bg-card p-1.5 text-sm">   {/* fixed height: the page never jumps when the selection changes */}
                {!allSel && <span className="px-2 text-xs text-muted-foreground">Click an element to change it · double-click a text or a table cell to type · drop or paste a picture onto the page.</span>}
                {txt && <>
                    <select aria-label="Font" disabled={dis} className="h-8 max-w-40 rounded-md border bg-background px-1 text-sm" value={txt.font || 'Georgia'} onChange={ev => setSelEl({ font: ev.target.value })} style={{ fontFamily: txt.font }}>{fonts.map(f => <option key={f} value={f} style={{ fontFamily: f }}>{f}</option>)}</select>
                    <Btn dis={dis} title="Smaller" onClick={() => setSelEl({ size: Math.max(8, Math.round((txt.size || 48) / 1.1)) })}>A−</Btn>
                    <input aria-label="Text size" type="number" min={8} max={400} disabled={dis} className="h-8 w-16 rounded-md border bg-background px-1 text-center" value={txt.size || 48} onChange={ev => setSelEl({ size: Math.max(8, Number(ev.target.value) || 8) })} />
                    <Btn dis={dis} title="Bigger" onClick={() => setSelEl({ size: Math.min(400, Math.round((txt.size || 48) * 1.1)) })}>A+</Btn>
                    <Btn dis={dis} title="Bold" on={!!txt.bold} onClick={() => setSelEl({ bold: !txt.bold })}><b>B</b></Btn><Btn dis={dis} title="Italic" on={!!txt.italic} onClick={() => setSelEl({ italic: !txt.italic })}><i>I</i></Btn>
                    {txt.type !== 'table' && <Btn dis={dis} title="Underline" on={!!txt.underline} onClick={() => setSelEl({ underline: !txt.underline })}><u>U</u></Btn>}
                    <Swatch dis={dis} title="Text" value={txt.color} onPick={c => setSelEl({ color: c || '#111111' })} />
                    {txt.type !== 'table' && <Swatch dis={dis} title="Fill" none value={txt.bg} onPick={c => setSelEl({ bg: c })} />}
                    <Btn dis={dis} title="Align left" on={txt.align === 'left' || !txt.align} onClick={() => setSelEl({ align: 'left' })}>⯇</Btn><Btn dis={dis} title="Centre" on={txt.align === 'center'} onClick={() => setSelEl({ align: 'center' })}>≡</Btn><Btn dis={dis} title="Align right" on={txt.align === 'right'} onClick={() => setSelEl({ align: 'right' })}>⯈</Btn>
                    {txt.type !== 'table' && <><Btn dis={dis} title="Top" on={txt.valign === 'top'} onClick={() => setSelEl({ valign: 'top' })}>⤒</Btn><Btn dis={dis} title="Middle" on={!txt.valign || txt.valign === 'middle'} onClick={() => setSelEl({ valign: 'middle' })}>↕</Btn><Btn dis={dis} title="Bottom" on={txt.valign === 'bottom'} onClick={() => setSelEl({ valign: 'bottom' })}>⤓</Btn>
                        <Btn dis={dis} title="Shadow" on={!!txt.shadow} onClick={() => setSelEl({ shadow: !txt.shadow })}>S̈</Btn>
                        <label className="flex items-center gap-1 text-xs" title="Line spacing">↨<input type="number" step={0.1} min={0.8} max={3} disabled={dis} className="h-8 w-14 rounded-md border bg-background px-1" value={txt.lh ?? 1.2} onChange={ev => setSelEl({ lh: Number(ev.target.value) || 1.2 })} /></label></>}
                    {txt.type === 'clock' && <select aria-label="Clock shows" disabled={dis} className="h-8 rounded-md border bg-background px-1 text-sm" value={txt.fmt || 'time12'} onChange={ev => setSelEl({ fmt: ev.target.value })}>
                        <option value="time12">Time 4:35 PM</option><option value="time24">Time 16:35</option><option value="day">Day & date</option><option value="date">Date</option></select>}
                </>}
                {one?.type === 'table' && <>
                    <span className="mx-1 h-6 w-px bg-border" />
                    <Btn dis={dis} title="First row is a heading" on={one.head !== false} onClick={() => setSelEl({ head: one.head === false })}>H</Btn>
                    <Swatch dis={dis} title="Heading" value={one.headBg} onPick={c => setSelEl({ headBg: c || '#1d4ed8' })} /><Swatch dis={dis} title="Heading text" value={one.headColor} onPick={c => setSelEl({ headColor: c || '#ffffff' })} />
                    <Swatch dis={dis} title="Cells" value={one.cellBg} onPick={c => setSelEl({ cellBg: c || '#dbeafe' })} /><Swatch dis={dis} title="Every 2nd" none value={one.altBg} onPick={c => setSelEl({ altBg: c })} /><Swatch dis={dis} title="Lines" value={one.line} onPick={c => setSelEl({ line: c || '#ffffff' })} />
                    <Btn dis={dis} title="Add a row" onClick={() => change(x => { const e = x.elements.find(q => q.id === one.id)!; e.cells.push(e.cells[0].map(() => '')); e.h += Math.round(e.h / Math.max(1, e.cells.length - 1)); })}>＋ Row</Btn>
                    <Btn dis={dis} title="Remove the last row" disabled={one.cells.length < 2} onClick={() => change(x => { const e = x.elements.find(q => q.id === one.id)!; e.h -= Math.round(e.h / e.cells.length); e.cells.pop(); })}>− Row</Btn>
                    <Btn dis={dis} title="Add a column" onClick={() => change(x => { const e = x.elements.find(q => q.id === one.id)!; e.cells.forEach((r: string[], i: number) => r.push(i === 0 && e.head !== false ? 'Heading' : '')); })}>＋ Col</Btn>
                    <Btn dis={dis} title="Remove the last column" disabled={(one.cells[0] || []).length < 2} onClick={() => change(x => { x.elements.find(q => q.id === one.id)!.cells.forEach((r: string[]) => r.pop()); })}>− Col</Btn>
                </>}
                {one?.type === 'shape' && <>
                    <Swatch dis={dis} title="Fill" none value={one.fill} onPick={c => setSelEl({ fill: c })} /><Swatch dis={dis} title="Border" value={one.borderColor} onPick={c => setSelEl({ borderColor: c || '#000000', border: one.border || 4 })} />
                    <label className="flex items-center gap-1 text-xs">Border<input type="number" min={0} max={80} disabled={dis} className="h-8 w-14 rounded-md border bg-background px-1" value={one.border || 0} onChange={ev => setSelEl({ border: Number(ev.target.value) || 0 })} /></label>
                    {one.shape !== 'ellipse' && <label className="flex items-center gap-1 text-xs">Corners<input type="number" min={0} max={2000} disabled={dis} className="h-8 w-16 rounded-md border bg-background px-1" value={one.radius || 0} onChange={ev => setSelEl({ radius: Number(ev.target.value) || 0 })} /></label>}
                </>}
                {(one?.type === 'image' || one?.type === 'video') && <>
                    <select aria-label="Fit" disabled={dis} className="h-8 rounded-md border bg-background px-1 text-sm" value={one.fit || 'cover'} onChange={ev => setSelEl({ fit: ev.target.value })}><option value="cover">Fill the box</option><option value="contain">Whole picture</option>{one.type === 'image' && <option value="fill">Stretch</option>}</select>
                    <label className="flex items-center gap-1 text-xs">Corners<input type="number" min={0} max={2000} disabled={dis} className="h-8 w-16 rounded-md border bg-background px-1" value={one.radius || 0} onChange={ev => setSelEl({ radius: Number(ev.target.value) || 0 })} /></label>
                    <Btn dis={dis} title="Replace (or double-click it)" onClick={() => pickFile(one.type === 'video' ? 'video/mp4,video/webm' : 'image/*', async f => { setBusy('Replacing…'); try { const id = await uploadFile(f); setSelEl({ src: id }); } finally { setBusy(''); } })}>⟳ Replace</Btn>
                </>}
                {allSel && <>
                    <span className="mx-1 h-6 w-px bg-border" />
                    <label className="flex items-center gap-1 text-xs" title="See-through">◐<input type="range" min={0.1} max={1} step={0.05} disabled={dis} value={selected[0].opacity ?? 1} onChange={ev => setSelEl({ opacity: Number(ev.target.value) })} className="w-20" /></label>
                    {one && <label className="flex items-center gap-1 text-xs" title="Turn (degrees)">⟳<input type="number" min={-180} max={180} disabled={dis} className="h-8 w-16 rounded-md border bg-background px-1" value={one.rot || 0} onChange={ev => setSelEl({ rot: Number(ev.target.value) || 0 })} /></label>}
                    <Btn dis={dis} title={selected.every(e => e.locked) ? 'Unlock (can move again)' : 'Lock in place'} on={selected.every(e => e.locked)} onClick={() => setSelEl({ locked: !selected.every(e => e.locked) })}>{selected.every(e => e.locked) ? '🔒' : '🔓'}</Btn>
                    {one && <span className="ml-auto font-mono text-[11px] text-muted-foreground">x {one.x} · y {one.y} · {one.w}×{one.h}</span>}
                </>}
            </div>
            <p className="h-5 truncate text-sm text-muted-foreground">{busy}</p>
            {/* the page */}
            <div ref={wrap} className="flex min-w-0 justify-center rounded-xl bg-[repeating-conic-gradient(#e5e7eb_0_25%,#f3f4f6_0_50%)] bg-[length:20px_20px] p-3"
                onDragOver={ev => { if (!dis && ev.dataTransfer.types.includes('Files')) ev.preventDefault(); }}
                onDrop={ev => { if (dis) return; ev.preventDefault(); const f = [...ev.dataTransfer.files]; const p = stage.current ? toStage(ev.clientX, ev.clientY) : undefined; f.forEach((x, i) => void addFile(x, p && { x: p.x + i * 40, y: p.y + i * 40 })); }}>
                <div className="relative shadow-xl" style={{ width: W * k, height: H * k }}>
                    <div ref={stage} className="absolute left-0 top-0 origin-top-left select-none" style={{ width: W, height: H, transform: `scale(${k})`, ...cssObj(S.designBgCss(d, url)), overflow: 'hidden' }}
                        onPointerDown={ev => { if (ev.target === stage.current) { setSel([]); setEditing(null); setCellEdit(null); root.current?.focus({ preventScroll: true }); } }}>
                        <span hidden dangerouslySetInnerHTML={{ __html: S.designFonts(d) }} />
                        {d.elements.map(e => (
                            <div key={e.id} style={{ ...cssObj(S.elBoxCss(e)), cursor: dis ? 'default' : e.locked ? 'not-allowed' : editing === e.id ? 'text' : 'move' }}
                                onPointerDown={ev => { root.current?.focus({ preventScroll: true }); startMove(ev, e); }} onDoubleClick={ev => dblClick(ev, e)}>
                                {editing === e.id
                                    ? <div contentEditable suppressContentEditableWarning className="min-h-[1em] w-full whitespace-pre-wrap outline-none" style={{ cursor: 'text' }}
                                        ref={el => { if (el && document.activeElement !== el) { el.focus(); const r = document.createRange(); r.selectNodeContents(el); const s = getSelection(); s?.removeAllRanges(); s?.addRange(r); } }}
                                        onPointerDown={ev => ev.stopPropagation()}
                                        onBlur={ev => { const t = (ev.currentTarget as HTMLElement).innerText.replace(/\n$/, ''); setEditing(null); if (t !== e.text) change(x => { x.elements.find(q => q.id === e.id)!.text = t; }); }}
                                        onKeyDown={ev => { if (ev.key === 'Escape') (ev.currentTarget as HTMLElement).blur(); }}>{e.text}</div>
                                    : <div style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: S.elInner(e, url) }} />}
                            </div>))}
                        {/* selection: frames, handles, turn knob */}
                        {!dis && selected.map(e => (
                            <div key={'s' + e.id} className="pointer-events-none absolute" style={{ left: e.x, top: e.y, width: e.w, height: e.h, transform: e.rot ? `rotate(${e.rot}deg)` : undefined, outline: `${2 / k}px solid #c9a227`, outlineOffset: 1 / k }}>
                                {one && !e.locked && editing !== e.id && <>
                                    {['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'].map(dir => {
                                        const s = 12 / k, pos: Record<string, any> = { left: dir.includes('w') ? -s / 2 : dir.includes('e') ? e.w - s / 2 : e.w / 2 - s / 2, top: dir.includes('n') ? -s / 2 : dir.includes('s') ? e.h - s / 2 : e.h / 2 - s / 2 };
                                        return <span key={dir} className="pointer-events-auto absolute rounded-full border-white bg-[#c9a227] shadow" style={{ ...pos, width: s, height: s, borderWidth: 2 / k, cursor: `${dir}-resize` }} onPointerDown={ev => startResize(ev, e, dir)} />;
                                    })}
                                    <span className="pointer-events-auto absolute rounded-full border-white bg-white shadow" style={{ left: e.w / 2 - 9 / k, top: -40 / k, width: 18 / k, height: 18 / k, border: `${3 / k}px solid #c9a227`, cursor: 'grab' }} title="Turn" onPointerDown={ev => startTurn(ev, e)} />
                                </>}
                            </div>))}
                        {guides.x.map((x, i) => <span key={'gx' + i} className="pointer-events-none absolute top-0 bg-fuchsia-500" style={{ left: x, width: 2 / k, height: H }} />)}
                        {guides.y.map((y, i) => <span key={'gy' + i} className="pointer-events-none absolute left-0 bg-fuchsia-500" style={{ top: y, height: 2 / k, width: W }} />)}
                        {cellEdit && (() => {
                            const e = d.elements.find(q => q.id === cellEdit.id); if (!e) return null;
                            return <textarea autoFocus className="absolute z-20 resize-none border-4 border-[#c9a227] bg-white p-1 text-black outline-none" style={{ left: cellEdit.box[0], top: cellEdit.box[1], width: cellEdit.box[2], height: Math.max(cellEdit.box[3], 60), fontSize: (e.size || 34), fontFamily: e.font }}
                                defaultValue={e.cells[cellEdit.r][cellEdit.c]} onPointerDown={ev => ev.stopPropagation()}
                                onKeyDown={ev => { if (ev.key === 'Enter' && !ev.shiftKey) { ev.preventDefault(); (ev.currentTarget as HTMLTextAreaElement).blur(); } if (ev.key === 'Escape') setCellEdit(null); }}
                                onBlur={ev => { const v = ev.currentTarget.value; const { id, r, c } = cellEdit; setCellEdit(null); if (v !== e.cells[r][c]) change(x => { x.elements.find(q => q.id === id)!.cells[r][c] = v; }); }} />;
                        })()}
                    </div>
                </div>
            </div>
            <p className="text-xs text-muted-foreground">Shift-click to pick several · Alt while dragging = no snapping · Shift while resizing a corner keeps the shape (pictures keep it by themselves) · Shift while turning = 15° steps · Ctrl+Z / Ctrl+Y · Ctrl+C / V / D · Del · arrows (Shift = 10 px).</p>
        </div>
    );
}
