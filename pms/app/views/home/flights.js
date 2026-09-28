// Jeddah airport tile on the Home page: only the flights OUR guests are on (UMS groups whose arrival or
// departure flight lands at / leaves Jeddah between 3 hours ago and 10 hours ahead), with their live status
// and the groups + pax on each. The Worker looks them up on Airlabs on a budget (GET /api/flights); when no
// guest flies in that window nothing is looked up and the tile says so. Admins can refresh by hand.

import { request, currentDesk, UserError, mirrorAll } from '../../core/cloud.js';

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const TZ = 'Asia/Riyadh';
const TERMINALS = { '1': 'Terminal 1', N: 'North Terminal', H: 'Hajj Terminal' };
const CITY = {
    BOM: 'Mumbai', DEL: 'Delhi', HYD: 'Hyderabad', MAA: 'Chennai', BLR: 'Bengaluru', CCJ: 'Kozhikode', COK: 'Kochi', AMD: 'Ahmedabad',
    LKO: 'Lucknow', CCU: 'Kolkata', TRV: 'Thiruvananthapuram', IXE: 'Mangaluru', CNN: 'Kannur', GOI: 'Goa', GOX: 'Goa', JAI: 'Jaipur',
    NAG: 'Nagpur', PNQ: 'Pune', IDR: 'Indore', BHO: 'Bhopal', VNS: 'Varanasi', SXR: 'Srinagar', STV: 'Surat', BDQ: 'Vadodara', UDR: 'Udaipur',
    RAJ: 'Rajkot', BHJ: 'Bhuj', DXB: 'Dubai', AUH: 'Abu Dhabi', SHJ: 'Sharjah', DOH: 'Doha', KWI: 'Kuwait', BAH: 'Bahrain', MCT: 'Muscat',
    KHI: 'Karachi', LHE: 'Lahore', ISB: 'Islamabad', DAC: 'Dhaka', CMB: 'Colombo', KUL: 'Kuala Lumpur', CGK: 'Jakarta', IST: 'Istanbul',
    SAW: 'Istanbul', CAI: 'Cairo', AMM: 'Amman', LHR: 'London', RUH: 'Riyadh', DMM: 'Dammam', MED: 'Madinah', TIF: 'Taif',
};

const toTs = (s) => (s ? Date.parse(s.replace(' ', 'T') + ':00+03:00') : NaN);
const dayOf = (ts) => new Date(ts).toLocaleDateString('en-GB', { timeZone: TZ });
function hm(s) {
    if (!s) return '';
    const ts = toTs(s), t = s.slice(11, 16);
    return dayOf(ts) === dayOf(Date.now()) ? t : `${new Date(ts).toLocaleDateString('en-GB', { timeZone: TZ, weekday: 'short' })} ${t}`;
}
function ago(iso) {
    const m = Math.round((Date.now() - Date.parse(iso)) / 60000);
    return m < 1 ? 'just now' : m < 60 ? `${m} min ago` : `${Math.floor(m / 60)} h ${m % 60} min ago`;
}
const localTime = (iso) => new Date(iso).toLocaleString(undefined, { weekday: 'short', hour: '2-digit', minute: '2-digit' });

function statusOf(f, dir) {
    const late = dir === 'arr' ? f.arr_delayed : f.dep_delayed;
    const act = dir === 'arr' ? f.arr_actual : f.dep_actual;
    switch (f.status) {
        case 'cancelled': return ['Cancelled', 'bad'];
        case 'landed': return [dir === 'arr' ? `Landed ${hm(act || f.arr_estimated || '')}`.trim() : 'Arrived', 'ok'];
        case 'active': return [dir === 'arr' ? 'In the air' : `Departed ${hm(act || '')}`.trim(), 'go'];
        default: return late >= 15 ? [`Delayed ${late} min`, 'warn'] : ['Scheduled', ''];
    }
}

/* --------------------------- our guests on each flight --------------------------- */
// UMS flight text is free-form: "SAUDIA -SV701", "INDIGO AIRLINES -6E-61", "FLYNAS AIR-0000" (unknown).
// The last airline-code + number in it, leading zeros dropped; '' when unknown. (Same rule as the Worker.)
export function flightCode(text) {
    const all = [...String(text || '').toUpperCase().matchAll(/\b([A-Z0-9]{2})\s*-?\s*(\d{1,4})\b/g)].filter(m => /[A-Z]/.test(m[1]));
    const m = all.at(-1);
    return m && Number(m[2]) ? m[1] + Number(m[2]) : '';
}
const normCode = (iata) => { const m = String(iata || '').toUpperCase().match(/^([A-Z0-9]{2})(\d{1,4})$/); return m ? m[1] + Number(m[2]) : ''; };

