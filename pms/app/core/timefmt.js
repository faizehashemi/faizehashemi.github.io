// 12- or 24-hour times on the Slip page (Settings → Slip page → "24-hour times"; off by default = 12-hour).
//   use24()            this login's choice
//   fmtTime("15:00")   "3:00 pm"  /  "15:00"
//   fmtDT(ms | Date)   "21 Oct, 3:00 pm"  /  "21 Oct, 15:00" (day and month included)
//   enhanceTimes(root) 24-hour mode: every <input type="time"> under root (and any added later) gets two pickers,
//                      hour 00–23 and minute 00–59, that read and write the same input — the page's own code still
//                      reads/sets input.value as "HH:MM" and hears its input/change events. 12-hour mode: nothing
//                      changes (the browser's own time field). Returns a stop function.
import { getPrefs } from './prefs.js';

export const use24 = () => !!getPrefs().time24;
const pad = (n) => String(n).padStart(2, '0');

export function fmtTime(hhmm) {
    const m = String(hhmm || '').match(/^(\d{1,2}):(\d{2})/);
    if (!m) return '';
    const h = Number(m[1]);
    return use24() ? `${pad(h)}:${m[2]}` : `${h % 12 || 12}:${m[2]} ${h < 12 ? 'am' : 'pm'}`;
}

export function fmtDT(v, { year = false } = {}) {
    const d = v instanceof Date ? v : new Date(v);
    if (isNaN(d)) return '';
    const day = d.toLocaleDateString([], { day: '2-digit', month: 'short', ...(year ? { year: 'numeric' } : {}) });
    return `${day}, ${fmtTime(`${pad(d.getHours())}:${pad(d.getMinutes())}`)}`;
}

const valueDesc = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value');

function make24(input) {
    if (input.dataset.t24) return;
    input.dataset.t24 = '1';
    const wrap = document.createElement('span');
    wrap.className = 't24';
    const pick = (label, n, id) => {
        const s = document.createElement('select');
        s.className = id;
        s.setAttribute('aria-label', `${input.getAttribute('aria-label') || input.id || 'Time'} — ${label}`);
        s.innerHTML = `<option value="">--</option>` + Array.from({ length: n }, (_, i) => `<option value="${pad(i)}">${pad(i)}</option>`).join('');
        return s;
    };
    const hh = pick('hour', 24, 't24-h'), mm = pick('minute', 60, 't24-m');
    wrap.append(hh, document.createTextNode(':'), mm);
    input.style.display = 'none';
    input.after(wrap);

    const fromInput = () => {
        const v = valueDesc.get.call(input) || '';
        hh.value = v ? v.slice(0, 2) : '';
        mm.value = v ? v.slice(3, 5) : '';
    };
    const toInput = () => {
        const v = hh.value === '' ? '' : `${hh.value}:${mm.value === '' ? '00' : mm.value}`;
        if (valueDesc.get.call(input) === v) return;
        valueDesc.set.call(input, v);
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
    };
    hh.addEventListener('change', () => { if (hh.value !== '' && mm.value === '') mm.value = '00'; toInput(); });
    mm.addEventListener('change', toInput);
    // the page sets input.value from code (loading a slip, "all rows" …): keep the pickers in step
    Object.defineProperty(input, 'value', {
        configurable: true, enumerable: valueDesc.enumerable,
        get() { return valueDesc.get.call(this); },
        set(v) { valueDesc.set.call(this, v); fromInput(); },
    });
    // disabled / required follow the real input where the page uses them
    const sync = () => { hh.disabled = mm.disabled = input.disabled; };
    new MutationObserver(sync).observe(input, { attributes: true, attributeFilter: ['disabled'] });
    sync(); fromInput();
}

export function enhanceTimes(root) {
    if (!use24()) return () => { };
    const run = () => root.querySelectorAll('input[type="time"]').forEach(make24);
    run();
    const mo = new MutationObserver(run);
    mo.observe(root, { childList: true, subtree: true });
    return () => mo.disconnect();
}
