// Search slips (Data): find a slip and read it. View only — no edit, delete, import, export or print.

import { slipStart, slipEnd, isDelayed, rowsOf } from '../../core/stay.js';

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const natural = (a, b) => String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: 'base' });
const when = (ms) => ms ? new Date(ms).toLocaleString(undefined, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';
const stamp = (v) => { const d = new Date(v); return v && !isNaN(d) ? when(d.getTime()) : '—'; };
const num = (v) => { const x = Number(v); return Number.isFinite(x) ? x : 0; };
const pax = (s) => num(s.total) || num(s.gents) + num(s.ladies) + num(s.children) + num(s.infants);
const roomsOf = (s) => [...new Set(['gents', 'ladies'].flatMap(k => (s.rooms?.[k] || []).map(x => String(x.room_no || '').trim()).filter(Boolean)))];
const LIMIT = 300;

export default async function mount(ctx) {
    const $ = (id) => ctx.root.querySelector('#' + id);
    let ALL = [], shown = [], current = null;

    async function load() {
        ALL = (await ctx.guard(ctx.db.all())).filter(s => !s.deleted);
        const blds = [...new Set(ALL.map(s => String(s.building || '').trim()).filter(Boolean))].sort(natural);
        const keep = $('ssBld').value;
        $('ssBld').innerHTML = '<option value="">All buildings</option>' + blds.map(b => `<option ${b === keep ? 'selected' : ''}>${esc(b)}</option>`).join('');
        render();
    }

    function render() {
        const q = $('ssQ').value.trim().toLowerCase(), room = $('ssRoom').value.trim().toLowerCase(), bld = $('ssBld').value;
        const from = $('ssFrom').value ? new Date(`${$('ssFrom').value}T00:00`).getTime() : null;
        const to = $('ssTo').value ? new Date(`${$('ssTo').value}T23:59:59`).getTime() : null;
        shown = ALL.filter(s => {
            if (bld && String(s.building || '').trim() !== bld) return false;
            if (q && ![s.sh_no, s.tour_name, s.group_leader, s.building].join(' ').toLowerCase().includes(q)) return false;
            if (room && !roomsOf(s).some(r => r.toLowerCase().includes(room))) return false;
            // staying at any time between the two dates
            if (from && (slipEnd(s) || 0) < from) return false;
            if (to && (slipStart(s) || Infinity) > to) return false;
            return true;
        }).sort((a, b) => (slipStart(b) || 0) - (slipStart(a) || 0));
        const list = shown.slice(0, LIMIT);
        $('ssCount').textContent = shown.length > LIMIT ? `${shown.length} slips · first ${LIMIT} shown, narrow the search` : `${shown.length} slip${shown.length === 1 ? '' : 's'}`;
        $('ssRows').innerHTML = list.length ? list.map(s => {
            const rooms = roomsOf(s);
            return `<tr data-id="${s.id}" class="${current === s.id ? 'on' : ''}" tabindex="0">
                <td><b>${esc(s.sh_no)}</b></td>
                <td>${esc(s.tour_name)}<small>${esc(String(s.group_leader || '').trim() || '-')}</small></td>
                <td>${esc(s.building || '—')}${rooms.length ? `<small>${esc(rooms.join(', '))}</small>` : ''}</td>
                <td class="nowrap">${when(slipStart(s))}</td>
                <td class="nowrap">${when(slipEnd(s))}${isDelayed(s) ? ' <em class="ss-dl">delayed</em>' : ''}</td>
                <td class="n">${pax(s) || '—'}</td></tr>`;
        }).join('') : '<tr><td colspan="6" class="ss-muted">No slips match.</td></tr>';
    }

    function detail(s) {
        current = s.id;
        ctx.root.querySelectorAll('#ssRows tr').forEach(tr => tr.classList.toggle('on', Number(tr.dataset.id) === s.id));
        const rows = rowsOf(s);
        const side = (k) => rows.filter(r => r.side === k);
        const roomTbl = (k, label) => side(k).length ? `<h3>${label}</h3><table class="ss-mini"><thead><tr><th>Room</th><th>Beds</th>${isDelayed(s) ? '<th>Leaves</th>' : ''}</tr></thead><tbody>${side(k).map(r =>
            `<tr><td>${esc(r.room_no)}${r.exclusive ? ` <em class="ss-dl" title="The whole room is kept for these guests">exclusive · ${r.block} beds kept</em>` : ''}${r.building && r.building !== String(s.building || '').trim() ? ` <small>${esc(r.building)}</small>` : ''}</td><td class="n">${r.beds}</td>${isDelayed(s) ? `<td>${when(r.end)}${r.status !== 'booked' ? ` <em class="ss-dl">${esc(r.status)}</em>` : ''}</td>` : ''}</tr>`).join('')}</tbody></table>` : '';
        const field = (l, v) => `<div><span>${l}</span><b>${v}</b></div>`;
        $('ssDetail').innerHTML = `<h2>SH ${esc(s.sh_no)}</h2>
            <div class="ss-fields">
                ${field('Group', esc(s.tour_name || '—'))}
                ${field('Group leader', esc(String(s.group_leader || '').trim() || '-'))}
                ${field('Building', esc(s.building || '—'))}
                ${s.from_place || s.to_place ? field('From → To', `${esc(s.from_place || '—')} → ${esc(s.to_place || '—')}`) : ''}
                ${field('Check-in', when(slipStart(s)))}
                ${s.checked_in ? field('Checked in', 'yes') : ''}
                ${field('Check-out', when(slipEnd(s)) + (isDelayed(s) ? ' <em class="ss-dl">delayed</em>' : ''))}
                ${field('Total pax', pax(s) || '—')}
                ${field('Gents · Ladies', `${num(s.gents)} · ${num(s.ladies)}`)}
                ${field('Children · Infants', `${num(s.children ?? s.child)} · ${num(s.infants ?? s.infant)}`)}
                ${s.ums?.key ? field('From UMS', stamp(s.ums.importedAt)) : ''}
                ${field('Created', stamp(s.createdAt))}
                ${s.updatedAt ? field('Last changed', stamp(s.updatedAt)) : ''}
            </div>
            ${roomTbl('gents', 'Gents rooms')}${roomTbl('ladies', 'Ladies rooms')}
            ${rows.length ? '' : '<p class="ss-muted">No rooms assigned yet.</p>'}
            ${String(s.notes || s.remarks || '').trim() ? `<h3>Notes</h3><p>${esc(s.notes || s.remarks)}</p>` : ''}`;
    }

    const pick = (e) => {
        const tr = e.target.closest('tr[data-id]');
        if (!tr) return;
        const s = ALL.find(x => x.id === Number(tr.dataset.id));
        if (s) detail(s);
    };
    $('ssRows').addEventListener('click', pick);
    $('ssRows').addEventListener('keydown', (e) => { if (e.key === 'Enter') pick(e); });
    ['ssQ', 'ssRoom', 'ssBld', 'ssFrom', 'ssTo'].forEach(id => $(id).addEventListener('input', render));
    await load();
    // other desks' changes: refresh every 2 minutes while open
    const t = setInterval(() => { if (document.visibilityState === 'visible') load().catch(() => { }); }, 120e3);
    return () => clearInterval(t);
}
