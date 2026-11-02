import { describe, expect, it } from 'vitest';
import { packZiyarat } from '@core/ziyarat.js';

const D = '2026-11-03';
const pack = (groups: any[]) => packZiyarat(groups, { gAt: `${D}T08:00`, lAt: `${D}T16:00`, keyOf: (i: number) => `K${i}` }) as any[];
const buses = (trips: any[], part: string) => trips.filter(t => t.part === part && t.route).map(h => trips.filter(t => t.key === h.key || t.with === h.key).reduce((s, t) => s + t.pax, 0));

describe('packZiyarat', () => {
    it('packs gents and ladies apart, each bus at most 49 (the 43075 + 42864 case)', () => {
        const t = pack([{ ref: '43075', m: 19, f: 26, c: 0, building: 'RUBAT' }, { ref: '42864', m: 21, f: 24, c: 3, building: 'RUBAT' }]);
        expect(buses(t, 'gents')).toEqual([40]);
        expect(buses(t, 'ladies').sort()).toEqual([26, 27]);
        expect(t.find(x => x.key === 'K0')).toMatchObject({ part: 'gents', m: 19, at: `${D}T08:00`, split_orig: { m: 19, f: 26, pax: 45 } });
        expect(t.find(x => x.key === 'K1-L')).toMatchObject({ part: 'ladies', f: 24, c: 3, pax: 27, at: `${D}T16:00` });
    });
    it('fills whole buses with a part bigger than a bus, in as few buses as possible', () => {
        const t = pack([{ ref: 'A', m: 60, f: 10, c: 0 }, { ref: 'B', m: 30, f: 45, c: 4 }]);
        const g = buses(t, 'gents'), l = buses(t, 'ladies');
        expect(g.every(x => x <= 49) && l.every(x => x <= 49)).toBe(true);
        expect(g.reduce((a, b) => a + b, 0)).toBe(90);
        expect(g.sort()).toEqual([41, 49]);   // 49 | 11 + 30 — not 30 + 30 + 30 in three
        expect(l.reduce((a, b) => a + b, 0)).toBe(59);
        expect(t.filter(x => x.ref === 'A' && x.part === 'gents').map(x => x.m).sort()).toEqual([11, 49]);
    });
    it('prefers a bus already picking up at the same hotel', () => {
        const t = pack([{ ref: 'A', m: 30, f: 0, c: 0, building: 'RUBAT' }, { ref: 'B', m: 15, f: 0, c: 0, building: 'ONARA' }, { ref: 'C', m: 15, f: 0, c: 0, building: 'RUBAT' }]);
        const host = (ref: string) => { const x = t.find(r => r.ref === ref)!; return x.with || x.key; };
        expect(host('C')).toBe(host('A'));
        expect(host('B')).not.toBe(host('A'));
    });
});
