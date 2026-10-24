// Transport day: the saved trips of one day (cloud, GET /api/transport), bus numbers per destination
// (type one in to change it — kept by later imports), times (tap to change, with a confirmation; kept by later
// imports unless the list's own time changes), and links to the import page, bus sheets and signage.
// Day in the address: #/<site>/transport?day=YYYY-MM-DD (default today).
import { canWrite, canOpen, currentDesk, UserError } from '../../core/cloud.js';
import { destsFor, resolve, signage, renumber, assignBuses, vehicleOf, vehicleNo, fleetText, VEHICLES, loadDay, listDays, saveDay, deleteDay, today, time12 } from '../../core/transport.js';
import { esc, renderDayNav } from '../../core/transport-ui.js';
import { loadSignage, saveSignageConfig } from '../../core/signage-api.js';
import { loadBuildings, buildingNames } from '../../core/rooms.js';
import { baseSh } from '../../core/ums.js';
import { isZiyarat, openZiyaratSplit } from '../../core/ziyarat.js';
import { openCheckoutPlan } from './plan.js';

export default async function mount(ctx) {
    const $ = (id) => ctx.root.querySelector('#' + id);
    const day = /^\d{4}-\d{2}-\d{2}$/.test(ctx.params.get('day') || '') ? ctx.params.get('day') : today();
    const writable = canWrite(ctx.siteId);
    const desk = currentDesk();
    let doc = { rows: [], version: 0 }, days = [], filter = 'sign', saving = false;

    $('tpDests').textContent = destsFor(ctx.siteId).map(d => d.title).join(', ').replace(/, ([^,]*)$/, ' and $1');
    $('tpImport').href = ctx.href('transport-import');
    $('tpPrint').href = ctx.href('transport-print', { day });
    $('tpSignage').href = `${ctx.siteId}/signage`; // public board: today and tomorrow, no login
    $('tpImport').hidden = !canOpen('transport-import', desk) || !writable;
    $('tpPrint').hidden = !canOpen('transport-print', desk);
    $('tpRenumber').hidden = $('tpDelete').hidden = $('tpPlan').hidden = !writable;

    // "3 buses · 1 car · 1 Self- Bus"
    const fleet = (list) => fleetText(list, '0 buses');
    const msg = (text, kind = 'ok') => { $('tpMsg').innerHTML = text ? `<div class="tp-msg ${kind}">${esc(text)}</div>` : ''; };
    const go = (d) => ctx.navigate('transport', { day: d });

    function nav() { renderDayNav($('tpNav'), { day, days, onChange: go }); }

    function tiles() {
        $('tpTiles').innerHTML = signage(doc.rows, ctx.siteId).map(s => `
          <div class="tp-tile"><span class="ico" aria-hidden="true">${s.dest.icon}</span>
            <b>${s.pax}</b><span>${esc(s.dest.title)}</span>
            <small>${fleet(s.buses)} · ${s.groups} group${s.groups === 1 ? '' : 's'}${s.buses.length ? ` · ${time12(s.buses.reduce((a, b) => a.at < b.at ? a : b).at)} first` : ''}</small>
          </div>`).join('');
    }

    const nowAt = () => { const d = new Date(); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0, 16); };
    const matches = (r, q) => !q || [r.ref, r.operator, r.leader, r.transporter, r.vch, r.dora, r.route, r.remarks, ...(r.rooms || [])]
        .some(v => String(v ?? '').toLowerCase().includes(q));
    const paxText = (r) => `<b>${esc(r.pax)}</b><small>${[r.m && `M${r.m}`, r.f && `F${r.f}`, r.c && `C${r.c}`].filter(Boolean).join(' ')}</small>`;
    // pax: tap to change (kept by later imports)
    const pax = (r) => writable
        ? `<button type="button" class="tp-pax${r.pax_manual ? ' manual' : ''}" data-pax="${esc(r.key)}" title="Change the pax">${paxText(r)}</button>`
        : paxText(r);

    function list() {
        const q = $('tpFind').value.trim().toLowerCase();
        const info = resolve(doc.rows);
        const past = nowAt();
        if (!doc.rows.length && !(writable && filter === 'sign')) {
            $('tpList').innerHTML = `<p class="tp-empty">No transport list saved for this day.${writable && canOpen('transport-import', desk) ? ` <a href="${ctx.href('transport-import')}">Import one →</a>` : ''}</p>`;
            return;
        }
        if (filter === 'sign') {
            const html = signage(doc.rows, ctx.siteId).map(s => {
                // duplicate numbers in one destination are flagged (typed in by hand)
                const count = new Map();
                const vk = (b) => `${b.vehicle}${b.vehicle === 'other' ? b.vlabel.toUpperCase() : ''}#${b.bus}`;
                for (const b of s.buses) if (b.bus != null) count.set(vk(b), (count.get(vk(b)) || 0) + 1);
                // airport departures are listed by departure time (others by vehicle number)
                const air = s.dest.tosha === 'airport';
                const buses = air ? [...s.buses].sort((x, y) => x.at.localeCompare(y.at) || (x.bus ?? 1e9) - (y.bus ?? 1e9)) : s.buses;
                const body = buses.flatMap(b => b.rows.map((r, i) => ({ r, b, i }))).filter(x => matches(x.r, q)).map(({ r, b, i }) => `
                  <tr class="${i ? 'rider' : ''}${r.at < past ? ' past' : ''}">
                    <td class="bus">${i ? `↳ ${esc(vehicleNo(b.bus, b.vehicle, b.vlabel))}` : writable
                        ? `<span class="tp-veh">${vehSelect(r, b)}<input type="number" min="1" max="999" inputmode="numeric" value="${esc(b.bus ?? '')}" data-key="${esc(r.key)}" class="${r.bus_manual ? 'manual' : ''}${count.get(vk(b)) > 1 ? ' dup' : ''}" aria-label="${esc(b.vlabel || VEHICLES[b.vehicle].title)} number" title="${r.bus_manual ? 'Typed in by hand' : 'Given by the import'}${count.get(vk(b)) > 1 ? ' · used twice' : ''}"></span>${b.vehicle === 'other' ? `<small class="tp-vname">${esc(b.vlabel)}</small>` : ''}`
                        : `${VEHICLES[b.vehicle].icon} ${esc(vehicleNo(b.bus, b.vehicle, b.vlabel) || b.bus || '—')}`}</td>
                    ${timeCell(r)}
                    ${fromCell(r, i ? b : null)}
                    <td><b>${esc(r.ref || '—')}</b>${r.dora ? `<small>Dora ${esc(r.dora)}</small>` : ''}</td>
                    ${nameCell(r, 'operator')}
                    ${nameCell(r, 'leader')}
                    <td class="n">${pax(r)}</td>
                    ${trCell(r, !!i)}
                    <td>${r.part ? `<span class="tp-part ${r.part}">${r.part === 'gents' ? 'GENTS' : 'LADIES'}</span> ` : ''}${esc(r.remarks)}${!i && writable ? `<button type="button" class="tp-addsh" data-addsh="${esc(r.key)}" title="Add a group (SH) to this ${esc(VEHICLES[b.vehicle].title.toLowerCase())}">＋ SH</button>` : ''}${!i && writable && isZiyarat(ctx.siteId, r.route) ? `<button type="button" class="tp-addsh tp-zsplit" data-zsplit="${esc(r.key.replace(/-L$/, ''))}" title="Gents and ladies on their own Ziyarat trips">${r.part ? '⚥ Gents / Ladies…' : '⚥ Split gents / ladies'}</button>` : ''}</td>
                    ${delCell(r)}
                  </tr>`).join('');
                const order = air && s.buses.length > 1 && writable
                    ? `<button type="button" class="tp-bytime" data-bytime="${esc(s.dest.id)}" title="Number this destination's vehicles 1, 2, 3… by departure time">🔢 Number by time</button>` : '';
                return `<div class="tp-dest"><span aria-hidden="true">${s.dest.icon}</span>${esc(s.dest.label)}${air ? '<span class="tp-dest-note">by departure time</span>' : ''}
                    <small>${fleet(s.buses)} · ${s.groups} groups · ${s.pax} pax</small>${order}</div>
                  ${body ? `<div class="tp-scroll"><table class="tp-tbl"><thead><tr><th>Vehicle</th><th>Time</th><th>From</th><th>SH</th><th>Tour operator</th><th>Group leader</th><th class="n">Pax</th><th>Transporter</th><th>Remarks</th>${writable ? '<th></th>' : ''}</tr></thead>
                    <tbody>${body}</tbody></table></div>` : `<p class="tp-empty">${s.buses.length ? 'Nothing matches.' : 'No trips.'}</p>`}
                  ${writable ? addBusForm(s.dest) : ''}`;
            }).join('');
            $('tpList').innerHTML = html;
        } else {
            const rows = [...doc.rows].sort((a, b) => a.at.localeCompare(b.at)).filter(r => matches(r, q));
            $('tpList').innerHTML = rows.length ? `<div class="tp-scroll"><table class="tp-tbl">
              <thead><tr><th>Time</th><th>From</th><th>Route</th><th>Vehicle</th><th>SH</th><th>Tour operator</th><th>Group leader</th><th class="n">Pax</th><th>Transporter</th><th>Rooms</th><th>Remarks</th>${writable ? '<th></th>' : ''}</tr></thead>
              <tbody>${rows.map(r => { const i = info.get(r.key); return `
                <tr class="${i.parent ? 'rider' : ''}${r.at < past ? ' past' : ''}">
                  ${timeCell(r)}
                  ${fromCell(r, i.parent ? { building: i.building } : null)}
                  <td>${esc(i.route || '—')}${i.parent ? '<small>grouped</small>' : ''}</td>
                  <td class="bus">${i.dest ? `${VEHICLES[i.vehicle].icon} ${esc(i.vehicle === 'other' ? vehicleNo(i.bus, i.vehicle, i.vlabel) : i.bus ?? '—')}` : ''}</td>
                  <td><b>${esc(r.ref)}</b>${r.dora ? `<small>Dora ${esc(r.dora)}</small>` : ''}</td>
                  ${nameCell(r, 'operator')}
                  ${nameCell(r, 'leader')}
                  <td class="n">${pax(r)}</td>
                  ${trCell(r, !!i.parent)}
                  <td>${esc((r.rooms || []).join(', '))}</td>
                  <td>${esc(r.remarks)}</td>
                  ${delCell(r)}
                </tr>`; }).join('')}</tbody></table></div>` : '<p class="tp-empty">Nothing matches.</p>';
        }
    }

    // the vehicle: Bus / Car / a custom name typed in ("Self- Bus"); the names used today are offered again
    function vehSelect(r, b) {
        const names = [...new Set(doc.rows.map(x => x.vehicle === 'other' && x.vehicle_label).filter(Boolean))];
        const opt = (v, text, on) => `<option value="${esc(v)}"${on ? ' selected' : ''}>${esc(text)}</option>`;
        return `<select class="tp-vt ${b.vehicle}" data-veh="${esc(r.key)}" aria-label="Vehicle" title="Vehicle: ${esc(b.vlabel || VEHICLES[b.vehicle].title)}">
            ${opt('bus', `${VEHICLES.bus.icon} Bus`, b.vehicle === 'bus')}${opt('car', `${VEHICLES.car.icon} Car`, b.vehicle === 'car')}
            ${names.map(n => opt(`other:${n}`, `${VEHICLES.other.icon} ${n}`, b.vehicle === 'other' && b.vlabel === n)).join('')}
            ${opt('custom', '✎ Custom…', false)}</select>`;
    }

    // the time: tap to change it (desks that may write); a hand-set time shows the list's time under it
    function timeCell(r) {
        const was = r.at_manual && r.at_import && r.at_import !== r.at ? `<small title="Changed by hand — the transport list says ${esc(time12(r.at_import))}">list: ${esc(time12(r.at_import))}</small>` : '';
        return writable
            ? `<td class="t"><button type="button" class="tp-time${r.at_manual ? ' manual' : ''}" data-time="${esc(r.key)}" title="Change the time">${esc(time12(r.at))} <span aria-hidden="true">✎</span></button>${was}</td>`
            : `<td class="t">${esc(time12(r.at))}${was}</td>`;
    }

    // departs from: a building of this site (Rooms & Buildings). A grouped trip (same Dora / adjusted into a bus)
    // follows its bus's building unless it is given its own — a trailing group picked up somewhere else.
    let buildings = [];
    function fromCell(r, bus) {
        const own = r.building || '';
        if (!writable) return `<td class="from">${own ? esc(own) : bus ? `<span class="tp-muted">${bus.building ? `↳ ${esc(bus.building)}` : ''}</span>` : '—'}</td>`;
        const names = own && !buildings.includes(own) ? [...buildings, own] : buildings;
        const none = bus ? `↳ same as bus${bus.building ? ` (${bus.building})` : ''}` : '—';
        return `<td class="from"><select class="tp-from${own ? ' set' : ''}" data-from="${esc(r.key)}" aria-label="Departs from (building)">
            <option value="">${esc(none)}</option>${names.map(n => `<option${n === own ? ' selected' : ''}>${esc(n)}</option>`).join('')}</select></td>`;
    }
    // + Bus under each destination: a vehicle made by hand (optionally with a first group by its SH)
    const addBusForm = (d) => `<div class="tp-addbus-wrap"><button type="button" class="tp-addbus-btn" data-addbus-open="${esc(d.id)}">＋ Bus</button>
        <form class="tp-addbus" data-addbus="${esc(d.id)}" hidden autocomplete="off">
          <b>New ${esc(d.title)} vehicle</b>
          <label>Time<input type="time" name="time" required></label>
          <label>Vehicle<select name="veh"><option value="bus">🚌 Bus</option><option value="car">🚗 Car</option></select></label>
          <label>Transporter<input name="transporter" maxlength="60"></label>
          <label>Vch No<input name="vch" maxlength="20"></label>
          <label>SH (optional)<input name="sh" maxlength="20" placeholder="first group"></label>
          <span class="tp-addbus-act"><button type="submit" class="tp-btn gold">Add</button><button type="button" class="tp-btn" data-addbus-cancel>Cancel</button></span>
        </form></div>`;
    // tour operator / group leader: tap to change (kept when the list is pasted again)
    const NAME_LABEL = { operator: 'Tour operator', leader: 'Group leader' };
    function nameCell(r, field) {
        const text = esc(r[field] || '—');
        if (!writable) return `<td>${text}</td>`;
        const manual = (r.names_manual || []).includes(field);
        return `<td><button type="button" class="tp-name${manual ? ' manual' : ''}" data-name="${esc(r.key)}" data-field="${field}" title="Change the ${NAME_LABEL[field].toLowerCase()}">${text} <span aria-hidden="true">✎</span></button></td>`;
    }
    // transporter and Vch No: tap to change them on a vehicle's own row (grouped trips ride with it)
    function trCell(r, rider) {
        const text = `${esc(r.transporter || (rider ? 'with the bus above' : '—'))}${r.vch ? `<small>Vch ${esc(r.vch)}</small>` : ''}`;
        if (!writable || rider) return `<td>${text}</td>`;
        return `<td><button type="button" class="tp-tr${r.transporter_manual ? ' manual' : ''}" data-tr="${esc(r.key)}" title="Change the transporter / Vch No">${text} <span aria-hidden="true">✎</span></button></td>`;
    }
    // remove one trip from the day (desks that may write)
    const delCell = (r) => writable ? `<td class="del"><button type="button" class="tp-del" data-del="${esc(r.key)}" title="Delete this trip" aria-label="Delete SH ${esc(r.ref)}">🗑</button></td>` : '';

    function meta() {
        const n = doc.rows.length;
        $('tpMeta').textContent = doc.version ? `${n} trips · saved ${new Date(doc.updated_at).toLocaleString()}${doc.updated_by ? ' by ' + doc.updated_by : ''}` : '';
        $('tpDelete').disabled = $('tpRenumber').disabled = !doc.version;
    }

    function draw() { nav(); tiles(); list(); meta(); }

    async function load({ quiet = false } = {}) {
        try {
            const [d, ds] = await ctx.guard(Promise.all([loadDay(ctx.siteId, day), listDays(ctx.siteId)]));
            const changed = d.version !== doc.version || ds.length !== days.length;
            doc = d; days = ds;
            if (!quiet || changed) draw();
        } catch (e) {
            if (!quiet) { msg(e instanceof UserError ? e.message : 'Could not load the transport list.', 'bad'); nav(); $('tpList').innerHTML = ''; }
        }
    }

    async function save(rows, note) {
        saving = true;
        try {
            doc = await ctx.guard(saveDay(ctx.siteId, day, rows, doc.version, note));
            msg('Saved.');
        } catch (e) {
            msg(e instanceof UserError ? e.message : 'Could not save.', 'bad');
            if (e.status === 409) await load();
        } finally { saving = false; draw(); }
    }

    $('tpFilter').addEventListener('click', (e) => {
        const b = e.target.closest('button[data-f]');
        if (!b) return;
        filter = b.dataset.f;
        $('tpFilter').querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
        list();
    });
    $('tpFind').addEventListener('input', list);
    $('tpList').addEventListener('change', (e) => {
        const inp = e.target.closest('input[data-key]');
        if (!inp) return;
        const n = parseInt(inp.value, 10);
        if (!(n > 0)) { inp.value = doc.rows.find(r => r.key === inp.dataset.key)?.bus ?? ''; return; }
        const rows = doc.rows.map(r => r.key === inp.dataset.key ? { ...r, bus: n, bus_manual: true } : r);
        save(rows, `bus ${n} for SH ${inp.dataset.key}`);
    });
    /* ---------------- signage window (the public board /<site>/signage) ---------------- */
    const SG_DEFAULT = { from: 'now', to_day: 1, to_time: '23:59' };
    let sgVersion = 0;
    $('sgBuilder').href = ctx.href('signage-builder');
    $('sgBuilder').hidden = !canOpen('signage-builder', desk);
    const sgToggle = () => { $('sgFromTimeRow').hidden = $('sgFromMode').value !== 'time'; };
    function drawWindow(w) {
        $('sgFromMode').value = w.from === 'now' ? 'now' : 'time';
        $('sgFromTime').value = w.from === 'now' ? '00:00' : w.from;
        $('sgToDay').value = String(w.to_day);
        $('sgToTime').value = w.to_time;
        sgToggle();
    }
    async function signageWindow() {
        try {
            const { config } = await ctx.guard(loadSignage(ctx.siteId));
            sgVersion = config.version;
            drawWindow({ ...SG_DEFAULT, ...(config.window || {}) });
        } catch { drawWindow(SG_DEFAULT); }
        for (const id of ['sgFromMode', 'sgFromTime', 'sgToDay', 'sgToTime']) $(id).disabled = !writable;
        $('sgSave').hidden = $('sgReset').hidden = !writable;
        if (!writable) $('sgMsg').textContent = 'This login cannot change it.';
    }
    $('sgFromMode').addEventListener('change', sgToggle);
    $('sgReset').addEventListener('click', () => { drawWindow(SG_DEFAULT); $('sgMsg').textContent = 'Default filled in — press Save window.'; });
    $('sgSave').addEventListener('click', async () => {
        const w = { from: $('sgFromMode').value === 'now' ? 'now' : $('sgFromTime').value, to_day: Number($('sgToDay').value), to_time: $('sgToTime').value };
        if (!/^\d{2}:\d{2}$/.test(w.to_time || '') || (w.from !== 'now' && !/^\d{2}:\d{2}$/.test(w.from || ''))) { $('sgMsg').textContent = 'Fill in the times.'; return; }
        if (w.to_day === 0 && w.from !== 'now' && w.to_time <= w.from) { $('sgMsg').textContent = 'The end must be after the beginning.'; return; }
        $('sgSave').disabled = true;
        try {
            const r = await ctx.guard(saveSignageConfig(ctx.siteId, { window: w }, sgVersion));
            sgVersion = r.config.version;
            drawWindow(r.config.window);
            $('sgMsg').textContent = 'Saved — every signage screen uses it from its next slide.';
        } catch (err) {
            $('sgMsg').textContent = err instanceof UserError ? err.message : 'Could not save.';
            if (err.status === 409) await signageWindow();
        } finally { $('sgSave').disabled = false; }
    });

    // delete a trip: confirm, then the day is saved without it (a re-import offers it again as "New" — untick it there)
    $('tpList').addEventListener('click', (e) => {
        const b = e.target.closest('button[data-del]');
        if (!b || saving) return;
        const row = doc.rows.find(r => r.key === b.dataset.del);
        if (!row) return;
        const info = resolve(doc.rows);
        const riders = doc.rows.filter(r => info.get(r.key)?.parent === row);
        const ok = confirm([
            `Delete SH ${row.ref}${row.leader ? ` (${row.leader})` : ''} — ${time12(row.at)}${info.get(row.key)?.route ? ', ' + info.get(row.key).route : ''}?`,
            ...(riders.length ? ['', `${riders.length} grouped trip${riders.length === 1 ? '' : 's'} ride${riders.length === 1 ? 's' : ''} with it (${riders.map(r => r.ref).join(', ')}) — ${riders.length === 1 ? 'it keeps' : 'they keep'} ${riders.length === 1 ? 'its' : 'their'} own entr${riders.length === 1 ? 'y' : 'ies'} but no longer ${riders.length === 1 ? 'has' : 'have'} this bus.`] : []),
            '', 'It disappears from the signage and the bus sheets. A later import of the list would offer it again as “New”.',
        ].join('\n'));
        if (!ok) return;
        save(doc.rows.filter(r => r.key !== row.key), `deleted SH ${row.ref}`);
    });

    // departure building: saved at once (signage, bus sheets and summary show it)
    $('tpList').addEventListener('change', (e) => {
        const sel = e.target.closest('select[data-from]');
        if (!sel || saving) return;
        const key = sel.dataset.from, building = sel.value;
        const rows = doc.rows.map(r => r.key === key ? (building ? { ...r, building } : (({ building: _, ...x }) => x)(r)) : r);
        save(rows, `SH ${key} departs from ${building || '(none)'}`);
    });

    // change a time: tap → time box → Enter / leave the box → confirm → saved for the signage and the bus sheets.
    // The groups riding the same bus at the same time move with it.
    $('tpList').addEventListener('click', (e) => {
        const btn = e.target.closest('button[data-time]');
        if (!btn || saving) return;
        const row = doc.rows.find(r => r.key === btn.dataset.time);
        if (!row) return;
        const inp = document.createElement('input');
        inp.type = 'time';
        inp.className = 'tp-time-in';
        inp.value = row.at.slice(11, 16);
        inp.setAttribute('aria-label', `New time for SH ${row.ref}`);
        btn.replaceWith(inp);
        inp.focus();
        let done = false;
        const finish = (commit) => {
            if (done) return;
            done = true;
            const hm = inp.value;
            if (!commit || !/^\d{2}:\d{2}$/.test(hm) || hm === row.at.slice(11, 16)) { list(); return; }
            const at = `${row.at.slice(0, 10)}T${hm}`;
            const info = resolve(doc.rows);
            const riders = info.get(row.key)?.parent ? [] : doc.rows.filter(r => info.get(r.key)?.parent === row && r.at === row.at);
            const ok = confirm([
                `Change the time of SH ${row.ref}${row.leader ? ` (${row.leader})` : ''}`,
                `from ${time12(row.at)} to ${time12(at)}?`,
                ...(riders.length ? ['', `${riders.length} grouped trip${riders.length === 1 ? '' : 's'} on the same ${vehicleOf(row)} move${riders.length === 1 ? 's' : ''} with it.`] : []),
                '', 'The signage and the bus sheet will show the new time.',
            ].join('\n'));
            if (!ok) { list(); return; }
            const move = new Set([row.key, ...riders.map(r => r.key)]);
            const rows = doc.rows.map(r => {
                if (!move.has(r.key)) return r;
                const listAt = r.at_manual ? r.at_import : r.at; // the transport list's own time
                return at === listAt ? (({ at_manual, at_import, ...x }) => ({ ...x, at }))(r) : { ...r, at, at_manual: true, at_import: listAt };
            }).sort((a, b) => a.at.localeCompare(b.at));
            save(rows, `time of SH ${row.ref}: ${row.at.slice(11, 16)} → ${hm}${riders.length ? ` (+${riders.length} grouped)` : ''}`);
        };
        inp.addEventListener('keydown', (k) => { if (k.key === 'Enter') { k.preventDefault(); finish(true); } else if (k.key === 'Escape') finish(false); });
        inp.addEventListener('blur', () => finish(true));
    });

    // Bus / Car / custom: cars and custom vehicles count from 1 on their own (per destination, each custom name
    // apart); buses keep their numbers
    $('tpList').addEventListener('change', (e) => {
        const sel = e.target.closest('select[data-veh]');
        if (!sel || saving) return;
        const key = sel.dataset.veh, row = doc.rows.find(r => r.key === key);
        if (!row) return;
        let to = sel.value, label = '';
        if (to === 'custom') {
            label = (prompt('Name of the vehicle (shown on the bus sheet and the signage), e.g. Self- Bus', row.vehicle_label || 'Self- Bus') || '').trim().slice(0, 30);
            if (!label) { list(); return; }
            to = 'other';
        } else if (to.startsWith('other:')) { label = to.slice(6); to = 'other'; }
        if (to === vehicleOf(row) && (to !== 'other' || label === row.vehicle_label)) return;
        const patch = (r) => {
            const { vehicle, vehicle_label, ...x } = r;
            return { ...x, ...(to === 'bus' ? {} : { vehicle: to }), ...(to === 'other' ? { vehicle_label: label } : {}), bus_manual: false };
        };
        const rows = assignBuses(doc.rows.map(r => r.key === key ? patch(r) : { ...r }), doc.rows);
        // the cars (or this custom name) of this destination always run 1, 2, 3… in time order
        const info = resolve(rows), dest = info.get(key)?.dest;
        if (to !== 'bus') rows.filter(r => vehicleOf(r) === to && (to !== 'other' || String(r.vehicle_label).toUpperCase() === label.toUpperCase()) && !info.get(r.key).parent && info.get(r.key).dest === dest)
            .sort((a, b) => a.at.localeCompare(b.at)).forEach((r, i) => { r.bus = i + 1; r.bus_manual = false; });
        const n = rows.find(r => r.key === key)?.bus;
        save(rows, `SH ${key} → ${to === 'other' ? label : to} ${n ?? ''}`);
    });

    $('tpList').addEventListener('click', (e) => {
        const b = e.target.closest('button[data-name]');
        if (!b || saving) return;
        const row = doc.rows.find(r => r.key === b.dataset.name), field = b.dataset.field;
        if (!row || !NAME_LABEL[field]) return;
        const v = prompt(`${NAME_LABEL[field]} for ${row.ref ? `SH ${row.ref}` : 'this trip'} (${time12(row.at)})`, row[field] || '');
        if (v === null) return;
        const val = String(v).replace(/[<>]/g, '').replace(/\s+/g, ' ').trim().slice(0, 80);
        if (val === (row[field] || '')) return;
        const rows = doc.rows.map(r => r.key !== row.key ? r : { ...r, [field]: val, names_manual: [...new Set([...(r.names_manual || []), field])] });
        save(rows, `${NAME_LABEL[field].toLowerCase()} of ${row.ref ? `SH ${row.ref}` : 'a trip'}: ${val || '—'}`);
    });

    // edit the transporter and Vch No of a vehicle; groups adjusted into the old Vch No follow the new one
    $('tpList').addEventListener('click', (e) => {
        const b = e.target.closest('button[data-tr]');
        if (!b || saving) return;
        const row = doc.rows.find(r => r.key === b.dataset.tr);
        if (!row) return;
        const clean = (v) => String(v ?? '').replace(/[<>]/g, '').replace(/\s+/g, ' ').trim();
        const tr = prompt(`Transporter for SH ${row.ref} (${time12(row.at)})`, row.transporter || '');
        if (tr === null) return;
        const vch = prompt(`Vch No for SH ${row.ref}`, row.vch || '');
        if (vch === null) return;
        const T = clean(tr).slice(0, 60), V = clean(vch).slice(0, 20);
        if (T === (row.transporter || '') && V === (row.vch || '')) return;
        // the list's own Vch No is kept: the groups adjusted into it still ride in this vehicle
        const listVch = row.vch_import ?? row.vch ?? '';
        const rows = doc.rows.map(r => r.key !== row.key ? r
            : { ...r, transporter: T, vch: V, transporter_manual: true, ...(listVch && listVch !== V ? { vch_import: listVch } : {}) });
        save(rows, `SH ${row.ref}: transporter ${T || '—'}, Vch ${V || '—'}`);
    });

    // change a trip's pax: "M F C" (e.g. 10 12 2) or one number for the total; kept when the list is pasted again
    $('tpList').addEventListener('click', (e) => {
        const b = e.target.closest('button[data-pax]');
        if (!b || saving) return;
        const row = doc.rows.find(r => r.key === b.dataset.pax);
        if (!row) return;
        const ans = prompt(`Pax for ${row.ref ? `SH ${row.ref}` : 'this vehicle'} (${time12(row.at)}).\nType M F C (e.g. 10 12 2), or just the total:`,
            [row.m || 0, row.f || 0, row.c || 0].join(' '));
        if (ans === null) return;
        const nums = String(ans).trim().split(/[\s,/]+/).filter(Boolean).map(x => parseInt(x, 10));
        if (!nums.length || nums.some(x => !Number.isFinite(x) || x < 0 || x > 999)) { alert('Type numbers only, e.g. 10 12 2 or 24.'); return; }
        const patch = nums.length === 1 ? { pax: nums[0] } : { m: nums[0] || 0, f: nums[1] || 0, c: nums[2] || 0, pax: (nums[0] || 0) + (nums[1] || 0) + (nums[2] || 0) };
        if (patch.pax === Number(row.pax) && (nums.length === 1 || (patch.m === (row.m || 0) && patch.f === (row.f || 0) && patch.c === (row.c || 0)))) return;
        const rows = doc.rows.map(r => r.key === row.key ? { ...r, ...patch, pax_manual: true } : r);
        save(rows, `pax of ${row.ref ? `SH ${row.ref}` : 'a vehicle'}: ${row.pax} → ${patch.pax}`);
    });

    // add a group to a vehicle by its SH: the slip's group, leader, pax and rooms are filled in from the PMS
    let slipCache = null;
    async function groupOf(sh) {
        try { slipCache = slipCache || await ctx.guard(ctx.db.all()); } catch { slipCache = []; }
        // the slip of that SH whose stay starts or ends this day, else its latest
        const same = slipCache.filter(s => !s.deleted && (String(s.sh_no).toUpperCase() === sh || baseSh(s.sh_no) === baseSh(sh)));
        const slip = same.find(s => s.checkout_date === day || s.checkin_date === day)
            || same.sort((x, y) => String(y.checkin_date).localeCompare(String(x.checkin_date)))[0];
        if (!slip) return null;
        const n = (v) => Math.max(0, parseInt(v, 10) || 0);
        const m = n(slip.gents), f = n(slip.ladies), c = n(slip.children ?? slip.child) + n(slip.infants ?? slip.infant);
        const rooms = ['gents', 'ladies'].flatMap(k => (slip.rooms?.[k] || []).map(x => String(x.room_no || '').trim()).filter(Boolean));
        return { slip, add: { ref: String(slip.sh_no), operator: slip.tour_name || '', leader: String(slip.group_leader || '').trim(), m, f, c, pax: n(slip.total) || m + f + c, rooms } };
    }
    $('tpList').addEventListener('click', (e) => {
        const open = e.target.closest('[data-addbus-open]'), cancel = e.target.closest('[data-addbus-cancel]');
        if (open) { const f = open.parentElement.querySelector('form'); f.hidden = false; open.hidden = true; f.elements.time.focus(); }
        else if (cancel) { const f = cancel.closest('form'); f.hidden = true; f.reset(); f.parentElement.querySelector('[data-addbus-open]').hidden = false; }
    });
    $('tpList').addEventListener('submit', async (e) => {
        const f = e.target.closest('form[data-addbus]');
        if (!f) return;
        e.preventDefault();
        if (saving) return;
        const dest = destsFor(ctx.siteId).find(d => d.id === f.dataset.addbus);
        const el = f.elements, clean = (v) => String(v ?? '').replace(/[<>]/g, '').replace(/\s+/g, ' ').trim();
        const time = el.time.value;
        if (!dest || !/^\d{2}:\d{2}$/.test(time)) { el.time.focus(); return; }
        const sh = clean(el.sh.value).replace(/\s/g, '').toUpperCase();
        let add = { ref: '', operator: '', leader: '', m: 0, f: 0, c: 0, pax: 0, rooms: [] };
        if (sh) {
            const g = await groupOf(sh);
            if (g) add = g.add;
            else {
                const p = prompt(`SH ${sh} is not in this site's slips. Add the vehicle with it anyway? Number of pax:`);
                if (p === null) return;
                add = { ...add, ref: sh, pax: Math.max(0, parseInt(p, 10) || 0) };
            }
        }
        const T = clean(el.transporter.value).slice(0, 60), V = clean(el.vch.value).slice(0, 20);
        const trip = {
            key: `M${Date.now().toString(36).toUpperCase()}`, dora: '', vch: V, transporter: T, at: `${day}T${time}`, route: dest.route,
            remarks: 'vehicle added by hand', adj: '', loc: '', ...add, manual: true, ...(T || V ? { transporter_manual: true } : {}),
            ...(el.veh.value === 'car' ? { vehicle: 'car' } : {}),
        };
        // existing numbers stay; the new vehicle takes the next number of its destination
        const rows = assignBuses([...doc.rows.map(r => ({ ...r })), trip].sort((a, b) => a.at.localeCompare(b.at)), doc.rows);
        const n = rows.find(r => r.key === trip.key)?.bus;
        save(rows, `${dest.title}: ${el.veh.value} ${n ?? ''} added by hand at ${time}${add.ref ? ` with SH ${add.ref}` : ''}`);
    });
    $('tpList').addEventListener('click', async (e) => {
        const b = e.target.closest('button[data-addsh]');
        if (!b || saving) return;
        const parent = doc.rows.find(r => r.key === b.dataset.addsh);
        if (!parent) return;
        // one SH or several at once: "44461, 44462 44463"
        const typed = String(prompt(`SH to add to the ${vehicleOf(parent)} of ${parent.ref ? `SH ${parent.ref}` : 'this vehicle'} (${time12(parent.at)}).\nSeveral at once: separate them with a comma or a space.`) || '');
        const shs = [...new Set(typed.replace(/[<>]/g, '').toUpperCase().split(/[\s,;]+/).filter(Boolean))];
        if (!shs.length) return;
        const n = (v) => Math.max(0, parseInt(v, 10) || 0);
        const found = [], missing = [];
        for (const sh of shs) { const g = await groupOf(sh); (g ? found : missing).push(g ? g : sh); }
        const already = shs.filter(sh => doc.rows.some(r => String(r.ref).toUpperCase() === sh));
        const lines = found.map(({ slip, add }) => `• SH ${slip.sh_no} — ${slip.tour_name || '—'} · ${String(slip.group_leader || '').trim() || '-'} · ${add.pax} pax (M ${add.m} · F ${add.f} · C ${add.c})${add.rooms.length ? ` · rooms ${add.rooms.join(', ')}` : ''}`);
        if (found.length && !confirm([`Add ${found.length} group${found.length === 1 ? '' : 's'} to this ${vehicleOf(parent)}?`, '', ...lines,
            ...(missing.length ? ['', `Not in this site's slips: ${missing.join(', ')} — you will be asked their pax next.`] : []),
            ...(already.length ? ['', `Already on this day's list: ${already.join(', ')} — they are added again.`] : [])].join('\n'))) return;
        const adds = found.map(g => g.add);
        for (const sh of missing) {
            const p = prompt(`SH ${sh} is not in this site's slips. Add it anyway? Number of pax (Cancel to skip):`);
            if (p === null || !n(p)) continue;
            adds.push({ ref: sh, operator: '', leader: '', m: 0, f: 0, c: 0, pax: n(p), rooms: [] });
        }
        if (!adds.length) return;
        const stamp = Date.now().toString(36).toUpperCase();
        const riders = adds.map((add, i) => ({ key: `M${stamp}${i}`, dora: '', vch: '', transporter: '', at: parent.at, route: '', remarks: `added to SH ${parent.ref}'s ${vehicleOf(parent)}`, adj: '', loc: '', ...add, with: parent.key, manual: true }));
        save([...doc.rows, ...riders].sort((a, b) => a.at.localeCompare(b.at)), `SH ${adds.map(a => a.ref).join(', ')} added to ${parent.ref ? `SH ${parent.ref}` : 'a vehicle'}`);
    });

    // Medina Ziyarat: split a bus's groups into a gents trip and a ladies trip (core/ziyarat.js)
    $('tpList').addEventListener('click', async (e) => {
        const b = e.target.closest('button[data-zsplit]');
        if (!b || saving) return;
        const main = doc.rows.find(r => r.key === b.dataset.zsplit);
        if (!main) return;
        const info = resolve(doc.rows);
        const riders = doc.rows.filter(r => info.get(r.key)?.parent === main);
        const rows = await openZiyaratSplit(main, riders, doc.rows);
        if (!rows) return;
        const undone = !rows.some(r => r.key === `${main.key}-L`);
        save(assignBuses(rows.map(r => ({ ...r })), doc.rows), undone ? `Ziyarat split undone for SH ${main.ref || main.key}` : `Ziyarat gents / ladies for SH ${main.ref || main.key} (${riders.length + 1} groups)`);
    });

    // airport departures: number one destination's vehicles by departure time (buses, cars and each custom name
    // count apart). Only when asked — saved numbers are never changed on their own; numbers can still be typed in after.
    $('tpList').addEventListener('click', (e) => {
        const b = e.target.closest('button[data-bytime]');
        if (!b || saving) return;
        const dest = b.dataset.bytime;
        const info = resolve(doc.rows);
        const kind = (r) => vehicleOf(r) === 'other' ? `other:${String(r.vehicle_label || '').toUpperCase()}` : vehicleOf(r);
        const mains = doc.rows.filter(r => info.get(r.key)?.dest === dest && !info.get(r.key).parent);
        const next = new Map();
        const groups = new Map();
        for (const r of mains) { if (!groups.has(kind(r))) groups.set(kind(r), []); groups.get(kind(r)).push(r); }
        for (const list of groups.values()) list.sort((x, y) => x.at.localeCompare(y.at) || (x.bus ?? 1e9) - (y.bus ?? 1e9)).forEach((r, i) => next.set(r.key, i + 1));
        const moved = mains.filter(r => Number(r.bus) !== next.get(r.key));
        if (!moved.length) { msg('Already numbered by departure time.'); return; }
        const title = destsFor(ctx.siteId).find(d => d.id === dest)?.title || dest;
        if (!confirm([`Number the ${title} vehicles 1, 2, 3… by departure time?`, '',
            ...moved.slice(0, 12).map(r => `SH ${r.ref} · ${time12(r.at)}: ${r.bus ?? '—'} → ${next.get(r.key)}`),
            ...(moved.length > 12 ? [`… and ${moved.length - 12} more`] : []), '',
            'Bus sheets already stuck on vehicles may no longer match. You can still type a number in afterwards.'].join('\n'))) return;
        const rows = doc.rows.map(r => next.has(r.key) && Number(r.bus) !== next.get(r.key) ? { ...r, bus: next.get(r.key), bus_manual: false } : r);
        save(rows, `${title}: numbered by departure time (${moved.length} changed)`);
    });

    // plan the day's vehicles from the groups checking out (slips): ticked ones become trips, numbered after the existing ones
    $('tpPlan').addEventListener('click', async () => {
        if (saving) return;
        let slips;
        try { slips = await ctx.guard(ctx.db.all()); } catch { msg('Could not read the slips.', 'bad'); return; }
        const trips = await openCheckoutPlan({ day, siteId: ctx.siteId, slips, rows: doc.rows });
        if (!trips?.length) return;
        const rows = assignBuses([...doc.rows.map(r => ({ ...r })), ...trips].sort((a, b) => a.at.localeCompare(b.at)), doc.rows);
        save(rows, `planned from check-outs: ${trips.length} group${trips.length === 1 ? '' : 's'} (SH ${trips.map(t => t.ref).join(', ')})`);
    });
    $('tpRenumber').addEventListener('click', () => {
        if (!confirm('Number every destination again from 1, in time order?\nBuses and cars count apart. Numbers typed in by hand are replaced, and sheets already stuck on buses may no longer match.')) return;
        save(renumber(doc.rows), 'renumbered');
    });
    $('tpDelete').addEventListener('click', async () => {
        if (!confirm(`Delete the whole transport list of ${day}? Signage and bus sheets for the day go with it.`)) return;
        try { await ctx.guard(deleteDay(ctx.siteId, day, doc.version)); msg('Deleted.'); } catch (e) { msg(e.message || 'Could not delete.', 'bad'); }
        await load();
    });

    try { buildings = buildingNames(await ctx.guard(loadBuildings()), ctx.siteId); } catch { buildings = buildingNames([], ctx.siteId); }
    await load();
    await signageWindow();
    // other desks' imports: check every 30 s (not while a bus number is being typed)
    const t = setInterval(() => {
        if (saving || document.visibilityState !== 'visible' || ctx.root.contains(document.activeElement) && document.activeElement.matches('input[data-key], input.tp-time-in, select[data-from]')) return;
        load({ quiet: true });
    }, 30e3);
    return () => clearInterval(t);
}
