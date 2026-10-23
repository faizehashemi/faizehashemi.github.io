// Backups (Data, admins): the hourly database backups the Worker keeps (worker.js "hourly backups") — health, the saved
// copies (download), and "find a slip in a backup": how a slip looked then, what restoring it would change, and a button
// that writes that state back as a new version (also undeletes). Server: GET /api/backups, POST /api/backups/run,
// GET /api/backups/download · /slip, POST /api/backups/restore-slip.

import { request, currentDesk, getSession, apiBase, UserError } from '../../core/cloud.js';
import { changes } from '../slip/history.js';

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const when = (iso) => iso ? new Date(iso).toLocaleString(undefined, { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—';
const kb = (n) => n == null ? '—' : n < 1024 * 1024 ? `${Math.max(1, Math.round(n / 1024))} KB` : `${(n / 1048576).toFixed(1)} MB`;
const ago = (ms) => { const m = Math.round(ms / 60000); return m < 1 ? 'just now' : m < 90 ? `${m} min ago` : m < 2880 ? `${Math.round(m / 60)} h ago` : `${Math.round(m / 1440)} days ago`; };

export default async function mount(ctx) {
    const $ = (id) => ctx.root.querySelector('#' + id);
    if (currentDesk()?.role !== 'admin') {
        $('bkMsg').textContent = 'Only admin logins can see the backups.';
        ctx.root.querySelectorAll('section, #bkRun').forEach(s => { s.hidden = true; });
        return;
    }
    let ITEMS = [], STATUS = null, NOW = Date.now();
    const say = (t, bad) => { $('bkMsg').textContent = t || ''; $('bkMsg').classList.toggle('bad', !!bad); };
    const label = (it) => `${when(it.at)} · ${it.kind === 'd' ? 'daily' : it.trigger === 'manual' ? 'manual' : 'hourly'}`;

    function renderStatus() {
        const s = STATUS;
        let tone = 'bad', text = 'No backup yet', facts = '';
        if (s && s.ok_at) {
            const age = NOW - Date.parse(s.ok_at);
            tone = s.ok === false ? 'bad' : age <= 90 * 60e3 ? '' : age <= 180 * 60e3 ? 'mid' : 'bad';
            text = s.ok === false ? 'The last backup FAILED' : age <= 90 * 60e3 ? `Healthy — last backup ${ago(age)}` : `Late — last backup ${ago(age)}`;
            facts = `<span>Last good backup <b>${esc(when(s.ok_at))}</b></span><span>Size <b>${esc(kb(s.bytes))}</b> compressed</span><span><b>${esc(s.rows)}</b> rows · <b>${esc(s.tables)}</b> tables</span><span>Took <b>${esc(s.ms)} ms</b></span>`;
        } else if (s && s.ok === false) text = 'The last backup FAILED';
        $('bkStatus').innerHTML = `<div class="bk-health"><span class="bk-pill ${tone}">${esc(text)}</span><span class="bk-note">a backup is made every hour; this turns amber after 90 minutes</span></div>
            ${facts ? `<div class="bk-facts">${facts}</div>` : ''}${s && s.ok === false ? `<p class="bk-err">${esc(s.error || 'unknown error')} (${esc(when(s.failed_at))}) — it is tried again at the next half hour.</p>` : ''}`;
    }

    function renderList() {
        $('bkList').innerHTML = ITEMS.length
            ? `<thead><tr><th>Taken</th><th>Kind</th><th class="n">Slips</th><th class="n">All rows</th><th class="n">Size</th><th>Check</th><th></th></tr></thead><tbody>${ITEMS.map(it => {
                const p = it.parts, rows = (p.slips?.rows || 0) + (p.rest?.rows || 0), size = Object.values(p).reduce((n, x) => n + (x.bytes || 0), 0);
                const k = it.kind === 'd' ? ['Daily', 'd'] : it.trigger === 'manual' ? ['Manual', 'manual'] : ['Hourly', ''];
                return `<tr><td>${esc(when(it.at))}</td><td><span class="bk-kind ${k[1]}">${k[0]}</span></td><td class="n">${p.slips?.rows ?? '—'}</td><td class="n">${rows}</td><td class="n">${esc(kb(size))}</td>
                    <td><code title="SHA-256 of the slips file">${esc((p.slips?.sha || '').slice(0, 8))}</code></td>
                    <td><button type="button" class="bk-link" data-pick="${esc(it.kind + '|' + it.stem)}">Find a slip</button>
                        <button type="button" class="bk-link" data-dl="${esc(it.kind + '|' + it.stem + '|slips')}">⬇ slips</button><button type="button" class="bk-link" data-dl="${esc(it.kind + '|' + it.stem + '|rest')}">⬇ rest</button></td></tr>`;
            }).join('')}</tbody>`
            : '<tbody><tr><td class="bk-none">No backups kept yet — the first one is made at the next hour, or press “Back up now”.</td></tr></tbody>';
        const keep = $('bkPick').value;
        $('bkPick').innerHTML = ITEMS.map(it => `<option value="${esc(it.kind + '|' + it.stem)}"${it.kind + '|' + it.stem === keep ? ' selected' : ''}>${esc(label(it))}</option>`).join('') || '<option value="">(none yet)</option>';
    }

    async function load() {
        try {
            const r = await ctx.guard(request('GET', '/api/backups'));
            ITEMS = r.items; STATUS = r.status; NOW = Date.parse(r.now) || Date.now();
            renderStatus(); renderList();
        } catch (e) { say(e instanceof UserError ? e.message : 'Could not load the backups.', true); }
    }

    $('bkRun').addEventListener('click', async () => {
        $('bkRun').disabled = true; say('Backing up…');
        try { await ctx.guard(request('POST', '/api/backups/run')); say('Backup done ✓'); await load(); }
        catch (e) { say(e instanceof UserError ? e.message : 'The backup failed.', true); await load(); }
        finally { $('bkRun').disabled = false; }
    });

    // download one part with the login's token (the file is a gzip of JSON)
    async function download(kind, stem, part) {
        say('Preparing the download…');
        try {
            const s = getSession();
            const res = await fetch(`${apiBase()}/api/backups/download?kind=${encodeURIComponent(kind)}&stem=${encodeURIComponent(stem)}&part=${encodeURIComponent(part)}`, { headers: { Authorization: 'Bearer ' + s.token } });
            if (!res.ok) throw new UserError((await res.json().catch(() => ({}))).error || 'Could not download.');
            const a = document.createElement('a');
            a.href = URL.createObjectURL(await res.blob());
            a.download = `pms-${stem}-${part}.json.gz`;
            document.body.appendChild(a); a.click(); a.remove();
            setTimeout(() => URL.revokeObjectURL(a.href), 4000);
            say('');
        } catch (e) { say(e instanceof UserError ? e.message : 'Could not download.', true); }
    }

    $('bkList').addEventListener('click', (e) => {
        const d = e.target.closest('[data-dl]');
        if (d) { const [k, st, part] = d.dataset.dl.split('|'); download(k, st, part); return; }
        const p = e.target.closest('[data-pick]');
        if (p) { $('bkPick').value = p.dataset.pick; $('bkQ').focus(); $('bkFind').scrollIntoView({ block: 'center' }); }
    });

    /* ----------------------- find a slip in a backup ----------------------- */
    let LAST = null;
    async function find() {
        const [kind, stem] = $('bkPick').value.split('|');
        const q = $('bkQ').value.trim();
        if (!stem) { $('bkResult').innerHTML = '<p class="bk-none">Pick a backup first.</p>'; return; }
        if (!q) { $('bkResult').innerHTML = '<p class="bk-none">Type an SH number (or # and a slip id).</p>'; return; }
        const arg = q.startsWith('#') ? `id=${encodeURIComponent(q.slice(1))}` : `sh=${encodeURIComponent(q)}`;
        $('bkResult').innerHTML = '<p class="bk-none">Looking…</p>';
        try {
            const r = await ctx.guard(request('GET', `/api/backups/slip?kind=${kind}&stem=${encodeURIComponent(stem)}&${arg}`));
            LAST = { kind, stem };
            $('bkResult').innerHTML = r.matches.length ? r.matches.map(m => hit(m, r.at)).join('') : `<p class="bk-none">No slip with that SH was in the backup of ${esc(when(r.at))}.</p>`;
        } catch (e) { $('bkResult').innerHTML = `<p class="bk-warn">${esc(e instanceof UserError ? e.message : 'Could not look in the backup.')}</p>`; }
    }
    function hit(m, at) {
        const d = m.data, live = m.live;
        const diff = live ? changes(d, live.data) : null;           // what restoring changes: now → then
        const can = live && (live.deleted || (diff && diff.length));
        const chips = diff && diff.length ? `<div class="bk-chgs">${diff.slice(0, 14).map(c => `<span class="bk-chg"><b>${esc(c.l)}</b> ${esc(c.from)} → ${esc(c.to)}</span>`).join('')}</div>` : '';
        return `<div class="bk-hit${live && live.deleted ? ' gone' : ''}">
            <h3>SH ${esc(m.sh_no || '—')} <small>· ${esc(m.site)} · slip #${esc(m.id)} · ${esc(d.building || 'no building')} · ${esc(d.checkin_date || '')} → ${esc(d.checkout_date || '')} (as in the backup of ${esc(when(at))})</small></h3>
            ${!live ? '<p class="bk-warn">This slip no longer exists in the database, so it cannot be restored here.</p>'
                : live.deleted ? '<p class="bk-warn">This slip is DELETED now — restoring brings it back.</p>' : ''}
            ${chips}${live && !live.deleted && diff && !diff.length ? '<p class="bk-same">Same as now — nothing to restore.</p>' : ''}
            ${can ? `<button type="button" class="bk-btn main" data-restore="${esc(m.id)}" data-sh="${esc(m.sh_no || '')}">Restore this state as a new version</button>
                <a class="bk-link" href="${esc(ctx.href('slip', { sh_no: m.sh_no || '' }))}">open the slip</a>` : ''}
        </div>`;
    }
    $('bkFind').addEventListener('submit', (e) => { e.preventDefault(); find(); });
    $('bkResult').addEventListener('click', async (e) => {
        const b = e.target.closest('[data-restore]');
        if (!b || !LAST) return;
        if (!confirm(`Restore SH ${b.dataset.sh} (slip #${b.dataset.restore}) to how it was in this backup?\n\nIt is saved as a NEW version in the slip's History — nothing is lost, and you can make any other version the version in use again.`)) return;
        b.disabled = true;
        try {
            await ctx.guard(request('POST', '/api/backups/restore-slip', { kind: LAST.kind, stem: LAST.stem, slip_id: Number(b.dataset.restore) }));
            say(`SH ${b.dataset.sh} restored ✓ — see its History on the Slip page.`);
            await find();
        } catch (err) { say(err instanceof UserError ? err.message : 'Could not restore.', true); b.disabled = false; }
    });

    await load();
}
