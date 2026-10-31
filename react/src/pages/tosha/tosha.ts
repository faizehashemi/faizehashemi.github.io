// Tosha summary: travel refreshments for the buses of a day, from the Transport day lists — the same buses as the Bus sheets' Print summary.
// Moved from pms/app/views/tosha/view.js (the numbers and the picture are unchanged).
//   Madina  — each bus's pax + 2; preparation time (default 6:30 AM); Biryani or Burger; Tosha packet (default on)
//   Airport — buses by departure time, each pax + 2; per bus Tosha packet (default on) and Burger (optional)
//   Atraaf  — the summary only
import type { CoreModules } from '@/pms/types';

type T = CoreModules['transport'];
export const EXTRA = 2;  // + per bus (driver and helper)
// a bus carries a driver and a helper (+2), a train none, a car only a driver when ticked (+1)
export const isTrain = (b: any) => b.vehicle === 'other' && /^\s*train\s*$/i.test(String(b.vlabel || ''));
export const extraOf = (b: any, ch?: Choice) => b.vehicle === 'car' ? (ch?.buses[busKey(b)]?.driver ? 1 : 0) : isTrain(b) ? 0 : EXTRA;
export const DEF_MADINA = { time: '06:30', biryani: false, burger: false, packet: true };
export const DEF_BUS = { packet: true, burger: false, driver: false };
export type Choice = { madina: typeof DEF_MADINA; buses: Record<string, { packet?: boolean; burger?: boolean; driver?: boolean }> };
export const choiceOf = (raw: any): Choice => ({ madina: { ...DEF_MADINA, ...(raw?.madina || {}) }, buses: raw?.buses || {} });
export const busKey = (b: any) => b.rows[0].key as string;
export const plural = (n: number, one: string, many = one + 's') => `${n} ${n === 1 ? one : many}`;
export const leaders = (b: any): string[] => b.rows.map((r: any) => r.leader).filter(Boolean);

export type Model = { title: string; sub: string; notes: string[]; head: string[]; widths: number[]; align?: (string | undefined)[]; rows: { cells: (string | number)[]; slot?: boolean }[]; foot?: (string | number)[]; chips: string[] };

export function toolkit(t: T) {
    const fleet = (buses: any[]) => t.fleetText(buses, 'no buses');
    const vno = (b: any) => t.vehicleNo(b.bus, b.vehicle, b.vlabel);
    const vlabel = (b: any) => `${t.VEHICLES[b.vehicle as 'bus' | 'car' | 'other'].icon} ${vno(b) || '—'}`;
    const busChoice = (ch: Choice, b: any) => ({ ...DEF_BUS, ...(ch.buses[busKey(b)] || {}) });
    return { fleet, vno, vlabel, busChoice };
}

/* ------------------------------ card models ------------------------------ */

export function madinaModel(t: T, day: string, g: any, ch: Choice, LONG: any) {
    const { fleet, vno } = toolkit(t);
    const buses = [...g.buses].sort((a: any, b: any) => a.at.localeCompare(b.at));
    const c = ch.madina;
    const pax = buses.reduce((s: number, b: any) => s + b.pax, 0), extra = buses.reduce((s: number, b: any) => s + extraOf(b, ch), 0), total = pax + extra;
    const meal = c.biryani ? 'Biryani' : c.burger ? 'Burger' : '';
    const model: Model = {
        title: `${LONG.label} · TOSHA`, sub: `${t.sheetDate(day)} · ${fleet(buses)}`,
        notes: [`Preparation time: ${t.time12(`2000-01-01T${c.time || '06:30'}`)}`, `Prepare: ${[c.packet && 'Tosha packet', meal].filter(Boolean).join(' + ') || '—'}`],
        head: ['Bus', 'Time', 'From', 'Groups', 'Pax', '+', 'Total'], widths: [12, 12, 15, 33, 9, 7, 12], align: [undefined, undefined, undefined, undefined, 'right', 'right', 'right'],
        rows: buses.map((b: any) => ({ cells: [vno(b) || '—', t.time12(b.at), b.building || '', leaders(b).join(', '), b.pax, extraOf(b, ch) ? `+${extraOf(b, ch)}` : '', b.pax + extraOf(b, ch)] })),
        foot: ['Total', '', '', plural(g.groups, 'group'), pax, extra ? `+${extra}` : '', total],
        chips: [c.packet && `Tosha packets: ${total}`, meal && `${meal}: ${total}`].filter(Boolean) as string[],
    };
    return { model, buses, pax, extra, total, meal };
}

