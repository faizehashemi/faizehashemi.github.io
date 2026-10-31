// The PMS side of the UMS bridge (tools/ums-bridge): the bridge runs on a desk computer next to a real browser that is logged in to the legacy UMS,
// and this module lets PMS pages use it — read the UMS's lists and tables, press its Export, and so show UMS data in the PMS's own pages. Used here for the Group List
// (it feeds the same import as the Chrome extension: core/ums-auto.js deliverFile). The connection is this computer's: address + token are kept in this browser only.
//
// Nothing here can bypass the UMS's CAPTCHA: when it appears the bridge reports "awaiting_human" and a window opens on that computer for a person.

const KEY = 'pms_ums_bridge';
const DEFAULT_URL = 'http://127.0.0.1:8787';
const emit = (name, detail) => { try { window.dispatchEvent(new CustomEvent(name, { detail })); } catch { /* no window */ } };

export class BridgeUnreachable extends Error { constructor(m = 'The UMS bridge is not running on this computer.') { super(m); this.name = 'BridgeUnreachable'; this.code = 'UNREACHABLE'; } }
export class BridgeFailed extends Error { constructor(body, status) { super(body?.message || `The UMS bridge answered ${status}.`); this.name = 'BridgeFailed'; this.code = body?.error || 'ERROR'; this.status = status; this.details = body?.details; } }

export function getConfig() {
    try { const c = JSON.parse(localStorage.getItem(KEY) || '{}'); return { url: c.url || DEFAULT_URL, token: c.token || '', everyMin: Number(c.everyMin) || 0 }; }
    catch { return { url: DEFAULT_URL, token: '', everyMin: 0 }; }
}
export function setConfig(patch) {
    const next = { ...getConfig(), ...patch };
    try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* not saved */ }
    emit('pms:ums-bridge', { config: true });
    return next;
}
export const isPaired = () => !!getConfig().token;

async function http(method, path, body, { auth = true, signal } = {}) {
    const { url, token } = getConfig();
    let res;
    try {
        res = await fetch(url.replace(/\/+$/, '') + path, {
            method, signal,
            headers: { ...(auth && token ? { authorization: `Bearer ${token}` } : {}), ...(body ? { 'content-type': 'application/json' } : {}) },
            body: body ? JSON.stringify(body) : undefined, cache: 'no-store',
        });
    } catch (e) { if (e?.name === 'AbortError') throw e; throw new BridgeUnreachable(); }
    let json = {};
    try { json = await res.json(); } catch { /* not JSON */ }
    if (!res.ok) throw new BridgeFailed(json, res.status);
    return json;
}

/** Is a bridge answering at the saved address, and what is it doing? { running, paired, state, authenticated, awaiting, … } */
export async function status() {
    try { await http('GET', '/health', null, { auth: false }); } catch (e) { if (e instanceof BridgeUnreachable) return { running: false, paired: isPaired() }; throw e; }
    if (!isPaired()) return { running: true, paired: false };
    try { return { running: true, paired: true, ...(await http('GET', '/v1/status')) }; }
    catch (e) { if (e instanceof BridgeFailed && e.status === 401) return { running: true, paired: false, badToken: true }; throw e; }
}

/**
 * Run a bridge operation as a job and wait for it. A job can wait for a person (login / CAPTCHA in the window on the bridge's computer), so this polls instead of holding
 * one long request; `onTick(bridgeStatus)` is called while it waits ("awaiting_human" → tell the user to look at the browser window there).
 */
export async function run(path, body = {}, { onTick, pollMs = 1500, signal } = {}) {
    const { jobId } = await http('POST', `${path}?async=1`, body, { signal });
    for (;;) {
        if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
        await new Promise(r => setTimeout(r, pollMs));
        const j = await http('GET', `/v1/jobs/${jobId}`, null, { signal });
        if (j.status === 'done') return j.result;
        if (j.status === 'error') throw new BridgeFailed(j.error, 0);
        if (onTick) onTick(await http('GET', '/v1/status', null, { signal }).catch(() => null));
    }
}

/** Open the UMS login window on the bridge's computer (a person logs in there) and wait until they have. */
export const login = (opts) => run('/v1/login', {}, opts);
export const goto = (path, opts) => run('/v1/goto', { path }, opts);
/** Read a table of a UMS page: { headers, rows, records } (records = objects keyed by header). */
export const extractTable = (o, opts) => run('/v1/extract/table', o, opts);
/** Fill and submit a form of a UMS page. */
export const submitForm = (o, opts) => run('/v1/forms/submit', o, opts);

const b64ToText = (b64) => new TextDecoder('utf-8').decode(Uint8Array.from(atob(b64), c => c.charCodeAt(0)));

/**
 * Press the Group List's Export control through the bridge and hand the file to the PMS import (the same path as the Chrome extension's file).
 * @param {{ path?: string, control?: string, fields?: object }} o  the Group List page and its export control, if the bridge's defaults do not find them
 */
export async function fetchGroupList(o = {}, opts) {
    const r = await run('/v1/export', { ...o, inline: true }, opts);
    const file = { html: b64ToText(r.base64), fileName: r.fileName || 'GroupList.xls', fetchedAt: new Date().toISOString(), via: 'bridge' };
    const { deliverFile } = await import('./ums-auto.js');
    await deliverFile(file);
    emit('pms:ums-bridge', { fetched: file.fetchedAt });
    return file;
}

/* An optional timer: fetch every N minutes while a PMS tab is open (needs the pairing and a logged-in bridge; a person is asked only if the session is gone). */
let timer = null, running = false;
export function startAutoFetch(onResult) {
    stopAutoFetch();
    const { everyMin } = getConfig();
    if (!everyMin || everyMin < 5) return;
    timer = setInterval(async () => {
        if (running || document.visibilityState !== 'visible') return;
        running = true;
        try {
            const st = await status();
            if (!st.running || !st.paired || st.state === 'awaiting_human') { onResult?.({ skipped: !st.running ? 'bridge not running' : !st.paired ? 'bridge not paired' : 'waiting for you to log in to UMS' }); return; }
            onResult?.({ file: await fetchGroupList() });
        } catch (e) { onResult?.({ error: e }); } finally { running = false; }
    }, everyMin * 60000);
}
export function stopAutoFetch() { if (timer) clearInterval(timer); timer = null; }
