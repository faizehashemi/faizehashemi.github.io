// Ported from pms/slip_admin.html. Page logic is kept as it was; storage goes through ctx.db (app/core/db.js).

import { siteOfBuilding } from '../../config.js';

export default async function mount(ctx) {
const { db } = ctx;

/* --------------------- Data (this site only) --------------------- */
        const getAllRecords = () => db.all();
        const deleteRecord = (id) => db.remove(id);
        const clearAllRecords = () => db.clear();          // this site's slips only
        const SITE = ctx.site.label;
        function readOnlyBlocked() {
            if (!db.readonly) return false;
            alert(db.readonlyReason);
            return true;
        }

        /* -------------------------- UI helpers ------------------------- */
        function $(id) { return document.getElementById(id); }
        function fmt(dt) {
            const d = new Date(dt);
            return isNaN(d) ? '' : new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(d);
        }
        function td(text, cls) { const e = document.createElement('td'); e.textContent = text; if (cls) e.className = cls; return e; }
        function roomList(r) {
            const a = (r.rooms?.gents || []).map(x => String(x.room_no || '').trim());
            const b = (r.rooms?.ladies || []).map(x => String(x.room_no || '').trim());
            return Array.from(new Set([...a, ...b].filter(Boolean)));
        }

        /* ------------------------- State & render ------------------------ */
        let CACHE = [];
        let FILTERED = [];

        function populateBuildings() {
            const sel = $('bld');
            const names = Array.from(new Set(CACHE.map(r => (r.building || '').trim()).filter(Boolean))).sort();
            sel.innerHTML = '';
            const optAll = document.createElement('option'); optAll.value = ''; optAll.textContent = 'All buildings';
            sel.appendChild(optAll);
            names.forEach(n => { const o = document.createElement('option'); o.value = n; o.textContent = n; sel.appendChild(o); });
        }

        function applyFilters() {
            const q = $('q').value.trim().toLowerCase();
            const roomq = $('roomq').value.trim().toLowerCase();
            const b = $('bld').value;
            const from = $('from').value;
            const to = $('to').value;
            const fromDt = from ? new Date(from + 'T00:00') : null;
            const toDt = to ? new Date(to + 'T23:59:59') : null;

            FILTERED = CACHE.filter(r => {
                if (b && (r.building || '').trim() !== b) return false;
                if (fromDt && new Date(r.createdAt) < fromDt) return false;
                if (toDt && new Date(r.createdAt) > toDt) return false;

                // Text query over tour/leader/building/SH
                if (q) {
                    const hay = [
                        r.tour_name || '', r.group_leader || '', r.building || '',
                        String(r.sh_no || ''), String(r.total || '')
                    ].join(' ').toLowerCase();
                    if (!hay.includes(q)) return false;
                }

                // Room query: partial match against any room_no in gents/ladies
                if (roomq) {
                    const rooms = roomList(r).map(x => x.toLowerCase());
                    if (!rooms.some(x => x.includes(roomq))) return false;
                }

                return true;
            }).sort((a, b) => (a.createdAt > b.createdAt ? -1 : 1));
        }

        function renderTable() {
            applyFilters();
            const tb = $('tbl').querySelector('tbody');
            tb.innerHTML = '';
            FILTERED.forEach(r => {
                const tr = document.createElement('tr');
                const chk = document.createElement('input'); chk.type = 'checkbox'; chk.dataset.id = r.id;
                const tdChk = document.createElement('td'); tdChk.appendChild(chk);

                tr.appendChild(tdChk);
                tr.appendChild(td(r.id));
                tr.appendChild(td(r.tour_name || ''));
                tr.appendChild(td(r.group_leader || ''));
                tr.appendChild(td((r.building || '').trim()));
                tr.appendChild(td(r.sh_no ?? ''));
                const ci = r.checkin_date ? new Date(`${r.checkin_date}T${r.checkin_time || '00:00'}`) : null;
                const co = r.checkout_date ? new Date(`${r.checkout_date}T${r.checkout_time || '00:00'}`) : null;
                tr.appendChild(td(ci ? fmt(ci) : ''));
                tr.appendChild(td(co ? fmt(co) : ''));
                tr.appendChild(td(fmt(r.createdAt)));
                tr.addEventListener('click', (ev) => {
                    if (ev.target.tagName.toLowerCase() === 'input') return; // ignore checkbox
                    showPreview(r);
                });
                tb.appendChild(tr);
            });
            $('count').textContent = `${FILTERED.length} slip(s) shown`;
            $('chkAll').checked = false;
        }

        function showPreview(r) {
            const div = $('preview');
            const rooms = roomList(r);
            const roomsG = (r.rooms?.gents || []).map(x => `${x.room_no || ''} (cap ${x.capacity ?? '?'})`).filter(Boolean).join(', ') || '—';
            const roomsL = (r.rooms?.ladies || []).map(x => `${x.room_no || ''} (cap ${x.capacity ?? '?'})`).filter(Boolean).join(', ') || '—';

            div.classList.remove('muted');
            div.innerHTML = `
        <div class="pill"><b>ID</b> #${r.id}</div>
        <div class="pill"><b>Created</b> ${fmt(r.createdAt)}</div>
        ${r.updatedAt ? `<div class="pill"><b>Updated</b> ${fmt(r.updatedAt)}</div>` : ''}
        <div style="margin-top:8px;"><b>Tour:</b> ${r.tour_name || ''}</div>
        <div><b>Leader:</b> ${r.group_leader || ''}</div>
        <div><b>Building:</b> ${(r.building || '').trim()} &nbsp; <b>SH:</b> ${r.sh_no ?? ''}</div>
        <div><b>Check-in:</b> ${r.checkin_date || ''} ${r.checkin_time || ''}</div>
        <div><b>Check-out:</b> ${r.checkout_date || ''} ${r.checkout_time || ''}</div>
        <div style="margin-top:8px;"><b>Rooms:</b> ${rooms.join(', ') || '—'}</div>
        <div style="margin-top:8px;"><b>Gents rooms:</b> ${roomsG}</div>
        <div><b>Ladies rooms:</b> ${roomsL}</div>
        <div style="margin-top:8px;"><b>Totals:</b> Total ${r.total ?? ''} | Gents ${r.gents ?? ''} | Ladies ${r.ladies ?? ''} | Children ${r.children ?? ''} | Infants ${r.infants ?? ''}</div>
      `;
        }

        /* ---------------------------- Actions ---------------------------- */
        function selectedIds() {
            return Array.from(document.querySelectorAll('#tbl tbody input[type=checkbox]:checked'))
                .map(x => Number(x.dataset.id));
        }

        $('chkAll').addEventListener('change', () => {
            const on = $('chkAll').checked;
            document.querySelectorAll('#tbl tbody input[type=checkbox]').forEach(c => c.checked = on);
        });

        $('btnDeleteSel').addEventListener('click', async () => {
            if (readOnlyBlocked()) return;
            const ids = selectedIds();
            if (ids.length === 0) { alert('Select at least one slip to delete.'); return; }
            if (!confirm(`Delete ${ids.length} selected slip(s)? This cannot be undone.`)) return;
            let ok = 0, fail = 0;
            for (const id of ids) {
                try { await deleteRecord(id); ok++; } catch { fail++; }
            }
            $('status').textContent = `Deleted ${ok} slip(s). ${fail ? fail + ' failed.' : ''}`;
            await refresh();
        });

        $('btnDeleteAll').addEventListener('click', async () => {
            if (readOnlyBlocked()) return;
            const msg = prompt(`Type DELETE to erase ALL ${SITE} slips for every desk. No backsies.`);
            if (msg !== 'DELETE') return;
            try {
                const { deleted } = await clearAllRecords();
                await refresh();
                $('status').textContent = `Deleted ${deleted} ${SITE} slip(s).`;
            } catch (err) { alert(err.message); }
        });

        $('btnExport').addEventListener('click', async () => {
            const data = await getAllRecords();
            const blob = new Blob([JSON.stringify({ exportedAt: new Date().toISOString(), site: ctx.siteId, count: data.length, slips: data }, null, 2)], { type: 'application/json' });
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = `pms_slips_${ctx.siteId}_backup_${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
            document.body.appendChild(a); a.click(); a.remove();
        });

        $('btnImport').addEventListener('click', () => { if (!readOnlyBlocked()) $('fileImport').click(); });
        $('fileImport').addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            try {
                const text = await file.text();
                const json = JSON.parse(text);
                const slips = Array.isArray(json)
                    ? json
                    : (json.slips || json.db?.stores?.slips?.rows || []);
                if (!Array.isArray(slips) || !slips.length) { alert('No slips found in file.'); return; }
                // only this site's slips (by site field or building); the other site's are left out
                const mine = slips.filter(s => (s.site || siteOfBuilding(s.building) || ctx.siteId) === ctx.siteId);
                const other = slips.length - mine.length;
                if (!mine.length) { alert(`All ${slips.length} slip(s) in this file belong to the other site. Import them from that site.`); return; }
                const mode = confirm(`${mine.length} ${SITE} slip(s) to import${other ? ` (${other} of the other site will be left out)` : ''}.\n\nOK = Add to existing. Cancel = Replace all ${SITE} slips first.`);
                if (!mode) {
                    const msg = prompt(`Type REPLACE to delete ALL ${SITE} slips for every desk, then import.`);
                    if (msg !== 'REPLACE') return;
                    await clearAllRecords();
                }
                const res = await db.bulkWrite({ add: mine.map(({ id, _v, _seq, ...rest }) => ({ ...rest, site: ctx.siteId })) }, 'json-import');
                $('status').textContent = `Imported ${res.created} slip(s)${res.skipped ? `, ${res.skipped} already there` : ''}${other ? `, ${other} of the other site left out` : ''}.`;
                await refresh();
            } catch (err) {
                console.error(err);
                alert('Import failed: ' + (err.message || err));
            } finally {
                e.target.value = '';
            }
        });

        $('btnRefresh').addEventListener('click', refresh);
        $('btnPrint').addEventListener('click', () => window.print());
        ['q', 'roomq', 'bld', 'from', 'to'].forEach(id => $(id).addEventListener('input', renderTable));

        /* ------------------------------ Boot ------------------------------ */
        async function refresh() {
            CACHE = await getAllRecords();
            populateBuildings();
            renderTable();
            $('preview').classList.add('muted');
            $('preview').textContent = 'Select a row to preview its details. I’m not psychic.';
            $('status').textContent = `${CACHE.length} ${SITE} slip(s).${db.readonly ? ' ' + db.readonlyReason : ''}`;
        }

        refresh().catch(err => {
            console.error(err);
            $('status').textContent = 'Could not load slips: ' + (err.message || err);
        });

}
