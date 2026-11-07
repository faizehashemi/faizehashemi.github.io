import { describe, expect, it } from 'vitest';
import { cardsSheet, roomLines } from './sheet';

const rooms = (n: number) => Array.from({ length: n }, (_, i) => [String(100 + i), 4] as [string, number]);

describe('key card sheet', () => {
    it('puts eight rooms on a line and keeps room for BUS on the last one', () => {
        expect(roomLines(rooms(12)).map(l => l.length)).toEqual([8, 4]);
        expect(roomLines(rooms(6)).map(l => l.length)).toEqual([6]);
        expect(roomLines(rooms(8)).map(l => l.length)).toEqual([8, 0]);    // eight exactly: BUS on an empty line, as on the desks' sheet
        expect(roomLines([]).map(l => l.length)).toEqual([0]);
    });
    it('every room and the bus are on the sheet', () => {
        const html = cardsSheet({ day: '05-11-2026', layout: 'portrait', site: 'Medina', cards: [{ group: 'MAIMOON TRAVELS', leader: 'M Huzaifa bhai', pax: 48, sh: '42864', part: false, rooms: rooms(12), busWord: 'BUS', busNo: '1' }] });
        for (const [r] of rooms(12)) expect(html).toContain(`<td>${r}</td>`);
        expect(html).toContain('<td class="bw">BUS</td>');
        expect(html).toContain('<td class="bn">1</td>');
        expect(html).toContain('MAIMOON TRAVELS');
    });
    it('adds the leader phone and the transporter when known', () => {
        const c = { group: 'G', leader: 'L', phone: '0555', transporter: 'YUSUF BHAI - 0555502531', pax: 4, sh: '1', part: false, rooms: rooms(1), busWord: 'BUS', busNo: '1' };
        const html = cardsSheet({ day: 'd', layout: 'portrait', site: 's', cards: [c] });
        expect(html).toContain('L<br>0555');
        expect(html).toContain('YUSUF BHAI - 0555502531');
        expect(cardsSheet({ day: 'd', layout: 'portrait', site: 's', cards: [{ ...c, transporter: '' }] })).not.toContain('<tr class="tp">');
    });
});
