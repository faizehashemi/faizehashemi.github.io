import { describe, expect, it } from 'vitest';
import { buildGrid, stayLabel } from './timeline';

const H = 3600e3, D = 24 * H, T0 = Date.parse('2026-11-01T00:00:00Z');
// a tiny stand-in for core/stay.js rowsOf: one window per room row, from the slip's own times
const libs = {
    normB: (b: string) => String(b || '').trim().toUpperCase(),
    floorOf: (r: string) => r.slice(0, -2),
    rowsOf: (s: any) => ['gents', 'ladies'].flatMap(side => (s.rooms?.[side] || []).map((x: any) => ({ side, room_no: x.room_no, building: s.building, exclusive: !!x.exclusive, start: s.start, end: s.end, row: x }))),
};
const slip = (id: number, sh: string, start: number, end: number, rooms: any, extra: any = {}) => ({ id, sh_no: sh, tour_name: `TOUR ${sh}`, group_leader: `GL ${sh}`, building: 'MOHAMMEDI', start, end, total: 10, rooms, ...extra });

describe('buildGrid', () => {
    const slips = [
        slip(1, '100', T0 + 12 * H, T0 + 3 * D + 8 * H, { gents: [{ room_no: '715', assigned: 1 }], ladies: [{ room_no: '715', assigned: 2 }] }),
        slip(2, '200', T0 + D, T0 + 2 * D, { gents: [{ room_no: '715', assigned: 1 }] }),
        slip(3, '300', T0 + 4 * D, T0 + 5 * D, { gents: [{ room_no: '801', assigned: 4, exclusive: true }] }),
        slip(4, '400', T0, T0 + D, { gents: [{ room_no: '101', assigned: 2 }] }, { building: 'OTHER' }),
    ];
    const g = buildGrid({ slips, building: 'mohammedi', roomsSetUp: [{ room_no: '715', capacity: 4 }, { room_no: '716', capacity: 4 }], from: T0, to: T0 + 6 * D, stepH: 24, libs });
    it('makes day cells and every room (set up or used), in room order', () => {
        expect(g.cells).toHaveLength(6);
        expect(g.rooms.map(r => r.room)).toEqual(['715', '716', '801']);
    });
    it('joins a group\'s gents and ladies in one room into one block covering its days', () => {
        const st = g.rooms[0].lanes[0][0];
        expect(st).toMatchObject({ sh: '100', pax: 3, sides: 'GL', c0: 0, c1: 3 });
        expect(stayLabel(st)).toBe('TOUR 100 · GL 100 · 3/10 pax');
    });
    it('puts a group sharing the room at the same time on its own line and counts the peak beds', () => {
        expect(g.rooms[0].lanes).toHaveLength(2);
        expect(g.rooms[0].lanes[1][0]).toMatchObject({ sh: '200', c0: 1, c1: 1 });
        expect(g.rooms[0].peak).toBe(4);
        expect(g.rooms[0].capacity).toBe(4);
    });
    it('marks an exclusive room and leaves other buildings out', () => {
        expect(stayLabel(g.rooms[2].lanes[0][0])).toMatch(/^🔒/);
        expect(g.groups).toBe(3);
    });
    it('filters by floor and refuses too many cells', () => {
        expect(buildGrid({ slips, building: 'MOHAMMEDI', roomsSetUp: [], from: T0, to: T0 + 6 * D, stepH: 24, floor: '8', libs }).rooms.map(r => r.room)).toEqual(['801']);
        expect(buildGrid({ slips, building: 'MOHAMMEDI', roomsSetUp: [], from: T0, to: T0 + 60 * D, stepH: 1, libs }).tooMany).toBe(true);
    });
});
