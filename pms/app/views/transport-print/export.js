// Bus sheets → Excel. Two workbooks from the same choice of destinations and bus numbers as the page:
//   "Bus sheets": one block per bus laid out like the printed sheet (date and time, BUS + number, destination, then
//                 group · leader · SH ref · pax, the pick-up line and the total), a page break after each so printing it
//                 gives one landscape page per bus.
//   "Bus summary": the print summary — one table per destination (the yellow band: date and destination, then group,
//                 leader, SH ref, pax, time, building, vehicle, number, with totals); Medina's split Ziyarat trips go on
//                 their own sheet in the desks' format (core/ziyarat.js ziyaratTables).
// Built in the browser with ExcelJS (loaded when first used).

import { loadScript } from '../../core/lib.js';
import { sheetDate, time12, vehicleWord } from '../../core/transport.js';
import { ziyaratTables } from '../../core/ziyarat.js';

const EXCELJS = 'https://cdn.jsdelivr.net/npm/exceljs@4.4.0/dist/exceljs.min.js';
const BLACK = { argb: 'FF000000' }, RED = { argb: 'FFE00000' };
const thin = { style: 'thin', color: BLACK }, medium = { style: 'medium', color: BLACK };
const box = (s = thin) => ({ top: s, left: s, bottom: s, right: s });
const fill = (argb) => ({ type: 'pattern', pattern: 'solid', fgColor: { argb } });
const center = { horizontal: 'center', vertical: 'middle', wrapText: true };

/** The summary rows of one destination, in print order: [{ r (group row), b (its bus), rider }] */
export function tripRows(buses) {
    return [...buses].sort((a, b) => a.at.localeCompare(b.at) || ((a.vehicle === 'car') - (b.vehicle === 'car')) || (a.bus ?? 1e9) - (b.bus ?? 1e9))
        .flatMap(b => b.rows.map((r, i) => ({ r, b, rider: i > 0 })));
}

async function workbook() {
    await loadScript(EXCELJS);
    const wb = new window.ExcelJS.Workbook();
    wb.creator = 'Faiz E Hashemi PMS';
    return wb;
}
function download(buf, name) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }));
    a.download = name;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}
