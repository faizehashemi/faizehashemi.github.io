// "Facing an issue?" — a small button on every page (replaces the 5-star feedback card). Press it and the page the desk is looking at is captured (a picture of the
// window, exactly as it is — size, scroll, open menus), together with what the browser knows that helps to debug it: window and device size, recent errors and
// failed calls, the text on screen, anything wider than the window. The desk adds a few words and presses Report; it arrives on the Performance page (Data).
//   The picture is optional (a tick box in the window) — it can show guest names. Nothing is sent until Report is pressed.
//   Never shown: on the login page, the laundry touch screens, while printing.

import { currentDesk, request } from './cloud.js';
import { context, lastLoadOf } from './telemetry.js';
import { loadScript } from './lib.js';
import { getPrefs } from './prefs.js';

const SKIP = new Set(['login', 'blank', 'laundry']);
const HTML2CANVAS = 'https://cdn.jsdelivr.net/npm/html2canvas-pro@1.5.8/dist/html2canvas-pro.min.js';   // the -pro build reads modern colours (oklch) the React pages use
const MAX_SHOT = 700000;   // characters of the JPEG data URL (the Worker takes up to 900 000)
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/* ------------------------- what happened lately (kept in memory) ------------------------- */
const errors = [], failed = [], routes = [];
const keep = (list, item, n) => { list.push(item); if (list.length > n) list.shift(); };
const stamp = () => new Date().toISOString().slice(11, 19);
function watch() {
    window.addEventListener('error', (e) => {
        if (!e.filename && /^Script error/.test(e.message || '')) return;
        keep(errors, `${stamp()} ${String(e.message || 'error').slice(0, 200)}${e.filename ? ` @ ${String(e.filename).split('/').slice(-2).join('/')}:${e.lineno}` : ''}`, 20);
    });
    window.addEventListener('unhandledrejection', (e) => keep(errors, `${stamp()} unhandled: ${String(e.reason?.message || e.reason || '').slice(0, 200)}`, 20));
    const ce = console.error;
    console.error = function (...a) { try { keep(errors, `${stamp()} console: ${a.map(x => (x && x.message) || String(x)).join(' ').slice(0, 200)}`, 20); } catch { } return ce.apply(this, a); };
    window.addEventListener('pms:request', (e) => { const d = e.detail; if (d && d.ok === false) keep(failed, `${stamp()} ${d.method} ${String(d.path).slice(0, 80)} → ${d.status ?? 'failed'}`, 15); });
    window.addEventListener('pms:route-done', (e) => { const d = e.detail || {}; keep(routes, `${stamp()} ${d.site || ''}/${d.view || ''}${d.ok === false ? ' (failed)' : ''}`, 10); });
}

/* ------------------------------ the picture ------------------------------ */
async function capture() {
    await loadScript(HTML2CANVAS);
    const w = innerWidth, h = innerHeight;
    const t0 = performance.now();
    let scale = Math.min(window.devicePixelRatio || 1, w < 700 ? 2 : 1.25);
    for (let attempt = 0; attempt < 3; attempt++) {
        const canvas = await Promise.race([
            (window.html2canvasPro || window.html2canvas)(document.documentElement, { x: scrollX, y: scrollY, width: w, height: h, windowWidth: document.documentElement.clientWidth, windowHeight: h, scale, logging: false, useCORS: true,
                backgroundColor: getComputedStyle(document.body).backgroundColor || '#ffffff', ignoreElements: (el) => el.classList?.contains('pms-ir') }),
            new Promise((_, rej) => setTimeout(() => rej(new Error('capture timed out')), 9000)),
        ]);
        for (const q of [0.62, 0.45, 0.3]) {
            const url = canvas.toDataURL('image/jpeg', q);
            if (url.length <= MAX_SHOT) return { url, ms: Math.round(performance.now() - t0), scale };
        }
        scale = Math.max(0.5, scale * 0.65);
    }
    return null;
}

