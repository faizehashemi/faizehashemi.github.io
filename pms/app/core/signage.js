// Signage: templates made in the Signage Builder, drawn on a 1920×1080 stage, and the slides of the public board
// (/<site>/signage). Shared by the builder (Transport → Signage Builder) and the board itself.
//
// Template data: { bg: { color, image, fit }, elements: [element…] } — element positions in stage pixels.
//   text  { type:'text', x, y, w, h, text, size, color, bg, bold, italic, underline, align, valign, font, radius, pad }
//         text may hold {type} {date} {time} {page} {pages} {trips} {pax} {today} {tomorrow}
//   image { type:'image', x, y, w, h, src (data:image…), fit, radius, opacity }
//   table { type:'table', x, y, w, h, rows, columns: [{ field, title, align, width }], size, headSize, font,
//           headBg, headColor, rowBg, altBg, color, line, merge, combine, radius, rowHeight }
//     merge   — "Travel To" written once for the rows that share it on a page (as the Classic board)
//     combine — all trip types using this template share its pages (as the Classic board); off = one run per type
// Slides config (cloud, per site): { window, slides: [{ type: route, template: 'classic' | 'none' | id, seconds }] }

import { resolve, vehicleNo, VEHICLES } from './transport.js';

export const STAGE_W = 1920, STAGE_H = 1080;

/* ---------------------------------- fields ---------------------------------- */

const two = (n) => String(n).padStart(2, '0');
const dmy = (at) => `${at.slice(8, 10)}-${at.slice(5, 7)}-${at.slice(0, 4)}`;
const h12 = (at) => { const h = Number(at.slice(11, 13)), m = at.slice(14, 16); return `${h % 12 || 12}:${m} ${h < 12 ? 'am' : 'pm'}`; };
/** "MAKKAH-MAKKAH ATRAAF" → "MAKKAH ATRAAF" (the part after the first dash) */
export const travelTo = (route) => { const s = String(route || ''); const i = s.indexOf('-'); return i < 0 ? s : s.slice(i + 1); };

// field → [label, value(trip) → string | string[] (lines)]   trip = { r, to, bus, type }
export const FIELDS = {
    ref: ['SH Ref', (t) => t.r.ref],
    to: ['Travel To', (t) => t.to],
    route: ['Route', (t) => t.type],
    date: ['Date', (t) => `${dmy(t.r.at)} ${t.r.at.slice(11, 16)}`],
    day: ['Day', (t) => dmy(t.r.at)],
    time: ['Time', (t) => t.r.at.slice(11, 16)],
    time12: ['Time (am/pm)', (t) => h12(t.r.at)],
    group: ['Tour Group', (t) => [t.r.operator && t.r.operator.toUpperCase() !== 'SELF' ? t.r.operator : '', t.r.leader].filter(Boolean)],
    operator: ['Tour Operator', (t) => t.r.operator],
    leader: ['Group Leader', (t) => t.r.leader],
    pax: ['Total Pax', (t) => t.r.pax],
    mfc: ['M / F / C', (t) => [t.r.m && `M ${t.r.m}`, t.r.f && `F ${t.r.f}`, t.r.c && `C ${t.r.c}`].filter(Boolean).join('  ')],
    bus: ['Bus No', (t) => vehicleNo(t.bus, t.vehicle)],
    vehicle: ['Vehicle', (t) => VEHICLES[t.vehicle === 'car' ? 'car' : 'bus'].label],
    transporter: ['Transporter', (t) => t.r.transporter || ''],
    vch: ['Vch No', (t) => t.r.vch],
    dora: ['Dora No', (t) => t.r.dora],
};
export const FONTS = ['Roboto', 'Arial', 'Arial Black', 'Georgia', 'Times New Roman', 'Bookman Old Style', 'Segoe UI', 'Courier New'];
export const PLACEHOLDERS = { '{type}': 'trip type', '{date}': "today's date", '{time}': 'clock', '{page}': 'page', '{pages}': 'pages',
    '{trips}': 'trips of the slide', '{pax}': 'pax of the slide', '{today}': 'today (dd-mm-yyyy)', '{tomorrow}': 'tomorrow' };

