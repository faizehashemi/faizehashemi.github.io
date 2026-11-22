// Notice screens /<site>/signage1 and /<site>/signage2: TVs mounted on their side next to the transport board. Shared by the player (pms/<site>/signageN.html)
// and the Signage Builder (Screen 1 / Screen 2). Content is drawn upright on a 1080 × 1920 portrait stage, then turned to match how the TV hangs.
//
// Screen config (cloud, signage_config row "<site>:signageN"): { rotate, fade, slides: [slide…] }
//   rotate  90  = the TV hangs turned anticlockwise (its top edge on the left): the picture is turned clockwise to stand upright
//          -90  = the TV hangs turned clockwise; 0 = the TV is set to portrait itself; 180 = upside down
//   slide   { id, kind: 'notice' | 'image' | 'video' | 'pages', name, on, seconds, fit: 'contain' | 'cover', bg, media: [id…], notice, sched }
//     notice — the "Important Notice" poster, edited in the builder (sections of text, a table, a picture such as a QR code)
//     image  — one picture · video — plays to its end (muted) · pages — the pages of a PDF or the slides of a PowerPoint, each for `seconds`
//     sched  { on, days: [0-6, 0 = Sunday], from: 'HH:MM', to: 'HH:MM', dateFrom, dateTo: 'YYYY-MM-DD', only } — Saudi time. A slide with a schedule
//            shows only inside it; `only` = while it is on, the screen shows just the slides marked so (e.g. the menu at meal time).
// Media (pictures, videos, pages) are files kept in the cloud: GET <api>/api/public/signage/media/<id>.

export const STAGE_W = 1080, STAGE_H = 1920;
export const SCREENS = [1, 2];

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
/** a line of notice text: **bold**, !!red!!, __underline__ */
export const inline = (s) => esc(s).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/!!(.+?)!!/g, '<span style="color:#d0021b">$1</span>').replace(/__(.+?)__/g, '<u>$1</u>');
export const mediaUrl = (api, id) => `${String(api).replace(/\/+$/, '')}/api/public/signage/media/${encodeURIComponent(id)}`;
export const newId = () => Math.random().toString(36).slice(2, 10);

/* ---------------------------------- defaults: as the screens showed before (SignageSpace) ---------------------------------- */

const sec = (icon, title, band, text, more = {}) => ({ icon, title, band, text, align: 'left', image: '', table: '', note: '', ...more });
// from the announcement slides WIFI-SLIDE.pptx and TRANSPORT-SLIDE-new.pptx, plus the WhatsApp and Sabaq parts the screen showed (photo of 9 Nov)
const BG = { bgVideo: 'asset:signage/notice-bg.mp4', bgImage: 'asset:signage/notice-bg.jpg' };
const NOTICE_1 = {
    title: 'Important Notice', side: 'left', strip: '#1d6fe0', color: '#404040', ...BG,
    sections: [
        sec('📶', 'Wifi Information', '#a99cf0', 'In wifi, select “MH”\nUsername: 1448\nPassword: m5253'),
        sec('🧺', 'Laundry', '#f0a9c4', '🏠 Self Laundry: Available on the 17th floor. Bring your own detergent.'),
        sec('💳', 'Sim Card', '#f2cf6b', 'SIM cards are available for purchase near the Haram with your Visa ID and Passport ID. Please carry these documents with you.\n✅ STC Sim Cards are preferable due to their superior connectivity.'),
        sec('📱', 'Whatsapp Community', '#7fc9be', 'Join this WhatsApp Community to get important announcements.', { align: 'center' }),
        sec('🕋', 'Haram Clothes', '#8fd0f0', 'Entry into the Haram is strictly allowed only in ehraam for men and single-color rida (❌ no laces, work, or design) for women.\n🚫 Anyone not adhering to these guidelines will not be permitted entry in our transport buses.'),
        sec('📖', 'Sabaq', '#7d95e6', '', { table: '# | Time | Venue\nRegular Sabaq | One Day after arrival 10 AM | MP Floor\nWada Sabaq | One day before departure after lunch | MP Floor' }),
    ],
};
const NOTICE_2 = {
    title: 'Important Notice', side: 'right', strip: '#2e5fbf', color: '#404040', ...BG,
    sections: [
        sec('📝', 'General Instructions', '#a9b6c8', '!!**- NO QASAR NAMAZ in Makkah**!!\n- Carry Makkah Mansak for Atraaf\n- Scan QR code provided in your room for queries and services.', { align: 'center' }),
        sec('🚌', 'Transport Bus services', '#8f9ef0', '', {
            table: '# Daily Shuttle (Except Friday)\nTo Haram | DAY:- 08:00 Am To 09:30 Am\n^ | NIGHT:- 08:00 Pm To 9:30 Pm\nTo Hotel | DAY:- 12:30 Pm To 01:15 Pm\n^ | NIGHT:- 11:30 Pm To 01:30 Am\n# Thursday & Friday Timing\nTo Haram | 07:30am And 08:30am\nTo Hotel | **AFTER NAMAZ 02:30PM**\n^ | !!*NIGHT TIMING ARE SAME*!!',
            note: '**For Shuttle Query- 0546356413 ,052689883**',
        }),
        sec('🍽️', 'Mawaid Timings', '#c9a9ec', 'Mawaid on the PR floor ,The timings are as follows:\n🥐 Breakfast: 07:30 - 09:00 AM\n🍛 Lunch : 01:30 PM\n!!Thursday & Friday:- 01:00 PM!!\n🍲 Dinner : 07:00 PM\n⏰ Please be punctual and attend on time.'),
    ],
};
const noticeSlide = (notice) => ({ id: 'notice', kind: 'notice', name: 'Important Notice', on: true, seconds: 30, fit: 'contain', bg: '#000000', media: [], notice, sched: { on: false } });
/** what a screen shows before anything is saved for it */
export function defaultScreen(n) {
    return { rotate: n === 2 ? -90 : 90, fade: 0.6, slides: [noticeSlide(JSON.parse(JSON.stringify(n === 2 ? NOTICE_2 : NOTICE_1)))] };
}
export const blankSection = () => sec('📌', 'New section', '#8f9ef0', 'Text');

