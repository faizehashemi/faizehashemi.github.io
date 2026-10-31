// ✨ Ask the PMS — the read-only assistant behind the ✨ button in the top bar (core/nav.js).
// A panel on the right (full width on a phone). Questions go to POST /api/ai/ask (Cloudflare Workers AI); the server answers
// only from what this login may already see (its pages and site) and can never change anything. Along with the question the
// panel sends the page that is open and this browser's recent errors / failed calls (core/issue-report.js), for "why does …
// not work" questions. The conversation stays in this tab until it is closed or cleared.

import { request, currentDesk, UserError } from './cloud.js';
import { recentDiag } from './issue-report.js';

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
// the little markdown the model writes: **bold**, `code`, "- " lists, line breaks
const md = (t) => esc(t).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/^(?:[-*•]) (.*)$/gm, '<li>$1</li>').replace(/(<li>[\s\S]*?<\/li>)(?!\s*<li>)/g, '<ul>$1</ul>').replace(/\n/g, '<br>').replace(/<\/li><br>/g, '</li>');

const state = { open: false, msgs: [], left: null, busy: false };
let root = null;

const SUGGEST = [
    'Who is in room 1413 today?',
    'How many check-ins and check-outs today?',
    'Why did my last slip save fail?',
    'Any errors on my pages recently?',
];

function pageNow() { const m = location.hash.match(/^#\/[^/]+\/([^/?#]+)/); return m ? m[1] : ''; }

function build() {
    root = document.createElement('div');
    root.className = 'ai-pane';
    root.setAttribute('role', 'dialog');
    root.setAttribute('aria-label', 'Ask the PMS');
    root.innerHTML = `
      <style>
        .ai-pane{ position:fixed; z-index:2147482000; top:0; right:0; bottom:0; width:min(440px, 100vw); display:flex; flex-direction:column; background:#fffdf8; color:#2a2014;
          border-left:1px solid #e3d2b1; box-shadow:-8px 0 30px rgba(0,0,0,.18); font:14px/1.45 system-ui, -apple-system, "Segoe UI", sans-serif; transform:translateX(105%); transition:transform .18s ease }
        .ai-pane.on{ transform:none }
        .ai-h{ display:flex; align-items:center; gap:8px; padding:12px 14px; border-bottom:1px solid #eadcc0; background:#fbf3e2 }
        .ai-h b{ font-size:16px } .ai-h small{ color:#7a6a4f } .ai-h .sp{ flex:1 }
        .ai-h button{ border:1px solid #e3d2b1; background:#fff; border-radius:8px; padding:4px 9px; cursor:pointer; font:inherit }
        .ai-log{ flex:1; overflow:auto; padding:12px 14px; display:flex; flex-direction:column; gap:10px }
        .ai-m{ max-width:92%; padding:8px 11px; border-radius:12px; white-space:normal; word-wrap:break-word }
        .ai-m.u{ align-self:flex-end; background:#9a7414; color:#fff; border-bottom-right-radius:4px }
        .ai-m.a{ align-self:flex-start; background:#fff; border:1px solid #eadcc0; border-bottom-left-radius:4px }
        .ai-m.e{ align-self:stretch; background:#fdecec; color:#8a1f17; border:1px solid #f1c4c0 }
        .ai-m ul{ margin:4px 0 4px 18px; padding:0 } .ai-m code{ background:#f4ecda; padding:0 4px; border-radius:4px }
        .ai-m .t{ display:block; margin-top:4px; font-size:11px; color:#9a8a6c }
        .ai-hi{ color:#7a6a4f } .ai-hi p{ margin:0 0 8px }
        .ai-sug{ display:flex; flex-wrap:wrap; gap:6px } .ai-sug button{ border:1px solid #e3d2b1; background:#fff; border-radius:999px; padding:5px 10px; cursor:pointer; font:inherit; font-size:13px }
        .ai-f{ border-top:1px solid #eadcc0; padding:10px 12px; display:grid; gap:6px; background:#fffaf0 }
        .ai-f form{ display:flex; gap:8px; align-items:flex-end }
        .ai-f textarea{ flex:1; resize:none; min-height:42px; max-height:140px; border:1px solid #d9c49c; border-radius:10px; padding:9px 10px; font:inherit; background:#fff }
        .ai-f button[type=submit]{ border:0; background:#9a7414; color:#fff; border-radius:10px; padding:10px 14px; font:inherit; font-weight:700; cursor:pointer }
        .ai-f button[disabled]{ opacity:.5; cursor:default }
        .ai-note{ font-size:11px; color:#8a7a5c; display:flex; justify-content:space-between; gap:8px }
        .ai-dots::after{ content:'…'; animation:aidots 1s steps(3) infinite } @keyframes aidots{ 0%{content:'.'} 50%{content:'..'} 100%{content:'...'} }
      </style>
      <div class="ai-h"><span aria-hidden="true">✨</span><div><b>Ask the PMS</b><br><small>Read only · answers from what your login can see</small></div><span class="sp"></span>
        <button type="button" data-clear title="Start a new conversation">New</button><button type="button" data-close aria-label="Close">✕</button></div>
      <div class="ai-log" id="aiLog" aria-live="polite"></div>
      <div class="ai-f">
        <form id="aiForm"><textarea id="aiIn" rows="1" placeholder="Ask about groups, rooms, arrivals, laundry, or why something does not work…" aria-label="Your question"></textarea>
          <button type="submit" id="aiSend">Ask</button></form>
        <div class="ai-note"><span>It cannot change anything — it tells you where to do it.</span><span id="aiLeft"></span></div>
      </div>`;
    document.body.appendChild(root);
    const $ = (id) => root.querySelector('#' + id);
    root.addEventListener('click', (e) => {
        if (e.target.closest('[data-close]')) close();
        if (e.target.closest('[data-clear]')) { state.msgs = []; draw(); $('aiIn').focus(); }
        const s = e.target.closest('[data-sug]'); if (s) { $('aiIn').value = s.dataset.sug; send(); }
    });
    $('aiForm').addEventListener('submit', (e) => { e.preventDefault(); send(); });
    $('aiIn').addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } });
    $('aiIn').addEventListener('input', (e) => { e.target.style.height = 'auto'; e.target.style.height = Math.min(140, e.target.scrollHeight) + 'px'; });
    root.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
}

