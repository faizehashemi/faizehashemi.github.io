import { describe, expect, it } from 'vitest';
import { computeByBuilding } from '@core/meals.js';

const ranges = { B: { start: '04:00', end: '09:30' }, L: { start: '11:00', end: '16:00' }, D: { start: '18:00', end: '23:00' } };
const slip = (building: string, gents: number, extra = {}) => ({ building, gents, ladies: 0, children: 0, infants: 0, total: gents, checkin_date: '2026-11-01', checkin_time: '12:00', checkout_date: '2026-11-08', checkout_time: '12:00', rooms: {}, ...extra });

describe('computeByBuilding', () => {
    it('counts guests with no building apart: not in the rows or totals, not lost', () => {
        const s = computeByBuilding([slip('RUBAT', 16), slip('', 9), slip('', 5, { deleted: true })], '2026-11-04', ranges, 8, true, true, true) as any;
        expect(s.rows.map((r: any) => [r.building, r.bp])).toEqual([['RUBAT', 16]]);
        expect(s.totals.tBP).toBe(16);
        expect(s.unassigned).toMatchObject({ bp: 9, lp: 9, dp: 9, bt: 2, thal: 8 });
    });
    it('has nothing to show when every slip has a building', () => {
        expect((computeByBuilding([slip('RUBAT', 4)], '2026-11-04', ranges, 8, true, true, true) as any).unassigned).toBe(null);
    });
});