/* -------------------------------- new elements -------------------------------- */

let seq = 0;
export const newId = () => `e${Date.now().toString(36)}${(seq++).toString(36)}`;
export function newElement(type, x = 160, y = 140) {
    const id = newId();
    if (type === 'title') return { id, type: 'text', x, y, w: 1600, h: 110, text: 'Umrah Transport Schedule', size: 64, color: '#664d03', bold: true, align: 'center', valign: 'middle', font: 'Roboto' };
    if (type === 'text') return { id, type: 'text', x, y, w: 700, h: 80, text: 'Text', size: 36, color: '#222222', align: 'left', valign: 'middle', font: 'Roboto' };
    if (type === 'clock') return { id, type: 'text', x, y, w: 420, h: 80, text: '{time}', size: 48, color: '#664d03', bold: true, align: 'right', valign: 'middle', font: 'Roboto' };
    if (type === 'date') return { id, type: 'text', x, y, w: 520, h: 70, text: '{date}', size: 34, color: '#664d03', align: 'left', valign: 'middle', font: 'Roboto' };
    if (type === 'heading') return { id, type: 'text', x, y, w: 900, h: 100, text: '{type}', size: 60, color: '#ffffff', bg: '#f1c232', bold: true, align: 'center', valign: 'middle', font: 'Arial Black', radius: 12 };
    if (type === 'image') return { id, type: 'image', x, y, w: 300, h: 300, src: '', fit: 'contain', radius: 0, opacity: 1 };
    if (type === 'table') return { id, type: 'table', x, y, w: 1600, h: 700, rows: 5, columns: ['ref', 'to', 'date', 'group', 'pax', 'bus'].map(f => ({ field: f, title: FIELDS[f][0], align: 'center' })),
        size: 26, headSize: 26, font: 'Roboto', headBg: '#f9bb00', headColor: '#663300', rowBg: '#fff3cd', altBg: '', color: '#000000', line: '#ffc107', merge: true, combine: false, radius: 10 };
    throw new Error('unknown element ' + type);
}

/** A template that looks like the Classic board — a starting point in the builder */
export function classicLook() {
    const title = newElement('title', 60, 40);
    const table = newElement('table', 60, 170);
    table.w = 1800; table.h = 860; table.combine = true;
    return { bg: { color: '#fff3cd', image: '', fit: 'cover' }, elements: [title, table] };
}
export const blankTemplate = () => ({ bg: { color: '#ffffff', image: '', fit: 'cover' }, elements: [newElement('title', 60, 40)] });

/* ---------------------------------- slides ---------------------------------- */

/** Every trip of the board data that is inside the window, with its trip type, Travel To and bus */
export function tripsOf(data) {
    const out = [];
    const from = data.from || data.now, to = data.to || `${data.tomorrow}T23:59`;
    for (const day of data.days || [data.today, data.tomorrow]) {
        const rows = data.rows.filter(r => r.day === day);
        const info = resolve(rows);
        for (const r of rows) {
            const i = info.get(r.key);
            const type = i.route || r.route;
            if (!type || r.at < from || r.at > to) continue;
            out.push({ r, type, to: travelTo(type), bus: i.bus, vehicle: i.vehicle });
        }
    }
    return out;
}

const tableOf = (tpl) => tpl?.elements?.find(e => e.type === 'table') || null;
const byBoard = (a, b) => a.to.localeCompare(b.to) || a.r.at.localeCompare(b.r.at) || (a.vehicle === b.vehicle ? 0 : a.vehicle === 'car' ? 1 : -1) || (a.bus ?? 1e9) - (b.bus ?? 1e9) || String(a.r.ref).localeCompare(String(b.r.ref));

