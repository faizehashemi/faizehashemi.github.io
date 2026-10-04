// Signage Builder (Transport): design templates for the public board /<site>/signage on a 1920×1080 screen —
// drag elements from the palette (title, texts, date, clock, image, data table), move and resize them, pick and
// order the table's columns, set colours and a background image — save as templates in the cloud, and choose per
// trip type (every route in the imported lists) which template shows it and for how many seconds a slide.
// Drawing is shared with the board (core/signage.js); templates and slides live in the cloud (core/signage-api.js).
import { canWrite, UserError } from '../../core/cloud.js';
import { FIELDS, FONTS, STAGE_W, STAGE_H, newElement, classicLook, blankTemplate, renderTemplate, tripsOf, buildSlides, travelTo } from '../../core/signage.js';
import { loadSignage, saveSignageConfig, createTemplate, updateTemplate, deleteTemplate, loadTripTypes } from '../../core/signage-api.js';
import { loadDay, today } from '../../core/transport.js';
import { esc } from '../../core/transport-ui.js';

const GRID = 10;
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const clone = (o) => JSON.parse(JSON.stringify(o));

export default async function mount(ctx) {
    const $ = (id) => ctx.root.querySelector('#' + id);
    const writable = canWrite(ctx.siteId);
    $('sbDay').href = ctx.href('transport');
    $('sbBoard').href = `${ctx.siteId}/signage`;

    let templates = [], cfg = null, types = [];
    let cur = { id: null, name: '', version: 0, data: classicLook() };
    let sel = null, dirty = false, scale = 1;
    let undo = [], redo = [], lastKey = '', lastAt = 0;
    let preview = null; // the slide drawn (real trips) or null (sample rows)

    const status = (t, bad = false) => { $('sbStatus').textContent = t; $('sbStatus').style.color = bad ? '#a12a2a' : ''; };
    const elOf = (id) => cur.data.elements.find(e => e.id === id);
    const selected = () => elOf(sel);

    /* ------------------------------ history ------------------------------ */
    // change(fn, key): snapshot before the change (typing in one field within a second = one step)
    function change(fn, key = '') {
        const t = Date.now();
        if (!key || key !== lastKey || t - lastAt > 1000) { undo.push(JSON.stringify(cur.data)); if (undo.length > 80) undo.shift(); redo = []; }
        lastKey = key; lastAt = t;
        fn();
        setDirty(true);
        draw();
    }
    function step(from, to) {
        if (!from.length) return;
        to.push(JSON.stringify(cur.data));
        cur.data = JSON.parse(from.pop());
        if (!elOf(sel)) sel = null;
        lastKey = '';
        setDirty(true);
        draw(); inspector();
    }
    function setDirty(d) {
        dirty = d;
        $('sbSave').textContent = d ? '💾 Save *' : '💾 Save';
        $('sbUndo').disabled = !undo.length; $('sbRedo').disabled = !redo.length;
    }

    /* ------------------------------ canvas ------------------------------ */
    function fit() {
        scale = $('sbCanvas').clientWidth / STAGE_W || 1;
        $('sbStage').style.transform = `scale(${scale})`;
        placeSel();
    }
    function draw() {
        renderTemplate($('sbStage'), cur.data, preview);
        placeSel();
    }
    function placeSel() {
        const e = selected(), s = $('sbSel');
        s.hidden = !e;
        if (!e) return;
        Object.assign(s.style, { left: `${e.x * scale}px`, top: `${e.y * scale}px`, width: `${e.w * scale}px`, height: `${e.h * scale}px` });
    }
    const ro = new ResizeObserver(fit);
    ro.observe($('sbCanvas'));

    function select(id) { sel = id; placeSel(); inspector(); }

    // move / resize with the pointer
    const snap = (v, free) => free ? Math.round(v) : Math.round(v / GRID) * GRID;
    $('sbCanvas').addEventListener('pointerdown', (ev) => {
        const handle = ev.target.closest('.sb-sel i');
        const node = handle ? null : ev.target.closest('.sb-stage > [data-id]');
        if (!handle && !node) { select(null); return; }
        if (node && node.dataset.id !== sel) select(node.dataset.id);
        const e = selected();
        if (!e || !writable) return;
        ev.preventDefault();
        $('sbCanvas').focus({ preventScroll: true });
        const start = { x: ev.clientX, y: ev.clientY, e: { ...e } }, before = JSON.stringify(cur.data);
        const h = handle?.dataset.h;
        let moved = false;
        const move = (m) => {
            const dx = (m.clientX - start.x) / scale, dy = (m.clientY - start.y) / scale, free = m.shiftKey;
            if (!moved && Math.abs(dx) + Math.abs(dy) < 2) return;
            moved = true;
            const o = start.e;
            if (!h) {
                e.x = clamp(snap(o.x + dx, free), -o.w + 40, STAGE_W - 40);
                e.y = clamp(snap(o.y + dy, free), -o.h + 40, STAGE_H - 40);
            } else {
                let { x, y, w, h: hh } = o;
                if (h.includes('e')) w = snap(o.w + dx, free);
                if (h.includes('s')) hh = snap(o.h + dy, free);
                if (h.includes('w')) { x = snap(o.x + dx, free); w = o.w + (o.x - x); }
                if (h.includes('n')) { y = snap(o.y + dy, free); hh = o.h + (o.y - y); }
                if (w >= 30) { e.x = x; e.w = w; }
                if (hh >= 30) { e.y = y; e.h = hh; }
            }
            const n = $('sbStage').querySelector(`[data-id="${CSS.escape(e.id)}"]`);
            if (n) Object.assign(n.style, { left: `${e.x}px`, top: `${e.y}px`, width: `${e.w}px`, height: `${e.h}px` });
            placeSel();
        };
        const up = () => {
            removeEventListener('pointermove', move); removeEventListener('pointerup', up);
            if (!moved) return;
            undo.push(before); redo = []; lastKey = '';
            setDirty(true); draw(); inspector();
        };
        addEventListener('pointermove', move); addEventListener('pointerup', up);
    });

    // keyboard: Delete, arrows, Ctrl+Z / Ctrl+Y / Ctrl+D, Esc
    const onKey = (ev) => {
        if (!ctx.root.contains(document.activeElement) || document.activeElement.matches('input, textarea, select')) return;
        if ((ev.ctrlKey || ev.metaKey) && ev.key.toLowerCase() === 'z') { ev.preventDefault(); step(ev.shiftKey ? redo : undo, ev.shiftKey ? undo : redo); return; }
        if ((ev.ctrlKey || ev.metaKey) && ev.key.toLowerCase() === 'y') { ev.preventDefault(); step(redo, undo); return; }
        const e = selected();
        if (!e || !writable) return;
        if (ev.key === 'Escape') { select(null); return; }
        if (ev.key === 'Delete' || ev.key === 'Backspace') { ev.preventDefault(); removeSel(); return; }
        if ((ev.ctrlKey || ev.metaKey) && ev.key.toLowerCase() === 'd') { ev.preventDefault(); duplicate(); return; }
        const d = ev.shiftKey ? 10 : 1;
        const mv = { ArrowLeft: [-d, 0], ArrowRight: [d, 0], ArrowUp: [0, -d], ArrowDown: [0, d] }[ev.key];
        if (mv) { ev.preventDefault(); change(() => { e.x += mv[0]; e.y += mv[1]; }, 'nudge'); inspector(); }
    };
    document.addEventListener('keydown', onKey);

    function removeSel() { const id = sel; change(() => { cur.data.elements = cur.data.elements.filter(x => x.id !== id); }); select(null); }
    function duplicate() {
        const e = selected(); if (!e) return;
        const c = { ...clone(e), id: newElement('text').id, x: e.x + 30, y: e.y + 30 };
        change(() => cur.data.elements.push(c)); select(c.id);
    }

    /* ------------------------------ palette ------------------------------ */
    $('sbFields').innerHTML = Object.entries(FIELDS).map(([k, [label]]) => `<button type="button" class="sb-chip field" draggable="true" data-field="${k}">${esc(label)}</button>`).join('');

    function add(kind, x, y) {
        if (!writable) return;
        const e = newElement(kind);
        e.x = clamp(snap(x == null ? 120 + (cur.data.elements.length % 6) * 40 : x - e.w / 2), 0, STAGE_W - Math.min(e.w, STAGE_W));
        e.y = clamp(snap(y == null ? 120 + (cur.data.elements.length % 6) * 40 : y - e.h / 2), 0, STAGE_H - Math.min(e.h, STAGE_H));
        change(() => cur.data.elements.push(e));
        select(e.id);
    }
    function addColumn(field, x, y) {
        if (!writable) return;
        const tables = cur.data.elements.filter(e => e.type === 'table');
        const hit = x == null ? null : [...tables].reverse().find(t => x >= t.x && x <= t.x + t.w && y >= t.y && y <= t.y + t.h);
        const t = hit || (selected()?.type === 'table' ? selected() : tables[0]);
        if (!t) { status('Add a data table first, then drop columns on it.', true); return; }
        change(() => t.columns.push({ field, title: FIELDS[field][0], align: 'center' }));
        select(t.id);
    }
    for (const id of ['sbElements', 'sbFields']) {
        $(id).addEventListener('dragstart', (ev) => {
            const c = ev.target.closest('.sb-chip');
            if (!c) return;
            ev.dataTransfer.setData('text/plain', c.dataset.add ? `add:${c.dataset.add}` : `field:${c.dataset.field}`);
            ev.dataTransfer.effectAllowed = 'copy';
        });
        $(id).addEventListener('click', (ev) => {
            const c = ev.target.closest('.sb-chip');
            if (!c) return;
            if (c.dataset.add) add(c.dataset.add); else addColumn(c.dataset.field);
        });
    }
    const canvas = $('sbCanvas');
    canvas.addEventListener('dragover', (ev) => { ev.preventDefault(); ev.dataTransfer.dropEffect = 'copy'; canvas.classList.add('drop'); });
    canvas.addEventListener('dragleave', () => canvas.classList.remove('drop'));
    canvas.addEventListener('drop', (ev) => {
        ev.preventDefault();
        canvas.classList.remove('drop');
        const v = ev.dataTransfer.getData('text/plain') || '';
        const r = canvas.getBoundingClientRect();
        const x = (ev.clientX - r.left) / scale, y = (ev.clientY - r.top) / scale;
        if (v.startsWith('add:')) add(v.slice(4), x, y);
        else if (v.startsWith('field:') && FIELDS[v.slice(6)]) addColumn(v.slice(6), x, y);
    });

    /* ------------------------------ images ------------------------------ */
    // smaller copies keep templates light (whole template ≤ ~1.5 MB); WebP keeps transparency
    async function readImage(file, max) {
        const url = await new Promise((res, rej) => { const fr = new FileReader(); fr.onload = () => res(fr.result); fr.onerror = rej; fr.readAsDataURL(file); });
        if (file.size < 250e3 && /^data:image\/(png|jpeg|webp|gif);/.test(url)) return url;
        const img = await new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = url; });
        const k = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
        const c = document.createElement('canvas');
        c.width = Math.round(img.naturalWidth * k); c.height = Math.round(img.naturalHeight * k);
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        return c.toDataURL('image/webp', 0.82);
    }

    /* ------------------------------ background ------------------------------ */
    function bgControls() {
        $('sbBgColor').value = /^#[0-9a-f]{6}$/i.test(cur.data.bg?.color || '') ? cur.data.bg.color : '#ffffff';
        $('sbBgFit').value = cur.data.bg?.fit || 'cover';
        $('sbBgClear').disabled = !cur.data.bg?.image;
        for (const id of ['sbBgColor', 'sbBgFile', 'sbBgFit', 'sbBgClear']) $(id).disabled = !writable || (id === 'sbBgClear' && !cur.data.bg?.image);
    }
    $('sbBgColor').addEventListener('input', (ev) => change(() => { cur.data.bg.color = ev.target.value; }, 'bgcolor'));
    $('sbBgFit').addEventListener('change', (ev) => change(() => { cur.data.bg.fit = ev.target.value; }));
    $('sbBgClear').addEventListener('click', () => { change(() => { cur.data.bg.image = ''; }); bgControls(); });
    $('sbBgFile').addEventListener('change', async (ev) => {
        const f = ev.target.files[0];
        ev.target.value = '';
        if (!f) return;
        try { const src = await readImage(f, 1920); change(() => { cur.data.bg.image = src; }); bgControls(); }
        catch { status('Could not read that image.', true); }
    });

    /* ------------------------------ inspector ------------------------------ */
    const opt = (v, label, curV) => `<option value="${esc(v)}"${String(curV) === String(v) ? ' selected' : ''}>${esc(label)}</option>`;
    const num = (k, label, v, min = 0, max = 4000) => `<label>${label}<input type="number" data-k="${k}" data-t="num" min="${min}" max="${max}" value="${esc(v ?? '')}"></label>`;
    const color = (k, label, v, none = false) => `<label>${label}<span style="display:flex;gap:6px;align-items:center"><input type="color" data-k="${k}" value="${/^#[0-9a-f]{6}$/i.test(v || '') ? v : '#ffffff'}"${none && !v ? ' disabled' : ''}>${none ? `<input type="checkbox" data-none="${k}"${v ? '' : ' checked'} title="None"> none` : ''}</span></label>`;
    const check = (k, label, v) => `<label class="check"><input type="checkbox" data-k="${k}" data-t="bool"${v ? ' checked' : ''}>${label}</label>`;
    const sel1 = (k, label, v, list) => `<label>${label}<select data-k="${k}">${list.map(([a, b]) => opt(a, b, v)).join('')}</select></label>`;
    const fonts = FONTS.map(f => [f, f]);

    function inspector() {
        const e = selected();
        const box = $('sbInsp');
        if (!e) {
            box.innerHTML = `<h3>Selected element</h3><p class="sb-empty">Tap an element on the screen to change it, or drag one in from the left.</p>
              <h3>Layers</h3><div class="sb-cols">${[...cur.data.elements].reverse().map(x => `<button type="button" class="tp-btn" data-pick="${esc(x.id)}">${esc(label(x))}</button>`).join('') || '<span class="sb-empty">Empty screen.</span>'}</div>`;
            return;
        }
        let html = `<h3>${esc(label(e))}</h3>
          <div class="sb-insp-btns"><button type="button" class="tp-btn" data-act="front">Bring to front</button><button type="button" class="tp-btn" data-act="back">Send to back</button>
            <button type="button" class="tp-btn" data-act="dup">Duplicate</button><button type="button" class="tp-btn danger" data-act="del">Delete</button></div>
          <div class="sb-props"><div class="sb-row2">${num('x', 'X', e.x, -2000)}${num('y', 'Y', e.y, -2000)}${num('w', 'W', e.w, 30)}${num('h', 'H', e.h, 30)}</div></div>`;
        if (e.type === 'text') {
            html += `<div class="sb-props">
              <label>Text<textarea data-k="text">${esc(e.text)}</textarea></label>
              <p class="sb-empty">{type} trip type · {date} · {time} clock · {page} / {pages} · {trips} · {pax}</p>
              ${sel1('font', 'Font', e.font, fonts)}${num('size', 'Size (px)', e.size, 8, 400)}
              ${color('color', 'Colour', e.color)}${color('bg', 'Box colour', e.bg, true)}
              ${sel1('align', 'Align', e.align, [['left', 'Left'], ['center', 'Centre'], ['right', 'Right']])}
              ${sel1('valign', 'Vertical', e.valign, [['top', 'Top'], ['middle', 'Middle'], ['bottom', 'Bottom']])}
              ${check('bold', 'Bold', e.bold)}${check('italic', 'Italic', e.italic)}${check('underline', 'Underline', e.underline)}
              ${num('radius', 'Corners', e.radius, 0, 500)}${num('pad', 'Padding', e.pad ?? 8, 0, 200)}</div>`;
        } else if (e.type === 'image') {
            html += `<div class="sb-props">
              <label>Picture<input type="file" accept="image/*" data-file="src"></label>
              ${sel1('fit', 'Fit', e.fit, [['contain', 'Whole image'], ['cover', 'Fill the box'], ['fill', 'Stretch']])}
              ${num('radius', 'Corners', e.radius, 0, 1000)}
              <label>Opacity<input type="range" data-k="opacity" data-t="num" min="0" max="1" step="0.05" value="${esc(e.opacity ?? 1)}"></label></div>`;
        } else if (e.type === 'table') {
            html += `<div class="sb-props">
              ${num('rows', 'Rows / page', e.rows, 1, 30)}${num('rowHeight', 'Row height', e.rowHeight || '', 0, 400)}
              ${sel1('font', 'Font', e.font, fonts)}${num('size', 'Text size', e.size, 8, 120)}${num('headSize', 'Heading size', e.headSize, 8, 120)}
              ${color('headBg', 'Heading bg', e.headBg)}${color('headColor', 'Heading text', e.headColor)}
              ${color('rowBg', 'Rows', e.rowBg)}${color('altBg', 'Every 2nd row', e.altBg, true)}
              ${color('color', 'Row text', e.color)}${color('line', 'Lines', e.line)}${num('radius', 'Heading corners', e.radius, 0, 100)}
              ${check('merge', 'Write “Travel To” once per group of rows', e.merge)}
              ${check('combine', 'Share pages between trip types (like Classic)', e.combine)}</div>
              <h3>Columns <small>drag ⠿ to reorder</small></h3>
              <div class="sb-cols" id="sbCols">${(e.columns || []).map((c, i) => `
                <div class="sb-col" data-ci="${i}">
                  <span class="grip" draggable="true" title="Drag to reorder">⠿</span>
                  <select data-ck="field" aria-label="Data">${Object.entries(FIELDS).map(([k, [l]]) => opt(k, l, c.field)).join('')}</select>
                  <button type="button" data-cdel="${i}" title="Remove column" aria-label="Remove column">✕</button>
                  <div class="sub"><input data-ck="title" value="${esc(c.title ?? '')}" placeholder="Title" aria-label="Title">
                    <select data-ck="align" aria-label="Align">${[['left', 'Left'], ['center', 'Centre'], ['right', 'Right']].map(([a, b]) => opt(a, b, c.align || 'center')).join('')}</select>
                    <input type="number" data-ck="width" min="0" max="100" value="${esc(c.width ?? '')}" placeholder="w %" aria-label="Width %"></div>
                </div>`).join('')}</div>
              <label class="sb-props"><select id="sbAddCol"><option value="">＋ Add column…</option>${Object.entries(FIELDS).map(([k, [l]]) => opt(k, l, '')).join('')}</select></label>`;
        }
        box.innerHTML = html;
        if (!writable) box.querySelectorAll('input, select, textarea, button').forEach(x => { x.disabled = true; });
    }
    const label = (e) => e.type === 'table' ? `Data table (${(e.columns || []).length} columns)` : e.type === 'image' ? 'Image'
        : `Text: ${String(e.text || '').slice(0, 24) || '(empty)'}`;

    const insp = $('sbInsp');
    insp.addEventListener('input', (ev) => {
        const t = ev.target, e = selected();
        if (!e) return;
        if (t.dataset.k) {
            const k = t.dataset.k;
            let v = t.dataset.t === 'bool' ? t.checked : t.dataset.t === 'num' || t.type === 'number' ? (t.value === '' ? null : Number(t.value)) : t.value;
            change(() => { if (v === null && ['x', 'y', 'w', 'h', 'size', 'rows'].includes(k)) return; e[k] = v; }, `${e.id}.${k}`);
        } else if (t.dataset.ck) {
            const i = Number(t.closest('[data-ci]').dataset.ci), c = e.columns[i], k = t.dataset.ck;
            change(() => {
                if (k === 'field' && (c.title === FIELDS[c.field]?.[0] || !c.title)) { c.title = FIELDS[t.value][0]; t.closest('.sb-col').querySelector('[data-ck=title]').value = c.title; }
                c[k] = k === 'width' ? (t.value === '' ? null : Number(t.value)) : t.value;
            }, `${e.id}.c${i}.${k}`);
        }
    });
    insp.addEventListener('change', async (ev) => {
        const t = ev.target, e = selected();
        if (t.dataset.none && e) {
            const k = t.dataset.none, picker = insp.querySelector(`input[type=color][data-k="${k}"]`);
            picker.disabled = t.checked;
            change(() => { e[k] = t.checked ? '' : picker.value; });
        } else if (t.dataset.file && e) {
            const f = t.files[0];
            if (!f) return;
            try { const src = await readImage(f, 1200); change(() => { e.src = src; }); } catch { status('Could not read that image.', true); }
        } else if (t.id === 'sbAddCol' && t.value && e) {
            const f = t.value;
            change(() => e.columns.push({ field: f, title: FIELDS[f][0], align: 'center' }));
            inspector();
        } else if (t.dataset.k === 'x' || t.dataset.k === 'y' || t.dataset.k === 'w' || t.dataset.k === 'h') placeSel();
    });
    insp.addEventListener('click', (ev) => {
        const b = ev.target.closest('button');
        if (!b) return;
        if (b.dataset.pick) { select(b.dataset.pick); return; }
        const e = selected();
        if (!e) return;
        if (b.dataset.act === 'del') removeSel();
        else if (b.dataset.act === 'dup') duplicate();
        else if (b.dataset.act === 'front' || b.dataset.act === 'back') {
            change(() => { const list = cur.data.elements.filter(x => x !== e); cur.data.elements = b.dataset.act === 'front' ? [...list, e] : [e, ...list]; });
        } else if (b.dataset.cdel != null) { change(() => e.columns.splice(Number(b.dataset.cdel), 1)); inspector(); }
    });
    // column order: drag the ⠿ grip
    let dragCol = null;
    insp.addEventListener('dragstart', (ev) => { const r = ev.target.closest('.sb-col'); if (!r) return; dragCol = Number(r.dataset.ci); ev.dataTransfer.setData('text/plain', 'col'); ev.dataTransfer.effectAllowed = 'move'; });
    insp.addEventListener('dragover', (ev) => { const r = ev.target.closest('.sb-col'); if (r && dragCol != null) { ev.preventDefault(); insp.querySelectorAll('.drag-over').forEach(x => x.classList.remove('drag-over')); r.classList.add('drag-over'); } });
    insp.addEventListener('drop', (ev) => {
        const r = ev.target.closest('.sb-col'), e = selected();
        if (!r || dragCol == null || !e) return;
        ev.preventDefault();
        const to = Number(r.dataset.ci), from = dragCol;
        dragCol = null;
        if (to === from) { inspector(); return; }
        change(() => { const [c] = e.columns.splice(from, 1); e.columns.splice(to, 0, c); });
        inspector();
    });
    insp.addEventListener('dragend', () => { dragCol = null; insp.querySelectorAll('.drag-over').forEach(x => x.classList.remove('drag-over')); });

    /* ------------------------------ templates ------------------------------ */
    function tplOptions() {
        const used = (id) => (cfg?.slides || []).filter(s => String(s.template) === String(id)).map(s => travelTo(s.type));
        $('sbTpl').innerHTML = (cur.id ? '' : `<option value="">— new, not saved yet —</option>`) +
            templates.map(t => { const u = used(t.id); return `<option value="${t.id}"${t.id === cur.id ? ' selected' : ''}>${esc(t.name)}${u.length ? ` · shows ${esc(u.join(', '))}` : ''}</option>`; }).join('');
        $('sbDelete').disabled = !cur.id || !writable;
        $('sbSaveAs').disabled = !cur.id || !writable;
    }
    function open(t) {
        cur = t ? { id: t.id, name: t.name, version: t.version, data: clone(t.data) } : cur;
        cur.data.bg = { color: '#ffffff', image: '', fit: 'cover', ...(cur.data.bg || {}) };
        cur.data.elements = cur.data.elements || [];
        $('sbName').value = cur.name;
        sel = null; undo = []; redo = []; setDirty(false);
        tplOptions(); bgControls(); draw(); inspector(); previewPages();
        status(cur.id ? `Template “${cur.name}”${t?.updated_at ? ` · saved ${new Date(t.updated_at).toLocaleString()}${t.updated_by ? ' by ' + t.updated_by : ''}` : ''}` : 'New template — not saved yet.');
    }
    const discardOk = () => !dirty || confirm('This template has unsaved changes. Discard them?');
    $('sbTpl').addEventListener('change', (ev) => {
        const t = templates.find(x => String(x.id) === ev.target.value);
        if (!t || !discardOk()) { tplOptions(); return; }
        open(t);
    });
    $('sbNewBlank').addEventListener('click', () => { if (!discardOk()) return; cur = { id: null, name: '', version: 0, data: blankTemplate() }; open(null); });
    $('sbNewClassic').addEventListener('click', () => { if (!discardOk()) return; cur = { id: null, name: '', version: 0, data: classicLook() }; open(null); });
    $('sbName').addEventListener('input', () => { cur.name = $('sbName').value; setDirty(true); });
    $('sbUndo').addEventListener('click', () => step(undo, redo));
    $('sbRedo').addEventListener('click', () => step(redo, undo));

    const sizeKb = () => Math.round(JSON.stringify(cur.data).length / 1024);
    async function save(asCopy) {
        const name = $('sbName').value.trim() || (asCopy ? '' : '');
        if (!name) { status('Give the template a name first.', true); $('sbName').focus(); return; }
        if (sizeKb() > 1700) { status(`Too large (${sizeKb()} KB) — use smaller or fewer images.`, true); return; }
        $('sbSave').disabled = $('sbSaveAs').disabled = true;
        try {
            const copyName = asCopy && templates.some(t => t.name === name) ? `${name} (copy)` : name;
            const t = cur.id && !asCopy ? await ctx.guard(updateTemplate(cur.id, name, cur.data, cur.version))
                : await ctx.guard(createTemplate(ctx.siteId, copyName, cur.data));
            templates = [...templates.filter(x => x.id !== t.id), t].sort((a, b) => a.name.localeCompare(b.name));
            open(t);
            status(`Saved “${t.name}” (${sizeKb()} KB). ${slideUse(t.id) ? 'The board shows it from its next slide.' : 'Choose below which trip types use it.'}`);
            slidesTable();
        } catch (e) {
            status(e instanceof UserError ? e.message : 'Could not save.', true);
        } finally { $('sbSave').disabled = !writable; tplOptions(); }
    }
    const slideUse = (id) => (cfg?.slides || []).some(s => String(s.template) === String(id));
    $('sbSave').addEventListener('click', () => save(false));
    $('sbSaveAs').addEventListener('click', () => save(true));
    $('sbDelete').addEventListener('click', async () => {
        if (!cur.id) return;
        const u = (cfg?.slides || []).filter(s => String(s.template) === String(cur.id)).map(s => travelTo(s.type));
        if (!confirm(`Delete the template “${cur.name}”?${u.length ? `\n\nIt is shown for ${u.join(', ')} — those trip types will not be on the board until you choose another template.` : ''}`)) return;
        try {
            await ctx.guard(deleteTemplate(cur.id));
            templates = templates.filter(t => t.id !== cur.id);
            cur = { id: null, name: '', version: 0, data: classicLook() };
            open(null);
            slidesTable();
            status('Deleted.');
        } catch (e) { status(e.message || 'Could not delete.', true); }
    });

    /* ------------------------------ preview with real trips ------------------------------ */
    let dayRows = [];
    $('sbPrevDay').value = today();
    async function loadPreviewDay() {
        try { dayRows = (await ctx.guard(loadDay(ctx.siteId, $('sbPrevDay').value))).rows || []; } catch { dayRows = []; }
        const day = $('sbPrevDay').value;
        const trips = tripsOf({ rows: dayRows, days: [day], from: `${day}T00:00`, to: `${day}T23:59` });
        const counts = new Map();
        for (const t of trips) counts.set(t.type, (counts.get(t.type) || 0) + 1);
        const keep = $('sbPrevType').value;
        $('sbPrevType').innerHTML = `<option value="">Sample rows</option>` + [...counts].sort().map(([k, n]) => opt(k, `${travelTo(k)} (${n})`, keep)).join('');
        previewPages();
    }
    function previewPages() {
        const day = $('sbPrevDay').value, type = $('sbPrevType').value;
        preview = null;
        let slides = [];
        if (type) {
            const trips = tripsOf({ rows: dayRows, days: [day], from: `${day}T00:00`, to: `${day}T23:59` });
            slides = buildSlides(trips, [{ type, template: -1, seconds: 15 }], [{ id: -1, data: cur.data }]);
            slides.forEach(s => { s.today = day; });
        }
        const keep = Number($('sbPrevPage').value) || 1;
        $('sbPrevPage').innerHTML = (slides.length ? slides : [null]).map((s, i) => opt(i + 1, `${i + 1}${slides.length ? ` of ${slides.length}` : ''}`, Math.min(keep, slides.length || 1))).join('');
        preview = slides[(Number($('sbPrevPage').value) || 1) - 1] || null;
        draw();
    }
    $('sbPrevDay').addEventListener('change', loadPreviewDay);
    $('sbPrevType').addEventListener('change', () => { $('sbPrevPage').value = '1'; previewPages(); });
    $('sbPrevPage').addEventListener('change', previewPages);

    /* ------------------------------ slides: template per trip type ------------------------------ */
    let order = []; // [{ type, template, seconds, trips, last }]
    function slidesRows() {
        const known = new Map(types.map(t => [t.type, t]));
        const rows = (cfg?.slides || []).map(s => ({ ...s, ...(known.get(s.type) ? { trips: known.get(s.type).trips, last: known.get(s.type).last } : { trips: 0, last: '' }) }));
        for (const t of types) if (!rows.some(r => r.type === t.type)) rows.push({ type: t.type, template: 'none', seconds: 15, trips: t.trips, last: t.last });
        return rows;
    }
    function slidesTable() {
        if (!order.length) order = slidesRows();
        const tplList = [['none', '— not shown —'], ['classic', 'Classic (sigatulhaj layout)'], ...templates.map(t => [t.id, t.name])];
        $('sbSlides').innerHTML = order.length ? `<div class="tp-scroll"><table class="tp-tbl sb-slides" data-no-cards>
          <thead><tr><th>Order</th><th>Trip type</th><th>Template</th><th>Seconds a slide</th></tr></thead>
          <tbody>${order.map((s, i) => `<tr class="${s.template === 'none' ? 'off' : ''}" data-si="${i}">
            <td class="ord"><button type="button" data-mv="-1" aria-label="Move up"${i ? '' : ' disabled'}>↑</button> <button type="button" data-mv="1" aria-label="Move down"${i < order.length - 1 ? '' : ' disabled'}>↓</button></td>
            <td><b>${esc(travelTo(s.type))}</b><small>${esc(s.type)} · ${s.trips ? `${s.trips} trips, last ${esc(s.last)}` : 'no trips saved yet'}</small></td>
            <td><select data-sk="template" aria-label="Template">${tplList.map(([v, l]) => opt(v, l, s.template)).join('')}</select></td>
            <td><input type="number" min="3" max="600" data-sk="seconds" value="${esc(s.seconds)}" aria-label="Seconds"></td></tr>`).join('')}</tbody></table></div>`
            : '<p class="tp-empty">No trip types yet — import a transport list first.</p>';
        $('sbSlides').querySelectorAll('select, input, button').forEach(x => { if (!writable) x.disabled = true; });
        $('sbSlidesSave').hidden = !writable;
    }
    $('sbSlides').addEventListener('change', (ev) => {
        const t = ev.target, i = Number(t.closest('[data-si]')?.dataset.si);
        if (!t.dataset.sk || Number.isNaN(i)) return;
        order[i][t.dataset.sk] = t.dataset.sk === 'seconds' ? clamp(Number(t.value) || 15, 3, 600) : (t.value === 'none' || t.value === 'classic' ? t.value : Number(t.value));
        $('sbSlidesMsg').textContent = 'Not saved yet.';
        slidesTable();
    });
    $('sbSlides').addEventListener('click', (ev) => {
        const b = ev.target.closest('button[data-mv]');
        if (!b) return;
        const i = Number(b.closest('[data-si]').dataset.si), j = i + Number(b.dataset.mv);
        [order[i], order[j]] = [order[j], order[i]];
        $('sbSlidesMsg').textContent = 'Not saved yet.';
        slidesTable();
    });
    // transition: each way, seconds (0 = cut)
    const fadeLabel = (v) => Number(v) ? `${Number(v).toFixed(1)} s` : 'cut';
    function drawFade() { $('sbFade').value = String(cfg?.fade ?? 0.3); $('sbFadeOut').textContent = fadeLabel($('sbFade').value); $('sbFade').disabled = !writable; }
    $('sbFade').addEventListener('input', () => { $('sbFadeOut').textContent = fadeLabel($('sbFade').value); $('sbSlidesMsg').textContent = 'Not saved yet.'; });
    $('sbSlidesSave').addEventListener('click', async () => {
        $('sbSlidesSave').disabled = true;
        try {
            const r = await ctx.guard(saveSignageConfig(ctx.siteId, { slides: order.map(({ type, template, seconds }) => ({ type, template, seconds })), fade: Number($('sbFade').value) }, cfg.version));
            cfg = r.config; templates = r.templates; order = [];
            slidesTable(); tplOptions(); drawFade();
            $('sbSlidesMsg').textContent = 'Saved — the board uses it from its next slide.';
        } catch (e) {
            $('sbSlidesMsg').textContent = e instanceof UserError ? e.message : 'Could not save.';
        } finally { $('sbSlidesSave').disabled = false; }
    });

    /* ------------------------------ start ------------------------------ */
    for (const id of ['sbSave', 'sbNewBlank', 'sbNewClassic', 'sbName']) $(id).disabled = !writable;
    if (!writable) status('This login can look but not change the signage.');
    try {
        const [s, ts] = await ctx.guard(Promise.all([loadSignage(ctx.siteId), loadTripTypes(ctx.siteId)]));
        cfg = s.config; templates = s.templates; types = ts;
    } catch (e) {
        status(e instanceof UserError ? e.message : 'Could not load the signage settings.', true);
        cfg = { slides: [], version: 0 };
    }
    fit();
    if (templates.length) open(templates[0]); else open(null);
    slidesTable();
    drawFade();
    await loadPreviewDay();
    return () => { ro.disconnect(); document.removeEventListener('keydown', onKey); };
}
