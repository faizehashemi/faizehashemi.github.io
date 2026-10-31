import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as bridge from '@core/ums-bridge.js';

const json = (status: number, body: unknown) => Promise.resolve(new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } }));

describe('UMS bridge client', () => {
    beforeEach(() => { localStorage.clear(); vi.restoreAllMocks(); });

    it('keeps the address and token in this browser', () => {
        expect(bridge.getConfig()).toMatchObject({ url: 'http://127.0.0.1:8787', token: '' });
        bridge.setConfig({ token: 'abc', everyMin: 30 });
        expect(bridge.getConfig()).toMatchObject({ token: 'abc', everyMin: 30 });
        expect(bridge.isPaired()).toBe(true);
    });

    it('says "not running" when nothing answers, "not paired" without a token, and bad token on 401', async () => {
        vi.stubGlobal('fetch', vi.fn(() => Promise.reject(new TypeError('Failed to fetch'))));
        expect(await bridge.status()).toMatchObject({ running: false });
        vi.stubGlobal('fetch', vi.fn(() => json(200, { ok: true })));
        expect(await bridge.status()).toMatchObject({ running: true, paired: false });
        bridge.setConfig({ token: 'x' });
        vi.stubGlobal('fetch', vi.fn((u: string) => (String(u).endsWith('/health') ? json(200, { ok: true }) : json(401, { error: 'UNAUTHORIZED', message: 'no' }))));
        expect(await bridge.status()).toMatchObject({ running: true, paired: false, badToken: true });
    });

    it('sends the bearer token and returns the bridge status when paired', async () => {
        bridge.setConfig({ token: 'tok' });
        const f = vi.fn((u: string, _init?: RequestInit) => (String(u).endsWith('/health') ? json(200, { ok: true }) : json(200, { state: 'ready', authenticated: true })));
        vi.stubGlobal('fetch', f);
        expect(await bridge.status()).toMatchObject({ running: true, paired: true, state: 'ready', authenticated: true });
        const call = f.mock.calls.find(c => String(c[0]).endsWith('/v1/status'))!;
        expect((call[1] as RequestInit).headers).toMatchObject({ authorization: 'Bearer tok' });
    });

    it('runs an operation as a job: starts it (async), polls it, reports "awaiting_human" ticks, returns the result', async () => {
        bridge.setConfig({ token: 'tok' });
        let polls = 0;
        const ticks: unknown[] = [];
        vi.stubGlobal('fetch', vi.fn((u: string, init?: RequestInit) => {
            const url = String(u);
            if (init?.method === 'POST') return json(202, { jobId: 'j1' });
            if (url.endsWith('/v1/jobs/j1')) return json(200, ++polls < 3 ? { status: 'running' } : { status: 'done', result: { records: [{ a: '1' }] } });
            return json(200, { state: 'awaiting_human' });
        }));
        const r = await bridge.extractTable({ selector: '#t' }, { pollMs: 1, onTick: (s: unknown) => ticks.push(s) });
        expect(r.records).toEqual([{ a: '1' }]);
        expect(ticks.length).toBeGreaterThan(0);
    });

    it('a failed job throws the bridge error with its code (e.g. CAPTCHA_TIMEOUT)', async () => {
        bridge.setConfig({ token: 'tok' });
        vi.stubGlobal('fetch', vi.fn((u: string, init?: RequestInit) => (init?.method === 'POST' ? json(202, { jobId: 'j' }) : json(200, { status: 'error', error: { error: 'CAPTCHA_TIMEOUT', message: 'Nobody completed it' } }))));
        await expect(bridge.login({ pollMs: 1 })).rejects.toMatchObject({ code: 'CAPTCHA_TIMEOUT', message: 'Nobody completed it' });
    });
});