/* ------------------------------ diagnostics ------------------------------ */
// elements that stick out past the right edge of the window (the usual cause of a squashed or sideways-scrolling phone page)
function overflowing() {
    const out = [], vw = document.documentElement.clientWidth;
    for (const el of document.querySelectorAll('#view *, body > *')) {
        if (out.length >= 8) break;
        if (el.closest('.pms-ir') || el.closest('dialog:not([open])')) continue;
        const r = el.getBoundingClientRect();
        if (r.width > 0 && r.right > vw + 2 && r.left < vw && getComputedStyle(el).position !== 'fixed') {
            const parentScrolls = [...(function* () { for (let p = el.parentElement; p; p = p.parentElement) yield p; })()].some(p => { const o = getComputedStyle(p).overflowX; return (o === 'auto' || o === 'scroll') && p.scrollWidth > p.clientWidth; });
            if (!parentScrolls) out.push(`${el.tagName.toLowerCase()}${el.id ? '#' + el.id : ''}${typeof el.className === 'string' && el.className ? '.' + el.className.trim().split(/\s+/).slice(0, 3).join('.') : ''} right=${Math.round(r.right)} width=${Math.round(r.width)}`);
        }
    }
    return out;
}
function diagnostics(page, site) {
    const ctx = context(), p = getPrefs(), outlet = document.getElementById('view');
    return {
        page, site, hash: location.hash.slice(0, 200),
        viewport: { w: innerWidth, h: innerHeight, dpr: window.devicePixelRatio || 1, scrollX: Math.round(scrollX), scrollY: Math.round(scrollY), pageW: document.documentElement.scrollWidth, pageH: document.documentElement.scrollHeight,
            orientation: screen.orientation?.type || (innerWidth > innerHeight ? 'landscape' : 'portrait'), visualScale: window.visualViewport?.scale ?? 1 },
        ctx, online: navigator.onLine, lang: navigator.language, ua: navigator.userAgent, tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
        react: !!document.querySelector('.pms-react'), standalone: matchMedia('(display-mode: standalone)').matches,
        settings: { theme: p.theme, textScale: p.textScale, density: p.density, phoneCards: p.phoneCards, navLayout: p.navLayout, reduceMotion: p.reduceMotion },
        page_ms: lastLoadOf(page), errors: [...errors], failed_calls: [...failed], recent_pages: [...routes],
        wider_than_window: overflowing(),
        open_dialogs: [...document.querySelectorAll('dialog[open], [role=dialog]')].map(d => (d.innerText || '').slice(0, 120)).slice(0, 3),
        dom: (outlet?.innerText || document.body.innerText || '').replace(/\s+\n/g, '\n').slice(0, 6000),
    };
}

/* ------------------------------ the window ------------------------------ */
const CSS = `
.pms-ir-btn { position: fixed; right: 12px; bottom: 12px; z-index: 45; display: inline-flex; align-items: center; gap: 6px; padding: 8px 14px; border-radius: 999px; border: 1.5px solid #e6c766;
  background: #fffaf0; color: #6b4e0e; font: 700 13px system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif; box-shadow: 0 6px 18px rgba(154, 116, 20, .22); cursor: pointer; opacity: .92; }
.pms-ir-btn:hover { opacity: 1; background: #fff3d6; }
@media (max-width: 700px) { .pms-ir-btn { right: 8px; bottom: 8px; padding: 9px 11px; } .pms-ir-btn span { display: none; } }
@media print { .pms-ir, .pms-ir-btn { display: none !important; } }
dialog.pms-ir { width: min(560px, calc(100vw - 16px)); max-height: calc(100dvh - 16px); overflow: auto; padding: 0; border: 1.5px solid #e6c766; border-radius: 16px; background: #fffdf8; color: #2b1e15;
  font: 14px/1.45 system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif; box-shadow: 0 20px 60px rgba(0, 0, 0, .35); }
dialog.pms-ir::backdrop { background: rgba(30, 20, 5, .45); }
.pms-ir form { display: grid; gap: 10px; padding: 16px; }
.pms-ir h2 { margin: 0; font-size: 18px; color: #9a7414; }
.pms-ir p { margin: 0; color: #6b5e4a; font-size: 13px; }
.pms-ir .ir-shot { border: 1px solid #e3d2b1; border-radius: 10px; overflow: hidden; background: #f1ead9; max-height: 220px; display: grid; place-items: center; }
.pms-ir .ir-shot img { max-width: 100%; max-height: 220px; display: block; }
.pms-ir textarea { font: inherit; width: 100%; min-height: 90px; padding: 9px 11px; border: 1px solid #d9c49d; border-radius: 10px; background: #fff; resize: vertical; box-sizing: border-box; }
.pms-ir label.ir-chk { display: flex; gap: 8px; align-items: center; font-size: 13px; }
.pms-ir details { font-size: 12.5px; color: #6b5e4a; }
.pms-ir .ir-act { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; justify-content: flex-end; }
.pms-ir button { font: inherit; font-weight: 800; padding: 9px 18px; border-radius: 999px; border: 1px solid #d9c49d; background: #fff; color: #6b5e4a; cursor: pointer; }
.pms-ir button.ir-send { background: #9a7414; border-color: #9a7414; color: #fff; }
.pms-ir button:disabled { opacity: .5; cursor: default; }
.pms-ir .ir-msg { margin-right: auto; font-size: 13px; }
.pms-ir .ir-msg.bad { color: #b3261e; } .pms-ir .ir-msg.ok { color: #1f6f43; }
`;

