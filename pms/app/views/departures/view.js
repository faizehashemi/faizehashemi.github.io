// Delayed departures (Front desk). Groups that could not leave on their booked date (airspace closures, tickets not
// confirmed). Each room row of a delayed slip has its own check-out and status (core/stay.js):
//   confirmed · tentative (ticket not confirmed) · unknown (beds held until today + Setup's hold days).
// Top: totals. Then every delayed group with its rooms, the next group booked into each room and any clash; tick
// rooms to set their check-out / status, hold them, or mark them left. Every change is checked against incoming
// bookings first, written in one go and kept in the bulk-change log with Undo. Below: guests leaving per day (for
// transport) and groups booked to leave today/tomorrow that can be marked delayed.

import { loadBuildings, builderCapacity } from '../../core/rooms.js';
import { loadSettings, DEFAULTS } from '../../core/settings.js';
import { rowsOf, slipEnd, isDelayed, paxAt, departuresOf, roomConflicts } from '../../core/stay.js';
import { recordApply, mountAllocLog } from '../forecast/alloclog.js';
import { reportRows, exportReport } from './report.js';
import { mirrorAll } from '../../core/cloud.js';

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const pad = (n) => String(n).padStart(2, '0');
const ymd = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const hm = (d) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;
const fmt = (ms) => ms ? new Date(ms).toLocaleString(undefined, { weekday: 'short', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—';
const natural = (a, b) => String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: 'base' });
const DAY = 864e5;

