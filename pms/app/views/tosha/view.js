// Tosha summary (Mawaid): travel refreshments for the buses of tomorrow (top) and today (bottom), from the
// Transport day lists — the same buses as the Bus sheets' Print summary.
//   Madina  — each bus's pax + 2; preparation time (default 6:30 AM); Biryani or Burger; Tosha packet (default on)
//   Airport — buses by departure time, each pax + 2; per bus Tosha packet (default on) and Burger (optional)
//   Atraaf  — the summary only
// The choices are kept in the cloud per site and day (GET/PUT /api/tosha). "Copy image" draws the card as a picture
// and puts it on the clipboard for the Mawaid WhatsApp group (phones: Share).
import { request, canWrite, UserError } from '../../core/cloud.js';
import { loadDay, signage, today, addDays, longDate, sheetDate, time12, vehicleNo, VEHICLES, fleetText, destsFor } from '../../core/transport.js';
import { esc } from '../../core/transport-ui.js';

const EXTRA = 2;  // + per bus (driver and helper)
const extraOf = (b) => b.vehicle === 'car' ? 0 : EXTRA;
const DEF_MADINA = { time: '06:30', biryani: false, burger: false, packet: true };
const DEF_BUS = { packet: true, burger: false };
const busKey = (b) => b.rows[0].key;
const plural = (n, one, many = one + 's') => `${n} ${n === 1 ? one : many}`;
const fleet = (buses) => fleetText(buses, 'no buses');
const vno = (b) => vehicleNo(b.bus, b.vehicle, b.vlabel);
const vlabel = (b) => `${VEHICLES[b.vehicle].icon} ${vno(b) || '—'}`;
const leaders = (b) => b.rows.map(r => r.leader).filter(Boolean);

/* ------------------------------ image (canvas) ------------------------------ */

// model: { title, sub, notes: [], head: [], widths: [], rows: [{ cells: [], slot }], foot: [], chips: [] }
function drawImage(m) {
    const W = 1100, P = 22, BAND = 70, HEAD = 38, ROW = 36, scale = 2;
    const notesH = m.notes.length ? m.notes.length * 28 + 14 : 0;
    const chipsH = m.chips.length ? 56 : 0;
    const H = P + BAND + notesH + HEAD + Math.max(1, m.rows.length) * ROW + (m.foot ? ROW : 0) + chipsH + P;
    const c = document.createElement('canvas');
    c.width = W * scale; c.height = H * scale;
    const g = c.getContext('2d');
    g.scale(scale, scale);
    g.fillStyle = '#fff9e6'; g.fillRect(0, 0, W, H);
    // band
    let y = P;
    g.fillStyle = '#f1c232'; g.fillRect(P, y, W - 2 * P, BAND);
    g.fillStyle = '#fff'; g.textBaseline = 'middle';
    g.font = '900 32px "Arial Black", Arial, sans-serif'; g.fillText(m.title, P + 18, y + BAND / 2);
    g.font = '700 20px Arial, sans-serif'; g.textAlign = 'right'; g.fillText(m.sub, W - P - 18, y + BAND / 2); g.textAlign = 'left';
    y += BAND;
    // notes (preparation time, meal…)
    if (m.notes.length) {
        y += 10;
        g.fillStyle = '#3d3100'; g.font = '700 20px Arial, sans-serif';
        for (const n of m.notes) { g.fillText(n, P + 6, y + 13); y += 28; }
        y += 4;
    }
    // table
    const total = m.widths.reduce((a, b) => a + b, 0), TW = W - 2 * P;
    const xs = []; let x = P;
    for (const w of m.widths) { xs.push(x); x += (w / total) * TW; }
    const cell = (text, i, top, h, font, color) => {
        const w = (m.widths[i] / total) * TW;
        g.font = font; g.fillStyle = color;
        let t = String(text ?? '');
        while (t.length > 1 && g.measureText(t).width > w - 14) t = t.slice(0, -2) + '…';
        g.textAlign = m.align?.[i] === 'right' ? 'right' : m.align?.[i] === 'center' ? 'center' : 'left';
        const tx = g.textAlign === 'right' ? xs[i] + w - 8 : g.textAlign === 'center' ? xs[i] + w / 2 : xs[i] + 8;
        g.fillText(t, tx, top + h / 2);
        g.textAlign = 'left';
    };
    const line = (top, h, fill) => {
        g.fillStyle = fill; g.fillRect(P, top, TW, h);
        g.strokeStyle = '#c9a227'; g.lineWidth = 1;
        g.strokeRect(P + .5, top + .5, TW - 1, h - 1);
        for (const xx of xs.slice(1)) { g.beginPath(); g.moveTo(xx + .5, top); g.lineTo(xx + .5, top + h); g.stroke(); }
    };
    line(y, HEAD, '#ffd966');
    m.head.forEach((t, i) => cell(t, i, y, HEAD, '900 15px "Arial Black", Arial, sans-serif', '#3d3100'));
    y += HEAD;
    if (!m.rows.length) { line(y, ROW, '#fff2cc'); g.font = '600 17px Arial'; g.fillStyle = '#6b5e4a'; g.fillText('No buses', P + 10, y + ROW / 2); y += ROW; }
    for (const r of m.rows) {
        line(y, ROW, r.slot ? '#ffe8a3' : '#fff2cc');
        r.cells.forEach((t, i) => cell(t, i, y, ROW, r.slot ? '800 17px Arial, sans-serif' : '700 17px Arial, sans-serif', '#1f1600'));
        y += ROW;
    }
    if (m.foot) {
        line(y, ROW, '#ffffff');
        m.foot.forEach((t, i) => cell(t, i, y, ROW, '900 18px Arial, sans-serif', '#000'));
        y += ROW;
    }
    // totals to prepare
    if (m.chips.length) {
        y += 12;
        g.font = '800 19px Arial, sans-serif';
        let cx = P;
        for (const t of m.chips) {
            const w = g.measureText(t).width + 28;
            g.fillStyle = '#fff3d1'; g.strokeStyle = '#d4af37';
            g.beginPath(); g.roundRect(cx, y, w, 36, 18); g.fill(); g.stroke();
            g.fillStyle = '#3d3100'; g.fillText(t, cx + 14, y + 18);
            cx += w + 10;
        }
    }
    return c;
}

