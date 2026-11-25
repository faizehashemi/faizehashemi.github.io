import { a as e, c as t, f as n, h as r, i, n as a, o, p as s, s as ee, u as te } from "./PmsContext-BVMd13Oi.js";
import { t as ne } from "./checkbox-C3tIiLfF.js";
import { t as re } from "./switch-zmjMQiva.js";
import { t as ie } from "./DayNav-CaC48u7r.js";
import { t as ae } from "./image-down-DIpmmZZM.js";
import { t as oe } from "./printer-_t2PY0au.js";
import { t as c } from "./button-BGWa3SLr.js";
import { t as l } from "./card-B9_OGomP.js";
import { t as se } from "./input-DSBk_UeU.js";
// src/pages/transport-print/sheets.css?raw
var u = /* @__PURE__ */ r(s(), 1), ce = "/* ---------- the sheet (as the printed bus signs: Arial Black headings, bold serif names) ---------- */\r\n.tq-sheets { display: grid; gap: 18px; justify-items: center; padding: 0 12px 30px; }\r\n.sheet { width: 277mm; height: 190mm; background: #fff; padding: 6mm; box-shadow: var(--shade); display: flex; flex-direction: column; color: #000; overflow: hidden; }\r\n.sheet table { width: 100%; border-collapse: collapse; table-layout: fixed; }\r\n.sheet td { border: 2px solid #000; text-align: center; vertical-align: middle; padding: 2mm 3mm; }\r\n.sheet .h { font-family: \"Arial Black\", \"Archivo Black\", Arial, sans-serif; font-weight: 900; }\r\n.sheet .date, .sheet .time { font-size: 30pt; text-decoration: underline; text-underline-offset: 4px; }\r\n.sheet .bus { border-top: 0; border-bottom: 0; line-height: .95; }\r\n.sheet .bus .w { display: block; font-size: 64pt; }\r\n.sheet .bus.long .w { font-size: 30pt; line-height: 1.1; }   /* a custom name: \"SELF- BUS\" */\r\n.sheet .bus .n { display: block; font-size: 110pt; }\r\n.sheet .dest { background: #bfbfbf; font-size: 30pt; text-decoration: underline; text-underline-offset: 4px; }\r\n.sheet .dest.long { font-size: 22pt; }\r\n.sheet .col { font-size: 20pt; color: #262626; }\r\n.sheet .row td { font-family: \"Times New Roman\", Times, Georgia, serif; font-weight: 700; font-size: 22pt; text-transform: uppercase; height: 30mm; }\r\n.sheet.many .row td { font-size: 16pt; height: auto; padding: 1.5mm 3mm; }\r\n.sheet .foot { display: flex; justify-content: space-between; align-items: baseline; margin-top: 2mm; font: 700 11pt Arial, sans-serif; color: #333; }\r\n.sheet .foot .from small { font-size: 13pt; }\r\n.sheet .foot .from { display: block; font: 900 20pt \"Arial Black\", Arial, sans-serif; color: #000; margin-bottom: 1mm; }\r\n.sheet .foot .total { font-size: 16pt; color: #000; border: 2px solid #000; padding: 0 5mm; }\r\n.sheet .foot { flex: none; }\r\n/* many groups: smaller steps until the sheet fits its page (view.js fitSheets) */\r\n.sheet.fit1 .row td { font-size: 14pt; height: auto; padding: 1.2mm 3mm; }\r\n.sheet.fit1 .bus .n { font-size: 90pt; } .sheet.fit1 .bus .w { font-size: 52pt; }\r\n.sheet.fit2 .row td { font-size: 12pt; height: auto; padding: 1mm 2.5mm; }\r\n.sheet.fit2 .bus .n { font-size: 72pt; } .sheet.fit2 .bus .w { font-size: 42pt; }\r\n.sheet.fit2 .date, .sheet.fit2 .time, .sheet.fit2 .dest { font-size: 22pt; } .sheet.fit2 .col { font-size: 15pt; }\r\n.sheet.fit3 .row td { font-size: 10.5pt; height: auto; padding: .7mm 2mm; }\r\n.sheet.fit3 .bus .n { font-size: 56pt; } .sheet.fit3 .bus .w { font-size: 34pt; }\r\n.sheet.fit3 .date, .sheet.fit3 .time, .sheet.fit3 .dest { font-size: 18pt; } .sheet.fit3 .col { font-size: 12pt; }\r\n.sheet.fit3 .foot .from { font-size: 15pt; }\r\n.sheet.fit4 .row td { font-size: 9pt; height: auto; padding: .4mm 1.5mm; }\r\n.sheet.fit4 .bus .n { font-size: 44pt; } .sheet.fit4 .bus .w { font-size: 26pt; }\r\n.sheet.fit4 .date, .sheet.fit4 .time, .sheet.fit4 .dest { font-size: 15pt; } .sheet.fit4 .col { font-size: 10pt; }\r\n.sheet.fit4 .foot .from { font-size: 13pt; } .sheet.fit4 .foot .total { font-size: 13pt; }\r\n.tq-none { padding: 30px; color: var(--muted-foreground); text-align: center; }\r\n\r\n/* ---------- Print summary (only while printing it) ---------- */\r\n.tq-summary { display: none; }\r\n.sum { width: 100%; border-collapse: collapse; table-layout: fixed; margin: 0 0 8mm; color: #000; break-inside: auto; }\r\n.sum th, .sum td { border: 1.5px solid #000; padding: 1.6mm 2mm; text-align: center; vertical-align: middle; }\r\n.sum thead { display: table-header-group; }\r\n.sum .band th { background: #f1c232; color: #000; font: 900 20pt \"Arial Black\", Arial, sans-serif; text-decoration: underline; text-underline-offset: 3px; } /* destination and date: bold, black */\r\n.sum .band .d { font-size: 15pt; }\r\n.sum .cols th { background: #ffd966; font: 900 10.5pt \"Arial Black\", Arial, sans-serif; text-decoration: underline; }\r\n.sum tbody td { background: #fff2cc; font: 700 11pt \"Times New Roman\", Georgia, serif; text-transform: uppercase; color: #3d3100; }\r\n.sum tbody tr { break-inside: avoid; page-break-inside: avoid; }\r\n.sum tbody tr.rider td { background: #fffaf0; }\r\n.sum tbody .n { font-family: Georgia, serif; white-space: nowrap; }\r\n.sum tfoot td { font: 700 11pt Arial, sans-serif; background: #fff; text-align: left; }\r\n.sum tfoot td.n { text-align: center; }\r\nhtml.tq-print-summary .tq-sheets { display: none !important; }\r\nhtml.tq-print-summary .tq-summary { display: block; }\r\n\r\n@media print {\r\n    @page { size: A4 landscape; margin: 8mm; }\r\n    body { background: #fff !important; }\r\n    .tq-tools { display: none !important; }\r\n    .tq-sheets { display: block; padding: 0; }\r\n    .sheet { box-shadow: none; padding: 0; width: 100%; height: 190mm; break-after: page; page-break-after: always; }\r\n    .sheet:last-child { break-after: auto; page-break-after: auto; }\r\n}\r\n/* Medina Ziyarat sheets (gents / ladies), as the desks' own */\r\n.sum.zy th, .sum.zy td { background: #fff; color: #000; font: 700 11pt Calibri, Arial, sans-serif; text-transform: uppercase; border: 1.5px solid #000; }\r\n.sum.zy .zy-title th { font: 900 17pt Calibri, Arial, sans-serif; background: #fff; color: #000; text-decoration: none; }\r\n.sum.zy .zy-cols th { font: 900 10.5pt Calibri, Arial, sans-serif; background: #fff; color: #000; text-decoration: none; }\r\n.sum.zy .zy-red { color: #e00000; }\r\n.sum.zy td.zy-name { text-align: left; font-size: 10pt; }\r\n.sum.zy td.zy-tp { color: #e00000; font-weight: 900; }\r\n.sum.zy .zy-note td { text-align: center; font-size: 11pt; }\r\n.sum.zy .zy-total td { font: 900 12pt Calibri, Arial, sans-serif; }\r\n\r\n/* ---------- Luggage sheet (A4 portrait, one page per bus; only while printing it) ---------- */\r\n.tq-lug-routes { display: flex; flex-wrap: wrap; gap: 8px 16px; margin: 8px 0; }\r\n.tq-lug-routes label { display: inline-flex; gap: 6px; align-items: center; font-weight: 600; }\r\n.tq-lug-routes input { width: 18px; height: 18px; accent-color: var(--gold-deep); }\r\n.tq-lug-act { display: flex; flex-wrap: wrap; gap: 10px; align-items: center; }\r\n.tq-lugsheets { display: none; }\r\nhtml.tq-print-lug .tq-sheets, html.tq-print-lug .tq-summary { display: none !important; }\r\nhtml.tq-print-lug .tq-lugsheets { display: block; }\r\n.lug { page: luggage; display: flex; flex-direction: column; align-items: stretch; height: 190mm; color: #000; background: #fff; break-after: page; page-break-after: always; overflow: hidden; font-family: Arial, Helvetica, sans-serif; }\r\n.lug:last-child { break-after: auto; page-break-after: auto; }\r\n.lug-head { display: flex; justify-content: space-between; align-items: baseline; gap: 6mm; margin: 0 0 3mm; }\r\n.lug-no { font: 700 16pt Arial, sans-serif; text-transform: uppercase; margin: 0; }\r\n.lug-date { font: 700 16pt Arial, sans-serif; text-transform: uppercase; white-space: nowrap; }\r\n.lug-tbl { width: 100%; border-collapse: collapse; table-layout: fixed; flex: none; }\r\n.lug-tbl th, .lug-tbl td { border: 2.5px solid #000; padding: 2.5mm; text-align: center; vertical-align: middle; color: #000; font-weight: 900; text-transform: uppercase; word-break: break-word; }\r\n.lug-tbl th { font-size: 12pt; background: #fff; }\r\n.lug-tbl th:nth-child(1) { width: 36%; } .lug-tbl th:nth-child(2) { width: 34%; } .lug-tbl th:nth-child(3) { width: 16%; } .lug-tbl th:nth-child(4) { width: 14%; }\r\n.lug.l1 .lug-tbl td { font-size: 28pt; } .lug.l2 .lug-tbl td { font-size: 20pt; padding: 1.8mm; } .lug.l3 .lug-tbl td { font-size: 14pt; padding: 1.2mm; } .lug.l4 .lug-tbl td { font-size: 11pt; padding: .8mm; }\r\n.lug-tbl tfoot td { font-size: 18pt; text-align: right; } .lug-tbl tfoot td.n { text-align: center; }\r\n.lug-arrow { flex: 1 1 0; min-height: 18mm; width: 100%; margin-top: 4mm; }\r\n@page luggage { size: A4 landscape; margin: 8mm; }\r\n@media print {\r\n    html.tq-print-lug .tq-tools { display: none !important; }\r\n}\r\n\r\n@font-face { font-family: \"Rockwell Extra Bold\"; src: url(\"assets/fonts/rockwell-extra-bold.ttf\") format(\"truetype\"); font-weight: 400 900; font-display: swap; }\r\n@font-face { font-family: \"EB Garamond\"; src: url(\"assets/fonts/EBGaramond-Variable.ttf\") format(\"truetype\"); font-weight: 400 800; font-display: swap; }\r\n/* the Print font choice on the page: every bus sheet, summary and luggage sheet in one typeface (auto = each format's own) */\r\n.pf-rock .sheet, .pf-rock .sheet *, .pf-rock .lug, .pf-rock .lug *, .pf-rock .sum, .pf-rock .sum * { font-family: \"Rockwell Extra Bold\", Rockwell, Georgia, serif !important; font-weight: 400 !important; }\r\n.pf-gar .sheet, .pf-gar .sheet *, .pf-gar .lug, .pf-gar .lug *, .pf-gar .sum, .pf-gar .sum * { font-family: \"EB Garamond\", Garamond, Georgia, serif !important; font-weight: 800 !important; }\r\n/* ---------- Format two: A4 portrait bus sign (Medina's default) ---------- */\r\n.sheet.sheet2 { width: 190mm; height: 277mm; padding: 6mm 8mm; display: flex; flex-direction: column; align-items: stretch; page: bus2; font-family: Arial, Helvetica, sans-serif; }\r\n.s2-date { font: 600 10pt Arial, sans-serif; text-align: center; color: #333; }\r\n.s2-title { font: 900 30pt \"Arial Black\", Arial, sans-serif; text-align: center; text-transform: uppercase; line-height: 1.05; margin-top: 1mm; }\r\n.s2-word { font: 900 38pt \"Arial Black\", Arial, sans-serif; text-align: center; text-transform: uppercase; line-height: 1.1; }\r\n.s2-word small { font-size: 20pt; font-weight: 700; margin-left: 4mm; }\r\n.s2-num { flex: 1 1 0; min-height: 40mm; overflow: hidden; display: flex; align-items: center; justify-content: center; }\r\n.s2-num .n { font: 400 200pt/1 \"Rockwell Extra Bold\", \"Rockwell\", \"Arial Black\", Arial, sans-serif; color: #000; -webkit-text-stroke: 0; }\r\n.sheet2 .s2-tbl { flex: none; width: 100%; border-collapse: collapse; table-layout: fixed; margin-top: 3mm; }\r\n.sheet2 .s2-tbl th, .sheet2 .s2-tbl td { border: 2px solid #000; padding: 1.6mm 2.4mm; text-align: center; vertical-align: middle; }\r\n.sheet2 .s2-tbl th { font: 900 11pt \"Times New Roman\", serif; background: #e9e5f0; }\r\n.sheet2 .s2-tbl td { font-family: \"Times New Roman\", Times, Georgia, serif; font-weight: 700; font-size: var(--s2-row, 18pt); text-transform: uppercase; }\r\n.sheet2 .s2-tbl td.n { font-size: calc(var(--s2-row, 18pt) * 1.15); }\r\n.sheet2 .s2-tbl td b { display: block; font-weight: 900; }\r\n.sheet2 .s2-tbl td span { display: block; font-size: .72em; font-weight: 700; }\r\n.sheet2 .s2-tbl tfoot td { font: 900 12pt Arial, sans-serif; text-align: right; }\r\n.sheet2 .s2-tbl tfoot td.n { text-align: center; }\r\n.sheet2 .s2-from { margin-top: 2mm; font-size: 11pt; }\r\n.sheet2 .s2-from .from { display: block; font: 700 12pt Arial, sans-serif; }\r\n/* the Hajj Mishkat watermark (optional): centred behind everything on the sheet; the sheet's own content stays on top */\r\n.sheet.sheet2 { position: relative; }\r\n.sheet2 > :not(.s2-wm) { position: relative; z-index: 1; }\r\n.sheet2 .s2-wm { position: absolute; z-index: 0; left: 50%; top: 50%; transform: translate(-50%, -50%); width: 150mm; max-width: 82%; max-height: 88%; object-fit: contain; pointer-events: none; user-select: none; }\r\n@page bus2 { size: A4 portrait; margin: 8mm; }\r\n/* the padding counts inside the page box: 100% wide and 281mm tall (A4 portrait less 8mm margins) — without it the sheet ran ~3% past the page */\r\n@media print { .sheet.sheet2 { width: 100%; height: 280mm; box-sizing: border-box; } }\r\n", d = (e) => String(e ?? "").replace(/[&<>"']/g, (e) => ({
	"&": "&amp;",
	"<": "&lt;",
	">": "&gt;",
	"\"": "&quot;",
	"'": "&#39;"
})[e]);
function le(e) {
	let t = /* @__PURE__ */ new Set();
	for (let n of String(e).split(/[,\s]+/).filter(Boolean)) {
		let e = n.match(/^(\d+)(?:-(\d+))?$/);
		if (!e) continue;
		let r = Number(e[1]), i = Number(e[2] || e[1]);
		for (let e = Math.min(r, i); e <= Math.max(r, i) && t.size < 1e3; e++) t.add(e);
	}
	return t.size ? t : null;
}
function f(e) {
	let t = e.rows.slice(1).filter((t) => t.building && t.building !== e.building);
	return !e.building && !t.length ? "" : `<b class="from">${e.building ? `Departs from ${d(e.building)}` : "Departs from —"}${t.length ? `<small> · pick up ${t.map((e) => `SH ${d(e.ref)} at ${d(e.building)}`).join(", ")}</small>` : ""}</b>`;
}
function ue(e, t, n, r) {
	return `<section class="sheet${r.rows.length > 3 ? " many" : ""}">
      <table>
        <colgroup><col style="width:24%"><col style="width:46%"><col style="width:17%"><col style="width:13%"></colgroup>
        <tr><td class="h date">${d(e.sheetDate(t))}</td>
            <td class="h bus${e.vehicleWord(r.vehicle, r.vlabel).length > 5 ? " long" : ""}" rowspan="2"><span class="w">${d(e.vehicleWord(r.vehicle, r.vlabel))}</span><span class="n">${d(r.bus ?? "")}</span></td>
            <td class="h dest${(n.label + (r.rows[0]?.part ? " X GENTS" : "")).length > 8 ? " long" : ""}" colspan="2">${d(n.label)}${r.rows[0]?.part ? `<br>${r.rows[0].part === "gents" ? "GENTS" : "LADIES"}` : ""}</td></tr>
        <tr><td class="h time">${d(e.time12(r.at))}</td><td class="h col">SH REF</td><td class="h col">PAX NO</td></tr>
        ${r.rows.map((e) => `<tr class="row"><td>${d(e.operator || "")}</td><td>${d(e.leader || "")}</td><td>${d(e.ref)}</td><td>${d(e.pax)}</td></tr>`).join("")}
      </table>
      <div class="foot"><span>${f(r)}${d([r.transporter, r.vch && `Vch ${r.vch}`].filter(Boolean).join(" · "))}</span>
        ${r.rows.length > 1 ? `<span>Total pax <span class="total">${d(r.pax)}</span></span>` : ""}</div>
    </section>`;
}
function de(e, t, n, r, i, a) {
	let o = e.vehicleWord(r.vehicle, r.vlabel);
	return `<section class="sheet sheet2">${a ? `<img class="s2-wm" src="${d(a.src)}" alt="" style="opacity:${Math.min(1, Math.max(0, a.opacity))}">` : ""}
      <div class="s2-date">Date - ${d(e.sheetDate(t))}</div>
      <div class="s2-title">${d(String(n.route || `${i}-${n.label}`).replace("-", " TO ").replace(/ MAKKAH$/, " MECCA"))}${r.rows[0]?.part ? ` · ${r.rows[0].part === "gents" ? "GENTS" : "LADIES"}` : ""}</div>
      <div class="s2-word">${d(o)} NO.${r.at ? ` <small>${d(e.time12(r.at))}</small>` : ""}</div>
      <div class="s2-num"><span class="n">${d(r.bus ?? "")}</span></div>
      <table class="s2-tbl"><colgroup><col style="width:17%"><col><col style="width:12%"></colgroup>
        <thead><tr><th>SH No.</th><th>GROUP</th><th>PAX</th></tr></thead>
        <tbody>${r.rows.map((e) => `<tr><td class="n">${d(e.ref)}</td><td><b>${d(e.operator || "")}</b>${e.leader ? `<span>${d(e.leader)}</span>` : ""}</td><td class="n">${d(e.pax)}</td></tr>`).join("")}</tbody>
        ${r.rows.length > 1 ? `<tfoot><tr><td colspan="2">TOTAL</td><td class="n">${d(r.pax)}</td></tr></tfoot>` : ""}
      </table>
      ${f(r) ? `<div class="s2-from">${f(r)}</div>` : ""}
    </section>`;
}
var fe = [
	"SUNDAY",
	"MONDAY",
	"TUESDAY",
	"WEDNESDAY",
	"THURSDAY",
	"FRIDAY",
	"SATURDAY"
], p = (e) => {
	let t = String(e || "");
	return /^\d{4}-\d{2}-\d{2}/.test(t) ? `${fe[(/* @__PURE__ */ new Date(`${t.slice(0, 10)}T12:00`)).getDay()]} ${t.slice(8, 10)}-${t.slice(5, 7)}-${t.slice(0, 4)}${t.length >= 16 ? ` · ${t.slice(11, 16)}` : ""}` : "";
};
function pe(e, t) {
	let n = t.rows.length;
	return `<section class="lug ${n <= 3 ? "l1" : n <= 6 ? "l2" : n <= 10 ? "l3" : "l4"}">
      <div class="lug-head"><div class="lug-no">${d(e.vehicleWord(t.vehicle, t.vlabel))} No. ${d(t.bus ?? "")}</div><div class="lug-date">${d(p(t.at || t.rows[0]?.at))}</div></div>
      <table class="lug-tbl">
        <thead><tr><th>GROUP NAME</th><th>GROUP LEADER</th><th>SH NO.</th><th>PAX</th></tr></thead>
        <tbody>${t.rows.map((e) => `<tr><td>${d(e.operator || "")}</td><td>${d(e.leader || "")}</td><td class="n">${d(e.ref)}</td><td class="n">${d(e.pax)}</td></tr>`).join("")}</tbody>
        ${n > 1 ? `<tfoot><tr><td colspan="3">TOTAL</td><td class="n">${d(t.pax)}</td></tr></tfoot>` : ""}
      </table>
    </section>`;
}
var m = (e) => Array.isArray(e.rooms) ? e.rooms.join(", ") : String(e.rooms || "");
function h(e, t, { dest: n, buses: r }, i = !1) {
	let a = r.reduce((e, t) => e + t.pax, 0);
	return `<table class="sum">
      <colgroup><col style="width:6%"><col style="width:17%"><col style="width:22%"><col style="width:9%"><col style="width:6%"><col style="width:9%"><col style="width:11%"><col style="width:12%"><col style="width:8%">${i ? "<col style=\"width:10%\">" : ""}</colgroup>
      <thead>
        <tr class="band"><th class="d" colspan="2">${d(e.sheetDate(t))}</th><th class="t" colspan="${i ? 8 : 7}">${d(n.label)}</th></tr>
        <tr class="cols"><th>BUS NO</th><th>GROUP</th><th>GROUP LEADER</th><th>SH REF</th><th>PAX</th><th>TIME</th><th>BUILDING</th><th>TRANSPORTER</th><th>VEHICLE</th>${i ? "<th>ROOM NO</th>" : ""}</tr>
      </thead>
      <tbody>${e.tripRows(r).map(({ r: t, b: n, rider: r }) => `<tr${r ? " class=\"rider\"" : ""}>
        <td class="n">${d(n.bus ?? "")}</td><td>${d(t.operator || "")}</td><td>${d(t.leader || "")}</td><td class="n">${d(t.ref)}</td><td class="n">${d(t.pax)}</td>
        <td class="n">${d(e.time12(n.at))}</td><td>${d(t.building || n.building || "")}</td><td>${d(t.transporter || n.transporter || "")}</td><td>${d(e.vehicleWord(n.vehicle, n.vlabel))}</td>${i ? `<td>${d(m(t))}</td>` : ""}</tr>`).join("")}</tbody>
      <tfoot><tr><td colspan="4">${r.length} vehicle${r.length === 1 ? "" : "s"} · ${r.reduce((e, t) => e + t.rows.length, 0)} groups</td><td class="n">${a}</td><td colspan="${i ? 5 : 4}"></td></tr></tfoot>
    </table>`;
}
function g(e, t, n, r = !1) {
	return n.map((n) => {
		if (n.dest.id === "mdziyarat") {
			let i = e.ziyaratSummary(t, n, { rooms: r });
			return i.html + (i.rest.length ? h(e, t, {
				dest: n.dest,
				buses: i.rest
			}, r) : "");
		}
		return h(e, t, n, r);
	}).join("");
}
function _(e) {
	for (let t of e.querySelectorAll(".sheet2")) {
		let e = t.querySelector(".s2-num"), n = e?.firstElementChild;
		if (!e || !n) continue;
		let r = t.querySelectorAll("tbody tr").length;
		t.style.setProperty("--s2-row", r > 12 ? "9pt" : r > 8 ? "11pt" : r > 5 ? "14pt" : "18pt");
		let i = 40, a = 520;
		for (let t = 0; t < 12; t++) {
			let t = (i + a) / 2;
			n.style.fontSize = t + "pt", n.scrollHeight <= e.clientHeight + 1 && n.scrollWidth <= e.clientWidth + 1 ? i = t : a = t;
		}
		n.style.fontSize = i + "pt";
	}
	for (let t of e.querySelectorAll(".sheet:not(.sheet2)")) {
		t.classList.remove("fit1", "fit2", "fit3", "fit4");
		for (let e = 1; e <= 4 && t.scrollHeight > t.clientHeight + 1; e++) e > 1 && t.classList.remove(`fit${e - 1}`), t.classList.add(`fit${e}`);
	}
}
function me(e) {
	for (let t of e.querySelectorAll(".lug")) {
		let e = [...t.querySelectorAll(".lug-tbl td")], n = parseFloat(getComputedStyle(e[0] ?? t).fontSize) * .75 || 14;
		for (; n > 6 && t.scrollHeight > t.clientHeight + 1;) {
			n -= .5;
			for (let t of e) t.style.fontSize = `${n}pt`, t.style.padding = `${Math.max(.4, n / 12)}mm`;
		}
	}
}
// src/pages/transport-print/TransportPrintPage.tsx
var v = n(), y = "pms_transport_print_off", b = "pms_transport_print_dests", he = [
	"atraaf",
	"madina",
	"airport"
];
function x() {
	let { cloud: n, transport: r } = a(), s = r, d = i(), f = t(), fe = e(), p = o(), { site: m, siteId: h } = te(), { href: x, navigate: ge } = ee(), S = /^\d{4}-\d{2}-\d{2}$/.test(f.get("day") || "") ? f.get("day") : s.today(), C = s.destsFor(h), [w, _e] = (0, u.useState)(() => {
		try {
			let e = JSON.parse(localStorage.getItem(y) || "null"), t = JSON.parse(localStorage.getItem(b) || "null");
			if (Array.isArray(e)) return e;
			if (Array.isArray(t)) return he.filter((e) => !t.includes(e));
		} catch {}
		return [];
	}), [T, ve] = (0, u.useState)(""), [E, ye] = (0, u.useState)({ rows: [] }), [be, xe] = (0, u.useState)([]), [D, O] = (0, u.useState)(""), [k, A] = (0, u.useState)(""), j = `pms_bus_format:${h}`, [M, Se] = (0, u.useState)(() => {
		try {
			let e = localStorage.getItem(j);
			if (e === "1" || e === "2") return e;
		} catch {}
		return h === "medina" ? "2" : "1";
	}), Ce = (e) => {
		Se(e);
		try {
			localStorage.setItem(j, e);
		} catch {}
	}, N = "pms_bus_font", [P, we] = (0, u.useState)(() => {
		try {
			let e = localStorage.getItem(N);
			if (e === "rock" || e === "gar") return e;
		} catch {}
		return "auto";
	}), Te = (e) => {
		we(e);
		try {
			localStorage.setItem(N, e);
		} catch {}
	}, F = P === "rock" ? " pf-rock" : P === "gar" ? " pf-gar" : "", I = "pms_bus_watermark", [L, Ee] = (0, u.useState)(() => {
		try {
			let e = JSON.parse(localStorage.getItem(I) || "null");
			if (e && typeof e.on == "boolean") return {
				on: e.on,
				pct: Math.min(40, Math.max(2, Number(e.pct) || 8))
			};
		} catch {}
		return {
			on: !1,
			pct: 8
		};
	}), R = (e) => {
		Ee(e);
		try {
			localStorage.setItem(I, JSON.stringify(e));
		} catch {}
	}, De = new URL("assets/mishkat.svg", document.baseURI).href, [Oe, ke] = (0, u.useState)(!1), [z, Ae] = (0, u.useState)([]), [B, je] = (0, u.useState)(""), [Me, Ne] = (0, u.useState)(() => {
		try {
			return localStorage.getItem("pms_bus_sum_rooms") === "1";
		} catch {
			return !1;
		}
	}), V = h === "medina" && Me, [H, Pe] = (0, u.useState)(null), U = (0, u.useRef)(null);
	(0, u.useEffect)(() => {
		(async () => {
			let e = await p("ziyarat"), t = await fe("views/transport-print/export.js");
			Pe({
				ziyarat: e,
				ex: t
			});
			try {
				let [e, t] = await d(Promise.all([s.loadDay(h, S), s.listDays(h)]));
				ye(e), xe(t);
			} catch (e) {
				O(e instanceof n.UserError ? e.message : "Could not load the transport list.");
			}
		})();
	}, []);
	let W = (0, u.useMemo)(() => s.signage(E.rows, h), [E.rows, h]), G = C.map((e) => e.id).filter((e) => !w.includes(e)), K = () => {
		let e = le(T);
		return W.filter((e) => G.includes(e.dest.id)).map((t) => ({
			...t,
			buses: t.buses.filter((t) => !e || e.has(Number(t.bus)))
		})).filter((e) => e.buses.length);
	}, q = H ? {
		vehicleWord: s.vehicleWord,
		sheetDate: s.sheetDate,
		time12: s.time12,
		tripRows: H.ex.tripRows,
		ziyaratSummary: H.ziyarat.ziyaratSummary
	} : null, J = K().flatMap((e) => e.buses.map((t) => M === "2" ? de(s, S, e.dest, t, m.label.toUpperCase(), L.on ? {
		src: De,
		opacity: L.pct / 100
	} : null) : ue(s, S, e.dest, t))), Y = J.join("") || `<p class="tq-none">${E.rows.length ? "No buses for this choice." : "No transport list saved for this day."}</p>`;
	(0, u.useLayoutEffect)(() => {
		U.current && _(U.current);
	}, [
		Y,
		M,
		P
	]), (0, u.useEffect)(() => {
		M === "2" && document.fonts?.load("200pt \"Rockwell Extra Bold\"").then(() => {
			U.current && _(U.current);
		});
	}, [
		Y,
		M,
		P
	]);
	function Fe(e, t) {
		let n = t ? [...G, e] : G.filter((t) => t !== e), r = [...w.filter((e) => !C.some((t) => t.id === e)), ...C.map((e) => e.id).filter((e) => !n.includes(e))];
		_e(r);
		try {
			localStorage.setItem(y, JSON.stringify(r)), localStorage.removeItem(b);
		} catch {}
	}
	function X(e, t, n) {
		let r = window.open("", "_blank");
		if (!r) {
			O("The browser blocked the new tab. Allow pop-ups for this site, then press Print again.");
			return;
		}
		let i = new URL("assets/fonts/rockwell-extra-bold.ttf", document.baseURI).href, a = ce.replace("url(\"assets/fonts/rockwell-extra-bold.ttf\")", `url("${i}")`).replace("url(\"assets/fonts/EBGaramond-Variable.ttf\")", `url("${new URL("assets/fonts/EBGaramond-Variable.ttf", document.baseURI).href}")`);
		r.document.open(), r.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>${e}</title><style>${a}
            body { margin: 0; background: #eee; font-family: Arial, Helvetica, sans-serif; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            .tq-sheets { padding: 12px 12px 30px; } .tq-summary, .tq-lugsheets { display: block !important; max-width: 1060px; margin: 12px auto; padding: 8mm; background: #fff; }
            @media print { body { background: #fff; } .tq-summary, .tq-lugsheets { max-width: none; margin: 0; padding: 0; } }
        </style></head><body><div class="${t}${F}">${n}</div><script>
            (async function () {
                try { await document.fonts.load('200pt "Rockwell Extra Bold"'); await document.fonts.load('800 20pt "EB Garamond"'); } catch (e) { }
                // the watermark picture must be in before the print dialog, or it prints blank
                await Promise.all([].slice.call(document.images).map(function (im) { return im.complete ? 0 : new Promise(function (r) { im.onload = im.onerror = r; }); }));
                (${_.toString()})(document); (${me.toString()})(document);
                setTimeout(function () { window.focus(); window.print(); }, 300);
            })();
        <\/script></body></html>`), r.document.close();
	}
	let Ie = () => X(`Bus sheets ${S}`, "tq-sheets", J.join("")), Le = () => {
		q && X(`Bus summary ${S}`, "tq-summary", g(q, S, K(), V));
	}, Re = W.filter((e) => e.buses.length), Z = W.filter((e) => !z.includes(e.dest.id)).reduce((e, t) => e + t.buses.length, 0), ze = () => X(`Luggage sheets ${S}`, "tq-lugsheets", W.filter((e) => !z.includes(e.dest.id)).flatMap((e) => e.buses.map((e) => pe(s, e))).join(""));
	async function Be() {
		if (!q) return;
		O(""), A("");
		let e = document.createElement("div");
		e.className = "tq-summary", e.style.cssText = "display:block;position:fixed;left:-10000px;top:0;width:1000px;background:#fff", e.innerHTML = g(q, S, K(), V), document.body.appendChild(e);
		try {
			let t = await (await p("table-image")).copyTablesImage([...e.querySelectorAll("table")], `bus-summary-${S}.png`);
			A(t === "copied" ? "Summary copied as a picture — paste it into the chat." : "This browser cannot copy pictures — the image was downloaded instead.");
		} catch (e) {
			O("Could not make the image: " + (e?.message || e));
		} finally {
			e.remove();
		}
	}
	async function Q(e) {
		je(e), O("");
		try {
			await (e === "sheets" ? H.ex.exportSheets : H.ex.exportSummary)(S, K(), m.label, { rooms: V });
		} catch (e) {
			O(e?.message || "Could not make the Excel file.");
		} finally {
			je("");
		}
	}
	let $ = !J.length;
	return /* @__PURE__ */ (0, v.jsxs)(v.Fragment, { children: [
		/* @__PURE__ */ (0, v.jsx)("style", { children: ce }),
		/* @__PURE__ */ (0, v.jsxs)("div", {
			className: "tq-tools mx-auto grid grid-cols-[minmax(0,1fr)] max-w-[2400px] min-w-0 gap-3 px-3 pt-4 sm:px-4",
			children: [
				/* @__PURE__ */ (0, v.jsxs)("header", {
					className: "flex flex-wrap items-start justify-between gap-3",
					children: [/* @__PURE__ */ (0, v.jsxs)("div", { children: [/* @__PURE__ */ (0, v.jsx)("h1", {
						className: "text-2xl font-bold text-primary",
						children: "Bus sheets"
					}), /* @__PURE__ */ (0, v.jsxs)("p", {
						className: "text-sm text-muted-foreground",
						children: ["One page per bus, to stick on the bus. ", M === "2" ? "Format two prints A4 portrait." : "Format one prints A4 landscape — choose “Landscape” if the printer asks."]
					})] }), /* @__PURE__ */ (0, v.jsxs)("div", {
						className: "flex flex-wrap gap-2",
						children: [
							/* @__PURE__ */ (0, v.jsx)(c, {
								asChild: !0,
								variant: "outline",
								children: /* @__PURE__ */ (0, v.jsx)("a", {
									href: x("transport", { day: S }),
									children: "🚌 Transport day"
								})
							}),
							/* @__PURE__ */ (0, v.jsxs)("select", {
								"aria-label": "Print font",
								className: "h-9 rounded-md border bg-background px-2 text-sm",
								value: P,
								onChange: (e) => Te(e.target.value),
								title: "The typeface of the printed sheets",
								children: [
									/* @__PURE__ */ (0, v.jsx)("option", {
										value: "auto",
										children: "Font: each format's own"
									}),
									/* @__PURE__ */ (0, v.jsx)("option", {
										value: "rock",
										children: "Font: Rockwell Extra Bold"
									}),
									/* @__PURE__ */ (0, v.jsx)("option", {
										value: "gar",
										children: "Font: Garamond"
									})
								]
							}),
							/* @__PURE__ */ (0, v.jsxs)("select", {
								"aria-label": "Sign format",
								className: "h-9 rounded-md border bg-background px-2 text-sm",
								value: M,
								onChange: (e) => Ce(e.target.value),
								title: "The layout of the bus sign",
								children: [/* @__PURE__ */ (0, v.jsx)("option", {
									value: "1",
									children: "Format 1 — landscape"
								}), /* @__PURE__ */ (0, v.jsx)("option", {
									value: "2",
									children: "Format 2 — portrait, big number"
								})]
							}),
							M === "2" && /* @__PURE__ */ (0, v.jsxs)("span", {
								className: "flex h-9 items-center gap-2 rounded-md border bg-background px-2 text-sm",
								title: "The Hajj Mishkat emblem printed lightly behind format two",
								children: [
									/* @__PURE__ */ (0, v.jsx)(re, {
										checked: L.on,
										onCheckedChange: (e) => R({
											...L,
											on: e
										}),
										"aria-label": "Watermark"
									}),
									/* @__PURE__ */ (0, v.jsx)("span", { children: "Watermark" }),
									L.on && /* @__PURE__ */ (0, v.jsxs)("label", {
										className: "flex items-center gap-1",
										children: [
											"opacity",
											/* @__PURE__ */ (0, v.jsx)("input", {
												type: "number",
												min: 2,
												max: 40,
												step: 1,
												value: L.pct,
												"aria-label": "Watermark opacity (%)",
												className: "h-7 w-14 rounded border px-1 text-right",
												onChange: (e) => R({
													...L,
													pct: Math.min(40, Math.max(2, Number(e.target.value) || 8))
												})
											}),
											"%"
										]
									})
								]
							}),
							/* @__PURE__ */ (0, v.jsxs)(c, {
								disabled: $,
								onClick: Ie,
								children: [/* @__PURE__ */ (0, v.jsx)(oe, { className: "size-4" }), "Print"]
							}),
							/* @__PURE__ */ (0, v.jsx)(c, {
								variant: "outline",
								title: "One A4 landscape page per bus: the groups on it",
								onClick: () => ke((e) => !e),
								children: "🧳 Luggage sheet"
							}),
							h === "medina" && /* @__PURE__ */ (0, v.jsxs)("label", {
								className: "flex items-center gap-1.5 text-sm",
								title: "Add a ROOM NO column at the end of the summary: print, picture and Excel",
								children: [/* @__PURE__ */ (0, v.jsx)("input", {
									type: "checkbox",
									checked: Me,
									onChange: (e) => {
										Ne(e.target.checked);
										try {
											localStorage.setItem("pms_bus_sum_rooms", e.target.checked ? "1" : "0");
										} catch {}
									}
								}), "Include room numbers"]
							}),
							/* @__PURE__ */ (0, v.jsx)(c, {
								variant: "outline",
								disabled: $ || !q,
								title: "One list of all the chosen trips of the day",
								onClick: Le,
								children: "📋 Print summary"
							}),
							/* @__PURE__ */ (0, v.jsxs)(c, {
								variant: "outline",
								disabled: $ || !q,
								title: "The summary tables as one picture on the clipboard, to paste into a chat",
								onClick: () => void Be(),
								children: [/* @__PURE__ */ (0, v.jsx)(ae, { className: "size-4" }), "Copy summary image"]
							}),
							/* @__PURE__ */ (0, v.jsx)(c, {
								variant: "outline",
								disabled: $ || !H || !!B,
								title: "The chosen bus sheets as an Excel file (one block per bus, a page break after each)",
								onClick: () => void Q("sheets"),
								children: B === "sheets" ? "⏳ Building…" : "📊 Excel: sheets"
							}),
							/* @__PURE__ */ (0, v.jsx)(c, {
								variant: "outline",
								disabled: $ || !H || !!B,
								title: "The print summary as an Excel file",
								onClick: () => void Q("summary"),
								children: B === "summary" ? "⏳ Building…" : "📊 Excel: summary"
							}),
							n.canOpen("tosha") && /* @__PURE__ */ (0, v.jsx)(c, {
								asChild: !0,
								variant: "outline",
								children: /* @__PURE__ */ (0, v.jsx)("a", {
									href: x("tosha"),
									title: "Travel refreshments for tomorrow's and today's buses",
									children: "🥪 Tosha summary"
								})
							})
						]
					})]
				}),
				/* @__PURE__ */ (0, v.jsx)(ie, {
					day: S,
					days: be,
					onChange: (e) => ge("transport-print", { day: e })
				}),
				/* @__PURE__ */ (0, v.jsxs)(l, {
					className: "flex-row flex-wrap items-center gap-x-4 gap-y-2 p-3",
					children: [
						/* @__PURE__ */ (0, v.jsx)("span", {
							className: "font-bold text-primary",
							children: "Destinations"
						}),
						W.map((e) => /* @__PURE__ */ (0, v.jsxs)("label", {
							className: "inline-flex items-center gap-1.5 text-sm font-semibold",
							children: [
								/* @__PURE__ */ (0, v.jsx)(ne, {
									checked: G.includes(e.dest.id),
									onCheckedChange: (t) => Fe(e.dest.id, t === !0)
								}),
								e.dest.title,
								" ",
								/* @__PURE__ */ (0, v.jsxs)("span", {
									className: "font-normal text-muted-foreground",
									children: [
										"(",
										e.buses.length,
										")"
									]
								})
							]
						}, e.dest.id)),
						/* @__PURE__ */ (0, v.jsxs)("label", {
							className: "inline-flex items-center gap-2 text-sm",
							children: ["Only bus no. ", /* @__PURE__ */ (0, v.jsx)(se, {
								className: "h-8 w-28",
								placeholder: "e.g. 3, 5-7",
								inputMode: "numeric",
								value: T,
								onChange: (e) => ve(e.target.value)
							})]
						}),
						/* @__PURE__ */ (0, v.jsxs)("span", {
							className: "text-sm text-muted-foreground",
							children: [
								J.length,
								" sheet",
								J.length === 1 ? "" : "s"
							]
						})
					]
				}),
				Oe && /* @__PURE__ */ (0, v.jsxs)(l, {
					className: "gap-2 p-3",
					children: [
						/* @__PURE__ */ (0, v.jsxs)("div", { children: [
							/* @__PURE__ */ (0, v.jsx)("b", { children: "Luggage sheet" }),
							" ",
							/* @__PURE__ */ (0, v.jsx)("span", {
								className: "text-sm text-muted-foreground",
								children: "— one A4 landscape page per bus. Tick the routes to print."
							})
						] }),
						/* @__PURE__ */ (0, v.jsx)("div", {
							className: "flex flex-wrap gap-x-4 gap-y-2",
							children: Re.length ? Re.map((e) => /* @__PURE__ */ (0, v.jsxs)("label", {
								className: "inline-flex items-center gap-1.5 text-sm font-semibold",
								children: [
									/* @__PURE__ */ (0, v.jsx)(ne, {
										checked: !z.includes(e.dest.id),
										onCheckedChange: (t) => Ae((n) => t === !0 ? n.filter((t) => t !== e.dest.id) : [...n, e.dest.id])
									}),
									e.dest.title,
									" ",
									/* @__PURE__ */ (0, v.jsxs)("span", {
										className: "font-normal text-muted-foreground",
										children: [
											"(",
											e.buses.length,
											")"
										]
									})
								]
							}, e.dest.id)) : /* @__PURE__ */ (0, v.jsx)("span", {
								className: "text-sm text-muted-foreground",
								children: "No buses on this day."
							})
						}),
						/* @__PURE__ */ (0, v.jsxs)("div", {
							className: "flex flex-wrap items-center gap-2",
							children: [/* @__PURE__ */ (0, v.jsx)(c, {
								disabled: !Z,
								onClick: ze,
								children: "🖨️ Print luggage sheets"
							}), /* @__PURE__ */ (0, v.jsxs)("span", {
								className: "text-sm text-muted-foreground",
								children: [
									Z,
									" page",
									Z === 1 ? "" : "s"
								]
							})]
						})
					]
				}),
				k && /* @__PURE__ */ (0, v.jsx)("div", {
					className: "rounded-md border border-ok/40 bg-ok-soft px-3 py-2 text-sm text-ok",
					children: k
				}),
				D && /* @__PURE__ */ (0, v.jsx)("div", {
					className: "rounded-md border border-destructive bg-destructive/10 px-3 py-2 text-sm text-destructive",
					children: D
				})
			]
		}),
		/* @__PURE__ */ (0, v.jsx)("div", {
			ref: U,
			className: `tq-sheets${F}`,
			dangerouslySetInnerHTML: { __html: Y }
		})
	] });
}
export { x as default };
