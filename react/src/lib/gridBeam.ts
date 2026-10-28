// "Grid beam" on every table: a few soft gold beams travel along the table's own gridlines (rows and columns), at a steady pace (no flare where they cross).
// Drawn on one transparent canvas laid over the table (clicks pass through); it only runs while the table is on screen and the tab is visible,
// stands still for people who asked the system for reduced motion, and is not printed. A very tall table gets the canvas only around the part in view.
const SELECTOR = '.pms-react table[data-slot="table"], .pms-react table:not([class])';
const MAX_H = 1800, FPS = 30;
const SETTLE = 700;   // ms a table must keep its size before beams start
let loaded = document.readyState === 'complete';
const COLOR = '212, 175, 55';   // the PMS gold

type Beam = { vertical: boolean; line: number; pos: number; speed: number; len: number };
type Inst = { table: HTMLTableElement; canvas: HTMLCanvasElement; host: HTMLElement; vis: boolean; xs: number[]; ys: number[]; w: number; h: number; beams: Beam[]; last: number; dirty: boolean; quiet: number; armed: boolean };

const reduce = matchMedia('(prefers-reduced-motion: reduce)');
const insts = new Map<HTMLTableElement, Inst>();
let raf = 0;

function measure(it: Inst) {
    const { table, host, canvas } = it;
    const hr = host.getBoundingClientRect(), tr = table.getBoundingClientRect();
    const left = tr.left - hr.left + host.scrollLeft, top = tr.top - hr.top + host.scrollTop;
    const w = Math.round(tr.width), full = Math.round(tr.height);
    // the slice of the table that is in view when it is taller than MAX_H
    const inView = Math.max(0, Math.min(full - 1, -tr.top - 200));
    const y0 = full <= MAX_H ? 0 : Math.min(inView, full - MAX_H), h = Math.min(full, MAX_H);
    it.w = w; it.h = h;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) { canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr); }
    Object.assign(canvas.style, { left: `${left}px`, top: `${top + y0}px`, width: `${w}px`, height: `${h}px` });
    // gridlines: the bottom edge of every row in the slice, the right edge of every cell of the widest row
    const ys: number[] = [], xs: number[] = [];
    let widest: HTMLTableRowElement | undefined;
    for (const row of Array.from(table.rows)) {
        const b = row.getBoundingClientRect().bottom - tr.top - y0;
        if (b > 4 && b < h - 1) ys.push(b);
        if (!widest || row.cells.length > widest.cells.length) widest = row;
    }
    if (widest) for (const c of Array.from(widest.cells)) { const x = c.getBoundingClientRect().right - tr.left; if (x > 4 && x < w - 1) xs.push(x); }
    it.xs = xs; it.ys = ys;
    const want = Math.max(3, Math.min(10, Math.round((w * h) / 60000)));
    while (it.beams.length < want) it.beams.push(spawn(it, true));
    it.beams.length = want;
    it.dirty = false;
}

function spawn(it: Inst, scatter = false): Beam {
    const vertical = it.xs.length > 0 && (it.ys.length === 0 || Math.random() < 0.5);
    const lines = vertical ? it.xs : it.ys, span = vertical ? it.h : it.w;
    const len = 70 + Math.random() * 90;
    return { vertical, line: lines.length ? lines[Math.floor(Math.random() * lines.length)] : -1, pos: scatter ? Math.random() * span : -len, speed: 70 + Math.random() * 80, len };
}

function frame(now: number) {
    raf = 0;
    let any = false;
    for (const it of insts.values()) {
        if (!it.vis) continue;
        any = true;
        if (now - it.last < 1000 / FPS) continue;
        const dt = Math.min(0.1, (now - (it.last || now)) / 1000);
        it.last = now;
        // wait for the whole page and for the table to stop changing size (data arriving, fonts, the page jumping) before the first beam starts
        if (!loaded || now < it.quiet) { if (it.armed) { it.armed = false; it.canvas.getContext('2d')?.clearRect(0, 0, it.canvas.width, it.canvas.height); } continue; }
        if (!it.armed) { it.armed = true; it.beams = []; it.dirty = true; }
        if (it.dirty) measure(it);
        draw(it, dt);
    }
    if (any && !document.hidden && !reduce.matches) raf = requestAnimationFrame(frame);
}

