// Transport day → "Plan trips": groups from the slips become trips of this day.
//   From check-outs: the groups checking out on the chosen date (this day unless the desk picks another) — each with a suggested destination
//   (from the slip's To — From / To in Settings — or, for the last stay, the UMS departure airport) and time (the check-out time).
//   Madina Ziyarat from check-ins (Medina): the groups who checked in on the chosen date (the day before, by default) go on Ziyarat today.
// The desk ticks, changes, and adds the trips. Groups can share a vehicle (same destination, leaving within N minutes of the first).
// Nothing is saved here: the caller gets the new trips and saves the day.
import { destsFor, ymd, addDays, BUS_LIMIT } from '../../core/transport.js';
import { departuresOf, isDelayed } from '../../core/stay.js';
import { baseSh } from '../../core/ums.js';

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const pad = (n) => String(n).padStart(2, '0');
const n0 = (v) => Math.max(0, parseInt(v, 10) || 0);
const MD_MAKKAH_TIME = '08:00';   // Madina → Makkah buses leave at 8 am unless the desk changes it
const ZIYARAT_TIME = '08:00';     // Ziyarat buses: 8 am unless the desk changes it

// slip To → destination id, per site
const TO_DEST = {
    makkah: { 'Jeddah Airport': 'airport', 'Madina Airport': 'madair', 'Medina': 'madina' },
    medina: { 'Jeddah Airport': 'mdjeddah', 'Madina Airport': 'mdairport', 'Makkah': 'mdmakkah' },
};
const PORT_TO = { JEDDAH: 'Jeddah Airport', MADINA: 'Madina Airport' };

function suggest(slip, siteId) {
    let to = String(slip.to_place || '').trim();
    // no To on the slip: a stay that ends on the UMS departure day leaves from the UMS departure airport
    const dep = slip.ums?.departure;
    if (!to && dep && Math.abs(Date.parse(dep.date) - Date.parse(slip.checkout_date)) <= 864e5) to = PORT_TO[String(dep.port || '').toUpperCase()] || '';
    return { to, dest: TO_DEST[siteId]?.[to] || '' };
}

/** The check-outs of `fromDay` as plan lines (one per group departure), for trips on `day` (the same day unless another is given). */
export function checkoutsOf(slips, fromDay, siteId, existingRows, day = fromDay) {
    const onList = new Set(existingRows.map(r => baseSh(r.ref)).filter(Boolean));
    const lines = [];
    for (const s of slips) {
        if (s.deleted) continue;
        for (const d of departuresOf(s)) {
            const at = new Date(d.at);
            if (ymd(at) !== fromDay) continue;
            const whole = !isDelayed(s) || d.last && departuresOf(s).length === 1;
            const g = n0(s.gents), l = n0(s.ladies), c = n0(s.children ?? s.child) + n0(s.infants ?? s.infant);
            const pax = whole ? (n0(s.total) || g + l + c) : d.beds;
            const sg = suggest(s, siteId);
            lines.push({
                id: `${s.id}@${d.at}`, slip: s, sh: String(s.sh_no ?? ''), name: s.tour_name || '', leader: String(s.group_leader || '').trim(),
                at: `${day}T${pad(at.getHours())}:${pad(at.getMinutes())}`, pax, m: whole ? g : 0, f: whole ? l : 0, c: whole ? c : 0,
                rooms: d.rooms.map(r => String(r.room_no || '').trim()).filter(Boolean), partial: !whole,
                to: sg.to, dest: sg.dest, listed: onList.has(baseSh(s.sh_no)), building: s.building || '',
            });
        }
    }
    return lines.sort((a, b) => a.at.localeCompare(b.at) || a.sh.localeCompare(b.sh, undefined, { numeric: true }));
}

/** The groups who checked in on `fromDay`, as Madina Ziyarat lines for `day` (whole groups; rooms of every row). */
export function checkinsOf(slips, fromDay, existingRows, day) {
    const onList = new Set(existingRows.filter(r => /ZIYARAT/i.test(String(r.route || '')) || r.with).map(r => baseSh(r.ref)).filter(Boolean));
    const lines = [];
    for (const s of slips) {
        if (s.deleted || s.checkin_date !== fromDay) continue;
        const g = n0(s.gents), l = n0(s.ladies), c = n0(s.children ?? s.child) + n0(s.infants ?? s.infant);
        const rooms = ['gents', 'ladies'].flatMap(k => (s.rooms?.[k] || []).map(x => String(x.room_no || '').trim()).filter(Boolean));
        lines.push({
            id: `${s.id}@in`, slip: s, sh: String(s.sh_no ?? ''), name: s.tour_name || '', leader: String(s.group_leader || '').trim(),
            at: `${day}T${ZIYARAT_TIME}`, pax: n0(s.total) || g + l + c, m: g, f: l, c, rooms, partial: false, to: '', dest: 'mdziyarat',
            listed: onList.has(baseSh(s.sh_no)), building: s.building || '', inAt: String(s.checkin_time || '').slice(0, 5),
        });
    }
    return lines.sort((a, b) => a.sh.localeCompare(b.sh, undefined, { numeric: true }));
}

