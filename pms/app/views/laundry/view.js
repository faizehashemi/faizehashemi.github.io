// Laundry POS — the worker's phone/tablet screen. Built for speed and for people who read little:
// big pictures of each item (tap = one more), big numbers, a few icons, one SAVE button.
//   🧺 New bill: swipe building → floor → room (wheels, no keyboard) → tap items → Cash → SAVE → receipt
//   🆓 Free (staff): tap the staff member (all listed, filter optional), check the PHOTO, tap items → SAVE (value recorded, 0 collected)
//   📦 Pending: clothes still here → ✅ Ready → 🤲 Collected
//   📋 My day: my bills and money today (and bills waiting on this phone when offline)
//   🔒 Close day: count the cash, see the difference
// Prices come from the server; the worker cannot change them. Works offline (bills wait on the phone).

import { request, mirrorAll, currentDesk, UserError } from '../../core/cloud.js';
import {
    sar, esc, jeddahDay, jeddahTime, METHOD, STATUS, DEFAULT_INFO, itemPic, cached, saveBill, flushQueue, queued, dropQueued,
    receiptHTML, printReceipt, RECEIPT_CSS, ApiError,
} from '../../core/laundry.js';
import { loadBuildings, buildingsOfSite, floorOf, normRoom, normBuilding } from '../../core/rooms.js';
import { wheel } from './wheel.js';

const natural = (a, b) => String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: 'base' });

