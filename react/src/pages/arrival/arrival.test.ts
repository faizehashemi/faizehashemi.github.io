import { describe, expect, it } from 'vitest';
import { arrivalHtml, buildArrival } from './arrival';

const T = {
    vehicleNo: (n: number) => String(n ?? ''),
    time12: (at: string) => { const [h, m] = at.slice(11, 16).split(':').map(Number); return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h < 12 ? 'am' : 'pm'}`; },
};
const shiftTime = (d: string, t: string, h: number) => { const x = new Date(Date.parse(`${d}T${t}:00Z`) + h * 3600e3); return { date: x.toISOString().slice(0, 10), time: x.toISOString().slice(11, 16) }; };
const libs = { T, floorOf: (r: string) => r.slice(0, -2), shiftTime, byRoad: (l: any) => /^(CAR|BUS|TRAIN)\b/i.test(l?.flight || '') };
const slip = (id: number, sh: string, extra: any = {}) => ({ id, sh_no: sh, tour_name: `G${sh}`, group_leader: 'L', checkin_date: '2026-10-31', total: 3, rooms: { gents: [{ room_no: '601' }, { room_no: '502' }], ladies: [] }, ...extra });

describe('buildArrival', () => {
    const buses = [{ bus: 1, vehicle: 'bus', at: '2026-10-31T08:00', rows: [{ ref: '100', operator: 'OP', leader: 'X', pax: 5 }] }];
    const slips = [slip(1, '100'), slip(2, '200', { ums: { arrival: { flight: 'SV1', date: '2026-10-31', time: '10:00', port: 'JEDDAH' } } }), slip(3, '300', { ums: { arrival: { flight: 'SV2', date: '2026-10-31', time: '10:00', port: 'MADINA' } } }), slip(4, 'S400', { ums: { arrival: { flight: 'CAR-X', date: '2026-10-31', time: '12:00', port: '' } } })];
    const rows = buildArrival({ day: '2026-10-31', hostId: 'medina', slips, buses, hours: { own: 3, other: 5 }, libs });
    it('puts the bus first with the bus time plus the other-city hours and the floors of the slip', () => {
        expect(rows[0]).toMatchObject({ bus: '1', time: '1:00 pm', ref: '100', group: 'OP', pax: 5, floor: '5, 6' });
    });
    it('uses the own-airport hours for Madina and the other-city hours for Jeddah', () => {
        expect(rows.find(r => r.ref === '300')!.time).toBe('1:00 pm');
        expect(rows.find(r => r.ref === '200')!.time).toBe('3:00 pm');
        expect(rows.find(r => r.ref === '200')!.bus).toBe('AIRPORT');
    });
    it('lists a road arrival without a bus number, before the airport rows', () => {
        expect(rows.map(r => r.ref)).toEqual(['100', 'S400', '300', '200']);
        expect(rows[1].time).toBe('12:00 pm');
    });
    it('draws the table with the total', () => { expect(arrivalHtml(rows, '31-10-2026')).toContain('<td>14</td>'); });
});