function draw() {
    const log = root.querySelector('#aiLog');
    const me = currentDesk();
    log.innerHTML = state.msgs.length ? state.msgs.map(m => `<div class="ai-m ${m.role === 'user' ? 'u' : m.error ? 'e' : 'a'}">${m.role === 'user' ? esc(m.content) : md(m.content)}${m.tools?.length ? `<span class="t">looked at: ${esc(m.tools.join(', '))}</span>` : ''}</div>`).join('')
        + (state.busy ? '<div class="ai-m a"><span class="ai-dots">Looking it up</span></div>' : '')
        : `<div class="ai-hi"><p>Salaam${me ? ` ${esc(me.name)}` : ''}! Ask me about groups, rooms, arrivals and departures, laundry, or why something on a page does not work. I only read — I never change anything.</p>
             <div class="ai-sug">${SUGGEST.map(s => `<button type="button" data-sug="${esc(s)}">${esc(s)}</button>`).join('')}</div></div>`;
    log.scrollTop = log.scrollHeight;
    root.querySelector('#aiSend').disabled = state.busy;
    root.querySelector('#aiLeft').textContent = state.left == null ? '' : `${state.left} question${state.left === 1 ? '' : 's'} left today`;
}

async function send() {
    const box = root.querySelector('#aiIn'), q = box.value.trim();
    if (!q || state.busy) return;
    box.value = ''; box.style.height = 'auto';
    state.msgs.push({ role: 'user', content: q });
    state.busy = true; draw();
    try {
        const d = recentDiag();
        const r = await request('POST', '/api/ai/ask', {
            page: pageNow(),
            messages: state.msgs.filter(m => !m.error).map(m => ({ role: m.role, content: m.content })),
            diag: { errors: d.errors, failed_calls: d.failed_calls, recent_pages: d.recent_pages, build: d.build },
        });
        state.msgs.push({ role: 'assistant', content: r.answer || '…', tools: r.tools || [] });
        state.left = r.left;
    } catch (e) {
        state.msgs.push({ role: 'assistant', error: true, content: e instanceof UserError || e?.message ? e.message : 'Could not reach the assistant.' });
    } finally { state.busy = false; draw(); box.focus(); }
}

export function openAssistant() {
    if (!currentDesk()) return;
    if (!root) build();
    state.open = true; draw();
    requestAnimationFrame(() => root.classList.add('on'));
    setTimeout(() => root.querySelector('#aiIn').focus(), 60);
}
export function close() { if (!root) return; state.open = false; root.classList.remove('on'); }
export function toggleAssistant() { (state.open ? close : openAssistant)(); }
