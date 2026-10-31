// Recording mode: a person uses the UMS normally in a visible browser, and the recorder writes down what happens — the live DOM of every page and of every change an
// UpdatePanel makes, the structure of its forms / postbacks / tables, the clicks that led to each state, and the requests the browser sent (form fields, with passwords and
// ViewState blanked; no cookies or Authorization headers ever). The folder it produces is what Claude reads to build PMS pages over the UMS.
//
// Layout of  <dataDir>/recordings/<timestamp>-<name>/ :
//   index.json            ordered steps: { n, at, trigger, url, title, click?, html, screenshot, summary, requests: [ids] }
//   NNN-<slug>.html       the page's DOM at that moment (what the browser really shows after scripts ran)
//   NNN-<slug>.summary.json   forms, controls, postback targets, tables, validators, UpdatePanels …
//   NNN-<slug>.png        screenshot
//   requests.jsonl        one line per document / XHR request: method, url, form fields, status, content type, UpdatePanel delta parts
//   downloads/            files the UMS offered (exports)
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { parseDelta, redactForm, slug, summarizePage } from './summarize.js';

const CLICK_SCRIPT = `
(() => {
  const send = (d) => { try { window.__umsRecClick && window.__umsRecClick(d); } catch (e) {} };
  document.addEventListener('click', (e) => {
    const el = e.target.closest && e.target.closest('a, button, input, select, [onclick], [role=button], td, tr, span');
    if (!el) return;
    send({ tag: el.tagName.toLowerCase(), id: el.id || undefined, name: el.getAttribute('name') || undefined, type: el.getAttribute('type') || undefined,
      text: (el.innerText || el.value || '').replace(/\\s+/g, ' ').trim().slice(0, 80), href: (el.getAttribute('href') || '').slice(0, 160) || undefined, onclick: (el.getAttribute('onclick') || '').slice(0, 200) || undefined });
  }, true);
  document.addEventListener('change', (e) => {
    const el = e.target; if (!el || !el.tagName) return;
    send({ tag: el.tagName.toLowerCase(), id: el.id || undefined, name: el.getAttribute('name') || undefined, type: el.getAttribute('type') || undefined, change: true,
      value: el.type === 'password' ? '[not recorded]' : String(el.value || '').slice(0, 80) });
  }, true);
  const hook = () => { try { const prm = window.Sys && Sys.WebForms && Sys.WebForms.PageRequestManager && Sys.WebForms.PageRequestManager.getInstance();
    if (prm && !prm.__umsRecHooked) { prm.__umsRecHooked = true; prm.add_endRequest(() => { try { window.__umsRecAsync && window.__umsRecAsync(); } catch (e) {} }); } } catch (e) {} };
  hook(); document.addEventListener('DOMContentLoaded', hook); const t = setInterval(hook, 500); setTimeout(() => clearInterval(t), 20000);
})();`;

export class Recorder {
    constructor({ dir, logger, name = 'session', settleMs = 700 }) {
        const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
        this.dir = path.join(dir, 'recordings', `${stamp}-${slug(name)}`);
        fs.mkdirSync(path.join(this.dir, 'downloads'), { recursive: true });
        this.log = logger; this.settleMs = settleMs;
        this.steps = []; this.reqSeq = 0; this.lastClick = null; this.lastHash = ''; this.timer = null; this.stopped = false;
        this.reqStream = fs.createWriteStream(path.join(this.dir, 'requests.jsonl'));
    }

