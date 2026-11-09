// Signage Builder → Screen 1 / Screen 2: files for the notice screens (core/screen.js). Everything is turned into what any TV browser can show before it goes up:
//   picture     → kept as is when small, else redrawn as WebP of at most 2160 px on its longest side
//   video       → MP4 / WebM as is (the screen plays it muted)
//   PDF         → each page drawn (pdf.js) as a picture for the 1080 × 1920 screen
//   PowerPoint  → each slide drawn in the browser (pptx-preview), then photographed (html-to-image) — a slide with unusual effects may differ a little:
//                 the desk sees every page before saving, and a PDF saved from PowerPoint is exact
// Uploads go in parts to the cloud store (worker.js startMedia / putMediaPart).
import { loadScript } from './lib.js';
import { apiBase, getSession, request, UserError } from './cloud.js';

const PDFJS = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.min.js';
const PDFJS_WORKER = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js';
const PPTX = 'https://cdn.jsdelivr.net/npm/pptx-preview@1.0.7/dist/pptx-preview.umd.js';
const H2I = 'https://cdn.jsdelivr.net/npm/html-to-image@1.11.11/dist/html-to-image.js';
export const MAX_PAGES = 60;
const LONG = 1920 * 1.125;   // longest side of a page picture (a little over the screen, for sharpness)

const blobOf = (canvas, q = 0.86) => new Promise(res => canvas.toBlob(b => res(b), 'image/webp', q)).then(b => b && b.type === 'image/webp' ? b : new Promise(r => canvas.toBlob(r, 'image/jpeg', q)));
const fitCanvas = (w, h, max = LONG) => { const s = Math.min(1, max / Math.max(w, h)); const c = document.createElement('canvas'); c.width = Math.round(w * s); c.height = Math.round(h * s); return c; };

export const kindOf = (file) => {
    const n = (file.name || '').toLowerCase(), t = file.type || '';
    if (t === 'application/pdf' || n.endsWith('.pdf')) return 'pdf';
    if (n.endsWith('.pptx') || t.includes('presentationml')) return 'pptx';
    if (n.endsWith('.ppt') || t === 'application/vnd.ms-powerpoint') return 'ppt';
    if (/^video\/(mp4|webm)$/.test(t) || /\.(mp4|webm)$/.test(n)) return 'video';
    if (/^image\//.test(t) || /\.(png|jpe?g|webp|gif)$/.test(n)) return 'image';
    return '';
};

/** A picture ready for the screen (Blob) */
export async function prepImage(file) {
    if (file.type === 'image/gif' || (file.size < 1.5 * 1048576 && /^image\/(png|jpeg|webp)$/.test(file.type))) return file;   // GIFs keep their movement
    const img = await createImageBitmap(file);
    const c = fitCanvas(img.width, img.height);
    c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
    return blobOf(c);
}

/** The pages of a PDF as pictures (Blob[]); onProgress(done, total) */
export async function pdfToImages(file, onProgress = () => { }) {
    await loadScript(PDFJS);
    const lib = window.pdfjsLib;
    lib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER;
    const pdf = await lib.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;
    if (pdf.numPages > MAX_PAGES) throw new UserError(`The PDF has ${pdf.numPages} pages — at most ${MAX_PAGES} on a slide. Split it.`);
    const out = [];
    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i), v1 = page.getViewport({ scale: 1 });
        const vp = page.getViewport({ scale: LONG / Math.max(v1.width, v1.height) });
        const c = document.createElement('canvas'); c.width = Math.round(vp.width); c.height = Math.round(vp.height);
        const ctx = c.getContext('2d'); ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, c.width, c.height);
        await page.render({ canvasContext: ctx, viewport: vp }).promise;
        out.push(await blobOf(c));
        onProgress(i, pdf.numPages);
    }
    return out;
}

/** The slides of a PowerPoint (.pptx) as pictures (Blob[]); onProgress(done, total) */
export async function pptxToImages(file, onProgress = () => { }) {
    await Promise.all([loadScript(PPTX), loadScript(H2I)]);
    const host = document.createElement('div');
    host.style.cssText = 'position:fixed;left:-20000px;top:0;width:1200px;background:#fff';
    document.body.appendChild(host);
    try {
        // the size of the slides decides the drawing box: width 1080 for portrait slides, 1920 for landscape ones
        const probe = window.pptxPreview.init(host, { width: 960, height: 540, mode: 'list' });
        await probe.preview(await file.arrayBuffer());
        const first = host.querySelector('.pptx-preview-slide-wrapper');
        if (!first) throw new UserError('No slides could be read from this PowerPoint. Save it as PDF in PowerPoint and add the PDF.');
        const ratio = first.offsetHeight / first.offsetWidth, portrait = ratio > 1;
        const W = portrait ? 1080 : 1920, H = Math.round(W * ratio);
        host.innerHTML = ''; host.style.width = W + 'px';
        const pv = window.pptxPreview.init(host, { width: W, height: H, mode: 'list' });
        await pv.preview(await file.arrayBuffer());
        await new Promise(r => setTimeout(r, 600));   // pictures inside the slides
        const slides = [...host.querySelectorAll('.pptx-preview-slide-wrapper')];
        if (slides.length > MAX_PAGES) throw new UserError(`The PowerPoint has ${slides.length} slides — at most ${MAX_PAGES} on a slide. Split it.`);
        // a video inside a slide: its first picture (the poster), not a black box
        host.querySelectorAll('video').forEach(v => { v.style.visibility = 'hidden'; });
        const out = [];
        for (let i = 0; i < slides.length; i++) {
            const c = await window.htmlToImage.toCanvas(slides[i], { pixelRatio: 1, backgroundColor: '#ffffff', cacheBust: false });
            out.push(await blobOf(c));
            onProgress(i + 1, slides.length);
        }
        return out;
    } finally { host.remove(); }
}

/** Upload a Blob to the screens' store; returns its id. onProgress(fraction) */
export async function uploadMedia(site, blob, name, onProgress = () => { }) {
    const type = blob.type === 'image/jpg' ? 'image/jpeg' : blob.type;
    const { id, parts, chunk } = await request('POST', `/api/signage/media?site=${encodeURIComponent(site)}&type=${encodeURIComponent(type)}&size=${blob.size}&name=${encodeURIComponent(name || '')}`);
    const s = getSession();
    for (let n = 0; n < parts; n++) {
        const res = await fetch(`${apiBase()}/api/signage/media/${id}/${n}`, { method: 'PUT', headers: { 'Content-Type': 'application/octet-stream', ...(s ? { Authorization: 'Bearer ' + s.token } : {}) }, body: blob.slice(n * chunk, (n + 1) * chunk) });
        if (!res.ok) { let e = ''; try { e = (await res.json()).error; } catch { } throw new UserError(e || `Upload failed (${res.status}).`); }
        onProgress((n + 1) / parts);
    }
    return id;
}

export const loadScreen = (site, n) => request('GET', `/api/signage/screen?site=${encodeURIComponent(site)}&screen=${n}`);
export const saveScreen = (site, n, config, version) => request('PUT', '/api/signage/screen', { site, screen: n, config, version });
