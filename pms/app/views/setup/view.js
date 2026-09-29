// Setup: this desk's login and sync, one-time upload of the browser's old data, and (admin)
// desk logins + audit log.

import { SITES, VIEWS, NAV } from '../../config.js';
import { currentDesk, request, sync, state, apiBase, UserError, ALWAYS_OPEN } from '../../core/cloud.js';
import { legacyAllSlips, legacySiteOf } from '../../core/db.js';
import { loadSettings, saveSettings, shiftTime } from '../../core/settings.js';

export default async function mount(ctx) {
    const $ = (id) => document.getElementById(id);
    const say = (id, text) => { const el = $(id); if (el) el.textContent = text; }; // safe after leaving the page
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

    /* ------------------------------- travel times ------------------------------- */

    const fmtDT = (d, t) => `${new Date(d + 'T00:00').toLocaleDateString([], { day: '2-digit', month: 'short' })} ${t}`;
    function renderTravelExample() {
        const a = Number($('tArrive').value) || 0, dep = Number($('tDepart').value) || 0;
        const land = shiftTime('2026-11-25', '23:00', a), out = shiftTime('2026-12-01', '04:30', -dep);
        $('tExample').innerHTML = `
            <div>Flight lands <b>${fmtDT('2026-11-25', '23:00')}</b> → hotel check-in <b>${fmtDT(land.date, land.time)}</b></div>
            <div>Flight departs <b>${fmtDT('2026-12-01', '04:30')}</b> → hotel check-out <b>${fmtDT(out.date, out.time)}</b></div>
            <div>Makkah ⇄ Madina on the day of the move: check-out <b>${esc($('tOut').value)}</b>, check-in <b>${esc($('tIn').value)}</b></div>`;
    }
    async function renderTravel() {
        const s = await ctx.guard(loadSettings());
        $('tArrive').value = s.settings.arrival_commute_hours;
        $('tDepart').value = s.settings.departure_lead_hours;
        $('tIn').value = s.settings.transfer_checkin_time;
        $('tOut').value = s.settings.transfer_checkout_time;
        $('travelMsg').textContent = s.updated_at ? `Last changed by ${s.updated_by || '—'}, ${when(s.updated_at)}` : 'Using the default times.';
        $('travelCard').querySelectorAll('input').forEach(i => { i.disabled = !isAdmin; });
        $('btnTravel').hidden = !isAdmin;
        if (!isAdmin) $('travelMsg').textContent += ' Only an admin can change these.';
        renderTravelExample();
    }
    $('travelForm').addEventListener('input', renderTravelExample);
    $('travelForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        $('btnTravel').disabled = true;
        try {
            await saveSettings({
                arrival_commute_hours: Number($('tArrive').value),
                departure_lead_hours: Number($('tDepart').value),
                transfer_checkin_time: $('tIn').value,
                transfer_checkout_time: $('tOut').value,
            });
            await renderTravel();
            $('travelMsg').textContent = 'Saved for every desk. Imported slips get the new times at the next UMS import (desk edits are kept).';
        } catch (err) {
            $('travelMsg').textContent = err.status === 404 ? 'The PMS server needs the update (worker.js + schema.sql) before this can be saved.' : (err.message || String(err));
        } finally { $('btnTravel').disabled = false; }
    });
    await renderTravel();

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
        legacy = await ctx.guard(legacyAllSlips().catch(() => []));
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
                say('migrateMsg', `Uploading… ${Math.min(i + 45, items.length)}/${items.length}`);
            }
            await sync({ force: true });
            say('migrateMsg', `Done: ${created} uploaded${skipped ? `, ${skipped} were already there` : ''}.`);
        } catch (e) {
            say('migrateMsg', (e instanceof UserError ? e.message : 'Upload failed.') + ` (${created} uploaded before the error — press Upload again to continue.)`);
        } finally {
            if ($('btnMigrate')) $('btnMigrate').disabled = false;
        }
    });

    /* ------------------------------ admin: desks ------------------------------ */

    if (!isAdmin) return;
    $('desksCard').hidden = false;
    $('auditCard').hidden = false;
    $('accessCard').hidden = false;
    $('ndSite').innerHTML = Object.values(SITES).map(s => `<option value="${s.id}">${esc(s.label)}</option>`).join('');
    $('ndSite').value = me.site;

    function renderDesks(desks) {
        renderAccess(desks);
        $('desksTbl').querySelector('tbody').innerHTML = desks.map(d => `
            <tr class="${d.disabled ? 'off' : ''}" data-id="${d.id}">
                <td>${esc(d.name)}${d.id === me.id ? ' <span class="pill">you</span>' : ''}</td>
                <td>${esc(label(d.site))}</td>
                <td><select data-act="role" ${d.id === me.id ? 'disabled' : ''}>${['desk', 'viewer', 'admin'].map(r => `<option ${r === d.role ? 'selected' : ''}>${r}</option>`).join('')}</select></td>
                <td>${d.disabled ? '<span class="pill bad">disabled</span>' : '<span class="pill ok">active</span>'}</td>
                <td class="nowrap">${when(d.last_login)}</td>
                <td><div class="row-actions">
                    <button type="button" data-act="password">Reset password</button>
                    ${d.id === me.id ? '' : `<button type="button" data-act="toggle">${d.disabled ? 'Enable' : 'Disable'}</button>
                    <button type="button" data-act="delete" class="danger" title="Remove this login for good">Delete</button>`}
                </div></td>
            </tr>`).join('');
    }

    async function deleteDesk(id, name) {
        try { renderDesks((await ctx.guard(request('DELETE', `/api/desks/${id}`))).desks); $('deskMsg').textContent = `Login “${name}” deleted.`; renderAudit(); }
        catch (e) { $('deskMsg').textContent = e?.status === 404 || e?.status === 405 ? 'The server does not support deleting logins yet (Worker not updated).' : e.message; loadDesks(); }
    }

    async function patchDesk(id, change, done) {
        try { renderDesks((await ctx.guard(request('PATCH', `/api/desks/${id}`, change))).desks); $('deskMsg').textContent = done; renderAudit(); }
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
        if (btn.dataset.act === 'delete') {
            if (!confirm(`Delete the login “${name}” for good?

It is logged out everywhere and can never log in again. Its page access and personal settings are removed. Slips and the change log are kept (the log shows it as “${name} (deleted)”).

To stop it only for now, use Disable instead.`)) return;
            deleteDesk(id, name);
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
            const r = await ctx.guard(request('POST', '/api/desks', { name: $('ndName').value.trim(), site: $('ndSite').value, role: $('ndRole').value, password: $('ndPass').value }));
            renderDesks(r.desks);
            $('deskMsg').textContent = `Desk “${$('ndName').value.trim()}” added. Give its password to that desk.`;
            $('ndName').value = ''; $('ndPass').value = '';
            renderAudit();
        } catch (err) { $('deskMsg').textContent = err.message; }
    });

    async function loadDesks() {
        try { renderDesks((await ctx.guard(request('GET', '/api/desks'))).desks); }
        catch (e) { $('deskMsg').textContent = e.message; }
    }

    /* --------------------------- admin: page access --------------------------- */

    // pages an admin can give or take (Home, Login and Settings are always open)
    const ACCESS_GROUPS = [{ label: 'Start', views: ['home'] }, ...NAV.map(c => ({ label: c.label, views: c.views.filter(id => !ALWAYS_OPEN.includes(id)) }))].filter(g => g.views.length);
    const ALL_PAGES = ACCESS_GROUPS.flatMap(g => g.views);
    const pageLabel = (id) => VIEWS.find(v => v.id === id)?.label || id;
    let accessDesks = [];            // non-admin desks shown as columns
    let access = new Map();          // desk id -> Set of page ids (edited copy)
    let saved = new Map();           // desk id -> Set as on the server
    const sameSet = (a, b) => [...a].sort().join() === [...b].sort().join();
    const dirtyIds = () => accessDesks.filter(d => !sameSet(access.get(d.id), saved.get(d.id))).map(d => d.id);

    function renderAccess(desks, force = false) {
        if (!force && dirtyIds().length) return; // keep unsaved ticks when the desk list refreshes
        accessDesks = desks.filter(d => d.role !== 'admin');
        saved = new Map(accessDesks.map(d => [d.id, new Set(Array.isArray(d.pages) ? d.pages.filter(p => ALL_PAGES.includes(p)) : ALL_PAGES)]));
        access = new Map([...saved].map(([id, set]) => [id, new Set(set)]));
        drawAccess();
    }

    function drawAccess() {
        const tbl = $('accessTbl');
        if (!accessDesks.length) {
            tbl.querySelector('thead').innerHTML = '';
            tbl.querySelector('tbody').innerHTML = '<tr class="empty"><td>No desk or viewer logins yet. Admins always see every page.</td></tr>';
            updateAccessButtons();
            return;
        }
        tbl.querySelector('thead').innerHTML = `<tr><th class="pg">Page</th>${accessDesks.map(d => `
            <th class="dk ${d.disabled ? 'off' : ''}" data-id="${d.id}"><span class="dk-n">${esc(d.name)}</span>
                <span class="dk-s">${esc(label(d.site))} · ${esc(d.role)}</span>
                <span class="dk-b"><button type="button" data-all="${d.id}">All</button><button type="button" data-none="${d.id}">None</button></span></th>`).join('')}</tr>`;
        tbl.querySelector('tbody').innerHTML = ACCESS_GROUPS.map(g => `
            <tr class="grp"><th>${esc(g.label)}</th>${accessDesks.map(d => `<td><button type="button" class="linkish" data-grp="${esc(g.label)}" data-id="${d.id}">${g.views.every(v => access.get(d.id).has(v)) ? 'none' : 'all'}</button></td>`).join('')}</tr>
            ${g.views.map(v => `<tr><th class="pg">${esc(pageLabel(v))}</th>${accessDesks.map(d => {
                const on = access.get(d.id).has(v), was = saved.get(d.id).has(v);
                return `<td class="${on !== was ? 'chg' : ''}"><input type="checkbox" data-id="${d.id}" data-page="${v}" ${on ? 'checked' : ''} aria-label="${esc(d.name)}: ${esc(pageLabel(v))}"></td>`;
            }).join('')}</tr>`).join('')}`).join('');
        updateAccessButtons();
    }

    function updateAccessButtons() {
        const n = dirtyIds().length;
        $('btnAccess').disabled = !n;
        $('btnAccessUndo').disabled = !n;
        $('btnAccess').textContent = n ? `Save page access (${n} login${n === 1 ? '' : 's'})` : 'Save page access';
    }

    $('accessTbl').addEventListener('change', (e) => {
        const cb = e.target.closest('input[data-page]');
        if (!cb) return;
        const set = access.get(Number(cb.dataset.id));
        cb.checked ? set.add(cb.dataset.page) : set.delete(cb.dataset.page);
        drawAccess();
    });
    $('accessTbl').addEventListener('click', (e) => {
        const b = e.target.closest('button');
        if (!b) return;
        if (b.dataset.all) access.set(Number(b.dataset.all), new Set(ALL_PAGES));
        else if (b.dataset.none) access.set(Number(b.dataset.none), new Set());
        else if (b.dataset.grp) {
            const set = access.get(Number(b.dataset.id));
            const views = ACCESS_GROUPS.find(g => g.label === b.dataset.grp).views;
            const allOn = views.every(v => set.has(v));
            views.forEach(v => allOn ? set.delete(v) : set.add(v));
        } else return;
        drawAccess();
    });
    $('btnAccessUndo').addEventListener('click', () => { access = new Map([...saved].map(([id, set]) => [id, new Set(set)])); drawAccess(); $('accessMsg').textContent = ''; });
    $('btnAccess').addEventListener('click', async () => {
        const ids = dirtyIds();
        const empty = ids.filter(id => !access.get(id).size).map(id => accessDesks.find(d => d.id === id).name);
        if (empty.length && !confirm(`${empty.join(', ')} will see no page (only Settings). Save anyway?`)) return;
        $('btnAccess').disabled = true;
        $('accessMsg').textContent = 'Saving…';
        let desks = null;
        const failed = [];
        for (const id of ids) {
            const set = access.get(id);
            // every page ticked = no limit (pages added to the PMS later are open too)
            const pages = ALL_PAGES.every(p => set.has(p)) ? null : ALL_PAGES.filter(p => set.has(p));
            try { desks = (await ctx.guard(request('PATCH', `/api/desks/${id}`, { pages }))).desks; }
            catch (err) { failed.push(`${accessDesks.find(d => d.id === id).name}: ${err.message}`); }
        }
        if (desks) { renderAccess(desks, true); renderDesks(desks); renderAudit(); }
        $('accessMsg').textContent = failed.length ? `Not saved: ${failed.join('; ')}` : `Saved for ${ids.length} login${ids.length === 1 ? '' : 's'}. Their menus update within a minute.`;
        updateAccessButtons();
    });

    async function renderAudit() {
        try {
            const { audit } = await ctx.guard(request('GET', '/api/audit?limit=100'));
            $('auditTbl').querySelector('tbody').innerHTML = audit.map(a => `<tr>
                <td class="nowrap">${when(a.at)}</td><td>${esc(a.desk || '—')}</td><td>${esc(a.action)}</td>
                <td>${a.slip_id ?? ''}</td><td class="small">${esc(a.detail || '')}</td></tr>`).join('')
                || '<tr class="empty"><td colspan="5">Nothing yet.</td></tr>';
        } catch (e) { /* offline: leave as is */ }
    }

    await Promise.all([loadDesks(), renderAudit()]);
}
