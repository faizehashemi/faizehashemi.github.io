// The trips behind a Home "Transport today" tile: bus, time, SH, group and leader, pax — in the same window
// style as the other Home lists. Grouped trips (adjusted into a bus) sit under their bus.
import { time12 } from '../../core/transport.js';

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/** @param {{ title: string, sub?: string, group: { buses, pax, groups }, dayHref?: string, host?: Element }} o */
export function openTransportList(o) {
    const g = o.group;
    const now = new Date(); now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    const nowAt = now.toISOString().slice(0, 16);
    const dlg = document.createElement('dialog');
    dlg.className = 'ih';
    dlg.innerHTML = `
      <div class="ih-wrap">
        <header class="ih-head">
          <div><h2>${esc(o.title)}</h2>
            <p>${g.buses.length} bus${g.buses.length === 1 ? '' : 'es'} · ${g.groups} group${g.groups === 1 ? '' : 's'} · ${g.pax} pax${o.sub ? ` · ${esc(o.sub)}` : ''}</p></div>
          <button type="button" class="ih-x" data-close aria-label="Close">✕</button>
        </header>
        <div class="ih-tools">
          <input type="search" id="trFind" placeholder="Find SH, group, leader, transporter…" aria-label="Find">
          ${o.dayHref ? `<a class="hm-more" href="${esc(o.dayHref)}" data-open>Open the day →</a>` : ''}
        </div>
        <div class="ih-list" id="trList"></div>
      </div>`;
    (o.host || document.body).appendChild(dlg);
    const $ = (id) => dlg.querySelector('#' + id);
    function render() {
        const q = $('trFind').value.trim().toLowerCase();
        const rows = g.buses.flatMap(b => b.rows.map((r, i) => ({ r, b, i })))
            .filter(({ r }) => !q || [r.ref, r.operator, r.leader, r.transporter, r.vch].some(v => String(v ?? '').toLowerCase().includes(q)));
        $('trList').innerHTML = rows.length ? `
          <table class="ih-tbl" data-no-cards>
            <thead><tr><th>Bus</th><th>Time</th><th>SH</th><th>Group / leader</th><th class="n">Pax</th><th>Transporter</th></tr></thead>
            <tbody>${rows.map(({ r, b, i }) => `<tr class="${i ? 'rider' : ''}${b.at < nowAt ? ' past' : ''}">
              <td class="bus">${i ? `↳ ${esc(b.bus ?? '')}` : esc(b.bus ?? '—')}</td>
              <td class="stay">${esc(time12(b.at))}</td>
              <td class="sh">${esc(r.ref)}</td>
              <td><b>${esc(r.operator || '—')}</b><small>${esc(r.leader || 'no leader')}</small></td>
              <td class="n"><b>${esc(r.pax)}</b><small>${[r.m && `M${r.m}`, r.f && `F${r.f}`, r.c && `C${r.c}`].filter(Boolean).join(' ')}</small></td>
              <td>${esc(r.transporter || (i ? 'with the bus above' : '—'))}${r.vch ? `<small>Vch ${esc(r.vch)}</small>` : ''}</td>
            </tr>`).join('')}</tbody>
          </table>` : `<p class="ih-empty">${g.buses.length ? 'Nothing matches.' : 'No trips today.'}</p>`;
    }
    dlg.addEventListener('click', (e) => {
        if (e.target.closest('[data-close]') || e.target === dlg) dlg.close();
        if (e.target.closest('a[data-open]')) dlg.close();
    });
    $('trFind').addEventListener('input', render);
    dlg.addEventListener('close', () => dlg.remove());
    render();
    dlg.showModal();
    return dlg;
}
