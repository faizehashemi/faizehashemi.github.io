// Runs INSIDE the logged-in UMS Group List tab (injected with chrome.scripting.executeScript),
// so the request carries the user's own UMS session. Must stay self-contained: Chrome serializes
// this function on its own, without anything else from this file.
//
// It does what clicking the page's "Export" control does in ASP.NET WebForms — post the page's
// form (ViewState, current filters) with that control as the event source — but reads the
// response instead of letting the browser download it.
//
// Returns { ok: true, html, fileName, status } or { ok: false, error, status? }.

// eslint-disable-next-line no-unused-vars
async function umsExport(selector) {
    const looksLikeExport = (el) => /export|excel|xls/i.test([el.value, el.textContent, el.title, el.id, el.name].filter(Boolean).join(' '));
    const pick = () => {
        if (selector) return document.querySelector(selector);
        return [...document.querySelectorAll('input[type=submit], input[type=button], input[type=image], button, a')]
            .find(el => looksLikeExport(el) && el.offsetParent !== null) ||
            [...document.querySelectorAll('input[type=submit], input[type=image], button, a')].find(looksLikeExport);
    };

    const el = pick();
    if (!el) return { ok: false, error: `No export control found on ${location.pathname}. Is this tab logged in and on the Group List page?${selector ? ' (selector: ' + selector + ')' : ''}` };

    const form = el.form || el.closest('form') || document.forms[0];
    if (!form) return { ok: false, error: 'The export control is not inside a form.' };

    let fd;
    const postBack = String(el.getAttribute('href') || el.getAttribute('onclick') || '').match(/__doPostBack\(\s*'([^']*)'\s*,\s*'([^']*)'\s*\)/);
    if (postBack) {
        // LinkButton / __doPostBack: the event source travels in __EVENTTARGET
        fd = new FormData(form);
        fd.set('__EVENTTARGET', postBack[1]);
        fd.set('__EVENTARGUMENT', postBack[2]);
    } else if (el.form === form && /^(submit|image)$/i.test(el.type || '')) {
        try { fd = new FormData(form, el); }             // includes the button's name=value
        catch { fd = new FormData(form); if (el.name) fd.set(el.name, el.value || ''); }
        if (el.type === 'image' && el.name && !fd.has(el.name + '.x')) { fd.set(el.name + '.x', '1'); fd.set(el.name + '.y', '1'); }
    } else {
        return { ok: false, error: 'The export control is neither a submit button nor a __doPostBack link; set its CSS selector in the extension options.' };
    }

    const multipart = /multipart/i.test(form.enctype || '');
    const body = multipart ? fd : new URLSearchParams([...fd].filter(([, v]) => typeof v === 'string'));
    let res;
    try {
        res = await fetch(form.action || location.href, { method: 'POST', body, credentials: 'include', cache: 'no-store', redirect: 'follow' });
    } catch (e) {
        return { ok: false, error: 'Network error while exporting: ' + (e && e.message || e) };
    }
    const html = await res.text();
    if (!res.ok) return { ok: false, status: res.status, error: `UMS answered ${res.status} to the export request.` };
    // The page itself also shows the grid, so a re-rendered page must not pass as an export
    if (/name="__VIEWSTATE"/i.test(html)) {
        return { ok: false, status: res.status, error: /password|login|sign\s*in/i.test(html) && !/SH\s*Ref/i.test(html)
            ? 'UMS returned its login page — the session has expired. Log in to UMS again.'
            : 'UMS returned the page instead of the export file. Set the export control\'s CSS selector in the extension options.' };
    }
    if (!/<table/i.test(html) || !/SH\s*Ref/i.test(html)) {
        return { ok: false, status: res.status, error: /password|login|sign\s*in/i.test(html) ? 'UMS returned its login page — the session has expired. Log in to UMS again.' : 'UMS did not return the Group List table.' };
    }
    const cd = res.headers.get('content-disposition') || '';
    const fn = (cd.match(/filename\*?=(?:UTF-8'')?"?([^";]+)"?/i) || [])[1];
    return { ok: true, status: res.status, html, fileName: fn ? decodeURIComponent(fn) : '' };
}
