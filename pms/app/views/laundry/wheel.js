// Touch scroll wheel, like the iOS date picker: swipe a column, the row that stops in the middle band is the
// value. Tapping a row scrolls it into the band. No keyboard needed (the laundry runs on a touch screen).
//   const w = wheel(el, (value) => …);  w.set([{ value, label, cls }], selectedValue);  w.value;  w.sync()

import { esc } from '../../core/laundry.js';

export function wheel(el, onPick) {
    let opts = [], idx = 0, timer = 0, raf = 0;
    const rowH = () => parseFloat(getComputedStyle(el).getPropertyValue('--row')) || 52;

    function mark() { el.querySelectorAll('.ld-wopt').forEach((d, i) => d.setAttribute('aria-selected', String(i === idx))); }
    // rows away from the band tilt back and fade, like a drum
    function tilt() {
        const c = el.scrollTop / rowH();
        el.querySelectorAll('.ld-wopt').forEach((d, i) => {
            const k = Math.max(-2.5, Math.min(2.5, i - c));
            d.style.transform = `rotateX(${-k * 20}deg) scale(${1 - Math.abs(k) * 0.07})`;
            d.style.opacity = String(1 - Math.abs(k) * 0.25);
        });
    }
    function settle() {
        const n = Math.max(0, Math.min(opts.length - 1, Math.round(el.scrollTop / rowH())));
        if (n === idx || !opts.length) return;
        idx = n; mark();
        onPick(opts[idx].value);
    }
    /** Put the selected row in the band again (after the wheel was hidden, scrollTop is lost). */
    function sync() { el.scrollTop = idx * rowH(); tilt(); }

    el.addEventListener('scroll', () => {
        cancelAnimationFrame(raf); raf = requestAnimationFrame(tilt);
        clearTimeout(timer); timer = setTimeout(settle, 110);
    }, { passive: true });
    el.addEventListener('click', (e) => {
        const d = e.target.closest('.ld-wopt');
        if (d) el.scrollTo({ top: Number(d.dataset.i) * rowH(), behavior: 'smooth' });
    });

    return {
        set(list, value) {
            opts = list;
            idx = Math.max(0, list.findIndex(o => o.value === value));
            el.innerHTML = list.map((o, i) => `<div class="ld-wopt ${o.cls || ''}" role="option" data-i="${i}">${esc(o.label)}</div>`).join('')
                || '<div class="ld-wempty">—</div>';
            mark(); sync();
        },
        get value() { return opts[idx]?.value; },
        sync,
    };
}
