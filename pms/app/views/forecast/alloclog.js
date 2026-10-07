// Log of bulk applies on the Forecast page (planner "Write building", day "Apply allocations"), shared by every
// desk of the site (GET/POST /api/alloc-log). Each entry keeps every slip's building and rooms before and after.
// Undo puts back the "before" on the slips that still look exactly like the "after" (a slip changed since — e.g.
// rooms picked on the Slip page — is left alone and listed), then marks the entry as undone.

import { request } from '../../core/cloud.js';

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const KIND = { planner: 'Building planner', 'allocate-day': "Day's check-ins" };
const when = (iso) => iso ? new Date(iso).toLocaleString(undefined, { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '';

/** building + rooms of a slip, in a form that can be compared */
export function allocOf(r) {
    const side = (s) => (r.rooms?.[s] || []).filter(x => String(x.room_no || '').trim())
        .map(x => ({ room_no: String(x.room_no).trim(), capacity: x.capacity ?? '', assigned: x.assigned ?? '', ...(x.gl ? { gl: true } : {}) }));
    return { building: String(r.building || '').trim(), rooms: { gents: side('gents'), ladies: side('ladies') } };
}
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const roomsText = (a) => {
    const list = (s) => a.rooms[s].map(x => x.room_no).join(', ');
    const parts = [list('gents') && `G ${list('gents')}`, list('ladies') && `L ${list('ladies')}`].filter(Boolean);
    return `${a.building || 'no building'}${parts.length ? ` · ${parts.join(' · ')}` : ''}`;
};

/** Save one bulk apply: pairs of [slip before, slip after] */
export async function recordApply(ctx, kind, note, pairs) {
    const changes = pairs.map(([before, after]) => ({ id: before.id, sh: String(before.sh_no ?? ''), before: allocOf(before), after: allocOf(after) }));
    if (!changes.length) return;
    try { await request('POST', '/api/alloc-log', { site: ctx.siteId, kind, note, changes }); }
    catch (e) { console.warn('alloc log', e); }
    window.dispatchEvent(new Event('pms:alloc-log'));
}

/** @param {{ ctx: object, host: Element }} o */
export function mountAllocLog({ ctx, host }) {
    host.innerHTML = `
      <div class="pl-head"><h2>🧾 Bulk changes</h2>
        <p>Every “Write building” and “Apply allocations” made here, newest first, for every desk. <b>Undo</b> puts back each slip's
          building and rooms as they were — except slips changed since then, which are left alone and listed.</p></div>
      <div id="lgList"><p class="pl-hint">Loading…</p></div>`;
    const $ = (id) => host.querySelector('#' + id);
    let LOG = [];

    async function load() {
        try { LOG = (await ctx.guard(request('GET', `/api/alloc-log?site=${ctx.siteId}`))).log || []; }
        catch (e) { $('lgList').innerHTML = `<p class="pl-hint">The log is not available right now (${esc(e.message || e)}).</p>`; return; }
        draw();
    }
    function draw() {
        $('lgList').innerHTML = LOG.length ? LOG.map(e => `
          <details class="lg-item${e.undone_at ? ' undone' : ''}">
            <summary>
              <span class="lg-when">${esc(when(e.created_at))}</span>
              <span class="lg-kind">${esc(KIND[e.kind] || e.kind)}</span>
              <span class="lg-note">${esc(e.note)} · ${e.count} slip${e.count === 1 ? '' : 's'} · by ${esc(e.by_name || '—')}</span>
              ${e.undone_at ? `<span class="lg-undone">Undone ${esc(when(e.undone_at))} by ${esc(e.undone_by_name || '—')}</span>`
                : ctx.db.readonly ? '' : `<button type="button" class="pl-btn" data-undo="${e.id}">↩ Undo</button>`}
            </summary>
            ${e.undo_note ? `<p class="pl-hint">${esc(e.undo_note)}</p>` : ''}
            <table class="pl-table lg-table"><thead><tr><th>SH</th><th>Before</th><th>After</th></tr></thead>
              <tbody>${e.changes.map(c => `<tr><td class="sh">${esc(c.sh)}</td><td>${esc(roomsText(c.before))}</td><td>${esc(roomsText(c.after))}</td></tr>`).join('')}</tbody></table>
          </details>`).join('') : '<p class="pl-hint">No bulk changes yet.</p>';
    }

    async function undo(id) {
        const e = LOG.find(x => x.id === id);
        if (!e) return;
        if (!confirm(`Undo “${KIND[e.kind] || e.kind}” from ${when(e.created_at)} (${e.count} slip${e.count === 1 ? '' : 's'})?\n\nEach slip gets back its building and rooms as they were, unless it was changed since.`)) return;
        const current = new Map((await ctx.guard(ctx.db.all())).map(r => [r.id, r]));
        const put = [], changed = [], gone = [];
        for (const c of e.changes) {
            const r = current.get(c.id);
            if (!r) { gone.push(c.sh); continue; }
            if (!same(allocOf(r), c.after)) { changed.push(c.sh); continue; }
            put.push({ ...r, building: c.before.building, rooms: { gents: c.before.rooms.gents, ladies: c.before.rooms.ladies } });
        }
        try {
            const res = put.length ? await ctx.guard(ctx.db.bulkWrite({ put }, 'alloc-undo')) : { updated: 0 };
            const note = `Restored ${res.updated} slip${res.updated === 1 ? '' : 's'}.` +
                (changed.length ? ` Left ${changed.length} changed since (SH ${changed.join(', ')}).` : '') +
                (gone.length ? ` ${gone.length} no longer there (SH ${gone.join(', ')}).` : '');
            LOG = (await ctx.guard(request('POST', `/api/alloc-log/${id}/undo`, { note }))).log || LOG;
            draw();
            alert(note);
            window.dispatchEvent(new Event('pms:alloc-undone'));
        } catch (err) { alert(err.message || String(err)); load(); }
    }

    $('lgList').addEventListener('click', (ev) => {
        const b = ev.target.closest('[data-undo]');
        if (!b) return;
        ev.preventDefault(); // inside <summary>: do not toggle
        undo(Number(b.dataset.undo));
    });
    const onLog = () => load();
    window.addEventListener('pms:alloc-log', onLog);
    load();
    return { refresh: load, stop: () => window.removeEventListener('pms:alloc-log', onLog) };
}
