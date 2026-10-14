// Page loader: the emblem in a turning gold ring over the page area, while a page (or any slow job) is loading.
// The menu bar stays usable, so the user can still go elsewhere. It only appears when the wait is longer than a
// moment (`delay`), so quick pages don't flash it, and its line of text changes if the wait drags on.
//
//   const stop = showLoader({ delay: 350, text: 'Opening Grid' });   …   stop();
//   Several callers can overlap: the loader stays until the last one stops.
//   Local testing: open the site with ?loaderdemo (shows it for 8 s), or call window.pmsLoader.show() in the console.

const LINES = ['Fetching the latest slips…', 'Counting rooms and beds…', 'Almost there…', 'Still working — slow connection?'];
let el = null, active = 0, lineTimer = null;

function build() {
    el = document.createElement('div');
    el.id = 'pms-loader';
    el.dataset.shell = '';
    el.setAttribute('role', 'status');
    el.setAttribute('aria-live', 'polite');
    el.innerHTML = `
      <div class="pl-box">
        <div class="pl-mark">
          <svg class="pl-ring" viewBox="0 0 120 120" aria-hidden="true">
            <circle class="pl-track" cx="60" cy="60" r="52"/>
            <circle class="pl-arc" cx="60" cy="60" r="52"/>
          </svg>
          <img src="assets/icons/icon-192.png" alt="" width="72" height="72">
        </div>
        <p class="pl-title"></p>
        <p class="pl-line"></p>
        <div class="pl-dots" aria-hidden="true"><i></i><i></i><i></i></div>
      </div>`;
    document.body.appendChild(el);
}

// cover the page below the menu bar
function place() {
    const nav = document.querySelector('site-nav');
    const r = nav && !nav.hidden ? nav.getBoundingClientRect() : null;
    el.style.top = `${r && r.bottom > 0 ? Math.round(r.bottom) : 0}px`;
}

/** Show the loader (after `delay` ms). Returns stop(). */
export function showLoader({ delay = 350, text = 'Loading' } = {}) {
    if (!el) build();
    active++;
    let shown = false, stopped = false;
    const timer = setTimeout(() => {
        if (stopped) return;
        shown = true;
        place();
        el.querySelector('.pl-title').textContent = text;
        let n = 0;
        el.querySelector('.pl-line').textContent = '';
        clearInterval(lineTimer);
        lineTimer = setInterval(() => { el.querySelector('.pl-line').textContent = LINES[Math.min(n++, LINES.length - 1)]; }, 2500);
        el.classList.add('on');
    }, delay);
    return function stop() {
        if (stopped) return;
        stopped = true;
        clearTimeout(timer);
        active = Math.max(0, active - 1);
        if (!active && el) { el.classList.remove('on'); clearInterval(lineTimer); }
        void shown;
    };
}

// console / local testing helpers
window.pmsLoader = { show: (text) => showLoader({ delay: 0, text }), demo: (ms = 8000, text = 'Loading demo') => { const s = showLoader({ delay: 0, text }); setTimeout(s, ms); } };
if (/[?&]loaderdemo\b/.test(location.search)) window.addEventListener('load', () => window.pmsLoader.demo());
