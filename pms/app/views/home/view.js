// Home: a friendly start page — welcome, today's numbers (both cities), today's thaals (Mawaid rules),
// weather and namaz timings for this site's city, Gregorian + Misri Hijri date, and a tip.
// Weather: Open-Meteo; namaz: Aladhan (Umm al-Qura method). Both are cached briefly in this browser.

import { currentDesk, mirrorAll } from '../../core/cloud.js';
import { mealThalsFor } from '../../core/meals.js';
import { toHijri, formatHijri, loadMiqaats, miqaatsOn, upcomingMiqaats } from '../../core/hijri.js';
import { openCalendar } from './calendar.js';

const CITY = {
    makkah: { name: 'Makkah', lat: 21.4225, lon: 39.8262 },
    medina: { name: 'Madina', lat: 24.4672, lon: 39.6112 },
};
const TZ = 'Asia/Riyadh';

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

const TIPS = [
    'On the Slip page, <b>Pick rooms…</b> shows every room free for the whole stay. Click rooms to give them beds — it stops by itself when the group is fully housed.',
    'Once a slip is loaded, use <b>Edit</b> to change it. Save is locked so nobody makes a duplicate by accident.',
    'A group\'s second check-in at the same city has an <b>S</b> in front of its SH, e.g. <b>S44030</b>. Type either on the Slip page.',
    'On <b>Check-ins</b>, <b>GL copy</b> turns each slip into an A5 picture you can copy straight into the group leader\'s chat.',
    '<b>Print slips</b> on the Check-ins page prints every slip in the table at once, two copies per A5 page.',
    'Put the pages you use most under the menu bar: <b>Settings → Quick links</b>.',
    'Keyboard shortcuts: <b>Alt+1</b> Slip, <b>Alt+5</b> Check-ins, <b>Alt+0</b> Mawaid. Change them in <b>Settings → Shortcuts</b>.',
    'Working late? <b>Settings → Appearance → Night</b> is easier on the eyes. Your settings follow your login to any device.',
    'Text too small on this screen? <b>Settings → Appearance</b> makes the whole PMS bigger or smaller.',
    'On a phone, tap <b>☰</b> for the menu; tables turn into easy-to-read cards.',
    'Mawaid counts follow the meal times and thal size at the top of the Mawaid page — adjust them there for special days.',
    'The KG list is shared by every desk of your site, so a saved assignment shows up everywhere within half a minute.',
    'Forgot to note a room change? The <b>Timeline</b> page shows who is in each room day by day.',
];

const WX = { // WMO weather codes
    0: ['Clear sky', '☀️'], 1: ['Mainly clear', '🌤️'], 2: ['Partly cloudy', '⛅'], 3: ['Overcast', '☁️'],
    45: ['Fog', '🌫️'], 48: ['Fog', '🌫️'], 51: ['Light drizzle', '🌦️'], 53: ['Drizzle', '🌦️'], 55: ['Heavy drizzle', '🌧️'],
    61: ['Light rain', '🌦️'], 63: ['Rain', '🌧️'], 65: ['Heavy rain', '🌧️'], 80: ['Rain showers', '🌦️'], 81: ['Rain showers', '🌧️'],
    82: ['Violent showers', '⛈️'], 95: ['Thunderstorm', '⛈️'], 96: ['Thunderstorm, hail', '⛈️'], 99: ['Thunderstorm, hail', '⛈️'],
};

const NAMAZ = [ // Aladhan key → label
    ['Fajr', 'Fajr'], ['Sunrise', 'Sunrise'], ['Dhuhr', 'Zawaal / Zohr'], ['Asr', 'Asr'],
    ['Maghrib', 'Maghrib'], ['Isha', 'Isha'], ['Midnight', 'Nisful Layl'],
];

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const pad = (n) => String(n).padStart(2, '0');
const ymd = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const parseDT = (d, t) => { if (!d) return null; const v = new Date(`${d}T${t && t.length ? t : '00:00'}`); return isNaN(v) ? null : v; };
const num = (v) => { const x = Number(v); return Number.isFinite(x) ? x : 0; };
const guests = (r) => num(r.total) || (num(r.gents) + num(r.ladies) + num(r.children) + num(r.infants));
// the same number every time on one day for one person, different tomorrow
const dayPick = (list, salt) => { let h = 0; for (const c of `${ymd(new Date())}|${salt}`) h = (h * 31 + c.charCodeAt(0)) >>> 0; return list[h % list.length]; };

function cached(key, maxAgeMs) {
    try { const v = JSON.parse(localStorage.getItem(key) || 'null'); return v && Date.now() - v.at < maxAgeMs ? v.data : null; } catch { return null; }
}
function remember(key, data) { try { localStorage.setItem(key, JSON.stringify({ at: Date.now(), data })); } catch { } }

