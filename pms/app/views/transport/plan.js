// Transport day → "Plan from check-outs": the groups checking out on this day (from the slips) become trips.
// A window lists each check-out with a suggested destination (from the slip's To — From / To in Settings — or, for the
// last stay, the UMS departure airport) and time (the check-out time); the desk ticks, changes, and adds the trips.
// Groups can share a vehicle (same destination, leaving within N minutes of the first). Nothing is saved here:
// the caller gets the new trips and saves the day.
import { destsFor, ymd, BUS_LIMIT } from '../../core/transport.js';
import { departuresOf, isDelayed } from '../../core/stay.js';
import { baseSh } from '../../core/ums.js';

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const pad = (n) => String(n).padStart(2, '0');
const n0 = (v) => Math.max(0, parseInt(v, 10) || 0);
const MD_MAKKAH_TIME = '08:00';   // Madina → Makkah buses leave at 8 am unless the desk changes it

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

/** The check-outs of `day` as plan lines (one per group departure). */
export function checkoutsOf(slips, day, siteId, existingRows) {
    const onList = new Set(existingRows.map(r => baseSh(r.ref)).filter(Boolean));
    const lines = [];
    for (const s of slips) {
        if (s.deleted) continue;
        for (const d of departuresOf(s)) {
            const at = new Date(d.at);
            if (ymd(at) !== day) continue;
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

/**
 * Open the window. Resolves to the new trips (rows for the day, `manual: true`) or null when closed.
 */
export function openCheckoutPlan({ day, siteId, slips, rows }) {
    const dests = destsFor(siteId);
    const lines = checkoutsOf(slips, day, siteId, rows);
    return new Promise(resolve => {
        const dlg = document.createElement('dialog');
        dlg.className = 'tp-plan';
        const opts = (sel) => `<option value="">No vehicle needed</option>` + dests.map(d => `<option value="${d.id}"${d.id === sel ? ' selected' : ''}>${d.icon} ${esc(d.title)}</option>`).join('');
        dlg.innerHTML = `
          <style>.tp-plan-tbl tr.listed td { background: #e3e0da; color: #3d3226; } .tp-plan-tbl tr.picked td { background: #d9f0d0; }</style>
          <h2>Plan from check-outs <span class="tp-muted">— ${esc(day)}</span></h2>
          <p class="tp-muted">${lines.length ? `${lines.length} check-out${lines.length === 1 ? '' : 's'} on this day. The destination is taken from each slip's <b>To</b> (or the UMS departure airport); change it, or pick “No vehicle needed” for groups who arrange their own way. Time is the check-out time — change it if the vehicle leaves earlier.` : 'No group checks out on this day.'}</p>
          ${lines.length ? `<div class="tp-plan-scroll"><table class="tp-plan-tbl"><thead><tr><th></th><th>SH</th><th>Group</th><th>Pax</th><th>Check-out</th><th>Goes to</th></tr></thead><tbody>
            ${lines.map((l, i) => `<tr data-i="${i}" class="${l.listed ? 'listed' : ''}">
              <td><input type="checkbox" class="pl-on" ${l.dest && !l.listed ? 'checked' : ''} aria-label="Plan SH ${esc(l.sh)}"></td>
              <td><b>${esc(l.sh)}</b>${l.partial ? '<small>partial</small>' : ''}</td>
              <td>${esc(l.name)}<small>${esc(l.leader)}${l.building ? ` · ${esc(l.building)}` : ''}</small></td>
              <td class="n">${l.pax}</td>
              <td><input type="time" class="pl-time" value="${l.dest === 'mdmakkah' ? MD_MAKKAH_TIME : l.at.slice(11)}" data-orig="${l.at.slice(11)}" aria-label="Departure time"></td>
              <td><select class="pl-dest" aria-label="Destination">${opts(l.dest)}</select>${l.listed ? '<small>already on this day’s list</small>' : l.to && !l.dest ? `<small>slip says To: ${esc(l.to)}</small>` : ''}</td>
            </tr>`).join('')}</tbody></table></div>
            <label class="tp-plan-share"><input type="checkbox" id="plShare"> Put groups going to the same place into one vehicle (at most ${BUS_LIMIT} pax) when they leave within <input type="number" id="plMin" min="5" max="240" value="30"> minutes of the first</label>` : ''}
          <div class="tp-plan-foot"><span class="tp-muted" id="plSum"></span><button type="button" class="tp-btn" data-x>Cancel</button>${lines.length ? '<button type="button" class="tp-btn gold" data-ok>Add trips to this day</button>' : ''}</div>`;
        document.body.appendChild(dlg);

        const picked = () => [...dlg.querySelectorAll('tr[data-i]')].map(tr => ({
            line: lines[Number(tr.dataset.i)], on: tr.querySelector('.pl-on').checked,
            dest: tr.querySelector('.pl-dest').value, time: tr.querySelector('.pl-time').value,
        })).filter(p => p.on && p.dest && /^\d{2}:\d{2}$/.test(p.time));
        const mark = () => dlg.querySelectorAll('tr[data-i]').forEach(tr => tr.classList.toggle('picked', tr.querySelector('.pl-on').checked));   // freshly ticked rows get their own colour
        const sum = () => {
            mark();
            const p = picked();
            dlg.querySelector('#plSum').textContent = p.length ? `${p.length} group${p.length === 1 ? '' : 's'} · ${p.reduce((n, x) => n + x.line.pax, 0)} pax` : 'Nothing ticked';
        };
        dlg.addEventListener('input', sum); dlg.addEventListener('change', (e) => {
            const tr = e.target.closest('tr[data-i]');
            if (tr && e.target.matches('.pl-time')) e.target.dataset.touched = '1';
            if (tr && e.target.matches('.pl-dest')) {
                tr.querySelector('.pl-on').checked = !!e.target.value;
                const t = tr.querySelector('.pl-time');
                if (!t.dataset.touched) t.value = e.target.value === 'mdmakkah' ? MD_MAKKAH_TIME : t.dataset.orig;   // 8 am to Makkah until the desk types a time
            }
            sum();
        });
        sum();

        let done = false;
        const finish = (val) => { if (done) return; done = true; if (dlg.open) dlg.close(); dlg.remove(); resolve(val); };
        dlg.addEventListener('click', (e) => {
            if (e.target.closest('[data-x]')) { finish(null); return; }
            if (!e.target.closest('[data-ok]')) return;
            const p = picked();
            if (!p.length) return;
            const stamp = Date.now().toString(36).toUpperCase();
            const share = dlg.querySelector('#plShare')?.checked, gap = Math.max(5, n0(dlg.querySelector('#plMin')?.value) || 30);
            const trips = [];
            const mainOf = new Map();                     // dest → [{ main, at }]
            p.sort((a, b) => a.time.localeCompare(b.time)).forEach((x, i) => {
                const l = x.line, dest = dests.find(d => d.id === x.dest);
                const base = { key: `P${stamp}${i}`, ref: l.sh, operator: l.name, leader: l.leader, m: l.m, f: l.f, c: l.c, pax: l.pax, rooms: l.rooms,
                    dora: '', vch: '', transporter: '', adj: '', loc: '', at: `${day}T${x.time}`, manual: true, ...(l.building ? { building: l.building } : {}) };
                const mins = (hhmm) => Number(hhmm.slice(0, 2)) * 60 + Number(hhmm.slice(3, 5));
                const host = share && (mainOf.get(dest.id) || []).find(h => mins(x.time) - mins(h.time) <= gap && h.pax + l.pax <= BUS_LIMIT);
                if (host) host.pax += l.pax;
                if (host) trips.push({ ...base, route: '', at: host.trip.at, with: host.trip.key, remarks: `planned from check-outs, with SH ${host.trip.ref}` });
                else {
                    const trip = { ...base, route: dest.route, remarks: 'planned from check-outs' };
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
