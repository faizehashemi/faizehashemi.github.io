// KG — Fakkul Ehraam & Atraaf roster. The name list, FE1 bookmark and saved assignments are in the cloud, one
// roster per site (GET /api/kg, POST /api/kg/op, POST /api/kg/log, DELETE /api/kg/log/:id), so every desk of
// the site sees the same list and history. Ticks, bus numbers, the order and the message stay on this screen
// until saved.
//   Order: random by default (shuffled once per visit, new names land anywhere); A–Z, last activity, most /
//   least active, or fewest FE1 / FE2 / Atraaf first.
//   Atraaf: each new tick gets the next bus number (highest given so far + 1), editable per row; the message shows it.
import { request, canWrite, UserError } from '../../core/cloud.js';
import { loadSettings, DEFAULTS, to12h } from '../../core/settings.js';

const LOCATIONS = ['*MP FLOOR*', '*DH FLOOR*', '*UG FLOOR*', '*SNOOD HOTEL*', '*MIZAB HOTEL*', '*LG FLOOR*'];
const TYPES = ['FE1', 'FE2', 'Atraaf'];
// this browser's list from before the cloud (offered once for upload)
const LS_PEOPLE = 'umrah-atraaf-people-v2';
const LS_LOG = 'umrah-atraaf-log-v2';
const LS_FE1_BOOKMARK = 'umrah-fe1-bookmark-v1';

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const pad = (n) => String(n).padStart(2, '0');
const ymd = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const natural = (a, b) => a.localeCompare(b, undefined, { sensitivity: 'base', numeric: true });

