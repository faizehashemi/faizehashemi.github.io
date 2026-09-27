// UMS "Group List" import: parse → split into per-city stays → plan changes → apply.
//
// The UMS export (GroupList*.xls) is an HTML <table>, not a real spreadsheet. One row = one group
// (keyed by SH Ref). A group's itinerary becomes one PMS slip per stay per city, e.g.
//   arrive Makkah → Madina → back to Makkah   =  Makkah #1, Medina #1, Makkah #2
//
// Ownership: UMS owns group data (name, leader, pax, dates/times). PMS owns building and rooms,
// which an import never touches. Nothing is ever deleted: slips whose stay vanished from the
// export are only reported. A hand edit to a UMS-managed field is kept until UMS itself changes
// that field (three-way merge against the values the previous import applied).

import { SITES, UMS } from '../config.js';

/* --------------------------------- parse --------------------------------- */

const norm = (s) => String(s ?? '').replace(/\s+/g, ' ').trim();
const key = (s) => norm(s).toLowerCase().replace(/[^a-z0-9]/g, '');

// header text (normalised) → field. "First Arrrival" is misspelled in UMS; accept any number of r's.
const COLUMNS = [
    ['sr', k => k === 'srno'],
    ['sh', k => k === 'shref'],
    ['operator', k => k === 'touroperator'],
    ['country', k => k === 'country'],
    ['arrival', k => k === 'arrival'],
    ['firstArrival', k => /^firstar+ival$/.test(k)],
    ['madinaDate', k => k === 'madinadate'],
    ['madinaMakkah', k => k === 'madinamakkah'],
    ['departure', k => k === 'departure'],
    ['gents', k => k === 'g'],
    ['ladies', k => k === 'l'],
    ['children', k => k === 'ch'],
    ['infants', k => k === 'inf'],
    ['total', k => k === 'tot'],
    ['depAirport', k => k === 'depairport'],
    ['status', k => k === 'status'],
];
const REQUIRED = ['sh', 'operator', 'arrival', 'firstArrival', 'madinaDate', 'madinaMakkah', 'departure', 'gents', 'ladies', 'children', 'infants', 'total'];

// "25-11-2026 10:20 FLYNAS AIR-0000 @ JEDDAH"
function parseFlight(text) {
    const m = norm(text).match(/(\d{1,2})-(\d{1,2})-(\d{4})\s+(\d{1,2}):(\d{2})\s*(.*?)\s*(?:@\s*(.*))?$/);
    if (!m) return null;
    const p2 = (n) => String(n).padStart(2, '0');
    return { date: `${m[3]}-${p2(m[2])}-${p2(m[1])}`, time: `${p2(m[4])}:${m[5]}`, flight: norm(m[6]), port: norm(m[7] || '') };
}

// "10/12/2026" → "2026-12-10"
function parseDay(text) {
    const m = norm(text).match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
    return m ? `${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}` : null;
}

// "[FAMILY]-NAME[+923003487052] Group Pax Limit: 1 Visa Holders:- Umrah Visa:1, Tourist Visa:2, GL:NAME-+91…"
function parseOperator(text) {
    const t = norm(text);
    const out = { family: false, name: '', phone: '', paxLimit: null, visas: {}, glName: '', glPhone: '' };
    const nm = t.match(/^(\[FAMILY\]\s*-\s*)?(.*?)\s*\[\s*(\+?[\d\s-]*?)\s*\]/i);
    if (nm) {
        out.family = !!nm[1];
        out.name = norm(nm[2]);
        out.phone = nm[3].replace(/[\s-]/g, '');
    } else {
        const before = t.split(/Group\s*Pax\s*Limit/i)[0];
        out.family = /^\[FAMILY\]/i.test(before);
        out.name = norm(before.replace(/^\[FAMILY\]\s*-\s*/i, ''));
    }
    const pax = t.match(/Group\s*Pax\s*Limit:\s*(\d+)/i);
    if (pax) out.paxLimit = Number(pax[1]);
    const vis = t.match(/Visa\s*Holders:-?\s*(.*?)(?:\bGL:|$)/i);
    if (vis) for (const v of vis[1].matchAll(/([A-Za-z][A-Za-z ]*?)\s*Visa:\s*(\d+)/g)) out.visas[norm(v[1])] = Number(v[2]);
    const gl = t.match(/\bGL:\s*(.*)$/i);
    if (gl) {
        const g = norm(gl[1]);
        const gp = g.match(/^(.*?)\s*-\s*(\+?\d[\d ]*)$/);
        out.glName = gp ? norm(gp[1]) : g;
        out.glPhone = gp ? gp[2].replace(/\s/g, '') : '';
    }
    return out;
}

