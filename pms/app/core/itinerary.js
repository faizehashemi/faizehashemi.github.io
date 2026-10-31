// The group's itinerary: the stays of one UMS trip in order (Makkah → Medina → Makkah …), worked out from the slips of this site and what the import
// stored on them (ums.itinerary, arrival, departure), plus the stops a desk added by hand (slip.trip_extra). Each site keeps its own slips, so a stay at the
// other site is known only by its dates, taken from the neighbouring stays; the stays of this site always come from the slips themselves (the PMS wins).
// itineraryHTML() draws the A4 letter.

import { SITES, UMS } from '../config.js';
import { shiftTime } from './settings.js';
import { byRoad, baseSh } from './ums.js';

const CITY_LABEL = { MAKKAH: 'Makkah', MADINA: 'Medina' };
const SITE_CITY = (site) => SITES[site]?.umsCity || String(site || '').toUpperCase();
const norm = (s) => String(s ?? '').trim();

/** "Round Trip" (Makkah → Medina → Makkah), "Single Trip" (Makkah → Medina or Medina → Makkah), "Makkah only", "Medina only"; any other order is the plain city order. */
export function routeName(cities) {
    const k = cities.join('>');
    if (k === 'MAKKAH>MADINA>MAKKAH') return 'Round Trip';
    if (k === 'MAKKAH>MADINA') return 'Single Trip';
    if (k === 'MADINA>MAKKAH') return 'Single Trip';
    if (k === 'MAKKAH') return 'Makkah only';
    if (k === 'MADINA') return 'Medina only';
    return cities.map(c => CITY_LABEL[c] || c).join(' → ');
}
export const routeCities = (cities) => cities.map(c => CITY_LABEL[c] || c).join(' → ');

const slipSite = (s) => s.site || String(s.ums?.key || '').split('|')[1] || '';

/**
 * @param slip  the slip the letter is for
 * @param all   every slip of this site (db.all())
 * @returns the trip: route, group, pax, arrival / departure, `stops` (own stays and added stops in order) and `legs` (the UMS stays only)
 */
export function tripOf(slip, all = [], cfg = UMS) {
    const u = slip.ums || null;
    const site = slipSite(slip);
    const myCity = SITE_CITY(site);
    const cities = u?.itinerary ? String(u.itinerary).split('→').map(c => c.trim()).filter(Boolean) : [myCity];
    const mine = u?.ref ? all.filter(s => !s.deleted && s.ums?.ref === u.ref && slipSite(s) === site).sort((a, b) => (a.ums.seg || 1) - (b.ums.seg || 1)) : [slip];
    if (!mine.some(s => s.id === slip.id)) mine.push(slip);

    const seen = {};
    const legs = cities.map(city => {
        seen[city] = (seen[city] || 0) + 1;
        const own = city === myCity ? (u ? mine.find(s => (s.ums?.seg || 1) === seen[city]) : slip) : null;
        return { city, label: CITY_LABEL[city] || city, own: own || null, here: !!own && own.id === slip.id };
    });
    const A = u?.arrival && (byRoad(u.arrival) ? { date: u.arrival.date, time: u.arrival.time } : shiftTime(u.arrival.date, u.arrival.time, +cfg.arrivalCommuteHours));
    const D = u?.departure && (byRoad(u.departure) ? { date: u.departure.date, time: u.departure.time } : shiftTime(u.departure.date, u.departure.time, -cfg.departureLeadHours));
    const at = (date, time) => (date ? { date, time: time || '' } : null);
    legs.forEach((l, i) => {
        const prev = legs[i - 1], next = legs[i + 1];
        l.in = l.own ? at(l.own.checkin_date, l.own.checkin_time) : i === 0 ? A || null : prev?.own ? at(prev.own.checkout_date, cfg.transferCheckinTime) : null;
        l.out = l.own ? at(l.own.checkout_date, l.own.checkout_time) : i === legs.length - 1 ? D || null : next?.own ? at(next.own.checkin_date, cfg.transferCheckoutTime) : null;
        l.building = l.own ? norm(l.own.building) : '';
    });

    // the desk's own stops: after = -1 puts one above the first stay, after = i below stay i
    const extras = (Array.isArray(slip.trip_extra) ? slip.trip_extra : []).filter(x => norm(x.place));
    const stops = [];
    const addExtras = (after) => extras.filter(x => (Number.isInteger(x.after) ? x.after : legs.length - 1) === after)
        .forEach(x => stops.push({ extra: true, label: norm(x.place), in: at(x.in_date, x.in_time), out: at(x.out_date, x.out_time), note: norm(x.note), building: '' }));
    addExtras(-1);
    legs.forEach((l, i) => { stops.push(l); addExtras(i); });

    const n = (v) => Math.max(0, parseInt(v, 10) || 0);
    const pax = { gents: n(slip.gents), ladies: n(slip.ladies), children: n(slip.children), infants: n(slip.infants), total: n(slip.total) };
    if (!pax.total) pax.total = pax.gents + pax.ladies + pax.children + pax.infants;
    // the rooms as the slip shows them: room number and the pax assigned to it (the capacity where none is assigned), gents and ladies apart
    const roomList = (k) => (slip.rooms?.[k] || []).filter(x => norm(x.room_no)).map(x => ({
        room: norm(x.room_no), n: n(x.assigned !== '' && x.assigned != null ? x.assigned : x.capacity), excl: !!x.exclusive,
    }));
    return {
        site, rooms: { gents: roomList('gents'), ladies: roomList('ladies') }, route: routeName(cities), cities: routeCities(cities), legs, stops, pax,
        name: norm(slip.tour_name), leader: norm(slip.group_leader), sh: norm(baseSh(slip.sh_no) || slip.sh_no),
        arrival: u?.arrival || null, departure: u?.departure || null, depFrom: legs.at(-1)?.label || '',
        hasMakkah: cities.includes('MAKKAH'),
    };
}

