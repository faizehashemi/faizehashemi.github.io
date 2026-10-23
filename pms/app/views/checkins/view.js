// Ported from pms/checkins_checkouts.html. The page had three stacked scripts (one a no-op, two
// patching each other through window.run); this is the behaviour they produced, as one module:
// default window today 03:00 → tomorrow 03:00, "Date to" follows "Date from" unless edited,
// presets span 03:00 → 03:00 of the following day, and an empty/reversed range becomes 24h.

import { printSlips, openGlCopies } from '../../core/slip-print.js';
import { canOpen, mirrorAll } from '../../core/cloud.js';
import { getPrefs } from '../../core/prefs.js';
import { CHECKINS_COLS } from '../../core/checkins-cols.js';
import { baseSh } from '../../core/ums.js';
import { departuresOf, isDelayed, paxAt } from '../../core/stay.js';
import { legOf as flightLeg, loadFlightStatus, describe as describeFlight, checkLinks } from '../../core/flights.js';

export default async function mount(ctx) {
    const { db } = ctx;

    /* ===== Data (this site) ===== */
    const getAllRecords = () => db.all();

    /* ===== Helpers ===== */
    function $(id) { return document.getElementById(id) }
    function pad(n) { return String(n).padStart(2, '0') }
    function num(v) { const x = Number(v); return Number.isFinite(x) ? x : 0; }
    function parseDT(d, t) { if (!d) return null; const tt = t && t.length ? t : '00:00'; const v = new Date(`${d}T${tt}`); return isNaN(v) ? null : v; }
    function ymd(d) { return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` }
    function plusOneDay(yyyy_mm_dd) {
        if (!yyyy_mm_dd) return '';
        const [y, m, d] = yyyy_mm_dd.split('-').map(Number);
        const dt = new Date(y, (m || 1) - 1, d || 1); // local midnight
        dt.setDate(dt.getDate() + 1);
        return ymd(dt);
    }
    // a partial departure (delayed group, core/stay.js) lists only the rooms leaving then
    // ascending, numbers in number order (2, 10, 101; 12A after 12)
    const byRoom = (a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
    function roomsFromSlip(r) { if (r._dep) return [...new Set(r._dep.rooms.map(x => String(x.room_no)))].sort(byRoom); const bag = []; (r.rooms?.gents || []).forEach(x => bag.push(String(x.room_no || '').trim())); (r.rooms?.ladies || []).forEach(x => bag.push(String(x.room_no || '').trim())); return Array.from(new Set(bag.filter(Boolean))).sort(byRoom); }
    function guests(r) { if (r._dep) return r._dep.pax; const tot = num(r.total); if (tot) return tot; const kids = num(r.children ?? r.child); const inf = num(r.infants ?? r.infant); return num(r.gents) + num(r.ladies) + kids + inf; }
    function fmtDT(dt) { if (!dt) return ''; try { return dt.toLocaleString([], { year: '2-digit', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' }) } catch (e) { return dt.toISOString().slice(0, 16).replace('T', ' ') } }
    function within(dt, start, end) { return dt && dt >= start && dt <= end; }
    function escapeHTML(s) { return String(s).replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m])) }

    // Assigned guests: explicit numeric field -> per-room sum -> headcount total
    function assignedCount(r) {
        const direct = r.assigned ?? r.assigned_count ?? r.assignedGuests ?? r.assignedRoomsCount;
        const directNum = Number(direct);
        if (Number.isFinite(directNum) && directNum >= 0) return directNum;
        if (r.rooms && (Array.isArray(r.rooms.gents) || Array.isArray(r.rooms.ladies))) {
            const sumAssigned = (arr) => (Array.isArray(arr) ? arr.reduce((s, x) => s + (Number(x?.assigned) || 0), 0) : 0);
            return sumAssigned(r.rooms.gents) + sumAssigned(r.rooms.ladies);
        }
        const kids = num(r.children ?? r.child);
        const inf = num(r.infants ?? r.infant);
        return num(r.total) || (num(r.gents) + num(r.ladies) + kids + inf);
    }

    let CACHE = [];

    // Cross-links follow the login's page access (Setup → Page access): no Slip page → no Open column,
    // no Print slips page → no Print slips / GL copy buttons.
    const may = { slip: canOpen('slip'), print: canOpen('print') };
    function applyAccess() {
        may.slip = canOpen('slip'); may.print = canOpen('print');
        ['slipsIn', 'slipsOut', 'glIn', 'glOut'].forEach(id => { $(id).hidden = !may.print; });
        ['tblIn', 'tblOut'].forEach(id => $(id).classList.toggle('no-open', !may.slip));
    }
    let SHOWN = { in: [], out: [] }; // the rows in each table, in table order (Print slips / GL copy)

    /* ===== Date range wiring ===== */
    let userEditedDateTo = false;
    let lastAutoTo = ''; // last automatically set dateTo, to avoid fighting the user

    // A same-time or reversed range (e.g. 03:00 → 03:00) means "the 24h from start"
    function ensureDateRange() {
        const df = $('dateFrom').value;
        if (!$('dateTo').value && df) {
            $('dateTo').value = plusOneDay(df);
            lastAutoTo = $('dateTo').value;
            userEditedDateTo = false;
        }
        const tf = $('timeFrom').value || '03:00';
        const tt = $('timeTo').value || '03:00';
        const start = df ? new Date(`${df}T${tf}`) : null;
        const dt = $('dateTo').value;
        let end = dt ? new Date(`${dt}T${tt}`) : null;
        if (start && end && !(end > start)) {
            end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
            $('dateTo').value = ymd(end);
            $('timeTo').value = pad(end.getHours()) + ':' + pad(end.getMinutes());
            lastAutoTo = $('dateTo').value;
            userEditedDateTo = false;
        }
        return { start, end };
    }

    function setRange(df, dt) {
        $('dateFrom').value = df;
        $('dateTo').value = dt;
        $('timeFrom').value = '03:00';
        $('timeTo').value = '03:00';
        lastAutoTo = dt; userEditedDateTo = false;
        run();
    }

    /* ===== Render ===== */
    function run() {
        ensureDateRange();
        const df = $('dateFrom').value, dt = $('dateTo').value;
        const tf = $('timeFrom').value || '00:00', tt = $('timeTo').value || '23:59';
        if (!df || !dt) { alert('Pick both Date from and Date to.'); return; }
        const start = new Date(`${df}T${tf}`);
        let end = new Date(`${dt}T${tt}`);
        if (!(end > start)) end = new Date(start.getTime() + 24 * 60 * 60 * 1000);

        const mode = $('mode').value;
        const ins = [], outs = [];
        for (const r of CACHE) {
            const ci = parseDT(r.checkin_date, r.checkin_time);
            const co = parseDT(r.checkout_date, r.checkout_time);
            if (ci && within(ci, start, end)) ins.push(r);
            if (!isDelayed(r)) { if (co && within(co, start, end)) outs.push(r); continue; }
            // delayed: one check-out row per departure (the rooms and guests leaving then)
            for (const d of departuresOf(r)) {
                const at = new Date(d.at);
                if (!within(at, start, end)) continue;
                const pad2 = (n) => String(n).padStart(2, '0');
                outs.push({ ...r, checkout_date: ymd(at), checkout_time: `${pad2(at.getHours())}:${pad2(at.getMinutes())}`,
                    _dep: { rooms: d.rooms, status: d.status, last: d.last, pax: paxAt(r, d.at - 1).total - paxAt(r, d.at).total } });
            }
        }
        ins.sort((a, b) => parseDT(a.checkin_date, a.checkin_time) - parseDT(b.checkin_date, b.checkin_time));
        outs.sort((a, b) => parseDT(a.checkout_date, a.checkout_time) - parseDT(b.checkout_date, b.checkout_time));

        SHOWN = { in: ins, out: outs };
        renderTable('In', ins, 'checkin');
        renderTable('Out', outs, 'checkout');

        $('panelIn').hidden = !(mode === 'in' || mode === 'both');
        $('panelOut').hidden = !(mode === 'out' || mode === 'both');

        $('sumIn').textContent = `${ins.length} slips • ${ins.reduce((s, r) => s + guests(r), 0)} guests`;
        $('sumOut').textContent = `${outs.length} slips • ${outs.reduce((s, r) => s + guests(r), 0)} guests`;
        $('status').textContent = `Range ${df} ${tf} → ${dt} ${tt} • ${CACHE.length} slip(s) in DB`;
    }

    /* ===== Split view: where a stay comes from and goes to ===== */
    // UMS slips: the stay's place in the group's itinerary (e.g. MAKKAH→MADINA→MAKKAH, 2nd Makkah stay = from Madina,
    // to the airport). Slips made by hand: an SH starting with S came from the other city; it leaves for the other city
    // when the same group has a stay there starting within a day of this check-out, else for the airport.
    const CITY = { MAKKAH: 'makkah', MADINA: 'medina' };
    const other = ctx.siteId === 'makkah' ? 'medina' : 'makkah';
    const otherLabel = other === 'medina' ? 'Madina' : 'Makkah';
    let OTHER = []; // the other site's slips (for hand-made slips)
    function legOf(r) {
        const it = String(r.ums?.itinerary || '');
        if (it) {
            const legs = it.split('→').map(c => CITY[c.trim()]);
            const seg = Number(r.ums?.seg) || 1;
            let idx = -1, n = 0;
            for (let i = 0; i < legs.length; i++) if (legs[i] === ctx.siteId && ++n === seg) { idx = i; break; }
            if (idx >= 0) return { from: idx === 0 ? 'airport' : legs[idx - 1], to: idx === legs.length - 1 ? 'airport' : legs[idx + 1] };
        }
        const from = /^S/i.test(String(r.sh_no ?? '').trim()) ? other : 'airport';
        const co = r.checkout_date, key = baseSh(r.sh_no);
        const day = (d, n) => { const x = new Date(`${d}T12:00`); x.setDate(x.getDate() + n); return ymd(x); };
        const next = key && co && OTHER.some(o => !o.deleted && baseSh(o.sh_no) === key && o.checkin_date >= day(co, -1) && o.checkin_date <= day(co, 1));
        return { from, to: next ? other : 'airport' };
    }
    const splitOn = () => $('splitView').checked;
    // [[title, rows]]: one untitled part, or (split view) arrivals by where from / departures by where to.
    // The table, the CSV and Print table all use it, so they always agree.
    function partsOf(rows, key) {
        if (!splitOn()) return [[null, rows]];
        const side = key === 'checkin' ? 'from' : 'to';
        const pick = (w) => rows.filter(r => legOf(r)[side] === w);
        return key === 'checkin'
            ? [['From the airport', pick('airport')], [`From ${otherLabel}`, pick(other)]]
            : [['Departing to the airport', pick('airport')], [`Departing to ${otherLabel}`, pick(other)]];
    }
    const partSum = (list) => `${list.length} slip${list.length === 1 ? '' : 's'} · ${list.reduce((s, r) => s + guests(r), 0)} guests`;

    function renderTable(kind, rows, key) {
        const table = $(`tbl${kind}`);
        table.querySelectorAll('tbody').forEach(b => b.remove());
        const cols = table.querySelector('thead tr').outerHTML.replace('<tr', '<tr class="split-cols"');
        const parts = partsOf(rows, key);
        table.querySelector('thead').hidden = splitOn();
        for (const [title, list] of parts) {
            const tbody = document.createElement('tbody');
            if (title) {
                tbody.className = 'split-part';
                tbody.innerHTML = `<tr class="split-title"><td colspan="15">${escapeHTML(title)}<small>${partSum(list)}</small></td></tr>${cols}`
                    + (list.length ? '' : '<tr class="split-empty"><td colspan="15">None in this range.</td></tr>');
            }
            table.appendChild(tbody);
            fillRows(tbody, list, key);
        }
    }
    function fillRows(tbody, rows, key) {
        for (const r of rows) {
            const ci = parseDT(r.checkin_date, r.checkin_time);
            const co = parseDT(r.checkout_date, r.checkout_time);
            const t = key === 'checkin' ? fmtDT(ci) : fmtDT(co);
            const sh = String(r.sh_no || '').trim();
            const href = sh ? ctx.href('slip', { sh_no: sh }) : ctx.href('slip');
            const gl = String(r.group_leader ?? '').trim() || '-';
            const openCell = !may.slip ? ''
                : sh ? `<a class="btn-open" href="${href}" target="_blank" rel="noopener">Open</a>`
                : `<a class="btn-open" aria-disabled="true" title="No SH number">Open</a>`;

            const tr = document.createElement('tr');
            tr.innerHTML = `
      <td class="nowrap">${t}</td>
      ${flightCell(r, key)}
      <td class="c-sh">${escapeHTML(r.sh_no || '')}</td>
      <td class="c-group">${escapeHTML(r.tour_name || '')}${isDelayed(r) ? ` <span class="badge-delay" title="${escapeHTML(r.delayed.note || '')}">Delayed · ${escapeHTML(r._dep ? r._dep.status : (r.delayed.status || ''))}${r._dep && !r._dep.last ? ' · part' : ''}</span>` : ''}</td>
      <td class="c-leader">${escapeHTML(gl)}</td>
      <td class="c-building">${escapeHTML((r.building || '').trim())}</td>
      <td class="c-rooms">${escapeHTML(roomsFromSlip(r).join(', '))}</td>
      <td class="c-as">${assignedCount(r)}</td>
      <td class="c-t">${guests(r)}</td>
      <td class="c-g">${num(r.gents)}</td>
      <td class="c-l">${num(r.ladies)}</td>
      <td class="c-c">${num(r.children ?? r.child)}</td>
      <td class="c-i">${num(r.infants ?? r.infant)}</td>
      <td class="nowrap c-other">${key === 'checkin' ? fmtDT(co) : fmtDT(ci)}</td>
      <td class="nowrap c-slip">${openCell}</td>
    `;
            tbody.appendChild(tr);
        }
    }

    /* ===== Live flight status (Flightradar24, kept by the server) ===== */
    // Check-ins: the arrival flight of a stay that comes from the airport; check-outs: the departure flight of a stay
    // that goes to the airport. Stays from / to the other city and car, bus or train legs have no flight.
    // The live flight API (Flightradar24 / VariFlight via the Worker) is switched off: no status, no Guest flights panel,
    // only the Check 1 / Check 2 links. The code stays for later — set FLIGHT_API to true (and FLIGHT_API_ON in worker.js).
    const FLIGHT_API = false;
    let FLIGHTS = null; // { byKey, meta, configured }
    function flightOf(r, key) {
        const dir = key === 'checkin' ? 'arr' : 'dep';
        if (legOf(r)[key === 'checkin' ? 'from' : 'to'] !== 'airport') return { kind: 'city' };
        return { ...flightLeg(r, dir), dir };
    }
    function flightCell(r, key) {
        const f = flightOf(r, key);
        if (f.kind === 'city') return `<td class="fl"><span class="fl-none">${key === 'checkin' ? 'from' : 'to'} ${otherLabel}</span></td>`;
        if (f.kind === 'road') return `<td class="fl"><span class="fl-none">by ${escapeHTML((f.mode || 'road').toLowerCase())}</span></td>`;
        if (f.kind !== 'flight') return '<td class="fl"><span class="fl-none">—</span></td>';
        if (!FLIGHT_API) return `<td class="fl" title="${escapeHTML(f.code)}">${checkHtml(f.code, { dir: f.dir, date: f.leg?.date }, true)}</td>`;
        const d = FLIGHTS ? describeFlight(f.dir, FLIGHTS.byKey.get(f.key)) : { label: '…', sentence: '', cls: 'wait', title: '' };
        const row = FLIGHTS?.byKey.get(f.key);
        return `<td class="fl" title="${escapeHTML(d.title)}"><b class="fl-code">${escapeHTML(f.code)}</b><span class="fl-st ${d.cls}">${escapeHTML(d.label)}</span><small class="fl-say">${escapeHTML(d.sentence)}</small>${checkHtml(f.code, { callsign: row?.callsign, row, dir: f.dir, date: f.leg?.date })}</td>`;
    }
    // "Check 1 · Check 2": the flight on Trip.com and FlightAware, to confirm by hand — for the flight's own date
    // (Trip.com cannot be opened on a date: the tab to tap is named; FlightAware opens the flight or that day's list)
    function checkHtml(code, o, only = false) {
        const l = checkLinks(code, o);
        if (!l) return '';
        if (only) {
            const t1 = l.tripTab || !l.date ? `<a href="${escapeHTML(l.trip)}" target="_blank" rel="noopener" title="${escapeHTML(code)} on Trip.com${l.tripTab ? ` — tap the “${escapeHTML(l.tripTab)}” tab` : ''}">Check 1</a>` : '';
            return `<span class="fl-links only">${t1}${t1 ? ' · ' : ''}<a href="${escapeHTML(l.fa)}" target="_blank" rel="noopener" title="${escapeHTML(l.ident)} on FlightAware${l.dateLabel ? ` — ${escapeHTML(l.dateLabel)}` : ''}">Check 2</a></span>`;
        }
        const trip = l.tripTab || !l.date
            ? `<a href="${escapeHTML(l.trip)}" target="_blank" rel="noopener" title="${escapeHTML(code)} on Trip.com${l.tripTab ? ` — it opens on today: tap the “${escapeHTML(l.tripTab)}” tab` : ''}">Check 1</a>`
            : `<span class="fl-na" title="Trip.com only shows yesterday, today and tomorrow">Check 1 n/a</span>`;
        const fa = `<a href="${escapeHTML(l.fa)}" target="_blank" rel="noopener" title="${escapeHTML(l.ident)} on FlightAware — ${l.faExact ? `the flight of ${escapeHTML(l.dateLabel)}` : `its list by day: find ${escapeHTML(l.dateLabel || 'the date')}`}">Check 2</a>`;
        const hint = l.dateLabel ? `<small class="fl-for">${l.tripTab ? `for ${escapeHTML(l.dateLabel)} — on Trip.com tap “${escapeHTML(l.tripTab)}”` : `for ${escapeHTML(l.dateLabel)}`}${l.faExact ? '' : ' · FlightAware: find that day'}</small>` : '';
        return `<span class="fl-links">${trip} · ${fa}${hint}</span>`;
    }
    function flightText(r, key) {
        const f = flightOf(r, key);
        if (f.kind !== 'flight') return f.kind === 'road' ? `by ${(f.mode || 'road').toLowerCase()}` : '';
        return `${f.code} ${FLIGHT_API && FLIGHTS ? describeFlight(f.dir, FLIGHTS.byKey.get(f.key)).text : ''}`.trim();
    }
    const flightsShown = () => $('showFlights').checked;
    function applyFlightToggle() {
        ['tblIn', 'tblOut'].forEach(id => $(id).classList.toggle('no-flight', !flightsShown()));
        $('panelFlights').hidden = !FLIGHT_API; // the Guest flights panel (folded) only while the flight API is on
    }

    // every guest flight from 12 h ago to 24 h ahead (both sites' groups), latest status, delay and details
    function renderFlightsPanel() {
        if (!FLIGHTS) return;
        const nowMs = Date.now();
        const at = (row) => Date.parse(`${row.sched}:00+03:00`);
        const rows = [...FLIGHTS.byKey.values()].filter(r => at(r) >= nowMs - 12 * 3600e3 && at(r) <= nowMs + 24 * 3600e3).sort((a, b) => at(a) - at(b));
        // which groups are on each flight (this site's slips and the other site's)
        const groups = new Map();
        for (const s of [...CACHE, ...OTHER]) {
            if (s.deleted) continue;
            for (const dir of ['arr', 'dep']) {
                const f = flightLeg(s, dir);
                if (f.kind !== 'flight') continue;
                if (!groups.has(f.key)) groups.set(f.key, []);
                groups.get(f.key).push(s);
            }
        }
        const badCount = rows.filter(r => r.flag === 'no_sign' || r.status === 'diverted' || r.status === 'elsewhere').length;
        const lateCount = rows.filter(r => r.delay_min >= 30 || r.flag === 'late').length; // 30 min+ counts as late
        $('sumFlights').textContent = `${rows.length} flight${rows.length === 1 ? '' : 's'}${lateCount ? ` · ${lateCount} late` : ''}${badCount ? ` · ${badCount} to check` : ''}`;
        if (!rows.length) { $('flightsList').innerHTML = '<p class="muted">No guest flights in this window.</p>'; return; }
        const day = (r) => new Date(at(r)).toLocaleDateString('en-GB', { timeZone: 'Asia/Riyadh', weekday: 'short', day: '2-digit', month: 'short' });
        $('flightsList').innerHTML = `<table class="fl-board">
          <thead><tr><th>UMS time</th><th>Flight</th><th>In / out</th><th>Airport</th><th>Groups</th><th>Status</th><th>Details</th></tr></thead>
          <tbody>${rows.map(r => {
              const d = describeFlight(r.dir, r);
              const g = (groups.get(r.key) || []);
              const pax = g.reduce((s, x) => s + guests(x), 0);
              const det = (r.detail || {});
              return `<tr class="${d.cls === 'bad' ? 'row-bad' : d.cls === 'warn' ? 'row-warn' : ''}">
                <td class="nowrap"><b>${escapeHTML(r.sched.slice(11, 16))}</b><small>${escapeHTML(day(r))}</small></td>
                <td><b>${escapeHTML(r.code)}</b>${r.callsign ? `<small>${escapeHTML(r.callsign)}</small>` : ''}${checkHtml(r.code, { callsign: r.callsign, row: r, dir: r.dir })}</td>
                <td>${r.dir === 'arr' ? 'Arrival' : 'Departure'}</td>
                <td>${r.airport === 'MED' ? 'Madina' : 'Jeddah'}</td>
                <td>${g.length ? `${escapeHTML(g.map(x => x.sh_no).filter(Boolean).join(', '))}<small>${g.length} group${g.length === 1 ? '' : 's'} · ${pax} guests</small>` : '<span class="fl-none">—</span>'}</td>
                <td title="${escapeHTML(d.title)}"><span class="fl-st big ${d.cls}">${escapeHTML(d.label)}</span><small class="fl-say">${escapeHTML(d.sentence)}</small></td>
                <td class="fl-det">${escapeHTML([det.type, det.reg].filter(Boolean).join(' · ') || '')}${r.origin || r.destination ? `<small>${escapeHTML([r.origin, r.destination_actual || r.destination].filter(Boolean).join(' → '))}</small>` : ''}</td>
              </tr>`;
          }).join('')}</tbody></table>`;
    }
    async function loadFlights(force = false) {
        if (!FLIGHT_API) { FLIGHTS = null; $('flightNote').textContent = ''; return; } // switched off: nothing is asked
        try {
            FLIGHTS = await loadFlightStatus({ force });
            const m = FLIGHTS.meta;
            $('flightNote').textContent = !FLIGHTS.configured ? 'Flight status: not set up on the server yet.'
                : m && m.error ? `Flight status: ${m.error}`
                : m && m.last_run ? `Flight status updated ${new Date(m.last_run).toLocaleTimeString('en-GB', { timeZone: 'Asia/Riyadh', hour: '2-digit', minute: '2-digit' })} (Riyadh time) · Flightradar24 — verify on the official airport website (kaia.sa · tibahairports.com)` : '';
        } catch { /* offline: keep what is shown */ }
        renderFlightsPanel();
    }

    /* ===== CSV export ===== */
    function toCSV(rows, kind) {
        const head = kind === 'in'
            ? ['Check-in', ...(flightsShown() ? ['Flight'] : []), 'SH No', 'Group', 'Group Leader', 'Building', 'Rooms', 'As.', 'T', 'G', 'L', 'C', 'I', 'Check-out']
            : ['Check-out', ...(flightsShown() ? ['Flight'] : []), 'SH No', 'Group', 'Group Leader', 'Building', 'Rooms', 'As.', 'T', 'G', 'L', 'C', 'I', 'Check-in'];
        const esc = v => `"${String(v ?? '').replace(/"/g, '""')}"`;
        // the same columns as the table on screen (Settings → Check-ins page)
        const ids = ['time', ...(flightsShown() ? ['fl'] : []), 'sh', 'group', 'leader', 'building', 'rooms', 'as', 't', 'g', 'l', 'c', 'i', 'other'];
        const hidden = hiddenCols(kind);
        const keepCol = (i) => !hidden.includes(ids[i]);
        const lines = [];
        for (const [title, list] of partsOf(rows, kind === 'in' ? 'checkin' : 'checkout')) {
            if (title) { if (lines.length) lines.push(''); lines.push(esc(`${title} — ${partSum(list)}`)); }
            lines.push(head.filter((_, i) => keepCol(i)).join(','));
            for (const r of list) {
                const ci = parseDT(r.checkin_date, r.checkin_time);
                const co = parseDT(r.checkout_date, r.checkout_time);
                const gl = String(r.group_leader ?? '').trim() || '-';
                const mid = [r.sh_no || '', r.tour_name || '', gl, (r.building || '').trim(),
                    roomsFromSlip(r).join(' '), assignedCount(r), guests(r),
                    num(r.gents), num(r.ladies), num(r.children ?? r.child), num(r.infants ?? r.infant)];
                const fl = flightsShown() ? [flightText(r, kind === 'in' ? 'checkin' : 'checkout')] : [];
                const row = kind === 'in' ? [fmtDT(ci), ...fl, ...mid, fmtDT(co)] : [fmtDT(co), ...fl, ...mid, fmtDT(ci)];
                lines.push(row.filter((_, i) => keepCol(i)).map(esc).join(','));
            }
        }
        return lines.join('\r\n');
    }

    function downloadCSV(text, filename) {
        const blob = new Blob([text], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = filename;
        document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
    }

    // the rows in the table (same range, delayed departures and split as on screen)
    function exportRows(kind) {
        const df = $('dateFrom').value, dt = $('dateTo').value;
        const rows = kind === 'in' ? SHOWN.in : SHOWN.out;
        downloadCSV(toCSV(rows, kind), `${kind === 'in' ? 'checkins' : 'checkouts'}_${df}_${dt}${splitOn() ? '_split' : ''}.csv`);
    }

    // Print table: the rows shown, in a tab of their own laid out for A4 landscape with 1 cm margins —
    // SH · Group (group leader beneath) · Building · Rooms (wraps) · Total Pax · Check-in · Check-out, all centred.
    // The page on screen keeps its own columns. Call straight from the click so the browser allows the tab.
    function printTable(kind) {
        const rows = kind === 'in' ? SHOWN.in : SHOWN.out;
        if (!rows.length) { alert('No rows to print in this table.'); return; }
        const w = window.open('', '_blank');
        if (!w) { alert('The browser blocked the new tab. Allow pop-ups for this site, then press Print table again.'); return; }
        const title = `${kind === 'in' ? 'Check-ins' : 'Check-outs'} · ${ctx.site.label}`;
        const total = rows.reduce((s, r) => s + guests(r), 0);
        const rowHtml = (r) => {
            const ci = parseDT(r.checkin_date, r.checkin_time), co = parseDT(r.checkout_date, r.checkout_time);
            return `<tr>
              <td>${escapeHTML(r.sh_no ?? '')}</td>
              <td><b>${escapeHTML(r.tour_name || '-')}</b><br><span class="gl">${escapeHTML(String(r.group_leader ?? '').trim() || '-')}</span></td>
              <td>${escapeHTML((r.building || '').trim() || '-')}</td>
              <td class="rooms">${escapeHTML(roomsFromSlip(r).join(', ') || '-')}</td>
              <td><b>${guests(r)}</b></td>
              <td>${escapeHTML(fmtDT(ci))}</td>
              <td>${escapeHTML(fmtDT(co))}</td>
            </tr>`;
        };
        const thead = '<thead><tr><th>SH No</th><th>Group / Group Leader</th><th>Building</th><th>Rooms</th><th>Total Pax</th><th>Check-in</th><th>Check-out</th></tr></thead>';
        const colgroup = '<colgroup><col style="width:8%"><col style="width:25%"><col style="width:10%"><col style="width:25%"><col style="width:8%"><col style="width:12%"><col style="width:12%"></colgroup>';
        const tables = partsOf(rows, kind === 'in' ? 'checkin' : 'checkout').map(([t, list]) =>
            (t ? `<h2>${escapeHTML(t)} <small>${escapeHTML(partSum(list))}</small></h2>` : '')
            + `<table>${colgroup}${thead}<tbody>${list.length ? list.map(rowHtml).join('') : '<tr><td colspan="7">None in this range.</td></tr>'}</tbody></table>`).join('');
        w.document.open();
        w.document.write(`<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><title>${escapeHTML(title)}</title>
<style>
@page { size: A4 landscape; margin: 10mm; }
html, body { margin: 0; background: #fff; color: #000; font: 11px/1.3 Arial, Helvetica, sans-serif; }
body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
h1 { font-size: 15px; margin: 0 0 2px; text-align: center; }
h2 { font-size: 13px; margin: 10px 0 4px; break-after: avoid; page-break-after: avoid; }
h2 small { font-weight: normal; font-size: 11px; margin-left: 6px; }
.sub { text-align: center; font-size: 11px; margin: 0 0 6px; }
table { width: 100%; border-collapse: collapse; table-layout: fixed; }
th, td { border: 1px solid #000; padding: 3px 4px; text-align: center; vertical-align: middle; overflow-wrap: anywhere; }
th { background: #eee; font-size: 11px; }
thead { display: table-header-group; }
tr { break-inside: avoid; page-break-inside: avoid; }
td .gl { font-size: 10px; }
td.rooms { font-size: 10px; }
.bar { position: sticky; top: 0; display: flex; gap: 10px; align-items: center; padding: 8px 12px; background: #fffaf1; border-bottom: 1px solid #dcc7a4; font: 13px system-ui, sans-serif; }
.bar button { font: inherit; padding: 5px 14px; border: 1px solid #d4af37; border-radius: 8px; background: #d4af37; color: #fff; font-weight: 700; cursor: pointer; }
@media screen { body { background: #e9e6df; } .page { width: 277mm; margin: 10mm auto; padding: 10mm; background: #fff; box-shadow: 0 4px 16px rgba(0,0,0,.15); } }
@media print { .bar { display: none; } }
</style></head>
<body>
<div class="bar"><button type="button" onclick="window.print()">Print</button><span>A4 landscape · 1 cm margins — choose A4 and Landscape if the printer asks</span></div>
<div class="page">
<h1>${escapeHTML(title)}</h1>
<p class="sub">${escapeHTML(rangeLabel())} · ${rows.length} group${rows.length === 1 ? '' : 's'} · ${total} pax</p>
${tables}
</div>
<script>
window.addEventListener('load', function () { setTimeout(function () { window.focus(); window.print(); }, 250); });
</script>
</body></html>`);
        w.document.close();
    }

    /* ===== Wiring ===== */
    $('dateFrom').addEventListener('input', () => {
        const df = $('dateFrom').value;
        if (!df) return;
        if (!userEditedDateTo || $('dateTo').value === lastAutoTo) {
            const next = plusOneDay(df);
            $('dateTo').value = next;
            lastAutoTo = next;
            userEditedDateTo = false;
        }
    });
    $('dateTo').addEventListener('input', () => { userEditedDateTo = true; });

    $('presetToday').addEventListener('click', () => { const df = ymd(new Date()); setRange(df, plusOneDay(df)); });
    $('presetYesterday').addEventListener('click', () => { const d = new Date(); d.setDate(d.getDate() - 1); const df = ymd(d); setRange(df, plusOneDay(df)); });
    $('preset7').addEventListener('click', () => { const end = new Date(); const start = new Date(); start.setDate(end.getDate() - 6); setRange(ymd(start), plusOneDay(ymd(end))); });
    $('preset30').addEventListener('click', () => { const end = new Date(); const start = new Date(); start.setDate(end.getDate() - 29); setRange(ymd(start), plusOneDay(ymd(end))); });

    // columns hidden by this login's Settings (each table shows only its own date & time unless chosen otherwise)
    const KNOWN = CHECKINS_COLS.map(c => c[0]);
    const hiddenCols = (kind) => (getPrefs()[kind === 'in' ? 'checkinsHideIn' : 'checkinsHideOut'] || []).filter(id => KNOWN.includes(id));
    function applyCols() {
        for (const kind of ['in', 'out']) {
            const tbl = $(kind === 'in' ? 'tblIn' : 'tblOut'), hide = hiddenCols(kind);
            for (const id of KNOWN) tbl.classList.toggle(`hide-${id}`, hide.includes(id));
        }
    }
    applyCols();
    window.addEventListener('pms:prefs', applyCols);

    // Get Data: fresh slips from the PMS (this site and the other city), then the tables for the chosen window
    $('btnGet').addEventListener('click', async () => {
        const b = $('btnGet');
        b.disabled = true; b.textContent = 'Getting data…';
        try {
            CACHE = await getAllRecords();
            try { OTHER = (await mirrorAll()).filter(r => r.site === other); } catch { OTHER = []; }
            run();
        } catch (e) { console.error(e); $('status').textContent = 'Could not load slips: ' + (e.message || e); }
        finally { b.disabled = false; b.textContent = 'Get Data'; }
    });
    // split view: this login's default from Settings → Check-ins page; the tick switches it for now
    $('splitView').checked = !!getPrefs().checkinsSplit;
    $('splitView').addEventListener('change', run);
    // flight status column: hidden unless ticked (remembered in this browser)
    try { $('showFlights').checked = localStorage.getItem('pms_checkins_flight_col') === '1'; } catch { }
    $('showFlights').addEventListener('change', () => { try { localStorage.setItem('pms_checkins_flight_col', flightsShown() ? '1' : '0'); } catch { } applyFlightToggle(); });
    applyFlightToggle();
    // the Guest flights panel: folded on every visit; the arrow opens / folds it
    $('flFold').addEventListener('click', () => {
        const open = $('flFold').getAttribute('aria-expanded') !== 'true';
        $('flFold').setAttribute('aria-expanded', String(open));
        $('flightsBody').hidden = !open;
        $('panelFlights').classList.toggle('folded', !open);
    });
    $('csvIn').addEventListener('click', () => exportRows('in'));
    $('csvOut').addEventListener('click', () => exportRows('out'));
    $('printIn').addEventListener('click', () => printTable('in'));
    $('printOut').addEventListener('click', () => printTable('out'));
    const rangeLabel = () => `${$('dateFrom').value} ${$('timeFrom').value} → ${$('dateTo').value} ${$('timeTo').value}`;
    // the admin changed this login's pages while the page is open
    window.addEventListener('pms:desk-changed', () => { applyAccess(); run(); });
    applyAccess();
    $('slipsIn').addEventListener('click', () => may.print && printSlips(SHOWN.in, { title: `check-ins ${rangeLabel()}` }));
    $('slipsOut').addEventListener('click', () => may.print && printSlips(SHOWN.out, { title: `check-outs ${rangeLabel()}` }));
    $('glIn').addEventListener('click', () => may.print && openGlCopies(SHOWN.in, { title: `check-ins ${rangeLabel()}`, host: ctx.root }));
    $('glOut').addEventListener('click', () => may.print && openGlCopies(SHOWN.out, { title: `check-outs ${rangeLabel()}`, host: ctx.root }));

    /* ===== Boot ===== */
    async function refresh() {
        try {
            CACHE = await getAllRecords();
            try { OTHER = (await mirrorAll()).filter(r => r.site === other); } catch { OTHER = []; }
            const today = ymd(new Date());
            setRange(today, plusOneDay(today));
        } catch (e) {
            console.error(e);
            $('status').textContent = 'Could not load slips: ' + (e.message || e);
        }
    }

    await refresh();
    await loadFlights();
    run();
    // flight statuses change while the page is open: every 2 minutes (the server keeps them fresh)
    const flTimer = FLIGHT_API ? setInterval(async () => { if (document.visibilityState !== 'visible') return; await loadFlights(); if (CACHE.length) run(); }, 120e3) : 0;
    return () => { clearInterval(flTimer); window.removeEventListener('pms:prefs', applyCols); };
}
