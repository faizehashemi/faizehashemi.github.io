// Helpers for ASP.NET Web Forms pages: finding controls by their generated names (ctl00$ContentPlaceHolder1$txtFrom …), filling forms, submitting full
// and UpdatePanel (async) postbacks and waiting for them, reading validation messages, extracting GridView tables, capturing downloads.
// ViewState / EventValidation are never touched by hand — the real browser posts them, which is the whole point of using one.
import fs from 'node:fs';
import path from 'node:path';
import { ExtractError, FormError, NavigationError } from './errors.js';

/** Installed in every page: a marker that changes when the page reloads, and a counter that rises when an UpdatePanel request ends. */
export const HOOK_SCRIPT = `
(() => {
  window.__umsMarker = Math.random().toString(36).slice(2);
  window.__umsAsync = 0;
  const hook = () => {
    try {
      const prm = window.Sys && Sys.WebForms && Sys.WebForms.PageRequestManager && Sys.WebForms.PageRequestManager.getInstance();
      if (prm && !prm.__umsHooked) { prm.__umsHooked = true; prm.add_endRequest(() => { window.__umsAsync++; }); }
    } catch (e) {}
  };
  document.addEventListener('DOMContentLoaded', hook); hook();
  const t = setInterval(() => { hook(); }, 500); setTimeout(() => clearInterval(t), 15000);
})();`;