export default async function mount(ctx) {
    const $ = (id) => ctx.root.querySelector('#' + id);
    const site = ctx.siteId;
    const me = currentDesk();
    const st = { tab: 'bill', cart: new Map(), method: 'cash', staff: null, usage: null, items: [], staffList: [], buildings: [], slips: [], info: DEFAULT_INFO };

    // receipt styles for the on-screen receipt
    const rcss = document.createElement('style'); rcss.textContent = RECEIPT_CSS; document.head.appendChild(rcss);

    /* ------------------------------ data ------------------------------ */
    async function loadItems() {
        const r = await ctx.guard(cached(`pms_laundry_items:${site}`, () => request('GET', `/api/laundry/items?site=${site}`)));
        st.items = r.data.items.filter(i => i.active);
        drawItems();
    }
    async function loadStaff() {
        const r = await ctx.guard(cached(`pms_laundry_staff:${site}`, () => request('GET', `/api/laundry/staff?site=${site}`)));
        st.staffList = r.data.staff.filter(s => s.active && s.free);
    }
    async function loadInfo() {
        try { const r = await ctx.guard(cached('pms_laundry_info', () => request('GET', '/api/settings'))); st.info = r.data.settings?.laundry_info || DEFAULT_INFO; } catch { }
        $('ldInfo').innerHTML = `<span aria-hidden="true">🕗</span><div>${esc(st.info).replace(/\n/g, '<br>')}</div>`;
    }
    // in-house slips: tell which group is in the chosen room
    async function loadSlips() {
        try { st.slips = (await ctx.guard(mirrorAll(site))).filter(s => !s.deleted); } catch { }
    }
    // buildings and rooms from Rooms & Buildings (this site's; all when the site has none)
    async function loadRooms() {
        const all = await ctx.guard(loadBuildings({ force: true }));
        const own = buildingsOfSite(all, site);
        st.buildings = (own.length ? own : all)
            .map(b => ({ name: b.name, sort: b.sort || 0, rooms: (b.rooms || []).filter(r => r.active !== false && r.room_no) }))
            .filter(b => b.rooms.length)
            .sort((a, b) => a.sort - b.sort || natural(a.name, b.name));
        let keep = ''; try { keep = localStorage.getItem(`pms_laundry_building:${site}`) || ''; } catch { }
        wB.set(st.buildings.map(b => ({ value: b.name, label: b.name })), keep);
        pickBuilding(wB.value);
    }

    /* --------------------------- tabs & mode --------------------------- */
    function showTab(tab) {
        st.tab = tab;
        ctx.root.querySelectorAll('.ld-tabs [data-tab]').forEach(b => b.setAttribute('aria-selected', String(b.dataset.tab === tab)));
        const billish = tab === 'bill' || tab === 'free';
        $('paneBill').hidden = !billish;
        $('panePending').hidden = tab !== 'pending';
        $('paneToday').hidden = tab !== 'today';
        $('paneClose').hidden = tab !== 'close';
        if (billish) {
            $('ldCustomer').hidden = tab !== 'bill';
            $('ldStaff').hidden = tab !== 'free';
            $('ldPay').hidden = tab === 'free';
            ctx.root.querySelector('.ld').classList.toggle('free', tab === 'free');
            if (tab === 'free') { drawStaffList(); if (!st.staffList.length) loadStaff().then(drawStaffList).catch(() => { }); }
            if (tab === 'bill') [wB, wF, wR].forEach(w => w.sync());
            drawCart();
        }
        if (tab === 'pending') loadPending();
        if (tab === 'today') loadToday();
        if (tab === 'close') loadClose();
        window.scrollTo(0, 0);
    }
    ctx.root.querySelector('.ld-tabs').addEventListener('click', (e) => { const b = e.target.closest('[data-tab]'); if (b) showTab(b.dataset.tab); });

    /* --------------------------- items & cart --------------------------- */
    function drawItems() {
        $('ldItems').innerHTML = st.items.map(i => {
            const q = st.cart.get(i.id) || 0;
            return `<button type="button" class="ld-item${q ? ' on' : ''}" data-item="${i.id}" aria-label="${esc(i.name)}, ${sar(i.price)} SAR${q ? `, ${q} added` : ''}">
                ${itemPic(i)}
                <span class="ld-iname">${esc(i.name)}${i.name_local ? `<small>${esc(i.name_local)}</small>` : ''}</span>
                <span class="ld-iprice">${sar(i.price)} <small>SAR</small></span>
                ${q ? `<b class="ld-badge">${q}</b>` : ''}
            </button>`;
        }).join('') || '<p class="ld-muted">No items yet — the admin adds them on Laundry admin → Prices.</p>';
    }
    function add(id, n) {
        const q = Math.max(0, (st.cart.get(id) || 0) + n);
        if (q) st.cart.set(id, q); else st.cart.delete(id);
        drawItems(); drawCart();
    }
    $('ldItems').addEventListener('click', (e) => { const b = e.target.closest('[data-item]'); if (b) { add(Number(b.dataset.item), 1); b.classList.add('pop'); setTimeout(() => b.classList.remove('pop'), 180); } });

    const lines = () => [...st.cart].map(([id, qty]) => { const i = st.items.find(x => x.id === id); return i && { item_id: id, name: i.name, price: i.price, qty, amount: i.price * qty, image: i.image }; }).filter(Boolean);
    const total = () => lines().reduce((n, l) => n + l.amount, 0);

    function drawCart() {
        const ls = lines(), t = total(), pcs = ls.reduce((n, l) => n + l.qty, 0);
        $('ldCart').innerHTML = ls.length ? `<table class="ld-cart-t">${ls.map(l => `<tr>
              <td class="c-pic">${itemPic(l, 'ld-pic sm')}</td><td class="c-name">${esc(l.name)}<small>${sar(l.price)} SAR</small></td>
              <td class="c-qty"><button type="button" data-dec="${l.item_id}" aria-label="One less ${esc(l.name)}">−</button><b>${l.qty}</b><button type="button" data-inc="${l.item_id}" aria-label="One more ${esc(l.name)}">+</button></td>
              <td class="c-amt">${sar(l.amount)}</td></tr>`).join('')}</table>` : '<p class="ld-hint">👆 Tap the pictures to add clothes</p>';
        const free = st.tab === 'free';
        $('ldTotalLbl').textContent = free ? 'VALUE · FREE' : 'TOTAL';
        $('ldTotal').textContent = sar(t);
        $('ldPieces').textContent = pcs;
        ctx.root.querySelector('.ld-bar').classList.toggle('free', free);
        $('ldSave').disabled = !ls.length || (free && !st.staff);
        $('ldSave').innerHTML = free ? '<span aria-hidden="true">✔</span> SAVE · FREE' : '<span aria-hidden="true">✔</span> SAVE';
        // cash given → change
        const quick = [...new Set([t, ...[5, 10, 20, 50, 100, 200, 500].map(v => v * 100).filter(v => v > t)].slice(0, 5))];
        $('ldQuick').innerHTML = t ? quick.map(v => `<button type="button" data-recv="${v}">${sar(v)}</button>`).join('') : '';
        drawChange();
        if (free) drawStaffCard();
    }
    $('ldCart').addEventListener('click', (e) => {
        const d = e.target.closest('[data-dec]'), i = e.target.closest('[data-inc]');
        if (d) add(Number(d.dataset.dec), -1); else if (i) add(Number(i.dataset.inc), 1);
    });

    function drawChange() {
        const t = total(), v = $('ldReceived').value.trim();
        const got = v === '' ? null : Math.round(Number(v) * 100);
        $('ldRecvBox').hidden = st.method !== 'cash' || !t;
        $('ldChange').textContent = got == null || !Number.isFinite(got) ? '' : got < t ? `short ${sar(t - got)}` : `change ${sar(got - t)}`;
        $('ldChange').className = 'ld-change' + (got != null && got < t ? ' bad' : '');
    }
    $('ldQuick').addEventListener('click', (e) => { const b = e.target.closest('[data-recv]'); if (b) { $('ldReceived').value = sar(Number(b.dataset.recv)); drawChange(); } });
    $('ldReceived').addEventListener('input', drawChange);
    $('ldMethods').addEventListener('click', (e) => {
        const b = e.target.closest('[data-method]');
        if (!b) return;
        st.method = b.dataset.method;
        $('ldMethods').querySelectorAll('[data-method]').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
        drawChange();
    });
    $('ldClear').addEventListener('click', () => { if (!st.cart.size || confirm('Clear this bill?')) resetBill(); });

    function resetBill() {
        st.cart.clear();
        $('ldReceived').value = '';
        pickFloor(wF.value); // keep building and floor (the next customer is often a neighbour), room back to —
        st.staff = null; st.usage = null; $('ldStaffFind').value = ''; $('ldStaffCard').hidden = true; drawStaffList();
        st.method = 'cash'; $('ldMethods').querySelectorAll('[data-method]').forEach(x => x.setAttribute('aria-pressed', String(x.dataset.method === 'cash')));
        drawItems(); drawCart();
    }

    /* ---------------------- customer: building → floor → room ---------------------- */
    const floorOfRoom = (r) => String(r.floor || floorOf(r.room_no) || '0');
    const bld = () => st.buildings.find(b => b.name === wB.value);
    const wB = wheel($('ldWBuilding'), (v) => pickBuilding(v));
    const wF = wheel($('ldWFloor'), (v) => pickFloor(v));
    const wR = wheel($('ldWRoom'), () => drawPicked());
    function pickBuilding(name) {
        try { if (name) localStorage.setItem(`pms_laundry_building:${site}`, name); } catch { }
        const floors = [...new Set((bld()?.rooms || []).map(floorOfRoom))].sort(natural);
        wF.set(floors.map(f => ({ value: f, label: f === '0' ? 'G' : f })), floors[0]);
        pickFloor(wF.value);
    }
    function pickFloor(floor) {
        const rooms = (bld()?.rooms || []).filter(r => floorOfRoom(r) === floor).map(r => normRoom(r.room_no)).sort(natural);
        wR.set([{ value: '', label: '—', cls: 'none' }, ...rooms.map(r => ({ value: r, label: r }))], '');
        drawPicked();
    }
    // the group staying in that room right now (from the slips), kept on the bill
    function groupIn(building, room) {
        const now = Date.now();
        for (const s of st.slips) {
            const ci = Date.parse(`${s.checkin_date}T${s.checkin_time || '00:00'}`), co = Date.parse(`${s.checkout_date}T${s.checkout_time || '23:59'}`);
            if (!(ci <= now && now < co) || normBuilding(s.building) !== building) continue;
            if (['gents', 'ladies'].some(k => (s.rooms?.[k] || []).some(r => normRoom(r.room_no) === room))) return s.tour_name || '';
        }
        return '';
    }
    function customer() {
        const building = wB.value || '', room = wR.value || '';
        return { name: '', room, building, group: room ? groupIn(building, room) : '' };
    }
    function drawPicked() {
        const c = customer();
        $('ldPicked').innerHTML = !st.buildings.length ? '<small>No rooms yet — the admin adds them on Rooms &amp; Buildings.</small>'
            : c.room ? `🚪 ${esc(c.building)} · ${esc(c.room)}${c.group ? `<span class="grp">🏨 ${esc(c.group)}</span>` : ''}`
                : '<small>👆 Swipe the wheels to the room</small>';
    }

    /* ------------------------------ free: staff ------------------------------ */
    function drawStaffList() {
        const q = $('ldStaffFind').value.trim().toLowerCase();
        const list = st.staffList.filter(s => !q || [s.name, s.staff_code, s.room, s.contact].some(v => String(v || '').toLowerCase().includes(q)));
        $('ldStaffList').hidden = !!st.staff;
        $('ldStaffList').innerHTML = list.map(s => `<button type="button" class="ld-staff" data-staff="${s.id}">
            ${s.photo ? `<img src="${s.photo}" alt="">` : '<span class="nophoto">👤</span>'}<span><b>${esc(s.name)}</b><small>${esc([s.staff_code, s.department, s.room && '🚪 ' + s.room].filter(Boolean).join(' · '))}</small></span></button>`).join('')
            || `<p class="ld-muted">${st.staffList.length ? 'Nobody matches.' : 'No free-laundry staff yet — the admin adds them on Laundry admin → Staff.'}</p>`;
    }
    $('ldStaffFind').addEventListener('input', () => { st.staff = null; $('ldStaffCard').hidden = true; drawStaffList(); drawCart(); });
    $('ldStaffList').addEventListener('click', async (e) => {
        const b = e.target.closest('[data-staff]');
        if (!b) return;
        st.staff = st.staffList.find(s => s.id === Number(b.dataset.staff));
        st.usage = null;
        drawStaffList(); drawCart();
        try { st.usage = (await ctx.guard(request('GET', `/api/laundry/staff/${st.staff.id}`))).usage; drawStaffCard(); } catch { }
    });
    function drawStaffCard() {
        const s = st.staff;
        $('ldStaffCard').hidden = !s;
        if (!s) return;
        const L = s.limits || {}, pcs = lines().reduce((n, l) => n + l.qty, 0), val = total(), u = st.usage;
        const warn = [];
        if (L.per_bill_items && pcs > L.per_bill_items) warn.push(`${pcs} pieces — limit ${L.per_bill_items} per time`);
        if (u && L.per_day_items && u.day_items + pcs > L.per_day_items) warn.push(`${u.day_items + pcs} pieces today — limit ${L.per_day_items}`);
        if (u && L.per_week_items && u.week_items + pcs > L.per_week_items) warn.push(`${u.week_items + pcs} pieces this week — limit ${L.per_week_items}`);
        if (u && L.per_month_value && u.month_value + val > L.per_month_value) warn.push(`${sar(u.month_value + val)} SAR this month — limit ${sar(L.per_month_value)}`);
        if (u && L.per_month_bills && u.month_bills + 1 > L.per_month_bills) warn.push(`${u.month_bills + 1} times this month — limit ${L.per_month_bills}`);
        $('ldStaffCard').innerHTML = `
            <div class="ld-photo">${s.photo ? `<img src="${s.photo}" alt="Photo of ${esc(s.name)}">` : '<span>👤<small>no photo</small></span>'}</div>
            <div class="ld-sinfo"><b>${esc(s.name)}</b>
              <span>${esc([s.staff_code && 'ID ' + s.staff_code, s.department, s.room && '🚪 ' + s.room].filter(Boolean).join(' · '))}</span>
              <span class="ld-check">👀 Is this the same person? Check the photo.</span>
              ${u ? `<span class="ld-usage">This month: <b>${u.month_bills}</b> times · <b>${u.month_items}</b> pcs · <b>${sar(u.month_value)}</b> SAR</span>` : ''}
              ${warn.length ? `<span class="ld-warn">⚠️ ${warn.map(esc).join('<br>⚠️ ')}${L.enforce ? '<br>Supervisor approval needed.' : ''}</span>` : ''}
              <button type="button" class="ld-change-staff" data-unstaff>Change person</button></div>`;
    }
    $('ldStaffCard').addEventListener('click', (e) => { if (e.target.closest('[data-unstaff]')) { st.staff = null; $('ldStaffFind').value = ''; $('ldStaffCard').hidden = true; drawStaffList(); drawCart(); } });

    /* ---------------------------------- save ---------------------------------- */
    async function save(approval) {
        const free = st.tab === 'free', ls = lines();
        if (!ls.length) return;
        const cust = customer();
        if (!free && !cust.room) { alert('Choose the room first (swipe the wheels).'); return; }
        const recv = $('ldReceived').value.trim();
        const payload = {
            site, kind: free ? 'free' : 'paid', customer: free ? undefined : cust, staff_id: free ? st.staff?.id : undefined,
            lines: ls.map(l => ({ item_id: l.item_id, qty: l.qty })), method: free ? undefined : st.method,
            received: free || st.method !== 'cash' || recv === '' ? undefined : Number(recv),
            preview_lines: ls.map(({ image, ...l }) => l), preview_value: total(), staff_name: free ? st.staff?.name : undefined,
            client_uid: st.pendingUid, approval,
        };
        st.pendingUid = payload.client_uid || (st.pendingUid = (crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random().toString(36).slice(2)));
        payload.client_uid = st.pendingUid;
        $('ldSave').disabled = true;
        try {
            const r = await ctx.guard(saveBill(payload));
            st.pendingUid = null;
            showReceipt(r.bill, r.warnings, r.offline);
            resetBill();
            refreshOffline();
            loadSlips();
        } catch (e) {
            if (e instanceof ApiError && e.status === 409 && e.extra?.needs_approval) askApproval(e.extra.warnings || []);
            else alert(e instanceof UserError ? e.message : 'Could not save. Try again.');
        } finally { drawCart(); }
    }
    $('ldSave').addEventListener('click', () => save());

    // over a staff member's limit with "approval required": a supervisor types their login name + password
    function askApproval(warnings) {
        const dlg = document.createElement('dialog');
        dlg.className = 'ld-dlg';
        dlg.innerHTML = `<form method="dialog" class="ld-appr">
            <h3>⚠️ Supervisor approval</h3>
            <p>${warnings.map(esc).join('<br>')}</p>
            <label>Supervisor login<input name="n" autocomplete="off" required></label>
            <label>Password<input name="p" type="password" autocomplete="off" required></label>
            <div class="ld-dlg-b"><button type="button" data-x>Cancel</button><button type="submit" class="ok">✔ Approve & save</button></div></form>`;
        ctx.root.appendChild(dlg);
        dlg.querySelector('[data-x]').onclick = () => dlg.close();
        dlg.querySelector('form').onsubmit = (e) => { e.preventDefault(); const f = e.target; dlg.close(); save({ name: f.n.value.trim(), password: f.p.value }); };
        dlg.addEventListener('close', () => dlg.remove());
        dlg.showModal();
    }

    function showReceipt(b, warnings = [], offline = false) {
        const dlg = document.createElement('dialog');
        dlg.className = 'ld-dlg ld-rdlg';
        dlg.innerHTML = `<div class="ld-done">${offline ? '⏳ Saved on this phone — will send when online' : b.kind === 'free' ? '✅ Saved · FREE' : `✅ Saved · ${sar(b.paid)} SAR ${esc(METHOD[b.method] || '')}`}</div>
            ${warnings?.length ? `<div class="ld-warn">⚠️ ${warnings.map(esc).join('<br>⚠️ ')}</div>` : ''}
            ${receiptHTML(b, st.info)}
            <div class="ld-dlg-b"><button type="button" data-print>🖨 Print</button><button type="button" class="ok" data-x>➕ Next bill</button></div>`;
        ctx.root.appendChild(dlg);
        dlg.querySelector('[data-print]').onclick = () => printReceipt(b, st.info);
        dlg.querySelector('[data-x]').onclick = () => dlg.close();
        dlg.addEventListener('close', () => dlg.remove());
        dlg.showModal();
    }

    const custLabel = (c) => `🚪 ${esc([c.building, c.room || '—'].filter(Boolean).join(' · '))}${c.name ? ' · ' + esc(c.name) : ''}`;

    /* -------------------------------- pending -------------------------------- */
    let pending = [];
    async function loadPending() {
        try { pending = (await ctx.guard(request('GET', `/api/laundry/bills?site=${site}&pending=1`))).bills; }
        catch (e) { $('ldPendList').innerHTML = `<p class="ld-muted">${esc(e.message || 'Not available offline.')}</p>`; return; }
        $('ldPendingCount').textContent = pending.length || '';
        drawPending();
    }
    function drawPending() {
        const q = $('ldPendFind').value.trim().toLowerCase();
        const list = pending.filter(b => !q || [b.receipt_no, b.customer?.name, b.customer?.room, b.staff_name].some(v => String(v || '').toLowerCase().includes(q)));
        const photo = (b) => { const s = b.staff_id && st.staffList.find(x => x.id === b.staff_id); return s?.photo ? `<img class="ld-mini" src="${s.photo}" alt="">` : ''; };
        $('ldPendList').innerHTML = list.map(b => `<div class="ld-card ${b.status}">
            ${photo(b)}
            <div class="ld-cmain"><b>${b.kind === 'free' ? '🆓 ' + esc(b.staff_name) : custLabel(b.customer)}</b>
              <small>${esc(b.receipt_no)} · ${esc(jeddahTime(b.given_at))} ${b.day !== jeddahDay() ? esc(b.day.slice(5)) : ''} · ${b.items} pcs</small>
              <span class="ld-st">${STATUS[b.status]}</span></div>
            <div class="ld-cbtn">${b.status === 'received' ? `<button type="button" data-st="ready" data-id="${b.id}">✅ Ready</button>` : ''}
              <button type="button" class="ok" data-st="collected" data-id="${b.id}">🤲 Given back</button></div></div>`).join('')
            || '<p class="ld-muted">✨ Nothing waiting.</p>';
    }
    $('ldPendFind').addEventListener('input', drawPending);
    $('ldPendList').addEventListener('click', async (e) => {
        const b = e.target.closest('[data-st]');
        if (!b) return;
        const bill = pending.find(x => x.id === Number(b.dataset.id));
        if (b.dataset.st === 'collected' && !confirm(`Clothes given back?\n${bill.receipt_no} · ${bill.kind === 'free' ? bill.staff_name : [bill.customer.building, bill.customer.room, bill.customer.name].filter(Boolean).join(' ')} · ${bill.items} pcs`)) return;
        b.disabled = true;
        try { await ctx.guard(request('POST', `/api/laundry/bills/${bill.id}/status`, { status: b.dataset.st })); await loadPending(); }
        catch (err) { alert(err.message || 'Could not change it.'); b.disabled = false; }
    });

    /* -------------------------------- my day -------------------------------- */
    let mine = { bills: [], closings: [] };
    async function loadMine() {
        const d = jeddahDay();
        mine = (await ctx.guard(request('GET', `/api/laundry/bills?site=${site}&from=${d}&to=${d}`)));
        if (me?.role === 'admin' || me?.role === 'viewer') mine.bills = mine.bills.filter(b => b.worker_id === me.id); // my own
        return mine;
    }
    async function loadToday() {
        drawQueue();
        try { await loadMine(); } catch (e) { $('ldMyList').innerHTML = `<p class="ld-muted">${esc(e.message)}</p>`; return; }
        const bs = mine.bills.filter(b => !b.voided), paid = bs.filter(b => b.kind === 'paid'), free = bs.filter(b => b.kind === 'free');
        const by = (m) => paid.filter(b => b.method === m).reduce((n, b) => n + b.paid, 0);
        $('ldMyKpis').innerHTML = [
            ['🧾', paid.length, 'bills'], ['👕', paid.reduce((n, b) => n + b.items, 0), 'pieces'], ['💵', sar(by('cash')), 'cash SAR'],
            ['💳', sar(by('card')), 'card SAR'], ['🔁', sar(by('other')), 'other SAR'], ['🆓', `${free.length} · ${sar(free.reduce((n, b) => n + b.value, 0))}`, 'free · value SAR'],
        ].map(([i, v, l]) => `<div class="ld-kpi"><span>${i}</span><b>${v}</b><small>${l}</small></div>`).join('');
        $('ldMyList').innerHTML = mine.bills.map(b => `<button type="button" class="ld-card row ${b.voided ? 'void' : ''}" data-bill="${b.id}">
            <div class="ld-cmain"><b>${b.kind === 'free' ? '🆓 ' + esc(b.staff_name) : custLabel(b.customer)}</b>
              <small>${esc(jeddahTime(b.given_at))} · ${esc(b.receipt_no)} · ${b.items} pcs${b.voided ? ' · ❌ cancelled' : ''}</small></div>
            <b class="ld-amt">${b.kind === 'free' ? 'FREE' : sar(b.paid)}</b></button>`).join('') || '<p class="ld-muted">No bills yet today.</p>';
    }
    $('ldMyList').addEventListener('click', (e) => { const b = e.target.closest('[data-bill]'); if (b) showReceipt(mine.bills.find(x => x.id === Number(b.dataset.bill))); });

    function drawQueue() {
        const q = queued();
        $('ldQueue').innerHTML = q.length ? `<div class="ld-qbox"><b>⏳ ${q.length} bill${q.length === 1 ? '' : 's'} waiting on this phone</b>
            ${q.map(x => `<div class="ld-qrow"><span>${esc(x.local_no)} · ${x.kind === 'free' ? '🆓 ' + esc(x.staff_name || '') : esc([x.customer?.building, x.customer?.room, x.customer?.name].filter(Boolean).join(' '))} · ${sar(x.preview_value || 0)} SAR</span>
              ${x.error ? `<small class="bad">${esc(x.error)}</small><button type="button" data-drop="${esc(x.client_uid)}">Remove</button>` : ''}</div>`).join('')}
            <button type="button" class="ok" data-flush>📤 Send now</button></div>` : '';
    }
    $('ldQueue').addEventListener('click', async (e) => {
        if (e.target.closest('[data-flush]')) { const r = await flushQueue(); refreshOffline(); drawQueue(); if (r.sent) loadToday(); if (r.left && !r.failed) alert('Still no connection. The bills stay on this phone.'); }
        const d = e.target.closest('[data-drop]');
        if (d && confirm('Remove this bill from the phone? It will NOT be saved.')) { dropQueued(d.dataset.drop); refreshOffline(); drawQueue(); }
    });

    /* ------------------------------- close day ------------------------------- */
    async function loadClose() {
        const box = $('ldClose');
        box.innerHTML = '<p class="ld-muted">Loading…</p>';
        try { await loadMine(); } catch (e) { box.innerHTML = `<p class="ld-muted">${esc(e.message)} — closing needs a connection.</p>`; return; }
        const done = mine.closings.find(c => c.worker_id === me?.id);
        const cash = mine.bills.filter(b => !b.voided && b.kind === 'paid' && b.method === 'cash').reduce((n, b) => n + b.paid, 0);
        const bills = mine.bills.filter(b => !b.voided && b.kind === 'paid').length;
        const q = queued().length;
        if (done) {
            box.innerHTML = `<h2>🔒 Day closed · ${esc(done.day)}</h2>${closeTable(done.cash_expected, done.cash_actual, done.bills)}
                <p class="ld-muted">Closed at ${esc(jeddahTime(done.created_at))}. Only the admin can change it.</p>`;
            return;
        }
        box.innerHTML = `<h2>🔒 Close today · ${esc(jeddahDay())}</h2>
            ${q ? `<p class="ld-warn">⏳ ${q} bill${q === 1 ? ' is' : 's are'} still on this phone. Send ${q === 1 ? 'it' : 'them'} first (📋 My day → Send now).</p>` : ''}
            <div class="ld-close-n"><span>🧾 Bills</span><b>${bills}</b></div>
            <div class="ld-close-n"><span>💵 Cash expected</span><b>${sar(cash)} SAR</b></div>
            <label class="ld-big-in wide"><span>💵 Cash in hand</span><input id="ldCash" inputmode="decimal" placeholder="count the money"></label>
            <div id="ldDiff"></div>
            <button type="button" class="ld-save wide" id="ldCloseBtn" disabled>🔒 CLOSE DAY</button>`;
        const upd = () => {
            const v = $('ldCash').value.trim(), a = Math.round(Number(v) * 100);
            const ok = v !== '' && Number.isFinite(a) && a >= 0;
            $('ldCloseBtn').disabled = !ok || q > 0;
            $('ldDiff').innerHTML = ok ? closeTable(cash, a, bills) : '';
        };
        $('ldCash').addEventListener('input', upd);
        $('ldCloseBtn').addEventListener('click', async () => {
            if (!confirm(`Close ${jeddahDay()} with ${$('ldCash').value} SAR in hand? You cannot change it afterwards.`)) return;
            try { await ctx.guard(request('POST', '/api/laundry/close', { site, day: jeddahDay(), cash_actual: Number($('ldCash').value) })); loadClose(); }
            catch (e) { alert(e.message || 'Could not close.'); }
        });
    }
    function closeTable(expected, actual, bills) {
        const d = actual - expected;
        return `<table class="ld-close-t"><tr><td>Expected</td><td>${sar(expected)} SAR</td></tr><tr><td>In hand</td><td>${sar(actual)} SAR</td></tr>
            <tr class="${d === 0 ? 'ok' : 'bad'}"><td>Difference</td><td>${d > 0 ? '+' : ''}${sar(d)} SAR ${d === 0 ? '✅' : '⚠️'}</td></tr></table>`;
    }

    /* ------------------------------ offline state ------------------------------ */
    function refreshOffline() {
        const q = queued().length;
        $('ldOffline').hidden = !q;
        $('ldOffline').textContent = q ? `⏳ ${q} bill${q === 1 ? '' : 's'} waiting on this phone — sent automatically when the internet is back.` : '';
    }
    const tryFlush = async () => { if (!queued().length) return; const r = await flushQueue(); refreshOffline(); if (r.sent && st.tab === 'today') loadToday(); };
    window.addEventListener('online', tryFlush);
    const timer = setInterval(() => { tryFlush(); if (st.tab === 'pending') loadPending(); }, 30000);

    /* ---------------------------------- start ---------------------------------- */
    await Promise.all([loadItems().catch(e => { $('ldItems').innerHTML = `<p class="ld-muted">${esc(e.message)}</p>`; }), loadInfo(), loadSlips()]);
    await loadRooms().catch(() => drawPicked());
    drawCart();
    refreshOffline();
    tryFlush();
    loadStaff().then(drawStaffList).catch(() => { });
    request('GET', `/api/laundry/bills?site=${site}&pending=1`).then(r => { $('ldPendingCount').textContent = r.bills.length || ''; }).catch(() => { });
    return () => clearInterval(timer);
}
