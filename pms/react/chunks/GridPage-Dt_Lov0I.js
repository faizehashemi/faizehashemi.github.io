import { a as e, f as t, h as n, i as r, n as i, p as a, u as o } from "./PmsContext-BVMd13Oi.js";
import { t as s } from "./useQuery-BUXPY6q6.js";
import { t as c } from "./label-CMEyi--P.js";
import { t as l } from "./slider-Db2mTvMK.js";
import { t as u } from "./createLucideIcon-CQUC5AEZ.js";
import { t as d } from "./plus-CPwEqLyF.js";
import { t as f } from "./printer-_t2PY0au.js";
import { t as p } from "./refresh-cw-D-L_YZdS.js";
import { t as m } from "./button-BGWa3SLr.js";
import { t as h } from "./input-DSBk_UeU.js";
import { t as g } from "./utils-b7UP9Cmo.js";
import { t as _ } from "./useSlips-DUKbzGma.js";
// node_modules/lucide-react/dist/esm/icons/minus.mjs
var v = {
	name: "minus",
	size: 24,
	node: [["path", {
		d: "M5 12h14",
		key: "1ays0h"
	}]]
};
v.node;
var y = u(v), b = /* @__PURE__ */ n(a(), 1), x = (e, t) => {
	if (!e) return null;
	let n = /* @__PURE__ */ new Date(`${e}T${t && t.length ? t : "00:00"}`);
	return isNaN(n.getTime()) ? null : n;
}, S = (e) => {
	try {
		return e.toLocaleString([], {
			month: "short",
			day: "2-digit",
			hour: "2-digit",
			minute: "2-digit"
		});
	} catch {
		return e.toISOString().slice(5, 16).replace("T", " ");
	}
}, C = (e) => String(e ?? "").trim(), w = (e) => C(e).replace(/\s+/g, "").toUpperCase(), T = (e, t, n) => +e >= t && +e < n;
function E(e) {
	let t = w(e), n = t.match(/^(\d+)([A-Z]*)$/i);
	if (!n) return {
		floor: "?",
		col: t
	};
	let r = n[1], i = n[2] || "";
	return r.length <= 2 ? {
		floor: "0",
		col: r + i
	} : {
		floor: r.slice(0, -2),
		col: r.slice(-2) + i
	};
}
function D(e, t, n, r, i, a) {
	let o = (n || "").trim(), s = (e, t) => {
		let n = (n) => !t || i.normB(n.building || e.building) === i.normB(t), r = (e.rooms?.gents || []).filter(n).map((e) => w(e.room_no ?? e)), a = (e.rooms?.ladies || []).filter(n).map((e) => w(e.room_no ?? e));
		return [...r, ...a].filter(Boolean);
	}, c = a.findBuilding(t, o)?.rooms || [], l = /* @__PURE__ */ new Map();
	for (let e of c) {
		let t = w(e.room_no);
		t && e.active !== !1 && !(e.handed?.at && Date.parse(e.handed.at) <= +r) && l.set(t, {
			floor: String(e.floor || "").trim() || E(t).floor,
			offList: !1
		});
	}
	let u = l.size > 0;
	for (let t of e) if (i.slipTouches(t, o) && (!u || i.rowsOf(t).some((e) => i.normB(e.building) === i.normB(o) && e.start && e.end && T(r, e.start, e.end)))) for (let e of s(t, o)) {
		if (l.has(e)) continue;
		let t = c.find((t) => w(t.room_no) === e);
		l.set(e, {
			floor: String(t?.floor || "").trim() || E(e).floor,
			offList: u
		});
	}
	let d = /* @__PURE__ */ new Map(), f = /* @__PURE__ */ new Map(), p = /* @__PURE__ */ new Set();
	for (let [e, t] of l) {
		let { col: n } = E(e);
		d.has(t.floor) || d.set(t.floor, /* @__PURE__ */ new Set()), d.get(t.floor).add(n), f.set(`${t.floor}|${n}`, e), t.offList && p.add(e);
	}
	let m = [...d.keys()].sort((e, t) => Number(/^\d/.test(e)) - Number(/^\d/.test(t)) || e.localeCompare(t, void 0, {
		numeric: !0,
		sensitivity: "base"
	})), h = /* @__PURE__ */ new Set();
	m.forEach((e) => d.get(e).forEach((e) => h.add(e)));
	let g = [...h].sort((e, t) => {
		let n = parseInt(e, 10), r = parseInt(t, 10);
		return !isNaN(n) && !isNaN(r) && n !== r ? n - r : e.localeCompare(t, void 0, {
			numeric: !0,
			sensitivity: "base"
		});
	}), _ = /* @__PURE__ */ new Map(), v = /* @__PURE__ */ new Map(), y = /* @__PURE__ */ new Map();
	for (let t of e) {
		if (!i.slipTouches(t, o)) continue;
		let e = /* @__PURE__ */ new Map();
		for (let n of i.rowsOf(t)) {
			if (i.normB(n.building) !== i.normB(o)) continue;
			let t = w(n.room_no);
			e.has(t) || e.set(t, []), e.get(t).push(n);
		}
		for (let [n, r] of e) _.has(n) || _.set(n, []), _.get(n).push({
			rec: t,
			ws: r
		});
		for (let e of s(t, o)) v.has(e) || v.set(e, []), v.get(e).push(t);
		y.set(t, x(t.checkin_date, t.checkin_time));
	}
	let b = (e) => e.filter((e) => e.start && e.end && T(r, e.start, e.end)), C = /* @__PURE__ */ new Map();
	for (let t of [...e].sort((e, t) => e.createdAt > t.createdAt ? -1 : 1)) if (i.slipTouches(t, o)) for (let e of ["gents", "ladies"]) for (let n of t.rooms?.[e] || []) {
		if (i.normB(n.building || t.building) !== i.normB(o)) continue;
		let e = w(n.room_no ?? n), r = n.capacity === "" || n.capacity == null ? null : Number(n.capacity);
		!C.has(e) && r != null && C.set(e, r);
	}
	for (let e of c) C.set(w(e.room_no), e.capacity);
	let D = (e, t = 3) => {
		let n = [...new Set(e)];
		return n.length <= t ? n.join(", ") : n.slice(0, t).join(", ") + ` (+${n.length - t})`;
	}, O = /* @__PURE__ */ new Map();
	for (let e of m) for (let t of g) {
		let n = `${e}|${t}`, i = f.get(n);
		if (!i) {
			O.set(n, { kind: "none" });
			continue;
		}
		let a = (_.get(i) || []).filter((e) => b(e.ws).length), o = C.get(i) ?? null;
		if (a.length) {
			let e = 0, t = 0, r = !1, s = [], c = [];
			for (let n of a) {
				let i = b(n.ws);
				e += i.reduce((e, t) => e + (Number(t.row.assigned ?? t.row.pax ?? t.row.count ?? 0) || 0), 0), t += i.reduce((e, t) => e + t.block, 0), i.some((e) => e.exclusive) && (r = !0), n.rec.sh_no != null && s.push(String(n.rec.sh_no));
				for (let e of i) c.push(e.end);
			}
			let l = o != null && !Number.isNaN(o) ? o : null, u = Number.isFinite(e) ? e : 0, d = Number.isFinite(t) ? t : u, f = l != null && d < l, m = l == null ? null : Math.max(0, l - d);
			O.set(n, {
				kind: "occ",
				room: i,
				off: p.has(i),
				under: f,
				cap: `${l == null ? `${u}/—` : `${u}/${l}`}${r ? " · Excl." : ""}${f && m != null ? " · Vac " + m : ""}`,
				meta: `SH ${s.length ? D(s) : "—"} • Out ${c.length ? S(new Date(Math.min(...c))) : "—"}`
			});
		} else {
			let e = null, t = null;
			for (let n of v.get(i) || []) {
				let i = y.get(n);
				i && +i > +r && (!e || +i < +t) && (e = n, t = i);
			}
			let a = e ? e.sh_no ?? "" : "";
			O.set(n, {
				kind: "vacant",
				cap: o == null ? "—" : String(o),
				meta: e ? `Vacant • Next ${S(t)}${a ? " • SH " + a : ""}` : "Vacant"
			});
		}
	}
	return {
		building: o,
		flist: m,
		clist: g,
		cells: O,
		offCount: p.size,
		slipCount: e.length
	};
}
// src/pages/grid/GridPage.tsx
var O = t(), k = (e) => String(e).padStart(2, "0"), A = (e, t, n) => Math.max(t, Math.min(n, e));
function j({ label: e, value: t, onChange: n, min: r, max: i, step: a, d: o, lo: s, hi: c }) {
	return /* @__PURE__ */ (0, O.jsxs)("div", {
		className: "flex items-center gap-1.5",
		title: e,
		children: [
			/* @__PURE__ */ (0, O.jsx)("span", {
				className: "text-xs text-muted-foreground",
				children: e
			}),
			/* @__PURE__ */ (0, O.jsx)(m, {
				variant: "outline",
				size: "icon",
				className: "size-8",
				"aria-label": `${e} smaller`,
				onClick: () => n(A(t - o, s, c)),
				children: /* @__PURE__ */ (0, O.jsx)(y, { className: "size-4" })
			}),
			/* @__PURE__ */ (0, O.jsx)(l, {
				className: "w-24",
				min: r,
				max: i,
				step: a,
				value: [t],
				onValueChange: (e) => n(e[0]),
				"aria-label": e
			}),
			/* @__PURE__ */ (0, O.jsx)(m, {
				variant: "outline",
				size: "icon",
				className: "size-8",
				"aria-label": `${e} larger`,
				onClick: () => n(A(t + o, s, c)),
				children: /* @__PURE__ */ (0, O.jsx)(d, { className: "size-4" })
			})
		]
	});
}
function M() {
	let { rooms: t, stay: n } = i(), a = r(), l = e(), { site: u, siteId: d } = o(), v = /* @__PURE__ */ new Date(), [y, x] = (0, b.useState)(`${v.getFullYear()}-${k(v.getMonth() + 1)}-${k(v.getDate())}`), [S, C] = (0, b.useState)(`${k(v.getHours())}:${k(v.getMinutes())}`), [w, T] = (0, b.useState)({
		date: y,
		time: S
	}), [E, M] = (0, b.useState)(""), [N, P] = (0, b.useState)(65), [F, I] = (0, b.useState)(35), [L, R] = (0, b.useState)(10), z = (0, b.useRef)(null), B = _(6e4), V = s({
		queryKey: ["buildings-force", d],
		queryFn: async () => await a(t.loadBuildings({ force: !0 }))
	}), H = (0, b.useMemo)(() => {
		let e = t.buildingsOfSite(V.data ?? [], d).filter((e) => e.rooms.length).map((e) => e.name), n = (B.data ?? []).map((e) => (e.building || "").trim()).filter(Boolean);
		return [.../* @__PURE__ */ new Set([...e, ...n])];
	}, [
		V.data,
		B.data,
		d,
		t
	]), U = E && H.includes(E) ? E : H[0] || "", W = /* @__PURE__ */ new Date(`${w.date}T${w.time}`), G = (0, b.useMemo)(() => B.data && V.data && U && !isNaN(+W) ? D(B.data, V.data, U, W, n, t) : null, [
		B.data,
		V.data,
		U,
		w,
		n,
		t
	]);
	async function K() {
		z.current && (await l("views/grid/export.js")).printGrid(z.current, {
			building: U,
			date: w.date,
			time: w.time,
			site: u.label
		});
	}
	return /* @__PURE__ */ (0, O.jsxs)("div", {
		className: "mx-auto grid grid-cols-[minmax(0,1fr)] max-w-[2400px] min-w-0 gap-3 px-3 pb-10 pt-4 sm:px-4",
		children: [
			/* @__PURE__ */ (0, O.jsxs)("div", {
				className: "flex flex-wrap items-end gap-3",
				children: [
					/* @__PURE__ */ (0, O.jsxs)("div", {
						className: "grid gap-1",
						children: [/* @__PURE__ */ (0, O.jsx)(c, {
							htmlFor: "asof_date",
							children: "Date"
						}), /* @__PURE__ */ (0, O.jsx)(h, {
							id: "asof_date",
							type: "date",
							value: y,
							onChange: (e) => {
								x(e.target.value), e.target.value && S && T({
									date: e.target.value,
									time: S
								});
							}
						})]
					}),
					/* @__PURE__ */ (0, O.jsxs)("div", {
						className: "grid gap-1",
						children: [/* @__PURE__ */ (0, O.jsx)(c, {
							htmlFor: "asof_time",
							children: "Time"
						}), /* @__PURE__ */ (0, O.jsx)(h, {
							id: "asof_time",
							type: "time",
							step: 60,
							value: S,
							onChange: (e) => {
								C(e.target.value), y && e.target.value && T({
									date: y,
									time: e.target.value
								});
							}
						})]
					}),
					/* @__PURE__ */ (0, O.jsx)(m, {
						onClick: () => {
							!y || !S ? alert("Choose date and time") : T({
								date: y,
								time: S
							});
						},
						children: "Recalculate"
					}),
					/* @__PURE__ */ (0, O.jsxs)(m, {
						variant: "outline",
						onClick: () => {
							B.refetch(), V.refetch();
						},
						children: [/* @__PURE__ */ (0, O.jsx)(p, { className: g("size-4", B.isFetching && "animate-spin") }), "Refresh DB"]
					}),
					/* @__PURE__ */ (0, O.jsxs)(m, {
						variant: "outline",
						onClick: () => void K(),
						children: [/* @__PURE__ */ (0, O.jsx)(f, { className: "size-4" }), "Print…"]
					}),
					/* @__PURE__ */ (0, O.jsxs)("div", {
						className: "ml-auto flex flex-wrap items-center gap-4",
						children: [
							/* @__PURE__ */ (0, O.jsx)(j, {
								label: "Width",
								value: N,
								onChange: P,
								min: 1,
								max: 240,
								step: 2,
								d: 8,
								lo: 80,
								hi: 240
							}),
							/* @__PURE__ */ (0, O.jsx)(j, {
								label: "Height",
								value: F,
								onChange: I,
								min: 1,
								max: 200,
								step: 2,
								d: 8,
								lo: 60,
								hi: 200
							}),
							/* @__PURE__ */ (0, O.jsx)(j, {
								label: "Text",
								value: L,
								onChange: R,
								min: 1,
								max: 20,
								step: 1,
								d: 1,
								lo: 9,
								hi: 20
							})
						]
					})
				]
			}),
			/* @__PURE__ */ (0, O.jsx)("div", {
				role: "tablist",
				className: "flex flex-wrap gap-1.5 rounded-xl border bg-card p-2",
				children: H.map((e) => /* @__PURE__ */ (0, O.jsx)("button", {
					role: "tab",
					"aria-selected": e === U,
					onClick: () => M(e),
					className: g("rounded-full border bg-[#fffdf5] px-3 py-1.5 text-sm hover:bg-accent", e === U && "border-gold bg-accent font-bold"),
					children: e
				}, e))
			}),
			/* @__PURE__ */ (0, O.jsxs)("div", {
				className: "overflow-hidden rounded-xl border bg-card",
				children: [/* @__PURE__ */ (0, O.jsx)("div", {
					className: "gridp max-h-[75vh] overflow-auto",
					style: {
						"--cellW": `${A(N, 80, 240)}px`,
						"--cellH": `${A(F, 60, 200)}px`,
						"--fs": `${A(L, 9, 20)}px`
					},
					children: G ? G.flist.length ? /* @__PURE__ */ (0, O.jsxs)("div", {
						ref: z,
						id: "matrix",
						className: "matrix",
						style: { gridTemplateColumns: `repeat(${G.clist.length + 1}, max-content)` },
						children: [
							/* @__PURE__ */ (0, O.jsx)("div", {
								className: "hcell corner",
								children: G.building
							}),
							G.clist.map((e) => /* @__PURE__ */ (0, O.jsx)("div", {
								className: "hcell",
								children: e
							}, e)),
							G.flist.flatMap((e) => [/* @__PURE__ */ (0, O.jsx)("div", {
								className: "rcell",
								children: `FLOOR ${e}`
							}, `f-${e}`), ...G.clist.map((t) => {
								let n = G.cells.get(`${e}|${t}`);
								return n.kind === "none" ? /* @__PURE__ */ (0, O.jsxs)("div", {
									className: "cell",
									children: [/* @__PURE__ */ (0, O.jsx)("div", {
										className: "cap",
										children: "—"
									}), /* @__PURE__ */ (0, O.jsx)("div", {
										className: "meta",
										children: "\xA0"
									})]
								}, `${e}|${t}`) : n.kind === "vacant" ? /* @__PURE__ */ (0, O.jsxs)("div", {
									className: "cell",
									children: [/* @__PURE__ */ (0, O.jsx)("div", {
										className: "cap",
										children: n.cap
									}), /* @__PURE__ */ (0, O.jsx)("div", {
										className: "meta",
										children: n.meta
									})]
								}, `${e}|${t}`) : /* @__PURE__ */ (0, O.jsxs)("div", {
									className: g("cell occ", n.under && "under", n.off && "off-list"),
									title: n.off ? `Room ${n.room} is not an active room in Rooms & Buildings` : void 0,
									children: [/* @__PURE__ */ (0, O.jsx)("div", {
										className: "cap",
										children: n.cap
									}), /* @__PURE__ */ (0, O.jsx)("div", {
										className: "meta",
										children: n.meta
									})]
								}, `${e}|${t}`);
							})])
						]
					}) : /* @__PURE__ */ (0, O.jsx)("p", {
						className: "p-3",
						children: "No rooms found for this building."
					}) : /* @__PURE__ */ (0, O.jsx)("p", {
						className: "p-3 text-sm text-muted-foreground",
						children: "Loading DB…"
					})
				}), /* @__PURE__ */ (0, O.jsx)("div", {
					className: "border-t bg-card px-3 py-1.5 text-xs text-muted-foreground",
					children: G ? `${G.building} • Floors ${G.flist.join(", ")} • ${G.clist.length} columns • ${G.slipCount} slip(s)${G.offCount ? ` • ${G.offCount} room(s) in use but not active in Rooms & Buildings (dashed)` : ""}` : "Loading DB…"
				})]
			})
		]
	});
}
export { M as default };
