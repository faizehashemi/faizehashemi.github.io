// Live flight status of our guests' flights (GET /api/flights/status; the server looks them up on Flightradar24 and
// keeps them). A slip's flight = its UMS arrival or departure leg — only real flights: legs by car, bus or train,
// and stays coming from or going to the other city, have none.
import { request } from './cloud.js';
import { byRoad } from './ums.js';

/** "SAUDIA -SV701", "INDIGO AIRLINES -6E-61" → "SV701" / "6E61" (as the server does); '' when unknown */
export function flightNo(text) {
    const all = [...String(text || '').toUpperCase().matchAll(/\b([A-Z0-9]{2})\s*-?\s*(\d{1,4})\b/g)].filter(m => /[A-Z]/.test(m[1]));
    const m = all[all.length - 1];
    return m && Number(m[2]) ? m[1] + Number(m[2]) : '';
}

/** The leg of a slip for a direction ('arr' | 'dep'): { kind: 'flight' | 'road' | 'none', leg, code, key } */
export function legOf(slip, dir) {
    const leg = dir === 'arr' ? slip?.ums?.arrival : slip?.ums?.departure;
    if (!leg || !leg.date) return { kind: 'none' };
    if (byRoad(leg)) return { kind: 'road', leg, mode: String(leg.flight || '').trim().split(/[\s-]/)[0].toUpperCase() };
    const code = flightNo(leg.flight);
    if (!code) return { kind: 'none', leg };
    return { kind: 'flight', leg, code, key: `${dir}|${leg.date}|${code}` };
}

let cache = null, cachedAt = 0;
/** { byKey: Map, meta, configured } — fetched at most every 60 s */
export async function loadFlightStatus({ force = false } = {}) {
    if (!force && cache && Date.now() - cachedAt < 60e3) return cache;
    const r = await request('GET', '/api/flights/status');
    cache = { byKey: new Map((r.flights || []).map(f => [f.key, f])), meta: r.meta, configured: r.configured, budget: r.budget };
    cachedAt = Date.now();
    return cache;
}

const riyadh = (iso) => iso ? new Date(iso).toLocaleTimeString('en-GB', { timeZone: 'Asia/Riyadh', hour: '2-digit', minute: '2-digit' }) : '';
const AIRPORT_NAMES = { OEJN: 'Jeddah', OEMA: 'Madina', OERK: 'Riyadh', OEDF: 'Dammam', OETF: 'Taif', OEYN: 'Yanbu' };

/** { text, cls, title } for a stored status row (or none yet) */
export function describe(dirKey, row) {
    if (!row) return { text: 'Not checked yet', cls: 'wait', title: 'Looked up from 8 h before an arrival / 1 h before a departure' };
    const checked = row.checked_at ? `Checked ${riyadh(row.checked_at)} (Riyadh)` : '';
    const tip = [row.callsign && `Callsign ${row.callsign}`, row.origin && `From ${AIRPORT_NAMES[row.origin] || row.origin}`, checked].filter(Boolean).join(' · ');
    switch (row.status) {
        case 'airborne': return { text: `In the air · took off ${riyadh(row.takeoff)}`, cls: 'air', title: tip };
        case 'landed': return { text: `Landed ${riyadh(row.landed)}`, cls: 'ok', title: tip };
        case 'diverted': return { text: `Diverted to ${AIRPORT_NAMES[row.destination_actual] || row.destination_actual}`, cls: 'bad', title: tip };
        case 'boarding': return { text: 'At the gate / taxiing', cls: 'warn', title: tip };
        case 'departed': return { text: `Departed ${riyadh(row.takeoff)}`, cls: 'ok', title: tip };
        case 'arrived': return { text: `Departed ${riyadh(row.takeoff)} · landed ${riyadh(row.landed)}`, cls: 'ok', title: tip };
        default: return { text: dirKey === 'dep' ? 'Not departed yet' : 'Not in the air yet', cls: 'wait', title: tip };
    }
}
