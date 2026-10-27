// A table on the page as a picture: tableToCanvas(table, title) draws the cells (text, colours, bold, colspan / rowspan)
// on a canvas; copyTableImage(table, title, name) puts it on the clipboard as PNG, or downloads it where the browser
// cannot copy pictures. Used by the Mawaid page, like the Tosha summary cards.

const cssColor = (c, fallback) => (!c || c === 'transparent' || /rgba\(.*,\s*0\)$/.test(c)) ? fallback : c;

export function tableToCanvas(table, title = '') {
    const trs = [...table.rows];
    const cells = [], taken = [];
    trs.forEach((tr, r) => {
        taken[r] = taken[r] || [];
        let c = 0;
        for (const td of tr.cells) {
            while (taken[r][c]) c++;
            const cs = Math.max(1, td.colSpan || 1), rs = Math.max(1, td.rowSpan || 1), st = getComputedStyle(td);
            cells.push({ r, c, cs, rs, text: td.innerText.replace(/\s*\n\s*/g, ' ').trim(), head: td.tagName === 'TH',
                bg: cssColor(st.backgroundColor, td.tagName === 'TH' ? '#f4ead0' : '#ffffff'), fg: cssColor(st.color, '#1d130b'),
                bold: Number(st.fontWeight) >= 600 || td.tagName === 'TH' || !!td.closest('tfoot'), align: st.textAlign });
            for (let i = 0; i < rs; i++) { taken[r + i] = taken[r + i] || []; for (let j = 0; j < cs; j++) taken[r + i][c + j] = true; }
            c += cs;
        }
    });
    const nCols = Math.max(0, ...cells.map(x => x.c + x.cs)), nRows = trs.length;
    const S = 2, PAD = 12, ROW = 34, TITLE = title ? 44 : 0, M = 16;
    const probe = document.createElement('canvas').getContext('2d');
    const font = (b) => `${b ? '700' : '500'} 15px system-ui, "Segoe UI", Arial, sans-serif`;
    const colW = Array(nCols).fill(40);
    for (const x of cells) {
        probe.font = font(x.bold);
        const w = probe.measureText(x.text).width + PAD * 2;
        if (x.cs === 1) colW[x.c] = Math.max(colW[x.c], w);
    }
    for (const x of cells) if (x.cs > 1) {      // a wide cell: widen its columns only if they do not fit it
        probe.font = font(x.bold);
        const need = probe.measureText(x.text).width + PAD * 2, have = colW.slice(x.c, x.c + x.cs).reduce((a, b) => a + b, 0);
        if (need > have) for (let j = 0; j < x.cs; j++) colW[x.c + j] += (need - have) / x.cs;
    }
    const W = colW.reduce((a, b) => a + b, 0) + M * 2, H = TITLE + nRows * ROW + M * 2;
    const cv = document.createElement('canvas');
    cv.width = W * S; cv.height = H * S;
    const g = cv.getContext('2d');
    g.scale(S, S);
    g.fillStyle = '#fff'; g.fillRect(0, 0, W, H);
    if (title) { g.fillStyle = '#1d130b'; g.font = '800 19px system-ui, "Segoe UI", Arial, sans-serif'; g.textBaseline = 'middle'; g.textAlign = 'left'; g.fillText(title, M, M + TITLE / 2 - 4); }
    const xs = colW.reduce((a, w) => (a.push(a[a.length - 1] + w), a), [M]);
    g.textBaseline = 'middle';
    for (const x of cells) {
        const left = xs[x.c], top = M + TITLE + x.r * ROW, w = xs[x.c + x.cs] - left, h = x.rs * ROW;
        g.fillStyle = x.bg; g.fillRect(left, top, w, h);
        g.strokeStyle = '#cdbf9f'; g.lineWidth = 1; g.strokeRect(left + .5, top + .5, w - 1, h - 1);
        g.fillStyle = x.fg; g.font = font(x.bold);
        const left0 = x.align === 'left' || x.align === 'start';
        g.textAlign = left0 ? 'left' : 'center';
        g.fillText(x.text, left0 ? left + PAD : left + w / 2, top + h / 2, w - PAD);
    }
    return cv;
}

/** Copy the table as a picture; returns 'copied' or 'downloaded'. */
export async function copyTableImage(table, title, name = 'table.png') {
    const cv = tableToCanvas(table, title);
    try {
        if (!navigator.clipboard?.write || typeof ClipboardItem === 'undefined') throw new Error('no picture clipboard');
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': new Promise(res => cv.toBlob(res, 'image/png')) })]);
        return 'copied';
    } catch {
        const a = document.createElement('a');
        a.href = cv.toDataURL('image/png'); a.download = name; a.click();
        return 'downloaded';
    }
}

/** Several tables as ONE picture, stacked (a destination per table); copied like copyTableImage, or downloaded where the browser cannot copy pictures. */
export async function copyTablesImage(tables, name = 'tables.png') {
    const cvs = tables.map(t => tableToCanvas(t, ''));
    if (!cvs.length) throw new Error('nothing to copy');
    const gap = 24, W = Math.max(...cvs.map(c => c.width)), H = cvs.reduce((s, c) => s + c.height, 0) + gap * (cvs.length - 1);
    const out = document.createElement('canvas');
    out.width = W; out.height = H;
    const g = out.getContext('2d');
    g.fillStyle = '#ffffff'; g.fillRect(0, 0, W, H);
    let y = 0;
    for (const c of cvs) { g.drawImage(c, 0, y); y += c.height + gap; }
    try {
        if (!navigator.clipboard?.write || typeof ClipboardItem === 'undefined') throw new Error('no picture clipboard');
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': new Promise(res => out.toBlob(res, 'image/png')) })]);
        return 'copied';
    } catch {
        const a = document.createElement('a');
        a.href = out.toDataURL('image/png'); a.download = name; a.click();
        return 'downloaded';
    }
}
