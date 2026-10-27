// Room Timeline canvas: one row per SH, the stays of one room as bars over time, a TOTAL row of beds per bucket. Pan (drag / one finger), zoom (wheel /
// pinch), double-click centres on now. Moved from pms/app/views/timeline/view.js (same drawing and interactions); the page owns the data and the toolbar.
export type Ev = { sh_no: string; start: Date; end: Date; assigned: number; block: number; excl: boolean };

const ROW_H = 36, HDR_H = 48, GUTTER = 150, MIN_PX_HR = 20, MAX_PX_HR = 600;
// the PMS cream / gold / brown palette (the legacy page took these from its CSS variables)
const C = { ink: '#2b1e15', muted: '#6b5e4a', card: '#fffaf1', border: '#dcc7a4', hdrBg: '#f3e6ca', vacant: '#fffdf5', rowAlt: '#fff9ec', occupied: '#e8c765', occupied2: '#d7b047' };

export class TimelineChart {
    private ctx: CanvasRenderingContext2D;
    private pxPerHr = 80;
    viewStart: Date | null = null; viewEnd: Date | null = null;
    private events: Ev[] = []; private shs: string[] = []; private hit: { x: number; y: number; w: number; h: number; data: Ev }[] = [];
    private gran = 1; private quant = 3600000;
    private ready = false;
    onInfo: (zoom: string, range: string) => void = () => { };
    onTip: (html: string | null, x: number, y: number) => void = () => { };
    private cleanup: (() => void)[] = [];

    constructor(private canvas: HTMLCanvasElement, private stage: HTMLElement) {
        this.ctx = canvas.getContext('2d')!;
    }

    qFloor = (d: Date) => new Date(Math.floor(+d / this.quant) * this.quant);
    qCeil = (d: Date) => new Date(Math.ceil(+d / this.quant) * this.quant);
    private fmt = (d: Date) => this.qFloor(d).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit' });
    private dur = (a: Date, b: Date) => { const ms = +b - +a; const h = Math.floor(ms / 36e5), m = Math.round((ms % 36e5) / 6e4); return `${h}h ${String(m).padStart(2, '0')}m`; };
    private t2x = (t: number) => GUTTER + ((t - +this.viewStart!) / 36e5) * this.pxPerHr;
    private x2t = (x: number) => new Date(+this.viewStart! + ((x - GUTTER) / this.pxPerHr) * 36e5);

    setGranularity(hours: number) {
        this.gran = Math.max(1, Math.min(24, Number(hours) || 1));
        this.quant = this.gran * 3600000;
        if (this.viewStart && this.viewEnd) { this.viewStart = this.qFloor(this.viewStart); this.viewEnd = this.qCeil(this.viewEnd); this.draw(); }
    }

    /** the first draw of a query: window, events, fit to the stage */
    show(events: Ev[], start: Date, end: Date) {
        this.viewStart = this.qFloor(start); this.viewEnd = this.qCeil(end);
        this.events = events.filter(ev => +ev.end > +this.viewStart! && +ev.start < +this.viewEnd!).sort((a, b) => +a.start - +b.start);
        this.shs = Array.from(new Set(this.events.map(e => String(e.sh_no)))).sort();
        this.prepare();
        const spanH = (+this.viewEnd - +this.viewStart) / 36e5;
        this.pxPerHr = Math.min(MAX_PX_HR, Math.max(MIN_PX_HR, (this.stage.clientWidth - GUTTER) / Math.max(1e-6, spanH)));
        this.draw();
    }
    get rows() { return this.shs.length; }

    private size = () => {
        const dpr = Math.max(1, window.devicePixelRatio || 1);
        const w = this.stage.clientWidth, h = this.stage.clientHeight;
        if (w <= 0 || h <= 0) return;
        this.canvas.width = Math.floor(w * dpr); this.canvas.height = Math.floor(h * dpr);
        this.canvas.style.width = w + 'px'; this.canvas.style.height = h + 'px';
        this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        if (this.viewStart) this.draw();
    };