/* ---------------------------------- poster look: strip size, fonts, text size, designs ---------------------------------- */
// notice fields (all optional — an old poster looks as before):
//   stripSize 'hidden' | 'slim' | 'normal' | 'wide'; titleSize (px of the side title); headFont / bodyFont (NOTICE_FONTS);
//   textSize (px; empty = the biggest that fits); headInk, thBg, tdBg, td1Bg, tblInk, noteInk (colours); section.scale (% of the text size)
export const NOTICE_FONTS = ['Georgia', 'Times New Roman', 'Bookman Old Style', 'Arial', 'Arial Black', 'Segoe UI', 'Roboto', 'Poppins', 'Lato', 'Playfair Display', 'Merriweather'];
const GOOGLE = { Roboto: 'Roboto:wght@400;700', Poppins: 'Poppins:wght@400;600;700', Lato: 'Lato:wght@400;700', 'Playfair Display': 'Playfair+Display:wght@500;700;800', Merriweather: 'Merriweather:wght@400;700' };
const fontOf = (f, fallback) => (NOTICE_FONTS.includes(f) ? `'${f}', ${fallback}` : fallback);
export const STRIPS = { hidden: 0, slim: 130, normal: 210, wide: 280 };
const STRIP_TITLE = { slim: 76, normal: 118, wide: 150 };
/** Ready-made looks: colours of the strip, page, text, section bands and table in one tap */
export const DESIGNS = {
    classic: { label: 'Classic blue', strip: '#1d6fe0', bg: '#dcebfb', color: '#404040', headInk: '#0e1f45', thBg: '#4f86ea', tdBg: '#2f6fe0', td1Bg: '#3b7be6', tblInk: '#ffffff', noteInk: '#1d47b8', bands: ['#a99cf0', '#f0a9c4', '#f2cf6b', '#7fc9be', '#8fd0f0', '#7d95e6'], media: true },
    gold: { label: 'Gold & cream', strip: '#8a6a1f', bg: '#fbf4e4', color: '#3b3226', headInk: '#3b2a08', thBg: '#b8912f', tdBg: '#d9b45a', td1Bg: '#c9a043', tblInk: '#2b2006', noteInk: '#8a6a1f', bands: ['#e6c77a', '#d9b45a', '#f0dca8', '#c9a043', '#e6c77a', '#f0dca8'], media: false },
    green: { label: 'Green', strip: '#0f6b4c', bg: '#e8f5ee', color: '#23362c', headInk: '#0b3b29', thBg: '#2f8f68', tdBg: '#1f7a56', td1Bg: '#278562', tblInk: '#ffffff', noteInk: '#0f6b4c', bands: ['#9fd8bd', '#bde5c9', '#8fcfb0', '#cdebd9', '#9fd8bd', '#bde5c9'], media: false },
    dark: { label: 'Dark', strip: '#c9a227', bg: '#0f1626', color: '#e9edf5', headInk: '#ffffff', thBg: '#c9a227', tdBg: '#24314d', td1Bg: '#2d3c5c', tblInk: '#ffffff', noteInk: '#f5d78e', bands: ['#3a4d7a', '#5a3a7a', '#7a5a2a', '#2a6a5a', '#3a4d7a', '#5a3a7a'], media: false },
};
/** Put a design on a poster (colours only — text, tables and pictures stay) */
export function applyDesign(n, key) {
    const d = DESIGNS[key]; if (!d) return n;
    Object.assign(n, { strip: d.strip, bg: d.bg, color: d.color, headInk: d.headInk, thBg: d.thBg, tdBg: d.tdBg, td1Bg: d.td1Bg, tblInk: d.tblInk, noteInk: d.noteInk, design: key });
    if (d.media) { n.bgVideo = BG.bgVideo; n.bgImage = BG.bgImage; } else { n.bgVideo = ''; n.bgImage = ''; }
    (n.sections || []).forEach((s, i) => { s.band = d.bands[i % d.bands.length]; });
    return n;
}

