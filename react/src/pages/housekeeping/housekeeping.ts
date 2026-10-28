// Room cleaning priorities (moved unchanged from pms/app/views/housekeeping/view.js). The day runs 03:00 → 03:00 (as on the Check-ins page).
// Each room row of every slip is a window (core/stay.js — a delayed group's rooms leave on their own dates). For each room of Rooms & Buildings:
//   1 Turnover   someone leaves and someone arrives today → clean in the gap (shortest gap / earliest arrival first)
//   2 Get ready  someone arrives, nobody leaves today → ready before the arrival (earliest arrival first)
//   3 Check-out  someone leaves, nobody arrives today → clean after they leave (soonest next arrival first)
//   4 Stay-over  guests stay through the day → light service
import type { CoreModules } from '@/pms/types';

type Stay = Pick<CoreModules['stay'], 'rowsOf' | 'normB'>;
type Rooms = Pick<CoreModules['rooms'], 'normRoom' | 'floorOf'>;

const pad = (n: number) => String(n).padStart(2, '0');
export const ymd = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const shift = (d: string, n: number) => { const x = new Date(`${d}T12:00`); x.setDate(x.getDate() + n); return ymd(x); };
export const natural = (a: unknown, b: unknown) => String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: 'base' });
export const hm = (ms: number) => new Date(ms).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
export const dayTime = (ms: number) => new Date(ms).toLocaleString(undefined, { weekday: 'short', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
const gapTxt = (ms: number) => { const m = Math.round(ms / 60000); return m < 60 ? `${m} min` : `${Math.floor(m / 60)} h${m % 60 ? ` ${m % 60} min` : ''}`; };
export const PRIO: Record<number, string> = { 1: 'Urgent', 2: 'Check Required', 3: 'Checkout House keeping', 4: 'Daily Housekeeping' };

export type Win = { start: number; end: number; beds: number; sh: any; tour: string; delayed: boolean; building: string; room_no: string };
export type HkRow = { p: number; sortKey: number[]; bld: string; room: string; floor: string; cap: number; outs: Win[]; ins: Win[]; stays: Win[]; lastOut: number | null; firstIn: number | null; note: string };
export type BuildingIn = { name: string; rooms: { room_no: string; floor?: string; capacity?: number; active?: boolean }[] };

export function computeHousekeeping(slips: Record<string, any>[], buildings: BuildingIn[], day: string, only: string, stay: Stay, rooms: Rooms): HkRow[] {
    const from = new Date(`${day}T03:00`).getTime(), to = from + 864e5;
    // every room row window by building|room
    const win = new Map<string, Win[]>();
    for (const s of slips) {
        if (s.deleted) continue;
        for (const w of stay.rowsOf(s) as any[]) {
            if (!w.start || !w.end || w.beds <= 0) continue;
            const k = `${stay.normB(w.building)}|${rooms.normRoom(w.room_no)}`;      // the row's own building (an Exclusive row may be elsewhere)
            if (!win.has(k)) win.set(k, []);
            win.get(k)!.push({ ...w, sh: s.sh_no, tour: s.tour_name || '', delayed: w.status !== 'booked' });
        }
    }
    const rows: HkRow[] = [];
    for (const b of buildings.filter(x => !only || x.name === only)) {
        for (const r of b.rooms.filter(x => x.active !== false)) {
            const list = win.get(`${b.name}|${rooms.normRoom(r.room_no)}`) || [];
            const outs = list.filter(w => w.end >= from && w.end < to);
            const ins = list.filter(w => w.start >= from && w.start < to);
            const stays = list.filter(w => w.start < from && w.end >= to);
            if (!outs.length && !ins.length && !stays.length) continue;
            const lastOut = outs.length ? Math.max(...outs.map(w => w.end)) : null;
            const firstIn = ins.length ? Math.min(...ins.map(w => w.start)) : null;
            const next = !ins.length ? list.filter(w => w.start >= to).sort((a, c) => a.start - c.start)[0] || null : null;
            let p: number, note: string, sortKey: number[];
            if (outs.length && ins.length) {
                p = 1;
                const gap = firstIn! - lastOut!;
                note = gap > 0 ? `${gapTxt(gap)} between them` : 'arrival before the last leaves — check with the desk';
                sortKey = [Math.max(0, gap), firstIn!];
            } else if (ins.length) { p = 2; note = stays.length ? 'others staying in the room' : 'room empty until then'; sortKey = [firstIn!, 0]; }
            else if (outs.length) { p = 3; note = next ? `next arrival ${dayTime(next.start)}` : 'no one booked after'; sortKey = [next ? next.start : Infinity, lastOut!]; }
            else { p = 4; note = 'stay-over'; sortKey = [0, 0]; }
            rows.push({ p, sortKey, bld: b.name, room: String(r.room_no).trim(), floor: String(r.floor || '').trim() || rooms.floorOf(r.room_no), cap: Number(r.capacity) || 0, outs, ins, stays, lastOut, firstIn, note });
        }
    }
    rows.sort((a, c) => a.p - c.p || a.sortKey[0] - c.sortKey[0] || a.sortKey[1] - c.sortKey[1] || natural(a.bld, c.bld) || natural(a.room, c.room));
    return rows;
}

const esc = (s: unknown) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));

