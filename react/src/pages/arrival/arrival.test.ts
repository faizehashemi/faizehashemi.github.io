import { describe, expect, it } from 'vitest';
import { applySheet, arrivalHtml, buildArrival, busSize, columnTotal, mainFloor } from './arrival';

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
        expect(rows[0]).toMatchObject({ bus: '1', time: '1:00 pm', ref: '100', group: 'OP', pax: 5, floor: '5', m: 0, f: 0 });
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
    it('draws the table with the total', () => { expect(arrivalHtml(applySheet(rows, null), null, '31-10-2026')).toContain('<td>14</td>'); });
});

describe('main floor', () => {
    const fl = (r: string) => r.slice(0, -2);
    it('is the floor with the most rooms', () => { expect(mainFloor({ rooms: { gents: [{ room_no: '601' }, { room_no: '602' }], ladies: [{ room_no: '501' }] } }, fl)).toBe('6'); });
    it('counts a room once and breaks a tie with the lower floor', () => { expect(mainFloor({ rooms: { gents: [{ room_no: '901' }, { room_no: '901' }], ladies: [{ room_no: '701' }] } }, fl)).toBe('7'); });
});

describe('edits made by the desks', () => {
    const rows = buildArrival({ day: '2026-10-31', hostId: 'medina', slips: [slip(1, '100', { gents: 2, ladies: 1 }), slip(2, '200')], buses: [], hours: { own: 3, other: 5 }, libs });
    it('lays changed cells over the PMS rows, hides rows and adds rows', () => {
        const shown = applySheet(rows, { cells: { [rows[0].key]: { floor: '12', m: '4' } }, hidden: [rows[1].key], added: [{ key: 'add-1', v: { group: 'WALK IN', pax: '2' } }] });
        expect(shown.map(r => r.v.group)).toEqual(['G100', 'WALK IN']);
        expect(shown[0].v).toMatchObject({ floor: '12', m: '4', f: '1' });
        expect(shown[0].edited).toEqual({ floor: true, m: true });
        expect(columnTotal(shown, 'm')).toBe(4);
        expect(columnTotal(shown, 'pax')).toBe(5);
    });
    it('sizes the bus cell so words fit', () => { expect([busSize('12'), busSize('CAR'), busSize('TRAIN'), busSize('AIRPORT')]).toEqual(['n', 'w3', 'w5', 'w8']); });
});