const int = (v) => { const n = parseInt(norm(v), 10); return Number.isFinite(n) ? n : 0; };

/**
 * Parse the UMS export. Never throws for bad rows; returns them in `errors`.
 * @returns {{ groups: object[], errors: string[], warnings: string[], fatal: string|null, rowCount: number }}
 */
export function parseUms(html) {
    const res = { groups: [], errors: [], warnings: [], fatal: null, rowCount: 0 };
    const doc = new DOMParser().parseFromString(String(html || ''), 'text/html');
    const table = [...doc.querySelectorAll('table')].find(t => [...t.querySelectorAll('th')].some(th => key(th.textContent) === 'shref'));
    if (!table) { res.fatal = 'This is not a UMS Group List export (no table with an "SH Ref" column). If it came from the extension, the UMS session may have expired.'; return res; }

    const trs = [...table.querySelectorAll('tr')];
    const headerRow = trs.find(tr => tr.querySelector('th'));
    const headers = [...headerRow.querySelectorAll('th')].map(th => key(th.textContent));
    const col = {};
    for (const [field, test] of COLUMNS) {
        const i = headers.findIndex(test);
        if (i >= 0) col[field] = i; // first match wins ("Arrival" appears twice)
    }
    const missing = REQUIRED.filter(f => col[f] === undefined);
    if (missing.length) { res.fatal = `UMS layout changed: column(s) not found: ${missing.join(', ')}. Nothing was imported.`; return res; }

    const seen = new Set();
    for (const tr of trs) {
        if (tr === headerRow || !tr.querySelector('td')) continue;
        // expand colspans so later columns keep their index ("Will Not Travel Madina" spans two)
        const cells = [];
        for (const td of tr.querySelectorAll(':scope > td')) {
            const span = Math.max(1, parseInt(td.getAttribute('colspan') || '1', 10) || 1);
            for (let i = 0; i < span; i++) cells.push(td);
        }
        const text = (f) => cells[col[f]] ? norm(cells[col[f]].textContent) : '';
        if (/GRAND\s*TOTAL/i.test(tr.textContent)) {
            res.grandTotal = { gents: int(text('gents')), ladies: int(text('ladies')), children: int(text('children')), infants: int(text('infants')), total: int(text('total')) };
            continue;
        }
        const sh = text('sh');
        if (!/^\d+$/.test(sh)) { if (norm(tr.textContent)) res.warnings.push(`Skipped a row without an SH Ref: "${norm(tr.textContent).slice(0, 60)}…"`); continue; }
        res.rowCount++;
        if (seen.has(sh)) { res.warnings.push(`SH ${sh} appears twice; the first row was used.`); continue; }
        seen.add(sh);

        const arrival = parseFlight(text('arrival'));
        const departure = parseFlight(text('departure'));
        if (!arrival || !departure) { res.errors.push(`SH ${sh}: could not read the ${!arrival ? 'arrival' : 'departure'} date/time ("${text(!arrival ? 'arrival' : 'departure')}").`); continue; }

        const md = text('madinaDate'), mm = text('madinaMakkah');
        const noMadina = /will\s*not\s*travel/i.test(md) || /will\s*not\s*travel/i.test(mm);
        const op = parseOperator(text('operator'));
        const g = {
            sh, operator: op, country: text('country'),
            arrival, departure,
            firstArrival: text('firstArrival').toUpperCase(),
            noMadina,
            madinaDate: noMadina ? null : parseDay(md),
            makkahDate: noMadina ? null : parseDay(mm),          // date they move Madina → Makkah
            depFromMadina: !noMadina && /dep\s*from\s*madina/i.test(mm),
            gents: int(text('gents')), ladies: int(text('ladies')), children: int(text('children')), infants: int(text('infants')),
            total: int(text('total')),
            depAirport: text('depAirport'), status: text('status'),
        };
        if (g.gents + g.ladies + g.children + g.infants !== g.total) res.warnings.push(`SH ${sh}: G+L+CH+INF (${g.gents + g.ladies + g.children + g.infants}) ≠ Tot (${g.total}).`);
        if (!noMadina && !g.madinaDate) res.warnings.push(`SH ${sh}: unreadable Madina Date "${md}".`);
        res.groups.push(g);
    }
    if (!res.groups.length && !res.errors.length) res.fatal = 'The export has no group rows.';
    // UMS prints a GRAND TOTAL row; if our per-group sums disagree, rows were lost or misread
    if (res.grandTotal && !res.errors.length) {
        const off = ['gents', 'ladies', 'children', 'infants', 'total']
            .map(f => [f, res.groups.reduce((n, g) => n + g[f], 0), res.grandTotal[f]])
            .filter(([, got, want]) => got !== want);
        if (off.length) res.warnings.unshift(`Totals differ from the UMS GRAND TOTAL row: ${off.map(([f, got, want]) => `${f} ${got} vs ${want}`).join(', ')}.`);
    }
    return res;
}

