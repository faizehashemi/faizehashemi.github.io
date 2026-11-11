import { describe, expect, it } from 'vitest';
import { kgSummary, summaryDoc } from './summary';

const baseSh = (s: unknown) => String(s ?? '').trim().toUpperCase().replace(/^S+(?=\d)/, '');
const W = { morning_from: '20:00', split: '07:00', night_to: '20:00' };
const slip = (sh: string | number, o: Record<string, any>) => ({ sh_no: sh, tour_name: `T${sh}`, group_leader: `GL${sh}`, total: 4, checkin_date: '2026-11-01', checkin_time: '12:00', checkout_date: '2026-11-20', checkout_time: '10:00', ...o });
const ids = (s: any) => s.items.map((x: any) => x.sh);

describe('KG summary', () => {
    const day = '2026-11-12';
    const slips = [
        slip(100, { checkin_date: '2026-11-11', checkin_time: '15:00' }),                                     // yesterday's arrival
        slip(101, { checkout_date: day, to_place: 'Medina' }),                                                // to Madina → Wada Sabaq
        slip(102, { checkout_date: day, to_place: 'Jeddah Airport', ums: { firstArrival: 'MADINA' } }),     // airport, came to Madina first → yes
        slip(103, { checkout_date: day, to_place: 'Jeddah Airport', ums: { firstArrival: 'MAKKAH' } }),     // airport, Makkah first → had it already
        slip(104, { checkin_date: day, checkin_time: '10:00' }),                                              // Raate Haram
        slip('S105', { checkin_date: day, checkin_time: '18:00' }),                                           // Raate Haram, second umrah → first
        slip(106, { checkin_date: day, checkin_time: '22:00' }),                                              // Kaale Fajare
        slip(107, { checkin_date: '2026-11-13', checkin_time: '05:00' }),                                     // Kaale Fajare
        slip(108, { checkin_date: '2026-11-13', checkin_time: '08:00' }),                                     // too late
        slip(109, { checkout_date: day, deleted: true, to_place: 'Medina' }),
    ];
    it('falls back to yesterday\'s arrivals when no Atraaf is planned', () => {
        const [atraaf] = kgSummary(slips, [], day, W, baseSh);
        expect(ids(atraaf)).toEqual(['100']);
        expect(atraaf.note).toContain('yesterday');
    });
    it('takes the Atraaf trips, and shows who is also in Wada Sabaq', () => {
        const s = kgSummary(slips, [{ ref: '101', route: 'MAKKAH-MAKKAH ATRAAF' }, { ref: '104', route: 'MAKKAH-MAKKAH ATRAAF' }], day, W, baseSh);
        expect(ids(s[0])).toEqual(['101', '104']);
        expect(ids(s[1])).toEqual(['101', '102']);
        expect(ids(s[2])).toEqual(['101']);   // clash
    });
    it('Wada Sabaq follows the Transport day destination first', () => {
        const s = kgSummary(slips, [{ ref: '103', route: 'MAKKAH-MADINA' }], day, W, baseSh);
        expect(ids(s[1])).toContain('103');
    });
    it('splits the Haram check-ins at the cut-offs, second umrah first', () => {
        const s = kgSummary(slips, [], day, W, baseSh);
        expect(ids(s[3])).toEqual(['S105', '104']);
        expect(s[3].items[0].second).toBe(true);
        expect(ids(s[4])).toEqual(['106', '107']);
        expect(summaryDoc(s, day, 'Makkah', 'word')).toContain('TS105 (Second Umrah)');
    });
});
