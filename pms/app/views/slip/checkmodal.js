// The Slip page's result window (instead of alert boxes): after "Check availability", Save, Edit or Save as a copy.
// OK rooms are summed up in one short list; every problem is shown in bold with what it means, what to do about it,
// and — when nothing else helps — a link that opens the Timeline on that room for this slip's stay.

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const pad = (n) => String(n).padStart(2, '0');
const localDT = (ms) => { const d = new Date(ms); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`; };
const when = (ms) => new Date(ms).toLocaleString(undefined, { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

/**
 * report: { title, tone: 'ok' | 'bad' | 'warn', lead, ok: [{ room, before, after, cap }], issues: [{ kind, room, … }],
 *           building, start, end, error }   timelineHref(params) → address of the Timeline page
 */
export function showSlipReport(report, timelineHref) {
    document.getElementById('slipReport')?.remove();
    const dlg = document.createElement('dialog');
    dlg.id = 'slipReport';
    const tl = (room) => timelineHref({ building: report.building, room, from: localDT(report.start - 864e5), to: localDT(report.end + 864e5) });
    const issue = (x) => {
        const link = x.room && report.building && report.start ? `<li>Still stuck? <a href="${esc(tl(x.room))}" target="_blank" rel="noopener">Open the Timeline for room ${esc(x.room)}</a>
            — it shows who is in that room around this stay (${esc(when(report.start))} → ${esc(when(report.end))}).</li>` : '';
        if (x.kind === 'blocked') {
            const free = Math.max(0, x.cap - x.existing);
            return `<li class="sr-issue"><b>Room ${esc(x.room)} is over its beds on ${esc(when(x.at))}: ${x.total}/${x.cap}.</b>
              <span>${x.who.length ? x.who.map(w => `SH ${esc(w.sh)} uses ${w.beds} bed${w.beds === 1 ? '' : 's'} (${esc(when(w.start))} → ${esc(when(w.end))})`).join('; ') + (x.who.length > 1 ? ` — ${x.existing} beds in all` : '') : `Other groups use ${x.existing} bed${x.existing === 1 ? '' : 's'}`}; this slip puts ${x.want} there.</span>
              <ul>
                <li>${free ? `Put at most <b>${free}</b> bed${free === 1 ? '' : 's'} in room ${esc(x.room)} — that is what is free then.` : `Room ${esc(x.room)} has <b>no free bed</b> then — move these guests to another room.`}</li>
                <li>Move some guests to another room: <b>Pick rooms…</b> shows the rooms with free beds for the whole stay.</li>
                <li>If ${x.who.length ? `SH ${esc(x.who.map(w => w.sh).join(', SH '))} has` : 'the other group has'} already left or leaves earlier, correct that slip's check-out first, then save this one.</li>
                <li>If the room really takes more beds, change its bed count in <b>Rooms &amp; Buildings</b>.</li>
                ${link}
              </ul></li>`;
        }
        if (x.kind === 'nocap') return `<li class="sr-issue"><b>Room ${esc(x.room)} has no bed count.</b>
              <ul><li>Type the room's beds in this row's <b>Capacity</b>, or add the room in <b>Rooms &amp; Buildings</b> — then save again.</li>${link}</ul></li>`;
        if (x.kind === 'badtime') return `<li class="sr-issue"><b>Room ${esc(x.room)}: its own check-out is before the check-in.</b>
              <ul><li>Fix that row's leave date (delayed departure) or remove the row, then save again.</li></ul></li>`;
        if (x.kind === 'window') return `<li class="sr-issue"><b>${x.missing?.length ? `Missing or wrong: ${esc(x.missing.join(', '))}.` : 'The building or the dates are missing.'}</b>
              <ul><li>Choose the building and fill in check-in and check-out — the check-out must be after the check-in.</li></ul></li>`;
        return `<li class="sr-issue"><b>${esc(x.text || 'Problem')}</b>${x.help ? `<ul>${x.help.map(h => `<li>${h}</li>`).join('')}</ul>` : ''}</li>`;
    };
    const okList = report.ok?.length ? `<details class="sr-ok" ${report.issues?.length ? '' : 'open'}><summary>✓ ${report.ok.length} room${report.ok.length === 1 ? '' : 's'} OK</summary>
        <p>${report.ok.map(o => `<span><b>${esc(o.room)}</b> ${o.before}/${o.cap} → ${o.after}/${o.cap}${o.after < o.cap ? ` · ${o.cap - o.after} free` : ' · full'}</span>`).join('')}</p></details>` : '';
    dlg.innerHTML = `
      <style>
        #slipReport { border: 0; border-radius: 16px; padding: 0; width: min(94vw, 680px); max-height: 86vh; box-shadow: 0 24px 70px rgba(0, 0, 0, .3); color: #2b1e15;
          font: 14px/1.5 system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif; }
        #slipReport::backdrop { background: rgba(43, 30, 21, .4); }
        #slipReport .sr-head { padding: 14px 18px; color: #fff; font-weight: 800; font-size: 16px; background: linear-gradient(135deg, #7a5410, #b8871d 55%, #d4af37); }
        #slipReport.bad .sr-head { background: linear-gradient(135deg, #8b1d12, #c0392b); }
        #slipReport.warn .sr-head { background: linear-gradient(135deg, #8a5a00, #d08a00); }
        #slipReport .sr-body { padding: 14px 18px; overflow: auto; max-height: calc(86vh - 120px); }
        #slipReport .sr-lead { margin: 0 0 10px; }
        #slipReport ol { margin: 0 0 10px; padding-left: 20px; display: grid; gap: 10px; }
        #slipReport .sr-issue > b { color: #a12a2a; }
        #slipReport .sr-issue > span { display: block; margin: 2px 0 4px; color: #4a3b2a; }
        #slipReport .sr-issue ul { margin: 4px 0 0; padding-left: 18px; }
        #slipReport .sr-issue li { margin: 2px 0; }
        #slipReport a { color: #9a7414; font-weight: 700; }
        #slipReport .sr-ok summary { cursor: pointer; font-weight: 700; color: #1f6f43; }
        #slipReport .sr-ok p { display: flex; flex-wrap: wrap; gap: 6px; margin: 8px 0 0; }
        #slipReport .sr-ok span { padding: 2px 9px; border-radius: 999px; background: #e3f4ea; color: #1f4d33; font-size: 12.5px; }
        #slipReport .sr-foot { padding: 10px 18px 14px; display: flex; justify-content: flex-end; gap: 8px; }
        #slipReport .sr-foot button { font: inherit; font-weight: 800; padding: 8px 18px; border-radius: 999px; border: 0; background: #9a7414; color: #fff; cursor: pointer; }
      </style>
      <div class="sr-head">${esc(report.title)}</div>
      <div class="sr-body">
        ${report.lead ? `<p class="sr-lead">${report.lead}</p>` : ''}
        ${report.issues?.length ? `<ol>${report.issues.map(issue).join('')}</ol>` : ''}
        ${okList}
      </div>
      <div class="sr-foot"><button type="button" autofocus>OK</button></div>`;
    dlg.className = report.tone || 'ok';
    document.body.appendChild(dlg);
    dlg.querySelector('.sr-foot button').addEventListener('click', () => dlg.close());
    dlg.addEventListener('close', () => dlg.remove());
    dlg.showModal();
}
