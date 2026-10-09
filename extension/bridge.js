// Content script on PMS pages: relays between the page (window.postMessage) and the extension.
// The page side lives in app/core/ums-auto.js.
(() => {
    if (!document.querySelector('site-nav')) return; // only the PMS app shell, not other localhost pages

    const toPage = (m) => window.postMessage({ source: 'pms-ums-extension', ...m }, location.origin);
    const deliver = (r) => {
        if (!r) return;
        if (r.status) toPage({ type: 'status', ...r.status });
        if (r.latest) toPage({ type: 'file', ...r.latest });
    };

    toPage({ type: 'hello', version: chrome.runtime.getManifest().version });

    // pushed by the service worker after each fetch
    chrome.runtime.onMessage.addListener((m) => {
        if (m && (m.type === 'file' || m.type === 'status')) toPage(m);
    });

    // requests from the page
    window.addEventListener('message', (e) => {
        if (e.source !== window || e.origin !== location.origin || !e.data || e.data.source !== 'pms-app') return;
        if (e.data.type === 'fetch-now') chrome.runtime.sendMessage({ type: 'fetch-now' }).then(st => st && toPage({ type: 'status', ...st })).catch(() => { });
        if (e.data.type === 'get-latest') chrome.runtime.sendMessage({ type: 'get-latest' }).then(deliver).catch(() => { });
    });

    // a page opened after the last fetch still gets it (the page skips files it already applied)
    chrome.runtime.sendMessage({ type: 'get-latest' }).then(deliver).catch(() => { });
})();
