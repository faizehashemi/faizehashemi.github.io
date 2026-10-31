// What the recorder writes down about a page, as structure: forms and controls, postback targets, UpdatePanels, tables, validators — the facts needed to automate a Web Forms
// screen (and to build our own page over it) without reading the raw HTML. summarizePage() runs INSIDE the page and must stay self-contained.

export function summarizePage() {
    const txt = (el, n = 120) => (el?.innerText ?? el?.textContent ?? '').replace(/\s+/g, ' ').trim().slice(0, n);
    const vis = (el) => { const r = el.getBoundingClientRect(), s = getComputedStyle(el); return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none'; };
    const label = (el) => {
        const id = el.id && document.querySelector(`label[for="${CSS.escape(el.id)}"]`);
        return txt(id || el.closest('label') || el.closest('td')?.previousElementSibling, 80);
    };
    const control = (el) => {
        const o = { tag: el.tagName.toLowerCase(), type: (el.getAttribute('type') || '').toLowerCase() || undefined, id: el.id || undefined, name: el.getAttribute('name') || undefined, visible: vis(el), label: label(el) || undefined };
        if (o.tag === 'select') o.options = [...el.options].slice(0, 60).map(op => ({ value: op.value, text: txt(op, 60), selected: op.selected || undefined }));
        else if (o.type === 'password') o.value = '[not recorded]';
        else if (o.type === 'checkbox' || o.type === 'radio') o.checked = el.checked;
        else if (o.type !== 'hidden' || !/^__/.test(o.name || '')) o.value = String(el.value ?? '').slice(0, 120);
        else o.length = String(el.value ?? '').length;           // __VIEWSTATE and friends: only their size
        if (el.required) o.required = true;
        if (el.maxLength > 0 && el.maxLength < 100000) o.maxLength = el.maxLength;
        const oc = el.getAttribute('onclick'); if (oc) o.onclick = oc.slice(0, 200);
        if (el.disabled) o.disabled = true;
        return o;
    };
    const postbacks = [];
    for (const el of document.querySelectorAll('a[href*="__doPostBack"], [onclick*="__doPostBack"], [onchange*="__doPostBack"]')) {
        const src = [el.getAttribute('href'), el.getAttribute('onclick'), el.getAttribute('onchange')].filter(Boolean).join(' ');
        const m = src.match(/__doPostBack\(\s*'([^']*)'\s*,\s*'([^']*)'\s*\)/) || src.match(/WebForm_DoPostBackWithOptions\(new WebForm_PostBackOptions\("([^"]*)"/);
        if (m) postbacks.push({ target: m[1], argument: m[2] ?? '', element: el.tagName.toLowerCase(), id: el.id || undefined, text: txt(el, 60), visible: vis(el) });
    }
    const tables = [...document.querySelectorAll('table')].filter(t => t.rows.length > 1 && !t.closest('table table')).map(t => {
        const rows = [...t.rows].map(tr => [...tr.cells].map(c => txt(c, 60)));
        const headerRow = t.querySelector('thead tr') || t.rows[0];
        return {
            id: t.id || undefined, className: t.className || undefined, rows: t.rows.length, columns: Math.max(0, ...rows.map(r => r.length)),
            headers: [...(headerRow?.cells || [])].map(c => txt(c, 60)), sample: rows.slice(1, 4),
            pagerLinks: [...t.querySelectorAll('a[href*="Page$"]')].slice(0, 12).map(a => ({ text: txt(a, 20), href: (a.getAttribute('href') || '').slice(0, 120) })),
            rowActions: [...new Set([...t.querySelectorAll('a, input[type=submit], input[type=button], input[type=image], button')].slice(0, 200).map(a => (a.id || a.getAttribute('name') || txt(a, 30)).replace(/\d+/g, '#')))].slice(0, 12),
        };
    });
    const msgs = [...document.querySelectorAll('[id*="Validator" i], [id*="Validation" i], [id*="lblError" i], [id*="lblMessage" i], .error')].map(e => ({ id: e.id || undefined, text: txt(e, 200), visible: vis(e) })).filter(m => m.text || m.id).slice(0, 30);
    return {
        url: location.href, title: document.title, readyState: document.readyState,
        headings: [...document.querySelectorAll('h1, h2, h3')].map(h => txt(h, 80)).filter(Boolean).slice(0, 12),
        forms: [...document.forms].map(f => ({ id: f.id || undefined, name: f.name || undefined, action: f.getAttribute('action'), method: (f.method || 'get').toLowerCase(), enctype: f.enctype,
            controls: [...f.elements].filter(e => e.tagName !== 'FIELDSET' && e.tagName !== 'OBJECT').map(control) })),
        buttons: [...document.querySelectorAll('a[id], button, input[type=submit], input[type=button], input[type=image]')].filter(vis).slice(0, 150).map(e => ({ tag: e.tagName.toLowerCase(), id: e.id || undefined, name: e.getAttribute('name') || undefined, text: txt(e, 50) || e.getAttribute('value') || undefined, href: e.tagName === 'A' ? (e.getAttribute('href') || '').slice(0, 120) : undefined })),
        postbacks, tables, validation: msgs,
        updatePanels: [...document.querySelectorAll('[id*="UpdatePanel" i], div[id][style*="display"]')].filter(e => /UpdatePanel/i.test(e.id)).map(e => e.id),
        asp: { hasMicrosoftAjax: !!(window.Sys && window.Sys.WebForms), scriptManager: !!document.querySelector('[id*="ScriptManager" i]'), hasDoPostBack: typeof window.__doPostBack === 'function', masterPage: [...new Set([...document.querySelectorAll('[id^="ctl00_"]')].slice(0, 400).map(e => (e.id.match(/^(ctl00_[A-Za-z0-9]+)_/) || [])[1]).filter(Boolean))].slice(0, 12) },
        scripts: [...document.scripts].map(s => s.src).filter(Boolean).map(s => s.replace(location.origin, '')).slice(0, 40),
        menu: [...document.querySelectorAll('nav a, .menu a, #menu a, ul.nav a, [id*="menu" i] a')].slice(0, 120).map(a => ({ text: txt(a, 40), href: (a.getAttribute('href') || '').slice(0, 120) })),
    };
}

/** "a=1&b=2" (or multipart text) → { a: '1', b: '2' } with secrets and ViewState blanked to a note. */
export function redactForm(postData) {
    if (!postData) return null;
    const out = {};
    let params;
    try { params = new URLSearchParams(postData); } catch { return { _raw: String(postData).slice(0, 200) }; }
    for (const [k, v] of params) {
        if (/pass(word)?|pwd|secret/i.test(k)) out[k] = '[not recorded]';
        else if (/^__(VIEWSTATE|EVENTVALIDATION|VIEWSTATEGENERATOR|PREVIOUSPAGE)/i.test(k)) out[k] = `[${v.length} chars]`;
        else out[k] = v.length > 200 ? v.slice(0, 200) + `…(${v.length})` : v;
    }
    return out;
}

/** The ASP.NET UpdatePanel answer ("len|type|id|content|…") as a list of { type, id, length } plus the page title / redirect if present. */
export function parseDelta(text) {
    const parts = [];
    let i = 0;
    while (i < text.length) {
        const a = text.indexOf('|', i); if (a < 0) break;
        const len = Number(text.slice(i, a)); if (!Number.isInteger(len)) return null;
        const b = text.indexOf('|', a + 1); if (b < 0) break;
        const c = text.indexOf('|', b + 1); if (c < 0) break;
        parts.push({ type: text.slice(a + 1, b), id: text.slice(b + 1, c), length: len });
        i = c + 1 + len + 1;
    }
    return parts.length ? parts : null;
}

export const slug = (s) => String(s || '').toLowerCase().replace(/https?:\/\/[^/]+/, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 48) || 'page';
