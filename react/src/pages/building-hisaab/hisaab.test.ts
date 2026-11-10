import { describe, expect, it } from 'vitest';
import { arriveMode, leaveMode, legMode } from '@core/travel-mode.js';
import { computeHisaab, hisaabHtml, nightsOf } from './hisaab';

const T = (d: string, hm = '12:00') => Date.parse(`${d}T${hm}`);
const stay = { normB: (b: string) => String(b).toUpperCase(), rowsOf: (s: any) => s.rows };
const rooms = { normRoom: (r: string) => String(r), handedAt: (r: any) => (r.handed ? Date.parse(r.handed.at) : null) };
const B = { name: 'TAIBA', rooms: [{ room_no: '101' }, { room_no: '102' }, { room_no: '103', active: false }, { room_no: '104', handed: { at: '2026-11-11T10:00' } }] };

describe('Building Hisaab', () => {
    it('counts a night at the time chosen', () => {
        expect(nightsOf(T('2026-11-10'), T('2026-11-12')).map(n => n.day)).toEqual(['2026-11-10', '2026-11-11']);
        expect(nightsOf(T('2026-11-10', '23:00'), T('2026-11-12')).map(n => n.day)).toEqual(['2026-11-11']);
        expect(nightsOf(T('2026-11-10'), T('2026-11-12'), '02:00').map(n => n.day)).toEqual(['2026-11-11', '2026-11-12']);
    });
    it('charges the occupied nights of each room at its rate', () => {
        const slips = [{ rows: [{ building: 'taiba', room_no: '101', start: T('2026-11-10', '14:00'), end: T('2026-11-11', '10:00') }] }, { deleted: true, rows: [{ building: 'TAIBA', room_no: '102', start: 0, end: 9e15 }] }];
        const h = computeHisaab(slips, B, T('2026-11-10'), T('2026-11-13'), stay, rooms, { '101': 300, '102': 250 });
        expect(h.rooms.map(r => r.no)).toEqual(['101', '102', '104']);   // inactive left out
        expect(h.rooms[0].cells).toEqual(['yes', 'no', 'no']);
        expect(h.rooms[2].cells).toEqual(['no', 'gone', 'gone']);      // handed back on the 11th
        expect([h.occ, h.vac, h.payable, h.noRate]).toEqual([1, 6, 300, 1]);
        expect(h.perDay.map(d => d.occ)).toEqual([1, 0, 0]);
        expect(hisaabHtml(h, 'Madina', 'x')).toContain('SAR 300');
    });
});

describe('mode of transport (Madina)', () => {
    const base = { site: 'medina', to_place: '', from_place: '' };
    it('takes the Transport day trip first', () => {
        expect(leaveMode({ ...base, to_place: 'By train' }, { vehicle: 'car' })).toEqual({ mode: 'By car', src: 'transport' });
        expect(leaveMode(base, { vehicle: 'bus' }).mode).toBe('By bus');
    });
    it('then the slip, then UMS only for a leg from this city', () => {
        expect(leaveMode({ ...base, to_place: 'By train' }).mode).toBe('By train');
        expect(leaveMode({ ...base, to_place: 'Madina Airport' }).mode).toBe('By flight');
        expect(leaveMode({ ...base, ums: { departure: { flight: 'CAR-CAR', port: 'MADINA' } } }).mode).toBe('By car');
        expect(leaveMode({ ...base, ums: { departure: { flight: 'EGYPTAIR -MS-662', port: 'JEDDAH' } } }).mode).toBe('');   // its flight is from Jeddah
        expect(arriveMode({ ...base, ums: { arrival: { flight: 'AIR ARABIA -G9177', port: 'MADINA' } } }).mode).toBe('By flight');
        expect(legMode({ flight: 'BUS-BUS' })).toBe('By bus');
    });
});
