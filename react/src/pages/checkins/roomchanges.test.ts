import { describe, expect, it } from 'vitest';
import { cardsOf } from './RoomChanges';

describe('Check-ins room change cards', () => {
    it('keeps only the room parts, newest first, bulk slips one card each', () => {
        const cards = cardsOf([
            { id: 1, at: '2026-11-19T08:00:00Z', desk_name: 'Desk 1', kind: 'slip-update', sh: '44001', grp: 'Alpha', text: 'Gents room 101 → 105 · check-out 22 Nov → 23 Nov', items: null },
            { id: 2, at: '2026-11-19T09:00:00Z', desk_name: 'Desk 2', kind: 'slip-update', sh: '44002', grp: 'Beta', text: 'guests 4 → 6', items: null },
            { id: 3, at: '2026-11-19T10:00:00Z', desk_name: 'Desk 3', kind: 'bulk:ums-import', sh: '', grp: '', text: '2 changed', items: [{ sh: '44003', grp: 'G', text: 'rooms assigned: Gents 201' }, { sh: '44004', grp: 'H', text: 'check-in 1 Nov → 2 Nov' }] },
        ]);
        expect(cards.map(c => [c.key, c.sh, c.text, c.via])).toEqual([['3:0', '44003', 'rooms assigned: Gents 201', 'ums-import'], ['1', '44001', 'Gents room 101 → 105', '']]);
    });
});
