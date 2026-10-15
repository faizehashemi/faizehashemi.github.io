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
const AIRPORT_NAMES = { OEJN: 'Jeddah', OEMA: 'Madina', OERK: 'Riyadh', OEDF: 'Dammam', OETF: 'Taif', OEYN: 'Yanbu', OEGS: 'Qassim', OEAB: 'Abha', OETB: 'Tabuk' };
const place = (icao) => AIRPORT_NAMES[icao] || icao || '?';

/** "+1 h 20 min late" / "15 min early" / "on time" (within 10 min) — '' when unknown */
export function delayText(min) {
    if (min == null || !Number.isFinite(Number(min))) return '';
    const m = Number(min);
    if (Math.abs(m) <= 10) return 'on time';
    const a = Math.abs(m), h = Math.floor(a / 60), r = a % 60;
    return `${h ? `${h} h ` : ''}${r ? `${r} min` : ''}`.trim() + (m > 0 ? ' late' : ' early');
}
const UMS_AT = (row) => row.sched ? row.sched.slice(11, 16) : '';

/** The details Flightradar24 gave (aircraft, route, times, position) as lines */
export function detailsOf(row) {
    if (!row) return [];
    const d = row.detail || {};
    return [
        [row.callsign && `Callsign ${row.callsign}`, d.type && `Aircraft ${d.type}`, d.reg && `Reg. ${d.reg}`].filter(Boolean).join(' · '),
        (row.origin || row.destination || row.destination_actual) && `Route ${place(row.origin)} → ${place(row.destination_actual || row.destination || d.dest)}`,
        `UMS time ${UMS_AT(row)}${d.first_seen ? ` · first seen ${riyadh(d.first_seen)}` : ''}${row.takeoff ? ` · took off ${riyadh(row.takeoff)}` : ''}${row.eta && !row.landed ? ` · ETA ${riyadh(row.eta)}` : ''}${row.landed ? ` · landed ${riyadh(row.landed)}` : ''}`,
        (d.alt != null || d.gspeed != null) && `Last position ${riyadh(d.pos_at)}: ${d.alt != null ? `${Number(d.alt).toLocaleString()} ft` : ''}${d.gspeed != null ? ` · ${d.gspeed} kt` : ''}`,
        d.last_seen && !row.landed && `Last seen by Flightradar24 ${riyadh(d.last_seen)}`,
        row.checked_at && `Checked ${riyadh(row.checked_at)} (Riyadh time) · Flightradar24`,
    ].filter(Boolean);
}

/** { text, cls, title } for a stored status row (or none yet) */
export function describe(dirKey, row) {
    if (!row) return { text: 'Not checked yet', cls: 'wait', title: 'Looked up from 8 h before an arrival / 1 h before a departure' };
    const title = detailsOf(row).join('\n');
    const late = delayText(row.delay_min);
    const lateCls = (base) => row.delay_min >= 30 ? 'warn' : base;
    const plus = late ? ` · ${late}` : '';
    if (row.flag === 'no_sign') return { text: 'No sign of this flight · possibly cancelled — check with the airline', cls: 'bad', title };
    if (row.flag === 'unchecked') return { text: 'Not checked (its time passed before tracking began)', cls: 'wait', title };
    switch (row.status) {
        case 'airborne': {
            if (row.eta) return { text: `In the air · ETA ${riyadh(row.eta)}${plus}`, cls: lateCls('air'), title };
            // out of Flightradar24's sight for a while (patchy coverage over central Saudi Arabia): say when last seen
            const last = row.detail?.last_seen, stale = last && Date.now() - Date.parse(last) > 20 * 60e3;
            return { text: `In the air · took off ${riyadh(row.takeoff)}${stale ? ` · last seen ${riyadh(last)}` : ''}`, cls: 'air', title };
        }
        case 'landed': return { text: `Landed ${riyadh(row.landed)}${plus}`, cls: lateCls('ok'), title };
        case 'diverted': return { text: `Diverted to ${place(row.destination_actual)}`, cls: 'bad', title };
        case 'boarding': return { text: `At the gate / taxiing${row.flag === 'late' ? plus : ''}`, cls: 'warn', title };
        case 'departed': return { text: `Departed ${riyadh(row.takeoff)}${plus}`, cls: lateCls('ok'), title };
        case 'arrived': return { text: `Departed ${riyadh(row.takeoff)}${plus} · landed ${riyadh(row.landed)}`, cls: lateCls('ok'), title };
        // the same flight number at another airport than UMS gives (e.g. the group really flies from Taif)
        case 'elsewhere': return dirKey === 'dep'
            ? { text: `Flies from ${place(row.origin)}${row.takeoff ? ` · departed ${riyadh(row.takeoff)}` : ''}`, cls: 'bad', title: `UMS says ${row.airport === 'MED' ? 'Madina' : 'Jeddah'}, Flightradar24 shows this flight leaving ${place(row.origin)}.\n${title}` }
            : { text: `Lands at ${place(row.destination_actual || row.destination)}${row.landed ? ` · ${riyadh(row.landed)}` : ''}`, cls: 'bad', title: `UMS says ${row.airport === 'MED' ? 'Madina' : 'Jeddah'}, Flightradar24 shows this flight going to ${place(row.destination_actual || row.destination)}.\n${title}` };
        default:
            if (row.flag === 'late') return dirKey === 'dep'
                ? { text: `Not departed yet · ${late}`, cls: 'warn', title }
                : { text: `Not seen yet · ${late.replace(' late', '')} past its time`, cls: 'warn', title };
            return { text: dirKey === 'dep' ? `Not departed yet · due ${UMS_AT(row)}` : `Not in the air yet · due ${UMS_AT(row)}`, cls: 'wait', title };
    }
}
