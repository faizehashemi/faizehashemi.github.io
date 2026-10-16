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

/**
 * Links to check a flight by hand on other sites (opened by a person, in a new tab):
 * trip — Trip.com status page (flight number padded to 3 digits: 6E61 → 6e061);
 * fa — FlightAware (the callsign when Flightradar24 gave one, e.g. SVA770, else the flight number).
 */
export function checkLinks(code, callsign) {
    const m = String(code || '').toUpperCase().match(/^([A-Z0-9]{2})(\d+)$/);
    if (!m) return null;
    return {
        trip: `https://in.trip.com/flights/status-${m[1].toLowerCase()}${m[2].padStart(3, '0')}/`,
        fa: `https://www.flightaware.com/live/flight/${encodeURIComponent(String(callsign || code).toUpperCase().replace(/\s+/g, ''))}`,
    };
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

/**
 * The status as a traveller reads it (like an airline / Trip.com page): one word and one plain sentence.
 * { label, sentence, text, cls, title } — text = "label — sentence" (CSV, tooltips).
 * Only says what Flightradar24 confirmed: before take-off it cannot know "on time", so it says "no delay reported yet".
 */
export function describe(dirKey, row) {
    const out = (label, sentence, cls, title = '') => ({ label, sentence, text: `${label} — ${sentence}`, cls, title });
    const dep = dirKey === 'dep';
    if (!row) return out('Scheduled', 'Not checked yet — looked up from 8 h before an arrival and 1 h before a departure.', 'wait');
    const title = detailsOf(row).join('\n');
    const at = UMS_AT(row);
    const from = place(row.origin);
    const by = (min) => {               // ", 40 min late" / " on time" / ", 15 min early"
        const t = delayText(min);
        return !t ? '' : t === 'on time' ? ' on time' : `, ${t}`;
    };
    const lateCls = (base) => row.delay_min >= 30 ? 'warn' : base;
    if (row.flag === 'no_sign') return out('Possibly cancelled', `No sign of this flight more than ${Math.max(1, Math.floor((Number(row.delay_min) || 0) / 60))} h after its time. Check with the airline.`, 'bad', title);
    if (row.flag === 'unchecked') return out('No data', 'Its time passed before flight tracking began.', 'wait', title);
    switch (row.status) {
        case 'airborne': {
            if (row.eta) return out('In flight', `Expected to land at ${riyadh(row.eta)}${by(row.delay_min)}.`, lateCls('air'), title);
            return out('In flight', `Took off${row.origin ? ` from ${from}` : ''} at ${riyadh(row.takeoff)}. Due to land at ${at}.`, 'air', title);
        }
        case 'landed': {
            if (row.delay_min <= -120 || row.delay_min >= 360) return out('Landed', `Landed at ${riyadh(row.landed)} — far from the UMS time (${at}). Check the UMS flight time.`, 'warn', title);
            const t = delayText(row.delay_min);
            return out('Landed', t === 'on time' ? `Landed on time at ${riyadh(row.landed)}.` : `Landed at ${riyadh(row.landed)}${by(row.delay_min)}.`, lateCls('ok'), title);
        }
        case 'diverted': return out('Diverted', `Landed in ${place(row.destination_actual)} instead of ${row.airport === 'MED' ? 'Madina' : 'Jeddah'}.`, 'bad', title);
        case 'boarding': return out('Boarding', 'The plane is at the gate or taxiing.', 'warn', title);
        case 'departed':
        case 'arrived': {
            if (row.delay_min <= -120 || row.delay_min >= 360) return out('Departed', `Took off at ${riyadh(row.takeoff)} — far from the UMS time (${at}). Check the UMS flight time.`, 'warn', title);
            const t = delayText(row.delay_min);
            return out('Departed', t === 'on time' ? `Took off on time at ${riyadh(row.takeoff)}.` : `Took off at ${riyadh(row.takeoff)}${by(row.delay_min)}.`, lateCls('ok'), title);
        }
        // the same flight number at another airport than UMS gives (e.g. the group really flies from Taif)
        case 'elsewhere': {
            const ums = row.airport === 'MED' ? 'Madina' : 'Jeddah';
            return dep
                ? out('Other airport', `This flight leaves from ${from}, not ${ums}. Check the booking.`, 'bad', title)
                : out('Other airport', `This flight goes to ${place(row.destination_actual || row.destination)}, not ${ums}. Check the booking.`, 'bad', title);
        }
        default:
            if (row.flag === 'late') return dep
                ? out('Delayed', `Not departed yet — ${delayText(row.delay_min).replace(' late', '')} past its time (${at}).`, 'warn', title)
                : out('Delayed', `Not in the air yet — ${delayText(row.delay_min).replace(' late', '')} past its landing time (${at}).`, 'warn', title);
            return dep
                ? out('Scheduled', `Departs at ${at}. No delay reported yet.`, 'wait', title)
                : out('Scheduled', `Lands at ${at}. No delay reported yet.`, 'wait', title);
    }
}
