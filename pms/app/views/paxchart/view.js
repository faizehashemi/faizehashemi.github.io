// Pax Counts Chart (Front desk): a year at a glance, month by day, for one city.
//   Pax Count   guests staying each night (counted at 22:00; a delayed group's rooms leave on their own — core/stay.js)
//   Pax Arrival guests checking in each day
// Show Actuals: only slips that have rooms assigned (actually allocated); otherwise every slip (registration data).

import { mirrorAll } from '../../core/cloud.js';
import { paxAt, slipStart, slipEnd } from '../../core/stay.js';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const pad = (n) => String(n).padStart(2, '0');
const num = (v) => { const x = Number(v); return Number.isFinite(x) ? x : 0; };
const hasRooms = (r) => ['gents', 'ladies'].some(s => (r.rooms?.[s] || []).some(x => String(x.room_no || '').trim()));
const guests = (r) => num(r.total) || (num(r.gents) + num(r.ladies) + num(r.children) + num(r.infants));
const LABEL = { makkah: 'MAKKAH', medina: 'MADINA' };

export default async function mount(ctx) {
    const $ = (id) => ctx.root.querySelector('#' + id);
    const now = new Date();
    const thisYear = now.getFullYear();
    $('pxYear').innerHTML = [thisYear - 1, thisYear, thisYear + 1].map(y => `<option ${y === thisYear ? 'selected' : ''}>${y}</option>`).join('');
    $('pxSite').value = ctx.siteId;

    function grid(values, year, arrivals) {
        const todayKey = now.getFullYear() === year ? `${now.getMonth()}-${now.getDate()}` : '';
        const head = `<tr><th class="px-m">Mth</th>${Array.from({ length: 31 }, (_, i) => `<th>${i + 1}</th>`).join('')}</tr>`;
        const body = MONTHS.map((m, mi) => {
            const days = new Date(year, mi + 1, 0).getDate();
            return `<tr><th class="px-m">${m}</th>${Array.from({ length: 31 }, (_, di) => {
                if (di >= days) return '<td class="invalid"></td>';
                const v = values[mi][di];
                const cls = [`${mi}-${di + 1}` === todayKey ? 'today' : '', arrivals && v ? 'arr' : ''].filter(Boolean).join(' ');
                return `<td class="${cls}">${v || '-'}</td>`;
            }).join('')}</tr>`;
        }).join('');
        return `<table class="px-tbl"><thead>${head}</thead><tbody>${body}</tbody></table>`;
    }

    async function run() {
        const year = Number($('pxYear').value), site = $('pxSite').value, actual = $('pxActual').checked;
        const slips = (await ctx.guard(mirrorAll())).filter(r => !r.deleted && r.site === site && (!actual || hasRooms(r)));
        const count = MONTHS.map(() => new Array(31).fill(0)), arr = MONTHS.map(() => new Array(31).fill(0));
        const y0 = new Date(year, 0, 1).getTime(), y1 = new Date(year + 1, 0, 1).getTime();
        for (const r of slips) {
            const ci = slipStart(r), co = slipEnd(r);
            if (!ci || !co || co <= ci) continue;
            const a = new Date(ci);
            if (ci >= y0 && ci < y1) arr[a.getMonth()][a.getDate() - 1] += guests(r);
            if (co <= y0 || ci >= y1) continue;
            // each night of the stay inside the year, counted at 22:00
            const d = new Date(Math.max(ci, y0)); d.setHours(22, 0, 0, 0);
            if (d.getTime() < ci) d.setDate(d.getDate() + 1);
            for (; d.getTime() < Math.min(co, y1); d.setDate(d.getDate() + 1)) {
                const p = paxAt(r, d.getTime()).total;
                if (p) count[d.getMonth()][d.getDate() - 1] += p;
            }
        }
        $('pxCount').innerHTML = grid(count, year, false);
        $('pxArr').innerHTML = grid(arr, year, true);
        $('pxCountCap').textContent = `Pax Count Chart for ${LABEL[site]} for the year ${year}`;
        $('pxArrCap').textContent = `Pax ARRIVAL Chart for ${LABEL[site]} for the year ${year}`;
        $('pxNote').innerHTML = actual
            ? 'Note:– Statistics below count only slips with <b>ROOMS ASSIGNED</b> (actual allocation). Guests are counted for each night they stay (at 22:00).'
            : 'Note:– All the Statistics mentioned below are based on <b>REGISTRATION INFORMATION</b> (every slip, including UMS imports) and <b>NOT</b> only on actual room allocation. Guests are counted for each night they stay (at 22:00).';
    }
    $('pxGo').addEventListener('click', () => run().catch(e => console.warn(e)));
    await run();
}
