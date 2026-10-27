// Log of bulk applies (Forecast planner "Write building", Forecast day "Apply allocations", Delayed departures), shared by every desk of the site
// (GET/POST /api/alloc-log). Each entry keeps every slip's building and rooms before and after. Undo puts back the "before" on the slips that still
// look exactly like the "after" (a slip changed since is left alone and listed). Moved from pms/app/views/forecast/alloclog.js.
import type { CoreModules } from '@/pms/types';

type Slip = Record<string, any>;
export type Alloc = { building: string; rooms: { gents: any[]; ladies: any[] }; checkout_date: string; checkout_time: string; delayed: any };
export const KIND: Record<string, string> = { planner: 'Building planner', 'allocate-day': "Day's check-ins", delay: 'Delayed departures' };

/** building, rooms (with each room's own check-out when delayed), check-out and delay of a slip — comparable */
export function allocOf(r: Slip): Alloc {
    const side = (s: string) => (r.rooms?.[s] || []).filter((x: any) => String(x.room_no || '').trim())
        .map((x: any) => ({ room_no: String(x.room_no).trim(), capacity: x.capacity ?? '', assigned: x.assigned ?? '', ...(x.gl ? { gl: true } : {}),
            ...(x.out ? { out: { date: x.out.date || '', time: x.out.time || '' }, out_status: x.out_status || 'confirmed' } : {}) }));
    return { building: String(r.building || '').trim(), rooms: { gents: side('gents'), ladies: side('ladies') },
        checkout_date: r.checkout_date || '', checkout_time: r.checkout_time || '', delayed: r.delayed && r.delayed.on ? r.delayed : null };
}

// a slip still looks like `saved` (older log entries saved only building + rooms without per-room check-outs)
export function sameAlloc(cur: Alloc, saved: Record<string, any>) {
    const hasOut = ['gents', 'ladies'].some(s => (saved.rooms?.[s] || []).some((x: any) => x.out));
    const strip = (rooms: Alloc['rooms']) => hasOut ? rooms : { gents: rooms.gents.map(({ out, out_status, ...x }: any) => x), ladies: rooms.ladies.map(({ out, out_status, ...x }: any) => x) };
    return Object.keys(saved).every(k => JSON.stringify(k === 'rooms' ? strip(cur.rooms) : (cur as any)[k]) === JSON.stringify(saved[k]));
}

export const allocText = (a: Alloc) => {
    // a delayed room shows its own check-out: 1720→14/10 10:00 (unknown)
    const list = (s: 'gents' | 'ladies') => a.rooms[s].map((x: any) => x.room_no + (x.out ? `→${String(x.out.date).slice(8, 10)}/${String(x.out.date).slice(5, 7)} ${x.out.time}${x.out_status && x.out_status !== 'confirmed' ? ` (${x.out_status})` : ''}` : '')).join(', ');
    const parts = [list('gents') && `G ${list('gents')}`, list('ladies') && `L ${list('ladies')}`].filter(Boolean);
    return `${a.building || 'no building'}${parts.length ? ` · ${parts.join(' · ')}` : ''}`;
};

/** Save one bulk apply: pairs of [slip before, slip after] */
export async function recordApply(cloud: CoreModules['cloud'], siteId: string, kind: string, note: string, pairs: [Slip, Slip][]) {
    const changes = pairs.map(([before, after]) => ({ id: before.id, sh: String(before.sh_no ?? ''), before: allocOf(before), after: allocOf(after) }));
    if (!changes.length) return;
    try { await cloud.request('POST', '/api/alloc-log', { site: siteId, kind, note, changes }); }
    catch (e) { console.warn('alloc log', e); }
    window.dispatchEvent(new Event('pms:alloc-log'));
}
