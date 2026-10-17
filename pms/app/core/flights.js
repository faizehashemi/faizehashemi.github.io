// Live flight status of our guests' flights (GET /api/flights/status; the server looks them up on Flightradar24 —
// take-off, landing, ETA — and VariFlight — the airline's schedule, estimates, cancellations, gates — and keeps them). A slip's flight = its UMS arrival or departure leg — only real flights: legs by car, bus or train,
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
const AIRPORT_NAMES = { OEJN: 'Jeddah', OEMA: 'Madina', OERK: 'Riyadh', OEDF: 'Dammam', OETF: 'Taif', OEYN: 'Yanbu', OEGS: 'Qassim', OEAB: 'Abha', OETB: 'Tabuk',
    HECA: 'Cairo', OTHH: 'Doha', OMDB: 'Dubai', OMSJ: 'Sharjah', OMAA: 'Abu Dhabi', OBBI: 'Bahrain', OOMS: 'Muscat', OKKK: 'Kuwait',
    VABB: 'Mumbai', VIDP: 'Delhi', VOBL: 'Bengaluru', VOCL: 'Kozhikode', VOMM: 'Chennai', VOHS: 'Hyderabad', VAAH: 'Ahmedabad', VOCI: 'Kochi',
    OPKC: 'Karachi', OPLA: 'Lahore', OPIS: 'Islamabad', LTFM: 'Istanbul', WMKK: 'Kuala Lumpur', WIII: 'Jakarta', VGHS: 'Dhaka' };
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
        d.gate_arrival && `At gate ${d.gate_arrival.gate || '?'} since ${riyadh(d.gate_arrival.at)}`,
        d.gate_departure && `Left gate ${d.gate_departure.gate || '?'} at ${riyadh(d.gate_departure.at)}`,
        ...histLines(row),
        row.checked_at && `Checked ${riyadh(row.checked_at)} (Riyadh time) · Flightradar24`,
    ].filter(Boolean);
}

const dayName = (iso) => iso ? new Date(iso).toLocaleDateString('en-GB', { timeZone: 'Asia/Riyadh', day: 'numeric', month: 'short' }) : '';
const clockGap = (a, b) => { const m = (t) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3, 5)); const d = Math.abs(m(a) - m(b)); return Math.min(d, 1440 - d); };
/** What the past days (Flightradar24 history) say, as lines for the details */
function histLines(row) {
    const h = row.detail && row.detail.hist, it = row.detail && row.detail.inbound_today;
    if (!h) return [];
    const dep = row.dir === 'dep';
    return [
        h.n ? `Past days: flew on ${h.n} day${h.n === 1 ? '' : 's'} (last ${dayName(h.last)})${h.usual ? `, usually ${dep ? 'taking off' : 'landing'} ~${h.usual}` : ''}`
            : h.verdict === 'wrong_airport' ? `Past days: flies ${place(h.route?.orig)} → ${place(h.route?.dest)} only` : 'Past days: not seen on Flightradar24',
        h.inbound && `Its plane usually comes in as ${h.inbound.code} from ${place(h.inbound.orig)} (~${Math.round(h.inbound.turn_min / 5) * 5} min on the ground)`,
        it && (it.on ? `Today's ${it.code} landed ${riyadh(it.on)}` : it.eta ? `Today's ${it.code} due in ${riyadh(it.eta)}` : it.off ? `Today's ${it.code} took off ${riyadh(it.off)}` : `Today's ${it.code} not seen yet`),
    ].filter(Boolean);
}

/**
 * The status as a traveller reads it (like an airline / Trip.com page): one word and one plain sentence.
 * { label, sentence, text, cls, title } — text = "label — sentence" (CSV, tooltips).
 * Only says what Flightradar24 confirmed: before take-off it cannot know "on time", so it says "no delay reported yet".
 */