/* -------------------------------- itinerary -------------------------------- */

const minTime = (a, b) => (a < b ? a : b);

/**
 * Split a group into hotel stays per city.
 * @returns {{ stays: {site, start:{date,time}, end:{date,time}, n}[], warnings: string[] }}
 */
export function staysOf(g, cfg = UMS) {
    const city = (c) => Object.values(SITES).find(s => s.umsCity === c)?.id;
    const makkah = city('MAKKAH'), medina = city('MADINA');
    const A = { date: g.arrival.date, time: g.arrival.time };
    const D = { date: g.departure.date, time: minTime(cfg.checkoutTime, g.departure.time) };
    const outOf = (date) => ({ date, time: cfg.checkoutTime });      // leave a city mid-trip
    const into = (date) => ({ date, time: cfg.transferCheckinTime }); // arrive in the next city
    const warnings = [];
    let legs;

    if (g.noMadina) {
        if (g.firstArrival === 'MADINA') warnings.push(`SH ${g.sh}: first arrival is MADINA but "Will Not Travel Madina" — treated as a Makkah-only stay.`);
        legs = [[makkah, A, D]];
    } else if (!g.madinaDate) {
        legs = [[g.firstArrival === 'MADINA' ? medina : makkah, A, D]];
        warnings.push(`SH ${g.sh}: no usable Madina date — imported as a single stay.`);
    } else if (g.firstArrival === 'MADINA') {
        legs = g.depFromMadina || !g.makkahDate
            ? [[medina, A, D]]
            : [[medina, A, outOf(g.makkahDate)], [makkah, into(g.makkahDate), D]];
    } else {
        legs = [[makkah, A, outOf(g.madinaDate)]];
        if (g.depFromMadina || !g.makkahDate) legs.push([medina, into(g.madinaDate), D]);
        else legs.push([medina, into(g.madinaDate), outOf(g.makkahDate)], [makkah, into(g.makkahDate), D]);
    }

    const stays = [];
    const count = {};
    for (const [site, start, end] of legs) {
        if (`${end.date}T${end.time}` <= `${start.date}T${start.time}`) {
            warnings.push(`SH ${g.sh}: ${SITES[site].label} stay ${start.date} ${start.time} → ${end.date} ${end.time} has no length — skipped.`);
            continue;
        }
        count[site] = (count[site] || 0) + 1;
        stays.push({ site, start, end, n: count[site] });
    }
    return { stays, warnings };
}

/* ----------------------------------- plan ----------------------------------- */

// Fields UMS owns. building / rooms and anything else on a slip belong to the PMS.
export const MANAGED = ['tour_name', 'group_leader', 'sh_no', 'checkin_date', 'checkin_time', 'checkout_date', 'checkout_time', 'gents', 'ladies', 'children', 'infants', 'total'];
const DATE_FIELDS = ['checkin_date', 'checkin_time', 'checkout_date', 'checkout_time'];
const eq = (a, b) => String(a ?? '').trim() === String(b ?? '').trim();
const dayNo = (ymd) => { const [y, m, d] = String(ymd || '').split('-').map(Number); return y ? Date.UTC(y, m - 1, d) / 864e5 : NaN; };

