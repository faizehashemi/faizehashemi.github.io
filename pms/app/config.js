// Single source of truth for everything that differs between sites.
// Views never hardcode a building list or endpoint — they read it from here.

// The PMS cloud API (worker/worker.js). Set this to your Worker's address after deploying it
// (see worker/README.md). The login screen can override it per browser for testing.
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

// Order matters: Alt+1..Alt+9, Alt+0 jump to the first ten entries (same as the old nav).
export const VIEWS = [
    { id: 'slip',         label: 'Slip',     title: 'Slip' },
    { id: 'forecast',     label: 'Forecast', title: 'Forecast' },
    { id: 'grid',         label: 'Grid',     title: 'Grid' },
    { id: 'timeline',     label: 'Timeline', title: 'Room Timeline' },
    { id: 'checkins',     label: 'Checkins', title: 'Checkins' },
    { id: 'grouping',     label: 'Grouping', title: 'Groups' },
    { id: 'kg',           label: 'KG',       title: 'FEA' },
    { id: 'print',        label: 'Print',    title: 'Print — GL Copy' },
    { id: 'admin',        label: 'Admin',    title: 'Admin' },
    { id: 'mawaid',       label: 'Mawaid',   title: 'Mawaid Stats' },
    { id: 'movement',     label: 'Movement', title: 'Check-ins & Check-outs — Mobile' },
    { id: 'group-export', label: 'Export',   title: 'Groups Export' },
    { id: 'ums',          label: 'UMS',      title: 'UMS Import' },
    { id: 'setup',        label: 'Setup',    title: 'Setup' },
    { id: 'help',         label: 'Help',     title: 'PMS Instructions' },
    { id: 'home',         label: 'Home',     title: 'PMS', hidden: true },
    { id: 'login',        label: 'Log in',   title: 'Log in', hidden: true },
];

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
    'pms_instructions.html': 'help',
    'movement.html': 'movement',
    'only-pdf.html': 'group-export',
    'only-docx.html': 'group-export',
};

// UMS Group List import (app/core/ums.js)
export const UMS = {
    // UMS gives only a date when a group moves between cities; these are the hotel times used then.
    transferCheckinTime: '14:00',
    checkoutTime: '07:00',          // also used on the final day, unless the flight is earlier
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
