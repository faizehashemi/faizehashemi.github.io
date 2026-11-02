import { describe, expect, it } from 'vitest';
import { peakIn, vacancy } from './vacancy';

const H = 3600e3, D = 24 * H, T0 = Date.parse('2026-11-02T00:00:00Z');
const libs = {
    normB: (b: string) => String(b || '').trim().toUpperCase(),
    rowsOf: (s: any) => (s.rooms || []).map((x: any) => ({ room_no: x.room_no, building: s.building, block: x.block, start: s.start, end: s.end })),
    activeRooms: (b: string) => (b === 'MOHAMMEDI' ? [{ room_no: '501', capacity: 4 }, { room_no: '502', capacity: 4 }, { room_no: '503', capacity: 2 }] : []),
};
const slip = (sh: string, start: number, end: number, rooms: any[], building = 'MOHAMMEDI') => ({ sh_no: sh, tour_name: `T${sh}`, building, start, end, rooms });

describe('vacancy', () => {
    const slips = [
        slip('1', T0, T0 + 2 * D, [{ room_no: '501', block: 2 }]),
        slip('2', T0 + D, T0 + 3 * D, [{ room_no: '501', block: 1 }]),
        slip('3', T0, T0 + D + 8 * H, [{ room_no: '503', block: 2 }]),
        slip('4', T0 + D + 12 * H, T0 + 4 * D, [{ room_no: '503', block: 2 }]),
        slip('5', T0, T0 + 9 * D, [{ room_no: '901', block: 3 }], 'OTHER'),
    ];
    it('counts the most beds in use in the period and the beds still free', () => {
        const v = vacancy({ slips, buildings: ['MOHAMMEDI'], from: T0 + D, to: T0 + 3 * D, libs });
        expect(v.rows.map(r => [r.room, r.used, r.free])).toEqual([['501', 3, 1], ['502', 0, 4], ['503', 2, 0]]);
        expect(v).toMatchObject({ rooms: 3, vacant: 1, withSpace: 1, full: 1, freeBeds: 5 });
        expect(v.rows[0].groups).toBe('1 T1, 2 T2');
    });
    it('a building not set up uses the rooms of the slips, beds unknown', () => {
        const v = vacancy({ slips, buildings: ['OTHER'], from: T0, to: T0 + D, libs });
        expect(v.rows).toEqual([{ building: 'OTHER', room: '901', capacity: null, used: 3, free: null, groups: '5 T5' }]);
    });
    it('leaving before arriving at the same minute', () => { expect(peakIn([{ start: 0, end: 10, beds: 2 }, { start: 10, end: 20, beds: 2 }], 0, 20)).toBe(2); });
});
