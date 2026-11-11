// KG page → Export summary (Makkah): the day's four lists for the duty desk, each group with its name, leader, total pax and "(Second Umrah)" where its SH has the S.
//   Aaje Dupehre Atraaf   the groups on today's MAKKAH-MAKKAH ATRAAF trips (Transport day); none planned → yesterday's check-ins
//   Aaje Dupehre Wada Sabaq   today's departures from Makkah to Madina, and to the airport for groups whose first arrival was Madina
//                         (a group that came to Makkah first had its Wada Sabaq before its Makkah → Madina trip) — and the groups in both lists (timings clash)
//   Aaje Raate Haram      check-ins today from the morning cut-off to the night cut-off (Setup → Fakkul Ehraam windows: split → night_to)
//   Kaale Fajare Haram    check-ins from tonight's cut-off to tomorrow's morning cut-off (night_to today → split tomorrow)
// Second Umrah groups come first in the Haram lists.

type Row = Record<string, any>;
export type Item = { sh: string; group: string; leader: string; pax: number; second: boolean };
export type Section = { id: string; title: string; note: string; items: Item[] };
export type Windows = { morning_from: string; split: string; night_to: string };

const pad = (n: number) => String(n).padStart(2, '0');
const ymd = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const plus = (day: string, n: number) => { const d = new Date(`${day}T12:00`); d.setDate(d.getDate() + n); return ymd(d); };
const at = (day: string, hm: string) => new Date(`${day}T${hm || '00:00'}`).getTime();
const when = (date?: string, time?: string) => (date ? new Date(`${date}T${time || '00:00'}`).getTime() : NaN);
const isSecond = (sh: unknown) => /^S\d/i.test(String(sh ?? '').trim());
const pax = (s: Row) => Number(s.total) || (Number(s.gents) || 0) + (Number(s.ladies) || 0) + (Number(s.children) || 0) + (Number(s.infants) || 0);
const item = (s: Row): Item => ({ sh: String(s.sh_no ?? ''), group: String(s.tour_name || '').trim() || `SH ${s.sh_no ?? ''}`, leader: String(s.group_leader ?? '').trim(), pax: pax(s), second: isSecond(s.sh_no) });
const bySecondThenTime = (k: 'checkin' | 'checkout') => (a: Row, b: Row) => Number(isSecond(b.sh_no)) - Number(isSecond(a.sh_no)) || when(a[`${k}_date`], a[`${k}_time`]) - when(b[`${k}_date`], b[`${k}_time`]);

/**
 * @param slips  this site's slips · @param trips  today's Transport day rows, resolved (a group riding on another's bus carries that bus's route)
 * @param baseSh UMS SH without the S (core/ums.js baseSh)
 */
export function kgSummary(slips: Row[], trips: Row[], day: string, win: Windows, baseSh: (s: unknown) => string): Section[] {
    const live = slips.filter(s => !s.deleted);
    // the slip of a trip: same SH, and the stay that is on that day (a group's second Makkah stay is S…)
    const slipOf = (ref: unknown) => {
        const k = baseSh(ref);
        const c = live.filter(s => baseSh(s.sh_no) === k);
        return c.find(s => String(s.checkin_date) <= day && day <= String(s.checkout_date)) || c[0];
    };
    const fromTrip = (t: Row): Item => { const s = slipOf(t.ref); return s ? item(s) : { sh: String(t.ref ?? ''), group: String(t.operator || '').trim() || `SH ${t.ref ?? ''}`, leader: String(t.leader || '').trim(), pax: Number(t.pax) || 0, second: false }; };
    const uniq = (list: Item[]) => list.filter((x, i) => list.findIndex(y => baseSh(y.sh) === baseSh(x.sh) && y.second === x.second) === i);

    // 1. Atraaf
    const atraafTrips = trips.filter(t => /ATRAAF/i.test(String(t.route || '')) && String(t.ref || '').trim());
    const atraaf: Section = atraafTrips.length
        ? { id: 'atraaf', title: 'Aaje Dupehre Atraaf', note: 'Atraaf trips on the Transport day', items: uniq(atraafTrips.map(fromTrip)) }
        : { id: 'atraaf', title: 'Aaje Dupehre Atraaf', note: `No Atraaf trip on the Transport day — yesterday's arrivals (${plus(day, -1).split('-').reverse().join('/')})`, items: uniq(live.filter(s => s.checkin_date === plus(day, -1)).sort(bySecondThenTime('checkin')).map(item)) };

    // 2. Wada Sabaq: where each group leaving today goes — its Transport day trip, else the slip's To, else (UMS) the last stay goes to the airport
    const tripOf = (s: Row) => trips.find(t => baseSh(t.ref) === baseSh(s.sh_no) && !/ATRAAF|ZIYARAT/i.test(String(t.route || '')));
    const destOf = (s: Row): 'madina' | 'airport' | '' => {
        const r = String(tripOf(s)?.route || '').toUpperCase();
        if (/AIRPORT/.test(r)) return 'airport';
        if (/MADINA|MEDINA/.test(r)) return 'madina';
        const to = String(s.to_place || '').toUpperCase();
        if (/AIRPORT/.test(to)) return 'airport';
        if (/MADINA|MEDINA/.test(to)) return 'madina';
        return '';
    };
    const leaving = live.filter(s => s.checkout_date === day);
    const wada = leaving.filter(s => { const d = destOf(s); return d === 'madina' || (d === 'airport' && String(s.ums?.firstArrival || '').toUpperCase() === 'MADINA'); }).sort(bySecondThenTime('checkout'));
    const wadaSec: Section = { id: 'wada', title: 'Aaje Dupehre Wada Sabaq', note: 'Leaving Makkah today for Madina, or for the airport when their first arrival was Madina', items: uniq(wada.map(item)) };
    const inWada = new Set(wadaSec.items.map(x => baseSh(x.sh)));
    const clash: Section = { id: 'clash', title: 'Atraaf and Wada Sabaq clash', note: 'In both lists today — the timings clash', items: atraaf.items.filter(x => inWada.has(baseSh(x.sh))) };

    // 3–4. Haram: check-ins between the cut-offs
    const ins = (a: number, b: number) => uniq(live.filter(s => { const t = when(s.checkin_date, s.checkin_time); return t >= a && t < b; }).sort(bySecondThenTime('checkin')).map(item));
    const raate: Section = { id: 'raate', title: 'Aaje Raate Haram', note: `Check-ins today ${win.split} – ${win.night_to}`, items: ins(at(day, win.split), at(day, win.night_to)) };
    const fajr: Section = { id: 'fajr', title: 'Kaale Fajare Haram', note: `Check-ins ${win.night_to} today – ${win.split} tomorrow`, items: ins(at(day, win.night_to), at(plus(day, 1), win.split)) };
    return [atraaf, wadaSec, clash, raate, fajr];
}

