// What changed between two versions of a slip: the fields worth showing (same as the Slip page's History, pms/app/views/slip/history.js).
type Slip = Record<string, any>;

const roomsText = (list?: any[]) => (list || []).map(r => `${r.room_no}×${r.assigned ?? r.beds ?? '?'}${r.exclusive ? ' (exclusive' + (r.building ? `, ${r.building}` : '') + ')' : ''}${r.out && r.out.date ? ` → ${r.out.date}` : ''}`).join(', ') || '—';

export function slipFields(d?: Slip | null): [string, string][] {
    d = d || {};
    const dt = (a?: string, b?: string) => [a, b].filter(Boolean).join(' ') || '—';
    return ([
        ['SH', d.sh_no], ['Tour', d.tour_name], ['Leader', d.group_leader], ['Building', d.building], ['From', d.from_place], ['To', d.to_place],
        ['Check-in', dt(d.checkin_date, d.checkin_time)], ['Check-out', dt(d.checkout_date, d.checkout_time)],
        ['Gents', d.gents], ['Ladies', d.ladies], ['Children', d.children], ['Infants', d.infants], ['Total', d.total],
        ['Checked in', d.checked_in ? 'yes' : 'no'],
        ['Delayed', d.delayed && d.delayed.on ? `${d.delayed.status || 'tentative'}${d.delayed.note ? ` · ${d.delayed.note}` : ''}` : 'no'],
        ['Gents rooms', roomsText(d.rooms && d.rooms.gents)], ['Ladies rooms', roomsText(d.rooms && d.rooms.ladies)],
    ] as [string, unknown][]).map(([l, v]) => [l, v == null || v === '' ? '—' : String(v)]);
}

export function slipChanges(now: Slip, before?: Slip | null): { l: string; from: string; to: string }[] | null {
    if (!before) return null;
    const a = new Map(slipFields(before)), out: { l: string; from: string; to: string }[] = [];
    for (const [l, v] of slipFields(now)) if (a.get(l) !== v) out.push({ l, from: a.get(l) as string, to: v });
    return out;
}
