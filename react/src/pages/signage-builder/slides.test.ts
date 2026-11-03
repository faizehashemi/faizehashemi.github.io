import { describe, expect, it } from 'vitest';
import { buildSlides } from '@core/signage.js';

const trip = (type: string, ref: string) => ({ r: { ref, at: '2026-11-04T08:00', pax: 10 }, type, to: type.split('-').slice(1).join('-'), bus: 1 });

describe('buildSlides', () => {
    it('shows the trips of a slide whose template was deleted in the Classic layout (not dropped)', () => {
        const slides = buildSlides([trip('MADINA-MADINA ZIYARAT', '1'), trip('MADINA-MAKKAH', '2')],
            [{ type: 'MADINA-MAKKAH', template: 11, seconds: 30 }, { type: 'MADINA-MADINA ZIYARAT', template: 9, seconds: 15 }],
            [{ id: 11, data: { elements: [] } }]);
        expect(slides.map(s => [s.template, s.trips.map((t: any) => t.r.ref)])).toEqual([[11, ['2']], ['classic', ['1']]]);
    });
    it('still leaves out a type set to "none"', () => {
        expect(buildSlides([trip('MADINA-MAKKAH', '2')], [{ type: 'MADINA-MAKKAH', template: 'none', seconds: 15 }], [])).toEqual([]);
    });
    it('cycles a PDF slide through its pages, in its place in the order, with no trips needed', () => {
        const img = 'data:image/webp;base64,AAAA';
        const slides = buildSlides([trip('MADINA-MAKKAH', '2')],
            [{ type: 'pdf:20', template: 20, seconds: 8 }, { type: 'MADINA-MAKKAH', template: 'classic', seconds: 15 }],
            [{ id: 20, name: 'Notice', data: { kind: 'pdf', pages: [img, img, img], fit: 'contain', bg: { color: '#000000' } } }]);
        expect(slides.map((s: any) => [s.template, s.page, s.pages, s.seconds])).toEqual([[20, 1, 3, 8], [20, 2, 3, 8], [20, 3, 3, 8], ['classic', 1, 1, 15]]);
        expect(slides[0].tpl.data).toMatchObject({ bg: { image: img, fit: 'contain', color: '#000000' }, elements: [] });
    });
});
