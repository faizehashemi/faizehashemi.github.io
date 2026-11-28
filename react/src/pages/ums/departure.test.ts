import { describe, expect, it } from 'vitest';
import { staysOf } from '@core/ums.js';
import { UMS } from '@core/../config.js';

// Makkah → Madina airport (Setup → Travel times, Makkah only): a group whose last stay is in Makkah but whose flight leaves from
// Madina airport goes from the Makkah hotel straight to Madina — check-out 8 h before the flight instead of the usual 6 h
const cfg = { ...UMS, capOf: () => 0 };
const group = (o: Record<string, any> = {}) => ({
    sh: 60001, operator: { name: 'OP', glName: 'GL', family: false }, country: 'INDIA',
    arrival: { date: '2026-11-01', time: '10:00', flight: 'SV 1', port: 'JEDDAH' }, departure: { date: '2026-11-20', time: '18:00', flight: 'SV 2', port: 'MADINA' },
    firstArrival: 'MAKKAH', noMadina: true, madinaDate: null, makkahDate: null, depFromMadina: false,
    gents: 2, ladies: 2, children: 0, infants: 0, total: 4, depAirport: 'MADINA', status: 'Approved', ...o,
});
const lastOut = (g: any) => { const s = staysOf(g, cfg).stays; const l = s[s.length - 1]; return [l.site, l.end.date, l.end.time]; };

describe('departure: Makkah → Madina airport', () => {
    it('Makkah only, flying from Madina: check-out 8 h before', () => expect(lastOut(group())).toEqual(['makkah', '2026-11-20', '10:00']));
    it('Madina → Makkah, flying from Madina: the Makkah stay ends 8 h before', () => expect(lastOut(group({ firstArrival: 'MADINA', noMadina: false, madinaDate: '2026-11-01', makkahDate: '2026-11-05' }))).toEqual(['makkah', '2026-11-20', '10:00']));
    it('Makkah only, flying from Jeddah: the usual 6 h', () => expect(lastOut(group({ departure: { date: '2026-11-20', time: '18:00', flight: 'SV 2', port: 'JEDDAH' }, depAirport: 'JEDDAH' }))).toEqual(['makkah', '2026-11-20', '12:00']));
    it('ending in Madina, flying from Madina: the usual 6 h (the Madina stay)', () => expect(lastOut(group({ noMadina: false, madinaDate: '2026-11-10', depFromMadina: true }))).toEqual(['medina', '2026-11-20', '12:00']));
    it('by road: the UMS time as it is', () => expect(lastOut(group({ departure: { date: '2026-11-20', time: '18:00', flight: 'BUS-BUS', port: 'MADINA' } }))).toEqual(['makkah', '2026-11-20', '18:00']));
    it('the setting changes it', () => expect(staysOf(group(), { ...cfg, makkahMedinaDepHours: 9 }).stays[0].end).toEqual({ date: '2026-11-20', time: '09:00' }));
});
