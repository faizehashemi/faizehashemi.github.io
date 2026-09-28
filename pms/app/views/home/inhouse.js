// "Currently in Makkah / Madina" details (a window over the Home page): every group staying there right
// now — SH, group, leader, building, dates, guests and beds — with checks that point at slips that look
// wrong, so the desk can open and fix them.

import { siteOfBuilding } from '../../config.js';
import { baseSh } from '../../core/ums.js';

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const num = (v) => { const x = Number(v); return Number.isFinite(x) ? x : 0; };
const parseDT = (d, t) => { if (!d) return null; const v = new Date(`${d}T${t && t.length ? t : '00:00'}`); return isNaN(v) ? null : v; };
const fmt = (dt) => dt ? dt.toLocaleString(undefined, { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—';
const natural = (a, b) => String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: 'base' });

const guestsOf = (r) => num(r.total) || (num(r.gents) + num(r.ladies) + num(r.children) + num(r.infants));
const bedsOf = (r) => ['gents', 'ladies'].reduce((n, side) => n + (r.rooms?.[side] || []).reduce((m, x) => m + (x.assigned !== '' && x.assigned != null ? num(x.assigned) : num(x.capacity)), 0), 0);
const roomsOf = (r) => ['gents', 'ladies'].flatMap(side => (r.rooms?.[side] || []).map(x => String(x.room_no || '').trim()).filter(Boolean));

/** Things that look wrong on an in-house slip (short labels; empty = fine). */
function issuesOf(r, site, dupes) {
    const out = [];
    const g = num(r.gents), l = num(r.ladies), adults = g + l;
    const beds = bedsOf(r), rooms = roomsOf(r);
    if (!String(r.building || '').trim()) out.push('No building');
    else if (siteOfBuilding(r.building) && siteOfBuilding(r.building) !== site) out.push(`Building ${r.building} is not in this city`);
    if (!rooms.length) out.push('No rooms assigned');
    else if (adults && beds < adults) out.push(`${adults - beds} adult${adults - beds === 1 ? '' : 's'} without a bed (${beds} beds for ${adults})`);
    else if (adults && beds > adults) out.push(`${beds - adults} bed${beds - adults === 1 ? '' : 's'} more than adults (${beds} for ${adults})`);
    if (!adults && !num(r.total)) out.push('No guest counts');
    const tot = num(r.total), parts = adults + num(r.children) + num(r.infants);
    if (tot && parts && tot !== parts) out.push(`Total ${tot} ≠ G+L+C+I ${parts}`);
    if (!String(r.sh_no ?? '').trim()) out.push('No SH');
    else if (dupes.has(baseSh(r.sh_no))) out.push('Same SH twice in-house');
    if (!String(r.group_leader || '').trim()) out.push('No group leader');
    const seen = new Set(), rep = new Set();
    for (const x of rooms) { const k = x.toUpperCase(); if (seen.has(k)) rep.add(x); seen.add(k); }
    if (rep.size) out.push(`Room listed twice: ${[...rep].join(', ')}`);
    return out;
}

/**
 * @param {{ site: string, label: string, slips: object[], canOpen: boolean, slipHref: (sh) => string, host?: Element }} o
 */
