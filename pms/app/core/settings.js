// System-wide settings kept on the server (Setup page, admin only) and shared by every desk.
// A copy is cached for offline use; until the server has a value, the defaults in config.js apply.

import { UMS } from '../config.js';
import { request, OfflineError, ApiError } from './cloud.js';
import { track } from './analytics.js';

const CACHE_KEY = 'pms_settings_cache';

// server key → default
export const DEFAULTS = {
    arrival_commute_hours: UMS.arrivalCommuteHours,
    departure_lead_hours: UMS.departureLeadHours,
    transfer_checkin_time: UMS.transferCheckinTime,
    transfer_checkout_time: UMS.transferCheckoutTime,
    // KG page events (Setup → KG event times)
    kg_sessions: [
        { name: 'Aaje Raate Haram', time: '20:30' },
        { name: 'Kaale Fajare Haram', time: '07:00' },
        { name: 'Aaje Dupehre Atraaf', time: '15:00' },
    ],
    // Home → Fakkul Ehraam counts (Setup → Fakkul Ehraam windows): Morning = check-ins from morning_from the day
    // before to split today; Night = split to night_to today
    fe_windows: { morning_from: '20:00', split: '07:00', night_to: '20:00' },
    // /<site>/signage (Setup → Signage window): from 'now' or 'HH:MM' today, until to_day (0 today, 1 tomorrow, 2) at to_time
    signage_window: { from: 'now', to_day: 1, to_time: '23:59' },
};

/** '20:30' → '08:30 PM' (the KG message format) */
export function to12h(hhmm) {
    const [h, m] = String(hhmm || '').split(':').map(Number);
    if (!Number.isFinite(h) || !Number.isFinite(m)) return '';
    return `${String(((h + 11) % 12) + 1).padStart(2, '0')}:${String(m).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`;
}

let cached = (() => { try { return JSON.parse(localStorage.getItem(CACHE_KEY) || 'null'); } catch { return null; } })();

/** { settings: {…all keys, defaults filled in}, updated_at, updated_by, fromServer } */
export async function loadSettings() {
    try {
        const r = await request('GET', '/api/settings');
        cached = r;
        try { localStorage.setItem(CACHE_KEY, JSON.stringify(r)); } catch { }
    } catch (e) {
        if (!(e instanceof OfflineError) && !(e instanceof ApiError)) throw e; // offline or old server: use the copy / defaults
    }
    return { settings: { ...DEFAULTS, ...(cached?.settings || {}) }, updated_at: cached?.updated_at || null, updated_by: cached?.updated_by || null, fromServer: !!cached };
}

export async function saveSettings(settings) {
    const r = await request('PUT', '/api/settings', { settings });
    cached = r;
    try { localStorage.setItem(CACHE_KEY, JSON.stringify(r)); } catch { }
    track('settings_saved', { keys: Object.keys(settings).join(',') });
    return { settings: { ...DEFAULTS, ...r.settings }, updated_at: r.updated_at, updated_by: r.updated_by, fromServer: true };
}

/** The UMS import rules with the current settings applied (see staysOf in ums.js). */
export async function umsConfig() {
    const { settings: s } = await loadSettings();
    return {
        ...UMS,
        arrivalCommuteHours: s.arrival_commute_hours,
        departureLeadHours: s.departure_lead_hours,
        transferCheckinTime: s.transfer_checkin_time,
        transferCheckoutTime: s.transfer_checkout_time,
    };
}

/** Local date/time shifted by a number of hours: shiftTime('2026-11-25', '23:00', 3) → 2026-11-26 02:00 */
export function shiftTime(date, time, hours) {
    const [y, m, d] = String(date).split('-').map(Number);
    const [hh, mm] = String(time || '00:00').split(':').map(Number);
    const t = new Date(Date.UTC(y, m - 1, d, hh || 0, mm || 0) + Math.round(hours * 60) * 60000);
    return { date: t.toISOString().slice(0, 10), time: t.toISOString().slice(11, 16) };
}
