import { c as e, f as t, h as n, i as r, n as i, p as a, s as o, u as s } from "./PmsContext-BVMd13Oi.js";
import { t as c } from "./useQuery-BUXPY6q6.js";
import { a as l, i as u, n as d, r as f, t as p } from "./select-VcH2xuqJ.js";
import { t as m } from "./label-CMEyi--P.js";
import { t as h } from "./button-BGWa3SLr.js";
import { t as g } from "./input-DSBk_UeU.js";
import { t as _ } from "./useSlips-DUKbzGma.js";
import { t as v } from "./badge-EB7Muw37.js";
// src/pages/timeline/timeline.ts
var y = /* @__PURE__ */ n(a(), 1), b = (e, t) => e.localeCompare(t, void 0, { numeric: !0 }), ee = [
	1,
	2,
	3,
	4,
	6,
	8,
	12,
	24
], x = [
	"#f7d58b",
	"#a8d8b9",
	"#9ec9f0",
	"#f4b6c2",
	"#c9b6f2",
	"#f6c29b",
	"#b5e0e6",
	"#dcd59a",
	"#e9b8e0",
	"#bcd99a",
	"#f2a7a0",
	"#a9c4e8"
], te = (e) => {
	let t = 0;
	for (let n of String(e)) t = t * 31 + n.charCodeAt(0) >>> 0;
	return x[t % x.length];
}, S = (e) => Number(e.total) || [
	"gents",
	"ladies",
	"children",
	"infants"
].reduce((t, n) => t + (Number(e[n]) || 0), 0);
function C(e) {
	let t = e.flatMap((e) => [[e.start, e.pax], [e.end, -e.pax]]).sort((e, t) => e[0] - t[0] || e[1] - t[1]), n = 0, r = 0;
	for (let [, e] of t) n += e, r = Math.max(r, n);
	return r;
}
function ne({ slips: e, building: t, roomsSetUp: n, from: r, to: i, stepH: a, room: o, floor: s, libs: c }) {
	let l = Math.max(1, a) * 36e5, u = Math.ceil((i - r) / l);
	if (!(u > 0)) return {
		cells: [],
		step: l,
		rooms: [],
		groups: 0,
		tooMany: !1
	};
	if (u > 600) return {
		cells: [],
		step: l,
		rooms: [],
		groups: 0,
		tooMany: !0
	};
	let d = Array.from({ length: u }, (e, t) => r + t * l), f = c.normB(t), p = new Map(n.map((e) => [String(e.room_no).trim().toUpperCase(), e.capacity ?? null])), m = /* @__PURE__ */ new Map();
	for (let e of n) m.set(String(e.room_no).trim().toUpperCase(), []);
	for (let t of e) {
		if (t.deleted) continue;
		let e = /* @__PURE__ */ new Map();
		for (let n of c.rowsOf(t)) {
			if (c.normB(n.building) !== f || !n.start || !n.end || !(n.end > n.start) || !(Number(n.row?.assigned) > 0) || n.end <= r || n.start >= i) continue;
			let a = String(n.room_no).trim().toUpperCase(), o = `${a}|${n.start}|${n.end}`, s = Number(n.row.assigned) || 0, l = n.side === "ladies" ? "L" : "G", u = e.get(o);
			u ? (u.pax += s, u.sides.includes(l) || (u.sides += l), u.excl = u.excl || !!n.exclusive) : (e.set(o, {
				key: `${t.id}|${o}`,
				slipId: t.id,
				sh: String(t.sh_no ?? ""),
				tour: String(t.tour_name || "").trim(),
				gl: String(t.group_leader || "").trim(),
				pax: s,
				groupPax: S(t),
				sides: l,
				excl: !!n.exclusive,
				start: n.start,
				end: n.end,
				s0: 0,
				s1: 0,
				color: te(String(t.sh_no ?? t.id))
			}), m.has(a) || m.set(a, []));
		}
		for (let [t, n] of e) m.get(t.split("|")[0]).push(n);
	}
	let h = String(o || "").trim().toUpperCase(), g = String(s || "").trim(), _ = [...m.entries()].filter(([e]) => (!h || e === h) && (!g || String(c.floorOf(e)) === g)).sort((e, t) => b(e[0], t[0])).map(([e, t]) => {
		let n = [], i = 0;
		for (let e of [...t].sort((e, t) => e.start - t.start || e.end - t.end)) {
			let t = n.find((t) => t[t.length - 1].end <= e.start);
			t ? t.push(e) : n.length < 8 ? n.push([e]) : i++;
		}
		let a = (e) => {
			let t = l / e, n = u * e - 1;
			return (e) => [Math.max(0, Math.floor((e.start - r) / t)), Math.min(n, Math.ceil((e.end - r) / t) - 1)];
		}, o = ee.filter((e) => l / e >= 36e5 && u * e <= 4e3);
		o.length || o.push(1);
		let s = o[o.length - 1];
		for (let e of o) {
			let t = a(e);
			if (n.every((e) => e.every((n, r) => r === 0 || t(e[r - 1])[1] < t(n)[0]))) {
				s = e;
				break;
			}
		}
		let d = a(s);
		for (let e of t) [e.s0, e.s1] = d(e);
		let f = u * s - 1;
		for (let e of n) for (let t = 1; t < e.length; t++) e[t].s0 <= e[t - 1].s1 && (e[t].s0 = Math.min(f, e[t - 1].s1 + 1), e[t].s1 < e[t].s0 && (e[t].s1 = e[t].s0));
		return {
			room: e,
			floor: String(c.floorOf(e) ?? ""),
			capacity: p.get(e) ?? null,
			lanes: n,
			peak: C(t),
			split: s,
			hidden: i
		};
	});
	return {
		cells: d,
		step: l,
		rooms: _,
		groups: new Set(_.flatMap((e) => e.lanes.flat().map((e) => e.slipId))).size,
		tooMany: !1
	};
}
var re = (e) => (e.excl ? "🔒 " : "") + [
	e.tour || `SH ${e.sh}`,
	e.gl,
	`${e.pax}${e.groupPax > e.pax ? `/${e.groupPax}` : ""} pax`
].filter(Boolean).join(" · "), ie = (e, t) => {
	if (e <= 1) return "";
	let n = t / e;
	return n >= 1 && Number.isInteger(n) ? `${n} h pieces` : `split in ${e}`;
}, w = t(), T = (e) => (/* @__PURE__ */ new Date(e.getTime() - e.getTimezoneOffset() * 6e4)).toISOString().slice(0, 16), E = (e) => e ? e.length === 10 ? `${e}T00:00` : e.slice(0, 16) : "", D = [
	{
		h: 24,
		label: "Day",
		w: 96
	},
	{
		h: 12,
		label: "12 h",
		w: 60
	},
	{
		h: 6,
		label: "6 h",
		w: 44
	},
	{
		h: 3,
		label: "3 h",
		w: 36
	},
	{
		h: 1,
		label: "1 h",
		w: 30
	}
], ae = (e) => {
	let t = new Date(e);
	return `${t.getFullYear()}-${t.getMonth()}-${t.getDate()}`;
}, oe = (e) => new Date(e).toLocaleDateString(void 0, {
	weekday: "short",
	day: "numeric",
	month: "short"
}), se = (e) => new Date(e).toLocaleTimeString(void 0, { hour: "numeric" }), ce = (e) => new Date(e).toLocaleString(void 0, {
	day: "numeric",
	month: "short",
	hour: "2-digit",
	minute: "2-digit"
});
function O() {
	let { rooms: t, stay: n } = i(), a = t, b = n, ee = r(), x = e(), { navigate: te } = o(), { siteId: S } = s(), C = _(12e4), O = c({
		queryKey: ["buildings", S],
		queryFn: async () => a.buildingsOfSite(await ee(a.loadBuildings()), S)
	}), k = /* @__PURE__ */ new Date();
	k.setHours(0, 0, 0, 0);
	let [A, le] = (0, y.useState)(x.get("building") || ""), [j, ue] = (0, y.useState)(x.get("room") || ""), [M, de] = (0, y.useState)("all"), [N, P] = (0, y.useState)(E(x.get("from")) || T(/* @__PURE__ */ new Date(k - 864e5))), [F, I] = (0, y.useState)(E(x.get("to")) || T(/* @__PURE__ */ new Date(+k + 11232e5))), [L, fe] = (0, y.useState)(x.get("from") && x.get("to") && Date.parse(x.get("to")) - Date.parse(x.get("from")) < 3456e5 ? "3" : "24"), [R, pe] = (0, y.useState)(!1), z = (0, y.useRef)(null), B = (0, y.useRef)(null), V = (0, y.useRef)(!1), [me, H] = (0, y.useState)(!1), he = (e) => {
		e.pointerType === "mouse" && e.button === 0 && z.current && (B.current = {
			x: e.clientX,
			y: e.clientY,
			left: z.current.scrollLeft,
			top: z.current.scrollTop,
			moved: !1
		});
	}, ge = (e) => {
		let t = B.current, n = z.current;
		if (!t || !n) return;
		let r = e.clientX - t.x, i = e.clientY - t.y;
		!t.moved && Math.abs(r) + Math.abs(i) < 5 || (t.moved || (t.moved = !0, H(!0), n.setPointerCapture?.(e.pointerId)), n.scrollLeft = t.left - r, n.scrollTop = t.top - i);
	}, U = (e) => {
		B.current?.moved && (V.current = !0, setTimeout(() => {
			V.current = !1;
		}, 0), z.current?.releasePointerCapture?.(e.pointerId)), B.current = null, H(!1);
	}, W = (0, y.useMemo)(() => {
		let e = new Set((O.data ?? []).map((e) => e.name));
		for (let t of C.data ?? []) t.building && e.add(String(t.building).trim());
		return [...e].filter(Boolean).sort();
	}, [O.data, C.data]);
	(0, y.useEffect)(() => {
		!A && W.length && le(W[0]);
	}, [W]);
	let G = (O.data ?? []).find((e) => String(e.name).toUpperCase() === A.toUpperCase())?.rooms ?? [], _e = (0, y.useMemo)(() => [...new Set(G.map((e) => String(a.floorOf(String(e.room_no)) ?? "")).filter(Boolean))].sort((e, t) => String(e).localeCompare(String(t), void 0, { numeric: !0 })), [G]), K = D.find((e) => String(e.h) === L) ?? D[0], q = Date.parse(N), J = Date.parse(F), Y = (0, y.useMemo)(() => A && q < J ? ne({
		slips: C.data ?? [],
		building: A,
		roomsSetUp: G.map((e) => ({
			room_no: String(e.room_no),
			capacity: Number(e.capacity) || null
		})),
		from: q,
		to: J,
		stepH: K.h,
		room: j,
		floor: M === "all" ? "" : M,
		libs: {
			rowsOf: b.rowsOf,
			normB: b.normB,
			floorOf: a.floorOf
		}
	}) : null, [
		C.data,
		A,
		G,
		q,
		J,
		K.h,
		j,
		M
	]), X = (Y?.rooms ?? []).filter((e) => !R || e.lanes.length), Z = Y?.cells ?? [], Q = Z.length && Y && Date.now() >= q && Date.now() < q + Z.length * Y.step ? (Date.now() - q) / Y.step * K.w : null, $ = [];
	for (let e of Z) {
		let t = ae(e), n = $[$.length - 1];
		n && n.key === t ? n.span++ : $.push({
			key: t,
			t: e,
			span: 1
		});
	}
	let ve = (e) => {
		let t = e * 864e5;
		P(T(new Date(q + t))), I(T(new Date(J + t)));
	}, ye = (e) => `SH ${e.sh} — ${e.tour}${e.gl ? `\nGroup leader: ${e.gl}` : ""}\nIn this room: ${e.pax} pax (${e.sides === "GL" ? "gents + ladies" : e.sides === "L" ? "ladies" : "gents"})${e.groupPax ? ` · whole group ${e.groupPax}` : ""}\n${ce(e.start)} → ${ce(e.end)}${e.excl ? "\n🔒 Exclusive — the whole room is kept for them" : ""}\nClick to open the slip`;
	return /* @__PURE__ */ (0, w.jsxs)("div", {
		className: "mx-auto grid grid-cols-[minmax(0,1fr)] max-w-[2400px] min-w-0 gap-3 px-3 pb-10 pt-4 sm:px-4",
		children: [
			/* @__PURE__ */ (0, w.jsx)("style", { children: "\n                .tl-scroll { overflow-x: scroll; overflow-y: auto; cursor: grab; scrollbar-width: auto; scrollbar-color: #b9975a #f3e8d2; }\n                .tl-scroll.dragging, .tl-scroll.dragging .blk { cursor: grabbing; user-select: none; }\n                .tl-scroll::-webkit-scrollbar { height: 14px; width: 12px; } .tl-scroll::-webkit-scrollbar-track { background: #f3e8d2; }\n                .tl-scroll::-webkit-scrollbar-thumb { background: #b9975a; border-radius: 8px; border: 3px solid #f3e8d2; } .tl-scroll::-webkit-scrollbar-thumb:hover { background: #9a7414; }\n                .tlg { border-collapse: separate; border-spacing: 0; table-layout: fixed; font-size: 12px; }\n                .tlg th, .tlg td { border-right: 1px solid var(--border, #e6d8bd); border-bottom: 1px solid var(--border, #e6d8bd); height: 30px; padding: 0; }\n                .tlg thead th { position: sticky; z-index: 3; background: #f6ecd6; font-weight: 700; text-align: center; white-space: nowrap; }\n                .tlg thead tr:first-child th { top: 0; } .tlg thead tr:nth-child(2) th { top: 30px; font-weight: 500; font-size: 11px; }\n                .tlg .rm { position: sticky; left: 0; z-index: 2; background: #fffaf0; text-align: left; padding: 0 8px; min-width: 128px; width: 128px; }\n                .tlg thead .rm { z-index: 4; background: #f3e4c4; }\n                .tlg .rm b { font-size: 14px; } .tlg .rm small { display: block; color: #8a7652; font-size: 10.5px; line-height: 1.15; }\n                .tlg .rm small.full { color: #b3261e; font-weight: 700; }\n                .tlg tbody tr.first td, .tlg tbody tr.first th { border-top: 2px solid #d9c49c; }\n                .tlg td.lane { position: relative; }\n                .tlg .strip { position: relative; display: grid; height: 30px; align-items: stretch;\n                    background-image: repeating-linear-gradient(90deg, transparent 0 calc(var(--cw) - 1px), #e6d8bd calc(var(--cw) - 1px) var(--cw)),\n                                      repeating-linear-gradient(90deg, transparent 0 calc(var(--pw) - 1px), var(--pl, transparent) calc(var(--pw) - 1px) var(--pw)); }\n                .tlg .strip.split { --pl: #f1e6cf; }\n                .tlg .now-line { position: absolute; top: 0; bottom: 0; width: 2px; background: #c0392b; z-index: 1; pointer-events: none; }\n                .tlg .blk { margin: 2px 1px; padding: 0 6px; display: flex; align-items: center; font-weight: 600; color: #2b1e15; cursor: pointer; overflow: hidden; white-space: nowrap; text-overflow: ellipsis;\n                    border-radius: 6px; border: 1px solid rgba(0,0,0,.12); min-width: 0; z-index: 2; }\n                .tlg .blk span.t { overflow: hidden; text-overflow: ellipsis; }\n                .tlg .blk:hover { filter: brightness(.95); outline: 2px solid #9a7414; outline-offset: -2px; }\n                .tlg .blk.excl { background-image: repeating-linear-gradient(135deg, rgba(0,0,0,.07) 0 6px, transparent 6px 12px); }\n                .tlg .blk .sh { font-weight: 800; margin-right: 4px; opacity: .7; flex: none; }\n                .tlg .rm small.split { color: #6b5a35; font-style: italic; }\n            " }),
			/* @__PURE__ */ (0, w.jsxs)("div", {
				className: "flex flex-wrap items-end gap-3",
				children: [
					/* @__PURE__ */ (0, w.jsxs)("div", {
						className: "grid gap-1",
						children: [/* @__PURE__ */ (0, w.jsx)(m, {
							htmlFor: "building",
							children: "Building"
						}), /* @__PURE__ */ (0, w.jsxs)(p, {
							value: A,
							onValueChange: (e) => {
								le(e), ue(""), de("all");
							},
							children: [/* @__PURE__ */ (0, w.jsx)(u, {
								id: "building",
								className: "min-w-48",
								children: /* @__PURE__ */ (0, w.jsx)(l, { placeholder: "Select building…" })
							}), /* @__PURE__ */ (0, w.jsx)(d, { children: W.map((e) => /* @__PURE__ */ (0, w.jsx)(f, {
								value: e,
								children: e
							}, e)) })]
						})]
					}),
					/* @__PURE__ */ (0, w.jsxs)("div", {
						className: "grid gap-1",
						children: [/* @__PURE__ */ (0, w.jsx)(m, {
							htmlFor: "floor",
							children: "Floor"
						}), /* @__PURE__ */ (0, w.jsxs)(p, {
							value: M,
							onValueChange: de,
							children: [/* @__PURE__ */ (0, w.jsx)(u, {
								id: "floor",
								className: "w-28",
								children: /* @__PURE__ */ (0, w.jsx)(l, {})
							}), /* @__PURE__ */ (0, w.jsxs)(d, { children: [/* @__PURE__ */ (0, w.jsx)(f, {
								value: "all",
								children: "All floors"
							}), _e.map((e) => /* @__PURE__ */ (0, w.jsxs)(f, {
								value: e,
								children: ["Floor ", e]
							}, e))] })]
						})]
					}),
					/* @__PURE__ */ (0, w.jsxs)("div", {
						className: "grid gap-1",
						children: [/* @__PURE__ */ (0, w.jsxs)(m, {
							htmlFor: "room",
							children: ["Room ", /* @__PURE__ */ (0, w.jsx)("span", {
								className: "text-muted-foreground",
								children: "(optional)"
							})]
						}), /* @__PURE__ */ (0, w.jsx)(g, {
							id: "room",
							placeholder: "all rooms",
							className: "w-28",
							value: j,
							onChange: (e) => ue(e.target.value)
						})]
					}),
					/* @__PURE__ */ (0, w.jsxs)("div", {
						className: "grid gap-1",
						children: [/* @__PURE__ */ (0, w.jsx)(m, {
							htmlFor: "start",
							children: "From"
						}), /* @__PURE__ */ (0, w.jsx)(g, {
							id: "start",
							type: "datetime-local",
							value: N,
							onChange: (e) => P(e.target.value)
						})]
					}),
					/* @__PURE__ */ (0, w.jsxs)("div", {
						className: "grid gap-1",
						children: [/* @__PURE__ */ (0, w.jsx)(m, {
							htmlFor: "end",
							children: "To"
						}), /* @__PURE__ */ (0, w.jsx)(g, {
							id: "end",
							type: "datetime-local",
							value: F,
							onChange: (e) => I(e.target.value)
						})]
					}),
					/* @__PURE__ */ (0, w.jsxs)("div", {
						className: "grid gap-1",
						children: [/* @__PURE__ */ (0, w.jsx)(m, {
							htmlFor: "step",
							children: "Each cell"
						}), /* @__PURE__ */ (0, w.jsxs)(p, {
							value: L,
							onValueChange: fe,
							children: [/* @__PURE__ */ (0, w.jsx)(u, {
								id: "step",
								className: "w-24",
								children: /* @__PURE__ */ (0, w.jsx)(l, {})
							}), /* @__PURE__ */ (0, w.jsx)(d, { children: D.map((e) => /* @__PURE__ */ (0, w.jsx)(f, {
								value: String(e.h),
								children: e.label
							}, e.h)) })]
						})]
					}),
					/* @__PURE__ */ (0, w.jsxs)("div", {
						className: "flex gap-1",
						children: [/* @__PURE__ */ (0, w.jsx)(h, {
							variant: "outline",
							onClick: () => ve(-7),
							title: "A week earlier",
							children: "◀ 7 days"
						}), /* @__PURE__ */ (0, w.jsx)(h, {
							variant: "outline",
							onClick: () => ve(7),
							title: "A week later",
							children: "7 days ▶"
						})]
					}),
					/* @__PURE__ */ (0, w.jsxs)("label", {
						className: "flex items-center gap-2 text-sm",
						children: [/* @__PURE__ */ (0, w.jsx)("input", {
							type: "checkbox",
							checked: R,
							onChange: (e) => pe(e.target.checked)
						}), "Only rooms in use"]
					}),
					Y && !Y.tooMany && /* @__PURE__ */ (0, w.jsxs)("div", {
						className: "ml-auto flex flex-wrap gap-2",
						children: [/* @__PURE__ */ (0, w.jsxs)(v, {
							variant: "secondary",
							children: [
								X.length,
								" room",
								X.length === 1 ? "" : "s"
							]
						}), /* @__PURE__ */ (0, w.jsxs)(v, {
							variant: "secondary",
							children: [
								Y.groups,
								" group",
								Y.groups === 1 ? "" : "s"
							]
						})]
					})
				]
			}),
			!A && /* @__PURE__ */ (0, w.jsx)("p", {
				className: "text-sm text-muted-foreground",
				children: "Pick a building."
			}),
			q >= J && /* @__PURE__ */ (0, w.jsx)("p", {
				className: "text-sm text-destructive",
				children: "“From” must be before “To”."
			}),
			Y?.tooMany && /* @__PURE__ */ (0, w.jsx)("p", {
				className: "text-sm text-destructive",
				children: "That is too many cells for this period — choose bigger cells (e.g. Day) or a shorter period."
			}),
			C.isError && /* @__PURE__ */ (0, w.jsx)("p", {
				className: "text-sm text-destructive",
				children: "Could not load the slips."
			}),
			Y && !Y.tooMany && /* @__PURE__ */ (0, w.jsx)("div", {
				ref: z,
				className: `tl-scroll max-h-[75vh] rounded-lg border bg-white${me ? " dragging" : ""}`,
				title: "Hold the left mouse button and drag to move around",
				onPointerDown: he,
				onPointerMove: ge,
				onPointerUp: U,
				onPointerCancel: U,
				onClickCapture: (e) => {
					V.current && (e.stopPropagation(), e.preventDefault());
				},
				children: /* @__PURE__ */ (0, w.jsxs)("table", {
					className: "tlg",
					style: { width: 128 + Z.length * K.w },
					children: [
						/* @__PURE__ */ (0, w.jsxs)("colgroup", { children: [/* @__PURE__ */ (0, w.jsx)("col", { style: { width: 128 } }), Z.map((e) => /* @__PURE__ */ (0, w.jsx)("col", { style: { width: K.w } }, e))] }),
						/* @__PURE__ */ (0, w.jsxs)("thead", { children: [/* @__PURE__ */ (0, w.jsxs)("tr", { children: [/* @__PURE__ */ (0, w.jsx)("th", {
							className: "rm",
							rowSpan: K.h < 24 ? 2 : 1,
							children: "Room"
						}), $.map((e) => /* @__PURE__ */ (0, w.jsx)("th", {
							colSpan: e.span,
							children: oe(e.t)
						}, e.key))] }), K.h < 24 && /* @__PURE__ */ (0, w.jsx)("tr", { children: Z.map((e) => /* @__PURE__ */ (0, w.jsx)("th", { children: se(e) }, e)) })] }),
						/* @__PURE__ */ (0, w.jsx)("tbody", { children: X.length ? X.map((e) => {
							let t = e.lanes.length ? e.lanes : [[]];
							return /* @__PURE__ */ (0, w.jsx)(y.Fragment, { children: t.map((n, r) => /* @__PURE__ */ (0, w.jsxs)("tr", {
								className: r === 0 ? "first" : void 0,
								children: [r === 0 && /* @__PURE__ */ (0, w.jsxs)("th", {
									className: "rm",
									rowSpan: t.length,
									children: [
										/* @__PURE__ */ (0, w.jsx)("b", { children: e.room }),
										e.capacity != null && /* @__PURE__ */ (0, w.jsx)("small", {
											className: e.peak > e.capacity ? "full" : void 0,
											children: e.peak ? `${e.peak} of ${e.capacity} bed${e.capacity === 1 ? "" : "s"} at most` : `${e.capacity} bed${e.capacity === 1 ? "" : "s"} · free`
										}),
										e.capacity == null && e.peak > 0 && /* @__PURE__ */ (0, w.jsxs)("small", { children: [
											e.peak,
											" bed",
											e.peak === 1 ? "" : "s",
											" at most"
										] }),
										e.split > 1 && /* @__PURE__ */ (0, w.jsx)("small", {
											className: "split",
											title: "A check-out and a check-in fall in the same cell, so this room's cells are split into finer pieces",
											children: ie(e.split, K.h)
										}),
										e.hidden > 0 && /* @__PURE__ */ (0, w.jsxs)("small", {
											className: "full",
											title: "More groups overlap in this room at the same time than can be drawn — check these slips",
											children: [
												"+",
												e.hidden,
												" more overlapping (not drawn)"
											]
										})
									]
								}), /* @__PURE__ */ (0, w.jsx)("td", {
									className: "lane",
									colSpan: Z.length,
									children: /* @__PURE__ */ (0, w.jsxs)("div", {
										className: `strip${e.split > 1 ? " split" : ""}`,
										style: {
											gridTemplateColumns: `repeat(${Z.length * e.split}, 1fr)`,
											"--cw": `${K.w}px`,
											"--pw": `${K.w / e.split}px`
										},
										children: [Q != null && /* @__PURE__ */ (0, w.jsx)("i", {
											className: "now-line",
											style: { left: Q }
										}), n.map((e) => /* @__PURE__ */ (0, w.jsxs)("div", {
											className: `blk${e.excl ? " excl" : ""}`,
											style: {
												background: e.color,
												gridColumn: `${e.s0 + 1} / ${e.s1 + 2}`,
												gridRow: 1
											},
											title: ye(e),
											onClick: () => te("slip", { sh_no: e.sh }),
											children: [/* @__PURE__ */ (0, w.jsx)("span", {
												className: "sh",
												children: e.sh
											}), /* @__PURE__ */ (0, w.jsx)("span", {
												className: "t",
												children: re(e)
											})]
										}, e.key))]
									})
								})]
							}, r)) }, e.room);
						}) : /* @__PURE__ */ (0, w.jsx)("tr", { children: /* @__PURE__ */ (0, w.jsx)("td", {
							colSpan: Z.length + 1,
							className: "p-4 text-center text-muted-foreground",
							children: R ? "No room is in use in this period." : "This building has no rooms set up (Rooms & Buildings) and no slip uses one."
						}) }) })
					]
				})
			}),
			/* @__PURE__ */ (0, w.jsx)("p", {
				className: "text-xs text-muted-foreground",
				children: "Each coloured block is one group in that room: SH · tour operator · group leader · pax in the room / whole group. 🔒 striped = Exclusive room. Times are exact — when one group leaves and the next arrives in the same cell, that room's cells are split into finer pieces (fine lines) instead of showing a double booking. A red line marks now. Hover for times, click to open the slip. Hold the left mouse button and drag to move around the grid."
			})
		]
	});
}
export { O as default };
