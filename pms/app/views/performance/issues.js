// Performance → "Issue reports": what the desks sent with "Facing an issue?" (core/issue-report.js → POST /api/issues) — their words, a picture of their screen, and what
// their browser knew (window size, device, recent errors and failed calls, the text on the page, anything wider than the window). Opening a report marks it Seen.

import { request } from '../../core/cloud.js';

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const when = (iso) => iso ? new Date(iso).toLocaleString(undefined, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—';
const SITE = { makkah: 'Makkah', medina: 'Medina' };
const list = (title, items, mono = true) => items?.length ? `<h4 style="margin:10px 0 4px">${esc(title)}</h4><ul style="margin:0;padding-left:18px;${mono ? 'font:12px/1.5 ui-monospace,Consolas,monospace;' : ''}">${items.map(x => `<li>${esc(x)}</li>`).join('')}</ul>` : '';

function detail(i) {
    const d = i.diag || {}, v = d.viewport || {}, c = d.ctx || {}, s = d.settings || {};
    return `<div class="dn-body">
      <p style="white-space:pre-wrap;margin:0 0 8px"><b>${esc(i.text)}</b></p>
      ${i.shot ? `<a href="${i.shot}" target="_blank" rel="noopener" title="Open the picture full size"><img alt="Screenshot from the desk" src="${i.shot}" style="max-width:100%;max-height:420px;border:1px solid #e3d2b1;border-radius:10px;display:block"></a>`
        : `<p class="pf-none">No picture${d.shot_error ? ` (${esc(d.shot_error)})` : ' sent'}.</p>`}
      <div class="dn-facts" style="margin-top:8px">
        <span><b>Page</b> ${esc(i.page)} · ${esc(i.url)}${d.react ? ' · React page' : ''}</span>
        <span><b>Window</b> ${esc(v.w)}×${esc(v.h)} px, ratio ${esc(v.dpr)}, scrolled ${esc(v.scrollX)}/${esc(v.scrollY)}, page is ${esc(v.pageW)}×${esc(v.pageH)}${v.pageW > v.w + 2 ? ' <span class="dn-flag">wider than the window</span>' : ''} · ${esc(v.orientation)}</span>
        <span><b>Device</b> ${esc(c.device)} · ${esc(c.os)} · ${esc(c.browser)} ${esc(c.browser_ver)} · ${esc(c.app)}${d.standalone ? ' (installed app)' : ''} · screen ${esc(c.screen)} · ${esc(c.net_type || '')} ${d.online === false ? '· offline' : ''}</span>
        <span><b>Build</b> ${esc(c.build)} · page opened in ${d.page_ms != null ? esc(d.page_ms) + ' ms' : '—'} · looks: ${esc(s.theme)}, text ${esc(s.textScale)}%, ${esc(s.density)}${s.phoneCards === false ? ', cards off' : ''}</span>
        <span><b>Who</b> ${esc(i.desk)} (${esc(i.role)}) · ${esc(SITE[i.site] || i.site || '')} · ${esc(i.colo || '')} ${esc(i.country || '')}</span>
      </div>
      ${list('Wider than the window', d.wider_than_window)}${list('Errors in this browser', d.errors)}${list('Failed calls', d.failed_calls)}${list('Pages visited just before', d.recent_pages)}${list('Dialogs open', d.open_dialogs, false)}
      ${d.dom ? `<details style="margin-top:8px"><summary>Text on the page</summary><pre style="white-space:pre-wrap;font:12px/1.4 ui-monospace,Consolas,monospace;max-height:260px;overflow:auto">${esc(d.dom)}</pre></details>` : ''}
      <p style="margin-top:8px"><button type="button" class="dn-copy" data-copy-issue="${esc(i.id)}">Copy the full report (JSON, without the picture)</button></p>
    </div>`;
}

/** Adds the section above "Slip saves refused"; returns show(list) to call after each load. */
export function issuesSection(root) {
    const sec = document.createElement('section');
    sec.className = 'pf-card'; sec.id = 'pfIssues';
    sec.innerHTML = `<div class="pf-card-head"><h2>Issue reports</h2><span class="pf-note">sent from the "Facing an issue?" button — with a picture of the desk's screen and the details needed to debug it</span>
        <span class="pf-fb-filters"><select id="isStatus" aria-label="Status"><option value="">Any status</option><option value="new">New</option><option value="seen">Seen</option><option value="handled">Handled</option></select>
        <select id="isPage" aria-label="Page"><option value="">All pages</option></select></span></div><div id="pfIssueList"></div>`;
    root.querySelector('#pfDenySec').before(sec);
    const $ = (id) => sec.querySelector('#' + id);
    let LIST = [];
    const cache = new Map();

    function render() {
        const st = $('isStatus').value, pg = $('isPage').value;
        const rows = LIST.filter(i => (!st || i.status === st) && (!pg || i.page === pg));
        $('pfIssueList').innerHTML = rows.length ? `<div class="dn-list">${rows.map(i => `<details class="dn" data-id="${esc(i.id)}">
            <summary><span class="dn-when">${esc(when(i.at))}</span> <b>${esc(i.desk)}</b> <small>${esc(SITE[i.site] || i.site || '')}</small> · ${esc(i.page || '—')} · <small>${esc(i.device || '')} ${esc(i.viewport || '')}</small>
              ${i.has_shot ? '📷 ' : ''}<span class="dn-kind ${i.status === 'new' ? 'blocked' : ''}">${esc(i.status)}</span> — ${esc(String(i.text).slice(0, 110))}${i.text.length > 110 ? '…' : ''}</summary>
            <div class="is-body"><p class="pf-none">Loading…</p></div></details>`).join('')}</div>` : `<p class="pf-none">${LIST.length ? 'None match.' : 'No issue reports in this period.'}</p>`;
    }
    $('isStatus').addEventListener('change', render); $('isPage').addEventListener('change', render);
    $('pfIssueList').addEventListener('toggle', async (e) => {
        const det = e.target; if (!det.open || !det.classList?.contains('dn')) return;
        const id = Number(det.dataset.id), body = det.querySelector('.is-body');
        try {
            let i = cache.get(id);
            if (!i) { i = (await request('GET', `/api/issues/${id}`)).issue; cache.set(id, i); }
            const cur = LIST.find(x => x.id === id);
            body.innerHTML = `${detail(i)}<label style="display:inline-flex;gap:6px;align-items:center;margin-top:6px">Status <select data-status="${id}"><option value="new">New</option><option value="seen">Seen</option><option value="handled">Handled</option></select></label>`;
            const sel = body.querySelector('select[data-status]');
            if (cur?.status === 'new') { await request('PATCH', `/api/issues/${id}`, { status: 'seen' }); cur.status = 'seen'; det.querySelector('.dn-kind').textContent = 'seen'; det.querySelector('.dn-kind').classList.remove('blocked'); }
            sel.value = cur?.status || i.status;
        } catch (err) { body.innerHTML = `<p class="pf-none">${esc(err.message || 'Could not load.')}</p>`; }
    }, true);
    $('pfIssueList').addEventListener('change', async (e) => {
        const sel = e.target.closest('select[data-status]'); if (!sel) return;
        const id = Number(sel.dataset.status);
        try { await request('PATCH', `/api/issues/${id}`, { status: sel.value }); const cur = LIST.find(x => x.id === id); if (cur) cur.status = sel.value; sel.closest('details').querySelector('.dn-kind').textContent = sel.value; }
        catch (err) { alert(err.message); }
    });
    $('pfIssueList').addEventListener('click', async (e) => {
        const b = e.target.closest('[data-copy-issue]'); if (!b) return;
        const i = cache.get(Number(b.dataset.copyIssue)); if (!i) return;
        const { shot, ...rest } = i;
        try { await navigator.clipboard.writeText(JSON.stringify(rest, null, 2)); b.textContent = 'Copied ✓'; } catch { b.textContent = 'Could not copy'; }
    });
    return (items) => {
        LIST = items; cache.clear();
        const keep = $('isPage').value;
        $('isPage').innerHTML = '<option value="">All pages</option>' + [...new Set(items.map(i => i.page).filter(Boolean))].sort().map(p => `<option${p === keep ? ' selected' : ''}>${esc(p)}</option>`).join('');
        render();
    };
}