export function airportModel(t: T, day: string, g: any, D: any, ch: Choice) {
    const { fleet, vno, busChoice } = toolkit(t);
    const buses = [...g.buses].sort((a: any, b: any) => a.at.localeCompare(b.at) || (a.bus ?? 0) - (b.bus ?? 0));
    const slots = new Map<string, any[]>();
    for (const b of buses) { const k = b.at.slice(11, 16); if (!slots.has(k)) slots.set(k, []); slots.get(k)!.push(b); }
    const pax = buses.reduce((s: number, b: any) => s + b.pax, 0), extra = buses.reduce((s: number, b: any) => s + extraOf(b, ch), 0), total = pax + extra;
    const packets = buses.reduce((s: number, b: any) => s + (busChoice(ch, b).packet ? b.pax + extraOf(b, ch) : 0), 0);
    const burgers = buses.reduce((s: number, b: any) => s + (busChoice(ch, b).burger ? b.pax + extraOf(b, ch) : 0), 0);
    const rows: Model['rows'] = [];
    for (const [hm, list] of slots) {
        const sp = list.reduce((s, b) => s + b.pax, 0), se = list.reduce((s, b) => s + extraOf(b, ch), 0);
        rows.push({ slot: true, cells: [t.time12(`2000-01-01T${hm}`), fleet(list), '', sp, se ? `+${se}` : '', sp + se, '', ''] });
        for (const b of list) {
            const c = busChoice(ch, b);
            rows.push({ cells: [`   ${vno(b) || '—'}`, b.building || '', leaders(b).join(', '), b.pax, extraOf(b, ch) ? `+${extraOf(b, ch)}` : '', b.pax + extraOf(b, ch), c.packet ? '✓' : '', c.burger ? '✓' : ''] });
        }
    }
    const model: Model = {
        title: `${D.label} · TOSHA`, sub: `${t.sheetDate(day)} · ${fleet(buses)}`, notes: [],
        head: ['Time / Bus', 'From', 'Groups', 'Pax', '+', 'Total', 'Tosha', 'Burger'], widths: [20, 12, 30, 8, 6, 9, 7, 8],
        align: [undefined, undefined, undefined, 'right', 'right', 'right', 'center', 'center'], rows,
        foot: ['Total', '', plural(g.groups, 'group'), pax, extra ? `+${extra}` : '', total, packets, burgers || ''],
        chips: [`Tosha packets: ${packets}`, burgers && `Burgers: ${burgers}`].filter(Boolean) as string[],
    };
    return { model, buses, slots, pax, extra, total, packets, burgers };
}

export function atraafModel(t: T, day: string, g: any, D: any) {
    const { fleet, vno } = toolkit(t);
    const buses = [...g.buses].sort((a: any, b: any) => a.at.localeCompare(b.at) || (a.bus ?? 0) - (b.bus ?? 0));
    const model: Model = {
        title: D.label, sub: `${t.sheetDate(day)} · ${fleet(buses)}`, notes: [],
        head: ['Bus', 'Time', 'From', 'Groups', 'Pax'], widths: [12, 13, 15, 48, 12], align: [undefined, undefined, undefined, undefined, 'right'],
        rows: buses.map((b: any) => ({ cells: [vno(b) || '—', t.time12(b.at), b.building || '', leaders(b).join(', '), b.pax] })),
        foot: ['Total', '', '', plural(g.groups, 'group'), g.pax], chips: [],
    };
    return { model, buses };
}

/* ------------------------------ image (canvas) ------------------------------ */

