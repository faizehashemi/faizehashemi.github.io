// Jeddah airport board on the Home page: arrivals and departures at King Abdulaziz (JED — Terminal 1, North
// and Hajj terminals), from the board the Worker keeps (GET /api/flights; Airlabs, refreshed on a budget).
// Shows the last and the next refresh and the month's lookups. Flights carrying our guests (UMS groups whose
// arrival / departure flight is on the board) are highlighted with their groups and pax.

import { request, currentDesk, UserError, mirrorAll } from '../../core/cloud.js';

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const TZ = 'Asia/Riyadh';
const TERMINALS = { '1': 'T1', N: 'North', H: 'Hajj' };
const INDIA = new Set(['BOM', 'DEL', 'HYD', 'MAA', 'BLR', 'CCJ', 'COK', 'AMD', 'LKO', 'CCU', 'TRV', 'IXE', 'CNN', 'GOI', 'GOX', 'JAI', 'NAG', 'PNQ',
    'IDR', 'BHO', 'VNS', 'IXB', 'GAU', 'ATQ', 'SXR', 'STV', 'BDQ', 'IXM', 'TRZ', 'IXC', 'PAT', 'RPR', 'VTZ', 'BBI', 'IXR', 'UDR', 'JDH', 'RAJ', 'BHJ']);
const CITY = {
    BOM: 'Mumbai', DEL: 'Delhi', HYD: 'Hyderabad', MAA: 'Chennai', BLR: 'Bengaluru', CCJ: 'Kozhikode', COK: 'Kochi', AMD: 'Ahmedabad',
    LKO: 'Lucknow', CCU: 'Kolkata', TRV: 'Thiruvananthapuram', IXE: 'Mangaluru', CNN: 'Kannur', GOI: 'Goa', GOX: 'Goa', JAI: 'Jaipur',
    NAG: 'Nagpur', PNQ: 'Pune', IDR: 'Indore', BHO: 'Bhopal', VNS: 'Varanasi', SXR: 'Srinagar', STV: 'Surat', BDQ: 'Vadodara', UDR: 'Udaipur',
    RAJ: 'Rajkot', BHJ: 'Bhuj', DXB: 'Dubai', AUH: 'Abu Dhabi', SHJ: 'Sharjah', DOH: 'Doha', KWI: 'Kuwait', BAH: 'Bahrain', MCT: 'Muscat',
    KHI: 'Karachi', LHE: 'Lahore', ISB: 'Islamabad', DAC: 'Dhaka', CMB: 'Colombo', KUL: 'Kuala Lumpur', CGK: 'Jakarta', IST: 'Istanbul',
    SAW: 'Istanbul', CAI: 'Cairo', AMM: 'Amman', LHR: 'London', RUH: 'Riyadh', DMM: 'Dammam', MED: 'Madinah', TIF: 'Taif', AHB: 'Abha',
    TUU: 'Tabuk', GIZ: 'Jazan', ELQ: 'Qassim', HAS: "Ha'il", NUM: 'NEOM', YNB: 'Yanbu', ULH: 'AlUla', ADD: 'Addis Ababa', NBO: 'Nairobi',
};

// "YYYY-MM-DD HH:MM" in Jeddah time → minutes since epoch-ish for ordering, and display
const toTs = (s) => (s ? Date.parse(s.replace(' ', 'T') + ':00+03:00') : NaN);
const nowTs = () => Date.now();
const dayOf = (ts) => new Date(ts).toLocaleDateString('en-GB', { timeZone: TZ });
function hm(s) {
    if (!s) return '';
    const ts = toTs(s);
    const t = s.slice(11, 16);
    return dayOf(ts) === dayOf(nowTs()) ? t : `${new Date(ts).toLocaleDateString('en-GB', { timeZone: TZ, weekday: 'short' })} ${t}`;
}
function ago(iso) {
    const m = Math.round((Date.now() - Date.parse(iso)) / 60000);
    if (m < 1) return 'just now';
    if (m < 60) return `${m} min ago`;
    return `${Math.floor(m / 60)} h ${m % 60} min ago`;
}
const localTime = (iso) => new Date(iso).toLocaleString(undefined, { weekday: 'short', hour: '2-digit', minute: '2-digit' });

