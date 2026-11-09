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
    return `<table class="nt-t" style="color:${esc(color)}">${body}</table>`;
}

/** The notice poster as HTML for a 1080 × 1920 box; `img(id)` gives the URL of a picture. fitNotice() then sizes the text to fill it. */
export function noticeHtml(n, img) {
    const right = n.side === 'right';
    // background: a looping video (the bubbles of the announcement slides) over its first frame as a picture, or a colour
    const bg = (n.bgImage ? `<img class="nt-bgm" src="${esc(img(n.bgImage))}" alt="">` : '') + (n.bgVideo ? `<video class="nt-bgm" src="${esc(img(n.bgVideo))}" autoplay muted loop playsinline></video>` : '');
    const sections = (n.sections || []).map(s => {
        const pic = s.image ? `<img class="nt-img" src="${esc(img(s.image))}" alt="">` : '';
        const text = s.text ? `<div class="nt-txt" style="text-align:${s.align === 'center' ? 'center' : 'left'}">${String(s.text).split('\n').map(l => `<div>${inline(l) || '&nbsp;'}</div>`).join('')}</div>` : '';
        const note = s.note ? `<div class="nt-note">${String(s.note).split('\n').map(l => `<div>${inline(l)}</div>`).join('')}</div>` : '';
        return `<section class="nt-s">
            <div class="nt-head"><span class="nt-ico" style="background:${esc(s.band)}">${esc(s.icon || '')}</span><h2 style="background:linear-gradient(90deg, ${esc(s.band)}, ${esc(s.band)}cc 75%, transparent)">${inline(s.title)}</h2></div>
            <div class="nt-body${pic ? ' with-img' : ''}">${text}${pic}</div>${s.table ? tableHtml(s.table, n.color) : ''}${note}
        </section>`;
    }).join('');
    return `<div class="nt ${right ? 'nt-r' : 'nt-l'}" style="--strip:${esc(n.strip || '#1d6fe0')};--bg:${esc(n.bg || '#dcebfb')};--ink:${esc(n.color || '#404040')}">${bg}
        <style>
            .nt { position: absolute; inset: 0; display: flex; background: var(--bg); font-family: Georgia, 'Times New Roman', serif; color: var(--ink); overflow: hidden; }
            .nt-bgm { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
            .nt-r { flex-direction: row-reverse; }
            .nt-side { position: relative; width: 210px; flex: none; display: flex; align-items: center; justify-content: center; background: linear-gradient(180deg, var(--strip), color-mix(in srgb, var(--strip) 70%, #000)); }
            .nt-side span { writing-mode: vertical-rl; transform: rotate(180deg); font-size: 118px; color: #fff; letter-spacing: 2px; white-space: nowrap; text-shadow: 0 2px 6px rgba(0,0,0,.25); }
            .nt-r .nt-side span { transform: none; letter-spacing: 10px; font-size: 96px; }
            .nt-main { position: relative; flex: 1; min-width: 0; margin: 40px 0; padding: 24px 34px 24px 0; display: flex; flex-direction: column; justify-content: space-evenly; overflow: hidden; }
            .nt-r .nt-main { padding: 24px 0 24px 34px; }
            .nt-s { margin: 0.25em 0; }
            .nt-head { display: flex; align-items: center; position: relative; margin-bottom: 0.3em; }
            .nt-ico { width: 2.2em; height: 2.2em; border-radius: 0 50% 50% 0; display: inline-flex; align-items: center; justify-content: center; font-size: 1.05em; flex: none; margin-right: -0.3em; position: relative; z-index: 1; box-shadow: 0 2px 4px rgba(0,0,0,.2); }
            .nt-head h2 { flex: 1; margin: 0; padding: 0.15em 0.8em; font-size: 1.2em; font-weight: 700; color: #0e1f45; letter-spacing: .5px; }
            .nt-body { padding: 0 0.4em 0 2em; line-height: 1.3; }
            .nt-body.with-img { display: flex; align-items: center; gap: 0.6em; }
            .nt-body.with-img .nt-txt { flex: 1; }
            .nt-img { width: 6.5em; height: 6.5em; object-fit: contain; flex: none; }
            .nt-t { margin: 0.2em 0.4em 0.2em 1.4em; border-collapse: collapse; width: calc(100% - 1.8em); font-family: Arial, Helvetica, sans-serif; font-size: .8em; }
            .nt-t td, .nt-t th { border: 1.5px solid #fff; padding: 0.3em 0.4em; text-align: center; background: #2f6fe0; color: #fff; }
            .nt-t td:first-child:not(:last-child) { background: #3b7be6; }
            .nt-t tr.h th { background: #4f86ea; color: #dfe9ff; font-weight: 700; }
            .nt-note { text-align: center; font-family: Arial, Helvetica, sans-serif; font-size: .75em; color: #1d47b8; margin-top: 0.2em; }
        </style>
        <div class="nt-side"><span>${inline(n.title)}</span></div>
        <div class="nt-main">${sections}</div>
    </div>`;
}

/** Biggest text that still fits the poster box (binary search on the font size) */
export function fitNotice(box) {
    const main = box.querySelector('.nt-main');
    if (!main) return;
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
