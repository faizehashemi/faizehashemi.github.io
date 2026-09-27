// Bridge to the "PMS — UMS sync" Chrome extension (extension/) and automatic imports.
//
// The extension's content script posts messages into this page:
//   { source: 'pms-ums-extension', type: 'hello',  version }
//   { source: 'pms-ums-extension', type: 'file',   html, fetchedAt, fileName }
//   { source: 'pms-ums-extension', type: 'status', ok, error, at }
// and this page can ask it to fetch now: { source: 'pms-app', type: 'fetch-now' | 'get-latest' }.
//
// If "auto-import" is switched on for a site on this device, every new file is applied to that
// site's local data and published, exactly like pressing Apply on the UMS page.
// Events for the UI: 'pms:ums-ext', 'pms:ums-file', 'pms:ums-status', 'pms:ums-applied'.

import { UMS, SITES } from '../config.js';
import { createDb, ConflictError } from './db.js';
import { canWrite } from './cloud.js';
import { umsConfig } from './settings.js';
import { track } from './analytics.js';
import { parseUms, planImport, applyPlan, summarize, hashText, writeLog, lastApplied, setLastApplied } from './ums.js';

const AUTO_KEY = 'pms_ums_auto';

export const ext = { connected: false, version: null, lastStatus: null, latestFile: null };

export function getAutoSite() { try { return localStorage.getItem(AUTO_KEY) || ''; } catch { return ''; } }
export function setAutoSite(siteId) { try { siteId ? localStorage.setItem(AUTO_KEY, siteId) : localStorage.removeItem(AUTO_KEY); } catch { } }

export function askExtension(type) {
    window.postMessage({ source: 'pms-app', type }, location.origin);
}

const emit = (name, detail) => window.dispatchEvent(new CustomEvent(name, { detail }));

/**
 * Plan + apply + publish + log for one site. Used by both the UMS page and auto-import.
 * Serialized across tabs with a Web Lock so two open PMS tabs never apply the same file twice.
 */
export async function runImport({ siteId, html, fileName, via, fetchedAt, planOverride, force = false }) {
    const work = async () => {
        const hash = hashText(html);
        const prev = lastApplied(siteId);
        if (!force && prev?.hash === hash) return { skipped: 'already imported' };

        const parsed = parseUms(html);
        const base = { at: new Date().toISOString(), via, fileName: fileName || '', fetchedAt: fetchedAt || null, rows: parsed.rowCount };
        if (parsed.fatal) { writeLog(siteId, { ...base, result: 'rejected', error: parsed.fatal }); return { error: parsed.fatal }; }
        if (!force && prev?.rows && parsed.rowCount < prev.rows * UMS.minRowShare) {
            const error = `Held for review: ${parsed.rowCount} rows vs ${prev.rows} last time. Open the UMS page to check and apply it.`;
            writeLog(siteId, { ...base, result: 'held', error });
            return { error, held: true };
        }

        if (!canWrite(siteId)) {
            const error = `This login cannot change ${SITES[siteId].label} slips.`;
            writeLog(siteId, { ...base, result: 'rejected', error });
            return { error };
        }
        const db = createDb(siteId);
        // Plan against the freshly synced data. If another desk changed a slip in between, the
        // server refuses that chunk; re-plan once against the new data.
        const cfg = await umsConfig(); // admin's travel times (Setup page)
        let plan = planOverride || planImport(parsed, await db.all(), siteId, cfg);
        let res;
        try { res = await applyPlan(db, plan); }
        catch (e) {
            if (!(e instanceof ConflictError)) throw e;
            plan = planImport(parsed, await db.all(), siteId, cfg);
            res = await applyPlan(db, plan);
        }
        const sum = summarize(plan);
        if (res && res.skipped) sum.created -= res.skipped; // stays another desk had just imported
        setLastApplied(siteId, { hash, rows: parsed.rowCount, at: base.at, fetchedAt: base.fetchedAt });
        writeLog(siteId, { ...base, result: 'applied', ...sum, errors: parsed.errors.length, warnings: parsed.warnings.length + plan.warnings.length });
        track('ums_import', { site: siteId, via, rows: parsed.rowCount, created: sum.created, updated: sum.updated, attention: sum.attention });
        return { plan, summary: sum, parsed };
    };
    return navigator.locks ? navigator.locks.request(`pms-ums-${siteId}`, work) : work();
}

async function onFile(file) {
    ext.latestFile = file;
    emit('pms:ums-file', file);
    const siteId = getAutoSite();
    if (!siteId) return;
    try {
        const res = await runImport({ siteId, html: file.html, fileName: file.fileName, fetchedAt: file.fetchedAt, via: 'auto' });
        if (!res.skipped) emit('pms:ums-applied', { siteId, ...res });
    } catch (e) {
        console.error('UMS auto-import failed', e);
        writeLog(siteId, { at: new Date().toISOString(), via: 'auto', result: 'failed', error: String(e?.message || e) });
        emit('pms:ums-applied', { siteId, error: String(e?.message || e) });
    }
}

window.addEventListener('message', (e) => {
    if (e.source !== window || e.origin !== location.origin) return;
    const m = e.data;
    if (!m || m.source !== 'pms-ums-extension') return;
    if (m.type === 'hello') { ext.connected = true; ext.version = m.version || null; emit('pms:ums-ext', { ...ext }); }
    else if (m.type === 'status') { ext.lastStatus = m; emit('pms:ums-status', m); }
    else if (m.type === 'file' && typeof m.html === 'string') onFile({ html: m.html, fetchedAt: m.fetchedAt, fileName: m.fileName });
});
