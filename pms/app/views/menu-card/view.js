// Menu Card (Mawaid): the day's lunch and dinner menu drawn as an A4-landscape image, after the Canva deck
// "Mawaid Menu" — desert background, corner ornaments, the city in Arabic, the Gregorian + Misri Hijri date
// (core/hijri.js, as on Home) and one dish per line under a Lunch and a Dinner band. Download it
// (JPEG), copy it to the clipboard, or share it (phones). Assets come from that deck (assets/menu-card/, Amiri: OFL).
// Drawn on a <canvas> in slide units (EMU) so the layout matches the deck exactly.

import { toHijri, HIJRI_MONTHS } from '../../core/hijri.js';

const ASSETS = new URL('../../../assets/menu-card/', import.meta.url).href;
const SLIDE_W = 10692000, SLIDE_H = 7560000;        // EMU, A4 landscape
const OUT_W = 2400, OUT_H = Math.round(OUT_W * SLIDE_H / SLIDE_W);
const K = OUT_W / SLIDE_W;                          // EMU → px
const PT = 12700;                                   // EMU per point
const INK = '#57360F';
const STORE = 'pms_menu_card';

const COLS = [{ x: 1334552, w: 3081145 }, { x: 5531706, w: 3081145 }];
const BAND = { y: 2188471, h: 515025, w: 3078191, xs: [1334552, 5533181] };
const FIRST_LINE = 3226770, PITCH = 530560, LAST_LINE_MAX = 6700000;
const ITEM_PT = 19.52;
const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const pad = (n) => String(n).padStart(2, '0');
const isoOf = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

// fonts and images load once per page load
let assetsReady = null;
function loadAssets() {
    if (assetsReady) return assetsReady;
    const img = (name) => new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = ASSETS + name; });
    const font = (family, file) => new FontFace(family, `url(${ASSETS}${file})`).load().then(f => { document.fonts.add(f); return f; });
    assetsReady = Promise.all([img('desert.jpg'), img('corner.png'), img('makkah.png'),
        font('MenuAmiri', 'Amiri-Regular.ttf'), font('MenuAmiriBold', 'Amiri-Bold.ttf')])
        .then(([bg, corner, makkah]) => ({ bg, corner, makkah }))
        .catch(e => { assetsReady = null; throw e; });
    return assetsReady;
}

function readStore() {
    try { return JSON.parse(localStorage.getItem(STORE) || '{}') || {}; } catch { return {}; }
}
function writeStore(s) {
    try { localStorage.setItem(STORE, JSON.stringify(s)); } catch { }
}