    private prepare() {
        if (this.ready) return;
        this.ready = true;
        this.size();
        const on = (t: EventTarget, ev: string, fn: any, opts?: any) => { t.addEventListener(ev, fn, opts); this.cleanup.push(() => t.removeEventListener(ev, fn)); };
        on(window, 'resize', this.size);
        const cv = this.canvas;
        let panning = false, panStartX = 0, panStartVS: Date | null = null;
        const pan = (clientX: number) => {
            const hrs = -(clientX - panStartX) / this.pxPerHr, span = +this.viewEnd! - +panStartVS!;
            this.viewStart = new Date(+panStartVS! + hrs * 36e5); this.viewEnd = new Date(+this.viewStart + span); this.draw();
        };
        on(cv, 'mousedown', (e: MouseEvent) => { panning = true; panStartX = e.clientX; panStartVS = new Date(this.viewStart!); });
        on(window, 'mouseup', () => { panning = false; });
        on(window, 'mousemove', (e: MouseEvent) => { if (panning) pan(e.clientX); this.hover(e.clientX, e.clientY); });
        on(cv, 'wheel', (e: WheelEvent) => { e.preventDefault(); this.zoomAt(e.clientX - cv.getBoundingClientRect().left, Math.sign(e.deltaY), Math.abs(e.deltaY)); }, { passive: false });
        on(cv, 'dblclick', () => this.centerOnNow());
        let lastDist: number | null = null;
        on(cv, 'touchstart', (e: TouchEvent) => { if (e.touches.length === 1) { panning = true; panStartX = e.touches[0].clientX; panStartVS = new Date(this.viewStart!); } lastDist = null; }, { passive: true });
        on(cv, 'touchmove', (e: TouchEvent) => {
            if (e.touches.length === 1 && panning) { pan(e.touches[0].clientX); return; }
            if (e.touches.length === 2) {
                e.preventDefault();
                const [a, b] = [e.touches[0], e.touches[1]];
                const dist = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY), cx = (a.clientX + b.clientX) / 2;
                if (lastDist !== null) this.pinchAt(cx - cv.getBoundingClientRect().left, dist / lastDist);
                lastDist = dist;
            }
        }, { passive: false });
        on(window, 'touchend', () => { panning = false; lastDist = null; }, { passive: true });
    }
    destroy() { this.cleanup.forEach(f => f()); this.cleanup = []; this.ready = false; }

    draw() {
        if (!this.viewStart || !this.viewEnd) return;
        const ctx = this.ctx, w = this.stage.clientWidth, h = this.stage.clientHeight;
        if (w <= 0 || h <= 0) return;
        const viewStart = this.viewStart, viewEnd = this.viewEnd;
        this.hit = []; ctx.clearRect(0, 0, w, h);
        ctx.fillStyle = C.card; ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = C.hdrBg; ctx.fillRect(0, 0, GUTTER, h);
        ctx.fillStyle = C.hdrBg; ctx.fillRect(GUTTER, 0, w - GUTTER, HDR_H);

        // time grid (respect the granularity)
        const steps = [1, 2, 3, 6, 12, 24].filter(hh => hh >= this.gran);
        let step = steps[0];
        for (const s of steps) { if (s * this.pxPerHr >= 120) { step = s; break; } step = s; }
        const stepMs = step * 3600000, startMs = +viewStart, endMs = +viewEnd, firstMs = Math.ceil(startMs / stepMs) * stepMs;
        ctx.font = '12px system-ui,-apple-system,Segoe UI,Roboto'; ctx.textBaseline = 'top'; ctx.fillStyle = C.muted; ctx.strokeStyle = C.border;
        for (let tms = firstMs; tms <= endMs; tms += stepMs) {
            const t = new Date(tms), x = this.t2x(tms);
            ctx.beginPath(); ctx.moveTo(x + .5, HDR_H); ctx.lineTo(x + .5, h); ctx.stroke();
            const label = step >= 24 ? t.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }) : t.toLocaleTimeString(undefined, { hour: '2-digit' }) + ' ' + t.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
            ctx.fillText(label, x + 6, 16);
        }
        // now line
        const now = new Date();
        if (+now >= startMs && +now <= endMs) { const xn = this.t2x(+now); ctx.strokeStyle = '#1a73e8'; ctx.setLineDash([6, 4]); ctx.beginPath(); ctx.moveTo(xn + .5, HDR_H); ctx.lineTo(xn + .5, h); ctx.stroke(); ctx.setLineDash([]); }

        // rows
        ctx.font = '13px system-ui,-apple-system,Segoe UI,Roboto'; ctx.textBaseline = 'middle';
        for (let i = 0; i < this.shs.length; i++) {
            const y = HDR_H + i * ROW_H;
            ctx.fillStyle = i % 2 ? C.vacant : C.rowAlt; ctx.fillRect(GUTTER, y, w - GUTTER, ROW_H);
            ctx.strokeStyle = C.border; ctx.beginPath(); ctx.moveTo(GUTTER, y + ROW_H + .5); ctx.lineTo(w, y + ROW_H + .5); ctx.stroke();
            ctx.fillStyle = C.ink; ctx.fillText(this.shs[i], 12, y + ROW_H / 2);
        }
        // bars per SH
        const cols = [C.occupied, C.occupied2];
        this.shs.forEach((sh, idx) => { const y = HDR_H + idx * ROW_H + 4; const blocks = this.events.filter(e => String(e.sh_no) === String(sh)); blocks.forEach((b, j) => this.block(b, y, cols[j % cols.length])); });

        // totals footer row (per granularity bucket)
        const g = this.quant, firstBucket = Math.ceil(+viewStart / g) * g, lastBucket = Math.floor(+viewEnd / g) * g;
        const totals: { tms: number; sum: number }[] = [];
        for (let tms = firstBucket; tms < lastBucket; tms += g) {
            let sum = 0;
            for (const ev of this.events) { const s = Math.max(+ev.start, tms), e = Math.min(+ev.end, tms + g); if (e > s) sum += Number(ev.block || ev.assigned || 1); }   // beds kept (the whole room for an Exclusive row)
            totals.push({ tms, sum });
        }
        const footerH = 28, footerY = HDR_H + this.shs.length * ROW_H;
        ctx.fillStyle = C.rowAlt; ctx.fillRect(GUTTER, footerY, w - GUTTER, footerH);
        ctx.strokeStyle = C.border; ctx.beginPath(); ctx.moveTo(GUTTER, footerY + .5); ctx.lineTo(w, footerY + .5); ctx.stroke();
        ctx.fillStyle = C.ink; ctx.fillText('TOTAL', 12, footerY + footerH / 2);
        for (const { tms, sum } of totals) {
            const x1 = this.t2x(tms), x2 = this.t2x(tms + g), bw = Math.max(1, x2 - x1 - 1);
            ctx.fillStyle = C.occupied2; ctx.globalAlpha = Math.min(1, 0.15 + sum * 0.08); ctx.fillRect(x1, footerY + 4, bw, footerH - 8); ctx.globalAlpha = 1;
            if (bw >= 22) { ctx.fillStyle = C.ink; ctx.textAlign = 'center'; ctx.fillText(String(sum), x1 + bw / 2, footerY + footerH / 2); ctx.textAlign = 'left'; }
        }
        const hours = (+viewEnd - +viewStart) / 36e5, zoomPct = Math.round((this.pxPerHr - MIN_PX_HR) / (MAX_PX_HR - MIN_PX_HR) * 100);
        this.onInfo(`Zoom ${Math.min(100, Math.max(0, zoomPct))}%`, `${this.fmt(viewStart)} → ${this.fmt(viewEnd)} (${hours.toFixed(1)}h)`);
    }

    private block(b: Ev, y: number, color: string) {
        let s = new Date(Math.max(+b.start, +this.viewStart!)), e = new Date(Math.min(+b.end, +this.viewEnd!));
        s = this.qCeil(s); e = this.qFloor(e);
        if (+e <= +s) return;
        const x1 = this.t2x(+s), x2 = this.t2x(+e), w = Math.max(1, x2 - x1), ctx = this.ctx;
        ctx.fillStyle = color; ctx.globalAlpha = .95; ctx.fillRect(x1, y, w, ROW_H - 8);
        ctx.globalAlpha = 1; ctx.strokeStyle = '#caa954'; ctx.strokeRect(x1 + .5, y + .5, w - 1, ROW_H - 9);
        this.hit.push({ x: x1, y, w, h: ROW_H - 8, data: b });
    }

    private hover(clientX: number, clientY: number) {
        if (!this.ready) return;
        const r = this.canvas.getBoundingClientRect(), mx = clientX - r.left, my = clientY - r.top;
        const hit = this.hit.find(h => mx >= h.x && mx <= h.x + h.w && my >= h.y && my <= h.y + h.h);
        if (!hit) { this.onTip(null, 0, 0); return; }
        const d = hit.data;
        this.onTip(`<b>SH ${String(d.sh_no).replace(/[&<>"']/g, '')}</b><br>${this.fmt(d.start)} → ${this.fmt(d.end)}<br>Assigned: ${d.assigned ?? 1}${d.excl ? ` · Exclusive (${d.block} beds kept)` : ''}<br>${this.dur(d.start, d.end)}`, clientX + 12, clientY + 12);
    }

    private refit(focus: Date) {
        const frac = (+focus - +this.viewStart!) / (+this.viewEnd! - +this.viewStart!);
        let newSpan = ((this.stage.clientWidth - GUTTER) / this.pxPerHr) * 36e5;
        newSpan = Math.max(this.quant, Math.round(newSpan / this.quant) * this.quant);
        this.viewStart = this.qFloor(new Date(+focus - frac * newSpan)); this.viewEnd = this.qCeil(new Date(+this.viewStart + newSpan)); this.draw();
    }
    private zoomAt(localX: number, sign: number, abs: number) {
        const focus = this.x2t(localX), factor = 1 + (abs > 40 ? .2 : .1);
        this.pxPerHr = sign < 0 ? Math.min(MAX_PX_HR, this.pxPerHr * factor) : Math.max(MIN_PX_HR, this.pxPerHr / factor);
        this.refit(focus);
    }
    private pinchAt(localX: number, scale: number) {
        const focus = this.x2t(localX), old = this.pxPerHr;
        this.pxPerHr = Math.min(MAX_PX_HR, Math.max(MIN_PX_HR, this.pxPerHr * scale));
        if (this.pxPerHr !== old) this.refit(focus);
    }
    centerOnNow() {
        if (!this.viewStart || !this.viewEnd) return;
        const now = new Date(), span = +this.viewEnd - +this.viewStart;
        this.viewStart = this.qFloor(new Date(+now - span / 2)); this.viewEnd = this.qCeil(new Date(+now + span / 2)); this.draw();
    }
}
