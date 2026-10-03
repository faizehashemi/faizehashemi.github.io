// Single source of truth for everything that differs between sites.
// Views never hardcode a building list or endpoint — they read it from here.

// The PMS cloud API (worker/worker.js). Set this to your Worker's address after deploying it
// (see worker/README.md). Tests can point one browser elsewhere with localStorage "pms_api_url" (no login field).
export const API_URL = 'https://pms-api.tkamlapur.workers.dev';

export const SITES = {
    makkah: {
        id: 'makkah',
        label: 'Makkah',
        brand: 'PMS',
        buildings: ['MOHAMMEDI', 'MUFADDAL', 'SNOOD', 'BAHA', 'HUSN'],
        umsCity: 'MAKKAH', // how UMS names this city
    },
    medina: {
        id: 'medina',
        label: 'Medina',
        brand: 'Medina',
        buildings: ['RUBAT', 'ONARA', 'ARTAL'],
        umsCity: 'MADINA',
    },
};

export const DEFAULT_SITE = 'makkah';

// Every page. `key` is its default Alt+<key> shortcut (each browser can change them in Settings);
// `hint` shows in the menus.
export const VIEWS = [
    { id: 'slip',         label: 'Slip',               title: 'Slip',                  key: '1', hint: 'Create and edit accommodation slips' },
    { id: 'forecast',     label: 'Forecast',           title: 'Forecast',              key: '2', hint: 'Free and occupied rooms at a time' },
    { id: 'grid',         label: 'Grid',               title: 'Grid',                  key: '3', hint: 'Floor-by-floor occupancy map' },
    { id: 'timeline',     label: 'Timeline',           title: 'Room Timeline',         key: '4', hint: 'Who stays in a room over time' },
    { id: 'checkins',     label: 'Check-ins',          title: 'Checkins',              key: '5', hint: 'Arrivals and departures for a period' },
    { id: 'grouping',     label: 'Grouping',           title: 'Groups',                key: '6', hint: 'Bundle arrivals and print stickers' },
    { id: 'kg',           label: 'KG',                 title: 'FEA',                   key: '7', hint: 'Fakkul Ehraam & Atraaf duty roster' },
    { id: 'print',        label: 'Print slips',        title: 'Print — GL Copy',       key: '8', hint: 'A5 slips and group-leader copies' },
    { id: 'admin',        label: 'Slip admin',         title: 'Admin',                 key: '9', hint: 'Search, delete, back up slips' },
    { id: 'mawaid',       label: 'Mawaid',             title: 'Mawaid Stats',          key: '0', hint: 'Meal counts and thals per building' },
    { id: 'movement',     label: 'Movement',           title: 'Check-ins & Check-outs — Mobile', hint: 'Phone-friendly arrivals and departures' },
    { id: 'group-export', label: 'Group export',       title: 'Groups Export',         hint: 'Group signs as PDF or Word' },
    { id: 'builder',      label: 'Rooms & Buildings',  title: 'Rooms & Buildings',     hint: 'Buildings, rooms and bed counts' },
    { id: 'ums',          label: 'UMS import',         title: 'UMS Import',            hint: 'Bring in the UMS group list' },
    { id: 'setup',        label: 'Setup',              title: 'Setup',                 hint: 'This desk, old data upload, desk logins' },
    { id: 'laundry',      label: 'Laundry',            title: 'Laundry',               hint: 'New bill, free staff laundry, pending, close day' },
    { id: 'laundry-admin', label: 'Laundry admin',     title: 'Laundry admin',         hint: 'Sales, reports, bills, prices, staff' },
    { id: 'pending-checkouts', label: 'Pending checkouts', title: 'Pending Checkouts',    hint: 'UMS checkout list: zero-advance groups and their rooms' },
    { id: 'transport',    label: 'Transport day',      title: 'Transport',             hint: 'The day\'s trips, bus numbers, signage link' },
    { id: 'transport-import', label: 'Transport import', title: 'Transport Import',    hint: 'Paste the transport list; review changes before saving' },
    { id: 'transport-print', label: 'Bus sheets',      title: 'Bus Sheets',            hint: 'One printout per bus to stick on it' },
    { id: 'blank',       label: 'No pages',           title: 'PMS', hidden: true },
    { id: 'settings',     label: 'Settings',           title: 'Settings',              hint: 'Your look, quick links, shortcuts — follow your login' },
    { id: 'home',         label: 'Home',               title: 'PMS', hidden: true },
    { id: 'login',        label: 'Log in',             title: 'Log in', hidden: true },
];

// Menu categories (top bar on laptops, drawer sections on phones)
export const NAV = [
    { id: 'desk',   label: 'Front desk',     views: ['slip', 'checkins', 'movement', 'print'] },
    { id: 'rooms',  label: 'Rooms',          views: ['forecast', 'grid', 'timeline', 'builder'] },
    { id: 'groups', label: 'Groups & meals', views: ['grouping', 'group-export', 'kg', 'mawaid'] },
    { id: 'transport', label: 'Transport',   views: ['transport', 'transport-import', 'transport-print'] },
    { id: 'laundry', label: 'Laundry',       views: ['laundry', 'laundry-admin'] },
    { id: 'accounts', label: 'Accounts',     views: ['pending-checkouts'] },
    { id: 'data',   label: 'Data',           views: ['ums', 'admin', 'setup'] },
    { id: 'settings', label: 'Settings',     views: ['settings'] },
];

// Product analytics (PostHog). Empty key = analytics off. The project API key (phc_…) is meant
// to be public. Host: https://us.i.posthog.com or https://eu.i.posthog.com, matching your project.
// PostHog disconnected 2026-10-03: no key = analytics never loads or sends anything.
export const POSTHOG = { key: '', host: 'https://us.i.posthog.com' };

// Old standalone pages → view ids (used for redirects and for links inside view markup)
export const LEGACY_PAGES = {
    'index.html': 'home',
    'accommodation_slip.html': 'slip',
    'vacancy_forecast.html': 'forecast',
    'building_legend_grid.html': 'grid',
    'timeline_db.html': 'timeline',
    'checkins_checkouts.html': 'checkins',
    'fega.html': 'grouping',
    'fea.html': 'kg',
    'print_slip_a5.html': 'print',
    'slip_admin.html': 'admin',
    'mawaid.html': 'mawaid',
    'pms_instructions.html': 'home', // the Help page was removed
    'movement.html': 'movement',
    'only-pdf.html': 'group-export',
    'only-docx.html': 'group-export',
};

// UMS Group List import (app/core/ums.js)
export const UMS = {
    // Travel times. These are only the defaults: an admin sets the live values on the Setup page
    // (stored on the server, the same for every desk — see core/settings.js).
    arrivalCommuteHours: 3,          // hotel check-in  = flight landing + this (airport → hotel)
    departureLeadHours: 6,           // hotel check-out = flight departure − this (hotel → airport)
    // UMS gives only a date when a group moves between cities; these are the hotel times used then.
    transferCheckinTime: '14:00',
    transferCheckoutTime: '07:00',
    // An existing slip with the same SH but no UMS link yet (typed in by hand, or an older list)
    // is adopted if its check-in is within this many days of the UMS stay.
    matchWindowDays: 7,
    // Automatic imports are held for review if the file has fewer rows than this share of the
    // previous import (protects against a half-loaded or filtered export).
    minRowShare: 0.5,
};

// Which site a building belongs to (null when unknown)
export function siteOfBuilding(building) {
    const b = String(building || '').trim().toUpperCase();
    if (!b) return null;
    for (const s of Object.values(SITES)) if (s.buildings.includes(b)) return s.id;
    return null;
}
