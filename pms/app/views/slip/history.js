// Slip page → History: every version of the loaded slip, from its first snapshot — created, UMS import, hand edit, bulk
// action (Forecast planner, delayed departures …). Newest first. Each version says what changed against the one it was
// based on, who and when; "Make active" puts an older version in use everywhere (the slip's live data becomes that
// snapshot, so every card, grid, timeline and report uses it) WITHOUT deleting anything — the next edit branches from it.
// Lanes (the coloured rail) show branches: a version based on one that already has a later version starts a new lane.
// Server: GET /api/slips/:id/versions, POST /api/slips/:id/activate (worker.js → listSlipVersions / activateSlipVersion).

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const when = (iso) => iso ? new Date(iso).toLocaleString(undefined, { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '';
const SOURCE = { 'ums-import': 'UMS import', 'json-import': 'JSON import', planner: 'Forecast planner', 'allocate-day': 'Forecast: allocate day', 'alloc-undo': 'Forecast: undo', delay: 'Delayed departures', migrate: 'Old browser upload' };

const roomsText = (list) => (list || []).map(r => `${r.room_no}×${r.assigned ?? r.beds ?? '?'}${r.out && r.out.date ? ` → ${r.out.date}` : ''}`).join(', ') || '—';
// the fields worth showing, as [label, text]
function fields(d) {
    d = d || {};
    const dt = (a, b) => [a, b].filter(Boolean).join(' ') || '—';
    return [
        ['SH', d.sh_no], ['Tour', d.tour_name], ['Leader', d.group_leader], ['Building', d.building],
        ['Check-in', dt(d.checkin_date, d.checkin_time)], ['Check-out', dt(d.checkout_date, d.checkout_time)],
        ['Gents', d.gents], ['Ladies', d.ladies], ['Children', d.children], ['Infants', d.infants], ['Total', d.total],
        ['Delayed', d.delayed && d.delayed.on ? `${d.delayed.status || 'tentative'}${d.delayed.note ? ` · ${d.delayed.note}` : ''}` : 'no'],
        ['Gents rooms', roomsText(d.rooms && d.rooms.gents)], ['Ladies rooms', roomsText(d.rooms && d.rooms.ladies)],
    ].map(([l, v]) => [l, v == null || v === '' ? '—' : String(v)]);
}
function changes(now, before) {
    if (!before) return null;
    const a = new Map(fields(before)), out = [];
    for (const [l, v] of fields(now)) if (a.get(l) !== v) out.push({ l, from: a.get(l), to: v });
    return out;
}

/**
 * host: the section element · api: { versions(id), activate(id, snapshot) } · current(): the loaded slip's id or null ·
 * canWrite(): this login may change the slip · onActivated(slip): the page reloads its form from the active version
 */
export function mountSlipHistory({ host, api, current, canWrite, onActivated }) {
    let data = null, token = 0, open = new Set(), msg = '';

    function draw() {
        if (!data) { host.hidden = true; host.innerHTML = ''; return; }
        host.hidden = false;
        const vs = [...data.versions].sort((a, b) => a.id - b.id);          // oldest first, to lay out the lanes
        const byId = new Map(vs.map(v => [v.id, v]));
        const kids = new Map(), lane = new Map();
        let lanes = 0;
        for (const v of vs) {
            const p = v.parent != null && byId.has(v.parent) ? v.parent : null;
            const sibs = p == null ? 0 : (kids.get(p) || 0);
            lane.set(v.id, p == null ? 0 : sibs ? ++lanes : lane.get(p));
            if (p != null) kids.set(p, sibs + 1);
        }
        const prevOf = new Map(vs.map((v, i) => [v.id, vs[i - 1] || null]));
        const rows = [...vs].reverse().map(v => {
            const parent = v.parent != null ? byId.get(v.parent) : null, isActive = v.id === data.active;
            const act = v.action === 'create' ? 'Created' : v.action === 'import' ? (SOURCE[v.note] || 'UMS import') : v.action === 'delete' ? 'Deleted'
                : v.action === 'snapshot' ? 'Starting point' : (SOURCE[v.note] || 'Manual edit');
            const diff = changes(v.data, parent && parent.data);
            const branch = parent && prevOf.get(v.id) && prevOf.get(v.id).id !== parent.id;
            const sum = diff == null ? '<span class="sh-first">first version</span>'
                : diff.length ? diff.slice(0, 6).map(c => `<span class="sh-chg"><b>${esc(c.l)}</b> ${esc(c.from)} → ${esc(c.to)}</span>`).join('') + (diff.length > 6 ? `<span class="sh-more">+${diff.length - 6} more</span>` : '')
                : '<span class="sh-first">no change to the details shown here</span>';
            return `<li class="sh-ver${isActive ? ' active' : ''}" data-id="${v.id}" style="--lane:${lane.get(v.id)}">
              <div class="sh-top"><b class="sh-n">v${v.n}</b>${isActive ? '<span class="sh-badge on">★ IN USE</span>' : ''}${branch ? `<span class="sh-badge br">branched from v${parent.n}</span>` : ''}
                <span class="sh-act">${esc(act)}</span><span class="sh-by">${esc(v.by_name || '')}</span><span class="sh-at">${esc(when(v.at))}</span></div>
              <div class="sh-sum">${sum}</div>
              <div class="sh-btns"><button type="button" class="linkish" data-detail="${v.id}">${open.has(v.id) ? 'Hide details' : 'Details'}</button>
                ${!isActive && canWrite() && v.action !== 'delete' ? `<button type="button" class="sh-use" data-use="${v.id}">Make v${v.n} the version in use</button>` : ''}</div>
              ${open.has(v.id) ? `<table class="sh-det">${fields(v.data).map(([l, x]) => `<tr><th>${esc(l)}</th><td>${esc(x)}</td></tr>`).join('')}</table>` : ''}
            </li>`;
        }).join('');
        host.innerHTML = `<h3>History <span class="muted">${vs.length} version${vs.length === 1 ? '' : 's'}${lanes ? ` · ${lanes + 1} branches` : ''}</span></h3>
          <p class="muted sh-help">Every change is kept, from the first. <b>In use</b> is the version every page and calculation reads. Making an older one the version in use deletes nothing — your next edit branches from it, and the others stay here.</p>
          ${msg ? `<p class="sh-msg">${esc(msg)}</p>` : ''}
          <ol class="sh-list">${rows}</ol>`;
    }

    async function load(id) {
        const mine = ++token;
        if (id == null) { data = null; msg = ''; draw(); return; }
        try {
            const r = await api.versions(id);
            if (mine !== token) return;
            data = r; draw();
        } catch (e) {
            if (mine !== token) return;
            data = { versions: [], active: null }; msg = 'Could not load the history.'; draw();
        }
    }

    host.addEventListener('click', async (e) => {
        const v = e.target.closest('[data-detail]');
        if (v) { const id = Number(v.dataset.detail); open.has(id) ? open.delete(id) : open.add(id); draw(); return; }
        const u = e.target.closest('[data-use]');
        if (!u || !data) return;
        const snap = data.versions.find(x => x.id === Number(u.dataset.use)), cur = data.versions.find(x => x.id === data.active);
        if (!snap) return;
        if (!confirm(`Make v${snap.n} the version in use${cur ? ` (instead of v${cur.n})` : ''}?\n\nIts details become the live slip everywhere — cards, grid, timeline, reports.\nNothing is deleted: v${cur ? cur.n : 'the current one'} and every other version stay in the history, and your next edit branches from v${snap.n}.`)) return;
        u.disabled = true;
        try {
            const slip = await api.activate(current(), snap.id);
            msg = `v${snap.n} is now the version in use.`;
            await load(current());
            onActivated && onActivated(slip);
        } catch (err) {
            msg = err && err.message ? err.message : 'Could not change the version in use.';
            draw();
        }
    });

    return { load };
}
