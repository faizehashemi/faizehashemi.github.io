// Room Key Cards (Rooms): the key cards given to the rooms of every group leaving on a day (one card per assigned bed)
// and how many came back. Groups and rooms come from the slips (core/stay.js departuresOf — a delayed group leaves room by
// room, so only the rooms leaving that day show); only the returned count is saved (GET / PUT /api/key-cards), per slip,
// room and day, shared by every desk of the site. Taps are saved after half a second, together.

import { request, canWrite, UserError } from '../../core/cloud.js';
import { departuresOf, paxAt, isDelayed } from '../../core/stay.js';

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const pad = (n) => String(n).padStart(2, '0');
const ymd = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const shift = (day, n) => { const x = new Date(`${day}T12:00`); x.setDate(x.getDate() + n); return ymd(x); };
const dmy = (day) => day.split('-').reverse().join('/');
const natural = (a, b) => String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: 'base' });
const hm = (ms) => new Date(ms).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
const MAX = 99;

export default async function mount(ctx) {
    const $ = (id) => ctx.root.querySelector('#' + id);
    const site = ctx.siteId, writable = canWrite(site);
    $('kcDay').value = ymd(new Date());
    let SLIPS = [], GROUPS = [];
    const ret = new Map();            // "slip|room" → cards returned (the server's, with this screen's unsent taps on top)
    const pending = new Map();        // "slip|room" → { slip_id, room_no, returned } waiting to be sent
    let timer = null, day = $('kcDay').value;
    const key = (slipId, room) => `${slipId}|${room}`;
    const say = (t, bad) => { $('kcMsg').textContent = t || ''; $('kcMsg').classList.toggle('bad', !!bad); if (t && !bad) setTimeout(() => { if ($('kcMsg').textContent === t) say(''); }, 2500); };

    /* ------------------------------- the day's groups ------------------------------- */
    function compute() {
        GROUPS = [];
        for (const s of SLIPS) {
            if (s.deleted) continue;
            for (const d of departuresOf(s)) {
                if (ymd(new Date(d.at)) !== day) continue;
                const by = new Map();
                for (const r of d.rooms) { const n = String(r.room_no || '').trim(); if (n) by.set(n, (by.get(n) || 0) + (Number(r.beds) || 0)); }
                const rooms = [...by].filter(([, n]) => n > 0).sort((a, b) => natural(a[0], b[0]));
                if (!rooms.length) continue;
                const total = Number(s.total) || 0;
                const beds = rooms.reduce((n, [, b]) => n + b, 0);
                const leaving = isDelayed(s) ? Math.max(0, paxAt(s, d.at - 1).total - paxAt(s, d.at).total) : total;
                const pax = leaving || beds;                       // a slip without pax counts: the beds leaving
                GROUPS.push({ slip: s, at: d.at, part: isDelayed(s) && !d.last, rooms, pax });
            }
        }
        GROUPS.sort((a, b) => a.at - b.at || natural(a.slip.tour_name || '', b.slip.tour_name || '') || natural(a.slip.sh_no, b.slip.sh_no));
    }
    const back = (g, [room, issued]) => Math.min(MAX, ret.get(key(g.slip.id, room)) || 0);
    const stats = (g) => {
        const issued = g.rooms.reduce((n, [, i]) => n + i, 0);
        const got = g.rooms.reduce((n, r) => n + back(g, r), 0);
        const out = g.rooms.reduce((n, r) => n + Math.max(0, r[1] - back(g, r)), 0);
        return { issued, got, out };
    };

    /* --------------------------------- drawing --------------------------------- */
    function cardHtml(g) {
        const s = g.slip, st = stats(g), done = st.out === 0 && st.issued > 0;
        const name = `${esc(s.tour_name || '—')}${s.group_leader ? ` (${esc(s.group_leader)})` : ''} ${esc(g.pax)}pax`;
        return `<article class="kc-card${done ? ' done' : ''}" data-slip="${esc(s.id)}" data-at="${esc(g.at)}">
            <div class="kc-date">Departure Date: ${esc(dmy(day))}</div>
            <div class="kc-name">${name}<small>SH ${esc(s.sh_no || '—')} · ${esc(s.building || 'no building')} · leaves ${esc(hm(g.at))}${g.part ? ' · only these rooms leave today' : ''}</small></div>
            <div class="kc-rooms">${g.rooms.map(([room, issued]) => {
                const n = back(g, [room, issued]), cls = n === 0 ? '' : n > issued ? ' over' : n === issued ? ' all' : ' part';
                return `<div class="kc-room${cls}"><div class="kc-no">${esc(room)}</div><div class="kc-iss" title="cards given">${issued}</div>
                    <div class="kc-ret"><button type="button" data-step="-1" data-room="${esc(room)}"${writable && n > 0 ? '' : ' disabled'} aria-label="One card less in room ${esc(room)}">−</button><b title="cards back">${n}</b><button type="button" data-step="1" data-room="${esc(room)}"${writable && n < MAX ? '' : ' disabled'} aria-label="One card more in room ${esc(room)}">+</button></div></div>`;
            }).join('')}</div>
            <div class="kc-foot"><span class="st ${done ? 'ok' : st.got ? 'mid' : ''}">${st.got} / ${st.issued} cards back${st.out ? ` · ${st.out} still out` : ' ✓'}</span>
                <span class="kc-bar"><i class="${done ? 'ok' : ''}" style="width:${st.issued ? Math.min(100, Math.round(st.got / st.issued * 100)) : 0}%"></i></span>
                <button type="button" data-all${writable && st.out ? '' : ' disabled'}>All back</button><button type="button" data-clear${writable && st.got ? '' : ' disabled'}>Clear</button></div>
        </article>`;
    }
    function visible() {
        const bld = $('kcBld').value, q = $('kcFind').value.trim().toLowerCase(), onlyOut = $('kcOut').checked;
        return GROUPS.filter(g => (!bld || (g.slip.building || '') === bld)
            && (!q || [g.slip.tour_name, g.slip.group_leader, g.slip.sh_no, ...g.rooms.map(r => r[0])].some(x => String(x || '').toLowerCase().includes(q)))
            && (!onlyOut || stats(g).out > 0));
    }
    function kpis(list) {
        const a = list.map(stats), issued = a.reduce((n, x) => n + x.issued, 0), got = a.reduce((n, x) => n + x.got, 0), out = a.reduce((n, x) => n + x.out, 0);
        const done = a.filter(x => x.issued && !x.out).length;
        $('kcKpis').innerHTML = [['Cards given', issued, `${list.length} group${list.length === 1 ? '' : 's'} leaving`, ''], ['Cards back', got, issued ? `${Math.round(got / issued * 100)}% collected` : '', got ? 'ok' : ''],
            ['Still out', out, out ? 'to collect' : 'all collected', out ? 'bad' : 'ok'], ['Groups complete', `${done} / ${list.length}`, '', done === list.length && list.length ? 'ok' : '']]
            .map(([l, v, sub, c]) => `<div class="kc-kpi ${c}"><span>${l}</span><b>${esc(v)}</b><small>${esc(sub)}</small></div>`).join('');
    }
    function draw() {
        const list = visible();
        kpis(list);
        $('kcGrid').innerHTML = list.length ? list.map(cardHtml).join('') : `<p class="kc-none">${GROUPS.length ? 'No group matches the filters.' : `No group with assigned rooms leaves on ${esc(dmy(day))}.`}</p>`;
    }
    // a tap redraws only its own card and the totals (the rest of the screen, focus and scroll stay)
    function redrawCard(g) {
        if ($('kcOut').checked) { draw(); return; }
        const el = [...$('kcGrid').children].find(c => c.dataset && c.dataset.slip === String(g.slip.id) && c.dataset.at === String(g.at));
        if (!el) { draw(); return; }
        el.outerHTML = cardHtml(g);
        kpis(visible());
    }
    function fillBuildings() {
        const keep = $('kcBld').value, names = [...new Set(GROUPS.map(g => g.slip.building || '').filter(Boolean))].sort(natural);
        $('kcBld').innerHTML = '<option value="">All buildings</option>' + names.map(n => `<option${n === keep ? ' selected' : ''}>${esc(n)}</option>`).join('');
    }

    /* ---------------------------------- saving ---------------------------------- */
    function setReturned(slipId, room, value) {
        const n = Math.max(0, Math.min(MAX, Math.round(Number(value) || 0)));
        ret.set(key(slipId, room), n);
        pending.set(key(slipId, room), { slip_id: Number(slipId), room_no: room, returned: n });
    }
    function queue() { clearTimeout(timer); timer = setTimeout(flush, 500); }
    async function flush() {
        clearTimeout(timer);
        if (!pending.size) return;
        const items = [...pending.values()];
        for (let i = 0; i < items.length; i += 40) {
            const chunk = items.slice(i, i + 40);
            try {
                await ctx.guard(request('PUT', '/api/key-cards', { site, day, items: chunk }));
                for (const it of chunk) { const k = key(it.slip_id, it.room_no); if (pending.get(k)?.returned === it.returned) pending.delete(k); }
            } catch (e) {
                say(e instanceof UserError ? e.message : 'Could not save the cards — check the connection.', true);
                return;
            }
        }
    }
    async function loadCards() {
        const r = await ctx.guard(request('GET', `/api/key-cards?site=${site}&day=${day}`));
        const mine = new Map(pending);
        ret.clear();
        for (const x of r.rows) ret.set(key(x.slip_id, x.room_no), x.returned);
        for (const [k, p] of mine) ret.set(k, p.returned);        // unsent taps stay
    }
    async function loadAll(redrawBuildings) {
        SLIPS = await ctx.db.all();
        compute();
        try { await loadCards(); } catch (e) { say(e instanceof UserError ? e.message : 'Could not load the cards.', true); }
        if (redrawBuildings) fillBuildings();
        draw();
    }

    /* --------------------------------- events --------------------------------- */
    $('kcGrid').addEventListener('click', (e) => {
        const card = e.target.closest('.kc-card');
        if (!card || !writable) return;
        const g = GROUPS.find(x => String(x.slip.id) === card.dataset.slip && String(x.at) === card.dataset.at);
        if (!g) return;
        const step = e.target.closest('[data-step]');
        if (step) { const room = step.dataset.room; setReturned(g.slip.id, room, (ret.get(key(g.slip.id, room)) || 0) + Number(step.dataset.step)); }
        else if (e.target.closest('[data-all]')) g.rooms.forEach(([room, issued]) => setReturned(g.slip.id, room, Math.max(issued, ret.get(key(g.slip.id, room)) || 0)));
        else if (e.target.closest('[data-clear]')) { if (!confirm(`Clear the cards recorded back for ${g.slip.tour_name || 'this group'}?`)) return; g.rooms.forEach(([room]) => setReturned(g.slip.id, room, 0)); }
        else return;
        redrawCard(g); queue();
    });
    $('kcDay').addEventListener('change', async () => { await flush(); day = $('kcDay').value || ymd(new Date()); $('kcBld').value = ''; await loadAll(true); });
    ctx.root.querySelectorAll('[data-day]').forEach(b => b.addEventListener('click', async () => { $('kcDay').value = shift(ymd(new Date()), Number(b.dataset.day)); $('kcDay').dispatchEvent(new Event('change')); }));
    ['kcBld', 'kcOut'].forEach(id => $(id).addEventListener('change', draw));
    $('kcFind').addEventListener('input', draw);
    $('kcPrint').addEventListener('click', () => window.print());
    if (!writable) say(`View only — this login cannot record cards for ${ctx.site.label}.`);

    await loadAll(true);
    // other desks' taps: every 30 s while the page is open and nothing of this screen's is waiting to be sent
    const timerId = setInterval(() => { if (document.visibilityState === 'visible' && !pending.size) loadAll(false).catch(() => { }); }, 30000);
    const onHide = () => { if (document.visibilityState === 'hidden') flush(); };
    document.addEventListener('visibilitychange', onHide);
    return () => { clearInterval(timerId); clearTimeout(timer); document.removeEventListener('visibilitychange', onHide); flush(); };
}
