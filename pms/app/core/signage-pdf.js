// Signage Builder → "Add a PDF slide": the pages of a PDF as pictures for the board (core/signage.js isPdf / buildSlides).
// Every page is drawn in the browser (pdf.js) to fit a 1920 × 1080 screen and kept as a WebP data URL, so the board needs nothing but the
// template it already loads. A template holds about 1.7 MB: when the pages do not fit, they are drawn again smaller / at lower quality.
import { loadScript } from './lib.js';

const PDFJS = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.min.js';
const PDFJS_WORKER = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js';
export const MAX_PDF_PAGES = 40;
const BUDGET = 1600 * 1024;   // bytes of page pictures in one template (the server takes 1.8 MB with the rest)
// tries in order: longest side of the page picture, WebP quality
const TRIES = [[1920, 0.8], [1600, 0.72], [1280, 0.65], [1100, 0.55], [960, 0.5], [800, 0.45]];

/** The pages of `file` (a PDF) as data URLs; onProgress(done, total) while drawing. Throws a message for the desk when it cannot fit. */
export async function pdfPages(file, onProgress = () => { }) {
    await loadScript(PDFJS);
    const lib = window.pdfjsLib;
    lib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER;
    const pdf = await lib.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;
    if (pdf.numPages > MAX_PDF_PAGES) throw new Error(`The PDF has ${pdf.numPages} pages — at most ${MAX_PDF_PAGES} can be shown. Split it into smaller PDFs.`);
    // draw each page once, big; smaller tries scale that canvas down (no second pdf.js pass)
    const canvases = [];
    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const v1 = page.getViewport({ scale: 1 });
        const scale = Math.min(1920 / v1.width, 1080 / v1.height) * (v1.width < v1.height ? 1.4 : 1);   // portrait pages a little sharper
        const vp = page.getViewport({ scale });
        const c = document.createElement('canvas');
        c.width = Math.round(vp.width); c.height = Math.round(vp.height);
        const ctx = c.getContext('2d');
        ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, c.width, c.height);
        await page.render({ canvasContext: ctx, viewport: vp }).promise;
        canvases.push(c);
        onProgress(i, pdf.numPages);
    }
    for (const [side, q] of TRIES) {
        const pages = canvases.map(c => {
            const s = Math.min(1, side / Math.max(c.width, c.height));
            const out = document.createElement('canvas');
            out.width = Math.round(c.width * s); out.height = Math.round(c.height * s);
            out.getContext('2d').drawImage(c, 0, 0, out.width, out.height);
            const url = out.toDataURL('image/webp', q);
            return url.startsWith('data:image/webp') ? url : out.toDataURL('image/jpeg', q);   // a browser without WebP: JPEG
        });
        if (pages.reduce((n, p) => n + p.length, 0) <= BUDGET) return pages;
    }
    throw new Error(`The ${canvases.length} pages are too large to keep even at low quality — use fewer pages per PDF (about ${Math.max(1, Math.floor(canvases.length / 2))}).`);
}