const landscape = (extra = {}) => ({ pageSetup: { orientation: 'landscape', paperSize: 9, fitToPage: true, fitToWidth: 1, fitToHeight: 0, margins: { left: .3, right: .3, top: .4, bottom: .4, header: .2, footer: .2 }, ...extra } });
const fileName = (what, day, site) => `${what} ${day}${site ? ` ${site}` : ''}.xlsx`.replace(/[\\/:*?"<>|]+/g, '-');

/** groups: [{ dest, buses }] — what the page chose */
export async function exportSheets(day, groups, site) {
    const wb = await workbook();
    const ws = wb.addWorksheet('Bus sheets', landscape());
    ws.columns = [{ width: 24 }, { width: 44 }, { width: 16 }, { width: 14 }];
    let row = 1;
    for (const { dest, buses } of groups) for (const b of buses) {
        const part = b.rows[0]?.part ? (b.rows[0].part === 'gents' ? 'GENTS' : 'LADIES') : '';
        const top = row;
        // date | BUS n | destination
        ws.mergeCells(top, 2, top + 1, 2); ws.mergeCells(top, 3, top, 4);
        const date = ws.getCell(top, 1), time = ws.getCell(top + 1, 1), bus = ws.getCell(top, 2), dst = ws.getCell(top, 3);
        date.value = sheetDate(day); time.value = time12(b.at);
        bus.value = { richText: [{ text: `${vehicleWord(b.vehicle, b.vlabel)}\n`, font: { bold: true, size: 30, name: 'Arial Black' } }, { text: String(b.bus ?? ''), font: { bold: true, size: 54, name: 'Arial Black' } }] };
        dst.value = `${dest.label}${part ? `\n${part}` : ''}`;
        for (const c of [date, time]) { c.font = { bold: true, size: 22, underline: true, name: 'Arial Black' }; c.alignment = center; }
        dst.font = { bold: true, size: 20, underline: true, name: 'Arial Black' }; dst.alignment = center; dst.fill = fill('FFBFBFBF');
        bus.alignment = center;
        ws.getCell(top + 1, 3).value = 'SH REF'; ws.getCell(top + 1, 4).value = 'PAX NO';
        for (const c of [ws.getCell(top + 1, 3), ws.getCell(top + 1, 4)]) { c.font = { bold: true, size: 13, name: 'Arial Black' }; c.alignment = center; }
        ws.getRow(top).height = 96; ws.getRow(top + 1).height = 40;
        row = top + 2;
        for (const r of b.rows) {
            ws.getCell(row, 1).value = r.operator || ''; ws.getCell(row, 2).value = r.leader || ''; ws.getCell(row, 3).value = r.ref || ''; ws.getCell(row, 4).value = r.pax ?? '';
            for (let c = 1; c <= 4; c++) { const cell = ws.getCell(row, c); cell.font = { bold: true, size: 14 }; cell.alignment = { ...center, horizontal: c <= 2 ? 'left' : 'center' }; }
            ws.getRow(row).height = 34;
            row++;
        }
        // the pick-up line and the total
        const other = b.rows.slice(1).filter(r => r.building && r.building !== b.building);
        const from = [b.building ? `Departs from ${b.building}` : 'Departs from —', other.length ? `pick up ${other.map(r => `SH ${r.ref} at ${r.building}`).join(', ')}` : '',
            [b.transporter, b.vch && `Vch ${b.vch}`].filter(Boolean).join(' · ')].filter(Boolean).join(' · ');
        ws.mergeCells(row, 1, row, 2);
        ws.getCell(row, 1).value = from; ws.getCell(row, 1).font = { bold: true, size: 12 }; ws.getCell(row, 1).alignment = { vertical: 'middle', wrapText: true };
        if (b.rows.length > 1) { ws.mergeCells(row, 3, row, 4); ws.getCell(row, 3).value = `Total pax ${b.pax}`; ws.getCell(row, 3).font = { bold: true, size: 14 }; ws.getCell(row, 3).alignment = { horizontal: 'right', vertical: 'middle' }; }
        ws.getRow(row).height = 26;
        // border the whole block, thick outside
        for (let r = top; r <= row; r++) for (let c = 1; c <= 4; c++) {
            const cell = ws.getCell(r, c);
            cell.border = { top: r === top ? medium : thin, bottom: r === row ? medium : thin, left: c === 1 ? medium : thin, right: c === 4 ? medium : thin };
        }
        ws.getRow(row).addPageBreak();
        row += 2;
    }
    download(await wb.xlsx.writeBuffer(), fileName('Bus sheets', day, site));
}

export async function exportSummary(day, groups, site) {
    const wb = await workbook();
    const ws = wb.addWorksheet('Summary', landscape());
    ws.columns = [{ width: 30 }, { width: 34 }, { width: 11 }, { width: 8 }, { width: 13 }, { width: 18 }, { width: 13 }, { width: 6 }];
    const zy = [];
    let row = 1;
    for (const g of groups) {
        let buses = g.buses;
        if (g.dest.id === 'mdziyarat') { const z = ziyaratTables(day, g); zy.push(...z.tables); buses = z.rest; }
        if (!buses.length) continue;
        const pax = buses.reduce((s, b) => s + b.pax, 0);
        // band: date and destination, bold black on the yellow
        ws.getCell(row, 1).value = sheetDate(day); ws.mergeCells(row, 2, row, 8); ws.getCell(row, 2).value = g.dest.label;
        for (let c = 1; c <= 8; c++) { const x = ws.getCell(row, c); x.fill = fill('FFF1C232'); x.font = { bold: true, size: c === 1 ? 15 : 20, underline: true, color: BLACK, name: 'Arial Black' }; x.alignment = center; x.border = box(); }
        ws.getRow(row).height = 32; row++;
        ['GROUP', 'GROUP LEADER', 'SH REF', 'PAX', 'TIME', 'BUILDING', 'VEHICLE', 'NO'].forEach((h, i) => {
            const x = ws.getCell(row, i + 1); x.value = h; x.fill = fill('FFFFD966'); x.font = { bold: true, size: 10.5, underline: true, name: 'Arial Black' }; x.alignment = center; x.border = box();
        });
        row++;
        for (const { r, b, rider } of tripRows(buses)) {
            [r.operator || '', r.leader || '', r.ref ?? '', r.pax ?? '', time12(b.at), r.building || b.building || '', vehicleWord(b.vehicle, b.vlabel), b.bus ?? ''].forEach((v, i) => {
                const x = ws.getCell(row, i + 1); x.value = v; x.fill = fill(rider ? 'FFFFFAF0' : 'FFFFF2CC'); x.border = box();
                x.font = { bold: true, size: 11, color: { argb: 'FF3D3100' }, name: 'Times New Roman' };
                x.alignment = { ...center, horizontal: i < 2 || i === 5 ? 'left' : 'center' };
            });
            ws.getRow(row).height = 22; row++;
        }
        ws.mergeCells(row, 1, row, 3);
        ws.getCell(row, 1).value = `${buses.length} vehicle${buses.length === 1 ? '' : 's'} · ${buses.reduce((s, b) => s + b.rows.length, 0)} groups`;
        ws.getCell(row, 4).value = pax;
        for (let c = 1; c <= 8; c++) { const x = ws.getCell(row, c); x.border = box(); x.font = { bold: true, size: 11 }; x.alignment = { vertical: 'middle', horizontal: c === 4 ? 'center' : 'left' }; }
        row += 2;
    }
    if (row === 1) wb.removeWorksheet(ws.id);

    // Medina Ziyarat split into gents / ladies: the desks' sheet, one table per part and time
    if (zy.length) {
        const wz = wb.addWorksheet('Ziyarat', landscape());
        wz.columns = [{ width: 6 }, { width: 10 }, { width: 44 }, { width: 10 }, { width: 8 }, { width: 7 }, { width: 9 }, { width: 20 }];
        let r = 1;
        for (const z of zy) {
            const G = z.G;
            wz.mergeCells(r, 1, r, 8);
            const [a, b] = z.title.split('ZIYARAT');
            wz.getCell(r, 1).value = { richText: [{ text: a, font: { bold: true, size: 17 } }, { text: 'ZIYARAT', font: { bold: true, size: 17, color: RED } }, { text: b, font: { bold: true, size: 17 } }] };
            wz.getCell(r, 1).alignment = center; wz.getRow(r).height = 28;
            for (let c = 1; c <= 8; c++) wz.getCell(r, c).border = box(medium);
            r++;
            ['S N', 'S H NO.', 'GRUP-NAME', G ? 'GENTS' : 'LADIES', G ? 'G-C' : 'L-C', 'IFN', 'T-P', 'HOTEL-NAME'].forEach((h, i) => {
                const x = wz.getCell(r, i + 1); x.value = h; x.alignment = center; x.border = box(medium);
                x.font = { bold: true, size: 10.5, color: [0, 1, 3, 6].includes(i) ? RED : BLACK };
            });
            r++;
            for (const row2 of z.rows) {
                const name = row2.leader ? { richText: [{ text: row2.operator, font: { bold: true, color: RED, size: 10 } }, { text: `\n( ${row2.leader} )`, font: { bold: true, size: 10 } }] } : { richText: [{ text: row2.operator, font: { bold: true, color: RED, size: 10 } }] };
                [row2.sn, row2.ref, name, row2.adults, row2.c, row2.inf, row2.pax, row2.hotel].forEach((v, i) => {
                    const x = wz.getCell(r, i + 1); x.value = v; x.border = box(medium);
                    x.alignment = { ...center, horizontal: i === 2 ? 'left' : 'center' };
                    x.font = i === 6 ? { bold: true, size: 11, color: RED } : { bold: true, size: 11 };
                });
                wz.getRow(r).height = row2.leader ? 32 : 22; r++;
            }
            wz.mergeCells(r, 1, r, 8);
            wz.getCell(r, 1).value = { richText: [{ text: 'NOTE:- ', font: { bold: true } }, { text: `PER BUS-${z.perBus}`, font: { bold: true, color: RED } }, { text: ` PAX ...... ${z.coasters}-COASTER-${z.perCoaster} PAX`, font: { bold: true } }] };
            wz.getCell(r, 1).alignment = center;
            for (let c = 1; c <= 8; c++) wz.getCell(r, c).border = box(medium);
            r++;
            wz.mergeCells(r, 1, r, 3);
            wz.getCell(r, 1).value = { richText: [{ text: z.total.label, font: { bold: true, size: 12, color: RED } }, { text: ` - ${z.total.pax} - ${z.bigN} BUS ${z.coasters}-COASTER`, font: { bold: true, size: 12 } }] };
            [z.total.adults, z.total.c, z.total.inf, z.total.pax, ''].forEach((v, i) => { const x = wz.getCell(r, i + 4); x.value = v; x.font = { bold: true, size: 12, color: i === 3 ? RED : BLACK }; x.alignment = center; });
            for (let c = 1; c <= 8; c++) wz.getCell(r, c).border = box(medium);
            wz.getRow(r).addPageBreak();
            r += 2;
        }
    }
    if (!wb.worksheets.length) throw new Error('Nothing to export for this choice.');
    download(await wb.xlsx.writeBuffer(), fileName('Bus summary', day, site));
}
