// Misri (Fatimid) Hijri calendar — the tabular calendar used by mumineencalendar.com: 30-year cycles with
// leap (kabisa) years 2, 5, 8, 10, 13, 16, 19, 21, 24, 27 and 29; odd months 30 days, even months 29, and
// Zilhaj 30 in a kabisa year. The date changes at midnight here, like that calendar's month view.

const KABISA = [2, 5, 8, 10, 13, 16, 19, 21, 24, 27, 29];
const MONTH_DAYS_BEFORE = [30, 59, 89, 118, 148, 177, 207, 236, 266, 295, 325]; // days before months 2..12
const CYCLE_DAYS_BEFORE = [354, 708, 1063, 1417, 1771, 2126, 2480, 2834, 3189, 3543, 3898, 4252, 4606, 4961, 5315,
    5669, 6024, 6378, 6732, 7087, 7441, 7796, 8150, 8504, 8859, 9213, 9567, 9922, 10276, 10631]; // days before years 2..31 of a cycle

export const HIJRI_MONTHS = ['Moharram al-Haraam', 'Safar al-Muzaffar', 'Rabi al-Awwal', 'Rabi al-Aakhar', 'Jumada al-Ula',
    'Jumada al-Ukhra', 'Rajab al-Asab', 'Shabaan al-Karim', 'Ramadaan al-Moazzam', 'Shawwal al-Mukarram',
    'Zilqadah al-Haraam', 'Zilhaj al-Haraam'];

export const isKabisa = (year) => KABISA.includes(year % 30);
export const daysInMonth = (year, month) => (month === 11 && isKabisa(year)) || month % 2 === 0 ? 30 : 29; // month 0-based

// Astronomical Julian day of a local calendar date (at midnight)
function julianDay(date) {
    let y = date.getFullYear(), m = date.getMonth() + 1;
    const d = date.getDate();
    if (m < 3) { y -= 1; m += 12; }
    const a = Math.floor(y / 100), b = 2 - a + Math.floor(a / 4);
    return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + d + b - 1524.5;
}

/** { year, month (0-based), day, monthName } for a Gregorian date. */
export function toHijri(date = new Date()) {
    let days = Math.floor(julianDay(date) - 1948083.5);
    const cycles = Math.floor(days / 10631);
    days -= cycles * 10631;
    let y = 0;
    while (days > CYCLE_DAYS_BEFORE[y]) y++;
    const year = 30 * cycles + y;
    if (y > 0) days -= CYCLE_DAYS_BEFORE[y - 1];
    let m = 0;
    while (days > MONTH_DAYS_BEFORE[m]) m++;
    const day = m > 0 ? days - MONTH_DAYS_BEFORE[m - 1] : days;
    return { year, month: m, day, monthName: HIJRI_MONTHS[m] };
}

export const formatHijri = (h) => `${h.day} ${h.monthName} ${h.year}H`;
