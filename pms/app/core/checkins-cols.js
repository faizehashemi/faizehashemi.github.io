// The columns of the Check-ins / Check-outs tables a login can hide (Settings → Check-ins page).
// The table's own date & time (Check-in in Check-ins, Check-out in Check-outs) always shows; Flight has its own tick.
export const CHECKINS_COLS = [
    ['sh', 'SH No'], ['group', 'Group'], ['leader', 'Group Leader'], ['building', 'Building'], ['rooms', 'Rooms'],
    ['as', 'As. (beds assigned)'], ['t', 'T (total)'], ['g', 'G'], ['l', 'L'], ['c', 'C'], ['i', 'I'],
    ['other', 'The other date & time'], ['slip', 'Slip (Open)'],
];
