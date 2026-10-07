// Building planner (Forecast page): which building should each upcoming group without one get, so the
// buildings fill in the order the desk prefers?
//
//   Goal     the desk orders the buildings (most wanted full first) and may cap each at a target % of its beds.
//   Data     every slip of this site. Slips with a building are fixed (their rooms' assigned beds, or the group's
//            beds when no rooms are set yet). Groups with no building whose stay overlaps the horizon are placed.
//   Beds     a group needs gents + ladies + children beds (infants none); groups are never split.
//   Method   many placement orders (arrival, biggest first, longest stay first, … and random mixes): each places
//            groups one by one into the most wanted building with room for the WHOLE stay (bed use is checked
//            at every change of occupancy, so no bed is counted twice). The best plans are then improved by moving
//            groups up to more wanted buildings and by making room for unplaced groups (move one group out).
//   Score    fewest unplaced groups, then fewest unplaced beds, then the most bed-nights in building 1, then 2, …
//   Apply    writes only the building onto the slips ticked (rooms are then picked as usual).

import { buildingsOfSite, totalBeds, loadBuildings } from '../../core/rooms.js';
import { recordApply } from './alloclog.js';

const DAY = 864e5, HOUR = 36e5;
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const num = (v) => { const x = Number(v); return Number.isFinite(x) ? x : 0; };
const parseDT = (d, t) => { if (!d) return null; const v = new Date(`${d}T${t && t.length ? t : '00:00'}`); return isNaN(v) ? null : v.getTime(); };
const bedsOf = (r) => (num(r.gents) + num(r.ladies) + num(r.children)) || num(r.total);
const roomBeds = (r) => ['gents', 'ladies'].reduce((n, s) => n + (r.rooms?.[s] || []).reduce((m, x) => m + (x.assigned !== '' && x.assigned != null ? num(x.assigned) : num(x.capacity)), 0), 0);
const fmtD = (t) => new Date(t).toLocaleDateString(undefined, { day: '2-digit', month: 'short' });
const fmtDT = (t) => new Date(t).toLocaleString(undefined, { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
const pause = () => new Promise(r => setTimeout(r, 0));

/** @param {{ ctx: object, host: Element }} o */
export function mountPlanner({ ctx, host }) {
    const site = ctx.siteId;
    const PREF_KEY = `pms_planner:${site}`;
    let prefs = (() => { try { return JSON.parse(localStorage.getItem(PREF_KEY) || 'null') || {}; } catch { return {}; } })();
    const savePrefs = () => { try { localStorage.setItem(PREF_KEY, JSON.stringify(prefs)); } catch { } };
    prefs = { order: [], off: [], target: {}, horizon: 14, ...prefs };

    host.innerHTML = `
      <div class="pl-head">
        <div><h2>🏨 Building planner</h2>
          <p>Put the buildings in the order you want them filled. The planner reads every upcoming slip without a building, tries many orders of placing them, and suggests a building for each group.</p></div>
      </div>
      <div class="pl-setup">
        <div class="pl-prio">
          <div class="pl-sub">Most wanted full → least <span class="pl-hint">drag or use ▲▼ · untick to leave a building out · target = most of its beds to fill</span></div>
          <ol id="plPrio"></ol>
        </div>
        <div class="pl-run">
          <label>Plan for the next
            <select id="plHorizon"><option value="7">7 days</option><option value="14">14 days</option><option value="30">30 days</option><option value="60">60 days</option></select></label>
          <button type="button" id="plGo" class="pl-btn primary">▶ Suggest buildings</button>
          <span id="plStatus" class="pl-hint"></span>
        </div>
      </div>
      <div id="plOut"></div>`;
    const $ = (id) => host.querySelector('#' + id);
    $('plHorizon').value = String(prefs.horizon);

    /* ------------------------------ priority list ------------------------------ */
    let blds = [], ALL = [];
    async function syncBuildings() {
        ALL = await ctx.guard(loadBuildings({ force: true })); // the latest Rooms & Buildings
        blds = buildingsOfSite(ALL, site).filter(b => totalBeds(b) > 0).map(b => ({ name: b.name, beds: totalBeds(b) }));
        const known = blds.map(b => b.name);
        prefs.order = [...prefs.order.filter(n => known.includes(n)), ...known.filter(n => !prefs.order.includes(n))];
        drawPrio();
    }
    function drawPrio() {
        $('plPrio').innerHTML = prefs.order.length ? prefs.order.map((n, i) => {
            const b = blds.find(x => x.name === n);
            const on = !prefs.off.includes(n);
            return `<li draggable="true" data-b="${esc(n)}" class="${on ? '' : 'off'}">
              <span class="pl-rank">${i + 1}</span>
              <label class="pl-on"><input type="checkbox" data-on ${on ? 'checked' : ''}> <b>${esc(n)}</b></label>
              <span class="pl-beds">${b ? b.beds : 0} beds</span>
              <label class="pl-target">target <input type="number" data-target min="10" max="100" step="5" value="${num(prefs.target[n]) || 100}">%</label>
              <span class="pl-move"><button type="button" data-up aria-label="Move ${esc(n)} up" ${i === 0 ? 'disabled' : ''}>▲</button><button type="button" data-down aria-label="Move ${esc(n)} down" ${i === prefs.order.length - 1 ? 'disabled' : ''}>▼</button></span>
            </li>`;
        }).join('') : '<li class="pl-empty">No buildings with beds — add rooms in Rooms &amp; Buildings.</li>';
    }
    const move = (from, to) => { const [x] = prefs.order.splice(from, 1); prefs.order.splice(to, 0, x); savePrefs(); drawPrio(); };
    $('plPrio').addEventListener('click', (e) => {
        const li = e.target.closest('li[data-b]'); if (!li) return;
        const i = prefs.order.indexOf(li.dataset.b);
        if (e.target.closest('[data-up]') && i > 0) move(i, i - 1);
        if (e.target.closest('[data-down]') && i < prefs.order.length - 1) move(i, i + 1);
    });
    $('plPrio').addEventListener('change', (e) => {
        const li = e.target.closest('li[data-b]'); if (!li) return;
        const n = li.dataset.b;
        if (e.target.matches('[data-on]')) { prefs.off = e.target.checked ? prefs.off.filter(x => x !== n) : [...prefs.off, n]; li.classList.toggle('off', !e.target.checked); }
        if (e.target.matches('[data-target]')) prefs.target[n] = Math.max(10, Math.min(100, num(e.target.value) || 100));
        savePrefs();
    });
    let dragFrom = null;
    $('plPrio').addEventListener('dragstart', (e) => { const li = e.target.closest('li[data-b]'); if (li) { dragFrom = prefs.order.indexOf(li.dataset.b); li.classList.add('drag'); } });
    $('plPrio').addEventListener('dragend', (e) => { e.target.closest('li')?.classList.remove('drag'); });
    $('plPrio').addEventListener('dragover', (e) => e.preventDefault());
    $('plPrio').addEventListener('drop', (e) => {
        e.preventDefault();
        const li = e.target.closest('li[data-b]');
        if (li && dragFrom != null) move(dragFrom, prefs.order.indexOf(li.dataset.b));
        dragFrom = null;
    });
    $('plHorizon').addEventListener('change', () => { prefs.horizon = num($('plHorizon').value) || 14; savePrefs(); });

    /* --------------------------------- model --------------------------------- */
    function buildModel(slips) {
        const now = Date.now(), end = now + prefs.horizon * DAY;
        const prio = prefs.order.filter(n => !prefs.off.includes(n) && blds.some(b => b.name === n));
        const capOf = Object.fromEntries(blds.map(b => [b.name, Math.floor(b.beds * (num(prefs.target[b.name]) || 100) / 100)]));
        const fixed = [], groups = [];
        for (const r of slips) {
            if (r.deleted) continue;
            const ci = parseDT(r.checkin_date, r.checkin_time), co = parseDT(r.checkout_date, r.checkout_time);
            if (!ci || !co || co <= ci || co <= now || ci >= end) continue;
            const b = String(r.building || '').trim().toUpperCase();
            const from = Math.max(ci, now), to = Math.min(co, end);
            if (b) { if (capOf[b] != null) fixed.push({ b, from, to, beds: roomBeds(r) || bedsOf(r) }); }
            else if (bedsOf(r) > 0) groups.push({ r, ci, co, from, to, beds: bedsOf(r) });
        }
        // time slots: every moment occupancy can change
        const cuts = [...new Set([now, end, ...fixed.flatMap(f => [f.from, f.to]), ...groups.flatMap(g => [g.from, g.to])])].sort((a, b) => a - b);
        const idx = (t) => { let lo = 0, hi = cuts.length - 1; while (lo < hi) { const m = (lo + hi) >> 1; if (cuts[m] < t) lo = m + 1; else hi = m; } return lo; };
        const S = cuts.length - 1;
        const len = Array.from({ length: S }, (_, k) => cuts[k + 1] - cuts[k]);
        const base = Object.fromEntries(blds.map(b => [b.name, new Float64Array(S)]));
        for (const f of fixed) for (let k = idx(f.from); k < idx(f.to); k++) base[f.b][k] += f.beds;
        groups.forEach((g, i) => { g.i = i; g.k0 = idx(g.from); g.k1 = idx(g.to); g.hours = (g.to - g.from) / HOUR; });
        return { now, end, prio, capOf, groups, cuts, S, len, base, fixedCount: fixed.length };
    }

    // one plan from one placement order (array of group indices)
    function place(M, order) {
        const occ = Object.fromEntries(Object.entries(M.base).map(([b, a]) => [b, Float64Array.from(a)]));
        const at = new Array(M.groups.length).fill(null);
        const fits = (g, b) => { const o = occ[b], cap = M.capOf[b]; for (let k = g.k0; k < g.k1; k++) if (o[k] + g.beds > cap) return false; return true; };
        const put = (g, b, sign = 1) => { const o = occ[b]; for (let k = g.k0; k < g.k1; k++) o[k] += sign * g.beds; };
        for (const i of order) {
            const g = M.groups[i];
            for (const b of M.prio) if (fits(g, b)) { put(g, b); at[i] = b; break; }
        }
        return { at, occ, fits, put };
    }

    // better plans: move groups up to more wanted buildings, and make room for unplaced ones
    function improve(M, P) {
        const rank = Object.fromEntries(M.prio.map((b, i) => [b, i]));
        for (let round = 0; round < 3; round++) {
            let changed = false;
            for (const g of M.groups) {
                const cur = P.at[g.i];
                if (cur == null) continue;
                for (const b of M.prio) {
                    if (rank[b] >= rank[cur]) break;
                    if (P.fits(g, b)) { P.put(g, cur, -1); P.put(g, b); P.at[g.i] = b; changed = true; break; }
                }
            }
            let tries = 0;
            for (const u of M.groups) {
                if (P.at[u.i] != null) continue;
                if (++tries > 80) break; // keep it quick when many are left over
                done: for (const b of M.prio) {
                    // one group in b that overlaps u, can go elsewhere, and leaves room for u
                    for (const v of M.groups) {
                        if (P.at[v.i] !== b || v.k1 <= u.k0 || u.k1 <= v.k0) continue;
                        P.put(v, b, -1);
                        if (P.fits(u, b)) {
                            P.put(u, b);
                            const alt = M.prio.find(x => x !== b && P.fits(v, x));
                            if (alt) { P.put(v, alt); P.at[v.i] = alt; P.at[u.i] = b; changed = true; break done; }
                            P.put(u, b, -1);
                        }
                        P.put(v, b);
                    }
                }
            }
            if (!changed) break;
        }
        return P;
    }

    function score(M, P) {
        let unplaced = 0, unBeds = 0;
        const bedHours = Object.fromEntries(M.prio.map(b => [b, 0]));
        for (const g of M.groups) {
            const b = P.at[g.i];
            if (b == null) { unplaced++; unBeds += g.beds; } else bedHours[b] += g.beds * g.hours;
        }
        return [unplaced, unBeds, ...M.prio.map(b => -Math.round(bedHours[b]))];
    }
    const better = (a, b) => { for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return a[i] < b[i]; return false; };

    async function plan() {
        await syncBuildings();
        const M = buildModel(await ctx.guard(ctx.db.all()));
        if (!M.prio.length) { $('plOut').innerHTML = '<p class="pl-msg">Tick at least one building.</p>'; return; }
        if (!M.groups.length) { $('plOut').innerHTML = `<p class="pl-msg">Every group staying in the next ${prefs.horizon} days already has a building. Nothing to plan.</p>`; return; }
        const G = M.groups, ids = G.map(g => g.i);
        const by = (f) => [...ids].sort((a, b) => f(G[a], G[b]) || G[a].ci - G[b].ci);
        const orders = [
            ['Arrival order', by((a, b) => a.ci - b.ci)],
            ['Biggest groups first', by((a, b) => b.beds - a.beds)],
            ['Longest stays first', by((a, b) => (b.to - b.from) - (a.to - a.from))],
            ['Most bed-nights first', by((a, b) => b.beds * b.hours - a.beds * a.hours)],
            ['Shortest stays first', by((a, b) => (a.to - a.from) - (b.to - b.from))],
            ['Departure order', by((a, b) => a.co - b.co)],
        ];
        const RANDOM = 240;
        for (let n = 1; n <= RANDOM; n++) {
            const o = [...ids];
            for (let i = o.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [o[i], o[j]] = [o[j], o[i]]; }
            orders.push([`Mixed order ${n}`, o]);
        }
        const tried = [];
        for (let i = 0; i < orders.length; i++) {
            const P = place(M, orders[i][1]);
            tried.push({ name: orders[i][0], P, s: score(M, P) });
            if (i % 20 === 0) { $('plStatus').textContent = `Trying orders… ${i + 1} / ${orders.length}`; await pause(); }
        }
        // improve the six named orders and the ten best mixes, then keep the three best different plans
        const named = tried.slice(0, 6);
        const mixes = tried.slice(6).sort((a, b) => better(a.s, b.s) ? -1 : better(b.s, a.s) ? 1 : 0).slice(0, 10);
        const finalists = [];
        for (const t of [...named, ...mixes]) {
            improve(M, t.P); t.s = score(M, t.P);
            finalists.push(t);
            $('plStatus').textContent = `Improving the best plans… ${finalists.length} / 16`; await pause();
        }
        finalists.sort((a, b) => better(a.s, b.s) ? -1 : better(b.s, a.s) ? 1 : 0);
        const seen = new Set(), top = [];
        for (const t of finalists) { const sig = t.P.at.join('|'); if (seen.has(sig)) continue; seen.add(sig); top.push(t); if (top.length === 3) break; }
        $('plStatus').textContent = `${orders.length} orders tried · ${G.length} group${G.length === 1 ? '' : 's'} to place · ${M.fixedCount} stay${M.fixedCount === 1 ? '' : 's'} already in a building`;
        LAST = { M, top };
        render(0);
    }
    let LAST = null;

    /* -------------------------------- results -------------------------------- */
    function stats(M, P) {
        const hours = (M.end - M.now) / HOUR;
        return M.prio.map(b => {
            const o = P.occ[b], beds = blds.find(x => x.name === b).beds;
            let bh = 0, peak = 0;
            for (let k = 0; k < M.S; k++) { bh += o[k] * M.len[k] / HOUR; if (o[k] > peak) peak = o[k]; }
            const added = M.groups.filter(g => P.at[g.i] === b);
            return { b, beds, avg: Math.round(100 * bh / (beds * hours)), peak: Math.round(100 * peak / beds), groups: added.length, addBeds: added.reduce((n, g) => n + g.beds, 0) };
        });
    }
    function reasonFor(M, P, g) {
        const b = P.at[g.i];
        const full = (x) => { const o = P.occ[x], cap = M.capOf[x]; for (let k = g.k0; k < g.k1; k++) if (o[k] + g.beds > cap + (x === b ? g.beds : 0)) return M.cuts[k]; return null; };
        const higher = b == null ? M.prio : M.prio.slice(0, M.prio.indexOf(b));
        if (b != null && !higher.length) return '1st choice';
        const why = higher.map(x => { const t = full(x); return t ? `${x} full ${fmtD(t)}` : null; }).filter(Boolean);
        return why.length ? why.join(' · ') : (b == null ? 'no building has room' : '');
    }
    function heat(M, P) {
        const days = [];
        for (let d = new Date(M.now); d.getTime() < M.end; d.setDate(d.getDate() + 1)) {
            const s = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
            days.push([Math.max(s, M.now), Math.min(s + DAY, M.end)]);
        }
        const peakIn = (b, a, z) => { let p = 0; for (let k = 0; k < M.S; k++) if (M.cuts[k] < z && M.cuts[k + 1] > a) p = Math.max(p, P.occ[b][k]); return p; };
        return `<div class="pl-heat-wrap"><table class="pl-heat"><thead><tr><th></th>${days.map(([a]) => `<th>${new Date(a).toLocaleDateString(undefined, { day: '2-digit', month: 'short' }).replace(' ', '<br>')}</th>`).join('')}</tr></thead>
          <tbody>${M.prio.map(b => {
              const beds = blds.find(x => x.name === b).beds;
              return `<tr><th>${esc(b)}</th>${days.map(([a, z]) => { const p = Math.round(100 * peakIn(b, a, z) / beds); return `<td style="--p:${Math.min(100, p)}" title="${esc(b)} ${fmtD(a)}: busiest ${p}%">${p}</td>`; }).join('')}</tr>`;
          }).join('')}</tbody></table></div>`;
    }
    function render(which) {
        const { M, top } = LAST;
        const T = top[which], P = T.P;
        const unplaced = M.groups.filter(g => P.at[g.i] == null);
        const rows = [...M.groups].sort((a, b) => a.ci - b.ci);
        $('plOut').innerHTML = `
          <div class="pl-plans">${top.map((t, i) => {
              const s = stats(M, t.P), un = M.groups.filter(g => t.P.at[g.i] == null).length;
              return `<button type="button" class="pl-plan${i === which ? ' on' : ''}" data-plan="${i}">
                <span class="pl-plan-h">Plan ${'ABC'[i]} <small>${esc(t.name)}</small></span>
                <span class="${un ? 'pl-bad' : 'pl-ok'}">${un ? `${un} group${un === 1 ? '' : 's'} left without a building` : 'Every group placed'}</span>
                ${s.map(x => `<span class="pl-bar"><b>${esc(x.b)}</b><i style="--w:${Math.min(100, x.avg)}%"></i><em>${x.avg}% avg · ${x.peak}% peak</em></span>`).join('')}
              </button>`;
          }).join('')}</div>
          <h3>Plan ${'ABC'[which]} — busiest moment each day (% of beds)</h3>
          ${heat(M, P)}
          <div class="pl-table-head">
            <h3>Suggested building per group <span class="pl-hint">${M.groups.length - unplaced.length} placed${unplaced.length ? ` · ${unplaced.length} not placed` : ''}</span></h3>
            ${ctx.db.readonly ? '' : `<div class="pl-apply"><label><input type="checkbox" id="plAll" checked> all</label><button type="button" id="plApply" class="pl-btn primary">Write building on ticked slips</button></div>`}
          </div>
          <div class="pl-table-wrap"><table class="pl-table">
            <thead><tr>${ctx.db.readonly ? '' : '<th></th>'}<th>SH</th><th>Group</th><th>Stay</th><th class="n">Beds</th><th>Building</th><th>Why</th></tr></thead>
            <tbody>${rows.map(g => {
                const b = P.at[g.i], r = g.r;
                return `<tr class="${b ? '' : 'un'}">${ctx.db.readonly ? '' : `<td><input type="checkbox" data-pick="${g.i}" ${b ? 'checked' : 'disabled'}></td>`}
                  <td class="sh">${esc(r.sh_no ?? '')}</td>
                  <td><b>${esc(r.tour_name || '-')}</b><small>${esc(String(r.group_leader ?? '').trim() || '-')}</small></td>
                  <td class="stay">${esc(fmtDT(g.ci))}<small>→ ${esc(fmtDT(g.co))}</small></td>
                  <td class="n">${g.beds}</td>
                  <td>${b ? `<span class="pl-b r${M.prio.indexOf(b)}">${esc(b)}</span>` : '<span class="pl-b none">none</span>'}</td>
                  <td class="why">${esc(reasonFor(M, P, g))}</td></tr>`;
            }).join('')}</tbody></table></div>`;
    }
    $('plOut').addEventListener('click', async (e) => {
        const p = e.target.closest('[data-plan]');
        if (p) { render(Number(p.dataset.plan)); return; }
        if (e.target.closest('#plApply')) apply();
    });
    $('plOut').addEventListener('change', (e) => {
        if (e.target.id === 'plAll') host.querySelectorAll('[data-pick]:not(:disabled)').forEach(c => { c.checked = e.target.checked; });
    });

    async function apply() {
        const { M, top } = LAST;
        const which = Number(host.querySelector('.pl-plan.on')?.dataset.plan || 0);
        const P = top[which].P;
        const picks = [...host.querySelectorAll('[data-pick]:checked')].map(c => M.groups[Number(c.dataset.pick)]).filter(g => P.at[g.i]);
        if (!picks.length) { alert('Tick the groups to give a building first.'); return; }
        const count = {}; for (const g of picks) count[P.at[g.i]] = (count[P.at[g.i]] || 0) + 1;
        if (!confirm(`Write the building onto ${picks.length} slip${picks.length === 1 ? '' : 's'}?\n\n${Object.entries(count).map(([b, n]) => `${b}: ${n}`).join('\n')}\n\nOnly the building is set; rooms are picked on the Slip page as usual.`)) return;
        const btn = $('plApply'); btn.disabled = true; btn.textContent = 'Writing…';
        try {
            const current = new Map((await ctx.db.all()).map(r => [r.id, r]));
            const put = picks.map(g => current.get(g.r.id)).filter(r => r && !String(r.building || '').trim()).map(r => ({ ...r, building: P.at[M.groups.find(g => g.r.id === r.id).i] }));
            const res = await ctx.guard(ctx.db.bulkWrite({ put }, 'planner'));
            await recordApply(ctx, 'planner', `Building for ${put.length} group${put.length === 1 ? '' : 's'} (next ${prefs.horizon} days)`, put.map(p => [current.get(p.id), p]));
            $('plStatus').textContent = `Building written on ${res.updated} slip${res.updated === 1 ? '' : 's'}${put.length < picks.length ? ` (${picks.length - put.length} already had one)` : ''}.`;
            await plan();
        } catch (err) {
            alert(err.message || String(err));
            btn.disabled = false; btn.textContent = 'Write building on ticked slips';
        }
    }

    $('plGo').addEventListener('click', async () => {
        $('plGo').disabled = true;
        try { await plan(); } catch (e) { console.error(e); $('plStatus').textContent = e.message || String(e); }
        finally { $('plGo').disabled = false; }
    });
    syncBuildings().catch(e => console.warn('planner buildings', e));
    window.addEventListener('pms:alloc-undone', () => { if (LAST) plan().catch(() => { }); });
    return {
        refresh: syncBuildings,
        buildings: () => ALL,
        /** wanted buildings, most wanted first, each with its bed cap (target %) */
        priority: () => prefs.order.filter(n => !prefs.off.includes(n) && blds.some(b => b.name === n))
            .map(n => ({ name: n, cap: Math.floor(blds.find(b => b.name === n).beds * (num(prefs.target[n]) || 100) / 100) })),
        /** the building the plan on screen suggests for a slip (null: none / no plan yet) */
        suggestion: (id) => {
            if (!LAST) return null;
            const which = Number(host.querySelector('.pl-plan.on')?.dataset.plan || 0);
            const g = LAST.M.groups.find(x => x.r.id === id);
            return g ? LAST.top[which].P.at[g.i] : null;
        },
    };
}
