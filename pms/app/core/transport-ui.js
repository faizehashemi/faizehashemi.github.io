// Pieces the Transport pages share: the day switcher and the escaping helper.
import { addDays, longDate, today } from './transport.js';

export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/**
 * ◀ [date] ▶ Today · "earlier/later day with a list" jumps. `days` = [{ day, n }] saved in the cloud.
 * Calls onChange(day) when the user picks another day.
 */
export function renderDayNav(el, { day, days = [], onChange }) {
    const saved = days.map(d => d.day);
    const prev = [...saved].reverse().find(d => d < day), next = saved.find(d => d > day);
    const here = days.find(d => d.day === day);
    el.innerHTML = `
      <div class="tp-dn">
        <button type="button" class="tp-btn" data-go="-1" title="Previous day" aria-label="Previous day">◀</button>
        <input type="date" class="tp-date" value="${esc(day)}" aria-label="Day">
        <button type="button" class="tp-btn" data-go="1" title="Next day" aria-label="Next day">▶</button>
        <button type="button" class="tp-btn" data-day="${today()}"${day === today() ? ' disabled' : ''}>Today</button>
        <b class="tp-dn-long">${esc(longDate(day))}</b>
        <span class="tp-dn-info">${here ? `${here.n} trips saved` : 'no list saved for this day'}</span>
        <span class="tp-dn-jump">
          ${prev ? `<button type="button" class="tp-link" data-day="${prev}">← ${esc(prev)}</button>` : ''}
          ${next ? `<button type="button" class="tp-link" data-day="${next}">${esc(next)} →</button>` : ''}
        </span>
      </div>`;
    el.onclick = (e) => {
        const b = e.target.closest('button');
        if (!b) return;
        if (b.dataset.go) onChange(addDays(day, Number(b.dataset.go)));
        else if (b.dataset.day) onChange(b.dataset.day);
    };
    el.querySelector('.tp-date').onchange = (e) => { if (e.target.value) onChange(e.target.value); };
}
