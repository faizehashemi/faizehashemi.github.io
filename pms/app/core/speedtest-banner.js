// A closeable banner above the menu asking every visitor (logged in or not) to run the database distance test and
// send a screenshot on WhatsApp — the samples decide which region the PMS database moves to. Closing it hides it for
// an hour on this browser. Remove this file's import in main.js (and the test Worker) once the decision is made.

const KEY = 'pms_dbtest_banner_closed';
const COOLDOWN_MS = 60 * 60 * 1000;
const TEST_URL = 'https://pms-dbtest.tkamlapur.workers.dev';
const WHATSAPP = 'https://wa.me/917747945253?text=' + encodeURIComponent('PMS speed test screenshot (from Makkah / Madina):');

function closedRecently() {
    try { return Date.now() - Number(localStorage.getItem(KEY) || 0) < COOLDOWN_MS; } catch { return false; }
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
        #dbtestBanner .st-act { display: inline-flex; flex-wrap: wrap; gap: 8px; }
        #dbtestBanner a.st-btn { display: inline-block; padding: 5px 12px; border-radius: 999px; background: #fff; color: #7a5410; font-weight: 800; text-decoration: none; white-space: nowrap; }
        #dbtestBanner a.st-btn.wa { background: #25d366; color: #fff; }
        #dbtestBanner button { position: absolute; top: 50%; right: 10px; transform: translateY(-50%); width: 28px; height: 28px; border: 0; border-radius: 50%;
          background: rgba(255, 255, 255, .22); color: #fff; font-size: 16px; line-height: 1; cursor: pointer; }
        #dbtestBanner button:hover { background: rgba(255, 255, 255, .38); }
        @media print { #dbtestBanner { display: none; } }
      </style>
      <span>⚡ <b>Help make the PMS faster:</b> open the speed test, refresh it 2–3 times, then send a screenshot on WhatsApp. It helps us improve the PMS's speed and performance.</span>
      <span class="st-act">
        <a class="st-btn" href="${TEST_URL}" target="_blank" rel="noopener">Open speed test ↗</a>
        <a class="st-btn wa" href="${WHATSAPP}" target="_blank" rel="noopener">Send screenshot on WhatsApp ↗</a>
      </span>
      <button type="button" aria-label="Close (shows again in an hour)" title="Close (shows again in an hour)">✕</button>`;
    bar.querySelector('button').addEventListener('click', () => {
        try { localStorage.setItem(KEY, String(Date.now())); } catch { }
        bar.remove();
    });
    document.body.insertBefore(bar, document.body.firstChild);
}

// opened and left open: offer it again once the hour has passed
export function watchSpeedTestBanner() {
    showSpeedTestBanner();
    setInterval(() => { if (document.visibilityState === 'visible') showSpeedTestBanner(); }, 5 * 60 * 1000);
}