export default async function mount(ctx) {
    const $ = (id) => ctx.root.querySelector('#' + id);
    let SLIPS = [], BLD = [], HOLD = DEFAULTS.delay_hold_days;
    const capOf = (b, room) => builderCapacity(BLD, b, room);
    const ticked = new Set(); // "slipId|side|index"
    const writable = !ctx.db.readonly;
    if (!writable) $('dpBar').hidden = true;

    async function load() {
        const [slips, blds, st] = await Promise.all([ctx.db.all(), ctx.guard(loadBuildings({ force: true })), ctx.guard(loadSettings()).catch(() => null)]);
        SLIPS = slips.filter(s => !s.deleted); BLD = blds;
        HOLD = Number(st?.settings?.delay_hold_days) || HOLD;
        const t = new Date(); t.setDate(t.getDate() + 1);
        if (!$('dpDate').value) { $('dpDate').value = ymd(t); $('dpTime').value = '10:00'; }
        render();
    }

    function render() {
        const now = Date.now();
        const delayed = SLIPS.filter(s => isDelayed(s) && slipEnd(s) > now).sort((a, b) => slipEnd(a) - slipEnd(b));
        const conf = new Map(delayed.map(s => [s.id, roomConflicts(s, SLIPS, capOf, now)]));
        const rowsLeft = delayed.flatMap(s => rowsOf(s).filter(w => w.end > now).map(w => ({ s, w })));
        const beds = (st) => rowsLeft.filter(x => x.w.status === st).reduce((n, x) => n + x.w.beds, 0);
        const today = ymd(new Date()), tomorrow = ymd(new Date(now + DAY));
        const leaving = (day) => delayed.flatMap(s => departuresOf(s).filter(d => ymd(new Date(d.at)) === day).map(d => paxAt(s, d.at - 1).total - paxAt(s, d.at).total)).reduce((n, x) => n + x, 0);
        const allConf = [...conf.values()].flat();
        const clashes = allConf.filter(c => c.clash).length, tight = allConf.filter(c => c.tight).length;
        $('dpKpis').innerHTML = [
            ['Delayed groups', delayed.length, `${delayed.reduce((n, s) => n + paxAt(s, now).total, 0)} guests in house`, 'big'],
            ['Unknown date', beds('unknown'), 'beds held', 'warn'],
            ['Tentative', beds('tentative'), 'beds, ticket not confirmed'],
            ['Confirmed', beds('confirmed'), 'beds with a new date'],
            ['Leaving today', leaving(today), 'guests'],
            ['Leaving tomorrow', leaving(tomorrow), 'guests'],
            ['Rooms clashing', clashes, 'overflow with the next group', clashes ? 'bad' : ''],
            ['Rooms tight', tight, 'next group within 2 days', tight ? 'amber' : ''],
        ].map(([l, v, s, c]) => `<div class="dp-kpi ${c || ''}"><span>${esc(l)}</span><b>${v}</b><small>${esc(s)}</small></div>`).join('');

        // groups
        $('dpGroups').innerHTML = delayed.length ? delayed.map(s => {
            const cs = conf.get(s.id);
            const rows = [];
            for (const side of ['gents', 'ladies']) (s.rooms?.[side] || []).forEach((x, i) => {
                if (!String(x.room_no || '').trim()) return;
                const w = rowsOf({ ...s, rooms: { gents: side === 'gents' ? [x] : [], ladies: side === 'ladies' ? [x] : [] } })[0];
                const c = cs.find(k => k.row.row === x);
                const key = `${s.id}|${side}|${i}`;
                const gone = w.end <= now;
                const review = !gone && w.status !== 'confirmed' && w.end - now < 2 * DAY;
                rows.push(`<tr class="${gone ? 'gone' : c?.clash ? 'clash' : c?.tight ? 'tight' : ''}${review ? ' review' : ''}">
                    <td>${writable && !gone ? `<input type="checkbox" data-tick="${key}" ${ticked.has(key) ? 'checked' : ''}>` : ''}</td>
                    <td><b>${esc(x.room_no)}</b><small>${side === 'gents' ? 'Gents' : 'Ladies'}${x.gl ? ' · GL' : ''}</small></td>
                    <td class="n">${w.beds}</td>
                    <td>${esc(fmt(w.end))}${review ? '<small class="dp-rev">review — leaves soon, not confirmed</small>' : ''}</td>
                    <td><span class="dp-st ${esc(w.status)}">${gone ? 'left' : esc(w.status === 'booked' ? 'booked' : w.status)}</span></td>
                    <td class="dp-next">${gone ? '' : c?.clash ? `<b>Overflows</b> ${esc(fmt(c.at))}: ${c.peak}/${c.cap} beds with ${c.who.map(o => `SH ${esc(o.sh)}`).join(', ')}`
                        : c?.next ? `next: SH ${esc(c.next.sh)} from ${esc(fmt(c.next.start))}` : '<span class="dp-note">no one booked after</span>'}</td></tr>`);
            });
            const u = s.ums || {};
            const gl = String(s.group_leader || u.glName || '').trim();
            const phone = u.glPhone || u.phone || '';
            return `<article class="dp-group">
                <header>
                    <div><a class="dp-sh" href="${esc(ctx.href('slip', { sh_no: s.sh_no }))}" title="Open the slip">SH ${esc(s.sh_no)}</a> <b>${esc(s.tour_name || '-')}</b>
                        <small>${esc(gl || '-')}${phone ? ` · ${esc(phone)}` : ''} · ${esc(s.building || 'no building')}</small></div>
                    <div class="dp-gmeta"><span class="dp-st ${esc(s.delayed.status || '')}">${esc(s.delayed.status || '')}</span>
                        <span>${paxAt(s, now).total} in house</span><span class="dp-note">booked to leave ${esc(s.delayed.original_checkout ? `${s.delayed.original_checkout.date} ${s.delayed.original_checkout.time}` : '—')}</span></div>
                </header>
                ${s.delayed.note ? `<p class="dp-gnote">${esc(s.delayed.note)}</p>` : ''}
                ${rows.length ? `<table class="dp-tbl"><thead><tr><th>${writable ? `<input type="checkbox" data-all="${s.id}" aria-label="Tick all rooms">` : ''}</th><th>Room</th><th class="n">Beds</th><th>Leaves</th><th>Status</th><th>Next group in the room</th></tr></thead><tbody>${rows.join('')}</tbody></table>`
                    : '<p class="dp-note">No rooms on this slip — the whole group leaves at the slip\'s check-out.</p>'}
            </article>`;
        }).join('') : '<p class="dp-note">No delayed groups. Mark one from the list below or on the Slip page (Delayed departure).</p>';

        // leaving per day (14 days)
        const days = [];
        for (let i = 0; i < 14; i++) days.push(ymd(new Date(now + i * DAY)));
        const per = days.map(d => {
            const r = { d, confirmed: 0, tentative: 0, unknown: 0 };
            for (const s of delayed) for (const e of departuresOf(s)) {
                if (ymd(new Date(e.at)) !== d) continue;
                const n = paxAt(s, e.at - 1).total - paxAt(s, e.at).total;
                r[e.status === 'booked' ? 'confirmed' : e.status] = (r[e.status === 'booked' ? 'confirmed' : e.status] || 0) + n;
            }
            return r;
        }).filter(r => r.confirmed + r.tentative + r.unknown);
        $('dpDays').innerHTML = per.length ? `<table class="dp-tbl"><thead><tr><th>Day</th><th class="n">Confirmed</th><th class="n">Tentative</th><th class="n">Unknown (hold ends)</th><th class="n">Total</th></tr></thead>
            <tbody>${per.map(r => `<tr><td>${esc(new Date(`${r.d}T12:00`).toLocaleDateString(undefined, { weekday: 'short', day: '2-digit', month: 'short' }))}</td><td class="n">${r.confirmed || ''}</td><td class="n">${r.tentative || ''}</td><td class="n">${r.unknown || ''}</td><td class="n"><b>${r.confirmed + r.tentative + r.unknown}</b></td></tr>`).join('')}</tbody></table>`
            : '<p class="dp-note">No delayed guests leaving in the next 14 days.</p>';

        // booked to leave today / tomorrow (not delayed yet)
        const soon = SLIPS.filter(s => !isDelayed(s) && [today, tomorrow].includes(s.checkout_date) && slipEnd(s) > now - 6 * 36e5)
            .sort((a, b) => slipEnd(a) - slipEnd(b));
        $('dpSoon').innerHTML = soon.length ? `<table class="dp-tbl"><thead><tr><th>SH</th><th>Group</th><th>Leaves</th><th class="n">Pax</th><th></th></tr></thead>
            <tbody>${soon.map(s => `<tr><td><b>${esc(s.sh_no)}</b></td><td>${esc(s.tour_name || '-')}<small>${esc(s.building || '')}</small></td><td>${esc(fmt(slipEnd(s)))}</td><td class="n">${paxAt(s, slipEnd(s) - 1).total}</td>
                <td>${writable ? `<button type="button" class="dp-btn small" data-mark="${s.id}">Mark delayed</button>` : ''}</td></tr>`).join('')}</tbody></table>`
            : '<p class="dp-note">No groups booked to leave today or tomorrow.</p>';
        $('dpCount').textContent = `${ticked.size} room${ticked.size === 1 ? '' : 's'} ticked`;
    }

    /* ------------------------------ writing ------------------------------ */
    const say = (m, bad = false) => { $('dpMsg').textContent = m; $('dpMsg').className = `dp-msg${bad ? ' bad' : ''}`; };
    const clone = (s) => JSON.parse(JSON.stringify(s));
    function fixCheckout(s) { // the slip's check-out = the last room to leave
        const ends = ['gents', 'ladies'].flatMap(k => (s.rooms?.[k] || []).filter(x => x.out?.date).map(x => `${x.out.date}T${x.out.time || '00:00'}`)).sort();
        if (ends.length) [s.checkout_date, s.checkout_time] = ends.at(-1).split('T');
    }
    // change the ticked rows (or given slips), check them against incoming bookings, write all, log with undo
    async function write(note, change, ids = null) {
        const byId = new Map(SLIPS.map(s => [s.id, s]));
        const targets = new Map();
        if (ids) for (const id of ids) targets.set(id, null);
        else for (const k of ticked) { const [id, side, i] = k.split('|'); const id2 = Number(id); if (!targets.has(id2)) targets.set(id2, []); targets.get(id2).push([side, Number(i)]); }
        if (!targets.size) { say('Tick the rooms first.', true); return; }
        const pairs = [];
        for (const [id, rows] of targets) {
            const before = byId.get(id);
            if (!before) continue;
            const after = clone(before);
            change(after, rows);
            fixCheckout(after);
            pairs.push([before, after]);
        }
        // check: no room may overflow with the next groups once these are applied
        const after = new Map(pairs.map(([b, a]) => [b.id, a]));
        const view = SLIPS.map(s => after.get(s.id) || s);
        // only the rooms this change moves (a clash already there on another room must not stop fixing the rest)
        const moved = (b, a, x) => { const side = (a.rooms.gents || []).includes(x) ? 'gents' : 'ladies'; const i = a.rooms[side].indexOf(x);
            const y = b.rooms?.[side]?.[i]; return !y || JSON.stringify(y.out || null) !== JSON.stringify(x.out || null); };
        const clashes = pairs.flatMap(([b, a]) => roomConflicts(a, view, capOf).filter(c => c.clash && moved(b, a, c.row.row))
            .map(c => `SH ${a.sh_no} room ${c.row.room_no}: ${c.peak}/${c.cap} beds on ${fmt(c.at)} with ${c.who.map(o => `SH ${o.sh}`).join(', ')}`));
        if (clashes.length) { alert(`Not saved — these rooms would overflow with groups booked in after:\n\n${clashes.join('\n')}\n\nMove the delayed guests to other rooms (Slip page → Pick rooms…) or choose an earlier date.`); return; }
        say('Saving…');
        try {
            const res = await ctx.guard(ctx.db.bulkWrite({ put: pairs.map(([, a]) => a) }, 'delay'));
            await recordApply(ctx, 'delay', note, pairs);
            ticked.clear();
            await load();
            say(`Saved ${res.updated} slip${res.updated === 1 ? '' : 's'}. Undo is in “Bulk changes” below.`);
        } catch (e) { say(e.message || String(e), true); }
    }
    const setRow = (s, side, i, out, status) => { const x = s.rooms[side][i]; x.out = out; x.out_status = status; };
    $('dpApply').addEventListener('click', () => {
        const date = $('dpDate').value, time = $('dpTime').value || '10:00', status = $('dpStatus').value;
        if (!date) { say('Choose the date.', true); return; }
        write(`${ticked.size} room(s) → ${date} ${time} (${status})`, (s, rows) => rows.forEach(([side, i]) => setRow(s, side, i, { date, time }, status)));
    });
    $('dpHold').addEventListener('click', () => {
        const d = new Date(Date.now() + HOLD * DAY);
        write(`${ticked.size} room(s) held ${HOLD} days (unknown)`, (s, rows) => rows.forEach(([side, i]) => setRow(s, side, i, { date: ymd(d), time: s.rooms[side][i].out?.time || s.checkout_time || '10:00' }, 'unknown')));
    });
    $('dpLeft').addEventListener('click', () => {
        if (!confirm(`Mark the ${ticked.size} ticked room(s) as left now? Their beds are free from this minute.`)) return;
        const n = new Date();
        write(`${ticked.size} room(s) left`, (s, rows) => rows.forEach(([side, i]) => setRow(s, side, i, { date: ymd(n), time: hm(n) }, 'confirmed')));
    });

    ctx.root.addEventListener('change', (e) => {
        const t = e.target;
        if (t.dataset.tick) { t.checked ? ticked.add(t.dataset.tick) : ticked.delete(t.dataset.tick); $('dpCount').textContent = `${ticked.size} room${ticked.size === 1 ? '' : 's'} ticked`; }
        if (t.dataset.all) {
            t.closest('table').querySelectorAll('[data-tick]').forEach(c => { c.checked = t.checked; t.checked ? ticked.add(c.dataset.tick) : ticked.delete(c.dataset.tick); });
            $('dpCount').textContent = `${ticked.size} room${ticked.size === 1 ? '' : 's'} ticked`;
        }
    });
    ctx.root.addEventListener('click', (e) => {
        const b = e.target.closest('[data-mark]');
        if (!b) return;
        const s = SLIPS.find(x => x.id === Number(b.dataset.mark));
        if (!s || !confirm(`Mark SH ${s.sh_no} as a delayed departure? Every room keeps today's check-out as tentative; change the dates above.`)) return;
        write(`SH ${s.sh_no} marked delayed`, (a) => {
            a.delayed = { on: true, status: 'tentative', note: '', original_checkout: { date: a.checkout_date, time: a.checkout_time }, updated_at: new Date().toISOString() };
            for (const side of ['gents', 'ladies']) for (const x of a.rooms?.[side] || []) if (String(x.room_no || '').trim()) { x.out = { date: a.checkout_date, time: a.checkout_time }; x.out_status = 'tentative'; }
        }, [s.id]);
    });
    // Delayed Departure Report (Excel): every delayed group of this site, one row per departure
    // default range: the 1st of this month to today (departures after today have not happened yet)
    { const t = new Date(), p = (n) => String(n).padStart(2, '0'); $('dpTo').value = `${t.getFullYear()}-${p(t.getMonth() + 1)}-${p(t.getDate())}`; $('dpFrom').value = `${t.getFullYear()}-${p(t.getMonth() + 1)}-01`; }
    $('dpExport').addEventListener('click', async () => {
        const b = $('dpExport');
        let from = $('dpFrom').value, to = $('dpTo').value;
        if (from && to && from > to) [from, to] = [to, from];
        b.disabled = true;
        try {
            const all = await ctx.guard(mirrorAll()).catch(() => SLIPS);
            const rows = reportRows(SLIPS, all, { from, to });
            if (!rows.length) { say('No delayed departures in these dates.', true); return; }
            await exportReport(rows, ctx.site.label, { from, to });
            say(`Exported ${rows.length} row${rows.length === 1 ? '' : 's'}.`);
        } catch (e) { say(e.message || String(e), true); }
        finally { b.disabled = false; }
    });
    $('dpRefresh').addEventListener('click', () => load().catch(e => say(e.message || String(e), true)));
    window.addEventListener('pms:alloc-undone', () => load().catch(() => { }));

    mountAllocLog({ ctx, host: $('dpLog') });
    await load();
}
