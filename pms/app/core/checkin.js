// Check-in commit. The slip stays the only source of truth: a check-in is a flag on the slip (slip.actual.in), allowed
// only when what really happened agrees with the slip. When it does not, checkinFit() works out the change to the slip
// that makes it agree (a suggestion the desk confirms) and the flag is saved in the same slip edit, so every page keeps
// computing from the slip. No page reads slip.actual except the status chip / filters.
//
//   slip.actual.in = { at: 'YYYY-MM-DDTHH:MM', pax, by, note, adjusted: bool }
//   stayStatus(slip, since, now)   'arrived' | 'expected' | 'late' | 'notrecorded'
//   checkinFit(slip, actual, { slips, capOf })   { ok, patch, changes: [{ label, from, to }], blockers: [text] }
//   commitCheckin(db, slip, actual, fit, by)     saves the slip (suggested change + flag) with a version note

import { parseDT, roomConflicts, rowsOf } from './stay.js';

const num = (v) => { const x = Number(v); return Number.isFinite(x) ? x : 0; };
const pad = (n) => String(n).padStart(2, '0');
const dmy = (d) => d ? String(d).split('-').reverse().join('/') : '';
export const slipPax = (s) => num(s.total) || num(s.gents) + num(s.ladies) + num(s.children ?? s.child) + num(s.infants ?? s.infant);

export const nowLocal = () => { const d = new Date(); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`; };

/** Where a slip stands. Slips checking in before `since` (the day the button was introduced) are 'notrecorded'. */
export function stayStatus(s, since = '', now = Date.now()) {
    if (s.actual?.in?.at) return 'arrived';
    if (!s.checkin_date || (since && s.checkin_date < since)) return 'notrecorded';
    const start = parseDT(s.checkin_date, s.checkin_time);
    return start != null && start < now ? 'late' : 'expected';
}
export const STATUS_LABEL = { arrived: 'Arrived', expected: 'Expected', late: 'Late', notrecorded: 'Not recorded' };

/**
 * actual: { at: 'YYYY-MM-DDTHH:MM', gents, ladies, children, infants } (the guests who really arrived)
 * @returns {{ ok: boolean, patch: object, changes: {label, from, to}[], blockers: string[] }}
 *   ok — the check-in agrees with the slip as it is (no change needed)
 *   patch — what to change on the slip to make it agree; blockers — why the slip cannot be changed that way
 */
export function checkinFit(slip, actual, { slips = [], capOf = () => 0 } = {}) {
    const changes = [], blockers = [], patch = {};
    const at = String(actual.at || '');
    const day = at.slice(0, 10), time = at.slice(11, 16);
    if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(at)) return { ok: false, patch, changes, blockers: ['Enter the arrival date and time.'] };

    // arrival: the planned day, not before the planned time (arriving later the same day is as planned)
    const tooEarly = day === slip.checkin_date && time < String(slip.checkin_time || '00:00');
    if (day !== slip.checkin_date || tooEarly) {
        patch.checkin_date = day; patch.checkin_time = time;
        changes.push({ label: 'Check-in', from: `${dmy(slip.checkin_date)} ${slip.checkin_time || ''}`.trim(), to: `${dmy(day)} ${time}` });
        const end = parseDT(slip.checkout_date, slip.checkout_time), start = parseDT(day, time);
        if (end != null && start != null && start >= end) blockers.push('The arrival is not before the slip’s check-out. Change the check-out on the Slip page first.');
    }

    // guests
    const g = num(actual.gents), l = num(actual.ladies), c = num(actual.children), i = num(actual.infants), pax = g + l + c + i;
    const was = { gents: num(slip.gents), ladies: num(slip.ladies), children: num(slip.children ?? slip.child), infants: num(slip.infants ?? slip.infant) };
    if (!pax) blockers.push('Enter how many guests arrived.');
    if (pax !== slipPax(slip) || g !== was.gents || l !== was.ladies || c !== was.children || i !== was.infants) {
        Object.assign(patch, { gents: g, ladies: l, children: c, infants: i, total: pax });
        changes.push({ label: 'Guests', from: `${slipPax(slip)} (G ${was.gents} · L ${was.ladies} · C ${was.children} · I ${was.infants})`, to: `${pax} (G ${g} · L ${l} · C ${c} · I ${i})` });
        const beds = rowsOf(slip).reduce((n, r) => n + r.beds, 0);
        if (beds && pax > beds) blockers.push(`${pax} guests but only ${beds} beds are assigned. Add rooms on the Slip page (Pick rooms), then check in.`);
    }

    // the rooms must still be free from the new check-in time
    if (patch.checkin_date && !blockers.length) {
        const next = { ...slip, ...patch };
        for (const x of roomConflicts(next, slips, capOf, 0)) {
            if (x.clash) blockers.push(`Room ${x.row.room_no} is not free from ${dmy(day)} ${time}: ${x.peak}/${x.cap} beds${x.who.length ? ` (${x.who.map(w => `SH ${w.sh}`).join(', ')})` : ''}. Choose another room on the Slip page, then check in.`);
        }
    }
    return { ok: !changes.length, patch, changes, blockers };
}

/** Save the check-in: the suggested change (if any) and the flag in one slip edit. */
export async function commitCheckin(db, slip, actual, fit, by) {
    const pax = num(actual.gents) + num(actual.ladies) + num(actual.children) + num(actual.infants);
    const next = { ...slip, ...fit.patch, actual: { ...(slip.actual || {}), in: { at: actual.at, pax, by: by || '', note: String(actual.note || '').slice(0, 200), adjusted: !fit.ok } } };
    return db.update(slip.id, next, fit.ok ? 'checkin' : 'checkin-adjust');
}
