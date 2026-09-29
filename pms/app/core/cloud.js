// Session, API client and the local mirror of the cloud database.
//
// The browser keeps a copy of every slip (IndexedDB "pms_cloud_mirror") and pulls only what
// changed since its cursor, so pages open instantly and keep working read-only when the venue
// Wi-Fi drops. Writes always go to the server (app/core/db.js), then land in the mirror.
// Events: 'pms:sync' { lastSync, online }, 'pms:logged-in' { desk }, 'pms:logged-out' { reason },
// 'pms:desk-changed' { desk }.

import { API_URL } from '../config.js';

const SESSION_KEY = 'pms_session';
const API_OVERRIDE_KEY = 'pms_api_url';
const MIRROR = 'pms_cloud_mirror';

/* --------------------------------- errors --------------------------------- */

// Errors whose message is written for the person at the desk
export class UserError extends Error { }
export class OfflineError extends UserError {
    constructor() { super('No connection to the PMS server — changes cannot be saved right now. The data shown is from the last sync.'); }
}
export class ApiError extends UserError {
    constructor(status, message, extra) { super(message); this.status = status; this.extra = extra || {}; }
}

/* --------------------------------- session --------------------------------- */

export function getSession() {
    try { return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null'); } catch { return null; }
}
export const currentDesk = () => getSession()?.desk || null;

export function apiBase() {
    let url = API_URL;
    try { url = localStorage.getItem(API_OVERRIDE_KEY) || API_URL; } catch { }
    return String(url).replace(/\/+$/, '');
}
export function setApiOverride(url) {
    try { url ? localStorage.setItem(API_OVERRIDE_KEY, url) : localStorage.removeItem(API_OVERRIDE_KEY); } catch { }
}

// Pages every login may open whatever the admin ticked (Settings holds the password change)
export const ALWAYS_OPEN = ['login', 'settings', 'blank'];

/** The page a login lands on when it may not open Home: its first allowed page in menu order, else 'blank'. */
export function firstPage(desk = currentDesk(), order = []) {
    if (canOpen('home', desk)) return 'home';
    return order.find(id => canOpen(id, desk) && id !== 'settings') || 'blank';
}

/** May this login open the page? Admins: every page; others: the pages ticked on Setup (none ticked = all). */
export function canOpen(viewId, desk = currentDesk()) {
    if (!desk || desk.role === 'admin' || ALWAYS_OPEN.includes(viewId)) return true;
    return !Array.isArray(desk.pages) || desk.pages.includes(viewId);
}

/** The site this login works on: its own; only an admin may look at another. */
export const siteFor = (desk, wanted) => (desk && desk.role !== 'admin') ? desk.site : wanted;

/** Re-read this desk's name/site/role/pages from the server (the admin may have changed them). */
export async function refreshDesk() {
    const s = getSession();
    if (!s) return null;
    const { desk } = await request('GET', '/api/me');
    const now = getSession();
    if (!now || now.token !== s.token) return null;
    if (JSON.stringify(desk) !== JSON.stringify(now.desk)) {
        localStorage.setItem(SESSION_KEY, JSON.stringify({ ...now, desk }));
        emit('pms:desk-changed', { desk });
    }
    return desk;
}

// admin: everything · desk: own site · viewer: nothing
export function canWrite(siteId) {
    const d = currentDesk();
    return !!d && (d.role === 'admin' || (d.role === 'desk' && d.site === siteId));
}

export const state = { lastSync: null, online: true };
const emit = (name, detail) => window.dispatchEvent(new CustomEvent(name, { detail }));

export async function request(method, path, body) {
    const s = getSession();
    let res;
    try {
        res = await fetch(apiBase() + path, {
            method,
            headers: { 'Content-Type': 'application/json', ...(s ? { Authorization: 'Bearer ' + s.token } : {}) },
            body: body === undefined ? undefined : JSON.stringify(body),
            cache: 'no-store',
        });
    } catch {
        if (state.online) { state.online = false; emit('pms:sync', { ...state }); }
        throw new OfflineError();
    }
    if (!state.online) { state.online = true; emit('pms:sync', { ...state }); }
    let data = null;
    try { data = await res.json(); } catch { }
    if (res.status === 401 && s && path !== '/api/login') {
        await forgetSession();
        emit('pms:logged-out', { reason: data?.error || 'Please log in again.' });
    }
    if (!res.ok) throw new ApiError(res.status, data?.error || `Server error (${res.status})`, data);
    return data;
}

export async function login(name, password) {
    const d = await request('POST', '/api/login', { name, password });
    const prev = getSession();
    localStorage.setItem(SESSION_KEY, JSON.stringify({ token: d.token, desk: d.desk, api: apiBase(), expiresAt: d.expiresAt }));
    if (!prev || prev.api !== apiBase()) await wipeMirror();
    await sync({ force: true });
    emit('pms:logged-in', { desk: d.desk });
    return d.desk;
}

export async function logout() {
    try { await request('POST', '/api/logout'); } catch { }
    await forgetSession();
    emit('pms:logged-out', { reason: '' });
}

// Shared desk computers: signing out also removes the local copy of the data
async function forgetSession() {
    try { localStorage.removeItem(SESSION_KEY); } catch { }
    state.lastSync = null;
    await wipeMirror();
}

/* --------------------------------- mirror --------------------------------- */

let mirrorDb = null;
function openMirror() {
    if (mirrorDb) return mirrorDb;
    mirrorDb = new Promise((resolve, reject) => {
        const req = indexedDB.open(MIRROR, 1);
        req.onupgradeneeded = () => {
            const db = req.result;
            if (!db.objectStoreNames.contains('slips')) db.createObjectStore('slips', { keyPath: 'id' });
            if (!db.objectStoreNames.contains('meta')) db.createObjectStore('meta');
        };
        req.onsuccess = () => {
            req.result.onversionchange = () => { req.result.close(); mirrorDb = null; };
            resolve(req.result);
        };
        req.onerror = () => { mirrorDb = null; reject(req.error); };
    });
    return mirrorDb;
}

const req2p = (rq) => new Promise((res, rej) => { rq.onsuccess = () => res(rq.result); rq.onerror = () => rej(rq.error); });

async function tx(stores, mode, fn) {
    const db = await openMirror();
    return new Promise((resolve, reject) => {
        const t = db.transaction(stores, mode);
        let out;
        Promise.resolve(fn(t)).then(v => { out = v; }, reject);
        t.oncomplete = () => resolve(out);
        t.onerror = () => reject(t.error);
        t.onabort = () => reject(t.error || new Error('mirror transaction aborted'));
    });
}

async function wipeMirror() {
    try { await tx(['slips', 'meta'], 'readwrite', t => { t.objectStore('slips').clear(); t.objectStore('meta').clear(); }); } catch { }
}

export async function mirrorAll(siteId) {
    const rows = await tx(['slips'], 'readonly', t => req2p(t.objectStore('slips').getAll()));
    return siteId ? rows.filter(r => r.site === siteId) : rows;
}
export const mirrorGet = (id) => tx(['slips'], 'readonly', t => req2p(t.objectStore('slips').get(Number(id))));
export const mirrorPut = (slip) => tx(['slips'], 'readwrite', t => { t.objectStore('slips').put(slip); });
export const mirrorDelete = (id) => tx(['slips'], 'readwrite', t => { t.objectStore('slips').delete(Number(id)); });

/* ---------------------------------- sync ---------------------------------- */

let inflight = null;

// Remember when this copy was last synced, so an offline start can say how old the data is
if (getSession()) {
    tx(['meta'], 'readonly', t => req2p(t.objectStore('meta').get('lastSync')))
        .then(at => { if (at && !state.lastSync) { state.lastSync = at; emit('pms:sync', { ...state }); } })
        .catch(() => { });
}

// Pull everything that changed since the last cursor. Cheap when nothing changed (one small request).
export function sync({ force = false } = {}) {
    if (!getSession()) return Promise.resolve();
    // a forced sync (after a write) must start after any sync already running, which may predate the write
    if (inflight) return force ? inflight.catch(() => { }).then(() => sync({ force: true })) : inflight;
    if (!force && state.lastSync && Date.now() - state.lastSync < 3000) return Promise.resolve();
    inflight = (async () => {
        let cursor = (await tx(['meta'], 'readonly', t => req2p(t.objectStore('meta').get('cursor')))) || { seq: 0, id: 0 };
        for (let page = 0; page < 100; page++) {
            const r = await request('GET', `/api/slips?seq=${cursor.seq}&id=${cursor.id}`);
            cursor = r.cursor;
            await tx(['slips', 'meta'], 'readwrite', t => {
                const st = t.objectStore('slips');
                for (const s of r.slips) s.deleted ? st.delete(s.id) : st.put(s);
                t.objectStore('meta').put(cursor, 'cursor');
            });
            if (!r.more) break;
        }
        state.lastSync = Date.now();
        tx(['meta'], 'readwrite', t => { t.objectStore('meta').put(state.lastSync, 'lastSync'); }).catch(() => { });
        emit('pms:sync', { ...state });
    })().finally(() => { inflight = null; });
    return inflight;
}