/* ---------------------------------- the notice poster ---------------------------------- */

/** "a | b\n^ | c\n# Heading" → table HTML: '#' rows are heading rows (one cell spans the table), '^' merges with the cell above */
export function tableHtml(src, color) {
    const rows = String(src || '').split('\n').map(l => l.trim()).filter(Boolean).map(l => {
        const head = l.startsWith('#');
        return { head, cells: (head ? l.slice(1) : l).split('|').map(c => c.trim()) };
    });
    if (!rows.length) return '';
    const cols = Math.max(...rows.map(r => r.cells.length));
    const span = rows.map(r => r.cells.map(() => 1));
    // '^' cells: the nearest real cell above in that column grows by one row
    rows.forEach((r, i) => r.cells.forEach((c, j) => {
        if (c !== '^' || r.head) return;
        for (let k = i - 1; k >= 0; k--) { if (rows[k].head) break; if (rows[k].cells[j] !== '^') { span[k][j]++; break; } }
    }));
    const body = rows.map((r, i) => {
        if (r.head && r.cells.length === 1) return `<tr class="h"><th colspan="${cols}">${inline(r.cells[0])}</th></tr>`;
        const tag = r.head ? 'th' : 'td';
        return `<tr${r.head ? ' class="h"' : ''}>${r.cells.map((c, j) => c === '^' && !r.head ? '' : `<${tag}${span[i][j] > 1 ? ` rowspan="${span[i][j]}"` : ''}${j === r.cells.length - 1 && r.cells.length < cols ? ` colspan="${cols - j}"` : ''}>${inline(c)}</${tag}>`).join('')}</tr>`;
    }).join('');
    return `<table class="nt-t">${body}</table>`;
}