/** flight key → { pax, groups: [{ sh, name, pax }] }: groups whose UMS flight is this flight (±6 h), each group once. */
export function guestsOnFlights(board, slips) {
    const groups = new Map();
    for (const s of slips) {
        if (s.deleted || !s.ums || !s.ums.ref || groups.has(s.ums.ref)) continue;
        groups.set(s.ums.ref, {
            sh: String(s.ums.ref), name: s.tour_name || s.ums.family || '',
            pax: Number(s.total) || ((Number(s.gents) || 0) + (Number(s.ladies) || 0) + (Number(s.children) || 0) + (Number(s.infants) || 0)),
            arr: s.ums.arrival, dep: s.ums.departure,
        });
    }
    const index = { arr: new Map(), dep: new Map() };
    for (const g of groups.values()) {
        for (const dir of ['arr', 'dep']) {
            const f = g[dir];
            if (!f || !/JEDDAH|\bJED\b/i.test(f.port || '')) continue;
            const code = flightCode(f.flight);
            if (!code) continue;
            if (!index[dir].has(code)) index[dir].set(code, []);
            index[dir].get(code).push({ g, ts: Date.parse(`${f.date}T${f.time}:00+03:00`) });
        }
    }
    const out = new Map();
    for (const [dir, list] of [['arr', board.arrivals || []], ['dep', board.departures || []]]) {
        for (const f of list) {
            const sched = toTs(dir === 'arr' ? f.arr_time : f.dep_time);
            const found = [];
            for (const code of new Set([normCode(f.flight_iata), normCode(f.cs_flight_iata)].filter(Boolean))) {
                for (const { g, ts } of index[dir].get(code) || []) if (Math.abs(ts - sched) <= 6 * 3600e3 && !found.includes(g)) found.push(g);
            }
            if (found.length) out.set(`${dir}|${f.flight_iata}|${dir === 'arr' ? f.arr_time : f.dep_time}`, { pax: found.reduce((n, g) => n + g.pax, 0), groups: found });
        }
    }
    return out;
}