/** The printed page: floor by floor (building first when all buildings), then each category's room numbers on that floor. */
export function printHtml(rows: HkRow[], opts: { urgentOnly: boolean; all: boolean; buildingName: string; day: string; staffOn: (bld: string, floor: string) => string[] }) {
    const { urgentOnly, all } = opts;
    const floors = [...new Set(rows.map(r => `${r.bld}|${r.floor}`))].sort((x, y) => natural(x.split('|')[0], y.split('|')[0]) || natural(x.split('|')[1], y.split('|')[1]));
    const body = floors.map(f => {
        const [bld, floor] = f.split('|');
        const here = rows.filter(r => r.bld === bld && r.floor === floor);
        const cats = (urgentOnly ? [1] : [1, 2, 3, 4]).map(p => {
            const rs = here.filter(r => r.p === p).map(r => r.room).sort(natural);
            return rs.length ? `<tr><th>${esc(PRIO[p])}<small>${rs.length}</small></th><td><div class="rooms">${rs.map(x => `<span>${esc(x)}</span>`).join('')}</div></td></tr>` : '';
        }).join('');
        const staff = opts.staffOn(bld, floor);
        return `<section><h2>${all ? `${esc(bld)} · ` : ''}Floor ${esc(floor)}${staff.length ? ` <span class="staff">— ${staff.map(esc).join(', ')}</span>` : ''}</h2><table>${cats}</table></section>`;
    }).join('') || '<p>—</p>';
    const title = urgentOnly ? 'Urgent Room Cleaning Assignment Report' : 'Room Cleaning Assignment Report';
    return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${title}</title><style>
        @page { margin: 12mm; } body { font: 16px/1.5 Arial, Helvetica, sans-serif; color: #000; margin: 0; }
        section { break-inside: avoid; padding: 4px 0 10px; }
        h2 { font-size: 18px; margin: 8px 0 4px; } h2 .staff { font-weight: 600; }
        table { width: 100%; border-collapse: collapse; table-layout: fixed; }
        th, td { border: 1px solid #000; padding: 4px 6px; vertical-align: top; }
        th { width: 210px; text-align: left; font-size: 15px; } th small { float: right; font-weight: 400; }
        /* rooms in a fixed grid: every wrapped line lines up under the one above */
        .rooms { display: grid; grid-template-columns: repeat(auto-fill, minmax(58px, 1fr)); gap: 3px; }
        .rooms span { border: 1px solid #555; border-radius: 3px; text-align: center; font-size: 16px; font-weight: 700; padding: 1px 0; }
        .day { font-size: 20px; font-weight: 700; margin: 0 0 6px; padding-bottom: 6px; border-bottom: 2px solid #000; }
        .title { font-size: 22px; font-weight: 800; text-align: center; margin: 0 0 2px; }
        .bld { font-size: 18px; font-weight: 700; text-align: center; margin: 0 0 6px; }
        </style></head><body><h1 class="title">${title}</h1>
        <p class="bld">${all ? 'All buildings' : esc(opts.buildingName)}</p>
        <p class="day">${esc(new Date(`${opts.day}T12:00`).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }))}</p>${body}<script>window.addEventListener('load', function () { setTimeout(function () { window.focus(); window.print(); }, 200); });<\/script></body></html>`;
}

/** The same report as printHtml, drawn on a canvas (to paste as a picture): floors in order, a line per cleaning category with the rooms as boxes that wrap. */
export function reportCanvas(rows: HkRow[], opts: { urgentOnly: boolean; all: boolean; buildingName: string; day: string; staffOn: (bld: string, floor: string) => string[] }) {
    const { urgentOnly, all } = opts;
    const S = 2, W = 900, M = 20, LAB = 250, CHIP_W = 62, CHIP_H = 28, GAP = 6, PADY = 8;
    const font = (w: number, px: number) => `${w} ${px}px Arial, Helvetica, sans-serif`;
    const floors = [...new Set(rows.map(r => `${r.bld}|${r.floor}`))].sort((x, y) => natural(x.split('|')[0], y.split('|')[0]) || natural(x.split('|')[1], y.split('|')[1]));
    const perLine = Math.max(1, Math.floor((W - 2 * M - LAB - 2 * PADY + GAP) / (CHIP_W + GAP)));
    type Sec = { head: string; lines: { label: string; n: number; rooms: string[] }[] };
    const secs: Sec[] = floors.map(f => {
        const [bld, floor] = f.split('|');
        const here = rows.filter(r => r.bld === bld && r.floor === floor);
        const staff = opts.staffOn(bld, floor);
        const lines = (urgentOnly ? [1] : [1, 2, 3, 4]).map(p => { const rs = here.filter(r => r.p === p).map(r => r.room).sort(natural); return { label: PRIO[p], n: rs.length, rooms: rs }; }).filter(l => l.n);
        return { head: `${all ? `${bld} · ` : ''}Floor ${floor}${staff.length ? ` — ${staff.join(', ')}` : ''}`, lines };
    });
    const lineH = (n: number) => Math.max(1, Math.ceil(n / perLine)) * (CHIP_H + GAP) - GAP + 2 * PADY;
    const HEAD = 150, SECH = 34;
    const H = HEAD + secs.reduce((h, s) => h + SECH + s.lines.reduce((a, l) => a + lineH(l.n), 0) + 14, 0) + M;
    const cv = document.createElement('canvas');
    cv.width = W * S; cv.height = Math.max(H, HEAD + 60) * S;
    const g = cv.getContext('2d')!;
    g.scale(S, S);
    g.fillStyle = '#fff'; g.fillRect(0, 0, W, cv.height / S);
    g.fillStyle = '#000'; g.textBaseline = 'middle'; g.textAlign = 'center';
    g.font = font(800, 26); g.fillText(urgentOnly ? 'Urgent Room Cleaning Assignment Report' : 'Room Cleaning Assignment Report', W / 2, 36);
    g.font = font(700, 20); g.fillText(all ? 'All buildings' : opts.buildingName, W / 2, 70);
    g.textAlign = 'left'; g.font = font(700, 20);
    g.fillText(new Date(`${opts.day}T12:00`).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }), M, 108);
    g.fillRect(M, 126, W - 2 * M, 2);
    let y = HEAD - 6;
    if (!secs.length) { g.font = font(500, 18); g.fillText('—', M, y + 20); }
    for (const s of secs) {
        g.fillStyle = '#000'; g.font = font(800, 19); g.textAlign = 'left'; g.fillText(s.head, M, y + SECH / 2); y += SECH;
        for (const l of s.lines) {
            const h = lineH(l.n);
            g.strokeStyle = '#000'; g.lineWidth = 1; g.strokeRect(M + .5, y + .5, W - 2 * M - 1, h - 1);
            g.beginPath(); g.moveTo(M + LAB + .5, y); g.lineTo(M + LAB + .5, y + h); g.stroke();
            g.fillStyle = '#000'; g.font = font(700, 16); g.textAlign = 'left'; g.fillText(l.label, M + 8, y + h / 2);
            g.textAlign = 'right'; g.font = font(500, 14); g.fillText(String(l.n), M + LAB - 8, y + h / 2);
            l.rooms.forEach((room, i) => {
                const cx = M + LAB + PADY + (i % perLine) * (CHIP_W + GAP), cy = y + PADY + Math.floor(i / perLine) * (CHIP_H + GAP);
                g.strokeStyle = '#555'; g.strokeRect(cx + .5, cy + .5, CHIP_W - 1, CHIP_H - 1);
                g.fillStyle = '#000'; g.textAlign = 'center'; g.font = font(700, 16); g.fillText(room, cx + CHIP_W / 2, cy + CHIP_H / 2);
            });
            y += h;
        }
        y += 14;
    }
    return cv;
}
