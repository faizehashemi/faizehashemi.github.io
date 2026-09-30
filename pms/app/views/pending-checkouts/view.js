// Accounts → Pending checkouts: load the UMS checkout list (Excel or PDF), show the groups with zero
// advance and the full list, each with the building and rooms the PMS has for its SH.
// Nothing is stored — the list lives only in this page and is gone when it closes.

import { parseCheckoutFile, matchGroups } from '../../core/checkout-list.js';

export default async function mount(ctx) {
    const { db, site } = ctx;
    const $ = (id) => document.getElementById(id);
    const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const dmy = (d) => d ? d.split('-').reverse().join('/') : '';
    const money = (n) => n == null ? '—' : n.toLocaleString(undefined, { maximumFractionDigits: 2 });

    $('siteName').textContent = site.label;

    let data = null; // { file, parsed, rows }
    let tab = 'zero';

    // Leaving with a list on screen: the browser asks first (it would be lost)
    window.addEventListener('beforeunload', (e) => { if (data) { e.preventDefault(); e.returnValue = ''; } });

    /* ------------------------------ load file ------------------------------ */

    async function load(file) {
        if (!file) return;
        $('fatal').hidden = true;
        $('filePills').innerHTML = `<span class="pill">Reading ${esc(file.name)}…</span>`;
        let parsed;
        try { parsed = await ctx.guard(parseCheckoutFile(file)); }
        catch (e) { console.error(e); parsed = { fatal: 'Could not read this file: ' + (e.message || e), groups: [], warnings: [] }; }
        if (parsed.fatal) {
            data = null;
            $('filePills').innerHTML = `<span class="pill">${esc(file.name)}</span>`;
            $('fatal').textContent = parsed.fatal;
            $('fatal').hidden = false;
            $('warnBox').hidden = true;
            $('listCard').hidden = true;
            return;
        }
        const rows = matchGroups(parsed.groups, await db.all())
            .sort((a, b) => `${a.checkoutDate} ${a.checkoutTime}`.localeCompare(`${b.checkoutDate} ${b.checkoutTime}`));
        data = { file, parsed, rows };
        if (!parsed.hasAdvance && tab === 'zero') tab = 'all';

        const notFound = rows.filter(r => !r.found).length;
        $('filePills').innerHTML = [
            `<span class="pill">${esc(file.name)} · ${esc(parsed.source)}</span>`,
            `<span class="pill ok">${rows.length} groups</span>`,
            parsed.hasAdvance ? `<span class="pill bad">${rows.filter(r => r.advance === 0).length} with advance 0</span>` : '<span class="pill warn">no advance column</span>',
            notFound ? `<span class="pill warn">${notFound} SH not found in ${esc(site.label)}</span>` : '',
        ].join('');
        const notes = [
            ...parsed.warnings,
            ...rows.filter(r => r.roomMismatch).map(r => `SH ${r.sh}: UMS lists ${r.umsRooms.join(', ')}, the PMS slip has ${r.stays.flatMap(s => s.rooms.map(x => x.no)).join(', ') || 'no rooms'}.`),
            ...rows.filter(r => r.dateMismatch).map(r => `SH ${r.sh}: UMS checkout ${dmy(r.checkoutDate)}, the PMS slip says ${r.stays.map(s => dmy(s.checkout)).join(', ')}.`),
        ];
        $('warnBox').hidden = !notes.length;
        $('warnSum').textContent = `${notes.length} difference(s) between the list and the PMS`;
        $('warnList').innerHTML = notes.map(n => `<li>${esc(n)}</li>`).join('');
        $('listCard').hidden = false;
        render();
    }

    /* -------------------------------- render -------------------------------- */

    const ymd = (t) => { const d = new Date(t); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
    const today = ymd(Date.now());
    const tomorrow = ymd(Date.now() + 86400000);
    const due = (d) => !d ? '' : d < today ? '<span class="due past">passed</span>'
        : d === today ? '<span class="due today">today</span>' : d === tomorrow ? '<span class="due soon">tomorrow</span>' : '';

    function roomsCell(r, hot) {
        if (!r.found) return `<span class="none">Not in ${esc(site.label)} PMS</span><span class="sub">UMS: ${esc(r.umsRooms.join(', ') || '—')}</span>`;
        const stays = r.stays.map(s => `<div class="stay"><span class="b">${esc(s.building || 'No building')}</span>${s.rooms.length
            ? s.rooms.map(x => `<span class="room${hot ? ' hot' : ''}${x.side === 'ladies' ? ' l' : ''}" title="${x.side}">${esc(x.no)}</span>`).join('')
            : '<span class="none">no rooms assigned</span>'}</div>`).join('');
        return stays + (r.roomMismatch ? `<span class="flag">UMS: ${esc(r.umsRooms.join(', '))}</span>` : '');
    }

    function render() {
        const { rows, parsed } = data;
        const zero = rows.filter(r => r.advance === 0);
        $('nZero').textContent = parsed.hasAdvance ? zero.length : '—';
        $('nAll').textContent = rows.length;
        document.querySelectorAll('.tabs button').forEach(b => b.setAttribute('aria-selected', String(b.dataset.tab === tab)));
        $('noAdvance').hidden = !(tab === 'zero' && !parsed.hasAdvance);

        const q = $('search').value.trim().toLowerCase();
        const match = (r) => !q || [r.sh, r.groupId, r.leader, r.operator, r.location, ...r.umsRooms,
            ...r.stays.flatMap(s => [s.building, ...s.rooms.map(x => x.no)])].some(v => String(v ?? '').toLowerCase().includes(q));
        const list = (tab === 'zero' ? (parsed.hasAdvance ? zero : []) : rows).filter(match);

        // Zero advance: every room, building by building
        $('byBuilding').innerHTML = tab !== 'zero' ? '' : Object.entries(list.reduce((m, r) => {
            for (const s of r.stays) (m[s.building || 'No building'] ||= []).push(...s.rooms.map(x => ({ ...x, sh: r.sh })));
            return m;
        }, {})).sort(([a], [b]) => a.localeCompare(b)).map(([b, rooms]) => {
            rooms.sort((x, y) => x.no.localeCompare(y.no, undefined, { numeric: true }));
            return `<div class="bld"><h4>${esc(b)} <span class="muted">· ${rooms.length} room(s)</span></h4>${rooms.map(x => `<span class="room hot" title="SH ${esc(x.sh)}">${esc(x.no)}</span>`).join('')}</div>`;
        }).join('');

        const tb = $('tbl').querySelector('tbody');
        tb.innerHTML = list.map(r => {
            const isZero = r.advance === 0;
            return `<tr class="${isZero && tab === 'all' ? 'zero' : ''}">
                <td class="nowrap"><a href="${ctx.href('slip', { sh_no: r.sh })}" target="_blank" rel="noopener" title="Open the slip in a new tab">${esc(r.sh)}</a><span class="sub">Group ${esc(r.groupId)}</span></td>
                <td>${esc(r.leader)}<span class="sub">${esc(r.operator)}</span></td>
                <td class="num">${r.pax ?? ''}</td>
                <td class="nowrap">${dmy(r.checkoutDate)} ${esc(r.checkoutTime)}${due(r.checkoutDate)}<span class="sub">arrived ${dmy(r.arrival)}</span></td>
                <td>${esc(r.location)}</td>
                <td class="num">${isZero ? '<b class="bad">0</b>' : money(r.advance)}</td>
                <td>${roomsCell(r, isZero)}</td>
            </tr>`;
        }).join('') || `<tr class="empty"><td colspan="7">${tab === 'zero' && !parsed.hasAdvance ? 'No advance column in this file.' : 'Nothing here.'}</td></tr>`;
    }

    /* -------------------------------- inputs -------------------------------- */

    $('file').addEventListener('change', (e) => { load(e.target.files[0]); e.target.value = ''; });
    const drop = $('drop');
    drop.addEventListener('dragover', (e) => { e.preventDefault(); drop.classList.add('over'); });
    drop.addEventListener('dragleave', () => drop.classList.remove('over'));
    drop.addEventListener('drop', (e) => { e.preventDefault(); drop.classList.remove('over'); load(e.dataTransfer.files[0]); });
    document.querySelectorAll('.tabs button').forEach(b => b.addEventListener('click', () => { tab = b.dataset.tab; if (data) render(); }));
    $('search').addEventListener('input', () => data && render());
    $('btnPrint').addEventListener('click', () => window.print());
}
