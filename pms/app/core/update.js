// Forced updates.
//   Website: version.json (written by web/deploy.sh at every publish) carries a build id. Every open page —
//   browser or Android app — checks it every 5 minutes and when it comes back to the screen; a new build
//   reloads the page after a 10-second notice (offline laundry bills are safe: they live in localStorage).
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

function reloadSoon() {
    let n = 10;
    const tick = () => {
        overlay(`<div style="font-size:44px">✨</div><h2 style="margin:6px 0 8px;font-size:20px">A new version of the PMS is out</h2>
            <p style="margin:0 0 14px">Updating in <b>${n}</b> second${n === 1 ? '' : 's'}…</p>
            <button type="button" id="pmsUpdNow" style="padding:12px 18px;border:0;border-radius:12px;background:#d4af37;color:#fff;font:inherit;font-weight:800;cursor:pointer">Update now</button>`);
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

/** Start watching for new versions (call once at boot). */
export function watchForUpdates() {
    check();
    timer = setInterval(() => { if (document.visibilityState === 'visible') check(); }, CHECK_MS);
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') check(); });
    window.addEventListener('online', check);
}