export default async function mount(ctx) {
    const $ = (id) => ctx.root.querySelector('#' + id);
    const canvas = $('mcdCanvas');
    canvas.width = OUT_W; canvas.height = OUT_H;
    const g = canvas.getContext('2d');
    const msg = (t, cls = '') => { $('mcdMsg').textContent = t; $('mcdMsg').className = 'tp-muted ' + cls; };

    const store = readStore();
    store.drafts ||= {};
    $('mcdLunchTime').value = store.lunchTime || '1:30';
    $('mcdDinnerTime').value = store.dinnerTime || '7:30';

    const dateOf = () => { const [y, m, d] = $('mcdDate').value.split('-').map(Number); return y ? new Date(y, m - 1, d) : new Date(); };
    function autoLines() {
        const d = dateOf(), h = toHijri(d);
        return { greg: `${WEEKDAYS[d.getDay()]} ${pad(d.getDate())} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`,
            hijri: `${pad(h.day)} ${HIJRI_MONTHS[h.month]} ${h.year}` };
    }
    function fillDateLines() {
        const a = autoLines();
        $('mcdGreg').value = a.greg; $('mcdHijri').value = a.hijri;
    }
    // each date keeps its own menu (and date lines, if edited) on this device
    function loadDraft() {
        const dr = store.drafts[$('mcdDate').value] || {};
        $('mcdLunch').value = dr.lunch || '';
        $('mcdDinner').value = dr.dinner || '';
        fillDateLines();
        if (dr.greg) $('mcdGreg').value = dr.greg;
        if (dr.hijri) $('mcdHijri').value = dr.hijri;
    }
    function saveDraft() {
        const key = $('mcdDate').value;
        if (!key) return;
        const a = autoLines(), greg = $('mcdGreg').value, hijri = $('mcdHijri').value;
        const dr = {
            lunch: $('mcdLunch').value, dinner: $('mcdDinner').value,
            greg: greg !== a.greg ? greg : undefined,     // only edited date lines are kept
            hijri: hijri !== a.hijri ? hijri : undefined,
        };
        if (dr.lunch.trim() || dr.dinner.trim() || dr.greg || dr.hijri) store.drafts[key] = dr; else delete store.drafts[key];
        // keep the 60 most recent dates
        const keys = Object.keys(store.drafts).sort();
        for (const k of keys.slice(0, Math.max(0, keys.length - 60))) delete store.drafts[k];
        store.lunchTime = $('mcdLunchTime').value;
        store.dinnerTime = $('mcdDinnerTime').value;
        writeStore(store);
    }

    /* ------------------------------ drawing ------------------------------ */
    let assets = null;
    const px = (emu) => emu * K;
    const font = (pt, bold = false) => `${(pt * PT * K).toFixed(2)}px ${bold ? 'MenuAmiriBold' : 'MenuAmiri'}`;
    const lines = (id) => $(id).value.split(/\r?\n/).map(s => s.trim()).filter(Boolean);

    function roundRect(x, y, w, h, r) {
        g.beginPath();
        g.moveTo(x + r, y); g.lineTo(x + w - r, y); g.quadraticCurveTo(x + w, y, x + w, y + r);
        g.lineTo(x + w, y + h - r); g.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        g.lineTo(x + r, y + h); g.quadraticCurveTo(x, y + h, x, y + h - r);
        g.lineTo(x, y + r); g.quadraticCurveTo(x, y, x + r, y);
        g.closePath();
    }

    function draw() {
        if (!assets) return;
        const { bg, corner, makkah } = assets;
        g.save();
        g.clearRect(0, 0, OUT_W, OUT_H);
        g.letterSpacing = '0px';

        // background: the deck stretches the picture 122% wide, anchored right
        g.drawImage(bg, px(-0.2218 * SLIDE_W), 0, px(1.2218 * SLIDE_W), OUT_H);

        // corner ornaments (left one mirrored)
        const cs = px(1132280);
        g.drawImage(corner, px(9559720), px(39847), cs, cs);
        g.save(); g.translate(cs, px(39847)); g.scale(-1, 1); g.drawImage(corner, 0, 0, cs, cs); g.restore();

        // the city in Arabic
        if (ctx.siteId === 'makkah') {
            g.drawImage(makkah, px(4209293), px(-716804), px(2273413), px(2273413));
        } else {
            g.fillStyle = '#1b1208'; g.textAlign = 'center'; g.textBaseline = 'alphabetic';
            g.font = font(38, true);
            g.fillText('المدينة المنورة', px(5346000), px(640000));
        }

        // date lines
        g.fillStyle = INK; g.textAlign = 'center'; g.textBaseline = 'alphabetic';
        g.font = font(30);
        g.letterSpacing = `${(-0.48 * PT * K).toFixed(2)}px`;
        g.fillText($('mcdGreg').value.trim(), px(5310000), px(1300000), px(6200000));
        g.fillText($('mcdHijri').value.trim(), px(5310000), px(1765000), px(6200000));

        // meal bands
        g.letterSpacing = '0px';
        const bands = [`Lunch | ${$('mcdLunchTime').value.trim()} | الغداء`, `Dinner | ${$('mcdDinnerTime').value.trim()} | العشاء`];
        BAND.xs.forEach((bx, i) => {
            const x = px(bx), y = px(BAND.y), w = px(BAND.w), h = px(BAND.h);
            const grad = g.createLinearGradient(x, 0, x + w, 0);
            grad.addColorStop(0, '#FFDE59'); grad.addColorStop(1, '#FF914D');
            g.fillStyle = grad;
            roundRect(x, y, w, h, px(53280)); g.fill();
            g.fillStyle = INK; g.textAlign = 'center'; g.textBaseline = 'middle';
            g.font = font(ITEM_PT, true);
            g.fillText(bands[i], x + w / 2, y + h * 0.52, w * 0.94);
        });

        // dishes, one per row, with a dotted line under each row; both columns share the rows
        const menus = [lines('mcdLunch'), lines('mcdDinner')];
        const rows = Math.max(1, ...menus.map(m => m.length));
        const pitch = rows > 1 ? Math.min(PITCH, (LAST_LINE_MAX - FIRST_LINE) / (rows - 1)) : PITCH;
        const basePt = Math.min(ITEM_PT, ITEM_PT * pitch / PITCH * 1.08);
        g.textAlign = 'left'; g.textBaseline = 'alphabetic';
        COLS.forEach((col, ci) => {
            const x = px(col.x), w = px(col.w);
            for (let r = 0; r < rows; r++) {
                const lineY = px(FIRST_LINE + r * pitch);
                const text = menus[ci][r];
                if (text) {
                    // long dishes get a smaller font first, then are squeezed to the column width
                    let pt = basePt;
                    g.letterSpacing = `${(0.58 * PT * K).toFixed(2)}px`;
                    g.font = font(pt);
                    while (g.measureText(text).width > w && pt > basePt * 0.62) { pt -= 0.25; g.font = font(pt); }
                    g.fillStyle = INK;
                    g.fillText(text, x + px(5000), lineY - px(pt * PT * 0.52), w);
                }
                g.save();
                g.strokeStyle = '#3B250B'; g.lineWidth = px(19050); g.setLineDash([px(19050), px(19050)]);
                g.beginPath(); g.moveTo(x, lineY); g.lineTo(x + w, lineY); g.stroke();
                g.restore();
            }
        });

        // footer
        g.letterSpacing = `${(0.39 * PT * K).toFixed(2)}px`;
        g.fillStyle = INK; g.textAlign = 'center'; g.font = font(13.01);
        g.fillText('•   subject to change', px(5141856), px(7180000));
        g.restore();
    }

    let queued = false;
    const redraw = () => { if (queued) return; queued = true; requestAnimationFrame(() => { queued = false; draw(); }); };

    /* ------------------------------ output ------------------------------ */
    // the clipboard takes only PNG; files are JPEG (the photo background makes a PNG ~4 MB)
    const blobOf = (type) => new Promise((res, rej) => canvas.toBlob(b => b ? res(b) : rej(new Error('Could not make the image.')), type, 0.92));
    const pngBlob = () => blobOf('image/png');
    const jpgBlob = () => blobOf('image/jpeg');
    const fileName = () => `Menu ${$('mcdDate').value || isoOf(new Date())}.jpg`;
    const hasMenu = () => lines('mcdLunch').length || lines('mcdDinner').length;

    $('mcdDownload').addEventListener('click', async () => {
        try {
            const url = URL.createObjectURL(await jpgBlob());
            const a = document.createElement('a');
            a.href = url; a.download = fileName();
            document.body.appendChild(a); a.click(); a.remove();
            setTimeout(() => URL.revokeObjectURL(url), 5000);
            msg(`Downloaded “${fileName()}”.`, 'ok');
        } catch (e) { msg(e.message || String(e), 'bad'); }
    });
    $('mcdCopy').addEventListener('click', async () => {
        try {
            if (!navigator.clipboard?.write || typeof ClipboardItem === 'undefined') throw new Error('This browser cannot copy images — use Download instead.');
            await navigator.clipboard.write([new ClipboardItem({ 'image/png': pngBlob() })]);
            msg('Image copied — paste it into WhatsApp or anywhere else.', 'ok');
        } catch (e) { msg(e.name === 'NotAllowedError' ? 'The browser blocked copying — try again, or use Download.' : (e.message || String(e)), 'bad'); }
    });
    // phones: the share sheet (WhatsApp etc.)
    const probe = typeof File === 'function' && navigator.canShare?.({ files: [new File([''], 'x.jpg', { type: 'image/jpeg' })] });
    $('mcdShare').hidden = !probe;
    $('mcdShare').addEventListener('click', async () => {
        try {
            await navigator.share({ files: [new File([await jpgBlob()], fileName(), { type: 'image/jpeg' })] });
        } catch (e) { if (e.name !== 'AbortError') msg(e.message || String(e), 'bad'); }
    });

    /* ------------------------------ inputs ------------------------------ */
    $('mcdDate').value = isoOf(new Date());
    $('mcdDate').addEventListener('change', () => { if (!$('mcdDate').value) $('mcdDate').value = isoOf(new Date()); loadDraft(); redraw(); });
    $('mcdReset').addEventListener('click', () => { fillDateLines(); saveDraft(); redraw(); });
    for (const id of ['mcdGreg', 'mcdHijri', 'mcdLunch', 'mcdDinner', 'mcdLunchTime', 'mcdDinnerTime']) {
        $(id).addEventListener('input', () => { saveDraft(); redraw(); });
    }
    loadDraft();

    msg('Loading the card…');
    try {
        assets = await ctx.guard(loadAssets());
        draw();
        msg(hasMenu() ? 'Your text is kept on this device for each date.' : 'Type the menu — one dish per line (Enter for a new line).');
    } catch (e) {
        msg('Could not load the card pictures or fonts — check the connection and open the page again.', 'bad');
    }
}
