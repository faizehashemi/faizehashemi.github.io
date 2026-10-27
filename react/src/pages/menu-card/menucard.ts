// Menu Card drawing (moved unchanged from pms/app/views/menu-card/view.js): the day's lunch and dinner menu as an A4-landscape image,
// after the Canva deck "Mawaid Menu" — desert background, corner ornaments, the city in Arabic, the Gregorian + Misri Hijri date and one
// dish per line under a Lunch and a Dinner band. Drawn on a <canvas> in slide units (EMU) so the layout matches the deck exactly.

const base = import.meta.url;   // (kept in a variable: the bundler must not try to inline the pictures)
export const ASSETS = new URL('../../assets/menu-card/', base).href;
export const SLIDE_W = 10692000, SLIDE_H = 7560000;        // EMU, A4 landscape
export const OUT_W = 2400, OUT_H = Math.round(OUT_W * SLIDE_H / SLIDE_W);
const K = OUT_W / SLIDE_W;                                 // EMU → px
const PT = 12700;                                          // EMU per point
const INK = '#57360F';

const COLS = [{ x: 1334552, w: 3081145 }, { x: 5531706, w: 3081145 }];
const BAND = { y: 2188471, h: 515025, w: 3078191, xs: [1334552, 5533181] };
const FIRST_LINE = 3226770, PITCH = 530560, LAST_LINE_MAX = 6700000;
const ITEM_PT = 19.52;

export type Assets = { bg: HTMLImageElement; corner: HTMLImageElement; makkah: HTMLImageElement };
export type CardState = { greg: string; hijri: string; lunchTime: string; dinnerTime: string; lunch: string; dinner: string; siteId: string };

// fonts and images load once per page load
let assetsReady: Promise<Assets> | null = null;
export function loadAssets(): Promise<Assets> {
    if (assetsReady) return assetsReady;
    const img = (name: string) => new Promise<HTMLImageElement>((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = ASSETS + name; });
    const font = (family: string, file: string) => new FontFace(family, `url(${ASSETS}${file})`).load().then(f => { document.fonts.add(f); return f; });
    assetsReady = Promise.all([img('desert.jpg'), img('corner.png'), img('makkah.png'), font('MenuAmiri', 'Amiri-Regular.ttf'), font('MenuAmiriBold', 'Amiri-Bold.ttf')])
        .then(([bg, corner, makkah]) => ({ bg, corner, makkah }))
        .catch(e => { assetsReady = null; throw e; });
    return assetsReady;
}

const px = (emu: number) => emu * K;
const font = (pt: number, bold = false) => `${(pt * PT * K).toFixed(2)}px ${bold ? 'MenuAmiriBold' : 'MenuAmiri'}`;
export const menuLines = (text: string) => text.split(/\r?\n/).map(s => s.trim()).filter(Boolean);

export function drawCard(canvas: HTMLCanvasElement, assets: Assets, st: CardState) {
    canvas.width = OUT_W; canvas.height = OUT_H;
    const g = canvas.getContext('2d')!;
    const { bg, corner, makkah } = assets;
    const roundRect = (x: number, y: number, w: number, h: number, r: number) => {
        g.beginPath();
        g.moveTo(x + r, y); g.lineTo(x + w - r, y); g.quadraticCurveTo(x + w, y, x + w, y + r);
        g.lineTo(x + w, y + h - r); g.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        g.lineTo(x + r, y + h); g.quadraticCurveTo(x, y + h, x, y + h - r);
        g.lineTo(x, y + r); g.quadraticCurveTo(x, y, x + r, y);
        g.closePath();
    };
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
    if (st.siteId === 'makkah') {
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
    g.fillText(st.greg.trim(), px(5310000), px(1300000), px(6200000));
    g.fillText(st.hijri.trim(), px(5310000), px(1765000), px(6200000));

    // meal bands
    g.letterSpacing = '0px';
    const bands = [`Lunch | ${st.lunchTime.trim()} | الغداء`, `Dinner | ${st.dinnerTime.trim()} | العشاء`];
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
    const menus = [menuLines(st.lunch), menuLines(st.dinner)];
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
