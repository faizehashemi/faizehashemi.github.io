// Performance & feedback (Data, admins): page timings from every desk's browser (core/telemetry.js → perf_events) and
// the in-page feedback (core/feedback.js → feedback). Server: GET /api/perf/summary, GET /api/feedback, PATCH /api/feedback/:id.

import { request, currentDesk, UserError } from '../../core/cloud.js';
import { VIEWS } from '../../config.js';

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const sec = (ms) => ms == null ? '—' : ms < 1000 ? `${ms} ms` : `${(ms / 1000).toFixed(ms < 10000 ? 2 : 1)} s`;
const pageName = (id) => VIEWS.find(v => v.id === id)?.label || id || '—';
const when = (iso) => iso ? new Date(iso).toLocaleString(undefined, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '';
const stars = (n) => '★'.repeat(n) + '☆'.repeat(5 - n);
// a colour for a page time: green under 1 s, amber under 3 s, red above
const tone = (ms) => ms == null ? '' : ms < 1000 ? 'ok' : ms < 3000 ? 'mid' : 'bad';

export default async function mount(ctx) {
    const $ = (id) => ctx.root.querySelector('#' + id);
    if (currentDesk()?.role !== 'admin') {
        $('pfMsg').textContent = 'Only admin logins can see performance and feedback.';
        ctx.root.querySelectorAll('section').forEach(s => { s.hidden = true; });
        return;
    }
    let FB = [];

    const group = (rows, label = 'Group') => rows.length
        ? `<thead><tr><th>${label}</th><th class="n">Opened</th><th class="n">Typical</th><th class="n">Slow (95%)</th><th class="n">Server</th></tr></thead><tbody>${rows.map(g => `<tr>
            <td>${esc(g.key)}</td><td class="n">${g.n}</td><td class="n ${tone(g.p50)}">${sec(g.p50)}</td><td class="n ${tone(g.p95)}">${sec(g.p95)}</td><td class="n">${sec(g.server_p50)}</td></tr>`).join('')}</tbody>`
        : '<tbody><tr><td class="pf-none">No data yet.</td></tr></tbody>';

    async function load() {
        $('pfMsg').textContent = 'Loading…';
        const days = $('pfDays').value, site = $('pfSite').value;
        try {
            const [s, f] = await ctx.guard(Promise.all([
                request('GET', `/api/perf/summary?days=${days}${site ? `&site=${site}` : ''}`),
                request('GET', `/api/feedback?days=${Math.max(30, Number(days))}`),
            ]));
            FB = f.feedback.filter(x => !site || x.site === site);
            render(s);
            $('pfMsg').textContent = s.totals.routes ? '' : 'No page timings yet — they arrive as desks use the PMS (sent every few minutes).';
        } catch (e) { $('pfMsg').textContent = e instanceof UserError ? e.message : 'Could not load.'; }
    }

    function render(s) {
        const t = s.totals;
        $('pfKpis').innerHTML = [
            ['Pages opened', t.routes, `${t.desks} login${t.desks === 1 ? '' : 's'} · ${t.loads} full loads`, ''],
            ['Typical page', sec(t.p50), 'median, menu click → page drawn', tone(t.p50)],
            ['Slow pages', sec(t.p95), '95% of openings are faster', tone(t.p95)],
            ['Errors', t.errors, 'pages that failed / script errors', t.errors ? 'bad' : 'ok'],
            ['Feedback', t.feedback, t.stars != null ? `average ${t.stars} ★` : 'no ratings yet', t.stars == null ? '' : t.stars >= 4 ? 'ok' : t.stars >= 3 ? 'mid' : 'bad'],
        ].map(([l, v, sub, c]) => `<div class="pf-kpi ${c}"><span>${esc(l)}</span><b>${esc(v ?? '—')}</b><small>${esc(sub)}</small></div>`).join('');

        $('pfPages').innerHTML = s.pages.length
            ? `<thead><tr><th>Page</th><th class="n">Opened</th><th class="n">Typical</th><th class="n">Slow (95%)</th><th class="n">Server</th><th class="n">Calls</th><th class="n">Errors</th><th class="n">Feedback</th></tr></thead>
               <tbody>${s.pages.map(g => `<tr><td><b>${esc(pageName(g.key))}</b></td><td class="n">${g.n}</td>
                 <td class="n ${tone(g.p50)}">${sec(g.p50)}</td><td class="n ${tone(g.p95)}">${sec(g.p95)}</td><td class="n">${sec(g.server_p50)}</td><td class="n">${g.calls}</td>
                 <td class="n ${g.errors ? 'bad' : ''}">${g.errors || ''}</td><td class="n">${g.stars != null ? `${g.stars} ★ <small>(${g.ratings})</small>` : ''}</td></tr>`).join('')}</tbody>`
            : '<tbody><tr><td class="pf-none">No page timings yet.</td></tr></tbody>';
        $('pfDevice').innerHTML = group(s.device, 'Device');
        $('pfBrowser').innerHTML = group(s.browser, 'Browser');
        $('pfNet').innerHTML = group(s.net, 'Connection');
        $('pfOs').innerHTML = group([...s.os, ...s.app.map(a => ({ ...a, key: a.key === 'app' ? 'Android app' : 'In a browser' }))], 'System / app');
        $('pfSiteT').innerHTML = group(s.site_groups.map(g => ({ ...g, key: g.key === 'medina' ? 'Medina' : g.key === 'makkah' ? 'Makkah' : g.key })), 'Site');
        $('pfColo').innerHTML = group(s.colo, 'Location');
        $('pfBuild').innerHTML = group(s.build, 'Build');
        const max = Math.max(1, ...s.day.map(d => d.p50 || 0));
        $('pfDay').innerHTML = s.day.length ? `<div class="pf-bars">${s.day.map(d => `<div class="pf-bar" title="${esc(d.key)}: ${sec(d.p50)} typical · ${d.n} pages">
            <i class="${tone(d.p50)}" style="height:${Math.max(4, (d.p50 || 0) / max * 100)}%"></i><b>${sec(d.p50)}</b><small>${esc(d.key.slice(5))}</small></div>`).join('')}</div>` : '<p class="pf-none">No data yet.</p>';
        const v = s.vitals;
        $('pfVitals').innerHTML = [['First byte', v.ttfb], ['Page ready', v.dom_ready], ['All loaded', v.load], ['Main content (LCP)', v.lcp], ['Tap response (INP)', v.inp]]
            .map(([l, ms]) => `<div class="pf-kpi ${tone(ms)}"><span>${l}</span><b>${sec(ms)}</b></div>`).join('')
            + `<div class="pf-kpi ${v.cls == null ? '' : v.cls < .1 ? 'ok' : v.cls < .25 ? 'mid' : 'bad'}"><span>Layout shift (CLS)</span><b>${v.cls ?? '—'}</b></div>`;
        $('pfErrors').innerHTML = s.errors.length
            ? `<thead><tr><th>When</th><th>Page</th><th>Error</th><th>Login</th><th>Device</th></tr></thead><tbody>${s.errors.map(e => `<tr>
                <td class="nowrap">${esc(when(e.at))}</td><td>${esc(pageName(e.page))}</td><td class="pf-err">${esc(e.err)}</td><td>${esc(e.desk)}</td><td>${esc([e.device, e.browser].filter(Boolean).join(' · '))}</td></tr>`).join('')}</tbody>`
            : '<tbody><tr><td class="pf-none">No errors in this period. 🎉</td></tr></tbody>';
        const pages = [...new Set(FB.map(f => f.page))].sort();
        const keep = $('fbPage').value;
        $('fbPage').innerHTML = '<option value="">All pages</option>' + pages.map(p => `<option value="${esc(p)}"${p === keep ? ' selected' : ''}>${esc(pageName(p))}</option>`).join('');
        renderFeedback();
    }

    function renderFeedback() {
        const st = $('fbStars').value, status = $('fbStatus').value, page = $('fbPage').value;
        const list = FB.filter(f => (!st || (st === '1-2' ? f.rating <= 2 : st === '3' ? f.rating === 3 : f.rating >= 4))
            && (!status || f.status === status) && (!page || f.page === page));
        $('pfFeedback').innerHTML = list.length ? `<div class="pf-fb-list">${list.map(f => `<article class="pf-fb ${f.rating <= 2 ? 'low' : f.rating >= 4 ? 'high' : ''} ${f.status}" data-id="${f.id}">
            <div class="pf-fb-top"><span class="pf-stars">${stars(f.rating)}</span><b>${esc(pageName(f.page))}</b>
              <small>${esc(when(f.at))} · ${esc(f.desk || '')}${f.site ? ` · ${esc(f.site === 'medina' ? 'Medina' : 'Makkah')}` : ''} · ${esc(f.trigger === 'after-save' ? 'after a save' : 'while on the page')}</small>
              <select data-status aria-label="Status">${['new', 'seen', 'handled'].map(x => `<option${x === f.status ? ' selected' : ''}>${x}</option>`).join('')}</select></div>
            ${f.tags ? `<div class="pf-tags">${f.tags.split(', ').map(x => `<span>${esc(x)}</span>`).join('')}</div>` : ''}
            ${f.text ? `<p>${esc(f.text)}</p>` : ''}
            <small class="pf-ctx">${esc([f.page_ms != null ? `page took ${sec(f.page_ms)}` : '', f.device, f.browser, f.net_type, f.colo && `${f.colo} (${f.country || '?'})`, f.build && `build ${f.build}`].filter(Boolean).join(' · '))}</small>
          </article>`).join('')}</div>` : '<p class="pf-none">No feedback matches.</p>';
    }

    $('pfFeedback').addEventListener('change', async (e) => {
        const sel = e.target.closest('select[data-status]');
        if (!sel) return;
        const id = Number(sel.closest('[data-id]').dataset.id);
        try {
            await ctx.guard(request('PATCH', `/api/feedback/${id}`, { status: sel.value }));
            const f = FB.find(x => x.id === id); if (f) f.status = sel.value;
            renderFeedback();
        } catch (err) { alert(err.message || 'Could not save.'); }
    });
    ['fbStars', 'fbStatus', 'fbPage'].forEach(id => $(id).addEventListener('change', renderFeedback));
    ['pfDays', 'pfSite'].forEach(id => $(id).addEventListener('change', load));
    $('pfRefresh').addEventListener('click', load);
    await load();
}
