// "Count in Makkah / Medina (day wise)": guests in each city day by day, one bar per day (or per N days).
// The count of a day is the guests in house at 12:00 (core/stay.js, so delayed rooms count until they leave);
// a bar of several days shows the highest day in it. Labels are Hijri dates ("1 Jumadal Ula").
// One toolbar drives both charts: range, interval, a highlighted day (red) and a full-screen view.
// The choices are kept in this browser.

import { SITES } from '../../config.js';
import { paxAt, slipStart, slipEnd } from '../../core/stay.js';
import { toHijri } from '../../core/hijri.js';

const SVG = 'http://www.w3.org/2000/svg';
const KEY = 'pms_home_daycount_v1';
const SHORT_MONTHS = ['Moharram', 'Safar', 'Rabi al-Awwal', 'Rabi al-Aakhar', 'Jumadal Ula', 'Jumadal Ukhra',
    'Rajab', 'Shabaan', 'Ramadaan', 'Shawwal', 'Zilqadah', 'Zilhaj'];
const INTERVALS = [1, 2, 3, 5, 7, 10, 15, 30];

const pad = (n) => String(n).padStart(2, '0');
const ymd = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const dateOf = (s) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
const addDays = (s, n) => { const d = dateOf(s); d.setDate(d.getDate() + n); return ymd(d); };
const hijriLabel = (s) => { const h = toHijri(dateOf(s)); return `${h.day} ${SHORT_MONTHS[h.month]}`; };
const longDate = (s) => dateOf(s).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });

function defaults() {
    const today = ymd(new Date());
    return { from: addDays(today, -7), to: addDays(today, 22), step: 1, mark: today };
}
function loadState() {
    try { return { ...defaults(), ...JSON.parse(localStorage.getItem(KEY) || '{}') }; } catch { return defaults(); }
}
function saveState(st) {
    try { localStorage.setItem(KEY, JSON.stringify({ from: st.from, to: st.to, step: st.step, mark: st.mark })); } catch { }
}

const state = loadState();
let slipsAll = [];

/** Bars for one city: [{ from, to, count, marked }] */
function bars(siteId) {
    const lo = dateOf(state.from).getTime(), hi = dateOf(state.to).getTime() + 864e5;
    const slips = slipsAll.filter(s => s.site === siteId && (slipStart(s) || Infinity) < hi && (slipEnd(s) || 0) > lo);
    const days = [];
    for (let d = state.from, n = 0; d <= state.to && n < 800; d = addDays(d, 1), n++) {
        const t = dateOf(d).getTime() + 12 * 3600e3;
        days.push({ d, count: slips.reduce((sum, s) => sum + paxAt(s, t).total, 0) });
    }
    const out = [];
    for (let i = 0; i < days.length; i += state.step) {
        const part = days.slice(i, i + state.step);
        const from = part[0].d, to = part[part.length - 1].d;
        out.push({ from, to, count: Math.max(...part.map(p => p.count)), marked: !!state.mark && state.mark >= from && state.mark <= to });
    }
    return out;
}