/* --------------------------------- the letter --------------------------------- */

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
/** "Tue, 27 Oct 2026 · 4:45 PM" — the date and the time as one value */
export function when(x) {
    if (!x?.date) return '';
    const [y, m, d] = x.date.split('-').map(Number);
    const day = `${DAYS[new Date(Date.UTC(y, m - 1, d)).getUTCDay()]}, ${d} ${MONTHS[m - 1]} ${y}`;
    const t = String(x.time || '').match(/^(\d{1,2}):(\d{2})/);
    if (!t) return day;
    const h = Number(t[1]);
    return `${day} · ${h % 12 || 12}:${t[2]} ${h < 12 ? 'AM' : 'PM'}`;
}

export const ITINERARY_CSS = `
.itin { font-family: "Segoe UI", Arial, Helvetica, sans-serif; color: #2b2217; width: 210mm; height: 297mm; padding: 11mm 15mm 9mm; background: #fff; overflow: hidden; }
.itin .itin-in { display: flex; flex-direction: column; zoom: var(--z, 1); width: calc(180mm / var(--z, 1)); height: calc(277mm / var(--z, 1)); }
.itin * { box-sizing: border-box; }
.itin .brand { text-align: center; padding-bottom: 3mm; border-bottom: 2px solid #d4af37; }
.itin .brand b { display: block; font-size: 19pt; letter-spacing: .14em; color: #7a5a10; font-weight: 800; }
.itin .brand span { font-size: 10pt; letter-spacing: .2em; text-transform: uppercase; color: #8a7a5c; }
.itin .route { margin: 4mm 0 3mm; display: flex; align-items: baseline; justify-content: space-between; gap: 6mm; flex-wrap: wrap; }
.itin .route h1 { margin: 0; font-size: 18pt; color: #2b2217; }
.itin .route p { margin: 0; font-size: 12pt; color: #7a5a10; font-weight: 700; }
.itin .who { background: #fbf4e0; border-radius: 3mm; padding: 3mm 4.5mm; display: grid; grid-template-columns: 1fr auto; gap: 1mm 6mm; }
.itin .who .name { font-size: 13.5pt; font-weight: 800; }
.itin .who .sub { font-size: 10.5pt; color: #3d3226; }
.itin .who .sub b { color: #2b2217; font-size: 11.5pt; }
.itin .who .sh { text-align: right; font-size: 10pt; color: #3d3226; }
.itin .who .sh b { display: block; font-size: 18pt; color: #7a5a10; }
.itin h2 { font-size: 8.5pt; letter-spacing: .16em; text-transform: uppercase; color: #8a7a5c; margin: 4mm 0 2mm; font-weight: 700; }
.itin .tl { display: grid; gap: 2.5mm; }
.itin .st { border: 1px solid #e6d6a8; border-left: 1.6mm solid #d4af37; border-radius: 3mm; background: #fffdf7; padding: 2.5mm 4.5mm; break-inside: avoid; }
.itin .st.fly { border-left-color: #9a7414; background: #fff; }
.itin .st.add { border-left-color: #b9a77a; border-style: dashed; border-left-style: solid; }
.itin .st .k { font-size: 9.5pt; color: #8a7a5c; letter-spacing: .04em; }
.itin .st .t { font-size: 12.5pt; font-weight: 800; color: #2b2217; }
.itin .st .t small { font-size: 10pt; font-weight: 600; color: #7a5a10; margin-left: 2mm; }
.itin .row { display: flex; gap: 7mm; flex-wrap: wrap; margin-top: 1mm; }
.itin .row div { min-width: 0; }
.itin .row span { display: block; font-size: 8.5pt; color: #8a7a5c; text-transform: uppercase; letter-spacing: .08em; }
.itin .row b { font-size: 11pt; font-weight: 800; color: #1f1a12; }
.itin .note { font-size: 10pt; color: #3d3226; margin-top: 1mm; }
.itin .pax { display: grid; grid-template-columns: repeat(5, 1fr); background: #fbf4e0; border-radius: 3mm; overflow: hidden; }
.itin .pax div { padding: 2.2mm 2mm; text-align: center; }
.itin .pax div + div { border-left: 1px solid #f0e2b6; }
.itin .pax span { display: block; font-size: 8.5pt; color: #8a7a5c; text-transform: uppercase; letter-spacing: .08em; }
.itin .pax b { font-size: 14pt; color: #2b2217; }
.itin .pax div.tot b { color: #7a5a10; }
.itin .rooms { display: grid; grid-template-columns: 1fr 1fr; gap: 4mm; }
.itin .rooms.one { grid-template-columns: 1fr; }
.itin .rg { background: #fffdf7; border: 1px solid #ecdfb8; border-radius: 3mm; padding: 2.4mm 3.5mm; }
.itin .rg h3 { margin: 0 0 2mm; font-size: 8.5pt; letter-spacing: .1em; text-transform: uppercase; color: #8a7a5c; font-weight: 700; }
.itin .rg h3 b { color: #7a5a10; margin-left: 1.5mm; }
.itin .rc { display: flex; flex-wrap: wrap; gap: 1.8mm; }
.itin .rm { display: inline-flex; align-items: baseline; gap: 1.5mm; background: #fbf4e0; border-radius: 2mm; padding: .9mm 2.2mm; }
.itin .rm b { font-size: 11pt; color: #1f1a12; font-weight: 800; }
.itin .rm span { font-size: 8.5pt; color: #7a6a4a; }
.itin .rm i { font-style: normal; font-size: 7.5pt; color: #7a5a10; font-weight: 700; letter-spacing: .06em; }
.itin .foot { margin-top: auto; padding-top: 3mm; border-top: 1px solid #ecdfb8; font-size: 9pt; color: #5c503a; line-height: 1.5; text-align: center; }
.itin .foot b { color: #2b2217; }
`;

