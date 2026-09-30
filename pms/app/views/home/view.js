// Home: a friendly start page — welcome, today's numbers (both cities), today's thaals (Mawaid rules),
// Gregorian + Misri Hijri date (tap it for the in-house calendar).
// "Currently in …" opens the list of groups staying there now (inhouse.js).
// Fakkul Ehraam counts (Makkah arrivals; times from Setup → Fakkul Ehraam windows): Morning = check-ins from 20:00
// yesterday to 07:00 today, Night = 07:00 to 20:00 today (Madina groups included), Night · from Madina = those whose
// SH starts with S. Tiles open the groups (groups.js).

import { currentDesk, mirrorAll, canOpen } from '../../core/cloud.js';
import { mealThalsFor, mealGuestsFor } from '../../core/meals.js';
import { toHijri, formatHijri } from '../../core/hijri.js';
import { openCalendar } from './calendar.js';
import { openInHouse } from './inhouse.js';
import { openGroupList } from './groups.js';
import { loadSettings, DEFAULTS } from '../../core/settings.js';
import { renderOccupancy } from './occupancy.js';
import { renderFlights } from './flights.js';

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

    /* ------------------------------ today's numbers ------------------------------ */
    const setStat = (id, big, small) => { $(id).querySelector('b').textContent = big; $(id).querySelector('small').textContent = small; };
    async function numbers() {
        const here = await ctx.db.all(); // this site, freshly synced
        const all = (await ctx.guard(mirrorAll())).filter(r => !r.deleted);
        const t = new Date();
        const from = new Date(`${ymd(t)}T03:00`), to = new Date(from.getTime() + 864e5); // the Check-ins page's "today"
        const inWin = (d) => d && d >= from && d < to;
        const ins = here.filter(r => inWin(parseDT(r.checkin_date, r.checkin_time)));
        const outs = here.filter(r => inWin(parseDT(r.checkout_date, r.checkout_time)));
        const groups = (n) => `${n} group${n === 1 ? '' : 's'}`;
        setStat('stIn', ins.reduce((s, r) => s + guests(r), 0), `${groups(ins.length)} · ${ctx.site.label}`);
        setStat('stOut', outs.reduce((s, r) => s + guests(r), 0), `${groups(outs.length)} · ${ctx.site.label}`);
        const inHouse = (site) => {
            const list = all.filter(r => r.site === site).filter(r => { const ci = parseDT(r.checkin_date, r.checkin_time), co = parseDT(r.checkout_date, r.checkout_time); return ci && co && ci <= t && t < co; });
            return [list.reduce((s, r) => s + guests(r), 0), list.length];
        };
        const [mk, mkG] = inHouse('makkah');
        setStat('stMakkah', mk, `guests right now · ${groups(mkG)}`);
        $('hmTodaySub').textContent = `Check-ins and check-outs from 03:00 today to 03:00 tomorrow · ${ctx.site.label}`;

        // Fakkul Ehraam: Makkah arrivals in the Setup windows
        const at = (h, dayOffset = 0) => { const d = new Date(`${ymd(t)}T${h}`); d.setDate(d.getDate() + dayOffset); return d; };
        const makkah = all.filter(r => r.site === 'makkah');
        const arrivals = (from, to, only = () => true) => ({ from, to, items: makkah.filter(only)
            .filter(r => { const ci = parseDT(r.checkin_date, r.checkin_time); return ci && ci >= from && ci < to; })
            .map(r => ({ r, pax: guests(r) })) });
        const fromMadina = (r) => /^S/i.test(String(r.sh_no ?? '').trim());
        const { morning_from: mf, split: sp, night_to: nt } = feWin;
        fe = { morning: arrivals(at(mf, -1), at(sp)), night: arrivals(at(sp), at(nt)), madina: arrivals(at(sp), at(nt), fromMadina) };
        for (const [id, key, when] of [['feMorning', 'morning', `${mf} yesterday – ${sp}`], ['feNight', 'night', `${sp} – ${nt}, with Madina`],
            ['feMadina', 'madina', `${sp} – ${nt}, SH starting with S`]]) {
            const w = fe[key];
            setStat(id, w.items.reduce((s, x) => s + x.pax, 0), `${groups(w.items.length)} · ${when}`);
        }

        mealsWho = mealGuestsFor(here, ymd(t));
        const meals = mealThalsFor(here, ymd(t));
        if (meals) {
            setStat('mlB', meals.breakfast, `${meals.pax.breakfast} guests`);
            setStat('mlL', meals.lunch, `${meals.pax.lunch} guests`);
            setStat('mlD', meals.dinner, `${meals.pax.dinner} guests`);
        }
        $('hmMealsTitle').textContent = `Thaals today · ${ctx.site.label}`;
        await renderOccupancy(ctx, $('hmOcc'), here);
    }

    // the in-house calendar, from the Hijri date
    const cal = (date) => openCalendar({ host: ctx.root, date }).catch(e => console.warn('calendar', e));
    $('hmHijri').addEventListener('click', () => cal(new Date()));
    // Jeddah airport board (does not hold up the rest of the page)
    const flightsTimer = renderFlights(ctx, $('hmFlights')).catch(e => console.warn('flights', e));

    await Promise.all([
        numbers().catch(e => console.warn('home numbers', e)),
    ]);

    // keep the numbers current while the page stays open
    let n = 0;
    const tick = setInterval(() => {
        if (++n % 2 === 0) numbers().catch(() => { }); // other desks' check-ins, every 2 minutes
    }, 60e3);
    return () => { clearInterval(tick); flightsTimer.then(t => clearInterval(t)); };
}