/**
 * The board's slides in order: per configured trip type (with a template) its trips in pages.
 * Trip types on the Classic board — or on one template with "combine" — share pages, as the original board.
 * @returns {{ template, tpl, seconds, types, label, trips, page, pages, count, pax }[]}
 */
export function buildSlides(trips, slidesCfg, templates, { classicRows = 5 } = {}) {
    const byId = new Map(templates.map(t => [Number(t.id), t]));
    const streams = new Map();
    for (const s of slidesCfg) {
        if (s.template === 'none') continue;
        const tpl = s.template === 'classic' ? null : byId.get(Number(s.template));
        if (s.template !== 'classic' && !tpl) continue;
        const list = trips.filter(t => t.type === s.type);
        if (!list.length) continue;
        const shared = s.template === 'classic' || tableOf(tpl?.data)?.combine;
        const key = shared ? `t:${s.template}` : `t:${s.template}|${s.type}`;
        if (!streams.has(key)) streams.set(key, { template: s.template, tpl, seconds: s.seconds, types: [], trips: [] });
        const st = streams.get(key);
        st.types.push(s.type);
        st.trips.push(...list);
    }
    const slides = [];
    for (const st of streams.values()) {
        st.trips.sort(byBoard);
        const per = st.template === 'classic' ? classicRows : Math.max(1, Number(tableOf(st.tpl?.data)?.rows) || 0);
        const pages = tableOf(st.tpl?.data) || st.template === 'classic' ? Math.max(1, Math.ceil(st.trips.length / per)) : 1;
        const label = st.types.map(travelTo).join(' · ');
        for (let p = 0; p < pages; p++) {
            const page = st.template === 'classic' || tableOf(st.tpl?.data) ? st.trips.slice(p * per, p * per + per) : st.trips;
            slides.push({ template: st.template, tpl: st.tpl, seconds: st.seconds, types: st.types, label, trips: page, page: p + 1, pages,
                count: st.trips.length, pax: st.trips.reduce((s, t) => s + (Number(t.r.pax) || 0), 0) });
        }
    }
    return slides;
}

/* --------------------------------- rendering --------------------------------- */