    /** Start watching a browser context (every page and popup in it). */
    async attach(context) {
        await context.exposeBinding('__umsRecClick', (src, d) => { this.lastClick = { ...d, at: new Date().toISOString() }; this.#changeNote(d); });
        await context.exposeBinding('__umsRecAsync', (src) => this.#schedule(src.page, 'async-postback'));
        await context.addInitScript(CLICK_SCRIPT);
        const watch = (page) => {
            page.on('framenavigated', (f) => { if (f === page.mainFrame()) this.#schedule(page, 'navigation'); });
            page.on('load', () => this.#schedule(page, 'load'));
            page.on('response', (res) => this.#response(res).catch(() => {}));
            page.on('download', (d) => this.#download(d).catch(() => {}));
        };
        context.pages().forEach(watch);
        context.on('page', watch);
    }

    #changeNote(d) { if (d?.change) this.lastClick = { ...this.lastClick, ...d }; }

    #schedule(page, trigger) {
        if (this.stopped) return;
        clearTimeout(this.timer);
        this.pending = { page, trigger: this.pending?.trigger === 'navigation' ? 'navigation' : trigger };
        this.timer = setTimeout(() => { const p = this.pending; this.pending = null; this.snapshot(p.page, { trigger: p.trigger }).catch((e) => this.log.warn('snapshot failed', { error: e })); }, this.settleMs);
    }

    async #response(res) {
        const req = res.request(), type = req.resourceType();
        if (!['document', 'xhr', 'fetch'].includes(type)) return;
        const id = ++this.reqSeq;
        const h = res.headers();
        const line = { id, at: new Date().toISOString(), method: req.method(), url: req.url(), type, status: res.status(), contentType: h['content-type'] || '', contentDisposition: h['content-disposition'] || undefined, location: h.location || undefined, form: redactForm(req.postData()) };
        const ajax = /delta=true/i.test(req.headers()['x-microsoftajax'] || '');
        if (ajax) {
            line.asyncPostback = true;
            try { const body = await res.text(); line.delta = parseDelta(body); line.bodyHead = body.slice(0, 1500); } catch { /* redirect / closed */ }
        } else if (type !== 'document' && /json|xml|text/i.test(line.contentType)) {
            try { line.bodyHead = (await res.text()).slice(0, 1500); } catch { /* ignore */ }
        }
        this.reqStream.write(JSON.stringify(line) + '\n');
        this.lastRequestId = id;
    }

    async #download(d) {
        const name = d.suggestedFilename();
        const file = path.join(this.dir, 'downloads', `${Date.now()}-${name}`);
        await d.saveAs(file);
        this.log.info('download saved', { file });
        this.reqStream.write(JSON.stringify({ id: ++this.reqSeq, at: new Date().toISOString(), download: name, saved: path.relative(this.dir, file), bytes: fs.statSync(file).size }) + '\n');
    }

    /** Write the page as it is now. `label` marks a manual snapshot. */
    async snapshot(page, { trigger = 'manual', label = '' } = {}) {
        if (page.isClosed()) return null;
        await page.waitForLoadState('domcontentloaded').catch(() => {});
        const html = await page.content();
        const hash = crypto.createHash('sha1').update(html).digest('hex');
        if (trigger !== 'manual' && hash === this.lastHash) return null;            // nothing changed
        this.lastHash = hash;
        const n = this.steps.length + 1, base = `${String(n).padStart(3, '0')}-${slug(label || page.url())}`;
        const summary = await page.evaluate(summarizePage).catch((e) => ({ error: String(e.message || e) }));
        fs.writeFileSync(path.join(this.dir, `${base}.html`), html);
        fs.writeFileSync(path.join(this.dir, `${base}.summary.json`), JSON.stringify(summary, null, 2));
        await page.screenshot({ path: path.join(this.dir, `${base}.png`), fullPage: true }).catch(() => {});
        const step = { n, at: new Date().toISOString(), trigger, label: label || undefined, url: page.url(), title: await page.title().catch(() => ''), click: this.lastClick || undefined,
            requestsUpTo: this.lastRequestId || 0, html: `${base}.html`, summary: `${base}.summary.json`, screenshot: `${base}.png` };
        this.steps.push(step); this.lastClick = null;
        fs.writeFileSync(path.join(this.dir, 'index.json'), JSON.stringify({ startedAt: this.steps[0].at, steps: this.steps }, null, 2));
        this.log.info('recorded', { n, trigger, url: step.url });
        this.onStep?.(step);
        return step;
    }

    async finish() {
        this.stopped = true; clearTimeout(this.timer);
        await new Promise(r => this.reqStream.end(r));
        return { dir: this.dir, steps: this.steps.length };
    }
}
