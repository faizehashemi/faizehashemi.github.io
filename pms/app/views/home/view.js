// Home: a friendly start page — welcome, today's numbers (both cities), today's thaals (Mawaid rules),
// Gregorian + Misri Hijri date (tap it for the in-house calendar).
// "Currently in …" opens the list of groups staying there now (inhouse.js).

import { currentDesk, mirrorAll, canOpen } from '../../core/cloud.js';
import { mealThalsFor } from '../../core/meals.js';
import { toHijri, formatHijri } from '../../core/hijri.js';
import { openCalendar } from './calendar.js';
import { openInHouse } from './inhouse.js';
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
