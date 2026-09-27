// Phone-friendly tables. Every data table gets `data-label` on its cells (from its header), and the
// class `pms-cards`; responsive.css then shows each row as a card on small screens. Tables that are
// layouts rather than data (print sheets, the slip form, multi-row headers) are marked `pms-scroll`
// and scroll sideways instead. Rows rendered later (after loading, filtering…) are picked up too.

const SKIP = '.printable, #printArea, .sheet, .slip, .kv, [data-no-cards]';

function headerLabels(table) {
    const rows = table.tHead ? [...table.tHead.rows] : [];
    if (rows.length !== 1) return null;
    const labels = [];
    for (const th of rows[0].cells) {
        if (th.colSpan > 1 || th.rowSpan > 1) return null;
        labels.push(th.textContent.replace(/\s+/g, ' ').trim());
    }
    return labels;
}

function enhance(table) {
    if (table.closest(SKIP)) return;
    const labels = headerLabels(table);
    if (!labels) {
        table.classList.remove('pms-cards');
        table.classList.add('pms-scroll');
        return;
    }
    table.classList.add('pms-cards');
    table.classList.remove('pms-scroll');
    for (const section of [...table.tBodies, table.tFoot].filter(Boolean)) {
        for (const tr of section.rows) {
            if (tr.cells.length === 1 && tr.cells[0].colSpan > 1) { tr.classList.add('pms-full'); continue; }
            let col = 0;
            for (const td of tr.cells) {
                if (!td.hasAttribute('data-label')) {
                    const label = labels[col] || '';
                    td.setAttribute('data-label', label);
                    // short labels (G, L, T, As.) sit two to a line in the card
                    if (label && label.length <= 3) td.classList.add('pms-short');
                }
                col += td.colSpan || 1;
            }
        }
    }
}

export function enhanceTables(root) {
    root.querySelectorAll('table').forEach(enhance);
}

/** Keep tables under `root` enhanced while the view is mounted. Returns a stop function. */
export function watchTables(root) {
    let queued = false;
    const run = () => { queued = false; enhanceTables(root); };
    const mo = new MutationObserver(() => { if (!queued) { queued = true; requestAnimationFrame(run); } });
    mo.observe(root, { childList: true, subtree: true });
    run();
    return () => mo.disconnect();
}