// "HH:MM" now in Makkah/Madina time, whatever the computer's time zone
const cityNow = () => new Date().toLocaleTimeString('en-GB', { timeZone: TZ, hour: '2-digit', minute: '2-digit', hour12: false });
const toMin = (hhmm) => { const [h, m] = String(hhmm).slice(0, 5).split(':').map(Number); return h * 60 + m; };

export default async function mount(ctx) {
    const $ = (id) => ctx.root.querySelector('#' + id);
    const desk = currentDesk();
    const city = CITY[ctx.siteId] || CITY.makkah;

    /* ------------------------------ welcome + dates ------------------------------ */
    const hour = new Date().getHours();
    const part = hour < 5 ? 'Good night' : hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
    $('hmName').textContent = `${part}, ${desk?.name || 'friend'}`;
    $('hmPraise').textContent = dayPick(PRAISE, desk?.name || '');
    const now = new Date();
    $('hmHijri').textContent = formatHijri(toHijri(now));
    $('hmGreg').textContent = now.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

    /* ---------------------------------- tips ---------------------------------- */
    let tip = TIPS.indexOf(dayPick(TIPS, 'tip'));
    const showTip = () => { $('hmTip').innerHTML = TIPS[tip]; $('hmTipNo').textContent = `${tip + 1} of ${TIPS.length}`; };
    $('hmTipNext').addEventListener('click', () => { tip = (tip + 1) % TIPS.length; showTip(); });
    showTip();

    $('stIn').href = ctx.href('checkins');
    $('stOut').href = ctx.href('checkins');
    $('hmMealsLink').href = ctx.href('mawaid');

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
        const [mk, mkG] = inHouse('makkah'), [md, mdG] = inHouse('medina');
        setStat('stMakkah', mk, `guests right now · ${groups(mkG)}`);
        setStat('stMadina', md, `guests right now · ${groups(mdG)}`);
        $('hmTodaySub').textContent = `Check-ins and check-outs from 03:00 today to 03:00 tomorrow · ${ctx.site.label}`;

        const meals = mealThalsFor(here, ymd(t));
        if (meals) {
            setStat('mlB', meals.breakfast, `${meals.pax.breakfast} guests`);
            setStat('mlL', meals.lunch, `${meals.pax.lunch} guests`);
            setStat('mlD', meals.dinner, `${meals.pax.dinner} guests`);
        }
        $('hmMealsTitle').textContent = `Thaals today · ${ctx.site.label}`;
    }

    /* ---------------------------------- weather ---------------------------------- */
    async function weather() {
        const key = `pms_wx_${ctx.siteId}`;
        let w = cached(key, 15 * 60e3);
        if (!w) {
            const url = `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}`
                + '&current=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m,is_day'
                + '&daily=temperature_2m_max,temperature_2m_min,uv_index_max&timezone=Asia%2FRiyadh&forecast_days=1';
            w = await ctx.guard(fetch(url).then(r => { if (!r.ok) throw new Error(r.status); return r.json(); }));
            remember(key, w);
        }
        const c = w.current, d = w.daily;
        const [label, icon] = WX[c.weather_code] || ['—', '🌡️'];
        const nightIcon = !c.is_day && c.weather_code <= 1 ? '🌙' : icon;
        const uv = d.uv_index_max?.[0];
        $('hmWxTitle').textContent = `Weather · ${city.name}`;
        $('hmWx').innerHTML = `
            <div class="wx-now"><span class="wx-ico" aria-hidden="true">${nightIcon}</span>
              <span class="wx-temp">${Math.round(c.temperature_2m)}°</span>
              <span class="wx-desc">${esc(label)}<small>Feels like ${Math.round(c.apparent_temperature)}°</small></span></div>
            <div class="wx-row"><span>High <b>${Math.round(d.temperature_2m_max[0])}°</b></span><span>Low <b>${Math.round(d.temperature_2m_min[0])}°</b></span>
              <span>Humidity <b>${c.relative_humidity_2m}%</b></span><span>Wind <b>${Math.round(c.wind_speed_10m)} km/h</b></span></div>
            ${uv >= 8 ? `<p class="wx-warn">☀️ Very strong sun today (UV ${Math.round(uv)}) — remind guests about water and shade.</p>`
                : c.temperature_2m >= 40 ? '<p class="wx-warn">🥵 Very hot — remind guests to drink water and rest in the afternoon.</p>' : ''}`;
    }

    /* ---------------------------------- namaz ---------------------------------- */
    let timings = null;
    async function namaz() {
        const day = new Date().toLocaleDateString('en-GB', { timeZone: TZ }).split('/').join('-'); // DD-MM-YYYY in the city
        const key = `pms_namaz_${ctx.siteId}_${day}`;
        timings = cached(key, 20 * 3600e3);
        if (!timings) {
            const r = await ctx.guard(fetch(`https://api.aladhan.com/v1/timings/${day}?latitude=${city.lat}&longitude=${city.lon}&method=4`).then(x => { if (!x.ok) throw new Error(x.status); return x.json(); }));
            timings = r.data.timings;
            remember(key, timings);
        }
        $('hmNzTitle').textContent = `Namaz timings · ${city.name}`;
        drawNamaz();
    }
    function drawNamaz() {
        if (!timings) return;
        const nowM = toMin(cityNow());
        // the next one still to come today (Nisful Layl is after midnight, so it counts as late tonight)
        const at = (k) => { const m = toMin(timings[k]); return k === 'Midnight' && m < 12 * 60 ? m + 24 * 60 : m; };
        const next = NAMAZ.find(([k]) => k !== 'Sunrise' && at(k) > nowM);
        const left = next ? at(next[0]) - nowM : 0;
        $('hmNz').innerHTML = `
            ${next ? `<p class="nz-next">Next: <b>${esc(next[1])}</b> at <b>${esc(timings[next[0]].slice(0, 5))}</b> · in ${left >= 60 ? `${Math.floor(left / 60)} h ` : ''}${left % 60} min</p>` : ''}
            <ul class="nz-list">${NAMAZ.map(([k, label]) => `<li class="${next && next[0] === k ? 'next' : ''} ${k === 'Sunrise' ? 'minor' : ''}"><span>${esc(label)}</span><b>${esc(String(timings[k]).slice(0, 5))}</b></li>`).join('')}</ul>
            <p class="hm-muted small">${esc(city.name)} time · Umm al-Qura method (as announced in the Haramain), from aladhan.com</p>`;
    }

    /* ---------------------------------- miqaats ---------------------------------- */
    async function miqaats() {
        const list = await ctx.guard(loadMiqaats());
        const today = miqaatsOn(list, toHijri(new Date()));
        const item = (m) => `<li class="${m.priority === 1 ? 'major' : ''}"><span aria-hidden="true">${m.phase === 'night' ? '🌙' : m.priority === 1 ? '✨' : '•'}</span>
            <span>${esc(m.title)}${m.phase === 'night' ? ' <small>(night)</small>' : ''}${m.description ? `<small>${esc(m.description)}</small>` : ''}</span></li>`;
        $('hmTodayMiqaat').innerHTML = today.length ? `✨ ${esc(today[0].title)}${today.length > 1 ? ` <small>+${today.length - 1} more</small>` : ''}` : '';
        const next = upcomingMiqaats(list, new Date(), 45, 3);
        const when = (d) => d.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' });
        $('hmMq').innerHTML = `
            <h3>Today</h3>
            ${today.length ? `<ul class="mq-list">${today.map(item).join('')}</ul>` : '<p class="hm-muted">No miqaat today.</p>'}
            ${next.length ? `<h3>Coming up</h3>${next.map(n => `<div class="mq-day" data-cal="${n.date.getTime()}" role="button" tabindex="0" title="Show in the calendar"><div class="mq-date"><b>${n.hijri.day} ${esc(n.hijri.monthName.split(' ')[0])}</b><small>${esc(when(n.date))}</small></div>
                <ul class="mq-list">${n.miqaats.map(item).join('')}</ul></div>`).join('')}` : ''}`;
    }

    // the in-house calendar: from the Hijri date, the Miqaats card, or an upcoming day
    const cal = (date) => openCalendar({ host: ctx.root, date }).catch(e => console.warn('calendar', e));
    $('hmHijri').addEventListener('click', () => cal(new Date()));
    $('hmOpenCal').addEventListener('click', () => cal(new Date()));
    const fromCard = (e) => {
        const d = e.target.closest('[data-cal]');
        if (!d || (e.type === 'keydown' && e.key !== 'Enter' && e.key !== ' ')) return;
        e.preventDefault();
        cal(new Date(Number(d.dataset.cal)));
    };
    $('hmMq').addEventListener('click', fromCard);
    $('hmMq').addEventListener('keydown', fromCard);

    const fail = (id, what) => (e) => { console.warn(what, e); $(id).innerHTML = `<p class="hm-muted">${what} is not available right now (no connection?).</p>`; };
    await Promise.all([
        numbers().catch(e => console.warn('home numbers', e)),
        weather().catch(fail('hmWx', 'The weather')),
        namaz().catch(fail('hmNz', 'Namaz timings')),
        miqaats().catch(fail('hmMq', 'The miqaat list')),
    ]);

    // keep the countdown and the numbers current while the page stays open
    let n = 0;
    const tick = setInterval(() => {
        drawNamaz();
        if (++n % 2 === 0) numbers().catch(() => { }); // other desks' check-ins, every 2 minutes
    }, 60e3);
    return () => clearInterval(tick);
}
