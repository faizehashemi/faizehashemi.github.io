// In-house Misri Hijri calendar (a window over the Home page): one Hijri month per view with the Gregorian
// dates, miqaat markers, and the chosen day's miqaats. Dates: app/core/hijri.js; miqaats: the Mumineen
// Calendar project's list shipped in app/data/miqaats.json (MIT licence, app/data/miqaats.LICENSE.txt).

import { toHijri, fromHijri, daysInMonth, HIJRI_MONTHS, loadMiqaats, miqaatsOn } from '../../core/hijri.js';

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const AR = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
const arabic = (n) => String(n).replace(/\d/g, d => AR[d]);
const WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const sameDay = (a, b) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

/** Open the calendar on the month of `date` with that day chosen. */
export async function openCalendar({ host = document.body, date = new Date() } = {}) {
    const list = await loadMiqaats();
    const today = new Date();
    let sel = toHijri(date);              // chosen day { year, month, day }
    let view = { year: sel.year, month: sel.month };

    const dlg = document.createElement('dialog');
    dlg.className = 'mc';
    dlg.innerHTML = `
      <div class="mc-wrap">
        <header class="mc-head">
          <button type="button" class="mc-nav" data-go="-12" aria-label="Previous year">«</button>
          <button type="button" class="mc-nav" data-go="-1" aria-label="Previous month">‹</button>
          <div class="mc-title"><b id="mcMonth"></b><span id="mcGreg"></span></div>
          <button type="button" class="mc-nav" data-go="1" aria-label="Next month">›</button>
          <button type="button" class="mc-nav" data-go="12" aria-label="Next year">»</button>
          <button type="button" class="mc-today" data-today>Today</button>
          <button type="button" class="mc-x" data-close aria-label="Close">✕</button>
        </header>
        <div class="mc-body">
          <div class="mc-grid-wrap">
            <div class="mc-week">${WEEK.map(d => `<span>${d}</span>`).join('')}</div>
            <div class="mc-grid" id="mcGrid"></div>
            <p class="mc-legend"><span>✨ major miqaat</span><span>🌙 night</span><span><i class="dot"></i> other miqaats</span></p>
          </div>
          <aside class="mc-side" id="mcSide"></aside>
        </div>
        <footer class="mc-foot">Misri (Fatimid) calendar · miqaat list from the Mumineen Calendar project (MIT licence)</footer>
      </div>`;
    host.appendChild(dlg);
    const $ = (id) => dlg.querySelector('#' + id);

    function render() {
        const { year, month } = view;
        const first = fromHijri(year, month, 1);
        const n = daysInMonth(year, month);
        const last = fromHijri(year, month, n);
        $('mcMonth').textContent = `${HIJRI_MONTHS[month]} ${year}H`;
        const g = (d) => d.toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
        $('mcGreg').textContent = g(first) === g(last) ? g(first) : `${first.toLocaleDateString(undefined, { month: 'short' })} – ${g(last)}`;

        const cells = [];
        for (let i = 0; i < first.getDay(); i++) cells.push('<span class="mc-pad"></span>');
        for (let d = 1; d <= n; d++) {
            const greg = fromHijri(year, month, d);
            const ms = miqaatsOn(list, { year, month, day: d });
            const major = ms.find(m => m.priority === 1);
            const mark = major ? (major.phase === 'night' ? '🌙' : '✨') : ms.length ? '<i class="dot"></i>' : '';
            const isSel = sel.year === year && sel.month === month && sel.day === d;
            cells.push(`<button type="button" class="mc-day${sameDay(greg, today) ? ' today' : ''}${isSel ? ' sel' : ''}${ms.length ? ' has' : ''}${greg.getDay() === 5 ? ' fri' : ''}" data-day="${d}"
                aria-label="${d} ${esc(HIJRI_MONTHS[month])}, ${esc(greg.toDateString())}${ms.length ? `, ${ms.length} miqaat${ms.length === 1 ? '' : 's'}` : ''}">
                <span class="mc-h">${arabic(d)}</span><span class="mc-g">${greg.getDate() === 1 || d === 1 ? greg.toLocaleDateString(undefined, { day: 'numeric', month: 'short' }) : greg.getDate()}</span>
                <span class="mc-mark">${mark}</span></button>`);
        }
        $('mcGrid').innerHTML = cells.join('');
        renderSide();
    }

    function renderSide() {
        const greg = fromHijri(sel.year, sel.month, sel.day);
        const ms = miqaatsOn(list, sel);
        $('mcSide').innerHTML = `
            <div class="mc-sel-h">${sel.day} ${esc(HIJRI_MONTHS[sel.month])} ${sel.year}H</div>
            <div class="mc-sel-g">${esc(greg.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }))}</div>
            ${ms.length ? `<ul class="mc-list">${ms.map(m => `<li class="${m.priority === 1 ? 'major' : ''}">
                <span aria-hidden="true">${m.phase === 'night' ? '🌙' : m.priority === 1 ? '✨' : '•'}</span>
                <span>${esc(m.title)}${m.phase === 'night' ? ' <small>(night)</small>' : ''}${m.description ? `<small>${esc(m.description)}</small>` : ''}</span></li>`).join('')}</ul>`
                : '<p class="mc-none">There are no miqaats on this day.</p>'}`;
    }

    function go(months) {
        let m = view.month + months, y = view.year;
        while (m < 0) { m += 12; y--; }
        while (m > 11) { m -= 12; y++; }
        view = { year: y, month: m };
        // keep the chosen day in view
        sel = { year: y, month: m, day: Math.min(sel.day, daysInMonth(y, m)) };
        render();
    }

    dlg.addEventListener('click', (e) => {
        const b = e.target.closest('button');
        if (!b) { if (e.target === dlg) dlg.close(); return; } // click on the backdrop
        if ('close' in b.dataset) dlg.close();
        else if (b.dataset.go) go(Number(b.dataset.go));
        else if ('today' in b.dataset) { sel = toHijri(new Date()); view = { year: sel.year, month: sel.month }; render(); }
        else if (b.dataset.day) { sel = { year: view.year, month: view.month, day: Number(b.dataset.day) }; render(); }
    });
    dlg.addEventListener('keydown', (e) => {
        if (e.target.closest('input, select, textarea')) return;
        if (e.key === 'ArrowLeft' && e.altKey) { e.preventDefault(); go(-1); }
        if (e.key === 'ArrowRight' && e.altKey) { e.preventDefault(); go(1); }
    });
    dlg.addEventListener('close', () => dlg.remove());
    render();
    dlg.showModal();
    dlg.querySelector('.mc-day.sel')?.focus();
    return dlg;
}
