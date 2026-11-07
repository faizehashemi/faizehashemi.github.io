import { describe, expect, it } from 'vitest';
import { activeRooms, handedAt, inService } from '@core/rooms.js';
import { computeOccupancy, type BuildingIn } from '../occupancy/occupancy';
import { vacancyByDate } from '../occupancy/vacancy';
import { checkAvailability, emptyForm, newRow } from '../slip/slip';
import { formColumns, handoverForm } from './handover';

const list = (n: number) => Array.from({ length: n }, (_, i) => String(701 + i));

describe('room hand-over', () => {
    it('a room is in service until the moment it was handed over', () => {
        const r = { room_no: '701', capacity: 4, handed: { at: '2026-11-05T11:50', by: 'x' } };
        const t = Date.parse('2026-11-05T11:50');
        expect(handedAt(r)).toBe(t);
        expect(inService(r, t - 1)).toBe(true);
        expect(inService(r, t)).toBe(false);
        expect(inService({ room_no: '1', active: false }, t)).toBe(false);
        const b = [{ name: 'ARTAL', rooms: [r, { room_no: '702', capacity: 4 }] }];
        expect(activeRooms(b, 'ARTAL', t - 1)).toHaveLength(2);
        expect(activeRooms(b, 'ARTAL', t)).toHaveLength(1);
    });
    it('occupancy keeps the room for the nights before and drops it after', () => {
        const b: BuildingIn[] = [{ name: 'A', rooms: [{ room_no: '701', capacity: 4, until: Date.parse('2026-11-05T11:50') }, { room_no: '702', capacity: 2 }] }];
        const stay = { rowsOf: () => [], slipEnd: () => 0, isDelayed: () => false, paxAt: () => ({ total: 0 }), normB: (x: string) => x } as any;
        const rooms = { normRoom: (x: string) => x, floorOf: () => '7' } as any;
        const m = computeOccupancy([], b, { from: '2026-11-04', to: '2026-11-06' }, stay, rooms);
        expect(m.blds[0].capN).toEqual([6, 2, 2]);
        expect(m.total.capN).toEqual([6, 2, 2]);
        expect(vacancyByDate(m).map(d => d.rooms)).toEqual([2, 1, 1]);   // a room handed back is not "empty"
    });
    it('a room handed back before the period is left out', () => {
        const b: BuildingIn[] = [{ name: 'A', rooms: [{ room_no: '701', capacity: 4, until: Date.parse('2026-10-01T10:00') }, { room_no: '702', capacity: 2 }] }];
        const m = computeOccupancy([], b, { from: '2026-11-04', to: '2026-11-04' }, { rowsOf: () => [], normB: (x: string) => x } as any, { normRoom: (x: string) => x, floorOf: () => '7' } as any);
        expect(m.blds[0].rooms.map(r => r.no)).toEqual(['702']);
        expect(m.blds[0].cap).toBe(2);
    });
    it('guests still booked in a room handed back stay counted, as guests without a room', () => {
        const b: BuildingIn[] = [{ name: 'A', rooms: [{ room_no: '701', capacity: 4, until: Date.parse('2026-11-05T11:50') }] }];
        const stay = { rowsOf: () => [{ building: 'A', room_no: '701', start: Date.parse('2026-11-04T10:00'), end: Date.parse('2026-11-07T10:00'), block: 3 }], slipEnd: () => Date.parse('2026-11-07T10:00'), isDelayed: () => false, normB: (x: string) => x } as any;
        const m = computeOccupancy([{ building: 'A', checkin_date: '2026-11-04', checkin_time: '10:00', checkout_date: '2026-11-07', checkout_time: '10:00' }], b, { from: '2026-11-04', to: '2026-11-06' }, stay, { normRoom: (x: string) => x, floorOf: () => '7' } as any);
        expect(m.blds[0].used).toEqual([3, 0, 0]);
        expect(m.blds[0].unroomed).toEqual([0, 3, 3]);
    });
    it('a slip cannot take a handed room past that moment, but one already in it can be saved', () => {
        const f = { ...emptyForm(), building: 'ARTAL', checkin_date: '2026-11-01', checkin_time: '12:00', checkout_date: '2026-11-08', checkout_time: '12:00' };
        const room = { room_no: '701', capacity: 4, handed: { at: '2026-11-05T11:50', by: 'x' } };
        const R = { normRoom: (r: string) => r, findBuilding: () => ({ rooms: [room] }), builderCapacity: () => 4 };
        const env = { db: [], buildings: [], currentId: null, stay: { normB: (x: string) => String(x).toUpperCase(), rowsOf: () => [] }, rooms: R, delayOn: false, copy: {} } as any;
        const row = newRow({ room_no: '701', capacity: 4, assigned: 2 });
        expect(checkAvailability(f, [row], [], { ...env, loadedRooms: new Set() }).issues.map((i: any) => i.text)).toEqual([expect.stringContaining('handed back')]);
        expect(checkAvailability(f, [row], [], { ...env, loadedRooms: new Set(['gents|701|ARTAL']) }).pass).toBe(true);
        expect(checkAvailability({ ...f, checkout_date: '2026-11-04' }, [row], [], { ...env, loadedRooms: new Set() }).pass).toBe(true);
    });
    it('fills the form ten deep, as the paper one', () => {
        expect(formColumns(list(21)).map(c => c.length)).toEqual([10, 10, 1]);
        expect(formColumns(list(33)).map(c => c.length)).toEqual([11, 11, 11]);
        const html = handoverForm({ building: 'ARTAL', at: '2026-11-05T11:50', rooms: list(21) });
        expect(html).toContain('HAND OVER TO HOTEL ARTAL');
        expect(html).toContain('DATE :- 05/11/2026');
        expect(html).toContain('TIME :- 11:50 AM');
        expect(html).toContain('<td>TOTAL</td><td>21</td>');
    });
});
