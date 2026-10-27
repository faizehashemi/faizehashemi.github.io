import { describe, expect, it } from 'vitest';
import * as stay from '@core/stay.js';
import { paxCharts } from './paxchart';

// golden numbers: a group of 10 staying 2026-10-25 14:00 -> 2026-10-28 06:00 counts on the nights of 25, 26, 27 (at 22:00)
// and arrives on the 25th
describe('paxCharts', () => {
    const slip = { id: 1, total: 10, gents: 6, ladies: 4, checkin_date: '2026-10-25', checkin_time: '14:00', checkout_date: '2026-10-28', checkout_time: '06:00', rooms: { gents: [], ladies: [] } };
    const { count, arrivals } = paxCharts([slip], 2026, stay);
    it('counts each night at 22:00', () => {
        expect([count[9][23], count[9][24], count[9][25], count[9][26], count[9][27]]).toEqual([0, 10, 10, 10, 0]);
    });
    it('counts arrivals on the check-in day only', () => {
        expect(arrivals[9][24]).toBe(10);
        expect(arrivals.flat().reduce((a, b) => a + b, 0)).toBe(10);
    });
    it('ignores other years', () => {
        expect(paxCharts([slip], 2025, stay).count.flat().every(v => v === 0)).toBe(true);
    });
});