const esc = (v: unknown) => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
export const groupName = (x: Item) => `${x.group}${x.second ? ' (Second Umrah)' : ''}`;
const dmy = (day: string) => day.split('-').reverse().join('/');

/** One table per section: caption row, then #, Group, Leader, Pax, and a total */
export function sectionTable(s: Section, inline = false) {
    const th = inline ? ' style="border:1px solid #999;background:#efe4c4;padding:4px 6px"' : '', td = inline ? ' style="border:1px solid #999;padding:4px 6px"' : '';
    const rows = s.items.map((x, i) => `<tr><td${td}>${i + 1}</td><td${td}>${esc(groupName(x))}</td><td${td}>${esc(x.leader || '—')}</td><td${td} align="center">${x.pax}</td></tr>`).join('');
    const total = s.items.reduce((n, x) => n + x.pax, 0);
    return `<table class="kgs" border="1" cellspacing="0" cellpadding="4" style="border-collapse:collapse;width:100%;margin:0 0 14px"><thead>
<tr><th colspan="4"${th} align="left">${esc(s.title)} — ${s.items.length} group${s.items.length === 1 ? '' : 's'}, ${total} pax<br><small style="font-weight:400">${esc(s.note)}</small></th></tr>
<tr><th${th}>#</th><th${th}>Group</th><th${th}>Leader</th><th${th}>Total pax</th></tr></thead>
<tbody>${rows || `<tr><td colspan="4"${td}>None</td></tr>`}</tbody>${s.items.length ? `<tfoot><tr><td colspan="3"${td}><b>Total</b></td><td${td} align="center"><b>${total}</b></td></tr></tfoot>` : ''}</table>`;
}

/** The whole summary as a document (print → PDF, Word .doc, Excel .xls share it) */
export function summaryDoc(sections: Section[], day: string, site: string, kind: 'print' | 'word' | 'excel') {
    const head = kind === 'excel' ? '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">'
        : kind === 'word' ? '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">' : '<!doctype html><html>';
    const css = `body{font:11pt Arial,Helvetica,sans-serif;color:#111;margin:${kind === 'print' ? '0' : '12px'}} h1{font-size:16pt;margin:0 0 2px;color:#4a3708} p.sub{margin:0 0 12px;color:#555}
table.kgs{border-collapse:collapse;width:100%;margin:0 0 14px;break-inside:auto} table.kgs th,table.kgs td{border:1px solid #999;padding:4px 6px;text-align:left} table.kgs thead tr:first-child th{background:#4a3708;color:#fff;font-size:12pt}
table.kgs thead tr+tr th{background:#efe4c4} table.kgs td:first-child,table.kgs th:first-child{width:28px;text-align:center} table.kgs td:last-child,table.kgs th:last-child{width:70px;text-align:center} tr{break-inside:avoid}
@page{size:A4 portrait;margin:12mm} .bar{position:sticky;top:0;padding:8px 12px;background:#fffaf1;border-bottom:1px solid #dcc7a4;font:13px system-ui} .bar button{font:inherit;padding:5px 14px;border:1px solid #b08d2a;border-radius:8px;background:#b08d2a;color:#fff;font-weight:700;cursor:pointer}
@media print{.bar{display:none}} @media screen{.page{max-width:190mm;margin:10px auto}}`;
    const body = `<h1>KG summary — ${esc(site)}</h1><p class="sub">${esc(dmy(day))} · ${new Date(`${day}T12:00`).toLocaleDateString('en-GB', { weekday: 'long' })}</p>${sections.map(s => sectionTable(s, kind !== 'print')).join('')}`;
    return `${head}<head><meta charset="utf-8"><title>KG summary ${esc(dmy(day))}</title><style>${css}</style></head><body>${kind === 'print' ? `<div class="bar"><button type="button" onclick="window.print()">Print / Save as PDF</button></div><div class="page">${body}</div><script>window.addEventListener('load',()=>setTimeout(()=>window.print(),300));</script>` : body}</body></html>`;
}
