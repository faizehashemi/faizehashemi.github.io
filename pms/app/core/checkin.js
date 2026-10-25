// Check-in flag: a signal to the other desks that a group has checked in — slip.checked_in (true / false), nothing else.
// No times, no pax, no checks against the slip, and no page reads it for any calculation.
//   isCheckedIn(slip)
//   setCheckedIn(db, slip, on)   saves the flag as a slip edit (version label "Checked in" / "Check-in undone")

export const isCheckedIn = (s) => !!(s && s.checked_in);

export function setCheckedIn(db, slip, on) {
    return db.update(slip.id, { ...slip, checked_in: !!on }, on ? 'checkin' : 'checkin-undo');
}
