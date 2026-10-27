// Check-ins & Check-outs (mobile): the slips arriving and leaving in a period (moved from pms/app/views/movement/view.js). Default range: today 03:00 →
// tomorrow 03:00. A delayed group leaves in parts: one check-out row per departure, with the guests leaving then (core/stay.js).
import type { CoreModules } from '@/pms/types';

type Slip = Record<string, any>;
const pad2 = (n: number) => String(n).padStart(2, '0');
export const ymd = (d: Date) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
export const parseDT = (d?: string, t?: string) => { if (!d) return null; const [y, m, day] = String(d).split('-').map(Number); let hh = 0, mm = 0; if (t && /^\d{1,2}:\d{2}$/.test(t)) [hh, mm] = t.split(':').map(Number); return new Date(y, (m || 1) - 1, day || 1, hh || 0, mm || 0, 0, 0); };
export const fmt = (dt: Date | null) => dt ? new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short', hour12: false }).format(dt) : '';
export const nz = (v: unknown) => Number(v || 0);
export function plusOneDay(s: string) { if (!s) return ''; const [y, m, d] = s.split('-').map(Number); const dt = new Date(y, (m || 1) - 1, d || 1); dt.setDate(dt.getDate() + 1); return ymd(dt); }

export const roomList = (rec: Slip) => {
    const all: string[] = [];
    (rec.rooms?.gents || []).forEach((x: any) => all.push(String(x.room_no || '').trim()));
    (rec.rooms?.ladies || []).forEach((x: any) => all.push(String(x.room_no || '').trim()));
    return [...new Set(all.filter(Boolean))].sort((a, b) => a.localeCompare(b, undefined, { numeric: true })).join(', ');
};
export const assignedSum = (rec: Slip) => {
    let s = 0;
    for (const side of ['gents', 'ladies']) (rec.rooms?.[side] || []).forEach((x: any) => { const a = Number(x.assigned); if (Number.isFinite(a)) s += a; });
    return s || '';
};

/* ===== Luggage column ===== */
// A group's second stay here has the SH with prefix S (S44030); its luggage stays in the building of its first stay (44030) — the earliest stay of
// that SH without the S that has a building.
const LUGGAGE_PREFIX = 'S';
export function luggageIndex(rows: Slip[]) {
    const idx = new Map<string, Slip[]>();
    for (const r of rows) {
        const key = String(r.sh_no ?? '').trim().toUpperCase();
        if (!key || r.deleted) continue;
        if (!idx.has(key)) idx.set(key, []);
        idx.get(key)!.push(r);
    }
    for (const list of idx.values()) list.sort((a, b) => `${a.checkin_date}T${a.checkin_time}`.localeCompare(`${b.checkin_date}T${b.checkin_time}`));
    return idx;
}
export function luggageAt(idx: Map<string, Slip[]>, sh: unknown) {
    const s = String(sh ?? '').trim().toUpperCase();
    const m = s.startsWith(LUGGAGE_PREFIX) && /^\d+$/.test(s.slice(LUGGAGE_PREFIX.length)) ? [s, s.slice(LUGGAGE_PREFIX.length)] : null;
    if (!m) return '';
    const first = (idx.get(m[1]) || []).find(r => String(r.building || '').trim());
    return first ? String(first.building).trim() : '';
}

export function computeMovement(slips: Slip[], start: Date, end: Date, building: string, stay: Pick<CoreModules['stay'], 'isDelayed' | 'departuresOf' | 'paxAt'>) {
    const ins: Slip[] = [], outs: Slip[] = [];
    for (const r of slips) {
        const bld = (r.building || '').trim();
        if (building && bld !== building) continue;
        const ci = parseDT(r.checkin_date, r.checkin_time), co = parseDT(r.checkout_date, r.checkout_time);
        if (ci && ci >= start && ci <= end) ins.push(r);
        if (!stay.isDelayed(r)) { if (co && co >= start && co <= end) outs.push(r); continue; }
        // delayed: one row per departure, with the guests leaving then
        for (const d of stay.departuresOf(r) as any[]) {
            if (d.at < +start || d.at > +end) continue;
            const p0 = stay.paxAt(r, d.at - 1), p1 = stay.paxAt(r, d.at), at = new Date(d.at);
            outs.push({ ...r, checkout_date: `${at.getFullYear()}-${pad2(at.getMonth() + 1)}-${pad2(at.getDate())}`, checkout_time: `${pad2(at.getHours())}:${pad2(at.getMinutes())}`,
                gents: p0.gents - p1.gents, ladies: p0.ladies - p1.ladies, children: p0.children - p1.children, infants: p0.infants - p1.infants, total: p0.total - p1.total });
        }
    }
    ins.sort((a, b) => (a.checkin_date + a.checkin_time).localeCompare(b.checkin_date + b.checkin_time));
    outs.sort((a, b) => (a.checkout_date + a.checkout_time).localeCompare(b.checkout_date + b.checkout_time));
    return { ins, outs };
}
