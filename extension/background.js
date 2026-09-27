// PMS — UMS sync: service worker.
// Hourly: export the Group List from the logged-in UMS tab → keep it → hand it to open PMS tabs.
importScripts('ums-export.js');

const PMS_TABS = ['https://faizehashemi.github.io/*', 'http://localhost/*', 'http://127.0.0.1/*'];
const DEFAULTS = {
    umsUrl: '',          // the UMS Group List page, e.g. https://ums.example.com/GroupList.aspx
    exportSelector: '',  // optional CSS selector of the export control (auto-detected if empty)
    intervalMin: 60,     // how often to fetch
    keepAliveMin: 10,    // ping the UMS tab this often so the session does not expire (0 = off)
    openTab: true,       // open a pinned UMS tab in the background if none is open
};

async function settings() {
    return { ...DEFAULTS, ...(await chrome.storage.sync.get(Object.keys(DEFAULTS))) };
}

/* -------------------------------- schedule -------------------------------- */

async function schedule() {
    const s = await settings();
    await chrome.alarms.clearAll();
    if (!s.umsUrl) return;
    chrome.alarms.create('fetch', { delayInMinutes: 1, periodInMinutes: Math.max(5, Number(s.intervalMin) || 60) });
    if (Number(s.keepAliveMin) > 0) chrome.alarms.create('keepalive', { periodInMinutes: Math.max(1, Number(s.keepAliveMin)) });
}
chrome.runtime.onInstalled.addListener(schedule);
chrome.runtime.onStartup.addListener(schedule);
chrome.storage.onChanged.addListener((_, area) => { if (area === 'sync') schedule(); });
chrome.alarms.onAlarm.addListener((a) => {
    if (a.name === 'fetch') runFetch('schedule');
    if (a.name === 'keepalive') keepAlive();
});
chrome.action.onClicked.addListener(() => chrome.runtime.openOptionsPage());

/* ---------------------------------- tabs ---------------------------------- */

function tabPattern(url) {
    const u = new URL(url);
    return `${u.origin}${u.pathname}*`;
}

function waitComplete(tabId, ms = 60000) {
    return new Promise((resolve) => {
        const done = () => { chrome.tabs.onUpdated.removeListener(onUpd); clearTimeout(t); resolve(); };
        const onUpd = (id, info) => { if (id === tabId && info.status === 'complete') done(); };
        const t = setTimeout(done, ms);
        chrome.tabs.onUpdated.addListener(onUpd);
        chrome.tabs.get(tabId).then(tab => { if (tab.status === 'complete') done(); }).catch(done);
    });
}

async function umsTab(s, allowOpen) {
    const [tab] = await chrome.tabs.query({ url: tabPattern(s.umsUrl) });
    if (tab) return tab;
    if (!allowOpen || !s.openTab) return null;
    const created = await chrome.tabs.create({ url: s.umsUrl, active: false, pinned: true });
    await waitComplete(created.id);
    return created;
}

async function broadcast(msg) {
    const tabs = await chrome.tabs.query({ url: PMS_TABS });
    await Promise.all(tabs.map(t => chrome.tabs.sendMessage(t.id, msg).catch(() => { })));
}

/* ---------------------------------- fetch ---------------------------------- */

let running = null;
function runFetch(reason) {
    if (!running) running = doFetch(reason).finally(() => { running = null; });
    return running;
}

async function report(status) {
    const at = new Date().toISOString();
    const full = { ...status, at };
    const { lastStatus } = await chrome.storage.local.get('lastStatus');
    await chrome.storage.local.set({ lastStatus: full });
    chrome.action.setBadgeText({ text: status.ok ? '' : '!' });
    chrome.action.setBadgeBackgroundColor({ color: '#a12a2a' });
    chrome.action.setTitle({ title: status.ok ? `UMS sync — last fetch OK (${new Date(at).toLocaleTimeString()})` : `UMS sync — ${status.error}` });
    // notify once per new problem, not every hour
    if (!status.ok && (!lastStatus || lastStatus.ok || lastStatus.error !== status.error)) {
        chrome.notifications.create('ums-sync', { type: 'basic', iconUrl: 'icon.png', title: 'UMS sync needs attention', message: status.error, priority: 1 });
    }
    await broadcast({ type: 'status', ...full });
    return full;
}

async function doFetch(reason) {
    const s = await settings();
    if (!s.umsUrl) return report({ ok: false, error: 'Set the UMS Group List page address in the extension options.' });
    const origin = new URL(s.umsUrl).origin + '/*';
    if (!(await chrome.permissions.contains({ origins: [origin] }))) {
        return report({ ok: false, error: 'Access to the UMS site is not granted yet — open the extension options and press Save.' });
    }
    const tab = await umsTab(s, true);
    if (!tab) return report({ ok: false, error: 'No UMS tab is open. Open the Group List page and log in.' });

    let result;
    try {
        [{ result }] = await chrome.scripting.executeScript({ target: { tabId: tab.id }, func: umsExport, args: [s.exportSelector || ''] });
    } catch (e) {
        return report({ ok: false, error: 'Could not run in the UMS tab: ' + (e && e.message || e) });
    }
    if (!result || !result.ok) return report({ ok: false, error: (result && result.error) || 'The export returned nothing.' });

    const stamp = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 12);
    const file = { html: result.html, fileName: result.fileName || `GroupList_${stamp}.xls`, fetchedAt: new Date().toISOString(), bytes: result.html.length, reason };
    await chrome.storage.local.set({ latest: file });
    await broadcast({ type: 'file', html: file.html, fileName: file.fileName, fetchedAt: file.fetchedAt });
    return report({ ok: true, fileName: file.fileName, bytes: file.bytes });
}

async function keepAlive() {
    const s = await settings();
    if (!s.umsUrl) return;
    const tab = await umsTab(s, false);
    if (!tab) return;
    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => fetch(location.href, { credentials: 'include', cache: 'no-store' }).then(r => r.status).catch(() => 0),
    }).catch(() => { });
}

/* ------------------------------ messages ------------------------------ */

chrome.runtime.onMessage.addListener((msg, _sender, reply) => {
    (async () => {
        if (msg?.type === 'fetch-now') return reply(await runFetch('manual'));
        if (msg?.type === 'get-latest') {
            const { latest, lastStatus } = await chrome.storage.local.get(['latest', 'lastStatus']);
            return reply({ latest: latest ? { html: latest.html, fileName: latest.fileName, fetchedAt: latest.fetchedAt } : null, status: lastStatus || null });
        }
        if (msg?.type === 'state') {
            const { latest, lastStatus } = await chrome.storage.local.get(['latest', 'lastStatus']);
            return reply({ lastStatus: lastStatus || null, latest: latest ? { fileName: latest.fileName, fetchedAt: latest.fetchedAt, bytes: latest.bytes } : null, alarms: await chrome.alarms.getAll() });
        }
        reply(null);
    })();
    return true; // async reply
});
