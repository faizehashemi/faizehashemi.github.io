// Pax Counts Chart numbers. Same rules as the legacy page (pms/app/views/paxchart/view.js):
//   count    guests staying each night, counted at 22:00 (a delayed group's rooms leave on their own — core/stay.js paxAt)
//   arrivals guests checking in each day
import type { CoreModules } from '@/pms/types';

export const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const num = (v: unknown) => { const x = Number(v); return Number.isFinite(x) ? x : 0; };

type Slip = Record<string, any>;
export const hasRooms = (r: Slip) => ['gents', 'ladies'].some(s => (r.rooms?.[s] || []).some((x: any) => String(x.room_no || '').trim()));
export const guests = (r: Slip) => num(r.total) || (num(r.gents) + num(r.ladies) + num(r.children) + num(r.infants));

export type Grid = number[][];   // [month 0-11][day 0-30]

export function paxCharts(slips: Slip[], year: number, stay: Pick<CoreModules['stay'], 'paxAt' | 'slipStart' | 'slipEnd'>): { count: Grid; arrivals: Grid } {
    const count: Grid = MONTHS.map(() => new Array(31).fill(0));
    const arrivals: Grid = MONTHS.map(() => new Array(31).fill(0));
    const y0 = new Date(year, 0, 1).getTime(), y1 = new Date(year + 1, 0, 1).getTime();
    for (const r of slips) {
        const ci = stay.slipStart(r), co = stay.slipEnd(r);
        if (!ci || !co || co <= ci) continue;
        const a = new Date(ci);
        if (ci >= y0 && ci < y1) arrivals[a.getMonth()][a.getDate() - 1] += guests(r);
        if (co <= y0 || ci >= y1) continue;
        // each night of the stay inside the year, counted at 22:00
        const d = new Date(Math.max(ci, y0)); d.setHours(22, 0, 0, 0);
        if (d.getTime() < ci) d.setDate(d.getDate() + 1);
        for (; d.getTime() < Math.min(co, y1); d.setDate(d.getDate() + 1)) {
            const p = stay.paxAt(r, d.getTime()).total;
            if (p) count[d.getMonth()][d.getDate() - 1] += p;
        }
    }
    return { count, arrivals };
}
