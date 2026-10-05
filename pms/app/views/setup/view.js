// Setup: this desk's login and sync, one-time upload of the browser's old data, and (admin)
// desk logins + audit log.

import { SITES, VIEWS, NAV } from '../../config.js';
import { currentDesk, request, sync, state, apiBase, UserError, ALWAYS_OPEN } from '../../core/cloud.js';
import { legacyAllSlips, legacySiteOf } from '../../core/db.js';
import { loadSettings, saveSettings, shiftTime, DEFAULTS, to12h } from '../../core/settings.js';
import { loadBuildings } from '../../core/rooms.js';

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

    /* ------------------------------ KG event times ------------------------------ */
    let kg = [];
    function drawKg() {
        $('kgRows').innerHTML = kg.map((s, i) => `<div class="kg-row">
            <input data-kg="${i}" data-f="name" value="${esc(s.name)}" maxlength="60" placeholder="Event name" aria-label="Event name" ${isAdmin ? '' : 'disabled'}>
            <input data-kg="${i}" data-f="time" type="time" value="${esc(s.time)}" aria-label="Time" ${isAdmin ? '' : 'disabled'}>
            ${isAdmin ? `<button type="button" data-kgdel="${i}" aria-label="Remove ${esc(s.name)}" ${kg.length <= 1 ? 'disabled' : ''}>✕</button>` : `<span class="muted small">${esc(to12h(s.time))}</span>`}</div>`).join('');
        $('kgAdd').hidden = !isAdmin || kg.length >= 10;
        $('kgSave').hidden = !isAdmin;
    }
    async function renderKg() {
        const s = await ctx.guard(loadSettings());
        kg = (s.settings.kg_sessions || DEFAULTS.kg_sessions).map(x => ({ ...x }));
        drawKg();
        if (!isAdmin) $('kgMsg').textContent = 'Only an admin can change these.';
    }
    $('kgRows').addEventListener('input', (e) => { const el = e.target.closest('[data-kg]'); if (el) kg[Number(el.dataset.kg)][el.dataset.f] = el.value; });
    $('kgRows').addEventListener('click', (e) => { const b = e.target.closest('[data-kgdel]'); if (b && kg.length > 1) { kg.splice(Number(b.dataset.kgdel), 1); drawKg(); } });
    $('kgAdd').addEventListener('click', () => { if (kg.length < 10) { kg.push({ name: '', time: '12:00' }); drawKg(); $('kgRows').querySelector('.kg-row:last-child input')?.focus(); } });
    $('kgSave').addEventListener('click', async () => {
        const list = kg.map(x => ({ name: String(x.name || '').trim(), time: x.time })).filter(x => x.name);
        if (!list.length || list.some(x => !/^\d{2}:\d{2}$/.test(x.time || ''))) { $('kgMsg').textContent = 'Every event needs a name and a time.'; return; }
        $('kgSave').disabled = true;
        try { await ctx.guard(saveSettings({ kg_sessions: list })); await renderKg(); $('kgMsg').textContent = 'Saved — the KG page shows these events on every desk.'; }
        catch (err) { $('kgMsg').textContent = err.status === 400 ? err.message : (err.message || String(err)); }
        finally { $('kgSave').disabled = false; }
    });
    await renderKg();

    /* --------------------------- Fakkul Ehraam windows --------------------------- */
    const FE_IN = { morning_from: 'feMorningFrom', split: 'feSplit', night_to: 'feNightTo' };
    async function renderFe() {
        const s = await ctx.guard(loadSettings());
        const w = { ...DEFAULTS.fe_windows, ...(s.settings.fe_windows || {}) };
        for (const [k, id] of Object.entries(FE_IN)) { $(id).value = w[k]; $(id).disabled = !isAdmin; }
        $('feSave').hidden = !isAdmin;
        if (!isAdmin) $('feMsg').textContent = 'Only an admin can change these.';
    }
    $('feSave').addEventListener('click', async () => {
        const w = Object.fromEntries(Object.entries(FE_IN).map(([k, id]) => [k, $(id).value]));
        if (Object.values(w).some(v => !/^\d{2}:\d{2}$/.test(v || ''))) { $('feMsg').textContent = 'Fill in all three times.'; return; }
        if (w.split >= w.night_to) { $('feMsg').textContent = 'Night must end after it starts.'; return; }
        $('feSave').disabled = true;
        try { await ctx.guard(saveSettings({ fe_windows: w })); await renderFe(); $('feMsg').textContent = 'Saved — the Home page counts use these on every desk.'; }
        catch (err) { $('feMsg').textContent = err.status === 400 ? err.message : (err.message || String(err)); }
        finally { $('feSave').disabled = false; }
    });
    await renderFe();

    /* ------------------------------- SH prefixes ------------------------------- */
    let shp = [];
    function drawShp() {
        $('shpChips').innerHTML = shp.length
            ? shp.map((p, i) => `<span class="shp-chip"><b>${esc(p)}</b><small>${esc(p)}44030</small>${isAdmin ? `<button type="button" data-shpdel="${i}" aria-label="Remove ${esc(p)}">✕</button>` : ''}</span>`).join('')
            : '<span class="muted small">No prefixes — only plain numbers are accepted.</span>';
        for (const id of ['shpNew', 'shpAdd', 'shpSave']) $(id).hidden = !isAdmin;
    }
    async function renderShp() {
        const s = await ctx.guard(loadSettings());
        shp = [...(s.settings.sh_prefixes || DEFAULTS.sh_prefixes)];
        drawShp();
        if (!isAdmin) $('shpMsg').textContent = 'Only an admin can change these.';
    }
    function addShp() {
        const p = $('shpNew').value.trim().toUpperCase();
        if (!/^[A-Z]{1,4}$/.test(p)) { $('shpMsg').textContent = 'A prefix is 1–4 letters (A–Z).'; return; }
        if (shp.includes(p)) { $('shpMsg').textContent = `${p} is already there.`; return; }
        if (shp.length >= 20) { $('shpMsg').textContent = 'Up to 20 prefixes.'; return; }
        shp.push(p); $('shpNew').value = ''; drawShp();
        $('shpMsg').textContent = 'Press Save prefixes to keep it.';
    }
    $('shpAdd').addEventListener('click', addShp);
    $('shpNew').addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); addShp(); } });
    $('shpChips').addEventListener('click', (e) => {
        const b = e.target.closest('[data-shpdel]');
        if (!b) return;
        shp.splice(Number(b.dataset.shpdel), 1); drawShp();
        $('shpMsg').textContent = 'Press Save prefixes to keep the change.';
    });
    $('shpSave').addEventListener('click', async () => {
        $('shpSave').disabled = true;
        try { await ctx.guard(saveSettings({ sh_prefixes: shp })); await renderShp(); $('shpMsg').textContent = 'Saved — the Slip page accepts these on every desk.'; }
        catch (err) { $('shpMsg').textContent = err.status === 400 ? err.message : (err.message || String(err)); }
        finally { $('shpSave').disabled = false; }
    });
    await renderShp();

    /* ----------------------------- GL copy colours ----------------------------- */
    // one row per building in Rooms & Buildings (both cities), plus any colour saved for a name not there
    let glc = {};
    const HEX = /^#[0-9a-f]{6}$/i;
    function drawGlc() {
        const names = Object.keys(glc).sort((a, b) => a.localeCompare(b));
        $('glcRows').innerHTML = names.length ? names.map(n => `<div class="glc-row">
            <span class="glc-name">${esc(n)}${glcSite[n] ? ` <span class="muted small">${esc(label(glcSite[n]))}</span>` : ''}</span>
            <input type="color" data-glc="${esc(n)}" value="${esc(glc[n])}" aria-label="Colour for ${esc(n)}" ${isAdmin ? '' : 'disabled'}>
            <input type="text" data-glchex="${esc(n)}" value="${esc(glc[n])}" maxlength="7" spellcheck="false" aria-label="Hex colour for ${esc(n)}" ${isAdmin ? '' : 'disabled'}>
            <span class="glc-sample" style="--c:${esc(glc[n])}">SH 12345 · ${esc(n)}</span></div>`).join('')
            : '<p class="muted small">No buildings yet — add them in Rooms &amp; Buildings.</p>';
        $('glcSave').hidden = $('glcReset').hidden = !isAdmin;
    }
    let glcSite = {};
    async function renderGlc() {
        const [s, blds] = await Promise.all([ctx.guard(loadSettings()), ctx.guard(loadBuildings({ force: true })).catch(() => [])]);
        const saved = { ...DEFAULTS.gl_colors, ...(s.settings.gl_colors || {}) };
        glcSite = {};
        for (const b of blds) glcSite[b.name] = b.site;
        glc = {};
        for (const b of blds) glc[b.name] = saved[b.name] || '#000000';
        for (const [n, c] of Object.entries(s.settings.gl_colors || {})) if (!(n in glc)) glc[n] = c;
        drawGlc();
        if (!isAdmin) $('glcMsg').textContent = 'Only an admin can change these.';
    }
    $('glcRows').addEventListener('input', (e) => {
        const n = e.target.dataset.glc ?? e.target.dataset.glchex;
        if (n == null) return;
        const v = e.target.value.trim();
        if (!HEX.test(v)) return; // typing a hex: wait until it is complete
        glc[n] = v.toLowerCase();
        const row = e.target.closest('.glc-row');
        if (e.target.dataset.glc != null) row.querySelector('[data-glchex]').value = glc[n];
        else row.querySelector('[data-glc]').value = glc[n];
        row.querySelector('.glc-sample').style.setProperty('--c', glc[n]);
    });
    $('glcReset').addEventListener('click', () => {
        for (const n of Object.keys(glc)) glc[n] = DEFAULTS.gl_colors[n] || '#000000';
        drawGlc();
        $('glcMsg').textContent = 'Defaults shown — press Save colours to keep them.';
    });
    $('glcSave').addEventListener('click', async () => {
        const bad = Object.entries(glc).find(([, c]) => !HEX.test(c));
        if (bad) { $('glcMsg').textContent = `${bad[0]}: enter a colour like #e8590c.`; return; }
        $('glcSave').disabled = true;
        try { await ctx.guard(saveSettings({ gl_colors: glc })); await renderGlc(); $('glcMsg').textContent = 'Saved — GL copies print in these colours on every desk.'; }
        catch (err) { $('glcMsg').textContent = err.status === 400 ? err.message : (err.message || String(err)); }
        finally { $('glcSave').disabled = false; }
    });
    await renderGlc();

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
