import { f as e, h as t, i as n, n as r, o as i, p as a, u as o } from "./PmsContext-BVMd13Oi.js";
import { E as s } from "./query-DROYnevi.js";
import { t as c } from "./useQuery-BUXPY6q6.js";
import { a as l, n as u, o as d, r as f, t as p } from "./dialog-DtgtvZ4Q.js";
import { t as m } from "./checkbox-C3tIiLfF.js";
import { t as h } from "./label-CMEyi--P.js";
import { t as g } from "./createLucideIcon-CQUC5AEZ.js";
import { t as _ } from "./plus-CPwEqLyF.js";
import { t as v } from "./search-C_WlyVyV.js";
import { t as y } from "./button-BGWa3SLr.js";
import { t as b } from "./input-DSBk_UeU.js";
import { t as x } from "./utils-b7UP9Cmo.js";
import { t as S } from "./badge-EB7Muw37.js";
import { t as C } from "./textarea-BxHERF6b.js";
// node_modules/lucide-react/dist/esm/icons/camera.mjs
var w = {
	name: "camera",
	size: 24,
	node: [["path", {
		d: "M13.997 4a2 2 0 0 1 1.76 1.05l.486.9A2 2 0 0 0 18.003 7H20a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h1.997a2 2 0 0 0 1.759-1.048l.489-.904A2 2 0 0 1 10.004 4z",
		key: "18u6gg"
	}], ["circle", {
		cx: "12",
		cy: "13",
		r: "3",
		key: "1vg3eu"
	}]]
};
w.node;
var T = g(w), E = /* @__PURE__ */ t(a(), 1), D = e(), O = {
	found: {
		label: "Found",
		sub: "Awaiting collection",
		cls: "bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950 dark:text-amber-200",
		icon: "🟡"
	},
	handed: {
		label: "Handed over",
		sub: "In custody",
		cls: "bg-sky-100 text-sky-900 border-sky-300 dark:bg-sky-950 dark:text-sky-200",
		icon: "🔵"
	},
	returned: {
		label: "Returned to guest",
		sub: "Completed",
		cls: "bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-200",
		icon: "✅"
	}
}, k = {
	found: "Registered",
	handed: "Handed over",
	returned: "Returned to guest",
	edit: "Edited",
	reopen: "Reopened"
}, A = (e) => String(e).padStart(2, "0"), j = () => {
	let e = /* @__PURE__ */ new Date();
	return `${e.getFullYear()}-${A(e.getMonth() + 1)}-${A(e.getDate())}T${A(e.getHours())}:${A(e.getMinutes())}`;
}, M = (e) => e ? new Date((e.length, e)).toLocaleString("en-GB", {
	day: "numeric",
	month: "short",
	year: "numeric",
	hour: "2-digit",
	minute: "2-digit"
}) : "—", N = (e) => e.place === "bus" ? `🚌 ${/^bus/i.test(e.spot) ? "" : "Bus "}${e.spot}` : e.place === "other" ? `📍 ${e.spot}` : `🚪 Room ${e.room}${e.building ? ` · ${e.building}` : ""}${e.floor ? ` · floor ${e.floor}` : ""}`, P = (e, t) => e.localeCompare(t, void 0, {
	numeric: !0,
	sensitivity: "base"
});
function F({ s: e }) {
	let t = O[e] || O.found;
	return /* @__PURE__ */ (0, D.jsxs)("span", {
		className: x("inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold", t.cls),
		children: [
			t.icon,
			" ",
			t.label
		]
	});
}
function I() {
	let { cloud: e, rooms: t } = r(), a = n(), l = i(), { site: u, siteId: d } = o(), f = s(), p = c({
		queryKey: ["lost", d],
		queryFn: async () => await a(e.request("GET", `/api/lost?site=${d}`)),
		refetchInterval: 6e4
	}), m = c({
		queryKey: ["buildings", d],
		queryFn: async () => t.buildingsOfSite(await a(t.loadBuildings()), d)
	}), [g, S] = (0, E.useState)(""), [C, w] = (0, E.useState)("all"), [T, O] = (0, E.useState)(""), [k, A] = (0, E.useState)(null), [j, P] = (0, E.useState)(null), I = p.data?.items ?? [], z = !!p.data?.can_edit, B = () => f.invalidateQueries({ queryKey: ["lost", d] }), V = (0, E.useMemo)(() => {
		let e = g.trim().toLowerCase();
		return I.filter((t) => (C === "all" || t.status === C) && (!T || String(t.found_at).slice(0, 10) === T) && (!e || [
			t.ref,
			t.room,
			t.spot,
			t.building,
			t.floor,
			t.item,
			t.found_by,
			t.custodian
		].some((t) => String(t || "").toLowerCase().includes(e))));
	}, [
		I,
		g,
		C,
		T
	]), H = (e) => I.filter((t) => t.status === e).length;
	return /* @__PURE__ */ (0, D.jsxs)("div", {
		className: "mx-auto grid max-w-[1600px] gap-4 px-3 pb-12 pt-4 sm:px-5",
		children: [
			/* @__PURE__ */ (0, D.jsxs)("header", {
				className: "relative overflow-hidden rounded-3xl bg-[radial-gradient(120%_150%_at_100%_0%,#7a5a14_0%,#0b1020_60%)] px-6 py-7 text-white shadow-xl sm:px-9",
				children: [
					/* @__PURE__ */ (0, D.jsxs)("div", {
						className: "text-[11px] font-semibold uppercase tracking-[0.32em] text-[#f5d78e]",
						children: [u.label, " · Rooms"]
					}),
					/* @__PURE__ */ (0, D.jsx)("h1", {
						className: "mt-1 font-serif text-4xl font-black tracking-tight",
						children: "Lost & Found"
					}),
					/* @__PURE__ */ (0, D.jsx)("p", {
						className: "mt-1 text-sm text-[#fde7b0]/90",
						children: "Every item left in a room — photo, who found it, who holds it, and when it went back to the guest."
					}),
					z && /* @__PURE__ */ (0, D.jsxs)(y, {
						className: "mt-4 bg-[#f5d78e] text-[#0b1020] hover:bg-[#f0cb6c]",
						onClick: () => A({}),
						children: [/* @__PURE__ */ (0, D.jsx)(_, { className: "size-4" }), "Add lost item"]
					})
				]
			}),
			/* @__PURE__ */ (0, D.jsx)("div", {
				className: "grid grid-cols-2 gap-3 lg:grid-cols-4",
				children: [
					[
						"all",
						"📦",
						"Total found",
						I.length
					],
					[
						"found",
						"🟡",
						"Pending",
						H("found")
					],
					[
						"handed",
						"🔵",
						"Handed over",
						H("handed")
					],
					[
						"returned",
						"✅",
						"Returned",
						H("returned")
					]
				].map(([e, t, n, r]) => /* @__PURE__ */ (0, D.jsxs)("button", {
					type: "button",
					onClick: () => w(e),
					className: x("rounded-2xl border bg-card p-4 text-left shadow-sm transition hover:shadow-md", C === e && "ring-2 ring-primary"),
					children: [
						/* @__PURE__ */ (0, D.jsx)("span", {
							className: "text-xl",
							"aria-hidden": !0,
							children: t
						}),
						/* @__PURE__ */ (0, D.jsx)("b", {
							className: "block font-serif text-3xl",
							children: r
						}),
						/* @__PURE__ */ (0, D.jsx)("small", {
							className: "text-xs uppercase tracking-wider text-muted-foreground",
							children: n
						})
					]
				}, e))
			}),
			/* @__PURE__ */ (0, D.jsxs)("div", {
				className: "flex flex-wrap items-end gap-2",
				children: [
					/* @__PURE__ */ (0, D.jsxs)("div", {
						className: "relative min-w-60 flex-1",
						children: [/* @__PURE__ */ (0, D.jsx)(v, { className: "absolute left-2.5 top-2.5 size-4 text-muted-foreground" }), /* @__PURE__ */ (0, D.jsx)(b, {
							type: "search",
							className: "pl-8",
							placeholder: "Search room, building, item, reference, name",
							value: g,
							onChange: (e) => S(e.target.value)
						})]
					}),
					/* @__PURE__ */ (0, D.jsxs)("div", {
						className: "grid gap-1",
						children: [/* @__PURE__ */ (0, D.jsx)(h, {
							htmlFor: "lfday",
							className: "text-xs",
							children: "Date found"
						}), /* @__PURE__ */ (0, D.jsx)(b, {
							id: "lfday",
							type: "date",
							value: T,
							onChange: (e) => O(e.target.value)
						})]
					}),
					(g || T || C !== "all") && /* @__PURE__ */ (0, D.jsx)(y, {
						variant: "ghost",
						onClick: () => {
							S(""), O(""), w("all");
						},
						children: "Clear"
					})
				]
			}),
			p.isError && /* @__PURE__ */ (0, D.jsx)("p", {
				className: "text-sm text-destructive",
				children: String(p.error?.message || p.error)
			}),
			p.isLoading ? /* @__PURE__ */ (0, D.jsx)("p", {
				className: "text-sm text-muted-foreground",
				children: "Loading…"
			}) : V.length ? /* @__PURE__ */ (0, D.jsx)("div", {
				className: "grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4",
				children: V.map((e) => /* @__PURE__ */ (0, D.jsxs)("button", {
					type: "button",
					onClick: () => P(e.id),
					className: x("flex gap-3 rounded-2xl border bg-card p-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md", e.status === "returned" && "opacity-75"),
					children: [e.thumb ? /* @__PURE__ */ (0, D.jsx)("img", {
						src: e.thumb,
						alt: "",
						className: "size-24 shrink-0 rounded-xl object-cover"
					}) : /* @__PURE__ */ (0, D.jsx)("span", {
						className: "grid size-24 shrink-0 place-items-center rounded-xl bg-muted text-3xl",
						children: "📦"
					}), /* @__PURE__ */ (0, D.jsxs)("span", {
						className: "grid min-w-0 content-start gap-1",
						children: [
							/* @__PURE__ */ (0, D.jsx)("span", {
								className: "font-mono text-[11px] text-muted-foreground",
								children: e.ref
							}),
							/* @__PURE__ */ (0, D.jsx)("b", {
								className: "line-clamp-2 leading-tight",
								children: e.item
							}),
							/* @__PURE__ */ (0, D.jsx)("span", {
								className: "text-sm",
								children: N(e)
							}),
							/* @__PURE__ */ (0, D.jsxs)("small", {
								className: "text-muted-foreground",
								children: ["Found ", M(e.found_at)]
							}),
							/* @__PURE__ */ (0, D.jsxs)("span", {
								className: "flex flex-wrap items-center gap-1.5",
								children: [/* @__PURE__ */ (0, D.jsx)(F, { s: e.status }), e.status !== "returned" && e.custodian && /* @__PURE__ */ (0, D.jsxs)("small", {
									className: "text-muted-foreground",
									children: ["with ", e.custodian]
								})]
							})
						]
					})]
				}, e.id))
			}) : /* @__PURE__ */ (0, D.jsx)("p", {
				className: "rounded-2xl border border-dashed p-8 text-center text-muted-foreground",
				children: I.length ? "Nothing matches." : "No lost items registered yet."
			}),
			k && /* @__PURE__ */ (0, D.jsx)(L, {
				init: k,
				blds: m.data ?? [],
				siteId: d,
				cloud: e,
				guard: a,
				loadCore: l,
				onClose: () => A(null),
				onSaved: (e) => {
					A(null), B(), P(e.id);
				}
			}),
			j != null && /* @__PURE__ */ (0, D.jsx)(R, {
				id: j,
				cloud: e,
				guard: a,
				canEdit: z,
				onClose: () => P(null),
				onEdit: (e) => {
					P(null), A(e);
				},
				onChanged: () => void B()
			})
		]
	});
}
function L({ init: e, blds: t, siteId: n, cloud: r, guard: i, loadCore: a, onClose: o, onSaved: s }) {
	let c = !!e.id, [m, g] = (0, E.useState)(() => ({
		place: e.place || "room",
		spot: e.spot || "",
		building: e.building || t[0]?.name || "",
		floor: e.floor || "",
		room: e.room || "",
		item: e.item || "",
		found_at: e.found_at || j(),
		found_by: e.found_by || "",
		custodian: e.custodian || "",
		remarks: e.remarks || ""
	})), [_, v] = (0, E.useState)({}), [S, w] = (0, E.useState)(e.photo || e.thumb || ""), [O, k] = (0, E.useState)(""), [A, M] = (0, E.useState)(!1), N = (t.find((e) => e.name === m.building)?.rooms || []).filter((e) => String(e.room_no || "").trim()), F = [...new Set(N.map((e) => String(e.floor ?? "").trim()).filter(Boolean))].sort(P), I = N.filter((e) => !m.floor || String(e.floor ?? "").trim() === m.floor).map((e) => String(e.room_no)).sort(P), L = (e, t) => g((n) => ({
		...n,
		[e]: t
	}));
	(0, E.useEffect)(() => {
		m.room && !I.includes(m.room) && N.length && L("room", "");
	}, [m.building, m.floor]);
	async function R(e) {
		if (e) try {
			let t = await a("laundry"), n = await t.shrinkImage(e, 1e3, .72), r = await t.shrinkImage(e, 220, .7);
			v({
				photo: n,
				thumb: r
			}), w(n), k("");
		} catch (e) {
			k(e.message);
		}
	}
	async function z(t) {
		t.preventDefault(), M(!0), k("");
		try {
			let t = {
				site: n,
				...m,
				..._,
				version: e.version
			};
			s((await i(c ? r.request("PUT", `/api/lost/${e.id}`, t) : r.request("POST", "/api/lost", t))).item);
		} catch (e) {
			k(e.message);
		} finally {
			M(!1);
		}
	}
	let B = "h-9 w-full rounded-md border bg-background px-2 text-sm";
	return /* @__PURE__ */ (0, D.jsx)(p, {
		open: !0,
		onOpenChange: (e) => {
			e || o();
		},
		children: /* @__PURE__ */ (0, D.jsxs)(u, {
			className: "flex max-h-[92vh] max-w-xl flex-col",
			children: [/* @__PURE__ */ (0, D.jsxs)(l, { children: [/* @__PURE__ */ (0, D.jsx)(d, {
				className: "font-serif text-2xl",
				children: c ? `Edit ${e.ref}` : "Add lost item"
			}), /* @__PURE__ */ (0, D.jsx)(f, { children: "Where it was found, a photo, and who has it now." })] }), /* @__PURE__ */ (0, D.jsxs)("form", {
				onSubmit: z,
				className: "grid min-h-0 gap-3 overflow-y-auto pr-1",
				children: [
					/* @__PURE__ */ (0, D.jsxs)("div", {
						className: "grid gap-1",
						children: [/* @__PURE__ */ (0, D.jsx)(h, { children: "Found in" }), /* @__PURE__ */ (0, D.jsx)("div", {
							className: "inline-flex w-fit rounded-lg border p-0.5 text-sm",
							role: "radiogroup",
							"aria-label": "Found in",
							children: [
								["room", "🚪 Room"],
								["bus", "🚌 Bus"],
								["other", "📍 Other place"]
							].map(([e, t]) => /* @__PURE__ */ (0, D.jsx)("button", {
								type: "button",
								role: "radio",
								"aria-checked": m.place === e,
								className: x("rounded-md px-3 py-1.5", m.place === e && "bg-primary text-primary-foreground"),
								onClick: () => L("place", e),
								children: t
							}, e))
						})]
					}),
					m.place !== "room" && /* @__PURE__ */ (0, D.jsxs)("div", {
						className: "grid gap-1",
						children: [/* @__PURE__ */ (0, D.jsx)(h, { children: m.place === "bus" ? "Bus (number / trip / date)" : "Where it was found" }), /* @__PURE__ */ (0, D.jsx)(b, {
							required: !0,
							maxLength: 120,
							value: m.spot,
							onChange: (e) => L("spot", e.target.value),
							placeholder: m.place === "bus" ? "e.g. Bus 3 · Madina trip 18 Nov" : "e.g. Mawaid hall, lobby, lift"
						})]
					}),
					m.place === "room" && /* @__PURE__ */ (0, D.jsxs)("div", {
						className: "grid grid-cols-3 gap-2",
						children: [
							/* @__PURE__ */ (0, D.jsxs)("div", {
								className: "grid gap-1",
								children: [/* @__PURE__ */ (0, D.jsx)(h, { children: "Building" }), /* @__PURE__ */ (0, D.jsxs)("select", {
									className: B,
									value: m.building,
									onChange: (e) => {
										L("building", e.target.value), L("floor", "");
									},
									children: [t.map((e) => /* @__PURE__ */ (0, D.jsx)("option", {
										value: e.name,
										children: e.name
									}, e.name)), !t.length && /* @__PURE__ */ (0, D.jsx)("option", {
										value: "",
										children: "—"
									})]
								})]
							}),
							/* @__PURE__ */ (0, D.jsxs)("div", {
								className: "grid gap-1",
								children: [/* @__PURE__ */ (0, D.jsx)(h, { children: "Floor" }), /* @__PURE__ */ (0, D.jsxs)("select", {
									className: B,
									value: m.floor,
									onChange: (e) => L("floor", e.target.value),
									children: [/* @__PURE__ */ (0, D.jsx)("option", {
										value: "",
										children: "All floors"
									}), F.map((e) => /* @__PURE__ */ (0, D.jsx)("option", {
										value: e,
										children: e
									}, e))]
								})]
							}),
							/* @__PURE__ */ (0, D.jsxs)("div", {
								className: "grid gap-1",
								children: [/* @__PURE__ */ (0, D.jsx)(h, { children: "Room" }), I.length ? /* @__PURE__ */ (0, D.jsxs)("select", {
									className: B,
									required: !0,
									value: m.room,
									onChange: (e) => {
										L("room", e.target.value);
										let t = N.find((t) => String(t.room_no) === e.target.value);
										t && !m.floor && t.floor != null && L("floor", String(t.floor));
									},
									children: [/* @__PURE__ */ (0, D.jsx)("option", {
										value: "",
										children: "Choose…"
									}), I.map((e) => /* @__PURE__ */ (0, D.jsx)("option", {
										value: e,
										children: e
									}, e))]
								}) : /* @__PURE__ */ (0, D.jsx)(b, {
									required: !0,
									value: m.room,
									onChange: (e) => L("room", e.target.value),
									placeholder: "Room no."
								})]
							})
						]
					}),
					/* @__PURE__ */ (0, D.jsxs)("div", {
						className: "grid gap-1",
						children: [/* @__PURE__ */ (0, D.jsx)(h, { children: "Item name / description" }), /* @__PURE__ */ (0, D.jsx)(C, {
							required: !0,
							rows: 2,
							maxLength: 300,
							value: m.item,
							onChange: (e) => L("item", e.target.value),
							placeholder: "e.g. Black leather wallet with ID card"
						})]
					}),
					/* @__PURE__ */ (0, D.jsxs)("div", {
						className: "grid gap-2",
						children: [/* @__PURE__ */ (0, D.jsx)(h, { children: "Item photo" }), /* @__PURE__ */ (0, D.jsxs)("div", {
							className: "flex items-center gap-3",
							children: [S ? /* @__PURE__ */ (0, D.jsx)("img", {
								src: S,
								alt: "The item",
								className: "size-28 rounded-xl object-cover"
							}) : /* @__PURE__ */ (0, D.jsx)("span", {
								className: "grid size-28 place-items-center rounded-xl bg-muted text-3xl",
								children: "📷"
							}), /* @__PURE__ */ (0, D.jsxs)("label", {
								className: "inline-flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm",
								children: [
									/* @__PURE__ */ (0, D.jsx)(T, { className: "size-4" }),
									"Take / choose photo",
									/* @__PURE__ */ (0, D.jsx)("input", {
										hidden: !0,
										type: "file",
										accept: "image/*",
										capture: "environment",
										onChange: (e) => void R(e.target.files?.[0])
									})
								]
							})]
						})]
					}),
					/* @__PURE__ */ (0, D.jsxs)("div", {
						className: "grid gap-2 sm:grid-cols-2",
						children: [
							/* @__PURE__ */ (0, D.jsxs)("div", {
								className: "grid gap-1",
								children: [/* @__PURE__ */ (0, D.jsx)(h, { children: "Date & time found" }), /* @__PURE__ */ (0, D.jsx)(b, {
									required: !0,
									type: "datetime-local",
									value: m.found_at,
									onChange: (e) => L("found_at", e.target.value)
								})]
							}),
							/* @__PURE__ */ (0, D.jsxs)("div", {
								className: "grid gap-1",
								children: [/* @__PURE__ */ (0, D.jsx)(h, { children: "Found by (supervisor)" }), /* @__PURE__ */ (0, D.jsx)(b, {
									required: !0,
									maxLength: 80,
									value: m.found_by,
									onChange: (e) => L("found_by", e.target.value)
								})]
							}),
							/* @__PURE__ */ (0, D.jsxs)("div", {
								className: "grid gap-1 sm:col-span-2",
								children: [/* @__PURE__ */ (0, D.jsx)(h, { children: "Current custodian" }), /* @__PURE__ */ (0, D.jsx)(b, {
									maxLength: 80,
									value: m.custodian,
									onChange: (e) => L("custodian", e.target.value),
									placeholder: "Supervisor or authorised person holding it"
								})]
							})
						]
					}),
					/* @__PURE__ */ (0, D.jsxs)("div", {
						className: "grid gap-1",
						children: [/* @__PURE__ */ (0, D.jsx)(h, { children: "Remarks (optional)" }), /* @__PURE__ */ (0, D.jsx)(C, {
							rows: 2,
							maxLength: 600,
							value: m.remarks,
							onChange: (e) => L("remarks", e.target.value)
						})]
					}),
					O && /* @__PURE__ */ (0, D.jsx)("p", {
						className: "text-sm text-destructive",
						children: O
					}),
					/* @__PURE__ */ (0, D.jsxs)("div", {
						className: "flex justify-end gap-2",
						children: [/* @__PURE__ */ (0, D.jsx)(y, {
							type: "button",
							variant: "outline",
							onClick: o,
							children: "Cancel"
						}), /* @__PURE__ */ (0, D.jsx)(y, {
							type: "submit",
							disabled: A,
							children: A ? "Saving…" : c ? "Save changes" : "Register item"
						})]
					})
				]
			})]
		})
	});
}
function R({ id: e, cloud: t, guard: n, canEdit: r, onClose: i, onEdit: a, onChanged: o }) {
	let [s, c] = (0, E.useState)(null), [g, _] = (0, E.useState)(""), [v, x] = (0, E.useState)(null), [w, T] = (0, E.useState)({}), [A, P] = (0, E.useState)(!1);
	(0, E.useEffect)(() => {
		n(t.request("GET", `/api/lost/${e}`)).then((e) => c(e.item), (e) => _(e.message));
	}, [e]);
	let I = (e) => {
		x(e), T({
			by: s?.custodian || s?.found_by || "",
			to: "",
			at: j(),
			remarks: "",
			confirmed: e === "returned"
		}), _("");
	};
	async function L(e) {
		if (e.preventDefault(), s && v) {
			P(!0), _("");
			try {
				let e = await n(t.request("POST", `/api/lost/${s.id}/move`, {
					...w,
					status: v,
					version: s.version
				}));
				c(e.item), x(null), o();
			} catch (e) {
				_(e.message);
			} finally {
				P(!1);
			}
		}
	}
	return /* @__PURE__ */ (0, D.jsx)(p, {
		open: !0,
		onOpenChange: (e) => {
			e || i();
		},
		children: /* @__PURE__ */ (0, D.jsx)(u, {
			className: "flex max-h-[92vh] max-w-2xl flex-col",
			children: s ? /* @__PURE__ */ (0, D.jsxs)(D.Fragment, { children: [
				/* @__PURE__ */ (0, D.jsxs)(l, { children: [/* @__PURE__ */ (0, D.jsx)(d, {
					className: "font-serif text-2xl",
					children: s.item
				}), /* @__PURE__ */ (0, D.jsxs)(f, {
					className: "flex flex-wrap items-center gap-2",
					children: [
						/* @__PURE__ */ (0, D.jsx)("span", {
							className: "font-mono",
							children: s.ref
						}),
						/* @__PURE__ */ (0, D.jsx)(F, { s: s.status }),
						/* @__PURE__ */ (0, D.jsx)("span", { children: O[s.status]?.sub })
					]
				})] }),
				/* @__PURE__ */ (0, D.jsxs)("div", {
					className: "grid min-h-0 gap-4 overflow-y-auto pr-1",
					children: [
						/* @__PURE__ */ (0, D.jsxs)("div", {
							className: "grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]",
							children: [s.photo ? /* @__PURE__ */ (0, D.jsx)("a", {
								href: s.photo,
								target: "_blank",
								rel: "noopener",
								children: /* @__PURE__ */ (0, D.jsx)("img", {
									src: s.photo,
									alt: s.item,
									className: "max-h-72 w-full rounded-2xl object-cover"
								})
							}) : /* @__PURE__ */ (0, D.jsx)("span", {
								className: "grid h-48 place-items-center rounded-2xl bg-muted text-5xl",
								children: "📦"
							}), /* @__PURE__ */ (0, D.jsx)("dl", {
								className: "grid content-start gap-2 text-sm",
								children: [
									["Found in", N(s)],
									["Found", M(s.found_at)],
									["Found by", s.found_by || "—"],
									["Custodian", s.custodian || "—"],
									["Remarks", s.remarks || "—"]
								].map(([e, t]) => /* @__PURE__ */ (0, D.jsxs)("div", { children: [/* @__PURE__ */ (0, D.jsx)("dt", {
									className: "text-xs uppercase tracking-wider text-muted-foreground",
									children: e
								}), /* @__PURE__ */ (0, D.jsx)("dd", {
									className: "font-medium",
									children: t
								})] }, e))
							})]
						}),
						/* @__PURE__ */ (0, D.jsxs)("section", { children: [/* @__PURE__ */ (0, D.jsx)("h3", {
							className: "mb-2 font-serif text-lg font-bold",
							children: "History"
						}), /* @__PURE__ */ (0, D.jsx)("ol", {
							className: "relative grid gap-3 border-l-2 border-muted pl-4",
							children: [...s.history || []].reverse().map((e, t) => /* @__PURE__ */ (0, D.jsxs)("li", {
								className: "relative",
								children: [
									/* @__PURE__ */ (0, D.jsx)("span", { className: "absolute -left-[23px] top-1 size-3 rounded-full border-2 border-background bg-primary" }),
									/* @__PURE__ */ (0, D.jsx)("b", { children: k[e.action] || e.action }),
									" ",
									/* @__PURE__ */ (0, D.jsxs)("small", {
										className: "text-muted-foreground",
										children: [
											M(e.when || e.at),
											" · entered by ",
											e.desk
										]
									}),
									/* @__PURE__ */ (0, D.jsx)("div", {
										className: "text-sm",
										children: e.action === "found" ? /* @__PURE__ */ (0, D.jsxs)(D.Fragment, { children: [
											"Found by ",
											/* @__PURE__ */ (0, D.jsx)("b", { children: e.by }),
											e.to ? /* @__PURE__ */ (0, D.jsxs)(D.Fragment, { children: [" · held by ", /* @__PURE__ */ (0, D.jsx)("b", { children: e.to })] }) : null
										] }) : e.action === "edit" ? null : /* @__PURE__ */ (0, D.jsxs)(D.Fragment, { children: [
											"From ",
											/* @__PURE__ */ (0, D.jsx)("b", { children: e.from || e.by }),
											e.to ? /* @__PURE__ */ (0, D.jsxs)(D.Fragment, { children: [" to ", /* @__PURE__ */ (0, D.jsx)("b", { children: e.to })] }) : null,
											e.confirmed ? " · ✔ confirmed" : ""
										] })
									}),
									e.remarks && /* @__PURE__ */ (0, D.jsx)("div", {
										className: "text-sm text-muted-foreground",
										children: e.remarks
									})
								]
							}, t))
						})] }),
						v && /* @__PURE__ */ (0, D.jsxs)("form", {
							onSubmit: L,
							className: "grid gap-2 rounded-xl border bg-muted/40 p-3",
							children: [
								/* @__PURE__ */ (0, D.jsx)("b", { children: v === "handed" ? "🔵 Hand over to an authorised person" : v === "returned" ? "✅ Return to the guest (Haaji)" : "🟡 Reopen as found" }),
								/* @__PURE__ */ (0, D.jsxs)("div", {
									className: "grid gap-2 sm:grid-cols-2",
									children: [
										/* @__PURE__ */ (0, D.jsxs)("div", {
											className: "grid gap-1",
											children: [/* @__PURE__ */ (0, D.jsx)(h, { children: "Given by" }), /* @__PURE__ */ (0, D.jsx)(b, {
												required: !0,
												maxLength: 80,
												value: w.by,
												onChange: (e) => T((t) => ({
													...t,
													by: e.target.value
												}))
											})]
										}),
										/* @__PURE__ */ (0, D.jsxs)("div", {
											className: "grid gap-1",
											children: [/* @__PURE__ */ (0, D.jsx)(h, { children: v === "returned" ? "Guest's name (received by)" : "Received by" }), /* @__PURE__ */ (0, D.jsx)(b, {
												required: v !== "found",
												maxLength: 80,
												value: w.to,
												onChange: (e) => T((t) => ({
													...t,
													to: e.target.value
												}))
											})]
										}),
										/* @__PURE__ */ (0, D.jsxs)("div", {
											className: "grid gap-1",
											children: [/* @__PURE__ */ (0, D.jsx)(h, { children: "Date & time" }), /* @__PURE__ */ (0, D.jsx)(b, {
												type: "datetime-local",
												value: w.at,
												onChange: (e) => T((t) => ({
													...t,
													at: e.target.value
												}))
											})]
										}),
										/* @__PURE__ */ (0, D.jsxs)("label", {
											className: "flex items-center gap-2 self-end pb-2 text-sm",
											children: [/* @__PURE__ */ (0, D.jsx)(m, {
												checked: !!w.confirmed,
												onCheckedChange: (e) => T((t) => ({
													...t,
													confirmed: e === !0
												}))
											}), v === "returned" ? "Guest confirmed it is theirs" : "Receipt confirmed"]
										})
									]
								}),
								/* @__PURE__ */ (0, D.jsxs)("div", {
									className: "grid gap-1",
									children: [/* @__PURE__ */ (0, D.jsx)(h, { children: "Confirmation / remarks" }), /* @__PURE__ */ (0, D.jsx)(C, {
										rows: 2,
										maxLength: 600,
										value: w.remarks,
										onChange: (e) => T((t) => ({
											...t,
											remarks: e.target.value
										})),
										placeholder: v === "returned" ? "e.g. ID checked, group 44001" : ""
									})]
								}),
								g && /* @__PURE__ */ (0, D.jsx)("p", {
									className: "text-sm text-destructive",
									children: g
								}),
								/* @__PURE__ */ (0, D.jsxs)("div", {
									className: "flex justify-end gap-2",
									children: [/* @__PURE__ */ (0, D.jsx)(y, {
										type: "button",
										variant: "outline",
										onClick: () => x(null),
										children: "Cancel"
									}), /* @__PURE__ */ (0, D.jsx)(y, {
										type: "submit",
										disabled: A,
										children: A ? "Saving…" : "Record"
									})]
								})
							]
						})
					]
				}),
				r && !v && /* @__PURE__ */ (0, D.jsxs)("div", {
					className: "flex flex-wrap justify-end gap-2 border-t pt-3",
					children: [
						/* @__PURE__ */ (0, D.jsx)(y, {
							variant: "outline",
							onClick: () => a(s),
							children: "✏️ Edit"
						}),
						s.status !== "returned" && /* @__PURE__ */ (0, D.jsx)(y, {
							variant: "outline",
							onClick: () => I("handed"),
							children: "🔵 Hand over"
						}),
						s.status !== "returned" && /* @__PURE__ */ (0, D.jsx)(y, {
							onClick: () => I("returned"),
							children: "✅ Returned to guest"
						}),
						s.status === "returned" && /* @__PURE__ */ (0, D.jsx)(y, {
							variant: "outline",
							onClick: () => I("found"),
							children: "↩ Reopen"
						})
					]
				}),
				!r && /* @__PURE__ */ (0, D.jsx)(S, {
					variant: "outline",
					className: "w-fit",
					children: "View only"
				})
			] }) : /* @__PURE__ */ (0, D.jsx)("p", {
				className: "text-sm",
				children: g || "Loading…"
			})
		})
	});
}
export { I as default, N as whereOf };
