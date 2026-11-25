import { f as e, h as t, i as n, n as r, o as i, p as a, u as o } from "./PmsContext-BVMd13Oi.js";
import { t as s } from "./useQuery-BUXPY6q6.js";
import { a as c, i as l, n as u, r as d, t as f } from "./select-VcH2xuqJ.js";
import { a as p, n as m, o as ee, t as te } from "./dialog-DtgtvZ4Q.js";
import { t as h } from "./checkbox-C3tIiLfF.js";
import { i as g, n as _, r as ne, t as v } from "./tabs-IQDmk0rj.js";
import { t as re } from "./label-CMEyi--P.js";
import { t as ie } from "./createLucideIcon-CQUC5AEZ.js";
import { t as y } from "./clipboard-copy-tf2KqiDa.js";
import { t as ae } from "./undo-2-WssTO3qI.js";
import { t as b } from "./x-Dis6Osjy.js";
import { n as x } from "./dist-BCHtOhmx.js";
import { t as S } from "./button-BGWa3SLr.js";
import { n as oe, t as se } from "./card-B9_OGomP.js";
import { t as C } from "./input-DSBk_UeU.js";
import { a as w, n as ce, o as le, r as T, s as E, t as ue } from "./table-DKR1WqRT.js";
import { t as de } from "./utils-b7UP9Cmo.js";
import { t as fe } from "./ConfirmDialog-GfriOiUy.js";
import { t as pe } from "./useSlips-DUKbzGma.js";
import { t as me } from "./badge-EB7Muw37.js";
import { t as he } from "./textarea-BxHERF6b.js";
// node_modules/lucide-react/dist/esm/icons/archive.mjs
var D = {
	name: "archive",
	size: 24,
	node: [
		["rect", {
			width: "20",
			height: "5",
			x: "2",
			y: "3",
			rx: "1",
			key: "1wp1u1"
		}],
		["path", {
			d: "M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8",
			key: "1s80jp"
		}],
		["path", {
			d: "M10 12h4",
			key: "a56b0p"
		}]
	]
};
D.node;
var ge = ie(D), _e = {
	name: "shuffle",
	size: 24,
	node: [
		["path", {
			d: "m18 14 4 4-4 4",
			key: "10pe0f"
		}],
		["path", {
			d: "m18 2 4 4-4 4",
			key: "pucp1d"
		}],
		["path", {
			d: "M2 18h1.973a4 4 0 0 0 3.3-1.7l5.454-8.6a4 4 0 0 1 3.3-1.7H22",
			key: "1ailkh"
		}],
		["path", {
			d: "M2 6h1.972a4 4 0 0 1 3.6 2.2",
			key: "km57vx"
		}],
		["path", {
			d: "M22 18h-6.041a4 4 0 0 1-3.3-1.8l-.359-.45",
			key: "os18l9"
		}]
	]
};
_e.node;
var ve = ie(_e), O = /* @__PURE__ */ t(a(), 1), ye = (e) => String(e).padStart(2, "0"), k = (e) => `${e.getFullYear()}-${ye(e.getMonth() + 1)}-${ye(e.getDate())}`, A = (e, t) => {
	let n = /* @__PURE__ */ new Date(`${e}T12:00`);
	return n.setDate(n.getDate() + t), k(n);
}, j = (e, t) => (/* @__PURE__ */ new Date(`${e}T${t || "00:00"}`)).getTime(), M = (e, t) => e ? (/* @__PURE__ */ new Date(`${e}T${t || "00:00"}`)).getTime() : NaN, be = (e) => /^S\d/i.test(String(e ?? "").trim()), xe = (e) => Number(e.total) || (Number(e.gents) || 0) + (Number(e.ladies) || 0) + (Number(e.children) || 0) + (Number(e.infants) || 0), N = (e) => ({
	sh: String(e.sh_no ?? ""),
	group: String(e.tour_name || "").trim() || `SH ${e.sh_no ?? ""}`,
	leader: String(e.group_leader ?? "").trim(),
	pax: xe(e),
	second: be(e.sh_no)
}), P = (e) => (t, n) => Number(be(n.sh_no)) - Number(be(t.sh_no)) || M(t[`${e}_date`], t[`${e}_time`]) - M(n[`${e}_date`], n[`${e}_time`]);
function Se(e, t, n, r, i, a = []) {
	let o = e.filter((e) => !e.deleted), s = (e) => {
		let t = i(e), r = o.filter((e) => i(e.sh_no) === t);
		return r.find((e) => String(e.checkin_date) <= n && n <= String(e.checkout_date)) || r[0];
	}, c = (e) => {
		let t = s(e.ref);
		return t ? N(t) : {
			sh: String(e.ref ?? ""),
			group: String(e.operator || "").trim() || `SH ${e.ref ?? ""}`,
			leader: String(e.leader || "").trim(),
			pax: Number(e.pax) || 0,
			second: !1
		};
	}, l = (e) => e.filter((t, n) => e.findIndex((e) => i(e.sh) === i(t.sh) && e.second === t.second) === n), u = t.filter((e) => /ATRAAF/i.test(String(e.route || "")) && String(e.ref || "").trim()), d = u.length ? {
		id: "atraaf",
		title: "Aaje Dupehre Atraaf",
		note: "Atraaf trips on the Transport day",
		items: l(u.map(c)).filter((e) => !e.second)
	} : {
		id: "atraaf",
		title: "Aaje Dupehre Atraaf",
		note: `No Atraaf trip on the Transport day — yesterday's arrivals (${A(n, -1).split("-").reverse().join("/")})`,
		items: l(o.filter((e) => e.checkin_date === A(n, -1)).sort(P("checkin")).map(N)).filter((e) => !e.second)
	}, f = (e) => a.find((t) => i(t.ref) === i(e.sh_no) && !/ATRAAF|ZIYARAT/i.test(String(t.route || ""))), p = (e) => {
		let t = String(f(e)?.route || "").toUpperCase();
		if (/AIRPORT/.test(t)) return "airport";
		if (/MADINA|MEDINA/.test(t)) return "madina";
		let n = String(e.to_place || "").toUpperCase();
		return /AIRPORT/.test(n) ? "airport" : /MADINA|MEDINA/.test(n) ? "madina" : "";
	}, m = o.filter((e) => e.checkout_date === A(n, 1)), ee = (e) => String(e.ums?.firstArrival || "").toUpperCase() === "MADINA", te = (e) => String(e.ums?.itinerary || "").toUpperCase() === "MAKKAH", h = m.filter((e) => {
		let t = p(e);
		return t === "madina" || t === "airport" && (ee(e) || te(e));
	}).sort(P("checkout")), g = {
		id: "wada",
		title: "Aaje Dupehre Wada Sabaq",
		note: `Leaving Makkah tomorrow (${A(n, 1).split("-").reverse().join("/")}) for Madina, or for the airport when their first arrival was Madina or the group is Makkah only`,
		items: l(h.map(N))
	}, _ = new Set(g.items.map((e) => i(e.sh))), ne = {
		id: "clash",
		title: "Atraaf and Wada Sabaq clash",
		note: "In both lists today — the timings clash",
		items: d.items.filter((e) => _.has(i(e.sh)))
	}, v = (e, t) => l(o.filter((n) => {
		let r = M(n.checkin_date, n.checkin_time);
		return r >= e && r < t;
	}).sort(P("checkin")).map(N));
	return [
		d,
		g,
		ne,
		{
			id: "raate",
			title: "Aaje Raate Haram",
			note: `Check-ins today ${r.split} – ${r.night_to}`,
			items: v(j(n, r.split), j(n, r.night_to))
		},
		{
			id: "fajr",
			title: "Kaale Fajare Haram",
			note: `Check-ins ${r.night_to} today – ${r.split} tomorrow`,
			items: v(j(n, r.night_to), j(A(n, 1), r.split))
		}
	];
}
var F = (e) => String(e ?? "").replace(/[&<>"']/g, (e) => ({
	"&": "&amp;",
	"<": "&lt;",
	">": "&gt;",
	"\"": "&quot;",
	"'": "&#39;"
})[e]), Ce = (e) => `${e.group}${e.second ? " (Second Umrah)" : ""}`, we = (e) => e.split("-").reverse().join("/");
function Te(e, t = !1) {
	let n = t ? " style=\"border:1px solid #999;background:#efe4c4;padding:4px 6px\"" : "", r = t ? " style=\"border:1px solid #999;padding:4px 6px\"" : "", i = e.items.map((e, t) => `<tr><td${r}>${t + 1}</td><td${r}>${F(Ce(e))}</td><td${r}>${F(e.leader || "—")}</td><td${r} align="center">${e.pax}</td></tr>`).join(""), a = e.items.reduce((e, t) => e + t.pax, 0);
	return `<table class="kgs" border="1" cellspacing="0" cellpadding="4" style="border-collapse:collapse;width:100%;margin:0 0 14px"><thead>
<tr><th colspan="4"${n} align="left">${F(e.title)} — ${e.items.length} group${e.items.length === 1 ? "" : "s"}, ${a} pax<br><small style="font-weight:400">${F(e.note)}</small></th></tr>
<tr><th${n}>#</th><th${n}>Group</th><th${n}>Leader</th><th${n}>Total pax</th></tr></thead>
<tbody>${i || `<tr><td colspan="4"${r}>None</td></tr>`}</tbody>${e.items.length ? `<tfoot><tr><td colspan="3"${r}><b>Total</b></td><td${r} align="center"><b>${a}</b></td></tr></tfoot>` : ""}</table>`;
}
function I(e, t, n, r) {
	let i = r === "excel" ? "<html xmlns:o=\"urn:schemas-microsoft-com:office:office\" xmlns:x=\"urn:schemas-microsoft-com:office:excel\" xmlns=\"http://www.w3.org/TR/REC-html40\">" : r === "word" ? "<html xmlns:o=\"urn:schemas-microsoft-com:office:office\" xmlns:w=\"urn:schemas-microsoft-com:office:word\" xmlns=\"http://www.w3.org/TR/REC-html40\">" : "<!doctype html><html>", a = `body{font:11pt Arial,Helvetica,sans-serif;color:#111;margin:${r === "print" ? "0" : "12px"}} h1{font-size:16pt;margin:0 0 2px;color:#4a3708} p.sub{margin:0 0 12px;color:#555}
table.kgs{border-collapse:collapse;width:100%;margin:0 0 14px;break-inside:auto} table.kgs th,table.kgs td{border:1px solid #999;padding:4px 6px;text-align:left} table.kgs thead tr:first-child th{background:#4a3708;color:#fff;font-size:12pt}
table.kgs thead tr+tr th{background:#efe4c4} table.kgs td:first-child,table.kgs th:first-child{width:28px;text-align:center} table.kgs td:last-child,table.kgs th:last-child{width:70px;text-align:center} tr{break-inside:avoid}
@page{size:A4 portrait;margin:12mm} .bar{position:sticky;top:0;padding:8px 12px;background:#fffaf1;border-bottom:1px solid #dcc7a4;font:13px system-ui} .bar button{font:inherit;padding:5px 14px;border:1px solid #b08d2a;border-radius:8px;background:#b08d2a;color:#fff;font-weight:700;cursor:pointer}
@media print{.bar{display:none}} @media screen{.page{max-width:190mm;margin:10px auto}}`, o = `<h1>KG summary — ${F(n)}</h1><p class="sub">${F(we(t))} · ${(/* @__PURE__ */ new Date(`${t}T12:00`)).toLocaleDateString("en-GB", { weekday: "long" })}</p>${e.map((e) => Te(e, r !== "print")).join("")}`;
	return `${i}<head><meta charset="utf-8"><title>KG summary ${F(we(t))}</title><style>${a}</style></head><body>${r === "print" ? `<div class="bar"><button type="button" onclick="window.print()">Print / Save as PDF</button></div><div class="page">${o}</div><script>window.addEventListener('load',()=>setTimeout(()=>window.print(),300));<\/script>` : o}</body></html>`;
}
// src/pages/kg/KgSummary.tsx
var L = e();
function Ee({ day: e, onClose: t }) {
	let { transport: a, ums: s, settings: c } = r(), l = a, u = n(), d = i(), { site: f, siteId: h } = o(), g = pe(), [_, ne] = (0, O.useState)(null), [v, re] = (0, O.useState)(/* @__PURE__ */ new Set()), [ie, y] = (0, O.useState)(""), ae = (0, O.useRef)(null);
	(0, O.useEffect)(() => {
		if (!g.data) return;
		let t = !0;
		return (async () => {
			try {
				let n = (() => {
					let t = /* @__PURE__ */ new Date(`${e}T12:00`);
					return t.setDate(t.getDate() + 1), `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, "0")}-${String(t.getDate()).padStart(2, "0")}`;
				})(), [r, i, a] = await Promise.all([
					u(l.loadDay(h, e)).catch(() => ({ rows: [] })),
					u(l.loadDay(h, n)).catch(() => ({ rows: [] })),
					u(c.loadSettings()).catch(() => null)
				]), o = (e) => {
					let t = l.resolve(e);
					return e.map((e) => ({
						...e,
						route: t.get(e.key)?.route || e.route
					}));
				}, d = {
					...c.DEFAULTS.fe_windows,
					...a?.settings?.fe_windows || {}
				};
				t && ne(Se(g.data, o(r?.rows || []), e, d, s.baseSh, o(i?.rows || [])));
			} catch (e) {
				t && y("Could not build the summary: " + (e.message || e));
			}
		})(), () => {
			t = !1;
		};
	}, [
		g.data,
		e,
		h
	]);
	let b = (_ || []).filter((e) => !v.has(e.id)), x = `KG summary ${e}`;
	function oe(t) {
		let n = new Blob([I(b, e, f.label, t)], { type: t === "word" ? "application/msword" : "application/vnd.ms-excel" }), r = document.createElement("a");
		r.href = URL.createObjectURL(n), r.download = `${x}.${t === "word" ? "doc" : "xls"}`, r.click(), setTimeout(() => URL.revokeObjectURL(r.href), 2e3);
	}
	function se() {
		let t = window.open("", "_blank");
		t ? (t.document.open(), t.document.write(I(b, e, f.label, "print")), t.document.close()) : y("The browser blocked the new tab: allow pop-ups for this site.");
	}
	async function C() {
		try {
			let e = await d("table-image"), t = [...ae.current?.querySelectorAll("table.kgs") || []].filter((e) => !v.has(e.dataset.id || "")), n = await e.copyTablesImage(t, `${x}.png`);
			y(n === "copied" ? "Copied as a picture — paste it into the chat." : "Saved as a picture (this browser cannot copy pictures).");
		} catch (e) {
			y("Could not make the picture: " + (e.message || e));
		}
	}
	return /* @__PURE__ */ (0, L.jsx)(te, {
		open: !0,
		onOpenChange: (e) => {
			e || t();
		},
		children: /* @__PURE__ */ (0, L.jsxs)(m, {
			className: "flex max-h-[min(92vh,92dvh)] max-w-[calc(100%-1rem)] flex-col gap-3 overflow-hidden p-4 sm:max-w-3xl sm:p-6",
			children: [
				/* @__PURE__ */ (0, L.jsx)(p, { children: /* @__PURE__ */ (0, L.jsxs)(ee, { children: ["Export summary — ", e.split("-").reverse().join("/")] }) }),
				/* @__PURE__ */ (0, L.jsxs)("div", {
					className: "flex flex-wrap items-center gap-2",
					children: [
						/* @__PURE__ */ (0, L.jsx)(S, {
							size: "sm",
							disabled: !b.length,
							onClick: se,
							children: "PDF"
						}),
						/* @__PURE__ */ (0, L.jsx)(S, {
							size: "sm",
							variant: "outline",
							disabled: !b.length,
							onClick: () => oe("word"),
							children: "Word"
						}),
						/* @__PURE__ */ (0, L.jsx)(S, {
							size: "sm",
							variant: "outline",
							disabled: !b.length,
							onClick: () => oe("excel"),
							children: "Excel"
						}),
						/* @__PURE__ */ (0, L.jsx)(S, {
							size: "sm",
							variant: "outline",
							disabled: !b.length,
							onClick: () => void C(),
							children: "Copy as image"
						}),
						/* @__PURE__ */ (0, L.jsx)("span", {
							className: "text-sm text-muted-foreground",
							role: "status",
							children: ie
						})
					]
				}),
				!_ && !ie && /* @__PURE__ */ (0, L.jsx)("p", {
					className: "text-sm text-muted-foreground",
					children: "Reading the slips and the Transport day…"
				}),
				_ && /* @__PURE__ */ (0, L.jsx)("div", {
					className: "flex flex-wrap gap-3 text-sm",
					children: _.map((e) => /* @__PURE__ */ (0, L.jsxs)("label", {
						className: "flex items-center gap-1.5",
						children: [
							/* @__PURE__ */ (0, L.jsx)("input", {
								type: "checkbox",
								checked: !v.has(e.id),
								onChange: (t) => re((n) => {
									let r = new Set(n);
									return t.target.checked ? r.delete(e.id) : r.add(e.id), r;
								})
							}),
							e.title,
							" (",
							e.items.length,
							")"
						]
					}, e.id))
				}),
				/* @__PURE__ */ (0, L.jsx)("div", {
					ref: ae,
					className: "min-h-0 flex-1 overflow-y-auto overscroll-contain pr-1 [&_table.kgs]:text-sm [&_table.kgs_td]:border [&_table.kgs_th]:border [&_table.kgs_th]:bg-secondary [&_table.kgs_th]:text-left [&_table.kgs_td]:px-2 [&_table.kgs_th]:px-2 [&_table.kgs_td]:py-1 [&_table.kgs_th]:py-1",
					children: (_ || []).map((e) => /* @__PURE__ */ (0, L.jsx)("div", {
						className: v.has(e.id) ? "hidden" : "",
						title: e.items.map(Ce).join(", "),
						dangerouslySetInnerHTML: { __html: Te(e).replace("<table class=\"kgs\"", `<table class="kgs" data-id="${e.id}"`) }
					}, e.id))
				})
			]
		})
	});
}
// src/pages/kg/kg.ts
var De = [
	"*MP FLOOR*",
	"*DH FLOOR*",
	"*UG FLOOR*",
	"*SNOOD HOTEL*",
	"*MIZAB HOTEL*",
	"*LG FLOOR*"
], Oe = "umrah-atraaf-people-v2", ke = "umrah-atraaf-log-v2", Ae = "umrah-fe1-bookmark-v1", R = (e) => String(e).padStart(2, "0"), z = (e) => `${e.getFullYear()}-${R(e.getMonth() + 1)}-${R(e.getDate())}`, B = (e, t) => e.localeCompare(t, void 0, {
	sensitivity: "base",
	numeric: !0
}), je = (e) => e ? new Date(e).toLocaleDateString(void 0, {
	day: "2-digit",
	month: "short"
}) : "—", V = (e) => new Date(e).toLocaleString(void 0, {
	day: "2-digit",
	month: "short",
	year: "2-digit",
	hour: "2-digit",
	minute: "2-digit"
}), Me = () => ({
	FE1: 0,
	FE2: 0,
	Atraaf: 0,
	total: 0,
	last: "",
	lastFE1: ""
});
function Ne(e, t) {
	let n = /* @__PURE__ */ new Map(), r = (e) => (n.has(e) || n.set(e, Me()), n.get(e));
	for (let e of t) {
		let t = r(e.person);
		t[e.type] = (t[e.type] || 0) + 1, t.total++, e.ts > t.last && (t.last = e.ts), e.type === "FE1" && e.ts > t.lastFE1 && (t.lastFE1 = e.ts);
	}
	for (let t of e) r(t);
	return n;
}
function Pe(e, t, n) {
	let r = {
		random: (e, t) => n(e) - n(t),
		az: (e, t) => B(e, t),
		last: (e, n) => (t(n).last || "").localeCompare(t(e).last || "") || B(e, n),
		most: (e, n) => t(n).total - t(e).total || B(e, n),
		least: (e, n) => t(e).total - t(n).total || B(e, n),
		FE1: (e, n) => t(e).FE1 - t(n).FE1 || (t(e).lastFE1 || "").localeCompare(t(n).lastFE1 || "") || B(e, n),
		FE2: (e, n) => t(e).FE2 - t(n).FE2 || B(e, n),
		Atraaf: (e, n) => t(e).Atraaf - t(n).Atraaf || B(e, n)
	};
	return r[e] || r.random;
}
var Fe = (e) => String(1 + Math.max(0, ...[...e.values()].filter((e) => e.type.has("Atraaf")).map((e) => parseInt(e.bus, 10)).filter(Number.isFinite)));
function Ie(e, t) {
	let n = e.trim(), r = "", i = n, a = n.match(/(\d{1,2}:\d{2}\s*(?:AM|PM))/i);
	a && (r = a[1].toUpperCase(), i = n.replace(a[0], "").trim().replace(/\s+/g, " "));
	let [o, s, c] = (t || z(/* @__PURE__ */ new Date())).split("-").map(Number), l = new Date(o, s - 1, c).toLocaleDateString(void 0, { weekday: "long" });
	return `*${i}*\n${R(c)}/${R(s)}/${o} ${l}\n${r || l}`;
}
function Le(e, t) {
	let n = {};
	for (let [e, r] of t) r.type.size && (n[r.location || "Unassigned"] ||= []).push(e);
	for (let e in n) n[e].sort(B);
	let r = [...De.filter((e) => n[e]), ...Object.keys(n).filter((e) => !De.includes(e)).sort()], i = e + "\n\n";
	for (let e of r) i += e + "\n", i += n[e].map((e, n) => {
		let r = t.get(e), i = r.type.has("Atraaf") && r.bus ? ` — Bus ${r.bus}` : "";
		return `${n + 1}. ${e}${i}`;
	}).join("\n") + "\n\n";
	return i.trim();
}
function Re(e, t, n) {
	if (!e.clientWidth) return;
	let r = e.getContext("2d"), i = e.width = e.clientWidth, a = e.height = e.clientHeight, o = [...t].sort(B).map((e) => ({
		name: e,
		...n(e)
	})), s = Math.max(1, ...o.map((e) => Math.max(e.FE1, e.FE2, e.Atraaf))), c = i - 34 - 8, l = a - 12 - 46;
	r.clearRect(0, 0, i, a), r.fillStyle = "#fffdf8", r.fillRect(0, 0, i, a);
	let u = Math.min(5, s);
	for (let e = 0; e <= u; e++) {
		let t = a - 46 - e / u * l;
		r.strokeStyle = e ? "rgba(154,116,20,.18)" : "#9a7414", r.beginPath(), r.moveTo(34, t), r.lineTo(i - 8, t), r.stroke(), r.fillStyle = "#3d3226", r.font = "11px system-ui, sans-serif", r.textAlign = "right", r.fillText(String(Math.round(e / u * s)), 28, t + 4);
	}
	let d = c / Math.max(1, o.length), f = Math.max(2, Math.min(14, d / 4));
	o.forEach((e, t) => {
		let n = 34 + t * d + (d - 3 * f) / 2;
		[
			e.FE1,
			e.FE2,
			e.Atraaf
		].forEach((e, t) => {
			let i = e / s * (l - 2);
			r.fillStyle = [
				"#2e7dd1",
				"#23a56b",
				"#e3a92b"
			][t], r.fillRect(n + t * f, a - 46 - i, f - 1, i);
		}), r.fillStyle = "#3d3226", r.font = "10px system-ui, sans-serif", r.textAlign = "right", r.save(), r.translate(34 + t * d + d / 2, a - 46 + 8), r.rotate(-Math.PI / 4), r.fillText(e.name.length > 12 ? e.name.slice(0, 11) + "…" : e.name, 0, 0), r.restore();
	});
}
var ze = (e) => String(e ?? "").replace(/[&<>"']/g, (e) => ({
	"&": "&amp;",
	"<": "&lt;",
	">": "&gt;",
	"\"": "&quot;",
	"'": "&#39;"
})[e]), H = (e) => {
	let t = new Date(e);
	return `${R(t.getDate())}-${t.toLocaleString(void 0, { month: "short" })}`;
};
function Be(e, t, n) {
	let r = new Map(e.map((e) => [e, []]));
	for (let e of [...t].sort((e, t) => e.ts.localeCompare(t.ts))) n.has(e.type) && (r.has(e.person) || r.set(e.person, []), r.get(e.person).push(H(e.ts)));
	for (let [e, t] of r) r.set(e, [...new Set(t)]);
	return r;
}
function Ve(e, t, n) {
	let r = "border:1px solid #000;", i = `style="${r} font-weight:bold; text-align:center; padding:4px 6px;"`, a = `style="${r} padding:4px 6px;"`, o = `<table cellspacing="0" cellpadding="0" style="border-collapse:collapse; ${r} width:100%;">`;
	return o += `<tr><th colspan="${n + 2}" style="${r} font-size:18px; color:#c00000; text-align:center;">${e}</th></tr>`, o += `<tr><th ${i}>SR NO.</th><th ${i}>NAME</th>${("<th " + i + ">DATE</th>").repeat(n)}</tr>`, t.forEach(([e, t], r) => {
		o += `<tr><td ${a} style="text-align:center;">${r + 1}</td><td ${a}>${ze(e)}</td>`;
		for (let e = 0; e < n; e++) o += `<td ${a}>${t[e] || ""}</td>`;
		o += "</tr>";
	}), o + "</table>";
}
function He(e, t, n, r) {
	let i = Be(e, t, /* @__PURE__ */ new Set(["FE1", "FE2"])), a = Be(e, t, /* @__PURE__ */ new Set(["Atraaf"])), o = e.map((e) => [e, i.get(e) || []]), s = e.map((e) => [e, a.get(e) || []]);
	return `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
        <head><meta charset="utf-8"></head><body>
        <div style="font-family:Calibri,Arial; font-size:12px; margin:6px 0 10px;"><strong>Event:</strong> ${ze(n || "—")} | <strong>Date:</strong> ${ze(r || z(/* @__PURE__ */ new Date()))}</div>
        ${Ve("FAKKUL EHRAAM", o, Math.max(14, ...o.map((e) => e[1].length)))}
        <div style="height:16px"></div>
        ${Ve("ATRAAF", s, Math.max(14, ...s.map((e) => e[1].length)))}
        </body></html>`;
}
// src/pages/kg/KgPage.tsx
var Ue = {
	FE1: "bg-[#e3effb] text-[#1a5da8]",
	FE2: "bg-[#e0f4ea] text-[#17784c]",
	Atraaf: "bg-[#fbf0d6] text-[#8a6410]"
};
function We() {
	let { cloud: e, settings: t } = r(), i = n(), { site: a, siteId: p } = o(), { ask: m, dialog: ee } = fe(), te = e.canWrite(p), [ie, pe] = (0, O.useState)({
		people: [],
		archived: [],
		bookmark: "",
		log: []
	}), [D, _e] = (0, O.useState)(!1), ye = (0, O.useRef)(""), [k, A] = (0, O.useState)(/* @__PURE__ */ new Map()), j = (0, O.useRef)(k);
	j.current = k;
	let M = (0, O.useRef)(/* @__PURE__ */ new Map()), [be, xe] = (0, O.useState)(0), N = (e) => (M.current.has(e) || M.current.set(e, Math.random()), M.current.get(e)), [P, Se] = (0, O.useState)("random"), [F, Ce] = (0, O.useState)(""), [we, Te] = (0, O.useState)(""), [I, R] = (0, O.useState)(t.DEFAULTS.kg_sessions), [Me, ze] = (0, O.useState)(""), [H, Be] = (0, O.useState)(z(/* @__PURE__ */ new Date())), [Ve, We] = (0, O.useState)(""), [Ge, Ke] = (0, O.useState)("3"), [qe, Je] = (0, O.useState)("3"), [Ye, Xe] = (0, O.useState)(""), [U, Ze] = (0, O.useState)(""), [Qe, $e] = (0, O.useState)("msg"), et = (0, O.useRef)(null), [tt, nt] = (0, O.useState)(!1), [W, rt] = (0, O.useState)(null);
	(0, O.useEffect)(() => {
		i(t.loadSettings()).then((e) => R(e.settings.kg_sessions || t.DEFAULTS.kg_sessions)).catch(() => {});
	}, []);
	let it = (e) => `${e.name} ${t.to12h(e.time)}`;
	(0, O.useEffect)(() => {
		!Me && I[0] && ze(it(I[0]));
	}, [I]);
	let G = s({
		queryKey: ["kg", p],
		queryFn: async () => await i(e.request("GET", `/api/kg?site=${p}`)),
		refetchInterval: () => document.visibilityState === "visible" && 3e4
	}), at = (0, O.useCallback)((e) => {
		let t = JSON.stringify([
			e.people,
			e.archived,
			e.bookmark,
			e.log.length,
			e.log[e.log.length - 1]?.id
		]);
		t !== ye.current && (ye.current = t, pe(e), _e(!0), A((t) => {
			let n = new Map(t);
			for (let t of [...n.keys()]) e.people.includes(t) || n.delete(t);
			return n;
		}));
	}, []);
	(0, O.useEffect)(() => {
		G.data && at(G.data);
	}, [G.data, at]), (0, O.useEffect)(() => {
		G.isError && x.error(G.error instanceof e.UserError ? G.error.message : "Could not load the KG list.");
	}, [G.isError]);
	async function K(t) {
		if (!te) return x(`This login can only view the ${a.label} KG list.`), null;
		try {
			let e = await i(t());
			return e && Array.isArray(e.people) && at(e), e;
		} catch (t) {
			return x.error(t instanceof e.UserError ? t.message : "Could not save. Check the connection."), null;
		}
	}
	let ot = (t, n, r) => K(() => e.request("POST", "/api/kg/op", {
		site: p,
		op: n,
		name: t
	})).then((e) => (e && r && x(r), e)), { people: q, archived: st = [], bookmark: J = "", log: Y } = ie, X = (0, O.useMemo)(() => Ne(q, Y), [q, Y]), Z = (e) => X.get(e) || {
		FE1: 0,
		FE2: 0,
		Atraaf: 0,
		total: 0,
		last: "",
		lastFE1: ""
	}, ct = (0, O.useMemo)(() => [...q].sort(Pe(P, Z, N)), [
		q,
		P,
		X,
		be
	]), lt = (0, O.useMemo)(() => [...q].sort(Pe("FE1", Z, N)), [q, X]), ut = (e, t) => A((n) => {
		let r = new Map(n), i = { ...r.get(e) || {
			type: /* @__PURE__ */ new Set(),
			location: "",
			bus: ""
		} };
		return i.type = new Set(i.type), t(i), r.set(e, i), r;
	}), dt = [...k.values()].filter((e) => e.type.size).length, Q = Ie(Me, H), ft = (0, O.useRef)(Q);
	(0, O.useEffect)(() => {
		We(Le(Q, k)), ft.current = Q;
	}, [k]), (0, O.useEffect)(() => {
		let e = Ve.split("\n");
		e.length < 3 ? We(Le(Q, k)) : (e.splice(0, 3, ...Q.split("\n")), We(e.join("\n"))), ft.current = Q;
	}, [Q]);
	let pt = (e, t, n) => ut(e, (e) => {
		n ? e.type.add(t) : e.type.delete(t), t === "Atraaf" && n && !e.bus && (e.bus = Fe(j.current));
	}), mt = (e) => A((t) => {
		let n = new Map(t);
		for (let t of e) {
			let e = { ...n.get(t) || {
				type: /* @__PURE__ */ new Set(),
				location: "",
				bus: ""
			} };
			e.type = new Set(e.type).add("FE1"), n.set(t, e);
		}
		return n;
	});
	async function ht() {
		let t = /* @__PURE__ */ new Date(), n = t.toISOString();
		if (H && H !== z(t)) {
			let [e, r, i] = H.split("-").map(Number);
			n = new Date(e, r - 1, i, t.getHours(), t.getMinutes(), t.getSeconds()).toISOString();
		}
		let r = [];
		for (let [e, t] of k) for (let i of t.type) r.push({
			ts: n,
			person: e,
			type: i,
			location: t.location || ""
		});
		if (!r.length) {
			x("Nothing ticked yet.");
			return;
		}
		let i = await K(() => e.request("POST", "/api/kg/log", {
			site: p,
			entries: r
		}));
		i && (A(/* @__PURE__ */ new Map()), x(`Saved ${i.added} assignment${i.added === 1 ? "" : "s"}${i.added < r.length ? ` (${r.length - i.added} were already saved)` : ""}.`));
	}
	async function gt() {
		let e = Ve.trim();
		if (!e) x("Nothing to copy.");
		else {
			try {
				await navigator.clipboard.writeText(e);
			} catch {
				let t = document.createElement("textarea");
				t.value = e, document.body.append(t), t.select(), document.execCommand("copy"), t.remove();
			}
			x("Copied — paste it into the group.");
		}
	}
	async function _t() {
		let e = we.trim();
		e ? q.includes(e) ? x("That name is already in the list.") : await ot(e, "add-person", `${e} added.`) && Te("") : x("Type a name first.");
	}
	async function vt(e) {
		await m({
			title: `Archive ${e}?`,
			confirmLabel: "Archive",
			body: `Archive ${e}? They stay out of the assignment list but keep their record and history — restore them any time from "Archived".`
		}) && (A((t) => {
			let n = new Map(t);
			return n.delete(e), n;
		}), ot(e, "archive-person", `${e} archived.`));
	}
	async function yt(e) {
		await m({
			title: `Remove ${e}?`,
			confirmLabel: "Remove",
			body: `Remove ${e} from the roster entirely? Their saved assignments stay in the records, but the name is taken off the list. (Use Restore instead to keep them.)`
		}) && ot(e, "remove-person", `${e} removed from the roster.`);
	}
	let bt = (t) => void K(() => e.request("POST", "/api/kg/op", {
		site: p,
		op: "bookmark",
		name: t
	}));
	function xt() {
		if (!q.length) {
			x("No people to assign.");
			return;
		}
		let e = Math.max(1, parseInt(qe || "3", 10)), t = J ? q.indexOf(J) : -1, n = [];
		for (let r = 1; r <= q.length && n.length < e; r++) n.push(q[(t + r) % q.length]);
		mt(n), n.length && bt(n[n.length - 1]);
	}
	let St = z(/* @__PURE__ */ new Date()), Ct = (e) => z(new Date(e)) === St, wt = (e) => Y.filter((t) => t.type === e && Ct(t.ts)).length;
	(0, O.useEffect)(() => {
		Qe === "stats" && et.current && Re(et.current, q, Z);
	}, [
		Qe,
		q,
		X
	]), (0, O.useEffect)(() => {
		let e = () => {
			Qe === "stats" && et.current && Re(et.current, q, Z);
		};
		return window.addEventListener("resize", e), () => window.removeEventListener("resize", e);
	}, [
		Qe,
		q,
		X
	]);
	let Tt = (0, O.useMemo)(() => [.../* @__PURE__ */ new Set([...q, ...Y.map((e) => e.person)])].sort(B), [q, Y]), Et = (0, O.useMemo)(() => [...Y].sort((e, t) => t.ts.localeCompare(e.ts)), [Y]), $ = U ? Et.filter((e) => e.person === U) : [];
	async function Dt(t) {
		await m({
			title: "Delete this entry?",
			confirmLabel: "Delete",
			body: `Delete ${t.person}'s ${t.type} on ${V(t.ts)}?`
		}) && await K(() => e.request("DELETE", `/api/kg/log/${t.id}?site=${p}`)) && x("Assignment deleted.");
	}
	let Ot = ({ r: e }) => /* @__PURE__ */ (0, L.jsx)(S, {
		variant: "ghost",
		size: "icon",
		className: "size-8",
		"aria-label": `Delete ${e.type} on ${V(e.ts)}`,
		onClick: () => void Dt(e),
		children: /* @__PURE__ */ (0, L.jsx)(b, { className: "size-4" })
	});
	function kt(e, t) {
		let n = document.createElement("a");
		n.href = URL.createObjectURL(t), n.download = e, n.click(), setTimeout(() => URL.revokeObjectURL(n.href), 2e3);
	}
	async function At(t) {
		let n = 0;
		for (let r = 0; r < t.length; r += 400) {
			let i = await K(() => e.request("POST", "/api/kg/log", {
				site: p,
				entries: t.slice(r, r + 400)
			}));
			if (!i) break;
			n += i.added;
		}
		return n;
	}
	function jt() {
		let e = document.createElement("input");
		e.type = "file", e.accept = "application/json", e.onchange = async (e) => {
			let t = e.target.files[0];
			if (!t) return;
			let n = [];
			try {
				n = JSON.parse(await t.text());
			} catch {
				x("That file is not valid JSON.");
				return;
			}
			let r = (Array.isArray(n) ? n : []).filter((e) => e && e.ts && e.person && e.type).map((e) => ({
				ts: e.ts,
				person: e.person,
				type: e.type,
				location: e.location || ""
			}));
			if (!r.length) {
				x("No entries in that file.");
				return;
			}
			let i = await At(r);
			x(`Imported ${i} new entr${i === 1 ? "y" : "ies"}.`);
		}, e.click();
	}
	async function Mt() {
		await m({
			title: "Reset everything?",
			confirmLabel: "Wipe everything",
			body: `Wipe ALL saved history and the names for ${a.label}? Every desk of this site loses them.`
		}) && ot("", "reset", "Everything was reset.");
	}
	(0, O.useEffect)(() => {
		if (!D || !te) return;
		let e = [], t = [];
		try {
			e = JSON.parse(localStorage.getItem("umrah-atraaf-people-v2") || "[]") || [];
		} catch {}
		try {
			t = JSON.parse(localStorage.getItem("umrah-atraaf-log-v2") || "[]") || [];
		} catch {}
		let n = (() => {
			try {
				return localStorage.getItem("umrah-fe1-bookmark-v1") || "";
			} catch {
				return "";
			}
		})();
		(e.length || t.length) && rt({
			people: e,
			log: t,
			mark: n
		});
	}, [D, te]);
	async function Nt() {
		if (!W) return;
		for (let t of W.people) q.includes(t) || await K(() => e.request("POST", "/api/kg/op", {
			site: p,
			op: "add-person",
			name: t
		}));
		W.mark && !J && await K(() => e.request("POST", "/api/kg/op", {
			site: p,
			op: "bookmark",
			name: W.mark
		}));
		let t = await At(W.log.filter((e) => e && e.ts && e.person && e.type).map((e) => ({
			ts: e.ts,
			person: e.person,
			type: e.type,
			location: e.location || ""
		})));
		[
			Oe,
			ke,
			Ae
		].forEach((e) => {
			try {
				localStorage.removeItem(e);
			} catch {}
		}), rt(null), x(`Moved: ${W.people.length} names, ${t} new assignments.`);
	}
	let Pt = F.trim().toLowerCase();
	return /* @__PURE__ */ (0, L.jsxs)("div", {
		className: "mx-auto grid grid-cols-[minmax(0,1fr)] max-w-[2400px] min-w-0 gap-3 px-3 pb-10 pt-4 sm:px-4",
		children: [
			W && /* @__PURE__ */ (0, L.jsxs)("div", {
				className: "flex flex-wrap items-center gap-2 rounded-xl border border-gold bg-accent p-3 text-sm",
				children: [
					/* @__PURE__ */ (0, L.jsxs)("span", {
						className: "min-w-0 flex-1",
						children: [
							"This browser still has its own KG list from before (",
							W.people.length,
							" name",
							W.people.length === 1 ? "" : "s",
							", ",
							W.log.length,
							" saved assignment",
							W.log.length === 1 ? "" : "s",
							"). Move it to the ",
							a.label,
							" cloud list so every desk sees it?"
						]
					}),
					/* @__PURE__ */ (0, L.jsx)(S, {
						size: "sm",
						onClick: () => void Nt(),
						children: "Move to cloud"
					}),
					/* @__PURE__ */ (0, L.jsx)(S, {
						size: "sm",
						variant: "outline",
						onClick: () => rt(null),
						children: "Not now"
					})
				]
			}),
			/* @__PURE__ */ (0, L.jsxs)("header", {
				className: "flex flex-wrap items-end justify-between gap-3",
				children: [/* @__PURE__ */ (0, L.jsxs)("div", { children: [/* @__PURE__ */ (0, L.jsx)("h1", {
					className: "text-2xl font-bold text-primary",
					children: "Fakkul Ehraam & Atraaf"
				}), /* @__PURE__ */ (0, L.jsx)("p", {
					className: "text-sm text-muted-foreground",
					children: "Tick who goes, pick a floor, copy the message. Saving logs it for the counts."
				})] }), /* @__PURE__ */ (0, L.jsxs)("div", {
					className: "flex flex-wrap gap-3",
					children: [
						/* @__PURE__ */ (0, L.jsxs)("div", {
							className: "grid gap-1",
							children: [/* @__PURE__ */ (0, L.jsx)(re, {
								htmlFor: "sessionTitle",
								children: "Event"
							}), /* @__PURE__ */ (0, L.jsxs)(f, {
								value: Me,
								onValueChange: ze,
								children: [/* @__PURE__ */ (0, L.jsx)(l, {
									id: "sessionTitle",
									className: "min-w-56",
									children: /* @__PURE__ */ (0, L.jsx)(c, {})
								}), /* @__PURE__ */ (0, L.jsx)(u, { children: I.map((e, t) => /* @__PURE__ */ (0, L.jsx)(d, {
									value: it(e),
									children: it(e)
								}, t)) })]
							})]
						}),
						/* @__PURE__ */ (0, L.jsxs)("div", {
							className: "grid gap-1",
							children: [/* @__PURE__ */ (0, L.jsx)(re, {
								htmlFor: "sessionDate",
								children: "Date"
							}), /* @__PURE__ */ (0, L.jsx)(C, {
								id: "sessionDate",
								type: "date",
								value: H,
								onChange: (e) => Be(e.target.value)
							})]
						}),
						p === "makkah" && /* @__PURE__ */ (0, L.jsx)(S, {
							className: "self-end",
							variant: "outline",
							title: "Atraaf, Wada Sabaq, Raate Haram and Kaale Fajare Haram lists for this date — PDF, Word, Excel or a picture",
							onClick: () => nt(!0),
							children: "Export summary"
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, L.jsxs)("div", {
				className: "grid min-w-0 items-start gap-3 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]",
				children: [/* @__PURE__ */ (0, L.jsx)(se, {
					className: "min-w-0",
					children: /* @__PURE__ */ (0, L.jsxs)(oe, {
						className: "grid gap-3",
						children: [
							/* @__PURE__ */ (0, L.jsxs)("div", {
								className: "flex flex-wrap items-center justify-between gap-2",
								children: [/* @__PURE__ */ (0, L.jsxs)("div", {
									className: "flex flex-wrap items-center gap-2",
									children: [
										/* @__PURE__ */ (0, L.jsxs)(f, {
											value: P,
											onValueChange: (e) => Se(e),
											children: [/* @__PURE__ */ (0, L.jsx)(l, {
												className: "w-60",
												"aria-label": "Order",
												children: /* @__PURE__ */ (0, L.jsx)(c, {})
											}), /* @__PURE__ */ (0, L.jsx)(u, { children: [
												["random", "Random"],
												["az", "A – Z"],
												["last", "Last activity"],
												["most", "Most active"],
												["least", "Least active"],
												["FE1", "Fakkul Ehraam 1 (fewest first)"],
												["FE2", "Fakkul Ehraam 2 (fewest first)"],
												["Atraaf", "Atraaf (fewest first)"]
											].map(([e, t]) => /* @__PURE__ */ (0, L.jsx)(d, {
												value: e,
												children: t
											}, e)) })]
										}),
										/* @__PURE__ */ (0, L.jsxs)(S, {
											variant: "outline",
											title: "A new random order",
											onClick: () => {
												M.current.clear(), Se("random"), xe((e) => e + 1);
											},
											children: [/* @__PURE__ */ (0, L.jsx)(ve, { className: "size-4" }), "Shuffle"]
										}),
										/* @__PURE__ */ (0, L.jsx)(C, {
											type: "search",
											className: "w-40",
											placeholder: "Find name…",
											"aria-label": "Find name",
											autoComplete: "off",
											value: F,
											onChange: (e) => Ce(e.target.value)
										})
									]
								}), /* @__PURE__ */ (0, L.jsxs)("div", {
									className: "flex flex-wrap items-center gap-2",
									children: [
										/* @__PURE__ */ (0, L.jsxs)(me, {
											variant: "secondary",
											children: [dt, " ticked"]
										}),
										/* @__PURE__ */ (0, L.jsx)(S, {
											variant: "outline",
											title: "Untick everything",
											onClick: () => A(/* @__PURE__ */ new Map()),
											children: "Clear ticks"
										}),
										/* @__PURE__ */ (0, L.jsx)(S, {
											onClick: () => void ht(),
											children: "Save assignment"
										})
									]
								})]
							}),
							/* @__PURE__ */ (0, L.jsx)("div", {
								className: "grid gap-1.5",
								children: ct.length ? ct.map((e, t) => {
									if (Pt && !e.toLowerCase().includes(Pt)) return null;
									let n = k.get(e), r = Z(e), i = !!n && n.type.size > 0;
									return /* @__PURE__ */ (0, L.jsxs)("div", {
										className: de("grid items-center gap-2 rounded-lg border bg-white p-2 sm:grid-cols-[2rem_minmax(0,1.6fr)_auto_auto_auto_minmax(0,11rem)_auto]", i && "border-gold bg-accent/50"),
										children: [
											/* @__PURE__ */ (0, L.jsx)("span", {
												className: "text-xs text-muted-foreground",
												children: t + 1
											}),
											/* @__PURE__ */ (0, L.jsxs)("div", {
												className: "min-w-0",
												children: [/* @__PURE__ */ (0, L.jsx)("b", {
													className: "break-words",
													children: e
												}), /* @__PURE__ */ (0, L.jsxs)("span", {
													className: "flex flex-wrap gap-x-2 text-[11px] text-muted-foreground",
													children: [
														/* @__PURE__ */ (0, L.jsxs)("i", {
															title: "Fakkul Ehraam 1",
															children: ["FE1 ", r.FE1]
														}),
														/* @__PURE__ */ (0, L.jsxs)("i", {
															title: "Fakkul Ehraam 2",
															children: ["FE2 ", r.FE2]
														}),
														/* @__PURE__ */ (0, L.jsxs)("i", {
															title: "Fakkul Ehraam total (FE1 + FE2)",
															children: ["FE total ", r.FE1 + r.FE2]
														}),
														/* @__PURE__ */ (0, L.jsxs)("i", {
															title: "Atraaf",
															children: ["AT ", r.Atraaf]
														}),
														/* @__PURE__ */ (0, L.jsx)("i", {
															title: "Last activity",
															children: je(r.last)
														})
													]
												})]
											}),
											["FE1", "FE2"].map((t) => /* @__PURE__ */ (0, L.jsxs)("label", {
												className: "flex items-center gap-1.5 text-sm",
												children: [/* @__PURE__ */ (0, L.jsx)(h, {
													checked: !!n?.type.has(t),
													onCheckedChange: (n) => pt(e, t, n === !0)
												}), t]
											}, t)),
											/* @__PURE__ */ (0, L.jsxs)("div", {
												className: "flex items-center gap-1.5",
												children: [/* @__PURE__ */ (0, L.jsxs)("label", {
													className: "flex items-center gap-1.5 text-sm",
													children: [/* @__PURE__ */ (0, L.jsx)(h, {
														checked: !!n?.type.has("Atraaf"),
														onCheckedChange: (t) => pt(e, "Atraaf", t === !0)
													}), "Atraaf"]
												}), n?.type.has("Atraaf") && /* @__PURE__ */ (0, L.jsx)(C, {
													className: "h-8 w-16",
													maxLength: 6,
													placeholder: "Bus",
													"aria-label": `Bus number for ${e}`,
													value: n.bus,
													onChange: (t) => ut(e, (e) => {
														e.bus = t.target.value.trim();
													})
												})]
											}),
											/* @__PURE__ */ (0, L.jsxs)(f, {
												value: n?.location || "none",
												onValueChange: (t) => ut(e, (e) => {
													e.location = t === "none" ? "" : t;
												}),
												children: [/* @__PURE__ */ (0, L.jsx)(l, {
													className: "h-8 w-full",
													"aria-label": `Location for ${e}`,
													children: /* @__PURE__ */ (0, L.jsx)(c, { placeholder: "Location…" })
												}), /* @__PURE__ */ (0, L.jsxs)(u, { children: [/* @__PURE__ */ (0, L.jsx)(d, {
													value: "none",
													children: "Location…"
												}), De.map((e) => /* @__PURE__ */ (0, L.jsx)(d, {
													value: e,
													children: e
												}, e))] })]
											}),
											/* @__PURE__ */ (0, L.jsx)(S, {
												variant: "ghost",
												size: "icon",
												className: "size-8",
												title: `Archive ${e} — keeps the record, hides them from assignment`,
												"aria-label": `Archive ${e}`,
												onClick: () => void vt(e),
												children: /* @__PURE__ */ (0, L.jsx)(ge, { className: "size-4" })
											})
										]
									}, e);
								}) : /* @__PURE__ */ (0, L.jsx)("p", {
									className: "p-3 text-center text-muted-foreground",
									children: D ? "No names yet — add the first one below." : "Loading…"
								})
							}),
							st.length > 0 && /* @__PURE__ */ (0, L.jsxs)("details", {
								className: "rounded-lg border bg-white p-2.5",
								children: [
									/* @__PURE__ */ (0, L.jsxs)("summary", {
										className: "cursor-pointer text-sm font-semibold",
										children: ["Archived ", /* @__PURE__ */ (0, L.jsx)(me, {
											variant: "secondary",
											children: st.length
										})]
									}),
									/* @__PURE__ */ (0, L.jsx)("p", {
										className: "my-2 text-xs text-muted-foreground",
										children: "Hidden from the assignment list; their saved history is kept. Restore to assign them again."
									}),
									/* @__PURE__ */ (0, L.jsx)("ul", {
										className: "grid gap-1",
										children: [...st].sort(B).map((e) => {
											let t = Z(e);
											return /* @__PURE__ */ (0, L.jsxs)("li", {
												className: "flex flex-wrap items-center gap-2 text-sm",
												children: [
													/* @__PURE__ */ (0, L.jsx)("span", {
														className: "font-semibold",
														children: e
													}),
													/* @__PURE__ */ (0, L.jsxs)("small", {
														className: "min-w-0 flex-1 text-muted-foreground",
														children: [
															"FE1 ",
															t.FE1,
															" · FE2 ",
															t.FE2,
															" · AT ",
															t.Atraaf,
															t.last ? ` · last ${je(t.last)}` : " · no history"
														]
													}),
													/* @__PURE__ */ (0, L.jsxs)(S, {
														size: "sm",
														variant: "outline",
														onClick: () => void ot(e, "unarchive-person", `${e} restored.`),
														children: [/* @__PURE__ */ (0, L.jsx)(ae, { className: "size-3.5" }), "Restore"]
													}),
													/* @__PURE__ */ (0, L.jsx)(S, {
														size: "icon",
														variant: "ghost",
														className: "size-8",
														title: `Take ${e} off the roster entirely (saved history still kept)`,
														"aria-label": `Remove ${e} from the roster`,
														onClick: () => void yt(e),
														children: /* @__PURE__ */ (0, L.jsx)(b, { className: "size-4" })
													})
												]
											}, e);
										})
									})
								]
							}),
							/* @__PURE__ */ (0, L.jsxs)("div", {
								className: "flex gap-2",
								children: [/* @__PURE__ */ (0, L.jsx)(C, {
									placeholder: "Add a person, e.g. M Taha Kamlapur",
									autoComplete: "off",
									value: we,
									onChange: (e) => Te(e.target.value),
									onKeyDown: (e) => {
										e.key === "Enter" && (e.preventDefault(), _t());
									}
								}), /* @__PURE__ */ (0, L.jsx)(S, {
									variant: "outline",
									onClick: () => void _t(),
									children: "➕ Add"
								})]
							})
						]
					})
				}), /* @__PURE__ */ (0, L.jsx)(se, {
					className: "min-w-0",
					children: /* @__PURE__ */ (0, L.jsx)(oe, { children: /* @__PURE__ */ (0, L.jsxs)(v, {
						value: Qe,
						onValueChange: $e,
						children: [
							/* @__PURE__ */ (0, L.jsxs)(ne, {
								className: "flex h-auto flex-wrap",
								children: [
									/* @__PURE__ */ (0, L.jsx)(g, {
										value: "msg",
										children: "✉️ Message"
									}),
									/* @__PURE__ */ (0, L.jsx)(g, {
										value: "fe1",
										children: "⚖️ FE1 helper"
									}),
									/* @__PURE__ */ (0, L.jsx)(g, {
										value: "stats",
										children: "📊 Stats"
									}),
									/* @__PURE__ */ (0, L.jsx)(g, {
										value: "hist",
										children: "🕘 History"
									})
								]
							}),
							/* @__PURE__ */ (0, L.jsxs)(_, {
								value: "msg",
								className: "grid gap-2 pt-3",
								children: [
									/* @__PURE__ */ (0, L.jsxs)("div", {
										className: "flex items-center justify-between",
										children: [/* @__PURE__ */ (0, L.jsx)("h2", {
											className: "font-bold text-primary",
											children: "Message"
										}), /* @__PURE__ */ (0, L.jsxs)(S, {
											onClick: () => void gt(),
											children: [/* @__PURE__ */ (0, L.jsx)(y, { className: "size-4" }), "Copy"]
										})]
									}),
									/* @__PURE__ */ (0, L.jsx)(he, {
										rows: 14,
										spellCheck: !1,
										className: "min-h-72 font-mono text-sm",
										value: Ve,
										onChange: (e) => We(e.target.value)
									}),
									/* @__PURE__ */ (0, L.jsx)("p", {
										className: "text-xs text-muted-foreground",
										children: "Names are numbered under each floor; Atraaf names carry their bus. FE1 / FE2 are not shown in the message. You can edit the text before copying."
									})
								]
							}),
							/* @__PURE__ */ (0, L.jsxs)(_, {
								value: "fe1",
								className: "grid gap-3 pt-3",
								children: [
									/* @__PURE__ */ (0, L.jsx)("h2", {
										className: "font-bold text-primary",
										children: "FE1 balance helper"
									}),
									/* @__PURE__ */ (0, L.jsxs)("div", {
										className: "grid gap-1.5",
										children: [/* @__PURE__ */ (0, L.jsx)("p", {
											className: "text-xs text-muted-foreground",
											children: "Tick FE1 for the people with the fewest FE1 (ties: longest since their last FE1)."
										}), /* @__PURE__ */ (0, L.jsxs)("div", {
											className: "flex gap-2",
											children: [/* @__PURE__ */ (0, L.jsx)(C, {
												type: "number",
												min: 1,
												step: 1,
												className: "w-20",
												"aria-label": "How many",
												value: Ge,
												onChange: (e) => Ke(e.target.value)
											}), /* @__PURE__ */ (0, L.jsx)(S, {
												variant: "outline",
												onClick: () => mt(lt.slice(0, Math.max(1, parseInt(Ge || "3", 10)))),
												children: "Tick lowest FE1"
											})]
										})]
									}),
									/* @__PURE__ */ (0, L.jsxs)("div", {
										className: "grid gap-1.5",
										children: [
											/* @__PURE__ */ (0, L.jsx)("p", {
												className: "text-xs text-muted-foreground",
												children: "Or go round the list: tick the next N after the bookmark, then move the bookmark on."
											}),
											/* @__PURE__ */ (0, L.jsxs)("div", {
												className: "flex gap-2",
												children: [/* @__PURE__ */ (0, L.jsxs)(f, {
													value: Ye || J || "none",
													onValueChange: (e) => Xe(e === "none" ? "" : e),
													children: [/* @__PURE__ */ (0, L.jsx)(l, {
														className: "w-full",
														"aria-label": "Bookmark",
														children: /* @__PURE__ */ (0, L.jsx)(c, {})
													}), /* @__PURE__ */ (0, L.jsxs)(u, { children: [/* @__PURE__ */ (0, L.jsx)(d, {
														value: "none",
														children: "— choose —"
													}), q.map((e) => /* @__PURE__ */ (0, L.jsx)(d, {
														value: e,
														children: e
													}, e))] })]
												}), /* @__PURE__ */ (0, L.jsx)(S, {
													variant: "ghost",
													onClick: () => {
														let e = Ye || J;
														e ? q.includes(e) ? bt(e) : x("That name is not in the list.") : x("Pick a name to bookmark.");
													},
													children: "Set bookmark"
												})]
											}),
											/* @__PURE__ */ (0, L.jsxs)("div", {
												className: "flex flex-wrap items-center gap-2",
												children: [
													/* @__PURE__ */ (0, L.jsx)(C, {
														type: "number",
														min: 1,
														step: 1,
														className: "w-20",
														"aria-label": "How many",
														value: qe,
														onChange: (e) => Je(e.target.value)
													}),
													/* @__PURE__ */ (0, L.jsx)(S, {
														variant: "outline",
														onClick: xt,
														children: "Tick next N"
													}),
													/* @__PURE__ */ (0, L.jsxs)("span", {
														className: "text-xs text-muted-foreground",
														children: ["Bookmark: ", J || "—"]
													})
												]
											})
										]
									}),
									/* @__PURE__ */ (0, L.jsxs)("h3", {
										className: "font-bold",
										children: ["FE1 so far ", /* @__PURE__ */ (0, L.jsx)("span", {
											className: "text-xs font-normal text-muted-foreground",
											children: "fewest first"
										})]
									}),
									/* @__PURE__ */ (0, L.jsx)("ol", {
										className: "grid gap-1 text-sm",
										children: lt.map((e) => /* @__PURE__ */ (0, L.jsxs)("li", {
											className: "flex items-center gap-2 rounded border bg-white px-2 py-1",
											children: [
												/* @__PURE__ */ (0, L.jsx)("span", {
													className: "min-w-0 flex-1 truncate",
													children: e
												}),
												/* @__PURE__ */ (0, L.jsx)("b", { children: Z(e).FE1 }),
												/* @__PURE__ */ (0, L.jsx)("small", {
													className: "text-muted-foreground",
													children: je(Z(e).lastFE1)
												})
											]
										}, e))
									})
								]
							}),
							/* @__PURE__ */ (0, L.jsxs)(_, {
								value: "stats",
								className: "grid gap-3 pt-3",
								children: [
									/* @__PURE__ */ (0, L.jsx)("h2", {
										className: "font-bold text-primary",
										children: "Today"
									}),
									/* @__PURE__ */ (0, L.jsx)("div", {
										className: "grid grid-cols-4 gap-2 text-center",
										children: [
											["FE1", wt("FE1")],
											["FE2", wt("FE2")],
											["Atraaf", wt("Atraaf")],
											["All time", Y.length]
										].map(([e, t]) => /* @__PURE__ */ (0, L.jsxs)("div", {
											className: "rounded-lg border bg-white p-2",
											children: [/* @__PURE__ */ (0, L.jsx)("b", {
												className: "block text-xl",
												children: t
											}), /* @__PURE__ */ (0, L.jsx)("span", {
												className: "text-xs text-muted-foreground",
												children: e
											})]
										}, e))
									}),
									/* @__PURE__ */ (0, L.jsxs)("h3", {
										className: "font-bold",
										children: ["Per person ", /* @__PURE__ */ (0, L.jsxs)("span", {
											className: "text-xs font-normal text-muted-foreground",
											children: [
												/* @__PURE__ */ (0, L.jsx)("i", { className: "mx-1 inline-block size-2.5 rounded-sm bg-[#2e7dd1]" }),
												"FE1 ",
												/* @__PURE__ */ (0, L.jsx)("i", { className: "mx-1 inline-block size-2.5 rounded-sm bg-[#23a56b]" }),
												"FE2 ",
												/* @__PURE__ */ (0, L.jsx)("i", { className: "mx-1 inline-block size-2.5 rounded-sm bg-[#e3a92b]" }),
												"Atraaf"
											]
										})]
									}),
									/* @__PURE__ */ (0, L.jsx)("canvas", {
										ref: et,
										className: "h-64 w-full rounded-lg border"
									}),
									/* @__PURE__ */ (0, L.jsxs)("div", {
										className: "flex flex-wrap gap-2",
										children: [
											/* @__PURE__ */ (0, L.jsx)(S, {
												onClick: () => kt("Assignments_FE_AT.xls", new Blob([He(q, Y, Me, H)], { type: "application/vnd.ms-excel" })),
												children: "⬇ Excel (.xls)"
											}),
											/* @__PURE__ */ (0, L.jsx)(S, {
												variant: "outline",
												onClick: () => kt("umrah-atraaf-history.json", new Blob([JSON.stringify(Y, null, 2)], { type: "application/json" })),
												children: "Export JSON"
											}),
											/* @__PURE__ */ (0, L.jsx)(S, {
												variant: "outline",
												onClick: jt,
												children: "Import JSON"
											}),
											/* @__PURE__ */ (0, L.jsx)(S, {
												variant: "destructive",
												onClick: () => void Mt(),
												children: "Reset all"
											})
										]
									}),
									/* @__PURE__ */ (0, L.jsx)("p", {
										className: "text-xs text-muted-foreground",
										children: "Export / import cover the saved history. Reset wipes the history and the names for every desk of this site."
									})
								]
							}),
							/* @__PURE__ */ (0, L.jsxs)(_, {
								value: "hist",
								className: "grid gap-3 pt-3",
								children: [/* @__PURE__ */ (0, L.jsxs)("div", {
									className: "flex items-center justify-between gap-2",
									children: [/* @__PURE__ */ (0, L.jsx)("h2", {
										className: "font-bold text-primary",
										children: "Saved assignments"
									}), /* @__PURE__ */ (0, L.jsxs)(f, {
										value: U || "all",
										onValueChange: (e) => Ze(e === "all" ? "" : e),
										children: [/* @__PURE__ */ (0, L.jsx)(l, {
											className: "w-48",
											"aria-label": "Show one person",
											children: /* @__PURE__ */ (0, L.jsx)(c, {})
										}), /* @__PURE__ */ (0, L.jsxs)(u, { children: [/* @__PURE__ */ (0, L.jsx)(d, {
											value: "all",
											children: "Everyone"
										}), Tt.map((e) => /* @__PURE__ */ (0, L.jsx)(d, {
											value: e,
											children: e
										}, e))] })]
									})]
								}), U ? (() => {
									let e = (e) => $.filter((t) => t.type === e).length;
									return /* @__PURE__ */ (0, L.jsxs)("div", {
										className: "grid gap-3",
										children: [
											/* @__PURE__ */ (0, L.jsxs)("div", {
												className: "flex items-center gap-3",
												children: [/* @__PURE__ */ (0, L.jsx)(S, {
													variant: "outline",
													onClick: () => Ze(""),
													children: "← Everyone"
												}), /* @__PURE__ */ (0, L.jsxs)("div", { children: [/* @__PURE__ */ (0, L.jsx)("h3", {
													className: "text-lg font-bold",
													children: U
												}), /* @__PURE__ */ (0, L.jsxs)("p", {
													className: "text-xs text-muted-foreground",
													children: [$.length ? `${$.length} assignment${$.length === 1 ? "" : "s"} · first ${V($[$.length - 1].ts)} · last ${V($[0].ts)}` : "No saved assignments yet.", q.includes(U) ? "" : st.includes(U) ? " · archived" : " · no longer in the name list"]
												})] })]
											}),
											/* @__PURE__ */ (0, L.jsx)("div", {
												className: "grid grid-cols-4 gap-2 text-center",
												children: [
													["FE1", e("FE1")],
													["FE2", e("FE2")],
													["FE total", e("FE1") + e("FE2")],
													["Atraaf", e("Atraaf")]
												].map(([e, t]) => /* @__PURE__ */ (0, L.jsxs)("div", {
													className: "rounded-lg border bg-white p-2",
													children: [/* @__PURE__ */ (0, L.jsx)("b", {
														className: "block text-xl",
														children: t
													}), /* @__PURE__ */ (0, L.jsx)("span", {
														className: "text-xs text-muted-foreground",
														children: e
													})]
												}, e))
											}),
											/* @__PURE__ */ (0, L.jsx)("div", {
												className: "max-h-96 overflow-auto rounded-lg border",
												children: /* @__PURE__ */ (0, L.jsxs)(ue, { children: [/* @__PURE__ */ (0, L.jsx)(le, { children: /* @__PURE__ */ (0, L.jsxs)(E, { children: [
													/* @__PURE__ */ (0, L.jsx)(w, { children: "When" }),
													/* @__PURE__ */ (0, L.jsx)(w, { children: "Type" }),
													/* @__PURE__ */ (0, L.jsx)(w, { children: "Location" }),
													/* @__PURE__ */ (0, L.jsx)(w, {})
												] }) }), /* @__PURE__ */ (0, L.jsx)(ce, { children: $.length ? $.map((e) => /* @__PURE__ */ (0, L.jsxs)(E, { children: [
													/* @__PURE__ */ (0, L.jsx)(T, {
														className: "whitespace-nowrap",
														children: V(e.ts)
													}),
													/* @__PURE__ */ (0, L.jsx)(T, { children: /* @__PURE__ */ (0, L.jsx)("span", {
														className: de("rounded-full px-2 py-0.5 text-xs font-bold", Ue[e.type]),
														children: e.type
													}) }),
													/* @__PURE__ */ (0, L.jsx)(T, { children: e.location || "" }),
													/* @__PURE__ */ (0, L.jsx)(T, { children: /* @__PURE__ */ (0, L.jsx)(Ot, { r: e }) })
												] }, e.id)) : /* @__PURE__ */ (0, L.jsx)(E, { children: /* @__PURE__ */ (0, L.jsx)(T, {
													colSpan: 4,
													className: "text-muted-foreground",
													children: "Nothing saved yet."
												}) }) })] })
											})
										]
									});
								})() : /* @__PURE__ */ (0, L.jsx)("div", {
									className: "max-h-[28rem] overflow-auto rounded-lg border",
									children: /* @__PURE__ */ (0, L.jsxs)(ue, { children: [/* @__PURE__ */ (0, L.jsx)(le, { children: /* @__PURE__ */ (0, L.jsxs)(E, { children: [
										/* @__PURE__ */ (0, L.jsx)(w, { children: "When" }),
										/* @__PURE__ */ (0, L.jsx)(w, { children: "Type" }),
										/* @__PURE__ */ (0, L.jsx)(w, { children: "Person" }),
										/* @__PURE__ */ (0, L.jsx)(w, { children: "Location" }),
										/* @__PURE__ */ (0, L.jsx)(w, {})
									] }) }), /* @__PURE__ */ (0, L.jsx)(ce, { children: Et.length ? Et.map((e) => /* @__PURE__ */ (0, L.jsxs)(E, { children: [
										/* @__PURE__ */ (0, L.jsx)(T, {
											className: "whitespace-nowrap",
											children: V(e.ts)
										}),
										/* @__PURE__ */ (0, L.jsx)(T, { children: /* @__PURE__ */ (0, L.jsx)("span", {
											className: de("rounded-full px-2 py-0.5 text-xs font-bold", Ue[e.type]),
											children: e.type
										}) }),
										/* @__PURE__ */ (0, L.jsx)(T, { children: /* @__PURE__ */ (0, L.jsx)("button", {
											type: "button",
											className: "font-semibold text-primary underline",
											title: `Open ${e.person}'s profile`,
											onClick: () => Ze(e.person),
											children: e.person
										}) }),
										/* @__PURE__ */ (0, L.jsx)(T, { children: e.location || "" }),
										/* @__PURE__ */ (0, L.jsx)(T, { children: /* @__PURE__ */ (0, L.jsx)(Ot, { r: e }) })
									] }, e.id)) : /* @__PURE__ */ (0, L.jsx)(E, { children: /* @__PURE__ */ (0, L.jsx)(T, {
										colSpan: 5,
										className: "text-muted-foreground",
										children: "Nothing saved yet."
									}) }) })] })
								})]
							})
						]
					}) })
				})]
			}),
			ee,
			tt && /* @__PURE__ */ (0, L.jsx)(Ee, {
				day: H,
				onClose: () => nt(!1)
			})
		]
	});
}
export { We as default };