function statusOf(f, dir) {
    const late = dir === 'arr' ? f.arr_delayed : f.dep_delayed;
    const act = dir === 'arr' ? f.arr_actual : f.dep_actual;
    switch (f.status) {
        case 'cancelled': return ['Cancelled', 'bad'];
        case 'landed': return [dir === 'arr' ? `Landed ${hm(act || f.arr_estimated || '') || ''}`.trim() : 'Arrived', 'ok'];
        case 'active': return [dir === 'arr' ? 'In the air' : `Departed ${hm(act || '') || ''}`.trim(), 'go'];
        default: return late >= 15 ? [`Delayed ${late} min`, 'warn'] : ['Scheduled', ''];
    }
}

/* --------------------------- our guests on the board --------------------------- */
// UMS flight text is free-form: "SAUDIA -SV701", "INDIGO AIRLINES -6E-61", "TURKISH AIRLINES-TK098",
// "FLYNAS AIR-0000" (unknown). Take the last airline-code + number in it; 0 = unknown.
export function flightCode(text) {
    const all = [...String(text || '').toUpperCase().matchAll(/\b([A-Z0-9]{2})\s*-?\s*(\d{1,4})\b/g)].filter(m => /[A-Z]/.test(m[1]));
    const m = all.at(-1);
    if (!m || !Number(m[2])) return '';
    return m[1] + Number(m[2]);
}
const normCode = (iata) => { const m = String(iata || '').toUpperCase().match(/^([A-Z0-9]{2})(\d{1,4})$/); return m ? m[1] + Number(m[2]) : ''; };

/**
 * For each flight on the board, the groups on it: { 'arr|SV701|2026-11-24 10:20' → { pax, groups: [{ sh, name, pax }] } }.
 * A group matches when its UMS flight code is the flight's (or its codeshare's) and its UMS time is within
 * 6 hours of the flight's scheduled time, and the airport is Jeddah. Each group counts once (not per stay).
 */
export function guestsOnFlights(board, slips) {
    const groups = new Map(); // ums ref → { sh, name, pax, arr, dep }
    for (const s of slips) {
        if (s.deleted || !s.ums || !s.ums.ref) continue;
        if (groups.has(s.ums.ref)) continue;
        groups.set(s.ums.ref, {
            sh: String(s.ums.ref), name: s.tour_name || s.ums.family || '', pax: Number(s.total) || ((Number(s.gents) || 0) + (Number(s.ladies) || 0) + (Number(s.children) || 0) + (Number(s.infants) || 0)),
            arr: s.ums.arrival, dep: s.ums.departure,
        });
    }
    const index = { arr: new Map(), dep: new Map() }; // code → [{ group, ts }]
    for (const g of groups.values()) {
        for (const dir of ['arr', 'dep']) {
            const f = g[dir];
            if (!f || !/JEDDAH|JED\b/i.test(f.port || '')) continue;
            const code = flightCode(f.flight);
            if (!code) continue;
            const ts = Date.parse(`${f.date}T${f.time}:00+03:00`);
            if (!index[dir].has(code)) index[dir].set(code, []);
            index[dir].get(code).push({ g, ts });
        }
    }
    const out = new Map();
    for (const [dir, list] of [['arr', board.arrivals || []], ['dep', board.departures || []]]) {
        for (const f of list) {
            const sched = Date.parse(String(dir === 'arr' ? f.arr_time : f.dep_time).replace(' ', 'T') + ':00+03:00');
            const found = [];
            for (const code of new Set([normCode(f.flight_iata), normCode(f.cs_flight_iata)].filter(Boolean))) {
                for (const { g, ts } of index[dir].get(code) || []) {
                    if (Math.abs(ts - sched) <= 6 * 3600e3 && !found.includes(g)) found.push(g);
                }
            }
            if (found.length) out.set(`${dir}|${f.flight_iata}|${dir === 'arr' ? f.arr_time : f.dep_time}`, { pax: found.reduce((n, g) => n + g.pax, 0), groups: found });
        }
    }
    return out;
}