function describeTracked(dirKey, row) {
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
    const h = (row.detail && row.detail.hist) || {}, it = row.detail && row.detail.inbound_today;
    const ums = row.airport === 'MED' ? 'Madina' : 'Jeddah';
    if (row.flag === 'not_operating') return h.verdict === 'stopped'
        ? out('Possibly cancelled', `This flight hasn't flown since ${dayName(h.last)} — it flew on ${h.n} days before that. Check with the airline.`, 'bad', title)
        : out('Not flying lately', `Flightradar24 hasn't seen ${row.code} fly in the past 10 days. It may not fly every day, or may be cancelled — check with the airline.`, 'warn', title);
    if (row.flag === 'wrong_airport') return out('Check UMS', `${row.code} flies ${place(h.route?.orig)} → ${place(h.route?.dest)}${h.route?.[dep ? 'usual_off' : 'usual_on'] ? ` (usually ${dep ? 'taking off' : 'landing'} ~${h.route[dep ? 'usual_off' : 'usual_on']})` : ''}, not ${dep ? 'from' : 'to'} ${ums}. Check the flight in UMS.`, 'bad', title);
    if (row.flag === 'late_plane' && it) return out('Likely delayed', `Its plane (${it.code} from ${place(it.orig)}) ${it.on ? `landed at ${riyadh(it.on)}` : `is due in at ${riyadh(it.eta)}`}, so it can't leave before about ${riyadh(it.ready)} (UMS time ${at}).`, 'warn', title);
    // UMS time far from when it usually flies
    const usualNote = h.usual && at && clockGap(h.usual, at) > 60 ? ` It usually ${dep ? 'takes off' : 'lands'} around ${h.usual} — check the UMS time.` : '';
    switch (row.status) {
        case 'airborne': {
            if (row.eta) return out('In flight', `Expected to land at ${riyadh(row.eta)}${by(row.delay_min)}.`, lateCls('air'), title);
            return out('In flight', `Took off${row.origin ? ` from ${from}` : ''} at ${riyadh(row.takeoff)}. Due to land at ${at}.`, 'air', title);
        }
        case 'landed': {
            const g = row.detail && row.detail.gate_arrival;
            const gate = g ? ` At gate ${g.gate || ''} since ${riyadh(g.at)}.`.replace('gate  since', 'the gate since') : '';
            if (row.delay_min <= -120 || row.delay_min >= 360) return out('Landed', `Landed at ${riyadh(row.landed)} — far from the UMS time (${at}). Check the UMS flight time.`, 'warn', title);
            const t = delayText(row.delay_min);
            return out('Landed', (t === 'on time' ? `Landed on time at ${riyadh(row.landed)}.` : `Landed at ${riyadh(row.landed)}${by(row.delay_min)}.`) + gate, lateCls('ok'), title);
        }
        case 'diverted': return out('Diverted', `Landed in ${place(row.destination_actual)} instead of ${row.airport === 'MED' ? 'Madina' : 'Jeddah'}.`, 'bad', title);
        case 'boarding': {
            const g = row.detail && row.detail.gate_departure;
            return out('Boarding', g ? `Pushed back from gate ${g.gate || ''} at ${riyadh(g.at)} — taxiing to take off.` : 'The plane is at the gate or taxiing.', 'warn', title);
        }
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
            // not seen past the UMS time, but it usually flies much later: the UMS time is the likely problem
            if (row.flag === 'late' && usualNote) return out('Check UMS time', dep
                ? `Not departed yet at ${at} (UMS). It usually takes off around ${h.usual} — check the UMS time.`
                : `Not in the air at ${at} (UMS). It usually lands around ${h.usual} — check the UMS time.`, 'warn', title);
            if (row.flag === 'late') return dep
                ? out('Delayed', `Not departed yet — ${delayText(row.delay_min).replace(' late', '')} past its time (${at}).`, 'warn', title)
                : out('Delayed', `Not in the air yet — ${delayText(row.delay_min).replace(' late', '')} past its landing time (${at}).`, 'warn', title);
            if (dep && it && it.on) return out('Scheduled', `Departs at ${at}. Its plane is here (${it.code} from ${place(it.orig)} landed ${riyadh(it.on)}).${usualNote}`, usualNote ? 'warn' : 'wait', title);
            return dep
                ? out('Scheduled', `Departs at ${at}. No delay reported yet.${usualNote}`, usualNote ? 'warn' : 'wait', title)
                : out('Scheduled', `Lands at ${at}. No delay reported yet.${usualNote}`, usualNote ? 'warn' : 'wait', title);
    }
}

// The airline's own schedule and status (VariFlight) when we have it; otherwise what Flightradar24 saw.
// Whichever source has seen the flight further along wins (e.g. FR24 sees the landing before VariFlight's next check).
export function describe(dirKey, row) {
    // its plane is late in: say so until the airline itself reports a delay or the flight leaves
    if (row && row.flag === 'late_plane' && (!row.vf || row.vf.state === 'scheduled')) return describeTracked(dirKey, row);
    if (row && row.vf && row.vf.state && !['unknown', 'other'].includes(row.vf.state)) return describeAirline(dirKey, row);
    return describeTracked(dirKey, row);
}

