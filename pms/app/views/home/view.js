// Home: a friendly start page — welcome, today's numbers (both cities), today's thaals (Mawaid rules),
// Gregorian + Misri Hijri date (tap it for the in-house calendar).
// "Currently in …" opens the list of groups staying there now (inhouse.js).
// Fakkul Ehraam counts (Makkah arrivals; times from Setup → Fakkul Ehraam windows): Morning = check-ins from 20:00
// yesterday to 07:00 today, Night = 07:00 to 20:00 today (Madina groups included), Night · from Madina = those whose
// SH starts with S. Tiles open the groups (groups.js).
// Transport today: buses to Atraaf, Madina and Jeddah Airport from today's Transport list (cloud); tiles open the trips.
// Look ahead (above Fakkul Ehraam): pick a date and the day cards (check-ins / check-outs / in Makkah, Fakkul Ehraam,
// thaals, occupancy) show that day with the same rules; or a period, for a day-by-day summary (row → that day).

import { currentDesk, mirrorAll, canOpen } from '../../core/cloud.js';
import { mealThalsFor, mealGuestsFor } from '../../core/meals.js';
import { toHijri, formatHijri } from '../../core/hijri.js';
import { openCalendar } from './calendar.js';
import { openInHouse } from './inhouse.js';
import { openGroupList } from './groups.js';
import { loadSettings, DEFAULTS } from '../../core/settings.js';
import { renderOccupancy } from './occupancy.js';
import { openTransportList } from './transport.js';
import { loadDay as loadTransport, signage as transportSignage, today as transportToday, time12 } from '../../core/transport.js';

const PRAISE = [
    'The guests of Allah are in wonderful hands today.',
    'Your care turns a room number into a home away from home.',
    'Calm, careful and kind — the desk simply runs better when you are on it.',
    'You make the busiest day at the desk look effortless.',
    'Every pilgrim who rests well tonight owes a little of it to you.',
    'Thank you for the patience you pour into every check-in.',
    'Organised, generous with your time and always on top of it — shukran.',
    'May Allah accept and reward the khidmat you do for His guests.',
    'Your attention to detail keeps hundreds of families comfortable.',
    'The smile at the desk starts with you — thank you for it.',
];

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const pad = (n) => String(n).padStart(2, '0');
const ymd = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const parseDT = (d, t) => { if (!d) return null; const v = new Date(`${d}T${t && t.length ? t : '00:00'}`); return isNaN(v) ? null : v; };
const num = (v) => { const x = Number(v); return Number.isFinite(x) ? x : 0; };
const guests = (r) => num(r.total) || (num(r.gents) + num(r.ladies) + num(r.children) + num(r.infants));
// the same number every time on one day for one person, different tomorrow
const dayPick = (list, salt) => { let h = 0; for (const c of `${ymd(new Date())}|${salt}`) h = (h * 31 + c.charCodeAt(0)) >>> 0; return list[h % list.length]; };

