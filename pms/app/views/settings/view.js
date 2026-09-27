// Settings: personal preferences for this browser (core/prefs.js) and the desk's own password.
// Every control saves on change and the shell applies it immediately.

import { SITES, VIEWS, NAV } from '../../config.js';
import { currentDesk, request, UserError, canOpen } from '../../core/cloud.js';
import { getPrefs, setPrefs, resetPrefs, exportPrefs, importPrefs, modLabel } from '../../core/prefs.js';
import { loadBuildings, buildingNames } from '../../core/rooms.js';

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
// Alt+<these> open the browser's own menus in some browsers — allowed, but worth a warning
const BROWSER_KEYS = new Set(['D', 'E', 'F']);

export default async function mount(ctx) {
    const root = ctx.root;
    const $ = (id) => root.querySelector('#' + id);
    const me = currentDesk();

    let toastTimer = null;
    const toast = (text) => {
        $('toast').textContent = text;
        $('toast').classList.add('show');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => $('toast')?.classList.remove('show'), 1600);
    };
    const save = (patch, text = 'Saved on this browser') => { setPrefs(patch); render(); toast(text); };

    /* ------------------------------ fill choices ------------------------------ */
    // only pages this login may open (Setup → Page access)
    const pages = VIEWS.filter(v => !v.hidden || v.id === 'home').filter(v => v.id !== 'login' && canOpen(v.id, me));
    $('startSiteRow').hidden = me?.role !== 'admin'; // other logins always open their own site
    $('startView').innerHTML = pages.map(v => `<option value="${v.id}">${esc(v.id === 'home' ? 'Home (overview)' : v.label)}</option>`).join('');
    $('startSite').innerHTML = `<option value="last">Last used</option>` + Object.values(SITES).map(s => `<option value="${s.id}">${esc(s.label)}</option>`).join('');
    const fillBuildings = (list) => {
        const names = [...new Set(Object.keys(SITES).flatMap(s => buildingNames(list, s)))];
        const cur = getPrefs().slipDefaultBuilding;
        if (cur && !names.includes(cur)) names.push(cur);
        $('slipBld').innerHTML = `<option value="">None (choose each time)</option>` + names.map(n => `<option>${esc(n)}</option>`).join('');
    };
    fillBuildings([]);
    ctx.guard(loadBuildings()).then(list => { fillBuildings(list); render(); }).catch(() => { });

    /* --------------------------------- render --------------------------------- */
    function render() {
        const p = getPrefs();
        root.querySelectorAll('[data-pref]').forEach(el => {
            const v = p[el.dataset.pref];
            if (el.type === 'checkbox') el.checked = !!v;
            else el.value = v ?? '';
        });
        root.querySelectorAll('[data-seg]').forEach(seg => seg.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(p[seg.dataset.seg] === b.dataset.val))));
        $('scaleOut').textContent = `${p.textScale}%`;
        renderKeys();
        renderQuick();
    }

    function renderQuick() {
        const ql = (getPrefs().quickLinks || []).filter(id => pages.some(v => v.id === id));
        const label = (id) => VIEWS.find(v => v.id === id)?.label || id;
        $('qlNow').innerHTML = ql.length ? ql.map((id, i) => `<span class="ql-chip" data-id="${id}">
                <button type="button" data-ql-move="-1" ${i === 0 ? 'disabled' : ''} aria-label="Move ${esc(label(id))} left">◀</button>
                <b>${esc(label(id))}</b>
                <button type="button" data-ql-move="1" ${i === ql.length - 1 ? 'disabled' : ''} aria-label="Move ${esc(label(id))} right">▶</button>
                <button type="button" data-ql-remove aria-label="Remove ${esc(label(id))}">✕</button></span>`).join('')
            : '<span class="muted small">No quick links yet — tick pages below.</span>';
        const groups = NAV.map(c => ({ label: c.label, views: c.views.filter(id => pages.some(v => v.id === id)) })).filter(g => g.views.length);
        $('qlPick').innerHTML = groups.map(g => `<fieldset><legend>${esc(g.label)}</legend>${g.views.map(id =>
            `<label class="chk"><input type="checkbox" data-ql="${id}" ${ql.includes(id) ? 'checked' : ''}> ${esc(label(id))}</label>`).join('')}</fieldset>`).join('');
    }


    function renderKeys() {
        const p = getPrefs();
        const used = {};
        for (const [id, k] of Object.entries(p.shortcuts)) if (k) (used[k.toUpperCase()] ||= []).push(id);
        $('keys').innerHTML = pages.map(v => {
            const k = (p.shortcuts[v.id] || '').toUpperCase();
            return `<label class="key ${k && used[k]?.length > 1 ? 'clash' : ''}"><span>${esc(v.id === 'home' ? 'Home' : v.label)}</span>
                <span><kbd>${esc(modLabel())} +</kbd> <input data-key="${v.id}" value="${esc(k)}" maxlength="1" inputmode="none" aria-label="Shortcut for ${esc(v.label)}"></span></label>`;
        }).join('');
        $('keys').classList.toggle('off', !p.shortcutsOn);
    }

    /* --------------------------------- events --------------------------------- */
    root.addEventListener('change', (e) => {
        const q = e.target.closest('input[data-ql]');
        if (q) {
            const cur = (getPrefs().quickLinks || []).filter(id => id !== q.dataset.ql);
            save({ quickLinks: q.checked ? [...cur, q.dataset.ql] : cur }, q.checked ? 'Added to quick links' : 'Removed from quick links');
            return;
        }
        const el = e.target.closest('[data-pref]');
        if (!el) return;
        const v = el.type === 'checkbox' ? el.checked : el.type === 'range' || 'num' in el.dataset ? Number(el.value) : el.value;
        save({ [el.dataset.pref]: v });
    });
    root.addEventListener('input', (e) => {
        if (e.target.matches('input[type=range][data-pref]')) { setPrefs({ textScale: Number(e.target.value) }); $('scaleOut').textContent = `${e.target.value}%`; }
    });
    root.addEventListener('click', (e) => {
        const chip = e.target.closest('.ql-chip');
        if (chip && e.target.closest('button')) {
            const ql = [...(getPrefs().quickLinks || [])];
            const i = ql.indexOf(chip.dataset.id);
            const mv = e.target.closest('[data-ql-move]');
            if (mv) { const j = i + Number(mv.dataset.qlMove); [ql[i], ql[j]] = [ql[j], ql[i]]; save({ quickLinks: ql }, 'Order saved'); }
            else if (e.target.closest('[data-ql-remove]')) save({ quickLinks: ql.filter(id => id !== chip.dataset.id) }, 'Removed from quick links');
            return;
        }
        const seg = e.target.closest('[data-seg] button');
        if (seg) { save({ [seg.closest('[data-seg]').dataset.seg]: seg.dataset.val }); return; }
        const step = e.target.closest('[data-step]');
        if (step) { save({ textScale: Math.min(150, Math.max(75, getPrefs().textScale + Number(step.dataset.step))) }); return; }
        const clear = e.target.closest('[data-clear]');
        if (clear) { save({ [clear.dataset.clear]: '' }); return; }
        const reset = e.target.closest('[data-reset]');
        if (reset) { resetPrefs(reset.dataset.reset.split(',')); render(); $('keysMsg').textContent = ''; toast(reset.dataset.reset === 'quickLinks' ? 'Quick links removed' : 'Default shortcuts back'); return; }
        const tab = e.target.closest('.st-tabs a');
        if (tab) { e.preventDefault(); show(tab.dataset.sec); return; }
        const link = e.target.closest('a[data-href]');
        if (link) { e.preventDefault(); ctx.navigate(link.dataset.href); }
    });

    // shortcut boxes: press the key you want
    root.addEventListener('keydown', (e) => {
        const box = e.target.closest('input[data-key]');
        if (!box || e.key === 'Tab') return;
        e.preventDefault();
        e.stopPropagation();
        const id = box.dataset.key;
        let key = null;
        if (e.key === 'Backspace' || e.key === 'Delete') key = '';
        else {
            const k = (/^Digit(\d)$/.exec(e.code)?.[1] ?? /^Key([A-Z])$/.exec(e.code)?.[1] ?? '').toUpperCase();
            if (k) key = k;
        }
        if (key === null) { $('keysMsg').textContent = 'Use a letter (A–Z) or a digit (0–9).'; return; }
        const sc = { [id]: key };
        let note = '';
        if (key) {
            const other = Object.entries(getPrefs().shortcuts).find(([vid, k]) => vid !== id && (k || '').toUpperCase() === key);
            if (other) { sc[other[0]] = ''; note = `${VIEWS.find(v => v.id === other[0])?.label || other[0]} no longer has a shortcut (it had ${key}). `; }
            if (BROWSER_KEYS.has(key) && getPrefs().shortcutMod === 'alt') note += `Alt+${key} also opens a browser menu in some browsers.`;
        }
        setPrefs({ shortcuts: sc });
        renderKeys();
        $('keysMsg').textContent = note;
        toast(key ? `${modLabel()} + ${key} opens ${VIEWS.find(v => v.id === id)?.label}` : 'Shortcut removed');
        root.querySelector(`input[data-key="${id}"]`)?.focus();
    });

    /* ------------------------------ section tabs ------------------------------ */
    function show(sec, smooth = true) {
        const el = $('sec-' + sec);
        if (!el) return;
        root.querySelectorAll('.st-tabs a').forEach(a => a.setAttribute('aria-current', String(a.dataset.sec === sec)));
        el.scrollIntoView({ behavior: smooth && !getPrefs().reduceMotion ? 'smooth' : 'auto', block: 'start' });
        el.classList.remove('flash'); void el.offsetWidth; el.classList.add('flash');
        if (sec === 'password') setTimeout(() => $('pwCur')?.focus({ preventScroll: true }), 300);
    }

    /* -------------------------------- password -------------------------------- */
    $('pwWho').textContent = me ? `Desk login: ${me.name} (${SITES[me.site]?.label || me.site}, ${me.role})` : '';
    $('pwUser').value = me?.name || '';
    $('pwShow').addEventListener('change', () => root.querySelectorAll('#pwForm input[type=password], #pwForm input[data-pw]').forEach(i => { i.dataset.pw = ''; i.type = $('pwShow').checked ? 'text' : 'password'; }));
    const strength = (pw) => {
        let s = 0;
        if (pw.length >= 8) s++;
        if (pw.length >= 12) s++;
        if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) s++;
        if (/\d/.test(pw)) s++;
        if (/[^\w\s]/.test(pw) || /\s/.test(pw.trim())) s++;
        return pw.length < 8 ? 0 : Math.min(4, s);
    };
    $('pwNew').addEventListener('input', () => {
        const s = strength($('pwNew').value);
        $('pwBar').style.width = `${[4, 30, 55, 80, 100][s]}%`;
        $('pwBar').style.background = ['#c0392b', '#d35400', '#d4a017', '#6aa84f', '#2f7d32'][s];
        $('pwHint').textContent = $('pwNew').value.length < 8 ? 'At least 8 characters.' : ['Too short', 'Weak — make it longer', 'Fair', 'Good', 'Strong'][s];
    });
    $('pwForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const msg = (t, ok = false) => { $('pwMsg').textContent = t; $('pwMsg').className = `small ${ok ? 'ok' : 'bad'}`; };
        const cur = $('pwCur').value, pw = $('pwNew').value;
        if (pw.length < 8) return msg('The new password needs at least 8 characters.');
        if (pw !== $('pwNew2').value) return msg('The two new passwords are not the same.');
        if (pw === cur) return msg('The new password is the same as the current one.');
        $('pwBtn').disabled = true;
        msg('Changing…', true);
        try {
            await ctx.guard(request('POST', '/api/me/password', { current: cur, password: pw }));
            $('pwForm').reset();
            $('pwBar').style.width = '0';
            msg('Password changed. Other computers using this desk must log in again with the new password.', true);
            toast('Password changed');
        } catch (err) {
            if (err?.status === 404) msg('The server does not support this yet — ask the admin to update the PMS Worker.');
            else msg(err instanceof UserError ? err.message : 'Could not change the password. Check the connection and try again.');
        } finally { $('pwBtn').disabled = false; }
    });

    /* ----------------------------- backup & reset ----------------------------- */
    $('btnExport').addEventListener('click', () => {
        const blob = new Blob([exportPrefs()], { type: 'application/json' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `pms-settings-${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    });
    $('fileImport').addEventListener('change', async () => {
        const f = $('fileImport').files[0];
        if (!f) return;
        try { importPrefs(await ctx.guard(f.text())); render(); $('backupMsg').textContent = 'Settings loaded.'; $('backupMsg').className = 'small ok'; }
        catch (err) { $('backupMsg').textContent = `Could not load: ${err.message}`; $('backupMsg').className = 'small bad'; }
        $('fileImport').value = '';
    });
    $('btnReset').addEventListener('click', () => {
        if (!confirm('Put every setting on this browser back to default? (Your password is not affected.)')) return;
        resetPrefs();
        render();
        toast('Everything back to default');
    });

    render();
    const sec = ctx.params.get('section');
    if (sec) requestAnimationFrame(() => show(sec, false));
    else root.querySelector('.st-tabs a')?.setAttribute('aria-current', 'true');
}