const blobOf = (canvas) => new Promise(res => canvas.toBlob(res, 'image/png'));
// the same PNG made at once (no await), so Share still counts as part of the tap
function blobNow(canvas) {
    const bin = atob(canvas.toDataURL('image/png').split(',')[1]);
    const u = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
    return new Blob([u], { type: 'image/png' });
}

// all the day's cards in one picture, one under the other, under a heading
function drawAll(models, heading) {
    const parts = models.map(drawImage);
    const W = parts[0].width, HEAD = 120, GAP = 10;
    const c = document.createElement('canvas');
    c.width = W; c.height = HEAD + parts.reduce((s, p) => s + p.height + GAP, 0);
    const g = c.getContext('2d');
    g.fillStyle = '#fff9e6'; g.fillRect(0, 0, c.width, c.height);
    g.fillStyle = '#7a5410'; g.fillRect(44, 36, W - 88, HEAD - 44);
    g.fillStyle = '#fff'; g.textBaseline = 'middle';
    g.font = '900 52px "Arial Black", Arial, sans-serif'; g.fillText(heading, 80, 36 + (HEAD - 44) / 2);
    let y = HEAD;
    for (const p of parts) { g.drawImage(p, 0, y); y += p.height + GAP; }
    return c;
}

/* ---------------------------------- page ---------------------------------- */

