// In-page feedback: a small card slotted into the page itself (after a table or section — never a popup) asking
// "How is your experience with this page?" (1–5 stars), then "What made you say that?". Answers go to POST /api/feedback
// and are read on the Performance page (Data).
//   When:  each page asks every day — after the desk has been on it ~20 s, or right after a save there. Answered: not
//          again on that page until tomorrow. Closed or left unanswered: asked again later the same day (3 h apart, at
//          most 3 times a page a day).
//   Never: while someone is typing or a dialog is open, on the login page or the laundry touch screens.
//   The card fades away 30 s after it was seen if nobody touches it.

import { currentDesk, request } from './cloud.js';
import { context, lastLoadOf } from './telemetry.js';

const SKIP = new Set(['login', 'blank', 'laundry']);
const AGAIN_MS = 3 * 60 * 60 * 1000, MAX_A_DAY = 3, DWELL_MS = 20000, AUTO_HIDE_MS = 30000;
const CHIPS = ['Too slow', 'Hard to find', 'Something broke', 'Confusing', 'Works great', 'Saves me time'];
const today = () => new Date().toISOString().slice(0, 10);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const keyOf = (page) => `pms_fb:${currentDesk()?.id || 0}:${page}`;
function stateOf(page) {
    try { const s = JSON.parse(localStorage.getItem(keyOf(page)) || 'null'); if (s && s.day === today()) return s; } catch { }
    return { day: today(), answered: false, shows: 0, last: 0 };
}
const saveState = (page, s) => { try { localStorage.setItem(keyOf(page), JSON.stringify(s)); } catch { } };
function due(page) {
    if (!currentDesk() || SKIP.has(page)) return false;
    const s = stateOf(page);
    return !s.answered && s.shows < MAX_A_DAY && Date.now() - s.last >= AGAIN_MS;
}
const busy = () => !!document.querySelector('dialog[open]') || /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName || '') || document.activeElement?.isContentEditable;

// where the card goes: after the first table area (or section) the desk can see, else at the top of the page
function anchorIn(outlet) {
    const vh = innerHeight;
    const cands = [...outlet.querySelectorAll('table, .table-wrap, [class*="scroll"], section, .card, [class*="-card"]')]
        .filter(el => !el.closest('dialog') && el.offsetParent !== null && el.getBoundingClientRect().height > 40);
    const seen = cands.filter(el => { const r = el.getBoundingClientRect(); return r.top < vh * 0.9 && r.bottom > 0; });
    const pick = (seen.length ? seen : cands)[0];
    if (!pick) return null;
    // a table inside a scroll box / card: go after the box, not inside it
    return pick.closest('.table-wrap, [class*="scroll"]') || pick;
}

let current = null; // { page, el, timers }
function remove() {
    if (!current) return;
    current.timers.forEach(clearTimeout);
    current.io?.disconnect();
    current.el.remove();
    current = null;
}

