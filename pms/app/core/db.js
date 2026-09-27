// The only module the pages use for slips. Same interface as before; the data now lives in the
// cloud (Cloudflare Worker + D1, worker/worker.js) and is read from the browser's synced mirror.
//
//   all / get / latestBySh   — this site's slips (synced first when online; mirror when offline)
//   add / update / remove    — straight to the server; refused if this login may not change this site
//   bulkWrite / clear        — imports and "delete all"
//
// Each slip carries `_v` (its version). An update sends the version it was based on; if another
// desk saved in between, the server refuses and the page shows a "reload and try again" message.

import { SITES, siteOfBuilding } from '../config.js';
import { request, sync, mirrorAll, mirrorGet, mirrorPut, mirrorDelete, canWrite, currentDesk, state, UserError, ApiError } from './cloud.js';
import { track } from './analytics.js';

export class ReadOnlyError extends UserError { }
export class ConflictError extends UserError { }

const BULK_CHUNK = 45; // matches the Worker's per-request limit

// Server-owned fields never go back up
const payload = (rec) => { const { id, _v, _seq, deleted, ...rest } = rec; return rest; };

function readOnlyReason(siteId) {
    const d = currentDesk();
    if (!d) return 'Please log in.';
    if (d.role === 'viewer') return `“${d.name}” is a read-only login.`;
    return `Signed in as “${d.name}” (${SITES[d.site]?.label}). ${SITES[siteId].label} slips are read-only here.`;
}

// Pull fresh data if we can; stay usable from the mirror if we cannot.
// After a write, `force` so the copy is guaranteed to include it (no throttling, no reuse of an
// older sync that was already running).
async function fresh(force = false) {
    try { await sync({ force }); } catch (e) { if (!(e instanceof UserError)) throw e; }
}

async function send(fn) {
    try { return await fn(); }
    catch (e) {
        if (e instanceof ApiError && e.status === 409) {
            track('slip_conflict');
            if (e.extra.current) await mirrorPut(e.extra.current);
            else await fresh(true);
            throw new ConflictError(e.message);
        }
        if (e instanceof ApiError && e.status === 404) await fresh(true);
        throw e;
    }
}

export function createDb(siteId) {
    const site = SITES[siteId];
    const writable = canWrite(siteId);
    const guard = () => { if (!writable) throw new ReadOnlyError(readOnlyReason(siteId)); };

    const api = {
        site,
        source: 'cloud',
        readonly: !writable,
        readonlyReason: writable ? '' : readOnlyReason(siteId),

        async all() {
            await fresh();
            return mirrorAll(siteId);
        },

        async get(id) {
            await fresh();
            const r = await mirrorGet(id);
            return r && r.site === siteId ? r : null;
        },

        // Latest slip (by createdAt, then id) with this SH number, for this site
        async latestBySh(sh) {
            const key = String(sh ?? '').trim();
            if (!key) return null;
            const rows = (await api.all()).filter(r => String(r.sh_no ?? '').trim() === key);
            rows.sort((a, b) => {
                const tb = Date.parse(b.createdAt) || 0, ta = Date.parse(a.createdAt) || 0;
                if (tb !== ta) return tb - ta;
                return (Number(b.id) || 0) - (Number(a.id) || 0);
            });
            return rows[0] || null;
        },

        // The site comes from the slip itself or its building first, so an imported backup of the
        // other site is refused instead of being relabelled.
        async add(rec) {
            guard();
            const target = rec.site || siteOfBuilding(rec.building) || siteId;
            const { slip } = await send(() => request('POST', '/api/slips', { slip: { ...payload(rec), site: target } }));
            await mirrorPut(slip);
            track('slip_created', { site: slip.site, has_rooms: !!(slip.rooms?.gents?.length || slip.rooms?.ladies?.length) });
            return slip.id;
        },

        async update(id, patch) {
            guard();
            const old = await mirrorGet(id);
            if (!old) throw new ConflictError('This slip is no longer there (deleted on another desk?). Reload the page.');
            const next = { ...payload(old), ...payload(patch), createdAt: old.createdAt, updatedAt: new Date().toISOString() };
            const { slip } = await send(() => request('PUT', `/api/slips/${Number(id)}`, { slip: next, version: old._v }));
            await mirrorPut(slip);
            track('slip_updated', { site: slip.site });
            return slip.id;
        },

        async remove(id) {
            guard();
            const old = await mirrorGet(id);
            await send(() => request('DELETE', `/api/slips/${Number(id)}${old ? `?version=${old._v}` : ''}`));
            await mirrorDelete(id);
        },

        async clear() {
            guard();
            const { deleted } = await send(() => request('POST', '/api/slips/clear', { site: siteId }));
            await fresh(true);
            return { deleted, keptShared: 0 };
        },

        // Adds + full-record replacements (records from all(), carrying _v), sent in chunks.
        // Each chunk is all-or-nothing on the server.
        async bulkWrite({ add = [], put = [] }, reason = 'bulk') {
            guard();
            const ops = [...add.map(r => ({ add: payload(r) })), ...put.map(r => ({ put: { id: r.id, version: r._v, slip: payload(r) } }))];
            const total = { created: 0, updated: 0, skipped: 0 };
            try {
                for (let i = 0; i < ops.length; i += BULK_CHUNK) {
                    const chunk = ops.slice(i, i + BULK_CHUNK);
                    const r = await send(() => request('POST', '/api/slips/bulk', {
                        site: siteId, reason,
                        add: chunk.filter(o => o.add).map(o => o.add),
                        put: chunk.filter(o => o.put).map(o => o.put),
                    }));
                    total.created += r.created; total.updated += r.updated; total.skipped += r.skipped;
                }
            } finally {
                await fresh(true);
            }
            return total;
        },

        async health() {
            const rows = await api.all();
            return {
                name: 'PMS cloud (D1)',
                version: state.lastSync ? 'synced ' + new Date(state.lastSync).toLocaleTimeString() : 'not synced',
                stores: [state.online ? 'online' : 'OFFLINE'],
                count: rows.length,
            };
        },
    };
    return api;
}

/* ------------------------------------------------------------------------------------------
   The old per-browser database, read only by the Setup page to upload it to the cloud.
   ------------------------------------------------------------------------------------------ */

const LEGACY_DB = 'pms_accommodation_db';

export async function legacyExists() {
    if (!indexedDB.databases) return true;
    return (await indexedDB.databases()).some(d => d.name === LEGACY_DB);
}

export async function legacyAllSlips() {
    if (!(await legacyExists())) return [];
    const db = await new Promise((res, rej) => { const r = indexedDB.open(LEGACY_DB); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); });
    try {
        if (!db.objectStoreNames.contains('slips')) return [];
        return await new Promise((res, rej) => { const q = db.transaction('slips', 'readonly').objectStore('slips').getAll(); q.onsuccess = () => res(q.result || []); q.onerror = () => rej(q.error); });
    } finally { db.close(); }
}

// Which site an old slip belongs to (null = no site and no known building)
export const legacySiteOf = (rec) => rec.site || siteOfBuilding(rec.building);