/** Draw the tile into `root` (the #hmFlights section). */
export async function renderFlights(ctx, root) {
    const $ = (sel) => root.querySelector(sel);
    const state = { dir: 'arr', term: '', india: false, ours: false };
    let board = null;
    let ours = new Map(); // flight key → our groups on it

    async function load(force = false) {
        board = await ctx.guard(force ? request('POST', '/api/flights/refresh') : request('GET', '/api/flights'));
        ours = guestsOnFlights(board, await ctx.guard(mirrorAll())); // both cities' slips: a group lands in Jeddah for either
        draw();
    }

    function draw() {
        if (!board) return;
        const dir = state.dir;
        const list = (dir === 'arr' ? board.arrivals : board.departures) || [];
        const other = dir === 'arr' ? 'dep_iata' : 'arr_iata';
        const term = (f) => (dir === 'arr' ? f.arr_terminal : f.dep_terminal) || '';
        const when = (f) => dir === 'arr' ? (f.arr_estimated || f.arr_time) : (f.dep_estimated || f.dep_time);
        // from 2 hours ago to the end of the board (the API looks up to 10 hours ahead)
        const from = nowTs() - 2 * 3600e3;
        const keyOf = (f) => `${dir}|${f.flight_iata}|${dir === 'arr' ? f.arr_time : f.dep_time}`;
        const rows = list.filter(f => toTs(when(f)) >= from)
            .filter(f => !state.ours || ours.has(keyOf(f)))
            .filter(f => !state.term || term(f) === state.term)
            .filter(f => !state.india || INDIA.has(f[other]))
            .sort((a, b) => toTs(when(a)) - toTs(when(b)));
        const counts = { '': 0, '1': 0, N: 0, H: 0 };
        for (const f of list.filter(x => toTs(when(x)) >= from)) { counts['']++; if (term(f) in counts) counts[term(f)]++; }

        $('.fl-tabs').innerHTML = [['arr', `🛬 Arrivals (${(board.arrivals || []).length})`], ['dep', `🛫 Departures (${(board.departures || []).length})`]]
            .map(([k, l]) => `<button type="button" data-dir="${k}" aria-pressed="${state.dir === k}">${l}</button>`).join('');
        $('.fl-terms').innerHTML = [['', 'All terminals'], ['1', 'Terminal 1'], ['N', 'North'], ['H', 'Hajj']]
            .map(([k, l]) => `<button type="button" class="chip" data-term="${k}" aria-pressed="${state.term === k}">${l} <small>${counts[k] ?? 0}</small></button>`).join('');
        $('.fl-india').checked = state.india;
        // our guests on this direction's board (upcoming and the last 2 hours)
        const mine = list.filter(f => toTs(when(f)) >= from && ours.has(keyOf(f)));
        const minePax = mine.reduce((n, f) => n + ours.get(keyOf(f)).pax, 0);
        $('.fl-ours').checked = state.ours;
        $('.fl-ours-sum').innerHTML = mine.length
            ? `👥 <b>${mine.length}</b> flight${mine.length === 1 ? '' : 's'} with our guests · <b>${minePax}</b> pax ${dir === 'arr' ? 'arriving' : 'departing'}`
            : `No flight with our guests on this board${board.fetched_at ? '' : ' yet'}`;

        $('.fl-list').innerHTML = !board.fetched_at
            ? `<p class="hm-muted">${board.configured ? 'The first flight board is on its way — the server fetches it within 15 minutes.' : 'Flight board not set up on the server yet.'}</p>`
            : rows.length ? `<table class="fl-tbl" data-no-cards><thead><tr><th>${dir === 'arr' ? 'Arrives' : 'Departs'}</th><th>Flight</th><th>${dir === 'arr' ? 'From' : 'To'}</th><th>Terminal</th><th>Status</th><th>Our guests</th></tr></thead><tbody>
                ${rows.map(f => {
                    const [label, cls] = statusOf(f, dir);
                    const sched = dir === 'arr' ? f.arr_time : f.dep_time, est = dir === 'arr' ? f.arr_estimated : f.dep_estimated;
                    const moved = est && est !== sched;
                    const code = f[other];
                    const us = ours.get(keyOf(f));
                    return `<tr class="${INDIA.has(code) ? 'in' : ''} ${f.status === 'cancelled' ? 'cx' : ''} ${us ? 'ours' : ''}">
                        <td class="t"><b>${esc(hm(moved ? est : sched))}</b>${moved ? `<small><s>${esc(hm(sched))}</s></small>` : ''}</td>
                        <td><b>${esc(f.flight_iata || '—')}</b>${f.cs_flight_iata ? `<small>also ${esc(f.cs_flight_iata)}</small>` : ''}</td>
                        <td>${esc(CITY[code] || code || '—')}${CITY[code] ? `<small>${esc(code)}</small>` : ''}</td>
                        <td>${esc(TERMINALS[term(f)] || term(f) || '—')}${dir === 'arr' && f.arr_baggage ? `<small>belt ${esc(f.arr_baggage)}</small>` : (dir === 'dep' && f.dep_gate ? `<small>gate ${esc(f.dep_gate)}</small>` : '')}</td>
                        <td><span class="fl-st ${cls}">${esc(label)}</span></td>
                        <td class="g">${us ? `<b>👥 ${us.pax} pax</b><small>${us.groups.map(g => `SH ${esc(g.sh)}${g.name ? ' · ' + esc(g.name) : ''} (${g.pax})`).join('<br>')}</small>` : ''}</td></tr>`;
                }).join('')}</tbody></table>`
            : '<p class="hm-muted">No flights match.</p>';

        const isAdmin = currentDesk()?.role === 'admin';
        $('.fl-foot').innerHTML = `
            ${board.fetched_at ? `<span>Last fetch: <b>${esc(localTime(board.fetched_at))}</b> (${esc(ago(board.fetched_at))})</span>` : '<span>Last fetch: —</span>'}
            <span>Next fetch: <b>${board.next_fetch_at ? esc(localTime(board.next_fetch_at)) : 'within 15 min'}</b></span>
            <span>${board.calls_used} of ${board.calls_budget} lookups used this month</span>
            ${board.error ? `<span class="bad">⚠ ${esc(board.error)}</span>` : ''}
            ${isAdmin ? `<button type="button" class="fl-refresh" title="Fetch now (uses about ${board.calls_last || 8} of this month's lookups)">Refresh now</button>` : ''}`;
    }

    root.addEventListener('click', async (e) => {
        const b = e.target.closest('button');
        if (!b) return;
        if (b.dataset.dir) { state.dir = b.dataset.dir; draw(); }
        else if (b.dataset.term != null) { state.term = b.dataset.term; draw(); }
        else if (b.classList.contains('fl-refresh')) {
            if (!confirm(`Fetch the Jeddah board now? It uses about ${board?.calls_last || 8} of this month's ${board?.calls_budget} lookups and moves the next automatic fetch later.`)) return;
            b.disabled = true; b.textContent = 'Fetching…';
            try { await load(true); } catch (err) { alert(err instanceof UserError ? err.message : 'Could not refresh.'); draw(); }
        }
    });
    $('.fl-india').addEventListener('change', (e) => { state.india = e.target.checked; draw(); });
    $('.fl-ours').addEventListener('change', (e) => { state.ours = e.target.checked; draw(); });

    try { await load(); }
    catch (e) {
        $('.fl-list').innerHTML = `<p class="hm-muted">${e?.status === 404 ? 'The server does not have the flight board yet.' : 'The flight board is not available right now.'}</p>`;
    }
    // redraw every minute so "2 hours ago" windows and times stay right; re-read the stored board every 10 min
    let n = 0;
    return setInterval(() => { if (++n % 10 === 0) load().catch(() => { }); else draw(); }, 60e3);
}
