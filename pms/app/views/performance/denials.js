// Performance → "Slip saves refused": every Save / Edit / Save as a copy the Slip page stopped (views/slip/view.js →
// POST /api/slip-denials), with the conditions it checked — so "why won't it let us?" has an answer.
// Each record's detail: form (as typed), rows (this slip's rooms and beds), issues (blocked = over the beds at the busiest
// moment, with every other stay in that room; nocap = no bed count anywhere; badtime = a row's own check-out before
// the check-in; window = building / dates missing; server = the server refused), ok_rooms, copy (how fresh this
// browser's copy of the slips was).

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const when = (iso) => iso ? new Date(iso).toLocaleString(undefined, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—';
const REASON = { blocked: 'Over the beds', nocap: 'No bed count', badtime: 'Row check-out before check-in', window: 'Building / dates missing', server: 'Server refused' };
const ACTION = { save: 'Save', update: 'Edit', copy: 'Save as a copy' };
const CAP_FROM = { row: "this slip's row", builder: 'Rooms & Buildings', history: 'an older slip' };
const SITE = { makkah: 'Makkah', medina: 'Medina' };

const parse = (d) => { try { return JSON.parse(d.detail || '{}'); } catch { return {}; } };
const kindsOf = (d) => (d.kinds || '').split(',').filter(Boolean);
const minutesOld = (copy, at) => copy?.last_sync ? Math.round((Date.parse(at) - Date.parse(copy.last_sync)) / 60000) : null;

function capLine(cs, cap) {
    if (!cs) return `${cap ?? '?'} beds`;
    const also = [cs.used !== 'row' && cs.row ? `row says ${cs.row}` : '', cs.used !== 'builder' && cs.builder ? `Rooms & Buildings says ${cs.builder}` : '',
        !cs.builder ? 'not in Rooms & Buildings' : ''].filter(Boolean);
    const clash = cs.row && cs.builder && cs.row !== cs.builder;
    return `<b>${cap ?? '?'} beds</b> from ${esc(CAP_FROM[cs.used] || 'nowhere')}${also.length ? ` (${esc(also.join('; '))})` : ''}${clash ? ' <span class="dn-flag">row ≠ Rooms &amp; Buildings</span>' : ''}`;
}

function stayRow(w, worstAt) {
    const atWorst = worstAt && Date.parse(w.start) <= Date.parse(worstAt) && Date.parse(worstAt) < Date.parse(w.end);
    return `<tr${atWorst ? ' class="dn-hit"' : ''}><td>SH ${esc(w.sh || '—')}${w.id ? ` <small>#${esc(w.id)}</small>` : ''}${w.ums ? ' <small>UMS</small>' : ''}</td>
        <td class="n">${esc(w.beds)}</td><td>${esc(when(w.start))} → ${esc(when(w.end))}</td><td>${esc(w.status && w.status !== 'booked' ? `delayed · ${w.status}` : '')}</td></tr>`;
}

function issueHtml(x, d) {
    if (x.kind === 'blocked') {
        const others = x.others?.length ? x.others : x.who || [];
        return `<li><b class="dn-bad">Room ${esc(x.room)}: ${esc(x.total)}/${esc(x.cap)} on ${esc(when(x.at))}</b> — other groups ${esc(x.existing)} + this slip ${esc(x.want)}.
            <div class="dn-sub">Capacity: ${capLine(x.cap_source, x.cap)}</div>
            ${others.length ? `<table class="dn-tbl"><thead><tr><th>Other stays in the room during this slip</th><th class="n">Beds</th><th>From → to</th><th></th></tr></thead>
              <tbody>${others.map(w => stayRow(w, x.at)).join('')}</tbody></table><small class="dn-sub">Highlighted = in the room at the busiest moment.</small>` : ''}</li>`;
    }
    if (x.kind === 'nocap') return `<li><b class="dn-bad">Room ${esc(x.room)}: no bed count</b> — ${capLine(x.cap_source, 0)}</li>`;
    if (x.kind === 'badtime') return `<li><b class="dn-bad">Room ${esc(x.room)}: its own check-out is before the check-in</b>${x.out ? ` (row leaves ${esc(x.out.date)} ${esc(x.out.time)})` : ''}</li>`;
    if (x.kind === 'window') return `<li><b class="dn-bad">${x.missing?.length ? `Missing or wrong: ${esc(x.missing.join(', '))}` : 'Building or dates missing'}</b> (typed: building “${esc(d.building)}”, ${esc(d.form?.checkin)} → ${esc(d.form?.checkout)})</li>`;
    if (x.kind === 'server') return `<li><b class="dn-bad">Server refused${x.status ? ` (${esc(x.status)})` : ''}:</b> ${esc(x.message)}</li>`;
    return `<li>${esc(JSON.stringify(x))}</li>`;
}

function detailHtml(row) {
    const d = parse(row), f = d.form || {}, c = d.copy;
    const old = minutesOld(c, row.at);
    return `<div class="dn-body">
        <div class="dn-facts">
          <span><b>Typed</b> ${esc(f.checkin)} → ${esc(f.checkout)} · G ${esc(f.gents || 0)} · L ${esc(f.ladies || 0)} · C ${esc(f.children || 0)} · I ${esc(f.infants || 0)} · total ${esc(f.total || 0)}${f.delayed ? ' · delayed departure on' : ''}</span>
          <span><b>Rooms in this slip</b> ${(d.rows || []).map(r => `${esc(r.room)} × ${esc(r.beds)}${r.cap_row ? ` <small>(row cap ${esc(r.cap_row)})</small>` : ''}`).join(', ') || '—'}</span>
          <span><b>Data used</b> ${c ? `${c.synced ? 'fresh from the server' : '<span class="dn-flag">could not reach the server — this browser\'s copy</span>'} · ${esc(c.slips)} slips${old != null ? ` · last sync ${old <= 0 ? 'just before' : `${old} min before`}` : ' · never synced'}${c.online === false ? ' · offline' : ''}` : '—'}</span>
        </div>
        <ol class="dn-issues">${(d.issues || []).map(x => issueHtml(x, d)).join('')}</ol>
        ${d.ok_rooms?.length ? `<p class="dn-ok">✓ OK: ${d.ok_rooms.map(o => `${esc(o.room)} ${esc(o.after)}/${esc(o.cap)}`).join(' · ')}</p>` : ''}
        <button type="button" class="dn-copy" data-copy="${esc(row.id)}">Copy the full record (JSON)</button>
      </div>`;
}

/** Renders the section; returns refresh(list) to call after each load. */
export function denialsSection(root) {
    const $ = (id) => root.querySelector('#' + id);
    let LIST = [];
    const chips = (title, pairs) => pairs.length ? `<div class="dn-chips"><b>${esc(title)}</b>${pairs.map(([k, n]) => `<span>${esc(k)} <i>${n}</i></span>`).join('')}</div>` : '';
    const count = (keys) => { const m = new Map(); keys.forEach(k => m.set(k, (m.get(k) || 0) + 1)); return [...m].sort((a, b) => b[1] - a[1]); };

    function render() {
        const kind = $('dnKind').value, desk = $('dnDesk').value, find = $('dnFind').value.trim().toUpperCase();
        const list = LIST.filter(d => (!kind || kindsOf(d).includes(kind)) && (!desk || d.desk === desk)
            && (!find || String(d.sh_no || '').toUpperCase().includes(find) || `,${d.rooms || ''},`.toUpperCase().includes(`,${find},`)));
        const stale = LIST.filter(d => parse(d).copy?.synced === false).length;
        const capClash = LIST.filter(d => (parse(d).issues || []).some(x => x.cap_source?.row && x.cap_source?.builder && x.cap_source.row !== x.cap_source.builder)).length;
        $('pfDenySum').innerHTML = LIST.length ? `<div class="dn-sum">
            ${chips('Reasons', count(LIST.flatMap(kindsOf)).map(([k, n]) => [REASON[k] || k, n]))}
            ${chips('Logins', count(LIST.map(d => d.desk)))}
            ${chips('Rooms', count(LIST.flatMap(d => (d.rooms || '').split(',').filter(Boolean).map(r => `${d.building} ${r}`))).slice(0, 12))}
            ${chips('Groups (SH)', count(LIST.map(d => d.sh_no).filter(Boolean)).filter(([, n]) => n > 1).slice(0, 12))}
            ${stale || capClash ? `<p class="dn-warn">${stale ? `${stale} refused on a copy that could not be refreshed from the server. ` : ''}${capClash ? `${capClash} had a row capacity different from Rooms &amp; Buildings.` : ''}</p>` : ''}
          </div>` : '';
        $('pfDeny').innerHTML = list.length ? `<div class="dn-list">${list.map(d => `<details class="dn" data-id="${esc(d.id)}">
            <summary><span class="dn-when">${esc(when(d.at))}</span> <b>${esc(d.desk)}</b> <small>${esc(SITE[d.site] || d.site || '')}</small>
              · ${esc(ACTION[d.action] || d.action)} · SH <b>${esc(d.sh_no || '—')}</b>${d.slip_id ? ` <small>#${esc(d.slip_id)}</small>` : ''} · ${esc(d.building || '—')}
              ${kindsOf(d).map(k => `<span class="dn-kind ${esc(k)}">${esc(REASON[k] || k)}</span>`).join('')}${d.rooms ? ` <small>rooms ${esc(d.rooms.split(',').join(', '))}</small>` : ''}</summary>
          </details>`).join('')}</div>` : `<p class="pf-none">${LIST.length ? 'None match.' : 'No refused slip saves in this period.'}</p>`;
    }
    // the detail is drawn when a record is opened
    $('pfDeny').addEventListener('toggle', (e) => {
        const el = e.target;
        if (!el.matches?.('details.dn') || !el.open || el.querySelector('.dn-body')) return;
        const row = LIST.find(d => String(d.id) === el.dataset.id);
        if (row) el.insertAdjacentHTML('beforeend', detailHtml(row));
    }, true);
    $('pfDeny').addEventListener('click', async (e) => {
        const b = e.target.closest('[data-copy]');
        if (!b) return;
        const row = LIST.find(d => String(d.id) === b.dataset.copy);
        try { await navigator.clipboard.writeText(JSON.stringify({ ...row, detail: parse(row) }, null, 2)); b.textContent = 'Copied ✓'; }
        catch { b.textContent = 'Could not copy'; }
    });
    ['dnKind', 'dnDesk'].forEach(id => $(id).addEventListener('change', render));
    $('dnFind').addEventListener('input', render);

    return function refresh(list) {
        LIST = list || [];
        const keepK = $('dnKind').value, keepD = $('dnDesk').value;
        $('dnKind').innerHTML = '<option value="">All reasons</option>' + Object.entries(REASON).filter(([k]) => LIST.some(d => kindsOf(d).includes(k)))
            .map(([k, l]) => `<option value="${k}"${k === keepK ? ' selected' : ''}>${esc(l)}</option>`).join('');
        $('dnDesk').innerHTML = '<option value="">All logins</option>' + [...new Set(LIST.map(d => d.desk))].sort()
            .map(x => `<option${x === keepD ? ' selected' : ''}>${esc(x)}</option>`).join('');
        render();
    };
}
