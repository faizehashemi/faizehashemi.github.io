// Forced updates.
//   Website: version.json (written by web/deploy.sh at every publish) carries a build id. Every open page —
//   browser or Android app — checks it every 5 minutes and when it comes back to the screen; a new build
//   shows a one-line banner at the top and reloads the page after a 30-second countdown (offline laundry bills are safe: they live in localStorage).
//   Android app: it opens the site as /?app=android&appv=<n>. When version.json says android_min > n, the
//   app is blocked by an "Update required" screen whose only action is downloading the new APK.

const CHECK_MS = 5 * 60e3;
let loaded = null;   // build id this page started with
let timer = null;

const params = new URLSearchParams(location.search);
// remembered for the whole session: the hash router keeps location.search, but be safe
if (params.get('app') === 'android') { try { sessionStorage.setItem('pms_appv', params.get('appv') || '0'); } catch { } }
export const androidVersion = () => { try { const v = sessionStorage.getItem('pms_appv'); return v == null ? null : Number(v) || 0; } catch { return null; } };

async function fetchVersion() {
    const r = await fetch(`version.json?t=${Date.now()}`, { cache: 'no-store' });
    if (!r.ok) throw new Error(String(r.status));
    return r.json();
}

function overlay(html) {
    let el = document.getElementById('pms-update');
    if (!el) {
        el = document.createElement('div');
        el.id = 'pms-update';
        el.dataset.shell = '';
        el.setAttribute('role', 'alertdialog');
        el.setAttribute('aria-modal', 'true');
        el.style.cssText = 'position:fixed;inset:0;z-index:2147483600;display:grid;place-items:center;padding:20px;background:rgba(30,20,5,.72);font:16px/1.5 system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif';
        document.body.appendChild(el);
    }
    el.innerHTML = `<div style="max-width:420px;width:100%;background:#fffaf1;color:#22170d;border-radius:18px;padding:22px;text-align:center;box-shadow:0 24px 60px rgba(0,0,0,.4)">${html}</div>`;
    return el;
}

function blockOldApp(info, have) {
    const url = info.apk_page || 'https://raajsoftware.com/downloads/';
    overlay(`<div style="font-size:48px">⬆️</div>
        <h2 style="margin:6px 0 8px;font-size:21px">Update required</h2>
        <p style="margin:0 0 14px">This version of the app (${have}) is no longer supported. Download and install the new version (${info.android_latest || info.android_min}) to continue.</p>
        <a href="${url}" style="display:block;padding:14px;border-radius:14px;background:#1f8a4c;color:#fff;font-weight:800;text-decoration:none;font-size:18px">⬇ Download the new app</a>
        <p style="margin:12px 0 0;font-size:12px;color:#6b5e4a">After installing, open the app again. Your login and data are kept.</p>`);
}

// A new build: one line at the top of the page (the page stays usable) with an Update now button; it reloads by itself after the countdown.
function reloadSoon() {
    let n = 30;
    let bar = document.getElementById('pms-update-bar');
    if (!bar) {
        bar = document.createElement('div');
        bar.id = 'pms-update-bar';
        bar.dataset.shell = '';
        bar.setAttribute('role', 'status');
        bar.style.cssText = 'position:sticky;top:0;z-index:2147483000;display:flex;flex-wrap:nowrap;align-items:center;justify-content:center;gap:10px;padding:5px 12px;background:#d4af37;color:#22170d;font:600 13px/1.3 system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;box-shadow:0 2px 8px rgba(0,0,0,.2);white-space:nowrap;overflow:hidden';
        document.body.insertBefore(bar, document.body.firstChild);
    }
    const tick = () => {
        bar.innerHTML = `<span style="overflow:hidden;text-overflow:ellipsis">✨ A new version of the PMS is out — updating in <b>${n}</b> s</span><button type="button" id="pmsUpdNow" style="flex:none;padding:3px 12px;border:0;border-radius:999px;background:#22170d;color:#fff;font:inherit;font-weight:800;cursor:pointer">Update now</button>`;
        document.getElementById('pmsUpdNow').onclick = () => location.reload();
        if (n-- <= 0) location.reload(); else setTimeout(tick, 1000);
    };
    tick();
}

async function check() {
    let info;
    try { info = await fetchVersion(); } catch { return; } // offline / local dev without version.json
    const have = androidVersion();
    if (have != null && info.android_min && have < info.android_min) { blockOldApp(info, have); return; }
    if (loaded == null) { loaded = info.web; return; }
    if (info.web && info.web !== loaded) { clearInterval(timer); reloadSoon(); }
}

/** The build this page runs (version.json "web"), once the first check has answered. */
export const currentBuild = () => loaded;

/** Start watching for new versions (call once at boot). */
export function watchForUpdates() {
    check();
    timer = setInterval(() => { if (document.visibilityState === 'visible') check(); }, CHECK_MS);
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') check(); });
    window.addEventListener('online', check);
}
