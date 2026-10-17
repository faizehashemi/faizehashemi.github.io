// Change log (Data): every deployed change, by feature or day by day. Data in data.js (from the GitHub history).

import { FEATURES, CHANGES, DEPLOYS } from './data.js';

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const dmy = (d) => new Date(`${d}T12:00`).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
const dayLong = (d) => new Date(`${d}T12:00`).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
const monthOf = (d) => new Date(`${d.slice(0, 7)}-15T12:00`).toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
const REPO = 'https://github.com/faizehashemi/faizehashemi.github.io/commit/';

export default async function mount(ctx) {
    const $ = (id) => ctx.root.querySelector('#' + id);
    let mode = 'feature';
    const commit = (c) => c.h ? ` <a class="cl-h" href="${REPO}${esc(c.h)}" target="_blank" rel="noopener">${esc(c.h)}</a>` : '';

    function render() {
        const q = $('clQ').value.trim().toLowerCase();
        const rows = CHANGES.filter(c => !q || c.m.toLowerCase().includes(q) || (FEATURES[c.f] || '').toLowerCase().includes(q));
        const days = [...new Set(CHANGES.map(c => c.d))];
        const cloud = CHANGES.filter(c => c.d >= '2026-09-27');
        $('clKpis').innerHTML = [
            ['Changes', CHANGES.length, `${cloud.length} since the cloud PMS (27 Sep 2026)`],
            ['Deploy days', days.length, `first ${dmy(days[0])}`],
            ['Features', new Set(CHANGES.map(c => c.f)).size, 'areas of the PMS'],
            ['Latest', dmy(days.at(-1)), `${CHANGES.filter(c => c.d === days.at(-1)).length} change(s) that day`],
        ].map(([l, v, s]) => `<div class="cl-kpi"><span>${l}</span><b>${esc(v)}</b><small>${esc(s)}</small></div>`).join('');

        if (!rows.length) { $('clBody').innerHTML = '<p class="cl-card cl-muted">Nothing matches.</p>'; return; }
        if (mode === 'feature') {
            const ids = [...new Set(rows.map(c => c.f))];
            // newest-touched feature first; inside each, newest change first
            const last = (id) => rows.filter(c => c.f === id).at(-1).d;
            ids.sort((a, b) => last(b).localeCompare(last(a)) || (FEATURES[a] || a).localeCompare(FEATURES[b] || b));
            $('clBody').innerHTML = `<div class="cl-feats">${ids.map(id => {
                const list = rows.filter(c => c.f === id).reverse();
                return `<details class="cl-card cl-feat" ${q || ids.length <= 3 ? 'open' : ''}>
                    <summary><b>${esc(FEATURES[id] || id)}</b><span class="cl-n">${list.length}</span><small>${dmy(list.at(-1).d)} – ${dmy(list[0].d)}</small></summary>
                    <ul>${list.map(c => `<li><time>${dmy(c.d)}</time><span>${esc(c.m)}${commit(c)}</span></li>`).join('')}</ul></details>`;
            }).join('')}</div>`;
        } else {
            const byDay = [...new Set(rows.map(c => c.d))].reverse();
            let month = '';
            $('clBody').innerHTML = `<div class="cl-card cl-time">${byDay.map(d => {
                const m = monthOf(d), head = m !== month ? `<h2 class="cl-month">${esc(m)}</h2>` : '';
                month = m;
                return `${head}<div class="cl-day"><h3>${dayLong(d)}</h3><ul>${rows.filter(c => c.d === d).map(c =>
                    `<li><span class="cl-tag">${esc(FEATURES[c.f] || c.f)}</span><span>${esc(c.m)}${commit(c)}</span></li>`).join('')}</ul></div>`;
            }).join('')}</div>`;
        }
    }

    $('clDeploys').innerHTML = DEPLOYS.map(x => `<tr><td class="nowrap">${new Date(x.at).toLocaleString(undefined, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
        <td>${x.w === 'site' ? 'Site (pages and screens)' : 'API (server and database)'}</td></tr>`).join('');
    ctx.root.querySelector('.cl-seg').addEventListener('click', (e) => {
        const b = e.target.closest('[data-mode]');
        if (!b) return;
        mode = b.dataset.mode;
        ctx.root.querySelectorAll('.cl-seg button').forEach(x => x.classList.toggle('on', x === b));
        render();
    });
    $('clQ').addEventListener('input', render);
    render();
}
