import { describe, expect, it } from 'vitest';
import { href, parseHash, resolve, type Desk, type RouteDeps } from './route';

const VIEWS = ['login', 'home', 'slip', 'checkins', 'grid', 'blank', 'settings'].map(id => ({ id, label: id.toUpperCase(), title: id }));
const SITES = { makkah: { id: 'makkah', label: 'Makkah' }, medina: { id: 'medina', label: 'Medina' } };
const desk = (over: Partial<Desk> = {}): Desk => ({ id: 7, name: 'ali', site: 'medina', role: 'desk', ...over });
const deps = (over: Partial<RouteDeps> = {}): RouteDeps => ({
    SITES, VIEWS, NAV: [{ label: 'Desk', views: ['slip', 'checkins', 'grid'] }], DEFAULT_SITE: 'makkah', desk: desk(), prefs: {}, lastSite: null,
    siteFor: (d, s) => (d.role === 'admin' ? s : d.site), canOpen: () => true, firstPage: (_d, order) => order[0], ...over,
});

describe('resolve', () => {
    it('opens the page in the address', () => {
        const r = resolve('#/medina/slip?sh_no=38480', deps());
        expect([r.siteId, r.view.id, r.params.get('sh_no'), r.replace]).toEqual(['medina', 'slip', '38480', null]);
        expect(r.key).toBe('7/medina/slip/sh_no=38480');
    });
    it('shows the login page to nobody logged in, whatever the address', () => {
        const r = resolve('#/makkah/grid', deps({ desk: null }));
        expect([r.view.id, r.replace, r.key]).toEqual(['login', null, '-/makkah/login/']);
    });
    it('keeps a non-admin on its own site; an admin may look at the other', () => {
        expect(resolve('#/makkah/slip', deps()).replace).toBe('#/medina/slip');
        expect(resolve('#/makkah/slip', deps({ desk: desk({ role: 'admin' }) })).replace).toBe(null);
    });
    it('no page → the start page from Settings, else Home', () => {
        expect(resolve('#/medina', deps({ prefs: { startView: 'grid' } })).view.id).toBe('grid');
        expect(resolve('', deps()).view.id).toBe('home');
        expect(resolve('', deps()).replace).toBe('#/medina/home');
    });
    it('a page the login may not open → its first page, with a notice (none for Home)', () => {
        const no = deps({ canOpen: (v) => v !== 'checkins' && v !== 'home', firstPage: () => 'grid' });
        const r = resolve('#/medina/checkins?x=1', no);
        expect([r.view.id, r.replace]).toEqual(['grid', '#/medina/grid?x=1']);
        expect(r.notice).toMatch(/CHECKINS is not available for ali/);
        expect(resolve('#/medina/home', no).notice).toBe(null);
    });
    it('old addresses: Movement opens Check-ins, ?source is dropped, the login page is never asked for', () => {
        expect(resolve('#/medina/movement', deps()).view.id).toBe('checkins');
        expect(resolve('#/medina/slip?source=cloud', deps()).replace).toBe('#/medina/slip');
        expect(resolve('#/medina/login', deps()).view.id).toBe('home');
    });
    it('parses and builds addresses', () => {
        expect(parseHash('#/makkah/slip?a=1')).toMatchObject({ siteId: 'makkah', viewId: 'slip' });
        expect(href('makkah', 'settings', { section: 'password' })).toBe('#/makkah/settings?section=password');
    });
});
