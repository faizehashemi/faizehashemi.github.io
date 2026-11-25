import { f as e, h as t, i as n, p as r, r as i } from "./PmsContext-BVMd13Oi.js";
import { t as a } from "./checkbox-C3tIiLfF.js";
import { t as o } from "./label-CMEyi--P.js";
import { t as s } from "./printer-_t2PY0au.js";
import { t as c } from "./button-BGWa3SLr.js";
import { n as l, t as u } from "./card-B9_OGomP.js";
import { t as d } from "./input-DSBk_UeU.js";
import { a as f, n as p, o as m, r as h, s as g, t as _ } from "./table-DKR1WqRT.js";
import { t as v } from "./ConfirmDialog-GfriOiUy.js";
import { t as y } from "./PromptDialog-D_1ik4AU.js";
import { t as ee } from "./badge-EB7Muw37.js";
// src/pages/grouping/grouping.css
var b = /* @__PURE__ */ t(r(), 1), x = e(), S = (e) => String(e).padStart(2, "0"), C = (e, t) => {
	if (!e) return null;
	let [n, r, i] = e.split("-").map(Number), a = 0, o = 0;
	return t && /^\d{1,2}:\d{2}$/.test(t) && ([a, o] = t.split(":").map(Number)), new Date(n, (r || 1) - 1, i || 1, a || 0, o || 0, 0, 0);
}, w = (e) => (e == null ? "" : String(e)).trim(), T = (e) => Array.from(new Set(e)), E = (e) => e.reduce((e, t) => e + Number(t || 0), 0), D = 1, O = (e) => ({
	id: "S" + D++,
	tours: e.map((e) => ({
		tour_name: w(e.tour_name),
		group_leader: w(e.group_leader),
		sh: w(e.sh_no)
	})),
	pax: E(e.map((e) => Number(e.total || 0))) || 0
}), k = (e) => e.tours.map((e) => e.tour_name || "(Untitled)"), A = (e) => T(e.tours.map((e) => e.group_leader).filter(Boolean)).join(" | ");
function j() {
	let e = i(), t = n(), { ask: r, dialog: T } = v(), { ask: j, dialog: te } = y(), M = /* @__PURE__ */ new Date(), N = `${M.getFullYear()}-${S(M.getMonth() + 1)}-${S(M.getDate())}`, [P, ne] = (0, b.useState)(N), [F, I] = (0, b.useState)(N), [L, re] = (0, b.useState)(""), [R, z] = (0, b.useState)(""), [B, ie] = (0, b.useState)(""), [V, ae] = (0, b.useState)([]), [oe, H] = (0, b.useState)(!1), [U, W] = (0, b.useState)(/* @__PURE__ */ new Set()), [G, K] = (0, b.useState)([]), [q, J] = (0, b.useState)(/* @__PURE__ */ new Set()), [Y, X] = (0, b.useState)("");
	async function se() {
		if (!P || !F) {
			X("Pick a date range.");
			return;
		}
		let n = await t(e.all()), r = C(P, L || "00:00"), i = C(F, R || "23:59"), a = w(B), o = n.filter((e) => {
			let t = C(e.checkin_date, e.checkin_time);
			return !!t && t >= r && t <= i;
		}).filter((e) => !a || w(e.building) === a).map((e) => ({
			tour_name: e.tour_name || "",
			group_leader: e.group_leader || "",
			sh_no: e.sh_no || "",
			checkin_date: e.checkin_date || "",
			checkin_time: e.checkin_time || "",
			building: e.building || "",
			total: Number(e.total || 0)
		})).sort((e, t) => (e.checkin_date + e.checkin_time).localeCompare(t.checkin_date + t.checkin_time));
		ae(o), W(/* @__PURE__ */ new Set()), H(!0), X("");
	}
	let Z = () => V.filter((e, t) => U.has(t)), ce = () => {
		let e = Z();
		e.length ? (K((t) => [...t, ...e.map((e) => O([e]))]), X("")) : X("Select arrivals first.");
	}, le = () => {
		let e = Z();
		e.length < 2 ? X("Select at least two arrivals to bundle.") : (K((t) => [...t, O(e)]), X(""));
	};
	async function Q(e) {
		let t = Number(e.pax || 0), n = await j({
			title: `Split ${k(e).join(" + ")}`,
			body: `Total ${t}. Enter first half pax:`,
			value: String(Math.floor(t / 2)),
			type: "number"
		});
		if (n == null) return;
		let r = Math.max(0, Number(n || 0)), i = Math.max(0, t - r), a = {
			id: "S" + D++,
			tours: JSON.parse(JSON.stringify(e.tours)),
			pax: r
		}, o = {
			id: "S" + D++,
			tours: JSON.parse(JSON.stringify(e.tours)),
			pax: i
		};
		K((t) => {
			let n = t.indexOf(e);
			return n < 0 ? t : [
				...t.slice(0, n),
				a,
				o,
				...t.slice(n + 1)
			];
		}), J(/* @__PURE__ */ new Set());
	}
	function ue() {
		let e = G.filter((e) => q.has(e.id));
		e.length === 1 ? Q(e[0]) : X("Pick exactly one slot to split.");
	}
	function de() {
		let e = G.filter((e) => q.has(e.id));
		if (e.length < 2) {
			X("Pick at least two slots to bundle.");
			return;
		}
		let t = {
			id: "S" + D++,
			tours: e.flatMap((e) => e.tours),
			pax: E(e.map((e) => e.pax || 0))
		};
		K((e) => [...e.filter((e) => !q.has(e.id)), t]), J(/* @__PURE__ */ new Set()), X("");
	}
	async function fe() {
		await r({
			title: "Clear the list?",
			confirmLabel: "Clear",
			body: "Clear the assignment list?"
		}) && (K([]), J(/* @__PURE__ */ new Set()));
	}
	let $ = (e, t, n) => {
		let r = new Set(e);
		return n ? r.add(t) : r.delete(t), r;
	};
	return /* @__PURE__ */ (0, x.jsxs)("div", {
		className: "gp-print mx-auto grid grid-cols-[minmax(0,1fr)] max-w-[2400px] min-w-0 gap-3 px-3 pb-10 pt-4 sm:px-4",
		children: [
			/* @__PURE__ */ (0, x.jsx)(u, {
				className: "print:hidden",
				children: /* @__PURE__ */ (0, x.jsxs)(l, {
					className: "grid gap-3",
					children: [
						/* @__PURE__ */ (0, x.jsxs)("div", {
							className: "grid grid-cols-2 items-end gap-3 sm:grid-cols-3 lg:grid-cols-6",
							children: [
								/* @__PURE__ */ (0, x.jsxs)("div", {
									className: "grid gap-1",
									children: [/* @__PURE__ */ (0, x.jsx)(o, {
										htmlFor: "dateFrom",
										children: "Arrivals from (date)"
									}), /* @__PURE__ */ (0, x.jsx)(d, {
										id: "dateFrom",
										type: "date",
										value: P,
										onChange: (e) => ne(e.target.value)
									})]
								}),
								/* @__PURE__ */ (0, x.jsxs)("div", {
									className: "grid gap-1",
									children: [/* @__PURE__ */ (0, x.jsx)(o, {
										htmlFor: "dateTo",
										children: "Arrivals to (date)"
									}), /* @__PURE__ */ (0, x.jsx)(d, {
										id: "dateTo",
										type: "date",
										value: F,
										onChange: (e) => I(e.target.value)
									})]
								}),
								/* @__PURE__ */ (0, x.jsxs)("div", {
									className: "grid gap-1",
									children: [/* @__PURE__ */ (0, x.jsx)(o, {
										htmlFor: "timeFrom",
										children: "Time from (optional)"
									}), /* @__PURE__ */ (0, x.jsx)(d, {
										id: "timeFrom",
										type: "time",
										value: L,
										onChange: (e) => re(e.target.value)
									})]
								}),
								/* @__PURE__ */ (0, x.jsxs)("div", {
									className: "grid gap-1",
									children: [/* @__PURE__ */ (0, x.jsx)(o, {
										htmlFor: "timeTo",
										children: "Time to (optional)"
									}), /* @__PURE__ */ (0, x.jsx)(d, {
										id: "timeTo",
										type: "time",
										value: R,
										onChange: (e) => z(e.target.value)
									})]
								}),
								/* @__PURE__ */ (0, x.jsxs)("div", {
									className: "col-span-2 grid gap-1 sm:col-span-1",
									children: [/* @__PURE__ */ (0, x.jsx)(o, {
										htmlFor: "building",
										children: "Building (optional)"
									}), /* @__PURE__ */ (0, x.jsx)(d, {
										id: "building",
										placeholder: "exact match or blank",
										value: B,
										onChange: (e) => ie(e.target.value)
									})]
								}),
								/* @__PURE__ */ (0, x.jsxs)("div", {
									className: "flex items-center gap-2",
									children: [/* @__PURE__ */ (0, x.jsx)(c, {
										onClick: () => void se(),
										children: "Load arrivals"
									}), /* @__PURE__ */ (0, x.jsxs)(ee, {
										variant: "secondary",
										children: [V.length, " found"]
									})]
								})
							]
						}),
						Y && /* @__PURE__ */ (0, x.jsx)("p", {
							role: "status",
							className: "text-sm font-semibold text-destructive",
							children: Y
						}),
						oe && V.length > 0 && /* @__PURE__ */ (0, x.jsxs)(x.Fragment, { children: [/* @__PURE__ */ (0, x.jsx)("div", {
							className: "max-h-96 overflow-auto rounded-lg border",
							children: /* @__PURE__ */ (0, x.jsxs)(_, { children: [/* @__PURE__ */ (0, x.jsx)(m, { children: /* @__PURE__ */ (0, x.jsxs)(g, { children: [
								/* @__PURE__ */ (0, x.jsx)(f, { children: /* @__PURE__ */ (0, x.jsx)(a, {
									"aria-label": "Select all arrivals",
									checked: U.size === V.length && V.length > 0,
									onCheckedChange: (e) => W(e === !0 ? new Set(V.map((e, t) => t)) : /* @__PURE__ */ new Set())
								}) }),
								/* @__PURE__ */ (0, x.jsx)(f, { children: "Tour Name" }),
								/* @__PURE__ */ (0, x.jsx)(f, { children: "Leader" }),
								/* @__PURE__ */ (0, x.jsx)(f, { children: "SH" }),
								/* @__PURE__ */ (0, x.jsx)(f, { children: "Check-in" }),
								/* @__PURE__ */ (0, x.jsx)(f, { children: "Building" }),
								/* @__PURE__ */ (0, x.jsx)(f, {
									className: "text-right",
									children: "Total"
								}),
								/* @__PURE__ */ (0, x.jsx)(f, { children: "Add" })
							] }) }), /* @__PURE__ */ (0, x.jsx)(p, { children: V.map((e, t) => /* @__PURE__ */ (0, x.jsxs)(g, { children: [
								/* @__PURE__ */ (0, x.jsx)(h, { children: /* @__PURE__ */ (0, x.jsx)(a, {
									"aria-label": `Select SH ${e.sh_no}`,
									checked: U.has(t),
									onCheckedChange: (e) => W((n) => $(n, t, e === !0))
								}) }),
								/* @__PURE__ */ (0, x.jsx)(h, { children: e.tour_name }),
								/* @__PURE__ */ (0, x.jsx)(h, { children: e.group_leader }),
								/* @__PURE__ */ (0, x.jsx)(h, { children: e.sh_no }),
								/* @__PURE__ */ (0, x.jsxs)(h, {
									className: "whitespace-nowrap",
									children: [
										e.checkin_date,
										" ",
										/* @__PURE__ */ (0, x.jsx)("small", {
											className: "text-muted-foreground",
											children: e.checkin_time
										})
									]
								}),
								/* @__PURE__ */ (0, x.jsx)(h, { children: e.building }),
								/* @__PURE__ */ (0, x.jsx)(h, {
									className: "text-right",
									children: e.total || 0
								}),
								/* @__PURE__ */ (0, x.jsx)(h, { children: /* @__PURE__ */ (0, x.jsx)(c, {
									size: "sm",
									variant: "outline",
									onClick: () => K((t) => [...t, O([e])]),
									children: "Add"
								}) })
							] }, t)) })] })
						}), /* @__PURE__ */ (0, x.jsxs)("div", {
							className: "flex flex-wrap gap-2",
							children: [/* @__PURE__ */ (0, x.jsx)(c, {
								variant: "outline",
								onClick: ce,
								children: "Add selected to assignment"
							}), /* @__PURE__ */ (0, x.jsx)(c, {
								variant: "outline",
								title: "Bundle selected arrivals into one slot",
								onClick: le,
								children: "Bundle selected"
							})]
						})] })
					]
				})
			}),
			/* @__PURE__ */ (0, x.jsxs)("div", {
				className: "grid min-w-0 items-start gap-3 lg:grid-cols-2",
				children: [/* @__PURE__ */ (0, x.jsx)(u, {
					className: "print:hidden",
					children: /* @__PURE__ */ (0, x.jsxs)(l, {
						className: "grid gap-3",
						children: [
							/* @__PURE__ */ (0, x.jsxs)("div", {
								className: "flex items-center justify-between",
								children: [/* @__PURE__ */ (0, x.jsx)("b", { children: "Assignment list" }), /* @__PURE__ */ (0, x.jsx)(c, {
									variant: "ghost",
									size: "sm",
									onClick: () => void fe(),
									children: "Clear"
								})]
							}),
							/* @__PURE__ */ (0, x.jsx)("div", {
								className: "overflow-x-auto rounded-lg border",
								children: /* @__PURE__ */ (0, x.jsxs)(_, { children: [/* @__PURE__ */ (0, x.jsx)(m, { children: /* @__PURE__ */ (0, x.jsxs)(g, { children: [
									/* @__PURE__ */ (0, x.jsx)(f, { children: /* @__PURE__ */ (0, x.jsx)(a, {
										"aria-label": "Select all slots",
										checked: q.size === G.length && G.length > 0,
										onCheckedChange: (e) => J(e === !0 ? new Set(G.map((e) => e.id)) : /* @__PURE__ */ new Set())
									}) }),
									/* @__PURE__ */ (0, x.jsx)(f, { children: "Tour Name(s)" }),
									/* @__PURE__ */ (0, x.jsx)(f, { children: "Leader(s)" }),
									/* @__PURE__ */ (0, x.jsx)(f, { children: "Pax limit" }),
									/* @__PURE__ */ (0, x.jsx)(f, { children: "Tools" })
								] }) }), /* @__PURE__ */ (0, x.jsx)(p, { children: G.length ? G.map((e) => /* @__PURE__ */ (0, x.jsxs)(g, { children: [
									/* @__PURE__ */ (0, x.jsx)(h, { children: /* @__PURE__ */ (0, x.jsx)(a, {
										"aria-label": "Pick slot",
										checked: q.has(e.id),
										onCheckedChange: (t) => J((n) => $(n, e.id, t === !0))
									}) }),
									/* @__PURE__ */ (0, x.jsx)(h, { children: k(e).map((e, t) => /* @__PURE__ */ (0, x.jsx)("div", { children: e }, t)) }),
									/* @__PURE__ */ (0, x.jsx)(h, { children: A(e) }),
									/* @__PURE__ */ (0, x.jsx)(h, { children: /* @__PURE__ */ (0, x.jsx)(d, {
										type: "number",
										min: 0,
										className: "w-24",
										value: e.pax,
										onChange: (t) => {
											let n = Math.max(0, Number(t.target.value || 0));
											K((t) => t.map((t) => t.id === e.id ? {
												...t,
												pax: n
											} : t));
										}
									}) }),
									/* @__PURE__ */ (0, x.jsxs)(h, {
										className: "whitespace-nowrap",
										children: [/* @__PURE__ */ (0, x.jsx)(c, {
											variant: "ghost",
											size: "sm",
											onClick: () => void Q(e),
											children: "Split"
										}), /* @__PURE__ */ (0, x.jsx)(c, {
											variant: "ghost",
											size: "sm",
											onClick: () => K((t) => t.filter((t) => t.id !== e.id)),
											children: "Remove"
										})]
									})
								] }, e.id)) : /* @__PURE__ */ (0, x.jsx)(g, { children: /* @__PURE__ */ (0, x.jsx)(h, {
									colSpan: 5,
									className: "text-muted-foreground",
									children: "Add arrivals above — each becomes a sticker."
								}) }) })] })
							}),
							/* @__PURE__ */ (0, x.jsxs)("div", {
								className: "flex flex-wrap gap-2",
								children: [
									/* @__PURE__ */ (0, x.jsx)(c, {
										variant: "outline",
										title: "Split one selected slot into two",
										onClick: ue,
										children: "Split selected"
									}),
									/* @__PURE__ */ (0, x.jsx)(c, {
										variant: "outline",
										title: "Bundle selected slots into one",
										onClick: de,
										children: "Bundle selected"
									}),
									/* @__PURE__ */ (0, x.jsxs)(c, {
										onClick: () => {
											G.length ? window.print() : X("Nothing to print. Add slots first.");
										},
										children: [/* @__PURE__ */ (0, x.jsx)(s, { className: "size-4" }), "Print stickers (A4 landscape)"]
									})
								]
							})
						]
					})
				}), /* @__PURE__ */ (0, x.jsx)(u, {
					className: "print:border-0 print:p-0 print:shadow-none",
					children: /* @__PURE__ */ (0, x.jsx)(l, {
						className: "print:p-0",
						children: /* @__PURE__ */ (0, x.jsxs)("div", { children: [G.map((e) => /* @__PURE__ */ (0, x.jsx)("div", {
							className: "gp-sticker",
							children: /* @__PURE__ */ (0, x.jsxs)("div", {
								className: "flex flex-col gap-0.5",
								children: [
									/* @__PURE__ */ (0, x.jsx)("div", {
										className: "tour",
										children: k(e).map((e, t) => /* @__PURE__ */ (0, x.jsx)("div", { children: e }, t))
									}),
									/* @__PURE__ */ (0, x.jsx)("div", {
										className: "leader",
										children: A(e) || "\xA0"
									}),
									/* @__PURE__ */ (0, x.jsxs)("div", {
										className: "pax",
										children: ["PAX LIMIT: ", /* @__PURE__ */ (0, x.jsx)("strong", { children: Number(e.pax || 0) })]
									})
								]
							})
						}, e.id)), !G.length && /* @__PURE__ */ (0, x.jsx)("p", {
							className: "text-sm text-muted-foreground print:hidden",
							children: "The stickers appear here."
						})] })
					})
				})]
			}),
			T,
			te
		]
	});
}
export { j as default };
