// Home: the day's numbers with the Home rules (moved unchanged from views/home/view.js dayNumbers). `day` is YYYY-MM-DD; "in <city>" (this site) is counted
// now (today) or at 12:00. Check-ins and check-outs use the Check-ins page's "today" (03:00 → 03:00).
type Slip = Record<string, any>;
type Fe = { morning_from: string; split: string; night_to: string };

const pad = (n: number) => String(n).padStart(2, '0');
export const ymd = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const parseDT = (d?: string, t?: string) => { if (!d) return null; const v = new Date(`${d}T${t && t.length ? t : '00:00'}`); return isNaN(+v) ? null : v; };
const num = (v: unknown) => { const x = Number(v); return Number.isFinite(x) ? x : 0; };
export const guests = (r: Slip) => num(r.total) || (num(r.gents) + num(r.ladies) + num(r.children) + num(r.infants));
export const shift = (d: string, n: number) => { const x = new Date(`${d}T12:00`); x.setDate(x.getDate() + n); return ymd(x); };

export const PRAISE = [
    'The guests of Allah are in wonderful hands today.', 'Your care turns a room number into a home away from home.', 'Calm, careful and kind — the desk simply runs better when you are on it.',
    'You make the busiest day at the desk look effortless.', 'Every pilgrim who rests well tonight owes a little of it to you.', 'Thank you for the patience you pour into every check-in.',
    'Organised, generous with your time and always on top of it — shukran.', 'May Allah accept and reward the khidmat you do for His guests.',
    'Your attention to detail keeps hundreds of families comfortable.', 'The smile at the desk starts with you — thank you for it.',
];
/** the same line every time on one day for one person, different tomorrow */
export const dayPick = <T,>(list: T[], salt: string): T => { let h = 0; for (const c of `${ymd(new Date())}|${salt}`) h = (h * 31 + c.charCodeAt(0)) >>> 0; return list[h % list.length]; };

export function dayNumbers(day: string, here: Slip[], all: Slip[], siteId: string, feWin: Fe, stay: any, meals: any) {
    const isToday = day === ymd(new Date());
    const t = isToday ? new Date() : new Date(`${day}T12:00`);
    const from = new Date(`${day}T03:00`), to = new Date(+from + 864e5);
    const inWin = (d: Date | null) => !!d && d >= from && d < to;
    const ins = here.filter(r => inWin(parseDT(r.checkin_date, r.checkin_time)));
    // check-outs: every departure in the window — a delayed group leaves room by room (core/stay.js)
    const outEv = here.flatMap(r => (stay.departuresOf(r) as any[]).filter(d => inWin(new Date(d.at)))
        .map(d => ({ r, pax: stay.isDelayed(r) ? stay.paxAt(r, d.at - 1).total - stay.paxAt(r, d.at).total : guests(r) })));
    const outs = [...new Set(outEv.map(e => e.r))];
    const mk = all.filter(r => r.site === siteId).filter(r => stay.presentAt(r, +t));
    // Fakkul Ehraam: Makkah arrivals in the Setup windows
    const at = (h: string, dayOffset = 0) => { const d = new Date(`${day}T${h}`); d.setDate(d.getDate() + dayOffset); return d; };
    const makkah = all.filter(r => r.site === 'makkah');
    const arrivals = (f: Date, tt: Date, only: (r: Slip) => boolean = () => true) => ({ from: f, to: tt, items: makkah.filter(only)
        .filter(r => { const ci = parseDT(r.checkin_date, r.checkin_time); return !!ci && ci >= f && ci < tt; }).map(r => ({ r, pax: guests(r) })) });
    const fromMadina = (r: Slip) => /^S/i.test(String(r.sh_no ?? '').trim());
    const { morning_from: mf, split: sp, night_to: nt } = feWin;
    const fe = { morning: arrivals(at(mf, -1), at(sp)), night: arrivals(at(sp), at(nt)), madina: arrivals(at(sp), at(nt), fromMadina) };
    const pax = (rows: Slip[]) => rows.reduce((s, r) => s + guests(r), 0);
    return {
        day, isToday, t, ins, outs, inPax: pax(ins), outPax: outEv.reduce((s, e) => s + e.pax, 0), mk, mkPax: mk.reduce((s, r) => s + stay.paxAt(r, +t).total, 0), fe,
        fePax: Object.fromEntries(Object.entries(fe).map(([k, w]) => [k, w.items.reduce((s, x) => s + x.pax, 0)])) as Record<'morning' | 'night' | 'madina', number>,
        meals: meals.mealThalsFor(here, day), mealsWho: meals.mealGuestsFor(here, day),
    };
}
export type DayNumbers = ReturnType<typeof dayNumbers>;