export function drawImage(m: Model): HTMLCanvasElement {
    const W = 1100, P = 22, BAND = 70, HEAD = 38, ROW = 36, scale = 2;
    const notesH = m.notes.length ? m.notes.length * 28 + 14 : 0;
    const chipsH = m.chips.length ? 56 : 0;
    const H = P + BAND + notesH + HEAD + Math.max(1, m.rows.length) * ROW + (m.foot ? ROW : 0) + chipsH + P;
    const c = document.createElement('canvas');
    c.width = W * scale; c.height = H * scale;
    const g = c.getContext('2d')!;
    g.scale(scale, scale);
    g.fillStyle = '#fff9e6'; g.fillRect(0, 0, W, H);
    // band
    let y = P;
    g.fillStyle = '#f1c232'; g.fillRect(P, y, W - 2 * P, BAND);
    g.fillStyle = '#fff'; g.textBaseline = 'middle';
    g.font = '900 32px "Arial Black", Arial, sans-serif'; g.fillText(m.title, P + 18, y + BAND / 2);
    g.font = '700 20px Arial, sans-serif'; g.textAlign = 'right'; g.fillText(m.sub, W - P - 18, y + BAND / 2); g.textAlign = 'left';
    y += BAND;
    // notes (preparation time, meal…)
    if (m.notes.length) {
        y += 10;
        g.fillStyle = '#3d3100'; g.font = '700 20px Arial, sans-serif';
        for (const n of m.notes) { g.fillText(n, P + 6, y + 13); y += 28; }
        y += 4;
    }
    // table
    const total = m.widths.reduce((a, b) => a + b, 0), TW = W - 2 * P;
    const xs: number[] = []; let x = P;
    for (const w of m.widths) { xs.push(x); x += (w / total) * TW; }
    const cell = (text: unknown, i: number, top: number, h: number, font: string, color: string) => {
        const w = (m.widths[i] / total) * TW;
        g.font = font; g.fillStyle = color;
        let s = String(text ?? '');
        while (s.length > 1 && g.measureText(s).width > w - 14) s = s.slice(0, -2) + '…';
        g.textAlign = m.align?.[i] === 'right' ? 'right' : m.align?.[i] === 'center' ? 'center' : 'left';
        const tx = g.textAlign === 'right' ? xs[i] + w - 8 : g.textAlign === 'center' ? xs[i] + w / 2 : xs[i] + 8;
        g.fillText(s, tx, top + h / 2);
        g.textAlign = 'left';
    };
    const line = (top: number, h: number, fill: string) => {
        g.fillStyle = fill; g.fillRect(P, top, TW, h);
        g.strokeStyle = '#c9a227'; g.lineWidth = 1;
        g.strokeRect(P + .5, top + .5, TW - 1, h - 1);
        for (const xx of xs.slice(1)) { g.beginPath(); g.moveTo(xx + .5, top); g.lineTo(xx + .5, top + h); g.stroke(); }
    };
    line(y, HEAD, '#ffd966');
    m.head.forEach((s, i) => cell(s, i, y, HEAD, '900 15px "Arial Black", Arial, sans-serif', '#3d3100'));
    y += HEAD;
    if (!m.rows.length) { line(y, ROW, '#fff2cc'); g.font = '600 17px Arial'; g.fillStyle = '#3d3226'; g.fillText('No buses', P + 10, y + ROW / 2); y += ROW; }
    for (const r of m.rows) {
        line(y, ROW, r.slot ? '#ffe8a3' : '#fff2cc');
        r.cells.forEach((s, i) => cell(s, i, y, ROW, r.slot ? '800 17px Arial, sans-serif' : '700 17px Arial, sans-serif', '#1f1600'));
        y += ROW;
    }
    if (m.foot) {
        line(y, ROW, '#ffffff');
        m.foot.forEach((s, i) => cell(s, i, y, ROW, '900 18px Arial, sans-serif', '#000'));
        y += ROW;
    }
    // totals to prepare
    if (m.chips.length) {
        y += 12;
        g.font = '800 19px Arial, sans-serif';
        let cx = P;
        for (const s of m.chips) {
            const w = g.measureText(s).width + 28;
            g.fillStyle = '#fff3d1'; g.strokeStyle = '#d4af37';
            g.beginPath(); g.roundRect(cx, y, w, 36, 18); g.fill(); g.stroke();
            g.fillStyle = '#3d3100'; g.fillText(s, cx + 14, y + 18);
            cx += w + 10;
        }
    }
    return c;
}

export const blobOf = (canvas: HTMLCanvasElement) => new Promise<Blob | null>(res => canvas.toBlob(res, 'image/png'));
// the same PNG made at once (no await), so Share still counts as part of the tap
export function blobNow(canvas: HTMLCanvasElement) {
    const bin = atob(canvas.toDataURL('image/png').split(',')[1]);
    const u = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
    return new Blob([u], { type: 'image/png' });
}

// all the day's cards in one picture, one under the other, under a heading
export function drawAll(models: Model[], heading: string) {
    const parts = models.map(drawImage);
    const W = parts[0].width, HEAD = 120, GAP = 10;
    const c = document.createElement('canvas');
    c.width = W; c.height = HEAD + parts.reduce((s, p) => s + p.height + GAP, 0);
    const g = c.getContext('2d')!;
    g.fillStyle = '#fff9e6'; g.fillRect(0, 0, c.width, c.height);
    g.fillStyle = '#7a5410'; g.fillRect(44, 36, W - 88, HEAD - 44);
    g.fillStyle = '#fff'; g.textBaseline = 'middle';
    g.font = '900 52px "Arial Black", Arial, sans-serif'; g.fillText(heading, 80, 36 + (HEAD - 44) / 2);
    let y = HEAD;
    for (const p of parts) { g.drawImage(p, 0, y); y += p.height + GAP; }
    return c;
}
