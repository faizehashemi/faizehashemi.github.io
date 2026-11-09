import { describe, expect, it } from 'vitest';
import { defaultScreen, playing, saudi, schedOn, stageTransform, tableHtml } from '@core/screen.js';

// Saudi time = UTC+3: 2026-11-12 (a Thursday) at hh:mm Saudi
const at = (hm: string, day = '2026-11-12') => Date.parse(`${day}T${hm}:00+03:00`);

describe('notice screens', () => {
    it('reads Saudi time whatever the TV clock zone', () => {
        expect(saudi(at('13:05'))).toEqual({ day: '2026-11-12', dow: 4, hm: '13:05' });
    });
    it('schedules by days, hours (also past midnight) and dates', () => {
        const meal = { on: true, days: [4, 5], from: '12:30', to: '14:00' };
        expect(schedOn(meal, saudi(at('13:00')))).toBe(true);
        expect(schedOn(meal, saudi(at('14:00')))).toBe(false);
        expect(schedOn(meal, saudi(at('13:00', '2026-11-11')))).toBe(false);   // Wednesday
        const night = { on: true, days: [4], from: '22:00', to: '02:00' };
        expect(schedOn(night, saudi(at('23:30')))).toBe(true);
        expect(schedOn(night, saudi(at('01:00', '2026-11-13')))).toBe(true);    // Friday 01:00 belongs to Thursday night
        expect(schedOn(night, saudi(at('01:00')))).toBe(false);                 // Thursday 01:00 belongs to Wednesday night
        expect(schedOn({ on: true, dateFrom: '2026-11-13' }, saudi(at('10:00')))).toBe(false);
        expect(schedOn({ on: false, from: '01:00', to: '02:00' }, saudi(at('10:00')))).toBe(true);
    });
    it('plays the slides on now; an "only" slide pauses the rest while it is on', () => {
        const cfg = { slides: [
            { id: 'a', kind: 'notice', on: true },
            { id: 'b', kind: 'image', media: ['x'], on: true, sched: { on: true, from: '12:00', to: '13:00' } },
            { id: 'c', kind: 'image', media: ['y'], on: true, sched: { on: true, from: '19:00', to: '21:00', only: true } },
            { id: 'd', kind: 'image', media: [], on: true },          // no file: skipped
            { id: 'e', kind: 'notice', on: false },
        ] };
        expect(playing(cfg, at('12:30')).map((s: any) => s.id)).toEqual(['a', 'b']);
        expect(playing(cfg, at('10:00')).map((s: any) => s.id)).toEqual(['a']);
        expect(playing(cfg, at('20:00')).map((s: any) => s.id)).toEqual(['c']);
    });
    it('turns the portrait stage for a TV on its side', () => {
        expect(stageTransform(90, 1920, 1080)).toEqual({ left: 420, top: -420, transform: 'rotate(90deg) scale(1)' });
        expect(stageTransform(0, 1080, 1920).transform).toBe('rotate(0deg) scale(1)');
        expect(defaultScreen(1).rotate).toBe(90);
        expect(defaultScreen(2).rotate).toBe(-90);
    });
    it('writes notice tables with heading rows and joined cells', () => {
        const h = tableHtml('# Daily Shuttle\nTo Haram | DAY\n^ | NIGHT', '#000');
        expect(h).toContain('<th colspan="2">Daily Shuttle</th>');
        expect(h).toContain('<td rowspan="2">To Haram</td>');
        expect(h).not.toContain('>^<');
    });
});
