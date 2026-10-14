// Building occupancy (the tiles from the old Home page): one battery per building showing the share of its
// beds in use today. (The day-by-day guest charts are in daycount.js.)
// Capacity: the bed total from Rooms & Buildings; a building not set up there can be given a number here
// (kept in this browser, as before).

import { isDelayed, paxAt } from '../../core/stay.js';
import { loadBuildings, buildingsOfSite, totalBeds } from '../../core/rooms.js';
import { canOpen } from '../../core/cloud.js';

const CAP_KEY = 'pms_building_capacity_v1';
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
        // a delayed group: the guests still here at noon of the day (core/stay.js)
        used[b] = (used[b] || 0) + (isDelayed(s) ? paxAt(s, new Date(`${today}T12:00`).getTime()).total : num(s.total));
    }

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
}