function umsValues(g, stay) {
    const op = g.operator;
    return {
        tour_name: op.name || `${op.family ? 'FAMILY' : 'GROUP'} SH ${g.sh}`,
        group_leader: op.glName,
        sh_no: Number(g.sh),
        checkin_date: stay.start.date, checkin_time: stay.start.time,
        checkout_date: stay.end.date, checkout_time: stay.end.time,
        gents: g.gents, ladies: g.ladies, children: g.children, infants: g.infants, total: g.total,
    };
}

function umsMeta(g, stay, now) {
    const op = g.operator;
    return {
        key: `${g.sh}|${stay.site}|${stay.n}`, ref: g.sh, seg: stay.n,
        family: op.family, operator: op.name, phone: op.phone, paxLimit: op.paxLimit, visas: op.visas,
        glName: op.glName, glPhone: op.glPhone, country: g.country,
        arrival: g.arrival, departure: g.departure, firstArrival: g.firstArrival,
        itinerary: g.noMadina ? 'MAKKAH' : (g.firstArrival === 'MADINA'
            ? (g.depFromMadina ? 'MADINA' : 'MADINA→MAKKAH')
            : (g.depFromMadina ? 'MAKKAH→MADINA' : 'MAKKAH→MADINA→MAKKAH')),
        status: g.status, importedAt: now,
    };
}

const hasRooms = (s) => [...(s.rooms?.gents || []), ...(s.rooms?.ladies || [])].some(r => String(r.room_no || '').trim());
const assignedBeds = (s) => [...(s.rooms?.gents || []), ...(s.rooms?.ladies || [])].reduce((n, r) => n + (Number(r.assigned) || 0), 0);

/**
 * Work out what an import would do for one site. Pure: reads `existing`, writes nothing.
 * @param parsed   result of parseUms()
 * @param existing this site's slips (db.all())
 */
