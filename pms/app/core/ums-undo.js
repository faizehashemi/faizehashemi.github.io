// UMS Import → Import history: every applied import (by hand or automatic) can be undone and redone, after the login confirms its password.
// Kept on the computer that ran the import (IndexedDB "pms-ums-undo"), the last 15 per site. An entry holds, per slip it changed, the fields
// the import changed before and after (and the slip's ums record); per slip it created, the slip itself.
//   Undo  — the changed fields go back to what they were (anything else the desk did since stays); the slips it created are deleted,
//           unless rooms were assigned to them since (those are left and named).
//   Redo  — the import's values go back on; its new slips are made again.
// Order: only the newest import still applied can be undone, and only the last one undone can be redone (a stack).
import { request } from './cloud.js';

const DB = 'pms-ums-undo', STORE = 'imports', KEEP = 15;
const open = () => new Promise((res, rej) => {
    const r = indexedDB.open(DB, 1);
    r.onupgradeneeded = () => { const s = r.result.createObjectStore(STORE, { keyPath: 'id', autoIncrement: true }); s.createIndex('site', 'site'); };
    r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error);
});
const tx = async (mode, fn) => { const db = await open(); return new Promise((res, rej) => { const t = db.transaction(STORE, mode); const out = fn(t.objectStore(STORE)); t.oncomplete = () => res(out?.result ?? out); t.onerror = () => rej(t.error); }); };
const pick = (o, keys) => Object.fromEntries(keys.map(k => [k, o?.[k] === undefined ? '' : o[k]]));
const hasRooms = (s) => [...(s.rooms?.gents || []), ...(s.rooms?.ladies || [])].some(r => String(r.room_no || '').trim());

/** After applyPlan: remember what it did (nothing is kept for an import that changed nothing) */
export async function recordImport(siteId, plan, info = {}) {
    const updates = plan.update.map(u => { const f = [...Object.keys(u.changes || {}), 'ums']; return { id: u.id, sh: u.before.sh_no, fields: f, before: pick(u.before, f), after: pick(u.rec, f) }; });
    const created = plan.create.map(c => ({ key: c.key, sh: c.rec.sh_no, rec: c.rec }));
    if (!updates.length && !created.length) return null;
    try {
        await tx('readwrite', s => s.add({ site: siteId, at: new Date().toISOString(), ...info, updates, created, applied: true, history: [] }));
        const old = (await listImports(siteId)).slice(KEEP);
        if (old.length) await tx('readwrite', s => { for (const e of old) s.delete(e.id); });
    } catch (e) { console.warn('UMS undo record not kept', e); }
    return true;
}
/** This site's imports, newest first */
export async function listImports(siteId) {
    try {
        const all = await tx('readonly', s => s.index('site').getAll(siteId));
        return (all || []).sort((a, b) => b.id - a.id);
    } catch { return []; }
}
export const canUndo = (list, e) => e.applied && list.slice(0, list.indexOf(e)).every(x => !x.applied);
export const canRedo = (list, e) => !e.applied && list.slice(list.indexOf(e) + 1).every(x => x.applied);

/** The login's own password, checked by the server (wrong passwords count towards the login lock) */
export const confirmPassword = (password) => request('POST', '/api/me/verify-password', { password });

async function save(entry, patch) { await tx('readwrite', s => s.put({ ...entry, ...patch })); }

/** Undo (`way` 'undo') or redo ('redo') one import. Returns { updated, deleted, created, skipped: [text] }. */
export async function replay(db, entry, way) {
    const all = await db.all(), byId = new Map(all.map(s => [s.id, s])), now = new Date().toISOString();
    const out = { updated: 0, deleted: 0, created: 0, skipped: [] };
    const puts = [];
    for (const u of entry.updates) {
        const cur = byId.get(u.id);
        if (!cur || cur.deleted) { out.skipped.push(`SH ${u.sh}: slip no longer there`); continue; }
        puts.push({ ...cur, ...(way === 'undo' ? u.before : u.after), updatedAt: now });
    }
    if (puts.length) { const r = await db.bulkWrite({ put: puts }, `ums-${way}`); out.updated = r.updated; if (r.skipped) out.skipped.push(`${r.skipped} slip(s) changed on another desk meanwhile`); }
    if (way === 'undo') {
        for (const c of entry.created) {
            const cur = all.find(s => !s.deleted && s.ums?.key === c.key && s.createdAt === c.rec.createdAt);
            if (!cur) continue;
            if (hasRooms(cur)) { out.skipped.push(`SH ${c.sh}: rooms were assigned since — not deleted`); continue; }
            await db.remove(cur.id); out.deleted++;
        }
    } else {
        const add = entry.created.filter(c => !all.some(s => !s.deleted && s.ums?.key === c.key)).map(c => ({ ...c.rec, createdAt: now }));
        if (add.length) { const r = await db.bulkWrite({ add }, 'ums-redo'); out.created = r.created; }
        // the slips made again carry the new createdAt, so a later undo finds them
        entry = { ...entry, created: entry.created.map(c => ({ ...c, rec: add.find(a => a.ums?.key === c.key) || c.rec })) };
    }
    await save(entry, { applied: way === 'redo', history: [...(entry.history || []), { way, at: now, ...out }] });
    return out;
}