export default async function mount(ctx) {
    const $ = (id) => ctx.root.querySelector('#' + id);
    const writable = canWrite(ctx.siteId);
    $('tsSheets').href = ctx.href('transport-print');
    $('tsDay').href = ctx.href('transport');
    const msg = (t, kind = 'bad') => { $('tsMsg').innerHTML = t ? `<div class="tp-msg ${kind}">${esc(t)}</div>` : ''; };

    const days = [{ el: 'tsTomorrow', label: 'Tomorrow', day: addDays(today(), 1) }, { el: 'tsToday', label: 'Today', day: today() }];
    const state = new Map(); // day → { groups, choice, updated_at, updated_by, models: Map(cardId → model) }

    const choiceOf = (raw) => ({ madina: { ...DEF_MADINA, ...(raw?.madina || {}) }, buses: raw?.buses || {} });
    const busChoice = (st, b) => ({ ...DEF_BUS, ...(st.choice.buses[busKey(b)] || {}) });

    async function load(d) {
        const [doc, t] = await ctx.guard(Promise.all([loadDay(ctx.siteId, d.day), request('GET', `/api/tosha?site=${encodeURIComponent(ctx.siteId)}&day=${d.day}`)]));
        state.set(d.day, { groups: signage(doc.rows, ctx.siteId), choice: choiceOf(t.data), updated_at: t.updated_at, updated_by: t.updated_by, models: new Map() });
    }

    /* -------- cards -------- */
    const DESTS = destsFor(ctx.siteId);
    const LONG = DESTS.find(x => x.tosha === 'long');
    function madinaCard(d, st) {
        const g = st.groups.find(x => x.dest.id === LONG.id);
        const NAME = LONG.label;
        const buses = [...g.buses].sort((a, b) => a.at.localeCompare(b.at));
        const c = st.choice.madina;
        const pax = buses.reduce((s, b) => s + b.pax, 0), extra = buses.reduce((s, b) => s + extraOf(b), 0), total = pax + extra;
        const meal = c.biryani ? 'Biryani' : c.burger ? 'Burger' : '';
        st.models.set('madina', {
            title: `${NAME} · TOSHA`, sub: `${sheetDate(d.day)} · ${fleet(buses)}`,
            notes: [`Preparation time: ${time12(`2000-01-01T${c.time || '06:30'}`)}`, `Prepare: ${[c.packet && 'Tosha packet', meal].filter(Boolean).join(' + ') || '—'}`],
            head: ['Bus', 'Time', 'From', 'Groups', 'Pax', '+', 'Total'], widths: [12, 12, 15, 33, 9, 7, 12], align: [, , , , 'right', 'right', 'right'],
            rows: buses.map(b => ({ cells: [vno(b) || '—', time12(b.at), b.building || '', leaders(b).join(', '), b.pax, extraOf(b) ? `+${extraOf(b)}` : '', b.pax + extraOf(b)] })),
            foot: ['Total', '', '', plural(g.groups, 'group'), pax, extra ? `+${extra}` : '', total],
            chips: [c.packet && `Tosha packets: ${total}`, meal && `${meal}: ${total}`].filter(Boolean),
        });
        return card(d, 'madina', `${LONG.icon} ${NAME}`, `${fleet(buses)} · ${total} to prepare`, `
          <div class="ts-big"><b>${total}</b><span>${pax} pax + ${extra} for ${plural(buses.filter(b => b.vehicle !== 'car').length, 'bus', 'buses')}</span></div>
          <div class="ts-opts">
            <label>Preparation <input type="time" data-c="madina.time" value="${esc(c.time || '06:30')}"></label>
            <label><input type="checkbox" data-c="madina.biryani"${c.biryani ? ' checked' : ''}> Biryani</label>
            <label><input type="checkbox" data-c="madina.burger"${c.burger ? ' checked' : ''}> Burger</label>
            <label><input type="checkbox" data-c="madina.packet"${c.packet ? ' checked' : ''}> Tosha packet</label>
          </div>
          ${buses.length ? `<div class="ts-scroll"><table class="ts-tbl" data-no-cards><thead><tr><th>Bus</th><th>Time</th><th>From</th><th>Groups</th><th class="n">Pax</th><th class="n">+</th><th class="n">Total</th></tr></thead>
            <tbody>${buses.map(b => `<tr><td>${vlabel(b)}</td><td>${esc(time12(b.at))}</td><td>${esc(b.building || '—')}</td>
              <td>${esc(leaders(b)[0] || '')}${b.rows.length > 1 ? `<small>+ ${plural(b.rows.length - 1, 'more group')}</small>` : ''}</td>
              <td class="n">${b.pax}</td><td class="n">${extraOf(b) ? `+${extraOf(b)}` : ''}</td><td class="n tot">${b.pax + extraOf(b)}</td></tr>`).join('')}</tbody>
            <tfoot><tr><td colspan="4">${plural(g.groups, 'group')}</td><td class="n">${pax}</td><td class="n">+${extra}</td><td class="n">${total}</td></tr></tfoot></table></div>` : `<p class="ts-none">No ${esc(LONG.title)} buses.</p>`}
          <div class="ts-counts">${st.models.get('madina').chips.map(t => `<span>${esc(t)}</span>`).join('')}</div>`);
    }

    // Jeddah Airport, Madina Airport and Taif: the same rules (pax + 2 a vehicle, by departure time, packet / burger per bus)
    function airportCard(d, st, id) {
        const D = DESTS.find(x => x.id === id), A = { title: D.label, icon: D.icon, name: D.title };
        const g = st.groups.find(x => x.dest.id === id);
        const buses = [...g.buses].sort((a, b) => a.at.localeCompare(b.at) || (a.bus ?? 0) - (b.bus ?? 0));
        const slots = new Map();
        for (const b of buses) { const k = b.at.slice(11, 16); if (!slots.has(k)) slots.set(k, []); slots.get(k).push(b); }
        const pax = buses.reduce((s, b) => s + b.pax, 0), extra = buses.reduce((s, b) => s + extraOf(b), 0), total = pax + extra;
        const packets = buses.reduce((s, b) => s + (busChoice(st, b).packet ? b.pax + extraOf(b) : 0), 0);
        const burgers = buses.reduce((s, b) => s + (busChoice(st, b).burger ? b.pax + extraOf(b) : 0), 0);
        const rowsM = [], rowsH = [];
        for (const [hm, list] of slots) {
            const sp = list.reduce((s, b) => s + b.pax, 0), se = list.reduce((s, b) => s + extraOf(b), 0);
            rowsM.push({ slot: true, cells: [time12(`2000-01-01T${hm}`), fleet(list), '', sp, se ? `+${se}` : '', sp + se, '', ''] });
            rowsH.push(`<tr class="slot"><td colspan="3">${esc(time12(`2000-01-01T${hm}`))} · ${esc(fleet(list))}</td><td class="n">${sp}</td><td class="n">${se ? `+${se}` : ''}</td><td class="n">${sp + se}</td><td></td><td></td></tr>`);
            for (const b of list) {
                const ch = busChoice(st, b);
                rowsM.push({ cells: [`   ${vno(b) || '—'}`, b.building || '', leaders(b).join(', '), b.pax, extraOf(b) ? `+${extraOf(b)}` : '', b.pax + extraOf(b), ch.packet ? '✓' : '', ch.burger ? '✓' : ''] });
                rowsH.push(`<tr><td>${vlabel(b)}</td><td>${esc(b.building || '—')}</td><td>${esc(leaders(b)[0] || '')}${b.rows.length > 1 ? `<small>+ ${plural(b.rows.length - 1, 'more group')}</small>` : ''}</td>
                  <td class="n">${b.pax}</td><td class="n">${extraOf(b) ? `+${extraOf(b)}` : ''}</td><td class="n tot">${b.pax + extraOf(b)}</td>
                  <td class="c"><input type="checkbox" data-b="${esc(busKey(b))}.packet"${ch.packet ? ' checked' : ''} aria-label="Tosha packet for ${esc(vno(b))}"></td>
                  <td class="c"><input type="checkbox" data-b="${esc(busKey(b))}.burger"${ch.burger ? ' checked' : ''} aria-label="Burger for ${esc(vno(b))}"></td></tr>`);
            }
        }
        st.models.set(id, {
            title: `${A.title} · TOSHA`, sub: `${sheetDate(d.day)} · ${fleet(buses)}`, notes: [],
            head: ['Time / Bus', 'From', 'Groups', 'Pax', '+', 'Total', 'Tosha', 'Burger'], widths: [20, 12, 30, 8, 6, 9, 7, 8],
            align: [, , , 'right', 'right', 'right', 'center', 'center'],
            rows: rowsM,
            foot: ['Total', '', plural(g.groups, 'group'), pax, extra ? `+${extra}` : '', total, packets, burgers || ''],
            chips: [`Tosha packets: ${packets}`, burgers && `Burgers: ${burgers}`].filter(Boolean),
        });
        return card(d, id, `${A.icon} ${A.title}`, `${fleet(buses)} · ${total} pax with staff`, `
          <div class="ts-big"><b>${total}</b><span>${pax} pax + ${extra} for the buses · ${slots.size} departure time${slots.size === 1 ? '' : 's'}</span></div>
          ${buses.length ? `<div class="ts-scroll"><table class="ts-tbl" data-no-cards><thead><tr><th>Bus</th><th>From</th><th>Groups</th><th class="n">Pax</th><th class="n">+</th><th class="n">Total</th><th>Tosha packet</th><th>Burger</th></tr></thead>
            <tbody>${rowsH.join('')}</tbody>
            <tfoot><tr><td colspan="3">${plural(g.groups, 'group')}</td><td class="n">${pax}</td><td class="n">+${extra}</td><td class="n">${total}</td><td class="c">${packets}</td><td class="c">${burgers}</td></tr></tfoot></table></div>` : `<p class="ts-none">No ${A.name} buses.</p>`}
          <div class="ts-counts">${st.models.get(id).chips.map(t => `<span>${esc(t)}</span>`).join('')}</div>`);
    }

    function atraafCard(d, st, id) {
        const D = DESTS.find(x => x.id === id);
        const g = st.groups.find(x => x.dest.id === id);
        const buses = [...g.buses].sort((a, b) => a.at.localeCompare(b.at) || (a.bus ?? 0) - (b.bus ?? 0));
        st.models.set(id, {
            title: D.label, sub: `${sheetDate(d.day)} · ${fleet(buses)}`, notes: [],
            head: ['Bus', 'Time', 'From', 'Groups', 'Pax'], widths: [12, 13, 15, 48, 12], align: [, , , , 'right'],
            rows: buses.map(b => ({ cells: [vno(b) || '—', time12(b.at), b.building || '', leaders(b).join(', '), b.pax] })),
            foot: ['Total', '', '', plural(g.groups, 'group'), g.pax], chips: [],
        });
        return card(d, id, `${D.icon} ${D.label}`, `${fleet(buses)} · ${g.pax} pax`, `
          <div class="ts-big"><b>${g.pax}</b><span>pax · ${plural(g.groups, 'group')}</span></div>
          ${buses.length ? `<div class="ts-scroll"><table class="ts-tbl" data-no-cards><thead><tr><th>Bus</th><th>Time</th><th>From</th><th>Groups</th><th class="n">Pax</th></tr></thead>
            <tbody>${buses.map(b => `<tr><td>${vlabel(b)}</td><td>${esc(time12(b.at))}</td><td>${esc(b.building || '—')}</td>
              <td>${esc(leaders(b)[0] || '')}${b.rows.length > 1 ? `<small>+ ${plural(b.rows.length - 1, 'more group')}</small>` : ''}</td><td class="n tot">${b.pax}</td></tr>`).join('')}</tbody>
            <tfoot><tr><td colspan="4">Total</td><td class="n">${g.pax}</td></tr></tfoot></table></div>` : `<p class="ts-none">No ${esc(D.title)} buses.</p>`}`);
    }

    const canShare = !!(navigator.canShare && navigator.canShare({ files: [new File([''], 'x.png', { type: 'image/png' })] }));
    function card(d, id, title, sub, body) {
        return `<article class="ts-card" data-day="${d.day}" data-card="${id}">
          <div class="ts-band">${title}<small>${esc(sub)}</small></div>
          <div class="ts-body">${body}
            <div class="ts-act">
              <button type="button" class="tp-btn gold" data-copy>📋 Copy image</button>
              ${canShare ? '<button type="button" class="tp-btn" data-share>📤 Share</button>' : ''}
              <span class="tp-muted" data-note></span>
            </div>
          </div>
        </article>`;
    }

    function render(d) {
        const st = state.get(d.day);
        const el = $(d.el);
        if (!st) { el.innerHTML = `<h2>${d.label}<small>${esc(longDate(d.day))}</small></h2><p class="tp-empty">Could not load.</p>`; return; }
        const any = st.groups.some(g => g.buses.length);
        st.models.clear();
        // the site's destinations: the long trip first, then airports, then the rest (Makkah: Madina, Jeddah Airport,
        // Madina Airport, Taif, Atraaf); Makkah's Madina Airport and Taif only on days that have trips there
        const ORDER = { long: 0, airport: 1, summary: 2 };
        const cards = [...DESTS].sort((a, b) => ORDER[a.tosha] - ORDER[b.tosha]).map(D => {
            if (D.onlyWhenUsed && !st.groups.find(x => x.dest.id === D.id)?.buses.length) return '';
            return D.tosha === 'long' ? madinaCard(d, st) : D.tosha === 'airport' ? airportCard(d, st, D.id) : atraafCard(d, st, D.id);
        }).filter(Boolean);
        const n = cards.length;
        el.innerHTML = `<h2>${d.label} <small>${esc(longDate(d.day))}${st.updated_at ? ` · choices saved ${new Date(st.updated_at).toLocaleString()}${st.updated_by ? ' by ' + esc(st.updated_by) : ''}` : ''}</small></h2>
          ${any ? `<div class="ts-act ts-all" data-day="${d.day}">
              <button type="button" class="tp-btn gold" data-copy-all>📋 Copy all ${n} in one image</button>
              ${canShare ? `<button type="button" class="tp-btn" data-share-all>📤 Share all ${n}</button>` : ''}
              <span class="tp-muted" data-note></span></div>
            <div class="ts-cards">${cards.join('')}</div>`
                : `<p class="tp-empty">No transport list saved for ${esc(longDate(d.day))} yet.</p>`}`;
        if (!writable) el.querySelectorAll('input').forEach(i => { i.disabled = true; });
    }

    /* -------- choices: save to the cloud (a moment after the last change) -------- */
    const timers = new Map();
    function persist(day) {
        clearTimeout(timers.get(day));
        timers.set(day, setTimeout(async () => {
            const st = state.get(day);
            try {
                const r = await ctx.guard(request('PUT', '/api/tosha', { site: ctx.siteId, day, data: st.choice }));
                st.updated_at = r.updated_at; st.updated_by = r.updated_by;
                msg('');
            } catch (e) { msg(e instanceof UserError ? e.message : 'Could not save the choices.'); }
        }, 500));
    }
    // listeners on this page's own element (the shared page container outlives the page: listeners there pile up
    // with every visit and one tap would then copy or share several times)
    const page = ctx.root.querySelector('.ts');
    page.addEventListener('change', (e) => {
        const t = e.target, art = t.closest('[data-day]');
        if (!art) return;
        const d = days.find(x => x.day === art.dataset.day), st = state.get(d.day);
        if (t.dataset.c) {
            const k = t.dataset.c.split('.')[1], m = st.choice.madina;
            if (k === 'time') m.time = t.value || '06:30';
            else {
                m[k] = t.checked;
                if (t.checked && k === 'biryani') m.burger = false;   // one or the other
                if (t.checked && k === 'burger') m.biryani = false;
            }
        } else if (t.dataset.b) {
            const i = t.dataset.b.lastIndexOf('.'), key = t.dataset.b.slice(0, i), k = t.dataset.b.slice(i + 1);
            st.choice.buses[key] = { ...DEF_BUS, ...(st.choice.buses[key] || {}), [k]: t.checked };
        } else return;
        persist(d.day);
        render(d);
    });

    /* -------- copy / share a card — or all three in one picture -------- */
    let busy = false;
    page.addEventListener('click', async (e) => {
        const btn = e.target.closest('[data-copy], [data-share], [data-copy-all], [data-share-all]');
        if (!btn || busy) return;
        const box = btn.closest('[data-day]'), note = box.querySelector('[data-note]');
        const st = state.get(box.dataset.day);
        if (!st) return;
        const all = btn.hasAttribute('data-copy-all') || btn.hasAttribute('data-share-all');
        const share = btn.hasAttribute('data-share') || btn.hasAttribute('data-share-all');
        let canvas, name, title;
        if (all) {
            const models = [...st.models.values()].filter(m => m && m.rows.length);
            if (!models.length) return;
            canvas = drawAll(models, `TOSHA SUMMARY · ${sheetDate(box.dataset.day)}`);
            name = `tosha-${box.dataset.day}.png`; title = 'Tosha summary';
        } else {
            const model = st.models.get(box.dataset.card);
            if (!model) return;
            canvas = drawImage(model);
            name = `tosha-${box.dataset.card}-${box.dataset.day}.png`; title = model.title;
        }
        busy = true;
        const say = (t) => { note.textContent = t; setTimeout(() => { if (note.textContent === t) note.textContent = ''; }, 6000); };
        try {
            if (share) {
                await navigator.share({ files: [new File([blobNow(canvas)], name, { type: 'image/png' })], title });
                return;
            }
            await navigator.clipboard.write([new ClipboardItem({ 'image/png': blobOf(canvas) })]);
            say('Copied — paste it in the Mawaid WhatsApp group.');
        } catch (err) {
            if (err && err.name === 'AbortError') return; // the share sheet was closed
            if (share) { say('Sharing did not open here — use Copy image instead.'); return; }
            // no picture clipboard in this browser: one download instead
            const a = document.createElement('a');
            a.href = canvas.toDataURL('image/png'); a.download = name; a.click();
            say('This browser cannot copy pictures — the image was downloaded instead.');
        } finally { busy = false; }
    });

    async function refresh() {
        for (const d of days) {
            try { await load(d); } catch (e) { msg(e instanceof UserError ? e.message : 'Could not load the transport lists.'); }
            render(d);
        }
    }
    await refresh();
    // other desks' changes, every minute (not while a time is being typed)
    const iv = setInterval(() => {
        if (document.visibilityState !== 'visible' || (ctx.root.contains(document.activeElement) && document.activeElement.matches('input'))) return;
        refresh().catch(() => { });
    }, 60e3);
    return () => clearInterval(iv);
}
