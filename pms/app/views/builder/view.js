// Rooms & Buildings builder: buildings of this site, their rooms and bed counts.
// Saved per building on the server (with version protection); other pages read it via core/rooms.js.

import { canWrite, UserError } from '../../core/cloud.js';
import { loadBuildings, buildingsOfSite, saveBuilding, removeBuilding, floorOf, normRoom, totalBeds, roomsState } from '../../core/rooms.js';

const TYPES = ['', 'gents', 'ladies', 'family'];
const natural = (a, b) => String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: 'base' });
const clone = (x) => JSON.parse(JSON.stringify(x));

export default async function mount(ctx) {
    const { db, site, siteId } = ctx;
    const $ = (id) => document.getElementById(id);
    const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const writable = canWrite(siteId);
    document.querySelectorAll('.siteName').forEach(el => { el.textContent = site.label; });

    let saved = [];          // buildings of this site as on the server
    const drafts = new Map(); // key → working copy with unsaved edits
    let currentKey = null;
    let newCounter = 0;
    const selected = new Set(); // indexes into current.rooms

    const keyOf = (b) => b.id ? `id${b.id}` : b._key;
    const original = (key) => saved.find(b => keyOf(b) === key) || null;
    const current = () => drafts.get(currentKey) || null;
    const isDirty = (key) => {
        const d = drafts.get(key);
        if (!d) return false;
        const o = original(key);
        if (!o) return true;
        const pick = (b) => JSON.stringify({ name: b.name, sort: Number(b.sort) || 0, notes: b.notes || '', rooms: b.rooms });
        return pick(d) !== pick(o);
    };

    function notice(msg, bad = false) {
        $('notice').hidden = !msg;
        $('notice').textContent = msg || '';
        $('notice').classList.toggle('bad', bad);
    }

    /* ------------------------------- loading ------------------------------- */

    async function load() {
        const all = await ctx.guard(loadBuildings({ force: true }));
        if (!roomsState.serverSupportsRooms) {
            notice('The PMS server has not been updated for Rooms & Buildings yet. Ask the admin to redeploy worker.js and run schema.sql (see worker/README.md).', true);
        } else if (!writable) {
            notice(db.readonlyReason || 'Read-only.');
        } else notice('');
        saved = buildingsOfSite(all, siteId).map(clone);
        for (const [k] of drafts) if (!isDirty(k) && k.startsWith('id')) drafts.delete(k);
        if (!currentKey || (!original(currentKey) && !drafts.has(currentKey))) currentKey = saved[0] ? keyOf(saved[0]) : null;
        renderList();
        openBuilding(currentKey);
        renderSeed();
    }

    /* --------------------------------- list --------------------------------- */

    function listEntries() {
        const out = saved.map(b => drafts.get(keyOf(b)) || b);
        for (const [k, d] of drafts) if (!d.id) out.push(d);
        return out;
    }

    function renderList() {
        const entries = listEntries();
        $('buildingList').innerHTML = entries.map(b => {
            const k = keyOf(b);
            return `<li><button type="button" data-key="${k}" aria-current="${k === currentKey}">
                <b>${esc(b.name || '(unnamed)')}</b>${isDirty(k) ? '<em class="dirty">unsaved</em>' : '<em></em>'}
                <span>${b.rooms.length} rooms · ${totalBeds(b)} beds</span></button></li>`;
        }).join('') || '<li class="muted small">No buildings yet.</li>';
        $('buildingSelect').innerHTML = entries.map(b => `<option value="${keyOf(b)}" ${keyOf(b) === currentKey ? 'selected' : ''}>${esc(b.name)}${isDirty(keyOf(b)) ? ' • unsaved' : ''} (${b.rooms.length} rooms)</option>`).join('');
        const rooms = entries.reduce((n, b) => n + b.rooms.length, 0);
        $('siteTotal').textContent = entries.length ? `${site.label}: ${entries.length} buildings · ${rooms} rooms · ${entries.reduce((n, b) => n + totalBeds(b), 0)} beds` : '';
        $('btnNewBuilding').hidden = !writable || !roomsState.serverSupportsRooms;
    }

    $('buildingList').addEventListener('click', (e) => { const b = e.target.closest('button[data-key]'); if (b) openBuilding(b.dataset.key); });
    $('buildingSelect').addEventListener('change', (e) => openBuilding(e.target.value));

    $('btnNewBuilding').addEventListener('click', () => {
        const name = (prompt('Name of the new building:') || '').trim().toUpperCase();
        if (!name) return;
        if (listEntries().some(b => b.name === name)) { alert(`${name} already exists.`); return; }
        const k = `new${++newCounter}`;
        drafts.set(k, { _key: k, site: siteId, name, sort: listEntries().length, notes: '', rooms: [] });
        renderList();
        openBuilding(k);
    });

    /* -------------------------------- editor -------------------------------- */

    function openBuilding(key) {
        currentKey = key;
        selected.clear();
        const b = key && (drafts.get(key) || original(key));
        $('editor').hidden = !b;
        $('emptyState').hidden = !!b;
        if (!b) { renderList(); return; }
        if (!drafts.has(key)) drafts.set(key, clone(b));
        const d = current();
        $('bName').value = d.name;
        $('bSort').value = d.sort || 0;
        $('bNotes').value = d.notes || '';
        $('fSearch').value = '';
        renderFloors();
        renderRooms();
        renderList();
        const off = !writable || !roomsState.serverSupportsRooms;
        $('editor').querySelectorAll('input, select, textarea, button').forEach(el => {
            if (el.id === 'fSearch' || el.id === 'fFloor') return;
            el.disabled = off;
        });
        $('saveMsg').textContent = d.updated_by ? `Last saved by ${d.updated_by}, ${new Date(d.updated_at).toLocaleString()}` : (d.id ? '' : 'Not saved yet');
    }

    function touch() { renderStats(); renderList(); }

    $('bName').addEventListener('input', () => { current().name = $('bName').value.toUpperCase(); touch(); });
    $('bSort').addEventListener('input', () => { current().sort = Number($('bSort').value) || 0; touch(); });
    $('bNotes').addEventListener('input', () => { current().notes = $('bNotes').value; touch(); });

    function renderStats() {
        const d = current();
        const active = d.rooms.filter(r => r.active !== false);
        const floors = new Set(d.rooms.map(r => r.floor || floorOf(r.room_no)));
        const zero = active.filter(r => !r.capacity).length;
        $('bStats').innerHTML = [
            `<span class="pill">${d.rooms.length} rooms</span>`,
            `<span class="pill">${active.length} active</span>`,
            `<span class="pill"><b>${totalBeds(d)}</b> beds</span>`,
            `<span class="pill">${floors.size} floors</span>`,
            zero ? `<span class="pill warn">${zero} active with 0 beds</span>` : '',
            isDirty(currentKey) ? '<span class="pill warn">unsaved changes</span>' : '',
        ].join('');
        $('selCount').textContent = selected.size ? `${selected.size} selected` : '';
        renderMap();
    }

    function renderFloors() {
        const d = current();
        const floors = [...new Set(d.rooms.map(r => r.floor || floorOf(r.room_no)))].sort(natural);
        const keep = $('fFloor').value;
        $('fFloor').innerHTML = '<option value="">All floors</option>' + floors.map(f => `<option value="${esc(f)}">Floor ${esc(f)}</option>`).join('');
        if (floors.includes(keep)) $('fFloor').value = keep;
    }

    function visibleIndexes() {
        const d = current();
        const q = normRoom($('fSearch').value);
        const f = $('fFloor').value;
        return d.rooms.map((r, i) => i).filter(i => {
            const r = d.rooms[i];
            if (q && !normRoom(r.room_no).includes(q) && !String(r.notes || '').toUpperCase().includes(q)) return false;
            if (f && (r.floor || floorOf(r.room_no)) !== f) return false;
            return true;
        });
    }

    function renderRooms() {
        const d = current();
        const orig = original(currentKey);
        const before = new Map((orig?.rooms || []).map(r => [normRoom(r.room_no), JSON.stringify(r)]));
        const rows = visibleIndexes().map(i => {
            const r = d.rooms[i];
            const changed = before.get(normRoom(r.room_no)) !== JSON.stringify(r);
            return `<tr data-i="${i}" class="${r.active === false ? 'off' : ''} ${changed && orig ? 'changed' : ''}">
                <td class="c-sel"><input type="checkbox" data-f="sel" ${selected.has(i) ? 'checked' : ''} aria-label="Select room ${esc(r.room_no)}"></td>
                <td class="c-room"><input data-f="room_no" value="${esc(r.room_no)}" maxlength="12" aria-label="Room number"></td>
                <td class="c-floor"><input data-f="floor" value="${esc(r.floor)}" placeholder="${esc(floorOf(r.room_no))}" maxlength="10" aria-label="Floor"></td>
                <td class="c-cap"><input data-f="capacity" type="number" min="0" max="50" value="${r.capacity}" aria-label="Beds"></td>
                <td><select data-f="type" aria-label="Type">${TYPES.map(t => `<option value="${t}" ${t === (r.type || '') ? 'selected' : ''}>${t || 'any'}</option>`).join('')}</select></td>
                <td><input data-f="notes" value="${esc(r.notes)}" maxlength="200" aria-label="Notes"></td>
                <td><input type="checkbox" data-f="active" ${r.active !== false ? 'checked' : ''} aria-label="Active"></td>
                <td><button type="button" class="del-row" data-f="del" title="Remove room" aria-label="Remove room">✕</button></td>
            </tr>`;
        });
        $('roomTbl').querySelector('tbody').innerHTML = rows.join('') || `<tr><td colspan="8" class="muted">${d.rooms.length ? 'No room matches the filter.' : 'No rooms yet — use “Add rooms”.'}</td></tr>`;
        $('selAll').checked = false;
        if (!writable || !roomsState.serverSupportsRooms) $('roomTbl').querySelectorAll('input, select, button').forEach(el => { el.disabled = true; });
        renderStats();
    }

    const tbody = $('roomTbl').querySelector('tbody');
    tbody.addEventListener('input', (e) => {
        const tr = e.target.closest('tr[data-i]'); const f = e.target.dataset.f;
        if (!tr || !f || f === 'sel' || f === 'active' || f === 'del') return;
        const r = current().rooms[Number(tr.dataset.i)];
        if (f === 'capacity') r.capacity = e.target.value === '' ? 0 : Math.max(0, Math.min(50, Math.round(Number(e.target.value)) || 0));
        else if (f === 'room_no') { r.room_no = e.target.value.trim(); e.target.closest('tr').querySelector('[data-f=floor]').placeholder = floorOf(r.room_no); }
        else r[f] = e.target.value;
        tr.classList.add('changed');
        renderStats(); renderList();
    });
    tbody.addEventListener('change', (e) => {
        const tr = e.target.closest('tr[data-i]'); const f = e.target.dataset.f; if (!tr) return;
        const i = Number(tr.dataset.i);
        if (f === 'sel') { e.target.checked ? selected.add(i) : selected.delete(i); renderStats(); }
        if (f === 'active') { current().rooms[i].active = e.target.checked; tr.classList.toggle('off', !e.target.checked); touch(); }
        if (f === 'floor') renderFloors();
    });
    tbody.addEventListener('click', (e) => {
        if (e.target.dataset.f !== 'del') return;
        const i = Number(e.target.closest('tr').dataset.i);
        current().rooms.splice(i, 1);
        selected.clear();
        renderFloors(); renderRooms(); renderList();
    });

    $('fSearch').addEventListener('input', renderRooms);
    $('fFloor').addEventListener('change', renderRooms);
    $('selAll').addEventListener('change', (e) => {
        for (const i of visibleIndexes()) e.target.checked ? selected.add(i) : selected.delete(i);
        tbody.querySelectorAll('input[data-f=sel]').forEach(c => { c.checked = e.target.checked; });
        renderStats();
    });

    function forSelected(fn, what) {
        if (!selected.size) { alert('Tick the rooms first (the box at the start of each row).'); return false; }
        for (const i of selected) fn(current().rooms[i]);
        renderRooms(); renderList();
        $('saveMsg').textContent = `${what} for ${selected.size} room(s) — not saved yet.`;
        return true;
    }
    $('btnSelCap').addEventListener('click', () => {
        const v = Number($('selCap').value);
        if (!Number.isInteger(v) || v < 0 || v > 50) { alert('Enter beds 0–50.'); return; }
        forSelected(r => { r.capacity = v; }, `Beds set to ${v}`);
    });
    $('btnSelOn').addEventListener('click', () => forSelected(r => { r.active = true; }, 'Marked active'));
    $('btnSelOff').addEventListener('click', () => forSelected(r => { r.active = false; }, 'Marked inactive'));
    $('btnSelDel').addEventListener('click', () => {
        if (!selected.size) { alert('Tick the rooms first.'); return; }
        if (!confirm(`Remove ${selected.size} room(s) from ${current().name}?`)) return;
        const d = current();
        d.rooms = d.rooms.filter((r, i) => !selected.has(i));
        selected.clear();
        renderFloors(); renderRooms(); renderList();
    });

    $('btnAddRow').addEventListener('click', () => {
        current().rooms.push({ room_no: '', floor: '', capacity: 0, type: '', notes: '', active: true });
        $('fSearch').value = ''; $('fFloor').value = '';
        renderRooms(); renderList();
        const inputs = tbody.querySelectorAll('input[data-f=room_no]');
        inputs[inputs.length - 1]?.focus();
    });

    /* ---------------------------- generators ---------------------------- */

    function upsertRooms(list, { overwrite }) {
        const d = current();
        const byNo = new Map(d.rooms.map(r => [normRoom(r.room_no), r]));
        let added = 0, updated = 0;
        for (const x of list) {
            const hit = byNo.get(normRoom(x.room_no));
            if (hit) { if (overwrite && hit.capacity !== x.capacity) { hit.capacity = x.capacity; updated++; } continue; }
            const r = { room_no: x.room_no, floor: floorOf(x.room_no), capacity: x.capacity, type: x.type || '', notes: '', active: true };
            d.rooms.push(r); byNo.set(normRoom(r.room_no), r); added++;
        }
        d.rooms.sort((a, b) => natural(a.room_no, b.room_no));
        selected.clear();
        renderFloors(); renderRooms(); renderList();
        return { added, updated };
    }

    $('btnGen').addEventListener('click', () => {
        const from = $('gFrom').value.trim(), to = $('gTo').value.trim() || from;
        const cap = Number($('gCap').value);
        if (!/^\d+$/.test(from) || !/^\d+$/.test(to) || Number(to) < Number(from)) { alert('Enter two room numbers, e.g. 501 and 520.'); return; }
        if (Number(to) - Number(from) > 500) { alert('At most 500 rooms at once.'); return; }
        if (!Number.isInteger(cap) || cap < 0 || cap > 50) { alert('Beds must be 0–50.'); return; }
        const width = from.length;
        const list = [];
        for (let n = Number(from); n <= Number(to); n++) list.push({ room_no: String(n).padStart(width, '0'), capacity: cap, type: $('gType').value });
        const { added } = upsertRooms(list, { overwrite: false });
        $('saveMsg').textContent = `${added} room(s) added${list.length - added ? `, ${list.length - added} already existed` : ''} — not saved yet.`;
    });

    $('btnPaste').addEventListener('click', () => {
        const items = $('pasteList').value.split(/[,;\n]+/).map(s => s.trim()).filter(Boolean);
        const list = [], bad = [];
        for (const it of items) {
            const m = it.match(/^([A-Za-z0-9-]{1,12})\s*[:\s]\s*(\d{1,2})$/);
            if (m && Number(m[2]) <= 50) list.push({ room_no: m[1].toUpperCase(), capacity: Number(m[2]) }); else bad.push(it);
        }
        if (!list.length) { alert('Nothing recognised. Use e.g. 501:4, 502:3'); return; }
        const { added, updated } = upsertRooms(list, { overwrite: true });
        $('saveMsg').textContent = `${added} added, ${updated} updated${bad.length ? `, ${bad.length} not understood: ${bad.slice(0, 5).join(', ')}` : ''} — not saved yet.`;
        if (!bad.length) $('pasteList').value = '';
    });

    /* ------------------------------ floor map ------------------------------ */

    function renderMap() {
        if (!$('editor').querySelector('details.map').open) return;
        const d = current();
        const byFloor = new Map();
        for (const r of d.rooms) {
            const f = r.floor || floorOf(r.room_no) || '?';
            if (!byFloor.has(f)) byFloor.set(f, []);
            byFloor.get(f).push(r);
        }
        $('floorMap').innerHTML = [...byFloor.keys()].sort(natural).map(f => `<div class="floor"><b>Floor ${esc(f)}</b><div class="chips">${byFloor.get(f).sort((a, b) => natural(a.room_no, b.room_no)).map(r =>
            `<span class="chip ${r.type ? r.type[0] : ''} ${r.active === false ? 'off' : ''}" title="${esc(r.type || 'any')}${r.notes ? ' — ' + esc(r.notes) : ''}">${esc(r.room_no)} · ${r.capacity}</span>`).join('')}</div></div>`).join('') || '<p class="muted">No rooms.</p>';
    }
    $('editor').querySelector('details.map').addEventListener('toggle', renderMap);

    /* ------------------------------ save / delete ------------------------------ */

    async function slipsUsing(name) {
        const rows = await db.all();
        return rows.filter(r => String(r.building || '').trim().toUpperCase() === name).length;
    }

    function validate(d) {
        const seen = new Map(); const problems = [];
        d.rooms.forEach((r, i) => {
            const k = normRoom(r.room_no);
            if (!k) problems.push(i);
            else if (seen.has(k)) problems.push(i, seen.get(k));
            else seen.set(k, i);
            if (!Number.isInteger(r.capacity) || r.capacity < 0 || r.capacity > 50) problems.push(i);
        });
        return [...new Set(problems)];
    }

    $('btnSave').addEventListener('click', async () => {
        const d = current();
        if (!d.name.trim()) { alert('Give the building a name.'); return; }
        const problems = validate(d);
        if (problems.length) {
            $('fSearch').value = ''; $('fFloor').value = ''; renderRooms();
            problems.forEach(i => tbody.querySelector(`tr[data-i="${i}"]`)?.classList.add('bad'));
            alert(`${problems.length} room(s) need fixing (highlighted): each room needs a unique number and 0–50 beds.`);
            return;
        }
        const o = original(currentKey);
        if (o && o.name !== d.name) {
            const n = await slipsUsing(o.name);
            if (n && !confirm(`${n} slip(s) are for building ${o.name}. They keep that name — renaming here does not change them.\n\nRename to ${d.name} anyway?`)) return;
        }
        $('btnSave').disabled = true;
        $('saveMsg').textContent = 'Saving…';
        try {
            const b = await saveBuilding(d);
            drafts.delete(currentKey);
            currentKey = keyOf(b);
            await load();
            $('saveMsg').textContent = `Saved ${b.name}: ${b.rooms.length} rooms, ${totalBeds(b)} beds.`;
        } catch (e) {
            $('saveMsg').textContent = e instanceof UserError ? e.message : 'Save failed: ' + (e.message || e);
            if (e.status === 409 && confirm(`${e.message}\n\nThrow away your changes to ${d.name} and load the latest version?`)) { drafts.delete(currentKey); await load(); }
        } finally { $('btnSave').disabled = !writable; }
    });

    $('btnDiscard').addEventListener('click', () => {
        if (!isDirty(currentKey) || !confirm('Throw away the unsaved changes to this building?')) return;
        const wasNew = !original(currentKey);
        drafts.delete(currentKey);
        if (wasNew) currentKey = saved[0] ? keyOf(saved[0]) : null;
        openBuilding(currentKey);
    });

    $('btnDelete').addEventListener('click', async () => {
        const d = current();
        if (!d.id) { drafts.delete(currentKey); currentKey = saved[0] ? keyOf(saved[0]) : null; openBuilding(currentKey); return; }
        const n = await slipsUsing(d.name);
        if (!confirm(`Delete building ${d.name} with ${d.rooms.length} rooms?${n ? `\n\n${n} slip(s) are for this building; they are not deleted, but capacities for it will come from old slips again.` : ''}`)) return;
        try {
            await removeBuilding(original(currentKey));
            drafts.delete(currentKey); currentKey = null;
            await load();
        } catch (e) { alert(e.message || e); }
    });

    window.addEventListener('beforeunload', (e) => {
        if ([...drafts.keys()].some(isDirty)) { e.preventDefault(); e.returnValue = ''; }
    });

    /* --------------------------------- seed --------------------------------- */

    let seed = [];
    async function renderSeed() {
        if (!writable || !roomsState.serverSupportsRooms) { $('seedCard').hidden = true; return; }
        if (!seed.length) {
            try { seed = (await ctx.guard(fetch('app/data/rooms-seed.json').then(r => r.json()))).buildings.filter(b => b.site === siteId); } catch { seed = []; }
        }
        const todo = seed.filter(s => { const b = saved.find(x => x.name === s.name); return !b || !b.rooms.length; });
        $('seedCard').hidden = !todo.length;
        $('seedText').textContent = todo.map(s => `${s.name} (${s.rooms.length} rooms, ${s.rooms.reduce((n, r) => n + r.capacity, 0)} beds)`).join(' · ')
            + ' — from the original PMS room lists. Everything stays editable afterwards.';
        $('btnSeed').onclick = async () => {
            if (!confirm(`Create ${todo.map(s => s.name).join(', ')} with their rooms and bed counts?`)) return;
            $('btnSeed').disabled = true;
            try {
                for (const [i, s] of todo.entries()) {
                    $('btnSeed').textContent = `Creating ${s.name}…`;
                    const existing = saved.find(x => x.name === s.name);
                    const rooms = s.rooms.map(r => ({ room_no: r.room_no, floor: floorOf(r.room_no), capacity: r.capacity, type: '', notes: r.capacity ? '' : 'no beds in the original list', active: true }))
                        .sort((a, b) => natural(a.room_no, b.room_no));
                    await saveBuilding(existing ? { ...existing, rooms } : { site: siteId, name: s.name, sort: i, notes: '', rooms });
                }
                await load();
                notice(`Created ${todo.length} building(s) from the room lists.`);
            } catch (e) { alert(e.message || e); }
            finally { $('btnSeed').disabled = false; $('btnSeed').textContent = 'Create from room lists'; }
        };
    }

    await load();
}
