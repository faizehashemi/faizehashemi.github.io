// A closeable banner above the menu asking every visitor (logged in or not) to run the database distance test and
// send the result on WhatsApp — the samples decide which region the PMS database moves to. "Run the test" measures
// 3 times right here (pms-dbtest ?json) and the WhatsApp button then carries the numbers as text. Closing hides it
// for an hour on this browser. Remove this file's import in main.js (and the test Worker) once the decision is made.
// Quiet samples: while a logged-in PMS page is open and in view, the same test runs in the background about once an
// hour per device (first one a couple of minutes after opening); the test Worker keeps the result (/summary).

import { currentDesk } from './cloud.js';

const KEY = 'pms_dbtest_banner_closed';
const COOLDOWN_MS = 60 * 60 * 1000;
const TEST_URL = (() => { try { return localStorage.getItem('pms_dbtest_url') || 'https://pms-dbtest.tkamlapur.workers.dev'; } catch { return 'https://pms-dbtest.tkamlapur.workers.dev'; } })();
const SAMPLE_KEY = 'pms_dbtest_last_sample';
const SAMPLE_EVERY_MS = 60 * 60 * 1000;
const kind = () => (matchMedia('(max-width: 900px)').matches || /Android|iPhone|iPad/i.test(navigator.userAgent) ? 'phone' : 'desk');
const testUrl = (source) => {
    const d = currentDesk();
    const q = new URLSearchParams({ json: '1', record: '1', source, kind: kind(), site: d?.site || '', desk: d?.name || '' });
    return `${TEST_URL}/?${q}`;
};
const WA = '917747945253';
const median = (a) => { const s = [...a].sort((x, y) => x - y); return s[Math.floor(s.length / 2)]; };

function closedRecently() {
    try { return Date.now() - Number(localStorage.getItem(KEY) || 0) < COOLDOWN_MS; } catch { return false; }
}

async function runTest(bar) {
    const run = bar.querySelector('[data-run]'), say = bar.querySelector('.st-res'), wa = bar.querySelector('.wa');
    run.hidden = true; wa.hidden = true;
    const rounds = [];
    try {
        for (let i = 1; i <= 3; i++) {
            say.textContent = `Testing… ${i} of 3`;
            rounds.push(await (await fetch(testUrl('banner'), { cache: 'no-store' })).json());
        }
    } catch {
        say.textContent = 'The test could not run here — please use “Open the test page”.';
        run.hidden = false; return;
    }
    // per region: the median of the three rounds' medians
    const regions = rounds[0].out.map((r, k) => ({ short: r.short, ms: median(rounds.map(x => x.out[k].median_ms)) }));
    const colo = rounds[0].colo, country = rounds[0].country, desk = currentDesk();
    const text = `PMS speed test · ${colo} (${country}) · ${regions.map(r => `${r.short} ${r.ms}ms`).join(' · ')}`
        + ` · 3 rounds · ${new Date().toISOString().slice(0, 16).replace('T', ' ')} UTC${desk ? ` · ${desk.name}` : ''}`;
    say.innerHTML = `<b>Your result:</b> ${regions.map(r => `${r.short} ${r.ms} ms`).join(' · ')} <small>(${colo})</small>`;
    wa.href = `https://wa.me/${WA}?text=${encodeURIComponent(text)}`;
    wa.hidden = false;
    run.textContent = 'Run again'; run.hidden = false;
}

export function showSpeedTestBanner() {
    if (closedRecently() || document.getElementById('dbtestBanner')) return;
    const bar = document.createElement('div');
    bar.id = 'dbtestBanner';
    bar.setAttribute('role', 'region');
    bar.setAttribute('aria-label', 'Help make the PMS faster');
    bar.innerHTML = `
      <style>
        #dbtestBanner { position: relative; z-index: 1001; display: flex; flex-wrap: wrap; align-items: center; gap: 6px 14px; padding: 9px 44px 9px 16px;
          background: linear-gradient(90deg, #7a5410, #b8871d 55%, #d4af37); color: #fff; font: 600 13.5px/1.4 system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif; }
        #dbtestBanner b { font-weight: 800; }
        #dbtestBanner .st-act { display: inline-flex; flex-wrap: wrap; align-items: center; gap: 8px; }
        #dbtestBanner .st-btn { display: inline-block; padding: 5px 12px; border: 0; border-radius: 999px; background: #fff; color: #7a5410; font: inherit; font-weight: 800; text-decoration: none; white-space: nowrap; cursor: pointer; }
        #dbtestBanner .st-btn.wa { background: #25d366; color: #fff; }
        #dbtestBanner .st-btn.ghost { background: transparent; color: #fff; box-shadow: inset 0 0 0 1.5px rgba(255, 255, 255, .8); }
        #dbtestBanner .st-btn[hidden] { display: none; }
        #dbtestBanner .st-res { font-weight: 600; }
        #dbtestBanner .st-x { position: absolute; top: 50%; right: 10px; transform: translateY(-50%); width: 28px; height: 28px; border: 0; border-radius: 50%;
          background: rgba(255, 255, 255, .22); color: #fff; font-size: 16px; line-height: 1; cursor: pointer; }
        #dbtestBanner .st-x:hover { background: rgba(255, 255, 255, .38); }
        @media print { #dbtestBanner { display: none; } }
      </style>
      <span>⚡ <b>Help make the PMS faster:</b> run the speed test (it takes a few seconds), then send the result on WhatsApp. It helps us improve the PMS's speed and performance.</span>
      <span class="st-act">
        <button type="button" class="st-btn" data-run>Run the speed test</button>
        <a class="st-btn wa" href="#" target="_blank" rel="noopener" hidden>Send result on WhatsApp ↗</a>
        <a class="st-btn ghost" href="${TEST_URL}" target="_blank" rel="noopener">Open the test page ↗</a>
        <span class="st-res"></span>
      </span>
      <button type="button" class="st-x" aria-label="Close (shows again in an hour)" title="Close (shows again in an hour)">✕</button>`;
    bar.querySelector('[data-run]').addEventListener('click', () => runTest(bar));
    bar.querySelector('.st-x').addEventListener('click', () => {
        try { localStorage.setItem(KEY, String(Date.now())); } catch { }
        bar.remove();
    });
    document.body.insertBefore(bar, document.body.firstChild);
}

// a quiet background sample: logged in, page in view, online, not more than once an hour on this device
export async function sampleQuietly() {
    if (!currentDesk() || document.visibilityState !== 'visible' || !navigator.onLine) return;
    let last = 0;
    try { last = Number(localStorage.getItem(SAMPLE_KEY) || 0); } catch { }
    if (Date.now() - last < SAMPLE_EVERY_MS) return;
    try { localStorage.setItem(SAMPLE_KEY, String(Date.now())); } catch { }
    try { await fetch(testUrl('auto'), { cache: 'no-store' }); } catch { }
}

// opened and left open: offer the banner again once the hour has passed; take a quiet sample when due
export function watchSpeedTestBanner() {
    showSpeedTestBanner();
    setInterval(() => { if (document.visibilityState === 'visible') showSpeedTestBanner(); }, 5 * 60 * 1000);
    setTimeout(sampleQuietly, 2 * 60 * 1000);
    setInterval(sampleQuietly, 10 * 60 * 1000);
}
