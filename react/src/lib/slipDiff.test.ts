import { describe, expect, it } from 'vitest';
import { slipChanges } from './slipDiff';

describe('slipChanges', () => {
    const before = { sh_no: 1, tour_name: 'A', checkin_date: '2026-10-25', checkin_time: '14:00', checkout_date: '2026-10-26', checkout_time: '06:00', total: 10, rooms: { gents: [{ room_no: '101', assigned: 4 }], ladies: [] } };
    it('lists only what differs, as from → to', () => {
        const now = { ...before, checkout_date: '2026-10-27', total: 12 };
        expect(slipChanges(now, before)).toEqual([
            { l: 'Check-out', from: '2026-10-26 06:00', to: '2026-10-27 06:00' },
            { l: 'Total', from: '10', to: '12' },
        ]);
    });
    it('is empty when nothing differs and null without a before', () => {
        expect(slipChanges(before, before)).toEqual([]);
        expect(slipChanges(before, null)).toBeNull();
    });
});
