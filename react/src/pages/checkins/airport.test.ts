import { describe, expect, it } from 'vitest';
import { airportName, legOf, partsOf } from './checkins';

describe('check-ins split by airport', () => {
    it('names the airport from the slip', () => {
        expect(airportName('Jeddah Airport')).toBe('Jeddah Airport');
        expect(airportName('Madina Airport')).toBe('Madina Airport');
        expect(airportName('MEDINA AIRPORT')).toBe('Madina Airport');
        expect(airportName('Taif Airport')).toBe('Taif Airport');
        expect(airportName('King Abdulaziz International Airport')).toBe('King Abdulaziz Airport');
        expect(airportName('By car')).toBe('');
        expect(airportName('Makkah')).toBe('');
        expect(airportName('')).toBe('');
    });
    it('splits the airport part per airport, biggest first, the other city last', () => {
        const rows = [{ to_place: 'Jeddah Airport' }, { to_place: 'Madina Airport' }, { to_place: 'Jeddah Airport' }, { to_place: 'Medina' }, { to_place: 'By car' }];
        const leg = (r: any) => ({ from: 'airport' as const, to: (r.to_place === 'Medina' ? 'medina' : 'airport') as any });
        const p = partsOf(rows, 'checkout', true, leg, 'medina', 'Madina');
        expect(p.map(([t, l]) => [t, l.length])).toEqual([['Departing to Jeddah Airport', 2], ['Departing to Madina Airport', 1], ['Departing by car (airport leg)', 1], ['Departing to Madina', 1]]);
        expect(partsOf([], 'checkin', true, leg, 'medina', 'Madina').map(([t]) => t)).toEqual(['From the airport', 'From Madina']);
    });
    it("trusts the slip's From / To over an old UMS itinerary (44791)", () => {
        const r = { sh_no: '44791', from_place: 'Madina Airport', to_place: 'Makkah', checkout_date: '2026-11-22', ums: { itinerary: 'MAKKAH→MADINA', seg: 1 } };
        expect(legOf(r, 'medina', [], x => String(x))).toEqual({ from: 'airport', to: 'makkah' });
        // no From / To on the slip: the itinerary still decides
        expect(legOf({ ...r, from_place: '', to_place: 'By car' }, 'medina', [], x => String(x))).toEqual({ from: 'makkah', to: 'airport' });
    });
});