/** The notice poster as HTML for a 1080 × 1920 box; `img(id)` gives the URL of a picture. fitNotice() then sizes the text to fill it. */
export function noticeHtml(n, img) {
    const right = n.side === 'right';
    // background: a looping video (the bubbles of the announcement slides) over its first frame as a picture, or a colour
    const bg = (n.bgImage ? `<img class="nt-bgm" src="${esc(img(n.bgImage))}" alt="">` : '') + (n.bgVideo ? `<video class="nt-bgm" src="${esc(img(n.bgVideo))}" autoplay muted loop playsinline></video>` : '');
    const strip = STRIPS[n.stripSize] ?? STRIPS.normal;
    const titleSize = Number(n.titleSize) || (right && (n.stripSize || 'normal') === 'normal' ? 96 : STRIP_TITLE[n.stripSize || 'normal'] || 118);
    const fonts = [n.headFont, n.bodyFont].filter(f => GOOGLE[f]).map(f => GOOGLE[f]);
    const fontLink = fonts.length ? `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?${[...new Set(fonts)].map(f => 'family=' + f).join('&')}&display=swap">` : '';
    const sections = (n.sections || []).map(s => {
        const pic = s.image ? `<img class="nt-img" src="${esc(img(s.image))}" alt="">` : '';
        const text = s.text ? `<div class="nt-txt" style="text-align:${s.align === 'center' ? 'center' : 'left'}">${String(s.text).split('\n').map(l => `<div>${inline(l) || '&nbsp;'}</div>`).join('')}</div>` : '';
        const note = s.note ? `<div class="nt-note">${String(s.note).split('\n').map(l => `<div>${inline(l)}</div>`).join('')}</div>` : '';
        const scale = Number(s.scale) && Number(s.scale) !== 100 ? ` style="font-size:${Math.max(50, Math.min(200, Number(s.scale))) / 100}em"` : '';
        return `<section class="nt-s"${scale}>
            <div class="nt-head"><span class="nt-ico" style="background:${esc(s.band)}">${esc(s.icon || '')}</span><h2 style="background:linear-gradient(90deg, ${esc(s.band)}, ${esc(s.band)}cc 75%, transparent)">${inline(s.title)}</h2></div>
            <div class="nt-body${pic ? ' with-img' : ''}">${text}${pic}</div>${s.table ? tableHtml(s.table, n.color) : ''}${note}
        </section>`;
    }).join('');
    const v = (k, d) => esc(n[k] || d);
    return `<div class="nt ${right ? 'nt-r' : 'nt-l'}${strip ? '' : ' nt-nostrip'}" style="--strip:${v('strip', '#1d6fe0')};--bg:${v('bg', '#dcebfb')};--ink:${v('color', '#404040')};--head-ink:${v('headInk', '#0e1f45')};--th-bg:${v('thBg', '#4f86ea')};--td-bg:${v('tdBg', '#2f6fe0')};--td1-bg:${v('td1Bg', '#3b7be6')};--tbl-ink:${v('tblInk', '#ffffff')};--note-ink:${v('noteInk', '#1d47b8')};--strip-w:${strip}px;--title-size:${titleSize}px;--body-font:${fontOf(n.bodyFont, "Georgia, 'Times New Roman', serif").replace(/"/g, '')};--head-font:${fontOf(n.headFont || n.bodyFont, "Georgia, 'Times New Roman', serif").replace(/"/g, '')}">${fontLink}${bg}
        <style>
            .nt { position: absolute; inset: 0; display: flex; background: var(--bg); font-family: var(--body-font); color: var(--ink); overflow: hidden; }
            .nt-bgm { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
            .nt-r { flex-direction: row-reverse; }
            .nt-side { position: relative; width: var(--strip-w); flex: none; display: flex; align-items: center; justify-content: center; background: linear-gradient(180deg, var(--strip), color-mix(in srgb, var(--strip) 70%, #000)); }
            .nt-side span { writing-mode: vertical-rl; transform: rotate(180deg); font-size: var(--title-size); font-family: var(--head-font); color: #fff; letter-spacing: 2px; white-space: nowrap; text-shadow: 0 2px 6px rgba(0,0,0,.25); }
            .nt-r .nt-side span { transform: none; letter-spacing: 10px; }
            .nt-nostrip .nt-side { display: none; } .nt-nostrip .nt-main { padding-left: 34px !important; padding-right: 34px !important; }
            .nt-main { position: relative; flex: 1; min-width: 0; margin: 40px 0; padding: 24px 34px 24px 0; display: flex; flex-direction: column; justify-content: space-evenly; overflow: hidden; }
            .nt-r .nt-main { padding: 24px 0 24px 34px; }
            .nt-s { margin: 0.25em 0; }
            .nt-head { display: flex; align-items: center; position: relative; margin-bottom: 0.3em; }
            .nt-ico { width: 2.2em; height: 2.2em; border-radius: 0 50% 50% 0; display: inline-flex; align-items: center; justify-content: center; font-size: 1.05em; flex: none; margin-right: -0.3em; position: relative; z-index: 1; box-shadow: 0 2px 4px rgba(0,0,0,.2); }
            .nt-head h2 { flex: 1; margin: 0; padding: 0.15em 0.8em; font-size: 1.2em; font-weight: 700; color: var(--head-ink); font-family: var(--head-font); letter-spacing: .5px; }
            .nt-body { padding: 0 0.4em 0 2em; line-height: 1.3; }
            .nt-body.with-img { display: flex; align-items: center; gap: 0.6em; }
            .nt-body.with-img .nt-txt { flex: 1; }
            .nt-img { width: 6.5em; height: 6.5em; object-fit: contain; flex: none; }
            .nt-t { margin: 0.2em 0.4em 0.2em 1.4em; border-collapse: collapse; width: calc(100% - 1.8em); font-family: Arial, Helvetica, sans-serif; font-size: .8em; }
            .nt-t td, .nt-t th { border: 1.5px solid #fff; padding: 0.3em 0.4em; text-align: center; background: var(--td-bg); color: var(--tbl-ink); }
            .nt-t td:first-child:not(:last-child) { background: var(--td1-bg); }
            .nt-t tr.h th { background: var(--th-bg); color: var(--tbl-ink); font-weight: 700; }
            .nt-note { text-align: center; font-family: Arial, Helvetica, sans-serif; font-size: .75em; color: var(--note-ink); margin-top: 0.2em; }
        </style>
        <div class="nt-side"><span>${inline(n.title)}</span></div>
        <div class="nt-main"${Number(n.textSize) ? ` data-size="${Math.max(12, Math.min(120, Number(n.textSize)))}"` : ''}>${sections}</div>
    </div>`;
}