function show(page, site, trigger, tries = 0) {
    if (current || !due(page)) return;
    const outlet = document.getElementById('view');
    if (!outlet || outlet.dataset.view !== page) return;
    if (busy()) { if (tries < 6) setTimeout(() => show(page, site, trigger, tries + 1), 10000); return; }
    const anchor = anchorIn(outlet);
    const s = stateOf(page); s.shows++; s.last = Date.now(); saveState(page, s);

    const el = document.createElement('div');
    el.className = 'pms-fb';
    el.setAttribute('role', 'region');
    el.setAttribute('aria-label', 'Your feedback');
    el.innerHTML = `
      <style>
        .pms-fb { margin: 12px 0; padding: 12px 44px 12px 14px; position: relative; border-radius: 14px; border: 1.5px solid #e6c766;
          background: linear-gradient(180deg, #fffaf0, #fff3d6); color: #2b1e15; font: 14px/1.45 system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif;
          box-shadow: 0 6px 18px rgba(154, 116, 20, .12); animation: pmsFbIn .35s ease; transition: opacity .4s; }
        @keyframes pmsFbIn { from { opacity: 0; transform: translateY(6px); } }
        .pms-fb.out { opacity: 0; }
        .pms-fb b { font-weight: 800; }
        .pms-fb .fb-row { display: flex; flex-wrap: wrap; align-items: center; gap: 6px 12px; }
        .pms-fb .fb-stars { display: inline-flex; gap: 2px; }
        .pms-fb .fb-stars button { border: 0; background: none; font-size: 26px; line-height: 1; padding: 0 2px; cursor: pointer; color: #d6c39a; transition: transform .1s, color .1s; }
        .pms-fb .fb-stars button.on { color: #e3a812; }
        .pms-fb .fb-stars button:hover { transform: scale(1.15); }
        .pms-fb .fb-more { display: grid; gap: 8px; margin-top: 10px; }
        .pms-fb .fb-chips { display: flex; flex-wrap: wrap; gap: 6px; }
        .pms-fb .fb-chips button { font: inherit; font-size: 12.5px; font-weight: 700; padding: 4px 10px; border-radius: 999px; border: 1px solid #d9c49d; background: #fff; color: #3d3226; cursor: pointer; }
        .pms-fb .fb-chips button.on { background: #9a7414; border-color: #9a7414; color: #fff; }
        .pms-fb textarea { font: inherit; width: 100%; min-height: 64px; padding: 8px 10px; border: 1px solid #d9c49d; border-radius: 10px; background: #fff; resize: vertical; box-sizing: border-box; }
        .pms-fb .fb-send { font: inherit; font-weight: 800; padding: 7px 16px; border: 0; border-radius: 999px; background: #9a7414; color: #fff; cursor: pointer; }
        .pms-fb .fb-send:disabled { opacity: .5; cursor: default; }
        .pms-fb .fb-x { position: absolute; top: 8px; right: 8px; width: 28px; height: 28px; border: 0; border-radius: 50%; background: rgba(154, 116, 20, .12); color: #3d3226; font-size: 15px; cursor: pointer; }
        .pms-fb .fb-note { font-size: 12px; color: #3d3226; }
        @media print { .pms-fb { display: none; } }
      </style>
      <div class="fb-row"><span>💬 <b>How is your experience with this page?</b></span>
        <span class="fb-stars" role="radiogroup" aria-label="Rating">${[1, 2, 3, 4, 5].map(n => `<button type="button" data-star="${n}" aria-label="${n} star${n > 1 ? 's' : ''}">★</button>`).join('')}</span></div>
      <div class="fb-more" hidden>
        <span><b>What made you say that?</b> <span class="fb-note">Pick any that fit and/or write a line — it goes straight to the developers.</span></span>
        <span class="fb-chips">${CHIPS.map(c => `<button type="button" data-chip="${esc(c)}">${esc(c)}</button>`).join('')}</span>
        <textarea maxlength="1000" placeholder="e.g. the page took long to open after lunch; the Save button is hard to find on the phone…"></textarea>
        <span class="fb-row"><button type="button" class="fb-send" disabled>Send</button><span class="fb-note fb-msg"></span></span>
      </div>
      <button type="button" class="fb-x" aria-label="Close" title="Close">✕</button>`;
    if (anchor) anchor.after(el); else outlet.prepend(el);
    current = { page, el, timers: [], touched: false };

    // fade away 30 s after it was first seen, unless someone is using it
    const io = new IntersectionObserver((list) => {
        if (!list.some(x => x.isIntersecting) || current?.seenAt) return;
        current.seenAt = Date.now();
        current.timers.push(setTimeout(() => { if (current && !current.touched) { el.classList.add('out'); setTimeout(remove, 450); } }, AUTO_HIDE_MS));
    }, { threshold: 0.6 });
    io.observe(el);
    current.io = io;

    let rating = 0;
    const tags = new Set();
    const more = el.querySelector('.fb-more'), send = el.querySelector('.fb-send'), text = el.querySelector('textarea');
    const ready = () => { send.disabled = !rating || (!tags.size && !text.value.trim()); };
    el.addEventListener('pointerdown', () => { if (current) current.touched = true; });
    el.addEventListener('focusin', () => { if (current) current.touched = true; });
    el.querySelectorAll('[data-star]').forEach(b => b.addEventListener('click', () => {
        rating = Number(b.dataset.star);
        el.querySelectorAll('[data-star]').forEach(x => x.classList.toggle('on', Number(x.dataset.star) <= rating));
        more.hidden = false; ready();
        text.focus({ preventScroll: true });
    }));
    el.querySelectorAll('[data-chip]').forEach(b => b.addEventListener('click', () => {
        const c = b.dataset.chip; tags.has(c) ? tags.delete(c) : tags.add(c); b.classList.toggle('on', tags.has(c)); ready();
    }));
    text.addEventListener('input', ready);
    el.querySelector('.fb-x').addEventListener('click', remove);
    send.addEventListener('click', async () => {
        send.disabled = true;
        el.querySelector('.fb-msg').textContent = 'Sending…';
        const ctx = context();
        try {
            await request('POST', '/api/feedback', { page, site, trigger, rating, tags: [...tags], text: text.value.trim(),
                ctx: { page_ms: lastLoadOf(page), device: ctx.device, browser: `${ctx.browser} ${ctx.browser_ver}`.trim(), net_type: ctx.net_type, build: ctx.build } });
            const st = stateOf(page); st.answered = true; saveState(page, st);
            el.innerHTML = `<div style="font:600 14px system-ui;color:#1f6f43">✓ Thank you — your feedback was sent.</div>`;
            current.timers.push(setTimeout(() => { el.classList.add('out'); setTimeout(remove, 450); }, 2500));
        } catch (err) {
            el.querySelector('.fb-msg').textContent = err?.message || 'Could not send — try again.';
            send.disabled = false;
        }
    });
}

/** Watch page openings and saves; ask when a page is due. Call once at boot. */
export function startFeedback() {
    let dwell = null;
    window.addEventListener('pms:route-start', () => { clearTimeout(dwell); remove(); });
    window.addEventListener('pms:route-done', (e) => {
        const { view, site, ok } = e.detail || {};
        if (ok === false || !due(view)) return;
        dwell = setTimeout(() => show(view, site, 'visit'), DWELL_MS);
    });
    // right after a save on this page (not the background sync, the timings or the feedback itself)
    window.addEventListener('pms:request', (e) => {
        const d = e.detail;
        if (!d || !d.ok || d.method === 'GET' || /\/api\/(telemetry|feedback|me\/prefs|login|logout|sync)\b/.test(d.path)) return;
        const outlet = document.getElementById('view'), page = outlet?.dataset.view;
        if (!page || !due(page)) return;
        clearTimeout(dwell);
        const site = (location.hash.split('/')[1] || '').split('?')[0];
        setTimeout(() => show(page, site, 'after-save'), 1500);
    });
}
