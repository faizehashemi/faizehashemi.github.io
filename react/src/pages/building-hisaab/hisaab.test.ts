import { describe, expect, it } from 'vitest';
import { arriveMode, leaveMode, legMode } from '@core/travel-mode.js';
import { computeHisaab, daysOf, hisaabHtml } from './hisaab';

const T = (d: string, hm = '12:00') => Date.parse(`${d}T${hm}`);
const stay = { normB: (b: string) => String(b).toUpperCase(), rowsOf: (s: any) => s.rows };
const rooms = { normRoom: (r: string) => String(r), handedAt: (r: any) => (r.handed ? Date.parse(r.handed.at) : null) };
const B = { name: 'TAIBA', rooms: [{ room_no: '101' }, { room_no: '102' }, { room_no: '103', active: false }, { room_no: '104', handed: { at: '2026-11-11T10:00' } }] };

describe('Building Hisaab', () => {
    it('cuts the period into 24-hour days from its From time', () => {
        expect(daysOf(T('2026-11-10'), T('2026-11-12')).map(n => n.day)).toEqual(['2026-11-10', '2026-11-11']);
        const d = daysOf(T('2026-11-10', '23:00'), T('2026-11-12', '06:00'));
        expect(d.map(n => n.day)).toEqual(['2026-11-10', '2026-11-11']);
        expect(d[1].b).toBe(T('2026-11-12', '06:00'));   // a shorter last day ends with the period
    });
    it('a room is occupied on a day when a stay touches it at any time, once is enough', async () => {
        const h = await computeHisaab([{ rows: [{ building: 'TAIBA', room_no: '101', start: T('2026-11-10', '14:00'), end: T('2026-11-11', '10:00') }, { building: 'TAIBA', room_no: '102', start: T('2026-11-11', '11:00'), end: T('2026-11-11', '12:00') }] }],
            B, T('2026-11-10'), T('2026-11-12'), stay, rooms, 0);
        expect(h.rooms[0].cells).toEqual(['yes', 'no']);   // 14:00 → next 10:00 lies inside the first day only
        expect(h.rooms[1].cells).toEqual(['yes', 'no']);   // an hour on the 11th before 12:00 is still the first day; ending at 12:00 sharp does not touch the second
    });
    it('charges the occupied days at the one charge', async () => {
        const slips = [{ rows: [{ building: 'taiba', room_no: '101', start: T('2026-11-10', '14:00'), end: T('2026-11-11', '10:00') }] }, { deleted: true, rows: [{ building: 'TAIBA', room_no: '102', start: 0, end: 9e15 }] }];
        const seen: number[] = [];
        const h = await computeHisaab(slips, B, T('2026-11-10'), T('2026-11-13'), stay, rooms, 300, d => seen.push(d));
        expect(h.rooms.map(r => r.no)).toEqual(['101', '102', '104']);   // inactive and unused: left out
        expect(h.rooms[0].cells).toEqual(['yes', 'no', 'no']);
        expect(h.rooms[2].cells).toEqual(['no', 'gone', 'gone']);      // handed back on the 11th at 10:00, before that day began (12:00)
        expect([h.occ, h.vac, h.payable]).toEqual([1, 6, 300]);
        expect(seen.at(-1)).toBe(2);   // progress ends at all slips
        expect(h.perDay.map(d => d.occ)).toEqual([1, 0, 0]);
        expect(hisaabHtml(h, 'Madina', 'x')).toContain('SAR 300');
    });
});

describe('Building Hisaab: inactive rooms', () => {
    it('come in, in number order, when a slip used them — only their occupied days count', async () => {
        const b = { name: 'TAIBA', rooms: [{ room_no: '110' }, { room_no: '103', active: false }, { room_no: '20' }] };
        const h = await computeHisaab([{ rows: [{ building: 'TAIBA', room_no: '103', start: T('2026-11-10', '14:00'), end: T('2026-11-11', '10:00') }] }], b, T('2026-11-10'), T('2026-11-12'), stay, rooms, 100);
        expect(h.rooms.map(r => [r.no, !!r.off])).toEqual([['20', false], ['103', true], ['110', false]]);
        expect(h.rooms[1].cells).toEqual(['yes', 'off']);
        expect([h.occ, h.vac, h.payable]).toEqual([1, 4, 100]);
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
