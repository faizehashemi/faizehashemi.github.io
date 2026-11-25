import { a as e, f as t, h as n, i as r, n as i, o as a, p as o, u as s } from "./PmsContext-BVMd13Oi.js";
import { t as c } from "./useQuery-BUXPY6q6.js";
import { a as l, n as u, o as d, r as f, t as ee } from "./dialog-DtgtvZ4Q.js";
import { t as p } from "./label-CMEyi--P.js";
import { t as te } from "./download-DbAPjole.js";
import { t as m } from "./button-BGWa3SLr.js";
import { t as h } from "./input-DSBk_UeU.js";
import { t as ne } from "./useSlips-DUKbzGma.js";
import { t as re } from "./occupancy-BhwLIHY6.js";
// src/pages/reports/reports.ts
var g = /* @__PURE__ */ n(o(), 1), _ = (e) => String(e).padStart(2, "0"), v = (e) => `${e.getFullYear()}-${_(e.getMonth() + 1)}-${_(e.getDate())}`, y = (e, t) => {
	let n = /* @__PURE__ */ new Date(`${e}T12:00`);
	return n.setDate(n.getDate() + t), v(n);
};
function b(e, t) {
	let n = [];
	for (let r = e; r <= t && n.length < 400; r = y(r, 1)) n.push(r);
	return n;
}
var x = (e) => (/* @__PURE__ */ new Date(`${e}T12:00`)).toLocaleDateString("en-GB", {
	weekday: "short",
	day: "2-digit",
	month: "short"
}), S = (e) => (/* @__PURE__ */ new Date(`${e}T12:00`)).toLocaleDateString("en-GB", {
	day: "numeric",
	month: "long",
	year: "numeric"
}), C = (e) => String(e ?? "").replace(/[&<>"']/g, (e) => ({
	"&": "&amp;",
	"<": "&lt;",
	">": "&gt;",
	"\"": "&quot;",
	"'": "&#39;"
})[e]), w = (e) => Number.isFinite(e) ? Math.round(e).toLocaleString("en-US") : "—", T = (e) => Number.isFinite(e) ? (Math.round(e * 10) / 10).toLocaleString("en-US") : "—", E = (e) => e.reduce((e, t) => e + (Number(t) || 0), 0), D = (e) => {
	let t = e.filter((e) => Number(e) > 0);
	return t.length ? E(t) / t.length : 0;
}, O = [
	{
		id: "mawaid",
		icon: "🍽️",
		title: "Mawaid stats",
		blurb: "Breakfast, lunch and dinner — thals and pax for every day",
		hue: "#b45309",
		maxDays: 62
	},
	{
		id: "occupancy",
		icon: "🏨",
		title: "Occupancy & vacancy",
		blurb: "Beds in use and beds free, per night and per building",
		hue: "#0f766e",
		maxDays: 62
	},
	{
		id: "transport",
		icon: "🚌",
		title: "Transport",
		blurb: "Groups, guests and vehicles by day and by destination",
		hue: "#1d4ed8",
		maxDays: 62
	},
	{
		id: "website",
		icon: "🌐",
		title: "Website stats",
		blurb: "Page visits, speed, errors and desk feedback",
		hue: "#7c3aed"
	},
	{
		id: "softdev",
		icon: "🛠️",
		title: "Software development",
		blurb: "What was built and shipped, from the change log",
		hue: "#be123c"
	},
	{
		id: "kg",
		icon: "🕋",
		title: "Fakkul Ehraam KG stats",
		blurb: "FE1, FE2 and Atraaf duties per person and per day",
		hue: "#065f46"
	},
	{
		id: "laundry",
		icon: "🧺",
		title: "Laundry stats",
		blurb: "Bills, pieces, cash, staff laundry and building linen",
		hue: "#0e7490"
	},
	{
		id: "lost",
		icon: "🧳",
		title: "Lost & Found",
		blurb: "Items found in rooms, with photos — pending, handed over and returned",
		hue: "#a16207"
	}
];
function k(e, t) {
	let n = Math.max(1, ...e.map((e) => e.value));
	return `<table class="bars">${e.map((e) => `<tr><th>${C(e.label)}</th><td><span class="bar" style="width:${Math.max(.5, e.value / n * 100).toFixed(1)}%;background:${t}"></span></td><td class="v">${C(e.text ?? w(e.value))}</td></tr>`).join("")}</table>`;
}
function A(e, t, n, r, i) {
	let a = Math.max(1, ...e.map((e, n) => (t[n] || 0) + (r && r[n] || 0)));
	return `<div class="cols ${e.length > 40 ? "thin" : e.length > 20 ? "mid" : ""}">${e.map((e, i) => {
		let o = (t[i] || 0) / a * 100, s = r ? (r[i] || 0) / a * 100 : 0;
		return `<div class="col" title="${C(x(e))}"><div class="stack">${r ? `<span style="height:${s}%;background:${n}33"></span>` : ""}<span style="height:${o}%;background:${n}"></span></div><small>${e.slice(8)}</small></div>`;
	}).join("")}</div>${i ? `<p class="legend"><i style="background:${n}"></i>${C(i[0])}${r && i[1] ? ` <i style="background:${n}33"></i>${C(i[1])}` : ""}</p>` : ""}`;
}
function j(e, t, n, r = 1) {
	let i = (e, t, n = "td") => `<${n}${t >= r ? " class=\"n\"" : ""}>${typeof e == "number" ? w(e) : e}</${n}>`;
	return `<table class="grid"><thead><tr>${e.map((e, t) => i(C(e), t, "th")).join("")}</tr></thead><tbody>${t.map((e) => `<tr>${e.map((e, t) => i(e, t)).join("")}</tr>`).join("")}</tbody>${n ? `<tfoot><tr>${n.map((e, t) => i(e, t)).join("")}</tr></tfoot>` : ""}</table>`;
}
function ie(e) {
	let t = (/* @__PURE__ */ new Date()).toLocaleString("en-GB", {
		day: "numeric",
		month: "long",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit"
	}), n = e.from === e.to ? S(e.from) : `${S(e.from)} — ${S(e.to)}`;
	return `<!doctype html><html><head><meta charset="utf-8"><title>${C(e.title)} · ${C(e.site)} · ${e.from}${e.to === e.from ? "" : " to " + e.to}</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,700;9..144,900&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
@page { size: A4 portrait; margin: 12mm 12mm 14mm; }
* { box-sizing: border-box; }
html, body { margin: 0; background: #f3efe6; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
body { font: 10pt/1.45 Inter, "Segoe UI", Arial, sans-serif; color: #1c1917; }
.page { max-width: 186mm; margin: 0 auto; background: #fffdf8; }
@media screen { .page { margin: 16px auto; box-shadow: 0 10px 40px #0002; padding: 0 0 10mm; } }
.cover { position: relative; color: #fff; padding: 13mm 12mm 11mm; background: radial-gradient(120% 140% at 100% 0%, ${e.hue} 0%, #0b1020 62%); overflow: hidden; }
.cover::after { content: ""; position: absolute; inset: auto -20mm -28mm auto; width: 90mm; height: 90mm; border-radius: 50%; border: 1px solid #ffffff2a; box-shadow: 0 0 0 8mm #ffffff08, 0 0 0 16mm #ffffff06; }
.eyebrow { font: 600 8pt Inter, sans-serif; letter-spacing: .32em; text-transform: uppercase; color: #f5d78e; }
.cover h1 { font: 900 30pt/1.02 Fraunces, Georgia, serif; margin: 3mm 0 2mm; letter-spacing: -.01em; }
.cover h1 .ic { font-size: 24pt; margin-right: 3mm; }
.cover .period { font: 500 12pt Fraunces, Georgia, serif; color: #fde7b0; }
.cover .rule { height: 2px; width: 46mm; margin: 5mm 0 0; background: linear-gradient(90deg, #f5d78e, transparent); }
.body { padding: 0 12mm; }
.kpis { display: grid; grid-template-columns: repeat(${Math.min(4, Math.max(1, e.kpis.length))}, 1fr); gap: 3mm; margin: -7mm 0 6mm; position: relative; z-index: 1; }
.kpi { background: #fff; border-radius: 3mm; padding: 3.5mm 4mm; box-shadow: 0 2mm 6mm #0b10201f; border-top: 1.2mm solid ${e.hue}; break-inside: avoid; }
.kpi b { display: block; font: 800 19pt/1.1 Fraunces, Georgia, serif; color: #0b1020; }
.kpi span { display: block; font: 600 7.5pt Inter, sans-serif; letter-spacing: .12em; text-transform: uppercase; color: #78716c; margin-top: 1mm; }
.kpi small { display: block; color: ${e.hue}; font-weight: 600; margin-top: .6mm; }
h2 { font: 800 14pt Fraunces, Georgia, serif; color: #0b1020; margin: 7mm 0 1mm; display: flex; align-items: center; gap: 3mm; break-after: avoid; }
h2::before { content: ""; width: 2.2mm; height: 6mm; border-radius: 1mm; background: ${e.hue}; }
.note { color: #78716c; margin: 0 0 2.5mm; font-size: 8.5pt; }
section { break-inside: auto; }
table.grid { width: 100%; border-collapse: collapse; font-size: 8.8pt; margin: 2mm 0; }
table.grid th { text-align: left; font: 700 7.5pt Inter, sans-serif; letter-spacing: .08em; text-transform: uppercase; color: #fff; background: #0b1020; padding: 2mm 2.4mm; }
table.grid td { padding: 1.6mm 2.4mm; border-bottom: 1px solid #e7e0d2; }
table.grid tbody tr:nth-child(even) td { background: #faf6ee; }
table.grid tfoot td { font-weight: 800; border-top: 2px solid #0b1020; border-bottom: 0; background: #f5ecd7; }
table.grid .n { text-align: right; font-variant-numeric: tabular-nums; }
table.grid tr { break-inside: avoid; }
table.bars { width: 100%; border-collapse: collapse; margin: 2mm 0; font-size: 8.8pt; }
table.bars th { text-align: left; font-weight: 600; width: 34%; padding: 1.2mm 2mm 1.2mm 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 60mm; }
table.bars td { padding: 1.2mm 0; } table.bars td.v { width: 18%; text-align: right; font-weight: 700; font-variant-numeric: tabular-nums; padding-left: 2mm; }
.bar { display: block; height: 3.6mm; border-radius: 0 2mm 2mm 0; }
.cols { display: flex; align-items: flex-end; gap: 1mm; height: 38mm; padding: 2mm 0 0; border-bottom: 1px solid #d6cdb9; margin: 2mm 0 0; }
.col { flex: 1; display: flex; flex-direction: column; align-items: center; height: 100%; min-width: 0; }
.col .stack { flex: 1; width: 100%; display: flex; flex-direction: column-reverse; justify-content: flex-start; }
.col .stack span { display: block; width: 100%; border-radius: .8mm .8mm 0 0; }
.col small { font-size: 6pt; color: #78716c; margin-top: .8mm; }
.cols.mid small { font-size: 5pt; } .cols.thin small { display: none; } .cols.thin { gap: .4mm; }
.legend { font-size: 7.5pt; color: #57534e; margin: 1.5mm 0 0; } .legend i { display: inline-block; width: 3mm; height: 3mm; border-radius: .6mm; margin: 0 1mm -0.4mm 3mm; } .legend i:first-child { margin-left: 0; }
.two { display: grid; grid-template-columns: 1fr 1fr; gap: 6mm; } .two > div { min-width: 0; }
.empty { margin: 10mm 0; padding: 8mm; text-align: center; border: 1px dashed #c9bfa8; border-radius: 3mm; color: #78716c; font: 500 12pt Fraunces, Georgia, serif; }
.foot { margin: 9mm 12mm 0; padding-top: 3mm; border-top: 1px solid #e7e0d2; display: flex; justify-content: space-between; font-size: 7.5pt; color: #a8a29e; letter-spacing: .06em; }
.pill { display: inline-block; padding: .3mm 2mm; border-radius: 9mm; background: ${e.hue}1f; color: ${e.hue}; font-weight: 700; font-size: 7.5pt; }
</style></head><body><div class="page">
<header class="cover"><div class="eyebrow">Faiz e Hashemi · ${C(e.site)} · Report</div><h1><span class="ic">${e.icon}</span>${C(e.title)}</h1><div class="period">${C(n)}</div><div class="rule"></div></header>
<div class="body">
${e.kpis.length ? `<div class="kpis">${e.kpis.map((e) => `<div class="kpi"><b>${C(e.value)}</b><span>${C(e.label)}</span>${e.sub ? `<small>${C(e.sub)}</small>` : ""}</div>`).join("")}</div>` : "<div style=\"height:6mm\"></div>"}
${e.empty ? `<div class="empty">${C(e.empty)}</div>` : e.sections.map((e) => `<section><h2>${C(e.title)}</h2>${e.note ? `<p class="note">${C(e.note)}</p>` : ""}${e.html}</section>`).join("")}
</div>
<div class="foot"><span>PMS · ${C(e.site)}</span><span>Prepared ${C(t)}</span></div>
</div></body></html>`;
}
var M = (e, t) => {
	let n = O.find((t) => t.id === e);
	return {
		id: e,
		title: n.title,
		icon: n.icon,
		hue: n.hue,
		site: t.site,
		from: t.from,
		to: t.to
	};
}, N = (e, t) => {
	let n = -1;
	return t.forEach((e, r) => {
		(n < 0 || e > t[n]) && (n = r);
	}), n >= 0 && t[n] > 0 ? `peak ${w(t[n])} · ${x(e[n])}` : void 0;
};
function ae(e, t, n) {
	let r = t.map((e, t) => ({
		day: e,
		m: n[t]
	})).filter((e) => e.m), i = (e) => r.map((t) => t.m[e]), a = (e) => r.map((t) => t.m.pax[e]), o = r.map((e) => e.m.breakfast + e.m.lunch + e.m.dinner), s = r.map((e) => e.m.pax.breakfast + e.m.pax.lunch + e.m.pax.dinner);
	if (!r.length || !E(s)) return {
		...M("mawaid", e),
		kpis: [],
		sections: [],
		empty: "No guests in house for meals in these dates."
	};
	let c = M("mawaid", e).hue;
	return {
		...M("mawaid", e),
		kpis: [
			{
				label: "Meals served (pax)",
				value: w(E(s)),
				sub: N(r.map((e) => e.day), s)
			},
			{
				label: "Thals in all",
				value: w(E(o))
			},
			{
				label: "Average lunch pax",
				value: w(D(a("lunch")))
			},
			{
				label: "Average dinner pax",
				value: w(D(a("dinner")))
			}
		],
		sections: [
			{
				title: "Pax per day",
				note: "Lunch (dark) and dinner (light) — the guests in house in each meal window.",
				html: A(r.map((e) => e.day), a("lunch"), c, a("dinner"), ["Lunch", "Dinner"])
			},
			{
				title: "By meal",
				html: k([
					{
						label: "Breakfast",
						value: E(a("breakfast"))
					},
					{
						label: "Lunch",
						value: E(a("lunch"))
					},
					{
						label: "Dinner",
						value: E(a("dinner"))
					}
				].map((e) => ({
					...e,
					text: `${w(e.value)} pax`
				})), c)
			},
			{
				title: "Day by day",
				html: j([
					"Day",
					"Breakfast pax",
					"thals",
					"Lunch pax",
					"thals",
					"Dinner pax",
					"thals"
				], r.map((e) => [
					x(e.day),
					e.m.pax.breakfast,
					e.m.breakfast,
					e.m.pax.lunch,
					e.m.lunch,
					e.m.pax.dinner,
					e.m.dinner
				]), [
					"Total",
					E(a("breakfast")),
					E(i("breakfast")),
					E(a("lunch")),
					E(i("lunch")),
					E(a("dinner")),
					E(i("dinner"))
				])
			}
		]
	};
}
function P(e, t) {
	let n = t.total.capN, r = t.total.used, i = n.map((e, t) => Math.max(0, e - (r[t] || 0))), a = E(n), o = E(r.map((e, t) => Math.min(e, n[t] || e)));
	if (!a) return {
		...M("occupancy", e),
		kpis: [],
		sections: [],
		empty: "No rooms in service in these dates."
	};
	let s = M("occupancy", e).hue, c = (e, t) => t ? `${T(100 * e / t)}%` : "—", l = t.blds.map((e) => ({
		name: e.name,
		cap: E(e.capN),
		used: E(e.used.map((t, n) => Math.min(t, e.capN[n] || t)))
	})).filter((e) => e.cap);
	return {
		...M("occupancy", e),
		kpis: [
			{
				label: "Occupancy",
				value: c(o, a),
				sub: `${w(o)} of ${w(a)} bed-nights`
			},
			{
				label: "Vacant bed-nights",
				value: w(a - o)
			},
			{
				label: "Average guests / night",
				value: w(D(r)),
				sub: N(t.days, r)
			},
			{
				label: "Beds in service",
				value: w(Math.max(...n))
			}
		],
		sections: [
			{
				title: "Beds per night",
				note: "In use (dark) and free (light).",
				html: A(t.days, r.map((e, t) => Math.min(e, n[t] || e)), s, i, ["In use", "Free"])
			},
			{
				title: "By building",
				html: k(l.map((e) => ({
					label: e.name,
					value: e.cap ? 100 * e.used / e.cap : 0,
					text: c(e.used, e.cap)
				})), s) + j([
					"Building",
					"Bed-nights",
					"In use",
					"Vacant",
					"Occupancy"
				], l.map((e) => [
					C(e.name),
					e.cap,
					e.used,
					e.cap - e.used,
					c(e.used, e.cap)
				]), [
					"All",
					a,
					o,
					a - o,
					c(o, a)
				])
			},
			{
				title: "Night by night",
				html: j([
					"Night",
					"Beds",
					"In use",
					"Free",
					"Rooms used",
					"Occupancy"
				], t.days.map((e, a) => [
					x(e),
					n[a] || 0,
					r[a] || 0,
					i[a],
					t.total.roomsUsed[a] || 0,
					c(r[a] || 0, n[a] || 0)
				]))
			}
		]
	};
}
function F(e, t, n) {
	let r = M("transport", e).hue, i = t.map(({ day: e, rows: t, ride: r }) => {
		let i = /* @__PURE__ */ new Set(), a = /* @__PURE__ */ new Map();
		for (let e of t) {
			let t = r.get(e.key), o = n(String(t?.route || e.route || "")) || "Other", s = String(t?.parent?.key ?? e.key);
			i.add(s);
			let c = a.get(o) || {
				g: 0,
				pax: 0,
				veh: /* @__PURE__ */ new Set()
			};
			c.g++, c.pax += Number(e.pax) || 0, c.veh.add(s), a.set(o, c);
		}
		return {
			day: e,
			groups: t.length,
			pax: E(t.map((e) => Number(e.pax) || 0)),
			veh: i.size,
			byDest: a
		};
	});
	if (!i.some((e) => e.groups)) return {
		...M("transport", e),
		kpis: [],
		sections: [],
		empty: "No transport saved in these dates."
	};
	let a = /* @__PURE__ */ new Map();
	for (let e of i) for (let [t, n] of e.byDest) {
		let e = a.get(t) || {
			g: 0,
			pax: 0,
			veh: 0
		};
		e.g += n.g, e.pax += n.pax, e.veh += n.veh.size, a.set(t, e);
	}
	let o = [...a].sort((e, t) => t[1].pax - e[1].pax);
	return {
		...M("transport", e),
		kpis: [
			{
				label: "Guests moved",
				value: w(E(i.map((e) => e.pax))),
				sub: N(i.map((e) => e.day), i.map((e) => e.pax))
			},
			{
				label: "Group trips",
				value: w(E(i.map((e) => e.groups)))
			},
			{
				label: "Vehicles",
				value: w(E(i.map((e) => e.veh)))
			},
			{
				label: "Destinations",
				value: w(a.size)
			}
		],
		sections: [
			{
				title: "Guests per day",
				html: A(i.map((e) => e.day), i.map((e) => e.pax), r, void 0, ["Guests"])
			},
			{
				title: "By destination",
				html: k(o.map(([e, t]) => ({
					label: e,
					value: t.pax,
					text: `${w(t.pax)} pax`
				})), r) + j([
					"Destination",
					"Group trips",
					"Guests",
					"Vehicles"
				], o.map(([e, t]) => [
					C(e),
					t.g,
					t.pax,
					t.veh
				]), [
					"All",
					E(o.map((e) => e[1].g)),
					E(o.map((e) => e[1].pax)),
					E(o.map((e) => e[1].veh))
				])
			},
			{
				title: "Day by day",
				html: j([
					"Day",
					"Group trips",
					"Guests",
					"Vehicles",
					"Destinations"
				], i.filter((e) => e.groups).map((e) => [
					x(e.day),
					e.groups,
					e.pax,
					e.veh,
					C([...e.byDest.keys()].join(", "))
				]))
			}
		]
	};
}
function I(e, t) {
	let n = M("website", e).hue, r = (t.day || []).filter((t) => t.key >= e.from && t.key <= e.to), i = E(r.map((e) => e.n));
	if (!i) return {
		...M("website", e),
		kpis: [],
		sections: [],
		empty: "No page visits recorded in these dates (the site keeps 90 days)."
	};
	let a = (e) => e == null ? "—" : `${w(Number(e))} ms`, o = (t.pages || []).slice(0, 15);
	return {
		...M("website", e),
		kpis: [
			{
				label: "Page visits",
				value: w(i),
				sub: N(r.map((e) => e.key), r.map((e) => e.n))
			},
			{
				label: "Typical page time",
				value: a(t.totals?.p50),
				sub: `slowest 5%: ${a(t.totals?.p95)}`
			},
			{
				label: "Desks using it",
				value: w(t.totals?.desks ?? 0)
			},
			{
				label: "Feedback",
				value: t.totals?.stars == null ? "—" : `${T(t.totals.stars)} ★`,
				sub: `${w(t.totals?.feedback ?? 0)} ratings`
			}
		],
		sections: [
			{
				title: "Visits per day",
				html: A(r.map((e) => e.key), r.map((e) => e.n), n, void 0, ["Page visits"])
			},
			{
				title: "Most used pages",
				note: `Since ${S(String(t.since || "").slice(0, 10) || e.from)}.`,
				html: j([
					"Page",
					"Visits",
					"Typical",
					"Slowest 5%",
					"Errors",
					"Stars"
				], o.map((e) => [
					C(e.key),
					e.n,
					a(e.p50),
					a(e.p95),
					e.errors || 0,
					e.stars == null ? "—" : `${T(e.stars)} ★`
				]))
			},
			{
				title: "Speed",
				html: j(["Measure", "Value"], [
					["Server first byte (median)", a(t.vitals?.ttfb)],
					["Page ready (median)", a(t.vitals?.dom_ready)],
					["Largest paint (median)", a(t.vitals?.lcp)],
					["Response to taps (75%)", a(t.vitals?.inp)],
					["Errors recorded", w(t.totals?.errors ?? 0)]
				])
			},
			{
				title: "Devices & browsers",
				html: `<div class="two"><div>${k((t.device || []).slice(0, 6).map((e) => ({
					label: e.key || "—",
					value: e.n
				})), n)}</div><div>${k((t.browser || []).slice(0, 6).map((e) => ({
					label: e.key || "—",
					value: e.n
				})), n)}</div></div>`
			}
		]
	};
}
function L(e, t) {
	let n = M("softdev", e).hue, r = t.CHANGES.filter((t) => t.d >= e.from && t.d <= e.to);
	if (!r.length) return {
		...M("softdev", e),
		kpis: [],
		sections: [],
		empty: "No changes in the change log for these dates."
	};
	let i = b(e.from, e.to), a = i.map((e) => r.filter((t) => t.d === e).length), o = /* @__PURE__ */ new Map();
	for (let e of r) o.set(e.f, (o.get(e.f) || 0) + 1);
	let s = [...o].sort((e, t) => t[1] - e[1]), c = (t.DEPLOYS || []).filter((t) => String(t.at).slice(0, 10) >= e.from && String(t.at).slice(0, 10) <= e.to), l = (e) => t.FEATURES[e] || e || "General";
	return {
		...M("softdev", e),
		kpis: [
			{
				label: "Changes shipped",
				value: w(r.length),
				sub: N(i, a)
			},
			{
				label: "Areas improved",
				value: w(o.size)
			},
			{
				label: "Active days",
				value: w(a.filter(Boolean).length),
				sub: `of ${i.length}`
			},
			...c.length ? [{
				label: "Deploys logged",
				value: w(c.length)
			}] : [{
				label: "Per active day",
				value: T(r.length / Math.max(1, a.filter(Boolean).length))
			}]
		],
		sections: [
			{
				title: "Changes per day",
				html: A(i, a, n, void 0, ["Changes"])
			},
			{
				title: "By area",
				html: k(s.slice(0, 16).map(([e, t]) => ({
					label: l(e),
					value: t
				})), n)
			},
			{
				title: "Every change",
				html: j([
					"Date",
					"Area",
					"What changed"
				], [...r].sort((e, t) => t.d.localeCompare(e.d)).map((e) => [
					x(e.d),
					`<span class="pill">${C(l(e.f))}</span>`,
					C(e.m)
				]), void 0, 99)
			}
		]
	};
}
function R(e, t) {
	let n = M("kg", e).hue, r = (e) => v(new Date(e)), i = (t.log || []).filter((t) => {
		let n = r(t.ts);
		return n >= e.from && n <= e.to;
	});
	if (!i.length) return {
		...M("kg", e),
		kpis: [],
		sections: [],
		empty: "No KG duties recorded in these dates."
	};
	let a = [
		"FE1",
		"FE2",
		"Atraaf"
	], o = (e) => i.filter((t) => t.type === e).length, s = /* @__PURE__ */ new Map();
	for (let e of i) {
		let t = s.get(e.person) || {
			FE1: 0,
			FE2: 0,
			Atraaf: 0,
			total: 0
		};
		t[e.type] = (t[e.type] || 0) + 1, t.total++, s.set(e.person, t);
	}
	let c = [...s].sort((e, t) => t[1].total - e[1].total || e[0].localeCompare(t[0])), l = b(e.from, e.to), u = l.map((e) => i.filter((t) => r(t.ts) === e).length), d = (t.people || []).filter((e) => !s.has(e));
	return {
		...M("kg", e),
		kpis: [{
			label: "Duties done",
			value: w(i.length),
			sub: N(l, u)
		}, ...a.map((e) => ({
			label: e,
			value: w(o(e))
		}))],
		sections: [
			{
				title: "Duties per day",
				html: A(l, u, n, void 0, ["Duties"])
			},
			{
				title: "Who served most",
				html: k(c.slice(0, 15).map(([e, t]) => ({
					label: e,
					value: t.total
				})), n)
			},
			{
				title: "Every person",
				html: j([
					"Name",
					"FE1",
					"FE2",
					"Atraaf",
					"Total"
				], c.map(([e, t]) => [
					C(e),
					t.FE1,
					t.FE2,
					t.Atraaf,
					t.total
				]), [
					"All",
					o("FE1"),
					o("FE2"),
					o("Atraaf"),
					i.length
				])
			},
			...d.length ? [{
				title: "No duty in these dates",
				html: `<p>${d.map(C).join(" · ")}</p>`
			}] : []
		]
	};
}
function z(e, t) {
	let n = M("laundry", e).hue, r = (e) => (e / 100).toLocaleString("en-US", {
		minimumFractionDigits: 0,
		maximumFractionDigits: 2
	}), i = t.filter((e) => !e.voided), a = i.filter((e) => e.kind === "paid"), o = i.filter((e) => e.kind === "free"), s = i.filter((e) => e.kind === "building");
	if (!i.length) return {
		...M("laundry", e),
		kpis: [],
		sections: [],
		empty: "No laundry in these dates."
	};
	let c = b(e.from, e.to), l = (e) => E(e.map((e) => e.items)), u = /* @__PURE__ */ new Map();
	for (let e of i) for (let t of e.lines || []) u.set(t.name, (u.get(t.name) || 0) + t.qty);
	let d = [...u].sort((e, t) => t[1] - e[1]), f = a.filter((e) => !e.settled_at);
	return {
		...M("laundry", e),
		kpis: [
			{
				label: "Pieces washed",
				value: w(l(i)),
				sub: N(c, c.map((e) => l(i.filter((t) => t.day === e))))
			},
			{
				label: "Cash SAR",
				value: r(E(a.map((e) => e.paid))),
				sub: `${w(a.length)} bills`
			},
			{
				label: "Staff laundry pieces",
				value: w(l(o)),
				sub: `${w(o.length)} times`
			},
			{
				label: "Building linen",
				value: w(l(s)),
				sub: "pieces"
			}
		],
		sections: [
			{
				title: "Pieces per day",
				note: "Paid laundry (dark) and staff + building linen (light).",
				html: A(c, c.map((e) => l(a.filter((t) => t.day === e))), n, c.map((e) => l([...o, ...s].filter((t) => t.day === e))), ["Paid", "Staff & building"])
			},
			{
				title: "Most washed",
				html: k(d.slice(0, 14).map(([e, t]) => ({
					label: e,
					value: t
				})), n)
			},
			{
				title: "Cash",
				html: j([
					"",
					"Bills",
					"Pieces",
					"SAR"
				], [[
					"Paid (handed over)",
					a.length - f.length,
					l(a.filter((e) => e.settled_at)),
					r(E(a.filter((e) => e.settled_at).map((e) => e.paid)))
				], [
					"Unpaid",
					f.length,
					l(f),
					r(E(f.map((e) => e.paid)))
				]], [
					"All cash",
					a.length,
					l(a),
					r(E(a.map((e) => e.paid)))
				])
			},
			{
				title: "Day by day",
				html: j([
					"Day",
					"Cash bills",
					"Cash SAR",
					"Paid pieces",
					"Staff pieces",
					"Linen pieces"
				], c.filter((e) => i.some((t) => t.day === e)).map((e) => {
					let t = a.filter((t) => t.day === e);
					return [
						x(e),
						t.length,
						r(E(t.map((e) => e.paid))),
						l(t),
						l(o.filter((t) => t.day === e)),
						l(s.filter((t) => t.day === e))
					];
				}))
			}
		]
	};
}
function B(e, t) {
	let n = M("lost", e).hue, r = t.filter((t) => {
		let n = String(t.found_at || "").slice(0, 10);
		return n >= e.from && n <= e.to;
	}).sort((e, t) => String(e.found_at).localeCompare(String(t.found_at)));
	if (!r.length) return {
		...M("lost", e),
		kpis: [],
		sections: [],
		empty: "No items found in these dates."
	};
	let i = (e) => r.filter((t) => t.status === e).length, a = b(e.from, e.to), o = a.map((e) => r.filter((t) => String(t.found_at).slice(0, 10) === e).length), s = /* @__PURE__ */ new Map();
	for (let e of r) {
		let t = e.place === "bus" ? "Buses" : e.place === "other" ? "Other places" : e.building || "—";
		s.set(t, (s.get(t) || 0) + 1);
	}
	let c = {
		found: "Found · awaiting collection",
		handed: "Handed over · in custody",
		returned: "Returned to guest"
	}, l = (e) => {
		let t = [...e.history || []].reverse().find((e) => e.action === "returned" || e.action === "handed");
		return t ? `${t.action === "returned" ? "to " : "with "}${t.to}` : e.custodian ? `with ${e.custodian}` : "";
	}, u = (e) => new Date(e).toLocaleString("en-GB", {
		day: "2-digit",
		month: "short",
		hour: "2-digit",
		minute: "2-digit"
	}), d = (e) => e.thumb ? `<img src="${C(e.thumb)}" alt="" style="width:14mm;height:14mm;object-fit:cover;border-radius:2mm;display:block">` : "<span style=\"display:grid;place-items:center;width:14mm;height:14mm;border-radius:2mm;background:#f1ebe0\">📦</span>", f = (e) => `<span class="pill" style="${e === "returned" ? "background:#0a7a3a1f;color:#0a7a3a" : e === "handed" ? "background:#0369a11f;color:#0369a1" : ""}">${C(c[e] || e)}</span>`;
	return {
		...M("lost", e),
		kpis: [
			{
				label: "Items found",
				value: w(r.length),
				sub: N(a, o)
			},
			{
				label: "Pending",
				value: w(i("found"))
			},
			{
				label: "Handed over",
				value: w(i("handed"))
			},
			{
				label: "Returned to guests",
				value: w(i("returned")),
				sub: r.length ? `${T(100 * i("returned") / r.length)}% of items` : void 0
			}
		],
		sections: [
			{
				title: "Items found per day",
				html: A(a, o, n, void 0, ["Items"])
			},
			{
				title: "Where they were found",
				html: k([...s].sort((e, t) => t[1] - e[1]).map(([e, t]) => ({
					label: e,
					value: t
				})), n)
			},
			{
				title: "Every item",
				html: j([
					"",
					"Ref",
					"Found",
					"Where",
					"Item",
					"Status",
					"Now"
				], r.map((e) => [
					d(e),
					`<span style="font-family:Consolas,monospace;font-size:8pt">${C(e.ref)}</span>`,
					C(u(e.found_at)),
					C(e.place === "bus" ? `${/^bus/i.test(e.spot) ? "" : "Bus "}${e.spot}` : e.place === "other" ? e.spot : `${e.room}${e.building ? " · " + e.building : ""}`),
					`<b>${C(e.item)}</b>${e.found_by ? `<br><small style="color:#78716c">found by ${C(e.found_by)}</small>` : ""}`,
					f(e.status),
					C(l(e))
				]), void 0, 99)
			}
		]
	};
}
// src/pages/reports/ReportsPage.tsx
var V = t();
function H() {
	let { rooms: t, stay: n, cloud: o, transport: _ } = i(), x = r(), S = a(), C = e(), { site: w, siteId: T } = s(), E = ne(), D = c({
		queryKey: ["buildings-force", T],
		queryFn: async () => t.buildingsOfSite(await x(t.loadBuildings({ force: !0 })), T)
	}), k = v(/* @__PURE__ */ new Date()), [A, j] = (0, g.useState)(null), [M, N] = (0, g.useState)(k.slice(0, 8) + "01"), [H, U] = (0, g.useState)(k), [W, G] = (0, g.useState)(""), [K, q] = (0, g.useState)(""), J = O.find((e) => e.id === A), Y = b(M, H).length, X = !!J?.maxDays && Y > J.maxDays;
	async function oe(e, r, i) {
		let a = {
			site: w.label,
			from: r,
			to: i
		}, s = b(r, i);
		if (e === "mawaid") {
			let e = await S("meals"), t = E.data ?? [], n = {
				...e.MEAL_DEFAULTS,
				incChildren: T === "medina"
			};
			return ae(a, s, s.map((r) => e.mealThalsFor(t, r, n)));
		}
		if (e === "occupancy") {
			let e = (D.data ?? []).map((e) => ({
				name: e.name,
				rooms: e.rooms.filter((e) => e.active !== !1 && Number(e.capacity) > 0).map((e) => ({
					...e,
					until: t.handedAt(e) ?? void 0
				}))
			})).filter((e) => e.rooms.length);
			return P(a, re(E.data ?? [], e, {
				from: r,
				to: i,
				perRoom: !1
			}, n, t));
		}
		if (e === "transport") {
			let e = new Set((await x(_.listDays(T))).map((e) => typeof e == "string" ? e : e.day)), t = s.filter((t) => e.has(t)), n = await Promise.all(t.map((e) => _.loadDay(T, e).then((e) => e.rows || [], () => []))), r = _.DESTS_BY_SITE?.[T] || [], i = (e) => String(e || "").toUpperCase().replace(/\s+/g, " ").trim();
			return F(a, t.map((e, t) => ({
				day: e,
				rows: n[t],
				ride: _.resolve(n[t])
			})), (e) => r.find((t) => i(t.route) === i(e))?.title || (e ? i(e).split("-").slice(1).join("-").toLowerCase().replace(/\b\w/g, (e) => e.toUpperCase()) : ""));
		}
		if (e === "website") {
			let e = Math.min(90, Math.max(1, b(r, k).length));
			return I(a, await x(o.request("GET", `/api/perf/summary?days=${e}&site=${T}`)));
		}
		if (e === "softdev") return L(a, await C("views/changelog/data.js"));
		if (e === "lost") return B(a, (await x(o.request("GET", `/api/lost?site=${T}`))).items || []);
		if (e === "kg") return R(a, await x(o.request("GET", `/api/kg?site=${T}`)));
		let { bills: c } = await x(o.request("GET", `/api/laundry/bills?site=${T}&from=${r}&to=${i}&all=1`));
		return z(a, c);
	}
	async function se() {
		if (!J) return;
		let [e, t] = M <= H ? [M, H] : [H, M], n = window.open("", "_blank");
		if (!n) q("The browser blocked the new tab. Allow pop-ups for this site, then try again.");
		else {
			n.document.write("<p style=\"font:16px system-ui;padding:24px\">Preparing the report…</p>"), G(J.id), q("");
			try {
				let r = ie(await oe(J.id, e, t));
				n.document.open(), n.document.write(r.replace("</body>", "<script>(async function(){try{await document.fonts.ready}catch(e){}setTimeout(function(){window.focus();window.print()},400)})()<\/script></body>")), n.document.close(), j(null);
			} catch (e) {
				n.close(), q(e?.message || String(e));
			} finally {
				G("");
			}
		}
	}
	let Z = (e, t) => {
		N(e), U(t);
	}, Q = k.slice(0, 8) + "01", $ = y(Q, -1);
	return /* @__PURE__ */ (0, V.jsxs)("div", {
		className: "mx-auto grid max-w-[1500px] gap-5 px-3 pb-12 pt-4 sm:px-5",
		children: [
			/* @__PURE__ */ (0, V.jsxs)("header", {
				className: "relative overflow-hidden rounded-3xl bg-[radial-gradient(120%_140%_at_100%_0%,#7c5a1c_0%,#0b1020_60%)] px-6 py-8 text-white shadow-xl sm:px-10",
				children: [
					/* @__PURE__ */ (0, V.jsxs)("div", {
						className: "text-[11px] font-semibold uppercase tracking-[0.32em] text-[#f5d78e]",
						children: [w.label, " · Reports"]
					}),
					/* @__PURE__ */ (0, V.jsx)("h1", {
						className: "mt-2 font-serif text-4xl font-black tracking-tight sm:text-5xl",
						children: "Reports"
					}),
					/* @__PURE__ */ (0, V.jsx)("p", {
						className: "mt-2 max-w-2xl text-sm text-[#fde7b0]/90",
						children: "Pick a report, choose the dates, and download a print-ready PDF."
					}),
					/* @__PURE__ */ (0, V.jsx)("div", { className: "pointer-events-none absolute -bottom-24 -right-16 size-72 rounded-full border border-white/15 shadow-[0_0_0_28px_rgba(255,255,255,0.03),0_0_0_56px_rgba(255,255,255,0.02)]" })
				]
			}),
			/* @__PURE__ */ (0, V.jsx)("div", {
				className: "grid gap-4 sm:grid-cols-2 xl:grid-cols-4",
				children: O.map((e) => /* @__PURE__ */ (0, V.jsxs)("button", {
					type: "button",
					onClick: () => {
						j(e.id), q("");
					},
					className: "group relative flex min-h-44 flex-col gap-2 overflow-hidden rounded-2xl border bg-card p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2",
					style: { borderTop: `6px solid ${e.hue}` },
					children: [
						/* @__PURE__ */ (0, V.jsx)("span", {
							className: "grid size-12 place-items-center rounded-xl text-2xl",
							style: { background: `${e.hue}1a` },
							"aria-hidden": !0,
							children: e.icon
						}),
						/* @__PURE__ */ (0, V.jsx)("b", {
							className: "font-serif text-xl leading-tight",
							children: e.title
						}),
						/* @__PURE__ */ (0, V.jsx)("span", {
							className: "text-sm text-muted-foreground",
							children: e.blurb
						}),
						/* @__PURE__ */ (0, V.jsx)("span", {
							className: "mt-auto pt-2 text-sm font-semibold",
							style: { color: e.hue },
							children: "Choose dates → PDF"
						})
					]
				}, e.id))
			}),
			K && !A && /* @__PURE__ */ (0, V.jsx)("p", {
				className: "text-sm text-destructive",
				children: K
			}),
			/* @__PURE__ */ (0, V.jsx)(ee, {
				open: !!A,
				onOpenChange: (e) => {
					e || j(null);
				},
				children: /* @__PURE__ */ (0, V.jsx)(u, {
					className: "max-w-md",
					children: J && /* @__PURE__ */ (0, V.jsxs)(V.Fragment, { children: [
						/* @__PURE__ */ (0, V.jsxs)(l, { children: [/* @__PURE__ */ (0, V.jsxs)(d, {
							className: "flex items-center gap-2 font-serif text-2xl",
							children: [/* @__PURE__ */ (0, V.jsx)("span", {
								"aria-hidden": !0,
								children: J.icon
							}), J.title]
						}), /* @__PURE__ */ (0, V.jsxs)(f, { children: [J.blurb, "."] })] }),
						/* @__PURE__ */ (0, V.jsxs)("div", {
							className: "grid grid-cols-2 gap-3",
							children: [/* @__PURE__ */ (0, V.jsxs)("div", {
								className: "grid gap-1",
								children: [/* @__PURE__ */ (0, V.jsx)(p, {
									htmlFor: "rf",
									children: "From"
								}), /* @__PURE__ */ (0, V.jsx)(h, {
									id: "rf",
									type: "date",
									value: M,
									max: H,
									onChange: (e) => N(e.target.value || M)
								})]
							}), /* @__PURE__ */ (0, V.jsxs)("div", {
								className: "grid gap-1",
								children: [/* @__PURE__ */ (0, V.jsx)(p, {
									htmlFor: "rt",
									children: "To"
								}), /* @__PURE__ */ (0, V.jsx)(h, {
									id: "rt",
									type: "date",
									value: H,
									min: M,
									onChange: (e) => U(e.target.value || H)
								})]
							})]
						}),
						/* @__PURE__ */ (0, V.jsxs)("div", {
							className: "flex flex-wrap gap-1.5",
							children: [
								/* @__PURE__ */ (0, V.jsx)(m, {
									size: "sm",
									variant: "outline",
									onClick: () => Z(k, k),
									children: "Today"
								}),
								/* @__PURE__ */ (0, V.jsx)(m, {
									size: "sm",
									variant: "outline",
									onClick: () => Z(y(k, -6), k),
									children: "Last 7 days"
								}),
								/* @__PURE__ */ (0, V.jsx)(m, {
									size: "sm",
									variant: "outline",
									onClick: () => Z(Q, k),
									children: "This month"
								}),
								/* @__PURE__ */ (0, V.jsx)(m, {
									size: "sm",
									variant: "outline",
									onClick: () => Z($.slice(0, 8) + "01", $),
									children: "Last month"
								})
							]
						}),
						X && /* @__PURE__ */ (0, V.jsxs)("p", {
							className: "text-sm text-destructive",
							children: [
								"At most ",
								J.maxDays,
								" days for this report — ",
								Y,
								" chosen."
							]
						}),
						J.id === "website" && /* @__PURE__ */ (0, V.jsx)("p", {
							className: "text-xs text-muted-foreground",
							children: "The site keeps page visits for 90 days."
						}),
						K && /* @__PURE__ */ (0, V.jsx)("p", {
							className: "text-sm text-destructive",
							children: K
						}),
						/* @__PURE__ */ (0, V.jsxs)(m, {
							size: "lg",
							disabled: !!W || X || (J.id === "mawaid" || J.id === "occupancy" ? !E.data || J.id === "occupancy" && !D.data : !1),
							onClick: () => void se(),
							style: { background: J.hue },
							className: "text-white hover:opacity-90",
							children: [/* @__PURE__ */ (0, V.jsx)(te, { className: "size-4" }), W ? "Preparing…" : "Download PDF"]
						}),
						/* @__PURE__ */ (0, V.jsx)("p", {
							className: "text-xs text-muted-foreground",
							children: "Opens in a new tab: choose “Save as PDF” in the print window."
						})
					] })
				})
			})
		]
	});
}
export { H as default };