export default async function mount(ctx) {
    const site = ctx.siteId;
    const root = ctx.root;
    const $ = (s) => root.querySelector(s);
    const $$ = (s) => [...root.querySelectorAll(s)];

    let people = [];
    let history = [];      // { id, ts, person, type, location }
    let fe1Bookmark = '';
    let kgVersion = '';    // last state drawn (skip redraws when nothing changed)
    const transient = new Map(); // name → { type: Set, location, bus }
    const shuffleRank = new Map(); // name → random number (the "Random" order, stable while the page is open)
    const rank = (n) => { if (!shuffleRank.has(n)) shuffleRank.set(n, Math.random()); return shuffleRank.get(n); };

    /* ------------------------------- events from Setup ------------------------------- */
    {
        let sessions = DEFAULTS.kg_sessions;
        try { sessions = (await ctx.guard(loadSettings())).settings.kg_sessions || sessions; } catch { }
        $('#sessionTitle').innerHTML = sessions.map((s, i) => {
            const label = esc(`${s.name} ${to12h(s.time)}`);
            return `<option value="${label}"${i === 0 ? ' selected' : ''}>${label}</option>`;
        }).join('');
    }
    $('#sessionDate').value = ymd(new Date());

    /* ------------------------------------ stats ------------------------------------ */
    let stats = new Map(); // name → { FE1, FE2, Atraaf, total, last, lastFE1 }
    function computeStats() {
        stats = new Map();
        const get = (n) => { if (!stats.has(n)) stats.set(n, { FE1: 0, FE2: 0, Atraaf: 0, total: 0, last: '', lastFE1: '' }); return stats.get(n); };
        for (const h of history) {
            const s = get(h.person);
            s[h.type] = (s[h.type] || 0) + 1;
            s.total++;
            if (h.ts > s.last) s.last = h.ts;
            if (h.type === 'FE1' && h.ts > s.lastFE1) s.lastFE1 = h.ts;
        }
        for (const n of people) get(n);
    }
    const st = (n) => stats.get(n) || { FE1: 0, FE2: 0, Atraaf: 0, total: 0, last: '', lastFE1: '' };
    const shortDate = (iso) => iso ? new Date(iso).toLocaleDateString(undefined, { day: '2-digit', month: 'short' }) : '—';

    /* ------------------------------------ order ------------------------------------ */
    const SORTS = {
        random: (a, b) => rank(a) - rank(b),
        az: (a, b) => natural(a, b),
        last: (a, b) => (st(b).last || '').localeCompare(st(a).last || '') || natural(a, b),
        most: (a, b) => st(b).total - st(a).total || natural(a, b),
        least: (a, b) => st(a).total - st(b).total || natural(a, b),
        FE1: (a, b) => st(a).FE1 - st(b).FE1 || (st(a).lastFE1 || '').localeCompare(st(b).lastFE1 || '') || natural(a, b),
        FE2: (a, b) => st(a).FE2 - st(b).FE2 || natural(a, b),
        Atraaf: (a, b) => st(a).Atraaf - st(b).Atraaf || natural(a, b),
    };
    const ordered = () => [...people].sort(SORTS[$('#sortBy').value] || SORTS.random);

    /* ---------------------------------- people list ---------------------------------- */
    const tick = (name) => { let t = transient.get(name); if (!t) { t = { type: new Set(), location: '', bus: '' }; transient.set(name, t); } return t; };
    // the next Atraaf bus: one more than the highest number given so far (1 for the first)
    const nextBus = () => String(1 + Math.max(0, ...[...transient.values()].filter(t => t.type.has('Atraaf')).map(t => parseInt(t.bus, 10)).filter(Number.isFinite)));
    const isTicked = (name) => (transient.get(name)?.type.size || 0) > 0;

    function renderPeople() {
        const q = $('#findName').value.trim().toLowerCase();
        const list = ordered();
        $('#peopleList').innerHTML = list.length ? list.map((name, i) => {
            const t = transient.get(name), s = st(name);
            const on = (k) => t?.type.has(k) ? 'checked' : '';
            const hide = q && !name.toLowerCase().includes(q) ? ' hidden' : '';
            return `<div class="kg-row${isTicked(name) ? ' on' : ''}" data-person="${esc(name)}"${hide}>
                <span class="kg-sr">${i + 1}</span>
                <div class="kg-name"><b>${esc(name)}</b>
                    <span class="kg-stats"><i title="Fakkul Ehraam 1">FE1 ${s.FE1}</i><i title="Fakkul Ehraam 2">FE2 ${s.FE2}</i><i title="Atraaf">AT ${s.Atraaf}</i><i class="kg-last" title="Last activity">${shortDate(s.last)}</i></span></div>
                <label class="kg-tick fe1"><input type="checkbox" data-type="FE1" ${on('FE1')}><span>FE1</span></label>
                <label class="kg-tick fe2"><input type="checkbox" data-type="FE2" ${on('FE2')}><span>FE2</span></label>
                <div class="kg-at">
                    <label class="kg-tick at"><input type="checkbox" data-type="Atraaf" ${on('Atraaf')}><span>Atraaf</span></label>
                    <input class="kg-bus" data-bus type="text" maxlength="6" placeholder="Bus" aria-label="Bus number for ${esc(name)}" value="${esc(t?.bus || '')}" ${t?.type.has('Atraaf') ? '' : 'hidden'}>
                </div>
                <select data-loc aria-label="Location for ${esc(name)}"><option value="">Location…</option>${LOCATIONS.map(l => `<option ${t?.location === l ? 'selected' : ''}>${esc(l)}</option>`).join('')}</select>
                <button type="button" class="kg-del" data-del title="Remove ${esc(name)} from the list (history stays)" aria-label="Remove ${esc(name)}">✕</button>
            </div>`;
        }).join('') : '<p class="kg-empty">No names yet — add the first one below.</p>';
        renderTickCount();
    }
    function renderTickCount() {
        const n = [...transient.values()].filter(t => t.type.size).length;
        $('#tickCount').textContent = `${n} ticked`;
    }

    // one set of listeners for every row
    $('#peopleList').addEventListener('change', (e) => {
        const row = e.target.closest('.kg-row');
        if (!row) return;
        const name = row.dataset.person;
        const t = tick(name);
        if (e.target.matches('input[data-type]')) {
            const k = e.target.dataset.type;
            if (e.target.checked) t.type.add(k); else t.type.delete(k);
            if (k === 'Atraaf') {
                const bus = row.querySelector('[data-bus]');
                if (e.target.checked && !t.bus) { t.bus = nextBus(); bus.value = t.bus; }
                bus.hidden = !e.target.checked;
            }
            row.classList.toggle('on', t.type.size > 0);
        } else if (e.target.matches('[data-loc]')) t.location = e.target.value;
        renderTickCount();
        updatePreview();
    });
    $('#peopleList').addEventListener('input', (e) => {
        if (!e.target.matches('[data-bus]')) return;
        tick(e.target.closest('.kg-row').dataset.person).bus = e.target.value.trim();
        updatePreview();
    });
    $('#peopleList').addEventListener('click', (e) => {
        const b = e.target.closest('[data-del]');
        if (!b) return;
        const name = b.closest('.kg-row').dataset.person;
        if (!confirm(`Remove ${name}? Their saved history stays.`)) return;
        transient.delete(name);
        kgOp('remove-person', name, `${name} removed.`);
    });
    $('#sortBy').addEventListener('change', renderPeople);
    $('#btnShuffle').addEventListener('click', () => { shuffleRank.clear(); $('#sortBy').value = 'random'; renderPeople(); });
    $('#findName').addEventListener('input', () => {
        const q = $('#findName').value.trim().toLowerCase();
        $$('.kg-row').forEach(r => { r.hidden = !!q && !r.dataset.person.toLowerCase().includes(q); });
    });

    /* ------------------------------------ message ------------------------------------ */
    function headerText() {
        const raw = ($('#sessionTitle').selectedOptions?.[0]?.text || $('#sessionTitle').value || '').trim();
        let time = '', head = raw;
        const m = raw.match(/(\d{1,2}:\d{2}\s*(?:AM|PM))/i);
        if (m) { time = m[1].toUpperCase(); head = raw.replace(m[0], '').trim().replace(/\s+/g, ' '); }
        const [y, mo, d] = ($('#sessionDate').value || ymd(new Date())).split('-').map(Number);
        const dt = new Date(y, mo - 1, d);
        const wk = dt.toLocaleDateString(undefined, { weekday: 'long' });
        return `*${head}*\n${pad(d)}/${pad(mo)}/${y} ${wk}\n${time || wk}`;
    }
    function buildGroups() {
        const groups = {};
        for (const [name, t] of transient) {
            if (!t.type.size) continue;
            (groups[t.location || 'Unassigned'] ||= []).push(name);
        }
        for (const k in groups) groups[k].sort(natural);
        const order = [...LOCATIONS.filter(l => groups[l]), ...Object.keys(groups).filter(k => !LOCATIONS.includes(k)).sort()];
        return { groups, order };
    }
    function updatePreview() {
        const { groups, order } = buildGroups();
        let out = headerText() + '\n\n';
        for (const k of order) {
            out += k + '\n';
            out += groups[k].map((n, i) => {
                const t = transient.get(n);
                const bus = t.type.has('Atraaf') && t.bus ? ` — Bus ${t.bus}` : '';
                return `${i + 1}. ${n}${bus}`;
            }).join('\n') + '\n\n';
        }
        $('#preview').textContent = out.trim();
    }
    // a new event or date rewrites only the three header lines (keeps hand edits below)
    function applyHeaderToPreview() {
        const head = headerText().split('\n');
        const lines = ($('#preview').textContent || '').split('\n');
        if (lines.length < 3) { updatePreview(); return; }
        lines.splice(0, 3, ...head);
        $('#preview').textContent = lines.join('\n');
    }
    $('#sessionTitle').addEventListener('change', applyHeaderToPreview);
    $('#sessionDate').addEventListener('input', applyHeaderToPreview);
    $('#btnCopy').addEventListener('click', async () => {
        const text = $('#preview').textContent.trim();
        if (!text) return flash('Nothing to copy.');
        try { await navigator.clipboard.writeText(text); }
        catch { const ta = document.createElement('textarea'); ta.value = text; document.body.append(ta); ta.select(); document.execCommand('copy'); ta.remove(); }
        flash('Copied — paste it into the group.');
    });

    /* -------------------------------------- save -------------------------------------- */
    // the chosen date at the current time of day (today: now)
    function saveStamp() {
        const now = new Date();
        const v = $('#sessionDate').value;
        if (!v || v === ymd(now)) return now.toISOString();
        const [y, m, d] = v.split('-').map(Number);
        return new Date(y, m - 1, d, now.getHours(), now.getMinutes(), now.getSeconds()).toISOString();
    }
    $('#btnSave').addEventListener('click', () => {
        const ts = saveStamp();
        const entries = [];
        for (const [name, t] of transient) for (const type of t.type) entries.push({ ts, person: name, type, location: t.location || '' });
        if (!entries.length) return flash('Nothing ticked yet.');
        cloud(() => request('POST', '/api/kg/log', { site, entries }), (s) => {
            clearTicks();
            flash(`Saved ${s.added} assignment${s.added === 1 ? '' : 's'}${s.added < entries.length ? ` (${entries.length - s.added} were already saved)` : ''}.`);
        });
    });
    function clearTicks() { transient.clear(); renderPeople(); updatePreview(); }
    $('#btnClearChecks').addEventListener('click', clearTicks);

    $('#btnAddPerson').addEventListener('click', addPerson);
    $('#newPersonName').addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); addPerson(); } });
    function addPerson() {
        const name = ($('#newPersonName').value || '').trim();
        if (!name) return flash('Type a name first.');
        if (people.includes(name)) return flash('That name is already in the list.');
        kgOp('add-person', name, `${name} added.`, () => { $('#newPersonName').value = ''; });
    }

    /* ------------------------------------ side tabs ------------------------------------ */
    $('.kg-tabs').addEventListener('click', (e) => {
        const b = e.target.closest('[data-tab]');
        if (!b) return;
        $$('.kg-tabs [data-tab]').forEach(x => x.setAttribute('aria-selected', String(x === b)));
        $$('.kg-pane').forEach(p => { p.hidden = p.dataset.pane !== b.dataset.tab; });
        if (b.dataset.tab === 'stats') drawHistogram(); // the canvas needs to be visible to size itself
    });

    /* ------------------------------------ FE1 helper ------------------------------------ */
    const fe1Order = () => [...people].sort(SORTS.FE1);
    function markFE1(name) {
        const t = tick(name);
        t.type.add('FE1');
        const row = $(`.kg-row[data-person="${CSS.escape(name)}"]`);
        if (row) {
            row.querySelector('input[data-type="FE1"]').checked = true;
            row.classList.add('on', 'flash');
            setTimeout(() => row.classList.remove('flash'), 1200);
        }
    }
    $('#btnRecommendFE1').addEventListener('click', () => {
        const n = Math.max(1, parseInt($('#recCount').value || '3', 10));
        fe1Order().slice(0, n).forEach(markFE1);
        renderTickCount(); updatePreview();
    });
    function renderFE1Board() {
        $('#fe1Leaderboard').innerHTML = fe1Order().map(n => `<li><span>${esc(n)}</span><b>${st(n).FE1}</b><small>${shortDate(st(n).lastFE1)}</small></li>`).join('');
    }
    function renderBookmarkUI() {
        $('#bookmarkDisplay').textContent = fe1Bookmark ? `Bookmark: ${fe1Bookmark}` : 'Bookmark: —';
        $('#feBookmark').innerHTML = '<option value="">— choose —</option>' + people.map(n => `<option ${n === fe1Bookmark ? 'selected' : ''}>${esc(n)}</option>`).join('');
    }
    function saveBookmark(name) { fe1Bookmark = name || ''; renderBookmarkUI(); kgOp('bookmark', fe1Bookmark, '', null, { keepTicks: true }); }
    $('#btnSetBookmark').addEventListener('click', () => {
        const v = ($('#feBookmark').value || '').trim();
        if (!v) return flash('Pick a name to bookmark.');
        if (!people.includes(v)) return flash('That name is not in the list.');
        saveBookmark(v);
    });
    $('#btnNextFromBookmark').addEventListener('click', () => {
        if (!people.length) return flash('No people to assign.');
        const n = Math.max(1, parseInt($('#recCount2').value || '3', 10));
        const start = fe1Bookmark ? people.indexOf(fe1Bookmark) : -1;
        const chosen = [];
        for (let i = 1; i <= people.length && chosen.length < n; i++) chosen.push(people[(start + i) % people.length]);
        chosen.forEach(markFE1);
        if (chosen.length) saveBookmark(chosen[chosen.length - 1]);
        renderTickCount(); updatePreview();
    });

    /* -------------------------------------- stats -------------------------------------- */
    function renderKPIs() {
        const today = ymd(new Date());
        const isToday = (ts) => ymd(new Date(ts)) === today;
        $('#kpiFE1Today').textContent = history.filter(h => h.type === 'FE1' && isToday(h.ts)).length;
        $('#kpiFE2Today').textContent = history.filter(h => h.type === 'FE2' && isToday(h.ts)).length;
        $('#kpiATToday').textContent = history.filter(h => h.type === 'Atraaf' && isToday(h.ts)).length;
        $('#kpiTotal').textContent = history.length;
    }
    function drawHistogram() {
        const cv = $('#histPeople');
        if (!cv || !cv.clientWidth) return;
        const g = cv.getContext('2d');
        const W = cv.width = cv.clientWidth, H = cv.height = cv.clientHeight;
        const rows = [...people].sort(natural).map(n => ({ name: n, ...st(n) }));
        const maxV = Math.max(1, ...rows.map(r => Math.max(r.FE1, r.FE2, r.Atraaf)));
        const padL = 34, padR = 8, padT = 12, padB = 46, chartW = W - padL - padR, chartH = H - padT - padB;
        g.clearRect(0, 0, W, H);
        g.fillStyle = '#fffdf8'; g.fillRect(0, 0, W, H);
        const steps = Math.min(5, maxV);
        for (let i = 0; i <= steps; i++) {
            const y = H - padB - (i / steps) * chartH;
            g.strokeStyle = i ? 'rgba(154,116,20,.18)' : '#9a7414'; g.beginPath(); g.moveTo(padL, y); g.lineTo(W - padR, y); g.stroke();
            g.fillStyle = '#6b5e4a'; g.font = '11px system-ui, sans-serif'; g.textAlign = 'right';
            g.fillText(String(Math.round((i / steps) * maxV)), padL - 6, y + 4);
        }
        const groupW = chartW / Math.max(1, rows.length), barW = Math.max(2, Math.min(14, groupW / 4));
        rows.forEach((r, idx) => {
            const x0 = padL + idx * groupW + (groupW - 3 * barW) / 2;
            [r.FE1, r.FE2, r.Atraaf].forEach((v, j) => {
                const h = (v / maxV) * (chartH - 2);
                g.fillStyle = ['#2e7dd1', '#23a56b', '#e3a92b'][j];
                g.fillRect(x0 + j * barW, H - padB - h, barW - 1, h);
            });
            g.fillStyle = '#6b5e4a'; g.font = '10px system-ui, sans-serif'; g.textAlign = 'right';
            g.save(); g.translate(padL + idx * groupW + groupW / 2, H - padB + 8); g.rotate(-Math.PI / 4);
            g.fillText(r.name.length > 12 ? r.name.slice(0, 11) + '…' : r.name, 0, 0); g.restore();
        });
    }

    /* ------------------------------------- history ------------------------------------- */
    function renderHistory() {
        const sorted = [...history].sort((a, b) => b.ts.localeCompare(a.ts));
        $('#logTable tbody').innerHTML = sorted.map(r => `<tr>
            <td>${esc(new Date(r.ts).toLocaleString(undefined, { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }))}</td>
            <td><span class="kg-type t-${esc(r.type)}">${esc(r.type)}</span></td>
            <td>${esc(r.person)}</td><td>${esc(r.location || '')}</td>
            <td><button type="button" class="kg-del" data-logdel="${r.id}" title="Delete this entry" aria-label="Delete">✕</button></td></tr>`).join('')
            || '<tr><td colspan="5" class="kg-empty">Nothing saved yet.</td></tr>';
    }
    $('#logTable tbody').addEventListener('click', (e) => {
        const b = e.target.closest('[data-logdel]');
        if (!b || !confirm('Delete this saved assignment?')) return;
        cloud(() => request('DELETE', `/api/kg/log/${b.dataset.logdel}?site=${site}`), () => flash('Assignment deleted.'));
    });

    /* ------------------------------ export / import / reset ------------------------------ */
    $('#btnExport').addEventListener('click', () => {
        const blob = new Blob([JSON.stringify(history, null, 2)], { type: 'application/json' });
        const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'umrah-atraaf-history.json'; a.click();
        setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    });
    $('#btnImport').addEventListener('click', () => {
        const inp = document.createElement('input'); inp.type = 'file'; inp.accept = 'application/json';
        inp.onchange = async (e) => {
            const file = e.target.files[0]; if (!file) return;
            let data = []; try { data = JSON.parse(await file.text()); } catch { return flash('That file is not valid JSON.'); }
            const entries = (Array.isArray(data) ? data : []).filter(r => r && r.ts && r.person && r.type)
                .map(r => ({ ts: r.ts, person: r.person, type: r.type, location: r.location || '' }));
            if (!entries.length) return flash('No entries in that file.');
            uploadLog(entries, (added) => flash(`Imported ${added} new entr${added === 1 ? 'y' : 'ies'}.`));
        };
        inp.click();
    });
    $('#btnReset').addEventListener('click', () => {
        if (!confirm(`Wipe ALL saved history and the names for ${ctx.site.label}? Every desk of this site loses them.`)) return;
        kgOp('reset', '', 'Everything was reset.');
    });

    // Excel: FAKKUL EHRAAM (FE1 + FE2) and ATRAAF sheets, one row per name with the dates
    function fmtShort(iso) { const d = new Date(iso); return `${pad(d.getDate())}-${d.toLocaleString(undefined, { month: 'short' })}`; }
    function datesByPerson(types) {
        const m = new Map(people.map(n => [n, []]));
        for (const r of [...history].sort((a, b) => a.ts.localeCompare(b.ts))) {
            if (!types.has(r.type)) continue;
            if (!m.has(r.person)) m.set(r.person, []);
            m.get(r.person).push(fmtShort(r.ts));
        }
        for (const [k, arr] of m) m.set(k, [...new Set(arr)]);
        return m;
    }
    function tableHTML(title, rows, cols) {
        const b = 'border:1px solid #000;';
        const th = `style="${b} font-weight:bold; text-align:center; padding:4px 6px;"`, td = `style="${b} padding:4px 6px;"`;
        let h = `<table cellspacing="0" cellpadding="0" style="border-collapse:collapse; ${b} width:100%;">`;
        h += `<tr><th colspan="${cols + 2}" style="${b} font-size:18px; color:#c00000; text-align:center;">${title}</th></tr>`;
        h += `<tr><th ${th}>SR NO.</th><th ${th}>NAME</th>${'<th ' + th + '>DATE</th>'.repeat(cols)}</tr>`;
        rows.forEach(([name, dates], i) => {
            h += `<tr><td ${td} style="text-align:center;">${i + 1}</td><td ${td}>${esc(name)}</td>`;
            for (let c = 0; c < cols; c++) h += `<td ${td}>${dates[c] || ''}</td>`;
            h += '</tr>';
        });
        return h + '</table>';
    }
    $('#btnExportExcel').addEventListener('click', () => {
        const fe = datesByPerson(new Set(['FE1', 'FE2'])), at = datesByPerson(new Set(['Atraaf']));
        const feRows = people.map(n => [n, fe.get(n) || []]), atRows = people.map(n => [n, at.get(n) || []]);
        const doc = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
            <head><meta charset="utf-8"></head><body>
            <div style="font-family:Calibri,Arial; font-size:12px; margin:6px 0 10px;"><strong>Event:</strong> ${esc($('#sessionTitle').value || '—')} | <strong>Date:</strong> ${esc($('#sessionDate').value || ymd(new Date()))}</div>
            ${tableHTML('FAKKUL EHRAAM', feRows, Math.max(14, ...feRows.map(r => r[1].length)))}
            <div style="height:16px"></div>
            ${tableHTML('ATRAAF', atRows, Math.max(14, ...atRows.map(r => r[1].length)))}
            </body></html>`;
        const a = document.createElement('a');
        a.href = URL.createObjectURL(new Blob([doc], { type: 'application/vnd.ms-excel' }));
        a.download = 'Assignments_FE_AT.xls'; a.click();
        setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    });

    /* -------------------------------------- cloud -------------------------------------- */
    function flash(msg) {
        const x = document.createElement('div');
        x.className = 'kg-flash'; x.textContent = msg;
        document.body.append(x); setTimeout(() => x.remove(), 2400);
    }
    function renderEverything() {
        computeStats();
        renderPeople(); renderHistory(); renderKPIs(); renderFE1Board(); renderBookmarkUI(); updatePreview();
        if (!$('[data-pane="stats"]').hidden) drawHistogram();
    }
    // Draw the server's state. While ticks are pending, an auto-refresh keeps the rows as they are.
    function applyState(s, { keepTicks = false } = {}) {
        const sig = JSON.stringify([s.people, s.bookmark, s.log.length, s.log.at(-1)?.id]);
        const changed = sig !== kgVersion;
        kgVersion = sig;
        people = s.people; fe1Bookmark = s.bookmark || ''; history = s.log;
        for (const n of [...transient.keys()]) if (!people.includes(n)) transient.delete(n);
        if (!changed) return;
        if (keepTicks && transient.size) {
            computeStats(); renderHistory(); renderKPIs(); renderFE1Board(); renderBookmarkUI();
            if (!$('[data-pane="stats"]').hidden) drawHistogram();
            return;
        }
        renderEverything();
    }
    async function loadKg(opts) { applyState(await ctx.guard(request('GET', `/api/kg?site=${site}`)), opts); }
    // a write, then the new state; a refused write says why
    async function cloud(call, onDone, opts) {
        if (!canWrite(site)) return flash(`This login can only view the ${ctx.site.label} KG list.`);
        try { const s = await ctx.guard(call()); applyState(s, opts); onDone && onDone(s); }
        catch (e) { flash(e instanceof UserError ? e.message : 'Could not save. Check the connection.'); }
    }
    function kgOp(op, name, done, after, opts) {
        cloud(() => request('POST', '/api/kg/op', { site, op, name }), () => { after && after(); if (done) flash(done); }, opts);
    }
    async function uploadLog(entries, done) {
        let added = 0;
        for (let i = 0; i < entries.length; i += 400) {
            let ok = true;
            await cloud(() => request('POST', '/api/kg/log', { site, entries: entries.slice(i, i + 400) }), (s) => { added += s.added; }).catch(() => { ok = false; });
            if (!ok) break;
        }
        done && done(added);
    }

    // This browser's list from before the cloud: offer to move it once
    function offerLocalMove() {
        let oldPeople = [], oldLog = [];
        try { oldPeople = JSON.parse(localStorage.getItem(LS_PEOPLE) || '[]') || []; } catch { }
        try { oldLog = JSON.parse(localStorage.getItem(LS_LOG) || '[]') || []; } catch { }
        const oldMark = (() => { try { return localStorage.getItem(LS_FE1_BOOKMARK) || ''; } catch { return ''; } })();
        if ((!oldPeople.length && !oldLog.length) || !canWrite(site)) return;
        const bar = document.createElement('div');
        bar.className = 'kg-move';
        bar.innerHTML = `<span>This browser still has its own KG list from before (${oldPeople.length} name${oldPeople.length === 1 ? '' : 's'}, ${oldLog.length} saved assignment${oldLog.length === 1 ? '' : 's'}). Move it to the ${esc(ctx.site.label)} cloud list so every desk sees it?</span>
            <button type="button" data-move>Move to cloud</button><button type="button" data-skip>Not now</button>`;
        root.prepend(bar);
        bar.addEventListener('click', async (e) => {
            if (e.target.closest('[data-skip]')) { bar.remove(); return; }
            if (!e.target.closest('[data-move]')) return;
            bar.querySelector('[data-move]').disabled = true;
            for (const n of oldPeople) if (!people.includes(n)) await cloud(() => request('POST', '/api/kg/op', { site, op: 'add-person', name: n }));
            if (oldMark && !fe1Bookmark) await cloud(() => request('POST', '/api/kg/op', { site, op: 'bookmark', name: oldMark }));
            const entries = oldLog.filter(r => r && r.ts && r.person && r.type).map(r => ({ ts: r.ts, person: r.person, type: r.type, location: r.location || '' }));
            await uploadLog(entries, (added) => {
                [LS_PEOPLE, LS_LOG, LS_FE1_BOOKMARK].forEach(k => { try { localStorage.removeItem(k); } catch { } });
                bar.remove();
                flash(`Moved: ${oldPeople.length} names, ${added} new assignments.`);
            });
        });
    }

    /* -------------------------------------- start -------------------------------------- */
    renderEverything();
    try { await loadKg(); }
    catch (e) { flash(e instanceof UserError ? e.message : 'Could not load the KG list.'); }
    offerLocalMove();
    // other desks' changes: every 30 s while the page is open, and when you come back to it
    const refresh = () => { if (document.visibilityState === 'visible') loadKg({ keepTicks: true }).catch(() => { }); };
    const timer = setInterval(refresh, 30000);
    document.addEventListener('visibilitychange', refresh);
    const onResize = () => { if (!$('[data-pane="stats"]').hidden) drawHistogram(); };
    window.addEventListener('resize', onResize);
    return () => { clearInterval(timer); document.removeEventListener('visibilitychange', refresh); window.removeEventListener('resize', onResize); };
}