// "Rooms": a soft card per side with a chip per room — the room number and how many pax are in it
function roomsBlock(rooms) {
    const side = (title, list) => list.length ? `<div class="rg"><h3>${title}<b>${list.length} room${list.length === 1 ? '' : 's'}</b></h3><div class="rc">${list.map(x => `<div class="rm"><b>${esc(x.room)}</b>${x.excl ? '<i>EXCL</i>' : ''}${x.n ? `<span>${x.n} pax</span>` : ''}</div>`).join('')}</div></div>` : '';
    const g = side('Gents', rooms?.gents || []), l = side('Ladies', rooms?.ladies || []);
    return g || l ? `<h2>Rooms</h2><div class="rooms${g && l ? '' : ' one'}">${g}${l}</div>` : '';
}

/** One A4 letter (a `.itin` block; put ITINERARY_CSS on the page). */
export function itineraryHTML(trip) {
    const p = trip.pax;
    const fly = (title, leg, label, extra = '') => leg ? `<div class="st fly"><div class="k">${esc(title)}</div>
        <div class="row">${leg.flight ? `<div><span>${esc(label)}</span><b>${esc(leg.flight.replace(/\s*-\s*$/, ''))}</b></div>` : ''}<div><span>Date &amp; time</span><b>${esc(when(leg))}</b></div>${extra}</div></div>` : '';
    const stop = (s) => `<div class="st${s.extra ? ' add' : ''}"><div class="t">${esc(s.label)}${s.extra ? '' : '<small>stay</small>'}</div>
        <div class="row">${s.in ? `<div><span>Check-in</span><b>${esc(when(s.in))}</b></div>` : ''}${s.out ? `<div><span>Check-out</span><b>${esc(when(s.out))}</b></div>` : ''}${s.building ? `<div><span>Building</span><b>${esc(s.building)}</b></div>` : ''}</div>
        ${s.note ? `<div class="note">${esc(s.note)}</div>` : ''}</div>`;
    return `<section class="itin"><div class="itin-in">
  <div class="brand"><b>${trip.site === 'makkah' ? 'HOTEL MOHAMMEDI MAKAN' : 'FAIZ E HASHEMI'}</b><span>Check-in letter &amp; schedule</span></div>
  <div class="route"><h1>${esc(trip.route)}</h1><p>${esc(trip.cities)}</p></div>
  <div class="who"><div class="name">${esc(trip.name || '—')}</div><div class="sh">SH Ref<b>${esc(trip.sh || '—')}</b></div>
    <div class="sub">${trip.leader ? `Group leader <b>${esc(trip.leader)}</b>` : ''}</div></div>
  <h2>Schedule</h2>
  <div class="tl">
    ${fly('Arrival', trip.arrival, 'Flight')}
    ${trip.stops.map(stop).join('')}
    ${fly('Departure', trip.departure, 'Flight', `${trip.depFrom ? `<div><span>Leaving</span><b>${esc(trip.depFrom)}</b></div>` : ''}${trip.departure?.port ? `<div><span>Airport</span><b>${esc(trip.departure.port)}</b></div>` : ''}`)}
  </div>
  <h2>Pax</h2>
  <div class="pax"><div><span>Gents</span><b>${p.gents}</b></div><div><span>Ladies</span><b>${p.ladies}</b></div><div><span>Children</span><b>${p.children}</b></div><div><span>Infants</span><b>${p.infants}</b></div><div class="tot"><span>Total</span><b>${p.total}</b></div></div>
  ${roomsBlock(trip.rooms)}
  <div class="foot">${trip.hasMakkah ? 'Makkah Atraaf Ziyarat and Sabaq time will be informed later.<br>' : ''}<b>Please complete your checkout / Lawazim formalities at least 24 hours before your checkout date &amp; time.</b><br>Lawazim to be paid in Saudi Arabian Riyals only (cash or credit card).</div>
</div></section>`;
}

/**
 * A letter is one fixed A4 page: shrink its content (the page's rooms, stops and footer included) until nothing runs past the bottom edge.
 * Self-contained (no outside names), so the print windows can carry its source: `(${fitItineraries.toString()})(document)`.
 */
export function fitItineraries(root) {
    for (const it of root.querySelectorAll('.itin')) {
        const inn = it.querySelector('.itin-in');
        if (!inn) continue;
        let z = 1;
        inn.style.setProperty('--z', z);
        while (z > 0.45 && inn.scrollHeight > inn.clientHeight + 1) { z = Math.round((z - 0.03) * 100) / 100; inn.style.setProperty('--z', z); }
    }
}
