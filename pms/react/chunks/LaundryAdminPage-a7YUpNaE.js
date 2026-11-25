import { f as e, h as t, i as n, n as r, o as i, p as a, u as o } from "./PmsContext-BVMd13Oi.js";
import { a as s, i as c, n as l, o as u, r as d, t as f } from "./dialog-DtgtvZ4Q.js";
import { t as p } from "./checkbox-C3tIiLfF.js";
import { i as m, n as h, r as g, t as _ } from "./tabs-IQDmk0rj.js";
import { t as v } from "./label-CMEyi--P.js";
import { t as y } from "./button-BGWa3SLr.js";
import { i as b, n as x, r as S, t as C } from "./card-B9_OGomP.js";
import { t as w } from "./input-DSBk_UeU.js";
import { a as T, i as E, n as D, o as O, r as k, s as A, t as j } from "./table-DKR1WqRT.js";
import { t as M } from "./utils-b7UP9Cmo.js";
import { t as ee } from "./ConfirmDialog-GfriOiUy.js";
import { t as N } from "./PromptDialog-D_1ik4AU.js";
import { t as P } from "./badge-EB7Muw37.js";
import { t as te } from "./textarea-BxHERF6b.js";
import { t as F } from "./PageHeader-DKvzTuZm.js";
// src/pages/laundry-admin/la.tsx
var I = /* @__PURE__ */ t(a(), 1), L = e(), R = (0, I.createContext)(null), ne = R.Provider, z = () => {
	let e = (0, I.useContext)(R);
	if (!e) throw Error("LaProvider missing");
	return e;
}, B = ({ e }) => /* @__PURE__ */ (0, L.jsx)("p", {
	className: "text-sm text-destructive",
	children: e?.message || String(e)
});
function V({ icon: e, value: t, label: n, tone: r }) {
	return /* @__PURE__ */ (0, L.jsxs)("div", {
		className: "grid min-w-28 gap-0.5 rounded-xl border bg-card px-3 py-2",
		children: [
			/* @__PURE__ */ (0, L.jsx)("span", {
				"aria-hidden": !0,
				children: e
			}),
			/* @__PURE__ */ (0, L.jsx)("b", {
				className: M("text-xl", r?.includes("neg") && "text-destructive"),
				children: t
			}),
			/* @__PURE__ */ (0, L.jsx)("small", {
				className: "text-xs text-muted-foreground",
				children: n
			})
		]
	});
}
function H({ item: e, cls: t = "la-ipic" }) {
	let { libs: n } = z(), r = n.laundry.itemPic(e, t);
	return /* @__PURE__ */ (0, L.jsx)("span", {
		className: "inline-block align-middle [&_img]:size-10 [&_img]:rounded-md [&_img]:object-cover [&_.la-ipic]:inline-grid [&_.la-ipic]:size-10 [&_.la-ipic]:place-items-center [&_.la-ipic]:text-2xl",
		dangerouslySetInnerHTML: { __html: r }
	});
}
function U({ value: e, onChange: t }) {
	let { presets: n } = z(), r = n();
	return /* @__PURE__ */ (0, L.jsxs)("div", {
		className: "flex flex-wrap items-center gap-1.5",
		children: [Object.entries(r).map(([n, [r, i, a]]) => /* @__PURE__ */ (0, L.jsx)(y, {
			size: "sm",
			variant: e.preset === n ? "default" : "outline",
			"aria-pressed": e.preset === n,
			onClick: () => t({
				preset: n,
				from: i,
				to: a
			}),
			children: r
		}, n)), /* @__PURE__ */ (0, L.jsxs)("span", {
			className: "flex items-center gap-1.5",
			children: [
				/* @__PURE__ */ (0, L.jsx)(w, {
					type: "date",
					className: "h-8 w-auto",
					value: e.from,
					onChange: (n) => {
						let r = n.target.value || e.from;
						t({
							preset: "custom",
							from: r,
							to: e.to < r ? r : e.to
						});
					}
				}),
				" →",
				/* @__PURE__ */ (0, L.jsx)(w, {
					type: "date",
					className: "h-8 w-auto",
					value: e.to,
					onChange: (n) => {
						let r = n.target.value || e.to;
						t({
							preset: "custom",
							from: e.from,
							to: r < e.from ? e.from : r
						});
					}
				})
			]
		})]
	});
}
function W(e) {
	let { presets: t } = z(), [n, r] = (0, I.useState)(() => {
		let n = t();
		return {
			preset: e,
			from: n[e][1],
			to: n[e][2]
		};
	});
	return [n, r];
}
function G({ rows: e, unit: t = "SAR" }) {
	let { libs: n } = z();
	if (!e.length) return /* @__PURE__ */ (0, L.jsx)("p", {
		className: "text-sm text-muted-foreground",
		children: "Nothing in this period."
	});
	let r = Math.max(1, ...e.map((e) => e.value));
	return /* @__PURE__ */ (0, L.jsx)("div", {
		className: "grid gap-1",
		children: e.map((e, i) => /* @__PURE__ */ (0, L.jsxs)("div", {
			title: e.note,
			className: "grid grid-cols-[minmax(5rem,10rem)_1fr_4.5rem] items-center gap-2 text-sm",
			children: [
				/* @__PURE__ */ (0, L.jsx)("span", {
					className: "truncate",
					children: e.label
				}),
				/* @__PURE__ */ (0, L.jsx)("span", {
					className: "h-3 rounded bg-muted",
					children: /* @__PURE__ */ (0, L.jsx)("i", {
						className: "block h-full rounded bg-primary",
						style: { width: `${(e.value / r * 100).toFixed(1)}%` }
					})
				}),
				/* @__PURE__ */ (0, L.jsx)("b", {
					className: "text-right",
					children: t === "SAR" ? n.sar(Math.round(e.value * 100)) : e.value
				})
			]
		}, i))
	});
}
function re(e, t) {
	let [n, r] = (0, I.useState)(null), [i, a] = (0, I.useState)(null), [o, s] = (0, I.useState)(0);
	return (0, I.useEffect)(() => {
		let t = !0;
		return a(null), e().then((e) => t && r(e)).catch((e) => t && a(e)), () => {
			t = !1;
		};
	}, [...t, o]), {
		data: n,
		err: i,
		reload: () => s((e) => e + 1),
		loading: !n && !i,
		set: r
	};
}
var K = () => /* @__PURE__ */ (0, L.jsx)("p", {
	className: "text-sm text-muted-foreground",
	children: "Loading…"
}), q = 864e5, ie = (e) => {
	let t = (t, n) => e(Date.parse(t + "T12:00:00+03:00") + n * q), n = (e) => new Date(Date.parse(e + "T12:00:00+03:00")).getUTCDay();
	return {
		addDays: t,
		fmtDay: (e) => (/* @__PURE__ */ new Date(e + "T12:00:00+03:00")).toLocaleDateString("en-GB", {
			weekday: "short",
			day: "2-digit",
			month: "short"
		}),
		presets: () => {
			let r = e(), i = t(r, -n(r)), a = r.slice(0, 8) + "01", o = t(a, -1), s = o.slice(0, 8) + "01";
			return {
				today: [
					"Today",
					r,
					r
				],
				yesterday: [
					"Yesterday",
					t(r, -1),
					t(r, -1)
				],
				week: [
					"This week",
					i,
					r
				],
				lastweek: [
					"Last week",
					t(i, -7),
					t(i, -1)
				],
				month: [
					"This month",
					a,
					r
				],
				lastmonth: [
					"Last month",
					s,
					o
				]
			};
		}
	};
};
function J(e) {
	let t = e.filter((e) => !e.voided && e.kind !== "building"), n = t.filter((e) => e.kind === "paid"), r = t.filter((e) => e.kind === "free"), i = (e, t) => e.reduce((e, n) => e + t(n), 0), a = (e) => `${String(e.customer?.room || "").toUpperCase()}|${String(e.customer?.name || "").toLowerCase()}`, o = /* @__PURE__ */ new Map();
	for (let e of t) {
		let t = o.get(e.worker) || {
			worker: e.worker,
			bills: 0,
			items: 0,
			cash: 0,
			card: 0,
			other: 0,
			total: 0,
			free_bills: 0,
			free_items: 0,
			free_value: 0
		};
		e.kind === "paid" ? (t.bills++, t.items += e.items, t[e.method] = (t[e.method] || 0) + e.paid, t.total += e.paid) : (t.free_bills++, t.free_items += e.items, t.free_value += e.value), o.set(e.worker, t);
	}
	let s = /* @__PURE__ */ new Map();
	for (let e of t) for (let t of e.lines) {
		let n = s.get(t.name) || {
			name: t.name,
			qty: 0,
			revenue: 0,
			free_qty: 0,
			free_value: 0
		};
		e.kind === "paid" ? (n.qty += t.qty, n.revenue += t.amount) : (n.free_qty += t.qty, n.free_value += t.amount), s.set(t.name, n);
	}
	let c = /* @__PURE__ */ new Map();
	for (let e of r) {
		let t = c.get(e.staff_id) || {
			staff_id: e.staff_id,
			name: e.staff_name,
			bills: 0,
			items: 0,
			value: 0
		};
		t.bills++, t.items += e.items, t.value += e.value, c.set(e.staff_id, t);
	}
	let l = /* @__PURE__ */ new Map();
	for (let e of t) {
		let t = l.get(e.day) || {
			day: e.day,
			sales: 0,
			bills: 0,
			items: 0,
			free_items: 0,
			free_value: 0,
			customers: /* @__PURE__ */ new Set()
		};
		e.kind === "paid" ? (t.sales += e.paid, t.bills++, t.items += e.items, t.customers.add(a(e))) : (t.free_items += e.items, t.free_value += e.value), l.set(e.day, t);
	}
	return {
		paid: {
			customers: new Set(n.map(a)).size,
			bills: n.length,
			items: i(n, (e) => e.items),
			sales: i(n, (e) => e.paid),
			cash: i(n.filter((e) => e.method === "cash"), (e) => e.paid),
			card: i(n.filter((e) => e.method === "card"), (e) => e.paid),
			other: i(n.filter((e) => e.method === "other"), (e) => e.paid)
		},
		free: {
			staff: new Set(r.map((e) => e.staff_id)).size,
			bills: r.length,
			items: i(r, (e) => e.items),
			value: i(r, (e) => e.value)
		},
		voided: e.filter((e) => e.voided).length,
		workers: [...o.values()].sort((e, t) => t.total - e.total),
		items: [...s.values()].sort((e, t) => t.qty + t.free_qty - (e.qty + e.free_qty)),
		staff: [...c.values()].sort((e, t) => t.value - e.value),
		days: [...l.values()].sort((e, t) => e.day.localeCompare(t.day))
	};
}
var ae = (e, t) => [
	t.per_bill_items && `${t.per_bill_items}/submission`,
	t.per_day_items && `${t.per_day_items}/day`,
	t.per_week_items && `${t.per_week_items}/week`,
	t.per_month_value && `${e(t.per_month_value)} SAR/month`,
	t.per_month_bills && `${t.per_month_bills} times/month`
].filter(Boolean).join(", ") + (t.enforce ? " (approval needed above)" : " (warning only)"), Y = (e) => e.from === e.to ? e.from : `${e.from}_to_${e.to}`, X = (e, t) => t.map((t) => ({
	Date: t.day,
	Time: e.jeddahTime(t.given_at),
	Receipt: t.receipt_no,
	Type: t.kind === "free" ? "Free (staff)" : "Paid",
	Customer: t.kind === "free" ? t.staff_name : t.customer?.name || "",
	Room: t.customer?.room || "",
	Group: t.customer?.group || "",
	Items: t.items,
	"Item list": t.lines.map((e) => `${e.name} x${e.qty}`).join(", "),
	"Value SAR": t.value / 100,
	"Paid SAR": t.paid / 100,
	Payment: t.method || "",
	Worker: t.worker,
	Status: t.voided ? "Cancelled" : "",
	"Cancel reason": t.void_reason || ""
}));
async function oe(e, { r: t, bills: n, s: r }) {
	await e.lib.loadScript(e.lib.LIBS.xlsx);
	let i = window.XLSX, a = i.utils.book_new(), o = [
		["Laundry report", `${t.from} to ${t.to}`],
		[],
		["NORMAL LAUNDRY"],
		["Customers", r.paid.customers],
		["Bills", r.paid.bills],
		["Items", r.paid.items],
		["Sales SAR", r.paid.sales / 100],
		["Cash SAR", r.paid.cash / 100],
		["Card SAR", r.paid.card / 100],
		["Other SAR", r.paid.other / 100],
		[],
		["FREE STAFF LAUNDRY"],
		["Staff", r.free.staff],
		["Bills", r.free.bills],
		["Items", r.free.items],
		["Laundry value SAR", r.free.value / 100],
		["Collected SAR", 0],
		[],
		["TOTAL ITEMS PROCESSED", r.paid.items + r.free.items],
		["ACTUAL CASH RECEIVED SAR", r.paid.cash / 100]
	];
	i.utils.book_append_sheet(a, i.utils.aoa_to_sheet(o), "Summary"), i.utils.book_append_sheet(a, i.utils.json_to_sheet(X(e, n)), "Transactions"), i.utils.book_append_sheet(a, i.utils.json_to_sheet(r.workers.map((e) => ({
		Worker: e.worker,
		Bills: e.bills,
		Items: e.items,
		"Cash SAR": (e.cash || 0) / 100,
		"Card SAR": (e.card || 0) / 100,
		"Other SAR": (e.other || 0) / 100,
		"Collection SAR": e.total / 100,
		"Free bills": e.free_bills,
		"Free items": e.free_items,
		"Free value SAR": e.free_value / 100
	}))), "Workers"), i.utils.book_append_sheet(a, i.utils.json_to_sheet(r.items.map((e) => ({
		Item: e.name,
		"Paid qty": e.qty,
		"Revenue SAR": e.revenue / 100,
		"Free qty": e.free_qty,
		"Free value SAR": e.free_value / 100
	}))), "Items"), i.utils.book_append_sheet(a, i.utils.json_to_sheet(r.staff.map((e) => ({
		Staff: e.name,
		"Free bills": e.bills,
		Items: e.items,
		"Value SAR": e.value / 100
	}))), "Free laundry"), i.writeFile(a, `Laundry Report – ${Y(t)}.xlsx`);
}
async function Z(e, { r: t, bills: n, s: r }) {
	let { sar: i } = e;
	await e.lib.loadScript(e.lib.LIBS.jspdf), await e.lib.loadScript(e.lib.LIBS.autotable);
	let a = new window.jspdf.jsPDF({
		orientation: "landscape",
		unit: "mm",
		format: "a4"
	});
	a.setFontSize(14), a.text(`MOHAMMEDI MAKAN — Laundry Report ${t.from === t.to ? t.from : `${t.from} to ${t.to}`}`, 14, 14), a.setFontSize(10), a.text(`Normal: ${r.paid.customers} customers · ${r.paid.bills} bills · ${r.paid.items} items · sales ${i(r.paid.sales)} SAR (cash ${i(r.paid.cash)}, card ${i(r.paid.card)}, other ${i(r.paid.other)})`, 14, 21), a.text(`Free staff laundry: ${r.free.staff} staff · ${r.free.bills} bills · ${r.free.items} items · value ${i(r.free.value)} SAR · collected 0`, 14, 26), a.text(`Total items processed: ${r.paid.items + r.free.items} · Actual cash received: ${i(r.paid.cash)} SAR`, 14, 31), a.autoTable({
		startY: 35,
		head: [[
			"Worker",
			"Bills",
			"Items",
			"Cash",
			"Card",
			"Other",
			"Collection",
			"Free bills/items/value"
		]],
		body: r.workers.map((e) => [
			e.worker,
			e.bills,
			e.items,
			i(e.cash || 0),
			i(e.card || 0),
			i(e.other || 0),
			i(e.total),
			`${e.free_bills} / ${e.free_items} / ${i(e.free_value)}`
		]),
		styles: { fontSize: 8 }
	}), a.autoTable({
		startY: a.lastAutoTable.finalY + 6,
		head: [[
			"Item",
			"Paid qty",
			"Revenue",
			"Free qty",
			"Free value"
		]],
		body: r.items.map((e) => [
			e.name,
			e.qty,
			i(e.revenue),
			e.free_qty,
			i(e.free_value)
		]),
		styles: { fontSize: 8 }
	}), a.autoTable({
		startY: a.lastAutoTable.finalY + 6,
		head: [[
			"Date",
			"Time",
			"Receipt",
			"Type",
			"Customer / staff",
			"Room",
			"Items",
			"Value",
			"Paid",
			"Payment",
			"Worker",
			"Status"
		]],
		body: X(e, n).map((e) => [
			e.Date,
			e.Time,
			e.Receipt,
			e.Type,
			e.Customer,
			e.Room,
			e.Items,
			e["Value SAR"],
			e["Paid SAR"],
			e.Payment,
			e.Worker,
			e.Status
		]),
		styles: { fontSize: 7 }
	}), a.save(`Laundry ${t.from === t.to ? "Daily " : ""}Report – ${Y(t)}.pdf`);
}
async function se(e, t) {
	await e.lib.loadScript(e.lib.LIBS.xlsx);
	let n = window.XLSX, r = n.utils.book_new(), { r: i, live: a, names: o, byItem: s, days: c } = t;
	n.utils.book_append_sheet(r, n.utils.json_to_sheet(o.map((e) => ({
		Item: e,
		Pieces: s.get(e) || 0
	}))), "Items"), n.utils.book_append_sheet(r, n.utils.json_to_sheet(c.map((e) => ({
		Day: e.day,
		...Object.fromEntries(o.map((t) => [t, e.items.get(t) || 0])),
		Pieces: e.pieces,
		Entries: e.entries
	}))), "Days"), n.utils.book_append_sheet(r, n.utils.json_to_sheet(a.map((t) => ({
		Date: t.day,
		Time: e.jeddahTime(t.given_at),
		Receipt: t.receipt_no,
		...Object.fromEntries(o.map((e) => [e, t.lines.filter((t) => t.name === e).reduce((e, t) => e + t.qty, 0)])),
		Pieces: t.items,
		Worker: t.worker
	}))), "Entries"), n.writeFile(r, `Building Linen – ${Y(i)}.xlsx`);
}
// src/pages/laundry-admin/staffprint.ts
var Q = (e) => String(e ?? "").replace(/[&<>"']/g, (e) => ({
	"&": "&amp;",
	"<": "&lt;",
	">": "&gt;",
	"\"": "&quot;",
	"'": "&#39;"
})[e]), ce = (e) => (e / 100).toLocaleString("en-US", {
	minimumFractionDigits: 2,
	maximumFractionDigits: 2
}), le = (e) => new Date(e).toLocaleString("en-GB", {
	timeZone: "Asia/Riyadh",
	day: "numeric",
	month: "long",
	year: "numeric",
	hour: "2-digit",
	minute: "2-digit"
}), ue = (e) => (/* @__PURE__ */ new Date(`${e}T12:00`)).toLocaleDateString("en-GB", {
	weekday: "short",
	day: "numeric",
	month: "short",
	year: "numeric"
}), de = "<link rel=\"preconnect\" href=\"https://fonts.googleapis.com\"><link rel=\"preconnect\" href=\"https://fonts.gstatic.com\" crossorigin>\n<link href=\"https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,700;9..144,900&family=Inter:wght@400;500;600;700&display=swap\" rel=\"stylesheet\">", fe = "* { box-sizing: border-box; } html, body { margin: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }\nbody { font: 10pt/1.45 Inter, \"Segoe UI\", Arial, sans-serif; color: #1c1917; background: #efe9dc; }\n.sheet { background: #fffdf8; margin: 0 auto; position: relative; overflow: hidden; }\n@media screen { .sheet { margin: 16px auto; box-shadow: 0 10px 40px #0003; } }\n.band { position: relative; color: #fff; background: radial-gradient(130% 160% at 100% 0%, #8a6a1f 0%, #0b1020 58%); overflow: hidden; }\n.band::after { content: \"\"; position: absolute; right: -18mm; bottom: -26mm; width: 70mm; height: 70mm; border-radius: 50%; border: 1px solid #ffffff2e; box-shadow: 0 0 0 7mm #ffffff09, 0 0 0 14mm #ffffff06; }\n.eyebrow { font: 600 7.5pt Inter, sans-serif; letter-spacing: .34em; text-transform: uppercase; color: #f5d78e; }\n.band h1 { font: 900 22pt/1.05 Fraunces, Georgia, serif; margin: 2mm 0 1mm; }\n.gold { height: 2px; background: linear-gradient(90deg, #f5d78e, transparent); margin-top: 4mm; width: 40mm; }\n.lbl { font: 600 7pt Inter, sans-serif; letter-spacing: .16em; text-transform: uppercase; color: #8b8378; }\n.val { font: 700 12pt Fraunces, Georgia, serif; color: #0b1020; }\ntable.t { width: 100%; border-collapse: collapse; }\ntable.t th { font: 700 7pt Inter, sans-serif; letter-spacing: .1em; text-transform: uppercase; color: #fff; background: #0b1020; padding: 2mm 2.5mm; text-align: left; }\ntable.t td { padding: 1.8mm 2.5mm; border-bottom: 1px solid #e7e0d2; }\ntable.t tbody tr:nth-child(even) td { background: #faf6ee; }\ntable.t .n { text-align: right; font-variant-numeric: tabular-nums; }\n.stamp { display: inline-block; padding: 1mm 4mm; border: 2px solid currentColor; border-radius: 2mm; font: 900 12pt Fraunces, Georgia, serif; letter-spacing: .12em; transform: rotate(-6deg); }\n.stamp.paid { color: #0a7a3a; } .stamp.unpaid { color: #b91c1c; }\n.sign { display: grid; grid-template-columns: 1fr 1fr; gap: 10mm; margin-top: 12mm; } .sign div { border-top: 1px solid #1c1917; padding-top: 1.5mm; font-size: 8pt; color: #57534e; }", pe = (e) => (e.lines || []).map((e) => `<tr><td>${Q(e.name)}</td><td class="n">${e.qty}</td><td class="n">${ce(e.price)}</td><td class="n"><b>${ce(e.amount)}</b></td></tr>`).join(""), me = (e) => e.staff_name || e.customer?.name || "Staff";
function he(e, t) {
	let n = !!e.settled_at;
	return `<!doctype html><html><head><meta charset="utf-8"><title>${Q(e.receipt_no)}</title>${de}<style>@page { size: A5 portrait; margin: 0; } ${fe}
.sheet { width: 148mm; min-height: 209mm; padding: 0 0 9mm; } .band { padding: 10mm 10mm 9mm; } .body { padding: 0 10mm; }
.no { font: 800 13pt/1.1 "JetBrains Mono", Consolas, monospace; color: #fde7b0; letter-spacing: .02em; word-break: break-all; }
.card { margin: -6mm 0 5mm; position: relative; z-index: 1; background: #fff; border-radius: 3mm; box-shadow: 0 2mm 6mm #0b10201f; padding: 4mm 5mm; display: grid; grid-template-columns: 1.4fr 1fr; gap: 3mm 6mm; border-top: 1.2mm solid #b8912f; }
.tot { display: flex; align-items: center; justify-content: space-between; margin: 5mm 0 0; padding: 4mm 5mm; border-radius: 3mm; background: #0b1020; color: #fff; }
.tot b { font: 900 20pt Fraunces, Georgia, serif; color: #f5d78e; } .tot span { font: 600 8pt Inter, sans-serif; letter-spacing: .2em; text-transform: uppercase; }
.meta { display: flex; justify-content: space-between; align-items: center; margin-top: 5mm; }
.foot { margin: 8mm 10mm 0; font-size: 7pt; color: #a8a29e; text-align: center; letter-spacing: .08em; }</style></head><body>
<div class="sheet"><div class="band"><div class="eyebrow">Mohammedi Makan · ${Q(t)} · Laundry</div><h1>Staff Laundry Invoice</h1><div class="no">${Q(e.receipt_no)}</div><div class="gold"></div></div>
<div class="body"><div class="card"><div><div class="lbl">Billed to</div><div class="val">${Q(me(e))}</div></div><div><div class="lbl">Room</div><div class="val">${Q(e.customer?.room || "—")}</div></div>
<div><div class="lbl">Date</div><div class="val" style="font-size:10pt">${Q(le(e.given_at || e.created_at))}</div></div><div><div class="lbl">Pieces</div><div class="val">${e.items}</div></div></div>
<table class="t"><thead><tr><th>Item</th><th class="n">Qty</th><th class="n">Rate SAR</th><th class="n">Amount SAR</th></tr></thead><tbody>${pe(e)}</tbody></table>
<div class="tot"><span>Total due · 1 SAR a piece</span><b>${ce(e.paid)} SAR</b></div>
<div class="meta"><span class="stamp ${n ? "paid" : "unpaid"}">${n ? "PAID" : "UNPAID"}</span><span style="font-size:8pt;color:#57534e">${n ? `Paid ${Q(le(e.settled_at))}${e.settled_by ? " · " + Q(e.settled_by) : ""}` : `Taken by ${Q(e.worker || "")}`}</span></div>
<div class="sign"><div>Staff signature</div><div>Laundry admin</div></div></div>
<div class="foot">Thank you · Keep this invoice until it is settled</div></div></body></html>`;
}
function ge(e, t) {
	let n = /* @__PURE__ */ new Map();
	for (let t of e) {
		let e = `${t.staff_id}`;
		n.set(e, [...n.get(e) || [], t]);
	}
	let r = [...n.values()].map((e) => ({
		name: me(e[0]),
		room: e[0].customer?.room || "",
		list: [...e].sort((e, t) => e.given_at.localeCompare(t.given_at))
	})).sort((e, t) => e.name.localeCompare(t.name)), i = e.reduce((e, t) => e + t.paid, 0), a = e.reduce((e, t) => e + t.items, 0), o = (/* @__PURE__ */ new Date()).toLocaleString("en-GB", {
		timeZone: "Asia/Riyadh",
		day: "numeric",
		month: "long",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit"
	});
	return `<!doctype html><html><head><meta charset="utf-8"><title>Unpaid staff laundry · ${Q(t)}</title>${de}<style>@page { size: A4 portrait; margin: 12mm 12mm 14mm; } ${fe}
.sheet { max-width: 186mm; padding: 0 0 8mm; } .band { padding: 13mm 12mm 12mm; } .band h1 { font-size: 30pt; } .body { padding: 0 12mm; }
.kpis { display: grid; grid-template-columns: repeat(3, 1fr); gap: 3mm; margin: -7mm 0 7mm; position: relative; z-index: 1; }
.kpi { background: #fff; border-radius: 3mm; box-shadow: 0 2mm 6mm #0b10201f; padding: 4mm; border-top: 1.2mm solid #b8912f; } .kpi b { display: block; font: 800 20pt/1.1 Fraunces, Georgia, serif; color: #0b1020; }
.person { break-inside: avoid; margin: 0 0 7mm; border: 1px solid #e7e0d2; border-radius: 3mm; overflow: hidden; }
.ph { display: flex; justify-content: space-between; align-items: baseline; padding: 3mm 4mm; background: linear-gradient(90deg, #f5ecd7, #fffdf8); border-bottom: 1px solid #e7e0d2; }
.ph h2 { margin: 0; font: 800 14pt Fraunces, Georgia, serif; color: #0b1020; } .ph span { color: #57534e; font-size: 8.5pt; }
.ph b { font: 800 13pt Fraunces, Georgia, serif; color: #8a6a1f; }
.grand { display: flex; justify-content: space-between; align-items: center; padding: 5mm 6mm; border-radius: 3mm; background: #0b1020; color: #fff; margin-top: 4mm; break-inside: avoid; }
.grand b { font: 900 24pt Fraunces, Georgia, serif; color: #f5d78e; } .grand span { font: 600 8pt Inter, sans-serif; letter-spacing: .22em; text-transform: uppercase; }
.foot { margin: 8mm 12mm 0; padding-top: 3mm; border-top: 1px solid #e7e0d2; display: flex; justify-content: space-between; font-size: 7.5pt; color: #a8a29e; }</style></head><body>
<div class="sheet"><div class="band"><div class="eyebrow">Mohammedi Makan · ${Q(t)} · Laundry</div><h1>Unpaid Staff Laundry</h1><div style="font:500 12pt Fraunces,Georgia,serif;color:#fde7b0">Statement as of ${Q(o)}</div><div class="gold"></div></div>
<div class="body"><div class="kpis"><div class="kpi"><b>${ce(i)}</b><span class="lbl">SAR due</span></div><div class="kpi"><b>${r.length}</b><span class="lbl">Staff</span></div><div class="kpi"><b>${a}</b><span class="lbl">Pieces · ${e.length} bills</span></div></div>
${r.map((e) => `<div class="person"><div class="ph"><div><h2>${Q(e.name)}</h2><span>${e.room ? "Room " + Q(e.room) + " · " : ""}${e.list.length} bill${e.list.length === 1 ? "" : "s"} · ${e.list.reduce((e, t) => e + t.items, 0)} pieces</span></div><b>${ce(e.list.reduce((e, t) => e + t.paid, 0))} SAR</b></div>
<table class="t"><thead><tr><th>Receipt</th><th>Date</th><th class="n">Pieces</th><th class="n">SAR</th></tr></thead><tbody>${e.list.map((e) => `<tr><td style="font-family:Consolas,monospace;font-size:8.5pt">${Q(e.receipt_no)}</td><td>${Q(ue(e.day))}</td><td class="n">${e.items}</td><td class="n"><b>${ce(e.paid)}</b></td></tr>`).join("")}</tbody></table></div>`).join("") || "<p>No unpaid staff bills.</p>"}
<div class="grand"><span>Grand total due</span><b>${ce(i)} SAR</b></div>
<div class="sign"><div>Prepared by</div><div>Laundry admin</div></div></div>
<div class="foot"><span>Staff laundry · 1 SAR a piece</span><span>${Q(t)}</span></div></div></body></html>`;
}
function _e(e) {
	let t = window.open("", "_blank");
	return t ? (t.document.open(), t.document.write(e.replace("</body>", "<script>(async function(){try{await document.fonts.ready}catch(e){}setTimeout(function(){window.focus();window.print()},400)})()<\/script></body>")), t.document.close(), !0) : !1;
}
// src/pages/laundry-admin/tabs.tsx
var ve = (e) => `${e} bill${e === 1 ? "" : "s"}`, ye = ({ children: e }) => /* @__PURE__ */ (0, L.jsx)("span", {
	className: "font-mono text-xs",
	children: e
}), be = ({ children: e }) => /* @__PURE__ */ (0, L.jsx)("small", {
	className: "block text-xs text-muted-foreground",
	children: e
}), xe = "cursor-pointer hover:bg-accent/50";
function Se(e) {
	return e.kind === "paid" && e.staff_id ? `👷 ${e.staff_name || e.customer?.name || ""}${e.customer?.room ? " · Room " + e.customer.room : ""} · 💵 staff` : e.kind === "free" ? `👷 ${e.staff_name}` : e.kind === "building" ? `🏨 Building linen${e.customer?.building ? " · " + e.customer.building : ""}` : [e.customer?.building, e.customer?.room].filter(Boolean).join(" · ") || e.customer?.name || "—";
}
function Ce({ id: e, cls: t = "size-9" }) {
	let { staff: n } = z(), r = n.find((t) => t.id === e);
	return r?.photo ? /* @__PURE__ */ (0, L.jsx)("img", {
		className: M(t, "inline-block rounded-full object-cover align-middle"),
		src: r.photo,
		alt: ""
	}) : /* @__PURE__ */ (0, L.jsx)("span", {
		className: M(t, "inline-grid place-items-center rounded-full bg-muted align-middle"),
		children: "👤"
	});
}
function we({ s: e }) {
	let { libs: t } = z(), n = t.sar;
	return /* @__PURE__ */ (0, L.jsxs)(L.Fragment, { children: [/* @__PURE__ */ (0, L.jsxs)("div", {
		className: "grid gap-3 lg:grid-cols-2",
		children: [/* @__PURE__ */ (0, L.jsxs)(C, { children: [/* @__PURE__ */ (0, L.jsx)(S, { children: /* @__PURE__ */ (0, L.jsx)(b, {
			className: "text-base",
			children: "🧺 Normal laundry (paid)"
		}) }), /* @__PURE__ */ (0, L.jsxs)(x, {
			className: "flex flex-wrap gap-2",
			children: [
				/* @__PURE__ */ (0, L.jsx)(V, {
					icon: "🙂",
					value: e.paid.customers,
					label: "customers"
				}),
				/* @__PURE__ */ (0, L.jsx)(V, {
					icon: "🧾",
					value: e.paid.bills,
					label: "bills"
				}),
				/* @__PURE__ */ (0, L.jsx)(V, {
					icon: "👕",
					value: e.paid.items,
					label: "items"
				}),
				/* @__PURE__ */ (0, L.jsx)(V, {
					icon: "💰",
					value: n(e.paid.sales),
					label: "sales SAR",
					tone: "big"
				}),
				/* @__PURE__ */ (0, L.jsx)(V, {
					icon: "💵",
					value: n(e.paid.cash),
					label: "cash SAR"
				}),
				/* @__PURE__ */ (0, L.jsx)(V, {
					icon: "💳",
					value: n(e.paid.card),
					label: "card SAR"
				}),
				e.paid.other ? /* @__PURE__ */ (0, L.jsx)(V, {
					icon: "🔁",
					value: n(e.paid.other),
					label: "other SAR"
				}) : null
			]
		})] }), /* @__PURE__ */ (0, L.jsxs)(C, { children: [/* @__PURE__ */ (0, L.jsx)(S, { children: /* @__PURE__ */ (0, L.jsx)(b, {
			className: "text-base",
			children: "👷 Staff only laundry"
		}) }), /* @__PURE__ */ (0, L.jsxs)(x, {
			className: "flex flex-wrap gap-2",
			children: [
				/* @__PURE__ */ (0, L.jsx)(V, {
					icon: "👤",
					value: e.free.staff,
					label: "staff"
				}),
				/* @__PURE__ */ (0, L.jsx)(V, {
					icon: "🧾",
					value: e.free.bills,
					label: "bills"
				}),
				/* @__PURE__ */ (0, L.jsx)(V, {
					icon: "👕",
					value: e.free.items,
					label: "items"
				}),
				/* @__PURE__ */ (0, L.jsx)(V, {
					icon: "🏷️",
					value: n(e.free.value),
					label: "laundry value SAR",
					tone: "big"
				}),
				/* @__PURE__ */ (0, L.jsx)(V, {
					icon: "💵",
					value: 0,
					label: "collected SAR"
				})
			]
		})] })]
	}), /* @__PURE__ */ (0, L.jsxs)(C, {
		className: "p-3 text-sm",
		children: [
			/* @__PURE__ */ (0, L.jsx)("b", { children: "Total laundry activity:" }),
			" ",
			e.paid.items + e.free.items,
			" items processed (",
			e.paid.items,
			" paid + ",
			e.free.items,
			" free) · ",
			/* @__PURE__ */ (0, L.jsxs)("b", { children: [
				"Actual cash received: ",
				n(e.paid.cash),
				" SAR"
			] }),
			e.voided ? /* @__PURE__ */ (0, L.jsxs)("span", {
				className: "text-muted-foreground",
				children: [
					" · ",
					e.voided,
					" cancelled bill",
					e.voided === 1 ? "" : "s",
					" not counted"
				]
			}) : null
		]
	})] });
}
function Te() {
	let [e, t] = (0, I.useState)("guest");
	return /* @__PURE__ */ (0, L.jsxs)(_, {
		value: e,
		onValueChange: (e) => t(e),
		children: [
			/* @__PURE__ */ (0, L.jsxs)(g, { children: [/* @__PURE__ */ (0, L.jsx)(m, {
				value: "guest",
				children: "🚪 Guests"
			}), /* @__PURE__ */ (0, L.jsx)(m, {
				value: "staff",
				children: "👷 Staff"
			})] }),
			/* @__PURE__ */ (0, L.jsx)(h, {
				value: "guest",
				children: /* @__PURE__ */ (0, L.jsx)(Ee, { who: "guest" })
			}),
			/* @__PURE__ */ (0, L.jsx)(h, {
				value: "staff",
				children: /* @__PURE__ */ (0, L.jsx)(Ee, { who: "staff" })
			})
		]
	});
}
function Ee({ who: e = "guest" }) {
	let { api: t, canPay: n, libs: r, fmtDay: i, indexBills: a, billIndex: o, site: s, confirm: c, openBill: l } = z(), u = e === "staff", d = s === "medina" ? "Madina" : "Makkah", { sar: f, jeddahDay: m, jeddahTime: h, jeddahDate: g } = r, [_, b] = (0, I.useState)(null), [x, S] = (0, I.useState)(m()), [C, E] = (0, I.useState)(/* @__PURE__ */ new Set()), [ee, N] = (0, I.useState)(""), [te, F] = (0, I.useState)(""), [R, ne] = (0, I.useState)(!0), { data: H, err: U, reload: W, set: G } = re(async () => {
		let e = _;
		if (e === null) {
			try {
				e = (await t("GET", `/api/laundry/oldest-unpaid?site=${s}`)).day || r.addDays(m(), -6);
			} catch {
				e = r.addDays(m(), -6);
			}
			b(e);
		}
		let n = (await t("GET", `/api/laundry/bills?site=${s}&from=${e}&to=${x}&kind=paid&all=1`)).bills.filter((e) => !e.voided && (u ? !!e.staff_id : !e.staff_id)).sort((e, t) => e.given_at.localeCompare(t.given_at));
		return a(n), E((e) => new Set([...e].filter((e) => n.some((t) => t.id === e && !t.settled_at)))), n;
	}, [_, x]);
	if (U) return /* @__PURE__ */ (0, L.jsx)(B, { e: U });
	if (!H) return /* @__PURE__ */ (0, L.jsx)(K, {});
	let q = H.filter((e) => !e.settled_at), ie = H.filter((e) => e.settled_at), J = (e) => e.reduce((e, t) => e + t.paid, 0), ae = q.filter((e) => C.has(e.id)), Y = R ? [...q, ...ie] : H;
	async function X(e, n = !0) {
		let r = H.filter((t) => e.includes(t.id));
		if (r.length && await c({
			title: n ? `Mark ${r.length} bill${r.length === 1 ? "" : "s"} PAID?` : "Mark UNPAID again?",
			confirmLabel: n ? "Mark paid" : "Mark unpaid",
			body: n ? `${f(r.reduce((e, t) => e + t.paid, 0))} SAR received from the worker.` : r.map((e) => e.receipt_no).join(", ")
		})) try {
			let r = await t("POST", "/api/laundry/settle", {
				ids: e,
				paid: n
			});
			G(H.map((e) => r.bills.find((t) => t.id === e.id) || e));
			for (let e of r.bills) o.current.set(e.id, e);
			E((t) => {
				let n = new Set(t);
				return e.forEach((e) => n.delete(e)), n;
			});
		} catch (e) {
			F(e.message);
		}
	}
	function oe() {
		let e = Math.round(Number(ee) * 100);
		if (!(e > 0)) {
			F("Enter the amount collected (SAR).");
			return;
		}
		let t = /* @__PURE__ */ new Set(), n = e;
		for (let e of q) e.paid <= n && (t.add(e.id), n -= e.paid);
		E(t), F(n ? `${f(e - n)} SAR selected; ${f(n)} SAR of the amount does not match a whole bill.` : "");
	}
	return /* @__PURE__ */ (0, L.jsxs)("div", {
		className: "grid gap-3",
		children: [
			/* @__PURE__ */ (0, L.jsxs)("div", {
				className: "flex flex-wrap items-end gap-3",
				children: [
					/* @__PURE__ */ (0, L.jsxs)("div", {
						className: "grid gap-1",
						children: [/* @__PURE__ */ (0, L.jsx)(v, { children: "From" }), /* @__PURE__ */ (0, L.jsx)(w, {
							type: "date",
							value: _ ?? "",
							onChange: (e) => {
								let t = e.target.value || m();
								b(t), x < t && S(t);
							}
						})]
					}),
					/* @__PURE__ */ (0, L.jsxs)("div", {
						className: "grid gap-1",
						children: [/* @__PURE__ */ (0, L.jsx)(v, { children: "To" }), /* @__PURE__ */ (0, L.jsx)(w, {
							type: "date",
							value: x,
							onChange: (e) => {
								let t = e.target.value || _ || m();
								S(t), _ && t < _ && b(t);
							}
						})]
					}),
					/* @__PURE__ */ (0, L.jsx)(y, {
						variant: "outline",
						onClick: W,
						children: "Refresh"
					}),
					/* @__PURE__ */ (0, L.jsxs)(v, {
						className: "gap-2",
						children: [/* @__PURE__ */ (0, L.jsx)(p, {
							checked: R,
							onCheckedChange: (e) => ne(e === !0)
						}), "Unpaid first"]
					})
				]
			}),
			/* @__PURE__ */ (0, L.jsxs)("div", {
				className: "flex flex-wrap gap-2",
				children: [
					/* @__PURE__ */ (0, L.jsx)(V, {
						icon: "⏳",
						value: f(J(q)),
						label: `unpaid SAR · ${ve(q.length)}`,
						tone: "bigneg"
					}),
					/* @__PURE__ */ (0, L.jsx)(V, {
						icon: "✅",
						value: f(J(ie)),
						label: `paid SAR · ${ve(ie.length)}`,
						tone: "big"
					}),
					/* @__PURE__ */ (0, L.jsx)(V, {
						icon: "🧾",
						value: f(J(H)),
						label: `cash SAR · ${ve(H.length)}`
					})
				]
			}),
			n && /* @__PURE__ */ (0, L.jsxs)("div", {
				className: "flex flex-wrap items-center gap-2 rounded-xl border bg-card p-2",
				children: [
					/* @__PURE__ */ (0, L.jsx)(y, {
						size: "sm",
						variant: "outline",
						onClick: () => E(q.length && ae.length === q.length ? /* @__PURE__ */ new Set() : new Set(q.map((e) => e.id))),
						children: q.length && ae.length === q.length ? "☐ Clear selection" : "☑ Select all unpaid"
					}),
					/* @__PURE__ */ (0, L.jsxs)(v, {
						className: "flex items-center gap-1.5",
						children: ["Amount collected ", /* @__PURE__ */ (0, L.jsx)(w, {
							type: "number",
							min: 0,
							step: .5,
							placeholder: "SAR",
							className: "h-8 w-28",
							value: ee,
							onChange: (e) => N(e.target.value)
						})]
					}),
					/* @__PURE__ */ (0, L.jsx)(y, {
						size: "sm",
						variant: "outline",
						onClick: oe,
						children: "Select bills for this amount"
					}),
					/* @__PURE__ */ (0, L.jsxs)("span", {
						className: "ml-auto text-sm font-bold",
						children: [
							ae.length,
							" selected · ",
							f(J(ae)),
							" SAR"
						]
					}),
					/* @__PURE__ */ (0, L.jsx)(y, {
						size: "sm",
						disabled: !ae.length,
						onClick: () => void X([...C]),
						children: "✔ Mark selected paid"
					})
				]
			}),
			u && /* @__PURE__ */ (0, L.jsxs)("div", {
				className: "flex flex-wrap items-center gap-2",
				children: [/* @__PURE__ */ (0, L.jsxs)(y, {
					variant: "outline",
					disabled: !q.length,
					onClick: () => {
						_e(ge(q, d)) || F("Allow pop-ups to print.");
					},
					children: [
						"🖨 Print all unpaid (",
						q.length,
						")"
					]
				}), /* @__PURE__ */ (0, L.jsx)("small", {
					className: "text-muted-foreground",
					children: "One A4 statement, person by person · or 🖨 on a bill for its own invoice."
				})]
			}),
			te && /* @__PURE__ */ (0, L.jsx)("p", {
				className: "text-sm text-muted-foreground",
				children: te
			}),
			H.length ? /* @__PURE__ */ (0, L.jsxs)(j, { children: [/* @__PURE__ */ (0, L.jsx)(O, { children: /* @__PURE__ */ (0, L.jsxs)(A, { children: [
				n && /* @__PURE__ */ (0, L.jsx)(T, {}),
				/* @__PURE__ */ (0, L.jsx)(T, { children: "Date" }),
				/* @__PURE__ */ (0, L.jsx)(T, { children: "Time" }),
				/* @__PURE__ */ (0, L.jsx)(T, { children: "Receipt" }),
				/* @__PURE__ */ (0, L.jsx)(T, { children: u ? "Staff · room" : "Building · room" }),
				/* @__PURE__ */ (0, L.jsx)(T, {
					className: "text-right",
					children: "Items"
				}),
				/* @__PURE__ */ (0, L.jsx)(T, {
					className: "text-right",
					children: "Amount SAR"
				}),
				/* @__PURE__ */ (0, L.jsx)(T, { children: "Worker" }),
				/* @__PURE__ */ (0, L.jsx)(T, { children: "Status" }),
				n && /* @__PURE__ */ (0, L.jsx)(T, {}),
				u && /* @__PURE__ */ (0, L.jsx)(T, {})
			] }) }), /* @__PURE__ */ (0, L.jsx)(D, { children: Y.map((e) => /* @__PURE__ */ (0, L.jsxs)(A, {
				className: M(xe, e.settled_at ? "" : "bg-warn-soft/30", C.has(e.id) && "bg-accent"),
				onClick: () => l(e),
				children: [
					n && /* @__PURE__ */ (0, L.jsx)(k, {
						onClick: (e) => e.stopPropagation(),
						children: !e.settled_at && /* @__PURE__ */ (0, L.jsx)(p, {
							"aria-label": `Select ${e.receipt_no}`,
							checked: C.has(e.id),
							onCheckedChange: (t) => E((n) => {
								let r = new Set(n);
								return t === !0 ? r.add(e.id) : r.delete(e.id), r;
							})
						})
					}),
					/* @__PURE__ */ (0, L.jsx)(k, { children: i(e.day) }),
					/* @__PURE__ */ (0, L.jsx)(k, { children: h(e.given_at) }),
					/* @__PURE__ */ (0, L.jsx)(k, { children: /* @__PURE__ */ (0, L.jsx)(ye, { children: e.receipt_no }) }),
					/* @__PURE__ */ (0, L.jsx)(k, { children: Se(e) }),
					/* @__PURE__ */ (0, L.jsx)(k, {
						className: "text-right",
						children: e.items
					}),
					/* @__PURE__ */ (0, L.jsx)(k, {
						className: "text-right",
						children: /* @__PURE__ */ (0, L.jsx)("b", { children: f(e.paid) })
					}),
					/* @__PURE__ */ (0, L.jsx)(k, { children: e.worker }),
					/* @__PURE__ */ (0, L.jsx)(k, { children: e.settled_at ? /* @__PURE__ */ (0, L.jsxs)(L.Fragment, { children: [
						/* @__PURE__ */ (0, L.jsx)(P, { children: "Paid" }),
						" ",
						/* @__PURE__ */ (0, L.jsxs)("small", {
							className: "text-muted-foreground",
							children: [
								g(e.settled_at),
								e.settled_by ? " · " + e.settled_by : "",
								e.settlement_id ? " · #" + e.settlement_id : ""
							]
						})
					] }) : /* @__PURE__ */ (0, L.jsx)(P, {
						variant: "outline",
						children: "Unpaid"
					}) }),
					n && /* @__PURE__ */ (0, L.jsx)(k, {
						onClick: (e) => e.stopPropagation(),
						children: e.settled_at ? /* @__PURE__ */ (0, L.jsx)(y, {
							size: "sm",
							variant: "outline",
							onClick: () => void X([e.id], !1),
							children: "↩ Unpaid"
						}) : /* @__PURE__ */ (0, L.jsx)(y, {
							size: "sm",
							onClick: () => void X([e.id]),
							children: "✔ Paid"
						})
					}),
					u && /* @__PURE__ */ (0, L.jsx)(k, {
						onClick: (e) => e.stopPropagation(),
						children: /* @__PURE__ */ (0, L.jsx)(y, {
							size: "sm",
							variant: "outline",
							"aria-label": `Print ${e.receipt_no}`,
							onClick: () => {
								_e(he(e, d)) || F("Allow pop-ups to print.");
							},
							children: "🖨"
						})
					})
				]
			}, e.id)) })] }) : /* @__PURE__ */ (0, L.jsx)("p", {
				className: "text-sm text-muted-foreground",
				children: u ? "No paid staff laundry in these dates." : "No cash bills in these dates."
			})
		]
	});
}
function De() {
	let { api: e, site: t, libs: n, fmtDay: r } = z(), { sar: i, jeddahTime: a, jeddahDate: o } = n, [c, d] = W("week"), [p, m] = (0, I.useState)(null), { data: h, err: g } = re(async () => (await e("GET", `/api/laundry/settlements?site=${t}&from=${c.from}&to=${c.to}`)).settlements, [c.from, c.to]), _ = (h ?? []).filter((e) => e.action === "paid"), v = (h ?? []).filter((e) => e.action === "unpaid"), y = (e) => e.reduce((e, t) => e + t.total, 0);
	return /* @__PURE__ */ (0, L.jsxs)("div", {
		className: "grid gap-3",
		children: [
			/* @__PURE__ */ (0, L.jsx)(U, {
				value: c,
				onChange: d
			}),
			g ? /* @__PURE__ */ (0, L.jsx)(B, { e: g }) : h ? /* @__PURE__ */ (0, L.jsxs)(L.Fragment, { children: [/* @__PURE__ */ (0, L.jsxs)("div", {
				className: "flex flex-wrap gap-2",
				children: [
					/* @__PURE__ */ (0, L.jsx)(V, {
						icon: "💰",
						value: i(y(_)),
						label: `received SAR · ${_.length} payment${_.length === 1 ? "" : "s"}`,
						tone: "big"
					}),
					/* @__PURE__ */ (0, L.jsx)(V, {
						icon: "🧾",
						value: _.reduce((e, t) => e + t.count, 0),
						label: "bills marked paid"
					}),
					v.length ? /* @__PURE__ */ (0, L.jsx)(V, {
						icon: "↩",
						value: i(y(v)),
						label: `undone SAR · ${v.length}`,
						tone: "neg"
					}) : null
				]
			}), /* @__PURE__ */ (0, L.jsxs)(C, { children: [/* @__PURE__ */ (0, L.jsx)(S, { children: /* @__PURE__ */ (0, L.jsx)(b, {
				className: "text-base",
				children: "💰 Payments log"
			}) }), /* @__PURE__ */ (0, L.jsx)(x, { children: h.length ? /* @__PURE__ */ (0, L.jsxs)(j, { children: [/* @__PURE__ */ (0, L.jsx)(O, { children: /* @__PURE__ */ (0, L.jsxs)(A, { children: [
				/* @__PURE__ */ (0, L.jsx)(T, { children: "#" }),
				/* @__PURE__ */ (0, L.jsx)(T, { children: "Date" }),
				/* @__PURE__ */ (0, L.jsx)(T, { children: "Time" }),
				/* @__PURE__ */ (0, L.jsx)(T, { children: "Action" }),
				/* @__PURE__ */ (0, L.jsx)(T, { children: "Marked by" }),
				/* @__PURE__ */ (0, L.jsx)(T, {
					className: "text-right",
					children: "Bills"
				}),
				/* @__PURE__ */ (0, L.jsx)(T, {
					className: "text-right",
					children: "Amount SAR"
				}),
				/* @__PURE__ */ (0, L.jsx)(T, { children: "Receipts" })
			] }) }), /* @__PURE__ */ (0, L.jsx)(D, { children: h.map((e) => /* @__PURE__ */ (0, L.jsxs)(A, {
				className: xe,
				onClick: () => m(e),
				children: [
					/* @__PURE__ */ (0, L.jsx)(k, { children: /* @__PURE__ */ (0, L.jsxs)(ye, { children: ["#", e.id] }) }),
					/* @__PURE__ */ (0, L.jsx)(k, { children: r(e.day) }),
					/* @__PURE__ */ (0, L.jsx)(k, { children: a(e.at) }),
					/* @__PURE__ */ (0, L.jsx)(k, { children: e.action === "paid" ? /* @__PURE__ */ (0, L.jsx)(P, { children: "Paid" }) : /* @__PURE__ */ (0, L.jsx)(P, {
						variant: "outline",
						children: "↩ Unpaid again"
					}) }),
					/* @__PURE__ */ (0, L.jsx)(k, { children: e.by_name }),
					/* @__PURE__ */ (0, L.jsx)(k, {
						className: "text-right",
						children: e.count
					}),
					/* @__PURE__ */ (0, L.jsxs)(k, {
						className: M("text-right font-bold", e.action !== "paid" && "text-destructive"),
						children: [e.action === "paid" ? "" : "−", i(e.total)]
					}),
					/* @__PURE__ */ (0, L.jsx)(k, { children: /* @__PURE__ */ (0, L.jsxs)(ye, { children: [e.bills.slice(0, 3).map((e) => e.receipt_no).join(", "), e.bills.length > 3 ? ` +${e.bills.length - 3} more` : ""] }) })
				]
			}, e.id)) })] }) : /* @__PURE__ */ (0, L.jsx)("p", {
				className: "text-sm text-muted-foreground",
				children: "No payments in this period."
			}) })] })] }) : /* @__PURE__ */ (0, L.jsx)(K, {}),
			/* @__PURE__ */ (0, L.jsx)(f, {
				open: !!p,
				onOpenChange: (e) => !e && m(null),
				children: /* @__PURE__ */ (0, L.jsx)(l, {
					className: "max-w-[calc(100%-1rem)] sm:max-w-3xl",
					children: p && /* @__PURE__ */ (0, L.jsxs)(L.Fragment, { children: [
						/* @__PURE__ */ (0, L.jsx)(s, { children: /* @__PURE__ */ (0, L.jsxs)(u, { children: [
							"💰 Payment #",
							p.id,
							" · ",
							p.action === "paid" ? "Paid" : "Unpaid again"
						] }) }),
						/* @__PURE__ */ (0, L.jsxs)("p", {
							className: "text-sm",
							children: [
								o(p.at),
								" ",
								a(p.at),
								" · marked by ",
								/* @__PURE__ */ (0, L.jsx)("b", { children: p.by_name }),
								" · ",
								ve(p.count),
								" · ",
								/* @__PURE__ */ (0, L.jsxs)("b", { children: [i(p.total), " SAR"] })
							]
						}),
						/* @__PURE__ */ (0, L.jsxs)(j, { children: [
							/* @__PURE__ */ (0, L.jsx)(O, { children: /* @__PURE__ */ (0, L.jsxs)(A, { children: [
								/* @__PURE__ */ (0, L.jsx)(T, { children: "Receipt" }),
								/* @__PURE__ */ (0, L.jsx)(T, { children: "Bill date" }),
								/* @__PURE__ */ (0, L.jsx)(T, { children: "Building · room" }),
								/* @__PURE__ */ (0, L.jsx)(T, { children: "Worker" }),
								/* @__PURE__ */ (0, L.jsx)(T, {
									className: "text-right",
									children: "Amount SAR"
								})
							] }) }),
							/* @__PURE__ */ (0, L.jsx)(D, { children: p.bills.map((e, t) => /* @__PURE__ */ (0, L.jsxs)(A, { children: [
								/* @__PURE__ */ (0, L.jsx)(k, { children: /* @__PURE__ */ (0, L.jsx)(ye, { children: e.receipt_no }) }),
								/* @__PURE__ */ (0, L.jsx)(k, { children: r(e.day) }),
								/* @__PURE__ */ (0, L.jsx)(k, { children: e.room || "" }),
								/* @__PURE__ */ (0, L.jsx)(k, { children: e.worker || "" }),
								/* @__PURE__ */ (0, L.jsx)(k, {
									className: "text-right",
									children: i(e.amount)
								})
							] }, t)) }),
							/* @__PURE__ */ (0, L.jsx)(E, { children: /* @__PURE__ */ (0, L.jsxs)(A, { children: [/* @__PURE__ */ (0, L.jsx)(k, {
								colSpan: 4,
								children: /* @__PURE__ */ (0, L.jsx)("b", { children: "Total" })
							}), /* @__PURE__ */ (0, L.jsx)(k, {
								className: "text-right",
								children: /* @__PURE__ */ (0, L.jsx)("b", { children: i(p.total) })
							})] }) })
						] }),
						/* @__PURE__ */ (0, L.jsx)("p", {
							className: "text-xs text-muted-foreground",
							children: "Bill numbers as they were when the payment was recorded."
						})
					] })
				})
			})
		]
	});
}
function Oe() {
	let { api: e, site: t, libs: n, fmtDay: r, indexBills: i, items: a } = z(), { sar: o } = n, [s, c] = W("week"), [l, u] = (0, I.useState)(""), { data: d, err: f } = re(async () => {
		let { bills: n } = await e("GET", `/api/laundry/bills?site=${t}&from=${s.from}&to=${s.to}&all=1`);
		return i(n), {
			bills: n,
			s: J(n)
		};
	}, [s.from, s.to]), p = (e) => d && e(n, {
		r: s,
		bills: d.bills,
		s: d.s
	}).catch((e) => u(e.message));
	return /* @__PURE__ */ (0, L.jsxs)("div", {
		className: "grid gap-3",
		children: [/* @__PURE__ */ (0, L.jsx)(U, {
			value: s,
			onChange: c
		}), f ? /* @__PURE__ */ (0, L.jsx)(B, { e: f }) : d ? (() => {
			let e = d.s;
			return /* @__PURE__ */ (0, L.jsxs)(L.Fragment, { children: [
				/* @__PURE__ */ (0, L.jsxs)("div", {
					className: "flex flex-wrap items-center gap-2",
					children: [
						/* @__PURE__ */ (0, L.jsxs)("b", { children: [
							r(s.from),
							" → ",
							r(s.to)
						] }),
						/* @__PURE__ */ (0, L.jsx)("span", { className: "grow" }),
						/* @__PURE__ */ (0, L.jsx)(y, {
							size: "sm",
							variant: "outline",
							onClick: () => p(oe),
							children: "⬇️ Excel"
						}),
						/* @__PURE__ */ (0, L.jsx)(y, {
							size: "sm",
							variant: "outline",
							onClick: () => p(Z),
							children: "⬇️ PDF"
						})
					]
				}),
				l && /* @__PURE__ */ (0, L.jsx)("p", {
					className: "text-sm text-destructive",
					children: l
				}),
				/* @__PURE__ */ (0, L.jsx)(we, { s: e }),
				/* @__PURE__ */ (0, L.jsxs)(C, { children: [/* @__PURE__ */ (0, L.jsx)(S, { children: /* @__PURE__ */ (0, L.jsx)(b, {
					className: "text-base",
					children: "📅 Daily sales (SAR)"
				}) }), /* @__PURE__ */ (0, L.jsx)(x, { children: /* @__PURE__ */ (0, L.jsx)(G, { rows: e.days.map((e) => ({
					label: r(e.day),
					value: e.sales / 100,
					note: `${e.bills} bills · ${e.items} items · ${e.customers.size} customers · free ${e.free_items} items`
				})) }) })] }),
				/* @__PURE__ */ (0, L.jsxs)(C, { children: [/* @__PURE__ */ (0, L.jsx)(S, { children: /* @__PURE__ */ (0, L.jsx)(b, {
					className: "text-base",
					children: "👷 Worker-wise collection"
				}) }), /* @__PURE__ */ (0, L.jsx)(x, { children: /* @__PURE__ */ (0, L.jsxs)(j, { children: [/* @__PURE__ */ (0, L.jsx)(O, { children: /* @__PURE__ */ (0, L.jsxs)(A, { children: [
					/* @__PURE__ */ (0, L.jsx)(T, { children: "Worker" }),
					/* @__PURE__ */ (0, L.jsx)(T, {
						className: "text-right",
						children: "Bills"
					}),
					/* @__PURE__ */ (0, L.jsx)(T, {
						className: "text-right",
						children: "Items"
					}),
					/* @__PURE__ */ (0, L.jsx)(T, {
						className: "text-right",
						children: "Cash"
					}),
					/* @__PURE__ */ (0, L.jsx)(T, {
						className: "text-right",
						children: "Card"
					}),
					/* @__PURE__ */ (0, L.jsx)(T, {
						className: "text-right",
						children: "Other"
					}),
					/* @__PURE__ */ (0, L.jsx)(T, {
						className: "text-right",
						children: "Collection"
					}),
					/* @__PURE__ */ (0, L.jsx)(T, {
						className: "text-right",
						children: "Free bills · items · value"
					})
				] }) }), /* @__PURE__ */ (0, L.jsx)(D, { children: e.workers.length ? e.workers.map((e) => /* @__PURE__ */ (0, L.jsxs)(A, { children: [
					/* @__PURE__ */ (0, L.jsx)(k, { children: /* @__PURE__ */ (0, L.jsx)("b", { children: e.worker }) }),
					/* @__PURE__ */ (0, L.jsx)(k, {
						className: "text-right",
						children: e.bills
					}),
					/* @__PURE__ */ (0, L.jsx)(k, {
						className: "text-right",
						children: e.items
					}),
					/* @__PURE__ */ (0, L.jsx)(k, {
						className: "text-right",
						children: o(e.cash || 0)
					}),
					/* @__PURE__ */ (0, L.jsx)(k, {
						className: "text-right",
						children: o(e.card || 0)
					}),
					/* @__PURE__ */ (0, L.jsx)(k, {
						className: "text-right",
						children: o(e.other || 0)
					}),
					/* @__PURE__ */ (0, L.jsx)(k, {
						className: "text-right",
						children: /* @__PURE__ */ (0, L.jsx)("b", { children: o(e.total) })
					}),
					/* @__PURE__ */ (0, L.jsxs)(k, {
						className: "text-right",
						children: [
							e.free_bills,
							" · ",
							e.free_items,
							" · ",
							o(e.free_value)
						]
					})
				] }, e.worker)) : /* @__PURE__ */ (0, L.jsx)(A, { children: /* @__PURE__ */ (0, L.jsx)(k, {
					colSpan: 8,
					className: "text-muted-foreground",
					children: "No bills."
				}) }) })] }) })] }),
				/* @__PURE__ */ (0, L.jsxs)(C, { children: [/* @__PURE__ */ (0, L.jsx)(S, { children: /* @__PURE__ */ (0, L.jsx)(b, {
					className: "text-base",
					children: "👕 Item-wise"
				}) }), /* @__PURE__ */ (0, L.jsxs)(x, {
					className: "grid gap-3",
					children: [/* @__PURE__ */ (0, L.jsxs)(j, { children: [/* @__PURE__ */ (0, L.jsx)(O, { children: /* @__PURE__ */ (0, L.jsxs)(A, { children: [
						/* @__PURE__ */ (0, L.jsx)(T, { children: "Item" }),
						/* @__PURE__ */ (0, L.jsx)(T, {
							className: "text-right",
							children: "Paid qty"
						}),
						/* @__PURE__ */ (0, L.jsx)(T, {
							className: "text-right",
							children: "Revenue SAR"
						}),
						/* @__PURE__ */ (0, L.jsx)(T, {
							className: "text-right",
							children: "Free qty"
						}),
						/* @__PURE__ */ (0, L.jsx)(T, {
							className: "text-right",
							children: "Free value SAR"
						})
					] }) }), /* @__PURE__ */ (0, L.jsx)(D, { children: e.items.length ? e.items.map((e) => /* @__PURE__ */ (0, L.jsxs)(A, { children: [
						/* @__PURE__ */ (0, L.jsxs)(k, { children: [
							/* @__PURE__ */ (0, L.jsx)(H, { item: a.find((t) => t.name === e.name) }),
							" ",
							e.name
						] }),
						/* @__PURE__ */ (0, L.jsx)(k, {
							className: "text-right",
							children: e.qty
						}),
						/* @__PURE__ */ (0, L.jsx)(k, {
							className: "text-right",
							children: o(e.revenue)
						}),
						/* @__PURE__ */ (0, L.jsx)(k, {
							className: "text-right",
							children: e.free_qty
						}),
						/* @__PURE__ */ (0, L.jsx)(k, {
							className: "text-right",
							children: o(e.free_value)
						})
					] }, e.name)) : /* @__PURE__ */ (0, L.jsx)(A, { children: /* @__PURE__ */ (0, L.jsx)(k, {
						colSpan: 5,
						className: "text-muted-foreground",
						children: "No items."
					}) }) })] }), /* @__PURE__ */ (0, L.jsx)(G, {
						unit: "items",
						rows: e.items.map((e) => ({
							label: e.name,
							value: e.qty + e.free_qty,
							note: `${e.qty} paid + ${e.free_qty} free`
						}))
					})]
				})] })
			] });
		})() : /* @__PURE__ */ (0, L.jsx)(K, {})]
	});
}
function ke() {
	let { api: e, site: t, libs: n, fmtDay: r, indexBills: i, loadStaff: a, openBill: o, openStaffHistory: s } = z(), { sar: c, jeddahDate: l, jeddahTime: u } = n, [d, f] = W("today"), { data: p, err: m } = re(async () => {
		await a();
		let { bills: n } = await e("GET", `/api/laundry/bills?site=${t}&from=${d.from}&to=${d.to}&all=1`), r = n.filter((e) => e.kind === "free");
		return i(r), {
			free: r,
			s: J(r)
		};
	}, [d.from, d.to]);
	return /* @__PURE__ */ (0, L.jsxs)("div", {
		className: "grid gap-3",
		children: [/* @__PURE__ */ (0, L.jsx)(U, {
			value: d,
			onChange: f
		}), m ? /* @__PURE__ */ (0, L.jsx)(B, { e: m }) : p ? /* @__PURE__ */ (0, L.jsxs)(L.Fragment, { children: [
			/* @__PURE__ */ (0, L.jsxs)(C, { children: [/* @__PURE__ */ (0, L.jsx)(S, { children: /* @__PURE__ */ (0, L.jsxs)(b, {
				className: "text-base",
				children: [
					"👷 STAFF ONLY LAUNDRY · ",
					r(d.from),
					d.to === d.from ? "" : " → " + r(d.to)
				]
			}) }), /* @__PURE__ */ (0, L.jsxs)(x, {
				className: "flex flex-wrap gap-2",
				children: [
					/* @__PURE__ */ (0, L.jsx)(V, {
						icon: "👤",
						value: p.s.free.staff,
						label: "staff"
					}),
					/* @__PURE__ */ (0, L.jsx)(V, {
						icon: "🧾",
						value: p.s.free.bills,
						label: "transactions"
					}),
					/* @__PURE__ */ (0, L.jsx)(V, {
						icon: "👕",
						value: p.s.free.items,
						label: "clothes"
					}),
					/* @__PURE__ */ (0, L.jsx)(V, {
						icon: "🏷️",
						value: c(p.s.free.value),
						label: "laundry value SAR",
						tone: "big"
					}),
					/* @__PURE__ */ (0, L.jsx)(V, {
						icon: "💵",
						value: 0,
						label: "collected SAR"
					})
				]
			})] }),
			/* @__PURE__ */ (0, L.jsxs)(C, { children: [/* @__PURE__ */ (0, L.jsx)(S, { children: /* @__PURE__ */ (0, L.jsx)(b, {
				className: "text-base",
				children: "Staff-wise"
			}) }), /* @__PURE__ */ (0, L.jsx)(x, { children: /* @__PURE__ */ (0, L.jsxs)(j, { children: [/* @__PURE__ */ (0, L.jsx)(O, { children: /* @__PURE__ */ (0, L.jsxs)(A, { children: [
				/* @__PURE__ */ (0, L.jsx)(T, { children: "Staff" }),
				/* @__PURE__ */ (0, L.jsx)(T, {
					className: "text-right",
					children: "Transactions"
				}),
				/* @__PURE__ */ (0, L.jsx)(T, {
					className: "text-right",
					children: "Clothes"
				}),
				/* @__PURE__ */ (0, L.jsx)(T, {
					className: "text-right",
					children: "Laundry value"
				})
			] }) }), /* @__PURE__ */ (0, L.jsx)(D, { children: p.s.staff.length ? p.s.staff.map((e) => /* @__PURE__ */ (0, L.jsxs)(A, {
				className: xe,
				onClick: () => s(e.staff_id),
				children: [
					/* @__PURE__ */ (0, L.jsxs)(k, { children: [
						/* @__PURE__ */ (0, L.jsx)(Ce, {
							id: e.staff_id,
							cls: "size-7"
						}),
						" ",
						e.name
					] }),
					/* @__PURE__ */ (0, L.jsx)(k, {
						className: "text-right",
						children: e.bills
					}),
					/* @__PURE__ */ (0, L.jsx)(k, {
						className: "text-right",
						children: e.items
					}),
					/* @__PURE__ */ (0, L.jsxs)(k, {
						className: "text-right",
						children: [c(e.value), " SAR"]
					})
				]
			}, e.staff_id)) : /* @__PURE__ */ (0, L.jsx)(A, { children: /* @__PURE__ */ (0, L.jsx)(k, {
				colSpan: 4,
				className: "text-muted-foreground",
				children: "No free laundry in this period."
			}) }) })] }) })] }),
			/* @__PURE__ */ (0, L.jsxs)(C, { children: [/* @__PURE__ */ (0, L.jsx)(S, { children: /* @__PURE__ */ (0, L.jsx)(b, {
				className: "text-base",
				children: "📒 Staff free laundry register"
			}) }), /* @__PURE__ */ (0, L.jsx)(x, { children: /* @__PURE__ */ (0, L.jsxs)(j, { children: [/* @__PURE__ */ (0, L.jsx)(O, { children: /* @__PURE__ */ (0, L.jsxs)(A, { children: [
				/* @__PURE__ */ (0, L.jsx)(T, { children: "Photo" }),
				/* @__PURE__ */ (0, L.jsx)(T, { children: "Staff name" }),
				/* @__PURE__ */ (0, L.jsx)(T, { children: "Given" }),
				/* @__PURE__ */ (0, L.jsx)(T, {
					className: "text-right",
					children: "Count"
				}),
				/* @__PURE__ */ (0, L.jsx)(T, {
					className: "text-right",
					children: "Value"
				}),
				/* @__PURE__ */ (0, L.jsx)(T, { children: "Accepted by" })
			] }) }), /* @__PURE__ */ (0, L.jsx)(D, { children: p.free.length ? p.free.map((e) => /* @__PURE__ */ (0, L.jsxs)(A, {
				className: M(xe, e.voided && "opacity-50 line-through"),
				onClick: () => o(e),
				children: [
					/* @__PURE__ */ (0, L.jsx)(k, { children: /* @__PURE__ */ (0, L.jsx)(Ce, { id: e.staff_id }) }),
					/* @__PURE__ */ (0, L.jsx)(k, { children: /* @__PURE__ */ (0, L.jsx)("b", { children: e.staff_name }) }),
					/* @__PURE__ */ (0, L.jsxs)(k, { children: [
						l(e.given_at),
						" ",
						u(e.given_at)
					] }),
					/* @__PURE__ */ (0, L.jsx)(k, {
						className: "text-right",
						children: e.items
					}),
					/* @__PURE__ */ (0, L.jsxs)(k, {
						className: "text-right",
						children: [c(e.value), " SAR"]
					}),
					/* @__PURE__ */ (0, L.jsxs)(k, { children: [e.worker, e.voided ? " · ❌ cancelled" : ""] })
				]
			}, e.id)) : /* @__PURE__ */ (0, L.jsx)(A, { children: /* @__PURE__ */ (0, L.jsx)(k, {
				colSpan: 6,
				className: "text-muted-foreground",
				children: "No entries."
			}) }) })] }) })] })
		] }) : /* @__PURE__ */ (0, L.jsx)(K, {})]
	});
}
function Ae() {
	let { api: e, site: t, libs: n, fmtDay: r, indexBills: i, items: a, loadItems: o, openBill: s } = z(), { jeddahTime: c } = n, [l, u] = W("week"), [d, f] = (0, I.useState)(""), { data: p, err: m } = re(async () => {
		a.length || await o().catch(() => {});
		let n = (await e("GET", `/api/laundry/bills?site=${t}&from=${l.from}&to=${l.to}&kind=building&all=1`)).bills;
		i(n);
		let r = n.filter((e) => !e.voided), s = /* @__PURE__ */ new Map(), c = /* @__PURE__ */ new Map();
		for (let e of r) {
			for (let t of e.lines) s.set(t.name, (s.get(t.name) || 0) + t.qty);
			let t = c.get(e.day) || {
				day: e.day,
				entries: 0,
				pieces: 0,
				items: /* @__PURE__ */ new Map()
			};
			t.entries++, t.pieces += e.items;
			for (let n of e.lines) t.items.set(n.name, (t.items.get(n.name) || 0) + n.qty);
			c.set(e.day, t);
		}
		return {
			bills: n,
			live: r,
			byItem: s,
			days: [...c.values()].sort((e, t) => t.day.localeCompare(e.day))
		};
	}, [l.from, l.to]);
	if (m) return /* @__PURE__ */ (0, L.jsxs)("div", {
		className: "grid gap-3",
		children: [/* @__PURE__ */ (0, L.jsx)(U, {
			value: l,
			onChange: u
		}), /* @__PURE__ */ (0, L.jsx)(B, { e: m })]
	});
	let h = p ? [...a.filter((e) => e.category === "building").map((e) => e.name), ...[...p.byItem.keys()].filter((e) => !a.some((t) => t.category === "building" && t.name === e))] : [];
	return /* @__PURE__ */ (0, L.jsxs)("div", {
		className: "grid gap-3",
		children: [/* @__PURE__ */ (0, L.jsx)(U, {
			value: l,
			onChange: u
		}), p ? /* @__PURE__ */ (0, L.jsxs)(L.Fragment, { children: [
			/* @__PURE__ */ (0, L.jsxs)("div", {
				className: "flex flex-wrap items-center gap-2",
				children: [
					/* @__PURE__ */ (0, L.jsxs)("b", { children: [r(l.from), l.to === l.from ? "" : " → " + r(l.to)] }),
					/* @__PURE__ */ (0, L.jsx)("span", { className: "grow" }),
					/* @__PURE__ */ (0, L.jsx)(y, {
						size: "sm",
						variant: "outline",
						onClick: () => void se(n, {
							r: l,
							live: p.live,
							names: h,
							byItem: p.byItem,
							days: p.days
						}).catch((e) => f(e.message)),
						children: "⬇️ Excel"
					})
				]
			}),
			d && /* @__PURE__ */ (0, L.jsx)("p", {
				className: "text-sm text-destructive",
				children: d
			}),
			/* @__PURE__ */ (0, L.jsxs)(C, { children: [/* @__PURE__ */ (0, L.jsx)(S, { children: /* @__PURE__ */ (0, L.jsx)(b, {
				className: "text-base",
				children: "🏨 BUILDING LINEN"
			}) }), /* @__PURE__ */ (0, L.jsxs)(x, {
				className: "grid gap-3",
				children: [/* @__PURE__ */ (0, L.jsxs)("div", {
					className: "flex flex-wrap gap-2",
					children: [
						/* @__PURE__ */ (0, L.jsx)(V, {
							icon: "🧾",
							value: p.live.length,
							label: p.live.length === 1 ? "entry" : "entries"
						}),
						/* @__PURE__ */ (0, L.jsx)(V, {
							icon: "🧺",
							value: p.live.reduce((e, t) => e + t.items, 0),
							label: "pieces sent",
							tone: "big"
						}),
						/* @__PURE__ */ (0, L.jsx)(V, {
							icon: "📅",
							value: p.days.length,
							label: p.days.length === 1 ? "day" : "days"
						})
					]
				}), /* @__PURE__ */ (0, L.jsx)("div", {
					className: "grid grid-cols-[repeat(auto-fill,minmax(7rem,1fr))] gap-2",
					children: h.map((e) => /* @__PURE__ */ (0, L.jsxs)("div", {
						className: M("grid justify-items-center gap-0.5 rounded-xl border bg-card p-2 text-center", !p.byItem.get(e) && "opacity-50"),
						children: [
							/* @__PURE__ */ (0, L.jsx)(H, {
								item: a.find((t) => t.name === e) || { name: e },
								cls: "la-ipic big"
							}),
							/* @__PURE__ */ (0, L.jsx)("b", { children: p.byItem.get(e) || 0 }),
							/* @__PURE__ */ (0, L.jsx)("small", { children: e })
						]
					}, e))
				})]
			})] }),
			/* @__PURE__ */ (0, L.jsxs)(C, { children: [/* @__PURE__ */ (0, L.jsx)(S, { children: /* @__PURE__ */ (0, L.jsx)(b, {
				className: "text-base",
				children: "📅 Day-wise"
			}) }), /* @__PURE__ */ (0, L.jsx)(x, { children: /* @__PURE__ */ (0, L.jsxs)(j, { children: [/* @__PURE__ */ (0, L.jsx)(O, { children: /* @__PURE__ */ (0, L.jsxs)(A, { children: [
				/* @__PURE__ */ (0, L.jsx)(T, { children: "Day" }),
				h.map((e) => /* @__PURE__ */ (0, L.jsx)(T, {
					className: "text-right",
					children: e
				}, e)),
				/* @__PURE__ */ (0, L.jsx)(T, {
					className: "text-right",
					children: "Pieces"
				}),
				/* @__PURE__ */ (0, L.jsx)(T, {
					className: "text-right",
					children: "Entries"
				})
			] }) }), /* @__PURE__ */ (0, L.jsx)(D, { children: p.days.length ? p.days.map((e) => /* @__PURE__ */ (0, L.jsxs)(A, { children: [
				/* @__PURE__ */ (0, L.jsx)(k, { children: r(e.day) }),
				h.map((t) => /* @__PURE__ */ (0, L.jsx)(k, {
					className: "text-right",
					children: e.items.get(t) || ""
				}, t)),
				/* @__PURE__ */ (0, L.jsx)(k, {
					className: "text-right",
					children: /* @__PURE__ */ (0, L.jsx)("b", { children: e.pieces })
				}),
				/* @__PURE__ */ (0, L.jsx)(k, {
					className: "text-right",
					children: e.entries
				})
			] }, e.day)) : /* @__PURE__ */ (0, L.jsx)(A, { children: /* @__PURE__ */ (0, L.jsx)(k, {
				colSpan: h.length + 3,
				className: "text-muted-foreground",
				children: "Nothing sent in this period."
			}) }) })] }) })] }),
			/* @__PURE__ */ (0, L.jsxs)(C, { children: [/* @__PURE__ */ (0, L.jsx)(S, { children: /* @__PURE__ */ (0, L.jsx)(b, {
				className: "text-base",
				children: "🧾 Every entry"
			}) }), /* @__PURE__ */ (0, L.jsx)(x, { children: p.bills.length ? /* @__PURE__ */ (0, L.jsxs)(j, { children: [/* @__PURE__ */ (0, L.jsx)(O, { children: /* @__PURE__ */ (0, L.jsxs)(A, { children: [
				/* @__PURE__ */ (0, L.jsx)(T, { children: "Date" }),
				/* @__PURE__ */ (0, L.jsx)(T, { children: "Time" }),
				/* @__PURE__ */ (0, L.jsx)(T, { children: "Receipt" }),
				/* @__PURE__ */ (0, L.jsx)(T, { children: "Items" }),
				/* @__PURE__ */ (0, L.jsx)(T, {
					className: "text-right",
					children: "Pieces"
				}),
				/* @__PURE__ */ (0, L.jsx)(T, { children: "Worker" })
			] }) }), /* @__PURE__ */ (0, L.jsx)(D, { children: p.bills.map((e) => /* @__PURE__ */ (0, L.jsxs)(A, {
				className: M(xe, e.voided && "opacity-50 line-through"),
				onClick: () => s(e),
				children: [
					/* @__PURE__ */ (0, L.jsx)(k, { children: r(e.day) }),
					/* @__PURE__ */ (0, L.jsx)(k, { children: c(e.given_at) }),
					/* @__PURE__ */ (0, L.jsx)(k, { children: /* @__PURE__ */ (0, L.jsx)(ye, { children: e.receipt_no }) }),
					/* @__PURE__ */ (0, L.jsx)(k, { children: e.lines.map((e) => `${e.name} × ${e.qty}`).join(", ") }),
					/* @__PURE__ */ (0, L.jsx)(k, {
						className: "text-right",
						children: /* @__PURE__ */ (0, L.jsx)("b", { children: e.items })
					}),
					/* @__PURE__ */ (0, L.jsxs)(k, { children: [e.worker, e.voided ? " · ❌ cancelled" : ""] })
				]
			}, e.id)) })] }) : /* @__PURE__ */ (0, L.jsx)("p", {
				className: "text-sm text-muted-foreground",
				children: "No entries."
			}) })] })
		] }) : /* @__PURE__ */ (0, L.jsx)(K, {})]
	});
}
function je() {
	let { isAdmin: e, items: t, loadItems: n, libs: r, openItemForm: i } = z(), { data: a, err: o } = re(async () => (await n(), !0), []), s = (t) => /* @__PURE__ */ (0, L.jsxs)("div", {
		className: M("flex items-center gap-3 rounded-xl border bg-card p-3", !t.active && "opacity-60"),
		children: [
			/* @__PURE__ */ (0, L.jsx)(H, {
				item: t,
				cls: "la-ipic big"
			}),
			/* @__PURE__ */ (0, L.jsxs)("div", {
				className: "grow",
				children: [
					/* @__PURE__ */ (0, L.jsx)("b", { children: t.name }),
					t.name_local ? /* @__PURE__ */ (0, L.jsx)(be, { children: t.name_local }) : null,
					/* @__PURE__ */ (0, L.jsxs)("span", {
						className: "block text-sm font-bold text-primary",
						children: [r.sar(t.price), " SAR"]
					}),
					t.active ? null : /* @__PURE__ */ (0, L.jsx)(be, { children: "hidden from the worker" })
				]
			}),
			e && /* @__PURE__ */ (0, L.jsx)(y, {
				size: "sm",
				variant: "outline",
				onClick: () => i(t),
				children: "✏️ Edit"
			})
		]
	}, t.id);
	if (o) return /* @__PURE__ */ (0, L.jsx)(B, { e: o });
	if (!a) return /* @__PURE__ */ (0, L.jsx)(K, {});
	let c = t.filter((e) => (e.category || "guest") === "guest"), l = t.filter((e) => e.category === "building");
	return /* @__PURE__ */ (0, L.jsxs)("div", {
		className: "grid gap-3",
		children: [
			/* @__PURE__ */ (0, L.jsxs)("div", {
				className: "flex flex-wrap items-center gap-2",
				children: [/* @__PURE__ */ (0, L.jsx)("p", {
					className: "grow text-sm text-muted-foreground",
					children: "New prices apply to new bills only; old bills keep the price they were billed at."
				}), e && /* @__PURE__ */ (0, L.jsx)(y, {
					onClick: () => i(null),
					children: "➕ Add item"
				})]
			}),
			/* @__PURE__ */ (0, L.jsx)("h3", {
				className: "font-bold",
				children: "🧺 Clothes (New bill · Staff only)"
			}),
			/* @__PURE__ */ (0, L.jsx)("div", {
				className: "grid gap-2 sm:grid-cols-2 xl:grid-cols-3",
				children: c.map(s)
			}),
			/* @__PURE__ */ (0, L.jsx)("h3", {
				className: "font-bold",
				children: "🏨 Building linen (Building tab)"
			}),
			/* @__PURE__ */ (0, L.jsx)("div", {
				className: "grid gap-2 sm:grid-cols-2 xl:grid-cols-3",
				children: l.length ? l.map(s) : /* @__PURE__ */ (0, L.jsx)("p", {
					className: "text-sm text-muted-foreground",
					children: "None yet."
				})
			})
		]
	});
}
var Me = (e) => String(e ?? "").replace(/[&<>"']/g, (e) => ({
	"&": "&amp;",
	"<": "&lt;",
	">": "&gt;",
	"\"": "&quot;",
	"'": "&#39;"
})[e]);
function Ne(e, t, n, r, i) {
	return `<!doctype html><html><head><meta charset="utf-8"><title>Staff laundry ${n} to ${r}</title><style>
        @page{size:A5;margin:10mm} body{font:13px system-ui,sans-serif;color:#111;margin:0}
        .pb{page-break-after:always} .pb:last-child{page-break-after:auto} h1{font-size:20px;margin:0 0 2px} .sub{margin:0 0 4px;color:#444}
        table{width:100%;border-collapse:collapse;margin-top:8px} th,td{border:1px solid #333;padding:5px 8px;text-align:left} td:last-child,th:last-child{text-align:right;width:30%}
        thead th{background:#eee} tfoot th{font-size:15px}</style></head><body>${e.map((e) => {
		let a = t.filter((t) => t.staff_id === e.id && !t.voided && (t.kind === "free" || t.kind === "paid")), o = /* @__PURE__ */ new Map();
		for (let e of a) o.set(e.day, (o.get(e.day) || 0) + e.items);
		let s = [...o].sort((e, t) => e[0].localeCompare(t[0])), c = s.reduce((e, [, t]) => e + t, 0);
		return `<section class="pb"><h1>${Me(e.name)}</h1><p class="sub">${[
			e.room && "Room " + Me(e.room),
			e.category && Me(e.category),
			e.charged ? "Paid laundry" : "Staff laundry"
		].filter(Boolean).join(" · ")}</p>
            <p class="sub">${i(n)} → ${i(r)}</p>
            <table><thead><tr><th>Date</th><th>Pieces</th></tr></thead><tbody>${s.length ? s.map(([e, t]) => `<tr><td>${i(e)}</td><td>${t}</td></tr>`).join("") : "<tr><td colspan=\"2\">No laundry in these dates</td></tr>"}</tbody>
            <tfoot><tr><th>Total</th><th>${c}</th></tr></tfoot></table></section>`;
	}).join("")}</body></html>`;
}
function Pe() {
	let { isAdmin: e, staff: t, cats: n, loadStaff: r, api: i, site: a, setCats: o, setStaff: c, libs: d, confirm: m, prompt: h, openStaffForm: g, openStaffHistory: _, fmtDay: T } = z(), [E, D] = (0, I.useState)(""), [O, k] = (0, I.useState)("*"), [A, j] = (0, I.useState)(""), [ee, N] = (0, I.useState)(""), [P, te] = (0, I.useState)("live"), [F, R] = (0, I.useState)(/* @__PURE__ */ new Set()), [ne, V] = (0, I.useState)(""), H = d.jeddahDay(), [U, W] = (0, I.useState)({
		open: !1,
		from: H.slice(0, 8) + "01",
		to: H,
		busy: !1
	}), G = (0, I.useRef)([]), { data: q, err: ie } = re(async () => (await r(), !0), []);
	if (ie) return /* @__PURE__ */ (0, L.jsx)(B, { e: ie });
	if (!q) return /* @__PURE__ */ (0, L.jsx)(K, {});
	let J = (e) => n.includes(e.category) ? e.category : "", Y = t.filter((e) => !e.deleted && (P === "archived" ? e.archived : !e.archived)), X = (e) => Y.filter((t) => e === "" ? !n.includes(t.category) : t.category === e).length, oe = Y.filter((e) => O === "*" || J(e) === O).filter((e) => !E.trim() || [
		e.name,
		e.staff_code,
		e.room,
		e.contact,
		e.department
	].some((e) => String(e || "").toLowerCase().includes(E.trim().toLowerCase()))), Z = Y.filter((e) => F.has(e.id)), se = (e) => Y.filter((t) => J(t) === e), Q = (e) => {
		let t = se(e), n = t.filter((e) => F.has(e.id)).length;
		return !t.length || !n ? !1 : n === t.length || "indeterminate";
	}, ce = (e, t) => R((n) => {
		let r = new Set(n);
		return e.forEach((e) => t ? r.add(e) : r.delete(e)), r;
	});
	async function le(e, t = {}) {
		try {
			let n = await i("PUT", "/api/laundry/staff-categories", {
				site: a,
				categories: e,
				renames: t
			});
			o(n.categories), c(n.staff), N("");
		} catch (e) {
			N(e.message);
		}
	}
	async function ue(e) {
		let t = (await h({
			title: `Rename "${e}" to:`,
			value: e
		}) || "").trim();
		t && t !== e && (n.some((n) => n !== e && n.toLowerCase() === t.toLowerCase()) ? N(`"${t}" is already a category.`) : await le(n.map((n) => n === e ? t : n), { [e]: t }));
	}
	async function de(e) {
		if (await m({
			title: `Delete ${e.name}?`,
			confirmLabel: "Delete",
			body: "The profile disappears from this list and from the worker's free-laundry search, so no new free laundry can be given.\nThe record and all past free-laundry entries stay saved (register, reports, history)."
		})) try {
			c((await i("DELETE", `/api/laundry/staff/${e.id}`)).staff);
		} catch (e) {
			N(e.message);
		}
	}
	let fe = {
		archive: "🗄 Archive",
		restore: "♻️ Restore",
		charged: "💵 Paid mode on",
		free: "🆓 Free (paid mode off)",
		category: "🗂️ Move"
	};
	async function pe(e, t, n = {}) {
		if (!t.length) return;
		let r = Y.filter((e) => t.includes(e.id)), o = e === "charged" ? "Their next laundry costs 1 SAR a piece, gets their own receipt number (NAME-ROOM-01, 02 …) and waits as unpaid until marked paid." : e === "free" ? "Their next laundry is free staff laundry again. Bills already made stay as they are." : e === "archive" ? "They leave the laundry screen. Their history stays; restore them any time from \"Archived\"." : void 0;
		if (await m({
			title: `${fe[e]}${e === "category" ? ` to "${n.category || "Uncategorized"}"` : ""} — ${r.length} ${r.length === 1 ? "person" : "people"}?`,
			body: /* @__PURE__ */ (0, L.jsxs)(L.Fragment, { children: [o && /* @__PURE__ */ (0, L.jsx)("p", { children: o }), /* @__PURE__ */ (0, L.jsx)("p", {
				className: "text-xs text-muted-foreground",
				children: r.map((e) => e.name).join(", ")
			})] }),
			confirmLabel: "Apply"
		})) try {
			let r = await i("POST", "/api/laundry/staff-bulk", {
				site: a,
				ids: t,
				action: e,
				...n
			});
			c(r.staff), R(/* @__PURE__ */ new Set()), N(`${r.changed} updated.`);
		} catch (e) {
			N(e.message);
		}
	}
	async function me(e) {
		if (e.length) {
			if (U.from > U.to) N("\"From\" is after \"To\".");
			else {
				W((e) => ({
					...e,
					busy: !0
				}));
				try {
					let { bills: n } = await i("GET", `/api/laundry/bills?site=${a}&from=${U.from}&to=${U.to}&all=1`), r = window.open("", "_blank");
					if (!r) {
						N("Allow pop-ups to print.");
						return;
					}
					r.document.write(Ne(t.filter((t) => e.includes(t.id)), n, U.from, U.to, T)), r.document.close(), r.focus(), setTimeout(() => r.print(), 300), W((e) => ({
						...e,
						open: !1
					}));
				} catch (e) {
					N(e.message);
				} finally {
					W((e) => ({
						...e,
						busy: !1
					}));
				}
			}
		}
	}
	let he = (e) => {
		G.current = e, W((e) => ({
			...e,
			open: !0
		}));
	}, ge = oe.length > 0 && oe.every((e) => F.has(e.id));
	return /* @__PURE__ */ (0, L.jsxs)("div", {
		className: "grid gap-3",
		children: [
			/* @__PURE__ */ (0, L.jsxs)(C, { children: [/* @__PURE__ */ (0, L.jsx)(S, { children: /* @__PURE__ */ (0, L.jsxs)(b, {
				className: "text-base",
				children: ["🗂️ Staff categories ", /* @__PURE__ */ (0, L.jsx)("small", {
					className: "font-normal text-muted-foreground",
					children: "— tick a category to select all its people; the laundry screen shows these first"
				})]
			}) }), /* @__PURE__ */ (0, L.jsxs)(x, {
				className: "grid gap-3",
				children: [/* @__PURE__ */ (0, L.jsx)("div", {
					className: "flex flex-wrap gap-2",
					children: [...n, ""].map((t) => /* @__PURE__ */ (0, L.jsxs)("span", {
						className: M("inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm", t ? "bg-accent" : "text-muted-foreground"),
						children: [
							/* @__PURE__ */ (0, L.jsx)(p, {
								"aria-label": `Select everyone in ${t || "Uncategorized"}`,
								checked: Q(t),
								disabled: !se(t).length,
								onCheckedChange: (e) => ce(se(t).map((e) => e.id), e === !0)
							}),
							/* @__PURE__ */ (0, L.jsx)("b", { children: t || "Uncategorized" }),
							" ",
							/* @__PURE__ */ (0, L.jsx)("small", { children: X(t) }),
							e && t && /* @__PURE__ */ (0, L.jsxs)(L.Fragment, { children: [/* @__PURE__ */ (0, L.jsx)("button", {
								type: "button",
								"aria-label": `Rename ${t}`,
								onClick: () => void ue(t),
								children: "✏️"
							}), /* @__PURE__ */ (0, L.jsx)("button", {
								type: "button",
								"aria-label": `Delete ${t}`,
								onClick: async () => {
									await m({
										title: `Delete the category "${t}"?`,
										body: "Its staff stay, under \"Uncategorized\".",
										confirmLabel: "Delete"
									}) && await le(n.filter((e) => e !== t));
								},
								children: "🗑"
							})] })
						]
					}, t || "-"))
				}), e && /* @__PURE__ */ (0, L.jsxs)("div", {
					className: "flex flex-wrap gap-2",
					children: [/* @__PURE__ */ (0, L.jsx)(w, {
						className: "max-w-xs",
						maxLength: 40,
						placeholder: "New category, e.g. Kitchen",
						value: A,
						onChange: (e) => j(e.target.value),
						onKeyDown: (e) => {
							e.key === "Enter" && (e.target.blur(), document.getElementById("catAdd")?.click());
						}
					}), /* @__PURE__ */ (0, L.jsx)(y, {
						id: "catAdd",
						onClick: async () => {
							let e = A.trim();
							e && (n.some((t) => t.toLowerCase() === e.toLowerCase()) ? N(`"${e}" is already a category.`) : (j(""), await le([...n, e])));
						},
						children: "➕ Add category"
					})]
				})]
			})] }),
			/* @__PURE__ */ (0, L.jsxs)("div", {
				className: "flex flex-wrap items-center gap-2",
				children: [
					/* @__PURE__ */ (0, L.jsx)(w, {
						type: "search",
						className: "max-w-xs",
						placeholder: "🔎 Name, staff ID, room, mobile",
						value: E,
						onChange: (e) => D(e.target.value)
					}),
					/* @__PURE__ */ (0, L.jsxs)("select", {
						"aria-label": "Category",
						className: "h-9 rounded-md border bg-background px-2 text-sm",
						value: O,
						onChange: (e) => k(e.target.value),
						children: [
							/* @__PURE__ */ (0, L.jsx)("option", {
								value: "*",
								children: "All categories"
							}),
							n.map((e) => /* @__PURE__ */ (0, L.jsx)("option", {
								value: e,
								children: e
							}, e)),
							/* @__PURE__ */ (0, L.jsx)("option", {
								value: "",
								children: "Uncategorized"
							})
						]
					}),
					/* @__PURE__ */ (0, L.jsx)("div", {
						className: "inline-flex rounded-md border p-0.5 text-sm",
						children: ["live", "archived"].map((e) => /* @__PURE__ */ (0, L.jsx)("button", {
							type: "button",
							className: M("rounded px-3 py-1", P === e && "bg-primary text-primary-foreground"),
							onClick: () => {
								te(e), R(/* @__PURE__ */ new Set());
							},
							children: e === "live" ? `👥 Current (${t.filter((e) => !e.deleted && !e.archived).length})` : `🗄 Archived (${t.filter((e) => !e.deleted && e.archived).length})`
						}, e))
					}),
					e && /* @__PURE__ */ (0, L.jsx)(y, {
						onClick: () => g(null),
						children: "➕ Add staff"
					})
				]
			}),
			/* @__PURE__ */ (0, L.jsxs)("div", {
				className: "sticky top-14 z-10 flex flex-wrap items-center gap-2 rounded-xl border bg-card p-2 shadow-sm",
				children: [
					/* @__PURE__ */ (0, L.jsxs)(v, {
						className: "gap-2",
						children: [/* @__PURE__ */ (0, L.jsx)(p, {
							checked: ge ? !0 : oe.some((e) => F.has(e.id)) ? "indeterminate" : !1,
							onCheckedChange: (e) => ce(oe.map((e) => e.id), e === !0)
						}), "Select all shown"]
					}),
					/* @__PURE__ */ (0, L.jsxs)("b", {
						className: "text-sm",
						children: [Z.length, " selected"]
					}),
					Z.length > 0 && /* @__PURE__ */ (0, L.jsx)(y, {
						size: "sm",
						variant: "ghost",
						onClick: () => R(/* @__PURE__ */ new Set()),
						children: "Clear"
					}),
					/* @__PURE__ */ (0, L.jsx)("span", { className: "grow" }),
					/* @__PURE__ */ (0, L.jsx)(y, {
						size: "sm",
						variant: "outline",
						disabled: !Z.length,
						onClick: () => he(Z.map((e) => e.id)),
						children: "🖨 Print bills"
					}),
					e && /* @__PURE__ */ (0, L.jsxs)(L.Fragment, { children: [
						P === "live" ? /* @__PURE__ */ (0, L.jsx)(y, {
							size: "sm",
							variant: "outline",
							disabled: !Z.length,
							onClick: () => void pe("archive", Z.map((e) => e.id)),
							children: fe.archive
						}) : /* @__PURE__ */ (0, L.jsx)(y, {
							size: "sm",
							variant: "outline",
							disabled: !Z.length,
							onClick: () => void pe("restore", Z.map((e) => e.id)),
							children: fe.restore
						}),
						/* @__PURE__ */ (0, L.jsx)(y, {
							size: "sm",
							variant: "outline",
							disabled: !Z.length,
							onClick: () => void pe("charged", Z.map((e) => e.id)),
							children: fe.charged
						}),
						/* @__PURE__ */ (0, L.jsx)(y, {
							size: "sm",
							variant: "outline",
							disabled: !Z.length,
							onClick: () => void pe("free", Z.map((e) => e.id)),
							children: fe.free
						}),
						/* @__PURE__ */ (0, L.jsxs)("select", {
							"aria-label": "Move to category",
							className: "h-8 rounded-md border bg-background px-2 text-sm",
							value: ne,
							onChange: (e) => V(e.target.value),
							children: [/* @__PURE__ */ (0, L.jsx)("option", {
								value: "",
								children: "Uncategorized"
							}), n.map((e) => /* @__PURE__ */ (0, L.jsx)("option", {
								value: e,
								children: e
							}, e))]
						}),
						/* @__PURE__ */ (0, L.jsx)(y, {
							size: "sm",
							variant: "outline",
							disabled: !Z.length,
							onClick: () => void pe("category", Z.map((e) => e.id), { category: ne }),
							children: fe.category
						})
					] })
				]
			}),
			ee && /* @__PURE__ */ (0, L.jsx)("p", {
				className: "text-sm text-muted-foreground",
				children: ee
			}),
			/* @__PURE__ */ (0, L.jsxs)("div", {
				className: "grid gap-2 sm:grid-cols-2 xl:grid-cols-3",
				children: [oe.map((t) => /* @__PURE__ */ (0, L.jsxs)("div", {
					className: M("flex gap-3 rounded-xl border bg-card p-3", (!(t.active && t.free) || t.archived) && "opacity-60", F.has(t.id) && "ring-2 ring-primary"),
					children: [
						/* @__PURE__ */ (0, L.jsx)(p, {
							className: "mt-1",
							"aria-label": `Select ${t.name}`,
							checked: F.has(t.id),
							onCheckedChange: (e) => ce([t.id], e === !0)
						}),
						t.photo ? /* @__PURE__ */ (0, L.jsx)("img", {
							src: t.photo,
							alt: "",
							className: "size-16 rounded-lg object-cover"
						}) : /* @__PURE__ */ (0, L.jsx)("span", {
							className: "grid size-16 place-items-center rounded-lg bg-muted text-2xl",
							children: "👤"
						}),
						/* @__PURE__ */ (0, L.jsxs)("div", {
							className: "grid min-w-0 gap-0.5",
							children: [
								/* @__PURE__ */ (0, L.jsx)("b", { children: t.name }),
								/* @__PURE__ */ (0, L.jsxs)(be, { children: ["🗂️ ", J(t) || "Uncategorized"] }),
								/* @__PURE__ */ (0, L.jsx)(be, { children: [
									t.staff_code && "ID " + t.staff_code,
									t.department,
									t.room && "Room " + t.room
								].filter(Boolean).join(" · ") }),
								/* @__PURE__ */ (0, L.jsxs)(be, { children: [t.archived ? "🗄 Archived" : t.active && t.free ? t.charged ? "💵 Paid · 1 SAR a piece" : "🆓 Free laundry" : "⛔ Not active", !t.charged && Object.keys(t.limits || {}).some((e) => e !== "enforce" && t.limits[e]) ? " · " + ae(d.sar, t.limits) : ""] }),
								/* @__PURE__ */ (0, L.jsxs)("span", {
									className: "mt-1 flex flex-wrap gap-1",
									children: [
										/* @__PURE__ */ (0, L.jsx)(y, {
											size: "sm",
											variant: "outline",
											onClick: () => _(t.id),
											children: "📒 History"
										}),
										/* @__PURE__ */ (0, L.jsx)(y, {
											size: "sm",
											variant: "outline",
											onClick: () => he([t.id]),
											children: "🖨 Bills"
										}),
										e && /* @__PURE__ */ (0, L.jsxs)(L.Fragment, { children: [
											/* @__PURE__ */ (0, L.jsx)(y, {
												size: "sm",
												variant: "outline",
												onClick: () => g(t),
												children: "✏️ Edit"
											}),
											/* @__PURE__ */ (0, L.jsx)(y, {
												size: "sm",
												variant: "outline",
												onClick: () => void pe(t.charged ? "free" : "charged", [t.id]),
												children: t.charged ? "🆓 Make free" : "💵 Make paid"
											}),
											/* @__PURE__ */ (0, L.jsx)(y, {
												size: "sm",
												variant: "outline",
												onClick: () => void pe(t.archived ? "restore" : "archive", [t.id]),
												children: t.archived ? fe.restore : fe.archive
											}),
											/* @__PURE__ */ (0, L.jsx)(y, {
												size: "sm",
												variant: "outline",
												className: "text-destructive",
												onClick: () => void de(t),
												children: "🗑 Delete"
											})
										] })
									]
								})
							]
						})
					]
				}, t.id)), !oe.length && /* @__PURE__ */ (0, L.jsx)("p", {
					className: "text-sm text-muted-foreground",
					children: Y.length ? "Nobody matches." : P === "archived" ? "Nobody is archived." : "No staff yet."
				})]
			}),
			/* @__PURE__ */ (0, L.jsx)(f, {
				open: U.open,
				onOpenChange: (e) => W((t) => ({
					...t,
					open: e
				})),
				children: /* @__PURE__ */ (0, L.jsxs)(l, {
					className: "max-w-sm",
					children: [
						/* @__PURE__ */ (0, L.jsx)(s, { children: /* @__PURE__ */ (0, L.jsx)(u, { children: "🖨 Person-wise bills" }) }),
						/* @__PURE__ */ (0, L.jsxs)("p", {
							className: "text-sm text-muted-foreground",
							children: [G.current.length === 1 ? t.find((e) => e.id === G.current[0])?.name : `${G.current.length} people`, " — one page each, dates and pieces only."]
						}),
						/* @__PURE__ */ (0, L.jsxs)("div", {
							className: "grid grid-cols-2 gap-2",
							children: [/* @__PURE__ */ (0, L.jsxs)("div", {
								className: "grid gap-1",
								children: [/* @__PURE__ */ (0, L.jsx)(v, { children: "From" }), /* @__PURE__ */ (0, L.jsx)(w, {
									type: "date",
									value: U.from,
									onChange: (e) => W((t) => ({
										...t,
										from: e.target.value || t.from
									}))
								})]
							}), /* @__PURE__ */ (0, L.jsxs)("div", {
								className: "grid gap-1",
								children: [/* @__PURE__ */ (0, L.jsx)(v, { children: "To" }), /* @__PURE__ */ (0, L.jsx)(w, {
									type: "date",
									value: U.to,
									onChange: (e) => W((t) => ({
										...t,
										to: e.target.value || t.to
									}))
								})]
							})]
						}),
						/* @__PURE__ */ (0, L.jsx)(y, {
							disabled: U.busy,
							onClick: () => void me(G.current),
							children: U.busy ? "Loading…" : "🖨 Print"
						})
					]
				})
			})
		]
	});
}
function Fe() {
	let { isAdmin: e, api: t, libs: n, info: r, setInfo: i, site: a } = z(), { jeddahDate: o, jeddahTime: s } = n, [c, l] = (0, I.useState)(r), [u, d] = (0, I.useState)(""), { data: f, err: p } = re(async () => {
		try {
			let e = (await t("GET", `/api/settings?site=${a}`)).settings.laundry_info || n.DEFAULT_INFO;
			i(e), l(e);
		} catch {}
		return (await t("GET", "/api/laundry/audit")).audit;
	}, []);
	return /* @__PURE__ */ (0, L.jsxs)("div", {
		className: "grid gap-3",
		children: [/* @__PURE__ */ (0, L.jsxs)(C, { children: [/* @__PURE__ */ (0, L.jsx)(S, { children: /* @__PURE__ */ (0, L.jsx)(b, {
			className: "text-base",
			children: "Notice for the laundry screen and receipts"
		}) }), /* @__PURE__ */ (0, L.jsxs)(x, {
			className: "grid gap-2",
			children: [/* @__PURE__ */ (0, L.jsx)(te, {
				rows: 4,
				maxLength: 600,
				readOnly: !e,
				value: c,
				onChange: (e) => l(e.target.value)
			}), /* @__PURE__ */ (0, L.jsxs)("div", {
				className: "flex items-center gap-2",
				children: [/* @__PURE__ */ (0, L.jsx)("span", {
					className: "grow text-sm text-muted-foreground",
					children: u
				}), e && /* @__PURE__ */ (0, L.jsx)(y, {
					onClick: async () => {
						try {
							await t("PUT", "/api/settings", {
								settings: { laundry_info: c.trim() },
								site: a
							}), i(c.trim()), d("Saved — shown on the laundry screen and receipts.");
						} catch (e) {
							d(e.message);
						}
					},
					children: "Save notice"
				})]
			})]
		})] }), /* @__PURE__ */ (0, L.jsxs)(C, { children: [/* @__PURE__ */ (0, L.jsx)(S, { children: /* @__PURE__ */ (0, L.jsx)(b, {
			className: "text-base",
			children: "Laundry change log"
		}) }), /* @__PURE__ */ (0, L.jsx)(x, { children: p ? /* @__PURE__ */ (0, L.jsx)(B, { e: p }) : f ? /* @__PURE__ */ (0, L.jsx)("ul", {
			className: "grid gap-1.5 text-sm",
			children: f.length ? f.map((e, t) => /* @__PURE__ */ (0, L.jsxs)("li", { children: [/* @__PURE__ */ (0, L.jsxs)("small", {
				className: "block text-xs text-muted-foreground",
				children: [
					o(e.at),
					" ",
					s(e.at),
					" · ",
					e.desk || "",
					" · ",
					String(e.action).replace("laundry-", "")
				]
			}), e.detail || ""] }, t)) : /* @__PURE__ */ (0, L.jsx)("li", {
				className: "text-muted-foreground",
				children: "Nothing yet."
			})
		}) : /* @__PURE__ */ (0, L.jsx)(K, {}) })] })]
	});
}
// src/pages/laundry-admin/dialogs.tsx
var Ie = ({ children: e }) => /* @__PURE__ */ (0, L.jsx)("small", {
	className: "block text-xs text-muted-foreground",
	children: e
}), $ = (e, t, n = "") => /* @__PURE__ */ (0, L.jsxs)("div", {
	className: M("grid gap-1", n),
	children: [/* @__PURE__ */ (0, L.jsx)(v, { children: e }), t]
});
function Le({ bill: e, onClose: t, onEdit: n, onChanged: r }) {
	let { api: i, isAdmin: a, libs: o, staff: c, prompt: p, billIndex: m } = z(), { sar: h, jeddahDate: g, jeddahTime: _ } = o, [v, b] = (0, I.useState)([]), [x, S] = (0, I.useState)(""), C = e;
	(0, I.useEffect)(() => {
		S(""), b([]), C && i("GET", "/api/laundry/audit").then((e) => b(e.audit.filter((e) => (e.detail || "").includes(C.receipt_no)))).catch(() => {});
	}, [C?.id, C?.version]);
	async function w() {
		if (!C) return;
		let e = await p({
			title: `Cancel ${C.receipt_no} (${C.kind === "free" ? "free" : h(C.paid) + " SAR"})?`,
			body: "It stays in the records, marked cancelled. Reason:"
		});
		if (e) try {
			let n = await i("POST", `/api/laundry/bills/${C.id}/void`, { reason: e });
			m.current.set(C.id, n.bill), t(), r();
		} catch (e) {
			S(e.message);
		}
	}
	return C?.kind === "free" && c.find((e) => e.id === C.staff_id), /* @__PURE__ */ (0, L.jsx)(f, {
		open: !!C,
		onOpenChange: (e) => !e && t(),
		children: /* @__PURE__ */ (0, L.jsx)(l, {
			className: "max-h-[92vh] max-w-[calc(100%-1rem)] overflow-y-auto sm:max-w-4xl",
			children: C && /* @__PURE__ */ (0, L.jsxs)(L.Fragment, { children: [/* @__PURE__ */ (0, L.jsxs)(s, { children: [/* @__PURE__ */ (0, L.jsxs)(u, { children: [
				C.receipt_no,
				" ",
				C.voided ? /* @__PURE__ */ (0, L.jsx)(P, {
					variant: "destructive",
					children: "❌ CANCELLED"
				}) : null
			] }), /* @__PURE__ */ (0, L.jsx)(d, {
				className: "sr-only",
				children: "Bill details"
			})] }), /* @__PURE__ */ (0, L.jsxs)("div", {
				className: "grid gap-4 md:grid-cols-2",
				children: [/* @__PURE__ */ (0, L.jsx)("div", {
					className: "overflow-auto rounded-lg border bg-white p-2",
					dangerouslySetInnerHTML: { __html: o.laundry.receiptHTML(C, "") }
				}), /* @__PURE__ */ (0, L.jsxs)("div", {
					className: "grid content-start gap-2 text-sm",
					children: [
						C.kind === "free" && /* @__PURE__ */ (0, L.jsxs)("div", {
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ (0, L.jsx)(Ce, {
								id: C.staff_id,
								cls: "size-12"
							}), /* @__PURE__ */ (0, L.jsxs)("div", { children: [/* @__PURE__ */ (0, L.jsx)("b", { children: C.staff_name }), /* @__PURE__ */ (0, L.jsxs)(Ie, { children: [
								"Free staff laundry · value ",
								h(C.value),
								" SAR · paid 0"
							] })] })]
						}),
						null,
						/* @__PURE__ */ (0, L.jsxs)("dl", {
							className: "grid grid-cols-[auto_1fr] gap-x-3 gap-y-1",
							children: [
								/* @__PURE__ */ (0, L.jsx)("dt", {
									className: "text-muted-foreground",
									children: "Given"
								}),
								/* @__PURE__ */ (0, L.jsxs)("dd", { children: [
									g(C.given_at),
									" ",
									_(C.given_at),
									" · by ",
									C.worker
								] }),
								C.kind === "paid" && /* @__PURE__ */ (0, L.jsxs)(L.Fragment, { children: [/* @__PURE__ */ (0, L.jsx)("dt", {
									className: "text-muted-foreground",
									children: "Cash"
								}), /* @__PURE__ */ (0, L.jsx)("dd", { children: C.settled_at ? /* @__PURE__ */ (0, L.jsxs)(L.Fragment, { children: [
									/* @__PURE__ */ (0, L.jsx)(P, { children: "Paid" }),
									" ",
									g(C.settled_at),
									" ",
									_(C.settled_at),
									C.settled_by ? " · marked by " + C.settled_by : "",
									C.settlement_id ? ` · payment #${C.settlement_id}` : ""
								] }) : /* @__PURE__ */ (0, L.jsx)(P, {
									variant: "outline",
									children: "Unpaid"
								}) })] }),
								C.old_receipt_no && C.old_receipt_no !== C.receipt_no && /* @__PURE__ */ (0, L.jsxs)(L.Fragment, { children: [/* @__PURE__ */ (0, L.jsx)("dt", {
									className: "text-muted-foreground",
									children: "Earlier No."
								}), /* @__PURE__ */ (0, L.jsxs)("dd", { children: [
									/* @__PURE__ */ (0, L.jsx)("span", {
										className: "font-mono",
										children: C.old_receipt_no
									}),
									" ",
									/* @__PURE__ */ (0, L.jsx)("small", {
										className: "text-muted-foreground",
										children: "(printed before the 4 Oct renumbering)"
									})
								] })] }),
								C.customer?.group && /* @__PURE__ */ (0, L.jsxs)(L.Fragment, { children: [/* @__PURE__ */ (0, L.jsx)("dt", {
									className: "text-muted-foreground",
									children: "Group"
								}), /* @__PURE__ */ (0, L.jsxs)("dd", { children: [C.customer.group, C.customer.building ? " · " + C.customer.building : ""] })] }),
								C.customer?.contact && /* @__PURE__ */ (0, L.jsxs)(L.Fragment, { children: [/* @__PURE__ */ (0, L.jsx)("dt", {
									className: "text-muted-foreground",
									children: "Contact"
								}), /* @__PURE__ */ (0, L.jsx)("dd", { children: C.customer.contact })] }),
								C.approval_by && /* @__PURE__ */ (0, L.jsxs)(L.Fragment, { children: [/* @__PURE__ */ (0, L.jsx)("dt", {
									className: "text-muted-foreground",
									children: "Approved by"
								}), /* @__PURE__ */ (0, L.jsx)("dd", { children: C.approval_by })] }),
								C.warnings?.length ? /* @__PURE__ */ (0, L.jsxs)(L.Fragment, { children: [/* @__PURE__ */ (0, L.jsx)("dt", {
									className: "text-muted-foreground",
									children: "Limits"
								}), /* @__PURE__ */ (0, L.jsx)("dd", {
									className: "text-warn",
									children: C.warnings.map((e, t) => /* @__PURE__ */ (0, L.jsxs)("span", { children: [e, /* @__PURE__ */ (0, L.jsx)("br", {})] }, t))
								})] }) : null,
								C.voided && /* @__PURE__ */ (0, L.jsxs)(L.Fragment, { children: [/* @__PURE__ */ (0, L.jsx)("dt", {
									className: "text-muted-foreground",
									children: "Cancelled"
								}), /* @__PURE__ */ (0, L.jsx)("dd", { children: C.void_reason || "" })] }),
								C.updated_by && /* @__PURE__ */ (0, L.jsxs)(L.Fragment, { children: [/* @__PURE__ */ (0, L.jsx)("dt", {
									className: "text-muted-foreground",
									children: "Last change"
								}), /* @__PURE__ */ (0, L.jsxs)("dd", { children: [
									C.updated_by,
									" · ",
									g(C.updated_at),
									" ",
									_(C.updated_at)
								] })] })
							]
						}),
						/* @__PURE__ */ (0, L.jsx)("h3", {
							className: "font-bold",
							children: "History"
						}),
						v.length ? /* @__PURE__ */ (0, L.jsx)("ul", {
							className: "grid gap-1",
							children: v.map((e, t) => /* @__PURE__ */ (0, L.jsxs)("li", { children: [/* @__PURE__ */ (0, L.jsxs)("small", {
								className: "block text-xs text-muted-foreground",
								children: [
									g(e.at),
									" ",
									_(e.at),
									" · ",
									e.desk || ""
								]
							}), e.detail] }, t))
						}) : /* @__PURE__ */ (0, L.jsx)("p", {
							className: "text-muted-foreground",
							children: "No changes since it was saved."
						}),
						x && /* @__PURE__ */ (0, L.jsx)("p", {
							className: "text-destructive",
							children: x
						}),
						/* @__PURE__ */ (0, L.jsxs)("div", {
							className: "flex flex-wrap gap-2",
							children: [/* @__PURE__ */ (0, L.jsx)(y, {
								variant: "outline",
								onClick: () => o.laundry.printReceipt(C, o.info),
								children: "🖨 Reprint"
							}), a && !C.voided && /* @__PURE__ */ (0, L.jsxs)(L.Fragment, { children: [/* @__PURE__ */ (0, L.jsx)(y, {
								variant: "outline",
								onClick: () => n(C),
								children: "✏️ Edit"
							}), /* @__PURE__ */ (0, L.jsx)(y, {
								variant: "outline",
								className: "text-destructive",
								onClick: () => void w(),
								children: "❌ Cancel bill"
							})] })]
						})
					]
				})]
			})] })
		})
	});
}
function Re({ bill: e, onClose: t, onSaved: n }) {
	let { api: r, items: i, libs: a, billIndex: o } = z(), p = e, [m, h] = (0, I.useState)(/* @__PURE__ */ new Map()), [g, _] = (0, I.useState)({}), [v, b] = (0, I.useState)("");
	if ((0, I.useEffect)(() => {
		p && (h(new Map(p.lines.map((e) => [e.item_id, e.qty]))), _({ ...p.customer || {} }), b(""));
	}, [p?.id, p?.version]), !p) return /* @__PURE__ */ (0, L.jsx)(f, {
		open: !1,
		onOpenChange: () => {},
		children: /* @__PURE__ */ (0, L.jsx)(l, { children: /* @__PURE__ */ (0, L.jsx)(u, {}) })
	});
	let x = new Map(p.lines.map((e) => [e.item_id, e])), S = i.filter((e) => e.active && !m.has(e.id) && (e.category || "guest") === (p.kind === "building" ? "building" : "guest"));
	async function C(e) {
		if (e.preventDefault(), !m.size) {
			b("A bill needs at least one item. To remove it completely, cancel the bill instead.");
			return;
		}
		let t = {
			version: p.version,
			lines: [...m].map(([e, t]) => ({
				item_id: e,
				qty: t
			}))
		};
		p.kind === "paid" && (t.customer = {
			name: g.name || "",
			room: g.room || "",
			building: g.building || "",
			group: g.group || "",
			contact: g.contact || ""
		}, t.method = "cash", t.received = "");
		try {
			let e = await r("PUT", `/api/laundry/bills/${p.id}`, t);
			o.current.set(p.id, e.bill), n(e.bill);
		} catch (e) {
			b(e.message);
		}
	}
	let T = (e) => (t) => _((n) => ({
		...n,
		[e]: t.target.value
	}));
	return /* @__PURE__ */ (0, L.jsx)(f, {
		open: !0,
		onOpenChange: (e) => !e && t(),
		children: /* @__PURE__ */ (0, L.jsx)(l, {
			className: "max-h-[92vh] max-w-[calc(100%-1rem)] overflow-y-auto sm:max-w-lg",
			children: /* @__PURE__ */ (0, L.jsxs)("form", {
				className: "grid gap-3",
				onSubmit: (e) => void C(e),
				children: [
					/* @__PURE__ */ (0, L.jsxs)(s, { children: [/* @__PURE__ */ (0, L.jsxs)(u, { children: ["✏️ Edit ", p.receipt_no] }), /* @__PURE__ */ (0, L.jsx)(d, {
						className: "sr-only",
						children: "Edit the bill"
					})] }),
					p.kind === "paid" ? /* @__PURE__ */ (0, L.jsxs)("div", {
						className: "grid gap-2 sm:grid-cols-2",
						children: [
							$("Name", /* @__PURE__ */ (0, L.jsx)(w, {
								value: g.name || "",
								onChange: T("name")
							})),
							$("Room", /* @__PURE__ */ (0, L.jsx)(w, {
								value: g.room || "",
								onChange: T("room")
							})),
							$("Building", /* @__PURE__ */ (0, L.jsx)(w, {
								value: g.building || "",
								onChange: T("building")
							})),
							$("Group", /* @__PURE__ */ (0, L.jsx)(w, {
								value: g.group || "",
								onChange: T("group")
							})),
							$("Contact", /* @__PURE__ */ (0, L.jsx)(w, {
								value: g.contact || "",
								onChange: T("contact")
							}))
						]
					}) : p.kind === "building" ? /* @__PURE__ */ (0, L.jsx)("p", { children: "🏨 Building linen" }) : /* @__PURE__ */ (0, L.jsxs)("p", { children: [
						"👷 ",
						p.staff_name,
						" (staff only)"
					] }),
					/* @__PURE__ */ (0, L.jsx)(j, { children: /* @__PURE__ */ (0, L.jsx)(D, { children: [...m].map(([e, t]) => {
						let n = x.get(e) || i.find((t) => t.id === e) || {
							name: "?",
							price: 0
						};
						return /* @__PURE__ */ (0, L.jsxs)(A, { children: [/* @__PURE__ */ (0, L.jsxs)(k, { children: [
							n.name,
							" ",
							/* @__PURE__ */ (0, L.jsxs)("small", {
								className: "text-muted-foreground",
								children: [
									a.sar(n.price),
									" SAR",
									x.has(e) ? "" : " (today's price)"
								]
							})
						] }), /* @__PURE__ */ (0, L.jsxs)(k, {
							className: "text-right",
							children: [
								/* @__PURE__ */ (0, L.jsx)(y, {
									type: "button",
									size: "sm",
									variant: "outline",
									onClick: () => h((n) => {
										let r = new Map(n);
										return t > 1 ? r.set(e, t - 1) : r.delete(e), r;
									}),
									children: "−"
								}),
								" ",
								/* @__PURE__ */ (0, L.jsx)("b", {
									className: "mx-1",
									children: t
								}),
								" ",
								/* @__PURE__ */ (0, L.jsx)(y, {
									type: "button",
									size: "sm",
									variant: "outline",
									onClick: () => h((n) => new Map(n).set(e, t + 1)),
									children: "+"
								})
							]
						})] }, e);
					}) }) }),
					/* @__PURE__ */ (0, L.jsxs)("select", {
						"aria-label": "Add an item",
						className: "h-9 rounded-md border bg-background px-2 text-sm",
						value: "",
						onChange: (e) => {
							let t = Number(e.target.value);
							t && h((e) => new Map(e).set(t, 1));
						},
						children: [/* @__PURE__ */ (0, L.jsx)("option", {
							value: "",
							children: "➕ Add an item…"
						}), S.map((e) => /* @__PURE__ */ (0, L.jsxs)("option", {
							value: e.id,
							children: [
								e.name,
								" · ",
								a.sar(e.price),
								" SAR"
							]
						}, e.id))]
					}),
					/* @__PURE__ */ (0, L.jsx)("p", {
						className: "text-xs text-muted-foreground",
						children: "Lines already on the bill keep the price they were billed at. Every change is written to the history."
					}),
					v && /* @__PURE__ */ (0, L.jsx)("p", {
						className: "text-sm text-destructive",
						children: v
					}),
					/* @__PURE__ */ (0, L.jsxs)(c, {
						className: "gap-2",
						children: [/* @__PURE__ */ (0, L.jsx)(y, {
							type: "button",
							variant: "outline",
							onClick: t,
							children: "Cancel"
						}), /* @__PURE__ */ (0, L.jsx)(y, {
							type: "submit",
							children: "Save changes"
						})]
					})
				]
			})
		})
	});
}
function ze({ id: e, onClose: t, onBill: n }) {
	let { api: r, libs: i, fmtDay: a, indexBills: o, billIndex: c } = z(), { sar: p, jeddahTime: m } = i, [h, g] = (0, I.useState)(null), [_, v] = (0, I.useState)("");
	(0, I.useEffect)(() => {
		g(null), v(""), e != null && r("GET", `/api/laundry/staff/${e}?bills=1`).then((e) => {
			o(e.bills || []), g(e);
		}).catch((e) => v(e.message));
	}, [e]);
	let y = h?.staff, b = h?.bills || [], x = b.filter((e) => !e.voided), S = /* @__PURE__ */ new Map();
	for (let e of x) {
		let t = S.get(e.day.slice(0, 7)) || {
			m: e.day.slice(0, 7),
			bills: 0,
			items: 0,
			value: 0
		};
		t.bills++, t.items += e.items, t.value += e.value, S.set(t.m, t);
	}
	return /* @__PURE__ */ (0, L.jsx)(f, {
		open: e != null,
		onOpenChange: (e) => !e && t(),
		children: /* @__PURE__ */ (0, L.jsxs)(l, {
			className: "max-h-[92vh] max-w-[calc(100%-1rem)] overflow-y-auto sm:max-w-3xl",
			children: [
				/* @__PURE__ */ (0, L.jsxs)(s, { children: [/* @__PURE__ */ (0, L.jsx)(u, { children: y?.name ?? "Staff history" }), /* @__PURE__ */ (0, L.jsx)(d, {
					className: "sr-only",
					children: "Free laundry history"
				})] }),
				_ && /* @__PURE__ */ (0, L.jsx)("p", {
					className: "text-sm text-destructive",
					children: _
				}),
				y && /* @__PURE__ */ (0, L.jsxs)(L.Fragment, { children: [
					/* @__PURE__ */ (0, L.jsxs)("div", {
						className: "flex gap-3",
						children: [y.photo ? /* @__PURE__ */ (0, L.jsx)("img", {
							src: y.photo,
							alt: "",
							className: "size-24 rounded-lg object-cover"
						}) : /* @__PURE__ */ (0, L.jsx)("span", {
							className: "grid size-24 place-items-center rounded-lg bg-muted text-3xl",
							children: "👤"
						}), /* @__PURE__ */ (0, L.jsxs)("div", {
							className: "grid gap-2",
							children: [
								/* @__PURE__ */ (0, L.jsx)("p", {
									className: "text-sm",
									children: [
										y.staff_code && "ID " + y.staff_code,
										y.department,
										y.room && "Room " + y.room,
										y.contact
									].filter(Boolean).join(" · ")
								}),
								/* @__PURE__ */ (0, L.jsxs)("div", {
									className: "flex flex-wrap gap-2",
									children: [
										/* @__PURE__ */ (0, L.jsx)(V, {
											icon: "🧾",
											value: x.length,
											label: "transactions"
										}),
										/* @__PURE__ */ (0, L.jsx)(V, {
											icon: "👕",
											value: x.reduce((e, t) => e + t.items, 0),
											label: "clothes"
										}),
										/* @__PURE__ */ (0, L.jsx)(V, {
											icon: "🏷️",
											value: p(x.reduce((e, t) => e + t.value, 0)),
											label: "value SAR",
											tone: "big"
										}),
										/* @__PURE__ */ (0, L.jsx)(V, {
											icon: "💵",
											value: 0,
											label: "paid SAR"
										})
									]
								}),
								/* @__PURE__ */ (0, L.jsxs)("p", {
									className: "text-xs text-muted-foreground",
									children: [
										"This month so far: ",
										h.usage.month_bills,
										" times · ",
										h.usage.month_items,
										" clothes · ",
										p(h.usage.month_value),
										" SAR",
										y.limits && Object.keys(y.limits).some((e) => e !== "enforce" && y.limits[e]) ? ` · limits: ${ae(p, y.limits)}` : ""
									]
								})
							]
						})]
					}),
					/* @__PURE__ */ (0, L.jsx)("h3", {
						className: "font-bold",
						children: "By month"
					}),
					/* @__PURE__ */ (0, L.jsxs)(j, { children: [/* @__PURE__ */ (0, L.jsx)(O, { children: /* @__PURE__ */ (0, L.jsxs)(A, { children: [
						/* @__PURE__ */ (0, L.jsx)(T, { children: "Month" }),
						/* @__PURE__ */ (0, L.jsx)(T, {
							className: "text-right",
							children: "Submissions"
						}),
						/* @__PURE__ */ (0, L.jsx)(T, {
							className: "text-right",
							children: "Clothes"
						}),
						/* @__PURE__ */ (0, L.jsx)(T, {
							className: "text-right",
							children: "Laundry value"
						})
					] }) }), /* @__PURE__ */ (0, L.jsx)(D, { children: S.size ? [...S.values()].sort((e, t) => t.m.localeCompare(e.m)).map((e) => /* @__PURE__ */ (0, L.jsxs)(A, { children: [
						/* @__PURE__ */ (0, L.jsx)(k, { children: (/* @__PURE__ */ new Date(e.m + "-15T12:00:00Z")).toLocaleDateString("en-GB", {
							month: "long",
							year: "numeric"
						}) }),
						/* @__PURE__ */ (0, L.jsx)(k, {
							className: "text-right",
							children: e.bills
						}),
						/* @__PURE__ */ (0, L.jsx)(k, {
							className: "text-right",
							children: e.items
						}),
						/* @__PURE__ */ (0, L.jsxs)(k, {
							className: "text-right",
							children: [p(e.value), " SAR"]
						})
					] }, e.m)) : /* @__PURE__ */ (0, L.jsx)(A, { children: /* @__PURE__ */ (0, L.jsx)(k, {
						colSpan: 4,
						className: "text-muted-foreground",
						children: "No free laundry yet."
					}) }) })] }),
					/* @__PURE__ */ (0, L.jsx)("h3", {
						className: "font-bold",
						children: "Transaction history"
					}),
					/* @__PURE__ */ (0, L.jsxs)(j, { children: [/* @__PURE__ */ (0, L.jsx)(O, { children: /* @__PURE__ */ (0, L.jsxs)(A, { children: [
						/* @__PURE__ */ (0, L.jsx)(T, { children: "Date" }),
						/* @__PURE__ */ (0, L.jsx)(T, { children: "Given" }),
						/* @__PURE__ */ (0, L.jsx)(T, {
							className: "text-right",
							children: "Clothes"
						}),
						/* @__PURE__ */ (0, L.jsx)(T, {
							className: "text-right",
							children: "Value"
						}),
						/* @__PURE__ */ (0, L.jsx)(T, { children: "Accepted by" })
					] }) }), /* @__PURE__ */ (0, L.jsx)(D, { children: b.map((e) => /* @__PURE__ */ (0, L.jsxs)(A, {
						className: M("cursor-pointer hover:bg-accent/50", e.voided && "opacity-50 line-through"),
						onClick: () => n(c.current.get(e.id) || e),
						children: [
							/* @__PURE__ */ (0, L.jsx)(k, { children: a(e.day) }),
							/* @__PURE__ */ (0, L.jsx)(k, { children: m(e.given_at) }),
							/* @__PURE__ */ (0, L.jsx)(k, {
								className: "text-right",
								children: e.items
							}),
							/* @__PURE__ */ (0, L.jsxs)(k, {
								className: "text-right",
								children: [p(e.value), " SAR"]
							}),
							/* @__PURE__ */ (0, L.jsxs)(k, { children: [e.worker, e.voided ? " · ❌ cancelled" : ""] })
						]
					}, e.id)) })] })
				] })
			]
		})
	});
}
function Be({ item: e, open: t, onClose: n }) {
	let { api: r, site: i, items: a, setItems: o, libs: m } = z(), [h, g] = (0, I.useState)({}), [_, v] = (0, I.useState)(""), [b, x] = (0, I.useState)("");
	(0, I.useEffect)(() => {
		t && (g({
			name: e?.name || "",
			name_local: e?.name_local || "",
			price: e ? e.price / 100 : "",
			sort: e?.sort ?? a.length + 1,
			category: e?.category === "building" ? "building" : "guest",
			active: !e || e.active
		}), v(e?.image || ""), x(""));
	}, [t, e?.id]);
	let S = (e) => (t) => g((n) => ({
		...n,
		[e]: t.target.value
	}));
	async function C(t) {
		t.preventDefault();
		let a = {
			site: i,
			name: h.name,
			name_local: h.name_local,
			price: Number(h.price),
			sort: Number(h.sort),
			active: !!h.active,
			category: h.category,
			image: _
		};
		try {
			let t = await r(e ? "PUT" : "POST", e ? `/api/laundry/items/${e.id}` : "/api/laundry/items", a);
			o(t.items), n();
		} catch (e) {
			x(e.message);
		}
	}
	return /* @__PURE__ */ (0, L.jsx)(f, {
		open: t,
		onOpenChange: (e) => !e && n(),
		children: /* @__PURE__ */ (0, L.jsx)(l, {
			className: "max-h-[92vh] max-w-[calc(100%-1rem)] overflow-y-auto sm:max-w-lg",
			children: /* @__PURE__ */ (0, L.jsxs)("form", {
				className: "grid gap-3",
				onSubmit: (e) => void C(e),
				children: [
					/* @__PURE__ */ (0, L.jsxs)(s, { children: [/* @__PURE__ */ (0, L.jsx)(u, { children: e ? "✏️ " + e.name : "➕ New item" }), /* @__PURE__ */ (0, L.jsx)(d, {
						className: "sr-only",
						children: "Item"
					})] }),
					/* @__PURE__ */ (0, L.jsxs)("div", {
						className: "flex items-center gap-3",
						children: [/* @__PURE__ */ (0, L.jsx)(H, {
							item: {
								image: _,
								name: h.name
							},
							cls: "la-ipic huge"
						}), /* @__PURE__ */ (0, L.jsxs)("div", {
							className: "grid gap-2",
							children: [
								/* @__PURE__ */ (0, L.jsxs)("label", {
									className: "cursor-pointer rounded-md border px-3 py-1.5 text-sm",
									children: ["📷 Take / choose a photo", /* @__PURE__ */ (0, L.jsx)("input", {
										hidden: !0,
										type: "file",
										accept: "image/*",
										capture: "environment",
										onChange: async (e) => {
											try {
												v(await m.laundry.shrinkImage(e.target.files[0], 320));
											} catch (e) {
												x(e.message);
											}
										}
									})]
								}),
								/* @__PURE__ */ (0, L.jsx)(w, {
									maxLength: 8,
									placeholder: "or an emoji 👕",
									value: _.startsWith("data:") ? "" : _,
									onChange: (e) => v(e.target.value.trim())
								}),
								/* @__PURE__ */ (0, L.jsx)(y, {
									type: "button",
									variant: "outline",
									size: "sm",
									onClick: () => v(""),
									children: "Remove picture"
								})
							]
						})]
					}),
					/* @__PURE__ */ (0, L.jsx)("p", {
						className: "text-xs text-muted-foreground",
						children: "A clear photo of the item helps workers who do not read."
					}),
					/* @__PURE__ */ (0, L.jsxs)("div", {
						className: "grid gap-2 sm:grid-cols-2",
						children: [
							$("Name", /* @__PURE__ */ (0, L.jsx)(w, {
								required: !0,
								maxLength: 40,
								value: h.name || "",
								onChange: S("name")
							})),
							$("Name in another language", /* @__PURE__ */ (0, L.jsx)(w, {
								maxLength: 40,
								placeholder: "optional",
								value: h.name_local || "",
								onChange: S("name_local")
							})),
							$("Price (SAR)", /* @__PURE__ */ (0, L.jsx)(w, {
								type: "number",
								min: 0,
								max: 1e3,
								step: .25,
								required: !0,
								value: h.price ?? "",
								onChange: S("price")
							})),
							$("Order on the screen", /* @__PURE__ */ (0, L.jsx)(w, {
								type: "number",
								step: 1,
								value: h.sort ?? "",
								onChange: S("sort")
							})),
							$("Tab", /* @__PURE__ */ (0, L.jsxs)("select", {
								className: "h-9 rounded-md border bg-background px-2 text-sm",
								value: h.category,
								onChange: S("category"),
								children: [/* @__PURE__ */ (0, L.jsx)("option", {
									value: "guest",
									children: "🧺 Clothes (New bill · Staff only)"
								}), /* @__PURE__ */ (0, L.jsx)("option", {
									value: "building",
									children: "🏨 Building linen"
								})]
							}))
						]
					}),
					/* @__PURE__ */ (0, L.jsxs)("label", {
						className: "flex items-center gap-2 text-sm",
						children: [/* @__PURE__ */ (0, L.jsx)(p, {
							checked: !!h.active,
							onCheckedChange: (e) => g((t) => ({
								...t,
								active: e === !0
							}))
						}), " Show to the worker"]
					}),
					e && /* @__PURE__ */ (0, L.jsx)("p", {
						className: "text-xs text-muted-foreground",
						children: "Changing the price affects new bills only."
					}),
					b && /* @__PURE__ */ (0, L.jsx)("p", {
						className: "text-sm text-destructive",
						children: b
					}),
					/* @__PURE__ */ (0, L.jsxs)(c, {
						className: "gap-2",
						children: [/* @__PURE__ */ (0, L.jsx)(y, {
							type: "button",
							variant: "outline",
							onClick: n,
							children: "Cancel"
						}), /* @__PURE__ */ (0, L.jsx)(y, {
							type: "submit",
							children: "Save"
						})]
					})
				]
			})
		})
	});
}
function Ve({ staffRow: e, open: t, onClose: n }) {
	let { api: r, site: i, cats: a, setStaff: o, libs: m } = z(), h = e, [g, _] = (0, I.useState)({}), [v, b] = (0, I.useState)(""), [x, S] = (0, I.useState)("");
	(0, I.useEffect)(() => {
		if (!t) return;
		let e = h?.limits || {};
		_({
			name: h?.name || "",
			staff_code: h?.staff_code || "",
			room: h?.room || "",
			department: h?.department || "",
			contact: h?.contact || "",
			started_on: h?.started_on || "",
			category: h?.category || "",
			remarks: h?.remarks || "",
			free: !h || h.free,
			active: !h || h.active,
			charged: !!h?.charged,
			archived: !!h?.archived,
			per_bill_items: e.per_bill_items || "",
			per_day_items: e.per_day_items || "",
			per_week_items: e.per_week_items || "",
			per_month_value: e.per_month_value ? e.per_month_value / 100 : "",
			per_month_bills: e.per_month_bills || "",
			enforce: !!e.enforce
		}), b(h?.photo || ""), S("");
	}, [t, h?.id]);
	let C = (e) => (t) => _((n) => ({
		...n,
		[e]: t.target.value
	}));
	async function T(e) {
		e.preventDefault();
		let t = {
			site: i,
			name: g.name,
			staff_code: g.staff_code,
			room: g.room,
			department: g.department,
			contact: g.contact,
			category: g.category,
			started_on: g.started_on,
			remarks: g.remarks,
			free: !!g.free,
			active: !!g.active,
			charged: !!g.charged,
			archived: !!g.archived,
			photo: v,
			limits: {
				per_bill_items: g.per_bill_items,
				per_day_items: g.per_day_items,
				per_week_items: g.per_week_items,
				per_month_value: g.per_month_value,
				per_month_bills: g.per_month_bills,
				enforce: !!g.enforce
			}
		};
		try {
			let e = await r(h ? "PUT" : "POST", h ? `/api/laundry/staff/${h.id}` : "/api/laundry/staff", t);
			o(e.staff), n();
		} catch (e) {
			S(e.message);
		}
	}
	let E = (e, t) => /* @__PURE__ */ (0, L.jsxs)("label", {
		className: "flex items-center gap-2 text-sm",
		children: [
			/* @__PURE__ */ (0, L.jsx)(p, {
				checked: !!g[e],
				onCheckedChange: (t) => _((n) => ({
					...n,
					[e]: t === !0
				}))
			}),
			" ",
			t
		]
	}), D = (e, t, n = {}) => $(e, /* @__PURE__ */ (0, L.jsx)(w, {
		value: g[t] ?? "",
		onChange: C(t),
		...n
	}));
	return /* @__PURE__ */ (0, L.jsx)(f, {
		open: t,
		onOpenChange: (e) => !e && n(),
		children: /* @__PURE__ */ (0, L.jsx)(l, {
			className: "max-h-[92vh] max-w-[calc(100%-1rem)] overflow-y-auto sm:max-w-2xl",
			children: /* @__PURE__ */ (0, L.jsxs)("form", {
				className: "grid gap-3",
				onSubmit: (e) => void T(e),
				children: [
					/* @__PURE__ */ (0, L.jsxs)(s, { children: [/* @__PURE__ */ (0, L.jsx)(u, { children: h ? "✏️ " + h.name : "➕ Free-laundry staff" }), /* @__PURE__ */ (0, L.jsx)(d, {
						className: "sr-only",
						children: "Staff profile"
					})] }),
					/* @__PURE__ */ (0, L.jsxs)("div", {
						className: "flex items-center gap-3",
						children: [v ? /* @__PURE__ */ (0, L.jsx)("img", {
							src: v,
							alt: "",
							className: "size-20 rounded-lg object-cover"
						}) : /* @__PURE__ */ (0, L.jsx)("span", {
							className: "grid size-20 place-items-center rounded-lg bg-muted text-3xl",
							children: "👤"
						}), /* @__PURE__ */ (0, L.jsxs)("div", {
							className: "grid gap-2",
							children: [
								/* @__PURE__ */ (0, L.jsxs)("label", {
									className: "cursor-pointer rounded-md border px-3 py-1.5 text-sm",
									children: ["📷 Take / choose photo", /* @__PURE__ */ (0, L.jsx)("input", {
										hidden: !0,
										type: "file",
										accept: "image/*",
										capture: "user",
										onChange: async (e) => {
											try {
												b(await m.laundry.shrinkImage(e.target.files[0], 360, .82));
											} catch (e) {
												S(e.message);
											}
										}
									})]
								}),
								/* @__PURE__ */ (0, L.jsx)(y, {
									type: "button",
									variant: "outline",
									size: "sm",
									onClick: () => b(""),
									children: "Remove photo"
								}),
								/* @__PURE__ */ (0, L.jsx)("p", {
									className: "text-xs text-muted-foreground",
									children: "The worker checks this photo before accepting clothes."
								})
							]
						})]
					}),
					/* @__PURE__ */ (0, L.jsxs)("div", {
						className: "grid gap-2 sm:grid-cols-2",
						children: [
							D("Staff name", "name", {
								required: !0,
								maxLength: 80
							}),
							D("Staff ID", "staff_code", { maxLength: 30 }),
							D("Room / accommodation", "room", { maxLength: 20 }),
							D("Department", "department", { maxLength: 60 }),
							D("Mobile", "contact", { maxLength: 30 }),
							D("Free laundry from", "started_on", { type: "date" }),
							$("Category", /* @__PURE__ */ (0, L.jsxs)("select", {
								className: "h-9 rounded-md border bg-background px-2 text-sm",
								value: g.category || "",
								onChange: C("category"),
								children: [/* @__PURE__ */ (0, L.jsx)("option", {
									value: "",
									children: "Uncategorized"
								}), a.map((e) => /* @__PURE__ */ (0, L.jsx)("option", {
									value: e,
									children: e
								}, e))]
							}))
						]
					}),
					D("Remarks", "remarks", { maxLength: 300 }),
					/* @__PURE__ */ (0, L.jsxs)("div", {
						className: "grid gap-2 sm:grid-cols-2",
						children: [
							E("free", "Free laundry: YES"),
							E("active", "Active"),
							E("charged", "💵 Paid mode: 1 SAR a piece, own receipt series"),
							E("archived", "🗄 Archived (off the laundry screen)")
						]
					}),
					/* @__PURE__ */ (0, L.jsxs)("fieldset", {
						className: "grid gap-2 rounded-lg border p-3",
						children: [
							/* @__PURE__ */ (0, L.jsx)("legend", {
								className: "px-1 text-sm font-bold",
								children: "Limits (optional — leave empty for none)"
							}),
							/* @__PURE__ */ (0, L.jsxs)("div", {
								className: "grid gap-2 sm:grid-cols-2",
								children: [
									D("Max pieces per submission", "per_bill_items", {
										type: "number",
										min: 1
									}),
									D("Max pieces per day", "per_day_items", {
										type: "number",
										min: 1
									}),
									D("Max pieces per week", "per_week_items", {
										type: "number",
										min: 1
									}),
									D("Max value per month (SAR)", "per_month_value", {
										type: "number",
										min: 1,
										step: .5
									}),
									D("Max free bills per month", "per_month_bills", {
										type: "number",
										min: 1
									})
								]
							}),
							E("enforce", "Above a limit, the worker needs a supervisor's approval (otherwise only a warning)")
						]
					}),
					x && /* @__PURE__ */ (0, L.jsx)("p", {
						className: "text-sm text-destructive",
						children: x
					}),
					/* @__PURE__ */ (0, L.jsxs)(c, {
						className: "gap-2",
						children: [/* @__PURE__ */ (0, L.jsx)(y, {
							type: "button",
							variant: "outline",
							onClick: n,
							children: "Cancel"
						}), /* @__PURE__ */ (0, L.jsx)(y, {
							type: "submit",
							children: "Save"
						})]
					})
				]
			})
		})
	});
}
// src/pages/laundry-admin/LaundryAdminPage.tsx
var He = [
	["bills", "🧾 Bills"],
	["payments", "💰 Payments"],
	["reports", "📈 Reports"],
	["free", "👷 Staff only"],
	["building", "🏨 Building"],
	["prices", "🏷️ Prices"],
	["staff", "👤 Staff"],
	["notice", "📝 Notice & log"]
];
function Ue() {
	let { cloud: e } = r(), t = n(), a = i(), { site: s, siteId: c } = o(), { ask: l, dialog: u } = ee(), { ask: d, dialog: f } = N(), p = e.currentDesk(), v = p?.role === "admin" || p?.role === "siteadmin", y = v || p?.role === "desk" || p?.role === "siteadmin", [b, x] = (0, I.useState)(null), [S, C] = (0, I.useState)("bills"), [w, T] = (0, I.useState)([]), [E, D] = (0, I.useState)([]), [O, k] = (0, I.useState)([]), [A, j] = (0, I.useState)(""), [M, P] = (0, I.useState)(null), [te, R] = (0, I.useState)(null), [z, B] = (0, I.useState)(null), [V, H] = (0, I.useState)({
		open: !1,
		item: null
	}), [U, W] = (0, I.useState)({
		open: !1,
		row: null
	}), [G, re] = (0, I.useState)(0), K = (0, I.useRef)(/* @__PURE__ */ new Map()), q = (n, r, i) => t(e.request(n, r, i));
	(0, I.useEffect)(() => ((async () => {
		let [e, t] = await Promise.all([a("laundry"), a("lib")]);
		x({
			laundry: e,
			lib: t
		});
		let n = document.createElement("style");
		n.dataset.laundryReceipt = "1", n.textContent = e.RECEIPT_CSS, document.head.appendChild(n);
		try {
			let t = await q("GET", `/api/settings?site=${c}`);
			j(t.settings.laundry_info || e.DEFAULT_INFO), k(t.settings.laundry_staff_categories?.[c] || []);
		} catch {
			j(e.DEFAULT_INFO);
		}
		await Promise.all([J(), ae()]).catch(() => {});
	})(), () => {
		document.querySelectorAll("style[data-laundry-receipt]").forEach((e) => e.remove());
	}), []);
	let J = async () => T((await q("GET", `/api/laundry/items?site=${c}`)).items), ae = async () => D((await q("GET", `/api/laundry/staff?site=${c}&deleted=1`)).staff), Y = (0, I.useMemo)(() => b ? ie(b.laundry.jeddahDay) : null, [b]);
	if (!b || !Y) return /* @__PURE__ */ (0, L.jsx)("div", {
		className: "mx-auto max-w-[2400px] p-4 text-sm text-muted-foreground",
		children: "Loading…"
	});
	let X = {
		site: c,
		isAdmin: v,
		canPay: y,
		libs: {
			...b.laundry,
			laundry: b.laundry,
			lib: b.lib,
			addDays: Y.addDays,
			info: A
		},
		api: q,
		items: w,
		staff: E,
		cats: O,
		info: A,
		setItems: T,
		setStaff: D,
		setCats: k,
		setInfo: j,
		loadItems: J,
		loadStaff: ae,
		openBill: (e) => P(K.current.get(e.id) || e),
		openStaffHistory: B,
		openStaffForm: (e) => W({
			open: !0,
			row: e
		}),
		openItemForm: (e) => H({
			open: !0,
			item: e
		}),
		indexBills: (e) => {
			for (let t of e) K.current.set(t.id, t);
		},
		billIndex: K,
		fmtDay: Y.fmtDay,
		presets: Y.presets,
		confirm: l,
		prompt: d,
		refresh: () => re((e) => e + 1)
	};
	return /* @__PURE__ */ (0, L.jsxs)(ne, {
		value: X,
		children: [
			/* @__PURE__ */ (0, L.jsxs)("div", {
				className: "mx-auto grid grid-cols-[minmax(0,1fr)] max-w-[2400px] min-w-0 gap-3 px-3 pb-10 pt-4 sm:px-4",
				children: [/* @__PURE__ */ (0, L.jsx)(F, {
					view: "laundry-admin",
					title: "Laundry admin",
					current: He.find((e) => e[0] === S)?.[1].replace(/^\S+\s/, ""),
					children: /* @__PURE__ */ (0, L.jsxs)("span", {
						className: "text-sm text-muted-foreground",
						children: [
							s.label,
							" · ",
							v ? "admin" : y ? "desk · can mark cash paid" : "view only"
						]
					})
				}), /* @__PURE__ */ (0, L.jsxs)(_, {
					value: S,
					onValueChange: C,
					children: [
						/* @__PURE__ */ (0, L.jsx)(g, {
							variant: "underline",
							children: He.map(([e, t]) => /* @__PURE__ */ (0, L.jsx)(m, {
								value: e,
								children: t
							}, e))
						}),
						/* @__PURE__ */ (0, L.jsx)(h, {
							value: "bills",
							children: /* @__PURE__ */ (0, L.jsx)(Te, {})
						}, `bills-${G}`),
						/* @__PURE__ */ (0, L.jsx)(h, {
							value: "payments",
							children: /* @__PURE__ */ (0, L.jsx)(De, {})
						}, `payments-${G}`),
						/* @__PURE__ */ (0, L.jsx)(h, {
							value: "reports",
							children: /* @__PURE__ */ (0, L.jsx)(Oe, {})
						}, `reports-${G}`),
						/* @__PURE__ */ (0, L.jsx)(h, {
							value: "free",
							children: /* @__PURE__ */ (0, L.jsx)(ke, {})
						}, `free-${G}`),
						/* @__PURE__ */ (0, L.jsx)(h, {
							value: "building",
							children: /* @__PURE__ */ (0, L.jsx)(Ae, {})
						}, `building-${G}`),
						/* @__PURE__ */ (0, L.jsx)(h, {
							value: "prices",
							children: /* @__PURE__ */ (0, L.jsx)(je, {})
						}, `prices-${G}`),
						/* @__PURE__ */ (0, L.jsx)(h, {
							value: "staff",
							children: /* @__PURE__ */ (0, L.jsx)(Pe, {})
						}, `staff-${G}`),
						/* @__PURE__ */ (0, L.jsx)(h, {
							value: "notice",
							children: /* @__PURE__ */ (0, L.jsx)(Fe, {})
						}, `notice-${G}`)
					]
				})]
			}),
			/* @__PURE__ */ (0, L.jsx)(Le, {
				bill: M,
				onClose: () => P(null),
				onEdit: (e) => {
					P(null), R(e);
				},
				onChanged: X.refresh
			}),
			/* @__PURE__ */ (0, L.jsx)(Re, {
				bill: te,
				onClose: () => R(null),
				onSaved: (e) => {
					R(null), X.refresh(), P(e);
				}
			}),
			/* @__PURE__ */ (0, L.jsx)(ze, {
				id: z,
				onClose: () => B(null),
				onBill: (e) => {
					B(null), P(e);
				}
			}),
			/* @__PURE__ */ (0, L.jsx)(Be, {
				item: V.item,
				open: V.open,
				onClose: () => {
					H((e) => ({
						...e,
						open: !1
					})), X.refresh();
				}
			}),
			/* @__PURE__ */ (0, L.jsx)(Ve, {
				staffRow: U.row,
				open: U.open,
				onClose: () => {
					W((e) => ({
						...e,
						open: !1
					})), X.refresh();
				}
			}),
			u,
			f
		]
	});
}
export { Ue as default };
