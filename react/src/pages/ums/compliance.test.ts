import { describe, expect, it } from 'vitest';
import { complianceGroup, planImport, staysOf } from '@core/ums.js';
import { UMS } from '@core/../config.js';

const cfg = { ...UMS, capOf: () => 0 };
// a Makkah → Madina → Makkah group as UMS gave it before, and the same group now "Will Not Travel To Madina" with a new departure
const group = (o: Record<string, any> = {}) => ({
    sh: 50001, operator: { name: 'OP', glName: 'GL', family: false }, country: 'INDIA',
    arrival: { date: '2026-11-01', time: '10:00', flight: 'SV 1', port: 'JEDDAH' }, departure: { date: '2026-11-20', time: '18:00', flight: 'SV 2', port: 'JEDDAH' },
    firstArrival: 'MAKKAH', noMadina: false, madinaDate: '2026-11-06', makkahDate: '2026-11-10', depFromMadina: false,
    gents: 2, ladies: 2, children: 0, infants: 0, total: 4, depAirport: 'JEDDAH', status: 'Approved', ...o,
});
const parsed = (g: any) => ({ groups: [g], errors: [], warnings: [], rowCount: 1 });
let id = 1;
const slipsFrom = (g: any) => planImport(parsed(g), [], 'makkah', cfg).create.map((c: any) => ({ ...c.rec, id: id++, _v: 1 }));

describe('UMS import: compliance (Makkah)', () => {
    const before = slipsFrom(group());
    const now = group({ noMadina: true, madinaDate: null, makkahDate: null, departure: { date: '2026-11-22', time: '18:00', flight: 'SV 9', port: 'JEDDAH' } });
    it('the earlier import made two Makkah legs', () => {
        expect(before.map((s: any) => [s.ums.key, s.checkin_date, s.checkout_date])).toEqual([['50001|makkah|1', '2026-11-01', '2026-11-06'], ['50001|makkah|2', '2026-11-10', '2026-11-20']]);
    });
    it('keeps both legs and moves only the last check-out to the new departure', () => {
        const plan = planImport(parsed(now), before, 'makkah', cfg);
        expect(plan.create).toEqual([]);
        expect(plan.compliance).toBe(1);
        const up = plan.update.map((u: any) => [u.rec.ums.key, u.rec.checkin_date, u.rec.checkout_date, Object.keys(u.changes), u.rec.ums.compliance]);
        expect(up).toEqual([['50001|makkah|1', '2026-11-01', '2026-11-06', [], true], ['50001|makkah|2', '2026-11-10', '2026-11-22', ['checkout_date'], true]]);
    });
    it('works from slips imported before the Madina dates were stored on them', () => {
        const old = before.map((s: any) => { const { madinaDate, makkahDate, depFromMadina, ...ums } = s.ums; return { ...s, ums }; });
        const g = complianceGroup(now, old, 'makkah');
        expect([g?.madinaDate, g?.makkahDate, g?.compliance]).toEqual(['2026-11-06', '2026-11-10', true]);
        expect(staysOf(g, cfg).stays.filter((x: any) => x.site === 'makkah').length).toBe(2);
    });
    it('reads the old itinerary from the second leg when the first already says Makkah only', () => {
        const half = before.map((s: any) => { const { madinaDate, makkahDate, depFromMadina, ...ums } = s.ums; return { ...s, ums: s.ums.seg === 1 ? { ...ums, itinerary: 'MAKKAH' } : ums }; });
        expect(complianceGroup(now, half, 'makkah')?.makkahDate).toBe('2026-11-10');
    });
    it('leaves alone a group that was Makkah only from the start, and Madina', () => {
        const mo = slipsFrom(group({ sh: 50002, noMadina: true, madinaDate: null, makkahDate: null }));
        expect(complianceGroup(group({ sh: 50002, noMadina: true, madinaDate: null, makkahDate: null }), mo, 'makkah')).toBeNull();
        expect(complianceGroup(now, before, 'medina')).toBeNull();
    });
    it('"Not in this UMS file" leaves out S slips and compliance slips', () => {
        const other = group({ sh: 50003 });
        const extra = [
            { id: 900, site: 'makkah', sh_no: 'S50009', checkin_date: '2026-11-01', checkout_date: '2026-11-05' },
            { id: 901, site: 'makkah', sh_no: 50008, checkin_date: '2026-11-01', checkout_date: '2026-11-05', ums: { key: '50008|makkah|1', ref: 50008, compliance: true } },
            { id: 902, site: 'makkah', sh_no: 50007, checkin_date: '2026-11-01', checkout_date: '2026-11-05' },
        ];
        const plan = planImport(parsed(other), extra, 'makkah', cfg);
        expect(plan.missing.map((m: any) => m.slip.id)).toEqual([902]);
    });
});
