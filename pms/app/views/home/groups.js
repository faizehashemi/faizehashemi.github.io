// A list of groups behind a Home number (Fakkul Ehraam arrivals, thaals of a meal): SH, group and leader,
// building and rooms, arrival and guests — in the same window style as "Currently in Makkah".

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const num = (v) => { const x = Number(v); return Number.isFinite(x) ? x : 0; };
const parseDT = (d, t) => { if (!d) return null; const v = new Date(`${d}T${t && t.length ? t : '00:00'}`); return isNaN(v) ? null : v; };
const fmt = (dt) => dt ? dt.toLocaleString(undefined, { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—';
const natural = (a, b) => String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: 'base' });
const roomsOf = (r) => ['gents', 'ladies'].flatMap(side => (r.rooms?.[side] || []).map(x => String(x.room_no || '').trim()).filter(Boolean));

/**
 * @param {{ title: string, sub?: string, items: {r: object, pax: number}[], paxLabel?: string,
 *           canOpen: boolean, slipHref: (sh) => string, host?: Element }} o
 */
export function openGroupList(o) {
    const rows = o.items.map(x => ({ ...x, ci: parseDT(x.r.checkin_date, x.r.checkin_time), co: parseDT(x.r.checkout_date, x.r.checkout_time) }));
    const total = rows.reduce((s, x) => s + x.pax, 0);
    const dlg = document.createElement('dialog');
    dlg.className = 'ih';
    dlg.innerHTML = `
      <div class="ih-wrap">
        <header class="ih-head">
          <div><h2>${esc(o.title)}</h2>
            <p>${rows.length} group${rows.length === 1 ? '' : 's'} · ${total} ${esc(o.paxLabel || 'guests')}${o.sub ? ` · ${esc(o.sub)}` : ''}</p></div>
          <button type="button" class="ih-x" data-close aria-label="Close">✕</button>
        </header>
        <div class="ih-tools">
          <input type="search" id="glFind" placeholder="Find SH, group, leader, building, room…" aria-label="Find">
          <select id="glSort" aria-label="Sort">
            <option value="in">Arrival</option><option value="sh">SH</option><option value="building">Building</option><option value="pax">Most guests</option>
          </select>
        </div>
        <div class="ih-list" id="glList"></div>
      </div>`;
    (o.host || document.body).appendChild(dlg);
    const $ = (id) => dlg.querySelector('#' + id);
    const SORTS = {
        in: (a, b) => (a.ci - b.ci) || natural(a.r.sh_no, b.r.sh_no),
        sh: (a, b) => natural(a.r.sh_no, b.r.sh_no),
        building: (a, b) => natural(a.r.building, b.r.building) || natural(a.r.sh_no, b.r.sh_no),
        pax: (a, b) => b.pax - a.pax,
    };
    function render() {
        const q = $('glFind').value.trim().toLowerCase();
        const list = rows.filter(x => !q || [x.r.sh_no, x.r.tour_name, x.r.group_leader, x.r.building, ...roomsOf(x.r)]
            .some(v => String(v ?? '').toLowerCase().includes(q))).sort(SORTS[$('glSort').value]);
        $('glList').innerHTML = list.length ? `
          <table class="ih-tbl" data-no-cards>
            <thead><tr><th>SH</th><th>Group / leader</th><th>Building · rooms</th><th>Stay</th><th class="n">Guests</th></tr></thead>
            <tbody>${list.map(({ r, pax, ci, co }) => {
                const g = num(r.gents), l = num(r.ladies), c = num(r.children), i = num(r.infants);
                const rooms = roomsOf(r);
                return `<tr>
                  <td class="sh">${o.canOpen && r.sh_no ? `<a href="${esc(o.slipHref(r.sh_no))}" data-open title="Open this slip">${esc(r.sh_no)}</a>` : esc(r.sh_no || '—')}</td>
                  <td><b>${esc(r.tour_name || '—')}</b><small>${esc(r.group_leader || 'no leader')}</small></td>
                  <td>${esc(r.building || '—')}<small>${rooms.length ? esc(rooms.join(', ')) : 'no rooms'}</small></td>
                  <td class="stay">${esc(fmt(ci))}<small>→ ${esc(fmt(co))}</small></td>
                  <td class="n"><b>${pax}</b><small>G${g} L${l}${c ? ` C${c}` : ''}${i ? ` I${i}` : ''}</small></td>
                </tr>`;
            }).join('')}</tbody>
          </table>` : `<p class="ih-empty">${rows.length ? 'Nothing matches.' : 'No groups.'}</p>`;
    }
    dlg.addEventListener('click', (e) => {
        if (e.target.closest('[data-close]') || e.target === dlg) dlg.close();
        if (e.target.closest('a[data-open]')) dlg.close();
    });
    $('glFind').addEventListener('input', render);
    $('glSort').addEventListener('change', render);
    dlg.addEventListener('close', () => dlg.remove());
    render();
    dlg.showModal();
    return dlg;
}
