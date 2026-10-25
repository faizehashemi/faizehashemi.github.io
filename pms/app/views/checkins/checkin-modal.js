// Check-in window: what really happened (arrival time, guests) against the slip. When it agrees, one button checks in.
// When it does not, the plain Check in is not offered: the window shows the change to the slip that makes it agree
// (before → after) and a single "Update slip & check in" that saves both in one versioned slip edit; if the change
// cannot be made (a room is taken, not enough beds …) it says why and nothing is saved.
// openCheckin({ slip, slips, capOf, db, by }) → Promise<boolean> (true when the check-in was saved)

import { checkinFit, commitCheckin, nowLocal, slipPax } from '../../core/checkin.js';

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const n0 = (v) => Math.max(0, parseInt(v, 10) || 0);

export function openCheckin({ slip, slips, capOf, db, by }) {
    return new Promise(resolve => {
        const dlg = document.createElement('dialog');
        dlg.className = 'ci-dlg';
        const now = nowLocal();
        const plan = `${String(slip.checkin_date || '').split('-').reverse().join('/')} ${slip.checkin_time || ''}`.trim();
        dlg.innerHTML = `
          <h2>Check in — SH ${esc(slip.sh_no)} <span class="ci-muted">${esc(slip.tour_name || '')}</span></h2>
          <p class="ci-muted">The slip says: arrives <b>${esc(plan)}</b>, <b>${slipPax(slip)}</b> guests. Enter what really happened.</p>
          <div class="ci-grid">
            <label>Arrived on<input type="date" id="ciDay" value="${now.slice(0, 10)}"></label>
            <label>at<input type="time" id="ciTime" value="${now.slice(11, 16)}"></label>
            <label>Gents<input type="number" min="0" id="ciG" value="${n0(slip.gents)}"></label>
            <label>Ladies<input type="number" min="0" id="ciL" value="${n0(slip.ladies)}"></label>
            <label>Children<input type="number" min="0" id="ciC" value="${n0(slip.children ?? slip.child)}"></label>
            <label>Infants<input type="number" min="0" id="ciI" value="${n0(slip.infants ?? slip.infant)}"></label>
          </div>
          <label class="ci-note">Note <input type="text" id="ciNote" maxlength="200" placeholder="optional"></label>
          <div id="ciFit" class="ci-fit"></div>
          <div class="ci-foot"><span class="ci-muted" id="ciMsg"></span><button type="button" class="ci-btn" data-x>Cancel</button><button type="button" class="ci-btn gold" id="ciGo"></button></div>`;
        document.body.appendChild(dlg);
        const $ = (id) => dlg.querySelector('#' + id);

        const actual = () => ({ at: `${$('ciDay').value}T${$('ciTime').value}`, gents: n0($('ciG').value), ladies: n0($('ciL').value), children: n0($('ciC').value), infants: n0($('ciI').value), note: $('ciNote').value });
        let fit = null, busy = false, done = false;
        const finish = (v) => { if (done) return; done = true; if (dlg.open) dlg.close(); dlg.remove(); resolve(v); };
        function draw() {
            fit = checkinFit(slip, actual(), { slips, capOf });
            const go = $('ciGo');
            if (fit.ok) {
                $('ciFit').innerHTML = '<p class="ci-ok">✓ This matches the slip.</p>';
                go.textContent = 'Check in'; go.disabled = false;
            } else {
                $('ciFit').innerHTML = `<p class="ci-warn">This does not match the slip. Check-in is saved together with this change to the slip:</p>
                  ${fit.changes.length ? `<ul class="ci-chg">${fit.changes.map(c => `<li><b>${esc(c.label)}</b> <s>${esc(c.from)}</s> → <b>${esc(c.to)}</b></li>`).join('')}</ul>` : ''}
                  ${fit.blockers.length ? `<ul class="ci-block">${fit.blockers.map(b => `<li>${esc(b)}</li>`).join('')}</ul>` : ''}`;
                go.textContent = 'Update slip & check in'; go.disabled = !!fit.blockers.length || !fit.changes.length;
            }
        }
        dlg.addEventListener('input', draw);
        dlg.addEventListener('click', async (e) => {
            if (e.target.closest('[data-x]')) { finish(false); return; }
            if (!e.target.closest('#ciGo') || busy || $('ciGo').disabled) return;
            busy = true; $('ciGo').disabled = true; $('ciMsg').textContent = 'Saving…';
            try {
                await commitCheckin(db, slip, actual(), fit, by);
                finish(true);
            } catch (err) { $('ciMsg').textContent = err.message || 'Could not save.'; busy = false; draw(); }
        });
        dlg.addEventListener('close', () => finish(false));      // Esc
        draw();
        dlg.showModal();
    });
}