const mins = (a, b) => Math.round((Date.parse(a) - Date.parse(b)) / 60e3);
const AIRLINE = (v) => [
    v.from && v.to && `${v.from} → ${v.to} · airline schedule ${riyadh(v.sched_dep)} → ${riyadh(v.sched_arr)} (Riyadh time)`,
    [v.gate && `Gate ${v.gate}`, v.dep_terminal && `Terminal ${v.dep_terminal}`, v.checkin && `Check-in ${v.checkin}`, v.baggage && `Belt ${v.baggage}`].filter(Boolean).join(' · '),
    [v.aircraft && `Aircraft ${v.aircraft}`, v.reg && `Reg. ${v.reg}`, v.ontime && `On-time record ${v.ontime}`].filter(Boolean).join(' · '),
    v.delay_reason && `Delay reason: ${v.delay_reason}`,
].filter(Boolean);

function describeAirline(dirKey, row) {
    const v = row.vf, dep = dirKey === 'dep';
    const out = (label, sentence, cls) => ({ label, sentence, text: `${label} — ${sentence}`, cls,
        title: [...AIRLINE(v), row.vf_checked && `Airline data (VariFlight) checked ${riyadh(row.vf_checked)}`, ...detailsOf(row)].filter(Boolean).join('\n') });
    const sched = dep ? v.sched_dep : v.sched_arr;
    const est = dep ? v.est_dep : v.est_arr;
    const by = (iso) => {                         // " on time" / ", 25 min late" vs the airline's schedule
        if (!iso || !sched) return '';
        const t = delayText(mins(iso, sched));
        return !t ? '' : t === 'on time' ? ' on time' : `, ${t}`;
    };
    const late = (iso) => iso && sched ? mins(iso, sched) : 0;
    // UMS time far from the airline's: say so (UMS times are sometimes wrong)
    const umsAt = row.sched ? Date.parse(`${row.sched}:00+03:00`) : NaN;
    const umsNote = sched && Number.isFinite(umsAt) && Math.abs(umsAt - Date.parse(sched)) > 60 * 60e3 ? ` UMS has ${UMS_AT(row)}.` : '';
    const extra = dep ? [v.gate && `Gate ${v.gate}`, v.checkin && `check-in ${v.checkin}`].filter(Boolean).join(', ') : (v.baggage ? `Belt ${v.baggage}` : '');
    const tail = (extra ? ` ${extra}.` : '') + umsNote;
    const warnIf = (base, iso) => late(iso) >= 30 || umsNote ? 'warn' : base;

    if (v.state === 'cancelled') return out('Cancelled', `The airline has cancelled this flight.${umsNote}`, 'bad');
    if (v.state === 'returned') return out('Returned', `The flight turned back to ${v.from || 'its departure airport'}. Check with the airline.`, 'bad');
    if (v.state === 'diverted') return out('Diverted', `The flight was diverted${row.destination_actual ? ` to ${place(row.destination_actual)}` : ''}. Check with the airline.`, 'bad');

    const tookOff = v.act_dep || (row.takeoff ? row.takeoff : null);
    const landed = v.act_arr || (row.landed ? row.landed : null);
    if (dep) {
        if (tookOff || ['departed', 'arrived'].includes(v.state) || ['departed', 'arrived'].includes(row.status)) {
            const t = delayText(late(tookOff));
            return out('Departed', t === 'on time' ? `Took off on time at ${riyadh(tookOff)}.${umsNote}` : `Took off at ${riyadh(tookOff)}${by(tookOff)}.${umsNote}`, warnIf('ok', tookOff));
        }
        if (row.status === 'boarding') return out('Boarding', `The plane is at the gate or taxiing.${tail}`, 'warn');
        if (est && late(est) > 10) return out('Delayed', `Now expected to depart at ${riyadh(est)}${by(est)}.${tail}`, 'warn');
        return out('Scheduled', `Your flight will depart on time at ${riyadh(sched)}.${tail}`, umsNote ? 'warn' : 'wait');
    }
    if (landed || v.state === 'arrived' || row.status === 'landed') {
        const at = landed || row.landed;
        const t = delayText(late(at));
        return out('Landed', t === 'on time' ? `Landed on time at ${riyadh(at)}.${tail}` : `Landed at ${riyadh(at)}${by(at)}.${tail}`, warnIf('ok', at));
    }
    if (tookOff || v.state === 'departed' || row.status === 'airborne') {
        const eta = est || row.eta;
        return eta
            ? out('In flight', `Took off from ${v.from || place(row.origin)}; expected to land at ${riyadh(eta)}${by(eta)}.${umsNote}`, warnIf('air', eta))
            : out('In flight', `Took off from ${v.from || place(row.origin)}${tookOff ? ` at ${riyadh(tookOff)}` : ''}.${umsNote}`, 'air');
    }
    if (est && late(est) > 10) return out('Delayed', `Now expected to land at ${riyadh(est)}${by(est)}.${umsNote}`, 'warn');
    return out('Scheduled', `Your flight will arrive on time at ${riyadh(sched)}.${umsNote}`, umsNote ? 'warn' : 'wait');
}
