// Laundry: shared by the Laundry (POS) and Laundry admin pages.
//   money: halalas (SAR × 100) in, "12" / "12.50" SAR out
//   offline: a bill that cannot reach the server is kept on this device (per login) with its client_uid and
//            sent when the connection returns; the server stores a client_uid once, so nothing doubles
//   receipt: receiptHTML(bill) and printReceipt(bill) (A5 on the Canon LBP, straight to the printer — see printReceipt)
//   shrinkImage(file, size): a picture from the camera/gallery as a small JPEG data: URL
//   keypad(): a touch number pad for quantities; itemPic(): photo, garment drawing (assets/laundry) or emoji

import { request, currentDesk, OfflineError, ApiError } from './cloud.js';

export const sar = (h) => { const n = Number(h) || 0; return (n % 100 ? (n / 100).toFixed(2) : String(n / 100)); };
export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const jeddahDay = (ms = Date.now()) => new Date(ms + 3 * 3600e3).toISOString().slice(0, 10);
export const jeddahTime = (iso) => new Date(iso).toLocaleTimeString('en-GB', { timeZone: 'Asia/Riyadh', hour: '2-digit', minute: '2-digit' });
export const jeddahDate = (iso) => new Date(iso).toLocaleDateString('en-GB', { timeZone: 'Asia/Riyadh', day: '2-digit', month: 'short', year: 'numeric' });
export const uid = () => (crypto.randomUUID ? crypto.randomUUID() : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`);
export const METHOD = { cash: '💵 Cash', card: '💳 Card', other: '🔁 Other' };
export const STATUS = { received: '🧺 Received', ready: '✅ Ready', collected: '🤲 Collected' };
export const DEFAULT_INFO = 'Laundry collection: 8:00 AM – 10:00 AM\nWashed clothes collection: 6:00 PM – 8:00 PM\nNo staff service is available for picking up clothes from rooms.';

// The laundry's own drawings of each garment and linen item (assets/laundry/*.png), matched by the item's name
const ICONS = [
    [/mawaid.*towel|towel.*mawaid/i, 'mawaid-towel'], [/safra/i, 'safra'], [/small.*towel|hand towel/i, 'small-towel'],
    [/towel/i, 'big-towel'], [/bed ?sheet/i, 'bedsheet'], [/blanket/i, 'blanket'], [/parda|curtain/i, 'parda'],
    [/pagdandi|door ?mat/i, 'pagdandi'], [/pillow/i, 'pillow-covers'],
    [/rida/i, 'rida'], [/saaya|saya/i, 'saaya'], [/kurta/i, 'kurta'], [/paj?ama|paijama/i, 'pajama'], [/vest|baniyan/i, 'vest'],
    [/brief|underwear/i, 'briefs'], [/sock/i, 'socks'], [/pardi/i, 'pardi'], [/ghagr/i, 'ghagro'], [/peti|petticoat/i, 'petticoat'],
    [/t-?shirt/i, 'ladies-tshirt'], [/ehram|ihram/i, 'ehram'],
];
export const itemIcon = (name) => { const m = ICONS.find(([re]) => re.test(String(name || ''))); return m ? `assets/laundry/${m[1]}.png` : ''; };

/** An item picture: a photo (data: URL), else the garment drawing for its name, else its emoji. */
export function itemPic(item, cls = 'ld-pic') {
    const img = item?.image || '';
    if (img.startsWith('data:')) return `<img class="${cls}" src="${img}" alt="">`;
    const icon = itemIcon(item?.name);
    return icon ? `<img class="${cls} icon" src="${icon}" alt="">` : `<span class="${cls} emoji" aria-hidden="true">${esc(img || '🧺')}</span>`;
}

/* ---------------------------- small local caches ---------------------------- */
const ls = {
    get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { } },
};
/** Fetch with a local copy: works offline from the last good answer. */
export async function cached(key, fetcher) {
    try { const v = await fetcher(); ls.set(key, v); return { data: v, offline: false }; }
    catch (e) { if (e instanceof OfflineError) { const v = ls.get(key, null); if (v) return { data: v, offline: true }; } throw e; }
}

/* -------------------------------- offline queue -------------------------------- */
const qKey = () => `pms_laundry_queue:${currentDesk()?.id || 0}`;
export const queued = () => ls.get(qKey(), []);
const setQueue = (q) => ls.set(qKey(), q);

/**
 * Save a bill. Online: { bill }. Offline: { bill: <local copy>, offline: true } — sent later by flushQueue().
 * Over a free-laundry limit that needs approval: throws ApiError 409 with extra.needs_approval.
 */
export async function saveBill(payload) {
    const p = { ...payload, client_uid: payload.client_uid || uid(), created_local: payload.created_local || new Date().toISOString() };
    try {
        const r = await request('POST', '/api/laundry/bills', p);
        return { bill: r.bill, warnings: r.warnings || [] };
    } catch (e) {
        if (!(e instanceof OfflineError)) throw e;
        const q = queued();
        if (!q.some(x => x.client_uid === p.client_uid)) q.push({ ...p, local_no: `OFFLINE-${String(q.length + 1).padStart(2, '0')}`, queued_at: new Date().toISOString() });
        setQueue(q);
        return { bill: localBill(p, q.find(x => x.client_uid === p.client_uid).local_no), offline: true };
    }
}

// what the receipt shows for a bill still on this device
function localBill(p, no) {
    return {
        receipt_no: no, offline: true, kind: p.kind, customer: p.customer || {}, staff_name: p.staff_name, lines: p.preview_lines || [],
        items: (p.preview_lines || []).reduce((n, l) => n + l.qty, 0), value: p.preview_value || 0, paid: p.kind === 'free' ? 0 : (p.preview_value || 0),
        method: p.method || '', received: p.received, given_at: p.created_local, worker: currentDesk()?.name, status: 'received',
    };
}

/** Send what is waiting on this device. Returns { sent, failed, left }. */
let flushing = null;
export function flushQueue() {
    if (flushing) return flushing;
    flushing = (async () => {
        let sent = 0, failed = 0;
        for (const item of queued()) {
            const { local_no, queued_at, error, preview_lines, preview_value, staff_name, ...payload } = item;
            try {
                await request('POST', '/api/laundry/bills', payload);
                setQueue(queued().filter(x => x.client_uid !== item.client_uid));
                sent++;
            } catch (e) {
                if (e instanceof OfflineError) break;             // still offline: try again later
                failed++;                                          // refused (e.g. needs approval): keep, show why
                setQueue(queued().map(x => x.client_uid === item.client_uid ? { ...x, error: e.message } : x));
            }
        }
        return { sent, failed, left: queued().length };
    })().finally(() => { flushing = null; });
    return flushing;
}
export function dropQueued(clientUid) { setQueue(queued().filter(x => x.client_uid !== clientUid)); }

/* ---------------------------------- receipt ---------------------------------- */
export function receiptHTML(b, info = '') {
    const free = b.kind === 'free', bld = b.kind === 'building';
    const when = b.given_at || b.created_at || new Date().toISOString();
    const change = !free && b.method === 'cash' && b.received > b.paid ? b.received - b.paid : 0;
    return `<div class="ld-receipt">
      <div class="r-h1">MOHAMMEDI MAKAN</div>
      <div class="r-h2">${free ? 'STAFF LAUNDRY' : bld ? 'BUILDING LAUNDRY' : 'LAUNDRY RECEIPT'}</div>
      <div class="r-row"><span>Receipt No</span><b>${esc(b.receipt_no)}</b></div>
      <div class="r-row"><span>Date</span><span>${esc(jeddahDate(when))}</span></div>
      <div class="r-row"><span>Time</span><span>${esc(jeddahTime(when))}</span></div>
      <hr>
      ${free ? `<div class="r-row"><span>Staff</span><b>${esc(b.staff_name || b.customer?.name)}</b></div>`
        : bld ? (b.customer?.building ? `<div class="r-row"><span>Building</span><b>${esc(b.customer.building)}</b></div>` : '') : `
      ${b.customer?.building ? `<div class="r-row"><span>Building</span><b>${esc(b.customer.building)}</b></div>` : ''}
      <div class="r-row"><span>Room</span><b>${esc(b.customer?.room || '—')}</b></div>
      ${b.customer?.name ? `<div class="r-row"><span>Customer</span><b>${esc(b.customer.name)}</b></div>` : ''}`}
      <hr>
      ${(b.lines || []).map(l => `<div class="r-row"><span>${esc(l.name)} × ${l.qty}</span><span>${bld ? '' : sar(l.amount) + ' SAR'}</span></div>`).join('')}
      <hr>
      <div class="r-row r-sum"><span>Items</span><b>${b.items}</b></div>
      ${bld ? '<div class="r-free">BUILDING LINEN – NO PAYMENT</div>' : free ? `<div class="r-row r-sum"><span>Laundry value</span><b>${sar(b.value)} SAR</b></div>
      <div class="r-free">STAFF LAUNDRY – NO PAYMENT (0 SAR)</div>`
        : `<div class="r-row r-total"><span>TOTAL</span><b>${sar(b.paid)} SAR</b></div>
      <div class="r-row"><span>Payment</span><b>CASH</b></div>
      ${change ? `<div class="r-row"><span>Received / change</span><span>${sar(b.received)} / ${sar(change)} SAR</span></div>` : ''}`}
      <div class="r-row"><span>Worker</span><span>${esc(b.worker || currentDesk()?.name || '')}</span></div>
      ${b.offline ? '<div class="r-note">⏳ Saved on this phone — the receipt number is given when it is sent.</div>' : ''}
      ${info ? `<div class="r-info">${esc(info).replace(/\n/g, '<br>')}</div>` : ''}
    </div>`;
}

export const RECEIPT_CSS = `
.ld-receipt { width: 72mm; margin: 0 auto; font: 13px/1.35 "Courier New", ui-monospace, monospace; color: #000; background: #fff; padding: 4mm 3mm; }
.ld-receipt .r-h1 { text-align: center; font-weight: 800; font-size: 16px; letter-spacing: .08em; }
.ld-receipt .r-h2 { text-align: center; font-weight: 700; margin: 2px 0 6px; }
.ld-receipt .r-row { display: flex; justify-content: space-between; gap: 8px; }
.ld-receipt .r-total { font-size: 16px; margin-top: 2px; }
.ld-receipt .r-free { text-align: center; font-weight: 800; border: 2px solid #000; padding: 3px; margin: 6px 0; }
.ld-receipt .r-note { margin-top: 6px; font-size: 11px; }
.ld-receipt .r-info { margin-top: 8px; padding-top: 6px; border-top: 1px dashed #000; font-size: 11px; text-align: center; }
.ld-receipt hr { border: 0; border-top: 1px dashed #000; margin: 5px 0; }`;

// A5 sheet on the laundry's Canon LBP laser printer: the receipt fills the page width in bigger type
const RECEIPT_A5_CSS = `
@page { size: A5 portrait; margin: 10mm; }
html, body { margin: 0; background: #fff; }
.ld-receipt { width: auto; margin: 0; padding: 0; font-size: 14pt; line-height: 1.4; }
.ld-receipt .r-h1 { font-size: 20pt; }
.ld-receipt .r-h2 { font-size: 15pt; margin: 2pt 0 8pt; }
.ld-receipt .r-total { font-size: 18pt; }
.ld-receipt .r-note, .ld-receipt .r-info { font-size: 11pt; }
.ld-receipt hr { margin: 6pt 0; }`;

/**
 * Print one receipt from a hidden frame — no new tab. Chrome on the laundry screen is started with
 * --kiosk-printing, so it goes straight to the default printer (the Canon LBP) without the print dialog;
 * any other browser just shows its usual dialog.
 */
export function printReceipt(b, info = '') {
    document.getElementById('ldPrintFrame')?.remove();
    const f = document.createElement('iframe');
    f.id = 'ldPrintFrame';
    f.setAttribute('aria-hidden', 'true');
    f.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;';
    document.body.appendChild(f);
    const d = f.contentDocument;
    d.open();
    d.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>${esc(b.receipt_no)}</title><style>${RECEIPT_CSS}${RECEIPT_A5_CSS}</style></head>
        <body>${receiptHTML(b, info)}</body></html>`);
    d.close();
    setTimeout(() => {
        f.contentWindow.focus();
        f.contentWindow.print();
        setTimeout(() => f.remove(), 60_000);
    }, 250);
}

/* ------------------------------- keypad ------------------------------- */
/**
 * A big number pad in a dialog — the laundry screen has no keyboard. Resolves the number typed,
 * or null when cancelled. `title` is HTML (e.g. the item picture and name).
 */
export function keypad({ title = '', value = 0, max = 2000, root = document.body } = {}) {
    return new Promise((resolve) => {
        let v = value ? String(value) : '', fresh = true;   // the first digit replaces the old number
        const dlg = document.createElement('dialog');
        dlg.className = 'ld-dlg ld-keypad';
        dlg.innerHTML = `<div class="kp-title">${title}</div>
            <div class="kp-show" aria-live="polite"></div>
            <div class="kp-keys">${['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '⌫'].map(k => `<button type="button" data-k="${k}"${k === 'C' || k === '⌫' ? ' class="fn"' : ''}>${k}</button>`).join('')}</div>
            <div class="ld-dlg-b"><button type="button" data-x>✖ Cancel</button><button type="button" class="ok" data-ok>✔ OK</button></div>`;
        root.appendChild(dlg);
        const show = () => { dlg.querySelector('.kp-show').textContent = v || '0'; };
        let done = false;
        const finish = (r) => { if (done) return; done = true; dlg.close(); dlg.remove(); resolve(r); };
        dlg.addEventListener('click', (e) => {
            const k = e.target.closest('[data-k]')?.dataset.k;
            if (k && fresh && /\d/.test(k)) v = '';
            if (k) fresh = false;
            if (k === 'C') v = '';
            else if (k === '⌫') v = v.slice(0, -1);
            else if (k && (v + k).replace(/^0+/, '').length <= String(max).length && Number(v + k) <= max) v = (v + k).replace(/^0+/, '');
            if (k) show();
            if (e.target.closest('[data-x]')) finish(null);
            if (e.target.closest('[data-ok]')) finish(Number(v || 0));
        });
        dlg.addEventListener('close', () => { dlg.remove(); if (!done) { done = true; resolve(null); } });
        show();
        dlg.showModal();
    });
}

export const KEYPAD_CSS = `
.ld-keypad { width: min(380px, 94vw); }
.ld-keypad .kp-title { display: flex; align-items: center; gap: 10px; font-size: 20px; font-weight: 800; }
.ld-keypad .kp-title img, .ld-keypad .kp-title .emoji { width: 56px; height: 56px; object-fit: contain; font-size: 44px; display: grid; place-items: center; }
.ld-keypad .kp-show { margin: 10px 0; padding: 8px 14px; border-radius: 14px; background: #fff8e6; border: 2px solid #e3d2b1; text-align: right; font-size: 44px; font-weight: 800; font-variant-numeric: tabular-nums; }
.ld-keypad .kp-keys { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
.ld-keypad .kp-keys button { height: 68px; border-radius: 16px; border: 2px solid #e3d2b1; background: #fff; font-size: 30px; font-weight: 800; touch-action: manipulation; }
.ld-keypad .kp-keys button:active { background: #f6e7bf; }
.ld-keypad .kp-keys button.fn { background: #f5efe3; font-size: 24px; }`;

/* ------------------------------- pictures ------------------------------- */
/** A picture file → square-ish JPEG data: URL no larger than `size` px (keeps the database small). */
export function shrinkImage(file, size = 320, quality = 0.8) {
    return new Promise((resolve, reject) => {
        if (!file || !/^image\//.test(file.type)) { reject(new Error('Choose a picture.')); return; }
        const img = new Image();
        img.onload = () => {
            const k = Math.min(1, size / Math.max(img.width, img.height));
            const c = document.createElement('canvas');
            c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
            const g = c.getContext('2d');
            g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height);
            g.drawImage(img, 0, 0, c.width, c.height);
            URL.revokeObjectURL(img.src);
            resolve(c.toDataURL('image/jpeg', quality));
        };
        img.onerror = () => reject(new Error('Could not read that picture.'));
        img.src = URL.createObjectURL(file);
    });
}

export { ApiError, OfflineError };