function draw(it: Inst, dt: number) {
    const g = it.canvas.getContext('2d');
    if (!g) return;
    const dpr = it.canvas.width / Math.max(1, it.w);
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.clearRect(0, 0, it.w, it.h);
    g.lineCap = 'round';
    for (const b of it.beams) {
        const span = b.vertical ? it.h : it.w;
        b.pos += b.speed * dt;
        if (b.pos - b.len > span || b.line < 0) { Object.assign(b, spawn(it)); continue; }
        const a = b.pos - b.len, z = b.pos;
        const grad = b.vertical ? g.createLinearGradient(b.line, a, b.line, z) : g.createLinearGradient(a, b.line, z, b.line);
        grad.addColorStop(0, `rgba(${COLOR}, 0)`); grad.addColorStop(1, `rgba(${COLOR}, 0.95)`);
        g.strokeStyle = grad; g.shadowColor = `rgba(${COLOR}, 0.9)`; g.shadowBlur = 8; g.lineWidth = 2;
        g.beginPath();
        if (b.vertical) { g.moveTo(b.line, a); g.lineTo(b.line, z); } else { g.moveTo(a, b.line); g.lineTo(z, b.line); }
        g.stroke();
    }
}

const kick = () => { if (!raf && !document.hidden && !reduce.matches) raf = requestAnimationFrame(frame); };

const io = new IntersectionObserver(entries => {
    for (const e of entries) { const it = insts.get(e.target as HTMLTableElement); if (it) { it.vis = e.isIntersecting; if (it.vis) it.dirty = true; } }
    kick();
}, { rootMargin: '100px' });
const ro = new ResizeObserver(entries => { for (const e of entries) { const it = insts.get(e.target as HTMLTableElement); if (it) { it.dirty = true; it.quiet = performance.now() + SETTLE; } } kick(); });

function attach(table: HTMLTableElement) {
    if (insts.has(table) || table.closest('.no-beam')) return;
    const host = table.parentElement;
    if (!host) return;
    if (getComputedStyle(host).position === 'static') host.style.position = 'relative';
    const canvas = document.createElement('canvas');
    canvas.className = 'pms-beam';
    canvas.setAttribute('aria-hidden', 'true');
    host.appendChild(canvas);
    insts.set(table, { table, canvas, host, vis: false, xs: [], ys: [], w: 0, h: 0, beams: [], last: 0, dirty: true, quiet: performance.now() + SETTLE, armed: false });
    io.observe(table); ro.observe(table);
}

function detach(table: HTMLTableElement) {
    const it = insts.get(table);
    if (!it) return;
    io.unobserve(table); ro.unobserve(table); it.canvas.remove(); insts.delete(table);
}

function scan(root: ParentNode) {
    root.querySelectorAll<HTMLTableElement>(SELECTOR).forEach(attach);
    for (const t of [...insts.keys()]) if (!t.isConnected) detach(t);
}

let started = false;
export function startGridBeam() {
    if (started || typeof document === 'undefined') return;
    started = true;
    let pending = false;
    new MutationObserver(() => { if (pending) return; pending = true; setTimeout(() => { pending = false; scan(document); }, 150); })
        .observe(document.body, { childList: true, subtree: true });
    scan(document);
    // a table taller than the canvas slice follows the scroll; row heights change after fonts and data arrive
    window.addEventListener('scroll', () => { for (const it of insts.values()) if (it.vis) it.dirty = true; kick(); }, { passive: true });
    window.addEventListener('resize', () => { for (const it of insts.values()) it.dirty = true; kick(); });
    document.addEventListener('visibilitychange', kick);
    if (!loaded) window.addEventListener('load', () => { loaded = true; for (const it of insts.values()) it.quiet = performance.now() + SETTLE; kick(); });
    reduce.addEventListener?.('change', () => { if (reduce.matches) for (const it of insts.values()) it.canvas.getContext('2d')?.clearRect(0, 0, it.canvas.width, it.canvas.height); else kick(); });
}
