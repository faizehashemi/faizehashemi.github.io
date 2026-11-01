import { describe, expect, it } from 'vitest';
import { MAX_LANES, buildGrid, peakBeds, splitText, stayLabel } from './timeline';

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
        expect(st).toMatchObject({ sh: '100', pax: 3, sides: 'GL', s0: 0, s1: 3 });
        expect(stayLabel(st)).toBe('TOUR 100 · GL 100 · 3/10 pax');
    });
    it('opens a second line only for a real overlap, and counts the peak beds from the times', () => {
        expect(g.rooms[0].lanes).toHaveLength(2);
        expect(g.rooms[0].lanes[1][0]).toMatchObject({ sh: '200' });
        expect(g.rooms[0].peak).toBe(4);
    });
    it('marks an exclusive room and leaves other buildings out', () => {
        expect(stayLabel(g.rooms[2].lanes[0][0])).toMatch(/^🔒 /);
        expect(g.groups).toBe(3);
    });
    it('filters by floor and refuses too many cells', () => {
        expect(buildGrid({ slips, building: 'MOHAMMEDI', roomsSetUp: [], from: T0, to: T0 + 6 * D, stepH: 24, floor: '8', libs }).rooms.map(r => r.room)).toEqual(['801']);
        expect(buildGrid({ slips, building: 'MOHAMMEDI', roomsSetUp: [], from: T0, to: T0 + 60 * D, stepH: 1, libs }).tooMany).toBe(true);
    });
});

describe('a check-out and a check-in on the same day', () => {
    // 509: group A leaves at 08:00 on day 2, group B (5 pax) arrives at 12:00 the same day — the room is never over its 5 beds
    const slips = [
        slip(1, '42897', T0, T0 + 2 * D + 8 * H, { gents: [{ room_no: '509', assigned: 5 }] }),
        slip(2, 'S42861', T0 + 2 * D + 12 * H, T0 + 5 * D, { gents: [{ room_no: '509', assigned: 5 }] }),
    ];
    const r = buildGrid({ slips, building: 'MOHAMMEDI', roomsSetUp: [{ room_no: '509', capacity: 5 }], from: T0, to: T0 + 6 * D, stepH: 24, libs }).rooms[0];
    it('keeps both on one line and the beds at 5, not 10', () => {
        expect(r.lanes).toHaveLength(1);
        expect(r.peak).toBe(5);
    });
    it('splits the day cells in two so each stay has its own half of that day', () => {
        expect(r.split).toBe(2);
        const [a, b] = r.lanes[0];
        expect(a.s1).toBeLessThan(b.s0);
        expect([a.s0, a.s1, b.s0, b.s1]).toEqual([0, 4, 5, 9]);
        expect(splitText(r.split, 24)).toBe('12 h pieces');
    });
    it('goes only as fine as needed: out 09:00 / in 10:30 → 3-hour pieces; out 11:00 / in 11:30 → hours, never finer', () => {
        const pair = (outH: number, inH: number) => [slip(1, 'A', T0, T0 + outH * H, { gents: [{ room_no: '509', assigned: 2 }] }), slip(2, 'B', T0 + inH * H, T0 + D, { gents: [{ room_no: '509', assigned: 2 }] })];
        const split = (o: number, i: number) => buildGrid({ slips: pair(o, i), building: 'MOHAMMEDI', roomsSetUp: [], from: T0, to: T0 + D, stepH: 24, libs }).rooms[0].split;
        expect(split(11, 13)).toBe(2);
        expect(split(9, 10.5)).toBe(8);
        expect(split(11, 11.5)).toBe(24);
    });
    it('counts leaving before arriving at the same minute', () => { expect(peakBeds([{ start: 0, end: 10, pax: 5 }, { start: 10, end: 20, pax: 5 }])).toBe(5); });
});

describe('guardrails', () => {
    it('never splits finer than an hour, and a hand-over inside one hour still gets separate pieces', () => {
        const pair = [slip(1, 'A', T0, T0 + 11 * H + 20 * 60e3, { gents: [{ room_no: '509', assigned: 2 }] }), slip(2, 'B', T0 + 11 * H + 40 * 60e3, T0 + D, { gents: [{ room_no: '509', assigned: 2 }] })];
        const r = buildGrid({ slips: pair, building: 'MOHAMMEDI', roomsSetUp: [], from: T0, to: T0 + D, stepH: 24, libs }).rooms[0];
        expect(r.split).toBe(24);
        expect(r.lanes).toHaveLength(1);
        expect(r.lanes[0][0].s1).toBeLessThan(r.lanes[0][1].s0);
    });
    it('a real double booking opens lines, never finer splitting — and at most MAX_LANES lines', () => {
        const many = Array.from({ length: 30 }, (_, i) => slip(i + 1, `G${i}`, T0, T0 + 2 * D, { gents: [{ room_no: '509', assigned: 1 }] }));
        const r = buildGrid({ slips: many, building: 'MOHAMMEDI', roomsSetUp: [{ room_no: '509', capacity: 5 }], from: T0, to: T0 + 3 * D, stepH: 24, libs }).rooms[0];
        expect(r.split).toBe(1);
        expect(r.lanes).toHaveLength(MAX_LANES);
        expect(r.hidden).toBe(30 - MAX_LANES);
        expect(r.peak).toBe(30);
    });
    it('keeps a row under the piece limit on long periods', () => {
        const pair = [slip(1, 'A', T0, T0 + 11 * H, { gents: [{ room_no: '509', assigned: 2 }] }), slip(2, 'B', T0 + 11 * H + 30 * 60e3, T0 + 300 * D, { gents: [{ room_no: '509', assigned: 2 }] })];
        const r = buildGrid({ slips: pair, building: 'MOHAMMEDI', roomsSetUp: [], from: T0, to: T0 + 300 * D, stepH: 24, libs }).rooms[0];
        expect(300 * r.split).toBeLessThanOrEqual(4000);
        expect(r.lanes[0][0].s1).toBeLessThan(r.lanes[0][1].s0);
    });
});
