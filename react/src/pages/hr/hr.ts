// HR: the numbers of a day — which shift a person has, when they came and left, minutes worked, late, early, overtime, absent / on leave.
export type Row = Record<string, any>;
export type Shift = { id: number; name: string; start: string; end: string; break_min: number; grace_min: number; days: number[]; color: string };
export type DayLine = { day: string; staff: Row; shift: Shift | null; ins: Row[]; outs: Row[]; first: string; last: string; worked: number; late: number; early: number; ot: number; planned: number;
    status: 'present' | 'late' | 'absent' | 'leave' | 'off' | 'upcoming' | 'working'; leave?: Row; flags: string[]; refused: number };

const pad = (n: number) => String(n).padStart(2, '0');
export const ymd = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const addDays = (d: string, n: number) => { const x = new Date(`${d}T12:00`); x.setDate(x.getDate() + n); return ymd(x); };
export const daysBetween = (a: string, b: string) => { const out: string[] = []; for (let d = a; d <= b && out.length < 400; d = addDays(d, 1)) out.push(d); return out; };
export const saudiNow = () => new Date(Date.now() + 3 * 3600e3).toISOString().slice(0, 16);   // YYYY-MM-DDTHH:MM, Saudi time
const mins = (hm: string) => { const [h, m] = hm.split(':').map(Number); return h * 60 + m; };
const at = (s: string) => Date.parse(s + ':00Z') / 60000;   // minutes (times are kept as Saudi wall time)
export const hm = (m: number) => `${Math.floor(m / 60)}:${pad(Math.round(m % 60))}`;
export const dow = (d: string) => new Date(`${d}T12:00`).getDay();

/** The shift of a person on a day: the roster's (null there = day off), else their usual shift on its weekdays */
export function shiftOf(staff: Row, day: string, roster: Map<string, number | null>, shifts: Shift[]): Shift | null {
    const k = `${day}|${staff.id}`;
    if (roster.has(k)) { const id = roster.get(k); return id == null ? null : shifts.find(s => s.id === id) || null; }
    const s = shifts.find(x => x.id === staff.shift_id);
    return s && s.days.includes(dow(day)) ? s : null;
}
export function dayLine(staff: Row, day: string, punches: Row[], roster: Map<string, number | null>, shifts: Shift[], leaves: Row[], now = saudiNow()): DayLine {
    const mine = punches.filter(p => p.staff_id === staff.id && p.day === day).sort((a, b) => a.at.localeCompare(b.at));
    const ins = mine.filter(p => p.kind === 'in'), outs = mine.filter(p => p.kind === 'out');
    const shift = shiftOf(staff, day, roster, shifts);
    const leave = leaves.find(l => l.staff_id === staff.id && l.status === 'approved' && l.from_day <= day && l.to_day >= day);
    // worked: each IN up to the next OUT (an IN still open counts until now, on today)
    let worked = 0, open: Row | null = null;
    for (const p of mine) {
        if (p.kind === 'in') open = open || p;
        else if (p.kind === 'out' && open) { worked += Math.max(0, at(p.at) - at(open.at)); open = null; }
    }
    if (open && day === now.slice(0, 10)) worked += Math.max(0, at(now) - at(open.at));
    const first = ins[0]?.at.slice(11, 16) || '', last = outs[outs.length - 1]?.at.slice(11, 16) || '';
    let late = 0, early = 0, planned = 0;
    if (shift) {
        const s = mins(shift.start), e0 = mins(shift.end), e = e0 <= s ? e0 + 1440 : e0;
        planned = Math.max(0, e - s - (shift.break_min || 0));
        if (first) { const f = mins(first); if (f > s + (shift.grace_min || 0)) late = f - s; }
        if (last && !open) { const l = mins(last) + (mins(last) < s ? 1440 : 0); if (l < e) early = e - l; }
        if (worked > 300) worked = Math.max(0, worked - (shift.break_min || 0));   // the shift's break, once the day is long enough
    }
    const ot = shift ? Math.max(0, worked - planned) : worked;
    let status: DayLine['status'];
    if (leave) status = 'leave';
    else if (open && day === now.slice(0, 10)) status = late ? 'late' : 'working';
    else if (ins.length) status = late ? 'late' : 'present';
    else if (!shift) status = 'off';
    else status = (day < now.slice(0, 10) || (day === now.slice(0, 10) && now.slice(11, 16) > shift.start)) ? 'absent' : 'upcoming';
    const flags = [...new Set(mine.flatMap(p => String(p.flags || '').split(',').filter(Boolean)))];
    if (mine.some(p => p.source === 'manual')) flags.push('manual');
    return { day, staff, shift, ins, outs, first, last, worked: Math.round(worked), late, early, ot: Math.round(ot), planned, status, leave, flags, refused: mine.filter(p => p.kind === 'refused').length };
}
export const STATUS: Record<DayLine['status'], [string, string]> = {
    present: ['Present', 'bg-emerald-100 text-emerald-900'], working: ['At work', 'bg-emerald-100 text-emerald-900'], late: ['Late', 'bg-amber-100 text-amber-900'],
    absent: ['Absent', 'bg-red-100 text-red-900'], leave: ['On leave', 'bg-sky-100 text-sky-900'], off: ['Day off', 'bg-muted text-muted-foreground'], upcoming: ['Not yet', 'bg-muted text-muted-foreground'],
};
/** Annual leave taken in a year (approved days), for the balance */
export const annualTaken = (leaves: Row[], staffId: number, year: string) => leaves.filter(l => l.staff_id === staffId && l.type === 'annual' && l.status === 'approved' && l.from_day.startsWith(year)).reduce((n, l) => n + l.days, 0);
export const FLAG: Record<string, string> = { 'shared-phone': '📱 same phone as someone else today', 'low-accuracy': '📍 weak location', manual: '✍️ entered by a manager',
    'no-blink': '👁 refused: no blink', face: '🙂 refused: face did not match', outside: '📍 refused: outside the circle', 'no-location': '📍 refused: location off',
    'dev-face': '🖐 machine · face', 'dev-finger': '🖐 machine · finger', 'dev-card': '🖐 machine · card', 'dev-pw': '🖐 machine · password', 'dev-palm': '🖐 machine · palm' };
