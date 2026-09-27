// Setup: this desk's login and sync, one-time upload of the browser's old data, and (admin)
// desk logins + audit log.

import { SITES } from '../../config.js';
import { currentDesk, request, sync, state, apiBase, UserError } from '../../core/cloud.js';
import { legacyAllSlips, legacySiteOf } from '../../core/db.js';

export default async function mount() {
    const $ = (id) => document.getElementById(id);
    const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const when = (iso) => iso ? new Date(iso).toLocaleString([], { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—';
    const me = currentDesk();
    const isAdmin = me.role === 'admin';
    const label = (s) => SITES[s]?.label || s;

    /* ------------------------------- this desk ------------------------------- */

    function renderMe() {
        const rights = me.role === 'admin' ? 'change both sites, manage desks'
            : me.role === 'desk' ? `change ${label(me.site)} slips, view ${Object.keys(SITES).filter(s => s !== me.site).map(label).join(', ')}`
            : 'view only';
        $('me').innerHTML = `
            <dt>Desk</dt><dd>${esc(me.name)}</dd>
            <dt>Site</dt><dd>${esc(label(me.site))}</dd>
            <dt>Role</dt><dd>${esc(me.role)} <span class="muted">(${esc(rights)})</span></dd>
            <dt>Server</dt><dd class="small">${esc(apiBase())}</dd>
            <dt>Connection</dt><dd>${state.online ? 'online' : '<span class="bad">offline — saving is paused</span>'}</dd>
            <dt>Last sync</dt><dd>${state.lastSync ? new Date(state.lastSync).toLocaleTimeString() : '—'}</dd>`;
    }
    renderMe();
    window.addEventListener('pms:sync', renderMe);
    $('btnSync').addEventListener('click', async () => {
        $('syncMsg').textContent = 'Syncing…';
        try { await sync({ force: true }); $('syncMsg').textContent = 'Up to date.'; }
        catch (e) { $('syncMsg').textContent = e.message; }
    });

    /* ------------------------- upload old browser data ------------------------- */

    const deviceId = (() => {
        try {
            let id = localStorage.getItem('pms_device_id');
            if (!id) { id = crypto.randomUUID().slice(0, 8); localStorage.setItem('pms_device_id', id); }
            return id;
        } catch { return 'dev'; }
    })();

    let legacy = [];
    async function renderLegacy() {
        legacy = await legacyAllSlips().catch(() => []);
        $('migrateCard').hidden = !legacy.length;
        if (!legacy.length) return;
        const bySite = {};
        let noBld = 0;
        for (const r of legacy) { const s = legacySiteOf(r); if (s) bySite[s] = (bySite[s] || 0) + 1; else noBld++; }
        const writable = (s) => isAdmin || (me.role === 'desk' && s === me.site);
        $('legacyPills').innerHTML = [
            `<span class="pill">${legacy.length} slip(s) in this browser</span>`,
            ...Object.entries(bySite).map(([s, n]) => `<span class="pill ${writable(s) ? 'ok' : 'warn'}">${n} ${esc(label(s))}${writable(s) ? '' : ' — upload these from a ' + esc(label(s)) + ' desk'}</span>`),
            noBld ? `<span class="pill">${noBld} with no building</span>` : '',
        ].join('');
        $('noBldRow').hidden = !noBld || me.role !== 'desk' && !isAdmin;
        $('noBldCount').textContent = noBld;
        $('noBldSite').textContent = label(me.site);
        $('btnMigrate').disabled = me.role === 'viewer';
    }
    await renderLegacy();

    $('btnMigrate').addEventListener('click', async () => {
        const includeNoBld = $('includeNoBld').checked;
        const items = [];
        for (const r of legacy) {
            const site = legacySiteOf(r) || (includeNoBld ? me.site : null);
            if (!site || !(isAdmin || site === me.site)) continue;
            const { id, ...slip } = r;
            items.push({ site, origin: `${deviceId}:${id}`, slip });
        }
        if (!items.length) { $('migrateMsg').textContent = 'Nothing this desk may upload.'; return; }
        if (!confirm(`Upload ${items.length} slip(s) to the cloud?`)) return;
        $('btnMigrate').disabled = true;
        let created = 0, skipped = 0;
        try {
            for (let i = 0; i < items.length; i += 45) {
                const r = await request('POST', '/api/slips/migrate', { slips: items.slice(i, i + 45) });
                created += r.created; skipped += r.skipped;
                $('migrateMsg').textContent = `Uploading… ${Math.min(i + 45, items.length)}/${items.length}`;
            }
            await sync({ force: true });
            $('migrateMsg').textContent = `Done: ${created} uploaded${skipped ? `, ${skipped} were already there` : ''}.`;
        } catch (e) {
            $('migrateMsg').textContent = (e instanceof UserError ? e.message : 'Upload failed.') + ` (${created} uploaded before the error — press Upload again to continue.)`;
        } finally {
            $('btnMigrate').disabled = false;
        }
    });

    /* ------------------------------ admin: desks ------------------------------ */

    if (!isAdmin) return;
    $('desksCard').hidden = false;
    $('auditCard').hidden = false;
    $('ndSite').innerHTML = Object.values(SITES).map(s => `<option value="${s.id}">${esc(s.label)}</option>`).join('');
    $('ndSite').value = me.site;

    function renderDesks(desks) {
        $('desksTbl').querySelector('tbody').innerHTML = desks.map(d => `
            <tr class="${d.disabled ? 'off' : ''}" data-id="${d.id}">
                <td>${esc(d.name)}${d.id === me.id ? ' <span class="pill">you</span>' : ''}</td>
                <td>${esc(label(d.site))}</td>
                <td><select data-act="role" ${d.id === me.id ? 'disabled' : ''}>${['desk', 'viewer', 'admin'].map(r => `<option ${r === d.role ? 'selected' : ''}>${r}</option>`).join('')}</select></td>
                <td>${d.disabled ? '<span class="pill bad">disabled</span>' : '<span class="pill ok">active</span>'}</td>
                <td class="nowrap">${when(d.last_login)}</td>
                <td><div class="row-actions">
                    <button type="button" data-act="password">Reset password</button>
                    ${d.id === me.id ? '' : `<button type="button" data-act="toggle">${d.disabled ? 'Enable' : 'Disable'}</button>`}
                </div></td>
            </tr>`).join('');
    }

    async function patchDesk(id, change, done) {
        try { renderDesks((await request('PATCH', `/api/desks/${id}`, change)).desks); $('deskMsg').textContent = done; renderAudit(); }
        catch (e) { $('deskMsg').textContent = e.message; loadDesks(); }
    }

    $('desksTbl').addEventListener('click', (e) => {
        const btn = e.target.closest('button[data-act]');
        if (!btn) return;
        const tr = btn.closest('tr'); const id = Number(tr.dataset.id); const name = tr.children[0].textContent.replace(' you', '');
        if (btn.dataset.act === 'password') {
            const pw = prompt(`New password for ${name} (8+ characters). They will be logged out on every computer.`);
            if (pw) patchDesk(id, { password: pw }, `Password of ${name} changed.`);
        }
        if (btn.dataset.act === 'toggle') {
            const disable = btn.textContent === 'Disable';
            if (!disable || confirm(`Disable ${name}? It is logged out everywhere and cannot log in until enabled.`)) patchDesk(id, { disabled: disable }, `${name} ${disable ? 'disabled' : 'enabled'}.`);
        }
    });
    $('desksTbl').addEventListener('change', (e) => {
        const sel = e.target.closest('select[data-act="role"]');
        if (sel) patchDesk(Number(sel.closest('tr').dataset.id), { role: sel.value }, 'Role changed; that desk was logged out.');
    });

    $('newDesk').addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
            const r = await request('POST', '/api/desks', { name: $('ndName').value.trim(), site: $('ndSite').value, role: $('ndRole').value, password: $('ndPass').value });
            renderDesks(r.desks);
            $('deskMsg').textContent = `Desk “${$('ndName').value.trim()}” added. Give its password to that desk.`;
            $('ndName').value = ''; $('ndPass').value = '';
            renderAudit();
        } catch (err) { $('deskMsg').textContent = err.message; }
    });

    async function loadDesks() {
        try { renderDesks((await request('GET', '/api/desks')).desks); }
        catch (e) { $('deskMsg').textContent = e.message; }
    }

    async function renderAudit() {
        try {
            const { audit } = await request('GET', '/api/audit?limit=100');
            $('auditTbl').querySelector('tbody').innerHTML = audit.map(a => `<tr>
                <td class="nowrap">${when(a.at)}</td><td>${esc(a.desk || '—')}</td><td>${esc(a.action)}</td>
                <td>${a.slip_id ?? ''}</td><td class="small">${esc(a.detail || '')}</td></tr>`).join('')
                || '<tr class="empty"><td colspan="5">Nothing yet.</td></tr>';
        } catch (e) { /* offline: leave as is */ }
    }

    await Promise.all([loadDesks(), renderAudit()]);
}