function draw(svg, siteId, tall) {
    const list = bars(siteId);
    const slot = list.length > 45 ? 22 : 30;
    const padL = 48, padR = 12, padT = 26, padB = 112;
    const w = Math.max(svg.parentElement.clientWidth || 720, padL + padR + list.length * slot);
    const h = tall ? Math.max(380, Math.round((window.innerHeight - 200) / 2)) : 340;
    svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
    svg.style.width = `${w}px`; // exact size; the box scrolls sideways when the bars need more room
    svg.style.height = `${h}px`;
    svg.innerHTML = '';
    const el = (tag, attrs, text) => { const n = document.createElementNS(SVG, tag); for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v); if (text != null) n.textContent = text; svg.appendChild(n); return n; };

    const max = Math.max(10, ...list.map(b => b.count));
    // round the axis to a tidy step (…, 250, 500, 1000, …)
    const raw = max / 6, mag = 10 ** Math.floor(Math.log10(raw));
    const tick = [1, 2, 2.5, 5, 10].map(m => m * mag).find(s => s >= raw);
    const top = Math.ceil(max * 1.08 / tick) * tick;
    const y = (v) => h - padB - v * (h - padT - padB) / top;
    for (let v = 0; v <= top; v += tick) {
        el('line', { class: 'dc-grid', x1: padL, x2: w - padR, y1: y(v), y2: y(v) });
        el('text', { class: 'dc-axis', x: padL - 8, y: y(v) + 4, 'text-anchor': 'end' }, v);
    }
    el('line', { class: 'dc-base', x1: padL, x2: w - padR, y1: y(0), y2: y(0) });

    const barW = Math.max(8, slot * 0.62);
    const step = (w - padL - padR) / Math.max(1, list.length);
    const vertical = step < 28; // counts turn sideways when the bars are narrow
    list.forEach((b, i) => {
        const cx = padL + step * i + step / 2;
        const cls = b.marked ? ' marked' : '';
        const rect = el('rect', { class: 'dc-bar' + cls, x: cx - barW / 2, y: y(b.count), width: barW, height: Math.max(0, y(0) - y(b.count)) });
        const when = b.from === b.to ? `${hijriLabel(b.from)} · ${longDate(b.from)}` : `${hijriLabel(b.from)} – ${hijriLabel(b.to)} · ${longDate(b.from)} – ${longDate(b.to)} (highest day)`;
        rect.appendChild(Object.assign(document.createElementNS(SVG, 'title'), { textContent: `${when}: ${b.count} guests` }));
        if (vertical) el('text', { class: 'dc-count' + cls, x: cx + 3, y: y(b.count) - 4, transform: `rotate(-90 ${cx + 3} ${y(b.count) - 4})` }, b.count);
        else el('text', { class: 'dc-count' + cls, x: cx, y: y(b.count) - 5, 'text-anchor': 'middle' }, b.count);
        // Hijri date, written bottom to top under the bar
        el('text', { class: 'dc-date' + cls, x: cx + 4, y: y(0) + 8, 'text-anchor': 'end', transform: `rotate(-90 ${cx + 4} ${y(0) + 8})` }, hijriLabel(b.from));
    });
    if (!list.length) el('text', { class: 'dc-axis', x: w / 2, y: h / 2, 'text-anchor': 'middle' }, 'Pick a date range');
}

/** Draw both charts into `root` (the #hmDayCount section). `slips`: every site's slips. Call again to refresh. */
export function renderDayCounts(root, slips) {
    slipsAll = slips;
    const $ = (sel) => root.querySelector(sel);
    const redraw = () => {
        const tall = root.classList.contains('full');
        for (const fig of root.querySelectorAll('.dc-fig')) draw(fig.querySelector('svg'), fig.dataset.site, tall);
        const sub = state.step === 1 ? 'DAY WISE' : `EVERY ${state.step} DAYS · HIGHEST DAY`;
        root.querySelectorAll('.dc-mode').forEach(n => { n.textContent = `(${sub})`; });
    };

    if (!root.dataset.bound) {
        root.dataset.bound = '1';
        root.querySelectorAll('.dc-fig').forEach(fig => { fig.querySelector('.dc-city').textContent = SITES[fig.dataset.site]?.label || fig.dataset.site; });
        $('.dc-step').innerHTML = INTERVALS.map(n => `<option value="${n}">${n === 1 ? '1 day' : `${n} days`}</option>`).join('');
        const sync = () => {
            $('.dc-from').value = state.from;
            $('.dc-to').value = state.to;
            $('.dc-step').value = String(state.step);
            $('.dc-mark').value = state.mark || '';
            $('.dc-markh').textContent = state.mark ? hijriLabel(state.mark) : '';
        };
        const change = () => {
            const from = $('.dc-from').value, to = $('.dc-to').value;
            if (from) state.from = from;
            if (to) state.to = to;
            if (state.to < state.from) [state.from, state.to] = [state.to, state.from];
            state.step = Number($('.dc-step').value) || 1;
            state.mark = $('.dc-mark').value || '';
            saveState(state); sync(); redraw();
        };
        for (const c of ['.dc-from', '.dc-to', '.dc-step', '.dc-mark']) $(c).addEventListener('change', change);
        $('.dc-clear').addEventListener('click', () => { $('.dc-mark').value = ''; change(); });
        $('.dc-today').addEventListener('click', () => { Object.assign(state, defaults(), { step: state.step }); saveState(state); sync(); redraw(); });
        const setFull = (on) => {
            root.classList.toggle('full', on);
            document.body.classList.toggle('dc-noscroll', on);
            $('.dc-expand').textContent = on ? '⤡ Minimize' : '⤢ Full view';
            $('.dc-expand').setAttribute('aria-pressed', String(on));
            redraw();
        };
        $('.dc-expand').addEventListener('click', () => setFull(!root.classList.contains('full')));
        document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && root.classList.contains('full')) setFull(false); });
        let resizeTimer = 0;
        window.addEventListener('resize', () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(redraw, 150); });
        sync();
    }
    redraw();
}
