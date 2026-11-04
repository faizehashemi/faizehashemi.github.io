import { describe, expect, it } from 'vitest';
import type { Model } from './occupancy';
import { dateRanges, vacancyByDate, vacancyByDateHtml, vacancyByRoom, vacancyByRoomHtml } from './vacancy';

const days = ['2026-11-04', '2026-11-05', '2026-11-06', '2026-11-07'];
const room = (no: string, cap: number, used: number[], off = false) => ({ no, key: no, floor: no[0], cap, used, ...(off ? { off } : {}) });
const m = {
    days, cut: false,
    blds: [
        { name: 'RUBAT', rooms: [room('101', 4, [0, 0, 2, 0]), room('102', 3, [1, 3, 3, 3]), room('103', 2, [0, 0, 0, 0]), room('999', 0, [0, 0, 0, 0], true)] },
        { name: 'ONARA', rooms: [room('201', 5, [5, 0, 5, 5])] },
    ],
} as unknown as Model;

describe('vacancy reports', () => {
    it('by date: the rooms with nobody in them each night (a part-full room is not empty, a room outside Rooms & Buildings is left out)', () => {
        const r = vacancyByDate(m);
        expect(r[0]).toMatchObject({ rooms: 2, beds: 6, blds: [{ name: 'RUBAT', rooms: ['101', '103'], beds: 6 }, { name: 'ONARA', rooms: [], beds: 0 }] });
        expect(r[1]).toMatchObject({ rooms: 3, beds: 11 });
        expect(r[2]).toMatchObject({ rooms: 1, beds: 2 });
    });
    it('by room: only rooms empty at least one night, with their dates', () => {
        expect(vacancyByRoom(m).map(r => [r.building, r.room, r.days.length])).toEqual([['RUBAT', '101', 3], ['RUBAT', '103', 4], ['ONARA', '201', 1]]);
    });
    it('writes consecutive dates as ranges', () => {
        expect(dateRanges(['2026-11-04', '2026-11-05', '2026-11-07'], days)).toBe('04 Nov – 05 Nov, 07 Nov');
    });
    it('prints totals', () => {
        expect(vacancyByDateHtml(m, 'Medina')).toContain('<td class="n">8</td><td class="n">25</td>');   // 2+3+1+2 room-nights, 6+11+2+6 bed-nights
        const html = vacancyByRoomHtml(m, 'Medina');
        expect(html).toContain('Every night');
        expect(html).toContain('Total: 3 rooms empty at least one night</td><td class="n">8</td>');
    });
});