let button = null, opening = false;
function currentPage() { const o = document.getElementById('view'); return { page: o?.dataset.view || '', site: (location.hash.split('/')[1] || '').split('?')[0] }; }
function refresh() {
    const { page } = currentPage();
    if (button) button.hidden = !currentDesk() || !page || SKIP.has(page);
}

async function openReport() {
    if (opening) return;
    opening = true;
    const { page, site } = currentPage();
    button.hidden = true;                              // not in its own picture
    let shot = null, shotErr = '';
    try { shot = await capture(); } catch (e) { shotErr = e?.message || 'could not capture'; }
    const diag = diagnostics(page, site);
    if (shot) diag.shot = { ms: shot.ms, scale: Math.round(shot.scale * 100) / 100 }; else diag.shot_error = shotErr || 'too large';
    button.hidden = false;

    const dlg = document.createElement('dialog');
    dlg.className = 'pms-ir';
    dlg.innerHTML = `<form method="dialog">
        <h2>⚠ Facing an issue?</h2>
        <p>Tell the developers what went wrong on <b>${esc(page || 'this page')}</b>. The screen as you see it now and some technical details go with the report, so they can see what you see.</p>
        ${shot ? `<div class="ir-shot"><img alt="What was on your screen" src="${shot.url}"></div><label class="ir-chk"><input type="checkbox" class="ir-useshot" checked> Send this picture of my screen (it may show guest names)</label>`
            : `<p>A picture could not be taken (${esc(shotErr || 'too large')}). The report still carries the technical details and the text on screen.</p>`}
        <label for="irText"><b>What went wrong?</b></label>
        <textarea id="irText" maxlength="2000" required placeholder="e.g. the Save button does nothing; the table is cut off on my phone; the page is empty after I pick a date…"></textarea>
        <details><summary>What is sent along</summary>Page and address, window size ${innerWidth}×${innerHeight}, device and browser, your PMS look settings (theme, text size), the last errors and failed calls in this browser, the text shown on the page, anything wider than the window${shot ? ', and the picture' : ''}. No passwords.</details>
        <div class="ir-act"><span class="ir-msg" role="status"></span><button type="button" class="ir-x">Cancel</button><button type="submit" class="ir-send">Report</button></div></form>`;
    document.body.appendChild(dlg);
    const msg = dlg.querySelector('.ir-msg'), send = dlg.querySelector('.ir-send'), text = dlg.querySelector('textarea');
    const close = () => { if (dlg.open) dlg.close(); dlg.remove(); opening = false; };
    dlg.querySelector('.ir-x').addEventListener('click', close);
    dlg.addEventListener('cancel', () => { opening = false; setTimeout(() => dlg.remove(), 0); });
    dlg.addEventListener('close', () => { opening = false; dlg.remove(); });
    dlg.querySelector('form').addEventListener('submit', async (ev) => {
        ev.preventDefault();
        if (text.value.trim().length < 3) { msg.className = 'ir-msg bad'; msg.textContent = 'Write a few words first.'; text.focus(); return; }
        send.disabled = true; msg.className = 'ir-msg'; msg.textContent = 'Sending…';
        try {
            await request('POST', '/api/issues', { page, site, url: location.hash, text: text.value.trim(), diag, shot: shot && dlg.querySelector('.ir-useshot')?.checked ? shot.url : '' });
            msg.className = 'ir-msg ok'; msg.textContent = '✓ Sent to the developers. Thank you.';
            setTimeout(close, 1800);
        } catch (e) {
            msg.className = 'ir-msg bad'; msg.textContent = e?.message || 'Could not send — check the connection and try again.'; send.disabled = false;
        }
    });
    dlg.showModal();
    text.focus();
}

/** Put the button on the page and keep the short history. Call once at boot. */
export function startIssueReports() {
    if (button) return;
    watch();
    const st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);
    button = document.createElement('button');
    button.type = 'button'; button.className = 'pms-ir pms-ir-btn'; button.hidden = true;
    button.setAttribute('aria-label', 'Facing an issue? Report it to the developers');
    button.innerHTML = '<b aria-hidden="true">⚠</b><span>Facing an issue?</span>';
    button.addEventListener('click', openReport);
    document.body.appendChild(button);
    for (const e of ['pms:route-done', 'pms:logged-in', 'pms:logged-out', 'hashchange']) window.addEventListener(e, () => setTimeout(refresh, 50));
    refresh();
}