export default async function mount(ctx) {
    const $ = (id) => ctx.root.querySelector('#' + id);
    const desk = currentDesk();

    /* ------------------------------ welcome + dates ------------------------------ */
    const hour = new Date().getHours();
    const part = hour < 5 ? 'Good night' : hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
    $('hmName').textContent = `${part}, ${desk?.name || 'friend'}`;
    $('hmPraise').textContent = dayPick(PRAISE, desk?.name || '');
    const now = new Date();
    $('hmHijri').textContent = formatHijri(toHijri(now));
    $('hmGreg').textContent = now.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

    // cross-links only where this login may go (Setup → Page access)
    function applyAccess() {
        for (const id of ['stIn', 'stOut']) {
            if (canOpen('checkins', desk)) $(id).href = ctx.href('checkins'); else $(id).removeAttribute('href');
        }
        $('hmMealsLink').hidden = !canOpen('mawaid', desk);
        $('hmTrLink').hidden = !canOpen('transport', desk);
        if (canOpen('transport', desk)) $('hmTrLink').href = ctx.href('transport');
        if (canOpen('mawaid', desk)) $('hmMealsLink').href = ctx.href('mawaid');
    }
    applyAccess();
    window.addEventListener('pms:desk-changed', () => { location.reload(); });

    // "Currently in Makkah": the groups behind the number, to spot slips that need fixing
    for (const [id, site, label] of [['stMakkah', 'makkah', 'Makkah']]) {
        $(id).addEventListener('click', async () => {
            const slips = await ctx.guard(mirrorAll());
            // open a slip only where this login may (its own site; admins both) and only if it may open the Slip page
            const mayOpen = canOpen('slip', desk) && (desk?.role === 'admin' || desk?.site === site);
            openInHouse({ site, label, slips, canOpen: mayOpen, host: ctx.root,
                slipHref: (sh) => `#/${site}/slip?sh_no=${encodeURIComponent(sh)}` });
        });
    }

    // who may open a slip of this site from a list (its own site; admins both) — only with the Slip page
    const mayOpenSlip = (site) => canOpen('slip', desk) && (desk?.role === 'admin' || desk?.site === site);
    const list = (site, title, sub, items, paxLabel) => openGroupList({ title, sub, items, paxLabel, host: ctx.root,
        canOpen: mayOpenSlip(site), slipHref: (sh) => `#/${site}/slip?sh_no=${encodeURIComponent(sh)}` });
    let fe = null, mealsWho = null; // filled by numbers()
    let feWin = DEFAULTS.fe_windows;
    try { feWin = { ...feWin, ...((await ctx.guard(loadSettings())).settings.fe_windows || {}) }; } catch { }
    const hm = (d) => d.toLocaleString(undefined, { weekday: 'short', hour: '2-digit', minute: '2-digit' });
    for (const [id, key, title] of [['feMorning', 'morning', 'Fakkul Ehraam · Morning'], ['feNight', 'night', 'Fakkul Ehraam · Night'],
        ['feMadina', 'madina', 'Fakkul Ehraam · Night, from Madina']]) {
        $(id).addEventListener('click', () => {
            if (!fe) return;
            const w = fe[key];
            list('makkah', title, `arrivals ${hm(w.from)} → ${hm(w.to)}`, w.items);
        });
    }
    for (const [id, key, title] of [['mlB', 'B', 'Breakfast'], ['mlL', 'L', 'Lunch'], ['mlD', 'D', 'Dinner']]) {
        $(id).addEventListener('click', () => {
            if (!mealsWho) return;
            list(ctx.siteId, `${title} thaals · ${ctx.site.label}`, 'adults counted, as on the Mawaid page', mealsWho[key], 'guests');
        });
    }

    /* ------------------------------ transport today ------------------------------ */
    const TR_TILES = [['trAtraaf', 'atraaf'], ['trMadina', 'madina'], ['trAirport', 'airport']];
    let trGroups = null;
    for (const [id, dest] of TR_TILES) {
        $(id).addEventListener('click', () => {
            const g = trGroups?.find(x => x.dest.id === dest);
            if (!g) return;
            openTransportList({ title: `Transport today · ${g.dest.title}`, sub: ctx.site.label, group: g, host: ctx.root,
                dayHref: canOpen('transport', desk) ? ctx.href('transport') : '' });
        });
    }
    async function transport() {
        const doc = await ctx.guard(loadTransport(ctx.siteId, transportToday()));
        trGroups = transportSignage(doc.rows);
        for (const [id, dest] of TR_TILES) {
            const g = trGroups.find(x => x.dest.id === dest);
            const first = g.buses.length ? g.buses.reduce((a, b) => a.at < b.at ? a : b).at : null;
            setStat(id, g.pax, g.buses.length
                ? `${[['bus', 'bus', 'buses'], ['car', 'car', 'cars']].map(([v, one, many]) => { const n = g.buses.filter(b => b.vehicle === v).length; return n ? `${n} ${n === 1 ? one : many}` : ''; }).filter(Boolean).join(' · ')} · ${g.groups} group${g.groups === 1 ? '' : 's'} · from ${time12(first)}`
                : (doc.version ? 'no buses today' : 'no transport list for today'));
        }
    }

    /* ------------------------------ today's numbers ------------------------------ */
    const setStat = (id, big, small) => { $(id).querySelector('b').textContent = big; $(id).querySelector('small').textContent = small; };
    // One day's numbers with the Home rules. `day` is YYYY-MM-DD; "in Makkah" is counted now (today) or at 12:00.
    function dayNumbers(day, here, all) {
        const isToday = day === ymd(new Date());
        const t = isToday ? new Date() : new Date(`${day}T12:00`);
        const from = new Date(`${day}T03:00`), to = new Date(from.getTime() + 864e5); // the Check-ins page's "today"
        const inWin = (d) => d && d >= from && d < to;
        const ins = here.filter(r => inWin(parseDT(r.checkin_date, r.checkin_time)));
        const outs = here.filter(r => inWin(parseDT(r.checkout_date, r.checkout_time)));
        const mk = all.filter(r => r.site === 'makkah').filter(r => { const ci = parseDT(r.checkin_date, r.checkin_time), co = parseDT(r.checkout_date, r.checkout_time); return ci && co && ci <= t && t < co; });
        // Fakkul Ehraam: Makkah arrivals in the Setup windows
        const at = (h, dayOffset = 0) => { const d = new Date(`${day}T${h}`); d.setDate(d.getDate() + dayOffset); return d; };
        const makkah = all.filter(r => r.site === 'makkah');
        const arrivals = (from, to, only = () => true) => ({ from, to, items: makkah.filter(only)
            .filter(r => { const ci = parseDT(r.checkin_date, r.checkin_time); return ci && ci >= from && ci < to; })
            .map(r => ({ r, pax: guests(r) })) });
        const fromMadina = (r) => /^S/i.test(String(r.sh_no ?? '').trim());
        const { morning_from: mf, split: sp, night_to: nt } = feWin;
        const fe = { morning: arrivals(at(mf, -1), at(sp)), night: arrivals(at(sp), at(nt)), madina: arrivals(at(sp), at(nt), fromMadina) };
        const pax = (rows) => rows.reduce((s, r) => s + guests(r), 0);
        return { day, isToday, t, ins, outs, inPax: pax(ins), outPax: pax(outs), mk, mkPax: pax(mk), fe,
            fePax: Object.fromEntries(Object.entries(fe).map(([k, w]) => [k, w.items.reduce((s, x) => s + x.pax, 0)])),
            meals: mealThalsFor(here, day), mealsWho: mealGuestsFor(here, day) };
    }

    let viewDay = ymd(new Date()); // the day the cards show (Look ahead)
    async function numbers() {
        const here = await ctx.db.all(); // this site, freshly synced
        const all = (await ctx.guard(mirrorAll())).filter(r => !r.deleted);
        const N = dayNumbers(viewDay, here, all);
        const groups = (n) => `${n} group${n === 1 ? '' : 's'}`;
        const label = N.isToday ? 'today' : new Date(`${viewDay}T12:00`).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' });
        setStat('stIn', N.inPax, `${groups(N.ins.length)} · ${ctx.site.label}`);
        setStat('stOut', N.outPax, `${groups(N.outs.length)} · ${ctx.site.label}`);
        $('stIn').querySelector('.hm-lbl').textContent = `Check-ins ${label}`;
        $('stOut').querySelector('.hm-lbl').textContent = `Check-outs ${label}`;
        $('stMakkah').querySelector('.hm-lbl').textContent = N.isToday ? 'Currently in Makkah' : `In Makkah ${label}`;
        setStat('stMakkah', N.mkPax, `${N.isToday ? 'guests right now' : 'guests at 12:00'} · ${groups(N.mk.length)}`);
        $('hmTodayTitle').textContent = N.isToday ? 'Today at a glance' : `${label} at a glance`;
        $('hmTodaySub').textContent = `Check-ins and check-outs from 03:00 ${N.isToday ? 'today' : label} to 03:00 the next day · ${ctx.site.label}`;

        fe = N.fe;
        const { morning_from: mf, split: sp, night_to: nt } = feWin;
        for (const [id, key, when] of [['feMorning', 'morning', `${mf} the day before – ${sp}`], ['feNight', 'night', `${sp} – ${nt}, with Madina`],
            ['feMadina', 'madina', `${sp} – ${nt}, SH starting with S`]]) {
            setStat(id, N.fePax[key], `${groups(fe[key].items.length)} · ${when}`);
        }
        $('hmFeTitle').textContent = `🕋 Fakkul Ehraam counts${N.isToday ? '' : ` · ${label}`}`;

        mealsWho = N.mealsWho;
        if (N.meals) {
            setStat('mlB', N.meals.breakfast, `${N.meals.pax.breakfast} guests`);
            setStat('mlL', N.meals.lunch, `${N.meals.pax.lunch} guests`);
            setStat('mlD', N.meals.dinner, `${N.meals.pax.dinner} guests`);
        }
        $('hmMealsTitle').textContent = `Thaals ${label} · ${ctx.site.label}`;
        await renderOccupancy(ctx, $('hmOcc'), here, viewDay);
        $('hmOcc').querySelector('.hm-head .hm-sub').textContent = `Share of each building's beds in use ${label}. Capacities come from Rooms & Buildings.`;
        ctx.root.querySelector('.hm').classList.toggle('travel', !N.isToday);
        $('ttNote').hidden = N.isToday;
        $('ttNote').textContent = N.isToday ? '' : `Showing ${new Date(`${viewDay}T12:00`).toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} — from the slips as they are now. Transport stays on today.`;
    }

    /* ------------------------------ look ahead ------------------------------ */
    const shift = (d, n) => { const x = new Date(`${d}T12:00`); x.setDate(x.getDate() + n); return ymd(x); };
    $('ttDate').value = viewDay;
    $('ttFrom').value = viewDay; $('ttTo').value = shift(viewDay, 6);
    $('ttForecast').hidden = !canOpen('forecast', desk);
    if (canOpen('forecast', desk)) $('ttForecast').href = ctx.href('forecast');
    const goDay = (d) => { if (!d) return; viewDay = d; $('ttDate').value = d; numbers().catch(e => console.warn('home numbers', e)); };
    $('ttDate').addEventListener('change', () => goDay($('ttDate').value));
    $('ttPrev').addEventListener('click', () => goDay(shift(viewDay, -1)));
    $('ttNext').addEventListener('click', () => goDay(shift(viewDay, 1)));
    $('ttToday').addEventListener('click', () => goDay(ymd(new Date())));
    $('ttSum').addEventListener('click', async () => {
        let a = $('ttFrom').value, b = $('ttTo').value;
        if (!a || !b) { alert('Choose both dates.'); return; }
        if (a > b) [a, b] = [b, a];
        const days = [];
        for (let d = a; d <= b && days.length < 92; d = shift(d, 1)) days.push(d);
        const here = await ctx.db.all();
        const all = (await ctx.guard(mirrorAll())).filter(r => !r.deleted);
        openSummary(days.map(d => dayNumbers(d, here, all)), days.length === 92 && days[91] < b);
    });

    function openSummary(rows, cut) {
        const sum = (f) => rows.reduce((s, r) => s + f(r), 0);
        const peak = Math.max(0, ...rows.map(r => r.mkPax));
        const g = (n) => `<span class="grp">${n} grp</span>`;
        const meal = (r, k) => r.meals ? r.meals[k] : '—';
        const dlg = document.createElement('dialog');
        dlg.className = 'ih';
        dlg.innerHTML = `
          <div class="ih-wrap">
            <header class="ih-head">
              <div><h2>Summary · ${esc(rows[0].day)} → ${esc(rows.at(-1).day)}</h2>
                <p>${rows.length} day${rows.length === 1 ? '' : 's'} · ${ctx.site.label} · ${sum(r => r.inPax)} arriving, ${sum(r => r.outPax)} leaving · Makkah busiest ${peak} guests${cut ? ' · first 92 days only' : ''}</p></div>
              <button type="button" class="ih-x" data-close aria-label="Close">✕</button>
            </header>
            <div class="ih-list">
              <table class="ih-tbl ts-tbl" data-no-cards>
                <thead><tr><th>Day</th><th>Check-ins</th><th>Check-outs</th><th>In Makkah<br><small>12:00 · now</small></th>
                  <th>FE Morning</th><th>FE Night</th><th>FE from Madina</th><th>Breakfast<br><small>thaals</small></th><th>Lunch<br><small>thaals</small></th><th>Dinner<br><small>thaals</small></th></tr></thead>
                <tbody>${rows.map(r => `<tr data-day="${r.day}" title="Show ${r.day} on the cards">
                  <td><b>${esc(new Date(`${r.day}T12:00`).toLocaleDateString(undefined, { day: '2-digit', month: 'short' }))}</b><span class="wk">${esc(new Date(`${r.day}T12:00`).toLocaleDateString(undefined, { weekday: 'long' }))}</span></td>
                  <td><b>${r.inPax}</b>${g(r.ins.length)}</td><td><b>${r.outPax}</b>${g(r.outs.length)}</td><td><b>${r.mkPax}</b>${g(r.mk.length)}</td>
                  <td><b>${r.fePax.morning}</b>${g(r.fe.morning.items.length)}</td><td><b>${r.fePax.night}</b>${g(r.fe.night.items.length)}</td><td><b>${r.fePax.madina}</b>${g(r.fe.madina.items.length)}</td>
                  <td>${meal(r, 'breakfast')}</td><td>${meal(r, 'lunch')}</td><td>${meal(r, 'dinner')}</td></tr>`).join('')}</tbody>
                <tfoot><tr><td>Total</td><td>${sum(r => r.inPax)}</td><td>${sum(r => r.outPax)}</td><td>peak ${peak}</td>
                  <td>${sum(r => r.fePax.morning)}</td><td>${sum(r => r.fePax.night)}</td><td>${sum(r => r.fePax.madina)}</td>
                  <td>${sum(r => r.meals?.breakfast || 0)}</td><td>${sum(r => r.meals?.lunch || 0)}</td><td>${sum(r => r.meals?.dinner || 0)}</td></tr></tfoot>
              </table>
            </div>
          </div>`;
        ctx.root.appendChild(dlg);
        dlg.addEventListener('click', (e) => {
            if (e.target.closest('[data-close]') || e.target === dlg) { dlg.close(); return; }
            const tr = e.target.closest('tr[data-day]');
            if (tr) { dlg.close(); goDay(tr.dataset.day); $('hmTt').scrollIntoView({ behavior: 'smooth', block: 'start' }); }
        });
        dlg.addEventListener('close', () => dlg.remove());
        dlg.showModal();
    }

    // the in-house calendar, from the Hijri date
    const cal = (date) => openCalendar({ host: ctx.root, date }).catch(e => console.warn('calendar', e));
    $('hmHijri').addEventListener('click', () => cal(new Date()));

    await Promise.all([
        numbers().catch(e => console.warn('home numbers', e)),
        transport().catch(e => console.warn('home transport', e)),
    ]);

    // keep the numbers current while the page stays open
    let n = 0;
    const tick = setInterval(() => {
        if (++n % 2 === 0) numbers().catch(() => { }); // other desks' check-ins, every 2 minutes
        transport().catch(() => { }); // a new transport import, every minute
    }, 60e3);
    return () => clearInterval(tick);
}