export function openInHouse(o) {
    const now = new Date();
    const stays = o.slips.filter(r => !r.deleted && r.site === o.site).filter(r => {
        const ci = parseDT(r.checkin_date, r.checkin_time), co = parseDT(r.checkout_date, r.checkout_time);
        return ci && co && ci <= now && now < co;
    });
    const count = new Map();
    for (const r of stays) { const k = baseSh(r.sh_no); if (k) count.set(k, (count.get(k) || 0) + 1); }
    const dupes = new Set([...count].filter(([, n]) => n > 1).map(([k]) => k));
    const rows = stays.map(r => ({ r, issues: issuesOf(r, o.site, dupes), ci: parseDT(r.checkin_date, r.checkin_time), co: parseDT(r.checkout_date, r.checkout_time) }));
    const withIssues = rows.filter(x => x.issues.length).length;
    const totalGuests = stays.reduce((s, r) => s + guestsOf(r), 0);

    const dlg = document.createElement('dialog');
    dlg.className = 'ih';
    dlg.innerHTML = `
      <div class="ih-wrap">
        <header class="ih-head">
          <div><h2>Currently in ${esc(o.label)}</h2>
            <p>${stays.length} group${stays.length === 1 ? '' : 's'} · ${totalGuests} guests right now${withIssues ? ` · <b class="ih-bad">${withIssues} to check</b>` : ' · nothing looks wrong'}</p></div>
          <button type="button" class="ih-x" data-close aria-label="Close">✕</button>
        </header>
        <div class="ih-tools">
          <input type="search" id="ihFind" placeholder="Find SH, group, leader, building, room…" aria-label="Find">
          <select id="ihSort" aria-label="Sort">
            <option value="issues">Problems first</option><option value="sh">SH</option><option value="building">Building</option>
            <option value="out">Check-out soonest</option><option value="in">Check-in latest</option><option value="guests">Most guests</option>
          </select>
          <label><input type="checkbox" id="ihOnly" ${withIssues ? '' : 'disabled'}> Only groups to check</label>
        </div>
        <div class="ih-list" id="ihList"></div>
      </div>`;
    (o.host || document.body).appendChild(dlg);
    const $ = (id) => dlg.querySelector('#' + id);

    const SORTS = {
        issues: (a, b) => b.issues.length - a.issues.length || natural(a.r.sh_no, b.r.sh_no),
        sh: (a, b) => natural(a.r.sh_no, b.r.sh_no),
        building: (a, b) => natural(a.r.building, b.r.building) || natural(a.r.sh_no, b.r.sh_no),
        out: (a, b) => a.co - b.co,
        in: (a, b) => b.ci - a.ci,
        guests: (a, b) => guestsOf(b.r) - guestsOf(a.r),
    };

    function render() {
        const q = $('ihFind').value.trim().toLowerCase();
        const only = $('ihOnly').checked;
        const list = rows.filter(x => !only || x.issues.length).filter(x => !q || [x.r.sh_no, x.r.tour_name, x.r.group_leader, x.r.building, ...roomsOf(x.r)]
            .some(v => String(v ?? '').toLowerCase().includes(q))).sort(SORTS[$('ihSort').value]);
        $('ihList').innerHTML = list.length ? `
          <table class="ih-tbl" data-no-cards>
            <thead><tr><th>SH</th><th>Group / leader</th><th>Building · rooms</th><th>Stay</th><th class="n">Guests</th><th class="n">Beds</th><th>Check</th></tr></thead>
            <tbody>${list.map(({ r, issues, ci, co }) => {
                const g = num(r.gents), l = num(r.ladies), c = num(r.children), i = num(r.infants);
                const rooms = roomsOf(r);
                return `<tr class="${issues.length ? 'bad' : ''}">
                  <td class="sh">${o.canOpen && r.sh_no ? `<a href="${esc(o.slipHref(r.sh_no))}" data-open title="Open this slip">${esc(r.sh_no)}</a>` : esc(r.sh_no || '—')}</td>
                  <td><b>${esc(r.tour_name || '—')}</b><small>${esc(r.group_leader || 'no leader')}</small></td>
                  <td>${esc(r.building || '—')}<small>${rooms.length ? esc(rooms.slice(0, 8).join(', ')) + (rooms.length > 8 ? ` +${rooms.length - 8}` : '') : 'no rooms'}</small></td>
                  <td class="stay">${esc(fmt(ci))}<small>→ ${esc(fmt(co))}</small></td>
                  <td class="n"><b>${guestsOf(r)}</b><small>G${g} L${l}${c ? ` C${c}` : ''}${i ? ` I${i}` : ''}</small></td>
                  <td class="n"><b>${bedsOf(r)}</b><small>${rooms.length} room${rooms.length === 1 ? '' : 's'}</small></td>
                  <td class="chk">${issues.length ? `<ul>${issues.map(t => `<li>${esc(t)}</li>`).join('')}</ul>` : '<span class="ok">✓</span>'}</td>
                </tr>`;
            }).join('')}</tbody>
          </table>` : `<p class="ih-empty">${rows.length ? 'Nothing matches.' : `Nobody is staying in ${esc(o.label)} right now.`}</p>`;
    }

    dlg.addEventListener('click', (e) => {
        if (e.target.closest('[data-close]') || e.target === dlg) dlg.close();
        if (e.target.closest('a[data-open]')) dlg.close(); // go to the slip
    });
    $('ihFind').addEventListener('input', render);
    $('ihSort').addEventListener('change', render);
    $('ihOnly').addEventListener('change', render);
    dlg.addEventListener('close', () => dlg.remove());
    render();
    dlg.showModal();
    return dlg;
}