/**
 * Open the window. Resolves to the new trips (rows for the day, `manual: true`) or null when closed.
 */
export function openCheckoutPlan({ day, siteId, slips, rows }) {
    const dests = destsFor(siteId);
    const canZiyarat = dests.some(d => d.id === 'mdziyarat');
    // what to plan from, and from which date (the desk can change both)
    let mode = 'out', fromDay = day, lines = [];
    return new Promise(resolve => {
        const dlg = document.createElement('dialog');
        dlg.className = 'tp-plan';
        const opts = (sel) => `<option value="">No vehicle needed</option>` + dests.map(d => `<option value="${d.id}"${d.id === sel ? ' selected' : ''}>${d.icon} ${esc(d.title)}</option>`).join('');
        dlg.innerHTML = `
          <style>.tp-plan-tbl tr.listed td { background: #e3e0da; color: #3d3226; } .tp-plan-tbl tr.picked td { background: #d9f0d0; }
            .tp-plan-from { display: flex; flex-wrap: wrap; gap: 8px 16px; align-items: end; margin: 6px 0 4px; }
            .tp-plan-from label { display: grid; gap: 3px; font-size: 12px; font-weight: 700; }
            .tp-plan-from select, .tp-plan-from input { font: inherit; padding: 5px 8px; border: 1px solid #d9c49d; border-radius: 8px; background: #fff; }</style>
          <h2>Plan trips <span class="tp-muted">— for ${esc(day)}</span></h2>
          <div class="tp-plan-from">
            ${canZiyarat ? `<label>Plan from<select id="plMode"><option value="out">Check-outs</option><option value="zin">Madina Ziyarat — check-ins</option></select></label>` : ''}
            <label><span id="plFromLbl">Check-outs of</span><input type="date" id="plFrom" value="${esc(fromDay)}"></label>
          </div>
          <div id="plBody"></div>
          <div class="tp-plan-foot"><span class="tp-muted" id="plSum"></span><button type="button" class="tp-btn" data-x>Cancel</button><button type="button" class="tp-btn gold" data-ok>Add trips to this day</button></div>`;
        document.body.appendChild(dlg);

        const draw = () => {
            lines = mode === 'zin' ? checkinsOf(slips, fromDay, rows, day) : checkoutsOf(slips, fromDay, siteId, rows, day);
            const Z = mode === 'zin', other = fromDay !== day;
            dlg.querySelector('#plFromLbl').textContent = Z ? 'Checked in on' : 'Check-outs of';
            dlg.querySelector('[data-ok]').hidden = !lines.length;
            const what = Z ? `check-in${lines.length === 1 ? '' : 's'} on ${fromDay}` : `check-out${lines.length === 1 ? '' : 's'} on ${fromDay}`;
            dlg.querySelector('#plBody').innerHTML = `
              <p class="tp-muted">${lines.length ? (Z
                ? `${lines.length} ${what}: their Madina Ziyarat goes on ${esc(day)}. Time is ${ZIYARAT_TIME} — change it per group; split gents and ladies on the day afterwards (⚥).`
                : `${lines.length} ${what}${other ? ` — the trips go on ${esc(day)}` : ''}. The destination is taken from each slip's <b>To</b> (or the UMS departure airport); change it, or pick “No vehicle needed” for groups who arrange their own way. Time is the check-out time — change it if the vehicle leaves earlier.`)
                : `No group ${Z ? 'checked in' : 'checks out'} on ${esc(fromDay)}.`}</p>
              ${lines.length ? `<div class="tp-plan-scroll"><table class="tp-plan-tbl"><thead><tr><th></th><th>SH</th><th>Group</th><th>Pax</th><th>${Z ? 'Leaves at' : 'Check-out'}</th><th>Goes to</th></tr></thead><tbody>
                ${lines.map((l, i) => `<tr data-i="${i}" class="${l.listed ? 'listed' : ''}">
                  <td><input type="checkbox" class="pl-on" ${l.dest && !l.listed ? 'checked' : ''} aria-label="Plan SH ${esc(l.sh)}"></td>
                  <td><b>${esc(l.sh)}</b>${l.partial ? '<small>partial</small>' : ''}</td>
                  <td>${esc(l.name)}<small>${esc(l.leader)}${l.building ? ` · ${esc(l.building)}` : ''}${Z && l.inAt ? ` · in ${esc(l.inAt)}` : ''}</small></td>
                  <td class="n">${l.pax}<small>M ${l.m} · F ${l.f} · C ${l.c}</small></td>
                  <td><input type="time" class="pl-time" value="${Z ? ZIYARAT_TIME : l.dest === 'mdmakkah' ? MD_MAKKAH_TIME : l.at.slice(11)}" data-orig="${l.at.slice(11)}" aria-label="Departure time"></td>
                  <td><select class="pl-dest" aria-label="Destination">${opts(l.dest)}</select>${l.listed ? '<small>already on this day’s list</small>' : l.to && !l.dest ? `<small>slip says To: ${esc(l.to)}</small>` : ''}</td>
                </tr>`).join('')}</tbody></table></div>
                <label class="tp-plan-share"><input type="checkbox" id="plShare"${Z ? ' checked' : ''}> Put groups going to the same place into one vehicle (at most ${BUS_LIMIT} pax) when they leave within <input type="number" id="plMin" min="5" max="240" value="30"> minutes of the first</label>` : ''}`;
            sum();
        };
        const picked = () => [...dlg.querySelectorAll('tr[data-i]')].map(tr => ({
            line: lines[Number(tr.dataset.i)], on: tr.querySelector('.pl-on').checked,
            dest: tr.querySelector('.pl-dest').value, time: tr.querySelector('.pl-time').value,
        })).filter(p => p.on && p.dest && /^\d{2}:\d{2}$/.test(p.time));
        const mark = () => dlg.querySelectorAll('tr[data-i]').forEach(tr => tr.classList.toggle('picked', tr.querySelector('.pl-on').checked));   // freshly ticked rows get their own colour
        function sum() {
            mark();
            const p = picked();
            dlg.querySelector('#plSum').textContent = p.length ? `${p.length} group${p.length === 1 ? '' : 's'} · ${p.reduce((n, x) => n + x.line.pax, 0)} pax` : 'Nothing ticked';
        }
        dlg.addEventListener('input', (e) => { if (!e.target.matches('#plFrom, #plMode')) sum(); });
        dlg.addEventListener('change', (e) => {
            if (e.target.matches('#plMode')) {
                mode = e.target.value;
                fromDay = mode === 'zin' ? addDays(day, -1) : day;   // Ziyarat the day after arriving; check-outs on the day itself
                dlg.querySelector('#plFrom').value = fromDay;
                draw(); return;
            }
            if (e.target.matches('#plFrom')) { if (/^\d{4}-\d{2}-\d{2}$/.test(e.target.value)) { fromDay = e.target.value; draw(); } return; }
            const tr = e.target.closest('tr[data-i]');
            if (tr && e.target.matches('.pl-time')) e.target.dataset.touched = '1';
            if (tr && e.target.matches('.pl-dest')) {
                tr.querySelector('.pl-on').checked = !!e.target.value;
                const t = tr.querySelector('.pl-time');
                if (!t.dataset.touched && mode === 'out') t.value = e.target.value === 'mdmakkah' ? MD_MAKKAH_TIME : t.dataset.orig;   // 8 am to Makkah until the desk types a time
            }
            sum();
        });
        draw();

        let done = false;
        const finish = (val) => { if (done) return; done = true; if (dlg.open) dlg.close(); dlg.remove(); resolve(val); };
        dlg.addEventListener('click', (e) => {
            if (e.target.closest('[data-x]')) { finish(null); return; }
            if (!e.target.closest('[data-ok]')) return;
            const p = picked();
            if (!p.length) return;
            const stamp = Date.now().toString(36).toUpperCase();
            const share = dlg.querySelector('#plShare')?.checked, gap = Math.max(5, n0(dlg.querySelector('#plMin')?.value) || 30);
            const from = mode === 'zin' ? `planned from check-ins of ${fromDay}` : `planned from check-outs${fromDay !== day ? ` of ${fromDay}` : ''}`;
            const trips = [];
            const mainOf = new Map();                     // dest → [{ main, at }]
            p.sort((a, b) => a.time.localeCompare(b.time)).forEach((x, i) => {
                const l = x.line, dest = dests.find(d => d.id === x.dest);
                const base = { key: `P${stamp}${i}`, ref: l.sh, operator: l.name, leader: l.leader, m: l.m, f: l.f, c: l.c, pax: l.pax, rooms: l.rooms,
                    dora: '', vch: '', transporter: '', adj: '', loc: '', at: `${day}T${x.time}`, manual: true, ...(l.building ? { building: l.building } : {}) };
                const mins = (hhmm) => Number(hhmm.slice(0, 2)) * 60 + Number(hhmm.slice(3, 5));
                const host = share && (mainOf.get(dest.id) || []).find(h => mins(x.time) - mins(h.time) <= gap && h.pax + l.pax <= BUS_LIMIT);
                if (host) host.pax += l.pax;
                if (host) trips.push({ ...base, route: '', at: host.trip.at, with: host.trip.key, remarks: `${from}, with SH ${host.trip.ref}` });
                else {
                    const trip = { ...base, route: dest.route, remarks: from };
                    trips.push(trip);
                    mainOf.set(dest.id, [...(mainOf.get(dest.id) || []), { trip, time: x.time, pax: l.pax }]);
                }
            });
            finish(trips);
        });
        dlg.addEventListener('close', () => finish(null));      // Esc
        dlg.showModal();
    });
}
