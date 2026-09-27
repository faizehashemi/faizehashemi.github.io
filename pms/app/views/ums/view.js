// UMS Import: load a Group List export (file or Chrome extension), review, apply to this site.

import { parseUms, planImport, summarize, readLog, lastApplied } from '../../core/ums.js';
import { ext, askExtension, getAutoSite, setAutoSite, runImport } from '../../core/ums-auto.js';

export default async function mount(ctx) {
    const { db, site, siteId } = ctx;
    const $ = (id) => document.getElementById(id);
    const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const dmy = (d) => d ? d.split('-').reverse().join('/') : '';
    const stay = (r) => `${dmy(r.checkin_date)} ${r.checkin_time || ''} → ${dmy(r.checkout_date)} ${r.checkout_time || ''}`;
    const when = (iso) => iso ? new Date(iso).toLocaleString([], { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '';

    document.querySelectorAll('.siteName').forEach(el => { el.textContent = site.label; });

    let loaded = null;   // { html, fileName, via, fetchedAt }
    let plan = null;
    let tab = 'create';

    /* ---------------------------- load a file ---------------------------- */

    async function load(file) {
        loaded = file;
        $('applyStatus').textContent = '';
        const parsed = parseUms(file.html);
        renderCheck(parsed, file);
        if (parsed.fatal) { $('planCard').hidden = true; plan = null; return; }
        plan = planImport(parsed, await db.all(), siteId);
        loaded.parsed = parsed;
        renderCheckPlan(parsed);
        tab = plan.create.length ? 'create' : plan.update.length ? 'update' : 'missing';
        renderPlan();
    }

    function renderCheck(parsed, file) {
        $('checkCard').hidden = false;
        $('fatal').hidden = !parsed.fatal;
        $('fatal').textContent = parsed.fatal || '';
        const prev = lastApplied(siteId);
        $('checkPills').innerHTML = [
            `<span class="pill">${esc(file.fileName || 'file')} ${file.fetchedAt ? '· fetched ' + when(file.fetchedAt) : ''}</span>`,
            `<span class="pill ${parsed.fatal ? 'bad' : 'ok'}">${parsed.rowCount} group rows</span>`,
            parsed.errors.length ? `<span class="pill bad">${parsed.errors.length} unreadable</span>` : '',
            prev ? `<span class="pill">last import: ${prev.rows} rows · ${when(prev.at)}</span>` : '',
        ].join('');
        const issues = [...parsed.errors, ...parsed.warnings];
        $('warnBox').hidden = !issues.length;
        $('warnSum').textContent = `${issues.length} note(s) about the file`;
        $('warnList').innerHTML = issues.map(w => `<li>${esc(w)}</li>`).join('');
    }

    function renderCheckPlan(parsed) {
        const s = summarize(plan);
        $('checkPills').insertAdjacentHTML('beforeend',
            `<span class="pill">${s.groups} groups stay in ${esc(site.label)} (${s.stays} stays)</span>` +
            `<span class="pill">${plan.otherSiteStays} stays elsewhere — not imported here</span>`);
        const issues = [...parsed.errors, ...parsed.warnings, ...plan.warnings];
        $('warnBox').hidden = !issues.length;
        $('warnSum').textContent = `${issues.length} note(s) about the file`;
        $('warnList').innerHTML = issues.map(w => `<li>${esc(w)}</li>`).join('');
    }

    /* ----------------------------- review plan ----------------------------- */

    const TABS = [
        ['create', 'New', () => plan.create],
        ['update', 'Updated', () => plan.update.filter(u => !u.relinkOnly)],
        ['attention', 'Needs attention', () => plan.update.filter(u => u.notes.length)],
        ['kept', 'Your edits kept', () => plan.kept],
        ['relink', 'Linked, no change', () => plan.update.filter(u => u.relinkOnly)],
        ['missing', 'Not in this export', () => plan.missing],
    ];

    function renderPlan() {
        $('planCard').hidden = false;
        $('tabs').innerHTML = TABS.map(([id, label, rows]) =>
            `<button type="button" role="tab" data-tab="${id}" aria-selected="${id === tab}">${label} <span class="n">${rows().length}</span></button>`).join('')
            + `<span class="pill">${plan.unchanged} unchanged</span>`;
        $('tabs').querySelectorAll('button').forEach(b => b.addEventListener('click', () => { tab = b.dataset.tab; renderPlan(); }));

        const rows = TABS.find(t => t[0] === tab)[2]();
        const thead = $('planTbl').querySelector('thead');
        const tbody = $('planTbl').querySelector('tbody');
        const pax = (r) => `${r.total ?? ''} <span class="muted small">(${r.gents ?? 0}/${r.ladies ?? 0}/${r.children ?? 0}/${r.infants ?? 0})</span>`;

        if (tab === 'create') {
            thead.innerHTML = '<tr><th>SH</th><th>Group</th><th>Leader</th><th>Stay</th><th>Pax (G/L/C/I)</th><th>Itinerary</th><th>Country</th></tr>';
            tbody.innerHTML = rows.map(({ rec }) => `<tr>
                <td>${esc(rec.sh_no)}</td><td>${esc(rec.tour_name)}${rec.ums.family ? ' <span class="pill">family</span>' : ''}</td>
                <td>${esc(rec.group_leader)}</td><td class="nowrap">${stay(rec)}</td><td class="nowrap">${pax(rec)}</td>
                <td class="nowrap">${esc(rec.ums.itinerary)} #${rec.ums.seg}</td><td>${esc(rec.ums.country)}</td></tr>`).join('');
        } else if (tab === 'kept') {
            thead.innerHTML = '<tr><th>SH</th><th>Group</th><th>Stay</th><th>Kept (yours → UMS says)</th></tr>';
            tbody.innerHTML = rows.map(({ slip, kept }) => `<tr>
                <td>${esc(slip.sh_no)}</td><td>${esc(slip.tour_name)}</td><td class="nowrap">${stay(slip)}</td>
                <td>${Object.entries(kept).map(([f, k]) => `<span class="chg"><b>${f}</b>: ${esc(k.yours)} <span class="muted">(UMS: ${esc(k.ums)})</span></span>`).join('')}</td></tr>`).join('');
        } else if (tab === 'missing') {
            thead.innerHTML = '<tr><th>SH</th><th>Group</th><th>Stay</th><th>Building</th><th>Last imported</th></tr>';
            tbody.innerHTML = rows.map(s => `<tr>
                <td>${esc(s.sh_no)}</td><td>${esc(s.tour_name)}</td><td class="nowrap">${stay(s)}</td>
                <td>${esc(s.building || '—')}</td><td class="nowrap">${when(s.ums?.importedAt)}</td></tr>`).join('');
        } else {
            thead.innerHTML = '<tr><th>SH</th><th>Group</th><th>Building</th><th>Stay (new)</th><th>Changes</th></tr>';
            tbody.innerHTML = rows.map(u => `<tr>
                <td>${esc(u.rec.sh_no)}</td><td>${esc(u.rec.tour_name)}</td><td>${esc(u.rec.building || '—')}</td>
                <td class="nowrap">${stay(u.rec)}</td>
                <td>${Object.entries(u.changes).map(([f, c]) => `<span class="chg"><b>${f}</b>: <span class="from">${esc(c.from)}</span> → ${esc(c.to)}</span>`).join('')
                    || '<span class="muted">linked to UMS stay ' + esc(u.key) + '</span>'}
                    ${u.notes.map(n => `<span class="note">⚠ ${esc(n)}</span>`).join('')}</td></tr>`).join('');
        }
        if (!rows.length) tbody.innerHTML = `<tr class="empty"><td colspan="7">Nothing here.</td></tr>`;

        const s = summarize(plan);
        const nothing = !s.created && !s.updated && !s.relinked;
        $('btnApply').disabled = db.readonly || nothing;
        $('btnApply').textContent = nothing ? 'Nothing to apply' : `Apply: ${s.created} new, ${s.updated} updated${s.relinked ? `, ${s.relinked} linked` : ''}`;
        if (db.readonly) $('applyStatus').textContent = db.readonlyReason;
    }

    $('btnApply').addEventListener('click', async () => {
        if (!plan || !loaded) return;
        const s = summarize(plan);
        if (s.attention && !confirm(`${s.attention} slip(s) need attention (rooms assigned, or your edits replaced). Apply anyway?`)) return;
        $('btnApply').disabled = true;
        $('applyStatus').textContent = 'Applying…';
        try {
            // Re-plan against current data inside the import lock, in case something changed meanwhile.
            const res = await runImport({ siteId, html: loaded.html, fileName: loaded.fileName, fetchedAt: loaded.fetchedAt, via: loaded.via, force: true });
            if (res.error) throw new Error(res.error);
            const r = res.summary;
            $('applyStatus').textContent = `Done: ${r.created} new, ${r.updated} updated${r.relinked ? `, ${r.relinked} linked` : ''}. Every desk sees it now.`;
            renderLog();
            await load(loaded); // show the (now empty) remaining diff
            $('applyStatus').textContent = `Done: ${r.created} new, ${r.updated} updated${r.relinked ? `, ${r.relinked} linked` : ''}. Every desk sees it now.`;
        } catch (e) {
            console.error(e);
            $('applyStatus').textContent = 'Import failed: ' + (e.message || e);
            $('btnApply').disabled = false;
        }
    });

    /* ----------------------------- file input ----------------------------- */

    async function fromFile(f) {
        if (!f) return;
        await load({ html: await f.text(), fileName: f.name, via: 'file', fetchedAt: null });
    }
    $('file').addEventListener('change', (e) => { fromFile(e.target.files[0]); e.target.value = ''; });
    const drop = $('drop');
    drop.addEventListener('dragover', (e) => { e.preventDefault(); drop.classList.add('over'); });
    drop.addEventListener('dragleave', () => drop.classList.remove('over'));
    drop.addEventListener('drop', (e) => { e.preventDefault(); drop.classList.remove('over'); fromFile(e.dataTransfer.files[0]); });

    /* ------------------------------ extension ------------------------------ */

    function renderExt() {
        $('extState').textContent = ext.connected ? `connected${ext.version ? ' · v' + ext.version : ''}` : 'not detected';
        $('extState').className = 'pill ' + (ext.connected ? 'ok' : '');
        $('btnFetchNow').hidden = !ext.connected;
        $('btnUseLatest').hidden = !ext.latestFile;
        const st = ext.lastStatus;
        const bits = [];
        if (ext.latestFile) bits.push(`Latest file: fetched ${when(ext.latestFile.fetchedAt)}.`);
        if (st) bits.push(st.ok ? `Last fetch OK · ${when(st.at)}.` : `Last fetch failed · ${when(st.at)}: ${st.error}`);
        if (!ext.connected) bits.push('Install the extension from the extension/ folder (see its README) to fetch the Group List every hour.');
        $('extInfo').textContent = bits.join(' ');
    }
    $('btnFetchNow').addEventListener('click', () => { askExtension('fetch-now'); $('extInfo').textContent = 'Asked the extension to fetch from UMS…'; });
    $('btnUseLatest').addEventListener('click', () => ext.latestFile && load({ ...ext.latestFile, via: 'extension' }));
    window.addEventListener('pms:ums-ext', renderExt);
    window.addEventListener('pms:ums-status', renderExt);
    window.addEventListener('pms:ums-file', renderExt);
    window.addEventListener('pms:ums-applied', (e) => { if (e.detail?.siteId === siteId) { renderLog(); renderAuto(); } });
    renderExt();
    askExtension('get-latest');

    /* --------------------------- auto-import toggle --------------------------- */

    function renderAuto() {
        const auto = getAutoSite();
        $('autoToggle').checked = auto === siteId;
        $('autoToggle').disabled = db.readonly;
        const prev = lastApplied(siteId);
        $('autoNote').textContent = [
            auto && auto !== siteId ? `This device auto-imports for ${auto} — turning this on switches it to ${site.label}.` : '',
            'Keep one PMS tab open on this computer; the extension delivers each new file to it. Only this site is imported, and files that look incomplete are held for review.',
            prev ? `Last applied import: ${when(prev.at)} (${prev.rows} rows).` : '',
        ].filter(Boolean).join(' ');
    }
    $('autoToggle').addEventListener('change', (e) => { setAutoSite(e.target.checked ? siteId : ''); renderAuto(); });
    renderAuto();

    /* -------------------------------- history -------------------------------- */

    function renderLog() {
        const log = readLog(siteId);
        const tb = $('logTbl').querySelector('tbody');
        tb.innerHTML = log.length ? log.map(l => `<tr>
            <td class="nowrap">${when(l.at)}</td><td>${esc(l.via)}</td>
            <td><span class="pill ${l.result === 'applied' ? 'ok' : l.result === 'held' ? 'warn' : 'bad'}">${esc(l.result)}</span></td>
            <td>${l.rows ?? ''}</td><td>${l.created ?? ''}</td><td>${l.updated ?? ''}</td><td>${l.attention ?? ''}</td><td>${l.missing ?? ''}</td>
            <td class="small">${esc(l.error || (l.warnings ? l.warnings + ' note(s)' : ''))}</td></tr>`).join('')
            : '<tr class="empty"><td colspan="9">No imports yet.</td></tr>';
    }
    renderLog();
}