/** Biggest text that still fits the poster box (binary search on the font size) */
export function fitNotice(box, again = true) {
    const main = box.querySelector('.nt-main');
    if (!main) return;
    if (main.dataset.size) { main.style.fontSize = main.dataset.size + 'px'; return; }   // a fixed text size chosen in the builder
    if (again && document.fonts && document.fonts.status !== 'loaded') document.fonts.ready.then(() => fitNotice(box, false));   // a web font arriving later changes the sizes
    let lo = 18, hi = 80;
    for (let i = 0; i < 9; i++) {
        const mid = (lo + hi) / 2;
        main.style.fontSize = mid + 'px';
        if (main.scrollHeight <= main.clientHeight + 1) lo = mid; else hi = mid;
    }
    main.style.fontSize = Math.floor(lo) + 'px';
}

/* ---------------------------------- schedule ---------------------------------- */

/** Saudi time (UTC+3, no daylight saving) of a moment: { day: 'YYYY-MM-DD', dow, hm: 'HH:MM' } */
export function saudi(ms) {
    const d = new Date(ms + 3 * 3600e3);
    const p = (n) => String(n).padStart(2, '0');
    return { day: `${d.getUTCFullYear()}-${p(d.getUTCMonth() + 1)}-${p(d.getUTCDate())}`, dow: d.getUTCDay(), hm: `${p(d.getUTCHours())}:${p(d.getUTCMinutes())}` };
}
/** Is the slide's schedule on at Saudi moment t? (no schedule = always) — from/to may wrap past midnight (22:00 → 02:00) */
export function schedOn(sched, t) {
    if (!sched || !sched.on) return true;
    if (sched.dateFrom && t.day < sched.dateFrom) return false;
    if (sched.dateTo && t.day > sched.dateTo) return false;
    const from = sched.from || '00:00', to = sched.to || '23:59';
    const wraps = to < from, inTime = wraps ? (t.hm >= from || t.hm < to) : (t.hm >= from && t.hm < to || (to === '23:59' && t.hm === '23:59'));
    // after midnight in a wrapping window the day that counts is the one it began on
    const dow = wraps && t.hm < to ? (t.dow + 6) % 7 : t.dow;
    const days = Array.isArray(sched.days) && sched.days.length ? sched.days : [0, 1, 2, 3, 4, 5, 6];
    return inTime && days.includes(dow);
}
/** The slides to play now, in order */
export function playing(cfg, ms) {
    const t = saudi(ms);
    const ok = (cfg.slides || []).filter(s => s.on !== false && schedOn(s.sched, t) && (s.kind === 'notice' || (s.media || []).length));
    const only = ok.filter(s => s.sched && s.sched.on && s.sched.only);
    return only.length ? only : ok;
}
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
/** "Thu Fri · 12:30–14:00 · from 10 Nov · only" */
export function schedLabel(s) {
    if (!s || !s.on) return 'Always';
    const d = Array.isArray(s.days) && s.days.length && s.days.length < 7 ? s.days.map(x => DAYS[x]).join(' ') : 'Every day';
    return [d, `${s.from || '00:00'}–${s.to || '23:59'}`, s.dateFrom && `from ${s.dateFrom}`, s.dateTo && `until ${s.dateTo}`, s.only && 'only this'].filter(Boolean).join(' · ');
}

/** CSS placing the 1080 × 1920 stage in a W × H window, turned by `rotate` degrees */
export function stageTransform(rotate, W, H) {
    const side = rotate === 90 || rotate === -90;
    const s = side ? Math.min(W / STAGE_H, H / STAGE_W) : Math.min(W / STAGE_W, H / STAGE_H);
    return { left: (W - STAGE_W) / 2, top: (H - STAGE_H) / 2, transform: `rotate(${rotate || 0}deg) scale(${s})` };
}

