import { f as e, h as t, n, o as r, p as i, r as a, s as o, u as s } from "./PmsContext-BVMd13Oi.js";
import { a as c, i as l, n as u, r as d, t as f } from "./select-VcH2xuqJ.js";
import { t as p } from "./checkbox-C3tIiLfF.js";
import { t as m } from "./label-CMEyi--P.js";
import { t as ee } from "./createLucideIcon-CQUC5AEZ.js";
import { t as te } from "./download-DbAPjole.js";
import { t as ne } from "./printer-_t2PY0au.js";
import { t as h } from "./x-Dis6Osjy.js";
import { t as g } from "./button-BGWa3SLr.js";
import { i as re, n as ie, r as ae, t as oe } from "./card-B9_OGomP.js";
import { t as _ } from "./input-DSBk_UeU.js";
import { a as v, i as se, n as ce, o as le, r as y, s as b, t as ue } from "./table-DKR1WqRT.js";
import { t as de } from "./utils-b7UP9Cmo.js";
import { t as fe } from "./useSlips-DUKbzGma.js";
import { t as pe } from "./badge-EB7Muw37.js";
import { t as me } from "./usePrefs-CeGrJo8w.js";
// node_modules/lucide-react/dist/esm/icons/bed-double.mjs
var x = {
	name: "bed-double",
	size: 24,
	node: [
		["path", {
			d: "M2 20v-8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v8",
			key: "1k78r4"
		}],
		["path", {
			d: "M4 10V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4",
			key: "fb3tl2"
		}],
		["path", {
			d: "M12 4v6",
			key: "1dcgq2"
		}],
		["path", {
			d: "M2 18h20",
			key: "ajqnye"
		}]
	]
};
x.node;
var he = ee(x), S = /* @__PURE__ */ t(i(), 1), C = e(), w = /\broom|building/i, ge = (e) => `pms_room_cards_closed:${e}`, _e = (e) => {
	try {
		return JSON.parse(localStorage.getItem(ge(e)) || "[]");
	} catch {
		return [];
	}
}, T = (e) => new Date(e).toLocaleString("en-GB", {
	weekday: "short",
	hour: "2-digit",
	minute: "2-digit"
}), ve = (e) => e.split(" · ").filter((e) => w.test(e)).join(" · ");
function ye(e) {
	let t = [];
	for (let n of e) n.items ? n.items.forEach((e, r) => {
		w.test(e.text) && t.push({
			key: `${n.id}:${r}`,
			at: n.at,
			who: n.desk_name,
			sh: e.sh,
			grp: e.grp,
			text: ve(e.text),
			via: n.kind.replace(/^bulk:/, "")
		});
	}) : w.test(n.text) && t.push({
		key: String(n.id),
		at: n.at,
		who: n.desk_name,
		sh: n.sh,
		grp: n.grp,
		text: ve(n.text),
		via: ""
	});
	return t.reverse();
}
function be({ cloud: e, siteId: t }) {
	let [n, r] = (0, S.useState)([]), [i, a] = (0, S.useState)(() => _e(t));
	(0, S.useEffect)(() => {
		let n = !1, i = () => e.request("GET", `/api/activity?site=${t}&hours=24`).then((e) => {
			n || r(ye(e.items || []));
		}, () => {});
		i();
		let a = window.setInterval(() => {
			document.visibilityState === "visible" && i();
		}, 3e4), o = () => {
			i();
		};
		return window.addEventListener("pms:sync", o), () => {
			n = !0, window.clearInterval(a), window.removeEventListener("pms:sync", o);
		};
	}, [t]);
	let o = (e) => {
		let n = [.../* @__PURE__ */ new Set([...i, ...e])].slice(-800);
		a(n);
		try {
			localStorage.setItem(ge(t), JSON.stringify(n));
		} catch {}
	}, s = n.filter((e) => !i.includes(e.key));
	return s.length ? /* @__PURE__ */ (0, C.jsxs)("section", {
		"aria-label": "Room changes in the last 24 hours",
		className: "grid gap-2 print:hidden",
		children: [
			/* @__PURE__ */ (0, C.jsxs)("div", {
				className: "flex items-center gap-2 text-sm font-semibold text-amber-800 dark:text-amber-300",
				children: [
					/* @__PURE__ */ (0, C.jsx)(he, { className: "size-4" }),
					"Room changes · last 24 hours (",
					s.length,
					")",
					s.length > 1 && /* @__PURE__ */ (0, C.jsx)(g, {
						size: "sm",
						variant: "ghost",
						className: "ml-auto h-7",
						onClick: () => o(s.map((e) => e.key)),
						children: "Close all"
					})
				]
			}),
			/* @__PURE__ */ (0, C.jsx)("div", {
				className: "grid gap-2 sm:grid-cols-2 xl:grid-cols-3",
				children: s.slice(0, 30).map((e) => /* @__PURE__ */ (0, C.jsxs)("div", {
					role: "status",
					className: "relative rounded-xl border border-amber-300 bg-amber-50 p-3 pr-9 text-sm shadow-sm dark:border-amber-700 dark:bg-amber-950/40",
					children: [
						/* @__PURE__ */ (0, C.jsx)("button", {
							type: "button",
							"aria-label": "Close this card",
							className: "absolute right-2 top-2 rounded p-1 text-amber-900/70 hover:bg-amber-200/60 dark:text-amber-200",
							onClick: () => o([e.key]),
							children: /* @__PURE__ */ (0, C.jsx)(h, { className: "size-4" })
						}),
						/* @__PURE__ */ (0, C.jsx)("b", {
							className: "block",
							children: [e.sh && `SH ${e.sh}`, e.grp].filter(Boolean).join(" · ") || "Slip"
						}),
						/* @__PURE__ */ (0, C.jsx)("span", {
							className: "block text-[15px] font-semibold text-amber-900 dark:text-amber-200",
							children: e.text.charAt(0).toUpperCase() + e.text.slice(1)
						}),
						/* @__PURE__ */ (0, C.jsxs)("small", {
							className: "text-muted-foreground",
							children: [
								e.via ? `${e.via === "ums-import" ? "UMS import" : e.via} · ` : "",
								"by ",
								e.who,
								" · ",
								T(e.at)
							]
						})
					]
				}, e.key))
			}),
			s.length > 30 && /* @__PURE__ */ (0, C.jsxs)("p", {
				className: "text-xs text-muted-foreground",
				children: [
					"… and ",
					s.length - 30,
					" more."
				]
			})
		]
	}) : null;
}
// src/pages/checkins/checkins.ts
var E = (e) => String(e).padStart(2, "0"), D = (e) => {
	let t = Number(e);
	return Number.isFinite(t) ? t : 0;
}, O = (e, t) => {
	if (!e) return null;
	let n = /* @__PURE__ */ new Date(`${e}T${t && t.length ? t : "00:00"}`);
	return isNaN(n.getTime()) ? null : n;
}, k = (e) => `${e.getFullYear()}-${E(e.getMonth() + 1)}-${E(e.getDate())}`;
function A(e) {
	if (!e) return "";
	let [t, n, r] = e.split("-").map(Number), i = new Date(t, (n || 1) - 1, r || 1);
	return i.setDate(i.getDate() + 1), k(i);
}
var j = (e) => {
	if (!e) return "";
	try {
		return e.toLocaleString([], {
			year: "2-digit",
			month: "short",
			day: "2-digit",
			hour: "2-digit",
			minute: "2-digit"
		});
	} catch {
		return e.toISOString().slice(0, 16).replace("T", " ");
	}
}, M = (e, t, n) => !!e && e >= t && e <= n, xe = (e, t) => e.localeCompare(t, void 0, {
	numeric: !0,
	sensitivity: "base"
}), N = (e, t) => {
	let n = String(e.room_no || "").trim();
	if (!n || !e.exclusive) return n;
	let r = !1;
	try {
		r = localStorage.getItem("pms_excl_building") === "1";
	} catch {}
	return r ? `${n} Excl · ${String(e.building || e.rowBuilding || t.building || "").trim().toUpperCase()}`.replace(/ · $/, "") : `${n} Excl`;
};
function Se(e) {
	if (e._dep) return [...new Set(e._dep.rooms.map((t) => N(t, e)))].filter(Boolean).sort(xe);
	let t = [];
	return (e.rooms?.gents || []).forEach((n) => t.push(N(n, e))), (e.rooms?.ladies || []).forEach((n) => t.push(N(n, e))), Array.from(new Set(t.filter(Boolean))).sort(xe);
}
var Ce = (e) => {
	let t = /^(.*?) Excl(?: · (.*))?$/.exec(e);
	return t ? {
		room: t[1],
		tag: `EXCL${t[2] ? " · " + t[2] : ""}`
	} : {
		room: e,
		tag: ""
	};
}, P = (e) => Se(e).map((e) => {
	let t = Ce(e);
	return t.tag ? `${H(t.room)} <span class="excl">${H(t.tag)}</span>` : H(t.room);
}).join(", ") || "-";
function F(e) {
	return e._dep ? e._dep.pax : D(e.total) || D(e.gents) + D(e.ladies) + D(e.children ?? e.child) + D(e.infants ?? e.infant);
}
function we(e) {
	let t = Number(e.assigned ?? e.assigned_count ?? e.assignedGuests ?? e.assignedRoomsCount);
	if (Number.isFinite(t) && t >= 0) return t;
	if (e.rooms && (Array.isArray(e.rooms.gents) || Array.isArray(e.rooms.ladies))) {
		let t = (e) => Array.isArray(e) ? e.reduce((e, t) => e + (Number(t?.assigned) || 0), 0) : 0;
		return t(e.rooms.gents) + t(e.rooms.ladies);
	}
	return D(e.total) || D(e.gents) + D(e.ladies) + D(e.children ?? e.child) + D(e.infants ?? e.infant);
}
function Te(e, t, n, r) {
	let i = [], a = [];
	for (let o of e) {
		let e = O(o.checkin_date, o.checkin_time), s = O(o.checkout_date, o.checkout_time);
		if (M(e, t, n) && i.push(o), !r.isDelayed(o)) M(s, t, n) && a.push(o);
		else for (let e of r.departuresOf(o)) {
			let i = new Date(e.at);
			M(i, t, n) && a.push({
				...o,
				checkout_date: k(i),
				checkout_time: `${E(i.getHours())}:${E(i.getMinutes())}`,
				_dep: {
					rooms: e.rooms,
					status: e.status,
					last: e.last,
					pax: r.paxAt(o, e.at - 1).total - r.paxAt(o, e.at).total
				}
			});
		}
	}
	let o = (e, t) => +(O(e[`${t}_date`], e[`${t}_time`]) ?? 0);
	return i.sort((e, t) => o(e, "checkin") - o(t, "checkin")), a.sort((e, t) => o(e, "checkout") - o(t, "checkout")), {
		ins: i,
		outs: a
	};
}
var Ee = {
	MAKKAH: "makkah",
	MADINA: "medina"
};
function I(e) {
	let t = String(e ?? "").trim();
	return t ? /air ?port|\bapt\b/i.test(t) ? "airport" : /^(makkah|mecca|makka)\b/i.test(t) ? "makkah" : /^(madina|medina|madinah|medinah)\b/i.test(t) ? "medina" : null : null;
}
function De(e, t, n, r) {
	let i = t === "makkah" ? "medina" : "makkah", a = (e) => e === t ? null : e, o = a(I(e.from_place)), s = a(I(e.to_place));
	if (o && s) return {
		from: o,
		to: s
	};
	let c = String(e.ums?.itinerary || ""), l = c ? (() => {
		let n = c.split("→").map((e) => Ee[e.trim()]), r = Number(e.ums?.seg) || 1, i = -1, a = 0;
		for (let e = 0; e < n.length; e++) if (n[e] === t && ++a === r) {
			i = e;
			break;
		}
		return i >= 0 ? {
			from: i === 0 ? "airport" : n[i - 1],
			to: i === n.length - 1 ? "airport" : n[i + 1]
		} : null;
	})() : null;
	if (l) return {
		from: o ?? l.from,
		to: s ?? l.to
	};
	let u = /^S/i.test(String(e.sh_no ?? "").trim()) ? i : "airport", d = e.checkout_date, f = r(e.sh_no), p = (e, t) => {
		let n = /* @__PURE__ */ new Date(`${e}T12:00`);
		return n.setDate(n.getDate() + t), k(n);
	}, m = f && d && n.some((e) => !e.deleted && r(e.sh_no) === f && e.checkin_date >= p(d, -1) && e.checkin_date <= p(d, 1));
	return {
		from: o ?? u,
		to: s ?? (m ? i : "airport")
	};
}
function Oe(e, t, n, r, i, a) {
	if (!n) return [[null, e]];
	let o = t === "checkin" ? "from" : "to", s = (t) => e.filter((e) => r(e)[o] === t), c = t === "checkin" ? "From" : "Departing to";
	return [...ke(s("airport"), t), [`${c} ${a}`, s(i)]];
}
var L = /\b(madina|medina|madinah|medinah)\b/i;
function R(e) {
	let t = String(e ?? "").trim().replace(/\s+/g, " ");
	if (!t) return "";
	if (/air ?port|\bapt\b/i.test(t) || /^(jeddah|jed|taif|tif|med|madina|medina)$/i.test(t)) {
		let e = t.replace(/\b(international|intl|air ?port|apt)\b/gi, "").trim();
		return `${(L.test(e) || /^med$/i.test(e) ? "Madina" : /^jed/i.test(e) ? "Jeddah" : /^(taif|tif)$/i.test(e) ? "Taif" : e.toLowerCase().replace(/\b\w/g, (e) => e.toUpperCase())) || "The"} Airport`;
	}
	return "";
}
function ke(e, t) {
	let n = t === "checkin" ? "From" : "Departing to", r = /* @__PURE__ */ new Map();
	for (let i of e) {
		let e = t === "checkin" ? i.from_place : i.to_place, a = R(e), o = String(e ?? "").trim(), s = a ? `${n} ${a}` : /^by /i.test(o) ? `${t === "checkin" ? "Arriving" : "Departing"} ${o.toLowerCase()} (airport leg)` : `${n} the airport (no airport on the slip)`;
		r.set(s, [...r.get(s) || [], i]);
	}
	return r.size ? [...r].sort((e, t) => t[1].length - e[1].length) : [[`${n} the airport`, []]];
}
var Ae = (e) => ({
	n: e.length,
	as: e.reduce((e, t) => e + we(t), 0),
	t: e.reduce((e, t) => e + F(t), 0),
	g: e.reduce((e, t) => e + D(t.gents), 0),
	l: e.reduce((e, t) => e + D(t.ladies), 0),
	c: e.reduce((e, t) => e + D(t.children ?? t.child), 0),
	i: e.reduce((e, t) => e + D(t.infants ?? t.infant), 0)
}), z = (e) => e === "medina" ? [
	"as",
	"t",
	"g",
	"c",
	"l",
	"i"
] : [
	"as",
	"t",
	"g",
	"l",
	"c",
	"i"
], B = (e, t) => t === "as" ? we(e) : t === "t" ? F(e) : D(t === "g" ? e.gents : t === "l" ? e.ladies : t === "c" ? e.children ?? e.child : e.infants ?? e.infant), V = {
	as: "As.",
	t: "T",
	g: "G",
	l: "L",
	c: "C",
	i: "I"
}, je = (e) => `${e.length} slip${e.length === 1 ? "" : "s"} · ${e.reduce((e, t) => e + F(t), 0)} guests`, Me = "S";
function Ne(e) {
	let t = /* @__PURE__ */ new Map();
	for (let n of e) {
		let e = String(n.sh_no ?? "").trim().toUpperCase();
		e && !n.deleted && (t.has(e) || t.set(e, []), t.get(e).push(n));
	}
	for (let e of t.values()) e.sort((e, t) => `${e.checkin_date}T${e.checkin_time}`.localeCompare(`${t.checkin_date}T${t.checkin_time}`));
	return t;
}
function Pe(e, t) {
	let n = String(t ?? "").trim().toUpperCase();
	if (!(n.startsWith(Me) && /^\d+$/.test(n.slice(1)))) return "";
	let r = (e.get(n.slice(1)) || []).find((e) => String(e.building || "").trim());
	return r ? String(r.building).trim() : "";
}
function Fe(e, t, n) {
	let r = n.pax || z(""), i = e === "in" ? [
		"Check-in",
		...n.flights ? ["Flight"] : [],
		"SH No",
		"First accommodation",
		"Group",
		"Group Leader",
		"Building",
		"Rooms",
		...r.map((e) => V[e]),
		"Check-out"
	] : [
		"Check-out",
		...n.flights ? ["Flight"] : [],
		"SH No",
		"First accommodation",
		"Group",
		"Group Leader",
		"Building",
		"Rooms",
		...r.map((e) => V[e]),
		"Check-in"
	], a = (e) => `"${String(e ?? "").replace(/"/g, "\"\"")}"`, o = [
		"time",
		...n.flights ? ["fl"] : [],
		"sh",
		"lug",
		"group",
		"leader",
		"building",
		"rooms",
		...r,
		"other"
	], s = (e) => !n.hidden.includes(o[e]), c = [];
	for (let [o, l] of t) {
		o && (c.length && c.push(""), c.push(a(`${o} — ${je(l)}`))), c.push(i.filter((e, t) => s(t)).join(","));
		for (let t of l) {
			let i = O(t.checkin_date, t.checkin_time), o = O(t.checkout_date, t.checkout_time), l = [
				t.sh_no || "",
				n.luggage(t),
				t.tour_name || "",
				String(t.group_leader ?? "").trim() || "-",
				(t.building || "").trim(),
				Se(t).join(" "),
				...r.map((e) => B(t, e))
			], u = n.flights ? [n.flightText(t)] : [], d = e === "in" ? [
				j(i),
				...u,
				...l,
				j(o)
			] : [
				j(o),
				...u,
				...l,
				j(i)
			];
			c.push(d.filter((e, t) => s(t)).map(a).join(","));
		}
		let t = Ae(l), u = n.flights ? [""] : [];
		c.push([
			"Total",
			...u,
			"",
			"",
			`${t.n} slips`,
			"",
			"",
			"",
			...r.map((e) => t[e]),
			""
		].filter((e, t) => s(t)).map(a).join(","));
	}
	return c.join("\r\n");
}
var H = (e) => String(e ?? "").replace(/[&<>"']/g, (e) => ({
	"&": "&amp;",
	"<": "&lt;",
	">": "&gt;",
	"\"": "&quot;",
	"'": "&#39;"
})[e]);
function Ie(e, t, n, r, i, a = () => "", o = !1, s) {
	let c = t.some((e) => a(e)), l = s && s.length ? s : o ? [
		"t",
		"g",
		"l",
		"c",
		"i"
	] : ["t"], u = l.length > 1, d = (c ? 7 : 6) + l.length, f = (e) => l.map((t) => t === "t" ? `<td><b>${F(e)}</b></td>` : `<td>${B(e, t)}</td>`).join(""), p = `${e === "in" ? "Check-ins" : "Check-outs"} · ${r}`, m = t.reduce((e, t) => e + F(t), 0), ee = (e) => {
		let t = O(e.checkin_date, e.checkin_time), n = O(e.checkout_date, e.checkout_time);
		return `<tr><td>${H(e.sh_no ?? "")}</td>${c ? `<td>${H(a(e) || "-")}</td>` : ""}<td><b>${H(e.tour_name || "-")}</b><br><span class="gl">${H(String(e.group_leader ?? "").trim() || "-")}</span></td><td>${H((e.building || "").trim() || "-")}</td><td class="rooms">${P(e)}</td>${f(e)}<td>${H(j(t))}</td><td>${H(j(n))}</td></tr>`;
	}, te = `<thead><tr><th>SH No</th>${c ? "<th>First accommodation</th>" : ""}<th>Group / Group Leader</th><th>Building</th><th>Rooms</th>${l.map((e) => `<th>${e === "t" ? "Total Pax" : V[e]}</th>`).join("")}<th>Check-in</th><th>Check-out</th></tr></thead>`, ne = l.filter((e) => e !== "t").length, h = u ? `<colgroup><col style="width:7%">${c ? "<col style=\"width:9%\">" : ""}<col style="width:${c ? 18 : 22}%"><col style="width:9%"><col style="width:${(c ? 17 : 22) - 4 * (ne - 4)}%">${l.map((e) => `<col style="width:${e === "t" ? 6 : 4}%">`).join("")}<col style="width:9%"><col style="width:9%"></colgroup>` : c ? "<colgroup><col style=\"width:8%\"><col style=\"width:10%\"><col style=\"width:22%\"><col style=\"width:10%\"><col style=\"width:20%\"><col style=\"width:8%\"><col style=\"width:11%\"><col style=\"width:11%\"></colgroup>" : "<colgroup><col style=\"width:8%\"><col style=\"width:25%\"><col style=\"width:10%\"><col style=\"width:25%\"><col style=\"width:8%\"><col style=\"width:12%\"><col style=\"width:12%\"></colgroup>", g = (e) => {
		let t = Ae(e);
		return `<tfoot><tr class="tot"><td colspan="${c ? 5 : 4}">Total · ${t.n} group${t.n === 1 ? "" : "s"}</td>${l.map((e) => `<td>${t[e]}</td>`).join("")}<td colspan="2"></td></tr></tfoot>`;
	}, re = n.map(([e, t]) => (e ? `<h2>${H(e)} <small>${H(je(t))}</small></h2>` : "") + `<table>${h}${te}<tbody>${t.length ? t.map(ee).join("") : `<tr><td colspan="${d}">None in this range.</td></tr>`}</tbody>${u && t.length ? g(t) : ""}</table>`).join("");
	return `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><title>${H(p)}</title>
<style>
@page { size: A4 landscape; margin: 10mm; }
html, body { margin: 0; background: #fff; color: #000; font: 11px/1.3 Arial, Helvetica, sans-serif; }
body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
h1 { font-size: 15px; margin: 0 0 2px; text-align: center; }
h2 { font-size: 13px; margin: 10px 0 4px; break-after: avoid; page-break-after: avoid; }
h2 small { font-weight: normal; font-size: 11px; margin-left: 6px; }
.sub { text-align: center; font-size: 11px; margin: 0 0 6px; }
table { width: 100%; border-collapse: collapse; table-layout: fixed; }
th, td { border: 1px solid #000; padding: 3px 4px; text-align: center; vertical-align: middle; overflow-wrap: anywhere; }
th { background: #eee; font-size: 11px; }
thead { display: table-header-group; }
tr { break-inside: avoid; page-break-inside: avoid; }
td .gl { font-size: 10px; }
td.rooms { font-size: 10px; }
tr.tot td { background: #e8e8e8; font-weight: 700; border-top: 2px solid #000; }
.excl { display: inline-block; border: 1px solid #000; border-radius: 2px; padding: 0 2px; font-size: .85em; font-weight: 700; white-space: nowrap; }
.bar { position: sticky; top: 0; display: flex; gap: 10px; align-items: center; padding: 8px 12px; background: #fffaf1; border-bottom: 1px solid #dcc7a4; font: 13px system-ui, sans-serif; }
.bar button { font: inherit; padding: 5px 14px; border: 1px solid #d4af37; border-radius: 8px; background: #d4af37; color: #fff; font-weight: 700; cursor: pointer; }
@media screen { body { background: #e9e6df; } .page { width: 277mm; margin: 10mm auto; padding: 10mm; background: #fff; box-shadow: 0 4px 16px rgba(0,0,0,.15); } }
@media print { .bar { display: none; } }
</style></head>
<body>
<div class="bar"><button type="button" onclick="window.print()">Print</button><span>A4 landscape · 1 cm margins — choose A4 and Landscape if the printer asks</span></div>
<div class="page">
<h1>${H(p)}</h1>
<p class="sub">${H(i)} · ${t.length} group${t.length === 1 ? "" : "s"} · ${m} pax</p>
${re}
</div>
<script>
window.addEventListener('load', function () { setTimeout(function () { window.focus(); window.print(); }, 250); });
<\/script>
</body></html>`;
}
// src/pages/checkins/CheckinsPage.tsx
var U = {
	as: "As.",
	t: "T",
	g: "G",
	l: "L",
	c: "C",
	i: "I"
}, Le = (e) => [
	{
		id: "sh",
		label: "SH No"
	},
	{
		id: "lug",
		label: "First accommodation"
	},
	{
		id: "group",
		label: "Group"
	},
	{
		id: "leader",
		label: "Group Leader"
	},
	{
		id: "building",
		label: "Building"
	},
	{
		id: "rooms",
		label: "Rooms"
	},
	...z(e).map((e) => ({
		id: e,
		label: U[e],
		right: !0
	}))
], W = (e) => {
	let t = /* @__PURE__ */ new Date();
	return t.setDate(t.getDate() + e), k(t);
}, Re = (e) => !!(e.delayed && e.delayed.on);
function ze() {
	let { cloud: e, stay: t, ums: i, checkin: ee } = n(), h = a(), x = r(), { site: he, siteId: w } = s(), { href: ge } = o(), { prefs: _e } = me(), T = fe(12e4), [ve, ye] = (0, S.useState)(() => {
		try {
			return localStorage.getItem("pms_excl_building") === "1";
		} catch {
			return !1;
		}
	}), E = (e) => {
		try {
			localStorage.setItem("pms_excl_building", e ? "1" : "0");
		} catch {}
		ye(e);
	}, [M, xe] = (0, S.useState)(null);
	(0, S.useEffect)(() => {
		Promise.all([
			x("flights"),
			x("slip-print"),
			x("checkins-cols"),
			x("travel-mode"),
			x("transport")
		]).then(([e, t, n, r, i]) => xe({
			flights: e,
			slipPrint: t,
			colsMod: n,
			mode: r,
			transport: i
		}));
	}, []);
	let N = k(/* @__PURE__ */ new Date()), [P, Ee] = (0, S.useState)(N), [I, L] = (0, S.useState)(A(N)), [R, ke] = (0, S.useState)("03:00"), [B, V] = (0, S.useState)("03:00"), [Me, H] = (0, S.useState)(!1), [U, ze] = (0, S.useState)("both"), [G, Be] = (0, S.useState)("all"), [Ve, He] = (0, S.useState)("time"), [K, Ue] = (0, S.useState)(!!_e.checkinsSplit), [We, Ge] = (0, S.useState)(!1), [q, Ke] = (0, S.useState)(() => {
		try {
			return localStorage.getItem("pms_checkins_lug_col") === "1";
		} catch {
			return !1;
		}
	}), [qe, Je] = (0, S.useState)(/* @__PURE__ */ new Map()), [J, Ye] = (0, S.useState)(() => {
		try {
			return localStorage.getItem("pms_checkins_flight_col") === "1";
		} catch {
			return !1;
		}
	}), [Y, Xe] = (0, S.useState)({
		df: P,
		dt: I,
		tf: R,
		tt: B
	}), [Ze, Qe] = (0, S.useState)([]), [$e, et] = (0, S.useState)(""), [tt, nt] = (0, S.useState)(""), rt = {
		slip: e.canOpen("slip"),
		print: e.canOpen("print")
	}, it = w === "makkah" ? "medina" : "makkah", at = it === "medina" ? "Madina" : "Makkah";
	(0, S.useEffect)(() => {
		e.mirrorAll().then((e) => Qe(e.filter((e) => e.site === it))).catch(() => Qe([]));
	}, [w, T.dataUpdatedAt]);
	let ot = T.data ?? [], X = (0, S.useMemo)(() => {
		let e = /* @__PURE__ */ new Date(`${Y.df}T${Y.tf || "00:00"}`), n = /* @__PURE__ */ new Date(`${Y.dt}T${Y.tt || "23:59"}`);
		return n > e || (n = new Date(e.getTime() + 864e5)), {
			start: e,
			end: n,
			...Te(ot, e, n, t)
		};
	}, [
		ot,
		Y,
		t
	]), st = (0, S.useMemo)(() => Ne(ot), [ot]), ct = (e) => Pe(st, e.sh_no), lt = (0, S.useMemo)(() => [...new Set([...X.ins, ...X.outs].map((e) => String(e.building || "").trim()).filter(Boolean))].sort((e, t) => e.localeCompare(t, void 0, { numeric: !0 })), [X]), ut = (0, S.useMemo)(() => {
		let e = (e, t) => {
			let n = G === "all" ? e : e.filter((e) => String(e.building || "").trim() === G);
			return Ve === "building" ? [...n].sort((e, n) => String(e.building || "").trim().localeCompare(String(n.building || "").trim(), void 0, { numeric: !0 }) || t(e).localeCompare(t(n))) : n;
		};
		return {
			ins: e(X.ins, (e) => `${e.checkin_date}${e.checkin_time}`),
			outs: e(X.outs, (e) => `${e.checkout_date}${e.checkout_time}`)
		};
	}, [
		X,
		G,
		Ve
	]), dt = (e) => De(e, w, Ze, i.baseSh), Z = w === "medina", ft = (0, S.useMemo)(() => [...new Set([...X.ins, ...X.outs].map((e) => String(e.checkout_date || "")).filter(Boolean))].sort().slice(0, 40).join(","), [X]);
	(0, S.useEffect)(() => {
		if (!Z || !M || !ft) return;
		let e = !1;
		return Promise.all(ft.split(",").map((e) => M.transport.loadDay(w, e).then((e) => e.rows || [], () => []))).then((t) => {
			if (e) return;
			let n = /* @__PURE__ */ new Map();
			for (let e of t) {
				let t = M.transport.resolve(e);
				for (let r of e) {
					let e = i.baseSh(r.ref), a = t.get(r.key) || {};
					/ZIYARAT/i.test(String(a.route || r.route || "")) || e && !n.has(`${r.day}|${e}`) && n.set(`${r.day}|${e}`, {
						...r,
						route: a.route || r.route,
						bus: a.bus ?? r.bus,
						vehicle: a.vehicle || r.vehicle,
						vehicle_label: a.vlabel || r.vehicle_label
					});
				}
			}
			Je(n);
		}), () => {
			e = !0;
		};
	}, [
		Z,
		M,
		ft,
		w
	]);
	let [pt, mt] = (0, S.useState)(/* @__PURE__ */ new Map()), ht = (e) => {
		let [t, n, r] = e.split("-").map(Number);
		return k(new Date(t, n - 1, r - 1));
	}, gt = (0, S.useMemo)(() => [...new Set(X.ins.flatMap((e) => {
		let t = String(e.checkin_date || "");
		return t ? [t, ht(t)] : [];
	}))].sort().slice(0, 40).join(","), [X]);
	(0, S.useEffect)(() => {
		if (!Z || !M || !gt) return;
		let e = !1;
		return Promise.all(gt.split(",").map((e) => M.transport.loadDay("makkah", e).then((e) => e.rows || [], () => []))).then((t) => {
			if (e) return;
			let n = /* @__PURE__ */ new Map();
			for (let e of t) {
				let t = M.transport.resolve(e);
				for (let r of e) {
					let e = t.get(r.key) || {}, a = String(e.route || r.route || "");
					if (!/MADINA|MEDINA/i.test(a.split("-").slice(1).join("-")) || /AIRPORT|ZIYARAT/i.test(a)) continue;
					let o = i.baseSh(r.ref);
					o && !n.has(`${r.day}|${o}`) && n.set(`${r.day}|${o}`, {
						...r,
						route: a,
						bus: e.bus ?? r.bus,
						vehicle: e.vehicle || r.vehicle,
						vehicle_label: e.vlabel || r.vehicle_label
					});
				}
			}
			mt(n);
		}), () => {
			e = !0;
		};
	}, [
		Z,
		M,
		gt
	]);
	let _t = (e) => {
		let t = i.baseSh(e.sh_no), n = String(e.checkin_date || "");
		return pt.get(`${n}|${t}`) || pt.get(`${ht(n)}|${t}`);
	}, vt = (e) => {
		if (!M) return {
			mode: "",
			detail: ""
		};
		let t = _t(e);
		if (t) return {
			mode: M.mode.tripMode(t),
			detail: `from Makkah${t.at ? ` ${String(t.at).slice(11, 16)}` : ""}${t.bus != null && t.bus !== "" ? ` · ${M.transport.vehicleNo(t.bus, t.vehicle, t.vehicle_label)}` : ""}`
		};
		let n = M.mode.arriveMode(e), r = e.ums?.arrival, i = n.mode === "By flight" && r?.flight && !/^(CAR|BUS|TRAIN)\b/i.test(r.flight) ? String(r.flight).replace(/\s*-\s*$/, "") : "";
		return {
			mode: n.mode,
			detail: i || (n.src ? n.src === "ums" ? "UMS" : "slip" : "")
		};
	}, yt = (e) => w === "medina" ? e.map((e) => {
		let t = bt(e);
		return t ? {
			...e,
			_leave: M?.mode.tripMode(t)
		} : e;
	}) : e, bt = (e) => qe.get(`${e.checkout_date}|${i.baseSh(e.sh_no)}`), xt = (e) => M ? M.mode.leaveMode(e, bt(e)) : {
		mode: "",
		src: ""
	}, St = M ? M.colsMod.CHECKINS_COLS.map((e) => e[0]) : [], Ct = (e) => [...(_e[e === "in" ? "checkinsHideIn" : "checkinsHideOut"] || []).filter((e) => St.includes(e)), ...q ? [] : ["lug"]], wt = (e, t) => M ? dt(e)[t === "checkin" ? "from" : "to"] === "airport" ? {
		...M.flights.legOf(e, t === "checkin" ? "arr" : "dep"),
		dir: t === "checkin" ? "arr" : "dep"
	} : { kind: "city" } : { kind: "none" }, Tt = (e, t) => {
		let n = wt(e, t);
		return n.kind === "flight" ? n.code : n.kind === "road" ? `by ${(n.mode || "road").toLowerCase()}` : "";
	}, Et = (e, t) => Oe(e, t, K, dt, it, at), Q = `${Y.df} ${Y.tf} → ${Y.dt} ${Y.tt}`;
	function Dt(e) {
		let t = {
			df: P,
			dt: I,
			tf: R,
			tt: B,
			...e
		};
		if (!t.df || !t.dt) {
			alert("Pick both Date from and Date to.");
			return;
		}
		let n = /* @__PURE__ */ new Date(`${t.df}T${t.tf || "03:00"}`), r = /* @__PURE__ */ new Date(`${t.dt}T${t.tt || "03:00"}`);
		r > n || (r = new Date(n.getTime() + 864e5), t = {
			...t,
			dt: k(r),
			tt: `${String(r.getHours()).padStart(2, "0")}:${String(r.getMinutes()).padStart(2, "0")}`
		}, L(t.dt), V(t.tt), H(!1)), Xe(t);
	}
	let $ = (e, t) => {
		Ee(e), L(t), ke("03:00"), V("03:00"), H(!1), Dt({
			df: e,
			dt: t,
			tf: "03:00",
			tt: "03:00"
		});
	};
	async function Ot() {
		et("Getting data…");
		try {
			await T.refetch(), et("");
		} catch (e) {
			et("Could not load slips: " + (e?.message || e));
		}
	}
	async function kt(e, t) {
		nt(String(e.id));
		try {
			await ee.setCheckedIn(h, e, t), await T.refetch();
		} catch (e) {
			alert(e?.message || "Could not save the check-in.");
		} finally {
			nt("");
		}
	}
	let At = (e) => e === "in" ? ut.ins : ut.outs;
	function jt(e) {
		let t = Fe(e, Et(At(e), e === "in" ? "checkin" : "checkout"), {
			flights: J,
			hidden: Ct(e),
			flightText: (t) => Tt(t, e === "in" ? "checkin" : "checkout"),
			luggage: q ? ct : () => "",
			pax: z(w)
		}), n = document.createElement("a");
		n.href = URL.createObjectURL(new Blob([t], { type: "text/csv" })), n.download = `${e === "in" ? "checkins" : "checkouts"}_${Y.df}_${Y.dt}${K ? "_split" : ""}.csv`, document.body.appendChild(n), n.click(), n.remove(), URL.revokeObjectURL(n.href);
	}
	function Mt(e) {
		let t = At(e);
		if (!t.length) {
			alert("No rows to print in this table.");
			return;
		}
		let n = window.open("", "_blank");
		n ? (n.document.open(), n.document.write(Ie(e, t, Et(t, e === "in" ? "checkin" : "checkout"), he.label, Q, q ? ct : () => "", We, w === "medina" ? z(w).filter((t) => t === "t" || !Ct(e).includes(t)) : void 0)), n.document.close()) : alert("The browser blocked the new tab. Allow pop-ups for this site, then press Print table again.");
	}
	let Nt = (e, t) => {
		let n = M?.flights.checkLinks(e, t);
		if (!n) return null;
		let r = n.tripTab || !n.date;
		return /* @__PURE__ */ (0, C.jsxs)("span", {
			className: "flex flex-wrap gap-x-1 text-xs",
			children: [r && /* @__PURE__ */ (0, C.jsxs)(C.Fragment, { children: [/* @__PURE__ */ (0, C.jsx)("a", {
				className: "text-primary underline",
				href: n.trip,
				target: "_blank",
				rel: "noopener",
				title: `${e} on Trip.com${n.tripTab ? ` — tap the “${n.tripTab}” tab` : ""}`,
				children: "Check 1"
			}), " · "] }), /* @__PURE__ */ (0, C.jsx)("a", {
				className: "text-primary underline",
				href: n.fa,
				target: "_blank",
				rel: "noopener",
				title: `${n.ident} on FlightAware${n.dateLabel ? ` — ${n.dateLabel}` : ""}`,
				children: "Check 2"
			})]
		});
	}, Pt = (e, t) => {
		let n = wt(e, t);
		return n.kind === "city" ? /* @__PURE__ */ (0, C.jsxs)("span", {
			className: "text-xs text-muted-foreground",
			children: [
				t === "checkin" ? "from" : "to",
				" ",
				at
			]
		}) : n.kind === "road" ? /* @__PURE__ */ (0, C.jsxs)("span", {
			className: "text-xs text-muted-foreground",
			children: ["by ", String(n.mode || "road").toLowerCase()]
		}) : n.kind === "flight" ? /* @__PURE__ */ (0, C.jsx)("span", {
			title: n.code,
			children: Nt(n.code, {
				dir: n.dir,
				date: n.leg?.date
			})
		}) : /* @__PURE__ */ (0, C.jsx)("span", {
			className: "text-xs text-muted-foreground",
			children: "—"
		});
	}, Ft = (e, t) => {
		switch (t) {
			case "sh": return e.sh_no || "";
			case "lug": return ct(e);
			case "group": return /* @__PURE__ */ (0, C.jsxs)(C.Fragment, { children: [e.tour_name || "", Re(e) && /* @__PURE__ */ (0, C.jsxs)(pe, {
				variant: "outline",
				className: "ml-1.5 text-warn",
				title: e.delayed.note || "",
				children: [
					"Delayed · ",
					e._dep ? e._dep.status : e.delayed.status || "",
					e._dep && !e._dep.last ? " · part" : ""
				]
			})] });
			case "leader": return String(e.group_leader ?? "").trim() || "-";
			case "building": return (e.building || "").trim();
			case "rooms": return Se(e).map((e, t) => {
				let n = Ce(e);
				return /* @__PURE__ */ (0, C.jsxs)("span", {
					className: "whitespace-nowrap",
					children: [
						t ? ", " : "",
						n.room,
						n.tag && /* @__PURE__ */ (0, C.jsx)("span", {
							className: "ml-1 rounded border border-foreground px-1 text-[0.8em] font-bold",
							title: "Exclusive room — this group has the whole room",
							children: n.tag
						})
					]
				}, t);
			});
			case "as": return we(e);
			case "t": return F(e);
			case "g": return D(e.gents);
			case "l": return D(e.ladies);
			case "c": return D(e.children ?? e.child);
			case "i": return D(e.infants ?? e.infant);
		}
		return "";
	};
	function It(e) {
		let t = e === "in" ? "checkin" : "checkout", n = At(e), r = Ct(e), i = Le(w).filter((e) => !r.includes(e.id)), a = !r.includes("other"), o = !r.includes("slip") && rt.slip, s = Z, c = s ? (() => {
			let e = i.findIndex((e) => e.id === "group");
			if (e >= 0) return e + 1;
			let t = i.findIndex((e) => e.id === "leader");
			return t >= 0 ? t : 0;
		})() : -1, l = (t, n) => (() => {
			let r = bt(t), i = xt(t);
			return /* @__PURE__ */ (0, C.jsxs)(y, {
				className: "whitespace-nowrap",
				children: [e === "in" && j(n), /* @__PURE__ */ (0, C.jsxs)("span", {
					className: de(e === "in" ? "block text-xs" : "text-sm"),
					children: [i.mode ? /* @__PURE__ */ (0, C.jsx)("b", { children: i.mode }) : /* @__PURE__ */ (0, C.jsx)("span", {
						className: "text-muted-foreground",
						children: "mode not known"
					}), r ? /* @__PURE__ */ (0, C.jsxs)("span", {
						className: "text-muted-foreground",
						children: [
							" · ",
							!/ZIYARAT/i.test(String(r.route || "")) && String(t.to_place || "").trim() ? String(t.to_place).trim().toUpperCase() : String(r.route || "").split("-").slice(1).join("-"),
							r.at ? ` ${String(r.at).slice(11, 16)}` : "",
							r.bus != null && r.bus !== "" ? ` · ${M?.transport.vehicleNo(r.bus, r.vehicle, r.vehicle_label)}` : ""
						]
					}) : i.src && /* @__PURE__ */ (0, C.jsxs)("span", {
						className: "text-muted-foreground",
						children: [" · ", i.src === "ums" ? "UMS" : "slip"]
					})]
				})]
			});
		})(), u = (e, t) => c < 0 ? e : [
			...e.slice(0, c),
			t,
			...e.slice(c)
		], d = 1 + +!!J + i.length + +!!a + +!!o + +(e === "in") + +!!s, f = /* @__PURE__ */ (0, C.jsxs)(b, { children: [
			/* @__PURE__ */ (0, C.jsx)(v, { children: e === "in" ? "Check-in" : "Check-out" }),
			J && /* @__PURE__ */ (0, C.jsx)(v, { children: "Flight" }),
			u(i.map((e) => /* @__PURE__ */ (0, C.jsx)(v, {
				className: de(e.right && "text-right"),
				children: e.label
			}, e.id)), /* @__PURE__ */ (0, C.jsx)(v, {
				className: "whitespace-nowrap",
				children: e === "in" ? /* @__PURE__ */ (0, C.jsx)(C.Fragment, { children: "Check-out & transport" }) : "Transport"
			}, "out")),
			a && /* @__PURE__ */ (0, C.jsx)(v, {
				className: "whitespace-nowrap",
				children: e === "in" ? "Check-out" : "Check-in"
			}),
			o && /* @__PURE__ */ (0, C.jsx)(v, { children: "Slip" }),
			e === "in" && /* @__PURE__ */ (0, C.jsx)(v, { children: "Status" })
		] }), p = (t, n, r) => {
			let s = Ae(t), c = {
				as: s.as,
				t: s.t,
				g: s.g,
				l: s.l,
				c: s.c,
				i: s.i
			};
			return /* @__PURE__ */ (0, C.jsxs)(b, {
				className: r,
				children: [
					/* @__PURE__ */ (0, C.jsx)(y, {
						className: "font-bold",
						children: n
					}),
					J && /* @__PURE__ */ (0, C.jsx)(y, {}),
					u(i.map((e) => /* @__PURE__ */ (0, C.jsx)(y, {
						className: de(e.right && "text-right", "font-bold"),
						children: e.id === "group" ? `${s.n} slip${s.n === 1 ? "" : "s"}` : c[e.id] ?? ""
					}, e.id)), /* @__PURE__ */ (0, C.jsx)(y, {}, "out")),
					a && /* @__PURE__ */ (0, C.jsx)(y, {}),
					o && /* @__PURE__ */ (0, C.jsx)(y, {}),
					e === "in" && /* @__PURE__ */ (0, C.jsx)(y, {})
				]
			});
		};
		return /* @__PURE__ */ (0, C.jsxs)(ue, { children: [
			!K && /* @__PURE__ */ (0, C.jsx)(le, { children: f }),
			Et(n, t).map(([n, r], s) => /* @__PURE__ */ (0, C.jsxs)(ce, { children: [
				n && /* @__PURE__ */ (0, C.jsxs)(C.Fragment, { children: [
					/* @__PURE__ */ (0, C.jsx)(b, {
						className: "bg-secondary",
						children: /* @__PURE__ */ (0, C.jsxs)(y, {
							colSpan: d,
							className: "font-bold",
							children: [n, /* @__PURE__ */ (0, C.jsx)("small", {
								className: "ml-2 font-normal text-muted-foreground",
								children: je(r)
							})]
						})
					}),
					/* @__PURE__ */ (0, C.jsx)(b, {
						className: "bg-muted/60",
						children: f.props.children
					}),
					!r.length && /* @__PURE__ */ (0, C.jsx)(b, { children: /* @__PURE__ */ (0, C.jsx)(y, {
						colSpan: d,
						className: "text-muted-foreground",
						children: "None in this range."
					}) })
				] }),
				r.map((n, r) => {
					let s = O(n.checkin_date, n.checkin_time), c = O(n.checkout_date, n.checkout_time), d = String(n.sh_no || "").trim();
					return /* @__PURE__ */ (0, C.jsxs)(b, { children: [
						/* @__PURE__ */ (0, C.jsxs)(y, {
							className: "whitespace-nowrap",
							children: [j(e === "in" ? s : c), e === "in" && Z && (() => {
								let e = vt(n);
								return /* @__PURE__ */ (0, C.jsxs)("span", {
									className: "block text-xs",
									children: [e.mode ? /* @__PURE__ */ (0, C.jsx)("b", { children: e.mode }) : /* @__PURE__ */ (0, C.jsx)("span", {
										className: "text-muted-foreground",
										children: "mode not known"
									}), e.detail && /* @__PURE__ */ (0, C.jsxs)("span", {
										className: "text-muted-foreground",
										children: [" · ", e.detail]
									})]
								});
							})()]
						}),
						J && /* @__PURE__ */ (0, C.jsx)(y, { children: Pt(n, t) }),
						u(i.map((e) => /* @__PURE__ */ (0, C.jsx)(y, {
							className: de(e.right && "text-right"),
							children: Ft(n, e.id)
						}, e.id)), /* @__PURE__ */ (0, C.jsx)(S.Fragment, { children: l(n, c) }, "out")),
						a && /* @__PURE__ */ (0, C.jsx)(y, {
							className: "whitespace-nowrap",
							children: j(e === "in" ? c : s)
						}),
						o && /* @__PURE__ */ (0, C.jsx)(y, { children: d ? /* @__PURE__ */ (0, C.jsx)("a", {
							className: "rounded border border-gold bg-accent px-2 py-0.5 text-xs font-bold text-primary",
							href: ge("slip", { sh_no: d }),
							target: "_blank",
							rel: "noopener",
							children: "Open"
						}) : /* @__PURE__ */ (0, C.jsx)("span", {
							className: "text-muted-foreground",
							title: "No SH number",
							children: "Open"
						}) }),
						e === "in" && /* @__PURE__ */ (0, C.jsx)(y, {
							className: "whitespace-nowrap",
							children: ee.isCheckedIn(n) ? /* @__PURE__ */ (0, C.jsxs)(C.Fragment, { children: [/* @__PURE__ */ (0, C.jsx)("span", {
								className: "rounded-full bg-ok-soft px-2 py-0.5 text-xs font-bold text-ok",
								children: "✓ Checked in"
							}), !h.readonly && /* @__PURE__ */ (0, C.jsx)("button", {
								type: "button",
								disabled: tt === String(n.id),
								className: "ml-1 text-xs text-muted-foreground underline",
								title: "Undo: the group has not checked in",
								onClick: () => void kt(n, !1),
								children: "Undo"
							})] }) : h.readonly ? /* @__PURE__ */ (0, C.jsx)("span", {
								className: "rounded-full bg-muted px-2 py-0.5 text-xs",
								children: "—"
							}) : /* @__PURE__ */ (0, C.jsx)(g, {
								size: "sm",
								variant: "outline",
								disabled: tt === String(n.id),
								onClick: () => void kt(n, !0),
								children: "Check in"
							})
						})
					] }, `${n.id}-${r}`);
				}),
				n && r.length > 0 && p(r, "Subtotal", "bg-muted/60")
			] }, s)),
			/* @__PURE__ */ (0, C.jsx)(se, { children: p(n, "Total", "bg-accent") })
		] });
	}
	function Lt(e) {
		let t = At(e);
		return /* @__PURE__ */ (0, C.jsxs)(oe, {
			className: "gap-0 py-0",
			children: [/* @__PURE__ */ (0, C.jsxs)(ae, {
				className: "flex-row flex-wrap items-center justify-between gap-2 border-b py-3 print:hidden",
				children: [/* @__PURE__ */ (0, C.jsx)(re, {
					className: "text-base",
					children: e === "in" ? "Check-ins" : "Check-outs"
				}), /* @__PURE__ */ (0, C.jsxs)("div", {
					className: "flex flex-wrap items-center gap-2",
					children: [
						/* @__PURE__ */ (0, C.jsxs)("span", {
							className: "text-sm text-muted-foreground",
							children: [
								t.length,
								" slips • ",
								t.reduce((e, t) => e + F(t), 0),
								" guests"
							]
						}),
						/* @__PURE__ */ (0, C.jsxs)(g, {
							size: "sm",
							variant: "outline",
							onClick: () => jt(e),
							children: [/* @__PURE__ */ (0, C.jsx)(te, { className: "size-3.5" }), "Export CSV"]
						}),
						/* @__PURE__ */ (0, C.jsxs)(g, {
							size: "sm",
							variant: "outline",
							onClick: () => Mt(e),
							children: [/* @__PURE__ */ (0, C.jsx)(ne, { className: "size-3.5" }), "Print table"]
						}),
						w !== "medina" && /* @__PURE__ */ (0, C.jsxs)("label", {
							className: "flex items-center gap-1.5 text-sm",
							title: "Print table adds Gents, Ladies, Children and Infants columns, with totals",
							children: [/* @__PURE__ */ (0, C.jsx)("input", {
								type: "checkbox",
								checked: We,
								onChange: (e) => Ge(e.target.checked)
							}), "G L C I"]
						}),
						/* @__PURE__ */ (0, C.jsxs)("label", {
							className: "flex items-center gap-1.5 text-sm",
							title: "Exclusive rooms show only 'Excl' unless this is ticked (table, printed table and printed slips)",
							children: [/* @__PURE__ */ (0, C.jsx)("input", {
								type: "checkbox",
								checked: ve,
								onChange: (e) => E(e.target.checked)
							}), "show building on Excl rooms"]
						}),
						rt.print && M && /* @__PURE__ */ (0, C.jsxs)(C.Fragment, { children: [
							/* @__PURE__ */ (0, C.jsx)(g, {
								size: "sm",
								title: "Print every slip in this table (A5, like Print slips)",
								onClick: () => M.slipPrint.printSlips(yt(t), { title: `check-${e}s ${Q}` }),
								children: "Print slips"
							}),
							/* @__PURE__ */ (0, C.jsx)(g, {
								size: "sm",
								title: "The A4 itinerary letter of every slip in this table (S-prefix slips left out: they got theirs on the first leg)",
								onClick: () => M.slipPrint.printItineraries(t.filter((e) => !/^S/i.test(String(e.sh_no ?? "").trim())), T.data ?? [], { title: `check-${e}s ${Q}` }),
								children: "Print itinerary"
							}),
							/* @__PURE__ */ (0, C.jsx)(g, {
								size: "sm",
								title: "Each slip as an A5 picture to send to its group leader",
								onClick: () => M.slipPrint.openGlCopies(yt(t), { title: `check-${e}s ${Q}` }),
								children: "GL copy"
							})
						] })
					]
				})]
			}), /* @__PURE__ */ (0, C.jsx)(ie, {
				className: "overflow-x-auto p-0",
				children: It(e)
			})]
		});
	}
	return /* @__PURE__ */ (0, C.jsxs)("div", {
		className: "mx-auto grid grid-cols-[minmax(0,1fr)] max-w-[2400px] min-w-0 gap-3 px-3 pb-10 pt-4 sm:px-4",
		children: [
			/* @__PURE__ */ (0, C.jsx)(be, {
				cloud: e,
				siteId: w
			}),
			/* @__PURE__ */ (0, C.jsxs)("header", {
				className: "grid gap-3 print:hidden",
				children: [
					/* @__PURE__ */ (0, C.jsxs)("div", { children: [/* @__PURE__ */ (0, C.jsx)("h1", {
						className: "text-2xl font-bold text-primary",
						children: "Check-ins & Check-outs"
					}), /* @__PURE__ */ (0, C.jsx)("p", {
						className: "text-sm text-muted-foreground",
						children: "Filter by single day or a date/time range. Results are read-only and come from the shared PMS data."
					})] }),
					/* @__PURE__ */ (0, C.jsxs)("div", {
						className: "grid grid-cols-2 items-end gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-8",
						children: [
							/* @__PURE__ */ (0, C.jsxs)("div", {
								className: "grid gap-1",
								children: [/* @__PURE__ */ (0, C.jsx)(m, {
									htmlFor: "dateFrom",
									children: "Date from"
								}), /* @__PURE__ */ (0, C.jsx)(_, {
									id: "dateFrom",
									type: "date",
									value: P,
									onChange: (e) => {
										Ee(e.target.value), e.target.value && !Me && L(A(e.target.value));
									}
								})]
							}),
							/* @__PURE__ */ (0, C.jsxs)("div", {
								className: "grid gap-1",
								children: [/* @__PURE__ */ (0, C.jsx)(m, {
									htmlFor: "dateTo",
									children: "Date to"
								}), /* @__PURE__ */ (0, C.jsx)(_, {
									id: "dateTo",
									type: "date",
									value: I,
									onChange: (e) => {
										L(e.target.value), H(!0);
									}
								})]
							}),
							/* @__PURE__ */ (0, C.jsxs)("div", {
								className: "grid gap-1",
								children: [/* @__PURE__ */ (0, C.jsx)(m, {
									htmlFor: "timeFrom",
									children: "Time from"
								}), /* @__PURE__ */ (0, C.jsx)(_, {
									id: "timeFrom",
									type: "time",
									step: 60,
									value: R,
									onChange: (e) => ke(e.target.value)
								})]
							}),
							/* @__PURE__ */ (0, C.jsxs)("div", {
								className: "grid gap-1",
								children: [/* @__PURE__ */ (0, C.jsx)(m, {
									htmlFor: "timeTo",
									children: "Time to"
								}), /* @__PURE__ */ (0, C.jsx)(_, {
									id: "timeTo",
									type: "time",
									step: 60,
									value: B,
									onChange: (e) => V(e.target.value)
								})]
							}),
							/* @__PURE__ */ (0, C.jsxs)("div", {
								className: "grid gap-1",
								children: [/* @__PURE__ */ (0, C.jsx)(m, {
									htmlFor: "mode",
									children: "Mode"
								}), /* @__PURE__ */ (0, C.jsxs)(f, {
									value: U,
									onValueChange: ze,
									children: [/* @__PURE__ */ (0, C.jsx)(l, {
										id: "mode",
										className: "w-full",
										children: /* @__PURE__ */ (0, C.jsx)(c, {})
									}), /* @__PURE__ */ (0, C.jsxs)(u, { children: [
										/* @__PURE__ */ (0, C.jsx)(d, {
											value: "both",
											children: "Both"
										}),
										/* @__PURE__ */ (0, C.jsx)(d, {
											value: "in",
											children: "Check-ins"
										}),
										/* @__PURE__ */ (0, C.jsx)(d, {
											value: "out",
											children: "Check-outs"
										})
									] })]
								})]
							}),
							/* @__PURE__ */ (0, C.jsxs)("div", {
								className: "grid gap-1",
								children: [/* @__PURE__ */ (0, C.jsx)(m, {
									htmlFor: "bld",
									children: "Building"
								}), /* @__PURE__ */ (0, C.jsxs)(f, {
									value: G,
									onValueChange: Be,
									children: [/* @__PURE__ */ (0, C.jsx)(l, {
										id: "bld",
										className: "w-full",
										children: /* @__PURE__ */ (0, C.jsx)(c, {})
									}), /* @__PURE__ */ (0, C.jsxs)(u, { children: [/* @__PURE__ */ (0, C.jsx)(d, {
										value: "all",
										children: "All buildings"
									}), lt.map((e) => /* @__PURE__ */ (0, C.jsx)(d, {
										value: e,
										children: e
									}, e))] })]
								})]
							}),
							/* @__PURE__ */ (0, C.jsxs)("div", {
								className: "grid gap-1",
								children: [/* @__PURE__ */ (0, C.jsx)(m, {
									htmlFor: "sortby",
									children: "Sort by"
								}), /* @__PURE__ */ (0, C.jsxs)(f, {
									value: Ve,
									onValueChange: He,
									children: [/* @__PURE__ */ (0, C.jsx)(l, {
										id: "sortby",
										className: "w-full",
										children: /* @__PURE__ */ (0, C.jsx)(c, {})
									}), /* @__PURE__ */ (0, C.jsxs)(u, { children: [/* @__PURE__ */ (0, C.jsx)(d, {
										value: "time",
										children: "Time"
									}), /* @__PURE__ */ (0, C.jsx)(d, {
										value: "building",
										children: "Building, then time"
									})] })]
								})]
							}),
							/* @__PURE__ */ (0, C.jsxs)("div", {
								className: "grid gap-1.5 text-sm",
								children: [
									/* @__PURE__ */ (0, C.jsx)(m, { children: "View" }),
									/* @__PURE__ */ (0, C.jsxs)("label", {
										className: "flex items-center gap-2",
										title: "Check-ins: from the airport / from the other city · Check-outs: to the airport / to the other city",
										children: [/* @__PURE__ */ (0, C.jsx)(p, {
											checked: K,
											onCheckedChange: (e) => Ue(e === !0)
										}), "Split by from / to"]
									}),
									/* @__PURE__ */ (0, C.jsxs)("label", {
										className: "flex items-center gap-2",
										title: "Check 1 (Trip.com) and Check 2 (FlightAware) links for each group's flight",
										children: [/* @__PURE__ */ (0, C.jsx)(p, {
											checked: J,
											onCheckedChange: (e) => {
												Ye(e === !0);
												try {
													localStorage.setItem("pms_checkins_flight_col", e === !0 ? "1" : "0");
												} catch {}
											}
										}), "Flight status"]
									}),
									/* @__PURE__ */ (0, C.jsxs)("label", {
										className: "flex items-center gap-2",
										title: "Show where each S-prefixed group's first stay (and its luggage) was",
										children: [/* @__PURE__ */ (0, C.jsx)(p, {
											checked: q,
											onCheckedChange: (e) => {
												Ke(e === !0);
												try {
													localStorage.setItem("pms_checkins_lug_col", e === !0 ? "1" : "0");
												} catch {}
											}
										}), "First accommodation"]
									})
								]
							})
						]
					}),
					/* @__PURE__ */ (0, C.jsxs)("div", {
						className: "flex flex-wrap items-center gap-2",
						children: [
							[
								["Today", () => {
									let e = k(/* @__PURE__ */ new Date());
									$(e, A(e));
								}],
								["Yesterday", () => {
									let e = W(-1);
									$(e, A(e));
								}],
								["Tomorrow", () => {
									let e = W(1);
									$(e, A(e));
								}],
								["Last 7 days", () => $(W(-6), A(k(/* @__PURE__ */ new Date())))],
								["Last 30 days", () => $(W(-29), A(k(/* @__PURE__ */ new Date())))]
							].map(([e, t]) => /* @__PURE__ */ (0, C.jsx)(g, {
								variant: "outline",
								size: "sm",
								onClick: t,
								children: e
							}, e)),
							/* @__PURE__ */ (0, C.jsx)(g, {
								onClick: () => {
									Dt(), Ot();
								},
								children: "Get Data"
							}),
							/* @__PURE__ */ (0, C.jsx)("span", {
								className: "text-xs text-muted-foreground",
								children: $e || `Range ${Q} • ${T.data?.length ?? 0} slip(s) in DB`
							})
						]
					})
				]
			}),
			T.isLoading && /* @__PURE__ */ (0, C.jsx)("p", {
				className: "text-sm text-muted-foreground",
				children: "Loading…"
			}),
			(U === "in" || U === "both") && Lt("in"),
			(U === "out" || U === "both") && Lt("out")
		]
	});
}
export { ze as default };