/** Draw the tile into `root` (the #hmFlights section). Returns the refresh timer. */
export async function renderFlights(ctx, root) {
    const $ = (sel) => root.querySelector(sel);
    const state = { dir: 'arr' };
    let board = null, ours = new Map();

    async function load(force = false) {
        board = await ctx.guard(force ? request('POST', '/api/flights/refresh') : request('GET', '/api/flights'));
        ours = guestsOnFlights(board, await ctx.guard(mirrorAll())); // both cities' slips
        draw();
    }

    function draw() {
        if (!board) return;
        const dir = state.dir;
        const list = (dir === 'arr' ? board.arrivals : board.departures) || [];
        const other = dir === 'arr' ? 'dep_iata' : 'arr_iata';
        const keyOf = (f) => `${dir}|${f.flight_iata}|${dir === 'arr' ? f.arr_time : f.dep_time}`;
        const when = (f) => dir === 'arr' ? (f.arr_estimated || f.arr_time) : (f.dep_estimated || f.dep_time);
        const rows = [...list].sort((a, b) => toTs(when(a)) - toTs(when(b)));
        const paxOf = (l) => l.reduce((n, f) => n + (ours.get(`${l === board.arrivals ? 'arr' : 'dep'}|${f.flight_iata}|${l === board.arrivals ? f.arr_time : f.dep_time}`)?.pax || 0), 0);

        $('.fl-tabs').innerHTML = [['arr', '🛬 Arrivals', board.arrivals || []], ['dep', '🛫 Departures', board.departures || []]]
            .map(([k, l, fl]) => `<button type="button" data-dir="${k}" aria-pressed="${dir === k}">${l} <small>${fl.length} flight${fl.length === 1 ? '' : 's'} · ${paxOf(fl)} pax</small></button>`).join('');

        const noneMsg = `No data found — none of our guests ${dir === 'arr' ? 'lands at' : 'leaves from'} Jeddah between 3 hours ago and the next 10 hours.`;
        $('.fl-list').innerHTML = !board.configured && !board.fetched_at ? '<p class="fl-none">The flight lookup is not set up on the server yet.</p>'
            : !rows.length ? `<p class="fl-none">✈️ ${esc(noneMsg)}</p>`
            : `<table class="fl-tbl" data-no-cards><thead><tr><th>${dir === 'arr' ? 'Arrives' : 'Departs'}</th><th>Flight</th><th>${dir === 'arr' ? 'From' : 'To'}</th><th>Terminal</th><th>Status</th><th>Our guests</th></tr></thead><tbody>
                ${rows.map(f => {
                    const [label, cls] = statusOf(f, dir);
                    const sched = dir === 'arr' ? f.arr_time : f.dep_time, est = dir === 'arr' ? f.arr_estimated : f.dep_estimated;
                    const moved = est && est !== sched;
                    const code = f[other];
                    const term = dir === 'arr' ? f.arr_terminal : f.dep_terminal;
                    const us = ours.get(keyOf(f));
                    return `<tr class="${f.status === 'cancelled' ? 'cx' : ''}">
                        <td class="t"><b>${esc(hm(moved ? est : sched))}</b>${moved ? `<small><s>${esc(hm(sched))}</s></small>` : ''}</td>
                        <td><b>${esc(f.flight_iata || '—')}</b>${f.cs_flight_iata ? `<small>also ${esc(f.cs_flight_iata)}</small>` : ''}</td>
                        <td>${esc(CITY[code] || code || '—')}${CITY[code] ? `<small>${esc(code)}</small>` : ''}</td>
                        <td>${esc(TERMINALS[term] || term || '—')}${dir === 'arr' && f.arr_baggage ? `<small>belt ${esc(f.arr_baggage)}</small>` : (dir === 'dep' && f.dep_gate ? `<small>gate ${esc(f.dep_gate)}</small>` : '')}</td>
                        <td><span class="fl-st ${cls}">${esc(label)}</span></td>
                        <td class="g">${us ? `<b>👥 ${us.pax} pax</b><small>${us.groups.map(g => `SH ${esc(g.sh)}${g.name ? ' · ' + esc(g.name) : ''} (${g.pax})`).join('<br>')}</small>` : '<small>—</small>'}</td></tr>`;
                }).join('')}</tbody></table>`;

        const looked = board.codes ? [...(board.codes.arr || []), ...(board.codes.dep || [])] : [];
        const isAdmin = currentDesk()?.role === 'admin';
        $('.fl-foot').innerHTML = `
            ${board.fetched_at ? `<span>Last check: <b>${esc(localTime(board.fetched_at))}</b> (${esc(ago(board.fetched_at))})${board.calls_last ? ` · looked up ${board.calls_last} time${board.calls_last === 1 ? '' : 's'}` : ' · no guest flights, no lookup used'}</span>` : '<span>Last check: —</span>'}
            <span>Next check: <b>${board.next_fetch_at ? esc(localTime(board.next_fetch_at)) : 'within 15 min'}</b></span>
            <span>${board.calls_used} of ${board.calls_budget} lookups used this month</span>
            ${looked.length ? `<span>Flights watched: ${esc(looked.join(', '))}</span>` : ''}
            ${board.error ? `<span class="bad">⚠ ${esc(board.error)}</span>` : ''}
            ${isAdmin ? `<button type="button" class="fl-refresh" title="Look up our guests' flights now (admins only; uses this month's lookups)">Refresh now</button>` : ''}`;
    }

    root.addEventListener('click', async (e) => {
        const b = e.target.closest('button');
        if (!b) return;
        if (b.dataset.dir) { state.dir = b.dataset.dir; draw(); }
        else if (b.classList.contains('fl-refresh')) {
            if (currentDesk()?.role !== 'admin') return; // the server refuses it too
            if (!confirm(`Look up our guests' flights now? Each lookup uses one of this month's ${board?.calls_budget} (${board?.calls_used} used so far).`)) return;
            b.disabled = true; b.textContent = 'Checking…';
            try { await load(true); } catch (err) { alert(err instanceof UserError ? err.message : 'Could not refresh.'); draw(); }
        }
    });

    try { await load(); }
    catch (e) {
        $('.fl-list').innerHTML = `<p class="fl-none">${e?.status === 404 ? 'The server does not have the flight lookup yet.' : 'Flight information is not available right now.'}</p>`;
    }
    // redraw each minute (times), re-read the stored board every 10 minutes
    let n = 0;
    return setInterval(() => { if (++n % 10 === 0) load().catch(() => { }); else draw(); }, 60e3);
}