const okColor = (c) => typeof c === 'string' && /^(#[0-9a-f]{3,8}|rgba?\([\d\s.,%]+\)|transparent)$/i.test(c.trim()) ? c.trim() : '';
const okImage = (s) => typeof s === 'string' && /^data:image\/(png|jpeg|webp|gif);base64,/.test(s) ? s : '';
const fontStack = (f) => FONTS.includes(f) ? `"${f}", Arial, sans-serif` : 'Roboto, Arial, sans-serif';

// Riyadh wall clock (UTC+3, no daylight saving) whatever the screen's own time zone
const riyadh = (now) => new Date(now.getTime() + 3 * 3600e3).toISOString();

/** Placeholders in a text element. `slide` may be null (builder without data). Date and clock are Riyadh time. */
export function fillText(text, slide, now = new Date()) {
    const r = riyadh(now);
    const today = slide?.today || r.slice(0, 10);
    const tomorrow = new Date(`${today}T12:00`); tomorrow.setDate(tomorrow.getDate() + 1);
    const map = {
        '{type}': slide?.label || 'MADINA', '{page}': slide?.page ?? 1, '{pages}': slide?.pages ?? 1,
        '{trips}': slide?.trips?.length ?? 0, '{pax}': slide?.pax ?? 0,
        '{date}': new Date(`${today}T12:00`).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
        '{time}': r.slice(11, 19),
        '{today}': dmy(today + 'T'), '{tomorrow}': dmy(`${tomorrow.getFullYear()}-${two(tomorrow.getMonth() + 1)}-${two(tomorrow.getDate())}T`),
    };
    return String(text ?? '').replace(/\{(type|page|pages|trips|pax|date|time|today|tomorrow)\}/g, (k) => String(map[k]));
}

function box(el, e) {
    Object.assign(el.style, { position: 'absolute', left: `${e.x}px`, top: `${e.y}px`, width: `${e.w}px`, height: `${e.h}px`, boxSizing: 'border-box', overflow: 'hidden' });
}

function drawText(e, slide, now) {
    const el = document.createElement('div');
    box(el, e);
    Object.assign(el.style, {
        display: 'flex', flexDirection: 'column', justifyContent: { top: 'flex-start', bottom: 'flex-end' }[e.valign] || 'center',
        textAlign: ['left', 'right', 'center'].includes(e.align) ? e.align : 'left',
        fontFamily: fontStack(e.font), fontSize: `${Number(e.size) || 32}px`, lineHeight: 1.2, color: okColor(e.color) || '#000',
        background: okColor(e.bg) || 'transparent', fontWeight: e.bold ? '700' : '400', fontStyle: e.italic ? 'italic' : 'normal',
        textDecoration: e.underline ? 'underline' : 'none', borderRadius: `${Number(e.radius) || 0}px`, padding: `${Number(e.pad ?? 8)}px`,
        whiteSpace: 'pre-wrap', overflowWrap: 'anywhere',
    });
    const span = document.createElement('div');
    span.textContent = fillText(e.text, slide, now);
    if (/\{time\}/.test(e.text || '')) { span.dataset.clock = e.text; } // the board ticks these every second
    el.appendChild(span);
    return el;
}

function drawImage(e) {
    const el = document.createElement('div');
    box(el, e);
    el.style.borderRadius = `${Number(e.radius) || 0}px`;
    el.style.opacity = String(Math.min(1, Math.max(0, Number(e.opacity ?? 1))));
    const src = okImage(e.src);
    if (src) {
        const img = document.createElement('img');
        img.src = src; img.alt = '';
        Object.assign(img.style, { width: '100%', height: '100%', objectFit: ['cover', 'contain', 'fill'].includes(e.fit) ? e.fit : 'contain', display: 'block' });
        el.appendChild(img);
    } else {
        Object.assign(el.style, { border: '3px dashed #c9a227', display: 'grid', placeItems: 'center', color: '#9a7414', font: '600 28px Roboto, Arial', background: 'rgba(255,255,255,.5)' });
        el.textContent = 'Image';
    }
    return el;
}

function drawTable(e, slide) {
    const el = document.createElement('div');
    box(el, e);
    const t = document.createElement('table');
    Object.assign(t.style, { width: '100%', borderCollapse: 'separate', borderSpacing: '0', fontFamily: fontStack(e.font), fontSize: `${Number(e.size) || 24}px`, color: okColor(e.color) || '#000', tableLayout: 'auto' });
    const cols = (e.columns || []).filter(c => FIELDS[c.field]);
    const line = okColor(e.line) || '#ffc107', radius = `${Number(e.radius) || 0}px`;
    const thead = t.createTHead().insertRow();
    cols.forEach((c, i) => {
        const th = document.createElement('th');
        th.textContent = c.title ?? FIELDS[c.field][0];
        Object.assign(th.style, { background: okColor(e.headBg) || '#f9bb00', color: okColor(e.headColor) || '#663300', fontWeight: '700', fontSize: `${Number(e.headSize) || Number(e.size) || 24}px`,
            padding: '0.4em 0.5em', textAlign: c.align || 'center', whiteSpace: 'nowrap', width: c.width ? `${c.width}%` : '' });
        if (i === 0) th.style.borderRadius = `${radius} 0 0 ${radius}`;
        if (i === cols.length - 1) th.style.borderRadius = i === 0 ? radius : `0 ${radius} ${radius} 0`;
        thead.appendChild(th);
    });
    const body = t.createTBody();
    const trips = slide?.trips?.length ? slide.trips : sampleTrips(Number(e.rows) || 5);
    const mergeIdx = e.merge ? cols.findIndex(c => c.field === 'to') : -1;
    trips.forEach((trip, ri) => {
        const tr = body.insertRow();
        const bg = (ri % 2 && okColor(e.altBg)) || okColor(e.rowBg) || 'transparent';
        cols.forEach((c, ci) => {
            if (ci === mergeIdx && ri > 0 && trips[ri - 1].to === trip.to) return;
            const td = tr.insertCell();
            let span = 1;
            if (ci === mergeIdx) { while (trips[ri + span] && trips[ri + span].to === trip.to) span++; td.rowSpan = span; }
            const v = FIELDS[c.field][1](trip);
            (Array.isArray(v) ? v : [v]).forEach((line1, li) => { if (li) td.appendChild(document.createElement('br')); td.appendChild(document.createTextNode(String(line1 ?? ''))); });
            Object.assign(td.style, { background: ci === mergeIdx ? (okColor(e.mergeBg) || '#f8f9fa') : bg, padding: '0.4em 0.5em', textAlign: c.align || 'center',
                verticalAlign: c.field === 'date' ? 'top' : 'middle', borderBottom: `1px solid ${line}`,
                ...(ci === mergeIdx ? { color: okColor(e.mergeColor) || '#0d6efd', fontWeight: '700' } : {}),
                ...(Number(e.rowHeight) ? { height: `${Number(e.rowHeight)}px` } : {}) });
        });
    });
    el.appendChild(t);
    return el;
}

// a few made-up rows so a table shows its look in the builder before any day is chosen
function sampleTrips(n) {
    const names = [['SHAHI INTERNATIONAL', 'TAHER ENAYATHUSAIN'], ['SELF', 'QAIZAR AHMEDALI BHOPALI'], ['MAIMOON TRAVELS', 'MUSTAFA QUTBUDDIN'], ['FAIZ E HUSAINI', 'NAFISA MOHAMMED'], ['GOLDEN TOURS', 'TAYYEB ZAKIR']];
    return Array.from({ length: Math.min(n, 12) }, (_, i) => {
        const [operator, leader] = names[i % names.length];
        return { r: { ref: String(43000 + i * 17), at: `2026-10-04T${two(6 + i)}:30`, operator, leader, pax: 3 + i * 7, m: 2, f: 1 + i, c: 0, vch: String(5000 + i), dora: '', transporter: 'YUSUF BHAI' },
            type: i < 3 ? 'MAKKAH-JEDDAH AIRPORT' : 'MAKKAH-MADINA', to: i < 3 ? 'JEDDAH AIRPORT' : 'MADINA', bus: i + 1 };
    });
}

/**
 * Draw a template on a 1920×1080 stage element (cleared first). `slide` = a buildSlides() slide or null (samples).
 * Returns the element nodes by id (the builder adds handles to them).
 */
export function renderTemplate(stage, data, slide = null, now = new Date()) {
    stage.textContent = '';
    Object.assign(stage.style, { position: 'relative', width: `${STAGE_W}px`, height: `${STAGE_H}px`, overflow: 'hidden',
        backgroundColor: okColor(data?.bg?.color) || '#ffffff', backgroundImage: okImage(data?.bg?.image) ? `url("${data.bg.image}")` : 'none',
        backgroundSize: data?.bg?.fit === 'contain' ? 'contain' : data?.bg?.fit === 'fill' ? '100% 100%' : 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' });
    const nodes = new Map();
    for (const e of data?.elements || []) {
        const el = e.type === 'text' ? drawText(e, slide, now) : e.type === 'image' ? drawImage(e) : e.type === 'table' ? drawTable(e, slide) : null;
        if (!el) continue;
        el.dataset.id = e.id;
        stage.appendChild(el);
        nodes.set(e.id, el);
    }
    return nodes;
}

/** Tick the {time} texts on a drawn stage */
export function tickClocks(stage, slide, now = new Date()) {
    stage.querySelectorAll('[data-clock]').forEach(n => { n.textContent = fillText(n.dataset.clock, slide, now); });
}