/* ---------------------------------- free design slides (Signage Builder → Screen 1 / 2 → Design) ---------------------------------- */
// A slide drawn like a PowerPoint page on the 1080 × 1920 stage: elements placed anywhere, sized, turned, layered (array order = back to front).
// design { bg, bgImage, bgFit, elements: [el…] }
// el { id, type, x, y, w, h, rot, opacity, … }
//   text   text (lines; **bold**, !!red!!, __underline__), font, size, color, bold, italic, underline, align, valign, bg, radius, pad, lh, shadow, border, borderColor
//   clock  as text, fmt: 'time12' | 'time24' | 'date' | 'day' — kept live on the screen
//   shape  shape: 'rect' | 'ellipse', fill, border, borderColor, radius
//   image  src (media id or asset:), fit: 'contain' | 'cover' | 'fill', radius · video src, fit, radius (muted, looping)
//   table  cells [[…]], head (first row a heading row), font, size, color, headBg, headColor, cellBg, altBg, line, lineW, radius, bold
export const DESIGN_FONTS = [...NOTICE_FONTS, 'Amiri', 'Cairo', 'Oswald', 'Montserrat'];
const GOOGLE2 = { ...GOOGLE, Amiri: 'Amiri:wght@400;700', Cairo: 'Cairo:wght@400;700', Oswald: 'Oswald:wght@400;700', Montserrat: 'Montserrat:wght@400;700;900' };
const okColor = (c) => (/^#[0-9a-f]{3,8}$/i.test(String(c || '')) || /^rgba?\([\d\s.,%]+\)$/i.test(String(c || '')) ? String(c) : '');
const fontCss = (f) => (DESIGN_FONTS.includes(f) ? `'${f}', Arial, sans-serif` : "Georgia, 'Times New Roman', serif");
const num = (v, d) => (v !== '' && v != null && Number.isFinite(Number(v)) ? Number(v) : d);
const pad2 = (n) => String(n).padStart(2, '0');
/** The live text of a clock element, Saudi time */
export function liveText(fmt, at = Date.now()) {
    const d = new Date(at + 3 * 3600e3);   // Saudi Arabia: UTC+3
    const h = d.getUTCHours(), m = pad2(d.getUTCMinutes());
    if (fmt === 'time24') return `${pad2(h)}:${m}`;
    if (fmt === 'date') return d.toLocaleDateString('en-GB', { timeZone: 'UTC', day: 'numeric', month: 'long', year: 'numeric' });
    if (fmt === 'day') return d.toLocaleDateString('en-GB', { timeZone: 'UTC', weekday: 'long', day: 'numeric', month: 'long' });
    return `${h % 12 || 12}:${m} ${h < 12 ? 'AM' : 'PM'}`;
}
const textCss = (e) => [`font-family:${fontCss(e.font)}`, `font-size:${num(e.size, 48)}px`, `color:${okColor(e.color) || '#111111'}`, `font-weight:${e.bold ? 700 : 400}`,
    `font-style:${e.italic ? 'italic' : 'normal'}`, `text-decoration:${e.underline ? 'underline' : 'none'}`, `text-align:${['left', 'center', 'right'].includes(e.align) ? e.align : 'left'}`,
    `line-height:${num(e.lh, 1.2)}`, e.shadow ? 'text-shadow:0 3px 10px rgba(0,0,0,.35)' : ''].filter(Boolean).join(';');
/** The box of one element (position, size, turn) */
export function elBoxCss(e) {
    const base = ['position:absolute', `left:${num(e.x, 0)}px`, `top:${num(e.y, 0)}px`, `width:${Math.max(4, num(e.w, 200))}px`, `height:${Math.max(4, num(e.h, 100))}px`,
        `opacity:${Math.max(0, Math.min(1, num(e.opacity, 1)))}`, e.rot ? `transform:rotate(${num(e.rot, 0)}deg)` : '', 'box-sizing:border-box'];
    const border = num(e.border, 0) > 0 ? `border:${num(e.border, 0)}px solid ${okColor(e.borderColor) || '#000000'}` : '';
    if (e.type === 'shape') base.push(`background:${okColor(e.fill) || 'transparent'}`, border, `border-radius:${e.shape === 'ellipse' ? '50%' : num(e.radius, 0) + 'px'}`);
    if (e.type === 'text' || e.type === 'clock') base.push(`background:${okColor(e.bg) || 'transparent'}`, border, `border-radius:${num(e.radius, 0)}px`, `padding:${num(e.pad, 8)}px`,
        'display:flex', 'flex-direction:column', `justify-content:${e.valign === 'top' ? 'flex-start' : e.valign === 'bottom' ? 'flex-end' : 'center'}`, 'overflow:hidden', textCss(e));
    if (e.type === 'image' || e.type === 'video' || e.type === 'table') base.push(`border-radius:${num(e.radius, 0)}px`, 'overflow:hidden', border);
    return base.filter(Boolean).join(';');
}
/** What is inside one element (HTML); `img(id)` gives a file's address */
export function elInner(e, img) {
    if (e.type === 'text') return String(e.text ?? '').split('\n').map(l => `<div>${inline(l) || '&nbsp;'}</div>`).join('');
    if (e.type === 'clock') return `<div data-live="${esc(e.fmt || 'time12')}">${esc(liveText(e.fmt))}</div>`;
    if (e.type === 'image') return e.src ? `<img src="${esc(img(e.src))}" alt="" draggable="false" style="width:100%;height:100%;display:block;object-fit:${e.fit === 'cover' ? 'cover' : e.fit === 'fill' ? 'fill' : 'contain'}">` : '';
    if (e.type === 'video') return e.src ? `<video src="${esc(img(e.src))}" autoplay muted loop playsinline style="width:100%;height:100%;display:block;object-fit:${e.fit === 'cover' ? 'cover' : 'contain'}"></video>` : '';
    if (e.type === 'table') {
        const rows = Array.isArray(e.cells) ? e.cells : [];
        const line = okColor(e.line) || '#ffffff';
        return `<table style="width:100%;height:100%;border-collapse:collapse;table-layout:fixed;${textCss({ ...e, align: e.align || 'center', size: num(e.size, 34) })}">${rows.map((r, i) => {
            const head = e.head !== false && i === 0;
            const bg = head ? okColor(e.headBg) || '#1d4ed8' : (i % 2 === 0 && okColor(e.altBg)) || okColor(e.cellBg) || '#dbeafe';
            const color = head ? okColor(e.headColor) || '#ffffff' : okColor(e.color) || '#111111';
            const tag = head ? 'th' : 'td';
            return `<tr>${(Array.isArray(r) ? r : []).map((c, j) => `<${tag} data-cell="${i}:${j}" style="border:${num(e.lineW, 3)}px solid ${line};padding:0.25em 0.35em;background:${bg};color:${color};font-weight:${head || e.bold ? 700 : 400}">${String(c ?? '').split('\n').map(l => inline(l)).join('<br>') || '&nbsp;'}</${tag}>`).join('')}</tr>`;
        }).join('')}</table>`;
    }
    return '';
}
/** The fonts a design uses, as one Google Fonts link */
export function designFonts(d) {
    const fams = [...new Set(((d && d.elements) || []).map(e => e.font).filter(f => GOOGLE2[f]))];
    return fams.length ? `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?${fams.map(f => 'family=' + GOOGLE2[f]).join('&')}&display=swap">` : '';
}
export function designBgCss(d, img) {
    const bg = okColor(d && d.bg) || '#ffffff';
    return d && d.bgImage ? `background:${bg} url("${String(img(d.bgImage)).replace(/"/g, '')}") center/${d.bgFit === 'contain' ? 'contain' : 'cover'} no-repeat` : `background:${bg}`;
}
/** A design slide as HTML for the 1080 × 1920 stage */
export function designHtml(d, img) {
    d = d || {};
    return `<div class="dz" style="position:absolute;inset:0;overflow:hidden;${designBgCss(d, img)}">${designFonts(d)}${(d.elements || []).map(e => `<div style="${elBoxCss(e)}">${elInner(e, img)}</div>`).join('')}</div>`;
}
let ticking = 0;
/** Keeps every clock element on the page showing the time (one timer for the whole page) */
export function tickDesign() {
    if (ticking) return;
    ticking = setInterval(() => { for (const el of document.querySelectorAll('[data-live]')) { const t = liveText(el.getAttribute('data-live')); if (el.textContent !== t) el.textContent = t; } }, 1000);
}
export const newDesign = () => ({ bg: '#fdf8ee', elements: [] });

/** A notice poster turned into a free design (so it can be changed element by element) */
export function noticeToDesign(n) {
    n = n || {};
    const right = n.side === 'right', strip = STRIPS[n.stripSize] ?? STRIPS.normal;
    const els = [];
    if (strip) {
        els.push({ id: newId(), type: 'shape', shape: 'rect', x: right ? STAGE_W - strip : 0, y: 0, w: strip, h: STAGE_H, fill: n.strip || '#1d6fe0' });
        els.push({ id: newId(), type: 'text', text: n.title || 'Important Notice', x: (right ? STAGE_W - strip : 0) + strip / 2 - 900, y: STAGE_H / 2 - strip / 2, w: 1800, h: strip, rot: right ? 90 : -90,
            font: n.headFont || 'Georgia', size: Number(n.titleSize) || (strip > 200 ? 118 : 80), color: '#ffffff', align: 'center', valign: 'middle', pad: 0 });
    }
    const left = right ? 34 : strip + 30, width = STAGE_W - strip - 64;
    const secs = n.sections || [];
    // each section's height at text size z (lines wrap at the column width); the biggest z for which all of them fit the page
    const tableRows = (sct) => String(sct.table || '').split('\n').map(l => l.trim()).filter(Boolean);
    const lines = (t, z) => String(t || '').split('\n').reduce((c, l) => c + Math.max(1, Math.ceil(l.length * z * 0.52 / (width - 70))), 0);
    const heightOf = (sct, z) => z * 1.9 + (sct.text ? lines(sct.text, z) * z * 1.32 + 14 : 0) + (sct.table ? tableRows(sct).length * z * 1.3 + 10 : 0) + (sct.note ? lines(sct.note, z * 0.75) * z * 1.1 + 6 : 0) + z * 0.7;
    let size = 46;
    while (size > 20 && secs.reduce((t, sct) => t + heightOf(sct, size), 0) > STAGE_H - 80) size -= 1;
    const spare = Math.max(0, (STAGE_H - 80 - secs.reduce((t, sct) => t + heightOf(sct, size), 0)) / Math.max(1, secs.length));
    let y = 40;
    secs.forEach((sc) => {
        const head = Math.round(size * 1.9);
        els.push({ id: newId(), type: 'shape', shape: 'rect', x: left, y: Math.round(y), w: width, h: head, fill: sc.band || '#8f9ef0', radius: 14 });
        els.push({ id: newId(), type: 'text', text: `${sc.icon || ''} ${sc.title || ''}`.trim(), x: left + 10, y: Math.round(y), w: width - 20, h: head, font: n.headFont || n.bodyFont || 'Georgia', size: Math.round(size * 1.15), bold: true, color: n.headInk || '#0e1f45', valign: 'middle', pad: 6 });
        let yy = y + head + 6;
        if (sc.text) { const th = lines(sc.text, size) * size * 1.32 + 14; els.push({ id: newId(), type: 'text', text: sc.text, x: left + 30, y: Math.round(yy), w: width - 40, h: Math.round(th), font: n.bodyFont || 'Georgia', size, color: n.color || '#404040', align: sc.align === 'center' ? 'center' : 'left', valign: 'top', pad: 4 }); yy += th; }
        if (sc.table) {
            const rows = tableRows(sc).map(l => (l.startsWith('#') ? l.slice(1) : l).split('|').map(c => (c.trim() === '^' ? '' : c.trim())));
            const cols = Math.max(...rows.map(r => r.length)); const cells = rows.map(r => [...r, ...Array(cols - r.length).fill('')]);
            const th = rows.length * size * 1.3;
            els.push({ id: newId(), type: 'table', cells, head: String(sc.table).trim().startsWith('#'), x: left + 30, y: Math.round(yy), w: width - 40, h: Math.round(th), font: 'Arial', size: Math.round(size * 0.8), headBg: n.thBg || '#4f86ea', headColor: n.tblInk || '#ffffff', cellBg: n.tdBg || '#2f6fe0', color: n.tblInk || '#ffffff', line: '#ffffff' });
            yy += th + 10;
        }
        if (sc.note) { const nh = lines(sc.note, size * 0.75) * size * 1.1 + 6; els.push({ id: newId(), type: 'text', text: sc.note, x: left + 30, y: Math.round(yy), w: width - 40, h: Math.round(nh), font: 'Arial', size: Math.round(size * 0.75), color: n.noteInk || '#1d47b8', align: 'center', pad: 2 }); }
        y += heightOf(sc, size) + spare;
    });
    return { bg: n.bg || '#dcebfb', elements: els };
}
