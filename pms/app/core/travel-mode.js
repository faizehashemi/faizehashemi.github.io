// How a group travels into and out of a stay — "By flight", "By car", "By train", "By bus" (Madina: Check-ins → Check-out & transport, the slip and GL copy).
// Leaving: the Transport day trip of the group (its vehicle) first; else the slip's To ("By car" …, or this city's airport = by flight); else the UMS
// departure when it leaves from this city (CAR-CAR / BUS-BUS / TRAIN… or a flight). UMS's departure is the group's last leg out of the country, so a group
// going on to another city by road with its flight from Jeddah gets nothing from it. Arriving: the slip's From, else the UMS arrival into this city.

const CITY = { makkah: ['MAKKAH', 'MECCA'], medina: ['MADINA', 'MEDINA', 'MADINAH'] };
const AIRPORT = { makkah: 'Jeddah Airport', medina: 'Madina Airport' };
export const MODES = ['By flight', 'By car', 'By train', 'By bus'];

/** "By car" from "CAR-CAR", "By bus" from "BUS-BUS", "By train" from "TRAIN…", else a flight number → "By flight"; '' when empty */
export function legMode(leg) {
    const f = String(leg?.flight || '').trim();
    if (!f) return '';
    const w = f.match(/^(CAR|BUS|TRAIN)\b/i);
    return w ? `By ${w[1].toLowerCase()}` : 'By flight';
}
/** From / To of the slip as a mode: "By car" as is, this city's airport → by flight; else '' (a city says where, not how) */
function placeMode(place, site) {
    const p = String(place || '').trim();
    if (/^By (car|bus|train|flight)$/i.test(p)) return 'By ' + p.slice(3).toLowerCase();
    if (p && p === AIRPORT[site]) return 'By flight';
    return '';
}
const fromHere = (leg, site) => (CITY[site] || []).includes(String(leg?.port || '').trim().toUpperCase());
/** A Transport day trip's vehicle as a mode: car → By car, a custom vehicle by its name, else By bus */
export const tripMode = (t) => !t ? '' : t.vehicle === 'car' ? 'By car' : t.vehicle === 'other' && t.vehicle_label ? `By ${String(t.vehicle_label).toLowerCase()}` : 'By bus';

/** How the group leaves this stay: { mode, src: 'transport' | 'slip' | 'ums' | '' } — `trip` = its Transport day trip, if any */
export function leaveMode(rec, trip) {
    const site = rec.site;
    if (trip) return { mode: tripMode(trip), src: 'transport' };
    const p = placeMode(rec.to_place, site);
    if (p) return { mode: p, src: 'slip' };
    const d = rec.ums?.departure;
    if (d && fromHere(d, site)) { const m = legMode(d); if (m) return { mode: m, src: 'ums' }; }
    return { mode: '', src: '' };
}
/** How the group came to this stay */
export function arriveMode(rec) {
    const site = rec.site;
    const p = placeMode(rec.from_place, site);
    if (p) return { mode: p, src: 'slip' };
    const a = rec.ums?.arrival;
    if (a && fromHere(a, site)) { const m = legMode(a); if (m) return { mode: m, src: 'ums' }; }
    return { mode: '', src: '' };
}