const looksCss = (k) => /^[#.[]|[\s>:[\]=]/.test(k);
const cssEsc = (s) => String(s).replace(/(["\\])/g, '\\$1');

/** Pure: the CSS selectors to try for a field name, best first. "txtFrom" matches name="ctl00$…$txtFrom" and id="ctl00_…_txtFrom". */
export function selectorCandidates(key) {
    const k = String(key).trim();
    if (looksCss(k)) return [k];
    const e = cssEsc(k);
    return [`[name="${e}"]`, `[id="${e}"]`, `[name$="$${e}"]`, `[id$="_${e}"]`, `[name$="${e}"]`];
}

export async function locate(page, key) {
    for (const sel of selectorCandidates(key)) {
        const loc = page.locator(sel);
        const n = await loc.count().catch(() => 0);
        if (n === 1) return loc;
        if (n > 1) { const vis = loc.locator('visible=true'); if (await vis.count() === 1) return vis; return loc.first(); }
    }
    const byLabel = page.getByLabel(String(key), { exact: false });
    if (await byLabel.count().catch(() => 0)) return byLabel.first();
    throw new FormError(`No control found for "${key}" on ${page.url()}`, { details: { key, candidates: selectorCandidates(key) } });
}

/** values: { field: 'text' | true | false | ['a','b'] | { file: '/path' } | { label: 'Option text' } } */
export async function fillForm(page, values) {
    for (const [key, val] of Object.entries(values || {})) {
        const loc = await locate(page, key);
        const info = await loc.evaluate(el => ({ tag: el.tagName.toLowerCase(), type: (el.type || '').toLowerCase() }));
        try {
            if (info.tag === 'select') {
                if (val && typeof val === 'object' && !Array.isArray(val)) await loc.selectOption({ label: String(val.label) });
                else await loc.selectOption(Array.isArray(val) ? val.map(String) : String(val));
            } else if (info.type === 'checkbox' || info.type === 'radio') {
                if (val === false) await loc.uncheck(); else await loc.check();
            } else if (info.type === 'file') {
                await loc.setInputFiles(val && val.file ? val.file : String(val));
            } else {
                await loc.fill(String(val ?? ''));
                await loc.dispatchEvent('change');
            }
        } catch (e) { throw new FormError(`Could not set "${key}": ${e.message}`, { cause: e, details: { key } }); }
    }
}

/** Visible validator / error messages (RequiredFieldValidator spans, ValidationSummary, red labels). */
export async function readValidation(page) {
    return page.evaluate(() => {
        const out = [];
        const vis = (el) => { const s = getComputedStyle(el), r = el.getBoundingClientRect(); return s.visibility !== 'hidden' && s.display !== 'none' && r.width > 0 && r.height > 0; };
        for (const el of document.querySelectorAll('[id*="Validator" i], [id*="Validation" i], .validation-summary-errors, .field-validation-error, [id*="lblError" i], [id*="lblMessage" i], .error, span[style*="color:Red" i], span[style*="color: red" i]')) {
            const t = (el.textContent || '').trim().replace(/\s+/g, ' ');
            if (t && vis(el) && !out.includes(t)) out.push(t.slice(0, 300));
        }
        return out;
    }).catch(() => []);
}

/**
 * Run `action` (a click, a __doPostBack …) and wait until the page has answered: a full reload, or an UpdatePanel round trip.
 * If neither happens (client-side validation stopped it) the visible validation messages come back in the FormError.
 */
export async function afterAction(page, action, { timeout = 30000, expect = 'any' } = {}) {
    const before = await page.evaluate(() => ({ m: window.__umsMarker, c: window.__umsAsync || 0 })).catch(() => ({ m: null, c: 0 }));
    await action();
    try {
        await page.waitForFunction(({ m, c, expect }) => {
            const reloaded = window.__umsMarker !== m;
            const async_ = (window.__umsAsync || 0) > c;
            return expect === 'reload' ? reloaded : expect === 'async' ? async_ : reloaded || async_;
        }, { ...before, expect }, { timeout });
    } catch (e) {
        const msgs = await readValidation(page);
        throw new FormError(msgs.length ? `The page did not submit: ${msgs.join(' | ')}` : 'The page did not respond to the action in time.', { cause: e, details: { validation: msgs, url: page.url() } });
    }
    await page.waitForLoadState('domcontentloaded').catch(() => {});
}

/** Click a control and wait for the postback it causes. */
export async function clickAndWait(page, key, opts) {
    const loc = await locate(page, key);
    return afterAction(page, () => loc.click(), opts);
}

/** __doPostBack(target, argument), as a LinkButton or GridView pager would. */
export async function postBack(page, target, argument = '', opts) {
    const ok = await page.evaluate(() => typeof window.__doPostBack === 'function');
    if (!ok) throw new FormError('This page has no __doPostBack — is it a Web Forms page?', { details: { url: page.url() } });
    return afterAction(page, () => page.evaluate(([t, a]) => window.__doPostBack(t, a), [target, argument]), opts);
}

/** A table as { headers, rows } (rows are arrays) and, when it has a header row, `records` (objects keyed by header). */
export async function extractTable(page, selector, { headerRow = true } = {}) {
    const raw = await page.evaluate(({ selector, headerRow }) => {
        const t = document.querySelector(selector);
        if (!t) return null;
        const text = (c) => (c.innerText ?? c.textContent ?? '').replace(/\s+/g, ' ').trim();
        const trs = [...t.querySelectorAll(':scope > thead > tr, :scope > tbody > tr, :scope > tr, :scope > tfoot > tr')];
        const rows = trs.map(tr => [...tr.children].filter(c => /^t[dh]$/i.test(c.tagName)).map(text)).filter(r => r.length);
        return { rows, headerRow };
    }, { selector, headerRow });
    if (!raw) throw new ExtractError(`No table matches ${selector} on ${page.url()}`, { details: { selector } });
    const headers = headerRow && raw.rows.length ? raw.rows[0] : [];
    const body = headerRow ? raw.rows.slice(1) : raw.rows;
    const records = headers.length ? body.map(r => Object.fromEntries(headers.map((h, i) => [h || `col${i + 1}`, r[i] ?? '']))) : [];
    return { headers, rows: body, records };
}

/** A paged GridView: read a page, press Next (a link matching nextSelector) until it is gone, stops on a repeated page or maxPages. */
export async function extractPaged(page, selector, { nextSelector = 'a[href*="Page$Next"], a[href*="Page$"]:has-text("Next"), a:has-text("›"), a:has-text(">")', maxPages = 200 } = {}) {
    let all = null, last = '';
    for (let i = 0; i < maxPages; i++) {
        const t = await extractTable(page, selector);
        const sig = JSON.stringify(t.rows.slice(0, 2));
        if (sig === last) break;
        last = sig;
        all = all ? { ...all, rows: all.rows.concat(t.rows), records: all.records.concat(t.records) } : t;
        const next = page.locator(nextSelector).first();
        if (!(await next.count()) || !(await next.isEnabled().catch(() => false))) break;
        await afterAction(page, () => next.click());
    }
    return { ...all, pages: undefined };
}

/**
 * Trigger an export and capture what comes back: a browser download (Content-Disposition: attachment) or a response whose body is the file (the UMS
 * "xls" is an HTML table). Returns { fileName, path?, body: Buffer, contentType }.
 */
export async function captureExport(page, trigger, { outDir, timeout = 60000, accept } = {}) {
    const isFile = (res) => {
        const h = res.headers();
        if (/attachment/i.test(h['content-disposition'] || '')) return true;
        return accept ? accept(res, h) : /excel|spreadsheet|csv|octet-stream/i.test(h['content-type'] || '');
    };
    const dl = page.waitForEvent('download', { timeout }).then(async d => {
        const name = d.suggestedFilename();
        const p = outDir ? path.join(outDir, `${Date.now()}-${name}`) : null;
        if (p) { fs.mkdirSync(outDir, { recursive: true }); await d.saveAs(p); }
        const body = p ? fs.readFileSync(p) : fs.readFileSync(await d.path());
        return { fileName: name, path: p, body, contentType: '' };
    });
    const resp = page.waitForResponse(r => r.request().method() === 'POST' && r.ok() && isFile(r), { timeout }).then(async r => {
        const cd = r.headers()['content-disposition'] || '';
        const fn = (cd.match(/filename\*?=(?:UTF-8'')?"?([^";]+)"?/i) || [])[1];
        const body = await r.body();
        const name = fn ? decodeURIComponent(fn) : `export-${Date.now()}`;
        let p = null;
        if (outDir) { fs.mkdirSync(outDir, { recursive: true }); p = path.join(outDir, `${Date.now()}-${name}`); fs.writeFileSync(p, body); }
        return { fileName: name, path: p, body, contentType: r.headers()['content-type'] || '' };
    });
    dl.catch(() => {}); resp.catch(() => {});
    await trigger();
    try { return await Promise.any([dl, resp]); }
    catch (e) { throw new NavigationError('The export did not produce a file in time.', { cause: e, details: { url: page.url() } }); }
}
