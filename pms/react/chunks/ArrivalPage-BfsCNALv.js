import { c as e, f as t, h as n, i as r, n as i, o as a, p as o, s, u as c } from "./PmsContext-BVMd13Oi.js";
import { E as l } from "./query-DROYnevi.js";
import { t as u } from "./useQuery-BUXPY6q6.js";
import { t as d } from "./createLucideIcon-CQUC5AEZ.js";
import { t as f } from "./DayNav-CaC48u7r.js";
import { t as p } from "./image-down-DIpmmZZM.js";
import { t as ee } from "./plus-CPwEqLyF.js";
import { t as te } from "./printer-_t2PY0au.js";
import { t as m } from "./button-BGWa3SLr.js";
import { t as ne } from "./useSlips-DUKbzGma.js";
// node_modules/lucide-react/dist/esm/icons/eye-off.mjs
var h = {
	name: "eye-off",
	size: 24,
	node: [
		["path", {
			d: "M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49",
			key: "ct8e1f"
		}],
		["path", {
			d: "M14.084 14.158a3 3 0 0 1-4.242-4.242",
			key: "151rxh"
		}],
		["path", {
			d: "M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143",
			key: "13bj9a"
		}],
		["path", {
			d: "m2 2 20 20",
			key: "1ooewy"
		}]
	]
};
h.node;
var re = d(h), g = {
	name: "rotate-ccw",
	size: 24,
	node: [["path", {
		d: "M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8",
		key: "1357e3"
	}], ["path", {
		d: "M3 3v5h5",
		key: "1xhq8a"
	}]]
};
g.node;
var ie = d(g), _ = /* @__PURE__ */ n(o(), 1), v = (e) => String(e ?? "").replace(/[&<>"']/g, (e) => ({
	"&": "&amp;",
	"<": "&lt;",
	">": "&gt;",
	"\"": "&quot;",
	"'": "&#39;"
})[e]), y = (e) => String(e ?? "").trim().replace(/^S(?=\d)/i, ""), ae = {
	makkah: "JEDDAH",
	medina: "MADINA"
}, b = (e) => {
	let t = String(e || "").trim().toUpperCase();
	return t === "MEDINA" || t === "MADINAH" ? "MADINA" : t;
}, oe = (e) => e === "makkah" ? "medina" : "makkah", se = {
	medina: "madina",
	makkah: "mdmakkah"
}, x = (e, t) => e.localeCompare(t, void 0, { numeric: !0 }), S = (e, t) => {
	if (!e) return "";
	let n = [...new Set(["gents", "ladies"].flatMap((t) => (e.rooms?.[t] || []).map((e) => String(e.room_no || "").trim()).filter(Boolean)))], r = /* @__PURE__ */ new Map();
	for (let e of n) {
		let n = String(t(e) ?? "").trim();
		n && r.set(n, (r.get(n) || 0) + 1);
	}
	return [...r].sort((e, t) => t[1] - e[1] || x(e[0], t[0]))[0]?.[0] ?? "";
}, C = (e) => Number(e.total) || [
	"gents",
	"ladies",
	"children",
	"infants"
].reduce((t, n) => t + (Number(e[n]) || 0), 0), w = (e) => e ? {
	m: Number(e.gents) || 0,
	f: Number(e.ladies) || 0,
	c: Number(e.children) || 0,
	i: Number(e.infants) || 0
} : {
	m: null,
	f: null,
	c: null,
	i: null
};
function ce({ day: e, hostId: t, slips: n, buses: r, hours: i, libs: a }) {
	let { T: o, floorOf: s, shiftTime: c, byRoad: l } = a, u = n.filter((t) => !t.deleted && t.checkin_date === e), d = (t) => {
		let r = n.filter((e) => !e.deleted && y(e.sh_no) === t);
		return r.find((t) => t.checkin_date === e) || r[0];
	}, f = /* @__PURE__ */ new Set(), p = [], ee = {
		bus: 0,
		car: 1,
		other: 2
	};
	for (let e of r) {
		let t = e.at ? c(String(e.at).slice(0, 10), String(e.at).slice(11, 16), i.other) : null;
		for (let n of e.rows) {
			let r = d(y(n.ref));
			r && f.add(r.id);
			let i = String(o.vehicleNo(e.bus, e.vehicle, e.vlabel) || "");
			p.push({
				key: `bus|${i}|${String(n.ref ?? "")}`,
				kind: "bus",
				bus: i,
				time: t ? o.time12(`${t.date}T${t.time}`) : "",
				ref: String(n.ref ?? ""),
				group: String(n.operator || r?.tour_name || ""),
				leader: String(n.leader || r?.group_leader || "").trim(),
				floor: S(r, s),
				...w(r),
				pax: Number(n.pax) || (r ? C(r) : 0),
				order: [ee[e.vehicle] ?? 3, e.bus ?? 1e9]
			});
		}
	}
	for (let e of u.filter((e) => !f.has(e.id))) {
		let n = e.ums?.arrival, r = "", a = "other", u = 1e9;
		if (n?.date && n?.time) {
			if (l(n)) r = o.time12(`${n.date}T${n.time}`);
			else {
				a = "air";
				let e = c(n.date, n.time, b(n.port) === ae[t] ? i.own : i.other);
				r = o.time12(`${e.date}T${e.time}`), u = Number(`${e.date.replace(/-/g, "")}${e.time.replace(":", "")}`);
			}
		} else e.checkin_time && (r = o.time12(`${e.checkin_date}T${e.checkin_time}`));
		let d = `${a}|${String(e.sh_no ?? "")}`;
		p.push({
			key: p.some((e) => e.key === d) ? `${d}|${e.id}` : d,
			kind: a,
			bus: a === "air" ? "AIRPORT" : "",
			time: r,
			ref: String(e.sh_no ?? ""),
			group: String(e.tour_name || ""),
			leader: String(e.group_leader || "").trim(),
			floor: S(e, s),
			...w(e),
			pax: C(e),
			order: [a === "air" ? 5 : 4, u]
		});
	}
	return p.sort((e, t) => e.order[0] - t.order[0] || e.order[1] - t.order[1] || x(e.ref, t.ref));
}
var T = [
	"bus",
	"time",
	"ref",
	"group",
	"leader",
	"floor",
	"m",
	"f",
	"c",
	"i",
	"pax"
], E = {
	title: "ARRIVAL",
	dateLbl: "DATE:-",
	bus: "BUS NO",
	time: "ARRIVAL\nTIME",
	ref: "REF NO",
	group: "GROUP NAME",
	leader: "",
	floor: "FLOOR",
	pax: "PAX",
	m: "MALE",
	f: "FEMALE",
	c: "CHILD",
	i: "INFANT",
	total: "TOTAL",
	sum: "TOTAL"
}, D = (e) => e == null ? "" : String(e);
function le(e, t) {
	let n = t?.cells || {}, r = new Set(t?.hidden || []), i = e.filter((e) => !r.has(e.key)).map((e) => {
		let t = n[e.key] || {}, r = {
			bus: e.bus,
			time: e.time,
			ref: e.ref,
			group: e.group,
			leader: e.leader || "-",
			floor: e.floor,
			m: D(e.m),
			f: D(e.f),
			c: D(e.c),
			i: D(e.i),
			pax: e.pax ? String(e.pax) : ""
		}, i = {};
		for (let e of T) t[e] != null && (r[e] = t[e], i[e] = !0);
		return {
			key: e.key,
			kind: e.kind,
			added: !1,
			edited: i,
			v: r
		};
	});
	for (let e of t?.added || []) i.push({
		key: e.key,
		kind: "added",
		added: !0,
		edited: {},
		v: Object.fromEntries(T.map((t) => [t, String(e.v?.[t] ?? "")]))
	});
	return i;
}
var ue = (e, t, n = "") => e?.labels?.[t] ?? (t === "date" ? n : E[t] ?? ""), O = (e) => {
	let t = Number(String(e).replace(/[^\d.-]/g, ""));
	return Number.isFinite(t) ? t : 0;
}, k = (e, t) => e.reduce((e, n) => e + O(n.v[t]), 0), de = (e) => {
	let t = String(e || "").trim();
	return /^\d{1,3}$/.test(t) ? "n" : t.length <= 3 ? "w3" : t.length <= 5 ? "w5" : "w8";
}, A = "\n.arr { width: 100%; border-collapse: collapse; table-layout: fixed; color: #000; background: #fff; font-family: \"Times New Roman\", Times, serif; }\n.arr th, .arr td { border: 1.5px solid #000; padding: 1.2mm 1.5mm; text-align: center; vertical-align: middle; overflow-wrap: anywhere; }\n.arr .ttl th { background: #ffff00; font: 900 34pt Arial, Helvetica, sans-serif; padding: 1mm; }\n.arr .dt th { font: 900 24pt Arial, Helvetica, sans-serif; background: #fff; }\n.arr .dt th.v { background: #9fc5e8; color: #e00000; }\n.arr .hd th { background: #f4b183; font: 700 9pt Arial, Helvetica, sans-serif; white-space: pre-line; }\n.arr .hd th.fl { color: #e00000; }\n.arr .hd th.sub { font-size: 8pt; padding: 1mm 0.5mm; }\n.arr td { font-weight: 700; font-size: 10pt; text-transform: uppercase; }\n.arr td.bus { font: 900 22pt Arial, Helvetica, sans-serif; color: #e00000; line-height: 1; white-space: nowrap; overflow: hidden; padding-left: 0.5mm; padding-right: 0.5mm; }\n.arr td.bus.w3 { font-size: 15pt; } .arr td.bus.w5 { font-size: 12pt; } .arr td.bus.w8 { font-size: 10pt; }\n.arr td.fl { font: 900 20pt Arial, Helvetica, sans-serif; color: #e00000; }\n.arr td.px { font: 900 13pt Arial, Helvetica, sans-serif; padding-left: 0.5mm; padding-right: 0.5mm; }\n.arr td.px.tot { font-size: 16pt; }\n.arr td.tm { font: 700 11pt Arial, Helvetica, sans-serif; text-transform: none; }\n.arr td.ref { font: 700 10pt Times, serif; }\n.arr tfoot td { font: 900 14pt Arial, Helvetica, sans-serif; background: #fff; }\n.arr tbody tr { break-inside: avoid; page-break-inside: avoid; }\n.arr thead { display: table-header-group; }\n.arr td.nm { overflow-wrap: break-word; word-break: normal; white-space: normal; }\n.arr.img td.nm { font-size: 8.5pt; line-height: 1.15; padding-left: 1mm; padding-right: 1mm; }\n.arr .none { padding: 8mm; font: 400 12pt Arial, sans-serif; text-transform: none; }\n", j = [
	"10%",
	"9%",
	"8%",
	"19%",
	"17%",
	"7%",
	"5.5%",
	"5.5%",
	"5%",
	"5%",
	"9%"
], M = j.map((e, t) => parseFloat(e) / (t === 3 || t === 4 ? 2 : 1)), N = M.reduce((e, t) => e + t, 0), P = M.map((e) => `${(e / N * 100).toFixed(3)}%`), fe = Math.round(1e3 * N / 100);
function pe(e, t, n, { image: r = !1 } = {}) {
	let i = (e) => v(ue(t, e, n));
	return `<table class="arr${r ? " img" : ""}">
      <colgroup>${(r ? P : j).map((e) => `<col style="width:${e}">`).join("")}</colgroup>
      <thead>
        <tr class="ttl"><th colspan="11">${i("title")}</th></tr>
        <tr class="dt"><th colspan="3">${i("dateLbl")}</th><th class="v" colspan="8">${i("date")}</th></tr>
        <tr class="hd"><th rowspan="2">${i("bus")}</th><th rowspan="2">${i("time")}</th><th rowspan="2">${i("ref")}</th><th rowspan="2">${i("group")}</th><th rowspan="2">${i("leader")}</th><th rowspan="2" class="fl">${i("floor")}</th><th colspan="5">${i("pax")}</th></tr>
        <tr class="hd"><th class="sub">${i("m")}</th><th class="sub">${i("f")}</th><th class="sub">${i("c")}</th><th class="sub">${i("i")}</th><th class="sub">${i("total")}</th></tr>
      </thead>
      <tbody>${e.length ? e.map((e) => `<tr><td class="bus ${de(e.v.bus)}">${v(e.v.bus)}</td><td class="tm">${v(e.v.time)}</td><td class="ref">${v(e.v.ref)}</td><td class="nm">${v(e.v.group)}</td><td class="nm">${v(e.v.leader)}</td><td class="fl">${v(e.v.floor)}</td>` + [
		"m",
		"f",
		"c",
		"i"
	].map((t) => `<td class="px">${v(e.v[t])}</td>`).join("") + `<td class="px tot">${v(e.v.pax)}</td></tr>`).join("") : "<tr><td class=\"none\" colspan=\"11\">No arrivals for this day.</td></tr>"}</tbody>
      <tfoot><tr><td colspan="6">${i("sum")}</td>${[
		"m",
		"f",
		"c",
		"i",
		"pax"
	].map((t) => `<td>${k(e, t)}</td>`).join("")}</tr></tfoot>
    </table>`;
}
// src/pages/arrival/ArrivalPage.tsx
var F = t();
function I({ as: e = "td", value: t, onSave: n, editable: r, className: i, colSpan: a, rowSpan: o, numeric: s, edited: c }) {
	let l = (0, _.useRef)(null);
	return (0, _.useEffect)(() => {
		l.current && document.activeElement !== l.current && l.current.innerText !== t && (l.current.innerText = t);
	}, [t]), /* @__PURE__ */ (0, F.jsx)(e, {
		ref: l,
		colSpan: a,
		rowSpan: o,
		className: [
			i,
			r ? "ed" : "",
			c ? "edited" : ""
		].filter(Boolean).join(" "),
		contentEditable: r,
		suppressContentEditableWarning: !0,
		spellCheck: !1,
		title: r ? "Click to change" : void 0,
		onKeyDown: (e) => {
			e.key === "Enter" && !e.shiftKey && (e.preventDefault(), e.currentTarget.blur()), e.key === "Escape" && (e.currentTarget.innerText = t, e.currentTarget.blur());
		},
		onBlur: (e) => {
			let r = e.currentTarget.innerText.replace(/ /g, " ").trim();
			s && (r = r.replace(/[^\d]/g, "")), r === t ? e.currentTarget.innerText = t : n(r);
		},
		children: t
	});
}
function L() {
	let { transport: t, rooms: n, settings: o, ums: d, cloud: h } = i(), g = t, v = r(), y = e(), ae = a(), b = l(), { site: x, siteId: S } = c(), { navigate: C } = s(), w = /^\d{4}-\d{2}-\d{2}$/.test(y.get("day") || "") ? y.get("day") : g.today(), T = oe(S), E = T === "makkah" ? "Makkah" : "Medina", D = h.currentDesk?.(), O = !!D && D.role !== "viewer" && (D.role === "admin" || D.site === S), M = ne(), [N, P] = (0, _.useState)(""), [L, R] = (0, _.useState)(""), [z, B] = (0, _.useState)(""), [me, he] = (0, _.useState)([]);
	(0, _.useEffect)(() => {
		v(g.listDays(T)).then(he, () => he([]));
	}, [T]);
	let V = u({
		queryKey: [
			"arrival-buses",
			T,
			w
		],
		queryFn: async () => {
			let e = await v(g.loadDay(T, w));
			return g.signage(e.rows || [], T).find((e) => e.dest.id === se[S])?.buses ?? [];
		},
		staleTime: 3e4
	}), H = u({
		queryKey: ["arrival-settings", S],
		queryFn: async () => (await o.loadSettings()).settings
	}), U = [
		"arrival-sheet",
		S,
		w
	], W = u({
		queryKey: U,
		queryFn: () => h.request("GET", `/api/arrival-sheet?site=${S}&day=${w}`).catch(() => ({
			sheet: null,
			updated_at: null,
			updated_by: null
		}))
	}), G = W.data?.sheet ?? null, K = (0, _.useMemo)(() => ce({
		day: w,
		hostId: S,
		slips: M.data ?? [],
		buses: V.data ?? [],
		hours: {
			own: Number(H.data?.arrival_commute_hours ?? 3),
			other: Number(H.data?.arrival_other_hours ?? 5)
		},
		libs: {
			T: g,
			floorOf: n.floorOf,
			shiftTime: o.shiftTime,
			byRoad: d.byRoad
		}
	}), [
		w,
		S,
		M.data,
		V.data,
		H.data
	]), q = (0, _.useMemo)(() => le(K, G), [K, G]), J = w.split("-").reverse().join("-"), ge = pe(q, G, J), Y = (G?.hidden || []).filter((e) => K.some((t) => t.key === e)).length;
	async function X(e) {
		let t = b.getQueryData(U);
		b.setQueryData(U, {
			sheet: e,
			updated_at: t?.updated_at ?? null,
			updated_by: t?.updated_by ?? null
		}), B("Saving…"), P("");
		try {
			let t = await h.request("PUT", `/api/arrival-sheet?site=${S}&day=${w}`, { sheet: e });
			b.setQueryData(U, t), B("Saved ✓");
		} catch (e) {
			b.setQueryData(U, t), B(""), P("Could not save: " + (e?.message || e));
		}
	}
	let Z = () => ({
		labels: { ...G?.labels || {} },
		cells: { ...G?.cells || {} },
		added: [...G?.added || []],
		hidden: [...G?.hidden || []]
	}), _e = (e, t) => {
		let n = Z();
		n.labels[e] = t, X(n);
	}, Q = (e, t, n) => {
		let r = Z();
		e.added ? r.added = r.added.map((r) => r.key === e.key ? {
			...r,
			v: {
				...r.v,
				[t]: n
			}
		} : r) : r.cells[e.key] = {
			...r.cells[e.key] || {},
			[t]: n
		}, X(r);
	}, ve = (e) => {
		let t = Z();
		e.added ? t.added = t.added.filter((t) => t.key !== e.key) : t.hidden = [.../* @__PURE__ */ new Set([...t.hidden, e.key])], X(t);
	}, ye = () => {
		let e = Z();
		e.added = [...e.added, {
			key: `add-${Date.now().toString(36)}`,
			v: {}
		}], X(e);
	}, be = () => {
		let e = Z();
		e.hidden = [], X(e);
	}, xe = () => {
		confirm("Throw away every change made to this sheet and show the PMS data again?") && X(null);
	};
	function Se() {
		let e = window.open("", "_blank");
		e ? (e.document.open(), e.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>Arrival ${w}</title><style>${A}
            @page { size: A4 landscape; margin: 8mm; } body { margin: 0; background: #eee; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            .wrap { max-width: 1100px; margin: 12px auto; background: #fff; } @media print { body { background: #fff; } .wrap { max-width: none; margin: 0; } }
        </style></head><body><div class="wrap">${ge}</div><script>window.addEventListener('load', function () { setTimeout(function () { window.focus(); window.print(); }, 250); });<\/script></body></html>`), e.document.close()) : P("The browser blocked the new tab. Allow pop-ups for this site, then press Print again.");
	}
	async function Ce() {
		P(""), R("");
		let e = document.createElement("div");
		e.style.cssText = `position:fixed;left:-10000px;top:0;width:${fe}px;background:#fff`, e.innerHTML = `<style>${A}</style>${pe(q, G, J, { image: !0 })}`, document.body.appendChild(e);
		try {
			let t = await (await ae("table-image")).copyTablesImage([...e.querySelectorAll("table")], `arrival-${x.label}-${w}.png`);
			R(t === "copied" ? "Copied as a picture — paste it into the chat." : "This browser cannot copy pictures — the image was downloaded instead.");
		} catch (e) {
			P("Could not make the image: " + (e?.message || e));
		} finally {
			e.remove();
		}
	}
	let we = (e) => ue(G, e, J), $ = (e, t = {}) => /* @__PURE__ */ (0, F.jsx)(I, {
		as: "th",
		value: we(e),
		onSave: (t) => _e(e, t),
		editable: O,
		edited: G?.labels?.[e] != null,
		...t
	}), Te = [
		"m",
		"f",
		"c",
		"i"
	];
	return /* @__PURE__ */ (0, F.jsxs)("div", {
		className: "mx-auto grid grid-cols-[minmax(0,1fr)] max-w-[2400px] min-w-0 gap-3 px-3 pb-10 pt-4 sm:px-4",
		children: [
			/* @__PURE__ */ (0, F.jsxs)("header", {
				className: "flex flex-wrap items-start justify-between gap-3",
				children: [/* @__PURE__ */ (0, F.jsxs)("div", { children: [
					/* @__PURE__ */ (0, F.jsx)("h1", {
						className: "text-2xl font-bold text-primary",
						children: "Arrival sheet"
					}),
					/* @__PURE__ */ (0, F.jsxs)("p", {
						className: "text-sm text-muted-foreground",
						children: [
							"Who reaches ",
							x.label,
							" on this day: the buses from ",
							E,
							" (numbered as on that site's transport list), then the airport arrivals. Arrival time = when the group is expected at the hotel (Setup → Travel times). Floor = the floor most of the group's rooms are on."
						]
					}),
					/* @__PURE__ */ (0, F.jsx)("p", {
						className: "text-sm text-muted-foreground",
						children: O ? "Click any cell to change it — the change is kept for this sheet only (it never changes a slip or the transport list)." : "Read only for this login."
					})
				] }), /* @__PURE__ */ (0, F.jsxs)("div", {
					className: "flex flex-wrap gap-2",
					children: [/* @__PURE__ */ (0, F.jsxs)(m, {
						onClick: Se,
						disabled: !q.length,
						children: [/* @__PURE__ */ (0, F.jsx)(te, { className: "size-4" }), "Print"]
					}), /* @__PURE__ */ (0, F.jsxs)(m, {
						variant: "outline",
						onClick: () => void Ce(),
						disabled: !q.length,
						children: [/* @__PURE__ */ (0, F.jsx)(p, { className: "size-4" }), "Copy image"]
					})]
				})]
			}),
			/* @__PURE__ */ (0, F.jsx)(f, {
				day: w,
				days: me,
				onChange: (e) => C("arrival", { day: e })
			}),
			L && /* @__PURE__ */ (0, F.jsx)("div", {
				className: "rounded-md border border-ok/40 bg-ok-soft px-3 py-2 text-sm text-ok",
				children: L
			}),
			(N || V.isError) && /* @__PURE__ */ (0, F.jsx)("div", {
				className: "rounded-md border border-destructive bg-destructive/10 px-3 py-2 text-sm text-destructive",
				children: N || `Could not load the ${E} transport list — the bus rows are missing.`
			}),
			O && /* @__PURE__ */ (0, F.jsxs)("div", {
				className: "flex flex-wrap items-center gap-2 text-sm",
				children: [
					/* @__PURE__ */ (0, F.jsxs)(m, {
						size: "sm",
						variant: "outline",
						onClick: ye,
						children: [/* @__PURE__ */ (0, F.jsx)(ee, { className: "size-4" }), "Add a row"]
					}),
					Y > 0 && /* @__PURE__ */ (0, F.jsxs)(m, {
						size: "sm",
						variant: "outline",
						onClick: be,
						children: [
							/* @__PURE__ */ (0, F.jsx)(re, { className: "size-4" }),
							"Show ",
							Y,
							" hidden row",
							Y === 1 ? "" : "s"
						]
					}),
					G && /* @__PURE__ */ (0, F.jsxs)(m, {
						size: "sm",
						variant: "outline",
						onClick: xe,
						children: [/* @__PURE__ */ (0, F.jsx)(ie, { className: "size-4" }), "Back to PMS data"]
					}),
					/* @__PURE__ */ (0, F.jsxs)("span", {
						className: "text-muted-foreground",
						children: [z, !z && W.data?.updated_by ? `Last changed by ${W.data.updated_by} · ${new Date(W.data.updated_at).toLocaleString(void 0, {
							day: "numeric",
							month: "short",
							hour: "2-digit",
							minute: "2-digit"
						})}` : ""]
					})
				]
			}),
			/* @__PURE__ */ (0, F.jsx)("style", { children: A + "\n                .arr .ed { cursor: text; outline: none; } .arr .ed:hover { box-shadow: inset 0 0 0 2px rgba(154,116,20,.35); } .arr .ed:focus { box-shadow: inset 0 0 0 2px #9a7414; background: #fffbe8; }\n                .arr .edited { background-image: linear-gradient(135deg, #2b7a3f 0, #2b7a3f 6px, transparent 6px); }\n                .arr td.act { border: 0; background: transparent; width: 34px; padding: 0 0 0 4px; }" }),
			/* @__PURE__ */ (0, F.jsx)("div", {
				className: "overflow-auto rounded-lg border bg-white p-1",
				children: /* @__PURE__ */ (0, F.jsxs)("table", {
					className: "arr",
					children: [
						/* @__PURE__ */ (0, F.jsxs)("colgroup", { children: [j.map((e, t) => /* @__PURE__ */ (0, F.jsx)("col", { style: { width: e } }, t)), O && /* @__PURE__ */ (0, F.jsx)("col", { style: { width: 34 } })] }),
						/* @__PURE__ */ (0, F.jsxs)("thead", { children: [
							/* @__PURE__ */ (0, F.jsx)("tr", {
								className: "ttl",
								children: $("title", { colSpan: 11 })
							}),
							/* @__PURE__ */ (0, F.jsxs)("tr", {
								className: "dt",
								children: [$("dateLbl", { colSpan: 3 }), $("date", {
									className: "v",
									colSpan: 8
								})]
							}),
							/* @__PURE__ */ (0, F.jsxs)("tr", {
								className: "hd",
								children: [
									$("bus", { rowSpan: 2 }),
									$("time", { rowSpan: 2 }),
									$("ref", { rowSpan: 2 }),
									$("group", { rowSpan: 2 }),
									$("leader", { rowSpan: 2 }),
									$("floor", {
										rowSpan: 2,
										className: "fl"
									}),
									$("pax", { colSpan: 5 })
								]
							}),
							/* @__PURE__ */ (0, F.jsxs)("tr", {
								className: "hd",
								children: [
									$("m", { className: "sub" }),
									$("f", { className: "sub" }),
									$("c", { className: "sub" }),
									$("i", { className: "sub" }),
									$("total", { className: "sub" })
								]
							})
						] }),
						/* @__PURE__ */ (0, F.jsx)("tbody", { children: q.length ? q.map((e) => /* @__PURE__ */ (0, F.jsxs)("tr", { children: [
							[
								"bus",
								"time",
								"ref",
								"group",
								"leader",
								"floor"
							].map((t) => /* @__PURE__ */ (0, F.jsx)(I, {
								value: e.v[t],
								onSave: (n) => Q(e, t, n),
								editable: O,
								edited: !!e.edited[t],
								className: t === "bus" ? `bus ${de(e.v.bus)}` : t === "time" ? "tm" : t === "ref" ? "ref" : t === "floor" ? "fl" : void 0
							}, t)),
							Te.map((t) => /* @__PURE__ */ (0, F.jsx)(I, {
								value: e.v[t],
								onSave: (n) => Q(e, t, n),
								editable: O,
								edited: !!e.edited[t],
								numeric: !0,
								className: "px"
							}, t)),
							/* @__PURE__ */ (0, F.jsx)(I, {
								value: e.v.pax,
								onSave: (t) => Q(e, "pax", t),
								editable: O,
								edited: !!e.edited.pax,
								numeric: !0,
								className: "px tot"
							}),
							O && /* @__PURE__ */ (0, F.jsx)("td", {
								className: "act",
								children: /* @__PURE__ */ (0, F.jsx)(m, {
									size: "icon",
									variant: "ghost",
									className: "size-7",
									title: e.added ? "Delete this row" : "Hide this row on the sheet",
									onClick: () => ve(e),
									children: "✕"
								})
							})
						] }, e.key)) : /* @__PURE__ */ (0, F.jsx)("tr", { children: /* @__PURE__ */ (0, F.jsx)("td", {
							className: "none",
							colSpan: 11,
							children: "No arrivals for this day."
						}) }) }),
						/* @__PURE__ */ (0, F.jsx)("tfoot", { children: /* @__PURE__ */ (0, F.jsxs)("tr", { children: [$("sum", { colSpan: 6 }), [
							"m",
							"f",
							"c",
							"i",
							"pax"
						].map((e) => /* @__PURE__ */ (0, F.jsx)("td", { children: k(q, e) }, e))] }) })
					]
				})
			}),
			O && G && /* @__PURE__ */ (0, F.jsx)("p", {
				className: "text-xs text-muted-foreground",
				children: "A green corner marks a cell changed by hand. New arrivals added in the PMS still appear here; hidden rows stay hidden until “Show hidden rows”."
			})
		]
	});
}
export { L as default };
