// Building occupancy (the tiles from the old Home page): one battery per building showing the share of its
// beds in use today, and a "totals by date" chart (guests by check-in date, all buildings or one).
// Capacity: the bed total from Rooms & Buildings; a building not set up there can be given a number here
// (kept in this browser, as before).

import { loadBuildings, buildingsOfSite, totalBeds } from '../../core/rooms.js';
import { canOpen } from '../../core/cloud.js';

const CAP_KEY = 'pms_building_capacity_v1';
const SVG = 'http://www.w3.org/2000/svg';
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const num = (x) => { const n = Number(x); return Number.isFinite(n) ? n : 0; };
const pad = (n) => String(n).padStart(2, '0');
const ymd = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; // local date (the old page used UTC)
const loadCaps = () => { try { return JSON.parse(localStorage.getItem(CAP_KEY) || '{}'); } catch { return {}; } };
const saveCaps = (m) => { try { localStorage.setItem(CAP_KEY, JSON.stringify(m || {})); } catch { } };

/** Draw the panel into `root` (the #hmOcc section). Call again to refresh. */
export async function renderOccupancy(ctx, root, slips, day = ymd(new Date())) {
    const $ = (sel) => root.querySelector(sel);
    const builder = buildingsOfSite(await ctx.guard(loadBuildings({ force: true })), ctx.siteId).filter(b => b.rooms.length);
    const beds = Object.fromEntries(builder.map(b => [b.name, totalBeds(b)]));
    const buildings = [...new Set([...builder.map(b => b.name), ...slips.map(s => String(s.building || '').trim())])].sort((a, b) => a.localeCompare(b));

    // guests per building staying on the day (check-in date ≤ day ≤ check-out date); today unless the Home page looks ahead
    const today = day;
    const used = {};
    for (const s of slips) {
        if (!s.checkin_date || !s.checkout_date || s.checkin_date > today || s.checkout_date < today) continue;
        const b = String(s.building || '').trim();
        used[b] = (used[b] || 0) + num(s.total);
    }
    // guests by check-in date and building (the chart)
    const byDate = {};
    for (const s of slips) {
        const d = String(s.checkin_date || '').trim();
        if (!d) continue;
        const b = String(s.building || '').trim();
        (byDate[d] ||= {})[b] = (byDate[d][b] || 0) + num(s.total);
    }
    const dates = Object.keys(byDate).sort();
    let filter = root.dataset.filter || '_ALL';

    /* ---------------- batteries ---------------- */
    const caps = loadCaps();
    $('.battery-grid').innerHTML = (buildings.length ? buildings : ['']).map(b => {
        const fromBuilder = beds[b];
        const cap = fromBuilder ?? caps[b] ?? 100;
        const u = used[b] ?? 0;
        const pct = cap > 0 ? Math.min(100, Math.round(u * 100 / cap)) : 0;
        const cls = pct >= 85 ? '' : pct >= 60 ? 'warn' : 'bad';
        return `<div class="battery-card">
            <div class="b-head">
              <div><div class="b-name">${esc(b || '(Unassigned)')}</div><div class="b-cap">Capacity: <b>${cap}</b> • Used: <b>${u}</b></div></div>
              ${fromBuilder != null
                ? (canOpen('builder') ? `<a class="cap-link" href="${ctx.href('builder')}" title="Bed total from Rooms &amp; Buildings">Edit rooms</a>` : '')
                : `<div class="cap-edit"><input type="number" min="0" value="${cap}" aria-label="Capacity of ${esc(b || 'unassigned')}"><button type="button" data-b="${esc(b)}">Save</button></div>`}
            </div>
            <div class="battery ${cls}"><div class="fill" style="width:${pct}%"></div><div class="meter">${pct}%</div></div>
            <div class="b-stats"><div>Today: <b>${u}</b></div><div>Free: <b>${Math.max(0, cap - u)}</b></div></div>
          </div>`;
    }).join('');
    $('.battery-grid').onclick = (e) => {
        const btn = e.target.closest('.cap-edit button');
        if (!btn) return;
        const all = loadCaps();
        all[btn.dataset.b] = num(btn.previousElementSibling.value);
        saveCaps(all);
        renderOccupancy(ctx, root, slips);
    };

    /* ---------------- chart ---------------- */
    function chips() {
        $('.occ-chips').innerHTML = ['_ALL', ...buildings].map(b =>
            `<button type="button" class="chip" data-b="${esc(b)}" aria-pressed="${filter === b}">${b === '_ALL' ? 'All' : esc(b || '(Unassigned)')}</button>`).join('');
    }
    $('.occ-chips').onclick = (e) => {
        const c = e.target.closest('.chip');
        if (!c) return;
        filter = root.dataset.filter = c.dataset.b;
        chips(); draw();
    };

    function draw() {
        const svg = $('svg.chart');
        const w = 800, h = 220, padL = 46, padR = 10, padT = 14, padB = 26;
        svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
        svg.innerHTML = '';
        $('.occ-sub').textContent = filter === '_ALL' ? 'All buildings' : (filter || '(Unassigned)');
        const series = dates.map(d => ({ d, y: filter === '_ALL' ? Object.values(byDate[d]).reduce((a, v) => a + v, 0) : (byDate[d][filter] || 0) }));
        const maxY = Math.max(10, ...series.map(s => s.y));
        const xStep = (w - padL - padR) / Math.max(1, series.length);
        const yScale = (h - padT - padB) / maxY;
        const el = (tag, attrs, text) => { const n = document.createElementNS(SVG, tag); for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v); if (text != null) n.textContent = text; svg.appendChild(n); return n; };
        for (let k = 0; k <= 5; k++) { const y = h - padB - k * (h - padT - padB) / 5; el('line', { class: 'gridline', x1: padL, x2: w - padR, y1: y, y2: y }); }
        el('path', { class: 'axis', d: `M ${padL} ${padT} V ${h - padB}` });
        el('path', { class: 'axis', d: `M ${padL} ${h - padB} H ${w - padR}` });
        series.forEach((s, i) => {
            const barW = Math.max(6, xStep * 0.7);
            const x = padL + i * xStep + (xStep - barW) / 2;
            el('rect', { class: 'bar', x, y: h - padB - s.y * yScale, width: barW, height: Math.max(0, s.y * yScale), role: 'img', 'aria-label': `${s.d}: ${s.y}` })
                .appendChild(Object.assign(document.createElementNS(SVG, 'title'), { textContent: `${s.d}: ${s.y} guests` }));
            if (series.length <= 20 || i % Math.ceil(series.length / 20) === 0) el('text', { x: x + barW / 2, y: h - 6, 'text-anchor': 'middle', 'font-size': 10 }, s.d.slice(5));
        });
        for (let k = 0; k <= 5; k++) { const val = Math.round(maxY * k / 5); el('text', { x: padL - 6, y: h - padB - val * yScale + 3, 'text-anchor': 'end', 'font-size': 10 }, val); }
        if (!series.length) el('text', { x: w / 2, y: h / 2, 'text-anchor': 'middle', 'font-size': 13 }, 'No slips yet');
    }

    chips(); draw();
}