export function planImport(parsed, existing, siteId, cfg = UMS) {
    const now = new Date().toISOString();
    const plan = { siteId, create: [], update: [], kept: [], unchanged: 0, missing: [], warnings: [], stays: 0, groups: 0, otherSiteStays: 0 };

    const byKey = new Map();
    const unlinkedBySh = new Map();
    for (const s of existing) {
        if (s.ums?.key) byKey.set(s.ums.key, s);
        else if (String(s.sh_no ?? '').trim()) {
            const k = String(s.sh_no).trim();
            if (!unlinkedBySh.has(k)) unlinkedBySh.set(k, []);
            unlinkedBySh.get(k).push(s);
        }
    }
    const claimed = new Set();
    const seenKeys = new Set();

    for (const g of parsed.groups) {
        const { stays, warnings } = staysOf(g, cfg);
        plan.warnings.push(...warnings);
        const mine = stays.filter(st => st.site === siteId);
        plan.otherSiteStays += stays.length - mine.length;
        if (mine.length) plan.groups++;

        for (const stay of mine) {
            plan.stays++;
            const vals = umsValues(g, stay);
            const meta = umsMeta(g, stay, now);
            seenKeys.add(meta.key);

            // 1) slip already linked to this stay; 2) adopt an unlinked slip with the same SH and a
            //    close check-in (hand-typed or from an older list); 3) otherwise create a new one.
            let slip = byKey.get(meta.key);
            if (!slip) {
                const cands = (unlinkedBySh.get(g.sh) || [])
                    .filter(s => !claimed.has(s.id))
                    .map(s => ({ s, d: Math.abs(dayNo(s.checkin_date) - dayNo(vals.checkin_date)) }))
                    .filter(c => c.d <= cfg.matchWindowDays)
                    .sort((a, b) => a.d - b.d || String(b.s.createdAt).localeCompare(String(a.s.createdAt)));
                slip = cands[0]?.s;
                if (slip) claimed.add(slip.id);
            }

            if (!slip) {
                plan.create.push({
                    key: meta.key,
                    rec: { ...vals, building: '', rooms: { gents: [], ladies: [] }, createdAt: now, site: siteId, ums: { ...meta, applied: vals } },
                });
                continue;
            }

            const base = slip.ums?.applied;
            const changes = {}, kept = {}, notes = [];
            for (const f of MANAGED) {
                const u = vals[f];
                if (f === 'group_leader' && !u) continue; // UMS often has no GL yet; keep whatever the desk typed
                const cur = slip[f];
                if (eq(cur, u)) continue;
                if (!base || !(f in base)) changes[f] = { from: cur, to: u, kind: 'link' };
                else if (eq(cur, base[f])) changes[f] = { from: cur, to: u, kind: 'ums' };
                else if (eq(u, base[f])) kept[f] = { yours: cur, ums: u };            // desk edit, UMS unchanged
                else changes[f] = { from: cur, to: u, kind: 'override', was: base[f] }; // both changed: UMS wins
            }
            const changed = Object.keys(changes);
            if (hasRooms(slip)) {
                if (changed.some(f => DATE_FIELDS.includes(f))) notes.push('dates changed — rooms are assigned; re-check availability');
                const beds = assignedBeds(slip);
                if (changes.total && Number(changes.total.to) > beds) notes.push(`pax ${changes.total.to} is more than the ${beds} bed(s) assigned`);
            }
            for (const [f, c] of Object.entries(changes)) if (c.kind === 'override') notes.push(`your edit to ${f} (${c.from}) replaced — UMS changed it from ${c.was} to ${c.to}`);

            if (Object.keys(kept).length) plan.kept.push({ key: meta.key, slip, kept });
            const linkChanged = slip.ums?.key !== meta.key || !eq(slip.site, siteId);
            if (!changed.length && !linkChanged) { plan.unchanged++; continue; }

            const next = { ...slip, site: slip.site || siteId, updatedAt: now, ums: { ...meta, applied: vals } };
            for (const f of changed) next[f] = changes[f].to;
            plan.update.push({ key: meta.key, id: slip.id, before: slip, rec: next, changes, kept, notes, relinkOnly: !changed.length });
        }
    }

    for (const s of existing) {
        if (s.ums?.key && !seenKeys.has(s.ums.key) && s.site === siteId) plan.missing.push(s);
    }
    return plan;
}

/** Write a plan (chunked bulk writes to the server). Returns { created, updated, skipped }. */
export async function applyPlan(db, plan) {
    return db.bulkWrite({ add: plan.create.map(c => c.rec), put: plan.update.map(u => u.rec) }, 'ums-import');
}

export function summarize(plan) {
    const attention = plan.update.filter(u => u.notes.length).length;
    return { created: plan.create.length, updated: plan.update.filter(u => !u.relinkOnly).length, relinked: plan.update.filter(u => u.relinkOnly).length, unchanged: plan.unchanged, attention, missing: plan.missing.length, stays: plan.stays, groups: plan.groups };
}

// FNV-1a — identifies a file so the same export is not applied twice
export function hashText(text) {
    let h = 0x811c9dc5;
    for (let i = 0; i < text.length; i++) { h ^= text.charCodeAt(i); h = Math.imul(h, 0x01000193); }
    return (h >>> 0).toString(16).padStart(8, '0') + ':' + text.length;
}

/* ------------------------------- import log ------------------------------- */

const LOG_KEY = (siteId) => `pms_ums_log_${siteId}`;
const LAST_KEY = (siteId) => `pms_ums_last_${siteId}`;

export function readLog(siteId) {
    try { return JSON.parse(localStorage.getItem(LOG_KEY(siteId)) || '[]'); } catch { return []; }
}
export function writeLog(siteId, entry) {
    const log = [entry, ...readLog(siteId)].slice(0, 30);
    try { localStorage.setItem(LOG_KEY(siteId), JSON.stringify(log)); } catch { }
}
export function lastApplied(siteId) {
    try { return JSON.parse(localStorage.getItem(LAST_KEY(siteId)) || 'null'); } catch { return null; }
}
export function setLastApplied(siteId, info) {
    try { localStorage.setItem(LAST_KEY(siteId), JSON.stringify(info)); } catch { }
}
